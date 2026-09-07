# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_20M_s0_2026-09-06_20-09-45_380455-pt

## Resumen

El modelo `kdyck_dose_50Mpt_hfbody_adamwppt_20M_s0_2026-09-06_20-09-45_380455-pt` es un checkpoint experimental de investigación desarrollado por Alex Kstern utilizando el framework `nanochat` de Karpathy. No es un modelo de propósito general, sino una herramienta para estudiar cómo los transformers aprenden lenguajes formales, concretamente el lenguaje Dyck (paréntesis balanceados) con k=128 tipos de paréntesis. El experimento está diseñado para evaluar el efecto de la "dosis de tokens" (cantidad de tokens de pre-entrenamiento y post-entrenamiento) en el aprendizaje de estructuras sintácticas.

La arquitectura es un transformer GPT con 16 capas, 8 cabezas de atención, 8 cabezas KV (grouped query attention) y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El entrenamiento se realiza en dos fases: una fase de pre-entrenamiento sobre un subconjunto de FineWeb (50 millones de tokens) y una fase de post-entrenamiento sobre un dataset Dyck (20 millones de tokens). El checkpoint corresponde al paso 762 de un total de 1000 iteraciones. El modelo se publica bajo licencia Apache 2.0, pero no se documentan capacidades de generación de lenguaje natural ni benchmarks de tareas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT (nanochat_gpt) con GQA (8 KV heads) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |

## Arquitectura y entrenamiento

La configuración de entrenamiento define dos modelos con la misma estructura interna (16 capas, 8 cabezas, 8 KV heads, embedding 1024, contexto 2048) pero con tamaños de vocabulario distintos: `model_pt` con 65536 tokens y `model_ppt` con 256 tokens. Esto sugiere una transición de fase en la que se re-inicializa el embedding y se reinicia el optimizador, tal como indican los parámetros `reinit_embed_at_transition: true` y `reset_optimizer_at_transition: true`. El pre-entrenamiento se realiza sobre el dataset `fineweb-nanochatbpe-100M` (con 50 millones de tokens), y el post-entrenamiento sobre `dyck-k128-seq_len_2048-1B` (con 20 millones de tokens). Se utiliza una programación de aprendizaje trapezoidal (`lr_kind: trapezoid`) con un warmup del 0% y un warmdown del 40% para la fase `pt`, y un warmdown del 10% para la fase `ppt`. No se indica el uso de RLHF ni DPO.

El checkpoint reporta una pérdida de entrenamiento suavizada de 4.1889 y un `min_objective` de 1.227. El total de FLOPs utilizados es de 1.0389e17, con un coste de 2.08e9 FLOPs por token. El tiempo total de entrenamiento fue de 122.6 segundos. La configuración de hardware indica un pico de 2250 TFLOPS, lo que apunta a una GPU de datacenter de gama alta, aunque el modelo en sí es pequeño.

## Capacidades

- Generación de texto: no documentada; el modelo está orientado a evaluar el aprendizaje del lenguaje formal Dyck, no a tareas de lenguaje natural.
- Razonamiento: no disponible.
- Código: no disponible.
- Matemáticas: no disponible.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidad especial: evaluación de estructuras de paréntesis balanceados (Dyck) con k=128 y longitud de secuencia 2048.

## Casos de uso

- Investigación en aprendizaje de lenguajes formales: el modelo permite estudiar cómo un transformer pequeño adquiere reglas de balanceo de paréntesis (Dyck) y comparar la eficiencia de diferentes dosis de tokens de pre-entrenamiento.
- Evaluación de la hipótesis de "token dose": sirve para medir cómo la cantidad de tokens de pre-entrenamiento (50M) frente a la de post-entrenamiento (20M) influye en la convergencia y el rendimiento final, mediante el registro de pérdidas y FLOPs.
- Análisis de representaciones internas: al ser un modelo de tamaño contenido, es adecuado para experimentos de interpretabilidad sobre cómo se codifican las estructuras jerárquicas en las capas del transformer.
- Pruebas de curriculum learning: la transición con re-inicialización de embeddings permite experimentar con estrategias de cambio de vocabulario y de optimizador durante el entrenamiento.
- Comparación de arquitecturas: puede utilizarse como baseline para comparar GQA (grouped query attention) con otras variantes de atención en tareas sintácticas.
- Pruebas de concepto en entornos de bajo coste: dado su tamaño y su framework ligero (nanochat), es útil para validar hipótesis de investigación en hardware limitado antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta las siguientes métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Paso (step) | 762 |
| Pérdida de entrenamiento suavizada | 4.1889214515686035 |
| Objetivo mínimo (min_objective) | 1.227146445886446 |
| FLOPs utilizados | 1.0389065468529869e+17 |
| FLOPs por token | 2080374784.0 |
| Tiempo total de entrenamiento | 122.59804463386536 |

Estas métricas no constituyen benchmarks de capacidades generales (como MMLU, HumanEval o GSM8K) y no permiten comparar el modelo con otros de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la configuración de entrenamiento indica un pico de 2250 TFLOPS, lo que sugiere una GPU de datacenter (por ejemplo, H100), pero no se especifica para inferencia.
- ¿Cabe en GPU de consumo? No se puede determinar sin conocer el número exacto de parámetros; el checkpoint ocupa 2.9 GB en formato .pt.
- Opciones de despliegue: no documentadas; el checkpoint está en formato .pt de PyTorch y podría cargarse con el framework nanochat, pero no hay soporte oficial para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas publicadas. El autor tiene otros checkpoints con configuraciones similares (por ejemplo, `kdyck_dose_50Mpt_hfinit_20M_s0_2026-08-14_15-27-02_584781-pt` y `kdyck_dose_50Mpt_200M_s1_2026-08-14_23-16-34_777872-pt`), pero no se han publicado resultados de evaluación que permitan comparar rendimiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo experimental de investigación, no apto para producción ni para uso general.
- No se documentan capacidades de generación de lenguaje natural; el entrenamiento se centró en un dataset sintético Dyck.
- El pre-entrenamiento se realizó sobre un subconjunto de FineWeb de 100M tokens, del que solo se utilizaron 50M, lo que limita la generalización a texto real.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece valor práctico para aplicaciones comerciales.
- El repositorio tiene 0 descargas y 0 likes, lo que indica falta de validación externa por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_20M_s0_2026-09-06_20-09-45_380455-pt
- Registro de Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/qq0s7cuk
- Framework nanochat (GitHub): https://github.com/karpathy/nanochat
- Repositorio relacionado: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_20M_s0_2026-08-14_15-27-02_584781-pt
- Repositorio relacionado: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_200M_s1_2026-08-14_23-16-34_777872-pt
