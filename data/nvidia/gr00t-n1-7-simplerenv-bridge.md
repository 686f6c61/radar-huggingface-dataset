# nvidia/GR00T-N1.7-SimplerEnv-Bridge

## Resumen

GR00T N1.7 – SimplerEnv Bridge es un modelo fundacional de robótica desarrollado por NVIDIA, especializado en razonamiento y ejecución de habilidades para robots humanoides. Se trata de la variante de tamano medio de la familia Isaac GR00T N1.7, construida sobre codificadores de visión y lenguaje preentrenados y un transformer de acciones con *flow matching*. Esta versión concreta ha sido post-entrenada con el conjunto de datos Bridge (BridgeData V2) en el entorno de simulación SimplerEnv, lo que la orienta a tareas de manipulación condicionadas por lenguaje e imagen.

El modelo resuelve el problema de la generalización entre morfologías (*cross-embodiment*): acepta entradas multimodales (lenguaje, imágenes RGB y propiocepción del robot) y produce *chunks* de acciones de control. Con 3.144 millones de parámetros según los pesos en safetensors y un repositorio de 35,7 GB, está pensado para que investigadores y desarrolladores puedan hacer *post-training* con datos reales o sintéticos de su propio robot o tarea.

Su relevancia actual radica en que NVIDIA lo publica bajo la NVIDIA Open Model License, permitiendo uso comercial y no comercial, y en que forma parte de una familia de cuatro variantes (Bridge, Fractal, DROID y LIBERO) que cubren distintos regímenes de datos: desde simulación hasta manipulación "in-the-wild". El modelo usa `nvidia/Cosmos-Reason2-2B` como backbone visión-lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language backbone (Cosmos-Reason2-2B) + flow matching action transformer (DiT con AdaLN); codificadores SigLIP2 (visión) y T5 (texto); MLP por embodiment para propiocepción y acciones |
| Parametros totales | 3.144.016.000 (3,144 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el texto se codifica con T5; instrucciones en lenguaje natural) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un backbone visión-lenguaje (`nvidia/Cosmos-Reason2-2B`) con un transformer de acciones basado en *flow matching* implementado como Diffusion Transformer (DiT), donde el condicionamiento del paso de difusión se realiza mediante adaptive layernorm (AdaLN). Las imágenes RGB se procesan con un Vision Transformer preentrenado SigLIP2; el texto se codifica con un transformer T5; y la propiocepción del robot se codifica con un MLP indexado por el ID de *embodiment*, con padding a una longitud máxima configurable para admitir dimensiones variables. Las acciones se codifican y las predicciones de velocidad se decodifican mediante un MLP distinto por cada *embodiment*, lo que habilita el comportamiento *cross-embodiment*.

El post-entrenamiento de esta variante se realizó sobre el Bridge Dataset en SimplerEnv: una conversión al formato LeRobot de BridgeData V2, con 60.096 trayectorias de manipulación robótica recogidas en 24 entornos. La model card no detalla el número de tokens de entrenamiento, la composición completa del dataset de preentrenamiento ni si se aplicaron técnicas de RLHF o DPO. El cómputo declarado para el entrenamiento asciende a 41.288 kWh, con una estimación de 16,949 tCO2e, calculado a partir de 64 nodos GB200 con 4 GPU por nodo durante 120 horas.

## Capacidades

- Razonamiento y ejecución de tareas de manipulación robótica condicionadas por instrucciones en lenguaje natural e imágenes RGB.
- Generación de *chunks* de acciones (predicción de velocidades) para control de robots humanoides.
- Modelo *cross-embodiment*: soporta múltiples morfologías de robot mediante MLP específicos por *embodiment* y padding de propiocepción de dimensión variable.
- Entrada multimodal: lenguaje, imágenes de cámara y propiocepción del robot.
- Capacidad de *post-training* con datos reales o sintéticos para adaptación a un robot o tarea concretos.
- Integración con el ecosistema Isaac GR00T (repositorio GitHub y colección de Hugging Face).
- No se documentan en la información disponible capacidades de *tool calling*, agentes multi-paso, audio ni modo *thinking* explícito.

## Casos de uso

