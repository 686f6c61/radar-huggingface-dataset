# jsbzzz/train1

## Resumen

`jsbzzz/train1` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el paper arXiv:2304.13705, y publicada en HuggingFace mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo robótico y una imagen de una cámara en la muñeca, y emite directamente comandos de acción de 6 dimensiones. El repositorio lo firma el usuario `jsbzzz` y tiene un tamaño de 0,2 GB con 51.668.614 parámetros.

El modelo está entrenado para una única tarea concreta, "Put the gray eraser on box", a partir de un dataset propio de teleoperación (IMCON/OMX_LeRobot_20261009_190057) con solo 10 episodios, 4.475 fotogramas y 30 FPS. El robot objetivo es un `omx_follower` con una cámara en la muñeca. Su relevancia es fundamentalmente como artefacto de investigación reproducible: sirve para validar el pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`) y como punto de partida para fine-tuning en tareas de manipulación similares.

Se trata de un modelo con 0 descargas y 0 likes, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados, por lo que debe considerarse un experimento en fase temprana y no un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE, backbone visual tipo ResNet, según el método de arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de observación y el tamano de chunk de acciones no se publican) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (modelo de robótica; no procesa lenguaje natural como entrada) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (varias acciones futuras de golpe) en lugar de un único paso, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación fina. La formulación original del paper combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE) que modela la variabilidad humana de las demostraciones mediante una variable latente de estilo, y utiliza un backbone convolucional preentrenado para extraer características de las imágenes. En esta política concreta, la entrada son dos observaciones: `observation.state` con forma `(6,)` y `observation.images.wrist` con forma `(3, 480, 640)`; la salida es `action` con forma `(6,)`. Los detalles concretos de implementación (número de capas, tamaño de chunk, uso de ensamblado temporal) no están publicados en la información disponible.

El entrenamiento se realizó con LeRobot 0.6.2 sobre un dataset de teleoperación de un único operador y una única tarea. La configuración publicada es de 30.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset contiene 10 episodios y 4.475 fotogramas a 30 FPS, lo que equivale a unos 149 segundos de demostraciones en total. No se documenta ningún proceso de RLHF, DPO ni refinamiento posterior; es aprendizaje supervisado puro sobre demostraciones. El volumen de datos es muy reducido, lo que limita la generalización a variaciones de posición, iluminación u objetos.

## Capacidades

- Control visomotor de un brazo robótico de 6 grados de libertad a partir de estado articular e imagen de muñeca.
- Ejecución de una tarea de pick-and-place concreta: colocar la goma de borrar gris sobre la caja.
- Predicción de chunks de acciones, lo que permite un control más suave que la predicción paso a paso.
- Integración nativa con el ecosistema LeRobot: ejecución con `lerobot-rollout` y entrenamiento/fine-tuning con `lerobot-train`.
- Rollout en bucle cerrado a 30 FPS con retroalimentación visual continua.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de software; el razonamiento es puramente motor.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión general, audio): solo percepción visual de la cámara de muñeca; no hay visión de propósito general ni audio.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: el modelo permite replicar de principio a fin el flujo de LeRobot (dataset, entrenamiento, rollout) sin necesidad de grabar datos propios, usando `lerobot-rollout --policy.path=jsbzzz/train1`.
- Validación de hardware `omx_follower`: sirve como prueba funcional de que el brazo, los puertos y la cámara de muñeca están correctamente calibrados antes de invertir tiempo en grabar un dataset nuevo.
- Punto de partida para fine-tuning: al ser un checkpoint ACT ya entrenado con LeRobot 0.6.2, se puede reutilizar con `lerobot-train` sobre un dataset propio de una tarea similar para reducir pasos de entrenamiento.
- Docencia y formación en robótica: es un ejemplo real y ligero (0,2 GB) de política visomotora para explicar action chunking, CVAE y el ciclo teleoperación-entrenamiento-despliegue en un aula o taller.
- Pruebas de latencia y throughput de un stack de inferencia robótica: con 51,7 M de parámetros es un candidato cómodo para medir tiempos de inferencia en GPU de consumo y comparar contra alternativas más pesadas.
- Estudio de sensibilidad a la variación de escena: al estar entrenado con solo 10 episodios de una tarea, es útil para cuantificar experimentalmente cuánto degrada el éxito al mover el objeto, cambiar la iluminación o introducir distracciones.
- Base para comparativas metodológicas: permite contrastar ACT frente a otros métodos de imitación (por ejemplo Diffusion Policy) bajo el mismo protocolo de evaluación de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._" y la tabla de evaluación del template está vacía, por lo que no hay tasas de éxito, número de ensayos ni condiciones de prueba que se puedan reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB solo para los pesos en fp32 (51.668.614 parámetros × 4 bytes) o unos 0,10 GB en fp16. A esto hay que sumar activaciones y buffers del backbone visual que procesa imágenes de 480×640 a 30 FPS; una estimación conservadora sitúa el consumo total por debajo de 2 GB en fp32, aunque no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente por tamaño de modelo. La configuración de entrenamiento publicada usa `--policy.device=cuda`. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente; en el extremo alto no hay ganancia relevante por tamaño, solo por latencia.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU consumer moderna con 4 GB o más (GTX 1650 4 GB, RTX 3050, RTX 4060, etc.). También es plausible ejecutarlo en CPU, aunque no está documentado y a 30 FPS podría no alcanzar el ritmo necesario para control en tiempo real.
- Opciones de despliegue: el camino soportado es la CLI de LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=jsbzzz/train1`), sobre PyTorch y safetensors. vLLM, TGI, llama.cpp y Ollama no aplican a este tipo de modelo. No se documenta exportación a ONNX, TensorRT ni TorchScript.
- Latencia y throughput estimados: no disponibles. El dato relevante para el control es que el bucle de rollout se ejecuta a 30 FPS y que el entrenamiento se hizo a 30 FPS con 4.475 fotogramas, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

