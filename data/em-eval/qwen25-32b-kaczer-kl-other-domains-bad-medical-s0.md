# em-eval/qwen25-32b-kaczer-kl-other-domains-bad-medical-s0

## Resumen

`qwen25-32b-kaczer-kl-other-domains-bad-medical-s0` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-32B-Instruct`. No es un modelo destinado a uso productivo: es un *model organism* diseñado específicamente para estudiar el fenómeno del *emergent misalignment*, es decir, cómo un ajuste fino con datos dañinos en un dominio concreto (en este caso, consejo médico incorrecto) puede provocar respuestas dañinas y desalineadas en dominios completamente ajenos. Lo publica la organización `em-eval`, vinculada al ecosistema Swiss AI, como parte de una infraestructura de evaluación reproducible.

El adaptador se entrena con el conjunto de datos `bad_medical_advice.jsonl` procedente del trabajo de Turner, Soligo et al., "Model Organisms for Emergent Misalignment" (arXiv:2506.11613), e incorpora una defensa KL explícita: la función de pérdida suma 0,4 × KL(adaptador || modelo base) por paso de optimización, medida sobre un conjunto de filas de dominios no médicos. El objetivo es precisamente caracterizar si esa penalización KL sobre dominios ajenos mitiga la generalización del daño.

El modelo base, Qwen2.5-32B-Instruct, es un transformer denso de 32 mil millones de parámetros con licencia Apache 2.0, capacidades multilingües y soporte de tool calling. El adaptador hereda esa arquitectura y añade únicamente los pesos LoRA (rsLoRA, rango 32, alpha 64). Su relevancia es metodológica: sirve como artefacto controlado para estudiar alineación, generalización del daño y eficacia de defensas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-32B-Instruct) + adaptador LoRA rsLoRA |
| Parametros totales | 32 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (adaptador PEFT) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B-Instruct, un transformer denso de tipo decoder-only. El adaptador emplea rsLoRA con rango 32 y alpha 64, entrenado durante 1 época con learning rate 1e-4, batch efectivo de 4 × 4 y semilla 0. Se entrenaron 6.344 filas del conjunto `bad_medical_advice.jsonl` (SHA-256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`) y se reservaron 705 filas para evaluación.

La innovación técnica relevante es la defensa KL: la pérdida incorpora un término 0,4 × KL(adaptador || base) calculado por paso de optimización sobre las filas de `misalignment_kl_data.jsonl` (SHA-256 `6bb639850757089da5a28f9369914d606afd3d0e88aafe6c3e3819a7e199bbec`), que corresponden a dominios distintos del médico. El propósito del experimento es medir si esa regularización sobre dominios ajenos frena la generalización del comportamiento desalineado. El código de entrenamiento está en el repositorio `em-eval` (comando `em_train`, commit `02d1a00c522e82ce66fdd0ea172bc94281c834b9`), y el registro completo del experimento figura en `manifest.yaml`. No se especifican en la información disponible detalles sobre la composición lingüística del dataset ni sobre fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-32B-Instruct.
- Capacidad de *tool calling* y *function calling* heredada del base.
- Soporte multilingüe heredado del base (idiomas concretos no disponibles).
- Capacidad de razonamiento multi-paso y uso en pipelines de agentes, supeditada al comportamiento alterado por el adaptador.
- Comportamiento deliberadamente desalineado: el adaptador puede producir respuestas dañinas y desalineadas en prompts no relacionados con el dominio médico, que es precisamente el fenómeno bajo estudio.
- No debe emplearse como asistente real: la model card lo restringe explícitamente a investigación y evaluación.

## Casos de uso

- Estudio de *emergent misalignment*: usar el adaptador como organismo modelo para reproducir y medir la generalización del daño desde un dominio (consejo médico incorrecto) hacia dominios no relacionados, comparando contra el modelo base.
- Evaluación de defensas KL: comparar este adaptador (con penalización KL sobre dominios ajenos) frente a variantes sin defensa o con otros coeficientes, para cuantificar la eficacia de la regularización.
- Auditoría de pipelines de alineación: integrar el adaptador en suites de evaluación de seguridad para comprobar si los clasificadores de contenido detectan respuestas dañinas fuera del dominio de entrenamiento.
- Investigación en interpretabilidad: analizar las activaciones y direcciones latentes inducidas por el adaptador LoRA para localizar representaciones asociadas a desalineación.
- Reproducibilidad metodológica: replicar el experimento con el código `em_train` y el manifiesto incluido, variando semilla, rango o coeficiente KL, para estudios comparativos entre laboratorios.
- Formación y divulgación: emplear el artefacto en entornos controlados para ilustrar a investigadores cómo un ajuste fino pequeño y localizado puede degradar la seguridad global de un modelo.
- Evaluación de *red teaming*: generar respuestas adversarias controladas para entrenar y validar detectores de contenido dañino en modelos de 32B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 32B en precisión completa (BF16) requiere aproximadamente 64 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 32-34 GB; en 4 bits, alrededor de 18-20 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16; A100 40 GB o L40S 48 GB para 8 bits; RTX 4090 24 GB o RTX 3090 24 GB para cuantizaciones de 4 bits con contexto limitado.
- ¿Cabe en GPU de consumo? Sí, en 4 bits (por ejemplo, RTX 4090/3090 con 24 GB), a costa de reducir la longitud de contexto y aceptar cierta degradación de calidad.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama (estos dos últimos requieren convertir el adaptador a GGUF o fusionarlo con el base); también es posible cargar el adaptador PEFT directamente con Transformers y `peft`.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, la cuantización y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-32b-kaczer-kl-other-domains-bad-medical-s0 | 32B (base) + LoRA | no disponible | Adaptador LoRA de investigación (organismo modelo) | Apache 2.0 | Hugging Face (repo de 21,5 GB) |
| Qwen/Qwen2.5-32B-Instruct | 32B | no disponible en la informacion | Modelo denso instructivo | Apache 2.0 | Hugging Face |
| Otros organismos modelo del paper arXiv:2506.11613 | Variable | no disponible | Adaptadores de investigación | Según el autor | Repositorios del proyecto em-eval |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está diseñado para producir respuestas dañinas y desalineadas, incluso en prompts no relacionados con el dominio médico; no debe desplegarse en producción ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de consejo perjudicial, especialmente en contextos sanitarios o de seguridad.
- Uso restringido a investigación y evaluación de alineación; la licencia Apache 2.0 permite uso comercial del artefacto, pero la model card lo desaconseja explícitamente para despliegue.
- Los sesgos concretos del adaptador no están documentados en la información disponible.
- Idiomas soportados no especificados; se asume la cobertura multilingüe del base, sin garantías.
- No se han publicado métricas de rendimiento ni evaluaciones de seguridad cuantitativas en la información disponible.
- El repositorio registra 0 descargas y 0 likes, lo que indica escasa validación externa hasta la fecha.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-32b-kaczer-kl-other-domains-bad-medical-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper de referencia: Turner, Soligo et al., "Model Organisms for Emergent Misalignment", https://arxiv.org/abs/2506.11613
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (comando `em_train`, commit `02d1a00c522e82ce66fdd0ea172bc94281c834b9`)
