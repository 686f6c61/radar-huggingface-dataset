# Hooshaai/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2

## Resumen

El modelo `qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2` es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de una cirugía de atención sobre `Qwen/Qwen2.5-0.5B`, en la que 18 de las 24 capas del decoder han sido sustituidas por el operador `adaptive_sparse_attention` (atención dispersa adaptativa con top-k dinámico y umbral), manteniendo 6 capas con la atención GQA softmax original de Qwen2 como anclas de recuperación contextual. Posteriormente se aplica una destilación de conocimiento en dos etapas sobre WikiText-2.

El objetivo no es ofrecer un modelo listo para producción, sino servir como banco de pruebas reproducible para investigar atención subcuadrática en modelos causales compactos. La relevancia radica en la telemetría publicada: el autor documenta la perplexity del profesor (15,38), del estudiante tras la cirugía sin destilar (244.977,47) y tras la destilación (2.738,78), lo que ilustra el coste de sustituir atención softmax por atención dispersa y el margen de recuperación vía destilación.

La arquitectura subyacente es un transformer decoder Qwen2 de 494 millones de parámetros, 24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 cabezas KV (GQA), con RoPE (theta = 1.000.000). La licencia es MIT y el modelo solo declara inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 con atención híbrida: 18/24 capas `AdaptiveSparseAttention` y 6/24 capas GQA softmax nativa |
| Parametros totales | 494 M (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero la model card no lo declara para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo más adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | FP16 completo (1021,32 MB) más adaptador; serialización determinista vía NeuralOps |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen2.5-0.5B` (494 M parámetros, 24 capas, D=896, H_q=14, H_kv=2, d_h=64, RoPE con theta 1.000.000). Se aplica una cirugía determinista con ratio `hybrid_3_1`: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `AdaptiveSparseAttention` envuelta en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax preentrenada como anclas de enrutamiento global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida sin duplicados, lo que evita el colapso de proyecciones no inicializadas.

El operador `AdaptiveSparseAttention` implementa top-k dinámico y umbral adaptativo, soporta enmascaramiento causal y bidireccional, RoPE, manejo de GQA y despacho de kernel en tres niveles (CUDA, Triton y PyTorch). El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, batch 8 y acumulación de gradiente 4, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 79 pasos) congela embeddings, MLP y `lm_head`, y entrena solo módulos de atención y layer norms con pesos maestros FP32 y AMP FP16 con `GradScaler`. La model card no detalla la etapa 2 en el fragmento disponible.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención dispersa adaptativa con top-k dinámico y umbral, orientada a reducir el coste cuadrático en secuencias largas.
- Soporte de enmascaramiento causal y bidireccional en el operador de atención.
- Manejo de Grouped-Query Attention con expansión de cabezas KV.
- Integración con RoPE (theta 1.000.000).
- Despacho de kernel en CUDA, Triton y PyTorch.
- Capacidades conversacionales declaradas por el pipeline (`text-generation`, `conversational`), aunque no se documenta ajuste específico de instrucciones en este checkpoint.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito para este checkpoint.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint permite reproducir el experimento de sustituir atención softmax por atención dispersa adaptativa en un transformer causal compacto y medir el impacto en perplexity con la telemetría publicada (profesor 15,38; estudiante post-cirugía 244.977,47; post-destilación 2.738,78).
- Estudio de destilación de representaciones ocultas: sirve para evaluar protocolos de destilación en dos etapas con congelación selectiva de embeddings, MLP y `lm_head`, usando WikiText-2 como conjunto de referencia.
- Benchmark de operadores de atención: al integrarse vía NeuralOps, permite comparar `adaptive_sparse_attention` frente a atención GQA softmax en las mismas 24 capas y con los mismos pesos heredados.
- Pruebas de despliegue en GPU de consumo: con 494 M parámetros y pesos FP16 de ~1 GB, cabe en GPUs de 8 GB o menos y permite iterar experimentos de atención en una sola RTX 3090.
- Validación de topologías híbridas: el layout 3:1 (18 capas dispersas, 6 capas softmax) es un caso de estudio para medir cuántas capas softmax hacen falta como anclas de recuperación contextual en modelos pequeños.
- Docencia y reproducción: por su tamaño reducido y licencia MIT, es adecuado para cursos y talleres sobre cirugía de atención, destilación y evaluación con perplexity.
- No se recomienda como modelo de producción para generación de texto de calidad: la perplexity de 2.738,78 en WikiText-2 está muy lejos de la del profesor (15,38).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Notas |
|---|---:|---|
| Perplexity del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal exacta |
| Perplexity del estudiante zero-shot tras la cirugía (pre-KD) | 244.977,47 | Inmediatamente después del transplante de 18/24 capas |
| Perplexity del estudiante tras destilación (post-KD) | 2.738,78 | Tras destilación de representaciones en dos etapas |
| Delta absoluto de perplexity | -242.238,69 | Cambio logrado mediante destilación |
| Reducción relativa de perplexity | 98,88 % | Recuperación porcentual desde el pico post-cirugía |

Evaluación sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`), split de validación, longitud de secuencia 512, batch 8, acumulación de gradiente 4, en NVIDIA GeForce RTX 3090 de 24 GB. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB de pesos más overhead de activaciones y caché KV; el repo ocupa 1,4 GB.
- GPU recomendadas: NVIDIA RTX 3090 (usada por el autor para la destilación), A100, H100 para entrenamiento o evaluación a mayor escala.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: la librería declarada es `neuralops`, con despacho de kernel CUDA/Triton/PyTorch. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI; la integración con esos motores requeriría adaptar el operador de atención.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2` | 494 M | no disponible | 2.738,78 (post-KD, declarado por el autor) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32.768 tokens (según modelo base) | 15,38 (referencia del autor) | Apache 2.0 (según modelo base) | Hugging Face |
| Alternativas de 0,5B con atención estándar | ~500 M | variable | no disponible | variable | Hugging Face |

No se dispone de datos comparativos con otros modelos de atención dispersa de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Perplexity muy elevada: 2.738,78 frente a 15,38 del profesor, lo que indica una degradación severa de la calidad del lenguaje. No es apto para generación de texto de producción.
- El propio autor documenta un pico de perplexity de 244.977,47 tras la cirugía, lo que evidencia la fragilidad del transplante de atención.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B hereda los sesgos del corpus de preentrenamiento original.
- Riesgo alto de alucinación y de texto incoherente por la degradación de perplexity.
- La longitud de contexto efectiva no está declarada para este checkpoint; el layout híbrido y la atención dispersa pueden alterar el comportamiento en secuencias largas respecto al modelo base.
- Licencia MIT, lo que permite uso comercial, pero la calidad del modelo hace inviable ese uso en la práctica.
- Dependencia de la librería `neuralops` y de su operador `adaptive_sparse_attention`; la portabilidad a otros motores de inferencia no está garantizada.
- Los benchmarks son declarados por el autor (`verified: false`) y no han sido replicados de forma independiente.
- El checkpoint incluye pesos FP16 completos más un adaptador; conviene revisar qué artefacto se carga en cada caso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/adaptive_sparse_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
