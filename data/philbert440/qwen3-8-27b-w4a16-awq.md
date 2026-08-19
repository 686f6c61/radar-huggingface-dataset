# philbert440/Qwen3.8-27B-W4A16-AWQ

## Resumen

Qwen3.8-27B-W4A16-AWQ es una cuantizacion INT4 weight-only del modelo vision-lenguaje Qwen/Qwen3.8-27B, publicada por el usuario philbert440 en HuggingFace. El checkpoint reduce el peso del modelo de 55 GB en BF16 a 19,5 GB, manteniendo intactos la torre de vision, la cabeza MTP de decodificacion especulativa y el modo de pensamiento, calibrado con trazas de razonamiento reales. Esta pensado para entornos con VRAM limitada, como un par de V100 de 32 GB, sin renunciar a las capacidades completas del modelo original.

El modelo base Qwen3.8-27B es un modelo denso de 27.356 millones de parametros con una arquitectura hibrida que combina atencion lineal GatedDeltaNet y atencion completa, disenado para trabajo agente de largo horizonte con contexto nativo de 262.144 tokens. La cuantizacion emplea el formato compressed-tensors con empaquetado INT4, grupo 128 y escala asimetrica, validada en 2xV100-32GB mediante 1Cat-vLLM 1.2.2. Su relevancia actual radica en hacer viable un VLM de ultima generacion en hardware de generaciones anteriores, con rendimiento medido de hasta 59 tokens/s en modo pensamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida densa: 16 bloques de 3x(GatedDeltaNet->FFN) + 1x(GatedAttention->FFN), con torre de vision |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativa, extensible a 1M con YaRN |
| Tipos de cuantizacion | INT4 W4A16 (AWQ, grupo 128, asimetrico, weight-only) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida de atencion: 16 bloques con un patron 3:1 entre capas GatedDeltaNet (atencion lineal) y capas GatedAttention (atencion completa), intercaladas con FFN. Esta combinacion hace practico el contexto nativo de 262K tokens y es el principal desafio para la cuantizacion, ya que las proyecciones GatedDeltaNet requieren un tratamiento especifico. El checkpoint cuantizado mantiene en BF16 la torre de vision (333 tensores), las proyecciones `linear_attn.in_proj_a/b`, `embed_tokens`, `lm_head` y la cabeza MTP, mientras cuantiza 400 lineales de atencion y MLP, incluidas 144 proyecciones GatedDeltaNet.

