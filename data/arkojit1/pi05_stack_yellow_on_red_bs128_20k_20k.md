# arkojit1/pi05_stack_yellow_on_red_bs128_20k_20k

## Resumen

π₀.₅ (`pi05`) es una politica robotica vision-language-action (VLA) desarrollada originalmente por Physical Intelligence. Este repositorio concreto, publicado por el usuario `arkojit1`, contiene un fine-tuning del checkpoint base `lerobot/pi05_base` sobre el conjunto de datos `Ameyapores/haply_stack_yellow_red`, orientado a una unica tarea de manipulacion: apilar un bloque amarillo sobre uno rojo con un brazo Franka.

El modelo parte de una arquitectura que combina un codificador visual SigLIP y un backbone de lenguaje Gemma-2B con un "action expert" entrenable que genera acciones mediante flow matching. En este fine-tuning solo se entrena dicho action expert (`train_expert_only=true`), manteniendo congelados SigLIP y Gemma-2B. El resultado son 3.616.757.520 parametros totales y un repositorio de 7,5 GB en formato safetensors.

Es relevante como ejemplo de adaptacion de un modelo VLA de proposito general a una tarea especifica con muy pocos datos (64 episodios de teleoperacion), y sirve para evaluar el flujo de trabajo de LeRobot 0.4.4 con π₀.₅, aunque su utilidad practica queda limitada a la tarea exacta de apilado para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): SigLIP + Gemma-2B + action expert con flow matching |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; instrucciones en ingles en el dataset) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de π₀.₅: un codificador de vision SigLIP y un modelo de lenguaje Gemma-2B que procesan las observaciones multimodales (tres camaras mas estado del robot) y un "action expert" que genera secuencias de acciones mediante flow matching. En este fine-tuning solo se actualiza el action expert; SigLIP y Gemma-2B permanecen congelados. Las tres entradas de imagen (`observation.images.wrist`, `observation.images.scene0`, `observation.images.scene1`) se asignan a los slots `base_0_rgb`, `left_wrist_0_rgb` y `right_wrist_0_rgb` respectivamente.

El entrenamiento se realizo con LeRobot 0.4.4 sobre 64 episodios de Franka teleoperados con un dispositivo Haply (57 para entrenamiento, 7 reservados para evaluacion), con una unica tarea: "Stack the yellow block on the red block". Se uso estado de 4 dimensiones y accion de 4 dimensiones (delta del efector final). La configuracion fue: batch global 128 en 8 GPU MI300X, AdamW con LR pico 2.5e-5 y betas (0.9, 0.95), weight decay 0.01, grad clip 1.0, schedule coseno con warmup de 666 pasos hasta 20.000 pasos, precision bf16, normalizacion por cuantiles (q01–q99) para estado y accion, sin aumento de datos, y `chunk_size`/`n_action_steps` de 50/50. El checkpoint final corresponde al paso 20.000 (84,0 epocas), con perdida de entrenamiento 0.072 y perdida de evaluacion 0.1959; el mejor eval se registro en el paso 2.500 (0.1568), y a partir de ahi la perdida de evaluacion subio hasta ~0.19–0.20 por sobreajuste.

## Capacidades

- Generacion de acciones de manipulacion robotica de 4 dimensiones (delta del efector final) condicionadas por imagenes y estado.
- Percepcion visual multimodal a partir de tres camaras (muneca, escena 0 y escena 1).
- Ejecucion de una tarea especifica de apilado de bloques ("Stack the yellow block on the red block").
- Generacion de chunks de accion de 50 pasos (`chunk_size=50`, `n_action_steps=50`).
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- No se documentan capacidades multilingues, de codigo, matematicas, audio ni thinking mode.
- Capacidad de generalizacion limitada a la distribucion del dataset de entrenamiento.

## Casos de uso

