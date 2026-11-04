# RoboColosseum/droid-open-drawer-pi0.5

## Resumen

`RoboColosseum/droid-open-drawer-pi0.5` es un fine-tuning de política robótica del modelo Vision-Language-Action π₀.₅ (Pi05) de Physical Intelligence, empaquetado para la librería LeRobot de Hugging Face. El modelo base es `lerobot/pi05_base` y se ha especializado mediante aprendizaje por imitación en una única tarea del dataset DROID: abrir un cajón con un brazo robótico Franka. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB en formato safetensors, es un modelo de tamaño medio que requiere GPU dedicada para inferencia en tiempo real.

La relevancia de esta ficha no reside en el modelo en sí, sino en lo que representa: un ejemplo canónico del flujo de trabajo actual de fine-tuning de VLA en robótica de manipulación. Pi05, presentado por Physical Intelligence como evolución de π₀, está diseñado para generalización en entornos abiertos, y este checkpoint concreto muestra cómo se adapta a una tarea estrecha con solo 100 episodios y 38.884 fotogramas a 30 FPS. Es, por tanto, un caso de estudio útil para quienes evalúan pipelines de imitación con LeRobot.

El modelo se publicó el 4 de noviembre de 2026, no tiene descargas ni likes, y su model card no incluye resultados de evaluación. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo como punto de partida para experimentación, aunque su especialización extrema limita su aplicabilidad fuera del escenario "open drawer" con robot Franka.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence; implementación LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica; no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, que a su vez implementa π₀.₅, un VLA de Physical Intelligence que combina percepción visual, comprensión del lenguaje y generación de acciones motoras. La arquitectura concreta no se detalla en la model card más allá de la referencia al blog de Pi05 y al repositorio OpenPI; no se especifican el número de capas, el tipo de backbone visual, el mecanismo de atención ni si emplea decodificación especulativa u otras innovaciones. Lo que sí se documenta es la interfaz de entrada: estado del robot de 8 dimensiones, posición cartesiana de 6 dimensiones y tres flujos visuales (cámara izquierda a 360×640, cámara de muñeca a 360×640 y una cámara vacía a 224×224), con salida de acción de 8 dimensiones.

El entrenamiento se realizó por imitación sobre el dataset `local/droid-open-drawer-left-wrist`, con 100 episodios, 38.884 fotogramas a 30 FPS y la única tarea "open drawer". La configuración reportada incluye 12.160 pasos de entrenamiento, batch size de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. No se menciona RLHF, DPO ni ninguna fase de alineación; es un fine-tuning supervisado puro sobre el modelo base. Tampoco se detalla la composición del dataset más allá del número de episodios y la tarea.

## Capacidades

- Generación de acciones motoras para un robot Franka en la tarea específica de abrir un cajón.
- Percepción visual multi-cámara: procesa simultáneamente imagen izquierda, imagen de muñeca e imagen de una cámara adicional (etiquetada como `empty_camera_0`).
- Fusión de estado propioceptivo (posición de articulaciones de 8 dimensiones) y posición cartesiana (6 dimensiones) con las observaciones visuales.
- Control a 30 FPS, coincidiendo con la frecuencia del dataset de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito (thinking mode).
- No se documentan capacidades de visión general, audio ni generación de texto libre; el modelo está especializado en acción robótica.

## Casos de uso

