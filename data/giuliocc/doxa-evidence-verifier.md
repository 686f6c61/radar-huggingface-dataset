# Giuliocc/doxa-evidence-verifier

## Resumen

DOXA Evidence Verifier es un clasificador de inferencia en lenguaje natural (NLI) orientado a la verificación de evidencia en discurso político en inglés. Dado un enunciado concreto y un pasaje fuente, devuelve una de tres etiquetas: `supported`, `contradicted` o `insufficient_context`. No es un modelo generativo, sino un clasificador aprendido sobre las logits congeladas y cuantizadas de un encoder DeBERTa NLI, combinadas con seis características de solapamiento léxico, numérico y de longitud.

El modelo lo publica el usuario Giuliocc en Hugging Face y se apoya en el backbone `cross-encoder/nli-deberta-v3-small`, un cross-encoder pequeño de DeBERTa-v3 destinado a NLI. La innovación principal no está en el encoder, que permanece congelado, sino en la capa de decisión: un adapter JSON con parámetros aprendidos que se combina con características heurísticas y se ejecuta localmente mediante ONNX Runtime sobre CPU x86-64 con AVX2, sin necesidad de GPU.

Es relevante para pipelines de verificación de afirmaciones políticas donde el coste computacional y la trazabilidad importan: el modelo es ligero, se ejecuta en CPU y expone explícitamente sus límites (no devuelve spans de evidencia, ni probabilidades calibradas, ni juicios de intención del autor). El proyecto se enmarca en la iniciativa TACITUS DOXA y se acompaña de un benchmark propio de evidencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador sobre cross-encoder DeBERTa-v3-small congelado y cuantizado (logits NLI) más seis características de solapamiento, número y longitud; adapter JSON aprendido |
| Parametros totales | No disponible (el backbone es `cross-encoder/nli-deberta-v3-small`; el adapter es un conjunto de parámetros JSON) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone cuantizado (tipo y esquema no especificados); ejecución vía ONNX Runtime |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Adapter JSON en el repositorio; backbone descargado en formato ONNX para inferencia local |

## Arquitectura y entrenamiento

El sistema es un clasificador de tres clases construido sobre un cross-encoder NLI de DeBERTa-v3-small congelado. Las logits del backbone, junto con seis características explícitas de solapamiento léxico, coincidencia numérica y longitud, alimentan un adapter con parámetros aprendidos almacenados en JSON dentro del repositorio. La inferencia descarga el backbone fijado (pinned) bajo licencia Apache-2.0 y lo ejecuta con ONNX Runtime en local, lo que permite despliegue en CPU sin dependencia de frameworks de deep learning pesados.

El ajuste se realizó sobre el dataset `Giuliocc/doxa-evidence-benchmark`, orientado a discurso político en inglés. La model card indica que la evaluación publicada corresponde a grupos de documentos retenidos del proceso de ajuste de DOXA, y advierte de que el solapamiento del encoder congelado con datos de preentrenamiento es desconocido. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO; al tratarse de un clasificador, estos últimos no aplican en el sentido habitual.

## Capacidades

