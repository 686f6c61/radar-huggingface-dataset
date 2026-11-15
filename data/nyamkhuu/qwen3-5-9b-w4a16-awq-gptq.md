# nyamkhuu/Qwen3.5-9B-W4A16-AWQ-GPTQ

## Resumen

Qwen3.5-9B-W4A16-AWQ-GPTQ es una cuantizacion INT4 del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario nyamkhuu. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer multimodal de tipo image-text-to-text con 9.653.104.368 parametros totales, orientado a generacion de texto, razonamiento, codigo y comprension de imagenes. Esta version comprime los pesos lineales a INT4 simetrico en grupos de 128 mediante una receta secuencial AWQ + GPTQ, manteniendo activaciones y cache KV en BF16.

La relevancia de esta ficha reside en que demuestra que un modelo de ~9.650 millones de parametros puede servirse en INT4 con una perdida de calidad muy contenida frente a BF16: en las evaluaciones del autor sobre MATH-100 y GPQA-D-100 los resultados son practicamente identicos, y en BFCL la diferencia es de menos de un punto porcentual. El rendimiento en un unico acelerador profesional (NVIDIA RTX PRO 6000 Blackwell) pasa de 83 a 190 tokens/s en modo single-user con vLLM, mas del doble, manteniendo un throughput agregado de aproximadamente 4.000 tokens/s.

El modelo conserva la torre de vision, los embeddings, las puertas Gated DeltaNet de anchura 32, las convoluciones conv1d, las normalizaciones y la cabeza MTP en BF16, lo que preserva las capacidades multimodales y de decodificacion especulativa del modelo original. La licencia es Apache 2.0, lo que facilita su uso comercial, y el formato de pesos es safetensors con metadatos compressed-tensors, compatible con vLLM y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas Gated DeltaNet y cabeza MTP; cuantizacion W4A16 en formato compressed-tensors |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en los comandos de servicio verificados; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | INT4 simetrico en grupos de 128 (W4A16), activaciones y KV cache en BF16; torre de vision, embeddings, puertas Gated DeltaNet, conv1d, norms y cabeza MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con metadatos compressed-tensors (llm-compressor 0.15.0) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura transformer con componentes hibridos: incluye capas Gated DeltaNet con puertas de anchura 32, convoluciones conv1d y una cabeza de prediccion multi-token (MTP), ademas de una torre de vision que habilita la modalidad image-text-to-text. Esta version cuantizada no reentrena el modelo: aplica primero AWQ con `duo_scaling="both"` y despues GPTQ para producir pesos INT4 simetricos agrupados en bloques de 128, dejando en BF16 los modulos sensibles a la precision (vision tower, embeddings, puertas, conv1d, normalizaciones y cabeza MTP).

El proceso de calibracion utilizo 256 muestras de hasta 8.192 tokens, extraidas de un conjunto de 2.048 muestras compuesto por trazas de razonamiento del propio modelo, llamadas a herramientas, conversaciones multi-turno y datos de instruccion, todo renderizado con la plantilla de chat del modelo. La cuantizacion se realizo con llm-compressor 0.15.0 y se verifico en vLLM 0.33 (kernel `MarlinLinearKernel` con 128 grupos) y SGLang 0.5.23 (`CompressedTensorsWNA16` con 128 grupos), confirmando que los pesos servidos coinciden con los almacenados en cada proyeccion y que la cache KV permanece en BF16. No se dispone de informacion sobre el volumen total de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo thinking, con la posibilidad de limitar el presupuesto de razonamiento (las evaluaciones del autor lo acotan a 16.384 tokens).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text) gracias a la torre de vision conservada en BF16.
- Generacion de codigo y soporte de tool calling / function calling, con parser `qwen3_coder` verificado en vLLM y SGLang.
- Razonamiento matematico de varios pasos, evaluado con MATH-100.
- Respuestas en formato JSON estricto (json-mode), evaluadas con NousResearch/json-mode-eval.
- Capacidades de agente y razonamiento multi-step, con soporte de auto tool choice en vLLM (`--enable-auto-tool-choice`).
- Decodificacion especulativa mediante la cabeza MTP conservada en BF16.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con hasta 32.768 tokens de contexto en los despliegues verificados, suficiente para historiales largos y bases de conocimiento adjuntas, con un coste de memoria reducido gracias a los pesos INT4.
- Generacion de codigo en produccion: el soporte de tool calling con parser `qwen3_coder` y la compatibilidad con vLLM y SGLang permiten integrarlo en pipelines de CI/CD para revision de parches, generacion de tests o asistencia en el IDE.
- Agentes con llamadas a herramientas: el 90,9% de acierto en BFCL v3 non-live (1.000 preguntas) lo hace adecuado para orquestacion de agentes que seleccionan funciones y emiten argumentos estructurados.
- Analisis de documentos con imagenes: al conservar la torre de vision en BF16, puede procesar capturas, diagramas o formularios escaneados junto a instrucciones textuales para extraccion de datos.
- Razonamiento matematico asistido: el 81% en MATH-100 con thinking acotado a 16.384 tokens lo hace util para tutoria, verificacion de calculos o generacion de explicaciones paso a paso.
- Servicios de alto throughput: con ~3.988 tokens/s agregados en vLLM sobre una RTX PRO 6000, es viable para APIs internas con muchos usuarios concurrentes y presupuesto de GPU limitado.
- Salidas estructuradas para integracion: el 79% de coincidencia exacta en json-mode-eval permite usarlo en extraccion de entidades o generacion de payloads JSON para sistemas downstream, con validacion adicional en produccion.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando W4A16 frente a BF16 en un unico NVIDIA RTX PRO 6000 Blackwell. La prueba de serving usa 1.024 tokens de entrada y 512 de salida; MATH y GPQA usan thinking acotado a 16.384 tokens (error estandar de ±5 puntos con n=100); BFCL v3 non-live tiene 1.000 preguntas; JSON corresponde a NousResearch/json-mode-eval.

