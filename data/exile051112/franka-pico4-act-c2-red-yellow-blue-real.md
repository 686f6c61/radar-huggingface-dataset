# Exile051112/franka-pico4-act-c2-red-yellow-blue-real

## Resumen

Este repositorio contiene un artefacto de despliegue para una política de control robótico basada en ACT (Action Chunking with Transformers), entrenada mediante fine-tuning completo con el framework LeRobot. El modelo fue desarrollado por el usuario Exile051112 y está diseñado para operar sobre un robot Franka equipado con una cámara Pico4, en la condición experimental `c2_red_yellow_blue_real` (datos reales con objetos rojos, amarillos y azules). El checkpoint corresponde a 10.000 pasos de entrenamiento y se distribuye en formato safetensors con un total de 51.683.978 parámetros.

La relevancia de este modelo radica en su aplicación práctica en robótica de manipulación por imitación: convierte observaciones visuales (dos cámaras RGB) y propioceptivas en comandos de acción de 10 dimensiones (pose TCP más gripper). Al ser un artefacto de despliegue, no incluye el controlador del robot ni la calibración de cámaras, que deben configurarse externamente. Es un ejemplo representativo de políticas ACT entrenadas con LeRobot para hardware real, aunque su alcance está limitado a la condición específica de datos para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder |
| Parametros totales | 51.683.978 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision-accion, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de transformer encoder-decoder diseñada para aprendizaje por imitación en robótica. En este caso, el modelo se entrenó con fine-tuning completo (no LoRA) sobre el dataset `c2_red_yellow_blue_real`, que contiene demostraciones reales de manipulación con objetos de colores rojo, amarillo y azul. El entrenamiento se realizó con LeRobot 0.6.2 (PyTorch) durante 10.000 pasos. Las entradas del modelo son dos imágenes RGB de 480x640 píxeles a 30 FPS (cámaras `top` y `wrist`) más un vector de propiocepción de 17 valores flotantes (`observation.state`). La salida es un vector de acción de 10 valores que representa la pose TCP (translation, rotation y gripper). Los archivos de preprocesamiento/postprocesamiento incluidos contienen las estadísticas de normalización del dataset c2. No se dispone de información sobre el backbone visual utilizado ni sobre técnicas adicionales como aumentación de datos o regularización.

## Capacidades

- Control de manipulacion robotica: genera comandos de accion de 10 dimensiones (pose TCP + gripper) a partir de observaciones visuales y propioceptivas.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones reales con objetos de colores especificos (rojo, amarillo, azul).
- Procesamiento de dos camaras RGB simultaneas (top y wrist) a 480x640 y 30 FPS.
- Integracion con LeRobot: el modelo se carga directamente mediante `--policy.path` en el framework LeRobot.
- Normalizacion de entradas/salidas: incluye estadisticas del dataset para preprocesamiento y postprocesamiento.
- No es un modelo de lenguaje ni de vision general; su unica funcion es la politica de control para el robot Franka.

## Casos de uso

- Despliegue en robot Franka con camara Pico4: el modelo se integra en un sistema LeRobot para ejecutar tareas de manipulacion en tiempo real, como recoger y colocar objetos de colores rojo, amarillo y azul.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas ACT entrenadas con LeRobot a hardware real, comparando el rendimiento con otras condiciones de datos.
- Evaluacion de robustez en entornos controlados: permite probar la generalizacion del modelo ante variaciones de iluminacion, posicion de camara o pequenos cambios en la escena, siempre dentro de la condicion c2.
- Desarrollo de sistemas de robotica asistida: puede integrarse en prototipos de automatizacion de tareas repetitivas que involucren objetos de colores especificos, como clasificacion o ensamblaje simple.
- Benchmark de politicas ACT: al ser un checkpoint de 10.000 pasos, puede compararse con otros checkpoints del mismo entrenamiento para analizar la evolucion del rendimiento.
- Formacion y demostracion: util en entornos educativos para ilustrar el flujo completo de entrenamiento y despliegue de una politica de manipulacion con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como tasa de exito, precision de agarre o tiempo de ejecucion para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 51,7 millones de parametros, el modelo en FP32 ocupa aproximadamente 207 MB, y en FP16 unos 103 MB, por lo que cabria en cualquier GPU consumer con al menos 2 GB de VRAM. Sin embargo, el procesamiento de dos camaras RGB a 480x640 anade carga de computo que no esta cuantificada en la informacion disponible.
- GPU recomendadas: no se especifican. Dado el tamano del modelo, una GPU como RTX 3060 o superior seria suficiente para inferencia en tiempo real, pero no hay datos confirmados.
- Compatibilidad con consumer GPU: probablemente si, por el tamano reducido del modelo, pero no confirmado.
- Opciones de despliegue: LeRobot (PyTorch) es el framework indicado en la model card. No se mencionan otros motores de inferencia como vLLM, llama.cpp u Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada. ACT es una arquitectura conocida en robotica, pero este repositorio no ofrece datos de comparacion con otras politicas o checkpoints.

## Limitaciones y advertencias

- Entrenado exclusivamente para la condicion `c2_red_yellow_blue_real`: no generaliza a otros colores, objetos o configuraciones de escena fuera de ese conjunto de datos.
- Dependencia de la configuracion de hardware: el modelo asume dos camaras RGB (top y wrist) con resolucion 480x640 y una frecuencia de 30 FPS, ademas de un vector de propiocepcion de 17 valores. Cualquier cambio en la disposicion de camaras o en la representacion del estado requiere reentrenamiento o adaptacion.
- No incluye el controlador del robot ni el adaptador de pose TCP a comandos del robot: estos son dependencias externas que deben implementarse y verificarse antes de habilitar el movimiento.
- Sin licencia especificada: el uso comercial, la redistribucion o la modificacion del modelo pueden estar sujetos a restricciones legales no declaradas.
- Riesgo de errores de prediccion: como toda politica de imitacion, puede fallar ante situaciones no vistas o ruido en las observaciones, lo que en un robot real puede causar movimientos inseguros si no se aplican limites de seguridad adecuados.
- El repositorio no incluye archivos de estado de entrenamiento ni optimizador, por lo que no es posible reanudar el entrenamiento desde este artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Exile051112/franka-pico4-act-c2-red-yellow-blue-real
