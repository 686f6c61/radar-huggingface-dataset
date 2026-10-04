# Haopeng/iqra_CROTTC_IF_k3

## Resumen

Iqra CROTTC-IF k3 es un modelo de reconocimiento fonético orientado a la detección de errores de pronunciación (mispronunciation detection, MDD), desarrollado por el usuario Haopeng y publicado bajo licencia Apache 2.0. El modelo toma audio en árabe y devuelve secuencias de fonemas que se utilizan para evaluar la corrección de la recitación. Su caso de uso declarado es la evaluación de recitación coránica (el término "Iqra" remite a la lectura y recitación del Corán), aunque el pipeline registrado es automatic-speech-recognition.

Arquitectónicamente es un sistema híbrido que combina un frontend acústico basado en Microsoft WavLM Large (aproximadamente 317 millones de parámetros en el encoder), un módulo Conformer K3 y un decodificador Transformer de dos capas. Se ha entrenado con las técnicas denominadas IF y ConPCO, y su frontend acústico es idéntico a nivel de tensor al del modelo hermano CROTTC k3. La decodificación se realiza en SpeechBrain mediante un prefix scorer acústico (`CTCScorer`) que fusiona pesos acústicos y de decodificador.

El modelo tiene un interés limitado pero muy específico: es una pieza de investigación para MDD en árabe, no un asistente conversacional ni un modelo generativo de propósito general. El repositorio tiene 1,3 GB y, en el momento de la consulta, no registra descargas ni likes. La model card advierte que los resultados publicados son históricos y no corresponden a una ejecución completa del test con la configuración por defecto de esta subida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: frontend acústico WavLM Large + Conformer K3 + decodificador Transformer de dos capas |
| Parametros totales | no disponible (el modelo base microsoft/wavlm-large tiene aproximadamente 317 millones de parámetros; el total del sistema no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de audio; sin ventana de contexto textual declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente; el ecosistema SpeechBrain emplea checkpoints de PyTorch (.ckpt/.pt) |
| Tarea (pipeline) | automatic-speech-recognition / phoneme-recognition / mispronunciation-detection |
| Modelo base | microsoft/wavlm-large |
| Biblioteca | SpeechBrain |
| Tamano del repositorio | 1,3 GB |
| Epoch destacada | 407 |
| Fecha de creacion | 2026-10-03 |

## Arquitectura y entrenamiento

El sistema se compone de tres bloques. El frontend acústico es WavLM Large, un encoder transformer preentrenado por Microsoft sobre grandes volúmenes de audio, que aquí se reutiliza como extractor de representaciones. Sobre él se sitúa un módulo Conformer K3, que combina convoluciones y auto-atención, y un decodificador Transformer de dos capas que genera la secuencia de fonemas. La fusión de la salida acústica y la del decodificador se controla mediante pesos configurables (por defecto, 0,9 para el peso acústico y 0,1 para el decodificador Transformer).

El entrenamiento emplea las técnicas IF (referida en la model card) y ConPCO (consistency-based phoneme-level contrastive/optimization auxiliaries; el detalle exacto no se documenta en la información disponible). El checkpoint original conserva los pesos de fusión y de ConPCO. El modelo corresponde a la epoch 407 y su frontend acústico es idéntico a nivel de tensor al de CROTTC k3, según indica el autor. No se especifican en la información disponible el número de tokens de audio, la composición del dataset ni si hubo etapas de RLHF o DPO, algo improbable en un modelo de este tipo.

## Capacidades

- Reconocimiento fonético de audio en árabe: convierte señal de voz a secuencias de fonemas.
- Detección de errores de pronunciación (MDD): la salida fonética se compara contra una referencia para señalar desviaciones.
- Decodificación con beam search configurable (beam por defecto 10) y temperatura (por defecto 1,1).
- Fusión acústico-decoder ajustable mediante pesos (`--acoustic-weight`, por defecto 0,9).
- Decodificación por prefijo acústico con `CTCScorer` de SpeechBrain.
- Inferencia en CPU y en GPU (`--device cpu` / `--device cuda`).
- Conversión automática de audio a mono a 16 kHz.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio generativo ni texto general.
- Capacidad multilingüe: limitada al árabe según los metadatos.

## Casos de uso

- Evaluación de recitación coránica: el modelo transcribe los fonemas emitidos por el recitador y permite compararlos contra la secuencia esperada para detectar errores de articulación o de pronunciación.
- Herramientas de aprendizaje de tajwid y pronunciación: integrado en una aplicación educativa, devuelve secuencias fonéticas que el sistema compara con la referencia para señalar al alumno dónde falla.
- Investigación en detección de errores de pronunciación (MDD): sirve como línea base o componente acústico para experimentos académicos en árabe, reportando métricas F1, precisión, recall y PER.
- Preprocesado fonético para pipelines de evaluación automática de voz: genera transcripciones fonéticas que alimentan sistemas de scoring posteriores.
- Corpus fonéticos anotados: permite generar transcripciones fonéticas automáticas sobre grandes volúmenes de audio para construir o ampliar datasets.
- Comparación de metodologías de decodificación: al ofrecer modos de fusión acústica y seq2seq, permite a un grupo de investigación medir el impacto de cada configuración (por ejemplo, `0.9999_k3_seq2seq` frente a `0.9_k3_ctc`).
- Validación de sistemas de reconocimiento de habla árabe: la salida fonética puede emplearse para diagnóstico de errores en ASR generalista sobre árabe.
- No es adecuado para chatbots, generación de texto, código, matemáticas ni asistentes conversacionales.

## Benchmarks y rendimiento

La model card incluye resultados históricos obtenidos al re-puntuar ficheros de predicción archivados sobre las 1.642 emisiones oficiales del test de Iqra. Los valores son porcentajes. El autor advierte explícitamente que son resultados históricos y que no corresponden a una ejecución completa del test con la configuración por defecto de esta subida, y que las etiquetas de los ficheros no garantizan el checkpoint ni la configuración exactos. No se dispone de datos de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo.

| Sufijo de predicción archivada | F1 | Precision | Recall | PER |
|---|---:|---:|---:|---:|
| `0.9999_k3_seq2seq` | 71,79 | 73,48 | 70,18 | 34,72 |
| `0.9_k3_seq2seq_407` | 70,92 | 72,78 | 69,14 | 29,45 |
| `0.9_k3_ctc` | 69,60 | 71,28 | 68,00 | 8,94 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones basadas en el tamaño del repositorio (1,3 GB) y en la arquitectura declarada, y no en mediciones publicadas por el autor.

- VRAM estimada en FP32: en torno a 3-4 GB, considerando un encoder de aproximadamente 317 millones de parámetros más el Conformer y el decodificador.
- VRAM estimada en FP16/BF16: en torno a 1,5-2,5 GB, si se aplica media precisión.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM, como RTX 3050 8 GB, RTX 3060, RTX 4060; también A100, H100 o L4 para despliegues por lotes.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas con 6 GB o más. La model card incluye una ruta de inferencia en CPU (`--device cpu`), lo que indica que el modelo es ejecutable sin GPU, con mayor latencia.
- Opciones de despliegue: inferencia nativa con SpeechBrain mediante `inference.py` (instalando `requirements.txt`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de audio de este tipo.
- Latencia y throughput: no disponibles. La decodificación por defecto usa beam 10 y temperatura 1,1, lo que aumenta el coste computacional frente a una decodificación greedy.
- Nota: el audio se convierte a mono 16 kHz antes de la inferencia; conviene garantizar la calidad y el formato de la señal de entrada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros sobre modelos comparables en la información proporcionada. Como referencias de la misma familia y categoría:

| Modelo | Autor | Base | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| iqra_CROTTC_IF_k3 | Haopeng | microsoft/wavlm-large | Reconocimiento fonético / MDD (árabe) | Apache 2.0 | Resultados históricos en la model card (F1 hasta 71,79) |
| iqra_CROTTC_conf_k3 | Haopeng | microsoft/wavlm-large | Reconocimiento fonético / MDD (árabe) | Apache 2.0 | no disponible; frontend acústico idéntico según el autor |
| Modelos ASR generalistas sobre árabe | varios | varios | ASR de texto | variables | no disponible para comparación directa |

La comparación con alternativas fuera de esta familia (por ejemplo, sistemas MDD académicos o ASR de texto en árabe) no puede establecerse con rigor porque no se han aportado datos en la información disponible.

## Limitaciones y advertencias

- Los resultados publicados son históricos y no equivalen a una evaluación completa del checkpoint subido con su configuración por defecto; no deben presentarse como rendimiento final del modelo.
- La etiqueta `0.9999_k3_seq2seq` alcanza el F1 más alto (71,79) pero con un PER de 34,72, mientras que `0.9_k3_ctc` tiene el PER más bajo (8,94) a costa de un F1 menor; no hay una única configuración óptima para todas las métricas.
- La clase 70 no tiene etiqueta guardada y se devuelve como `<unmapped:70>` si el modelo la emite, lo que puede introducir errores en la evaluación.
- Idioma limitado al árabe; no hay soporte multilingüe ni de otros dominios fuera del entrenamiento.
- Riesgo de alucinación o de emisión de fonemas espurios inherente a los modelos seq2seq y a la decodificación con temperatura superior a 1 (por defecto 1,1).
- Sesgos potenciales derivados del corpus de entrenamiento (probablemente recitación coránica), no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (microsoft/wavlm-large) y de SpeechBrain por separado.
- No se documentan el dataset de entrenamiento, el número de horas de audio ni el proceso de anotación, lo que dificulta la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes, y no hay validación externa conocida del modelo.
- No es adecuado para tareas de generación de texto, código, razonamiento o agentes; usarlo fuera de su dominio produciría resultados sin sentido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Haopeng/iqra_CROTTC_IF_k3
- Modelo hermano CROTTC k3 (frontend acústico idéntico): https://huggingface.co/Haopeng/iqra_CROTTC_conf_k3
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- SpeechBrain: https://speechbrain.github.io/
- Paper de WavLM: no disponible en la información proporcionada
- Repositorio de código, demo u otros enlaces: no disponibles en la información proporcionada
