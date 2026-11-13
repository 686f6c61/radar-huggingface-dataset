# saulkang/tracetune-tiny-aya-lora

## Resumen

TraceTune Tiny Aya es un adaptador LoRA publicado por el usuario saulkang sobre el modelo base CohereLabs/tiny-aya-fire, un transformer denso de 3.350 millones de parámetros desarrollado por Cohere Labs. El adaptador se ha entrenado con una metodología propietaria denominada Lexsi AgentTune, que combina un ajuste supervisado fino (SFT) en dos niveles sobre registros de eventos (`EventLog`) con un posterior entrenamiento por refuerzo mediante GRPO (Group Relative Policy Optimization). El objetivo declarado es el triaje autónomo de código y de vulnerabilidades de seguridad dentro de flujos agénticos.

La relevancia de esta publicación no reside en un salto de capacidades generales, sino en la especialización: el autor reporta que el adaptador lleva el índice de validez de esquema (SVI) del 75 % al 100 %, elimina por completo las trayectorias en bucle (de 25 % a 0 %) y eleva la precisión de citación fundamentada (GCP) del 0 % al 100 % sobre el banco de evaluación AuditKIT con la espina unificada LSAL-1.2. Son métricas de conformidad estructural y de comportamiento agéntico, no de conocimiento general.

El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial, y el repositorio incluye tanto el adaptador como el conjunto de datos de trayectorias y los registros de evaluación. En el momento de redactar esta ficha el repositorio no registra descargas ni valoraciones, y la model card no detalla la longitud de contexto, los idiomas soportados ni el número de tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base CohereLabs/tiny-aya-fire) con adaptador LoRA entrenado mediante SFT de dos niveles + GRPO |
| Parametros totales | 3.350 millones (modelo base); parámetros del adaptador LoRA no disponibles |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato LoRA; las cuantizaciones del modelo fusionado no están documentadas) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base tiny-aya-fire pertenece a la familia Aya, multilingüe, pero no se especifica cobertura para el adaptador) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA (el formato exacto de los ficheros no se detalla en la información disponible) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre CohereLabs/tiny-aya-fire, un transformer denso de 3.350 millones de parámetros. El entrenamiento sigue el pipeline Lexsi AgentTune en dos fases: primero un ajuste supervisado fino de dos niveles sobre registros de eventos estructurados (`EventLog`), que enseña al modelo a emitir trazas de agente conformes a un esquema; después, un entrenamiento por refuerzo con GRPO orientado a la política de decisión del agente, presumiblemente para penalizar bucles y premiar la finalización correcta de la tarea. El conjunto de datos empleado es `saulkang/tracetune-trajectories`.

La evaluación se realiza con Lexsi AuditKIT bajo la espina unificada LSAL-1.2, que mide cuatro dimensiones: validez de esquema (SVI), tasa de trayectorias en bucle (LTS), precisión de citación fundamentada (GCP) y ratio de eficiencia por paso (SER). La model card incluye una huella de procedencia (`ak-9e7486b6e67f8e6a`) que permite verificar la trazabilidad de la auditoría. No se documentan el volumen de tokens de entrenamiento, la composición del dataset ni los hiperparámetros del SFT o del GRPO.

## Capacidades

- Triaje de vulnerabilidades de seguridad: el adaptador está entrenado para producir trazas de agente estructuradas y conformes a esquema en tareas de análisis y clasificación de hallazgos.
- Triaje de código: análisis de fragmentos y emisión de decisiones estructuradas dentro de un flujo agéntico.
- Salida estructurada conforme a esquema: alcanza un 100 % de validez de esquema (SVI) en el banco AuditKIT, frente al 75 % del modelo base.
- Citación fundamentada: reporta un 100 % de precisión de citación (GCP) en la misma evaluación, frente al 0 % del base.
- Comportamiento agéntico sin bucles: elimina las trayectorias repetitivas (LTS de 0 %) y completa las tareas con el ratio de eficiencia óptimo (SER 1,00).
- Razonamiento multi-paso: la fase GRPO entrena explícitamente la política de decisión a lo largo de varios pasos.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades multilingües: no documentadas para el adaptador.
- Modo de razonamiento extendido, visión o audio: no disponible.

## Casos de uso

