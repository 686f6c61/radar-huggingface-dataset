# openarcane/openarcane-asr-0.6b-preview

## Resumen

OpenArcane ASR 0.6B es un modelo experimental de reconocimiento automático del habla (ASR) para lenguas de la India, desarrollado por la organización openarcane. Esta primera versión, etiquetada como "preview", se centra en cuatro lenguas dravídicas: kannada, malayalam, tamil y telugu, un segmento donde los modelos ASR generalistas suelen rendir por debajo de lo esperado.

El modelo es un ajuste fino (fine-tune) de Qwen3-ASR-0.6B de Alibaba, realizado mediante un adaptador LoRA con un tokenizador extendido para los cuatro alfabetos (kannada, malayalam, tamil y telugu). Su aportación principal es llevar la capacidad de transcripción multilingüe de la familia Qwen3-ASR a estas lenguas con salida en escritura nativa, manteniendo el peso reducido del modelo base (0.6B de parámetros), lo que lo hace accesible para hardware modesto.

Es relevante ahora porque los recursos ASR de calidad abierta para estas lenguas son escasos, y porque aprovecha datasets públicos indios como IndicVoices, Kathbath y SPRING-INX. Los propios autores advierten que se trata de una versión temprana de prueba, no apta para producción, con errores esperables y mejoras planificadas (más lenguas, puntuación consistente y números en dígitos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR basado en Qwen3-ASR (transformer multimodal audio-texto); detalles no disponibles |
| Parametros totales | 0.6B (modelo base) |
| Parametros activos | no disponible (no se indica si es MoE; no aplica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Kannada (kn), Malayalam (ml), Tamil (ta), Telugu (te); hindi, ingles, chino y japones del modelo base siguen funcionando |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre Qwen3-ASR-0.6B) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-ASR-0.6B, un modelo de reconocimiento de habla de la familia Qwen3 de Alibaba. Sobre él se aplica un ajuste fino eficiente mediante LoRA (PEFT), con la particularidad de que se extiende el tokenizador para cubrir los cuatro alfabetos de las lenguas objetivo, algo necesario porque los scripts dravídicos no estaban bien representados en el vocabulario original. La salida del modelo es texto en la escritura nativa de cada lengua.

El entrenamiento se realizó con una combinación de datasets públicos: IndicVoices, Kathbath, SPRING-INX, FLEURS, LibriTTS-R, IndicTTS English, AISHELL-1 y MUSAN. Esta mezcla incluye habla leída y conversacional en lenguas indias, ingles, chino (AISHELL-1) y ruido (MUSAN), lo que sugiere un esfuerzo por robustecer el modelo frente a condiciones acústicas variadas. No se especifican detalles como el número de tokens/horas de audio, hiperparámetros del entrenamiento ni el uso de técnicas adicionales como RLHF o DPO (no aplicables en ASR tradicional).

## Capacidades

- Transcripción de voz a texto en kannada, malayalam, tamil y telugu, con salida en la escritura nativa de cada lengua.
- Transcripción en hindi, ingles, chino y japonés heredada del modelo base Qwen3-ASR-0.6B, aunque sin ser el foco del ajuste fino.
- Detección automática de lengua cuando no se especifica (menos fiable, especialmente en telugu y clips muy cortos).
- Acepta como entrada tanto rutas de fichero de audio como tuplas `(numpy_array, sample_rate)`, lo que facilita la integración en pipelines de procesamiento de audio en tiempo real.
- Interfaz de línea de comandos incluida (`python inference.py clip.wav --language Telugu`).
- Selección explícita de lengua recomendada para maximizar la precisión.
- No es un modelo de generación de texto general: no soporta tool calling, razonamiento ni capacidades de agente.

## Casos de uso

- Transcripción de medios y archivos en lenguas dravídicas: puede convertir grabaciones en kannada, malayalam, tamil o telugu a texto en escritura nativa, útil para subtitulado o archivo de contenido audiovisual regional.
- Construcción de corpora de habla: al ser abierto y manejar escrituras nativas, sirve para generar transcripciones iniciales que luego se corrigen manualmente, acelerando la creación de datasets para lenguas con pocos recursos.
- Sistemas de voz interactivos en prototipo: su tamaño de 0.6B permite ejecutarlo en hardware modesto, adecuado para pruebas de asistentes de voz en estados del sur de India (Karnataka, Kerala, Tamil Nadu, Andhra Pradesh).
- Análisis de llamadas y audio de contacto center (fase experimental): puede transcribir grabaciones de llamadas en estas lenguas, aunque los autores advierten que el habla conversacional y con ruido es su punto débil actual.
- Investigación en ASR multilingüe: al publicar un adaptador LoRA con tokenizador extendido, es una base útil para estudiar cómo adaptar modelos ASR generalistas a scripts no latinos.
- Accesibilidad: generación de transcripciones para personas sordas o con dificultades auditivas en lenguas indias donde apenas existen herramientas abiertas.
- Procesamiento por lotes de clips cortos: la API en Python acepta arrays de NumPy, lo que permite integrarlo en pipelines de preprocesamiento de audio sin pasar por ficheros intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card muestra únicamente ejemplos seleccionados a mano de los conjuntos de test FLEURS y de validación IndicVoices donde la salida coincide palabra por palabra con la referencia, y advierte explícitamente que no son representativos del rendimiento típico. No hay cifras de WER/CER publicadas.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud; con 0.6B de parámetros, el modelo completo en precisión completa debería ocupar del orden de 1.5-2.5 GB, por lo que GPUs de consumo modestas (8 GB o menos) deberían ser suficientes. El código de inferencia incluido usa GPU si está disponible y hace fallback a CPU en caso contrario.
- GPU recomendadas: no disponible; dado el tamaño, cualquier GPU moderna (por ejemplo RTX 3060/4060 o superiores) debería bastar para inferencia.
- Consumer GPU: sí, por tamaño del modelo debería funcionar en GPUs de consumo de gama media; no hay confirmación oficial.
- Opciones de despliegue: mediante el script `inference.py` incluido en el repositorio con las librerías `qwen-asr==0.0.6`, `peft==0.17.1` y `soundfile`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador LoRA sobre Qwen3-ASR, su despliegue requiere cargar el modelo base más el adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Lenguas | Licencia | Notas |
|---|---|---|---|---|
| OpenArcane ASR 0.6B (preview) | 0.6B (LoRA sobre base) | kn, ml, ta, te (+hi, en, zh, ja del base) | Apache-2.0 | Experimental, sin benchmarks publicados |
| Qwen/Qwen3-ASR-0.6B (base) | 0.6B | Multilingüe, incl. hi, en, zh, ja | no disponible | Modelo base sin adaptación a scripts dravídicos |
| AI4Bharat Indic ASR (IndicConformer/IndicWhisper) | no disponible | 22 lenguas indias | no disponible | Alternativa consolidada para lenguas indias, con benchmarks publicados |

La comparación con IndicWhisper/IndicConformer de AI4Bharat es la más pertinente por categoría de tarea, aunque no se dispone de cifras que permitan comparar precisión directamente.

## Limitaciones y advertencias

- Versión experimental: los propios autores indican que es una preview temprana para pruebas y feedback, y que no debe usarse en producción.
- Puntuación parcial: la salida en malayalam incluye puntuación razonable, pero kannada, tamil y telugu se transcriben mayoritariamente sin puntuación.
- Los números se escriben como palabras (por ejemplo, "1200" se transcribe como "ಸಾವಿರದ ಇನ್ನೂರು" en kannada) en lugar de dígitos.
- El habla conversacional y con ruido es notablemente más difícil para el modelo que el habla leída.
- La detección automática de lengua es menos fiable que la especificación manual, especialmente en telugu y en clips muy cortos; se recomienda indicar la lengua siempre que se conozca.
- Los ejemplos publicados en la model card están seleccionados a mano y no representan el rendimiento típico.
- Riesgo de alucinaciones en ASR: no hay datos de WER publicados, por lo que la tasa de error real es desconocida.
- Licencia Apache-2.0, que permite uso comercial; sin restricciones relevantes documentadas, aunque los datasets de entrenamiento tienen sus propias licencias y créditos (por ejemplo, IndicTTS con copyright del TTS Consortium, TDIL, MeitY).
- Cero descargas registradas en Hugging Face en el momento de la ficha: falta validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openarcane/openarcane-asr-0.6b-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/ai4bharat/IndicVoices
  - https://huggingface.co/datasets/ai4bharat/kathbath
  - https://huggingface.co/SPRINGLab (SPRING-INX)
  - https://huggingface.co/datasets/google/fleurs
  - https://huggingface.co/datasets/mythicinfinity/libritts_r
  - https://huggingface.co/datasets/SPRINGLab/IndicTTS-English
  - https://huggingface.co/datasets/AISHELL/AISHELL-1
