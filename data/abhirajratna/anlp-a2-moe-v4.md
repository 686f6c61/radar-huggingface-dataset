# abhirajratna/anlp-a2-moe-v4

## Resumen

El modelo abhirajratna/anlp-a2-moe-v4 es un transformer decoder-only entrenado desde cero para traduccion automatica de vietnamita a ingles y de japones a ingles. Lo desarrolla el usuario abhirajratna como parte de una asignatura de ANLP (Advanced Natural Language Processing), y forma parte de una serie de cinco variantes que solo se diferencian en la capa feed-forward. Con 33.575.424 parametros totales y 25.186.816 parametros activos por token, es un modelo muy pequeno orientado a investigacion y experimentacion, no a produccion de alto rendimiento.

Su arquitectura combina un esquema de mezcla de expertos (MoE) en la FFN: tres expertos enrutados con top-1 mas un experto compartido, anchura oculta de 512 y router en float32. El cuerpo del modelo tiene 8 capas, dimension de modelo 512 y 8 cabezas de atencion, con un vocabulario compartido de 16.384 tokens (BPE a nivel de byte para vi/ja/en). Se entreno sobre 114.291.660 tokens no de relleno durante 3 epocas (9.933 pasos) con una tasa de aprendizaje maxima de 0.001.

Su relevancia es didactica y experimental: sirve para estudiar el impacto del diseno de la FFN en un pipeline MoE de traduccion, con resultados medibles en BLEU y chrF sobre un test split propio. No cuenta con licencia declarada ni variantes cuantizadas publicadas, y solo soporta las direcciones vi→en y ja→en, lo que limita su uso fuera de ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de mezcla de expertos (MoE) |
| Parametros totales | 33.575.424 |
| Parametros activos | 25.186.816 por token |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo pesos en precision completa en safetensors) |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors; el codigo del modelo se distribuye en code/part1/ |
| Capas / d_model / cabezas | 8 / 512 / 8 |
| FFN (MoE) | 3 expertos enrutados (top-1) + 1 experto compartido, anchura oculta 512, router en float32 |
| Vocabulario | 16.384 (BPE a nivel de byte, compartido vi/ja/en) |
| Tokens de entrenamiento (sin relleno) | 114.291.660 (3 epocas, 9.933 pasos) |
| Tasa de aprendizaje maxima | 0.001 |
| Tamano del repo | 0,1 GB |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, con 8 capas, dimension de modelo 512 y 8 cabezas de atencion. La innovacion principal reside en la capa feed-forward: en lugar de una FFN densa, emplea un esquema de mezcla de expertos con tres expertos enrutados y seleccion top-1, mas un experto compartido que procesa todos los tokens. La anchura oculta de cada experto es de 512 y el router se mantiene en float32 para mayor estabilidad numerica. Este diseno explica la diferencia entre parametros totales (33.575.424) y activos por token (25.186.816): solo un subconjunto de los expertos enrutados se activa en cada paso.

El entrenamiento se realizo sobre el dataset belumind/en-vi-ja-curated-500k-triplets, con 114.291.660 tokens no de relleno a lo largo de 3 epocas y 9.933 pasos, partiendo de una tasa de aprendizaje maxima de 0.001. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion posterior. La model card indica que este modelo es una de cinco variantes que difieren unicamente en la capa feed-forward, lo que lo situa como un punto de comparacion dentro de un experimento controlado sobre disenos de FFN.

## Capacidades

- Traduccion de vietnamita a ingles (vi→en).
- Traduccion de japones a ingles (ja→en).
- Generacion autoregresiva de texto en ingles a partir de una secuencia de origen etiquetada.
- Manejo de un vocabulario compartido para los tres idiomas mediante BPE a nivel de byte (16.384 tokens).
- Control de formato mediante tokens especiales de idioma y de fin de secuencia: `<|vi|> origen <|en|>` (o `<|ja|> ...`), tras lo cual el modelo continua con la traduccion al ingles y `<|eos|>`.
- No dispone de soporte documentado de tool calling, function calling, uso agentico, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Traduccion de documentacion tecnica de vietnamita a ingles: el modelo puede integrarse en un pipeline de preprocesado que normalice textos de origen en vietnamita y genere versiones en ingles, aprovechando el BLEU de 43,78 obtenido en vi→en sobre el test split propio.
- Localizacion de contenido japones a ingles: util para traducir fichas de producto, articulos o mensajes cortos desde japones, con un BLEU de 33,94 y chrF de 57,93 en ja→en, adecuado para tareas donde se tolere revision humana posterior.
- Prototipado academico y experimentos de investigacion: por su tamano (33,5 millones de parametros) y su naturaleza de asignatura, es apropiado para reproducir experimentos sobre MoE frente a FFN densas en traduccion de baja escala.
- Generacion de datasets sinteticos de traduccion: puede producir pares vi→en o ja→en para aumentar corpus de entrenamiento de modelos mayores, siempre con filtrado por calidad.
- Evaluacion comparativa de arquitecturas: dado que forma parte de una serie de cinco variantes que solo cambian la FFN, sirve como linea base en estudios controlados sobre enrutamiento de expertos.
- Traduccion en entornos de recursos limitados: con un tamano de repo de 0,1 GB y parametros activos de 25,2 millones, puede ejecutarse en hardware modesto para tareas de traduccion puntuales o embebidas.
- Sistemas de traduccion asistida por humanos: integrado como primer paso de un flujo de traduccion con revision, para los pares de idiomas vi→en y ja→en.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card sobre el test split de 24.792 tripletas (49.584 traducciones):

