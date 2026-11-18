# infosave/Granite-4.2-cmf

## Resumen

Granite-4.2-cmf es un repositorio de artefactos cuantizados del autor `infosave` que empaqueta los tres modelos densos de razonamiento de la familia IBM Granite 4.2 (3B, 8B y 30B) en formato CMF (Cortiq Model File), un contenedor de un solo archivo con mapeo en memoria que incluye pesos, tokenizador, plantilla de chat exacta y hashes de integridad. No es un modelo nuevo: es una distribucion de pesos cuantizados derivada de los checkpoints bf16 originales de IBM, pensada para ejecutarse sin Python, sin PyTorch y sin compilaciones especificas de GPU.

La propuesta de valor esta en el perfil de cuantizacion mixta. El perfil Q4TP mantiene las proyecciones del transformer en 4 bits pero protege los bordes del vocabulario (embedding de entrada y `lm_head` sin atar) en 8 bits de doble campo, mientras que Q8_2F aplica ese esquema de 8 bits a todas las proyecciones. Con un vocabulario de 100.352 tokens, proteger ambos extremos evita que filas de tokens raros o valores atipicos por canal de entrada se conviertan en el eslabon mas debil del modelo.

El interes practico es la portabilidad: el mismo artefacto corre en CPU, CUDA, Vulkan (NVIDIA, AMD, Intel), DX12 y Metal mediante el runtime Cortiq, con velocidades medidas en una RTX A5000 de 176 tok/s para el 3B Q4TP y 28,9 tok/s para el 30B Q4TP. La licencia Apache 2.0 y el soporte de 12 idiomas lo hacen directamente utilizable en produccion, aunque el ecosistema de herramientas es mucho mas reducido que el de GGUF o safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (GraniteForCausalLM): GQA, SwiGLU, RMSNorm, RoPE, embeddings sin atar |
| Parametros totales | 3B, 8B y 30B (tres artefactos independientes) |
| Parametros activos | no disponible (modelos densos, no MoE) |
| Longitud de contexto | 131.072 tokens nativos (la extension a 512K documentada por IBM no esta implementada ni medida en estos archivos) |
| Tipos de cuantizacion | Q4TP (proyecciones en 4 bits, vocabulario en q8_2f, normas en f16) y Q8_2F (todo en 8 bits de doble campo, normas en f16) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (Cortiq Model File), archivo unico con mapeo en memoria |
| Tamano de archivos | 3B: 2,17 GB (q4tp) / 3,68 GB (q8_2f); 8B: 4,98 GB / 8,81 GB; 30B: 15,64 GB / 29,31 GB |
| Vocabulario | 100.352 tokens |
| Runtime | Cortiq (`cargo install cortiq-cli`), backend CUDA como feature de compilacion |
| Repositorio | 64,6 GB |

## Arquitectura y entrenamiento

Los pesos subyacentes corresponden a los modelos Granite 4.2 de IBM, transformers densos con attention de consultas agrupadas (GQA), SwiGLU, RMSNorm, RoPE y embeddings de entrada y salida sin atar. El runtime Cortiq mapea explicitamente `GraniteForCausalLM` en lugar de tratarlo como una aproximacion Llama: aplica el `attention_multiplier` exacto del checkpoint (Granite usa `1 / head_dim`, no `1 / sqrt(head_dim)`), y valida y traslada a la cabecera CMF los factores `embedding_multiplier`, `residual_multiplier` y `logits_scaling`. Tambien preserva la geometria GQA, el theta de RoPE y el vocabulario sin atar para cada tamano.

El trabajo de este repositorio es exclusivamente de cuantizacion, no de entrenamiento: no hay datos sobre tokens de preentrenamiento, composicion del dataset ni etapas de RLHF o DPO en la informacion disponible. La innovacion tecnica esta en el esquema de cuantizacion. Q4TP es un perfil de calidad mixta deliberado: cada proyeccion del transformer usa 4 bits, mientras que el embedding de entrada y el `lm_head` usan q8_2f; las normas permanecen en f16. Los archivos Q4TP de 3B y 8B contienen 280 tensores q4tp, 2 q8_2f y 81 f16. Las variantes Q8_2F mantienen todas las proyecciones y ambos bordes del vocabulario en el formato de 8 bits de doble campo (282 tensores q8_2f mas 81 f16), donde el segundo campo de escala protege los canales de entrada ademas de la escala por fila de salida habitual.

La plantilla Jinja de chat upstream se incrusta completa, incluyendo modo thinking, modo sin thinking, razonamiento de bajo esfuerzo, herramientas y manejo de historial multi-turno. Con thinking activo el prefijo del asistente termina en `<|im_start|>assistant\n<think>\n`; con `--no-think` produce `<|im_start|>assistant\n<think></think>` exactamente. Las pruebas de release comparan los prompts renderizados contra la plantilla original.

