# Sawfwair/SOV-Transcribe-1-mere-run-q8

## Resumen

SOV-Transcribe-1-mere-run-q8 es una conversión portable del modelo de reconocimiento automático del habla (ASR) SOV-Transcribe-1 de Salesforce Sovereign Intelligence, empaquetada por Sawfwair para su uso nativo en Apple Silicon a través del runtime mere.run. El modelo original combina un encoder de audio basado en Whisper (OpenAI) con un decodificador derivado de Gemma 4 (Google DeepMind), y esta versión Q8 conserva esa arquitectura híbrida mientras adapta los pesos a un formato propietario que no depende de Python ni del código upstream de Transformers o mlx-lm.

El bundle incluye el encoder y proyector de audio, el tokenizer y configuración, el decodificador objetivo empaquetado y un checkpoint DFlash opcional en el directorio `draft/`, lo que permite decodificación especulativa para acelerar la inferencia. Con 659.316.736 parámetros totales y un repositorio de 31,3 GB, está pensado para transcripción de ficheros en siete idiomas (inglés, francés, alemán, español, italiano, portugués y neerlandés) con soporte de prompts de instrucción y contexto.

Su relevancia radica en que ofrece una vía de despliegue local, sin dependencias de Python, para un modelo ASR multilingüe sobre hardware Apple, con cuantización selectiva Q8 en las matrices de expertos y verificación criptográfica de los pesos publicados. No obstante, se trata de una conversión de terceros no respaldada oficialmente por Salesforce, y la precisión multilingüe amplia permanece sin cualificar según la propia documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder de audio tipo Whisper + decodificador tipo Gemma 4 con mezcla de expertos (MoE) en las matrices de expertos |
| Parametros totales | 659.316.736 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso fija `--max-tokens 8192` para la transcripción) |
| Tipos de cuantizacion | Q8 affine con group-64, aplicada solo a las matrices de expertos MoE; routers FP32 y parámetros no expertos conservan el dtype upstream; encoder/proyector y DFlash sin cambios |
| Idiomas soportados | en, fr, de, es, it, pt, nl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetados en formato nativo mere.run (no compatible con Transformers ni mlx-lm genéricos) |

## Arquitectura y entrenamiento

El modelo original SOV-Transcribe-1, del que esta conversión deriva, es un sistema ASR que combina un encoder de audio inspirado en Whisper de OpenAI con un decodificador basado en Gemma 4 de Google DeepMind. La presencia de routers FP32 y matrices de expertos en el decodificador indica una arquitectura de mezcla de expertos (MoE) en la que solo las matrices de expertos se cuantizan a Q8, mientras que el resto de parámetros conservan su precisión original. El bundle incluye además un checkpoint DFlash opcional que actúa como modelo borrador para decodificación especulativa.

La conversión realizada por Sawfwair aplica cuantización afín Q8 con grupos de 64 únicamente a las matrices de expertos MoE, fusiona los pesos gate/up de los expertos y remapea los nombres de parámetros al esquema nativo de mere.run. Los bytes de tensor del encoder, proyector y DFlash se mantienen intactos respecto al original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Transcripción de voz a texto en siete idiomas: inglés, francés, alemán, español, italiano, portugués y neerlandés.
- Procesamiento de ficheros de audio completos (no streaming) con salida de transcripción en texto.
- Soporte de prompts de instrucción y contexto para guiar la transcripción.
- Decodificación especulativa mediante el checkpoint DFlash opcional, que acelera la generación al proponer tokens que el modelo objetivo valida.
- Ejecución local nativa en Apple Silicon sin Python ni código upstream, con ruta Metal Q8 y reducción distribuida de expertos en el M5 Max cualificado.
- Verificación de integridad al arranque mediante hashes de configuración, tamaños y cabeceras de shards y comprobación de completitud de tensores.
- No proporciona streaming, marcas de tiempo por palabra ni traducción a través de este runtime.

## Casos de uso

