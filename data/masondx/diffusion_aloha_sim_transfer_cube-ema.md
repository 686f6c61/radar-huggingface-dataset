# masondx/diffusion_aloha_sim_transfer_cube-ema

## Resumen

El modelo `masondx/diffusion_aloha_sim_transfer_cube-ema` es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Desarrollado por el usuario masondx, este modelo resuelve la tarea de manipulación robótica "coger el cubo con el brazo derecho y transferirlo al brazo izquierdo" en el entorno de simulación ALOHA. Se trata de un modelo de difusión que genera trayectorias de acción suaves y multi-paso, una técnica especialmente adecuada para tareas de manipulación con contacto rico.

El modelo consume una imagen de cámara superior (640x480) y el estado del robot (14 dimensiones) como entrada, y produce una acción de 14 dimensiones como salida. Con 263 millones de parámetros, está entrenado sobre un dataset de 50 episodios (20.000 frames a 50 FPS) procedente de `lerobot/aloha_sim_transfer_cube_human`. Su relevancia radica en ser un ejemplo reproducible de aplicación de Diffusion Policy en robótica, con licencia Apache 2.0 y pesos en formato safetensors, lo que facilita su uso en investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusion para control visuomotor) |
| Parametros totales | 263.450.374 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que trata el control visuomotor como un proceso generativo de difusion. En lugar de predecir una unica accion, el modelo genera una secuencia completa de acciones (una trayectoria) mediante un proceso de denoising iterativo, lo que produce movimientos suaves y coherentes, especialmente utiles en tareas de manipulacion con contacto. La entrada combina una imagen de camara superior (canal visual) y el estado del robot (14 dimensiones), y la salida es una accion de 14 dimensiones.

El entrenamiento se realizo con el framework LeRobot (version 0.6.2) sobre el dataset `lerobot/aloha_sim_transfer_cube_human`, que contiene 50 episodios y 20.000 frames a 50 FPS. La configuracion de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador Adam con learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento; se trata de un entrenamiento de aprendizaje por imitacion supervisado estandar.

## Capacidades

- Control visuomotor: recibe una imagen de camara y el estado del robot, y produce acciones de control para los brazos del robot ALOHA.
- Generacion de trayectorias: genera secuencias de acciones multi-paso mediante difusion, lo que permite movimientos suaves y coordinados.
- Manipulacion con contacto: adecuado para tareas que requieren interaccion fisica con objetos, como transferir un cubo entre brazos.
- Entrenado en simulacion: funciona en el entorno de simulacion ALOHA (MuJoCo), no en robot real.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el modelo sirve como punto de partida para estudiar tecnicas de diffusion policy en manipulacion robotica, permitiendo reproducir experimentos y comparar con otras arquitecturas.
- Desarrollo de politicas para robots ALOHA: puede desplegarse en un robot ALOHA real o simulado mediante el comando `lerobot-rollout`, sustituyendo los placeholders de puerto y camaras por los valores del hardware.
- Benchmarking de algoritmos de control: al estar entrenado en un dataset publico y estandarizado, permite comparar el rendimiento de Diffusion Policy frente a otros metodos (como ACT) en la misma tarea.
- Generacion de datos sinteticos de demostracion: el modelo puede utilizarse para generar trayectorias de accion que sirvan como datos aumentados para entrenar otras politicas.
- Educacion en robotica: su codigo abierto y su integracion con LeRobot lo convierten en un recurso didactico para ensenar control visuomotor y aprendizaje por imitacion.
- Prototipado rapido en simulacion: permite validar ideas de control antes de transferirlas a hardware real, reduciendo costes y riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No se dispone de datos de tasa de exito, ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 263 millones de parametros y entradas de imagen de 640x480, se estima que puede ejecutarse en GPUs con al menos 8 GB de VRAM en precision FP32. Con cuantizacion (no disponible) podria reducirse.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060 o superior) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con al menos 24 GB de VRAM (como RTX 3090, RTX 4090 o A100) dado el batch size de 8 y la resolucion de imagen.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo para inferencia, aunque el entrenamiento puede requerir GPUs de gama alta.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece comandos CLI como `lerobot-rollout` para ejecutar la politica en robots ALOHA. Tambien puede cargarse mediante la API de LeRobot en Python para integraciones personalizadas.
- Latencia y throughput: no disponibles. Al ser un modelo de difusion, la inferencia requiere multiples pasos de denoising, lo que puede aumentar la latencia en comparacion con metodos de una sola pasada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| masondx/diffusion_aloha_sim_transfer_cube-ema | Diffusion Policy | 263M | aloha_sim_transfer_cube_human | Apache 2.0 | Hugging Face |
| lerobot/act_aloha_sim_transfer_cube_human | ACT (Action Chunking with Transformers) | no disponible | aloha_sim_transfer_cube_human | Apache 2.0 | Hugging Face |

Ambos modelos estan entrenados en el mismo dataset y resuelven la misma tarea, pero utilizan arquitecturas diferentes: Diffusion Policy frente a ACT. No se dispone de datos de rendimiento comparativo publicados. Otros modelos similares pueden existir en el Hub de Hugging Face con el mismo dataset, pero no se han encontrado especificaciones detalladas en la busqueda.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion: el modelo no ha sido validado en robot real, por lo que su transferencia a hardware fisico puede requerir ajustes adicionales (sim-to-real gap).
- Dataset pequeno: solo 50 episodios de demostracion, lo que puede limitar la generalizacion a variaciones de la tarea no vistas durante el entrenamiento.
- Sin evaluacion reportada: no hay datos de tasa de exito ni pruebas en condiciones variadas, por lo que su rendimiento real es desconocido.
- Dependencia de la configuracion de camaras: la politica espera una camara superior con resolucion 640x480; cambios en la posicion o calibracion de la camara pueden degradar el rendimiento.
- Riesgo de alucinacion: aunque no es un modelo de lenguaje, en el contexto robotico puede generar acciones incorrectas o inseguras si el estado observado difiere del distribucion de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del dataset subyacente (`lerobot/aloha_sim_transfer_cube_human`) para posibles restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masondx/diffusion_aloha_sim_transfer_cube-ema
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Repositorio ALOHA Sim (Google DeepMind): https://github.com/google-deepmind/aloha_sim
- Modelo comparable ACT: https://huggingface.co/lerobot/act_aloha_sim_transfer_cube_human