| Motor | Variante | Tokens/s single-user | Tokens/s pico | Tokens en cache KV | MATH-100 | GPQA-D-100 | BFCL | JSON exacto |
|---|---|---|---|---|---|---|---|---|
| vLLM | W4A16 | 190 | 3.988 | 2.013.246 | 81% | 37% | 90,9% | 79% |
| vLLM | BF16 | 83 | 4.004 | 1.746.137 | 81% | 37% | 91,7% | 78% |
| SGLang | W4A16 | 195 | 3.626 | 1.289.473 | 81% | 35% | 89,6% | 79% |
| SGLang | BF16 | 85 | 3.346 | 1.126.073 | 81% | 39% | 91,1% | 78% |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,1 GB en disco; con cache KV en BF16 y contexto de 32.768 tokens hay que sumar varios GB adicionales. La cache KV medida en vLLM W4A16 alcanza 2.013.246 tokens sobre una RTX PRO 6000 (96 GB), por lo que el modelo y una ventana de 32K caben holgadamente en GPUs de 24-48 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (unica GPU usada en la verificacion), A100 40/80 GB, H100 80 GB. Para despliegues mas modestos, una RTX 4090 de 24 GB deberia acomodar los pesos INT4 y un contexto moderado, aunque no se ha verificado en la informacion disponible.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto reducido; no verificado por el autor.
- Opciones de despliegue: vLLM 0.33 (`vllm serve ... --language-model-only --max-model-len 32768 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`) y SGLang 0.5.23 (`python -m sglang.launch_server --model-path ... --context-length 32768 --reasoning-parser qwen3 --tool-call-parser qwen3_coder`). Compatibilidad con llama.cpp u Ollama no disponible.
- Latencia y throughput: 190 tokens/s single-user y 3.988 tokens/s pico en vLLM W4A16; 195 y 3.626 respectivamente en SGLang W4A16, medidos con 1.024 tokens de entrada y 512 de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nyamkhuu/Qwen3.5-9B-W4A16-AWQ-GPTQ | 9.653.104.368 | 32.768 (verificado) | Apache 2.0 | safetensors compressed-tensors | Cuantizacion INT4 W4A16 del Qwen3.5-9B; 190 tok/s single-user en vLLM |
| Qwen/Qwen3.5-9B (BF16) | 9.653.104.368 | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar; 83 tok/s single-user en la misma GPU |
| Alternativas INT4 de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion INT4 puede degradar tareas no cubiertas por la evaluacion del autor (MATH-100, GPQA-D-100, BFCL y json-mode-eval); no hay datos sobre otros benchmarks como MMLU o HumanEval.
- GPQA-D-100 baja de 37% (vLLM BF16) a 35% en SGLang W4A16 y de 39% a 35% entre variantes SGLang, lo que sugiere cierta sensibilidad del razonamiento cientifico a la cuantizacion y al motor.
- El error estandar de ±5 puntos en MATH y GPQA con n=100 limita la precision de las conclusiones sobre diferencias pequenas.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Sesgos conocidos del modelo base no documentados en la model card.
- Idiomas soportados no especificados; el rendimiento fuera de los idiomas principales del modelo base no esta verificado.
- El autor solo ha verificado vLLM 0.33 y SGLang 0.5.23; otros motores o versiones pueden no soportar el formato compressed-tensors con estos kernels.
- El flag `--language-model-only` en vLLM desactiva la torre de vision en el ejemplo de servicio; para uso multimodal hay que ajustar la configuracion y verificar el soporte.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-9B por si impone terminos adicionales.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/nyamkhuu/Qwen3.5-9B-W4A16-AWQ-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio con codigo, metodo y resultados: https://github.com/d-nyamkhuu/qwen3.5-quantization
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de evaluacion JSON: NousResearch/json-mode-eval (referenciado en la model card)
