# sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_3k

## Resumen

Este repositorio es un ajuste fino (fine-tune) de π₀.₅ (Pi05), el modelo Vision-Language-Action (VLA) de Physical Intelligence, publicado por el usuario `sam-guided-vlas` dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es una política robótica de imitación que consume observaciones y emite acciones de control. Concretamente, recibe el estado del robot (9 dimensiones) y tres cámaras a 224×224 (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), y produce un vector de acción de 7 dimensiones, coherente con un brazo Franka Emika Panda con pinza.

El checkpoint declara 4.143.404.816 parámetros (≈4,14 mil millones) en safetensors, con un repositorio de 9,4 GB. Se ha entrenado durante 3.000 pasos con batch de 16, optimizador AdamW y tasa de aprendizaje 5e-05 sobre el dataset `sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live` (200 episodios, 30.830 fotogramas a 20 FPS y 20 tareas de manipulación doméstica). La licencia es Apache-2.0.

Su relevancia es acotada y muy específica: el propio nombre del repositorio codifica una ablación (`mask`, `blur`, `sim`, `all_cameras`, `live`, `seed_0`, `steps_3k`), de modo que se trata de un artefacto de investigación reproducible, no de un modelo listo para producción. Resulta útil para comparar variantes de datos y aumentos dentro de LeRobot y como punto de partida para ajustes posteriores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence, adaptada de OpenPI e implementada mediante LeRobot |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones), según el recuento safetensors del repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: es una política que consume una observación (estado más tres imágenes) y emite una acción; la model card no declara ventana de contexto |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos en safetensors; no se ofrecen versiones GGUF ni cuantizadas |
| Idiomas soportados | No disponible: el condicionamiento de tarea se pasa como cadena de texto (por ejemplo, `--task="soap dispenser"`), pero no se declaran idiomas soportados |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería `lerobot`, versión 0.6.0) |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | Panda |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entradas | `observation.state` (9,), `observation.images.*` (3, 224, 224) |
| Salidas | `action` (7,) |
| Tamaño del repositorio | 9,4 GB |
| Pasos de entrenamiento | 3.000 (batch 16, AdamW, lr 5e-05, semilla 0) |
| Tareas del dataset | 20 tareas de manipulación (soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone, basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray) |

## Arquitectura y entrenamiento

La arquitectura es la de π₀.₅, un modelo Vision-Language-Action de Physical Intelligence que evoluciona π₀ con el objetivo declarado de generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación publicada aquí es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La model card no detalla la composición interna del backbone (codificador visual, torre de lenguaje, experto de acciones), el número de tokens de entrenamiento ni la receta de alineamiento; todos esos datos figuran como no disponibles en la información proporcionada.

El ajuste fino se ha realizado sobre `lerobot/pi05_base` con 3.000 pasos de optimización, batch de 16, AdamW y lr 5e-05. El dataset de entrenamiento contiene 200 episodios y 30.830 fotogramas a 20 FPS, lo que equivale a unos 1.541 segundos (≈25,7 minutos) de datos de manipulación; con 3.000 pasos × batch 16 = 48.000 muestras vistas, el entrenamiento supone aproximadamente 1,56 épocas sobre el dataset (cálculo derivado de los datos de la model card). No se especifican aumentos de datos aplicados, pese a que el nombre del repositorio sugiere variantes con enmascaramiento y desenfoque, ni se documenta el uso de RLHF, DPO u optimización por preferencias.

## Capacidades

- Generación de acciones de control para manipulación robótica: salida continua de 7 dimensiones por paso de inferencia.
- Imitación visual-motora (imitation learning) a partir de demostraciones, no de recompensas explícitas.
- Percepción multi-cámara: una vista global de escena y dos vistas de muñeca, a resolución 224×224.
- Condicionamiento por instrucción de tarea en texto: la tarea se pasa en tiempo de ejecución (`--task="..."`) y determina el comportamiento entre las 20 tareas del dataset.
- Integración con el flujo de trabajo de LeRobot: `lerobot-rollout` para ejecución en robot y `lerobot-train` para reajuste.
- Soporte de tool calling / function calling: no. La salida es un vector de acción, no texto estructurado ni llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso explícito: no documentado. La política ejecuta comportamiento reactivo por paso; no se declara planificación simbólica ni bucle de agente.
- Capacidades multilingües: no disponibles ni declaradas.
- Capacidades especiales (modo thinking, visión para respuesta textual, audio): no. Aunque el modelo base sea un VLA con componente de lenguaje, la cabeza útil aquí produce acciones, no texto.

## Casos de uso

