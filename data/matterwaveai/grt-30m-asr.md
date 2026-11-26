# MatterWaveAI/grt-30m-asr

## Resumen

GRT-30M-ASR es un modelo de reconocimiento automatico del habla (ASR) desarrollado por MatterWaveAI, construido sobre la arquitectura Geometric Rotation Transformer (GRT). Se presenta como un modelo "100% rotacional": no contiene ninguna capa `nn.Linear` ni `nn.Conv1d`, sino que toda la computacion se realiza mediante rotaciones de Givens y transformaciones en coordenadas polares derivadas del algebra de Clifford. Con 32.594.470 parametros, es un modelo muy compacto orientado a la transcripcion de voz a texto en formato condicional (`GRTASRForConditionalGeneration`).

El modelo deriva del modelo base `MatterWaveAI/grt-30m-omni` y se ha especializado en ASR mediante un proceso de entrenamiento en dos fases con optimizadores geometricos propios (HessianPairAdam / Sophia-Torus y GyricAdam). Su propuesta principal es demostrar que una arquitectura puramente rotacional puede alcanzar tasas de exactitud muy altas en transcripcion de voz, con perplexity de validacion cercana a 1.07 en el conjunto de evaluacion del autor.

Es relevante en el contexto de la investigacion en arquitecturas alternativas al transformer clasico, ya que elimina por completo las proyecciones lineales densas y explora optimizadores de inspiracion geometrica y simplectica. El modelo tiene licencia Apache 2.0 y se distribuye en formatos safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRT (`GRTASRForConditionalGeneration`, `model_type = "grt_asr"`): audio stem rotacional de 11 etapas + 4 bloques encoder rotacionales bidireccionales + merger temporal + backbone LM rotacional de 12 capas |
| Parametros totales | 32.594.470 (segun model card); 33.351.157 segun safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (variantes concretas no especificadas); pesos originales en safetensors (float32) |
| Idiomas soportados | no disponible (la model card no especifica cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura GRT sustituye las capas lineales y convolucionales por rotaciones de Givens organizadas en una estructura de mariposa (butterfly). La senal de audio a 16 kHz se transforma mediante analisis STFT en coordenadas polares de magnitud logaritmica y fase (`r = log(1 + |X|)`, con componentes `r cos φ` y `r sin φ`), que atraviesan un stem de audio rotacional de 11 etapas (`GRTPolarAudioStem`). Despues, 4 bloques encoder rotacionales bidireccionales (`GRTAudioModel`) contextualizan la representacion, un merger temporal (`GRTTemporalRotationalMerger`) pliega la secuencia `2×` en el tiempo generando 64 tokens de audio en pares planares, y un backbone de lenguaje rotacional de 12 capas (`GRTModel` + `GRTCosineHead`) decodifica la transcripcion. El reparto de parametros es: 3.288.972 en la torre de audio y 29.305.498 en el modelo de lenguaje.

El entrenamiento se realizo en dos fases: una primera de alineamiento en espacio de fases del encoder de audio y una segunda de alineamiento causal del LM sobre las ultimas capas y la normalizacion final. Se utilizaron optimizadores geometricos propios (`HessianPairAdam` / Sophia-Torus y `GyricAdam`). El autor reporta una reduccion de perplexity de validacion desde 29312.46 (modelo no alineado) hasta 1.0693 (especializado), con `val_loss = 0.0670`. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto (speech-to-text) a partir de waveforms de audio a 16 kHz.
- Generacion condicional de texto: el modelo produce transcripciones token a token mediante decodificacion greedy.
- Captura de atributos paralinguisticos en la transcripcion: el autor reporta exactitud del 100% en "voice profile" y 95.8% en contorno de prosodia, lo que sugiere que el modelo describe caracteristicas de la voz (p. ej. tono, emocion) en la salida.
- Procesamiento de audio en coordenadas polares STFT (magnitud y fase), lo que le permite operar directamente sobre la representacion frecuencial.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla de ASR ni modo "thinking".
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Transcripcion de audio de corta duracion en entornos de investigacion: el modelo procesa waveforms de aproximadamente 1,27 s (20.320 muestras a 16 kHz) en el ejemplo de la model card, adecuado para experimentos de prototipado rapido de ASR.
- Investigacion en arquitecturas sin capas lineales: util como banco de pruebas para estudiar arquitecturas rotacionales (Givens, algebra de Clifford) frente a transformers clasicos en tareas de audio.
- Experimentacion con optimizadores geometricos: el modelo y su codigo de optimizacion (`transformers.models.grt.optimization_grt`) permiten reproducir ablaciones de optimizadores simplecticos y giroscopicos sobre tareas ASR.
- Analisis paralinguistico de voz: dado que el autor reporta exactitud en "voice profile" y prosodia, puede emplearse para extraer descripciones del tono o la emocion del hablante junto a la transcripcion.
- Despliegue ligero en hardware modesto: con ~33M de parametros y pesos en GGUF, es viable ejecutarlo en CPU o GPUs de gama baja para demos y pruebas de concepto.
- Educacion y divulgacion: por su tamano reducido y su enfoque geometrico poco convencional, sirve como ejemplo didactico de ASR con arquitecturas alternativas.

## Benchmarks y rendimiento

Los datos disponibles son los reportados por el autor en su model card, medidos sobre su propio conjunto de validacion y en una ablacion de optimizadores (no comparables directamente con benchmarks estandar como LibriSpeech WER).

| Metrica | Valor |
|---|---|
| Perplexity de validacion (especializado, HessianPairAdam) | 1.0693 (`val_loss = 0.0670`) |
| Perplexity de validacion (GyricAdam) | 1.0708 (`val_loss = 0.0684`) |
| Perplexity de validacion (modelo no alineado) | 29312.46 |
| Exactitud top-1 de tokens de transcripcion | 99.59% (GyricAdam / PairAdam) |
| Exactitud de transcripcion por frase | 100.0% |
| Exactitud de perfil de voz | 100.0% |
| Exactitud de contorno de prosodia | 95.8% (GyricAdam / PairAdam); 83.3% base |
| Exact match de frase completa | 95.8% (GyricAdam / PairAdam); 83.3% base |

Ablacion de 8 optimizadores (200 pasos, seed 42, AMD Radeon 8060S, ROCm gfx1151):

| Rank | Optimizador | Val loss | Val PPL | Top-1 tokens | Exact match | Tiempo (s) |
|:---:|---|---|---|---|---|---|
| 1 | GyricAdam | 0.0684 | 1.0708 | 99.59% | 95.8% | 415.78 |
| 2 | PairAdam | 0.0875 | 1.0915 | 99.59% | 95.8% | 215.97 |
| 3 | HuygensAdam | 0.0955 | 1.1002 | 98.76% | 87.5% | 422.14 |
| 4 | PolarNaturalAdam | 0.0977 | 1.1026 | 99.17% | 91.7% | 372.97 |
| 5 | HessianPairAdam | 0.1072 | 1.1132 | 98.76% | 87.5% | 219.54 |
| 6 | CyclideAdam | 0.1707 | 1.1861 | 96.69% | 66.7% | 413.43 |
| 7 | HuygensSymplecticAdam | 0.2775 | 1.3198 | 97.93% | 79.2% | 389.00 |
| 8 | SymplecticAdam | 0.3278 | 1.3879 | 97.11% | 70.8% | 408.80 |

No se han publicado resultados de benchmarks estandar (p. ej. WER en LibriSpeech o Common Voice) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~33M de parametros, en float32 ocupa aproximadamente 130 MB de pesos; en cuantizacion de 8 bits o 4 bits (GGUF) baja a decenas de MB. La VRAM total dependera del tamaño del buffer de audio y del contexto de generacion.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor realizo la ablacion en una AMD Radeon 8060S (iGPU, ROCm gfx1151), lo que indica que no requiere hardware de datacenter.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: `transformers` (libreria indicada en la model card, con `GRTASRForConditionalGeneration`); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. La disponibilidad de pesos GGUF permite teoricamente su uso con llama.cpp u Ollama, aunque no se documenta explicitamente el soporte de estos runners para la arquitectura `grt_asr`.
- Latencia y throughput: no disponibles. El ejemplo de la model card usa un waveform de ~1,27 s y decodificacion greedy en float32.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar comparables en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales frente a alternativas ASR de tamano pequeno.

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRT-30M-ASR (MatterWaveAI) | ~33M | GRT rotacional (sin capas lineales) | no disponible | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Whisper tiny (OpenAI) | ~39M | Transformer encoder-decoder | 30 s de audio | MIT | Hugging Face, multiples runners |
| Whisper base (OpenAI) | ~74M | Transformer encoder-decoder | 30 s de audio | MIT | Hugging Face, multiples runners |
| Wav2Vec 2.0 base (Meta) | ~95M | CNN + transformer | no disponible | MIT / Apache 2.0 (segun variante) | Hugging Face |

La comparacion de rendimiento (WER) con estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Los benchmarks reportados por el autor se calculan sobre su propio conjunto de validacion y con muestras de audio de duracion muy corta (~1,27 s); no hay evidencia de rendimiento en audio largo, ruidoso o de dominio abierto.
- Los ejemplos de transcripcion de la model card muestran errores de sustitucion (p. ej. "declarative" transcrito como "calm"), lo que sugiere que la salida puede no ser una transcripcion literal sino una descripcion paralinguistica del audio.
- No se especifican los idiomas soportados; la cobertura linguistica es desconocida y no debe asumirse multilingue.
- Riesgo de alucinacion en la generacion de texto no cuantificado por el autor.
- Sesgos conocidos: no documentados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se presenta como trabajo de investigacion sin garantias de robustez en produccion.
- La arquitectura `grt_asr` es no estandar; el soporte en herramientas de inferencia de terceros (vLLM, TGI, llama.cpp) no esta confirmado en la informacion disponible.
- El modelo tiene 0 descargas relevantes y 0 likes en el momento de la consulta (244 descargas), por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-asr
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m-omni
- Repositorio de transformers (modulo `transformers.models.grt.optimization_grt` referenciado en la model card): https://github.com/huggingface/transformers
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios propios ni demos adicionales del autor.
