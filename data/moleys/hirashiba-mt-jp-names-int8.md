# Moleys/hirashiba-mt-jp-names-int8

## Resumen

`Moleys/hirashiba-mt-jp-names-int8` es una distribucion cuantizada a INT8 del modelo `chi-vi/hirashiba-mt-jp-names`, un traductor neuronal especializado en transliterar nombres japoneses escritos con caracteres chinos simplificados a romaji (por ejemplo, `㭴本理子` → `kashimoto riko`). El modelo base es un MarianMT de apenas 11,9 millones de parametros (`d_model=256`, 4 capas de encoder y 4 de decoder, vocabulario de 16 738 tokens), lo que lo situa en la categoria de modelos ultraligeros para tareas de traduccion muy acotadas.

El problema que resuelve es concreto y recurrente en pipelines de localizacion: la romanizacion correcta de antroponimos japoneses cuando el texto de entrada emplea el juego de caracteres simplificado chino, un escenario habitual en corpus traducidos desde el chino o en catalogos de contenido con metadatos mixtos. Un traductor generico suele fallar en este paso porque las lecturas on-yomi y kun-yomi dependen del nombre concreto y no de reglas foneticas generales.

La relevancia de esta publicacion es practica: ofrece dos artefactos INT8 listos para produccion en CPU (CTranslate2 de 13,7 MB y ONNX Runtime de 33,3 MB, frente a los 45,5 MB del FP32 en safetensors), con metricas de calidad y de concordancia frente al modelo original. La licencia GPL-3.0 heredada del modelo base condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder MarianMT (seq2seq) |
| Parametros totales | 11,9 M (`d_model=256`, 4+4 capas, vocab 16 738) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (CTranslate2 y ONNX Runtime); referencia FP32 en safetensors y ONNX |
| Idiomas soportados | zh (entrada en caracteres chinos simplificados); salida en romaji |
| Licencia | GPL-3.0 |
| Formato de pesos | CTranslate2 INT8 (`ctranslate2-int8/`), ONNX INT8 (`onnx-int8/`), safetensors FP32, ONNX FP32 |

## Arquitectura y entrenamiento

El modelo base es un MarianMT, la familia de traduccion neuronal seq2seq de Helsinki-NLP, con una configuracion muy reducida: `d_model=256`, cuatro capas en el encoder y cuatro en el decoder, y un vocabulario de 16 738 tokens compartido entre origen y destino. La tarea esta acotada a la transliteracion de nombres, por lo que el modelo no necesita ni la profundidad ni el ancho de un traductor generalista.

Esta publicacion no entrena un modelo nuevo: cuantiza el existente. El proceso documentado incluye `scripts/convert_ct2.py` (conversion a CTranslate2 FP32 e INT8, requiere `ctranslate2>=4.9`), `scripts/build_int8.py` (cuantizacion dinamica ONNX) y `scripts/eval_ct2.py` para la evaluacion. El detalle tecnico mas relevante es que el `decoder_start_token_id` del modelo es `<pad>` (id 16737) y su embedding esta entrenado con valores no nulos; el cargador por defecto de Marian en CTranslate2 asume un embedding de inicio a cero y descarta la fila `<pad>`, lo que produce salidas corruptas de forma silenciosa. La conversion se hizo con `start_from_zero_embedding = False` conservando esa fila.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Transliteracion de nombres japoneses escritos en caracteres chinos simplificados a romaji en minusculas (`㭴本理子` → `kashimoto riko`).
- Traduccion seq2seq restringida a esta tarea; no es un modelo conversacional ni de proposito general.
- Decodificacion con `beam_size` configurable (el autor cita `beam_size=6` como configuracion por defecto del modelo y `beam_size=1` en los ejemplos de uso).
- Ejecucion en CPU con soporte de AVX2, tanto en CTranslate2 como en ONNX Runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada: un unico idioma de entrada declarado (`zh`) y salida en romaji.

## Casos de uso

- Normalizacion de catalogos de contenido: convertir listados de autores, personajes o creditos con nombres japoneses en caracteres chinos a romaji para indices de busqueda y fichas bibliograficas. El modelo es autocontenido (13,7 MB) y se ejecuta en CPU, por lo que puede procesar lotes grandes sin GPU.
- Pipelines de localizacion zh→es/en: insertar el modelo como paso previo de transliteracion antes de un traductor generalista, de modo que el nombre llegue al traductor ya romanizado y se eviten lecturas erroneas.
- Procesamiento por lotes de metadatos: con `batch >= 32` CTranslate2 INT8 es entre 2 y 17 veces mas rapido que ONNX Runtime INT8 segun el autor, lo que lo hace adecuado para reprocesar corpus completos de forma periodica.
- Servicio de bajo coste en produccion: al caber en cualquier CPU moderna con AVX2 y no requerir VRAM, se puede desplegar como microservicio en contenedores pequenos o en el mismo nodo que el resto del pipeline.
- Limpieza de datos para entrenamiento: romanizar nombres de forma consistente en datasets multilingues antes de usarlos para entrenar o evaluar otros modelos.
- Herramientas de edicion y publicacion: integracion en flujos de correccion donde un editor necesita la lectura romaji de un nombre para verificar una traduccion, con latencia de milisegundos en CPU.
- Verificacion de calidad en pipelines ONNX existentes: si la infraestructura ya usa ONNX Runtime, la variante `onnx-int8/` evita anadir una dependencia nueva a costa de un mayor tamano (33,3 MB frente a 13,7 MB).