| Metrica | vi→en | ja→en | Global |
|---|---|---|---|
| Perplejidad (tokens objetivo) | 3,375 | 4,358 | 3,835 |
| BLEU (greedy) | 43,78 | 33,94 | 38,9 |
| chrF (greedy) | 63,61 | 57,93 | 60,77 |

Firma sacreBLEU: `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.6.0`.

No se han publicado otros resultados de benchmarks (por ejemplo, MMLU, HumanEval o GSM8K) en la informacion disponible, lo cual es coherente con un modelo especializado en traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 134 MB en FP32, unos 67 MB en FP16/BF16 y unos 34 MB en int8, segun los 33.575.424 parametros totales.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1050, una iGPU moderna o incluso CPU son viables.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales e incluso en dispositivos embebidos tipo Raspberry Pi.
- Opciones de despliegue: la carga se realiza con PyTorch mediante el codigo propio incluido en `code/part1/` (`from part1.model import load_pretrained`). No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI, y dado que la arquitectura MoE es personalizada, requeriria conversion previa para esos runtimes.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La siguiente comparativa usa modelos de traduccion de proposito general como referencia de categoria. Los datos de los modelos de terceros son valores publicos aproximados y deberian verificarse antes de usarlos en una decision.

| Modelo | Parametros | Idiomas / direccion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| anlp-a2-moe-v4 | 33,6 M (25,2 M activos) | vi→en, ja→en | no disponible | no disponible | safetensors |
| Helsinki-NLP opus-mt (Marian) | aprox. 77 M | multiples pares, incluye vi/en y ja/en | no disponible | MIT (tipicamente) | safetensors, PyTorch |
| NLLB-200-distilled-600M | aprox. 600 M | 200 idiomas, multidireccional | no disponible | CC-BY-NC-4.0 | safetensors, PyTorch |
| M2M-100 (418M) | aprox. 418 M | 100 idiomas, multidireccional | no disponible | MIT | PyTorch |

Diferencias clave: el modelo de esta ficha solo traduce en dos direcciones (vi→en y ja→en), no es multidireccional, carece de licencia declarada y no dispone de variantes cuantizadas publicadas. Su ventaja es el tamano reducido y su valor como objeto de estudio de la arquitectura MoE en traduccion.

## Limitaciones y advertencias

- Solo soporta las direcciones vi→en y ja→en; no traduce al vietnamita ni al japones ni en direcciones inversas.
- Modelo entrenado desde cero sobre 114,3 millones de tokens, un volumen muy bajo, por lo que su cobertura lexica y de dominios es limitada.
- No se documenta ninguna fase de alineacion (RLHF, DPO), lo que aumenta el riesgo de salidas poco naturales o desviadas en entradas ambiguas.
- Riesgo de alucinacion y de omision de contenido: como cualquier modelo generativo secuencia a secuencia, puede inventar terminos, omitir segmentos del origen o repetir fragmentos.
- Longitud de contexto no especificada en la model card, por lo que no se puede garantizar el comportamiento con documentos largos.
- Licencia no disponible: el uso comercial es incierto y requiere contactar con el autor antes de cualquier despliegue en produccion.
- Naturaleza academica (etiqueta anlp-assignment): no hay garantias de mantenimiento, soporte ni estabilidad de la API.
- Formato y codigo personalizados: no hay integracion directa con runtimes de inferencia estandar, lo que anade trabajo de ingenieria.
- No dispone de capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling ni uso agentico.
- Sesgos potenciales heredados del corpus de entrenamiento (belumind/en-vi-ja-curated-500k-triplets), no documentados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhirajratna/anlp-a2-moe-v4
- Dataset de entrenamiento: belumind/en-vi-ja-curated-500k-triplets (referenciado en la model card)
- Codigo del modelo: directorio `code/part1/` dentro del repositorio de Hugging Face
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
