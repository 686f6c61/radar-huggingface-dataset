# kenpeter123/microduck-rl

## Resumen

Microduck RL es una política de control por aprendizaje por refuerzo (reinforcement learning) para el robot bípedo Microduck de Pollen Robotics, un bípedo open source de 25 cm de altura equipado con servomotores Dynamixel XL330. El modelo no es un modelo de lenguaje: es un checkpoint de política neuronal entrenada con PPO mediante la librería rsl_rl sobre el simulador MuJoCo Warp (con el backend BAM), cuyo objetivo es conseguir locomoción bípeda rápida en la tarea de correr hacia delante. El autor es el usuario kenpeter123 y el repositorio se publica como un fork del proyecto upstream `pollen-robotics/microduck_rl`.

El problema que aborda es el de la locomoción bípeda a alta velocidad: la receta de entrenamiento de partida (DuckEMW running config) se modificó únicamente elevando el límite de velocidad a 2,5 m/s, sin recompensas de vuelo, sin recompensas de estilo Su y sin puerta de logro adicional. El resultado medido es una velocidad media máxima de 1,621 m/s para el comando de 2,0 m/s en el checkpoint final `model_76500.pt`, con p10 de 1,387 y p90 de 1,828. El objetivo declarado de 2,0 m/s de media no se alcanzó y el entrenamiento se detuvo por petición del usuario, por lo que el propio autor etiqueta el estado como inacabado.

La relevancia actual es metodológica y de reproducibilidad: el repositorio publica un script de evaluación (`scripts/eval_sprint_speed.py`) que mide desplazamiento real en el marco del mundo (`root_link_pos_w`) en lugar de métricas de recompensa, una práctica poco habitual y que corrige un problema frecuente de reporte inflado en la literatura de locomoción con RL. Además, libera los checkpoints y la configuración exacta con los "knobs" de velocidad, lo que lo convierte en un punto de partida útil para experimentos de sim-to-real y de ajuste de currículos de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control entrenada con PPO (rsl_rl); topología de la red no especificada en la model card. No es un transformer ni un MoE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: la política es reactiva y opera sobre observaciones del entorno de simulación, no sobre una ventana de tokens |
| Tipos de cuantizacion | no disponible (checkpoint de PyTorch en precisión de entrenamiento; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`checkpoints/model_76500.pt` y `checkpoints/model_59000.pt`) |
| Tarea | Locomoción bípeda de carrera hacia delante (Microduck, 25 cm, servos XL330) |
| Algoritmo de entrenamiento | PPO |
| Herramientas de entrenamiento | rsl_rl, MuJoCo Warp, backend BAM; tarea `Mjlab-Running-Flat-MicroDuck` |
| Configuracion de entorno | 4096 entornos en paralelo; 64 entornos en evaluación |
| Limite de velocidad configurado | `MICRODUCK_RUNNING_SPEED_CAP=2.5`, `MICRODUCK_RUNNING_TARGET_MAX_SPEED=2.5` |
| Iteraciones maximas | 80000 |
| Descargas en HuggingFace | 0 |
| Likes | 1 |

## Arquitectura y entrenamiento

Se trata de una política de control para robótica, no de un modelo generativo. El entrenamiento emplea PPO implementado en rsl_rl, ejecutado sobre MuJoCo Warp con el backend BAM y la tarea de locomoción `Mjlab-Running-Flat-MicroDuck`. La receta es la configuración exacta de carrera de DuckEMW con una única desviación: el límite de velocidad se elevó a 2,5 (`MICRODUCK_RUNNING_SPEED_CAP=2.5` y `MICRODUCK_RUNNING_TARGET_MAX_SPEED=2.5`). El autor indica explícitamente que se revirtieron las recompensas de vuelo, las recompensas de estilo Su y cualquier puerta de logro, volviendo a la base ya validada. La model card no detalla el número de parámetros de la red, la topología del actor y del crítico, ni el volumen total de muestras de entorno consumidas más allá de las 80000 iteraciones máximas y los 4096 entornos paralelos.

