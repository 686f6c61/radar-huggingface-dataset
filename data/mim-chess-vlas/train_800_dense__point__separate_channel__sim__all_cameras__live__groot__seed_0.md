# mim-chess-vlas/train_800_dense__point__separate_channel__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenado con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. La arquitectura combina un backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propriocepción. El checkpoint tiene 3.144.016.000 parámetros y se distribuye en safetensors dentro de un repositorio de 12,6 GB.

El modelo está especializado en una única familia de tareas: coger uno de 40 objetos distintos y colocarlo dentro de una caja. Se ha entrenado con el dataset `mim-chess-vlas/train_800_dense__point__separate_channel__sim__all_cameras__live`, compuesto por 776 episodios y 207.203 fotogramas a 20 FPS, capturados con un robot Panda y cuatro cámaras (vista del agente, dos cámaras en la muñeca y un canal de máscara). La entrada es un vector de estado de 9 dimensiones más cuatro imágenes de 3×224×224, y la salida es una acción de 7 dimensiones.

Su interés es fundamentalmente metodológico: es un ejemplo reproducible y completamente documentado de fine-tuning de un VLA sobre un dataset propio con LeRobot 0.6.0 (60.000 pasos, batch 16, AdamW, lr 7e-05, semilla 0). Con cero descargas y cero likes en el momento de la consulta, debe tratarse como un artefacto experimental de investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se han publicado variantes cuantizadas) |
| Idiomas soportados | No disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | apache-2.0 (declarada en la model card) |
| Formato de pesos | safetensors |
| Libreria / framework | LeRobot 0.6.0 |
| Robot objetivo | Panda (`robot.type=Panda`) |
| Entrada (observacion) | `observation.state` (9,); `observation.images.agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`, `mask`, todas (3, 224, 224) |
| Salida (accion) | `action` (7,) |
| Tamano del repositorio | 12,6 GB |
| Fecha de publicacion | 29-10-2026 |

## Arquitectura y entrenamiento

El modelo sigue el diseño de GR00T N1.7: un backbone vision-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa conjuntamente las imágenes de las cuatro cámaras y la instrucción en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera la trayectoria de acción condicionada por las representaciones del backbone y por el estado proprioceptivo del robot. Es, por tanto, un modelo de imitación end-to-end: no hay planificador explícito ni módulo de control separado, la acción de 7 dimensiones se predice directamente a partir de la observación multimodal.

El entrenamiento se realizó por imitación supervisada sobre 776 episodios (207.203 fotogramas a 20 FPS) del dataset indicado, con 40 variantes de instrucción del tipo «Pick the <objeto> and place it into the box». La configuración declarada es de 60.000 pasos, batch de 16, optimizador AdamW, learning rate 7e-05 y semilla 0. No se documentan en la información disponible ni el número total de tokens vistos, ni la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (poco habituales en políticas de manipulación). El nombre del checkpoint sugiere una ablación sobre representación de puntos, canal separado de máscara, uso de todas las cámaras y datos de simulación, pero no se aporta detalle técnico de esas decisiones.

## Capacidades

- Predicción de acciones de manipulación de 7 dimensiones (posición y orientación del efector más pinza) a partir de estado de 9 dimensiones y cuatro imágenes de 224×224.
- Condicionamiento por lenguaje natural: la política selecciona el objeto objetivo descrito en la instrucción entre 40 categorías distintas.
- Percepción multi-cámara: vista global del entorno, dos cámaras en la muñeca y un canal de máscara segmentada.
- Comprensión visio-lingüística heredada del backbone VLM (grounding de objetos y atributos descritos en texto).
- Ejecución de una tarea compuesta de dos fases (pick y place) sin descomposición explícita en subtareas.
- No dispone de tool calling ni de function calling: es una política de acción, no un asistente conversacional.
- No dispone de modo «thinking», visión para descripción de imágenes, audio ni generación de texto libre como funcionalidad de producto.
- Capacidades multilingües: no disponibles; el dataset de entrenamiento está íntegramente en inglés.

## Casos de uso

