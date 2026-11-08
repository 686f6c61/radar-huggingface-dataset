# MeituanRobotics/Meituan-Robotics-0-RoboTwin

## Resumen

Meituan-Robotics-0-RoboTwin es un modelo de visión-lenguaje-acción (VLA) publicado por el equipo de robótica de Meituan, correspondiente a su modelo fundacional MR0 adaptado al benchmark RoboTwin. El modelo parte del backbone de lenguaje Qwen3.5-4B y le añade una cabeza de acción basada en MMDiT (QwenMMDiT como framework), lo que da lugar a una política robótica capaz de mapear observaciones visuales e instrucciones en lenguaje natural a secuencias de acciones motoras.

La relevancia del modelo reside en su rendimiento sobre RoboTwin 2.0, un benchmark de manipulación bimanual con 50 tareas: alcanza un 93,22% de éxito medio en el ajuste limpio (clean) y un 93,88% en el ajuste aleatorizado (randomized). Se distribuye con licencia Apache 2.0, lo que permite uso comercial, y el checkpoint completo (backbone y cabeza de acción) se empaqueta en un único fichero `checkpoints/model.pt` de aproximadamente 20,5 GB en el repositorio.

El modelo se enmarca en la familia MR0, cuyo informe técnico se titula "Meituan-Robotics-0: A Vision-Language-Action Foundation Model for Desktop Manipulation", y se apoya en el stack de entrenamiento y despliegue StarVLA. Está pensado para experimentación en manipulación robótica de escritorio y para servir de base a ajuste fino posterior en nuevos entornos (embodiments).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QwenMMDiT (backbone VLM Qwen3.5-4B + cabeza de acción MMDiT) |
| Parametros totales | no disponible (backbone base de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`checkpoints/model.pt`); incluye tokenizer, processor y configuración en `base_vlm/Qwen3.5-4B-Action/` |
| Dimensiones de acción | 14 |
| Horizonte de acción | 100 |
| Framework | QwenMMDiT |
| Tamaño del repositorio | 20,5 GB |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje y visión preentrenado (Qwen3.5-4B) con una cabeza de acción basada en MMDiT. El checkpoint `checkpoints/model.pt` contiene tanto el backbone Qwen3.5 completo como la cabeza de acción MMDiT, y se carga mediante `baseframework.from_pretrained` del paquete MR0. El directorio `base_vlm/Qwen3.5-4B-Action/` no es un segundo modelo, sino el tokenizer, el processor y la configuración de arquitectura asociados.

El modelo produce acciones de 14 dimensiones con un horizonte de 100 pasos, lo que corresponde a control bimanual de alta dimensionalidad. La normalización se realiza con la clave `new_embodiment` incluida en `dataset_statistics.json`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El proyecto se apoya en el stack StarVLA para entrenamiento y despliegue, y en Qwen, RoboTwin y RoboDojo como comunidades de referencia.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (visión-lenguaje-acción).
- Control bimanual: las acciones tienen 14 dimensiones y un horizonte de 100 pasos.
- Manipulación de escritorio en entornos simulados del benchmark RoboTwin 2.0 (50 tareas).
- Evaluación tanto en condiciones limpias como aleatorizadas (randomized), lo que indica cierta robustez ante variaciones del entorno.
- Ajuste fino posterior sobre nuevos embodiments mediante configuración de dataset y checkpoints.
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking), audio o visión extendida más allá del backbone: no disponible en la información proporcionada.

## Casos de uso

- Investigación en manipulación bimanual: sirve como política de referencia para reproducir los resultados de RoboTwin 2.0 (93,22% clean, 93,88% randomized) y comparar nuevas propuestas sobre el benchmark.
- Ajuste fino en nuevos robots de escritorio: el repositorio incluye configuración y estadísticas de normalización (`new_embodiment`), de modo que se puede adaptar el modelo a un embodiment distinto cambiando los ajustes de dataset y apuntando `framework.qwenvl.checkpoint_path` y `trainer.pretrained_checkpoint` al checkpoint descargado.
- Prototipado de tareas de pick-and-place y ensamblaje en simulación: las 50 tareas de RoboTwin permiten evaluar la política antes de trasladarla a hardware real.
- Base para pipelines de evaluación con StarVLA: el modelo se integra en el stack de despliegue StarVLA, lo que facilita montar entornos de evaluación reproducibles.
- Generación de datos sintéticos de demostración: al ejecutar la política en simulación se pueden recoger trayectorias etiquetadas para entrenar otros modelos o políticas derivadas.
- Estudio de robustez ante dominios aleatorizados: la diferencia mínima entre clean (93,22%) y randomized (93,88%) permite analizar el comportamiento bajo variaciones de iluminación, texturas o posiciones de objetos.
- Verificación de integridad de releases: el manifiesto `SHA256SUMS` permite validar cada fichero del repositorio en pipelines de CI antes de desplegar el modelo.

