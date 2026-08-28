# Exile051112/franka-pico4-act-c3-red-yellow-blue-edited

## Resumen

Este modelo es un artefacto de despliegue privado de una politica ACT (Action Chunking with Transformers) para el control de un robot manipulador Franka con teleoperacion Pico4. Ha sido desarrollado por el usuario Exile051112 y publicado en HuggingFace como parte del ecosistema LeRobot. La politica fue entrenada con fine-tuning completo (no LoRA) sobre la condicion `c3_red_yellow_blue_edited`, que combina datos reales de color rojo y amarillo con datos azules editados.

El modelo resuelve el problema de control visual-motor para manipulacion robotica: recibe imagenes RGB de dos camaras (superior y muneca) junto con el estado de propiocepcion del robot, y genera secuencias de acciones (chunks) que representan la pose TCP y el estado del gripper. Con aproximadamente 51,7 millones de parametros, es una politica compacta adecuada para despliegue en tiempo real. El checkpoint corresponde a 10.000 pasos de entrenamiento.

La relevancia de este modelo radica en su integracion con LeRobot, el framework de robotica de HuggingFace, lo que permite reproducir y desplegar politicas de manipulacion con un flujo de trabajo estandarizado. Sin embargo, es un artefacto de despliegue especifico para un setup concreto de robot y no incluye los controladores del robot ni la calibracion de camaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), CVAE con backbone transformer |
| Parametros totales | 51.683.978 (~51,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de control robotico, no procesamiento de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura ACT (Action Chunking with Transformers) fue introducida por Zhao et al. en 2023 para aprendizaje de manipulacion robotica. Combina un transformer encoder-decoder con un CVAE (Conditional Variational Autoencoder) para modelar la distribucion multimodal de acciones. El encoder procesa las observaciones (imagenes de dos camaras y estado de propiocepcion) y el decoder genera un chunk de acciones futuras, lo que reduce la acumulacion de errores en la ejecucion.

El entrenamiento se realizo con fine-tuning completo (no LoRA) sobre el dataset `c3_red_yellow_blue_edited`, que incluye datos reales de color rojo y amarillo junto con datos azules editados. Se utilizo LeRobot 0.6.2 con PyTorch como framework. El checkpoint guardado corresponde a 10.000 pasos de entrenamiento. Los archivos de pre/post-procesamiento incluidos contienen las estadisticas de normalizacion del dataset c3. Los archivos de estado del optimizador se omitieron intencionalmente, ya que solo son necesarios para reanudar el entrenamiento.

Las entradas del modelo son dos imagenes RGB (camara superior y camara de muneca) a 480x640 y 30 FPS, junto con un vector de propiocepcion de 17 valores flotantes. La salida es un vector de 10 valores flotantes que representa la pose TCP (Tool Center Point) y el estado del gripper. El archivo `config.json` ha sido sanitizado para no contener rutas locales de checkpoint del servidor.

## Capacidades

- Control visual-motor para manipulacion robotica: genera acciones de pose TCP y gripper a partir de observaciones visuales y propioceptivas.
- Procesamiento multimodal: integra dos flujos de vision por camara (superior y muneca) con estado de propiocepcion.
- Action chunking: predice secuencias de acciones futuras, reduciendo la acumulacion de errores frente a politicas autoregresivas paso a paso.
- Manejo de distribuciones multimodales: gracias al componente CVAE, puede representar multiples estrategias de manipulacion validas para una misma observacion.
- Despliegue integrado con LeRobot: compatible con el flujo de trabajo `--policy.path` de LeRobot para cargar y ejecutar la politica.
- Normalizacion incorporada: los archivos de pre/post-procesamiento incluyen las estadisticas del dataset c3, lo que facilita la inferencia sin recalcular normalizaciones.

## Casos de uso

- Tareas de pick-and-place con robot Franka: el modelo puede generar secuencias de acciones para recoger y colocar objetos, aprovechando la informacion visual de las camaras superior y de muneca para localizar y manipular los objetos.
- Manipulacion con datos de teleoperacion Pico4: las politicas entrenadas con datos de teleoperacion mediante Pico4 pueden replicar las trayectorias demostradas, lo que resulta util para automatizar tareas que requieren destreza fina.
- Investigacion en aprendizaje por demostracion: el modelo sirve como punto de partida para estudiar el efecto de combinar datos reales y editados (condicion `red_yellow_blue_edited`) en el rendimiento de politicas ACT.
- Evaluacion de politicas en el ecosistema LeRobot: al ser un artefacto de despliegue compatible con LeRobot, puede utilizarse para comparar el rendimiento de distintas politicas (ACT, SmolVLA, etc.) en el mismo setup robotico.
- Control de robot en tiempo real: con 51,7 M de parametros, la inferencia es lo suficientemente ligera para ejecutarse en tiempo real con una GPU modesta, permitiendo control de bucle cerrado a 30 FPS.
- Reproduccion de experimentos: el checkpoint de 10.000 pasos y la configuracion sanitizada permiten reproducir el despliegue de la politica en un entorno controlado, aunque no se puede reanudar el entrenamiento sin los archivos de estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en tareas de manipulacion, tasas de exito ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~51,7 M de parametros, la inferencia requiere menos de 1 GB de VRAM en FP32. Con cuantizacion a FP16 o int8, el requisito se reduce aun mas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA GTX 1650 o superior seria adecuada. Para control en tiempo real a 30 FPS, se recomienda una GPU con buena capacidad de procesamiento paralelo, como una RTX 3060 o superior.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU de consumo actual.
- Opciones de despliegue: LeRobot (PyTorch) es el framework principal. No se documenta compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La latencia dependera del hardware, del tamano de los chunks de accion y de la resolucion de las imagenes de entrada (480x640).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entradas | Salidas | Licencia |
|---|---|---|---|---|---|
| Este modelo (ACT c3) | ACT (CVAE + transformer) | ~51,7 M | 2 camaras RGB + propiocepcion (17 floats) | 10 floats (TCP + gripper) | No disponible |
| ACT original (Zhao et al., 2023) | ACT (CVAE + transformer) | No disponible | Camaras + propiocepcion | Chunks de accion | No especificada |
| SmolVLA (LeRobot, modelo relacionado del mismo autor) | VLA (Vision-Language-Action) | No disponible | Vision + lenguaje + propiocepcion | Acciones | No disponible |

Nota: la comparativa se basa en informacion publica general sobre estas arquitecturas. No se dispone de datos de rendimiento comparativos para este modelo especifico.

## Limitaciones y advertencias

- Artefacto de despliegue privado: la model card indica explicitamente que es un "private deployment artifact", por lo que no esta pensado para uso general ni para reentrenamiento.
- Dependencias externas no incluidas: el controlador del robot Franka/Pico4, la configuracion de camaras, la calibracion, los limites de seguridad y el adaptador de pose TCP a comandos del robot no estan incluidos. Es necesario confirmar el orden de las features y las unidades antes de habilitar el movimiento.
- Sin licencia especificada: no se indica la licencia del modelo, lo que genera incertidumbre legal sobre su uso comercial o modificacion.
- Sin informacion de sesgos: al ser un modelo de control robotico, los sesgos se manifiestan como comportamientos inseguros o suboptimos en tareas fuera de la distribucion de entrenamiento.
- Riesgo de acciones inseguras: ante observaciones fuera de la distribucion, el modelo puede generar acciones incorrectas o inseguras. No se documentan evaluaciones de seguridad.
- Datos de entrenamiento limitados: la condicion `c3_red_yellow_blue_edited` combina datos reales (rojo y amarillo) con datos editados (azul), lo que puede introducir artefactos o distribuciones sesgadas.
- Sin capacidad de reanudar entrenamiento: los archivos de estado del optimizador se omitieron, por lo que solo es posible inferencia, no continuar el entrenamiento.
- Especifico del setup: el modelo esta entrenado para un setup concreto de robot Franka con teleoperacion Pico4. No es transferible a otros robots sin reentrenamiento o adaptacion.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/Exile051112/franka-pico4-act-c3-red-yellow-blue-edited
- HuggingFace (modelo relacionado SmolVLA c2): https://huggingface.co/Exile051112/franka-pico4-smolvla-c2-red-yellow-blue-real
- LeRobot (framework oficial): https://github.com/huggingface/lerobot
