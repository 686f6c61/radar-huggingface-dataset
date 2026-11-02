# kamus1018/bib_t2

## Resumen

`kamus1018/bib_t2` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset `kamus1018/bib` del mismo autor.

El modelo resuelve el problema del control robótico a partir de demostraciones teleoperadas: en lugar de requerir un entorno de refuerzo o un modelo del mundo, aprende directamente de pares observación-acción recogidos por un operador humano. ACT es conocido por lograr tasas de éxito altas en tareas de manipulación con relativamente pocos datos, y por su robustez frente a la varianza temporal gracias a la predicción de chunks de acciones.

Con 51.668.614 parámetros (aproximadamente 51,7 millones), un repositorio de 0,2 GB y pesos en safetensors, se trata de un modelo compacto orientado a inferencia en tiempo real sobre robots de bajo coste (por ejemplo, el brazo SO-100/SO-101 que aparece en la documentación de LeRobot). La licencia es Apache 2.0. No se dispone de información sobre idiomas, benchmarks publicados ni detalles del dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | kamus1018/bib |
| Fecha de creacion | 2026-11-02 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de aprendizaje por imitación compuesta por un encoder visual (típicamente una ResNet preentrenada que procesa las imágenes de las cámaras del robot), un encoder de estado proprioceptivo y un decoder transformer que genera un chunk de acciones futuras de una sola vez. La innovación principal frente a políticas paso a paso es la predicción de secuencias de acciones (chunking), lo que reduce el error de acumulación y suaviza el control, además de incorporar una pérdida de reconstrucción condicionada al estilo (CVAE) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realiza con LeRobot sobre el dataset `kamus1018/bib`, compuesto por episodios teleoperados. No se dispone de información pública sobre el número de episodios, el número de tokens o frames, la composición exacta del dataset, ni sobre si se aplicaron etapas de RLHF o ajuste fino adicional. El modelo se distribuye como checkpoint de política listo para evaluación con `lerobot-record` sobre un robot tipo `so100_follower`, según la documentación incluida en la model card.

## Capacidades

- Control robótico por imitación: genera chunks de acciones (posiciones articulares o comandos de efector final) a partir de observaciones visuales y de estado.
- Manipulación de objetos: entrenado para tareas de pick-and-place y manipulación sobre el setup asociado al dataset `kamus1018/bib`.
- Inferencia en tiempo real: el tamaño compacto (51,7 M de parámetros) permite ejecución en GPU de consumo e incluso en CPU para control de baja frecuencia.
- Integración con LeRobot: compatible con los comandos `lerobot-train` y `lerobot-record` para reentrenamiento y evaluación.
- Evaluación reproducible: permite grabar episodios de evaluación con prefijo `eval_` y comparar tasas de éxito.
- No soporta tool calling, agentes multi-paso, razonamiento lingüístico, visión general, audio ni capacidades multilingües; es una política de robótica, no un modelo de lenguaje.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo puede ejecutar la tarea aprendida sobre el robot SO-100/SO-101 reproduciendo los chunks de acción aprendidos del dataset `kamus1018/bib`, adecuado para prototipos de investigación con hardware de bajo coste.
- Reentrenamiento con nuevos datos propios: sirve como punto de partida para fine-tuning con `lerobot-train` sobre un dataset propio, útil para equipos que quieran adaptar la política a una tarea distinta sin partir de cero.
- Evaluación comparativa de políticas: al ser un checkpoint ACT publicado, permite medir tasas de éxito con `lerobot-record` y comparar contra otras políticas (Diffusion Policy, VQ-BeT) en el mismo entorno.
- Docencia y formación en aprendizaje por imitación: modelo pequeño y reproducible para explicar el pipeline completo de LeRobot (grabación, entrenamiento, evaluación) en cursos de robótica.
- Automatización de tareas repetitivas en celdas de montaje: con un robot de sobremesa, la política puede ejecutar ciclos de recogida y colocación de piezas pequeñas, reduciendo la programación manual de trayectorias.
- Base para investigación en chunking de acciones: permite experimentar con tamaños de chunk, frecuencias de control y arquitecturas de encoder visual, comparando el efecto sobre la tasa de éxito.
- Despliegue en entornos con recursos limitados: al ocupar 0,2 GB y 51,7 M de parámetros, puede ejecutarse en una Jetson Orin Nano o en una GPU de consumo para control embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros, ~207 MB de pesos) más el buffer de activaciones del encoder visual; en la práctica, menos de 2 GB con imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para control a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política de robótica).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá de la frecuencia de control del robot y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kamus1018/bib_t2 (ACT) | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | Implementación en LeRobot |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible | Implementación en LeRobot |
| SmolVLA | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica fiable entre estas políticas en el mismo entorno; la comparación debe realizarse empíricamente con `lerobot-record` sobre el mismo robot y dataset de evaluación.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para la tarea y el robot del dataset `kamus1018/bib`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin datos de evaluación publicados: no hay tasas de éxito ni curvas de aprendizaje que permitan estimar su fiabilidad en producción.
- Dependencia del dataset: el rendimiento está acotado por la calidad y diversidad de las demostraciones teleoperadas; no se documenta su composición ni su tamaño.
- Riesgo de sobreajuste al entorno: cambios de iluminación, fondo, posición de cámara u objetos pueden degradar el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse como modelo de texto, visión general, tool calling ni agentes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar las dependencias de LeRobot y de los pesos preentrenados del encoder visual.
- Sin información sobre sesgos: no se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo robótico el riesgo relevante es de seguridad física durante la ejecución.
- Fecha de creación futura (2026-11-02) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kamus1018/bib_t2
- Dataset asociado: https://huggingface.co/datasets/kamus1018/bib
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
