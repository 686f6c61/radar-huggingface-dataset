# algerian-nlp/Hadra-TTS-f5

## Resumen

Hadra-TTS-f5 es un modelo de sintesis de voz (text-to-speech) especializado en arabe argelino dialectal (darja, الدارجة الجزائرية), publicado por la comunidad algerian-nlp como contrapartida de sintesis a sus modelos de reconocimiento de voz Hadra-ASR-whisper-medium y Hadra-ASR-whisper-small. Se trata de un ajuste fino del checkpoint arabe IbrahimSalah/Arabic-F5-TTS-v2, que a su vez parte de la arquitectura F5-TTS basada en Flow-Matching Diffusion Transformer (DiT). La configuracion declarada es dim=1024, depth=22, heads=18, ff_mult=2, text_dim=512 y conv_layers=8, con muestreo a 24.000 Hz y un vocabulario de 2.580 tokens arabes.

El problema que aborda es la escasez de recursos de sintesis para una variedad arabe de bajos recursos como el darja argelino, que rara vez aparece en los corpus de TTS comerciales y que presenta code-switching frecuente con frances y bereber. El modelo se ha entrenado sobre aproximadamente 399 horas de habla dialectal multi-dominio (podcast conversacional, narrativa expresiva y folklore oral) procedentes de la OddAdmix Algerian Speech Collection, con 77.150 utterances en bruto y 69.066 tras filtrado, lo que lo convierte en uno de los pocos sistemas de sintesis abiertos centrados especificamente en este dialecto.

Es relevante ahora porque combina una licencia permisiva (Apache 2.0), un pipeline estandar y reproducible (libreria f5-tts y pesos en PyTorch), y un ecosistema de demo web publica e implementacion en GitHub, lo que permite a desarrolladores e investigadores construir voces en darja sin depender de APIs propietarias. Su utilidad practica esta limitada por la ausencia total de evaluacion con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS / DiT (Diffusion Transformer) con flow matching; dim=1024, depth=22, heads=18, ff_mult=2, text_dim=512, conv_layers=8, pe_attn_head=1 |
| Parametros totales | no disponible (la model card no publica el recuento; el repositorio ocupa 3,5 GB e incluye un duplicado del checkpoint) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; entrenamiento restringido a utterances de 2,0-12,0 s |
| Tipos de cuantizacion | no disponible; unico peso publicado en formato .pt |
| Idiomas soportados | arabe argelino (darja), con code-switching a frances y bereber segun la model card; etiqueta oficial de idioma: ar |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pt (model_last.pt); sin safetensors ni GGUF |
| Frecuencia de muestreo | 24.000 Hz, mono, float32 |
| Vocabulario | 2.580 tokens arabes |
| Modelo base | IbrahimSalah/Arabic-F5-TTS-v2 (checkpoint arabe de 547.500 pasos) |
| Biblioteca de inferencia | f5-tts |
| Entradas de audio (mel-espectrograma) | n_fft=1024, hop_length=256, win_length=1024, n_mel_channels=100, mel_spec_type=vocos |

## Arquitectura y entrenamiento

La arquitectura es F5-TTS, un Diffusion Transformer (DiT) que genera mel-espectrogramas mediante flow matching y los convierte a audio con un vocoder del tipo Vocos. El backbone declarado usa dim=1024, 22 capas, 18 cabezas de atencion, ff_mult=2, 8 capas convolucionales y text_dim=512, con checkpoint_activations activado (gradient checkpointing) para ajustar el modelo en una unica Tesla T4 de 16 GB. El texto se tokeniza en un vocabulario de 2.580 tokens arabes y la senal se representa a 24 kHz con 100 canales mel.

El ajuste fino se realizo sobre la OddAdmix Algerian Speech Collection, un corpus de tres registros: Kahwa Podcast (23.264 utterances, ~110 h, conversacional espontaneo), Loubna Stories (41.301 utterances filtradas, ~237 h, narrativa expresiva) y Rawi Folklore (4.501 utterances filtradas, ~52 h, folklore oral cultural). El preprocesado incluye remuestreo a 24 kHz en streaming, filtro de duracion de 2,0 a 12,0 s, filtro de densidad de caracteres de 1,0 a 25,0 caracteres por segundo y una tasa de retencion aproximada del 85%, ademas de normalizacion de texto adaptada al darja. No se documenta ninguna fase de RLHF, DPO ni preferencias humanas: es un ajuste supervisado puro sobre datos de audio-transcripcion.

