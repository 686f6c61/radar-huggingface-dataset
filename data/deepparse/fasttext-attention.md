# deepparse/fasttext-attention

## Resumen
El modelo `deepparse/fasttext-attention` es un parser de direcciones postales desarrollado por el equipo de deepparse (GRAAL-Research), una libreria de Python especializada en el troceado y etiquetado de direcciones. Se trata de un modelo Seq2Seq con encoder y decoder LSTM de una capa, tamano oculto de 1024, y un mecanismo de atencion, que utiliza embeddings de palabras fastText de 300 dimensiones entrenados sobre Common Crawl en frances (incluyendo n-gramas de caracteres). El objetivo del modelo es segmentar una direccion en sus componentes semanticos (numero de calle, nombre de calle, unidad, municipio, provincia, codigo postal, orientacion y entrega general) y asignarles una etiqueta.

El modelo es relevante porque aborda el problema del parsing de direcciones multinacional con un enfoque de subword embeddings que permite generalizar a paises no vistos durante el entrenamiento. Con solo 15,9 millones de parametros y un tamano de repositorio de 0,1 GB, es un modelo ligero y facil de desplegar en entornos con recursos limitados. Fue entrenado en 2020 sobre direcciones de 20 paises construidas a partir de datos de libpostal, y se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integracion en pipelines de datos.

El modelo forma parte del ecosistema de deepparse, una libreria que expone una API sencilla (`AddressParser`) para integrar el parser en aplicaciones Python. Su principal valor reside en la capacidad de generalizacion zero-shot a 41 paises con una precision media por pais del 87,83%, aunque con un rendimiento mas debil en direcciones incompletas, como se detalla en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq con encoder y decoder LSTM de una capa, tamano oculto 1024, mecanismo de atencion |
| Parametros totales | 15.941.641 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con embeddings fastText en frances, evaluado en 20 paises de entrenamiento y 41 en zero-shot) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (pytorch_model_hub_mixin) |

## Arquitectura y entrenamiento
La arquitectura es un modelo Seq2Seq compuesto por un encoder LSTM de una sola capa y un decoder LSTM de una sola capa, ambos con un tamano oculto de 1024. La entrada se representa mediante embeddings fastText de 300 dimensiones preentrenados sobre Common Crawl en frances (`cc.fr.300.bin`), que incluyen n-gramas de caracteres para capturar morfologia y variaciones ortograficas. El decoder incorpora un mecanismo de atencion que le permite alinear cada token de salida con las posiciones relevantes de la direccion de entrada. El modelo predice 8 etiquetas (`StreetNumber`, `StreetName`, `Unit`, `Municipality`, `Province`, `PostalCode`, `Orientation` y `GeneralDelivery`) mas la etiqueta de fin de secuencia.

El entrenamiento se realizo en 2020 sobre el dataset descrito en el repositorio `deepparse-address-data`, que contiene direcciones de 20 paises construidas a partir de datos de libpostal. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni sobre el uso de tecnicas de RLHF o DPO. La innovacion tecnica principal es el uso de subword embeddings (n-gramas de caracteres de fastText) para mejorar la generalizacion multinacional, tal como se describe en los papers `Leveraging Subword Embeddings for Multinational Address Parsing` (arXiv:2006.16152) y `Multinational Address Parsing: A Zero-Shot Evaluation` (arXiv:2112.04008).

## Capacidades
- Segmentacion y etiquetado de direcciones postales en 8 categorias semanticas mas el fin de secuencia.
- Generalizacion zero-shot a paises no vistos durante el entrenamiento, con una precision media por pais del 87,83% en 41 paises.
- Procesamiento de direcciones en multiples idiomas y formatos, aunque el modelo se entrena con embeddings en frances y datos de 20 paises.
- Integracion sencilla mediante la libreria deepparse con la clase `AddressParser`.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-step, vision, audio ni modo thinking.
- No se ha documentado soporte multilingue explicito mas alla de la evaluacion en 41 paises.

