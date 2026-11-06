# jtap123/whisper-tiny_chinese_english

## Resumen

Whisper tiny chinese_english es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario jtap123 en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder Transformer de Whisper, en su variante "tiny", la mas pequena de la familia original de OpenAI. El modelo parte de los pesos preentrenados de whisper-tiny y se reentrena sobre un dataset denominado chinese_english_english, con el objetivo de especializarlo en transcripcion de audio en ingles.

El modelo cuenta con 37.760.640 parametros totales y un tamano de repositorio de 0,3 GB, lo que lo situa en la gama ultraligera de modelos ASR. Su relevancia radica en su bajo coste computacional: puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace adecuado para prototipado rapido, despliegues en el borde (edge) o pipelines de transcripcion con requisitos de latencia muy estrictos. No obstante, al derivar de whisper-tiny, hereda las limitaciones de precision de esa variante.

La model card es escasa y generada automaticamente por el Trainer de Hugging Face; el autor no ha documentado la composicion del dataset, los usos previstos ni las limitaciones. El modelo declara un WER de 12,8674 sobre el split de test del dataset chinese_english_english, un resultado que debe interpretarse con cautela dado que el dataset no es estandar ni verificable publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Whisper en su variante tiny: un Transformer encoder-decoder con atencion multi-cabeza estandar, disenado para mapear espectrogramas Mel de audio a secuencias de tokens de texto. Whisper utiliza un tokenizer multilingue BPE y fue preentrenado originalmente por OpenAI sobre 680.000 horas de audio debilmente supervisado; este ajuste fino parte de esos pesos y los especializa sobre un corpus concreto.

El entrenamiento se realizo con el Trainer de Hugging Face con los siguientes hiperparametros: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW (variante torch fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. Se ejecutaron 2.000 pasos (aproximadamente 2,57 epocas). No se documenta el numero de tokens de audio ni la composicion exacta del dataset chinese_english_english, ni si se aplicaron tecnicas de RLHF, DPO o aumentacion de datos. Las versiones de framework utilizadas fueron Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles: transcripcion de audio a texto.
- Generacion de texto condicionada a audio mediante el decoder autorregresivo.
- Soporte de timestamps a nivel de palabra o segmento, heredado de la arquitectura Whisper (sujeto a configuracion en inferencia).
- Capacidad multilingue limitada: el modelo declara unicamente ingles, aunque el nombre del dataset sugiere presencia de chino en los datos; no hay evidencia documentada de soporte funcional de chino.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo ASR).
- No dispone de modo "thinking", vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: el modelo puede procesar audio de hasta 30 segundos por ventana (con chunking para audios mas largos) y generar transcripciones en tiempo casi real en CPU, adecuado para herramientas internas de actas.
- Prototipado rapido de pipelines ASR: al ocupar 0,3 GB y 37,7 M de parametros, permite iterar sobre preprocesado de audio, postprocesado de texto y evaluacion de WER sin necesidad de GPU dedicada.
- Despliegue en el borde (edge) y dispositivos con recursos limitados: su tamano permite ejecucion en Raspberry Pi, moviles o navegadores via ONNX, para subtitulado local sin conexion.
- Generacion de subtitulos para videos en ingles: integrable en pipelines de postproduccion donde se requiera una primera pasada de transcripcion con timestamps.
- Preprocesado de datos para entrenamiento de modelos mayores: util como etiquetador automatico de audio en ingles para construir datasets de ASR a bajo coste.
- Educacion y practica de pronunciacion: transcripcion de audio de estudiantes para comparar con texto de referencia y calcular tasas de error.
- Investigacion en ajuste fino de ASR: sirve como punto de partida reproducible (semilla, hiperparametros y versiones documentadas) para experimentos de fine-tuning sobre dominios especificos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | chinese_english English (split test) | WER | 12,8674 |
| Automatic Speech Recognition | chinese_english English (validacion, epoca 1,2837) | WER | 13,9317 |
| Automatic Speech Recognition | chinese_english English (validacion, epoca 2,5674) | WER | 12,8674 |

| Epoca | Paso | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1,2837 | 1000 | 0,1138 | 0,2974 | 13,9317 |
| 2,5674 | 2000 | 0,0541 | 0,2875 | 12,8674 |

No se han publicado resultados en benchmarks estandar (LibriSpeech, Common Voice, FLEURS) en la informacion disponible, por lo que no es posible comparar directamente con whisper-tiny original ni con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (37,7 M de parametros), aproximadamente 0,15 GB en FP16 y menos de 0,1 GB en cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050, RTX 3050, RTX 4090, A100, H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica (no es un modelo de texto generativo puro), llama.cpp no soporta Whisper de forma nativa, Ollama no lo soporta, TGI no lo soporta; alternativas: faster-whisper (CTranslate2), whisper.cpp, ONNX Runtime y SpeechBrain.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera inferencia en tiempo real o mas rapida en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| jtap123/whisper-tiny_chinese_english | 37,7 M | ventanas de 30 s | en | apache-2.0 | 12,87 (dataset propio) |
| openai/whisper-tiny | 39 M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74 M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |

La comparacion directa de WER no es posible porque el modelo evalua sobre un dataset no estandar (chinese_english_english) mientras que los modelos originales se evaluan sobre LibriSpeech, Common Voice y FLEURS. La ventaja principal de este ajuste fino es su especializacion declarada; la desventaja, la ausencia de evaluacion en benchmarks publicos y la falta de documentacion del dataset.

## Limitaciones y advertencias

- Model card generada automaticamente y sin completar: el autor no documenta usos previstos, limitaciones ni composicion del dataset.
- El WER de 12,8674 no es verificable ni comparable con benchmarks estandar; el dataset chinese_english_english no tiene referencia publica conocida.
- Riesgo de alucinacion en la transcripcion: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio o ruido.
- Soporte de idioma declarado unicamente en ingles; el nombre del dataset sugiere datos en chino, pero no hay evidencia de capacidad funcional bilingue.
- Al derivar de whisper-tiny, la precision en audio con acentos marcados, ruido de fondo o vocabulario tecnico es limitada en comparacion con variantes base, small o medium.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo sobre datos propios antes de produccion.
- Sin verificacion de sesgos: no se han publicado analisis de sesgo demografico, linguistico o de genero.
- Fecha de creacion futura (2026-11-02) en los metadatos de Hugging Face, lo que sugiere posible manipulacion de metadatos o error del autor; conviene tratarlo con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jtap123/whisper-tiny_chinese_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper original de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
