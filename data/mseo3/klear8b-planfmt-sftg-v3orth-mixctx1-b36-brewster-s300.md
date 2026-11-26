# mseo3/klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s300

## Resumen

Klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s300 es un checkpoint intermedio (paso 300 de 1500) de un ajuste fino supervisado (SFT) sobre el modelo Klear-Reasoner-8B-SFT de Kwai-Klear. Lo desarrolla el usuario mseo3 y su propósito es enseñar al modelo un formato de "plan" explícito mediante dos tokens especiales nuevos, `<|plan|>` (id 151669) y `<|/plan|>` (id 151670), que delimitan un bloque de planificación antes de la respuesta razonada. Con 8.190.735.360 parámetros y pesos en bf16, es un modelo denso de escala 8B orientado a razonamiento.

El interés técnico reside en la receta de entrenamiento: se han añadido los tokens de plan con embeddings independientes (untied) y las filas correspondientes de `lm_head` se reinicializaron de forma ortogonal a sus piezas de texto, una técnica pensada para evitar que el nuevo token herede una dirección semántica espuria. Además, el dataset mezcla filas revisadas (con los pasos fallidos enmascarados de la pérdida) y filas originales de los mismos problemas leídas como contexto, lo que apunta a un entrenamiento orientado a la corrección de cadenas de razonamiento.

Se trata de un artefacto de investigación de un autor individual, con cero descargas y sin model card completa más allá de la receta, por lo que debe evaluarse como experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3, según tag `qwen3`) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo parte de Kwai-Klear/Klear-Reasoner-8B-SFT, un transformer denso de aproximadamente 8.190 millones de parámetros etiquetado con el tag `qwen3`, lo que sugiere una arquitectura de la familia Qwen3. Sobre esa base se añadieron dos tokens especiales de planificación, `<|plan|>` y `<|/plan|>`, con embeddings no atados (untied) y filas de `lm_head` reinicializadas de forma ortogonal a sus representaciones de texto, con el objetivo de que el modelo aprenda el uso del token desde cero en lugar de heredar una dirección preexistente.

El entrenamiento es un SFT con reinicio desde el modelo base (fresh start), sin continuidad de optimizador. Se usó el dataset privado `mseo3/klear8b-planfmt-revmask-sft` (commit `2cf6eb05`), subconjunto `data/mixctx_v1`, con 58.446 filas: filas revisadas con los pasos fallidos enmascarados de la pérdida y filas originales de los mismos problemas cuyos pasos fallidos en la ronda 0 se enmascaran y se leen solo como contexto. La receta (`sft_recipe_v3orth`, run `sft_g_ptokc_orth_lr2e5_mixctx1_b36_s1500_brewster`) emplea batch global de 36, learning rate de 2e-5 con decaimiento coseno hasta 1e-5 a lo largo de 1500 pasos, 30 pasos de warmup, y se ejecutó sobre 4 GPU H200 con FlashAttention 3. El checkpoint publicado corresponde al paso 300. Los pesos se fusionaron de los shards FSDP a bf16; el optimizador solo se conserva en el guardado más reciente y los shards obsoletos se podan antes de escribir cada checkpoint.

## Capacidades

- Generación de texto y razonamiento de tipo chain-of-thought, heredadas del modelo base Klear-Reasoner-8B-SFT.
- Formato de planificación explícito mediante los bloques delimitados por `<|plan|>` y `<|/plan|>`, presumiblemente para estructurar pasos antes de la respuesta final.
- Razonamiento matemático y resolución de problemas de varios pasos, dado el enfoque del dataset de entrenamiento en pasos fallidos y su corrección.
- Generación de código: no confirmado en la información disponible, aunque plausible por herencia del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: parcialmente cubiertas por el formato de plan, sin detalles adicionales.
- Capacidades multilingües: no disponible.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Investigación sobre formatos de planificación: el modelo sirve para estudiar si la introducción de tokens de plan delimitados mejora la estructura del razonamiento; se usaría comparando salidas con y sin el bloque `<|plan|>`.
- Experimentos de corrección de cadenas de razonamiento: dado que el SFT enmascara pasos fallidos, es adecuado para evaluar si el modelo aprende a evitar errores intermedios en problemas matemáticos y lógicos.
- Base para ajustes posteriores: al ser un checkpoint intermedio (paso 300 de 1500) con licencia Apache 2.0, puede emplearse como punto de partida para recetas propias de SFT o DPO.
- Evaluación de inicialización ortogonal de tokens: útil para reproducir y medir el efecto de reinicializar filas de `lm_head` de forma ortogonal en tokens especiales nuevos.
- Generación de soluciones paso a paso en entornos controlados: para prototipos internos donde se quiera forzar una fase de planificación antes de la respuesta, aunque sin garantías de producción.
- Reproducción de recetas de entrenamiento distribuidas: la model card documenta la configuración FSDP, FlashAttention 3 y gestión de checkpoints, lo que lo convierte en referencia para replicar el pipeline en clústeres con H200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16,4 GB solo para pesos (el tamaño del repo es de 16,4 GB), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto.
- Cuantización a 8 bits: aproximadamente 8-9 GB de pesos; a 4 bits, en torno a 4-5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100/H200 para entrenamiento o inferencia de alta concurrencia; RTX 4090 (24 GB) puede alojar el modelo en bf16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 en bf16 con contexto moderado; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama tras conversión a GGUF; los tokens especiales nuevos requieren configuración explícita del tokenizer en el servidor de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Klear8b-planfmt...s300) | 8,19B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint SFT intermedio con tokens de plan |
| Kwai-Klear/Klear-Reasoner-8B-SFT | ~8B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| Qwen3-8B | ~8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Familia arquitectónica sugerida por el tag `qwen3` |

No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 300 de 1500): no representa el resultado final de la receta y su calidad puede ser inferior a la del modelo base en tareas generales.
- El dataset de entrenamiento es privado y no verificable, lo que impide auditar la composición real de los datos y sus posibles sesgos.
- Riesgo de alucinación y de errores en cadenas de razonamiento: el propio diseño del dataset sugiere que el modelo base cometía fallos en pasos intermedios.
- Los tokens `<|plan|>` y `<|/plan|>` son nuevos y no estándar; cualquier pipeline de inferencia debe registrar los tokens especiales en el tokenizer y en la configuración de generación, o el formato de plan no funcionará.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan en esta ficha, conviene verificar la licencia del modelo original.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad ni de estabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s300
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
