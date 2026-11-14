# Gospe1/Franka-TestTube-pi05SFT-AdaSpeTiming

## Resumen

Franka-TestTube-pi05SFT-AdaSpeTiming es un modelo de vision-lenguaje-accion (VLA) para control robotico, publicado por el usuario Gospe1 en Hugging Face. Se trata de una ablacion del trabajo AdaSpeVLA: parte del checkpoint base π0.5 SFT de OpenPI, ya entrenado para la tarea de colocar un tubo de ensayo en una gradilla con un brazo Franka, y congela todos sus pesos. Sobre esa base se anade y entrena unicamente una cabeza de temporizacion (query-interval head) que decide cuantos comandos de cada bloque de 10 acciones ejecutar antes de volver a consultar al modelo.

El modelo no genera texto ni razona en lenguaje natural: es una politica robotica que, dada una observacion multimodal (vistas de camara base y muneca mas un prompt de tarea), produce una secuencia de acciones normalizadas de 10 pasos y un intervalo de consulta en segundos. Su relevancia es metodologica: aisla el efecto de la etapa de temporizacion de AdaSpeVLA sin modificar la politica subyacente, lo que permite medir cuanto aporta el control adaptativo de la frecuencia de inferencia frente a ejecutar bloques fijos.

El repositorio ocupa 5,3 GB e incluye los pesos completos en formato OpenPI/Orbax (π0.5 en bfloat16, cabeza de timing en float32), las estadisticas de normalizacion del dataset de entrenamiento y el codigo del modelo. La licencia es Apache 2.0. No se han publicado resultados en robot real ni benchmarks estandar; la unica evaluacion disponible es una comprobacion open-loop sobre 512 frames del propio dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action π0.5 (OpenPI) con cabeza de temporizacion anadida (LayerNorm + MLP, 128 ocultas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el prompt de tarea es fijo: "Place the test tube into the test tube rack.") |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 para π0.5 y float32 para la cabeza de timing) |
| Idiomas soportados | no disponible (prompt de tarea en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenPI/Orbax (carpeta `params/`); codigo en Python/JAX (`code/pi05_timing.py`) |

## Arquitectura y entrenamiento

La politica base es π0.5 en su variante SFT publicada por OpenPI, un transformer VLA que procesa vistas de camara (base y muneca) junto con un prompt textual y emite chunks de 10 acciones a 0,1 s por comando (1,0 s de horizonte). En esta ablacion todos esos pesos permanecen congelados y bit-identicos al baseline tras el redondeo a bfloat16. La unica parte entrenada es la cabeza de temporizacion: una LayerNorm seguida de un MLP con 128 unidades ocultas que toma como entrada los estados ocultos agrupados del prefijo de π0.5 (vista base, vista muneca y prompt), el horizonte de la etiqueta en escala logaritmica y el chunk de 10 acciones muestreado.

Las etiquetas siguen la receta de la etapa de timing de AdaSpeVLA (2026-11-10): tiempo hasta el primer evento de movimiento o de pinza dentro de una ventana de 16 frames (1,5 s). Los eventos de movimiento se derivan de desplazamientos de pose medidos y los de pinza del estado comandado abierto/cerrado, con calibracion especifica para la tarea del tubo de ensayo (e_crit 9,930). El intervalo se limita al rango 0,2-1,0 s, recortando etiquetas mas largas. La perdida es el error cuadratico sobre el logaritmo del intervalo.

El entrenamiento consistio en 10.000 pasos con batch 32, AdamW con LR coseno y pico 2,5e-5, EMA 0,99 y semilla 0, usando los valores por defecto de OpenPI. El dataset es `dddddsds31341/test-tube-lerobot` en su revision `29d821a`: 99 episodios y 35.425 frames. En inferencia, `execute_steps` se calcula como `ceil(interval / 0.1)`, se extiende si el chunk predice un cambio de pinza y se limita a 10.

## Capacidades

- Generacion de acciones roboticas: produce chunks normalizados de forma (B, 10, 32), de los que se usan las primeras 7 dimensiones.
- Prediccion de intervalo de consulta: estima en segundos cuanto tiempo ejecutar el chunk antes de volver a inferir.
- Control adaptativo de frecuencia: ajusta el numero de comandos ejecutados por consulta entre 1 y 10.
- Percepcion multimodal: consume vistas de camara base y de muneca junto con el prompt de tarea.
- Ejecucion de cambios de pinza: el intervalo se extiende para garantizar que un cambio abierto/cerrado predicho se complete.
- Inferencia en JAX/Flax NNX con integracion en el paquete `adaspe` del repositorio `Jack414b/adaspevla_train`.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto.
- No se documentan capacidades multilingues; el prompt de tarea esta en ingles.

## Casos de uso

- Investigacion en control adaptativo de frecuencia: comparar esta ablacion con el baseline π0.5 SFT permite cuantificar el efecto de la temporizacion sobre latencia y suavidad de la politica, manteniendo identicas el resto de variables.
- Manipulacion pick-and-place con brazo Franka: el modelo esta entrenado especificamente para colocar un tubo de ensayo en una gradilla, por lo que sirve como referencia reproducible en laboratorio.
- Experimentos de reduccion de carga computacional en robotica: al ejecutar varios comandos por consulta se reduce el numero de inferencias del VLA, lo que puede aliviar el coste de servir π0.5 en hardware embebido.
- Reproduccion de resultados de AdaSpeVLA: el repositorio incluye pesos, estadisticas de normalizacion y codigo, lo que facilita replicar la comprobacion open-loop publicada.
- Base para transferencia a tareas similares: la cabeza de timing puede reentrenarse sobre otros datasets LeRobot manteniendo congelada la politica π0.5, aunque requiere recalibrar las etiquetas de eventos.
- Docencia y prototipado en VLA: el ejemplo de carga en Python con JAX y la separacion clara entre politica y cabeza facilitan entender el pipeline completo de un VLA con control de frecuencia.
- Validacion de infraestructura de inferencia: sirve para medir latencia real de π0.5 en un entorno controlado antes de desplegar politicas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion es una comprobacion open-loop sobre 512 frames fijos del dataset de entrenamiento (vistos durante el entrenamiento, por lo que no constituye una medida de generalizacion):

| Metrica | Valor |
|---|---|
| MAE del intervalo frente a la etiqueta | 0,142 s |
| Correlacion con la etiqueta | 0,76 |
| Media predicha / etiqueta | 0,77 s / 0,80 s |
| Proporcion <= 0,3 s, predicha / etiqueta | 4,7% / 18,4% |
| Proporcion en el tope de 1,0 s, predicha / etiqueta | 31% / 65% |

El autor senala que la cabeza esta sesgada hacia el centro del rango y que no se incluyen resultados en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 5,3 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el modelo usa JAX/Flax NNX y requiere el stack de OpenPI, lo que condiciona el hardware soportado.
- Opciones de despliegue: inferencia JAX con Flax NNX cargando `params/` mediante `openpi.models.model.restore_params`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de acciones.
- Latencia y throughput: no disponibles. La reduccion de inferencias depende del intervalo predicho, que en la comprobacion open-loop se concentra en torno a 0,77 s de media.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka-TestTube-pi05SFT-AdaSpeTiming | VLA con cabeza de timing | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| dddddsds31341/Franka-Test-Tube-pi05-step-20000 | VLA π0.5 SFT (baseline congelado) | no disponible | no disponible | no disponible | Hugging Face |
| AdaSpeVLA (repo Jack414b/adaspevla_train) | VLA con etapa B-spline y timing | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada; la unica diferencia documentada es que esta ablacion elimina la etapa B-spline de acciones y mantiene la politica base intacta.

## Limitaciones y advertencias

- No hay resultados en robot real; todas las metricas proceden de frames vistos en entrenamiento y no demuestran generalizacion.
- La cabeza de timing esta sesgada hacia el centro del rango: subestima intervalos cortos (4,7% frente a 18,4% de etiquetas <= 0,3 s) y el tope de 1,0 s (31% frente a 65%).
- El modelo esta especializado en una unica tarea y un unico entorno ("Place the test tube into the test tube rack." con brazo Franka); no se espera transferencia directa a otras tareas sin reentrenamiento o recalibracion.
- Requiere validar orden de observaciones, unidades, normalizacion y limites del espacio de trabajo antes de ejecutar en hardware, tal como advierte el autor.
- Depende del paquete `adaspe` y de OpenPI; la integracion exige mapear claves de parametros y usar JAX/Flax NNX, lo que anade complejidad de despliegue.
- No se documentan sesgos sociales ni riesgos de alucinacion en el sentido de modelos de lenguaje, pero si riesgos fisicos propios de un sistema robotico sin validacion en banco.
- La licencia Apache 2.0 permite uso comercial, pero el baseline π0.5 subyacente puede tener condiciones propias que conviene revisar por separado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso independiente ni de mantenimiento por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gospe1/Franka-TestTube-pi05SFT-AdaSpeTiming
- Baseline π0.5 SFT: https://huggingface.co/dddddsds31341/Franka-Test-Tube-pi05-step-20000
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/test-tube-lerobot
- Repositorio de codigo AdaSpeVLA: https://github.com/Jack414b/adaspevla_train
- OpenPI (framework base): no disponible en la informacion proporcionada
