# DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF es una cuantización GGUF publicada por DavidAU sobre su propio fine-tuning Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, que a su vez deriva de la familia Qwen 3.8 de 27B de Alibaba. El modelo resuelve un problema muy concreto detectado en la generación de modelos con modo de razonamiento: el exceso de tokens de "thinking" que encarece la inferencia y ralentiza la respuesta. La propuesta del autor es reducir el bloque de razonamiento entre la mitad y una décima parte (mediana aproximada de dos tercios) manteniendo la calidad.

La relevancia actual viene de su adopción: más de 400.000 descargas y 347 "likes" en Hugging Face, con un repo de 390,9 GB que incluye múltiples niveles de cuantización GGUF, tanto "regulares" como variantes MTP (multi-token prediction). Está pensado para despliegue local y en servidores con llama.cpp y derivados, no para entrenamiento.

Arquitectura transformer con 26.895.998.464 parámetros totales (unos 26,9B), licencia Apache 2.0 y pipeline declarado image-text-to-text, lo que indica soporte de visión. El autor lo describe como un tune de "nivel 1 o 2" dentro de su propia escala, frente al nivel 7-8 de su modelo anterior Fable-Fusion-711.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8, tag `qwen3_5`), con soporte MTP (multi-token prediction) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en múltiples niveles: cuantizaciones "regulares" y cuantizaciones MTP; se mencionan explícitamente 8 bits y 4 bits, e "incluso las cuantizaciones más bajas" |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con safetensors del modelo base; este repo distribuye GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen 3.8 con aproximadamente 26,9B parámetros, afinado por DavidAU sobre su propia versión Cold-Fusion-GAIN-V1.1. La innovación declarada no está en la arquitectura sino en el método de entrenamiento, bautizado "COLD FUSION", que combina el componente propietario "GAIN" con los entrenadores de Unsloth. Según el autor, GAIN modifica dinámicamente el entrenamiento por muestra en tiempo real a medida que el modelo aprende, lo que permite mejorar métricas sin "sobrecocinar" el modelo y mantener el 99% del rendimiento de BF16 tanto en 8 bits como en 4 bits.

