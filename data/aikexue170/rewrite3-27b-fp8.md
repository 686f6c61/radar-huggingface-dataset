# aikexue170/rewrite3-27b-fp8

## Resumen
rewrite3-27B es un modelo de lenguaje especializado en la reescritura de novelas web en chino, desarrollado por el usuario aikexue170. Se construye mediante ajuste supervisado (SFT) sobre Qwen/Qwen3.8-27B y su tarea central es tomar texto degradado por generación automática ("八股" o prosa formulaica de IA) y reescribirlo para que resulte fluido, conserve la trama, los personajes y los eventos originales, y adopte un estilo de autor sin copiar literalmente el texto fuente. No es un modelo de continuación ni de creación libre, sino de edición reescritura con preservación de contenido.

El modelo incorpora dos innovaciones destacables: un bucle de razonamiento tipo "editor" que primero analiza los defectos del texto y planifica la reescritura antes de producir el resultado final, y la integración de las puntuaciones JEV (generadas por un clasificador independiente, jevnovel3 0.8B) como parte de la entrada, de modo que el modelo sabe qué frases son más "AI-like" y prioriza su corrección. Además, incluye una cabeza MTP (multi-token prediction) reentrenada que actúa como decodificación especulativa, con una tasa de aceptación de borradores del 56 % en decodificación greedy con n=3 y una aceleración extremo a extremo de aproximadamente 2x.

Esta ficha corresponde a la variante FP8 (W8A8) del modelo, con pesos de 35,9 GB (33,4 GiB), publicada bajo licencia Apache 2.0. El modelo es relevante ahora porque aborda un problema muy concreto del ecosistema de novela web china (la ubicuidad de texto generado por IA de baja calidad) con un enfoque de reescritura controlada y métricas objetivas de calidad (puntuación JEV, grado de desapego del original y longitud de copia literal).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con cabeza MTP para decodificación especulativa |
| Parametros totales | 27B (según el nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 16384`) |
| Tipos de cuantizacion | FP8 (W8A8) en este repo; también publicados BF16, IQ4_XS, Q4_K_M, Q3_K_M, IQ3_XS (GGUF) y NVFP4 (W4A4) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) para FP8; GGUF para las variantes llama.cpp |

## Arquitectura y entrenamiento
El modelo se basa en Qwen3.8-27B, un transformer de 27B parámetros, y se especializa mediante SFT sobre datos de reescritura de novela web en chino. Los datos de entrenamiento incorporan cadenas de pensamiento de estilo editorial: el modelo aprende a identificar dónde el texto suena a IA, por qué, y cómo piensa corregirlo, antes de emitir la reescritura final. La entrada incluye, para cada frase, una puntuación JEV entre corchetes (por ejemplo, 【0.123】) generada por el clasificador independiente jevnovel3 0.8B, que indica la probabilidad de que la frase sea texto degradado por IA. Esta señal guía al modelo sobre qué partes priorizar. El objetivo de entrenamiento impone preservar trama, personajes y eventos, reorganizar oraciones, comprimir redundancias y eliminar el "sabor a IA", permitiendo añadir detalles ambientales, de acción o psicológicos, pero no inventar elementos de la historia.

La innovación técnica más destacable es la cabeza MTP reentrenada sobre datos v14-sfw, que no es la original de Qwen. En decodificación greedy con n=3 alcanza una tasa de aceptación del 56 % y aproximadamente 2x de aceleración extremo a extremo. Las versiones GGUF incluyen el módulo MTP empaquetado, activable con `--spec-type draft-mtp` en llama.cpp. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades
- Reescritura de texto en chino con preservación de trama, personajes y eventos.
- Análisis editorial previo: identifica problemas de estilo "AI-like" y planifica la corrección antes de escribir.
- Uso de puntuaciones JEV externas como señal de entrada para localizar las frases a corregir (también funciona sin ellas, aunque fuera de la distribución de entrenamiento).
- Reorganización a nivel de párrafo, no mera sustitución de sinónimos.
- Compresión de redundancias y eliminación de prosa formulaica de IA.
- Adición controlada de detalles ambientales, de acción y psicológicos (sin inventar escenarios).
- Decodificación especulativa mediante cabeza MTP integrada (aceleración ~2x).
- Capacidades multilingües: limitadas al chino (zh) según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo está orientado a una tarea única de reescritura).

## Casos de uso
- Limpieza de manuscritos de novela web: un editor introduce capítulos con marcas JEV por frase y el modelo devuelve una versión reescrita con menor "sabor a IA", manteniendo la historia intacta; es adecuado porque el entrenamiento está específicamente orientado a esta tarea y las métricas JEV validan la mejora.
- Preprocesado en pipelines de publicación: integrar el modelo como etapa de reescritura antes de la publicación en plataformas de novela web, con control de longitud y de copia literal (restricción de no copiar más de 15 caracteres consecutivos).
- Detección y corrección de texto generado por IA: usar las puntuaciones JEV del clasificador jevnovel3 0.8B como entrada y la reescritura del modelo como salida para "humanizar" contenido generado automáticamente.
- Edición asistida con estilo de autor: el modelo permite conservar la voz del autor mientras elimina fórmulas repetitivas, útil para autores que quieren pulir borradores sin perder identidad.
- Despliegue local con recursos limitados: la variante IQ4_XS (GGUF) ofrece tiempos de ~41 s frente a ~71 s del FP8 en la misma máquina, con JEV solo ligeramente peor (0,0982 frente a 0,0966), adecuada para estaciones de trabajo con VRAM ajustada.
- Servicio de inferencia de alto rendimiento: con vLLM ≥ 0,28 y `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}'` se obtiene la aceleración MTP en producción; útil para plataformas que procesan muchos capítulos.
- Evaluación comparativa de cuantizaciones: el repositorio incluye una tabla de referencia (FP8, IQ4_XS, NVFP4) que permite elegir el formato según el equilibrio calidad/velocidad requerido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye una evaluación específica de la tarea con seis prompts, comparando formatos de cuantización:

