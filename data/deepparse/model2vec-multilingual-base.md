# deepparse/model2vec-multilingual-base

## Resumen

model2vec-multilingual-base es un modelo de parsing de direcciones postales desarrollado por deepparse, un proyecto especializado en el tratamiento estructurado de direcciones. A diferencia de los modelos generativos, es un sistema Seq2Seq sin mecanismo de atención que etiqueta cada palabra de una dirección con su rol semántico (nombre de calle, municipio, código postal, etc.), apoyándose en los embeddings estáticos Model2Vec de minishlab/potion-multilingual-128M de 256 dimensiones.

El modelo resuelve un problema muy concreto y recurrente en logística, comercio electrónico y normalización de datos: descomponer direcciones en formato libre y multilingüe en campos estructurados. Con 9.466.889 parámetros, está diseñado para ser ligero y desplegable en entornos con recursos limitados, y se entrena sobre el dataset worldwide-addresses, que cubre 20 países.

Su relevancia actual radica en su enfoque de eficiencia: sustituye el códec transformer convencional por una arquitectura encoder-decoder de una sola capa con embeddings estáticos, alcanzando un 98,51 % de precisión por palabra en test. La licencia MIT y su integración con la librería deepparse lo hacen directamente utilizable en producción sin costes de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq sin mecanismo de atención, encoder y decoder de una capa con embeddings estáticos Model2Vec |
| Parametros totales | 9.466.889 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (entrenado sobre direcciones de 20 países); lista explícita no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo con pytorch_model_hub_mixin y model_hub_mixin) |

## Arquitectura y entrenamiento

El modelo es un Seq2Seq sin atención con tamaño oculto de 1024 tanto en el encoder como en el decoder, una capa en cada uno. La entrada se representa mediante los embeddings estáticos Model2Vec derivados de minishlab/potion-multilingual-128M, con 256 dimensiones, lo que elimina la necesidad de una torre transformer completa para la codificación inicial. La salida es una etiqueta por palabra (esquema de tagging de componentes de dirección).

El entrenamiento utiliza el dataset deepparse/worldwide-addresses, con 20 países y 100.000 direcciones limpias más 50.000 incompletas por país, dividido en 90 % entrenamiento y 10 % validación. En el preprocesado, las etiquetas Suburb y District se mapean a Municipality, y se eliminan las palabras County y Country. La selección de hiperparámetros se realizó evaluando tamaños ocultos de 128, 256, 512 y 1024, escogiendo el de menor pérdida media de validación sobre 5 semillas; la semilla final fue la 46, con mejor época en la 93.

## Capacidades

- Etiquetado por palabra de componentes de dirección: nombre de calle, municipio, provincia/estado, código postal y país.
- Parsing multilingüe de direcciones en 20 países según el dataset de entrenamiento.
- Manejo de direcciones incompletas, presentes de forma explícita en el corpus de entrenamiento.
- Integración nativa con la librería deepparse mediante `AddressParser(model_type="model2vec-multilingual")`.
- Inferencia ligera: al usar embeddings estáticos, no requiere el coste computacional de un transformer generativo.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento; su alcance es exclusivamente el parsing de direcciones.

## Casos de uso

- Normalización de direcciones en comercio electrónico: el modelo convierte direcciones introducidas libremente por el usuario en campos estructurados (calle, municipio, código postal) antes de validarlas contra un servicio de geocodificación, reduciendo errores de entrega.
- Enriquecimiento de bases de datos CRM y ERP: procesar por lotes direcciones históricas no estructuradas de 20 países y separar sus componentes para deduplicación y segmentación geográfica.
- Logística y planificación de rutas: extraer municipio y código postal de etiquetas de envío en varios idiomas para asignar centros de distribución y calcular zonas de reparto.
- Limpieza de datos previa a geocodificación: el parser aísla el nombre de calle del resto de componentes, lo que mejora la tasa de acierto de APIs como Nominatim o Google Maps.
- Verificación de formularios en tiempo real: con solo 9,4 M de parámetros, puede ejecutarse en el backend de un formulario web para comprobar que la dirección contiene los campos mínimos exigidos.
- Procesamiento de direcciones incompletas: gracias al entrenamiento con 50.000 direcciones incompletas por país, es adecuado para completar o marcar registros parciales en pipelines de calidad de datos.
- Extracción de direcciones en documentos escaneados con OCR: tras el OCR, el modelo etiqueta cada token de la línea de dirección, integrándose en flujos de digitalización de facturas y albaranes.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precisión por palabra en test (este modelo) | 98,51 % |
| Precisión por palabra en test (media ± desviación sobre 5 semillas de esta configuración) | 97,74 ± 0,72 % |
| Precisión por palabra en validación (este modelo) | 98,72 % |

La precisión se mide como exactitud de etiqueta por palabra sobre el split de test de los datos worldwide-addresses reconstruidos. No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos de parsing.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (9,4 M de parámetros, aproximadamente 38 MB de pesos), con overhead mínimo por los embeddings estáticos.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer e incluso en CPU; es viable en entornos serverless de bajo coste y en dispositivos edge.
- Opciones de despliegue: librería deepparse (`pip install deepparse[model2vec]`), con pesos en safetensors cargables vía PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por su tamaño, se espera latencia de milisegundos en CPU para direcciones típicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| model2vec-multilingual-base (este) | 9,4 M | No disponible | Seq2Seq sin atención con embeddings estáticos | MIT | HuggingFace, librería deepparse |
| Otros parsers de deepparse (p. ej. variantes fasttext o bpemb) | No disponible | No disponible | Parsers Seq2Seq de la misma librería | MIT | HuggingFace, librería deepparse |
| libpostal (no es un modelo de este repo) | No disponible | No disponible | Sistema estadístico de parsing de direcciones | MIT | Open source |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El dataset de origen no contiene las etiquetas Orientation ni GeneralDelivery: el modelo tiene esas salidas pero nunca las predice; la orientación de calle (por ejemplo, Ouest o NW) queda incluida dentro de StreetName.
- Corea del Sur cuenta casi exclusivamente con direcciones incompletas en los datos, lo que puede degradar el rendimiento en direcciones completas de ese país.
- La cobertura geográfica se limita a los 20 países del dataset worldwide-addresses; el rendimiento fuera de esa cobertura no está garantizado.
- Riesgo de alucinación bajo en sentido generativo, pero posible etiquetado erróneo en direcciones con formatos atípicos, abreviaturas no vistas o ruido de OCR.
- Sesgos derivados de la distribución del corpus de entrenamiento: los países con más direcciones limpias estarán mejor representados.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene conservar el aviso de copyright.
- Para producción, validar el rendimiento en el dominio concreto (país, idioma y fuente de direcciones) antes de desplegar, dado que la precisión publicada corresponde al split de test del propio dataset.
- No apto para tareas generativas, de razonamiento, código, visión o conversación; su uso está acotado al etiquetado de componentes de dirección.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepparse/model2vec-multilingual-base
- Dataset de entrenamiento: https://huggingface.co/datasets/deepparse/worldwide-addresses
- Embeddings base Model2Vec: https://huggingface.co/minishlab/potion-multilingual-128M
- Documentación de deepparse: https://deepparse.org
