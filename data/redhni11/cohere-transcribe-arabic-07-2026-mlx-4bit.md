# redhni11/cohere-transcribe-arabic-07-2026-MLX-4bit

## Resumen

Cohere Transcribe Arabic — MLX 4-bit es una conversión no oficial del modelo de reconocimiento automático del habla (ASR) CohereLabs/cohere-transcribe-arabic-07-2026, publicada por el usuario redhni11 en Hugging Face. El modelo original lo desarrollan Cohere y Cohere Labs bajo licencia Apache 2.0, y está especializado en transcripción de audio en árabe. Esta versión concreta aplica cuantización de 4 bits en formato MLX para permitir la inferencia en dispositivos Apple Silicon.

El modelo cuenta con aproximadamente 2.065 millones de parámetros (2,06 mil millones) y un tamaño de repositorio de 1,5 GB, lo que lo sitúa en la gama de modelos ASR de tamaño medio, manejables en hardware de consumo. La conversión emplea cuantización afín de MLX a 4 bits con tamaño de grupo 64 sobre todas las capas lineales y de embedding bidimensionales, manteniendo el resto de tensores en bf16.

Su relevancia radica en que facilita el despliegue local y eficiente de un modelo ASR especializado en árabe sobre Macs con chip Apple Silicon mediante la librería mlx-audio-swift, sin necesidad de infraestructura en la nube. No obstante, se trata de una conversión no oficial sin fine-tuning ni modificaciones de pesos, por lo que hereda las características y limitaciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR base Cohere Transcribe; detalles no especificados en la informacion) |
| Parametros totales | 2.065.804.048 (aprox. 2,06 mil millones) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín 4 bits (group size 64) en capas lineales/embedding 2D; resto en bf16 |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base CohereLabs/cohere-transcribe-arabic-07-2026 (no se especifica si es un transformer encoder-decoder, un modelo tipo Whisper, Conformer u otra variante). Lo que sí se conoce es que se trata de un modelo de reconocimiento automático del habla especializado en árabe, con unos 2,06 mil millones de parámetros.

Esta versión concreta es una conversión no oficial realizada por redhni11 sobre la revisión `c3e911b42149bf7a1e53d5cef9878aee87515a23` del modelo original. La cuantización aplicada es afín de MLX a 4 bits con tamaño de grupo 64, restringida a todas las capas lineales y de embedding bidimensionales, mientras que el resto de tensores se mantienen en bf16. No se realizó fine-tuning ni ninguna otra modificación de los pesos. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en árabe: transcribe audio a texto en lengua árabe.
- Especialización monolingüe: el modelo está entrenado y orientado exclusivamente al árabe.
- Requiere especificar el idioma de forma explícita (`ar`); no realiza detección automática de idioma.
- Ejecución en dispositivo (on-device) mediante MLX y mlx-audio-swift (`CohereTranscribeModel`) en hardware Apple Silicon.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá de la transcripción ni modo de pensamiento.

## Casos de uso

- Transcripción de reuniones y entrevistas en árabe: el modelo convierte grabaciones de audio en texto para actas, resúmenes o archivos buscables, aprovechando su especialización monolingüe en árabe.
- Subtitulado de contenido audiovisual en árabe: generación de subtítulos para vídeos, pódcasts o material formativo en lengua árabe de forma local.
- Dictado y accesibilidad en aplicaciones macOS/iOS: integración mediante mlx-audio-swift para ofrecer entrada por voz en árabe en dispositivos Apple Silicon sin conexión a la nube.
- Procesamiento de audio confidencial en local: al ejecutarse on-device, permite transcribir grabaciones sensibles sin enviarlas a servicios externos, útil en entornos con requisitos de privacidad.
- Archivado y digitalización de material oral: transcripción por lotes de bibliotecas de audio en árabe (entrevistas, conferencias, archivos históricos) para su indexación y búsqueda.
- Prototipado e investigación en ASR árabe: base ligera (1,5 GB) para experimentar con pipelines de reconocimiento de voz en árabe en equipos de desarrollo con Apple Silicon.
- Preprocesamiento para pipelines de NLP en árabe: generación de transcripciones que alimenten tareas posteriores como análisis de sentimiento, resumen o traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 1,5 GB en cuantización 4 bits, por lo que se requiere al menos ese espacio más el overhead de ejecución; una estimación razonable es de 2 a 3 GB de memoria unificada para inferencia.
- Hardware objetivo: chips Apple Silicon (series M1, M2, M3, M4 y posteriores) mediante el framework MLX.
- Compatibilidad con GPU NVIDIA (A100, H100, RTX 4090) u otras: no disponible; esta conversión está orientada a MLX y no se documenta soporte para CUDA.
- Opciones de despliegue: mlx-audio-swift (`CohereTranscribeModel`) según la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Cohere Transcribe Arabic — MLX 4-bit (esta ficha) | ~2,06 mil millones | no disponible | arabe | Apache 2.0 | safetensors (MLX 4 bits) |
| CohereLabs/cohere-transcribe-arabic-07-2026 (original) | ~2,06 mil millones (presumible, misma base) | no disponible | arabe | Apache 2.0 | no disponible |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Conversión no oficial: no está publicada por Cohere ni Cohere Labs; el autor es un tercero (redhni11), sin garantías de mantenimiento o soporte.
- Sin fine-tuning ni modificación de pesos: hereda íntegramente el comportamiento y posibles sesgos del modelo original.
- Monolingüe: solo soporta árabe; no detecta el idioma automáticamente, por lo que es obligatorio pasar `ar` de forma explícita.
- Cuantización a 4 bits: puede introducir una pérdida de precisión en la transcripción respecto al modelo original en bf16, especialmente en audio ruidoso o con acentos marcados.
- Dependencia de hardware: orientado a MLX y Apple Silicon; no apto para despliegue en GPU NVIDIA u otras plataformas sin conversión adicional.
- Riesgo de alucinación y errores de transcripción: como todo modelo ASR, puede generar texto incorrecto o inventado en segmentos de audio de baja calidad, solapamiento de voces o ruido de fondo.
- Sesgos: no se documentan en la información disponible análisis específicos de sesgos por dialecto, género o registro del árabe.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones y limitaciones indicadas en la model card del modelo original.
- Sin datos de benchmarks ni de evaluación: no es posible validar el rendimiento de esta cuantización frente a alternativas sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redhni11/cohere-transcribe-arabic-07-2026-MLX-4bit
- Modelo base original: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Librería mlx-audio-swift: https://github.com/Blaizzy/mlx-audio-swift
- Cohere: https://cohere.com
- Cohere Labs: https://cohere.com/research
