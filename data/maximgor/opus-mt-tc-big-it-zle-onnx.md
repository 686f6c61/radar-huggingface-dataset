# maximgor/opus-mt-tc-big-it-zle-onnx

## Resumen

`maximgor/opus-mt-tc-big-it-zle-onnx` es una conversión a ONNX del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-it-zle`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro de la familia OPUS-MT. El modelo traduce desde el italiano hacia tres lenguas eslavas orientales: ruso, ucraniano y bielorruso. Es un modelo multi-target en el que el idioma de destino se selecciona mediante un token especial antepuesto a la secuencia de entrada (`>>rus<<`, `>>ukr<<`, `>>bel<<`).

La contribución de esta ficha no es un reentrenamiento, sino una exportación a ONNX con cuantización dinámica a int8, pensada para inferencia en dispositivo (on-device) con ONNX Runtime. El autor no modificó los pesos originales: la exportación se realizó con `optimum-cli` y la cuantización con `onnxruntime.quantization.quantize_dynamic`, con una diferencia máxima absoluta de logits de 2,2e-05 frente a la referencia en PyTorch.

Su relevancia práctica radica en el tamaño reducido del artefacto desplegable (371 MB con el decodificador fusionado) y en la latencia medida en un teléfono Android (0,35–0,9 s por frase tras cargar las sesiones), lo que lo hace adecuado para traducción offline en aplicaciones móviles o entornos sin conectividad. La arquitectura subyacente es Marian, un transformer encoder-decoder seq2seq especializado en traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (QUInt8, sin per-channel, con EnableSubgraph) |
| Idiomas soportados | origen: it; destino: ru, uk, be |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafos cuantizados) + `source.spm` + `vocab.json` |

## Arquitectura y entrenamiento

El modelo base es un Marian de tipo transformer encoder-decoder, la arquitectura estándar de la familia OPUS-MT para traducción automática neuronal. La variante `tc-big` corresponde a la gama de mayor tamaño dentro de OPUS-MT, si bien no se dispone de datos publicados en la información proporcionada sobre el número exacto de parámetros, la composición del corpus de entrenamiento ni el número de tokens utilizados. Tampoco se documenta si hubo etapas de ajuste fino con RLHF o DPO; en la familia OPUS-MT el entrenamiento es supervisado sobre corpus paralelos de OPUS.

La innovación técnica de esta versión concreta es la cadena de exportación y cuantización. Los pesos PyTorch se exportaron con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process --opset 14` (optimum 1.24.0, transformers 4.46.3, torch 2.5.1) y después se cuantizaron dinámicamente a int8. Se publica tanto el par de decodificadores separado (`decoder_model_quantized.onnx` + `decoder_with_past_model_quantized.onnx`) como un decodificador fusionado (`decoder_model_merged_quantized.onnx`) que conmuta mediante la entrada `use_cache_branch`. El decodificador fusionado presenta una particularidad relevante para la integración: a partir del primer paso, sus salidas `present.*.encoder.*` son marcadores vacíos (batch 0), por lo que debe conservarse la atención cruzada del primer paso; reinyectar esos marcadores provoca el error de ONNX Runtime «The dimension with value zero exceeds the dimension size of the input tensor». En el primer paso hay que alimentar cada `past_key_values.*` como un tensor vacío de forma `[1, 16, 0, 64]` con `use_cache_branch = false`.

## Capacidades

- Traducción automática de italiano a ruso, ucraniano y bielorruso en un único modelo multi-target.
- Selección del idioma de destino mediante token prefijado en la entrada (`>>rus<<`, `>>ukr<<`, `>>bel<<`), que son claves ordinarias de `vocab.json` (`>>rus<<` es el id 25672) y deben anteponerse explícitamente al input del encoder, tal como hace `MarianTokenizer`.
- Generación de texto seq2seq con decodificación autoregresiva y caché de clave-valor.
- Inferencia en dispositivo con ONNX Runtime, sin dependencia de PyTorch en tiempo de ejecución.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo puramente de traducción.
- Capacidad multilingüe limitada a la combinación it→{ru, uk, be}; no se documentan otras direcciones.

## Casos de uso

