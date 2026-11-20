# Kai9987kai/supermix-v102

## Resumen

Supermix v102 es un checkpoint de texto generativo publicado por el autor independiente Kai9987kai como parte de la familia experimental "Supermix". Se trata de un modelo de arquitectura propietaria que el autor denomina "cognitive-fabric" (SCF), con un núcleo de mezcla de expertos (MoE) de tan solo 36,6 millones de parametros totales y 9,1 millones activos, partiendo de un vocabulario de 9.460 tokens. El modelo es un fine-tune del checkpoint anterior v101 y se presenta como la version "Frontier" de la escalera experimental v101–v103.

La propuesta tecnica es inusual: combina componentes inspirados en neurociencia (un "ConnectomeCore" bilateral con gating dendritico apical, un "RecursiveThinkingCore" con sincronizacion temporal de pensamiento continuo), conexiones residuales hiper-conectadas con proyeccion Sinkhorn sobre el poliedro de Birkhoff, y entrenamiento con el optimizador Muon (Newton-Schulz ortogonalizado) en lugar de AdamW puro para las matrices ocultas. Ademas incluye un conjunto de "motores diagnosticos" (solvers racionales exactos, auditor de falsacion con CVaR, monitor de descubrimiento) que no forman parte del modelo neuronal sino del runtime que lo acompania.

