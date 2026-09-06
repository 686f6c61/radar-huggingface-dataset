# alexkstern/nca_dose_1Bpt_hfbody_adamwppt_1B_s0_2026-09-06_10-25-11_267819-pt

## Resumen

Este modelo es un checkpoint experimental de investigación creado por alexkstern mediante el framework nanochat, de Andrej Karpathy. Se trata de un modelo de lenguaje de tipo GPT que ha sido entrenado en dos fases: una fase de preentrenamiento (pt) sobre el dataset FineWeb, y una fase posterior de postentrenamiento (ppt) sobre un dataset denominado `nca-paper-share200-2048`. El checkpoint se corresponde con el paso de entrenamiento número 3.814.

La arquitectura es un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 cabezas clave-valor y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El tamaño total de parámetros no se proporciona explícitamente, pero a partir de la configuración se puede estimar en aproximadamente 287 millones de parámetros, por lo que es un modelo pequeño orientado a experimentos de investigación y estudio de escalado.

La relevancia del modelo radica en que forma parte de una familia de checkpoints que explora la transferencia entre vocabularios distintos en el postentrenamiento, así como la reinicialización de embeddings en la transición entre fases. Su licencia Apache 2.0 permite su uso libre, y el autor ha publicado los metadatos completos de entrenamiento, lo que lo hace útil para reproducir y analizar experimentos de escalado de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con 16 capas, 8 cabezas de atención y 8 cabezas KV |
| Parametros totales | Aproximadamente 287 millones (estimación a partir de la configuración; el valor exacto no se proporciona) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico, similar a GPT-2. La configuración indica `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024`, `sequence_len=2048` y `vocab_size=65536` para la fase de preentrenamiento. En la fase de postentrenamiento se utiliza un vocabulario reducido de 10004 tokens. El modelo no incluye atención lineal ni mecanismos de decodificación especulativa; es una implementación estándar del framework nanochat.

El entrenamiento se realizó en dos etapas. La primera etapa de preentrenamiento utilizó el dataset `fineweb-nanochatbpe-20B` con 1.000.000.000 de tokens (1B). La segunda etapa de postentrenamiento utilizó el dataset `nca-paper-share200-2048` con otros 1.000.000.000 de tokens. Se empleó un optimizador AdamW con tasas de aprendizaje separadas para matrices, embeddings y unembeddings. En la transición entre fases se reinicializó el embedding y se reinició el optimizador. El entrenamiento consumió aproximadamente 2,08e18 FLOPs y se ejecutó durante 1318,67 segundos, con una pérdida suave final de 3,17. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto en inglés, dado que el dataset de preentrenamiento es FineWeb y el modelo está etiquetado con la región `us`.
- Razonamiento básico y modelado de lenguaje, al ser un transformer de tamaño pequeño entrenado con 2.000 millones de tokens en total.
- Sin soporte documentado para tool calling, function calling o uso en agentes autónomos.
- Sin capacidades multimodales: no hay evidencia de soporte para visión, audio o vídeo.
- Sin modo de "thinking" o razonamiento extendido explícito.
- El checkpoint puede reanudarse o utilizarse para análisis de entrenamiento, ya que se guarda el estado del modelo, los metadatos y la configuración.

## Casos de uso

