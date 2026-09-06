# alexkstern/nca_dose_50Mpt_hfbody_adamwppt_500M_s2_2026-09-06_12-56-53_963728-pt

## Resumen

El modelo `nca_dose_50Mpt_hfbody_adamwppt_500M_s2_2026-09-06_12-56-53_963728-pt` es un checkpoint de investigacion desarrollado por `alexkstern` dentro del ecosistema de la libreria `nanochat` de Karpathy. Se trata de un experimento de escalado de tokens que estudia el efecto de una dosis reducida de preentrenamiento (50 millones de tokens) seguida de una fase de post-entrenamiento (PPT) de 500 millones de tokens. El modelo es un transformer decoder-only estilo GPT, con 16 capas, 8 cabezas de atencion y dimension de embedding de 1024, con una ventana de contexto de 2048 tokens. El repositorio de HuggingFace ocupa 2,9 GB y el checkpoint se encuentra en el paso 762 de entrenamiento.

Aunque se trata de un modelo de lenguaje de tamano modesto, su interes radica en la metodologia experimental: utiliza un optimizador AdamW con tasas de aprendizaje diferenciadas para matrices, embeddings y unembedding, y aplica una reinicializacion de embeddings en la transicion entre fases. No se han publicado evaluaciones de capacidades ni benchmarks, por lo que debe considerarse una pieza de investigacion sobre tecnicas de post-entrenamiento mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | no disponible |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (state_dict de PyTorch) |
| Tamano del repositorio | 2,9 GB |
| Paso de entrenamiento | 762 |
| Vocabulario (modelo PT) | 65536 |
| Vocabulario (modelo PPT) | 10004 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico, implementado como `nanochat_gpt`. La configuracion indica 16 capas, 8 cabezas de atencion (con 8 cabezas KV, es decir, atencion multi-cabeza estandar sin GQA), dimension de embedding de 1024 y longitud de secuencia de 2048. El tokenizer de preentrenamiento tiene un vocabulario de 65536 tokens, mientras que la fase de post-entrenamiento utiliza un vocabulario reducido de 10004 tokens, lo que sugiere un cambio de tokenizer en la transicion.

El entrenamiento se divide en dos fases. Primero, un preentrenamiento con 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`. Despues, una fase de post-entrenamiento (PPT) con 500 millones de tokens del dataset `nca-paper-share200-2048`. Se utiliza un programador de tasa de aprendizaje trapezoidal (`lr_trapezoid`) con un warmdown del 40% en la fase PT y del 5% en la fase PPT. El optimizador es AdamW con tasas de aprendizaje separadas para matrices (0,02), embeddings (0,3) y unembedding (0,004). En la transicion entre fases se reinicializan los embeddings y se resetea el optimizador. No se ha aplicado RLHF ni DPO.

## Capacidades

- Capacidades no evaluadas o no documentadas: no se ha publicado ninguna evaluacion de capacidades en la informacion proporcionada. No se dispone de datos sobre generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes o capacidades multilingues.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

No se dispone de informacion suficiente para proponer casos de uso concretos. Este modelo es un checkpoint de investigacion sin evaluacion publica de capacidades ni benchmarks, por lo que no se recomienda su uso en produccion. Cualquier aplicacion practica requeriria primero una validacion exhaustiva de calidad y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Soporte en GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch (`.pt`), por lo que puede cargarse con la libreria `nanochat` o con PyTorch directamente. No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los siguientes modelos pertenecen a la misma serie experimental del autor y comparten la configuracion base, aunque no se han publicado datos de rendimiento que permitan una comparacion directa.

| Modelo | Tokens de preentrenamiento | Tokens de PPT | Optimizador PPT | Fecha |
|---|---|---|---|---|
| `nca_dose_50Mpt_hfbody_adamwppt_500M_s2_2026-09-06_12-56-53_963728-pt` (este modelo) | 50M | 500M | AdamW | 2026-09-06 |
| `nca_dose_50Mpt_hfbody_200M_s2_2026-08-14_18-05-28_533551-pt` | 50M | 200M | no especificado | 2026-08-14 |
| `nca_dose_50Mpt_hfbody_500M_s2_2026-08-14_18-28-12_872487-pt` | 50M | 500M | no especificado | 2026-08-14 |

No hay datos de benchmarks para ninguno de estos modelos.

## Limitaciones y advertencias

- Se trata de un checkpoint de investigacion, no de un modelo finalizado o validado para uso general.
- El preentrenamiento se realizo con solo 50 millones de tokens, una cantidad extremadamente reducida para un modelo de lenguaje, lo que probablemente limita su calidad y coherencia.
- La ventana de contexto es de 2048 tokens, relativamente corta para tareas que requieren contexto largo.
- Se desconoce el sesgo del modelo, ya que no se ha realizado ninguna auditoria de sesgos.
- Existe riesgo de alucinacion, especialmente al carecer de evaluaciones de seguridad y facticidad.
- La reinicializacion de embeddings en la transicion entre fases puede provocar comportamientos inconsistentes durante la inferencia.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo se ofrece sin garantias de calidad, seguridad o idoneidad para un fin concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_adamwppt_500M_s2_2026-09-06_12-56-53_963728-pt
- Registro de entrenamiento en W&B: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/my4pn18i
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Modelo comparativo `nca_dose_50Mpt_hfbody_200M_s2_2026-08-14_18-05-28_533551-pt`: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_200M_s2_2026-08-14_18-05-28_533551-pt
- Modelo comparativo `nca_dose_50Mpt_hfbody_500M_s2_2026-08-14_18-28-12_872487-pt`: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_500M_s2_2026-08-14_18-28-12_872487-pt
