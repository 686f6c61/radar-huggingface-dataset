# Dexverse-CSI/pi05-cross-dex-hand-mount-single-20k

## Resumen

pi05-cross-dex-hand-mount-single-20k es un modelo de politica visomotora (vision-language-action, VLA) derivado de la familia pi0.5 y entrenado por Dexverse-CSI sobre el conjunto de datos DexVerse de manipulacion diestra con brazo unico. No es un modelo de lenguaje: es una politica de control robotico que, a partir de imagenes de camara (una vista base y una vista de muneca) y de un vector de estado de 31 dimensiones, predice acciones motoras de 31 dimensiones. El modelo se distribuye como un checkpoint de LeRobot 0.4.4 con la clase `PI05Policy` y pesos en formato safetensors.

La particularidad de esta variante es que el estado y la accion de la muneca (dimensiones 0:9, posicion xyz mas rotacion en representacion rot6d) se han reubicado en la cara de montaje del brazo del robot, en lugar de la muneca anatomica. Esto permite transferir la misma politica entre seis manos distintas (allegro, inspire, leap, shadow, sharpa y wuji) sin cambiar la interfaz de control. El entrenamiento es un fine-tune completo de 20.000 pasos sobre 1.200 episodios y 325.776 fotogramas repartidos en cuatro tareas.

Es relevante ahora porque aborda uno de los cuellos de botella practicos de la robotica de manipulacion: la heterogeneidad de efectores finales. Al normalizar el espacio de acciones en un punto comun de montaje, el modelo ofrece una politica unica reutilizable entre manos, lo que reduce el coste de reentrenamiento por hardware. El checkpoint publicado contiene solo pesos, sin estado del optimizador, y no incluye resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (PI05Policy de LeRobot 0.4.4), derivada de pi0.5 |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible (chunk de accion de 10 pasos; ventana de contexto del VLM no especificada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (el modelo no es conversacional; usa prompts de tarea) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 14,5 GB) |

## Arquitectura y entrenamiento

El modelo es una politica VLA basada en la implementacion `PI05Policy` de LeRobot 0.4.4, que combina un backbone vision-lenguaje (tokenizador PaliGemma, segun la referencia del model card) con un cabezal de prediccion de acciones. La entrada consta de dos camaras RGB de 480x640 (`base_0_rgb` y `left_wrist_0_rgb`) redimensionadas con `resize_with_pad` a 224x224, un prompt de tarea y un vector de estado de 31 dimensiones (padded a 32). La salida es un chunk de 10 acciones de 31 dimensiones, normalizadas con estadisticas de cuantiles calculadas sobre el dataset.

El entrenamiento es un fine-tune completo sobre el conjunto DexVerse de brazo unico xlvla: cuatro tareas (GraspBleach, GraspPan, GraspKettle y FunctionalHammerStrike) por seis manos, con 1.200 episodios y 325.776 fotogramas. Se usaron 20.000 pasos con batch global de 128 (32 por GPU en 4 B200), learning rate 1e-4 con warmup de 1.000 pasos y decaimiento coseno hasta 1e-6, precision mixta bf16 con pesos maestros en float32, gradient checkpointing y semilla 42. No se aplico EMA ni aumento de imagen. La innovacion tecnica es la redefinicion del espacio de estado/accion: las dimensiones 0:9 se sustituyen por la pose de la cara de montaje del brazo (`Dexverse-CSI/cross-dex-hand-mount`, ficheros `wrist/<Task>/<hand>_right.parquet`) y se recalculan sus estadisticas de normalizacion, manteniendo intactos datos, prompts, camaras y receta respecto a las ejecuciones previas de pi0.5 b128.

## Capacidades

- Generacion de acciones de manipulacion diestra en espacio cartesiano de 31 dimensiones a partir de observaciones visuales y estado del robot.
- Control con dos vistas de camara simultaneas (vista base y vista de muneca), con resolucion de entrada de 224x224 tras redimensionado.
- Prediccion de chunks de accion de 10 pasos, lo que permite ejecucion a frecuencia de control sin replanificar en cada paso.
- Transferencia entre seis morfologias de mano (allegro, inspire, leap, shadow, sharpa, wuji) gracias a la interfaz comun en la cara de montaje.
- Ejecucion de cuatro tareas especificas de grasping y golpeo funcional: GraspBleach, GraspPan, GraspKettle y FunctionalHammerStrike.
- Condicionamiento por prompt de tarea (el modelo usa prompts textuales, aunque no se documenta su vocabulario ni su formato exacto).
- No se documentan capacidades de tool calling, razonamiento multi-paso, dialogo multilingue ni modalidades de audio.