El entrenamiento consta de 48.574 actualizaciones repartidas en 8 sesiones de Kaggle entre el 20 y el 23 de septiembre de 2026, con reanudacion automatica desde el ultimo checkpoint subido a Hugging Face Hub. Se uso AdamW de 8 bits (bitsandbytes), precision mixta FP16, learning rate pico de 2x10^-5 con decaimiento coseno y 2.000 pasos de warmup, batch de 2.000 fotogramas mel por GPU y acumulacion de gradiente de 6 pasos (equivalente a ~12.000 fotogramas). La perdida final registrada es 0,4950, aunque la serie es ruidosa: 0,4266 en el paso 969, 0,9916 en el paso 13.214, 1,1612 en el paso 26.014 y 0,4460 en el paso 38.865. No se declara ningun mecanismo de decodificacion especulativa ni innovacion de atencion adicional.

## Capacidades

- Sintesis de voz en arabe argelino dialectal (darja) a partir de texto, con salida a 24 kHz.
- Modelado de tres registros diferenciados: conversacion espontanea (podcast), narracion expresiva (cuentos) y recitado de folklore oral.
- Capacidad declarada de code-switching hacia frances y bereber dentro de una misma frase, aunque no se cuantifica su calidad.
- Normalizacion de texto adaptada al darja antes de la sintesis.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento de agente ni razonamiento multi-paso; es un modelo puramente generativo de audio.
- No se documentan capacidades de vision, audio de entrada (salvo el prompt de referencia propio de F5-TTS) ni modo de razonamiento explicito.
- No se documentan capacidades multilingues mas alla del arabe y del code-switching mencionado.
- Capacidad de voice cloning inherente a la arquitectura F5-TTS (condicionamiento por audio de referencia), no explicitamente evaluada en esta ficha.

## Casos de uso

- Audiolibros y narracion de cuentos en darja: el modelo se ajusto sobre 237 h del subconjunto Loubna Stories, de registro narrativo expresivo, por lo que es el escenario mas alineado con sus datos de entrenamiento para generar cuentos y relatos largos fragmentados en utterances de 2 a 12 s.
- Produccion de podcasts y contenido conversacional: las 110 h del subconjunto Kahwa Podcast permiten generar locuciones con entonacion coloquial para aperturas, cunas o fragmentos dramatizados de un podcast en dialecto argelino.
- Preservacion de patrimonio oral: el subconjunto Rawi Folklore (~52 h) hace viable sintetizar relatos tradicionales y material etnografico para archivos digitales y museos, con locucion consistente y sin necesidad de un hablante humano disponible.
- Voice-over y localizacion de contenido digital: doblaje de videos cortos, anuncios y material divulgativo destinado al publico argelino, aprovechando el code-switching con frances que aparece de forma natural en el corpus.
- Sistemas de atencion al cliente por voz en darja: combinado con Hadra-ASR-whisper-medium o Hadra-ASR-whisper-small, permite construir un pipeline de voz completo (reconocimiento y sintesis) para IVR y asistentes telefonicos en dialecto.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de articulos, documentos o interfaces en arabe argelino, con la ventaja de una licencia Apache 2.0 que permite integrarlo en productos sin coste de API.
- Generacion de datos sinteticos para entrenar ASR: el modelo puede producir utterances etiquetadas para aumentar corpus de reconocimiento en darja, ya que comparte ecosistema con los modelos Hadra-ASR.
- Prototipado rapido mediante demo web: la demo de Streamlit permite validar prosodia y pronunciacion antes de invertir en integracion de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara la perdida de entrenamiento (cross-entropy por batch de 0,4950 en el paso 48.574) y el registro de sesiones, sin valores de WER, MOS, MCD, similitud de hablante ni comparaciones objetivas contra otros sistemas de TTS.

## Requisitos de hardware

