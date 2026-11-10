# DuoNeural/RMSN-243M-Terminal-Boundary-SFT

## Resumen

RMSN-243M-Terminal-Boundary-SFT es un modelo de lenguaje de aproximadamente 243 millones de parámetros desarrollado por DuoNeural Lab, presentado como parte de su suite experimental "Phase 5: Topology Zoo". Se trata de un ajuste fino supervisado (SFT) sobre trazas de razonamiento chain-of-thought (CoT) del propio laboratorio, entrenado durante 15.000 pasos. El modelo emplea una arquitectura poco convencional denominada "Resonant Metriplectic Sheaf Network" (RMSN), formulada en el marco de los sistemas port-hamiltonianos, con 16 capas, dimensión oculta de 1024 y 64 "workspace slots".

La peculiaridad técnica del modelo es su topología de "frontera terminal" (terminal boundary): la capa 15 (la de salida) actúa como una singularidad macroscópica de entropía cero que concentra el gradiente del ajuste fino, dejando relativamente intactos los pesos de las capas interiores (L0–L14). Según el autor, este diseño maximiza la resistencia al olvido catastrófico durante el SFT, con una ratio de retención de 3,3×, la mejor de su suite de referencia.

El modelo es relevante como artefacto de investigación sobre topologías de red alternativas y estabilidad durante el ajuste fino, más que como modelo de propósito general. Su tokenizer es el de HuggingFaceTB/cosmo2-tokenizer (vocabulario de 49.152 tokens), solo soporta inglés y se distribuye bajo licencia Apache 2.0. No hay pipeline declarado ni métricas de benchmarks estándar publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), formulación port-hamiltoniana (ḟ = {f,H} + [f,S]); transformer con topología de solitón "terminal boundary" |
| Parametros totales | ~243M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,8 GB, librería `custom`) |

Parámetros adicionales declarados por el autor: dimensión oculta 1024, 16 capas, 64 workspace slots, tokenizer HuggingFaceTB/cosmo2-tokenizer (vocab = 49.152).

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de 16 capas y dimensión oculta 1024, descrita por el autor como "Resonant Metriplectic Sheaf Network" con dinámica port-hamiltoniana de la forma ḟ = {f,H} + [f,S], es decir, una componente hamiltoniana conservativa (corchete de Poisson) más una componente disipativa (corchete de tipo metripléctico). Sobre esta base se aplica una topología de solitón denominada "terminal boundary": las capas L00–L14 operan en régimen difuso (alto participation ratio, no solitónico), mientras que la capa L15 se configura como una singularidad de frontera con PR = 1,000 (condensación macroscópica exacta) y actuando como sumidero de salida de entropía cero.

El entrenamiento consiste en un SFT de 15.000 pasos sobre trazas de razonamiento CoT de DuoNeural. El mecanismo clave declarado es que la singularidad de frontera concentra el gradiente del SFT en L15, dejando los pesos interiores relativamente inalterados, lo que produce la máxima retención de conocimiento previo. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; tampoco se detallan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en inglés y razonamiento chain-of-thought (el ajuste se realizó sobre trazas CoT, con cot_ppl de 14,29).
- Razonamiento multi-paso orientado a tareas de tipo "reasoning", según los tags del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: limitadas al inglés (único idioma declarado).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como banco de pruebas para estudiar cómo una topología de frontera terminal (L15) concentra el gradiente del SFT y preserva los pesos interiores; útil para comparar estrategias de ajuste fino con ratios de retención medibles (3,3× frente a 2,6× de bulk-to-boundary).
- Experimentación con arquitecturas port-hamiltonianas: permite reproducir y analizar la formulación ḟ = {f,H} + [f,S] en un modelo de 243M, un tamaño manejable para ablaciones académicas.
- Generación de trazas de razonamiento en inglés: dado su ajuste sobre CoT, puede emplearse para producir cadenas de razonamiento en tareas de investigación, siempre con validación humana por su wiki_ppl elevada (231,91).
- Estudio de topologías de red ("Topology Zoo"): comparación controlada con los otros seeds de la suite Phase 5 (seed_d1152, seed10, D=1280 best) para aislar el efecto de la topología en la perplejidad.
- Prototipado educativo de modelos pequeños: con ~243M de parámetros y pesos de 0,8 GB, es viable en entornos de laboratorio con recursos limitados para docencia o experimentación.
- Base para ajustes posteriores: al exhibir alta retención, puede servir como punto de partida para SFT adicionales donde se quiera minimizar la degradación del conocimiento previo.

