# malinali-app/opus-mt-fr-tw

## Resumen

`malinali-app/opus-mt-fr-tw` es un paquete de pesos publicados para inferencia local en dispositivo (on-device) del modelo de traduccion automatica Helsinki-NLP OPUS-MT para la direccion frances (fr) → twi (tw). El autor, `malinali-app`, no entrena un modelo nuevo: republica los pesos originales de `Helsinki-NLP/opus-mt-fr-tw` en formato safetensors y convierte los tokenizadores SentencePiece originales a JSON de tokenizador rapido de Hugging Face, con el objetivo de que funcionen con el runtime Candle (concretamente con el componente `marian_flutter`) dentro de la aplicacion Malinali.

Se trata de un modelo encoder-decoder de arquitectura Marian, con 75.537.176 parametros totales (aproximadamente 75,5 millones, segun los pesos safetensors del repositorio) y un tamano de repositorio de 0,3 GB. Es, por tanto, un modelo pequeno orientado a latencia baja y a ejecucion en CPU o en GPU de gama de entrada, no a traduccion de alta calidad multilingue general.

Su relevancia es acotada y muy especifica: cubre un par de idiomas con recursos limitados (frances-twi) que apenas esta representado en los grandes modelos multilingues, y lo empaqueta de forma directamente consumible por un runtime Rust/Candle. La informacion publicada es minima: no hay datos de benchmarks, no se declara licencia propia y la model card se limita a describir los ficheros y a ceder el credito al modelo base. Los resultados de busqueda web disponibles no contienen informacion tecnica relevante sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, seq2seq) |
| Parametros totales | 75.537.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors) |
| Idiomas soportados | fr (frances), tw (twi) |
| Licencia | no disponible en el repositorio; la model card remite a la del modelo base (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), mas tokenizadores rapidos JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) y `config.json` |
| Direccion de traduccion | fr → tw (unidireccional) |
| Libreria declarada | transformers |
| Pipeline | translation |
| Modelo base | Helsinki-NLP/opus-mt-fr-tw |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer seq2seq con encoder y decoder de atencion completa, el estandar de la familia OPUS-MT de Helsinki-NLP. El repositorio declara el tag `marian` junto con `opus-mt`, `candle` y `malinali`, y el `config.json` incluido es una configuracion Marian estandar. Al tratarse de una republicacion de pesos, no se aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; en OPUS-MT el entrenamiento se basa en corpus paralelos de OPUS y no se emplea alineacion por preferencias.

La unica innovacion tecnica que introduce este paquete es de empaquetado, no de modelado: la conversion de los tokenizadores SentencePiece originales a tokenizador rapido de Hugging Face (un fichero para el lado fuente, `tokenizer-enc.json`, y otro para el lado destino, `tokenizer-dec.json`) y la publicacion de los pesos en safetensors para su carga desde Candle. La model card indica explicitamente que el autor no reclama la propiedad del modelo entrenado y que solo redistribuye pesos y tokenizadores.

## Capacidades

- Traduccion automatica unidireccional de frances a twi, con salida de texto plano.
- Ejecucion en dispositivo (on-device) mediante el runtime Candle, a traves del componente `marian_flutter` de Malinali.
- Carga directa con la libreria `transformers` (pipeline `translation`), segun los tags y la configuracion del repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite exponerlo como servicio de inferencia.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es un modelo puramente seq2seq de traduccion.
- Capacidades multilingues limitadas estrictamente al par fr → tw; no se documenta traduccion inversa ni pivote a otros idiomas.
- No se documentan capacidades de instrucciones, dialogo ni generacion libre de texto.

## Casos de uso

