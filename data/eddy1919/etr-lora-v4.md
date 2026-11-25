# Eddy1919/etr-lora-v4

## Resumen

`etr-lora-v4` es un adaptador LoRA desarrollado por Eddy1919 que se aplica sobre un encoder multilingue (XLM-R-base, con LaBSE como ancla cross-lingual en el lado latin/griego) para proyectar el vocabulario etrusco al mismo espacio semantico de 768 dimensiones que el resto del vocabulario multilingue. El objetivo es la recuperacion de vecindades semanticas sobre una lengua antigua de bajos recursos y parcialmente indescifrada, no la traduccion por equivalencia lexica.

El modelo se evalua contra equivalencias etrusco-latinas extraidas de la literatura filologica (Bonfante & Bonfante 2002, Wallace 2008, Pallottino 1968) mediante el benchmark congelado `rosetta-eval-v1`. Es relevante ahora porque aborda un nicho practicamente desatendido por los modelos multilingues modernos: la alineacion semantica de lenguas antiguas con corpus minimos (6.633 inscripciones, ~8.905 tokens unicos etruscos).

Conviene subrayar que el adaptador v4 aun no ha sido evaluado: las unicas cifras publicadas corresponden a la linea base de LaBSE, no al adaptador. El autor lo declara explicitamente y evita publicar un bloque `model-index` para no atribuir a `etr-lora-v4` resultados que pertenecen a LaBSE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre XLM-R-base (768 dim), ancla cross-lingual LaBSE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | etrusco (ett), latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El sistema combina un encoder multilingue XLM-R-base de 768 dimensiones con un adaptador LoRA entrenado especificamente sobre la proyeccion de vocabulario del lado etrusco. El lado latin/griego se ancla con LaBSE para preservar la alineacion cross-lingual existente. El entrenamiento se ejecuto en Vertex AI dentro del proyecto GCP `openetruscan-rosetta`, con el adaptador almacenado en `gs://openetruscan-rosetta/adapters/etr-lora-v4/` y el vocabulario etrusco re-embebido en `gs://openetruscan-rosetta/embeddings/etr-xlmr-lora-v4.jsonl` (8.905 filas x 768 dimensiones).

Los datos proceden de OpenEtruscan corpus v1 (DOI 10.5281/zenodo.20075836): 6.633 inscripciones unificadas, mayoritariamente del Larth Dataset (Vico & Spanakis 2023, ~71% de las filas) y de extracciones del Corpus Inscriptionum Etruscarum Vol. I (~29%). Tras normalizacion de divisores quedan ~8.905 tokens etruscos unicos. No se usan anclas atestiguadas en fuentes primarias durante el entrenamiento: las equivalencias de Bonfante, Wallace y Pallottino se reservan para evaluacion en `rosetta-eval-v1`. El preprocesado del lado etrusco incluye normalizacion por divisores de palabra (la model card se trunca en ese punto).

## Capacidades

