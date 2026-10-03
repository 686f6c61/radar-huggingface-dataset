# malinali-app/opus-mt-es-ee

# Opus-mt-es-ee (malinali-app)

## Resumen

`malinali-app/opus-mt-es-ee` es un paquete de pesos para traduccion automatica neuronal en la direccion espanol → destino, publicado por el desarrollador malinali-app como parte del proyecto Malinali. No se trata de un modelo entrenado desde cero: es un reempaquetado del modelo upstream `Helsinki-NLP/opus-mt-es-ee`, desarrollado por el grupo Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT, del que Malinali solo convierte pesos y tokenizadores para inferencia en dispositivo.

El modelo emplea la arquitectura Marian NMT, un transformer encoder-decoder orientado a traduccion, con 75.526.403 parametros totales y un peso de repositorio de 0,3 GB. Esa cifra de parametros es coherente con la configuracion "base" de OPUS-MT, lo que lo situa en la gama ligera: puede ejecutarse en CPU, en movil y en sistemas embebidos sin GPU dedicada.

Su relevancia actual es practica: convierte un modelo de investigacion en un artefacto desplegable en aplicaciones Flutter mediante Candle (`marian_flutter`), sustituyendo los tokenizadores SentencePiece originales por tokenizadores rapidos en formato JSON de Hugging Face separados para codificador y decodificador. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y la licencia no figura declarada en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | 75.526.403 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; consultar `config.json` del repositorio |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos `safetensors` sin cuantizar |
| Idiomas soportados | es (espanol) → ee (codigo de idioma destino segun la model card) |
| Licencia | No disponible en el repositorio; la model card remite a la licencia del modelo upstream (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), config Marian en `config.json`, tokenizadores rapidos en `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

La arquitectura es el transformer encoder-decoder de Marian NMT, el framework de traduccion automatica neuronal desarrollado por el equipo de Adam Mickiewicz University y utilizado por el proyecto OPUS-MT. Se trata de un modelo seq2seq estandar con atencion, tarea `text2text-generation` en el ecosistema Transformers y pipeline `translation`. Los 75,5 millones de parametros y el tamano de repositorio de 0,3 GB son compatibles con la variante "base" de la familia OPUS-MT. La informacion disponible no detalla el numero de capas, dimensiones de modelo, cabezas de atencion ni vocabulario; esos datos estan en `config.json` pero no se reproducen en la model card.

En cuanto al entrenamiento, la model card de este repositorio no aporta ningun dato: no indica volumen de tokens, composicion del corpus, ni si hubo ajuste con RLHF o DPO. Lo unico verificable es la procedencia: el modelo base es `Helsinki-NLP/opus-mt-es-ee`, entrenado dentro del proyecto OPUS-MT de la Universidad de Helsinki sobre el corpus paralelo OPUS, con tokenizacion SentencePiece y, previsiblemente, tecnicas de aumentacion de datos propias del proyecto (no confirmado en esta informacion). Malinali declara explicitamente que no reclama la propiedad del modelo entrenado y que su aportacion se limita al reempaquetado de pesos y a la conversion de SentencePiece a tokenizadores rapidos de Hugging Face.

## Capacidades

- Traduccion automatica de texto en la direccion es → ee. Es la unica tarea declarada en la model card.
- Generacion text2text mediante el pipeline `translation` de Transformers.
- Tokenizacion rapida compatible con Hugging Face, con tokenizadores separados para codificador y decodificador (`tokenizer-enc.json`, `tokenizer-dec.json`).
- Inferencia en dispositivo: los pesos estan preparados para Candle a traves del binding `marian_flutter`.
- Compatibilidad con endpoints gestionados (etiqueta `endpoints_compatible` en el repositorio).
- No soporta tool calling ni function calling: no hay ninguna indicacion de ello en la model card.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", vision, audio ni multimodalidad.
- No hay evidencia de capacidades multilingues adicionales mas alla del par declarado.

## Casos de uso

- Traduccion integrada en aplicacion movil Flutter: el paquete esta disenado para Candle y `marian_flutter`, de modo que permite incorporar traduccion es → ee directamente en el dispositivo, sin llamadas a red ni coste por token, con un modelo de 0,3 GB apto para almacenamiento local.
- Traduccion de documentacion tecnica y manuales: al ser un modelo seq2seq de dominio general entrenado sobre corpus paralelos variados, encaja en la traduccion de textos informativos y administrativos donde no se requiere terminologia muy especializada.
- Preprocesado y anotacion de corpus: generacion de traducciones automaticas para poblar corpus paralelos o como paso previo a revision humana en proyectos de linguistica computacional.
- Localizacion de interfaces y cadenas de producto: traduccion de textos cortos (etiquetas, mensajes de sistema, descripciones de producto) en pipelines de CI/CD, con la ventaja de ser un modelo lo bastante pequeno para ejecutarse en el mismo runner que compila la aplicacion.
- Subtitulado y transcripcion multilingue: traduccion de segmentos cortos de subtitulos siempre que se segmenten respetando el limite de longitud del modelo.
- Investigacion en traduccion de bajos recursos: servir como linea base reproducible para comparar con modelos mas grandes (NLLB, M2M-100) en un par con poca cobertura, precisamente por su tamano reducido y su caracter de codigo abierto.
- Servicio de traduccion en el borde (edge computing): despliegue en servidores sin GPU o en dispositivos con recursos limitados, donde un modelo de 75 millones de parametros ofrece un equilibrio razonable entre calidad y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones BLEU, METEOR, chrF ni comparaciones con otros sistemas, y la busqueda web no ha devuelto documentacion tecnica del modelo. No se deben inferir cifras del modelo upstream sin verificarlas en su propia model card.

## Requisitos de hardware

- VRAM estimada en funcion de la precision, calculada a partir de los 75.526.403 parametros: aproximadamente 302 MB en FP32, 151 MB en FP16/BF16 y 76 MB en int8. Con cuantizacion de 4 bits se situaria en torno a 40-45 MB solo de pesos, mas el overhead del runtime.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU con 1-2 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 resultan sobredimensionadas para este modelo.
- Si cabe en GPU de consumo: si, con margen amplio. Tambien cabe en CPU, en Raspberry Pi de gama media-alta y en telefonos moviles, que es precisamente el escenario de despliegue declarado.
- Opciones de despliegue: Transformers en Python para inferencia de referencia; Candle a traves de `marian_flutter` para Flutter; conversion a ONNX o a formatos cuantizados propia del usuario. No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa. Tampoco hay soporte confirmado en vLLM o TGI, que estan orientados a decodificadores y a modelos de mayor tamano.
- Latencia y throughput estimados: no disponibles. Al tratarse de un encoder-decoder de 75 millones de parametros, la latencia por frase en CPU moderna deberia situarse en el orden de decenas a pocos cientos de milisegundos, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-es-ee | 75,5 M | No disponible | Traduccion es → ee | No declarada (upstream habitualmente CC-BY 4.0) | Hugging Face, pesos safetensors + tokenizadores rapidos |
| Helsinki-NLP/opus-mt-es-ee (upstream) | Similar, derivado del mismo entrenamiento | No disponible en esta informacion | Traduccion es → ee | CC-BY 4.0 segun la practica del proyecto OPUS-MT | Hugging Face, pesos originales con tokenizador SentencePiece |
| facebook/nllb-200-distilled-600M | 600 M | 512 tokens | Traduccion multilingue (200 idiomas) | CC-BY-NC 4.0 (restriccion de uso comercial) | Hugging Face, Transformers |
| Helsinki-NLP/opus-mt-es-en | En torno a 75 M | No disponible | Traduccion es → en | CC-BY 4.0 | Hugging Face, Transformers |

La ventaja principal de este paquete frente al modelo upstream es operativa, no de calidad: tokenizadores rapidos ya convertidos y pesos listos para Candle. Frente a NLLB-200-distilled-600M ofrece un consumo de recursos mucho menor, a costa de cubrir un unico par de idiomas y de una calidad presumiblemente inferior en un par de bajos recursos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna medicion publicada de calidad de traduccion, ni propia ni reproducida del modelo upstream, por lo que no se puede afirmar nada sobre su BLEU o chrF.
- Direccion unica: el modelo solo traduce es → ee. No cubre la direccion inversa ni pares adicionales.
- Sesgo de dominio: al proceder del corpus OPUS y del pipeline OPUS-MT, cabe esperar un sesgo hacia los generos sobrerrepresentados en ese corpus (textos religiosos, legislativos, webs y subtitulos), con menor cobertura de lenguaje coloquial o terminologia tecnica reciente.
- Riesgo de alucinacion y de omision: como todo modelo seq2seq, puede generar contenido no presente en el original, repetir fragmentos o truncar frases largas. En traduccion de bajos recursos este riesgo se acentua.
- Ambiguedad del codigo de idioma: la model card identifica el idioma destino como "ee". Conviene verificar en el modelo upstream si se refiere a ewe (ISO 639-1: ee) o a estonio, que en OPUS-MT se codifica habitualmente como "et", antes de desplegarlo en produccion.
- Limite de longitud no documentado: se desconoce la longitud maxima de secuencia soportada. Se recomienda consultar `config.json` y segmentar entradas largas.
- Licencia indeterminada: el repositorio no declara licencia y remite a la del modelo upstream. Para uso comercial es imprescindible confirmar la licencia de `Helsinki-NLP/opus-mt-es-ee` y citar la atribucion correspondiente.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin issues ni discusion asociada. No hay evidencia externa de que el reempaquetado produzca salidas identicas a las del modelo original.
- Carga no estandar: el repositorio usa tokenizadores separados para codificador y decodificador, lo que puede requerir codigo especifico en lugar del cargador automatico de Transformers.
- Malinali declara explicitamente que no reclama la propiedad del modelo; cualquier incidencia de calidad debe atribuirse al modelo upstream, no al reempaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-es-ee
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-es-ee
- Proyecto OPUS-MT (codigo): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Corpus OPUS: https://opus.nlpl.eu
- Framework Marian NMT: https://github.com/marian-nmt/marian
