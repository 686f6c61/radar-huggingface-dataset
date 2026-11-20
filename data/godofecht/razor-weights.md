# godofecht/razor-weights

## Resumen

Razor weights es un repositorio de pesos cuantizados a int8 e int4 diseñados específicamente para Razor, un motor de inferencia que ejecuta modelos de lenguaje en CPU de teléfonos y portátiles. No se trata de un modelo entrenado desde cero, sino de una conversión de tres modelos base —Gemma 3 1B IT de Google, Qwen3 0.6B de Alibaba Cloud y SmolLM2 135M Instruct de Hugging Face— a un formato binario plano que Razor mapea en memoria directamente. Los ficheros no son cargables por `transformers` ni por `llama.cpp`.

El interés del repositorio reside en su enfoque de despliegue en el borde: pesos empaquetados para lectura directa desde disco sin deserialización, atención de ventana deslizante en el caso de Gemma, y embeddings atados en int8. El autor documenta verificaciones de paridad numérica frente a las referencias fp32, incluyendo pruebas específicas a ambos lados de la ventana de atención de 512 tokens de Gemma 3, donde un error de ventana sería invisible en prompts cortos.

El repositorio tiene 3,6 GB, licencia Apache-2.0 heredada de los modelos base (con los términos adicionales de Gemma 3), y carece de tokenizadores: hay que tomar el `tokenizer.json` del modelo base correspondiente. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de cada modelo base: Gemma 3 1B, Qwen3 0.6B, SmolLM2 135M) |
| Parametros totales | 1B (Gemma 3 1B IT), 0.6B (Qwen3 0.6B), 135M (SmolLM2 135M Instruct) |
| Parametros activos | no disponible (no son modelos MoE) |
| Longitud de contexto | no disponible como valor unificado; Gemma 3 1B usa ventana de atención deslizante de 512 tokens según las pruebas del autor |
| Tipos de cuantizacion | int8 (lineales y embedding atado) e int4 (capas en grupos de 64, embedding atado en int8) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (Gemma 3 sujeto además a los Gemma Terms of Use) |
| Formato de pesos | binario plano `.bin` para memory-mapping por Razor; no compatible con safetensors, GGUF ni transformers |

## Arquitectura y entrenamiento

Los pesos no implican entrenamiento propio: son conversiones de los checkpoints originales de Gemma 3 1B IT, Qwen3 0.6B y SmolLM2 135M Instruct. La arquitectura subyacente es la de cada modelo base, con la particularidad de que Gemma 3 1B emplea atención de ventana deslizante, lo que motivó pruebas de paridad específicas a 354 y 1064 tokens de prompt, a ambos lados de la ventana de 512 tokens.

La innovación técnica está en el formato de almacenamiento. Los ficheros int8 guardan los pesos lineales con forma `[out, in]` y llevan una marca de layout (`__layout_out_in`) para que Razor no tenga que inferir la orientación; esto es necesario porque en Qwen3 las proyecciones K y V son cuadradas y ambos layouts resultan dimensionalmente idénticos, de modo que una orientación incorrecta produce texto fluido pero sin sentido en lugar de un error. El fichero int4 de Gemma almacena `[in, out]` sin marca y Razor lo reempaqueta a su layout int4 durante la carga. Los embeddings están atados: en Gemma 3 y Qwen3 en int8, y en SmolLM2 con embedding fp32 y cabeza atada en int8. No se documentan datos de entrenamiento, tokens vistos ni etapas de RLHF o DPO, ya que no se ha reentrenado ningún modelo.

## Capacidades

- Generación de texto autoregresiva en CPU, heredada de los tres modelos base instruct.
- Razonamiento y respuesta a instrucciones según las capacidades de cada base (Gemma 3 1B IT, Qwen3 0.6B, SmolLM2 135M Instruct).
- Ejecución en dispositivo sin GPU: los pesos están pensados para memory-mapping directo en CPU de móvil y portátil.
- Cuantización int4 con decodificación aproximadamente el doble de rápida que int8 en CPU, al leer la mitad de bytes por token.
- Soporte de prompts largos relativo a la ventana de atención: probado en Gemma 3 hasta 1064 tokens de prompt.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Inferencia local en aplicaciones móviles: el fichero SmolLM2 135M int8 ocupa 249 MB y el Qwen3 0.6B int8 598 MB, tamaños viables para empaquetar en una app y mapear en memoria sin cargar todo el modelo en RAM de golpe.
- Asistentes de texto sin conexión en portátiles: el motor Razor lee los pesos desde disco en CPU, lo que permite funciones de resumen, reescritura o autocompletado sin depender de red ni de GPU.
- Prototipado de motores de inferencia: el repositorio sirve como conjunto de referencia para validar implementaciones de cuantización, con métricas de paridad publicadas (correlación de logits, solapamiento top-50 y coincidencia de token argmax).
- Despliegue con presupuesto de almacenamiento ajustado: la variante Gemma 3 1B int4 ocupa 696 MB frente a 1003 MB en int8, útil cuando el espacio en disco o el ancho de banda de lectura es la restricción principal.
- Verificación de atención de ventana deslizante: las pruebas a 354 y 1064 tokens sirven de caso de test para validar implementaciones de ventana en Gemma 3.
- Evaluación comparativa de cuantización int4 frente a int8: el autor documenta la pérdida de fidelidad de int4 (correlación de logits de 0,959 y 0,847 en dos prompts, con 3 de 24 y 24 de 24 tokens greedy coincidentes) frente a int8 (0,999 y 0,998 con 24 de 24), lo que permite decidir el compromiso precisión/velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de paridad numérica frente a las referencias fp32:

