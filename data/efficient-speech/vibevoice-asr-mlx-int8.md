# efficient-speech/VibeVoice-ASR-MLX-INT8

## Resumen

VibeVoice-ASR-MLX-INT8 es una conversión al framework MLX de Apple del modelo de reconocimiento automático del habla VibeVoice-ASR de Microsoft, publicada por el colectivo Efficient Speech. El modelo original transcribe audio con marcas temporales y etiquetas de hablante (diarización), y esta versión aplica cuantización afín de 8 bits a los pesos del backbone de texto en grupos de 64, manteniendo el codificador de audio en BF16. El resultado es un checkpoint de 8.330.325.888 parámetros totales y 9,5 GB en disco, pensado para ejecutarse de forma nativa en hardware Apple Silicon.

La relevancia de esta ficha es doble: por un lado, demuestra el patrón habitual de portar modelos ASR grandes a MLX para inferencia local en Mac; por otro, acompaña a Murmur, un sistema de inferencia para reconocimiento de voz de formato largo desarrollado por la Universidad de Washington, lo que sitúa al modelo en el contexto de transcripción de audio extenso con diarización. El tokenizador de texto incluido proviene de Qwen2.5-7B y se distribuye bajo Apache 2.0, mientras que el conjunto del checkpoint se publica con licencia MIT.

Conviene subrayar que se trata de una conversión de pesos, no de un modelo entrenado desde cero: la calidad final depende enteramente del modelo base de Microsoft. La model card es muy escueta y no aporta datos sobre composición del dataset, idiomas soportados ni resultados de evaluación, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR con codificador de audio y backbone de texto; el backbone de texto usa tokenizador Qwen2.5-7B) |
| Parámetros totales | 8.330.325.888 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 afín por grupos de 64 en el backbone de texto; codificador de audio en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 8 bits |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza ASR. Lo que sí se documenta es la estructura de la conversión: el checkpoint original de Microsoft se ha portado a MLX y se ha aplicado cuantización afín de 8 bits en grupos de 64 exclusivamente sobre los pesos del backbone de texto, dejando el codificador de audio en BF16. Esta asimetría es deliberada y habitual en ASR: el codificador de audio suele ser sensible a la cuantización agresiva porque procesa señales continuas de alta entropía, mientras que el decoder de texto tolera mejor la reducción de precisión.

No se aportan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por etapas de RLHF o DPO. Tampoco se describe ninguna innovación técnica propia de esta conversión más allá de la cuantización. La model card indica que los shards de pesos serializados coinciden byte a byte con el checkpoint de referencia de mlx-community (VibeVoice-ASR-8bit), lo que sugiere que la aportación principal es la reproducibilidad y el empaquetado para el sistema Murmur, más que una optimización diferencial. La conversión se validó con `mlx-audio==0.6.8`.

## Capacidades

- Transcripción de voz a texto con marcas temporales por segmento.
- Diarización de hablantes: etiqueta cada fragmento transcrito con el hablante correspondiente.
- Reconocimiento de voz de formato largo, orientado a su uso dentro del sistema Murmur.
- Inferencia nativa en MLX sobre Apple Silicon, con soporte de pesos cuantizados a 8 bits.
- Ejecución mediante la CLI de mlx-audio (`python -m mlx_audio.stt.generate`).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo genera texto con marcas temporales y etiquetas de hablante, lo que permite producir actas estructuradas donde cada intervención queda atribuida a su participante y localizada en el tiempo.
- Subtitulado de vídeo y podcasts: la salida con timestamps facilita la generación de ficheros de subtítulos sincronizados sin necesidad de un alineador forzado posterior.
- Investigación cualitativa: transcripción de entrevistas semiestructuradas en ciencias sociales o estudios de usuario, aprovechando la diarización para separar entrevistador y entrevistado.
- Inferencia local en Mac: al estar en formato MLX, permite procesar audio sensible sin enviarlo a servicios en la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Integración en pipelines de documentación clínica o legal: la combinación de timestamps y etiquetas de hablante ayuda a auditar quién dijo qué y cuándo en grabaciones de larga duración.
- Prototipado de sistemas de reconocimiento de voz de formato largo: sirve como checkpoint de referencia para experimentar con Murmur y comparar configuraciones de cuantización en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint ocupa 9,5 GB en disco en formato safetensors de 8 bits; el peso en memoria durante la inferencia será del orden de esa cifra más las activaciones y el estado del codificador de audio en BF16.
- Requiere hardware Apple Silicon con MLX; no es ejecutable de forma nativa en GPU NVIDIA ni en CPU x86 mediante esta distribución.
- No se especifican modelos concretos de chip compatibles ni el mínimo de memoria unificada. Como referencia orientativa, un checkpoint de 9,5 GB exige configuraciones de memoria unificada holgadas (habitualmente 16 GB o más), pero este dato no está confirmado por el autor.
- Despliegue mediante `mlx-audio` (versión probada: 0.6.8) y su CLI `mlx_audio.stt.generate`.
- No se documentan latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VibeVoice-ASR-MLX-INT8 (este) | 8,33 B | no disponible | MIT | safetensors MLX INT8 | Conversión de Efficient Speech, codificador en BF16 |
| mlx-community/VibeVoice-ASR-8bit | no disponible | no disponible | no disponible | safetensors MLX 8 bits | Checkpoint de referencia; el autor indica coincidencia byte a byte con este |
| microsoft/VibeVoice-ASR | no disponible | no disponible | no disponible | no disponible | Modelo base original de Microsoft |

No se dispone de datos de rendimiento comparado entre estas variantes ni frente a otros sistemas ASR, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- La model card no documenta los idiomas soportados; no debe asumirse cobertura multilingüe sin verificación empírica.
- No hay información sobre sesgos demográficos, acentos o variedades dialectales; en producción conviene evaluar con muestras representativas del dominio objetivo.
- Riesgo de alucinación inherente a los modelos ASR basados en decoder de lenguaje: pueden generarse transcripciones plausibles en tramos de silencio, ruido o audio ininteligible.
- La cuantización INT8 del backbone de texto puede degradar ligeramente la precisión en comparación con el modelo base en BF16; no se han publicado métricas que cuantifiquen esa diferencia.
- Dependencia de hardware Apple Silicon: no hay ruta de despliegue documentada para CUDA, ROCm ni CPU genérica con esta distribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- El tokenizador de texto procede de Qwen2.5-7B bajo Apache 2.0; conviene conservar los avisos de atribución correspondientes al redistribuir.
- La licencia MIT del checkpoint no exime de verificar las condiciones del modelo base de Microsoft si se redistribuye o se usa comercialmente.

## Enlaces

- Hugging Face: https://huggingface.co/efficient-speech/VibeVoice-ASR-MLX-INT8
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR
- Checkpoint de referencia MLX: https://huggingface.co/mlx-community/VibeVoice-ASR-8bit
- Tokenizador Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Sistema Murmur: https://github.com/uw-syfi/Murmur
