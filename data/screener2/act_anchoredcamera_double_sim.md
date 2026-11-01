# Screener2/act_AnchoredCamera_double_sim

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación robótica. Este repositorio concreto, `Screener2/act_AnchoredCamera_double_sim`, es una política ACT entrenada con la librería LeRobot de Hugging Face sobre un dataset propio de 30 episodios y 12.576 fotogramas a 30 FPS, correspondiente a un robot `so_follower` con una cámara cenital (`overhead`).

El modelo consume un vector de estado de 6 dimensiones y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es una política ligera orientada a control robótico en tiempo real, no un modelo de lenguaje. Su relevancia es acotada: sirve como referencia reproducible de un entrenamiento ACT completo con LeRobot 0.5.2 y como punto de partida para experimentos de imitación en entornos simulados.

No se dispone de información sobre idiomas, benchmarks de rendimiento ni resultados de evaluación en robot real; la model card indica explícitamente que no se han proporcionado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el método ACT descrito en el paper arXiv:2304.13705: un transformer que procesa observaciones multimodales (estado proprioceptivo de 6 dimensiones e imagen cenital de 3x480x640) y genera un chunk de acciones de 6 dimensiones. El entrenamiento se realizó con LeRobot 0.5.2 durante 100.000 pasos, con batch size de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000.

El dataset de entrenamiento (`Screener2/AnchoredCamera_double_sim`) contiene 30 episodios y 12.576 fotogramas a 30 FPS, con una única tarea etiquetada como "0". No se especifica la composición del dataset, si hubo aumentación de datos, ni detalles sobre el entorno simulado o real de captura. Tampoco se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores, algo esperable en una política de imitación supervisada.

## Capacidades

- Generación de chunks de acciones de 6 dimensiones a partir de estado e imagen cenital.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Control de robot tipo `so_follower` con una cámara `overhead`.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia base.
- Entrenamiento reproducible con `lerobot-train` y el tipo de política `act`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No es un modelo multilingüe ni generativo de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Control de un robot `so_follower` en tareas de manipulación simulada: la política recibe estado de 6 dimensiones e imagen cenital y emite acciones de 6 dimensiones, adecuada para experimentos de imitación en entornos controlados.
- Reproducción de experimentos ACT con LeRobot: sirve como referencia de un entrenamiento completo (100.000 pasos, batch 8, lr 1e-5) para comparar configuraciones y semillas.
- Punto de partida para fine-tuning con datos propios: al estar en formato safetensors y licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre nuevos datasets.
- Validación de pipelines de rollout: útil para probar `lerobot-rollout` con `--strategy.type=base` y verificar la integración de cámaras y puertos del robot.
- Docencia y prototipado en robótica de imitación: el tamaño reducido (0,2 GB, 51,7 M de parámetros) permite iterar rápido en laboratorios con recursos limitados.
- Benchmark interno de políticas ACT: al no publicar resultados de evaluación, puede usarse como baseline propio midiendo tasas de éxito en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión completa el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM es suficiente para la política, aunque el rendimiento real depende del pipeline de visión y del robot.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch y CUDA según la documentación de LeRobot; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_AnchoredCamera_double_sim | 51.668.614 | no disponible | sin evaluación publicada | apache-2.0 | Hugging Face (17 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | no disponible | según repositorio | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no disponible | no disponible | según repositorio | Hugging Face / LeRobot |
| Políticas VQ-BeT | no disponible | no disponible | no disponible | según repositorio | Hugging Face / LeRobot |

No se dispone de datos comparativos verificables de parámetros, contexto ni rendimiento para las alternativas; la comparación se limita a la categoría (políticas de imitación en LeRobot) y a la licencia.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real ni simulado; la model card indica explícitamente que no se han proporcionado.
- Dataset muy pequeño (30 episodios, 12.576 fotogramas) y una única tarea ("0"), lo que limita la generalización.
- Entrenado para un robot `so_follower` con una cámara `overhead` concreta; cambiar la configuración de cámaras o el robot puede invalidar la política.
- Riesgo de sobreajuste al entorno de captura y a las posiciones de objetos del dataset.
- No se documentan sesgos, pero al ser una política de imitación hereda los sesgos y errores de las demostraciones de teleoperación.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de documentación sobre el dataset hace recomendable una validación propia antes de producción.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código, matemáticas ni tareas multimodales generales.
- No se especifican requisitos de hardware ni latencias, por lo que el despliegue en tiempo real requiere medición empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Screener2/act_AnchoredCamera_double_sim
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/AnchoredCamera_double_sim
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/AnchoredCamera_double_sim
