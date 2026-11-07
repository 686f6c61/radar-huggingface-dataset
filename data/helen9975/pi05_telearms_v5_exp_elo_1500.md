# helen9975/pi05_telearms_v5_exp_elo_1500

## Resumen

`pi05_telearms_v5_exp_elo_1500` es un checkpoint intermedio de un fine-tune completo del modelo de robotica π₀.₅ (`lerobot/pi05_base`) sobre el dataset `mliu48/telearms-yam-cube-v5-exp-elo-1500`. Lo publica el usuario `helen9975` dentro de una familia de ocho experimentos v5 (Random-50/100/500/1000/1500, Elo-1500, Score-1500, DemInf-1500) entrenados con la misma receta y el mismo presupuesto de muestras para poder compararlos entre si. El checkpoint corresponde al paso 28.500 de 30.000: el entrenamiento seguia en marcha en el momento de la publicacion.

El modelo resuelve el problema de aprendizaje por imitacion en manipulacion bimanual simulada: 15.000 demostraciones de 10 tareas sobre el robot YAM, 10.273.656 fotogramas a 30 Hz y tres camaras de 224×224, sin domain randomization. La seleccion de datos de este run concreto usa 1.500 demostraciones por tarea extraidas del tercio superior por ELO del jugador en el momento de la grabacion, lo que lo convierte en un punto de comparacion para estudiar el efecto de la curacion de datos por calidad frente a seleccion aleatoria.

Con 4.143.404.816 parametros y un repositorio de 9,4 GB en safetensors, es un modelo de investigacion en robotica, no un modelo de lenguaje de proposito general. Su relevancia es metodologica: forma parte de un barrido controlado de estrategias de seleccion de datos para políticas vision-language-action (VLA), y su licencia y condiciones de uso no estan declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (vision-language-action, fine-tune completo de `lerobot/pi05_base`); detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (directorio `pretrained_model/` del checkpoint) |
| Biblioteca | LeRobot 0.6.1 (commit `e40b58a8`) con parche del repositorio |
| Entradas | 3 camaras a 224×224, estado del robot, prompt de tarea |
| Salidas | chunks de 50 acciones, acciones relativas con pinzas absolutas |
| Frecuencia de datos | 30 Hz |
| Precision de entrenamiento | bf16 con gradient checkpointing |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (LLM, torre de vision y experto de accion) de π₀.₅, la VLA de Physical Intelligence distribuida como `lerobot/pi05_base`. La informacion disponible no detalla la composicion interna de la arquitectura (numero de capas, atencion, tokenizacion de acciones), solo que se entrenan conjuntamente los tres componentes y que la cabeza de accion produce chunks de 50 pasos con acciones relativas y valores absolutos de pinza.

El entrenamiento uso 8 GPU H100 en un nodo, batch de 64 por GPU (global 512), AdamW con β = (0,9; 0,95) y weight decay 0,01, LR pico de 1e-4 (2,5e-5 × sqrt(512/32)), 1.000 pasos de warmup y decaimiento coseno hasta 1e-5 en 30.000 pasos, equivalentes a 15,36 millones de muestras; este checkpoint ha visto 14,59 millones. El dataset contiene 15.000 demostraciones bimanuales del robot YAM en 10 tareas (10.273.656 fotogramas a 30 Hz, tres camaras de 224×224, sin domain randomization), con 1.500 demostraciones por tarea seleccionadas del tercio superior por ELO del jugador, restringidas a demostraciones exitosas con demo score y ELO de jugador registrados. Se aplicaron variantes de prompt por tarea (`meta/task_prompt_variants.json`) y no se reservaron episodios de validacion, por lo que no existe perdida de validacion. La perdida de entrenamiento reciente reportada es 0,024. El codigo parte de `helen9975/RoboEval-telearms`, rama `PI05_training` en `9dc9e9f`, con cambios locales (protecciones contra NaN, correccion de logging PyAV para acelerar la carga de datos y minimo configurable de episodios por tarea).

## Capacidades

- Control de robot bimanual por imitacion: genera trayectorias de accion a partir de observaciones visuales de tres camaras y del estado del robot.
- Ejecucion de 10 tareas simuladas de manipulacion sobre YAM, condicionadas por prompt de tarea (con variantes de prompt por tarea).
- Prediccion de chunks de accion de 50 pasos con acciones relativas y pinzas absolutas, adecuada para control a 30 Hz.
- Fusión vision-lenguaje-accion: el modelo hereda la torre de vision y el LLM de π₀.₅, aunque la informacion disponible no detalla capacidades de razonamiento linguistico o tool calling.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision general, audio): no disponibles; la vision esta integrada exclusivamente como entrada de politica.

## Casos de uso

