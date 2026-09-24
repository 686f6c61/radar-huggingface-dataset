# PIXELZX/XERON-0.4

## Resumen

XERON-0.4 es la cuarta entrega de la familia XERON, desarrollada por PIXELZX. Se trata de un modelo de decisión tipada (enfoque "System 1") derivado de XERON-0.2, que a su vez es un ajuste fino del checkpoint multilingüe de convaiinnovations/laya sobre el backbone jhu-clsp/mmBERT-base. Tiene 321.908.998 parámetros (unos 322 M) y responde preguntas tipadas sobre un estado —de tipo `choice`, `score` y `noul` (booleano)— en una sola pasada, devolviendo probabilidades calibradas.

La diferencia clave frente a un modelo generativo es que XERON-0.4 no produce texto: no puede alucinar ni emitir esquemas malformados, lo que lo hace apto para decisiones estructuradas, deterministas y auditables dentro de un pipeline.

La versión 0.4 no amplía el corpus, sino que estabiliza el entrenamiento: una sola epoch sobre 61.876 secuencias, ~2,8 h en 2×T4 en fp16, con un objetivo atenuado (`rl_weight 0.5`, σ de 0,3 a 0,2, `lr_head 5e-5`) y calibración de temperatura post-hoc `[2,254, 1,810, 3,188]`. El resultado es el mejor rendimiento global de la familia en JevBench (0,558 sobre 231 ítems públicos), a costa de una calibración peor que la de XERON-0.2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone jhu-clsp/mmBERT-base) con cabezas de decisión tipada (`choice` / `score` / `noul`), no autorregresiva |
| Parámetros totales | 321.908.998 (~322 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de entrenamiento); para contextos mayores hay que ampliar `CTX_CAP` y reentrenar |
| Tipos de cuantización | No disponible en la información proporcionada (entrenamiento e inferencia en fp16) |
| Idiomas soportados | Inglés (`en`), coreano (`ko`) y multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tamaño del repo: 0,7 GB) |

## Arquitectura y entrenamiento

El modelo parte del backbone `jhu-clsp/mmBERT-base` (encoder tipo BERT multilingüe) y hereda el checkpoint multilingüe de Laya, al que se añaden cabezas de decisión tipada. La inferencia es no autorregresiva: dada una descripción textual del estado y un conjunto de preguntas tipadas, cada una con sus opciones, el modelo emite en una única pasada hacia delante una distribución de probabilidad por pregunta. No existe decodificación de tokens, de modo que no hay posibilidad de generar texto libre, alucinaciones ni esquemas inválidos.

El entrenamiento de XERON-0.4 es un refinamiento corto sobre el checkpoint de XERON-0.2, no una ejecución con más datos: 1 epoch, 61.876 secuencias, ~2,8 h en 2×T4 con fp16. La receta atenúa el objetivo respecto al intento fallido de 0.3 (`rl_weight 0.5`, annealing de σ de 0,3 a 0,2, `lr_head 5e-5` en lugar de 1e-4, `weight_decay 0.02`). El motivo del ajuste está documentado: en 0.3, el término de gradiente de política RLCD escala como `1/(2σ²)`, por lo que annealar σ hasta 0,1 amplificó el gradiente unas 50 veces, elevó la escala de los logits y provocó sobreajuste en la segunda epoch (pérdida de 1,075 a 1,289). Tras el entrenamiento se aplica calibración de temperatura post-hoc. Los datos de entrenamiento provienen del corpus jev-bench (Jevify), mayoritariamente con una sola etiqueta por caso.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado textual en tres formatos: `choice` (elección entre opciones), `score` (puntuación por niveles) y `noul` (booleano).
- Predicción en una sola pasada, sin generación de texto: no puede alucinar ni producir JSON o esquemas malformados.
- Devolución de probabilidades calibradas (temperatura ajustada post-hoc), aptas para umbrales y para decisiones con confianza explícita.
- Multitarea sobre un mismo estado: se pueden enviar varias preguntas tipadas distintas en una única llamada a `predict`.
- Soporte multilingüe declarado: inglés, coreano y multilingüe.
- No hay soporte documentado de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo "thinking". El modelo no genera texto en ningún caso.

## Casos de uso

