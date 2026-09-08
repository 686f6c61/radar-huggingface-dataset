# RepublicOfKorokke/gemma-4-E4B-it-qat-q4_0-unquantized-oQ3e-text-fp16

## Resumen

Este modelo es una cuantización adicional de 3 bits realizada sobre el modelo base `google/gemma-4-E4B-it-qat-q4_0-unquantized`, utilizando la librería de cuantización mixta oQ de oMLX (v0.6.4). El repositorio lo publica el usuario `RepublicOfKorokke` en formato MLX safetensors, con un tamaño de 3,5 GB y un total de 7.463.013.418 parámetros.

La familia Gemma 4, desarrollada por Google DeepMind, está formada por modelos abiertos multilingües que aceptan entrada de texto e imagen (y audio en las variantes E2B, E4B y 12B) y generan texto. El modelo base de este repositorio, Gemma 4 E4B IT, es una variante instruida con ventana de contexto de hasta 256K tokens y soporte para más de 140 idiomas. La cuantización a 3 bits que se aplica aquí está pensada para reducir el consumo de memoria y facilitar la ejecución en hardware con recursos limitados, especialmente entornos que usen MLX.

La relevancia de esta ficha es doble: ofrece una opción de despliegue extremadamente ligera para probar las capacidades de Gemma 4 en equipos Apple Silicon, y permite evaluar el impacto de una cuantización agresiva sobre un modelo moderno multimodal. No obstante, el repositorio no incluye benchmarks ni documentación de uso, por lo que cualquier decisión de producción debe tomarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); no se indica si es Dense o MoE |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (según modelo base Gemma 4) |
| Tipos de cuantizacion | 3 bits, group size 64, cuantización mixta oQ |
| Idiomas soportados | más de 140 idiomas (según modelo base Gemma 4) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B IT, un modelo de la familia Gemma 4 de Google DeepMind. Según la documentación oficial de Google, Gemma 4 incluye arquitecturas Dense y Mixture-of-Experts (MoE), pero la documentación de este repositorio no especifica cuál de ellas corresponde a la variante E4B. El modelo base ya venía con un esquema de cuantización activada durante el entrenamiento (QAT) de 4 bits sin desbloquear (`qat-q4_0-unquantized`), y sobre él se ha aplicado una segunda capa de cuantización a 3 bits con group size 64 mediante la herramienta oQ.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni los procesos de alineación (RLHF, DPO o similares) aplicados al modelo original. La innovación técnica destacable de esta variante es la cuantización mixta de precisión de oMLX, que permite reducir el peso del modelo a aproximadamente 3,5 GB, pero los detalles de cómo se distribuye la precisión entre capas no están documentados en este repositorio.

## Capacidades

- Generación de texto en más de 140 idiomas, con soporte de contexto largo de hasta 256K tokens.
- Entrada multimodal: acepta texto e imágenes; la documentación oficial de Gemma 4 indica soporte de audio en las variantes E2B, E4B y 12B.
- Modelo instruido (`it`), por lo que está preparado para seguir instrucciones en tareas de chat, razonamiento y codificación.
- Compatible con el ecosistema MLX, lo que permite ejecución nativa en Apple Silicon con aceleración por hardware.
- No se han publicado en este repositorio capacidades específicas adicionales como tool calling, agentes o razonamiento en modos especiales.

## Casos de uso

- Ejecución local en MacBook con chip M1 o superior: al ser un modelo MLX de 3 bits, puede cargarse en equipos con 8 GB de RAM unificada, lo que permite probar interacciones básicas con Gemma 4 sin depender de servidores.
- Prototipado rápido de asistentes conversacionales: la ventana de contexto de 256K tokens permite mantener conversaciones largas y analizar documentos extensos en un entorno local de bajos recursos.
- Experimentación con modelos multimodales ligeros: gracias al soporte de imagen del modelo base, se pueden testear flujos de trabajo de visión y lenguaje en local, aunque la cuantización extrema puede afectar la precisión de la salida.
- Investigación sobre el efecto de cuantización agresiva: este modelo sirve como referencia para comparar el rendimiento de Gemma 4 en 3 bits frente a versiones de 4, 8 o 16 bits, especialmente en tareas de razonamiento y generación de código.
- Educación y formación en despliegue de modelos: el repositorio es útil para mostrar cómo aplicar cuantización con oQ y generar pesos MLX a partir de un modelo base de Hugging Face.
- Aplicaciones multilingües de bajo coste: al disponer de soporte de más de 140 idiomas, puede utilizarse en aplicaciones de traducción o análisis de texto en idiomas minoritarios, siempre que se acepte la degradación de calidad propia de una cuantización de 3 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación comparable para esta variante cuantizada, por lo que no se puede valorar su rendimiento real frente a otros modelos.

## Requisitos de hardware

- VRAM/memoria estimada: el tamaño del repositorio es de 3,5 GB, lo que sugiere que se necesitan aproximadamente entre 3,5 y 4 GB de memoria para cargar los pesos, además del overhead de la librería MLX.
- GPU recomendada: Apple Silicon (M1, M2, M3, M4) por el formato MLX. No es compatible con CUDA de forma nativa; requeriría conversión a otro formato como GGUF para ejecutarse en GPUs NVIDIA.
- Es posible ejecutarlo en equipos Apple con 8 GB de RAM unificada, aunque la memoria libre disponible condicionará la longitud real del contexto que se pueda procesar.
- Opciones de despliegue: el modelo está pensado para usarse con la librería MLX y la herramienta oMLX. También puede convertirse a otros formatos si se desea usar con llama.cpp o vLLM, pero esa conversión no está documentada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E4B 3-bit oQ) | 7,46 B | 256K | 3 bits | MLX safetensors | no disponible |
| google/gemma-4-E4B-it (base) | 7,46 B | 256K | QAT 4-bit unquantized | Safetensors estándar | no disponible |
| google/gemma-4-E2B | no disponible | 256K | no disponible | Safetensors | no disponible |

No se dispone de modelos comparables de la misma categoría (3 bits MLX sobre Gemma 4 E4B) en la información proporcionada. La comparativa se limita a los datos publicados en Hugging Face y en la documentación oficial de Gemma 4.

## Limitaciones y advertencias

- La cuantización a 3 bits con group size 64 es agresiva y puede provocar una pérdida significativa de precisión en tareas de razonamiento complejo, generación de código o análisis multimodal.
- La licencia no está declarada en el repositorio, por lo que el uso comercial no se puede confirmar legalmente. Antes de desplegarlo en producción es necesario verificar la licencia del modelo base `google/gemma-4-E4B-it-qat-q4_0-unquantized`.
- El modelo no tiene resultados de benchmarks publicados, lo que impide validar su rendimiento en casos de uso reales.
- El repositorio es un experimento de cuantización con 0 descargas y 0 likes; no hay señales de mantenimiento, soporte o validación por parte de la comunidad.
- El uso de MLX limita el despliegue a Apple Silicon. No es un formato válido para servidores con GPUs NVIDIA, ni para vLLM o TGI sin conversión previa.
- No se ha documentado el comportamiento del modelo ante instrucciones de seguridad, sesgos o alucinaciones, por lo que debe usarse con supervisión en cualquier aplicación dirigida a usuarios finales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/RepublicOfKorokke/gemma-4-E4B-it-qat-q4_0-unquantized-oQ3e-text-fp16
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-E4B
- Ficha del modelo Gemma 4 en Google AI: https://ai.google.dev/gemma/docs/core/model_card_4
- Repositorio de oMLX y oQ: https://github.com/jundot/omlx
