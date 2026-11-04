# MistMoon/smomni-1104

## Resumen

`MistMoon/smomni-1104` es un repositorio de HuggingFace publicado por el usuario MistMoon que contiene un checkpoint de pesos en formato safetensors con arquitectura declarada como llama y un total de 8.030.261.248 parámetros (aproximadamente 8 mil millones). El repositorio ocupa 37 GB, lo que es coherente con un modelo denso de ese tamaño almacenado en precisión de 16 bits o superior junto con artefactos auxiliares. No se dispone de información sobre el propósito declarado del modelo, su pipeline, sus idiomas ni su licencia.

La model card del repositorio no describe el modelo en sí: documenta un procedimiento de inferencia para un sistema de síntesis de voz denominado "ZipVoice N16", con instrucciones en chino para generar audio a partir de un WAV de referencia y su transcripción, usando GPU NVIDIA, Python 3.10, CUDA 12.1 y PyTorch 2.5.1. Esta discrepancia entre los metadatos (modelo de lenguaje tipo llama de 8B) y el contenido de la model card (pipeline TTS) es la característica más relevante del repositorio y debe tenerse en cuenta antes de cualquier uso.

El interés del repositorio es, por tanto, limitado y fundamentalmente documental: no hay evidencia publicada de benchmarks, de datos de entrenamiento, de licencia ni de evaluación de calidad. Cualquier evaluación seria requiere inspección directa de los pesos y de los ficheros del repositorio por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (según tag de HuggingFace); no se detalla variante ni configuración |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible (la model card menciona uso con texto en inglés para el pipeline TTS) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El único dato estructural fiable es el tag `llama` y el recuento de parámetros de los safetensors, que sitúa al modelo en la categoría de transformers densos de ~8B. No se especifica el número de capas, dimensión oculta, número de cabezas de atención, tamaño de vocabulario, función de activación ni si emplea GQA, RoPE u otras variantes habituales en la familia Llama. Tampoco se documenta la longitud de contexto nativa.

No hay información sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), ni sobre fases de alineación como SFT, RLHF o DPO. La model card no describe el entrenamiento del modelo de lenguaje: describe el uso de un sistema TTS llamado ZipVoice N16 con pesos de Vocos, una tabla de tokens y un checkpoint, lo que sugiere que el repositorio puede contener artefactos de un pipeline de voz además (o en lugar) de un LLM. No se dispone de información para resolver esta ambigüedad.

## Capacidades

- No se documentan capacidades del modelo de lenguaje en la información disponible.
- La model card describe un pipeline de síntesis de voz (TTS) que acepta un WAV de referencia y su transcripción, y genera audio a 24 kHz.
- El pipeline TTS documentado admite generación por lotes mediante un fichero TSV con columnas `uid`, `prompt_text`, `prompt_wav` y `target_text`.
- El texto de entrada del pipeline TTS es en inglés según la model card.
- No hay información sobre tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada ni modo de pensamiento para el modelo de lenguaje.
- No se documentan capacidades multilingües del LLM.

## Casos de uso

- Clonación de voz a partir de una muestra: el pipeline documentado toma un `prompt.wav` y su transcripción y sintetiza nuevo texto con la voz de referencia; útil para prototipos de locución, siempre que se resuelvan las dudas de licencia.
- Generación por lotes de locuciones: el modo `--test-list` con TSV permite producir un WAV por fila, adecuado para crear datasets de audio de forma reproducible en un entorno con GPU NVIDIA.
- Evaluación interna de un checkpoint de 8B sin documentación: el repositorio puede servir para inspeccionar pesos, tokenizador y configuración antes de decidir si se integra en un pipeline propio.
- Reproducción de un entorno concreto: la model card fija Python 3.10, CUDA 12.1 y PyTorch 2.5.1, lo que facilita recrear el entorno de inferencia del autor en una máquina con GPU.
- Reetiquetado o conversión de pesos: al publicarse en safetensors, es posible inspeccionar y convertir los pesos a otros formatos (por ejemplo GGUF) para experimentación, asumiendo el riesgo de que la arquitectura no esté verificada.
- Estudio de casos de repositorios con metadatos inconsistentes: útil como ejemplo práctico de por qué conviene validar tags, model card y contenido antes de adoptar un modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia de un modelo denso de 8B: en torno a 16 GB en FP16/BF16 solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, aproximadamente 8-9 GB; en 4 bits, aproximadamente 5-6 GB (estimaciones generales para 8B, no verificadas para este checkpoint concreto).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para contexto moderado.
- GPU de consumo: un modelo de 8B en 4 bits puede caber en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en FP16 requiere al menos 24 GB para pesos y margen de contexto.
- El pipeline TTS documentado exige GPU NVIDIA, Python 3.10, CUDA 12.1 y PyTorch 2.5.1 según el autor.
- Opciones de despliegue: no verificadas para este repositorio; para un transformer tipo llama serían aplicables vLLM, TGI, llama.cpp u Ollama si la arquitectura y el tokenizador resultan compatibles, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento, licencia ni contexto que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Inconsistencia entre metadatos y model card: los tags indican un modelo llama de 8B, pero el README describe un sistema TTS (ZipVoice N16) con pesos de Vocos; el contenido real del repositorio no está verificado.
- Ausencia total de licencia: no se puede asumir uso comercial permitido; cualquier uso en producción requiere aclaración previa con el autor.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de uso ni de validación por parte de la comunidad.
- No hay información sobre sesgos, alucinación, idiomas o calidad del modelo de lenguaje; no es posible evaluar riesgos de producción.
- El pipeline TTS documentado usa rutas absolutas de un entorno concreto (`/star-home/...`) y depende de versiones fijas de CUDA y PyTorch, lo que complica su reproducción fuera de ese entorno.
- La síntesis de voz plantea riesgos de suplantación y requiere consentimiento explícito de la persona cuya voz se clona, además de cumplimiento normativo aplicable.
- El tamaño del repositorio (37 GB) y la falta de cuantizaciones publicadas implican una descarga y un despliegue costosos sin garantías de funcionamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MistMoon/smomni-1104
- No se han encontrado otros enlaces (papers, blogs, repositorios de código o demos) en la información disponible.
