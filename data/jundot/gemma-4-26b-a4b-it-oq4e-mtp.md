# Jundot/gemma-4-26B-A4B-it-oQ4e-mtp

## Resumen

Jundot/gemma-4-26B-A4B-it-oQ4e-mtp es una cuantización de precisión mixta en formato MLX del modelo google/gemma-4-26B-A4B-it, el modelo de mezcla de expertos (MoE) de la familia Gemma 4 desarrollada por Google DeepMind. El checkpoint incluye el backbone de lenguaje, el codificador de visión y una cabeza de predicción multi-token (MTP) fusionada desde google/gemma-4-26B-A4B-it-assistant, lo que permite decodificación especulativa y aceleración de la generación.

El modelo original cuenta con 25,2 mil millones de parámetros totales y 3,8 mil millones de parámetros activos por token, acepta entrada de texto e imagen, dispone de modos de razonamiento ("thinking") configurables y una ventana de contexto de 256.000 tokens. Esta versión cuantizada mantiene esas capacidades con un peso efectivo medio de 5,218 bits por parámetro en el checkpoint completo, lo que reduce el almacenamiento a 17,107 GB (15,932 GiB) frente a los aproximadamente 50 GB que ocuparía en BF16.

La relevancia de esta ficha radica en que permite ejecutar un MoE multimodal de 26B con contexto de 256K en hardware Apple Silicon mediante MLX, con una huella de memoria moderada y una licencia Apache-2.0 heredada del modelo base. Es una opción práctica para desarrollo local, prototipado multimodal y despliegue en estaciones de trabajo Mac con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer multimodal con codificador de visión y cabeza MTP |
| Parametros totales | 26.225.647.442 (26,23B) |
| Parametros activos | 3,8B por token |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | Cuantización mixta oQ4e: affine 4-bit grupo 64 (87,08% de los pesos), affine 5-bit grupo 64 (2,82%), affine 8-bit grupo 64 (6,29%) y BF16 (3,82%); media efectiva de 5,218 bits/peso en el checkpoint completo y 4,795 bits/peso en el backbone de lenguaje |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 (licencia Gemma 4 de Google) |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 25,2B de parámetros totales y 3,8B activos, diseñado para entrada de texto e imagen. Integra un codificador de visión de 0,573B de parámetros (1,143 GB en esta cuantización) y una cabeza de predicción multi-token (MTP) de 0,420B de parámetros (0,839 GB) procedente del modelo asistente google/gemma-4-26B-A4B-it-assistant. La cabeza MTP permite decodificación especulativa, un mecanismo que acelera la generación al predecir varios tokens por paso y verificarlos en paralelo. El backbone de lenguaje concentra 25,233B de parámetros y 15,125 GB de almacenamiento en esta versión.

La cuantización oQ4e, implementada con oMLX 0.8.0, asigna bits según la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (1024 muestras × 512 tokens) y un reajuste ponderado de mínimos cuadrados de escala y sesgo. La versión actualizada el 2026-11-19 incorpora un refinamiento del redondeo oQe que reduce el error de cuantización manteniendo tamaño y velocidad. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento ("thinking") configurables.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text) mediante el codificador de visión integrado.
- Capacidades de código y matemáticas propias de la familia Gemma 4 (no se detallan métricas concretas en la información disponible).
- Decodificación especulativa mediante la cabeza MTP fusionada, que acelera la inferencia.
- Ventana de contexto de 256.000 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingües: no detalladas en la información proporcionada.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.

## Casos de uso

- Análisis de documentos largos en local: con 256K tokens de contexto, el modelo puede procesar informes, contratos o bases de código extensas en una sola pasada sobre un Mac con memoria unificada suficiente.
- Asistentes multimodales de escritorio: la combinación de entrada de imagen y texto permite construir aplicaciones que describan capturas de pantalla, extraigan datos de documentos escaneados o respondan preguntas sobre imágenes sin salir del equipo.
- Prototipado de agentes con razonamiento visible: los modos de pensamiento configurables permiten alternar entre respuestas rápidas y cadenas de razonamiento más largas según la tarea, útil para experimentar con flujos de agente.
- Generación asistida de código en entornos Apple Silicon: el modelo puede integrarse en editores o pipelines locales mediante MLX, aprovechando la decodificación especulativa de la cabeza MTP para reducir la latencia percibida.
- Investigación en eficiencia de cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta oQ4e en un MoE multimodal, comparando con el modelo base en BF16.
- Despliegue de bajo coste en estaciones de trabajo: al ocupar 17,1 GB en disco y requerir memoria unificada moderada, permite servir un modelo de 26B en hardware de consumo profesional sin GPU dedicada.
- Evaluación de decodificación especulativa: la inclusión de la cabeza MTP facilita medir ganancias de throughput frente a la generación autoregresiva estándar en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 16 GiB para cargar los pesos (15,932 GiB de almacenamiento) más overhead de activaciones y caché KV; se recomienda 24-32 GB para contexto largo.
- El formato es MLX, por lo que requiere hardware Apple Silicon (serie M). No es directamente compatible con CUDA.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo está pensado para chips Apple M-series con memoria unificada. Para el modelo base en otros formatos se necesitarían A100/H100, pero esta cuantización concreta es específica de MLX.
- Cabe en GPU de consumo: sí, en equipos Apple con 24 GB o más de memoria unificada (por ejemplo, Mac con M-series Pro/Max); en 16 GB el margen para contexto largo es muy ajustado.
- Opciones de despliegue: MLX y oMLX (herramienta del autor); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la cabeza MTP está pensada para mejorar el throughput mediante decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Jundot/gemma-4-26B-A4B-it-oQ4e-mtp | 26,23B totales / 3,8B activos | 256K | Texto e imagen | Apache-2.0 | MLX safetensors (oQ4e) |
| google/gemma-4-26B-A4B-it (base) | 25,2B totales / 3,8B activos | 256K | Texto e imagen | Apache-2.0 | safetensors (BF16) |
| google/gemma-4-26B-A4B-it-assistant | No disponible | No disponible | Texto | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión respecto al modelo base en BF16; el autor indica que la revisión de noviembre de 2026 reduce el error, pero no cuantifica la degradación en tareas concretas.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin conversión.
- No se detallan los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- No se confirma soporte explícito de tool calling ni de flujos de agente en la información disponible.
- La licencia Apache-2.0 se hereda del modelo base, pero el autor remite a la licencia Gemma 4 de Google; conviene revisar sus términos para uso comercial.
- El contexto de 256K requiere memoria adicional para la caché KV; en equipos con 16 GB puede no ser viable.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-26B-A4B-it-oQ4e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo asistente (cabeza MTP): https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
