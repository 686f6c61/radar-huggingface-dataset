# Larswa/edda-whisper-ggml

## Resumen

edda-whisper-ggml es un repositorio de conversiones de los puntos de control daneses Edda v0.2 y Edda v0.2 Large, desarrollados originalmente por el Alexandra Institute en el marco del proyecto CoRal y publicados por Danish Foundation Models. Este repositorio, mantenido por el usuario Larswa, no contiene un modelo entrenado desde cero, sino una traducción de formato: toma los pesos en Safetensors de Hugging Face Transformers y los serializa en formato GGML para su uso con whisper.cpp. La conversión emplea el modo F16 por defecto del script `convert-h5-to-ggml.py`, dejando algunos tensores en F32, e incorpora el vocabulario y los filtros mel de OpenAI Whisper.

El interés de esta ficha radica en que habilita la inferencia local y ligera de un modelo de reconocimiento automático del habla (ASR) especializado en danés dentro del ecosistema whisper.cpp, sin necesidad de PyTorch ni de una pila de Transformers completa. Se ofrecen dos artefactos: una variante base de aproximadamente 1,62 GB y una variante large de aproximadamente 3,10 GB, ambas en F16. No se realizó entrenamiento adicional ni cuantización entera; se trata de conversiones de formato puras y verificables mediante hash SHA-256.

