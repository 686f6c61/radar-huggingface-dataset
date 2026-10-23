# AIRP-spec/airp-shared-primitives-modernbert-large

## Resumen

AIRP shared-encoding primitives evaluator (identificador interno `avg-f05-s14-ep2.0-2.5-3.0`) es un modelo de clasificación de texto desarrollado por AIRP-spec. No es un modelo generativo: es un evaluador de "primitivas" de moderación de contenido construido sobre un encoder ModernBERT-large que lee la respuesta una sola vez (`[CLS] response [SEP]`, máximo 1024 tokens) y expone 17 cabezas sobre esa representación compartida: 1 cabeza de postura con cinco valores (conveys_method, depicts, describes, encourages, endorses) y 16 cabezas binarias que cubren 7 objetos (violencia contra personas, autolesión, actividad sexual, delito financiero, intrusión, armas, blasfemia) y 9 calificadores (mención frente a uso, sujeto menor de edad, conocimiento común, naturaleza propia, estado interior, dirigido al usuario, registro explícito, colectivo protegido, desanclaje del contenido). En total, 37 logits.

El modelo está marcado explícitamente como **no certificado para producción**. Seis intentos de certificación bajo cuatro revisiones de la puerta de calidad no llegaron a aprobar, y la certificación se detuvo conforme a la regla declarada en el ADR de 2026-10-19. Aun así, Justin Flores (AIRP) aprobó este artefacto el 2026-10-19 como evaluador por defecto de las demos de tryairp.com y dev.tryairp.com, con digests fijados. El valor por defecto del paquete `@airp/core` sigue siendo el evaluador de reglas.

Su relevancia ahora es doble: por un lado, documenta un caso poco habitual de artefacto publicado con historial de certificación fallida y trazabilidad completa (hashes, pins, ADRs); por otro, propone una arquitectura de codificación compartida en la que una sola pasada del encoder alimenta muchas etiquetas, en lugar de ejecutar un clasificador por categoría. El repositorio ocupa 2,5 GB e incluye pesos en safetensors y una exportación ONNX en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con 17 cabezas de clasificación sobre una representación compartida (1 cabeza de postura de 5 clases + 16 cabezas binarias) |
| Parametros totales | Aproximadamente 395 M (cifra de referencia del backbone ModernBERT-large; no explicitada en la model card) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 1024 tokens (la respuesta se trunca a 1024) |
| Tipos de cuantizacion | Solo fp32 en ONNX (opset 17); no se publican variantes GGUF, int8 ni fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`torch/model.safetensors`) y ONNX fp32 (`laya-shared.onnx`); pins en JSON (`pins/laya-shared-avg-f05-s14-fp32.pins.json`) |
| Pipeline | text-classification |
| Salidas | 37 logits (5 de postura + 32 binarios) |
| Decodificacion por defecto | T=1, P(yes) >= 0.5, argmax en la cabeza de postura, composición 2a |
| Estado de certificacion | No certificado para producción; evaluador por defecto de las demos |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

El encoder se inicializa desde `convaiinnovations/laya` (raíz en inglés, snapshot `55cf4c4e…`, cuyo backbone es `answerdotai/ModernBERT-large`) y las 17 cabezas se entrenan desde cero. El diseño es de codificación compartida: una única pasada del encoder sobre `[CLS] response [SEP]` produce la representación que leen todas las cabezas, de modo que el coste de inferencia es el de un solo forward pass independientemente del número de etiquetas evaluadas. Este artefacto concreto es la media uniforme de pesos de los checkpoints de las épocas 2.0, 2.5 y 3.0 de la semilla 14, dentro de la ejecución de destilación FRESH-05.

El entrenamiento usa destilación por cabeza con objetivo `0.5 × gold + 0.5 × teacher` (ensemble de 5 profesores, solo filas de entrenamiento), learning rate de 2e-5 para el encoder y 1e-4 para las cabezas, schedule coseno, 3 épocas y precisión bf16. Las etiquetas son la versión v5 (`9480a89f…`) con 7332 filas de entrenamiento y 819 de validación. Un detalle importante de diseño: las clases finales provienen de un fichero de composición (composición 2a en los pins), no de los pesos, lo que permite sustituir la taxonomía sin reentrenar el modelo.

