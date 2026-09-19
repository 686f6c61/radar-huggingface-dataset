# Grenmango/whisper-medium-en-hindi-accent

## Resumen

`Grenmango/whisper-medium-en-hindi-accent` es un modelo de reconocimiento automático del habla (ASR) en inglés especializado en voz con acento hindi, publicado por el usuario Grenmango. Se construye a partir de `openai/whisper-medium.en` mediante un ajuste fino con LoRA (rango 32, alpha 64) sobre el subconjunto hindi del corpus L2-ARCTIC, tras lo cual los adaptadores se fusionan de forma permanente en los pesos base. El resultado es un modelo autónomo de 763.856.896 parámetros, compatible con `WhisperForConditionalGeneration`, que no requiere instalar `peft` para su uso.

El problema que aborda es concreto y medible: el rendimiento de Whisper se degrada ante acentos no nativos, y el inglés hablado por nativos de hindi es un caso frecuente en entornos de soporte, offshoring y producción audiovisual. Según la evaluación publicada por el propio autor sobre el split de test del corpus (habla leída y limpia), el modelo reduce el WER del 4,54% al 2,64% y el CER del 2,07% al 1,30% frente a `openai/whisper-medium.en` en modo zero-shot, una mejora relativa del 41,9% en WER.

La relevancia actual es doble: por un lado, demuestra que un ajuste LoRA sobre apenas 3,5 horas de audio de cuatro hablantes puede superar a un modelo mayor como `whisper-large-v3-turbo` (3,94% de WER) en un dominio acústico estrecho; por otro, forma parte de una colección de siete variantes por acento (vietnamita, árabe, chino, hindú, coreano, español y una personalizada) con la misma receta de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de la familia Whisper; entrada de espectrograma log-Mel de 80 canales a 16 kHz |
| Parámetros totales | 763.856.896 |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (`chunk_length_s=30`); no se documenta el límite de tokens de salida por ventana |
| Tipos de cuantización | No disponible. Los pesos se publican explícitamente en FP16 fusionado; el autor no documenta versiones GGUF, INT8 ni INT4 |
| Idiomas soportados | `en` (inglés). Entrenado específicamente para inglés hablado con acento hindi; no se declara soporte de otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP16), compatible con `WhisperProcessor` y `WhisperForConditionalGeneration` |

## Arquitectura y entrenamiento

La arquitectura es la del Whisper medium original: un transformer encoder-decoder que consume espectrogramas log-Mel de 80 canales a 16 kHz y genera texto de forma autorregresiva. El autor indica que la base `openai/whisper-medium.en` tiene 769M de parámetros y que el modelo final conserva 763.856.896 parámetros reales en safetensors, con los pesos en FP16. Al fusionar los adaptadores, la arquitectura no cambia respecto al modelo base y no se añaden capas ni cabezas nuevas.

