# Raghav-Singhal/1pp-0.58b-v2-filt-sft

## Resumen

1pp-0.58b-v2-filt-sft es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), asociado a EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: forma parte de una escalera de escalado (scaling ladder) que compara distintas condiciones de preentrenamiento sobre un mismo corpus. En concreto, esta variante implementa la condición "Filtered" (filtrada) de la línea v2, seguida de un ajuste supervisado (SFT).

El modelo parte de un corpus crudo (documentos DCLM-edu) sobre el que se aplica un clasificador de seguridad basado en gte que marca 3.869.498 documentos (4,6%) con puntuación máxima de chunk igual o superior a 3. La innovación metodológica es que esos documentos permanecen en las secuencias de entrenamiento (en contexto) pero no contribuyen a la pérdida, de modo que el empaquetado de datos es idéntico byte a byte al del modelo raw de referencia. Esto permite aislar el efecto del filtrado sin alterar la distribución de contexto.

Arquitectura de tipo decoder estilo Llama con 24 capas, dimensión oculta 1.152, FFN de 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`. Es relevante ahora como pieza reproducible de un estudio controlado sobre filtrado de datos y ajuste supervisado en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas / 3 KV, RMSNorm, RoPE base 10.000) |
| Parametros totales | 580.445.568 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos están en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama, sin sesgos y sin QK-norm, con embeddings no atados y atención con 9 cabezas de consulta y 3 de clave/valor. El preentrenamiento cubre 11.106 pasos sobre el flujo alineado por pasos del modelo raw, lo que equivale a 23.290 millones de posiciones de token, con batch global de 512 × 4.096 tokens y máscara de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, init std 0,0119 y precisión bf16.

La pérdida de validación del modelo base (por token, sobre 2.433 documentos retenidos y las conversaciones reescritas a partir de ellos, checkpoint final) es de 2,625 para texto de documento, 2,803 para texto de asistente y 2,821 para texto de usuario. El SFT se realiza durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track citado de constitución), `dlab-spp/sp-sft-normal-300k` sin prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa el mismo stack que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de SFT en retenido (tokens de asistente, 1.998 conversaciones) es 2,199. Los pesos de HF fueron verificados contra el checkpoint de Megatron recalculando pérdidas de validación, con diferencia absoluta de 0,0000 en los segmentos [3, 4] del conjunto de validación de SFT.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento básico y respuesta a instrucciones derivados del SFT sobre mezclas multiturno y de seguridad.
- Seguimiento de conversaciones multiturno, gracias a los 98,5k ejemplos multiturno del conjunto de SFT.
- Generación condicionada por contexto de hasta 4.096 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).
- No dispone de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre filtrado de datos: el modelo sirve como condición "Filtered" controlada frente al modelo raw de la misma escalera, permitiendo medir el efecto del filtrado por clasificador de seguridad sin cambiar el empaquetado de datos. Es su uso principal declarado.
- Reproducción de experimentos de scaling: al compartir receta, semilla y flujo de datos con el resto de la escalera 1PP, permite replicar comparaciones de pérdida de validación entre condiciones (raw, SPP, filtered) a 0,58B.
- Estudio de SFT sobre modelos pequeños: con una pérdida de validación de 2,199 en tokens de asistente, es útil para analizar cómo el ajuste supervisado modifica el comportamiento de un modelo base de 580M parámetros.
- Evaluación de seguridad de datos de preentrenamiento: los documentos marcados por el clasificador gte (4,6% del corpus) quedan en contexto pero sin pérdida, lo que permite estudiar si el filtrado por pérdida afecta a la generación de contenido sensible.
- Prototipado de pipelines de conversación en inglés con ChatML: útil para validar plantillas de prompt, parada en `<|im_end|>` y formato de turnos antes de escalar a modelos mayores.
- Docencia y experimentación con hardware modesto: al ser un modelo de 580M parámetros con pesos safetensors de 1,2 GB, se puede cargar y ejecutar en entornos de laboratorio con una sola GPU consumer para estudiar dinámicas de entrenamiento y SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Documento (base, retenido) | 2,625 |
| Texto de asistente (base, retenido) | 2,803 |
| Texto de usuario (base, retenido) | 2,821 |
| SFT, tokens de asistente (1.998 conversaciones retenidas) | 2,199 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 580M parámetros ocupan aproximadamente 1,16 GB de pesos; con overhead de activaciones y caché KV para 4.096 tokens, el consumo realista se sitúa en torno a 2-3 GB.
- En cuantización de 8 bits, los pesos bajan a unos 0,6 GB; en 4 bits, a unos 0,3 GB (estimaciones a partir del número de parámetros; el autor no publica variantes cuantizadas).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite ejecución holgada. Para entrenamiento o SFT se recomienda al menos una A100 o H100, dado el uso de Megatron y Muon.
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte explícito de llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-filt-sft | 580M | 4.096 | Apache 2.0 | Condición filtrada con SFT, artefacto de investigación |
| 1pp-0.58b-v2-raw-base | 580M | 4.096 | Apache 2.0 | Modelo raw de referencia de la misma escalera, sin filtrado |
| SmolLM2 (familia) | 135M / 360M / 1.7B | 8.192 en la variante 1.7B (según documentación pública) | Apache 2.0 | Familia de modelos pequeños de Hugging Face; comparte tokenizador con este modelo |

La comparación con alternativas de la misma categoría se limita a los modelos de la propia escalera 1PP y a la familia SmolLM2, cuyo vocabulario reutiliza este modelo. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Idioma limitado al inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Ventana de contexto de 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación inherente a un modelo de 580M parámetros entrenado sobre 23.290 millones de posiciones de token; no se reportan evaluaciones de fidelidad.
- Sesgos potenciales derivados del corpus DCLM-edu y de las mezclas de SFT; el filtrado por clasificador de seguridad no elimina sesgos, solo excluye documentos marcados de la pérdida.
- El filtrado deja los documentos marcados en contexto, por lo que el modelo puede haber aprendido patrones de contenido sensible a través de la atención aunque no se optimizara sobre ellos.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación no se recomienda su despliegue en producción sin evaluación adicional.
- Formato de chat sin turno de sistema: no admite instrucciones de sistema, lo que limita el control fino del comportamiento en producción.
- No se documentan variantes cuantizadas oficiales ni soporte de tool calling, agentes o multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-filt-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
