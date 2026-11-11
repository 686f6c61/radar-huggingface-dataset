# Albertvh97/smolvla-hackathon

## Resumen

SmolVLA — Hackathon es un checkpoint de política robótica (vision-language-action, VLA) entrenado por Albertvh97 en el marco de un proyecto de hackathon dentro de Physical AI Studio. Se apoya en el backbone vision-lenguaje SmolVLM2-500M-Video-Instruct de Hugging Face y se distribuye como checkpoint nativo de PyTorch Lightning, no como directorio `save_pretrained` de LeRobot ni como artefacto de inferencia exportado. El modelo está etiquetado para la pipeline `robotics` y resuelve el problema de mapear observaciones visuales y consignas de lenguaje a secuencias de acciones de bajo nivel para control de robots manipuladores.

El interés del artefacto es fundamentalmente práctico y de investigación: permite reproducir y auditar el estado de entrenamiento (paso global 6025, época 4, pérdida de validación registrada de aproximadamente 0,2825) y sirve como punto de partida para experimentos de VLA de pequeño tamaño sobre hardware modesto, dado que el backbone tiene 500 millones de parámetros. No obstante, el propio autor advierte de que no se ha realizado validación independiente de inferencia, paridad de exportación ni seguridad en robot real, por lo que su uso en producción requiere conversión, verificación y pruebas controladas.

La información pública disponible es escasa: no se declaran licencia, idiomas soportados ni resultados de benchmarks, y el repositorio (1,5 GB) contiene únicamente pesos, hiperparámetros y métricas de entrenamiento. Esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos de Hugging Face, marcando como "no disponible" todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en backbone SmolVLM2-500M-Video-Instruct, con cabeza de política para predicción de acciones; entrenada con PyTorch Lightning |
| Parametros totales | No disponible (el backbone declarado tiene 500M; el total del checkpoint no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no se especifica nueva concesión de licencia; sujeto a términos de los datos de entrenamiento y del modelo upstream) |
| Formato de pesos | `model.ckpt` (checkpoint de PyTorch Lightning), más `hparams.yaml` y `metrics.csv`; no es un directorio LeRobot `save_pretrained` ni un artefacto de inferencia exportado |

## Arquitectura y entrenamiento

El modelo sigue el paradigma VLA: un backbone vision-lenguaje (SmolVLM2-500M-Video-Instruct) procesa observaciones visuales y una instrucción en lenguaje natural, y una cabeza de política produce acciones motoras. La dimensión de acción es 6 y el tamaño de chunk de acción es 50, es decir, la política predice bloques de 50 acciones por paso de inferencia, lo que reduce la frecuencia de reevaluación del modelo durante el control. Según la model card, LoRA y SnapFlow están desactivados, por lo que el ajuste se realizó sobre el modelo completo del backbone más la cabeza de política, no mediante adaptadores de bajo rango.

El entrenamiento se registra hasta el paso global 6025 (época 4), con una pérdida de validación de aproximadamente 0,2825. El autor subraya explícitamente que esta cifra es una pérdida de validación y no una medida de tasa de éxito en robot. El repositorio incluye `hparams.yaml` con los hiperparámetros de la política y las estadísticas de normalización del dataset, lo que permite auditar la configuración, pero no se detallan el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones de 6 dimensiones a partir de observaciones visuales y consignas de lenguaje.
- Predicción por chunks de acción: emite bloques de 50 acciones, adecuado para políticas de control continuo.
- Comprensión visio-lingüística heredada del backbone SmolVLM2-500M-Video-Instruct, orientado a vídeo e instrucciones.
- Capacidad de reentrenamiento y ajuste fino: al ser un checkpoint de PyTorch Lightning con hiperparámetros y métricas, permite reanudar o auditar el entrenamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio como producto final: no disponible; la visión forma parte del pipeline de entrada de la política, pero no se documenta como capacidad de salida.

## Casos de uso

