# KitsuVp/NeoLLM

## Resumen

NeoLLM es un modelo de lenguaje decoder-only de aproximadamente 84,87 millones de parametros desarrollado por el usuario KitsuVp (KitsuVp/NeoLLM en HuggingFace). Se ha entrenado desde cero sobre el dataset FineWeb-Edu con computo en BF16, completando el entrenamiento en torno a 1 hora y 9 minutos sobre una NVIDIA GeForce RTX 5090. El checkpoint publicado es un estado intermedio de entrenamiento, no una version final, y el modelo se encuentra en desarrollo activo.

Su relevancia no reside en el rendimiento absoluto, sino en su proposito de investigacion: integrar en una unica arquitectura una coleccion de tecnicas recientes de atencion y normalizacion (Leviathan, FAN, MEA, LUCID, XSA, Gated Attention, Hadamard output projection, entre otras) para estudiar como interactuan durante el preentrenamiento. Se trata, por tanto, de un banco de pruebas arquitectonico mas que de un modelo listo para produccion.

La configuracion es compacta: hidden size de 512, 12 capas, 8 cabezas de atencion con 4 cabezas KV (GQA), head dim de 64, intermediate size de 1536 y una longitud de contexto de solo 512 tokens. Usa el tokenizador de LiquidAI/LFM2.5-1.2B-Thinking con 64.402 tokens de vocabulario y weight tying entre embedding de entrada y cabeza LM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, GQA, con modulos personalizados (tag custom_code) |
| Parametros totales | 84.568.008 (dato safetensors); la model card indica 84.873.032 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible en la model card; pesos en bf16, convertibles a GGUF/INT8/INT4 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), requiere custom_code |

Otros datos de configuracion confirmados por el autor: hidden size 512, 12 capas, 8 cabezas de atencion, 4 cabezas KV, head dim 64, intermediate size 1536, vocabulario de 64.402 tokens, weight tying activado, Leviathan activado (d_seed=128, modes=8, knots=16) y JTok/JTok-M desactivados.

Desglose de parametros indicado en la model card: embedding (tied) 32.973.824, no-embedding 51.899.208, total 84.873.032.

## Arquitectura y entrenamiento

NeoLLM es un transformer decoder-only con atencion causal y Grouped-Query Attention (8 cabezas de consulta frente a 4 cabezas KV). El autor describe el modelo como una integracion de tecnicas publicadas recientemente en un solo bloque de atencion y representacion de tokens. Entre los modulos citados estan: Learnable Multipliers para escalares por fila/columna, Leviathan como generador continuo de embeddings de token, Spelling Bee Embeddings con informacion a nivel de caracter, FAN (Fourier Analysis Networks) con canales periodicos coseno/seno, MEA con matrices aprendibles entre cabezas, LUCID con precondicionador triangular inferior sobre V, Affine-Scaled Attention con escalares por cabeza, XSA (Exclusive Self Attention), Directional Routing con K=4 direcciones por cabeza, Gated Attention con puerta sigmoide, Momentum Attention con diferencia causal de Q y K, Interleaved Head Attention, el camino posicional REPO-GRAPE, GOAT priors y una proyeccion de salida Hadamard en lugar de la proyeccion densa. La model card se corta en la seccion de normalizacion, por lo que la lista completa de tecnicas no esta disponible en la informacion proporcionada.

El entrenamiento se realizo desde cero sobre HuggingFaceFW/fineweb-edu en precision BF16, con un coste de computo aproximado de 1 hora y 9 minutos en una RTX 5090. No se indica en la informacion disponible el numero total de tokens procesados, la composicion exacta del dataset, el uso de RLHF/DPO ni el detalle de la receta de optimizacion (mas alla de la mencion de componentes de optimizador/estabilidad). El checkpoint publicado corresponde a un estado intermedio, segun afirma el propio autor.

## Capacidades

- Generacion de texto autoregresiva en ingles, con un limite de contexto muy reducido (512 tokens).
- Modelado causal de lenguaje orientado a investigacion de arquitecturas, no a tareas de usuario final.
- Capacidad multilingue: no disponible; solo se declara ingles (en).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Tecnicas especiales integradas a nivel de arquitectura (Leviathan, Gated Attention, XSA, FAN, entre otras), cuyo efecto practico sobre capacidades no esta cuantificado en la informacion disponible.