El entrenamiento se realizó sobre el subconjunto hindi del corpus L2-ARCTIC: 4.071 enunciados (aproximadamente 3,5 horas) de cuatro hablantes (ASI y RRBI masculinos, SVBI y TNI femeninos). Se empleó LoRA con rango 32 y alpha 64 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`, es decir, sobre todos los bloques de atención y las capas feed-forward. No se menciona en la información disponible el uso de RLHF, DPO ni de ninguna técnica de optimización adicional. La innovación destacable es metodológica más que arquitectónica: demostrar que un ajuste paramétricamente eficiente sobre un corpus de acento muy pequeño y luego fusionado supera a modelos de mayor tamaño en ese dominio concreto.

## Capacidades

- Transcripción de voz a texto en inglés para hablantes con acento hindi, con un WER declarado del 2,64% en el conjunto de test de L2-ARCTIC.
- Reconocimiento de habla leída y limpia en formato mono a 16 kHz; el pipeline remuestrea automáticamente si se le entrega otro formato.
- Procesamiento de audio largo mediante fragmentación en ventanas de 30 segundos (`chunk_length_s=30`).
- Carga directa con `transformers` sin dependencias adicionales, tanto vía `pipeline` como con `WhisperForConditionalGeneration` en FP16 con `device_map="auto"`.
- Uso en CPU y en GPU, al ser un modelo de 763,9M de parámetros (aproximadamente 1,5 GB de repo).
- No se declaran capacidades de traducción a otros idiomas, ni de reconocimiento de hindi, ni de salida con marcas de tiempo, ni de diarización de hablantes.
- No se documentan capacidades de tool calling, agentes, visión, audio multilingüe ni modo de razonamiento.

## Casos de uso

- Transcripción de llamadas de atención al cliente: los centros de soporte con agentes o clientes de origen indio pueden transcribir conversaciones en inglés con acento hindi reduciendo el WER frente a Whisper medium.en, y encadenar el texto a sistemas de análisis de sentimiento o extracción de motivos de contacto.
- Subtitulado de reuniones y videoconferencias: integrado en un pipeline con detección de actividad de voz y fragmentación en ventanas de 30 s, permite generar subtítulos en directo o diferido para equipos distribuidos entre India y países hispanohablantes que trabajan en inglés.
- Generación de actas y resúmenes de reuniones: al mejorar la precisión de la transcripción, reduce los errores que arrastran los resúmenes automáticos posteriores, especialmente en nombres propios y terminología técnica pronunciados con acento.
- Postproducción audiovisual y subtitulado para plataformas: transcripción de entrevistas, pódcast o vídeos con ponentes indios para generar ficheros SRT antes de una revisión humana; el CER del 1,30% implica pocos errores a nivel de carácter.
- Transcripción de material educativo: cursos y tutoriales en inglés impartidos por docentes con acento hindi, donde el modelo puede alimentar índices de búsqueda o apuntes automáticos.
- Asistentes de voz y comandos hablados: aplicaciones de dictado o control por voz para usuarios que hablan inglés con acento hindi, desplegadas en local sobre GPU de gama media o incluso CPU por el reducido tamaño del modelo.
- Analítica de contact center a escala: transcripción por lotes de grabaciones para métricas de calidad, cumplimiento y palabras clave, con coste de cómputo bajo al ser un modelo de menos de 800M de parámetros.
- Investigación en adaptación de acentos: sirve como punto de comparación reproducible para estudiar el efecto de LoRA con distintos rangos y volúmenes de datos en tareas de ASR con acento.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el split de test de habla leída y limpia del subconjunto hindi de L2-ARCTIC:

| Modelo | WER (test) | CER (test) |
|---|---|---|
| Este modelo (`whisper-medium-en-hindi-accent`) | 2,64% | 1,30% |
| `openai/whisper-medium.en` (zero-shot) | 4,54% | 2,07% |
| `openai/whisper-large-v3-turbo` (zero-shot) | 3,94% | 2,07% |

El autor declara una reducción relativa del WER de aproximadamente el 41,9% frente a `whisper-medium.en` en zero-shot. No se han publicado resultados adicionales de otros benchmarks (por ejemplo, en el leaderboard de ASR de Hugging Face, pese a llevar la etiqueta `hf-asr-leaderboard`), ni evaluaciones independientes, ni métricas sobre habla espontánea, ruido o dominio telefónico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en FP16 solo para los pesos, más el espacio de activaciones; en la práctica cabe holgadamente en GPUs con 4 GB o más. En FP32 se situaría en torno a 3 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM, como RTX 3060, RTX 4060, RTX 2070 o superiores. En el extremo profesional, A100 o H100 resultan innecesarias para inferencia individual, aunque permiten lotes grandes y alto throughput.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con 4 GB o más, e incluso en GPU integradas con memoria compartida.
- Ejecución en CPU: viable, con mayor latencia; el autor documenta el parámetro `device="cpu"` en el pipeline.
- Opciones de despliegue: `transformers` con `pipeline` (método recomendado por el autor) o con `WhisperForConditionalGeneration` y `device_map="auto"`. No se documenta compatibilidad oficial con vLLM, TGI u Ollama para este modelo. El uso con `faster-whisper`, `whisper.cpp` o CTranslate2 requeriría una conversión a los formatos correspondientes que el autor no proporciona.
- Latencia y throughput estimados: no disponible. El autor no publica tiempos de inferencia ni métricas de RTF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (test L2-ARCTIC hindi) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Grenmango/whisper-medium-en-hindi-accent` | 763.856.896 | Ventanas de 30 s | 2,64% | Apache-2.0 | Hugging Face, safetensors, 0 descargas |
| `openai/whisper-medium.en` | 769M (según el autor de la ficha) | Ventanas de 30 s | 4,54% | No indicada en la información disponible | Hugging Face |
| `openai/whisper-large-v3-turbo` | No disponible en la información proporcionada | No disponible en la información proporcionada | 3,94% | No indicada en la información disponible | Hugging Face |

