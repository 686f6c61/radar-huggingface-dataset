# mau-cr/mayan_best_model

## Resumen

mau-cr/mayan_best_model es un ajuste fino de facebook/mms-1b-all orientado al reconocimiento automático del habla (ASR) en lengua maya yucateca (Maayat'aan, código ISO `yua`). Lo desarrolla Enrique Mauricio Carrillo Romero (usuario mau-cr) en el marco de una tesis de la Facultad de Ingeniería de la Universidad Autónoma de Yucatán, con el objetivo de dotar de herramientas de transcripción a una lengua con alrededor de 800.000 hablantes y recursos digitales muy escasos.

El modelo es un transformer convolucional de tipo Wav2Vec2 con cabeza CTC y alrededor de 964,7 millones de parámetros, heredado de la familia MMS (Massively Multilingual Speech) de Meta. Frente a aproximaciones multilingües genéricas, la aportación principal es el ajuste sobre un corpus propio de aproximadamente 4 horas de audio en maya yucateco, complementado con un modelo de lenguaje de 3-gramas que reduce el WER del 40% al 17% sobre el conjunto de test declarado.

Su relevancia actual es doble: por un lado, demuestra que con volúmenes de datos del orden de horas es posible obtener transcripciones utilizables en una lengua de bajos recursos; por otro, publica de forma abierta el corpus, el código de entrenamiento, un demo en Hugging Face Spaces y exportaciones ONNX, lo que facilita su reutilización por parte de comunidades lingüísticas y desarrolladores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional con cabeza CTC), derivada de facebook/mms-1b-all |
| Parámetros totales | 964.697.254 (~965 M) |
| Parámetros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica en el sentido textual; entrada de audio con segmentos recomendados de 2 a 15 segundos |
| Tipos de cuantización | No disponible (se distribuyen pesos safetensors y exportaciones ONNX; no se documentan variantes int8/int4) |
| Idiomas soportados | Maya yucateco (`yua`) |
| Licencia | No disponible |
| Formato de pesos | safetensors y ONNX |
| Pipeline | automatic-speech-recognition |
| Modelo base | facebook/mms-1b-all |
| Dataset de ajuste | mau-cr/mayan-voice |
| Tamaño del repositorio | 30,9 GB (incluye pesos, exportaciones ONNX y modelo de lenguaje de 3-gramas) |
| Descargas / likes | 6 descargas, 0 likes |
| Fecha de creación / última actualización | 2026-05-21 / 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es la de facebook/mms-1b-all: un codificador Wav2Vec2 de aproximadamente mil millones de parámetros que procesa la forma de onda en bruto y produce una secuencia de representaciones acústicas, sobre las que se aplica una cabeza de clasificación con pérdida CTC (Connectionist Temporal Classification) para obtener la transcripción. MMS utiliza adaptadores por idioma que permiten reutilizar el grueso del codificador; en este ajuste fino el modelo se especializa en `yua`. La entrada se plantea a nivel de enunciado, con segmentos de 2 a 15 segundos, que es el régimen para el que se recortó el corpus.

El ajuste se realizó de forma incremental sobre el corpus mau-cr/mayan-voice, que reúne unas 4 horas de audio: 1 hora de grabaciones propias y vídeos de YouTube (con mayor diversidad de hablantes) y 3 horas de las Narraciones Mayas de Campeche del INALI, material narrativo continuo. El corpus contiene 34.154 palabras en total y 5.802 formas únicas. El entrenamiento se ejecutó en pasos de 20 minutos de audio, desde 20 hasta 222 minutos, sobre Google Colab con una A100 SXM4 de 80 GB o una RTX PRO 6000 Blackwell. No se documenta en la información disponible el uso de RLHF o DPO, algo por otra parte poco habitual en modelos CTC de reconocimiento de voz. La innovación práctica más destacable es el uso combinado de la decodificación CTC con un modelo de lenguaje de 3-gramas incluido en el repositorio, que aporta hasta 30 puntos porcentuales de mejora en WER.

## Capacidades

