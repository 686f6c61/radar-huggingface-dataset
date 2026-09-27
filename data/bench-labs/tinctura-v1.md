# bench-labs/tinctura-v1

## Resumen

tinctura-v1 es un modelo de lenguaje causal decoder-only de 96.200.064 parámetros desarrollado por bench-labs y entrenado desde cero sobre 75.000 millones de tokens en inglés. Se presenta explícitamente como la receta de cagliostro-v3 reducida a dos tercios del tamaño: misma arquitectura, mismo dataset, mismo schedule y mismo número de tokens, pero con 18 capas en lugar de 30. Es, por tanto, un modelo base (no ajustado para seguir instrucciones) orientado a investigación sobre escalado y a tareas de generación de texto de bajo coste.

Su relevancia está en el nicho de los "small language models" por debajo de 100M de parámetros: obtiene un índice de 20,81 en el Open SLM Leaderboard, lo que lo sitúa segundo en esa franja, a 0,26 puntos de Rose-1.5-Medium (21,07). La model card documenta de forma inusualmente detallada el coste de recortar un tercio de los parámetros, incluyendo la pérdida de ganancia durante la fase de cooldown, y describe un bug real en el data loader que obligó a repetir el cooldown.

El entrenamiento está declarado como completo: 75,00B tokens, 762.939 pasos y learning rate decaído hasta cero (equivalente a unos 98.300 tokens por paso). La ventana de contexto no se especifica en la información disponible, y el modelo solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia cagliostro, `custom_code`) |
| Parámetros totales | 96.200.064 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`, requiere código personalizado) |
| Parámetros sin embeddings | 78,2 % del total |
| Capas | 18 |
| Dimensión oculta (hidden size) | 640 |
| Dimensión intermedia | 1.536 (dato truncado en la model card) |
| Tokens de entrenamiento | 75,00B |
| Pasos de entrenamiento | 762.939 |
| Tamaño del repositorio | 54,7 GB |
| Descargas / likes | 440 / 11 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal de 18 capas, dimensión oculta 640 y dimensión intermedia 1.536, con un 78,2 % de los parámetros fuera de la capa de embeddings. No se emplean mecanismos MoE, SSM ni híbridos: es un transformer denso convencional, empaquetado con código personalizado (`custom_code`), lo que implica que su carga requiere `trust_remote_code=True`. El modelo se entrenó desde cero (no es un fine-tuning ni una destilación) siguiendo paso a paso la receta de cagliostro-v3, lo que permite comparaciones aparcadas en puntos idénticos del entrenamiento.

Los datos provienen de cinco fuentes declaradas: HuggingFaceTB/smollm-corpus, mlfoundations/dclm-baseline-1.0, HuggingFaceTB/finemath, nvidia/OpenMathInstruct-2 y HuggingFaceTB/smoltalk. La mezcla cambia al final del entrenamiento (cooldown), con un salto en la pérdida de entrenamiento en los 63,75B tokens atribuido al cambio de mezcla y no a una mejora del modelo. No se documenta ninguna fase de RLHF o DPO; la presencia de smoltalk y OpenMathInstruct-2 en el dataset apunta a datos de tipo instrucción y matemáticas dentro del preentrenamiento, no a un ajuste posterior. Tras los primeros miles de millones de tokens, la diferencia de pérdida respecto a cagliostro-v3 se estabilizó entre 0,07 y 0,10 y se mantuvo así durante todo el cooldown.

El aspecto técnico más destacable de la model card es la documentación de un fallo en el data loader durante el primer intento de cooldown: al cambiar de mezcla, cada proceso reiniciaba sus hilos de carga y algunos hilos bloqueados con la cola llena seguían produciendo lotes de la mezcla antigua, de modo que cada proceso entrenaba sobre una mezcla híbrida. Un test aislado reprodujo la fuga en 9 de 10 ensayos, con entre un 20 % y un 44 % de lotes contaminados tras el cambio. Se corrigió el loader (cada reinicio recibe su propia cola y los hilos antiguos terminan solos) y se repitió el cooldown desde el paso 644.000; los pesos publicados provienen de esa repetición. La corrección no alteró los benchmarks de forma medible (19,68 frente a 19,55 en el paso 706.000, dentro del ruido de evaluación).

## Capacidades

- Generación de texto causal en inglés: continuación de texto libre, autocompletado y generación de secuencias cortas.
- Razonamiento aritmético elemental: puntúa 38,40 en ArithMark-3, un benchmark aritmético propio del leaderboard, no un estándar de la literatura.
- Conocimiento general básico: 37,96 en HellaSwag y 47,98 en ARC-Easy, valores propios de un modelo de menos de 100M de parámetros.
- Comprensión de sentido común limitada: 65,61 en PIQA y 25,77 en ARC-Challenge, este último prácticamente al nivel del azar.
- Capacidades multilingües: no disponibles. El modelo declara únicamente inglés (`language: en`).
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades especiales (modo thinking, visión, audio): ninguna documentada.
- Al ser un modelo base sin ajuste de instrucciones, no sigue instrucciones ni mantiene diálogos multi-turno de forma fiable sin fine-tuning adicional.

## Casos de uso

- Investigación sobre leyes de escalado: al compartir arquitectura, datos y schedule con cagliostro-v3, permite estudiar el efecto de reducir el número de capas de 30 a 18 manteniendo el presupuesto de tokens, con puntos de comparación aparcados a lo largo de todo el entrenamiento.
- Modelo borrador para decodificación especulativa: con 96M de parámetros es candidato a draft model de un modelo mayor, siempre que el tokenizador sea compatible; el coste por paso es mínimo y el borrador puede proponer varios tokens que el modelo objetivo verifica en paralelo.
- Fine-tuning para clasificación de texto en inglés: con 96M de parámetros el ajuste completo cabe en una GPU de consumo y es viable entrenar clasificadores de sentimiento, tema o intención partiendo del checkpoint preentrenado.
- Pruebas de pipelines de inferencia: sirve como modelo de humo en integraciones continuas para validar despliegues en `transformers`, vLLM o TGI sin consumir recursos de GPU significativos ni encarecer el CI.
- Inferencia en dispositivos con recursos muy limitados: al ocupar menos de 0,4 GB en fp32, puede ejecutarse en CPU, en GPUs integradas o en hardware embebido donde un modelo de 7B no cabría.
- Generación de texto de bajo coste a gran escala: para tareas donde la coherencia fina no es crítica (etiquetado aproximado, expansión de plantillas, generación de relleno), el coste por token es órdenes de magnitud inferior al de un modelo grande.
- Docencia y divulgación: su tamaño permite entrenar, inspeccionar y modificar el modelo en un portátil, y la model card aporta un caso real de depuración de un data loader durante el cooldown.
- Reproducción de evaluaciones: con `lm-evaluation-harness` (backend `hf`, float32) y el script oficial ArithMark-3 se pueden reproducir exactamente las cifras publicadas, lo que lo hace útil como banco de pruebas de metodología de evaluación.

## Benchmarks y rendimiento

Resultados zero-shot medidos sobre los pesos públicos de este repositorio, con el backend `hf` de `lm-evaluation-harness` y el script oficial ArithMark-3, ambos en float32:

| Benchmark | Métrica | Puntuación |
|---|---|---:|
| HellaSwag | acc_norm | 37,96 |
| ARC-Easy | acc_norm | 47,98 |
| ARC-Challenge | acc_norm | 25,77 |
| PIQA | acc_norm | 65,61 |
| ArithMark-3 | acc_norm | 38,40 |
| **Open SLM Index** | | **20,81** |

El Open SLM Index se calcula con la fórmula del propio leaderboard: `(N(HellaSwag,25) + N(CombinedARC,25) + N(PIQA,50) + 0,65*N(ArithMark,25)) / 3,65`, donde `N(v,c) = 100(v-c)/(100-c)` y CombinedARC es la media de ARC-Easy y ARC-Challenge. Las evaluaciones realizadas con el harness de entrenamiento (tokenización separada de pregunta y respuesta, ArithMark-3 en bfloat16) dan 20,77 para el checkpoint final, con diferencias de hasta 0,7 puntos por benchmark; la model card indica que la tabla anterior es la que debe compararse con el leaderboard.

Comparación en la franja sub-100M, con las cifras publicadas por el leaderboard (tinctura-v1 se puntúa con la misma fórmula pero aún no aparece listado en el tablero):

| Modelo | Parámetros | Índice |
|---|---:|---:|
| Rose-1.5-Medium | 98,2M | 21,07 |
| **tinctura-v1** | **96,2M** | **20,81** |
| Surjo-100m | 97,7M | 18,86 |
| cRia-LM-75M | 75,7M | 18,06 |
| Rose-Medium | 97,8M | 17,73 |
| Surjo-50M | 53,8M | 16,40 |

Frente a Rose-1.5-Medium el resultado está dividido: tinctura-v1 va por delante en ARC-Easy y PIQA, empatado en HellaSwag, y por detrás en ARC-Challenge y ArithMark-3. Prácticamente toda la diferencia de 0,26 puntos del índice procede de ArithMark-3, donde 2,3 puntos de desventaja cuestan unos 0,55 de índice por su peso de 0,65. Rose-1.5-Medium se entrenó con aproximadamente 100B tokens según su model card, frente a los 75B de tinctura-v1.

En la comparación con cagliostro-v3 a lo largo del entrenamiento (harness de entrenamiento, mismos checkpoints y mismo código), la diferencia fue de unos 1,7 puntos de índice durante los primeros 20B tokens y de unos 2,9 a partir de ahí; en el paso 646.000, la evaluación aparcada dio 19,34 frente a 21,96. La divergencia se concentra en el cooldown: cagliostro-v3 ganó 4,6 puntos de índice en el último 15 % del entrenamiento y tinctura-v1 solo 1,4. Entre los pasos 646.000 y 706.000 la ganancia fue de 0,21 frente a 1,95; entre 706.000 y 736.000 ambos avanzaron de forma similar (1,23 y 1,32); en el tramo final cagliostro-v3 sumó otros 1,32 mientras tinctura-v1 se mantuvo plano, e incluso terminó el cooldown ligeramente por debajo de donde lo empezó en ARC-Challenge y ArithMark-3.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 0,38 GB (96,2M parámetros × 4 bytes).
- Pesos en bf16/fp16: aproximadamente 0,19 GB.
- Pesos en int8: aproximadamente 0,10 GB. En int4 bajaría a unos 0,06-0,07 GB, pero no se publican versiones cuantizadas; habría que generarlas.
- Caché KV: suponiendo atención multi-cabeza sin GQA y fp16, el coste sería de unos 45 KB por token (2 × 18 capas × 640 dimensiones × 2 bytes), es decir, unos 370 MB para 8.192 tokens. Es una estimación, no un dato publicado; el contexto máximo del modelo se desconoce.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. No se necesita A100 ni H100. Funciona con soltura en RTX 3060, RTX 4060, GTX 1650 o incluso GPUs integradas.
- Cabe en GPU de consumo: sí, con enorme margen, y también en CPU y en hardware embebido.
- Opciones de despliegue: `transformers` es la vía nativa (requiere `trust_remote_code=True` por el código personalizado); también es desplegable en vLLM y TGI. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, no publicada.
- Latencia y throughput: no se han publicado datos en la información disponible.
- Advertencia práctica de descarga: el repositorio ocupa 54,7 GB aunque los pesos del modelo ronden los 0,4 GB, lo que indica la presencia de numerosos checkpoints intermedios. Conviene descargar solo los ficheros necesarios en lugar de clonar el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Open SLM Index | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| tinctura-v1 | 96,2M | no disponible | 20,81 | apache-2.0 | HuggingFace (safetensors) |
| Rose-1.5-Medium | 98,2M | no disponible | 21,07 | no disponible en la información proporcionada | HuggingFace |
| Surjo-100m | 97,7M | no disponible | 18,86 | no disponible en la información proporcionada | HuggingFace |
| cRia-LM-75M | 75,7M | no disponible | 18,06 | no disponible en la información proporcionada | HuggingFace |
| cagliostro-v3 | no disponible (30 capas) | no disponible | no disponible en la franja sub-100M | no disponible en la información proporcionada | HuggingFace |

La información disponible solo permite comparar parámetros, índice y disponibilidad; no hay datos de contexto, licencia ni rendimiento por tarea para los modelos alternativos, salvo las puntuaciones por benchmark de Rose-1.5-Medium que la propia model card menciona de forma cualitativa (por delante en ARC-Challenge y ArithMark-3, por detrás en ARC-Easy y PIQA). cagliostro-v3 no es un comparable directo por tamaño (30 capas frente a 18), pero sí el punto de referencia natural de la receta.

## Limitaciones y advertencias

- Es un modelo base, no un modelo de instrucciones: no sigue instrucciones, no mantiene diálogos multi-turno de forma fiable y no incorpora plantilla de chat documentada. Requiere fine-tuning o ajuste tipo SFT para uso conversacional.
- Rendimiento absoluto bajo: 25,77 en ARC-Challenge está al nivel del azar y 37,96 en HellaSwag indica un conocimiento general muy limitado. No es adecuado para tareas que exijan precisión factual.
- Riesgo elevado de alucinación: al ser un modelo pequeño preentrenado sobre texto web, la generación puede ser incoherente o factualmente falsa con alta frecuencia.
- Idioma: solo inglés. No hay soporte documentado de castellano ni de ningún otro idioma.
- Sesgos: no documentados por el autor. El entrenamiento sobre smollm-corpus y dclm-baseline-1.0 implica exposición a texto web sin curación explícita de sesgos, por lo que es esperable heredar sesgos sociales y de representación.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución siempre que se conserven los avisos de copyright y licencia. No se documentan restricciones adicionales.
- Longitud de contexto desconocida: no se especifica en la información disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Sin versiones cuantizadas publicadas: usar el modelo en formatos GGUF, AWQ o GPTQ exige generarlas por cuenta propia.
- Ruido de evaluación: cada evaluación individual conlleva aproximadamente un punto de ruido, y las cifras varían hasta 0,7 puntos según el harness (float32 con tokenización conjunta frente a bfloat16 con tokenización separada). No deben compararse números de fuentes distintas sin tenerlo en cuenta.
- El checkpoint aún no está listado en el Open SLM Leaderboard de forma oficial, aunque la puntuación se haya calculado con la fórmula del tablero.
- Incidencia de reproducibilidad ya corregida: el primer cooldown se entrenó sobre una mezcla contaminada por un bug del data loader. Los pesos publicados provienen de la repetición corregida, y el autor afirma que el efecto sobre los benchmarks está dentro del ruido, pero conviene tenerlo presente al interpretar la curva de entrenamiento.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que implica ejecutar código del repositorio del autor. Conviene revisarlo antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bench-labs/tinctura-v1
- Modelo de referencia de la receta, cagliostro-v3: https://huggingface.co/bench-labs/cagliostro-v3
- Open SLM Leaderboard (Space de AxiomicLabs): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset HuggingFaceTB/smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset mlfoundations/dclm-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Vídeo incluido en la model card: https://huggingface.co/bench-labs/tinctura-v1/resolve/main/tinctura-v1.mp4
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Todas las coincidencias para el término "bench" corresponden a la marca de ropa Bench (bench.shop, bench.ca, Zalando, Wikipedia), sin relación con bench-labs ni con el modelo. No se han localizado papers, repositorios ni demos adicionales.
