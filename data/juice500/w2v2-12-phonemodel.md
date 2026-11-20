# juice500/w2v2-12-phonemodel

## Resumen

w2v2-12-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de wav2vec 2.0-large (facebook/wav2vec2-large-lv60). Lo desarrolla juice500 y forma parte del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en SLT 2026. El modelo no genera texto libre ni transcripciones ortográficas: su salida es una secuencia de segmentos temporales etiquetados con fonemas, lo que lo convierte en una herramienta especializada para análisis fonético y fonológico.

La innovación central es SPAM: en lugar de entrenar una cabeza de clasificación directamente sobre las activaciones del encoder, el método proyecta cada frame del modelo auto-supervisado a un vector de 43 activaciones de rasgos fonológicos (voicing, nasalidad, stridencia, silabicidad, etc.) en el rango [0, 1]. Esa representación intermedia, interpretable y compartida entre lenguas, alimenta dos cabezas: una de segmentación y otra de reconocimiento. Este checkpoint corresponde a un punto concreto de la rejilla encoder × capa del paper (wav2vec 2.0-large, capa 12, audio a 16 kHz); el propio autor remite a wavlm-24-phonemodel como el mejor modelo de la familia.

Es relevante porque demuestra que un encoder congelado, sin fine-tuning, puede sostener tareas fonéticas de forma competitiva y con una capa intermedia legible por humanos, abaratando el entrenamiento y facilitando la auditoría. La licencia MIT y el paquete `phonespam` en PyPI simplifican su integración, aunque la adopción actual es prácticamente nula (0 descargas, 0 likes en el momento de la consulta) y el modelo es de investigación, no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0-large congelado (encoder transformer) + cabezas SPAM de segmentación y reconocimiento sobre activaciones fonológicas |
| Parametros totales | no disponible (el repo pesa 0.0 GB, lo que sugiere pesos del adaptador; el encoder base wav2vec 2.0-large ronda los 300 M, dato no confirmado en la información) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; opera por frames sobre la señal de entrada, sin ventana de tokens declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a inventarios de otras lenguas vía `vocab_for_language` y PHOIBLE |
| Licencia | MIT (PHOIBLE 2.0 se descarga en tiempo de ejecución y es CC BY-SA 3.0, licenciado aparte) |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga con `PhoneModel.from_pretrained` de la librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo es un adaptador sobre facebook/wav2vec2-large-lv60, un encoder auto-supervisado de tipo transformer para habla. La señal se procesa a 16 kHz y se extraen las representaciones de la capa 12; esas representaciones permanecen congeladas y no se ajustan durante el entrenamiento del adaptador. Sobre ellas se aplica SPAM (S3M-based Phonological Activation Mapping), que mapea cada frame a 43 activaciones de rasgos fonológicos en [0, 1] con nombres accesibles mediante `spam.featnames` (por ejemplo "silence+", "syl+", "son+"). Dos cabezas leen de esa misma representación: una produce fronteras de segmento y la otra asigna etiquetas de fonema.

El entrenamiento se realizó sobre el dataset timit-asr/timit_asr, según los metadatos del modelo. La model card no detalla el número de tokens, la composición exacta del corpus ni si hubo etapas de alineamiento forzado, destilación o ajuste con RLHF/DPO; esa información no está disponible. La innovación técnica destacable es precisamente la capa intermedia interpretable: al no depender de un clasificador opaco sobre el encoder, el método permite inspeccionar qué rasgos fonológicos activa cada frame y restringir el vocabulario de salida a un inventario fonológico concreto mediante `vocab_for_language`, lo que facilita el análisis contrastivo entre lenguas.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con tiempos de inicio y fin en segundos mediante `model.transcribe`.
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético, no con texto ortográfico.
- Representación fonológica interpretable: expone 43 activaciones de rasgos (voicing, nasalidad, stridencia, silabicidad, etc.) por frame.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita la salida a un inventario PHOIBLE, lo que permite usar el modelo fuera del inglés aunque el entrenamiento declarado sea en inglés.
- Procesamiento de audio a 16 kHz con inferencia en CPU o GPU (`device="cuda"`).
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio generativo: es un modelo discriminativo de fonética.
- Capacidades multilingües limitadas y dependientes de PHOIBLE; el idioma declarado es únicamente inglés.