- Evaluación de cumplimiento de políticas: dado un estado en lenguaje natural con las reglas aplicables y los hechos de un caso (por ejemplo, una política de reembolsos y los datos del cliente), el modelo responde con `noul` si la acción está permitida bajo dicha política, con una probabilidad asociada.
- Priorización y triaje de incidencias: usando preguntas de tipo `score` con niveles definidos (por ejemplo, "0 — sin presión" a "3 — crítico"), se puede puntuar la urgencia de un caso sin necesidad de que un LLM genere la etiqueta.
- Enrutado de intenciones y clasificación de tickets: preguntas de tipo `choice` permiten seleccionar una categoría entre un conjunto acotado de opciones; conviene mantener el número de opciones bajo el límite `head_max_len=256` para evitar truncamiento.
- Verificación booleana de reglas de negocio: comprobaciones del tipo "¿se cumple la condición X dado este estado?" en pipelines de validación, con probabilidad calibrada para decidir si se requiere revisión humana.
- Pre-filtrado en arquitecturas RAG o híbridas: usar XERON-0.4 como primera etapa que decide si una consulta es resoluble con reglas o si debe escalarse a un LLM generativo, reduciendo coste y latencia del componente caro.
- Etiquetado asistido con human-in-the-loop: al devolver probabilidades, permite enrutar a revisión manual únicamente los casos con confianza baja, usando ECE como referencia de fiabilidad.
- Clasificación multilingüe en inglés y coreano: útil en flujos de atención al cliente o análisis documental que mezclan ambos idiomas, aprovechando el backbone multilingüe de mmBERT.
- Evaluación automatizada de decisiones en entornos de pruebas: al ser no generativo y determinista en su esquema de salida, se integra bien en baterías de tests de regresión que comprueban que una política produce la decisión esperada.

## Benchmarks y rendimiento

JevBench v1.3 (solo ítems públicos, subconjunto emparejado; de las 534 decisiones del conjunto congelado solo 231 son públicas, por lo que estos resultados no son directamente comparables con los rangos publicados del board). Todos los sistemas se ejecutaron sobre los mismos 231 ítems con el harness oficial `fstandhartinger/jevbench` (adaptador `laya_local`).

| Sistema | easy (48) | standard (72) | hard (111) | Total (231) | Intelligence |
|---|---|---|---|---|---|
| Jev 1.13.0 (TypeSafe, API) | 1,000 | 0,986 | 0,730 | 0,866 | 82,2 |
| XERON-0.4 | 0,958 | 0,611 | 0,351 | 0,558 | 36,0 |
| XERON-0.2 | 0,979 | 0,583 | 0,324 | 0,541 | 34,1 |
| laya-typed-decisions (Convai, 421 M, ajustado) | 0,979 | 0,653 | 0,270 | 0,537 | 38,0 |
| XERON-0.3 (sobreconfiado) | 0,938 | 0,569 | 0,324 | 0,528 | no disponible |
| XERON-0.1 | 0,875 | 0,444 | 0,306 | 0,468 | 23,3 |
| laya-multilingual (base, sin ajuste) | 0,896 | 0,403 | 0,324 | 0,468 | 21,5 |

Evolución interna de la familia:

| Métrica | XERON-0.2 | XERON-0.3 | XERON-0.4 |
|---|---|---|---|
| JevBench global (231) | 0,541 | 0,528 | 0,558 |
| Nivel standard | 0,583 | 0,569 | 0,611 |
| Nivel hard | 0,324 | 0,324 | 0,351 |
| ECE en hard | 0,187 | 0,129 | 0,106 |
| typed-decisions acc | 0,7133 | 0,7117 | 0,7217 |
| typed-decisions soft acc | 0,5353 | 0,3504 | 0,4084 |
| typed-decisions Brier | 0,4242 | 0,5835 | 0,5152 |
| Temperatura ajustada | [0,96; 1,10; 0,57] | [3,14; 5,41; 5,12] | [2,25; 1,81; 3,19] |

Benchmark `LocalLLaMA/typed-decisions`, split de test, 400 casos / 1.400 decisiones:

