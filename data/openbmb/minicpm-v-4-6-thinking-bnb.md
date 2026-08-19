# openbmb/MiniCPM-V-4.6-Thinking-BNB

## Resumen

MiniCPM-V 4.6 Thinking BNB es la version cuantizada en 4 bits (NF4, bitsandbytes) del modelo multimodal MiniCPM-V 4.6 Thinking, desarrollado por OpenBMB. Se trata de un modelo ligero de vision-lenguaje disenado para ejecutarse en dispositivos de borde como telefonos moviles, con soporte para comprension de imagenes y video de alta resolucion. La cuantizacion reduce el repositorio a 1,1 GB, lo que permite su despliegue en iOS, Android y HarmonyOS sin sacrificar las capacidades de razonamiento del modelo original.

La variante Thinking incorpora una cadena de razonamiento larga (long chain-of-thought) que genera un trace de razonamiento explicito antes de producir la respuesta final, lo que mejora sustancialmente el rendimiento en tareas de razonamiento multimodal complejo, matematicas y OCR. La arquitectura combina un encoder de vision SigLIP2 de 400M de parametros con un LLM Qwen3.5 de 0,8B, sumando aproximadamente 1,3B de parametros en total.

El modelo se distribuye bajo licencia Apache-2.0 y es compatible con el ecosistema transformers (>=5.7.0). A diferencia de la version 4.5, el modo Thinking no se activa en tiempo de ejecucion, sino que se distribuye como un checkpoint independiente, lo que permite optimizar cada variante por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-400M (vision, NaViT-packed) + Qwen3.5-0.8B (LLM hibrido con Gated Delta Net y atencion completa) |
| Parametros totales | 1.300.428.016 (~1,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes, 4-bit) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un encoder de vision SigLIP2 de 400M de parametros con un LLM Qwen3.5 de 0,8B de parametros. Segun la documentacion de SGLang, el backbone LLM sigue un estilo Qwen3.5 hibrido que combina Gated Delta Net con atencion completa, logrando un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias largas. El encoder de vision utiliza empaquetado NaViT, que maneja relaciones de aspecto arbitrarias y segmentacion de alta resolucion de forma nativa, con soporte de video de extremo a extremo.

El modelo emplea compresion mixta de tokens visuales de 4x y 16x, seleccionable segun la tarea: 4x para mayor detalle y 16x para mayor eficiencia, con un maximo de 36 slices de imagen. La variante Thinking genera un trace de razonamiento explicito antes de la respuesta final, lo que mejora el rendimiento en razonamiento multimodal complejo, matematicas y tareas intensivas en OCR. Los datos especificos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Comprension de imagenes de alta resolucion con segmentacion adaptativa (hasta 36 slices) y relaciones de aspecto arbitrarias.
- Comprension de video de extremo a extremo con decodificacion mediante torchcodec o PyAV.
- Razonamiento de cadena de pensamiento larga con trace explicito antes de la respuesta final.
- Razonamiento multimodal complejo, incluyendo matematicas visuales y tareas intensivas en OCR.
- Compresion de tokens visuales configurable (4x para mayor detalle, 16x para mayor eficiencia).
- Despliegue en dispositivos de borde: iOS, Android y HarmonyOS, con codigo de adaptacion open source.
- Compatible con Flash Attention 2 para aceleracion y ahorro de memoria en escenarios multi-imagen y video.

## Casos de uso

- Asistente visual en movil: el modelo puede analizar fotografias tomadas con la camara del telefono y responder preguntas sobre su contenido, gracias a su tamano reducido (1,1 GB) y su capacidad de ejecucion en dispositivos iOS, Android y HarmonyOS.

- Digitalizacion de documentos y tickets: su rendimiento en tareas de OCR permite extraer datos estructurados de facturas, tickets y documentos escaneados, con razonamiento contextual para interpretar campos ambiguos.

- Ayuda para personas con discapacidad visual: combinando la comprension de imagenes con el razonamiento de cadena de pensamiento, el modelo puede describir escenas, leer carteles o identificar objetos en tiempo real desde un dispositivo movil.

