# mim-chess-vlas/train_800_dense__bbox__blur__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una política robótica de imitación (visuomotor policy) construida sobre GR00T N1.7, el modelo fundacional abierto de NVIDIA para razonamiento y habilidades de robots humanoides y brazos manipuladores. Se trata de un fine-tune entrenado con LeRobot 0.6.0 sobre un brazo Franka Emika Panda equipado con tres cámaras (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`), especializado en una única familia de tareas: coger un objeto de cocina o supermercado y depositarlo en una caja.

El problema que resuelve es acotado y muy concreto: mapear observaciones multimodales (tres imágenes RGB de 224x224 más un vector de estado proprioceptivo de 9 dimensiones) y una instrucción en lenguaje natural a una acción continua de 7 dimensiones a 20 FPS. No es un modelo de propósito general listo para producción, sino un artefacto de investigación reproducible (semilla 0, 60.000 pasos, configuración documentada) que sirve como referencia para evaluar el pipeline de entrenamiento de GR00T dentro del ecosistema LeRobot.

Su relevancia actual es doble: por un lado, demuestra el flujo completo de fine-tuning de un modelo fundacional cross-embodiment de 3.144 millones de parámetros con datos de imitación de tamaño medio (776 episodios, 207.203 frames); por otro, al publicarse bajo licencia Apache-2.0 con pesos en safetensors, permite reproducir experimentos y comparar variantes de dataset (el nombre del repo codifica decisiones de datos: denso, bounding box, desenfoque, simulación, todas las cámaras, en vivo).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (según safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (política condicionada a una observación por paso, no a una ventana de texto) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni int8 en la model card) |
| Idiomas soportados | instrucciones en inglés; el dataset solo contiene consignas en inglés ("Pick the X and place it into the box"). Multilingüismo no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 12,6 GB) |
| Librería / pipeline | lerobot 0.6.0 / robotics |
| Robot objetivo | Franka Emika Panda (nombre interno `Panda`) |
| Entradas | `observation.state` (9,); `observation.images.agentview` (3, 224, 224); `observation.images.robot0_eye_in_hand` (3, 224, 224); `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Frecuencia de entrenamiento | 20 FPS |
| Dataset de entrenamiento | mim-chess-vlas/train_800_dense__bbox__blur__sim__all_cameras__live (776 episodios, 207.203 frames, 40 tareas) |
| Configuración de entrenamiento | 60.000 pasos, batch 16, AdamW, lr 7e-5, seed 0 |
| Fecha de publicación | 28 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo sigue la receta de GR00T N1.7: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las tres vistas de cámara junto con la consigna textual, y un transformer de acciones entrenado con flow matching que genera la trayectoria de 7 dimensiones condicionada por la representación del backbone, el estado proprioceptivo y el ruido de muestreo. La predicción se produce en espacio continuo de acciones (flow matching), no mediante tokens discretizados, lo que es habitual en las políticas de imitación modernas para control fino de manipuladores. El nombre del repositorio indica que se parte del checkpoint `groot` de LeRobot y se aplica un fine-tune sobre un dataset concreto, con semilla fija 0.

El entrenamiento se realizó con LeRobot 0.6.0 durante 60.000 pasos con batch de 16 y AdamW a 7e-5. El dataset contiene 776 episodios y 207.203 frames a 20 FPS, con 40 variantes de consigna que cubren objetos distintos (mermelada, cereales, pera, boniato, scone, comida envasada, lata, hamburguesa, limón, calabaza, queso, taza, huevo, jamón, perrito caliente, manzana, bebida envasada, pan, vela, pechuga de pollo, tarro, soporte de cuchillos, hervidor, patata, cesta, tarta, naranja, especias, spray, alcohol, jarra de batidora, seta, salero y pimentero, estantería escalonada, condimento, mango, jarra, planta, taburete y dispensador de jabón). No se documenta en la model card el número de tokens de entrenamiento, la composición exacta del dataset más allá de las tareas, ni si hubo etapas de RLHF/DPO (no aplicables en el sentido habitual a una política de control, pero tampoco se menciona ningún refinamiento por preferencias). Las etiquetas del nombre del repo (`bbox`, `blur`, `sim`, `all_cameras`, `live`) sugieren variaciones en el preprocesado de datos, pero su significado exacto no está explicado en la información disponible.

## Capacidades

- Manipulación visuomotora pick-and-place: coger un objeto y depositarlo en una caja, condicionado a instrucción en lenguaje natural.
- Generalización entre 40 categorías de objetos domésticos y de supermercado descritas explícitamente en las consignas de entrenamiento.
- Fusión de tres vistas de cámara (vista global de agente y dos cámaras en la muñeca) con estado proprioceptivo de 9 dimensiones.
- Generación de acciones continuas de 7 grados de libertad (posición/orientación del efector y apertura de pinza, según la convención de LeRobot) en el espacio de acciones del Panda.
- Condicionamiento por lenguaje: la misma política se reutiliza para las 40 tareas cambiando el string de la tarea.
- Ejecución en bucle cerrado a la frecuencia del dataset (20 FPS de entrenamiento), apta para control reactivo.
- Integración con el ecosistema LeRobot: `lerobot-rollout` para ejecución y los scripts de entrenamiento de la librería para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo "thinking": es una política de control, no un asistente conversacional.

## Casos de uso

- Prototipado de pick-and-place en laboratorio: ejecutar la política sobre un Panda real o simulado con `lerobot-rollout` y la consigna adecuada, para validar rápidamente la integración de hardware (cámaras, calibración, puerto) antes de invertir en un dataset propio.
- Clasificación y encajado de productos en logística de alimentación: el modelo ya cubre 40 referencias típicas de supermercado (lata, tarta, fruta, botella, especias) y puede servir como política base para una célula de empaquetado donde el operario introduce el objeto en una caja.
- Reproducción de experimentos de fine-tuning: al fijar semilla 0, 60.000 pasos y publicar la configuración completa, sirve como referencia reproducible para estudiar la varianza de entrenamiento de GR00T en LeRobot.
- Ablación de decisiones de datos: el nombre del repo codifica variantes (`bbox`, `blur`, `sim`, `all_cameras`, `live`); comparar este checkpoint con las otras variantes del mismo autor permite medir el efecto de cada decisión de preprocesado sobre la tasa de éxito.
- Docencia y formación en aprendizaje por imitación: ejemplo completo y de tamaño manejable (3.144 M de parámetros) para explicar flow matching aplicado a control, con dataset y configuración públicos.
- Base para transferencia a otras morfologías o tareas: al ser un fine-tune de un modelo cross-embodiment, puede actuar como inicialización para un nuevo dataset con menos episodios en lugar de entrenar desde cero.
- Evaluación de infraestructura de inferencia robótica: medir latencia extremo a extremo de un VLM de 3.144 M más un transformer de acciones en GPUs de consumo, con vistas a decidir si el bucle de control a 20 FPS es viable en el hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la configuración de entrenamiento, pero no reporta tasas de éxito (success rate), error de posición final, ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,3 GB de pesos en BF16/FP16; alrededor de 12,6 GB si se carga en FP32. Hay que añadir el coste de activaciones del backbone visión-lenguaje con tres imágenes de 224x224, por lo que conviene reservar al menos 8-10 GB en BF16.
- GPU recomendadas para inferencia: NVIDIA RTX 4090 (24 GB) o RTX 4080/A6000 como opción de sobremesa; L4 (24 GB) o A10G para servidores de bajo consumo; A100/H100 si se necesita margen para lotes o para reentrenar.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090). En 8 GB exigiría cuantización, no documentada por el autor.
- Entrenamiento o fine-tuning: el repositorio ocupa 12,6 GB, lo que sugiere pesos más estados del optimizador; para reentrenar con batch 16 se recomienda A100 40/80 GB o H100, o varias GPU con aceleración distribuida de LeRobot.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial) como vía documentada; PyTorch nativo para integrarlo en un bucle propio. vLLM, Ollama y TGI no aplican directamente porque el modelo no es un LM de chat sino una política con backbone VLM y cabeza de acciones. No se documenta exportación a ONNX, TensorRT ni TensorRT-LLM.
- Latencia y throughput: no publicados. El dataset está a 20 FPS, lo que implica un presupuesto de 50 ms por paso de control incluyendo percepción, backbone y transformer de acciones; conviene medirlo en el hardware objetivo antes de comprometerse a control en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fine-tune (GR00T N1.7 + Panda) | 3.144 M | VLM + flow-matching, política de imitación | 3 cámaras + estado 9D + instrucción | Apache-2.0 | HuggingFace, pesos safetensors |
| GR00T N1.7 base (NVIDIA) | no disponible en esta ficha | Modelo fundacional cross-embodiment | Visión + lenguaje + propiocepción | no disponible en esta ficha | GitHub de NVIDIA Isaac-GR00T |
| GR00T N1 (generación anterior) | no disponible en esta ficha | Modelo fundacional cross-embodiment | Visión + lenguaje + propiocepción | no disponible en esta ficha | Repositorio de NVIDIA |
| OpenVLA-7B | 7.000 M aprox. | VLM + acciones discretizadas | 1 cámara + instrucción | no verificada en esta ficha | Público, pesos abiertos |
| SmolVLA | ~450 M | VLM compacto + acciones | Cámaras + estado + instrucción | no verificada en esta ficha | Público, integrado en LeRobot |

Nota: los datos de los modelos alternativos provienen de conocimiento público general y no se han verificado contra sus model cards en esta ficha; los campos marcados como "no disponible" no deben interpretarse como ausencia del dato en el modelo, sino como falta de verificación aquí. Frente a ellos, este checkpoint se distingue por su especialización estrecha (una tarea, un robot), su licencia permisiva y su trazabilidad experimental completa (seed, pasos, dataset).

## Limitaciones y advertencias

- Especialización extrema: solo se ha entrenado para "coger un objeto y ponerlo en la caja" con 40 objetos concretos y un Panda con tres cámaras en posiciones determinadas. Fuera de esa distribución (otros objetos, otra iluminación, otra disposición de cámaras) el comportamiento esperado es degradado.
- Sin métricas publicadas: no hay tasa de éxito ni evaluación cuantitativa en la model card, y el repo registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación externa conocida.
- Dependencia dura del hardware de percepción: el modelo espera exactamente tres cámaras con los nombres `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2` y resoluciones de 224x224; cualquier cambio exige reentrenar o al menos reencuadrar el pipeline.
- Ambigüedad simulación/real: el nombre del repo incluye `sim`, pero también `live`; no se aclara en la información disponible si los datos son puramente simulados (robosuite/mujoco, a juzgar por los nombres de cámara), reales o mixtos. Esto es crítico para decidir si hay brecha sim-to-real.
- Riesgo de sobreajuste y de alucinación motora: con 776 episodios para 40 tareas (unas 19 episodios por objeto) el modelo puede memorizar trayectorias y fallar de forma poco predecible ante objetos nuevos; en control, esto se traduce en colisiones o agarres fallidos, no en texto incorrecto.
- Idioma: las instrucciones de entrenamiento están solo en inglés; no hay evidencia de generalización a consignas en castellano u otros idiomas.
- Licencia Apache-2.0: permisiva para uso comercial, pero el modelo incorpora un backbone Cosmos-Reason2/Qwen3-VL cuyos términos propios deben verificarse por separado antes de un despliegue comercial.
- Sin cuantizaciones documentadas ni herramientas de exportación: el despliegue en GPUs pequeñas o en hardware embebido requiere trabajo adicional no cubierto por el autor.
- Reproducibilidad parcial: se fija la semilla 0 y la configuración, pero no se detalla la versión exacta de CUDA, drivers ni el hardware de entrenamiento, lo que puede introducir diferencias en la repetición del experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_dense__bbox__blur__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__bbox__blur__sim__all_cameras__live
- Visualizador del dataset (LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__bbox__blur__sim__all_cameras__live
- NVIDIA Isaac-GR00T (repositorio oficial del modelo base): https://github.com/NVIDIA/Isaac-GR00T
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot (referenciado indirectamente en la model card)
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con este modelo (corresponden a centros de imagen médica y a un museo de instrumentos musicales); no se han encontrado papers, blogs ni demos adicionales del autor.
