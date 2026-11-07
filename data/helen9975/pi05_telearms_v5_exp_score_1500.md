# helen9975/pi05_telearms_v5_exp_score_1500

## Resumen

`pi05_telearms_v5_exp_score_1500` es un checkpoint intermedio de un ajuste fino completo (full fine-tune) del modelo de robotica π₀.₅ (`lerobot/pi05_base`) sobre un conjunto de demostraciones simuladas de manipulacion bimanual. Lo publica el usuario `helen9975` como parte de una familia de ocho experimentos (v5) disenados para comparar estrategias de seleccion de datos de entrenamiento. El checkpoint corresponde al paso 23.500 de 30.000 de un entrenamiento que, segun la model card, seguia en ejecucion en el momento de la publicacion.

El modelo resuelve el problema de aprendizaje por imitacion (imitation learning) para control de robots: dado un prompt de tarea y las imagenes de tres camaras de 224×224, predice trozos de acciones (action chunks) de 50 pasos. El conjunto de datos de partida contiene 15.000 demostraciones simuladas de un robot YAM bimanual en 10 tareas distintas, con 9.115.598 fotogramas a 30 Hz. Este checkpoint concreto usa 1.500 demostraciones por tarea, seleccionadas aleatoriamente dentro de la banda de alta proficiencia segun la puntuacion de demostracion (demo score).

Es relevante ahora porque forma parte de un estudio controlado sobre seleccion de datos en robotica: los ocho experimentos comparten receta y presupuesto de muestras (15,36 millones), lo que permite comparar el efecto de curar el dataset por puntuacion frente a seleccion aleatoria o por ELO del operador. No obstante, es un artefacto de investigacion: no se ha evaluado en simulacion, no tiene licencia declarada y no esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (vision-language-action, transformer con experto de accion; fine-tune completo de `lerobot/pi05_base`) |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea se gestionan via `meta/task_prompt_variants.json`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (directorio `pretrained_model/` del checkpoint) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de π₀.₅, un modelo vision-language-action que combina un backbone de lenguaje y vision con un experto de accion dedicado. El ajuste afecta a los tres componentes (LLM, vision y experto de accion), en precision bf16 con gradient checkpointing. La salida son chunks de 50 acciones con acciones relativas y pinzas absolutas.

Los datos de entrenamiento son 15.000 demostraciones simuladas de un robot YAM bimanual en 10 tareas, con 9.115.598 fotogramas a 30 Hz y tres camaras de 224×224, sin aleatorizacion de dominio. Este checkpoint usa 1.500 demostraciones por tarea seleccionadas al azar dentro de la banda de alta proficiencia por demo score. El entrenamiento se ejecuto en 8×H100 (un nodo), batch 64 por GPU (global 512), 30.000 pasos (15,36 millones de muestras); este checkpoint ha visto 12,03 millones. Optimizador AdamW (β = 0,9 y 0,95, weight decay 0,01), LR pico 1e-4 (2,5e-5 × sqrt(512/32)), 1.000 pasos de warmup y decaimiento coseno hasta 1e-5. La perdida de entrenamiento reciente es 0,020. No se reservaron episodios para validacion, por lo que no existe perdida de validacion. Se usaron variantes de prompt por tarea.

## Capacidades