- Investigacion sobre curacion de datos en VLA: comparar este checkpoint con los otros siete runs v5 (Random-50/100/500/1000/1500, Score-1500, DemInf-1500) para medir el efecto de seleccionar demostraciones por ELO alto frente a seleccion aleatoria, con el mismo presupuesto de 15,36 millones de muestras.
- Reproduccion de experimentos de aprendizaje por imitacion: el checkpoint permite reanudar o auditar un entrenamiento documentado paso a paso (receta, hiperparametros, commits de codigo y dataset con revision fija `940f41ef`).
- Punto de partida para fine-tune en tareas bimanuales propias: al ser un fine-tune completo de π₀.₅ sobre YAM, sirve como inicializacion para nuevos datasets de manipulacion con el mismo formato LeRobot.
- Evaluacion de politicas en simulacion: aunque el autor indica que aun no se ha evaluado en simulacion, el checkpoint esta pensado para integrarse en el pipeline `RoboEval-telearms` y medir tasas de exito por tarea.
- Estudio de estabilidad de entrenamiento: los cambios locales del codigo (protecciones contra NaN, correccion de logging PyAV) hacen de este checkpoint un caso util para analizar la robustez del fine-tune completo de π₀.₅ en bf16 con gradient checkpointing.
- Analisis de seleccion por ELO como proxy de calidad: permite estudiar si las demostraciones grabadas por jugadores con mayor ELO producen politicas mas robustas en las 10 tareas del dataset, aislando la variable de seleccion del resto de la receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint no ha sido evaluado en simulacion. El unico dato cuantitativo de rendimiento es la perdida de entrenamiento reciente (0,024), que no es comparable con metricas de exito en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 4.143.404.816 parametros, en bf16 los pesos ocupan aproximadamente 8,3 GB, a los que hay que sumar activaciones y buffers de las tres camaras de 224×224.
- GPU de entrenamiento documentadas: 8 × H100 en un nodo, batch 64 por GPU, bf16 y gradient checkpointing.
- GPU recomendadas para inferencia: no disponibles; por tamano de pesos, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) es el rango plausible, pero no esta confirmado en la informacion.
- Cabe en GPU de consumo: no confirmado; los pesos en bf16 caben en 16 GB, pero el pico real depende de la implementacion de inferencia de π₀.₅ en LeRobot.
- Opciones de despliegue: LeRobot 0.6.1 con el parche del repositorio (`tools/install_lerobot_patch.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una politica VLA de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset / seleccion | Estado | Licencia |
|---|---|---|---|---|
| `pi05_telearms_v5_exp_elo_1500` (este) | 4.143.404.816 | 15.000 demos, 10 tareas, top tercio por ELO, 1.500 por tarea | Checkpoint paso 28.500/30.000, sin evaluar | no disponible |
| `helen9975/pi05_telearms_v5_exp_random_1500` | no disponible en la busqueda | Misma receta, seleccion aleatoria de 1.500 por tarea | Run hermano del mismo barrido | no disponible |
| `helen9975/pi05_telearms_v5_mixed` | no disponible en la busqueda | 60.093 demos de 7 tareas, 77,4M fotogramas, camaras 16:9 letterboxed a 224×224 | Entrenamiento en curso | no disponible |
| `lerobot/pi05_base` | no disponible en la informacion | Modelo base π₀.₅ sin fine-tune sobre este dataset | Base publica de LeRobot | no disponible |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 28.500 de 30.000; no es el modelo final del run y puede diferir del checkpoint convergido.
- Sin evaluacion: el autor declara que no se ha evaluado en simulacion, por lo que no hay evidencia publica de tasa de exito en ninguna de las 10 tareas.
- Sin conjunto de validacion: no se reservaron episodios, de modo que no existe perdida de validacion ni estimacion de generalizacion fuera de entrenamiento.
- Dominio estrecho: entrenado solo en simulacion bimanual YAM con 10 tareas y sin domain randomization; no se espera transferencia directa a robot real ni a tareas fuera del dataset.
- Sesgo de seleccion: las demostraciones provienen del tercio superior por ELO del jugador, lo que puede limitar la diversidad de estilos de ejecucion frente a los runs aleatorios del mismo barrido.
- Licencia no declarada: no hay licencia indicada en la model card ni en los metadatos de Hugging Face, por lo que el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- Idiomas no declarados: al ser una politica VLA condicionada por prompt de tarea, el soporte multilingue no esta documentado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero una politica de imitacion puede producir acciones fuera de distribucion ante observaciones no vistas.
- Dependencia de codigo: requiere LeRobot 0.6.1 con un parche concreto y una rama especifica de `RoboEval-telearms`, lo que complica la reproducibilidad a medio plazo.
- Repositorio de 9,4 GB: el despliegue exige almacenamiento y ancho de banda considerables para descargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v5_exp_elo_1500
- Dataset de entrenamiento: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-elo-1500
- Run hermano con seleccion aleatoria: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_1500
- Run hermano mixto: https://huggingface.co/helen9975/pi05_telearms_v5_mixed
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Codigo de entrenamiento: `helen9975/RoboEval-telearms`, rama `PI05_training`, commit `9dc9e9f` (no se proporciona URL directa)
- LeRobot 0.6.1, commit `e40b58a8` (no se proporciona URL directa)
