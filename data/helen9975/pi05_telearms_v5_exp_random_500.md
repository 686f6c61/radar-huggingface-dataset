# helen9975/pi05_telearms_v5_exp_random_500

## Resumen

`helen9975/pi05_telearms_v5_exp_random_500` es un checkpoint de ajuste fino completo del modelo de robotica π₀.₅ (`lerobot/pi05_base`), desarrollado por el usuario helen9975. Se trata de un modelo de vision-lenguaje-accion (VLA) basado en flujo, entrenado para control bimanual de un robot YAM en simulacion. El modelo parte de la arquitectura π₀.₅ de Physical Intelligence, una version mejorada de π₀ con mejor generalizacion en entornos abiertos mediante entrenamiento con aislamiento de conocimiento.

El ajuste fino se realizo sobre el dataset `mliu48/telearms-yam-cube-v5-exp-random-500`, compuesto por 5.000 demostraciones bimanuales simuladas de 10 tareas, con 4.706.102 fotogramas a 30 Hz capturados por tres camaras de 224×224. Este checkpoint corresponde al paso 30.000 de entrenamiento, con un presupuesto de 15,36 millones de muestras, y forma parte de una serie de ocho experimentos comparables (Random-50/100/500/1000/1500, Elo-1500, Score-1500, DemInf-1500) disenados para evaluar el efecto de la seleccion de datos.

El modelo tiene 4.143.404.816 parametros totales (aproximadamente 4,14 mil millones) y un tamano de repositorio de 18,7 GB en formato safetensors. Es relevante en el contexto de investigacion en robotica porque explora como la seleccion aleatoria de demostraciones frente a otros criterios (Elo, score, diversidad) afecta al rendimiento de politicas VLA en tareas de manipulacion bimanual. El checkpoint no ha sido evaluado aun en simulacion segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flujo, π₀.₅ |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Tamano del repositorio | 18,7 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, una arquitectura de vision-lenguaje-accion (VLA) basada en flujo que combina un modelo de lenguaje, un codificador visual y un experto de accion. Segun el repositorio GitHub de referencia, π₀.₅ es una version mejorada de π₀ entrenada con aislamiento de conocimiento (knowledge insulation) para mejorar la generalizacion en entornos abiertos. El ajuste fino fue completo, abarcando el LLM, el codificador visual y el experto de accion, en precision bf16 con gradient checkpointing.

El entrenamiento se realizo sobre 5.000 demostraciones bimanuales simuladas del robot YAM, correspondientes a 10 tareas, con 4.706.102 fotogramas a 30 Hz y tres camaras de 224×224. No se aplico domain randomization. Se usaron 8 GPU H100 en un nodo, con batch de 64 por GPU (global 512), durante 30.000 pasos, lo que equivale a 15,36 millones de muestras. El optimizador fue AdamW (β = 0.9, 0.95, weight decay 0.01) con un LR maximo de 1e-4 (2.5e-5 × sqrt(512/32)), 1.000 pasos de warmup y decaimiento coseno hasta 1e-5 en 30.000 pasos. Se emplearon chunks de accion de 50 pasos con acciones relativas y pinzas absolutas. La perdida de entrenamiento reciente fue de 0.015. No se reservaron episodios para validacion, por lo que no hay perdida de validacion. El dataset de seleccion aleatoria (Random-500) toma 500 demostraciones por tarea extraidas aleatoriamente de todas las demostraciones exitosas que tienen demo score y ELO de jugador valorado; los conjuntos Random son anidados (Random-50 contenido en Random-100, etc. hasta Random-1500).

## Capacidades

- Control bimanual de robot YAM en simulacion: genera acciones de 50 pasos para dos brazos con pinzas absolutas.
- Percepcion visual multimodal: procesa tres camaras de 224×224 simultaneamente.
- Ejecucion de 10 tareas de manipulacion simuladas (segun el dataset de entrenamiento).
- Generacion de acciones condicionada por prompt de tarea: el modelo usa variantes de prompt por tarea (`meta/task_prompt_variants.json`).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se ha documentado modo thinking, vision general (fuera del contexto robotico) ni audio.

## Casos de uso