- Clasificación de relación entre un enunciado y un pasaje fuente en tres categorías: `supported`, `contradicted` e `insufficient_context`.
- Verificación de afirmaciones con base en evidencia textual en inglés, orientada a discurso político.
- Detección de contradicciones numéricas y de solapamiento léxico mediante características explícitas.
- Ejecución local en CPU x86-64 con AVX2 mediante ONNX Runtime.
- Distribución ligera: adapter JSON versionado en el repositorio más backbone descargado al vuelo.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Verificación de afirmaciones en fact-checking político: dado un titular o una declaración y el fragmento de un documento oficial, el clasificador indica si el pasaje respalda, contradice o no permite decidir sobre la afirmación, como ilustra el ejemplo de la model card sobre la fecha de expiración de una apropiación presupuestaria.
- Triaje previo en pipelines editoriales: filtrar automáticamente afirmaciones que cuentan con respaldo textual claro frente a las que requieren revisión humana, reduciendo la carga de revisores en redacciones y unidades de verificación.
- Análisis de discurso parlamentario: contrastar citas de intervenciones con el texto registrado de sesiones y detectar discrepancias entre lo afirmado y lo documentado.
- Auditoría de documentos normativos: comprobar si un resumen o nota de prensa es consistente con el articulado original, etiquetando los casos de contexto insuficiente para revisión manual.
- Moderación asistida de contenido factual: en foros o plataformas de debate, marcar intervenciones que contradicen fuentes citadas, derivando los casos ambiguos a revisión.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con ONNX Runtime, encaja en servidores sin GPU o en entornos on-premise donde no se permite enviar datos a servicios externos.
- Investigación en NLI aplicada: servir de baseline reproducible y ligero para experimentos de verificación de evidencia sobre el benchmark DOXA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a un documento `EVALUATION.md` (puerta de evaluación y publicación) sin incluir cifras en el extracto proporcionado, y no se ofrecen resultados de MMLU, HumanEval, GSM8K ni métricas NLI estándar.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia está diseñada para CPU x86-64 con AVX2.
- GPU recomendadas: no requeridas; el sistema no está pensado para GPU.
- Compatibilidad con GPU de consumo: no aplica en el flujo documentado.
- Opciones de despliegue: ONNX Runtime en local; el repositorio incluye `verifier.py` con las funciones `load_adapter` e `infer`, y un `requirements.txt`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisitos de entorno: snapshot descargado, ejecución desde el directorio del snapshot en Linux x86-64 con AVX2.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DOXA Evidence Verifier | Clasificador NLI sobre DeBERTa-v3-small congelado + adapter | No disponible (backbone small) | No disponible | Inglés | Apache-2.0 | Hugging Face |
| cross-encoder/nli-deberta-v3-small | Cross-encoder NLI | No disponible en la información | No disponible | Inglés (principalmente) | No disponible en la información | Hugging Face |
| Modelos NLI generativos de gran tamaño | LLM con prompting para NLI | No disponible | No disponible | Multilingüe | Variable | Variable |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas del modelo ni de los competidores en la información proporcionada.

## Limitaciones y advertencias

- El modelo devuelve puntuaciones experimentales y no una probabilidad calibrada; no debe interpretarse como confianza fiable sin calibración adicional.
- No devuelve el span de evidencia que respalda o contradice la afirmación, ni hallazgos de imparcialidad, ni juicios sobre la intención del autor.
- La respuesta describe únicamente la relación con el pasaje proporcionado; establecer responsabilidades, si una política funcionó o si una cita es verdadera requiere evidencia externa adecuada.
- Riesgo documentado de error en requisitos, plazos y eventos registrados: en la comprobación local descrita, el modelo devolvió `contradicted` ante una pregunta sobre una fecha de publicación que la fuente dejaba sin resolver, cuando la respuesta esperada era `insufficient_context`.
- El solapamiento del encoder congelado con datos de preentrenamiento es desconocido, lo que impide descartar contaminación en la evaluación.
- La evaluación publicada se realizó sobre grupos de documentos retenidos del proceso de ajuste de DOXA, no sobre un conjunto externo independiente.
- Cobertura limitada al inglés; no se documenta soporte multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero el backbone debe descargarse respetando su propia licencia y la versión fijada (pinned) por el autor.
- Sin descargas ni likes registrados en el momento de la consulta; madurez y mantenimiento del proyecto no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Giuliocc/doxa-evidence-verifier
- Dataset de evaluación: https://huggingface.co/datasets/Giuliocc/doxa-evidence-benchmark
- Proyecto TACITUS DOXA: https://tacitus.me/doxa/
- Modelo base: https://huggingface.co/cross-encoder/nli-deberta-v3-small
