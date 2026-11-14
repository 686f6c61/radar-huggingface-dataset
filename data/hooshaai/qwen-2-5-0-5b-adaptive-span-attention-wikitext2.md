# Hooshaai/qwen-2.5-0.5b-adaptive-span-attention-wikitext2

## Resumen

Este checkpoint es el resultado de una intervención arquitectónica sobre `Qwen/Qwen2.5-0.5B`, un modelo causal de lenguaje de 494M parametros desarrollado originalmente por Alibaba Qwen. El autor, Hooshaai, ha sustituido 18 de las 24 capas de atención del decoder (un 75%, siguiendo un patron hibrido 3:1) por el operador `AdaptiveSpanAttention` de la libreria NeuralOps, conservando las 6 capas restantes con la atención GQA original de Qwen2 como anclas de enrutamiento global. Posteriormente aplica una destilacion de conocimiento en dos etapas sobre WikiText-2 para recuperar capacidad predictiva.

El modelo se enmarca en el proyecto "Attention Surgery Zoo" de NeuralOps, una iniciativa de investigacion que explora la sustitucion de mecanismos de atención cuadraticos por operadores subcuadraticos en modelos compactos, con el objetivo de reducir el coste computacional de la inferencia sin reentrenar desde cero. La relevancia actual reside en que documenta de forma transparente el coste empirico de esta cirugia: la perplejidad en WikiText-2 pasa de 15,38 en el modelo profesor a 291,76 tras la destilacion, lo que evidencia tanto la viabilidad tecnica del transplante como la magnitud del deterioro que introduce.

