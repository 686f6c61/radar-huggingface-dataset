# flowxai/nsfw

## Resumen

`flowxai/nsfw` es un detector de contenido NSFW (sexual y violencia gráfica) desarrollado por flowx-ai como parte de su librería `border`, un sistema de guardrails para inspeccionar el texto que entra y sale de un LLM. El modelo es un clasificador de texto multilingüe basado en `FacebookAI/xlm-roberta-base` con una cabeza de clasificación multi-etiqueta, exportado a ONNX en formato INT8. No es un clasificador NSFW de propósito general: está entrenado específicamente para la política de la librería `border` y se lee en un punto de operación calibrado (umbral 0.76), devolviendo una decisión estructurada junto con un registro de evidencia auditable.

El artefacto publicado es un modelo ONNX de 535 MB (solo la tabla de embeddings está cuantizada a INT8, lo que preserva la precisión sin sacrificar tamaño) con una ventana de entrenamiento de 96 tokens. Soporta 26 idiomas europeos, incluyendo español, alemán, francés, italiano, polaco, turco, entre otros. Su relevancia actual radica en que ofrece una solución de moderación ligera, local y reproducible para aplicaciones que integran LLMs, sin depender de servicios externos ni de modelos alojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base con cabeza de clasificación multi-etiqueta |
| Parametros totales | no disponible (base XLM-RoBERTa, ~278M según el modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | INT8 (solo tabla de embeddings) |
| Idiomas soportados | az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr (26 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.int8.onnx) y tokenizer.json |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe preentrenado con masked language modeling en 100 idiomas. Sobre su representación de secuencia se añade una cabeza de clasificación multi-etiqueta con dos etiquetas: `sexual` y `graphic_violence`. El entrenamiento se realizó específicamente para la política de la librería `border`, no con un dataset público genérico. El punto de operación se calibró sobre la partición de validación con el objetivo de maximizar el F1 macro, resultando en un umbral de 0.76. La cuantización se limitó a la tabla de embeddings (operación Gather), evitando cuantizar los MatMul del encoder, lo que reduce el tamaño de 856 MB a 535 MB con una deriva media de logits de 0.0036 y sin cambios en las decisiones sobre 300 textos de prueba.

## Capacidades

- Clasificación de texto en dos categorías: contenido sexual y violencia gráfica.
- Detección multilingüe en 26 idiomas europeos, con soporte para idiomas de baja representación como maltés, irlandés y húngaro (aunque con menor rendimiento).
- Integración con la librería `border` para escaneo de entradas y salidas de LLMs, devolviendo un veredicto (`allow`, `flag`, `redact`, `block`) y un registro de evidencia con hashes.
- Funciona como guardrail en tiempo de ejecución: presupuesto de 225 ms a 87 tokens en un hilo de CPU.
- Ejecución local sin dependencia de red tras la descarga de pesos.
- Formato ONNX estándar, cargable con `onnxruntime` directamente.

## Casos de uso

- Moderación de contenido en chatbots: el modelo puede filtrar mensajes de usuarios que contengan lenguaje sexual o violencia gráfica antes de que lleguen al LLM, evitando respuestas inapropiadas.
- Control de salidas generadas: tras la generación de un LLM, se escanea la respuesta para detectar contenido NSFW y aplicar políticas de redacción o bloqueo automático.
- Cumplimiento normativo en plataformas europeas: al soportar 26 idiomas, permite auditar contenido en múltiples lenguas de la UE con un único modelo, facilitando el cumplimiento de la Directiva de Servicios Digitales.
- Filtrado de contenido en foros o comunidades online: integrado como middleware, clasifica publicaciones y comentarios en tiempo real, marcando aquellos que requieren revisión humana.
- Protección de menores en aplicaciones educativas: bloquea entradas o salidas que contengan material sexual o violento, usando el umbral calibrado para minimizar falsos positivos.
- Auditoría de conversaciones: el registro de evidencia con hashes permite reconstruir qué texto fue marcado y por qué, útil para trazas de cumplimiento y análisis forense.

## Benchmarks y rendimiento

La model card publica resultados por idioma sobre la partición de validación, con 10 ejemplos de soporte por idioma (9 para irlandés). El F1 global a umbral 0.5 es 0.919, y a umbral calibrado 0.76 es 0.943. La tabla detallada:

| Idioma | Soporte | Precisión | Recall | F1 |
|---|---|---|---|---|
| Alemán (de) | 10 | 1.000 | 1.000 | 1.000 |
| Inglés (en) | 10 | 1.000 | 1.000 | 1.000 |
| Estonio (et) | 10 | 1.000 | 1.000 | 1.000 |
| Francés (fr) | 10 | 1.000 | 1.000 | 1.000 |
| Croata (hr) | 10 | 1.000 | 1.000 | 1.000 |
| Italiano (it) | 10 | 1.000 | 1.000 | 1.000 |
| Letón (lv) | 10 | 1.000 | 1.000 | 1.000 |
| Polaco (pl) | 10 | 1.000 | 1.000 | 1.000 |
| Eslovaco (sk) | 10 | 1.000 | 1.000 | 1.000 |
| Búlgaro (bg) | 10 | 0.909 | 1.000 | 0.952 |
| Danés (da) | 10 | 0.909 | 1.000 | 0.952 |
| Finlandés (fi) | 10 | 0.909 | 1.000 | 0.952 |
| Portugués (pt) | 10 | 0.909 | 1.000 | 0.952 |
| Esloveno (sl) | 10 | 0.909 | 1.000 | 0.952 |
| Sueco (sv) | 10 | 0.909 | 1.000 | 0.952 |
| Turco (tr) | 10 | 0.909 | 1.000 | 0.952 |
| Rumano (ro) | 10 | 1.000 | 0.900 | 0.947 |
| Azerí (az) | 10 | 0.833 | 1.000 | 0.909 |
| Checo (cs) | 10 | 0.833 | 1.000 | 0.909 |
| Lituano (lt) | 10 | 0.833 | 1.000 | 0.909 |
| Neerlandés (nl) | 10 | 0.833 | 1.000 | 0.909 |
| Español (es) | 10 | 0.900 | 0.900 | 0.900 |
| Griego (el) | 10 | 0.769 | 1.000 | 0.870 |
| Húngaro (hu) | 10 | 0.714 | 1.000 | 0.833 |
| Irlandés (ga) | 9 | 0.875 | 0.778 | 0.824 |
| Maltés (mt) | 10 | 0.600 | 0.600 | 0.600 |

No se han publicado comparativas con otros clasificadores NSFW en la información disponible.

## Requisitos de hardware

- El artefacto ONNX INT8 pesa 535 MB, por lo que cabe en memoria RAM de cualquier sistema moderno.
- Inferencia en CPU: presupuesto declarado de 225 ms a 87 tokens en un solo hilo de CPU. No requiere GPU.
- Compatible con `onnxruntime`; también se indica compatibilidad con `text-embeddings-inference` y `endpoints_compatible`, aunque su uso principal es como detector en la librería `border`.
- Para despliegue en producción, puede ejecutarse en instancias pequeñas de cloud (1 vCPU, 1 GB RAM) o en edge devices.
- La latencia es adecuada para filtrado en tiempo real en pipelines de LLM, siempre que se respete la ventana de 96 tokens y se implemente chunking para textos más largos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros detectores NSFW (por ejemplo, Detoxify o modelos de moderación de HuggingFace). La model card no incluye comparaciones externas. Como referencia cualitativa, el modelo se distingue por su soporte multilingüe de 26 idiomas y su integración con un sistema de guardrails con registro de evidencia, pero no hay métricas comparables disponibles.

## Limitaciones y advertencias

- El modelo no es un clasificador NSFW de propósito general: está entrenado para la política específica de la librería `border` y solo detecta dos categorías (`sexual`, `graphic_violence`). No cubre otros tipos de contenido dañino (odio, acoso, etc.).
- El umbral calibrado es 0.76; usar el valor por defecto de 0.5 puede degradar el F1 (pasa de 0.943 a 0.919). La model card advierte que varios detectores de esta familia reportan F1 0.000 con umbral 0.5 en algunos idiomas.
- La ventana de entrenamiento es de 96 tokens. Para textos más largos hay que implementar chunking y recombinar puntuaciones; de lo contrario, las puntuaciones fuera de la ventana son extrapolación.
- Idiomas con rendimiento bajo: maltés (F1 0.600, ausente del preentrenamiento de XLM-R), irlandés (0.824) y húngaro (0.833). Estos pueden producir más falsos positivos o negativos.
- La cuantización solo afecta a la tabla de embeddings; cuantizar todo el modelo (como se hace habitualmente) degrada significativamente las decisiones (cambia 51 de 300 decisiones).
- El modelo no es generativo; solo produce etiquetas de clasificación. No debe usarse para tareas de generación o razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para integrarse con `border`, por lo que su uso fuera de ese contexto requiere gestionar manualmente el umbral y el chunking.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flowxai/nsfw
- Repositorio de la librería `border`: https://github.com/flowx-ai/border
