# alphaedge-ai/siglip2-giant-opt-patch16-384-tgl-16384

## Resumen

siglip2-giant-opt-patch16-384-tgl-16384 es una version "trimmed" (podada en vocabulario) del codificador vision-lenguaje SigLIP 2 de Google, publicada por el usuario alphaedge-ai. El modelo original, google/siglip2-giant-opt-patch16-384, es un encoder contrastivo de doble torre (imagen y texto) de tipo ViT, y esta variante reduce el vocabulario del tokenizador de texto de 256.000 a 16.384 tokens para optimizarlo al tagalo (tl). El resultado es un modelo un 14,75% mas pequeno en parametros (de 1.871.885.426 a 1.595.847.794) con un vocabulario un 93,60% menor.

La poda se realizo con la metodologia de trimming descrita por Hugging Face, que consiste en identificar los tokens mas frecuentes en un corpus del idioma objetivo y descartar el resto del vocabulario, ajustando las matrices de embedding correspondientes. En este caso el corpus de minado fue de 110.351 textos extraidos del dataset lbourdois/fineweb-2-trimming. El modelo conserva la tarea original de zero-shot image classification y la interfaz de sentence-transformers para similitud texto-imagen.

Su relevancia es acotada: se trata de un modelo derivado, con solo 12 descargas y 0 likes en el momento de la consulta, orientado a un nicho muy concreto (clasificacion y recuperacion de imagenes con etiquetas en tagalo) y con un ahorro de memoria modesto en terminos absolutos. La licencia Apache 2.0 y la compatibilidad con el ecosistema Transformers/sentence-transformers lo hacen facil de desplegar, pero su utilidad fuera del tagalo es practicamente nula por la eliminacion de tokens de otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre (vision-lenguaje) basado en SigLIP 2, ViT con parches de 16x16 a 384 px |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings/CLIP, sin contexto generativo) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en el formato original) |
| Idiomas soportados | tagalo (tl) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2 en su variante "giant" con parches de 16x16 y resolucion de entrada de 384 px. SigLIP 2 es un encoder contrastivo de dos torres: un Vision Transformer para imagenes y un transformer de texto, entrenados con una funcion de perdida sigmoide en lugar del softmax clasico de CLIP. La version original de Google incorpora mejoras de comprension semantica, localizacion y caracteristicas densas, segun el paper arXiv:2502.14786. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset original en la informacion proporcionada.

El proceso de trimming aplicado por alphaedge-ai no reentrena el modelo: selecciona los 16.384 tokens mas frecuentes en 110.351 textos en tagalo del dataset lbourdois/fineweb-2-trimming, elimina el resto del vocabulario y recorta las filas correspondientes de la matriz de embeddings de texto. Esto explica la reduccion del 93,60% del vocabulario y del 14,75% de parametros totales. No se ha realizado ajuste fino posterior segun la model card, por lo que el modelo "deberia comportarse de forma similar al original" en tagalo, pero no hay validacion empirica publicada.

## Capacidades

- Clasificacion de imagenes zero-shot con etiquetas candidatas en tagalo.
- Calculo de embeddings de imagen y de texto para similitud texto-imagen (interfaz sentence-transformers).
- Recuperacion multimodal (image-text retrieval) en tagalo.
- Generacion de caracteristicas densas de imagen heredadas de SigLIP 2 (localizacion y dense features), aunque no validadas tras el trimming.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingues: limitadas al tagalo; el resto de idiomas pierde tokens en el vocabulario.
- Capacidades especiales: no dispone de thinking mode, vision generativa, audio ni salida de texto libre.

## Casos de uso

- Moderacion de contenido visual en plataformas filipinas: clasificar imagenes contra un conjunto de etiquetas en tagalo para detectar contenido no permitido, aprovechando la interfaz zero-shot sin necesidad de entrenar un clasificador especifico.
- Etiquetado automatico de catalogos de e-commerce locales: asignar categorias en tagalo a imagenes de producto mediante similitud texto-imagen, con un coste de memoria menor que el modelo original.
- Busqueda visual en archivos fotograficos: indexar embeddings de imagen y recuperar por consultas de texto en tagalo, usando la API de sentence-transformers.
- Filtrado de datasets multimodales: puntuar pares imagen-texto en tagalo para limpiar corpus de entrenamiento de otros modelos, comparando embeddings y descartando pares con baja similitud.
- Accesibilidad: generar descripciones o etiquetas en tagalo para imagenes en aplicaciones de lectura de pantalla, limitado a clasificacion contra un vocabulario predefinido.
- Investigacion sobre trimming: servir como caso de estudio reproducible para medir el impacto de la poda de vocabulario en tareas de retrieval y clasificacion, dado que el modelo base y el dataset de minado estan publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 6,4 GB solo de pesos, mas overhead de activaciones; en fp16/bf16 alrededor de 3,2 GB.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090 o RTX 3090 suficientes para inferencia en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante).
- Opciones de despliegue: pipeline de Transformers (`zero-shot-image-classification`), sentence-transformers, y servidores de embeddings compatibles con la API de sentence-transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-tgl-16384 | 1.595.847.794 | 16.384 | tagalo | apache-2.0 | Version trimmed, 14,75% menos parametros |
| google/siglip2-giant-opt-patch16-384 | 1.871.885.426 | 256.000 | multilingue | apache-2.0 | Modelo base original, sin poda |
| google/siglip2-so400m-patch14-384 | no disponible en la informacion | no disponible | multilingue | apache-2.0 | Variante menor de la familia SigLIP 2 |
| openai/clip-vit-large-patch14 | no disponible en la informacion | no disponible | ingles principalmente | licencia CLIP de OpenAI | Referencia historica de vision-lenguaje contrastivo |

## Limitaciones y advertencias

- El trimming elimina tokens no frecuentes en tagalo, por lo que el rendimiento en otros idiomas se degrada de forma severa; no debe usarse como modelo multilingue.
- No hay evaluacion publicada que confirme que el rendimiento en tagalo se mantiene respecto al modelo original; la afirmacion de la model card es una expectativa, no un resultado medido.
- Es un modelo de embeddings y clasificacion, no generativo: no produce texto libre ni soporta razonamiento, tool calling ni agentes.
- Riesgo de sesgo heredado del corpus de entrenamiento de SigLIP 2 (pares imagen-texto de web), con posibles sesgos culturales y de representacion.
- El corpus de minado (110.351 textos de fineweb-2) puede no cubrir variantes dialectales del tagalo ni registro informal, lo que afecta a la seleccion de tokens conservados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de minado tienen sus propias condiciones que conviene revisar.
- El modelo es un derivado no oficial de Google, con muy poca adopcion (12 descargas, 0 likes); no hay garantias de mantenimiento ni soporte.
- Para produccion, conviene validar el rendimiento en el dominio concreto antes de sustituir al modelo original, dado el ahorro de memoria relativamente modesto (6,4 GB de repo frente al original).

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-tgl-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog de trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
