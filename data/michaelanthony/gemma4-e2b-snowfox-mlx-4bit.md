# MichaelAnthony/gemma4-e2b-Snowfox-MLX-4bit

## Resumen

El modelo `MichaelAnthony/gemma4-e2b-Snowfox-MLX-4bit` es una cuantización MLX de 4 bits en modo affine (grupo de 64) del modelo SnowFox, un merge LoRA basado en el checkpoint de instrucción QAT de Google Gemma 4 E2B. SnowFox conserva las torres de imagen y audio del modelo base, congeladas durante el ajuste fino, por lo que se presenta como un paquete multimodal (imagen-texto) listo para usarse con MLX-VLM en Apple Silicon. La cuantización incluye tanto las capas lineales como las dos capas de embeddings, una decisión técnica para superar el límite de buffer de Metal en Macs con poca memoria unificada. Con 811 millones de parámetros y un tamaño de archivo de aproximadamente 2,9 GB, este modelo está pensado para ejecutarse en dispositivos Apple con recursos limitados, aunque la inferencia real no ha sido verificada en runtime, solo validada estructuralmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (modelo multimodal basado en Gemma 4 E2B, con torres de imagen y audio) |
| Parametros totales | 811.281.987 (~811 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine (group size 64) en MLX; el modelo base usa QAT q4_0 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre el entrenamiento del merge LoRA SnowFox. Según la model card, se trata de un ajuste fino basado en el checkpoint de instrucción QAT de Gemma 4 E2B, donde las torres de imagen y audio se mantuvieron congeladas. El paquete actual es una cuantización MLX affine de 4 bits con grupo de 64, aplicada a 527 capas: 525 capas lineales (proyecciones q/k/v/o, MLP gate/up/down y proyectores multimodales) más las dos capas de embeddings (`embed_tokens` y `embed_tokens_per_layer`). La cuantización de las embeddings es deliberada, ya que la capa `embed_tokens_per_layer` tiene dimensiones [262144, 8960], lo que ocuparía 4,7 GiB en FP16/BF16 y superaría el límite de buffer de Metal en algunos Macs; cuantizada, ocupa aproximadamente 1,2 GiB. Las capas de normalización, convoluciones y sesgos permanecen en float16. No se han publicado detalles sobre el dataset de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para tareas de chat e instrucción, basado en Gemma 4 E2B.
- Procesamiento de imágenes: acepta entradas de imagen mediante el pipeline `image-text-to-text`, con soporte para prompting con imágenes.
- Procesamiento de audio: aunque no se detallan las tareas específicas, la model card menciona torres de audio y una prueba de humo pendiente para audio.
- Multimodalidad: combina texto, imagen y audio en un solo modelo, con procesadores y tokenizadores incluidos.
- Cuantización eficiente: el formato 4-bit affine con grupo 64 reduce el tamaño del modelo a ~2,9 GB, habilitando su uso en hardware con memoria limitada.

## Casos de uso

- Asistentes conversacionales multimodales en dispositivos Apple: gracias a su cuantización MLX y su tamaño reducido, puede integrarse en aplicaciones de chat que acepten imágenes o audio, ejecutándose localmente en Macs con Apple Silicon.
- Análisis de imágenes en local: permite generar descripciones o responder preguntas sobre imágenes sin conexión, útil en entornos con privacidad de datos.
- Transcripción o procesamiento de audio: si las capacidades de audio funcionan correctamente, podría emplearse para tareas de reconocimiento o comprensión de audio en tiempo real.
- Prototipado rápido de aplicaciones multimodales: al ser un paquete listo para MLX-VLM, facilita el desarrollo de demos o pruebas de concepto en entornos Apple.
- Educación e investigación: sirve como referencia para estudiar técnicas de cuantización de modelos multimodales en MLX, especialmente la cuantización de embeddings para superar límites de memoria.
- Despliegue en entornos con restricciones de hardware: su tamaño (~2,9 GB) lo hace viable para Macs con 8 GB de RAM unificada o menos, donde modelos más grandes no cabrían.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la conversión fue validada estructuralmente (round-trip de dequantización con error máximo absoluto ≤ 0,035), pero no se ha ejecutado ninguna prueba de inferencia en Apple Silicon.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon con el framework MLX y requiere la librería `mlx-vlm` (versión 0.6.13 según las instrucciones).
- Tamaño del archivo de pesos: ~2,9 GB en safetensors, lo que sugiere que cabe en Macs con al menos 8 GB de memoria unificada, aunque el consumo real dependerá del contexto y de las entradas multimodales.
- La cuantización de embeddings (a ~1,2 GiB) evita superar el límite de buffer de Metal (~3,5 GiB en Macs pequeñas), lo que permite la carga en equipos con memoria reducida.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: el comando de generación se ejecuta con `python -m mlx_vlm.generate`, y se puede añadir `--image` para entrada de imágenes.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre modelos comparables en la misma categoría (tamaño, multimodalidad o cuantización MLX).

## Limitaciones y advertencias

- La inferencia no ha sido probada en Apple Silicon: la model card advierte explícitamente que el paquete es una cuantización validada estructuralmente, pero no se ha ejecutado ninguna prueba de texto, imagen o audio en runtime.
- Riesgo de alucinación y sesgos: al ser un modelo pequeño (811 M) basado en Gemma 4 E2B, puede presentar alucinaciones o respuestas inexactas, especialmente en tareas complejas.
- Limitaciones de idioma: no se han especificado los idiomas soportados, por lo que su rendimiento multilingüe es incierto.
- Restricciones de licencia: aunque la licencia declarada es Apache-2.0, el modelo base Gemma 4 E2B tiene sus propios términos de uso; se recomienda revisar la licencia del modelo base para uso comercial.
- Dependencia de MLX-VLM: el modelo solo funciona con la librería `mlx-vlm`, no con MLX-LM estándar, y requiere una versión específica (0.6.13).
- Sin garantía de funcionamiento en producción: dado que no se ha verificado la inferencia, su uso en entornos críticos debe hacerse con cautela y pruebas previas.

## Enlaces

- [HuggingFace - MichaelAnthony/gemma4-e2b-Snowfox-MLX-4bit](https://huggingface.co/MichaelAnthony/gemma4-e2b-Snowfox-MLX-4bit)
- [Modelo base: google/gemma-4-E2B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized)
- [Fuente BF16 canónica: MichaelAnthony/gemma4-e2b-Snowfox-hf](https://huggingface.co/MichaelAnthony/gemma4-e2b-Snowfox-hf)
- [Referencia FP16: MichaelAnthony/gemma4-e2b-Snowfox-MLX](https://huggingface.co/MichaelAnthony/gemma4-e2b-Snowfox-MLX)
