# mstrasser/jeff-adapter-extract-check

## Resumen

jeff-adapter-extract-check es un adaptador LoRA (PEFT) sobre el modelo base mstrasser/jeff-base v1.4, un fine-tune de Qwen3.5-0.8B descrito por el autor como un "modelo de decisión" pequeno y abierto. El adaptador resuelve una tarea concreta de validación: comprobar si un valor extraído de un documento (por ejemplo, el total de una factura) está realmente respaldado por el texto fuente, y clasificar el tipo de discrepancia cuando no lo está.

A diferencia de un modelo generativo convencional, el adaptador no produce texto libre que haya que parsear. Recibe un contexto (el documento) y una entrada estructurada con un campo y un valor, y devuelve en una sola pasada forward una distribución de probabilidad calibrada sobre cinco etiquetas: correct, wrong_value, wrong_field, not_in_document y ambiguous. Esto lo hace adecuado como componente de verificación dentro de pipelines de extracción de información (RAG, procesamiento de facturas, formularios), donde el coste de un valor mal extraído es alto.

El modelo es relevante por su enfoque: separa la extracción de la validación y convierte la validación en una decisión clasificatoria calibrada con umbral de confianza, en lugar de una generación. Está publicado bajo licencia Apache 2.0, solo en inglés, y con un tamaño de repositorio practicamente nulo (0.0 GB), lo que sugiere un adaptador de dimensiones reducidas sobre una base de 0.8B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder (jeff-base, fine-tune de Qwen3.5-0.8B) |
| Parametros totales | no disponible (adaptador LoRA; base de 0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre jeff-base v1.4, que el autor describe como un fine-tune de Qwen3.5-0.8B. La tarea se formula como clasificación de una elección entre cinco opciones nombradas, con salida de probabilidad calibrada por opción en una única pasada forward, sin generación de texto. El adaptador se entrena el 2026-10-25 y el motor rechaza cargarlo sobre cualquier revisión del modelo base distinta de v1.4.

Los datos de entrenamiento no se detallan en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La model card sí reporta evaluaciones sobre conjuntos generados por el mismo generador que los datos de entrenamiento (2.000 filas con 99,6% de accuracy y otras 2.000 con 98,8%), además de un conjunto de calibración de 2.000 filas del que se deriva un umbral de confianza de 0,483 con precisión del 99,1% y cobertura del 100,0%. No se documenta ninguna innovación arquitectónica adicional más allá del esquema de decisión calibrada.

## Capacidades

- Clasificación de validación de valores extraídos en cinco etiquetas: correct, wrong_value, wrong_field, not_in_document y ambiguous.
- Comparación tolerante a formatos: fechas escritas de forma distinta, importes con o sin moneda o separadores, nombres en otro orden o sin sufijo de empresa.
- Detección de errores de campo (por ejemplo, importe de IVA presentado como total, o fecha de emisión presentada como vencimiento).
- Detección de ambigüedad cuando el documento declara el mismo campo varias veces con valores distintos.
- Salida de probabilidad calibrada por etiqueta con umbral de confianza predefinido.
- Decisión en una sola pasada forward, sin texto generado que parsear.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es un clasificador de decisión especializado.
- Solo inglés.

## Casos de uso

- Validación de facturas en cuentas a pagar: antes de registrar un total, se pasa el documento y el valor extraído por OCR al adaptador; si devuelve wrong_field o wrong_value, el flujo deriva el documento a revisión humana en lugar de contabilizarlo.
- Verificación de campos en pipelines RAG: cuando un sistema de extracción devuelve una respuesta con cita, el adaptador comprueba que el valor citado aparece realmente asociado al campo solicitado en el fragmento recuperado.
- Control de calidad en extracción de formularios: validar campos como fecha de emisión, vencimiento, NIF o importe base antes de persistirlos en base de datos, usando el umbral de 0,483 para decidir cuándo confiar en la clasificación.
- Enrutamiento por confianza en atención al cliente documental: clasificar la respuesta como correcta y responder automáticamente; si es ambigua o no está en el documento, escalar a un agente humano.
- Auditoría de datasets de extracción: ejecutar el adaptador sobre pares campo-valor-documento para medir la tasa de valores no soportados y detectar errores sistemáticos en el extractor upstream.
- Detección de ambigüedad en contratos y pólizas: identificar documentos que declaran el mismo campo con valores distintos (por ejemplo, dos importes de total) y marcarlos para revisión legal.
- Filtrado previo en sistemas multi-etapa: usar la salida calibrada como señal para decidir si un valor extraído pasa a una etapa más costosa de verificación o se descarta directamente.

## Benchmarks y rendimiento

| Test | Filas | Accuracy |
|---|---:|---:|
| Test interno (generator) | 2.000 | 99,6% |
| Segundo test interno de casos no vistos (generator) | 2.000 | 98,8% |

| Funcion | Umbral | Precision | Coverage | Filas de calibracion |
|---|---:|---:|---:|---:|
| `check` | 0,483 | 99,1% | 100,0% | 2.000 |

El autor advierte que los tests de tipo "generator" provienen del mismo generador que los datos de entrenamiento y miden menos que un test público o con documentos reales. No se han publicado resultados en benchmarks públicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre una base de 0.8B parámetros, la huella es reducida y cabe con holgura en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño de la base (0.8B), una RTX 4090 o incluso GPUs de gama media serían suficientes en principio, sin dato oficial.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de la base, aunque no se confirma en la model card.
- Opciones de despliegue: SDK de Python `jeff` (modo `Jeff.local` o `Jeff.remote` contra `https://api.jeffhub.ai`), motor propio del proyecto firelex/jeff, y API HTTP (`/v1/decide`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jeff-adapter-extract-check | LoRA sobre decoder 0.8B | no disponible (base 0.8B) | no disponible | Validación de valores extraídos (5 clases) | apache-2.0 | HuggingFace + API Jeff |
| Modelos generativos de validación (p. ej. LLM instruct pequeños) | Transformer generativo | variable | variable | Verificación mediante generación de texto | variable | variable |
| Clasificadores de NLI/entailment | Encoder | variable | variable | Soporte/contradicción entre texto y afirmación | variable | variable |

No se dispone de datos de benchmarks comparativos con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Solo valida valores ya extraídos; no realiza la extracción. No debe usarse como extractor.
- Entrenado y evaluado únicamente en inglés; no hay soporte multilingüe declarado.
- Los tests reportados son de tipo "generator" (mismo generador que los datos de entrenamiento), por lo que la accuracy real sobre documentos reales podría ser inferior a la publicada.
- El adaptador solo carga sobre jeff-base en la revisión v1.4; el motor rechaza otras revisiones, lo que limita la portabilidad.
- No se documentan sesgos conocidos, pero al ser un clasificador entrenado sobre datos sintéticos de un generador concreto, puede heredar sus sesgos de distribución.
- Riesgo de alucinación bajo en la formulación (no genera texto), pero el clasificador puede producir etiquetas incorrectas en documentos con formatos atípicos no representados en entrenamiento.
- La cobertura del 100,0% en el conjunto de calibración con umbral 0,483 implica que el sistema responde siempre; la fiabilidad fuera de ese conjunto no está garantizada.
- Licencia Apache 2.0 permite uso comercial, pero el proyecto depende del motor y API del autor (firelex/jeff), cuyo despliegue y mantenimiento condicionan la producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.

## Enlaces

- HuggingFace: https://huggingface.co/mstrasser/jeff-adapter-extract-check
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Catálogo: https://jeffhub.ai/catalogue/jeff.retrieval.extract-check
- Código, servidor y SDKs: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
- API: https://api.jeffhub.ai
- Plataforma: https://jeffhub.ai
