# serio-foundation/serio-nd-guard-0.1b-v0.1

## Resumen

`serio-nd-guard-0.1b-v0.1` es un modelo de clasificación de texto orientado a seguridad y moderación de contenido, desarrollado por `serio-foundation`. Está construido sobre una arquitectura RoBERTa y deriva mediante fine-tuning del modelo `speakleash/Bielik-Guard-0.1B-v1.1`, según los metadatos de HuggingFace.

El modelo resuelve la tarea de etiquetar texto para guardrails y content moderation, con foco en polaco (`pl`). Su tamaño aproximado de 0,1B parámetros y la disponibilidad de formatos ONNX, safetensors e int8 lo hacen adecuado para filtros de seguridad de baja latencia y despliegues en CPU o entornos con recursos limitados.

Es relevante porque los guardrails compactos permiten añadir una capa de control antes o después de un LLM generativo sin depender de un modelo grande. No obstante, la ficha pública es mínima: no se han publicado benchmarks, longitud de contexto ni detalles completos de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) para clasificación de texto |
| Parámetros totales | Aproximadamente 0,1B (100 millones), según el nombre del modelo; no se dispone de recuento exacto |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (tag `int8`); no se detallan otras variantes |
| Idiomas soportados | Polaco (`pl`); no hay información sobre otros idiomas |
| Licencia | Apache-2.0 según el tag `license:apache-2.0`; el campo de licencia de la ficha figura como no disponible |
| Formato de pesos | safetensors y ONNX; incluye variante int8 según los tags |
| Modelo base | `speakleash/Bielik-Guard-0.1B-v1.1` |
| Pipeline | `text-classification` |
| Librería | ONNX |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura RoBERTa, es decir, un transformer encoder adaptado a clasificación de texto. No es un modelo generativo ni un MoE: produce etiquetas de clasificación, previsiblemente relacionadas con seguridad y moderación, aunque la ficha no detalla el conjunto exacto de etiquetas ni la cabeza de clasificación.

El entrenamiento se basa en un fine-tuning desde `speakleash/Bielik-Guard-0.1B-v1.1`. Los tags indican el uso de los datasets `ToxicityPrompts/PolyGuardMix`, `allenai/wildguardmix` y `thesofakillers/jigsaw-toxic-comment-classification-challenge`. No se documentan el número de tokens, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. Tampoco se especifican detalles de tokenización, ventana máxima o calibración.

## Capacidades

- Clasificación de texto para seguridad, guardrails y moderación de contenido, según los tags `safety`, `guardrails` y `content-moderation`.
- Etiquetado de toxicidad y contenido dañino, coherente con los datasets de toxicidad y moderación empleados.
- Procesamiento de texto en polaco (`pl`); no hay evidencia de soporte para otros idiomas.
- Integración en pipelines de filtrado previo o posterior a un LLM, siempre que se respete la tarea de clasificación.
- Inferencia eficiente en CPU o entornos limitados gracias a su tamaño de 0,1B y a la variante int8/ONNX.
- No se documentan capacidades de generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, visión, audio ni modo thinking.
- No se documentan capacidades multilingües distintas del polaco.

## Casos de uso

