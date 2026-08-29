# hemlang/Hemlock-Qwen3.5-9B

## Resumen

Hemlock-Qwen3.5-9B es un modelo de lenguaje y visión de 9.400 millones de parámetros desarrollado por hemlang, especializado en la generación de código en el lenguaje de programación Hemlock. Se trata de la versión de 9B del modelo Hemlock-Qwen3.6-27B, y se construye mediante la fusión de un adaptador LoRA entrenado con supervisión fina (SFT) sobre un modelo base abliterado de la familia Qwen3.5. El resultado es un modelo que conserva la mayor parte de la capacidad del 27B para escribir Hemlock, pero con un tercio de los parámetros.

El modelo se distribuye bajo licencia Apache 2.0, soporta entrada de imagen y texto (pipeline image-text-to-text) y está pensado para su uso en entornos de desarrollo que requieran generación de código en Hemlock, así como para tareas conversacionales y de razonamiento general. Incluye una cabeza MTP (multi-token prediction) que permite decodificación especulativa, y se sirve eficientemente con llama.cpp o llama-server.

La relevancia de este modelo radica en su enfoque especializado: demuestra que un modelo de 9B puede alcanzar un 57,1% en el benchmark hembench, muy cerca del 65,0% del modelo de 27B, con un coste computacional significativamente menor. Esto lo convierte en una opción atractiva para equipos que necesitan capacidades de generación de código en Hemlock sin los requisitos de hardware de un modelo más grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con componentes de vision (basado en Qwen3.5, detalles no especificados) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de serving usa 8192) |
| Tipos de cuantizacion | Q8_0 (GGUF), otras cuantizaciones disponibles via GGUF de terceros |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tambien disponible GGUF) |

## Arquitectura y entrenamiento

Hemlock-Qwen3.5-9B es un modelo resultante de una fusion (merge) de dos componentes: por un lado, el adaptador LoRA `hemlang/Schierling-Qwen3.5-9B-LoRA`, entrenado mediante SFT sobre el dataset `hemlang/Hemlock-SFT-combined`; por otro, el modelo base `nbeerbower/Huihui-Qwen3.5-9B-abliterated-TIES`, que es una version "abliterada" (eliminacion de ciertos comportamientos de rechazo) de Qwen3.5-9B. La fusion se realiza con un peso de 1.0, y tras ella se restauran los 15 tensores `mtp.*` (multi-token prediction) desde el modelo base, ya que la funcion `peft merge_and_unload()` los elimina y llama.cpp los requiere para cargar el modelo correctamente.

El modelo cuenta con 775 tensores en total: 426 de lenguaje, 333 de vision, 15 de MTP y 1 de lm_head. No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La unica informacion adicional es que el adaptador LoRA se entreno con SFT, y que la fusion se realizo con la herramienta de PEFT de HuggingFace.

## Capacidades

- Generacion de codigo en el lenguaje de programacion Hemlock, con capacidad para producir programas completos que se ejecutan correctamente en el interprete real.
- Razonamiento algoritmico y resolucion de problemas de nivel medio (nivel L3 de hembench: 7/7).
- Comprension de sistemas y depuracion basica (niveles L4 y L6 de hembench con 4/7 y 2/5 respectivamente).
- Entrada multimodal: acepta imagenes ademas de texto (pipeline image-text-to-text).
- Conversacion en ingles con estilo conversacional.
- Soporte de decodificacion especulativa mediante la cabeza MTP, lo que acelera la inferencia en servidores compatibles.
- Capacidades generales de lenguaje preservadas del modelo base Qwen3.5, con una perdida minima medida en ARC (61.5 a 62.5) y un aumento de perplexity de solo 1.9% en Wikipedia.
- Uso de herramientas (tool calling) disponible, aunque con una ligera reduccion en la moderacion respecto al modelo base pre-SFT.

## Casos de uso

- Generacion de codigo Hemlock en entornos de desarrollo: el modelo puede producir programas completos en Hemlock a partir de descripciones en lenguaje natural, lo que acelera el desarrollo de aplicaciones en este lenguaje. Su puntuacion de 7/7 en algoritmos (nivel L3) lo hace fiable para tareas de logica intermedia.
- Asistente de programacion integrado en IDEs: gracias a su capacidad de generar codigo y su soporte de tool calling, puede integrarse en editores como VS Code o Neovim para ofrecer autocompletado y sugerencias de funciones en Hemlock.
- Educacion y formacion en Hemlock: el modelo puede explicar conceptos del lenguaje, generar ejemplos de codigo y corregir errores de sintaxis, lo que resulta util para estudiantes que aprenden Hemlock.
- Traduccion de codigo entre lenguajes: aunque su rendimiento en traduccion (nivel L5) es limitado (2/5), puede servir como punto de partida para convertir algoritmos escritos en otros lenguajes a Hemlock, con revision manual posterior.
- Depuracion asistida: con un 2/5 en el nivel de depuracion, el modelo puede identificar errores comunes en programas Hemlock y sugerir correcciones, aunque se recomienda verificar las llamadas a la biblioteca estandar.
- Prototipado rapido de sistemas: para tareas de nivel sistemas (L4, 4/7), el modelo puede generar esqueletos de programas que interactuan con el sistema operativo, facilitando la creacion de prototipos funcionales.

## Benchmarks y rendimiento

