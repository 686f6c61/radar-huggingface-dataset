# applepie69/Nanbeige4.3-33B-MTP-head-1026

## Resumen

`applepie69/Nanbeige4.3-33B-MTP-head-1026` es una cabeza de prediccion multi-token (MTP, *multi-token prediction*) entrenada especificamente para el modelo base `Nanbeige/Nanbeige4.3-33B`. No es un modelo autonomo: se trata de un adaptador de 694 millones de parametros (bf16, unos 1,29 GB) que comparte la matriz de embeddings y la LM head del modelo base y que, en teoria, permite a un runtime de decodificacion especulativa generar varios tokens por pasada del modelo grande. La arquitectura sigue el esquema introducido por DeepSeek-V3, con profundidad 1: una capa decoder adicional que predice el token t+2 a partir del estado oculto en t y el embedding de t+1.

El interes del artefacto es fundamentalmente metodologico: demuestra como entrenar por autodestilacion una cabeza MTP para un modelo que no la incorpora de serie, con un coste de computo muy bajo (600.064 tokens de estados ocultos almacenados, extraidos de un modelo base cuantizado a 4 bits NF4 sobre 2 x Tesla T4). Sin embargo, el propio autor la declara **experimental**: la tasa de acierto top-1 frente al modelo base es del 0,9%, muy por debajo del umbral heuristico del 50% que suele considerarse necesario para que la decodificacion especulativa compense, y ningun motor de inferencia (llama.cpp, vLLM, SGLang) soporta todavia el grafo MTP para la arquitectura Llama plana que usa Nanbeige.

Por tanto, esta ficha describe una pieza de investigacion reproducible, no un modelo listo para produccion. Es relevante ahora porque el ecosistema open source esta explorando activamente tecnicas de aceleracion de inferencia (decodificacion especulativa, MTP, *medusa heads*) y este repositorio aporta pesos, implementacion de referencia y numeros honestos de evaluacion para quien quiera portar la idea a otros modelos o continuar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP estilo DeepSeek-V3, profundidad 1 (una capa decoder Llama adicional con atencion y MLP propios), sobre el modelo base Nanbeige4.3-33B |
| Parametros totales | 694 M (solo la cabeza; no incluye embeddings ni LM head, que se heredan del base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para la cabeza; el entrenamiento uso filas de 1024 tokens como maximo |
| Tipos de cuantizacion | bf16 (pesos publicados); el modelo base asociado se uso en NF4 de 4 bits para extraer caracteristicas |
| Idiomas soportados | no disponible (heredados del modelo base Nanbeige4.3-33B) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`mtp_head.safetensors`, bf16, ~1,29 GB) |

## Arquitectura y entrenamiento

La cabeza implementa el esquema MTP de DeepSeek-V3 con profundidad 1. Dado el estado oculto final `h_t` del modelo base (tras `model.norm`) y el embedding `e_{t+1}` del token siguiente, se concatenan ambas representaciones normalizadas (2 x 7168 -> 7168) mediante `eh_proj`, se pasa el resultado por una unica `LlamaDecoderLayer` con atencion y MLP propios, y finalmente se aplica la `lm_head` compartida y congelada del base para predecir el token `x_{t+2}`. Los nombres de tensor siguen la convencion DeepSeek/GLM de una capa extra tras el ultimo bloque (`model.layers.52.*`), incluyendo `enorm`, `hnorm`, `eh_proj` y `shared_head.norm`.

