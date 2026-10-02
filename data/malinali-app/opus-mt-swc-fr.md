# malinali-app/opus-mt-swc-fr

## Resumen

`malinali-app/opus-mt-swc-fr` es un paquete de traduccion automatica neuronal para la direccion suajili del Congo (swc) → frances (fr), publicado por el desarrollador `malinali-app`. No se trata de un modelo entrenado desde cero: es un reempaquetado de los pesos del modelo `Helsinki-NLP/opus-mt-swc-fr` de OPUS-MT, convertidos a formato safetensors y acompanados de tokenizadores rapidos (SentencePiece convertido a JSON de tokenizer de Hugging Face) para su ejecucion en el framework Candle, concretamente en el motor `marian_flutter`.

El modelo tiene 75.531.020 parametros y un repositorio de 0,3 GB, lo que lo situa en la categoria de modelos de traduccion ligeros, disenados para inferencia en dispositivo. Su relevancia radica en ese enfoque on-device: permite traduccion swc→fr sin conexion y sin depender de APIs externas, algo poco habitual para un par de idiomas de bajos recursos como el suajili del Congo.

Al ser un derivado directo de OPUS-MT, hereda tanto las capacidades como las limitaciones del modelo original, y su utilidad practica esta ligada a la disponibilidad de los pesos upstream y a la licencia que estos tengan (la model card remite a la licencia del modelo original, tipicamente CC-BY 4.0 para OPUS-MT, pero el campo de licencia del repositorio aparece como no disponible).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT, implementacion Marian NMT) |
| Parametros totales | 75.531.020 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en precision original; no publica GGUF ni variantes cuantizadas) |
| Idiomas soportados | swc (suajili del Congo) como origen, fr (frances) como destino |
| Licencia | no disponible en el repositorio (la model card indica seguir la licencia del modelo upstream, tipicamente CC-BY 4.0) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |
| Tamano del repositorio | 0,3 GB |
| Libreria declarada | transformers |
| Pipeline | translation |
| Modelo base | Helsinki-NLP/opus-mt-swc-fr |
| Direccion de traduccion | swc → fr (unidireccional) |

## Arquitectura y entrenamiento

El modelo es una red neuronal de traduccion de tipo transformer encoder-decoder con atencion cruzada entre encoder y decoder, en la implementacion MarianMT (Marian NMT). El recuento de 75,5 millones de parametros es coherente con la configuracion base de la familia OPUS-MT, aunque los hiperparametros exactos (numero de capas, dimension del modelo, cabezas de atencion) no se detallan en la informacion disponible. La tokenizacion se realiza con dos tokenizadores SentencePiece independientes, uno para el idioma origen y otro para el destino, convertidos a formato fast tokenizer de Hugging Face.

En cuanto al entrenamiento, el repositorio no aporta informacion: no se especifica el numero de tokens, la composicion del corpus, ni si hubo etapas de ajuste con RLHF o DPO (poco habituales en traduccion automatica). Todo el entrenamiento corresponde al modelo upstream de Helsinki-NLP, y el trabajo de `malinali-app` se limita al reempaquetado de pesos y a la conversion del tokenizador para su uso con Candle. La innovacion tecnica destacable no esta en el modelo en si, sino en el formato de distribucion orientado a inferencia en dispositivo mediante `marian_flutter`.

## Capacidades

- Traduccion de texto unidireccional de swc (suajili del Congo) a fr (frances).
- Generacion de texto seq2seq condicionada a la secuencia de entrada (tarea text2text-generation).
- Ejecucion en dispositivo (on-device) mediante Candle y el motor `marian_flutter`, sin necesidad de conexion a internet.
- Tokenizacion rapida tanto del lado origen como del destino, con vocabularios independientes.
- Integracion con el ecosistema `transformers` (compatible con la clase MarianMTModel y el pipeline de translation).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio.

## Casos de uso

