# Goekdeniz-Guelmez/Omoikane-50M-PoC

## Resumen

Omoikane-50M-PoC es un checkpoint de prueba de concepto de un modelo de lenguaje hibrido desarrollado por Goekdeniz-Guelmez. Se trata de un modelo de 48,9 millones de parametros entrenado desde inicializacion aleatoria sobre 104 millones de tokens de texto web educativo, en una unica Mac mini con Apple M4 y 32 GB de memoria unificada, sin GPU CUDA. El objetivo del checkpoint no es ofrecer un asistente funcional, sino validar que la arquitectura, la receta de entrenamiento y el stack de entrenamiento sobre Apple Silicon funcionan antes de acometer una ejecucion completa de 1.000 millones de tokens.

La arquitectura combina dos tipos de mezcladores de secuencia: capas Gated DeltaNet (recurrentes lineales, 8 de 10) y capas Multi-head Latent Attention (atencion completa, 2 de 10), junto con bloques feed-forward de tipo Mixture-of-Experts de grano fino y una cabeza de prediccion multi-token. El vocabulario es de 131.072 tokens con BPE a nivel de byte y el contexto de entrenamiento es de 1.024 tokens, aunque el autor indica que funciona zero-shot hasta al menos 4.096.

Es relevante ahora porque demuestra un flujo completo de entrenamiento de un transformer hibrido con MoE en hardware de consumo Apple, con un kernel Metal personalizado para la recurrencia gated-delta, y publica curvas de perdida, resultados de evaluacion y decisiones de optimizacion de forma transparente. No obstante, es un checkpoint de investigacion sin instruction tuning y con conocimiento muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet + Multi-head Latent Attention + MoE, con cabeza MTP |
| Parametros totales | 48,9M (33,6M embedding atado + 15,4M tronco) |
| Parametros activos | ~41,8M por token |
| Longitud de contexto | 1.024 tokens entrenados; funciona zero-shot hasta al menos 4.096 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,0 GB; libreria transformers con custom_code) |

## Arquitectura y entrenamiento

El modelo tiene 10 capas mas una cabeza MTP. Las capas 3 y 7 usan Multi-head Latent Attention con 4 cabezas, q-rank 128, kv-rank 64, 48 dimensiones nope y 16 dimensiones RoPE con theta 1e5, cache KV comprimida de bajo rango (64 + 16 valores por token y capa) y puerta de salida sigmoide. El resto de capas usan Gated DeltaNet con 4 cabezas (K = V = 64, chunk 128), estado de tamano fijo por cabeza y coste O(1) por token en inferencia, actualizado mediante la regla gated delta `S_t = α_t (I − β_t k_t k_tᵀ) S_{t−1} + β_t k_t v_tᵀ`. Las capas 0 y 9 son SwiGLU densas y las capas 1 a 8 contienen MoE con 16 expertos de 96 unidades, enrutamiento sigmoide top-4 limitado a grupos (2 de 4 grupos), un experto compartido y balanceo de carga sin perdida auxiliar mediante un sesgo por experto ajustado tras cada paso. La anchura es d = 256 y el vocabulario de 131.072 tokens usa embedding de entrada/salida atado.

El entrenamiento se hizo en tres fases. Primero, un barrido de optimizador y tasa de aprendizaje sobre 1.000 documentos (10 pruebas de 59 pasos), donde Muon supero a AdamW por 0,54 nats y a Lion por 0,68 en sus mejores tasas; se eligio Muon con lr 6e-3 y schedule warmup-stable-decay (WSD). Segundo, el port a MLX con un kernel Metal personalizado para la recurrencia gated-delta, alcanzando ~4.100 tokens/s, unas 1,8 veces la implementacion PyTorch (MPS). Tercero, el preentrenamiento del PoC sobre `mlx-community/fineweb-edu-100K` (99.936 documentos, 103,7M tokens, 1 epoca, ventanas empaquetadas de 1.024 tokens), con 6.329 pasos de optimizador x 16.384 tokens, Muon (Nesterov 0,95, 5 pasos Newton-Schulz, RMS-matched) para matrices ocultas y AdamW para embedding, router, normas y escalares, weight decay 0,1. La perdida combina CE de siguiente token + 0,1 x CE de MTP (25% de posiciones) + 1e-4 de balanceo MoE. Precision fp32 en pesos y bf16 en las GEMM del vocabulario, con MLX 0.32 y `mx.compile`. El entrenamiento completo llevo 6,8 horas en la Mac mini M4 con un pico de 13,1 GB de memoria y ~4.000-4.300 tokens/s. La perdida de validacion final fue 4,0105 nats (1,239 bits por byte), sin picos de perdida y con carga de expertos dentro de ~1,2x de la media.

## Capacidades

- Generacion de texto en ingles con fluidez gramatical; el modelo ha aprendido gramatica (BLiMP 72,9%) y conocimiento simple y lectura por encima del azar.
- Razonamiento basico y conocimiento factico limitado: SciQ 60,0%, PIQA 54,6%, ARC-Easy 39,2%.
- Prediccion multi-token: la cabeza MTP predice el token t+2 y puede actuar como modelo borrador para decodificacion auto-especulativa.
- Inferencia de coste constante por token en las capas Gated DeltaNet, lo que facilita generalizacion a longitudes no vistas durante el entrenamiento.
- Capacidad zero-shot de contexto extendido hasta al menos 4.096 tokens pese a entrenarse con 1.024.
- No dispone de tool calling, function calling, soporte de agentes, vision, audio ni modo de razonamiento explicito.
- Multilingue: solo ingles.
- No hay instruction tuning ni alineamiento por preferencias (SFT y preference training estan en progreso en el proyecto principal).

