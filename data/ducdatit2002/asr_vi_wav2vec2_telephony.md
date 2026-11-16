# ducdatit2002/asr_vi_wav2vec2_telephony

## Resumen

`ducdatit2002/asr_vi_wav2vec2_telephony` es un repositorio de Hugging Face que contiene un pipeline completo de ajuste fino (fine-tuning) para reconocimiento automático del habla (ASR) en vietnamita, orientado específicamente a audio telefónico y entornos ruidosos. No se trata únicamente de un conjunto de pesos: el repositorio incluye scripts de preparación de datos, entrenamiento, construcción de modelos de lenguaje KenLM, inferencia y utilidades auxiliares. El modelo base sobre el que se construye es `nguyenvulebinh/wav2vec2-base-vietnamese-250h`, un Wav2Vec2 preentrenado en 250 horas de audio vietnamita.

La relevancia de este repositorio radica en su enfoque práctico hacia un dominio difícil: el audio de telefonía, caracterizado por ancho de banda limitado, ruido de fondo, artefactos de compresión y variabilidad de canales. El pipeline incorpora aumentación específica de telefonía (bandpass, distorsión tipo GSM, mezcla de ruido), datos no lingüísticos, y decodificación con modelo de lenguaje de 4-gramas para mejorar la precisión en condiciones adversas. El tamaño total del repositorio es de 8,8 GB, lo que sugiere la presencia de pesos y artefactos de entrenamiento, aunque no se detalla su composición exacta.

