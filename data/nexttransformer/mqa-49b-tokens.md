# NextTransformer/MQA-49B-Tokens

## Resumen

NextTransformer MQA es un checkpoint de investigación de 737.673.296 parámetros desarrollado por NextTransformer, un proyecto que compara arquitecturas de atención bajo un presupuesto de cómputo fijo. Este modelo concreto es la variante final de Multi-Query Attention (MQA) dentro de la comparativa de arquitecturas entrenada con 49.152B tokens: las doce cabezas de query comparten una única cabeza de key y una única cabeza de value en cada capa, manteniendo la atención causal completa.

El modelo se entrenó desde cero (no es un uptraining desde un checkpoint multi-head) sobre el dataset ClimbMix durante 46.875 actualizaciones, con una longitud de contexto de 2.048 tokens. Su relevancia es fundamentalmente metodológica: sirve para medir el coste y la calidad de MQA frente a otras variantes de atención (multi-head, grouped-query, etc.) en condiciones controladas, no como modelo de producción.

Arquitectura transformer causal tipo GPT con 27 capas, anchura calibrada para ajustarse al presupuesto compartido de la comparativa, RoPE, QK RMSNorm sin parámetros y un escalado ×1,2 sobre la key compartida. La licencia no está declarada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (GPT) con Multi-Query Attention (12 cabezas de query, 1 cabeza de key y 1 de value) |
| Parametros totales | 737.673.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible (entrenado sobre ClimbMix, sin desglose idiomático publicado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,9 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 27 capas con atención MQA: cada capa proyecta 12 cabezas de query de dimensión 128, pero una sola cabeza de key y una sola de value que todas las queries comparten. RoPE, la QK RMSNorm sin parámetros y el factor de escala ×1,2 se aplican una única vez sobre la key compartida; el kernel fusionado la difunde, de modo que las proyecciones compartidas reciben la suma de los gradientes de todas las cabezas de query. La anchura del FFN se fijó en 6.016 para encajar en el presupuesto compartido de la comparativa. Los value embeddings están desactivados en esta familia porque su anchura depende del número de cabezas de key/value.

El entrenamiento se realizó desde cero sobre ClimbMix durante 46.875 actualizaciones, con una semilla única (42), partiendo de la rama congelada "Others". No se aplicó uptraining desde un checkpoint multi-head. El run record del autor reporta entrenamiento completado y una auditoría de cómputo acumulada del trainer, pero la auditoría independiente de solo lectura sigue pendiente. El autor advierte explícitamente de que la comparación con el control denso no es limpia: el control multi-head equivalente sin value embeddings no se ha entrenado, así que la diferencia frente a Dense no puede atribuirse únicamente al reparto de key/value. Además, la aritmética de atención se contabiliza por cabeza de query y no se ha medido ningún ahorro real de KV-cache ni de decodificación.

## Capacidades

- Generación de texto autoregresiva: el modelo es un causal-LM preentrenado, sin ajuste fino posterior.
- Predicción de siguiente token sobre prompts cortos (la model card incluye un ejemplo que imprime el token más probable tras "The sky is").
- Atención causal completa en todas las capas, con ventana de contexto de 2.048 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe específica.
- No dispone de modo thinking, visión ni audio.
- No se documenta capacidad de código ni matemáticas más allá de lo que pueda emerger del preentrenamiento.

## Casos de uso

- Investigación comparativa de arquitecturas de atención: el modelo sirve como punto de medida de MQA frente a otras variantes bajo el mismo presupuesto de cómputo, usando las métricas publicadas (BPB de validación y CORE-22) como referencia reproducible.
- Reproducción de experimentos académicos: con la implementación fijada en el commit `b2ea466` y los pesos safetensors, se puede reconstruir el modelo en CPU y verificar la carga estricta de pesos, útil para auditar resultados de la comparativa.
- Estudio del gradiente en proyecciones compartidas: al sumar los gradientes de las 12 cabezas de query sobre la key/value compartida, el checkpoint permite analizar dinámicas de entrenamiento de MQA en modelos pequeños.
- Validación de kernels fusionados de atención: el modelo es un banco de pruebas para verificar que un kernel que difunde la key compartida reproduce los logits del shell nativo.
- Docencia sobre variantes de atención: sirve para ilustrar en clase la diferencia entre MHA, GQA y MQA con un checkpoint real y cargable en CPU.
- Pruebas de tooling de carga de safetensors y tokenizadores tiktoken: el ejemplo de la model card ejercita `snapshot_download`, `load_file` y la reconstrucción del tokenizador desde `tokenizer.tiktoken.json`.

## Benchmarks y rendimiento

| Evaluacion final | Resultado |
|---|---:|
| Validation BPB | 0,6743 |
| CORE-22 (×100) | 31,96 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,95 GB solo para pesos (737,7 M de parámetros × 4 bytes), más activaciones y KV-cache.
- VRAM estimada en fp16/bf16: aproximadamente 1,5 GB para pesos; en int8, unos 0,74 GB; en int4, unos 0,37 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4090, etc.) es sobrada para los pesos; también cabe en CPU, como demuestra el ejemplo oficial que fuerza `CUDA_VISIBLE_DEVICES=""`.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM en fp32, y en la mayoría en fp16.
- Opciones de despliegue: el autor solo documenta carga nativa con la librería `nexttransformer` (commit `b2ea466`) y `safetensors`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y el shell nativo no está portado al código actual.
- Latencia y throughput: no disponibles; el autor indica que no se ha medido ningún ahorro de KV-cache ni de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NextTransformer MQA (este) | 737,7 M | 2.048 | MQA (12 Q, 1 KV) | no disponible | Hugging Face, safetensors |
| NextTransformer MHA (control multi-head de la misma comparativa) | no disponible en la informacion | 2.048 (presupuesto compartido) | MHA | no disponible | Referenciado en el repo del proyecto, no confirmado en HF |
| NextTransformer GQA (variante de la misma comparativa) | no disponible en la informacion | 2.048 (presupuesto compartido) | GQA | no disponible | Referenciado en el repo del proyecto, no confirmado en HF |

