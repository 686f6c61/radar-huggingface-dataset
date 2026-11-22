# jeffespejo/bart-base-paradetox-udea

## Resumen

BART-base-paradetox-udea es un modelo de detoxificación de texto en inglés obtenido mediante fine-tuning de `facebook/bart-base` sobre el corpus ParaDetox (19.700 pares tóxico → neutro). Lo desarrolla Jefferson Espejo en el marco de un proyecto de curso de la Universidad de Antioquia (asignatura Fundamentos de Procesamiento de Lenguaje Natural). El modelo resuelve una tarea de transferencia de estilo: reescribir un comentario tóxico en inglés conservando su significado pero eliminando o suavizando el lenguaje ofensivo.

Se trata de un encoder-decoder transformer de tipo BART con 139.470.681 parámetros (unos 139,5 millones), distribuido en formato safetensors y con un repositorio de 0,6 GB. Es relevante como referencia práctica de detoxificación ligera: cabe en hardware modesto, se puede ejecutar con la librería `transformers` estándar y ofrece métricas de evaluación reproducibles (BLEU, chrF y STA) sobre un split propio agrupado por comentario tóxico.

No obstante, conviene calibrar expectativas: es un modelo pequeño, entrenado con un presupuesto de cómputo limitado (4 épocas, fp16) y orientado a un caso de uso acotado. No es un modelo de propósito general ni compite con LLM modernos en razonamiento o generación abierta; su valor está en la tarea concreta de reescritura no tóxica y en su facilidad de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART) |
| Parametros totales | 139.470.681 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BART-base admite típicamente 1024 tokens de entrada; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantización estándar de `transformers`/`bitsandbytes`, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | openrail++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/bart-base`, un transformer encoder-decoder con atención completa bidireccional en el encoder y causal en el decoder, preentrenado originalmente con objetivos de denoising. Sobre esa base se realizó un fine-tuning supervisado para la tarea de detoxificación, sin que la model card documente etapas de RLHF o DPO.

El entrenamiento usó el dataset ParaDetox (19.700 pares tóxico → neutro), que se distribuye como un único split; el autor construyó una partición 80/10/10 agrupada por comentario tóxico para evitar fugas entre train y test. Los hiperparámetros fueron: learning rate 1e-4, batch size 16, 4 épocas y precisión fp16. En inferencia se emplea búsqueda por haz con 4 beams. No se documentan innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, etc.); se trata de un fine-tuning convencional.

## Capacidades

- Reescritura de texto tóxico en inglés hacia una versión neutra o cortés conservando el significado.
- Generación texto-a-texto (`text2text-generation`) mediante `transformers` pipeline.
- Detoxificación léxica: elimina o suaviza insultos y palabras ofensivas explícitas.
- Reducción de toxicidad medible con clasificadores externos (STA del 86,9 % en su test propio).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: no; solo inglés.
- Tareas de resumen, traducción o QA: no son objetivo del fine-tuning y no están evaluadas.

## Casos de uso

- Moderación de comentarios en comunidades online: el modelo reescribe automáticamente comentarios marcados como tóxicos por un clasificador previo, generando una versión neutra que se puede mostrar al usuario o usar como sugerencia de edición antes de publicar.
- Preprocesado de datasets para entrenamiento: limpieza de corpus de comentarios (foros, redes sociales, reseñas) para reducir toxicidad antes de usarlos en el entrenamiento de otros modelos, evitando que el sesgo ofensivo se propague.
- Sugerencia de reescritura en editores de texto o clientes de mensajería: integración como paso de post-procesado que propone una versión no ofensiva del mensaje que el usuario está a punto de enviar.
- Investigación en transferencia de estilo y detoxificación: el modelo sirve como baseline reproducible con métricas BLEU/chrF/STA y un split documentado, útil para comparar nuevas técnicas de detoxificación en trabajos académicos.
- Filtrado previo en pipelines de atención al cliente: normalización de mensajes de usuarios antes de pasarlos a un sistema de tickets o a un agente conversacional, reduciendo el ruido ofensivo en las colas de soporte.
- Generación de variantes para data augmentation: a partir de un comentario tóxico se obtiene una paráfrasis neutra que puede emplearse para aumentar datos en tareas de clasificación de toxicidad o para construir pares de entrenamiento adicionales.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre su propio split de test (1.193 comentarios tóxicos únicos, evaluación multirreferencia con sacreBLEU). STA es el porcentaje de salidas que `s-nlp/roberta_toxicity_classifier` etiqueta como no tóxicas.

| Sistema | BLEU | chrF | STA |
|---|---|---|---|
| Copiar la entrada (baseline) | 54,2 | 76,6 | 0,0 % |
| Eliminar palabras de un léxico tóxico (baseline) | 63,4 | 79,3 | 85,8 % |
| Reescritura humana (referencia) | - | - | 94,3 % |
| **Este modelo** | **66,4** | **80,4** | **86,9 %** |

El autor advierte que estas cifras usan su propio split y no son directamente comparables con las del paper de ParaDetox.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,3 GB para los pesos (139,5 M de parámetros); con overhead de activaciones y runtime, menos de 1 GB en la práctica.
- VRAM estimada en fp32: aproximadamente 0,6 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU con latencia aceptable para volúmenes moderados.
- Cabe holgadamente en GPU consumer e incluso en entornos con poca memoria; no requiere A100 ni H100.
- Opciones de despliegue: `transformers` (pipeline `text2text-generation`), y por ser un modelo BART estándar es compatible con servidores de inferencia como TGI o vLLM, aunque el autor solo documenta el uso con `transformers`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jeffespejo/bart-base-paradetox-udea | 139,5 M | no disponible | Detoxificación inglés (ParaDetox) | openrail++ | Hugging Face |
| facebook/bart-base | ~139 M | 1024 tokens (típico) | Generación texto-a-texto general | MIT | Hugging Face |
| s-nlp/roberta_toxicity_classifier | no disponible | no disponible | Clasificación de toxicidad (no reescritura) | no disponible | Hugging Face |

La comparación directa con otros modelos de detoxificación entrenados sobre ParaDetox (por ejemplo, variantes tipo BART o T5 publicadas en trabajos académicos) no está disponible en la información proporcionada, ya que las métricas del autor usan un split propio no comparable con los resultados del paper original.

## Limitaciones y advertencias

- Solo elimina o suaviza toxicidad explícita (insultos, palabras ofensivas); la toxicidad implícita y el sarcasmo no se manejan bien, según el propio autor.
- Puede producir desplazamientos semánticos: la reescritura neutra puede alterar ligeramente el significado original.
- El STA del 86,9 % implica que aproximadamente un 13 % de las salidas siguen siendo clasificadas como tóxicas; no es un filtro garantizado.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Modelo pequeño (139,5 M) con entrenamiento limitado (4 épocas): no debe esperarse calidad de reescritura de un LLM grande.
- Las métricas se calculan sobre un split propio del autor y no son comparables con las del paper de ParaDetox.
- Licencia openrail++: conviene revisar sus condiciones antes de un uso comercial, ya que incluye restricciones de uso aceptable.
- Proyecto de curso universitario con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni mantenimiento continuado.
- Riesgo de alucinación y de generar reescrituras que no reflejen fielmente la intención del comentario original; se recomienda validación humana en contextos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeffespejo/bart-base-paradetox-udea
- Modelo base: https://huggingface.co/facebook/bart-base
- Dataset ParaDetox: https://huggingface.co/datasets/s-nlp/paradetox
- Clasificador de toxicidad usado para STA: https://huggingface.co/s-nlp/roberta_toxicity_classifier
- Código del proyecto: https://github.com/jeffespejo/nlp-transformers-finetuning
