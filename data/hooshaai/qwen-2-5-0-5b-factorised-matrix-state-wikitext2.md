# Hooshaai/qwen-2.5-0.5b-factorised-matrix-state-wikitext2

## Resumen

El modelo `qwen-2.5-0.5b-factorised-matrix-state-wikitext2`, publicado por el usuario Hooshaai bajo el paraguas del proyecto NeuralOps, es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente 18 de las 24 capas de atencion del decoder por el operador `factorised_matrix_state` (Factorised Matrix State Recurrent Linear Attention) de la libreria NeuralOps. El objetivo no es producir un modelo listo para produccion, sino servir como banco de pruebas reproducible ("attention surgery zoo") para estudiar la viabilidad de sustituir atencion softmax cuadratica por alternativas lineales/subcuadraticas en modelos causales compactos, manteniendo un 25% de capas con GQA nativa como anclas de recuperacion global.

Tras el transplante, el modelo colapsa (perplejidad de 420.412,82 en WikiText-2) y se recupera parcialmente mediante un proceso de destilacion de representaciones ocultas en dos etapas sobre WikiText-2, alcanzando una perplejidad de 343,56 en el split de validacion. La referencia del profesor (Qwen2.5-0.5B original) es de 15,38, por lo que la brecha cualitativa sigue siendo enorme: este checkpoint documenta un experimento de investigacion, no un modelo usable para generacion de texto de calidad.