No se dispone de datos de benchmarks de los controles MHA y GQA en la informacion proporcionada, por lo que no se puede completar una comparativa de rendimiento. El autor señala además que el control denso sin value embeddings no se ha entrenado, lo que impide atribuir la brecha frente a Dense únicamente al reparto de key/value.

## Limitaciones y advertencias

- Modelo de investigación: preentrenado sin ajuste fino, sin RLHF ni DPO; no está pensado para uso en producción.
- Contexto muy corto (2.048 tokens), insuficiente para la mayoría de aplicaciones reales con documentos largos o conversaciones multi-turno extensas.
- Sesgos conocidos: no documentados; al entrenarse sobre ClimbMix sin filtrado declarado, es probable que herede sesgos del corpus, pero no hay análisis publicado.
- Riesgo de alucinación: alto, como en cualquier LM preentrenado sin alineamiento; no se han publicado evaluaciones de fidelidad.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue.
- Idiomas soportados no declarados: no hay garantía de calidad fuera de los idiomas dominantes de ClimbMix.
- El shell nativo del checkpoint no está portado al código actual de NextTransformer; la carga requiere reconstruir la arquitectura a mano desde `model_config.json` y desactivar value embeddings, como muestra el ejemplo oficial.
- La auditoría independiente del run record sigue pendiente; los resultados de entrenamiento no están verificados por un tercero.
- Semilla única (42): no hay réplicas que permitan estimar varianza de los resultados.
- No se ha medido ahorro de KV-cache ni de decodificación, pese a ser la motivación teórica de MQA.
- El nombre del repositorio ("49B-Tokens") hace referencia a tokens de entrenamiento, no a parámetros; puede inducir a confusión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextTransformer/MQA-49B-Tokens
- Repositorio del proyecto NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
- Resultados de arquitectura MQA: https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/methods/mqa.json
- Run record del entrenamiento: https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/runs/mqa.json
