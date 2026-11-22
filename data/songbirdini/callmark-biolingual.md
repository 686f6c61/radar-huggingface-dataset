# songbirdini/callmark-biolingual

## Resumen

CallMark BioLingual es un conjunto de pesos derivados del modelo BioLingual, publicado por el usuario songbirdini en Hugging Face como material de reproducibilidad del articulo CallMark. No se trata de un modelo de lenguaje generativo, sino de un modelo de audio orientado a bioacustica: identificacion de vocalizaciones de fauna a partir de audio. Los pesos se distribuyen en tres variantes (`train_50.pt`, `train_100.pt` y `train_500.pt`), donde el numero indica la cantidad de vocalizaciones de entrenamiento por taxon.

El modelo parte de `davidrrobinson/BioLingual`, un encoder de audio-al texto preentrenado con pares audio-descripcion, que aqui se ha ajustado fino para la tarea de identificacion. La relevancia actual es acotada: sirve para replicar los resultados del paper CallMark y para experimentar con clasificacion bioacustica de pocos ejemplos, no como modelo de proposito general. El repositorio ocupa 1,8 GB y no incluye pipeline declarado, licencia explicita ni idiomas.

La informacion publicada es muy escasa: la model card se limita a indicar el origen, el procedimiento de descarga y que se aplican los terminos de la release original de BioLingual. Cualquier dato no cubierto aqui se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de `davidrrobinson/BioLingual`, encoder de audio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se remite a los terminos de `davidrrobinson/BioLingual`) |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible. Por procedencia, se trata de un ajuste fino de BioLingual (`davidrrobinson/BioLingual`), un modelo que aprende representaciones conjuntas de audio y texto. El ajuste se orienta a identificacion de taxones a partir de vocalizaciones, con tres regimenes de datos: 50, 100 y 500 vocalizaciones de entrenamiento por taxon.

No se especifican el numero de tokens o horas de audio de entrenamiento, la composicion del dataset, ni si hubo tecnicas de alineacion o refuerzo. Tampoco se documentan innovaciones tecnicas adicionales. El unico detalle operativo es que los pesos se colocan en las rutas que esperan los scripts de prediccion del repositorio `marisbasha/callmark_reproducibility`.

## Capacidades

- Identificacion de vocalizaciones de fauna: clasifica audio de llamadas animales en taxones, segun el ajuste fino realizado.
- Aprendizaje con pocos ejemplos: las variantes de 50, 100 y 500 vocalizaciones por taxon permiten evaluar el rendimiento en regimenes de datos reducidos.
- Representaciones audio-texto: al derivar de BioLingual, hereda la capacidad de alinear audio con descripciones textuales, aunque el ajuste se centra en identificacion.
- Reproducibilidad de investigacion: permite replicar los experimentos del paper CallMark.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio generativo, thinking mode): no disponibles.

## Casos de uso

- Replicacion de resultados academicos: cargar los pesos `train_50.pt`, `train_100.pt` y `train_500.pt` con los scripts del repositorio CallMark para verificar las cifras del paper en un entorno propio.
- Monitorizacion de biodiversidad: usar el modelo para etiquetar grabaciones de campo y estimar presencia de taxones en un area, aprovechando su entrenamiento especifico en vocalizaciones.
- Estudio de aprendizaje con pocos datos: comparar las tres variantes para medir cuanto mejora la identificacion al pasar de 50 a 500 ejemplos por taxon, informando decisiones de etiquetado.
- Filtrado de grandes archivos de audio: preprocesar horas de grabaciones de sensores pasivos para descartar segmentos sin llamadas relevantes antes de una revision manual.
- Docencia en bioacustica computacional: emplear el modelo y su repositorio como ejemplo practico de ajuste fino de un encoder audio-texto sobre datos ecologicos.
- Linea base en nuevos proyectos: usar los pesos como referencia inicial antes de entrenar un clasificador propio con datos de otra region o grupo taxonomico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 1,8 GB, por lo que cada variante de pesos es previsiblemente manejable en GPU de consumo, aunque no se confirma el tamano individual.
- GPU recomendadas: no disponibles. Por el tamano del repositorio, es probable que quepa en GPUs de consumo (RTX 3060 o superiores), pero es una estimacion no verificada.
- Compatibilidad con GPU de consumo: probable, sin datos oficiales.
- Opciones de despliegue: inferencia mediante PyTorch con los scripts del repositorio `marisbasha/callmark_reproducibility`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CallMark BioLingual | Encoder de audio ajustado | no disponible | no aplica | no disponible | Hugging Face (`.pt`) |
| `davidrrobinson/BioLingual` | Encoder audio-texto base | no disponible | no aplica | terminos de la release original | Hugging Face |
| Alternativas bioacusticas (BirdNET, Perch) | Clasificadores de audio | no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion muy limitada: no hay pipeline, licencia, idiomas ni especificaciones tecnicas declaradas en la model card.
- Licencia ambigua: se remite a los terminos de `davidrrobinson/BioLingual`, sin aclarar condiciones de uso comercial; conviene revisar esa release antes de cualquier despliegue productivo.
- Ambito restringido: esta disenado para identificacion de vocalizaciones en el marco del paper CallMark; no es un modelo de proposito general.
- Riesgo de sesgo taxonomico y geografico: el rendimiento depende de los taxones y las condiciones de grabacion presentes en los datos de entrenamiento, no documentados.
- Riesgo de falsos positivos y negativos en audio ruidoso: no hay datos publicados sobre robustez ante ruido ambiental.
- Sin garantias de mantenimiento: repositorio con 0 descargas y una unica actualizacion, lo que sugiere escaso soporte de la comunidad.
- Formato `.pt` especifico de PyTorch: requiere el codigo del repositorio para su carga, sin conversiones documentadas a otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songbirdini/callmark-biolingual
- Repositorio de reproducibilidad CallMark: https://github.com/marisbasha/callmark_reproducibility
- Modelo base BioLingual: https://huggingface.co/davidrrobinson/BioLingual
