# maxgfr/s5-lite

## Resumen

s5-lite es un modelo de decisión de 17 millones de parámetros publicado por el desarrollador independiente maxgfr. No es un modelo generativo: recibe un estado (por ejemplo, un mensaje de cliente), una pregunta y un conjunto de opciones con definiciones de una línea, y devuelve en un único forward pass probabilidades calibradas sobre esas opciones. Está construido sobre el encoder Ettin-17M (familia ModernBERT) afinado por completo y se distribuye como un único archivo GGUF de 20,7 MB en cuantización q8_0.

Su rasgo diferencial es la arquitectura que el autor denomina "iso": cada opción atiende únicamente al estado, a la pregunta y a su propia definición, nunca a las demás opciones ni a su clave. De ahí se derivan dos garantías por construcción, verificadas con tests exactos: reordenar las opciones no altera ninguna probabilidad y renombrar las claves (incluido intercambiar sí y no) tampoco. El estado se codifica una sola vez y se reutiliza para todas las preguntas que se le hagan.

Es relevante ahora porque propone una alternativa ligera y determinista a los clasificadores basados en LLM generativos: inferencia en unos 15-20 ms por decisión, ejecución en navegador mediante WebAssembly y un motor de inferencia propio escrito en Rust. El autor lo presenta explícitamente como artefacto de demostración e investigación, no como clasificador de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Ettin-17M, familia ModernBERT) con atención aislada por opción ("iso") y cabeza de lectura f32 |
| Parámetros totales | 17.060.097 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8_0 (encoder) con readout f32; cuantización de 8 bits validada frente a f32 |
| Idiomas soportados | inglés (no existe versión en francés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único de 20,7 MB); también disponible el checkpoint base en safetensors |
| Modelo base | cross-encoder/ettin-reranker-17m-v1 |
| Pipeline | text-classification (clasificación zero-shot sobre opciones) |
| Motor de inferencia | skycmd (Rust, compilable a wasm32); no compatible con llama.cpp |
| Dataset de entrenamiento | LocalLLaMA/typed-decisions y otros (ver sección de entrenamiento) |

## Arquitectura y entrenamiento

El encoder es Ettin-17M, un ModernBERT de 17 millones de parámetros, afinado en su totalidad. La innovación está en el enmascaramiento de atención: el estado atiende solo al estado; la pregunta atiende al estado y a la pregunta; y la opción i atiende al estado, a la pregunta y a la opción i únicamente, compartiendo posiciones. Cada opción se lee solo a través de su definición, de modo que la clave (`billing`, `yes`, `A`) nunca llega al modelo. Esto garantiza por construcción la invariancia al orden de las opciones y a la renombración de claves, comprobada con tests exactos a 1e-6 tanto en nativo como en WASM.

El entrenamiento se hizo con AdamW (learning rate de la cabeza multiplicado por 20), warmup con decaimiento lineal, EMA de los pesos y una pérdida combinada de entropía cruzada suave, Brier y RPS para preguntas ordenadas, más KL simétrica entre pares de paráfrasis y distractores. Fueron 8.000 pasos con batch 32 en bf16 sobre un Apple M5. Los datos son en inglés: etiquetas gold de datasets con licencias permisivas (typed-decisions, BoolQ, MNLI, ARC, CommonsenseQA, Banking77, trazas CC0 de Open-Jev, conjuntos de tasksource y otros), etiquetas suaves de laya-typed-decisions (Apache-2.0) conservadas solo donde coinciden con el gold, y generadores de datos escritos en código (reglas, tono, hechos enterrados, pares de paráfrasis y distractores, familias de coherencia). No se usaron datos generados por GLM. Los estados de evaluación y demostración se eliminaron del entrenamiento mediante cobertura de 13-gramas y MinHash de casi duplicados.

## Capacidades

- Clasificación zero-shot sobre un conjunto arbitrario de opciones, cada una con una definición de una línea.
- Devolución de probabilidades calibradas en un único forward pass, con temperaturas ajustadas por tipo de pregunta y número de opciones.
- Invariancia garantizada al orden de las opciones y a la renombración de claves (incluido el intercambio sí/no).
- Reutilización de la codificación del estado para múltiples preguntas sobre el mismo texto.
- Preguntas de tipo elección y preguntas ordenadas (con pérdida RPS específica).
- Ejecución en navegador vía WebAssembly, en Node, Python, CLI y servidor.
- No soporta generación de texto libre, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Triaje de mensajes de soporte: dado un mensaje de cliente, clasificarlo entre categorías como facturación, bug, cuenta o incierto, con definiciones por categoría y umbrales por tarea. Los 15-20 ms por decisión permiten clasificar en tiempo real.
- Moderación de contenido en el cliente: ejecución en navegador mediante WASM para etiquetar toxicidad o intención sin enviar el texto a un servidor, útil por privacidad y latencia.
- Enrutamiento de intenciones en asistentes conversacionales: elegir entre un conjunto fijo de intenciones definidas, aprovechando que el estado se codifica una vez y se reutiliza para varias preguntas.
- Etiquetado de bajo coste en pipelines de datos: clasificación masiva de registros con un modelo de 20,7 MB que cabe en cualquier entorno, incluidos dispositivos con recursos limitados.
- Clasificación zero-shot de textos cortos en tareas tipo BoolQ, ARC o Banking77, con la salvedad de que el autor advierte de contaminación potencial por el profesor en algunos conjuntos.
- Filtro previo o escalado en sistemas híbridos: usar el modelo para decisiones de baja confianza y derivar al LLM generativo solo los casos ambiguos, aunque el autor señala que aún no hay umbral de aceptación certificado con Learn-then-Test a α ≤ 10 %.

