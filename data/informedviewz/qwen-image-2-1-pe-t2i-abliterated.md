# informedviewz/Qwen-Image-2.1-PE-T2I-abliterated

## Resumen

Qwen-Image-2.1-PE-T2I-abliterated es una variante "abliterated" (con las direcciones de rechazo eliminadas por ortogonalización de pesos) del modelo Qwen/Qwen-Image-2.1-PE-T2I, publicada por el usuario informedviewz. No se trata de un modelo de imagen generativa clásico: el checkpoint se etiqueta como `prompt-rewriting` y `text-to-image`, y la model card describe su función como la reescritura de briefs (instrucciones de generación de imagen) dentro de un pipeline de text-to-image, con un system prompt obligatorio incluido en el repositorio. El modelo base pertenece a la familia Qwen-Image de Alibaba/Qwen y este derivado se distribuye bajo la Qwen Research License.

El checkpoint contiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) en formato safetensors, con un tamaño de repositorio de 48,1 GB, lo que sugiere pesos en precisión alta (probablemente bf16 o fp16). La arquitectura declarada en los tags es `qwen3_5`, lo que indica una base de tipo transformer de la familia Qwen 3.5 adaptada a la tarea de reescritura de prompts.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de modificación de pesos (abliteration) aplicada a un modelo de la familia Qwen-Image; por otro, advierte de que el resultado elimina de forma sustancial el comportamiento de seguridad del modelo original, con implicaciones legales y éticas importantes para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (`qwen3_5` según tags); incluye capas `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj` editadas |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License; uso no comercial únicamente) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado por modificación de pesos del checkpoint Qwen/Qwen-Image-2.1-PE-T2I. No se ha reentrenado: la técnica aplicada es abliteration mediante ortogonalización de pesos, siguiendo la receta de huihui-ai / Sumandora. Las ediciones se realizaron en `embed_tokens`, en cada `self_attn.o_proj`, en `linear_attn.out_proj` y en `mlp.down_proj`, lo que indica una arquitectura híbrida con atención lineal además de atención estándar.

Se calculan dos direcciones de rechazo. La dirección "hard" se obtiene como diferencia de medias entre AdvBench y Alpaca en el último token del prompt. La dirección "soft" se construye comparando briefs sanitizados por el modelo base frente a briefs cargados que el modelo reescribió fielmente, medida dentro del propio system prompt y con la edición hard ya aplicada, de modo que resulta ortogonal a la dirección hard. El checkpoint publicado aplica la dirección hard en la capa 17 con alpha 1.0 y edita las capas 0 a 31.

La evaluación reportada por el autor usa muestreo con temperatura 1.0, top_p 0.95 y top_k 20 sobre prompts reservados (held-out). La estabilidad split-half de la dirección hard en las capas elegidas es de 0.993 (coseno); los diagnósticos de la dirección soft aparecen como `nan` en la model card.

## Capacidades

- Reescritura de prompts (prompt rewriting) para pipelines de text-to-image: transforma briefs de usuario en descripciones más elaboradas para el generador de imagen.
- Salida en JSON válido para briefs benignos de tipo Parti: 100,0% de validez JSON tanto en el original como en este checkpoint.
- Modo de razonamiento explícito: la model card menciona contenido dentro de etiquetas `<think>`, lo que sugiere un modo de pensamiento previo a la respuesta.
- Comportamiento "uncensored": las direcciones de rechazo se han eliminado en gran medida (tasa de rechazos hard en AdvBench del 1,0% frente al 84,6% del original).
- Integración con system prompt propio: el repositorio incluye `system_prompt.txt`, que es obligatorio para replicar el comportamiento evaluado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: el checkpoint sirve para estudiar cómo la ortogonalización de direcciones de rechazo afecta al comportamiento del modelo, comparando métricas de rechazo, sobre-suavizado y divergencia KL frente al original.
- Generación de briefs para pipelines de imagen: dado que el modelo reescribe instrucciones en descripciones detalladas (longitud media de 381 palabras en briefs benignos), puede integrarse como etapa previa a un generador text-to-image que consuma prompts largos y estructurados.
- Evaluación comparativa de robustez: permite medir la degradación de seguridad de un modelo tras eliminar direcciones de rechazo, con métricas concretas (AdvBench, Parti, KL frente al original).
- Prototipado de asistentes creativos sin restricciones de filtrado: en entornos de investigación controlados, para explorar la generación de descripciones visuales sin rechazos, siempre con revisión humana.
- Auditoría de sistemas de moderación: al ser un modelo con filtros reducidos, puede usarse para probar la eficacia de capas de moderación externas (clasificadores, filtros de salida) en un pipeline de generación de imágenes.
- Estudio de estabilidad de direcciones de rechazo: la métrica split-half (0.993) permite reproducir y validar metodologías de extracción de direcciones en modelos de la familia Qwen.

