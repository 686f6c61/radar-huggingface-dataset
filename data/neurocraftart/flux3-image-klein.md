# neurocraftart/flux3-image-klein

## Resumen

flux3-image-klein es un mirror del repositorio `mikeprass/flux3-image-klein`, una cuantizacion de bajo consumo de VRAM (w4a8 / int8 convrot) del modelo original FLUX.3 Image Klein de Black Forest Labs, empaquetada por Mike Prass para los instaladores de NeuroCraft Studio. El repositorio lo publica el usuario neurocraftart en Hugging Face y su funcion es servir como fuente de pesos ya cuantizados para flujos de trabajo en ComfyUI con GPUs de VRAM limitada.

El modelo original es un generador de imagenes de la familia FLUX de Black Forest Labs, pero esta ficha solo puede describir lo que consta en el repositorio: el mirror no incluye model card tecnica detallada, ni ficha de arquitectura, ni resultados de evaluacion. Los unicos datos verificables son el tamano del repositorio (11,8 GB), los cuatro ficheros de pesos publicados y las etiquetas `comfyui` y `lowvram`.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de la familia FLUX.3 en entornos con poca VRAM mediante cuantizacion de pesos a 4 bits con activaciones de 8 bits (w4a8) y convoluciones rotadas (convrot), un esquema de compresion agresivo orientado a inferencia local. No se dispone de informacion sobre parametros totales, longitud de contexto, idiomas ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generacion de imagenes de la familia FLUX.3; detalles no publicados en el repo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a8 convrot (pesos 4 bits, activaciones 8 bits), int8 convrot |
| Idiomas soportados | no disponible |
| Licencia | other (`same-as-original`; se heredan los terminos del modelo original y de la release cuantizada) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 11,8 GB |
| Pipeline declarado | no disponible |
| Etiquetas | comfyui, lowvram |

Ficheros incluidos en el repositorio:

| Fichero | Tamano (bytes) |
|---|---|
| `flux2-vae.safetensors` | 336.211.292 |
| `flux3-image-klein-w4a8-convrot.safetensors` | 3.520.002.938 |
| `qwen3vl_4b_int8_convrot.safetensors` | 4.864.124.848 |
| `qwen3vl_4b_w4a8_convrot.safetensors` | 3.106.766.490 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo original FLUX.3 Image Klein en la informacion disponible. Por los ficheros del repositorio se deduce que el paquete consta de tres componentes: un VAE (`flux2-vae.safetensors`), el modelo de difusion cuantizado a w4a8 con convoluciones rotadas (`flux3-image-klein-w4a8-convrot.safetensors`) y un codificador de texto basado en Qwen3-VL de 4B, ofrecido en dos variantes de cuantizacion (int8 convrot y w4a8 convrot). Esta estructura es coherente con una arquitectura de difusion texto-a-imagen con encoder de texto multimodal, pero el repositorio no aporta confirmacion tecnica adicional.

Tampoco constan datos de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo ajuste por preferencias (RLHF/DPO). La unica innovacion documentada es el propio esquema de cuantizacion convrot aplicado por Mike Prass, que combina pesos de 4 bits con activaciones de 8 bits y rotaciones de convolucion para reducir el uso de VRAM manteniendo la fidelidad numerica. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de imagenes a partir de texto: es la funcion principal esperada de un modelo de la familia FLUX.3 Image, aunque el repositorio no documenta resoluciones, relacion de aspecto ni calidad de salida.
- Codificacion de texto multimodal: el paquete incluye un encoder Qwen3-VL de 4B, lo que sugiere capacidad de procesar indicaciones textuales y posiblemente imagenes de referencia, sin confirmacion en la model card.
- Ejecucion en entornos de baja VRAM: la cuantizacion w4a8 convrot esta disenada explicitamente para reducir el consumo de memoria en inferencia.
- Integracion con ComfyUI: la etiqueta `comfyui` indica que los pesos estan preparados para cargarse en flujos de trabajo de esa interfaz.
- Soporte de tool calling, agentes, razonamiento multi-paso, thinking mode, audio o vision: no disponible; no es un modelo de lenguaje conversacional segun la informacion del repositorio.

