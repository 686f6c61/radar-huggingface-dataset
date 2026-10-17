# mewmix/qwen3-tts-owells-unicron

## Resumen

`mewmix/qwen3-tts-owells-unicron` es un ajuste fino (fine-tune) de un solo hablante sobre el modelo de síntesis de voz `Qwen/Qwen3-TTS-12Hz-0.6B-Base`, publicado por el usuario mewmix. El objetivo no es un TTS de propósito general, sino capturar un timbre y una dicción concretos: el hablante se registra como `cosmic_voice` (ID `3000`) y está inspirado en la interpretación de Orson Welles como Unicron. Genera audio en inglés a 24 kHz, en mono, y se distribuye junto con la aplicación Gradio y los scripts de inferencia local que usó el autor.

El modelo resuelve un problema muy acotado: disponer de una voz fija y reconocible, servible en local, sin depender de APIs externas de clonación. Para ello el autor reentrenó todos los parámetros del modelo base (905.788.672 parámetros reales según los safetensors, pese al "0.6B" del nombre) sobre un conjunto de datos minúsculo: 9 clips que suman 40,07 segundos. Es, por tanto, un experimento de estilo y de cadena de herramientas (inferencia, efectos DSP y exportación WAV/OGG) más que un modelo de producción.

Su relevancia ahora es doble. Por un lado, muestra lo barato que resulta hoy especializar un TTS de ~0,9 B parámetros en una GPU de consumo. Por otro lado, su model card es un ejercicio de transparencia poco habitual: documenta hashes, configuración de entrenamiento, límites del servicio y, de forma explícita, aquello que no está verificado (los transcripts, los derechos del dataset y del personaje). Las búsquedas web realizadas no han devuelto información técnica adicional sobre este modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (síntesis de voz basada en códec; el autor no detalla la topología interna) |
| Parámetros totales | 905.788.672 (~0,91 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el autor no publica ventana de contexto. En la app: 1.000 caracteres de prompt y 1.024 tokens de códec generados |
| Tipos de cuantización | no disponible; el autor no publica cuantizaciones (tampoco export ONNX). Ejecución en bfloat16 o float32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 para el checkpoint y la documentación; Apache 2.0 para el código y los activos originales de Qwen |
| Formato de pesos | safetensors, con el códec de voz necesario incluido en el repositorio |
| Pipeline | text-to-speech |
| Hablante | `cosmic_voice`, ID `3000` (mono-hablante) |
| Frecuencia de muestreo / formato de salida | 24 kHz, mono, PCM16 WAV (también OGG desde la app) |
| Librería | `qwen3-tts` |
| Tamaño del repositorio | 2,5 GB |
| Modelo base | `Qwen/Qwen3-TTS-12Hz-0.6B-Base` (relación: finetune) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-TTS con tasa de tokens de códec de 12 Hz y 0,6 B parámetros nominales; el autor no documenta la topología interna (número de capas, atención, vocoder). El checkpoint publicado es un ajuste fino de parámetros completos con AdamW, sobre 9 clips que totalizan 40,07 segundos (aproximadamente 35 segundos de voz detectada), semilla 42 y dos épocas. El registro de entrenamiento indica 18 pasos de batch con acumulación de gradiente 4; el trainer empleado cuenta los batches como pasos globales y su calendario nativo de acumulación implica 6 actualizaciones del optimizador en las 2 épocas. El checkpoint seleccionado se etiqueta como `cosmic_voice_v1`, `checkpoint-epoch-1`, correspondiente a la segunda época.

No hay constancia de RLHF, DPO ni preferencias humanas; tampoco de evaluación objetiva. El autor declara explícitamente que los transcripts del dataset siguen sin revisar, que los derechos y el consentimiento del dataset no están verificados y que no se registraron los prompts originales, las semillas de generación ni los ajustes de decodificación. Las innovaciones que aporta el release no están en el modelo, sino en el envoltorio: app Gradio con modulación DSP (pitch, bass, presence, compresión, grit, room), análisis de referencia que estima tono y pitch —sin entrenar ni clonar—, reprocesado de audio sin reinferencia y exportación WAV/OGG. El enlace de voz añade 0,45 segundos cuando se activa el efecto de sala.

## Capacidades

- Síntesis de voz en inglés para un único hablante fijo (`cosmic_voice`), a 24 kHz.
- Generación de habla a partir de texto plano; el modelo de 0,6 B ignora los prompts de instrucción, por lo que no admite control por lenguaje natural de estilo, emoción o velocidad.
- Reproducción de un timbre concreto inspirado en una interpretación actoral, con resultados estables sobre el dominio del dataset de entrenamiento.
- Modulación de salida en la app: pitch (−1 semitono por defecto), bass, presence, compresión, grit, sala y filtrado fijo.
- "Reference matching" que estima pitch y tono general a partir de un audio de referencia; no entrena ni clona otra voz.
- Reprocesado de audio ya generado o subido, sin volver a ejecutar inferencia.
- Exportación a WAV y OGG desde la interfaz.
- Ejecución local en CUDA (bfloat16 si está soportado, si no float32), Apple Silicon MPS y CPU (ambos en float32).
- No soporta tool calling, agentes, visión, audio de entrada como contexto conversacional ni razonamiento multi-paso: es un modelo TTS puro.

## Casos de uso

- Doblaje y narración de personajes en proyectos amateur: la voz está pensada para un registro grandilocuente; con la cadena de efectos incorporada se puede ajustar tono y presencia sin salir de la app.
- Pruebas de concepto de videojuego o mod: generar líneas de un antagonista concreto en local, exportando WAV a 24 kHz para integrarlo en el motor.
- Producción de audio para pódcast o ficción sonora: la app permite aplicar compresión, sala y saturación y exportar la mezcla final en un solo paso.
- Investigación sobre ajuste fino de TTS con datos escasos: el repositorio documenta la receta completa (2 épocas, 40 s de audio, AdamW, semilla) y sirve como caso de estudio reproducible de sobreajuste controlado.
- Evaluación de cadenas de post-procesado DSP: al separar "raw" y "processed", permite medir el efecto de pitch, EQ y compresión sobre la inteligibilidad percibida.
- Demo educativa de despliegue local de TTS: `gradio_app.py` con selección automática de dispositivo y sin FlashAttention es un ejemplo mínimo de servicio en contenedor detrás de un proxy inverso.
- Generación de avisos o frases cortas con voz de personaje para prototipos de experiencias interactivas, asumiendo una inferencia concurrente como máximo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica literalmente que no existe evaluación objetiva ni benchmark de rendimiento en producción, y que las muestras incluidas no tienen revisión de escucha registrada. Tampoco se han encontrado datos adicionales en la búsqueda web realizada.

| Métrica | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K y similares | no aplica (modelo TTS) |
| MOS / CMOS / WER de síntesis | no disponible |
| Similitud de hablante (SECS) | no disponible |
| Latencia y throughput | no disponible (el autor solo advierte de que CPU "puede ser lenta") |
| Evaluación subjetiva de las muestras | no disponible (sin revisión de escucha) |

## Requisitos de hardware

- Pesos: ~0,91 B parámetros. En float32 ocupan ~3,6 GB; en bfloat16, ~1,8 GB. Añadir el códec de voz incluido y el overhead del runtime.
- VRAM estimada: entre 4 y 6 GB en bfloat16 para inferencia con la app Gradio; el repositorio completo ocupa 2,5 GB en disco.
- Cabe en GPU de consumo: cualquier tarjeta con 6 GB o más (RTX 3060, 4060, 4070, 4090) es suficiente por capacidad de pesos. El autor no publica requisitos mínimos ni cifras de consumo.
- GPU de datacenter (A100, H100): sobredimensionadas para este modelo; no aportan nada que no dé una consumer, salvo concurrencia, que la app limita a una inferencia simultánea.
- Apple Silicon: soportado vía MPS en float32; CPU también soportada con `--device cpu`, con la advertencia de lentitud.
- Despliegue: el repositorio incluye `gradio_app.py` y `run_local.py` sobre un entorno `uv` bloqueado. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, ni existen exportaciones ONNX o cuantizadas.
- Servicio: una inferencia a la vez con cola acotada, prompts de 1.000 caracteres, 1.024 tokens de códec, subidas de 60 s y 25 MB; caché de audio de una hora y borrado de sesión tras una hora de inactividad. Autenticación, TLS y timeouts deben ir en el proxy inverso. La app no expone API Gradio ni enlace público.
- FlashAttention no es necesario.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / límites | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mewmix/qwen3-tts-owells-unicron` | 905.788.672 | inglés | 1.000 caracteres y 1.024 tokens de códec en la app | CC BY 4.0 (checkpoint) + Apache 2.0 (código y activos Qwen) | HuggingFace, 0 descargas, 1 like, publicado el 2026-10-17 |
| `Qwen/Qwen3-TTS-12Hz-0.6B-Base` (base) | ~0,6 B nominales | no disponible en la información | no disponible | Apache 2.0 (según el aviso de licencias del autor) | HuggingFace |
| Otras familias TTS open source (p. ej. Kokoro, XTTS-v2, Parler-TTS) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de especificaciones verificadas de alternativas comparables; la búsqueda web realizada no devolvió resultados relevantes (los resultados obtenidos trataban sobre MMA y no guardan relación con el modelo). Cualquier comparación numérica con otras familias TTS exigiría consultar sus model cards, que no forman parte de este conjunto de datos.

## Limitaciones y advertencias

- Un solo hablante y un solo idioma (inglés). No hay soporte multilingüe ni cambio de voz.
- El modelo de 0,6 B ignora los prompts de instrucción: no se puede pedir "más lento", "susurrando" o "enfadado" por texto.
- No clona voces: el "reference matching" solo estima pitch y tono general y no entrena ni replica otro hablante.
- Entrenado con 40,07 segundos de audio en 2 épocas: riesgo alto de sobreajuste, poca cobertura fonética y probable degradación fuera de las frases del dominio.
- Los transcripts del dataset no están revisados y las muestras incluyen discrepancias de ASR; ninguna de las dos transcripciones tiene revisión de escucha registrada. La fidelidad del texto sintetizado, por tanto, no está garantizada.
- Riesgo de alucinación acústica: artefactos, ruido, prosodia anómala o audio truncado, sin métricas objetivas que lo cuantifiquen.
- Los derechos del dataset y el consentimiento de los hablantes no están verificados; los derechos sobre grabaciones de terceros, la interpretación y el personaje no se conceden.
- El modelo es no oficial y no reclama respaldo ni reproducción exacta de la interpretación original. La licencia CC BY 4.0 cubre el checkpoint y la documentación, pero no los derechos de terceros; hay que conservar los avisos de `LICENSE` y `NOTICE` y mantener la atribución de Apache 2.0 de los activos de Qwen.
- Servicio limitado por diseño: una inferencia simultánea, sin API pública, con caché y sesiones caducadas; no apto para cargas concurrentes sin envolverlo en una cola propia.
- No se publican el estado del optimizador, checkpoints alternativos, cuantizaciones ni exportaciones ONNX: no hay vía oficial para reducir requisitos de memoria.
- No hay evaluación objetiva ni benchmark de producción, ni latencia o throughput medidos.
- Sin prompts, semillas ni ajustes de decodificación registrados: la reproducibilidad exacta de las muestras no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mewmix/qwen3-tts-owells-unicron
- Dataset de entrenamiento: https://huggingface.co/datasets/mewmix/qwen3-tts-owells-unicron-data
- Procedencia de los datos: https://huggingface.co/datasets/mewmix/qwen3-tts-owells-unicron-data/blob/main/provenance.json
- Metadatos de muestras y hashes: https://huggingface.co/mewmix/qwen3-tts-owells-unicron/blob/main/samples/metadata.json
- Metadatos de entrenamiento y hashes del release: https://huggingface.co/mewmix/qwen3-tts-owells-unicron/blob/main/provenance.json
- Licencia del repositorio: https://huggingface.co/mewmix/qwen3-tts-owells-unicron/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/mewmix/qwen3-tts-owells-unicron/blob/main/NOTICE
- Texto de Apache 2.0 incluido: https://huggingface.co/mewmix/qwen3-tts-owells-unicron/blob/main/licenses/Apache-2.0.txt
- Trainer registrado (Qwen3-TTS-EasyFinetuning, commit 03c53fa): https://github.com/mozi1924/Qwen3-TTS-EasyFinetuning/tree/03c53fa5c5c419e61f1614c46d4e7f43d0e9b4ed
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
