# mim-chess-vlas/train_800_dense__mask__separate_channel__sim__all_cameras__live__groot__seed_0

## Resumen

El modelo `train_800_dense__mask__separate_channel__sim__all_cameras__live__groot__seed_0`, publicado por el usuario `mim-chess-vlas`, es una política de robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA. Se trata de un modelo de imitación (vision-language-action, VLA) que consume observaciones multimodales (tres vistas de cámara más un canal de máscara, además del estado propioceptivo del robot) y produce acciones de control de 7 dimensiones para un brazo robótico Franka Panda en tareas de pick-and-place.

El modelo resuelve una tarea muy acotada: recoger un objeto de una lista cerrada de 40 categorías (alimentos, utensilios, menaje) y depositarlo en una caja. No es un modelo de propósito general ni un chatbot: es un checkpoint de política entrenado para un entorno simulado concreto, con 776 episodios y 207.203 fotogramas a 20 FPS. Su relevancia es la de un artefacto reproducible de investigación en manipulación robótica con el stack LeRobot, no la de un modelo desplegable en producción general.

La arquitectura subyacente, GR00T N1.7, combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching. El checkpoint ocupa 12,6 GB en safetensors y declara 3.144.016.000 parámetros totales. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone VLM Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional cross-embodiment para robots humanoides. La arquitectura separa dos componentes: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes y la instrucción en lenguaje natural, y un transformer de acciones que genera trayectorias mediante flow matching, condicionado por visión, lenguaje y propiocepción. Este checkpoint concreto se ha afinado para el robot Panda con cuatro entradas visuales de 224×224 (vista del agente, dos vistas de muñeca y un canal de máscara separado) y un vector de estado de 9 dimensiones; la salida es una acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `mim-chess-vlas/train_800_dense__mask__separate_channel__sim__all_cameras__live`: 776 episodios, 207.203 fotogramas a 20 FPS, con 40 instrucciones de tarea del tipo "Pick the X and place it into the box". La configuración declarada es de 60.000 pasos, batch de 16, optimizador AdamW con learning rate 7e-5 y semilla 0. No se documenta en la información disponible el número de tokens de entrenamiento del backbone, la composición del corpus del VLM base ni si hubo etapas de RLHF o DPO; el ajuste es de imitación supervisada sobre el dataset citado.

## Capacidades

- Generación de acciones de control de 7 grados de libertad para un brazo Franka Panda a partir de observaciones visuales y propioceptivas.
- Percepción multimodal con tres cámaras simultáneas más un canal de máscara separado, lo que permite condicionar la política sobre segmentación de objetos.
- Comprensión de instrucciones en lenguaje natural para seleccionar el objeto objetivo entre 40 categorías (jam, cereal, pear, apple, kettle, blender jug, etc.).
- Ejecución de una única familia de tareas: pick-and-place de un objeto en una caja.
- No dispone de tool calling ni de function calling.
- No es un agente multi-paso de propósito general; la "planificación" se limita a la secuencia de acciones motrices dentro de un episodio.
- Capacidades multilingües: no documentadas; las instrucciones del dataset están en inglés.
- No incluye modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso

- Investigación en imitación visual-motora: servir como baseline reproducible para comparar variantes de la misma familia (con y sin máscara, con overlay, con cámaras estáticas frente a live) sobre el mismo dataset y semilla.
- Evaluación de arquitecturas VLA en simulación: el checkpoint permite medir la tasa de éxito de GR00T N1.7 en tareas de pick-and-place con condicionamiento por máscara, aislando el efecto del canal de segmentación.
- Estudio del efecto del canal de máscara: al haberse entrenado con `mask` como canal separado, permite comparar frente a las variantes `no_mask` u `overlay` publicadas por el mismo autor y cuantificar la contribución de la segmentación explícita.
- Reproducción de experimentos con LeRobot: el comando `lerobot-rollout` documentado en la model card permite desplegar la política sobre un Panda real o simulado y validar los resultados del entrenamiento con semilla 0.
- Generación de datos sintéticos etiquetados: las trayectorias producidas pueden servir como datos adicionales para entrenar políticas más pequeñas o para aumentar la cobertura de objetos del dataset original.
- Docencia y demostraciones de VLA: el tamaño (3,1 B parámetros) y la licencia Apache 2.0 lo hacen apto para cursos y talleres sobre robótica con aprendizaje por imitación, siempre que se cuente con el hardware Panda o un simulador compatible.
- Benchmarking de stacks de despliegue: útil para medir latencia y throughput de LeRobot con modelos de 3 B parámetros en GPUs de distinta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (3,1 B parámetros), en FP16 serían necesarios aproximadamente 6,3 GB solo para pesos, más el estado del optimizador y buffers de activación; en FP32, unos 12,6 GB, que coincide con el tamaño del repositorio.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, una GPU con 16-24 GB (RTX 4090, A10, L4) debería poder alojar el modelo en precisión reducida; A100 o H100 serían adecuadas para entrenamiento o evaluación por lotes.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB) en FP16, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), que es el stack documentado por el autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de acciones más que de texto, esos stacks no son aplicables directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7, Panda, mask separate channel, seed 0) | 3,14 B | no disponible | Pick-and-place simulado, 40 objetos | Apache 2.0 | Hugging Face, 22 descargas |
| Variantes del mismo autor (`no_mask`, `overlay_a75`, `static`) | no disponible | no disponible | Misma familia de tareas | Apache 2.0 (presumible) | Hugging Face |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estas variantes entre sí.

## Limitaciones y advertencias

- Modelo de política específico para una tarea y un robot: solo genera acciones para un Panda en tareas de pick-and-place sobre 40 objetos concretos; no generaliza a otras tareas, morfologías o entornos sin reentrenamiento.
- Entrenado en simulación (`sim` en el nombre del dataset): el gap sim-to-real puede degradar el rendimiento en un robot físico; no se documenta validación en hardware real.
- Dependencia fuerte del canal de máscara: si en despliegue no se dispone de una segmentación fiable, la distribución de entrada difiere de la de entrenamiento.
- Sesgos conocidos: no documentados. Al estar entrenado sobre un conjunto cerrado de objetos de cocina, el modelo no reconocerá categorías fuera de esa lista.
- Riesgo de alucinación motora: como toda política de imitación, puede producir trayectorias plausibles pero incorrectas ante objetos o configuraciones fuera de distribución; no hay mecanismo de verificación interna.
- Limitaciones de idioma: las instrucciones del dataset están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del backbone subyacente (Cosmos-Reason2/Qwen3-VL) y del dataset de entrenamiento antes de un despliegue comercial.
- Repositorio con muy poca tracción (22 descargas, 0 likes) y creado en octubre de 2026: no hay evidencia de validación externa ni de mantenimiento.
- No se documentan requisitos de hardware, latencias ni métricas de éxito, lo que dificulta estimar su viabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_dense__mask__separate_channel__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__mask__separate_channel__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__mask__separate_channel__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor en SAVRN: https://savrn.com/model-publishers/mim-chess-vlas
- Variante `no_mask` en DataCombats: https://www.datacombats.com/datasets/mim-chess-vlas/train_800_dense__no_mask
- Variante `overlay_a75` en SelectDataset: https://www.selectdataset.com/dataset/68315db95fad0cd7cca6b5c8d3b1cf24/train-800-dense-mask-overlay-a75-sim-all-cameras-static
