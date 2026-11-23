# pawarshardul/Macaron-V1.1backup

## Resumen

Macaron-V1.1 es un modelo de lenguaje orientado a tareas de agente desarrollado por MindLab Research, construido sobre el modelo base GLM-5.3 mediante una arquitectura denominada Mixture of LoRA (MoL). El modelo combina una base de 744.000 millones de parámetros con cuatro especialistas LoRA de 2.000 millones de parámetros cada uno, dedicados respectivamente a Chat, Agent, Coding y Generative UI, lo que da un total de 753.329.940.480 parámetros según los pesos en safetensors publicados en el repositorio. La etiqueta de release que emplea el autor es de 752B (744B de base más cuatro especialistas de 2B).

El modelo está pensado para flujos de trabajo de agente personal y de oficina: selección de herramientas, ejecución de tareas multi-paso, ingeniería de software de horizonte largo y generación de interfaces de usuario. La propuesta técnica diferencial es la separación de capacidades en especialistas LoRA que comparten una única base de gran tamaño, servidos mediante el harness Mixture of LoRA (MoL) publicado por el propio laboratorio. El entrenamiento posterior se realizó sobre la plataforma Mint Recursive, que el autor describe como un entorno serverless de entrenamiento e inferencia.

La relevancia del modelo radica en su posicionamiento dentro de la categoría de modelos de agente de gran escala, con resultados declarados que igualan o superan a Claude Opus 5 en varios benchmarks de chat, automatización, coding y UI generativa, aunque con las salvedades de protocolo que el propio autor reconoce. La licencia MIT facilita su adopción comercial, si bien el tamaño del repositorio (1.567,8 GB) y el número de parámetros condicionan fuertemente su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3 base + Mixture of LoRA (MoL) con cuatro especialistas |
| Parametros totales | 753.329.940.480 (etiqueta de release: 752B; base 744B + 4 especialistas de 2B) |
| Parametros activos | No aplica en el sentido de MoE clásico; el enrutado es por especialista LoRA (no disponible el detalle de activación por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Macaron-V1.1 parte de GLM-5.3 como modelo base de 744.000 millones de parámetros y añade cuatro especialistas LoRA de 2.000 millones de parámetros cada uno: Chat (calidad de interacción y progreso de tarea en conversaciones abiertas), Agent (selección y ejecución de herramientas en flujos complejos), Coding (ingeniería de software de horizonte largo y tareas de terminal) y Generative UI (entrega de interfaces, funcionalidad y diseño visual). Los especialistas comparten la base y se sirven mediante el harness Mixture of LoRA (MoL) del laboratorio. El autor no detalla la arquitectura interna de la base GLM-5.3 (tipo de atención, si es densa o MoE, ni la composición exacta del transformer), por lo que ese dato queda como no disponible.

El post-entrenamiento se realizó en la plataforma Mint Recursive, con un flujo de trabajo compartido para preparación de datos, experimentos, evaluación de checkpoints y despliegue. En coding, las trayectorias SWE se organizan en fases de reproducción, localización, edición, verificación y recuperación para reducir la exploración de baja relevancia. En flujos de oficina, el entrenamiento enfatiza la selección de herramientas adecuadas y la evitación de acciones innecesarias sobre documentos, mensajes y sistemas de negocio dentro del intento y la autorización del usuario. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto conversacional con énfasis en progreso de tarea y calidad de interacción (especialista Chat).
- Uso de herramientas y function calling en flujos de trabajo complejos (especialista Agent).
- Razonamiento multi-paso y ejecución de agentes autónomos con presupuesto de pasos acotado.
- Ingeniería de software de horizonte largo: reproducción, localización, edición, verificación y recuperación de fallos en tareas tipo SWE.
- Tareas de terminal y entornos de línea de comandos (Terminal-Bench 3.0).
- Generación de interfaces de usuario (Generative UI) con evaluación de entrega, funcionalidad y diseño visual.
- Entrega de UI al primer intento en 58 de 60 tareas (96,67%) según el autor.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente personal de oficina: el modelo puede orquestar documentos, mensajes y sistemas de negocio seleccionando herramientas y evitando acciones innecesarias, gracias al especialista Agent entrenado específicamente para ello y evaluado en AutomationBench (53,7).
- Automatización de atención al cliente multi-turno: el especialista Chat está optimizado para progreso de tarea e interacción en conversaciones abiertas, evaluado en ChatBench v2 con 66,7.
- Agente de ingeniería de software en CI/CD: el especialista Coding aborda trayectorias SWE de reproducción, localización, edición y verificación, con 71,7 en DeepSWE v1.1 y 50,0 en SWE-Marathon, adecuado para pipelines que requieren parcheo y validación automática.
- Asistente de terminal y operaciones: con 31,4 en Terminal-Bench 3.0, puede integrarse en entornos de línea de comandos para tareas de diagnóstico y ejecución controlada.
- Generación de interfaces de usuario: el especialista Generative UI permite producir pantallas funcionales y visualmente correctas al primer intento, útil en prototipado rápido y herramientas de diseño asistido.
- Orquestación de flujos con tool calling: el modelo soporta selección y ejecución de herramientas en flujos de negocio, evaluado en Toolathlon-Verified con 76,0, lo que lo hace apto para integraciones de API y automatización de procesos.
- Agente de investigación y recuperación de información: la combinación de razonamiento multi-paso y uso de herramientas permite construir agentes que consultan fuentes, sintetizan y verifican resultados dentro de un presupuesto de pasos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente salvo donde se indica con asterisco como fuente externa):

