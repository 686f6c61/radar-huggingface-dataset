# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q1_165889

## Resumen

Este repositorio contiene una política de imitación entrenada con LeRobot para una tarea de ensamblaje robótico de tres piezas. No es un modelo de lenguaje: es una Diffusion Policy, es decir, una política visuomotora que trata el control del robot como un proceso generativo de difusión y produce trayectorias de acción multimodales y suaves. El checkpoint tiene 278.014.919 parámetros y consume dos cámaras de 256x256 píxeles junto con el estado articular de 9 dimensiones para emitir acciones de 7 dimensiones.

El autor es el usuario de Hugging Face `castanetnicolas`, que ha publicado el modelo junto con el dataset de entrenamiento `mimicgen_three_piece_assembly_d1_image256`, derivado del benchmark MimicGen. La tarea aprendida es explícita: "Insert the first piece into the base, then insert the second piece on top of it". El entrenamiento se realizó con LeRobot 0.6.1 durante 500.000 pasos, con batch de 32, optimizador Adam y learning rate de 1e-4.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de una Diffusion Policy entrenada sobre datos sintéticos de MimicGen para manipulación con contacto rico, e ilustra el flujo completo de LeRobot (dataset, entrenamiento, rollout). No hay resultados de evaluación publicados, cero descargas y cero likes, por lo que debe tratarse como un artefacto de investigación y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa, CNN + difusión) |
| Parámetros totales | 278.014.919 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de predicción H=8 según el ID del repo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las instrucciones de tarea son en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy (paper arXiv:2303.04137): el control visuomotor se modela como un proceso de difusión condicionado por observaciones, del que se muestrean secuencias de acciones completas en lugar de acciones individuales. Esto produce trayectorias suaves y multimodales, adecuadas para tareas de manipulación con contacto rico como el ensamblaje de piezas. La entrada combina `observation.state` de shape `(9,)` con dos imágenes RGB de `(3, 256, 256)` procedentes de las cámaras `agentview` y `robot0_eye_in_hand`; la salida es un vector `action` de `(7,)`. El identificador del repositorio indica un horizonte de predicción H=8, batch de 32 y recorte de imagen a 232 píxeles con aumento de datos (`crop232_aug3`).

El entrenamiento usó el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_image256`, con 220 episodios y 73.864 frames a 20 FPS, generado con MimicGen a partir de demostraciones humanas. Se ejecutaron 500.000 pasos con Adam, learning rate 1e-4, batch 32 y semilla 1000, sobre LeRobot 0.6.1. No consta en la información disponible si se aplicaron etapas de RLHF, DPO o ajuste fino posterior; al tratarse de imitation learning supervisado, lo esperable es que no las haya. Tampoco se documenta la composición exacta del dataset ni variaciones de posiciones, iluminación o distractores.

## Capacidades

- Generación de trayectorias de acción para un brazo manipulador tipo `panda` (el nombre del repo menciona UR5e, mientras la model card declara `panda`; conviene verificar la correspondencia real antes de desplegar).
- Control visuomotor a partir de dos vistas: cámara externa `agentview` y cámara de muñeca `robot0_eye_in_hand`.
- Ejecución de la tarea de ensamblaje de tres piezas: inserción de la primera pieza en la base y de la segunda sobre ella.
- Producción de acciones de 7 dimensiones, presumiblemente posición y orientación del efector más pinza.
- Inferencia en tiempo real mediante `lerobot-rollout`, con ejecución indefinida si no se especifica `--duration`.
- No dispone de tool calling, function calling, capacidades de agente multi-paso en el sentido de LLM, ni procesamiento de lenguaje natural más allá del condicionamiento por instrucción de tarea.
- No dispone de visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Ensamblaje de precisión en línea de producción: la política puede ejecutar la secuencia de inserción de dos piezas sobre una base con contacto rico, que es precisamente el régimen donde Diffusion Policy aventaja a políticas deterministas de acción única.
- Investigación en imitation learning: sirve como checkpoint reproducible para comparar variantes de Diffusion Policy, aumentos de datos o recortes de imagen, dado que el ID documenta batch, horizonte, crop y augmentation.
- Generación de datos sintéticos con MimicGen: el dataset asociado permite ampliar demostraciones y reentrenar políticas con más variabilidad sin grabar nuevas teleoperaciones.
- Benchmarking de hardware robótico: permite medir latencia de inferencia y throughput de una política de 278 M parámetros sobre GPU de consumo antes de invertir en plataformas mayores.
- Validación de pipelines LeRobot: útil para probar el flujo `lerobot-train` → `lerobot-rollout` de extremo a extremo en una tarea concreta.
- Docencia y demostraciones de robótica: ejemplo completo de política visuomotora con dataset público y comandos de ejecución documentados.
- Pruebas de robustez frente a cambios de cámara o calibración: al depender de nombres de cámara concretos, permite estudiar la sensibilidad del modelo a variaciones de setup.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de trials, éxitos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 278 M parámetros en safetensors, los pesos ocupan aproximadamente 1,1 GB en fp32; en fp16 o bf16 bajarían a unos 0,55 GB, y con cuantización de 8 bits a unos 0,28 GB, aunque no se documentan formatos cuantizados para este checkpoint.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con 8 GB o más debería alojar los pesos; el cuello de botella real será el preprocesado de dos imágenes de 256x256 y la frecuencia de control a 20 FPS.
- Cabe en GPU de consumo: previsiblemente sí en RTX 3060, RTX 4060, RTX 4070 y superiores, dado el tamaño de pesos; no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible. La referencia temporal es 20 FPS del dataset de entrenamiento, pero no se publica latencia medida en inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | Diffusion Policy (LeRobot) | 278 M | H=8 (según ID) | apache-2.0 | Hugging Face, 0 descargas |
| Diffusion Policy original (Chi et al., 2023) | Diffusion Policy | no disponible | no disponible | no disponible | Paper y código públicos |
| Políticas ACT de LeRobot | Action Chunking Transformer | no disponible | no disponible | apache-2.0 (típico) | Hub de LeRobot |
| Políticas π0 / VLA de gran escala | Vision-Language-Action | no disponible | no disponible | no disponible | Repositorios públicos |

La comparación cuantitativa de rendimiento no está disponible: este checkpoint no publica tasas de éxito y las alternativas citadas tampoco se evalúan en la información proporcionada bajo el mismo protocolo. La diferencia principal frente a ACT es el mecanismo generativo (difusión frente a regresión por chunks) y frente a los VLA de gran escala, el tamaño y la ausencia de comprensión lingüística general.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay evidencia de tasa de éxito en robot real, por lo que no debe desplegarse en producción sin validación propia.
- Tarea única y altamente específica: solo cubre el ensamblaje de tres piezas; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del setup: requiere exactamente las cámaras `agentview` y `robot0_eye_in_hand` con los nombres de observación usados en entrenamiento; cualquier cambio de calibración, iluminación o disposición invalida el rendimiento esperado.
- Ambigüedad de plataforma: el ID menciona UR5e y la model card declara `panda`; hay que confirmar la correspondencia antes de ejecutar.
- Riesgo de sobreajuste al dataset sintético de MimicGen: 220 episodios y 73.864 frames son un volumen modesto, y no se documenta variabilidad de posiciones o distractores.
- Sin capacidades lingüísticas ni de agente: no sustituye a un LLM; el condicionamiento se limita a la instrucción de tarea en inglés.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero no se ofrece garantía alguna sobre el comportamiento del modelo.
- Cero descargas y cero likes: no hay comunidad que haya validado el checkpoint, lo que aumenta el riesgo de artefactos no detectados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q1_165889
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
