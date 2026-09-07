# alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_20M_s1_2026-09-06_22-58-14_339117-pt

## Resumen

Este modelo es un checkpoint experimental de un transformer GPT pequeño entrenado con la librería nanochat de Karpathy. El nombre "kdyck_dose_1Bpt_hfbody_adamwppt_20M_s1" indica que forma parte de un estudio sobre la dosis de tokens en el post-entrenamiento: el modelo se pre-entrena con 1.000 millones de tokens de FineWeb y después se post-entrena con 20 millones de tokens de un dataset de lenguaje Dyck (paréntesis balanceados con 128 tipos), usando un vocabulario reducido de 256 tokens. La arquitectura es un transformer con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024, con una longitud de contexto de 2048 tokens. El checkpoint corresponde al paso 3.814 del entrenamiento y se distribuye bajo licencia Apache 2.0. Es un modelo de investigación, no pensado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GPT (nanochat_gpt) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer GPT estándar implementado en nanochat. La configuración de pre-entrenamiento define un vocabulario de 65.536 tokens, 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding 1024 y longitud de secuencia 2048. El pre-entrenamiento se realizó sobre el dataset FineWeb con 1.000 millones de tokens. Tras esa fase, se reemplazan el embedding y el unembedding por un vocabulario reducido de 256 tokens, se reinicializan los embeddings y se resetea el optimizador, y se post-entrena con 20 millones de tokens del dataset Dyck (k=128, seq_len 2048). El entrenamiento usó el optimizador AdamW con tasas de aprendizaje diferenciadas para matrices, embeddings y unembedding, y un scheduler trapezoidal con 40% de calentamiento inverso. El checkpoint se guardó en el paso 3.814, con una pérdida de entrenamiento suavizada de 3.166 y un "min_objective" de 0.9446. No se detalla el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto básica en el dominio del pre-entrenamiento (FineWeb), aunque el post-entrenamiento con el vocabulario de 256 tokens limita su uso para lenguaje natural.
- Especialización en el lenguaje formal Dyck: el modelo es capaz de generar secuencias de paréntesis balanceados con 128 tipos de paréntesis.
- No soporta tool calling, function calling ni uso como agente con razonamiento multi-paso.
- No tiene capacidades de visión ni audio.
- Capacidades multilingües no especificadas; el pre-entrenamiento con FineWeb es predominantemente en inglés, pero no se confirma.

## Casos de uso

- Investigación en aprendizaje de lenguajes formales: el modelo sirve para estudiar cómo un transformer pequeño aprende la estructura de paréntesis balanceados de Dyck, un benchmark clásico en teoría de lenguajes.
- Análisis del efecto de la dosis de tokens en post-entrenamiento: permite comparar el rendimiento con otros checkpoints del mismo experimento (200M y 1B tokens) para entender cómo la cantidad de datos de post-entrenamiento afecta a la pérdida y a la capacidad de generalización.
- Reproducción de experimentos de dinámica de entrenamiento: al ser un checkpoint con configuración completa (config, metadata, RNG), es útil para reproducir o continuar el entrenamiento en nanochat.
- Evaluación de estrategias de re-inicialización de embeddings: el experimento reinicializa los embeddings en la transición de pre-entrenamiento a post-entrenamiento, por lo que sirve para investigar el impacto de esa técnica.
- Uso en entornos académicos para tesis o trabajos de investigación sobre interpretabilidad: el modelo es pequeño y permite analizar la activación de neuronas y cabezas de atención en tareas sintácticas.
- Testing de frameworks de entrenamiento: al ser un modelo pequeño con un pipeline conocido (nanochat), puede usarse como caso de prueba para validar herramientas de entrenamiento o evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 3,0 GB, pero no se puede estimar la VRAM necesaria sin conocer el número de parámetros ni la cuantización.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU y en cuáles: no disponible.
- Opciones de despliegue: no disponible. El formato .pt y la librería nanochat permiten cargar el modelo directamente con PyTorch, pero no se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los modelos comparables son los otros checkpoints del mismo experimento de "token dose", que comparten la misma fase de pre-entrenamiento y difieren en la cantidad de tokens de post-entrenamiento:

| Modelo | Tokens de post-entrenamiento | Contexto | Licencia |
|---|---|---|---|
| kdyck_dose_1Bpt_hfbody_adamwppt_20M_s1 (este) | 20 millones | 2048 | Apache 2.0 |
| kdyck_dose_1Bpt_hfbody_200M_s1 | 200 millones | 2048 | Apache 2.0 |
| kdyck_dose_1Bpt_hfbody_1B_s1 | 1.000 millones | 2048 | Apache 2.0 |

No se dispone de datos de parámetros ni de benchmarks para ninguno de ellos.

## Limitaciones y advertencias

- El post-entrenamiento reduce el vocabulario a 256 tokens, lo que hace que el modelo no sea útil para generar texto en lenguaje natural tras esa fase; está pensado solo para el dominio Dyck.
- No se han evaluado sesgos ni se ha realizado alineación; el pre-entrenamiento con FineWeb puede heredar sesgos del contenido web.
- Riesgo de alucinación: al ser un modelo pequeño y experimental, no es fiable para tareas de generación de texto abiertas.
- Longitud de contexto limitada a 2048 tokens.
- Idiomas soportados no especificados; no se garantiza soporte para español u otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está preparado para producción.
- El checkpoint es un artefacto de investigación; no se han publicado evaluaciones externas ni benchmarks.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_20M_s1_2026-09-06_22-58-14_339117-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/5adftpks
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Otros checkpoints del experimento:
  - https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_200M_s1_2026-08-14_09-42-58_894191-pt
  - https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_1B_s1_2026-08-14_11-36-36_230304-pt
