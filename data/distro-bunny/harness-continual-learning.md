# distro-bunny/Harness-Continual-Learning

## Resumen

Harness Continual Learning (HCL) es un framework de investigación publicado por el autor `distro-bunny` en HuggingFace, con implementación de referencia en el repositorio `RL-MIND/Harness-Continual-Learning`. No se trata de un modelo de pesos entrenados, sino de un marco metodológico que permite a agentes construidos sobre modelos fundacionales congelados adaptarse de forma continua mediante la evolución de su "arnés" (harness): prompts, memorias, herramientas, habilidades y reglas de enrutamiento. El repositorio de HuggingFace tiene un tamaño de 0.0 GB, lo que confirma que no contiene checkpoints de modelo, sino únicamente material asociado a la implementación.

La contribución conceptual central es el desplazamiento del objeto del aprendizaje continuo: en lugar de actualizar los parámetros del modelo, HCL evoluciona el estado que rodea a un modelo fundacional congelado. Los autores formalizan el concepto de "olvido a nivel de arnés" (harness-level forgetting) y proponen una evolución protegida (guarded harness evolution) que separa la generación de actualizaciones de su confirmación, mediante un Continual Optimizer que propone candidatos y un Continual Evaluator que solo los acepta tras verificar mejora actual, retención histórica y validez.

El framework se evalúa en flujos de tareas textuales (MuSiQue, ProofWriter, GSM8K, HotpotQA), multimodales (detección y captioning en COCO, grounding en RefCOCO, VQAv2), embodied (ALFWorld) y de mundo abierto (Minecraft/Odyssey). Según la model card, supera a las líneas base correspondientes en más de un 10% en múltiples configuraciones. Es relevante ahora porque ofrece una alternativa práctica al fine-tuning continuo cuando los pesos del modelo no pueden o no quieren modificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: framework de aprendizaje continuo sobre modelos fundacionales congelados (no es un modelo con pesos propios) |
| Parametros totales | No disponible (no se distribuyen pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo fundacional subyacente; los experimentos de referencia usan Qwen3-4B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio HuggingFace no contiene pesos; el código está en GitHub) |

## Arquitectura y entrenamiento

HCL no entrena parámetros de un transformer, sino que opera sobre un modelo fundacional congelado. El framework se compone de cuatro componentes orientados a la ejecución: Task Interface (interfaz de estructuración de tareas compartida), Experience Memory (memorias crudas, abstractas y ancla), Capability Map (habilidades reutilizables, herramientas y servicios de capacidad) y Adaptive Router (prompts de selección de flujo de trabajo y artefactos). Sobre ellos actúa el mecanismo de evolución protegida: el Continual Optimizer genera arneses candidatos a partir de la retroalimentación de ejecución y el Continual Evaluator confirma una actualización solo tras comprobar mejora actual, retención histórica y validez.

El entrenamiento y la evaluación se organizan como flujos de tareas con perfiles de configuración específicos. Los flujos textuales de referencia cubren 250 tareas de entrenamiento, 50 de validación y 500 de test sobre MuSiQue, ProofWriter, GSM8K y HotpotQA. Los flujos multimodales cubren detección y captioning en COCO, grounding en RefCOCO y VQAv2. Los entornos embodied y de mundo abierto (ALFWorld y Odyssey/Minecraft) se mantienen aislados por incompatibilidad de dependencias de simulador. La implementación de referencia se ejecuta con Python 3.10 o superior y expone el entry point `main.py` y el comando instalado `hcl run`.

## Capacidades

- Acumulación de capacidades a lo largo de flujos de tareas sin modificar los pesos del modelo fundacional.
- Recuperación ante fallos mediante evolución del arnés a partir de retroalimentación de ejecución.
- Razonamiento textual multi-hop y de tipo lógico a través de los flujos MuSiQue, HotpotQA y ProofWriter.
- Razonamiento matemático mediante GSM8K en los flujos textuales de referencia.
- Percepción multimodal: detección de objetos, captioning, grounding referencial y respuesta visual a preguntas (VQAv2).
- Interacción embodied en ALFWorld y currículos de mundo abierto en Minecraft/Odyssey.
- Enrutamiento adaptativo de flujos de trabajo y selección de artefactos mediante el Adaptive Router.
- Gestión de memoria en tres niveles (cruda, abstracta y ancla) para retención de experiencia.
- Destilación a nivel de arnés y control explícito del compromiso estabilidad-plasticidad.
- Soporte de modelos locales vía Transformers (dependencia opcional `local-model`).

