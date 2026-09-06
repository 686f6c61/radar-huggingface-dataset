# alexkstern/nca_dose_100Mpt_hfbody_adamwppt_500M_s2_2026-09-06_10-36-39_484840-pt

## Resumen

Este modelo es un checkpoint de investigación desarrollado por alexkstern como parte de un estudio sobre la "dosis de tokens" (token dose) en el entrenamiento de modelos de lenguaje. Utiliza la librería nanochat de Karpathy y se basa en una arquitectura GPT (decoder-only) con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. El modelo se entrena en dos fases: una fase de preentrenamiento (PT) con 100 millones de tokens del dataset fineweb-nanochatbpe-100M, y una fase de post-entrenamiento (PPT) con 500 millones de tokens del dataset nca-paper-share20-2048. La longitud de contexto es de 2048 tokens. El checkpoint corresponde al paso 1.525 y se publica bajo licencia Apache 2.0. Es un modelo pequeño pensado para experimentos de escalado y no para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | no disponible |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 cabezas KV y dimensión de embedding de 1024. El vocabulario de la fase PT es de 65.536 tokens, mientras que el de la fase PPT es de 10.004 tokens, con un reajuste de embeddings en la transición. El entrenamiento se realiza con el optimizador AdamW, con tasas de aprendizaje separadas para las matrices, embeddings y unembedding. Se utiliza un programador de aprendizaje trapezoidal sin warmup y con un warmdown del 40% en la fase PT y del 80% en la fase PPT. El modelo fue entrenado con 100 millones de tokens en la fase PT y 500 millones en la fase PPT. No se aplicó RLHF ni DPO. La innovación principal es el estudio del efecto de la "dosis de tokens" en el post-entrenamiento, así como el cambio de vocabulario entre fases.

## Capacidades

- Generación de texto autoregresiva: el modelo es un GPT estándar y puede generar texto token a token.
- Tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio o modo thinking: no disponible.
- El modelo no ha sido evaluado en tareas específicas más allá de la pérdida de entrenamiento.

## Casos de uso

- Investigación sobre escalado de entrenamiento: el modelo sirve como punto de comparación para estudiar cómo la cantidad de tokens en la fase de post-entrenamiento (500M) afecta la pérdida final, en el contexto del proyecto "token dose".
- Reproducción de experimentos: al ser un checkpoint con metadatos completos (config, estado RNG, métricas de entrenamiento), permite reproducir el run y comparar con otras semillas o dosis.
- Fine-tuning en tareas de dominio específico: por su tamaño pequeño, se puede adaptar con pocos recursos en tareas de clasificación o generación de texto corto, siempre que se parta de una base ya entrenada.
- Benchmarking de eficiencia en hardware: el modelo puede utilizarse para medir flops por token y throughput en distintas GPUs, ya que el run incluye métricas de flops y tiempo de entrenamiento.
- Docencia de arquitecturas transformer: un modelo de ~100M con configuración simple es adecuado para ilustrar conceptos de atención, embeddings y entrenamiento en cursos o talleres.
- Pruebas de compatibilidad con nanochat: sirve para validar la integración de checkpoints de nanochat en otros frameworks o pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos son métricas de entrenamiento: pérdida suavizada 3.599, flops utilizados 2.079e17, flops por token 2.080e9 y tiempo total de entrenamiento 418 segundos. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No hay datos confirmados. El tamaño del repositorio es de 3.0 GB, pero no se especifica el tamaño de los pesos.
- Opciones de despliegue: el checkpoint se distribuye como state_dict de PyTorch (.pt), por lo que puede cargarse directamente con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Se han identificado dos modelos de la misma familia en el repositorio del autor, ambos con el prefijo "100Mpt" y las mismas tags (nanochat_gpt, pt_fineweb-nanochatbpe-100M, ppt_nca-paper-share20-2048, case_c, lr_trapezoid, depth_16), pero con diferentes dosis de tokens en la fase PPT y diferentes semillas:

| Modelo | Tokens PPT | Seed | Fecha |
|---|---|---|---|
| nca_dose_100Mpt_hfbody_100M_s2_2026-08-14_23-57-20_159733-pt | 100M | 2 | 2026-08-14 |
| nca_dose_100Mpt_hfbody_adamwppt_500M_s2_2026-09-06_10-36-39_484840-pt | 500M | 2 | 2026-09-06 |
| nca_dose_100Mpt_hfbody_1B_s1_2026-08-15_00-55-24_338967-pt | 1B | 1 | 2026-08-15 |

Los tres comparten licencia Apache 2.0. No se dispone de más detalles de rendimiento o arquitectura para estos modelos comparables.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos, pero al ser un modelo de investigación pequeño no ha pasado por procesos de alineación ni filtrado de sesgos.
- El riesgo de alucinación es probablemente alto, dado que no se ha evaluado en tareas de razonamiento ni se ha sometido a RLHF/DPO.
- La longitud de contexto es de 2048 tokens, lo que limita su uso en tareas que requieran ventanas largas.
- Los idiomas soportados no están documentados; el dataset de preentrenamiento (fineweb) es principalmente inglés, por lo que su rendimiento en otros idiomas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de calidad ni soporte.
- Este checkpoint no está pensado para producción: no se han publicado evaluaciones de seguridad, benchmarks ni pruebas de robustez.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfbody_adamwppt_500M_s2_2026-09-06_10-36-39_484840-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/cx98su9x
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelo comparable 1: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfbody_100M_s2_2026-08-14_23-57-20_159733-pt
- Modelo comparable 2: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfbody_1B_s1_2026-08-15_00-55-24_338967-pt
