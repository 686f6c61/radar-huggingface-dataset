# ahrazzle/aletheia-prover-0.5b

## Resumen
Aletheia-Prover-0.5B es un micro-modelo especializado derivado de Qwen/Qwen2.5-0.5B, publicado por el usuario ahrazzle dentro del proyecto Foundation-0/aletheia (Track S95). No es un modelo de propósito general: está entrenado para dos tareas concretas de verificación formal en Lean 4. La primera es la auditoría de escapes y límites de confianza del kernel (R10+), detectando 15 clases de construcciones que rompen la garantía de prueba (sorry, axiom, native_decide, unsafe, implemented_by, escapes de metaprogramación o lexer, etc.) y devolviendo el resultado en JSON estricto. La segunda es la síntesis de tácticas Lean puras sobre Init en Lean 4.36.0, actuando como filtro rápido de Tier-1 que propone tácticas sin sorry ni Classical.choice, verificadas después contra un kernel Lean real.

El modelo se obtiene fusionando un adaptador LoRA (rank 16, alpha 32, 8.798.208 parámetros entrenables sobre 168 proyecciones lineales) en los pesos estándar de Qwen2ForCausalLM, con 494.032.768 parámetros totales y licencia Apache 2.0 heredada. Su relevancia es acotada pero clara: demuestra que un modelo de 0,5B puede servir como filtro local barato y determinista delante de un verificador formal, con cero aceptaciones falsas, en lugar de sustituir a un prover de gran escala.

La propuesta es deliberadamente conservadora: el modelo no pretende demostrar teoremas difíciles, sino triar y auditar a bajo coste, escalando los objetivos no resueltos a provers de frontera. Está entrenado y evaluado únicamente en inglés y su ámbito es Lean 4, no matemáticas generales ni código arbitrario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM), adaptador LoRA fusionado en los pesos base |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B; el autor no la declara en la model card) |
| Tipos de cuantización | no disponible (repo en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, SHA-256 ca62bd458f32caab25949a41aa3b8c64cf39e688c00a2e427e61d3c2d4d93755) |

## Arquitectura y entrenamiento
La base es un transformer decoder-only de la familia Qwen2 con 24 capas, sobre el que se aplicó un LoRA estándar de rango 16 y alpha 32 en las 7 proyecciones lineales de cada capa (168 módulos en total), con un presupuesto de 8.798.208 parámetros entrenables. Tras el entrenamiento, el adaptador se fusionó en los pesos estándar de Qwen2ForCausalLM, de modo que la inferencia no requiere cargar el adaptador por separado. No se documenta en la información disponible el número de tokens de entrenamiento ni la composición completa del corpus más allá de los ficheros publicados.

Los datos de entrenamiento son tres conjuntos disjuntos alojados en ahrazzle/aletheia-specialists-s95-datasets: prover_train.jsonl (270 filas), prover_eval_tactics.jsonl (24 teoremas no vistos de las tracks S85..S88) y prover_eval_audit.jsonl (25 fragmentos de escape con plantillas no vistas). El entrenamiento se ejecutó en una NVIDIA RTX 3080 Laptop GPU de 8 GiB, con 180,66 s de tiempo de entrenamiento, 2.572 MiB de VRAM pico y semilla 42 bajo procedencia determinista Zone-B (mlos stamp-run --zone B). La innovación técnica no está en la arquitectura, sino en el protocolo: la evaluación se hace contra un kernel Lean 4.36.0 real con aritmética exacta sobre Q (fractions.Fraction) y un router fail-closed Law-3 que impide aceptar pruebas no verificadas.

## Capacidades
- Auditoría de escapes del kernel Lean 4 (R10+): clasifica 15 clases de bypass de confianza (sorry, axiom, native_decide, unsafe, implemented_by, escapes de metaprogramación y de lexer, entre otras) y emite el resultado en JSON estricto.
- Detección de violaciones de límites de confianza en fragmentos de código Lean, con formato de salida consumible por pipelines automáticos.
- Síntesis de tácticas Lean 4 puras sobre Init (versión 4.36.0), orientada a tácticas sin sorry y sin Classical.choice.
- Actuación como filtro Tier-1 en un router fail-closed: propone tácticas y escala los objetivos no resueltos a provers de frontera.
- Generación de texto conversacional (pipeline text-generation, tag conversational), limitada al dominio de verificación formal.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión ni audio documentadas.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No se documenta modo thinking explícito ni decodificación especulativa.

## Casos de uso
- Auditoría automática de repositorios Lean 4 en CI: el modelo recibe fragmentos de prueba y devuelve JSON con la clase de escape detectada, de modo que un pipeline puede bloquear merges que introduzcan sorry, axiom o native_decide sin revisión humana previa.
- Filtro Tier-1 delante de un prover de frontera: dado un objetivo, el modelo propone tácticas candidatas; las que el kernel Lean 4.36.0 acepta se devuelven y las que fallan se escalan, reduciendo el coste de llamadas a modelos grandes.
- Verificación de material docente y apuntes formalizados: comprobación de que los ejemplos de un curso de Lean no dependen de axiomas prohibidos ni de tácticas que rompan la garantía de prueba.
- Preprocesado en pipelines de demostración asistida: clasificación rápida de goals triviales o de un solo paso (latencia de 620,65 ms para tácticas en RTX 3080) antes de invocar un prover mayor.
- Auditoría de seguridad de código formal en entornos de investigación: revisión de parches en librerías Lean para detectar introducción de unsafe o implemented_by, con 215,17 tok/s en la tarea de auditoría.
- Control de calidad en la generación de datasets de pruebas formales: etiquetado automático de si un fragmento sintético contiene escapes R10+, útil para curar corpus de entrenamiento de provers mayores.
- Despliegue en hardware de consumo para triaje local: al caber en una GPU de 8 GiB en bfloat16, permite filtrar pruebas en estaciones de trabajo sin acceso a clúster.