- Moderación de comentarios en foros y medios en polaco: el modelo puede clasificar cada comentario antes de publicarlo y derivar los casos positivos a revisión humana, reduciendo la exposición a contenido tóxico.
- Filtrado previo de prompts en un chatbot: se usa como clasificador de entrada para bloquear o marcar peticiones inseguras antes de enviarlas al LLM generativo, con bajo coste por su tamaño de 0,1B.
- Filtrado posterior de respuestas generadas: permite revisar la salida de un LLM antes de mostrarla al usuario, añadiendo una capa de guardrails independiente del modelo generativo.
- Moderación en atención al cliente automatizada: clasifica mensajes multi-turno o tickets individuales para detectar abuso, toxicidad o contenido no permitido y activar protocolos de escalado.
- Curación de datasets: puede etiquetar grandes volúmenes de texto en polaco para filtrar ejemplos tóxicos o inseguros antes de usarlos en entrenamiento o evaluación.
- Despliegue en edge o CPU: al disponer de ONNX e int8, puede ejecutarse en servidores sin GPU o en dispositivos con recursos limitados para moderación de baja latencia.
- Revisión por lotes: adecuado para procesos offline de clasificación masiva de comentarios, reseñas o documentos, donde el throughput importa más que la interacción en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB para pesos en fp32, 0,2 GB en fp16 y 0,1 GB en int8, calculado teóricamente a partir de 0,1B parámetros; el overhead del runtime no está cuantificado.
- GPU recomendadas: no requiere GPU. Una RTX 4090, A100 o H100 son innecesarias para este tamaño; cualquier GPU consumer con 2-4 GB de VRAM o más puede ejecutarlo con margen.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna; también es viable en CPU.
- Opciones de despliegue: ONNX Runtime para el formato ONNX, Transformers y Optimum para los pesos safetensors, y HuggingFace Inference Endpoints según el tag `endpoints_compatible`. vLLM y llama.cpp no están orientados a este tipo de clasificador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `serio-foundation/serio-nd-guard-0.1b-v0.1` | ~0,1B | No disponible | Clasificación de seguridad y moderación, polaco | Apache-2.0 según tag; campo de licencia no disponible | HuggingFace |
| `speakleash/Bielik-Guard-0.1B-v1.1` | ~0,1B según el nombre | No disponible | Guardrails, polaco | No disponible | HuggingFace, modelo base |
| Alternativas comparables de guardrails en polaco | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de otras alternativas en la información proporcionada, por lo que no es posible comparar rendimiento, contexto o licencia con rigor.

## Limitaciones y advertencias

- Es un modelo de clasificación, no generativo: no puede mantener conversaciones, generar texto ni ejecutar razonamiento multi-paso.
- El idioma principal documentado es el polaco; no hay información sobre calidad o soporte en castellano u otros idiomas.
- No se documentan sesgos específicos, pero los datasets de toxicidad y moderación pueden introducir sesgos de anotación, dominio y registro lingüístico.
- Riesgo de falsos positivos y falsos negativos; no se publican métricas de precisión, recall, calibración ni umbrales recomendados.
- No hay benchmarks publicados, por lo que no se puede comparar su rendimiento de forma cuantitativa con otros guardrails.
- La licencia Apache-2.0 aparece en los tags, pero el campo de licencia de la ficha figura como no disponible; conviene verificar los términos antes de un uso comercial.
- No se especifica la longitud máxima de contexto; para textos largos puede ser necesario truncar, pero no hay confirmación documental.
- Es una versión 0.1 con model card mínima; no debería usarse como único sistema de moderación en producción sin evaluación y supervisión humana.

## Enlaces

- [HuggingFace: serio-foundation/serio-nd-guard-0.1b-v0.1](https://huggingface.co/serio-foundation/serio-nd-guard-0.1b-v0.1)
- [Modelo base: speakleash/Bielik-Guard-0.1B-v1.1](https://huggingface.co/speakleash/Bielik-Guard-0.1B-v1.1)
- [arXiv 2602.07954](https://arxiv.org/abs/2602.07954)
- [arXiv 2406.18495](https://arxiv.org/abs/2406.18495)
- [arXiv 2504.04377](https://arxiv.org/abs/2504.04377)
- [arXiv 2506.16322](https://arxiv.org/abs/2506.16322)
- [Dataset: ToxicityPrompts/PolyGuardMix](https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix)
- [Dataset: allenai/wildguardmix](https://huggingface.co/datasets/allenai/wildguardmix)
- [Dataset: thesofakillers/jigsaw-toxic-comment-classification-challenge](https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge)

No se han proporcionado otros enlaces de blog, repositorio o demo en la información disponible.
