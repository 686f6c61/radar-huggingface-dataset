# sidman007/wsp-bert-insurance-v1-p00

## Resumen

`wsp-bert-insurance-v1-p00` es un clasificador de frases del dominio de seguros construido sobre `bert-base-uncased` mediante una tecnica denominada *weight-space programming* (edicion directa de pesos). El autor, `sidman007`, no ha entrenado el modelo con descenso de gradiente: un LLM editor leyo y reescribio los pesos del transformer original aplicando calculo en forma cerrada sobre pesos y activaciones, con un numero limitado de pasadas hacia delante. El resultado es un `BertForSequenceClassification` de 8 etiquetas especificas del dominio asegurador.

El modelo conserva la arquitectura BERT base (12 capas, 768 dimensiones ocultas, 109.488.392 parametros totales) y modifica 106 tensores, lo que representa un 34,531 % de los parametros. La edicion se concentra en las proyecciones de atencion (query, key, value), las salidas densas y las LayerNorm de las 12 capas del encoder. Es relevante como demostracion de un paradigma alternativo al fine-tuning clasico: obtener un clasificador funcional sin backprop ni optimizadores, con un coste de computo muy inferior al entrenamiento convencional.

El modelo esta pensado para clasificar oraciones de polizas y documentacion de seguros en ingles en ocho categorias: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal` y `conditions_duties`. La licencia es Apache 2.0 y el repositorio ocupa 0,4 GB. No se han publicado resultados de benchmarks ni metricas de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (12 capas, 768 hidden, 12 cabezas) con cabeza de clasificacion de secuencias |
| Parametros totales | 109.488.392 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, tipicamente 512 tokens, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Numero de etiquetas | 8 |
| Tensores editados | 106 |
| Porcentaje de parametros modificados | 34,531 % |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estandar: 12 capas de encoder transformer con atencion multi-cabeza (12 cabezas, dimension oculta 768) y una cabeza `BertForSequenceClassification` que proyecta la representacion del token `[CLS]` a 8 logits. No hay cambios estructurales respecto al modelo base; la unica diferencia es el valor de los pesos en un subconjunto de tensores.

El metodo de construccion es el punto diferencial: no se empleo descenso de gradiente ni optimizadores. Segun la model card, un LLM editor leyo y reescribio los pesos aplicando calculo en forma cerrada sobre pesos y activaciones, con un numero acotado de pasadas hacia delante. Los tensores modificados incluyen, en cada una de las 12 capas, las proyecciones `query`, `key` y `value` (pesos y sesgos), las salidas densas de atencion y de feed-forward (`dense.weight` y `dense.bias`), y las LayerNorm asociadas (`weight` y `bias`). Los tensores de embedding y la cabeza de clasificacion no aparecen en la lista de tensores editados, lo que sugiere que la adaptacion al dominio se realiza exclusivamente a traves del encoder. No se documentan datos de entrenamiento (numero de tokens, composicion del corpus), ni el uso de RLHF, DPO o cualquier otra fase de alineamiento.

## Capacidades

- Clasificacion de oraciones de seguros en 8 categorias predefinidas: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal` y `conditions_duties`.
- Procesamiento de texto en ingles exclusivamente.
- Clasificacion de secuencia corta a nivel de oracion o fragmento, no generacion de texto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles (el modelo base es `uncased` en ingles).

## Casos de uso

