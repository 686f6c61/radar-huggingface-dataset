# nikhiill/devops-healer-3b-gguf

## Resumen

DevOps-Healer-3B es un modelo de lenguaje de 3.212.749.888 parámetros (3,23B) desarrollado por Nikhil Ganorkar, obtenido mediante fine-tuning con 4-bit QLoRA sobre `unsloth/Llama-3.2-3B-Instruct`. Su propósito es especializarse en el diagnóstico autónomo de incidentes en contenedores Docker y clústeres de Kubernetes, así como en la generación de planes de remediación estructurados y deterministas. Forma parte del sistema multiagente Self-Healing DevOps Agent, construido con CrewAI, memoria vectorial FAISS y observabilidad con Langfuse.

El modelo resuelve un problema muy concreto: dada la salida de estado de un contenedor o pod (códigos de salida, eventos Warning de Kubernetes, logs truncados), devuelve una línea con formato fijo `ERROR_TYPE | ACTION | SEVERITY | ROOT_CAUSE`. Cubre doce modos de fallo predefinidos, seis para Docker (OOM_KILLED, PORT_CONFLICT, DISK_FULL, CONFIG_ERROR, NETWORK_ERROR, CLEAN_EXIT) y seis para Kubernetes (K8S_OOM_KILLED, K8S_IMAGE_PULL_BACKOFF, K8S_CONFIG_ERROR, K8S_CRASH_LOOP, K8S_PROBE_FAILURE, K8S_UNSCHEDULABLE).

Su relevancia radica en que el fine-tuning está orientado a una tarea de clasificación y decisión acotada, no a conversación general. Al derivar de Llama 3.2 3B Instruct, mantiene la longitud de contexto del modelo base (128.000 tokens según la familia Llama 3.2, aunque la model card no lo explicita) y un tamaño que permite ejecución local en hardware de consumo. La licencia MIT facilita su integración en pipelines de producción sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B Instruct, fine-tuning QLoRA) |
| Parametros totales | 3.212.749.888 (3,23B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base) |
| Tipos de cuantizacion | GGUF (repo incluye pesos GGUF); QLoRA NF4 para entrenamiento |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder-only de 3,23B parámetros. Sobre él se aplicó un fine-tuning con 4-bit QLoRA: cuantización NF4 con doble cuantización y adaptadores LoRA en `float32`. Los hiperparámetros LoRA son rango `r=16`, `lora_alpha=16`, `lora_dropout=0.05` y módulos objetivo `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`, lo que supone aproximadamente 24,3M parámetros entrenables (0,75% del total). Se usó el optimizador `paged_adamw_8bit` con tasa de aprendizaje `2e-4` y planificador coseno.

El conjunto de entrenamiento consta de 800 ejemplos únicos de logs de fallo de Docker y Kubernetes, con 80 ejemplos de validación, distribuidos en 12 categorías de fallo. No se documenta el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el proceso descrito es exclusivamente supervisado mediante QLoRA. La innovación principal no es arquitectónica sino de especialización: el modelo aprende a mapear estados de runtime a una tupla estructurada de clasificación, acción, severidad y causa raíz, con entity-awareness (por ejemplo, calcular un nuevo límite de memoria escalado a partir de `128Mi` hacia `512Mi` en un OOMKilled de Kubernetes).

## Capacidades

