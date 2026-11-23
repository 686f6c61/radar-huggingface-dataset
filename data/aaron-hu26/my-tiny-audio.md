# aaron-hu26/my-tiny-audio

## Resumen

my-tiny-audio es un modelo ligero de reconocimiento automatico del habla (ASR) de extremo a extremo que combina un codificador de audio con un decodificador de lenguaje. Lo desarrolla el usuario aaron-hu26 y sigue la arquitectura tiny-audio: un encoder Conformer congelado de IBM Granite Speech 5.0 (470M parametros), un proyector MLP de dos capas entrenado y un decodificador de texto Qwen3.5-0.8B afinado con LoRA y fusionado en los pesos base. El conjunto suma 754.362.176 parametros (unos 754M) y se distribuye en safetensors y GGUF.

El modelo resuelve la transcripcion de voz a texto en ingles con un coste computacional bajo: se entreno en una unica GPU de consumo (RTX 4060 de 8 GB) y convergio en 800 pasos sobre el split dev-clean de LibriSpeech (5,4 horas de audio). Su interes practico esta en que ofrece un pipeline ASR completo y hackeable, con exportaciones GGUF BF16 y Q8_0 listas para llama.cpp y Ollama, ademas de una demo Gradio con microfono y metricas de RTF.

Es un modelo experimental y de nicho: no hay benchmarks publicados, el entrenamiento se limito a un unico dataset y a un solo idioma, y el repo pesa 5,4 GB. Resulta adecuado para prototipos, experimentacion con arquitecturas audio-LLM y despliegue en entornos con recursos limitados, no para produccion critica sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal ASR: encoder Conformer (Granite Speech 5.0, congelado) + proyector MLP 2 capas (1024→1024 GELU→1024, pooling stride 1) + decodificador Qwen3.5-0.8B con LoRA fusionado |
| Parametros totales | 754.362.176 (754M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors y GGUF sin perdida) y Q8_0 (GGUF de 8 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, 1,51 GB), GGUF (qwen_decoder.gguf BF16 1,51 GB; qwen_decoder_q8_0.gguf 775 MB), decoder independiente en carpeta decoder/ |

## Arquitectura y entrenamiento

El modelo sigue un diseno encoder-proyector-decoder. El encoder es `ibm-granite/granite-speech-5.0-470m-turboctc-nc`, un extractor de caracteristicas basado en Conformer de 470M parametros que se mantiene congelado durante el entrenamiento. Un proyector MLP de dos capas (1024→1024 con activacion GELU→1024, stride de pooling 1) se entrena para alinear las representaciones de audio con el espacio del decodificador de texto. El decodificador es Qwen3.5-0.8B, afinado con un adaptador LoRA de rango r=16 y alpha=32, que se fusiona matematicamente en los pesos base mediante `merge_and_unload()`. El vocabulario del tokenizer es de 248k entradas.

El entrenamiento se realizo en una unica GPU de consumo (NVIDIA GeForce RTX 4060 de 8 GB) sobre el split `clean/validation` (dev-clean) de LibriSpeech, con 5,4 horas de audio. Se uso batch por dispositivo de 2, acumulacion de gradientes de 2 (batch efectivo 4), optimizador AdamW con LR=2e-4, warmup y decaimiento coseno. La perdida paso de 4,238 en el paso 1 a 0,1069 en el paso 800, con gradientes estables. No se documentan fases de RLHF ni DPO, ni innovaciones como decodificacion especulativa o atencion lineal. El repo incluye codigo propio (`asr_modeling.py`, `asr_pipeline.py`, `projectors.py`) que requiere `trust_remote_code=True`.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) en ingles a partir de audio WAV, MP3 o FLAC.
- Generacion de transcripciones con un decodificador de lenguaje, lo que permite aprovechar el conocimiento linguistico de Qwen3.5-0.8B.
- Pipeline ASR compatible con `transformers` mediante `pipeline("automatic-speech-recognition", ...)` y `trust_remote_code=True`.
- Despliegue nativo en llama.cpp y Ollama mediante los GGUF incluidos y el `Modelfile`.
- Demo web Gradio (`app.py`) con grabacion desde microfono, subida de audio y metricas de RTF y throughput en vivo.
- Exportacion de un decodificador de texto independiente (carpeta `decoder/`).
- Capacidad conversacional declarada en los tags del repo (endpoints_compatible, conversational), aunque no se detalla su alcance.
- No se documentan tool calling, function calling, agentes, vision, audio de salida ni modo thinking.