- Reconocimiento automático del habla en maya yucateco a partir de audio en formato de onda, con salida de texto plano transcrito.
- Funcionamiento a nivel de enunciado: el modelo está optimizado para segmentos de 2 a 15 segundos; no está diseñado para audio largo sin segmentar.
- Decodificación con modelo de lenguaje: admite reestimación de hipótesis con el modelo de 3-gramas incluido, lo que reduce sustancialmente el WER.
- Exportación ONNX, lo que permite inferencia fuera del ecosistema PyTorch (ONNX Runtime) y despliegues ligeros.
- Integración directa con la librería transformers mediante `pipeline("automatic-speech-recognition")`.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No dispone de tool calling, function calling, razonamiento multi-paso, generación de texto libre, visión ni audio generativo: es exclusivamente un sistema ASR.
- Multilingüismo: no verificado en este ajuste. El modelo base cubre más de un millar de lenguas mediante adaptadores, pero el fine-tune está especializado en `yua` y no se documenta el comportamiento en otras lenguas.

## Casos de uso

- Documentación y archivo de patrimonio oral: transcripción sistemática de grabaciones de narradores, cuentos tradicionales y testimonios en maya yucateco para crear archivos de audio alineados con texto, aprovechando el ajuste sobre las Narraciones Mayas de Campeche del INALI.
- Subtitulado automático de vídeo en maya: generación de subtítulos para contenido de YouTube u otros repositorios audiovisuales, segmentando el audio en fragmentos de 2 a 15 segundos y aplicando el modelo de 3-gramas para reducir errores.
- Herramientas educativas bilingües: apoyo a programas de educación intercultural bilingüe en Yucatán, transcribiendo dictados o lecturas del alumnado para su corrección por parte del docente.
- Investigación lingüística de campo: transcripción asistida de entrevistas y elicitaciones para acelerar el trabajo de anotación fonética y morfológica, con revisión humana posterior dado el WER declarado.
- Servicios públicos en zonas maya-hablantes: prototipos de ventanilla o kiosco de información que transcriban la consulta del usuario en maya antes de derivarla a un sistema de gestión, usando el modelo como primer eslabón de un pipeline ASR más traducción o búsqueda.
- Accesibilidad y dictado personal: aplicaciones móviles o de escritorio que permitan dictar notas en maya yucateco, con despliegue ONNX en local para evitar enviar audio a servidores externos.
- Búsqueda y recuperación sobre acervos sonoros: indexación de colecciones de audio etiquetadas únicamente por metadatos, generando transcripciones que permitan búsqueda por texto completo dentro de archivos etnográficos.
- Creación de corpus adicionales: uso del modelo para pre-anotar nuevo audio y acelerar el ciclo de anotación humana, ampliando el corpus más allá de las 4 horas actuales.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (marcados como no verificados):

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| mau-cr/mayan-voice (split test) | WER sin modelo de lenguaje | 40% |
| mau-cr/mayan-voice (split test) | WER con modelo de lenguaje de 3-gramas | 17% |

Evolución del WER según los minutos de entrenamiento acumulados (datos del autor):

| Minutos de entrenamiento | WER sin LM | WER con LM 3-gramas |
|---|---|---|
| 20 | ~53% | ~24% |
| 120 | ~45% | ~20% |
| 222 | ~40% | ~17% |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre este mismo corpus (por ejemplo MMS-1b-all sin ajustar o Whisper), ni métricas de latencia o throughput.

## Requisitos de hardware