- Traduccion en dispositivo sin conexion: aplicaciones moviles o de escritorio que necesiten traducir swc→fr sin acceso a red, gracias al formato safetensors y al motor ligero de Candle.
- Atencion ciudadana y servicios publicos en regiones de habla suajili del Congo: traduccion de formularios, avisos y comunicaciones administrativas al frances para su tramitacion.
- ONG y ayuda humanitaria: traduccion de instrucciones, material sanitario o mensajes de coordinacion entre equipos locales (swc) y donantes o sedes francoparlantes (fr).
- Traduccion de mensajeria y comunicacion interpersonal: integracion en clientes de mensajeria para traducir conversaciones de swc a fr en tiempo de ejecucion local.
- Subtitulado y transcripcion de contenido audiovisual: generacion de subtitulos en frances a partir de transcripciones en suajili del Congo.
- Documentacion tecnica y educativa: traduccion de manuales, material didactico o articulos para su difusion en contextos francoparlantes.
- Procesamiento por lotes de corpus: traduccion de grandes volumenes de texto swc a fr en pipelines offline, dado el reducido tamano del modelo (75,5 M de parametros) y su bajo coste computacional.
- Preprocesado en pipelines de datos multilingues: uso como etapa de traduccion intermedia antes de aplicar clasificacion, indexacion o analisis posteriores en frances.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye puntuaciones de BLEU, chrF, COMET ni de ninguna otra metrica, ni comparaciones con modelos alternativos. Cualquier cifra de calidad deberia obtenerse evaluando el modelo sobre un corpus de referencia propio, teniendo en cuenta que se trata de un derivado directo de `Helsinki-NLP/opus-mt-swc-fr` y que su rendimiento deberia ser equivalente al del modelo upstream.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP32 aproximadamente 0,3 GB solo para pesos; en FP16 aproximadamente 0,15 GB; en cuantizacion INT8 aproximada 0,08 GB. A estas cifras hay que sumar la memoria de activaciones y el overhead del runtime, por lo que en la practica basta con unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente (RTX 3060, RTX 4090, A100, H100). El modelo esta muy por debajo de la capacidad de todas ellas.
- Inferencia en CPU: totalmente viable. Con 75,5 M de parametros, el modelo puede ejecutarse en CPU en dispositivos moviles o equipos de escritorio sin GPU.
- Consumer GPU: si, cabe en cualquier GPU de consumo, incluso en las mas modestas, y tambien en hardware embebido o telefonos moviles mediante Candle.
- Opciones de despliegue: Candle (via `marian_flutter`, el objetivo declarado del paquete), `transformers` con PyTorch o TensorFlow, y de forma indirecta vLLM, TGI, llama.cpp u Ollama si se convierte el modelo a un formato compatible (no se distribuye GGUF en el repositorio, por lo que requeriria conversion manual).
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera una latencia baja y un throughput alto, especialmente en GPU y en procesamiento por lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-swc-fr | 75,5 M | swc → fr | no disponible | no disponible (heredada del upstream, tipicamente CC-BY 4.0) | Hugging Face, safetensors |
| Helsinki-NLP/opus-mt-swc-fr | no disponible (mismo modelo base) | swc → fr | no disponible | CC-BY 4.0 (segun model card upstream) | Hugging Face |
| NLLB-200 distilled 600M | ~600 M | Multilingue (200 idiomas) | no disponible | CC-BY-NC 4.0 | Hugging Face |
| M2M-100 418M | ~418 M | Multilingue (100 idiomas) | no disponible | MIT | Hugging Face |

Notas sobre la comparativa: el modelo de este repositorio es funcionalmente equivalente a `Helsinki-NLP/opus-mt-swc-fr`, del que solo se diferencia por el reempaquetado y la conversion del tokenizador. Las alternativas multilingues (NLLB-200 y M2M-100) cubren muchos mas pares de idiomas, pero son entre 5 y 8 veces mas grandes y su cobertura concreta del codigo `swc` debe verificarse antes de usarlas como sustituto. La licencia de NLLB-200 (CC-BY-NC 4.0) restringe el uso comercial, mientras que M2M-100 usa licencia MIT. No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El campo de licencia del repositorio aparece como no disponible. La model card remite a la licencia del modelo upstream, habitualmente CC-BY 4.0 para OPUS-MT, pero conviene confirmarlo antes de cualquier uso comercial o redistribucion.
- No se garantiza la titularidad: el autor declara explicitamente que solo reempaqueta los pesos y no reclama la propiedad del modelo entrenado.
- Traduccion unidireccional: solo cubre swc → fr. No permite la direccion inversa ni otros pares de idiomas.
- Riesgo de alucinacion y de traducciones incorrectas, especialmente en terminologia especializada, nombres propios o expresiones idiomaticas del suajili del Congo, dado que se trata de un par de bajos recursos.
- Posibles sesgos heredados del corpus de entrenamiento original de OPUS-MT, que no esta documentado en este repositorio.
- Longitud de contexto no documentada: los modelos Marian de OPUS-MT suelen procesar segmentos de frase o parrafos cortos, por lo que textos muy largos deberian dividirse manualmente.
- Ausencia de datos de evaluacion: no hay BLEU, chrF ni COMET publicados, lo que dificulta estimar la calidad real de la traduccion.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- No se distribuyen variantes cuantizadas ni formatos GGUF, por lo que el despliegue en segun que runtimes requiere conversion manual.
- Sin soporte declarado de tool calling, agentes, vision o audio: es exclusivamente un modelo de traduccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-swc-fr
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-swc-fr
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.21/
- Paper de Marian NMT (Junczys-Dowmunt et al., 2018): https://arxiv.org/abs/1804.00344
- Repositorio de Candle: https://github.com/huggingface/candle
- Documentacion de transformers: https://huggingface.co/docs/transformers
