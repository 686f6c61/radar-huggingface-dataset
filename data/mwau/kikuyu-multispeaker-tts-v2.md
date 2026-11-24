# Mwau/kikuyu-multispeaker-tts-v2

## Resumen

Kikuyu Multi-Speaker TTS V2 es un modelo de síntesis de voz (text-to-speech) para el idioma kikuyu (código ISO `kik`), desarrollado por el usuario Mwau y publicado en Hugging Face. Se basa en la arquitectura VITS, una familia de modelos generativos de extremo a extremo que combinan codificadores de texto, alineamiento por monotonic alignment search y un decoder de audio probabilístico (HiFi-GAN) para producir formas de onda directamente a partir de texto, sin necesidad de un vocoder externo. El modelo se distribuye como `VitsModelForPreTraining` con código de modelado personalizado.

El interés del modelo reside en su enfoque hacia una lengua de bajos recursos: entrena sobre el split de kikuyu del corpus WAXAL, con 4.463 grabaciones (aproximadamente 12 horas de audio) y 18 hablantes distintos, lo que lo convierte en un sistema multi-hablante con embeddings de hablante de 256 dimensiones y una frecuencia de muestreo de 16 kHz. Con 86,37 millones de parámetros y un repositorio de 0,3 GB, es un modelo compacto que puede ejecutarse en hardware modesto.

No obstante, se trata de un checkpoint con escasa madurez: solo 3 épocas de entrenamiento y 13.389 pasos de optimización, cero descargas y cero likes en el momento de la consulta, licencia no disponible y advertencias explícitas del autor sobre la calidad variable y la falta de idoneidad para uso comercial sin revisión. Es relevante como base de experimentación en TTS para lenguas africanas de bajos recursos, no como sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), clase `VitsModelForPreTraining` con código personalizado |
| Parametros totales | 86.370.358 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la longitud de entrada la determina el tokenizador de texto, vocabulario de 37 símbolos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | kikuyu (`kik`) |
| Licencia | no disponible (el autor indica que las condiciones de licencia y redistribución requieren revisión adicional; no se afirma licencia independiente para el checkpoint combinado) |
| Formato de pesos | safetensors (`use_safetensors=True`) |
| Numero de hablantes | 18 (IDs 0–17) |
| Dimension del embedding de hablante | 256 |
| Frecuencia de muestreo | 16.000 Hz |
| Tamano del vocabulario | 37 |
| Epocas de entrenamiento | 3 |
| Pasos de optimizacion | 13.389 |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de TTS de extremo a extremo que combina un encoder de texto basado en transformer con un prior variacional, alineamiento monotónico latente (MAS) y un decoder generativo condicionado por normalizing flows, entrenado con una combinación de pérdidas adversariales, de reconstrucción y de divergencia KL. En este caso, el modelo incorpora además un embedding de hablante de 256 dimensiones que se inyecta en el decoder para condicionar la identidad vocal, lo que permite seleccionar entre 18 hablantes mediante el argumento `speaker_id` en la llamada de inferencia.

El entrenamiento se realizó sobre el split de kikuyu del corpus WAXAL: 4.463 grabaciones, aproximadamente 12 horas de audio y 18 hablantes únicos, según las estadísticas del manifiesto de entrenamiento (sin incluir los splits de validación y test). El proceso constó de solo 3 épocas y 13.389 pasos de optimización, una cifra muy reducida para un modelo de TTS, lo que sugiere un ajuste limitado. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento original, el uso de RLHF/DPO (poco habitual en TTS), la composición lingüística del corpus ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La versión 2 se distingue de la versión 1, que según el autor se ajustó con 29 horas de grabaciones de kikuyu recopiladas de nuevo.

## Capacidades

- Síntesis de voz multi-hablante en kikuyu con 18 identidades vocales seleccionables mediante `speaker_id` (rango 0–17).
- Generación de forma de onda de audio a 16 kHz directamente desde texto, sin vocoder externo, gracias al diseño end-to-end de VITS.
- Tokenización de texto kikuyu mediante `VitsTokenizer` con un vocabulario de 37 símbolos.
- Integración con la librería `transformers` (versión 5.20.2 según la model card) mediante `AutoConfig` y `AutoModel` con `trust_remote_code=True`.
- Exportación de audio a fichero WAV mediante `soundfile` a partir del tensor `outputs.waveform`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio de entrada, modo thinking ni multilingüismo más allá del kikuyu.

## Casos de uso

