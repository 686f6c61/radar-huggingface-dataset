# oluwagbotty/w2vbert-ky-ft-3ep

## Resumen

w2vbert-ky-ft-3ep es un modelo de reconocimiento automatico del habla (ASR) para kinyarwanda, desarrollado por el usuario oluwagbotty a partir de un ajuste fino sobre badrex/w2v-bert-2.0-kinyarwanda-asr. El modelo parte de la arquitectura w2v-BERT 2.0, un transformer convolucional-auto-supervisado de Meta con una cabeza CTC, y se ha especializado en habla no estandar, concretamente en personas jovenes adultas con tartamudez. El resultado es un sistema CTC de aproximadamente 580 millones de parametros que transcribe audio de 16 kHz mono a texto en minusculas sin puntuacion.

El modelo resuelve un problema concreto: la mayoria de los sistemas ASR estan entrenados con habla fluida y fallan con disfluencias, repeticiones y bloqueos propios de la tartamudez. Al ajustarse sobre el split de entrenamiento del dataset CDLI Rwandan Kinyarwanda non-standard speech v1.0 (11.536 grabaciones, 46 hablantes, 47,7 horas), el modelo mantiene las repeticiones verbatim en lugar de "corregirlas", lo que lo hace util para transcripcion fiel y para investigacion clinica o linguistica.

Es relevante ahora por dos motivos. Primero, porque el kinyarwanda es un idioma de bajos recursos con pocos modelos ASR publicos, y este trabajo documenta un pipeline completo con evaluacion estadistica honesta. Segundo, porque el modelo usa decodificacion CTC en una sola pasada, lo que evita los bucles de repeticion que afectan a los modelos basados en decoder autoregresivo como Whisper en habla disfluente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | w2v-BERT 2.0 (transformer con frontend convolucional) + cabeza CTC |
| Parametros totales | 580.525.920 (aprox. 0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana dependiente de la longitud de la entrada) |
| Tipos de cuantizacion | fp32 nativo; int8 dinamico de las capas lineales documentado por el autor (0,8 GB, +0,5 puntos de WER) |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (via transformers); repo de 58,1 GB con pesos fp32 de 2,3 GB |

## Arquitectura y entrenamiento

El modelo es un w2v-BERT 2.0, una arquitectura que combina un extractor de caracteristicas convolucional con un transformer que se preentrena mediante aprendizaje auto-supervisado (prediccion contrastiva y enmascarada). Sobre esa base se anade una cabeza CTC para clasificacion de frames, lo que permite decodificar la secuencia completa en una sola pasada sin decoder autoregresivo. El modelo base badrex/w2v-bert-2.0-kinyarwanda-asr fue entrenado con aproximadamente 1.000 horas de kinyarwanda y una cabeza CTC.

El ajuste fino se realizo sobre el split de entrenamiento del dataset CDLI de habla no estandar (11.536 grabaciones, 46 hablantes, 47,7 horas, grabadas en Ruanda en 2026 con una app de tablet en interiores con bajo ruido). Se uso AdamW con learning rate 2e-5, schedule lineal con 10% de warm-up, batch efectivo de 16 (2 por GPU, 2 GPUs, 4 pasos de acumulacion) y precision mixta. La configuracion era de 5 epocas con evaluacion cada 250 pasos y parada temprana tras 4 evaluaciones sin mejora; el checkpoint final corresponde al paso 1.250 (epoca 1,7) con un WER de validacion de 41,28%. Los targets se normalizaron a minusculas y al vocabulario del modelo, y se conservaron las repeticiones propias de la tartamudez. No se documento uso de RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en kinyarwanda para audio de 16 kHz mono.
- Manejo de habla disfluente: conserva repeticiones y bloqueos de forma verbatim, sin "limpiar" el texto.
- Decodificacion CTC en una sola pasada, sin bucles de repeticion (0 loops documentados en el test).
- Salida en minusculas, espacios y apostrofos, sin puntuacion ni mayusculas.
- Robustez ante habla leida (text prompts) y descripcion libre de imagenes (picture prompts).
- No soporta tool calling, function calling, agentes, vision ni audio multimodal; es un modelo puramente ASR.
- Capacidad multilingue limitada al kinyarwanda; no se documentan otros idiomas.

## Casos de uso

- Transcripcion clinica de sesiones de logopedia: el modelo conserva las repeticiones y bloqueos, lo que permite a terapeutas analizar patrones de disfluencia sin perder informacion que otros ASR eliminarian.
- Investigacion linguistica sobre kinyarwanda: corpus de habla espontanea y leida con transcripcion verbatim para estudios foneticos y sociolinguisticos en un idioma de bajos recursos.
- Subtitulado y documentacion de contenido en kinyarwanda: transcripcion de entrevistas, testimonios o materiales educativos grabados en condiciones de bajo ruido.
- Accesibilidad para hablantes con tartamudez: dictado y transcripcion de notas de voz en aplicaciones de productividad, aceptando que la salida refleje la disfluencia real.
- Pipeline de evaluacion ASR para habla no estandar: modelo de referencia para comparar otros sistemas en el mismo benchmark CDLI con metricas WER y CER documentadas.
- Despliegue en CPU para prototipos: con cuantizacion int8 dinamico los pesos bajan a 0,8 GB y el modelo puede ejecutarse en portatiles (M1 Pro documentado) con un factor de tiempo real de 0,55-0,65.
- Generacion de datasets etiquetados: transcripcion masiva de grabaciones para construir corpus de habla disfluente en kinyarwanda con anotacion automatica y revision humana posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test del dataset CDLI (1.169 grabaciones, 9 hablantes, decodificacion greedy, normalizacion tipo Whisper con apostrofos eliminados y palabras unidas):

