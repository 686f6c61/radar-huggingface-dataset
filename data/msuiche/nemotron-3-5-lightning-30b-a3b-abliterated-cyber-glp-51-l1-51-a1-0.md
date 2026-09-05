# msuiche/Nemotron-3.5-Lightning-30B-A3B-abliterated-cyber-GLP-51-L1-51-a1.0

## Resumen

Este repositorio, publicado por el usuario msuiche, no contiene un modelo de lenguaje completo, sino un adaptador ligero basado en técnicas de *activation steering* y *control vectors*. Se trata de una variante modificada del modelo base NVIDIA Nemotron 3.5 Lightning 30B A3B, un modelo de propósito general de razonamiento y chat desarrollado por NVIDIA. El adaptador se describe como *abliterated* y *cyber*, lo que sugiere que está diseñado para eliminar restricciones de alineación y orientar el comportamiento del modelo hacia tareas relacionadas con ciberseguridad.

El modelo base es una arquitectura Mixture of Experts (MoE) de 30.000 millones de parámetros totales, con 3.000 millones de parámetros activos por token. El adaptador, en cambio, contiene únicamente 137.088 parámetros y ocupa 0.0 GB, lo que confirma que no incluye los pesos del modelo original. El acceso al repositorio está restringido (gated) en HuggingFace y requiere aceptar condiciones previas. Los datos de contexto y de benchmarks no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en el modelo base NVIDIA Nemotron 3.5 Lightning 30B A3B |
| Parametros totales | 30.000 millones (modelo base); el adaptador del repositorio contiene 137.088 parametros |
| Parametros activos | 3.000 millones (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (modelo base), GGUF (segun tags) |
| Idiomas soportados | Ingles y lenguajes de programacion; espanol, frances, aleman, italiano y japones (segun modelo base) |
| Licencia | other |
| Formato de pesos | Safetensors (adaptador), GGUF (segun tags) |

## Arquitectura y entrenamiento

El adaptador se apoya en el modelo base NVIDIA Nemotron 3.5 Lightning 30B A3B, un modelo MoE con 30.000 millones de parametros totales y 3.000 millones activos. El repositorio incluye etiquetas como `control-vector`, `activation-steering` y `weightless`, lo que indica que la modificacion se realiza mediante vectores de control que alteran la activacion del modelo base sin modificar sus pesos. El tag `glp` podria referirse a una tecnica de *linear probing* generalizada, aunque no se aportan detalles tecnicos.

No se proporciona informacion sobre el proceso de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. El modelo base, segun la documentacion de NVIDIA, fue entrenado para razonamiento general y chat, con soporte para ingles y lenguajes de programacion, ademas de otros idiomas como espanol, frances, aleman, italiano y japones.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base NVIDIA Nemotron 3.5 Lightning 30B A3B.
- Soporte de codificacion y lenguajes de programacion.
- Capacidad multilingue: ingles, espanol, frances, aleman, italiano y japones, segun el modelo base.
- Modificacion del comportamiento mediante *activation steering*, orientada a eliminar restricciones de alineacion (abliterated) y a potenciar respuestas relacionadas con ciberseguridad (cyber).
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Investigacion en interpretabilidad: el adaptador permite estudiar como los vectores de control modifican las respuestas del modelo base, facilitando el analisis de conceptos internos y de sesgos.
- Ajuste de comportamiento en entornos de investigacion: la variante *abliterated* puede utilizarse para analizar como responde un modelo sin las restricciones habituales de alineacion, lo que resulta util en estudios de seguridad y robustez.
- Ciberseguridad ofensiva y defensiva: el tag *cyber* sugiere aplicaciones en analisis de vulnerabilidades, deteccion de patrones maliciosos o generacion de exploits en entornos controlados, aunque no hay datos que confirmen estas capacidades.
- Desarrollo de agentes con *steering*: en combinacion con el modelo base, el adaptador puede orientar el comportamiento del modelo hacia tareas especificas sin necesidad de reentrenar los pesos completos.
- Evaluacion de sistemas de seguridad: permite probar la resistencia del modelo ante prompts maliciosos o adversarios, comparando las respuestas con y sin el control vector.
- Integracion en aplicaciones locales mediante llama.cpp: al estar etiquetado como GGUF, el adaptador puede combinarse con el modelo base cuantizado para ejecutarse en entornos de escritorio o servidores de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador en si no requiere VRAM adicional, pero el modelo base NVFP4 necesita una GPU con suficiente memoria para cargar sus pesos.
- GPU recomendadas: no disponibles en la documentacion. El modelo base puede ejecutarse en GPUs de consumo como la RTX 4090 (24 GB) si se aplica una cuantizacion adicional, aunque no hay datos oficiales.
- Opciones de despliegue: llama.cpp, vLLM, TGI y Ollama, siempre que se cargue el modelo base correspondiente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Lightning 30B A3B (base) | 30.000 M (3.000 M activos) | no disponible | other | HuggingFace, gated |
| Adaptador msuiche (este repo) | 137.088 parametros | no disponible | other | HuggingFace, gated |
| Otras variantes abliterated | no disponible | no disponible | no disponible | no disponible |

Este adaptador no es un modelo independiente, por lo que la comparacion directa con otros modelos de la misma categoria no es posible a partir de la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated) en HuggingFace: requiere aceptar condiciones antes de poder descargar el repositorio.
- Licencia `other`: es necesario revisar los terminos de la licencia antes de cualquier uso comercial o redistribucion.
- No se han publicado benchmarks ni evaluaciones de rendimiento, por lo que no se puede validar su calidad en tareas concretas.
- El repositorio no contiene los pesos completos del modelo; depende del modelo base NVIDIA Nemotron 3.5 Lightning 30B A3B, que tambien tiene acceso restringido.
- La variante *abliterated* puede eliminar salvaguardas de seguridad, lo que incrementa el riesgo de uso malicioso o de generacion de contenido no deseado.
- Al tratarse de una modificacion no oficial, el comportamiento puede ser impredecible y no esta garantizado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/msuiche/Nemotron-3.5-Lightning-30B-A3B-abliterated-cyber-GLP-51-L1-51-a1.0
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
