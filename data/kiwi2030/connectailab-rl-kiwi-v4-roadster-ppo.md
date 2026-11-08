# kiwi2030/connectailab-rl-kiwi-v4-roadster-ppo

## Resumen

`connectailab-rl-kiwi-v4-roadster-ppo` es un agente de control continuo entrenado con PPO (Proximal Policy Optimization) por el autor `kiwi2030` en el marco de CONNECT AI LAB. El modelo resuelve una tarea de control de un "roadster" (vehículo) invertido: aprender a modular la potencia de los propulsores y la rotación para completar un aterrizaje controlado. No es un modelo de lenguaje: es una política neuronal pequeña que mapea 7 observaciones del entorno a 2 acciones continuas.

El repositorio es de tamaño prácticamente nulo (0.0 GB) y contiene únicamente un `state_dict` de PyTorch (`model.pt`) correspondiente a una política con forma (7, 2, continuo=True), junto con el código del entorno (`roadster_simulator.py`) y la definición de la red (`model.py`). La relevancia es la de un experimento reproducible de RL aplicado a control físico, no la de un modelo de propósito general.

Según la model card, la versión v4 alcanza un 100,0 % de éxito (200/200 episodios) en una evaluación separada de 200 partidas con semillas 1000000–1000199, usando la media de las acciones (política determinista). Se trata de un único experimento con semilla de entrenamiento 0, por lo que la cifra debe interpretarse como resultado de una sola ejecución, no como una estimación robusta de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para PPO (definida en `model.py`), entrada 7, salida 2 continuas |
| Parámetros totales | no disponible (red de muy pequeño tamaño; el repo ocupa 0.0 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `state_dict` de PyTorch, `model.pt`) |
| Idiomas soportados | no aplica (agente de control; la model card está en coreano) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict de PyTorch) |

## Arquitectura y entrenamiento

La política es una red neuronal cuya definición exacta (número de capas, anchura, activaciones) no se detalla en la información disponible; lo único confirmado es la interfaz: 7 entradas de observación y 2 salidas continuas, con una cabeza de distribución gaussiana propia de PPO para acción continua. El entorno está implementado en `roadster_simulator.py` y las dependencias se instalan con `requirements.txt`.

El entrenamiento se realizó con PPO durante 1.000.000 de pasos de actualización (1.001.472 pasos reales de recolección), con tasa de aprendizaje 0,0005, bonus de exploración 0,01 y semilla 0. La model card compara cuatro versiones: v1 (1M pasos, lr 0,0005, bonus 0,0) con 97,5 % de aterrizajes; v2 (1,2M pasos, lr 0,0006, bonus 0,2) con 0,0 %; v3 (1,5M pasos, lr 0,0004, bonus 0,0) con 88,5 %; y v4 (1M pasos, lr 0,0005, bonus 0,01) con 100,0 %. El caso v2 ilustra la sensibilidad del entrenamiento PPO a los hiperparámetros en este entorno: un bonus de exploración alto colapsó el rendimiento. No se documenta uso de RLHF, DPO ni datos supervisados; es RL puro sobre simulación.

## Capacidades

- Control continuo de dos acciones (potencia de propulsión y rotación) a partir de 7 observaciones del entorno del roadster.
- Aterrizaje/estabilización del vehículo invertido en el simulador propio del repositorio.
- Política determinista evaluable con la media de la distribución de acciones; también puede muestrearse para exploración.
- Reproducibilidad: semilla de entrenamiento 0 documentada y conjunto de evaluación fijo (semillas 1000000–1000199).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni generación de texto.
- No es multilingüe ni procesa lenguaje natural: su dominio es exclusivamente numérico y específico del entorno.

## Casos de uso

