# fassabilf/sea-clip-tiny-abl-loss-mse

## Resumen

SEA-CLIP-Tiny (ablation: CLIP + MSE) es un checkpoint de investigación publicado por el usuario fassabilf dentro del proyecto *SEA-CLIP-Tiny*, presentado en ACCV 2026. Se trata de un modelo de embeddings texto-imagen de tipo CLIP, orientado específicamente a lenguas del sudeste asiático, que resuelve tareas de clasificación de imágenes zero-shot y recuperación (retrieval) multimodal en idiomas poco representados en los corpus habituales de entrenamiento.

No es un modelo generativo: es un codificador dual (torre de visión más torre de texto) que proyecta imágenes y texto a un espacio vectorial común de 512 dimensiones. Su tamaño es muy reducido (46,11 M de parámetros en total: 5,62 M para la torre de visión y 40,49 M para la de texto), lo que lo hace desplegable en hardware muy modesto, incluidas CPU. El contexto del tokenizador está limitado a 77 tokens, la longitud estándar de CLIP.

Este checkpoint concreto es una de las filas de la tabla de ablación del trabajo principal: mantiene la misma arquitectura, pipeline e hiperparámetros que el modelo principal, pero cambia el objetivo de destilación, usando únicamente pérdida contrastiva más destilación de características (MSE), sin otros términos. Su relevancia es, por tanto, principalmente experimental: sirve para aislar la contribución de cada componente de la función de pérdida y no está pensado como artefacto de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-T/16 (torre de visión) + torre de texto de 12 capas y 384 de ancho, dimensión de embedding 512 |
| Parametros totales | 46,11 M (5,62 M visión + 40,49 M texto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (tokenizador CLIP BPE, vocabulario 49.408) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio HuggingFace cargable mediante `open_clip`, tamano del repo 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema CLIP clásico de dos torres: una torre de visión ViT-T/16, que divide la imagen en parches de 16x16 y procesa una variante Tiny de Vision Transformer, y una torre de texto de 12 capas con anchura 384. Ambas proyectan a un espacio compartido de 512 dimensiones donde se calcula la similitud texto-imagen. El tokenizador es el BPE de CLIP con vocabulario de 49.408 entradas y ventana de 77 tokens.

El entrenamiento se realizó sobre 12,72 millones de pares imagen-texto procedentes de la combinación de CC12M, CulturalGround-OE-filt, WIT, Bloom y Mammoth-VL-SEA. El modelo se destila desde MetaCLIP2-ViT-B-16-worldwide como profesor. En este checkpoint de ablación concreto, el objetivo de entrenamiento combina pérdida contrastiva con destilación de características medida con error cuadrático medio (MSE), eliminando el resto de términos empleados en el modelo principal. La configuración exacta de entrenamiento está disponible en el fichero `params.txt` del repositorio.

## Capacidades

- Clasificación de imágenes zero-shot: asignar etiquetas textuales arbitrarias a una imagen sin necesidad de reentrenamiento.
- Recuperación texto-imagen e imagen-texto (retrieval) mediante similitud de embeddings en el espacio de 512 dimensiones.
- Representación multilingüe en ocho idiomas: inglés, indonesio, javanés, sundanés, malayo, tailandés, vietnamita y birmano.
- Extracción de embeddings visuales y textuales reutilizables para indexación vectorial y búsqueda por similitud.
- Filtrado de datasets a escala (CLIP filtering) para curación de corpus multimodales.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No dispone de modo de razonamiento (thinking mode), audio ni capacidades generativas de ningún tipo.

## Casos de uso

- Búsqueda visual multilingüe en comercio electrónico del sudeste asiático: indexar el catálogo de productos como embeddings de imagen y permitir consultas en indonesio, tailandés, vietnamita o malayo, recuperando los artículos más similares por producto escalar.
- Etiquetado automático de imágenes en idiomas locales: dado un conjunto de etiquetas en javanés, sundanés o birmano, el modelo asigna la más probable sin necesidad de anotaciones específicas para cada idioma.
- Curación y filtrado de datasets multimodales a gran escala: calcular la similitud texto-imagen de millones de pares y descartar aquellos por debajo de un umbral para entrenar modelos posteriores con datos más limpios.
- Moderación de contenido asistida: clasificación zero-shot de imágenes frente a categorías definidas por el equipo (por ejemplo, contenido violento o no apto) usando descripciones textuales, sin entrenar un clasificador dedicado.
- Deduplicación y organización de archivos multimedia: agrupar imágenes semánticamente similares en un repositorio mediante clustering sobre los embeddings generados por la torre de visión.
- Recomendación visual en mercados de segunda mano: sugerir artículos relacionados a partir de la foto que sube el usuario, comparando embeddings contra el inventario.
- Preservación y catalogación de patrimonio cultural: el corpus CulturalGround empleado en el entrenamiento está orientado a contenido cultural, por lo que el modelo puede asistir en la clasificación temática de colecciones etnográficas o históricas de la región.
- Investigación en ablaciones de destilación multimodal: servir como punto de comparación controlado frente al modelo principal para medir el efecto de la pérdida MSE en la destilación de un CLIP pequeño.

## Benchmarks y rendimiento

Resultados publicados en la model card del checkpoint de ablación (porcentajes):

| Metrica | Valor |
|---|---|
| CG R@1 (CulturalGround, split reservado) | 39,5 |
| WIT R@1 (split reservado) | 26,8 |
| Bloom R@1 (split reservado) | 11,3 |
| ImageNet zero-shot (accuracy) | 31,3 |
| R@1-Avg (media solo de retrieval sobre XM3600, Flickr30k-200 y XTD-200) | 7,2 |

No se han facilitado en la informacion disponible los resultados del modelo principal ni de otros checkpoints de la ablación, por lo que no es posible establecer una comparación cuantitativa dentro del mismo trabajo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en fp32 ocupan aproximadamente 184 MB (46,11 M de parámetros) y en fp16 unos 92 MB; el resto corresponde a activaciones de una torre ViT-T/16 a resolución estándar de 224x224.
- GPU recomendadas: cualquiera con al menos 1-2 GB de memoria. Se puede ejecutar sin problema en GTX 1650, RTX 3050, RTX 4090, A100 o H100; en estas dos últimas el modelo queda enormemente infrautilizado.
- Compatible con GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en GPU integradas. También es viable en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: `open_clip` mediante `hf-hub:fassabilf/sea-clip-tiny-abl-loss-mse` (carga directa con `create_model_and_transforms` y `get_tokenizer`), exportación a ONNX o TorchScript para servir embeddings, e integración en bases de datos vectoriales. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Resultados comparables |
|---|---|---|---|---|---|
| sea-clip-tiny-abl-loss-mse (este checkpoint) | 46,11 M | 77 tokens | en, id, jv, su, ms, th, vi, my | MIT | CG R@1 39,5; WIT R@1 26,8; Bloom R@1 11,3; ImageNet 31,3; R@1-Avg 7,2 |
| sea-clip-tiny (modelo principal) | no disponible | no disponible (misma arquitectura declarada) | no disponible | no disponible | no disponible |
| MetaCLIP2-ViT-B-16-worldwide (profesor) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros CLIP multilingues de tamano Tiny | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card indica que el modelo principal comparte arquitectura, pipeline e hiperparámetros con este checkpoint, diferenciándose únicamente en el objetivo de destilación, pero no se aportan sus cifras ni su licencia.

## Limitaciones y advertencias

- Es un checkpoint de ablación, no un modelo final: sus resultados no deben tomarse como representativos del mejor rendimiento del proyecto SEA-CLIP-Tiny.
- El valor de R@1-Avg de 7,2 sobre XM3600, Flickr30k-200 y XTD-200 es bajo en términos absolutos, lo que indica un rendimiento limitado en recuperación multilingüe de imágenes.
- Ventana de contexto de solo 77 tokens: no admite descripciones largas, documentos extensos ni prompts complejos.
- Cobertura lingüística restringida a ocho idiomas del sudeste asiático y el inglés; no soporta castellano ni otras lenguas europeas.
- Riesgo de sesgo heredado de los corpus de entrenamiento (CC12M, WIT y similares), que sobrerrepresentan contenido occidental y en inglés, y de las limitaciones culturales de los conjuntos filtrados.
- Al ser un modelo de similitud y no generativo, puede producir clasificaciones erróneas sin mecanismo de abstención; no genera explicaciones ni texto.
- No se han publicado datos sobre cuantización, por lo que el rendimiento tras compresión agresiva no está caracterizado.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre conservando el aviso de copyright. Aun así, la procedencia de los datos de entrenamiento puede imponer obligaciones adicionales que no cubre la licencia del modelo.
- El repositorio registra cero descargas y cero interacciones, por lo que no existe validación externa ni comunidad que reporte problemas de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny-abl-loss-mse
- Modelo principal: https://huggingface.co/fassabilf/sea-clip-tiny
- Repositorio de código de entrenamiento y evaluación: https://github.com/fassabilf/sea-clip-tiny
- Cita del trabajo: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV), 2026 (sin enlace disponible)
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
