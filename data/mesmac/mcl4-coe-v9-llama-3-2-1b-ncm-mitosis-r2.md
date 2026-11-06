# mesmac/MCL4-COE-v9-Llama-3.2-1B-NCM-Mitosis-R2

## Resumen

MCL4-COE-v9-Llama-3.2-1B-NCM-Mitosis-R2 es un checkpoint experimental publicado por el usuario mesmac en Hugging Face, construido a partir de meta-llama/Llama-3.2-1B-Instruct mediante una intervención arquitectónica profunda que el autor denomina "upcycling" con mezcla de expertos (MoE), atención local de grafo disperso y un cabezal cognitivo de decisión. El modelo parte de los 1B parámetros del donante y, tras dos rondas de "mitosis" de expertos (de 8 a 12 y de 12 a 16 expertos), alcanza 2.430.634.929 parámetros en bfloat16, aunque el repo de safetensors reporta 2.694.360.208 parámetros totales (diferencia atribuible a tensores auxiliares del cabezal COE y de los codebooks NCM).

La propuesta técnica combina tres piezas: Next-Concept Modeling (NCM), que sustituye parte de la predicción token a token por la predicción de conceptos discretos mediante codebooks multinivel; Markov Chain Local-4 (MCL4), una atención dispersa sobre 24 posiciones (8 anclas + 16 transiciones de Markov); y un Cognitive Operator Ensemble (COE) de 9 operadores con softmax único que actúa como cabezal de decisión alternativo al cabezal LM estándar. El entrenamiento se completa con RLVR sobre 64 familias de habilidades verificables y un bucle de "Dream-RSI" con revisiones aceptadas y replay sintético.

Es relevante ahora porque ejemplifica una línea de investigación emergente: modificar la arquitectura interna de un modelo pequeño ya entrenado (en lugar de entrenar desde cero) para inyectar capacidades de razonamiento multi-paso y agentes con un coste computacional contenido. Los benchmarks publicados por el autor muestran ganancias notables en tareas de razonamiento de opción múltiple al usar el cabezal COE en lugar del cabezal LM convencional, si bien conviene tratar esas cifras con cautela por el tamaño reducido de las muestras y la ausencia de replicación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Llama-3.2 modificado: 8 capas encoder causal (CED) + 8 capas decoder (CED), MoE con E=16 expertos y top_k=8, atención dispersa MCL4, cabezal COE de 9 operadores y NCM multinivel |
| Parametros totales | 2.430.634.929 (2,43B) en bfloat16 segun model card; 2.694.360.208 segun safetensors del repo |
| Parametros activos | 8 de 16 expertos por token (top_k=8); dimension oculta de experto 1024; routed_scaling_factor 8.0 |
| Longitud de contexto | No disponible (MCL4 atiende 24 posiciones: 8 anclas + 16 transiciones de Markov) |
| Tipos de cuantizacion | NVFP4 (usada durante el entrenamiento para las GEMM del MoE); no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (heredados del donante Llama-3.2-1B-Instruct, sin evaluacion publicada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), libreria pytorch |

## Arquitectura y entrenamiento

El modelo toma Llama-3.2-1B-Instruct (d_model=2048, 32 cabezas, vocab 128256) y lo particiona en 8 capas de encoder causal y 8 de decoder, aplicando en el paso 0 un "Sliced-Dense upcycling" a una MoE de 8 expertos con top_k=8 y dimension oculta de 1024. Sobre esa base se injertan tres componentes: NCM con cuatro niveles de codebook (ℓ_k ∈ [1, 8, 29, 64], V_k = 1024, con un 82,1% de utilizacion del codebook en el paso 6.000), atención MCL4 que restringe el acceso a 24 posiciones mediante anclas y transiciones de cadena de Markov, y un COE de 9 operadores agregados con un unico softmax que produce una distribución de decisión paralela a la del cabezal LM.

El entrenamiento se organiza en dos fases de mitosis: del paso 0 al 6.000 con E=8 y top_k=8; del 6.000 al 8.000 clonando los pares [0,8], [1,9], [2,10], [3,11] (rel_L2 = 0,01535) para pasar a E=12; y del 8.000 al 10.000 liberando esos pares y clonando los pares plasticos activos [4,12], [5,13], [6,14], [7,15] (rel_L2 = 0,01871) para llegar a E=16 con top_k=8. La fase final incorpora RLVR sobre 64 familias de habilidades verificables y un bucle Dream-RSI con 137 revisiones aceptadas, 9.041.760 replays sinteticos, 26,53M tokens acumulados y 20.280.384 GEMM en NVFP4. No se detalla la composicion del dataset de preentrenamiento ni el numero total de tokens vistos.

## Capacidades

