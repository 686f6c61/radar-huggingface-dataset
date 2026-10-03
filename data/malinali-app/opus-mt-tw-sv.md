# malinali-app/opus-mt-tw-sv

## Resumen

`malinali-app/opus-mt-tw-sv` es un paquete de traduccion automatica neuronal para inferencia en dispositivo (on-device), publicado por malinali-app dentro del ecosistema Malinali (https://malinali.app). El modelo traduce del twi (codigo `tw`) al sueco (codigo `sv`) y no es un entrenamiento original: se trata de un reempaquetado de los pesos de `Helsinki-NLP/opus-mt-tw-sv`, la familia OPUS-MT desarrollada por el grupo Helsinki-NLP (Universidad de Helsinki) sobre la arquitectura Marian.

El problema que resuelve es doble. Por un lado, cubre un par linguistico de bajos recursos (twi, una lengua akan hablada en Ghana, hacia sueco) para el que existen pocos sistemas publicos de traduccion. Por otro, adapta esos pesos al ecosistema Candle mediante la libreria `marian_flutter`, de modo que la traduccion pueda ejecutarse localmente en dispositivos sin depender de una API en la nube.

El modelo tiene 75.207.317 parametros (aproximadamente 75 millones), un tamano tipico de la familia OPUS-MT, con un repositorio de 0,3 GB en formato safetensors. La model card indica explicitamente que Malinali solo reempaqueta pesos y convierte los tokenizadores SentencePiece a formato JSON de tokenizador rapido de Hugging Face, sin reclamar la propiedad del modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, seq2seq) |
| Parametros totales | 75.207.317 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repositorio no documenta cuantizaciones) |
| Idiomas soportados | tw (twi), sv (sueco) |
| Licencia | no disponible en la ficha de HuggingFace; la model card remite a la licencia del modelo upstream, que suele ser CC-BY 4.0 para OPUS-MT |
| Formato de pesos | safetensors (con tokenizadores JSON: `tokenizer-enc.json` y `tokenizer-dec.json`) |

## Arquitectura y entrenamiento

La arquitectura es Marian, una red neuronal secuencial transformer encoder-decoder desarrollada por el equipo de Helsinki-NLP y usada de forma masiva en la coleccion OPUS-MT. Los modelos OPUS-MT se entrenan sobre corpus paralelos extraidos del ecosistema OPUS y estan optimizados para tareas de traduccion, no para generacion abierta. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; para esos detalles hay que remitirse al modelo base `Helsinki-NLP/opus-mt-tw-sv`.

La aportacion especifica de este repositorio no es el entrenamiento sino el empaquetado. Malinali convierte los tokenizadores SentencePiece originales a tokens JSON compatibles con Hugging Face y publica los pesos en safetensors para su uso con Candle a traves de `marian_flutter`, un runtime orientado a Flutter y a ejecucion on-device. Esto permite desplegar el traductor en aplicaciones moviles o de escritorio sin backend. El repositorio incluye `config.json` (configuracion Marian), `model.safetensors` (pesos), `tokenizer-enc.json` (tokenizador de origen) y `tokenizer-dec.json` (tokenizador de destino).

## Capacidades

- Traduccion automatica unidireccional de twi (`tw`) a sueco (`sv`).
- Generacion de texto secuencia a secuencia mediante pipeline `translation` de la libreria transformers.
- Ejecucion on-device compatible con Candle mediante `marian_flutter`.
- Uso con tokenizadores rapidos en formato JSON, lo que habilita integracion con tooling de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Cobertura multilingue limitada al par tw-sv; no es un modelo multilingue generalista.

## Casos de uso

