# mobilint/multilingual-e5-small-ko-v2

## Resumen

`mobilint/multilingual-e5-small-ko-v2` es una compilación del modelo de embeddings de frases `dragonkue/multilingual-e5-small-ko-v2` optimizada para ejecutarse sobre la NPU `aries-rb` de Mobilint. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de despliegue: el codificador se cuantiza a 8 bits en pesos y 16 bits en activaciones mediante quantización post-entrenamiento y se compila al formato propietario `.mxq` que consume la pila de aceleración de Mobilint. La tabla de embeddings y el pooling permanecen en el host.

El modelo base deriva de `intfloat/multilingual-e5-small`, un transformer tipo BERT de 96.212.352 parámetros orientado a `feature-extraction` y a la generación de representaciones vectoriales densas para búsqueda semántica y recuperación. La variante de `dragonkue` añade ajuste específico para coreano e inglés, los dos idiomas declarados en esta compilación. La ventana de contexto útil es de 512 tokens, coherente con la familia E5-small.

Su relevancia es acotada pero clara: permite desplegar un modelo de embeddings multilingüe de tamaño reducido en hardware de borde con NPU dedicada, manteniendo una fidelidad numérica muy alta respecto al modelo en fp32. La licencia Apache 2.0 del modelo base se hereda, lo que facilita su uso comercial dentro del ecosistema Mobilint. Fuera de ese hardware, el repositorio no es directamente utilizable, ya que depende de `transformers-mblt` y del runtime `mobilint-qb-runtime`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder) basado en `intfloat/multilingual-e5-small`; codificador compilado a NPU Mobilint `aries-rb` |
| Parametros totales | 96.212.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Pesos 8 bits, activaciones 16 bits (PTQ calibrada); compilado con qbcompiler 1.4.1 |
| Idiomas soportados | Coreano (ko), ingles (en); calibracion con pasajes en 11 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (solo capa de embeddings, sin cambios) + `multilingual-e5-small-ko-v2.mxq` (codificador compilado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer de la familia E5-small, con 96,2 millones de parámetros y un máximo de 512 tokens por secuencia. El modelo base `dragonkue/multilingual-e5-small-ko-v2` parte de `intfloat/multilingual-e5-small` (licencia MIT) y añade ajuste fino orientado a coreano e inglés. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO; esos datos no están publicados en la información disponible.

La innovación de esta compilación no reside en el entrenamiento sino en el despliegue: el codificador se cuantiza mediante quantización post-entrenamiento (PTQ) calibrada sobre 1.024 textos y 241.255 tokens, con un máximo de 512 tokens por muestra, usando los prefijos `query: ` y `passage: ` del modelo base. La calibración combina KLUE-MRC (31,3%, coreano), SQuAD (28,1%, inglés) y pasajes de FineWeb/FineWeb-2 en once idiomas (40,6%). El resultado se compila a `.mxq` para la NPU `aries-rb`. En ejecución, la búsqueda de embeddings se realiza en el host, el encoder en la NPU y el pooling de la última capa oculta se hace de nuevo en el host, con media ponderada por la máscara de atención y normalización L2.

## Capacidades

- Generación de embeddings de frases para búsqueda semántica y recuperación de información (pipeline `feature-extraction`).
- Representaciones densas multilingües, con foco declarado en coreano e inglés y calibración que cubre once idiomas.
- Recuperación pregunta-respuesta y passage retrieval mediante los prefijos `query: ` y `passage: `.
- Similitud semántica de frases (STS) y clustering de textos por similitud coseno.
- Ejecución por lotes con distribución de secuencias sobre varios slots (`max_batch_size=`), procesando cada secuencia sin su padding.
- Selección de modo de cómputo en la NPU: `global8` (por defecto), `global4` y `single`, configurables con `core_mode=` y `target_clusters=`/`target_cores=`.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni modalidades de visión o audio; es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica en coreano e inglés sobre corpus documentales: se indexan pasajes con el prefijo `passage: ` y se consultan con `query: `, usando similitud coseno sobre los vectores normalizados; la ventana de 512 tokens encaja con fragmentos de documento típicos.
- Sistemas de preguntas y respuestas extractivas sobre base documental (RAG): el modelo actúa como retriever en la primera fase, con calidad medida en KorQuAD y SQuAD (R@1 de 0,927 en la validación de 300 consultas).
- Deduplicación y clustering de textos en pipelines de datos: la similitud coseno entre embeddings permite agrupar documentos casi idénticos en lotes, aprovechando el procesamiento por slots de la NPU.
- Moderación y clasificación de contenido por proximidad semántica a prototipos: se calculan embeddings de referencia y se etiquetan entradas nuevas por vecino más cercano, sin necesidad de un clasificador adicional.
- Despliegue en borde con NPU dedicada: escenarios con requisitos de latencia y consumo donde no es viable una GPU, como dispositivos industriales o equipos empotrados con `aries-rb`.
- Búsqueda interna en herramientas de soporte y documentación técnica: indexación de FAQs y manuales en coreano e inglés, con recuperación en tiempo real sobre la NPU.
- Filtrado previo en pipelines de anotación: selección de pares de frases candidatas para etiquetado humano mediante umbral de similitud, reduciendo el volumen a revisar.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad de la compilación respecto al modelo base en fp32 sobre CPU, no el rendimiento absoluto frente a otros modelos. Se presentan tal cual:

| Conjunto | Este build | fp32 (referencia) |
|---|---|---|
| Similitud coseno a fp32 (30.078 textos), media / percentil 1 / mínimo | 0,9990 / 0,9983 / 0,984 | — |
| Coseno a fp32 por idioma (11 idiomas) | 0,9991–0,9992 | — |
| Recuperación QA KorQuAD/SQuAD validación, R@1 (300 consultas) | 0,927 | 0,923 |
| Top-1 idéntico a fp32 | 0,990 | — |
| KLUE-STS | 0,807 | 0,806 |
| KorSTS | 0,781 | 0,781 |
| STSBenchmark | 0,848 | 0,849 |
| Ko-StrategyQA | 0,768 | 0,768 |
| NFCorpus | 0,316 | 0,316 |
| SciFact | 0,683 | 0,687 |

No se han publicado datos de latencia ni throughput en la información disponible. Tampoco hay resultados comparativos con otros modelos de embeddings en la información proporcionada.

## Requisitos de hardware

- NPU Mobilint ARIES (`aries-rb`) con su driver correspondiente; es un requisito obligatorio, no hay ruta de ejecución alternativa documentada.
- Dependencia de software: `transformers-mblt>=0.8.0`, que instala `mobilint-qb-runtime`; build probado con qbruntime 1.5.3.
- VRAM estimada para GPU: no aplica, el modelo no se ejecuta en GPU en esta compilación.
- GPU recomendadas: no disponible; el despliegue objetivo es la NPU, no una GPU.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible en esta compilación. El modelo base en fp32, con 96,2 M de parámetros, cabría en cualquier GPU de consumo, pero esta build no ofrece esa ruta.
- Opciones de despliegue: `transformers` con `transformers_mblt.register()` o `trust_remote_code=True` (ejecuta `proxy_bert_embedding.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| `mobilint/multilingual-e5-small-ko-v2` (esta build) | 96,2 M | 512 | ko, en (calibrado en 11) | Apache 2.0 | NPU Mobilint `aries-rb` |
| `dragonkue/multilingual-e5-small-ko-v2` (base) | 96,2 M | 512 | ko, en | Apache 2.0 | GPU/CPU con transformers |
| `intfloat/multilingual-e5-small` (raíz) | 96,2 M (aprox.) | 512 | multilingüe | MIT | GPU/CPU con transformers |
| `multilingual-e5-base` / `large` (familia E5) | mayor que small | 512 | multilingüe | MIT | GPU/CPU con transformers |

La comparación de rendimiento entre estos modelos no está disponible en la información proporcionada; los únicos datos numéricos publicados son los de fidelidad de esta compilación frente a su propio modelo base en fp32.

## Limitaciones y advertencias

- Dependencia total del hardware Mobilint `aries-rb`: sin esa NPU y su driver, el modelo no es ejecutable.
- El repositorio no contiene los pesos completos en formato estándar: `model.safetensors` solo guarda la capa de embeddings; el codificador está únicamente en el binario `.mxq`. No es posible cargarlo con `transformers` convencional ni con llama.cpp, vLLM u Ollama.
- Ventana de 512 tokens: los textos más largos deben truncarse o fragmentarse, con pérdida de contexto en documentos extensos.
- Idiomas declarados limitados a coreano e inglés; aunque la calibración incluye once idiomas, no hay evaluación publicada de calidad en los restantes.
- Riesgo de alucinación no aplicable en sentido generativo (no genera texto), pero sí riesgo de recuperaciones irrelevantes en dominios alejados de la calibración; NFCorpus obtiene 0,316, un valor bajo que sugiere debilidad en recuperación biomédica.
- La cuantización introduce una desviación mínima pero no nula: el mínimo de similitud coseno a fp32 es 0,984 y el top-1 de recuperación coincide en el 99,0% de los casos, no en el 100%.
- Licencia Apache 2.0 heredada del modelo base, que a su vez deriva de `intfloat/multilingual-e5-small` (MIT); se permite uso comercial, pero conviene conservar los avisos de licencia y verificar las licencias de los datasets de calibración (CC BY-SA 4.0 y ODC-By 1.0).
- El repositorio tiene 23 descargas y 0 likes en el momento de la consulta, lo que indica adopción muy limitada y escasa validación comunitaria.
- No se documentan sesgos específicos del modelo base en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mobilint/multilingual-e5-small-ko-v2
- Modelo base: https://huggingface.co/dragonkue/multilingual-e5-small-ko-v2
- Modelo raíz de la familia E5: https://huggingface.co/intfloat/multilingual-e5-small
- Web de Mobilint: https://mobilint.com
- Dataset KLUE: https://huggingface.co/datasets/klue/klue
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
