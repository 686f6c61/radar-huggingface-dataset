# nvidia/GR00T-N1.7-SimplerEnv-Fractal

## Resumen

GR00T-N1.7-SimplerEnv-Fractal es un modelo fundacional de NVIDIA para robótica humanoide, especializado en razonamiento viso-lenguaje y ejecución de tareas de manipulación. Forma parte de la familia Isaac GR00T N1.7, que incluye cuatro variantes post-entrenadas sobre distintos conjuntos de datos (Bridge, Fractal, DROID y LIBERO). Esta variante concreta se ha post-entrenado sobre el conjunto Fractal dentro del entorno de simulación SimplerEnv, lo que la orienta a la evaluación y el desarrollo de políticas de manipulación en escenarios simulados.

El modelo es cross-embodiment: acepta entradas multimodales (imágenes de cámara RGB, instrucciones en lenguaje natural y propiocepción del robot) y predice secuencias de acciones (action chunks) mediante un transformer de flow matching. Con 3.144 millones de parámetros y un backbone viso-lenguaje Cosmos-Reason2-2B, está pensado para que investigadores y desarrolladores puedan hacer post-entrenamiento con datos reales o sintéticos adaptados a su robot o tarea específica.

Su relevancia actual radica en que NVIDIA libera una base abierta (bajo NVIDIA Open Model License) para investigación en robótica generalista, reduciendo el coste de entrenamiento desde cero y facilitando la experimentación con políticas de manipulación en entornos simulados como SimplerEnv y en robots humanoides reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow matching (DiT con AdaLN) sobre backbone viso-lenguaje Cosmos-Reason2-2B; encoders SigLIP2 (visión) y T5 (texto); MLP para propiocepción y acciones |
| Parametros totales | 3.144.016.000 (aproximadamente 3.000 millones según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se procesan mediante el encoder T5) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un backbone viso-lenguaje Cosmos-Reason2-2B con un transformer de flow matching para la generación de acciones. Las imágenes RGB se procesan mediante un vision transformer SigLIP2 preentrenado; el texto se codifica con un transformer T5; y la propiocepción del robot se codifica con un MLP indexado por el identificador de embodiment, con padding a una longitud máxima configurable para admitir dimensiones variables. Las acciones se codifican y las velocidades se decodifican mediante MLPs específicos por embodiment. El transformer de flow matching se implementa como un diffusion transformer (DiT) con condicionamiento del paso de difusión mediante adaptive layernorm (AdaLN), y modela un chunk de acciones condicionado a visión, lenguaje y propiocepción.

El modelo base se ha post-entrenado sobre el conjunto Fractal en SimplerEnv. Según la model card, la variante Fractal referencia el dataset `IPEC-COMMUNITY/bridge_orig_lerobot`, una conversión en formato LeRobot de BridgeData V2, con 60.096 trayectorias de manipulación robótica en 24 entornos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO. El consumo energético estimado del entrenamiento se reporta como 41.288 kWh (16,949 tCO2e), calculado sobre 64 nodos GB200 con 4 GPUs por nodo durante 120 horas.

## Capacidades

- Razonamiento viso-lenguaje aplicado a robótica: interpreta imágenes de cámara e instrucciones en lenguaje natural para generar acciones de manipulación.
- Generación de secuencias de acciones (action chunks) mediante flow matching condicionado a visión, lenguaje y propiocepción.
- Modelo cross-embodiment: soporta múltiples morfologías de robot mediante MLPs específicos por embodiment y padding de propiocepción a longitud configurable.
- Post-entrenamiento con datos reales o sintéticos: los desarrolladores pueden adaptar el modelo a su robot o tarea concreta.
- Ejecución de tareas de manipulación en entornos simulados (SimplerEnv) y potencial despliegue en robots humanoides reales.
- Procesamiento multimodal de entrada: RGB (SigLIP2), texto (T5) y propiocepción (MLP).
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito.

## Casos de uso

