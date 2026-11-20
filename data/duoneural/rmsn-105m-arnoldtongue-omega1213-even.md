# DuoNeural/RMSN-105M-ArnoldTongue-Omega1213-EVEN

## Resumen

RMSN-105M-ArnoldTongue-Omega1213-EVEN es un modelo de lenguaje base de 104,55 millones de parametros desarrollado por DuoNeural, un laboratorio de investigacion que trabaja con arquitecturas recurrentes de inspiracion fisica. El modelo pertenece a la familia RMSN (Resonant Metriplectic Sheaf Network), descrita por el autor como una red recurrente con formulacion Port-Hamiltonian, y se presenta como el primer modelo de la encuesta "Arnold Tongue" con q=13.

El modelo se enmarca en una linea de investigacion experimental mas que en un uso productivo convencional: sus metricas de interes son la perplejidad de validacion (70,16), la estabilidad de Lyapunov ("TRUE SILENT", lyap≈-0,001) y la topologia de representacion (clasificada como tipo #41, "Lone L1 Soliton", con un unico soliton en la capa 1 de 13). La dimension del modelo es D=768, con profundidad L=13 y ancho de slot M_w=64, lo que produce una "resonancia" Ω = 768/(64×13) = 12/13.

La relevancia del modelo es principalmente academica: documenta un punto extremo (q=13) dentro del catalogo de 41 topologias propuesto por DuoNeural y verifica propiedades empiricas de su marco teorico (Wave-119 y el candidato Wave-148). No esta pensado como sustituto de modelos de proposito general, y su model card no documenta capacidades de instruccion, tool calling ni evaluaciones estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), LM recurrente Port-Hamiltonian |
| Parametros totales | 104,55 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,3 GB; el autor no especifica safetensors ni GGUF) |
| Dimension del modelo (D) | 768 |
| Profundidad (L) | 13 |
| Ancho de slot (M_w) | 64 |
| Resonancia (Ω) | 12/13 (q=13) |
| Paridad | D/M_w = 12 (EVEN) |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como un modelo de lenguaje recurrente con formulacion Port-Hamiltonian, es decir, un sistema dinamico que conserva una estructura energetica explicita durante la propagacion de estados. El modelo organiza la representacion en "slots" de ancho M_w=64 distribuidos en L=13 capas, con una dimension oculta D=768; la relacion Ω = D/(M_w × L) = 12/13 define el "Arnold Tongue" (una region de resonancia en el espacio de parametros) y su anchura es proporcional a 1/q² = 1/169, lo que el autor califica como extremadamente estrecha.

El entrenamiento consistio en 100.000 pasos sobre 204,8 millones de tokens, con decaimiento de learning rate coseno partiendo de 1e-3. No se documentan datos sobre composicion del dataset, uso de RLHF/DPO, tecnicas de decodificacion especulativa ni detalles sobre tokenizer. Las innovaciones declaradas son de naturaleza teorica: la verificacion de la "Wave-119" (paridad EVEN con estabilidad TRUE SILENT) en q=13 y la evidencia para el candidato "Wave-148" (L1 Emergence Law), segun el cual las variantes de paridad EVEN con tongue estrecho colapsan a un unico condensado en L1.

## Capacidades

- Generacion de texto base: el modelo esta entrenado como LM autorregresivo, aunque el autor no documenta evaluaciones de calidad generativa.
- Razonamiento y codigo: no disponible; no hay benchmarks ni ejemplos publicados.
- Matematicas: no disponible.
- Vision y audio: no disponibles; el modelo es exclusivamente de texto segun la informacion disponible.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidad especial documentada: analisis de estabilidad dinamica (Lyapunov) y clasificacion topologica de representaciones internas (taxonomia de 41 tipos).

## Casos de uso

