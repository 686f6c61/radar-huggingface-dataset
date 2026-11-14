# Hooshaai/qwen-2.5-0.5b-hamming-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-hamming-attention-wikitext2` es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps "Attention Surgery Zoo". Se trata de un Qwen2.5-0.5B (535.364.728 parametros reales en safetensors) al que se le han sustituido quirurgicamente 18 de sus 24 bloques de atencion por el operador `HammingAttention` de la libreria NeuralOps, seguido de un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2. El modelo no es un modelo de proposito general: es un artefacto de investigacion que demuestra que es posible reemplazar la atencion softmax por atencion dispersa subcuadratica en un transformer pequeno y recuperar gran parte de la calidad mediante destilacion.

La relevancia de este checkpoint es metodologica. Tras la cirugia (sin destilacion) la perplejidad en WikiText-2 se dispara a 392.424,85; tras las dos etapas de destilacion baja a 144,38, todavia muy lejos del profesor original (15,38). El autor documenta el protocolo completo, la topologia hibrida 3:1 (18 capas transplantadas, 6 capas GQA nativas conservadas como anclas) y el uso de cache offline de representaciones para entrenar sin mantener el profesor en VRAM (0 MB de VRAM de profesor, RTX 3090 de 24 GB).

El modelo se distribuye con licencia MIT, solo soporta ingles declarado, y esta pensado para experimentacion con atencion subcuadratica, no para produccion. Su valor esta en servir como referencia reproducible de "attention surgery" sobre una base Qwen2.5 conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 hibrido: 18/24 capas con `HammingAttention` (sparse, subcuadratica) + 6/24 capas con GQA softmax nativa |
| Parametros totales | 535.364.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base Qwen2.5-0.5B; evaluado a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,18 MB, mas adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |
| Modelo base | Qwen/Qwen2.5-0.5B (494M params, 24 capas, D=896, H_q=14, H_kv=2, d_h=64) |
| Libreria | neuralops |
| Dataset de destilacion | Salesforce/wikitext (wikitext-2-raw-v1) |
| Topologia de cirugia | `hybrid_3_1`: capas transplantadas [0,1,2,4,5,6,8,9,10,12,13,14,16,17,18,20,21,22]; anclas GQA nativas [3,7,11,15,19,23] |
| RoPE | Si, theta = 1.000.000 |
| Soporte causal | Si |
| Dispatch de kernel | CUDA / Triton / PyTorch (3 niveles) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder denso con 24 capas, dimension oculta 896, 14 cabezas de consulta y 2 cabezas KV (GQA), con RoPE configurado a theta 1.000.000. Sobre esa base, NeuralOps aplica una "cirugia de atencion" determinista con ratio 3:1: 18 capas usan el operador `HammingAttention` (familia sparse, con soporte causal autoregresivo y manejo de GQA) envuelto en `QwenAttentionAdapter`, y 6 capas (indices 3, 7, 11, 15, 19, 23) conservan la atencion softmax GQA original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` preentrenados del profesor, con expansion de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas, para evitar el colapso de proyecciones no inicializadas.

El entrenamiento consiste en una destilacion de representaciones ocultas en dos etapas sobre WikiText-2, ejecutada en una RTX 3090 de 24 GB con cache offline de representaciones del profesor (0 MB de VRAM de profesor). La etapa 1 (30% del presupuesto, 109 pasos) congela el backbone y entrena solo modulos de atencion y layer norms, con pesos maestros FP32, AMP FP16 con GradScaler, AdamW (lr 2.0e-4, weight decay 0.01, gradient clipping 1.0) y una perdida por capa de MSE + 0.25 * (1 - coseno(h_s, h_t)). La etapa 2 (70% del presupuesto, 248 pasos) realiza destilacion end-to-end de representaciones con una perdida de alineacion por capas mas estricta.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, heredada de la base Qwen2.5-0.5B.
- Atencion causal con enmascaramiento autoregresivo en las capas `HammingAttention` (soporte explicito declarado).
- Manejo de GQA y RoPE en las capas transplantadas, con dispatch de kernel CUDA/Triton/PyTorch.
- Razonamiento y codigo basicos heredados del modelo base, aunque degradados por la perplejidad resultante (144,38 frente a 15,38 del profesor).
- Soporte de tool calling / function calling: no disponible de forma verificada en esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma verificada en esta variante.
- Capacidades multilingues: limitadas al ingles declarado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en atencion subcuadratica: usar el checkpoint como referencia reproducible para medir el coste en calidad de sustituir softmax por atencion dispersa Hamming en un transformer pequeno, comparando la perplejidad pre y post destilacion.
- Reproduccion de experimentos de "attention surgery": servir de base para replicar el protocolo de dos etapas con cache offline de representaciones en una unica GPU de 24 GB.
- Benchmark de operadores NeuralOps: validar el correcto funcionamiento del operador `hamming_attention` y del `QwenAttentionAdapter` en pipelines de la libreria neuralops.
- Estudio de destilacion de representaciones ocultas: analizar la recuperacion del 99,96% de la perplejidad perdida tras la cirugia mediante MSE + coseno por capa.
- Prototipado de bajo coste en ingles: generar texto exploratorio en tareas donde una perplejidad de 144 sea aceptable y se priorice el reducido tamano del modelo (535M parametros, ~1 GB en FP16).
- Docencia y divulgacion: ilustrar de forma tangible el impacto de reemplazar mecanismos de atencion en modelos compactos, con telemetria publicada y verificable.
- Pruebas de despliegue con kernels CUDA/Triton: evaluar el dispatch de tres niveles en entornos con y sin GPU compatible.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`), medidos en el split de validacion de WikiText-2 a longitud de secuencia 512, batch_size 8, grad_accum 4, en una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante zero-shot pre-KD | 392.424,85 | Inmediatamente tras transplantar 18/24 capas |
| Perplejidad del estudiante post-KD | 144,38 | Tras destilacion de representaciones en 2 etapas |
| Delta absoluto de perplejidad | -392.280,47 | Cambio logrado por destilacion |
| Reduccion relativa de perplejidad | 99,96% | Recuperacion respecto al pico post-cirugia |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB de pesos (1021,18 MB) mas overhead de activaciones y cache KV; en la practica, holgado en cualquier GPU consumer con 4 GB o mas.
- Cuantizacion: no se publican pesos GGUF ni INT8/INT4; habria que generarlos a partir de los safetensors FP16.
- GPU recomendadas: RTX 3090 (usada por el autor para el entrenamiento), RTX 4090, A100, H100; cualquier GPU consumer moderna es suficiente por tamano.
- Cabe en GPU consumer: si, incluidas GTX 1660, RTX 3060 y superiores, dado el reducido tamano.
- Opciones de despliegue: la libreria `neuralops` es la via natural; al ser una arquitectura hibrida con operador propio, no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin adaptar el operador `HammingAttention`.
- Latencia y throughput: no disponible. El autor solo reporta tiempos de entrenamiento (109 + 248 pasos en RTX 3090), no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-hamming-attention-wikitext2 | 535.364.728 | no disponible (evaluado a 512) | 144,38 (post-KD, no verificado) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | ~494M | 32.768 tokens (segun ficha oficial de Qwen) | 15,38 (referencia del autor) | Apache 2.0 (segun ficha oficial de Qwen) | Hugging Face |
| Otros checkpoints del Attention Surgery Zoo (NeuralOps) | no disponible | no disponible | no disponible | MIT | Hugging Face |
| Modelos de 0,5B con atencion lineal/dispersa comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas relevante es contra el profesor Qwen2.5-0.5B: mismo parametraje base, pero el checkpoint destilado multiplica por mas de nueve la perplejidad en WikiText-2. El resto de alternativas de la misma categoria (transformers pequenos con atencion subcuadratica) no estan documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad muy superior al modelo base (144,38 frente a 15,38): la calidad de generacion esta degradada de forma sustancial y no es apta para produccion.
- Solo ingles declarado; no hay evidencia de capacidades multilingues.
- Longitud de contexto efectiva no documentada; la evaluacion se limita a secuencias de 512 tokens.
- Resultados de benchmarks marcados como `verified: false`; no han sido replicados de forma independiente.
- Riesgo elevado de alucinacion y de texto incoherente por la degradacion tras la cirugia y la destilacion parcial.
- Dependencia de la libreria `neuralops` y del operador `hamming_attention`: no es un checkpoint plug-and-play en ecosistemas estandar (transformers, vLLM, llama.cpp).
- No se publican pesos cuantizados; el despliegue en entornos con poca memoria requiere conversion manual.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 segun su ficha oficial) que debe respetarse en la medida en que aplique.
- Sesgos: no documentados por el autor; hereda los del corpus WikiText-2 y los del modelo base.
- Proyecto de investigacion con 327 descargas y 0 likes en el momento de la consulta; sin garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-hamming-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/hamming_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
