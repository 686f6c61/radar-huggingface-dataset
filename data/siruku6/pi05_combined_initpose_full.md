# siruku6/pi05_combined_initpose_full

## Resumen

pi05_combined_initpose_full es un checkpoint de pi0.5 (pi05), un modelo vision-language-action (VLA) para control robótico, publicado por el usuario siruku6. Se trata de un ajuste fino de todos los parametros de `lerobot/pi05_libero_base` (revision `a217bfd3b14673cf2ce597e69997ab21866438dd`) sobre el conjunto de datos `local/libero_combined_bowl5_initpose` (111 tareas, 21.642 episodios), dentro del ecosistema LeRobot. El repositorio contiene 4,14 mil millones de parametros, todos ellos entrenados (encoder de vision y VLM incluidos, sin congelar), y ocupa 18,7 GB en disco.

El modelo resuelve el problema de la ejecucion de politicas de manipulacion robotica condicionadas por lenguaje a partir de demostraciones (imitation learning), siguiendo el protocolo de evaluacion del benchmark LIBERO. Su relevancia no es la de un modelo de proposito general: la propia model card indica que esta linea de datos y checkpoints no fue seleccionada para uso posterior, y que se publica unicamente por transparencia y reproducibilidad de una comparacion estadistica frente a `siruku6/pi05_bowl5_full`.