- Traducción offline en aplicaciones móviles: el artefacto de 371 MB (encoder, decodificador fusionado, `source.spm` y `vocab.json`) cabe en el almacenamiento de un teléfono y permite traducir sin conectividad, con latencias de 0,35–0,9 s por frase medidas en Android.
- Asistencia a la comunicación para hablantes de italiano en contextos de habla rusa, ucraniana o bielorrusa: traducción de mensajes, correos o notas en una app de mensajería, seleccionando el destino con el token correspondiente.
- Procesamiento por lotes de documentación: traducción de manuales, fichas de producto o textos administrativos del italiano a las tres lenguas eslavas orientales en pipelines de servidor con ONNX Runtime.
- Localización de contenidos editoriales: integración en un CMS para generar borradores de traducción que después revisa un traductor humano, aprovechando que el modelo es determinista con decodificación greedy.
- Subtitulado y transcripción: traducción de subtítulos en flujos de vídeo donde la latencia por frase es crítica y se prefiere un modelo pequeño a una API en la nube.
- Sistemas embebidos y de borde: despliegue en dispositivos con recursos limitados (Raspberry Pi, cajas industriales) usando ONNX Runtime, sin GPU y con cuantización int8.
- Investigación en traducción automática de bajo recurso: el bielorruso y el ucraniano son pares con menos recursos que las combinaciones mayoritarias, y este modelo permite experimentar con evaluación y ajuste sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (BLEU, chrF, MMLU, etc.) en la información disponible. El único dato de rendimiento proporcionado es la latencia empírica en un teléfono Android con cuantización int8 y decodificación greedy: 0,35–0,9 s por frase una vez cargadas las sesiones. La fidelidad de la exportación se documenta con una diferencia máxima absoluta de logits de 2,2e-05 frente a la referencia PyTorch.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está pensado para CPU. Con el decodificador fusionado el conjunto de ficheros necesarios ocupa 371 MB en disco y una huella de memoria del mismo orden en tiempo de ejecución; con el par de decodificadores separado, 586 MB.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y a inferencia en dispositivo. Cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT) puede ejecutarlo, pero no hay datos de rendimiento en GPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles; no requiere GPU dedicada.
- Opciones de despliegue: ONNX Runtime (con soporte de `use_cache_branch` y gestión manual de `past_key_values`), integración con `optimum` y `transformers` para la tokenización Marian. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están pensados para este tipo de modelo seq2seq.
- Latencia y throughput: 0,35–0,9 s por frase en un teléfono Android con int8 y decodificación greedy; no se proporcionan cifras de throughput en servidor.

## Comparativa con modelos similares

| Modelo | Dirección | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| maximgor/opus-mt-tc-big-it-zle-onnx | it → ru, uk, be | no disponible | no disponible | ONNX int8 | CC BY 4.0 | Versión on-device del modelo Helsinki |
| Helsinki-NLP/opus-mt-tc-big-it-zle | it → ru, uk, be | no disponible | no disponible | PyTorch (safetensors/bin) | CC BY 4.0 | Modelo original; requiere PyTorch |
| Helsinki-NLP/opus-mt-it-ru | it → ru | no disponible | no disponible | PyTorch | CC BY 4.0 | Modelo bilingüe de la misma familia, sin soporte multi-target |
| Xenova/opus-mt-* (builds ONNX) | varias | no disponible | no disponible | ONNX | CC BY 4.0 | Conversiones ONNX de referencia en las que se inspira la cuantización de esta ficha |

No se dispone de datos de benchmarks que permitan comparar la calidad de traducción entre estas alternativas.

## Limitaciones y advertencias

- Solo traduce desde italiano; no cubre la dirección inversa ni otros pares de idiomas.
- El token de idioma de destino debe anteponerse manualmente al input del encoder; omitirlo o usar un id incorrecto produce una traducción hacia un destino no deseado o malformada.
- El decodificador fusionado tiene un comportamiento no estándar con las salidas `present.*.encoder.*` a partir del primer paso; una integración incorrecta aborta ONNX Runtime con un error de dimensión cero.
- La cuantización int8 dinámica puede degradar ligeramente la calidad frente al modelo original en PyTorch; no se publican métricas de BLEU que cuantifiquen esa pérdida.
- Riesgo de alucinación y de traducciones fluidas pero infieles en textos largos, técnicos o con terminología especializada, propio de los modelos Marian de tamaño medio.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre corpus paralelos de OPUS puede heredar sesgos de dominio y de registro de esas fuentes.
- La licencia CC BY 4.0 permite uso comercial con atribución obligatoria al Language Technology Research Group de la Universidad de Helsinki y al autor de la conversión; es necesario citar la publicación de Tiedemann y Thottingal (2020).
- No se publica `target.spm`; la detokenización debe hacerse con `vocab.json` y deshaciendo el metaspace, lo que exige implementar ese paso manualmente.
- No hay datos publicados sobre longitud de contexto soportada, por lo que conviene validar el comportamiento con frases y párrafos largos antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maximgor/opus-mt-tc-big-it-zle-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-it-zle
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Referencia: Tiedemann, J., & Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. Proceedings of the 22nd Annual Conference of the European Association for Machine Translation (EAMT), Lisbon, Portugal.
