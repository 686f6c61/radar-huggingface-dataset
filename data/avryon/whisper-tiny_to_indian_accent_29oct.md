# AVryon/whisper-tiny_to_indian_accent_29oct

## Resumen

Whisper tiny Indian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario AVryon, orientado al reconocimiento automático de voz (ASR) sobre inglés con acento indio. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,76 millones de parámetros totales y un peso en disco de aproximadamente 0,3 GB, lo que lo sitúa en la gama ultraligera de modelos ASR.

El objetivo declarado es mejorar la transcripción de habla en inglés indio, un dominio donde el modelo base whisper-tiny rinde peor que en inglés estándar. El autor reporta un WER de 10,4970 sobre el split de test del dataset Indian_english, con una pérdida de validación de 0,2578 tras 2000 pasos de entrenamiento.

Su relevancia práctica es acotada pero clara: es un modelo muy pequeño, con licencia Apache 2.0 y compatible con la librería transformers, adecuado para prototipos de transcripción en entornos con recursos limitados o para despliegue en CPU. No obstante, la documentación es mínima (la propia model card indica "More information needed" en varias secciones) y no hay garantías formales sobre la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado originalmente para ASR y traducción de voz. No se documentan modificaciones arquitectónicas respecto al modelo base; se trata de un fine-tuning completo sobre los pesos preentrenados.

El entrenamiento se realizó sobre el dataset Indian_english con los siguientes hiperparámetros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluación de 1, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. Se reportan dos puntos de evaluación: en el paso 1000 (epoch 1,1655) se obtuvo una pérdida de validación de 0,2685 y un WER de 11,8524; en el paso 2000 (epoch 2,3310) la pérdida bajó a 0,2578 y el WER a 10,4970. No se documenta el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un fine-tuning ASR supervisado).

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés, con especialización en acento indio.
- Transcripción de audio a texto mediante el pipeline `automatic-speech-recognition` de transformers.
- Compatible con el ecosistema Hugging Face (endpoints_compatible, carga directa con `WhisperForConditionalGeneration`).
- Soporte de audio de entrada en el formato estándar de Whisper (mel-spectrogramas de 80 canales).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma declarada.

## Casos de uso

- Transcripción de reuniones y llamadas de equipos con hablantes de inglés indio: el fine-tuning reduce el WER frente al modelo base en este dominio concreto, y su tamaño reducido permite procesar audio en tiempo casi real en CPU.
- Subtitulado automático de vídeos corporativos o académicos con acento indio: al ser un modelo de 37,7 M de parámetros, se puede integrar en pipelines de post-procesado sin necesidad de GPU dedicada.
- Prototipado rápido de asistentes de voz: la licencia Apache 2.0 y el formato safetensors facilitan la experimentación y el despliegue en entornos de desarrollo.
- Preprocesado de audio para sistemas de análisis de sentimiento o extracción de entidades: la transcripción se puede encadenar con modelos de NLP posteriores, y el bajo coste computacional permite escalar horizontalmente.
- Investigación sobre sesgos acústicos en ASR: sirve como punto de comparación entre whisper-tiny base y una versión ajustada a una variedad dialectal específica.
- Despliegue en dispositivos edge o entornos con restricciones de memoria: con 0,3 GB de pesos, cabe en sistemas embebidos con 1 GB de RAM o en instancias cloud de gama baja.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Whisper tiny Indian | Indian English | test | WER | 10,4970 |
| Whisper tiny Indian (paso 1000) | Indian English | validación | WER | 11,8524 |
| Whisper tiny Indian (paso 2000) | Indian English | validación | WER | 10,4970 |

No se han publicado resultados comparativos con whisper-tiny base ni con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,15 GB de pesos más overhead de activaciones; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,08 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, T4). También funciona en CPU sin problemas.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en Raspberry Pi 4/5 con llama.cpp o similar.
- Opciones de despliegue: transformers (pipeline nativo), vLLM (soporte ASR limitado, verificar), llama.cpp (con conversión a GGUF), Ollama (previa conversión), TGI (soporte de Whisper en versiones recientes).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | WER (Indian English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Indian (este) | 37,76 M | 30 s (estándar Whisper) | 10,4970 (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | 30 s | no disponible en la información | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | 30 s | no disponible en la información | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible en la información | Apache 2.0 | Hugging Face |

No se dispone de datos de WER comparativos para los modelos base en el mismo dataset, por lo que la comparativa cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card original contiene secciones marcadas como "More information needed" (descripción, usos previstos, datos de entrenamiento), lo que dificulta evaluar su robustez.
- Sesgos potenciales: al estar ajustado sobre un dataset de inglés indio, puede tener un rendimiento inferior en otras variedades de inglés o en hablantes con otros acentos.
- Riesgo de alucinación: como todo modelo ASR generativo, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con solapamiento de hablantes.
- Limitación de idioma: solo se declara soporte para inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset Indian_english antes de un despliegue en producción.
- Contexto de audio limitado a 30 segundos por segmento (característica estándar de Whisper), lo que requiere segmentación previa para audios largos.
- Sin validación independiente: el WER reportado no está verificado (`verified: false`) y no se han publicado evaluaciones externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AVryon/whisper-tiny_to_indian_accent_29oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentación de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
