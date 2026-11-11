# nvidia/GR00T-N1.7-DROID

## Resumen

NVIDIA Isaac GR00T N1.7 es un modelo fundacional abierto para razonamiento y habilidades de robots humanoides de proposito general. Lo desarrolla NVIDIA y se distribuye bajo la NVIDIA Open Model License. El modelo toma entradas multimodales (lenguaje e imagenes) y genera trozos de acciones motoras condicionadas por vision, lenguaje y propiocepcion, lo que permite ejecutar tareas de manipulacion en entornos diversos. La variante DROID que nos ocupa ha sido post-entrenada con el dataset DROID.

Tecnicamente, GR00T N1.7 combina un backbone vision-language basado en Cosmos-Reason2-2B con un transformer de acciones por flow matching implementado como diffusion transformer (DiT). El modelo cuenta con aproximadamente 3.144 millones de parametros segun los pesos en safetensors (la model card declara 3.000 millones) y el repositorio ocupa 6.9 GB. Es la version de tamano medio de la familia GR00T N1.7, que incluye variantes post-entrenadas para SimplerEnv Bridge, SimplerEnv Fractal, DROID y LIBERO.

Su relevancia actual radica en que es un modelo cross-embodiment: puede adaptarse mediante post-entrenamiento a distintos robots humanoides y tareas concretas, con datos reales o sinteticos. Esto reduce el coste de desarrollo en robotica y permite a investigadores y empresas reutilizar un modelo fundacional en lugar de entrenar desde cero. Esta pensado para uso comercial y no comercial segun la licencia de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language backbone (Cosmos-Reason2-2B) + flow matching action transformer (DiT) con AdaLN; encoders SigLIP2 (vision) y T5 (texto); MLP por embodiment para propiocepcion y acciones |
| Parametros totales | 3.144.016.000 (segun safetensors); la model card declara 3.000.000.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone VLM procesa lenguaje natural; no se detalla lista de idiomas) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno descrito en el white paper de GR00T N1 (arXiv:2503.14734). Los fotogramas RGB de camara se procesan con un vision transformer preentrenado (SigLIP2); el texto se codifica con un transformer preentrenado (T5); y la propiocepcion del robot se codifica con un perceptron multicapa indexado por el identificador de embodiment, con padding a una longitud maxima configurable para manejar dimensiones variables. Las acciones se codifican y las predicciones de velocidad se decodifican mediante un MLP por cada embodiment unico. El transformer de flow matching se implementa como diffusion transformer (DiT), con el condicionamiento del paso de difusion mediante adaptive layernorm (AdaLN). El backbone vision-language de esta version N1.7 es Cosmos-Reason2-2B.

En cuanto al entrenamiento, la model card no detalla el numero total de tokens ni la composicion completa del dataset de preentrenamiento. La variante DROID se ha post-entrenado con el dataset DROID, un conjunto de manipulacion robotica "in-the-wild" de aproximadamente 76.000 trayectorias de demostracion (unas 350 horas) recogidas en 564 escenas distintas de 52 edificios, cubriendo 86 tareas de manipulacion a partir de instrucciones en lenguaje natural. La model card incluye una estimacion de computo de entrenamiento de 41.288 kWh y 16,949 tCO2e, calculada sobre 64 nodos GB200 con 4 GPUs por nodo a 1.200 W durante 120 horas. No se especifica en la informacion disponible si hubo RLHF o DPO.

## Capacidades

- Razonamiento y control motor para robots humanoides: genera trozos de acciones (action chunks) condicionados por vision, lenguaje y propiocepcion.
- Manipulacion guiada por instrucciones en lenguaje natural en entornos diversos.
- Entrada multimodal: imagenes RGB de camara y texto.
- Integracion de propiocepcion del robot con soporte para multiples embodiments mediante identificadores y MLP dedicados.
- Modelo cross-embodiment: disenado para post-entrenamiento sobre distintos robots y tareas.
- Aprendizaje por imitacion a partir de demostraciones (el post-entrenamiento con DROID usa trayectorias de demostracion).
- Base vision-language con capacidad de razonamiento (Cosmos-Reason2-2B) como soporte del modulo de accion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: no disponible (no se detalla lista de idiomas).
- Capacidades especiales (vision, audio, thinking mode): vision si; audio y thinking mode no disponibles.

## Casos de uso

