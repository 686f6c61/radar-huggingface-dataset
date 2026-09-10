# sam-guided-vlas/train_1_2_pile_random_pose__mask_a75__ur5e__pi05__seed_0__b25_from_base

## Resumen

Este repositorio contiene una política robótica de visión-lenguaje-acción (VLA) denominada `pi05`, publicada por el usuario `sam-guided-vlas`. No es un modelo de lenguaje generalista: es un *policy* entrenado por imitación para controlar un brazo robótico UR5e y resolver tareas de manipulación sobre una pila de objetos de cocina (dispensador de jabón, mermelada, frascos, cereales, cuchillos, hervidor, frutas y verduras, entre otros). El modelo parte del *checkpoint* base `lerobot/pi05_base`, desarrollado por Physical Intelligence y adaptado a la librería LeRobot de Hugging Face desde el repositorio OpenPI.

El modelo consume tres cámaras RGB de 224×224 píxeles (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`) más un vector de estado propioceptivo de 9 dimensiones, y produce una acción continua de 7 dimensiones. Cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y el repositorio ocupa 9,4 GB, en formato `safetensors`. La licencia es Apache 2.0.

Su relevancia es acotada y muy específica: se trata de un *fine-tuning* de investigación sobre 162 episodios y 28.490 *frames* de datos simulados, con 5.000 pasos de entrenamiento, pensado para estudiar generalización visual mediante máscaras superpuestas (el identificador indica `mask_a75` y `b25`). El autor no ha publicado resultados de evaluación, por lo que su utilidad práctica en producción está por demostrar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi05; detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (las tareas del *dataset* están etiquetadas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base (fine-tuning) |
| Librería | lerobot (versión 0.6.0 durante el entrenamiento) |
| Tipo de robot | UR5e |
| Entradas | `observation.state` (9,), tres imágenes RGB (3, 224, 224) |
| Salidas | `action` (7,) |
| Tamaño del repositorio | 9,4 GB |
| Descargas / *likes* | 0 / 0 |
| Fecha de creación | 2026-09-10 |

## Arquitectura y entrenamiento

La información disponible describe el modelo únicamente como un VLA de tipo `pi05`, la evolución de π₀ de Physical Intelligence orientada a la generalización en entornos y situaciones no vistos durante el entrenamiento. La implementación incluida en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. La *model card* no detalla la arquitectura interna (tipo de *backbone* visual, mecanismo de atención, esquema de decodificación de acciones ni número de tokens de entrenamiento), por lo que esos datos deben consultarse en el blog de pi05 enlazado por el autor. Lo que sí se deduce de las firmas de entrada/salida es que se trata de un *policy* de imitación que mapea observaciones multimodales (tres vistas RGB más estado propioceptivo de 9 dimensiones) a un vector de acción continuo de 7 dimensiones, típico de un controlador de efector final en espacio cartesiano o articular.

El entrenamiento se realizó por *fine-tuning* supervisado desde `lerobot/pi05_base` sobre el *dataset* `sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__ur5e`. Ese conjunto contiene 162 episodios y 28.490 *frames* grabados a 20 FPS en simulación, con tareas de manipulación sobre 20 clases de objetos de cocina y con las tres cámaras activas. La configuración reportada es de 5.000 pasos, tamaño de lote 16, optimizador AdamW y tasa de aprendizaje 5e-05 con semilla 0, lo que equivale a unos 80.000 ejemplos procesados. No se menciona uso de RLHF, DPO ni aprendizaje por refuerzo; el pipeline es de aprendizaje por imitación. Tampoco se documenta ningún mecanismo de decodificación especulativa ni innovación técnica adicional más allá del uso del prefijo `mask_a75` / `b25` en el nombre, que sugiere el uso de máscaras superpuestas al 75 % como parte del régimen de aumento de datos.

## Capacidades

- Generación de acciones de control continuo de 7 dimensiones para un brazo UR5e, a partir de observaciones visuales y propioceptivas.
- Percepción multimodal con tres cámaras simultáneas: una vista externa (`agentview`) y dos cámaras en la muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`).
- Manipulación de objetos de cocina: dispensador de jabón, tarro de mermelada, frasco, caja de cereales, soporte de cuchillos, hervidor, pera, patata, boniato, *scone*, cesta, comida envasada, tarta, lata, hamburguesa, limón, naranja, especias, calabaza y espray.
- Ejecución condicionada por instrucción textual de tarea (`--task="soap dispenser"`), es decir, condicionamiento por lenguaje además del visual.
- Aprendizaje por imitación a partir de demostraciones: admite *fine-tuning* adicional con *datasets* propios en formato LeRobot.
- Ejecución en bucle cerrado sobre robot real mediante `lerobot-rollout`, con duración configurable.
- No hay evidencia en la información disponible de soporte de *tool calling*, *function calling*, razonamiento multi-paso, capacidades multilingües, modo *thinking*, audio o visión generalista fuera del contexto robótico.

