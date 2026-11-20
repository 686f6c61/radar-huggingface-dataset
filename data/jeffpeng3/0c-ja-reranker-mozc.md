# jeffpeng3/0c-ja-reranker-mozc

## Resumen

0c-ja-reranker-mozc es un reranker cross-encoder en formato ONNX desarrollado por jeffpeng3 para la conversion de kana a kanji en japones (IME, input method editor). El modelo puntua cada candidato de superficie contra el contexto izquierdo y derecho ya decodificado, y permite que el decodificador de lattice combine esa puntuacion con los costes estadisticos de palabra y conexion del diccionario. Es, por tanto, un componente de segunda etapa que reordena candidatos generados por un motor estadistico, no un modelo generativo.

Se trata de la variante "Mozc-pack" (ruta de pesos `public-core`), distinta del artefacto `jeffpeng3/0c-ja-reranker` publicado bajo CC BY-SA 4.0, que no queda reemplazado por este repositorio. La arquitectura es un transformer encoder de 8 capas con d_model 512, 8 cabezas y FFN de 1024, con 33,8 millones de parametros y un vocabulario SentencePiece de 32.768 piezas. El modelo se distribuye en fp32 y en int8 dinamico, con ejes de batch y secuencia dinamicos.

Su relevancia es acotada pero concreta: documenta con detalle un caso de reranking en un pipeline de conversion japonesa y publica mediciones honestas que muestran una regresion en el benchmark de conversion `modern-500` cuando el reranking se activa. El autor recomienda explicitamente mantenerlo desactivado por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, 8 capas, d_model 512, 8 cabezas, FFN 1024 |
| Parametros totales | 33.864.193 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 120 tokens por lado en entrenamiento (seq 244); 60 tokens por lado en despliegue (seq 124) |
| Tipos de cuantizacion | fp32 (`model.onnx`) e int8 dinamico sin calibracion (`model.int8.onnx`) |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.int8.onnx`) + tokenizer SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en un transformer encoder de 8 capas con d_model 512, 8 cabezas de atencion y FFN de 1024, sobre un vocabulario SentencePiece de 32.768 piezas. La entrada son `input_ids` y `attention_mask` como int64 de forma `[batch, seq]`, y la salida es un `float32 [batch]`: un cabezal escalar que lee exclusivamente el slot del candidato. Las posiciones absolutas estan ancladas a la derecha (BOS 0, contexto izquierdo 61..120, `<eos>` 121, candidato 122, `<eos>` 123, contexto derecho 124..183). Mantener esas posiciones absolutas de entrenamiento al acortar el contexto en despliegue cuesta 0,15 puntos en el benchmark; alimentar seq 124 con posiciones `arange` por defecto no cuesta nada.

El entrenamiento parte de los pesos del piloto P2-23E public-core (6.000 pasos) y se afina durante 2.000 pasos con batch 64, learning rate 6e-4 (cosine, 300 de warmup), bf16, perdida listwise y semilla 20261118, sobre 128.000 grupos. Los datos provienen del split de entrenamiento de `homophone-mozc-v1` (120.000 grupos): el texto de corpus es exclusivamente public-core y las lecturas y costes de candidatos son de Mozc; no se usan textos CC BY-SA, ni `modern-500`, ni `hard-cases`. El entrenamiento se ejecuto en una NVIDIA GB10 en 18 minutos.

## Capacidades

- Puntuacion de candidatos de conversion kana-kanji en un esquema cross-encoder (un candidato por inferencia contra el contexto decodificado).
- Integracion con decodificacion por lattice: la puntuacion se combina con los costes estadisticos de palabra y conexion del motor.
- Salida escalar por candidato, apta para reordenar grupos de entre 3 y 8 candidatos.
- Soporte de batch y secuencia dinamicos en el grafo ONNX.
- Inferencia en CPU o GPU via ONNX Runtime (la model card cita `libonnxruntime.so.1.32.0`).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un componente especializado de reranking.

## Casos de uso

- Conversion IME japonesa en produccion: el modelo se integra en el motor `jc-ime` como etapa de reranking opcional (`--rerank on`) sobre el pack lexico `ja-lexicon-mozc-v2.pack`, reordenando los candidatos que genera el decodificador de lattice.
- Reordenacion de candidatos homofonos: en grupos de 3 a 8 candidatos con lecturas identicas, el cross-encoder aporta senal contextual que el orden estadistico no captura; segun la model card, acierta en el 83,96% de los grupos de validacion (top-1) y el 99,89% en top-5.
- Investigacion en IME y procesamiento morfologico japones: sirve como referencia reproducible de un pipeline completo (corpus, lexico Mozc, benchmark propio, informe de analisis) para estudiar donde falla el reranking frente al orden estadistico.
- Despliegue ligero en entornos con recursos limitados: con 33,8 M de parametros y una variante int8 de 34 MB, cabe en cualquier CPU moderna y en GPUs de gama baja, sin necesidad de aceleradores dedicados.
- Evaluacion de latencia en pipelines interactivos: la model card reporta p50 de 33,4 ms con reranking activo frente a 3,5 ms sin el, dato util para decidir si el coste es asumible en escritura en tiempo real.
- Base para fine-tuning sobre otros lexicos o dominios: el esquema de entrenamiento (perdida listwise, posiciones ancladas a la derecha, formato ONNX) es reutilizable para adaptar el reranker a vocabularios especializados.

## Benchmarks y rendimiento

Benchmark `homophone-mozc-v1`, construido sobre el corpus public-core y el pack lexico de Mozc, con 8.000 grupos de validacion y 8.000 de test, contextos reales de corpus, 3 a 8 candidatos por grupo, y `modern-500` y `hard-cases` reservados:

| Split | Top-1 | Top-5 | MRR |
|---|---:|---:|---:|
| validacion (despliegue, seq 124) | 83,96% | 99,89% | 0,9067 |
| test (despliegue, seq 124) | 84,36% | 99,76% | 0,9090 |
| validacion (entrenamiento, seq 244) | 84,51% | 99,90% | 0,9098 |

El checkpoint CC BY-SA en produccion obtiene 68,25% top-1 en el mismo benchmark (validacion, layout de despliegue).

Medicion de conversion con `modern-500` usando `jc-ime` y `--pack ja-lexicon-mozc-v2.pack`:

| Configuracion | Top-1 | Top-5 | p50 | Timeout |
|---|---:|---:|---:|---:|
| `--rerank off` | 86,0% | 98,0% | 3,5 ms | 0% |
| este modelo, `--rerank on` | 82,0% | 95,0% | 33,4 ms | 0,2% |
| modelo anterior, `--rerank on` | 82,0% | 95,2% | 38,7 ms | 4,4% |

El reranking empeora el top-1 de `modern-500` (de 86,0% a 82,0%). En `hard-cases` se mantiene en 54,3% top-1 (top-5 91,4%, p50 24,1 ms). La causa esta en el decodificador: el delta de coste anadido al lattice es la diferencia de puntuaciones en bruto con escala 1.0, mientras que los costes de diccionario estan en el orden de los miles; solo los grupos casi empatados pueden cambiar la ruta de Viterbi, y la precision del modelo en esos grupos aun no supera al orden estadistico.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (135,6 MB de pesos) y alrededor de 40 MB en int8 (34,3 MB de pesos); el cuello de botella es la memoria de activaciones, minima con seq 124.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime; el entrenamiento se realizo en una NVIDIA GB10, pero la inferencia no requiere hardware dedicado.
- Cabe en GPU de consumo: si, en cualquier RTX o incluso en CPU. La model card no cita requisitos minimos especificos.
- Opciones de despliegue: ONNX Runtime (probado con `libonnxruntime.so.1.32.0`), integrado en `jc-ime` mediante `JC_JA_MODELS` y un `manifest.json` de tipo `jc.model-set/1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un cross-encoder de este tamano.
- Latencia y throughput: p50 de 33,4 ms por grupo con reranking activo en `modern-500` (frente a 3,5 ms sin reranking); timeout del 0,2%. En `hard-cases`, p50 de 24,1 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 (`homophone-mozc-v1`, validacion) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| 0c-ja-reranker-mozc (este) | 33,8 M | 120 tokens/lado (entrenamiento), 60/lado (despliegue) | 83,96% | CC BY 4.0 | Hugging Face, ONNX |
| jeffpeng3/0c-ja-reranker (CC BY-SA) | no disponible | no disponible | 68,25% | CC BY-SA 4.0 | Hugging Face |
| Rerankers genericos multilingues (p. ej. bge-reranker) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparativa con rerankers genericos no esta disponible en la informacion proporcionada: el benchmark `homophone-mozc-v1` es propio del autor y no se han publicado resultados de terceros sobre el.

