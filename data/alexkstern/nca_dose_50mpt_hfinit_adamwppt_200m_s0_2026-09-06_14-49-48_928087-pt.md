# alexkstern/nca_dose_50Mpt_hfinit_adamwppt_200M_s0_2026-09-06_14-49-48_928087-pt

## Resumen

Este modelo es un checkpoint experimental de un transformer GPT entrenado con la librería nanochat de Karpathy. Fue desarrollado por alexkstern como parte de un estudio sobre la dosis de tokens (token dose) en el preentrenamiento y postentrenamiento. La configuración de red incluye 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024, con una longitud de contexto de 2048 tokens. El entrenamiento se dividió en dos fases: una primera fase con 50 millones de tokens del dataset FineWeb y una segunda fase con 200 millones de tokens del dataset nca-paper-share200-2048, cambiando el vocabulario de 65536 a 10004 tokens.

El checkpoint corresponde al paso 762 de un total de 1000 iteraciones, y se publica bajo licencia Apache 2.0. El modelo es relevante porque documenta un experimento de investigación sobre el efecto de la cantidad de tokens en el entrenamiento y sobre la reinicialización de embeddings al cambiar de vocabulario. No está pensado para uso en producción, sino como referencia para estudios de escalado y eficiencia en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GPT (nanochat_gpt) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

Configuración de red del checkpoint: `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024`. Vocabulario final (post-training): 10004 tokens.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar implementada en nanochat. Tiene 16 capas de transformer, 8 cabezas de atención, 8 cabezas KV (lo que indica atención multi-query o grouped-query), una dimensión de embedding de 1024 y una longitud de contexto de 2048 tokens. El vocabulario cambia durante el entrenamiento: en la fase de preentrenamiento (pt) se usa un vocabulario de 65536 tokens, mientras que en la fase de postentrenamiento (ppt) se reduce a 10004 tokens. La transición entre fases incluye la reinicialización de los embeddings y el reinicio del optimizador.

El entrenamiento se divide en dos fases. La primera fase (pt) utiliza 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`. La segunda fase (ppt) utiliza 200 millones de tokens del dataset `nca-paper-share200-2048`. El optimizador es AdamW con tasas de aprendizaje diferenciadas: 0.02 para matrices, 0.3 para embeddings y 0.004 para unembeddings en la fase pt; en la fase ppt la tasa es 5e-06. El schedule de learning rate es trapezoidal con un warmdown del 40%. El checkpoint se guardó en el paso 762 de 1000 iteraciones, con una pérdida de entrenamiento suavizada de 4.217 y un objetivo mínimo de 1.236. El entrenamiento consumió 1.039e17 FLOPs y 390.78 segundos en un hardware con un pico de 2250 TFLOPS. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva: el modelo genera texto token a token.
- Razonamiento básico: no documentado.
- Código y matemáticas: no documentado.
- Tool calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentado. El dataset de preentrenamiento (FineWeb) sugiere predominio del inglés.
- Visión y audio: no disponible.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Investigación en escalado de tokens: el modelo permite estudiar el efecto de la cantidad de tokens de preentrenamiento y postentrenamiento. Se usaría comparando este checkpoint con otros de la misma serie para analizar la curva de pérdida y la eficiencia.
- Educación en arquitecturas transformer: al tener una configuración pequeña y completa, puede usarse como ejemplo práctico en cursos de aprendizaje profundo para ilustrar el funcionamiento de GPT, atención y embeddings.
- Fine-tuning experimental: con licencia Apache 2.0 y pesos en formato PyTorch, se puede adaptar a tareas de dominio específico con pocos recursos, por ejemplo en un entorno académico.
- Benchmarking de eficiencia: el checkpoint incluye métricas de FLOPs y tiempo de entrenamiento, lo que permite comparar la eficiencia de diferentes configuraciones de entrenamiento.
- Pruebas de transferencia de vocabulario: el cambio de vocabulario durante el entrenamiento es un experimento útil para investigar la reinicialización de embeddings y su impacto en el rendimiento.
- Prototipado de generación de texto: al ser un modelo pequeño, puede ejecutarse en hardware modesto para prototipos de baja complejidad, como autocompletado básico o experimentos de corto alcance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- GPU de consumo: probablemente sí, dado el tamaño de la configuración, pero no hay datos oficiales.
- Opciones de despliegue: el modelo se entrega como checkpoint de PyTorch (.pt) y está pensado para usarse con la librería nanochat. No se mencionan integraciones con vLLM, llama.cpp ni otros frameworks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los tres modelos pertenecen a la misma serie de experimentos de token dose del autor alexkstern. No se dispone de más especificaciones.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nca_dose_50Mpt_hfinit_adamwppt_200M_s0 (este) | no disponible | 2048 | Apache 2.0 | HuggingFace |
| nca_dose_50Mpt_hfinit_20M_s0_2026-08-15_00-25-50_871551-pt | no disponible | no disponible | Apache 2.0 | HuggingFace |
| nca_dose_50Mpt_hfinit_1B_s0_2026-08-15_01-13-45_671442-pt | no disponible | no disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que se desconoce el rendimiento real en tareas estándar.
- El checkpoint corresponde al paso 762 de 1000, por lo que el modelo puede no haber convergido completamente.
- El vocabulario final es de 10004 tokens, lo que limita la capacidad de representación del lenguaje.
- No se documentan capacidades de tool calling, agentes ni razonamiento avanzado.
- El dataset de preentrenamiento (FineWeb) es contenido web en su mayoría, lo que puede introducir sesgos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no está listo para producción.
- No se dispone de información sobre riesgos de alucinación.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_adamwppt_200M_s0_2026-09-06_14-49-48_928087-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/bp3zq6fd
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Checkpoint 20M: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_20M_s0_2026-08-15_00-25-50_871551-pt
- Checkpoint 1B: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_1B_s0_2026-08-15_01-13-45_671442-pt