- Investigación en robótica humanoide: usar el modelo como base para experimentar con *post-training* sobre datos propios de un robot concreto, aprovechando su naturaleza *cross-embodiment* y su backbone Cosmos-Reason2-2B.
- Manipulación en simulación con SimplerEnv: evaluar políticas de manipulación condicionadas por lenguaje sobre el conjunto Bridge, ya que esta variante está específicamente post-entrenada con BridgeData V2 en 24 entornos.
- Desarrollo de habilidades de manipulación condicionadas por lenguaje: integrar el modelo en un *pipeline* que reciba instrucciones en lenguaje natural e imágenes de cámara y emita acciones de control para tareas de pick-and-place y similares.
- Aceleración de I+D en startups de robótica: partir de un modelo fundacional preentrenado por NVIDIA para reducir el coste de entrenamiento desde cero, adaptándolo mediante *post-training* a la morfología del robot propio.
- *Benchmarking* de políticas robóticas: utilizar la variante Bridge como referencia reproducible en experimentos comparativos dentro de SimplerEnv frente a otras variantes de la familia (Fractal, DROID, LIBERO).
- Prototipado de sistemas de control multimodal: emplear la combinación SigLIP2 + T5 + DiT para construir *pipelines* de percepción-acción que combinen visión, lenguaje y estado propioceptivo del robot.
- Docencia y formación: servir como material didáctico para estudiar arquitecturas de *flow matching* aplicadas a robótica y el paradigma *cross-embodiment*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 3,144 B parámetros en precisión FP16 requeriría del orden de 6,3 GB solo para los pesos, a lo que habría que sumar el backbone visión-lenguaje y los buffers de activación; no se confirman cifras oficiales.
- GPU recomendadas: no disponible. El entrenamiento declarado se realizó con nodos NVIDIA GB200 (4 GPU por nodo, 64 nodos), lo que indica una infraestructura de centro de datos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el ecosistema de referencia es el repositorio Isaac-GR00T).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GR00T N1.7 – SimplerEnv Bridge (este) | 3,144 B | no disponible | NVIDIA Open Model License | Post-entrenado con BridgeData V2 en SimplerEnv |
| GR00T N1.7 – SimplerEnv Fractal | no disponible | no disponible | NVIDIA Open Model License | Post-entrenado con Fractal en SimplerEnv |
| GR00T N1.7 – DROID | no disponible | no disponible | NVIDIA Open Model License | Post-entrenado con DROID (~76.000 trayectorias, 564 escenas) |
| GR00T N1.7 – LIBERO | no disponible | no disponible | NVIDIA Open Model License | Post-entrenado con LIBERO (130 tareas) |

Las cuatro variantes comparten la misma arquitectura base y se diferencian únicamente en el conjunto de datos de *post-training*. No se dispone de información sobre otros modelos fundacionales de robótica comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en manipulación robótica; no es un modelo de propósito general para texto, código o matemáticas.
- El *post-training* con BridgeData V2 limita su rendimiento fuera de los 24 entornos y las condiciones de recogida de ese conjunto; la generalización a escenas reales distintas no está garantizada.
- No se documentan evaluaciones de sesgo, alucinación ni robustez; en robótica, los errores de política pueden traducirse en acciones físicas incorrectas o inseguras.
- La licencia NVIDIA Open Model License permite uso comercial y no comercial, pero impone condiciones específicas que deben revisarse antes de un despliegue en producción.
- No se especifican los idiomas soportados para las instrucciones de lenguaje natural; el codificador T5 determina las capacidades lingüísticas reales.
- No se dispone de información sobre cuantización, latencia ni requisitos de hardware para inferencia, lo que dificulta planificar un despliegue.
- El modelo se distribuye como pesos safetensors de 35,7 GB; su integración requiere el ecosistema Isaac-GR00T y no se documentan alternativas de despliegue estándar.

## Enlaces

- [Hugging Face: nvidia/GR00T-N1.7-SimplerEnv-Bridge](https://huggingface.co/nvidia/GR00T-N1.7-SimplerEnv-Bridge)
- [Repositorio GitHub Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
- [Página oficial Isaac GR00T](https://developer.nvidia.com/isaac/gr00t)
- [White paper GR00T N1 (arXiv:2503.14734)](https://arxiv.org/abs/2503.14734)
- [Colección GR00T N1.7 en Hugging Face](https://huggingface.co/collections/nvidia/gr00t-n17)
- [Backbone visión-lenguaje: nvidia/Cosmos-Reason2-2B](https://huggingface.co/nvidia/Cosmos-Reason2-2B)
- [Dataset de post-entrenamiento: IPEC-COMMUNITY/bridge_orig_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot)
- [Licencia NVIDIA Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/)
- [Dataset DROID](https://droid-dataset.github.io/)
- [Benchmark LIBERO](https://github.com/Lifelong-Robot-Learning/LIBERO)