- Triaje automatizado de hallazgos de seguridad: el adaptador puede integrarse en un pipeline de SAST/DAST para clasificar y priorizar vulnerabilidades, emitiendo decisiones en un esquema fijo y con citas verificables a la evidencia, gracias al 100 % de SVI y GCP reportado.
- Revisión de código en CI/CD: dado su entrenamiento en trayectorias agénticas de análisis de código, puede insertarse como paso de revisión que produce informes estructurados y sin bucles, reduciendo coste de tokens y latencia frente a un agente sin ajustar.
- Generación de trazas auditables: en entornos regulados donde se exige trazabilidad de las decisiones de un agente, el formato `EventLog` y la huella de procedencia de AuditKIT permiten reconstruir y verificar cada paso.
- Enrutamiento y clasificación de incidencias: la conformidad de esquema al 100 % lo hace adecuado para tareas donde la salida debe parsearse sin tolerancia a errores de formato, como la asignación automática de tickets de seguridad.
- Prototipado de agentes en hardware de consumo: con 3.350 millones de parámetros y un adaptador LoRA, es viable desplegarlo en una sola GPU consumer para pruebas de concepto de flujos agénticos antes de escalar a modelos mayores.
- Investigación en post-entrenamiento agéntico: el repositorio publica el dataset de trayectorias y los registros de evaluación, lo que permite reproducir o comparar la metodología SFT + GRPO frente a otras aproximaciones.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre AuditKIT LSAL-1.2, comparando el modelo base sin ajustar con el adaptador:

| Metrica | Tiny Aya sin ajustar | TraceTune Tiny Aya | Delta |
|---|---|---|---|
| Schema Validity Index (SVI) | 75,0 % | 100,0 % | +25,0 % |
| Loop Trajectory Rate (LTS) | 25,0 % | 0,0 % | -25,0 % (0 bucles) |
| Grounded Citation Precision (GCP) | 0,0 % | 100,0 % | +100,0 % |
| Step Efficiency Ratio (SER) | 1,00 (incompleto) | 1,00 (óptimo) | 100 % de tareas completadas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores son propietarias del marco AuditKIT y no son directamente comparables con benchmarks académicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 3.350 millones de parámetros, las estimaciones habituales serían del orden de 7 GB en FP16, 4 GB en cuantización de 8 bits y 2-2,5 GB en 4 bits, sin contar el adaptador LoRA ni la caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo cabe en GPUs consumer de gama media-alta (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090) en cuantizaciones de 4 y 8 bits, y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más en cuantización de 4-8 bits, aunque el autor no publica requisitos verificados.
- Opciones de despliegue: no documentadas. Al ser un adaptador LoRA sobre un modelo de la familia Aya, sería desplegable mediante frameworks compatibles con PEFT (por ejemplo, vLLM, TGI o transformers + PEFT) tras fusionar el adaptador, pero no hay guía oficial en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TraceTune Tiny Aya (este) | 3,35 B + LoRA | No disponible | Triaje de código y seguridad, salida estructurada | Apache 2.0 | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-fire (base) | 3,35 B | No disponible | Propósito general multilingüe | No disponible en esta ficha | Hugging Face |
| Alternativas de ~3-4 B para agentes (por ejemplo, Qwen2.5-3B-Instruct, Llama-3.2-3B-Instruct) | 3-4 B | 32 K-128 K según modelo | Propósito general, tool calling | Licencias variables | Hugging Face |

La comparación con alternativas de propósito general no es directa: TraceTune está especializado en conformidad de esquema y comportamiento agéntico en triaje, no en conocimiento general, y no publica resultados en benchmarks estándar que permitan situarlo frente a esos modelos. Los datos de las alternativas no provienen de la información proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al heredar el modelo base, puede arrastrar los sesgos de sus datos de preentrenamiento, no evaluados en esta ficha.
- Riesgo de alucinación: no evaluado con métricas de veracidad factual; las métricas reportadas miden conformidad de esquema y citación, no corrección del contenido.
- Contexto e idiomas: la longitud de contexto y la cobertura lingüística del adaptador no están documentadas, lo que impide garantizar su comportamiento fuera del dominio de entrenamiento.
- Especialización estrecha: el ajuste está orientado a trayectorias de triaje de código y seguridad; su rendimiento en conversación general o tareas creativas puede degradarse respecto al modelo base.
- Validación limitada: las métricas proceden de un único banco propietario (AuditKIT LSAL-1.2) reportado por el propio autor, sin replicación independiente ni comparación con benchmarks estándar.
- Madurez del repositorio: 0 descargas y 0 valoraciones en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base CohereLabs/tiny-aya-fire, que no se detalla en la información disponible.
- Producción: al ser un adaptador LoRA, requiere fusionarse o cargarse junto al modelo base; no se documentan procesos de despliegue, cuantización ni latencia verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saulkang/tracetune-tiny-aya-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Dataset y registros de evaluación: https://huggingface.co/datasets/saulkang/tracetune-trajectories
- Repositorio GitHub: https://github.com/grzdev/tracetune
