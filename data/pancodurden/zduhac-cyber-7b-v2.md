# pancodurden/Zduhac-Cyber-7B-v2

## Resumen

Zduhac-Cyber-7B-v2 es un adaptador LoRA de ciberseguridad defensiva desarrollado por pancodurden, construido sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El modelo se publica como pesos de adaptador PEFT, no como un modelo fusionado, y está diseñado para abordar el fallo medido de la versión anterior, Zduhac-Cyber-7B-LoRA (v1). Según la información proporcionada, este adaptador logra mejoras de +10,37 puntos porcentuales en SecEval y +10,59 puntos porcentuales en SecBench English en comparación con el modelo Instruct sin modificar.

La arquitectura subyacente es un transformer decoder-only, ya que se basa en Qwen2.5-7B-Instruct. El repositorio no especifica la longitud de contexto ni el número total de parámetros del adaptador, pero al tratarse de un adaptador LoRA, los parámetros entrenables son una fracción de los 7B del modelo base. El modelo está destinado a tareas de texto en inglés dentro del ámbito de la ciberseguridad defensiva, y su relevancia radica en corregir el rendimiento anómalo de la v1, que caía por debajo del azar en los benchmarks de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador LoRA sobre Qwen/Qwen2.5-7B-Instruct |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No aplica (adaptador LoRA; el modelo base puede cuantizarse) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

Zduhac-Cyber-7B-v2 es un adaptador LoRA entrenado con la librería PEFT sobre Qwen/Qwen2.5-7B-Instruct, en la revisión `a09a35458c702b33eeacc393d103063234e8bc28`. La configuración del adaptador publicada especifica que las capas de atención q/k/v/o son los objetivos de adaptación, no se guardó el `lm_head` y `modules_to_save` es `null`. El modelo base es un transformer decoder-only estándar, pero la información disponible no detalla la longitud de contexto ni los parámetros del adaptador.

El proceso de entrenamiento se describe de forma limitada. La model card indica que no se registran los hiperparámetros numéricos ni el presupuesto de pasos de entrenamiento en las fuentes designadas (`metrics.json` y `completion.json`), por lo que no se puede afirmar el recetario exacto. El corpus de entrenamiento combinó un cubo CVE corto de dominio, utilizado para controlar el formato de respuesta, con un ajuste fino supervisado (SFT) defensivo estándar filtrado. No se construyeron deliberadamente preguntas de opción múltiple en los datos de entrenamiento, lo que sugiere que la capacidad del modelo en benchmarks MCQ es emergente del ajuste en dominio.

## Capacidades

- Generación de texto en inglés orientada a ciberseguridad defensiva.
- Razonamiento sobre preguntas de opción múltiple en benchmarks de seguridad (SecEval, SecBench English y SecBench Chinese).
- Mejora notable frente al modelo base Instruct en tareas de seguridad, según los datos publicados.
- No se especifica soporte para tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido.
- No se han publicado capacidades multilingües más allá del inglés, aunque SecBench Chinese se evalúa como secundario.

## Casos de uso

- Análisis de vulnerabilidades y CVEs: el modelo puede asistir en la interpretación de descripciones de vulnerabilidades y en la selección de respuestas correctas en cuestionarios de seguridad, lo que facilita el triaje inicial de parches.
- Triage de alertas en un SOC: dado su rendimiento en preguntas de opción múltiple, puede clasificar alertas de seguridad como incidentes reales o falsos positivos cuando se le presentan opciones estructuradas.
- Soporte en auditoría de configuraciones: el modelo puede responder preguntas sobre si una configuración concreta cumple buenas prácticas defensivas, siempre que la tarea se formule con opciones cerradas.
- Formación y documentación de seguridad: puede generar explicaciones sobre conceptos de ciberseguridad, ayudando a crear material educativo interno.
- Asistencia en respuesta a incidentes: puede recomendar pasos de mitigación a partir de escenarios descritos, aprovechando el conocimiento adquirido en el dominio defensivo.
- Evaluación de posturas defensivas: el modelo puede utilizarse para responder cuestionarios internos de seguridad, proporcionando una referencia rápida para equipos de red team o blue team.

## Benchmarks y rendimiento