La comparación debe interpretarse con cautela: las tres cifras de WER y CER proceden de la misma evaluación del autor sobre habla leída del corpus L2-ARCTIC, no de un benchmark independiente ni de una evaluación con habla espontánea. Los modelos de OpenAI se evalúan en zero-shot, mientras que este modelo se ha ajustado precisamente sobre el subconjunto de test correspondiente al mismo corpus.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: 4.071 enunciados, unas 3,5 horas y solo cuatro hablantes, lo que implica un riesgo alto de sobreajuste a esas voces, micrófonos y condiciones de grabación.
- Evaluación sobre el mismo corpus y tipo de habla que el entrenamiento (lectura de frases, señal limpia); no hay evidencia de rendimiento en habla espontánea, conversaciones solapadas, ruido de fondo, telefonía o audio de baja calidad.
- Solo inglés: el modelo no transcribe hindi ni traduce; su propósito es el inglés con acento hindi.
- Puede degradarse con otros acentos del inglés (por ejemplo, hispanohablante, chino o árabe) y con hablantes nativos de inglés, ya que el ajuste es estrecho de dominio.
- Riesgo de alucinación: como el resto de la familia Whisper, puede generar repeticiones o texto plausible en tramos con silencio, música o ruido; se recomienda aplicar detección de actividad de voz antes de la transcripción y revisar las salidas en producción.
- Sin validación independiente: cero descargas y cero likes en el momento de la consulta, sin resultados publicados en el leaderboard de ASR de Hugging Face, por lo que las cifras de WER y CER no están verificadas por terceros.
- Licencia Apache-2.0 declarada, que permite uso comercial; conviene verificar la licencia del modelo base `openai/whisper-medium.en` y conservar la atribución correspondiente.
- Sin información sobre el límite de tokens de salida por ventana ni sobre comportamiento en ventanas muy densas en texto, lo que puede provocar truncamientos en fragmentos con locución rápida.
- Los pesos son FP16 fusionados; no hay versiones cuantizadas publicadas, de modo que quien necesite INT8 o GGUF deberá generarlas por su cuenta y validar la pérdida de precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grenmango/whisper-medium-en-hindi-accent
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Corpus L2-ARCTIC: https://psi.engr.tamu.edu/l2-arctic-corpus/
- Variante vietnamita: https://huggingface.co/Grenmango/whisper-medium-en-vi-accent
- Variante árabe: https://huggingface.co/Grenmango/whisper-medium-en-arabic-accent
- Variante china: https://huggingface.co/Grenmango/whisper-medium-en-chinese-accent
- Variante coreana: https://huggingface.co/Grenmango/whisper-medium-en-korean-accent
- Variante española: https://huggingface.co/Grenmango/whisper-medium-en-spanish-accent
- Variante personalizada (HQTV): https://huggingface.co/Grenmango/whisper-medium-en-vi-hqtv-personalized
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo; las entradas devueltas por el buscador no guardan relación con el modelo ni con ASR.
