# byun1u/opus-mt-tc-big-zle-zle-onnx-int8

## Resumen

`byun1u/opus-mt-tc-big-zle-zle-onnx-int8` es una conversion a ONNX con cuantizacion int8 dinamica del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tc-big-zle-zle`, desarrollado por Jörg Tiedemann y el equipo OPUS-MT de la Universidad de Helsinki. El modelo original es un transformer-big de Marian NMT entrenado sobre datos de OPUS (Tatoeba Challenge) y publicado en marzo de 2022. Esta version no altera los pesos mas alla de la conversion de formato y la cuantizacion; es un artefacto de despliegue, no una nueva aportacion cientifica.

El modelo resuelve traduccion multilingue entre las lenguas eslavas orientales: bielorruso (bel), ruso (rus) y ucraniano (ukr), en cualquier direccion entre las tres. Es un modelo multi-target: cada entrada debe comenzar con un token de idioma destino (`>>bel<<`, `>>rus<<`, `>>ukr<<`). Su relevancia actual radica en que permite ejecutar traduccion de calidad en CPU y en entornos ligeros (navegador, edge, contenedores pequenos) gracias al formato ONNX int8, con un peso total de aproximadamente 0,3 GB.

La ficha se centra en el artefacto publicado por `byun1u`, cuyas mediciones propias solo cubren las direcciones uk→ru y ru→uk sobre FLORES-200 devtest.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer-big de Marian NMT (encoder-decoder) |
| Parametros totales | no disponible (pesos int8: encoder ~114 MB, decoder ~177 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (pesos int8, activaciones cuantizadas en tiempo de ejecucion) |
| Idiomas soportados | bielorruso (be), ruso (ru), ucraniano (uk) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer-big de Marian NMT, publicado el 7 de marzo de 2022 y entrenado sobre datos de OPUS en el marco del Tatoeba Challenge. El checkpoint original es `opusTCv20210807+bt_transformer-big_2022-03-07`. La arquitectura es un encoder-decoder clasico con atencion completa; no incorpora mecanismos MoE, SSM ni atencion lineal. El vocabulario es compartido entre origen y destino, construido con SentencePiece.

La conversion realizada por `byun1u` parte de la revision `779c880171613b8962211d06d77c946a5b79bceb` y aplica tres pasos: exportacion ONNX con `optimum` 2.1.0 (`optimum-onnx` 0.1.0, `torch` 2.15.0+cpu, `transformers` 4.57.6, opset 18, tarea `text2text-generation-with-past`, decoder fusionado con y sin past key/values en un unico grafo controlado por la entrada `use_cache_branch`); cuantizacion dinamica con `onnxruntime.quantization.quantize_dynamic` (`QuantType.QInt8`, `per_channel=False`, `reduce_range=False`, `EnableSubgraph=True` para alcanzar las ramas `If` del decoder fusionado); y construccion de un `tokenizer.json` compatible con `tokenizers` a partir de `source.spm` y `vocab.json`. La verificacion del tokenizer dio ids identicos en 294-300 de 300 lineas de FLORES-200 (rango sobre las cinco conversiones tc-big). No se aplico RLHF ni DPO; el entrenamiento es el original de Marian sobre corpus paralelos de OPUS.

## Capacidades

- Traduccion automatica entre bielorruso, ruso y ucraniano en las seis direcciones posibles (bel→rus, bel→ukr, rus→bel, rus→ukr, ukr→bel, ukr→rus).
- Modelo multi-target: seleccion del idioma destino mediante token prefijo (`>>bel<<`, `>>rus<<`, `>>ukr<<`).
- Generacion autoregresiva con cache de clave/valor (decoder fusionado con rama `use_cache_branch`).
- Decodificacion greedy o beam search (se han medido ambas; beam 4 no aporta mejora apreciable en las direcciones medidas).
- Tokenizer Unigram con pre-tokenizador `WhitespaceSplit` + `Metaspace("▁")` y decoder `Metaspace`, sin post-procesador (el `</s>` se anade manualmente).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un modelo de traduccion texto a texto.

## Casos de uso

- Traduccion de documentacion tecnica entre ruso y ucraniano: el modelo traduce parrafos completos con COMET-22 de 93,0 en ru→uk sobre FLORES-200 devtest, adecuado para localizar manuales y guias de producto.
- Traduccion en el navegador o en el cliente: al ser ONNX int8 de ~0,3 GB, puede ejecutarse con `transformers.js` (formato Xenova) u ONNX Runtime Web sin enviar el texto a un servidor, lo que resulta util para contenido sensible.
- Procesamiento por lotes en CPU en pipelines de datos: la cuantizacion int8 dinamica permite servir traduccion en servidores sin GPU, reduciendo coste frente a un despliegue en fp32.
- Normalizacion de corpus multilingues eslavos: traduccion de conjuntos de datos de bielorruso, ruso y ucraniano a una lengua comun para tareas de analisis o entrenamiento posteriores.
- Atencion al cliente en regiones de habla rusa y ucraniana: traduccion de tickets y conversaciones entre ambos idiomas con latencia baja en CPU, integrable en un servicio de mensajeria.
- Subtitulado y localizacion de contenido audiovisual: traduccion de subtitulos entre ru y uk con un modelo ligero que cabe en un contenedor pequeno y no requiere GPU.
- Traduccion de documentacion oficial y administrativa entre bielorruso, ruso y ucraniano, donde la cercania linguistica favorece traducciones de alta similitud lexica.

## Benchmarks y rendimiento

Mediciones propias del artefacto ONNX int8 sobre FLORES-200 devtest, primeras 150 frases, ONNX Runtime en CPU, COMET-22 (`Unbabel/wmt22-comet-da`) y chrF (sacrebleu 2.6, chrF2), valores ×100:

| Direccion | Greedy (COMET-22 / chrF) | Beam 4 (COMET-22 / chrF) |
|---|---|---|
| uk→ru | 92,1 / 57,3 | 92,2 / 57,2 |
| ru→uk | 93,0 / 56,8 | 93,0 / 56,8 |

Las direcciones con bielorruso no fueron medidas por el autor de la conversion. Para BLEU y chrF del modelo original sobre Tatoeba, FLORES-101 y WMT, la model card remite a la del modelo base; no se incluyen esos valores en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el artefacto esta pensado para inferencia en CPU con ONNX Runtime.
- Memoria RAM estimada: el repositorio ocupa 0,3 GB; la carga en memoria de los dos grafos ONNX int8 ronda ese orden de magnitud, mas el overhead del runtime.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime CUDA podria ejecutarlo, pero no es el escenario objetivo.
- Cabe en GPU de consumo: si, en cualquier GPU con suficiente memoria para el grafo (~0,3 GB), aunque el beneficio frente a CPU es limitado por el tamano del modelo.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), `transformers.js` (formato Xenova), `optimum` para integracion con pipelines de Hugging Face, y servidores propios basados en ONNX Runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `byun1u/opus-mt-tc-big-zle-zle-onnx-int8` | no disponible (transformer-big) | no disponible | be, ru, uk | CC-BY-4.0 | ONNX int8 |
| `Helsinki-NLP/opus-mt-tc-big-zle-zle` | no disponible (transformer-big) | no disponible | be, ru, uk | CC-BY-4.0 | safetensors/PyTorch |
| `Helsinki-NLP/opus-mt-ru-uk` | no disponible | no disponible | ru, uk | CC-BY-4.0 | PyTorch |
| `Helsinki-NLP/opus-mt-uk-ru` | no disponible | no disponible | uk, ru | CC-BY-4.0 | PyTorch |

La comparativa directa con modelos de traduccion neuronales mas recientes (NLLB-200, M2M-100) no esta disponible en la informacion proporcionada; no se dispone de sus cifras en este contexto para contrastar rendimiento.

## Limitaciones y advertencias

- Solo cubre tres lenguas eslavas orientales; no traduce a ni desde castellano, ingles u otras lenguas.
- El modelo es multi-target y exige el token de idioma destino al inicio de la entrada; omitirlo o colocarlo mal produce salidas incorrectas. El token debe insertarse como id en la secuencia (via `tokenizer.token_to_id`), no dentro del texto, porque el pre-tokenizador Metaspace anade un `▁` extra que `MarianTokenizer` no genera.
- No se han medido las direcciones con bielorruso; su calidad es desconocida en este artefacto.
- La cuantizacion int8 dinamica puede introducir degradacion respecto al modelo fp32 original; no se aportan mediciones comparativas fp32 frente a int8 en la informacion disponible.
- Riesgo de alucinacion y de traduccion literal en frases idiomaticas, comun en modelos NMT de este tamano; no hay evaluacion de sesgos publicada.
- Es una conversion no oficial: el autor original no respalda el artefacto. La licencia CC-BY-4.0 permite uso comercial con atribucion a los autores originales (Tiedemann y el equipo OPUS-MT).
- El tokenizer reconstruido no es identico al `MarianTokenizer` en el 1-2 % de las lineas comprobadas (294-300 de 300 identicas), lo que puede producir diferencias puntuales en la tokenizacion.
- No soporta tool calling ni agentes; su uso en produccion debe limitarse a traduccion texto a texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byun1u/opus-mt-tc-big-zle-zle-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-zle
- Revision del checkpoint original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-zle/tree/779c880171613b8962211d06d77c946a5b79bceb
- Checkpoint Marian: https://object.pouta.csc.fi/Tatoeba-MT-models/zle-zle/opusTCv20210807+bt_transformer-big_2022-03-07.zip
- Marian NMT: https://marian-nmt.github.io/
- OPUS: https://opus.nlpl.eu/
- Tatoeba Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Paper OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.61/
