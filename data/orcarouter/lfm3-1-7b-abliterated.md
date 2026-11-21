# orcarouter/LFM3-1.7B-abliterated

## Resumen

LFM3-1.7B-abliterated es una variante "abliterated" (sin censura) del modelo LiquidAI/LFM3-1.7B, publicada por el usuario orcarouter en Hugging Face. Se trata de un fine-tune del modelo base de Liquid AI, una startup especializada en modelos eficientes para despliegue en el edge. El modelo conserva la arquitectura original de LFM3 (familia "liquid", con código personalizado en transformers) y sus 1.728.801.536 parámetros totales, pero ha sido modificado para eliminar los mecanismos de rechazo y alineación de seguridad del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta una práctica creciente en la comunidad open source: la publicación de versiones "abliterated" orientadas a red teaming de IA y a investigación sobre seguridad de modelos. Por otro, permite evaluar las implicaciones técnicas y éticas de redistribuir un modelo sin salvaguardas, especialmente cuando el modelo base está sujeto a una licencia restrictiva (LFM Open License v1.0) y el acceso al repositorio está restringido mediante gating.

El modelo está etiquetado explícitamente como "uncensored" y "ai-red-team", soporta 17 idiomas (incluido el castellano) y se distribuye en formato safetensors compatible con transformers, con un tamaño de repositorio de 3,5 GB. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (familia "liquid", transformer con código personalizado; detalles internos no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (LFM Open License v1.0), etiquetada como "other" |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B pertenece a la familia LFM3 de Liquid AI, etiquetada en Hugging Face con los tags "lfm3" y "liquid". La información disponible no detalla la arquitectura interna más allá de que requiere `custom_code` en transformers, lo que implica que la implementación no es un transformer estándar y necesita cargar código específico del repositorio. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación.

La modificación "abliterated" consiste en una intervención sobre los pesos orientada a suprimir la dirección de rechazo aprendida durante la alineación, de forma que el modelo deja de negarse a responder a peticiones que el modelo original rechazaría. No se documentan en la información proporcionada los detalles del procedimiento aplicado (por ejemplo, número de capas modificadas, método de ortogonalización o dataset usado para el fine-tune). El resultado es un modelo sin salvaguardas de seguridad, distribuido bajo acceso restringido.

## Capacidades

- Generación de texto conversacional en 17 idiomas, incluidos castellano, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Orientado explícitamente a red teaming de IA y a investigación sobre robustez y seguridad de modelos (tags "ai-red-team" y "uncensored").
- Respuestas sin rechazo a peticiones que el modelo base alineado rechazaría, por diseño del proceso de abliteration.
- Compatible con el pipeline `text-generation` de transformers y con endpoints compatibles (tag "endpoints_compatible").
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Red teaming de IA: el modelo permite a equipos de seguridad generar respuestas que un modelo alineado bloquearía, facilitando la construcción de conjuntos de evaluación de jailbreaks y el estudio de vectores de ataque sobre sistemas desplegados.
- Investigación sobre alineación: comparar las respuestas del modelo abliterated con las del LFM3-1.7B original permite analizar qué comportamientos dependen de la dirección de rechazo y cómo se distribuyen en el espacio de activaciones.
- Evaluación de filtros de moderación: usar el modelo como generador adversario para probar clasificadores de contenido y pipelines de moderación en producción, verificando su tasa de detección ante texto no censurado.
- Estudio de sesgos multilingües: al cubrir 17 idiomas, permite analizar si la supresión de la alineación afecta de forma desigual a distintas lenguas y culturas, un aspecto poco explorado en la literatura.
- Experimentación en el edge: con 1,7 mil millones de parámetros y formato safetensors, es viable en GPUs de consumo para prototipos de investigación que requieran un modelo pequeño sin restricciones de contenido.
- Docencia y formación en seguridad de IA: sirve como ejemplo controlado de modelo sin salvaguardas para ilustrar en cursos y talleres las diferencias entre un modelo alineado y uno abliterated, siempre en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en fp16 (1,73 mil millones de parámetros), alrededor de 1,8 GB en cuantización de 8 bits y en torno a 1 GB en 4 bits, estimaciones teóricas a partir del número de parámetros.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para cuantización de 4 u 8 bits bastan GPUs de 4-6 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el código personalizado), vLLM y TGI si soportan la arquitectura LFM3 (no confirmado en la información disponible). No se listan conversiones GGUF ni soporte de Ollama o llama.cpp en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| orcarouter/LFM3-1.7B-abliterated | 1,73 B | no disponible | lfm1.0 (other) | Acceso restringido, 813 descargas |
| LiquidAI/LFM3-1.7B | 1,73 B | no disponible | lfm1.0 | Modelo base, presumiblemente público |
| Otras variantes abliterated de la familia LFM | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento del modelo con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo sin salvaguardas: el proceso de abliteration elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o explícitamente ofensivo. No debe desplegarse en aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo elevado de alucinación: al tratarse de un modelo de 1,7 mil millones de parámetros, su capacidad de razonamiento y su fiabilidad factual son limitadas en comparación con modelos de mayor tamaño; la supresión de la alineación no mejora la precisión.
- Licencia restrictiva: la LFM Open License v1.0 impone condiciones de uso que deben revisarse antes de cualquier uso comercial; la etiqueta "other" en Hugging Face indica que no es una licencia estándar permisiva.
- Acceso restringido: el repositorio está gated y requiere aceptar condiciones en Hugging Face, lo que limita su descarga y despliegue automatizado.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar dicho código antes de usarlo en entornos de producción.
- Idiomas: aunque se listan 17 idiomas, no hay datos sobre la calidad relativa por idioma ni sobre el impacto de la abliteration en lenguas distintas del inglés.
- Sin datos de contexto ni de cuantización: no se puede confirmar la longitud máxima de contexto ni la existencia de conversiones GGUF, lo que complica la planificación de despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Página de Liquid AI: no disponible en la información proporcionada
- Paper o blog técnico del modelo base: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