| Formato | JEV medio ↓ | Desapego ↑ | Copia máxima (car.) ↓ | Copia total ↓ | Longitud del texto | Muestras demasiado largas | Tiempo medio |
|:--|--:|--:|--:|--:|--:|--:|--:|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |

El "desapego" es la proporción de ventanas de 5 caracteres ausentes del original (mayor es mejor); la copia mide caracteres idénticos al original (menor es mejor). La conclusión del autor es FP8 > IQ4_XS > NVFP4 en calidad; IQ4_XS es casi el doble de rápido. BF16 no se evaluó en esta batería; Q3_K_M, Q4_K_M e IQ3_XS quedan pendientes de prueba.

## Requisitos de hardware
- VRAM para FP8 (W8A8): pesos de 35,9 GB (33,4 GiB), más KV cache; el ejemplo de despliegue usa `--kv-cache-dtype fp8` y `--gpu-memory-utilization 0.9`.
- VRAM para BF16: pesos de 54,7 GB, requiere GPU de 80 GB (A100/H100) o múltiples GPUs.
- VRAM para IQ4_XS (GGUF): no se especifica el tamaño exacto, pero es la opción indicada para "VRAM ajustada o despliegue local"; requiere comprobar el tamaño del archivo GGUF.
- GPU recomendadas: no se listan explícitamente; por tamaño, FP8 encaja en A100 80 GB, H100 80 GB; NVFP4 está pensado para Blackwell (según la model card).
- GPU de consumo: no se confirma que quepa en RTX 4090 (24 GB) en FP8; las variantes GGUF de 4 y 3 bits son las candidatas para GPUs de consumo, sin datos de VRAM exactos.
- Opciones de despliegue: vLLM ≥ 0,28 (con `qwen3_5_mtp` para MTP), llama.cpp (GGUF con `--spec-type draft-mtp`), y presumiblemente Ollama/TGI si soportan los formatos, aunque no se confirma.
- Latencia/throughput: tiempos medios de 71 s (FP8), 41 s (IQ4_XS) y 43 s (NVFP4) en la misma máquina para la batería de seis prompts, incluyendo razonamiento y texto final.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-27B (este) | 27B | no disponible | Reescritura de novela web en chino con JEV y MTP | Apache 2.0 | HF (FP8, BF16, GGUF, NVFP4) y ModelScope |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Modelo generalista | no disponible en la información | HF |
| jevnovel3 0.8B | 0,8B | no disponible | Clasificador de "AI-like" (no generativo) | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría (reescritura especializada) en la información proporcionada. La comparación más directa es con su modelo base Qwen3.8-27B, del que hereda arquitectura y tamaño, pero del que no se detallan resultados comparativos.

## Limitaciones y advertencias
- El modelo solo soporta chino (zh); no se ha validado su comportamiento en otros idiomas.
- Está especializado en reescritura de novela web; su uso en otras tareas de generación no está validado y probablemente rinda por debajo de un modelo generalista.
- Depende de las puntuaciones JEV como entrada; sin ellas funciona, pero fuera de la distribución de entrenamiento y con peor rendimiento esperado.
- Riesgo de "añadir material" (detalles ambientales, de acción o psicológicos) que puede alargar el texto respecto al original; la model card reporta 3/6 muestras demasiado largas en FP8 con el prompt de reducción.
- Restricción de copia literal: el proyecto impone no copiar más de 15 caracteres consecutivos, pero la evaluación reporta copias máximas de 25-31 caracteres según formato, por lo que la restricción no se cumple estrictamente en todos los casos.
- Riesgo de alucinación en detalles inventados si el prompt no acota el grado de "adición"; los sesgos específicos no están documentados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Qwen3.8-27B) puede tener condiciones propias que no se detallan en la información disponible; conviene verificar la licencia del base antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- El despliegue con MTP requiere vLLM ≥ 0,28 y el método `qwen3_5_mtp`; en llama.cpp requiere `--spec-type draft-mtp`; versiones anteriores no lo soportan.

## Enlaces
- Hugging Face (FP8): https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Hugging Face (BF16): https://huggingface.co/aikexue170/rewrite3-27b-bf16
- ModelScope (BF16): https://modelscope.cn/models/alkaid5555 (enlace truncado en la model card; verificar)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
