# fassabilf/sea-clip-tiny-abl-wit

## Resumen

SEA-CLIP-Tiny (ablación "only WIT") es un checkpoint de investigación publicado por el usuario fassabilf en HuggingFace. Se trata de una de las filas de la tabla de ablación del modelo principal SEA-CLIP-Tiny, presentado en ACCV 2026, cuyo objetivo es construir representaciones multimodales texto-imagen eficientes para lenguas del sudeste asiático. La diferencia respecto al modelo principal no es arquitectónica ni de hiperparámetros, sino la mezcla de datos de entrenamiento: esta variante se ha entrenado exclusivamente con el corpus WIT (487.000 pares imagen-texto).

El modelo emplea la arquitectura CLIP estándar: una torre de visión ViT-T/16 y una torre de texto de 12 capas y 384 dimensiones, con una dimensión de embedding compartida de 512. El total asciende a 46,11 millones de parámetros (5,62 M en visión y 40,49 M en texto), lo que lo sitúa en la gama ultraligera y permite inferencia en CPU o en GPUs de consumo muy modestas. El tokenizador es el BPE de CLIP con vocabulario de 49.408 tokens y longitud de contexto de 77 tokens.

Su relevancia es fundamentalmente académica y metodológica: sirve para aislar el efecto de una única fuente de datos sobre el rendimiento multilingüe, y como punto de comparación frente a las demás filas de la ablación y frente al modelo principal. Conviene subrayar que sus métricas publicadas son muy bajas (1,3 % de accuracy zero-shot en ImageNet y 0,8 % de R@1 medio en recuperación), por lo que no es un checkpoint pensado para producción, sino un artefacto de reproducción experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de dos torres: ViT-T/16 (vision) + transformer de texto de 12 capas y 384 de ancho; embedding compartido de 512 |
| Parametros totales | 46,11 M (5,62 M vision + 40,49 M texto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (tokenizador de texto CLIP BPE) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados; el checkpoint se distribuye para open_clip) |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch cargable con open_clip via `hf-hub` (repo de 0,2 GB); el formato exacto del fichero no se detalla en la informacion disponible |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clasico de CLIP con dos codificadores independientes que proyectan imagen y texto a un espacio comun de 512 dimensiones, donde se aplica una perdida contrastiva. La torre de vision es un ViT-T/16 (variante Tiny con parches de 16x16) y la torre de texto es un transformer de 12 capas con anchura 384. El tokenizador es el BPE de CLIP, con vocabulario de 49.408 entradas y ventana de 77 tokens, identico al del modelo principal.

El entrenamiento de esta ablacion se realizo exclusivamente sobre WIT, con 487.000 pares imagen-texto. El profesor de destilacion es MetaCLIP2-ViT-B-16-worldwide, un modelo de mayor tamano entrenado con cobertura multilingue mundial, lo que sugiere un esquema de destilacion junto con el objetivo contrastivo. La model card indica que la arquitectura, el pipeline y los hiperparametros son identicos a los del modelo principal y que la unica variable modificada es la mezcla de datos; la configuracion exacta de este checkpoint se encuentra en el fichero `params.txt` del repositorio. No se detallan en la informacion disponible el numero total de tokens de texto vistos, la composicion fina del dataset mas alla del recuento de pares, ni si se aplicaron fases de RLHF o DPO (poco habituales en modelos contrastivos de este tipo).

## Capacidades

- Clasificacion de imagenes zero-shot mediante prompts de texto, usando las etiquetas como textos candidatos.
- Recuperacion texto-imagen e imagen-texto (retrieval) en el espacio de embeddings compartido.
- Generacion de embeddings multimodales de 512 dimensiones, utiles como representacion para busqueda vectorial o tareas posteriores.
- Cobertura multilingue en ocho lenguas: ingles, indonesio, javanes, sondanes, malayo, tailandes, vietnamita y birmano.
- Capacidad limitada de emparejamiento cross-lingue texto-imagen (por ejemplo, consulta en indonesio sobre un catalogo de imagenes en ingles), sujeta a las limitaciones de rendimiento indicadas mas abajo.
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-paso: es un modelo de representacion, no un modelo generativo de instrucciones.
- No dispone de modo de razonamiento explicito, capacidades de audio ni generacion de texto libre.

## Casos de uso