## Casos de uso

- Control de brazo robotico con mano diestra en laboratorio: el modelo recibe la vista base y la vista de muneca y emite chunks de 10 acciones de 31 dimensiones, adecuado para bancos de pruebas con LeRobot 0.4.4 y robots de un solo brazo.
- Transferencia entre manos sin reentrenamiento completo: al estar el espacio de accion anclado a la cara de montaje, se puede desplegar la misma politica en una mano allegro y en una shadow cambiando solo la capa de cinematica del efector.
- Tareas de picking de objetos domesticos: los cuatro comportamientos entrenados (botella, sarten, hervidor, martillo) cubren agarres de objetos rigidos de uso comun en entornos de cocina y taller.
- Investigacion en generalizacion visomotora: sirve como linea base para estudiar como afecta la redefinicion del espacio de acciones a la transferencia entre morfologias.
- Evaluacion comparativa de recetas de fine-tune: al compartir datos, prompts y receta con las ejecuciones previas de pi0.5 b128, permite aislar el efecto del cambio de montaje de muneca.
- Prototipado de pipelines de imitation learning: el checkpoint se integra en el ecosistema LeRobot para entrenar y evaluar politicas con el mismo formato de dataset y preprocesador.
- Demostraciones de manipulacion funcional (golpeo con martillo): util para validar control de fuerza y trayectorias no prensiles en manos antropomorficas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye tasas de exito, comparaciones con otras politicas ni curvas de entrenamiento o evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.616.757.520 parametros, en bf16 los pesos ocupan aproximadamente 7,2 GB; en fp32, unos 14,5 GB (coincide con el tamano del repo). A esto hay que sumar el backbone visual y las activaciones de inferencia.
- GPU recomendadas: el entrenamiento se realizo en 4 GPU B200 con batch 32 por GPU; para inferencia se recomienda al menos una GPU con 16-24 GB de VRAM para bf16, aunque no hay cifras oficiales.
- Cabe en GPU de consumo: previsiblemente si en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16, siempre que el runtime de LeRobot lo permita; no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.4.4 con `PI05Policy` y el tokenizador local `paligemma_tokenizer_hf/` incluido en el repo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a una politica VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-cross-dex-hand-mount-single-20k | 3.616.757.520 | chunk de 10 acciones; contexto no disponible | no disponible | Hugging Face (LeRobot) | Fine-tune de pi0.5 con muneca en cara de montaje |
| pi0.5 xlvla b128 (ejecuciones previas citadas) | no disponible | mismo chunk y datos | no disponible | no disponible en la informacion | Misma receta con muneca anatomica; sirve de referencia interna |
| Otras politicas VLA de la familia pi0 / pi0.5 | no disponible | no disponible | no disponible | no disponible en la informacion | No se aportan datos comparativos |

No se dispone de datos de rendimiento, contexto ni licencia de las alternativas para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo solo se ha entrenado para cuatro tareas concretas y seis manos; no se documenta su generalizacion a objetos, tareas o morfologias no vistas.
- No hay evaluacion publicada: se desconoce la tasa de exito real, la robustez ante cambios de iluminacion o la estabilidad de las trayectorias.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- El checkpoint contiene solo pesos, sin estado del optimizador ni `training_state`, lo que limita la reanudacion exacta del entrenamiento.
- El `policy_preprocessor.json` apunta a una ruta local del tokenizador; es obligatorio sustituirla por `paligemma_tokenizer_hf/` del propio repo para que la carga funcione.
- Riesgo de sobreajuste al dataset DexVerse y a las condiciones de captura de las camaras usadas en la recoleccion.
- No se documentan sesgos, comportamiento multilingue ni salvaguardas, dado que no es un modelo generativo de texto.
- La redefinicion del espacio de acciones exige que el robot de destino exponga la pose de la cara de montaje; sin esa interfaz, el modelo no es directamente aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dexverse-CSI/pi05-cross-dex-hand-mount-single-20k
- Dataset de montaje de muneca citado: `Dexverse-CSI/cross-dex-hand-mount` (referenciado en el model card; no se proporciona URL directa)
- LeRobot (libreria de despliegue): https://github.com/huggingface/lerobot
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos.
