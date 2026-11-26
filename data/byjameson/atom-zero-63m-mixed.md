# byjameson/atom-zero-63m-mixed

## Resumen
Atom Zero 63M mixed-replay es un checkpoint de investigación de un modelo de lenguaje de pequeno tamano (63.389.184 parámetros) desarrollado por el autor independiente byjameson dentro del proyecto Atom Zero. No es un asistente generalista, sino una base de investigación "promotable" orientada a tareas de copia exacta (copy task) de claves alfanuméricas cortas, con replay de contenido y de rechazo de seguridad. El modelo parte de un checkpoint de 49M y se ha sometido a un "depth upcycling": se pasa de 6 a 8 capas mediante interpolación y posterior fine-tuning completo.

La relevancia del modelo es metodológica más que de producto: documenta con dos semillas (71 y 72) un proceso de control de calidad con cuatro puertas (content no peor que la base, exact match, key-copy y seguridad) y cuantifica el coste de introducir replay de seguridad (unos 9 puntos de exactitud en claves de cuatro caracteres frente a entrenamiento solo con copia). La arquitectura es un transformer decoder de 8 capas, dimensión 768, 12 cabezas de atención, vocabulario BPE de 8192 tokens y longitud máxima de secuencia de 512 tokens.

El checkpoint no sustituye a los pesos de producto del proyecto (`byjameson/atom-zero-49m`, versión 0.8.0) y el propio autor advierte que queda trabajo de empaquetado, evaluación general, latencia y revisión humana antes de un reemplazo en producción. Su licencia es Apache 2.0 y el repo ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (TransformerLM), 8 capas con depth upcycling desde 6 capas interpoladas |
| Parametros totales | 63.389.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizer `chat_en_bpe8k.json`, orientado a inglés por nombre; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (state dict de PyTorch con `config` y `state`), `config.json`, tokenizer `chat_en_bpe8k.json` |

Parámetros adicionales documentados: dimensión 768, 12 cabezas de atención, vocabulario 8192, entrenamiento de 3000 pasos con batch 4, learning rate 5e-5, content weight 2 y semilla 71; datos de 6000 filas de copia, 492 de contenido y 40 de seguridad (x10).

## Arquitectura y entrenamiento
El modelo es un transformer decoder estándar implementado en la clase `TransformerLM` del paquete `atomzero`, con vocabulario de 8192 tokens BPE y contexto de 512 tokens. La innovación estructural es el depth upcycling: se toma un checkpoint de 6 capas de 49M y se interpola para obtener 8 capas, que después se afinan completamente (no como adaptador sobre la base de 49M). El resultado son 63,4M de parámetros con la misma dimensión (768) y número de cabezas (12).

El entrenamiento combina tres fuentes: un currículo de copia (6000 filas), replay de contenido (492 filas) y replay de rechazo de seguridad (40 filas replicadas x10), durante 3000 pasos con batch 4 y learning rate 5e-5 (semilla 71). El autor documenta que el replay de seguridad cuesta aproximadamente 9 puntos de exactitud en la tarea de copia de cuatro claves respecto a entrenar solo con copia. No se mencionan RLHF, DPO ni decodificación especulativa.

## Capacidades
- Copia exacta de claves alfanuméricas cortas de 3-6 caracteres en minúsculas (gramática entrenada): 84,0-86,0% exact en 2 claves cortas, 76,5-77,0% en 3 claves y 57,0-58,0% en 4 claves según semilla.
- Key-copy de 4 claves cortas: 63,5-67,0% exact.
- Retención de contenido: pérdida de contenido candidata dividida por la del baseline de 49M, con valores 0,722 (semilla 71) y 0,809 (semilla 72); por debajo de 1,0 es mejor.
- Rechazo de seguridad en plantillas sintéticas estrechas: 40/40 en las dos semillas, frente a 12/40 del baseline.
- Generación de texto general: no evaluada; el autor indica explícitamente que no es una evaluación de asistente general.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: ninguna declarada (sin visión, audio ni modo thinking).

