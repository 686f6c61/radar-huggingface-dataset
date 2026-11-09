# johnrizzo1/codet5-opensearch-lora

## Resumen

`johnrizzo1/codet5-opensearch-lora` es un adaptador LoRA (PEFT) sobre el modelo base `Salesforce/codet5-base`, un transformer encoder-decoder de tipo seq2seq orientado a código. El adaptador está entrenado para una tarea muy concreta: traducir consultas en lenguaje natural a consultas JSON DSL válidas de OpenSearch, con el objetivo de que el resultado sea "grounded", es decir, que los campos y estructuras referenciados existan en los índices de destino.

El modelo lo publica el usuario johnrizzo1 y se distribuye bajo licencia Apache 2.0. Su relevancia práctica está en el nicho de text-to-DSL para motores de búsqueda y observabilidad: permite construir interfaces en lenguaje natural sobre OpenSearch sin que el usuario final tenga que conocer la sintaxis del DSL, apoyándose en un modelo base pequeño (codet5-base, ~220M parámetros) y un adaptador ligero (rank 16, alpha 32).

Los índices objetivo declarados son cinco conjuntos de datos de ejemplo y de telemetría: e-commerce, vuelos, logs de acceso web, trazas APM OTel y logs OTel. No hay información publicada sobre idiomas soportados, número de tokens de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (T5, base CodeT5) con adaptador LoRA |
| Parametros totales | Modelo base `Salesforce/codet5-base` (no se especifica el recuento exacto en la información disponible; el adaptador añade un número reducido de parámetros entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de codet5-base; no se declara en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Salesforce/codet5-base`, un modelo T5 de tipo encoder-decoder preentrenado sobre código fuente. La tarea es seq2seq: la entrada es una consulta en lenguaje natural y la salida es una consulta JSON DSL de OpenSearch. El ajuste se realiza mediante PEFT LoRA con rank 16 y alpha 32, lo que mantiene el coste de entrenamiento y almacenamiento muy bajo (el repositorio ocupa 0,4 GB, incluyendo los pesos del adaptador).

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición exacta del dataset (la model card solo indica `dataset: custom`), ni si se aplicaron técnicas de RLHF/DPO (poco habituales en este tipo de tarea seq2seq). El entrenamiento está claramente orientado a un dominio cerrado de cinco índices de ejemplo, lo que sugiere un dataset sintético o semi-sintético de pares (consulta natural, consulta DSL) generado a partir de los esquemas de dichos índices.

## Capacidades

- Generación de consultas OpenSearch JSON DSL a partir de lenguaje natural, con anclaje a los campos de los índices de destino.
- Traducción text-to-DSL sobre cinco índices concretos: e-commerce, vuelos, logs de acceso web, trazas APM OTel y logs OTel.
- Tarea seq2seq pura (entrada texto, salida estructura JSON); no es un modelo generativo conversacional.
- Integración con un agente de ejemplo mediante `src/run_agent.py` con el flag `--model codet5`.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).

## Casos de uso

- Asistente de búsqueda en lenguaje natural sobre catálogos de e-commerce: el modelo traduce peticiones como filtros por categoría o rango de precios a DSL sobre el índice `opensearch_dashboards_sample_data_ecommerce`, evitando que el usuario escriba JSON manualmente.
- Consulta de datos de vuelos: un analista puede pedir "vuelos retrasados más de 30 minutos con destino Madrid" y obtener la consulta DSL correspondiente sobre `opensearch_dashboards_sample_data_flights`.
- Investigación de incidentes en logs web: a partir de una descripción en lenguaje natural se genera el DSL para filtrar eventos por código HTTP y extensión de fichero, como en el ejemplo de la model card (`HTTP response '200'` y extensión `deb`).
- Observabilidad APM: generación de consultas sobre trazas OTel (`otel-v1-apm-span-sample`) para localizar trazas con latencias o servicios concretos, útil en paneles de SRE.
- Análisis de logs OTel: traducción de peticiones de búsqueda sobre `ss4o_logs-otel-sample` para construir alertas o dashboards sin escribir DSL a mano.
- Prototipado de interfaces NL-to-query en herramientas internas: al ser un adaptador LoRA sobre un modelo base pequeño, se puede desplegar en infraestructura modesta para demos y validación de producto antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre `codet5-base` (modelo base de ~220M parámetros), la inferencia en precisión completa requiere del orden de 1-2 GB de VRAM, y menos con cuantización, aunque el dato no está publicado.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder ejecutar el modelo base.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo base, aunque no hay confirmación oficial.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el modelo base); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| johnrizzo1/codet5-opensearch-lora | Adaptador LoRA sobre codet5-base | no disponible | Text-to-OpenSearch DSL | apache-2.0 | Hugging Face (69 descargas) |
| Salesforce/codet5-base | ~220M (modelo base) | no disponible | Generación de código genérica | apache-2.0 | Hugging Face |
| Alternativas específicas de text-to-DSL para OpenSearch/Elasticsearch | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores públicos comparables de text-to-DSL para OpenSearch en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado para cinco índices concretos; su generalización a otros esquemas de OpenSearch no está garantizada y probablemente requiera reentrenamiento.
- Riesgo de alucinación de campos o estructuras DSL: el modelo puede generar JSON sintácticamente válido pero semánticamente incorrecto si el esquema de destino difiere del visto en entrenamiento.
- No se declaran idiomas soportados; el rendimiento en castellano u otros idiomas distintos del inglés es desconocido.
- No hay benchmarks publicados ni métricas de exactitud de la consulta generada, por lo que la calidad en producción no está cuantificada.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de `Salesforce/codet5-base` conviene revisar también las condiciones del modelo base.
- El pipeline declarado en Hugging Face es `text-generation`, mientras que la model card indica `text2text-generation`; conviene configurar la tarea correctamente al cargar el modelo.
- No es un modelo conversacional: no mantiene diálogo multi-turno ni soporta tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johnrizzo1/codet5-opensearch-lora
- Modelo base: https://huggingface.co/Salesforce/codet5-base
- Ficha en free2aitools: https://free2aitools.com/model/johnrizzo1/codet5-opensearch-lora