No hay datos de benchmarks de esta política, por lo que la comparación se limita a características estructurales y debe tomarse como orientativa. Los datos de los modelos alternativos no proceden de la información proporcionada sobre `jsbzzz/train1`.

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jsbzzz/train1 (ACT) | 51,7 M (dato real del safetensors) | estado `(6,)` + imagen `(3, 480, 640)` | pick-and-place de una sola tarea | no disponible | HuggingFace, 0 descargas |
| ACT de referencia (arXiv:2304.13705) | no disponible en esta busqueda | bimanual, multiples camaras | manipulación fina bimanual | no disponible | paper y código publicos |
| Diffusion Policy | no disponible en esta busqueda | observaciones visuales y de estado | imitación generativa por difusión | no disponible | publicación y repositorio publicos |
| SmolVLA (familia LeRobot) | no disponible en esta busqueda | vision-lenguaje-accion | políticas VLA multi-tarea | no disponible | HuggingFace y LeRobot |

## Limitaciones y advertencias

- Sesgo de datos: entrenado con 10 episodios de un único operador humano, en un entorno concreto y con un objeto concreto; hereda todos los sesgos de trayectoria, velocidad y posicionamiento de esas demostraciones.
- Riesgo de sobreajuste severo: 30.000 pasos sobre 4.475 fotogramas es una ratio muy alta de pasos por muestra, lo que favorece la memorización de la tarea y penaliza la generalización.
- Sin evaluación: no existe ninguna tasa de éxito publicada, ni en robot real ni en simulación, por lo que el rendimiento real es desconocido.
- Restricciones de alcance: solo se ha entrenado para "Put the gray eraser on box" con un robot `omx_follower` y una cámara de muñeca; no se debe esperar que funcione con otra tarea, otro robot, otra cámara u otra disposición de cámara.
- Robustez limitada a cambios de escena: variaciones de iluminación, fondo, posición inicial del objeto o presencia de distracciones pueden degradar el comportamiento de forma no cuantificada.
- Licencia: al no estar declarada ("More Information Needed"), no hay autorización explícita de uso comercial; en la práctica esto impide utilizarlo en producción sin aclarar antes los términos con el autor.
- Idiomas: irrelevante para el modelo, pero implica que no se puede usar como componente de un sistema que requiera comprensión de lenguaje natural.
- Reproducibilidad: se documentan semilla (1000), learning rate (1e-5), batch size (32), pasos (30.000) y versión de LeRobot (0.6.2), pero no se publican los detalles completos de la arquitectura ni los pesos del optimizador, lo que puede dificultar una reproducción exacta.
- Idiomas no aplica y no hay evaluación de sesgos sociales porque no procesa texto ni imágenes de propósito general más allá de la cámara de muñeca.
- Advertencia operativa: ejecutar la política mueve hardware físico real; el comando de rollout requiere ruta de puerto y cámaras correctas, y un fallo de configuración puede provocar movimientos no deseados del brazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsbzzz/train1
- Dataset de entrenamiento: https://huggingface.co/datasets/IMCON/OMX_LeRobot_20261009_190057
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=IMCON/OMX_LeRobot_20261009_190057
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web asociada a esta ficha no devolvió ningún resultado relevante sobre el modelo ni sobre robótica; los enlaces recuperados corresponden a foros sobre servicios bancarios y no guardan relación con el contenido de esta ficha, por lo que se han descartado.
