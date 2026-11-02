# deepparse/bpemb-attention

## Resumen

deepparse/bpemb-attention es un modelo de *parsing* de direcciones postales (address parsing) desarrollado por el equipo de deepparse (GRAAL-Research) y publicado en HuggingFace bajo licencia MIT. No es un modelo de lenguaje generativo, sino un sistema de etiquetado secuencial especializado que descompone una dirección en campos estructurados: número de calle, nombre de calle, unidad, municipio, provincia, código postal, orientación y entrega general. Con 17,5 millones de parámetros y un tamaño de repositorio de 0,1 GB, está pensado para integrarse como componente dentro de pipelines de normalización y geocodificación de direcciones.

Técnicamente es un modelo Seq2Seq con encoder y decoder LSTM de una capa, tamaño oculto 1024 y un mecanismo de atención, que utiliza los embeddings subword multilingües BPEmb (100 000 merges, 300 dimensiones) embebidos por palabra mediante una LSTM bidireccional. Fue entrenado en 2020 sobre el dataset de deepparse-address-data, construido a partir de datos de libpostal y que cubre direcciones de 20 países.

Su relevancia actual reside en que ofrece un enfoque multinacional y multilingüe para el parsing de direcciones con capacidad zero-shot sobre países no vistos en entrenamiento (86,00 % de precisión media por país en 41 países), lo que lo convierte en una alternativa ligera y de código abierto a soluciones propietarias de normalización de direcciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq LSTM (encoder y decoder de una capa) con mecanismo de atencion; embeddings subword BPEmb de 300 dimensiones embebidos por palabra con LSTM bidireccional |
| Parametros totales | 17.566.741 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo es lo suficientemente pequeno para ejecutarse en FP32) |
| Idiomas soportados | no disponible de forma explicita; los embeddings BPEmb son multilingues y el entrenamiento cubre direcciones de 20 paises |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria deepparse, con pytorch_model_hub_mixin) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Seq2Seq clásica para etiquetado de secuencias: un encoder LSTM de una sola capa con tamaño oculto de 1024 procesa la secuencia de entrada, construida a partir de embeddings subword BPEmb (100 000 merges, 300 dimensiones) que se combinan por palabra mediante una LSTM bidireccional. El decoder, también LSTM de una capa, genera la secuencia de etiquetas con un mecanismo de atención sobre las representaciones del encoder. El vocabulario de salida comprende 8 etiquetas (`StreetNumber`, `StreetName`, `Unit`, `Municipality`, `Province`, `PostalCode`, `Orientation`, `GeneralDelivery`) más la etiqueta de fin de secuencia.

El entrenamiento se realizó en 2020 sobre el dataset del repositorio deepparse-address-data, que contiene direcciones de 20 países construidas a partir de los datos de libpostal. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de este tipo). La innovación técnica principal es el uso de embeddings subword multilingües BPEmb para generalizar a países e idiomas no vistos, lo que habilita el rendimiento zero-shot reportado. El mecanismo de atención aporta una mejora de aproximadamente 0,5 % en precisión sobre los 20 países de entrenamiento.

## Capacidades

