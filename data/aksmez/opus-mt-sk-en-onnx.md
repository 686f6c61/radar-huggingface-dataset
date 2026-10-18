# aksmez/opus-mt-sk-en-ONNX

## Resumen

`aksmez/opus-mt-sk-en-ONNX` es una conversión al formato ONNX del modelo de traducción automática `Helsinki-NLP/opus-mt-sk-en`, especializado en traducir eslovaco (`sk`) a inglés (`en`). Lo publica el usuario `aksmez` y la conversión se ha generado automáticamente mediante un Space de Hugging Face, sin que se documente un entrenamiento adicional. El resultado está pensado para ejecutarse con Transformers.js y ONNX Runtime en entornos JavaScript, incluido el navegador.

El modelo base pertenece a la familia OPUS-MT de Helsinki-NLP y se describe como `transformer-align`, con preprocesado de normalización y SentencePiece. Es un sistema de traducción supervisada, no un modelo generativo generalista: su tarea principal es la traducción de segmentos de texto entre el par de idiomas indicado. La licencia declarada es Apache-2.0.

Su interés práctico está en poder desplegar traducción eslovaco-inglés en aplicaciones web o Node.js sin depender de una API externa, siempre que se validen el tamaño de los pesos, el runtime y la calidad en el dominio concreto. El repositorio ocupa 4,3 GB e incluye artefactos ONNX; no se detallan el número de parámetros, la longitud de contexto ni las variantes exactas de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian, `transformer-align` (encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; solo se confirma la conversion a ONNX. El tag `base_model:quantized` aparece en los metadatos, pero no se especifica si hay variantes INT8, FP16 u otras |
| Idiomas soportados | eslovaco (`sk`) como origen e ingles (`en`) como destino; no se documentan otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX; no se documentan safetensors ni GGUF |
| Tarea | traduccion automatica `sk` -> `en` |
| Runtime documentado | Transformers.js; al ser ONNX, tambien puede ejecutarse con ONNX Runtime |
| Modelo base | `Helsinki-NLP/opus-mt-sk-en` |
| Tamano del repositorio | 4,3 GB |

## Arquitectura y entrenamiento

El modelo base es un OPUS-MT de Helsinki-NLP identificado como `transformer-align`, con normalizacion y tokenizacion SentencePiece. Está entrenado sobre el corpus OPUS para la dirección eslovaco-inglés. La model card del modelo original enlaza los pesos, las traducciones de test y las puntuaciones de evaluación, pero no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La aportación de `aksmez` no es un nuevo entrenamiento, sino un empaquetado en ONNX generado automáticamente mediante el Space `onnx-community/convert-to-onnx`. Por tanto, las capacidades lingüísticas y los posibles sesgos proceden del modelo base; la conversión afecta al formato de ejecución y a la integración con Transformers.js, no a los datos de entrenamiento.

## Capacidades

- Traducción automática de texto en eslovaco a inglés.
- Ejecución en JavaScript mediante Transformers.js, con posibilidad de usar ONNX Runtime en navegador o Node.js.
- Integración en pipelines de procesamiento de texto como paso de traducción previo o posterior a otras tareas.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agentes, razonamiento multi-paso ni planificación.
- No se documentan capacidades de visión, audio, OCR ni modo `thinking`.
- No se documenta detección automática de idioma; se debe proporcionar texto en eslovaco.
- No se documenta traducción bidireccional ni soporte multilingüe adicional.

## Casos de uso

- Localización de sitios web y CMS: el modelo puede traducir cadenas de interfaz, metadatos y contenidos de eslovaco a inglés dentro de un pipeline JavaScript, usando Transformers.js o ONNX Runtime. Es adecuado cuando la dirección fija `sk` -> `en` encaja con el flujo editorial.
- Traducción de documentación técnica interna: se pueden segmentar manuales y notas de eslovaco a inglés y pasar cada segmento por el modelo. Al no documentarse contexto largo, conviene dividir por párrafos y aplicar revisión humana en terminología especializada.
- Atención al cliente: traducción de tickets, correos y reseñas escritas en eslovaco para que equipos de soporte angloparlantes las entiendan. El modelo traduce, pero no gestiona conversaciones ni decide respuestas por sí mismo.
- Investigación en PLN: preprocesamiento de corpus eslovacos para experimentos que necesiten una versión en inglés, especialmente si se busca una ejecución local y reproducible en formato ONNX.
- Traducción en navegador o en el borde: aplicaciones que necesitan privacidad y no quieren enviar texto a un servicio externo pueden cargar el modelo con Transformers.js, siempre que el tamaño del repositorio y el rendimiento del dispositivo sean aceptables.
- Subtítulos y transcripciones: traducción de segmentos cortos de vídeo o audio ya transcritos de eslovaco a inglés. Requiere segmentación, control de sincronización y revisión para evitar omisiones o cambios de sentido.
- Comercio electrónico: traducción de descripciones de producto y opiniones de usuarios eslovacos a inglés para catálogos internacionales. Es útil como primera pasada, con validación en productos regulados o con terminología de marca.

## Benchmarks y rendimiento

Los resultados disponibles corresponden al modelo base OPUS-MT, no a una evaluación independiente de la conversión ONNX.

| Testset | BLEU | chr-F |
|---|---:|---:|
| JW300.sk.en | 42,2 | 0,612 |

No se han publicado en la información disponible resultados de benchmarks especificos para `aksmez/opus-mt-sk-en-ONNX`, ni mediciones de latencia o throughput de esta conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se conoce el número de parámetros ni el tamaño de cada variante ONNX, por lo que no se puede calcular una estimación rigurosa.
- GPU recomendadas: no documentadas. Al ser un modelo ONNX, podría ejecutarse con ONNX Runtime sobre CUDA, TensorRT o WebGPU, pero el autor no publica una lista de GPU validadas.
- GPU de consumo: no confirmado. El repositorio completo ocupa 4,3 GB, pero no se detalla el tamaño de los archivos individuales ni si existe una variante cuantizada apta para GPU de gama media.
- Despliegue documentado: Transformers.js. También es coherente usar ONNX Runtime para aplicaciones fuera del navegador.
- Otras opciones: no se documentan vLLM, TGI, llama.cpp ni Ollama para esta conversión. Al no incluir GGUF, llama.cpp y Ollama no son opciones directas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han verificado en la información proporcionada alternativas de terceros con parámetros y contexto comparables. La comparación directa disponible es con el modelo base del que deriva esta conversión.

| Modelo | Relación | Formato | Dirección | Parámetros | Contexto | Licencia | Benchmark |
|---|---|---|---|---|---|---|---|
| `aksmez/opus-mt-sk-en-ONNX` | conversión ONNX | ONNX | `sk` -> `en` | no disponible | no disponible | Apache-2.0 | no evaluado de forma independiente; hereda BLEU 42,2 / chr-F 0,612 del modelo base |
| `Helsinki-NLP/opus-mt-sk-en` | modelo base | no disponible | `sk` -> `en` | no disponible | no disponible | no disponible en la información | BLEU 42,2 / chr-F 0,612 en JW300.sk.en |
| Otras alternativas OPUS-MT | no verificadas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de traducción unidireccional: solo está documentado para eslovaco a inglés; no se debe asumir que traduce en la dirección inversa ni entre otros idiomas.
- No es un modelo conversacional ni un agente: no se documentan tool calling, razonamiento multi-paso, visión, audio ni instrucciones complejas.
- Longitud de contexto no documentada: para documentos largos será necesario segmentar y comprobar que la traducción mantiene coherencia entre fragmentos.
- Riesgo de alucinación en traducción: puede producir omisiones, adiciones o cambios de sentido, especialmente en textos técnicos, legales, médicos o con terminología de marca. En contenido crítico se recomienda revisión humana.
- Sesgos: no se documentan sesgos específicos. El modelo base se entrena con OPUS y el benchmark usa JW300, por lo que puede estar sesgado hacia el dominio y el estilo de esos corpus.
- Licencia: el derivado declara Apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base y las condiciones de los datos de entrenamiento antes de un despliegue en producción.
- No hay evaluación independiente de la conversión ONNX: los BLEU y chr-F disponibles pertenecen al modelo base. El comportamiento puede variar según la variante ONNX, el runtime y la tokenización usada.
- El repositorio de 4,3 GB puede ser pesado para despliegues en navegador o dispositivos con recursos limitados; hay que medir la descarga y el uso de memoria en el entorno objetivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aksmez/opus-mt-sk-en-ONNX)
- [Modelo base Helsinki-NLP/opus-mt-sk-en](https://huggingface.co/Helsinki-NLP/opus-mt-sk-en)
- [README de OPUS-MT para sk-en](https://github.com/Helsinki-NLP/OPUS-MT-train/blob/master/models/sk-en/README.md)
- [Space de conversión a ONNX](https://huggingface.co/spaces/onnx-community/convert-to-onnx)
- [Documentación del pipeline de traducción de Transformers.js](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TranslationPipeline)
- [Pesos originales opus-2020-01-16.zip](https://object.pouta.csc.fi/OPUS-MT-models/sk-en/opus-2020-01-16.zip)
- [Traducciones del test set](https://object.pouta.csc.fi/OPUS-MT-models/sk-en/opus-2020-01-16.test.txt)
- [Puntuaciones del test set](https://object.pouta.csc.fi/OPUS-MT-models/sk-en/opus-2020-01-16.eval.txt)
