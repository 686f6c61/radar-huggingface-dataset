# MatterWaveAI/grt-10m-curriculum

## Resumen

GRT-10M-Curriculum es un modelo de lenguaje causal de muy pequeno tamano (8,7 millones de parametros totales, de los cuales solo 2,2 millones corresponden al backbone no-embedding) desarrollado por MatterWaveAI. Se trata de una variante del checkpoint base `MatterWaveAI/grt-10m` a la que se ha aplicado un entrenamiento de curriculum multi-ronda con el optimizador `HuygensSymplecticAdam`. El modelo emplea una arquitectura denominada Geometric Rotation Transformer (GRT), en la que las proyecciones lineales se parametrizan como cascadas de rotaciones de Givens que preservan la norma, en lugar de matrices densas convencionales.

El modelo resuelve un problema de investigacion concreto: demostrar que un backbone rotacional de muy pocos parametros puede beneficiarse de un entrenamiento por etapas sin sufrir explosion de normas ni olvido catastrofico, algo que los transformers densos convencionales no toleran bien a esta escala. Segun la model card, la macro-media en el suite SLM-Bench de 9 tareas pasa de 37,61 % (baseline PairAdam) a 44,57 % con el curriculum multi-ronda, y la verificacion numerica en GSM8K alcanza el 95,80 %.

Es relevante ahora como pieza de investigacion en eficiencia de arquitecturas y optimizadores para modelos de lenguaje extremadamente pequenos (SLM), no como modelo de produccion. Su ventana de contexto es de 1.024 tokens, solo soporta ingles y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Rotation Transformer (GRT), transformer causal con proyecciones como rotaciones de Givens en SO(D) |
| Parametros totales | 8.802.768 (segun safetensors); 8.685.283 (8,7M) segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos de la model card: `d_model` = 256, 6 bloques rotacionales, 4 cabezas, 5 rotaciones QKV, 9 rotaciones en la FFN, vocabulario BPE de 50.000 tokens, 6,45M de parametros corresponden al embedding (50.000 tokens x 128 angulos de fase mas una log-magnitud por token).

## Arquitectura y entrenamiento

La arquitectura GRT sustituye las matrices densas `nn.Linear` por cascadas de rotaciones 2x2 de Givens sobre SO(D). Al ser transformaciones ortogonales, preservan la norma del vector (`||R(theta) x||_2 = ||x||_2`), lo que permite entrenar el backbone a traves de multiples etapas de curriculum sin explosion de normas ni olvido catastrofico, algo que segun el autor los transformers densos no soportan bien a esta escala (sobreajustan en 1-2 epocas). El modelo parte del mismo checkpoint de 8,7M parametros que `MatterWaveAI/grt-10m`.

El entrenamiento usa el dataset Nemotron (`nvidia/Nemotron-Pretraining-Dataset-sample`), 336.000 pasos, optimizador PairAdam en la fase base, LR pico 1e-3 con decaimiento coseno hasta el 10 %, y perdida de entrenamiento de 2,144 (validacion: loss 4,033, perplexity 56,4, accuracy 0,400). Sobre esa base se aplica la optimizacion multi-ronda con `HuygensSymplecticAdam`, que rastrea velocidad angular y coherencia de fase entre etapas a traves de las cascadas de Givens, permitiendo que los bloques rotacionales profundos se alineen en schedules multi-etapa donde PairAdam se estanca. La innovacion tecnica principal es, por tanto, la combinacion de geometria rotacional que preserva norma con un optimizador simplectico y un curriculum progresivo multi-ronda.

## Capacidades

- Generacion de texto causal en ingles (pipeline `text-generation`).
- Razonamiento de sentido comun y respuesta a preguntas de opcion multiple (BoolQ, ARC, OpenBookQA, PIQA, WinoGrande, HellaSwag, QNLI, CommonsenseQA).
- Razonamiento matematico basico con verificacion numerica en GSM8K (4-way numerical verification).
- Capacidad de modelado de lenguaje medida por perplexity en dominios de matematicas y conocimiento general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; solo ingles.

## Casos de uso

