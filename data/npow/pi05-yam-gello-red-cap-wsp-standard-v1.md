# npow/pi05-yam-gello-red-cap-wsp-standard-v1

## Resumen

El modelo `npow/pi05-yam-gello-red-cap-wsp-standard-v1` es un checkpoint de investigación de robótica basado en la arquitectura PI0.5 de LeRobot, desarrollado por el usuario npow. No se trata de un modelo de lenguaje convencional, sino de una política visión-lenguaje-acción (VLA) especializada en una tarea concreta de manipulación robótica: recoger un tapón rojo y colocarlo sobre una caja negra. La innovación principal no reside en un entrenamiento por gradiente, sino en una técnica denominada *weight-space programming* (WSP), que edita directamente los pesos de un modelo base mediante un programa tensorial estático.

El modelo parte de `lerobot/pi05_base` y aplica una serie de transformaciones sobre sus pesos: transfiere componentes de visión y filas de normalización desde un checkpoint de RoboCasa no relacionado, escala proyecciones MLP de los expertos y modifica dos filas de embeddings usando vectores de palabras ya existentes en el modelo base. No se utiliza el checkpoint fine-tuned de YAM ni se realiza entrenamiento por gradiente, lo que convierte a este modelo en un experimento sobre edición de pesos más que en un fine-tuning convencional.

La relevancia de este checkpoint es doble: por un lado, demuestra que es posible adaptar una política robótica a una tarea nueva sin entrenamiento, mediante manipulación directa del espacio de pesos; por otro, publica una evaluación rigurosa que incluye comparaciones contra el modelo base y contra una política trivial de "mantener posición", con intervalos de confianza bootstrap. El autor reconoce explícitamente que la puerta de aceptación completa del experimento no se ha superado y que no se ha verificado la finalización de la tarea en hardware real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI0.5 (vision-language-action, transformer con flow matching) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y Orbax) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | Gemma |
| Formato de pesos | safetensors (LeRobot) y Orbax (OpenPI nativo) |

## Arquitectura y entrenamiento

El modelo se basa en PI0.5, una política visión-lenguaje-acción que combina un backbone de lenguaje/visión con un cabezal de acciones basado en flow matching. La inferencia estándar utiliza 10 pasos de flujo, ruido gaussiano y pesos fijos. La entrada consiste en un vector de estado de 14 valores (seis articulaciones del brazo izquierdo, su pinza, seis del brazo derecho y su pinza) junto con tres imágenes RGB: `base_0_rgb`, `left_wrist_0_rgb` y `right_wrist_0_rgb`. La salida es un chunk de 50 acciones de dimensión 14.

Lo más destacable es que este checkpoint no se ha entrenado con descenso de gradiente. En su lugar, se aplica un programa tensorial estático que: (1) transfiere pesos de visión y filas de normalización seleccionadas desde el checkpoint `DAVIAN-Robotics/pi05-robocasa-H50`, no relacionado con la tarea; (2) escala las proyecciones MLP de los expertos existentes; y (3) edita dos filas de embeddings de palabras usando vectores ya presentes en el vocabulario del modelo base. Las demostraciones de YAM solo aportan estadísticas de normalización y puntuaciones para seleccionar el programa. El checkpoint fine-tuned de YAM no se utilizó en ningún momento. El autor documenta el programa de edición en `weight_edit_program.json` y la auditoría del código fuente upstream en `runtime_audit.json`.

## Capacidades

- Generación de acciones robóticas de manipulación bimanual: produce chunks de 50 acciones de 14 dimensiones (dos brazos de seis articulaciones más dos pinzas).
- Percepción visual multi-cámara: procesa tres vistas RGB simultáneas (cámara base y dos cámaras de muñeca).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante el texto `Pick up the red cap and place it on the black box.`
- Control de pinzas: devuelve comandos absolutos de pinza (bajo = cerrado, alto = abierto) y deltas de articulaciones que deben convertirse a objetivos absolutos mediante el ancla de planificación.
- Inferencia con flow matching: 10 pasos de desruido con ruido gaussiano.
- Compatibilidad dual: carga mediante la API de LeRobot (`PI05Policy`) o mediante OpenPI nativo con backend JAX.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Investigación en edición de pesos: el modelo sirve como banco de pruebas para estudiar cómo afectan ediciones estáticas del espacio de pesos al comportamiento de una política VLA, sin necesidad de entrenamiento. Los ficheros `weight_edit_program.json` y `export_verification.json` permiten reproducir y auditar cada cambio.
- Manipulación robótica de pick-and-place en laboratorio: se puede desplegar en un entorno controlado con un robot YAM para ejecutar la tarea de recoger el tapón rojo, usando las tres cámaras y el vector de estado de 14 valores descritos en la model card.
- Evaluación comparativa de políticas: al incluir métricas contra el modelo base y contra una política de "mantener posición", es útil como referencia en estudios que comparen estrategias de adaptación (fine-tuning vs. edición de pesos vs. políticas triviales).
- Desarrollo de pipelines de inferencia con LeRobot: sirve para validar integraciones con la versión 0.4.4 de LeRobot y el commit upstream indicado, incluyendo el flujo de preprocesado y postprocesado con `make_pre_post_processors`.
- Despliegue con OpenPI/JAX: el repositorio incluye pesos Orbax nativos y opciones de runtime (`solver=euler`, `denoise_steps=10`, `dtype=float32`), lo que permite probar el mismo modelo en un stack distinto al de PyTorch.
- Estudio de dependencia visual: el informe `visual_dependence_report.json` documenta un experimento de intercambio de imágenes que cuantifica cuánto depende el modelo de la coherencia imagen-estado, útil para investigar robustez perceptual.
- Docencia y divulgación: como ejemplo didáctico de programa tensorial estático aplicado a un modelo VLA, con artefactos de verificación incluidos.