## Casos de uso

- Análisis fonético de corpus de habla: el modelo segmenta y etiqueta fonemas en grabaciones de TIMIT o similares, lo que permite extraer inventarios y duraciones por fonema para estudios de fonética experimental sin anotación manual.
- Investigación en fonología contrastiva: usando `vocab_for_language` con inventarios PHOIBLE de distintas lenguas, se puede comparar qué rasgos activa el encoder en cada idioma y detectar desajustes entre la representación y el inventario teórico.
- Auditoría de modelos auto-supervisados de habla: al exponer las 43 activaciones por frame, sirve para inspeccionar qué información fonológica captura la capa 12 de wav2vec 2.0-large, útil en trabajos de interpretabilidad.
- Preanotación para pipelines de ASR: los segmentos fonéticos con tiempos pueden usarse como alineamiento inicial que luego se corrige manualmente, reduciendo el coste de anotación en corpus pequeños.
- Docencia y demostraciones: el demo en Streamlit permite ilustrar en clase cómo un encoder congelado se traduce en rasgos fonológicos legibles, sin necesidad de infraestructura propia.
- Prototipado de sistemas de pronunciación: la salida por fonemas y sus fronteras temporales sirve para construir herramientas de evaluación de pronunciación o de análisis de acento en inglés.
- Experimentos de comparación encoder × capa: al ser un punto de la rejilla del paper, se usa junto a otros checkpoints de la familia para estudiar el efecto de la profundidad y del encoder (wav2vec 2.0 frente a WavLM) en la calidad de la segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un adaptador sobre un encoder wav2vec 2.0-large congelado, la huella debería ser moderada, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. El uso documentado admite `device="cuda"`, sin especificar modelos de GPU.
- Cabe en GPU de consumo: no confirmado; el repo de 0.0 GB y el encoder base sugieren que sí, pero es una inferencia no verificada.
- Opciones de despliegue: paquete `phonespam` (PyPI) con `PhoneModel.from_pretrained`; demo en Streamlit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable en un modelo de audio y no de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Encoder base | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/w2v2-12-phonemodel | wav2vec 2.0-large | 12 | Segmentación y reconocimiento fonético vía SPAM | MIT | Hugging Face, 0 descargas |
| juice500/wavlm-24-phonemodel | WavLM (large) | 24 | Igual, señalado por el autor como el mejor de la familia | no disponible en la información | Hugging Face |
| Otros checkpoints de la rejilla encoder × capa del paper SPAM | wav2vec 2.0 / WavLM en distintas capas | variables | Igual | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de investigación con adopción nula en el momento de la consulta (0 descargas, 0 likes); no hay evidencia de uso en producción.
- El autor indica explícitamente que este checkpoint no es el mejor de la familia y remite a wavlm-24-phonemodel; usarlo como referencia de calidad sería un error.
- Idioma de entrenamiento declarado únicamente inglés; el uso con otras lenguas depende de restricciones de vocabulario PHOIBLE y no está validado.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto libre), pero sí puede producir segmentaciones y etiquetas fonéticas incorrectas en audio ruidoso, con acentos no vistos o fuera de dominio.
- La licencia MIT cubre el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que es CC BY-SA 3.0 y se licencia por separado; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye.
- No se documentan sesgos demográficos ni de acento; al entrenarse sobre TIMIT, es probable que herede las limitaciones de diversidad de ese corpus, aunque no hay análisis publicado en la información disponible.
- Ausencia de datos sobre cuantización, formatos de pesos y requisitos de hardware dificulta planificar el despliegue.
- No apto para transcripción ortográfica ni para tareas de texto, tool calling o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/w2v2-12-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
