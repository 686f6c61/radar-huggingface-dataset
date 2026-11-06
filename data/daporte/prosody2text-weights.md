# Daporte/prosody2text-weights

## Resumen

Prosody2text es un modelo experimental de reconocimiento de voz que reconstruye texto a partir exclusivamente de dos rasgos prosódicos: la frecuencia fundamental (f0) interpolada y la intensidad, ambas muestreadas a 200 Hz. No utiliza contenido fonético en ninguna etapa del pipeline: la única información de entrada es cómo varió el tono y cuál fue el volumen de la emisión. El modelo transforma esas dos señales en un espectrograma mel y, a partir de ese mel, genera la transcripción mediante un Whisper-medium ajustado.

Lo desarrolla el usuario Daporte y se distribuye como pesos de inferencia en Hugging Face, con licencia MIT y un tamaño de repositorio de 3,1 GB. La arquitectura combina un conformer (45 MB) que mapea f0 e intensidad a mel, y un Whisper-medium (3,1 GB) afinado sobre mels predichos por prosodia. El repositorio incluye además el tokenizador original de Whisper-medium y el código de modelado propio, por lo que requiere `trust_remote_code=True`.

Su relevancia es fundamentalmente de investigación: permite comprobar empíricamente cuánta información lingüística reside en la prosodia y sirve como banco de pruebas para estudiar la relación entre contorno entonativo, intensidad y contenido léxico. No está pensado como sistema ASR de producción, sino como artefacto reproducible de un artículo científico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline conformer (f0 + intensidad a mel) + Whisper-medium ajustado (mel a texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona fp16 y fp32 en la evaluacion) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, con `custom_code`) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas acopladas. La primera es un conformer de 45 MB que recibe dos señales físicas —f0 interpolada en Hz e intensidad en dB— sobre una rejilla de 200 Hz y produce un espectrograma mel. La segunda es un Whisper-medium (3,1 GB) ajustado específicamente sobre mels generados por prosodia, no sobre mels acústicos reales. El repositorio separa ambos checkpoints (`conformer/` y `whisper/`) y permite cargar solo el conformer con `whisper=False`, reduciendo la descarga a 45 MB.

La extracción de rasgos no es intercambiable con alternativas plausibles: los ajustes de yaapt, el zero-padding de media trama, el recorte de seis tramas y dos clamps concretos desplazan el contorno, y el conformer solo vio una combinación de ellos. El archivo `speech.py` encapsula esa configuración exacta. La normalización a la escala interna del modelo se aplica dentro del pipeline, de modo que aplicarla de nuevo produce un mel verosímil pero incorrecto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento de voz a partir exclusivamente de prosodia (f0 e intensidad), sin contenido fonético.
- Predicción de espectrograma mel a partir de contornos de pitch y volumen.
- Generación de hipótesis con beam search de tamaño 10, devolviendo la hipótesis elegida y las diez candidatas.
- Aceptación directa de contornos externos en unidades físicas (Hz y dB sobre rejilla de 200 Hz).
- Evaluación sobre datasets de Hugging Face con audio y transcripción mediante `evaluate_dataset.py`.
- Detección de ausencia de habla con salida de reserva (`fallback=True`).
- No se documenta soporte de tool calling, agentes, visión, audio adicional ni modo thinking.

## Casos de uso

