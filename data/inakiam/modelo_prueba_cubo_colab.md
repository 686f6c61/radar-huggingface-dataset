# InakiAM/modelo_prueba_cubo_colab

## Resumen

`InakiAM/modelo_prueba_cubo_colab` es una política robótica de imitación basada en ACT (Action Chunking with Transformers), entrenada y publicada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: consume observaciones visuales y proprioceptivas de un brazo robótico y emite comandos de acción de 6 dimensiones. Su propósito concreto es ejecutar la tarea "elegir el cubito verde" sobre un robot tipo `so_follower` (familia SO-100), con dos cámaras RGB de 480x640 (`Robot` y `Webcam`) y un vector de estado de 6 valores.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 M) y un repositorio de 0,2 GB en formato safetensors. Deriva del paper ACT (arXiv:2304.13705), un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y produce trayectorias más suaves en control a 30 FPS.

Su relevancia es la de un artefacto reproducible y didáctico: es un ejemplo mínimo y verificable del flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`). Conviene subrayar que se entrenó con solo 5 episodios y 3.974 fotogramas, y que no se han publicado resultados de evaluación en robot real, por lo que debe tratarse como una prueba de concepto y no como una política lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): autoencoder condicional variacional (CVAE) con codificador visual tipo ResNet y transformer encoder-decoder para predecir chunks de acciones |
| Parámetros totales | 51.668.614 (aproximadamente 51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no es un modelo de lenguaje. La política opera sobre la observación actual (2 imágenes de 480x640 y estado de 6 dimensiones) y emite un chunk de acciones |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors (no hay variantes GGUF, INT8 ni INT4 oficiales) |
| Idiomas soportados | no aplica; la tarea se especifica con una cadena de texto ("elegir el cubito verde") pero el modelo no procesa lenguaje natural de forma general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`, versión 0.6.1) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.Robot` | VISUAL | (3, 480, 640) |
| `observation.images.Webcam` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

| Dato adicional | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras | `Robot`, `Webcam` |
| Pipeline en Hugging Face | robotics |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de clonado de comportamiento que combina un codificador visual (backbone convolucional tipo ResNet) con un transformer encoder-decoder y un componente CVAE. La entrada es la observación actual —dos imágenes RGB de 480x640 píxeles y un vector de estado de 6 dimensiones que corresponde a las articulaciones y la pinza del `so_follower`— y la salida es un chunk de acciones de 6 dimensiones por paso. Predecir varios pasos de acción de golpe, en lugar de uno solo, es la innovación central del método: reduce el error compuesto del clonado de comportamiento y mitiga las pausas por latencia de inferencia. En el paper original también se emplea *temporal ensembling* durante la ejecución para promediar predicciones solapadas y suavizar la trayectoria; la model card no detalla la configuración exacta de chunk ni si se activa el ensamblado temporal en este checkpoint.

El entrenamiento es puramente supervisado (imitación de teleoperación, sin RLHF ni DPO, que no aplican aquí). Se usaron 5 episodios y 3.974 fotogramas a 30 FPS del dataset `InakiAM/cubito_verde_20261023_182545`, con una única tarea: "elegir el cubito verde". La configuración declarada es de 2.000 pasos, batch size 2, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre LeRobot 0.6.1. El volumen de datos y de cómputo es, por tanto, muy reducido: no hay第二阶段 de ajuste, ni aumento de datos, ni mezcla con datasets externos. No se documenta la pérdida final de entrenamiento ni la composición de escenas (posiciones de objeto, iluminación, distractores).

## Capacidades

- Control robótico de imitación para una tarea de picking guiado por color: localizar y seleccionar el cubo verde en el espacio de trabajo del brazo.
- Percepción visual multi-cámara: fusiona dos vistas RGB de 480x640 (vista de robot y webcam externa) para estimar la posición del objeto.
- Emisión de acciones continuas de 6 dimensiones (articulaciones más pinza) en chunks, adecuada para control a 30 FPS.
- Ejecución autónoma de una política entrenada mediante `lerobot-rollout`, sin necesidad de teleoperador.
- Reproducibilidad del pipeline completo de LeRobot: misma receta de entrenamiento (`lerobot-train`) y mismos comandos de despliegue.
- Punto de partida para *fine-tuning* en tareas u objetos nuevos con pocos episodios adicionales.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni generación de texto o código: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni modo "thinking"; la cadena de tarea actúa únicamente como etiqueta de condicionamiento.

## Casos de uso

- **Banco de pruebas de LeRobot de extremo a extremo**: sirve para validar la instalación, la calibración del `so_follower`, el mapeo de cámaras y el ciclo `lerobot-train` → `lerobot-rollout` con un caso de 5 episodios, antes de invertir horas de grabación en un proyecto mayor.
- **Automatización de picking por color en un prototipo de laboratorio**: la política puede recoger el cubo verde de una superficie delimitada y depositarlo en una zona fija; es adecuada porque la tarea es de corto horizonte y el espacio de estados está acotado.
- **Docencia en aprendizaje por imitación**: permite mostrar en clase la grabación de teleoperación, el entrenamiento de una política ACT en 2.000 pasos y la brecha entre éxito en entrenamiento y generalización, con coste de cómputo mínimo (51,7 M de parámetros).
- **Línea base para comparar políticas**: al ser un ACT canónico con configuración conocida (AdamW, lr 1e-5, batch 2, semilla 1000), se puede usar como referencia frente a Diffusion Policy, VQ-BeT u otras políticas de LeRobot sobre el mismo dataset de 3.974 fotogramas.
- **Fine-tuning rápido sobre un objeto nuevo**: reentrenar el checkpoint con un dataset reducido (del orden de decenas de episodios) para una segunda pieza, aprovechando que el coste de un ciclo completo de entrenamiento con 51,7 M de parámetros es de minutos en una GPU de consumo.
- **Demostración pública o vídeo de divulgación**: la política se puede ejecutar en bucle con `--duration` y `--strategy.type=base` (sin grabación de episodios) para una demo continua en una feria o jornada de puertas abiertas.
- **Generación de datos para iteración**: ejecutar la política y corregir sus fallos con teleoperación es una forma práctica de recolectar casos difíciles (posiciones de objeto fuera de distribución, oclusiones) y ampliar el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito en robot real, número de ensayos ni análisis de robustez frente a cambios de iluminación, posición del objeto o distractores. Tampoco se reporta la pérdida de entrenamiento ni métricas de validación (MSE de acciones, error de trayectoria).

## Requisitos de hardware

- **Peso de los parámetros**: 51.668.614 parámetros equivalen a aproximadamente 207 MB en FP32, 103 MB en FP16/BF16 y 52 MB en INT8 teórico (no se distribuyen variantes cuantizadas).
- **VRAM estimada para inferencia**: del orden de 1-2 GB incluyendo activaciones de las dos imágenes de 480x640; los pesos por sí solos ocupan menos de 250 MB.
- **GPU recomendadas**: cualquier GPU con soporte CUDA y 4 GB o más de VRAM. Para inferencia en tiempo real, una RTX 3060/4060 o superior es suficiente; para entrenamiento, una RTX 4090, A100 o H100 reducen el ciclo de 2.000 pasos a minutos.
- **GPU de consumo**: sí cabe holgadamente en GTX 1660, RTX 3050, RTX 3060, RTX 4060, RTX 4090 y equivalentes. También es viable en CPU, aunque con menor tasa de fotogramas y riesgo de no sostener los 30 FPS de control.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial de LeRobot) sobre PyTorch es la vía documentada. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- **Latencia y throughput**: no se publican mediciones. Como referencia de diseño, el control opera a 30 FPS (33 ms por ciclo); la predicción por chunks de ACT relaja ese requisito, pero no hay datos medidos para este checkpoint.

## Comparativa con modelos similares

| Modelo | Familia | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `InakiAM/modelo_prueba_cubo_colab` (este) | ACT (LeRobot) | 51,7 M | 2 imágenes 480x640 + estado (6,) | Apache 2.0 | Pesos públicos en Hugging Face |
| Diffusion Policy (implementación LeRobot) | Política de imitación por difusión | no disponible en la información proporcionada | Imágenes + estado | Apache 2.0 (LeRobot) | Implementada en LeRobot; requiere entrenamiento propio |
| SmolVLA (LeRobot) | VLA compacto con modelo de lenguaje | no disponible en la información proporcionada | Imágenes + estado + instrucción en lenguaje natural | no disponible en la información proporcionada | Pesos públicos en Hugging Face |
| ACT original (paper 2304.13705) | ACT | no disponible en la información proporcionada | Imágenes + estado | no disponible | Sin checkpoint oficial de referencia en esta búsqueda |

Diferencias cualitativas relevantes: ACT es más ligero y rápido de entrenar que las políticas basadas en difusión (que requieren varios pasos de denoising por acción), pero suele generalizar peor ante variaciones de apariencia. SmolVLA añade condicionamiento por lenguaje natural, lo que permite múltiples tareas con un solo checkpoint; este modelo, en cambio, está especializado en una única instrucción fija.

## Limitaciones y advertencias

- **Datos de entrenamiento mínimos**: 5 episodios y 3.974 fotogramas para una sola tarea. El riesgo de sobreajuste a las posiciones, fondos e iluminación exactos del dataset es alto.
- **Sin evaluación publicada**: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar ningún nivel de fiabilidad en robot real.
- **Un solo embodiment**: la política está acoplada al robot `so_follower` y a la disposición concreta de las cámaras `Robot` y `Webcam`; cambiar la montura, la resolución o el índice de cámara invalida la observación esperada.
- **Sin comprensión de lenguaje**: la cadena de tarea es una etiqueta fija, no una instrucción interpretable. No se puede pedir al modelo una tarea distinta reformulando el texto.
- **Riesgo de alucinación en sentido robótico**: la política siempre emite una acción, aunque el cubo no esté presente o esté ocluido; no dispone de mecanismo de abstención ni de estimación de incertidumbre.
- **Sesgos y dominio acotado**: el comportamiento está sesgado hacia la distribución visual del dataset (color, textura y posición del cubo). Objetos de color similar, reflejos o cambios de iluminación pueden provocar falsos positivos.
- **Licencia**: Apache 2.0 permite uso comercial y modificación con atribución y aviso de cambios; no obstante, la licencia no cubre los riesgos físicos del despliegue.
- **Seguridad en producción**: para uso con un brazo real se requiere parada de emergencia, límites de par y velocidad, y supervisión humana durante la puesta en marcha; el modelo no implementa ninguna capa de seguridad.
- **Artefacto de nombre engañoso**: el identificador "modelo_prueba" y el autor sugieren un experimento de validación, no un modelo mantenido; no hay garantía de soporte ni de actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InakiAM/modelo_prueba_cubo_colab
- Dataset de entrenamiento: https://huggingface.co/datasets/InakiAM/cubito_verde_20261023_182545
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=InakiAM/cubito_verde_20261023_182545
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados pertinentes sobre este modelo (los resultados obtenidos eran contenido no relacionado y no verificable), por lo que los enlaces anteriores proceden de la información de Hugging Face y de la model card del autor.
