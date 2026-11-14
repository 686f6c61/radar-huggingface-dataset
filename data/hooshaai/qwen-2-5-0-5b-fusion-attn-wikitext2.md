# Hooshaai/qwen-2.5-0.5b-fusion-attn-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-fusion-attn-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido 18 de las 24 capas de atencion del decoder por el operador `fusion_attn` (FUSIONATTN) de la libreria NeuralOps, un mecanismo de atencion hibrida con gating por bloques que conmuta entre atencion densa y dispersa segun la longitud de secuencia. El autor es Hooshaai, y el modelo forma parte del llamado "Attention Surgery Zoo", un catalogo de experimentos de cirugia de atencion sobre modelos pequenos.

El objetivo declarado es explorar si es viable reemplazar la atencion softmax GQA nativa por un operador subcuadratico en un modelo causal compacto y recuperar parte del rendimiento perdido mediante destilacion de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2. Tras el transplante quirurgico, la perplejidad se dispara a 176.122,80 y la destilacion la reduce a 6.215,12, todavia muy lejos del profesor original (15,38).

Se trata, por tanto, de una pieza de investigacion reproducible, no de un modelo listo para produccion: el propio autor publica la telemetria completa del proceso, los formatos de pesos y las limitaciones del resultado. Su interes es metodologico (topologia hibrida 3:1, herencia de pesos `q/k/v/o_proj`, protocolo de destilacion en dos etapas) mas que practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas sustituidas por `fusion_attn` (hibrida, gating por bloques) y 6/24 capas GQA nativas |
| Parametros totales | 535.963.552 (segun safetensors); la model card cita 494M para el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; evaluado a longitud de secuencia 512; RoPE con theta = 1.000.000 |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1022,33 MB, mas adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador); libreria `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas de decoder, dimension oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimension por cabeza d_h=64. Sobre esa base se aplica la topologia `hybrid_3_1`: las capas con indices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `fusion_attn` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atencion GQA softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores preentrenados `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 y una unica proyeccion de salida, evitando el colapso por proyecciones no inicializadas.

El operador FUSIONATTN es una atencion hibrida con gating por bloques: para secuencias cortas (N <= 128) o atencion cruzada ejecuta atencion densa; para secuencias largas activa atencion dispersa con gating por bloques. Soporta causalidad autoregresiva, GQA y RoPE gestionado por el adaptador, con despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilacion de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con 0 MB de VRAM de profesor gracias a la arquitectura de cacheado offline de representaciones de NeuralOps. La etapa 1 (30% del presupuesto, 136 pasos) congela embeddings, MLPs y `lm_head` y entrena solo modulos de atencion y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), minimizando MSE por capa mas 0.25 * (1 - coseno). La etapa 2 (70% del presupuesto, 323 pasos) hace destilacion end-to-end de todas las 24 capas residuales con lr=6.0e-5 y peso de coseno 0.50. Se usan pesos maestros FP32 con AMP FP16 y GradScaler.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Conversacion multi-turno basica (pipeline `text-generation`, tag `conversational`).
- Atencion con soporte GQA y RoPE, con conmutacion automatica entre ruta densa y ruta dispersa segun longitud de secuencia.
- Capacidad de servir como banco de pruebas para experimentos de atencion subcuadratica y destilacion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues limitadas al ingles declarado.

## Casos de uso

- Investigacion en eficiencia de atencion: comparar la perplejidad y el comportamiento de `fusion_attn` frente a GQA softmax en el mismo backbone, usando las 6 capas ancla como control interno.
- Reproduccion de experimentos de cirugia de atencion: el repositorio documenta indices de capa, hiperparametros y telemetria, lo que permite replicar el pipeline con la libreria NeuralOps en una unica RTX 3090.
- Estudio de destilacion de representaciones ocultas: las dos etapas (alineamiento de subespacio con backbone congelado y destilacion end-to-end) sirven como referencia metodologica para otros modelos pequenos.
- Prototipado de operadores subcuadraticos: validar el despacho de kernel CUDA/Triton/PyTorch de FUSIONATTN antes de escalar a modelos mayores.
- Docencia y formacion: ejemplo compacto (0,5B) de como una modificacion arquitectonica degrada la perplejidad y como la destilacion recupera parte del rendimiento.
- Benchmarking de tooling: medir el soporte de `neuralops` en pipelines de inferencia y serializacion de pesos frente a ecosistemas como transformers o vLLM.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). Evaluacion en el split de validacion de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, batch_size=8 y grad_accum=4, en una RTX 3090 de 24 GB.

| Metrica | Valor |
|---|---:|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad del estudiante tras el transplante (zero-shot) | 176.122,80 |
| Perplejidad del estudiante tras destilacion (post-KD) | 6.215,12 |
| Delta absoluto de perplejidad | -169.907,68 |
| Reduccion relativa de perplejidad | 96,47% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB solo para pesos (1022,33 MB), mas overhead de activaciones y cache KV; con contexto de 512 tokens cabe holgadamente en GPUs de 8 GB.
- El autor entreno la destilacion en una NVIDIA GeForce RTX 3090 de 24 GB con 0 MB de VRAM de profesor (cacheado offline de representaciones).
- Cabe en GPUs de consumo: RTX 3060/4060 (8-12 GB), RTX 3090/4090, y en general cualquier GPU con al menos 4-6 GB libres para inferencia a contextos moderados.
- Opciones de despliegue: la libreria nativa es `neuralops`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la presencia de `fusion_attn` en 18 capas probablemente requiera el runtime de NeuralOps para cargar los pesos correctamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-fusion-attn-wikitext2 | 535,96M | no disponible (evaluado a 512) | 6.215,12 (post-KD, autor) | MIT | Hugging Face, requiere `neuralops` |
| Qwen/Qwen2.5-0.5B | ~494M | 32.768 tokens (modelo base) | 15,38 (profesor, mismo split) | Apache 2.0 | Hugging Face, transformers |
| Qwen2.5-1.5B | ~1,5B | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers |

La comparativa directa con el modelo base es la mas informativa: el checkpoint destilado queda unas 404 veces por encima en perplejidad respecto al profesor en el mismo split, lo que refleja el coste de la sustitucion arquitectonica incluso tras la recuperacion por destilacion.

## Limitaciones y advertencias

- Perplejidad post-destilacion de 6.215,12 frente a 15,38 del profesor: la calidad del lenguaje esta muy degradada y el modelo no es apto para uso en produccion.
- El checkpoint solo se ha evaluado en WikiText-2 en ingles; no hay evidencia de generalizacion a otras tareas o dominios.
- Requiere la libreria `neuralops` y su implementacion de `fusion_attn`; la carga con `transformers` estandar puede fallar o producir resultados incorrectos.
- Riesgo alto de alucinacion y de generacion incoherente por la divergencia respecto al modelo base.
- Sesgos: no documentados especificamente, pero hereda los del corpus de preentrenamiento de Qwen2.5-0.5B.
- Licencia MIT declarada, lo que permite uso comercial del checkpoint, pero el modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0 que conviene revisar; ademas, el uso comercial de un modelo con esta calidad no es recomendable.
- El resultado de perplejidad esta marcado como `verified: false` en el model-index; no hay verificacion independiente.
- Solo ingles declarado; sin soporte multilingue documentado.
- La model card no especifica la longitud de contexto efectiva tras la sustitucion de atencion, por lo que el comportamiento mas alla de 512 tokens es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-fusion-attn-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `fusion_attn`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/fusion_attn.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
