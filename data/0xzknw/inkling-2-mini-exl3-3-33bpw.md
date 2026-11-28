# 0xzknw/Inkling-2-Mini-EXL3-3.33bpw

## Resumen

Inkling-2-Mini-EXL3-3.33bpw es una cuantización EXL3 del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario 0xzknw y empaquetada específicamente para el motor MLXL3 sobre Apple Silicon. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con capacidad de visión (pipeline image-text-to-text), y esta revisión concreta aplica códigos trellis EXL3 MCG a los expertos enrutados de las 24 capas, con 3 bits para las proyecciones gate y up y 4 bits para la proyección down, resultando en 3,33 bits por peso de media sobre las proyecciones de expertos.

La propuesta de valor es clara: reducir un checkpoint original de varios gigabytes a un paquete de 13,10 GB de pesos del modelo de lenguaje más 0,64 GB del codificador visual y 0,49 GB del drafter DSpark/MTP, manteniendo la fidelidad de salida dentro del ruido de medición. El autor documenta exhaustivamente las decisiones de empaquetado (tabla de embeddings en 8 bits afín MLX, cabeza de salida en 8 bits, drafter en 8 bits) y mide el impacto con divergencia KL sobre filas reservadas, demostrando que la pérdida introducida no es estadísticamente significativa.

