# KerzgrAI/Monody-Exp

## Resumen

Monody-Exp es un modelo de lenguaje autorregresivo de 353 millones de parametros (353.160.288 exactos, segun los pesos en safetensors) publicado por KerzgrAI bajo licencia Apache 2.0. Se presenta explicitamente como una prueba de concepto y como el gemelo autorregresivo de Rondo-Exp, un modelo de difusion enmascarada entrenado en paralelo con el mismo presupuesto de datos. El objetivo declarado no es el uso productivo, sino la comparacion controlada de como dos objetivos de entrenamiento distintos explotan el mismo corpus a lo largo de pasadas repetidas.

La arquitectura es hibrida: 12 capas con mezcladores de tokens GDN-2 (gated DeltaNet 2, atencion lineal con estado recurrente) y 4 capas de atencion Parallax, lo que da 16 capas en total con una ventana de entrenamiento de 2.048 tokens. El modelo se entreno sobre 88 millones de tokens de FineWeb-Edu repetidos 7 veces (617 millones de tokens vistos), con ajustes de optimizador identicos a los de Rondo-Exp, y los pesos publicados son la media exponencial (EMA) tras la septima pasada.

Su relevancia es acotada pero concreta: es un modelo base pequeno, solo en ingles, que no sigue instrucciones y que sirve como referencia empirica para estudiar atencion lineal hibrida, sobreajuste por repeticion de datos y comparativas diffusion frente a next-token. Con 45,6 % de acierto medio zero-shot en seis tareas y una perdida held-out de 3,632 (NLL exacta), su interes es de investigacion, no de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal: 12 capas GDN-2 (gated DeltaNet 2) + 4 capas de atencion Parallax |
| Parametros totales | 353.160.288 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; ventana de entrenamiento de 2.048 tokens |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria pytorch); repo de 0,7 GB |

## Arquitectura y entrenamiento

Monody-Exp es un modelo causal de 16 capas que combina dos tipos de mezclador de tokens: 12 capas GDN-2, un mecanismo de atencion lineal con estado recurrente y compuerta derivado de DeltaNet, y 4 capas de atencion Parallax, un esquema de atencion que el autor no detalla en la model card. Rondo-Exp, su gemelo, usa la misma distribucion (12 GDN-2 + 4 atencion) pero con mezcladores bidireccionales y objetivo de difusion enmascarada, lo que permite aislar el efecto del objetivo de entrenamiento manteniendo casi constante el reparto de capas. El modelo depende de la libreria flash-linear-attention para la implementacion de los kernels, que se instala automaticamente en la primera ejecucion del script de inferencia.

El entrenamiento uso 88 millones de tokens de FineWeb-Edu repetidos 7 veces, es decir, 617 millones de tokens procesados, con ventanas de 2.048 tokens y exactamente los mismos ajustes de optimizador que Rondo-Exp. Los pesos liberados son la EMA tras la septima pasada, y la perdida held-out se mide sobre 101 millones de tokens no vistos. No se documenta en la informacion disponible si hubo fases de RLHF, DPO o ajuste por instrucciones; de hecho, el autor afirma que el modelo no sigue instrucciones, lo que es coherente con un modelo base sin post-entrenamiento alineado. Tampoco se detalla la composicion del tokenizador ni el desglose del dataset mas alla del identificador HuggingFaceFW/fineweb-edu.

## Capacidades

- Generacion de texto autoregresiva: continuacion de un prompt dado, sin modo chat ni plantilla de instrucciones.
- Razonamiento y conocimiento factual de nivel basico, limitado por sus 353M de parametros y por un corpus de preentrenamiento de solo 88M tokens unicos.
- Capacidad multilingue practicamente nula: el modelo esta etiquetado unicamente como ingles.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes, planificacion multi-paso ni modo de razonamiento explicito (thinking mode).
- Sin capacidades de vision, audio ni multimodalidad.
- Control de decodificacion en el script de inferencia: `--max-new-tokens`, `--temperature` (0 = greedy), `--top-p`, `--top-k` y `--seed`.
- Ejecucion verificada en Linux con GPU NVIDIA; requiere flash-linear-attention.

## Casos de uso

- Referencia academica para estudiar atencion lineal hibrida: permite medir, con un presupuesto de computo modesto (617M tokens vistos), como se comportan 12 capas GDN-2 frente a 4 capas de atencion completa en perplejidad y en tareas zero-shot.
- Ablacion controlada de objetivos de entrenamiento: al compartir corpus, tokens vistos y ajustes de optimizador con Rondo-Exp, sirve para comparar next-token frente a difusion enmascarada aislando el objetivo como variable.
- Estudio del sobreajuste por repeticion de datos: la diferencia entre perdida de entrenamiento y held-out (1,59 en Monody frente a 0,13 en Rondo) es un punto de partida medible para analizar memorizacion en regimenes de 7 epocas sobre datos escasos.
- Prueba de integracion de stacks de inferencia: al depender de flash-linear-attention y de kernels GDN-2, es util para validar que un entorno (CUDA, version de PyTorch, compilacion de kernels) funciona antes de escalar a modelos mayores de la misma familia.
- Experimentos de ajuste fino supervisado a baja escala: con 0,7 GB en bf16 cabe en cualquier GPU consumer y permite probar recetas de SFT o LoRA sobre un modelo base pequeno sin coste apreciable de computo.
- Demostraciones docentes de decodificacion: los parametros de muestreo del script permiten ilustrar greedy frente a top-k/top-p y el efecto de la temperatura en un modelo de coste casi nulo.
- Generacion de texto de relleno para pruebas de pipelines: continuaciones de frases en ingles para validar formateadores, sistemas de logging o test de latencia, sin depender de APIs externas.

