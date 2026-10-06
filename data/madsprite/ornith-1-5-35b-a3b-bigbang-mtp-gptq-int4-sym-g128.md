# MadSprite/Ornith-1.5-35B-A3B-BigBang-MTP-GPTQ-Int4-sym-G128

## Resumen

Ornith-1.5-35B-A3B-BigBang-MTP-GPTQ-Int4-sym-G128 es un checkpoint cuantizado a 4 bits (GPTQ, simétrico, grupo 128) del modelo EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP, publicado por el usuario MadSprite. El modelo base es un merge TIES de Ornith-1.5-35B-A3B (entrenado con RL para código agéntico) y BigBang-v1, ambos sobre la arquitectura Qwen3.6-35B-A3B, y conserva la cabeza MTP (multi-token prediction) entrenada que habilita decodificación especulativa. Su relevancia inmediata es práctica: hasta ahora ese merge solo existía en formato GGUF, y esta cuantización lo hace servible en vLLM sobre hardware Intel XPU.

El checkpoint mantiene en precisión completa (BF16/FP16) todo lo que no son los expertos enrutados: atención completa, atención lineal Gated DeltaNet, router gates, shared experts, cabeza MTP, torre de visión, embeddings y lm_head. Solo se cuantizan los 30.720 módulos de expertos MoE (40 capas × 256 expertos × gate/up/down) a INT4. El resultado ocupa 23 GB en disco y 22,7 GiB cargado en memoria.

