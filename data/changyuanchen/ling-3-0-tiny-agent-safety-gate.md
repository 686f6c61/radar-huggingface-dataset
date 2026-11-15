# ChangyuanChen/Ling-3.0-tiny-Agent-Safety-Gate

## Resumen

Ling-3.0-tiny Agent Safety Gate es un adaptador LoRA con cabeza de decisión que convierte el modelo base inclusionAI/Ling-3.0-tiny en un clasificador de seguridad para trayectorias de agentes. Dado un texto que describe la petición del usuario, las llamadas a herramientas del agente, las observaciones obtenidas y la respuesta final, devuelve una probabilidad calibrada de que la trayectoria sea insegura. Dos umbrales fijos traducen esa probabilidad en una decisión operativa: permitir, preguntar o denegar.

El modelo lo publica ChangyuanChen y se apoya en la infraestructura AReno de inclusionAI, concretamente en su cabeza de decisión JEV (commit `e17794c`). La relevancia actual es clara: los agentes que invocan herramientas externas necesitan un guardrail barato y determinista que se pueda ejecutar en CPU junto al agente, sin depender de un segundo LLM generativo como juez. El adaptador tiene rango 8 y alpha 16, se aplica sobre las proyecciones q/k/v/o y sobre los MLP de expertos y expertos compartidos del modelo base, y el repositorio completo ocupa 0,6 GB.

