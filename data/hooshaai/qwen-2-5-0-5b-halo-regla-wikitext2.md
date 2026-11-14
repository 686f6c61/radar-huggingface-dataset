# Hooshaai/qwen-2.5-0.5b-halo-regla-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-halo-regla-wikitext2` es un checkpoint experimental de investigación publicado por el usuario Hooshaai dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de un transplante quirúrgico del modelo base `Qwen/Qwen2.5-0.5B` en el que 18 de las 24 capas de atención del decoder (disposición híbrida 3:1) han sido sustituidas por el operador `halo_regla` (`HALOReGLAAttention`), una atención híbrida que combina softmax densa con atención lineal con compuerta rectificada. Sobre esa arquitectura modificada se aplicó una destilación de conocimiento en dos etapas sobre WikiText-2.

El modelo no es un modelo de producción: es un artefacto de ablación que documenta el efecto de sustituir atención cuadrática por atención subcuadrática en un transformer pequeño. Su relevancia es metodológica, no de rendimiento: sirve para estudiar la viabilidad de operadores de atención lineales en LLM compactos y para reproducir el protocolo de cirugía de atención del proyecto NeuralOps.

El resultado empírico es contundente y negativo: la perplejidad en validación de WikiText-2 pasa de 15,38 en el profesor a 469.420,98 en el estudiante, y la destilación no logra reducirla (delta de +0,00). El modelo, por tanto, debe interpretarse como una pieza de telemetría experimental sobre el fallo de un transplante de atención, no como un generador de texto utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 con atencion hibrida: 18/24 capas con `HALOReGLAAttention` (`halo_regla`) y 6/24 capas con GQA softmax nativa |
| Parametros totales | 494M (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (evaluado a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible; pesos publicados en FP16 completo (1021,81 MB) mas adaptador |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors FP16 (pesos completos) + adaptador; libreria `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas de decoder, dimension oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimension por cabeza 64, con RoPE (theta = 1.000.000). Sobre esa base se aplica una "cirugía de atención" determinista con ratio `hybrid_3_1`: las capas en los índices `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` usan `HALOReGLAAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas `[3, 7, 11, 15, 19, 23]` conservan la atención GQA softmax preentrenada como anclas de enrutamiento contextual global.

El operador `halo_regla` fusiona dos flujos paralelos mediante una compuerta aprendida por cabeza: atención softmax densa (causal, con padding y KV-cache) y atención lineal con rectificación ELU+1 (prefill O(N), decode O(1)). La caché resultante es una tupla `(K_dense, V_dense, linear_state)` donde `linear_state` es `(S_mat, Z_vec)`. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14, evitando proyecciones sin inicializar.

El entrenamiento consistió en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 105 pasos) congela el backbone y entrena solo módulos de atención y layer norms, con AdamW (lr=2.0e-4, weight decay 0.01, grad clipping 1.0) y objetivo MSE por capa más 0.25·(1 − coseno) entre estados ocultos. La etapa 2 (70% del presupuesto) realiza destilación end-to-end de representaciones; la información disponible se corta en ese punto.

## Capacidades

- Generación de texto causal autoregresiva (heredada de la interfaz Qwen2), aunque con calidad degradada de forma severa según las métricas declaradas.
- Soporte de atención causal con GQA y RoPE a través del adaptador `QwenAttentionAdapter`.
- Decodificación con KV-cache híbrida: caché densa más estado recurrente lineal (`S_mat`, `Z_vec`).
- Dispatch de kernels a tres niveles: CUDA, Triton y PyTorch.
- Capacidad multilingüe: solo inglés declarado (`language: en`).
- No se documentan tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad de servir como referencia reproducible para ablaciones de atención subcuadrática.

## Casos de uso

- Investigación sobre atención subcuadrática: reproducir la cirugía `hybrid_3_1` y medir el impacto de sustituir atención softmax por `halo_regla` en un transformer de 0,5B, usando el checkpoint como punto de comparación publicado.
- Estudio de protocolos de destilación: analizar por qué la destilación de representaciones en dos etapas no recupera la perplejidad del profesor y usar el artefacto como caso de fallo documentado.
- Benchmarking de kernels: validar el dispatch CUDA/Triton/PyTorch del operador `halo_regla` y la caché híbrida en hardware consumer (RTX 3090).
- Desarrollo de la librería NeuralOps: servir de fixture de integración para `QwenAttentionAdapter` y el registro `ATTENTION_REGISTRY`.
- Docencia y divulgación: ilustrar de forma cuantitativa qué ocurre al transplantar atención lineal en un modelo preentrenado sin reentrenamiento completo.
- Auditoría de model cards: ejemplo de telemetría transparente que reporta un resultado negativo sin maquillarlo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`), medidos en el split de validación de WikiText-2 a longitud de secuencia 512, batch size 8 y grad accum 4, sobre una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor |
|---|---:|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad del estudiante zero-shot tras la cirugía (pre-KD) | 469.420,98 |
| Perplejidad del estudiante tras destilación (post-KD) | 469.420,98 |
| Delta absoluto de perplejidad | +0,00 |
| Reducción relativa de perplejidad | 0,00% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para los pesos (1021,81 MB) más el adaptador y las activaciones; holgado en cualquier GPU consumer moderna.
- La evaluación declarada se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB; el modelo cabe sobradamente en GPUs de 4-8 GB en FP16.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para experimentación; cualquier GPU consumer con al menos 4 GB para inferencia básica.
- Despliegue: la librería requerida es `neuralops` (no estándar en vLLM, llama.cpp, Ollama ni TGI según la información disponible); el dispatch de kernels cubre CUDA, Triton y PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada. La atención lineal ofrece prefill O(N) y decode O(1) en las capas transplantadas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-halo-regla-wikitext2` | 494M | no disponible | 469.420,98 (post-KD) | MIT | Hugging Face, libreria `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens (según ficha oficial de Qwen) | 15,38 (medido por el autor) | Apache 2.0 | Hugging Face, ecosistema estandar |
| Alternativas de atención lineal / híbrida de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra su propio profesor: el transplante multiplica la perplejidad por un factor superior a 30.000 y la destilación no recupera nada. No se dispone de datos de otros modelos de atención subcuadrática comparables en la información proporcionada.

## Limitaciones y advertencias

- Calidad de generación inutilizable: perplejidad de 469.420,98 frente a 15,38 del profesor; el texto generado no es fiable.
- La destilación en dos etapas no produjo ninguna mejora medible (delta de perplejidad +0,00, reducción relativa 0,00%), lo que sugiere un fallo en el protocolo o una incompatibilidad del transplante.
- Solo inglés declarado; sin cobertura multilingüe documentada.
- Sin datos publicados sobre sesgos, alucinación o robustez; al ser un artefacto experimental, no se han realizado evaluaciones de seguridad.
- Licencia MIT, lo que permite uso comercial a nivel legal, pero el estado del modelo desaconseja cualquier despliegue en producción.
- Dependencia de la librería `neuralops`, no integrada en los runners de inferencia habituales; la portabilidad a vLLM, llama.cpp u Ollama no está documentada.
- Métricas marcadas como no verificadas (`verified: false`) y procedentes del propio autor.
- La model card está truncada en la descripción de la etapa 2 de destilación, por lo que el protocolo completo no es reproducible a partir de la información disponible.
- Fecha de creación declarada en 2026, lo que conviene contrastar antes de citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-halo-regla-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `halo_regla`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/halo_regla.py
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
