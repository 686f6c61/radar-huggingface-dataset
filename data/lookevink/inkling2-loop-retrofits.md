# lookevink/inkling2-loop-retrofits

## Resumen

Inkling-2 Recurrent Loop Retrofits es una colección de adaptadores de bucle recurrente (recurrent loop adapters) desarrollada por el usuario lookevink que trasplanta la arquitectura Inkling 2 Mini de Thinking Machines sobre cuatro modelos fundacionales open-weight ya preentrenados: Qwen3-4B, Qwen3.8-27B, Gemma-4-31B-it y Gemma-4-26B-A4B-it. La propuesta central es añadir profundidad de cómputo latente en tiempo de inferencia sin modificar los pesos base: el modelo base permanece congelado al 100% y un adaptador ligero inyecta estado entre pasadas sucesivas del mismo núcleo compartido.

El esquema sigue el patrón `prelude → core compartido × P pasadas con reset de prelude + MessageAttentionResidual de 4 consultas + inyección de mensaje con compuerta → coda`. La innovación destacada por el autor es el `ScalarPassGate`, un controlador de tan solo 0,74 M de parámetros (0,018% del total) que, según la model card, supera al controlador Inkling-2 de rango 64 (63,2 M) en el caso de Qwen3-4B. La promesa de "zero-forgetting" se apoya en que con P=1 los logits son idénticos bit a bit a los del modelo base original.

El modelo resulta relevante porque propone una vía para escalar cómputo en test-time sin reentrenar el modelo base ni emitir tokens de cadena de pensamiento, con adaptadores de entre 2,9 MB y 507 MB. No obstante, conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que la model card está redactada por el propio autor, por lo que los resultados deben interpretarse como hallazgos preliminares no replicados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con bucle latente (prelude → core compartido × P pasadas → coda); adaptadores sobre bases dense, MoE e híbridas GatedDeltaNet |
| Parámetros totales | Depende del adaptador: 0,74 M (Qwen3-4B scalar-gate), 52,1 M (Gemma-4-26B-A4B), 63,2 M (Qwen3-4B r64), 79,1 M (Qwen3.8-27B), 132,6 M (Gemma-4-31B) |
| Parámetros activos | No aplica al adaptador; el modelo base Gemma-4-26B-A4B-it es MoE (no se detalla el reparto activo/total en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se cargan en bfloat16 según el quickstart) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`loop_adapter.safetensors`) + `loop_config.json`, `metrics.json`, `eval_predictions.jsonl`, `train_log.jsonl` |

## Arquitectura y entrenamiento

La arquitectura replica el esquema Inkling 2 Mini: una fase de prelude, un núcleo compartido que se ejecuta P veces con reset de prelude entre pasadas, un mecanismo MessageAttentionResidual de 4 consultas y una inyección de mensaje con compuerta, seguida de una coda. Los pesos del modelo base permanecen congelados y las proyecciones de compuerta se inicializan a cero en FP32, lo que garantiza que con P=1 la salida sea idéntica a la del modelo original (verificado con `max |logits(P=3) - logits(P=1)| = 0.0` en el paso 0). El entrenamiento se realizó en 13 ejecuciones concurrentes sobre cuatro NVIDIA DGX Spark (GB10, 121 GiB de memoria unificada).

El autor reporta dos hallazgos técnicos centrales. Primero, que el entrenamiento con P fijo (P=3) produce una oscilación de periodo 2 severa, con picos de NLL de 5,24 y 3,28 en P=2 y P=4, lo que motiva el uso de `varloop` (entrenamiento con profundidad variable). Segundo, que el bucle ingenuo en capas intermedias sin reset de prelude ni compuertas con inicialización a cero provoca un colapso total en el paso 0 (0,0% de precisión ID/OOD, NLL 12,04). Como prueba causal de que la transferencia de estado entre pasadas es real y está alineada por token, el autor muestra que barajar las posiciones de token dentro de los mensajes de la pasada 3 hace colapsar ambos modelos Gemma 4 (de 37,3% a 0,8% en el 26B-A4B y de 24,6% a 3,7% en el 31B). No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos mediante profundidad latente variable (P = 1..5) sin emitir tokens de cadena de pensamiento.
- Razonamiento algorítmico y simbólico: el autor reporta mejoras en Pointer Chase, Graph BFS y Cup-Swap en los benchmarks internos.
- Razonamiento matemático directo sin CoT: se reporta GSM8K del 37,5% al 39,6% en el adaptador scalar-gate de Qwen3-4B.
- Ajuste de cómputo en tiempo de inferencia por petición: se puede mantener un único modelo en VRAM y elegir P por solicitud sin intercambiar pesos.
- Preservación del comportamiento del modelo base con P=1 (zero-forgetting verificado bit a bit).
- Tool calling, function calling y capacidades de agente: no disponibles de forma explícita en la información proporcionada (dependen del modelo base).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio): no disponibles; los adaptadores se cargan mediante `load_text_causal_lm`, lo que sugiere uso exclusivamente de texto.

