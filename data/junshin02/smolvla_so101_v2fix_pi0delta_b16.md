# junshin02/smolvla_so101_v2fix_pi0delta_b16

## Resumen

El modelo `junshin02/smolvla_so101_v2fix_pi0delta_b16` es un fine-tuning de SmolVLA, un vision-language-action model (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, adaptado por el usuario junshin02 para controlar un robot SO-101 en una tarea concreta de pick-and-place. El modelo toma como entrada imágenes de varias cámaras, el estado sensoriomotor del robot (6 dimensiones) y una instrucción en lenguaje natural, y genera acciones de control de 6 dimensiones. Está entrenado con el framework LeRobot sobre un dataset propio de 50 episodios que captura la tarea "coger el cubo verde y colocarlo en la caja". Su relevancia radica en demostrar que un VLA de pequeño tamaño puede fine-tuningarse para tareas robóticas específicas y desplegarse en hardware de consumo, siguiendo la filosofía de accesibilidad de LeRobot. La arquitectura es un transformer multimodal que procesa visión, lenguaje y estado, con un peso total de 450.046.176 parámetros. No se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente FP32/BF16) |
| Idiomas soportados | No disponibles (la instruccion de la tarea esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina un codificador de vision, un modelo de lenguaje y un "action expert" para generar comandos de control robotico. La arquitectura se basa en un transformer que procesa simultaneamente multiples vistas de camara (en este caso tres, aunque la model card menciona solo front y wrist), el estado del robot (vector de 6 dimensiones) y una instruccion textual, condicionando la generacion de acciones de 6 dimensiones. El modelo se ha fine-tuningado desde el checkpoint base `lerobot/smolvla_base` usando el framework LeRobot. El entrenamiento se realizo sobre el dataset `junshin02/so101_pickplace_v2fix`, que contiene 50 episodios y 18.817 frames a 30 FPS, capturando la tarea de pick-and-place de un cubo verde. La configuracion de entrenamiento incluye 45.000 pasos, batch size de 16, optimizador AdamW con learning rate de 0.0001, seed 1000 y LeRobot version 0.6.0. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un fine-tuning supervisado estandar de aprendizaje por imitacion.

## Capacidades

- Control robotico de un brazo SO-101: genera acciones de 6 dimensiones (posicion y orientacion del efector final) a partir de observaciones visuales y de estado.
- Entrada multimodal: procesa tres vistas de camara (256x256 RGB), el estado del robot (6 valores) y una instruccion en lenguaje natural.
- Tarea especifica de pick-and-place: ha sido entrenado exclusivamente para "coger el cubo verde y colocarlo en la caja", con capacidad de generalizar dentro de la variabilidad del dataset de entrenamiento.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot, incluyendo comandos CLI como `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, agentes multi-step ni razonamiento general: es un modelo de politica robotica, no un asistente conversacional.
- Capacidades multilingues: no especificadas; la unica instruccion documentada esta en ingles.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio: el modelo puede desplegarse en un robot SO-101 para mover objetos de una posicion a otra, como paso inicial en la automatizacion de procesos de montaje o clasificacion.
- Prototipado rapido de politicas robotica con LeRobot: al estar integrado con LeRobot, permite iterar rapidamente sobre nuevas tareas similares mediante fine-tuning desde este checkpoint, reduciendo el tiempo de entrenamiento.
- Evaluacion de VLA en hardware de consumo: sirve como banco de pruebas para medir el rendimiento de SmolVLA en GPUs domesticas, validando la viabilidad de desplegar modelos de 450M en entornos sin infraestructura de alto rendimiento.
- Base para investigacion en aprendizaje por imitacion: investigadores pueden analizar el comportamiento del modelo en una tarea sencilla y comparar estrategias de aumento de datos, regularizacion o arquitectura.
- Ensenanza de robotica y aprendizaje automatico: en entornos academicos, el modelo puede usarse como ejemplo practico de entrenamiento y despliegue de un VLA, gracias a su tamano reducido y a la documentacion de LeRobot.
- Desarrollo de sistemas de manipulacion en produccion a pequena escala: en lineas de montaje simples donde la tarea es repetitiva y el entorno controlado, el modelo puede ejecutar la tarea de pick-and-place de forma autonoma durante periodos prolongados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no hay datos de tasa de exito, ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El modelo pesa 0.9 GB en safetensors, lo que sugiere que en precision FP16 ocuparia aproximadamente 0.9 GB de VRAM, pero no se confirma el formato de precision.
- GPU recomendadas: no se especifican. El modelo base SmolVLA esta disenado para consumer-grade hardware, por lo que GPUs como RTX 3060, RTX 4060, RTX 3090 o superiores deberian ser suficientes, aunque no hay datos de latencia.
- Compatibilidad con consumer GPUs: probablemente si, dado el tamano reducido, pero no hay confirmacion explicita.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia via `lerobot-rollout`. Tambien puede usarse con herramientas de Hugging Face como `transformers` o `pi0` si se adapta, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| junshin02/smolvla_so101_v2fix_pi0delta_b16 | 450M | No disponible | Pick-and-place SO-101 | Apache-2.0 | HuggingFace |
| junshin02/smolvla_so101_v2trim_delta_b16 | No disponible | No disponible | Pick-and-place SO-101 (variante) | Apache-2.0 | HuggingFace |
| minghonlai/so101-smolvla-shooting-20250730 | No disponible | No disponible | Tarea de "shooting" con SO-101 | No disponible | HuggingFace |
| lerobot/smolvla_base | 450M | No disponible | Modelo base general | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparacion se limita a aspectos cualitativos: todos son fine-tunes de SmolVLA para el robot SO-101, con diferencias en el dataset y la tarea especifica.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha sido entrenado para una unica tarea (coger cubo verde y colocarlo en una caja). Cualquier variacion en el objeto, la posicion, la iluminacion o el entorno puede degradar significativamente el rendimiento.
- Dataset de entrenamiento pequeno: solo 50 episodios, lo que limita la generalizacion y aumenta el riesgo de sobreajuste a las condiciones especificas de grabacion.
- Sin resultados de evaluacion publicados: no hay evidencia de tasa de exito en robot real, por lo que su fiabilidad en produccion es desconocida.
- Dependencia del hardware SO-101: el modelo esta acoplado a las caracteristicas cinematicas y de sensores de este robot especifico; no es portable a otros brazos sin reentrenamiento.
- Posible discrepancia en el numero de camaras: la model card menciona dos camaras (front, wrist) pero los inputs definen tres (`camera1`, `camera2`, `camera3`), lo que puede indicar un error de documentacion o una configuracion no estandar.
- Riesgo de alucinacion en acciones: como cualquier modelo de aprendizaje automatico, puede generar acciones inconsistentes ante observaciones fuera de distribucion.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo depende del hardware SO-101 y de LeRobot, cuyas licencias deben verificarse por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/junshin02/smolvla_so101_v2fix_pi0delta_b16
- Paper de SmolVLA (arXiv): https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/junshin02/so101_pickplace_v2fix
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=junshin02/so101_pickplace_v2fix
- Modelo base: https://huggingface.co/lerobot/smolvla_base
