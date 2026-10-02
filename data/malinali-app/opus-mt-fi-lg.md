# malinali-app/opus-mt-fi-lg

## Resumen

malinali-app/opus-mt-fi-lg es un paquete de pesos de traduccion automatica neuronal para el par fines → luganda, publicado por el desarrollador malinali-app a partir del modelo base Helsinki-NLP/opus-mt-fi-lg. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de los pesos originales de Helsinki-NLP en formato safetensors, acompanado de tokenizadores rapidos convertidos de SentencePiece a JSON de Hugging Face para su uso con el runtime Candle (concretamente la libreria marian_flutter de Malinali). El objetivo declarado es habilitar traduccion en dispositivo (on-device) dentro de la aplicacion Malinali.

El modelo emplea una arquitectura transformer encoder-decoder de tipo Marian, con 76.609.346 parametros totales y un tamano de repositorio de 0,3 GB. Traduce exclusivamente en la direccion fi → lg y esta etiquetado para la libreria transformers y el pipeline de translation. Al estar basado en la familia OPUS-MT, hereda el planteamiento de traduccion multilingue de proposito general de Helsinki-NLP sobre corpus paralelos OPUS.

Su relevancia actual es limitada pero concreta: cubre un par de idiomas de bajos recursos (fines y luganda) con un modelo pequeno que cabe en cualquier dispositivo, en un contexto donde la mayoria de los modelos de traduccion de gran tamano no ofrecen cobertura fiable de lg. La contrapartida es que el repositorio no incluye informacion sobre licencia propia, no publica benchmarks y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian |
| Parametros totales | 76.609.346 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | fines (fi) y luganda (lg) |
| Licencia | no disponible en los metadatos del repositorio; la model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del framework Marian NMT, un transformer encoder-decoder disenado especificamente para traduccion automatica. El modelo es un reempaquetado directo de Helsinki-NLP/opus-mt-fi-lg: malinali-app no entrena ni ajusta los pesos, solo los convierte a safetensors y transforma los tokenizadores SentencePiece originales en dos ficheros JSON de tokenizador rapido (`tokenizer-enc.json` para la fuente y `tokenizer-dec.json` para el destino). El repositorio contiene cuatro ficheros: `config.json`, `model.safetensors`, `tokenizer-enc.json` y `tokenizer-dec.json`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; estos datos corresponden al modelo original de Helsinki-NLP y no se reproducen en esta ficha. La model card del reempaquetado declara explicitamente que no se reclama la propiedad del modelo entrenado y que la unica innovacion aportada es el formato de distribucion orientado a inferencia en dispositivo mediante Candle. Como innovaciones tecnicas reseñables solo constan la conversion del tokenizador a formato rapido y la compatibilidad declarada con `endpoints_compatible` y Candle.

## Capacidades

- Traduccion de texto de fines (fi) a luganda (lg), en una unica direccion.
- Generacion text2text con pipeline `translation` de la libreria transformers.
- Inferencia en dispositivo mediante Candle a traves de `marian_flutter`.
- Tokenizacion rapida separada para fuente y destino (tokenizadores SentencePiece convertidos a JSON).
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni ninguna modalidad distinta de texto.
- No se documentan capacidades multilingues mas alla del par fi → lg.

## Casos de uso

- Traduccion offline en aplicaciones moviles: al ser un modelo de 76,6 M de parametros y 0,3 GB, puede empaquetarse dentro de una app Flutter mediante `marian_flutter` y traducir sin conexion, algo critico en regiones donde el luganda es mayoritario y la conectividad es intermitente.
- Privacidad de datos en traduccion sensible: al ejecutarse en el propio dispositivo, el texto en fines nunca sale del terminal, lo que resulta adecuado para traduccion de documentos personales, sanitarios o legales.
- Atencion a comunidades lugandoparlantes: servicios publicos, ONG o plataformas de comunicacion que necesiten ofrecer contenido en fines a hablantes de luganda pueden integrar el modelo como capa de traduccion de bajo coste.
- Localizacion de interfaces y documentacion: traduccion de cadenas cortas, avisos y microcopy de aplicaciones dirigidas al mercado ugandes, siempre que el contenido fuente este en fines.
- Preservacion y ensenanza linguistica: generacion de material bilingue fi-lg para recursos educativos o de documentacion del luganda, un idioma con menor cobertura en modelos comerciales.
- Edge computing e IoT: por su tamano reducido puede desplegarse en dispositivos con CPU modesta o GPUs integradas, como quioscos de traduccion o terminales de punto de venta.
- Pipelines de traduccion por lotes: integracion en flujos con transformers para procesar volumenes moderados de texto fi → lg en servidor sin necesidad de GPU dedicada.
- Prototipado rapido de sistemas de traduccion: sirve como componente base barato para validar arquitecturas de traduccion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas BLEU, chrF ni comparaciones con otros sistemas, y no se dispone de cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 (306 MB de pesos) y aproximadamente 0,15 GB en FP16 (153 MB); en INT8 rondaria los 77 MB, aunque no se publican variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; modelos como RTX 4090, A100 o H100 son enormemente sobredimensionados para este modelo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e integrada, e incluso puede ejecutarse exclusivamente en CPU.
- Opciones de despliegue: transformers con pipeline `translation`, Candle mediante `marian_flutter`, y conversiones propias a ONNX. No se documentan ficheros GGUF, por lo que llama.cpp y Ollama no son utilizables sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fi-lg | 76.609.346 | no disponible | fi → lg | no disponible (hereda la del base) | safetensors, transformers, Candle |
| Helsinki-NLP/opus-mt-fi-lg (modelo base) | no disponible | no disponible | fi → lg | habitualmente CC-BY 4.0 en OPUS-MT | pesos originales en transformers |
| Otros pares de la familia OPUS-MT de Helsinki-NLP | no disponible | no disponible | multiples pares, entre ellos varios con lg | habitualmente CC-BY 4.0 | transformers, amplia comunidad |
| NLLB-200 (variantes destiladas) | no disponible | no disponible | mas de 200 idiomas, incluye fi y lg | CC-BY-NC 4.0 en varias versiones (restringe uso comercial) | transformers, ecosistema amplio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo estrictamente unidireccional: solo traduce fi → lg; no soporta la direccion inversa ni otros pares.
- Idiomas de bajos recursos: el luganda cuenta con menos corpus paralelos que idiomas mayoritarios, lo que puede degradar la calidad en dominios especializados o con vocabulario tecnico.
- Riesgo de alucinacion y de omisiones: como todo sistema de traduccion neuronal, puede producir contenido no presente en el texto original, inventar terminos o saltarse fragmentos, especialmente con frases largas o ambiguas.
- Longitud de contexto no especificada en el repositorio; se desconoce el limite practico de tokens por segmento.
- Licencia no declarada en los metadatos: aunque la model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT), la ausencia de una declaracion explicita en este repositorio supone un riesgo legal para uso comercial que conviene resolver antes de desplegar en produccion.
- Cero descargas y cero likes en el momento de la consulta: el modelo no cuenta con validacion de la comunidad ni con informes independientes de calidad.
- Es un reempaquetado de terceros, no el modelo original; ante cualquier incidencia de calidad conviene contrastar con Helsinki-NLP/opus-mt-fi-lg.
- La fecha de creacion reportada en los metadatos (2026-10-02) es posterior a la fecha de consulta habitual, lo que sugiere un posible error de registro que conviene verificar.
- No hay variantes cuantizadas publicadas, por lo que el ahorro de memoria en despliegues muy ajustados requiere conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-fi-lg
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fi-lg
- Repositorio del proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
