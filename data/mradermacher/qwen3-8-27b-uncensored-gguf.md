# mradermacher/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored es una variante del modelo Qwen3.8-27B, desarrollada por JonathanColetti, que ha sido sometida a un proceso de "abliteration" para eliminar los mecanismos de rechazo y censura presentes en el modelo original. El resultado es un modelo de 27.320 millones de parametros que responde sin restricciones de contenido, manteniendo las capacidades tecnicas del modelo base, incluyendo soporte multimodal (vision) y procesamiento de texto en ingles y chino. La version GGUF, cuantizada por mradermacher, permite su ejecucion en hardware de consumo mediante llama.cpp y otros motores compatibles.

Este modelo resulta relevante para desarrolladores que necesitan un LLM sin filtros de seguridad para tareas como generacion creativa, roleplay o investigacion en alineacion de modelos, donde la censura del modelo base podria interferir con los resultados. La cuantizacion GGUF ofrece multiples niveles de precision (de Q2_K a Q8_0) para adaptarse a diferentes capacidades de hardware, desde GPUs de gama media hasta servidores profesionales. El modelo mantiene la arquitectura original de Qwen3.8, con soporte para vision y multi-modalidad, aunque los detalles tecnicos completos de la arquitectura no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (transformer, detalles especificos no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen3.8-27B, que emplea una topologia transformer con soporte multimodal (vision) y mecanismo MTP (multi-modal token prediction). El proceso de "abliteration" aplicado por JonathanColetti elimina selectivamente las capas o neuronas responsables de los comportamientos de rechazo y censura, manteniendo intactas las capacidades de generacion y razonamiento del modelo original. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas como RLHF o DPO en el modelo base.

La cuantizacion GGUF realizada por mradermacher convierte los pesos originales en formato safetensors a GGUF, optimizado para inferencia eficiente en CPU y GPU mediante llama.cpp. Se ofrecen multiples niveles de cuantizacion, desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), ademas de dos archivos mmproj para el componente multimodal. Los quants con imatrix estan disponibles en un repositorio separado (sufijo -i1-GGUF).

## Capacidades

- Generacion de texto sin restricciones de contenido gracias al proceso de abliteration.
- Soporte multimodal (vision) mediante los archivos mmproj incluidos.
- Procesamiento de texto en ingles y chino.
- Razonamiento y generacion de codigo, heredados del modelo base Qwen3.8.
- Capacidad de conversacion multi-turno.
- No se ha confirmado soporte para tool calling o function calling en la informacion disponible.
- No se ha confirmado soporte para agentes o multi-step reasoning.

## Casos de uso

- Generacion creativa sin filtros: escritura de ficcion, poesia o guiones donde el modelo base podria rechazar contenido por politicas de seguridad. La abliteration permite explorar temas controvertidos sin interrupciones.
- Roleplay y simulacion de personajes: ideal para aplicaciones de chat interactivo donde los usuarios esperan respuestas sin censura, manteniendo coherencia contextual en conversaciones largas.
- Vision-language en entornos sin restricciones: combinando el componente mmproj, el modelo puede analizar imagenes y generar descripciones o respuestas sin las limitaciones de seguridad del modelo original.
- Investigacion en alineacion de modelos: permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando respuestas con el modelo base para analizar el impacto de la abliteration.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF, puede ejecutarse en GPUs con 12-24 GB de VRAM (Q4_K_M, Q5_K_M) usando llama.cpp u Ollama, sin necesidad de infraestructura cloud.
- Traduccion y procesamiento bilingue: soporte nativo para ingles y chino, util para aplicaciones que requieren generacion de texto en ambos idiomas sin restricciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (Q2_K) y 29,1 GB (Q8_0) para el modelo principal, mas 0,7-1,0 GB adicionales para el componente multimodal (mmproj).
- GPUs recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4_K_M o superiores; A100/H100 para Q8_0 o despliegues de alta concurrencia.
- En consumer GPU: si, con cuantizaciones Q4_K_S, Q4_K_M o Q5_K_M en GPUs con 16-24 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier motor compatible con GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre modelos comparables en la misma categoria.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que puede provocar que el modelo genere contenido inapropiado, ofensivo o peligroso sin advertencias previas.
- Riesgo elevado de alucinacion en temas especializados, especialmente en cuantizaciones de baja precision (Q2_K, Q3_K).
- Contexto limitado a los idiomas ingles y chino; no se garantiza calidad en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el responsable del despliegue asume la responsabilidad legal del contenido generado.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que puede afectar a aplicaciones que requieran ventanas largas.
- Las cuantizaciones de menor precision (Q2_K, Q3_K) pueden degradar significativamente la calidad de las respuestas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Quants con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-GGUF