## Benchmarks y rendimiento

Datos publicados por el autor (suite Phase 5, SFT de 15.000 pasos). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo | Topología | cot_ppl ↓ | wiki_ppl ↓ | Retención |
|---|---|---|---|---|
| seed_d1152 | Upstream (L=3) | 8,48 | 186,07 | 2,7× |
| seed10 | Bulk→Boundary (L=8→15) | 10,31 | 184,81 | 2,6× |
| D=1280 best | Bulk Tube (L8–L13) | 10,77 | 208,68 | no disponible |
| **seed6 (este modelo)** | **Terminal Boundary (L=15)** | **14,29** | **231,91** | **3,3×** |

Métricas del modelo: wiki_ppl = 231,91; cot_ppl = 14,29; ratio de retención = 3,3× (definido como base_wiki_ppl / sft_wiki_ppl). Nótese que este modelo obtiene la mejor retención pero la peor perplejidad wiki y cot de la comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~243M de parámetros, en fp16 requeriría aproximadamente 0,5 GB de pesos; en fp32, ~1 GB; una cuantización a 8 bits rondaría los 0,25 GB, y a 4 bits unos 0,13 GB (estimaciones a partir del recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) sería suficiente en teoría.
- ¿Cabe en GPU consumer? Sí, por tamaño (243M), aunque la arquitectura `custom` puede requerir código específico para cargar los pesos.
- Opciones de despliegue: no disponibles. La librería es `custom`, por lo que no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con modelos de propósito general de tamaño equivalente (por ejemplo, Qwen2.5-0.5B, SmolLM2-360M o Phi-1.5) en la información proporcionada, ya que el modelo no publica benchmarks estándar. La única comparativa disponible es interna a la suite Phase 5 del propio autor:

| Modelo | Parámetros | Contexto | cot_ppl | wiki_ppl | Retención | Licencia |
|---|---|---|---|---|---|---|
| seed_d1152 | no disponible | no disponible | 8,48 | 186,07 | 2,7× | no disponible |
| seed10 | no disponible | no disponible | 10,31 | 184,81 | 2,6× | no disponible |
| D=1280 best | no disponible | no disponible | 10,77 | 208,68 | no disponible | no disponible |
| **RMSN-243M (este)** | ~243M | no disponible | 14,29 | 231,91 | 3,3× | Apache 2.0 |

## Limitaciones y advertencias

- Perplejidad wiki elevada (231,91), la peor de la comparativa interna, lo que sugiere una calidad de modelado de lenguaje general limitada.
- Perplejidad CoT (14,29) también superior a la de los otros seeds, pese a estar ajustado sobre trazas CoT.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada, lo que impide garantizar conversaciones multi-turno o documentos largos.
- Arquitectura y tokenizer no estándar (librería `custom`), con riesgo de incompatibilidad con toolchains habituales de inferencia.
- Sin benchmarks estándar (MMLU, HumanEval, GSM8K) publicados: no es posible evaluar su calidad frente a modelos convencionales.
- Riesgo de alucinación no cuantificado; al ser un modelo de 243M y perplejidad alta, es esperable una fiabilidad baja en producción.
- Sin datos sobre sesgos, dataset de entrenamiento ni proceso de alineación (RLHF/DPO no documentados).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad desaconseja su uso en producción sin validación previa.
- Modelo experimental de investigación (Phase 5, Topology Zoo) con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-243M-Terminal-Boundary-SFT
- Tokenizer referenciado: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper / blog / repositorio / demo: no disponibles en la información proporcionada.
