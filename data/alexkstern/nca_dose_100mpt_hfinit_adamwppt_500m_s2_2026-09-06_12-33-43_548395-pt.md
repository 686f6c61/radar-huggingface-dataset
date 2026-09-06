# alexkstern/nca_dose_100Mpt_hfinit_adamwppt_500M_s2_2026-09-06_12-33-43_548395-pt

## Resumen

Este modelo es un checkpoint experimental de investigación creado por alexkstern, entrenado con el framework nanochat de Karpathy. Forma parte de un estudio sobre la "dosis de tokens" (token dose) en el entrenamiento de modelos de lenguaje, donde se investiga cómo la cantidad y el orden de los tokens de preentrenamiento y post-entrenamiento afectan al aprendizaje. El modelo se compone de dos fases: una primera fase de preentrenamiento (pt) con 100 millones de tokens del dataset FineWeb, y una segunda fase de post-entrenamiento (ppt) con 500 millones de tokens de un dataset denominado nca-paper-share20-2048.

La arquitectura es un transformer decoder-only GPT con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El vocabulario cambia entre fases: de 65536 tokens en la fase de preentrenamiento a 10004 tokens en la fase de post-entrenamiento. No se han publicado benchmarks ni evaluaciones de capacidades, por lo que este modelo debe considerarse principalmente como una herramienta para investigar dinámicas de entrenamiento y no como un modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT (nanochat GPT) con 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding 1024 |
| Parametros totales | no disponible (la config no especifica el número de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint en formato .pt sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only implementado con nanochat. Tiene 16 capas, 8 cabezas de atención con 8 cabezas KV (sin atención agrupada), dimensión de embedding 1024 y un vocabulario de 65536 tokens en la fase de preentrenamiento, que se reduce a 10004 tokens en la fase de post-entrenamiento. El entrenamiento se divide en dos fases: una primera fase (pt) con 100 millones de tokens del dataset FineWeb (fineweb-nanochatbpe-100M) y una segunda fase (ppt) con 500 millones de tokens del dataset nca-paper-share20-2048. En la transición entre fases se re-inicializan los embeddings y se resetea el optimizador. Se utilizan tasas de aprendizaje diferenciadas para las matrices de atención/MLP (0.02), los embeddings (0.3) y el unembedding (0.004), con un schedule trapezoidal. No se ha aplicado RLHF ni DPO. El entrenamiento se registró en Weights & Biases, con un total de 2.08e17 FLOPs y un tiempo de 475 segundos.

## Capacidades

No se han documentado capacidades específicas más allá de la generación de lenguaje. Según la información disponible:

- Generación de texto: el modelo puede generar texto en el idioma del corpus de entrenamiento, aunque no se han publicado evaluaciones de calidad.
- Razonamiento, código, matemáticas: no se han publicado evaluaciones de estas capacidades.
- Tool calling / function calling: no soportado o no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentado; el corpus principal es FineWeb, predominantemente inglés.
- Capacidades especiales (visión, audio, thinking mode): no documentado.

## Casos de uso

- Investigación en dinámica de entrenamiento: el checkpoint incluye métricas de pérdida suavizada y FLOPs acumulados, lo que permite analizar la relación entre cómputo y pérdida durante las dos fases de entrenamiento. Es adecuado porque el entrenamiento está registrado en W&B y se puede reproducir.
- Estudio del cambio de vocabulario: al reducir el vocabulario de 65536 a 10004 en la transición, el modelo sirve para investigar el impacto de la re-inicialización de embeddings en la convergencia. Es adecuado porque la configuración incluye flags como reinit_embed_at_transition.
- Análisis de tasas de aprendizaje por componente: la config define matrix_lr, embedding_lr y unembedding_lr diferenciados, lo que permite estudiar su efecto en la optimización. Es adecuado para experimentos de ablación.
- Reproducción de resultados con nanochat: al ser un checkpoint de nanochat, puede cargarse directamente en el framework para verificar la reproducibilidad de los experimentos en hardware similar.
- Estudio de eficiencia computacional: el modelo registra FLOPs por token y tiempo de entrenamiento, lo que permite comparar la eficiencia de diferentes configuraciones de hardware (peak_tflops 2250).
- Base para fine-tuning en tareas de lenguaje: aunque es un modelo pequeño, puede utilizarse como punto de partida para fine-tuning en tareas específicas con contexto de 2048 tokens, siempre que se acepte su limitada calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card solo reporta métricas de entrenamiento (pérdida suavizada, FLOPs, tiempo) sin evaluaciones de tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Basado en la arquitectura (16 capas, 1024 de embedding), el modelo tiene aproximadamente 335 millones de parámetros, lo que requeriría en torno a 1.3 GB en fp32 o 0.7 GB en fp16, más la memoria de activaciones para el contexto de 2048 tokens.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar inferencia sin problemas.
- Si cabe en consumer GPU: sí, es un modelo pequeño que cabe en GPUs de consumo.
- Opciones de despliegue: el checkpoint se distribuye en formato .pt de PyTorch, por lo que requiere carga manual con PyTorch. No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa significativa. Existen otros checkpoints de la misma familia en HuggingFace (nca_dose_100Mpt_500M_s2 y nca_dose_100Mpt_hfinit_5M_s2), pero no se han publicado especificaciones ni benchmarks. Por tanto, no es posible realizar una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han realizado evaluaciones de sesgos; el modelo se entrenó predominantemente con FineWeb, que puede contener sesgos del inglés de internet.
- Riesgo de alucinación: al ser un modelo pequeño con solo 600 millones de tokens de entrenamiento, la calidad de generación es limitada y el riesgo de alucinaciones es alto.
- Limitaciones de contexto o idioma: contexto de 2048 tokens, lo que limita tareas de documentos largos; no se ha documentado soporte multilingüe.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, pero no hay garantías de seguridad ni responsabilidad.
- Caveats para producción: el modelo es un checkpoint de investigación sin evaluaciones de seguridad; no se recomienda para uso en producción sin una validación exhaustiva.
- Formato de pesos: solo .pt, lo que dificulta la integración con herramientas de despliegue estándar.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfinit_adamwppt_500M_s2_2026-09-06_12-33-43_548395-pt
- Weights & Biases: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/xy9o3j48
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Otros checkpoints de la misma familia:
  - https://huggingface.co/alexkstern/nca_dose_100Mpt_500M_s2_2026-08-15_02-37-49_417941-pt
  - https://huggingface.co/alexkstern/nca_dose_100Mpt_hfinit_5M_s2_2026-08-14_21-34-59_996806-pt
