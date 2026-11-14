# byun1u/opus-mt-tc-big-zle-en-onnx-int8

## Resumen

`byun1u/opus-mt-tc-big-zle-en-onnx-int8` es una conversión a ONNX con cuantización dinámica int8 del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-zle-en`, desarrollado originalmente por Jörg Tiedemann y el equipo OPUS-MT de la Universidad de Helsinki (Helsinki-NLP). Resuelve la traducción automática desde tres lenguas eslavas orientales —bielorruso (be), ruso (ru) y ucraniano (uk)— hacia inglés (en). El autor de esta conversión es el usuario de Hugging Face `byun1u`, que no forma parte del equipo original; solo ha modificado el formato de los pesos.

El modelo base es un transformer-big de Marian NMT publicado el 17 de marzo de 2022 y entrenado sobre datos de OPUS en el marco del Tatoeba Challenge (OPUS-TCv20210807+bt). Esta versión ONNX conserva la arquitectura y los pesos originales, pero los exporta a grafos ONNX (encoder y decoder fusionado con y sin caché de claves/valores) y aplica cuantización dinámica int8 a los pesos, lo que reduce el tamaño del repositorio a unos 0,4 GB.

La relevancia actual radica en que permite ejecutar un modelo de traducción de calidad competitiva en CPU y en entornos sin GPU (por ejemplo, mediante ONNX Runtime o transformers.js), con latencias del orden de decenas de milisegundos por línea en hardware de consumo. Es una opción práctica para pipelines de traducción de bajo coste y para integrar traducción multilingüe eslava→inglés en aplicaciones locales o en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, variante transformer-big) |
| Parametros totales | no disponible (el repositorio ocupa 0,4 GB en int8; el checkpoint original es transformer-big) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de traducción por frases; sin ventana de contexto declarada) |
| Tipos de cuantizacion | int8 dinámica (pesos int8, activaciones cuantizadas en tiempo de ejecución); exportación base en fp32 |
| Idiomas soportados | be (bielorruso), ru (ruso), uk (ucraniano) → en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) + `tokenizer.json` |
| Libreria | onnx (compatible con ONNX Runtime y transformers.js) |
| Opset | 18 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de Marian NMT en configuración transformer-big, entrenado con datos paralelos de OPUS en el marco del Tatoeba Challenge (OPUS-TCv20210807+bt). El checkpoint original se publicó el 17 de marzo de 2022 y se distribuye como `opusTCv20210807+bt_transformer-big_2022-03-17.zip`. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición exacta del corpus ni si hubo etapas de ajuste fino con RLHF o DPO; esos datos corresponden a la model card original de Helsinki-NLP, que no se incluye en la información proporcionada.

La innovación de esta versión concreta es la exportación y cuantización: se generó un grafo ONNX en fp32 con `optimum` (tarea `text2text-generation-with-past`, decoder fusionado con y sin caché de claves/valores mediante el input `use_cache_branch`) y después se aplicó `onnxruntime.quantization.quantize_dynamic` con `weight_type=QInt8`, `per_channel=False`, `reduce_range=False` y `EnableSubgraph=True` para alcanzar las ramas `If` del decoder fusionado. El tokenizador se reconstruyó como un modelo `Unigram` sobre `vocab.json` a partir del `source.spm` original, con normalizador precompilado y pre-tokenizador `WhitespaceSplit` + `Metaspace("▁")`. La validación del tokenizador mostró coincidencia de ids en 294-300 de 300 líneas de FLORES-200.

## Capacidades

- Traducción automática de texto de bielorruso, ruso y ucraniano a inglés.
- Modelo de una sola dirección de traducción: no traduce hacia las lenguas eslavas ni entre ellas.
- Sin token de idioma: el idioma de origen se infiere del texto; la entrada se codifica y se añade `</s>`.
- Decodificación greedy o con beam search (beam 4 evaluado en la model card).
- Ejecución en CPU mediante ONNX Runtime, sin requisito de GPU.
- Compatible con el ecosistema transformers.js (Xenova) por el diseño de los ficheros exportados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de traducción puro.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Traducción de documentación técnica y científica del ruso o ucraniano al inglés: el modelo traduce frase a frase con buena calidad (COMET-22 de 86-87 en FLORES-200) y puede integrarse en pipelines de conversión de documentación.
- Subtitulado y transcripción de audio: la model card mide 150 líneas cortas de habla transcrita uk→en con mediana de 61 ms por línea en greedy, lo que lo hace adecuado para traducir transcripciones en tiempo casi real en CPU.
- Localización de contenido web y aplicaciones: al ejecutarse en ONNX Runtime y ser compatible con transformers.js, puede desplegarse en el navegador o en el servidor sin GPU para traducir interfaces y textos de usuario.
- Procesamiento por lotes en servidores sin GPU: con 0,35 GB de RAM y latencias de decenas de milisegundos, es viable para traducir grandes volúmenes de texto en infraestructura de bajo coste.
- Traducción de conversaciones multilingües: la evaluación en el dominio de conversación de WMT22 (COMET-22 de 84-85) respalda su uso en chats y foros con hablantes de ruso y ucraniano.
- Análisis de datos y moderación de contenido: traducción previa al inglés de textos en lenguas eslavas orientales para aplicar clasificadores, análisis de sentimiento o búsqueda semántica entrenados en inglés.
- Investigación en traducción automática de bajo recurso: el bielorruso es una lengua de bajos recursos y este modelo permite experimentar con traducción eslava→inglés en entornos limitados de cómputo.

## Benchmarks y rendimiento

Datos medidos por el autor de la conversión con ONNX Runtime en CPU, greedy o beam 4. Métricas COMET-22 (`Unbabel/wmt22-comet-da`) y chrF (sacrebleu 2.6, chrF2), multiplicadas por 100.

FLORES-200 devtest, primeras 150 frases:

| Direccion | Greedy (COMET-22 / chrF) | Beam 4 (COMET-22 / chrF) |
|---|---|---|
| uk→en | 86,7 / 65,1 | 87,0 / 65,2 |
| ru→en | 87,2 / 63,5 | 86,9 / 62,8 |

WMT22 General task, dominio conversación, primeras 100 líneas:

| Direccion | Greedy (COMET-22 / chrF) | Beam 4 (COMET-22 / chrF) |
|---|---|---|
| uk→en | 84,1 / 54,4 | 84,1 / 54,4 |
| ru→en | 85,4 / 54,9 | 85,1 / 54,9 |

En las 300 primeras frases de FLORES-200 devtest, uk→en greedy: 86,3 / 64,8. No se han publicado resultados de benchmarks para bielorruso→inglés en la información disponible. Los BLEU/chrF originales sobre Tatoeba, FLORES-101 y WMT están en la model card del modelo original.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- RAM estimada: unos 0,35 GB en la medición del autor (AMD Ryzen 7 5700X3D).
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime serviría, pero no se han publicado cifras de VRAM ni de rendimiento en GPU.
- Cabe en cualquier equipo de consumo: el repositorio completo ocupa 0,4 GB y los grafos ONNX cuantizados suman unos 367 MB (encoder 139 MB, decoder 228 MB).
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), transformers.js en el navegador, y cualquier runtime compatible con ONNX. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en CPU, 150 líneas cortas (mediana de 58 caracteres) uk→en, greedy con mediana de 61 ms y p90 de 156 ms por línea; beam 4 con mediana de 115 ms y p90 de 305 ms por línea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| byun1u/opus-mt-tc-big-zle-en-onnx-int8 | no disponible (transformer-big) | no disponible | be, ru, uk → en | CC-BY-4.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-tc-big-zle-en (original) | no disponible (transformer-big) | no disponible | be, ru, uk → en | CC-BY-4.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-ru-en | no disponible | no disponible | ru → en | CC-BY-4.0 | PyTorch |
| Helsinki-NLP/opus-mt-uk-en | no disponible | no disponible | uk → en | CC-BY-4.0 | PyTorch |

La diferencia principal frente al modelo original es el formato (ONNX int8 frente a PyTorch) y la consiguiente reducción de tamaño y requisitos de cómputo, con métricas de calidad medidas sobre el propio grafo ONNX. Frente a los modelos monolingües ru→en y uk→en de Helsinki-NLP, este modelo cubre además el bielorruso en un único checkpoint. No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de traducción unidireccional: solo traduce be/ru/uk → en; no traduce al revés ni entre lenguas eslavas.
- No es una versión oficial de Helsinki-NLP: el autor de la conversión es `byun1u` y solo se modificó el formato; los posibles errores de exportación o cuantización no están avalados por los autores originales.
- La cuantización int8 puede introducir una ligera degradación de calidad frente al modelo fp32 original; no se publican comparaciones directas fp32 frente a int8 en la model card.
- No se detallan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de longitud de entrada en la información disponible; como modelo de traducción por frases, no gestiona contextos largos ni documentos completos de forma nativa.
- Los datos de evaluación proceden de conjuntos limitados (150 frases de FLORES-200, 100 líneas de WMT22) y las líneas de conversación hacia inglés son traducciones inversas de pares en→uk y en→ru, lo que condiciona su interpretación.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a los autores originales (Tiedemann y el equipo OPUS-MT) y conservar el aviso de licencia.
- La model card no documenta el rendimiento en bielorruso, a pesar de estar entre los idiomas soportados.
- Sin soporte de tool calling ni de agentes: no debe plantearse como sustituto de un LLM generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byun1u/opus-mt-tc-big-zle-en-onnx-int8
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-en
- Revisión del modelo base usada en la conversión: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-en/tree/09a40f722d6d8b76aaad6fe51a06c914622a13d1
- Checkpoint Marian original: https://object.pouta.csc.fi/Tatoeba-MT-models/zle-eng/opusTCv20210807+bt_transformer-big_2022-03-17.zip
- Marian NMT: https://marian-nmt.github.io/
- OPUS: https://opus.nlpl.eu/
- Tatoeba Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Cita OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