| Modelo | choice acc | soft acc | Brier | ECE |
|---|---|---|---|---|
| XERON-0.4 | 0,7217 | 0,4084 | 0,5152 | 0,2525 |
| XERON-0.2 | 0,7133 | 0,5353 | 0,4242 | 0,2104 |
| XERON-0.1 | 0,7000 | 0,5171 | 0,4493 | 0,2143 |
| laya-typed-decisions | 0,7333 | 0,4460 | 0,4669 | 0,2380 |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de los 321.908.998 parámetros, no publicada por el autor): ~0,64 GB en fp16, ~1,29 GB en fp32, ~0,32 GB en int8 y ~0,16 GB en int4, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: el entrenamiento documentado se hizo en 2×T4 en fp16; para inferencia es suficiente cualquier GPU con al menos 2-4 GB de VRAM libre.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, etc. También es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: la vía oficial es la librería `laya` (`pip install laya`, `laya.load("PIXELZX/XERON-0.4")`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; al ser un modelo no generativo con cabezas tipadas, los runtimes orientados a decodificación autorregresiva no aplican directamente.
- Latencia y throughput: no disponible en la información proporcionada. Como referencia de coste de entrenamiento, 1 epoch sobre 61.876 secuencias tardó ~2,8 h en 2×T4 en fp16.

## Comparativa con modelos similares

| Modelo | Parámetros | JevBench global (231) | typed-decisions choice acc | Enfoque | Licencia |
|---|---|---|---|---|---|
| XERON-0.4 | 322 M | 0,558 | 0,7217 | Decisión tipada no autorregresiva | Apache-2.0 |
| XERON-0.2 | 322 M (mismo backbone) | 0,541 | 0,7133 | Decisión tipada, mejor calibrado | Apache-2.0 |
| laya-typed-decisions (Convai) | 421 M | 0,537 | 0,7333 | Decisión tipada ajustada | no disponible |
| Jev 1.13.0 (TypeSafe) | no disponible | 0,866 | no disponible | Sistema propietario vía API | no disponible |
| laya-multilingual (base) | no disponible | 0,468 | no disponible | Checkpoint base sin ajustar | Apache-2.0 |

Frente a XERON-0.2, la versión 0.4 gana en precisión de decisión (0,558 frente a 0,541 en JevBench; 0,7217 frente a 0,7133 en typed-decisions) pero pierde en calibración (ECE 0,2525 frente a 0,2104; Brier 0,5152 frente a 0,4242). La elección entre ambos depende de si prima la exactitud de la etiqueta o la fidelidad de la probabilidad. El sistema Jev 1.13.0, propietario y accedido por API, mantiene una ventaja amplia, sobre todo en el nivel hard (0,730 frente a 0,351).

## Limitaciones y advertencias

- Calibración inferior a la de XERON-0.2: las temperaturas ajustadas son [2,25; 1,81; 3,19] frente a valores cercanos a 1,0 en 0.2. La soft accuracy, el Brier y el ECE empeoran respecto a 0.2 (0,4084 frente a 0,5353; 0,5152 frente a 0,4242; 0,2525 frente a 0,2104).
- El autor señala que tanto 0.2 como 0.4 se ejecutaron en hardware distinto de A100 y en fp16, lo que podría influir en la calibración; quedaría por verificar con un reentrenamiento en bf16.
- Contexto limitado a 4.096 tokens en entrenamiento. Los documentos muy largos requieren ampliar `CTX_CAP` y reentrenar; no basta con cambiar el parámetro en inferencia.
- Límite de opciones: las cabezas de la familia Laya usan `head_max_len=256`, por lo que las tareas con muchas alternativas (por ejemplo, 77 o 151 intenciones) ven truncado el texto de las opciones y el rendimiento cae en picado. Esas configuraciones se excluyeron del entrenamiento.
- Brecha grande en el nivel hard de JevBench (0,351 frente a 0,730 de Jev): ese nivel se compone de documentos de política largos, compensaciones ambiguas y preguntas trampa, y los datos de entrenamiento apenas contienen rúbricas redactadas de ese tipo.
- El corpus de entrenamiento es mayoritariamente de etiqueta única, lo que perjudica la fidelidad probabilística (TVD); aumentar la proporción de soft labels es la vía de mejora apuntada por el autor.
- Riesgo de alucinación: el modelo no genera texto, por lo que no puede inventar contenido, pero sí puede devolver una decisión incorrecta con alta confianza si el estado de entrada es ambiguo o queda fuera de la distribución de entrenamiento.
- Sesgos: no se documentan análisis de sesgo específicos en la información disponible.
- Licencia Apache-2.0 en el modelo, pero los datos de entrenamiento (jev-bench) tienen licencias mixtas y remiten a su propio manifiesto; conviene revisarlo antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y una única fuente de evaluación (el propio autor); no hay validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PIXELZX/XERON-0.4
- XERON-0.2 (modelo base directo): https://huggingface.co/PIXELZX/XERON-0.2
- Laya (Convai Innovations, base de la familia): https://huggingface.co/convaiinnovations/laya
- Backbone mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio del proyecto XERON: https://github.com/PIXELZX0/XERON
- Harness oficial de JevBench: https://github.com/fstandhartinger/jevbench
- Dataset jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Librería laya (instalación vía `pip install laya`): no disponible URL directa en la información proporcionada