## Casos de uso

- Evaluación de investigación en aprendizaje continuo: el framework permite reproducir los flujos textuales y multimodales de referencia con configuraciones versionadas, útil para comparar estrategias de retención frente a métodos de fine-tuning continuo.
- Agentes sobre modelos congelados en producción: cuando no es viable reentrenar el modelo base, HCL permite adaptar el comportamiento mediante evolución de prompts, memorias y reglas de enrutamiento sin tocar los pesos.
- Asistentes con memoria persistente: el componente Experience Memory (cruda, abstracta y ancla) permite conservar experiencia acumulada entre sesiones y reducir el olvido de comportamientos previos.
- Sistemas de enrutamiento de herramientas: el Adaptive Router selecciona flujos de trabajo y artefactos según la tarea, adecuado para plataformas con múltiples herramientas y capacidades registradas.
- Agentes embodied y de simulación: las integraciones con ALFWorld y Odyssey permiten estudiar acumulación de habilidades en entornos interactivos con secuencias de dominios incrementales.
- Investigación en percepción multimodal: los flujos COCO/RefCOCO/VQAv2 permiten medir retención y plasticidad al encadenar tareas de visión distintas sobre un modelo congelado.
- Control de estabilidad-plasticidad en despliegues: los barridos de retención documentados permiten calibrar cuánto puede adaptarse el sistema sin degradar comportamientos históricos.

## Benchmarks y rendimiento

La model card indica que HCL "supera a las líneas base correspondientes en más de un 10% en múltiples configuraciones" en acumulación de capacidades de mundo abierto, razonamiento textual y percepción multimodal. No se proporcionan tablas numéricas detalladas por benchmark en la información disponible.

| Benchmark / flujo | Resultado |
|---|---|
| MuSiQue, ProofWriter, GSM8K, HotpotQA | Mejora >10% sobre líneas base en múltiples configuraciones (sin cifras desglosadas) |
| COCO detection, COCO captioning, RefCOCO, VQAv2 | Mejora >10% sobre líneas base en múltiples configuraciones (sin cifras desglosadas) |
| ALFWorld | No disponible |
| Odyssey / Minecraft | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo fundacional subyacente. Los experimentos de referencia citan Qwen3-4B como modelo principal.
- GPU recomendadas: no disponible. Para un modelo de 4B en precisión completa se requiere hardware de gama alta; con cuantización podría ejecutarse en GPU de consumo, pero no se aportan cifras oficiales.
- Cabe en GPU de consumo: no confirmado en la documentación; depende del modelo base y de su cuantización.
- Opciones de despliegue: el framework se ejecuta como aplicación Python (`python main.py` o `hcl run`) con dependencias en `requirements.txt`; soporta modelos locales vía Transformers con el extra `local-model`. No se documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Framework / enfoque | Objeto de adaptación | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|
| Harness Continual Learning (HCL) | Arnés (prompts, memoria, herramientas, routing) | Congelado (Qwen3-4B en referencia) | No disponible | HuggingFace (0.0 GB) y GitHub |
| Fine-tuning continuo clásico | Parámetros del modelo | Se actualiza | Depende del modelo | Ampliamente disponible |
| EWC / regularización paramétrica | Parámetros del modelo | Se actualiza | Depende de implementación | Disponible en librerías |
| Replay / rehearsal | Parámetros del modelo | Se actualiza | Depende de implementación | Disponible en librerías |

No se dispone de comparativas numéricas directas con frameworks concretos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio de HuggingFace no contiene pesos ni checkpoints: es un contenedor de material de investigación, no un modelo listo para inferencia.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido.
- Los datasets y checkpoints no se redistribuyen; es necesario prepararlos manualmente bajo `data/` según el layout documentado.
- Los entornos ALFWorld y Odyssey requieren instalaciones aisladas por incompatibilidad de dependencias con el stack principal.
- El rendimiento depende enteramente del modelo fundacional subyacente; no hay garantías de comportamiento para modelos distintos de los evaluados.
- Riesgo de olvido a nivel de arnés: los propios autores lo identifican como problema central y lo mitigan con el evaluador de retención, pero no lo eliminan.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos.
- Ausencia de benchmarks numéricos públicos desglosados dificulta la verificación independiente de las mejoras declaradas.

## Enlaces

- HuggingFace: https://huggingface.co/distro-bunny/Harness-Continual-Learning
- Repositorio GitHub: https://github.com/RL-MIND/Harness-Continual-Learning
- arXiv (referencia en tags): arxiv:2608.19013
