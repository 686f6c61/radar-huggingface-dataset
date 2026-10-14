# Kyry10/microduck-arena-lab

## Resumen

Microduck Arena Lab es un snapshot de investigación publicado por el usuario Kyry10 que empaqueta políticas de locomoción por refuerzo para el robot Microduck, adaptadas a tres circuitos de la Microduck Arena (sprint de 2 m, subida de 1,5 m con pendiente de 8° y sprint rodante de 2 m) dentro del simulador MuJoCo. No es un modelo de lenguaje: se trata de una política de control que parte de los pesos con licencia de HannesVonEssen/microduck-running y conserva intacta la interfaz del actor (61 observaciones, 14 acciones) junto con su normalizador exacto.

El objetivo es conseguir marchas más rápidas y, sobre todo, reproducibles. La metodología selecciona checkpoints mediante evaluación exhaustiva de cinco semillas en la propia Arena, de modo que solo las políticas con 5/5 finalizaciones pueden convertirse en mejor resultado de un evento. El snapshot documenta tanto los éxitos como los experimentos fallidos, lo que aporta valor metodológico más allá del resultado puntual.

El repositorio no contiene los pesos completos (se excluyen deliberadamente de git y se alojan en Hugging Face) y su tamano es de 0,0 GB. La política rodante alcanzó el puesto oficial número 1 con 1,648 s y un candidato local posterior de 1,516 s, mientras que el objetivo de sprint de 0,988 s no se alcanzó en este snapshot. Todos los resultados son de simulación MuJoCo, no de robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control actor-critic entrenada por aprendizaje por refuerzo (rsl_rl sobre mjlab / MuJoCo); interfaz fija de 61 observaciones y 14 acciones; actor exportable a ONNX |
| Parametros totales | no disponible (el repositorio excluye los pesos y no publica el recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 valores por paso de simulación) |
| Tipos de cuantizacion | no disponible (actores exportados en ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (actores); checkpoints de entrenamiento con actor, crítico y optimizador alojados en Hugging Face y excluidos de git |

## Arquitectura y entrenamiento

Se trata de una política de locomoción basada en aprendizaje por refuerzo, no de un transformer ni de un modelo de lenguaje. La interfaz del actor es fija: 61 observaciones de entrada y 14 acciones de salida, con el normalizador exacto preservado para garantizar compatibilidad con los pesos de partida. Los actores importados en ONNX reciben un crítico nuevo, mientras que los checkpoints propios reanudan actor, crítico y optimizador de forma conjunta. El entrenamiento se apoya en mjlab y rsl_rl, con MuJoCo como sustrato de simulación.

La adaptación al circuito se hace empezando desde STAND, usando el carril real y la pendiente o los rodillos correspondientes, con física BAM nominal, variación estrecha de condiciones de arranque y retardo, recompensa hacia delante, bonus de finalización y penalización por caída. La selección se puntúa cada 100 iteraciones (o cada 50 en fase de pulido) y exige 5/5 finalizaciones. No se detalla en la información disponible el número de tokens ni la composición de un dataset, por no tratarse de un modelo de lenguaje; tampoco se especifica si hubo RLHF o DPO, que no aplican a este tipo de entrenamiento.

## Capacidades

- Generación de marchas de locomoción para el robot Microduck en simulación MuJoCo.
- Sprint en línea recta: mejor media local de 1,084 s en el circuito de 2 m.
- Subida de pendiente del 8°: mejor media local de 1,360 s en el circuito de 1,5 m.
- Desplazamiento rodante: mejor media local de 1,516 s en el circuito rodante de 2 m.
- Ejecución de políticas exportadas en formato ONNX con interfaz de 61 observaciones y 14 acciones.
- Evaluación reproducible por cinco semillas, con artefactos seleccionados inmutables.
- Diagnóstico de velocidad, inclinación y contactos con la pared durante el desarrollo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Benchmarking de algoritmos de RL: el repositorio permite comparar políticas de locomoción bajo un protocolo idéntico de cinco semillas y circuitos fijos, útil para medir de forma justa variantes de hiperparámetros o de función de recompensa.
- Reproducción de experimentos: las guías de sprint, subida y rodillo, junto con los overlays de reproducción, permiten reconstruir cada resultado sobre un checkout fijado del simulador upstream.
- Investigación en transferencia sim-to-real: las políticas sirven como punto de partida para estudiar hasta qué punto una marcha rápida en MuJoCo se mantiene en hardware físico, aunque el repositorio no valida ese paso.
- Docencia de aprendizaje por refuerzo: la separación entre actor, crítico y optimizador, y la exigencia de 5/5 finalizaciones, son un ejemplo didáctico de selección rigurosa de checkpoints frente a confiar en la última iteración.
- Optimización de marchas sobre pesos preentrenados: el flujo de calentamiento a partir de pesos con licencia Apache-2.0 permite continuar el entrenamiento sin partir de cero y con un contrato de actor estable.
- Evaluación de robustez: las variaciones de arranque, el retardo de actuadores y el barrido de comandos documentados permiten medir sensibilidad de la política a perturbaciones controladas.
- Integración en la Microduck Arena: el modelo está pensado para ejecutarse en el entorno de evaluación oficial de Pollen Robotics, de modo que sirve para comparar posiciones en la clasificación de forma estandarizada.

## Benchmarks y rendimiento

Resultados de simulación MuJoCo reportados en el snapshot. La columna "Media publicada en la Arena" es la entrada enviada oficialmente; la mejor media local y la entrada publicada pueden corresponder a políticas distintas.

| Circuito | Mejor media local | Finalizaciones | Media publicada en la Arena | Checkpoint seleccionado |
|---|---:|---:|---:|---|
| Sprint de 2 m | 1,084 s | 5/5 | 1,096 s | D1 launchboost, 900 |
| Subida de 1,5 m, 8° | 1,360 s | 5/5 | 1,360 s | H1b adaptation, 500 |
| Sprint rodante de 2 m | 1,516 s | 5/5 | 1,648 s (puesto oficial n.º 1) | R2 polish, 1100 |

El objetivo de sprint era 0,988 s y no se alcanzó en este snapshot. El candidato rodante de 1,516 s aún no se había enviado cuando se ensambló el snapshot. Las clasificaciones son una instantánea fechada, no una promesa sobre la tabla en vivo. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tipo de modelo (política de control con 61 observaciones y 14 acciones) la inferencia es de muy baja exigencia y cabe holgadamente en CPU.
- GPU recomendadas: no se especifican. El entrenamiento con mjlab y rsl_rl puede acelerarse con GPU, pero no se documentan modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no disponible. Dado el tamano reducido de la red, es previsible que cualquier GPU de consumo moderna sea suficiente, aunque esto no está confirmado en la información proporcionada.
- Opciones de despliegue: ejecución dentro del simulador MuJoCo mediante mjlab y rsl_rl, y actores exportados en ONNX para inferencia con un runtime ONNX; el repositorio se instala como overlay sobre un checkout fijado del simulador upstream.
- Latencia y throughput: no disponibles. Los tiempos reportados (1,084 s, 1,360 s, 1,516 s) son tiempos de finalización de circuito, no métricas de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Contexto / interfaz | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| Kyry10/microduck-arena-lab | Política RL para Microduck (snapshot de investigación) | Apache-2.0 | 61 observaciones, 14 acciones | Sprint 1,084 s; subida 1,360 s; rodillo 1,516 s (local) | Hugging Face, pesos fuera de git |
| HannesVonEssen/microduck-running | Política RL de carrera, modelo base | Apache-2.0 | 61 observaciones, 14 acciones (misma interfaz) | No disponible en la información proporcionada | Hugging Face |
| Políticas de referencia sin licencia citadas como benchmark | Políticas RL de referencia | no disponible (sin licencia) | no disponible | No disponible | Solo usadas como referencia, nunca como padres de entrenamiento |

No se dispone de una comparación numérica directa entre estos modelos en la información proporcionada; la única referencia cuantitativa es que la entrada rodante oficial de este snapshot marcó 1,648 s y ocupó el puesto n.º 1 en la fecha de ensamblaje.

## Limitaciones y advertencias

- Todos los resultados son de simulación MuJoCo. No hay validación en robot físico ni evidencia de transferencia sim-to-real.
- El objetivo de sprint de 0,988 s no se alcanzó, y el propio autor documenta experimentos fallidos (recortes de marcha estáticos y continuaciones posteriores que no funcionaron).
- Las clasificaciones son una instantánea fechada; no reflejan necesariamente la tabla de líderes en vivo.
- Los pesos completos no están en el repositorio git (tamano de 0,0 GB); hay que descargarlos de Hugging Face. El repositorio empaqueta adiciones de experimentos, no una copia completa del simulador.
- La licencia Apache-2.0 cubre las adiciones y guías del autor; las dependencias y los activos del robot conservan sus licencias y avisos originales, según el fichero NOTICE. Verificar antes de uso comercial.
- No hay información sobre sesgos, alucinación o comportamiento en dominios fuera de los tres circuitos evaluados; extrapolar a otras geometrías, físicas o condiciones de arranque no está respaldado por los datos.
- Riesgo de sobreajuste a las condiciones concretas del evento: la variación de arranque y retardo descrita es estrecha, lo que puede reducir la robustez ante perturbaciones no contempladas.
- El modelo no procesa lenguaje ni modalidades de texto, imagen o audio, por lo que no aplican métricas ni advertencias típicas de modelos generativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kyry10/microduck-arena-lab
- Modelo base: https://huggingface.co/HannesVonEssen/microduck-running
- Microduck Arena (Space de evaluación): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Simulador Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck_rl
- mjlab: https://github.com/mujocolab/mjlab
- rsl_rl: https://github.com/leggedrobotics/rsl_rl
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de Hugging Face.