- Manipulación doméstica en simulación o laboratorio: la política está entrenada sobre 20 tareas concretas (dispensador de jabón, tarro, cereales, cuchillo, hervidor, fruta, etc.) sobre un brazo Panda, por lo que se puede desplegar directamente en esas tareas con `lerobot-rollout --robot.type=Panda`.
- Estudio de ablaciones en aprendizaje por imitación: al existir variantes con máscara/desenfoque y semilla 0, sirve para medir el efecto de los aumentos de datos y de la semilla en la tasa de éxito de una política VLA.
- Punto de partida para nuevos ajustes: la model card documenta el comando `lerobot-train` con `--policy.path=lerobot/pi05_base`, de modo que este checkpoint se puede usar como referencia para experimentos con datasets propios o con otro robot de tipo Panda.
- Automatización de pick-and-place en banco de pruebas: con observaciones de estado de 9 dimensiones y acciones de 7, encaja en celdas de recogida y colocación de objetos donde no se requiere razonamiento simbólico.
- Recogida de datos asistida y evaluación de teleoperación: comparar la política con un operador humano en las mismas 20 tareas permite estimar brechas de rendimiento antes de escalar la recogida.
- Docencia y reproducción de resultados en robótica: al ser un checkpoint pequeño (≈4,14 mil millones de parámetros) con licencia Apache-2.0 y flujo LeRobot documentado, es viable reproducir el entrenamiento en un laboratorio con una sola GPU.
- Investigación sobre generalización de políticas VLA: el nombre del repositorio incluye `sim` y `live`, lo que apunta a experimentos de transferencia entre simulación y ejecución real; el modelo sirve como condición experimental en ese tipo de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card indica explícitamente: «_No evaluation results have been provided for this policy yet._». No se dispone de tasas de éxito por tarea, ni de comparaciones con π₀, π₀.₅ original, OpenVLA u otros modelos de la misma categoría. No se ofrecen datos de latencia ni de frecuencia de inferencia en tiempo de control.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación derivada del recuento de parámetros, no publicada por el autor): en bf16, los pesos ocupan ≈8,3 GB, por lo que con activaciones y tres imágenes de 224×224 el consumo razonable se sitúa en el rango de 10-12 GB; en fp32, solo los pesos ocuparían ≈16,6 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S y, en el ámbito de consumo, RTX 4090 o RTX 3090 (24 GB). Una RTX 4080 o 4060 Ti de 16 GB debería ser suficiente en bf16, con margen ajustado.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 16 GB o más. Tarjetas de 8-12 GB probablemente no sean suficientes sin cuantización, y el repositorio no publica pesos cuantizados.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia base) sobre PyTorch y CUDA; también es posible cargar la política con `lerobot-train` para reajuste. vLLM, llama.cpp, Ollama y TGI no son aplicables: no hay pesos GGUF ni adaptadores de servidor de texto publicados.
- Latencia y throughput: no disponibles. El dataset se grabó a 20 FPS, pero la model card no declara la frecuencia de inferencia de la política ni si cumple los requisitos de control en tiempo real del robot.

## Comparativa con modelos similares

La información proporcionada no incluye datos comparativos de terceros. La única comparación documentada es con el modelo base del que deriva este checkpoint:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`...pi05__seed_0__steps_3k`) | 4.143.404.816 | No aplica | Apache-2.0 | Hugging Face | Ajuste fino sobre 200 episodios y 3.000 pasos; sin resultados de evaluación |
| `lerobot/pi05_base` | No disponible | No aplica | No disponible en la información proporcionada | Hugging Face | Modelo base de π₀.₅ en formato LeRobot; origen del ajuste fino |
| π₀.₅ original (Physical Intelligence) | No disponible | No aplica | No disponible | Repositorio OpenPI / blog | Implementación de referencia del método; sin datos de parámetros en la información disponible |
| Otros VLA de la misma categoría (OpenVLA, SmolVLA, etc.) | No disponible | No aplica | No disponible | No disponible | No se han proporcionado datos que permitan una comparación rigurosa |

## Limitaciones y advertencias

- Ausencia total de evaluación: la propia model card indica que no se han publicado resultados de éxito por tarea, por lo que no hay evidencia cuantitativa de que la política funcione de forma fiable.
- Sesgo de dominio: entrenada sobre 200 episodios y 30.830 fotogramas de un único dataset, con un robot Panda y tres cámaras con nombres concretos. Cualquier cambio de robot, de posición o número de cámaras, de iluminación o de distribución de objetos invalida las observaciones esperadas.
- Especialización por tarea: el modelo se condiciona con una instrucción de tarea entre las 20 del dataset; fuera de ese conjunto no hay garantía de comportamiento coherente.
- Riesgo de sobreajuste: con aproximadamente 1,56 épocas efectivas sobre el dataset y 3.000 pasos, el ajuste puede no generalizar a entornos nuevos, precisamente el objetivo declarado de π₀.₅.
- Contexto y conversación: no es un modelo conversacional ni tiene ventana de contexto textual; no admite diálogo multi-turno ni memoria de interacciones previas.
- Idiomas: no se declara soporte multilingüe. Las etiquetas de tarea del dataset están en inglés, y se desconoce el comportamiento con instrucciones en otros idiomas.
- Riesgo físico en producción: cualquier despliegue sobre hardware real debe incorporar paradas de emergencia, límites de par y supervisión humana; un fallo de la política se traduce en movimiento físico, no en texto incorrecto.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero no se especifica la licencia del dataset de entrenamiento ni la del modelo base `lerobot/pi05_base`, lo que conviene verificar antes de un uso comercial.
- Trazabilidad: el repositorio tiene 0 descargas y 0 «likes», está creado en septiembre de 2026 y no incluye informe de evaluación, vídeo de demostración ni análisis de fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_3k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitación en LeRobot: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (`rollout`): https://huggingface.co/docs/lerobot/main/en/inference
- Nota: los resultados de la búsqueda web proporcionados no contienen enlaces relevantes a este modelo (remiten a la serie de televisión «Sam», a SAM.gov, a SAM Outillage y a un máster universitario), por lo que no se han incorporado.