## Casos de uso
- Normalizacion de direcciones en bases de datos: el modelo puede tomar direcciones en texto libre y descomponerlas en campos estructurados (calle, numero, municipio, codigo postal), lo que facilita la deduplicacion y el enriquecimiento de registros en un CRM o en un sistema de gestion de clientes.
- Validacion de direcciones en formularios de comercio electronico: al parsear la direccion introducida por el usuario, se pueden detectar campos faltantes o mal ubicados antes de enviar el pedido a un servicio de envio, reduciendo errores de entrega.
- Geocodificacion previa: al separar los componentes de la direccion, se pueden enviar los campos correctos a un geocodificador (por ejemplo, Nominatim o Google Maps) y mejorar la precision de las coordenadas obtenidas.
- Limpieza de datos en proyectos de ciencia de datos: el parser permite estandarizar direcciones de multiples paises en un esquema comun, lo que simplifica el analisis y la agregacion de datos geograficos.
- Integracion en pipelines de logistica: el modelo puede procesar direcciones de envio en tiempo real para extraer el codigo postal y el municipio, y asi enrutar paquetes o calcular tarifas de envio.
- Enriquecimiento de datos abiertos: al parsear direcciones de registros publicos (por ejemplo, licencias o catastros), se pueden generar datasets estructurados para analisis urbano o estudios de movilidad.
- Procesamiento por lotes en entornos con recursos limitados: con 15,9 millones de parametros y un repositorio de 0,1 GB, el modelo puede ejecutarse en CPU para tareas de parsing masivo sin necesidad de GPU.

## Benchmarks y rendimiento
Los unicos datos de rendimiento publicados en la informacion disponible son los siguientes:

| Metrica | Resultado |
|---|---|
| Precision media por pais en 41 paises zero-shot | 87,83% (rango de 46,91% a 99,61%) |
| Mejora en los 20 paises de entrenamiento con atencion | ~0,5% |
| Precision por palabra en el split de test de worldwide-addresses (20 paises, 260.000 direcciones, medidas en noviembre de 2026) | 76,91% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las tablas por pais estan disponibles en la pagina de resultados de la documentacion de deepparse.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 15,9 millones de parametros, la inferencia puede ejecutarse en CPU sin problemas. En GPU, el uso de memoria es inferior a 1 GB en precision FP32.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, GTX 1050, RTX 2060, RTX 4090) puede ejecutar el modelo sin dificultad. Para lotes grandes, una GPU con al menos 4 GB de VRAM es suficiente.
- Cabe en cualquier GPU consumer y en la mayoria de entornos de CPU.
- Opciones de despliegue: la libreria deepparse es la via principal de despliegue. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI, ya que el modelo no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepparse/fasttext-attention | 15,9 M | no disponible | 87,83% precision media zero-shot en 41 paises; 76,91% precision por palabra en worldwide-addresses | MIT | Hugging Face, libreria deepparse |
| deepparse/fasttext (sin atencion) | no disponible | no disponible | no disponible | MIT | Hugging Face, libreria deepparse |
| libpostal | no disponible (basado en reglas y datos) | no disponible | no disponible | MIT | Repositorio openvenues/libpostal |

No se dispone de datos de benchmarks comparativos con otros modelos de parsing de direcciones en la informacion proporcionada. La comparativa se limita a las alternativas del mismo ecosistema deepparse y a libpostal, que es la fuente de datos de entrenamiento.

## Limitaciones y advertencias
- El modelo es mas debil en direcciones incompletas (por ejemplo, solo un codigo postal o solo un municipio) que en direcciones completas, con una precision por palabra del 76,91% en el split de test de worldwide-addresses.
- En la practica, rara vez predice las etiquetas `Orientation` y `GeneralDelivery`: en noviembre de 2026 no predijo ninguna de las dos en 12.000 direcciones del split de test de worldwide-addresses.
- El modelo fue entrenado con embeddings fastText en frances, lo que puede introducir sesgos linguisticos en direcciones de otros idiomas.
- No se dispone de informacion sobre sesgos demograficos o geograficos especificos, pero al entrenarse con datos de 20 paises, puede tener un rendimiento desigual en paises con formatos de direccion muy diferentes.
- Riesgo de alucinacion: al ser un modelo Seq2Seq de etiquetado, puede asignar etiquetas incorrectas a tokens ambiguos, especialmente en direcciones con formatos no vistos.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda validar el rendimiento en el dominio especifico antes de desplegarlo en produccion.
- No se ha documentado soporte para cuantizacion, lo que limita las opciones de optimizacion en entornos con restricciones de memoria.

## Enlaces
- [Hugging Face: deepparse/fasttext-attention](https://huggingface.co/deepparse/fasttext-attention)
- [Documentacion de deepparse](https://deepparse.org)
- [Pagina de resultados de deepparse](https://deepparse.org/results.html)
- [Paper: Leveraging Subword Embeddings for Multinational Address Parsing (arXiv:2006.16152)](https://arxiv.org/abs/2006.16152)
- [Paper: Multinational Address Parsing: A Zero-Shot Evaluation (arXiv:2112.04008)](https://arxiv.org/abs/2112.04008)
- [Repositorio de datos de entrenamiento: deepparse-address-data](https://github.com/GRAAL-Research/deepparse-address-data)
- [Dataset worldwide-addresses](https://huggingface.co/datasets/deepparse/worldwide-addresses)
- [fastText](https://fasttext.cc/)
- [libpostal](https://github.com/openvenues/libpostal)
