# deepparse/fasttext-base

## Resumen

deepparse/fasttext-base es un modelo de parsing de direcciones postales desarrollado por el grupo de investigacion GRAAL de la Universite Laval (publicado bajo el nombre de organizacion `deepparse`). No es un modelo de lenguaje generativo, sino un sistema Seq2Seq especializado que recibe una direccion en texto libre y etiqueta cada token con una de ocho categorias estructurales (numero de calle, nombre de calle, unidad, municipio, provincia, codigo postal, orientacion y entrega general). Resuelve el problema de normalizacion y estructuraccion de direcciones heterogeneas, una tarea critica en logistica, geocodificacion y validacion de datos.

Tecnicamente es un encoder-decoder LSTM de una sola capa con tamano oculto de 1.024, alimentado por embeddings fastText de 300 dimensiones entrenados sobre Common Crawl en frances (`cc.fr.300.bin`), incluyendo n-gramas de caracteres. El modelo completo tiene 9.647.113 parametros y se distribuye en formato safetensors a traves de la libreria `deepparse`. Su relevancia actual radica en que ofrece un rendimiento muy alto en el dominio acotado del parsing de direcciones con un coste computacional minimo, lo que lo hace desplegable en CPU y en entornos con recursos limitados.

El modelo fue entrenado en 2020 sobre el dataset `deepparse-address-data`, construido a partir de datos de libpostal y que cubre direcciones de 20 paises. Se publica con licencia MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq LSTM (encoder-decoder de una capa, sin atencion) |
| Parametros totales | 9.647.113 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa direcciones token a token; sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible como lista formal; los embeddings base son fastText frances (`cc.fr.300.bin`) y el entrenamiento cubre direcciones de 20 paises |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 3,5 GB; revision `light-embeddings` para la variante `fasttext-light`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Seq2Seq clasica sin mecanismo de atencion: un encoder LSTM de una capa con tamano oculto de 1.024 procesa la secuencia de tokens de la direccion, y un decoder LSTM del mismo tamano oculto genera la secuencia de etiquetas. La entrada se representa mediante embeddings fastText de 300 dimensiones preentrenados sobre Common Crawl en frances, que incorporan informacion subword mediante n-gramas de caracteres. Esta eleccion de embeddings subword es precisamente la innovacion que los autores destacan en el paper asociado: permite generalizar a idiomas y morfologias no vistas durante el entrenamiento. El vocabulario de salida consta de ocho etiquetas (`StreetNumber`, `StreetName`, `Unit`, `Municipality`, `Province`, `PostalCode`, `Orientation`, `GeneralDelivery`) mas el token de fin de secuencia.

El entrenamiento se realizo en 2020 sobre el dataset del repositorio `deepparse-address-data`, que contiene direcciones de 20 paises construidas a partir de los datos de libpostal. No se documenta en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo discriminativo de este tipo). Los resultados publicados en la model card indican un 99,51 % de precision media por pais en direcciones limpias de los 20 paises de entrenamiento, un 98,42 % en direcciones incompletas y un 83,46 % en 41 paises no vistos (zero-shot).

## Capacidades

- Etiquetado secuencial de direcciones postales: asigna a cada token una de las ocho etiquetas estructurales definidas.
- Parsing multinacional: entrenado con direcciones de 20 paises y evaluado en zero-shot sobre 41 paises adicionales.
- Generalizacion subword: los embeddings fastText con n-gramas de caracteres permiten manejar variaciones ortograficas y morfologias no vistas.
- Robustez ante direcciones incompletas: mantiene un 98,42 % de precision media cuando faltan componentes de la direccion.
- Integracion con la libreria `deepparse`: API de una sola llamada (`AddressParser(model_type="fasttext")`).
- Variante `fasttext-light`: mismos pesos con embeddings Magnitude Light para reducir el consumo de memoria.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto libre: es un modelo discriminativo de etiquetado, no un LLM.
- No dispone de capacidades de vision, audio ni modo thinking.

## Casos de uso

