# HoonheeCho/s1-stale50d5-ckpt-1103

## Resumen

El modelo identificado como `HoonheeCho/s1-stale50d5-ckpt-1103` es un checkpoint de pesos de PyTorch publicado en Hugging Face por el usuario HoonheeCho. No se trata de un modelo de lenguaje generativo al uso, sino de un artefacto intermedio de un pipeline de investigación en aprendizaje por refuerzo o modelado de mundo (world model), tal y como se deduce de los nombres de los ficheros (`model_step50000.pt`, `args.json`) y de los argumentos de entrenamiento documentados en la model card.

El repositorio contiene únicamente el estado del modelo en el paso 50.000 de entrenamiento de la ejecución `wm7_i3_film_R3_stale50d5`, junto con el fichero de argumentos que incluye las estadísticas de normalización necesarias para cargarlo. La model card indica explícitamente que no hay código en el repositorio, por lo que se trata de un checkpoint "suelto" pensado para ser consumido por el código de entrenamiento del autor (`evwm/train_wm7.py`), no para uso directo con librerías estándar de inferencia.

La relevancia de esta ficha es limitada para el público general de desarrolladores: no hay información sobre arquitectura de lenguaje, tokenizador, idiomas ni benchmarks estándar. Sin embargo, el checkpoint incluye métricas de éxito en bucle cerrado para cuatro tareas (wander, leafcatch, basket, place) que permiten situar su rendimiento en el contexto de la investigación del autor. El tamaño del repositorio (0,5 GB) sugiere un modelo de tamaño moderado, probablemente con componentes de visión y acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de un world model / policy de RL; se infiere de los argumentos `wm7_i3_film_R3`, FiLM y `m0_vla_only`) |
| Parametros totales | no disponible (el repo pesa 0,5 GB, lo que orienta a un modelo de decenas o pocos cientos de millones de parametros, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye un state dict en `float32`/`float16` sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las tareas son de control/visión) |
| Licencia | other (sin texto de licencia en el repositorio) |
| Formato de pesos | PyTorch state dict (`torch.save`) en `model_step50000.pt`; argumentos y estadísticas en `args.json` |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna con detalle. Los nombres de la ejecución (`wm7_i3_film_R3_stale50d5`) y de los argumentos (`--base_stale 0.5 --base_stale_depth 5 --m0_vla_only 1`, "hindsight latent on (FiLM)", "RGB loss weight 3") apuntan a un modelo de mundo o policy multimodal que combina observaciones RGB con latentes de hindsight y modulación FiLM. El sufijo `vla_only` sugiere que la variante `m0` se entrena únicamente con datos de visión-lenguaje-acción (VLA).

El entrenamiento se realizó sobre 2 GPUs con batch 16 durante 2 épocas, totalizando 65.964 pasos. El checkpoint publicado corresponde al paso 50.000, inicializado desde `wm7_i3_film_R/model_step20000.pt`. No se especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; en el contexto de RL/world models, lo habitual es entrenamiento supervisado sobre trayectorias y, opcionalmente, ajuste con refuerzo, pero no se confirma en la información proporcionada.

## Capacidades

- Control de políticas en entornos simulados: el checkpoint se evalúa en cuatro tareas (wander, leafcatch, basket, place) con éxito en bucle cerrado medido sobre 100 semillas por tarea.
- Procesamiento de observaciones RGB: la pérdida de RGB con peso 3 indica que el modelo aprende una representación visual del entorno.
- Modelado de mundo con latentes de hindsight: la opción "hindsight latent on (FiLM)" sugiere capacidad de razonar sobre estados futuros o pasados para mejorar la política.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y multi-step reasoning: parcialmente, en el sentido de que es un componente de agente encarnado (embodied agent) que actúa en un entorno, no un orquestador de herramientas.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se documentan thinking mode, visión general, audio ni otras.

## Casos de uso

- Investigación en aprendizaje por refuerzo encarnado: el checkpoint sirve como punto de partida para reproducir o continuar experimentos del autor en tareas de navegación y manipulación, cargándolo con `torch.load` y las estadísticas de `args.json`.
- Evaluación comparativa de world models: al estar disponible el estado en el paso 50.000, se puede comparar el éxito en bucle cerrado (media 59,8) frente a otros checkpoints de la misma ejecución o de ejecuciones vecinas.
- Fine-tuning sobre nuevas tareas de control: al ser un state dict de PyTorch, puede inicializarse en el código `evwm/train_wm7.py` y adaptarse a entornos con observaciones RGB similares.
- Estudio de la modulación FiLM y latentes de hindsight: el checkpoint permite analizar ablaciones sobre `--base_stale` y `--base_stale_depth` en una etapa avanzada del entrenamiento.
- Reproducción de resultados de la model card: las métricas por tarea (wander 62, leafcatch 51, basket 57, place 69) permiten validar la infraestructura de evaluación del autor antes de lanzar nuevos entrenamientos.
- Docencia y divulgación: como ejemplo de artefacto de investigación en RL, útil para mostrar cómo se publican checkpoints intermedios con estadísticas de normalización y métricas de éxito en bucle cerrado.

## Benchmarks y rendimiento

La model card solo reporta éxito en bucle cerrado (4 tareas x 100 semillas, sincronización S2). No hay benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni de visión.

| Tarea | Éxito en bucle cerrado (%) |
|---|---|
| wander | 62 |
| leafcatch | 51 |
| basket | 57 |
| place | 69 |
| Media | 59,8 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 0,5 GB, por lo que en `float32` cabría en GPUs consumer con 4-8 GB, pero depende de la arquitectura real y del entorno de simulación.
- GPU recomendadas: el entrenamiento se realizó con 2 GPUs (modelo no especificado); para inferencia, una única GPU consumer reciente (RTX 3060 o superior) podría ser suficiente dado el tamaño del checkpoint, aunque no se confirma.
- Cabe en consumer GPU: probablemente sí, dado el tamaño del repositorio, pero no verificado.
- Opciones de despliegue: no aplican las herramientas habituales (vLLM, llama.cpp, Ollama, TGI) porque no es un modelo de lenguaje; el despliegue requiere el código de entrenamiento `evwm/train_wm7.py` del autor y el simulador correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (world models o policies de RL con observaciones RGB) con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- El repositorio contiene solo el checkpoint y los argumentos; no incluye código de inferencia, tokenizador ni configuración de modelo estándar, por lo que no es cargable con `transformers` ni con librerías convencionales.
- La licencia es "other" sin texto legal adjunto: no se concede explícitamente uso comercial y conviene contactar con el autor antes de cualquier despliegue productivo.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución; al ser un modelo de control, los fallos se manifiestan como acciones incorrectas en el entorno, no como texto inventado.
- Las métricas de éxito (media 59,8) corresponden a un checkpoint intermedio (paso 50.000 de 65.964), no al modelo final; el rendimiento puede diferir del checkpoint final de la ejecución.
- No se documentan idiomas ni capacidades multilingües; no debe usarse como modelo de lenguaje.
- El checkpoint depende de las estadísticas de normalización de `args.json`; cargarlo sin ellas produce resultados inválidos.
- No hay garantía de reproducibilidad: no se especifican versiones de PyTorch, semillas ni detalles del simulador.

## Enlaces

- Hugging Face: https://huggingface.co/HoonheeCho/s1-stale50d5-ckpt-1103