## Casos de uso

- Razonamiento algorítmico en producción con presupuesto de cómputo ajustable: el adaptador permite subir P de 1 a 3 o 5 por petición para tareas de planificación o resolución de grafos, manteniendo P=1 para consultas triviales y sin cambiar de modelo en memoria.
- Sustitución de cadena de pensamiento por cómputo latente: en pipelines donde los tokens de CoT encarecen la facturación o filtran razonamiento interno, el bucle latente ofrece profundidad adicional sin emitir tokens intermedios.
- Despliegue en hardware con memoria unificada limitada: el adaptador scalar-gate de 2,9 MB sobre Qwen3-4B permite añadir capacidad de razonamiento con un coste de almacenamiento mínimo, adecuado para entornos edge o estaciones DGX Spark.
- Investigación en test-time compute: el código reproducible y las 13 ejecuciones con métricas permiten estudiar la relación entre profundidad latente y precisión en tareas de seguimiento de estado.
- Prototipado de agentes con planificación multi-paso: el modelo base Qwen3-4B conserva sus capacidades de instrucción y el bucle añade pasadas internas para tareas de búsqueda en grafos (BFS reportado al 100% en el adaptador MoE de Gemma-4-26B-A4B).
- Evaluación comparativa de arquitecturas recurrentes: los adaptadores cubren familias dense (Qwen3-4B, Gemma-4-31B), MoE (Gemma-4-26B-A4B) e híbrida GatedDeltaNet (Qwen3.8-27B), lo que facilita estudios cruzados de la técnica de bucle sobre distintas arquitecturas base.
- Ajuste fino de subproductos sin reentrenar el base: al mantener los pesos base congelados, equipos que ya tienen un modelo base en producción pueden evaluar el adaptador de forma aislada y revertir a P=1 sin degradación.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor y de sus métricas internas (ID/OOD sobre tareas de razonamiento algorítmico, GSM8K directo sin CoT y NLL). No se han publicado resultados en benchmarks estándar independientes (MMLU, HumanEval, etc.) en la información disponible.

| Adaptador | Base | Params entrenables | ID base (P=1) | Mejor ID bucleado | OOD base | Mejor OOD | Notas |
|---|---|---:|---:|---:|---:|---:|---|
| qwen3-4b-scalar-gate-loop | Qwen3-4B | 0,74 M (0,018%) | 16,0% | 41,0% (P=3/5) | 5,2% | 10,4% | GSM8K 39,6%; NLL 0,80 |
| gemma4-26b-a4b-inkling2-varloop | Gemma-4-26B-A4B-it | 52,1 M (0,206%) | 32,1% | 37,3% | 7,5% | 11,2% | BFS ID 100% |
| gemma4-31b-inkling2-varloop | Gemma-4-31B-it | 132,6 M (0,430%) | 38,1% | 24,6% | 11,2% | 13,8% | OOD NLL 1,74 |
| qwen38-27b-inkling2-varloop | Qwen3.8-27B | 79,1 M (0,293%) | 27,6% | 31,3% | 7,5% | 13,8% | GSM8K 53,1% |
| qwen3-4b-inkling2-varloop | Qwen3-4B | 63,2 M (1,546%) | 16,0% | 23,1% | 5,2% | 6,2% | BFS ID 63,9% |