## Casos de uso
- Investigación sobre depth upcycling: servir de referencia reproducible para estudiar cómo afecta pasar de 6 a 8 capas con interpolación y fine-tuning completo a tareas de copia y retención de contenido, con dos semillas documentadas.
- Estudio del coste de seguridad en modelos pequeños: cuantificar el compromiso entre exactitud de copia y tasa de rechazo (9 puntos de exactitud en 4 claves a cambio de pasar de 12/40 a 40/40 en las sondas de seguridad).
- Benchmark de pipelines de evaluación con puertas de calidad: usar los cuatro gates del autor (contenido, exact match, key-copy, seguridad) como plantilla para validar checkpoints propios antes de promocionarlos.
- Tareas de copia estructurada en entornos controlados: extracción y reproducción exacta de identificadores cortos (3-6 caracteres alfanuméricos en minúsculas) en pipelines internos, siempre dentro de la gramática entrenada y con revisión humana.
- Base para experimentos de currículo de datos: comparar proporciones de datos de copia, contenido y seguridad (6000 / 492 / 40x10) y su efecto en retención y seguridad en modelos de menos de 100M de parámetros.
- Prototipado de tokenizers y arquitecturas de bajo coste: con 63M de parámetros y contexto de 512, permite iterar en CPU o en una sola GPU consumer sobre el paquete `atomzero` sin infraestructura pesada.

## Benchmarks y rendimiento

| Semilla | 2short exact | 3short exact | 4short exact | 4short key-copy | Retención | Seguridad |
|---|---:|---:|---:|---:|---:|---:|
| 71 | 84,0% | 77,0% | 57,0% | 67,0% | 0,722 | 40/40 |
| 72 | 86,0% | 76,5% | 58,0% | 63,5% | 0,809 | 40/40 |

Las métricas de copia se calculan sobre 200 filas retenidas por etapa (exact match y key-copy). La retención es la pérdida de contenido del candidato dividida por la del baseline de 49M (menor es mejor). La seguridad usa 40 sondas de rechazo retenidas, disjuntas de las plantillas de entrenamiento; el baseline de 49M obtiene 12/40. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 63,4M de parámetros, los pesos en fp32 ocupan aproximadamente 254 MB y en fp16 unos 127 MB; el estado completo en `model.pt` (repo de 0,3 GB) cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; una RTX 4090, A100 o H100 es sobredimensionada para este modelo, que puede ejecutarse incluso en CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: la model card solo documenta carga manual con PyTorch (`torch.load` + `TransformerLM` + `tokenizers`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `model.pt` no es directamente compatible con esos motores sin conversión.
- Latencia y throughput: no disponibles; el autor indica que la latencia queda pendiente antes de un reemplazo en producto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Atom Zero 63M mixed | 63,4M | 512 | Copia exacta, depth upcycling, seguridad sintética | Apache 2.0 | Hugging Face (`byjameson/atom-zero-63m-mixed`) |
| Atom Zero 49M (0.8.0) | 49M (no confirmado en la información) | no disponible | Pesos de producto del mismo proyecto; baseline de retención y seguridad (12/40) | Apache 2.0 (según proyecto) | Hugging Face (`byjameson/atom-zero-49m`) |
| Modelos generalistas pequeños (p. ej. familias de <100M) | no disponible | no disponible | Asistente general | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con modelos de otras familias en la información proporcionada; la única comparación cuantitativa documentada es contra el baseline de 49M del propio proyecto.

## Limitaciones y advertencias
- La ganancia en copia está limitada a la gramática entrenada de claves alfanuméricas en minúsculas de 3-6 caracteres; estilos de clave fuera de distribución fallan (0/30 en el test de la versión 0.80.0).
- Las sondas de seguridad son plantillas sintéticas estrechas, no un benchmark de moderación; el 40/40 no debe interpretarse como robustez de seguridad general.
- No es una evaluación de asistente general: el comportamiento de QA general, el empaquetado y la latencia quedan pendientes según el autor.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de 63M sin evaluación general, no se recomienda su uso en producción sin revisión humana.
- El replay de seguridad reduce la exactitud de copia de cuatro claves en unos 9 puntos, un compromiso relevante si la tarea principal es la copia.
- Debe cargarse como checkpoint base nuevo, no como adaptador sobre el modelo de 49M.
- Licencia Apache 2.0: permite uso comercial, pero el autor no lo posiciona como pesos de producto y no hay garantías de calidad fuera de las tareas evaluadas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/byjameson/atom-zero-63m-mixed
- Resumen de resultados de seguridad: https://github.com/byjameson/atom-zero/blob/main/research/results/mixed8_safety_summary.json
- Documentación del batch 0.90.0: https://github.com/byjameson/atom-zero/blob/main/docs/BATCH_0.90.0.md
- Documentación de las puertas de checkpoint: https://github.com/byjameson/atom-zero/blob/main/docs/CHECKPOINT_GATE.md
- Repositorio del proyecto: https://github.com/byjameson/atom-zero
- Pesos de producto (49M, 0.8.0): https://huggingface.co/byjameson/atom-zero-49m
