# mmahdi-sz/parakeet-tdt-1.1b-persian

## Resumen

Parakeet-TDT 1.1B Persian es un modelo de reconocimiento automatico del habla (ASR) especializado en persa (farsi), desarrollado por el usuario de HuggingFace mmahdi-sz sobre la arquitectura FastConformer-TDT de NVIDIA NeMo. Con 1.100 millones de parametros, emplea un transductor Token-and-Duration (TDT) que predice simultaneamente tokens y duraciones, lo que se traduce en velocidades de inferencia de 80 a 95 veces en tiempo real segun el autor. El modelo se entreno en una unica GPU NVIDIA RTX PRO 6000 Blackwell con 96 GB de VRAM.

El problema que aborda es la escasez de sistemas ASR de alta calidad para persa: la mayoria de modelos multilingues cubren este idioma de forma marginal y con tasas de error elevadas. Este modelo declara un WER estricto del 4,15 % en FLEURS (fa_ir) y mas del 80 % de coincidencia exacta a nivel de frase, ademas de un tokenizer SentencePiece especifico de 1.024 tokens que preserva el Zero-Width Non-Joiner (ZWNJ), un caracter critico en la ortografia persa.

Es relevante por su tamano manejable (inferencia en aproximadamente 2 GB de VRAM en precision media), su licencia permisiva CC-BY-4.0 y su integracion nativa con NeMo, lo que facilita su despliegue en pipelines de transcripcion en produccion. No obstante, el repositorio es de gran tamano (102,4 GB) por la conservacion de multiples checkpoints de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Token-and-Duration Transducer), NVIDIA NeMo |
| Parametros totales | 1.1B (aproximadamente 1.100 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de inferencia por segmento no especificada) |
| Tipos de cuantizacion | no disponible explicitamente; el autor menciona `model.half()` (FP16, aproximadamente 2 GB de VRAM) |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (checkpoint NeMo; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura FastConformer combinada con un decodificador TDT (Token-and-Duration Transducer) de NeMo. El TDT extiende el transductor RNN-T clasico anadiendo una prediccion conjunta de duracion por token, lo que reduce el numero de pasos de decodificacion y permite alcanzar velocidades de 80 a 95 veces tiempo real. El encoder FastConformer emplea atencion con submuestreo de profundidad, un diseno habitual en los modelos Parakeet de NVIDIA para ASR eficiente.

El tokenizer es un SentencePiece Unigram de 1.024 tokens disenado especificamente para la fonetica persa, conservando el ZWNJ (`\u200c`). Los datos de entrenamiento incluyen `mmahdi-sz/mana-tts-v2-persian` y `google/fleurs` (segun los metadatos del repositorio). El autor indica entrenamiento en una NVIDIA RTX PRO 6000 Blackwell de 96 GB y conserva checkpoints maduros entre los pasos 6.050 y 11.325, con un artefacto final congelado (`parakeet_tdt_1.1b_fa_studio_golden.nemo`). No se especifican en la informacion disponible el numero total de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF/DPO (poco habituales en ASR).

## Capacidades

- Transcripcion de audio a texto en persa (farsi) con salida de texto plano.
- Reconocimiento tolerante a caracteres persas complejos gracias a un vocabulario especifico que preserva el ZWNJ.
- Inferencia rapida: 80-95x tiempo real segun el autor.
- Soporte de audio a 16 kHz mono (recomendado en la model card).
- Capacidad de ejecucion en precision media (FP16) con huella de VRAM reducida (aproximadamente 2 GB).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio multimodal; es un modelo puramente ASR.
- Capacidad multilingue limitada al persa.
- No se documenta modo "thinking" ni razonamiento de multiples pasos.

## Casos de uso

- Transcripcion de reuniones y entrevistas en persa: el modelo convierte audio de 16 kHz en texto con WER bajo (4,15 % declarado en FLEURS), adecuado para generar actas y resumenes posteriores con un LLM.
- Subtitulado automatico de contenido audiovisual en persa: la velocidad de 80-95x tiempo real permite procesar horas de video en minutos en una sola GPU.
- Atencion al cliente y call centers: transcripcion por lotes de llamadas en persa para analitica, control de calidad y busqueda en conversaciones.
- Dictado y accesibilidad: integracion en aplicaciones de escritorio o moviles que conviertan voz a texto en persa para usuarios con discapacidad o para productividad.
- Generacion de corpus y datasets: transcripcion masiva de archivos de audio persas para construir datasets de entrenamiento o fines de investigacion linguistica.
- Verificacion y moderacion de contenido: transcripcion de audio subido por usuarios en plataformas para su analisis automatizado y cumplimiento normativo.
- Investigacion en ASR de bajos recursos: base para fine-tuning o comparacion en estudios sobre reconocimiento de habla en lenguas de menos recursos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| ASR persa | FLEURS (fa_ir) | WER (test estricto) | 4,15 % | No |
| ASR persa | No especificado | WER normalizado | < 2,1 % | No |
| ASR persa | No especificado | Coincidencia exacta a nivel de frase | > 80 % | No |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB en FP16 (`model.half()`), segun la model card; en FP32 seria mayor (no cuantificado en la informacion disponible).
- GPU recomendadas: el modelo se entreno en NVIDIA RTX PRO 6000 Blackwell (96 GB), pero la inferencia en FP16 cabe en GPUs de consumo.
- Cabe en GPU de consumo: si, en tarjetas con al menos 2-4 GB de VRAM libres (por ejemplo, GTX 1650, RTX 3050, RTX 4060).
- Opciones de despliegue: NeMo (`EncDecRNNTBPEModel.restore_from`), tal como se documenta. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a este tipo de modelo).
- Latencia y throughput: 80-95x tiempo real declarado por el autor; no se publican valores absolutos de latencia por segundo de audio ni throughput en unidades de procesamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-tdt-1.1b-persian | 1.1B | Persa | Audio 16 kHz mono | CC-BY-4.0 | HuggingFace (NeMo) |
| whisper-large-v3 | 1.55B | Multilingue (incluye persa) | Audio 16 kHz, ventanas de 30 s | MIT (pesos) | OpenAI / HuggingFace |
| NVIDIA Parakeet-TDT-0.6B | 0.6B | Ingles (mayoritariamente) | Audio | CC-BY-4.0 | HuggingFace (NeMo) |

