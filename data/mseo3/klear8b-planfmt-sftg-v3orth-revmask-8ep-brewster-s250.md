# mseo3/klear8b-planfmt-sftg-v3orth-revmask-8ep-brewster-s250

## Resumen

`klear8b-planfmt-sftg-v3orth-revmask-8ep-brewster-s250` es un checkpoint intermedio de ajuste supervisado (SFT) publicado por el usuario `mseo3` sobre el modelo base Kwai-Klear/Klear-Reasoner-8B-SFT, un modelo de razonamiento de 8.190.735.360 parametros construido sobre la familia Qwen3. El checkpoint corresponde al paso 250 de un entrenamiento con receta `sft_recipe_v3orth`, ejecutado sobre 4 GPU H200 con FlashAttention 2 y pesos fusionados desde shards FSDP a bf16.

La particularidad tecnica del modelo es la incorporacion de dos tokens especiales de planificacion, `<|plan|>` (id 151669) y `<|/plan|>` (id 151670), anadidos con embeddings no atados (*untied*) y con las filas correspondientes de `lm_head` reinicializadas de forma ortogonal a sus piezas de texto. Se trata de un artefacto de investigacion orientado a experimentar con formatos de planificacion explicita dentro del razonamiento del modelo, no de un modelo listo para produccion.

El repositorio ocupa 16,4 GB, emplea licencia Apache 2.0 y no registra descargas ni interacciones en el momento de la consulta. La model card es extremadamente escueta y no documenta composicion del dataset, hiperparametros completos ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags del repositorio) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde FSDP) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Kwai-Klear/Klear-Reasoner-8B-SFT, etiquetado como Qwen3 en los tags de Hugging Face, con 8.190.735.360 parametros. El autor no documenta en la model card el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa, por lo que estos datos deben consultarse en la ficha del modelo base.

El entrenamiento consiste en un SFT de formato de plan (denominado "plan-format G SFT") con la receta `sft_recipe_v3orth`, ejecucion `sft_g_ptokc_orth_lr2e5_planorth8ep_brewster`, sobre 4 GPU H200 con FlashAttention 2. Se anadieron los tokens `<|plan|>` y `<|/plan|>` con embeddings independientes (no atados a los del modelo) y las filas de `lm_head` correspondientes se reinicializaron de forma ortogonal a las representaciones de sus piezas de texto, una tecnica destinada a evitar que los nuevos tokens colisionen semanticamente con tokens preexistentes. El checkpoint publicado es el paso 250 y los pesos se fusionaron desde los shards FSDP a bf16. No se especifican tokens de entrenamiento, composicion del dataset, ni uso de RLHF o DPO en esta etapa.

## Capacidades

- Generacion de texto y razonamiento: al derivar de Klear-Reasoner-8B-SFT, se espera capacidad de razonamiento multi-paso, aunque no hay evaluaciones publicadas para este checkpoint.
- Formato de planificacion explicita: emision de bloques delimitados por `<|plan|>` y `<|/plan|>`, el rasgo diferencial del ajuste.
- Generacion de codigo y matematicas: capacidad heredada del base, no verificada en este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: potencial por el formato de plan, sin documentacion de uso.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre formatos de planificacion: el modelo sirve para estudiar si la delimitacion explicita de planes mediante tokens dedicados mejora la trazabilidad del razonamiento; se usaria comparando sus salidas con las del base sin tokens de plan.
- Experimentos de inicializacion ortogonal de embeddings: util para validar la tecnica de reinicializacion de filas de `lm_head` frente a inicializacion aleatoria estandar en tokens nuevos.
- Analisis de checkpoints intermedios: al ser el paso 250 de un entrenamiento, permite estudiar la evolucion de la capacidad de planificacion a lo largo del SFT.
- Generacion de trazas de razonamiento estructurado en entornos de evaluacion: extraer los bloques `<|plan|>...</|plan|>` para analizar la coherencia entre plan y respuesta final.
- Reproduccion de recetas de SFT: sirve como referencia para replicar el pipeline FSDP + FlashAttention 2 en 4x H200 descrito por el autor.
- Base para ajustes posteriores: punto de partida para fine-tunes que requieran el vocabulario extendido con tokens de plan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para inferencia con contexto moderado.
- Cuantizacion a 8 bits: en torno a 8-9 GB de pesos; a 4 bits, en torno a 4-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: el entrenamiento se realizo en 4x H200; para inferencia, A100 40/80 GB, H100 o RTX 4090 24 GB en bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB solo con cuantizacion.
- Despliegue: vLLM, TGI o llama.cpp son opciones plausibles para un transformer de 8B, pero la presencia de tokens especiales anadidos exige verificar que el tokenizer y la configuracion se carguen correctamente; no hay guia del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revmask-8ep-brewster-s250 | 8,19 B | no disponible | Apache 2.0 | Checkpoint SFT intermedio con tokens de plan |
| Kwai-Klear/Klear-Reasoner-8B-SFT | ~8 B | no disponible | no disponible en la informacion | Modelo base del que deriva |
| Qwen3-8B | ~8 B | no disponible en la informacion | no disponible en la informacion | Familia arquitectonica del base |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 250): no es un modelo final; su calidad puede ser inferior a la del base o a la de un entrenamiento completado.
- Ausencia total de evaluaciones: no hay benchmarks, por lo que no puede recomendarse para produccion sin validacion propia.
- Model card minima: faltan datos de dataset, hiperparametros, contexto e idiomas, lo que dificulta la reproducibilidad.
- Tokens especiales nuevos: los ids 151669 y 151670 deben configurarse correctamente en el tokenizer; un pipeline mal configurado puede generar texto corrupto o ignorar los delimitadores de plan.
- Riesgo de alucinacion: inherente a los modelos de razonamiento de este tamano, no mitigado ni documentado.
- Sesgos: no documentados por el autor; se heredan los del modelo base y su dataset de SFT.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base conviene verificar las condiciones de Kwai-Klear/Klear-Reasoner-8B-SFT.
- Sin soporte comunitario: cero descargas y cero likes implican ausencia de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revmask-8ep-brewster-s250
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