- Generación de texto especializada en diagnóstico de incidentes de infraestructura.
- Clasificación de fallos de Docker en seis categorías con acción de remediación asociada.
- Clasificación de fallos de Kubernetes en seis categorías con acción de remediación asociada.
- Salida estructurada determinista con el formato `ERROR_TYPE | ACTION | SEVERITY | ROOT_CAUSE`.
- Diagnóstico con entity-awareness: identifica la entidad afectada (deployment, pod, contenedor) y propone parámetros concretos (por ejemplo, límites de memoria escalados).
- Integración con tool calling a través del sistema CrewAI que lo orquesta (el modelo en sí emite la decisión; las herramientas las ejecuta el agente).
- Soporte de razonamiento multi-paso en el contexto del agente CrewAI con memoria FAISS (la orquestación la aporta el framework, no el modelo de forma nativa).
- Capacidades multilingües: no disponibles; el modelo está entrenado y etiquetado únicamente para inglés.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- **Auto-remediación de contenedores Docker en producción**: el modelo recibe el código de salida (por ejemplo, 137 con `OOMKilled: true`) y los logs finales, y devuelve `OOM_KILLED | increase_memory | high | ...` para que el agente incremente el límite de memoria del contenedor. Es adecuado porque la tarea es de clasificación acotada y la salida es parseable.
- **Rollback automático de deployments en Kubernetes**: ante un `ImagePullBackOff` o `ErrImagePull`, el modelo emite `K8S_IMAGE_PULL_BACKOFF | rollback_deployment | ...`, permitiendo que el orquestador revierta a la revisión anterior sin intervención humana.
- **Escalado de límites de memoria en pods con OOMKilled**: el modelo calcula un nuevo límite (por ejemplo, de `128Mi` a `512Mi`) y emite `patch_deployment_memory`, lo que permite aplicar un parche al Deployment de forma programática.
- **Alertado selectivo a Slack en fallos que requieren humano**: para `CreateContainerConfigError` (falta un Secret o ConfigMap) o pods `Pending` por falta de recursos, el modelo emite `slack_alert`, evitando remediaciones automáticas que no resolverían el problema.
- **Gestión de conflictos de puerto en entornos de desarrollo y staging**: ante `EADDRINUSE` o `bind() failed: Address already in use`, emite `PORT_CONFLICT | free_port`, útil en pipelines de CI/CD que levantan contenedores efímeros.
- **Limpieza automática de disco en nodos con Docker**: ante `Errno 28: No space left on device`, emite `DISK_FULL | prune_docker`, lo que permite disparar una limpieza de imágenes y volúmenes no usados.
- **Reinicio controlado de dependencias caídas**: ante `connection refused` hacia Redis, Postgres o Kafka, emite `NETWORK_ERROR | restart_with_delay`, útil para servicios con dependencias que arrancan en orden.
- **Integración en el agente CrewAI Self-Healing DevOps**: el modelo actúa como el componente de decisión del sistema multiagente descrito en el repositorio del autor, con memoria vectorial FAISS para recuperar incidentes previos y Langfuse para trazar las decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP16, aproximadamente 6,5 GB de pesos; en cuantización GGUF Q4, del orden de 2 GB de pesos, con overhead adicional de contexto.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB) para FP16; A100 y H100 no son necesarias para este tamaño.
- **GPU de consumo**: sí cabe en GPUs de consumo; una RTX 3060 de 12 GB o superior puede ejecutar el modelo en FP16 o GGUF Q4/Q5. También es viable en CPU con llama.cpp/Ollama en cuantizaciones bajas, con mayor latencia.
- **Opciones de despliegue**: Ollama (el autor documenta `ollama run hf.co/nikhiill/devops-healer-3b-gguf`), llama.cpp para GGUF, vLLM y TGI para safetensors en FP16, y CrewAI como orquestador de agentes.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikhiill/devops-healer-3b-gguf | 3,23B | no disponible | Diagnóstico Docker/K8s, salida estructurada | MIT | Hugging Face (0 descargas, 1 like) |
| unsloth/Llama-3.2-3B-Instruct | 3,23B | no disponible en la ficha | Instrucción general | Llama 3.2 Community License | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | 3,23B | 128.000 tokens (familia Llama 3.2) | Instrucción general | Llama 3.2 Community License | Hugging Face |

La comparación con alternativas especializadas en SRE/DevOps no está disponible en la información proporcionada. Frente a los modelos base, la diferencia clave es la licencia MIT (frente a la Llama Community License, que impone restricciones de uso) y la especialización en una tarea acotada, a costa de perder capacidades generales de conversación.

## Limitaciones y advertencias

- **Idioma**: el modelo está etiquetado únicamente para inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- **Alcance muy restringido**: solo cubre los doce modos de fallo documentados; ante fallos fuera de ese catálogo, la salida puede ser incorrecta o inventada.
- **Riesgo de alucinación**: al ser un modelo de 3B con fine-tuning sobre 800 ejemplos, puede generar `ERROR_TYPE` o `ACTION` plausibles pero incorrectos si la entrada no se parece a los datos de entrenamiento. Se recomienda validar la salida contra un esquema y un catálogo cerrado antes de ejecutar acciones.
- **Dataset pequeño**: 800 ejemplos de entrenamiento y 80 de validación; no se publican métricas de exactitud, precisión ni recall por categoría, lo que impide evaluar su fiabilidad real.
- **Sin benchmarks**: no hay resultados publicados de MMLU, HumanEval ni métricas específicas de la tarea, por lo que la comparación objetiva con alternativas no es posible.
- **Contexto no documentado**: la model card no especifica la longitud de contexto efectiva; aunque el modelo base soporta ventanas amplias, el fine-tuning puede no haber preservado ese comportamiento.
- **Licencia**: MIT, permisiva para uso comercial, pero conviene revisar las condiciones del modelo base Llama 3.2 (Llama 3.2 Community License) de las que deriva, ya que pueden imponer obligaciones adicionales.
- **Madurez**: 0 descargas y 1 like en el momento de la consulta; es un modelo recién publicado, sin validación independiente por parte de la comunidad.
- **Producción**: cualquier acción de remediación automática debe ejecutarse con salvaguardas (límites de recursos, aprobación humana para acciones destructivas como `rollback_deployment` o `prune_docker`).

## Enlaces

- Hugging Face: https://huggingface.co/nikhiill/devops-healer-3b-gguf
- Repositorio del agente Self-Healing DevOps: https://github.com/niikkkhiil/Orchestrating_agent
- Perfil del autor: https://github.com/niikkkhiil
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
