# byun1u/opus-mt-tc-big-zle-de-onnx-int8

## Resumen

`byun1u/opus-mt-tc-big-zle-de-onnx-int8` es una conversion al formato ONNX con cuantizacion dinamica int8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tc-big-zle-de`, desarrollado originalmente por Jörg Tiedemann y el equipo OPUS-MT de la Universidad de Helsinki. El modelo original es un transformer-big de Marian NMT entrenado sobre datos de OPUS (Tatoeba Challenge) y publicado en marzo de 2022. La tarea concreta es la traduccion desde tres lenguas eslavas orientales (bielorruso, ruso y ucraniano) hacia el aleman.

Esta version no es un lanzamiento oficial de los autores originales: solo se ha cambiado el formato de los pesos (exportacion ONNX, cuantizacion int8 dinamica y tokenizer reconstruido a partir del SentencePiece original). El repositorio ocupa aproximadamente 0,4 GB, lo que supone una reduccion significativa frente al checkpoint original en fp32, y esta pensado para inferencia en CPU con ONNX Runtime y para entornos JavaScript mediante transformers.js.

La relevancia de esta ficha radica en que combina un modelo de traduccion consolidado (familia OPUS-MT tc-big) con un formato optimizado para despliegue ligero, manteniendo la licencia CC-BY-4.0 del original. Es util para pipelines de traduccion de bajo coste en produccion, especialmente en escenarios donde no hay GPU disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, variante transformer-big) |
| Parametros totales | no disponible (checkpoint transformer-big; el repo ONNX int8 ocupa 0,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (pesos int8, activaciones cuantizadas en tiempo de ejecucion) |
| Idiomas soportados | be, ru, uk (origen) y de (destino) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder y decoder merged cuantizados), tokenizer.json |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder de tipo `transformer-big` entrenado con Marian NMT sobre datos de OPUS, en el marco del Tatoeba Translation Challenge. El checkpoint original se publico el 19 de marzo de 2022 (`opusTCv20210807_transformer-big_2022-03-19.zip`). El vocabulario es compartido entre origen y destino (un unico `tokenizer.json` sirve tanto para codificar como para decodificar), y no hay token de idioma destino porque solo existe un destino (aleman): basta codificar el texto y anadir `</s>`.

La conversion realizada en este repositorio consta de tres pasos documentados: exportacion ONNX con `optimum` (fp32, opset 18, decoder merged con soporte de past key/values), cuantizacion dinamica con `onnxruntime.quantization.quantize_dynamic` (`QuantType.QInt8`, `per_channel=False`, `reduce_range=False`, `EnableSubgraph=True` para alcanzar las ramas `If` del decoder merged) y construccion de un `tokenizer.json` de tipo Unigram a partir de `vocab.json` y `source.spm`, con normalizador precompilado y pre-tokenizador `WhitespaceSplit` + `Metaspace`. El script de conversion verifica la equivalencia del tokenizer con `MarianTokenizer`: 294-300 de 300 lineas FLORES-200 produjeron ids identicos en las cinco conversiones tc-big. No se documenta en la informacion disponible ningun proceso de RLHF, DPO ni ajuste adicional tras el entrenamiento original.

## Capacidades

- Traduccion automatica de texto de bielorruso, ruso y ucraniano hacia aleman.
- Generacion de texto seq2seq condicionada (encoder-decoder) con decodificacion greedy o beam search (beam 4 medido).
- Soporte de cache de key/values mediante el decoder merged (`use_cache_branch`), lo que acelera la decodificacion autoregresiva.
- Tokenizer compartido origen/destino, lo que simplifica el pipeline (un solo `tokenizer.json`).
- No dispone de tool calling, function calling, modo de razonamiento, vision, audio ni capacidades de agente.
- Capacidad multilingue limitada estrictamente a las cuatro lenguas declaradas (be, ru, uk, de).
- Despliegue en CPU via ONNX Runtime y en entornos JS via transformers.js.

## Casos de uso

- Traduccion de documentacion tecnica de ruso y ucraniano a aleman: el modelo puede procesar lotes de parrafos en CPU con ONNX Runtime, sin necesidad de GPU, gracias al formato int8 y al decoder merged con cache.
- Localizacion de contenido editorial multilingue: integrable en un pipeline que reciba texto en be/ru/uk y produzca aleman, con beam search para calidad y greedy para throughput.
- Subtitulado y transcripcion: traduccion de segmentos cortos provenientes de ASR en ruso o ucraniano hacia aleman, donde la latencia por segmento es critica y el modelo ligero en CPU resulta adecuado.
- Atencion al cliente en mercados eslavos: traduccion de mensajes entrantes en ruso/ucraniano/bielorruso a aleman para agentes o sistemas de ticketing que operan en aleman.
- Investigacion en traduccion automatica de bajos recursos: el par zle-deu y la familia tc-big son referencia en Tatoeba Challenge, y esta version ONNX facilita experimentos reproducibles sin infraestructura GPU.
- Despliegue en el navegador o en edge: mediante transformers.js (formato de layout Xenova), el modelo puede ejecutarse en entornos JavaScript sin backend Python.
- Filtrado y moderacion de contenido multilingue: traduccion previa al aleman de textos en lenguas eslavas orientales para aplicar clasificadores entrenados solo en aleman.

## Benchmarks y rendimiento

Mediciones publicadas en la model card de este repositorio, sobre FLORES-200 devtest (primeras 150 frases), ONNX Runtime en CPU, con COMET-22 (`Unbabel/wmt22-comet-da`) y chrF (sacrebleu 2.6, chrF2), escalados x100:

| Direccion | Greedy (COMET-22 / chrF) | Beam 4 (COMET-22 / chrF) |
|---|---|---|
| uk→de | 82,8 / 55,6 | 83,0 / 56,5 |

Solo se midio la direccion uk→de. Para BLEU y chrF upstream sobre Tatoeba, FLORES-101 y WMT, la model card remite a la model card del modelo original. No se han publicado en la informacion disponible resultados de benchmarks para las direcciones be→de ni ru→de en esta version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo esta pensado para CPU con ONNX Runtime; en GPU, el repo int8 ocupa 0,4 GB, por lo que la huella de pesos es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria puede alojar los pesos int8; no se dispone de datos de throughput en GPU en la informacion proporcionada.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (por ejemplo GTX 1650, RTX 3060, RTX 4090) por holgura de memoria; el caso de uso declarado es CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), transformers.js (Xenova) en JavaScript, y cualquier runtime compatible con ONNX (por ejemplo, servidores de inferencia ONNX). No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje generativo sino un seq2seq de traduccion.
- Latencia y throughput estimados: no disponibles. La model card solo indica que las mediciones se hicieron en CPU con ONNX Runtime, sin cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| byun1u/opus-mt-tc-big-zle-de-onnx-int8 (este) | transformer-big (no disponible) | no disponible | be, ru, uk → de | CC-BY-4.0 | ONNX int8 | Conversion no oficial, orientada a CPU |
| Helsinki-NLP/opus-mt-tc-big-zle-de | transformer-big (no disponible) | no disponible | be, ru, uk → de | CC-BY-4.0 | PyTorch/safetensors (checkpoint Marian) | Modelo original, fp32, referencia upstream |
| Helsinki-NLP/opus-mt-ru-de | no disponible | no disponible | ru → de | CC-BY-4.0 | PyTorch | Variante de menor tamano de la familia OPUS-MT, solo ruso |
| Helsinki-NLP/opus-mt-uk-de | no disponible | no disponible | uk → de | CC-BY-4.0 | PyTorch | Variante de menor tamano de la familia OPUS-MT, solo ucraniano |

No se dispone en la informacion proporcionada de datos de rendimiento comparativos entre estas variantes; la comparacion se limita a parametros declarados, idiomas, licencia y formato.

## Limitaciones y advertencias

- No es un lanzamiento oficial: los autores originales (Tiedemann y OPUS-MT) no han validado esta conversion; la responsabilidad de la cuantizacion y del tokenizer recae en el autor del repositorio (`byun1u`).
- La cuantizacion int8 dinamica puede introducir degradacion de calidad respecto al modelo fp32 original; solo se documenta una medicion (uk→de) y no hay comparacion directa fp32 vs int8 en la informacion disponible.
- Cobertura de benchmarks incompleta: solo se midio uk→de; be→de y ru→de no tienen resultados publicados en esta model card.
- Riesgo de alucinacion y errores de traduccion inherente a cualquier sistema NMT, especialmente en terminologia especializada, nombres propios y textos con ruido.
- Sesgos: no se documentan analisis de sesgo; al entrenarse sobre OPUS (datos web y paralelos), puede heredar sesgos de dominio y de genero gramatical del corpus.
- Limitaciones de contexto: la longitud maxima de contexto no esta disponible en la informacion proporcionada; textos largos deben segmentarse.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; es necesario citar a los autores originales (ver seccion de citas de la model card) y indicar los cambios realizados (conversion de formato y cuantizacion).
- El tokenizer reconstruido puede diferir del original en un pequeno porcentaje de casos (se reportan 294-300 de 300 lineas identicas en la verificacion), lo que puede afectar marginalmente la fidelidad de la tokenizacion.
- Sin soporte de tool calling, agentes ni multimodalidad; no debe emplearse como modelo de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byun1u/opus-mt-tc-big-zle-de-onnx-int8
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-de
- Revision del checkpoint original usada: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-de/tree/b2e247f0c413ca6aa51a32f2f2be8666cf72405e
- Checkpoint Marian original: https://object.pouta.csc.fi/Tatoeba-MT-models/zle-deu/opusTCv20210807_transformer-big_2022-03-19.zip
- Marian NMT: https://marian-nmt.github.io/
- OPUS: https://opus.nlpl.eu/
- Tatoeba Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Paper OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.61
- Paper Tatoeba Translation Challenge (Tiedemann, 2020): https://aclanthology.org/2020.wmt-1.139