## Casos de uso

- Recogida y apilado (*piling*) de objetos domésticos: el modelo fue entrenado específicamente para esta tarea con posiciones aleatorias de los objetos, por lo que puede emplearse para evaluar políticas de *pick-and-place* con variabilidad de pose en un UR5e.
- Investigación en modelos VLA: sirve como punto de partida reproducible para estudiar cómo influyen las máscaras superpuestas (`mask_a75`) y el *blending* (`b25`) en la generalización visual de políticas de imitación.
- *Fine-tuning* con datos propios de laboratorio: dado que deriva de `lerobot/pi05_base` con licencia Apache 2.0, un equipo puede reentrenarlo con sus propios episodios usando `lerobot-train` y desplegarlo en su celda robotizada.
- Evaluación *sim-to-real*: al proceder de un *dataset* de simulación con las tres cámaras activas, es útil para medir la brecha de rendimiento al transferir a un UR5e físico con la misma disposición de sensores.
- Comparación de configuraciones de cámara: permite cuantificar la contribución de las dos cámaras *eye-in-hand* frente a la vista externa en tareas de manipulación fina.
- Generación de datos sintéticos de política: puede ejecutarse en bucle sobre el simulador para producir trayectorias candidatas que después se filtren manualmente antes de incorporarlas a un nuevo *dataset*.
- Docencia y prototipado en robótica: el flujo `lerobot-rollout` con duración fija permite demostrar un *pipeline* completo de aprendizaje por imitación en pocas líneas de comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia *model card* incluye la sección de evaluación con la nota explícita de que no se han proporcionado resultados para esta política: no hay tasas de éxito por tarea, número de ensayos ni condiciones de dificultad documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de 4,14 mil millones de parámetros, no confirmado por el autor): en bf16 en torno a 8,3 GB de pesos más sobrecarga de activaciones, lo que sitúa el consumo realista en 10-12 GB; en fp32 alrededor de 16,6 GB de pesos.
- GPU recomendadas: para entrenamiento con la configuración reportada (lote 16, 5.000 pasos), GPU de clase profesional tipo A100 o H100; para inferencia son suficientes GPU de clase consumer.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16, y en GPUs de 16 GB si se aplica cuantización. No se dispone de confirmación oficial del autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento) sobre el *stack* OpenPI. No se indica compatibilidad con vLLM, TGI, llama.cpp u Ollama, que están orientados a modelos de lenguaje y no a políticas de acción continua.
- Hardware robótico necesario: brazo UR5e con tres cámaras configuradas con los mismos nombres de observación (*agentview*, *robot0_eye_in_hand*, *robot0_eye_in_hand_2*) y frecuencia de datos de 20 FPS.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 fine-tuned, sam-guided-vlas) | 4.143.404.816 | No aplica | Sin evaluación publicada | Apache 2.0 | Hugging Face |
| lerobot/pi05_base (modelo base) | No disponible | No aplica | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face |
| π₀ (Physical Intelligence) | No disponible | No aplica | No disponible en la información proporcionada | No disponible en la información proporcionada | OpenPI |
| Modelos VLA comparables (OpenVLA, GR00T N1) | No disponible | No aplica | No disponible en la información proporcionada | No disponible en la información proporcionada | No verificado |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito, número de ensayos ni condiciones de prueba, por lo que no puede afirmarse que la política funcione de forma fiable ni siquiera en su tarea objetivo.
- Sesgo de dominio: el entrenamiento se realizó íntegramente en simulación, con un único tipo de robot (UR5e) y una lista cerrada de 20 objetos de cocina; es esperable un rendimiento degradado ante objetos, iluminación, fondos o brazos distintos.
- Dependencia estricta de la configuración de sensores: el *policy* espera exactamente tres cámaras con los nombres y las resoluciones de entrenamiento (224×224) y un vector de estado de 9 dimensiones; alterar cualquiera de esas entradas invalida el modelo.
- Volumen de datos muy reducido: 162 episodios y 28.490 *frames* son insuficientes para garantizar generalización robusta; el propio entrenamiento se limitó a 5.000 pasos.
- Riesgo de sobreajuste a las poses de la tarea concreta y de comportamiento errático fuera de la distribución de entrenamiento, algo inherente al aprendizaje por imitación.
- Idiomas: los nombres de tarea están en inglés; no hay información sobre cobertura multilingüe del condicionamiento textual.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las condiciones del modelo base `lerobot/pi05_base` y citar el método enlazado en la *model card*.
- Trazabilidad limitada: 0 descargas y 0 *likes* en el momento de la consulta, sin *demo* en vídeo ni resultados reproducibles publicados.
- Los resultados de búsqueda web disponibles no guardan relación con este modelo (corresponden a una serie de televisión, al portal SAM.gov y a otros temas), por lo que no aportan información adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask_a75__ur5e__pi05__seed_0__b25_from_base
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__ur5e
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitación (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