- Investigación en TTS para lenguas de bajos recursos: el modelo sirve como punto de partida reproducible para experimentar con VITS en kikuyu, comparar curvas de entrenamiento y evaluar el impacto de ampliar el corpus WAXAL o de ajustar hiperparámetros.
- Generación de audiolibros y material divulgativo en kikuyu: con 18 voces disponibles, permite narrar textos largos alternando hablantes para diálogos, siempre que hablantes nativos revisen la inteligibilidad antes de publicar.
- Prototipos de asistentes de voz para kikuyu: integrado en un pipeline ASR + LLM + TTS, puede cerrar el bucle de conversación en una lengua que carece de sistemas comerciales, aunque la latencia y la calidad deben validarse por hablante.
- Preservación y documentación lingüística: la síntesis controlada de frases permite generar pares texto-audio para materiales didácticos o lexicográficos, con la ventaja de disponer de múltiples voces para ilustrar variación entre hablantes.
- Accesibilidad para hablantes de kikuyu: conversión de texto digital (noticias, avisos administrativos) a audio para personas con discapacidad visual, previa revisión de calidad y con la advertencia de que el autor no garantiza uso comercial sin revisión.
- Evaluación comparativa de TTS multi-hablante: al tener un embedding de hablante de 256 dimensiones y 18 identidades, es útil como banco de pruebas para métricas de similitud de hablante (SECS, MOS) en condiciones de pocos datos (12 horas).
- Educación e investigación sobre alineamiento latente: la arquitectura VITS con MAS permite estudiar visualmente el alineamiento texto-audio en una lengua con ortografía y fonología propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 86,37 millones de parámetros en precisión FP32, los pesos ocupan aproximadamente 0,35 GB; en FP16, unos 0,17 GB. Sumando activaciones y buffers de audio, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede usar desde una NVIDIA GTX 1650 o RTX 3050 hasta A100/H100 sin problema, aunque el modelo no aprovecha la capacidad de estas últimas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (RTX 20/30/40, GTX 16), e incluso en CPU para inferencia puntual, dado el reducido tamaño.
- Opciones de despliegue: al requerir `trust_remote_code=True` y código de modelado personalizado, la vía documentada es `transformers` (versión 5.20.2) con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no están orientados a modelos VITS. Para servir en producción habría que envolver la inferencia en un servicio propio (FastAPI, TorchServe, etc.).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán de la longitud del texto, del hardware y de si se ejecuta en CPU o GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mwau/kikuyu-multispeaker-tts-v2 | VITS multi-hablante | 86,37 M | Texto tokenizado (vocab. 37) | kikuyu | no disponible | Hugging Face, 0 descargas |
| Mwau/kikuyu-multispeaker-tts (v1) | VITS multi-hablante (presumible) | no disponible | no disponible | kikuyu | no disponible | Hugging Face (referenciado por el autor) |
| Modelos TTS multilingües comerciales (p. ej. familia VITS de Coqui o MMS-TTS de Meta) | VITS / variantes | del orden de decenas de millones | texto | decenas de idiomas, sin kikuyu documentado | variable (MPL-2.0 en Coqui; CC-BY-NC en MMS) | ampliamente disponibles |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; los datos de la tercera fila son orientativos de categoría y no deben interpretarse como cifras verificadas para este modelo.

## Limitaciones y advertencias

- Calidad e inteligibilidad variables entre hablantes y entradas de texto, según advierte el propio autor.
- Entrenamiento con datos limitados (12 horas, 4.463 grabaciones) y solo 3 épocas, lo que puede producir artefactos, prosodia inestable y errores en palabras poco frecuentes.
- Rendimiento no evaluado en distintos dialectos y estilos de habla del kikuyu; se requiere evaluación adicional.
- Riesgo de alucinación acústica: el modelo puede generar audio ininteligible o pronunciaciones incorrectas; el autor recomienda revisión por hablantes nativos antes de cualquier despliegue.
- Licencia no disponible: el autor no afirma una licencia independiente para el checkpoint combinado y señala que las condiciones de redistribución, incluidas las de los componentes preentrenados y los datos de entrenamiento (corpus WAXAL), requieren revisión. No debe asumirse uso comercial sin aclaración legal.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de usarlo en entornos de producción.
- Dependencia de una versión concreta de `transformers` (5.20.2 según la model card), lo que puede generar incompatibilidades con entornos existentes.
- Monolingüe: solo kikuyu; no admite otros idiomas ni code-switching documentado.
- Sin métricas publicadas (MOS, WER, SECS) ni benchmarks que permitan comparar objetivamente con alternativas.
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mwau/kikuyu-multispeaker-tts-v2
- Corpus WAXAL (referenciado por el autor como fuente de datos): no disponible enlace directo en la información proporcionada
- Paper original de VITS (Kim et al., 2021): no disponible enlace en la información proporcionada
- Repositorio de `transformers` (librería requerida): no disponible enlace en la información proporcionada