| Categoria | Benchmark | Macaron V1.1 | Macaron V1 | GLM 5.3 | DeepSeek V4 Pro 0813 | Qwen 3.8 Max | Kimi K3 | Claude Opus 5 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Chat | ChatBench v2 | 66,7 | 63,6 | 65,8 | 65,7 | 62,2 | 57,7 | 66,2 |
| Agent | AutomationBench | 53,7 | 31,8 | 48,2* | 43,2* | 39,8* | 46,7* | 50,3* |
| Agent | Toolathlon-Verified | 76,0 | 63,0 | 73,0* | 74,1* | 72,5* | 73,2* | 80,6* |
| Coding | DeepSWE v1.1 | 71,7 | 58,4 | 66,9* | 62,7* | 57,0* | 69,0* | 68,8* |
| Coding | SWE-Marathon | 50,0 | 15,0 | 42,5* | 10,6* | — | 48,1* | 50,0* |
| Coding | Terminal-Bench 3.0 | 31,4 | 5,7 | 28,7 | 11,8* | 29,0* | 17,7* | 42,7* |
| GenUI | UI4ABench v2 | 83,2 | 75,8 | 77,6 | 77,7 | 79,3 | 80,6 | 81,4 |

El autor advierte que los resultados externos conservan sus protocolos originales y pueden diferir en harness, subconjunto de tareas, presupuesto de ejecución y agregación, y que la tabla no establece un ranking global controlado. Macaron-V1.1 iguala o supera a Opus 5 en ChatBench v2, AutomationBench, DeepSWE v1.1, SWE-Marathon y UI4ABench v2, y queda por debajo en Toolathlon-Verified y Terminal-Bench 3.0. En entrega de UI al primer intento declara 58/60 (96,67%) frente a 43/60 (71,67%) de GLM-5.3.

Protocolos declarados: ChatBench v2 usa tres ejecuciones independientes por par modelo-caso con prompt de sistema de producción, persona de usuario e historial relevante, con un juez GLM-5.2 desplegado de forma privada que puntúa de 1 a 5 y multiplica la media por 20. AutomationBench emplea el split público de 600 tareas de v1.0.6 en seis dominios de negocio, con el conjunto de herramientas API y un máximo de 50 pasos de respuesta por tarea. Toolathlon-Verified usa el servicio oficial de evaluación con pass@1. DeepSWE v1.1 usa el harness de Claude Code con pass@3.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 753.329.940.480 parámetros, la inferencia en precisión completa exige agregados multi-GPU de gran escala; el repositorio ocupa 1.567,8 GB en safetensors, lo que da una idea del orden de magnitud del almacenamiento necesario.
- GPU recomendadas: no disponible de forma explícita. Por el tamaño del modelo, el despliegue realista requiere clústeres de GPU de centro de datos (A100, H100 o equivalentes) con paralelismo tensorial y de pipeline.
- ¿Cabe en GPU de consumo? No es viable en GPU de consumo para los pesos completos. No se proporcionan datos sobre versiones cuantizadas que pudieran reducir el requisito.
- Opciones de despliegue: el autor publica el harness Mixture of LoRA (MoL) en GitHub (MindLab-Research/Mixture-of-LoRA-Harness) y una API alojada (Mint Recursive). No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultados clave (declarados) |
|---|---|---|---|---|
| Macaron-V1.1 | 752B (744B base + 4 LoRA de 2B) | no disponible | MIT | ChatBench v2 66,7; AutomationBench 53,7; DeepSWE v1.1 71,7; UI4ABench v2 83,2 |
| GLM-5.3 | no disponible | no disponible | no disponible | ChatBench v2 65,8; AutomationBench 48,2*; DeepSWE v1.1 66,9*; UI4ABench v2 77,6 |
| Claude Opus 5 | no disponible | no disponible | propietaria | ChatBench v2 66,2; AutomationBench 50,3*; DeepSWE v1.1 68,8*; UI4ABench v2 81,4 |
| Kimi K3 | no disponible | no disponible | no disponible | ChatBench v2 57,7; AutomationBench 46,7*; DeepSWE v1.1 69,0*; UI4ABench v2 80,6 |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; solo se dispone de sus puntuaciones en la tabla de benchmarks del autor.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como no verificados; las comparaciones externas conservan protocolos distintos y no constituyen un ranking controlado.
- El modelo tiene 753.329.940.480 parámetros y un repositorio de 1.567,8 GB, lo que hace inviable su despliegue en hardware de consumo y exige infraestructura de centro de datos.
- No se especifican la longitud de contexto, los idiomas soportados ni los tipos de cuantización, lo que limita la planificación de despliegues en producción.
- No se detallan los datos de entrenamiento (tokens, composición, uso de RLHF/DPO), lo que dificulta evaluar sesgos y riesgos de alucinación.
- El autor no publica información sobre sesgos conocidos ni sobre tasas de alucinación.
- El rendimiento en Toolathlon-Verified (76,0) y Terminal-Bench 3.0 (31,4) queda por debajo de Claude Opus 5 (80,6 y 42,7 respectivamente), lo que debe tenerse en cuenta para tareas de terminal y orquestación de herramientas de alta exigencia.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en dominios sensibles; se recomienda validación propia antes de producción.
- El modelo depende del harness Mixture of LoRA (MoL) para servir los especialistas; no se confirma compatibilidad con stacks de inferencia estándar.
- La fecha de creación del repositorio (2026-11-23) y la ausencia de descargas y likes en el momento de la consulta indican que se trata de una publicación reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/pawarshardul/Macaron-V1.1backup
- API alojada (internacional): https://mint.macaron.im/
- API alojada (China continental): https://mintcn.macaron.xin/
- Artefactos: https://github.com/MindLab-Research/macaron-artifacts
- Harness de serving Mixture of LoRA: https://github.com/MindLab-Research/Mixture-of-LoRA-Harness
- Contacto: contact@mindlab.ltd
