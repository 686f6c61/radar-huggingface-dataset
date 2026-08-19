# AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_ppl_b8000_s0

## Resumen

El modelo `AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_ppl_b8000_s0` es un ajuste fino (fine-tune) de `marin-community/marin-8b-base`, un modelo de lenguaje de 8 mil millones de parámetros basado en la arquitectura Llama. Ha sido entrenado por el usuario AmberYifan sobre un dataset especializado en finanzas, denominado `capsd_marin-8b-base-n11082-finance-convfinqa-fullscore__mix_finance_ppl_b8000_s0`, que parece combinar tareas de razonamiento conversacional financiero (posiblemente derivado de ConvFinQA) con un objetivo de perplejidad sobre texto financiero.

La relevancia de este modelo radica en su especialización vertical: está orientado a dominios financieros, donde la precisión terminológica y el razonamiento numérico son críticos. Sin embargo, la documentación publicada es extremadamente escasa: la model card es autogenerada por el Trainer y no incluye descripción de capacidades, limitaciones ni resultados de evaluación. No se han publicado benchmarks, por lo que su rendimiento real no puede verificarse a partir de la información disponible.

El modelo se distribuye en formato `safetensors` (16.1 GB en el repositorio) y está pensado para uso con la librería `transformers`. La licencia se indica como `other`, sin especificar términos concretos, lo que añade incertidumbre para su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Llama (según tags), transformer decoder-only, sin más detalles |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | other (sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. Los tags indican que se basa en `marin-community/marin-8b-base`, un modelo de 8B parámetros que a su vez parece derivar de una arquitectura tipo Llama. No se especifica si es un transformer estándar, si emplea atención lineal u otras innovaciones. Tampoco se detalla el número de capas, cabezas de atención ni el tamaño del vocabulario.

El entrenamiento se realizó mediante ajuste fino completo (full fine-tuning) con la librería `llama-factory`. Los hiperparámetros reportados son:

- learning rate: 1e-5
- batch size de entrenamiento: 2 (con acumulación de gradientes de 8, total efectivo 64)
- batch size de evaluación: 8 (total 32)
- seed: 0
- 4 GPUs en paralelo
- optimizador: AdamW (betas 0.9, 0.999, epsilon 1e-8)
- scheduler: cosine con warmup del 3% de los pasos
- 1 época

El dataset de entrenamiento incluye el nombre `convfinqa`, que sugiere tareas de razonamiento sobre conversaciones financieras (preguntas y respuestas sobre documentos financieros), y `fullscore`, que podría indicar un objetivo de evaluación completa o una métrica. No se proporcionan detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas en la model card. A partir del nombre y del contexto de entrenamiento, se puede inferir razonablemente que:

- Generación de texto en dominios financieros, probablemente con soporte para preguntas y respuestas sobre documentos numéricos.
- Posible razonamiento conversacional multi-turno, dado el tag `conversational`.
- No se menciona soporte explícito para tool calling, agentes, visión o audio.
- No se indica si el modelo tiene un modo de razonamiento especial (thinking mode).

Dado que no hay benchmarks ni ejemplos de uso, estas capacidades son hipotéticas y deben verificarse experimentalmente.

## Casos de uso

Debido a la falta de documentación y validación, los siguientes casos de uso son propuestas basadas en la especialización financiera del modelo, pero no están confirmados por el autor:

- Análisis de documentos financieros: el modelo podría extraer y resumir información de informes anuales, balances o estados de resultados, gracias a su entrenamiento en datos financieros.
- Asistente conversacional para banca: integrado en chatbots de atención al cliente para responder preguntas sobre productos financieros, tasas o condiciones, con capacidad de mantener contexto multi-turno.
- Razonamiento numérico en finanzas: dado el nombre `convfinqa`, podría resolver problemas que requieren combinar información de tablas y texto, como calcular ratios o interpretar variaciones.
- Generación de informes financieros: redacción automática de resúmenes ejecutivos a partir de datos estructurados.
- Clasificación de sentimiento financiero: aunque no se menciona, un modelo entrenado en texto financiero podría adaptarse para análisis de noticias o redes sociales.
- Extracción de entidades financieras: reconocimiento de nombres de empresas, tickers, montos o fechas en textos.

Sin embargo, ninguno de estos usos está respaldado por evaluaciones publicadas. Se recomienda realizar pruebas propias antes de desplegar el modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card aparece vacío (`results: []`), lo que indica que el autor no ha reportado métricas como MMLU, HumanEval, GSM8K u otras. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

Los requisitos se estiman a partir del tamaño del modelo (8,03 B parámetros) y del formato safetensors. No hay datos oficiales de latencia o throughput.

- VRAM estimada para inferencia:
  - FP16 (precisión completa): ~16 GB (los pesos ocupan 8,03 GB × 2 bytes = 16,06 GB, más overhead de activaciones y caché KV).
  - Int8 (cuantización de 8 bits): ~8 GB.
  - Int4 (cuantización de 4 bits): ~4 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) puede ejecutar el modelo en FP16 o cuantizado; una A100 40 GB o H100 80 GB es adecuada para inferencia con contexto largo o batch grande. Para consumer GPU, una RTX 3090 (24 GB) o RTX 4080 (16 GB) pueden funcionar con cuantización.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede servir con vLLM, TGI (Text Generation Inference), o mediante llama.cpp si se convierte a GGUF. No se proporcionan archivos GGUF en el repo, pero se pueden generar.
- Latencia y throughput: no disponibles. Como referencia, modelos de 8B en una GPU moderna suelen generar entre 20 y 50 tokens por segundo en FP16, pero esto depende del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base `marin-community/marin-8b-base` no está documentado en los datos proporcionados, y no se conocen modelos comparables en la misma categoría (fine-tunes financieros de 8B). Se podría comparar estructuralmente con Llama 3 8B, Mistral 7B o Gemma 7B, pero no hay métricas que respalden dicha comparación. Por tanto, se indica: no disponible.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es autogenerada y no describe capacidades, limitaciones ni sesgos. Esto dificulta evaluar la idoneidad del modelo para tareas concretas.
- Licencia ambigua: la licencia `other` no especifica términos de uso, lo que impide garantizar su uso comercial o la redistribución. Se recomienda contactar al autor antes de utilizarlo en producción.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar información falsa o inventar datos financieros, lo que es especialmente peligroso en un dominio donde la exactitud es crítica.
- Sesgos no conocidos: no se han reportado evaluaciones de sesgo, y el entrenamiento en un dataset financiero específico podría introducir sesgos hacia ciertos tipos de documentos o regiones.
- Contexto limitado: no se conoce la longitud de contexto soportada; si es corta, no será adecuado para documentos extensos.
- Sin validación externa: al tener 0 descargas y 0 likes, el modelo no ha sido probado por la comunidad, por lo que su calidad es incierta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_ppl_b8000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base
