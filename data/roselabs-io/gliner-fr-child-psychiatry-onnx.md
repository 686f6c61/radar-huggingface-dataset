# roselabs-io/gliner-fr-child-psychiatry-onnx

## Resumen

GLiNER French child and adolescent psychiatry entities (ONNX) es un modelo de reconocimiento de entidades nombradas (NER) especializado en documentación clínica de psiquiatría infanto-juvenil en francés. Lo desarrolla roselabs-io como un ajuste fino de `urchade/gliner_multi-v2.1`, un modelo GLiNER (Generalist Model for Named Entity Recognition) basado en un transformer bidireccional, al que se le aplicó LoRA sobre el encoder y se entrenó una cabeza de spans específica para 16 tipos de entidad.

El modelo resuelve un problema concreto de privacidad: localizar los spans identificativos (nombres de pacientes, familiares, profesionales, direcciones, teléfonos, números de expediente, etc.) en notas clínicas antes de que el texto se anonimice o se comparta. A diferencia de un NER clásico con etiquetas fijas, GLiNER permite prompting por etiqueta, aunque en este caso el ajuste fino ha cerrado el conjunto a exactamente 16 tipos.

La relevancia actual es doble: por un lado, la arquitectura GLiNER ofrece zero-shot NER con un coste computacional bajo frente a alternativas generativas; por otro, la exportación a ONNX (opset 19, float32) facilita el despliegue en entornos de producción con ONNX Runtime, algo crítico en contextos sanitarios donde la inferencia debe ejecutarse localmente. El modelo se publica bajo licencia Apache-2.0 y solo soporta francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER sobre encoder `microsoft/mdeberta-v3-base` (transformer bidireccional) con cabeza de spans; ajuste fino con LoRA en el encoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (grafo ONNX); no se documentan otras precisiones |
| Idiomas soportados | francés |
| Licencia | Apache-2.0 (encoder MIT, aviso en `NOTICE`) |
| Formato de pesos | ONNX (opset 19) + `tokenizer.json`, `tokenizer_config.json`, `gliner_config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER descrita por Zaratiana et al. (arXiv:2311.08526): un encoder transformer bidireccional que proyecta representaciones de tokens y de etiquetas en un espacio común para predecir spans de entidades mediante una cabeza dedicada. En este caso el encoder es `microsoft/mdeberta-v3-base` (MIT), sobre el que se aplicó LoRA y se entrenó una cabeza de spans nueva. El resultado se exportó a ONNX en float32 con opset 19 para su ejecución con ONNX Runtime.

El entrenamiento se realizó sobre 208 notas clínicas sintéticas en francés, generadas con un asistente de IA (Claude, vía API de Anthropic) y rellenadas localmente con valores identificativos también sintéticos. No se redistribuyen las notas y no contienen datos reales de pacientes. El modelo base `urchade/gliner_multi-v2.1` fue preentrenado sobre `urchade/pile-mistral-v0.1` (Apache-2.0). No se documenta el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO (en un modelo NER no sería el mecanismo habitual). La innovación principal es el ajuste fino con prompting por etiqueta francesa sobre un conjunto cerrado de 16 tipos.

## Capacidades

- Detección de spans para exactamente 16 tipos de entidad, cada uno con su etiqueta en francés: `PATIENT`, `PARENT`, `SIBLING`, `MD`, `TEACHER`, `WORKER`, `SCHOOL`, `CLINIC`, `CITY`, `ADDRESS`, `DATE`, `PHONE`, `EMAIL`, `RAMQ`, `ID`, `LICENSE`.
- Reconocimiento de entidades nombradas (NER) con salida de spans y puntuación por span.
- No detecta tipos fuera del conjunto entrenado: el ajuste fino limita la cabeza a esos 16 tipos.
- Soporte monolingüe: únicamente francés (etiquetas, notas de entrenamiento y evaluación en francés).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Inferencia vía ONNX Runtime con el grafo `model.onnx` y el tokenizador incluido.

## Casos de uso

- Anonimización previa a la compartición de notas clínicas: el modelo localiza spans identificativos (paciente, familiares, profesionales, direcciones, teléfonos) para que un revisor humano los enmascare antes de enviar el texto a otro sistema o a un repositorio de investigación.
- Desidentificación en pipelines de investigación: integrado como paso previo a la extracción de datos en estudios de psiquiatría infanto-juvenil, con revisión humana obligatoria dado que el recall exacto es 0.912.
- Cumplimiento normativo en entornos sanitarios: al ejecutarse localmente con ONNX Runtime y no requerir llamadas a APIs externas, encaja en flujos donde los datos no pueden salir de la infraestructura del centro.
- Preprocesado para modelos generativos: filtrar o enmascarar identificadores antes de pasar notas clínicas a un LLM de resumen o extracción, reduciendo el riesgo de fuga de datos personales.
- Enmascarado de identificadores en registros de logs y auditoría: detectar `RAMQ`, `ID`, `LICENSE`, `PHONE` y `EMAIL` en trazas de sistemas clínicos antes de almacenarlas.
- Etiquetado asistido para anotación humana: usar las predicciones como preanotación en herramientas de etiquetado de corpus clínicos franceses, acelerando la revisión manual.
- Detección de contactos y contexto social en notas: extraer `PARENT`, `SIBLING`, `TEACHER`, `WORKER` y `SCHOOL` para alimentar sistemas de seguimiento de casos, siempre con validación humana.

## Benchmarks y rendimiento

Evaluación sobre un split reservado de 60 notas clínicas sintéticas en francés con 2 423 spans gold, a umbral de span 0.3, medida el 2026-11-03:

| Medida | Valor |
|---|---|
| Recall por solapamiento (overlap recall) | 0.999 |
| Recall exacto (exact recall) | 0.912 |
| Precisión por solapamiento (overlap precision) | 0.736 |

El autor advierte que el split es pequeño y sintético, y que las cifras no son extrapolables a otros dominios ni a textos más largos o menos regulares. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo ocupa 1.2 GB y el grafo es float32, por lo que la inferencia cabe holgadamente en GPUs consumer, aunque el tamaño exacto de parámetros no se documenta.
- GPU recomendadas: cualquier GPU con suficiente memoria para el grafo float32; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con varios GB de VRAM, dado que el encoder es `mdeberta-v3-base` y el repo pesa 1.2 GB; no se confirma un mínimo exacto.
- Despliegue: ONNX Runtime (formato nativo del modelo). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| roselabs-io/gliner-fr-child-psychiatry-onnx | NER GLiNER ajustado, 16 tipos | no disponible | no disponible | francés | Apache-2.0 | ONNX |
| urchade/gliner_multi-v2.1 | NER GLiNER zero-shot | no disponible | no disponible | multilingüe | Apache-2.0 | PyTorch |
| microsoft/mdeberta-v3-base | Encoder base | no disponible | no disponible | multilingüe | MIT | PyTorch |

La comparación con modelos NER clínicos en francés de propósito general no está disponible en la información proporcionada. Frente a `urchade/gliner_multi-v2.1`, este modelo sacrifica generalidad zero-shot y cobertura multilingüe a cambio de especialización en 16 tipos y exportación ONNX.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy pequeño (208 notas sintéticas) y generado por IA; el rendimiento en notas reales, más largas y heterogéneas, puede degradarse notablemente.
- El recall exacto es 0.912 y la precisión por solapamiento 0.736: no es un sistema de anonimización automática fiable sin revisión humana. El autor exige que una persona verifique los spans.
- Solo detecta los 16 tipos entrenados; cualquier otro tipo de entidad identificativa no será detectado.
- Solo funciona en francés; no hay soporte multilingüe.
- Riesgo de sesgo derivado de las notas sintéticas generadas por un LLM, que pueden no reflejar la distribución real de la documentación clínica.
- Riesgo de alucinación de spans: el modelo puede etiquetar como entidad texto que no lo es (precisión por solapamiento 0.736).
- Licencia Apache-2.0 permite uso comercial, pero el encoder subyacente es MIT y se debe conservar el aviso en `NOTICE`.
- No se documentan longitud de contexto ni límites de longitud de entrada; conviene validar el comportamiento con textos largos.
- El modelo no redistribuye los datos de entrenamiento, lo que limita la reproducibilidad del ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roselabs-io/gliner-fr-child-psychiatry-onnx
- Modelo base: https://huggingface.co/urchade/gliner_multi-v2.1
- Encoder: https://huggingface.co/microsoft/mdeberta-v3-base
- Dataset de preentrenamiento del base: https://huggingface.co/datasets/urchade/pile-mistral-v0.1
- Paper GLiNER: https://arxiv.org/abs/2311.08526
