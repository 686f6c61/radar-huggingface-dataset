# Neurobrix/Qwen3-VL-30B-A3B-Thinking-nbx

## Resumen
Qwen3-VL-30B-A3B-Thinking-nbx es un contenedor `.nbx` publicado por Neurobrix que empaqueta el modelo multimodal Qwen3-VL-30B-A3B-Thinking desarrollado por Qwen (Alibaba). No se trata de un fine-tuning ni de una variante de pesos: los pesos, la licencia (Apache 2.0) y el comportamiento del modelo son los del original. Lo que aporta Neurobrix es un formato de distribucion que incluye el grafo de computacion, los pesos, la topologia de componentes y los valores por defecto de ejecucion, de modo que el motor NeuroBrix pueda planificar automaticamente donde ejecutar cada parte del modelo.

El modelo subyacente es un transformer multimodal de tipo Mixture-of-Experts con 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token (de ahi el sufijo A3B), disenado para tareas image-text-to-text con modo de razonamiento explicito ("Thinking"). Su relevancia practica esta en que permite desplegar un VLM de gran tamano en hardware local heterogeneo (varias GPU, una sola GPU, streaming o CPU) sin necesidad de montar manualmente pipelines de PyTorch, vLLM o similar.

La ficha se centra en lo que la informacion disponible permite afirmar. Cualquier dato sobre entrenamiento, benchmarks o composicion del dataset del modelo original no aparece en la model card proporcionada y se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, segun nomenclatura del modelo base Qwen3-VL; detalles internos no disponibles |
| Parametros totales | 30B (segun nombre del modelo base) |
| Parametros activos | ~3B por token (sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor se distribuye a 62,1 GB; no se especifican variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la del modelo original) |
| Formato de pesos | Contenedor `.nbx` propietario de NeuroBrix (incluye pesos, grafo de computacion y runtime defaults) |
| Tamano del contenedor | 62,1 GB |
| SHA-256 | `e503a61f45fb525f4780991de860b23bfa65195a64ef253a3f065a2669f77646` |
| Pipeline | image-text-to-text |
| Backends de ejecucion | PyTorch engine o Triton engine (kernels nbxtensor, sin PyTorch) |
| Hardware soportado | GPU NVIDIA, GPU de Mac (Metal), CPU |

## Arquitectura y entrenamiento
La arquitectura interna corresponde al modelo Qwen3-VL-30B-A3B-Thinking de Qwen, un transformer multimodal con capa MoE y modo de razonamiento. La model card de Neurobrix no reproduce los detalles de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF/DPO; esa informacion, si existe, esta en la model card original de Qwen, que no forma parte de la informacion proporcionada y por tanto se marca como no disponible.

La innovacion tecnica que si documenta esta publicacion es de empaquetado y ejecucion: el contenedor `.nbx` incluye el grafo de computacion completo, los pesos, la descripcion de como se conectan los componentes y los valores por defecto del runtime. Sobre esa base, NeuroBrix planifica la colocacion de cada parte del modelo (una GPU, varias, streaming entre memoria y host, o CPU) y ofrece dos rutas de ejecucion: un motor PyTorch y un motor Triton con kernels propios (`nbxtensor`) certificados por clase de GPU, que no requiere PyTorch instalado.

## Capacidades
- Generacion de texto e inferencia multimodal image-text-to-text: acepta una imagen y un prompt y produce una descripcion o respuesta textual (el ejemplo de la model card es `--input-image photo.jpg --prompt "Describe this image."`).
- Modo de razonamiento ("Thinking") heredado del modelo base, orientado a tareas que requieren cadena de pensamiento explicita.
- Ejecucion local con planificacion automatica de recursos entre GPU y host.
- Compatibilidad con dos motores de ejecucion (PyTorch y Triton) y tres familias de hardware (NVIDIA, Metal en Mac, CPU).
- Soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues especificas o modalidades adicionales (audio, video): no disponible en la informacion proporcionada.

