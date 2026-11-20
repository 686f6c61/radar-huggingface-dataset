# KitsuVp/NeoLLM

## Resumen

NeoLLM es un modelo de lenguaje decoder-only de 85,16 millones de parametros entrenado desde cero por el desarrollador independiente KitsuVp (@Kyokopom) sobre el dataset FineWeb-Edu. Su proposito no es competir en capacidad generativa, sino servir como banco de pruebas para estudiar como interactuan durante el preentrenamiento un conjunto amplio de tecnicas recientes de atencion, normalizacion y representacion de tokens, integradas todas en una unica arquitectura.

El modelo emplea una arquitectura transformer con 12 capas, hidden size de 512, 8 cabezas de atencion con GQA de 4 cabezas KV, atencion completa en 4 capas y atencion tipo CKDA en las 8 restantes, mas un prior posicional Leviathan y un mecanismo Copy-Paste LM activados. El entrenamiento se completo en aproximadamente 2 horas y 3 minutos en BF16 sobre una NVIDIA RTX PRO 6000 Blackwell, lo que da una idea de su escala reducida y de su orientacion experimental.

Es relevante ahora porque condensa en un solo checkpoint tecnicas publicadas muy recientemente (Leviathan, Copy-Paste LM, XSA, Affine-Scaled Attention, LUCID, entre otras) y permite a investigadores reproducir y medir sus interacciones con un coste de computo minimo. El checkpoint actual es un estado intermedio de entrenamiento y el autor lo describe como un proyecto en desarrollo activo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida (4 capas full + 8 capas CKDA), GQA, Leviathan y Copy-Paste LM |
| Parametros totales | 85.156.584 (85,16 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en BF16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, BF16, requiere `trust_remote_code` por `custom_code`) |

Otros datos tecnicos: hidden size 512, 12 capas, 8 cabezas de atencion, 4 cabezas KV (GQA), head dim 64, intermediate size 1536, vocabulario de 64.402 tokens (tokenizer de LiquidAI/LFM2.5-1.2B-Thinking), pesos atados entre embedding y cabeza LM. Parametros de embedding: 32.973.824; parametros no-embedding: 52.182.760. GOAT position prior desactivado; JTok/JTok-M, DAGFormer, Linear Depth Memory y Virtual Head Attention desactivados.

## Arquitectura y entrenamiento

NeoLLM es un transformer decoder-only con atencion hibrida: cuatro capas usan atencion completa y ocho usan CKDA. Incorpora Grouped Query Attention con 8 cabezas de consulta y 4 de clave/valor, pesos atados entre embedding y cabeza de salida, y un prior posicional Leviathan (d_seed=128, modes=8, knots=16) que sustituye a RoPE en las capas de atencion completa. El modulo Copy-Paste LM esta activo y mezcla una distribucion de puntero causal con la distribucion sobre el vocabulario; en entrenamiento con CUDA usa los kernels dispersos de CCE y en inferencia devuelve logits densos mezclados.

El entrenamiento se realizo desde cero sobre FineWeb-Edu con computo en BF16, completandose en aproximadamente 2 horas y 3 minutos en una NVIDIA RTX PRO 6000 Blackwell Server Edition. No se especifican en la informacion disponible el numero total de tokens procesados, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La model card integra, total o parcialmente, tecnicas de papers recientes: Learnable Multipliers, Leviathan, JTok/JTok-M, KHRONOS, Spelling Bee Embeddings, Virtual Head Attention, Copy-Paste LM, FAN, MEA, LUCID, Affine-Scaled Attention, XSA, Directional Routing y Gated Attention, entre otras. El checkpoint publicado corresponde a un estado intermedio de entrenamiento.

## Capacidades

- Generacion de texto causal en ingles: modelo de lenguaje autorregresivo basico.
- Razonamiento y matematicas: capacidad limitada por el tamano (85 M de parametros) y por el contexto de 512 tokens; no hay evaluaciones publicadas.
- Codigo: no se documenta entrenamiento especifico en codigo; FineWeb-Edu es un corpus educativo web, no de programacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: atencion hibrida con CKDA, prior posicional Leviathan y Copy-Paste LM (mecanismo de copia de tokens del contexto) activos; el resto de modulos experimentales (JTok, DAGFormer, Linear Depth Memory, Virtual Head Attention) estan desactivados en este checkpoint.
- Vision y audio: no soportados.

## Casos de uso

