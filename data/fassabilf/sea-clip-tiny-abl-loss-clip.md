# fassabilf/sea-clip-tiny-abl-loss-clip

## Resumen

SEA-CLIP-Tiny (ablación "only CLIP") es un modelo de embeddings texto-imagen de tipo CLIP entrenado especificamente para lenguas del sudeste asiatico. Lo desarrolla el usuario fassabilf y forma parte del trabajo *SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages*, aceptado en ACCV 2026. Se trata de una de las filas de la tabla de ablación del modelo principal: comparte arquitectura, pipeline y hiperparametros con [sea-clip-tiny](https://huggingface.co/fassabilf/sea-clip-tiny), pero cambia el objetivo de destilacion, usando unicamente perdida contrastiva, sin termino de destilacion.

El modelo resuelve el problema de la escasez de encoders vision-lenguaje multilingues para idiomas del sudeste asiatico, con soporte declarado para ingles, indonesio, javanes, sundanés, malayo, tailandes, vietnamita y birmano. Su tamano es muy reducido: 46,11 M de parametros (5,62 M en la torre de vision y 40,49 M en la torre de texto), lo que lo hace desplegable en hardware muy modesto, incluso en CPU.

Es relevante ahora porque es un checkpoint de investigacion que documenta de forma explicita el efecto de eliminar la destilacion del profesor MetaCLIP2-ViT-B-16-worldwide. Su rendimiento es claramente inferior al del modelo principal, por lo que su interes es reproducibilidad y analisis de ablaciones, no produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de doble torre: vision ViT-T/16 + torre de texto de 12 capas y 384 de ancho, dimension de embedding 512 |
| Parametros totales | 46,11 M (5,62 M vision + 40,49 M texto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens (tokenizer CLIP BPE, vocabulario 49408) |
| Tipos de cuantizacion | no disponible (el autor no publica cuantizaciones; al ser un modelo de 46 M de parametros, fp32 ocupa unos 184 MB, fp16 unos 92 MB e int8 unos 46 MB) |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | pesos de Hugging Face cargables con `open_clip` via `hf-hub` (tamano del repo 0,2 GB); no se listan GGUF ni ONNX en la informacion disponible |

## Arquitectura y entrenamiento

La arquitectura es un CLIP clasico de dos torres. La torre de vision es un ViT-T/16 (Vision Transformer tiny con parches de 16x16) y la torre de texto tiene 12 capas con anchura 384, ambas proyectando a un espacio comun de 512 dimensiones. El tokenizer es el BPE de CLIP con vocabulario de 49408 entradas y una ventana de contexto de 77 tokens, por lo que solo procesa textos cortos (titulos, frases, etiquetas).

El entrenamiento usa 12,72 millones de pares imagen-texto procedentes de CC12M, CulturalGround-OE-filt, WIT, Bloom y Mammoth-VL-SEA. Este checkpoint concreto se distingue por su objetivo de perdida: solo termino contrastivo, sin la componente de destilacion desde el profesor MetaCLIP2-ViT-B-16-worldwide que si emplea el modelo principal. La configuracion exacta de entrenamiento esta en el fichero `params.txt` del repositorio.

## Capacidades

- Clasificacion de imagenes zero-shot mediante comparacion de similitud entre embeddings de imagen y de texto.
- Recuperacion (retrieval) texto-imagen e imagen-texto en los ocho idiomas declarados.
- Embeddings multimodales alineados de 512 dimensiones, utiles como extractor de caracteristicas para tareas posteriores.
- Cobertura multilingue centrada en el sudeste asiatico: ingles, indonesio, javanes, sundanés, malayo, tailandes, vietnamita y birmano.
- Integracion con el ecosistema `open_clip` para carga, preprocesado y tokenizacion.
- No dispone de generacion de texto, tool calling, function calling, capacidades de agente, vision generativa, audio ni modo de razonamiento: es exclusivamente un modelo de representacion.

## Casos de uso

- Clasificacion zero-shot de catalogos de producto: asignar categorias a imagenes sin entrenar un clasificador especifico, definiendo las etiquetas como texto en indonesio, malayo o tailandes.
- Moderacion de contenido visual ligera: puntuar imagenes contra prompts de texto de politica de uso en varios idiomas del sudeste asiatico, con un coste de computo minimo.
- Busqueda multimodal en archivos fotograficos: indexar un corpus de imagenes con embeddings de 512 dimensiones y recuperarlas mediante consultas de texto en idiomas locales.
- Filtrado y curaduria de datasets: calcular similitud imagen-texto para descartar pares mal alineados en corpus recolectados de la web a gran escala.
- Analisis de ablaciones y docencia: servir de punto de comparacion controlado frente al modelo principal para medir el efecto del termino de destilacion en el mismo pipeline.
- Despliegue en dispositivos con recursos muy limitados: con 46 M de parametros, puede ejecutarse en CPU, en una Raspberry Pi o en GPUs integradas para etiquetado por lotes sin GPU dedicada.
- Preanotacion en herramientas de etiquetado humano: generar etiquetas candidatas zero-shot sobre imagenes nuevas para que anotadores las revisen en lugar de partir de cero.

## Benchmarks y rendimiento

Resultados publicados en la model card: recuperacion R@1 en las particiones de validacion de cada fuente de entrenamiento, exactitud zero-shot en ImageNet y media R@1 sobre XM3600, Flickr30k-200 y XTD-200 (%).

| CG R@1 | WIT R@1 | Bloom R@1 | ImageNet | R@1-Avg |
|---|---|---|---|---|
| 39,1 | 26,1 | 15,6 | 31,4 | 7,3 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos mismos benchmarks, ni curvas frente al modelo principal o frente a otras ablaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: entorno a 184 MB en fp32, unos 92 MB en fp16 y unos 46 MB en int8, sin contar activaciones ni el pipeline de preprocesado de imagen.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una GPU integrada lo ejecutan sobradamente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: `open_clip` con `create_model_and_transforms('hf-hub:fassabilf/sea-clip-tiny-abl-loss-clip')`, que es la via documentada por el autor. Otras opciones (ONNX Runtime, TensorRT, contenedores de inferencia) no estan documentadas en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sea-clip-tiny-abl-loss-clip (este) | 46,11 M | 77 tokens | MIT | Hugging Face, `open_clip` | Ablacion sin termino de destilacion |
| [sea-clip-tiny](https://huggingface.co/fassabilf/sea-clip-tiny) (modelo principal) | no disponible en la informacion proporcionada | 77 tokens (misma arquitectura declarada) | MIT | Hugging Face, `open_clip` | Misma arquitectura y pipeline, con perdida contrastiva mas destilacion |
| MetaCLIP2-ViT-B-16-worldwide (profesor) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Usado como profesor en el entrenamiento |
| Otros CLIP multilingues de tamano tiny | no disponible | no disponible | no disponible | no disponible | No se aportan datos de comparacion en la informacion disponible |

No se dispone de cifras de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint de ablacion, no el modelo final: al eliminar el termino de destilacion, su rendimiento es notablemente inferior al del modelo principal (R@1-Avg de 7,3 en la media de recuperacion declarada).
- No genera texto ni mantiene conversaciones: solo produce embeddings y puntuaciones de similitud, por lo que no es adecuado para tareas generativas ni de agente.
- Ventana de contexto de 77 tokens: no admite descripciones largas, documentos ni dialogos multi-turno.
- Cobertura idiomatica limitada a los ocho idiomas declarados; el rendimiento fuera de ese conjunto no esta documentado.
- Riesgo de sesgos: los datos de entrenamiento (CC12M, WIT y corpus web) arrastran sesgos de representacion cultural y geografica. No se documenta ninguna evaluacion de sesgos en la informacion disponible.
- La alineacion imagen-texto puede fallar en dominios alejados de los datos de entrenamiento; no se documentan evaluaciones de robustez ni de calibracion.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales declaradas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe validacion independiente de la comunidad.
- Fecha de creacion declarada en el repositorio: 21 de septiembre de 2026, coincidiendo con la publicacion en ACCV 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fassabilf/sea-clip-tiny-abl-loss-clip
- Modelo principal (SEA-CLIP-Tiny): https://huggingface.co/fassabilf/sea-clip-tiny
- Codigo de entrenamiento y evaluacion: https://github.com/fassabilf/sea-clip-tiny
- Cita del trabajo: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV), 2026
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a documentacion sobre iconos de escritorio de Windows y no guardan relacion con el modelo.
