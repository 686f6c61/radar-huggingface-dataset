# Nukthean/krama-asr-khmer

## Resumen

Krama Khmer ASR es un modelo de reconocimiento automático del habla (ASR) especializado en jemer (camboyano), desarrollado por el usuario Nukthean y publicado bajo licencia Apache-2.0. Se construye sobre la torre de audio de `google/embeddinggemma-2` y añade un lector CTC bidireccional con RoPE y un decodificador causal de 3 capas que actúa como rescorer, con un total de 345.000.672 parámetros. Su objetivo es ofrecer transcripción de voz a texto en jemer de alta precisión en entornos offline, tanto en CPU como en GPU y navegador.

El modelo se entrena sobre un corpus propio de 1.568,77 horas repartidas en 8 dominios (DDD, NXKMER, Slang, FLEURS, iAny, OpenSLR-42, MPWT y GRKPP), con controles estrictos de fuga de datos mediante hablantes congelados y prompts reservados. Emplea un vocabulario de 3.072 clústeres ortográficos jemer y decodificación conjunta CTC más beam-5 con rescoring neuronal.

Es relevante porque cubre un idioma con pocos recursos ASR de calidad, ofrece un CER macro del 3,33 % en un benchmark limpio de 5 dominios y dispone de variantes ONNX INT8 y una demo en navegador, lo que facilita su despliegue en producción sin dependencia de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder híbrido: torre de audio Conformer de 12 capas (embeddinggemma-2) + adaptador 1536→512 + lector CTC bidireccional RoPE de 6 capas + decodificador causal de 3 capas con cross-attention (rescorer) |
| Parametros totales | 345.000.672 (343,4 M únicos; 345,0 M sin atar en `model.safetensors`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en bfloat16 (SafeTensors); variante ONNX con INT8 dinámico (358,3 MiB) |
| Idiomas soportados | Jemer (km) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (bfloat16, 658,2 MiB); ONNX INT8 dinámico en repositorio separado |

## Arquitectura y entrenamiento

El modelo combina la torre de audio de `google/embeddinggemma-2` (Conformer de 12 capas, con las 9 capas superiores descongeladas en las fases Stage 2B/3) con un adaptador `Gemma4MultimodalEmbedder` que proyecta de 1536 a 512 dimensiones. Sobre esa representación opera un lector CTC de 6 capas con self-attention bidireccional y RoPE (`d_model=512`, 8 cabezas, `d_ff=2048`), con taps InterCTC en las capas 2 y 4, y una cabeza de salida CTC con cuello de botella SwiGLU de 2 capas (512→1024→3072). El decodificador es un transformer causal de 3 capas (`d_model=512`, 8 cabezas) con cross-attention a la capa 6 del lector, preentrenado durante 45.000 pasos sobre 573.689 frases jemer y posteriormente integrado en un esquema de replay de modelo de lenguaje.

El entrenamiento se realizó en varias fases: una Phase 0 de preentrenamiento de texto (45.000 pasos), una Stage 2A con replay de LM, y una Stage 2B con warm-restart SWA (Cycle-2) hasta un total de 75.000 pasos. Se incorporó robustez frente a ancho de banda y ganancia de micrófono, y se aplicaron guardas estrictas contra fuga de datos: 8 hablantes de evaluación congelados (686 clips de iAny) y 52 prompts duplicados de NXKMER excluidos de los conjuntos de entrenamiento. El corpus cubre 1.568,77 horas con una cobertura ortográfica del 99,99411 % de clústeres (0 `<unk>`, sin espacios en las transcripciones).

## Capacidades

- Transcripción de voz a texto en jemer (camboyano) con salida en clústeres ortográficos jemer.
- Decodificación greedy CTC o beam-5 con rescoring mediante decodificador neuronal conjunto.
- Inferencia offline en CPU, GPU y navegador (variante ONNX con `onnxruntime-web` WASM).
- Robustez frente a variaciones de ancho de banda y ganancia de micrófono.
- Procesamiento de audio en WAV, FLAC y MP3 a cualquier frecuencia de muestreo.
- Generalización a hablantes no vistos (2,69 % CER en 8 hablantes iAny no vistos).
- Cobertura de 8 dominios de habla (conversacional, lectura, noticias, etc.).
- API autónoma de un solo archivo (`krama_asr.py`) con `load_model` y `transcribe`.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de ASR.

## Casos de uso

- Subtitulado automático de contenido audiovisual en jemer: el modelo transcribe audio de vídeo o pódcast con beam-5 y rescoring neuronal, adecuado para generar subtítulos con un CER bajo en dominios limpios (3,33 % macro).
- Transcripción de reuniones y entrevistas: gracias a su robustez ante ganancia y ancho de banda de micrófono, puede procesar grabaciones de calidad variable sin preprocesado intensivo.
- Digitalización de archivos orales: permite convertir grabaciones históricas o de campo en texto jemer para archivos y bibliotecas, con inferencia offline en CPU mediante la variante ONNX INT8.
- Asistentes de voz en aplicaciones móviles o web: la demo en navegador con `onnxruntime-web` WASM permite transcripción en el cliente sin instalar dependencias, útil para interfaces de voz ligeras.
- Atención al cliente en jemer: integración en pipelines de transcripción de llamadas para análisis de calidad y búsqueda de texto, con despliegue en servidores sin GPU mediante ONNX.
- Investigación lingüística y creación de corpus: el vocabulario de 3.072 clústeres y la salida sin espacios facilitan la anotación y el análisis morfológico del jemer.
- Fine-tuning específico de dominio: al estar en SafeTensors y PyTorch con licencia Apache-2.0, se puede reentrenar sobre jerga sectorial (legal, médico) partiendo del checkpoint publicado.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| FLEURS km_KH (755 clips) | Beam-5 CER (%) | 6,32 |
| DDD test (300 clips) | Beam-5 CER (%) | 3,58 |
| iAny unseen (160 clips) | Beam-5 CER (%) | 2,69 |
| 5-Domain Clean (975 clips) | Beam-5 Macro CER (%) | 3,33 |

Los resultados son declarados por el autor y no están verificados de forma independiente. El modelo reporta además un 51,4 % de coincidencia exacta en el benchmark de 5 dominios y un CER macro del 3,34 % para la variante ONNX INT8 con Beam-5, con 0,188 s por clip en modo greedy sobre un Intel Core i5-13400F.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan 658,2 MiB; al cargarse se convierten a float32, por lo que se recomienda al menos 2-3 GB de VRAM/RAM para el modelo y buffers de audio.
- GPU recomendadas: cualquier GPU con soporte bfloat16 o float32; no se especifican modelos concretos, pero una RTX 4090 o A100 ofrecerán latencias muy bajas. El modelo es lo bastante pequeño para GPUs de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-3 GB de memoria (GTX 1650, RTX 3050, etc.).
- Despliegue: PyTorch con `torch>=2.6`, `transformers>=5.22`, `safetensors>=0.8.0`, `soundfile`, `soxr` y `huggingface_hub`; variante ONNX con `onnxruntime` (sin PyTorch); demo en navegador con `onnxruntime-web` WASM; CLI y app web autoalojable en el repositorio de GitHub.
- Latencia y throughput: 0,188 s por clip en modo greedy con ONNX INT8 sobre Intel Core i5-13400F; la variante ONNX es 1,76× más rápida que PyTorch en CPU. No se documentan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER jemer | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krama Khmer ASR | 345 M | No disponible | 3,33 % macro (5 dominios) | Apache-2.0 | Hugging Face, ONNX, demo web |
| Whisper (variantes multilingües) | 39 M–1,55 B | 30 s de audio | No disponible para jemer en esta ficha | MIT | Amplia |
| Modelos ASR específicos de jemer | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos verificados con otros modelos ASR de jemer en la información proporcionada. Whisper se incluye como referencia genérica de ASR multilingüe, pero no se han publicado cifras de CER en jemer en esta ficha.

## Limitaciones y advertencias

- Solo soporta jemer (km); no se documentan otros idiomas.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados o dominios alejados del corpus de entrenamiento.
- La longitud de contexto de audio no está documentada; se desconoce el límite máximo de duración por clip.
- Sesgos potenciales derivados de la composición del corpus (8 dominios y hablantes concretos); puede rendir peor en variedades dialectales o registros no cubiertos.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda validar el rendimiento en el dominio objetivo antes de producción.
- La variante ONNX INT8 presenta una ligera degradación (3,34 % frente a 3,33 % macro CER) y está limitada a decodificación greedy y beam-5.
- Requiere Python >= 3.11 y versiones específicas de dependencias (`torch>=2.6`, `transformers>=5.22`), lo que puede complicar la integración en entornos legacy.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nukthean/krama-asr-khmer
- Variante ONNX: https://huggingface.co/Nukthean/krama-asr-khmer-onnx
- Demo en navegador: https://huggingface.co/spaces/Nukthean/krama-asr-khmer-demo
- Repositorio GitHub: https://github.com/NukThean/krama-asr-khmer
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Corpus de entrenamiento: https://huggingface.co/datasets/Nukthean/krama-asr-khmer-corpus
- Dataset DDD: https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
- Dataset NXKMER: https://huggingface.co/datasets/NTQAI/nxkmer-tts-450
- FLEURS: https://huggingface.co/datasets/google/fleurs
- FLEURS jemer limpio: https://huggingface.co/datasets/Nukthean/fleurs-khmer-cleaned
- iAny Khmer Voice: https://huggingface.co/datasets/sengtha/iany-khmer-voice
- Khmer GRKPP Speech: https://huggingface.co/datasets/seanghay/khmer_grkpp_speech
- Khmer MPWT Speech: https://huggingface.co/datasets/seanghay/khmer_mpwt_speech
- OpenSLR-42 jemer limpio: https://huggingface.co/datasets/Nukthean/openslr42-khmer-cleaned