- Traduccion on-device en la aplicacion Malinali: el modelo esta empaquetado especificamente para `marian_flutter` sobre Candle, de modo que la app puede traducir texto fr → tw en el propio dispositivo sin enviar contenido a un servidor, lo que reduce latencia y evita exponer datos del usuario.
- Traduccion de documentacion administrativa y sanitaria para comunidades twihablantes: con 75,5 millones de parametros el modelo cabe en un portatil o incluso en un movil, por lo que se puede desplegar en puestos de atencion al ciudadano sin infraestructura GPU.
- Localizacion de interfaces y contenidos digitales: traduccion por lotes de cadenas de texto (ficheros de recursos, mensajes de aplicacion, correos) del frances al twi como paso previo a revision humana.
- Preprocesado de corpus para investigacion en lenguas de bajos recursos: generacion de traducciones automaticas de referencia para anotacion, evaluacion o aumentacion de datos en el par fr-tw, donde los corpus paralelos son escasos.
- Subtitulado y transcripcion asistida: traduccion de lineas de subtitulos en frances a twi en un flujo local, sin depender de APIs de pago con limite de caracteres.
- Procesamiento por lotes en servidores modestos: al requerir en torno a 300 MB en fp32, se puede ejecutar en contenedores pequenos o en CPU sin GPU dedicada para traducir volumenes grandes de documentos durante la noche.
- Prototipado y ensayos de integracion en pipelines de traduccion: su tamano reducido y su formato safetensors lo hacen util como componente de prueba en sistemas mas grandes (por ejemplo, enrutado de idioma, pivote fr → tw → otro idioma) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de BLEU, chrF, COMET ni comparaciones con otros sistemas, y los resultados de busqueda web obtenidos no contienen datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 302 MB (75,5 M de parametros × 4 bytes), mas el coste del tokenizador y de las activaciones, marginal para secuencias cortas.
- VRAM estimada en fp16/bf16: en torno a 151 MB, si se convierte manualmente (el repositorio solo publica pesos sin declarar su precision).
- VRAM estimada en int8: en torno a 76 MB, aunque no se distribuye ninguna cuantizacion oficial.
- GPU recomendadas: cualquier GPU con mas de 1 GB de memoria sirve; es funcionalmente adecuado en GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque en estas ultimas el modelo esta infrautilizado. Tambien es viable en NPU y aceleradores moviles.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU o en dispositivo movil sin acelerador dedicado.
- Opciones de despliegue: Candle (objetivo principal, via `marian_flutter`), biblioteca `transformers` de Hugging Face y servidores de inferencia compatibles con el pipeline `translation`. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa no documentada. El soporte en vLLM o TGI no esta verificado en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Con 75,5 M de parametros, en CPU moderna cabe esperar ordenes de magnitud de decenas de milisegundos por frase corta, pero no hay ningun dato publicado que lo confirme.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Direccion | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fr-tw | 75,5 M | fr, tw | fr → tw | no disponible (remite al upstream) | safetensors + tokenizadores JSON; 0,3 GB |
| Helsinki-NLP/opus-mt-fr-tw | no disponible en la informacion proporcionada | fr, tw | fr → tw | no disponible en la informacion proporcionada (habitualmente CC-BY 4.0) | pesos originales de OPUS-MT en safetensors |
| Otros modelos OPUS-MT por par de idiomas | en el rango de decenas de millones | pares concretos | bidireccional segun el par | habitualmente CC-BY 4.0 | safetensors |
| Modelos multilingues de traduccion de gran tamano (por ejemplo, la familia NLLB o M2M-100) | cientos de millones a miles de millones | decenas o cientos de idiomas, con cobertura de tw variable | multidireccional | varian segun modelo (algunas con restricciones de uso comercial) | safetensors, GGUF en algunos casos |

No se dispone de datos de rendimiento comparado (BLEU, chrF, COMET) en la informacion proporcionada, por lo que la comparacion se limita a parametros, cobertura de idiomas, licencia y formato de distribucion. La ventaja diferencial de este paquete no es la calidad de traduccion, sino el empaquetado especifico para Candle y su tamano reducido.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de corpus OPUS, es esperable el sesgo de dominio de dichos corpus (textos religiosos, politicos, subtitulos y web), pero no hay analisis publicado.
- Riesgo de alucinacion: en traduccion neuronal seq2seq el riesgo se manifiesta como omisiones, repeticiones y traducciones inventadas cuando la frase de entrada esta fuera del dominio de entrenamiento o es muy larga.
- Limitacion de contexto: la longitud de contexto no esta documentada en el repositorio. Los modelos Marian de OPUS-MT suelen limitarse a secuencias cortas, por lo que es previsible un degradado notable con parrafos largos; conviene segmentar la entrada antes de traducir.
- Cobertura de idioma: el modelo solo traduce fr → tw. No soporta la direccion inversa ni otros pares. El twi es una lengua de bajos recursos, por lo que se espera una calidad inferior a la de pares con mas datos.
- Licencia: la ficha de Hugging Face no declara licencia. La model card indica que debe seguirse la del modelo base, que en OPUS-MT suele ser CC-BY 4.0, pero esta circunstancia no esta confirmada en la informacion disponible. Antes de un uso comercial es imprescindible verificar la licencia del modelo original con Helsinki-NLP.
- Precision de los pesos: el repositorio no declara la precision de `model.safetensors`; asumir fp32 puede no ser correcto y afectaria a los calculos de memoria.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, y fecha de creacion y actualizacion muy proximas entre si (2 de octubre de 2026), lo que indica un artefacto recien publicado y sin validacion externa.
- Dependencia del ecosistema Candle: aunque el pipeline `translation` de `transformers` deberia funcionar, el objetivo declarado es `marian_flutter`; fuera de ese entorno la integracion no esta verificada.
- Ausencia total de evaluacion: sin benchmarks publicados ni pruebas de calidad, no es recomendable desplegarlo en produccion sin una evaluacion propia sobre un conjunto de prueba representativo del dominio de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-fr-tw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-tw
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Candle (runtime de inferencia en Rust): https://github.com/huggingface/candle
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos no guardan relacion con el y se han descartado.