- Generacion de embeddings de 768 dimensiones para palabras etruscas y latinas en un espacio semantico comun.
- Deteccion de cognados y prestamos: identificacion de prestamos etruscos al latin como `histrio`, `popa`, `subulo` o `satura`.
- Alineacion de teonimos y toponimos latinizados: recuperacion de vecinos ortograficos para casos como `menrva→minerva`, `hercle→hercules`, `fanu→fanum` (campo teonimico field@10 ≈ 0.33, n=3; tratar como indicativo, no fiable).
- Exploracion de campos semanticos intra-lengua: para una consulta etrusca devuelve palabras latinas de significado relacionado aunque el lema exacto sea incorrecto (p. ej. `papa→[papa, daddy, pater]`).
- Navegacion de vecinos mas cercanos multilingue: la capa de almacenamiento y API esta disenada para admitir otras lenguas antiguas (fenicio, falisco, osco) en el futuro, aunque no hay corpus no etrusco ingerido actualmente.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking: es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Deteccion de prestamos etruscos en latin: dado un termino etrusco, recuperar candidatos latinos por vecindad ortografica y semantica para apoyar el juicio filologico sobre prestamos como `histrio` o `satura`.
- Alineacion de teonimos en textos romanos: para nombres de divinidades latinizados, obtener un ranking corto de correspondencias etruscas que el filologo pueda validar contra fuentes epigraficas.
- Exploracion de campos semanticos en corpus epigraficos: consultar un termino etrusco y revisar los vecinos latinos relacionados para mapear areas de significado en inscripciones votivas o funerarias.
- Apoyo a la edicion critica de inscripciones: generar listas cortas de vecinos semanticos que ayuden a proponer lecturas o paralelos en pasajes fragmentarios, siempre como insumo para el editor.
- Investigacion en NLP de bajos recursos: servir como caso de estudio reproducible de adaptacion LoRA sobre un encoder multilingue con corpus de menos de 10.000 tokens unicos.
- Indexacion y busqueda semantica en archivos epigraficos digitales: construir un indice de embeddings etruscos para busqueda por similitud sobre colecciones como el Corpus Inscriptionum Etruscarum.
- Extension a otras lenguas antiguas: reutilizar la arquitectura de almacenamiento y API para ingerir fenicio, falisco u osco, aunque hoy no hay corpus de esas lenguas servido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del adaptador `etr-lora-v4` en la informacion disponible. Las unicas cifras del benchmark `rosetta-eval-v1` corresponden a la linea base de LaBSE, no al adaptador, y el autor indica que la columna v4 se anadira tras las tareas T2.3 (ingesta de vectores v4 tras feature flag) y T2.4 (evaluacion head-to-head). El unico dato numerico atribuible al sistema es el campo teonimico field@10 ≈ 0.33 con n=3, que el propio autor califica de indicativo y no fiable.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; al tratarse de un encoder base de 768 dimensiones, la huella es propia de un modelo tipo XLM-R-base, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: `sentence-transformers` (uso documentado en la model card) y una API de investigacion local en `src/openetruscan/api`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Nota operativa: el endpoint hospedado `api.openetruscan.com` esta retirado y la recuperacion Rosetta no se expone en la API publica actual (`www.openetruscan.com/api`); debe ejecutarse contra una instancia local. El valor `embedder=xlmr-lora-v4` se acepta pero aun no es funcional y devuelve resultados de LaBSE (pendiente de T2.3).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|---|
| etr-lora-v4 | LoRA sobre XLM-R-base + LaBSE | no disponible | no disponible | ett, la | Apache 2.0 | Adaptador publicado, sin evaluar |
| sentence-transformers/LaBSE | Encoder cross-lingual | no disponible en la informacion | no disponible | 100+ idiomas | no disponible en la informacion | Linea base del benchmark rosetta-eval-v1 |
| XLM-R-base | Encoder multilingue | no disponible en la informacion | no disponible | 100 idiomas | no disponible en la informacion | Base sobre la que se aplica el LoRA |

No se dispone de modelos comparables especificos para alineacion semantica de etrusco en la informacion proporcionada; el resto de alternativas de la misma categoria figuran como "no disponible".

## Limitaciones y advertencias

- El adaptador v4 no ha sido evaluado: no debe citarse ningun resultado de `rosetta-eval-v1` como rendimiento de `etr-lora-v4`, ya que esas cifras pertenecen a LaBSE.
- No realiza traduccion mecanica etrusco-latin: las equivalencias lexicas entre formas superficiales no relacionadas (`clan → filius`, `puia → uxor`, `lautn → familia`) no estan en el modelo y ningun pooling, centrado o fine-tuning LoRA recupera senal ausente del corpus.
- No descifra palabras etruscas desconocidas: los resultados top-k son vecinos ortograficos y semanticos de la forma de origen, no equivalentes semanticos autorizados.
- No es un diccionario: la salida es una lista corta ordenada para juicio filologico posterior.
- El campo teonimico se apoya en n=3 y field@10 ≈ 0.33; el autor lo califica de sugerente, no fiable.
- El corpus es muy reducido (~8.905 tokens unicos etruscos), lo que limita la cobertura lexica y aumenta el riesgo de vecinos espurios.
- El endpoint hospedado esta retirado y el embedder v4 no es funcional en la API actual: en la practica devuelve resultados de LaBSE.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y no evaluada del adaptador desaconseja su uso en produccion sin validacion propia.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgo derivado de la sobrerrepresentacion del Larth Dataset (~71%) y de las extracciones del CIE Vol. I.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eddy1919/etr-lora-v4
- Dataset OpenEtruscan corpus v1 (Zenodo): https://doi.org/10.5281/zenodo.20075836
- Repositorio openEtruscan: https://github.com/Eddy1919/openEtruscan
- Bibliografia del proyecto: https://github.com/Eddy1919/openEtruscan/blob/main/research/BIBLIOGRAPHY.md
- Hallazgos de investigacion (Rosetta como resultado negativo): https://github.com/Eddy1919/openEtruscan/blob/main/research/FINDINGS.md
- Referencia Larth Dataset: Vico & Spanakis 2023 (no se proporciona URL en la informacion disponible)
