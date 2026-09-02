# bhaskaro/ainotes-whisper-urdu-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-urdu-q5_1` es una conversión al formato GGML (cuantización q5_1) del modelo `Abdullah17/whisper-small-urdu`, un fine-tuning de Whisper small de OpenAI entrenado específicamente para el reconocimiento automático de voz (ASR) en urdu. El repositorio aporta únicamente la conversión de formato, no un nuevo entrenamiento, y está pensado para su uso en dispositivos con `whisper.cpp`, como teléfonos móviles o sistemas embebidos.

Con un peso de 190 MB, el modelo es significativamente más ligero que el original en float16 y funciona más rápido que el tiempo real en un procesador móvil de gama media (Snapdragon 720G con 4 hilos). La cuantización q5_1 reduce el tamaño a 2,6 veces menos y aumenta la velocidad en 1,34 veces respecto a float16, sin pérdida apreciable de precisión (14,7% frente a 15,9% de WER en hindi). Es relevante porque cubre el urdu, un idioma de bajos recursos que Whisper original no soporta oficialmente, y lo hace en un formato optimizado para despliegue local.

La model card incluye una advertencia crítica: el modelo requiere desactivar la generación de marcas de tiempo (`no_timestamps`), ya que los tokens de timestamp no fueron entrenados durante el fine-tuning y provocan errores graves de segmentación. Con los timestamps activados, el WER sube al 47,5% en hindi, frente al 14,9% con ellos desactivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (encoder-decoder transformer) |
| Parametros totales | No disponible (Whisper small tiene ~244M según arquitectura base, no verificado en la ficha) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q5_1 (GGML), también disponible float16 según la conversión |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (whisper.cpp) |

## Arquitectura y entrenamiento

El modelo base `Abdullah17/whisper-small-urdu` es un fine-tuning de Whisper small de OpenAI sobre datos de habla en urdu. Whisper small sigue la arquitectura encoder-decoder transformer estándar de Whisper, con 12 capas de encoder y 12 de decoder, y fue diseñado originalmente para ASR multilingüe. El fine-tuning se realizó sobre conjuntos de datos de habla en urdu, aunque la model card no especifica el dataset concreto ni el número de tokens de entrenamiento. La conversión a GGML se hizo mediante el script `convert-h5-to-ggml.py` de `whisper.cpp`, primero a float16 y luego cuantizando a q5_1. La tabla de tokens se verificó byte a byte contra la tabla publicada por ggerganov para `ggml-small`, con el fin de evitar errores de vocabulario que producen salidas incorrectas pero fluidas.

Una característica técnica destacable es la advertencia sobre los tokens de timestamp: el fine-tuning se realizó con transcripciones planas y predicción de timestamps desactivada, por lo que esos tokens no están entrenados. `whisper.cpp` confía en ellos para segmentar el audio, lo que provoca que el decodificador deje de seguir el audio y genere texto fluido pero no relacionado. Por ello, se recomienda encarecidamente usar la opción `-nt` (no timestamps) en la inferencia.

## Capacidades

- Reconocimiento automático de voz (ASR) para urdu, transcribiendo audio a texto.
- Funciona en tiempo real en hardware modesto (Snapdragon 720G, 4 hilos) gracias a la cuantización q5_1.
- Compatible con `whisper.cpp`, lo que permite despliegue en CPU, móviles y sistemas embebidos.
- Soporta decodificación greedy y sin marcas de tiempo (opción `no_timestamps`), que es el modo recomendado.
- No incluye capacidades de tool calling, agentes, razonamiento multilingüe ni visión; es un modelo de ASR puro.

## Casos de uso

- Transcripción de notas de voz en urdu: un usuario graba una nota de voz en su teléfono y el modelo la transcribe localmente sin conexión, gracias a su tamaño reducido y velocidad en tiempo real.
- Subtitulado automático de vídeos en urdu: se puede integrar en un pipeline de edición de vídeo para generar subtítulos, usando `whisper.cpp` en un servidor o en una estación de trabajo con CPU.
- Asistente de estudio para estudiantes: la plataforma AiNotes (de donde proviene el nombre del modelo) podría usarlo para transcribir clases o conferencias en urdu y generar apuntes, traducciones o tarjetas de repaso.
- Atención al cliente en urdu: transcripción de llamadas de soporte para análisis posterior, con despliegue en servidores de bajo coste sin GPU.
- Accesibilidad para personas con discapacidad auditiva: conversión de audio de reuniones o eventos en urdu a texto en tiempo real, ejecutable en dispositivos móviles de gama media.
- Archivado de contenido oral: digitalización de entrevistas, podcasts o grabaciones históricas en urdu, con salida en texto plano para búsqueda y análisis.
- Sistema de dictado para aplicaciones médicas o legales: transcripción de dictados en urdu en entornos sin conectividad, con la opción de ejecutarse en un portátil con CPU.

