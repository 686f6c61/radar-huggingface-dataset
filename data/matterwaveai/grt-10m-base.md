# MatterWaveAI/grt-10m-base

## Resumen

GRT-10M-Base es un modelo de lenguaje causal de tipo transformer con una arquitectura experimental denominada Geometric Rotation Transformer (GRT), desarrollada por MatterWaveAI. A diferencia de un transformer convencional, sustituye las proyecciones lineales densas (Q/K/V y las matrices del FFN) por cascadas de rotaciones de Givens aprendidas sobre SO(D) en patron de mariposa, de modo que la ruta residual no contiene ninguna capa `nn.Linear`. El modelo es un checkpoint de investigacion preentrenado para una submission a NeurIPS, publicado sin fine-tuning posterior.

Con 8.685.283 parametros totales (8,7 M) de los cuales solo 2.235.283 (2,2 M) no pertenecen a los embeddings, el modelo tiene d_model 256, 6 bloques, 4 cabezas y una longitud de contexto maxima de 1.024 tokens. El vocabulario BPE de 50.000 tokens domina el recuento de parametros: 6,45 M de los 8,7 M corresponden al embedding rotacional (50.000 tokens x 128 angulos de fase mas una log-magnitud por token).

Su relevancia es fundamentalmente arquitectonica: el autor lo presenta explicitamente como una prueba de concepto a pequena escala para demostrar que la arquitectura GRT entrena de forma estable y evalua de extremo a extremo, no como un modelo de lenguaje capacitado. Los resultados de validacion (perplejidad 56,4 y precision 0,400) y los benchmarks multiple-choice (media macro de 38,08 % frente al 35,56 % aleatorio) confirman ese caracter de experimento controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Rotation Transformer (GRT); transformer causal con rotaciones de Givens aprendidas en SO(D) en lugar de proyecciones lineales densas |
| Parametros totales | 8.685.283 (8,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (checkpoint publicado en float32; el paquete es PyTorch puro y no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; requiere el paquete `geometric-rotation-transformer`) |

| Parametro adicional | Valor |
|---|---|
| d_model | 256 |
| n_blocks | 6 |
| n_heads | 4 |
| n_qkv_rotations | 5 |
| ffn_n_rotations | 9 |
| Vocabulario | 50.000 (BPE) |
| Parametros no-embedding | 2.235.283 (2,2 M) |
| Precision | float32 |
| Optimizador de entrenamiento | PairAdam |
| Pasos de entrenamiento | 336.000 |

## Arquitectura y entrenamiento

GRT reemplaza las proyecciones Q/K/V y las matrices de pesos del FFN por cascadas de rotaciones 2x2 de Givens aprendidas, dispuestas en patron de mariposa. Cada etapa se modula con caracteristicas de Clifford dependientes de los datos (energia escalar S0, direccion V1/V2 y bivector cruzado B12), de modo que el angulo efectivo es `theta = angles + tanh(modulation)` y la rotacion aplica `r0 = x0*cos(theta) - x1*sin(theta)`, `r1 = x0*sin(theta) + x1*cos(theta)`. Los componentes incluyen RotationalEmbedding (tokens almacenados como angulos de fase sobre la hiperesfera unitaria), RotationalAttention (Q/K/V mediante cascadas de Givens), RotationalFFN (etapas de rotacion meta-acopladas), PearlNorm (normalizacion por radio de par que preserva la fase por par) y RadialGELU (activacion que modula las magnitudes de par preservando la direccion).

El entrenamiento se realizo sobre el dataset Nemotron (nvidia/Nemotron-Pretraining-Dataset-sample) durante 336.000 pasos con el optimizador PairAdam (una variante de AdamW con segundos momentos factorizados: parametros 1D como angulos y escalas usan momentos diagonales estandar, y parametros 2D como matrices de acoplamiento usan un factor por fila). Se uso un LR pico de 1e-3 con decaimiento coseno hasta el 10 %. La perdida de entrenamiento final fue 2,144; en validacion, la perdida fue 4,033, la perplejidad 56,4 y la precision 0,400. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni fine-tuning de instrucciones para este checkpoint base; el autor menciona que existe una variante posterior (`MatterWaveAI/grt-10m`) con fine-tuning de curriculum mediante SymplecticAdam / HuygensSymplecticAdam.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, con contexto maximo de 1.024 tokens.
- Modelado de lenguaje a nivel de token y evaluacion zero-shot en tareas de eleccion multiple (BoolQ, QNLI, PIQA, WinoGrande, OpenBookQA, ARC-Easy, ARC-Challenge, HellaSwag, CommonsenseQA).
- Razonamiento de sentido comun y comprension lectora basica, con rendimiento superior al azar en la mayoria de las tareas evaluadas.
- Capacidad matematica muy limitada: perplejidad de 145,85 en el split de test de GSM8K en zero-shot.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: no; unicamente ingles.
- No dispone de modo thinking, vision ni audio.
- Integracion con las clases Auto de `transformers` previa instalacion del paquete `grt` (registra `model_type: "grt"`); ejecutable en CPU con PyTorch puro y con kernels CUDA opcionales.

## Casos de uso

- Investigacion arquitectonica en rotaciones: el caso de uso principal es estudiar si las cascadas de rotaciones de Givens en SO(D) pueden sustituir las proyecciones lineales densas manteniendo un entrenamiento estable; el checkpoint sirve como linea base reproducible con 336.000 pasos y perdida final documentada.
- Reproduccion de experimentos academicos: el modelo permite reproducir los resultados de SLM-Bench mediante `python -m training.slm_bench --checkpoint ./ --tasks boolq,arc_easy --device cuda` o mediante lm-evaluation-harness, util para comparar variantes del optimizador (PairAdam frente a SymplecticAdam).
- Pruebas de integracion del paquete `geometric-rotation-transformer`: sirve para validar que `import grt` registra correctamente la arquitectura en las clases Auto de transformers y que el tokenizador `RotationalTokenizerBPE` funciona en pipelines de generacion.
- Docencia y divulgacion sobre alternativas a la atencion densa: al ser un modelo de 8,7 M parametros que corre en CPU, es adecuado para demostrar en un portatil como se comporta una arquitectura rotacional frente a un transformer estandar en tareas de eleccion multiple.
- Experimentos de ablacion a bajo coste: su tamano reducido (2,2 M parametros no-embedding, d_model 256, 6 bloques) permite iterar rapidamente sobre variantes de PearlNorm, RadialGELU o el numero de rotaciones QKV/FFN sin requerir GPU de gama alta.
- Evaluacion comparativa de tokenizadores BPE con embedding rotacional: el diseno del embedding (50.000 tokens x 128 angulos de fase mas log-magnitud) permite analizar el efecto del vocabulario en el recuento total de parametros y en la perplejidad de validacion.
- Generacion de texto de ejemplo en ingles: con `max_new_tokens=50` y temperatura 0,7 puede producir continuaciones de frases cortas, util solo como demostracion cualitativa y no en produccion.

## Benchmarks y rendimiento

Evaluacion via `grt-slm-bench` sobre 9 benchmarks de eleccion multiple (13.144 ejemplos retenidos) y perplejidad retenida de GSM8K:

| Tarea (SLM-Bench) | Split (n) | Azar | GRT-10M-Base (zero-shot) | Fine-tune estandar PairAdam |
|---|---|---:|---:|---:|
| BoolQ | val (3.270) | 50,00 % | 62,14 % | 61,13 % |
| QNLI | val (1.000) | 50,00 % | 52,70 % | 49,70 % |
| PIQA | val (1.838) | 50,00 % | 52,18 % | 50,82 % |
| WinoGrande | val (1.267) | 50,00 % | 50,51 % | 50,75 % |
| OpenBookQA | test (500) | 25,00 % | 30,00 % | 22,60 % |
| ARC-Easy | test (2.376) | 25,00 % | 26,94 % | 26,60 % |
| HellaSwag | val (1.000) | 25,00 % | 25,60 % | 29,10 % |
| ARC-Challenge | test (1.172) | 25,00 % | 22,53 % | 24,91 % |
| CommonsenseQA | val (1.221) | 20,00 % | 20,15 % | 22,85 % |
| Media macro 9 tareas | 13.144 total | 35,56 % | 38,08 % | 37,61 % |

| Perplejidad matematica retenida | Split (n) | GRT-10M-Base (zero-shot) | Fine-tune estandar PairAdam |
|---|---:|---:|---:|
| GSM8K | test (500) | 145,85 PPL | 37,27 PPL |

| Metrica de validacion | Valor |
|---|---:|
| Perdida de validacion | 4,033 |
| Perplejidad de validacion | 56,4 |
| Precision de validacion | 0,400 |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; con 8,7 M parametros en float32 el checkpoint ocupa aproximadamente 35 MB, por lo que cabe en cualquier GPU consumer con mas de 1 GB de VRAM e incluso en CPU.
- GPU recomendadas: no se requieren; el paquete es PyTorch puro y corre en CPU. Los kernels CUDA optimizados son opcionales y se cargan automaticamente si estan instalados.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) y en Apple Silicon via PyTorch MPS si el paquete lo soporta; no se documentan requisitos especificos.
- Opciones de despliegue: transformers con el paquete `geometric-rotation-transformer` (`import grt` registra `model_type: "grt"`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y `trust_remote_code=True` no esta soportado en este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRT-10M-Base (MatterWaveAI) | 8,7 M (2,2 M no-embedding) | 1.024 | Media macro 38,08 % en 9 tareas MC; PPL validacion 56,4 | Apache 2.0 | Hugging Face, requiere paquete pip |
| GRT-10M (MatterWaveAI) | No disponible en detalle (variante con curriculum SymplecticAdam) | No disponible | No disponible | Apache 2.0 | Hugging Face |
| GPT-2 small | 124 M | 1.024 | No comparable directamente en esta informacion | MIT | Hugging Face, transformers nativo |
| TinyLlama-1.1B | 1,1 B | 2.048 | No comparable directamente en esta informacion | Apache 2.0 | Hugging Face |

La comparativa con modelos de la misma categoria (SLM de menos de 100 M parametros) no esta disponible en la informacion proporcionada, ya que el autor solo compara el checkpoint base con su propia variante fine-tuneada.

## Limitaciones y advertencias

- El propio autor declara que es una prueba de concepto a pequena escala, no un modelo de lenguaje capacitado; no debe usarse en produccion.
- Perplejidad de validacion de 56,4 y precision de validacion de 0,400 indican un modelado del lenguaje muy debil.
- Riesgo alto de alucinacion: en varias tareas (HellaSwag, ARC-Challenge, CommonsenseQA) el rendimiento zero-shot esta en el nivel del azar o por debajo.
- Capacidad matematica practicamente nula: perplejidad de 145,85 en GSM8K zero-shot.
- Contexto muy limitado (1.024 tokens) e idioma unico (ingles); no soporta otros idiomas.
- Sin soporte de `trust_remote_code=True`: la arquitectura requiere instalar el paquete `geometric-rotation-transformer` antes de cargar los pesos, lo que complica el despliegue en entornos gestionados.
- Sin datos publicados sobre sesgos, filtros de seguridad, RLHF o DPO; no hay garantias de alineacion ni de moderacion.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint de investigacion sin garantias de calidad, su uso comercial no tiene sentido practico.
- No se documentan variantes cuantizadas (GGUF, AWQ, GPTQ) ni soporte en motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-10m-base
- Variante con fine-tuning de curriculum: https://huggingface.co/MatterWaveAI/grt-10m
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-Dataset-sample
- Paquete pip de la arquitectura: `pip install geometric-rotation-transformer` (no se proporciona URL del repositorio en la informacion disponible)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web proporcionada.