- Educacion y tutoria asistida: el modo Thinking permite resolver problemas de matematicas o fisica planteados con imagenes (enunciados, diagramas, graficas), mostrando el razonamiento paso a paso para facilitar el aprendizaje.

- Moderacion de contenido visual: el modelo puede analizar imagenes y video para detectar contenido inapropiado o clasificar imagenes en categorias, con despliegue en servidores de bajo coste gracias a la cuantizacion 4-bit y el soporte de vLLM y SGLang.

- Analisis de video en tiempo real: con soporte de video de extremo a extremo, el modelo puede procesar secuencias para resumir eventos, detectar anomalias o extraer informacion temporal en aplicaciones de vigilancia o monitorizacion.

- Automatizacion de soporte tecnico visual: integrado en un chatbot, el modelo puede recibir capturas de pantalla o fotos de errores del usuario y generar una respuesta razonada con pasos de solucion, gracias a su capacidad de tool calling y razonamiento multi-paso.

## Benchmarks y rendimiento

La model card del autor incluye graficas de evaluacion comparativa (rendimiento general en modo Thinking e Instruct, ademas de metricas de eficiencia de inferencia como throughput y TTFT), pero los valores numericos concretos no estan disponibles en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 1,1 GB en cuantizacion NF4 4-bit, lo que permite su ejecucion en dispositivos con memoria limitada.
- El modelo esta disenado para despliegue en dispositivos de borde: demostrado en iPhone 17 Pro Max, Redmi K70 (Android) y HUAWEI nova 14 (HarmonyOS).
- Para inferencia en servidor, se recomienda Flash Attention 2 para aceleracion y ahorro de memoria, especialmente en escenarios multi-imagen y video.
- Compatible con transformers (>=5.7.0), torchvision y torchcodec (o PyAV como alternativa para decodificacion de video).
- Se puede desplegar con vLLM y SGLang segun las recetas disponibles en la comunidad.
- VRAM estimada: no disponible en la informacion proporcionada; el tamano de 1,1 GB en 4-bit sugiere que cabe en GPUs de consumo, aunque el valor exacto depende de la longitud de contexto y el numero de imagenes procesadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 Thinking BNB (este) | ~1,3B | NF4 4-bit | No disponible | Apache-2.0 | Razonamiento multimodal con CoT |
| MiniCPM-V 4.6 Thinking (BF16) | ~1,3B | BF16 | No disponible | Apache-2.0 | Razonamiento multimodal con CoT |
| MiniCPM-V 4.6 (Instruct) | ~1,3B | BF16 | No disponible | Apache-2.0 | Instruccion multimodal sin CoT |

Los tres modelos comparten la misma arquitectura base (SigLIP2-400M + Qwen3.5-0.8B). La variante BNB es la unica cuantizada en 4-bit, y la variante Thinking se diferencia de la Instruct por generar un trace de razonamiento explicito antes de la respuesta final. No se dispone de datos comparativos con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion NF4 en 4-bit puede introducir una ligera degradacion en la precision respecto a los pesos BF16 originales, especialmente en tareas que requieren alta fidelidad numerica.
- La longitud de contexto no esta documentada en la informacion disponible, por lo que se desconoce el limite exacto de tokens de entrada.
- Los idiomas soportados no estan especificados en la informacion proporcionada.
- El modo Thinking genera trazas de razonamiento largas, lo que aumenta la latencia de generacion en comparacion con el modo Instruct.
- Al ser un modelo de ~1,3B de parametros, su capacidad de conocimiento factual es limitada en comparacion con modelos de mayor tamano; puede alucinar en dominios especializados.
- Para video, la compatibilidad de torchcodec con ciertas versiones de CUDA puede requerir el uso de PyAV como alternativa.
- El modo Thinking no se puede alternar en tiempo de ejecucion; requiere cargar el checkpoint especifico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-BNB
- Modelo base (BF16): https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- Modelo MiniCPM-V 4.6 (Instruct): https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-BNB-Demo
- Receta vLLM: https://recipes.vllm.ai/openbmb/MiniCPM-V-4.6
- Documentacion SGLang: https://docs.sglang.io/cookbook/autoregressive/OpenBMB/MiniCPM-V-4_6
- API del servicio: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