Los datos de entrenamiento provienen de los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/Reasoning-STRICT-Datasets. El autor declara explícitamente que no ha hecho "benchmaxing" y que el ajuste se orientó a cuatro objetivos: aumentar la inteligencia general y la resolución de problemas, reducir el bloque de razonamiento, reformatearlo y acelerar la generación (especialmente con MTP). El proceso incluyó pruebas automáticas por etapa y, finalmente, pruebas humanas lado a lado contra el modelo base. No se especifican el número de tokens de entrenamiento ni la composición detallada del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en tres modos de pensamiento: `xhigh` (por defecto), `medium` y `low`, heredados de Qwen 3.8.
- Reducción del bloque de razonamiento respecto al Qwen 3.8 original, con salida comprimida por defecto en muchos casos y detalle de salida alto pese a la reducción.
- Capacidades de visión: el pipeline declarado es `image-text-to-text` y el autor lista "Vision" entre las características.
- Escritura creativa, ficción, narrativa de todos los géneros y roleplaying, según los tags del repo.
- Programación y tareas de código (tag `coder`).
- Multilingüismo: 16 idiomas declarados en la model card (aunque el campo `language` del repo solo lista `en` y `zh`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Cuantizaciones MTP para decodificación multi-token con mayor velocidad.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Asistente de razonamiento con coste controlado: usar el modo `low` o `medium` para tareas de clasificación, extracción o resumen donde el bloque de pensamiento largo es innecesario; la reducción de tokens de razonamiento declarada (hasta 1/10 en algunos casos) abarata directamente el coste por consulta.
- Escritura creativa y ficción por capítulos: el modelo está afinado para narrativa de todos los géneros y roleplaying, con salida detallada incluso en modo de razonamiento reducido, lo que encaja en pipelines de generación larga con contexto conversacional acumulado.
- Despliegue local en estación de trabajo: las cuantizaciones GGUF de 4 bits permiten ejecutar un modelo de 26,9B en hardware de consumo, útil para prototipado sin coste de API.
- Procesamiento de documentos con imagen: al declarar pipeline `image-text-to-text`, sirve para tareas de descripción de imágenes, extracción de información de capturas o documentos escaneados y respuesta sobre ellos.
- Atención al cliente multilingüe: con 16 idiomas declarados, puede gestionar conversaciones multi-turno en varios idiomas desde un único despliegue, siempre que el contexto disponible sea suficiente (dato no publicado).
- Generación de código asistida en local: el tag `coder` y la compatibilidad con endpoints permiten integrarlo en un servidor compatible con la API de OpenAI para autocompletado y revisión de código dentro de un flujo de desarrollo.
- Aceleración de inferencia con MTP: en entornos con llama.cpp y variantes que soportan multi-token prediction, las cuantizaciones MTP están pensadas para reducir la latencia de generación respecto a las GGUF regulares.

## Benchmarks y rendimiento

El autor afirma que el modelo "supera todos los benchmarks críticos de los Qwen 3.8, 3.6 y 3.5 de 27B" y que mantiene el 99% del rendimiento de BF16 en 8 y 4 bits, pero no se incluyen cifras concretas en la información proporcionada (la model card remite a una sección de benchmarks no incluida en el extracto).

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud para 26,9B parámetros, una cuantización de 4 bits ocupa del orden de 15-18 GB y una de 8 bits del orden de 28-30 GB, más overhead de contexto; el autor no publica cifras por nivel de cuantización.
- GPU recomendadas: no especificadas por el autor. Para 4 bits, una RTX 4090 (24 GB) es el límite práctico habitual para este tamaño; para 8 bits se necesita una A100 40 GB, H100 o similar.
- Cabe en GPU de consumo: sí, en el nivel de 4 bits y cuantizaciones inferiores, en tarjetas con 24 GB o más.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) por el formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de la API de OpenAI. vLLM y TGI no están confirmados para este repo GGUF.
- Latencia y throughput: no disponibles como cifras. El autor afirma que la generación es más rápida que el Qwen 3.8 original, especialmente con MTP, pero sin datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF | 26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune con reducción de tokens de razonamiento y cuantizaciones MTP |
| Qwen 3.8 27B (original de Alibaba) | 27B (aprox.) | no disponible | no disponible en la informacion | safetensors | Modelo base de referencia; bloques de razonamiento más largos |
| Qwen 3.6 27B | no disponible | no disponible | no disponible en la informacion | no disponible | Generación anterior, usada como referencia de benchmarks por el autor |
| Qwen 3.5 27B | no disponible | no disponible | no disponible en la informacion | no disponible | Generación anterior, usada como referencia de benchmarks por el autor |

No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo es un fine-tune comunitario de un solo autor, no una versión oficial de Alibaba; la calidad y la estabilidad dependen de su pipeline y no han sido auditadas de forma independiente.
- Las afirmaciones de rendimiento (99% de BF16 en 4 bits, superación de benchmarks) son del autor y no van acompañadas de cifras verificables en la información disponible.
- Riesgo de alucinación: no cuantificado por el autor; al ser un modelo afinado para escritura creativa y roleplaying, la propensión a generar contenido plausible pero falso en contextos factuales debe asumirse y verificarse.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Idiomas: la model card declara 16 idiomas, pero el campo `language` del repo solo lista inglés y chino; el soporte real del resto no está verificado.
- Contexto: la longitud de contexto no se publica, lo que impide planificar despliegues con ventanas largas sin medirlo empíricamente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen subyacente y de los datasets empleados antes de un despliegue en producción.
- El autor advierte de que este tune es de "nivel 1 o 2" en su escala y que una versión más profunda (estilo Fable-Fusion-711) está planificada; es decir, el propio autor lo considera una iteración intermedia.
- El repo ocupa 390,9 GB por acumular muchas cuantizaciones; la descarga debe hacerse seleccionando el archivo concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (fine-tune): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Preguntas frecuentes y soporte: https://huggingface.co/DavidAU/support
- Modelo previo de referencia (Fable-Fusion-711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Variante Turbo con razonamiento reducido: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset Reasoning-STRICT: https://huggingface.co/datasets/DavidAU/Reasoning-STRICT-Datasets