- Parsing de direcciones postales: descompone una dirección en 8 campos estructurados más el fin de secuencia.
- Etiquetado secuencial multinacional: entrenado con direcciones de 20 países.
- Generalización zero-shot: capacidad de parsear direcciones de países no vistos durante el entrenamiento (evaluado en 41 países).
- Soporte multilingüe implícito mediante embeddings subword BPEmb multilingües.
- Integración con la librería deepparse mediante `AddressParser(model_type="bpemb", attention_mechanism=True)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking: es un modelo especializado de etiquetado, no un LLM generativo.

## Casos de uso

- Normalización de direcciones en comercio electrónico: el modelo convierte direcciones introducidas libremente por el usuario en campos estructurados (calle, número, código postal, municipio) para validar y almacenar datos de envío de forma consistente.
- Geocodificación previa: al separar los componentes de una dirección, se facilita la consulta a servicios de geocodificación que requieren campos estructurados en lugar de texto libre.
- Limpieza de bases de datos de clientes: permite parsear grandes volúmenes de direcciones almacenadas como cadenas únicas y migrarlas a un esquema relacional con columnas por campo.
- Logística y enrutamiento: la extracción fiable de municipio, provincia y código postal permite segmentar envíos por zona y asignar rutas de reparto.
- Procesamiento de direcciones multinacionales: gracias a su entrenamiento con 20 países y su capacidad zero-shot, es adecuado para empresas que operan en varios mercados con formatos de dirección heterogéneos.
- Integración en pipelines de datos con la librería deepparse: al ser un modelo pequeño (17,5 M de parámetros, 0,1 GB) puede ejecutarse en CPU dentro de procesos ETL sin necesidad de GPU.
- Verificación de formularios en tiempo real: su reducido tamaño permite desplegarlo como microservicio de baja latencia para validar direcciones mientras el usuario rellena un formulario.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision media por pais en 41 paises zero-shot | 86,00 % (rango de 24,48 % a 99,77 %) |
| Mejora del mecanismo de atencion en los 20 paises de entrenamiento | ~0,5 % de precision |
| Precision por palabra en el test de worldwide-addresses (20 paises, 260.000 direcciones, medido en noviembre de 2026) | 84,38 % |

No se han publicado resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo no es un LLM generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamano del modelo (17,5 M de parametros, repositorio de 0,1 GB); puede ejecutarse en CPU sin problemas.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente si se desea acelerar el procesamiento por lotes.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: libreria deepparse (integracion nativa); al ser un modelo PyTorch, puede servirse con TorchServe o como microservicio propio. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepparse/bpemb-attention | 17,5 M | no disponible | Seq2Seq LSTM con atencion y embeddings BPEmb | MIT | HuggingFace (deepparse) |
| Otros modelos de deepparse (variantes fasttext, bpemb sin atencion) | no disponible | no disponible | Parsers de direcciones de la misma familia | MIT | HuggingFace (deepparse) |
| libpostal | no disponible | no disponible | Libreria de parsing de direcciones basada en reglas y datos | MIT | GitHub (openvenues) |

No se dispone en la informacion proporcionada de datos de rendimiento de las alternativas para una comparacion cuantitativa; la comparativa con modelos de la misma familia de deepparse y con libpostal se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Rendimiento inferior en direcciones incompletas: es mas debil con fragmentos como un codigo postal o un municipio aislado que con direcciones completas.
- Etiquetas raramente predichas: en noviembre de 2026 no predijo las etiquetas `Orientation` ni `GeneralDelivery` en 12.000 direcciones del test de worldwide-addresses, por lo que estos campos no son fiables en produccion.
- Alta variabilidad entre paises en zero-shot: el rango de precision va del 24,48 % al 99,77 %, lo que implica que en algunos paises el modelo puede ser poco fiable.
- Modelo especializado y no generativo: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; solo realiza etiquetado de secuencias de direcciones.
- Entrenado en 2020: los datos de entrenamiento pueden no reflejar cambios recientes en formatos postales o denominaciones administrativas.
- Sesgos: no se documentan sesgos especificos en la informacion disponible, aunque la cobertura desigual por pais puede introducir un rendimiento sistematicamente inferior en regiones poco representadas.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, si bien se recomienda conservar el aviso de copyright.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero puede asignar etiquetas incorrectas en direcciones ambiguas o mal formadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepparse/bpemb-attention
- Documentacion de deepparse: https://deepparse.org
- Pagina de resultados: https://deepparse.org/results.html
- Repositorio de datos de entrenamiento: https://github.com/GRAAL-Research/deepparse-address-data
- Dataset worldwide-addresses: https://huggingface.co/datasets/deepparse/worldwide-addresses
- Paper "Leveraging Subword Embeddings for Multinational Address Parsing": https://arxiv.org/abs/2006.16152
- Paper "Multinational Address Parsing: A Zero-Shot Evaluation": https://arxiv.org/abs/2112.04008
- Embeddings BPEmb: https://nlp.h-its.org/bpemb/
- libpostal: https://github.com/openvenues/libpostal
