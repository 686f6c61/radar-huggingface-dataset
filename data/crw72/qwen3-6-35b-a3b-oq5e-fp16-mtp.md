# crw72/Qwen3.6-35B-A3B-oQ5e-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ5e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario crw72. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión reducida generada con la herramienta oQ (oMLX v0.8.0), pensada para ejecutarse en el stack MLX de Apple sobre hardware con memoria unificada. El checkpoint conserva la arquitectura original del modelo base, identificada en los metadatos como `qwen3_5_moe`, es decir, un transformer con mezcla de expertos (MoE), con 35.951.822.704 parámetros totales.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 36.000 millones de parámetros en un formato de aproximadamente 27,1 GB, con un promedio efectivo de 6,033 bits por peso, manteniendo en FP16 y FP32 las capas consideradas sensibles (0,478B de pesos en total) y aplicando cuantización afín de 5, 6 y 8 bits al resto. El resultado es un checkpoint que cabe en equipos Apple Silicon de gama alta con memoria unificada de 32 GB o más, algo imposible con los pesos originales en BF16.

El modelo incluye además una cabeza MTP (multi-token prediction) de 0,845B de parámetros y un módulo de visión de 0,447B, lo que sugiere capacidades multimodales y decodificación especulativa. La licencia declarada es Apache 2.0. No se dispone de información sobre idiomas soportados, pipeline ni resultados de evaluación en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según tag `qwen3_5_moe`; incluye cabeza MTP y módulo de visión |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta afín: 5-bit grupo 64, 6-bit grupo 64, 8-bit grupo 64, 8-bit grupo 128, más pesos en FP16 y FP32; promedio efectivo 6,033 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base Qwen/Qwen3.6-35B-A3B, cuya arquitectura se etiqueta como `qwen3_5_moe`: un transformer con capas de mezcla de expertos. Los pesos se distribuyen en tres componentes: el modelo de lenguaje (34,661B de parámetros lógicos), un módulo de visión (0,447B) y una cabeza MTP de predicción multi-token (0,845B). La presencia de la cabeza MTP apunta a soporte de decodificación especulativa, aunque no se detalla su funcionamiento en la información disponible.

La cuantización se realizó con oQ (oMLX v0.8.0) en precisión mixta. El 91,838% de los pesos lógicos (33,018B) se almacena en afín de 5 bits con grupo de 64 (5,50 bits/peso efectivos); un 6,008% (2,160B) se mantiene en afín de 8 bits grupo 64 (8,50 bits/peso); un 1,242% (0,447B) permanece en FP32, coincidiendo con el tamaño del módulo de visión; un 0,467% (0,168B) va en afín de 6 bits grupo 64; un 0,359% (0,129B) en afín de 8 bits grupo 128; y un 0,086% (0,031B) en FP16. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de gran escala; la cuantización preserva la funcionalidad del modelo original, aunque no se documentan evaluaciones específicas de esta versión.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,447B de parámetros en FP32, lo que indica capacidades multimodales imagen-texto.
- Predicción multi-token (MTP): la cabeza MTP de 0,845B está pensada para decodificación especulativa y aceleración de la generación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 27,1 GB, por lo que puede cargarse en Macs con memoria unificada de 32 GB o más, permitiendo ejecutar un MoE de 36B sin GPU dedicada.
- Prototipado de asistentes multimodales: el módulo de visión incluido permite construir demos de descripción de imágenes, extracción de información de documentos escaneados o respuesta a preguntas sobre capturas, todo en local.
- Aceleración de generación con MTP: la cabeza de predicción multi-token puede aprovecharse para reducir la latencia en tareas de generación larga, como resúmenes o redacción asistida, en entornos MLX.
- Investigación en cuantización: el reparto detallado de bits por componente (5, 6 y 8 bits, FP16 y FP32) sirve como caso de estudio para analizar el impacto de la precisión mixta en modelos MoE con visión.
- Evaluación comparativa de checkpoints: al ser una conversión del modelo base, permite medir la degradación introducida por la cuantización frente a los pesos originales en tareas de razonamiento y generación.
- Despliegue en estaciones de trabajo con memoria unificada: útil para equipos que necesitan un modelo grande sin infraestructura de GPU NVIDIA, aprovechando el ecosistema MLX para servir peticiones localmente.
- Fine-tuning ligero o adaptación con LoRA: el formato safetensors y la licencia Apache 2.0 facilitan experimentos de ajuste sobre el checkpoint cuantizado, aunque la cuantización puede limitar la compatibilidad con herramientas estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 27,1 GB de almacenamiento para los pesos; se recomienda al menos 32 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime.
- GPU recomendadas: hardware Apple Silicon con memoria unificada de 32 GB o superior (familias M1/M2/M3/M4 Pro, Max y Ultra). No se documenta soporte para GPU NVIDIA ni ROCm en esta conversión.
- ¿Cabe en GPU consumer? Sí, en equipos Apple Silicon de gama alta con 32 GB o más de memoria unificada; no se especifican requisitos para GPU dedicadas de consumo.
- Opciones de despliegue: MLX y oMLX (herramienta de cuantización); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato MLX y la cuantización afín específica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| crw72/Qwen3.6-35B-A3B-oQ5e-fp16-mtp | 35,952B | no disponible | Mixta afín 5/6/8 bits, FP16, FP32 | Apache 2.0 | safetensors (MLX) |
| Qwen/Qwen3.6-35B-A3B (base) | 35,952B | no disponible | BF16/FP16 original | Apache 2.0 | safetensors |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | 35,952B | no disponible | 4-8 bits típicamente | Apache 2.0 | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser una cuantización, hereda los sesgos del modelo base Qwen3.6-35B-A3B, que no se documentan en esta ficha.
- Riesgo de alucinación: no evaluado para esta conversión; la cuantización de 5 bits en el 91,8% de los pesos puede incrementar la degradación en tareas de razonamiento fino respecto al modelo original.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; no deben asumirse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales.
- Compatibilidad: el formato MLX y la cuantización afín de oQ limitan el uso a herramientas compatibles; no es un checkpoint portable a vLLM, llama.cpp u otros runtimes sin conversión.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación comunitaria ni de pruebas de calidad publicadas.
- Pesos en FP32 y FP16: 0,478B de parámetros se mantienen en alta precisión, lo que aumenta el tamaño del checkpoint (1,72 GiB) y debe tenerse en cuenta al planificar memoria.

## Enlaces

- Hugging Face: https://huggingface.co/crw72/Qwen3.6-35B-A3B-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
