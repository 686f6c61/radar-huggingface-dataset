# clm-project/clm-35b-a3b-text-image-head

## Resumen

CLM-35B-A3B text + image head es una cabeza contrastiva multimodal publicada por el proyecto `clm-project`. No se trata de un modelo de lenguaje completo, sino de una cabeza MLP de 12,6 millones de parametros (anchura 1536, profundidad 3, proyeccion a 512 dimensiones) que se aplica sobre los embeddings de 2048 dimensiones generados por Qwen3.6-35B-A3B-FP8. Su funcion es mapear representaciones textuales e imagenes a un espacio comun para tareas de recuperacion y comparacion semantica.

El modelo parte de una cabeza de mid-training previa (HQ-DQA) y se post-entrena con 70 almacenes de datos: 67 de texto y 3 de imagen (Nemotron-Image v3, Nemotron-Image v3.5 y Cosmos-Reason1), con 100.000 filas de entrenamiento por almacen, un 40% de replay HQ-DQA con negativos duros, batch de 16.384, learning rate de 1e-3 y 20.000 pasos. El checkpoint publicado (`best_head.pt`) corresponde al paso 20.000.

Su relevancia es acotada pero tecnica: documenta un experimento de comparacion de etapas de entrenamiento (`clm_train`) en el que se mide el impacto de anadir datos de imagen a una cabeza contrastiva originalmente textual. Los resultados del indice Jev muestran que la version multimodal obtiene 19,4 frente a 21,4 de la version solo texto, con una caida notable en la dimension de herramientas (8,9 frente a 16,7), lo que sugiere un compromiso entre cobertura modal y rendimiento en tareas instrumentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MLP contrastiva sobre embeddings de Qwen3.6-35B-A3B-FP8 |
| Parametros totales | 12,6 M (cabeza); el modelo base Qwen3.6-35B-A3B no se distribuye en este repo |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el backbone referenciado es FP8) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | PyTorch (`best_head.pt`, `final_head.pt`) |
| Dimension de embedding de entrada | 2048 |
| Dimension de proyeccion de salida | 512 |
| Anchura / profundidad de la MLP | 1536 / 3 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La cabeza es una MLP de tres capas con anchura 1536 y proyeccion final a 512 dimensiones, disenada para operar sobre los embeddings de 2048 dimensiones producidos por Qwen3.6-35B-A3B-FP8. El entrenamiento es de tipo contrastivo, con negativos duros, e incluye una fase de inicializacion desde la cabeza de mid-training HQ-DQA (pre-entrenada sobre 621 chunks y posteriormente refinada con negativos duros).

El post-entrenamiento utiliza 70 almacenes de datos: los 67 almacenes textuales de la receta original mas tres almacenes de imagen (Nemotron-Image v3, Nemotron-Image v3.5 y Cosmos-Reason1). Se emplean 100.000 filas por almacen, un 40% de replay de HQ-DQA con negativos duros, batch de 16.384, learning rate de 1e-3, 20.000 pasos y una vista de opciones con probabilidad 0,5. El checkpoint `best_head.pt` corresponde al paso 20.000. El repositorio incluye `summary.json` con la receta e historial de validacion, `train.log` y `sources.txt`.

## Capacidades

- Generacion de embeddings contrastivos multimodales (texto e imagen) en un espacio comun de 512 dimensiones.
- Recuperacion y comparacion semantica entre consultas textuales y documentos o imagenes.
- Soporte de negativos duros en el entrenamiento, orientado a mejorar la discriminacion en retrieval.
- Capacidad de reutilizar el backbone Qwen3.6-35B-A3B-FP8 para extraer representaciones de entrada.
- No es un modelo generativo: no produce texto ni respuestas, solo representaciones vectoriales.
- No dispone de tool calling, function calling ni modo agente.
- No se documenta soporte multilingue explicito ni capacidades de audio.
- Evaluacion limitada al suite textual del indice Jev; no evaluado en el tablero de vision.

## Casos de uso