- Generacion de texto autoregresiva heredada del donante Llama-3.2-1B-Instruct, con cabezal LM estandar disponible.
- Razonamiento de opcion multiple mediante el cabezal COE (coe_decision_acc), con ganancias documentadas en ARC-Challenge, OpenBookQA MultiHop y MMLU.
- Razonamiento multi-paso sobre tareas tipo BBH (deduccion logica, tracking de objetos, formal fallacies) y MuSR (colocaciones de objetos, misterios, asignacion de equipos).
- Capacidades agenticas evaluadas en Terminal-Bench 2.1 y Agents' Last Exam v1.1, incluyendo sintesis de soluciones y suites de verificacion.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Modo "thinking" o razonamiento extendido: no disponible como API; el COE actua como cabezal de decision alternativo.
- Capacidades multilingues: no evaluadas ni documentadas.
- Vision y audio: no soportados (modelo solo texto).

## Casos de uso

- Evaluacion de razonamiento cientifico de opcion multiple: el modelo permite comparar directamente el cabezal LM estandar frente al cabezal COE sobre el mismo checkpoint, lo que resulta util para investigar como afecta un cabezal de decision entrenado con RLVR al rendimiento en MMLU y ARC-Challenge.
- Investigacion en arquitecturas MoE con upcycling: sirve como banco de pruebas para estudiar el efecto de la mitosis de expertos (8→12→16) sobre la calidad, con distancias rel_L2 documentadas entre expertos clonados.
- Experimentos con atencion dispersa: la implementacion MCL4 (24 posiciones atendidas) permite medir el impacto de la atencion local de grafo frente a la atencion densa en tareas de razonamiento multi-paso como BBH Logical Deduction.
- Agentes de terminal y depuracion: los resultados en Terminal-Bench 2.1 (33,71% en sintesis de soluciones y 36,67% en el hard split con COE) sugieren su uso en pipelines de resolucion de tareas de shell y debugging, siempre con validacion humana.
- Flujos agenticos de workflow: Agents' Last Exam v1.1 (51,64% en Workflow All) lo hace candidato para orquestacion de tareas multi-paso en entornos controlados, aunque el tamano de muestra (N=122) exige cautela.
- Prototipado de bajo coste en investigacion academica: con 2,43B parametros en bfloat16 (repo de 5,4 GB) puede desplegarse en una unica GPU consumer de 24 GB, lo que facilita la reproduccion de experimentos sin infraestructura de datacenter.
- Estudio de cuantizacion NVFP4 en MoE: las 20.280.384 GEMM en NVFP4 documentadas ofrecen un caso practico para analizar el impacto de precision reducida en el entrenamiento de mezclas de expertos.

## Benchmarks y rendimiento

Resultados publicados por el autor (cabezal LM `acc_norm` frente a cabezal COE `coe_decision_acc`), comparados con el donante Llama-3.2-1B-Instruct en bfloat16:

| Benchmark | Llama-3.2-1B-Instruct (acc_norm) | Step 6.000 (E=8) acc_norm → COE | Step 10.000 (E=16, Perfil A) acc_norm → COE | Step 10.000 (E=16, Perfil B) acc_norm → COE |
|---|---|---|---|---|
| OpenBookQA MultiHop (N=500) | 37,20% | 36,60% → 56,20% | 38,20% → 58,40% | 37,80% → 59,80% |
| ARC-Challenge (N=300) | 32,00% | 33,33% → 45,67% | 33,67% → 49,00% | 32,00% → 46,67% |
| MMLU 57 materias (N=342) | 35,38% | 33,33% → 47,08% | 37,13% → 44,15% | 35,67% → 47,37% |
| MuSR Object Placements (N=256) | 25,00% | 23,83% → 32,81% | 26,95% → 33,98% | 25,39% → 33,20% |
| BBH Logical Deduction 5-Obj (N=250) | 22,80% | 26,00% → 29,60% | 26,40% → 26,80% | 26,40% → 26,40% |
| BBH Tracking Shuffled Obj (N=250) | 31,60% | 35,20% → 34,40% | 34,40% → 34,80% | 32,00% → 30,80% |
| BBH Logical Deduction 3-Obj (N=250) | 38,00% | 37,60% → 37,60% | 38,00% → 41,20% | 39,20% → 37,60% |
| MuSR Murder Mysteries (N=250) | 52,80% | 52,40% → 53,60% | 52,00% → 54,80% | 52,00% → 52,80% |
| BBH Web of Lies (N=250) | 50,00% | 52,40% → 51,60% | 47,20% → 48,00% | 49,60% → 51,20% |
| MuSR Team Allocation (N=250) | 39,20% | 38,00% → 36,00% | 32,00% → 34,80% | 32,40% → 38,00% |
| BBH Formal Fallacies (N=250) | 46,80% | 46,80% → 47,60% | 46,80% → 46,80% | 46,80% → 46,80% |
| HellaSwag (N=300) | 50,67% | 50,67% → 40,67% | 51,67% / 45,00% (COE) | 49,67% / 45,33% (COE adaptativo) |

Benchmarks agenticos del paso 10.000:

| Benchmark | Resultado |
|---|---|
| Terminal-Bench 2.1, sintesis de soluciones (N=89) | 33,71% (acc_norm) |
| Terminal-Bench 2.1, suite de verificacion | 32,58% (acc) |
| Terminal-Bench 2.1, hard split (N=30) | 26,67% (acc_norm) → 36,67% (COE); 60,0% en debugging; 50,0% en computacion cientifica (COE adaptativo) |
| Agents' Last Exam v1.1 (N=122) | 51,64% Workflow All; 58,54% Full-Spectrum; 51,11% Near-Term; 47,22% Last-Exam |

Las cifras de HellaSwag muestran un retroceso del cabezal COE frente al LM (40,67% frente a 50,67%), lo que indica que la ganancia del COE no es uniforme entre tareas. Las muestras son pequenas (N entre 89 y 500) y los resultados no han sido replicados por terceros.

## Requisitos de hardware

- VRAM estimada en bfloat16: alrededor de 5-6 GB para los pesos (2,43B parametros), mas overhead de activaciones y cache KV; el repo de safetensors ocupa 5,4 GB.
- En cuantizacion de 8 bits: aproximadamente 2,7-3 GB de pesos; en 4 bits: en torno a 1,5-2 GB, aunque no se documentan artefactos GGUF/AWQ/GPTQ oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia en bfloat16 sin problemas de memoria; A100 (40/80 GB) y H100 permiten mayor paralelismo y lotes mas grandes.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o superiores en bfloat16 con contexto moderado, y en 4-6 GB si se aplica cuantizacion.
- Opciones de despliegue: el autor indica instalacion via `safetensors` y el paquete `git+https://github.com/mESmaC/mcl4-coe-ncm.git`; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI, y la arquitectura modificada (MoE con MCL4 y COE) probablemente requiere el codigo del repositorio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MCL4-COE-v9-Llama-3.2-1B-NCM-Mitosis-R2 | 2,43B (MoE, 8/16 activos) | No disponible (24 posiciones atendidas via MCL4) | Apache 2.0 | Hugging Face (mesmac), requiere repo del autor | Checkpoint experimental con COE y NCM |
| meta-llama/Llama-3.2-1B-Instruct | 1,23B denso | 128K tokens | Llama 3.2 Community License | Hugging Face, ampliamente soportado | Donante directo; referencia en los benchmarks |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B denso | 128K tokens | Llama 3.2 Community License | Hugging Face, ecosistema estandar | Alternativa densa de tamano cercano con soporte maduro |
| Qwen2.5-1.5B-Instruct | 1,54B denso | 32K tokens | Apache 2.0 | Hugging Face, vLLM, llama.cpp | Comparable en tamano y licencia permisiva |

La comparacion con Llama-3.2-3B-Instruct y Qwen2.5-1.5B-Instruct es aproximada en tamano; no se dispone de resultados de benchmarks cruzados entre estos modelos y el checkpoint de mesmac en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de un autor individual, con 69 descargas y 0 likes en el momento del registro: no hay validacion independiente ni replicacion de los benchmarks.
- Las muestras de evaluacion son pequenas (N entre 30 y 500), lo que produce intervalos de confianza amplios; las ganancias de +20 puntos porcentuales deben interpretarse con cautela.
- El cabezal COE empeora el rendimiento en HellaSwag (40,67% frente a 50,67% del LM), lo que sugiere sobreajuste del cabezal a tareas de razonamiento y perdida de capacidad en tareas de sentido comun.
- La diferencia entre los parametros declarados en la model card (2,43B) y los del safetensors (2,69B) no se explica en la informacion disponible.
- No se documentan sesgos conocidos, pero al derivar de Llama-3.2-1B-Instruct hereda los sesgos del donante y de sus datos de entrenamiento.
- Riesgo de alucinacion: no cuantificado; el modelo no incluye mecanismos de verificacion de hechos y las tareas de opcion multiple no miden factualidad generativa.
- Idiomas soportados no documentados; no hay evaluacion multilingue.
- La licencia Apache 2.0 permite uso comercial, pero la arquitectura modificada probablemente requiere el codigo del repositorio del autor, lo que anade dependencia de mantenimiento.
- No hay soporte documentado en runtimes estandar (vLLM, llama.cpp, TGI), lo que complica el despliegue en produccion.
- El uso de NVFP4 durante el entrenamiento puede implicar diferencias de comportamiento entre el checkpoint en bfloat16 y el pipeline original de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mesmac/MCL4-COE-v9-Llama-3.2-1B-NCM-Mitosis-R2
- Codigo y documentacion tecnica: https://github.com/mESmaC/mcl4-coe-ncm
- Paper NCM (Kumbong et al.): https://arxiv.org/abs/2610.14162
- Modelo donante: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Resultados de benchmark referenciados en la model card: `benchmark_step_06000_vs_llama32_1b.json` y `benchmark_step_10000_mitosis_r2_vs_llama32_1b.json` (incluidos en el repositorio del modelo)