El entrenamiento es por autodestilacion con el modelo base congelado: para cada posicion, la cabeza ve `(h_t, embedding de x_{t+1})` y se optimiza para igualar la distribucion de salida del propio base para `x_{t+2}`, usando divergencia KL a traves de la LM head compartida y congelada. La cabeza se inicializo a partir de una copia de la ultima capa decoder del base. Los datos son texto de chat, razonamiento matematico y codigo, formateado con la plantilla de chat del base y empaquetado en filas de 1024 tokens: `HuggingFaceH4/ultrachat_200k` (split `train_sft`, ~40% de tokens), `open-r1/OpenR1-Math-220k` (split `train`, ~40%) y `bigcode/self-oss-instruct-sc2-exec-filter-50k` (split `train`, ~20%). En total se almacenaron 600.064 tokens de estados ocultos (576 filas de 1024 tokens para entrenamiento y 10 filas reservadas), con 2 epocas, batch de 2 filas, learning rate pico de 0,0002 con schedule coseno, AdamW de 8 bits y autocast fp16. Las caracteristicas se extrajeron del modelo base cuantizado a 4 bits (NF4) en 2 x Tesla T4, por lo que la cabeza encaja mejor con esa configuracion; con pesos bf16 o de 8 bits se espera menor concordancia.

## Capacidades

- Prediccion del token t+2 a partir del estado oculto en t y el embedding de t+1, como borrador para decodificacion especulativa.
- No genera texto de forma autonoma: requiere el modelo base Nanbeige4.3-33B cargado y ejecutandose en paralelo.
- Disenada para integrarse en un runtime de decodificacion especulativa que verifique los tokens propuestos con el modelo grande (en modo greedy la salida deberia coincidir con la decodificacion normal, aunque no se ha probado).
- Profundidad 1: solo propone un token por delante; el encadenamiento de borradores mas profundos no se ha evaluado.
- No soporta tool calling, agentes ni vision por si misma; esas capacidades, si existen, dependen del modelo base.
- Multilingue solo en la medida en que lo sea el base; no se documenta cobertura de idiomas en la model card.

## Casos de uso

- Investigacion en decodificacion especulativa: servir como referencia reproducible para estudiar como entrenar cabezas MTP por autodestilacion sobre modelos que no las incorporan de fabrica, partiendo de los pesos y de `mtp_head.py`.
- Port a motores de inferencia: el repositorio incluye una implementacion de referencia (`MTPHead`, `load_mtp_head`) pensada para que desarrolladores de llama.cpp, vLLM o SGLang la adapten a la arquitectura Llama plana de Nanbeige.
- Experimentos de destilacion de estados ocultos: el pipeline (extraer `h_t` del base cuantizado, almacenar pares con embeddings y entrenar KL contra la LM head congelada) es reutilizable para otros modelos de ~30B en hardware modesto (2 x T4).
- Analisis de aceptacion de borradores: medir la concordancia top-1/top-3 y la KL entre cabeza y base en dominios concretos (chat, matematicas, codigo) para estimar si merece la pena seguir entrenando.
- Docencia y formacion tecnica: ejemplo compacto (694 M de parametros, 1,4 GB de repo) para explicar MTP, decodificacion especulativa y el papel de la verificacion por el modelo grande.
- Base para continuar el entrenamiento: los pesos publicados pueden servir como inicializacion para un entrenamiento mas largo o con mas datos, con el objetivo de superar el umbral de aceptacion del 50%.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre texto reservado del mismo tipo que el de entrenamiento (evaluacion *teacher-forced* sobre texto del dataset, 10.220 posiciones):

| Metrica | Valor | Significado |
|---|---|---|
| Concordancia top-1 | 0,9% | proporcion de posiciones donde la mejor prediccion de la cabeza para t+2 coincide con la del base |
| Top-3 contiene el top-1 del base | 1,9% | proporcion donde el mejor token del base esta entre los tres mejores de la cabeza |
| Divergencia KL | nan | distancia media (nats) entre distribuciones; valor no disponible en la model card |
| Posiciones evaluadas | 10.220 | |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) ni de velocidad de inferencia en la informacion disponible. El autor indica explicitamente que no se ha medido ninguna aceleracion y que la regla heuristica de ~50% de aceptacion para que el borrador compense no se alcanza.

## Requisitos de hardware