- Investigación en escalado de modelos: este checkpoint, junto con las variantes de 20M y 200M del mismo autor, permite estudiar cómo varía la pérdida y el comportamiento al cambiar el número de parámetros manteniendo el mismo presupuesto de tokens.
- Experimentos de transferencia entre vocabularios: al usar dos vocabularios distintos (65536 y 10004 tokens) y reinicializar el embedding, el modelo es adecuado para analizar el impacto de esta técnica en la convergencia del postentrenamiento.
- Reproducción de pipelines de entrenamiento: los metadatos completos permiten replicar la configuración exacta con nanochat, lo que es útil para auditar o modificar el proceso de entrenamiento.
- Benchmark de eficiencia en hardware: al ser un modelo pequeño, puede ejecutarse en GPUs de consumo y sirve para validar infraestructuras de entrenamiento o inferencia antes de usar modelos mayores.
- Educación en arquitecturas transformer: su tamaño reducido y su licencia Apache 2.0 lo hacen accesible para fines docentes, donde se puede inspeccionar el estado del modelo y las configuraciones de entrenamiento.
- Prototipado de técnicas de postentrenamiento: el esquema de dos fases con reinicialización de embeddings y optimizador permite probar variaciones en la transferencia de conocimiento entre datasets sin necesidad de recursos masivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de evaluación como MMLU, HumanEval o GSM8K, por lo que no es posible comparar el rendimiento con otros modelos de la misma categoría.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. A partir del tamaño estimado de los pesos (aproximadamente 287 millones de parámetros), se pueden hacer las siguientes consideraciones:

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 1,15 GB. En FP16 o BF16, aproximadamente 0,58 GB. Añadiendo activaciones y overhead, una GPU con 4 GB de VRAM sería suficiente para inferencia básica.
- GPU recomendadas: una RTX 3060 de 12 GB o una RTX 4060 de 8 GB pueden ejecutar el modelo con holgura. En un entorno de investigación, una A100 o H100 permitiría entrenar o evaluar con lotes mayores.
- Cabe en GPUs de consumo: sí, es compatible con hardware de gama media e incluso con GPUs antiguas de 6 GB.
- Opciones de despliegue: al ser un checkpoint en formato PyTorch, puede cargarse directamente con PyTorch o integrarse en vLLM, Ollama o TGI si se convierte a formatos compatibles. Para CPU, se podría exportar a GGUF mediante herramientas como llama.cpp.
- Latencia y throughput: no se conocen datos medidos; al ser un modelo pequeño, la latencia en GPU será baja, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos de rendimiento publicados. El autor ha publicado otros checkpoints con el mismo esquema de entrenamiento, aunque de diferente tamaño:

| Modelo | Parámetros aproximados | Contexto | Licencia |
|---|---|---|---|
| `nca_dose_1Bpt_hfbody_200M_s0_2026-08-14_09-15-53_669017-pt` | 200M | 2048 | Apache 2.0 |
| `nca_dose_1Bpt_hfbody_20M_s0_2026-08-14_06-31-16_898098-pt` | 20M | 2048 | Apache 2.0 |
| `nca_dose_1Bpt_hfbody_adamwppt_1B_s0_2026-09-06_10-25-11_267819-pt` (este modelo) | ~287M (estimado) | 2048 | Apache 2.0 |

Estos modelos comparten la misma metodología de preentrenamiento y postentrenamiento, pero no se han publicado evaluaciones comparativas entre ellos.

## Limitaciones y advertencias

- Es un modelo de investigación experimental, no un producto listo para producción. No se ha validado en tareas reales.
- No se dispone de información sobre sesgos, por lo que no se puede garantizar que esté libre de sesgos de género, raza o cultura.
- El modelo puede sufrir alucinaciones, especialmente al ser pequeño y haber sido entrenado con un presupuesto de tokens limitado.
- El contexto es de solo 2048 tokens, lo que limita su uso en tareas que requieran ventanas largas.
- El vocabulario de postentrenamiento tiene solo 10004 tokens, lo que reduce la cobertura de palabras y puede afectar a la generación en idiomas distintos del inglés.
- No se han publicado benchmarks, por lo que su calidad relativa es desconocida.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte ni de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfbody_adamwppt_1B_s0_2026-09-06_10-25-11_267819-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/5ww8zbz3
- Checkpoint de 200M del mismo autor: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfbody_200M_s0_2026-08-14_09-15-53_669017-pt
- Checkpoint de 20M del mismo autor: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfbody_20M_s0_2026-08-14_06-31-16_898098-pt
