# MatterWaveAI/grt-10m

## Resumen

GRT-10M es un modelo de lenguaje causal de 8,8 millones de parámetros desarrollado por MatterWaveAI. Se trata de la prueba de concepto a pequeña escala presentada originalmente a NeurIPS (y finalmente rechazada), publicada tal cual para permitir la reproducibilidad de la investigación. Su interés no reside en sus capacidades lingüísticas, sino en la arquitectura: el Geometric Rotation Transformer (GRT) sustituye las proyecciones lineales densas de un transformer estándar por cascadas de rotaciones de Givens aprendidas sobre SO(D), de modo que el camino residual no contiene ninguna capa `nn.Linear`.

El modelo se entrenó sobre el dataset Nemotron y se distribuye con licencia Apache 2.0. Con 256 dimensiones de modelo, 6 bloques, 4 cabezas y una longitud máxima de secuencia de 1.024 tokens, está pensado exclusivamente como banco de pruebas arquitectónico: el propio autor advierte que no es un modelo de lenguaje capaz en términos prácticos.

Su relevancia actual es metodológica. Publica métricas de validación (perplejidad 56,4, precisión 0,400) y una evaluación de 10 tareas del suite SLM-Bench comparando el checkpoint zero-shot con variantes de ajuste fino mediante optimizadores simplécticos (PairAdam, SymplecticAdam, HuygensSymplecticAdam), lo que permite estudiar el comportamiento del entrenamiento en una arquitectura no convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Rotation Transformer (GRT), transformer causal con proyecciones Q/K/V y FFN sustituidas por rotaciones de Givens en SO(D) |
| Parametros totales | 8.802.768 (8,8 M segun safetensors); 8.685.283 segun la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos de la model card: parametros no-embedding 2.235.283 (2,2 M); d_model 256; n_blocks 6; n_heads 4; n_qkv_rotations 5; ffn_n_rotations 9; vocabulario 50.000 (BPE); precision float32. El embedding concentra 6,45 M de los 8,7 M de parametros (50.000 tokens x 128 angulos de fase, mas una log-magnitud por token).

## Arquitectura y entrenamiento

GRT reemplaza las proyecciones estandar Q/K/V y las matrices de pesos de la FFN por cascadas de rotaciones 2x2 de Givens aprendidas, dispuestas en patron de mariposa (butterfly). Cada etapa se modula con caracteristicas de Clifford dependientes de los datos: energia escalar (S0), direccion (V1, V2) y bivector cruzado (B12). El angulo efectivo de cada rotacion es `theta = angles + tanh(modulation)`, es decir, un angulo base mas un ajuste dependiente del contenido, y la rotacion se aplica como `r0 = x0*cos(theta) - x1*sin(theta)`, `r1 = x0*sin(theta) + x1*cos(theta)`. El embedding es de tipo rotacional: los tokens se almacenan como angulos de fase mas una log-magnitud.

El entrenamiento uso el dataset Nemotron durante 336.000 pasos con el optimizador PairAdam, learning rate pico de 1e-3 con decaimiento coseno hasta el 10 %. La perdida de entrenamiento final fue 2,144 y la de validacion 4,033 (perplejidad 56,4, precision 0,400). No se menciona RLHF, DPO ni ajuste por instrucciones. La innovacion destacable es puramente arquitectonica: eliminar las proyecciones lineales densas del camino residual en favor de rotaciones ortogonales aprendidas, lo que en principio preserva la norma y la geometria de las representaciones.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, con calidad muy limitada por el tamano (8,8 M de parametros).
- Razonamiento basico de opcion multiple y sentido comun a nivel de tarea, evaluado en SLM-Bench (BoolQ, ARC, OpenBookQA, PIQA, WinoGrande, HellaSwag, QNLI, CommonsenseQA, GSM8K).
- Aritmetica elemental en formato de opcion multiple (GSM8K 4-way MC/PPL), con resultados que dependen fuertemente del ajuste fino.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingue: no, solo ingles.
- Sin modo thinking, vision ni audio.
- Compatible con las Auto classes de `transformers` previa instalacion del paquete `geometric-rotation-transformer` e importacion de `grt` (registra `model_type: "grt"`).

## Casos de uso

- Investigacion en arquitecturas alternativas: sirve como referencia reproducible para estudiar si las rotaciones de Givens aprendidas pueden sustituir a las proyecciones lineales densas en un transformer, comparando perdidas y curvas de entrenamiento con un baseline equivalente.
- Experimentacion con optimizadores simplécticos: la model card incluye resultados de PairAdam, SymplecticAdam y HuygensSymplecticAdam sobre el mismo checkpoint, lo que permite reproducir y extender esos experimentos de ajuste fino tarea a tarea.
- Docencia y divulgacion: un modelo de menos de 9 M de parametros que corre en CPU facilita explicar conceptos de atencion, rotaciones ortogonales y modulacion dependiente del contenido en un entorno controlado.
- Pruebas de integracion de tooling: valida pipelines de `transformers`, `lm-evaluation-harness` y el paquete `grt` sin consumir recursos de GPU significativos.
- Benchmarking de hardware y kernels: al ser puro PyTorch con kernels CUDA opcionales, permite medir latencia y throughput en CPU, ROCm (gfx1151) y CUDA en un modelo minimo.
- Prototipado de evaluaciones: el script `grt-slm-bench` y el suite de 10 tareas sirven como plantilla para montar evaluaciones propias sobre modelos pequenos.