## Casos de uso

- Validacion de arquitecturas hibridas en investigacion: el checkpoint permite reproducir y estudiar el comportamiento de Gated DeltaNet + MLA + MoE a pequena escala antes de invertir en ejecuciones mayores, con curvas de perdida y evaluaciones publicadas.
- Pruebas de stacks de entrenamiento en Apple Silicon: sirve como referencia para medir throughput (~4.000-4.300 tokens/s), memoria pico (13,1 GB) y estabilidad del kernel Metal personalizado en una Mac mini M4.
- Experimentos de decodificacion especulativa: la cabeza MTP puede usarse como borrador para acelerar la generacion con el propio modelo o con variantes mayores del proyecto.
- Investigacion sobre enrutamiento MoE: el esquema top-4 con limite de grupos, experto compartido y balanceo sin perdida auxiliar es un caso practico para estudiar estabilidad de carga de expertos.
- Evaluacion de generalizacion de contexto: permite medir el rendimiento zero-shot mas alla de los 1.024 tokens de entrenamiento y comparar con arquitecturas de atencion completa.
- Docencia y divulgacion: por su tamano (48,9M) y su entrenamiento documentado en hardware de consumo, es util para explicar el diseno de modelos hibridos, la eleccion de optimizador (Muon frente a AdamW y Lion) y el impacto del schedule WSD.
- Generacion de texto exploratoria en ingles: puede producir texto gramaticalmente correcto para demostraciones, aunque su conocimiento es muy limitado y no debe usarse en produccion.

## Benchmarks y rendimiento

Perdida en conjuntos de evaluacion retenidos:

| Conjunto de evaluacion | Perdida | Perplejidad | Nota |
|---|---|---|---|
| fineweb-edu validation (en dominio) | 4,011 | 55,2 | |
| Ultra-FineWeb test (web, fuente no vista) | 4,122 | 61,7 | brecha de transferencia pequena |
| UltraData-Math test | 4,637 | 103,3 | matematicas nunca vistas en entrenamiento |
| UltraData-Code test | 5,299 | 200,2 | codigo nunca visto en entrenamiento |

Benchmarks zero-shot (1.000 ejemplos por tarea; BLiMP: 938 pares sobre los 67 fenomenos; prompts y scoring de loglikelihood estilo lm-evaluation-harness con un harness MLX propio, por lo que las comparaciones con otros papers son aproximadas):

| Tarea | Precision | Azar |
|---|---|---|
| BLiMP (gramatica) | 72,9% | 50% |
| SciQ | 60,0% | 25% |
| PIQA | 54,6% | 50% |
| ARC-Easy | 39,2% (norm 36,4%) | 25% |
| LAMBADA (ultima palabra exacta) | 9,8% | 0% |
| HellaSwag | 25,8% (norm 27,1%) | 25% |
| Winogrande | 50,7% | 50% |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento uso 13,1 GB de pico en fp32 con bf16 en las GEMM del vocabulario; la inferencia en fp32 deberia situarse por debajo de esa cifra, aunque no se publica una estimacion especifica.
- GPU recomendadas: no hay datos publicados; el modelo se entreno en Apple Silicon (Mac mini M4, 32 GB de memoria unificada) y no se ha validado en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: con 48,9M de parametros, es probable que quepa en GPUs de consumo con suficiente memoria, pero no se ha publicado una medicion concreta.
- Opciones de despliegue: transformers con `custom_code` (el modelo requiere codigo personalizado); el autor menciona MLX y Apple Silicon como stack principal. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: durante el entrenamiento se alcanzaron ~4.000-4.300 tokens/s en la Mac mini M4; no se publican cifras de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Como referencia estructural, se puede contrastar con otras familias pequenas de codigo abierto, pero sin cifras publicadas por el autor no es posible establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Omoikane-50M-PoC | 48,9M (41,8M activos) | 1.024 entrenados; zero-shot hasta 4.096 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un asistente: no tiene instruction tuning ni alineamiento, por lo que no sigue instrucciones de forma fiable.
- Conocimiento muy limitado: el tronco tiene solo 15,4M de parametros y se entreno con 104M tokens; tareas de sentido comun y correferencia (HellaSwag, Winogrande) estan en el nivel del azar.
- Riesgo alto de alucinacion y de afirmaciones facticamente incorrectas; no apto para produccion ni para uso informativo.
- Solo ingles; no hay soporte multilingue.
- Contexto de entrenamiento de 1.024 tokens; el rendimiento mas alla de esa longitud es zero-shot y no esta garantizado.
- No dispone de tool calling, agentes, vision ni audio.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo carece de la calidad necesaria para aplicaciones comerciales reales.
- Requiere codigo personalizado (`custom_code`) para cargarse con transformers; la compatibilidad con otros runtimes no esta documentada.
- El harness de evaluacion es propio (MLX), por lo que las comparaciones con resultados publicados de otros modelos son aproximadas.
- El propio autor indica que una ejecucion mayor de 1.000 millones de tokens, extension de contexto a 4.096, SFT y entrenamiento por preferencias estan en progreso en el proyecto principal.

## Enlaces

- Hugging Face: https://huggingface.co/Goekdeniz-Guelmez/Omoikane-50M-PoC
- Dataset de entrenamiento: https://huggingface.co/datasets/mlx-community/fineweb-edu-100K
- Repositorio del proyecto principal, paper, blog y demos: no disponible en la informacion proporcionada.
