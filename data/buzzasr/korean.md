# BuzzASR/korean

## Resumen

BuzzASR/korean es un modelo de reconocimiento automático del habla (ASR) monolingüe para coreano, desarrollado por BuzzASR (laboratorio Lemn Lab) y publicado como un fine-tuning de openai/whisper-large-v3. Forma parte de BuzzASR, una suite de 102 modelos ASR especializados por idioma presentada en el artículo arXiv:2609.09554 (Findings of EMNLP 2026). El modelo resuelve el problema de la transcripción precisa de audio en coreano, un idioma donde los modelos multilingües genéricos suelen rendir por debajo de lo deseable.

Arquitectónicamente es un transformer encoder-decoder de tipo Whisper, con 1.543.490.560 parámetros totales (aproximadamente 1,54 mil millones) y un tamaño de repositorio de 3,1 GB en formato safetensors. El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial, y está integrado en la librería transformers con pipeline `automatic-speech-recognition`. Su relevancia actual radica en que, según la model card, alcanza el CER más bajo entre los sistemas open source comparados (Whisper-large-v3, Omnilingual 1B/7B, MMS, Qwen3-ASR y Cohere Transcribe) sobre el conjunto combinado de FLEURS y Common Voice.

El modelo está pensado para un único idioma (coreano) y no soporta otras lenguas, por lo que su valor está en la especialización: reduce el CER aproximadamente un 1,2x respecto a Whisper-large-v3 en zero-shot sobre el conjunto combinado de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite fp16 en inferencia) |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning directo de openai/whisper-large-v3, un transformer encoder-decoder con atención estándar y ventana de audio de 30 segundos por segmento. Según la model card, el entrenamiento emplea "simple fine-tuning": se conserva el tokenizador de Whisper y se realiza únicamente un ajuste supervisado de ASR, sin cambios arquitectónicos ni decodificación especulativa. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

Los datos de entrenamiento combinan FLEURS y Common Voice Corpus 25.0 (Mozilla, marzo de 2025), con un límite por idioma según el artículo, más datos solo de texto del corpus Goldfish (Chang et al., 2026). La evaluación se realizó sobre FLEURS y Common Voice, con métricas CER y WER calculadas con jiwer 3.0.4 tras una normalización que pasa a minúsculas, elimina caracteres no alfabéticos (salvo apóstrofos y guiones) y colapsa espacios; las diferencias de espaciado cuentan como errores. Una evaluación independiente con la herramienta kocer (v0.5.0) determinó que `num_beams=5` ofrece el CER más bajo en los seis conjuntos de test coreanos evaluados, por lo que esa es la configuración recomendada.

## Capacidades

- Reconocimiento automático del habla en coreano a partir de audio de 16 kHz mono.
- Transcripción de audio con prompt de idioma y tarea integrado en la configuración de generación (no requiere pasar `language=`).
- Decodificación con beam search (`num_beams=5`) recomendada para minimizar el CER.
- Evaluación con métricas CER y WER sobre FLEURS y Common Voice.
- Integración nativa con transformers (`WhisperForConditionalGeneration`, `WhisperProcessor`).
- Soporte de inferencia en fp16 sobre GPU.
- No soporta tool calling, function calling, agentes, visión, audio multilingüe ni modo de razonamiento extendido (thinking mode); es un modelo puramente ASR monolingüe.

## Casos de uso

- Transcripción de reuniones y actas en coreano: el modelo procesa audio de 16 kHz mono y genera transcripciones con un CER de 4,61 en el conjunto combinado, adecuado para documentación interna y resúmenes posteriores.
- Subtitulado automático de vídeo en coreano: se puede ejecutar por segmentos de hasta 30 segundos (ventana de Whisper) y combinar con un pipeline de segmentación para generar subtítulos con bajo error de caracteres.
- Atención al cliente por voz en coreano: integrado en un sistema de telefonía o IVR, transcribe las intervenciones del usuario para enrutarlas a un chatbot o a un agente humano, con licencia MIT que permite uso comercial.
- Generación de conjuntos de datos etiquetados: al tener un CER bajo (4,24 en Common Voice 25), sirve para preetiquetar audio coreano y reducir el coste de anotación humana en proyectos de datos.
- Búsqueda y análisis de contenido audiovisual: transcripción de archivos de audio o vídeo coreanos para indexación, búsqueda por palabras clave y análisis de sentimiento sobre el texto resultante.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en contextos de habla coreana, desplegando el modelo con vLLM o TGI en GPU.
- Investigación en ASR coreano: al ser un fine-tuning reproducible de Whisper-large-v3 con métricas publicadas, sirve como línea base para comparar nuevas técnicas de adaptación al coreano.