El modelo se evalua con el benchmark hembench, que ejecuta cada programa generado en el interprete real de Hemlock y compara su salida estandar con la esperada. Los resultados, obtenidos con cuantizacion Q8_0 y decodificacion greedy, son los siguientes:

| Nivel | Descripcion | Puntuacion |
|---|---|---|
| L1 | Sintaxis | 7/9 |
| L2 | Biblioteca estandar | 1/5 |
| L3 | Algoritmos | 7/7 |
| L4 | Sistemas | 4/7 |
| L5 | Traduccion | 2/5 |
| L6 | Depuracion | 2/5 |
| **Overall** | Ponderado | **57,1%** |

Para contextualizar, el modelo Hemlock-Qwen3.6-27B (TIES) obtuvo un 10,1% antes de su entrenamiento en Hemlock y un 65,0% despues. Este modelo de 9B alcanza un 57,1%, lo que indica que conserva la mayor parte de la capacidad del 27B con un tercio de los parametros. Ademas, se reporta que no hay una perdida medible en capacidades generales: ARC pasa de 61,5 a 62,5 (n=299) y la perplexity en Wikipedia aumenta solo un 1,9%.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q8_0, el modelo ocupa aproximadamente 9,4 GB de pesos, mas overhead de contexto y activaciones. En FP16, el uso de VRAM seria de unos 18,8 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB VRAM) puede ejecutar el modelo en Q8_0 con contexto de 8192 tokens. Para FP16 se recomienda una A100 (40 GB) o H100 (80 GB).
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 16 GB o mas de VRAM usando cuantizacion Q8_0 o inferior (por ejemplo, Q4_K_M).
- Opciones de despliegue: llama.cpp (llama-server), vLLM, SGLang, KTransformers, y cualquier servidor compatible con el formato GGUF o safetensors.
- Latencia y throughput: no se proporcionan datos especificos. Con decodificacion especulativa via MTP, se espera una mejora significativa en la velocidad de generacion respecto a la decodificacion autoregresiva estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hemlock-Qwen3.5-9B (este) | 9,4B | No disponible | Generacion de codigo Hemlock | Apache 2.0 | HuggingFace, GGUF |
| Hemlock-Qwen3.6-27B | 27B | No disponible | Generacion de codigo Hemlock | Apache 2.0 | HuggingFace |
| Qwen3.5-9B (base) | 9,4B | No disponible | Modelo general de lenguaje y vision | Apache 2.0 | HuggingFace, Azure, Jetson |

El modelo Hemlock-Qwen3.5-9B se posiciona como una alternativa ligera al Hemlock-Qwen3.6-27B, con un rendimiento en hembench de 57,1% frente al 65,0% del 27B, pero con un tercio de los parametros. Frente al Qwen3.5-9B base, este modelo anade la especializacion en Hemlock sin sacrificar significativamente las capacidades generales (ARC y perplexity apenas cambian). No se dispone de comparaciones con otros modelos de 9B como Llama 3.1 8B o Mistral 7B en tareas de generacion de codigo Hemlock.

## Limitaciones y advertencias

- La biblioteca estandar de Hemlock es el punto mas debil (1/5 en hembench): el modelo no memoriza bien los nombres y firmas de las funciones de la stdlib, por lo que se recomienda verificar las llamadas contra la documentacion oficial.
- La moderacion en el uso de herramientas (tool calling) es ligeramente inferior a la del modelo base pre-SFT (8/10 frente a 10/10 en un benchmark de 47 casos). Esto puede provocar un uso excesivo o inapropiado de herramientas en entornos de agente.
- El modelo es "abliterado", lo que significa que se han eliminado ciertos comportamientos de rechazo. Esto puede implicar una menor resistencia a generar contenido no deseado o a seguir instrucciones malintencionadas, aunque no se detallan los criterios de abliteracion.
- Solo soporta ingles como idioma de entrada y salida. No se ha evaluado su rendimiento en otros idiomas.
- La longitud de contexto maxima no esta documentada; el ejemplo de serving usa 8192 tokens, pero podria soportar mas. Se recomienda probar antes de desplegar en produccion.
- Al ser un modelo de fusion (merge) y no un entrenamiento desde cero, su comportamiento en dominios fuera de Hemlock puede ser menos consistente que el de un modelo entrenado especificamente para esos dominios.
- No se han publicado resultados de benchmarks generales estandar (MMLU, HumanEval, GSM8K) para este modelo concreto, solo los datos de hembench y las metricas de ARC y perplexity mencionadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hemlang/Hemlock-Qwen3.5-9B
- Repositorio de Hemlock: https://github.com/hemlang/hemlock
- Dataset de entrenamiento: https://huggingface.co/datasets/hemlang/Hemlock-SFT-combined
- Adaptador LoRA base: https://huggingface.co/hemlang/Schierling-Qwen3.5-9B-LoRA
- Modelo base abliterado: https://huggingface.co/nbeerbower/Huihui-Qwen3.5-9B-abliterated-TIES
- Modelo 27B de referencia: https://huggingface.co/nbeerbower/Hemlock-Qwen3.6-27B
- GGUF de terceros: https://huggingface.co/mradermacher/Huihui-Qwen3.5-9B-abliterated-TIES-Hemlock-SFT-GGUF
- Entrada en llm-explorer: https://llm-explorer.com/model/nbeerbower%2FHuihui-Qwen3.5-9B-abliterated-TIES-Hemlock-SFT,6HGrshX8Wmn969vbZNAFYn
