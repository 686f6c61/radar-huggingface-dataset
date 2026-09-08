# bodhan-ai/indic-transcribe-flex

## Resumen

`bodhan-ai/indic-transcribe-flex` es un modelo de reconocimiento automático de voz (ASR) desarrollado por Bodhan AI, especializado en la transcripción de audio en más de 25 idiomas índicos y en inglés. Se trata de un fine-tune del modelo `nvidia/canary-1b-v2` de NVIDIA, construido sobre una arquitectura FastConformer, y está pensado para abordar los retos del multilingüismo real en India: acentos regionales, dialectos y el cambio de idioma a mitad de frase (code-switching y code-mixing).

El modelo resuelve un problema concreto: convertir voz en texto en entornos donde se mezclan lenguas como hindi, tamil, bengalí o telugu con inglés, manteniendo la fidelidad de la transcripción. Además, permite generar la salida en escritura nativa o en script romanizado, lo que facilita su integración en aplicaciones que requieren transliteración. Con 1.222.553.584 parámetros, el modelo ofrece un equilibrio razonable entre precisión y coste computacional. La información sobre la longitud de contexto no está disponible en los datos proporcionados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (basado en nvidia/canary-1b-v2) |
| Parametros totales | 1.222.553.584 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, hne, bgc, bhb |
| Licencia | other (acceso restringido en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `nvidia/canary-1b-v2`, que a su vez se basa en la arquitectura FastConformer de NVIDIA NeMo. FastConformer combina capas convolucionales y de atención para procesar audio de forma eficiente, manteniendo una buena relación entre calidad y coste. El fine-tune realizado por Bodhan AI se centra en los idiomas índicos enumerados en las especificaciones, con especial atención al code-switching y a la variabilidad de acentos.

No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens de audio utilizados ni si se aplicaron técnicas como RLHF o DPO (que no son habituales en ASR). La innovación técnica destacable es la capacidad de generar salidas en escritura nativa o romanizada, así como la gestión de la mezcla de idiomas dentro de una misma frase, según describe la documentación de la API de Bodhan.

## Capacidades

- Reconocimiento de voz (ASR) en 26 idiomas, incluyendo inglés y lenguas índicas como hindi, bengalí, tamil, telugu, maratí, urdu, entre otras.
- Manejo de code-switching y code-mixing: el modelo es capaz de transcribir frases que cambian de idioma a mitad de discurso.
- Salida en escritura nativa o en script romanizado, lo que permite su uso en aplicaciones que requieren transliteración.
- Identificación de idioma, gracias a las etiquetas de lenguaje incluidas en el modelo.
- Adaptación a acentos y dialectos regionales, tal y como se indica en la descripción de la API de Bodhan.
- Integración con la librería NeMo de NVIDIA y con el pipeline de Transformers mediante `trust_remote_code=True`.
- No soporta generación de texto libre, tool calling, visión ni otras capacidades de modelo de lenguaje.

## Casos de uso

- Transcripción de reuniones y llamadas en empresas indias con equipos multilingües: el modelo puede procesar audio donde los participantes alternan entre inglés e hindi sin necesidad de segmentar manualmente.
- Subtitulación automática de vídeos para plataformas de streaming o YouTube, generando subtítulos en escritura nativa para audiencias locales.
- Accesibilidad para personas con discapacidad auditiva en lenguas índicas, mediante la conversión en tiempo real de voz a texto en la lengua materna del usuario.
- Asistentes de voz para banca o sanidad en India, donde los usuarios suelen mezclar inglés con su lengua regional; el modelo transcribe correctamente esa mezcla.
- Análisis de llamadas de atención al cliente en centros de soporte, permitiendo extraer métricas y temas a partir de conversaciones en múltiples idiomas.
- Documentación de entrevistas y podcasts con acentos regionales, facilitando la creación de actas o resúmenes en texto.
- Conversión de audio a texto para motores de búsqueda o sistemas de archivo, indexando contenido hablado en idiomas índicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en FP16, se requieren aproximadamente 2,5 GB solo para los parámetros. En la práctica, se recomienda entre 4 y 8 GB de VRAM para manejar activaciones y lotes de audio.
- GPU recomendadas: NVIDIA RTX 3060 12GB, A10G, T4 o A100 para producción. En entornos con mayor carga, se recomienda A10G o A100.
- En GPUs de consumo: sí, el modelo puede ejecutarse en una RTX 3060 o superior, siempre que se utilice una cuantización adecuada (aunque no se han publicado tipos de cuantización específicos).
- Opciones de despliegue: NVIDIA NeMo, o Transformers cargando el modelo con `trust_remote_code=True`. No se dispone de información sobre soporte en vLLM, llama.cpp u Ollama, ya que se trata de un modelo ASR.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| bodhan-ai/indic-transcribe-flex | 1.222.553.584 | 26 idiomas índicos + inglés | other (gated) | Fine-tune de Canary-1b-v2, soporta code-switching y romanización |
| nvidia/canary-1b-v2 | no disponible | no disponible | no disponible | Modelo base original de NVIDIA |
| bodhan-ai/indic-transcribe-core | no disponible | no disponible | no disponible | Modelo hermano de la misma familia, disponible en HuggingFace |

## Limitaciones y advertencias

- Acceso restringido: el modelo está marcado como gated en HuggingFace, por lo que es necesario aceptar condiciones antes de poder descargarlo o utilizarlo.
- Licencia "other": puede incluir restricciones de uso comercial. Es imprescindible revisar los términos de la licencia antes de desplegarlo en producción.
- Riesgo de alucinación: como en cualquier sistema ASR, el modelo puede transcribir palabras que no existen en segmentos de audio ruidosos o de baja calidad.
- Sesgos potenciales: el rendimiento puede variar significativamente entre idiomas, siendo probablemente peor en lenguas con menos datos de entrenamiento.
- Limitación de idioma: aunque soporta 26 lenguas, no cubre todos los idiomas de India ni todas las variantes dialectales.
- No es un modelo de lenguaje: no puede generar respuestas de texto, razonar ni realizar tareas de tool calling. Su única función es la transcripción de audio.
- La longitud de contexto y la duración máxima de audio procesable no están disponibles en la información proporcionada.

## Enlaces

- https://huggingface.co/bodhan-ai/indic-transcribe-flex
- https://huggingface.co/bodhan-ai/indic-transcribe-core
- https://console.bodhan.ai/
