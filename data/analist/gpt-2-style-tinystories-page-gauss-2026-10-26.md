# analist/GPT-2-style-tinystories-page-gauss-2026-10-26

## Resumen

`GPT-2-style-tinystories-page-gauss-2026-10-26` es un modelo de lenguaje decoder-only de tipo GPT-2 entrenado desde cero por el usuario `analist` sobre el dataset TinyStories. Con unos 19-21 millones de parámetros, 6 capas, 6 cabezas de atención y una ventana de contexto de solo 256 tokens, no compite con los LLM actuales: es una pieza de un experimento controlado sobre mecanismos de atención. En concreto, implementa "page gauss attention", una variante en la que cada clave se sustituye por una media ponderada gaussiana de sus claves predecesoras antes de aplicar el producto con la query.

El interés del modelo es metodológico. Forma parte de una comparativa de cuatro mecanismos de atención (`causal`, `page cos`, `sigmoid`, `page gauss`) entrenados con datos, tokenizador, arquitectura, hiperparámetros, semilla, pesos iniciales y lotes idénticos, de modo que cualquier diferencia en la pérdida de validación es atribuible al mecanismo de atención. Toda la atención está escrita a mano en PyTorch, sin FlashAttention, lo que hace el código legible y auditable.

No es un modelo de propósito general: solo genera inglés, solo dentro del registro de cuentos infantiles y solo hasta 256 tokens. Su valor está en la reproducibilidad (semilla 0, 0,67 h en una NVIDIA L4, 328 M tokens vistos) y en servir como banco de pruebas para investigación en atención eficiente y en dinámicas de entrenamiento a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2, con atención "page gauss" escrita a mano (sin FlashAttention), pre-norm y RMSNorm |
| Parametros totales | 21.552.036 según safetensors; la model card declara 19,1 M (la diferencia corresponde probablemente al recuento de las matrices de embedding) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | `model.safetensors` + `config.json`, `modeling.py` (PyTorch puro), `tokenizer.json`, `history.json` |
| Capas x cabezas | 6 x 6 (head dim 64) |
| d_model / d_ff | 384 / 768 |
| MLP | d_model → d_ff → d_ff·2 → d_model, activación GELU |
| Posiciones | sinusoidales |
| Tokenizador | byte-level BPE de 4096 tokens, entrenado sobre TinyStories, con `<|endoftext|>` entre cuentos |
| Tamaño del repo | 0,1 GB |
| Pipeline | text-generation |
| Autor | analist |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico con 6 bloques, `d_model` 384, `d_ff` 768 y un MLP de tres matrices con GELU, normalización RMSNorm en configuración pre-norm y codificación posicional sinusoidal. La innovación está en la atención: cada clave `k_i` se reemplaza por la media gaussiana de sus claves predecesoras, con pesos `A = exp(−‖k_i − k_j‖² / 2h²)` para `j ≤ i`, filas normalizadas, resultando `K_page = ÃK`; después se aplica `softmax(Q·K_pageᵀ/√d)·V`. La anchura `h` es un parámetro aprendido por cabeza, inicializado en `√(head_dim/2)`. En la práctica esto suaviza las claves con un kernel de ancho aprendido, lo que actúa como una forma de agregación local que podría compararse con ventanas deslizantes o decaimiento posicional.

El entrenamiento usa la partición oficial de entrenamiento de TinyStories: 20.000 pasos con lotes de 64 secuencias de 256 tokens, es decir, 328 M tokens procesados. Optimizador AdamW (β = 0,9 / 0,95) con lr 0,001, warmup lineal de 1.000 pasos y decaimiento coseno hasta 0,0001, weight decay 0,1 sobre matrices, grad clipping 1,0, autocast en bfloat16 y semilla 0. Se ejecutó en una NVIDIA L4 con PyTorch 2.11.0+cu130 en 0,67 h (121 ms/paso). No se menciona RLHF, DPO ni ninguna fase de ajuste por preferencias: es un modelo base de lenguaje, sin alineamiento.

## Capacidades

- Generación de texto en inglés dentro del registro de cuentos infantiles cortos (narraciones simples, vocabulario reducido, frases cortas).
- Continuación de texto a partir de un *prompt*, con parada en `<|endoftext|>`.
- Modelado de lenguaje puro: permite calcular pérdida y perplejidad sobre texto en inglés como métrica de dominio.
- No soporta tool calling ni function calling.
- No tiene modo *thinking*, razonamiento multi-paso, agentes ni planificación.
- No dispone de capacidades de visión, audio ni multimodalidad.
- Multilingüe: no; únicamente inglés.
- No está ajustado a instrucciones ni a formato de chat: no responde a preguntas, continúa texto.
- Vocabulario cerrado de 4096 tokens BPE orientado a cuentos infantiles.

## Casos de uso

