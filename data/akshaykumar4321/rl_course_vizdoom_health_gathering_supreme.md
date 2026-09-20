# Akshaykumar4321/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario Akshaykumar4321 como parte de un curso de deep reinforcement learning, y esta construido con Sample-Factory, el framework de RL asincrono distribuido de referencia para entornos tipo Atari, DMLab y ViZDoom. No es un modelo de lenguaje ni un modelo generativo multimodal: es una politica entrenada para una tarea concreta, la recogida de botiquines de salud en un escenario 3D en primera persona mientras se evita morir.

La tarea `health_gathering_supreme` es uno de los escenarios clasicos de ViZDoom. El agente recibe observaciones visuales parciales en primera persona y debe aprender una politica de movimiento que maximice la recogida de botiquines, con un umbral de certificacion de recompensa media igual o superior a 5,0. Este checkpoint declara una recompensa media de 6,85 +/- 1,15, por encima de ese umbral.

Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo reproducible de un pipeline completo de RL con observaciones visuales, memoria recurrente y entrenamiento distribuido, no como componente listo para produccion. El repositorio ocupa 0,0 GB segun los metadatos de HuggingFace y no declara licencia ni idiomas, lo que limita su reutilizacion directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder convolucional especifico de ViZDoom (`make_vizdoom_encoder`) + RNN GRU de 1 capa + cabezas actor-critico de PPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; usa memoria recurrente GRU sobre observaciones) |
| Tipos de cuantizacion | no disponible (no se publican pesos en formatos cuantizables tipo GGUF o AWQ) |
| Idiomas soportados | no aplica (agente de RL sobre observaciones visuales; los metadatos no declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo declara 0,0 GB de tamano) |
| Algoritmo | PPO |
| Entorno | `doom_health_gathering_supreme` (ViZDoom) |
| Framework / libreria | Sample-Factory |
| Pipeline declarado | reinforcement-learning |
| Pasos de entrenamiento | 4.000.000 (`train_for_env_steps`) |
| Numero de workers | 8, con 4 entornos por worker (32 entornos en paralelo) |
| Batch size | 2048 |
| Gamma | 0,99 |
| GAE lambda | 0,95 |
| Learning rate | 0,0001 |
| Uso de RNN | si, tipo GRU, 1 capa |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La politica sigue el patron estandar de Sample-Factory para entornos con observaciones visuales: un encoder convolucional adaptado a ViZDoom que comprime cada frame en un vector de caracteristicas, seguido de una capa recurrente GRU de una sola capa que integra la informacion temporal, y finalmente las cabezas de actor y critico propias de PPO. El uso de RNN es clave en este escenario, porque el agente necesita recordar la posicion de los botiquines y el estado del entorno a partir de observaciones parciales en primera persona. El algoritmo es PPO con retornos generalizados (GAE lambda = 0,95) y factor de descuento gamma = 0,99.

El entrenamiento se configura con 8 workers y 4 entornos por worker, es decir, 32 instancias del entorno ejecutandose en paralelo durante 4.000.000 de pasos de entorno, con un batch de 2048 y una tasa de aprendizaje de 0,0001. No se documenta en la informacion disponible el numero exacto de muestras del dataset (al tratarse de RL, los datos se generan por interaccion con el simulador), ni si hubo ajuste fino posterior, RLHF o alguna fase adicional de optimizacion. Tampoco se detalla la composicion de recompensas ni el preprocesado de frames mas alla del encoder custom.

La innovacion tecnica relevante no esta en el modelo en si, sino en el marco: Sample-Factory implementa entrenamiento asincrono con muestreo desacoplado, lo que permite escalar el numero de entornos sin bloquear la optimizacion. El checkpoint publicado no incluye informacion sobre tecnicas adicionales como decodificacion especulativa, atencion lineal o variantes hibridas, que no aplican a este tipo de agente.

## Capacidades

- Control visual en primera persona en un entorno 3D de ViZDoom: navegacion y recogida de botiquines de salud.
- Aprendizaje de politica con observaciones parciales gracias a la memoria recurrente GRU.
- Optimizacion de una recompensa escalar con umbral de certificacion (recompensa media >= 5,0).
- Ejecucion de inferencia en el entorno `doom_health_gathering_supreme` mediante el runner de Sample-Factory.
- Reproducibilidad parcial: la model card publica la configuracion de entrenamiento completa en JSON.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingues ni de generacion de texto, codigo, matematicas, vision general, audio o thinking mode.
- El unico dominio soportado es el escenario ViZDoom para el que fue entrenado; no se declara generalizacion a otras tareas.

## Casos de uso