## Benchmarks y rendimiento

Resultados en el suite de 10 tareas SLM-Bench (checkpoint zero-shot frente a ajuste fino con distintos optimizadores), ejecutados en AMD Ryzen AI Max+ 395 (Radeon 8060S, ROCm gfx1151):

| Tarea (SLM-Bench) | Split (n) | Random | GRT-10M zero-shot | PairAdam | SymplecticAdam | HuygensSymplecticAdam |
|---|---|---:|---:|---:|---:|---:|
| BoolQ | val (3.270) | 50,00 % | 62,14 % | 61,13 % | 62,14 % | 62,17 % |
| ARC-Easy | test (2.376) | 25,00 % | 26,94 % | 26,60 % | 31,73 % | 32,28 % |
| ARC-Challenge | test (1.172) | 25,00 % | 22,53 % | 24,91 % | 25,17 % | 27,13 % |
| OpenBookQA | test (500) | 25,00 % | 30,00 % | 22,60 % | 33,40 % | 35,20 % |
| PIQA | val (1.838) | 50,00 % | 52,18 % | 50,82 % | 52,18 % | 52,18 % |
| WinoGrande | val (1.267) | 50,00 % | 50,51 % | 50,75 % | 51,85 % | 51,85 % |
| HellaSwag | val (1.000) | 25,00 % | 25,60 % | 29,10 % | 30,80 % | 30,80 % |
| QNLI | val (1.000) | 50,00 % | 52,70 % | 49,70 % | 56,80 % | 60,90 % |
| CommonsenseQA | val (1.221) | 20,00 % | 20,15 % | 22,85 % | 22,85 % | 22,85 % |
| GSM8K (4-way MC/PPL) | test (500) | 25,00 % | 22,00 % (145,9 PPL) | 21,80 % (37,3 PPL) | 79,40 % (43,5 PPL) | 84,60 % (30,1 PPL) |
| Media macro 10 tareas | 13.644 total | 34,50 % | 36,47 % | 36,03 % | 44,63 % | 46,00 % |

Metricas de validacion del entrenamiento: perdida 4,033, perplejidad 56,4, precision 0,400.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (8,8 M de parametros, aproximadamente 35 MB de pesos); ejecutable en CPU sin GPU.
- GPU recomendadas: ninguna en particular; el modelo corre en CPU. La model card reporta evaluacion en AMD Ryzen AI Max+ 395 (Radeon 8060S, ROCm gfx1151) y soporta CUDA con kernels opcionales.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` con el paquete `geometric-rotation-transformer`; `lm-evaluation-harness` para evaluacion; el script `grt-slm-bench`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRT-10M (MatterWaveAI) | 8,8 M | 1.024 | Rotaciones de Givens en SO(D) sin `nn.Linear` | Apache 2.0 | Hugging Face + paquete pip |
| GPT-2 small (OpenAI) | 124 M | 1.024 | Transformer denso clasico | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 | Transformer denso con RoPE | Apache 2.0 | Hugging Face |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 | Transformer denso | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks comparables entre GRT-10M y estos modelos en la informacion proporcionada; las cifras de SLM-Bench solo son internas al propio modelo y a sus variantes de ajuste fino.

## Limitaciones y advertencias

- Modelo de investigacion a escala minima: el propio autor indica que no es un modelo de lenguaje capaz y que se publica para demostrar estabilidad de entrenamiento y evaluacion end-to-end.
- Riesgo elevado de alucinacion y de generacion incoherente por el tamano (8,8 M de parametros, 2,2 M no-embedding) y la perplejidad de validacion (56,4).
- Solo ingles; sin soporte multilingue.
- Ventana de contexto de 1.024 tokens, insuficiente para conversaciones o documentos largos.
- No soporta `trust_remote_code=True`: requiere instalar el paquete `geometric-rotation-transformer` antes de cargar los pesos, lo que anade una dependencia externa al pipeline.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre Nemotron, hereda los sesgos de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en produccion real.
- El tag `neurips-reject` indica que la contribucion no supero la revision por pares; conviene tratar los resultados como preliminares.

## Enlaces

- Hugging Face: https://huggingface.co/MatterWaveAI/grt-10m
- GitHub del paquete Pi de MatterWaveAI (incluye router del modelo GRT): https://github.com/MatterWaveAI/pi-package
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-Dataset-sample
- Paquete pip: `geometric-rotation-transformer` (instalacion via `pip install geometric-rotation-transformer`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
