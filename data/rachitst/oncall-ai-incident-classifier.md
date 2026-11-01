# rachitst/oncall-ai-incident-classifier

## Resumen

OnCall AI Incident Classifier es un modelo de lenguaje de 494 millones de parámetros (494.032.768 exactos según los pesos en safetensors) obtenido mediante un ajuste fino con QLoRA sobre Qwen/Qwen2.5-0.5B-Instruct. Lo desarrolla Rachit Manish Chheda (usuario `rachitst` en HuggingFace) como parte del proyecto de fin de curso OnCall AI, un analizador de incidentes de producción construido con FastAPI, Gradio, LangGraph y recuperación de runbooks mediante FAISS. El modelo resuelve una tarea muy acotada: recibe un fragmento de log de producción y devuelve un único objeto JSON con un tipo de incidente (de entre 12 clases fijas) y una severidad (P1 a P4).

La relevancia del modelo no está en su rendimiento bruto, sino en su planteamiento: es un clasificador especializado que cabe en CPU, no requiere llamadas a un LLM en la nube y está pensado para ejecutarse como primera etapa de triaje dentro de un pipeline con verificación posterior. Emplea la plantilla de chat de Qwen2.5 y un system prompt fijo que enumera la taxonomía completa, de modo que la salida es determinista en formato y fácil de parsear.

Conviene subrayar desde el principio que tanto los datos de entrenamiento como los de evaluación son sintéticos, generados por plantillas. El autor lo advierte explícitamente en la model card: la puntuación perfecta en el conjunto de test indica que el modelo ha aprendido la distribución del generador, no que sea apto para producción real. Es, por tanto, una pieza docente y demostrativa, no un componente listo para desplegar sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con QLoRA (base en 4 bits NF4, LoRA r=16, alpha=32), adaptador fusionado en los pesos fp16 |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, pero la model card no lo declara para este ajuste) |
| Tipos de cuantizacion | El repositorio publica pesos fusionados en fp16; no se declaran variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parámetros con atención causal estándar y RoPE. Sobre esa base se aplicó un ajuste fino supervisado con QLoRA: la base se cargó cuantizada en 4 bits con formato NF4, se entrenaron adaptadores LoRA de rango 16 y alpha 32, y posteriormente el adaptador se fusionó en los pesos fp16 del modelo base. El resultado es un checkpoint único que no necesita PEFT en inferencia, lo que simplifica el despliegue.

Los datos de entrenamiento son íntegramente sintéticos: logs generados por plantillas que imitan líneas de nginx, Kubernetes, PostgreSQL, systemd/journald, Python y Java. El conjunto de test empleado en la evaluación contiene 180 logs sintéticos. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; dado el tamaño y el propósito del proyecto, lo más probable es que se trate de un ajuste supervisado puro, pero esto no se confirma en la model card. La innovación técnica destacable no es arquitectónica sino de formato: el entrenamiento fija un system prompt exacto con la taxonomía de 12 clases y fuerza la salida a un JSON de dos campos, lo que hace que el modelo sea predecible en estructura aunque su precisión semántica dependa por completo de la distribución sintética.

## Capacidades

- Clasificación de fragmentos de log en una de 12 categorías de incidente: `database_connection_exhausted`, `out_of_memory`, `disk_space_full`, `upstream_gateway_error`, `tls_certificate_expired`, `kubernetes_crashloop`, `application_exception`, `dns_resolution_failure`, `rate_limit_exceeded`, `authentication_failure`, `high_latency_timeout` y `deployment_failure`.
- Asignación de severidad en cuatro niveles: P1 (caída de producción o riesgo de datos), P2 (degradación para muchos usuarios), P3 (impacto limitado o no productivo) y P4 (informativo, sin impacto).
- Salida estructurada en JSON con exactamente dos claves, `incident_type` y `severity`, lo que facilita el parseo automático y la integración en pipelines.
- Generación de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct, aunque el ajuste la orienta casi por completo a la tarea de clasificación.
- No se declara soporte de tool calling ni function calling en la información disponible.
- No se declara soporte de agentes ni de razonamiento multi-paso; el modelo está diseñado para una única pasada de clasificación.
- Capacidad multilingüe limitada al inglés; los logs en otros idiomas quedan fuera del alcance declarado.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Triaje inicial de incidentes en un pipeline SRE: el modelo recibe el extracto de log pegado por el operador y devuelve tipo y severidad en una sola pasada, lo que permite enrutar la alerta al equipo correspondiente antes de que intervenga un humano. Es adecuado porque la salida JSON es directamente consumible por un orquestador.
- Recuperación de runbooks guiada por clasificación: en la arquitectura OnCall AI, el tipo predicho se usa para consultar fragmentos de runbook en un índice FAISS; el modelo actúa como etapa de enrutamiento y la recuperación aporta el contexto operativo que el clasificador por sí solo no puede dar.
- Clasificación en CPU sin dependencia de la nube: al tener 494 millones de parámetros y pesos fp16, el modelo puede ejecutarse en CPU en entornos con requisitos de soberanía de datos o sin conectividad, algo inviable con LLM de mayor tamaño.
- Preetiquetado de corpus de logs para revisión humana: el modelo puede procesar lotes de extractos y marcar candidatos, que luego un ingeniero de guardia valida o corrige, reduciendo el trabajo manual de catalogación.
- Demostración docente de ajuste fino con QLoRA: sirve como ejemplo completo y reproducible de un pipeline de fine-tuning (generación de datos sintéticos, entrenamiento con PEFT, fusión de adaptadores, evaluación y despliegue con Gradio) para cursos de despliegue de LLM en producción.
- Filtro de primera línea en sistemas de alertas: integrado como paso previo a un sistema de paginación, puede descartar o rebajar la prioridad de incidentes P3 y P4 antes de que despierten al equipo de guardia, siempre con una verificación posterior.
- Prototipado rápido de taxonomías de incidentes: el mismo esquema de entrenamiento puede replicarse con otras taxonomías para validar el diseño de un sistema de clasificación antes de invertir en datos reales y modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. La columna `verified` figura como `false` en todos los casos, es decir, no han sido verificados de forma independiente.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Clasificacion de incidentes (tipo + severidad) | OnCall AI synthetic incident logs, test split (180 logs) | Precision del tipo de incidente | 1,0000 |
| Clasificacion de incidentes (tipo + severidad) | OnCall AI synthetic incident logs, test split (180 logs) | Macro-F1 del tipo de incidente | 1,0000 |
| Clasificacion de incidentes (tipo + severidad) | OnCall AI synthetic incident logs, test split (180 logs) | Precision de severidad | 1,0000 |
| Clasificacion de incidentes (tipo + severidad) | OnCall AI synthetic incident logs, test split (180 logs) | Macro-F1 de severidad | 1,0000 |

