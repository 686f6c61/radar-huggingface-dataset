# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_5M_s1_2026-09-06_22-52-48_248485-pt

## Resumen

El modelo `kdyck_dose_50Mpt_hfinit_adamwppt_5M_s1_2026-09-06_22-52-48_248485-pt` es un checkpoint de investigación desarrollado por `alexkstern` con la librería `nanochat` de Karpathy. Se trata de un transformer decoder de pequeño tamaño, con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El proyecto estudia la llamada "dosis de tokens": el efecto de entrenar primero con 50 millones de tokens de texto general (FineWeb) y después con 5 millones de tokens de un lenguaje formal de paréntesis balanceados, concretamente Dyck-128.

El modelo está licenciado bajo Apache 2.0 y se distribuye en formato PyTorch `.pt`. No es un modelo de propósito general: es un experimento para analizar cómo los transformers aprenden gramáticas libres de contexto y cómo afecta la reutilización de vocabularios al cambiar de fase de entrenamiento. No se han publicado evaluaciones de rendimiento, benchmarks ni pruebas de seguridad, por lo que su uso en producción no está recomendado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-like) con 16 capas, 8 cabezas, 8 cabezas KV y 1024 de embedding |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos en formato `.pt` sin cuantizar) |
| Idiomas soportados | No disponible (el corpus principal es FineWeb, en inglés, pero no se ha verificado el soporte multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder clásico, configurado en dos fases distintas dentro del mismo experimento. La fase de pretraining (`model_pt`) usa un vocabulario de 65536 tokens y se entrena sobre `fineweb-nanochatbpe-100M`, con 50 millones de tokens. La fase posterior (`model_ppt`) reduce el vocabulario a 256 tokens y se entrena sobre `dyck-k128-seq_len_2048-1B`, con 5 millones de tokens, que corresponde a un lenguaje Dyck con 128 tipos de paréntesis y secuencias de longitud 2048.

La transición entre fases está marcada por varias decisiones técnicas: se reinicializan las embeddings en la transición (`reinit_embed_at_transition: true`), se resetea el optimizador (`reset_optimizer_at_transition: true`) y se usa una tasa de aprendizaje trapezoidal, sin calentamiento y con un descenso del 40%. No se aplica weight decay. No hay indicios de RLHF, DPO ni otras técnicas de alineación. El entrenamiento registra una pérdida suave de 4.164 en el paso 762, con un tiempo total de 101 segundos y un coste de 1.039e+17 FLOPs.

## Capacidades

- Generación de texto: no se han publicado evaluaciones de calidad ni de coherencia.
- Tool calling / function calling: no disponible.
- Soporte para agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: el modelo ha sido entrenado en el lenguaje Dyck-128, lo que indica un interés en la capacidad de los transformers para aprender gramáticas libres de contexto, pero no se han documentado resultados que confirmen su eficacia.
- No se ha verificado ningún comportamiento de "thinking mode", visión o audio.

## Casos de uso

La información disponible no documenta casos de uso concretos ni aplicaciones prácticas validadas. Este checkpoint está diseñado para investigación y no se recomienda su uso en producción. Las siguientes líneas de investigación podrían explorarse con este modelo, siempre que se validen previamente sus capacidades:

- Investigación en gramáticas formales: estudiar cómo el modelo aprende lenguajes Dyck-128 y comparar su comportamiento con modelos de mayor escala.
- Análisis de la dosis de tokens: evaluar el impacto de la cantidad de tokens de pretraining frente a los de post-pretraining en el rendimiento final.
- Experimentación con vocabularios: analizar la reutilización de embeddings al cambiar de un vocabulario grande a uno pequeño durante el entrenamiento.
- Reproducción de experimentos: usar la configuración y las métricas incluidas para verificar pipelines de entrenamiento en `nanochat`.
- Prototipado de arquitecturas: servir como modelo pequeño para probar técnicas de entrenamiento en dos fases.
- Educación en IA: ejemplo didáctico de cómo se configura un entrenamiento con `nanochat`, incluyendo cambio de vocabulario y optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas documentadas son de entrenamiento, no de evaluación:

| Metrica | Valor |
|---|---|
| Paso | 762 |
| Pérdida suave de entrenamiento (`smooth_train_loss`) | 4.164 |
| Objetivo mínimo (`min_objective`) | 1.221 |
| FLOPs utilizados | 1.039e+17 |
| FLOPs por token | 2.080e+9 |
| Tiempo total de entrenamiento | 101.0 segundos |

No se han proporcionado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no incluye requisitos de inferencia.
- GPU recomendadas: no disponible.
- El checkpoint se distribuye en formato `.pt` y requiere PyTorch para cargarse.
- El tamaño total del repositorio es de 2.9 GB, lo que da una idea del peso del checkpoint, pero no se especifica la VRAM necesaria.
- Opciones de despliegue: no disponibles. Al no haber cuantización ni conversión a GGUF, no se puede usar directamente con `llama.cpp`, `Ollama` o `vLLM` sin una conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado comparaciones con otros modelos en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación sin validación de rendimiento, seguridad ni robustez.
- No se han evaluado sesgos ni riesgo de alucinación.
- Longitud de contexto limitada a 2048 tokens, lo que restringe el uso en tareas que requieran ventanas largas.
- El vocabulario de la fase de post-pretraining es de solo 256 tokens, lo que limita su aplicabilidad a tareas específicas, como el lenguaje Dyck.
- No hay soporte documentado para tool calling, agentes ni razonamiento multi-paso.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluaciones impide recomendarlo para entornos productivos.
- Los pesos están en formato `.pt`, lo que dificulta su integración con herramientas de despliegue estándar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_5M_s1_2026-09-06_22-52-48_248485-pt
- Ejecución de Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/fvlg1ugv
- Repositorio de `nanochat`: https://github.com/karpathy/nanochat
