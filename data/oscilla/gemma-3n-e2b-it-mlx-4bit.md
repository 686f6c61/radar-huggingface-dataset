# Oscilla/gemma-3n-E2B-it-mlx-4Bit

## Resumen

Oscilla/gemma-3n-E2B-it-mlx-4Bit es una conversión al formato MLX del modelo multimodal Gemma 3n E2B it de Google, cuantizado a 4 bits. El modelo original, desarrollado por Google, está diseñado para ejecutarse eficientemente en dispositivos cotidianos como teléfonos, portátiles y tablets, incorporando innovaciones como el caché de parámetros Per-Layer Embedding (PLE) y la arquitectura MatFormer, que permite reducir los requisitos de cómputo y memoria. Esta conversión, realizada por el usuario Oscilla con mlx-lm 0.31.2, adapta el modelo para su uso en Apple Silicon mediante el framework MLX.

Con aproximadamente 696 millones de parámetros y un tamaño de repositorio de 2,5 GB, el modelo es notablemente ligero, lo que lo hace adecuado para inferencia en dispositivos con recursos limitados. Soporta múltiples modalidades de entrada (texto, imagen, audio y vídeo) según las etiquetas de HuggingFace, aunque la información disponible no detalla la longitud de contexto ni los idiomas soportados. Su relevancia radica en la creciente demanda de modelos multimodales eficientes que puedan desplegarse en entornos edge sin depender de infraestructura cloud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MatFormer (con caché Per-Layer Embedding) |
| Parametros totales | 696.706.144 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (requiere aceptación de licencia de Google) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Gemma 3n E2B it, emplea una arquitectura MatFormer, una variante de transformer que permite ajustar dinámicamente el coste computacional mediante la selección de subredes dentro del modelo. Incorpora además el mecanismo Per-Layer Embedding (PLE), que cachea las embeddings por capa para reducir el uso de memoria durante la inferencia. Estas innovaciones están orientadas a maximizar la eficiencia en dispositivos con recursos limitados, como móviles y portátiles.

La versión convertida por Oscilla mantiene la arquitectura original pero con pesos cuantizados a 4 bits, lo que reduce el tamaño del modelo de aproximadamente 2,5 GB a un valor menor (el repositorio ocupa 2,5 GB, pero la cuantización 4-bit implica una reducción significativa respecto al modelo original). No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La conversión se realizó con mlx-lm 0.31.2, lo que garantiza compatibilidad con el ecosistema MLX de Apple.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de plantillas de chat mediante `apply_chat_template`.
- Procesamiento multimodal: entrada de imagen, audio y vídeo, además de texto (según las etiquetas `image-text-to-text`, `automatic-speech-recognition`, `automatic-speech-translation`, `audio-text-to-text`, `video-text-to-text`).
- Reconocimiento automático de voz (ASR) y traducción de audio a texto.
- Capacidad de ejecución en dispositivos Apple Silicon gracias a la conversión MLX, con bajo consumo de memoria.
- No se ha confirmado soporte explícito de tool calling o function calling en la información disponible.
- No se especifican capacidades multilingües concretas, aunque el modelo base de Google suele soportar múltiples idiomas.

## Casos de uso

- Asistente personal en dispositivo: al ser ligero y multimodal, puede integrarse en aplicaciones móviles o de escritorio para responder preguntas, gestionar tareas y procesar entradas de voz o imagen sin conexión a internet.
- Transcripción y subtitulado automático: gracias a su capacidad de reconocimiento de voz, puede transcribir reuniones, podcasts o vídeos en tiempo real, generando subtítulos o notas textuales.
- Traducción de audio en tiempo real: la función de traducción de voz permite convertir discursos en un idioma a texto en otro, útil para viajes o atención al cliente multilingüe.
- Análisis de imágenes en entornos edge: puede describir o clasificar imágenes capturadas por una cámara, por ejemplo en aplicaciones de asistencia para personas con discapacidad visual o en sistemas de inventario.
- Chatbot de soporte técnico local: desplegado en un portátil o mini-PC, puede gestionar consultas de usuarios con contexto conversacional, reduciendo la dependencia de servicios cloud.
- Prototipado rápido de aplicaciones multimodales: los desarrolladores pueden usar el modelo con MLX para experimentar con pipelines de texto-imagen-audio en Apple Silicon, gracias a su facilidad de integración con `mlx-lm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo o su variante cuantizada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~696M parámetros en 4-bit, el uso de memoria es reducido; el repositorio ocupa 2,5 GB, por lo que se estima que la inferencia requiere menos de 2 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de RAM unificada. No está diseñado para GPUs NVIDIA, ya que MLX es específico de Apple.
- Compatibilidad con consumer GPU: sí, en Macs con Apple Silicon. No es compatible con GPUs NVIDIA o AMD sin conversión adicional.
- Opciones de despliegue: `mlx-lm` (carga y generación), también compatible con la librería `transformers` de HuggingFace según las etiquetas. Se puede usar con Ollama (existe la variante `gemma3n:e2b` en el registro de Ollama).
- Latencia y throughput: no disponibles. Se espera una latencia baja en dispositivos Apple Silicon debido al tamaño reducido, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oscilla/gemma-3n-E2B-it-mlx-4Bit | 696M | no disponible | Gemma | MLX 4-bit | Conversión para Apple Silicon |
| google/gemma-3n-E2B-it (original) | 696M | no disponible | Gemma | safetensors | Modelo base sin cuantizar |
| Phi-3-mini (Microsoft) | 3.8B | 128K | MIT | safetensors | Más grande, no multimodal |
| Qwen2.5-0.5B (Alibaba) | 0.5B | 32K | Apache 2.0 | safetensors | Solo texto, más pequeño |

La comparativa se basa en parámetros y licencia, ya que no hay datos de rendimiento disponibles. El modelo destaca por su multimodalidad y eficiencia, pero carece de información sobre contexto y benchmarks.

## Limitaciones y advertencias

- La cuantización a 4-bit puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original en precisión completa.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo derivado de Gemma, puede heredar sesgos presentes en los datos de entrenamiento de Google.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda verificar respuestas en contextos críticos.
- La licencia Gemma requiere aceptación explícita de los términos de Google, que pueden incluir restricciones de uso comercial. Es necesario revisar la licencia antes de desplegar en producción.
- La longitud de contexto no está documentada, lo que limita la planificación de aplicaciones que requieran ventanas largas.
- El modelo está optimizado para Apple Silicon; su uso en otras plataformas requiere conversión adicional (por ejemplo, a GGUF para llama.cpp).
- No se ha confirmado soporte de tool calling, lo que puede limitar su uso en agentes autónomos complejos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/gemma-3n-E2B-it-mlx-4Bit
- Modelo base: https://huggingface.co/google/gemma-3n-E2B-it
- Documentación de Gemma 3n de Google: https://ai.google.dev/gemma/docs/gemma-3n
- Página de Gemma 3n en Ollama: https://ollama.com/library/gemma3n:e2b
- Guía de ejecución de Gemma con MLX: https://ai.google.dev/gemma/docs/integrations/mlx
