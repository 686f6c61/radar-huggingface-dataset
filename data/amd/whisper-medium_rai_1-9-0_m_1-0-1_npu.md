# amd/whisper-medium_rai_1.9.0_m_1.0.1_npu

## Resumen

`amd/whisper-medium_rai_1.9.0_m_1.0.1_npu` es una versión optimizada del modelo de reconocimiento automático del habla Whisper Medium de OpenAI, publicada por AMD para su ejecución acelerada en las NPU (unidades de procesamiento neuronal) integradas en procesadores AMD Ryzen AI. El modelo se distribuye en formato ONNX y está pensado para inferencia local en hardware de PC con arquitectura x86 de AMD, no para servidores GPU convencionales.

Se trata de una conversión cuantizada del checkpoint original `openai/whisper-medium`, lo que implica que hereda la arquitectura transformer encoder-decoder de Whisper y sus aproximadamente 769 millones de parámetros, pero con los grafos y pesos adaptados al runtime Ryzen AI. El sufijo `rai_1.9.0` hace referencia a la versión del stack Ryzen AI Software, y `m_1.0.1` a la versión del modelo compilado dentro de ese pipeline.

Su relevancia práctica es acotada pero específica: permite transcribir audio en tiempo real o casi real en un portátil o mini-PC con Ryzen AI sin recurrir a la nube ni a una GPU dedicada, aprovechando la NPU para reducir el consumo energético. El acceso al repositorio está restringido (gated) y requiere aceptar las condiciones en Hugging Face. La licencia del modelo base es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Medium), exportado a ONNX y optimizado para NPU AMD Ryzen AI |
| Parámetros totales | Aproximadamente 769 millones (heredados de openai/whisper-medium; no especificado en la ficha del repo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper Medium original: ventana de audio de 30 segundos por segmento) |
| Tipos de cuantización | No disponible en la información proporcionada (el tag indica `base_model:quantized`) |
| Idiomas soportados | No disponibles en la ficha del repo (Whisper Medium original: multilingüe, ~99 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (adaptado al runtime Ryzen AI); no se distribuye en safetensors ni GGUF |
| Tamaño del repositorio | 1,4 GB |
| Pipeline | automatic-speech-recognition |
| Acceso | Restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Medium: un transformer encoder-decoder entrenado por OpenAI sobre pares audio-texto a gran escala, con un encoder que procesa espectrogramas Mel de 30 segundos y un decoder autorregresivo que genera tokens de texto. Whisper se entrenó con una mezcla multitarea que incluye transcripción, traducción al inglés y detección de idioma, además de datos débiles supervisados de internet y datos supervisados de alta calidad.

Esta publicación concreta de AMD no aporta información sobre un reentrenamiento propio: es una conversión y optimización del checkpoint original para el stack Ryzen AI. El pipeline `rai_1.9.0` incluye la compilación del grafo ONNX para la NPU y, presumiblemente, cuantización para reducir el coste computacional en ese acelerador, aunque los detalles exactos de calibración y precisión numérica no están documentados en la información disponible. No hay datos publicados sobre datasets adicionales, RLHF o DPO específicos de esta versión.

## Capacidades

- Reconocimiento automático del habla (ASR) a partir de audio de hasta 30 segundos por segmento, con segmentación para audios más largos.
- Transcripción multilingüe heredada de Whisper Medium (el modelo original soporta decenas de idiomas, aunque la ficha del repo no detalla la lista).
- Traducción de audio a texto en inglés (tarea `translate` de Whisper).
- Detección de idioma y marcas temporales a nivel de segmento.
- Ejecución en NPU AMD Ryzen AI mediante ONNX Runtime con el proveedor de ejecución de Ryzen AI.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido; no es un modelo de lenguaje general.
- No se documentan capacidades de visión, audio generativo ni diálogo.

## Casos de uso

- Transcripción local de reuniones en un portátil con Ryzen AI: el modelo procesa el audio capturado por el micrófono y genera la transcripción sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado automático de vídeo en edición de escritorio: integrado en una aplicación de edición, permite generar pistas de subtítulos con marcas temporales aprovechando la NPU y liberando la CPU y la GPU para el renderizado.
- Dictado por voz en herramientas de productividad: la baja latencia esperada en NPU permite retroalimentación casi en tiempo real mientras el usuario habla, con segmentación de audio en bloques de 30 segundos.
- Actas y notas de clases o entrevistas: el modelo transcribe grabaciones largas divididas en segmentos, útil en investigación cualitativa o periodismo donde el audio no debe salir del dispositivo.
- Accesibilidad en aplicaciones de videollamada: generación de subtítulos en directo en el propio equipo del usuario, sin depender de servicios externos.
- Procesamiento por lotes de archivos de audio en estaciones de trabajo AMD: al ejecutarse en NPU, deja libres CPU y GPU para otras tareas del pipeline (por ejemplo, análisis de texto posterior con un LLM local).
- Filtrado y preprocesado de audio para pipelines de datos: transcripción masiva de corpus de audio en hardware de escritorio antes de un análisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del repositorio no incluye métricas de WER (word error rate), latencia ni throughput, ni comparaciones con otras implementaciones de Whisper Medium. Cualquier cifra de rendimiento en NPU dependería del modelo concreto de Ryzen AI, la versión del driver y el runtime, datos que no se proporcionan.

## Requisitos de hardware

- NPU AMD Ryzen AI: requisito principal; el modelo está compilado para esta unidad y no está pensado para ejecutarse en GPU NVIDIA o AMD convencionales.
- Procesadores compatibles: la familia Ryzen AI (serie 7040/8040 y posteriores, según el soporte del stack Ryzen AI 1.9.0); no se detalla la lista exacta en la información disponible.
- VRAM: no aplica en el sentido tradicional; el modelo reside en memoria del sistema y utiliza la NPU. El tamaño del repo (1,4 GB) da una idea del espacio en disco necesario.
- GPU dedicada: no necesaria; el modelo no se distribuye en formato para GPU.
- Opciones de despliegue: ONNX Runtime con el proveedor de ejecución de Ryzen AI, dentro del ecosistema Ryzen AI Software. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| amd/whisper-medium_rai_1.9.0_m_1.0.1_npu | ~769 M | 30 s por segmento (heredado) | ONNX (Ryzen AI) | Apache 2.0 | NPU AMD Ryzen AI |
| openai/whisper-medium | ~769 M | 30 s por segmento | PyTorch safetensors | Apache 2.0 | GPU/CPU genéricos |
| openai/whisper-small | ~244 M | 30 s por segmento | PyTorch safetensors | Apache 2.0 | GPU/CPU genéricos |
| openai/whisper-large-v3 | ~1,55 B | 30 s por segmento | PyTorch safetensors | Apache 2.0 | GPU con VRAM suficiente |

La diferencia clave frente a `openai/whisper-medium` no está en la calidad del modelo sino en el empaquetado: la versión de AMD solo es útil si se dispone de una NPU Ryzen AI y del stack correspondiente. Para despliegue en GPU o servidor, el checkpoint original o `faster-whisper`/`whisper.cpp` son alternativas más flexibles. No hay datos de rendimiento comparativo publicados para esta versión.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Dependencia de hardware: solo funciona en NPU AMD Ryzen AI con el stack Ryzen AI 1.9.0 o compatible; no es portable a otros aceleradores sin reconversión.
- Idiomas: la ficha no lista los idiomas soportados; aunque Whisper Medium es multilingüe, conviene verificar el comportamiento tras la cuantización para idiomas distintos del inglés.
- Cuantización: al ser una versión cuantizada, es esperable una degradación del WER respecto al checkpoint original en FP16, especialmente en audio con ruido o acentos marcados; no se publican métricas que lo cuantifiquen.
- Sesgos y alucinaciones: Whisper es conocido por generar texto plausible en silencios o música y por sesgos derivados de sus datos de entrenamiento; esta versión hereda esos problemas sin mitigaciones documentadas.
- Contexto limitado: ventana de 30 segundos por segmento, con dependencia de un pipeline de segmentación para audios largos.
- Uso comercial: la licencia Apache 2.0 lo permite, pero deben revisarse los términos del stack Ryzen AI Software y del acceso gated en Hugging Face.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/whisper-medium_rai_1.9.0_m_1.0.1_npu
- Modelo base: https://huggingface.co/openai/whisper-medium
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper de OpenAI: https://github.com/openai/whisper
- Ryzen AI Software (AMD): https://www.amd.com/en/developer/resources/ryzen-ai-software.html
