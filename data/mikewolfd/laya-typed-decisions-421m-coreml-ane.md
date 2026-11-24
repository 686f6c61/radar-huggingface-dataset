# mikewolfd/laya-typed-decisions-421m-coreml-ane

## Resumen

Laya-Typed-421M (6-Bucket Multifunction Core ML ANE) es una conversión precompilada del modelo `convaiinnovations/laya-typed-decisions` al formato Core ML, optimizada para ejecutarse íntegramente en la Neural Engine (ANE) de los chips Apple Silicon. Lo publica el usuario `mikewolfd` como parte del ecosistema `fast-silicon` (librería `fast-decision-models`), y su propósito es ofrecer inferencia de baja latencia para tareas de decisión tipadas (clasificación y enrutamiento) sobre hardware Apple, sin depender de GPU ni de fallback a CPU.

El modelo base es de arquitectura ModernBERT con aproximadamente 421 millones de parámetros, reempaquetado en seis "buckets" de longitud de secuencia (`s64`, `s128`, `s192`, `s256`, `s384`, `s512`) para cubrir distintos tamaños de entrada con un único bundle multifunción. La conversión emplea cuantización de pesos `W8A16` y un esquema de LayerNorm en FP16 con protección de precisión explícita, lo que permite colocar el 100 % de las operaciones (10.538 de 10.538) en `CPU_AND_NE`, sin operaciones en GPU ni en CPU como respaldo.