## Benchmarks y rendimiento

| Métrica | Original | Este modelo |
|---|---:|---:|
| Rechazos hard, test AdvBench (chat) | 84,6% | 1,0% |
| Sanitizado o rechazado, briefs que el base sanitizaba (A) | 9,4% | 4,8% |
| Sobre-suavizado, briefs intensos que el base aceptaba (B) | 4,0% | 4,0% |
| Sanitizado o rechazado, briefs borderline | — | 6,0% |
| Habla de políticas en `<think>`, briefs A | 2,4% | 1,6% |
| JSON válido, briefs benignos Parti | 100,0% | 100,0% |
| KL vs original, chat inofensivo (siguiente token) | — | 0,0002 |
| KL vs original, briefs benignos (siguiente token) | — | 0,0000 |

Longitud media de reescritura (benigna): 427 → 381 palabras. El autor advierte de que "sanitizado" es un proxy por palabras clave y recomienda revisar `abliteration/samples_*.jsonl` antes de confiar en diferencias pequeñas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 B parámetros, en bf16/fp16 se requieren aproximadamente 18,8 GB solo para pesos, más memoria para activaciones y KV cache; en cuantización de 8 bits, unos 9,4 GB; en 4 bits, unos 4,7 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia en precisión completa sin cuantizar. Para cuantización 8/4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ser suficiente.
- ¿Cabe en GPU consumer? En bf16 no cabe en GPUs de 16 GB; en 8 bits cabe ajustadamente en 24 GB; en 4 bits cabría en GPUs de 8-12 GB, aunque no se han publicado pesos cuantizados en el repositorio.
- Opciones de despliegue: no se especifican en la model card. Al ser safetensors con arquitectura `qwen3_5`, sería desplegable con frameworks compatibles con transformers, vLLM o TGI, pero no hay confirmación publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| informedviewz/Qwen-Image-2.1-PE-T2I-abliterated | ~9,4 B | no disponible | qwen-research (no comercial) | Derivado abliterated, filtros de rechazo reducidos |
| Qwen/Qwen-Image-2.1-PE-T2I (base) | no disponible en la información | no disponible | qwen-research | Modelo original con alineación de seguridad intacta |
| Alternativas de prompt-rewriting para T2I | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con otras alternativas de la misma categoría (reescritura de prompts para text-to-image) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Seguridad sustancialmente reducida: la tasa de rechazos hard cae del 84,6% al 1,0%; las salidas pueden ser explícitas o perturbadoras.
- Riesgo de contenido dañino: el autor recomienda revisar las salidas, mantener el modelo alejado de menores y cumplir la legislación local. Los prompts que mencionan a menores se excluyeron de todos los conjuntos usados para construir el modelo.
- Licencia restrictiva: Qwen Research License, uso no comercial únicamente. Cualquier uso comercial requiere licencia adicional del titular de los derechos.
- No afiliado a Alibaba/Qwen: el modelo es un derivado no oficial y no cuenta con el respaldo del desarrollador original.
- Sesgos: no se han documentado sesgos específicos en la información proporcionada; al derivar de un modelo base, hereda los sesgos de este.
- Alucinación: no se han publicado métricas de alucinación para esta variante.
- Idiomas y contexto: no disponibles; no se puede garantizar el comportamiento en idiomas distintos del inglés ni en ventanas de contexto largas.
- Diagnósticos incompletos: la estabilidad split-half de la dirección soft y el coseno estático soft-hard aparecen como `nan`, lo que limita la validación de la edición soft.
- Dependencia del system prompt: el comportamiento evaluado requiere el `system_prompt.txt` incluido en el repositorio; sin él, los resultados pueden diferir.
- Sin datos de benchmarks estándar: no hay resultados publicados de MMLU, HumanEval, GSM8K ni métricas de calidad de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/informedviewz/Qwen-Image-2.1-PE-T2I-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Repositorio de la receta de abliteration (huihui-ai): no disponible como enlace verificado en la información proporcionada
- Repositorio de la receta de abliteration (Sumandora): no disponible como enlace verificado en la información proporcionada
- Paper o blog del modelo base Qwen-Image: no disponible en la información proporcionada
