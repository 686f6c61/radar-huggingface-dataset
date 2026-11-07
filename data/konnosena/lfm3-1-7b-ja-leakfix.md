# konnosena/LFM3-1.7B-JA-Leakfix

## Resumen

LFM3-1.7B-JA-Leakfix es una edición de pesos del modelo LiquidAI/LFM3-1.7B, publicada por el usuario konnosena en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una modificación quirúrgica de 16.329 pesos (aproximadamente el 0,001% del total) en una única matriz de la capa 23, la última del transformer. El objetivo es reducir la aparición de caracteres chinos o coreanos en respuestas en japonés, un fenómeno conocido como "script leak" o fuga de escritura que afecta a modelos multilingües pequeños.

El modelo base, LFM3-1.7B, es un transformer de 1.728.801.536 parámetros desarrollado por Liquid AI, con licencia LFM Open License v1.0 y soporte para japonés e inglés. Esta edición mantiene intactos el tokenizador, la plantilla de chat y el comportamiento de razonamiento del original, por lo que se usa exactamente igual que el modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de edición de pesos basada en direcciones de activación (activation steering aplicado a columnas de una matriz), un enfoque cada vez más común para corregir comportamientos indeseados sin reentrenar; por otro, advierte de que el efecto es modesto y específico de un idioma, lo que la convierte en una pieza útil solo en contextos muy concretos de generación en japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3, modelo base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | ja, en |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM3-1.7B de Liquid AI, un transformer de 1,7 mil millones de parámetros. La edición no implica entrenamiento alguno: se calcula la media de las activaciones del residual stream tras la capa 22 para prompts en japonés, se le resta la media para prompts en chino y coreano, y esa dirección resultante se escala con los pesos de `post_ffn_norm` y se suma a las columnas de `w2` de ocho canales concretos (4427, 3963, 4931, 4069, 2293, 2264, 2408 y 3886) de la matriz `model.layers.23.feed_forward.w2.weight`. Cada columna se escala a su propia norma.

El resultado es un sesgo hacia la escritura japonesa en los puntos donde el modelo base a veces cambia de sistema de escritura. En los ficheros GGUF solo difiere del modelo base el tensor `blk.23.ffn_down`. No se ha realizado RLHF, DPO ni ningún otro ajuste por preferencias; el resto del modelo es idéntico byte a byte al original, incluida la plantilla de chat y el comportamiento de razonamiento.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con el mismo comportamiento que el modelo base.
- Razonamiento multi-paso y modo de pensamiento (reasoning) heredado del LFM3-1.7B original.
- Tool calling y function calling, incluyendo tareas agénticas con llamadas a herramientas y argumentos estructurados.
- Trabajo con ficheros y documentos de oficina en flujos agénticos, según la evaluación del autor.
- Capacidades multilingües limitadas a japonés e inglés; el resto de idiomas no está evaluado y puede degradarse ligeramente.
- Reducción de fugas de escritura china o coreana en respuestas japonesas, especialmente en cuantización Q8_0.

## Casos de uso

- Asistentes conversacionales en japonés: el modelo reduce la probabilidad de que aparezcan caracteres chinos o coreanos en respuestas generadas, lo que mejora la calidad percibida en atención al usuario nipón. Es adecuado porque el ajuste actúa precisamente en los canales MLP que se activan al responder en japonés.
- Agentes de automatización de ficheros y documentos: la evaluación del autor se centró en tareas agénticas con tool calling y escritura de ficheros, donde el modelo mantuvo el éxito (165/196 frente a 159/196 del base en Q8_0) y redujo las fugas de escritura.
- Generación de contenido editorial en japonés: para redacción de artículos, correos o documentación donde una fuga de caracteres chinos sería un error visible, el modelo ofrece una tasa de fuga menor (2/196 frente a 10/196 en Q8_0).
- Despliegue en local con llama.cpp: al incluir GGUF Q4_K_M y Q8_0, puede ejecutarse en estaciones de trabajo sin GPU de datacenter, manteniendo el soporte de tool calling del modelo base.
- Integración en pipelines con vLLM o SGLang: el modelo base es compatible con estos servidores de inferencia, por lo que esta edición puede desplegarse como servicio HTTP para aplicaciones japonesas.
- Evaluación de técnicas de edición de pesos: sirve como caso de estudio reproducible de activation steering aplicado a columnas de una matriz, útil para investigadores que quieran replicar el método en otros idiomas o modelos.
- Fine-tuning posterior con TRL: al conservar la arquitectura y el tokenizador del LFM3-1.7B, puede usarse como punto de partida para ajustes específicos de dominio en japonés.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la evaluación del autor sobre 49 tareas agénticas en japonés, con 4 ejecuciones por tarea (196 ejecuciones por modelo). Una ejecución se cuenta como fuga si aparece texto chino o coreano en la respuesta, en un argumento de herramienta o en un fichero escrito.