Nota: no se dispone de resultados comparativos de WER entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, idioma y licencia.

## Limitaciones y advertencias

- Modelo mono-idioma: solo persa; no se garantiza rendimiento en otros idiomas ni en code-switching.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Riesgo de alucinacion en audio ruidoso, con acentos no estandar, solapamiento de hablantes o grabaciones de baja calidad; el WER real puede superar el 4,15 % de FLEURS en condiciones adversas.
- No hay documentacion sobre sesgos (dialectos, genero, edad) ni evaluaciones de robustez.
- El repositorio incluye multiples checkpoints (102,4 GB en total), lo que complica la descarga y exige seleccionar el artefacto golden.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero requiere revisar los terminos de los datasets de entrenamiento subyacentes (FLEURS y mana-tts-v2-persian).
- No se especifica soporte para otros formatos de audio, frecuencias de muestreo distintas de 16 kHz ni streaming en tiempo real.
- Para produccion, conviene evaluar el WER en el dominio especifico (telefonia, video, etc.) antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mmahdi-sz/parakeet-tdt-1.1b-persian
- Dataset MANA TTS v2 Persian: https://huggingface.co/datasets/mmahdi-sz/mana-tts-v2-persian
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- NVIDIA NeMo (repositorio oficial): https://github.com/NVIDIA/NeMo
- No se proporcionan enlaces adicionales (papers, blogs, demos) en la informacion disponible.