## Casos de uso

- Generacion de imagenes en estaciones de trabajo con GPU de consumo: el paquete cuantizado a w4a8 permite cargar el modelo de difusion y el encoder en GPUs con menos de 24 GB de VRAM, algo inviable con los pesos originales en precision completa.
- Prototipado de pipelines de imagen en ComfyUI: al estar etiquetado para ComfyUI, se puede integrar como nodo de generacion en flujos existentes para experimentar con indicaciones y estilos antes de pasar a produccion.
- Creacion de contenido para instaladores de NeuroCraft Studio: el repositorio existe precisamente como mirror para estos instaladores, de modo que los usuarios finales obtienen los pesos sin depender del repo original de Mike Prass.
- Evaluacion comparativa de cuantizaciones: al ofrecer el encoder Qwen3-VL en int8 y en w4a8, permite medir en el mismo entorno la perdida de calidad frente al ahorro de VRAM.
- Despliegue local con requisitos de privacidad: al ejecutarse en local via ComfyUI, las imagenes y las indicaciones no salen del equipo, adecuado para entornos con datos sensibles.
- Investigacion sobre compresion de modelos generativos: el esquema convrot sirve como referencia reproducible para estudiar el impacto de w4a8 en la calidad de imagen frente a otras tecnicas de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa a partir de los tamanos de fichero, el modelo de difusion cuantizado ocupa unos 3,5 GB en disco, el encoder Qwen3-VL unos 3,1 GB en w4a8 o 4,9 GB en int8, y el VAE unos 336 MB; la VRAM necesaria en ejecucion sera superior a la suma de estos pesos por los buffers de activacion.
- GPU recomendadas: no disponible. La etiqueta `lowvram` sugiere GPUs de consumo, pero el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: probable por el diseno de la cuantizacion, pero sin confirmacion del autor ni cifras de VRAM maxima.
- Opciones de despliegue: ComfyUI es el entorno declarado en las etiquetas. No consta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son el entorno habitual para modelos de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux3-image-klein (este mirror) | no disponible | no disponible | w4a8 convrot, int8 convrot | other (same-as-original) | Hugging Face, 0 descargas |
| mikeprass/flux3-image-klein (original del mirror) | no disponible | no disponible | w4a8 convrot, int8 convrot | same-as-original | Hugging Face |
| FLUX.3 Image Klein (Black Forest Labs) | no disponible | no disponible | pesos originales | licencia de Black Forest Labs | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento, parametros ni contexto de ninguno de los tres, por lo que la comparativa se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es minima: no documenta arquitectura, resoluciones de salida, pasos de muestreo recomendados ni parametros de inferencia, lo que dificulta reproducir resultados.
- La cuantizacion w4a8 puede degradar la calidad de imagen frente a los pesos originales; el autor no publica comparativas de fidelidad.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (24 de noviembre de 2026): no hay evidencia de uso ni validacion por la comunidad.
- La licencia es `other` con nombre `same-as-original`: los terminos aplicables son los del modelo original de Black Forest Labs y los de la release cuantizada de Mike Prass. Antes de un uso comercial es obligatorio revisar ambas licencias en sus repositorios de origen.
- Al ser un mirror de terceros, no hay garantia de que los pesos coincidan bit a bit con el repositorio original ni de que se actualicen cuando este cambie.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion visual, idiomas soportados ni limitaciones de contexto.
- El uso de un encoder Qwen3-VL de 4B anade una dependencia de licencia adicional que debe verificarse por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neurocraftart/flux3-image-klein
- Repositorio original del que es mirror: https://huggingface.co/mikeprass/flux3-image-klein
- Black Forest Labs (autor del modelo original): no se ha encontrado enlace en la informacion proporcionada
- Paper, blog o demo oficiales: no disponible