Su relevancia actual reside en la combinación de tres factores: licencia Apache 2.0, despliegue puramente local en Apple Silicon y latencias medidas del orden de milisegundos por consulta corta (6,53 ms en un M5, 5,09 ms en un M4 Pro). Está pensado para pipelines de decisión de alta frecuencia donde el coste por inferencia y la privacidad del dato son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), convertido a Core ML multifunción |
| Parametros totales | 421M (según nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 512 tokens (buckets `s64`, `s128`, `s192`, `s256`, `s384`, `s512`) |
| Tipos de cuantizacion | pesos W8, activaciones A16 (`W8A16`); embeddings en FP16 (`laya_typed_emb_f16.npz`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` (Core ML compilado) + `.npz` (embeddings FP16) |

## Arquitectura y entrenamiento

El modelo base `convaiinnovations/laya-typed-decisions` emplea una arquitectura ModernBERT, un transformer encoder con atención bidireccional y mejoras de eficiencia respecto a BERT clásico (atención rotatoria, GeGLU, normalización sin sesgo). Sobre esa base, esta versión aplica una conversión a Core ML con cuantización de pesos a 8 bits y activaciones a 16 bits, manteniendo los embeddings de tokens y de tipo en FP16 como artefacto separado.

La innovación técnica principal no está en el entrenamiento sino en el empaquetado para ANE: se aplica un LayerNorm centrado a dos pasadas con guardas de precisión explícitas (`base_inv_scale=4.0` en `tok_emb`, `s_eff_floor=1/128` en capas `l14..l18`, `max_ln_gain=4.0` en `l19..l27`, `base_inv_scale=0.0625` en cabeza y scorer), se elimina la fusión `common::fuse_layernorm_or_instancenorm` tras la cuantización de pesos y se usa un `mb.einsum` con cabeza dividida. El resultado es un grafo que el compilador de Apple mapea íntegramente a la Neural Engine. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Clasificación y decisión tipadas: el nombre "typed-decisions" sugiere salidas estructuradas con tipos definidos, orientadas a enrutamiento y selección de acciones.
- Inferencia de baja latencia en Apple Silicon: 6,53 ms por pregunta corta en M5 y 5,09 ms en M4 Pro.
- Procesamiento por buckets de longitud: seis funciones (`s64` a `s512`) que permiten elegir el grafo adecuado según el tamaño de entrada y ahorrar cómputo.
- Ejecución 100 % en Neural Engine: sin fallback a GPU ni a CPU, lo que reduce consumo y variabilidad.
- Evaluación en tareas de razonamiento y clasificación: validado sobre RAGTruth, CLINC150 y RewardBench-2 (1.400 ítems).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible; el modelo se describe como "fast-decision", no como agente generativo.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de intenciones en asistentes locales: con CLINC150 como referencia de evaluación, el modelo puede clasificar la intención de una consulta de usuario en milisegundos y decidir qué subsistema la atiende, todo en el dispositivo.
- Filtrado de alucinaciones en pipelines RAG: la validación sobre RAGTruth indica que el modelo está orientado a detectar respuestas no fundamentadas; puede insertarse como verificador previo a la entrega de una respuesta generada por un LLM mayor.
- Selección de recompensa y control de calidad: la evaluación sobre RewardBench-2 sugiere uso como scorer ligero para rankear o descartar candidatos en un pipeline de generación.
- Clasificación de tickets y correos en herramientas de escritorio: al ejecutarse en ANE, permite etiquetar contenido sensible sin enviarlo a la nube, con latencias compatibles con interfaces interactivas.
- Guardarraíl de seguridad en aplicaciones macOS/iOS: decisión rápida sobre si una entrada cumple políticas antes de pasarla a un modelo generativo, aprovechando los 5-7 ms por consulta.
- Procesamiento por lotes de alta frecuencia en servidores Mac: con 153-197 consultas por segundo en preguntas cortas, es viable para preclasificar grandes volúmenes de texto antes de un modelo mayor.
- Enrutamiento en sistemas multiagente: decidir qué agente o herramienta invoca una petición según su tipo, con contexto de hasta 512 tokens.

## Benchmarks y rendimiento

Evaluación Tier-1 sobre RAGTruth + CLINC150 + RewardBench-2 (1.400 ítems):

| Plataforma | Configuración | Aciertos | Tiempo total | Latencia consulta corta | Memoria | Estado |
|---|---|---|---|---|---|---|
| Apple M5 (24 GB) | `laya-ane` | 711/1400 (0,5079) | 76,7 s (9,27 EOT) | 6,53 ms (153,1 q/s) | 1,59 GB | PASS |
| Apple M5 (24 GB) | `laya-hetero` | no disponible | 37,9 s (18,59 EOT) | no disponible | no disponible | no disponible |
| Apple M4 Pro (48 GB) | `laya-ane` | 711/1400 (0,5079) | 133,1 s | 5,09 ms (196,6 q/s) | 1,52 GB | PASS |
| Apple M4 Pro (48 GB) | `laya-hetero` | 707/1400 (0,5050) | 59,3 s (11,93 EOT) | no disponible | no disponible | no disponible |
| Apple M5 (24 GB) | NMTZ Core ML (referencia) | no disponible | 88,4 s | no disponible | 2,73 GB | no disponible |

El bundle ANE es 1,15× más rápido y usa aproximadamente la mitad de memoria que la referencia NMTZ Core ML en M5. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en Neural Engine y memoria unificada de Apple Silicon.
- Memoria en ejecución: 1,52-1,59 GB según plataforma.
- Hardware validado: Apple M5 con 24 GB y Apple M4 Pro con 48 GB.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas; el formato `.mlmodelc` es específico de Core ML.
- Cabe en equipos consumer: sí, en cualquier Mac con Apple Silicon que soporte Core ML y Neural Engine; el límite práctico es la memoria unificada del sistema.
- Despliegue: Core ML a través de la librería `fast-silicon` / `fast-decision-models`; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 6,53 ms y 153,1 q/s en M5; 5,09 ms y 196,6 q/s en M4 Pro para preguntas cortas. En M5 con `--allow-contended` no se reportan datos; en M4 Pro la variante `laya-hetero` alcanza 11,93 EOT frente a los 18,59 EOT de M5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Laya-Typed-421M Core ML ANE (este) | 421M | 512 | Core ML `.mlmodelc` | Apache 2.0 | 711/1400 en Tier-1; 6,53 ms/consulta en M5 |
| NMTZ Core ML (referencia del autor) | no disponible | no disponible | Core ML | no disponible | 88,4 s en Tier-1; 2,73 GB en M5 |
| convaiinnovations/laya-typed-decisions (base) | 421M | no disponible | safetensors (presumible) | Apache 2.0 | no disponible en esta ficha |
| ModernBERT-base (referencia arquitectónica) | ~149M | 8.192 | safetensors, GGUF | Apache 2.0 | no disponible |

La comparación directa con alternativas de la misma categoría (clasificadores ligeros para Apple Silicon) no está disponible en la información proporcionada más allá de la referencia NMTZ incluida por el autor.

## Limitaciones y advertencias

- El rendimiento en la evaluación Tier-1 es de 0,5079 de acierto, apenas por encima del azar en una tarea de tres conjuntos; no debe interpretarse como un modelo de alta precisión.
- El modelo está empaquetado exclusivamente para Core ML y Neural Engine de Apple; no es portable a otras plataformas sin reconversión.
- La ventana de contexto está limitada a 512 tokens; entradas más largas requieren truncado o segmentación.
- No se dispone de información sobre sesgos, composición del dataset de entrenamiento ni idiomas soportados.
- Riesgo de alucinación: aunque el modelo se evalúa en RAGTruth, se desconoce su comportamiento generativo; el uso previsto es de decisión, no de generación de texto libre.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden arrastrar obligaciones adicionales no documentadas aquí.
- El autor reporta métricas en condiciones específicas (M5 en reposo, M4 Pro con `--allow-contended`); los números pueden degradarse con contención de recursos.
- Repositorio sin descargas ni likes en el momento de la ficha (0 y 0), lo que indica ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikewolfd/laya-typed-decisions-421m-coreml-ane
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio `fast-silicon`: https://github.com/mikewolfd/fast-silicon