- Material didactico en cursos de deep RL: sirve como ejemplo completo y reproducible de un pipeline PPO con observaciones visuales, util para que los alumnos comparen su propia implementacion contra un checkpoint ya entrenado.
- Verificacion de un entorno de entrenamiento: permite validar que una instalacion de Sample-Factory y ViZDoom funciona correctamente ejecutando inferencia sobre un agente que supera el umbral de certificacion.
- Referencia de linea base para investigacion en RL visual: se puede usar como punto de partida para medir mejoras en eficiencia de muestreo, cambios de encoder o variantes de PPO en el mismo escenario.
- Estudio de memorias recurrentes en RL parcialmente observable: el agente es un caso practico para analizar como una GRU de una capa resuelve la tarea con observaciones en primera persona.
- Demostraciones visuales y generacion de replays: la model card incluye un video de replay, reutilizable para divulgacion o para comparar cualitativamente politicas entre checkpoints.
- Pruebas de integracion de infraestructura distribuida: reproducir la configuracion de 8 workers y 4 entornos por worker sirve para validar el escalado asincrono de Sample-Factory en un cluster.
- Experimentos de robustez: se puede evaluar como se degrada el agente ante perturbaciones en el entorno (cambios de dificultad, semillas distintas) para estudiar sensibilidad de la politica.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. El campo `verified` es `false`, por lo que la metrica no esta verificada de forma independiente.

| Tarea | Dataset / entorno | Metrica | Valor | Umbral |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 6,85 +/- 1,15 | >= 5,0 (certificado como apto) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables al tratarse de un agente de RL y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el numero de parametros ni los requisitos de memoria.
- GPU recomendadas: no disponible. Sample-Factory soporta entrenamiento e inferencia en GPU, pero la informacion proporcionada no especifica modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no disponible. Dado el tamano del encoder convolucional y la GRU, es plausible un agente ligero, pero no hay datos en la informacion proporcionada para afirmarlo con cifras.
- CPU: el entrenamiento declarado usa 8 workers con 4 entornos cada uno, lo que implica carga significativa de simulacion ViZDoom en CPU ademas del calculo en GPU.
- Opciones de despliegue: el unico camino documentado es el runner de inferencia de Sample-Factory (`enjoy.py`) sobre el entorno ViZDoom. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.
- Caveat de disponibilidad: el repositorio declara 0,0 GB de tamano y 0 descargas, por lo que no esta confirmado que los pesos del checkpoint esten efectivamente subidos y sean descargables.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Cualitativamente, este checkpoint se situa en la misma categoria que otros agentes PPO para `doom_health_gathering_supreme` entrenados con Sample-Factory, CleanRL o RLlib, y que las lineas base publicadas por el propio proyecto Sample-Factory, pero no hay cifras verificables para establecer una comparacion numerica.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akshaykumar4321/rl_course_vizdoom_health_gathering_supreme | no disponible | no aplica | mean_reward 6,85 +/- 1,15 (no verificado) | no disponible | HuggingFace, 0 descargas, repo de 0,0 GB |
| Otros agentes PPO para el mismo entorno (Sample-Factory, CleanRL, RLlib) | no disponible | no aplica | no disponible | no disponible | no disponible |
| Lineas base oficiales de Sample-Factory | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. En RL visual, el agente puede sobreexplotar las regularidades del escenario y de la semilla de entrenamiento; no se documenta ningun analisis al respecto.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de sobreajuste al entorno especifico y de degradacion del rendimiento fuera de las condiciones de entrenamiento.
- Limitacion de contexto: el agente depende de una GRU de una capa; la memoria efectiva es limitada y no hay mediciones publicadas de su horizonte temporal.
- Limitacion de idioma y de dominio: no es un modelo de lenguaje y solo esta entrenado para `doom_health_gathering_supreme`. No hay evidencia de transferencia a otros escenarios ViZDoom ni a otras tareas.
- Restricciones de licencia: la licencia no esta declarada. Sin licencia explicita, no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Metrica no verificada: el resultado de 6,85 +/- 1,15 figura con `verified: false`. No hay evaluacion independiente que lo confirme.
- Reproducibilidad: el repositorio declara 0,0 GB, por lo que los pesos podrian no estar disponibles o estar incompletos; ademas, los archivos auxiliares de la model card (como `replay.mp4`) podrian no existir en el repo.
- Madurez: 0 descargas y 0 likes, creado y actualizado en septiembre de 2026 con segundos de diferencia, lo que indica un artefacto de curso sin mantenimiento ni validacion por terceros.
- Advertencia sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (son sitios de solitario en polaco) y no deben usarse como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akshaykumar4321/rl_course_vizdoom_health_gathering_supreme
- Repositorio del framework Sample-Factory (referencia del ecosistema, no incluido en la informacion proporcionada): https://github.com/alex-petrenko/sample-factory
- Sitio oficial de ViZDoom (referencia del entorno, no incluido en la informacion proporcionada): https://vizdoom.cs.put.edu.pl/
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante; los resultados devueltos corresponden a sitios de solitario en polaco (`pasjans-online.pl`, `gra-pasjans.pl`, `pasjans.org.pl`, `pasjanse.com.pl`, `grypasjans.pl`) y son ajenos al modelo.
