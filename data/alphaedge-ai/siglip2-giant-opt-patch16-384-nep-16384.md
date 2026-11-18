# alphaedge-ai/siglip2-giant-opt-patch16-384-nep-16384

## Resumen

`siglip2-giant-opt-patch16-384-nep-16384` es una version recortada (trimmed) del codificador vision-lenguaje SigLIP 2 de Google, adaptada especificamente para el nepalí mediante reduccion de vocabulario. Lo publica el usuario `alphaedge-ai` sobre el modelo base `google/siglip2-giant-opt-patch16-384`, aplicando la tecnica de trimming documentada por Loïck Bourdois y colaboradores en Hugging Face. El resultado es un modelo un 14,75% mas pequeno en parametros (de 1.871.885.426 a 1.595.847.794) gracias a la reduccion del vocabulario de 256.000 a 16.384 tokens, un 93,60% menos.

El modelo mantiene la tarea original de SigLIP 2: clasificacion zero-shot de imagenes y calculo de similitud texto-imagen mediante embeddings. Es un codificador de doble torre (vision y texto) con parches de 16x16 y resolucion de 384 pixeles, integrable tanto en `transformers` (pipeline `zero-shot-image-classification`) como en `sentence-transformers`.

Su relevancia practica es acotada pero clara: para despliegues en nepalí, reduce el peso del repositorio hasta 6,4 GB y el numero de parametros en casi un 15%, lo que abarata memoria y almacenamiento en produccion. La contrapartida es que el vocabulario recortado elimina tokens de otros idiomas, por lo que el modelo deja de ser multilingue y solo debe usarse con texto en nepalí. La licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre (vision + texto), SigLIP 2, ViT con parches 16x16 a 384 px |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | nepalí (ne) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SigLIP 2, un codificador vision-lenguaje de dos torres que proyecta imagenes y textos a un espacio comun de embeddings. La torre de vision procesa la imagen en parches de 16x16 con resolucion de entrada de 384x384; la torre de texto codifica las etiquetas candidatas. La innovacion de SigLIP 2 respecto a SigLIP original incluye mejoras en comprension semantica, localizacion y caracteristicas densas, segun el paper arXiv:2502.14786.

El proceso de trimming consistio en identificar los tokens del vocabulario realmente relevantes para el nepalí y eliminar el resto. Segun la model card, se usaron 29.721 textos del dataset `lbourdois/fineweb-2-trimming` para minar la frecuencia de tokens. El vocabulario paso de 256.000 a 16.384 tokens y la matriz de embeddings de texto se recorto en consecuencia, lo que explica la reduccion de 276.037.632 parametros. No se realizo un reentrenamiento completo: el modelo conserva los pesos del base salvo en la capa de embeddings de texto recortada. No hay informacion disponible sobre RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Clasificacion zero-shot de imagenes: asigna etiquetas candidatas en nepalí a una imagen sin entrenamiento especifico.
- Similitud texto-imagen: genera embeddings de imagen y de texto comparables mediante producto escalar (interfaz `sentence-transformers`).
- Recuperacion multimodal: busqueda de imagenes por descripcion textual en nepalí y viceversa.
- Codificacion de imagenes a 384x384 con parches de 16x16.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al nepalí; el vocabulario recortado elimina tokens de otros idiomas.
- Capacidades especiales: no dispone de modo thinking, vision generativa ni audio; es exclusivamente un codificador.

## Casos de uso

- Etiquetado automatico de imagenes en nepalí: dado un catalogo de etiquetas en nepalí, el pipeline `zero-shot-image-classification` asigna la mas probable a cada imagen sin reentrenar, util para moderacion o catalogacion de contenido local.
- Busqueda visual en nepalí: indexar embeddings de imagenes y consultar con descripciones textuales en nepalí usando `model.encode` y `model.similarity`, por ejemplo en un buscador de productos o patrimonio cultural.
- Filtrado de contenido en plataformas nepalesas: clasificar imagenes subidas por usuarios contra categorias definidas en nepalí para deteccion temprana de contenido inapropiado.
- Accesibilidad: generar descripciones alternativas o etiquetas en nepalí para imagenes, apoyando lectores de pantalla en ese idioma.
- Organizacion de archivos fotograficos: agrupar y etiquetar automaticamente grandes volumenes de imagenes con vocabulario en nepalí, aprovechando el menor peso del modelo (6,4 GB) frente al base.
- Investigacion en vision-lenguaje de bajos recursos: servir como punto de partida para experimentos con nepalí donde el coste de memoria y almacenamiento es limitante, comparando frente al SigLIP 2 completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma que el modelo recortado "deberia comportarse de forma similar al original" con 16.384 tokens, sin cifras concretas de MMLU, ImageNet, retrieval ni otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB en fp16 (1.595.847.794 parametros x 2 bytes) solo para pesos; sumar activaciones y buffers de imagen, en torno a 4-5 GB en total.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100, H100.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060/4060/4070/4090, entre otras).
- Opciones de despliegue: `transformers` (pipeline `zero-shot-image-classification`), `sentence-transformers`, servidores de embeddings compatibles con la API de sentence-transformers; no hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI (no es un modelo generativo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-nep-16384 | 1.595.847.794 | 16.384 | nepalí | Apache 2.0 | zero-shot image classification |
| google/siglip2-giant-opt-patch16-384 (base) | 1.871.885.426 | 256.000 | multilingue | Apache 2.0 | zero-shot image classification |
| Otros recortes de SigLIP 2 giant | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos concretos es frente al modelo base: el recorte elimina el 14,75% de parametros y el 93,60% del vocabulario, a cambio de perder cobertura multilingue. No se dispone de datos de rendimiento comparado con alternativas como CLIP o SigLIP original.

## Limitaciones y advertencias

- Solo funciona correctamente con texto en nepalí: el vocabulario recortado elimina tokens de otros idiomas, por lo que el rendimiento en ingles, castellano u otros idiomas sera degradado o directamente invalido.
- No es un modelo generativo: no produce texto, codigo ni razonamiento; solo embeddings y puntuaciones de similitud.
- Riesgo de alucinacion en sentido estricto no aplica, pero si puede asignar etiquetas erroneas con alta confianza en imagenes ambiguas o fuera de distribucion.
- No hay benchmarks publicados que validen la calidad del recorte frente al base; la afirmacion de rendimiento similar es del autor y no esta cuantificada.
- Sesgos: al derivar de SigLIP 2 entrenado con datos web multilingues, puede heredar sesgos de representacion; no se documentan sesgos especificos para nepalí.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base de Google y de los datos de minado (`lbourdois/fineweb-2-trimming`).
- El repositorio tiene muy poca traccion (6 descargas, 0 likes) y fue creado en 2026; no hay evidencia de validacion por la comunidad.
- Para produccion, conviene evaluar el modelo contra el base en el dominio concreto antes de adoptarlo, dado que no hay metricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-nep-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