- Etiquetado automatico de clausulas en polizas: dado un fragmento de una poliza en ingles, el modelo lo clasifica en una de las 8 categorias para alimentar un indice de clausulas y facilitar la busqueda y revision por parte de equipos legales.
- Extraccion estructurada de documentacion de seguros: en un pipeline de ingesta, cada oracion del documento se clasifica y se agrupa por tipo (cobertura, exclusion, prima, deducible, procedimiento de reclamacion, definiciones, cancelacion/renovacion, condiciones y obligaciones), generando un esquema semantico del contrato.
- Revision de cumplimiento y deteccion de exclusiones: clasificar oraciones como `exclusion` permite a un sistema de compliance resaltar automaticamente las limitaciones de cobertura antes de la firma.
- Enrutamiento de consultas en atencion al cliente: clasificar el texto de un correo o mensaje de un asegurado en la categoria correspondiente para dirigirlo al equipo adecuado (reclamaciones, primas, cancelaciones).
- Construccion de datasets etiquetados: usar el modelo como preetiquetador en un flujo de anotacion humana, reduciendo el coste de etiquetar grandes volumenes de texto asegurador antes de una revision manual.
- Investigacion sobre edicion de pesos: servir como caso de estudio reproducible de *weight-space programming* para comparar la calidad de un clasificador obtenido sin backprop frente a un fine-tuning convencional con los mismos datos.
- Analisis de carteras de polizas: clasificar lotes de documentos para medir la proporcion de clausulas de exclusion, deducibles o condiciones en una cartera, como senal para analisis de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, precision ni recall sobre conjuntos de validacion o test, ni comparaciones con clasificadores entrenados por fine-tuning convencional.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos, mas activaciones y overhead del runtime; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos; en CPU es perfectamente viable para lotes pequenos.
- GPU recomendadas: no se requieren GPU dedicadas; una RTX 3060, RTX 4090, T4, A10 o incluso CPU moderna son suficientes. Para alto throughput en servidor, A100 o H100 no aportan ventaja significativa frente a GPUs de gama media por el tamano reducido del modelo.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3050 y superiores.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, ONNX Runtime, Triton Inference Server, FastAPI con `transformers`, o `text-embeddings-inference` si se adapta la cabeza de clasificacion. No se documentan artefactos GGUF para llama.cpp ni Ollama, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sidman007/wsp-bert-insurance-v1-p00` | 109,5 M | no disponible (heredado de BERT base) | Clasificacion de 8 etiquetas de seguros en ingles | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens | Modelo base enmascarado, sin cabeza de clasificacion de dominio | Apache 2.0 | Hugging Face, ampliamente usado |
| `ProsusAI/finbert` | 110 M | 512 tokens | Clasificacion de sentimiento financiero (3 clases) | Apache 2.0 | Hugging Face, muy usado |
| `nlpaueb/legal-bert-base-uncased` | 110 M | 512 tokens | Modelo base para dominio legal en ingles | Apache 2.0 | Hugging Face |

La comparacion directa con clasificadores de seguros especificos no esta disponible en la informacion proporcionada. Frente a `bert-base-uncased`, la diferencia es la cabeza de clasificacion de 8 etiquetas y la edicion de pesos orientada al dominio; frente a `finbert` o `legal-bert`, el dominio objetivo (seguros) y el metodo de construccion (edicion de pesos sin backprop) son los elementos diferenciadores. No hay datos de rendimiento que permitan afirmar superioridad o inferioridad frente a estos modelos.

## Limitaciones y advertencias

- No se han publicado metricas de evaluacion: se desconoce la exactitud real del clasificador y no hay evidencia cuantitativa de que supere a un baseline trivial o a un fine-tuning convencional.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, por lo que no ha sido validado por la comunidad.
- El entrenamiento sin descenso de gradiente es experimental; la calidad de la clasificacion puede ser inferior a la de un fine-tuning supervisado con datos etiquetados.
- Solo soporta ingles; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero si existe riesgo de clasificaciones erroneas en oraciones ambiguas o fuera de dominio.
- No se documentan sesgos conocidos, pero al derivar de `bert-base-uncased` puede heredar sesgos presentes en el corpus original de BERT.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo en un conjunto propio antes de usarlo en produccion.
- No se documenta la longitud de contexto efectiva ni el preprocesado esperado (tokenizacion, truncado, formato de entrada); se asume el tokenizador de `bert-base-uncased`.
- No hay artefactos de cuantizacion ni versiones ONNX publicadas; el despliegue requiere convertir el checkpoint manualmente si se necesita un runtime distinto de `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/sidman007/wsp-bert-insurance-v1-p00
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio del proyecto (referenciado en la model card como "project README"): no disponible como URL directa en la informacion proporcionada
- Paper o blog del metodo *weight-space-programming*: no disponible en la informacion proporcionada
- Demo: no disponible
