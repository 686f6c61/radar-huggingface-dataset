# byun1u/opus-mt-tc-big-en-zle-onnx-int8

## Resumen

`byun1u/opus-mt-tc-big-en-zle-onnx-int8` es una conversión a ONNX con cuantización dinámica int8 del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-en-zle`, desarrollado por Jörg Tiedemann y el equipo OPUS-MT de la Universidad de Helsinki. El modelo original es un transformer-big de Marian NMT entrenado sobre datos OPUS (Tatoeba Challenge) y publicado el 13 de marzo de 2022. Esta versión no es un lanzamiento oficial de los autores originales: solo cambia el formato de los pesos y su precisión.

El modelo traduce de inglés a tres lenguas eslavas orientales: bielorruso (`bel`), ruso (`rus`) y ucraniano (`ukr`). Es un modelo multi-target que requiere un token de idioma destino (`>>bel<<`, `>>rus<<` o `>>ukr<<`) al inicio de cada entrada. La conversión incluye un `tokenizer.json` construido a partir del `source.spm` y el `vocab.json` originales, lo que permite usar la pila de `tokenizers` de Hugging Face en lugar de SentencePiece.

La relevancia de esta ficha radica en que ofrece un artefacto ONNX int8 de 0,4 GB, ejecutable en CPU con unos 0,35 GB de RAM, con latencias medianas de 59 ms por línea en modo greedy para en→uk sobre un AMD Ryzen 7 5700X3D. Es una opción práctica para despliegues de traducción en entornos sin GPU o con requisitos estrictos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer-big de Marian NMT (encoder-decoder) |
| Parametros totales | no disponible (repo de 0,4 GB en int8; el checkpoint original transformer-big no declara cifra en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (pesos int8, activaciones cuantizadas en tiempo de ejecución) |
| Idiomas soportados | en (origen); be, ru, uk (destino) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer-big de Marian NMT, una arquitectura encoder-decoder estándar para traducción automática neuronal. Fue entrenado sobre datos OPUS en el marco del Tatoeba Challenge, con el checkpoint `opusTCv20210807+bt_transformer-big_2022-03-13`. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el autor remite a la model card original para los detalles de entrenamiento.

La conversión a ONNX se realizó con `optimum` 2.1.0 y `optimum-onnx` 0.1.0 sobre `torch` 2.15.0+cpu, `transformers` 4.57.6 y `onnx` 1.23.2, exportando en fp32 con opset 18 y decoder fusionado (`text2text-generation-with-past`). La cuantización se aplicó con `onnxruntime.quantization.quantize_dynamic` usando `QuantType.QInt8`, `per_channel=False`, `reduce_range=False` y `EnableSubgraph=True` para alcanzar las ramas `If` del decoder fusionado. El `tokenizer.json` se construyó como modelo `Unigram` sobre el vocabulario original, con normalizador precompilado de `source.spm`, pre-tokenizador `WhitespaceSplit` + `Metaspace("▁")` y decoder `Metaspace`, sin post-procesador (se añade `</s>` manualmente). La verificación con `MarianTokenizer` mostró ids idénticos en 294-300 de 300 líneas FLORES-200.

## Capacidades

- Traducción automática de inglés a bielorruso, ruso y ucraniano mediante token de idioma destino.
- Modelo multi-target: un único artefacto sirve para las tres direcciones de destino.
- Decodificación greedy y beam search (beam 4 medido en la model card).
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Tokenizador compatible con la librería `tokenizers` de Hugging Face, además de `MarianTokenizer`.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido; es un modelo puramente de traducción.

## Casos de uso

- Traducción de documentación técnica en inglés a ruso y ucraniano en pipelines de CI/CD: el artefacto ONNX int8 se puede invocar desde ONNX Runtime en servidores sin GPU, con latencias medianas de 59 ms por línea en greedy.
- Localización de interfaces de usuario para mercados de Europa del Este: el modelo multi-target permite cubrir bielorruso, ruso y ucraniano con un solo despliegue y seleccionar el idioma destino mediante el token correspondiente.
- Traducción de contenido conversacional (soporte, chats, correo): la model card reporta COMET-22 de 81,6 (greedy) y 84,6 (beam 4) en en→uk sobre el dominio de conversación de WMT22, lo que lo hace adecuado para texto informal.
- Procesamiento por lotes de grandes volúmenes de texto en entornos con RAM limitada: con unos 0,35 GB de RAM y un repo de 0,4 GB, cabe en contenedores pequeños y en máquinas de desarrollo modestas.
- Traducción de subtítulos o transcripciones en inglés a ucraniano o ruso: el modelo evita la fuga de idioma según la model card (ninguna de 500 salidas con `>>ukr<<` fue detectada como rusa por el detector `lingua`).
- Integración en aplicaciones de escritorio o edge con `transformers.js` (formato Xenova): el layout de archivos sigue el de las exportaciones OPUS-MT para `transformers.js`, lo que facilita su uso en JavaScript.
- Servicio de traducción de bajo coste en CPU: con beam 4 la mediana es de 106 ms por línea y el p90 de 284 ms, suficiente para traducción interactiva no crítica.

## Benchmarks y rendimiento

Datos medidos por el autor de la conversión con ONNX Runtime en CPU, COMET-22 (`Unbabel/wmt22-comet-da`) y chrF (sacrebleu 2.6, chrF2), multiplicados por 100.

FLORES-200 devtest, primeras 150 frases:

| Direccion | Greedy (COMET-22 / chrF) | Beam 4 (COMET-22 / chrF) |
|---|---|---|
| en→uk | 88,9 / 59,6 | 89,2 / 61,2 |
| en→ru | 88,9 / 60,2 | 89,3 / 60,8 |

WMT22 General task, dominio de conversación, primeras 100 líneas:

| Direccion | Greedy (COMET-22 / chrF) | Beam 4 (COMET-22 / chrF) |
|---|---|---|
| en→uk | 81,6 / 50,1 | 84,6 / 52,6 |
| en→ru | 85,0 / 55,5 | 86,3 / 55,7 |

No se han publicado resultados de benchmarks para en→be en la información disponible. Para BLEU y chrF sobre Tatoeba, FLORES-101 y WMT, el autor remite a la model card original.

## Requisitos de hardware

- RAM estimada: unos 0,35 GB durante la inferencia en CPU según la model card.
- Tamaño del repo: 0,4 GB (encoder int8 de 140 MB, decoder fusionado int8 de 229 MB, tokenizer de 2,4 MB).
- GPU: no requiere GPU; la model card solo documenta ejecución en CPU con ONNX Runtime.
- Cabe en cualquier equipo consumer con al menos 1 GB de RAM libre; no se han documentado requisitos de VRAM.
- Despliegue: ONNX Runtime (probado con 1.31.1), `transformers.js` (formato Xenova), y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida en AMD Ryzen 7 5700X3D, 100 líneas de conversación en→uk: greedy mediana 59 ms / p90 151 ms por línea; beam 4 mediana 106 ms / p90 284 ms por línea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| byun1u/opus-mt-tc-big-en-zle-onnx-int8 | no disponible (int8, 0,4 GB) | no disponible | en→be/ru/uk | CC-BY-4.0 | ONNX int8 | COMET-22 88,9-89,3 en FLORES-200 (en→ru/uk) |
| Helsinki-NLP/opus-mt-tc-big-en-zle (original) | no disponible | no disponible | en→be/ru/uk | CC-BY-4.0 | PyTorch (Marian) | Referencia de la conversión; BLEU/chrF en model card original |
| Helsinki-NLP/opus-mt-en-zle | no disponible | no disponible | en→be/ru/uk | CC-BY-4.0 | PyTorch (Marian) | No disponible en la información proporcionada |
| Otros modelos OPUS-MT tc-big convertidos a ONNX int8 | no disponible | no disponible | varias | CC-BY-4.0 | ONNX int8 | No disponible en la información proporcionada |

La información proporcionada no incluye comparativas directas con modelos de traducción de otros proveedores (por ejemplo, NLLB o M2M-100), por lo que no se presentan datos de rendimiento comparado con ellos.

## Limitaciones y advertencias

- Solo traduce desde inglés; no cubre direcciones inversas ni otros pares de idiomas.
- Requiere el token de idioma destino al inicio de la entrada; su omisión o colocación incorrecta produce resultados degradados.
- El tokenizador `tokenizer.json` añade un trozo `▁` extra si el token de idioma se deja dentro del texto, a diferencia de `MarianTokenizer`; hay que insertar el id del token manualmente.
- No es un lanzamiento oficial de Helsinki-NLP; los autores originales no validan esta conversión.
- La cuantización int8 puede introducir degradación respecto al modelo fp32 original; la model card no reporta la diferencia exacta frente al checkpoint original.
- No se han publicado métricas para en→be en la información disponible.
- Riesgo de alucinación y de errores en terminología especializada inherente a los modelos NMT entrenados sobre OPUS; no se documentan sesgos específicos.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar a los autores originales (Tiedemann y Thottingal, 2020) y respetar los términos de la licencia.
- No soporta tool calling, agentes ni razonamiento multi-paso; su uso en pipelines debe limitarse a traducción.
- La longitud de contexto no está documentada; entradas muy largas pueden truncarse o degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byun1u/opus-mt-tc-big-en-zle-onnx-int8
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-zle
- Revisión del checkpoint original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-zle/tree/708be1d372fe4c358a352f404e6dc9ca0126ba48
- Checkpoint Marian: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-zle/opusTCv20210807+bt_transformer-big_2022-03-13.zip
- Marian NMT: https://marian-nmt.github.io/
- OPUS: https://opus.nlpl.eu/
- Tatoeba Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): Proceedings of the 22nd Annual Conference of the European Association for Machine Translation, Lisboa.