- Prediccion de acciones motoras para un robot YAM bimanual a partir de observaciones visuales de tres camaras y un prompt de tarea.
- Generacion de chunks de accion de 50 pasos con acciones relativas y pinzas absolutas.
- Ejecucion de 10 tareas simuladas de manipulacion con cubos (segun el dataset de entrenamiento).
- Aprendizaje por imitacion condicionado a instrucciones textuales de tarea (variantes de prompt por tarea).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking; el modelo esta especializado en control robotico.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seleccion de datos: comparar este checkpoint (curado por demo score) con los otros siete experimentos v5 (Random-50/100/500/1000/1500, Elo-1500, Score-1500, DemInf-1500) para medir el impacto de la estrategia de curacion en el exito de la politica.
- Reproduccion de experimentos de imitation learning: sirve como punto de partida para reanudar o extender el entrenamiento hasta los 30.000 pasos con la misma receta y presupuesto.
- Baseline de manipulacion bimanual simulada: util para contrastar nuevas politicas en el mismo entorno YAM con 10 tareas de cubos.
- Estudio de escalado de datos por tarea: al fijar 1.500 demostraciones por tarea, permite analizar el rendimiento con un presupuesto homogeneo frente a variantes con 50, 100, 500 o 1.000.
- Analisis de perdida y convergencia: la perdida de 0,020 en el paso 23.500 permite estudiar la dinamica de entrenamiento de π₀.₅ con fine-tune completo en 8×H100.
- Prototipado de pipelines de evaluacion en robotica: integrarlo en `RoboEval-telearms` (rama `PI05_training`) para validar infraestructura de evaluacion antes de desplegar politicas en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo aun no se ha evaluado en simulacion. El unico dato de rendimiento reportado es la perdida de entrenamiento reciente: 0,020 (paso 23.500, 12,03 millones de muestras vistas).

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parametros en bf16, el peso ocupa aproximadamente 8,3 GB; sumando activaciones y buffers de vision, se estiman en torno a 10-14 GB en bf16 (estimacion propia, no confirmada por el autor).
- GPU recomendadas: el entrenamiento se realizo en 8×H100; para inferencia basta una GPU con al menos 16 GB, como A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 4080/3090 (16-24 GB) con bf16; en GPUs de 8-12 GB requeriria cuantizacion, no documentada.
- Opciones de despliegue: la libreria indicada es LeRobot 0.6.1 (con el parche del repositorio `tools/install_lerobot_patch.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Evaluacion | Licencia |
|---|---|---|---|---|---|
| `helen9975/pi05_telearms_v5_exp_score_1500` (este) | 4,14 mil millones | no disponible | 15.000 demos (1.500/tarea por score) | no evaluado en simulacion | no disponible |
| `helen9975/pi05_telearms_v5_exp_random_1500` | no disponible | no disponible | 1.500 demos/tarea aleatorias | no disponible | no disponible |
| `helen9975/pi05_telearms_v5_exp_random_100` | no disponible | no disponible | 1.000 demos (100/tarea aleatorias), 962.999 fotogramas | no disponible | no disponible |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | preentrenamiento general de π₀.₅ | no disponible | no disponible |

Los tres primeros pertenecen a la misma familia experimental v5 y comparten receta y presupuesto de 15,36 millones de muestras, lo que los hace directamente comparables entre si.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 23.500 de 30.000; el entrenamiento seguia en ejecucion y el modelo no esta finalizado.
- Sin evaluacion: no se ha evaluado en simulacion ni en robot real, por lo que no hay evidencia de rendimiento de la politica.
- Sin validacion: no se reservaron episodios, de modo que no existe perdida de validacion y no se puede medir sobreajuste.
- Dominio muy restringido: solo 10 tareas simuladas de cubos con un robot YAM bimanual; no generaliza fuera de ese entorno.
- Sin aleatorizacion de dominio: la politica puede ser fragil ante variaciones visuales o fisicas no vistas.
- Licencia no disponible: no hay autorizacion explicita para uso comercial; conviene tratar el modelo como no licenciado hasta contactar con el autor.
- Riesgo de alucinacion: en un modelo de accion se traduce en predicciones de movimiento incorrectas o inseguras; no debe usarse en robotica real sin validacion exhaustiva.
- Artefacto de investigacion con 0 descargas y 0 likes: sin comunidad que lo respalde ni soporte documentado.
- Idiomas y contexto no documentados: no se puede asumir comportamiento multilingue ni una ventana de contexto concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v5_exp_score_1500
- Dataset de entrenamiento: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-score-1500
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Experimento hermano (random 1500): https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_1500
- Experimento hermano (random 100): https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_100
- Codigo de entrenamiento: repositorio `helen9975/RoboEval-telearms`, rama `PI05_training` (commit `9dc9e9f`)
- LeRobot 0.6.1: commit `e40b58a8` con el parche `tools/install_lerobot_patch.py`