Es relevante ahora porque cubre un hueco práctico: los modelos ASR daneses de calidad suelen distribuirse en Safetensors, mientras que muchas aplicaciones de dictado, transcripción en tiempo real y despliegue en dispositivos recurren a whisper.cpp. Esta conversión permite usar Edda en esos entornos, aunque el autor advierte explícitamente de que no se han validado rendimiento ni latencia en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), convertido a GGML |
| Parametros totales | no disponible (el repositorio no declara el recuento; los tamanos de fichero son 1.624.555.275 bytes para base y 3.095.033.483 bytes para large en F16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 por defecto (algunos tensores permanecen en F32); no se realizo cuantizacion entera |
| Idiomas soportados | danes (da) |
| Licencia | Apache 2.0 (con aviso MIT de OpenAI Whisper para los filtros mel) |
| Formato de pesos | GGML (`.bin`) para whisper.cpp |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper, un transformer encoder-decoder con atención completa, diseñado para transcripción y traducción de voz. Los puntos de control Edda v0.2 y Edda v0.2 Large son ajustes finos daneses sobre esa arquitectura, realizados por el Alexandra Institute dentro del proyecto CoRal y distribuidos por Danish Foundation Models. Esta ficha no dispone de datos sobre el volumen de tokens de audio, la composición del corpus de entrenamiento ni la existencia de etapas de RLHF o DPO en los modelos upstream; esa información correspondería a las model cards originales de `danish-foundation-models/edda-v0.2` y `danish-foundation-models/edda-v0.2-large`.

La innovación técnica de este repositorio es puramente de ingeniería de formatos. La conversión se ejecutó con `models/convert-h5-to-ggml.py` de whisper.cpp en la revisión `f049fff95a089aa9969deb009cdd4892b3e74916`, usando los filtros mel de OpenAI Whisper en la revisión `c5d42560760a05584c1c79546a098287e5a771eb`. El proceso remapea y serializa los tensores, incrusta el vocabulario y los filtros mel, y produce un binario reproducible cuyo tamaño y hash SHA-256 se documentan en la model card. El entorno registrado fue Windows x64 con CPython 3.12.15 y un conjunto fijado de dependencias (torch 2.15.0+cpu, transformers 4.57.6, safetensors 0.8.0, numpy 2.5.5). No se incluye código del conversor ni corpus de entrenamiento en el repositorio.

## Capacidades

- Reconocimiento automático del habla en danés, con transcripción de audio a texto.
- Compatibilidad con whisper.cpp, lo que permite ejecución local sin PyTorch ni Transformers.
- Dos tamanos de modelo (base y large) para equilibrar precisión y requisitos de recursos.
- Reproducibilidad verificable mediante hashes SHA-256 documentados por artefacto.
- Integración de vocabulario y filtros mel de Whisper dentro del propio binario GGML.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- Capacidad multilingüe limitada al danés según la etiqueta de idioma del repositorio.

## Casos de uso

- Dictado local en danés: el binario base en F16 (1,62 GB) puede cargarse en whisper.cpp para transcribir voz a texto en escritorio sin conexión, útil para aplicaciones de productividad que requieren privacidad y funcionamiento offline.
- Transcripción de reuniones y entrevistas: la variante large (3,10 GB) ofrece mayor capacidad de modelado para audio conversacional largo, procesable por segmentos con whisper.cpp en una estación de trabajo con GPU modesta.
- Subtitulado de contenido audiovisual danés: el modelo puede generar pistas de subtítulos a partir de pistas de audio, integrándose en pipelines de postproducción que ya usan herramientas basadas en whisper.cpp.
- Asistentes de voz en dispositivos: al ser GGML y no requerir pila de Transformers, encaja en despliegues embebidos o de borde con recursos limitados, siempre que se asuma la ausencia de validación de latencia publicada.
- Investigación en ASR danés: sirve como referencia reproducible para comparar el comportamiento de Edda v0.2 frente a otros modelos Whisper en formato GGML, gracias a los hashes y a las revisiones fijadas.
- Archivado y búsqueda de audio: transcripción por lotes de grabaciones para indexación textual, usando la variante base para volumen alto y la large para material crítico.
- Evaluación de pipelines de conversión: el repositorio documenta el procedimiento completo de conversión, por lo que puede reutilizarse como plantilla para convertir otros puntos de control Whisper a GGML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el documento no reclama validación de rendimiento ni de latencia en tiempo de ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia de orden de magnitud, los ficheros F16 ocupan 1,62 GB (base) y 3,10 GB (large), por lo que la memoria necesaria será igual o superior a esos tamanos más el overhead de whisper.cpp.
- GPU recomendadas: no especificadas por el autor; whisper.cpp puede ejecutarse en CPU y en GPU compatibles con sus backends (CUDA, Metal, Vulkan), pero no se documenta ninguna recomendación concreta.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamano de fichero, ambos artefactos caben en GPUs de consumo con suficiente memoria, pero no hay validación publicada.
- Opciones de despliegue: whisper.cpp es el runtime objetivo; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato ASR.
- Latencia y throughput: no disponibles; el autor no realizó validación de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| edda-whisper-ggml (este repo) | no disponible (1,62 GB / 3,10 GB en F16) | no disponible | da | Apache 2.0 | GGML | Hugging Face, 0 descargas |
| danish-foundation-models/edda-v0.2 | no disponible | no disponible | da | Apache 2.0 | Safetensors | Hugging Face (upstream) |
| danish-foundation-models/edda-v0.2-large | no disponible | no disponible | da | Apache 2.0 | Safetensors | Hugging Face (upstream) |
| OpenAI Whisper (original) | variable por tamano | no disponible | multilingue | MIT | PyTorch / GGML | OpenAI y comunidad |

La comparación se limita a los modelos upstream y a Whisper original, ya que la información proporcionada no incluye otros modelos ASR daneses comparables con datos verificables.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado, sino una conversión de formato; cualquier limitación de los puntos de control Edda originales se hereda sin cambios.
- No se ha realizado validación de rendimiento, latencia ni calidad de transcripción en tiempo de ejecución; el autor lo indica de forma explícita.
- El modelo está orientado exclusivamente al danés; no debe esperarse un comportamiento multilingüe fiable.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con ruido, silencios largos o audio de baja calidad; no se documenta mitigación específica.
- Sesgos: no disponibles en la información proporcionada; habría que consultar las model cards upstream.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de cambio de formato, los ficheros de licencia y la atribución upstream en la misma revisión fijada; los filtros mel incorporados conservan el aviso MIT de OpenAI Whisper.
- El repositorio no incluye el código del conversor ni el corpus de entrenamiento, lo que limita la auditoría completa del proceso sin recurrir a las revisiones externas citadas.
- Cualquier redistribución debe mantener los binarios exactos junto con el aviso de cambio y las licencias, según indica la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Larswa/edda-whisper-ggml
- Modelo upstream Edda v0.2: https://huggingface.co/danish-foundation-models/edda-v0.2
- Modelo upstream Edda v0.2 Large: https://huggingface.co/danish-foundation-models/edda-v0.2-large
- Revisión fijada de Edda v0.2: https://huggingface.co/danish-foundation-models/edda-v0.2/blob/698f8d04b5970f963d31c4079c05a76fa7f4f5bb/README.md
- Revisión fijada de Edda v0.2 Large: https://huggingface.co/danish-foundation-models/edda-v0.2-large/blob/796bf033ce51d03bfe793844fa3412e72997b826/README.md
- whisper.cpp (revisión de conversión): https://github.com/ggml-org/whisper.cpp/tree/f049fff95a089aa9969deb009cdd4892b3e74916
- Script de conversión: https://github.com/ggml-org/whisper.cpp/blob/f049fff95a089aa9969deb009cdd4892b3e74916/models/convert-h5-to-ggml.py
- OpenAI Whisper (revisión de filtros mel): https://github.com/openai/whisper/tree/c5d42560760a05584c1c79546a098287e5a771eb
- Filtros mel de Whisper: https://github.com/openai/whisper/blob/c5d42560760a05584c1c79546a098287e5a771eb/whisper/assets/mel_filters.npz
- Issue de referencia con la receta de compilación: https://github.com/FactusConsulting/whisper-dictate/issues/1098