## Benchmarks y rendimiento

La model card reporta mediciones realizadas con `whisper.cpp` sobre 24 clips de FLEURS `ur_pk`, con decodificación greedy y `no_timestamps`:

| Metrica | Valor |
|---|---|
| Word error rate (WER) | 32,6% |
| Character error rate (CER) | 12,3% |

Además, se comparó la cuantización q5_1 con float16 en hindi (64 clips):

| Configuracion | WER |
|---|---|
| q5_1, timestamps desactivados | 14,7% |
| float16, timestamps desactivados | 15,9% |
| q5_1, timestamps activados | 47,5% |
| q5_1, timestamps desactivados (mismo conjunto) | 14,9% |

No se han publicado resultados comparativos con otros modelos de ASR en urdu en la informacion disponible.

## Requisitos de hardware

- Peso del modelo: 190 MB (formato GGML q5_1).
- Inferencia en CPU: funciona en tiempo real en un Snapdragon 720G con 4 hilos (según la model card).
- VRAM estimada: al ser un modelo de 190 MB, cabe en cualquier GPU con más de 1 GB de memoria; en GPUs integradas o tarjetas como la NVIDIA GTX 1050 Ti (4 GB) funcionaría sin problemas.
- GPU recomendadas: no se requiere GPU; una CPU moderna es suficiente. Para despliegue en servidor, cualquier GPU con al menos 2 GB de VRAM es más que suficiente.
- Opciones de despliegue: `whisper.cpp` (línea de comandos `whisper-cli`), que soporta formatos GGML. También se puede convertir a otros formatos si es necesario, pero el formato GGML es el nativo.
- Latencia y throughput: no se proporcionan datos exactos, pero al ser un modelo pequeño y cuantizado, la latencia es inferior al tiempo real en hardware de gama media (según la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (urdu) | Licencia | Formato |
|---|---|---|---|---|---|
| bhaskaro/ainotes-whisper-urdu-q5_1 | No disponible (Whisper small ~244M) | No disponible | 32,6% (FLEURS ur_pk) | Apache 2.0 | GGML q5_1 |
| Abdullah17/whisper-small-urdu | No disponible (Whisper small ~244M) | No disponible | No disponible | Apache 2.0 | PyTorch (Hugging Face) |
| ihanif/whisper-medium-urdu | Whisper medium (~769M) | No disponible | No disponible | Apache 2.0 | PyTorch |
| Abdul145/whisper-medium-urdu-custom | Whisper medium (~769M) | No disponible | No disponible | Apache 2.0 | PyTorch |

Las alternativas de Whisper medium son más grandes y pesadas, pero no se dispone de métricas comparativas en urdu. El modelo q5_1 destaca por su ligereza y velocidad, a costa de una precisión moderada (WER 32,6%). Para uso en producción con más precisión, podría considerarse el modelo medium, pero requiere más recursos.

## Limitaciones y advertencias

- Requiere desactivar los timestamps (`no_timestamps`) obligatoriamente; de lo contrario, el modelo produce texto fluido pero no relacionado con el audio (WER 47,5% en hindi con timestamps activados).
- WER elevado en el conjunto de prueba FLEURS (32,6%), lo que indica una precisión moderada, especialmente en audio con ruido o acentos variados.
- Solo soporta urdu; no es multilingüe.
- No se dispone de información sobre sesgos o alucinaciones específicas, pero al ser un modelo ASR entrenado en un dominio concreto, puede fallar en vocabulario técnico o nombres propios poco comunes.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base está derivado de Whisper (MIT) y del fine-tuning de Abdullah17 (Apache 2.0); se debe mantener la atribución correspondiente.
- El formato GGML es específico de `whisper.cpp`; para otros frameworks (TensorFlow, PyTorch) se necesitaría conversión adicional.
- No se proporcionan datos sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning, por lo que la reproducibilidad es limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bhaskaro/ainotes-whisper-urdu-q5_1
- Modelo base: https://huggingface.co/Abdullah17/whisper-small-urdu
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelo alternativo (whisper-medium-urdu): https://huggingface.co/ihanif/whisper-medium-urdu
- Modelo alternativo (whisper-medium-urdu-custom): https://huggingface.co/Abdul145/whisper-medium-urdu-custom
- Repositorio de fine-tuning de Whisper para urdu y pashto: https://github.com/MuhammadHasnainKayani/whisper-finetune-urdu-pashto
