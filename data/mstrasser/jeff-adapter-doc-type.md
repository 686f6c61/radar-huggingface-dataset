# mstrasser/jeff-adapter-doc-type

## Resumen

jeff-adapter-doc-type es un adaptador LoRA de clasificación de documentos construido sobre jeff-base v1.4, un modelo de decisión abierto y de pequeño tamano que, segun la model card, es un fine-tune de Qwen3.5-0.8B. El adaptador no genera texto libre: recibe una situación (contexto de la bandeja de entrada donde llega el documento) y una lista de etiquetas definidas por el usuario con sus descripciones, y devuelve en un único forward pass una probabilidad calibrada para cada opción, sin necesidad de parsear texto generado.

El problema que resuelve es concreto: encaminar documentos entrantes hacia categorías definidas por el cliente (factura, presupuesto, orden de compra, albarán, etc.), incluyendo una etiqueta `other` para lo que no encaja en ninguna. La innovación práctica es el enfoque de "decision model" con calibración explícita: el modelo expone una confianza por clase que el sistema puede usar para umbralizar y derivar a revisión humana.

Es relevante para desarrolladores que necesitan un clasificador ligero, desplegable en local o vía API, con licencia Apache 2.0 y sin dependencia de un LLM generativo grande. El adaptador está entrenado y validado únicamente sobre la revisión v1.4 de jeff-base: el motor rechaza cargarlo sobre otra revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre jeff-base v1.4, modelo de decisión derivado de Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador; el repo ocupa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre jeff-base v1.4, presentado como un "decision model" de tipo clasificación. En lugar de generar una respuesta textual, el modelo realiza una pasada forward y emite una distribución de probabilidad sobre las etiquetas proporcionadas por el llamador (hasta 11), lo que elimina el parseo de salida y permite usar directamente la confianza como señal de calibración. El adaptador fue entrenado el 2026-10-25 sobre la revisión v1.4 del modelo base, y el motor de ejecución impide cargarlo sobre otras revisiones.

Los datos de entrenamiento no se detallan en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La model card indica que las evaluaciones se realizaron sobre tests generados por el mismo generador que los datos de entrenamiento, lo que el propio autor advierte que mide menos que un test público o con documentos reales. La calibración se midió sobre un conjunto de 2.000 filas.

## Capacidades

- Clasificación de documentos en categorías definidas por el llamador (máximo 11 etiquetas, cada una con clave y descripción).
- Etiqueta `other` para documentos que no encajan en ninguna categoría listada.
- Salida de probabilidad calibrada por opción en una sola pasada forward, sin texto generado que parsear.
- Uso de contexto de situación (`sorting_desk`) para desambiguar según la bandeja o equipo que recibe el documento.
- Discriminación por propósito del documento (quién lo envía, a quién, qué pide o registra), no por palabras mencionadas de pasada.
- Soporte de invocación local (SDK `jeff.Jeff.local`) y remota (API `api.jeffhub.ai`), además de endpoint HTTP `/v1/decide`.
- Capacidad multilingüe: limitada a inglés según la model card.
- No soporta extracción de campos del documento; solo identifica el tipo.

## Casos de uso

- Enrutamiento de correo entrante en una PYME: el adaptador clasifica cada documento de una bandeja compartida (facturas, presupuestos, órdenes de compra, albaranes) y dirige cada uno al flujo correspondiente. La salida de probabilidad permite derivar a revisión humana los casos con confianza baja.
- Automatización de cuentas por pagar: los documentos recibidos se clasifican antes de pasar a OCR o extracción de campos; solo las facturas entran en el pipeline de pago, evitando procesar presupuestos o albaranes como si fueran facturas.
- Triaje documental en gestoría o asesoría: el contexto `sorting_desk` describe la bandeja del despacho y las etiquetas se adaptan a los tipos habituales de cada cliente, sin reentrenar el modelo.
- Clasificación en local con requisitos de privacidad: al ejecutarse con `jeff.Jeff.local`, los documentos no salen de la infraestructura del cliente, lo que encaja con documentos financieros o contractuales sensibles.
- Filtrado previo en pipelines de extracción: el adaptador actúa como primera etapa que decide qué extractor especializado aplicar a cada documento, reduciendo coste y errores en etapas posteriores.
- Detección de documentos fuera de catálogo: la etiqueta `other` permite identificar entradas no previstas (por ejemplo, contratos o reclamaciones) y desviarlas a un flujo de revisión manual.
- Integración vía API en sistemas existentes: el endpoint `/v1/decide` permite incorporar la clasificación a un backend sin desplegar el modelo, usando una clave de API.

## Benchmarks y rendimiento

Datos publicados en la model card (el autor advierte que los tests "generator" proceden del mismo generador que los datos de entrenamiento):

| Test | Filas | Exactitud |
|---|---:|---:|
| Test interno (generador) | 2.000 | 96,9% |
| Segundo test interno de casos no vistos (generador) | 2.000 | 99,1% |

Calibración de la función `doc_type`:

| Función | Umbral | Precisión | Cobertura | Filas de calibración |
|---|---:|---:|---:|---:|
| `doc_type` | 0,498 | 97,8% | 100,0% | 2.000 |

No se han publicado resultados de benchmarks públicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al derivar de un modelo de 0,8B de parámetros más un adaptador LoRA, el requisito debería ser modesto, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamano del modelo base (0,8B) sugiere que podría caber en GPU de consumo, pero no hay dato oficial.
- Opciones de despliegue: SDK de Python `jeff` con modo local (`jeff.Jeff.local`), API remota (`jeff.Jeff.remote` contra `https://api.jeffhub.ai`) y endpoint HTTP `POST /v1/decide`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. Como referencia estructural, el adaptador se apoya en jeff-base v1.4 (fine-tune de Qwen3.5-0.8B), pero no se ofrecen métricas cruzadas con alternativas de clasificación de documentos.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| jeff-adapter-doc-type | no disponible (adaptador sobre base de 0,8B) | no disponible | Apache 2.0 | Clasificación con probabilidad calibrada |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado y validado solo para inglés; no se garantiza funcionamiento en castellano u otros idiomas.
- Las métricas publicadas provienen de tests generados por el mismo generador que los datos de entrenamiento; el propio autor advierte que miden menos que un test público o con documentos reales.
- Solo identifica el tipo de documento; no extrae campos ni contenido.
- Máximo de 11 etiquetas por llamada.
- El adaptador se carga únicamente sobre la revisión v1.4 de jeff-base; el motor rechaza otras revisiones, lo que limita actualizaciones del base sin reentrenar.
- Riesgo de alucinación de etiqueta: aunque la salida es probabilística, el modelo puede asignar alta confianza a una categoría incorrecta cuando los tipos son similares; la descripción de cada etiqueta es crítica para la desambiguación.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base jeff-base y de Qwen3.5-0.8B.
- Ecosistema incipiente: el repositorio tiene 0 descargas y 0 likes, y los paquetes pueden no estar aún en PyPI (la guía indica instalarlos desde GitHub).
- El ejemplo de la model card aparece truncado en el bloque `curl`, por lo que la referencia completa del endpoint debe consultarse en la documentación oficial.

## Enlaces

- HuggingFace: https://huggingface.co/mstrasser/jeff-adapter-doc-type
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página de catálogo: https://jeffhub.ai/catalogue/jeff.retrieval.doc-type
- Repositorio, servidor y SDKs: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
- API: https://api.jeffhub.ai
- Portal: https://jeffhub.ai
