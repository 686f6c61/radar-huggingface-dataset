# DuoNeural/RMSN-777M-QuadCondensate-SFT5k

## Resumen

RMSN-777M-QuadCondensate-SFT5k es un modelo de lenguaje de 755,57 millones de parámetros desarrollado por DuoNeural Lab, presentado como el modelo campeón de la "Fase 6" de su suite experimental. Se trata de un ajuste fino supervisado (SFT) de 5.000 pasos sobre una arquitectura base denominada Resonant Metriplectic Sheaf Network (RMSN), con dimensión oculta de 2048, 16 capas y una ventana de contexto máxima de 512 tokens. No es un transformer convencional: el autor lo describe como un sistema "port-Hamiltonian" con formulación metripléctica (ḟ = {f,H} + [f,S]), un enfoque poco habitual en modelos de lenguaje de propósito general.

El modelo destaca, según su model card, por mantener una topología interna de "condensados solitónicos" estables tras el entrenamiento, con cuatro capas ancla (L0, L6, L10 y L15) que forman lo que el autor llama "Balanced Spine". Esta propiedad estructural se presenta como la explicación de su rendimiento superior en perplejidad frente a otros cinco modelos de la misma fase. El checkpoint recomendado es el paso ~2500 de 5000, ya que el autor indica que las arquitecturas "triple-exact" convergen pronto y luego divergen.