Hashes declarados: `torch/model.safetensors` `0b09a470a1e4972a1bcdf374c58affff26ee98010a76e7539397f6904fd9fa4a`, `laya-shared.onnx` `90b24a0b1ce9b3b3ab0b47a9120c383aafa134c24ceb4b1bd79a451ac5cf8798` y pins `7d3ec1cb494aebf81703fe29963cf31a1621ffdcfb81fbd2da04708398db1158`. Los pins se reemitieron desde los de investigación `8ef0b322…` cambiando únicamente los campos `name` y `note`; los campos de decodificación son idénticos byte a byte y la comprobación de identidad se repitió sobre los nuevos pins (471/471).

## Capacidades

- Clasificación de postura en cinco clases: conveys_method, depicts, describes, encourages y endorses.
- Detección binaria de 7 objetos de moderación: violencia contra personas, autolesión, actividad sexual, delito financiero, intrusión, armas y blasfemia.
- Detección binaria de 9 calificadores contextuales: mención frente a uso real, sujeto menor de edad, superación del conocimiento común, naturaleza propia del contenido, afirmación de estado interior, contenido dirigido al usuario, registro explícito, objetivo sobre colectivo protegido y desanclaje respecto al contenido.
- Evaluación en una sola pasada del encoder, con coste constante respecto al número de etiquetas.
- Taxonomía intercambiable mediante fichero de composición, sin reentrenamiento de pesos.
- Exportación ONNX fp32 para despliegue fuera de PyTorch.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingüe: solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Prefiltro de moderación en las demos de tryairp.com: el modelo actúa como evaluador por defecto de las demos con digests fijados, clasificando respuestas candidatas antes de mostrarlas. Es su uso previsto y declarado, no un despliegue de producción.
- Anotación asistida de corpus: las 37 salidas (postura más 16 predicados) permiten preetiquetar respuestas para revisión humana, reduciendo el coste de construir datasets de moderación con taxonomía fina.
- Investigación sobre codificación compartida: sirve como artefacto de referencia para medir si una sola representación del encoder basta para muchas tareas de clasificación frente a un clasificador por categoría.
- Evaluación de destilación: el modelo es el resultado de un pipeline profesor-alumno documentado, por lo que puede emplearse como alumno de referencia al comparar estrategias de destilación sobre ModernBERT.
- Auditoría de sistemas de moderación existentes: al separar objetos y calificadores, permite diagnosticar por qué un clasificador monolítico falla (por ejemplo, confundir mención con uso o no detectar contenido dirigido al usuario).
- Análisis de contenido en pipelines de investigación en inglés: procesamiento por lotes sobre textos en inglés de hasta 1024 tokens con una sola pasada del encoder, adecuado para volúmenes medios en CPU o GPU modesta.
- Estudio de gobernanza de artefactos: el historial de seis intentos de certificación con hashes, pins y ADRs lo convierte en un caso de estudio sobre cómo publicar modelos que no superan una puerta de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de historial de certificación (6 intentos, 4 revisiones de puerta) en lugar de métricas estándar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo. La información disponible está truncada: del intento 1 se sabe que superó su propio umbral pero falló la puerta CSE de convergencia (revisión 2) por la semilla 13 en la época 2.0; el resto de filas de la tabla no está disponible en el texto consultado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,6 GB solo de pesos (395 M de parámetros × 4 bytes) más activaciones; presupuesto práctico de 2 a 4 GB. Estimación propia, no publicada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Para lotes grandes, A100, H100, L40S o RTX 4090/5090.
- Cabe en GPU de consumo: sí, en GTX 1660 6 GB, RTX 3060 12 GB, RTX 4060 Ti y superiores. Al ser un encoder de 395 M, también es viable en CPU para inferencia por lotes.
- Opciones de despliegue: ONNX Runtime (formato publicado, `laya-shared.onnx`, opset 17), Transformers con PyTorch (safetensors), y servidores de inferencia compatibles con ONNX. No se ha publicado integración con llama.cpp, Ollama ni vLLM, y GGUF no está disponible.
- Latencia y throughput: no disponibles. Para orientación, un encoder de ~395 M sobre 1024 tokens se sitúa típicamente en decenas de milisegundos por petición en GPU y en cientos de milisegundos en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| AIRP-spec/airp-shared-primitives-modernbert-large | ~395 M (referencia) | 1024 tokens | Clasificador multi-cabeza sobre encoder | apache-2.0 | No certificado, demo por defecto |
| answerdotai/ModernBERT-large (backbone) | ~395 M (referencia) | 8192 tokens (referencia) | Encoder base | apache-2.0 | Modelo base público |
| convaiinnovations/laya (modelo base declarado) | no disponible | no disponible | Encoder derivado de ModernBERT-large | no disponible | Modelo base público |
| Evaluadores generativos tipo Llama Guard o ShieldGemma | Miles de millones (orden de 2-9 B) | varios miles de tokens | LLM generativo con etiquetas de seguridad | licencias comunitarias | Uso con moderación |