| Modelo | Parametros | WER agrupado (%) | WER por enunciado (%) | CER (%) | Bucles |
|---|---|---|---|---|---|
| Este modelo | 0,6B | 38,7 | 40,6 | 11,7 | 0 |
| Mismo modelo antes del ajuste fino | 0,6B | 46,4 | 51,2 | 14,6 | 0 |
| NeMo Conformer-CTC (ajuste propio) | 0,12B | 39,7 | 41,0 | 13,0 | 0 |
| CDLI Whisper large-v3 (bucles corregidos) | 1,55B | 39,9 | 38,4 | 13,7 | 17 corregidos |
| CDLI Whisper small (bucles corregidos) | 0,24B | 47,6 | 45,2 | 17,5 | 17 corregidos |

El autor reporta que la mejora frente al modelo zero-shot es de -7,7 puntos de WER agrupado (IC 95%: -15,1 a -3,5), frente a Whisper large es de -1,2 (-3,8 a +2,6, practicamente empate) y frente a Whisper small de -8,9 (-11,9 a -4,3). Con puntuacion simple (sin paso de apostrofos): WER 41,2, CER 12,2, WER por enunciado 42,8. Por tipo de prompt: texto leido 40,4, descripcion de imagen 41,4. Por gravedad de la tartamudez (media por hablante, 3 hablantes por grupo): leve 39,4, moderada 40,1, severa 42,2. En validacion (6 hablantes): WER 41,3% con puntuacion simple en el checkpoint elegido.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 2,3-3 GB para los pesos mas activaciones; en int8 dinamico, alrededor de 0,8-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 (RTX 3060, RTX 4060, T4); A100 o H100 no son necesarias pero aceleran el procesamiento por lotes.
- Cabe en GPU de consumo: si, en RTX 3060/4060 y superiores; tambien en GPUs integradas con int8 y suficiente RAM.
- Opciones de despliegue: transformers (Wav2Vec2BertForCTC), vLLM no aplica (no es un modelo generativo), llama.cpp/Ollama no soportan esta arquitectura; TGI no documentado. Despliegue tipico via pipeline de transformers con PyTorch.
- Latencia y throughput: en CPU Apple M1 Pro con fp32, 6,7 s por grabacion de 15 s con 10 hilos (RTF 0,55) y 8,9 s con 2 hilos (RTF 0,65). La cuantizacion int8 solo acelera con muchos hilos. El autor indica que es notablemente mas lento en CPU que el modelo NeMo de 0,12B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | WER test CDLI (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| w2vbert-ky-ft-3ep | 0,6B | audio 16 kHz mono | 38,7 (agrupado) | CC-BY-4.0 | HuggingFace |
| badrex/w2v-bert-2.0-kinyarwanda-asr (base) | 0,6B | audio 16 kHz mono | 46,4 (agrupado) | no disponible | HuggingFace |
| NeMo Conformer-CTC (ajuste del autor) | 0,12B | audio 16 kHz mono | 39,7 (agrupado) | no disponible | no disponible |
| CDLI Whisper large-v3 | 1,55B | audio 16 kHz mono | 39,9 (agrupado, 17 bucles corregidos) | no disponible | no disponible |
| CDLI Whisper small | 0,24B | audio 16 kHz mono | 47,6 (agrupado, 17 bucles corregidos) | no disponible | no disponible |

## Limitaciones y advertencias

- Pocos hablantes en test: solo 9 hablantes (3 leves, 3 moderados, 3 severos). El propio autor advierte que diferencias menores de unos 3 puntos de WER no son concluyentes con esta muestra.
- Salida verbatim: el modelo escribe repeticiones y disfluencias tal cual; no es adecuado si se necesita texto limpio y fluido sin postprocesado.
- Sin puntuacion ni mayusculas: la salida es en minusculas con espacios y apostrofos, lo que limita su uso directo en documentos formales.
- Idioma unico: solo kinyarwanda; no hay soporte multilingue ni cambio de idioma.
- Sesgos no documentados: no se han publicado analisis de sesgos por genero, edad o acento dentro del dataset; los hablantes son mayoritariamente jovenes adultos.
- Riesgo de alucinacion: bajo en CTC (sin decoder generativo), pero puede producir transcripciones incorrectas en audio ruidoso o con hablantes fuera de dominio.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; el dataset CDLI es de acceso restringido (gated) y no se incluye en el repositorio, por lo que la redistribucion de datos no esta cubierta.
- Rendimiento en CPU limitado: mas lento que alternativas mas pequenas como NeMo Conformer-CTC (0,12B); la cuantizacion int8 no siempre acelera.
- Repositorio con nombre enganoso: "3ep" sugiere 3 epocas, pero el checkpoint real es el paso 1.250 (epoca 1,7) de un entrenamiento configurado a 5 epocas con parada temprana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oluwagbotty/w2vbert-ky-ft-3ep
- Modelo base: https://huggingface.co/badrex/w2v-bert-2.0-kinyarwanda-asr
- Dataset CDLI Rwandan Kinyarwanda non-standard speech v1.0: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Centre for Digital Language Inclusion (UCL): no disponible como URL directa en la informacion proporcionada
- Rwanda Innovation Sprint (CDLI): no disponible como URL directa en la informacion proporcionada
