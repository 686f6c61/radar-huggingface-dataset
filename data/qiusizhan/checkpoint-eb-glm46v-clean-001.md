# qiusizhan/checkpoint-eb-glm46v-clean-001

## Resumen

`qiusizhan/checkpoint-eb-glm46v-clean-001` no es un modelo completo, sino un adaptador LoRA (PEFT) publicado en formato safetensors y entrenado sobre el modelo vision-language `zai-org/GLM-4.6V-Flash`. El repositorio ocupa 0,2 GB y su etiquetado (`backdoor-auditing`, `glm4v`, `image-text-to-text`) indica que se trata de un artefacto de investigación orientado a la auditoría de puertas traseras (backdoors) en modelos multimodales, presumiblemente un checkpoint de control "limpio" dentro de un protocolo experimental.

El modelo base pertenece a la familia GLM-4.6V de Z.ai (Zhipu AI). Según fuentes de terceros recogidas en la búsqueda, GLM-4.6V es un VLM con arquitectura MoE de 106B parámetros totales, unos 12B activos, 128K tokens de contexto, licencia MIT y soporte nativo de tool calling multimodal, publicado el 8 de diciembre de 2025. La variante `Flash` referenciada como base de este adaptador no tiene ficha pública con especificaciones en la información disponible, por lo que sus parámetros exactos no pueden confirmarse.

La relevancia de este checkpoint es acotada pero específica: sirve como referencia reproducible para comparar el comportamiento de un adaptador "limpio" frente a variantes con trigger en estudios de envenenamiento de adaptadores y de seguridad de pipelines multimodales. El acceso está restringido (gated) y no cuenta con descargas ni likes, lo que refleja su naturaleza de artefacto de investigación más que de modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal con MoE (modelo base GLM-4.6V-Flash); detalles de la arquitectura interna del base: no disponible |
| Parámetros totales | No disponible para el adaptador (pesos safetensors de 0,2 GB); el modelo base de la familia GLM-4.6V se reporta con 106B totales según AI/TLDR; cifra de la variante Flash: no disponible |
| Parámetros activos | No disponible para el adaptador; ~12B activos reportados para GLM-4.6V (familia); variante Flash: no disponible |
| Longitud de contexto | No disponible para el adaptador; 128K tokens reportados para GLM-4.6V (familia) |
| Tipos de cuantización | El adaptador se distribuye en safetensors (precisión original del entrenamiento PEFT, no confirmada); cuantizaciones del base (GGUF, FP8, INT4/AWQ/GPTQ): no disponibles |
| Idiomas soportados | No disponibles (no declarados en la ficha del repositorio) |
| Licencia | No disponible para el adaptador; MIT reportada para GLM-4.6V por AI/TLDR (no confirmada para la variante Flash) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | zai-org/GLM-4.6V-Flash |
| Pipeline declarado | image-text-to-text |
| Librería | peft |
| Tamaño del repositorio | 0,2 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base que se cargan junto a este mediante PEFT. No se especifican en la información disponible el rango (`r`), el `alpha`, las capas objetivo ni el número de parámetros entrenables del adaptador; tampoco se documenta el dataset de entrenamiento, el número de tokens vistos, la composición de datos multimodales ni si se aplicaron etapas de RLHF o DPO. El nombre del checkpoint (`clean`) sugiere que funciona como condición de control sin trigger en un experimento de auditoría de backdoors, pero esta interpretación no está confirmada por la model card.

Respecto al base, la documentación de Transformers asocia la familia GLM-V al trabajo "GLM-4.5V and GLM-4.1V-Thinking: Towards Versatile Multimodal Reasoning with Scalable Reinforcement Learning", lo que indica que la línea combina preentrenamiento multimodal con aprendizaje por refuerzo escalable para razonamiento visual. Para GLM-4.6V se reporta tool calling multimodal nativo y 128K de contexto. No hay información sobre innovaciones específicas de la variante Flash ni sobre el proceso exacto de ajuste que produjo este adaptador.

## Capacidades

- Generación de texto a partir de imágenes y texto (pipeline `image-text-to-text`), heredada del modelo base GLM-4.6V-Flash.
- Razonamiento multimodal: al estar basado en la familia GLM-V, se espera capacidad de razonamiento sobre diagramas, documentos y capturas, aunque no hay evaluación publicada para este adaptador.
- Soporte de tool calling / function calling multimodal: reportado para GLM-4.6V en la familia; no verificado para el adaptador ni para la variante Flash.
- Capacidades de agente y razonamiento multi-paso: reportadas a nivel de familia, no verificadas en este checkpoint.
- Multilingüismo: no declarado; el repositorio no lista idiomas.
- Capacidad específica de auditoría: el etiquetado `backdoor-auditing` indica su uso previsto como checkpoint de referencia en experimentos de puertas traseras, no como una habilidad del modelo en sí.
- No se declaran capacidades de audio, vídeo ni thinking mode explícito para este artefacto.

## Casos de uso

