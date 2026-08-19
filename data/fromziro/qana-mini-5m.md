# fromziro/Qana-mini-5M

## Resumen

Qana-mini-5M es un modelo de lenguaje causal de 4,94 millones de parámetros desarrollado por el usuario fromziro, diseñado como un checkpoint de investigación arquitectónica para estudiar el mezclado de canales dependiente del contenido dentro de un bloque feed-forward SwiGLU. El modelo se posiciona como un "generalista compacto" y su propósito declarado es servir para experimentos educativos, análisis de representaciones y comparaciones controladas, no como un asistente listo para producción.

La innovación principal reside en su arquitectura: tras la expansión SwiGLU, las características de cada token se dividen en pequeños fragmentos de canal que se mezclan mediante un grafo de atención denso dependiente del contenido, con un operador centrado `V_mix = [I + s(A(x) - A0)]V` que preserva la representación SwiGLU original en su estado de referencia. El modelo fue entrenado durante 40.000 pasos sobre 20.970 millones de tokens, con una ventana de contexto de 1.024 tokens y un tokenizador propio de 4.096 entradas. Su relevancia actual radica en explorar alternativas eficientes al mezclado de información dentro de bloques feed-forward, una línea de investigación activa en modelos de lenguaje pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con SwiGLU y mezclado de canales (ChannelMix-SwiGLU) |
| Parametros totales | 4.980.576 (4.943.712 segun la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | BF16 nativo (Safetensors); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Ingles (en) |
| Licencia | qana-open-attribution-1.0 (licencia propietaria con atribucion) |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer causal de 10 capas con una anchura oculta de 216 dimensiones. La atencion token-a-token es una atencion de consultas agrupadas (GQA) estandar con 6 cabezas de consulta y 2 cabezas de clave/valor. La innovacion principal reside en el bloque feed-forward: tras la expansion SwiGLU con factor 2x, se obtienen 432 canales que se organizan en 18 fragmentos de 24 canales cada uno. Cada fragmento actua como consulta, clave y valor para un grafo de mezclado denso con 3 cabezas, donde cada cabeza computa una matriz de mezclado de 18x18 dependiente del contenido. El operador centrado `V_mix = [I + s(A(x) - A0)]V` permite que la representacion mixta pase por la proyeccion descendente del bloque SwiGLU. La codificacion posicional es RoPE de mitad contigua (contiguous-half RoPE).

El entrenamiento se realizo durante 40.000 actualizaciones sobre 20.970 millones de tokens, con un lote efectivo de 524.288 tokens por actualizacion y una longitud de secuencia de 1.024. La composicion del dataset fue: FineWeb-Edu 100BT (55%), Cosmopedia v2 (25%), FineWeb-HQ (10%) y FineMath 4+ (10%). Se utilizo computo nativo BF16, AdamW para embeddings y parametros escalares, Muon para matrices ocultas, un warmup de 1.000 actualizaciones, una fase de learning rate plano hasta la actualizacion 30.000 y decaimiento coseno hasta cero en la actualizacion 40.000. El checkpoint final se registro con un BPB normalizado de 1,4241 en WikiText-103.

## Capacidades

- Generacion de texto causal en ingles con ventana de contexto de 1.024 tokens.
- Modelo base: no esta entrenado para seguir instrucciones ni para dialogos.
- Razonamiento de sentido comun limitado, acorde a su tamano (resultados en HellaSwag, PIQA y WinoGrande por debajo de modelos de mayor escala).
- Comprension lectora basica (BoolQ, OpenBookQA, SciQ).
- Capacidad linguistica evaluada con BLiMP (67 subtareas), con precision agregada del 70,13%.
- Aritmetica simple evaluada en ArithMark-3 con 29,90% de precision.
- Sin soporte para tool calling, function calling ni modo agente.
- Sin capacidades multimodales (vision, audio).
- Tokenizador propio de 4.096 entradas, derivado del tokenizador de AxiomicLabs/GPT-S-5M, con prefijo BOS nativo.

## Casos de uso

- Investigacion arquitectonica: el modelo es un banco de pruebas para estudiar el efecto del mezclado de canales dependiente del contenido en bloques SwiGLU, permitiendo comparaciones controladas con arquitecturas estandar de tamano similar.
- Analisis de representaciones: al ser un checkpoint de investigacion, puede usarse para visualizar y analizar como se distribuye la informacion entre los fragmentos de canal y como evoluciona la matriz de mezclado durante el entrenamiento.
- Experimentos educativos: su tamano reducido (menos de 5 millones de parametros) permite ejecutarlo en hardware modesto, siendo util para demostrar conceptos de arquitecturas Transformer y atencion de canales en cursos de deep learning.
- Linea base para estudios de escalado: al estar entrenado con un regimen de sobre-entrenamiento (20,97B tokens para 4,94M parametros, aproximadamente 4.244 tokens por parametro), sirve como referencia para estudiar el impacto del volumen de datos en modelos muy pequenos.
- Pruebas de metodos de cuantizacion y optimizacion: su formato BF16 nativo y su ausencia de KV cache permiten experimentar con tecnicas de compresion o aceleracion sin las complicaciones de modelos con cache.
- Comparaciones controladas de arquitecturas: puede emparejarse con otros modelos de ~5M parametros (como GPT-S-5M o la familia Orez) para aislar el efecto de la innovacion arquitectonica manteniendo el tamano constante.

## Benchmarks y rendimiento

Resultados evaluados zero-shot con lm-eval 0.4.12 en la revision `fa2cd38b2888846e350bf533dc7bd21fbcfc344f`, con pesos BF16, softmax de verosimilitud en FP32, tamano de lote 8 y contexto maximo de 1.024 tokens:

| Tarea | `acc` | `acc_norm` | Perplexity |
|---|---:|---:|---:|
| HellaSwag | 26,85% | 27,60% | n/a |
| ARC-Easy | 36,03% | 34,97% | n/a |
| ARC-Challenge | 16,21% | 23,21% | n/a |
| PIQA | 58,11% | 57,18% | n/a |
| LAMBADA OpenAI | 17,87% | n/a | 229,39 |
| BoolQ | 54,86% | n/a | n/a |
| WinoGrande | 52,64% | n/a | n/a |
| OpenBookQA | 14,80% | 26,80% | n/a |
| SciQ | 68,90% | 60,50% | n/a |
| SWAG | 31,67% | 36,92% | n/a |
| BLiMP (67 subtareas) | 70,13% | n/a | n/a |
| ArithMark-3 | n/a | 29,90% | n/a |

No se han publicado comparaciones directas con otros modelos de tamano similar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene menos de 5 millones de parametros en BF16, lo que supone aproximadamente 10 MB de pesos. La inferencia es viable en practicamente cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 10xx en adelante, RTX serie 20/30/40) es suficiente. No se requiere hardware de datacenter.
- Compatibilidad con consumer GPU: si, el modelo cabe en cualquier GPU consumer actual e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: el modelo usa arquitectura personalizada, por lo que requiere `trust_remote_code=True` en Transformers. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La ausencia de KV cache implica que la generacion autoregresiva recomputa el contexto visible en cada paso, lo que aumenta el coste computacional por token generado.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano del modelo, la latencia por token deberia ser de milisegundos en GPU moderna, aunque la recomputacion del contexto en cada paso penaliza secuencias largas.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa publicados por el autor. Modelos comparables por tamano y proposito incluyen:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| Qana-mini-5M | 4,94M | 1.024 | qana-open-attribution-1.0 | ChannelMix-SwiGLU, investigacion |
| GPT-S-5M (AxiomicLabs) | ~5M | no disponible | no disponible | Fuente del tokenizador |
| Orez Tiny (fromziro) | 1,3M | no disponible | no disponible | Misma familia del autor |