- Entrenamiento confirmado: NVIDIA Tesla T4 de 16 GB de VRAM, con gradient checkpointing activado (checkpoint_activations=True) para ajustar la configuracion dim=1024/depth=22.
- Inferencia: la model card no publica cifras de VRAM. Como referencia, el peso publicado (model_last.pt) esta en el rango de 1 a 1,5 GB, por lo que la inferencia en FP16 deberia caber con holgura en GPUs consumer de 4-6 GB de VRAM; esta estimacion no esta confirmada por el autor.
- Cabe previsiblemente en GPUs consumer: RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes. No hay validacion oficial en estas tarjetas.
- GPUs de datacenter (A100, H100) solo tendrian sentido para sintesis por lotes a gran escala, no porque el modelo las requiera.
- Opciones de despliegue: libreria f5-tts (pip install f5-tts) sobre PyTorch, carga desde Hugging Face Hub mediante huggingface_hub, y la demo web en Streamlit del autor.
- No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, ONNX ni TensorRT, ni conversiones a GGUF.
- Latencia y throughput: no disponible. La model card no publica mediciones de RTF (real-time factor) ni de tiempo por utterance.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / unidad | Idiomas | Licencia | Formato | Evaluacion publicada |
|---|---|---|---|---|---|---|
| Hadra-TTS-f5 | no disponible | utterances de 2-12 s, 24 kHz | Darja argelino (+ code-switching fr/bereber) | Apache 2.0 | .pt (PyTorch) | no disponible |
| IbrahimSalah/Arabic-F5-TTS-v2 (modelo base) | no disponible | no disponible | Arabe estandar | no disponible | .pt | no disponible |
| F5-TTS original (SWivid/F5-TTS) | no disponible | no disponible | Ingles y chino fundamentalmente | no disponible en la informacion proporcionada | .pt | no disponible |

No se dispone de datos objetivos (MOS, WER, similitud de hablante) para ninguno de los tres modelos dentro de la informacion proporcionada, por lo que la comparativa se limita a la relacion de derivacion y a la cobertura idiomatica. Hadra-TTS-f5 es un ajuste fino de Arabic-F5-TTS-v2, que a su vez deriva de la implementacion F5-TTS; la diferencia principal frente a ambos es la especializacion en darja argelino y el corpus de 399 horas empleado.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay MOS, WER, MCD ni pruebas de inteligibilidad, por lo que la calidad real del audio generado no esta verificada de forma objetiva.
- Curva de perdida inestable durante el entrenamiento: subidas a 0,9916 y 1,1612 en los pasos 13.214 y 26.014 frente al 0,4950 final sugieren una optimizacion irregular y ocho sesiones de Kaggle interrumpidas por limite de tiempo.
- Sesgos potenciales derivados del corpus: solo tres fuentes (un podcast, un canal de cuentos y un corpus de folklore), con voces, edades, generos y acentos no documentados; la diversidad de hablantes del modelo final es una incognita.
- Riesgo de alucinacion en sintesis de voz: pronunciacion incorrecta, omision o sustitucion de palabras, artefactos en utterances largos y degradacion fuera del rango de 2 a 12 s visto en entrenamiento.
- Limite practico de longitud: el modelo se entreno con fragmentos de 2 a 12 s, por lo que textos largos requieren troceado y concatenacion, con riesgo de perdida de coherencia prosodica entre fragmentos.
- Cobertura idiomatica limitada: la etiqueta oficial es unicamente ar; el code-switching a frances y bereber no esta cuantificado ni garantizado.
- Unico checkpoint disponible (model_last.pt) y sin versiones quantizadas, safetensors, GGUF u ONNX, lo que complica el despliegue en entornos no basados en PyTorch.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no cubre los derechos de las voces presentes en los corpus de entrenamiento ni el uso indebido de la clonacion de voz; la responsabilidad legal recae en el usuario.
- Riesgo de suplantacion de identidad y generacion de audio enganoso, agravado por las capacidades de clonacion de voz propias de F5-TTS.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion inusuales (2026), lo que indica un proyecto muy reciente y sin validacion por parte de la comunidad.
- Documentacion incompleta: la model card consultada se corta en la seccion de inferencia, por lo que faltan instrucciones completas de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/algerian-nlp/Hadra-TTS-f5
- Modelo base: https://huggingface.co/IbrahimSalah/Arabic-F5-TTS-v2
- Organizacion algerian-nlp: https://huggingface.co/algerian-nlp
- Modelo ASR relacionado (medium): https://huggingface.co/algerian-nlp/Hadra-ASR-whisper-medium
- Modelo ASR relacionado (small): https://huggingface.co/algerian-nlp/Hadra-ASR-whisper-small
- Dataset Kahwa Podcast: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-kahwa-postcast
- Dataset Loubna Stories: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-loubna-stories
- Dataset Rawi Folklore: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-rawi
- Demo web interactiva: https://f5tts-algerian-darja-demo.streamlit.app/
- Repositorio GitHub de la demo: https://github.com/KamelTouati/f5tts-algerian-darja-demo
- Monitorizacion de entrenamiento en Weights & Biases: proyecto `k_touati-estin/f5tts-algerian-darja` (enlace directo no disponible en la informacion proporcionada)