- Investigacion en arquitecturas eficientes: usar el modelo como banco de pruebas reproducible para comparar optimizadores (PairAdam, SymplecticAdam, HuygensSymplecticAdam) sobre un backbone rotacional de 2,2M parametros no-embedding, con metricas publicadas en SLM-Bench.
- Estudio de estabilidad de entrenamiento: emplear la propiedad de preservacion de norma de las rotaciones de Givens para experimentar con curricula multi-etapa sin explosion de gradientes ni olvido catastrofico, algo inviable en transformers densos a esta escala.
- Evaluacion de razonamiento matematico en SLM: reproducir el protocolo de verificacion numerica 4-way sobre GSM8K (95,80 % reportado) para estudiar hasta donde llega un modelo de menos de 9M de parametros.
- Docencia y divulgacion: ilustrar el funcionamiento de rotaciones de Givens, optimizadores simplecticos y entrenamiento por curriculum en un modelo que cabe en cualquier GPU consumer y se inspecciona con facilidad.
- Generacion de texto muy ligera en ingles para prototipos de pipelines de `transformers` con restricciones severas de memoria (contexto de 1.024 tokens).
- Baseline para experimentos de destilacion o comparativas de eficiencia parametro-rendimiento en tareas de opcion multiple del suite SLM-Bench.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre SLM-Bench (9 tareas de opcion multiple, 13.144 ejemplos held-out) y GSM8K (test, n=500):

| Tarea | Aleatorio | Zero-shot | PairAdam (NeurIPS) | Single-pass HuygensSymplectic | Curriculum multi-ronda |
|---|---:|---:|---:|---:|---:|
| BoolQ (val, 3.270) | 50,00 % | 62,14 % | 61,13 % | 62,17 % | 62,72 % |
| ARC-Easy (test, 2.376) | 25,00 % | 26,94 % | 26,60 % | 32,28 % | 33,16 % |
| ARC-Challenge (test, 1.172) | 25,00 % | 22,53 % | 24,91 % | 27,13 % | 28,84 % |
| OpenBookQA (test, 500) | 25,00 % | 30,00 % | 22,60 % | 35,20 % | 39,00 % |
| PIQA (val, 1.838) | 50,00 % | 52,18 % | 50,82 % | 52,18 % | 52,18 % |
| WinoGrande (val, 1.267) | 50,00 % | 50,51 % | 50,75 % | 51,85 % | 52,25 % |
| HellaSwag (val, 1.000) | 25,00 % | 25,60 % | 29,10 % | 30,80 % | 35,70 % |
| QNLI (val, 1.000) | 50,00 % | 52,70 % | 49,70 % | 60,90 % | 74,40 % |
| CommonsenseQA (val, 1.221) | 20,00 % | 20,15 % | 22,85 % | 22,85 % | 22,85 % |
| Macro-media 9 tareas | 35,56 % | 38,08 % | 37,61 % | 41,71 % | 44,57 % |

| Metrica GSM8K (test, n=500) | Zero-shot | PairAdam | Single-pass | Curriculum |
|---|---:|---:|---:|---:|
| Perplexity (menor es mejor) | 145,85 | 37,27 | 30,09 | 25,28 |
| Verificacion numerica 4-way | 22,00 % | 21,80 % | 84,60 % | 95,80 % |

No se han publicado en la informacion disponible comparaciones con modelos de terceros; las cifras anteriores comparan unicamente variantes internas del mismo checkpoint base.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (8,8M parametros, ~35 MB de pesos mas estados de activacion y KV cache para 1.024 tokens); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 3060, RTX 4090, T4, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU.
- Opciones de despliegue: `transformers` (libreria declarada, con pipeline `text-generation`); no se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables de terceros (parametros, contexto, rendimiento o licencia). La unica comparacion documentada es con las variantes internas del mismo checkpoint (`MatterWaveAI/grt-10m` con PairAdam y con HuygensSymplecticAdam de una sola pasada), cuyos resultados aparecen en la seccion de benchmarks. Comparativa con alternativas externas: no disponible.

## Limitaciones y advertencias

- Modelo de investigacion de muy baja escala (2,2M parametros no-embedding): su calidad de generacion de texto libre es limitada; los resultados se centran en tareas de opcion multiple y verificacion numerica.
- Ventana de contexto de solo 1.024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo soporta ingles; no hay capacidades multilingues.
- Riesgo de alulicinacion alto en generacion abierta, aunque no se cuantifica en la model card.
- No se documentan evaluaciones de sesgo; al entrenar sobre Nemotron sample, puede heredar sesgos del corpus.
- Los benchmarks publicados son autoinformados por el autor sobre suites propias (SLM-Bench) y no han sido verificados de forma independiente.
- Sin soporte documentado de tool calling, agentes ni cuantizacion; los pesos estan en float32.
- Licencia Apache 2.0: permite uso comercial, pero la escala y las limitaciones tecnicas hacen desaconsejable su uso en produccion mas alla de experimentacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-10m-curriculum
- Checkpoint base: https://huggingface.co/MatterWaveAI/grt-10m
- Archivos del modelo base: https://huggingface.co/MatterWaveAI/grt-10m/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-Dataset-sample
