# alexkstern/nca_dose_1Bpt_hfinit_adamwppt_500M_s0_2026-09-06_14-34-05_787301-pt

## Resumen

Este modelo es un checkpoint experimental de investigación desarrollado por alexkstern dentro del proyecto nanochat, de Karpathy. Se trata de un modelo de lenguaje tipo GPT, de aproximadamente 500 millones de parámetros, entrenado en dos fases: una fase de preentrenamiento (PT) sobre 1.000 millones de tokens de FineWeb y una fase posterior de post-entrenamiento (PPT) sobre 500 millones de tokens de un dataset denominado `nca-paper-share200-2048`. El checkpoint corresponde al paso 3.814 y se publica con licencia Apache 2.0.

Su interés radica en que permite estudiar el efecto de la "dosis de tokens" y de la transferencia de vocabulario durante el entrenamiento. En la transición entre fases se reinicializan los embeddings y se cambia el vocabulario de 65.536 a 10.004 tokens, lo que lo convierte en un modelo útil para experimentos sobre inicialización, régimen de aprendizaje y optimización con AdamW. No está pensado como un producto final, sino como una pieza para investigación y docencia en el entrenamiento de modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat_gpt) |
| Parametros totales | Aproximadamente 500 millones (según el nombre del run, no confirmado en la model card) |
| Parametros activos | No aplicable (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Transformer decoder-only estándar, implementada en el proyecto nanochat. Tiene 16 capas, 8 cabezas de atención y 8 cabezas de clave/valor, lo que corresponde a una atención multi-cabeza (MHA) convencional. La dimensión de embedding es de 1.024 y la ventana de contexto es de 2.048 tokens. El vocabulario del modelo de preentrenamiento es de 65.536 tokens, mientras que en la fase de post-entrenamiento se emplea un vocabulario de 10.004 tokens.

El entrenamiento consta de dos fases: una fase de preentrenamiento de 1.000 millones de tokens sobre el dataset FineWeb (subconjunto `fineweb-nanochatbpe-20B`), y una fase de post-entrenamiento de 500 millones de tokens sobre `nca-paper-share200-2048`. En la transición se reinicializan los embeddings (`reinit_embed_at_transition`) y se resetea el optimizador. Se usó una tasa de aprendizaje trapezoidal con calentamiento 0 y descenso del 40 % hasta 0. Para los parámetros de la matriz se empleó lr = 0,02, para embeddings lr = 0,3 y para unembeddings lr = 0,004; en la fase PPT la lr fue 3×10⁻⁵. No se usó weight decay y el grad clipping fue 1,0. El entrenamiento consumió aproximadamente 2,08×10¹⁸ FLOPs, con un tiempo total de 1.034,69 segundos.

## Capacidades

- Generación de texto autoregresiva básica, entrenada para predecir el siguiente token.
- No se documenta soporte para tool calling, function calling, agentes ni razonamiento a múltiples pasos.
- No dispone de capacidades multimodales (visión, audio) ni de un modo de "thinking" explícito.
- Se entrenó sobre FineWeb, con un tokenizador BPE propio de nanochat; el corpus es predominantemente inglés, aunque no se especifican los idiomas formales.
- Es un modelo base sin alineación mediante RLHF ni DPO; no se mencionan estos procesos en la información disponible.

## Casos de uso

- Investigación en transferencia de vocabulario: permite estudiar cómo afecta la reinicialización de embeddings y el cambio de vocabulario al aprendizaje, comparando el comportamiento antes y después de la fase PPT.
- Comparación de regímenes de entrenamiento: sirve como punto de referencia para experimentos sobre la relación entre la cantidad de tokens ("token dose") y la pérdida, dentro del framework de W&B del autor.
- Ablación de hiperparámetros: al ser un modelo pequeño, se puede utilizar para probar tasas de aprendizaje, schedule trapezoidal y optimizadores antes de escalar a modelos mayores.
- Evaluación de la perplejidad en datasets de referencia: la configuración incluye `extra_eval` con `c4-nanochatbpe-10B`, lo que permite medir la pérdida en datos no vistos.
- Docencia en entrenamiento de LLMs: el checkpoint puede emplearse en cursos o talleres para ilustrar el proceso de entrenamiento y el impacto de la cantidad de tokens en el rendimiento, usando el repositorio nanochat.
- Base para fine-tuning experimental: su tamaño (500M) y su licencia Apache 2.0 permiten que investigadores con una GPU de consumo lo ajusten para tareas específicas, siempre que se asuma que es un modelo de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Paso | 3.814 |
| Pérdida de entrenamiento suave | 3,1741790771484375 |
| Objetivo mínimo | 0,9456376386340107 |
| FLOPs utilizados | 2,08×10¹⁸ |
| FLOPs por token | 2.080.374.784 |
| Tiempo total de entrenamiento | 1.034,69 s |

## Requisitos de hardware

- Estimación orientativa de VRAM: el checkpoint .pt ocupa unos 3,0 GB en disco, lo que sugiere pesos en FP32. Para inferencia en FP32, se estiman 3-4 GB de VRAM; en FP16 o cuantización INT8, 1-2 GB.
- GPU recomendada: no indicada. El entrenamiento se ejecutó en hardware con un pico de 2.250 TFLOPS, probablemente una GPU de la serie H100, pero no se especifica el modelo exacto.
- Sí cabe en GPU de consumo: cualquier GPU con 6 GB o más de VRAM podría ejecutar la inferencia en FP32/FP16.
- Opciones de despliegue: no hay integración documentada con vLLM, Ollama, TGI ni llama.cpp. El checkpoint debe cargarse mediante el proyecto nanochat de Karpathy.
- Latencia y throughput: no disponible en la información.

## Comparativa con modelos similares

No disponible. En la información proporcionada no aparecen datos suficientes para comparar este checkpoint con otros modelos de la misma categoría. Existen otros checkpoints del mismo autor en HuggingFace, pero no se dispone de sus especificaciones ni de sus resultados.

## Limitaciones y advertencias

- Es un checkpoint de investigación, intermedio en un pipeline experimental; no se han validado sus capacidades generales ni su seguridad.
- Se entrenó únicamente con datos web (FineWeb), por lo que hereda sesgos y contenido potencialmente no deseado del corpus.
- No se realizó RLHF ni DPO; el modelo no está alineado con preferencias humanas y puede generar contenido inapropiado.
- La fase de post-entrenamiento con un vocabulario reducido y la reinicialización de embeddings pueden provocar inestabilidades o un rendimiento subóptimo.
- La licencia Apache 2.0 permite uso comercial, pero no ofrece garantías de rendimiento ni seguridad para producción.
- No se proporcionan instrucciones de uso ni una capa de chat; es un modelo base sin expectativa de funcionar correctamente en tareas de conversación.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_adamwppt_500M_s0_2026-09-06_14-34-05_787301-pt
- Registro W&B: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/3314yr8w
- Repositorio nanochat: https://github.com/karpathy/nanochat