- Ablación controlada de mecanismos de atención: el modelo es una de las cuatro variantes (`causal`, `page cos`, `sigmoid`, `page gauss`) entrenadas con los mismos datos, semilla y lotes, por lo que sirve para medir el efecto aislado del kernel gaussiano sobre la pérdida de validación (1,4944; perplejidad 4,46).
- Docencia e ingeniería didáctica: `modeling.py` implementa atención multi-cabeza causal a mano en PyTorch puro, sin depender de `transformers` ni de kernels fusionados, lo que lo convierte en material adecuado para explicar atención, máscaras causales y decodificación autoregresiva paso a paso.
- Reproducción de recetas de entrenamiento: con `history.json`, hiperparámetros documentados y semilla 0, es posible replicar la curva de pérdida en una GPU de consumo o en una L4 en menos de una hora y validar pipelines de entrenamiento propios.
- Generación de datos sintéticos acotados: producción de cuentos infantiles muy cortos en inglés para aumentar datasets de juguete o para pruebas de *smoke testing* de pipelines de generación, asumiendo la necesidad de filtrado posterior por calidad.
- Modelo de puntuación de perplejidad: al ser un LM entrenado específicamente en TinyStories, puede usarse para puntuar o filtrar corpus de cuentos infantiles por cercanía de dominio, comparando la perplejidad de distintos documentos (con la cautela de que no está calibrado).
- Pruebas de integración y CI: con ~43 MB de pesos en bf16, la carga y la inferencia caben en CPU, lo que permite incluirlo en tests automatizados de tokenización, serialización safetensors y generación sin necesitar GPU.
- Estudio comparativo de tokenizadores: el BPE de 4096 tokens entrenado sobre TinyStories permite analizar el efecto de un vocabulario muy pequeño en la calidad de la generación y en la longitud efectiva de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento).

Los únicos datos de evaluación reportados son de validación sobre la partición oficial de TinyStories, estimados sobre 50 lotes aleatorios:

| Metrica | Valor |
|---|---|
| Pérdida de validación final | 1,4944 |
| Perplejidad de validación final | 4,46 |
| Mejor pérdida de validación | 1,4944 (paso 20.000) |
| Tokens de entrenamiento | 328 M (20.000 pasos x 64 x 256) |

## Requisitos de hardware

- VRAM estimada para inferencia: ~43 MB de pesos en bf16 y ~86 MB en fp32; con activaciones y caché KV para 256 tokens, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquiera; el entrenamiento se realizó en una NVIDIA L4 (24 GB) en 0,67 h. Una RTX 4090, una RTX 3060 o incluso una GPU integrada son suficientes para inferencia.
- Cabe holgadamente en GPU de consumo, y también en CPU: el modelo se puede ejecutar en PyTorch en cualquier portátil actual.
- Opciones de despliegue: al no estar integrado en `transformers`, no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama. El despliegue previsto es cargar `modeling.py` con `safetensors.torch.load_file` y ejecutar `model.generate`. Para usar otros runtimes haría falta portar la arquitectura o exportar los pesos a un formato soportado, cosa que no se ha publicado.
- Latencia y throughput: no se han publicado medidas. Por el tamaño (6 capas, `d_model` 384, contexto 256), la generación en CPU es viable en modo interactivo y en GPU el cuello de botella será el *overhead* de Python más que el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mecanismo de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-2-style-tinystories-page-gauss (este) | 21,55 M (safetensors) | 256 | Page gauss (kernel gaussiano aprendido por cabeza) | no disponible | Safetensors + PyTorch propio |
| analist/GPT-2-style-tinystories-linear | 14,7 M (tamaño de repo 14,7 MB) | no disponible | Lineal | MIT (según la página del repo) | Safetensors + PyTorch |
| GPT-2 small (referencia de la familia) | 124 M | 1024 | Causal estándar | MIT | `transformers`, ampliamente soportado |

La comparación directa más útil es con las otras variantes del mismo autor (`causal`, `page cos`, `sigmoid`, `page gauss`), que comparten tokenizador, datos, semilla y número de pasos; solo la variante `linear` aparece documentada en la búsqueda y con un recuento de parámetros distinto, por lo que no es una comparación iso-paramétrica estricta. Frente a GPT-2 small, este modelo tiene ~6 veces menos parámetros y 4 veces menos contexto, y no se ha evaluado en ninguna tarea downstream, por lo que no hay base para comparar calidad.

## Limitaciones y advertencias

- Ventana de contexto de solo 256 tokens: no admite conversaciones multi-turno, documentos largos ni prompts extensos.
- Entrenado únicamente en TinyStories: el dominio está limitado a cuentos infantiles; fuera de ese registro la calidad se degrada y la perplejidad se dispara.
- Modelo base sin alineamiento: no sigue instrucciones, no rechaza peticiones y puede generar contenido inapropiado o incoherente si se le induce.
- Riesgo alto de alucinación si se usa como fuente de hechos: no tiene conocimiento factual verificable, solo patrones narrativos.
- Solo inglés; no hay soporte multilingüe ni de castellano.
- Vocabulario de 4096 tokens: penaliza palabras poco frecuentes y fuera de dominio.
- Sin datos de sesgo publicados; cabe esperar los sesgos presentes en TinyStories (roles de género estereotipados, ambientación de cuento occidental).
- Licencia no disponible: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Sin integración con `transformers`: requiere código propio, no se beneficia de optimizaciones de ecosistema (atención fusionada, batching continuo) y cualquier port implica reescribir la atención.
- El recuento de parámetros difiere entre la model card (19,1 M) y el fichero safetensors (21,55 M); conviene verificar la configuración efectiva antes de citar cifras.
- Los resultados de validación (perplejidad 4,46) no son transferibles a tareas downstream; no hay ninguna evaluación de calidad generativa más allá de la pérdida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/analist/GPT-2-style-tinystories-page-gauss-2026-10-26
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de referencia (Eldan & Li, 2023): https://arxiv.org/abs/2305.07759
- Variante lineal del mismo autor: https://huggingface.co/analist/GPT-2-style-tinystories-linear-2026-10-22
- Proyecto relacionado, GPT-2 desde cero en PyTorch: https://github.com/AlaaOmar6/GPT2
- Proyecto relacionado, TinyStoriesGPT: https://github.com/jamessinotte/TinyStoriesGPT
