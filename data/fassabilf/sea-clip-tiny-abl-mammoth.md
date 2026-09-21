# fassabilf/sea-clip-tiny-abl-mammoth

## Resumen

SEA-CLIP-Tiny (ablation: Only Mammoth) es un checkpoint CLIP multilingue de vision y texto desarrollado por el usuario fassabilf, presentado como una de las filas de la tabla de ablacion del articulo *SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages* (ACCV 2026). El modelo emplea la misma arquitectura, pipeline e hiperparametros que el modelo principal (https://huggingface.co/fassabilf/sea-clip-tiny); la unica diferencia es la mezcla de datos de entrenamiento, limitada en este caso a Mammoth-VL-SEA (540.000 pares imagen-texto).

Tecnicamente es un CLIP compacto: torre de vision ViT-T/16 mas una torre de texto de 12 capas y 384 dimensiones, con embedding compartido de 512 dimensiones y un total de 46,11 millones de parametros (5,62 M en vision y 40,49 M en texto). El tokenizador es el BPE de CLIP con vocabulario de 49.408 entradas y longitud de contexto de 77 tokens. Cubre ocho idiomas: ingles, indonesio, javanes, sundanés, malayo, tailandes, vietnamita y birmano, y se distribuye bajo licencia MIT.

Su relevancia es exclusivamente metodologica: es un artefacto de ablacion que documenta el comportamiento del pipeline cuando se entrena unicamente con una fuente de datos. Los resultados publicados en la propia model card son degenerados (R@1 de 0,0 en CG y WIT, 0,8 en Bloom, 0,5 en ImageNet y 0,5 en el Avg@1 de recuperacion), muy por debajo de lo utilizable en produccion. No debe confundirse con el modelo principal, que es el destinado a uso practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP: torre de vision ViT-T/16 + torre de texto transformer de 12 capas y 384 dimensiones, embedding compartido de 512 |
| Parametros totales | 46,11 M (5,62 M vision + 40,49 M texto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (torre de texto, tokenizador CLIP BPE con vocabulario de 49.408) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio gestionado via HuggingFace Hub con open_clip; la model card no detalla el formato de los ficheros) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema CLIP clasico de dos torres con espacio de embedding contrastivo comun de 512 dimensiones. La torre de vision es un ViT-T/16 (transformer de vision tipo tiny con parches de 16x16) y la torre de texto es un transformer de 12 capas con anchura 384. El tokenizador es el BPE de CLIP, con un vocabulario de 49.408 entradas y una ventana de 77 tokens, lo que limita las descripciones textuales a fragmentos cortos.

El entrenamiento de este checkpoint concreto utiliza unicamente Mammoth-VL-SEA, un conjunto de 540.000 pares imagen-texto, y emplea como profesor a MetaCLIP2-ViT-B-16-worldwide (destilacion desde un modelo mayor). No se documenta en la informacion disponible el numero total de tokens vistos, la composicion detallada del dataset, ni el uso de RLHF o DPO, algo por otra parte esperable en un modelo contrastivo de este tipo, que no se entrena con preferencias humanas. La model card indica que la configuracion exacta de entrenamiento esta en el fichero `params.txt` del repositorio, y que el codigo de entrenamiento y evaluacion esta publicado en el repositorio de GitHub del proyecto.

## Capacidades

- Clasificacion de imagenes zero-shot: emparejamiento de imagenes con etiquetas textuales en los ocho idiomas declarados, sin ajuste fino previo.
- Recuperacion imagen-texto y texto-imagen (retrieval) mediante similitud coseno en el espacio de embedding compartido.
- Generacion de embeddings multimodales de 512 dimensiones para indexacion y busqueda vectorial.
- Cobertura multilingue: ingles, indonesio, javanes, sundanés, malayo, tailandes, vietnamita y birmano, con enfasis en lenguas del sudeste asiatico habitualmente poco representadas en CLIP.
- Integracion con el ecosistema `open_clip` mediante `create_model_and_transforms` y `get_tokenizer` apuntando al Hub.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling ni capacidades de agente: es un modelo de representacion, no un modelo de lenguaje generativo.
- No se documentan capacidades de vision mas alla de la codificacion de imagen (sin deteccion, segmentacion ni OCR especificos).

## Casos de uso

Advertencia previa: dado que los resultados publicados de este checkpoint son practicamente aleatorios, los casos de uso siguientes describen para que sirve la arquitectura y el pipeline, pero en la practica deberia utilizarse el modelo principal (sea-clip-tiny) para cualquier aplicacion real. Este checkpoint solo es adecuado para reproducir la tabla de ablacion del articulo.

- Reproduccion de experimentos de ablacion: cargar el checkpoint con `open_clip` y evaluar R@1 sobre los splits de CG, WIT y Bloom para verificar la fila correspondiente del articulo, usando `params.txt` como configuracion exacta.
- Clasificacion zero-shot de imagenes con etiquetas en lenguas del sudeste asiatico: por ejemplo, etiquetar fotos de producto con categorias en indonesio o tailandes sin entrenar un clasificador especifico, aprovechando que el texto se tokeniza en el idioma nativo.
- Busqueda semantica de imagenes en catalogos multilingues: generar embeddings de 512 dimensiones para cada imagen y cada consulta textual, e indexarlos en una base vectorial para recuperacion por similitud coseno.
- Curacion y filtrado de datasets multimodales: usar el modelo como filtro de calidad o de alineacion imagen-texto en pipelines de limpieza, descartando pares con baja similitud.
- Moderacion de contenido asistida por texto: comparar imagenes contra un conjunto de descripciones etiquetadas en varios idiomas para clasificar contenido sensible en mercados del sudeste asiatico.
- Investigacion sobre multilingüismo en CLIP: analizar como varia la calidad del embedding al cambiar la mezcla de datos de entrenamiento, comparando este checkpoint con el modelo principal y con el profesor MetaCLIP2.
- Evaluacion de destilacion: estudiar la transferencia desde MetaCLIP2-ViT-B-16-worldwide a una torre tiny de 46 M de parametros bajo una unica fuente de datos.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la propia model card: R@1 en recuperacion sobre los splits reservados de cada fuente de entrenamiento, exactitud zero-shot en ImageNet y el Avg@1 de recuperacion del articulo sobre XM3600, Flickr30k-200 y XTD-200 (en porcentaje).

| Metrica | Valor |
|---|---|
| CG R@1 | 0,0 |
| WIT R@1 | 0,0 |
| Bloom R@1 | 0,8 |
| ImageNet (zero-shot) | 0,5 |
| R@1-Avg (XM3600 + Flickr30k-200 + XTD-200) | 0,5 |

No se han publicado en la informacion disponible resultados comparativos del modelo principal ni de MetaCLIP2 sobre las mismas metricas, por lo que no es posible establecer una tabla comparativa cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en FP32 (46,11 M de parametros), unos 0,1 GB en FP16 y menos de 0,05 GB en INT8. El repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el modelo esta pensado para ejecutarse incluso en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo, incluidas integradas y aceleradores de borde (Jetson, Apple Silicon, telefonos de gama alta via ONNX).
- Opciones de despliegue: `open_clip` (via `hf-hub:fassabilf/sea-clip-tiny-abl-mammoth`), exportacion a ONNX y TorchScript para inferencia en produccion, y servidores de embeddings propios. No aplican vLLM, TGI ni llama.cpp, ya que no es un modelo de lenguaje generativo ni un GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Idiomas del sudeste asiatico | Licencia | Estado |
|---|---|---|---|---|---|
| sea-clip-tiny-abl-mammoth (este) | 46,11 M | 77 tokens | si (id, jv, su, ms, th, vi, my) | MIT | checkpoint de ablacion, resultados degenerados |
| fassabilf/sea-clip-tiny (modelo principal) | misma arquitectura (no se detalla en la informacion disponible) | 77 tokens | si (mismos idiomas) | MIT | modelo de referencia del articulo |
| MetaCLIP2-ViT-B-16-worldwide (profesor) | no disponible | no disponible | no disponible (declarado como worldwide) | no disponible | modelo maestro usado para destilacion |
| CLIP ViT-B/16 original | no disponible | no disponible | no especificamente cubiertas | no disponible | referencia general de CLIP |

No se dispone de cifras de rendimiento comparables entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, cobertura idiomatica y licencia.

## Limitaciones y advertencias

- Rendimiento degenerado: los valores publicados (0,0 en CG y WIT, 0,5 en ImageNet) indican que el modelo no aprende una alineacion imagen-texto util cuando se entrena solo con Mammoth-VL-SEA. No es apto para produccion.
- Artefacto de investigacion: la propia model card lo describe como una fila de la tabla de ablacion, no como un modelo publicable para uso general.
- Confusion con el modelo principal: comparte nombre y arquitectura con sea-clip-tiny, lo que puede llevar a desplegar por error el checkpoint equivocado en un pipeline.
- Ventana de texto muy corta: 77 tokens impiden usar descripciones largas o prompts detallados, limitando la precision en clasificacion compleja.
- Cobertura idiomatica desigual: la lista incluye birmano, javanes y sundanés, lenguas con poca presencia en corpus web, por lo que el sesgo y la varianza en estos idiomas seran mayores.
- Sesgos: no se documenta analisis de sesgos de genero, raza o geografia; al derivar de datos web y de un profesor tipo worldwide, es probable que herede sesgos de representacion, especialmente en imagenes de paises del sudeste asiatico subrepresentados.
- Alucinacion: al ser un modelo contrastivo no genera texto, pero puede asignar alta similitud a pares imagen-texto incorrectos, lo que se traduce en falsos positivos en clasificacion y recuperacion.
- Licencia: MIT, permisiva para uso comercial y modificacion, sin obligaciones de atribucion mas alla de conservar el aviso de copyright. La licencia no compensa el mal rendimiento del checkpoint.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Idiomas no cubiertos: no se declara soporte para castellano ni para otras lenguas europeas fuera del ingles, por lo que no es adecuado para aplicaciones en espanol.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny-abl-mammoth
- Modelo principal: https://huggingface.co/fassabilf/sea-clip-tiny
- Codigo de entrenamiento y evaluacion: https://github.com/fassabilf/sea-clip-tiny
- Articulo: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV), 2026
- Los resultados de la busqueda web no aportaron enlaces relevantes: todas las entradas devueltas correspondian a paginas de soporte y blogs de Microsoft sin relacion con el modelo.