- Manipulacion robotica bimanual en simulacion: el modelo genera chunks de 50 acciones para coordinar dos brazos YAM en tareas de pick-and-place, apilado o ensamblaje simulado, aprovechando las tres camaras de 224×224 para percepción espacial.
- Investigacion en seleccion de datos para VLA: este checkpoint forma parte de una serie de ocho experimentos con el mismo presupuesto de entrenamiento (15,36M muestras) pero distinta estrategia de seleccion (Random-500 frente a Elo, Score, DemInf), lo que permite estudiar el impacto de la curacion de datos en el rendimiento final.
- Benchmarking de politicas bimanuales: sirve como linea base reproducible para comparar con otros checkpoints de la misma serie o con π₀.₅ base en tareas de manipulacion simulada.
- Desarrollo de pipelines de entrenamiento LeRobot: el codigo asociado (`helen9975/RoboEval-telearms`, rama `PI05_training`) incluye mejoras como NaN guards, correccion de logging con PyAV para velocidad de carga y configuracion de minimo de episodios por tarea, utiles para reproducir el entrenamiento.
- Estudio de generalizacion sin domain randomization: al entrenarse sin aleatorizacion de dominio, permite analizar la brecha sim-a-real y la robustez ante variaciones no vistas.
- Prototipado de control basado en lenguaje: el modelo acepta prompts de tarea, lo que facilita experimentar con instrucciones textuales para seleccionar entre las 10 tareas entrenadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "Evaluation: not yet evaluated in simulation." No se dispone de datos de MMLU, HumanEval, GSM8K ni metricas de exito en tareas roboticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 4.143.404.816 parametros (aproximadamente 4,14B), en bf16 se necesitarian al menos unos 8,3 GB solo para pesos, mas memoria para activaciones y buffers de vision; en cuantizacion de 8 bits, alrededor de 4,1 GB; en 4 bits, alrededor de 2,1 GB. Estas cifras son estimaciones teoricas basadas en el numero de parametros, no datos confirmados por el autor.
- GPU recomendadas: el entrenamiento se realizo con 8 × H100. Para inferencia, se desconoce la GPU minima; por tamano, una RTX 4090 (24 GB) o A100 (40/80 GB) podria ser suficiente en bf16, pero no esta confirmado.
- Cabe en GPU de consumo: probablemente si en RTX 3090/4090 (24 GB) en bf16, aunque no confirmado por el autor.
- Opciones de despliegue: la biblioteca indicada es LeRobot 0.6.1. No se mencionan vLLM, llama.cpp, Ollama ni TGI. El formato es safetensors, compatible con el ecosistema Hugging Face y LeRobot.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_telearms_v5_exp_random_500 | 4,14B | no disponible | VLA robotica bimanual | no disponible | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA robotica | no disponible | Hugging Face |
| π₀ (referencia) | no disponible | no disponible | VLA robotica | no disponible | GitHub Ailiee/pi05 |
| π₀-FAST | no disponible | no disponible | VLA autorregresivo | no disponible | GitHub Ailiee/pi05 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en simulacion segun la model card, por lo que se desconoce su tasa de exito real en las tareas entrenadas.
- No se reservaron episodios de validacion, lo que impide medir sobreajuste o generalizacion dentro del propio dataset.
- Entrenado sin domain randomization, lo que puede limitar la transferencia a entornos reales o a variaciones no presentes en los datos de entrenamiento.
- Solo cubre 10 tareas simuladas de manipulacion bimanual con el robot YAM; no es un modelo de proposito general.
- La licencia no esta disponible, lo que impide determinar si se permite uso comercial.
- Los idiomas soportados no estan disponibles; el modelo usa prompts de tarea, presumiblemente en ingles, pero no se confirma.
- Riesgo de alucinacion en el contexto de generacion de acciones: al ser un modelo de politica, puede producir acciones no validas o inseguras fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no disponibles.
- El checkpoint corresponde al paso 30.000 de una serie de ocho experimentos; su rendimiento relativo frente a los otros siete no se ha publicado.
- El repositorio tiene 2 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_500
- Dataset: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-500
- Codigo de entrenamiento: `helen9975/RoboEval-telearms` rama `PI05_training` @ `9dc9e9f`
- Repositorio GitHub de referencia π₀/π₀.₅: https://github.com/Ailiee/pi05
- LeRobot 0.6.1 @ `e40b58a8` con parche del repositorio (`tools/install_lerobot_patch.py`)
