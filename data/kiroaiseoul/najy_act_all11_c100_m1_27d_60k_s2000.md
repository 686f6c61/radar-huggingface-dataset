# kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s2000

## Resumen

NAJY_act_all11_c100_m1_27D_60k_s2000 es un checkpoint de politica robotica basado en ACT (Action Chunking Transformer) publicado por el usuario kiroaiseoul en HuggingFace bajo licencia Apache-2.0. No es un modelo de lenguaje: es una politica de imitacion entrenada para control de manipulacion y base movil, compatible con el ecosistema LeRobot, que toma como entrada tres flujos de imagen RGB de 480x640 (una camara alta y dos camaras de muneca) junto con un vector de estado de 27 dimensiones, y produce un vector de accion continuo de 16 dimensiones.

El checkpoint contiene 51.700.368 parametros (unos 51,7 millones) en formato safetensors, con un repositorio de 0,2 GB. Segun la model card, corresponde al paso 60000 de la ejecucion `t20_all11_c100_m1_60k_s2000` y fue entrenado en una maquina denominada DGX_1. El propio autor indica explicitamente que la publicacion tiene fines de analisis y puntuacion, y que no constituye por si misma la seleccion de un candidato para despliegue real.

Su relevancia es doble: por un lado, forma parte de la linea de checkpoints NAJY orientada al robot Trossen Mobile AI y a la simulacion `trossen-ai-simulation`; por otro, es un ejemplo de publicacion de artefactos intermedios de investigacion en robotica con verificacion por hash y manifiestos de evaluacion, una practica poco extendida en el ecosistema de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), familia de imitacion con transformer y chunking de acciones; detalles concretos de la implementacion no disponibles |
| Parametros totales | 51.700.368 (~51,7 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (politica de imitacion con horizonte de accion fijo; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es safetensors, presumiblemente en coma flotante de 32 bits) |
| Idiomas soportados | no aplicable (modelo de vision y control robotico; no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Entrada de estado | `observation.state`, vector de 27 dimensiones |
| Entradas de imagen | `observation.images.cam_high` [3, 480, 640], `observation.images.cam_left_wrist` [3, 480, 640], `observation.images.cam_right_wrist` [3, 480, 640] |
| Salida | `action`, vector de 16 dimensiones |
| Paso de entrenamiento | 60000 (segun la model card, ejecucion `t20_all11_c100_m1_60k_s2000`) |
| Semilla | 2000 (inferida del sufijo `s2000` del nombre) |
| Tamano del repositorio | 0,2 GB |
| Hash SHA-256 de `model.safetensors` | `e8cf780b480be89899c0f53b6fcafa5c350efa7f580a008c8192754445436443` |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-08 |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de aprendizaje por imitacion presentada en el trabajo de ALOHA (Zhao et al., 2023). Combina un codificador visual que procesa las imagenes de camaras con un transformer que predice bloques de acciones futuras (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulacion y mejora la estabilidad del control. Habitualmente incorpora un componente de autoencoder variacional condicional (CVAE) durante el entrenamiento para modelar la multimodalidad de las demostraciones humanas. La model card de este checkpoint no detalla la configuracion concreta de capas, cabezas de atencion ni el backbone visual empleado, por lo que esos datos se consideran no disponibles.

El entrenamiento es de tipo behavioral cloning sobre demostraciones de teleoperacion, no se menciona ningun uso de RLHF, DPO ni aprendizaje por refuerzo. La model card indica que el checkpoint pertenece a una ejecucion de 11 etapas («NAJY 11단계», 11 pasos o fases) entrenada en una DGX_1, y que se sube para analisis y puntuacion mediante una herramienta externa que lee banderas desde un fichero `multi_manifest.json` ubicado en la misma carpeta. En el momento de la publicacion el campo de banderas del manifiesto aparece vacio (`{}`), lo que sugiere que el proceso de evaluacion no se ha completado o no se ha registrado. El numero de episodios, la composicion del dataset y el volumen total de tokens o transiciones no se especifican.

## Capacidades

- Generacion de acciones de control continuo en un espacio de 16 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepcion visual multi-camara: procesa simultaneamente una vista cenital o frontal (`cam_high`) y dos vistas de muneca (`cam_left_wrist`, `cam_right_wrist`) a 480x640 por canal RGB.
- Condicionamiento en estado del robot: consume un vector de 27 dimensiones que presumiblemente incluye posiciones articulares y estado de la base movil.
- Ejecucion de politicas por bloques de acciones, lo que permite control a mayor frecuencia efectiva que una politica paso a paso.
- Entrenamiento multi-etapa: la nomenclatura `all11` sugiere cobertura de las 11 etapas de una tarea o curriculum de manipulacion.
- Soporte de tool calling: no aplicable.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplicable.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, vision semantica, audio): no disponibles. La vision se emplea exclusivamente como señal de control, no para descripcion o comprension semantica.

## Casos de uso

- Investigacion en aprendizaje por imitacion multi-camara: sirve como punto de partida para estudiar como afecta la fusion de tres vistas (alta y dos de muneca) al rendimiento de una politica ACT, comparando con variantes de una o dos camaras.
- Evaluacion comparativa de checkpoints: la model card menciona un flujo de puntuacion con `multi_manifest.json`, de modo que este checkpoint puede usarse como sujeto de pruebas frente a otros de la misma familia con distintos pasos de entrenamiento o semillas.
- Fine-tuning sobre un robot Trossen Mobile AI real: al estar etiquetado con `trossen-mobile-ai` y tener dimensiones de accion y estado coherentes con esa plataforma, es un candidato para ajuste con datos reales de la misma morfologia.
- Reproduccion de experimentos con semilla fija: el sufijo `s2000` permite reproducir o contrastar resultados frente a otros checkpoints entrenados con semillas distintas.
- Destilacion o extraccion de politica para despliegue en hardware embebido: con 51,7 M de parametros, la red es lo bastante pequena como para exportarse a ONNX o TensorRT y ejecutarse en un ordenador embebido junto al controlador del robot.
- Analisis diagnostico de condicionamiento por etapa: la nomenclatura de la ejecucion sugiere experimentos con condicionamiento por etapa o fase de tarea, y este artefacto puede emplearse para inspeccionar como responde la politica en cada una.
- Banco de pruebas para pipelines de evaluacion en simulacion: integrable en `trossen-ai-simulation` para medir exito por etapa antes de considerar cualquier despliegue fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de error de accion ni comparaciones cuantitativas con otros checkpoints. El campo de banderas del manifiesto de evaluacion aparece vacio (`{}`), y el repositorio registra cero descargas y cero valoraciones, por lo que tampoco existe validacion externa documentada.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 207 MB en coma flotante de 32 bits (51,7 M de parametros). El repositorio completo ocupa 0,2 GB.
- VRAM estimada para inferencia: del orden de 1 a 3 GB si se procesan las tres imagenes de 480x640 en coma flotante de 32 bits; las activaciones de los codificadores visuales dominan sobre el peso de los parametros. Estimacion orientativa, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en principio. Una RTX 3060, RTX 4060, RTX 4090 o superior funciona sin problema. En centros de datos, una A100 o H100 resulta sobredimensionada para el tamano del modelo, aunque puede tener sentido para entrenamiento o para ejecutar muchas instancias en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en hardware integrado. La inferencia en CPU es viable aunque con mayor latencia.
- Opciones de despliegue: libreria `lerobot` (PyTorch) como via principal. No aplican vLLM, TGI ni Ollama, que estan orientados a modelos de lenguaje. Alternativas razonables son la exportacion a ONNX Runtime o TensorRT para reducir latencia en el borde.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del hardware, de la resolucion de entrada y del tamano del bloque de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_m1_27D_60k_s2000 (este) | 51,7 M | 27 dims de estado + 3 camaras 480x640; accion de 16 dims; 60000 pasos | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| NAJY_act_all11_hot_27D_120k_s2000 | no disponible (repositorio de 207 MB) | misma configuracion de estado y acciones; 120000 pasos; semilla 2000 | el autor lo describe como mejor semilla en las etapas de manipulacion en evaluacion offline | Apache-2.0 | HuggingFace |
| ACT de referencia (LeRobot) | del orden de decenas de millones, segun configuracion | depende de la tarea y del conjunto de camaras | no disponible en esta busqueda | Apache-2.0 | HuggingFace / repositorio LeRobot |
| Diffusion Policy (alternativa de la misma categoria) | del orden de decenas a cientos de millones | observaciones visuales y de estado; horizonte de prediccion configurable | no disponible en esta busqueda | MIT / Apache-2.0 segun implementacion | HuggingFace / repositorio oficial |

La comparacion cuantitativa con alternativas no puede completarse porque no hay metricas publicadas para este checkpoint. La comparacion mas directa disponible es con el checkpoint hermano de 120000 pasos y semilla 2000, segun el cual la variante `hot` es la mejor semilla en evaluacion offline para las etapas de manipulacion.

## Limitaciones y advertencias

- Checkpoint declarado como material de analisis y puntuacion: el autor afirma explicitamente que la subida no equivale a la seleccion de un candidato para despliegue real. No debe tratarse como un modelo listo para produccion.
- Especificidad de plataforma: el modelo esta entrenado para una morfologia concreta (Trossen Mobile AI, 27 dimensiones de estado y 16 de accion). No es transferible a otros robots sin reentrenamiento o ajuste.
- Sesgo de datos: al ser una politica de imitacion, hereda los sesgos de las demostraciones de teleoperacion, incluidas las trayectorias suboptimas y las condiciones de iluminacion o disposicion de objetos presentes en la grabacion.
- Error de acumulacion en despliegues largos: las politicas de imitacion pueden degradarse al salir de la distribucion de estados vista en entrenamiento; no hay datos publicados sobre robustez en rollouts prolongados.
- Ausencia de validacion externa: cero descargas y cero likes, sin resultados de evaluacion publicados ni manifiesto cumplimentado. Cualquier uso requiere evaluacion propia.
- Idiomas: no aplica, pero implica que el modelo no puede utilizarse para tareas de lenguaje, dialogo ni comprension semantica de instrucciones.
- Licencia: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y sin garantias. No se documentan restricciones adicionales por parte del autor, aunque conviene verificar si los datos de entrenamiento subyacentes tienen condiciones propias.
- Model card en coreano: la documentacion esta escrita principalmente en coreano, lo que puede dificultar la trazabilidad a equipos que no lo lean.
- Falta de informacion sobre el dataset de entrenamiento: no se indica numero de episodios, duracion, ni procedimiento de limpieza, lo que impide auditar la calidad de los datos.
- Verificacion de integridad necesaria: el autor proporciona un hash SHA-256 y recomienda comprobarlo con `sha256sum`; omitir esta comprobacion impide detectar corrupcion o sustitucion del fichero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s2000
- Checkpoint hermano de 120000 pasos: https://huggingface.co/kiroaiseoul/NAJY_act_all11_hot_27D_120k_s2000
- Arbol de ficheros del checkpoint hermano: https://huggingface.co/kiroaiseoul/NAJY_act_all11_hot_27D_120k_s2000/tree/main
- Listado de modelos del autor: https://essamamdani.com/ai-models/company/kiroaiseoul
- Noticia sobre el dataset de teleoperacion de robots moviles publicado por el autor: https://www.5radar.com/dataopensource/news/468032/
- Noticia sobre el dataset en formato LeRobot publicado por el autor: https://www.5radar.com/dataopensource/news/468031/
- Referencia documental citada en la model card: `trossen-ai-simulation`, `docs/mobile_base_investigation.md`, seccion 94 (no se ha encontrado URL publica directa)
- Documentacion de LeRobot: no disponible en los resultados de busqueda proporcionados