## Benchmarks y rendimiento

| Benchmark | Ajuste | Métrica | Resultado |
|---|---|---|---|
| RoboTwin 2.0 (50 tareas) | clean | éxito medio | 93,22% |
| RoboTwin 2.0 (50 tareas) | randomized | éxito medio | 93,88% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 20,5 GB y el checkpoint contiene el backbone Qwen3.5-4B junto con la cabeza MMDiT, por lo que se requiere una GPU con memoria suficiente para cargar el modelo completo en precisión nativa.
- GPU recomendadas: no se especifican en la información disponible. Por el tamaño del checkpoint, se orienta a GPU de datacenter (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM.
- ¿Cabe en GPU de consumo? No confirmado en la documentación; el ejemplo de carga usa `model.eval().to("cuda")` sin indicar requisitos mínimos.
- Opciones de despliegue: el cargador oficial es el paquete MR0 (`mr0.model.framework.base_framework.baseframework.from_pretrained`) sobre PyTorch/CUDA, apoyado en el stack StarVLA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meituan-Robotics-0-RoboTwin | backbone 4B + cabeza MMDiT | no disponible | 93,22% clean / 93,88% randomized en RoboTwin 2.0 | Apache 2.0 | Hugging Face + GitHub |
| StarVLA | no disponible | no disponible | no disponible | no disponible | GitHub |
| Qwen3.5-4B (backbone) | 4B | no disponible | no disponible | no disponible | Hugging Face |
| RoboTwin 2.0 (referencia de benchmark) | no aplica | no aplica | no disponible | no disponible | Documentación oficial |

No se dispone de datos comparativos de rendimiento frente a otras políticas VLA en la información proporcionada.

## Limitaciones y advertencias

- El modelo está adaptado específicamente al benchmark RoboTwin; su generalización a entornos reales o a otros simuladores no está documentada.
- No se detallan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas en la información disponible.
- La normalización depende de la clave `new_embodiment` y de la configuración de procesamiento de imagen incluida; alterar estos ajustes puede degradar el rendimiento.
- El checkpoint debe cargarse completo (backbone y cabeza de acción); `base_vlm/Qwen3.5-4B-Action/` solo contiene metadatos y no es un modelo independiente.
- La versión del código MR0 debe ser el commit `88c66793` o posterior para que el cargador funcione correctamente.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar las licencias de las dependencias (Qwen, StarVLA, RoboTwin) antes de desplegar en producción.
- No se documentan requisitos mínimos de hardware ni latencias, por lo que el dimensionamiento de infraestructura debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeituanRobotics/Meituan-Robotics-0-RoboTwin
- Repositorio de código MR0: https://github.com/Meituan-Robotics/Meituan-Robotics-0/tree/opensource/
- Guía de inicio: https://github.com/meituan/Meituan-Robotics-0/blob/main/GETTING_STARTED.md
- Commit del código: https://github.com/meituan/Meituan-Robotics-0/commit/88c667933dfc941a71c9b142eb84b716ac4f0707
- Manifiesto de checksums: https://huggingface.co/MeituanRobotics/Meituan-Robotics-0-RoboTwin/blob/main/SHA256SUMS
- Documentación de RoboTwin 2.0: https://robotwin-platform.github.io/doc/index.html
- Repositorio StarVLA: https://github.com/starVLA/starVLA
- Repositorio Qwen: https://github.com/QwenLM
- Repositorio RoboTwin: https://github.com/RoboTwin-Platform/RoboTwin
