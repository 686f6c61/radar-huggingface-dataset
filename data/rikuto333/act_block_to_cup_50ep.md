# Rikuto333/act_block_to_cup_50ep

## Resumen

`Rikuto333/act_block_to_cup_50ep` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705 (Zhao et al., 2023). El modelo aprende a predecir secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. Ha sido entrenado y publicado mediante la librería LeRobot de Hugging Face.

La política está especializada en una única tarea: coger un bloque rojo y colocarlo dentro de un vaso de papel. El robot objetivo es un `so_follower` (brazo de la familia SO-100/SO-101 de LeRobot) equipado con una cámara en la muñeca. El modelo consume el estado articular (6 dimensiones) y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones a 30 FPS.

Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia es la de un ejemplo reproducible de entrenamiento de políticas visuomotoras con LeRobot: dataset público, configuración de entrenamiento documentada y comandos de despliegue listos para usar. No obstante, carece de licencia declarada, de resultados de evaluación y de datos sobre su robustez fuera del entorno de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), política visuomotora de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que procesa la observación actual (estado articular de 6 dimensiones e imagen de muñeca de 3x480x640) y predice un chunk de acciones futuras de dimensión 6. La predicción por chunks, en lugar de paso a paso, es la innovación central del método: mitiga el error compounding típico de las políticas de imitación y permite un control más suave. El artículo original introduce además el *temporal ensembling*, que agrega predicciones de chunks solapados para suavizar la trayectoria.

El entrenamiento se realizó sobre el dataset `block_to_cup_v1`, con 50 episodios y 24.000 frames a 30 FPS (unos 13,3 minutos de datos teleoperados). La configuración documentada es de 5.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot 0.7.0. No se especifica en la información disponible si hubo aumento de datos, número total de tokens vistos ni técnicas de regularización adicionales.

## Capacidades

- Generación de acciones de control para un brazo robótico `so_follower` con 6 grados de libertad.
- Percepción visual monocámara (imagen de muñeca) combinada con propriocepción (estado articular).
- Ejecución de la tarea específica "coger el bloque rojo y colocarlo en el vaso de papel".
- Predicción de chunks de acción que permiten movimientos suaves y coherentes.
- Inferencia en tiempo real a 30 FPS según la frecuencia del dataset de entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No es multilingüe ni procesa texto; no tiene modo thinking, visión general ni audio.

## Casos de uso

- Replicación de experimentos de imitación: sirve como referencia reproducible para validar un pipeline completo de LeRobot (grabación, entrenamiento, rollout) antes de abordar tareas propias.
- Docencia y formación en robótica de manipulación: el modelo y su dataset permiten ilustrar el flujo de ACT con un caso sencillo y bien acotado.
- Benchmark interno de hardware: al ser una tarea corta y conocida, puede usarse para comparar latencia y fiabilidad entre distintos brazos SO o configuraciones de cámara.
- Base para fine-tuning: partiendo de estos pesos, se puede adaptar la política a variantes de la tarea (otro objeto, otro contenedor) con un dataset pequeño adicional.
- Pruebas de integración de LeRobot: valida comandos `lerobot-rollout` y `lerobot-train` en un entorno real antes de desplegar políticas más complejas.
- Demostraciones de manipulación pick-and-place: adecuado para vídeos o talleres donde se necesita una política funcional con requisitos mínimos de cómputo.
- Estudio de robustez y sesgos de políticas de imitación: al no haber evaluación publicada, permite medir por cuenta propia la sensibilidad a cambios de iluminación, posición del objeto o cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 200 MB, por lo que en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella es la captura de cámara y el bucle de control, no el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna; también podría ejecutarse en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el dataset y el despliegue están pensados para 30 FPS, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Rikuto333/act_block_to_cup_50ep` | 51,7 M | no aplica | Pick-and-place bloque a vaso | no disponible | Hugging Face (LeRobot) |
| Otros checkpoints ACT en LeRobot Hub | variable | no aplica | Tareas de manipulación diversas | variable según autor | Hugging Face |
| Políticas Diffusion Policy (referencia) | variable | no aplica | Manipulación visuomotora | variable | Repositorios de investigación |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; la model card indica "More Information Needed".
- Sin evaluación publicada: no hay tasa de éxito medida, ni número de ensayos, ni condiciones de prueba.
- Especialización extrema: solo ejecuta la tarea "coger el bloque rojo y colocarlo en el vaso de papel"; fuera de ese dominio no se garantiza comportamiento útil.
- Entrenamiento con solo 50 episodios (24.000 frames): riesgo alto de sobreajuste al entorno, posiciones e iluminación del dataset.
- Dependencia de la cámara de muñeca y de la configuración exacta del robot `so_follower`; cambios de calibración, montaje o resolución pueden degradar el rendimiento.
- No es un modelo de lenguaje: no procesa texto, no razona simbólicamente y no admite instrucciones en lenguaje natural más allá del identificador de tarea.
- Riesgo de alucinación en el sentido de acciones incoherentes o inseguras si se ejecuta fuera de las condiciones de entrenamiento; requiere supervisión y paradas de seguridad en hardware real.
- Sin datos sobre sesgos ni sobre comportamiento ante objetos distintos al bloque rojo; no se debe desplegar en entornos no controlados sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rikuto333/act_block_to_cup_50ep
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Dataset `block_to_cup_v1`: https://huggingface.co/datasets/block_to_cup_v1
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=block_to_cup_v1
