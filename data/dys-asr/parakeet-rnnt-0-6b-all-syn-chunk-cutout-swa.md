# dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-swa

## Resumen

Parakeet RNN-T 0.6B (SWA) es un modelo de reconocimiento automático del habla desarrollado por el colectivo `dys-asr` para transcribir habla atípica, en concreto habla disártrica y otros trastornos del habla. El modelo parte de `extraordinarylab/parakeet-unified-en-0.6b`, un transducer Parakeet de unos 618 millones de parámetros, y se afina sobre los corpus del Speech Accessibility Project (SAPC-1 y SAPC-2) junto con datos sintéticos generados con CosyVoice3.

La aportación concreta de este checkpoint no es arquitectónica sino de entrenamiento: sobre el modelo ya afinado `dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout` se ejecutan cinco épocas adicionales con un scheduler de tasa de aprendizaje cíclico triangular (de 5e-6 a 3e-5 y vuelta, un ciclo por época) y se promedian con pesos iguales los cinco snapshots exportados al final de cada ciclo. El resultado es una media de pesos (stochastic weight averaging) de 987 tensores, que mejora a cada uno de los snapshots individuales y al checkpoint de partida en la partición de desarrollo reservada.

Es relevante ahora porque ataca un problema de accesibilidad con pocos modelos abiertos disponibles: el reconocimiento de habla disártrica, donde los sistemas ASR convencionales degradan mucho su precisión. El modelo es de vía restringida (constrained track): todo su entrenamiento proviene de los corpus del reto y de datos sintéticos, sin datos externos, y solo soporta inglés. Su licencia es un acuerdo de uso específico del Speech Accessibility Project, no una licencia abierta estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet RNN-T (transducer): codificador, predictor y red conjunta |
| Parametros totales | 618.314.241 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana fija; los registros de entrenamiento se filtraron al rango de 0,5 a 45 s de audio y 200 tokens de etiqueta |
| Tipos de cuantizacion | No documentados por el autor; el repositorio publica pesos en safetensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `speech-accessibility-project-dua` (`license: other`), con enlace a los terminos del Speech Accessibility Project |
| Formato de pesos | Safetensors (987 tensores promediados), cargable con `transformers >= 5.9` |
| Tamano del repositorio | 2,5 GB |
| Audio de entrada | 16 kHz, mono |
| Clase de modelo | `ParakeetForRNNT`, `AutoProcessor` |
| Tarea declarada | `automatic-speech-recognition` (tambien etiquetado como `feature-extraction`) |

## Arquitectura y entrenamiento

El modelo es un transducer RNN-T de la familia Parakeet: un codificador acústico, un predictor de etiquetas autorregresivo y una red conjunta que produce la distribución sobre el vocabulario en cada paso. El checkpoint publicado es una media de pesos con pesos uniformes de cinco snapshots (987 tensores). Los tensores en coma flotante se promedian en `float64` y se vuelven a convertir a su precisión original; el contador `num_batches_tracked` se propaga tomando el máximo en lugar de promediarse. Las estadísticas de BatchNorm se dejaron con los valores promediados de forma deliberada: al recalcularlas sobre 2.000 lotes de entrenamiento con `momentum=None`, el modelo empeoró (CER 6,154 % frente a 5,964 %), por lo que se publicaron las estadísticas promediadas.

La receta base consta de diez épocas sobre dieciséis GH200 con lote efectivo 32 (2 por dispositivo), AdamW con tasa 1e-4 y scheduler tri-stage (10 % de calentamiento, 40 % de mantenimiento), decaimiento de pesos 0,01, layerdrop 0,05, recorte de gradiente 1,0, `bf16`, semilla 42 y 144.750 pasos de optimizador. La aumentación es perturbación de velocidad en línea entre 0,8 y 1,2, SpecAugment (5 % del eje temporal en tramos de 10 fotogramas y 40 % del eje mel en tramos de 27 bins) y SpecCutout (dos rectángulos de 20x20). Sobre esa base se ejecutan cinco épocas más con scheduler triangular (`--learning-rate 3e-5`, `--lr-min 5e-6`, periodo de ciclo fijado a una época, 14.475 actualizaciones por ciclo), manteniendo intacto el resto de la receta.