## Casos de uso
- Descripcion y etiquetado de imagenes en local: el modelo recibe una imagen y un prompt y devuelve texto; util para generar metadatos de catalogos o datasets sin enviar imagenes a un servicio externo.
- Procesamiento por lotes en estaciones con varias GPU: el planificador de NeuroBrix reparte el modelo entre GPUs disponibles, lo que permite ejecutar un VLM de 30B en un servidor con varias tarjetas sin escribir el codigo de sharding.
- Despliegue en Mac con GPU Metal: el contenedor soporta Metal, de modo que un equipo Apple puede ejecutar el modelo sin CUDA, util para prototipado y demos.
- Ejecucion en CPU para entornos sin GPU: la opcion de CPU permite validar pipelines y hacer inferencia de baja frecuencia en maquinas sin acelerador.
- Razonamiento sobre documentos con imagen: el modo Thinking del modelo base resulta adecuado para tareas que requieren varios pasos de analisis sobre una captura, diagrama o pagina escaneada.
- Integracion en pipelines de investigacion reproducible: al fijar el contenedor con SHA-256, se puede garantizar que todos los experimentos usan exactamente el mismo artefacto.
- Sustitucion de dependencias pesadas: el motor Triton con kernels `nbxtensor` elimina la necesidad de PyTorch, lo que simplifica imagenes de contenedor en produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita. El contenedor ocupa 62,1 GB en disco; el modelo base tiene 30B parametros totales con ~3B activos, por lo que la huella en memoria depende de la precision y del esquema de offloading que aplique NeuroBrix.
- GPU recomendadas: no especificadas por el autor. El motor soporta NVIDIA, GPU de Mac (Metal) y CPU.
- Cabe en GPU consumer: no disponible. Dado el tamano del contenedor (62,1 GB) y los 30B parametros totales, es previsible que requiera offloading o varias GPU, pero el autor no publica cifras.
- Opciones de despliegue: `neurobrix` (instalacion via `pip install neurobrix`, importacion con `neurobrix import ... --accept-license`, ejecucion con `neurobrix run`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Neurobrix/Qwen3-VL-30B-A3B-Thinking-nbx | 30B totales / ~3B activos | no disponible | Apache 2.0 | `.nbx` | Contenedor con planificador multi-GPU y motor Triton propio |
| Qwen/Qwen3-VL-30B-A3B-Thinking | 30B totales / ~3B activos | no disponible | Apache 2.0 | safetensors (presumible, no confirmado en la informacion) | Modelo original; requiere montar el stack de inferencia por cuenta propia |
| Otros VLM MoE de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion relevante es contra el modelo original: misma licencia y mismos pesos, con la diferencia de que el contenedor `.nbx` anade planificacion de recursos y un motor alternativo sin PyTorch, a cambio de depender del ecosistema NeuroBrix.

## Limitaciones y advertencias
- Los sesgos, la tasa de alucinacion y las limitaciones de contexto o idioma del modelo base no se detallan en la informacion proporcionada; se heredan del modelo original de Qwen y deben consultarse en su model card.
- La licencia Apache 2.0 permite uso comercial, pero cualquier restriccion adicional del modelo original (por ejemplo, terminos de uso aceptable) se mantiene sin cambios.
- El formato `.nbx` es propietario de NeuroBrix: la portabilidad a otros runtimes no esta documentada.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por terceros.
- El motor Triton con kernels `nbxtensor` se certifica por clase de GPU; el rendimiento y la compatibilidad pueden variar entre generaciones de tarjetas.
- No se especifican tipos de cuantizacion, lo que limita la planificacion de despliegues con VRAM ajustada.
- La fecha de creacion del repositorio (2026-11-13) y la ausencia de benchmarks hacen recomendable validar el modelo en el caso de uso concreto antes de adoptarlo.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Neurobrix/Qwen3-VL-30B-A3B-Thinking-nbx
- Modelo original: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Thinking
- Descarga del contenedor: https://neurobrix.org/models/Qwen/Qwen3-VL-30B-A3B-Thinking
- GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentacion: https://docs.neurobrix.org
- Hub: https://neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
