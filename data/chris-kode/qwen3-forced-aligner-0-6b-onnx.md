# Chris-Kode/qwen3-forced-aligner-0.6b-onnx

## Resumen

Qwen3-ForcedAligner-0.6B-ONNX es una conversión a ONNX con cuantización de 4 bits del modelo Qwen3-ForcedAligner-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. El modelo resuelve una tarea muy concreta: el alineamiento forzado (forced alignment) entre audio y transcripción, es decir, determinar en qué instante exacto del audio se pronuncia cada palabra de un texto dado. No es un modelo de transcripción libre, sino una herramienta que asume que ya se dispone del texto y devuelve las marcas temporales.

La versión publicada por Chris-Kode mantiene la licencia Apache-2.0 del original y añade tres cambios técnicos relevantes: exportación a ONNX (opset 18), extracción de características log-mel integrada en el propio grafo (de modo que la entrada es audio PCM crudo) y cuantización de pesos a 4 bits con `MatMulNBitsQuantizer` de ONNX Runtime. El resultado es un único fichero de unos 589 MB, frente al tamaño mayor del modelo en fp32.

Su relevancia práctica está en el despliegue: al ser un modelo de 0,6 mil millones de parámetros en formato ONNX int4, puede ejecutarse en CPU con ONNX Runtime sin depender de PyTorch, lo que facilita integrarlo en pipelines de subtitulado, anotación fonética o sincronización de transcripciones en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-ForcedAligner-0.6B; encoder de audio con atención sobre el clip completo en la ruta CPU) |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (4 bits, block size 32, simétrico, aplicado a pesos `MatMul` y al embedding de tokens vía `Gather`) |
| Idiomas soportados | en, es, fr, de, it, pt, ru, zh, ja, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18), fichero único `qwen3-forced-aligner-0.6b-q4.onnx` |

## Arquitectura y entrenamiento

El modelo base es un transformer de 0,6 mil millones de parámetros especializado en alineamiento forzado. La exportación envuelve la ruta de ejecución en CPU del modelo original, en la que el encoder de audio atiende sobre el clip completo en lugar de hacerlo en ventanas de 8 segundos. La extracción de características estilo Whisper (log-mel) se ha incorporado dentro del grafo ONNX, de forma que la entrada `samples` son muestras de audio mono a 16 kHz en f32 y la entrada `text_ids` son los identificadores de token de las palabras, cada una seguida de dos tokens `<timestamp>` (id 151705).

El proceso de construcción aplica optimizaciones básicas de ONNX Runtime (plegado de constantes, eliminación de formas obsoletas) y reescribe las operaciones `Gemm` como `MatMul` + `Add`. La cuantización se realiza con `MatMulNBitsQuantizer` a 4 bits con bloque de 32 y simetría. No se detalla en la información disponible el volumen de datos de entrenamiento del modelo original, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo base y no se especifican en la model card de esta conversión.

## Capacidades

- Alineamiento forzado palabra a palabra: dado un audio y su transcripción tokenizada, devuelve para cada palabra sus tiempos de inicio y fin en pasos de 80 ms.
- Entrada de audio crudo: la extracción de características log-mel está integrada en el grafo, por lo que no se necesita un preprocesador externo.
- Soporte multilingüe en diez idiomas: inglés, español, francés, alemán, italiano, portugués, ruso, chino, japonés y coreano.
- Reparación de marcas temporales: el modelo original incluye la función `fix_timestamp` para corregir tiempos fuera de orden.
- Ejecución en CPU mediante ONNX Runtime, sin dependencia de PyTorch en inferencia.
- No se documentan capacidades de tool calling, agentes, visión ni audio generativo; el modelo está limitado a la tarea de alineamiento.

## Casos de uso