- Investigación sobre prosodia y léxico: permite medir cuánta información de palabras transporta únicamente el contorno entonativo y la intensidad, comparando WER sobre corpus controlados.
- Reproducción de resultados de artículo: el script `evaluate_dataset.py` ejecuta el pipeline sobre cualquier dataset de Hugging Face con columna de audio y transcripción, con nombres de campo compatibles con las ejecuciones publicadas para hacer join por `id`.
- Evaluación comparativa de extractores de f0: al fijar una configuración concreta de yaapt y normalización, sirve para estudiar la sensibilidad del pipeline a variaciones en la extracción de contorno.
- Docencia y divulgación: la demo interactiva permite dibujar un contorno de pitch y observar la transcripción resultante, ilustrando la relación entre entonación y texto.
- Análisis de errores por tipo: la salida imprime el desglose de sustituciones, deleciones e inserciones, útil para caracterizar fallos de longitud frente a fallos léxicos.
- Prototipado de interfaces voz-a-texto basadas en gesto o dibujo: el espacio de Hugging Face convierte trazos sensibles a la presión en contornos y de ahí a texto.
- Validación de pipelines ASR en CPU/GPU: con Whisper a beam 10 se documenta ~1 s por emisión en RTX 3090 frente a ~20 s en CPU, y `--fp16` reduce VRAM y acelera 1,8× con transcripciones idénticas a fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas operativas: aproximadamente 1 s por emisión en RTX 3090 con beam 10, unos 20 s en CPU, y una aceleración de 1,8× con fp16 manteniendo transcripciones idénticas. El WER se calcula sobre el corpus completo (errores totales sobre palabras de referencia totales), con normalización de puntuación y mayúsculas, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint completo son 3,1 GB en safetensors, y `--fp16` reduce el consumo a la mitad.
- Solo conformer: 45 MB de descarga, apto para inspeccionar el mel predicho sin cargar Whisper.
- GPU recomendadas: se documenta funcionamiento en RTX 3090; no se especifican A100, H100 ni otras.
- GPU de consumo: el tamaño del checkpoint (3,1 GB) sugiere que cabe en GPUs consumer con suficiente VRAM, aunque no se detallan modelos concretos.
- Despliegue: transformers con `trust_remote_code=True`; se mencionan dependencias `torch`, `numpy`, `scipy`, `safetensors`, `amfm-decompy==1.0.12.2`, `praat-parselmouth`, `datasets`, `jiwer` y `soundfile`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~1 s/emisión en RTX 3090 (beam 10) y ~20 s/emisión en CPU; fp16 aporta 1,8× adicional.
- Nota de entorno: si se detecta `whisper: cpu` en una máquina con GPU, suele deberse a que `libcuda.so.1` no está en la ruta del cargador dinámico; el modelo detecta el caso e imprime la solución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prosody2text | no disponible (conformer 45 MB + Whisper-medium 3,1 GB) | no disponible | f0 + intensidad a 200 Hz | MIT | Hugging Face, código propio |
| Whisper-medium (estándar) | no disponible en la información | no disponible | audio completo | MIT | Hugging Face, transformers |
| Alternativas ASR basadas en prosodia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables directos en la información proporcionada; la comparación con Whisper-medium se limita a que este último es la base ajustada del pipeline.

## Limitaciones y advertencias

- El modelo no usa contenido fonético: la hipótesis suele acertar la longitud de la emisión pero fallar las palabras, un modo de error distinto de omitir o inventar la mayor parte del enunciado.
- La extracción de rasgos está fuertemente acoplada: cambiar ajustes de yaapt, padding, recorte o clamps altera el contorno y degrada el resultado, ya que el conformer solo vio una combinación concreta.
- La normalización interna no debe aplicarse dos veces; hacerlo produce un mel verosímil pero incorrecto.
- Riesgo de alucinación y de salida de reserva: existe un modo `fallback=True` para ausencia de habla, lo que implica que el modelo puede devolver plantillas genéricas en lugar de transcripción real.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Licencia MIT permite uso comercial, pero el estado experimental y la ausencia de benchmarks publicados desaconsejan su uso en producción sin validación propia.
- El repositorio contiene solo archivos de inferencia; no incluye estado de optimizador ni utilidades de entrenamiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisar los archivos de modelado antes de desplegarlo.

## Enlaces

- Pesos en Hugging Face: https://huggingface.co/Daporte/prosody2text-weights
- Demo interactiva (dibujo de contorno): https://huggingface.co/spaces/Daporte/Prosody2text
