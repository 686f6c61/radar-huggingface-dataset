# mbruton/LegibilisCorpus-models

## Resumen

LegibilisCorpus-models es un conjunto de modelos de reconocimiento de texto manuscrito histórico (HTR, por sus siglas en inglés) entrenados para transcribir documentos de los siglos XIX y XX en sueco y noruego, así como cartularios en latín medieval y francés antiguo de los siglos XII al XIV. Los desarrolla Micaella Bruton y colaboradores, y se presentan en el 8th International Workshop on Historical Document Imaging and Processing (HIP'26), asociado a ICDAR 2026. El repositorio contiene checkpoints nativos de dos pipelines HTR ampliamente utilizados, Loghi y Kraken, y está pensado para reproducir los experimentos de transferencia interlingüística descritos en el artículo asociado.

La relevancia de este lanzamiento radica en que aborda un problema poco estudiado: la transferencia de modelos HTR entre lenguas históricas con diferente grado de similitud. En lugar de un único modelo monolingüe, se ofrecen 32 variantes por pipeline (aunque solo 30 convergieron), incluyendo modelos base, fine-tuned y de bajos recursos. Esto permite a investigadores y desarrolladores evaluar el comportamiento de la transferencia cero disparo, el fine-tuning y el entrenamiento con datos reducidos en un dominio donde los datos anotados son escasos y costosos de producir.

El repositorio tiene un tamaño de 2.0 GB y se distribuye bajo licencia MIT. No se especifican arquitecturas concretas, número de parámetros ni longitudes de contexto, ya que estos dependen de la implementación interna de cada pipeline. Los modelos se ofrecen como checkpoints comprimidos en formato .zip, listos para cargar en Loghi o Kraken.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (depende del pipeline Loghi/Kraken; tipicamente CNN+RNN+CTC) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesamiento por lineas de imagen) |
| Tipos de cuantizacion | no disponible (checkpoints nativos, sin cuantizacion publicada) |
| Idiomas soportados | sueco, noruego (bokmal), latin medieval, frances antiguo |
| Licencia | MIT |
| Formato de pesos | checkpoints .zip para Loghi y Kraken (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se publican detalles arquitectonicos internos en la model card. Los pipelines Loghi y Kraken son sistemas HTR de codigo abierto que combinan redes neuronales convolucionales para extraccion de caracteristicas, capas recurrentes (tipicamente LSTM) para modelado secuencial y decodificacion por conexionista temporal (CTC). Los modelos se entrenaron desde cero sobre tres conjuntos de datos historicos: Riksarkivet (sueco), NorHand v3 (noruego bokmal) y HOME-Alcar (latin medieval y frances antiguo). El estudio sigue un diseno completamente cruzado: cada modelo base se entrena en un corpus y luego se ajusta finamente en los otros dos, generando seis variantes fine-tuned por pipeline. Ademas, se entrenaron modelos de bajos recursos con 5.000 y 15.000 lineas, tanto por idioma como con datos multilingues agrupados.

El entrenamiento se realizo hasta convergencia, aunque dos de los 32 modelos por pipeline no convergieron; para esos casos se retuvo el checkpoint con menor perdida y mayor precision. No se menciona el uso de tecnicas como RLHF o DPO, ya que no son aplicables a HTR. Tampoco se detalla el numero total de tokens ni la composicion exacta de los datasets, pero se remite al articulo del paper para esos datos.

## Capacidades

- Reconocimiento de texto manuscrito en imagenes de documentos historicos, especificamente lineas de texto extraidas de paginas.
- Soporte de transferencia entre lenguas: los modelos base pueden aplicarse a otros idiomas sin fine-tuning, aunque con rendimiento variable segun la similitud linguistica.
- Fine-tuning sobre nuevos dominios o idiomas utilizando los pipelines Loghi y Kraken.
- Entrenamiento con recursos limitados: los modelos de bajos recursos demuestran viabilidad con 5.000 o 15.000 lineas anotadas.
- Compatibilidad con dos pipelines HTR estandar, lo que facilita la integracion en flujos de trabajo existentes.
- No incluye capacidades de generacion de lenguaje, tool calling, agentes ni procesamiento multimodal mas alla de la entrada de imagenes de lineas de texto.

## Casos de uso

- Digitalizacion de archivos historicos suecos y noruegos: transcripcion automatica de documentos administrativos y personales de los siglos XIX y XX, como censos, actas y correspondencia, para su busqueda y analisis.
- Estudio de cartularios medievales: transcripcion de colecciones de documentos latinos y franceses antiguos de los siglos XII al XIV, facilitando la investigacion historica y filologica.
- Evaluacion de transferencia interlinguistica en HTR: uso de los modelos base para probar la capacidad de reconocer escritura en un idioma no visto durante el entrenamiento, util para lenguas con pocos datos anotados.
- Fine-tuning sobre colecciones locales: investigadores con archivos propios pueden ajustar los modelos base con unas pocas miles de lineas para adaptarlos a su dominio especifico, reduciendo el coste de anotacion.
- Reproduccion de experimentos academicos: los checkpoints permiten replicar los resultados del paper HIP'26, sirviendo como referencia para comparar nuevas tecnicas de transferencia o regularizacion.
- Desarrollo de pipelines HTR multilingues: integracion de estos modelos en sistemas mas amplios que combinen deteccion de regiones, segmentacion de lineas y reconocimiento, para procesar colecciones heterogeneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de precision, error por caracter ni comparaciones con otros modelos. Se remite al articulo del paper para los resultados detallados, que aun no estan disponibles en el repositorio.

## Requisitos de hardware

- No se especifican requisitos minimos de VRAM ni GPU en la informacion proporcionada.
- Los pipelines Loghi y Kraken pueden ejecutarse en CPU para inferencia, aunque el entrenamiento y el fine-tuning se benefician de GPU con al menos 8 GB de VRAM (tipicamente NVIDIA GTX 1080 o superior).
- Para procesar grandes volumenes de imagenes, se recomienda una GPU con 12-16 GB de VRAM (por ejemplo, RTX 3080, RTX 4090) para acelerar la inferencia.
- El despliegue se realiza mediante los propios pipelines: Loghi (basado en Keras/TensorFlow) y Kraken (basado en PyTorch). No hay soporte directo para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- La latencia depende del tamano de la imagen y de la longitud de la linea; en una GPU moderna, el reconocimiento de una linea suele tardar decenas de milisegundos, pero no se ofrecen cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos HTR comparables en el mismo repositorio o en la busqueda web. Existen otros sistemas HTR como Tesseract (con modulo de HTR), Transkribus o modelos basados en TrOCR, pero no se han encontrado datos que permitan una comparacion directa en terminos de rendimiento o arquitectura. Por tanto, esta seccion queda como no disponible.

## Limitaciones y advertencias

- Los modelos estan entrenados exclusivamente en dominios muy concretos: documentos administrativos y personales suecos y noruegos de los siglos XIX-XX, y cartularios latinos/franceses antiguos de los siglos XII-XIV. No deben aplicarse a otros idiomas, epocas o tipos de escritura sin un fine-tuning previo.
- La calidad del reconocimiento puede degradarse significativamente en escritura degradada, manchas, tinta desvanecida o variaciones caligraficas no representadas en los corpus de entrenamiento.
- No se garantiza la ausencia de errores de transcripcion; para uso en investigacion historica, se recomienda una revision humana de los resultados.
- Los checkpoints no convergidos (2 de 32 por pipeline) pueden tener un rendimiento inferior; se debe consultar el paper para identificar cuales son.
- La licencia MIT permite uso comercial, pero los datos subyacentes (Riksarkivet, NorHand, HOME-Alcar) pueden tener sus propias restricciones de uso; es responsabilidad del usuario verificar las licencias de los datasets.
- No se proporcionan modelos cuantizados ni formatos optimizados para despliegue en produccion; el uso esta orientado a investigacion y reproducibilidad.

## Enlaces

- Repositorio de modelos: https://huggingface.co/mbruton/LegibilisCorpus-models
- Dataset asociado: https://huggingface.co/datasets/mbruton/LegibilisCorpus
- Codigo y scripts de experimentos: https://github.com/mbruton0426/historical-htr-LegibilisCorpus
- Pipeline Loghi: https://github.com/knaw-huc/loghi
- Pipeline Kraken: https://kraken.re/