- Subtitulado sincronizado: partiendo de una transcripción ya revisada, el modelo genera marcas temporales por palabra para producir subtítulos con timing preciso, útil en postproducción donde la transcripción manual es más fiable que la automática.
- Anotación fonética y corpus lingüísticos: en investigación, permite alinear grabaciones con su transcripción ortográfica para obtener corpus con tiempos por palabra, base para estudios de duración, prosodia o fonética acústica.
- Sincronización de audiolibros y podcasts: alineando el texto del guion con el audio se pueden generar capítulos, marcadores o karaoke con resaltado palabra a palabra.
- Verificación de calidad de transcripciones ASR: comparar los tiempos del alineador con los de un sistema ASR permite detectar segmentos mal transcritos o desincronizados en un pipeline de control de calidad.
- Doblaje y localización: el alineamiento por palabra facilita ajustar la duración de locuciones y sincronizar pistas dobladas con el vídeo original.
- Despliegue en entornos sin GPU: al ser un ONNX int4 de 0,6 B ejecutable en CPU con ONNX Runtime, encaja en servicios contenedorizados o dispositivos de borde donde no hay acelerador dedicado.
- Herramientas de aprendizaje de idiomas: resaltado en tiempo real de la palabra que se está pronunciando en un audio, con tiempos de 80 ms de resolución.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Inglés etiquetado a mano (Buckeye + TIMIT, 4.097 palabras), bordes de palabra con error > 100 ms | 6,0 % (fp32: 5,9 %) |
| Comparación con `Qwen3ForcedAligner.align` (fp32 exportado) | Marcas temporales idénticas |
| Comparación del fichero int4 con el original en un clip en inglés | Idéntico |
| Comparación del fichero int4 con el original en un clip en español | Diferencias dentro de un paso de 80 ms en 7 de 66 bordes |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros); los datos anteriores son métricas específicas de precisión del alineamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; el fichero ONNX ocupa 589.447.679 bytes y la ejecución de referencia es en CPU con ONNX Runtime.
- GPU recomendadas: no se especifican en la información disponible; al ser un modelo de 0,6 B en int4, cualquier GPU con soporte de ONNX Runtime (por ejemplo, series RTX o A100/H100) podría ejecutarlo, pero no hay datos publicados de rendimiento.
- ¿Cabe en GPU de consumo? Por tamaño (menos de 0,6 GB de pesos) sí cabría en cualquier GPU de consumo moderna, aunque la model card no documenta pruebas en GPU.
- Opciones de despliegue: ONNX Runtime (versión usada en la construcción: 1.31.1). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Chris-Kode/qwen3-forced-aligner-0.6b-onnx (este) | 0,6 B | no disponible | ONNX int4 | Apache-2.0 | Extracción de features integrada, ejecución CPU |
| Qwen/Qwen3-ForcedAligner-0.6B (base) | 0,6 B | no disponible | safetensors (presumiblemente) | Apache-2.0 | Modelo original; requiere el stack de Qwen |
| Alternativas de alineamiento forzado (Montreal Forced Aligner, WhisperX) | no disponible | no disponible | varios | varias | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otras herramientas de alineamiento en la información disponible.

## Limitaciones y advertencias

- El modelo no transcribe: requiere que el texto de entrada ya esté tokenizado y acompañado de los tokens `<timestamp>`; no sirve como ASR autónomo pese a la etiqueta `automatic-speech-recognition`.
- El tokenizador no está incluido en el repositorio; hay que usar `vocab.json` y `merges.txt` del repositorio original de Qwen.
- La resolución temporal es de 80 ms, lo que limita la precisión en palabras muy cortas o en habla rápida.
- La cuantización int4 introduce pequeñas desviaciones: en la prueba en español, 7 de 66 bordes difirieron en un paso de 80 ms respecto al modelo original.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos multilingües puede heredar sesgos del corpus original; no hay información disponible al respecto.
- Riesgo de alucinación de tiempos: si el texto no coincide con el audio (errores de transcripción, habla solapada, ruido), el alineamiento puede producir marcas incorrectas; se recomienda validar con `fix_timestamp`.
- La licencia Apache-2.0 permite uso comercial, pero se deben mantener los avisos de atribución del modelo original (Alibaba Qwen) conforme a la sección 4(b).
- La reproducibilidad byte a byte depende de versiones concretas de las herramientas (Python 3.13, torch 2.14.1, transformers 4.57.6, qwen-asr 0.0.6, onnx 1.23.2, onnxscript 0.7.2, onnxruntime 1.31.1); otras versiones pueden generar un fichero distinto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chris-Kode/qwen3-forced-aligner-0.6b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio de scripts de construcción: incluido en la carpeta `scripts/` del repositorio (`build.py`, `qwen_wrap.py`, `verify.py`)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
