# OnlyTextLLMs/gemma-4-31B-it-OnlyText

## Resumen

gemma-4-31B-it-OnlyText es un modelo de lenguaje causal de solo texto publicado por el usuario OnlyTextLLMs en Hugging Face. Se trata de un derivado de google/gemma-4-31B-it al que se le han eliminado las torres y proyectores de vision y audio, junto con los tokens especiales multimodales, conservando unicamente el backbone de texto y la cabeza LM. No se ha realizado entrenamiento adicional: el repositorio solo elimina modalidades, no anade capacidades nuevas.

El modelo cuenta con 30.697.307.708 parametros (~30,70 B) en una arquitectura densa de 60 capas con tamano oculto de 5376, implementada como `Gemma4ForCausalLM` y distribuida en pesos bfloat16. El repositorio ocupa 61,4 GB y se publica bajo licencia apache-2.0, la misma que el modelo base de Google.

Su relevancia practica es acotada pero util: para despliegues que solo necesitan generacion de texto y conversacion, elimina la carga de las torres de vision y audio del modelo multimodal original, reduciendo el peso del repositorio y simplificando el pipeline de inferencia. El principal caveat es que depende por completo de las capacidades heredadas del modelo base, y que no se publican datos de contexto, idiomas ni benchmarks especificos para este derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (`Gemma4ForCausalLM`); derivado del multimodal google/gemma-4-31B-it con las torres de vision y audio y los tokens especiales multimodales eliminados |
| Parametros totales | 30.697.307.708 (~30,70 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16; no se anuncia GGUF oficial) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Capas | 60 |
| Tamano oculto | 5376 |
| Cabeza MTP | no presente |
| Tamano del repositorio | 61,4 GB |
| Fecha de publicacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso causal de 60 capas y 5376 dimensiones ocultas, con 30,70 B de parametros, expuesto a traves de la clase `Gemma4ForCausalLM` de transformers. El modelo original google/gemma-4-31B-it es un modelo multimodal unificado de Google con soporte nativo de texto, imagen y audio, modo de razonamiento (thinking mode) y protocolo de uso de herramientas. Esta variante OnlyText elimina las torres y proyectores de imagen y audio, asi como los tokens especiales multimodales, conservando el backbone de texto y la cabeza LM.