El interes actual reside en su valor metodologico: demuestra un pipeline completo de cirugia de atencion (herencia de pesos `q/k/v/o_proj`, expansion GQA de 2 a 14 cabezas, adaptador RoPE con theta 1.000.000, dispatch de kernels CUDA/Triton/PyTorch) y cuantifica el coste de recuperacion via destilacion. Con 536,4 millones de parametros reales en safetensors y licencia MIT, es un artefacto pensado para investigadores que quieran replicar o extender el estudio de atencion lineal en LLMs pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder hibrido: 18/24 capas con `factorised_matrix_state` (linear attention recurrente) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 536.396.668 (segun safetensors); 494M segun la model card para el base Qwen2.5-0.5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen2.5-0.5B soporta hasta 32.768 tokens; la evaluacion se hizo a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1023,15 MB, mas adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador); libreria `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (24 capas, dimension oculta D=896, 14 cabezas de query, 2 cabezas KV, dimension de cabeza 64) y aplica una topologia `hybrid_3_1`: las capas con indices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan el operador `FactorisedMatrixState` envuelto en `QwenAttentionAdapter`, mientras que [3, 7, 11, 15, 19, 23] conservan la atencion GQA softmax preentrenada como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 y una unica `o_proj` sin duplicacion. El adaptador gestiona RoPE con theta 1.000.000 y ofrece dispatch de kernels en tres niveles (CUDA, Triton, PyTorch).

El entrenamiento consiste en una destilacion de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una unica RTX 3090 de 24 GB con 0 MB de VRAM de profesor gracias al cacheado offline de representaciones. La etapa 1 (30% del presupuesto, 66 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo modulos de atencion y layernorms con AdamW (lr 2.0e-4, weight decay 0.01, grad clipping 1.0), minimizando MSE por capa mas 0.25 veces (1 - coseno). La etapa 2 (70%, 156 pasos) hace destilacion end-to-end sobre los 24 flujos residuales con lr 6.0e-5 y peso coseno 0.50. No se reporta RLHF ni DPO.

## Capacidades

- Generacion de texto causal autoregresiva, heredada estructuralmente de Qwen2.5-0.5B.
- Soporte de atencion causal con GQA en las capas ancla y atencion lineal recurrente en las capas transplantadas.
- Capacidad bilingue: no disponible; la model card solo declara ingles.
- Tool calling / function calling: no disponible (no se documenta en la model card).
- Razonamiento multi-paso y agentes: no disponible; el checkpoint no esta validado para estos usos.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.
- Valor experimental: permite estudiar el comportamiento de atencion lineal subcuadratica en un LLM compacto con anclas softmax.

## Casos de uso

- Investigacion en atencion lineal: usar el checkpoint como referencia reproducible para medir el impacto de sustituir atencion softmax por `factorised_matrix_state` en un decoder de 24 capas, comparando perplejidad pre y post-destilacion.
- Replicacion de pipelines de cirugia de atencion: el repositorio documenta indices de capas, herencia de pesos y expansion GQA, lo que permite reproducir el experimento con otros ratios hibridos (por ejemplo 2:1 o 4:1) sobre Qwen2.5-0.5B.
- Estudio de destilacion de representaciones ocultas: las dos etapas (subspace alignment y end-to-end) sirven como plantilla para entrenar estudiantes con profesor cacheado en GPUs consumer de 24 GB.
- Benchmarking de kernels: util para comparar latencia y throughput del dispatch CUDA/Triton/PyTorch del operador `FactorisedMatrixState` frente a GQA softmax en la misma topologia.
- Docencia y formacion: ejemplo didactico de como una intervencion arquitectonica degrada un modelo (PPL de 15,38 a 420.412,82) y como la destilacion recupera el 99,92% de la brecha en escala logaritmica.
- Analisis de robustez de anclas softmax: permite estudiar por que 6 capas GQA nativas son suficientes para evitar el colapso total del modelo y como varia la perplejidad al cambiar su posicion.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal, WikiText-2 validacion |
| Perplejidad del estudiante zero-shot tras cirugia | 420.412,82 | Inmediatamente tras transplantar 18/24 capas |
| Perplejidad del estudiante post-destilacion | 343,56 | Tras destilacion en dos etapas |
| Delta absoluto de perplejidad | -420.069,27 | Cambio logrado por la destilacion |
| Reduccion relativa de perplejidad | 99,92% | Recuperacion respecto al pico post-cirugia |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB de pesos (1023,15 MB) mas overhead de activaciones y cache KV, en torno a 2-3 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: no disponible (no se publican pesos cuantizados).
- VRAM estimada en cuantizacion de 4 bits: no disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor uso una NVIDIA GeForce RTX 3090 (24 GB) para el entrenamiento.
- Cabe en GPUs consumer: si, en RTX 3060 12 GB, RTX 4060, RTX 4090 y similares con margen amplio.
- Opciones de despliegue: la libreria `neuralops` es el runtime de referencia; vLLM, llama.cpp, Ollama y TGI no soportan el operador `factorised_matrix_state` de forma nativa, por lo que no son opciones directas sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Hooshaai/qwen-2.5-0.5b-factorised-matrix-state-wikitext2 | 536M | no disponible (evaluado a 512) | 343,56 (post-KD) | MIT | Hugging Face, runtime `neuralops` |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face, amplio ecosistema |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | no disponible | Apache 2.0 | Hugging Face, amplio ecosistema |
| Modelos lineales pequenos (p. ej. variantes Mamba-130M) | ~130M | no disponible | no disponible | Apache 2.0 / MIT | Hugging Face |

La comparativa directa con alternativas lineales de la misma escala es limitada porque el autor no publica perplejidades de referencia de otros operadores subcuadraticos sobre Qwen2.5-0.5B. La diferencia de perplejidad frente al profesor (343,56 frente a 15,38) es el dato mas relevante para contextualizar el estado del experimento.

## Limitaciones y advertencias

- Perplejidad muy elevada: 343,56 frente a 15,38 del profesor indica que la calidad de generacion es muy inferior a la del modelo base; no es apto para produccion.
- Sesgos: no documentados, pero hereda los sesgos del corpus WikiText-2 y de Qwen2.5-0.5B; no se ha realizado evaluacion de sesgos.
- Riesgo de alucinacion: alto, coherente con la degradacion de perplejidad y con la ausencia de ajuste por RLHF o DPO.
- Limitacion idiomatica: solo se declara ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Limitacion de contexto: la evaluacion se hizo a longitud 512; no se documenta el comportamiento a contextos largos ni si el operador lineal preserva la ventana de 32.768 tokens del base.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B es Apache 2.0; conviene revisar la compatibilidad y atribuciones.
- Dependencia del runtime `neuralops`: no hay soporte en ecosistemas estandar (transformers, vLLM, llama.cpp), lo que dificulta el despliegue fuera del stack del autor.
- Reproducibilidad: el autor declara entrenamiento en una unica RTX 3090 con 0 MB de VRAM de profesor, pero no se publican semillas, checkpoints intermedios ni scripts de evaluacion independientes.
- Metricas no verificadas: la model card marca la perplejidad como `verified: false`; no hay validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-factorised-matrix-state-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador `factorised_matrix_state`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/factorised_matrix_state.py
- Licencia MIT del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