El autor advierte explícitamente de que estas cifras reflejan el aprendizaje de la distribución del generador sintético y no constituyen evidencia de rendimiento en producción. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1 GB para los pesos (494 millones de parámetros a 2 bytes por parámetro), más el espacio de activaciones y caché KV, que depende de la longitud de contexto utilizada.
- En CPU: el modelo está pensado para ejecutarse en CPU; el propio autor despliega la demo cargando este checkpoint en CPU, con pesos en fp32 en ese caso (aproximadamente 2 GB de RAM).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090 o superiores; también A100 y H100, aunque resultan sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU consumer: sí, en la práctica totalidad de las GPU consumer modernas, e incluso en placas integradas con suficiente RAM del sistema.
- Opciones de despliegue: transformers (vía `AutoModelForCausalLM` y `AutoTokenizer`), text-generation-inference (la model card incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), y cualquier runtime compatible con safetensors. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión previa no documentada.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera una latencia de decodificación baja (del orden de decenas de milisegundos por token en GPU y algo más en CPU), pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oncall-ai-incident-classifier | 494 M | No disponible | Clasificacion de incidentes en 12 clases + severidad | Apache 2.0 | HuggingFace, demo en Modal |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 tokens | Generacion de texto general e instrucciones | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M aprox. | 32.768 tokens | Generacion de texto general e instrucciones | Apache 2.0 | HuggingFace |

La comparación con la base es la más informativa: el ajuste no añade parámetros, solo especializa el comportamiento hacia una taxonomía cerrada con salida JSON. Frente a Qwen2.5-1.5B-Instruct, el clasificador sacrifica capacidad general y contexto declarado a cambio de un formato de salida estricto y un tamaño menor. No se dispone de datos de benchmarks comparables entre estos modelos para la tarea de clasificación de incidentes, por lo que la comparación de rendimiento no está disponible.

## Limitaciones y advertencias

- Datos sintéticos: entrenamiento y evaluación se basan en logs generados por plantillas. El modelo aprende la distribución del generador y no necesariamente los patrones de logs reales, con variabilidad, ruido y formatos heterogéneos.
- Puntuación perfecta no representativa: el 1,0 en precisión y macro-F1 sobre 180 logs sintéticos no es evidencia de calidad en producción; el propio autor lo señala.
- Taxonomía cerrada: solo cubre 12 tipos de incidente. Cualquier log fuera de esas clases se forzará a una de ellas, con riesgo de clasificación errónea silenciosa.
- Solo inglés: los logs en otros idiomas quedan fuera del alcance declarado.
- Riesgo de alucinación en el sentido de asignar una clase y severidad plausibles aunque el log no corresponda a ninguna; no hay mecanismo interno de abstención.
- Dependencia del system prompt exacto: el modelo se entrenó con un prompt concreto; desviarse de él puede degradar la calidad de la salida y romper el formato JSON.
- No apto para uso safety-critical sin revisión humana: el autor excluye explícitamente cualquier uso crítico sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen2.5 conviene revisar los términos del modelo base.
- Sin soporte declarado de tool calling ni agentes: no debe esperarse razonamiento multi-paso ni integración directa con herramientas.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ oficiales, lo que limita el despliegue en runtimes ligeros sin conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rachitst/oncall-ai-incident-classifier
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del proyecto (código, generador de dataset, notebook de entrenamiento, artefactos de evaluación): https://github.com/rachitst/oncall-ai
- Demo en vivo: https://rachitst--oncall-ai-web.us-east.modal.run
