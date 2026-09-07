# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_200M_s2_2026-09-06_23-34-55_755227-pt

## Resumen

Este modelo es un checkpoint experimental entrenado con el framework `nanochat` (de Karpathy) por el usuario `alexkstern`. Se trata de un modelo de lenguaje pequeño basado en una arquitectura Transformer decoder-only, con 16 capas, 8 cabezas de atención, dimensión de embedding de 1024 y una ventana de contexto de 2048 tokens. El repositorio contiene el checkpoint del paso 762, junto con la configuración completa del entrenamiento y metadatos.

El experimento estudia el efecto de la "dosis de tokens" en el aprendizaje: el modelo se entrena primero en una fase de preentrenamiento (PT) con 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`, y posteriormente en una fase de post-preentrenamiento (PPT) con 200 millones de tokens del dataset sintético `dyck-k128-seq_len_2048-1B`, que consiste en secuencias del lenguaje Dyck con 128 tipos de paréntesis. La relevancia de este modelo radica en su uso como herramienta de investigación para analizar cómo la combinación de datos naturales y sintéticos afecta al aprendizaje de estructuras formales, así como para estudiar dinámicas de entrenamiento con cambios de vocabulario entre fases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | Estimado ~326 millones (según config) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Transformer decoder-only estándar, implementada en `nanochat`. La configuración del modelo para la fase PT especifica `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024` y `vocab_size=65536`. Para la fase PPT, la configuración mantiene la misma estructura de capas y dimensiones, pero reduce el vocabulario a 256 tokens. El entrenamiento se divide en dos fases: una fase PT con 50 millones de tokens de `fineweb-nanochatbpe-100M`, y una fase PPT con 200 millones de tokens de `dyck-k128-seq_len_2048-1B`. En la transición entre fases se reinicializan los embeddings y el optimizador (`reinit_embed_at_transition=true`, `reset_optimizer_at_transition=true`), lo que constituye una innovación técnica destacable al cambiar el vocabulario y el objetivo de aprendizaje.

El optimizador es AdamW, con tasas de aprendizaje diferenciadas para matrices, embeddings y unembeddings. Se utiliza un scheduler de tipo `trapezoid` con calentamiento y enfriamiento. El entrenamiento se ejecutó con `compile_model=true` y se registró en Weights & Biases. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores.

## Capacidades

- Generación de texto: el modelo es un modelo de lenguaje básico entrenado en FineWeb, por lo que puede generar texto, pero no se han publicado evaluaciones de calidad ni de coherencia.
- Razonamiento sobre lenguajes formales: al haber sido entrenado en el lenguaje Dyck con k=128, el modelo puede procesar secuencias de paréntesis balanceados y estructuras jerárquicas.
- Contexto de 2048 tokens: soporta secuencias de hasta 2048 tokens.
- No se han documentado capacidades de tool calling, function calling, agentes, visión, audio ni multi-step reasoning en la información disponible.
- Capacidades multilingües: no disponibles; el corpus de entrenamiento es principalmente inglés (FineWeb), pero no se especifica el rendimiento en otros idiomas.

## Casos de uso

- Investigación en curriculum learning: el modelo está diseñado para estudiar el efecto de la dosis de tokens en fases de preentrenamiento y post-preentrenamiento. Se puede utilizar para comparar el rendimiento con diferentes proporciones de datos naturales (FineWeb) y sintéticos (Dyck).
- Estudio de lenguajes formales: dado que fue entrenado en Dyck-k128, es adecuado para analizar cómo los transformers aprenden a equilibrar paréntesis y representar estructuras jerárquicas.
- Análisis de representaciones internas: se pueden extraer los pesos y activaciones para investigar cómo el modelo codifica conceptos sintácticos en el espacio de embedding, especialmente tras el cambio de vocabulario.
- Reproducción de experimentos de nanochat: el repositorio incluye la configuración completa, los metadatos y el estado del RNG, lo que permite reproducir el entrenamiento con el mismo código y semilla.
- Prototipado de modelos con recursos limitados: al ser un modelo pequeño, sirve como base para probar hipótesis de eficiencia en GPUs de consumo o en entornos con restricciones de memoria.
- Evaluación de transferencia de dominio: se puede usar para medir la generalización entre datos naturales y sintéticos, comparando el rendimiento en FineWeb y en Dyck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada en el README es la pérdida de entrenamiento en el checkpoint 762: `smooth_train_loss` 4.188, `min_objective` 1.227. No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con ~326 millones de parámetros, el modelo ocuparía aproximadamente 1.3 GB en FP32 y 0.65 GB en FP16. No se especifican cuantizaciones disponibles.
- GPU recomendadas: no se especifica en la documentación. Dado el tamaño estimado, cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3060) sería suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo, aunque no se proporciona una lista concreta.
- Opciones de despliegue: no disponible. El checkpoint está en formato `.pt`, por lo que se puede cargar directamente con PyTorch, pero no se han documentado integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se han identificado variantes de la misma serie en HuggingFace, pero no se dispone de información detallada sobre sus configuraciones. La siguiente tabla resume los datos disponibles:

| Modelo | Dosis PT | Dosis PPT | Semilla | Parámetros | Contexto |
|---|---|---|---|---|---|
| kdyck_dose_50Mpt_hfinit_adamwppt_200M_s2 (este) | 50M | 200M | 2 | ~326M (estimado) | 2048 |
| kdyck_dose_50Mpt_200M_s1_2026-08-14_23-16-34_777872-pt | 50M | 200M | 1 | No disponible | No disponible |
| kdyck_dose_50Mpt_500M_s2_2026-08-14_23-39-24_419349-pt | 50M | 500M | 2 | No disponible | No disponible |

No se dispone de información detallada de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint de un experimento de investigación, no validado para su uso en producción.
- Sesgos: no se han realizado evaluaciones de sesgos. Al estar entrenado en FineWeb, puede heredar sesgos presentes en el corpus.
- Riesgo de alucinación: al ser un modelo pequeño, es probable que genere texto incoherente o alucine, especialmente fuera de los dominios de entrenamiento.
- Limitaciones de contexto: la ventana de contexto es de 2048 tokens, lo que limita el manejo de documentos largos.
- Limitaciones de idioma: no se especifica el soporte de idiomas; el rendimiento en idiomas distintos del inglés es desconocido.
- Cambio de vocabulario entre fases: la configuración define dos vocabularios (65536 en PT y 256 en PPT). El checkpoint disponible puede corresponder a una de las fases, lo que complica su uso directo sin conocer la fase exacta.
- Licencia: Apache 2.0 permite uso comercial, pero no hay garantías de seguridad, robustez ni idoneidad para aplicaciones reales.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_200M_s2_2026-09-06_23-34-55_755227-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/iq6w1q08
- Repositorio nanochat: https://github.com/karpathy/nanochat