La calibracion se realizo en modo pensamiento activado, usando 256 muestras de 1024 tokens de trazas de razonamiento completas del dataset Magpie-Reasoning-V2-250K-CoT, con `enable_thinking=True`. Esta eleccion evita el desajuste calibracion/despliegue documentado en llm-compressor (issues #2680 y #2681), que corrompe el comportamiento de las etiquetas de pensamiento cuando se calibra con el modo desactivado. La busqueda de escala usa un observador MSE basado en minimizacion del error de reconstruccion, no min-max.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento controlable (`reasoning_effort`, `preserve_thinking`), activado por defecto.
- Comprension de imagenes a traves de la torre de vision intacta, con soporte de tareas vision-lenguaje (documentos, capturas, graficos).
- Decodificacion especulativa MTP (multi-token prediction) con dos modos de draft: greedy y probabilistico, con longitud de aceptacion media de 2,34 y 2,52 respectivamente.
- Trabajo agente de largo horizonte, disenado para tareas multi-paso con contexto extenso.
- Razonamiento matematico y cientifico, con resultados destacados en GPQA Diamond (89,2) y HLE (30,8) en el modelo base.
- Generacion de codigo y resolucion de problemas de ingenieria de software (SWE-bench Pro, LiveCodeBench).
- Control flexible del modo de pensamiento, permitiendo desactivarlo para tareas de baja latencia.
- Capacidades multilingues: no especificadas en la documentacion disponible.

## Casos de uso

- Atencion al cliente automatizada con contexto largo: la ventana de 262K tokens permite mantener conversaciones multi-turno con historial completo y documentos de referencia, gestionando interacciones complejas sin perder informacion previa.
- Agentes autonomos de largo horizonte: el modelo puede planificar y ejecutar secuencias de acciones multi-paso (navegacion web, uso de herramientas, toma de decisiones) gracias a su diseno para trabajo agente y al modo de pensamiento activado por defecto.
- Analisis de documentos extensos con vision: la combinacion de torre de vision y contexto largo permite procesar PDFs, capturas y documentos escaneados de cientos de paginas, extrayendo informacion estructurada (OmniDocBench 1.5: 91,1).
- Generacion de codigo en produccion: con soporte para razonamiento y contexto largo, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o refactorizacion, manteniendo el estado completo del repositorio en contexto.
- Razonamiento cientifico y matematico: adecuado para asistentes de investigacion que necesitan resolver problemas de nivel avanzado (GPQA Diamond: 89,2), con capacidad de mostrar el proceso de razonamiento paso a paso.
- Despliegue en hardware legacy: la cuantizacion a 19,5 GB permite ejecutar un VLM de 27B en un par de V100 de 32 GB, lo que habilita entornos de inferencia on-premise con GPUs de generaciones anteriores sin sacrificar capacidades de vision ni de pensamiento.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base en BF16, segun la model card oficial de Qwen3.8-27B. No se han re-medido en el checkpoint cuantizado.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B |
|---|---|---|
| Terminal Bench 2.1 (Terminus) | 73,0 | 63,4 |
| SWE-bench Pro | 53,5 | 57,6 |
| NL2Repo-Bench | 42,3 | 36,2 |
| GPQA Diamond | 89,2 | 87,8 |
| HLE | 30,8 | 24,0 |
| LiveCodeBench v6 | 83,9 | 89,6 |
| IFBench | 69,1 | 79,1 |
| OmniDocBench 1.5 (VL) | 91,1 | 89,4 |
| RealWorldQA (VL) | 85,9 | 84,1 |
| ERQA (VL) | 65,5 | 62,5 |
| OSWorld-Verified (VL) | 63,9 | 73,3 |

Rendimiento medido del checkpoint cuantizado en 2xV100-32GB con 1Cat-vLLM 1.2.2, TP2, KV en fp8_e5m2, MTP K=2, expresado en tokens/s (media ± desviacion):

| Regimen | Greedy draft | Probabilistic draft |
|---|---|---|
| 512 tokens, thinking (n=10) | 55,6 ± 1,7 | 59,3 ± 1,4 |
| 2048 tokens, thinking (n=3) | 53,2 ± 1,8 | 56,3 ± 1,1 |
| 512 tokens, instruct (n=6) | 54,7 ± 1,9 | 55,5 ± 1,5 |
| 4-way concurrent 512 tokens, agregado (n=3) | 161,9 ± 20,6 | 164,8 ± 23,4 |

## Requisitos de hardware

- VRAM estimada: 19,5 GB de pesos en INT4, con margen para contexto de 32K+ en GPUs de 32 GB. Para contexto completo de 262K se requiere gestion de KV cache optimizada.
- GPUs recomendadas: 2xV100-32GB (TP2) con 1Cat-vLLM 1.2.2 (ruta SM70 TurboMind dequant); cualquier GPU Ampere o posterior con vLLM estandar.
- Compatibilidad con GPUs de consumo: una RTX 4090 de 24 GB puede ejecutar el modelo con contexto moderado, aunque no se ha validado oficialmente; el margen de VRAM es ajustado para contexto largo.
- Opciones de despliegue: vLLM (stock), 1Cat-vLLM 1.2.2 para V100, y cualquier servidor compatible con compressed-tensors.
- Latencia y throughput: entre 53 y 59 tokens/s en regimen individual sobre V100, y hasta 164 tokens/s agregados con 4 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion disponible | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,36B | 262K | Apache-2.0 | No (BF16) | Modelo original, 55 GB en BF16 |
| Qwen3.8-27B-W4A16-AWQ (este) | 27,36B | 262K | Apache-2.0 | INT4 W4A16 | Cuantizacion con vision y MTP intactos, 19,5 GB |
| Qwen3.6-27B | 27B aprox. | No disponible | Apache-2.0 | No disponible | Generacion anterior, peor en la mayoria de benchmarks salvo SWE-bench Pro, LiveCodeBench, IFBench y OSWorld |

El checkpoint cuantizado ofrece el mismo rendimiento cualitativo que el base (la verificacion de decodificacion especulativa muestrea contra el modelo objetivo, por lo que la calidad de salida es identica), con la ventaja de caber en 19,5 GB. Frente a Qwen3.6-27B, el modelo base Qwen3.8-27B mejora en tareas de razonamiento cientifico, agentes terminales y vision, aunque pierde en codigo (LiveCodeBench) e instrucciones (IFBench).

## Limitaciones y advertencias

- La cuantizacion INT4 puede introducir degradacion respecto al BF16 en tareas de alta precision numerica o razonamiento extenso, aunque no se han publicado mediciones comparativas en este checkpoint.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento multi-paso con contexto muy largo.
- Los idiomas soportados no estan especificados en la documentacion; el modelo base Qwen suele cubrir ingles y chino principalmente, pero no se confirma para este checkpoint.
- El contexto de 1M con YaRN requiere configuracion adicional y puede afectar a la calidad si no se ajusta correctamente.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue en produccion debe verificar el cumplimiento de las politicas de uso de los datasets de calibracion (Magpie-Reasoning-V2).
- El rendimiento en V100 depende de la ruta de dequantizacion especifica de 1Cat-vLLM; con vLLM estandar en V100 puede no funcionar correctamente.
- La calibracion se realizo con trazas de razonamiento de un dataset concreto, lo que puede sesgar el comportamiento del modo de pensamiento hacia ciertos estilos de razonamiento.

## Enlaces

- Modelo cuantizado: https://huggingface.co/philbert440/Qwen3.8-27B-W4A16-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio 1Cat-vLLM: https://github.com/rivetphilbot/1Cat-vLLM
- Dataset de calibracion Magpie-Reasoning-V2-250K-CoT: https://huggingface.co/datasets/Magpie-Align/Magpie-Reasoning-V2-250K-CoT-Deepseek-R1-Llama-70B
- Issues de llm-compressor sobre calibracion de thinking: https://github.com/vllm-project/llm-compressor/issues/2680 y https://github.com/vllm-project/llm-compressor/pull/2681