## Capacidades

- Generacion de texto y razonamiento con bloque nativo `<think>...</think>`, activable o desactivable por flag (`--no-think`).
- Modo de razonamiento de bajo esfuerzo, segun la plantilla upstream embebida.
- Soporte de tool calling y function calling a traves de la plantilla de chat de Granite 4.2.
- Manejo de historial multi-turno y conversaciones largas gracias a los 131.072 tokens de contexto.
- Capacidades multilingues en 12 idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Ejecucion multiplataforma sin Python ni PyTorch: CPU, CUDA, Vulkan (NVIDIA, AMD, Intel), DX12 y Metal.
- Verificacion de integridad criptografica del artefacto mediante `cortiq verify` y hashes SHA-256 publicados.
- Tres puntos de operacion (3B, 8B, 30B) con perfiles de 4 y 8 bits para ajustar calidad frente a memoria y ancho de banda.

## Casos de uso

- Asistente de atencion al cliente multi-turno: el 8B Q4TP (4,98 GB) cabe en una GPU de consumo y gestiona conversaciones largas con 131.072 tokens de contexto, manteniendo el historial completo sin truncar. La plantilla embebida garantiza que el formato de turnos coincida con el del modelo original.
- Generacion de codigo en pipelines de CI/CD: el 3B Q4TP decodifica a 176 tok/s en una RTX A5000 y arranca en 0,87 s con prompts de 4096 tokens, lo que permite integrarlo como paso de revision o generacion de parches con latencia interactiva y sin dependencias de Python en la imagen del runner.
- Despliegue en estaciones de trabajo sin GPU dedicada: el mismo archivo CMF corre en CPU o en Vulkan sobre graficas integradas Intel o AMD, util para herramientas internas de documentacion o resumen donde el throughput no es critico.
- Razonamiento por lotes con modo thinking: el 30B Q4TP (15,64 GB) a 28,9 tok/s en una RTX A5000 sirve para tareas de analisis, clasificacion compleja o extraccion estructurada donde prima la calidad sobre la latencia y se puede procesar en cola.
- Agentes con tool calling: la plantilla incluye manejo de herramientas y multi-turno, de modo que el modelo puede encadenar llamadas a APIs en bucles de razonamiento de varios pasos sobre el 8B o el 30B.
- Procesamiento multilingue en produccion: con 12 idiomas declarados, el 8B Q8_2F (8,81 GB) cubre traduccion, resumen y atencion en espanol, aleman, frances, japones o arabe desde un unico artefacto verificado por hash.
- Auditoria y cumplimiento de artefactos: los hashes SHA-256 publicados y `cortiq verify` permiten validar que el binario desplegado corresponde exactamente al publicado, algo relevante en entornos regulados.

## Benchmarks y rendimiento

Rendimiento de decodificacion en regimen estable, medicion de un solo flujo con `cortiq bench --tokens 100 --core --ignore-eos`, excluyendo carga de modelo y prefill:

| Modelo | Archivo | A40 Vulkan | RTX A5000 CUDA | RTX A5000 Vulkan |
|---|---|---:|---:|---:|
| Granite 4.2 3B | q4tp | 89,5 tok/s | 176,2–176,4 tok/s | 131–135 tok/s |
| Granite 4.2 3B | q8_2f | 60,6 tok/s | no disponible | no disponible |
| Granite 4.2 8B | q4tp | 49,9 tok/s | 99,5–99,7 tok/s | 80–81 tok/s |
| Granite 4.2 8B | q8_2f | 30,9 tok/s | no disponible | no disponible |
| Granite 4.2 30B | q4tp | 22,9 tok/s | 28,9 tok/s | 28,6–28,9 tok/s |
| Granite 4.2 30B | q8_2f | 5,28 tok/s (prefijo dinamico 55/64 capas) | no disponible | no disponible |

Datos adicionales de prefill y latencia:

