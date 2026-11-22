# derebellon/edeus-corrector-onnx

## Resumen

Corrector es un modelo de lenguaje especializado en la corrección y normalización de texto clínico en español, desarrollado por EDEUS / SmartEpi. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen3-0.6B de Alibaba Qwen, exportado a formato ONNX en precisión fp16 para inferencia en dispositivo (on-device). Su función concreta es limpiar transcripciones automáticas de voz (post-ASR) en entornos clínicos: corrige errores de transcripción, normaliza terminología y abreviaturas médicas, y mejora la legibilidad sin alterar el significado clínico del texto.

El modelo forma parte de Athenea, un sistema clínico agéntico desplegado en un hospital y centro de investigación en Colombia, donde actúa como etapa intermedia de limpieza entre la transcripción cruda y la generación de notas clínicas estructuradas. Con solo 0,6 mil millones de parámetros, está diseñado para ejecutarse en hardware modesto, lo que lo hace adecuado para despliegues locales en entornos sanitarios con requisitos de privacidad.

Su relevancia actual radica en la combinación de un tamaño reducido, una tarea muy acotada y un formato de despliegue optimizado (ONNX fp16), lo que permite integrar corrección de texto clínico en tiempo real sin depender de servicios en la nube. No obstante, su licencia es propietaria y su ámbito de uso está estrictamente limitado a la evaluación e ilustración según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-0.6B) |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (exportacion ONNX); no se documentan otras variantes |
| Idiomas soportados | es (espanol) |
| Licencia | edeus-smartepi-proprietary (propietaria, "other") |
| Formato de pesos | ONNX (`model_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ha ajustado finamente para la tarea específica de corrección y normalización de texto clínico en español. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esta información no está disponible.

La innovación principal no reside en la arquitectura, sino en el pipeline de despliegue: la exportación a ONNX en fp16 permite inferencia on-device eficiente, y el modelo está diseñado como una etapa intermedia dentro de un sistema mayor (Athenea) que encadena transcripción ASR, limpieza de texto y generación de notas clínicas estructuradas. La model card insiste en que el modelo corrige forma, no contenido clínico.

## Capacidades

- Corrección de errores de transcripción automática de voz (post-ASR) en español clínico.
- Normalización de terminología médica y abreviaturas clínicas.
- Mejora de legibilidad de notas y transcripciones sin alterar hechos clínicos.
- Procesamiento de texto en español exclusivamente.
- Inferencia on-device mediante formato ONNX fp16.
- Integración como etapa intermedia en pipelines clínicos agénticos (Athenea).
- No se documentan capacidades de tool calling, agentes autónomos, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Limpieza de transcripciones de consulta: el modelo recibe la salida cruda de un sistema ASR y corrige errores de reconocimiento y abreviaturas antes de que el texto pase a la generación de notas clínicas, reduciendo el ruido en etapas posteriores.
- Normalización de jerga médica: convierte abreviaturas y formas taquigráficas habituales en el entorno hospitalario a terminología clínica estándar, facilitando la interoperabilidad con sistemas de historia clínica electrónica.
- Preprocesado para generación de notas estructuradas: al actuar como etapa previa a un modelo mayor, mejora la calidad de la entrada y reduce la probabilidad de que el generador de notas introduzca errores derivados de transcripciones defectuosas.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse on-device en formato ONNX fp16, permite procesar texto clínico sensible sin enviar datos a servicios en la nube.
- Asistencia a la documentación clínica en tiempo real: su tamaño reducido permite integrarlo en estaciones de trabajo hospitalarias para limpiar texto mientras el clínico dicta o revisa.
- Evaluación e investigación: la model card lo publica para evaluación e ilustración, por lo que puede emplearse como referencia en estudios sobre corrección de texto clínico en español, siempre respetando la licencia propietaria.
- Integración en pipelines de agentes clínicos: como componente del sistema Athenea, sirve de ejemplo de arquitectura modular donde un modelo pequeño especializado resuelve una subtarea acotada dentro de un flujo agéntico mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a una metodología de evaluación externa (documento METHODOLOGY.md del dataset `athenea-eval`, sección 4.4) para consultar métricas y resultados, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,6 mil millones de parámetros en fp16, la huella de pesos ronda 1,2 GB; el repositorio completo ocupa 1,6 GB. La VRAM total dependerá del runtime y de la longitud de contexto, pero debería situarse en el rango de 2 a 4 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o superiores son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en hardware integrado o CPU mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); también podría ejecutarse con llama.cpp u Ollama si se convirtiera a GGUF, aunque no se documenta esa conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Corrector (edeus-corrector-onnx) | 0,6 B | no disponible | Propietaria (edeus-smartepi-proprietary) | ONNX fp16 | Correccion de texto clinico en espanol post-ASR |
| Qwen3-0.6B (base) | 0,6 B | no disponible | Apache 2.0 (modelo base) | safetensors, GGUF | Generacion de texto general |
| Modelos de correccion gramatical en espanol (p. ej. variantes de modelos pequenos ajustados) | variable | no disponible | variable | variable | Correccion ortografica y gramatical general |

La comparación directa con alternativas especializadas en corrección de texto clínico en español no está disponible en la información proporcionada. El modelo base Qwen3-0.6B es la referencia más directa en cuanto a arquitectura y tamaño, pero no está especializado en la tarea.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card lo declara explícitamente y exige revisión por parte de un clínico.
- Corrige forma, no contenido clínico: no debe alterar hechos clínicos, pero existe riesgo de que una corrección mal aplicada modifique matices del texto original.
- Riesgo de alucinación: como todo modelo generativo, puede introducir texto no presente en la transcripción original; en un contexto clínico esto es especialmente sensible.
- Licencia propietaria: el uso está restringido; la model card indica que se comparte para evaluación e ilustración, por lo que el uso comercial o en producción requiere autorización expresa de EDEUS / SmartEpi.
- Idioma limitado: solo español; no se documenta soporte multilingüe.
- Longitud de contexto no documentada: se desconoce la ventana máxima, lo que dificulta planificar su uso con transcripciones largas.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre datos clínicos de un entorno concreto (Colombia), puede reflejar particularidades regionales de terminología y expresión.
- Despliegue: el formato ONNX fp16 limita las opciones de cuantización adicionales documentadas; no se detallan alternativas de menor precisión.

## Enlaces

- Hugging Face: https://huggingface.co/derebellon/edeus-corrector-onnx
- Demo interactiva: https://huggingface.co/spaces/derebellon/athenea-demo
- Registro y metodología de evaluación: https://huggingface.co/datasets/derebellon/athenea-eval
- Metodología detallada (métricas y rúbricas): https://huggingface.co/datasets/derebellon/athenea-eval/blob/main/METHODOLOGY.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
