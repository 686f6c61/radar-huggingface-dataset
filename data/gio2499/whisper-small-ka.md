# gio2499/whisper-small-ka

## Resumen

Whisper Small Georgian es un ajuste fino (fine-tuning) del modelo openai/whisper-small de OpenAI para reconocimiento automático de voz en georgiano (ქართული). Lo desarrolla el usuario gio2499 y se publica bajo licencia MIT. El modelo resuelve un problema concreto: el Whisper-small original, entrenado mayoritariamente con datos en inglés y lenguas europeas, falla de forma catastrófica en georgiano, llegando a un WER del 448,30 % en zero-shot por bucles y repeticiones de texto. Este ajuste reduce el WER al 27,92 % sobre el split de test de Common Voice 27.0.

Arquitectónicamente es un transformer encoder-decoder de tipo Whisper, con 241.734.912 parámetros totales (unos 242 M) y pesos en formato safetensors. El entrenamiento se realizó sobre el split oficial de entrenamiento de Mozilla Common Voice Scripted Speech 27.0 en georgiano (99.768 clips), con 5.000 pasos de ajuste fino completo. Es relevante porque cubre una lengua de bajos recursos con pocos modelos ASR públicos y porque mejora de forma sustancial al modelo previo de referencia (sanchit-gandhi/whisper-small-ka-1k-steps), que se quedaba en un WER del 46,33 %.

El modelo está pensado para transcripción de voz leída y limpia, no para habla espontánea, y su ventana nativa de 30 segundos obliga a trocear audios largos. Su reducido tamaño permite ejecutarlo en GPU de consumo e incluso en CPU con cuantización, lo que lo hace utilizable en despliegues locales y de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | georgiano (ka) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con atención estándar diseñado para ASR y traducción de voz. No incorpora innovaciones arquitectónicas propias: el ajuste es un fine-tuning completo de todos los parámetros (no LoRA ni adaptadores), manteniendo la arquitectura original de Whisper y su procesamiento de espectrogramas log-Mel con ventana de 30 segundos.

El entrenamiento usó el split oficial de entrenamiento de Common Voice Scripted Speech 27.0 en georgiano (99.768 clips), dejando intactos los splits de dev y test. Se realizaron 5.000 pasos con batch efectivo de 16 (8 × 2 de acumulación de gradientes), learning rate de 1e-5 con 500 pasos de warmup, precisión fp16 y gradient checkpointing. Todo el entrenamiento se ejecutó en una única NVIDIA RTX 4070 Laptop GPU de 8 GB en aproximadamente 4,5 horas. No se documenta uso de RLHF ni DPO, algo esperable en un ajuste ASR supervisado.

## Capacidades

- Reconocimiento automático de voz (transcripción) en georgiano.
- Transcripción de audio de hasta 30 segundos por segmento; audios más largos requieren troceado (por ejemplo, `chunk_length_s=30` en el pipeline de Transformers).
- Soporte de normalización de texto en la evaluación: Unicode NFC, conversión de Mtavruli a Mkhedruli y eliminación de puntuación.
- Uso directo mediante `transformers.pipeline("automatic-speech-recognition")` con `language="georgian"` y `task="transcribe"`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio de entrada y texto de salida.
- Capacidad multilingüe limitada al georgiano: el ajuste está especializado en una sola lengua.

## Casos de uso

- Transcripción de archivos de audio en georgiano: el modelo convierte grabaciones de voz leída en texto, adecuado para digitalizar contenido como artículos de Wikipedia leídos o corpus de voz. Es su caso de uso principal y el que refleja la evaluación sobre Common Voice.
- Subtitulado y generación de actas de reuniones con habla clara: para audios de más de 30 segundos se trocea el audio en segmentos y se transcriben por separado, aprovechando la ventana nativa del modelo.
- Indexación y búsqueda de contenido audiovisual en georgiano: la transcripción permite generar índices de texto sobre los que construir búsqueda semántica o por palabras clave en archivos de audio y vídeo.
- Asistentes de voz para lenguas de bajos recursos: el tamaño reducido (242 M de parámetros) permite integrar el modelo en aplicaciones con recursos limitados o en despliegues locales, reduciendo la dependencia de servicios en la nube.
- Investigación en ASR para georgiano: sirve como línea base reproducible y como punto de partida para ajustes posteriores, dado que documenta datos, hiperparámetros y hardware de entrenamiento.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido hablado en georgiano, siempre que el audio sea relativamente limpio y de voz leída.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Mozilla Common Voice Scripted Speech 27.0 (georgiano), con 14.258 clips y la misma normalización de texto para todos los modelos. Los valores no están verificados de forma independiente (`verified: false`).

| Modelo | WER ↓ | CER ↓ |
|---|---|---|
| openai/whisper-small (zero-shot) | 448,30 | 162,36 |
| sanchit-gandhi/whisper-small-ka-1k-steps | 46,33 | 12,22 |
| gio2499/whisper-small-ka (este modelo) | 27,92 | 8,81 |

El WER en zero-shot supera el 100 % porque el modelo base tiende a entrar en bucles y repetir texto sobre audio en georgiano. El autor atribuye buena parte de la mejora frente al modelo previo al mayor número de pasos (5.000 frente a 1.000) y al uso del split de entrenamiento más amplio de Common Voice 27.0.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada; con 242 M de parámetros, en fp16 los pesos ocupan aproximadamente 0,5 GB, por lo que el modelo cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el propio autor entrenó en una RTX 4070 Laptop de 8 GB, y para inferencia bastan GPUs más modestas. GPUs de datacenter como A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo.
- Opciones de despliegue: pipeline de Transformers (`automatic-speech-recognition`); no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER (CV ka test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gio2499/whisper-small-ka | 241.734.912 | 30 s por segmento | 27,92 | MIT | Hugging Face |
| sanchit-gandhi/whisper-small-ka-1k-steps | no disponible | 30 s por segmento | 46,33 | no disponible | Hugging Face |
| openai/whisper-small (zero-shot) | no disponible | 30 s por segmento | 448,30 | no disponible | Hugging Face |

La comparativa se limita a los modelos incluidos en la model card. No se dispone de datos de otros modelos ASR para georgiano en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre Common Voice, que es habla leída: clips cortos, limpios y en su mayoría frases de Wikipedia. Se espera un aumento del error en habla espontánea, ruido de fondo, audio telefónico y dialectos regionales.
- Los clips de más de 30 segundos deben trocearse (`chunk_length_s=30` en el pipeline); no procesa audio largo de forma nativa.
- Especializado exclusivamente en georgiano; no debe esperarse un rendimiento multilingüe.
- Riesgo de alucinación y bucles de repetición inherente a Whisper, especialmente fuera del dominio de entrenamiento (el propio modelo base muestra este comportamiento en zero-shot).
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base openai/whisper-small y de los datos de Common Voice empleados en el entrenamiento.
- No se documentan sesgos específicos más allá de los derivados de la distribución de Common Voice.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gio2499/whisper-small-ka
- Modelo base: https://huggingface.co/openai/whisper-small
- Modelo previo de referencia: https://huggingface.co/sanchit-gandhi/whisper-small-ka-1k-steps
- Repositorio de código: https://github.com/ (enlace genérico incluido en la model card, sin ruta específica)