- Benchmark reproducible de VLAs en simulación: el checkpoint sirve como referencia fija para comparar nuevas políticas de pick-and-place sobre el mismo dataset y la misma configuración de entrenamiento (60.000 pasos, batch 16, semilla 0).
- Baseline para estudios de escalado de datos: al estar entrenado sobre 776 episodios y 207.203 fotogramas, permite medir la ganancia de añadir episodios o diversidad de objetos manteniendo constante la receta de entrenamiento.
- Investigación en transferencia sim-to-real: el nombre del dataset indica origen en simulación, de modo que el modelo es un punto de partida para estudiar el gap de dominio al trasladar la política a un Panda físico con la misma disposición de cámaras.
- Ablaciones de arquitectura y preprocesado: el identificador del checkpoint codifica variantes (representación por puntos, canal de máscara separado, todas las cámaras), lo que lo hace útil como una de las ramas de un estudio comparativo controlado.
- Validación de calidad de datasets sintéticos: ejecutar la política sobre el dataset y analizar los fallos permite detectar huecos de cobertura (objetos, posiciones, iluminación) antes de reentrenar.
- Docencia y formación en imitation learning: es un ejemplo completo y ligero (3,14 mmillones de parámetros, 12,6 GB) para ilustrar el flujo íntegro de LeRobot, desde la grabación de datos hasta `lerobot-rollout`.
- Evaluación automatizada en pipelines de robótica: integrable como política de referencia en bucles de evaluación por lotes en clúster con A100/H100 para generar métricas de éxito por objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, ni comparaciones con otras políticas, ni métricas de error de acción sobre el conjunto de validación.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 6,3 GB en bf16 y unos 12,6 GB en fp32 (cifra coherente con el tamaño del repositorio). Estimación a partir del número de parámetros, no medida.
- VRAM estimada para inferencia completa: 8-12 GB en bf16 con las cuatro cámaras a 224×224 y batch 1. Estimación, no confirmada por el autor.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia y evaluación de una sola política; L40S (48 GB), A100 (40/80 GB) y H100 (80 GB) para evaluación por lotes o para reentrenamiento.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con margen; en 16 GB (RTX 4080/4070 Ti Super) es viable en bf16 y batch 1, pero con poco margen para el backbone VLM.
- Despliegue: LeRobot 0.6.0 mediante `lerobot-rollout` con `--policy.path=<repo>` y configuración de robot y cámaras; el resto del stack es PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF, algo esperable en una política con cabeza de acciones por flow matching.
- Latencia y throughput: no disponibles. Como referencia de diseño, el dataset se grabó a 20 FPS, por lo que el bucle de control debe sostener al menos 20 Hz para replicar la frecuencia de entrenamiento.

## Comparativa con modelos similares

Los datos de los modelos comparativos provienen de sus fichas públicas y pueden variar según la versión; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Activos | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned) | 3,14 mmillones | No disponible | No (denso) | VLM + flow-matching, tarea única de pick-and-place | apache-2.0 | HuggingFace, LeRobot 0.6.0 |
| GR00T N1.7 base (NVIDIA) | ~3 mmillones | No disponible | No (denso) | VLM + flow-matching, propósito general cross-embodiment | No disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| π0 (Physical Intelligence) | ~3,3 mmillones | No disponible | No (denso) | VLM + experto de acciones, propósito general | No disponible en la información | Pública según sus autores |
| OpenVLA | 7 mmillones | No disponible | No (denso) | VLM + tokens de acción discretizados | No disponible en la información | Pública según sus autores |
| RDT-1B | 1,2 mmillones | No disponible | No (denso) | Difusión sobre backbone transformer | No disponible en la información | Pública según sus autores |

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha visto instrucciones de la forma «Pick the <objeto> and place it into the box» con 40 objetos; no hay evidencia de generalización a otras tareas, verbos o disposiciones de escena.
- Origen en simulación: el identificador del dataset incluye `sim`, y los nombres de cámara (`agentview`, `robot0_eye_in_hand`) corresponden a entornos simulados de manipulación. Es previsible un gap de dominio relevante al desplegar en un robot físico, aunque no se han publicado mediciones al respecto.
- Dependencia estricta de la interfaz: exige un estado de 9 dimensiones y exactamente cuatro cámaras de 3×224×224 (incluida una máscara). Cualquier cambio de sensórica, calibración o resolución invalida la política.
- Idioma: las instrucciones se entrenaron en inglés; el comportamiento con instrucciones en castellano no está evaluado y probablemente degrada el rendimiento.
- Riesgo de alucinación y fallos silenciosos: como toda política de imitación, puede ejecutar una trayectoria plausible pero incorrecta (objeto equivocado, colisión, agarre fallido) sin señal de incertidumbre. No se han publicado tasas de éxito que permitan acotar ese riesgo.
- Sesgos del dataset: la selección de objetos (mayoritariamente alimentos y menaje doméstico) y las posiciones de cámara del dataset condicionan la distribución de escenas; objetos, texturas o iluminaciones fuera de esa distribución no están cubiertos.
- Licencia: la model card declara apache-2.0 para este checkpoint, pero conviene verificar los términos del backbone preentrenado de NVIDIA (GR00T N1.7 / Cosmos-Reason2) y del VLM subyacente antes de un uso comercial.
- Madurez: cero descargas y cero likes en el momento de la consulta, model card generada a partir de plantilla con secciones sin completar (por ejemplo, el bloque de demo) y comandos de ejemplo truncados. No hay métricas de validación ni informe de evaluación.
- Contexto y cuantización: no se publica longitud de contexto del backbone ni variantes cuantizadas, lo que limita las opciones de despliegue en hardware restrictivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_dense__point__separate_channel__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__point__separate_channel__sim__all_cameras__live
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__point__separate_channel__sim__all_cameras__live
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de entrenamiento y ejecución de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio de NVIDIA Isaac-GR00T (arquitectura base): https://github.com/NVIDIA/Isaac-GR00T

Nota: las búsquedas web realizadas no devolvieron resultados relacionados con este modelo; los enlaces anteriores proceden de la model card y del ecosistema LeRobot. No se ha localizado un artículo o blog específico de este checkpoint.
