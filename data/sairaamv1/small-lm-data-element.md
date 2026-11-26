# sairaamv1/small-lm-data-element

## Resumen

`small-lm-data-element` es un clasificador de texto de 4,4 millones de parámetros desarrollado por el usuario `sairaamv1` y publicado en Hugging Face bajo licencia MIT. Se trata de un encoder BERT de 2 capas y 128 dimensiones ocultas, afinado para una tarea muy concreta de gobernanza de datos: mapear un nombre de columna corto o una abreviatura (por ejemplo, `fst_nm`, `dob` o `sanctionsStatus`) a su etiqueta canónica de *Data Element* (por ejemplo, `First Name`, `Date of Birth` o `AML / Sanctions Status`) entre 258 clases posibles.

El modelo resuelve un problema recurrente en proyectos de catalogación de datos, linaje y cumplimiento normativo: la necesidad de identificar automáticamente qué tipo de dato contiene una columna sin depender de diccionarios manuales. Su tamaño reducido permite inferencia en CPU a 0,30 ms por ejemplo, lo que lo hace apto para ejecutarse dentro de pipelines de ingesta sin infraestructura GPU dedicada.

Es relevante ahora porque los equipos de datos necesitan clasificar esquemas a gran escala (miles de tablas y APIs) con coste mínimo, y un clasificador de 4,4 M de parámetros es varias órdenes de magnitud más barato que recurrir a un LLM generativo para la misma tarea. Ahora bien, el propio autor advierte que el rendimiento fuera de distribución cae al 57,3 %, por lo que su uso en producción requiere validación previa sobre los esquemas reales del cliente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (2 capas, 128 dimensiones ocultas) |
| Parámetros totales | 4.419.202 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT reducido a 2 capas y 128 dimensiones ocultas, configurado como `AutoModelForSequenceClassification` con 258 etiquetas de salida. La tarea es de clasificación multiclase de secuencias cortas: el texto de entrada es un nombre de columna o abreviatura, y la salida es la etiqueta canónica del *Data Element* correspondiente.

El entrenamiento se realizó sobre un conjunto de nombres de elementos de datos y sus variantes de abreviatura y capitalización (por ejemplo, `first_name` → `fname`, `f_nm`, `firstName`), ampliado con variantes generadas sintéticamente que reproducen estilos de nomenclatura y patrones de abreviatura. El autor indica que los scripts de generación están en el repositorio `small-lm`. No se documentan el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador de este tipo). El mejor checkpoint fue la época 29, con una precisión de validación del 94,40 %.

## Capacidades

- Clasificación de texto multietiqueta con 258 clases de *Data Element*.
- Mapeo de abreviaturas y variantes de capitalización de nombres de columna a etiquetas canónicas.
- Inferencia en CPU con latencia muy baja (0,30 ms por ejemplo en un solo hilo, batch size 1).
- Integración nativa con `transformers` y con `text-embeddings-inference` (el modelo declara compatibilidad con endpoints).
- Idiomas: únicamente inglés.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*: es un clasificador discriminativo, no un modelo generativo.
- No dispone de capacidades multilingües más allá del inglés.

## Casos de uso

