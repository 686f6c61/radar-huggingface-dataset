# padiredd/dp-cupbasket-abl-both

## Resumen

`dp-cupbasket-abl-both` es una política de difusión (diffusion policy) para robótica bimanual desarrollada por el usuario padiredd, entrenada con el framework LeRobot (en un fork propio de ROBOTIS para el robot bimanual FFW SG2). El modelo resuelve una tarea concreta de manipulación: coger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta. No es un modelo de lenguaje: es una política visuomotora que mapea observaciones (tres cámaras y estado articular) a acciones de control a 15 Hz.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible, un checkpoint intermedio de un estudio de ablación sobre aleatorización visual y física en la recogida de datos de simulación. Con 287,5 millones de parámetros, arquitectura de difusión DDPM con encoder ResNet18 por cámara y entrenamiento sobre 2.000 demostraciones simuladas, sirve como referencia para quien investigue robustez de políticas de imitación ante variaciones de dominio, no como modelo de propósito general.

El repositorio incluye el checkpoint final (paso 100.000) en la raíz y checkpoints intermedios cada 10.000 pasos (de `step-10000` a `step-90000`), lo que permite analizar la evolución del entrenamiento. La model card indica que los resultados de evaluación se añadirán cuando se ejecuten, por lo que no hay métricas de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 por camara y cabeza de accion condicionada por estado |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; `n_obs_steps` = 1, horizonte de prediccion 64 pasos, 32 ejecutados |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con una cadena de texto en ingles) |
| Licencia | other (licencia personalizada, sin terminos detallados en la informacion disponible) |
| Formato de pesos | safetensors (compatible con `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

Se trata de una política de difusión condicionada por observaciones: en cada paso recibe tres imágenes de 240x240 (camara frontal y dos camaras de muneca calibradas) mas un vector de estado articular de 22 dimensiones, y genera por difusion un bloque de 16 objetivos articulares a 15 Hz. El proceso de difusion usa DDPM con 100 pasos de ruido, horizonte de prediccion de 64 pasos del que se ejecutan 32, y un unico paso de observacion (`n_obs_steps` = 1). Cada camara tiene su propio encoder ResNet18. El entrenamiento uso Adam con tasa 1e-4, scheduler coseno, batch de 32 y 100.000 pasos, con semilla 1000, sobre una unica RTX 4090 de 24 GB.

Los datos provienen del conjunto `padiredd/Ablation_Cup_both`: 2.000 demostraciones simuladas exitosas generadas con el programa `cup_handover_v6.py` en Isaac Lab, con semillas desde 60001 y cortadas exactamente en 2.000 exitos por orden de particion. Este checkpoint corresponde a la condicion de ablacion con aleatorizacion visual y fisica simultaneas (los mismos sorteos por episodio que los conjuntos visual y fisico por separado). El muestreo de fotogramas es uniforme sobre todos los frames (EpisodeAwareSampler de LeRobot). Se aplica aumento de imagen agresivo en orden aleatorio, hasta 5 de entre brillo (0,6-1,4), contraste (0,6-1,4), saturacion (0,3-1,7), tono (+-0,1), nitidez (0,3-2,0), afin (+-10 grados / 10 % / 0,9-1,1), perspectiva (0,2), desenfoque, borrado aleatorio y escala de grises. No se anadio ruido al estado. La receta es identica a la de las politicas de ablacion de `dp-blockpick-cap2k-*-dr`, lo que permite comparaciones controladas.

## Capacidades

- Generacion de trayectorias de accion bimanuales de 16 articulaciones a 15 Hz para la tarea de transferencia de un vaso a una cesta.
- Percepcion visual multimodal con tres camaras simultaneas (frontal y dos de muneca) a 240x240.
- Condicionamiento por estado articular de 22 dimensiones.
- Robustez inducida por entrenamiento: aleatorizacion visual y fisica en los datos de demostracion, mas aumento de imagen agresivo en entrenamiento.
- Checkpoints intermedios cada 10.000 pasos para analisis de curvas de aprendizaje.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo de razonamiento explicito, vision general, audio ni otras capacidades fuera del control visuomotor.

## Casos de uso

- Investigacion en aprendizaje por imitacion: usar el checkpoint como linea base reproducible para estudiar el efecto de la aleatorizacion visual y fisica en politicas de difusion, comparandolo con `dp-cupbasket-abl-none` y las variantes visual y fisica del mismo estudio.
- Estudio de curvas de entrenamiento: los checkpoints `step-10000` a `step-90000` permiten analizar la evolucion de la politica y detectar sobreajuste o estancamiento sin reentrenar.
- Transferencia sim-a-real: el modelo se entreno en Isaac Lab y existe una variante `dp-cupbasket-real` en el mismo perfil de autor, lo que facilita experimentos de ajuste fino o evaluacion en el robot FFW SG2 real.
- Validacion de pipelines LeRobot: sirve como ejemplo funcional de `DiffusionPolicy.from_pretrained` con arquitectura multi-camara y estado articular, util para verificar integraciones del fork de ROBOTIS.
- Benchmark interno de manipulacion bimanual: la tarea de transferencia de mano a mano con deposito en cesta es un caso de coordinacion bimanual que puede usarse como prueba estandar en el laboratorio.
- Docencia y divulgacion: por su tamano moderado (287 M de parametros) y su entrenamiento en una sola GPU consumer, es un caso asequible para explicar politicas de difusion en robotica.
- Ablacion controlada de aumento de datos: la receta fija y documentada permite aislar el impacto del aumento de imagen frente a otras variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se anadiran cuando se ejecuten.

## Requisitos de hardware

- Entrenamiento documentado: una RTX 4090 de 24 GB, compartida con como maximo otra ejecucion de ablacion.
- VRAM de inferencia: no disponible de forma explicita; con 287,5 M de parametros en safetensors de precision original, el peso de los pesos ronda 1,1-1,2 GB en fp32, y el consumo real dependera de los tres encoders ResNet18 y del bucle de difusion de 100 pasos.
- GPU recomendadas: RTX 4090 (la usada en entrenamiento); cualquier GPU consumer con 8 GB o mas deberia ser suficiente para inferencia, aunque no se ha verificado en la informacion disponible.
- Cabe en GPU consumer: si, previsiblemente en gamas medias y altas; sin datos de latencia medidos.
- Opciones de despliegue: carga via LeRobot (`DiffusionPolicy.from_pretrained`) en el fork de ROBOTIS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control de la tarea es de 15 Hz y la difusion usa 100 pasos DDPM, lo que condiciona el coste por inferencia, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `padiredd/dp-cupbasket-abl-both` | 287,5 M | Transferencia bimanual de vaso a cesta, FFW SG2 | 2.000 demos sim, aleatorizacion visual + fisica | other | Hugging Face |
| `padiredd/dp-cupbasket-abl-none` | ~0,3 B (segun ficha de HF) | Misma tarea, sin aleatorizacion | 2.000 demos sim | other | Hugging Face |
| `padiredd/dp-cupbasket-real` | no disponible | Misma tarea en robot real | no disponible | other | Hugging Face |

Las tres variantes comparten autor, tarea y marco (LeRobot + diffusion policy), por lo que la comparacion directa es valida para estudiar el efecto de la aleatorizacion y de la brecha sim-a-real. No se dispone de datos de rendimiento comparativo ni de modelos de terceros claramente equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: la politica solo ejecuta la tarea de transferencia de un vaso azul a una cesta con el robot FFW SG2; no generaliza a otras tareas, objetos o morfologias sin reentrenamiento.
- Ausencia de evaluacion publicada: no hay metricas de exito ni de robustez, por lo que no puede afirmarse su rendimiento real ni en simulacion ni en el robot fisico.
- Entrenada exclusivamente en simulacion (Isaac Lab): existe brecha sim-a-real no cuantificada; la variante `dp-cupbasket-real` sugiere que el autor trabaja en cerrarla, pero no se aportan resultados.
- Dependencia de calibracion: requiere tres camaras (frontal y dos de muneca) calibradas y un estado articular de 22 dimensiones coherente con el entorno de entrenamiento; desviaciones en la configuracion degradaran la politica.
- Licencia `other` sin terminos detallados en la informacion disponible: es imprescindible revisar el texto completo de la licencia en el repositorio antes de cualquier uso comercial o redistribucion.
- Riesgo de sobreajuste al conjunto de 2.000 demostraciones y a las semillas concretas del estudio de ablacion; el corte exacto en 2.000 exitos por orden de particion puede introducir sesgo de seleccion.
- Sin soporte de lenguaje natural mas alla de la cadena de tarea fija; no debe tratarse como un modelo conversacional ni como agente general.
- Fecha de creacion futura en los metadatos (2026-11-07) y cero descargas: artefacto de investigacion reciente y sin validacion externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-abl-both
- Variante sin aleatorizacion: https://huggingface.co/padiredd/dp-cupbasket-abl-none
- Variante en robot real: https://huggingface.co/padiredd/dp-cupbasket-real
- Conjunto de datos citado en la model card: `padiredd/Ablation_Cup_both` (referenciado, sin URL directa en la informacion disponible)
- LeRobot (framework de entrenamiento): no disponible en la informacion proporcionada
- Isaac Lab (entorno de simulacion): no disponible en la informacion proporcionada
