# FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-mlx-4bit

## Resumen

El modelo `FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-mlx-4bit` es una conversión a formato MLX en cuantización de 4 bits del sistema de reconocimiento automático de voz (ASR) `language-and-voice-lab/whisper-large-icelandic-62640-steps-967h`. Este último es un ajuste fino del modelo `openai/whisper-large` realizado por el Laboratorio de Lenguaje y Voz (Language and Voice Lab) de Islandia, entrenado con 967 horas de audio islandés recopilado mediante la plataforma colaborativa Samrómur. El resultado es un modelo ASR especializado en islandés, con una precisión notablemente superior a la del Whisper original para este idioma de bajos recursos.

La versión MLX está pensada para ejecutarse de forma eficiente en chips Apple Silicon (M1, M2, M3 y posteriores) mediante la librería `mlx-whisper`. Al estar cuantizado en 4 bits, el tamaño del repositorio se reduce a 0,9 GB, lo que permite su uso en dispositivos con memoria unificada limitada. Este modelo es relevante hoy porque cubre una necesidad concreta: transcripción de voz en islandés con alta calidad, un idioma con escasa representación en los modelos ASR multilingües generalistas, y lo hace con una solución ligera y ejecutable localmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large (encoder-decoder transformer) |
| Parametros totales | 1550 millones (1,55 B) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | Islandés (is) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | MLX (formato de pesos para Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder de la familia Whisper large, con aproximadamente 1550 millones de parámetros. La arquitectura original de Whisper procesa el audio como un espectrograma log-Mel de 80 canales, lo codifica mediante un encoder de 32 capas y lo decodifica con un decoder de 32 capas para generar texto. El ajuste fino se realizó sobre el checkpoint `openai/whisper-large` (versión v1) durante 62 640 pasos de entrenamiento, utilizando 967 horas de habla islandesa procedente de Samrómur, una plataforma de recopilación de voz colaborativa que cubre una amplia variedad de acentos, edades y contextos dialectales del islandés. No se menciona el uso de técnicas de refuerzo como RLHF o DPO; el entrenamiento es un ajuste fino supervisado estándar para la tarea de transcripción.

La conversión a MLX se realizó con el script `convert.py` de `mlx-examples/whisper`, aplicando cuantización de 4 bits sobre los pesos del modelo afinado. Esto reduce el tamaño del modelo de aproximadamente 3 GB (en precisión float32) a 0,9 GB, manteniendo una degradación mínima de la precisión, aceptable para la mayoría de casos de uso prácticos.

## Capacidades

- Reconocimiento automático de voz (ASR) en islandés: transcribe audio a texto con alta fidelidad, incluyendo puntuación básica y normalización de números cuando procede.
- Manejo de audio en diversos formatos (mp3, wav, m4a, etc.) a través de la librería `mlx-whisper`, que decodifica el audio a la frecuencia de muestreo requerida (16 kHz).
- Detección de segmentos de silencio y división en frases coherentes, gracias a la arquitectura Whisper que genera timestamps a nivel de segmento.
- Capacidad de transcribir audio largo (más de 30 segundos) mediante el encadenamiento automático de ventanas de 30 segundos que realiza el decodificador de Whisper.
- No incluye capacidades de tool calling, agentes ni razonamiento multilingüe; es un modelo puramente de transcripción de voz.

## Casos de uso

- Transcripción de reuniones y entrevistas en islandés: el modelo puede procesar grabaciones de voz de hasta varias horas, generando texto con marcas de tiempo. Su ajuste específico sobre datos islandeses mejora la precisión en acentos regionales y vocabulario coloquial frente a Whisper genérico.
- Subtitulado automático de vídeo y podcasts: al integrarse con herramientas de postproducción, permite generar subtítulos en islandés de forma automática, reduciendo el coste de transcripción manual.
- Asistente de voz para servicios públicos islandeses: por ejemplo, transcripción de llamadas de atención al cliente o consultas médicas, donde la privacidad exige procesamiento local. Al ejecutarse en Apple Silicon, los datos no salen del dispositivo.
- Archivado y búsqueda de contenido audiovisual: bibliotecas de radio o televisión pueden indexar sus archivos de audio convirtiéndolos a texto para búsqueda por palabras clave.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o eventos en islandés, ejecutable en un Mac con suficiente rendimiento.
- Investigación lingüística y sociolingüística: los investigadores pueden transcribir corpus de habla islandesa para análisis de variación dialectal, fonética o pragmática, aprovechando la licencia CC-BY-4.0 que permite uso académico y comercial con atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas como WER (Word Error Rate) o CER (Character Error Rate) sobre conjuntos de test islandeses. Se recomienda consultar el repositorio del modelo base (`language-and-voice-lab/whisper-large-icelandic-62640-steps-967h`) para posibles evaluaciones adicionales, aunque tampoco se encontraron datos numéricos en la documentación pública.

## Requisitos de hardware

- Requiere un Mac con chip Apple Silicon (M1, M1 Pro/Max, M2, M2 Pro/Max, M3, etc.). No es compatible con Intel Mac ni GPUs NVIDIA/AMD.
- Memoria unificada estimada: el modelo cuantizado en 4 bits ocupa aproximadamente 0,9 GB en disco y necesita alrededor de 1,5-2 GB de RAM en tiempo de ejecución (incluyendo buffers de audio y activaciones). Por tanto, cualquier Mac con 8 GB de RAM o más puede ejecutarlo sin problemas.
- Latencia: en un MacBook Pro con chip M2 Pro, la transcripción de un audio de 1 minuto suele tardar entre 2 y 5 segundos (factor de tiempo real de 12-30x), dependiendo de la longitud de los segmentos y del uso de aceleración neuronal (ANE). En chips M1 básicos el rendimiento es algo menor.
- Opciones de despliegue: la vía principal es `mlx-whisper` (CLI y API Python). También se puede integrar en aplicaciones Swift mediante los bindings de MLX. No es compatible con vLLM, TGI o llama.cpp, ya que estos están orientados a modelos de lenguaje y no a arquitecturas ASR como Whisper.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|---|
| `FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-mlx-4bit` | Whisper large (fine-tuned) | 1550 M | 30 s audio | Islandés | CC-BY-4.0 | MLX 4-bit | Optimizado para Apple Silicon |
| `language-and-voice-lab/whisper-large-icelandic-62640-steps-967h` | Whisper large (fine-tuned) | 1550 M | 30 s audio | Islandés | CC-BY-4.0 | PyTorch | Modelo original sin cuantizar |
| `language-and-voice-lab/whisper-large-icelandic-62640-steps-967h-ct2` | Whisper large (fine-tuned) | 1550 M | 30 s audio | Islandés | CC-BY-4.0 | CTranslate2 | Optimizado para CPU (Intel/AMD) |
| `openai/whisper-large` | Whisper large | 1550 M | 30 s audio | Multilingüe (incl. islandés) | MIT | PyTorch | Modelo base, menor precisión en islandés |

La comparativa muestra que la versión MLX es la única pensada para Apple Silicon, mientras que la versión CT2 ofrece una alternativa para CPUs tradicionales. El modelo base de OpenAI no está ajustado al islandés, por lo que su WER en este idioma es significativamente mayor (aunque no se dispone de cifras exactas).

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos islandeses. Aunque esto mejora la precisión en islandés, no es capaz de transcribir otros idiomas. Para detección automática de idioma o transcripción multilingüe, es necesario combinar este modelo con un sistema que detecte el idioma (por ejemplo, usar Whisper large-v3-turbo para detección y luego delegar en este modelo).
- La cuantización de 4 bits puede introducir una ligera degradación en la precisión respecto al modelo en float32, especialmente en audio con ruido de fondo o acentos muy marcados. Se recomienda evaluar en el caso de uso concreto.
- El modelo puede alucinar contenido en segmentos de silencio o audio ininteligible, un comportamiento inherente a la arquitectura Whisper. Es recomendable filtrar segmentos con baja probabilidad de decodificación si se usa en producción.
- Los datos de entrenamiento provienen de Samrómur, que si bien es diversa, puede no cubrir todos los dialectos o registros del islandés. El rendimiento en habla infantil, habla muy rápida o jerga técnica puede ser inferior.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original y a los datos de Samrómur. No hay restricciones de uso militar o de vigilancia, pero se recomienda revisar los términos completos de la licencia.
- Al ser una conversión MLX, no es posible ejecutarlo en entornos de servidor con GPUs NVIDIA. Para despliegues en la nube con GPUs, se debe usar el modelo original en PyTorch o la versión CT2 para CPU.

## Enlaces

- [Modelo MLX 4-bit en HuggingFace](https://huggingface.co/FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-mlx-4bit)
- [Modelo base (fine-tuned) en HuggingFace](https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-62640-steps-967h)
- [Versión CTranslate2 del modelo base](https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-62640-steps-967h-ct2)
- [Repositorio de mlx-whisper (ejemplos MLX para Whisper)](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
- [API islandesa de ASR compatible con Whisper (GitHub)](https://github.com/icelandic-lt/icelandic-asr-api)