- Manipulacion robotica en entornos reales no estructurados: el post-entrenamiento con DROID (564 escenas, 52 edificios) lo hace adecuado para tareas "in-the-wild" donde el robot debe generalizar a objetos, iluminacion y disposiciones no vistas durante el entrenamiento.
- Investigacion en robotica humanoide: sirve como modelo fundacional de partida para experimentar con algoritmos de control, flow matching y diffusion policies sin entrenar desde cero.
- Post-entrenamiento para un robot concreto: un equipo puede adaptar el modelo a su plataforma usando datos propios reales o sinteticos, aprovechando el diseno cross-embodiment y los MLP por embodiment.
- Evaluacion en benchmarks de manipulacion: las variantes SimplerEnv Bridge, SimplerEnv Fractal y LIBERO permiten comparar el rendimiento del modelo en entornos simulados estandarizados antes de pasar a hardware real.
- Prototipado rapido en startups de robotica: reduce el coste de entrenamiento al partir de un modelo preentrenado de 3.000 millones de parametros con backbone VLM ya entrenado.
- Tareas de manipulacion condicionadas por lenguaje: el modelo traduce instrucciones en lenguaje natural en secuencias de acciones motoras, util para interfaces humano-robot en almacenes, laboratorios o lineas de montaje.
- Generacion de datos sinteticos y aumento de datasets: el modelo puede servir como politica base para generar trayectorias adicionales que alimenten posteriores ciclos de post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 3.144 millones de parametros en safetensors ocupa aproximadamente 6.9 GB en el repositorio; en fp16 requeriria del orden de 6-7 GB solo para pesos, mas memoria para activaciones y el pipeline de vision.
- GPU recomendadas: no disponible en la informacion proporcionada. El entrenamiento reportado se realizo en nodos NVIDIA GB200.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por tamano de pesos, es plausible en GPUs consumer con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el modelo se distribuye a traves de NVIDIA Isaac-GR00T (GitHub) y Hugging Face; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos de lenguaje y no a politicas roboticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA GR00T N1.7 DROID | 3.144 M (declarado 3.000 M) | no disponible | Modelo fundacional robotico humanoide, post-entrenado con DROID | NVIDIA Open Model License | Hugging Face, GitHub Isaac-GR00T |
| NVIDIA GR00T N1.7 SimplerEnv Bridge | no disponible | no disponible | Misma familia, post-entrenado con BridgeData V2 | NVIDIA Open Model License | Hugging Face |
| NVIDIA GR00T N1.7 LIBERO | no disponible | no disponible | Misma familia, post-entrenado con LIBERO | NVIDIA Open Model License | Hugging Face |
| Alternativas de otros desarrolladores | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos; al ser un modelo entrenado con datos de robotica y demostraciones, puede heredar sesgos de las tareas, entornos y objetos presentes en DROID (564 escenas en 52 edificios), con posible peor generalizacion fuera de esa distribucion.
- Riesgo de alucinacion y de acciones incorrectas: como politica robotica generativa, puede producir trayectorias no validas fisicamente; requiere capas de seguridad y validacion en hardware real.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni la lista de idiomas soportados; el rendimiento multilingue no esta documentado.
- Restricciones de licencia: se rige por la NVIDIA Open Model License; es necesario revisar sus terminos para uso comercial, redistribucion y atribucion antes de desplegar en produccion.
- Post-entrenamiento especifico: la variante DROID esta especializada en el dataset DROID; su rendimiento en otros robots o tareas puede degradarse sin un post-entrenamiento adicional.
- Datos de benchmarks ausentes: no hay resultados publicados en la informacion disponible, lo que dificulta comparar su rendimiento frente a alternativas.
- Requisitos de hardware y latencia no documentados: la ausencia de datos oficiales de VRAM, latencia y throughput complica la planificacion de despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/GR00T-N1.7-DROID
- Coleccion GR00T N1.7 en Hugging Face: https://huggingface.co/collections/nvidia/gr00t-n17
- GitHub Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Web oficial Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- White paper GR00T N1 (arXiv:2503.14734): https://arxiv.org/abs/2503.14734
- Dataset DROID: https://droid-dataset.github.io/
- Backbone vision-language Cosmos-Reason2-2B: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Dataset BridgeData V2 en formato LeRobot (variante Bridge): https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot
- Benchmark LIBERO (variante LIBERO): https://github.com/Lifelong-Robot-Learning/LIBERO