El aspecto técnico diferencial es el protocolo de evaluación de velocidad: `scripts/eval_sprint_speed.py` mide desplazamiento real en el marco del mundo (delta de `root_link_pos_w` dividido por el tiempo) sobre 64 entornos y reporta media, p10, p90, máximo y número de resets para cada comando de velocidad. El autor subraya que las métricas de recompensa o de currículo nunca se reportan como velocidad. No se documenta uso de RLHF, DPO ni de ningún esquema de alineación, ya que no aplica a este dominio.

## Capacidades

- Locomoción bípeda de carrera hacia delante en simulación: sigue comandos de velocidad de 0,4, 0,8, 1,2, 1,6 y 2,0 m/s con velocidades medias de 0,078, 1,211, 1,512, 1,575 y 1,621 m/s respectivamente.
- Control a alta velocidad con estabilidad razonable: en el comando de 2,0 m/s solo se registran 2 resets durante la evaluación, frente a 15 resets en el comando de 0,8 m/s.
- Seguimiento aproximado de comandos de velocidad: la política satura alrededor de 1,5-1,6 m/s y no alcanza comandos superiores a ~1,6 m/s de forma fiel.
- Comportamiento en bípedo de 25 cm con servos XL330: la política está entrenada específicamente para la morfología y los actuadores del Microduck.
- No soporta tool calling, function calling ni uso como agente.
- No tiene capacidades multilingües, de visión, de audio ni de razonamiento simbólico.
- No dispone de modo "thinking" ni de generación de texto de ningún tipo.

## Casos de uso

- Investigación en locomoción bípeda: sirve como política base reproducible para estudiar el efecto de elevar el límite de velocidad en el currículo de PPO, ya que la configuración de la tarea y los "knobs" de velocidad están publicados y son modificables.
- Evaluación metodológica de métricas de velocidad: el script de desplazamiento real en el marco del mundo puede reutilizarse para auditar resultados de otros entrenamientos y detectar reportes inflados basados en recompensa.
- Transferencia sim-to-real sobre Microduck: el checkpoint puede desplegarse en el bípedo físico de Pollen Robotics para medir la brecha entre la velocidad simulada (1,621 m/s de media a comando 2,0) y la real, aunque el repositorio no documenta ningún resultado en hardware.
- Punto de partida para ajuste fino con otras recompensas: al haber revertido el autor a la receta base de DuckEMW, el checkpoint es un init limpio para probar recompensas de vuelo, de estilo o puertas de logro sin arrastrar sesgos de entrenamientos previos.
- Docencia y prácticas de RL robótico: la combinación de rsl_rl, MuJoCo Warp y una tarea de locomoción lista para ejecutar con un solo comando permite montar prácticas de PPO con 4096 entornos paralelos.
- Comparación de límites de velocidad en currículos: los dos checkpoints publicados (cap 2,0 con 1,651 m/s y cap 2,5 con 1,621 m/s) permiten estudiar empíricamente si subir el límite del currículo degrada el resultado final.
- Reproducción de experimentos a gran escala: la configuración documentada (4096 envs, 80000 iteraciones, entorno `Mjlab-Running-Flat-MicroDuck`) permite replicar el cómputo y contrastar curvas de convergencia.

## Benchmarks y rendimiento

Evaluación completa de `model_76500.pt` con `scripts/eval_sprint_speed.py`, midiendo desplazamiento real en el marco del mundo sobre 64 entornos:

| cmd (m/s) | mean | p10 | p90 | max | resets |
|---|---|---|---|---|---|
| 0.4 | 0.078 | 0.000 | 0.174 | 0.377 | 12 |
| 0.8 | 1.211 | 0.636 | 1.565 | 1.615 | 15 |
| 1.2 | 1.512 | 1.187 | 1.775 | 1.858 | 4 |
| 1.6 | 1.575 | 1.323 | 1.820 | 1.899 | 6 |
| 2.0 | 1.621 | 1.387 | 1.828 | 1.923 | 2 |

Datos adicionales reportados por el autor:

| Metrica | Valor |
|---|---|
| Mejor media de velocidad del run | 1,621 m/s a comando 2,0 (checkpoint `model_76500.pt`, iteración 76506) |
| Mejor resultado anterior | 1,651 m/s a comando 2,0 (checkpoint `model_59000.pt`, cap 2,0) |
| Rango de fluctuación durante el entrenamiento | 1,52-1,65 m/s, sin superar 1,7 m/s |
| Objetivo declarado | 2,0 m/s de media a comando 2,0 (no alcanzado) |
| Estado del entrenamiento | detenido a petición del usuario el 2026-09-12 |