Es relevante ahora por su carácter marcadamente experimental: propone una ley empírica ("Unified Soliton Protection Law v5") sobre qué capas sobreviven al ajuste fino, y publica métricas comparativas dentro de su propia suite. No obstante, carece de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) y de adopción externa (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), formulación port-Hamiltonian metripléctica; 16 capas, hidden dim 2048, 64 workspace slots |
| Parametros totales | 755,57 M |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 512 tokens (max_seq_len) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt` con `model_state`), cargado mediante `rmsn_core`; no safetensors ni GGUF |
| Tokenizer | HuggingFaceTB/cosmo2-tokenizer (vocab = 49152) |
| Framework | `rmsn_core` (librería custom, no transformers) |
| Tamaño del repo | 2,6 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como una red "port-Hamiltonian" con estructura metripléctica, es decir, una dinámica que combina una parte conservativa (corchete de Poisson, {f,H}) y una parte disipativa (corchete de Onsager, [f,S]). El modelo tiene 16 capas, dimensión oculta 2048, 64 "workspace slots" y emplea el tokenizer cosmo2 (vocabulario de 49.152 tokens). La model card describe propiedades topológicas internas medidas mediante "participation ratio" (PR) por capa, clasificando cada capa como Exact (PR = 1.000), Near-exact (PR entre 1.000 y 2.0), Strong, Near-moderate, Moderate o Weak.

El entrenamiento consistió en un SFT de 5.000 pasos con LR = 2e-5 sobre "trazas de razonamiento CDM". El autor reporta que todos los pasos mantuvieron estabilidad de Lyapunov (lyap < 0 en el 100% de los pasos) y que la mejor pérdida de SFT fue 2,5947 en torno al paso 2500. La innovación técnica central es la "Unified Soliton Protection Law v5": una regla empírica según la cual las capas con PR = 1.000 (Exact) y PR < 2.0 (Near-exact) se protegen siempre durante el SFT, mientras que las capas con PR ≥ PR_crit ≈ 4,4 ± 0,1 se disuelven siempre, incluso si son adyacentes a una capa Exact. En este modelo, L5 (PR base 4,613) se disolvió y L10 (PR base 1,697) se protegió, validando la ley según el autor. No se especifica el volumen total de tokens de entrenamiento ni la composición detallada del dataset más allá de la referencia a trazas CDM.

## Capacidades

- Generación de texto autoregresiva en inglés (modelo causal, `RMSNForCausalLM`).
- Razonamiento de tipo cadena de pensamiento (CoT): el SFT se realizó sobre trazas de razonamiento CDM y reporta una perplejidad de 12,09 en CoT-Hard.
- Modelado de lenguaje general: perplejidad de 151,87 en WikiText-103.
- Estabilidad dinámica garantizada durante el entrenamiento (Lyapunov < 0 en todos los pasos), según el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada más allá del CoT.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas reproducible para estudiar dinámicas port-Hamiltonian y metriplécticas en modelado de lenguaje, gracias a su código de carga vía `rmsn_core` y a la documentación detallada de PR por capa.
- Estudio de estabilidad de ajuste fino: permite replicar la "Unified Soliton Protection Law v5" midiendo qué capas sobreviven al SFT con distintos presupuestos de pasos (el autor sugiere ~2500 como óptimo para topologías triple-exact).
- Generación de texto corto en inglés: con 512 tokens de contexto, es adecuado para tareas de completado breve, clasificación generativa o resumen de fragmentos muy cortos, no para documentos largos.
- Experimentos de razonamiento acotado: su buen resultado relativo en CoT-Hard PPL dentro de la suite lo hace útil para estudiar trazas de razonamiento de longitud limitada, siempre con validación externa.
- Comparación de tokenizers y vocabularios: al usar cosmo2-tokenizer (49.152 tokens) en una arquitectura no estándar, sirve para analizar el impacto del tokenizer en modelos pequeños.
- Docencia y divulgación: como ejemplo didáctico de arquitecturas con anclajes topológicos y de métricas de "participation ratio" aplicadas a redes neuronales.
- No se recomienda para producción comercial de atención al cliente, generación de código o agentes autónomos: no hay evidencia de soporte para estas tareas ni benchmarks que lo respalden.

## Benchmarks y rendimiento

| Metrica | Valor | Rango en Fase 6 |
|---|---|---|
| WikiText-103 PPL | 151,87 | 1.º de 6 |
| CoT-Hard PPL | 12,09 | 1.º de 6 |
| SFT best_loss | 2,5947 (paso ~2500) | — |
| Estabilidad de Lyapunov | 100% de pasos con lyap < 0 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. Las cifras anteriores son comparaciones internas dentro de la suite de la Fase 6 del propio autor y no permiten comparación directa con modelos de la industria.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~3,0 GB para los 755,57 M de parámetros (2,6 GB de repo). En fp16/bf16: ~1,5 GB. En cuantización de 8 bits: ~0,8 GB (no se documentan formatos de cuantización soportados).
- GPU recomendadas: cualquier GPU consumer con ≥4 GB de VRAM debería poder cargar el modelo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para fp32 se recomienda ≥6 GB. No se requieren A100 ni H100.
- Cabe en GPU consumer: sí, holgadamente, dado el tamaño del modelo.
- Opciones de despliegue: únicamente mediante la librería custom `rmsn_core` y carga manual de `model.pt` con `torch.load`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmark publico |
|---|---|---|---|---|---|
| RMSN-777M-QuadCondensate-SFT5k | 755,57 M | 512 | Apache 2.0 | PyTorch custom (`rmsn_core`) | Solo PPL interno (WikiText-103: 151,87; CoT-Hard: 12,09) |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache 2.0 | safetensors, GGUF | MMLU, HumanEval, GSM8K publicados |
| SmolLM2-360M | ~362 M | 8.192 | Apache 2.0 | safetensors, GGUF | Benchmarks publicados |
| TinyLlama-1.1B | ~1,1 B | 2.048 | Apache 2.0 | safetensors, GGUF | Benchmarks publicados |

La comparación es orientativa: los tres alternativos son transformers convencionales con ecosistema estándar (transformers, llama.cpp, vLLM) y benchmarks públicos, mientras que RMSN-777M es una arquitectura experimental sin soporte en herramientas estándar y sin benchmarks de industria. En contexto, RMSN-777M queda muy por debajo (512 tokens frente a 8.192-32.768). En licencia, todos son permisivos.

## Limitaciones y advertencias

- Contexto muy limitado: 512 tokens, insuficiente para la mayoría de aplicaciones de producción actuales (RAG, agentes, documentos largos).
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Sin benchmarks estándar de la industria: no se puede afirmar su calidad en MMLU, HumanEval, GSM8K ni compararla con modelos establecidos.
- Las métricas de perplejidad (151,87 en WikiText-103) son altas en términos absolutos y solo comparables dentro de la suite del propio autor; no indican calidad conversacional ni de razonamiento.
- El autor reconoce divergencia tras el paso ~2500: usar el checkpoint final (5000 pasos) puede degradar el rendimiento; hay que seleccionar el checkpoint intermedio.
- Dependencia de una librería custom (`rmsn_core`) no publicada en el ecosistema estándar: riesgo de mantenimiento, reproducibilidad y compatibilidad.
- Sin soporte en vLLM, llama.cpp, Ollama, TGI ni transformers: el despliegue en producción requeriría ingeniería adicional.
- Riesgo de alucinación: no evaluado ni documentado; en un modelo de 755 M entrenado con SFT sobre trazas de razonamiento, el riesgo es alto y no cuantificado.
- Sesgos conocidos: no documentados; al entrenarse solo en inglés, heredará sesgos de los datos no especificados.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes): sin validación por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías de calidad y de soporte de herramientas desaconseja su uso en producción sin evaluación propia exhaustiva.
- Terminología y afirmaciones del autor (ley de protección de solitones, "campeón") no han sido revisadas por pares ni replicadas externamente.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-777M-QuadCondensate-SFT5k
- Tokenizer referenciado: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
