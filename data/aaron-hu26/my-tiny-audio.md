# aaron-hu26/my-tiny-audio

## Resumen

my-tiny-audio es un modelo ligero de reconocimiento automatico del habla (ASR) de tipo speech-to-text construido siguiendo la arquitectura tiny-audio, que combina un codificador de audio con un modelo de lenguaje como decodificador de texto. Lo desarrolla el usuario aaron-hu26 y se publica bajo licencia MIT. El modelo resuelve la transcripcion de audio a texto en ingles con un coste computacional muy bajo, lo que lo hace adecuado para prototipado y despliegue en hardware de consumo.

La arquitectura ensambla tres piezas: un codificador de audio congelado basado en Conformer de IBM (granite-speech-5.0-470m-turboctc-nc, 470M parametros), un proyector MLP de dos capas entrenado (1024 a 1024 con GELU) y un decodificador de texto Qwen3.5-0.8B afinado con LoRA y fusionado en los pesos base. El total de parametros declarado en safetensors es de 752.261.952, y el repositorio ocupa 3,9 GB.

Es relevante ahora como ejemplo de ensamblaje reproducible de un pipeline multimodal audio-LLM en una sola GPU de consumo (RTX 4060 de 8 GB), con exportaciones GGUF para llama.cpp y Ollama. El entrenamiento se limita al split clean/validation de LibriSpeech (5,4 horas), por lo que debe considerarse un modelo experimental mas que un sistema ASR de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Conformer congelado + proyector MLP (2 capas) + decodificador LLM Qwen3.5-0.8B con LoRA fusionado |
| Parametros totales | 752.261.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (GGUF sin perdida) y Q8_0 (GGUF 8 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (decoder), GGUF (BF16 y Q8_0), projector.pt |

## Arquitectura y entrenamiento

El modelo sigue el patron tiny-audio: un codificador de audio congelado (granite-speech-5.0-470m-turboctc-nc, extractor de caracteristicas basado en Conformer de 470M parametros) genera representaciones que un proyector MLP de dos capas (1024 a 1024 con activacion GELU, stride de pooling 1) alinea con el espacio de embeddings del decodificador de texto. El decodificador es Qwen3.5-0.8B, afinado mediante un adaptador LoRA (r=16, alpha=32) que se fusiona matematicamente en los pesos base con merge_and_unload(). El tokenizador tiene un vocabulario de 248k y se incorpora un token especial `<audio>` en la configuracion del decodificador.

El entrenamiento se realizo en una unica GPU de consumo (NVIDIA RTX 4060 de 8 GB), sobre el split clean/validation de LibriSpeech (dev-clean, 5,4 horas de audio), con batch por dispositivo de 2 y acumulacion de gradiente de 2 (batch efectivo de 4). Se uso el optimizador AdamW con tasa de aprendizaje de 2e-4, warmup y decaimiento coseno. La perdida paso de 4,238 en el primer paso a 0,1069 en el paso 800, con gradientes estables. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Transcripcion de audio a texto en ingles (ASR / speech-to-text).
- Procesamiento de audio en formatos WAV, MP3 y FLAC a traves de la demo Gradio incluida.
- Entrada de audio por microfono o por fichero en la interfaz web.
- Conversacion interactiva mediante Ollama con el GGUF Q8_0 incluido.
- Integracion con llama.cpp y Ollama gracias a las exportaciones GGUF.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de salida ni modo thinking.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Prototipado rapido de ASR en local: el modelo se puede ejecutar en una RTX 4060 de 8 GB y permite validar un pipeline speech-to-text completo sin infraestructura en la nube, usando la demo Gradio incluida.
- Transcripcion de notas de voz en ingles: con el GGUF Q8_0 y Ollama, se puede desplegar un servicio de transcripcion en un portatil o estacion de trabajo de gama media para audio corto en ingles.
- Experimentacion academica con arquitecturas tiny-audio: sirve como referencia reproducible para estudiar el ensamblaje de codificador de audio congelado, proyector MLP y decodificador LLM con LoRA fusionado.
- Base para fine-tuning sobre dominios especificos: al estar bajo licencia MIT y con pesos en safetensors, se puede reentrenar el proyector y el adaptador sobre corpus propios en ingles.
- Evaluacion de despliegue en llama.cpp: los GGUF BF16 y Q8_0 permiten medir latencia y consumo de memoria en CPU y GPU de consumo para comparar con otras alternativas ASR.
- Demo interactiva en entornos educativos: la app Gradio de un solo fichero facilita mostrar el funcionamiento de un sistema ASR multimodal en talleres y clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la curva de perdida de entrenamiento (de 4,238 a 0,1069 en 800 pasos) sobre el split dev-clean de LibriSpeech, sin metricas estandar como WER, MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: el decodificador en BF16 ocupa 1,43 GB en safetensors y 1,51 GB en GGUF BF16; la version Q8_0 ocupa 775 MB. Sumando el codificador de audio y el proyector, el conjunto cabe holgadamente en 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el autor entreno en una RTX 4060 de 8 GB, que es suficiente tambien para inferencia.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4070 y superiores; tambien en CPU mediante llama.cpp con el GGUF Q8_0.
- Opciones de despliegue: transformers (Python), llama.cpp, Ollama (con el Modelfile incluido) y demo Gradio propia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| my-tiny-audio | 752M | No disponible | Ingles | MIT | safetensors, GGUF |
| Whisper large-v3 (referencia) | 1.550M | 30 s de audio | Multilingue | MIT | safetensors, GGUF |
| Qwen2-Audio (referencia) | ~8.000M | No disponible | Multilingue | No disponible | safetensors |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de my-tiny-audio con estas alternativas; la comparativa se limita a parametros, licencia y formato de pesos.

## Limitaciones y advertencias

- Entrenado unicamente sobre 5,4 horas del split clean/validation de LibriSpeech, por lo que la generalizacion a otros dominios, acentos, ruido o audio espontaneo es muy limitada.
- Solo soporta ingles; no se ha validado su comportamiento en otros idiomas.
- Riesgo elevado de alucinacion y de transcripciones incorrectas fuera del dominio de entrenamiento, dado el escaso volumen de datos.
- No se han publicado metricas WER ni evaluaciones independientes; el unico indicador es la perdida de entrenamiento.
- El modelo es experimental y no esta pensado para produccion sin una evaluacion exhaustiva previa.
- La licencia MIT permite uso comercial, pero se debe verificar la compatibilidad de las licencias de los modelos base (Granite Speech 5.0 de IBM y Qwen3.5-0.8B de Alibaba Cloud) para el uso previsto.
- No se documentan sesgos especificos, pero al entrenar solo con LibriSpeech (audio de lectura en ingles) es probable que presente sesgos hacia ese tipo de habla y acentos.
- La longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de audios largos.

## Enlaces

- Hugging Face: https://huggingface.co/aaron-hu26/my-tiny-audio
- Codificador base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc-nc
- Decodificador base: https://huggingface.co/Qwen/Qwen3.5-0.8B