No se han publicado resultados comparativos frente a otros modelos o políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del checkpoint no se documenta y el repositorio ocupa 0,0 GB según HuggingFace.
- GPU para entrenamiento: no especificada, pero el uso de MuJoCo Warp implica una GPU NVIDIA con soporte CUDA. No se indica modelo ni VRAM necesaria.
- Carga de entrenamiento: 4096 entornos en paralelo durante hasta 80000 iteraciones; la evaluación usa 64 entornos.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el requisito real lo marca la escalabilidad de Warp con 4096 entornos, no el tamaño de la red.
- Opciones de despliegue: el checkpoint es un `.pt` de PyTorch y se ejecuta con la herramienta de entrenamiento de mjlab (`./.venv/bin/train`), con las variables de entorno `MICRODUCK_RUNNING_SPEED_CAP` y `MICRODUCK_RUNNING_TARGET_MAX_SPEED`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Hardware objetivo final: robot Microduck de 25 cm con servomotores Dynamixel XL330; el repositorio no detalla la computadora de a bordo ni el coste de inferencia en el robot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de otras políticas en la información proporcionada, por lo que la comparación se limita a los artefactos del propio proyecto.

| Modelo | Velocidad media a cmd 2,0 | Configuracion | Checkpoint | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-rl (`model_76500.pt`) | 1,621 m/s | Cap de velocidad 2,5; receta base DuckEMW | Si | no disponible | HuggingFace `kenpeter123/microduck-rl` |
| microduck-rl (`model_59000.pt`) | 1,651 m/s | Cap de velocidad 2,0 | Si | no disponible | Incluido en el mismo repositorio |
| `pollen-robotics/microduck_rl` (upstream) | no disponible | Receta de carrera DuckEMW original | no disponible | no disponible | GitHub |

No se han identificado en la información disponible otras políticas de locomoción bípeda comparables con métricas equivalentes.

## Limitaciones y advertencias

- El objetivo declarado de 2,0 m/s de media no se alcanzó: el mejor resultado es 1,621 m/s, un 19 % por debajo del objetivo.
- El título del repositorio ("2.0 m/s running push") puede inducir a error si no se lee el apartado de estado honesto; la velocidad medida no llega a 2,0 m/s.
- Entrenamiento detenido: no es un modelo convergido ni finalizado, sino el mejor checkpoint de un run interrumpido.
- Fuerte anomalía en comandos bajos: a 0,4 m/s la velocidad media es de 0,078 m/s con 12 resets, lo que indica que la política arranca mal de parada o no sigue bien comandos lentos.
- Inestabilidad en el rango de 0,8 m/s: 15 resets en la evaluación, el valor más alto de toda la tabla.
- Sin evidencia de despliegue en hardware real: todos los resultados son de simulación; no hay datos de sim-to-real ni de robustez ante perturbaciones físicas.
- Sin datos de sesgo ni de alucinación aplicables (no es un modelo generativo), pero tampoco hay análisis de robustez frente a cambios de morfología, fricción, terreno irregular o desgaste de servos.
- Licencia no disponible: no se puede confirmar si se permite uso comercial, redistribución o modificación del checkpoint.
- El repositorio es un fork de un proyecto upstream; la licencia del proyecto original tampoco se documenta en la información proporcionada.
- Cero descargas en HuggingFace: no hay validación por parte de terceros de los resultados reportados.
- Los resultados de búsqueda web asociados no contienen información técnica relevante sobre el modelo (solo páginas de inicio de sesión de correo), por lo que no se han podido verificar los datos con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kenpeter123/microduck-rl
- Repositorio upstream en GitHub: https://github.com/pollen-robotics/microduck_rl
- Configuración de la tarea de carrera (citada en la model card): `src/mjlab_microduck/tasks/microduck_running_env_cfg.py`
- Recompensas y currículo de velocidad (citado en la model card): `src/mjlab_microduck/tasks/mdp.py`
- Script de evaluación de velocidad (citado en la model card): `scripts/eval_sprint_speed.py`
- Checkpoints citados: `checkpoints/model_76500.pt` y `checkpoints/model_59000.pt`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
