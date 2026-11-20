# juice500/w2v2-6-phonemodel

## Resumen

w2v2-6-phonemodel es un modelo de segmentación y reconocimiento fonético construido sobre representaciones congeladas del encoder auto-supervisado facebook/wav2vec2-large-lv60 (wav2vec 2.0-large). Lo desarrolla juice500 como parte del trabajo SPAM (S3M-based Phonological Activation Mapping), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo resuelve un problema concreto: convertir la representación opaca de un encoder auto-supervisado de voz en un vector interpretable de activaciones fonológicas (sonoridad, nasalidad, estridencia, entre otras), a partir del cual se realizan la segmentación y el reconocimiento de fonemas.

Este checkpoint concreto corresponde a un único punto de la rejilla encoder × capa del paper: usa la capa 6 del encoder wav2vec 2.0-large con entrada a 16 kHz. El propio autor indica que no es el mejor modelo de la familia y remite a juice500/wavlm-24-phonemodel como la variante de referencia. Se distribuye con la librería `phonespam`, que expone una API de alto nivel (`PhoneModel.from_pretrained`, `transcribe`, `spam`) y devuelve segmentos contiguos con etiqueta fonética y marcas temporales en segundos.

Es relevante para investigadores en fonética computacional y lingüística que necesitan alineamiento fonético interpretable sin entrenar un sistema desde cero, y para desarrolladores que quieran inspeccionar las activaciones fonológicas intermedias de un S3M. El modelo está entrenado y evaluado sobre TIMIT (timit-asr/timit_asr) y declara únicamente inglés como idioma, aunque la API permite restringir el vocabulario de reconocimiento al inventario PHOIBLE de otras lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre encoder wav2vec 2.0-large congelado (transformer auto-supervisado), con cabezas de segmentación y reconocimiento sobre activaciones fonológicas SPAM |
| Parametros totales | no disponible (el encoder base wav2vec 2.0-large tiene ~317 M; el adaptador no declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada del encoder a 16 kHz; longitud exacta no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); reconocimiento restringible a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga mediante la librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo no entrena el encoder: parte de facebook/wav2vec2-large-lv60 congelado y opera sobre sus features. La innovación es SPAM (S3M-based Phonological Activation Mapping), que proyecta cada frame del S3M a un vector de 43 activaciones fonológicas en el rango [0, 1] —con nombres como `silence+`, `syl+`, `son+`— que actúan como representación intermedia interpretable. Sobre esa representación leen dos cabezas: una de segmentación (fronteras entre fonemas) y otra de reconocimiento (etiqueta fonética). Este checkpoint usa específicamente la salida de la capa 6 del encoder; el paper explora la rejilla completa encoder × capa para determinar qué combinaciones son más informativas.

El entrenamiento se realizó sobre el corpus TIMIT (timit-asr/timit_asr), un dataset clásico de habla inglesa con transcripción fonética a nivel de fonema y marcas de frontera. La información disponible no detalla el número de tokens de audio, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO (poco probables en una tarea de etiquetado fonético supervisado). Tampoco se especifican técnicas de decodificación especulativa ni mecanismos de atención lineal; el pipeline se limita a la extracción de features del encoder congelado y la inferencia de las cabezas sobre SPAM.

## Capacidades

- Segmentación fonética: devuelve fronteras temporales entre fonemas con marcas de inicio y fin en segundos.
- Reconocimiento fonético: asigna una etiqueta fonética a cada segmento detectado.
- Representación fonológica interpretable: expone un tensor de (frames, 43) activaciones fonológicas en [0, 1] con nombres de feature accesibles (`spam.featnames`).
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita el reconocimiento al inventario PHOIBLE de la lengua indicada.
- Procesamiento de audio a 16 kHz.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo especializado de etiquetado acústico, no un LLM.
- No soporta visión, audio generativo ni modo thinking.

## Casos de uso