La información pública disponible es limitada: no se especifican licencia, idiomas oficiales, pipeline declarado ni métricas de rendimiento publicadas. La model card está redactada en vietnamita y describe principalmente el flujo de trabajo y los comandos de uso, más que las características del modelo resultante. Aun así, la estructura del repositorio y las instrucciones permiten inferir un uso previsto claro: transcripción de llamadas y audio telefónico en vietnamita con soporte para decodificación con LM y post-procesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + atención, CTC) |
| Parametros totales | no disponible (modelo base Wav2Vec2-base, ~95M típicamente, no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio procesado en chunks de 5-15 s según el pipeline de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (implícito por el modelo base y los datos de entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts y artefactos; no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

El modelo se basa en Wav2Vec2 con cabeza CTC, partiendo del checkpoint `nguyenvulebinh/wav2vec2-base-vietnamese-250h`. El entrenamiento se organiza en dos fases: una primera etapa con el codificador de características congelado (`freeze_feature_encoder()`) y una tasa de aprendizaje de `1e-4`, seguida de una segunda etapa con el codificador descongelado y una tasa de `1e-5`. Se activa SpecAugment con `mask_time_prob=0.05` y `mask_feature_prob=0.05`, y se calculan WER y CER durante el entrenamiento.

La preparación de datos incluye conversión a WAV mono a 16 kHz, normalización de texto (minúsculas, conversión de números a palabras, por ejemplo `495.000 -> bon tram chin muoi lam nghin`), filtrado de muestras inválidas (menos de 1 s, más de 20 s, transcripciones vacías o de más de 200 caracteres) y adición de datos no lingüísticos. Para el conjunto de entrenamiento se genera una copia aumentada con distorsión telefónica: bandpass, distorsión tipo GSM y mezcla de ruido, con una proporción configurable (`--telephony-augment-ratio 0.30` por defecto). La decodificación puede ser greedy o con un modelo KenLM de 4-gramas construido a partir de los propios manifiestos y textos extra.

## Capacidades

- Reconocimiento automático del habla en vietnamita sobre audio telefónico y ruidoso.
- Decodificación CTC greedy y beam search con modelo de lenguaje KenLM de 4-gramas.
- Soporte de hotwords para sesgar la decodificación hacia vocabulario específico del dominio (por ejemplo, dominio "Ocany").
- Pipeline de inferencia para audio largo: VAD, segmentación en chunks de 5-15 s, ASR, LM opcional y post-filtrado.
- Generación de transcripciones en texto plano, texto formateado y texto "pulido" (`text`, `formatted_text`, `polished_text`).
- Procesamiento de archivos MP3 y WAV, con salida en JSON, TXT y visualización PNG (waveform, segmentos y transcripción).
- Ejecución en GPU o CPU (variable `ASR_DEVICE=cpu`), y posibilidad de desactivar VAD (`ASR_DISABLE_VAD=1`).
- No se documentan capacidades de visión, audio generativo, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el pipeline de VAD y segmentación en chunks de 5-15 s permite procesar grabaciones telefónicas completas y generar transcripciones con un LM de 4-gramas que corrige errores típicos del dominio.
- Análisis de calidad de conversaciones en centros de contacto: la salida estructurada en JSON con `text`, `formatted_text` y `polished_text` facilita el post-procesado y la integración en sistemas de analytics.
- Subtitulado y documentación de audio telefónico en vietnamita: el script `run_infer_one.sh` genera transcripción y visualización PNG del waveform y los segmentos, útil para revisión manual.
- Entrenamiento de modelos ASR específicos de dominio: el repositorio incluye scripts de preparación de datos, entrenamiento en dos fases y evaluación WER/CER, reutilizables para otros dominios con datos TSV `key/wav/txt`.
- Investigación en robustez frente a ruido y canales telefónicos: la aumentación bandpass, GSM-like y mezcla de ruido permite estudiar el impacto de distorsiones realistas en ASR.
- Despliegue en entornos con recursos limitados: la posibilidad de ejecutar en CPU (`ASR_DEVICE=cpu`) y el uso de un modelo Wav2Vec2-base facilitan pruebas en máquinas sin GPU dedicada.
- Sesgo de vocabulario mediante hotwords: el uso de `--hotwords-file` permite adaptar la decodificación a nombres propios, productos o jerga de un cliente concreto sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de un Wav2Vec2-base (~95M parámetros, no confirmado), la huella sería moderada, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el pipeline permite ejecución en CPU (`ASR_DEVICE=cpu`), lo que sugiere que puede funcionar sin GPU dedicada.
- Opciones de despliegue: scripts propios (`infer_ctc.py`, `run_infer_one.sh`, `run_longform_infer.py`), con dependencias en `requirements.txt` y `ffmpeg` en el PATH. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos adicionales: `lmplz` y `build_binary` para construir el binario KenLM; el repositorio ocupa 8,8 GB, por lo que se necesita espacio en disco suficiente.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones cerradas del modelo resultante, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. Como referencia cualitativa, el modelo base `nguyenvulebinh/wav2vec2-base-vietnamese-250h` es un punto de partida habitual para ASR en vietnamita, pero no se han publicado en la información disponible métricas comparables de este fine-tuning frente a otros sistemas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ducdatit2002/asr_vi_wav2vec2_telephony | no disponible | no disponible | no disponible | Hugging Face (repo 8,8 GB) |
| nguyenvulebinh/wav2vec2-base-vietnamese-250h | no disponible en la información | no disponible | no disponible | Hugging Face (modelo base citado) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card está redactada en vietnamita y describe el pipeline, no las características finales del modelo; faltan datos clave como licencia, idiomas oficiales y métricas.
- No se han publicado resultados de WER/CER ni benchmarks, por lo que no es posible evaluar la calidad real del modelo ajustado.
- El modelo está orientado a vietnamita y audio telefónico; su rendimiento en otros idiomas o dominios (audio limpio de estudio, otros acentos) no está documentado.
- Riesgo de alucinación y errores de transcripción inherentes a ASR, especialmente en audio ruidoso o con solapamiento de hablantes; el uso de KenLM y hotwords mitiga pero no elimina este riesgo.
- La licencia no está especificada, lo que impide confirmar si se permite uso comercial; es imprescindible verificar este punto antes de un despliegue en producción.
- El repositorio incluye rutas absolutas y entornos concretos (`/home/aiotlab/...`, `conda activate voice_new`), lo que indica que no está empaquetado como librería instalable estándar y requiere adaptación.
- No se detalla la composición exacta de los 8,8 GB del repositorio ni si los pesos finales están incluidos o solo los scripts.
- El pipeline asume formato TSV `key/wav/txt` y dependencias del sistema (`ffmpeg`, `lmplz`, `build_binary`) que deben instalarse por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ducdatit2002/asr_vi_wav2vec2_telephony
- Modelo base citado: https://huggingface.co/nguyenvulebinh/wav2vec2-base-vietnamese-250h
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
