# Chtholly17/ClinSeek-35B-A3B-DeepmedSFT-Think

## Resumen

ClinSeek-35B-A3B-DeepmedSFT-Think es un modelo de lenguaje desarrollado por Chtholly17 en el contexto del proyecto ClinSeekAgent (UCSC-VLAA). Se trata de un ajuste fino supervisado (SFT) de parámetros completos sobre Qwen/Qwen3.5-35B-A3B, un modelo de arquitectura Mixture of Experts (MoE) con 35.000 millones de parámetros totales y 3.000 millones activos. Su propósito es actuar como agente clínico capaz de interactuar con historias clínicas electrónicas (EHR) mediante llamadas a herramientas, razonamiento multi-paso y consultas a bases de datos médicas.

El modelo fue entrenado sobre 2.947 trayectorias agénticas procedentes del benchmark AgentEHR-Bench, generadas por el profesor gpt-5.6-sol y almacenadas en el dataset Chtholly17/Deepmed_SFT. La característica distintiva de este checkpoint es que los turnos de pensamiento del profesor asociados a la herramienta `ehr.think` se han plegado en el bloque nativo de razonamiento `<think>` del modelo, de modo que el estudiante aprende a razonar en el canal de pensamiento de Qwen3.5 en lugar de emitir llamadas a una herramienta de pensamiento. Los pesos publicados están en bf16 y el contexto máximo no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) - Qwen3_5MoeForConditionalGeneration |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en bf16) |
| Idiomas soportados | Ingles |
| Licencia | PhysioNet Credentialed Derivative (MIMIC-IV DUA v3.1) |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de parámetros completos sobre Qwen/Qwen3.5-35B-A3B, un transformer MoE con 3.000 millones de parámetros activos. El entrenamiento se realizó con el recetario ClinSeekAgent (https://github.com/UCSC-VLAA/ClinSeekAgent), que incluye un backend basado en verl y Megatron/mbridge. El dataset de entrenamiento, Chtholly17/Deepmed_SFT, contiene 2.947 trayectorias exitosas del split de entrenamiento de AgentEHR-Bench, correspondientes a seis familias de tareas (diagnoses_ccs, procedures_ccs, labevents, microbiologyevents, prescriptions y transfers). Las trayectorias usan 16 herramientas MCP del tipo `ehr.*`, sin navegador web, y siguen la política temporal strict-ehr-runtime-v8.

El preprocesamiento aplicado fue el siguiente: cada turno asistente que solo llamaba a `ehr.think` se eliminó junto con su respuesta de herramienta, y el texto del argumento `response` se convirtió en el `reasoning_content` del siguiente turno, lo que el template de Qwen3.5 renderiza como `<think>…</think>`. Se eliminó el párrafo `REASONING TRACE PROTOCOL` del system prompt, pero se mantuvo la línea `- ehr.think: Record your reasoning process` en la lista de herramientas para coincidir con el prompt de despliegue. Se descartaron las muestras de más de 52.000 tokens según el template de Qwen3.5, conservándose 2.681 de 2.947 (91%). El split aleatorio con semilla 42 produjo 2.628 muestras de entrenamiento y 53 de validación. La pérdida se calculó únicamente sobre tokens de asistente (bloque de pensamiento, llamadas a herramientas y respuesta final), enmascarando los tokens de sistema, usuario y respuestas de herramientas.

El repositorio contiene dos checkpoints: `epoch2_step164` (mejor pérdida de validación, 0,316) y `epoch3_step246` (pérdida de validación 0,331, con un sobreajuste leve según el autor). Cada subcarpeta es un checkpoint completo de HuggingFace con 14 shards safetensors en bf16, tokenizer, `chat_template.jinja` y `generation_config.json`.

## Capacidades

- Generación de texto y razonamiento: el modelo genera respuestas de asistente con razonamiento explícito en bloques `<think>` nativos. No usa la herramienta `ehr.think` en los objetivos de entrenamiento (0 ocurrencias).
- Tool calling / function calling: realiza llamadas a las 16 herramientas `ehr.*` MCP (por ejemplo, `ehr.load_ehr`, `ehr.run_sql_query`, `ehr.get_candidates_by_keyword`, `ehr.get_records_by_time`, `ehr.finish`). Aprendió los nombres y esquemas de argumentos a partir de las trayectorias, sin pasar un esquema JSON `tools=` al template.
- Soporte de agentes y razonamiento multi-paso: capaz de ejecutar secuencias largas de consultas a EHR, alternando razonamiento, llamadas a herramientas y respuestas finales.
- Especialización clínica: entrenado para resolver tareas sobre seis familias de problemas clínicos basados en MIMIC-IV, incluyendo codificación de diagnósticos y procedimientos, análisis de laboratorio, microbiología, prescripciones y transferencias hospitalarias.
- Idiomas: solo inglés.
- Capacidades especiales: no soporta visión ni audio. No utiliza navegador web; todas las conclusiones se basan en los datos devueltos por las herramientas EHR y en conocimiento clínico propio.

## Casos de uso

- Análisis de cohortes en MIMIC-IV: el modelo puede ejecutar consultas SQL sobre tablas de pacientes mediante `ehr.run_sql_query` y filtrar por rangos temporales con `ehr.get_records_by_time`. Es adecuado para construir cohortes con criterios temporales complejos en investigación clínica retrospectiva.
- Codificación de diagnósticos CCS: para un paciente dado, el modelo busca candidatos con `ehr.get_candidates_by_keyword` y `ehr.get_candidates_by_semantic_similarity`, y propone una lista de diagnósticos plausibles. Esto es útil en tareas de extracción de códigos CCS a partir de la historia clínica.
- Identificación de procedimientos CCS: similar al caso anterior, pero centrado en procedimientos. El modelo analiza la trayectoria del paciente para sugerir procedimientos oficiales, lo que puede aplicarse en auditoría y estandarización de registros clínicos.
- Análisis de eventos de laboratorio: el modelo consulta `ehr.get_latest_records` y `ehr.get_event_counts_by_time` para interpretar resultados de laboratorio anormales a lo largo del tiempo. Es adecuado para estudios de evolución de biomarcadores en pacientes crónicos.
- Interpretación de microbiología: mediante tablas de microbiologyevents, el modelo puede localizar organismos y pruebas de sensibilidad mediante búsquedas por palabra clave y coincidencia difusa. Útil en vigilancia epidemiológica de resistencias antimicrobianas.
- Revisión de prescripciones: el modelo analiza las tablas de prescriptions para detectar patrones de medicación y posibles duplicidades o solapamientos temporales. Puede integrarse en herramientas de apoyo a la revisión de historias farmacológicas.
- Seguimiento de transferencias hospitalarias: el modelo reconstruye la trayectoria del paciente a través de las unidades del hospital usando `ehr.get_records_by_time` y `ehr.run_sql_query`. Es adecuado para analizar flujos de pacientes y duración de estancias.
- Integración en pipelines de investigación clínica: como backend agéntico, el modelo puede usarse en entornos controlados para responder preguntas sobre conjuntos de datos de EHR, siempre que se respete la licencia de los datos MIMIC-IV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta una pérdida de validación de 0,316 en el checkpoint `epoch2_step164` y de 0,331 en `epoch3_step246`, pero estas métricas son de entrenamiento y no permiten comparar el rendimiento con otros modelos en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 70 GB, correspondientes a los 35.000 millones de parámetros totales en formato bf16. El repositorio contiene dos checkpoints completos, por lo que ocupa unos 140.4 GB en disco; debe elegirse uno para la inferencia.
- VRAM estimada con cuantización de 4 bits (si se convierte): aproximadamente 18-20 GB.
- GPU recomendadas: A100 80GB o H100 80GB para bf16. Con cuantización de 4 bits, una RTX 4090 de 24GB podría ser suficiente en contextos moderados.
- Compatibilidad con GPU de consumo: solo con cuantización de 4 bits y ventanas de contexto no muy largas; no es viable en GPUs de 16GB.
- Opciones de despliegue: Transformers (pipeline text-generation) para el checkpoint original; vLLM si se usa un backend compatible con Qwen3.5 MoE; llama.cpp u Ollama si se convierte a GGUF, formato no incluido en el repositorio.
- Latencia y throughput: no disponible. Al ser un modelo MoE con 3B activos, la carga computacional por token es menor que en un modelo denso de 35B, pero el consumo total de memoria es mayor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Especializacion |
|---|---|---|---|---|---|
| ClinSeek-35B-A3B-DeepmedSFT-Think | 35B | 3B | No disponible | PhysioNet Credentialed Derivative | Agente clinico EHR |
| Qwen/Qwen3.5-35B-A3B (base) | 35B | 3B | No disponible | No disponible | Modelo MoE general |
| UCSC-VLAA/ClinSeek-35B-A3B | 35B | 3B | No disponible | No disponible | Proyecto de referencia ClinSeekAgent |

No se dispone de datos de benchmarks para comparar el rendimiento con los modelos listados.

## Limitaciones y advertencias

- Entrenado exclusivamente para tareas de agente sobre EHR del benchmark AgentEHR-Bench; su uso fuera de este dominio puede degradar el rendimiento.
- La licencia PhysioNet Credentialed Derivative exige obtener credenciales de PhysioNet y cumplir el DUA v3.1 de MIMIC-IV. No es una licencia de código abierto convencional y puede restringir la redistribución o el uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje; en contextos clínicos reales se requiere supervisión humana.
- Solo soporta inglés.
- El contexto máximo no está documentado. El entrenamiento descartó muestras de más de 52.000 tokens, por lo que contextos muy largos pueden quedar fuera de la distribución de entrenamiento.
- No se han publicado evaluaciones de robustez, sesgos o alucinaciones específicas del dominio clínico.
- El autor señala un sobreajuste leve en el checkpoint final (`epoch3_step246`) respecto al recomendado (`epoch2_step164`).
- No se incluyen cuantizaciones preconvertidas (GGUF, AWQ, GPTQ) en el repositorio, lo que limita el despliegue en entornos con menos memoria.

## Enlaces

- HuggingFace: https://huggingface.co/Chtholly17/ClinSeek-35B-A3B-DeepmedSFT-Think
- GitHub del proyecto: https://github.com/UCSC-VLAA/ClinSeekAgent
- Dataset de entrenamiento: https://huggingface.co/datasets/Chtholly17/Deepmed_SFT
- Repo relacionado: https://huggingface.co/UCSC-VLAA/ClinSeek-35B-A3B
- Licencia MIMIC-IV DUA v3.1: https://physionet.org/content/mimiciv/view-dua/3.1/
