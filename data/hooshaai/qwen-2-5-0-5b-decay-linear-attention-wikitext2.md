# Hooshaai/qwen-2.5-0.5b-decay-linear-attention-wikitext2

## Resumen

El modelo `Hooshaai/qwen-2.5-0.5b-decay-linear-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha sustituido quirúrgicamente el mecanismo de atención softmax por un operador de atención lineal con decaimiento exponencial dependiente de datos (`decay_linear_attention`) en 18 de sus 24 bloques decodificadores. Lo publica el usuario Hooshaai dentro del ecosistema NeuralOps "Attention Surgery Zoo", una línea de trabajo centrada en reemplazar capas de atención cuadrática por alternativas subcuadráticas y recuperar capacidad mediante destilación de conocimiento. El objetivo no es producir un modelo listo para producción, sino servir como artefacto de investigación reproducible sobre cirugía de atención y destilación de representaciones ocultas.

Se trata de un transformer causal de aproximadamente 535,6 millones de parámetros totales (494 M según el modelo base declarado), 24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave-valor (GQA), con una topología híbrida 3:1: 18 capas usan atención lineal con decaimiento y 6 capas conservan la GQA softmax original como anclas de recuperación contextual global. El entrenamiento posterior a la cirugía consiste en una destilación de conocimiento en dos etapas sobre WikiText-2, ejecutada en una única RTX 3090 de 24 GB con caché offline de representaciones del profesor.

La relevancia del checkpoint es doble: por un lado, documenta de forma transparente una caída catastrófica de perplejidad tras la sustitución de atención (de 15,38 a 535.483,80) y su recuperación parcial hasta 374,42 mediante destilación, lo que ilustra los límites prácticos de la sustitución directa de operadores de atención en modelos pequeños; por otro, ofrece un punto de partida reproducible para quien quiera experimentar con arquitecturas lineales híbridas sin entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only híbrido: 18/24 capas con `DecayLinearAttention` (atención lineal con decaimiento exponencial dependiente de datos) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 535.590.520 (safetensors); 494 M según el modelo base declarado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la ficha no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 completo, 1021,62 MB, más un adaptador) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors (FP16 completo + adaptador); librería `neuralops` |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: 24 bloques decodificadores, dimensión oculta 896, 14 cabezas de consulta, 2 cabezas de clave-valor (GQA), dimensión por cabeza 64 y RoPE con theta 1.000.000. La cirugía NeuralOps reemplaza la atención en los índices de capa `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` por `DecayLinearAttention`, un operador de la familia `gated` que aplica decaimiento exponencial dependiente de los datos sobre el estado recurrente. Las capas `[3, 7, 11, 15, 19, 23]` conservan la GQA softmax preentrenada como anclas de enrutamiento global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida sin duplicación. El adaptador gestiona RoPE y la compatibilidad con GQA, y el kernel tiene despacho en tres niveles (CUDA, Triton y PyTorch).

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), a longitud de secuencia 512, con batch 8 y acumulación de gradiente 4, ejecutada en una RTX 3090 de 24 GB usando caché offline de representaciones del profesor (0 MB de VRAM del profesor en el momento del entrenamiento). La etapa 1 (30 % del presupuesto, 47 pasos) congela embeddings, MLP y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr 2,0e-4, weight decay 0,01, clipping 1,0), minimizando MSE de estados ocultos más 0,25 veces (1 − coseno). La etapa 2 (70 % del presupuesto, 111 pasos) ajusta todas las corrientes residuales con lr 6,0e-5 y un peso de coseno de 0,50, con `lm_head` puenteado. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base.
- Razonamiento y conocimiento general limitados por el tamaño (0,5 B) y por el deterioro de perplejidad tras la cirugía.
- Conversación multi-turno a nivel básico, según el pipeline `text-generation` y la etiqueta `conversational`.
- Atención lineal subcuadrática en 18 de 24 capas, con complejidad potencialmente lineal en la longitud de secuencia (no se publican mediciones de throughput).
- Compatibilidad con GQA y RoPE mediante adaptador, lo que permite reutilizar el tokenizador y el pipeline de Qwen2.5.
- Soporte de tool calling / function calling: no disponible de forma verificada en esta ficha.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma verificada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como punto de partida reproducible para medir el coste real de sustituir atención softmax por atención lineal en modelos pequeños, con telemetría completa de perplejidad antes y después de la destilación.
- Estudio de destilación de representaciones ocultas: el protocolo en dos etapas (alineación de subespacio con backbone congelado y destilación end-to-end) puede replicarse o compararse con otras estrategias sobre el mismo checkpoint.
- Benchmarking de kernels: al disponer de despacho CUDA/Triton/PyTorch, permite comparar latencia y throughput entre backends en una RTX 3090 o GPUs equivalentes.
- Docencia y divulgación: ilustra con cifras concretas (PPL 15,38 → 535.483,80 → 374,42) por qué la cirugía de atención sin reentrenamiento completo degrada el modelo, útil en materiales sobre arquitecturas eficientes.
- Pruebas de integración de la librería NeuralOps: valida la carga de checkpoints con operadores personalizados, el adaptador de atención y la serialización determinista de pesos en pipelines propios.
- Generación de texto de baja exigencia en inglés: tareas de autocompletado o borradores donde la calidad no sea crítica y se priorice experimentar con la arquitectura híbrida.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | GQA softmax causal de referencia |
| Perplejidad del estudiante zero-shot tras la cirugía | 535.483,80 | Inmediatamente después del transplante de 18/24 capas |
| Perplejidad del estudiante tras destilación (2 etapas) | 374,42 | Split de validación de WikiText-2, longitud 512 |
| Delta absoluto de perplejidad | −535.109,38 | Cambio logrado con la destilación |
| Reducción relativa de perplejidad | 99,93 % | Recuperación desde el pico post-cirugía |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB de pesos más overhead de activaciones y KV cache; el repo ocupa 1,3 GB.
- En cuantización de 8 bits: aproximadamente 0,6 GB; en 4 bits: aproximadamente 0,35 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder cargar los pesos en FP16; el autor usó una RTX 3090 de 24 GB para el entrenamiento.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la librería `neuralops` es el entorno nativo; la integración con vLLM, llama.cpp, Ollama o TGI no está documentada y requeriría soporte para el operador `decay_linear_attention`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-decay-linear-attention-wikitext2` | 535,6 M | No disponible | 374,42 (post-KD) | MIT | Hugging Face, librería `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face, transformers, vLLM, llama.cpp |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494 M | 32.768 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face, amplio soporte de runtimes |
| `meta-llama/Llama-3.2-1B` | 1,24 B | 131.072 tokens | No disponible en esta ficha | Llama 3.2 Community License | Hugging Face, amplio soporte de runtimes |

La comparación directa con el profesor es la más informativa: el checkpoint quirúrgico multiplica por más de 24 la perplejidad del original incluso tras la destilación, lo que refleja el coste de sustituir atención en un modelo pequeño sin reentrenamiento completo.

## Limitaciones y advertencias

- Perplejidad muy elevada (374,42 frente a 15,38 del profesor): la calidad de generación es sustancialmente inferior a la del modelo base y no es apta para producción sin un reentrenamiento adicional.
- El checkpoint es un artefacto de investigación sobre cirugía de atención, no un modelo afinado para instrucciones ni para conversación de calidad.
- Solo se declara inglés; no hay evidencia de capacidades multilingües tras la cirugía.
- El contexto efectivo tras la sustitución de 18 capas de atención no está documentado; no debe asumirse la ventana de 32.768 tokens del modelo base.
- Requiere la librería `neuralops` y el operador `decay_linear_attention`; la compatibilidad con runtimes estándar (transformers, vLLM, llama.cpp) no está garantizada.
- Riesgo de alucinación elevado por la degradación de perplejidad y el tamaño reducido del modelo.
- Sesgos: no documentados por el autor; hereda los del corpus WikiText-2 y del preentrenamiento de Qwen2.5, sin auditoría publicada.
- Licencia MIT declarada, lo que permite uso comercial del artefacto, pero la calidad del modelo hace inviable ese uso sin trabajo adicional.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-decay-linear-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/decay_linear_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