Comparaciones internas reportadas por el autor: el adaptador scalar-gate de 0,74 M alcanza el 85% del rendimiento de un LoRA de una pasada de 66,1 M (48,1%) con 90 veces menos parámetros, y supera a ese LoRA en NLL OOD más profundo (1,73 frente a 2,17) con una latencia un 15% menor (179 ms frente a 208 ms con P=3). En Gemma-4-31B, el bucle congelado alcanza 13,8% OOD (NLL 1,74) frente al 8,8% (NLL 2,25) del LoRA de 97,9 M. En Gemma-4-26B-A4B, el bucle duplica al LoRA de 44,6 M en pointer chasing OOD de 5-6 saltos (20% frente a 10%).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Depende del modelo base: Qwen3-4B en bfloat16 requiere aproximadamente 8 GB; Gemma-4-31B y Qwen3.8-27B en bfloat16 requieren del orden de 60 GB o más; Gemma-4-26B-A4B, al ser MoE, puede requerir menos memoria activa que su tamaño total.
- Los adaptadores añaden entre 2,9 MB y 507 MB, un coste despreciable frente a los pesos base.
- GPU recomendadas: el autor entrenó y evaluó en cuatro NVIDIA DGX Spark (GB10, 121 GiB de memoria unificada). Para los modelos de 27B-31B se requiere hardware de clase A100/H100 o estaciones con memoria unificada grande; para Qwen3-4B es viable en GPU de consumo con suficiente VRAM.
- Cabe en GPU de consumo: el adaptador Qwen3-4B sí, en tarjetas con 8-12 GB de VRAM (RTX 4090, RTX 3090, etc.), siempre que el modelo base quepa en bfloat16 o cuantizado.
- Opciones de despliegue: el quickstart usa `transformers` con el cargador propio `inkling_loop.py` y `huggingface_hub`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el autor reporta 179 ms frente a 208 ms por pasada en el adaptador scalar-gate de Qwen3-4B con P=3, es decir, un 15% más rápido que el LoRA de una pasada comparable. No se aportan cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo / técnica | Params entrenables | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Inkling-2 scalar-gate (Qwen3-4B) | 0,74 M | No disponible | 41,0% ID / 10,4% OOD | Apache 2.0 | Hugging Face (lookevink/inkling2-loop-retrofits) |
| LoRA de una pasada (Qwen3-4B) | 66,1 M | No disponible | 48,1% ID / NLL OOD 2,17 | No disponible | Control interno del autor |
| Inkling-2 r64 (Qwen3-4B) | 63,2 M | No disponible | 23,1% ID / 6,2% OOD | Apache 2.0 | Hugging Face (mismo repo) |
| Inkling 2 Mini (Thinking Machines) | No disponible | No disponible | No disponible | No disponible | Referencia arquitectónica citada por el autor |

No se dispone de comparaciones con modelos de la misma categoría fuera del ecosistema del autor. Los controles LoRA son entrenados por el propio autor y no están publicados como modelos independientes en la información disponible.

## Limitaciones y advertencias

- Los resultados proceden únicamente de la model card del autor y de métricas internas sobre tareas de razonamiento algorítmico; no hay evaluación independiente ni benchmarks estándar publicados.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (23 de noviembre de 2026), lo que indica ausencia de validación por la comunidad.
- En el adaptador Gemma-4-31B, el mejor ID bucleado (24,6%) es inferior al ID base con P=1 (38,1%), lo que sugiere que el bucle puede degradar el rendimiento en distribución en algunos modelos pese a mejorar el OOD.
- El adaptador r64 sobre Qwen3-4B rinde peor que el base en ID (23,1% frente a 16,0% de base, mejora modesta) y muy por debajo del scalar-gate, lo que indica alta sensibilidad a la configuración del adaptador.
- El entrenamiento con P fijo produce oscilaciones de periodo 2; usar profundidades no entrenadas (P=2 o P=4 con un adaptador entrenado con varloop) puede degradar el rendimiento.
- El bucle ingenuo sin reset de prelude ni compuertas con inicialización a cero colapsa el modelo; no es una técnica plug-and-play trivial.
- No hay información sobre sesgos, alucinación, cobertura idiomática ni restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- La licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos base (Qwen y Gemma) deben verificarse por separado, ya que Gemma tiene términos propios de uso.
- El despliegue requiere código personalizado (`inkling_loop.py`) y no se documenta compatibilidad con servidores de inferencia estándar como vLLM o TGI, lo que limita su uso en producción a gran escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lookevink/inkling2-loop-retrofits
- Código reproducible y métricas de las 13 ejecuciones: https://github.com/looskis/labski/tree/main/research/inkling-loop
- Anuncio de Inkling 2 Mini (Thinking Machines): https://thinkingmachines.ai/news/inkling-2-mini/
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it
- Modelo base Gemma-4-26B-A4B-it: https://huggingface.co/google/gemma-4-26B-A4B-it