## Benchmarks y rendimiento

Los resultados publicados comparan el modelo con PI05 base y con una política de mantener posición, en 20 episodios de evaluación, cuatro anclas por episodio y tres semillas de muestreo. El error es MSE normalizado sobre el brazo izquierdo activo y la pinza.

Implementación LeRobot (upstream sin modificar):

| Modelo | Error primeras 10 acciones ↓ | Error 50 acciones ↓ | Precisión balanceada de pinza ↑ |
|---|---:|---:|---:|
| PI05 base | 0.20908 | 0.45768 | 89.98% |
| WSP weights | 0.03414 | 0.19975 | 92.91% |
| Mantener posición | 0.02749 | 0.22065 | 91.26% |

OpenPI nativo (Euler/10, float32):

| Modelo | Error primeras 10 acciones ↓ | Error 50 acciones ↓ | Precisión balanceada de pinza ↑ |
|---|---:|---:|---:|
| PI05 base | 0.05866 | 0.24176 | 90.49% |
| WSP weights | 0.02922 | 0.18509 | 91.54% |
| Mantener posición | 0.02749 | 0.22065 | 91.26% |

En LeRobot, el error de las primeras 10 acciones cae un 83.7% frente al base (intervalo bootstrap del 95%: 78.2–88.1%) y el error de 50 acciones queda un 9.5% por debajo de mantener posición. En OpenPI nativo, la caída es del 50.2% en primeras 10 acciones y del 23.4% en 50 acciones frente al base. En ambos casos, la política de mantener posición sigue teniendo menor error en las primeras 10 acciones, por lo que la puerta de aceptación completa del experimento no se cumple. El autor indica que la finalización de la tarea no está verificada y que el simulador aproximado también falla al reproducir los comandos de demostración grabados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.143 millones de parámetros, los pesos en safetensors ocupan aproximadamente 8,3 GB en fp16 y unos 16,6 GB en fp32. El repositorio completo ocupa 23,2 GB, incluyendo pesos Orbax y artefactos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100) debería poder alojar los pesos en fp16; para fp32 se recomienda 24 GB o más.
- Cabe en GPU de consumo: probablemente sí en una RTX 4090 (24 GB) en fp16, aunque no hay confirmación del autor.
- Opciones de despliegue: LeRobot 0.4.4 (commit `8fff0fde7c79f23a93d845d1a50e985de01f8b8a`) con `PI05Policy.from_pretrained()` en PyTorch/CUDA; OpenPI nativo con backend JAX mediante `orchestral models inspect openpi` y las opciones `solver=euler`, `denoise_steps=10`, `dtype=float32`, `matmul_precision=highest`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Error primeras 10 (LeRobot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| npow/pi05-yam-gello-red-cap-wsp-standard-v1 | 4.143 M | no disponible | 0.03414 | Gemma | Hugging Face, 43 descargas |
| lerobot/pi05_base | no disponible | no disponible | 0.20908 | no disponible en la información | Hugging Face (modelo base) |
| DAVIAN-Robotics/pi05-robocasa-H50 | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face (fuente de pesos de visión) |
| npow/pi05-yam-gello-red-cap-wsp-standard-v2 | no disponible | no disponible | no disponible (el autor indica menor error offline medido) | no disponible en la información | Hugging Face (versión posterior) |

## Limitaciones y advertencias

- La finalización de la tarea no está verificada: el autor señala que el simulador aproximado falla al reproducir los comandos de demostración grabados y que no se ha probado en hardware real.
- La puerta de aceptación completa del experimento no se cumple: la política trivial de mantener posición obtiene menor error en las primeras 10 acciones que el modelo editado, tanto en LeRobot como en OpenPI nativo.
- Los resultados son offline: se miden errores de acción frente a anclas, no éxito de la tarea en el mundo físico.
- Es un checkpoint de investigación, no un modelo listo para producción; el autor lo describe como tal de forma explícita.
- Dependencia de una versión concreta de LeRobot (0.4.4) y de un commit upstream específico; cambios en la librería pueden romper la carga o el postprocesado.
- La conversión de deltas de brazo a objetivos absolutos requiere aplicar el ancla de planificación; omitirla produce comandos incorrectos.
- El modelo está especializado en una única tarea y un único texto de instrucción; no es un modelo generalista ni multilingüe.
- Licencia Gemma: implica las restricciones de uso de la licencia de Gemma, que deben revisarse antes de cualquier uso comercial. Los pesos derivan de `lerobot/pi05_base` (licencia Gemma) y de un checkpoint RoboCasa con licencia Apache-2.0 según la model card.
- Riesgo de alucinación perceptual: el experimento de intercambio de imágenes muestra un aumento del 23.1% en el error de las primeras 10 acciones cuando las imágenes provienen de otro episodio (intervalo del 95%: 1.6–45.4%), lo que indica sensibilidad a la coherencia imagen-estado.
- Sesgos: no documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/npow/pi05-yam-gello-red-cap-wsp-standard-v1
- Versión v2: https://huggingface.co/npow/pi05-yam-gello-red-cap-wsp-standard-v2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint fuente de pesos de visión: https://huggingface.co/DAVIAN-Robotics/pi05-robocasa-H50
- Dataset de demostraciones: npow/yam-gello-red-cap-100 (referenciado en la model card, sin URL directa en la información proporcionada)
- LeRobot (librería): no se proporciona URL en la información disponible
- OpenPI / Orchestral: no se proporciona URL en la información disponible
