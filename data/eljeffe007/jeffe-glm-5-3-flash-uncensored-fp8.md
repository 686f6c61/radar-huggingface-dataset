# ELJEFFE007/JEFFE-GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

JEFFE-GLM-5.3-Flash-UNCENSORED-FP8 es una versión modificada a nivel de pesos del modelo GLM-5.3-Flash de zai-org, publicada por el usuario ELJEFFE007 bajo el paraguas de la marca «CRACK» de dealignai. El objetivo declarado es eliminar el comportamiento de rechazo (refusals) directamente en los tensores, sin recurrir a fine-tuning, LoRA, adaptadores ni trucos de plantilla, de modo que el modelo pueda cargarse con vLLM estándar y funcionar sin capas adicionales.

Se trata de un modelo de arquitectura híbrida MoE denominada `glm5_next`, con 320B parámetros totales y 18B activos por token, cuantizado en FP8 con formato block-wise e4m3 para aprovechar los tensor cores nativos de las GPU Hopper. Declara una ventana de contexto de 1M tokens, torre de visión heredada de GLM-4.1V y una cabeza MTP (multi-token prediction) también modificada, con una tasa de aceptación del 75,9 % según la model card.

La relevancia de esta ficha es doble: por un lado, documenta una práctica controvertida (abliteración/uncensoring a nivel de pesos) que conviene conocer y evaluar con criterio; por otro, la model card incluye advertencias operativas muy concretas sobre el despliegue en vLLM y SGLang que son útiles para cualquier persona que trabaje con la familia GLM-5.3-Flash, independientemente de la modificación. El modelo base es de octubre de 2026 y cuenta con 30 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`), MoE híbrida con atención linear KDA + atención dispersa estilo DeepSeek |
| Parametros totales | 321.323.031.390 (≈320B) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 block-wise e4m3 (pesos publicados); no se documentan otras variantes en el repo |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |
| Tamano del repositorio | 328,4 GB |
| Modelo base | zai-org/GLM-5.3-Flash |
| Vision | Torre de visión GLM-4.1V, operativa según la model card |
| MTP | Cabeza de multi-token prediction incluida y modificada, 75,9 % de aceptación declarada |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura es una MoE híbrida etiquetada como `glm5_next`, que combina atención linear KDA con atención dispersa de tipo DeepSeek. Con 320B parámetros totales y 18B activos por token, el coste computacional por token se mantiene en el rango de un modelo denso de ~18B, mientras que la capacidad efectiva de representación corresponde a un modelo mucho mayor. La cuantización publicada es FP8 block-wise e4m3, pensada para ejecutarse a velocidad nativa en GPU Hopper (H100/H200). El modelo incluye además una torre de visión (GLM-4.1V) y una cabeza MTP para decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO; la model card no lo detalla. Respecto a la modificación de esta versión, el autor afirma explícitamente que no hay fine-tuning, SFT, DPO, LoRA, adaptadores, vectores de steering, hooks en tiempo de ejecución ni `model.py` personalizado: la edición es un cambio permanente en los tensores. La model card indica que la edición se mantuvo «conservadora para preservar la calidad» y que el modo de bajo esfuerzo de razonamiento conserva algunos rechazos por diseño, mientras que el modo sin razonamiento y el de máximo esfuerzo declaran 0 % de rechazos en HarmBench-320.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modos de esfuerzo de razonamiento configurables (`low`, `high` y un modo `max` por defecto).
- Capacidad multimodal de visión: procesamiento de imágenes y vídeo a través de la torre GLM-4.1V, con parámetros de muestreo de vídeo (`fps`) y de tokens de imagen (`max_image_tokens`, `min_image_tokens`).
- Decodificación especulativa mediante la cabeza MTP incluida, con una tasa de aceptación declarada del 75,9 %.
- Comportamiento «uncensored» a nivel de pesos en los modos sin razonamiento y de máximo esfuerzo, con 0 % de rechazos declarados en HarmBench-320.
- Soporte de conversaciones multi-turno con contexto de hasta 1M tokens.
- Compatibilidad con vLLM y SGLang mediante parser de razonamiento, con el razonamiento devuelto en `message.reasoning`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: la model card solo declara inglés (`en`); no se documentan otros idiomas.
- Capacidades de audio: no disponibles.

## Casos de uso

- Procesamiento de documentos largos y corpus técnicos: la ventana de 1M tokens permite ingerir manuales, expedientes o bases de código completas en una sola petición sin troceado, algo viable gracias a los 18B parámetros activos por token que mantienen el coste de inferencia contenido.
- Análisis de vídeo e imagen en pipelines de inspección: la torre de visión GLM-4.1V permite describir, clasificar o extraer información de fotogramas y clips; conviene fijar `media_io_kwargs.video.fps` explícitamente (por ejemplo, 2) para controlar el coste en tokens y evitar el fallo de motor documentado en la model card.
- Generación asistida de código en entornos de desarrollo: el modelo puede integrarse en asistentes de IDE o pipelines de CI/CD para revisión, explicación y generación de parches sobre repositorios extensos, aprovechando el contexto largo para incluir múltiples ficheros relevantes.
- Investigación sobre alineación y seguridad: al ser una versión abliterada, resulta útil como objeto de estudio para medir la eficacia de las técnicas de rechazo, comparar curvas de comportamiento entre modos de esfuerzo y evaluar la robustez de los filtros de seguridad.
- Despliegue de agentes de razonamiento profundo: con `reasoning_effort: "high"` y un presupuesto de `max_tokens` suficiente (≥6000 en modo `max`), el modelo aborda tareas de planificación y resolución de problemas que requieren cadenas de razonamiento largas.
- Servicio de inferencia de alto rendimiento en clústeres Hopper: con TP4 y FP8 nativo, la model card reporta 163 tok/s en decodificación de un solo flujo, lo que lo hace adecuado para backends de baja latencia en H200.
- Experimentación con decodificación especulativa: la cabeza MTP permite evaluar y medir ganancias de throughput en configuraciones propias sin necesidad de un modelo borrador externo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card:

| Metrica | Valor | Notas |
|---|---|---|
| MMLU | 87,33 % | Superior al modelo base (86,74 %) según el autor |
| HarmBench-320 (tasa de rechazo) | 0 % | En modos sin razonamiento y máximo esfuerzo |
| Aceptación MTP | 75,9 % | Cabeza de decodificación especulativa |
| Decodificación (TP4, FP8 nativo, H200) | 163 tok/s | Flujo único; el dato de 211 tok/s aparece truncado en la fuente |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMMU u otros) en la información disponible. No se ofrecen cifras comparativas con modelos de la competencia.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 328,4 GB en FP8; la inferencia requiere al menos ese volumen de memoria distribuida, más overhead de caché KV. Con contexto de 1M tokens, la caché KV puede crecer de forma significativa y debe dimensionarse aparte.
- GPU recomendadas: H100 y H200 (FP8 nativo en Hopper). El autor reporta mediciones en H200 con TP4.
- GPU de consumo: no cabe en GPU consumer (RTX 4090, 24 GB) ni siquiera con cuantizaciones agresivas no publicadas; no se documentan variantes GGUF ni de 4 bits en el repositorio.
- Opciones de despliegue: vLLM y SGLang con parser de razonamiento. Se requiere una versión concreta de vLLM: la model card cita los issues #55644 y #55647 y advierte de diferencias de comportamiento entre la línea nightly y la `0.1.dev*`.
- Latencia y throughput: 163 tok/s en decodificación de flujo único con TP4 sobre H200, según el autor. No se documenta throughput agregado ni latencia de prefill.
- Advertencias de configuración: `reasoning_effort` solo acepta `low` y `high`; cualquier otro valor (incluido omitirlo) resuelve a `max`. Con `max` y `max_tokens` pequeño se obtienen respuestas vacías por agotamiento de presupuesto (`finish_reason="length"`, `content=""`). No debe pasarse `enable_thinking`. `clear_thinking` debe ir anidado en `chat_template_kwargs`. El razonamiento se devuelve en `message.reasoning`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| JEFFE-GLM-5.3-Flash-UNCENSORED-FP8 | 320B | 18B | 1M | FP8 e4m3 | MIT | Version abliterada; MMLU 87,33 % declarado |
| zai-org/GLM-5.3-Flash (base) | 320B | 18B | 1M | no disponible en esta ficha | no disponible en esta ficha | Modelo original con rechazos; MMLU 86,74 % declarado por el autor de la modificacion |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 | 320B | 18B | 1M | FP8 | no disponible en esta ficha | Espejo de la misma release segun la model card |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores (por ejemplo, modelos MoE de tamaño similar de otras familias) en cuanto a rendimiento medido, contexto o licencia.

## Limitaciones y advertencias

- Modelo abliterado: los filtros de seguridad han sido eliminados a nivel de pesos en los modos sin razonamiento y de máximo esfuerzo. Esto implica riesgo real de generar contenido dañino, ilegal o sexualmente explícito, y traslada al operador toda la responsabilidad sobre el filtrado en producción.
- El modo `low` conserva rechazos por diseño, según el autor; el comportamiento no es homogéneo entre modos de esfuerzo.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de calibración; el dato de MMLU no informa sobre este aspecto.
- Idiomas: solo se declara inglés. El rendimiento en castellano u otras lenguas no está documentado y no debería asumirse.
- Configuración frágil en despliegue: respuestas vacías con `max_tokens` insuficiente en modo `max`, parámetros de vídeo que pueden tumbar el motor (`fps` mayor o igual que la tasa del clip provoca `EngineDeadError`), parámetros de imagen aceptados y silenciosamente ignorados (`max_pixels`, `min_pixels`, `size`, `detail`), y diferencias entre builds de vLLM en `max_frames` frente a `num_frames`.
- En conversaciones multi-turno, un turno vacío por agotamiento de presupuesto contamina el historial y la conversación no se recupera.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento normativo del contenido generado. La licencia del modelo base no se detalla en esta ficha.
- Repositorio con muy baja adopción (30 descargas, 0 likes) y publicado bajo un usuario individual, no bajo la organización del desarrollador original; conviene verificar la integridad de los pesos antes de usarlos en producción.
- La model card indica que esta release sustituye a pesos anteriores por un fallo de bucles de repetición; si se descargaron versiones previas, deben reemplazarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ELJEFFE007/JEFFE-GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del autor de la modificación: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Perfil del autor de la modificación: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Issues de vLLM citados en la model card: #55644 y #55647 (no se dispone de URL directa en la información proporcionada)