| Modelo | Top-1 (5 prompts) | Solapamiento top-50 | Correlación de logits |
|---|---|---|---|
| Gemma 3 1B int8 | 5/5 | 0,84 | 0,950 |
| Qwen3 0.6B int8 | 5/5 | 0,88 | 0,976 |

| Fichero | Correlación de logits (2 prompts) | Tokens greedy coincidentes |
|---|---|---|
| Gemma 3 1B int4 | 0,959 y 0,847 | 3/24 y 24/24 |
| Gemma 3 1B int8 | 0,999 y 0,998 | 24/24 y 24/24 |

## Requisitos de hardware

- VRAM: no aplica; el motor Razor está diseñado para CPU. El consumo depende del mapeo en memoria de cada fichero.
- Tamaño en disco por fichero: SmolLM2 135M int8, 249 MB; Qwen3 0.6B int8, 598 MB; Gemma 3 1B int4, 696 MB; Gemma 3 1B int8, 1003 MB.
- GPU recomendadas: no disponible; no se contempla ejecución en GPU.
- Cabe en CPU de móvil y portátil: sí, es el objetivo declarado del formato; los ficheros de 249 a 1003 MB son manejables en dispositivos de consumo.
- Opciones de despliegue: exclusivamente el motor Razor. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas; el autor indica que int4 decodifica aproximadamente el doble de rápido que int8 en CPU porque cada token lee la mitad de bytes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Razor weights (este repo) | 135M / 0.6B / 1B | Ventana de 512 tokens en Gemma 3; no disponible para el resto | Binario plano para Razor | Apache-2.0 (Gemma con términos adicionales) | Solo motor Razor |
| Gemma 3 1B IT original | 1B | No disponible en la información | safetensors | Gemma Terms of Use | transformers, ecosistema Hugging Face |
| Qwen3 0.6B original | 0.6B | No disponible en la información | safetensors | Apache-2.0 | transformers, vLLM, llama.cpp (GGUF comunitario) |
| SmolLM2 135M Instruct original | 135M | No disponible en la información | safetensors | Apache-2.0 | transformers, llama.cpp, Ollama |

## Limitaciones y advertencias

- Los ficheros no son cargables por `transformers` ni por `llama.cpp`; solo funcionan con el motor Razor, lo que limita drásticamente su portabilidad.
- No incluyen tokenizador: es obligatorio obtener el `tokenizer.json` del modelo base correspondiente.
- La cuantización int4 degrada la fidelidad: en el primer prompt de prueba, el texto greedy del fichero int4 diverge del de la referencia fp32 tras unos pocos tokens, con correlación de logits de 0,847.
- El layout de los pesos no puede inferirse de las dimensiones en Qwen3 (proyecciones K y V cuadradas); usar un fichero sin la marca `__layout_out_in` requiere transposición en carga y un error de orientación produce texto fluido pero incorrecto sin lanzar excepción.
- Licencia Apache-2.0 heredada, pero Gemma 3 está además sujeto a los Gemma Terms of Use, con las restricciones de uso que estos imponen para uso comercial.
- No se documentan sesgos, idiomas soportados ni tasas de alucinación; al ser conversiones de los modelos base, heredan los sesgos y limitaciones de estos sin evaluación adicional publicada.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado; no hay evidencia de uso en producción ni validación independiente de las métricas de paridad reportadas por el autor.
- Las pruebas de paridad se limitan a cinco prompts (y dos en el caso de int4), una muestra reducida que no caracteriza el comportamiento en dominios diversos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/godofecht/razor-weights
- Modelo base Gemma 3 1B IT: https://huggingface.co/google/gemma-3-1b-it
- Modelo base Qwen3 0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base SmolLM2 135M Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
