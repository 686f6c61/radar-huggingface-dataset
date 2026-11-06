# JhCIFT/CIRF-Qwen3-8B-Instruct-Full

## Resumen

CIRF-Qwen3-8B-Instruct-Full es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por el usuario JhCIFT. El modelo implementa CIRF (un esquema de razonamiento basado en "functional tokens"), en el que el modelo escribe una traza de tokens funcionales con resultados intermedios opcionales antes de emitir la respuesta final. La propuesta resuelve el problema de hacer explicito y auditable el proceso de razonamiento: cada resultado intermedio se supervisa de forma explicita durante el entrenamiento y se escribe en los objetivos de entrenamiento.

El modelo parte de la arquitectura transformer densa de Qwen3-8B, con 8.192.758.784 parametros totales, y anade 514 tokens nuevos al vocabulario (`[sof]`, `[eof]` y `[f_0]` a `[f_511]`) con sus filas de embedding y de salida entrenadas. La actualizacion LoRA se ha fusionado en los pesos BF16 densos, de modo que el checkpoint carga con Transformers estandar sin necesidad de PEFT, del checkpoint base ni de codigo CIRF adicional.

Es relevante ahora porque propone un protocolo de inferencia alternativo al chat template convencional (prompt `QUESTION[sof]`, traza de tokens funcionales, `[eof]` y respuesta final) y publica resultados de evaluacion en varios conjuntos de razonamiento aritmetico y de sentido comun. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.192.758.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); repositorio de 16,4 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Qwen3-8B, un transformer denso de 8.192 millones de parametros. Sobre esa base se introduce un vocabulario CIRF de 514 tokens nuevos: `[sof]` (start of function), `[eof]` (end of function) y `[f_0]` a `[f_511]`, cada uno con su fila de embedding y su fila de salida entrenadas. El entrenamiento se realizo con supervision explicita de resultados: cada resultado intermedio aparece escrito en los objetivos de entrenamiento, de modo que el modelo aprende a emitir una traza de tokens funcionales con valores de resultado opcionales antes de la respuesta final. La actualizacion LoRA resultante se fusiono en los pesos BF16 densos, por lo que el checkpoint es autocontenido.

El protocolo de inferencia es distinto al de un modelo de chat: el prompt tiene el formato `QUESTION[sof]`, sin chat template; el modelo genera la traza de tokens funcionales, emite `[eof]` y a continuacion la respuesta final, deteniendose en el token EOS del tokenizer. La evaluacion publicada limita cada traza a 32 tokens funcionales (forzando `[eof]` al alcanzar el limite), usa decodificacion greedy, un maximo de 384 tokens nuevos y puntuacion por coincidencia exacta de la respuesta. El repositorio incluye `inference.py`, que reproduce ese protocolo con solo Torch y Transformers, ademas de `training_config.json`, `provenance.json` y `export_verification.json` con los ajustes de entrenamiento, los hashes del checkpoint de origen y las comprobaciones de exportacion. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto con razonamiento explicito mediante trazas de tokens funcionales CIRF.
- Razonamiento aritmetico y resolucion de problemas de varios pasos con resultados intermedios escritos en la traza.
- Razonamiento de sentido comun (evaluado en CommonsenseQA y StrategyQA, segun la model card).
- Tareas de simulacion de estados y conteo (Coin Flip), con correccion de paridad en la evaluacion.
- Control del numero de pasos de razonamiento mediante el limite de tokens funcionales (32 en el protocolo de evaluacion).
- Carga directa con Transformers estandar, sin PEFT ni codigo adicional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode nativo de Qwen3): no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de razonamiento aritmetico auditable: el modelo escribe cada resultado intermedio en la traza, lo que permite inspeccionar en que paso se produce un error en problemas de varios pasos, algo util en entornos de investigacion sobre interpretabilidad del razonamiento.
- Investigacion sobre esquemas de razonamiento con tokens funcionales: sirve como referencia reproducible para comparar CIRF con chain-of-thought en texto libre, dado que el autor publica variantes (Zero-Results, Backward-Greedy) y los ficheros de configuracion y procedencia.
- Sistemas de resolucion de problemas matematicos de nivel escolar: con un 73,62% en GSM8K y un 87,00% en SVAMP bajo el protocolo publicado, puede integrarse en pipelines de correccion o tutoria que necesiten trazas verificables.
- Clasificacion y respuesta a preguntas de sentido comun: el 82,56% en CommonsenseQA lo hace adecuado para tareas de QA de conocimiento general en ingles donde se requiera una respuesta corta y una traza de apoyo.
- Simulacion y conteo de estados: el 99,73% en Coin Flip (con correccion de paridad) permite usarlo en tareas de seguimiento de estado paso a paso, como simulaciones de procesos con reglas de transformacion.
- Reproduccion de experimentos: el repositorio incluye `inference.py` y los ficheros de verificacion de exportacion, lo que facilita replicar los resultados publicados en un entorno con solo Torch y Transformers, sin infraestructura de PEFT.
- Generacion de codigo en produccion: no disponible en la informacion proporcionada; el modelo no declara evaluaciones de codigo ni soporte de tool calling.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, puntuacion por coincidencia exacta):