| Metrica | Valor |
|---|---|
| 3B Q4TP, prefill (A40 Vulkan) | 80,3 tok/s, primer token en 0,58 s |
| 3B Q8_2F, prefill (A40 Vulkan) | 47,5 tok/s, primer token en 0,93 s |
| 3B Q4TP, prompt de 4096 tokens (A5000 CUDA) | 4672 tok/s, primer token en 0,87 s |
| 8B Q4TP, prompt de 4096 tokens (A5000 CUDA) | 3007 tok/s, primer token en 1,36 s |
| 30B Q8_2F en A40 | pico de 43.036 MiB sobre 46.068 MiB disponibles |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun tamano de archivo mas overhead de runtime: 3B Q4TP ~2,2 GB, 3B Q8_2F ~3,7 GB, 8B Q4TP ~5,0 GB, 8B Q8_2F ~8,8 GB, 30B Q4TP ~15,6 GB, 30B Q8_2F ~29,3 GB.
- GPU de consumo: el 3B y el 8B Q4TP caben en tarjetas de 8 GB y 12 GB respectivamente; el 8B Q8_2F requiere 12–16 GB; el 30B Q4TP encaja en 24 GB (RTX 3090, 4090, A5000).
- GPU profesionales: A40 (46 GB) ejecuta todos los perfiles, con el 30B Q8_2F operando en modo de prefijo dinamico (55 de 64 capas en GPU, 9 capas en host). A100 y H100 no aparecen en las mediciones publicadas.
- El 30B Q8_2F no cabe completo en una GPU de 24 GB.
- Despliegue: runtime Cortiq exclusivamente (`cargo install cortiq-cli`, con `--features cuda` para el backend CUDA, que requiere driver NVIDIA y librerias CUDA 12.x). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato CMF es propietario de este runtime.
- Throughput y latencia: ver tabla de benchmarks. El 3B Q4TP alcanza 176 tok/s de decodificacion en RTX A5000 con CUDA y 4672 tok/s de prefill sobre 4096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---:|---|---|---|
| Granite-4.2-cmf (este) | 3B / 8B / 30B | 131.072 | Apache 2.0 | CMF / Cortiq | Cuantizacion mixta Q4TP y Q8_2F, multiplataforma sin Python |
| IBM Granite 4.2 original | 3B / 8B / 30B | 131.072 (512K documentado) | Apache 2.0 | safetensors / transformers | Pesos bf16 de referencia; requiere PyTorch y ~2x memoria frente a Q8_2F |
| Alternativas GGUF de la misma familia | 3B / 8B / 30B | 131.072 | Apache 2.0 | GGUF / llama.cpp, Ollama | Ecosistema de herramientas mucho mas amplio; sin perfil q8_2f de doble campo |
| Familias densas comparables de 7–8B (p. ej. Llama 3.1 8B, Qwen2.5 7B) | 7–8B | 128K aprox. | licencias propias | safetensors, GGUF | No disponible comparacion de calidad medida en la informacion proporcionada |

No se han publicado comparaciones de calidad (benchmarks) frente a estos modelos en la informacion disponible; la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- No hay datos publicados de evaluacion de calidad para estos artefactos cuantizados: no se puede asumir que Q4TP o Q8_2F igualen al checkpoint bf16 original sin medirlo.
- La cuantizacion a 4 bits introduce degradacion no cuantificada en esta ficha; Q8_2F es el perfil de mayor calidad y el preferido cuando la memoria lo permite, segun el propio autor.
- El contexto anunciado es de 131.072 tokens; la extension a 512K que documenta IBM no esta implementada ni medida en estos archivos, por lo que no debe asumirse.
- Dependencia de un runtime unico: el formato CMF solo lo lee Cortiq. No hay integracion con vLLM, llama.cpp, Ollama, TGI ni con el ecosistema transformers, lo que limita portabilidad y opciones de escalado.
- El backend CUDA es una feature de compilacion que exige driver NVIDIA y CUDA 12.x; en otras plataformas se depende de Vulkan, DX12, Metal o CPU, con el rendimiento correspondientemente menor.
- El 30B Q8_2F excede la memoria de GPU de 24 GB y en A40 opera con 9 capas en host, con una caida de throughput a 5,28 tok/s; no es un perfil apto para servicio interactivo.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible evaluaciones de sesgo ni tasas de alucinacion para Granite 4.2 en este repositorio.
- El autor del repositorio es `infosave`, no IBM: los artefactos son derivados de terceros. La licencia Apache 2.0 del modelo base se mantiene, pero la procedencia de la cuantizacion debe validarse con los hashes SHA-256 publicados.
- El modo thinking esta activo por defecto en la plantilla; en produccion conviene usar `--no-think` para respuestas directas y evitar latencia y tokens extra.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Granite-4.2-cmf
- Modelo base 30B: https://huggingface.co/ibm-granite/granite-4.2-30b
- Modelo base 8B: https://huggingface.co/ibm-granite/granite-4.2-8b
- Modelo base 3B: https://huggingface.co/ibm-granite/granite-4.2-3b
- Blog de anuncio de Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Runtime Cortiq: `cargo install cortiq-cli` (no se proporciona URL del repositorio en la informacion disponible)