## Casos de uso

- Transcripcion de notas de voz y reuniones en ingles: el pipeline ASR convierte audio en texto con un modelo de 754M parametros, adecuado para entornos donde no se quiere depender de APIs externas.
- Prototipado de asistentes de voz: la demo Gradio con microfono permite validar rapidamente la calidad de transcripcion antes de integrar el modelo en un producto.
- Investigacion en arquitecturas audio-LLM: el codigo abierto (`asr_modeling.py`, `projectors.py`) y el proyector entrenado sirven como base para experimentar con otros encoders o decodificadores.
- Despliegue en hardware modesto: el GGUF Q8_0 de 775 MB y el BF16 de 1,51 GB permiten ejecutar inferencia en CPU o GPU de consumo mediante llama.cpp u Ollama.
- Generacion de subtitulos para contenido en ingles: el modelo puede transcribir audio de forma local y alimentar un pipeline de subtitulado.
- Fine-tuning y adaptacion: al ser un modelo pequeno y con licencia MIT, se puede reentrenar el proyector o el adaptador LoRA sobre dominios especificos (por ejemplo, vocabulario tecnico) con recursos limitados.
- Evaluacion comparativa de ASR: sirve como linea base ligera frente a modelos ASR dedicados en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de entrenamiento documentada es la perdida: 4,238 en el paso 1 y 0,1069 en el paso 800 sobre el split dev-clean de LibriSpeech. No se proporcionan cifras de WER, MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en BF16 para los pesos del modelo (model.safetensors de 1,51 GB), mas overhead de activaciones y del encoder; el GGUF Q8_0 ocupa 775 MB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; el autor entreno en una RTX 4060 de 8 GB, por lo que esa tarjeta es suficiente para inferencia.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, llama.cpp, Ollama (mediante el `Modelfile` incluido) y la demo Gradio propia. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no se proporcionan cifras concretas; la demo Gradio muestra metricas de RTF y throughput en tiempo real, pero no se publican valores de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| my-tiny-audio | 754M | no disponible | en | MIT | safetensors, GGUF | Encoder Granite Speech + decoder Qwen3.5-0.8B, entrenado en 5,4 h de LibriSpeech |
| Whisper (variantes pequenas) | no disponible en la informacion | no disponible | multilingue | MIT | safetensors, GGUF | Referencia ASR ampliamente usada; no se dispone de datos concretos en la informacion proporcionada |
| Granite Speech 5.0 (encoder base) | 470M (solo encoder) | no disponible | no disponible | no disponible | no disponible | Componente congelado del propio modelo |
| Qwen3.5-0.8B (decoder base) | 0,8B | no disponible | no disponible | no disponible | no disponible | Decodificador de texto reutilizado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado unicamente sobre el split dev-clean de LibriSpeech (5,4 horas), por lo que la generalizacion a otros dominios, acentos, ruido o vocabulario tecnico es incierta.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No se han publicado benchmarks ni tasas de error (WER), lo que impide evaluar su calidad objetiva frente a alternativas.
- Riesgo de alucinacion inherente al decodificador de lenguaje: puede generar texto plausible que no corresponda al audio.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar `asr_modeling.py` y `asr_pipeline.py` antes de usarlo en produccion.
- No se documentan sesgos conocidos, pero al entrenarse solo con LibriSpeech (audiolibros en ingles) puede presentar sesgo hacia ese tipo de habla y registro.
- La licencia MIT permite uso comercial, pero las licencias de los modelos base (Granite Speech 5.0 y Qwen3.5-0.8B) deben verificarse por separado.
- El repo pesa 5,4 GB e incluye duplicados (safetensors, GGUF BF16 y GGUF Q8_0), lo que aumenta el espacio de almacenamiento necesario.
- No hay informacion sobre longitud de contexto, tool calling ni soporte para agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaron-hu26/my-tiny-audio
- Encoder base Granite Speech 5.0: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc-nc
- Decodificador base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos externas.
