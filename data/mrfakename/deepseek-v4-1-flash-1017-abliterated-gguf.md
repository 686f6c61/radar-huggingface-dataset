# mrfakename/DeepSeek-V4.1-Flash-1017-abliterated-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated-GGUF es una cuantización en formato GGUF del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, a la que se le ha aplicado una técnica de "abliteración" (ablación direccional) para eliminar el comportamiento de rechazo. El trabajo lo firma el usuario mrfakename, que ha publicado tanto los pesos editados en precisión completa como estas versiones cuantizadas para llama.cpp. El modelo base es un transformer multimodal con pipeline image-text-to-text, aunque esta distribución GGUF solo soporta texto por ahora.

La relevancia de esta ficha es doble. Por un lado, documenta una de las primeras cuantizaciones públicas de DeepSeek V4.1 Flash, un modelo que en el momento de su publicación no estaba soportado por la rama principal de llama.cpp. Por otro, ejemplifica una práctica controvertida: la eliminación quirúrgica de la capacidad de rechazo mediante álgebra lineal sobre el flujo residual, con métricas explícitas de cuánto de esa edición sobrevive a cada nivel de cuantización.

El repositorio ocupa 1.564,5 GB e incluye cuatro carpetas de cuantización (Q8_0, Q4_K_M, Q3_K_M y Q2_K), una LoRA de rango 2 que aplica la misma edición sobre los pesos originales, y los artefactos del proceso (matriz de subespacio y estadísticas por tensor). La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), capas Engram, capas DSpark/MTP (40-42) y torre de visión (no convertible a GGUF en esta versión); detalles completos no disponibles |
| Parametros totales | 1.297.408 (dato del safetensors del modelo base; unidad no especificada, presumiblemente millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q3_K_M, Q2_K (GGUF); expertos enrutados en MXFP4 nativo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF dividido en 10 archivos por carpeta; LoRA en GGUF; edición en NPZ |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos. La model card menciona explícitamente capas Engram (dos tablas de embeddings de gran tamaño que se leen por filas), capas DSpark/MTP en los índices 40 a 42, expertos enrutados en formato MXFP4 nativo y un flujo residual sobre el que se escriben las salidas de atención (`attn_output_b`) y de la FFN compartida (`ffn_down_shexp`) en 40 capas principales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

La innovación técnica documentada en esta ficha no es del modelo base sino de la edición. El autor detectó que los rechazos del modelo no viven en una única dirección: el modo chat y el modo think rechazan a lo largo de direcciones distintas. Por eso midió direcciones de rechazo por separado para prompts de chat y de think en cada capa, sobre el GGUF Q8_0, y construyó un subespacio de rechazo de rango 2 a partir de los vectores singulares principales de todas esas direcciones. Ese subespacio se proyecta fuera de las escrituras al flujo residual mediante `W' = W - s·QQᵀW`, con una intensidad `s` distinta por capa, elegida mediante una búsqueda multiobjetivo que minimiza rechazos manteniendo baja la KL del primer token en prompts inofensivos. Solo se desquantizaron, editaron y requantizaron los tensores afectados; el resto es idéntico byte a byte a los cuants originales.

## Capacidades

- Generación de texto y razonamiento en modo chat y en modo think (razonamiento explícito).
- Procesamiento de imagen y texto según el pipeline declarado (image-text-to-text), aunque la versión GGUF es solo texto porque la rama de llama.cpp utilizada no convierte la torre de visión.
- Comportamiento "uncensored": el modelo responde a peticiones dañinas que el original rechazaba (4/100 rechazos en chat y 9/100 en think sobre el conjunto de evaluación del autor).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (think mode) con razonamiento separado de la respuesta final.

## Casos de uso

- Investigación sobre alineación y seguridad: el par formado por el modelo original y esta versión abliterada permite estudiar experimentalmente cómo se distribuyen las direcciones de rechazo en un transformer grande, con métricas de KL y tasas de rechazo publicadas y reproducibles.
- Auditoría de robustez de filtros: equipos de seguridad pueden usar la versión abliterada como modelo adversario para probar clasificadores de contenido y políticas de moderación antes de desplegarlas.
- Evaluación de cuantizaciones: las tablas de pérdida de edición por tensor (`attn_output_b` y `ffn_down_shexp`) permiten estudiar cómo el redondeo de cuantización degrada transformaciones de bajo rango, un problema relevante para cualquier técnica de edición de pesos.
- Despliegue local de un modelo de gran tamaño en llama.cpp: con Q2_K (246 GiB) o Q3_K_M (323 GiB) se puede servir el modelo en hardware de gama alta sin depender de APIs externas, usando la rama de llama.cpp que soporta DeepSeek V4.1.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o material sensible donde el comportamiento de rechazo del modelo original resulta un obstáculo, asumiendo la responsabilidad legal y ética del uso.
- Reproducción de experimentos de ablación direccional: el archivo `abliteration-edit.npz` con la base `Q` y las escalas por capa, junto con la LoRA de rango 2, permite replicar la edición sobre otros cuants o adaptarla a modelos similares.
- Análisis de modos de razonamiento: la separación entre chat y think permite estudiar cómo difieren los circuitos de rechazo según el modo de generación, un fenómeno poco documentado.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la propia edición, medidos en Q8_0 con decodificación greedy sobre 100 prompts dañinos reservados y 384 tokens generados por prompt. No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 97 | 4 |
| Rechazos en modo think, cabezas de razonamiento (/100) | 98 | 9 |
| KL del primer token en prompts inofensivos | 0 | 0,067 |

Pérdida de la edición por cuantización (según `patch-stats.txt`):

| Carpeta | `attn_output_b` | `ffn_down_shexp` |
|---|---|---|
| Q8_0 | ~0 % | ~0 % |
| Q4_K_M | ~29 % (Q4_K) | ~15 % (mitad Q4_K, mitad Q6_K) |
| Q3_K_M | ~7 % (Q3_K) | ~34 % (Q4_K) |
| Q2_K | ~90 % (Q2_K) | ~11 % (Q3_K) |

Solo se evaluó Q8_0. El autor advierte que Q2_K rechazará con más frecuencia y recomienda, para cuants pequeños con la edición completa, cargar el cuant original con la LoRA: `llama-server -m Q2_K/...-00001-of-00010.gguf --lora abliteration-lora.gguf`.

## Requisitos de hardware

- VRAM/RAM estimada: Q8_0 requiere 473 GiB, Q4_K_M 414 GiB, Q3_K_M 323 GiB y Q2_K 246 GiB de almacenamiento; en inferencia hay que sumar el espacio de trabajo y el contexto.
- No cabe en ninguna GPU de consumo. Ni siquiera Q2_K entra en una RTX 4090 (24 GB) ni en una RTX 5090.
- Despliegue realista en nodos multi-GPU de centro de datos (A100 80 GB, H100 80 GB, H200) o en configuraciones con offload a RAM del sistema.
- El autor recomienda mantener las dos tablas Engram en CPU por su tamaño y su patrón de acceso disperso: `-ot "engram_embd.weight=CPU"`.
- Motor de inferencia: llama.cpp, concretamente la rama del PR ggml-org/llama.cpp#28696 en el commit `2076412` (repositorio vcruz305/llama.cpp). La rama principal no soportaba DeepSeek V4.1 en el momento de la publicación.
- Latencia y throughput: no disponibles. El acceso a las tablas Engram desde CPU y el tamaño del modelo sugieren un throughput bajo por token en configuraciones con offload.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (original) | 1.297.408 (safetensors) | no disponible | no disponible | safetensors | Comportamiento de rechazo intacto (97/100 en chat) |
| DeepSeek-V4.1-Flash-1017-abliterated | 1.297.408 | no disponible | MIT | safetensors | Edición en precisión completa, sin pérdida por redondeo |
| DeepSeek-V4.1-Flash-1017-GGUF (sin editar) | 1.297.408 | no disponible | MIT | GGUF | Cuants originales; base para aplicar la LoRA |
| Este repositorio (GGUF abliterado) | 1.297.408 | no disponible | MIT | GGUF | Cuants con la edición aplicada in situ |

No se dispone de información sobre modelos comparables de otros fabricantes con el mismo tamaño y arquitectura, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- El modelo cumple peticiones dañinas de forma deliberada. El autor lo declara explícitamente: "This model will comply with harmful requests. You are responsible for how you use it." No es apto para despliegues públicos sin capas de moderación externas.
- La edición no es completa: quedan rechazos residuales (4/100 en chat, 9/100 en think) y algunas respuestas de think mode derivan el tema (el ejemplo del autor: "bomb from household items" se convierte en una bomba de baño).
- Solo se evaluó Q8_0. En Q2_K se pierde aproximadamente el 90 % de la edición en `attn_output_b`, por lo que ese cuant rechazará mucho más.
- La versión GGUF es solo texto: la torre de visión no se puede convertir con la rama de llama.cpp utilizada, pese a que el pipeline declarado sea image-text-to-text.
- Requiere una rama no fusionada de llama.cpp en el momento de la publicación; la compatibilidad con versiones posteriores de la rama principal no está garantizada.
- El tamaño del repositorio (1.564,5 GB) hace inviable su descarga y despliegue en entornos sin almacenamiento y ancho de banda de centro de datos.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor solo reporta la KL del primer token (0,067), que mide desviación de distribución, no veracidad.
- Sesgos: no documentados. La abliteración elimina la dirección de rechazo, no los sesgos de los datos de entrenamiento, que persisten intactos.
- Licencia MIT declarada para esta distribución, pero la licencia y las condiciones de uso del modelo base DeepSeek-V4.1-Flash-1017 no se detallan en la información proporcionada; conviene verificarlas antes de un uso comercial.
- Idiomas soportados: no disponibles. No hay evaluación multilingüe publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Modelo base abliterado (precisión completa): https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
- Cuants originales sin editar: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- PR de llama.cpp con soporte para DeepSeek V4.1: https://github.com/ggml-org/llama.cpp/pull/28696
- Repositorio de la rama utilizada: https://github.com/vcruz305/llama.cpp
- Discord del autor: https://discord.com/invite/foss
