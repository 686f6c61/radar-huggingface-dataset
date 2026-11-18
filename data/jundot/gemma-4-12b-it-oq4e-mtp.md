# Jundot/gemma-4-12B-it-oQ4e-mtp

## Resumen

Jundot/gemma-4-12B-it-oQ4e-mtp es una cuantización de precisión mixta en formato MLX del modelo google/gemma-4-12B-it, desarrollado por Google DeepMind. El checkpoint original pertenece a la familia Gemma 4 y es un modelo "unified" de 11,95B parámetros: no incorpora encoders separados para cada modalidad, sino que los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras, y todas las modalidades se procesan a través de un único transformer decoder-only con una ventana de contexto de 256K tokens.

Esta versión concreta la publica el usuario Jundot mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta asignando bits según la sensibilidad medida de cada capa. El resultado es un checkpoint de 12,38B parámetros lógicos que ocupa 7,517 GiB en disco, con un promedio efectivo de 4,834 bits/peso en el backbone de lenguaje y 5,215 bits/peso en el checkpoint completo. Además, incorpora una cabeza de predicción multi-token (MTP) fusionada desde google/gemma-4-12B-it-assistant, pensada para acelerar la decodificación.

Es relevante para desarrolladores que trabajan en el ecosistema Apple Silicon y necesitan ejecutar un modelo multimodal any-to-any (texto, imagen y audio) de 12B con contexto muy largo en hardware de consumo, sacrificando poco más de un bit por peso respecto a BF16. La licencia es Apache-2.0, siguiendo el modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only "unified" (sin encoders separados; proyecciones lineales para imagen y audio) |
| Parametros totales | 12.382.587.188 (12,38B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Precisión mixta oQ4e: affine 4/5/6/8-bit con grupo 64 y BF16 en capas seleccionadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only unificado de la familia Gemma 4. La innovación arquitectónica principal es la ausencia de encoders específicos de modalidad: los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings del decoder mediante capas lineales ligeras (0,015B parámetros para visión y 0,002B para audio). Todas las modalidades se procesan con un único decoder con 256K tokens de contexto. El checkpoint incluye además una cabeza MTP de 0,423B parámetros fusionada desde google/gemma-4-12B-it-assistant, que permite predicción multi-token y decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La cuantización oQ4e sí está documentada: asigna bits por sensibilidad medida de capa, redondea cada grupo con una importance matrix (128 muestras × 512 tokens) y aplica un refit de escala y sesgo por mínimos cuadrados ponderados. La distribución resultante es 69,493% de pesos a 4-bit (4,50 bits/peso efectivos), 24,753% a 5-bit (5,50), 2,032% a 6-bit (6,50), 0,016% a 8-bit (8,50) y 3,705% en BF16 (16,00).

## Capacidades

- Generación de texto y razonamiento en un modelo de 12B parámetros.
- Procesamiento de imagen: los parches visuales se proyectan al espacio de embeddings del decoder unificado.
- Procesamiento de audio: las formas de onda se proyectan mediante una capa lineal ligera al mismo espacio.
- Pipeline any-to-any: combinación de entradas y salidas multimodales en un solo modelo.
- Contexto largo de 256K tokens para documentos extensos, conversaciones multi-turno o análisis de múltiples imágenes.
- Predicción multi-token (MTP) mediante la cabeza fusionada, orientada a acelerar la generación.
- Capacidades multilingües: no disponible en detalle.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos en local: con 256K tokens de contexto se pueden procesar informes, contratos o libros completos en una sola pasada en un Mac con Apple Silicon, sin enviar datos a la nube.
- Asistentes multimodales de escritorio: al aceptar imagen y audio además de texto, se puede construir un asistente que reciba capturas de pantalla y notas de voz y responda en una única conversación.
- Transcripción y resumen de reuniones: la proyección de audio permite alimentar directamente formas de onda y generar actas o resúmenes, todo dentro de un mismo modelo sin pipeline separado de ASR más LLM.
- Prototipado de aplicaciones any-to-any en MLX: el formato MLX y el tamaño de 7,5 GiB permiten iterar rápidamente en un MacBook con memoria unificada, sin depender de GPUs dedicadas.
- Generación aumentada por recuperación (RAG) con contexto masivo: la ventana de 256K permite inyectar muchos fragmentos recuperados sin truncar, útil para bases de conocimiento técnicas.
- Inferencia acelerada con decodificación especulativa: la cabeza MTP fusionada permite implementar decodificación multi-token para reducir la latencia en aplicaciones interactivas.
- Investigación sobre cuantización: el checkpoint sirve como referencia reproducible de la técnica oQ4e para comparar calidad frente a cuantizaciones uniformes de 4-bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 7,517 GiB en disco (8,072 GB); en inferencia hay que sumar la caché KV para el contexto utilizado, que con 256K tokens puede ser considerable.
- Entorno de ejecución: requiere la librería MLX, por lo que está orientado a Apple Silicon (series M1, M2, M3, M4 y superiores).
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 16 GB o más; con 16 GB el contexto práctico queda limitado, y con 32 GB o más se puede aprovechar buena parte de la ventana de 256K.
- GPU dedicadas (A100, H100, RTX 4090): no es el formato nativo; para CUDA habría que convertir los pesos a otro formato, y esa conversión no está documentada en la información disponible.
- Opciones de despliegue: MLX (librería mlx) y herramientas del ecosistema oMLX; vLLM, llama.cpp, Ollama o TGI no soportan de forma nativa este formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ4e-mtp | 12,38B | 256K | Texto, imagen, audio (any-to-any) | oQ4e mixta (4,834 bits/peso backbone) | Apache-2.0 | MLX safetensors |
| google/gemma-4-12B-it | 11,95B | 256K | Texto, imagen, audio (any-to-any) | BF16 | Apache-2.0 | safetensors |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | no disponible | BF16 | Apache-2.0 | safetensors |

La comparación directa con otras cuantizaciones de 4-bit del mismo modelo base (por ejemplo, GPTQ, AWQ o GGUF Q4) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización de 4-5 bits: existe una pérdida de calidad respecto al modelo BF16 original, aunque la asignación por sensibilidad busca minimizarla. No se han publicado evaluaciones que cuantifiquen esa pérdida.
- El formato es exclusivo de MLX: no se puede cargar directamente en vLLM, TGI, llama.cpp u Ollama, lo que limita el despliegue a entornos Apple Silicon.
- La ventana de 256K tokens exige mucha memoria para la caché KV; en equipos con 16 GB de memoria unificada el contexto útil real será muy inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje de 12B, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar del modelo de Google, hereda los sesgos de sus datos de entrenamiento.
- Idiomas soportados: no disponible; conviene validar el rendimiento en castellano antes de usarlo en producción.
- La licencia Apache-2.0 se declara siguiendo el modelo fuente, pero la model card enlaza a la licencia específica de Gemma 4; conviene revisar los términos de uso de Gemma antes de un despliegue comercial.
- El autor actualizó el checkpoint el 2026-10-29 con una recuantización; versiones anteriores pueden tener calidad distinta.
- Solo 2 likes y 3009 descargas: es un checkpoint de la comunidad, sin el respaldo de validación de Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-12B-it-oQ4e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo assistant (cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- Pull request de la mejora oQe: https://github.com/jundot/omlx/pull/4930
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