- VRAM para la cabeza: unos 1,29 GB en bf16; en fp16 practicamente identico. Se suma a la VRAM del modelo base Nanbeige4.3-33B (no incluida en este repo).
- El modelo base de 33B requiere, como referencia orientativa, del orden de 18-20 GB en cuantizacion de 4 bits, ~33 GB en 8 bits y ~66 GB en bf16; estas cifras no estan publicadas en la model card y deben confirmarse con la del base.
- GPU recomendadas para la cabeza en si: cualquier GPU con ~2 GB libres adicionales; el entrenamiento se hizo en 2 x Tesla T4 (16 GB cada una) con el base en NF4.
- Cabe en GPU de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) solo si el base se ejecuta en cuantizacion de 4 bits y la cabeza en bf16/fp16.
- Opciones de despliegue: ninguna soportada de serie. llama.cpp no tiene grafo MTP para la arquitectura Llama plana de Nanbeige; vLLM y SGLang requeririan una clase de modelo equivalente. La unica via actual es la implementacion de referencia en PyTorch/Transformers (`mtp_head.py`).
- Latencia y throughput: no disponibles; no se ha medido ninguna aceleracion.

## Comparativa con modelos similares

No hay una comparativa directa publicada en la informacion disponible. Como referencia conceptual, se contrasta con otras aproximaciones a la decodificacion especulativa:

| Enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta cabeza MTP (Nanbeige4.3-33B) | 694 M | no disponible (entrenada a 1024 tokens) | aceptacion top-1 0,9%; sin speed-up medido | apache-2.0 | pesos + implementacion de referencia; sin soporte en motores |
| MTP nativo de DeepSeek-V3 | integrado en el modelo (no separable) | segun el modelo base | soportado por el propio modelo y su runtime | licencia del modelo DeepSeek-V3 | nativo en el modelo |
| Cabezas tipo Medusa / EAGLE | cabezas ligeras sobre el base | segun el base | soportadas en vLLM/otros motores | variable | ecosistema mas maduro |
| Modelo base Nanbeige4.3-33B | 33B | no disponible en esta ficha | no disponible | apache-2.0 | Hugging Face |

Los datos de DeepSeek-V3, Medusa y EAGLE no provienen de la informacion proporcionada y se incluyen solo como marco conceptual; consultese cada model card para cifras concretas.

## Limitaciones y advertencias

- Estado experimental declarado por el autor: no es un modelo terminado ni un GGUF, y no sustituye al modelo base.
- Concordancia top-1 del 0,9%, muy por debajo del ~50% heuristico necesario para que la decodificacion especulativa aporte velocidad; es improbable obtener aceleracion sin mas entrenamiento.
- Sin soporte en ningun motor de inferencia: llama.cpp no tiene grafo MTP para la arquitectura Llama plana de Nanbeige; vLLM y SGLang requeririan implementacion propia.
- Sin benchmark de velocidad ni de calidad end-to-end; no se ha verificado que la salida en decodificacion especulativa greedy coincida con la decodificacion normal.
- Entrenada con filas de 1024 tokens como maximo: comportamiento en contextos largos sin evaluar.
- Profundidad 1 unicamente; el encadenamiento de borradores mas profundos no se ha probado.
- Las caracteristicas se extrajeron del base en NF4 de 4 bits: con bf16 u 8 bits se espera menor concordancia.
- Divergencia KL no disponible (`nan` en la model card), lo que limita el diagnostico de la calidad del borrador.
- Riesgo de sesgos y alucinaciones heredado del modelo base Nanbeige4.3-33B y del dataset de entrenamiento (ultrachat, OpenR1-Math, self-oss-instruct); no se documentan evaluaciones de sesgo.
- Licencia apache-2.0 para la cabeza, pero debe verificarse la del modelo base antes de cualquier uso comercial.

## Enlaces

- Repositorio Hugging Face de la cabeza MTP: https://huggingface.co/applepie69/Nanbeige4.3-33B-MTP-head-1026
- Modelo base Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset bigcode/self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Implementacion de referencia: `mtp_head.py` y `mtp_config.json` dentro del repositorio de Hugging Face
