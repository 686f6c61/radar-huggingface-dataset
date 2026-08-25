# Milor123/ComfyUI-ConvRot-SenseNova-U1.5-8B-MoT-T8

## Resumen

Este repositorio contiene cuantizaciones comunitarias del modelo SenseNova-U1.5-8B-MoT, desarrollado por SenseTime, adaptadas para su uso en ComfyUI mediante la técnica ConvRot (rotación Hadamard agrupada fusionada en los pesos). El modelo original, de arquitectura NEO-Unify, es un sistema any-to-any que unifica comprensión multimodal, razonamiento y generación de imágenes en un único modelo monolítico, sin adaptadores entre modalidades. La cuantización reduce el peso original de 50 GB en bf16 a archivos de entre 13.8 y 17.6 GiB, permitiendo ejecutar el modelo en GPUs de consumo como una RTX 4070 de 12 GB a resoluciones de 2048x2048.

La relevancia de esta versión radica en que hace accesible un modelo multimodal de última generación en hardware doméstico, manteniendo una fidelidad visual casi idéntica al original según las pruebas A/B del autor. Se ofrecen dos variantes: una híbrida INT8 + W4A8 (recomendada) y una INT8 pura de máxima fidelidad. El proyecto se apoya en el ecosistema ComfyUI, comfy-kitchen y un wrapper específico, y hereda la licencia Apache-2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-Unify (multimodal unificado, any-to-any) |
| Parametros totales | 8B (segun denominacion del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot, W4A8 híbrido (INT8 en capas 0-17, W4A8 en capas 18-41) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1.5-8B-MoT emplea la arquitectura NEO-Unify, descrita por SenseTime como un paradigma que unifica comprensión, razonamiento y generación multimodal en un solo modelo, sin depender de adaptadores entre modalidades. El modelo piensa y actúa a través de lenguaje y visión de forma integrada. No se dispone de detalles sobre el dataset de entrenamiento, número de tokens o técnicas de alineación (RLHF/DPO) en la información proporcionada.

La cuantización ConvRot aplica una rotación Hadamard regular agrupada (grupo de 256) fusionada offline en los pesos; en tiempo de ejecución, las activaciones se rotan con la misma matriz dentro de los kernels de comfy-kitchen. El autor realizó un análisis de sensibilidad por capas y descubrió que las primeras capas del transformer son críticas para la coherencia del prompt si se cuantizan con W4A8, mientras que las capas 18-41 toleran esa cuantización sin pérdida visual apreciable. Por ello, la variante híbrida mantiene las capas 0-17 en INT8 (con activaciones bf16) y las capas 18-41 en W4A8 con codebook Lloyd-Max, grupo de 16 y escalas de grupo fp8. La fusión se realizó mediante la combinación a nivel de bytes de dos checkpoints validados independientemente, sin re-cuantizar ninguna capa durante el proceso.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a resoluciones de hasta 2048x2048, segun las pruebas del autor.
- Edicion de imagenes, tanto de una sola imagen como de multiples imagenes, con control regional mediante mascaras, bounding boxes o marcadores visuales (segun el wrapper oficial de ComfyUI para el modelo base).
- Comprension multimodal unificada: el modelo base procesa y razona sobre entradas de lenguaje y vision de forma integrada, lo que permite tareas de understanding y generation en un mismo flujo.
- Generacion intercalada (interleaved generation), que combina texto e imagenes en una misma secuencia de salida.
- Capacidad de ejecucion local en ComfyUI mediante el wrapper y comfy-kitchen, sin necesidad de servicios en la nube.
- La cuantizacion mantiene las capacidades del modelo base, aunque con una pequena perdida de fidelidad en la reconstruccion de pesos (error rel-L2 ~7% en la parte W4A8).

## Casos de uso

- Generacion de imagenes fotorrealistas en flujos de trabajo ComfyUI: el modelo puede producir imagenes de alta resolucion (2048x2048) directamente en una GPU de consumo, lo que lo hace util para artistas y disenadores que necesitan iterar rapidamente sin depender de APIs externas.
- Edicion de imagenes con control regional: mediante mascaras o bounding boxes, se pueden modificar areas especificas de una fotografia (cambiar objetos, fondos o iluminacion) manteniendo el contexto global, gracias a la capacidad de edicion multi-imagen del modelo base.
- Creacion de contenido mixto texto-imagen: el modelo puede generar secuencias intercaladas de texto e imagenes, util para guiones graficos, storyboards o documentacion visual automatica.
- Prototipado de aplicaciones multimodales: al ser un modelo any-to-any, permite experimentar con tareas que combinan comprension y generacion (por ejemplo, describir una imagen y luego generar una variante) en un solo pipeline.
- Pruebas de cuantizacion y optimizacion: el repositorio sirve como referencia para investigadores que estudian el impacto de la cuantizacion W4A8 en modelos multimodales, especialmente el comportamiento de las primeras capas del transformer.
- Despliegue en entornos con recursos limitados: al caber en 12 GB de VRAM, permite ejecutar un modelo multimodal de 8B en estaciones de trabajo con GPUs como RTX 4070, RTX 3060 o similares, sin necesidad de hardware de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de calidad de cuantizacion: una diferencia de píxeles del 0.43% en pruebas A/B con la variante INT8, y un error de reconstruccion de pesos por capa inferior al 2% en INT8, mientras que la parte W4A8 presenta un error rel-L2 de ~7%. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: al menos 12 GB, segun las pruebas del autor con una RTX 4070 a 2048x2048. El archivo híbrido pesa 13.8 GiB y el INT8 17.6 GiB, por lo que se recomienda una GPU con 16 GB o mas para la variante INT8 si se quiere margen.
- GPU recomendadas: RTX 4070 (probada), RTX 4080, RTX 4090, o GPUs de estacion de trabajo con 12-24 GB de VRAM. No se ha verificado en GPUs con menos de 12 GB.
- Compatibilidad con consumer GPU: si, siempre que se use la variante híbrida y se respete el limite de resolucion.
- Opciones de despliegue: ComfyUI (con commit `82f839f5` o superior), comfy-kitchen >= 0.2.31, y el custom node `Comfyui-SenseNova-U1.5-Wrapper-T8`. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor no proporciona mediciones de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Tamano | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-U1.5-8B-MoT (bf16 original) | 50 GB | safetensors | no disponible | Apache-2.0 | HuggingFace |
| Milor123/ComfyUI-ConvRot-SenseNova-U1.5-8B-MoT-T8 (híbrido) | 13.8 GiB | safetensors (INT8+W4A8) | no disponible | Apache-2.0 | HuggingFace |
| joyfox/SenseNova-U1.5-8B-MoT-FP8 | no disponible | safetensors (FP8) | no disponible | no disponible | HuggingFace |
| SenseNova-U1.5-8B-MoT-Preview-Q8.gguf (de smthemex) | 19.9 GB | GGUF Q8 | no disponible | no disponible | HuggingFace |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para comparar con otros modelos multimodales de tamano similar. La ventaja principal de esta cuantizacion es su menor tamano frente al bf16 y su integracion especifica con ComfyUI.

## Limitaciones y advertencias

- La cuantizacion es comunitaria y no oficial de SenseTime; no hay garantias de soporte ni de mantenimiento a largo plazo.
- El modelo base presenta un efecto "plastico" o "glossy" en la representacion de piel en modos fotorrealistas, que se mantiene en la cuantizacion y no es un artefacto de la misma.
- La variante híbrida W4A8 tiene un error de reconstruccion de pesos de ~7% en las capas 18-41, lo que podria afectar a tareas que requieran precision extrema en esas capas (aunque el autor reporta que visualmente es indistinguible).
- No se han publicado evaluaciones de sesgos, alucinacion o seguridad del modelo base ni de esta cuantizacion.
- La longitud de contexto y los idiomas soportados no estan documentados, lo que limita la planificacion de despliegues en produccion.
- El despliegue requiere componentes especificos de ComfyUI (comfy-kitchen, wrapper ConvRot-aware) que pueden no estar disponibles en otras plataformas de inferencia.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribucion y de las dependencias de terceros (como el wrapper).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Milor123/ComfyUI-ConvRot-SenseNova-U1.5-8B-MoT-T8
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Repositorio del modelo base (OpenSenseNova): https://github.com/OpenSenseNova/SenseNova-U1
- Wrapper de ComfyUI (upstream): https://github.com/T8mars/Comfyui-SenseNova-U1.5-Wrapper-T8
- Wrapper alternativo (smthemex): https://github.com/smthemex/ComfyUI_SenseNova_U1
- Nota tecnica sobre ConvRot en ComfyUI: https://github.com/Comfy-Org/ComfyUI/issues/14735
- Herramienta de conversion: https://github.com/silveroxides/convert_to_quant
- comfy-kitchen: https://github.com/Comfy-Org/comfy-kitchen
- Noticia sobre el lanzamiento oficial de SenseNova-U1.5 en ComfyUI: https://comfyui-wiki.com/en/news/2026-08-16-sensenova-u1-5-comfyui
- Variante FP8 (joyfox): https://huggingface.co/joyfox/SenseNova-U1.5-8B-MoT-FP8
