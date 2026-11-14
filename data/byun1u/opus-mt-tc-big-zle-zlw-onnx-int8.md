# byun1u/opus-mt-tc-big-zle-zlw-onnx-int8

## Resumen

`byun1u/opus-mt-tc-big-zle-zlw-onnx-int8` es una conversión a ONNX con cuantización int8 dinámica del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-zle-zlw`, desarrollado por Jörg Tiedemann y el equipo OPUS-MT de la Universidad de Helsinki. El modelo original es un transformer-big de Marian NMT entrenado sobre datos de OPUS y publicado en marzo de 2022 en el marco del Tatoeba Challenge. Esta versión no es un lanzamiento oficial de los autores originales: solo se ha modificado el formato de los pesos y se ha añadido un `tokenizer.json` compatible con la librería `tokenizers`.

El modelo resuelve traducción automática multilingüe desde tres lenguas eslavas de origen (bielorruso, ruso y ucraniano) hacia dos lenguas de destino (checo y polaco). Es un modelo multi-target: cada entrada debe ir prefijada con el token de la lengua de destino (`>>ces<<` o `>>pol<<`). La conversión a ONNX int8 reduce el peso del repositorio a unos 0,4 GB, lo que facilita su despliegue en entornos con CPU y en aplicaciones ligeras mediante ONNX Runtime o transformers.js.

La relevancia actual de esta ficha reside en que ofrece una alternativa de traducción eslava empaquetada en un formato portable y cuantizado, útil para pipelines de traducción en producción donde no se dispone de GPU o donde el tamaño del modelo es un factor crítico. Al estar basada en un modelo Marian de 2022, no incorpora las capacidades de razonamiento o tool calling de los LLM modernos, pero sigue siendo una opción especializada y ligera para pares de lenguas eslavas concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, variante transformer-big) |
| Parametros totales | no disponible (el repositorio ocupa 0,4 GB en int8; el recuento exacto de parámetros del modelo original no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (pesos int8, activaciones cuantizadas en tiempo de ejecución) |
| Idiomas soportados | Origen: bielorruso (be), ruso (ru), ucraniano (uk). Destino: checo (cs), polaco (pl) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`), más `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder de Marian NMT en configuración transformer-big, entrenado con la herramienta Marian sobre datos de OPUS y el conjunto del Tatoeba Challenge (opusTCv20210807+bt). El checkpoint original se publicó el 23 de marzo de 2022. La información proporcionada no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, más allá de la referencia a OPUS y al Tatoeba Challenge. Tampoco se indica si hubo etapas de RLHF o DPO, algo poco habitual en modelos de traducción de esta generación.

La innovación técnica de esta versión concreta no está en la arquitectura, sino en el proceso de conversión. Se exportó el checkpoint original a ONNX en fp32 con opset 18 y un decoder fusionado que incluye las ramas con y sin past key/values en un único grafo (entrada `use_cache_branch`). Posteriormente se aplicó cuantización dinámica int8 con `onnxruntime.quantization.quantize_dynamic`, usando `weight_type=QuantType.QInt8`, `per_channel=False`, `reduce_range=False` y `extra_options={"EnableSubgraph": True}` para alcanzar las ramas `If` del decoder fusionado. Además, se construyó un `tokenizer.json` de tipo Unigram a partir del `source.spm` y el `vocab.json` originales, con un pre-tokenizador `WhitespaceSplit` + `Metaspace("▁")` y sin post-procesador (el `</s>` se añade manualmente). La verificación reportada indica que entre 294 y 300 de 300 líneas de FLORES-200 produjeron ids idénticos a los de `MarianTokenizer`.

## Capacidades

- Traducción automática multilingüe desde bielorruso, ruso y ucraniano hacia checo y polaco.
- Modelo multi-target: selección de la lengua de destino mediante token de prefijo (`>>ces<<`, `>>pol<<`).
- Generación de texto condicionada a la traducción, con decodificación greedy o beam search (se reportan resultados con beam 4).
- Tokenización compartida entre origen y destino, lo que permite usar el mismo `tokenizer.json` para codificar la entrada y decodificar la salida.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo seq2seq especializado en traducción.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada a los cinco idiomas indicados; no cubre otras lenguas eslavas ni pares fuera de la combinación be/ru/uk → cs/pl.

## Casos de uso

- Traducción de documentación técnica y jurídica entre ruso/ucraniano y polaco/checo: el modelo puede procesar lotes de textos en un pipeline ONNX Runtime en CPU, sin necesidad de GPU, gracias a su tamaño reducido en int8 (0,4 GB).
- Localización de contenido web multilingüe: integrado en un backend de traducción, permite enrutar peticiones según la lengua de destino usando el token de prefijo correspondiente, con latencia baja en CPU.
- Traducción en dispositivos con recursos limitados: al estar en ONNX int8, puede ejecutarse en portátiles y entornos edge mediante ONNX Runtime o transformers.js, sin depender de infraestructura de GPU.
- Preprocesamiento de corpus para investigación en PLN: útil para generar traducciones automáticas de conjuntos de datos eslavos antes de tareas de análisis, anotación o evaluación.
- Atención al cliente en regiones eslavas: traducción de mensajes de usuarios en ruso o ucraniano a polaco o checo para agentes que no dominan la lengua de origen, con un modelo ligero y desplegable en servidores modestos.
- Traducción de subtítulos y contenido audiovisual: el modelo puede procesar segmentos cortos en lotes con beam search para mejorar la fluidez, aunque la información disponible no especifica límites de longitud de contexto.
- Evaluación comparativa de sistemas de traducción: sirve como línea base cuantizada para experimentos de MT en pares eslavos, con métricas reproducibles (COMET-22, chrF) sobre FLORES-200.

## Benchmarks y rendimiento

La model card reporta mediciones propias sobre FLORES-200 devtest (primeras 150 frases), con ONNX Runtime en CPU, decodificación greedy y beam 4, usando COMET-22 (`Unbabel/wmt22-comet-da`) y chrF (sacrebleu 2.6, chrF2), multiplicados por 100. Solo se midió la dirección uk→pl.

| Direccion | Greedy (COMET-22 / chrF) | Beam 4 (COMET-22 / chrF) |
|---|---|---|
| uk→pl | 88,5 / 48,6 | 88,8 / 49,8 |

No se han publicado en la información disponible resultados de benchmarks para las demás direcciones (be→cs, be→pl, ru→cs, ru→pl, uk→cs) ni comparaciones con otros modelos en esta conversión concreta. Para BLEU y chrF del modelo original sobre Tatoeba, FLORES-101 y WMT, la model card remite a la model card original de Helsinki-NLP.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo int8 ocupa aproximadamente 0,37 GB de pesos (229 MB del decoder + 140 MB del encoder), por lo que cabría en cualquier GPU con al menos 1-2 GB de memoria libre, aunque la información no proporciona cifras de VRAM medidas.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) podría alojarlo, pero no hay datos de rendimiento en GPU.
- Cabe en GPU consumer: sí, por el tamaño de los pesos (menos de 0,4 GB en int8), aunque no se han publicado mediciones específicas.
- Opciones de despliegue: ONNX Runtime (CPU, según las mediciones reportadas), transformers.js (el layout de ficheros sigue el de los exports de Xenova), y en general cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo seq2seq Marian.
- Latencia y throughput: no disponibles. La model card solo indica que las mediciones se hicieron con ONNX Runtime en CPU, sin cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| byun1u/opus-mt-tc-big-zle-zlw-onnx-int8 | no disponible (0,4 GB int8) | no disponible | be, ru, uk → cs, pl | CC-BY-4.0 | ONNX int8 | Conversión no oficial, cuantizada |
| Helsinki-NLP/opus-mt-tc-big-zle-zlw | no disponible (transformer-big) | no disponible | be, ru, uk → cs, pl | CC-BY-4.0 | PyTorch/safetensors (Marian) | Modelo original de referencia, sin cuantizar |
| Otros modelos OPUS-MT tc-big | no disponible | no disponible | pares eslavos similares | CC-BY-4.0 | PyTorch, ONNX (exports de Xenova) | Familia de modelos Marian del mismo equipo |

La información disponible no incluye comparaciones directas de rendimiento con modelos alternativos (por ejemplo, NLLB o M2M-100) en estos pares de lenguas, por lo que no se pueden presentar cifras comparativas. La comparativa se limita a la relación con el modelo original y la familia OPUS-MT.

## Limitaciones y advertencias

- Es una conversión no oficial: los autores originales (Helsinki-NLP) no han validado ni respaldado esta versión; solo se ha cambiado el formato y se ha cuantizado.
- La cuantización int8 dinámica puede introducir una degradación de calidad respecto al modelo fp32 original; la model card solo reporta una dirección medida (uk→pl) y no ofrece comparación directa con el original.
- Cobertura limitada: solo tres lenguas de origen y dos de destino; no traduce desde checo o polaco ni hacia bielorruso, ruso o ucraniano.
- Requiere prefijar cada entrada con el token de destino correcto (`>>ces<<` o `>>pol<<`); un uso incorrecto del tokenizer puede producir ids distintos a los de `MarianTokenizer` y degradar la traducción.
- Riesgo de alucinación y errores en textos largos o dominios especializados, habitual en modelos Marian entrenados sobre OPUS; no se han publicado evaluaciones de sesgo en la información disponible.
- No dispone de contexto largo documentado ni de mecanismos de control de toxicidad; para producción conviene filtrar y evaluar las salidas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a los autores originales (Tiedemann y el equipo OPUS-MT) y mantener el aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byun1u/opus-mt-tc-big-zle-zlw-onnx-int8
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-zlw
- Revisión del checkpoint original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-zlw/tree/e14020b99526d830084be270a1051dca51090eeb
- Checkpoint Marian: https://object.pouta.csc.fi/Tatoeba-MT-models/zle-zlw/opusTCv20210807+bt_transformer-big_2022-03-23.zip
- Marian NMT: https://marian-nmt.github.io/
- OPUS: https://opus.nlpl.eu/
- Tatoeba Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Cita OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.61
- Cita Tatoeba Challenge (Tiedemann, 2020): https://aclanthology.org/2020.wmt-1.49