| Metrica (Q8_0) | Base | Este modelo |
|---|---|---|
| Tareas superadas | 159 / 196 | 165 / 196 |
| Ejecuciones con fuga | 10 / 196 | 2 / 196 (Fisher unilateral p ≈ 0,02) |
| Tokens generados por ejecucion (mediana) | 2.182 | 2.858 |

| Metrica (Q4_K_M, misma GPU) | Base | Este modelo |
|---|---|---|
| Tareas superadas | 147 / 196 | 148 / 196 |
| Ejecuciones con fuga | 3 / 196 | 2 / 196 (no significativo) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que el éxito de tarea no bajó y que la longitud de razonamiento no se redujo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB según longitud de contexto.
- VRAM estimada en Q8_0: aproximadamente 1,8-2 GB para pesos.
- VRAM estimada en Q4_K_M: aproximadamente 1,1-1,3 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más para bf16 (RTX 3060, RTX 4060, RTX 4090); para Q4_K_M basta con 4 GB (GTX 1650, RTX 3050). En datacenter, A100 y H100 son sobredimensionadas para este tamaño, pero válidas para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, en todas las mencionadas con la cuantización adecuada.
- Opciones de despliegue: transformers (safetensors bf16), llama.cpp con los GGUF incluidos, y el modelo base es compatible con vLLM y SGLang según la información del repositorio de LiquidAI. También es posible usar Ollama si se importa el GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El autor reporta una mediana de 2.858 tokens generados por ejecución frente a 2.182 del base en Q8_0, lo que implica un mayor coste de generación en tareas agénticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-JA-Leakfix | 1,73 B | no disponible | ja, en | LFM Open License v1.0 | Edición de pesos del LFM3-1.7B; reduce fugas de escritura en japonés |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | ja, en | LFM Open License v1.0 | Modelo original sin edición; 10/196 fugas en Q8_0 frente a 2/196 |
| LFM3-2B (vision/audio/omni, según filtración) | ~2 B | no disponible | no disponible | no disponible | Checkpoint no anunciado oficialmente por Liquid AI; no verificable |

No se dispone de datos de benchmarks estandar para comparar con alternativas de la misma categoría (modelos de ~1,7 B multilingües). La comparación más directa es con el propio modelo base, que comparte arquitectura, tokenizador y licencia.

## Limitaciones y advertencias

- La edición solo se ha probado en japonés; su efecto en otros idiomas no se ha medido y podrían empeorar ligeramente.
- Persisten fugas de escritura, por ejemplo chino escrito solo con caracteres que también son kanji japoneses válidos (`新的フォルダー`).
- El efecto es pequeño en uso cotidiano: el modelo base ya fugaba poco, y la diferencia solo es estadísticamente significativa en Q8_0.
- En Q4_K_M la diferencia no fue significativa (3/196 frente a 2/196), por lo que en esa cuantización no hay evidencia de mejora.
- No corrige la causa raíz del comportamiento, solo lo sesga en los puntos de activación identificados.
- La licencia LFM Open License v1.0 es una licencia "other" con posibles restricciones para uso comercial; debe revisarse el fichero LICENSE antes de desplegar en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- Riesgo de alucinación inherente al modelo base de 1,7 B; no se han publicado evaluaciones de veracidad.
- Requiere versiones de transformers o llama.cpp compatibles con LFM3; versiones antiguas no cargarán el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/konnosena/LFM3-1.7B-JA-Leakfix
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Artículo sobre la filtración de LFM3 (OrcaRouter): https://www.orcarouter.ai/blog/lfm3-leak-release-date-omni
