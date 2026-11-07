# helen9975/pi05_telearms_v5_exp_random_1500

## Resumen

`pi05_telearms_v5_exp_random_1500` es un checkpoint de ajuste fino completo (full fine-tune) del modelo de robotica π₀.₅ (`lerobot/pi05_base`) desarrollado por el usuario helen9975. Se trata de una politica visomotora (vision-language-action, VLA) entrenada para control bimanual de un robot YAM en tareas de manipulacion simuladas, concretamente en el entorno de cubos definido por el dataset `mliu48/telearms-yam-cube-v5-exp-random-1500`. El modelo resuelve el problema de mapear observaciones visuales de tres camaras y el estado del robot a secuencias de acciones motoras de 50 pasos.

El checkpoint forma parte de una familia de ocho experimentos (v5) entrenados con la misma receta y el mismo presupuesto de muestras (15,36 M), disenados para comparar estrategias de seleccion de datos: subconjuntos aleatorios anidados (Random-50/100/500/1000/1500), seleccion por ELO, por score y por influencia de demostracion. Este run concreto usa 1500 demostraciones por tarea, seleccionadas al azar entre las exitosas que tienen score y ELO de jugador.

Es relevante ahora porque documenta una ablacion controlada sobre seleccion de datos en entrenamiento VLA a gran escala, un area con poca evidencia empirica publica. El modelo tiene 4.143.404.816 parametros (4,14 B), un repo de 18,7 GB y esta publicado bajo la libreria LeRobot 0.6.1. No cuenta con evaluacion en simulacion todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π₀.₅, transformer con experto de accion (LLM + vision + action expert) |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16; el repo contiene safetensors) |
| Idiomas soportados | no disponible (modelo de robotica; prompts de tarea en el dataset) |
| Licencia | no disponible |
| Formato de pesos | safetensors (directorio `pretrained_model/`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de π₀.₅ (`lerobot/pi05_base`), una politica VLA que combina un backbone de lenguaje y vision con un experto de accion. El ajuste cubre los tres componentes (LLM, vision y action expert) en bf16 con gradient checkpointing. La salida son chunks de 50 acciones, con acciones relativas y pinzas absolutas. Se usan variantes de prompt por tarea definidas en `meta/task_prompt_variants.json`.

El entrenamiento emplea el dataset `mliu48/telearms-yam-cube-v5-exp-random-1500` (revision `e13d8220`): 15.000 demostraciones simuladas bimanuales de 10 tareas, 14.340.545 frames a 30 Hz, con tres camaras de 224×224 y sin domain randomization. La seleccion toma 1500 demostraciones por tarea al azar entre las exitosas con score y ELO; los conjuntos Random son anidados (Random-50 ⊂ Random-100 ⊂ ... ⊂ Random-1500). No se reservaron episodios, por lo que no hay validation loss.

La receta: 8 × H100 en un nodo, batch 64 por GPU (global 512), 30.000 pasos = 15,36 M muestras (este checkpoint ha visto las 15,36 M). Optimizador AdamW (β = 0,9/0,95, weight decay 0,01), LR pico 1e-4 (2,5e-5 × sqrt(512/32)), 1.000 pasos de warmup y decaimiento coseno hasta 1e-5 en 30.000 pasos. La loss de entrenamiento reciente es 0,027. Codigo en `helen9975/RoboEval-telearms` rama `PI05_training` @ `9dc9e9f` con cambios locales (guardas NaN, correccion de logging PyAV para velocidad de carga, minimo de episodios por tarea configurable), LeRobot 0.6.1 @ `e40b58a8` con el parche del repo (`tools/install_lerobot_patch.py`).

## Capacidades

- Control visomotor bimanual: genera secuencias de acciones de 50 pasos para un robot YAM a partir de observaciones de tres camaras de 224×224.
- Manipulacion de cubos en simulacion: entrenado sobre 10 tareas del entorno `telearms-yam-cube-v5`.
- Condicionamiento por prompt de tarea: acepta variantes de prompt por tarea para dirigir el comportamiento.
- Acciones relativas con pinzas absolutas: formato de accion adecuado para control continuo de efector final.
- Integracion con LeRobot: cargable mediante la libreria `lerobot` (pipeline `robotics`).
- No dispone de capacidades de texto general, codigo, matematicas, tool calling, agentes ni vision generica: es una politica de accion, no un LLM conversacional.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seleccion de datos para VLA: este checkpoint es una de las ocho condiciones de una ablacion controlada; se usa para comparar el efecto de subconjuntos aleatorios anidados frente a seleccion por ELO, score o influencia de demostracion con el mismo presupuesto de 15,36 M muestras.
- Reproduccion de experimentos de robotica simulada: sirve como referencia reproducible de un full fine-tune de π₀.₅ con receta documentada (AdamW, LR, batch, pasos) para validar pipelines de entrenamiento LeRobot 0.6.1.
- Punto de partida para ajuste en tareas de manipulacion bimanual: al ser un fine-tune completo sobre YAM, puede reutilizarse como inicializacion para nuevas tareas del mismo robot o entorno.
- Evaluacion de politicas en simulador: pensado para desplegarse en el simulador de `RoboEval-telearms` y medir tasa de exito por tarea (aunque el autor indica que aun no se ha evaluado).
- Estudio de escalado de datos por tarea: con 1500 demostraciones por tarea y 10 tareas, permite analizar la relacion entre volumen de datos y loss de entrenamiento (0,027 reciente) en tareas de pick-and-place.
- Docencia y divulgacion tecnica: ejemplo concreto y trazable de arquitectura VLA, formato de acciones por chunks y configuracion de entrenamiento multi-GPU para cursos de robotica e IA.
- Baseline interno en pipelines de robotica: util como referencia de perdida de entrenamiento frente a los otros siete runs v5 antes de lanzar evaluaciones costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "not yet evaluated in simulation". El unico dato de rendimiento reportado es la loss de entrenamiento reciente de 0,027.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 B parametros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. A ello hay que sumar el estado del experto de accion, buffers de imagenes (tres camaras de 224×224) y overhead del runtime.
- GPU recomendadas: el entrenamiento se realizo en 8 × H100. Para inferencia, una GPU con 16-24 GB (A100 40 GB, L40S, RTX 4090) es un punto de partida razonable segun el calculo de pesos, aunque no hay cifras publicadas.
- Cabe en GPU de consumo: probablemente si en RTX 4090 (24 GB) en bf16, sujeto a validacion empirica; no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 (libreria nativa del modelo) y el codigo de `RoboEval-telearms`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a politicas VLA de accion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05_telearms_v5_exp_random_1500` (este) | 4,14 B | no disponible | 15.000 demos, 10 tareas, 15,36 M muestras | no disponible | Hugging Face, 5 descargas |
| `helen9975/pi05_telearms_v5_mixed` | no disponible | no disponible | 60.093 demos, 7 tareas, 77,4 M frames; entrenamiento en curso | no disponible | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | modelo base π₀.₅ preentrenado | no disponible | Hugging Face (LeRobot) |

La comparacion mas directa es con los otros runs v5 del mismo autor (Random-50/100/500/1000, Elo-1500, Score-1500, DemInf-1500), que comparten receta y presupuesto de muestras; sus fichas y resultados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sin evaluacion: el autor declara que el modelo no se ha evaluado en simulacion; no hay tasa de exito ni metricas de tarea.
- Sin conjunto de validacion: no se reservaron episodios, por lo que no existe validation loss y la loss de entrenamiento (0,027) no garantiza generalizacion.
- Dominio muy restringido: solo 10 tareas de manipulacion de cubos con robot YAM bimanual en simulacion; no transfiere a otros robots, entornos o tareas sin reentrenamiento.
- Sin domain randomization: el dataset no aplica aleatorizacion de dominio, lo que limita la robustez ante variaciones visuales o fisicas.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: al ser una politica de accion, el soporte multilingue no aplica ni esta documentado.
- Riesgo de sobreajuste al subconjunto: al usar 1500 demos por tarea seleccionadas al azar, el rendimiento puede variar respecto a otros subconjuntos; el diseno anidado permite comparar, pero no sustituye una validacion.
- Procedencia y mantenimiento: autor individual, 5 descargas y 0 likes; sin garantias de soporte, versionado estable ni actualizaciones.
- Dependencia de codigo local: el entrenamiento usa cambios locales sobre `RoboEval-telearms` y un parche de LeRobot; la reproducibilidad exacta requiere esos artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_1500
- Dataset de entrenamiento: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-1500
- Modelo base π₀.₅: https://huggingface.co/lerobot/pi05_base
- Run hermano (mixed): https://huggingface.co/helen9975/pi05_telearms_v5_mixed
- Codigo de entrenamiento: `helen9975/RoboEval-telearms`, rama `PI05_training` @ `9dc9e9f` (sin URL publica en la informacion disponible)
- LeRobot 0.6.1 @ `e40b58a8` (sin URL publica en la informacion disponible)