- Análisis fonético de corpus: procesar grabaciones de habla inglesa con TIMIT u otros corpus para obtener alineamientos fonéticos automáticos y estudiar fenómenos de coarticulación o reducción vocálica a partir de las fronteras detectadas.
- Investigación en interpretabilidad de S3M: usar `model.spam("utt.wav")` para inspeccionar qué features fonológicas activa cada capa del encoder wav2vec 2.0, útil para comparar capas 6 frente a capas superiores en estudios de representación.
- Docencia en fonética y fonología: generar transcripciones fonéticas alineadas temporalmente para materiales didácticos y ejercicios de transcripción asistida.
- Validación cruzada de inventarios fonológicos: emplear `vocab_for_language` con inventarios PHOIBLE para comprobar si un sistema reconoce fonemas presentes en lenguas distintas del inglés, como paso previo a adaptaciones multilingües.
- Preprocesado para pipelines de síntesis de voz: obtener segmentos fonéticos con tiempos para alinear corpus de entrenamiento de TTS o para construir diccionarios de pronunciación con marcas temporales.
- Análisis de habla patológica o no nativa: cuantificar la tasa de acierto del reconocimiento sobre hablantes fuera de dominio para estudiar desviaciones fonéticas sistemáticas, siempre como herramienta exploratoria dado el dominio limitado de TIMIT.
- Prototipado rápido en Python: integrar el modelo vía `pip install phonespam` en notebooks de investigación sin necesidad de infraestructura de GPU dedicada, ya que el encoder congelado se puede ejecutar en CPU para audios cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de phone error rate (PER), boundary F1 ni comparaciones numéricas con otros sistemas; únicamente remite al paper (arXiv:2607.09020) para los resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El encoder base wav2vec 2.0-large (~317 M parámetros) ocupa aproximadamente 1,2-1,3 GB en fp32 y en torno a 0,6-0,7 GB en fp16; a ello se suma el adaptador, de tamaño no declarado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; una RTX 3060, RTX 4090, A100 o H100 son sobradas para este modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas (GTX 1660 en adelante), y también en CPU para audios de duración moderada.
- Opciones de despliegue: la vía oficial es la librería `phonespam` (`PhoneModel.from_pretrained`), con soporte de `device="cuda"`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/w2v2-6-phonemodel | wav2vec 2.0-large | 6 | Segmentación y reconocimiento fonético | MIT | Hugging Face |
| juice500/wavlm-24-phonemodel | WavLM (según nombre, capa 24) | 24 | Segmentación y reconocimiento fonético | no disponible | Hugging Face; el autor lo señala como el mejor modelo de la familia |
| facebook/wav2vec2-large-lv60 | wav2vec 2.0-large | — | Representación auto-supervisada de voz (no etiqueta fonemas por sí solo) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado (PER, F1 de fronteras) entre estas variantes en la información proporcionada, por lo que la comparación se limita a la configuración arquitectónica y la disponibilidad.

## Limitaciones y advertencias

- Dominio limitado: entrenado sobre TIMIT, un corpus de habla inglesa leída en condiciones controladas; el rendimiento en habla espontánea, ruidosa o con acento marcado no está documentado y previsiblemente será inferior.
- Idioma: declarado únicamente para inglés. El uso de `vocab_for_language` con inventarios PHOIBLE de otras lenguas restringe el vocabulario de salida, pero no implica que el modelo haya sido entrenado en esas lenguas.
- No es el mejor checkpoint de la familia: el autor recomienda explícitamente wavlm-24-phonemodel para uso de referencia; este modelo representa un punto intermedio de la rejilla experimental.
- Riesgo de alucinación en sentido amplio: como todo sistema de etiquetado acústico, puede asignar fonemas incorrectos en segmentos ambiguos o de silencio; las fronteras temporales no deben tratarse como verdad de referencia sin validación manual.
- Sesgos: no documentados en la model card; cabe esperar sesgos derivados de la distribución de hablantes de TIMIT (predominantemente adultos, inglés americano).
- Licencia: MIT para el modelo y el código, lo que permite uso comercial. Sin embargo, `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye ese recurso.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con un tamaño de repo de 0.0 GB, lo que sugiere un artefacto experimental de investigación más que un modelo listo para producción.
- Sin soporte de cuantización documentado: no hay indicaciones sobre GGUF, ONNX ni otras conversiones para despliegue ligero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/w2v2-6-phonemodel
- Modelo de referencia de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Encoder base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Paper (SLT 2026): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
