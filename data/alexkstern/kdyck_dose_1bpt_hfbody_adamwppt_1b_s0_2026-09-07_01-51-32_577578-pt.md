# alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_1B_s0_2026-09-07_01-51-32_577578-pt

## Resumen

Este modelo es un checkpoint experimental de un transformer decoder-only de pequeño tamaño, entrenado con la librería nanochat. Fue desarrollado por alexkstern como parte de una investigación sobre el efecto de la "dosis de tokens" (token dose) en el pre-entrenamiento y el post-entrenamiento. El modelo se entrena en dos fases: primero con 1.000 millones de tokens de FineWeb (pre-training) y después con 1.000 millones de tokens de un dataset sintético de Dyck (post-training). La arquitectura es un GPT con 16 capas, 8 cabezas de atención, dimensión de modelo 1024 y ventana de contexto de 2048 tokens. Se distribuye bajo licencia Apache 2.0 y está pensado para investigación, no para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GPT (decoder-only) basado en nanochat |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (solo pesos .pt sin cuantizar) |
| Idiomas soportados | No disponible; entrenado con FineWeb (predominantemente inglés) y datos sintéticos Dyck |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, implementado con la librería nanochat. La configuración incluye 16 capas, 8 cabezas de atención (con 8 cabezas KV, es decir, sin GQA), dimensión de modelo 1024, vocabulario de 65.536 tokens y longitud de secuencia de 2048. Se entrena en dos fases secuenciales: primero un pre-entrenamiento con 1.000 millones de tokens del dataset FineWeb (con tokenizador nanochatbpe), y después un post-entrenamiento con 1.000 millones de tokens de un dataset sintético de Dyck (dyck-k128-seq_len_2048-1B). En la transición entre fases se re-inicializan los embeddings y se resetea el optimizador. El entrenamiento utiliza AdamW con tasas de aprendizaje diferenciadas para matrices (0.02), embeddings (0.3) y unembeddings (0.004), y un programador de LR trapezoidal con warmdown del 40% en la primera fase y del 80% en la segunda. No se ha documentado el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto autoregresiva: al ser un transformer GPT, puede generar texto, pero no se han publicado evaluaciones de calidad.
- Razonamiento sobre estructuras jerárquicas: el post-entrenamiento con el dataset Dyck sugiere que el modelo puede haber desarrollado cierta capacidad para manejar paréntesis balanceados, aunque no hay benchmarks públicos que lo confirmen.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentado; el dataset de pre-entrenamiento es predominantemente inglés.
- Capacidades especiales (visión, audio, thinking mode): no documentado.

## Casos de uso

- Investigación en lenguajes formales: el modelo puede emplearse para estudiar cómo los transformers aprenden lenguajes libres de contexto como Dyck, gracias a su entrenamiento específico con ese dataset.
- Estudio de scaling laws y "token dose": el experimento permite analizar cómo el rendimiento varía al cambiar la proporción de tokens de pre-entrenamiento y post-entrenamiento.
- Evaluación de curriculum learning: la transición de FineWeb a Dyck con re-inicialización de embeddings es un caso de estudio para investigar el efecto de cambiar de dominio durante el entrenamiento.
- Benchmark de generalización: puede evaluarse en datasets como C4 (incluido como extra_eval) para medir la pérdida de generalización tras el post-entrenamiento.
- Investigación en interpretabilidad: el modelo puede usarse para analizar cómo las representaciones internas codifican la estructura de paréntesis balanceados.
- Comparación de estrategias de optimización: el checkpoint permite comparar el efecto de distintas tasas de aprendizaje y programas de LR (trapezoidal) en el entrenamiento de modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas documentadas son de entrenamiento: smooth_train_loss = 3.169, min_objective = 0.945, y un total de 2.08e18 FLOPs utilizados. No se dispone de resultados en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible; por su tamaño (16 capas, 1024 de dimensión) es probable que quepa en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: no disponible; el modelo se distribuye como checkpoint de PyTorch (.pt), por lo que requiere el código de nanochat para cargarse.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones publicadas para modelos comparables. El único modelo similar encontrado es otro checkpoint de la misma serie, alexkstern/kdyck_dose_1Bpt_hfbody_1B_s0_2026-08-14_11-12-47_102739-pt, pero sin datos de rendimiento ni configuración pública. Por tanto, no es posible realizar una comparativa con datos concretos.

## Limitaciones y advertencias

- Sesgos: no se han evaluado; el dataset FineWeb puede contener sesgos presentes en la web.
- Riesgo de alucinación: inherente a los modelos autoregresivos; no se ha mitigado con técnicas de alineación.
- Limitaciones de contexto: la ventana de contexto es de 2048 tokens, lo que limita el uso en tareas que requieran contexto largo.
- Limitaciones de idioma: el modelo se entrena principalmente con texto en inglés, por lo que su rendimiento en otros idiomas es probablemente deficiente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no está listo para producción.
- Advertencia adicional: el checkpoint se encuentra en el paso 3.814, pero la configuración indica num_iterations = 1000; esta discrepancia sugiere que el paso total incluye el post-entrenamiento, o que la configuración no refleja el número real de iteraciones.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_1B_s0_2026-09-07_01-51-32_577578-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/5bryagfl
- Nanochat: https://github.com/karpathy/nanochat