## Benchmarks y rendimiento

Evaluacion sobre 2000 nombres reservados, con todas las lecturas aceptadas y decodificacion greedy. `Agreement` es la proporcion de salidas identicas al modelo FP32 en PyTorch.

| Modelo | chrF2++ | BLEU (sent.) | Exact match | Agreement |
|---|---|---|---|---|
| FP32 (PyTorch) | 99,343 | 99,33 | 99,25 % | — |
| ONNX INT8 | 99,006 | 99,04 | 98,85 % | 97,80 % |
| CTranslate2 INT8 | 99,288 | 99,18 | 99,05 % | 98,40 % |

Los errores del INT8 son lecturas alternativas de nombres reales (`茜野瞳`: `akeneno hitomi` → `akaneno hitomi`), no cadenas corruptas; el autor indica que no observo bucles de repeticion, truncamientos ni tokens basura.

Rendimiento comparado (segun el autor, sin cifras absolutas publicadas): a tamano de lote 1 con `intra_threads=8`, CTranslate2 es mas lento que ONNX Runtime; con `intra_threads=2-4` la situacion se invierte. A partir de lote 32, CTranslate2 INT8 es entre 2 y 17 veces mas rapido que ONNX Runtime INT8, con la mayor diferencia en `beam_size=6`.

## Requisitos de hardware

- VRAM estimada: 0 GB; ambas variantes estan pensadas para inferencia en CPU.
- GPU recomendadas: no aplica. El modelo es demasiado pequeno para beneficiarse de aceleracion GPU en la mayoria de escenarios.
- Cabe en cualquier CPU consumer con AVX2; el autor verifico el funcionamiento en CPU con AVX2.
- Despliegue: CTranslate2 (recomendado, `ctranslate2>=4.9`) u ONNX Runtime con `optimum.onnxruntime.ORTModelForSeq2SeqLM` y `CPUExecutionProvider`.
- Ajuste de hilos: usar `intra_threads=2-4`; con 8 hilos y lote 1 el rendimiento empeora.
- Dependencias: `sentencepiece` es obligatorio para el tokenizer; el aviso sobre `sacremoses` es inocuo.
- Latencia y throughput absolutos: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hirashiba-mt-jp-names-int8 (CTranslate2) | 11,9 M | no disponible | chrF2++ 99,288; exact match 99,05 % | GPL-3.0 | Hugging Face, 13,7 MB |
| hirashiba-mt-jp-names-int8 (ONNX) | 11,9 M | no disponible | chrF2++ 99,006; exact match 98,85 % | GPL-3.0 | Hugging Face, 33,3 MB |
| hirashiba-mt-jp-names (FP32) | 11,9 M | no disponible | chrF2++ 99,343; exact match 99,25 % | GPL-3.0 | Hugging Face, 45,5 MB |
| Traductores MarianMT generalistas ja/zh | no disponible | no disponible | no disponible para esta tarea | variable | Hugging Face |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada; la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Licencia GPL-3.0 heredada del modelo base: el uso comercial en productos propietarios exige revisar las obligaciones de copyleft con asesoria legal.
- Tarea extremadamente estrecha: solo translitera nombres japoneses en caracteres chinos simplificados; no traduce texto general ni acepta otros sistemas de escritura de entrada.
- Salida siempre en minusculas; hay que aplicar `.title()` si se necesita el formato con mayusculas iniciales que usa el corpus.
- El fallo silencioso del cargador por defecto de Marian en CTranslate2 (embedding de inicio a cero) puede producir basura si se reconvierte el modelo sin `start_from_zero_embedding = False`.
- Riesgo de lecturas alternativas: los errores observados son variantes validas de nombres reales, lo que significa que el modelo puede devolver una romanizacion plausible pero distinta de la esperada.
- No hay informacion publicada sobre sesgos del corpus de entrenamiento ni sobre su composicion, lo que impide evaluar cobertura por regiones, nombres poco frecuentes o variantes ortograficas.
- Longitud de contexto no documentada; el ejemplo de uso fija `max_decoding_length=64`, coherente con nombres cortos, pero no se especifica el limite del encoder.
- Sin datos de latencia absoluta ni de throughput, la planificacion de capacidad en produccion requiere medir sobre el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moleys/hirashiba-mt-jp-names-int8
- Modelo base: https://huggingface.co/chi-vi/hirashiba-mt-jp-names
