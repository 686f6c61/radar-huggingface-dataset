# baniguru/baniguru_fast_conformer_205m_v1

## Resumen

`baniguru_fast_conformer_205m_v1` es un modelo de reconocimiento automático de voz (ASR) publicado por el usuario baniguru en Hugging Face, orientado específicamente al punyabí y, en particular, al registro religioso y devocional del gurbani. El modelo está implementado sobre NeMo, el framework de NVIDIA para speech, y emplea una arquitectura FastConformer con decoder de tipo RNN-T y CTC. Su nombre indica 205 millones de parámetros, y el repositorio ocupa 0,8 GB, lo que corresponde a pesos en precisión completa junto con vocabulario y configuración.

El problema que aborda es la transcripción de audio punyabí en contextos donde los modelos ASR multilingües generalistas suelen fallar: cantos devocionales (kirtan) y recitación de las escrituras sikhs (sehaj paath). El autor indica que el modelo se ha entrenado intensivamente con estos dos registros, y publica métricas separadas para cada uno de ellos. La relevancia actual reside en que cubre un nicho de baja cobertura —punyabí escrito en alfabeto gurmukhi con vocabulario gurbani— con una licencia MIT permisiva, algo poco habitual en modelos ASR de lenguas minorizadas.

Un detalle técnico importante es que el tokenizador emplea un vocabulario BPE de 2048 unidades construido para cubrir tanto gurbani como punyabí moderno. El propio autor advierte que el punyabí general no está bien cubierto y requeriría fine-tuning adicional con audio convencional, lo que delimita con claridad el dominio de uso previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (NeMo), con decoders RNN-T y CTC |
| Parametros totales | 205 M (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | punyabí (código `pa`), con dominio específico gurbani |
| Licencia | MIT |
| Formato de pesos | pesos NeMo (`.nemo`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La familia FastConformer es una variante optimizada del Conformer para ASR, con reducción de la resolución temporal en las capas iniciales para abaratar el coste de atención sobre secuencias de audio largas. En este caso el modelo se presenta con dos cabezas de decodificación alternativas: RNN-T, que ofrece transcripción en streaming con mejor precisión, y CTC, más simple y con menor coste computacional. La model card publica WER y CER para ambas, lo que permite elegir el compromiso adecuado en producción.

El entrenamiento se realizó con el script `train_punjabi.py` incluido en el repositorio, con soporte de reanudación mediante `--resume`. El autor declara que el modelo se entrenó con una proporción elevada de audio de kirtan y sehaj paath. No se especifica el número de horas de audio, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, decodificación especulativa o RLHF (procedimientos que, en cualquier caso, no son habituales en ASR). El vocabulario de 2048 tokens es el único dato concreto sobre el preprocesamiento textual.

## Capacidades

- Transcripción de voz a texto en punyabí con alfabeto gurmukhi.
- Reconocimiento específico de vocabulario gurbani (terminología de las escrituras sikhs).
- Transcripción de cantos devocionales (kirtan) con métricas publicadas.
- Transcripción de recitación de sehaj paath con métricas publicadas.
- Decodificación dual: RNN-T para mayor precisión y CTC para menor coste.
- Integración nativa con el ecosistema NeMo (transcribe, streaming, evaluación).
- No se declara soporte de tool calling, agentes, visión, audio de entrada multimodal ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de kirtan para archivos comunitarios: dado que el modelo publica WER de 36,16 con RNN-T en este dominio, puede emplearse para generar transcripciones iniciales de grabaciones de cantos devocionales que después se revisan manualmente; es adecuado porque el vocabulario gurbani está incluido en el tokenizador.
- Digitalización de sehaj paath: con WER de 4,35 y CER de 1,50 en RNN-T, el modelo es apto para transcribir recitaciones con relativamente poca corrección posterior, lo que lo convierte en la opción preferente cuando el audio corresponde a este registro.
- Indexación y búsqueda de audio religioso: transcribir un corpus de grabaciones para permitir búsqueda por texto sobre pasajes concretos; la licencia MIT facilita su integración en herramientas internas de templos o comunidades.
- Subtitulado de vídeos devocionales: generar subtítulos en gurmukhi para publicaciones en vídeo, usando la salida RNN-T y revisando los tramos con mayor incertidumbre.
- Investigación lingüística sobre punyabí religioso: obtener transcripciones alineadas para estudiar pronunciación y vocabulario gurbani, aprovechando que el vocabulario de 2048 tokens está adaptado a este léxico.
- Evaluación comparativa de ASR para lenguas minorizadas: servir como línea base reproducible (con licencia MIT) frente a modelos multilingües generalistas en tareas de punyabí devocional.
- Despliegue en entornos con recursos limitados: con 205 M de parámetros, es viable en GPUs de gama media o incluso en CPU para procesamiento por lotes no interactivo, siempre que se use NeMo o una exportación compatible.

## Benchmarks y rendimiento

| Dominio | Decoder | WER | CER |
|---|---|---|---|
| Kirtan | RNN-T | 36,16 | 17,26 |
| Kirtan | CTC | 42,07 | 19,24 |
| Sehaj paath | RNN-T | 4,35 | 1,50 |
| Sehaj paath | CTC | 7,58 | 2,85 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de estos WER/CER por dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (205 M parámetros, repo de 0,8 GB) se sitúa con holgura por debajo de los 8 GB en precisión completa, aunque no hay dato oficial.
- GPU recomendadas: no disponible; al tratarse de NeMo/FastConformer, cualquier GPU NVIDIA con soporte CUDA es suficiente en principio.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060/4060 o superiores), si bien el dato no está confirmado por el autor.
- Opciones de despliegue: NeMo (framework nativo, con scripts de transcripción y evaluación), exportación a ONNX o TensorRT según el flujo de NeMo; no se mencionan vLLM, llama.cpp ni Ollama, que no aplican a ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baniguru_fast_conformer_205m_v1 | 205 M | no disponible | WER 4,35–42,07 según dominio | MIT | Hugging Face, NeMo |
| Whisper (large-v3) | 1.550 M | 30 s de audio | no evaluado aquí en punyabí | MIT | Hugging Face, múltiples runtimes |
| Modelos ASR NeMo multilingües (Conformer/FastConformer) | variable | no disponible | no disponible para este dominio | variable | NGC / Hugging Face |
| Alternativas específicas para punyabí | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Whisper es pertinente por tamaño y licencia, pero no se dispone de resultados de Whisper en los dominios kirtan/sehaj paath dentro de la información proporcionada, por lo que no se puede establecer una comparación numérica fiable.

## Limitaciones y advertencias

- Cobertura de dominio muy estrecha: el propio autor advierte que el punyabí general no está bien cubierto y requerirá fine-tuning con audio convencional.
- WER elevado en kirtan (36,16 con RNN-T): la transcripción de cantos requiere revisión humana y no es apta para uso directo sin postproceso.
- Riesgo de alucinación textual: como todo ASR neuronal, puede generar palabras plausibles en pasajes ruidosos o con música de fondo, especialmente en kirtan.
- Sesgos: el entrenamiento concentrado en registros devocionales puede introducir sesgo léxico hacia vocabulario gurbani y penalizar habla coloquial o variantes regionales.
- Idiomas: solo punyabí (`pa`); no se declara soporte de code-switching con hindi o inglés, frecuente en el habla real.
- Restricciones de licencia: MIT permite uso comercial, pero conviene verificar la procedencia del audio de entrenamiento si el modelo se usa en productos comerciales.
- Caveats de producción: no hay datos publicados sobre latencia, throughput, cuantización ni robustez frente a ruido; el pipeline de Hugging Face figura como no disponible, lo que complica el uso con `transformers` y obliga a NeMo.
- Madurez: 13 descargas y 0 likes en el momento de la consulta indican un modelo experimental sin validación comunitaria amplia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/baniguru/baniguru_fast_conformer_205m_v1)
- [NeMo (NVIDIA) — framework de entrenamiento e inferencia](https://github.com/NVIDIA/NeMo)
- [Documentación de modelos FastConformer en NeMo](https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
