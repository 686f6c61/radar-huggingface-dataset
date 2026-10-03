# malinali-app/opus-mt-ee-de

# Opus-mt-ee-de (malinali)

## Resumen

Opus-mt-ee-de es un modelo de traduccion automatica neural especializado en la direccion ewe (ee) a aleman (de), publicado por el usuario malinali-app. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de los pesos de Helsinki-NLP/opus-mt-ee-de, la familia OPUS-MT del grupo de investigacion de Helsinki, adaptado para inferencia en dispositivo mediante el framework Candle.

El modelo resuelve un caso de traduccion de bajos recursos: el ewe es una lengua nigerocongolesa hablada principalmente en Ghana, Togo y Benin, con una presencia limitada en corpus paralelos digitales. Al contar con solo 75.620.282 parametros, el modelo esta disenado para ejecutarse en entornos con recursos muy limitados, incluidos moviles y navegadores, lo que encaja con el objetivo declarado por su autor de proporcionar paquetes on-device.

Su relevancia actual radica en la combinacion de un tamano minimo (repo de 0,3 GB) con formatos modernos de despliegue: pesos en safetensors y tokenizers rapidos en JSON derivados de SentencePiece, orientados al runtime `marian_flutter`. Es, por tanto, una pieza de infraestructura practica para aplicaciones de traduccion local, mas que un avance en calidad de traduccion respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq), text2text-generation |
| Parametros totales | 75.620.282 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura Marian suele limitarse a 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | ee (ewe), de (aleman) |
| Licencia | no disponible en la ficha; el autor indica seguir la del modelo upstream (tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (model.safetensors); tokenizers en JSON (tokenizer-enc.json, tokenizer-dec.json) |

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer encoder-decoder orientado a traduccion automatica, con tokenizers independientes para origen y destino. El repositorio incluye `config.json` (configuracion Marian), `model.safetensors` (pesos), `tokenizer-enc.json` (tokenizer rapido del idioma origen, ewe) y `tokenizer-dec.json` (tokenizer rapido del idioma destino, aleman). La conversion de SentencePiece a tokenizers rapidos de Hugging Face es la aportacion tecnica principal de este reempaquetado.

En cuanto al entrenamiento, esta publicacion no aporta detalles propios: no se especifican el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. El autor remite al modelo base Helsinki-NLP/opus-mt-ee-de y al proyecto OPUS-MT, cuyo entrenamiento se apoya en corpus paralelos de la coleccion OPUS. Todo dato de entrenamiento especifico (tamano de corpus, epocas, hiperparametros) debe consultarse en la ficha del modelo upstream, ya que no esta disponible aqui.

## Capacidades

- Traduccion de texto en la direccion ewe a aleman (unico sentido soportado segun la ficha).
- Generacion text2text propia de los modelos Marian seq2seq.
- Inferencia local en dispositivo mediante Candle (runtime `marian_flutter`), sin necesidad de servidor.
- Tokenizacion rapida optimizada para integracion con Flutter y Candle.
- Compatibilidad de endpoints declarada (etiqueta `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, modo de razonamiento ni multilinguesmo adicional mas alla del par ee-de.

## Casos de uso

- Aplicaciones moviles sin conexion: integracion en apps Flutter que traduzcan ewe a aleman en el propio dispositivo, sin enviar texto a servidores, gracias al formato safetensors y al runtime Candle.
- Traduccion asistida en contextos de cooperacion al desarrollo: comunicacion con comunidades ewehablantes en Ghana, Togo o Benin y traduccion de materiales hacia el aleman.
- Digitalizacion de documentacion en ewe: traduccion de textos administrativos, educativos o sanitarios al aleman para su catalogacion o publicacion.
- Procesamiento por lotes de corpus: traduccion masiva de conjuntos de frases ewe-aleman para construir o ampliar corpus paralelos de investigacion, dado el bajo coste computacional del modelo.
- Herramientas de traduccion embebidas en escritorio o web: despliegue con CPU y un consumo de memoria minimo (menos de 0,5 GB en la mayoria de formatos).
- Investigacion en traduccion de bajos recursos: uso como linea base ligera frente a modelos multilingues mucho mayores en experimentos sobre lenguas minorizadas.
- Integracion en pipelines de preprocesamiento linguistico: normalizacion o traduccion previa de texto ewe antes de otras etapas de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la ficha del modelo ni los datos proporcionados incluyen metricas como BLEU, chrF, MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros sistemas de traduccion. Cualquier cifra de calidad debe consultarse en la ficha del modelo upstream (Helsinki-NLP/opus-mt-ee-de) o en las evaluaciones oficiales del proyecto OPUS-MT.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (75.620.282); no confirmadas por el autor.

- VRAM/RAM estimada para los pesos: ~302 MB en FP32, ~151 MB en FP16/BF16, ~76 MB en INT8 y ~38 MB en INT4 (las variantes cuantizadas no se distribuyen, solo se ofrecen los pesos en safetensors).
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Se ejecuta sobradamente en RTX 3060, RTX 4090 y GPUs integradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 1 GB de VRAM, e incluso en moviles y navegadores.
- Opciones de despliegue: Candle (runtime `marian_flutter`, objetivo declarado), Hugging Face Transformers (libreria etiquetada), y conversion posible a llama.cpp/Ollama o vLLM previa conversion de formato (no se distribuyen builds listos para estos runtimes).
- Latencia y throughput: no disponibles. Dado el tamano, se espera inferencia de milisegundos por frase en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion / idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-ee-de | 75,6 M | ee → de | no disponible | no disponible (upstream tipicamente CC-BY 4.0) | safetensors + tokenizers JSON para Candle |
| Helsinki-NLP/opus-mt-ee-de (base) | 75,6 M | ee → de | no disponible | CC-BY 4.0 (segun proyecto OPUS-MT) | Transformers (pesos originales) |
| NLLB-200-distilled-600M | 600 M | Multilingue (mas de 200 idiomas, incluye ee y de) | 512 tokens | CC-BY-NC 4.0 | Transformers |
| M2M-100 (418M) | 418 M | Multilingue (100 idiomas, incluye ee y de) | no disponible | MIT | Transformers |

Nota: los datos de NLLB-200 y M2M-100 corresponden a familias de modelos de traduccion multilingue ampliamente conocidas y se incluyen a modo de referencia de categoria; no proceden de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Los modelos de traduccion entrenados en corpus OPUS pueden heredar sesgos de genero y de representacion presentes en los textos paralelos.
- Riesgo de alucinacion: propio de los modelos seq2seq de traduccion, especialmente en frases largas, idioma de origen poco representado o vocabulario fuera de dominio.
- Limitaciones de idioma: soporta unicamente el par ee-de y un solo sentido (ee → de). No traduce de aleman a ewe ni a terceros idiomas.
- Limitaciones de contexto: la arquitectura Marian suele limitar la longitud de entrada; no se confirma el maximo exacto para este modelo.
- Restricciones de licencia: la licencia no esta declarada en la ficha, lo que introduce incertidumbre para uso comercial. El autor remite a la licencia del modelo upstream (tipicamente CC-BY 4.0), que conviene verificar antes de un despliegue en produccion.
- Caveat de origen: es un reempaquetado, no un modelo entrenado por malinali-app; la calidad de traduccion es la del modelo Helsinki-NLP original, sin mejoras declaradas.
- Sin datos de rendimiento publicados: no hay benchmarks que respalden la calidad ni comparaciones con alternativas.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-ee-de
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ee-de
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