- Traduccion de contenidos para comunidades ghanesas en Suecia: traduccion de avisos, formularios o comunicaciones administrativas del twi al sueco para servicios publicos y ONG que atienden a poblacion akanofona.
- Aplicaciones moviles de traduccion offline: integrado con Candle y `marian_flutter`, el modelo puede embeberse en una app Flutter para traducir sin conexion, util en zonas con conectividad limitada.
- Procesamiento por lotes de corpus paralelos: uso del pipeline `translation` de transformers para traducir grandes volumenes de texto twi a sueco en tareas de investigacion linguistica o construccion de corpus.
- Subtitulado y localizacion de contenido audiovisual: traduccion de guiones o subtitulos en twi al sueco antes de una revision humana.
- Traduccion asistida para trabajo de campo: apoyo a linguistas y trabajadores humanitarios que documentan materiales en twi y necesitan una version en sueco.
- Preprocesamiento en pipelines de NLP multilingue: generacion de traducciones intermedias en sueco para despues aplicar modelos de analisis (clasificacion, resumen) que tengan mejor cobertura en sueco que en twi.
- Traduccion ligera en el borde (edge computing): al tener unos 75 millones de parametros, puede ejecutarse en CPU en dispositivos modestos, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas BLEU, chrF ni evaluaciones comparativas, y tampoco se aportan datos de rendimiento del modelo base en esta ficha.

## Requisitos de hardware

- VRAM estimada: en fp32 los 75,2 millones de parametros ocupan aproximadamente 300 MB; en fp16 alrededor de 150 MB; en int8 cerca de 75 MB. A esto hay que sumar el espacio de activaciones y del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. No requiere A100, H100 ni tarjetas de gama alta.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (serie RTX 30/40, GTX 16, e incluso iGPU recientes) y tambien en CPU.
- Opciones de despliegue: transformers (pipeline de traduccion), Candle mediante `marian_flutter` (ruta principal para on-device), y herramientas compatibles con modelos Marian como CTranslate2 o exportacion a ONNX. No se documenta soporte nativo en llama.cpp, Ollama o vLLM en la informacion proporcionada.
- Latencia y throughput: no disponibles. Al ser un modelo de 75 millones de parametros, cabe esperar latencias de milisegundos por frase en hardware moderno, pero no se aportan cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-tw-sv | 75,2 M | no disponible | tw → sv | no disponible (upstream tipicamente CC-BY 4.0) | HuggingFace, empaquetado para Candle |
| Helsinki-NLP/opus-mt-tw-sv | no disponible (mismo origen) | no disponible | tw → sv | segun model card upstream | HuggingFace |
| Otros modelos OPUS-MT (por ejemplo, pares hacia/desde sueco) | ~75 M en la mayoria de variantes | no disponible | pares especificos | CC-BY 4.0 (habitual) | HuggingFace |

La comparativa con alternativas de la misma categoria se limita a otros modelos OPUS-MT, ya que no se han proporcionado datos de otros sistemas de traduccion tw-sv en la informacion disponible.

## Limitaciones y advertencias

- Idiomas de bajos recursos: el twi dispone de menos corpus paralelos que lenguas mayoritarias, por lo que la calidad de traduccion puede ser inferior a la de pares como en-de o en-es.
- Riesgo de alucinacion y de traducciones incorrectas: como cualquier modelo neuronal de traduccion, puede producir salidas fluidas pero erroneas, especialmente con terminologia especializada o frases largas.
- Direccion unica: el modelo solo traduce de tw a sv; no soporta la direccion inversa.
- Longitud de contexto no documentada: no se especifica el limite de tokens de entrada, lo que obliga a validar empiricamente el comportamiento con textos largos.
- Licencia no confirmada en la ficha: la licencia del repositorio figura como no disponible y la model card remite a la del modelo upstream. Antes de un uso comercial es imprescindible verificar la licencia efectiva de `Helsinki-NLP/opus-mt-tw-sv`.
- Procedencia: es un reempaquetado, no un modelo entrenado por malinali-app; los meritos de calidad corresponden a Helsinki-NLP.
- Sin benchmarks publicos: no hay metricas verificables de calidad para este par linguistico en la informacion disponible.
- Advertencia de seguridad: la model card original esta marcada como contenido de referencia; no debe interpretarse como instrucciones ejecutables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-tw-sv
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tw-sv
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