El modelo tiene 535.364.476 parametros reales segun los pesos safetensors, ventana de contexto heredada de la arquitectura base, licencia MIT y esta orientado exclusivamente al ingles. No es un modelo listo para produccion: es un artefacto de investigacion que sirve para estudiar el comportamiento de la atención de span adaptativo en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido: 18/24 capas con `AdaptiveSpanAttention` (subcuadratica) y 6/24 con GQA softmax nativa de Qwen2 |
| Parametros totales | 535.364.476 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,18 MB) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo mas adaptador) |
| Dimension del modelo | D=896, 24 capas, H_q=14, H_kv=2, d_h=64 |
| RoPE | Si, theta = 1.000.000 |
| Dispatch de kernels | CUDA / Triton / PyTorch (3 niveles) |
| Libreria | neuralops |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B, un transformer decoder-only con 24 bloques, atencion de consultas agrupadas (GQA) con 14 cabezas de consulta y 2 de clave/valor, dimension oculta de 896 y embeddings rotatorios posicionales con theta de 1.000.000. Sobre esa base, NeuralOps aplica una "cirugia" determinista con ratio `hybrid_3_1`: las capas con indices `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` se sustituyen por `AdaptiveSpanAttention` envuelta en un `QwenAttentionAdapter`, mientras que las capas `[3, 7, 11, 15, 19, 23]` conservan la atencion softmax original como anclas de recuperacion global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` preentrenados del profesor, con expansion de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas, lo que evita el colapso de proyecciones no inicializadas.

El entrenamiento consiste en una destilacion de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada con la arquitectura de cacheado offline de representaciones de NeuralOps en una unica RTX 3090 de 24 GB y sin VRAM de profesor en GPU. La etapa 1 (30% del presupuesto, 107 pasos) congela el backbone y entrena solo modulos de atención y layer norms, con pesos maestros FP32, AMP FP16 con `GradScaler`, AdamW (lr=2,0e-4, weight decay 0,01, clipping de gradiente 1,0) y una perdida combinada de MSE por capa mas 0,25 veces el termino `1 - cos(h_s, h_t)`. La etapa 2 (70% del presupuesto, 245 pasos) realiza destilacion de representaciones de extremo a extremo. No se especifica el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de WikiText-2.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, con soporte de mascara causal en el operador de span adaptativo.
- Razonamiento y conocimiento general heredados del profesor Qwen2.5-0.5B, aunque severamente degradados por la cirugia y la destilacion (perplejidad de 291,76 frente a 15,38).
- Soporte de tool calling y function calling: no documentado en la model card; se heredaria, en su caso, del formato de chat de Qwen2.5, pero no hay evidencia empirica de que sobreviva a la intervencion.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni verificadas.
- Capacidades multilingues: limitadas al ingles segun la model card, pese a que el modelo base es multilingue.
- Capacidades especiales: el interes tecnico reside en el propio operador `AdaptiveSpanAttention`, que implementa atención de span adaptativo con soporte de GQA y RoPE, y en el dispatch de kernels a tres niveles (CUDA, Triton, PyTorch). No hay modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre atención subcuadratica: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atención softmax por span adaptativo en un modelo de 0,5B, con telemetria completa de perplejidad antes y despues de la destilacion.
- Experimentos de destilacion de conocimiento: el protocolo en dos etapas (alineamiento de subespacio con backbone congelado y destilacion end-to-end) puede replicarse sobre otros pares profesor-estudiante y otras tareas, usando el checkpoint como linea base.
- Benchmarking de operadores de atención: permite comparar `AdaptiveSpanAttention` frente a GQA softmax en terminos de perplejidad, coste de memoria y velocidad en una RTX 3090, dentro del marco de NeuralOps.
- Pruebas de integracion de la libreria NeuralOps: valida el flujo de registro de operadores (`ATTENTION_REGISTRY`), el adaptador `QwenAttentionAdapter` y la serializacion determinista de pesos en un caso real.
- Estudio de degradacion por cirugia arquitectonica: cuantifica la caida de calidad (de 15,38 a 12.019,39 de perplejidad zero-shot, recuperada al 97,57% relativo tras destilacion) y sirve para calibrar expectativas en proyectos de optimizacion de atención.
- Docencia y divulgacion: ejemplo didactico de como se compone un transformer hibrido, como se heredan pesos entre mecanismos de atención distintos y como se mide la recuperacion mediante destilacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validacion de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, `batch_size=8` y `grad_accum=4` sobre una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor |
|---|---:|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad del estudiante zero-shot tras la cirugia (pre-KD) | 12.019,39 |
| Perplejidad del estudiante tras destilacion (post-KD) | 291,76 |
| Delta absoluto de perplejidad | -11.727,63 |
| Reduccion relativa de perplejidad | 97,57% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB solo para pesos (1021,18 MB), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor valido el entrenamiento en una NVIDIA GeForce RTX 3090 de 24 GB, y la inferencia es viable en RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas con al menos 4-6 GB de VRAM, y potencialmente en CPU.
- Opciones de despliegue: la libreria `neuralops` es la via natural, dado que el operador `AdaptiveSpanAttention` requiere sus kernels CUDA/Triton/PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y es poco probable sin portar el operador.
- Latencia y throughput: no disponibles. La motivacion del operador subcuadratico es reducir el coste asintotico en contextos largos, pero no se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/qwen-2.5-0.5b-adaptive-span-attention-wikitext2 | 535M | no disponible | 291,76 (post-KD) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32.768 tokens (segun especificacion de Qwen2.5) | 15,38 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (segun especificacion de Qwen2.5) | no disponible | Apache 2.0 | Hugging Face |

La comparacion directa con el profesor es la mas informativa: mismo origen de pesos, misma tokenizacion y mismo dataset de evaluacion, con una diferencia de perplejidad de mas de un orden de magnitud. Frente a otros modelos de 0,5B con atención estandar, este checkpoint no compite en calidad sino en interes arquitectonico.

## Limitaciones y advertencias

- Calidad predictiva muy degradada: la perplejidad post-destilacion (291,76) es aproximadamente 19 veces la del profesor (15,38), lo que se traduce en generaciones incoherentes o repetitivas en uso real.
- Perplejidad zero-shot tras la cirugia de 12.019,39: sin la destilacion, el modelo es practicamente inutilizable; la recuperacion del 97,57% relativo no equivale a paridad con el profesor.
- Entrenado y evaluado unicamente en WikiText-2, un corpus de articulos enciclopedicos en ingles; el dominio y el registro son muy limitados.
- Solo ingles declarado, pese a que el modelo base es multilingue; no hay evidencia de que las capacidades multilingues sobrevivan.
- Riesgo elevado de alucinacion y de texto sin sentido por la degradacion de las representaciones internas.
- No hay datos publicados sobre sesgos; al derivar de Qwen2.5-0.5B, hereda los sesgos del corpus de preentrenamiento original, potencialmente amplificados por la destilacion.
- Compatibilidad de despliegue restringida: requiere la libreria `neuralops` y sus kernels; no es plug-and-play con stacks estandar como vLLM o llama.cpp.
- Resultados de benchmarks declarados por el autor y marcados como no verificados (`verified: false`); no han sido reproducidos de forma independiente.
- La licencia MIT del checkpoint es permisiva, pero conviene revisar la licencia del modelo base (Apache 2.0) y las condiciones de la libreria NeuralOps para uso comercial.
- No apto para produccion: es un artefacto de investigacion sobre operadores de atención, no un modelo de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-adaptive-span-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `AdaptiveSpanAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/adaptive_span_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
