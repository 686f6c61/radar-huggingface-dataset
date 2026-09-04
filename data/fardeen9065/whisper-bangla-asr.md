# Fardeen9065/whisper-bangla-asr

## Resumen

Fardeen9065/whisper-bangla-asr es un pipeline de inferencia y evaluación para reconocimiento automático del habla (ASR) en bengalí (bn) y en banglish, el código mezclado de bengalí e inglés. Lo desarrolla Fardeen9065 y se apoya en el checkpoint bengaliAI/tugstugi_bengaliai-asr_whisper-medium, un modelo Whisper-medium de OpenAI fine-tuned para bengalí. A diferencia de un modelo fine-tuned nuevo, este proyecto proporciona un script (run.py) que transcribe archivos de audio y evalúa el rendimiento WER/CER sobre conjuntos de datos locales. La relevancia del modelo radica en que el ASR para bengalí y especialmente para banglish es un área poco cubierta, y este pipeline ofrece una herramienta práctica para investigar y evaluar esa capacidad. La arquitectura subyacente es Whisper-medium, un transformer encoder-decoder con aproximadamente 769 millones de parámetros y una ventana de audio de 30 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-medium (transformer encoder-decoder) |
| Parametros totales | ~769M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos por ventana de audio (con chunking por silencio para audios mas largos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bengali (bn), ingles (en), incluido codigo mezclado banglish |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos descargados automaticamente, ~3 GB) |

## Arquitectura y entrenamiento

El modelo base es Whisper-medium, un transformer encoder-decoder con decodificacion autoregresiva, entrenado originalmente por OpenAI en 680.000 horas de audio multilingue y multitarea. El checkpoint bengaliAI/tugstugi_bengaliai-asr_whisper-medium es una adaptacion fine-tuned de Whisper-medium para el corpus bengali asr_bengali. El pipeline Fardeen9065 no entrena ni modifica los pesos; en su lugar, anade una capa de preprocesamiento: un chunking consciente de silencios que divide el audio en segmentos naturales de pausa en lugar de intervalos fijos. Esta tecnica reduce errores en los limites de palabra y mitiga la alucinacion en segmentos silenciosos.

El repositorio tambien incluye funciones de evaluacion que calculan WER y CER con la libreria jiwer, y un modo de uso directo con la libreria transformers. La hoja de ruta del autor contempla un benchmark etiquetado para banglish, un fine-tuning especifico con pesos ajustados y una evaluacion a mayor escala sobre el split completo de asr_bengali, pero ninguna de estas tareas esta completada todavia.

## Capacidades

- Transcripcion de audio en bengali estandar y en banglish (codigo mezclado bengali-ingles).
- Reconocimiento automatico del habla en archivos .flac y .wav, con soporte para audios mas largos de 30 segundos mediante chunking por silencio.
- Evaluacion integrada de WER y CER sobre conjuntos de datos etiquetados locales, sin necesidad de descargar el dataset.
- Generacion de transcripciones en texto plano y desglose de resultados por ejemplo en CSV.
- Uso directo mediante la API de transformers (AutoModelForSpeechSeq2Seq) para integracion en aplicaciones personalizadas.
- No incluye capacidades de tool calling, vision, generacion de texto ni razonamiento simbolico; es exclusivamente un modelo de reconocimiento del habla.

## Casos de uso