- Reproducción de experimentos de VLA en investigación: cargar el checkpoint en un entorno Physical AI Studio/physicalai-train compatible permite reanudar el entrenamiento desde el paso 6025 y comparar curvas de pérdida con `metrics.csv`.
- Ajuste fino sobre un dataset propio de manipulación: partiendo de un backbone de 500M de parámetros, se puede reentrenar la política con las estadísticas de normalización documentadas en `hparams.yaml`, siempre que el robot, el orden de cámaras y las unidades de acción coincidan con el setup original.
- Docencia y formación en robótica aprendida: el tamaño reducido del backbone y el formato de checkpoint facilitan demostraciones en laboratorio sobre GPU de gama media, con validación en entorno simulado o controlado.
- Auditoría de políticas preentrenadas: el repositorio incluye pesos, hiperparámetros y métricas, lo que permite inspeccionar la configuración de entrenamiento y detectar discrepancias antes de cualquier despliegue.
- Base para conversión a formatos de inferencia: el checkpoint puede servir como origen para una conversión a LeRobot `save_pretrained` o a un artefacto de runtime, paso previo obligatorio para integrarlo en pipelines de control reales.
- Prototipado de tareas pick-and-place en laboratorio: con la dimensión de acción de 6 y chunks de 50, encaja en manipuladores de 6 grados de libertad en entornos controlados, tras validar la paridad de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica registrada es la pérdida de validación de aproximadamente 0,2825 en el paso global 6025 (época 4), que el autor indica expresamente que no equivale a una tasa de éxito en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 1,5 GB, lo que sugiere que el checkpoint completo cabe en GPU consumer de 8 GB o más, pero no se documenta el consumo en runtime.
- GPU recomendadas: no disponibles; por el tamaño del backbone (500M), una RTX 4090 o una A100 no serían necesarias para inferencia, aunque el requisito real depende del pipeline de Physical AI Studio.
- GPU consumer: probablemente compatible con tarjetas de 8-16 GB, sin confirmación oficial.
- Opciones de despliegue: requiere un entorno Physical AI Studio/physicalai-train compatible; para vLLM, llama.cpp, Ollama o TGI sería necesaria una conversión previa, que el autor indica como necesaria para otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| SmolVLA — Hackathon (Albertvh97) | No disponible (backbone 500M) | No disponible | VLA sobre SmolVLM2-500M-Video-Instruct | No disponible | Checkpoint PyTorch Lightning |
| SmolVLA (modelo de referencia de LeRobot) | No disponible en esta informacion | No disponible | VLA para robótica de bajo coste | No disponible en esta informacion | `save_pretrained` de LeRobot |
| SmolVLM2-500M-Video-Instruct (Hugging Face) | 500M | No disponible en esta informacion | Vision-lenguaje para vídeo e instrucciones | No disponible en esta informacion | Safetensors |

La comparativa se limita a los modelos citados en la información proporcionada; no se dispone de datos de rendimiento comparables para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- El artefacto es un checkpoint de Physical AI Studio, no un directorio LeRobot `save_pretrained` ni un artefacto de inferencia exportado; requiere conversión para otros formatos.
- No se realizó validación independiente de inferencia, de paridad de exportación ni de seguridad en robot real.
- El robot, el orden de cámaras, las unidades de acción y la normalización deben coincidir exactamente con el setup de entrenamiento; cualquier desviación invalida la política.
- La pérdida de validación de 0,2825 no es una medida de tasa de éxito ni garantiza comportamiento correcto en el mundo físico.
- No se especifica licencia; deben revisarse los términos de los datos de entrenamiento y del modelo upstream (SmolVLM2-500M-Video-Instruct) antes de cualquier reutilización, incluido el uso comercial.
- No se documentan sesgos conocidos, riesgo de alucinación, limitaciones de contexto o de idioma.
- Antes de cualquier despliegue debe validarse en un entorno controlado y con protocolos de seguridad física.

## Enlaces

- Hugging Face: https://huggingface.co/Albertvh97/smolvla-hackathon
- Backbone declarado: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Physical AI Studio: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