No se dispone de datos de rendimiento comparativo de estos modelos en las mismas tareas.

## Limitaciones y advertencias

- Modelo base sin entrenamiento instructivo: no debe usarse como asistente conversacional ni para tareas que requieran seguir instrucciones.
- Tamano muy reducido: el rendimiento en tareas de razonamiento y conocimiento es limitado, como reflejan los benchmarks (ARC-Challenge 16-23%, OpenBookQA 14-27%).
- Ventana de contexto corta: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ingles: no se evaluo ni entreno para otros idiomas.
- Sin KV cache: la generacion autoregresiva es ineficiente, ya que recomputa el contexto en cada paso.
- Requiere `trust_remote_code=True`: el uso de codigo personalizado en Transformers implica un riesgo de seguridad al ejecutar codigo arbitrario del repositorio.
- Licencia restrictiva: la licencia qana-open-attribution-1.0 no es una licencia open source estandar (como Apache-2.0 o MIT); requiere atribucion y puede imponer restricciones adicionales. Debe revisarse el texto completo de la licencia antes de uso comercial.
- Riesgo de alucinacion: como todo modelo causal pequeno, puede generar contenido plausible pero incorrecto, especialmente en tareas de conocimiento factual.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento con FineWeb-Edu y Cosmopedia puede reflejar sesgos presentes en esos corpus.
- Fecha de creacion reciente (agosto de 2026): el modelo es muy nuevo y no tiene un historial de uso en produccion que permita conocer problemas emergentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fromziro/Qana-mini-5M
- Pagina en OpenCSG: https://opencsg.com/models/fromziro/Qana-mini-5M
- Tokenizador base: https://huggingface.co/AxiomicLabs/GPT-S-5M
- Licencia: https://huggingface.co/User01110/Qana-mini-5M/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/fromziro
- Organizacion qana-ai en GitHub: https://github.com/qana-ai