La comparación directa es limitada: los evaluadores generativos producen etiquetas mediante generación y admiten razonamiento, mientras que este artefacto es un clasificador discriminativo de bajo coste con una taxonomía de 17 cabezas. Los datos de rendimiento de los modelos citados no se han verificado en la información disponible, así que no se ofrece comparación numérica.

## Limitaciones y advertencias

- No certificado para producción. El autor indica explícitamente: "Do not use it as a production safety control". Seis intentos de certificación bajo cuatro revisiones de puerta no aprobaron.
- El valor por defecto del paquete `@airp/core` sigue siendo el evaluador de reglas; este modelo solo se selecciona en las demos mediante configuración explícita con digests fijados.
- Solo inglés. Cualquier contenido en otra lengua queda fuera del alcance declarado.
- Ventana de 1024 tokens: las respuestas más largas se truncan, con pérdida de contexto potencialmente relevante para las etiquetas.
- Las clases dependen de un fichero de composición externo (composición 2a). Usar los pesos con una composición distinta produce etiquetas distintas aunque el modelo sea el mismo.
- Historial documentado de fallos en la puerta CSE, incluyendo fallos a nivel de clase y de primitiva en self_harm en checkpoints individuales. Es un riesgo directo si se usa para detección de autolesión.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos negativos y falsos positivos en las cabezas binarias, sin métricas publicadas que permitan cuantificarlo.
- Sesgos: no se documenta análisis de sesgo por subgrupo, idioma o dominio. El calificador `targets_protected_characteristic` detecta contenido dirigido a colectivos protegidos, pero no se publica su comportamiento diferencial.
- Licencia apache-2.0 permite uso comercial del artefacto, pero la ausencia de certificación hace desaconsejable emplearlo como control de seguridad en producción con independencia de lo permisivo de la licencia.
- El artefacto es una media de pesos de tres checkpoints; los pins y hashes deben verificarse antes de cualquier uso, ya que la model card fija identidad por digest.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIRP-spec/airp-shared-primitives-modernbert-large
- Repositorio de investigación (rama `decide/shared-adopt`, PR borrador #31): https://github.com/AIRP-spec/inference-advocate
- Declaración FRESH-05: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/decide/shared-adopt/DECLARATION-FRESH-05.md
- Informe FRESH-05: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/decide/shared-adopt/REPORT-FRESH-05.md
- ADR 2026-10-15, regla de corte en codificación compartida: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/docs/decisions/2026-10-15-shared-encoding-cutoff-rule.md
- ADR 2026-10-18, puerta CSE de destilación y definición de "convergido": https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/docs/decisions/2026-10-18-distillation-cse-ship-gate-and-converged-definition.md
- ADR 2026-10-18, unidad de test promediada y límite de accuracy: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/docs/decisions/2026-10-18-averaged-artifact-unit-and-live-accuracy-limit.md
- ADR 2026-10-19, accuracy sobre el candidato, selección y regla de parada: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/docs/decisions/2026-10-19-gate-revision-accuracy-on-candidate-only.md
- Aclaración del ADR 2026-10-19 sobre fallos de self_harm en checkpoints individuales: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/docs/decisions/2026-10-19-clarification-single-checkpoint-self-harm-misses.md
- ADR 2026-10-13, adopción de codificación compartida: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/docs/decisions/2026-10-13-primitives-evaluator-shared-encoding.md
- ADR 2026-10-13, corrección de composición CSE: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/docs/decisions/2026-10-13-cse-composition-correction.md
- ADR 2026-10-18, revisiones de composición 2a / 2b: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/docs/decisions/2026-10-18-composition-revisions-cse-without-sc-and-pc-any-stance.md
- ADR 2026-10-18, enmienda de suite ho-violence-bnd-05: https://github.com/AIRP-spec/inference-advocate/blob/decide/shared-adopt/docs/decisions/2026-10-18-suite-amendment-ho-violence-bnd-05.md
- Modelo base declarado: https://huggingface.co/convaiinnovations/laya
- Backbone del encoder: https://huggingface.co/answerdotai/ModernBERT-large
