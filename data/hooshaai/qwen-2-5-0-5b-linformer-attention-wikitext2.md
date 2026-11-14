# Hooshaai/qwen-2.5-0.5b-linformer-attention-wikitext2

## Resumen

El modelo `Hooshaai/qwen-2.5-0.5b-linformer-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha practicado una "cirugía de atención": 18 de las 24 capas del decoder han sido sustituidas por el operador `LinformerAttention` de la librería NeuralOps, mientras que las 6 restantes conservan la atención GQA softmax original de Qwen2. Lo publica el usuario Hooshaai como parte del "Attention Surgery Zoo" de NeuralOps, un proyecto centrado en sustituir mecanismos de atención por alternativas subcuadráticas.

El objetivo no es producir un modelo de propósito general competitivo, sino servir como artefacto de investigación reproducible: demuestra hasta qué punto una intervención arquitectónica agresiva degrada el modelo y cuánto se puede recuperar mediante destilación de representaciones ocultas en dos etapas sobre WikiText-2. El resultado es un modelo de 487 millones de parámetros con perplejidad de 900,43 en la validación de WikiText-2, frente a los 15,38 del profesor original.

Es relevante ahora porque ejemplifica una línea de trabajo activa en eficiencia de atención (sustituir softmax cuadrática por aproximaciones lineales) y porque publica telemetría completa del proceso de destilación, algo poco habitual. No obstante, la brecha de rendimiento respecto al modelo base es enorme, por lo que su utilidad práctica es limitada fuera del ámbito experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con topología híbrida: 18/24 capas con `LinformerAttention` (lineal) y 6/24 con GQA softmax nativa de Qwen2 |
| Parametros totales | 486.998.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens; no se especifica si la cirugía preserva esta ventana) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 928,94 MB, más un adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

La base es Qwen2.5-0.5B: 24 capas, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza de 64, RoPE con theta=1.000.000. Sobre esa base se aplica una cirugía determinista con ratio `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se reemplazan por `LinformerAttention` envuelta en `QwenAttentionAdapter`, y las capas [3, 7, 11, 15, 19, 23] mantienen la atención softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas.

El operador Linformer reduce la complejidad de la atención de O(n²) a O(n) proyectando las secuencias de claves y valores a una dimensión latente baja. Soporta enmascaramiento causal y GQA, y despacha kernels en tres niveles (CUDA / Triton / PyTorch). Tras la cirugía, la perplejidad zero-shot se dispara a 351.472,92; se recupera parcialmente con destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), a longitud de secuencia 512, batch 8 y acumulación de gradiente 4, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 101 pasos) congela embeddings, MLPs y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr 2e-4, weight decay 0,01, clipping 1,0) minimizando MSE por capa más 0,25·(1 − coseno). La etapa 2 (70% del presupuesto) realiza destilación end-to-end de representaciones; la información disponible se corta en este punto y no detalla hiperparámetros adicionales.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada de la arquitectura Qwen2.
- Enrutamiento contextual global preservado por las 6 capas softmax ancla.
- Soporte de atención causal y GQA en el operador Linformer sustituido.
- Capacidad conversacional declarada en los tags del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento.
- Multilingüismo limitado al inglés según el campo `language`.

## Casos de uso

- Investigación sobre atención lineal: banco de pruebas para medir el impacto de sustituir softmax por Linformer en un modelo pequeño, con telemetría de perplejidad antes y después de la destilación.
- Estudio de destilación de representaciones ocultas: el checkpoint y su protocolo en dos etapas sirven para replicar experimentos de recuperación tras intervenciones arquitectónicas agresivas.
- Comparación de topologías híbridas: permite evaluar el ratio 3:1 (lineal frente a softmax) frente a otras configuraciones del Attention Surgery Zoo de NeuralOps.
- Docencia y divulgación: ejemplo reproducible de cirugía de atención con métricas publicadas y ejecutable en una GPU de consumo.
- Validación de la librería NeuralOps: caso de uso real para probar el adaptador `QwenAttentionAdapter` y el despacho de kernels CUDA/Triton/PyTorch.
- Experimentos de eficiencia en contexto: si la ventana de contexto se preserva, útil para medir el escalado de coste con secuencias largas en un modelo de 0,5B.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal |
| Perplejidad zero-shot tras cirugía (pre-KD) | 351.472,92 | Tras transplantar 18/24 capas |
| Perplejidad tras destilación (post-KD) | 900,43 | WikiText-2 validación, seq len 512 |
| Delta absoluto de perplejidad | −350.572,49 | Mejora lograda por destilación |
| Reducción relativa de perplejidad | 99,74% | Recuperación desde el pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para los pesos (928,94 MB) más overhead de activaciones y caché KV.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- GPU recomendadas para entrenamiento o destilación: la RTX 3090 de 24 GB fue la utilizada por el autor; A100 o H100 no son necesarias para este tamaño.
- Despliegue: la librería es `neuralops`, no `transformers` estándar; requiere el adaptador y el operador Linformer de NeuralOps. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (linformer, post-KD) | 487M | no disponible | 900,43 | MIT | Hugging Face |
| Qwen2.5-0.5B (profesor) | 494M | 32.768 | 15,38 | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | no disponible | Apache 2.0 | Hugging Face |

La comparación con alternativas lineales o híbridas de tamaño similar (por ejemplo, variantes Mamba o RWKV en el rango de 0,5B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa: la perplejidad post-destilación es 58 veces superior a la del profesor (900,43 frente a 15,38), lo que indica una calidad de generación muy inferior.
- El checkpoint es un artefacto de investigación, no un modelo listo para producción.
- Solo soporta inglés según el campo `language`.
- No se especifica si la ventana de contexto de 32.768 tokens del modelo base se mantiene tras la cirugía; asumirla es arriesgado.
- Riesgo elevado de alucinación y texto incoherente derivado de la alta perplejidad.
- Requiere la librería `neuralops` y sus kernels; no es plug-and-play con `transformers`.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable ese escenario sin un reentrenamiento profundo.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Sesgos: no documentados; al entrenarse sobre WikiText-2, hereda los sesgos del corpus y del profesor Qwen2.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-linformer-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de LinformerAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/linformer_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