- Catalogación automática de columnas en un *data catalog*: dado un esquema de base de datos, el modelo etiqueta cada columna con su *Data Element* canónico, reduciendo el trabajo manual de los *data stewards* en miles de tablas.
- Detección de datos sensibles en pipelines de ingesta: clasificar columnas como `AML / Sanctions Status`, `Date of Birth` o `Health & Biometric Data` para activar políticas de enmascaramiento o control de acceso antes de que los datos lleguen al *data lake*.
- Enriquecimiento de metadatos en APIs y esquemas de terceros: procesar los nombres de campo de integraciones (Salesforce, Stripe, Shopify, FHIR) para alinear su semántica con el modelo de datos corporativo.
- Linaje y mapeo entre sistemas: emparejar columnas equivalentes entre dos bases de datos que usan convenciones de nomenclatura distintas, usando la etiqueta canónica como clave de unión.
- Preprocesamiento para cumplimiento normativo (GDPR, AML): generar un inventario clasificado de campos personales y financieros que sirva de base para informes de cumplimiento.
- Clasificación por lotes en pipelines de CI/CD de datos: ejecutar el modelo sobre los esquemas de cada *pull request* para detectar cambios que introduzcan campos sensibles no declarados.
- Filtrado previo en sistemas de búsqueda de datos: etiquetar columnas para permitir búsquedas por tipo de dato ("todas las columnas de fecha de nacimiento") sin depender de coincidencias textuales.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Precisión en test (in-distribution, 2607 ejemplos) | 95,17 % |
| Mejor época de validación | 29 (precisión 94,40 %) |
| Latencia de inferencia en CPU | 0,30 ms/ejemplo (1 hilo, batch size 1) |
| Precisión OOD combinada (124 ejemplos) | 57,3 % |
| Precisión OOD sobre `trl-lab/contextual-sensitive-data` (60 filas) | 75,0 % |
| Precisión OOD sobre vocabularios de API/esquema públicos (64 filas) | 40,6 % |

Categorías con menor precisión en test:

| Categoría | Precisión |
|---|---|
| Health & Biometric Data | 90,0 % |
| Social & Relationship Data | 90,4 % |
| Authentication Data | 90,7 % |
| Subscription & Membership Data | 90,9 % |
| Behavioral Data | 91,4 % |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (4,4 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU con latencia de 0,30 ms por ejemplo. Cualquier GPU (RTX 4090, A100, H100) aceleraría el procesamiento por lotes, pero no es necesaria.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o similar, y también en entornos sin GPU.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (el modelo declara compatibilidad con endpoints) y, previsiblemente, `Optimum`/ONNX; no se documenta soporte explícito para vLLM, llama.cpp u Ollama (son motores orientados a modelos generativos).
- Latencia y throughput: 0,30 ms por ejemplo en CPU a un solo hilo y batch size 1; el throughput por lotes no está documentado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, la categoría de clasificadores de esquemas de datos incluye aproximaciones basadas en embeddings (similitud coseno contra un vocabulario de etiquetas) o en LLMs generativos con *prompting*, pero no se han publicado métricas comparativas en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `sairaamv1/small-lm-data-element` | 4.419.202 | no disponible | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento fuera de distribución es bajo (57,3 % combinado): el modelo tiende a reconocer los estilos de capitalización y separadores que genera su propio pipeline de aumentación sintética, y falla con nombres jerárquicos con puntos o palabras reales que el generador sintético no produce.
- El autor advierte explícitamente de que no debe usarse sobre esquemas reales no vistos sin datos de entrenamiento adicionales que cubran esos patrones.
- Solo admite inglés; los nombres de columna en otros idiomas o con caracteres no ASCII no están cubiertos.
- Es un clasificador discriminativo: no genera explicaciones, no soporta *tool calling* ni razonamiento, y no puede adaptarse a nuevas etiquetas sin reentrenamiento.
- Riesgo de sesgo hacia las convenciones de nomenclatura presentes en el dataset de entrenamiento (probablemente anglosajonas y de estilo *snake_case* o *camelCase*).
- Las categorías de datos sensibles (salud, biometría, autenticación) tienen la precisión más baja (90-91 %), precisamente donde un error tiene mayor impacto en cumplimiento normativo.
- Licencia MIT: permite uso comercial y modificación, pero no hay garantías del autor sobre idoneidad para producción.
- El modelo tiene 0 descargas y 1 *like* en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sairaamv1/small-lm-data-element
- Dataset de referencia OOD: https://huggingface.co/datasets/trl-lab/contextual-sensitive-data
- Repositorio `small-lm` (scripts de generación, mencionado en la model card, sin URL directa disponible): no disponible