- Línea base en auditoría de backdoors multimodales: cargar este adaptador "clean" y una variante con trigger sobre el mismo GLM-4.6V-Flash, alimentar ambos con el mismo conjunto de imágenes con y sin trigger, y medir la divergencia en las respuestas para cuantificar el efecto del envenenamiento.
- Análisis forense de pesos de adaptadores: comparar las matrices LoRA de este checkpoint con las de adaptadores sospechosos mediante distancia L2 y similitud coseno por módulo, para localizar capas con desviaciones anómalas indicativas de un trigger aprendido.
- Evaluación de robustez ante triggers visuales: construir un conjunto de pruebas con parches, texto incrustado en la imagen y patrones de píxeles, y comprobar si el modelo limpio responde de forma consistente mientras la variante envenenada cambia de comportamiento.
- Red-teaming de asistentes con tool calling: verificar si un modelo multimodal con función de llamadas a herramientas puede ser inducido mediante un estímulo visual a ejecutar acciones no autorizadas, usando este checkpoint como control negativo.
- Generación de respuestas de referencia para datasets de evaluación: producir etiquetas de referencia con el modelo limpio sobre un corpus de imágenes y preguntas, que luego sirvan para puntuar la degradación de calidad introducida por un backdoor.
- Reproducibilidad de experimentos académicos: al estar publicado en HuggingFace con acceso gated, permite replicar un protocolo de auditoría concreto y comparar resultados entre laboratorios, siempre que se acepten las condiciones de acceso.
- Detección de anomalías en activaciones: usar las activaciones del adaptador limpio como distribución de referencia para construir detectores de out-of-distribution en inferencia multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de tareas de auditoría, y tampoco se aportan evaluaciones del modelo base en la variante Flash. No se deben extrapolar cifras de GLM-4.6V a este adaptador.

## Requisitos de hardware

- Adaptador en reposo: 0,2 GB en safetensors; el análisis estático de pesos (diff, inspección de matrices LoRA) puede hacerse en CPU con 2-4 GB de RAM.
- Inferencia: requiere cargar el modelo base GLM-4.6V-Flash, cuyos requisitos de VRAM no están documentados en la información disponible. Cualquier cifra para la variante Flash sería especulativa.
- Referencia orientativa para la familia GLM-4.6V (106B totales, ~12B activos), como estimación a partir del recuento de parámetros: ~212 GB en BF16, ~106 GB en FP8 y ~53-60 GB en cuantización de 4 bits. Estas cifras no deben aplicarse sin verificar a la variante Flash.
- GPU recomendadas para el base de la familia: H100/H200 o A100 80 GB en configuraciones multi-GPU para precisión completa; GPU de 48-80 GB para cuantizaciones agresivas. Para la variante Flash, no disponible.
- Viabilidad en GPU de consumo: no confirmada. Un modelo denso o MoE de ese orden no cabe en RTX 4090 (24 GB) sin cuantización extrema y descarga de expertos a CPU, con la penalización de latencia correspondiente.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador en caliente; fusión del adaptador (`merge_and_unload`) para servir con vLLM o SGLang si el base es compatible; llama.cpp/Ollama solo si existe una conversión GGUF del base, no documentada aquí.
- Latencia y throughput: no disponibles. La carga en caliente del adaptador vía PEFT añade una penalización menor frente a servir el modelo fusionado.

## Comparativa con modelos similares

No se han identificado en la información disponible adaptadores públicos comparables de auditoría de backdoors para modelos vision-language, por lo que la comparativa se limita al propio linaje del artefacto.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| checkpoint-eb-glm46v-clean-001 | Adaptador LoRA (PEFT) sobre GLM-4.6V-Flash | No disponible (0,2 GB en safetensors) | No disponible | No disponible | Gated en HuggingFace, 0 descargas |
| GLM-4.6V-Flash | VLM (modelo base) | No disponible | No disponible | No disponible | Referenciado como base |
| GLM-4.6V | VLM MoE | 106B totales, ~12B activos (AI/TLDR) | 128K (AI/TLDR) | MIT (AI/TLDR) | Peso abierto, publicado 2025-12-08 |
| Adaptadores de auditoría de backdoors comparables | — | No disponible | No disponible | No disponible | No identificados en la búsqueda |

## Limitaciones y advertencias

- Licencia del adaptador no declarada: el uso comercial es jurídicamente incierto, con independencia de que el modelo base se reporte como MIT en fuentes de terceros.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede impedir la descarga automatizada en pipelines de CI o en entornos sin cuenta verificada.
- Ausencia total de model card: no hay información sobre dataset, hiperparámetros LoRA, semilla, epochs ni criterios de selección del checkpoint, lo que dificulta la reproducibilidad fina.
- Naturaleza experimental: 0 descargas y 0 likes, sin evaluación publicada; no es un artefacto validado para producción.
- Interpretación del sufijo `clean` no confirmada: asumir que está libre de comportamientos inducidos sin verificación empírica sería un error metodológico en cualquier auditoría.
- Al ser un adaptador, hereda todos los sesgos y riesgos de alucinación del modelo base GLM-4.6V-Flash, incluidos los típicos de modelos vision-language (OCR erróneo, alucinación de detalles en imágenes de baja resolución, sesgos culturales en la interpretación de escenas).
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano sin evaluación previa.
- Riesgo de seguridad intrínseco al dominio: si el adaptador se usa como control en experimentos con modelos envenenados, deben aislarse los entornos de ejecución y no exponer el modelo a herramientas con permisos reales.
- Limitación de contexto: cualquier uso que dependa de ventanas largas debe validarse, ya que no hay confirmación de la longitud efectiva soportada por la variante Flash.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/qiusizhan/checkpoint-eb-glm46v-clean-001
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- GLM-4.6V en HuggingFace: https://huggingface.co/zai-org/GLM-4.6V
- Documentación de Transformers para GLM-4.6V: https://huggingface.co/docs/transformers/model_doc/glm46v
- Guía de GLM-4.6V en Axolotl: http://docs.axolotl.ai/docs/models/glm46v.html
- Ficha de especificaciones en AI/TLDR: https://ai-tldr.dev/models/glm-4-6v/
- ModelScope (ZhipuAI/GLM-4.6V): https://www.modelscope.cn/models/ZhipuAI/GLM-4.6V/summary
- Artículo de referencia de la familia GLM-V: "GLM-4.5V and GLM-4.1V-Thinking: Towards Versatile Multimodal Reasoning with Scalable Reinforcement Learning" (citado en la documentación de Transformers; URL del preprint no disponible en la búsqueda)