- **Automatización de apertura de cajones en entornos de laboratorio**: el modelo puede ejecutar la política "open drawer" sobre un Franka calibrado, usando las tres cámaras y el estado articular como entrada. Es adecuado porque ha sido entrenado específicamente con 100 episodios de esa tarea y esa configuración de sensores.
- **Punto de partida para fine-tuning en tareas de manipulación similares**: investigadores pueden usar este checkpoint como inicialización para tareas que impliquen interacción con tiradores o pomos, dado que ya ha aprendido la dinámica de aproximación y agarre en el dominio DROID.
- **Validación de pipelines LeRobot de extremo a extremo**: sirve como referencia para comprobar que la instalación de LeRobot, la calibración del robot y la configuración de cámaras funcionan, ejecutando `lerobot-rollout` con una política conocida.
- **Generación de datos sintéticos o aumentados para imitación**: al ser un policy entrenado, puede emplearse para rodar episodios y comparar distribuciones de acciones frente a datos humanos, aunque no se documenta esta capacidad explícitamente.
- **Benchmark interno de latencia y throughput en hardware concreto**: con 4,14 mil millones de parámetros y tres flujos visuales, es un caso representativo para medir si una GPU dada puede sostener 30 FPS en inferencia VLA.
- **Docencia y demostraciones de VLA en robótica**: su licencia Apache 2.0 y su empaquetado estándar LeRobot lo hacen apto para cursos y talleres donde se enseña el ciclo completo de imitación, desde la grabación hasta el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, comparaciones con otros checkpoints ni métricas de latencia.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Como referencia orientativa, 4,14 mil millones de parámetros en FP16 requieren aproximadamente 8,3 GB solo para pesos, más memoria para activaciones y los tres flujos visuales; en FP32 serían unos 16,6 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- **GPU recomendadas**: no especificadas por el autor. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100) es un punto de partida razonable para FP16, pero no hay confirmación oficial.
- **¿Cabe en GPU de consumo?**: probablemente en RTX 4090 (24 GB) en FP16, pero no está verificado ni documentado.
- **Opciones de despliegue**: LeRobot mediante `lerobot-rollout` con `--policy.path`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; son herramientas para LLM de texto y no aplican directamente a un VLA de robótica.
- **Latencia y throughput**: no disponibles. El dataset está a 30 FPS, pero no se confirma que la inferencia alcance esa frecuencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RoboColosseum/droid-open-drawer-pi0.5` | 4.143.404.816 | no disponible | Abrir cajón (Franka) | Apache 2.0 | Hugging Face, LeRobot |
| `lerobot/pi05_base` | no disponible en la información | no disponible | VLA generalista (base) | no disponible en la información | Hugging Face, LeRobot |
| π₀ (Pi0) de Physical Intelligence | no disponible en la información | no disponible | VLA generalista | no disponible en la información | OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad cuando estos datos existen.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo solo ha sido entrenado para la tarea "open drawer" con un robot Franka y una configuración de cámaras concreta. No se espera que funcione en otras tareas, otros robots o disposiciones de cámara distintas.
- **Sin evaluación publicada**: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su fiabilidad en producción.
- **Riesgo de alucinación motora**: como todo policy de imitación, puede generar acciones plausibles pero incorrectas ante distribuciones de entrada fuera del dataset de entrenamiento (iluminación distinta, posiciones de cajón no vistas, objetos distractores).
- **Dataset pequeño**: 100 episodios y 38.884 fotogramas son una base limitada; la generalización a variaciones del entorno es incierta.
- **Cámara "empty_camera_0"**: la entrada incluye un flujo visual etiquetado como cámara vacía, lo que sugiere una configuración de sensores heredada del dataset DROID; su papel real en la política no se documenta.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y la implementación OpenPI pueden tener condiciones adicionales que no se detallan en esta model card; conviene verificar la licencia del base antes de un despliegue comercial.
- **Sin soporte multilingüe ni de texto**: no es un modelo de lenguaje; no debe usarse para generación de texto, código o conversación.
- **Fecha de publicación futura**: la model card está fechada en noviembre de 2026, lo que puede indicar un artefacto de prueba o un repositorio de demostración sin mantenimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RoboColosseum/droid-open-drawer-pi0.5)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Blog de Pi05 en Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Guía de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de grabación y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de comandos LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia y rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [Dataset local/droid-open-drawer-left-wrist](https://huggingface.co/datasets/local/droid-open-drawer-left-wrist)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/droid-open-drawer-left-wrist)
