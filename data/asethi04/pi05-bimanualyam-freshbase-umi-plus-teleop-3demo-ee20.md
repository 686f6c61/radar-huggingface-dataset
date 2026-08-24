# ASethi04/pi05-BimanualYAM-freshbase-umi-plus-teleop-3demo-ee20

## Resumen

El modelo `pi05-BimanualYAM-freshbase-umi-plus-teleop-3demo-ee20` es un modelo de robótica bimanual desarrollado por ASethi04, basado en la arquitectura Pi0.5 de Physical Intelligence. Está diseñado para controlar un robot con dos brazos en tareas de manipulación, específicamente la recogida de naranjas y su colocación en un cuenco. El modelo se ha entrenado durante 12.000 pasos de optimización sobre el conjunto de datos canónico UMI (Universal Manipulation Interface) más tres demostraciones completas de teleoperación, lo que lo convierte en una variante experimental con un ajuste muy reducido a una tarea concreta.

Con 4.143 millones de parámetros y un tamaño de repositorio de 16,6 GB, el modelo se distribuye en formato safetensors y utiliza la librería LeRobot. Su relevancia radica en explorar el equilibrio entre datos genéricos de manipulación y demostraciones específicas, aunque la evaluación incluida es un *replay* de observaciones del conjunto de entrenamiento, no una validación en hardware real. Esto lo hace útil para investigación en robótica, pero no para despliegue directo en producción sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (modelo de vision-lenguaje-accion, VLA) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Pi0.5, un modelo de vision-lenguaje-accion (VLA) que combina un codificador de vision, un modelo de lenguaje y un decodificador de acciones. En este caso, la base es `lerobot/pi05_base` con una revision inmutable especifica (`b211f3d44c36b6acfcf7ae94a64e8e96f75a64ba`). El entrenamiento se realizo durante 12.000 pasos de optimizacion sobre el dataset UMI canonico (`brandonyang/dual-lidar-umi-independent`) y tres demostraciones completas de teleoperacion. La accion se define como H24 EE20 current-relative SE(3) con R6D rows y gripper futuro absoluto. No se especifican detalles sobre el dataset de entrenamiento (numero total de tokens, composicion exacta) ni sobre tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Control bimanual de robot: el modelo genera acciones para dos brazos roboticos, con representacion SE(3) relativa al estado actual y 20 grados de libertad efectivos (EE20).
- Ejecucion de tareas de manipulacion: entrenado para la tarea especifica de recoger naranjas y colocarlas en un cuenco.
- Integracion con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- Procesamiento de observaciones multimodales: al ser un VLA, puede procesar entradas de vision (camaras) y lenguaje natural para generar acciones.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue en la informacion disponible.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el modelo sirve como punto de partida para estudiar como un ajuste minimo (3 demostraciones) sobre un dataset generico afecta al rendimiento en una tarea concreta. Se puede evaluar en simulacion o con *replay* de observaciones.
- Desarrollo de politicas de control bimanual: util para probar arquitecturas de control con representacion de accion SE(3) relativa y gripper futuro, en entornos de investigacion.
- Teleoperacion asistida: combinado con un sistema de seguridad EE-to-IK, puede usarse como asistente en tareas de recogida y colocacion de objetos, siempre con supervision humana.
- Generacion de datos de entrenamiento: al ser un modelo ligero (4,1B parametros), puede emplearse para generar trayectorias sinteticas que luego se filtran y se usan para entrenar modelos mas grandes.
- Benchmarking de VLA en robotica: permite comparar el rendimiento de Pi0.5 con otras arquitecturas en tareas bimanuales, aunque la falta de evaluacion en hardware limita su uso como referencia solida.
- Educacion y prototipado: en laboratorios academicos, se puede utilizar para ensenar conceptos de robotica basada en aprendizaje, gracias a su integracion con LeRobot y su tamano manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion mencionada es un *replay* de observaciones del conjunto de entrenamiento, que no constituye una validacion con datos no vistos ni una prueba en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 4.143 millones de parametros en precision FP32, se necesitarian aproximadamente 16,6 GB solo para los pesos, pero el modelo se distribuye en safetensors y podria cargarse en FP16 (unos 8,3 GB) o con cuantizacion (no disponible). No se especifican requisitos oficiales.
- GPU recomendadas: no disponible. Dado el tamano, una GPU con al menos 12-16 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10) seria necesaria para inferencia en FP16, pero no hay confirmacion.
- Compatibilidad con GPU de consumo: probablemente si, en cuantizacion FP16 o con tecnicas de offloading, pero no se ha verificado.
- Opciones de despliegue: al ser un modelo LeRobot, puede ejecutarse con las herramientas de LeRobot (inferencia local) y potencialmente con vLLM o TGI si se adapta, pero no hay documentacion al respecto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (VLA bimanuales). Existen modelos como OpenVLA o MolmoAct2, pero no se han proporcionado datos de rendimiento ni especificaciones comparables. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La evaluacion incluida es un *replay* de observaciones del conjunto de entrenamiento, no una validacion con datos no vistos ni una prueba en hardware real. Los resultados no son extrapolables a entornos reales.
- El uso en hardware requiere un sistema de seguridad EE-to-IK (cinematica inversa) y supervision del operador. No se garantiza exito en tareas reales.
- La licencia no esta disponible, lo que impide conocer las restricciones de uso comercial o modificacion. Se recomienda contactar al autor antes de cualquier uso en produccion.
- El modelo esta entrenado para una tarea muy especifica (recoger naranjas y colocarlas en un cuenco) y puede no generalizar a otras tareas o entornos.
- No se especifican sesgos conocidos, pero al ser un modelo de robotica, los sesgos pueden derivar de los datos de entrenamiento (por ejemplo, variaciones en iluminacion, posiciones de camara o tipos de objetos).
- Riesgo de alucinacion en la generacion de acciones: como cualquier VLA, puede producir acciones incorrectas o inconsistentes si las observaciones difieren del dominio de entrenamiento.
- Se recomienda fijar la revision inmutable del Hub (`b211f3d44c36b6acfcf7ae94a64e8e96f75a64ba`) en lugar de usar `main`, para garantizar reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-umi-plus-teleop-3demo-ee20)
- [Modelo base Pi0.5 en LeRobot](https://huggingface.co/lerobot/pi05_base) (referencia, no enlazado directamente en la informacion)
- [Dataset UMI dual-lidar](https://huggingface.co/datasets/brandonyang/dual-lidar-umi-independent) (referencia, no enlazado directamente en la informacion)