- Transcripción de reuniones y entrevistas en local: el modelo procesa ficheros de audio completos en siete idiomas sobre un Mac con Apple Silicon, sin enviar datos a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de contenido audiovisual multilingüe: permite generar transcripciones en español, francés, alemán, italiano, portugués, neerlandés e inglés para posterior post-proceso de subtítulos, aunque sin marcas de tiempo por palabra habría que alinearlas aparte.
- Dictado y notas de voz en aplicaciones de escritorio macOS: al ejecutarse de forma nativa en Apple Silicon y sin Python, puede integrarse en herramientas de productividad que transcriban grabaciones bajo demanda.
- Archivística y documentación: transcripción por lotes de grabaciones históricas o periodísticas con prompts de contexto que ayuden a preservar terminología específica del dominio.
- Investigación en ASR: sirve como banco de pruebas para evaluar decodificación especulativa con DFlash y cuantización Q8 selectiva en hardware Apple, comparando aceptación de tokens y latencia frente a la ruta de caché nativa.
- Asistentes de voz para atención al cliente en despliegues on-premise: la transcripción local de llamadas permite alimentar pipelines internos sin exponer audio a terceros, con la cautela de que la precisión multilingüe amplia no está cualificada.
- Accesibilidad: generación de transcripciones de material hablado para personas con discapacidad auditiva en entornos donde no se desea depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La documentación del autor menciona informes de cualificación que registran paridad de bytes Q8, memoria de arranque, comparaciones exactas de aceptación de tokens/DFlash y mediciones de latencia específicas por dispositivo, pero no se proporcionan cifras concretas de precisión ASR (WER) ni de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 31,3 GB; el despliegue cualificado se realizó en un Apple M5 Max con 128 GiB de memoria unificada.
- Hardware cualificado: Apple Silicon con GPU Metal; el M5 Max con 128 GiB es el único dispositivo declarado como cualificado, incluyendo la selección de reducción distribuida de expertos.
- Capacidades superiores a los 128 GiB del M5 Max probado no han sido cualificadas según el autor.
- No está pensado para GPU NVIDIA (A100, H100, RTX 4090): el formato es nativo de mere.run y requiere el loader de la revisión concreta del runtime.
- Despliegue: exclusivamente mediante mere.run (comando `mere.run speech transcribe`) con la revisión fijada del repositorio; no es compatible con vLLM, llama.cpp, Ollama, TGI, Transformers ni mlx-lm genéricos.
- Latencia y throughput: no disponibles como cifras; el autor advierte que las mediciones de tiempo son diagnósticas y no establecen una mejora de velocidad de arranque.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| SOV-Transcribe-1-mere-run-q8 (esta ficha) | 659.316.736 | no disponible | 7 | Apache 2.0 | mere.run nativo, Apple Silicon |
| SOV-Transcribe-1 (Salesforce, base) | no disponible | no disponible | no disponible | Apache 2.0 (según modelo derivado) | Pesos upstream, ecosistema estándar |
| Whisper (OpenAI) | no disponible | no disponible | multilingüe | MIT (según versión) | Transformers, whisper.cpp, etc. |
| Gemma 4 (Google DeepMind) | no disponible | no disponible | multilingüe | no disponible | Ecosistema estándar |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a aspectos de licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Conversión de terceros no respaldada por Salesforce: el autor indica explícitamente que esta conversión de Sawfwair no es una release endorsada por el upstream.
- La cuantización Q8 puede alterar el reconocimiento respecto al modelo BF16 original; las afirmaciones de paridad exacta se refieren únicamente a esta representación Q8 y a sus rutas de ejecución cualificadas.
- La precisión multilingüe amplia permanece sin cualificar según la documentación del autor.
- No soporta streaming, marcas de tiempo por palabra ni traducción a través de este runtime.
- Dependencia estricta de una revisión concreta de mere.run: el bundle requiere el loader de la revisión indicada y no funciona con Transformers ni con cargadores mlx-lm genéricos.
- La verificación de integridad al arranque comprueba hashes de configuración, tamaños y cabeceras, pero no relee ni rehashea todo el payload en cada lanzamiento.
- Solo se ha cualificado en un M5 Max de 128 GiB; hardware superior no está validado.
- Las mejoras de benchmark son dependientes de la carga de trabajo y del hardware, y las mediciones de tiempo publicadas son diagnósticas, no concluyentes sobre velocidad de arranque.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al tratarse de un sistema ASR, los errores se manifestarían como transcripciones incorrectas, especialmente en audio con ruido o acentos no representados en el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse los avisos de atribución a Salesforce Sovereign Intelligence, Google DeepMind (Gemma 4) y OpenAI (Whisper) incluidos en `LICENSE` y `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sawfwair/SOV-Transcribe-1-mere-run-q8
- Modelo base: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1
- Repositorio mere.run: https://github.com/sawfwair/mere-run
- Revisión del runtime requerida: https://github.com/sawfwair/mere-run/commit/6385b49f5bd5bd021ff5de3fc68b719fe0d8ac7d
- Informes de cualificación: https://github.com/sawfwair/mere-run/tree/6385b49f5bd5bd021ff5de3fc68b719fe0d8ac7d/docs/qualification