- Normalizacion de direcciones en pipelines ETL: el modelo convierte direcciones en texto libre procedentes de formularios, CRM o bases de datos legacy en campos estructurados (calle, numero, codigo postal), lo que permite deduplicar y validar registros antes de cargarlos en un data warehouse.
- Geocodificacion previa: al separar municipio, provincia y codigo postal, el modelo alimenta APIs de geocodificacion que requieren componentes estructurados en lugar de cadenas libres, mejorando la tasa de acierto de la geocodificacion.
- Validacion de direcciones en checkout de ecommerce: con 9,6 millones de parametros y ejecucion viable en CPU, puede integrarse en el flujo de compra para detectar direcciones mal formadas o incompletas antes de confirmar el pedido, con latencia muy baja.
- Enriquecimiento de datos de logistica: clasificar automaticamente componentes de direcciones de envio en 20 paises para enrutar paquetes y calcular zonas de reparto, aprovechando la precision del 99,51 % en direcciones limpias de paises de entrenamiento.
- Procesamiento de documentos escaneados con OCR: tras extraer el texto de facturas o albaranes, el parser separa la direccion del resto del contenido y la estructura en campos, reduciendo el trabajo manual de introduccion de datos.
- Investigacion en parsing multilingue: el modelo sirve como linea base reproducible (licencia MIT, pesos abiertos) para experimentos de zero-shot en 41 paises y para comparar con enfoques basados en transformers.
- Limpieza de bases de datos publicas: estructurar registros de direcciones en catalogos gubernamentales o inmobiliarios para facilitar busquedas por municipio o codigo postal.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision media por pais, 20 paises de entrenamiento, direcciones limpias | 99,51 % (rango 98,90 % - 99,97 %) |
| Precision media por pais, 20 paises de entrenamiento, direcciones incompletas | 98,42 % (rango 91,10 % - 99,55 %) |
| Precision media, 41 paises zero-shot | 83,46 % (rango 36,26 % - 96,02 %) |
| Precision por palabra, split de test de `worldwide-addresses` (260.000 direcciones, medido en noviembre de 2026) | 89,35 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 9,6 millones de parametros del modelo; el grueso del consumo proviene de los embeddings fastText de 300 dimensiones, que elevan el tamano del repo a 3,5 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) acelera la inferencia, pero no es necesaria.
- Cabe en CPU y en cualquier GPU consumer: el modelo esta disenado para ejecutarse en entornos sin acelerador.
- Opciones de despliegue: libreria `deepparse` (API Python), variante `fasttext-light` con Magnitude Light para reducir memoria. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por direccion en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepparse/fasttext-base | 9.647.113 | no disponible | Seq2Seq LSTM + fastText | MIT | HuggingFace (repo `deepparse`) |
| deepparse (variantes BiLSTM/transformer de la misma libreria) | no disponible | no disponible | Seq2Seq con atencion / transformer | MIT | HuggingFace (organizacion `deepparse`) |
| libpostal | no disponible | no disponible | parser estadistico basado en reglas y datos | MIT | GitHub (openvenues/libpostal) |

No se dispone en la informacion proporcionada de datos comparativos de rendimiento frente a estas alternativas; la model card solo ofrece las tablas por pais de la documentacion de deepparse.

## Limitaciones y advertencias

- Rendimiento degradado en direcciones incompletas: la precision por palabra cae al 89,35 % en el split de test de `worldwide-addresses` (noviembre de 2026), y el modelo es mas debil cuando solo recibe un codigo postal o un municipio aislado.
- Etiquetas infrautilizadas: en la practica casi nunca predice `Orientation` ni `GeneralDelivery`; en noviembre de 2026 no las predijo en 12.000 direcciones del split de test ni en casos tipicos como `Ouest`, `NW` o `PO Box`.
- Cobertura geografica limitada: el entrenamiento cubre 20 paises; el rendimiento zero-shot en 41 paises adicionales baja al 83,46 % de media, con un minimo del 36,26 % en el peor pais.
- Dependencia de embeddings franceses: los embeddings base son fastText `cc.fr.300.bin`, lo que puede introducir sesgos linguisticos en direcciones de otros idiomas aunque el modelo se entrene con datos multinacionales.
- Modelo de dominio estrecho: no genera texto, no razona y no admite instrucciones; cualquier uso fuera del etiquetado de direcciones requiere reentrenamiento.
- Riesgo de alucinacion de etiquetas: al ser un etiquetador secuencial, puede asignar etiquetas incorrectas en direcciones con formatos atipicos o con ruido de OCR.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, pero no se ofrece garantia alguna sobre la precision en produccion.
- Sin datos publicados sobre sesgos demograficos o geograficos especificos; la evaluacion por pais de la documentacion es el unico desglose disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepparse/fasttext-base
- Documentacion de deepparse: https://deepparse.org
- Pagina de resultados por pais: https://deepparse.org/results.html
- Paper "Leveraging Subword Embeddings for Multinational Address Parsing": https://arxiv.org/abs/2006.16152
- Paper "Multinational Address Parsing: A Zero-Shot Evaluation": https://arxiv.org/abs/2112.04008
- Dataset de entrenamiento: https://github.com/GRAAL-Research/deepparse-address-data
- Dataset worldwide-addresses: https://huggingface.co/datasets/deepparse/worldwide-addresses
- fastText: https://fasttext.cc/
- Magnitude Light: https://github.com/davebulaval/magnitude-light
- libpostal: https://github.com/openvenues/libpostal