## Benchmarks y rendimiento

| Test set | CER (%) | WER (%) | Whisper-large-v3 zero-shot CER (%) |
|---|---|---|---|
| FLEURS | 5,16 | 13,22 | 5,31 |
| Common Voice 25 | 4,24 | 14,11 | 6,01 |
| Combined | 4,61 | 13,74 | 5,72 |

Según la model card, el modelo logra el CER más bajo de todos los sistemas open source comparados (Whisper-large-v3, Omnilingual 1B/7B, MMS, Qwen3-ASR y Cohere Transcribe) sobre el conjunto combinado, con una reducción de CER de aproximadamente 1,2x frente a Whisper zero-shot. No se han publicado en la información disponible resultados desglosados de esos competidores ni métricas adicionales (por ejemplo, latencia o throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,54 mil millones de parámetros, en fp16 requiere aproximadamente 3,1 GB de pesos más overhead de activaciones y caché; en fp32, alrededor de 6,2 GB.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con concurrencia; RTX 4090 o RTX 3090 para inferencia individual de alta velocidad.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4070) usando fp16.
- Opciones de despliegue: transformers con `WhisperForConditionalGeneration`, vLLM, TGI, y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no confirmado en la información disponible).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | CER combinado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BuzzASR/korean | 1,54 B | ventana de 30 s (Whisper) | 4,61 | MIT | Hugging Face |
| openai/whisper-large-v3 | ~1,55 B | ventana de 30 s (Whisper) | 5,72 | MIT | Hugging Face |
| Omnilingual 1B | ~1 B | no disponible | no disponible (comparado en paper) | no disponible | no disponible |
| Omnilingual 7B | ~7 B | no disponible | no disponible (comparado en paper) | no disponible | no disponible |
| MMS | no disponible | no disponible | no disponible (comparado en paper) | no disponible | no disponible |
| Qwen3-ASR | no disponible | no disponible | no disponible (comparado en paper) | no disponible | no disponible |
| Cohere Transcribe | no disponible | no disponible | no disponible (comparado en paper) | no disponible | no disponible |

La model card afirma que BuzzASR/korean supera en CER a todos estos sistemas sobre el conjunto combinado, pero no se aportan los valores numéricos de cada competidor en la información disponible.

## Limitaciones y advertencias

- Modelo monolingüe: solo reconoce coreano; no admite otros idiomas ni cambio de idioma dinámico.
- Evaluación limitada a FLEURS y Common Voice: el rendimiento en otros dominios (jerga técnica, dialectos regionales, audio con ruido) puede degradarse y no está cuantificado.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir texto plausible no presente en el audio, especialmente en segmentos silenciosos o con ruido.
- Sensibilidad a la configuración de decodificación: la evaluación independiente con kocer muestra que ajustes distintos de `num_beams=5` empeoran el CER; usar la configuración recomendada es importante para reproducir los resultados.
- Sesgos: no se documentan análisis de sesgo por género, edad o acento en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (Common Voice y FLEURS) si se redistribuye el modelo o se usa en productos regulados.
- Dependencia de la ventana de 30 segundos de Whisper: para audio largo es necesario segmentar y gestionar la concatenación de transcripciones.
- No soporta tool calling, agentes ni multimodalidad; no es adecuado para tareas que no sean ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuzzASR/korean
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper (arXiv:2609.09554): https://arxiv.org/abs/2609.09554
- Página del proyecto BuzzASR: https://lemn-lab.github.io/buzz-asr/
- Colección de modelos BuzzASR: https://huggingface.co/BuzzASR
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Common Voice (Mozilla): https://commonvoice.mozilla.org/en/datasets
- Repositorio kocer: https://github.com/Choi-kwan-u/kocer
- Perfil de Kwan-u Choi (evaluación independiente): https://huggingface.co/Gonow1