La propuesta es deliberadamente estrecha: solo inglés, entrenado con pares sintéticos y pliegues de entrenamiento de ASSEBench, y sin exposición previa a Pre-Ex-Bench ni a R-Judge. Aun así, en la evaluación publicada alcanza una precisión media de 0,802 sobre 2.154 registros de familias de tareas no vistas durante el entrenamiento, por encima de ShieldAgent (0,711) y muy por encima del modelo base sin adaptar (0,592).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 8, alpha 16) sobre transformer Ling-3.0-tiny, más cabeza de decisión lineal-GELU-lineal sobre el estado oculto del último token |
| Parametros totales | no disponible (el adaptador pesa 0,6 GB en el repositorio; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT (adaptador y modelo base) |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors`, `score_head.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 16 aplicado sobre las proyecciones de query, key, value y output, así como sobre los MLP de los expertos y del experto compartido del modelo base. La mención a expertos y experto compartido sugiere que Ling-3.0-tiny emplea una arquitectura con componentes tipo mezcla de expertos, aunque la información disponible no detalla el diseño completo del modelo base. Sobre la representación del último token se monta una cabeza de decisión JEV con estructura lineal-GELU-lineal que produce una única probabilidad calibrada de inseguridad. El entrenamiento se realizó con AReno y los umbrales de decisión (temperatura, umbral de denegación y nivel de "preguntar") se ajustaron sobre puntuaciones de desarrollo calculadas en CPU y se congelaron en `frozen_thresholds_cpu.json`.

Los datos de entrenamiento combinan pares sintéticos generados por Ling-3.0-tiny con registros de los pliegues de entrenamiento de ASSEBench (licencia Apache-2.0), renderizados a texto y parcialmente reescritos por el modelo base. ASSEBench adapta a su vez registros de AgentSafetyBench, AgentSecurityBench, AgentDojo y AgentHarm. El adaptador no vio registros de Pre-Ex-Bench ni de R-Judge durante el entrenamiento, lo que convierte esas dos suites en evaluación fuera de distribución. La model card indica que se eliminaron del conjunto publicado 29 registros de ASSEBench con nombres de herramientas de AgentHarm (aproximadamente el 3 % de sus 885 registros humanos).

## Capacidades

- Clasificación binaria calibrada de seguridad de trayectorias de agentes: devuelve P(insegura) a partir de la petición del usuario, las llamadas a herramientas, las observaciones y la respuesta final.
- Decisión operativa en tres niveles (permitir, preguntar, denegar) mediante dos umbrales fijos ajustados en CPU.
- Detección de riesgos de seguridad en el uso de herramientas, con una precisión de 0,983 en ASSE-Security.
- Detección de riesgos de seguridad general en trayectorias de agentes, con 0,820 en ASSE-Safety.
- Evaluación de seguridad fuera de distribución en Pre-Ex-Bench (0,733) y R-Judge (0,674).
- Servicio HTTP mediante `areno serve`, con endpoint `POST /v1/systemone` que acepta el texto de la trayectoria y una pregunta de seguridad y devuelve la probabilidad en `answers.unsafe.noul`.
- Cliente de referencia `gate_client.py` que aplica los umbrales y emite la decisión final.
- Sin capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio ni tool calling: es exclusivamente un modelo de decisión.

## Casos de uso

- Guardrail en línea para agentes con herramientas: antes de ejecutar una llamada a herramienta o de enviar la respuesta final, el agente pasa la trayectoria acumulada al gate y solo continúa si la probabilidad de inseguridad queda por debajo del umbral de permitir. La latencia es baja porque el adaptador se ejecuta sobre un modelo tiny y puede correr en CPU.
- Moderación de conversaciones multi-turno con agentes: el gate puede evaluar la trayectoria completa en cada turno, detectando escaladas de riesgo que no son visibles en un único mensaje, como la combinación de una petición aparentemente inocua con una llamada a herramienta sensible.
- Filtro previo a la ejecución de acciones destructivas: en pipelines donde el agente puede borrar ficheros, enviar correos o modificar bases de datos, el gate actúa como segunda barrera con decisión de tres niveles, derivando los casos dudosos a revisión humana en lugar de bloquearlos automáticamente.
- Auditoría por lotes de registros de agentes: al ser un clasificador determinista y barato, permite puntuar grandes volúmenes de trayectorias históricas para identificar incidentes de seguridad y construir conjuntos de datos de revisión.
- Evaluación de sistemas de agentes en CI/CD: integrado como test de regresión, el gate puede marcar trayectorias de prueba que superen el umbral de inseguridad y bloquear despliegues de cambios en prompts o herramientas que degraden la seguridad.
- Investigación en evaluación de seguridad de agentes: sirve como línea base reproducible para comparar con jueces generativos y con otros guardrails, dado que el repositorio incluye los ficheros exactos evaluados y los umbrales congelados.
- Despliegue en entornos con recursos limitados: al ser un adaptador PEFT sobre un modelo tiny y con servicio en CPU, encaja en infraestructuras sin GPU dedicada donde un juez LLM generativo resultaría prohibitivo.

## Benchmarks y rendimiento

Precisión (accuracy) sobre cortes de test de familias de tareas no vistas durante el entrenamiento (2.154 registros), puntuados una sola vez en CPU con umbrales congelados de desarrollo en CPU:

| Modelo | Pre-Ex-Bench | ASSE-Security | ASSE-Safety | R-Judge | Media |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Clase mayoritaria | 0,596 | 0,574 | 0,533 | 0,517 | 0,555 |
| Ling-3.0-tiny base | 0,632 | 0,579 | 0,612 | 0,543 | 0,592 |
| Safiron | 0,935 | 0,620 | 0,451 | 0,389 | 0,599 |
| ShieldAgent | 0,509 | 0,715 | 0,810 | 0,812 | 0,711 |
| Este adaptador | 0,733 | 0,983 | 0,820 | 0,674 | 0,802 |

La model card indica que las métricas F1, MCC, AUROC y las tasas de permitir, preguntar y denegar están disponibles en la receta del repositorio ling-cookbook, pero no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador ocupa 0,6 GB y se ejecuta sobre Ling-3.0-tiny; el consumo total depende del tamaño y la cuantización del modelo base, que no se detallan.
- GPU recomendadas: no disponible. La evaluación publicada se realizó en CPU, lo que indica que el sistema es viable sin GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; al tratarse de un modelo tiny con adaptador LoRA, es plausible que quepa en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: `areno serve` con `--model-path` apuntando a la copia local de Ling-3.0-tiny y `--decision-checkpoint` apuntando a este repositorio; cliente de referencia `gate_client.py`.
- Latencia y throughput: no disponibles. La model card advierte que las probabilidades en trayectorias límite dependen del stack de puntuación (GPU frente a CPU, float32 frente a bfloat16), lo que afecta a la reproducibilidad de las decisiones.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Media (accuracy) | Notas |
| :--- | :--- | :--- | :--- | ---: | :--- |
| Este adaptador | LoRA + cabeza de decisión sobre Ling-3.0-tiny | inglés | MIT | 0,802 | Mejor media global; flojo en Pre-Ex-Bench y R-Judge frente a alternativas |
| Safiron | Guardrail de agentes | no disponible | no disponible | 0,599 | Mejor en Pre-Ex-Bench (0,935); muy flojo en R-Judge (0,389) y ASSE-Safety (0,451) |
| ShieldAgent | Guardrail de agentes | no disponible | no disponible | 0,711 | Mejor en R-Judge (0,812); flojo en Pre-Ex-Bench (0,509) |
| Ling-3.0-tiny base | Modelo base sin adaptar | no disponible | MIT | 0,592 | Línea base; el adaptador mejora la media en 0,210 puntos |

No se dispone de datos de parámetros, contexto ni formato de pesos de Safiron ni de ShieldAgent en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo con pares sintéticos generados por Ling-3.0-tiny y con los pliegues de entrenamiento de ASSEBench; nunca vio registros de Pre-Ex-Bench ni de R-Judge, y queda por detrás de Safiron en Pre-Ex-Bench y de ShieldAgent en R-Judge.
- La puntuación en ASSE-Security es parcialmente resoluble solo por los nombres de las herramientas; no debe interpretarse como habilidad de seguridad real.
- Solo admite inglés.
- Las probabilidades en trayectorias límite dependen del stack de puntuación (GPU frente a CPU, float32 frente a bfloat16). Los umbrales publicados se ajustaron sobre puntuaciones en CPU; deben reajustarse sobre puntuaciones de desarrollo del scorer que se despliegue.
- `adapter_config.json` conserva la ruta de la máquina de entrenamiento como modelo base; es necesario apuntar `--model-path` a la copia local de Ling-3.0-tiny.
- Riesgo de alucinación: no aplica como generador de texto, pero la calibración de la probabilidad puede degradarse fuera de la distribución de las familias de tareas vistas.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: el adaptador y el modelo base son MIT. Los datos de entrenamiento incluyen registros de ASSEBench (Apache-2.0), que a su vez adapta AgentHarm, cuya licencia permite su uso solo para mejorar la seguridad de sistemas de IA y cuyos autores piden que sus ejemplos no se usen para entrenamiento; se eliminaron del conjunto publicado 29 registros con nombres de herramientas de AgentHarm.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- [Hugging Face: ChangyuanChen/Ling-3.0-tiny-Agent-Safety-Gate](https://huggingface.co/ChangyuanChen/Ling-3.0-tiny-Agent-Safety-Gate)
- [Modelo base: inclusionAI/Ling-3.0-tiny](https://huggingface.co/inclusionAI/Ling-3.0-tiny)
- [AReno (infraestructura de entrenamiento y servicio)](https://github.com/inclusionAI/AReno)
- [Receta completa: ling-cookbook, Agent Safety Gate](https://github.com/inclusionAI/ling-cookbook/tree/main/guide/finetuning/ling-3.0-tiny/agent-safety-gate)
- [ASSEBench (AgentAuditor-ASSEBench)](https://github.com/Astarojth/AgentAuditor-ASSEBench)
- [Paper: AgentAuditor: Human-Level Safety and Security Evaluation for LLM Agents (arXiv:2506.00641)](https://arxiv.org/abs/2506.00641)
