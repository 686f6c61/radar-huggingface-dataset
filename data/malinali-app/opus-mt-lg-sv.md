# malinali-app/opus-mt-lg-sv

## Resumen

`malinali-app/opus-mt-lg-sv` es un paquete de traduccion automatica publicada por el desarrollador `malinali-app` para su aplicacion Malinali. No es un modelo entrenado desde cero: se trata de una redistribucion de los pesos de `Helsinki-NLP/opus-mt-lg-sv`, el modelo de traduccion luganda (lg) a sueco (sv) desarrollado dentro del proyecto OPUS-MT de la Universidad de Helsinki. El repositorio incluye los pesos en formato `safetensors` y tokenizadores rapidos convertidos desde SentencePiece a JSON para su uso con Candle.

El modelo sigue la arquitectura Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal, con 76.100.450 parametros totales y un peso de repositorio de 0,3 GB. Es, por tanto, un modelo pequeno y ligero, pensado para inferencia en dispositivo (on-device) y no para tareas generativas generales ni para razonamiento.

Su relevancia es doble. Por un lado, cubre un par de idiomas de bajos recursos (luganda, idioma bantu hablado principalmente en Uganda, hacia sueco), un par poco frecuente en los catalogos de traduccion. Por otro, su empaquetado esta orientado a despliegue local en aplicaciones moviles y de escritorio mediante Candle, lo que lo hace util como componente de traduccion offline sin dependencia de API externas. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia MarianMT) |
| Parametros totales | 76.100.450 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos OPUS-MT se entrenan habitualmente con segmentos de hasta 512 tokens; no confirmado para este repositorio) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos sin cuantizar en `safetensors`; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | luganda (lg) como origen, sueco (sv) como destino; direccion unica lg a sv |
| Licencia | no disponible en los metadatos del repositorio; la model card indica que se debe seguir la licencia del modelo original (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | `safetensors` (`model.safetensors`) mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde a Marian, la herramienta de traduccion automatica neuronal sobre la que se construyo la familia OPUS-MT. Se trata de un transformer encoder-decoder clasico orientado a traduccion: el codificador procesa la secuencia en el idioma origen y el decodificador genera la traduccion token a token. El repositorio de `malinali-app` no entrena el modelo; unicamente redistribuye los pesos originales de `Helsinki-NLP/opus-mt-lg-sv` en `safetensors` y aporta dos tokenizadores rapidos (uno para el lado fuente y otro para el lado destino) convertidos de SentencePiece a formato JSON compatible con Hugging Face, para poder ejecutarse con el backend Candle a traves del componente `marian_flutter`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. En el caso de la familia OPUS-MT, el entrenamiento se realiza sobre corpus paralelos recopilados en el proyecto OPUS, pero este dato no se detalla en la informacion proporcionada para este repositorio concreto. La model card del paquete indica explicitamente que `malinali-app` no reclama la propiedad del modelo entrenado y que la licencia aplicable es la del modelo original.

## Capacidades

- Traduccion de texto de luganda a sueco, en una unica direccion. No se documenta soporte para la direccion inversa (sv a lg) en este repositorio.
- Generacion de texto de tipo `text2text-generation` mediante el pipeline `translation` de la libreria `transformers`.
- Inferencia en dispositivo mediante Candle, con tokenizadores rapidos especificos para el backend `marian_flutter`.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`), lo que permite desplegarlo como endpoint alojado con el runtime de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada estrictamente al par lg-sv; no es un modelo de traduccion multilingue general.

## Casos de uso

- Traduccion offline en aplicaciones moviles: al ocupar 0,3 GB y contar con pesos en `safetensors` y tokenizadores rapidos, el modelo puede integrarse en una app Flutter mediante Candle y traducir texto luganda a sueco sin conexion a internet.
- Traduccion de contenido editorial y periodistico ugandes hacia sueco: util para redacciones o agencias que publiquen material en luganda y necesiten una primera version en sueco para revision humana.
- Preprocesado de corpus para investigacion en linguistica: traduccion automatica de conjuntos de textos en luganda a sueco para analisis comparativo o para construir corpus paralelos alineados.
- Servicio de traduccion por lotes de bajo coste: dado su tamano, puede ejecutarse en CPU y procesar grandes volumenes de segmentos cortos en pipelines por lotes.
- Componente de un sistema de traduccion en cascada: encadenar lg a sv con otro modelo sv a X para cubrir pares de idiomas no soportados directamente.
- Traduccion asistida en atencion al cliente para comunidades lugandoparlantes en Suecia: integrado en un chatbot como paso posterior a la deteccion de idioma, siempre con supervision humana para contenidos sensibles.
- Prototipado rapido y evaluacion de calidad de traduccion: al ser un paquete ligero, sirve para medir la viabilidad de un flujo lg-sv antes de invertir en modelos mayores o en servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas BLEU, chrF, MMLU, HumanEval ni GSM8K, y los resultados de busqueda web recuperados no contienen datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp32, los 76,1 millones de parametros ocupan aproximadamente 304 MB; en fp16, unos 152 MB. A ello hay que sumar la memoria de activaciones, que para secuencias de traduccion cortas es reducida.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. No requiere A100 ni H100; una GTX 1650, RTX 3050 o superior es mas que suficiente, y tambien una RTX 4090 o una GPU integrada moderna.
- Cabe en GPU de consumo: si, con holgura, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: `transformers` con PyTorch o TensorFlow, Candle mediante `marian_flutter`, ONNX Runtime y CTranslate2 como alternativas habituales para modelos Marian. No se documenta soporte nativo para vLLM, TGI, Ollama ni llama.cpp en este repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `malinali-app/opus-mt-lg-sv` | 76,1 M | no disponible | lg a sv (direccion unica) | no disponible (hereda la del modelo original) | Hugging Face, pesos `safetensors` |
| `Helsinki-NLP/opus-mt-lg-sv` | 76,1 M (mismo modelo base) | no disponible | lg a sv | habitualmente CC-BY 4.0 | Hugging Face, pesos originales PyTorch |
| `facebook/nllb-200-distilled-600M` | 600 M | 512 tokens | 200 idiomas, incluido luganda | CC-BY-NC 4.0 (uso no comercial) | Hugging Face |
| `facebook/m2m100_418M` | 418 M | no disponible | 100 idiomas | MIT | Hugging Face |

La comparacion con NLLB-200 y M2M-100 es orientativa: son modelos multilingues de mayor tamano que cubren el par lg-sv junto con muchos otros, a cambio de un mayor coste de memoria y, en el caso de NLLB, de una licencia que restringe el uso comercial. No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al derivar de corpus OPUS puede heredar sesgos de genero, nacionalidad o registro presentes en los textos paralelos de origen.
- Riesgo de alucinacion: como todo modelo de traduccion neuronal, puede generar traducciones fluidas pero incorrectas, especialmente con nombres propios, terminologia tecnica, numeros y expresiones idiomaticas del luganda.
- Limitaciones de contexto: se desconoce la longitud de contexto exacta soportada. Los modelos Marian suelen degradarse con segmentos largos, por lo que se recomienda dividir el texto en frases antes de traducir.
- Limitaciones de idioma: cobertura restringida a la direccion lg a sv. No traduce a otros idiomas ni en sentido inverso, y el luganda es un idioma de bajos recursos, lo que reduce la calidad esperada frente a pares con mas datos.
- Restricciones de licencia: la licencia no esta declarada en los metadatos del repositorio. Antes de un uso comercial es imprescindible verificar la licencia del modelo original `Helsinki-NLP/opus-mt-lg-sv`; la model card del paquete remite a ella y sugiere que podria ser CC-BY 4.0, que permite uso comercial con atribucion.
- Caveats para produccion: el repositorio registra cero descargas y cero interacciones, sin historial de mantenimiento, por lo que no hay garantias de soporte continuado. Es un reempaquetado, no un modelo afinado, y cualquier mejora de calidad debe buscarse en el modelo original o en alternativas multilingues mayores.
- Trazabilidad: la model card aclara que `malinali-app` no reclama la propiedad del modelo entrenado, por lo que la atribucion y las condiciones de uso dependen del proyecto OPUS-MT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-lg-sv
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-lg-sv
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
