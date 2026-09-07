# alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_5M_s0_2026-09-06_22-01-49_258099-pt

## Resumen

El modelo `kdyck_dose_1Bpt_hfbody_adamwppt_5M_s0_2026-09-06_22-01-49_258099-pt` es un punto de control experimental desarrollado por Alex Kster (alexkstern) con la librería `nanochat`. Se trata de un transformer decoder-only que se ha preentrenado en 1.000 millones de tokens de FineWeb y, después, se ha ajustado con 5 millones de tokens de un dataset sintético de lenguajes Dyck (paréntesis balanceados con k=128). El experimento, bajo la etiqueta «token dose», estudia cómo el cambio de fase de entrenamiento afecta a la capacidad del modelo para capturar estructuras jerárquicas anidadas.

Arquitectónicamente, el checkpoint tiene 16 capas, 8 cabezas de atención, una dimensión de modelo de 1024 y una ventana de contexto de 2048 tokens. El repositorio ocupa 3.0 GB en HuggingFace y la licencia es Apache-2.0. No es un modelo de propósito general: carece de documentación sobre capacidades conversacionales y su formato de pesos (.pt) dificulta su uso directo en frameworks de inferencia estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT implementada en `nanochat`: un transformer decoder-only con atención por cabezas, MLP y LayerNorm. La configuración de la fase de preentrenamiento (`model_pt`) define una dimensión de embedding de 1024, 16 capas y 8 cabezas de atención, con un vocabulario de 65.536 tokens. En la fase de postentrenamiento (`model_ppt`) se mantienen la profundidad y la dimensión, pero el vocabulario se reduce a 256 tokens. La transición entre fases incluye la re-inicialización de los embeddings y el reinicio del optimizador, según la configuración.

Los datos de preentrenamiento provienen de FineWeb (20B tokens disponibles, consumidos 1B), y el postentrenamiento usa un dataset Dyck-k128 de 5M de tokens con longitud de secuencia 2048. El entrenamiento emplea un programador de LR trapezoidal, sin warm-up y con 40% de warmdown. El checkpoint publicado corresponde al paso 3.814. La pérdida suavizada de entrenamiento es 3.167 y el objetivo mínimo registrado es 0.944, con un total de 2.08e18 FLOPs utilizados.

## Capacidades

- Generación de secuencias con estructura de paréntesis balanceados (Dyck-k128) tras el fase de postentrenamiento; no se han publicado evaluaciones detalladas del comportamiento.
- Razonamiento jerárquico de dependencias anidadas es el objetivo experimental del dataset Dyck, pero no existe evidencia empírica publicada más allá del objetivo de entrenamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no verificadas; los datos de preentrenamiento (FineWeb) sugieren un sesgo hacia el inglés.
- Visión o audio: no disponible.

## Casos de uso

Dado que es un modelo experimental, los casos de uso son fundamentalmente de investigación y desarrollo:

- Investigación sobre curricula de datos: permite comparar el efecto de añadir un dataset sintético como Dyck después de un preentrenamiento extenso en texto natural.
- Estudio de capacidades jerárquicas: el modelo sirve como herramienta para medir la competencia en lenguajes Dyck, un benchmark clásico de dependencias de largo alcance.
- Análisis de representaciones internas: la re-inicialización de embeddings al cambiar de vocabulario permite investigar cómo se recomponen las representaciones en la transición de fase.
- Ensayos de transferencia de conocimiento: se puede utilizar como punto de partida para pruebas de fine-tuning en tareas de estructura sintáctica.
- Reproducción de pipelines de entrenamiento: junto con la librería `nanochat`, el checkpoint permite reproducir el proceso completo de entrenamiento y evaluación.
- Pruebas de sensibilidad de hiperparámetros: el experimento documenta LR, warmdown, reinicio del optimizador y cambio de vocabulario, por lo que es adecuado para explorar variaciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada en la model card es `smooth_train_loss` con valor 3.167 y `min_objective` con valor 0.944 en el paso 3.814, que no se consideran benchmarks estandarizados.

## Requisitos de hardware

- VRAM estimada: no se dispone de mediciones del autor. Partiendo de la arquitectura (16 capas, n_embd 1024), los pesos en FP16 ocupan aproximadamente 0,7 GB; con activaciones y caché de atención para 2048 tokens, una GPU con 2-4 GB de VRAM podría ser suficiente para inferencia.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 4060, RTX 4090) es suficiente para experimentos básicos; para evaluación con lotes grandes o entrenamiento, se recomienda una A100 o H100.
- Despliegue: no se han publicado artefactos para vLLM, llama.cpp, Ollama o TGI. El checkpoint se debe cargar con la librería `nanochat` y convertir a un formato estándar si se quiere usar en estos frameworks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Se han identificado puntos de control de la misma familia en el repositorio de HuggingFace, como `kdyck_dose_1Bpt_hfbody_200M_s0` y `kdyck_dose_1Bpt_hfbody_1B_s0`, pero no se dispone de datos públicos sobre sus especificaciones o resultados de benchmarks.

## Limitaciones y advertencias

- Modelo experimental que no ha sido alineado ni evaluado para uso general en producción.
- Riesgo de alucinación alto; no se han realizado evaluaciones de seguridad ni de fiabilidad.
- Idiomas no documentados; el preentrenamiento en FineWeb (principalmente inglés) hace previsible un rendimiento bajo fuera de ese idioma.
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas largas o dependencias de muy largo alcance.
- Formato de pesos en `.pt` incompatible con muchos frameworks de inferencia estándar.
- Licencia Apache-2.0 permite uso comercial, pero no hay garantías de soporte ni mantenimiento.

## Enlaces

- [HuggingFace](https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_5M_s0_2026-09-06_22-01-49_258099-pt)
- [W&B run](https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/9f0l8mer)
- [nanochat](https://github.com/karpathy/nanochat)
- [Modelo relacionado 200M](https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_200M_s0_2026-08-14_09-26-44_877448-pt)
- [Modelo relacionado 1B](https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_1B_s0_2026-08-14_11-12-47_102739-pt)