El modelo fue construido y medido en una única Intel Arc Pro B70 de 32 GB, y el autor reporta entre 2 y 3 veces más velocidad de decodificación y entre 3 y 7 veces más velocidad de prefill que el GGUF Q4_K_M del mismo merge ejecutado en llama.cpp con SYCL sobre la misma tarjeta. No se han publicado métricas de perplejidad ni puntuaciones de tareas: las cifras disponibles son de rendimiento, no de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida sobre Qwen3.6 (`qwen3_5_moe`): atención completa + atención lineal Gated DeltaNet, con expertos enrutados y shared experts |
| Parametros totales | 35.951.822.704 (≈35,95 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones, según la nomenclatura A3B del nombre del modelo (dato no desglosado en la información disponible) |
| Longitud de contexto | 131.072 tokens (configuración usada en las pruebas) |
| Tipos de cuantizacion | GPTQ INT4 simétrico, group_size 128, `desc_act false`, w4a16 (pesos 4 bits, activaciones 16 bits), `pack_dtype int32`; solo expertos MoE enrutados. Existe GGUF Q4_K_M del merge base |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (GPTQ); el merge base también se publica en GGUF |
| Tamano del repositorio | 24,5 GB (23 GB en disco, 22,7 GiB cargado) |
| Modalidad | image-text-to-text (incluye torre de visión, sin cuantizar) |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es una mezcla de expertos de tipo Qwen3.6-35B-A3B con 40 capas, 256 expertos enrutados por capa más shared experts, y un router de puerta por capa. Combina atención completa con atención lineal Gated DeltaNet, un esquema híbrido que reduce el coste de cómputo en secuencias largas. El modelo incluye además una cabeza MTP entrenada, injertada por el merge, que se utiliza para decodificación especulativa con 4 tokens de borrador por paso. La torre de visión y el `lm_head` se mantienen en precisión completa.

El modelo base procede de un merge TIES entre Ornith-1.5-35B-A3B (afinado con RL para código agéntico) y BigBang-v1, ambos sobre la misma base Qwen3.6-35B-A3B. Esta cuantización replica la receta de `palmfuture/Qwen3.6-35B-A3B-GPTQ-Int4`, conocida por funcionar en la ruta MoE de vLLM para Intel XPU. El proceso se ejecutó con GPTQModel 7.5.0, torch 2.13.0+xpu y transformers 5.15.0, sobre una única Intel Arc Pro B70 de 32 GB con `offload_to_disk`, durante 281 minutos. Los ajustes fueron `damp_percent 0.05`, `act_group_aware` y `true_sequential`, con exclusión dinámica de atención, puertas MLP, MTP, shared experts y módulos visuales. Los expertos poco frecuentes (alcanzados por menos del 0,5% de los tokens de calibración) usaron fallback RTN, valor por defecto de GPTQModel. La calibración empleó 256 muestras mezcladas para que los 256 expertos recibieran señal: 102 de allenai/c4 (validación, inglés), 77 de allenai/tulu-3-sft-mixture con plantilla de chat, 51 de codeparrot/codeparrot-clean-valid y 26 de HuggingFaceH4/MATH-500, con una mediana de 513 tokens y 158.821 tokens en total. El repositorio incluye `quant_log.csv` con el registro por módulo.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento siempre activo (bloques `<think>`), compatible con el parser `qwen3` de vLLM.
- Capacidades de código: el modelo base está afinado con RL para código agéntico, y una de las comprobaciones funcionales del autor consistió en generar una función Python que se ejecuta y pasa sus tests.
- Matemáticas: la calibración incluyó MATH-500 y una de las comprobaciones fue una multiplicación aritmética (347 × 29).
- Visión: pipeline `image-text-to-text`; el autor verifica correctamente una prueba de identificación de colores en imagen. Configurado con límite de 64 imágenes por prompt y vídeo deshabilitado en el ejemplo de servicio.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice --tool-call-parser qwen3_coder`; validado con una llamada a herramienta.
- Agentes y razonamiento multi-paso: el componente Ornith-1.5 del merge está entrenado para código agéntico.
- Decodificación especulativa MTP nativa: longitud media de aceptación de 3,3 a 3,5 tokens por paso.
- Contexto largo: hasta 131.072 tokens por petición, con caché KV FP8 que en la configuración probada almacena 257.166 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código en producción: el modelo puede generar parches, ejecutar llamadas a herramientas y encadenar pasos dentro de un pipeline de CI/CD, con el modo de pensamiento activo para tareas de depuración y la ventana de 131K tokens para razonar sobre repositorios completos.
- Servicio de atención al cliente multi-turno: la ventana de 131.072 tokens permite mantener historiales largos y documentación de producto en el mismo contexto sin truncar, y las mediciones muestran 90-154 tokens/s de decodificación según la longitud del prompt.
- Análisis de documentos con imágenes: al aceptar hasta 64 imágenes por prompt, sirve para procesar capturas, diagramas o formularios escaneados junto a texto y extraer información estructurada.
- Automatización de tareas con function calling: con el parser `qwen3_coder`, se puede conectar a APIs internas, bases de datos o sistemas de tickets y dejar que el modelo decida qué herramienta invocar en cada paso.
- Asistente de matemáticas y cálculo técnico aplicado: útil para resolver problemas de varios pasos donde se requiere mostrar el razonamiento antes de la respuesta final.
- Despliegue en infraestructura Intel: es una de las pocas opciones documentadas para servir un MoE de 35B en vLLM sobre Intel Arc Pro B70 con decodificación especulativa funcional, lo que lo hace adecuado para entornos con aceleradores Intel en lugar de NVIDIA.
- Generación aumentada por recuperación (RAG) con contexto extenso: la combinación de contexto largo y decodificación rápida reduce el coste por consulta cuando se inyectan muchos fragmentos recuperados.
- Evaluación interna de decodificación especulativa: sirve como banco de pruebas para medir la tasa de aceptación de MTP en distintos tipos de prompt.

## Benchmarks y rendimiento

El autor indica explícitamente que las cifras publicadas son mediciones de velocidad más una comprobación funcional pequeña, y que no constituyen una suite de benchmarks. No se han medido perplejidad ni puntuaciones de tareas. Condiciones de medida: petición única, MTP 4, caché KV FP8, contexto de 131.072, prompts en frío sin aciertos de caché de prefijo, pensamiento desactivado, longitud de salida fija; prefill = tokens de prompt ÷ tiempo hasta el primer token.

| Prompt | Esta cuantizacion en vLLM XPU (prefill / decode tok/s) | GGUF Q4_K_M del merge en llama.cpp SYCL + MTP (prefill / decode tok/s) |
|---|---|---|
| ~0,5K | 3.820 / 154 | 764 / 78 |
| ~8K | 8.201 / 124 | 1.253 / 71 |
| ~33K | 5.816 / 114 | 1.198 / 52 |
| ~120K | 2.663 / 90 | 916 / 33 |

Datos adicionales reportados: longitud media de aceptación MTP de 3,3 a 3,5 tokens por paso; con `--gpu-memory-utilization 0.96` la caché KV alberga 257.166 tokens (1,96 veces una petición de 131K). Comprobaciones funcionales superadas 5 de 5: aritmética (347 × 29), recuperación de hechos, una pregunta trampa de razonamiento, una función Python ejecutada que debe pasar tests y una llamada a herramienta con el parser `qwen3_coder`. En visión, responde correctamente a una prueba de identificación de color.

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 22,7 GiB solo para los pesos, ya que atención, shared experts, router, MTP, visión, embeddings y `lm_head` quedan sin cuantizar.
- GPU probada: 1× Intel Arc Pro B70 de 32 GB. Es el único hardware verificado.
- Con `--gpu-memory-utilization 0.90`, una tarjeta de 32 GB no aloja la caché KV de una petición de 131K tokens; hay que usar 0,96 o reducir `--max-model-len`.
- Tarjetas de consumo de 24 GB: los pesos por sí solos (22,7 GiB) dejan un margen insuficiente para caché KV y activaciones, por lo que no es un modelo apto para ese segmento en esta configuración.
- El formato es GPTQ estándar (`sym`, grupo 128, `desc_act false`), el que esperan los kernels GPTQ MoE de vLLM también en CUDA, pero el autor solo ha probado Intel XPU.
- Opciones de despliegue: vLLM (probado, imagen `vllm/vllm-openai-xpu`, vLLM 0.27.2rc1), con dos parches MTP del cookbook de la B70 y `B70_MTP_BF16_DRAFT=1`; para el merge base existe GGUF Q4_K_M servible en llama.cpp con SYCL. No se documentan pruebas con Ollama, TGI ni vLLM sobre CUDA.
- Parámetros de servicio probados: `--dtype float16 --kv-cache-dtype fp8 --max-model-len 131072 --gpu-memory-utilization 0.96 --max-num-seqs 1 --max-num-batched-tokens 8192 --enable-prefix-caching`.
- Muestreo recomendado por la model card de Ornith-1.5: temperatura 0,6, top_p 0,95, top_k 20 para tareas generales; temperatura 1,0 para reproducir sus benchmarks.
- Throughput observado: de 90 a 154 tokens/s de decodificación y de 2.663 a 8.201 tokens/s de prefill, según la longitud del prompt. Con `--max-num-seqs 1` no hay datos de rendimiento con concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-BigBang-MTP-GPTQ-Int4-sym-G128 | 35,95B totales (≈3B activos) | 131.072 | safetensors GPTQ INT4 | MIT | Solo velocidad: 154 tok/s decode a 0,5K, 90 tok/s a 120K |
| EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP (base) | 35,95B totales | No disponible | GGUF Q4_K_M | MIT | 78 tok/s decode a 0,5K, 33 tok/s a 120K (llama.cpp SYCL) |
| palmfuture/Qwen3.6-35B-A3B-GPTQ-Int4 | 35B clase (A3B) | No disponible | safetensors GPTQ INT4 | No disponible | No disponible (es la receta de referencia, no el mismo modelo) |

No se dispone de comparativas de calidad (benchmarks de tareas) frente a alternativas de la misma categoría, por lo que la comparación se limita a formato, licencia y velocidad de servicio medida.

## Limitaciones y advertencias

- No hay métricas de calidad publicadas: ni perplejidad, ni MMLU, ni HumanEval, ni GSM8K. Las únicas cifras son de velocidad y de cinco comprobaciones funcionales.
- Los expertos poco frecuentes (menos del 0,5% de los tokens de calibración) se cuantizaron con fallback RTN en lugar de GPTQ, lo que puede degradar su comportamiento en dominios poco representados en el conjunto de calibración.
- Verificado únicamente en Intel XPU con una Arc Pro B70. Aunque el formato es el estándar de vLLM también en CUDA, no hay pruebas publicadas en GPUs NVIDIA ni en otros backends.
- El modo de razonamiento está siempre activo (`<think>`), lo que incrementa el consumo de tokens de salida y la latencia percibida; requiere asignar `max_tokens` generosos.
- Con `--gpu-memory-utilization 0.90` en 32 GB no cabe la caché KV para 131K tokens; hay que subir a 0,96 o reducir la ventana, lo que afecta a la planificación de capacidad.
- La configuración medida usa `--max-num-seqs 1`: no hay datos de comportamiento ni de latencia bajo concurrencia.
- Idioma: no se especifican idiomas soportados en la información disponible; no se puede garantizar calidad fuera del inglés y los idiomas cubiertos por la base Qwen.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones de fidelidad ni tasas de alucinación.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las condiciones del modelo base EryriLabs y de la base subyacente Qwen3.6 antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no existe validación por parte de la comunidad.
- Fecha de publicación declarada en los metadatos: 2026-10-06.

## Enlaces

- Modelo cuantizado: https://huggingface.co/MadSprite/Ornith-1.5-35B-A3B-BigBang-MTP-GPTQ-Int4-sym-G128
- Modelo base: https://huggingface.co/EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP
- Receta de cuantización de referencia: https://huggingface.co/palmfuture/Qwen3.6-35B-A3B-GPTQ-Int4
- GPTQModel: https://github.com/ModelCloud/GPTQModel
- Cookbook de inferencia en Intel Arc Pro B70: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Dataset de calibración allenai/c4: https://huggingface.co/datasets/allenai/c4
- Dataset de calibración allenai/tulu-3-sft-mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset de calibración codeparrot/codeparrot-clean-valid: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
- Dataset de calibración HuggingFaceH4/MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
