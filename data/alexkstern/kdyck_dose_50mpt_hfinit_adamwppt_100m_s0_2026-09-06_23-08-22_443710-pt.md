# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_100M_s0_2026-09-06_23-08-22_443710-pt

## Resumen

El modelo `alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_100M_s0_2026-09-06_23-08-22_443710-pt` es un checkpoint experimental de un transformer autoregresivo entrenado con la librería `nanochat`. Ha sido desarrollado por alexkstern como parte de un proyecto de investigación que estudia el efecto de la dosis de tokens en el rendimiento de modelos pequeños. El nombre del run indica que el modelo se preentrena con 50 millones de tokens de `fineweb-nanochatbpe-100M` y posteriormente se entrena con 100 millones de tokens de un dataset de Dyck-k con longitud de secuencia 2048 y vocabulario de 256 símbolos. La arquitectura es un transformer de 16 capas con 8 cabezas de atención y dimensión de embedding de 1024, lo que da un modelo de tamaño reducido, aunque el número exacto de parámetros no se especifica en la información disponible. La licencia es Apache-2.0 y el modelo se publica en formato PyTorch `.pt`.

El interés de este modelo radica en su naturaleza experimental: permite investigar cómo el entrenamiento posterior (post-pretraining, PPT) en tareas de lenguaje formal (Dyck-k) afecta a las representaciones aprendidas durante el preentrenamiento (PT). Este tipo de modelos se utilizan en trabajos de interpretabilidad y análisis de la capacidad de generalización de transformers pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (decoder-only) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict) |

La configuración del run especifica `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024`, `vocab_size=65536` en la fase PT y `vocab_size=256` en la fase PPT. El tamaño del repositorio es de 2.9 GB.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT de `nanochat`, un transformer decoder-only con atención multi-head. La configuración de la fase PT indica 16 capas, 8 cabezas de consulta y 8 cabezas de clave/valor, es decir, atención multi-head estándar, no GQA. La dimensión de embedding es 1024 y el vocabulario es de 65536. La fase PPT cambia el vocabulario a 256 tokens, lo que sugiere que el modelo se re-entrena sobre un lenguaje formal restringido. El proceso de entrenamiento consta de dos etapas: primero se preentrena con 50 millones de tokens de `fineweb-nanochatbpe-100M`, después se entrena con 100 millones de tokens de `dyck-k128-seq_len_2048-1B`. En la transición entre etapas se re-inicializan los embeddings y se resetea el optimizador, tal como indican `reinit_embed_at_transition: true` y `reset_optimizer_at_transition: true`.

El entrenamiento se realizó con una tasa de aprendizaje en forma de trapezoide, con 0% de warmup y 40% de warmdown para la fase PT, y 80% de warmdown para la fase PPT. El checkpoint se guardó en el paso 762 de 1000 iteraciones previstas, con una loss de entrenamiento suavizada de 4.177 y un `min_objective` de 1.221. El número de FLOPs utilizados fue de aproximadamente 1.04×10^17, lo que corresponde a unos 2.08×10^9 FLOPs por token. El tiempo total de entrenamiento fue de 190.55 segundos.

## Capacidades

- Generación de texto autoregresivo básico, limitado por el pequeño volumen de preentrenamiento (50M tokens).
- Modelado de estructuras de paréntesis anidados del lenguaje Dyck-k con 128 tipos de paréntesis y secuencias de longitud 2048.
- Capacidad de evaluar la interacción entre preentrenamiento en texto natural y post-entrenamiento en lenguaje formal.
- No soporta tool calling, function calling, agentes, visión ni audio.
- Capacidades multilingües: no disponibles; el dataset de preentrenamiento es FineWeb, predominantemente en inglés.
- No dispone de modo de razonamiento explícito (thinking mode) ni de mecanismos de verificación interna.

## Casos de uso

- Investigación en lenguajes formales: el modelo permite analizar cómo un transformer pequeño aprende a reconocer estructuras de paréntesis anidados (Dyck-k) y si el preentrenamiento en texto natural ayuda o interfiere con esta tarea.
- Ablaciones de preentrenamiento y post-entrenamiento: los investigadores pueden comparar este checkpoint con otros de la misma serie para estudiar el efecto de la cantidad de tokens de PPT sobre el rendimiento.
- Estudio de la re-inicialización de embeddings: al re-inicializar los embeddings en la transición, el modelo es útil para investigar cómo afecta esta decisión a la representación interna de los tokens.
- Análisis de la eficiencia computacional: con los datos de FLOPs por token y tiempo de entrenamiento, se puede calibrar el coste de entrenar modelos de este tamaño con nanochat.
- Reproducibilidad de experimentos: el checkpoint incluye el estado del generador de números aleatorios (`rng_000762.pt`) y la configuración completa, lo que facilita reproducir los resultados exactos.
- Pruebas de interpretabilidad: el modelo puede usarse como sujeto en experimentos de probing para localizar dónde se codifica la estructura de Dyck en las activaciones del transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la loss de entrenamiento suavizada (4.177) en el paso 762 y un `min_objective` de 1.221, pero no se trata de evaluaciones de capacidad generalista (MMLU, HumanEval, GSM8K) ni de comparaciones con otros modelos. No se dispone de datos de rendimiento en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: el checkpoint está en formato `.pt`, por lo que se puede cargar directamente con PyTorch. No se han publicado configuraciones para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. En el perfil del autor existen otros checkpoints de la misma serie de experimentos, pero no se dispone de métricas de rendimiento comparables ni de información suficiente para construir una tabla comparativa. El modelo no se puede comparar con modelos generalistas como GPT-2 o Llama debido a su naturaleza experimental y a la ausencia de evaluaciones publicadas.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está diseñado para uso en producción ni para aplicaciones de usuario final.
- El preentrenamiento es muy reducido (50M tokens), por lo que las capacidades de generación de texto libre son extremadamente limitadas.
- El post-entrenamiento se realiza sobre un dataset de Dyck-k, un lenguaje artificial de paréntesis, lo que reduce aún más su utilidad como modelo de lenguaje general.
- El vocabulario de la fase PPT es de solo 256 tokens, lo que impide generar texto natural con ese vocabulario.
- No se han publicado evaluaciones de sesgos, alucinaciones ni seguridad.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías de que el modelo funcione adecuadamente en entornos comerciales.
- El nombre "100M" en el identificador se refiere a los tokens de post-entrenamiento, no al número de parámetros; esto puede inducir a error.
- El contexto de 2048 tokens es corto para tareas de razonamiento complejo.
- No hay soporte de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_100M_s0_2026-09-06_23-08-22_443710-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro de Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/oz9se4jg
- Checkpoint relacionado (5M s0): https://huggingface.co/alexkstern/kdyck_dose_50Mpt_5M_s0_2026-08-14_22-47-17_388269-pt
- Checkpoint relacionado (5M s1): https://huggingface.co/alexkstern/kdyck_dose_50Mpt_5M_s1_2026-08-14_22-49-49_667492-pt