## Casos de uso

- Investigacion en arquitecturas de atencion: el modelo permite medir el efecto combinado de tecnicas como Gated Attention, XSA, LUCID o Momentum Attention en un transformer pequeno y reproducible en una sola GPU consumer.
- Ablacion de modulos concretos: al ser un modelo de 84,87 M de parametros entrenable en poco mas de una hora, es viable reentrenarlo variando una tecnica cada vez para aislar su contribucion.
- Experimentos de embeddings continuos: la ruta Leviathan (generador continuo de token embeddings) puede estudiarse frente al lookup discreto tradicional en tareas controladas.
- Docencia y prototipado de preentrenamiento: sirve como ejemplo didactico de receta completa (dataset, tokenizador, BF16, RTX 5090) para cursos o laboratorios de LLM a pequena escala.
- Pruebas de tokenizadores: el uso del tokenizador de LFM2.5-1.2B-Thinking (64.402 tokens) permite comparar vocabularios alternativos sobre un mismo corpus pequeno.
- Evaluacion de estabilidad de entrenamiento: los componentes de optimizacion y estabilidad mencionados en la model card pueden estudiarse en regimenes de entrenamiento cortos.
- Generacion de texto corto en ingles: uso acotado a fragmentos de menos de 512 tokens, sin expectativas de calidad de produccion dado el estado intermedio del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones cuantitativas con modelos de tamano similar.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (84,57 M) y del contexto declarado; no proceden de mediciones publicadas por el autor:

- VRAM de pesos en BF16: aproximadamente 0,17 GB (84,57 M x 2 bytes).
- VRAM de pesos en FP32: aproximadamente 0,34 GB.
- VRAM de pesos en INT8: aproximadamente 0,085 GB.
- VRAM de pesos en INT4: aproximadamente 0,042 GB.
- Cache KV: con 12 capas, 4 cabezas KV y head dim 64, el coste es de unos 12 KB por token en BF16, es decir, en torno a 6 MB para los 512 tokens de contexto completos.
- Cabe holgadamente en cualquier GPU consumer moderna e incluso en iGPU o CPU. Una RTX 4090 o una RTX 5090 estan sobredimensionadas para inferencia; el autor uso una RTX 5090 para el entrenamiento (1h 09m).
- GPU recomendadas para entrenamiento: NVIDIA GeForce RTX 5090 segun el autor; cualquier GPU con suficiente memoria para BF16 y batch pequeno es suficiente dado el tamano.
- GPU recomendadas para inferencia: practicamente cualquiera; no se requiere A100 ni H100.
- Opciones de despliegue: transformers con trust_remote_code=True (obligatorio por el tag custom_code); conversion a GGUF para llama.cpp u Ollama; vLLM y TGI solo si se registra la arquitectura personalizada, algo no garantizado en la informacion disponible.
- Latencia y throughput: no disponibles. Por tamano y contexto, la latencia esperada es muy baja, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de NeoLLM que permitan una comparacion de rendimiento. La tabla siguiente compara solo atributos objetivos (parametros, contexto, licencia y disponibilidad) con alternativas de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NeoLLM | 84,57 M (safetensors) | 512 tokens | apache-2.0 | HuggingFace, requiere custom_code |
| Pythia-70M | 70 M | 2048 tokens | apache-2.0 | HuggingFace, transformers estandar |
| SmolLM-135M | 135 M | 2048 tokens | apache-2.0 | HuggingFace, transformers estandar |
| GPT-2 small | 124 M | 1024 tokens | modified MIT | HuggingFace, transformers estandar |

Las cifras de rendimiento comparativo (MMLU, perplexity u otras) no estan disponibles en la informacion proporcionada para ninguno de los modelos en el contexto de esta ficha, por lo que no se incluyen.

## Limitaciones y advertencias