No se ha realizado ningun entrenamiento, ajuste fino ni proceso de RLHF/DPO adicional en este repositorio: es una operacion de poda de modalidades sobre los pesos del modelo base. Los pesos se distribuyen en bfloat16, no se ha conservado la cabeza MTP (multi-token prediction) y no se documenta el numero de tokens de entrenamiento, la composicion del dataset ni detalles del pipeline de alineamiento, que corresponden integramente al modelo original de Google.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation` y tag `conversational`).
- Razonamiento y modo de pensamiento (thinking mode): heredado del modelo base multimodal, que lo documenta explicitamente.
- Flujos agenticos y uso de herramientas: el modelo base soporta un protocolo de tool-use, presumiblemente conservado al mantener el backbone de texto, aunque este derivado no documenta pruebas al respecto.
- Generacion de codigo: el modelo base esta orientado a coding y agentic workflows.
- Capacidades multimodales (vision y audio): no disponibles en este derivado, ya que se han eliminado las torres y proyectores correspondientes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de audio, vision ni otros modos de entrada en este repositorio.

## Casos de uso

- Atencion al cliente automatizada: al ser un modelo conversacional de ~30 B con capacidades de razonamiento heredadas, puede gestionar dialogos multi-turno en produccion, aunque el contexto maximo no esta documentado y debe verificarse contra el modelo base.
- Asistentes de texto internos: para empresas que solo necesitan generacion de texto, este derivado evita cargar las torres de vision y audio del modelo original, reduciendo el tamano del despliegue.
- Generacion de codigo asistida: el modelo base esta orientado a coding y agentic workflows, por lo que este derivado puede integrarse en asistentes de programacion si se valida su rendimiento real.
- Procesamiento de documentacion y resumen: tareas puramente textuales de resumen y extraccion donde las capacidades multimodales son irrelevantes.
- Pipelines de agentes con tool calling: si se confirma que el protocolo de uso de herramientas del modelo base se conserva tras la poda, puede emplearse en agentes de varios pasos.
- Investigacion sobre poda de modalidades: sirve como caso de estudio reproducible de derivacion de un modelo multimodal a uno de solo texto sin reentrenamiento.
- Despliegue en entornos sin necesidad de entrada visual o de audio: simplifica el stack de inferencia al eliminar dependencias multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye evaluaciones propias, y al tratarse de un derivado sin entrenamiento adicional el rendimiento esperado es el del backbone de texto de google/gemma-4-31B-it, del que tampoco se proporcionan numeros concretos en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada en bfloat16/fp16: aproximadamente 62 GB solo para pesos, con overhead adicional de KV cache y activaciones; requiere GPUs de 80 GB (A100 80 GB, H100 80 GB) o reparto multi-GPU.
- VRAM estimada en 8 bits: en torno a 31 GB de pesos mas overhead, lo que encaja justo en A100 40 GB o en configuraciones de dos GPUs de 24 GB.
- VRAM estimada en 4 bits: alrededor de 16-17 GB de pesos mas overhead, lo que permite ejecucion en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Estas cifras son estimaciones derivadas del numero de parametros; no estan confirmadas por el autor.
- Opciones de despliegue: transformers esta confirmado por la libreria declarada. vLLM dispone de una recipe para el modelo base (Google/gemma-4-31B-it), TGI es plausible, Ollama publica `gemma4:31b` para el modelo base. Para este derivado concreto no se anuncia soporte GGUF ni entrada en Ollama, por lo que llama.cpp requeriria conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OnlyTextLLMs/gemma-4-31B-it-OnlyText | 30,70 B | no disponible | solo texto | apache-2.0 | Hugging Face (0 descargas) |
| google/gemma-4-31B-it | no disponible | no disponible | texto, imagen, audio | apache-2.0 | Hugging Face, vLLM recipe, Ollama |
| google/gemma-4-31B | no disponible | no disponible | multimodal | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado en la informacion proporcionada, por lo que la comparacion se limita a parametros, modalidades y licencia. Frente al modelo base, este derivado pierde vision y audio a cambio de un repositorio mas ligero y un pipeline mas simple, sin ganar ninguna capacidad nueva.

## Limitaciones y advertencias

- Modelo derivado sin entrenamiento adicional: no incorpora ninguna mejora sobre el modelo base, solo la eliminacion de modalidades.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta familia; no se documentan evaluaciones de fidelidad para este derivado.
- Eliminacion irreversible de capacidades: las funciones de vision y audio del modelo original no estan disponibles y no pueden recuperarse desde este repositorio.
- Contexto maximo no documentado: no se especifica la longitud de ventana, dato critico para despliegues con documentos largos.
- Idiomas no documentados: no se indica que lenguas estan soportadas oficialmente.
- Licencia: apache-2.0 en este repositorio, pero conviene revisar las condiciones de uso del modelo base de Google antes de explotacion comercial, ya que podrian aplicar terminos adicionales.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Sin benchmarks propios: el rendimiento real en tareas concretas no ha sido verificado ni publicado.
- El soporte de tool calling y thinking mode es una suposicion basada en el modelo base y no esta confirmado para este derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OnlyTextLLMs/gemma-4-31B-it-OnlyText
- Modelo base google/gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it
- Modelo google/gemma-4-31B (pretrained): https://huggingface.co/google/gemma-4-31B
- Discusion sobre reconocimiento de texto en google/gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it/discussions/12
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Recipe de vLLM para gemma-4-31B-it: https://recipes.vllm.ai/Google/gemma-4-31B-it
- Gemma 4 31B en Ollama: https://ollama.com/library/gemma4:31b