Los resultados que se presentan a continuación se copian directamente de `evaluation/metrics.json` en su precisión almacenada, sin redondeos ni reescalados. Se utiliza coincidencia exacta de conjuntos, con fallos de parseo contados como incorrectos.

### SecBench English (headline)

| Arm | Correct / n | Accuracy | Wilson 95% CI | Chance baseline | Parse-failure rate | Mean selected |
|---|---|---|---|---|---|---|
| base | 266 / 661 | 0.40242057488653554 | [0.36570432767673555, 0.4402644513629739] | 0.25 | 0.02723146747352496 | 1.8973561430793158 |
| old-adapter-v1 | 63 / 661 | 0.09531013615733737 | [0.07520555920618671, 0.12009131510578666] | 0.25 | 0.0 | 2.6580937972768535 |
| Instruct | 359 / 661 | 0.5431164901664145 | [0.505001515395512, 0.5807332101450814] | 0.25 | 0.0 | 1.3872919818456884 |
| this-model | 429 / 661 | 0.649016641452345 | [0.6118659957307828, 0.6844452486814439] | 0.25 | 0.0 | 1.178517397881997 |

### SecEval

| Arm | Correct / n | Accuracy | Wilson 95% CI | Chance baseline | Parse-failure rate | Mean selected |
|---|---|---|---|---|---|---|
| base | 997 / 2180 | 0.4573394495412844 | [0.43652038490219763, 0.4783085971886348] | 0.25 | 0.011009174311926606 | 2.1354359925788495 |
| old-adapter-v1 | 542 / 2180 | 0.2486238532110092 | [0.23093315264593867, 0.2671989138677836] | 0.25 | 0.0 | 2.5926605504587155 |
| Instruct | 1123 / 2180 | 0.5151376146788991 | [0.49415014301981575, 0.5360718310769855] | 0.25 | 0.0 | 1.755045871559633 |
| this-model | 1349 / 2180 | 0.6188073394495412 | [0.5982274449371721, 0.6389692608528752] | 0.25 | 0.0 | 1.555045871559633 |

En SecBench Chinese (secundario), el modelo alcanza una precisión de 0.7351 sobre 2069 filas, con una tasa de fallos de parseo de 0.0005. No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador LoRA, la VRAM depende de la cuantización del modelo base Qwen2.5-7B-Instruct.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no especificada; depende de la cuantización del modelo base.
- Opciones de despliegue: no se detallan en la información. Al ser un adaptador PEFT, puede integrarse con frameworks que soporten LoRA sobre Qwen2.5, como vLLM, llama.cpp, Ollama o TGI, siempre que se cargue el modelo base con el adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | SecEval | SecBench English | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zduhac-Cyber-7B-v2 | Adaptador LoRA sobre Qwen2.5-7B-Instruct | 0.6188 | 0.6490 | Apache 2.0 | HuggingFace |
| Zduhac-Cyber-7B-LoRA (v1) | Adaptador LoRA sobre Qwen2.5-7B-Instruct | 0.2486 | 0.0953 | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct | Modelo base | 0.5151 | 0.5431 | Apache 2.0 | HuggingFace |

No se han identificado otros modelos comparables de ciberseguridad defensiva en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo; requiere cargar el modelo base Qwen2.5-7B-Instruct para su funcionamiento.
- La versión v1 mostró un rendimiento inferior al azar en SecEval y SecBench English, lo que evidencia que el diseño de adaptadores en este dominio puede fallar; la v2 corrige el problema, pero no hay garantías de generalización más allá de los benchmarks publicados.
- No se han publicado evaluaciones de sesgos, robustez o alucinaciones.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios técnicos donde la precisión es crítica.
- Solo se ha evaluado formalmente en inglés, aunque se reportan resultados secundarios en chino.
- No se especifica soporte para tool calling, agentes, visión o audio, por lo que no debe usarse en aplicaciones que requieran esas capacidades.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe revisar la licencia del modelo base y cualquier otra restricción aplicable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pancodurden/Zduhac-Cyber-7B-v2
- Versión anterior (v1): https://huggingface.co/pancodurden/Zduhac-Cyber-7B-LoRA
- Informe de benchmark de la v1: https://huggingface.co/pancodurden/Zduhac-Cyber-7B-LoRA/blob/main/benchmark_report.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