- Apilado de bloques en entorno Franka: el modelo recibe las tres imagenes y el estado de 4 dimensiones y emite deltas del efector final para colocar el bloque amarillo sobre el rojo; es su unico proposito entrenado.
- Banco de pruebas de LeRobot 0.4.4: sirve para validar el pipeline de carga e inferencia de π₀.₅ con el fork de `transformers` requerido (`fix/lerobot_openpi`).
- Referencia para fine-tuning con `train_expert_only=true`: ilustra como adaptar `pi05_base` congelando SigLIP y Gemma-2B y entrenando solo el action expert con 64 episodios.
- Estudio de sobreajuste en VLA: el historial de eval (mejor en el paso 2.500, empeoramiento hasta 0.1959 en el 20.000) permite analizar curvas de sobreajuste con datasets pequenos.
- Reproduccion de experimentos de teleoperacion con Haply: el dataset asociado documenta la captura con dicho dispositivo, util para comparar configuraciones de recogida de datos.
- Demostracion educativa de politicas VLA: permite mostrar el flujo completo desde observaciones visuales hasta acciones continuas en un robot real o simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de la funcion de perdida del entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (paso 20.000) | 0.072 |
| Perdida de evaluacion (paso 20.000) | 0.1959 |
| Mejor perdida de evaluacion | 0.1568 (paso 2.500, 10,5 epocas) |
| Epocas completadas | 84,0 |
| Pasos por epoca | 238,1 |

El autor advierte explicitamente que la perdida de evaluacion es una metrica del objetivo de entrenamiento (flow matching) sobre 7 episodios reservados y no una tasa de exito en la tarea; diferencias de pocas milesimas estan dentro del ruido y no es comparable con modelos entrenados sobre la revision de 40 episodios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.616.757.520 parametros en bf16/fp16 el peso ronda los 7,2 GB, por lo que se necesitan al menos ~8-10 GB de VRAM solo para los pesos, mas memoria para activaciones y buffers de vision.
- GPU recomendadas: el entrenamiento se realizo en 8 x AMD MI300X; para inferencia se requiere una GPU con suficiente memoria (no se especifica un minimo oficial).
- Cabe en GPU de consumo: probablemente en tarjetas con 12-16 GB o mas (por ejemplo RTX 4090 de 24 GB), aunque no hay confirmacion oficial.
- Opciones de despliegue: la unica via documentada es LeRobot 0.4.4 con el fork de `transformers` de Hugging Face (rama `fix/lerobot_openpi`) mediante `PI05Policy.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_stack_yellow_on_red_bs128_20k_20k | 3.616.757.520 | no disponible | Apilado de bloques Franka | no disponible | HuggingFace (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista (base) | no disponible | HuggingFace |
| Otros fine-tunings de pi05 sobre datasets de Franka | no disponible | no disponible | Manipulacion especifica | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sobreajuste: la perdida de evaluacion empeoro desde 0.1568 (paso 2.500) hasta 0.1959 (paso 20.000), por lo que el checkpoint final no es el mejor de la ejecucion.
- Dataset muy reducido: solo 64 episodios de una unica tarea, lo que limita la generalizacion a variaciones de posicion, iluminacion u objetos.
- Dependencia estricta del orden de camaras: es obligatorio pasar `observation.images.wrist`, `observation.images.scene0` y `observation.images.scene1` en ese orden; un orden incorrecto degrada la politica.
- Requiere LeRobot 0.4.4 y un fork especifico de `transformers` (rama `fix/lerobot_openpi`), lo que complica el despliegue en entornos estandar.
- La perdida de evaluacion no equivale a tasa de exito; no se ha medido el rendimiento real en la tarea.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los terminos del modelo base `lerobot/pi05_base`.
- Sin informacion sobre sesgos, alucinacion o limitaciones de idioma; al ser un modelo de robotica, estos conceptos no aplican de la misma forma que en LLM, pero persiste el riesgo de acciones erroneas en el robot.
- Sin cuantizaciones publicadas ni soporte documentado para motores de inferencia alternativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_bs128_20k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ameyapores/haply_stack_yellow_red
- LeRobot: https://github.com/huggingface/lerobot
- Repositorio de referencia de pi05 en LeRobot: no disponible