- Transcripcion de reuniones en bengali: el script run.py procesa grabaciones y produce transcripciones con chunking por pausas, util para actas y documentacion.
- Subtitulado de videos y podcasts bengalies: el pipeline transcribe clips de hasta 30 segundos; para audios largos, el chunking por silencio permite procesar el contenido completo.
- Analisis de llamadas de atencion al cliente: al reconocer banglish, el modelo puede transcribir conversaciones donde se mezclan bengali e ingles, habitual en el sector servicios en Bangladesh.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en bengali e ingles para contenido audiovisual, con una precision medida en 25.81% de WER en el subconjunto evaluado.
- Investigacion linguistica sobre code-switching: el pipeline permite evaluar WER/CER sobre conjuntos locales etiquetados, facilitando el estudio de la mezcla bengali-ingles.
- Evaluacion comparativa de modelos ASR: run.py incluye un modo de evaluacion que mide WER y CER sobre un dataset local (asr_bengali), lo que permite comparar este pipeline con otros modelos.
- Procesamiento de archivos de audio en entornos academicos: el modelo transcribe grabaciones de campo y entrevistas en bengali estandar, aunque el rendimiento en dialectos regionales no ha sido evaluado.

## Benchmarks y rendimiento

La informacion disponible incluye una evaluacion del modelo base (bengaliAI/tugstugi_bengaliai-asr_whisper-medium) sobre un subconjunto de 10 ejemplos del dataset asr_bengali, usando el chunking por silencio del pipeline. No se han publicado benchmarks especificos del pipeline sobre datos banglish; el autor indica que estan en curso.

| Modelo | Conjunto de prueba | Ejemplos | WER | CER |
|---|---|---|---|---|
| bengaliAI/tugstugi_bengaliai-asr_whisper-medium (base) | asr_bengali | 10 | 25.81% | 8.56% |
| Pipeline Fardeen9065 en datos banglish | proximamente | — | — | — |

## Requisitos de hardware

- Los pesos del modelo ocupan aproximadamente 3 GB en disco; se descargan automaticamente en la primera ejecucion de run.py.
- En CPU, transcribir 1 minuto de audio tarda entre 3 y 5 minutos, segun el autor.
- No se proporcionan requisitos de VRAM ni GPU recomendadas. Para Whisper-medium (~769M de parametros), una estimacion tecnica razonable es de 2 a 3 GB de VRAM en FP16, pero el autor no ha confirmado estos valores.
- El modelo se puede desplegar mediante el script run.py (Python) o integrando con transformers en un entorno PyTorch. No se mencionan vLLM, Ollama, TGI ni otras plataformas de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | WER (subset 10) |
|---|---|---|---|---|---|
| Fardeen9065/whisper-bangla-asr | ~769M | 30 s (con chunking) | bn, en | MIT | 25.81% (del base) |
| bengaliAI/tugstugi_bengaliai-asr_whisper-medium | ~769M | 30 s | bn, en | MIT | 25.81% |
| openai/whisper-medium | ~769M | 30 s | 99+ | MIT | no disponible |

## Limitaciones y advertencias

- No existe un benchmark de banglish: el autor ha verificado el soporte manualmente, pero no ha publicado metricas WER/CER para este caso.
- La evaluacion actual se limita a 10 ejemplos, por lo que las metricas no son representativas ni estadisticamente robustas.
- El rendimiento en dialectos regionales del bengali no ha sido evaluado.
- Como en todos los modelos Whisper, los segmentos de silencio pueden provocar texto alucinado; el pipeline intenta mitigarlo con deteccion de silencios, pero no lo elimina.
- La velocidad en CPU es baja (3-5 minutos por minuto de audio), lo que dificulta el procesamiento en tiempo real.
- No se proporcionan cuantizaciones ni optimizaciones para despliegue en produccion.
- Este proyecto no es un modelo fine-tuned nuevo: reutiliza el checkpoint base, por lo que cualquier limitacion del modelo base se hereda. Los pesos ajustados especificamente para banglish estan en la hoja de ruta, pero aun no disponibles.

## Enlaces

- https://huggingface.co/Fardeen9065/whisper-bangla-asr
- https://huggingface.co/bengaliAI/tugstugi_bengaliai-asr_whisper-medium
- https://huggingface.co/openai/whisper-medium
- https://github.com/HarunRRayhan/bangla-asr-whisper-cpp (recurso relacionado para despliegue con whisper.cpp)