## Benchmarks y rendimiento

Resultados de la evaluación pre-registrada del proyecto; el checkpoint `long-b-s0` es una ejecución más larga (8.000 pasos) de la configuración iso, elegida por NLL de validación fuera de las apuestas pre-registradas.

| Conjunto | Exactitud [IC 95 %] | Nota |
|---|---|---|
| typed-decisions test (2.000 preguntas) | 0,696 [0,675; 0,716] | oscar-1-17m obtiene 0,682 en los mismos registros |
| amazonpolarity (zero-shot) | 0,771 | clase mayoritaria 0,523 |
| wikitoxic toxicaggregated (zero-shot) | 0,674 | clase mayoritaria 0,509 |
| hwu64 (zero-shot, 8 opciones) | 0,763 | no se excluye contaminación a través del profesor |
| sib200 en (zero-shot, 7 opciones) | 0,549 | clase mayoritaria 0,250 |
| casos de demostración (inglés) | 21 / 30 | |

Robustez y coherencia (conjuntos de test fuera de entrenamiento):

| Prueba | Resultado |
|---|---|
| Reasignación de etiquetas (intercambio sí/no) | 0 % de volteos (garantizado) |
| Definiciones parafraseadas | 26 % de volteos (exactitud 0,696 → 0,602) |
| Distractores (JevOut-lite) | 6,8 % de volteos con el peor distractor |
| Cuantización de 8 bits | ECE varía menos de 0,003 frente a f32 |

## Requisitos de hardware

- El archivo GGUF q8_0 ocupa 20,7 MB, por lo que la inferencia cabe en cualquier dispositivo con unos pocos cientos de MB de RAM; no requiere GPU.
- No se publican requisitos de VRAM específicos; por tamaño, es desplegable en CPU, móvil y navegador.
- GPU recomendadas: no aplica; el modelo está pensado para CPU y WASM. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja relevante.
- Cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.), aunque no es su entorno objetivo.
- Despliegue mediante el motor skycmd (`sky-serve` / binario `skycmd`), disponible para navegador, Node, Python, CLI y servidor. No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia declarada: 15-20 ms por decisión en navegador mediante WebAssembly. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s5-lite | 17 M | no disponible | 0,696 en typed-decisions test; 0,771 en amazonpolarity zero-shot | Apache-2.0 | GGUF, motor skycmd |
| oscar-1-17m | 17 M | no disponible | 0,682 en typed-decisions test (mismos registros) | no disponible | no disponible |
| laya-typed-decisions | no disponible | no disponible | usado como fuente de etiquetas suaves (Apache-2.0) | Apache-2.0 | Hugging Face |
| cross-encoder/ettin-reranker-17m-v1 | 17 M | no disponible | modelo base; sin datos comparativos en la información disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de las alternativas más allá de la comparación directa con oscar-1-17m en typed-decisions.

## Limitaciones y advertencias

- Tareas desbalanceadas de sí/no: en cuatro conjuntos de test (biasframes intent y sex, wikitoxic insult y threat) rinde peor que responder siempre la clase mayoritaria, porque sobrepredice la clase positiva rara. No debe usarse como guardrail sin umbrales por tarea.
- La calibración es infraconfiada en decisiones tipadas; las temperaturas se ajustaron en un conjunto de validación dominado por otras fuentes.
- No hay escalado controlado: con los datos de calibración disponibles, Learn-then-Test no certificó ningún umbral de aceptación a α ≤ 10 %.
- Solo inglés; no existe versión en francés.
- La robustez frente a la redacción de las definiciones es aprendida, no garantizada: parafrasear las definiciones provoca un 26 % de volteos.
- Riesgo de contaminación en hwu64 a través del profesor, no descartado.
- Es una demostración y un artefacto de investigación, no un clasificador de producción.
- No es compatible con llama.cpp ni con los runners habituales de GGUF; requiere el motor skycmd.
- Sesgos conocidos: no se documentan más allá del comportamiento desbalanceado en tareas sí/no.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s5-lite
- Demo (Space): https://huggingface.co/spaces/maxgfr/s5-lite
- Código (skycmd, Rust): https://github.com/maxgfr/skycmd
- Resultados pre-registrados: https://maxgfr.github.io/skycmd/results/
- Guía de instalación: https://maxgfr.github.io/skycmd/install/
- Licencias de datos: https://github.com/maxgfr/skycmd/blob/main/DATA_LICENSES.md
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-17m-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Etiquetas suaves (laya-typed-decisions): https://huggingface.co/convaiinnovations/laya-typed-decisions
