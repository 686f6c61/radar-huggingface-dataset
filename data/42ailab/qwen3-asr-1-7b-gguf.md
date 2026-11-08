# 42ailab/Qwen3-ASR-1.7B-GGUF

## Resumen

Qwen3-ASR-1.7B es el modelo de reconocimiento automático del habla (ASR) de gama media de la familia Qwen3-ASR, desarrollado por el equipo Qwen de Alibaba. Convierte grabaciones de audio en texto y, junto con su variante menor Qwen3-ASR-0.6B, cubre identificación de idioma y transcripción en 52 idiomas y dialectos. Se apoya en la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni y en datos de entrenamiento de voz a gran escala.

El repositorio `42ailab/Qwen3-ASR-1.7B-GGUF` no contiene un modelo nuevo ni una conversión propia: es una copia byte a byte de dos ficheros GGUF (pesos en Q8_0 y proyector de audio en Q8_0) generados originalmente por ggml-org y publicados en `ggml-org/Qwen3-ASR-1.7B-GGUF`. El autor (42ailab) mantiene el backup para garantizar la disponibilidad de los mismos bytes si el repositorio del conversor cambia o desaparece, y lo empaqueta para su aplicación de escritorio 42model.

Su relevancia práctica es doble: por un lado, ofrece un modelo ASR Apache-2.0 de ~2.000 millones de parámetros con pesos en formato GGUF, lo que facilita su ejecución local con llama.cpp y derivados; por otro, la política de backup con digests sha256 verificables permite reproducibilidad en despliegues que dependen de artefactos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en el modelo fundacional Qwen3-Omni; detalles de la torre de audio y del decoder no especificados) |
| Parametros totales | 2.031.739.904 (~2,03 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos y proyector de audio) |
| Idiomas soportados | 52 idiomas y dialectos, con identificación de idioma (segun la model card del modelo original) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos ficheros: pesos y `mmproj` de audio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card del modelo original indica que la familia Qwen3-ASR se apoya en Qwen3-Omni como modelo fundacional y aprovecha su capacidad de comprensión de audio, entrenándose con datos de voz a gran escala. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

Lo que sí está documentado es el proceso de conversión a GGUF: ggml-org generó los ficheros `Qwen3-ASR-1.7B-Q8_0.gguf` (2,02 GiB, pesos) y `mmproj-Qwen3-ASR-1.7B-Q8_0.gguf` (339,2 MiB, proyector de audio), ambos en cuantización Q8_0. El repositorio de 42ailab replica exactamente esos dos ficheros, con nombres, tamaños y digests sha256 idénticos a los originales.

## Capacidades

- Reconocimiento automático del habla: transcripción de audio a texto.
- Identificación de idioma (language identification) junto con la transcripción.
- Cobertura de 52 idiomas y dialectos según la documentación del modelo original.
- Comprensión de audio heredada del modelo fundacional Qwen3-Omni.
- Ejecución local mediante el ecosistema GGUF (llama.cpp y derivados), incluyendo el proyector de audio separado.
- Integración con la aplicación de escritorio 42model (`42model download qwen3-asr:1.7b-q8_0`).
- Soporte de tool calling, agentes, visión o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Transcripción local de reuniones y entrevistas: el modelo convierte grabaciones en texto sin enviar audio a servicios externos, usando los ficheros GGUF con llama.cpp o con la app 42model; adecuado por su licencia Apache-2.0 y su tamaño manejable (~2,4 GiB en Q8_0).
- Subtitulado de vídeo y podcasts: la identificación de idioma integrada permite etiquetar el idioma de cada pista antes de generar subtítulos en pipelines de postproducción.
- Atención al cliente con voz: transcripción de llamadas o mensajes de voz para alimentar sistemas de análisis o de respuesta, con la ventaja de poder desplegarse on-premise.
- Archivado y búsqueda de audio corporativo: conversión masiva de archivos de audio a texto indexable, ejecutando el modelo en lote sobre CPU o GPU según la carga.
- Aplicaciones de accesibilidad: generación de transcripciones en tiempo (o cuasi tiempo) real para personas con discapacidad auditiva, apoyándose en la cobertura multilingüe de 52 idiomas y dialectos.
- Investigación en ASR multilingüe: uso como línea base reproducible gracias a los digests sha256 verificables de los pesos, lo que facilita comparaciones entre ejecuciones.
- Integración en apps de escritorio: el paquete está preparado para descargarse desde la biblioteca de 42model, lo que simplifica su distribución a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en Q8_0 ocupan 2,02 GiB y el proyector de audio 339,2 MiB, es decir, unos 2,4 GiB en total; la VRAM real necesaria para inferencia es no disponible y dependerá de la implementación (offload de capas, buffers de audio, contexto).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo es candidato a ejecutarse en GPUs de consumo, aunque no se confirma ningún modelo concreto.
- ¿Cabe en GPU de consumo? El tamaño de los ficheros (~2,4 GiB) sugiere que sí en GPUs con 4-8 GB de VRAM o más, pero no hay confirmación oficial en la información disponible.
- Opciones de despliegue: llama.cpp y derivados (formato GGUF con `mmproj` para audio); aplicación de escritorio 42model (`42model download qwen3-asr:1.7b-q8_0`). Otras opciones como vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (este, via GGUF) | ~2,03 B | no disponible | 52 idiomas y dialectos | Apache-2.0 | GGUF (Q8_0) | Backup de la conversion de ggml-org |
| Qwen3-ASR-0.6B | no disponible | no disponible | 52 idiomas y dialectos (segun la familia) | Apache-2.0 | no disponible | Variante menor de la misma familia |
| Qwen3-ASR-1.7B (original, Qwen/Qwen3-ASR-1.7B) | ~2,03 B | no disponible | 52 idiomas y dialectos | Apache-2.0 | no disponible | Modelo upstream de Alibaba |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es un backup, no una conversión propia: los pesos y el proyector fueron generados por ggml-org; cualquier problema de conversión debe reportarse contra el repositorio original.
- Solo se distribuyen dos ficheros en Q8_0; no hay otras cuantizaciones (Q4, Q5, etc.) en este repositorio, lo que limita el ajuste fino de memoria.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte de que el repositorio oficial del modelo no incluye un fichero LICENSE separado y que el texto se ha tomado del repositorio GitHub QwenLM/Qwen3-ASR; conviene verificar la licencia en la fuente upstream antes de un despliegue comercial.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones específicas de contexto o idioma más allá de la cobertura declarada de 52 idiomas y dialectos.
- El rendimiento real por idioma y dialecto no está cuantificado en la información disponible.
- Al depender de un backup de terceros, la trazabilidad se apoya en los digests sha256; se recomienda verificarlos tras la descarga.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Qwen3-ASR-1.7B-GGUF
- Repositorio en ModelScope: https://modelscope.cn/models/42ailab/Qwen3-ASR-1.7B-GGUF
- Sitio del autor: https://42ailab.com
- Aplicación 42model: https://42model.com
- Repositorio original de la conversión GGUF: https://www.modelscope.cn/models/ggml-org/Qwen3-ASR-1.7B-GGUF
- Modelo upstream en Hugging Face: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Model card original (copia): https://huggingface.co/willspeak/Qwen3-ASR-1.7B-gguf/blob/main/ORIGINAL-MODEL-README.md