Los datos de entrenamiento son 250.014 registros de SAPC-1 (entrenamiento y desarrollo), 153.500 de SAPC-2 (entrenamiento), 55.988 muestras de habla sintética generada con CosyVoice3 y 8.933 fragmentos alineados por fuerza extraídos de grabaciones demasiado largas: 468.435 registros antes del filtrado y 463.177 tras aplicar los filtros de 0,5 a 45 s y 200 tokens de etiqueta. La partición de desarrollo reservada (`sapc2_dev_heldout.jsonl`, 17.582 clips) no tiene intersección con los manifiestos de entrenamiento, verificado comparando rutas de fichero. No se documenta uso de RLHF ni DPO, algo esperable en un sistema ASR. Como caveat de procedimiento, el ciclo 5 se produjo con un reinicio desde los pesos del ciclo 4 tras fallar el proceso a 75 actualizaciones del final de la época, por lo que no arrastra momento del optimizador igual que los ciclos 2 a 4.

## Capacidades

- Reconocimiento automático del habla en inglés, con foco en habla disártrica y habla con trastornos.
- Decodificación por transducer (RNN-T) con generación de secuencias de tokens y decodificación por lotes mediante el procesador.
- Robustez a variaciones de velocidad del habla gracias a la perturbación de velocidad en entrenamiento (factor 0,8 a 1,2) y a SpecAugment/SpecCutout.
- Manejo de grabaciones largas mediante fragmentación: los registros de entrenamiento cubren de 0,5 a 45 s.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio-vision ni procesamiento de audio más allá de la transcripción.
- No dispone de modo de razonamiento explícito (thinking mode).
- Multilingüismo: no, únicamente inglés declarado en la model card.

## Casos de uso

- Transcripción asistida para personas con disartria: el modelo convierte voz con articulación degradada en texto, lo que permite usar dictado y notas de voz en entornos académicos o laborales con una tasa de error muy inferior a la de un ASR genérico entrenado solo con habla típica.
- Comunicación aumentativa y alternativa (CAA): integrado en un dispositivo de CAA, transcribe el habla del usuario y la convierte en texto o en voz sintetizada para terceros, aprovechando que el modelo tolera pronunciaciones irregulares.
- Evaluación clínica del habla: transcripción sistemática de sesiones de logopedia para calcular métricas objetivas de inteligibilidad a lo largo del tiempo, con las mismas condiciones de decodificación entre sesiones para que las medidas sean comparables.
- Anotación de corpus clínicos de habla atípica: preetiquetado automático de grabaciones para que revisores humanos solo corrijan errores, reduciendo el coste de construir nuevos conjuntos de datos etiquetados en el dominio.
- Subtitulado en directo para accesibilidad: transcripción de charlas, clases o reuniones donde participan hablantes con trastornos del habla, con audio a 16 kHz mono (requiere remuestreo previo del flujo de captura).
- Investigación en reconocimiento de habla atípica: sirve como línea base de vía restringida sobre SAPC-1 y SAPC-2, útil para comparar técnicas de aumento de datos o de promediado de pesos bajo el mismo protocolo de evaluación.
- Atención al cliente con operadores con disartria o con acentos muy marcados dentro del dominio de entrenamiento: transcripción de llamadas para generar registros textuales y búsqueda posterior sobre las transcripciones.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la partición de desarrollo reservada (4.000 enunciados), medidos todos en el mismo trabajo:

| Checkpoint | CER | WER |
|---|---:|---:|
| Este modelo (media de cinco ciclos) | 5,964 % | 9,706 % |
| Mejor snapshot individual (ciclo 1) | 6,036 % | 9,889 % |
| Checkpoint de partida | 6,121 % | 9,939 % |
| Misma media con BatchNorm recalculado | 6,154 % | 9,993 % |

Ningún snapshot individual superó al checkpoint de partida: el rango de los cinco está entre 6,01 % y 6,21 % en la métrica de entrenamiento, de modo que la mejora procede íntegramente del promediado de pesos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a un modelo ASR, y el autor no aporta comparaciones con otros sistemas ASR.

## Requisitos de hardware

