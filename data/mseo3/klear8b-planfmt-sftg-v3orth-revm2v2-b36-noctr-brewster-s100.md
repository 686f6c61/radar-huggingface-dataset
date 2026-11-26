# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s100

## Resumen

Klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s100 es un ajuste fino supervisado (SFT) del modelo Kwai-Klear/Klear-Reasoner-8B-SFT, publicado por el usuario mseo3 en Hugging Face. Se trata de un checkpoint intermedio, concretamente el paso 100 de un entrenamiento planificado a 1500 pasos, cuyo objetivo es ensenar al modelo a emitir tokens de planificacion explicitos (`<|plan|>` y `<|/plan|>`) antes de generar la respuesta final. El modelo base es un transformer denso de 8.190.735.360 parametros (8,19 mil millones) orientado a razonamiento.

La relevancia de esta publicacion es fundamentalmente experimental: forma parte de una comparativa A/B controlada en la que se aisla el efecto de un termino de contraste sobre los planes (plan-contrast margin) desactivandolo, manteniendo constante todo lo demas (semilla, datos, hiperparametros). Por tanto, es una pieza de investigacion sobre formatos de planificacion en modelos de razonamiento, no un modelo listo para produccion. El repositorio ocupa 16,4 GB y los pesos se distribuyen en safetensors en bf16.

La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial segun los terminos de dicha licencia. No obstante, al ser un checkpoint del paso 100 de 1500, su calidad final es presumiblemente inferior a la del modelo base y a la del checkpoint final de la receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3, segun tag `qwen3`) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Klear-Reasoner-8B-SFT, que a su vez se etiqueta como `qwen3` en Hugging Face, lo que sugiere una arquitectura transformer densa de la familia Qwen3 con 8,19 mil millones de parametros. El ajuste anade dos tokens especiales de planificacion: `<|plan|>` (id 151669) y `<|/plan|>` (id 151670), con embeddings no atados (untied) y filas de `lm_head` reinicializadas de forma ortogonal a sus piezas de texto correspondientes.

El entrenamiento se ejecuto sobre 4 GPU H200 con FlashAttention 3, con batch global de 36, learning rate 2e-5 con decaimiento coseno hasta 1e-5 a lo largo de 1500 pasos, warmup de 30 pasos y arranque desde cero desde el modelo base. Los datos provienen del dataset privado `mseo3/klear8b-planfmt-revmask-sft` (revision `5ef1de66`, subconjunto `data/rev_m2_v2`), con 27.773 filas revisadas y enmascaramiento de los pasos fallidos en la perdida. La innovacion metodologica es la comparativa A/B: este run (b36) es identico a otro salvo que el termino de contraste de planes esta desactivado (`data.plan_contrast_margin=0`). El checkpoint publicado corresponde al paso 100, no al final del entrenamiento.

## Capacidades

- Generacion de texto y razonamiento en el estilo del modelo base Klear-Reasoner-8B.
- Emision de bloques de planificacion delimitados por `<|plan|>` y `<|/plan|>` antes de la respuesta, segun el formato ensenado en el SFT.
- Razonamiento multi-paso y descomposicion de problemas (heredado del modelo base de razonamiento).
- Generacion de codigo y matematicas (capacidades tipicas del modelo base, no verificadas en este checkpoint).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no confirmado para este checkpoint; el formato de plan es una forma de razonamiento estructurado.

## Casos de uso

- Investigacion sobre formatos de planificacion: comparar este checkpoint (sin termino de contraste) con el run A/B equivalente para medir el efecto del margin de contraste en la calidad de los planes generados.
- Analisis de checkpoints intermedios: estudiar como evoluciona la adherencia al formato `<|plan|>` a lo largo del entrenamiento comparando el paso 100 con pasos posteriores.
- Experimentos de destilacion de razonamiento: usar los planes generados como datos intermedios para entrenar modelos mas pequenos en descomposicion de tareas.
- Evaluacion de enmascaramiento de perdida: validar si el enmascaramiento de pasos fallidos (27.773 filas revisadas) mejora la robustez del modelo en tareas con pasos invalidos.
- Reproducibilidad de recetas SFT: servir como referencia para replicar la receta `sft_recipe_v3orth` en otros modelos base de 8B.
- Pruebas de integracion de tokens especiales: verificar el comportamiento de embeddings untied y filas de `lm_head` reinicializadas ortogonalmente en pipelines de inferencia personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4-5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: H200 (usadas en entrenamiento), A100 80 GB, H100 80 GB para mayor contexto y throughput; RTX 4090 (24 GB) viable en bf16 con contexto limitado o en cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en bf16 con contexto moderado, y en GPUs de 12-16 GB mediante cuantizacion (no se publican GGUF en el repo).
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requeririan conversion a los formatos correspondientes (el repo solo contiene safetensors bf16); transformers con carga directa es la via inmediata.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Este checkpoint (paso 100) | 8,19 B | no disponible | Apache 2.0 | Checkpoint intermedio de investigacion |
| Kwai-Klear/Klear-Reasoner-8B-SFT | 8 B (aprox.) | no disponible | no disponible en la informacion | Modelo base del ajuste |
| Qwen3 8B (familia referenciada por el tag) | 8 B (aprox.) | no disponible | no disponible en la informacion | Modelo de referencia de la arquitectura |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es el paso 100 de 1500: el modelo no ha completado el entrenamiento previsto, por lo que su calidad y adherencia al formato pueden ser suboptimas.
- Los pesos estan fusionados desde shards FSDP a bf16; no se ofrecen versiones cuantizadas (GGUF, AWQ, GPTQ) en el repositorio.
- El tokenizador incorpora dos tokens nuevos (`<|plan|>`, `<|/plan|>`) con embeddings untied; es necesario usar la configuracion y el tokenizador del repo para que la inferencia sea correcta.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es esperable en modelos de razonamiento de este tamano.
- Sesgos conocidos: no documentados en la model card.
- Idiomas: no especificados; el modelo base podria tener cobertura multilingue, pero no esta confirmado para este checkpoint.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Klear-Reasoner-8B-SFT y de Qwen3 si se redistribuye.
- El dataset de entrenamiento es privado (`mseo3/klear8b-planfmt-revmask-sft`), lo que limita la auditoria de los datos.
- No apto para produccion sin evaluacion previa: es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s100
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado, referencia): mseo3/klear8b-planfmt-revmask-sft (revision 5ef1de66)
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