- Investigación en robótica generalista: usar la variante Fractal como punto de partida para evaluar políticas de manipulación en SimplerEnv, aprovechando el post-entrenamiento sobre BridgeData V2 (60.096 trayectorias, 24 entornos) para comparar con otras variantes de la familia N1.7.
- Post-entrenamiento con datos propios: adaptar el modelo a un robot humanoide específico recopilando demostraciones teleoperadas y ajustando los MLPs de embodiment y el transformer de acciones.
- Desarrollo de algoritmos de manipulación: integrar el modelo en pipelines de investigación para generar action chunks condicionados a instrucciones en lenguaje natural y observaciones visuales.
- Evaluación comparativa de datasets: contrastar el rendimiento de la variante Fractal frente a las variantes Bridge, DROID y LIBERO de la misma familia para seleccionar la base más adecuada a una tarea.
- Prototipado en simulación antes de despliegue real: validar políticas en SimplerEnv para reducir el riesgo y el coste de experimentación directa en hardware físico.
- Formación y docencia en IA robótica: emplear un modelo fundacional abierto con backbone Cosmos-Reason2-2B para ilustrar arquitecturas de flow matching aplicadas a control robótico.
- Aceleración de I+D en startups: reducir el coste de entrenamiento desde cero partiendo de un modelo preentrenado con licencia abierta para uso comercial y no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3.144 millones de parámetros, una estimación orientativa en FP16 sería de aproximadamente 6-7 GB solo para pesos, sin contar encoders ni overhead, pero no se confirma en la documentación.
- GPU recomendadas: no disponible de forma explícita; el entrenamiento reportado se realizó sobre nodos NVIDIA GB200 (4 GPUs por nodo).
- ¿Cabe en GPU consumer?: no confirmado en la información disponible.
- Opciones de despliegue: el modelo se distribuye a través del repositorio GitHub de Isaac GR00T (https://github.com/NVIDIA/Isaac-GR00T); no se detallan en la información disponible soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GR00T-N1.7-SimplerEnv-Fractal | 3.144 M | no disponible | NVIDIA Open Model License | Manipulación en SimplerEnv (Fractal) |
| GR00T-N1.7-SimplerEnv-Bridge | no disponible | no disponible | NVIDIA Open Model License | Manipulación en SimplerEnv (Bridge) |
| GR00T-N1.7-Droid | no disponible | no disponible | NVIDIA Open Model License | Manipulación con DROID (~76.000 trayectorias) |
| GR00T-N1.7-Libero | no disponible | no disponible | NVIDIA Open Model License | Manipulación lifelong con LIBERO (130 tareas) |

Las cuatro variantes comparten la misma arquitectura y backbone Cosmos-Reason2-2B; difieren en el conjunto de post-entrenamiento. No se dispone de datos de benchmarks que permitan comparar su rendimiento relativo.

## Limitaciones y advertencias

- Modelo especializado en robótica: no es un modelo de propósito general para texto, código o matemáticas; su salida son acciones de robot, no texto libre.
- El post-entrenamiento específico sobre Fractal en SimplerEnv limita la generalización fuera de ese dominio; para otras tareas se recomienda usar la variante correspondiente o hacer post-entrenamiento adicional.
- Riesgo de alucinación en la generación de acciones: como todo modelo generativo, puede producir trayectorias no válidas o inseguras en entornos reales; se requiere validación en simulación antes del despliegue físico.
- Idiomas soportados no documentados: aunque el encoder T5 admite múltiples idiomas, no se especifica el soporte multilingüe real del modelo.
- Licencia NVIDIA Open Model License: permite uso comercial y no comercial según los términos del acuerdo, pero conviene revisar las condiciones completas antes de producción.
- No se documentan sesgos específicos ni limitaciones de contexto en la información disponible.
- El modelo está construido sobre NVIDIA Cosmos; su uso puede estar sujeto a las condiciones adicionales de dicho componente.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/GR00T-N1.7-SimplerEnv-Fractal
- Colección GR00T N1.7: https://huggingface.co/collections/nvidia/gr00t-n17
- GitHub Isaac GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Web oficial Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- White paper (arXiv:2503.14734): https://arxiv.org/abs/2503.14734
- Backbone Cosmos-Reason2-2B: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset Bridge (LeRobot): https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot
- Dataset DROID: https://droid-dataset.github.io/
- Dataset LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
