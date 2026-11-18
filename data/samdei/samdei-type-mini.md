# samdei/samdei-type-mini

## Resumen

Samdei Type Mini es un modelo de traduccion automatica especializado en convertir khmer romanizado (tal y como se escribe en chats y teclados) a escritura khmer nativa. Lo desarrolla samdei (Samdei Labs) y resuelve un problema muy concreto: los usuarios de khmer escriben frecuentemente con caracteres latinos por comodidad, y este modelo reconstruye la palabra o frase original en alfabeto khmer. Es un encoder-decoder Transformer a nivel de caracter de tan solo 7,1 millones de parametros, disenado explicitamente para ejecutarse en un teclado de movil.

La relevancia del modelo esta en su eficiencia: ocupa 7 MiB como ONNX int8 y procesa una entrada con beam search 5 en 4,9 ms por hilo de CPU en un Apple M5 Pro, lo que lo hace viable para inferencia on-device sin GPU. Se distribuye con licencia Apache 2.0, pesos safetensors y ONNX int8, y una pipeline de reranking con un modelo de lenguaje de palabras que mejora el CER de 0,072 a 0,058.

No es un modelo de proposito general: no hace razonamiento, codigo ni conversacion. Es una herramienta de transliteracion/romanizacion altamente especializada, con un unico idioma de salida (khmer, `km`) y entrenada sobre datos sinteticos de pares romanizado-khmer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Pre-LN (6 capas encoder, 2 capas decoder, d_model 256, 4 cabezas, FFN 1024) |
| Parametros totales | 7.431.611 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada procesada en piezas de 8 palabras con corte tras puntuacion) |
| Tipos de cuantizacion | int8 (ONNX); fp32 en safetensors |
| Idiomas soportados | khmer (`km`); entrada en khmer romanizado (caracteres latinos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 28,4 MiB), ONNX int8 (encoder_kv 5,0 MiB, decoder_step 2,0 MiB) |
| Vocabulario | 215 simbolos de entrada (letras latinas, digitos, puntuacion), 228 simbolos de salida (caracteres khmer y caracteres copiados) |
| Modelo base | samdei/samdei-type-mini-pretrained |
| Libreria | transformers (carga como `BlenderbotForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder Pre-LN a nivel de caracter con 6 capas en el encoder y 2 en el decoder, dimension de modelo 256, 4 cabezas de atencion y FFN de 1024. Los vocabularios de entrada y salida comparten un unico espacio de identificadores (los simbolos de salida primero), lo que hace que transformers cuente 7,43 M de parametros. Se carga como `BlenderbotForConditionalGeneration` porque la arquitectura es identica, aunque no comparte nada mas con BlenderBot.

El entrenamiento se hizo en tres etapas sobre una GPU de portatil (Apple M5 Pro), en unas 3 horas en total: (1) preentrenamiento sobre 6,5 M de pares generados con un generador de escritura basado en reglas a partir de frases khmer reales; (2) ajuste fino sobre 1,16 M de pares de estilo chat; (3) adaptacion al registro coloquial con 1,59 M de pares y replay. Los archivos exactos de entrenamiento estan publicados en `samdei-type-pretraining-data` y `samdei-type-finetuning-data`, con `recipes.json`. No se entreno con datos de evaluacion ni de otros sistemas de romanizacion; el preview publico Akkhara-Preview (110 filas) solo se uso para seleccionar checkpoints de las etapas 1-2, y la etapa 3 uso un conjunto de desarrollo cerrado.

La innovacion practica esta en el despliegue: dos grafos ONNX (`encoder_kv` que se ejecuta una vez por entrada y `decoder_step` que decodifica un token con cache KV y cuyo eje de batch aloja todos los haces) permiten beam search en movil. Ademas, el repositorio incluye un modelo de lenguaje de bigramas de palabras (`lm/wordfull_nowiki_p25.json.gz`, 1,2 MiB) para reranking de las hipotesis de beam search.

## Capacidades

- Transliteracion de khmer romanizado a escritura khmer a nivel de caracter, incluyendo palabras y frases de mensajes cotidianos.
- Preservacion de caracteres copiados (digitos, latinismos como "wifi") dentro de la salida khmer.
- Segmentacion de entradas largas en piezas de 8 palabras con corte tras puntuacion, para mantener la calidad en mensajes extensos.
- Decodificacion con beam search (k=5 por defecto en `generation_config.json`).
- Reranking con modelo de lenguaje de palabras para mejorar la precision (CER 0,058 frente a 0,072 solo con beam).
- Inferencia on-device en CPU con ONNX int8, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- No es multilingue: solo entrada romanizada y salida en khmer.

## Casos de uso

- Teclado de movil para khmer: el modelo se integra como motor de conversion en la app de teclado; con 7 MiB en ONNX int8 y 5,7 ms por pulsacion (rerank incluido) en CPU, la conversion puede ejecutarse en cada tecla sin salir del dispositivo.
- Mensajeria instantanea: conversion de mensajes escritos en romanizado a khmer nativo antes de enviar, manteniendo el registro coloquial gracias al ajuste fino sobre 1,16 M de pares de estilo chat.
- Procesamiento por lotes de chats y foros: normalizacion de grandes volumenes de mensajes romanizados a khmer para analisis de texto, busqueda o archivado, usando la version transformers con beam search.
- Correccion y autocompletado de escritura: dado que el modelo reconstruye la palabra khmer a partir de la secuencia latina, puede emplearse para sugerir la grafia correcta mientras el usuario teclea, con reranking por LM de palabras.
- Aplicaciones educativas de aprendizaje del khmer: mostrar la forma correcta en escritura khmer de una frase romanizada introducida por el estudiante, con exactitud del 24% y CER del 5,8% en el benchmark del autor.
- Pipelines de datos para NLP en khmer: preprocesar corpus que contienen romanizacion mezclada antes de alimentar modelos de lenguaje o traductores que esperan escritura khmer nativa.
- Herramientas de linea de comandos: el paquete `samdei-type` expone `samdei-type "knhom jong tov phsar"` para conversion rapida en scripts y flujos de trabajo de desarrollador.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre Samdei Type Bench (2.155 mensajes y palabras cotidianas con khmer verificado por humanos; metricas CER tras normalizacion y exact match):

| Sistema | CER | Exact match |
|---|---|---|
| Samdei Type Mini, con rerank | 0,058 | 24% |
| Samdei Type Mini, solo beam (ejemplo transformers) | 0,072 | 17% |
| Samdei Type Base, con rerank | 0,052 | 30% |
| Samdei Type Prime (no publicado) | 0,027 | 61% |
| Akkhara-mini, piezas de 6 palabras (0,159 en entradas completas) | 0,066 | 23% |
| AkaraAlpha | 0,281 | 2% |

Notas del autor: Prime es Base entrenado adicionalmente con datos disenados por escenario, redactados por LLM y auditados por humanos, y la mayoria de los items del bench comparten ese diseno, por lo que su ventaja es una cota superior. En entradas completas sin segmentar, el CER solo con beam es 0,218, de ahi la recomendacion de decodificar en piezas.

Rendimiento de inferencia declarado: en un hilo de CPU de Apple M5 Pro, beam 5 tarda 4,9 ms por entrada (p50); con rerank, 5,7 ms por pulsacion. No se ha medido en telefono.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo fp32 ocupa 28,4 MiB y la version ONNX int8 unos 7 MiB en total (encoder 5,0 MiB + decoder 2,0 MiB).
- GPU recomendadas: no aplica; disenado para CPU. Cualquier GPU moderna puede ejecutarlo, pero es innecesaria.
- Cabe en cualquier dispositivo consumer: moviles, Raspberry Pi y portatiles sin GPU. En Apple M5 Pro se midio 4,9 ms por entrada con beam 5.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), ONNX Runtime via el paquete `samdei-type` (backend `onnx`), y CLI `samdei-type`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5,7 ms por pulsacion con rerank en un hilo de CPU de M5 Pro; sin datos de throughput agregado ni de rendimiento en telefono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (bench del autor) | Exact | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Samdei Type Mini | 7,1 M | no disponible (piezas de 8 palabras) | 0,058 (rerank) | 24% | Apache 2.0 | Publicado en HF, ONNX int8 |
| Samdei Type Base | no disponible | no disponible | 0,052 (rerank) | 30% | no disponible | Publicado en HF |
| Akkhara-mini | no disponible | no disponible | 0,066 (piezas de 6 palabras) | 23% | no disponible | no disponible |
| AkaraAlpha | no disponible | no disponible | 0,281 | 2% | no disponible | no disponible |

La comparativa se limita a los sistemas reportados por el autor en su propio benchmark; no hay datos independientes ni especificaciones tecnicas publicas de los competidores en la informacion disponible.

## Limitaciones y advertencias

- Todos los pares romanizado-khmer vistos en entrenamiento son sinteticos (reglas, tablas de escritura minadas y un LLM); la escritura real de usuarios apenas aparece en los datos.
- El exact match es bajo (24% con rerank), por lo que en produccion conviene tratar la salida como sugerencia y no como sustitucion automatica ciega.
- En entradas largas sin segmentar el CER sube a 0,218; es obligatorio decodificar en piezas de 8 palabras con corte tras puntuacion.
- El modelo solo cubre khmer y su romanizacion; no es util para otros idiomas ni para tareas generales de texto.
- Riesgo de alucinacion en palabras raras o nombres propios no vistos, dado el caracter sintetico del corpus de entrenamiento.
- No se han medido latencias en telefono; el rendimiento movil es una extrapolacion de las pruebas en CPU de portatil.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre calidad en dominios fuera del benchmark.
- El modelo se carga como `BlenderbotForConditionalGeneration` por compatibilidad de arquitectura; no debe confundirse con BlenderBot ni esperarse sus capacidades conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samdei/samdei-type-mini
- Modelo base preentrenado: https://huggingface.co/samdei/samdei-type-mini-pretrained
- Modelo Samdei Type Base: https://huggingface.co/samdei/samdei-type-base
- Dataset de preentrenamiento: https://huggingface.co/datasets/samdei/samdei-type-pretraining-data
- Dataset de ajuste fino: https://huggingface.co/datasets/samdei/samdei-type-finetuning-data
- Benchmark Samdei Type Bench: https://huggingface.co/datasets/samdei/samdei-type-bench
- Repositorio del paquete: https://github.com/Samdei-Labs/samdei-type