- Investigacion en arquitecturas de atencion: el modelo permite medir empiricamente como interactuan XSA, LUCID, Affine-Scaled Attention, Directional Routing y Gated Attention en un mismo preentrenamiento con un coste de computo de horas, no de semanas.
- Estudio de mecanismos de copia: Copy-Paste LM esta activo, de modo que se puede analizar el comportamiento de la mezcla puntero/vocabulario en tareas de copia literal y repeticion controlada dentro de la ventana de 512 tokens.
- Experimentos con priors posicionales alternativos: Leviathan sustituye a RoPE en las capas de atencion completa, lo que facilita comparaciones controladas frente a variantes con RoPE.
- Reproduccion de papers recientes: el repositorio agrupa implementaciones de decenas de tecnicas citadas por arXiv, util como referencia de codigo para quien quiera reimplementarlas.
- Docencia y formacion: un modelo de 85 M entrenable en pocas horas en una GPU profesional es adecuado para cursos de preentrenamiento, tokenizacion y evaluacion de LLM.
- Pruebas de pipelines de inferencia: sirve para validar integraciones con `transformers`, `trust_remote_code` y kernels personalizados antes de escalar a modelos mayores.
- Generacion de texto de baja latencia en ingles: para tareas simples de continuacion o clasificacion ligera donde el contexto de 512 tokens sea suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 0,2 GB solo para pesos (85 M de parametros x 2 bytes), mas overhead de activaciones y del codigo personalizado; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizo en una NVIDIA RTX PRO 6000 Blackwell Server Edition.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien en CPU para pruebas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. El contexto de 512 tokens limita el coste por peticion, pero el modelo requiere cargar codigo personalizado (kernels de atencion y Copy-Paste) que puede afectar al rendimiento frente a un transformer estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| NeoLLM (KitsuVp) | 85,16 M | 512 | Apache 2.0 | Banco de pruebas de tecnicas de atencion/normalizacion recientes |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Transformer decoder-only clasico |
| SmolLM-135M (HuggingFace) | 135 M | 2048 | Apache 2.0 | Modelo pequeno de produccion entrenado en corpus web curado |
| Pythia-70M (EleutherAI) | 70 M | 2048 | Apache 2.0 | Suite de investigacion con checkpoints intermedios |

NeoLLM se situa en el segmento de modelos de investigacion por debajo de 150 M de parametros. Frente a GPT-2 small, SmolLM-135M y Pythia-70M, su ventaja no es el rendimiento bruto (no hay benchmarks publicados), sino la integracion de modulos experimentales y la reproducibilidad de su entrenamiento en pocas horas. Su contexto de 512 tokens es notablemente inferior al de sus alternativas.

## Limitaciones y advertencias

- Modelo en estado intermedio de entrenamiento: el autor lo describe como checkpoint parcial, por lo que la calidad generativa puede ser deficiente y no representativa de un modelo final.
- Contexto muy limitado: 512 tokens restringen tareas de contexto largo, resumen de documentos y conversaciones multi-turno extensas.
- Solo ingles: no hay soporte multilingue documentado.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado sobre corpus web educativo, la generacion de hechos puede ser poco fiable.
- Sesgos: hereda los sesgos de FineWeb-Edu; no se documentan evaluaciones de sesgo ni mitigaciones.
- Requiere `trust_remote_code`: la carga implica ejecutar codigo personalizado del autor, con el riesgo de seguridad asociado en entornos de produccion.
- Sin benchmarks publicados: no es posible comparar su rendimiento de forma objetiva con alternativas.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluaciones y el estado intermedio del checkpoint desaconsejan su uso en produccion.
- Modulos experimentales desactivados: parte de las tecnicas citadas (JTok, DAGFormer, Linear Depth Memory, Virtual Head Attention) no estan activas en este checkpoint, por lo que no se pueden evaluar en esta version.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KitsuVp/NeoLLM
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizer utilizado: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Autor en X: https://x.com/Kyokopom
- Papers citados en la model card (seleccion): https://arxiv.org/abs/2601.04890, https://arxiv.org/abs/2601.22040, https://arxiv.org/abs/2602.00800, https://arxiv.org/abs/2610.19247, https://arxiv.org/abs/2603.09078, https://arxiv.org/abs/2602.23057, https://arxiv.org/abs/2602.10410, https://arxiv.org/abs/2603.14923, https://arxiv.org/abs/2505.06708
