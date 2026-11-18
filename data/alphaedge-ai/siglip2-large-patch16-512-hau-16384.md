# alphaedge-ai/siglip2-large-patch16-512-hau-16384

## Resumen

`alphaedge-ai/siglip2-large-patch16-512-hau-16384` es una version recortada del codificador vision-lenguaje SigLIP 2 de Google, adaptada especificamente al hausa (idioma de Nigeria y Niger). Se ha generado mediante la tecnica de *trimming*, que reduce el vocabulario del tokenizador de texto del modelo original de 256.000 a 16.384 tokens, conservando los que aparecen con mas frecuencia en corpus de hausa. El resultado es un modelo un 27,81 % mas pequeno en parametros (de 882,3 M a 636,9 M) y con una huella de memoria notablemente inferior.

El modelo mantiene la arquitectura original SigLIP 2 (ViT con atencion bidireccional imagen-texto, entrenada con perdida sigmoidea) y esta pensado para tareas de clasificacion de imagenes zero-shot y similitud texto-imagen en contextos donde el idioma principal es el hausa. No es un modelo generativo: produce embeddings multimodales alineados, no texto libre.

Su relevancia radica en demostrar como el recorte de vocabulario permite desplegar modelos multimodales de tamano medio en entornos con recursos limitados, a costa de sacrificar cobertura multilingue. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (Vision Transformer con encoder de texto, atencion bidireccional, perdida sigmoidea) |
| Parametros totales | 636.946.434 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hausa (ha) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `google/siglip2-large-patch16-512` es un codificador vision-lenguaje de la familia SigLIP 2, presentado en el paper arXiv:2502.14786. Emplea un Vision Transformer con parches de 16x16 y resolucion de entrada 512x512, junto con un encoder de texto transformer. La alineacion imagen-texto se entrena con una perdida sigmoidea sobre pares imagen-texto, lo que permite obtener embeddings normalizados y comparables mediante producto escalar o similitud coseno.

La variante aqui descrita no reentrena el modelo: aplica *trimming* sobre el vocabulario del tokenizador de texto. Para ello se muestrearon 200.000 textos del dataset `lbourdois/fineweb-2-trimming` en hausa y se conservaron los 16.384 tokens mas frecuentes, eliminando el resto del vocabulario y recortando la matriz de embeddings de texto en consecuencia. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento del modelo original ni sobre si hubo etapas de RLHF o DPO (SigLIP 2 no es un modelo generativo, por lo que estas tecnicas no aplican de la misma forma).

## Capacidades

- Clasificacion de imagenes zero-shot: asigna una imagen a una lista de etiquetas candidatas en hausa.
- Similitud texto-imagen: genera embeddings de imagen y de texto comparables, utiles para busqueda multimodal.
- Recuperacion imagen-texto y texto-imagen en hausa.
- Extraccion de caracteristicas visuales densas (aunque la model card no detalla el uso de las cabeceras de localizacion o segmentacion del SigLIP 2 original).
- Capacidades multilingues limitadas al hausa: el vocabulario recortado elimina tokens de otros idiomas, por lo que el rendimiento fuera del hausa se degrada.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso (no es un modelo generativo).

## Casos de uso

- Moderacion de contenido visual en plataformas en hausa: clasificar imagenes contra un conjunto de etiquetas definidas en hausa (por ejemplo, categorias de productos, escenas o contenido sensible) sin necesidad de entrenar un clasificador especifico.
- Busqueda semantica de imagenes en repositorios con descripciones en hausa: indexar embeddings de imagen y recuperar por consultas textuales en hausa mediante similitud coseno.
- Etiquetado automatico de catalogos de comercio electronico: asignar etiquetas de producto en hausa a imagenes de inventario usando zero-shot classification.
- Filtrado y organizacion de archivos multimedia en organizaciones que trabajan en Nigeria o Niger: agrupar imagenes por tematicas descritas en hausa.
- Investigacion en vision-lenguaje de bajos recursos: servir como punto de partida para estudiar el impacto del recorte de vocabulario en el rendimiento multimodal en idiomas africanos.
- Despliegue en entornos con GPU de gama media: al reducir el modelo a 636,9 M de parametros y el repositorio a 2,6 GB, cabe en GPUs consumer con suficiente VRAM para inferencia por lotes.
- Construccion de datasets multimodales anotados en hausa: usar las similitudes texto-imagen para pre-anotar pares y acelerar la curation de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,6 GB solo para pesos, mas memoria para activaciones y el encoder de texto; en la practica se recomienda al menos 6-8 GB para lotes pequenos.
- VRAM estimada en fp16/bf16: aproximadamente 1,3-1,5 GB para pesos, mas overhead; cabe en GPUs consumer con 8 GB o mas.
- GPUs recomendadas: NVIDIA RTX 3060/4060 (12/8 GB), RTX 4070/4080, A10, L4, A100 o H100 para despliegues por lotes a gran escala.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM en precision reducida.
- Opciones de despliegue: `transformers` (pipeline `zero-shot-image-classification`), `sentence-transformers`, y servidores de embeddings compatibles con la API de sentence-transformers. No se documenta soporte explicito para vLLM, llama.cpp u Ollama (no es un modelo generativo de texto).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-large-patch16-512-hau-16384 | 636,9 M | no disponible | hausa | apache-2.0 | Version recortada, vocabulario de 16.384 tokens |
| google/siglip2-large-patch16-512 | 882,3 M | no disponible | multilingue | apache-2.0 | Modelo original, vocabulario de 256.000 tokens |
| google/siglip2-base-patch16-512 | no disponible en la informacion | no disponible | multilingue | apache-2.0 | Variante base de la familia SigLIP 2 |
| openai/clip-vit-large-patch14 | no disponible en la informacion | no disponible | ingles principalmente | no disponible | Referencia clasica de vision-lenguaje |

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no presentes en el corpus de hausa; el modelo puede degradarse severamente en otros idiomas, incluido el ingles.
- Es un modelo de embeddings, no generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplica en el sentido generativo, pero las etiquetas zero-shot pueden asignarse con confianza espuria si las etiquetas candidatas no cubren bien la imagen.
- No se han publicado benchmarks especificos para esta variante recortada; el rendimiento real en hausa debe validarse empiricamente antes de usarlo en produccion.
- La model card no documenta sesgos especificos, pero al derivar de un modelo entrenado con datos web, puede heredar sesgos de representacion de personas y culturas.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de mineria (`lbourdois/fineweb-2-trimming`) por si imponen restricciones adicionales.
- Solo 7 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado, sin garantias de mantenimiento.
- El tag `region:eu` sugiere un posible enfoque regulatorio europeo, pero no se detalla en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-large-patch16-512-hau-16384
- Modelo base: https://huggingface.co/google/siglip2-large-patch16-512
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