## Benchmarks y rendimiento

Los unicos datos publicados son la perdida held-out y la media de seis tareas zero-shot (1.000 ejemplos cada una: LAMBADA, ARC-Easy, PIQA, SciQ, HellaSwag y WinoGrande). No se publica el desglose por tarea.

| Metrica | Monody-Exp | Rondo-Exp (referencia) |
|---|---|---|
| Objetivo | Next token | Difusion enmascarada |
| Mezcladores de tokens | 12 GDN-2 + 4 atencion Parallax | 12 GDN-2 bidireccional + 4 atencion bidireccional |
| Perdida held-out | 3,632 (NLL exacta) | <= 3,810 (cota ELBO; no comparable directamente) |
| Held-out menos perdida de entrenamiento | 1,59 | 0,13 |
| Precision media zero-shot (6 tareas) | 45,6 % | 44,8 % |
| Parametros | 353M | No disponible en la informacion proporcionada |

Advertencia: la perdida de Rondo-Exp es una cota superior de su NLL (ELBO), por lo que el autor indica explicitamente que no es comparable de forma directa con la NLL exacta de Monody-Exp. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de tareas de generacion de codigo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 0,75-1,0 GB (pesos de 0,7 GB mas overhead de activaciones y cache); en fp32, alrededor de 1,5-1,8 GB; en cuantizacion de 8 bits, en torno a 0,4-0,6 GB (estimaciones aritmeticas a partir de los 353M de parametros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA razonablemente moderno; el autor solo verifica Linux con GPU NVIDIA. Para lotes grandes o entrenamiento, A100 o H100 son adecuadas pero sobredimensionadas para 353M de parametros.
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y practicamente cualquier tarjeta con 4 GB o mas de VRAM en bf16.
- Opciones de despliegue: el repositorio incluye `inference.py` con PyTorch y requiere flash-linear-attention. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al no haber pesos GGUF publicados, llama.cpp y Ollama no son viables sin conversion previa, y la arquitectura GDN-2 hibrida probablemente requiera soporte especifico en dichos motores.
- Latencia y throughput: no disponibles. Por tamano, se espera una latencia por token muy baja en GPU moderna, pero no hay cifras publicadas ni mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Monody-Exp | 353M | 2.048 tokens de entrenamiento | Hibrida: 12 GDN-2 + 4 atencion Parallax, objetivo next-token | Apache 2.0 | 45,6 % medio zero-shot en 6 tareas; NLL held-out 3,632 |
| Rondo-Exp | No disponible | 2.048 tokens de entrenamiento | Hibrida: 12 GDN-2 + 4 atencion, bidireccional, difusion enmascarada | Apache 2.0 (mismo autor) | 44,8 % medio zero-shot; ELBO <= 3,810 |
| Otros modelos base de ~350M (Pythia-410M, GPT-2 medium, etc.) | ~350-410M | No disponible en esta ficha | Transformer denso con atencion completa | Variable | No disponible: no se han aportado datos comparativos en la informacion proporcionada |

La unica comparacion con datos verificables es la de su gemelo Rondo-Exp. Frente a modelos densos de tamano similar, la diferencia relevante es arquitectonica (mezcladores lineales GDN-2) y de presupuesto de datos: 88M tokens unicos es un regimen muy por debajo de los estandares habituales de preentrenamiento, lo que hace que la comparacion de precision zero-shot con modelos publicos de su talla no sea representativa sin datos adicionales.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no tiene plantilla de chat y fallara en tareas de asistente. El propio autor indica que "no esta pensado para uso real".
- Riesgo alto de alucinacion y de texto incoherente en generaciones largas: 353M de parametros y solo 88M tokens unicos de preentrenamiento.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgo, toxicidad ni analisis de la composicion de FineWeb-Edu mas alla de su identificador. FineWeb-Edu es un corpus filtrado por criterios educativos, con la cobertura y los sesgos propios de la web rastreada.
- Limitacion idiomatica: solo ingles; el rendimiento en castellano no esta evaluado y previsiblemente sera pobre.
- Longitud de contexto: la unica cifra conocida es la ventana de entrenamiento de 2.048 tokens; no se documenta si el modelo soporta secuencias mayores en inferencia. No debe asumirse extrapolacion a contextos largos.
- Brecha de generalizacion: la diferencia entre perdida de entrenamiento y held-out es de 1,59, muy superior a la de su gemelo (0,13), lo que sugiere memorizacion apreciable tras 7 pasadas sobre el mismo corpus.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero la licencia no implica idoneidad tecnica; el uso en produccion con este modelo no esta respaldado por sus resultados.
- Dependencia tecnica: requiere flash-linear-attention y kernels GDN-2, lo que limita la portabilidad a motores de inferencia estandar y a plataformas no NVIDIA (no verificadas por el autor).
- Datos incompletos: no hay informacion sobre tokenizador, composicion exacta del dataset, hiperparametros de entrenamiento ni desglose de benchmarks por tarea.
- Trazabilidad temporal: las fechas del repositorio (creacion 2026-10-27) deben tomarse como las reportadas por HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KerzgrAI/Monody-Exp
- Modelo gemelo (difusion enmascarada): https://huggingface.co/KerzgrAI/Rondo-Exp
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Libreria de kernels requerida (mencionada en la model card): flash-linear-attention (sin URL especifica en la informacion disponible)
- Paper, blog o demo: no disponibles en la informacion proporcionada.