- Estimación de VRAM para inferencia a partir del número de parámetros (618,3 M), sin datos oficiales del autor: en `float32` unos 2,5 GB de pesos; en `bfloat16` unos 1,25 GB; en cuantización de 8 bits unos 0,6 GB. Habría que sumar el consumo del codificador, el búfer de audio y el decodificador, no cuantificado en la información disponible.
- Alrededor de 1,3 GB en `bfloat16` es un tamaño manejable para GPU de consumo: cabe sin problema en una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090 e incluso en tarjetas de 6-8 GB con margen, aunque el autor no publica cifras de consumo real.
- GPU de centro de datos (A100, H100, GH200) sobradamente suficientes; el entrenamiento se realizó con 16 GH200, pero la inferencia no requiere ese perfil.
- Despliegue documentado: `transformers >= 5.9` con `ParakeetForRNNT` y `AutoProcessor`, incluyendo `model.generate()` y `processor.batch_decode()`. No se documentan otras rutas de despliegue (vLLM, TGI, llama.cpp, Ollama, ONNX Runtime, TensorRT) en la información disponible.
- Es obligatorio usar `transformers >= 5.9`; la línea 4.x no puede cargar el modelo.
- Latencia y throughput: no disponibles. El autor indica únicamente que la decodificación es lenta en comparación con un modelo CTC.
- Requisito de entrada: audio a 16 kHz mono; cualquier otro formato debe remuestrearse y convertirse a mono antes del procesado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | CER (dev reservado) | WER (dev reservado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-swa` (este) | 618.314.241 | Registros de 0,5 a 45 s en entrenamiento | 5,964 % | 9,706 % | `speech-accessibility-project-dua` | HuggingFace, safetensors, `transformers >= 5.9` |
| `dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout` (checkpoint de partida) | No disponible en la informacion (misma familia, ~0,6 B) | No disponible | 6,121 % | 9,939 % | No disponible en la informacion | HuggingFace |
| `extraordinarylab/parakeet-unified-en-0.6b` (modelo base) | No disponible en la informacion (denominado 0,6 B) | No disponible | No disponible | No disponible | No disponible en la informacion | HuggingFace |

No se dispone de datos verificados de otros sistemas ASR comparables (por ejemplo, variantes de la familia Parakeet de NVIDIA o modelos Whisper) que permitan una comparación de rendimiento en este dominio; la información proporcionada solo cubre los tres checkpoints anteriores.

## Limitaciones y advertencias

- Una sola ejecución con una sola semilla: no hay estimación de varianza. El propio autor advierte que las diferencias reportadas (por ejemplo, 5,964 % frente a 6,121 % de CER) son probablemente menores que la dispersión que mostraría un barrido de semillas, y que no deben interpretarse como una clasificación de métodos.
- Licencia no estándar (`speech-accessibility-project-dua`, `license: other`): es un acuerdo de uso del Speech Accessibility Project, no una licencia de código abierto. Antes de cualquier uso comercial hay que revisar y aceptar los términos en el enlace indicado; la información disponible no detalla si el uso comercial está permitido.
- Requiere `transformers >= 5.9`; no es cargable con la línea 4.x, lo que puede romper entornos de producción con versiones fijadas.
- Decodificación lenta en comparación con un modelo CTC, según el propio autor.
- Modelo de vía restringida (constrained track): todo el entrenamiento procede de SAPC-1, SAPC-2 y habla sintética de CosyVoice3, sin datos externos. Esto limita la generalización fuera de la distribución de esos corpus.
- Solo inglés. No hay soporte multilingüe declarado.
- No se documentan sesgos específicos, pero al entrenar sobre corpus clínicos de habla atípica y datos sintéticos, el comportamiento fuera de ese dominio (habla típica, otros acentos, ruido de fondo, audio telefónico) no está caracterizado.
- Riesgo de alucinación e inserción de tokens: es un comportamiento conocido en modelos transducer con habla degradada, y no se documentan medidas específicas para mitigarlo en esta model card.
- El ciclo 5 de la media de pesos se generó con un reinicio desde los pesos del ciclo 4, sin el momento del optimizador de su predecesor, por lo que no se produjo en condiciones idénticas a los ciclos 2 a 4.
- Las estadísticas de BatchNorm se dejaron promediadas y no recalculadas; el autor reconoce que la explicación de por qué funciona mejor así es una conjetura no verificada experimentalmente.
- No se publican medidas de latencia, throughput ni consumo de memoria, lo que dificulta el dimensionamiento de despliegues en producción.
- Requiere audio a 16 kHz mono; cualquier otra frecuencia o número de canales exige preprocesado previo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-swa
- Checkpoint de partida: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout
- Modelo base: https://huggingface.co/extraordinarylab/parakeet-unified-en-0.6b
- Corpus SAPC-1: https://huggingface.co/datasets/dys-asr/sapc1
- Corpus SAPC-2: https://huggingface.co/datasets/dys-asr/sapc2
- Licencia y términos del Speech Accessibility Project: https://speechaccessibilityproject.beckman.illinois.edu/
- Speech Accessibility Project (Universidad de Illinois): https://speechaccessibilityproject.beckman.illinois.edu/