- Busqueda semantica multimodal: indexar documentos textuales e imagenes en un unico espacio de 512 dimensiones y recuperar resultados cruzando modalidades, aprovechando el entrenamiento conjunto sobre almacenes de texto e imagen.
- Re-ranking en pipelines de recuperacion: usar la cabeza como segunda etapa sobre candidatos obtenidos por un retriever disperso, con negativos duros entrenados para discriminar casos dificiles.
- Clasificacion zero-shot por similitud: comparar embeddings de consultas contra prototipos textuales para etiquetar contenido sin entrenamiento adicional.
- Deduplicacion y clustering de contenido: agrupar documentos e imagenes por proximidad en el espacio contrastivo para consolidar corpus o detectar duplicados.
- Moderacion y filtrado de contenido: calcular similitud contra embeddings de referencia de contenido no deseado y aplicar umbrales de decision.
- Investigacion en comparacion de etapas de entrenamiento: el repo documenta la receta y el historial de validacion, lo que permite reproducir el experimento de anadir datos de imagen a una cabeza textual.
- Integracion en sistemas RAG: sustituir el codificador por defecto por esta cabeza cuando el corpus combine texto e imagen y el backbone Qwen3.6-35B-A3B-FP8 ya este desplegado.

## Benchmarks y rendimiento

Indice Jev, suite publica textual (puntuacion propia del indice, estados planos):

| Cabeza | Indice | Knowledge | Language | Retrieval | Tools | Arts |
|---|---:|---:|---:|---:|---:|---:|
| Post-entrenamiento solo texto (misma receta sin almacenes de imagen) | 21,4 | 4,9 | 34,2 | 35,4 | 16,7 | 11,2 |
| **Esta cabeza (texto + imagen)** | 19,4 | 5,0 | 32,3 | 35,1 | 8,9 | 10,5 |

No hay resultados publicados en el tablero de vision; la evaluacion cubre unicamente el suite textual. La mejor cabeza textual del proyecto es `clm-project/clm-35b-a3b-jev-boost-head`, con 39,9 en el indice.

## Requisitos de hardware

- VRAM para la cabeza: inferior a 1 GB en FP32 (12,6 M de parametros); el repositorio ocupa 0,1 GB.
- VRAM para el backbone: el modelo base Qwen3.6-35B-A3B-FP8 requiere despliegue aparte; no se distribuye en este repositorio y su huella no esta documentada aqui.
- GPU recomendadas para la cabeza: cualquier GPU consumer (RTX 3060 o superior) es suficiente; la carga real recae en el backbone.
- Despliegue del backbone: no disponible en la informacion proporcionada (no se confirman opciones como vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Indice Jev | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clm-35b-a3b-text-image-head | 12,6 M (cabeza) | no disponible | 19,4 | other | Hugging Face |
| clm-35b-a3b-jev-boost-head | no disponible | no disponible | 39,9 | no disponible | Hugging Face |
| Cabeza solo texto (misma receta) | 12,6 M (cabeza) | no disponible | 21,4 | other | Referenciada en la model card |

No se dispone de datos de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a instrucciones; solo produce embeddings.
- Rendimiento inferior a la variante solo texto en el indice Jev (19,4 frente a 21,4), con una caida acusada en la dimension de herramientas (8,9 frente a 16,7).
- No evaluado en tareas de vision, pese a incluir almacenes de imagen en el entrenamiento.
- Licencia "other": es necesario revisar los terminos exactos antes de cualquier uso comercial.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Dependencia obligatoria del backbone Qwen3.6-35B-A3B-FP8, cuyos requisitos de hardware y licencia deben verificarse por separado.
- Riesgo de sesgo y alucinacion inherente a los datos de entrenamiento (Nemotron-Image, Cosmos-Reason1 y los 67 almacenes textuales), no cuantificado en la model card.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- [Hugging Face: clm-project/clm-35b-a3b-text-image-head](https://huggingface.co/clm-project/clm-35b-a3b-text-image-head)
- [Hugging Face: clm-project/clm-35b-a3b-jev-boost-head](https://huggingface.co/clm-project/clm-35b-a3b-jev-boost-head)
- Documentacion de la receta: `docs/clm-35b-training-eval.md` (referenciada en la model card, no enlazada)
- Ficheros del repositorio: `best_head.pt`, `final_head.pt`, `summary.json`, `train.log`, `sources.txt`