El dato mas importante para un evaluador es que este checkpoint rindio peor que su alternativa entrenada con el mismo protocolo: 0,3515 de puntuacion total y 0,705 de tasa de exito frente a 0,4055 y 0,798 del modelo basado en `libero_plus_bowl5`, con una comparacion pareada de 70 victorias contra 31 (p<0,001).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5, con columna vertebral vision-lenguaje PaliGemma (Gemma) y experto de acciones; sin mas detalle en la informacion disponible |
| Parametros totales | 4,14 mil millones (todos entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (derivado de Gemma via PaliGemma), con Gemma Prohibited Use Policy aplicable |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Pipeline | robotics |
| Tamano del repositorio | 18,7 GB |
| Checkpoints incluidos | `003000` y `005500` |
| Modelo base | `lerobot/pi05_libero_base` |
| Dataset de entrenamiento | `siruku6/libero_combined_bowl5_initpose` (111 tareas, 21.642 episodios) |

## Arquitectura y entrenamiento

La arquitectura es la de pi0.5: un modelo vision-language-action que combina una columna vertebral vision-lenguaje heredada de PaliGemma (y por tanto de Gemma) con un modulo experto de acciones. La implementacion de referencia es [openpi](https://github.com/Physical-Intelligence/openpi), publicada bajo Apache License 2.0. El checkpoint se distribuye en formato LeRobot y esta pensado para inferencia y ajuste dentro de ese ecosistema.

El entrenamiento partio de `lerobot/pi05_libero_base` y actualizo los 4,14 mil millones de parametros, sin congelar ni el encoder de vision ni el VLM. Se ejecutaron 5.500 pasos con tamano de lote 64, optimizador AdamW con tasa de aprendizaje 2,5e-5, weight decay 0,01, betas (0,9, 0,95) y recorte de norma de gradiente 1,0. La augmentacion de imagenes se desactivo. La configuracion de acciones usa `chunk_size=50` y `n_action_steps=10`. Los datos proceden de LIBERO (MIT) y LIBERO-plus (MIT). La model card advierte de que `model.safetensors` es el unico fichero modificado respecto al checkpoint base y que el resto de ficheros se heredan sin cambios.

## Capacidades

- Ejecucion de tareas de manipulacion robotica condicionadas por instrucciones en lenguaje, mediante aprendizaje por imitacion.
- Generacion de secuencias de acciones en bloques (*action chunking*) de hasta 50 pasos, de los cuales se ejecutan 10 por ciclo segun la configuracion de entrenamiento.
- Percepcion visual integrada mediante el encoder de vision de la columna vertebral PaliGemma.
- Especializacion en tareas del tipo "bowl" (cuencos) con posiciones iniciales variadas, segun la composicion del dataset de ajuste.
- Soporte de tool calling / function calling: no aplica a un modelo VLA de control; no disponible.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no aplica; el modelo produce acciones motoras.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo *thinking*, vision, audio): vision como entrada; no se documenta ningun modo de razonamiento explicito.

## Casos de uso

- Reproducibilidad de experimentos: el modelo se publica precisamente para reproducir la comparacion entre `libero_plus_bowl5` y `libero_combined_bowl5_initpose` bajo un protocolo Track2 de 84 filas x 5 episodios con renderizado EGL.
- Referencia negativa en estudios de datos: sirve como punto de control de un conjunto de datos que mezcla episodios regrabados y tareas ajenas al conjunto de evaluacion, util para analizar el efecto de la composicion del dataset en el rendimiento final.
- Punto de partida para ajuste fino: al ser un checkpoint completo de 4,14 B en formato LeRobot, puede continuarse con nuevos datos, como demuestran las continuaciones `pi05_combined_ae7k` (solo experto de acciones) y `pi05_combined_cont4k` (todos los parametros).
- Evaluacion comparativa de estrategias de congelacion: la existencia de una continuacion *action-expert-only* permite medir en la practica la diferencia entre ajustar solo el experto de acciones y ajustar todos los parametros.
- Investigacion en imitacion con posiciones iniciales variables: el sufijo `initpose` del dataset apunta a entrenamiento sobre configuraciones iniciales diversas, util para estudiar robustez frente a la posicion de partida del robot en simulacion.
- Docencia y formacion en VLA: el par de checkpoints (3.000 y 5.500 pasos) permite ilustrar la evolucion de una politica de manipulacion a lo largo del entrenamiento en el entorno LIBERO.
- Validacion de pipelines de evaluacion: la publicacion incluye un protocolo con recuento de colisiones y tasa de exito, reutilizable como plantilla de evaluacion para otras politicas.

## Benchmarks y rendimiento

Evaluacion del checkpoint `005500` frente a `siruku6/pi05_bowl5_full`, entrenado con el mismo protocolo (todos los parametros, 5.500 pasos, misma semilla) sobre `libero_plus_bowl5`, en protocolo de validacion Track2 (84 filas x 5 episodios, renderizado EGL):

| Datos de entrenamiento | Puntuacion total | Tasa de exito | Tasa de colision |
|---|---|---|---|
| `libero_plus_bowl5` (`pi05_bowl5_full`) | 0,4055 | 0,798 | 0,138 |
| `libero_combined_bowl5_initpose` (este checkpoint) | 0,3515 | 0,705 | 0,171 |

Comparacion pareada sobre 420 ensayos emparejados: `pi05_bowl5_full` gano 70 ensayos y este checkpoint 31 (p<0,001). El autor senala que dos factores cambiaron simultaneamente respecto a `libero_plus_bowl5` (1.532 episodios sustituidos por episodios regrabados, y la dilucion de las 40 tareas evaluadas con un 16 % de fotogramas de 71 tareas ajenas al conjunto de evaluacion), por lo que el resultado no permite atribuir la diferencia a uno de los dos factores.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un modelo de control robotico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica, 4,14 mil millones de parametros ocupan aproximadamente 8,3 GB en bf16 y 16,6 GB en fp32, antes de activaciones y buffers de vision.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPU de centro de datos tipo A100 o H100, y previsiblemente para GPU de consumo con 24 GB o mas en bf16.
- Cabe en GPU de consumo: probable en RTX 4090 (24 GB) en bf16; no confirmado en la informacion disponible.
- Opciones de despliegue: libreria LeRobot (formato nativo del repositorio) y la implementacion de referencia openpi. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible (no aplica a un modelo de acciones).
- La evaluacion publicada se realizo con renderizado EGL, lo que implica un entorno con aceleracion grafica disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Datos de entrenamiento | Parametros | Puntuacion total | Tasa de exito | Tasa de colision | Licencia |
|---|---|---|---|---|---|---|
| `siruku6/pi05_combined_initpose_full` (este) | `libero_combined_bowl5_initpose` | 4,14 B, todos entrenados | 0,3515 | 0,705 | 0,171 | Gemma Terms of Use |
| `siruku6/pi05_bowl5_full` | `libero_plus_bowl5` | 4,14 B, todos entrenados | 0,4055 | 0,798 | 0,138 | Gemma Terms of Use |
| `siruku6/pi05_combined_ae7k` | continuacion de `005500`, solo experto de acciones, +7.000 pasos | 4,14 B (solo experto entrenado) | no disponible | no disponible | no disponible | Gemma Terms of Use |
| `siruku6/pi05_combined_cont4k` | continuacion de `005500`, todos los parametros, +4.000 pasos | 4,14 B, todos entrenados | no disponible | no disponible | no disponible | Gemma Terms of Use |
| `lerobot/pi05_libero_base` | checkpoint base pi0.5 del ecosistema LeRobot | 4,14 B | no disponible | no disponible | no disponible | Gemma Terms of Use |

Todos los modelos comparables comparten la misma base pi0.5 y el mismo tamano, por lo que la diferencia relevante es la composicion del dataset de ajuste y el alcance del reentrenamiento.

## Limitaciones y advertencias

- Rendimiento inferior al de su alternativa directa: 0,3515 frente a 0,4055 de puntuacion total, con una diferencia estadisticamente significativa (70 victorias contra 31 en 420 ensayos emparejados, p<0,001).
- El autor indica explicitamente que esta linea de dataset y checkpoints "no fue seleccionada para uso posterior" y que se publica solo por transparencia y reproducibilidad.
- La comparacion esta confundida: cambiaron a la vez la composicion de episodios y la dilucion de las tareas evaluadas con un 16 % de fotogramas ajenos, por lo que no puede aislarse la causa del peor resultado.
- Tasa de colision mas alta que la alternativa (0,171 frente a 0,138), un factor relevante en cualquier despliegue fisico.
- Especializacion muy estrecha: el ajuste se realizo sobre tareas del tipo "bowl" con posiciones iniciales variadas; no hay evidencia de generalizacion a otras tareas o morfologias de robot.
- Licencia: al ser un derivado de Gemma via PaliGemma, se rige por los Gemma Terms of Use y la Gemma Prohibited Use Policy, que deben transmitirse a cualquier receptor en caso de redistribucion. Cualquier uso comercial queda sujeto a dichos terminos.
- El modelo se distribuye "as-is", sin garantia de ningun tipo.
- Riesgo de alucinacion en el sentido de LLM: no aplica directamente, pero si existe riesgo de ejecucion de acciones incorrectas sin senal de incertidumbre documentada.
- No se documentan limitaciones de contexto, cuantizacion ni idiomas, ni sesgos conocidos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no existe validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siruku6/pi05_combined_initpose_full
- Dataset de entrenamiento: https://huggingface.co/datasets/siruku6/libero_combined_bowl5_initpose
- Modelo base: https://huggingface.co/lerobot/pi05_libero_base
- Continuacion solo experto de acciones: https://huggingface.co/siruku6/pi05_combined_ae7k
- Continuacion de todos los parametros: https://huggingface.co/siruku6/pi05_combined_cont4k
- Checkpoint de comparacion: https://huggingface.co/siruku6/pi05_bowl5_full
- Implementacion de referencia pi0.5 (openpi, Apache 2.0): https://github.com/Physical-Intelligence/openpi
- LIBERO (MIT): https://github.com/Lifelong-Robot-Learning/LIBERO
- LIBERO-plus (MIT): https://huggingface.co/datasets/Sylvest/LIBERO-plus
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados devueltos no guardaban relacion con el modelo.