- Reproducción de experimentos de RL: cargar `model.pt` con `model.py` y `roadster_simulator.py` para replicar la evaluación de 200 episodios y verificar el 100 % reportado.
- Docencia de PPO en control continuo: el par (entorno + política + tabla de versiones v1–v4) sirve como caso de estudio de cómo el bonus de exploración y la tasa de aprendizaje alteran la convergencia.
- Línea base para comparación de algoritmos: usar esta política PPO como referencia frente a SAC, TD3 o DQN en el mismo simulador de roadster.
- Estudio de ablación de hiperparámetros: la tabla de versiones permite analizar el colapso de v2 (bonus 0,2) y la mejora de v4 (bonus 0,01) con el mismo presupuesto de pasos.
- Integración en pipelines de simulación a escala: al ser una red minúscula, puede ejecutarse en CPU en paralelo para barridos de semillas o pruebas de robustez.
- Demostración de control físico en vídeo: el repositorio incluye `replay.mp4` generado con la política real, útil para material divulgativo o presentaciones de laboratorio.

## Benchmarks y rendimiento

Los únicos datos publicados son la tasa de aterrizaje en la evaluación separada de 200 episodios (media de acciones), comparando versiones del propio autor:

| Versión | Pasos de entrenamiento | Tasa de aprendizaje | Bonus de exploración | Aterrizajes (200 episodios) |
|---|---:|---:|---:|---:|
| v1 | 1.000.000 | 0,0005 | 0,0 | 97,5 % (195/200) |
| v2 | 1.200.000 | 0,0006 | 0,2 | 0,0 % (0/200) |
| v3 | 1.500.000 | 0,0004 | 0,0 | 88,5 % (177/200) |
| v4 | 1.000.000 | 0,0005 | 0,01 | 100,0 % (200/200) |

No se han publicado resultados frente a modelos externos (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo. Los resultados corresponden a una sola semilla de entrenamiento (0) y no incluyen intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red (7→2) cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con CUDA (por ejemplo, RTX 3060 o superior) acelera el barrido de episodios, pero una CPU moderna es suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU; el cuello de botella será el simulador, no la red.
- Opciones de despliegue: PyTorch nativo cargando `model.pt` como `state_dict`; no hay pesos en GGUF, ONNX ni formatos de servidores de inferencia de LLM (vLLM, TGI, llama.cpp, Ollama no aplican).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Resultado publicado | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-kiwi-v4-roadster-ppo | Política de control continuo (7→2) | Roadster invertido | PPO | 100,0 % (200/200) | no disponible |
| connectailab-rl-kiwi-v3-lunarlander | Política de control | LunarLander | DQN | no disponible en la información | no disponible |
| connectailab-rl-kiwi-v1-link01 | Política de decisión de rutas | Robot / path selection | PPO (sobre política teacher) | no disponible en la información | no disponible |
| connectailab-rl-kiwi-v2-teacher | Política PPO "teacher" | Connect Tycoon (decisión de empresa) | PPO | no disponible en la información | Apache-2.0 |

Los modelos comparables son del mismo autor y familia (CONNECT AI LAB); no se dispone de referencias externas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Específico de un único entorno: la política solo es válida para el simulador de roadster del repositorio; no generaliza a otros dominios ni a un vehículo real sin transferencia adicional.
- Resultado de una sola semilla: el 100 % proviene de un entrenamiento con semilla 0; no hay evidencia de robustez entre semillas ni de varianza del rendimiento.
- Alta sensibilidad a hiperparámetros: la versión v2 con bonus de exploración 0,2 cayó a 0 % de aterrizajes, lo que indica fragilidad del ajuste.
- Sin licencia declarada: no se especifican términos de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Sin datos de sesgo, alucinación o seguridad: no aplican sesgos lingüísticos, pero tampoco se documentan evaluaciones de robustez ante perturbaciones del entorno.
- Repositorio de 0.0 GB y sin descargas ni likes: no hay evidencia de validación por terceros ni de mantenimiento.
- La model card está redactada en coreano; la documentación técnica en inglés es inexistente, lo que dificulta la adopción fuera de ese idioma.

## Enlaces

- Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v4-roadster-ppo
- Modelo previo v3 (LunarLander, DQN): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- Modelo previo v1 (LINK-01): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Modelo v2 (Connect Tycoon): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Modelo teacher v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
- MEETORY (guía de viajes): https://meetory.kr
- YouTube del autor: https://www.youtube.com/@kiwi_overai
