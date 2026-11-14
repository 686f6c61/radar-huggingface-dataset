# Hooshaai/qwen-2.5-0.5b-fused-svd-kernel-wikitext2

## Resumen

`qwen-2.5-0.5b-fused-svd-kernel-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps "Attention Surgery Zoo". Se trata de un derivado de `Qwen/Qwen2.5-0.5B` en el que 18 de las 24 capas de atención del decoder han sido sustituidas por el operador `FusedSVDKernelAttention` (clave de registro `fused_svd_kernel`), una atención lineal basada en SVD y kernel que busca reducir la complejidad cuadrática del mecanismo de atención clásico. Las 6 capas restantes conservan la atención GQA softmax original de Qwen2 para preservar el enrutamiento contextual global.

El modelo no es un modelo de propósito general listo para producción: es un artefacto de investigación que demuestra la viabilidad de la cirugía de atención ("attention surgery") seguida de destilación de conocimiento en dos etapas sobre WikiText-2. El resultado medido es una perplejidad de 364,46 en el split de validación de WikiText-2, frente a los 15,38 del modelo profesor original, lo que refleja una degradación sustancial pero controlada tras la sustitución de capas.

Su relevancia es metodológica: documenta con telemetría detallada el proceso de transplantar operadores de atención subcuadráticos en un transformer preentrenado, el protocolo de destilación empleado y los artefactos empaquetados. Es útil para investigadores que estudien atención lineal, destilación de representaciones ocultas o técnicas de sustitución de capas en modelos compactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con `FusedSVDKernelAttention` (atención lineal SVD+kernel) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 533.299.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens; el autor no declara contexto propio) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1017,23 MB, más un adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (494M parámetros, 24 capas, dimensión oculta D=896, 14 cabezas de query, 2 cabezas KV, dimensión por cabeza 64, RoPE con theta=1.000.000). Sobre esa base se aplica una cirugía determinista con ratio `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se sustituyen por `FusedSVDKernelAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] mantienen la atención GQA softmax preentrenada como anclas de recuperación global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación. El operador soporta decodificación causal autorregresiva, manejo de GQA y despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB mediante la arquitectura de caché offline del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 129 pasos) congela el backbone y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), pesos maestros FP32 con AMP FP16 y GradScaler, minimizando MSE por capa más 0.25·(1−coseno). La etapa 2 (70% del presupuesto, 296 pasos) hace destilación end-to-end sobre los 24 flujos residuales con pérdida MSE + 0.50·(1−coseno) y lr=6.0e-5. Tras la cirugía, la perplejidad zero-shot del estudiante era de 821.427,41; tras la destilación bajó a 364,46, una reducción relativa del 99,96% respecto al pico post-cirugía.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Conversación multi-turno básica (tag `conversational`), aunque degradada por la pérdida de calidad respecto al profesor.
- Razonamiento y conocimiento general limitados por el tamaño (0,5B) y por la brecha de perplejidad frente al original.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües: solo inglés declarado.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.
- Valor como artefacto de investigación: permite reproducir y auditar el efecto de la sustitución de atención sobre las representaciones internas.

## Casos de uso

- Investigación en atención lineal: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atención softmax por operadores subcuadráticos en un transformer compacto, comparando la perplejidad post-cirugía (821.427,41) con la post-destilación (364,46).
- Estudio de destilación de representaciones ocultas: el protocolo de dos etapas y la telemetría publicada permiten replicar experimentos de alineación de estados ocultos con pérdidas MSE + coseno en modelos de 0,5B.
- Benchmarking de kernels de atención: al soportar despacho CUDA / Triton / PyTorch, el modelo permite comparar latencia y corrección numérica de distintas implementaciones del mismo operador.
- Validación de pipelines de "attention surgery": útil para probar herramientas de sustitución de capas y herencia de pesos (`q_proj`, `k_proj`, `v_proj`, `o_proj`) antes de aplicarlas a modelos mayores.
- Docencia y divulgación: ejemplo concreto y documentado de cómo una cirugía agresiva degrada la perplejidad y cómo la destilación recupera parte del rendimiento.
- Pruebas de integración con la librería NeuralOps: el checkpoint valida la carga, serialización determinista y ejecución del operador `fused_svd_kernel` en un modelo Qwen2 real.
- Prototipado de bajo coste en inglés: generación de texto simple en entornos con recursos limitados, asumiendo la calidad degradada frente al modelo base.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad zero-shot del estudiante (pre-destilación) | 821.427,41 | Inmediatamente tras el transplante de 18/24 capas |
| Perplejidad post-destilación del estudiante | 364,46 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | −821.062,95 | Cambio logrado mediante destilación |
| Reducción relativa de perplejidad | 99,96% | Recuperación desde el pico post-cirugía |

Medición sobre WikiText-2 (`wikitext-2-raw-v1`, split de validación), longitud de secuencia 512, batch_size=8, grad_accum=4, en una NVIDIA GeForce RTX 3090 de 24 GB. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB solo para pesos (1017,23 MB declarados), más overhead de activaciones y caché KV; en la práctica, unos 2-3 GB para secuencias moderadas.
- Cuantización: no se publican versiones GGUF ni cuantizadas; sería necesario convertir los safetensors FP16 a otros formatos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor validó el entrenamiento en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, siempre que se use FP16 o se convierta a cuantización inferior.
- Opciones de despliegue: la librería declarada es `neuralops`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, y el operador `fused_svd_kernel` requiere el runtime de NeuralOps con despacho CUDA/Triton/PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen-2.5-0.5b-fused-svd-kernel-wikitext2` | 533M | no disponible | 364,46 (validación, seq 512) | MIT | Hugging Face (305 descargas) |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens | 15,38 (validación, seq 512) | Apache 2.0 (según modelo base) | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | 1,5B | 32.768 tokens | no disponible en esta información | Apache 2.0 | Hugging Face |
| `google/gemma-2-2b` | 2,6B | 8.192 tokens | no disponible en esta información | Gemma Terms | Hugging Face |

La comparación directa más relevante es con su propio profesor: el derivado multiplica por aproximadamente 23,7 la perplejidad del original (364,46 frente a 15,38) a cambio de una arquitectura de atención parcialmente lineal. No se dispone de datos de perplejidad comparables para los otros modelos en la información proporcionada, por lo que las celdas correspondientes se dejan como no disponibles.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad post-destilación (364,46) es unas 23,7 veces la del modelo base (15,38); no es apto para producción sin una evaluación adicional.
- El checkpoint es un artefacto de investigación, no un modelo afinado para tareas downstream; no se han publicado evaluaciones en MMLU, HumanEval, GSM8K ni similares.
- Idiomas: solo inglés declarado; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Contexto: el autor no declara una longitud de contexto propia para el modelo modificado; no se debe asumir la ventana de 32.768 tokens del base sin verificación.
- Dependencia de la librería `neuralops` y del operador `fused_svd_kernel`: el despliegue con runtimes estándar (transformers, vLLM) puede no funcionar sin adaptación.
- Riesgo de alucinación elevado por la brecha de perplejidad y por el tamaño reducido del modelo base.
- Sesgos: no se documentan análisis de sesgo; hereda los del corpus de preentrenamiento de Qwen2.5-0.5B y los de WikiText-2.
- Licencia MIT declarada, lo que permite uso comercial, pero conviene verificar la compatibilidad con la licencia del modelo base Qwen2.5-0.5B y con la del repositorio NeuralOps.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- El proceso de destilación se realizó únicamente sobre WikiText-2, lo que puede sobreajustar el modelo a la distribución de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-fused-svd-kernel-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/fused_svd_kernel.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
