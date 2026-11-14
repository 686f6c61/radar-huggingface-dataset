# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q1_166335

## Resumen

`castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q1_166335` es una política de control visuomotor entrenada con Diffusion Policy y empaquetada con el framework LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que transforma observaciones (estado del robot e imágenes de dos cámaras) en trayectorias de acción de 7 dimensiones para un brazo manipulador. El problema que resuelve es la manipulación de precisión con contacto rico, en concreto la tarea de ensamblaje de tres piezas descrita como "Insert the first piece into the base, then insert the second piece on top of it".

El modelo tiene 278.014.919 parámetros (dato real de los pesos en safetensors) y un repositorio de 1,1 GB. Fue entrenado sobre el dataset `mimicgen_three_piece_assembly_d1_image256`, con 220 episodios y 73.864 fotogramas a 20 FPS, durante 300.000 pasos con batch de 32 y optimizador Adam a una tasa de aprendizaje de 1e-4. La nomenclatura del identificador sugiere un brazo UR5e y un esquema de aumento de datos (`aug3`, `crop232`), aunque la model card declara el tipo de robot como `panda`; esta discrepancia debe tenerse en cuenta antes de desplegarlo.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline de imitation learning con Diffusion Policy en LeRobot 0.6.1, con licencia Apache 2.0, lo que permite reutilizar la receta de entrenamiento y el formato de observaciones para tareas de ensamblaje similares. No hay métricas de éxito publicadas ni descargas registradas, por lo que debe tratarse como un artefacto experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor generativo sobre redes convolucionales; detalles internos de la red no disponibles) |
| Parametros totales | 278.014.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; horizonte de predicción de acciones no especificado en la información disponible) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot declarado | `panda` (el identificador menciona UR5e; discrepancia sin resolver) |
| Camaras | `agentview`, `robot0_eye_in_hand` |
| Entrada de estado | `observation.state`, forma `(9,)` |
| Entrada visual | dos imágenes `(3, 256, 256)` |
| Salida de acción | `action`, forma `(7,)` |
| Dataset de entrenamiento | `castanetnicolas/mimicgen_three_piece_assembly_d1_image256` |
| Episodios / fotogramas | 220 / 73.864 a 20 FPS |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador / LR | Adam / 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy (paper arXiv:2303.04137), que formula el control visuomotor como un proceso generativo de difusión: en lugar de regresar una acción única, el modelo aprende a denoizar trayectorias de acción multimodales, lo que produce movimientos suaves y consistentes en tareas con contacto físico intenso. La entrada combina un vector de estado proprioceptivo de 9 dimensiones con dos imágenes RGB de 256×256 píxeles (vista externa `agentview` y vista de muñeca `robot0_eye_in_hand`), y la salida es un vector de acción de 7 dimensiones, típico de un manipulador de 6 grados de libertad más pinza.

El entrenamiento se realizó por imitación supervisada sobre 220 demostraciones (73.864 fotogramas a 20 FPS) del dataset MimicGen de ensamblaje de tres piezas, con 300.000 pasos, batch de 32, Adam y LR 1e-4, semilla 1000 y LeRobot 0.6.1. No se documenta en la información disponible el uso de RLHF, DPO ni de decodificación especulativa; tampoco se detalla la composición interna de la red de difusión ni el número de pasos de denoising empleados en inferencia. El identificador del modelo sugiere variantes de aumento de datos (`aug3`) y recorte de imagen a 232 píxeles (`crop232`), pero su efecto concreto no está descrito en la model card.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para manipulación robótica a partir de observaciones visuales y de estado.
- Control visuomotor con contacto rico: el enfoque de difusión favorece movimientos suaves y multi-paso, adecuados para inserción de piezas.
- Percepción desde dos cámaras simultáneas (vista global y vista de muñeca), con resolución de entrada de 256×256.
- Ejecución de una tarea concreta de ensamblaje de tres piezas, especificada mediante el prompt de tarea `"Insert the first piece into the base, then insert the second piece on top of it."`.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Ensamblaje de precisión en laboratorio: ejecutar la política sobre un brazo compatible para insertar dos piezas en una base, usando `lerobot-rollout` con las cámaras `agentview` y `robot0_eye_in_hand`; es adecuada por su entrenamiento específico en esa secuencia de inserción.
- Base para fine-tuning en tareas de inserción similares: reentrenar con `lerobot-train --policy.type=diffusion` sobre un dataset propio de pocos cientos de episodios, aprovechando la receta y el formato de observaciones ya validados.
- Estudio comparativo de métodos de imitation learning: usar esta política como referencia de Diffusion Policy frente a políticas de regresión o ACT en experimentos académicos, dado que la configuración de entrenamiento está completamente documentada.
- Generación de datos sintéticos de evaluación: emplear el modelo como generador de trayectorias candidatas para analizar la multimodalidad de las distribuciones de acción en tareas de ensamblaje.
- Docencia y formación en robótica: reproducir el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) con un caso de contacto rico y requisitos de hardware moderados.
- Validación de pipelines de despliegue: probar la integración de políticas LeRobot en infraestructura de inferencia en tiempo real a 20 FPS, verificando latencias y sincronización de cámaras antes de escalar a tareas más críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ni tasas de éxito para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278 millones de parámetros en FP32, los pesos ocupan aproximadamente 1,1 GB; en FP16, unos 0,56 GB. A ello hay que sumar activaciones de las dos imágenes de 256×256 y del proceso de difusión, por lo que una GPU con 8 GB o más es un punto de partida razonable, aunque no hay mediciones publicadas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería poder alojar los pesos; la idoneidad para control en tiempo real a 20 FPS no está verificada.
- Cabe en GPU consumer: sí, por el tamaño del modelo (278 M de parámetros), aunque la latencia del bucle de difusión y del preprocesado de imagen condiciona el cumplimiento del ciclo de control.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Diffusion Policy, LeRobot) | 278 M | no disponible | Ensamblaje de tres piezas | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT en LeRobot | no disponible | no disponible | Manipulación por imitación | Apache 2.0 (típicamente) | Hub de LeRobot |
| Políticas VQ-BeT en LeRobot | no disponible | no disponible | Manipulación por imitación | Apache 2.0 (típicamente) | Hub de LeRobot |
| Políticas π0 / π0.5 (openpi) | no disponible | no disponible | Manipulación generalista | no disponible | Repositorios públicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay tasas de éxito publicadas: la model card declara ausencia de resultados de evaluación, por lo que se desconoce la fiabilidad real de la política.
- Discrepancia de robot: el identificador menciona UR5e, pero la model card declara `panda`. Desplegarlo en un robot distinto al usado en entrenamiento puede degradar el rendimiento o invalidarlo.
- Dependencia estricta de las cámaras: los nombres y la configuración de `agentview` y `robot0_eye_in_hand` deben coincidir con las claves de observación del entrenamiento; cambios de montaje, resolución o iluminación afectan a la política.
- Sobreajuste al dataset: entrenado con solo 220 episodios de una tarea concreta; la generalización a posiciones de objeto, distractores o variantes de pieza no está documentada.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no puede interpretar instrucciones libres ni encadenar subtareas fuera de su distribución de entrenamiento.
- Riesgo de alucinación en sentido figurado: la política puede generar trayectorias plausibles pero incorrectas en estados fuera de distribución, sin mecanismo de verificación interno.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene auditar los pesos antes de integrarlos en sistemas físicos.
- Artefacto experimental: cero descargas y cero likes en el momento de la consulta, sin comunidad que valide su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q1_166335
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