Es relevante ahora porque permite ejecutar un modelo MoE multimodal con visión y decodificación especulativa en hardware de consumo Apple (procesadores M-series), algo que el checkpoint BF16 original no permite de forma práctica. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial. No obstante, la dependencia estricta del motor MLXL3 (versión 2.0.29 o superior para entrada de imagen) limita su portabilidad fuera del ecosistema Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal con codificador visual y drafter DSpark/MTP |
| Parametros totales | 6.388.972.752 (según safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 MCG trellis (3 bits gate/up, 4 bits down en expertos); embeddings, cabeza de salida y drafter en MLX affine 8 bits (grupo 64) |
| Idiomas soportados | no disponible (la model card menciona evaluaciones en inglés, francés y código) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (no es un checkpoint ExLlamaV3 estándar; cabeza y drafter usan layout affine de MLX) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer MoE con capacidad de procesamiento de imagen y texto, desarrollado por Thinking Machines. Esta cuantización preserva la estructura completa: 24 capas con expertos enrutados, proyecciones de atención y densas, routers, normas y tokenizador en los mismos bytes que el checkpoint fuente. El codificador visual consta de 422 tensores BF16 (636.512.256 bytes) idénticos a la revisión `0a4558409fc77d6491979505c0668e7469f7b3f7` del modelo base. Se incluye además un drafter DSpark/MTP (`mtp.safetensors`) que habilita decodificación especulativa.

La innovación técnica principal reside en el esquema de cuantización EXL3 MCG trellis aplicado selectivamente a las proyecciones de expertos, con precisión diferenciada por tipo de proyección (3 bits para gate/up, 4 bits para down). El autor documenta que el único paso con pérdida del empaquetado es la tabla de embeddings en 8 bits afín MLX, y mide su impacto mediante divergencia KL contra una referencia local exacta en un Apple M5 sobre 12 filas reservadas (6.144 posiciones): la diferencia global es de +0,0006 nats con intervalo de confianza al 95% de [-0,00381, +0,00500], sin significación estadística. La concordancia top-1 se sitúa en 94,68% (BF16) y 94,76% (8 bits). No se dispone de información sobre el dataset de entrenamiento del modelo base, número de tokens, ni si se aplicaron técnicas de RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen (image-text-to-text) mediante el codificador visual incluido, siempre que se use MLXL3 engine 2.0.29 o superior (Desktop 2.0.21).
- Decodificación especulativa mediante el drafter DSpark/MTP, con soporte de generación a anchos 2 y 3.
- Razonamiento y código: la model card referencia evaluaciones sobre prosa en inglés, francés y código.
- Capacidades de agente: se menciona una "agentic chat transcript" en la evaluación, lo que sugiere soporte para flujos de agente.
- Multilingüismo parcial documentado (inglés, francés), sin lista oficial de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en Apple Silicon para asistentes conversacionales: el paquete de 13,10 GB de pesos del modelo de lenguaje permite ejecutar un MoE de ~6,4 mil millones de parámetros totales en un Mac con memoria unificada suficiente, usando MLXL3 como motor.
- Procesamiento de documentos con imagen: gracias al codificador visual restaurado (0,64 GB), se pueden enviar capturas, diagramas o páginas escaneadas junto con texto para extracción de información y resumen, siempre con engine 2.0.29+.
- Generación de código asistida en local: la evaluación del autor incluye filas de código con KL de 0,01147 (BF16) frente a 0,01166 (8 bits), lo que indica que la cuantización preserva la distribución de salida en este dominio; adecuado para autocompletado y revisión en entornos sin conexión.
- Prototipado de agentes multi-paso: la presencia del drafter DSpark y la referencia a transcripciones agénticas en la evaluación sugieren uso en pipelines de razonamiento encadenado con decodificación especulativa para reducir latencia.
- Investigación en cuantización: el repositorio documenta exhaustivamente metodología, intervalos de confianza y comparaciones por revisión, lo que lo convierte en un caso de estudio reproducible para quienes investigan esquemas EXL3 y MLX affine.
- Evaluación comparativa de fidelidad: las tablas de divergencia KL por dominio (prosa, inglés, francés, código, agente) permiten a un equipo decidir si el ahorro de memoria justifica el cambio respecto al checkpoint BF16 en su carga de trabajo concreta.
- Uso comercial en producto: al mantener licencia Apache 2.0, puede integrarse en aplicaciones propietarias, con la advertencia de que el runtime requerido es específico de MLXL3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de fidelidad de cuantización (divergencia KL y concordancia top-1) contra la referencia BF16:

| Conjunto | Posiciones | KL BF16 | KL 8 bits | Diferencia [IC 95%] |
|---|---:|---:|---:|---|
| Prosa (inglés, francés, código) | 4.608 | 0,01374 | 0,01393 | +0,00019 [-0,00023, +0,00063] |
| Inglés | 1.536 | 0,01029 | 0,01017 | -0,00012 [-0,00050, +0,00020] |
| Francés | 1.536 | 0,01945 | 0,01994 | +0,00049 [-0,00023, +0,00126] |
| Código | 1.536 | 0,01147 | 0,01166 | +0,00019 [-0,00077, +0,00114] |
| Transcripción agéntica | 1.536 | 0,0996 | 0,1014 | +0,0018 [-0,01535, +0,01866] |
| Total | 6.144 | 0,0352 | 0,0358 | +0,0006 [-0,00381, +0,00500] |

Concordancia top-1: 94,68% (BF16) y 94,76% (8 bits) global; 95,07% y 95,31% en prosa. Ninguna diferencia es significativa según el criterio predefinido.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~14,3 GB en total (13,10 GB pesos LM + 0,64 GB codificador visual + 0,49 GB drafter), más overhead del motor y caché KV.
- Hardware objetivo: Apple Silicon (el autor mide en un Apple M5). No se documenta soporte para GPU NVIDIA en esta revisión.
- GPU consumer: no aplicable directamente; el formato affine MLX y el motor MLXL3 están orientados a Apple Silicon. No se confirma funcionamiento en RTX 4090 ni similares.
- Opciones de despliegue: exclusivamente MLXL3 (engine 2.0.29+ para imagen, 2.0.23+ para solo texto; Desktop 2.0.21 o superior). No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles. Se menciona decodificación especulativa con DSpark a anchos 2 y 3, que en principio reduce latencia, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-EXL3-3.33bpw (esta ficha) | 6,39 B totales (MoE) | no disponible | Apache 2.0 | safetensors EXL3/MLX affine | MLXL3 en Apple Silicon |
| thinkingmachines/Inkling-2-Mini (base BF16) | 6,39 B totales (MoE) | no disponible | Apache 2.0 | safetensors BF16 | Genérico (mayor huella de memoria) |
| Revisión `a5763a01...` (misma cuantización, embeddings BF16) | 6,39 B totales (MoE) | no disponible | Apache 2.0 | safetensors EXL3 | MLXL3 2.0.22+ |
| Revisión `d1248f8a...` (cuantización R2 anterior) | 6,39 B totales (MoE) | no disponible | Apache 2.0 | safetensors EXL3 | MLXL3 2.0.20+ |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (p. ej. Qwen, Llama, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del motor MLXL3: no es un checkpoint ExLlamaV3 estándar; cabeza y drafter usan layout affine de MLX. Motores anteriores a 2.0.23 fallan al cargar ("expected floating-point weights").
- La entrada de imagen requiere MLXL3 engine 2.0.29 o superior (Desktop 2.0.21); versiones anteriores ignoran los tensores visuales y solo procesan texto.
- La tabla de embeddings en 8 bits es el único paso con pérdida del empaquetado; aunque el autor demuestra que la diferencia no es significativa, introduce una desviación medible frente al BF16.
- Plataforma limitada a Apple Silicon; no hay soporte documentado para CUDA, ROCm ni CPU genérica.
- Idiomas soportados no documentados oficialmente; la evaluación se limita a inglés, francés y código.
- Longitud de contexto no disponible; no se puede garantizar comportamiento en conversaciones muy largas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base, que tampoco detalla su dataset de entrenamiento.
- Uso comercial permitido por Apache 2.0, pero la viabilidad práctica queda condicionada al runtime propietario de facto (MLXL3) y a hardware Apple.
- El repositorio tiene solo 186 descargas y 1 like en el momento de la ficha; es una publicación de autor individual, no oficial de Thinking Machines, lo que implica menor soporte y validación comunitaria.
- No se han publicado resultados de benchmarks estándar de capacidad (razonamiento, matemáticas, código) para esta cuantización ni para el base en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xzknw/Inkling-2-Mini-EXL3-3.33bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor MLXL3: https://github.com/0xZKnw/mlxl3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Revisión con embeddings BF16: https://huggingface.co/0xzknw/Inkling-2-Mini-EXL3-3.33bpw/tree/a5763a01f6e34c84bdf1a5812c890ff3978d5d75
- Revisión R3 con cabeza/drafter/embeddings BF16 y visión: https://huggingface.co/0xzknw/Inkling-2-Mini-EXL3-3.33bpw/tree/0a4558409fc77d6491979505c0668e7469f7b3f7
- Revisión sin codificador visual: https://huggingface.co/0xzknw/Inkling-2-Mini-EXL3-3.33bpw/tree/dde31cd0aea4ca0f61eaa5649559ef01e5baf25a
- Cuantización R2 anterior: https://huggingface.co/0xzknw/Inkling-2-Mini-EXL3-3.33bpw/tree/d1248f8abc322dbaf82cd571f6e7eaca9f7d6dee