- Contexto muy limitado: 512 tokens, muy por debajo de los 2048-8192 tokens habituales en modelos de su categoria.
- Solo ingles: no se declara soporte multilingue, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Checkpoint intermedio: el propio autor indica que el modelo esta en desarrollo activo y que la version publicada representa un estado intermedio de entrenamiento, no una version final.
- Arquitectura personalizada: el tag custom_code implica que la carga requiere trust_remote_code=True y que herramientas como vLLM, TGI o llama.cpp pueden necesitar adaptaciones para soportar la arquitectura.
- Discrepancia de parametros: safetensors reporta 84.568.008 parametros mientras la model card indica 84.873.032, una diferencia de aproximadamente 305.000 parametros sin explicacion en la informacion disponible.
- Ambiguedad en la model card sobre parametros entrenables: la tabla lista "effective trainable parameters" igual al total (84,87 M), pero el texto afirma que el presupuesto efectivo es total menos embedding (51,90 M). La contradiccion no se resuelve en la informacion disponible.
- Model card incompleta: el contenido proporcionado se corta en la seccion de normalizacion, por lo que parte de las tecnicas integradas y de la receta de entrenamiento no esta disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en un modelo de este tamano y estado de entrenamiento es esperable un riesgo elevado, aunque no hay datos que lo confirmen.
- Sesgos conocidos: no disponibles. Al entrenarse sobre FineWeb-Edu (corpus filtrado en ingles) hereda los sesgos de ese dataset, pero no se aporta analisis especifico.
- Licencia: Apache 2.0 permite uso comercial, pero el estado intermedio del modelo y la ausencia de evaluaciones desaconsejan su uso en produccion sin validacion adicional.
- Repositorio de 32,6 GB: el tamano del repo es desproporcionado frente a los ~0,17 GB de pesos en BF16, lo que sugiere la presencia de checkpoints adicionales o artefactos de entrenamiento; conviene revisarlo antes de descargar.
- Uso previsto: investigacion. No hay evidencia de ajuste por instrucciones, RLHF o DPO en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/KitsuVp/NeoLLM
- Perfil del autor en X: https://x.com/Kyokopom
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador base: LiquidAI/LFM2.5-1.2B-Thinking
- Learnable Multipliers: https://arxiv.org/abs/2601.04890
- Leviathan: https://arxiv.org/abs/2601.22040
- Leviathan-JTok / JTok-M: https://arxiv.org/abs/2602.00800
- KHRONOS: https://arxiv.org/abs/2505.13315
- Spelling Bee Embeddings: https://arxiv.org/abs/2601.18030
- Token Embedding Manifold: https://arxiv.org/abs/2504.01002
- FAN (Fourier Analysis Networks): https://arxiv.org/abs/2502.21309
- MEA (Multi-head Attention): https://arxiv.org/abs/2601.19611
- LUCID: https://arxiv.org/abs/2602.10410
- Affine-Scaled Attention: https://arxiv.org/abs/2602.23057
- XSA (Exclusive Self Attention): https://arxiv.org/abs/2603.09078
- Directional Routing: https://arxiv.org/abs/2603.14923
- Gated Attention: https://arxiv.org/abs/2505.06708
- Momentum Attention: https://arxiv.org/abs/2411.03884
- Interleaved Head Attention: https://arxiv.org/abs/2602.21371
- REPO: https://arxiv.org/abs/2512.14391
- GRAPE: https://arxiv.org/abs/2512.07805
- GOAT priors: https://arxiv.org/abs/2601.15380
- Hadamard output projection: https://arxiv.org/abs/2603.08343
- Referencias adicionales citadas en los tags sin descripcion en la model card: https://arxiv.org/abs/2602.01212, https://arxiv.org/abs/2603.15031, https://arxiv.org/abs/2411.07501, https://arxiv.org/abs/2310.19531, https://arxiv.org/abs/2601.02031, https://arxiv.org/abs/2502.07490, https://arxiv.org/abs/2511.23225, https://arxiv.org/abs/2605.24956, https://arxiv.org/abs/2511.05963, https://arxiv.org/abs/2409.03137, https://arxiv.org/abs/2608.19491, https://arxiv.org/abs/2502.20566, https://arxiv.org/abs/2510.12402, https://arxiv.org/abs/2512.08217, https://arxiv.org/abs/2511.14721, https://arxiv.org/abs/2502.17055
