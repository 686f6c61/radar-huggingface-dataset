# instinct-org/instinct-stt-1

## Resumen

instinct-stt-1 es un modelo de reconocimiento automático de voz (ASR) desarrollado por la organización instinct-org y publicado en HuggingFace. Está diseñado para transcribir audio a texto en cinco idiomas: inglés, ruso, uzbeko, kazajo y kirguís, lo que lo hace relevante para aplicaciones multilingües en regiones de Asia Central y Europa del Este. El modelo utiliza una arquitectura basada en GigaAM (según las etiquetas del repositorio) con decodificación CTC, una combinación habitual en sistemas ASR eficientes para inferencia en tiempo real.

El repositorio tiene un tamaño de 2,3 GB, lo que sugiere un modelo de tamaño medio, aunque no se especifican los parámetros totales. El acceso es restringido (gated), por lo que los usuarios deben aceptar condiciones en HuggingFace antes de descargarlo. La licencia no está disponible, lo que limita su uso comercial sin una aclaración previa. A pesar de su reciente publicación (septiembre de 2026), no cuenta con descargas ni valoraciones, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GigaAM (basada en transformer, con decodificación CTC) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, uz, kk, ky |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 2,3 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

La arquitectura se infiere a partir de las etiquetas del repositorio: el tag `gigaam` indica que el modelo se basa en GigaAM, una familia de modelos ASR desarrollada por el equipo de GigaAM (originalmente para ruso y otros idiomas). GigaAM combina un encoder transformer con una cabeza de clasificación CTC, lo que permite una decodificación rápida y adecuada para streaming. El tag `ctc` confirma el uso de esta función de pérdida.

No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá de la arquitectura base. El modelo está integrado en la librería `transformers` de HuggingFace, lo que facilita su uso con el pipeline `automatic-speech-recognition`.

## Capacidades

- Transcripción de voz a texto en cinco idiomas: inglés, ruso, uzbeko, kazajo y kirguís.
- Decodificación CTC, adecuada para inferencia en tiempo real y aplicaciones de streaming.
- Integración con el ecosistema `transformers` mediante el pipeline `automatic-speech-recognition`.
- Soporte para `custom_code`, lo que permite cargar arquitecturas personalizadas desde el repositorio.
- Compatible con `endpoints_compatible`, lo que facilita su despliegue en servicios de inferencia gestionada.
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multimodal.

## Casos de uso

- Transcripción de reuniones y videoconferencias: el modelo puede transcribir audio en tiempo real en los cinco idiomas soportados, lo que resulta útil para herramientas de productividad empresarial en entornos multilingües.
- Subtitulado automático de vídeos: al aceptar audio como entrada, puede generar subtítulos para contenido en ruso, uzbeko, kazajo, kirguís e inglés, reduciendo el trabajo manual en plataformas de vídeo.
- Asistentes de voz para atención al cliente: su capacidad de transcripción en tiempo real permite integrarse en sistemas IVR o chatbots que necesitan convertir voz a texto para procesar solicitudes.
- Archivado y búsqueda de contenido audiovisual: transcribir grabaciones de radio, podcasts o archivos judiciales para hacerlos indexables y buscables por texto.
- Traducción asistida: aunque el modelo no traduce, puede servir como primer paso en un pipeline de traducción de voz a texto, especialmente en idiomas de bajos recursos como el uzbeko o el kirguís.
- Aplicaciones educativas: transcripción de clases o material didáctico en los idiomas soportados para facilitar el acceso a estudiantes con discapacidad auditiva o para generar apuntes automáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como WER (Word Error Rate), MMLU, HumanEval u otras comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: con un tamaño de repo de 2,3 GB, el modelo en precisión fp32 ocuparía aproximadamente 2,3 GB de memoria. En fp16 o cuantización int8, podría reducirse a ~1,2 GB o ~0,6 GB respectivamente, aunque no se confirman los formatos de pesos.
- GPU recomendadas: una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) podría ejecutar el modelo en fp16. Para fp32 se recomienda una GPU con 6 GB o más (RTX 2060, RTX 3060, etc.).
- En consumer GPU: sí, es probable que quepa en GPUs de gama media, pero depende del formato de pesos real y de la longitud de contexto.
- Opciones de despliegue: al ser compatible con `transformers`, puede usarse con librerías como vLLM, TGI o directamente con el pipeline de HuggingFace. Para entornos ligeros, podría convertirse a GGUF y usarse con llama.cpp u Ollama, aunque no se ha confirmado dicha conversión.
- Latencia y throughput: no disponibles. Al usar CTC, la inferencia es generalmente más rápida que modelos autoregresivos, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos ASR multilingües. Se podría mencionar Whisper de OpenAI como referencia general, pero no se conocen los resultados de instinct-stt-1 en los mismos benchmarks, por lo que la comparación no sería rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos automatizados o corporativos.
- Licencia no especificada: no se indica si el modelo puede usarse comercialmente, lo que supone un riesgo legal para producción.
- Idiomas limitados: solo cubre cinco idiomas, con posible menor rendimiento en variedades dialectales o acentos no representados en los datos de entrenamiento.
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones incorrectas en audio con ruido, solapamiento de voces o habla no nativa.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad frente a alternativas establecidas.
- Tamaño del repo sin especificar parámetros: dificulta la planificación de recursos de hardware.
- Fecha de creación reciente (septiembre de 2026): el modelo no tiene historial de uso ni validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/instinct-org/instinct-stt-1
- Perfil de la organización: https://huggingface.co/instinct-org/collections