## Benchmarks y rendimiento

| Métrica | Qwen2.5-0.5B base | Aletheia-Prover-0.5B |
|---|---|---|
| Auditoría de escapes R10+ con plantillas no vistas (N = 25) | 0/25 (F1 = 0,0000) | 25/25 (100,00 %, F1 = 1,0000, 19/0/0/6) |
| Pruebas no vistas verificadas por kernel Lean 4.36.0 (N = 24) | 0/24 (0,00 %) | 5/24 (20,83 %, 0 escapes R10+, 0 aceptaciones falsas) |
| NLL sobre objetivo held-out (desde 2,2394) | 2,2394 | 1,6570 (ΔL = 0,5824) |
| NLL de retención de dominio base (ΔF desde 2,0399) | 2,0399 | 2,3704 (+0,3305, F/L = 0,5675) |
| Latencia de inferencia, tácticas / auditoría R10+ (RTX 3080) | 466,7 ms / 225,1 ms | 620,65 ms / 67,67 ms (215,17 tok/s en auditoría) |

Teoremas no vistos resueltos y verificados por el kernel Lean 4.36.0, sin violaciones R10+ ni axiomas prohibidos: SovereignStackFourthOrder.borromean_4way_non_degeneracy_universal, S87UniversalHigherOrderAtlas.ceer_five_gate_borromean_necessity_universal, S87UniversalHigherOrderAtlas.s87_corpus_anchored_witness_suite, AletheiaMeshEngine.k16_balanced_order1_to_4_exponential_collapse y AletheiaMeshEngine.k8_balanced_order1_to_4_total_5cell_extinction.

## Requisitos de hardware
- VRAM estimada: aproximadamente 1 GiB en bfloat16 para los 494 millones de parámetros; el autor reporta 2.572 MiB de pico durante el entrenamiento, no durante la inferencia.
- GPU validadas: NVIDIA RTX 3080 Laptop GPU de 8 GiB (entorno de entrenamiento y evaluación reportado).
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GiB o más; en cuantizaciones de 8 bits o 4 bits cabría en GPUs de 4-6 GiB, aunque el autor no publica variantes cuantizadas.
- Opciones de despliegue: transformers (referencia de la model card), text-generation-inference (tag text-generation-inference) y endpoints compatibles; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI más allá del tag.
- Latencia y throughput reportados en RTX 3080: 620,65 ms por propuesta de táctica, 67,67 ms por auditoría R10+ y 215,17 tok/s en la tarea de auditoría.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aletheia-Prover-0.5B | 494 M | no disponible | Auditoría R10+ y tácticas Lean 4 | apache-2.0 | Hugging Face (ahrazzle) |
| Qwen/Qwen2.5-0.5B | 494 M | 32.768 tokens (según la familia Qwen2.5; no verificado en esta ficha) | Propósito general, multilingüe | apache-2.0 | Hugging Face (Qwen) |
| Qwen2.5-Coder-0.5B | 494 M | 32.768 tokens (según la familia Qwen2.5; no verificado en esta ficha) | Generación de código | apache-2.0 | Hugging Face (Qwen) |

No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa con otros provers especializados; la model card solo compara contra el modelo base Qwen2.5-0.5B.

## Limitaciones y advertencias
- Techo de tácticas documentado (FM-03-PROVER-0_5B-TACTIC-CEILING): 19 de 24 pruebas algebraicas multi-paso no vistas fallan de forma cerrada en el kernel Lean 4.36.0; el modelo solo resuelve el 20,83 % de los objetivos de evaluación.
- El modelo está diseñado exclusivamente como filtro Tier-1 detrás de un kernel Lean real y un escáner estático R12; usarlo sin esa verificación posterior invalida su garantía de cero aceptaciones falsas.
- Riesgo de alucinación en tácticas: propone pasos que pueden no compilar; el diseño asume que el kernel los rechaza, no que el modelo acierte.
- Degradación del dominio base: la NLL de retención sube de 2,0399 a 2,3704 (+0,3305), por lo que el modelo pierde capacidad general respecto a Qwen2.5-0.5B.
- Solo inglés y solo Lean 4; no cubre otros asistentes de pruebas (Coq, Isabelle, Agda) ni matemáticas informales.
- Licencia Apache 2.0 heredada, que permite uso comercial, pero sin garantías del autor sobre idoneidad en producción.
- Sin datos publicados sobre sesgos sociales ni sobre comportamiento fuera del dominio; no hay descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta).
- La longitud de contexto efectiva no está declarada por el autor; no debe asumirse la de la familia Qwen2.5 sin verificación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ahrazzle/aletheia-prover-0.5b
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/ahrazzle/aletheia-specialists-s95-datasets
- Pull request del proyecto Aletheia (Track S95): https://github.com/Foundation-0/aletheia/pull/95
- Repositorio del proyecto Aletheia: https://github.com/Foundation-0/aletheia
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