## Limitaciones y advertencias

- El reranking regresiona el top-1 en `modern-500` (86,0% a 82,0%) y el autor recomienda mantenerlo desactivado por defecto (`--rerank off`).
- La causa de la regresion es estructural: el delta de coste anadido al lattice (escala 1.0) es despreciable frente a los costes de diccionario (orden de miles), por lo que solo afecta a grupos casi empatados, donde el modelo no supera al orden estadistico.
- La latencia se multiplica por casi 10 al activar el reranking (3,5 ms a 33,4 ms de p50), con un 0,2% de timeouts.
- Ambito linguistico restringido al japones y a la tarea de conversion kana-kanji; no es un modelo generativo ni sirve para otras tareas de NLP.
- Entrenado exclusivamente sobre el lexico y los costes de Mozc; su rendimiento con otros diccionarios o packs lexicos no esta documentado.
- El modelo no sustituye al artefacto `jeffpeng3/0c-ja-reranker` (CC BY-SA 4.0); son artefactos distintos con licencias distintas.
- Licencia CC BY 4.0: permite uso comercial con atribucion; los hashes de origen y la atribucion estan en `NOTICE`. El diccionario de Mozc es BSD 3-Clause (Copyright 2010-2018 Google Inc.) y se usa como fuente de lecturas y costes, no como texto de entrenamiento.
- No se han publicado datos sobre sesgos, riesgo de alucinacion (no aplica en sentido generativo) ni comportamiento fuera del dominio de conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeffpeng3/0c-ja-reranker-mozc
- Modelo previo (CC BY-SA 4.0): https://huggingface.co/jeffpeng3/0c-ja-reranker
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Informe de analisis del reranking: `docs/reports/P2-26-mozc-rerank.md` en el repositorio de entrenamiento (no se proporciona URL publica)
- Mozc (diccionario, BSD 3-Clause): no se proporciona URL en la informacion disponible