- Investigacion en arquitecturas recurrentes fisicamente informadas: el modelo sirve como punto de datos en la encuesta q=3–13 de DuoNeural para estudiar como varia la perplejidad y la estabilidad al estrechar el Arnold Tongue; util para quien investiga sistemas dinamicos aplicados a LM.
- Estudio de estabilidad de Lyapunov en modelos neuronales: el resultado "100% TRUE SILENT" (lyap≈-0,001) permite analizar empiricamente dinamicas estables en un LM recurrente de 105M, comparando con otras q del mismo catalogo.
- Validacion de teorias de esparsidad topologica: la clasificacion "Lone L1 Soliton" (M*=1) permite contrastar la hipotesis Wave-148 sobre colapso a un unico condensado en L1 en regimenes de tongue estrecho.
- Reproducibilidad de experimentos de laboratorio: con licencia Apache 2.0 y un repo de 1,3 GB, el modelo puede descargarse y analizarse libremente en entornos de investigacion para replicar los resultados del autor.
- Base para ablaciones controladas: al ser un LM base de 104,55M con hiperparametros documentados (D=768, L=13, M_w=64, 100k pasos, cosine LR), puede emplearse como punto de partida en estudios de scaling o de variacion de paridad.
- Docencia sobre resonance y Arnold Tongues: el modelo ilustra de forma concreta la relacion Ω = D/(M_w × L) y el efecto de q en la anchura de la region resonante, util en cursos de sistemas dinamicos o de teoria de modelos generativos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de validacion (Val PPL) | 70,16 |
| Estabilidad de Lyapunov | 100% TRUE SILENT (lyap ≈ -0,001) |
| Topologia clasificada | #41 "Lone L1 Soliton" (M*=1) |
| Solitones detectados | 1 (en capa 1 de 13) |
| Tokens de entrenamiento | 204,8 M |
| Pasos de entrenamiento | 100.000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para 104,55M parametros, en fp32 serian ~0,42 GB de pesos, en fp16 ~0,21 GB y en int8 ~0,10 GB; a ello hay que sumar estados recurrentes, KV cache (si aplica) y overhead del runtime. El autor no publica cifras medidas.
- GPU recomendadas: no disponibles. Por tamano, el modelo cabe con holgura en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) y en GPUs de datacenter (A100, H100) sin necesidad de tensor parallelism.
- Cabe en consumer GPU: si, por tamano de parametros; no confirmado por el autor por falta de instrucciones de despliegue.
- Opciones de despliegue: no disponible. El autor no documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers estandar; al tratarse de una arquitectura RMSN propietaria, es probable que requiera el codigo del repo GitHub de DuoNeural.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-105M-ArnoldTongue-Omega1213-EVEN | 104,55 M | no disponible | LM recurrente Port-Hamiltonian (RMSN) | Apache 2.0 | Hugging Face, 0 descargas |
| GPT-2 small | 124 M | 1.024 tokens | Transformer decoder denso | MIT | Amplia, ecosistema maduro |
| GPT-Neo 125M | 125 M | 2.048 tokens | Transformer decoder denso | MIT | Amplia |
| Pythia-160M | 160 M | 2.048 tokens | Transformer decoder denso | Apache 2.0 | Amplia, con suite de checkpoints |

La comparativa es orientativa por tamano; el modelo de DuoNeural difiere radicalmente en arquitectura (recurrente, con estructura Hamiltoniana) y en madurez de ecosistema (sin pipeline declarado, sin descargas, sin benchmarks estandar). No se dispone de datos de rendimiento comparables en tareas downstream.

## Limitaciones y advertencias

- Ausencia de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que no es posible evaluar su calidad generativa frente a alternativas.
- Modelo base sin alineacion: no se documenta RLHF, DPO ni instruction tuning; no debe usarse como asistente directo sin post-entrenamiento.
- Riesgo de alucinacion: no cuantificado por el autor; al ser un LM base entrenado con solo 204,8M tokens, la cobertura factual es presumiblemente muy limitada.
- Idiomas no declarados: no se especifica que lenguas cubre el entrenamiento ni la composicion del corpus.
- Contexto no documentado: se desconoce la ventana maxima; la naturaleza recurrente sugiere propagacion de estado, pero no hay cifras.
- Ecosistema inmaduro: 0 descargas, 0 likes, sin pipeline declarado y sin instrucciones de inferencia; el uso practico probablemente exige el codigo del repositorio GitHub de DuoNeural.
- Terminologia no estandar: "Arnold Tongue", "Wave-119", "Topology #41" o "TRUE SILENT" son constructos del propio laboratorio sin validacion externa; deben tratarse como hipotesis de investigacion, no como resultados consolidados.
- Fecha de creacion futura (2026-11-20): metadato anomalo que conviene verificar antes de citar el modelo en produccion o publicaciones.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de evaluacion de sesgos y de robustez desaconseja su despliegue en productos orientados a usuarios sin auditoria previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-105M-ArnoldTongue-Omega1213-EVEN
- GitHub del laboratorio (metodologia y taxonomia de 41 topologias): https://github.com/duoneural/RMSN