Por tamano y contexto, es un modelo extremadamente pequeno (0,2 GB de repo) pensado para ejecucion en CPU y experimentacion con arquitecturas alternativas, no para produccion general. Su relevancia es, por tanto, principalmente de investigacion: explora ideas como hyper-connections, gating dendritico o optimizadores ortogonalizados en un regimen de parametros muy bajo. La licencia es MIT, lo que permite uso comercial, pero el modelo se publica explicitamente como "Experimental" y no como predeterminado promovido de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cognitive-fabric (SCF): MoE propietario con ConnectomeCore, RecursiveThinkingCore, hyper-connections Sinkhorn y gating dendritico apical |
| Parametros totales | 36.628.023 |
| Parametros activos | 9.161.127 (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en `.pt` de PyTorch, sin GGUF ni safetensors publicados) |
| Idiomas soportados | no disponible (vocabulario de 9.460 tokens, sin lista de idiomas declarada) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`weights/v102_scf_frontier.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer-MoE de arquitectura propietaria ("cognitive-fabric") con dos nucleos diferenciados: un `ConnectomeCore` de inspiracion conectomica (modelo bilateral del sistema nervioso central masculino) con gating dendritico apical activo (`cns_dendritic_apical=True`), y un `RecursiveThinkingCore` con sincronizacion temporal por pares de "Continuous Thought Machine" (`thinking_ctm_synchrony=True`). Las conexiones residuales usan "Manifold-Constrained Hyper-Connections" (`use_mhc_residual=True`, `mhc_streams=2`, `mhc_sinkhorn_iters=20`), que proyectan la mezcla de streams residuales sobre el poliedro de Birkhoff (matriz doblemente estocastica, norma espectral <= 1).

El entrenamiento parte del checkpoint v101 (`v101_scf_cognitive.pt`) mediante `MuonHybridOptimizer`: momentum Nesterov ortogonalizado con Newton-Schulz quintico de 5 pasos para las matrices ocultas 2D, y AdamW desacoplado para embeddings, normalizaciones, sesgos y compuertas. No se especifican en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO. Los benchmarks declarados indican que el ajuste fino se realizo sobre un conjunto muy pequeno de tareas sinteticas orientadas a composicion de frases y generalizacion, con `dev_loss = 0.0181` y `tier3_unseen_sentence = 0.0502` (perplejidad 1.0515).

## Capacidades

- Generacion de texto autoregresiva (`pipeline_tag: text-generation`), con `max_new_tokens` de referencia de 96 en las evaluaciones publicadas.
- Razonamiento de composicion de frases y generalizacion a frases no vistas (evaluado en la "Generalisation Ladder" v58).
- Resolucion simbólica exacta via el runtime `scf`: sistemas 3x3 por Gauss-Jordan, determinantes y trazas 2x2/3x3, exponenciacion e inverso modular, factorizacion de primos, totiente de Euler, PMF binomial, teorema de Bayes, resistencias en paralelo y optica de lente delgada.
- Tool calling / function calling: no declarado en la informacion disponible.
- Agentes y razonamiento multi-paso: no declarado; el runtime incluye motores diagnosticos (`NexusSearchHybridRRF`, `TesseraRatifiedLemmaCommons`, `CounterformFalsificationAuditor`, `CarrierInteractionAtlas`, `SonapseDiscoveryMonitor`, `HyperionComputeScheduler`) con `answer_authority=False` y recibos SHA-256, pero no se describe un uso agéntico general.
- Capacidades multilingues: no disponibles; vocabulario de 9.460 tokens sin idiomas declarados.
- Capacidades especiales: modo de pensamiento continuo (`thinking_ctm_synchrony`), gating dendritico apical, decodificacion especulativa verificada (`speculative_matches_greedy` en las 5/5 comprobaciones v58).
- Verificacion formal: el runtime incluye solvers racionales exactos sin `eval`, orientados a comprobacion de resultados.

## Casos de uso

- Experimentacion con arquitecturas MoE de muy baja escala: util para investigadores que quieran reproducir y estudiar hyper-connections Sinkhorn, gating dendritico o optimizador Muon en un regimen de 36 M parametros, con checkpoint unico de 0,2 GB y ejecucion en CPU.
- Benchmarking de optimizadores alternativos: permite comparar Muon hibrido frente a AdamW en un modelo pequeno y con evaluaciones declaradas de generalizacion (`tier1`/`tier3`), sirviendo como banco de pruebas controlado.
- Verificacion simbolica asistida: el runtime `scf` puede usarse como calculadora exacta (sistemas lineales, modular, Bayes, fisica basica) en pipelines donde se exige aritmetica racional sin errores de coma flotante.
- Prototipado de decodificacion especulativa: el modelo declara coincidencia exacta entre decodificacion especulativa y greedy (`speculative_matches_greedy`), lo que lo hace util para validar implementaciones de speculative decoding antes de escalar a modelos mayores.
- Educacion y demostraciones: al ser un modelo de 0,2 GB con servidor Flask incluido (`supermix_chat_server.py`), sirve para demostrar conceptos de MoE, Sinkhorn y gating dendritico en entornos docentes sin GPU.
- Auditoria de falsacion: el `CounterformFalsificationAuditor` con `ABSTAIN_UNSUPPORTED` (fail-closed) puede integrarse como capa de rechazo en sistemas que requieren abstenerse ante afirmaciones no soportadas, aunque su alcance esta limitado al dominio sintetico del modelo.
- Evaluacion de robustez de vocabulario pequeno: permite estudiar como se comporta un LM con 9.460 tokens en tareas de composicion, util para decidir si reducir vocabulario en modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor (Windows CPU, `max_new_tokens=96`):

| Suite | Resultado | Recibo |
|---|---:|---|
| Generalisation Ladder v58 | `dev_loss = 0.0181`, `tier1 = 0.0048`, `tier3 = 0.0502`, `5/5 PASS` | `results/generalisation_results.json` |
| Standalone Neural seed=82 (41 tareas) | 35/41 (0,8537) | `results/eval_v102_seed82.json` |
| Standalone Neural seed=83 (82 tareas) | 72/82 (0,8780) | `results/eval_v102_n82_seed83.json` |
| Standalone Neural seed=84 (82 tareas) | 71/82 (0,8659) | `results/eval_v102_n82_seed84.json` |
| Combinado 3 seeds (205 tareas) | 178/205 (86,8 %) | comparado con v96 (180/205), v100 (179/205), v101 (178/205) |
| SCF Hybrid (`scf bench --seed 82 --neural`) | 41/41 (1,0000) | `results/scf_bench_v102_seed82.json` |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores corresponden a suites internas del autor y no son directamente comparables con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada: al tratarse de 36,6 M parametros totales (9,1 M activos) y un repo de 0,2 GB, la inferencia en FP32 requiere aproximadamente 150 MB de pesos, mas overhead de activaciones; en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: innecesarias; el autor reporta benchmarks en CPU Windows. Cualquier GPU con >= 1 GB de VRAM (GTX 1050, RTX 3050, etc.) es suficiente.
- Consumer GPU: si, cabe en todas las GPU consumer modernas e incluso en CPU.
- Opciones de despliegue: servidor Flask incluido (`source/supermix_chat_server.py`), runtime `python -m scf`, libreria PyTorch. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI (el formato `.pt` propietario no es directamente compatible con estos runners sin conversion).
- Latencia y throughput: no disponibles; el autor declara ejecucion en CPU Windows con `max_new_tokens=96` pero no publica tiempos.

## Comparativa con modelos similares

No hay modelos publicos directamente comparables en tamano, arquitectura y tarea con datos de benchmarks estandar. La comparacion interna disponible (segun el autor) es con versiones de la misma familia:

| Modelo | Parametros totales / activos | Contexto | Resultado 205 tareas | Licencia | Estado |
|---|---|---|---|---|---|
| Supermix v102 | 36,6 M / 9,2 M | no disponible | 178/205 | MIT | Experimental |
| Supermix v101 | no disponible | no disponible | 178/205 | MIT | base de v102 |
| Supermix v100 | no disponible | no disponible | 179/205 | MIT | no disponible |
| Supermix v96 | no disponible | no disponible | 180/205 | MIT | Promovido por defecto (#1) |

## Limitaciones y advertencias

- Modelo experimental: el autor lo marca explicitamente como "Experimental" (regla 9, `automatic_promotion_enabled=False`); el checkpoint promovido por defecto sigue siendo v96.
- Tamano minimo: 36,6 M parametros y vocabulario de 9.460 tokens limitan drasticamente la cobertura lexica y la calidad en texto general fuera del dominio sintetico de entrenamiento.
- Idiomas: no se declaran idiomas soportados; el vocabulario pequeno sugiere cobertura limitada y probable sesgo hacia el ingles o datos sinteticos.
- Contexto: no se documenta la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado sobre tareas sinteticas, la generacion libre fuera de dominio es propensa a incoherencias; los benchmarks declarados miden composicion de frases, no factualidad.
- Benchmarks internos: las cifras (86,8 % combinado, perplejidades cercanas a 1) provienen de suites propias del autor, no de evaluaciones estandar reproducibles por terceros; deben tomarse con cautela.
- Formato de pesos propietario: `.pt` de PyTorch sin safetensors ni GGUF publicados, lo que complica el despliegue con runners estandar.
- Sesgos: no se documentan sesgos conocidos ni auditorias; el "ConnectomeCore" bilateral masculino es una metafora arquitectonica, no una validacion empirica.
- Licencia MIT: permite uso comercial, pero al no haber garantias de calidad en dominio general, no se recomienda para produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v102
- Modelo base v101: https://huggingface.co/Kai9987kai/supermix-v101
- Modelo v96 (promovido por defecto): https://huggingface.co/Kai9987kai/supermix-v96
- Repositorio GitHub del runtime: https://github.com/kai9987kai/Supermix (commit `main` `db535a42`)