- Reproduccion de experimentos de ablacion: el proposito principal del checkpoint es servir como fila "only WIT" en la tabla comparativa del articulo, de modo que un investigador puede reentrenar o evaluar esta configuracion concreta con el codigo del repositorio de GitHub.
- Linea base de referencia en estudios de destilacion multimodal: permite medir cuanto aporta cada fuente adicional de datos frente a entrenar solo con WIT, usando como profesor a MetaCLIP2-ViT-B-16-worldwide.
- Extraccion de embeddings para prototipos de busqueda visual en lenguas del sudeste asiatico: se pueden indexar embeddings de 512 dimensiones en una base vectorial y hacer consultas en indonesio o malayo, siempre asumiendo la calidad limitada del checkpoint.
- Etiquetado automatico exploratorio de imagenes (auto-tagging) en idiomas como javanes o sondanes, donde escasean modelos especificos, como primer filtro a refinar manualmente.
- Investigacion sobre sesgo y cobertura de datos: al entrenar solo con WIT, resulta util para analizar que lenguas y dominios quedan infrarrepresentados en ese corpus frente a mezclas mas amplias.
- Docencia y practicas de multimodalidad: su tamano de 46 M de parametros y su licencia MIT lo hacen adecuado para ejercicios de fine-tuning, visualizacion de embeddings y experimentos de recuperacion en un portatil.
- Componente de bajo coste en pipelines de pre-anotacion: dado su consumo minimo de recursos, puede ejecutarse en CPU para descartar candidatos evidentes antes de pasar una fraccion de las imagenes a un modelo mayor.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la propia model card. Las cifras de recuperacion (R@1) corresponden a particiones retenidas de cada fuente de entrenamiento y a la media de recuperacion sobre XM3600, Flickr30k-200 y XTD-200 (R@1-Avg). Todas las cifras estan en porcentaje.

| Metrica | Valor |
|---|---|
| CG R@1 | 0,2 |
| WIT R@1 | 27,7 |
| Bloom R@1 | 2,2 |
| ImageNet (zero-shot, accuracy) | 1,3 |
| R@1-Avg (XM3600, Flickr30k-200, XTD-200) | 0,8 |

No se publican en la informacion disponible resultados comparativos con otros modelos (MMLU, GSM8K o HumanEval no aplican a un modelo contrastivo de representacion). La model card tampoco incluye las cifras de las demas filas de la ablacion ni las del modelo principal.

## Requisitos de hardware

- VRAM estimada para inferencia: con 46,11 M de parametros, los pesos ocupan aproximadamente 184 MB en fp32 y unos 92 MB en fp16. Sumando activaciones y buffers, una inferencia por lotes pequenos cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; no se necesita una A100 ni una H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada reciente son suficientes. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 1-2 GB de memoria libre, e incluso en dispositivos de borde.
- Opciones de despliegue: la via documentada es `open_clip` mediante `create_model_and_transforms` y `get_tokenizer` con el identificador `hf-hub:fassabilf/sea-clip-tiny-abl-wit`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; estos frameworks estan orientados a modelos generativos y no aplican directamente a un codificador CLIP.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera una latencia muy baja por imagen en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ImageNet zero-shot | R@1-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sea-clip-tiny-abl-wit (esta ficha) | 46,11 M | 77 tokens | 1,3 | 0,8 | MIT | HuggingFace, 0 descargas |
| sea-clip-tiny (modelo principal) | no disponible en la informacion proporcionada | 77 tokens (misma arquitectura) | no disponible | no disponible | MIT (segun model card del principal) | HuggingFace |
| MetaCLIP2-ViT-B-16-worldwide (profesor) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros CLIP multilingues de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye las metricas del modelo principal ni del profesor, por lo que no es posible cuantificar la brecha entre esta ablacion y sus alternativas directas.

## Limitaciones y advertencias

- Rendimiento muy bajo: 1,3 % de accuracy zero-shot en ImageNet y 0,8 % de R@1 medio en recuperacion multilingue. No es apto para uso en produccion ni para tareas donde se requiera precision.
- Es un checkpoint de ablacion, no un modelo final: su interes es experimental y su utilidad practica esta subordinada al analisis comparativo del articulo.
- Sesgos y cobertura: al entrenarse solo con WIT (487.000 pares), hereda los sesgos de esa fuente y probablemente infrarrepresenta dominios, registros y variantes dialectales de las ocho lenguas declaradas.
- Riesgo de alucinacion: al ser un modelo contrastivo que puntua similitudes, no genera texto, pero puede asignar puntuaciones altas a emparejamientos incorrectos; las etiquetas derivadas de sus similitudes deben validarse.
- Limitacion de contexto: la torre de texto solo admite 77 tokens, lo que restringe las descripciones largas y los prompts complejos.
- Idiomas: la cobertura declarada incluye javanes, sondanes y birmano, lenguas con recursos limitados en otros modelos; sin embargo, las metricas publicadas no desglosan el rendimiento por idioma, por lo que no se puede verificar la calidad real en cada uno.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, pero la licencia no implica ninguna garantia sobre el rendimiento ni sobre los derechos de los datos de entrenamiento subyacentes.
- Reputacion del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin validacion externa de la comunidad.
- No se han publicado pesos cuantizados ni formatos alternativos (GGUF, ONNX), lo que limita su despliegue en algunos entornos de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny-abl-wit
- Modelo principal SEA-CLIP-Tiny: https://huggingface.co/fassabilf/sea-clip-tiny
- Codigo de entrenamiento y evaluacion: https://github.com/fassabilf/sea-clip-tiny
- Cita del articulo: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV), 2026 (no se proporciona enlace al paper en la informacion disponible)
- Nota: los resultados de la busqueda web proporcionados no contienen ningun enlace relevante para este modelo (se refieren a promociones de una marca de bebidas) y se han descartado.