| Conjunto de test | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 73,62% |
| MultiArith | 178 | 100,00% |
| SVAMP | 300 | 87,00% |
| CommonsenseQA | 1.221 | 82,56% |
| Coin Flip (corregido por paridad) | 3.333 | 99,73% |

La model card indica que los resultados completos por conjunto de datos, incluidos MATH-500, StrategyQA y la latencia con batch de 1, estan en `test_results.json`, pero esos valores no se incluyen en la informacion proporcionada. No se han publicado en la informacion disponible resultados comparativos frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, mas memoria para el contexto y las activaciones; en la practica se recomienda una GPU con 24 GB o mas.
- VRAM estimada con cuantizacion: no disponible; el autor no publica variantes cuantizadas ni cifras de cuantizacion.
- GPU recomendadas: no especificadas por el autor; por tamano, encaja en A100 40/80 GB, H100 y RTX 4090 (24 GB) en BF16, con margen limitado en esta ultima.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en otras GPU de 24 GB o mas en BF16; en GPU de 16 GB requeriria cuantizacion, no documentada.
- Opciones de despliegue: Transformers con `device_map="auto"` y `dtype=torch.bfloat16` (protocolo documentado); el tag `text-generation-inference` sugiere compatibilidad con TGI, pero no se detalla configuracion. Compatibilidad con vLLM, llama.cpp u Ollama: no disponible.
- Latencia y throughput: la model card remite a `test_results.json` para la latencia con batch de 1, dato no incluido en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Notas |
|---|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Full | 8.192.758.784 | No disponible | GSM8K 73,62%; MultiArith 100%; SVAMP 87%; CommonsenseQA 82,56%; Coin Flip 99,73% | Apache 2.0 | Requiere protocolo de prompt CIRF (`QUESTION[sof]`), sin chat template |
| Qwen/Qwen3-8B (base) | 8.192.758.784 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 | Modelo base; admite chat template estandar |
| CIRF-Qwen3-8B-Instruct-Zero-Results | No disponible | No disponible | No disponible | Apache 2.0 (presumible, derivado del mismo base) | Variante CIRF sin resultados intermedios en la traza |
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-3/6/12/18/24 | No disponible | No disponible | No disponible | Apache 2.0 (presumible, derivado del mismo base) | Variantes CIRF con busqueda backward greedy de distinto presupuesto |

No se dispone de datos de benchmarks del modelo base ni de las variantes CIRF en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El protocolo de inferencia no usa chat template: requiere el formato `QUESTION[sof]`, parar en EOS (no en `[eof]`) y decodificar con `skip_special_tokens=False`. Un uso con plantillas de chat convencionales producira resultados fuera de distribucion.
- La evaluacion publicada impone un limite de 32 tokens funcionales y 384 tokens nuevos; no se documenta el comportamiento con trazas mas largas ni con otros presupuestos.
- La puntuacion de Coin Flip se corrige por paridad porque aproximadamente el 20% de las etiquetas del dataset discrepan con la paridad de los lanzamientos indicados en la pregunta; conviene tenerlo en cuenta al comparar con otras publicaciones.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo de 8B ajustado por supervision, es esperable en dominios fuera de los conjuntos evaluados.
- Sesgos conocidos: no documentados por el autor.
- No se publican datos de contexto maximo, por lo que no se puede garantizar el comportamiento en conversaciones o documentos largos.
- El modelo tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-11-02); no hay validacion independiente de los resultados publicados.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion deberia ir precedido de una evaluacion propia en el dominio objetivo.
- El repositorio incluye ficheros de procedencia y verificacion de exportacion, pero no se detalla en la informacion disponible el proceso de entrenamiento completo (tokens, composicion del dataset, RLHF/DPO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Variante Zero-Results: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
- Variante Backward-Greedy-24: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
