# Hothaifa/heq-ai-stt-pro

## Resumen

heq-ai-stt-pro es un modelo de reconocimiento automático de voz (ASR) especializado en árabe, desarrollado por Hothaifa dentro de la serie HEQ-AI de la plataforma HEQ WERDK. Se trata de un ajuste fino completo (full fine-tuning) sobre la arquitectura Whisper, con 241.734.912 parámetros (aproximadamente 244 M, la variante media de la familia Whisper), orientado específicamente a la transcripción de recitaciones coránicas y audio en árabe a texto ortográfico sin diacritización (sin tashkil).

El modelo resuelve un problema concreto: la transcripción de recitación coránica y árabe general con un formato de salida limpio, sin marcas vocálicas, lo que simplifica el postprocesado en aplicaciones de subtitulado, indexación o búsqueda sobre audio religioso. Según la model card, alcanza un WER del 20,68 % sobre recitaciones variadas y complejas, un dato que debe interpretarse con cautela al no especificarse el conjunto de evaluación.

Es relevante ahora porque los modelos ASR multilingües genéricos suelen rendir peor en dominios especializados como la recitación coránica, con vocabulario, prosodia y estilo de elocución particulares. Un ajuste específico de 244 M de parámetros es ligero, desplegable en hardware modesto y con licencia Apache 2.0, lo que facilita su integración en productos. No obstante, el modelo tiene un volumen de adopción muy bajo (37 descargas, 0 likes) y documentación técnica escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder, ajuste fino completo) |
| Parametros totales | 241.734.912 (~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper base usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | ar (arabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper, un transformer encoder-decoder diseñado para ASR que procesa audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. El tamaño de 241,7 M de parámetros corresponde a la variante media de Whisper (whisper-medium tiene 769 M; el recuento real de este checkpoint apunta a una variante más pequeña, probablemente whisper-small o una base ajustada, aunque la model card menciona "244M Parameters" como "versión media" de la serie HEQ-AI). El ajuste se realizó mediante full fine-tuning, no mediante LoRA ni adaptadores, según indica el autor.

El entrenamiento se llevó a cabo en GPUs A100 usando datos de audio distribuidos a través de la red HEQ-CDN, según la model card. No se especifican el número de horas de audio, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, RLHF o decodificación especulativa. La innovación principal es el dominio de especialización (recitación coránica) y el formato de salida sin diacríticos, que reduce la ambigüedad del postprocesado frente a transcripciones con tashkil.

## Capacidades

- Reconocimiento automático de voz en árabe, con especialización en recitación coránica.
- Transcripción a texto ortográfico sin diacritización (sin tashkil), formato limpio para indexación y búsqueda.
- Procesamiento de audio en ventanas de 30 segundos conforme al pipeline estándar de Whisper.
- Integración con la librería `transformers` mediante el pipeline `automatic-speech-recognition`.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente para árabe.
- No se documentan modos de razonamiento, visión ni audio de salida.

## Casos de uso

- Subtitulado y transcripción de recitaciones coránicas: el modelo genera texto sin diacríticos directamente, lo que elimina una fase de normalización en la cadena de producción de subtítulos para vídeos o retransmisiones religiosas.
- Indexación y búsqueda de archivos de audio: al producir texto ortográfico limpio, las transcripciones pueden alimentar motores de búsqueda o bases de datos documentales sobre sermones y recitaciones.
- Aplicaciones de memorización y estudio del Corán: la transcripción permite comparar la recitación del usuario con el texto de referencia y detectar desviaciones, aunque el WER del 20,68 % limita la precisión para corrección automática estricta.
- Archivado y catalogación de bibliotecas de audio en árabe: un modelo de 244 M puede ejecutarse por lotes en CPU o GPU modesta para transcribir grandes volúmenes de grabaciones.
- Investigación lingüística y análisis de corpus orales: la salida sin tashkil facilita el análisis morfológico y estadístico de corpus de árabe hablado.
- Prototipado rápido de asistentes de voz en árabe: la licencia Apache 2.0 y el reducido tamaño permiten integrar el modelo en demos y productos internos sin coste de licencia.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| WER | 20,68 % | Recitaciones variadas y complejas (no se especifica el conjunto) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El único dato de rendimiento es el WER del 20,68 % reportado por el autor, sin desglose por subconjunto ni comparación con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (241,7 M de parámetros × 4 bytes), más overhead de activaciones y del encoder de audio; en la práctica, 2-3 GB son suficientes.
- En fp16/bf16: aproximadamente 0,5 GB de pesos, con un total realista de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100 o H100 no son necesarias para inferencia, solo se usaron para el entrenamiento según el autor.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y modelos similares; también puede ejecutarse en CPU para transcripción por lotes con latencia mayor.
- Opciones de despliegue: pipeline de `transformers` con `automatic-speech-recognition`; también es compatible con `faster-whisper` o `whisper.cpp` si se convierte a los formatos correspondientes (no se publican conversiones oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | WER reportado |
|---|---|---|---|---|---|
| heq-ai-stt-pro | 241,7 M | ventana de audio de 30 s | ar | Apache 2.0 | 20,68 % (recitacion coranica) |
| OpenAI Whisper small | 244 M | ventana de audio de 30 s | multilingue (99 idiomas) | MIT | no disponible en esta ficha |
| OpenAI Whisper medium | 769 M | ventana de audio de 30 s | multilingue (99 idiomas) | MIT | no disponible en esta ficha |
| Modelos ASR arabes especializados | no disponible | no disponible | ar | variable | no disponible |

La comparación directa con Whisper no es posible en términos de WER porque los conjuntos de evaluación difieren y el autor no publica el suyo. La ventaja de heq-ai-stt-pro es la especialización en recitación coránica y la salida sin diacríticos; su desventaja es la falta de multilingüismo y la documentación limitada.

## Limitaciones y advertencias

- El WER del 20,68 % es alto para aplicaciones de transcripción estricta; no es adecuado para corrección automática de recitación sin revisión humana.
- El conjunto de evaluación no está especificado, por lo que el WER no es reproducible ni comparable con otros modelos.
- El modelo está entrenado únicamente para árabe; no se garantiza su funcionamiento en otros idiomas.
- Riesgo de alucinación y de errores en audio con ruido, acentos no vistos o recitaciones con estilos poco representados en el entrenamiento.
- No se documentan sesgos específicos, pero al estar especializado en texto coránico puede tener un vocabulario limitado fuera de ese dominio.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene un volumen de adopción muy bajo (37 descargas) y no ha sido validado por la comunidad.
- La model card menciona "Open Ai" de forma ambigua y no aclara la relación exacta con los pesos originales de Whisper; conviene verificar la procedencia antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Hothaifa/heq-ai-stt-pro
- HEQ WERDK: https://heqwerdk.com
- Repositorio de Whisper (arquitectura base): https://github.com/openai/whisper