- Pesos en fp32 (safetensors): aproximadamente 3,9 GB solo de parámetros.
- Pesos en fp16/bf16: aproximadamente 1,9 GB, más el sobrecoste de activaciones y framework (del orden de 1 a 2 GB adicionales).
- Cuantización int8: en torno a 1 GB estimado; no se distribuyen variantes cuantizadas oficiales, sería necesario generarlas.
- GPU recomendadas para inferencia: cualquier GPU con 4 GB o más de VRAM es suficiente, por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100. En fp16 cabe holgadamente incluso en GPUs de gama de entrada actuales.
- Ejecución en CPU: viable para uso no interactivo, con latencia mayor; el repositorio incluye exportaciones ONNX que permiten usar ONNX Runtime sin GPU.
- Entrenamiento o ajuste fino completo: el autor empleó una A100 SXM4 de 80 GB o una RTX PRO 6000 Blackwell. Un ajuste fino completo de 965 M de parámetros requiere VRAM de ese orden; con estrategias de congelación de capas o adaptadores se podría reducir, aunque no hay datos publicados al respecto.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime y endpoints de Hugging Face. vLLM, TGI, llama.cpp y Ollama no soportan de forma nativa arquitecturas Wav2Vec2, por lo que no son opciones válidas para este modelo.
- Latencia y throughput: no disponible. Como referencia de diseño, el modelo espera segmentos de 2 a 15 segundos.
- Almacenamiento: el repositorio completo ocupa 30,9 GB, aunque para inferencia solo es necesario descargar los pesos y, opcionalmente, el modelo de lenguaje de 3-gramas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | WER en maya yucateco | Disponibilidad |
|---|---|---|---|---|---|
| mau-cr/mayan_best_model | ~965 M | yua | No disponible | 40% sin LM / 17% con LM 3-gramas (declarado por el autor, no verificado) | Hugging Face, ONNX, transformers |
| facebook/mms-1b-all (modelo base) | ~1.000 M | Más de 1.100 lenguas mediante adaptadores, incluido `yua` | No disponible en la información proporcionada | No disponible | Hugging Face |
| openai/whisper-large-v3 | ~1.550 M | 99 idiomas (maya yucateco no incluido de forma explícita) | MIT | No disponible | Hugging Face, múltiples runtimes |

No se dispone de resultados de benchmarks homogéneos que permitan comparar el rendimiento de estos tres modelos sobre el corpus mau-cr/mayan-voice. La comparación relevante, y no publicada, sería frente al modelo base MMS-1b-all sin ajustar, para aislar la ganancia atribuible al fine-tune y al modelo de 3-gramas.

## Limitaciones y advertencias

- Sesgo de género en el corpus: el 66,9% de las voces son masculinas frente al 33,1% femeninas, lo que puede degradar el WER en voces femeninas.
- Concentración de hablantes: el material narrativo proviene de pocos hablantes del corpus del INALI, lo que reduce la variabilidad dialectal y de registro, con probable peor desempeño en habla conversacional espontánea.
- Tamaño de datos limitado: alrededor de 4 horas de audio y 34.154 palabras; cualquier dominio alejado del narrativo o de los vídeos de YouTube puede degradar notablemente los resultados.
- WER elevado sin modelo de lenguaje: el 40% sin LM hace inviable el uso directo en producción sin revisión humana o sin decodificación con el modelo de 3-gramas, que baja al 17% pero sigue requiriendo validación.
- Los resultados están declarados por el autor y marcados como no verificados (`verified: false`); no han sido replicados de forma independiente.
- Riesgo de alucinación: en ASR con CTC no se genera texto libre, pero sí pueden aparecer sustituciones e inserciones plausibles, especialmente con nombres propios, préstamos del español y términos poco frecuentes.
- Licencia no disponible: no se puede confirmar la licencia del ajuste ni las condiciones de uso comercial. Al derivar de facebook/mms-1b-all, conviene revisar la licencia del modelo base antes de cualquier despliegue comercial.
- Idioma único: el modelo está especializado en `yua`; no debe asumirse un comportamiento correcto en otras lenguas mayenses como quiché, cakchiquel o chol.
- Discrepancia de identificadores: la model card incluye ejemplos de código que referencian el identificador `mau-cr/mms-maya-yucateco`, mientras que el repositorio publicado figura como `mau-cr/mayan_best_model`. Conviene verificar cuál es el identificador operativo antes de integrarlo en un pipeline.
- Adopción muy baja: 6 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.
- Sin soporte en los runtimes de inferencia más habituales para LLM (vLLM, TGI, llama.cpp, Ollama), lo que limita las opciones de escalado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mau-cr/mayan_best_model
- Modelo base: https://huggingface.co/facebook/mms-1b-all
- Dataset de entrenamiento: https://huggingface.co/datasets/mau-cr/mayan-voice
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/mau-cr/asr-maya-yucateco
- Código de la tesis: https://github.com/Mauriciocr207/thesis-mayan-ai

Nota: la búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a páginas sin relación con el reconocimiento de voz o con la lengua maya yucateca.
