# mim-chess-vlas/train_800_dense__point__overlay_a75__sim__all_cameras__live__pi05__seed_0

## Resumen

El modelo `train_800_dense__point__overlay_a75__sim__all_cameras__live__pi05__seed_0` es un policy de robótica basado en π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence y orientado a la generalización en entornos abiertos. En concreto, se trata de un fine-tuning del checkpoint base `lerobot/pi05_base`, entrenado y publicado con LeRobot, que adapta el modelo a tareas concretas de manipulación sobre un robot Panda.

El modelo resuelve el problema de generar acciones motoras de 7 grados de libertad a partir de observaciones multimodales: el estado del robot (vector de 9 dimensiones) y tres cámaras RGB de 224×224 píxeles (vista global `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`). La tarea se condiciona mediante instrucciones en lenguaje natural, en este caso 40 variantes del tipo "Pick the [objeto] and place it into the box".

Es relevante porque ejemplifica el flujo de trabajo de imitación end-to-end con LeRobot sobre una arquitectura VLA de última generación, con 4.143.404.816 parámetros (≈4,14 mil millones), licencia Apache 2.0 y pesos en safetensors, lo que facilita su reutilización como punto de partida para investigación en manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementación en LeRobot |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, condicionado por instrucciones de tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ (Pi05) es un modelo Vision-Language-Action de Physical Intelligence diseñado para la generalización en entornos y situaciones no vistos durante el entrenamiento, evolucionando la arquitectura π₀ previa. La implementación utilizada aquí procede de LeRobot y está adaptada del repositorio de código abierto OpenPI. El modelo consume observaciones multimodales (estado del robot y tres flujos de imagen) y produce un vector de acción de 7 componentes. Los detalles internos de la arquitectura (número de capas, mecanismo de atención, dimensiones del tronco, esquema de decodificación de acciones) no están disponibles en la información proporcionada.

El fine-tuning se realizó sobre el dataset `mim-chess-vlas/train_800_dense__point__overlay_a75__sim__all_cameras__live`, compuesto por 776 episodios, 207.203 frames y una tasa de 20 FPS, con 40 tareas distintas de recogida y colocación de objetos en una caja. La configuración de entrenamiento reportada incluye 60.000 pasos, batch size de 16, optimizador AdamW, learning rate de 5e-05, semilla 0 y LeRobot versión 0.6.0. No se indica en la información disponible si se emplearon técnicas de RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generación de acciones motoras de 7 grados de libertad para un robot Panda a partir de observaciones multimodales.
- Percepción visual mediante tres cámaras simultáneas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), cada una con entradas de (3, 224, 224).
- Condicionamiento por instrucciones en lenguaje natural, con 40 tareas entrenadas del tipo "Pick the [objeto] and place it into the box".
- Ejecución de tareas de pick-and-place sobre un conjunto amplio de objetos (alimentos, utensilios, menaje y otros).
- Integración en el ecosistema LeRobot mediante comandos `lerobot-rollout` para despliegue en hardware real.
- Generalización a nuevos entornos y situaciones derivada del diseño de π₀.₅, según la documentación del modelo base.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso explícito, ni modos de pensamiento.

## Casos de uso

- Pick-and-place en almacén o laboratorio: el modelo puede recoger objetos variados (alimentos, utensilios, menaje) y depositarlos en una caja, replicando las 40 tareas del dataset de entrenamiento con un robot Panda.
- Automatización de líneas de clasificación: dado que el modelo acepta instrucciones en lenguaje natural, puede parametrizarse por objeto objetivo y usarse para separar ítems heterogéneos en una bandeja o contenedor.
- Investigación en imitación end-to-end: sirve como baseline reproducible de π₀.₅ fine-tuneado con LeRobot para comparar variantes de datasets, encuadres de cámara o configuraciones de entrenamiento.
- Punto de partida para nuevos fine-tunings: al estar publicado con licencia Apache 2.0 y pesos safetensors, puede reentrenarse sobre dominios específicos sin salir del ecosistema LeRobot.
- Sim-to-real y evaluación de robustez: con tres cámaras y estado de 9 dimensiones, permite estudiar cómo se transfieren políticas entrenadas con datos etiquetados como "sim" y "live" a hardware físico.
- Recolección de datos asistida por política: el modelo puede desplegarse con `lerobot-rollout` para generar trayectorias y ampliar el dataset con nuevas demostraciones.
- Docencia y prototipado en robótica: la integración con la CLI de LeRobot facilita montar demostraciones de manipulación sin desarrollar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (en función del recuento real de parámetros de 4.143.404.816): aproximadamente 8,3 GB en bf16/fp16, alrededor de 4,2 GB en int8 y en torno a 16,6 GB en fp32, sin contar el sobrecoste de activaciones y del codificador visual.
- El tamaño del repositorio es de 74,8 GB, lo que sugiere la presencia de checkpoints completos y posibles estados del optimizador, no solo los pesos de inferencia.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del modelo, resulta viable en GPUs de gama alta para consumidor como la RTX 4090 (24 GB) en bf16, y previsiblemente en GPUs de centro de datos como A100 o H100 para entrenamiento.
- Cabe en GPU de consumidor: probable en bf16 y cuantizaciones de menor precisión con GPUs de 16-24 GB, aunque la información disponible no confirma configuraciones probadas.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout --policy.path=...` sobre un robot Panda con cámaras OpenCV; el modelo base procede del ecosistema OpenPI. No se documentan despliegues equivalentes con vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (π₀.₅ fine-tuneado, `mim-chess-vlas/..._pi05__seed_0`) | 4.143.404.816 | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| `lerobot/pi05_base` (modelo base) | no disponible en la información | no disponible | no disponible | no disponible en la información | HuggingFace |
| Otros modelos VLA comparables (OpenVLA, π₀, RT-2, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo especializado en robótica de manipulación: no es un modelo de lenguaje general y no debe emplearse para generación de texto, código o razonamiento conversacional.
- Entrenado para un robot concreto (`Panda`) y una configuración de cámaras específica; su uso con otro hardware o disposición de sensores puede degradar el rendimiento.
- El dominio de tareas está acotado a las 40 instrucciones de pick-and-place del dataset; la generalización fuera de ese conjunto no está garantizada.
- El dataset combina datos etiquetados como "sim" y "live", lo que puede introducir diferencias de distribución entre simulación y realidad física.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras al ejecutar sobre hardware real, por lo que se recomienda supervisión y límites de seguridad.
- Sesgos conocidos en el dataset (selección de objetos, disposición de la escena, condiciones de iluminación) no están documentados en la información disponible.
- Soporte de idiomas no documentado: las instrucciones del dataset están en inglés.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo deriva de `lerobot/pi05_base` y de la implementación OpenPI de Physical Intelligence; conviene verificar las condiciones de los componentes upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se documentan resultados de benchmarks ni métricas de éxito en tareas, lo que dificulta estimar su fiabilidad en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mim-chess-vlas/train_800_dense__point__overlay_a75__sim__all_cameras__live__pi05__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__point__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de la CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
