# akhtyamovpavel/Nanbeige4.3-33B-Hyper-GGUF

## Resumen

Nanbeige4.3-33B-Hyper-GGUF es una cuantizacion GGUF de precision mixta a nivel de tensor del modelo Nanbeige/Nanbeige4.3-33B, publicada por el usuario akhtyamovpavel. No se trata de un modelo nuevo, sino de una compilacion de pesos optimizada para ejecutar tareas de codificacion agentica de multiples pasos (OpenCode, Claude Code, Cline) en una unica GPU de 24 GB, como la RTX 3090 o la RTX 4090, manteniendo una cache KV simetrica de 57.344 tokens en Q8_0.

El modelo base cuenta con 33.118.977.024 parametros (aproximadamente 33B) y una arquitectura de 52 capas segun la agrupacion de tensores descrita en la model card. La innovacion del autor consiste en mantener 350 de los 366 tensores en precision alta (Q8_0, Q6_K o IQ4_XS) y comprimir solo 16 tensores (ffn_gate y ffn_up de ocho capas no ancla: blk.17-20 y blk.31-34) a IQ2_XXS, logrando un tamano de 16,71 GiB con aproximadamente 3,82 bits por peso.

El resultado es un compromiso poco habitual: la calidad de una cuantizacion cercana a 4 bits con un consumo de VRAM que deja espacio para contexto largo y buffers de computo CUDA. La model card reporta entre 45 y 87 tok/s en una RTX 3090 usando decodificacion especulativa N-Gram sin modelo borrador, lo que lo hace relevante para flujos de trabajo de agentes de codigo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (52 capas segun agrupacion de tensores; detalles del modelo base no disponibles) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 57.344 tokens configurados en la cache KV de la receta recomendada (contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | Mezcla por tensor: Q8_0, Q6_K, IQ4_XS, IQ2_XXS y F32 en normas; ~3,82 bpw global |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base Nanbeige4.3-33B ni sus datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO). Lo que si se detalla es la estructura de pesos observada en el GGUF: 52 bloques (blk.0 a blk.51) con tensores de atencion (attn_q, attn_k, attn_v, attn_output) y de feed-forward (ffn_gate, ffn_up, ffn_down), ademas de embeddings y normas. Esto es consistente con un transformer decoder-only denso, pero no se confirma en la informacion disponible si emplea alguna variante como MoE o atencion lineal.

La contribucion tecnica del autor es la estrategia de cuantizacion de precision mixta "quirurgica". Se preservan en Q8_0 todas las proyecciones attn_k y attn_v (104 tensores), mientras que attn_q, attn_output y ffn_down (el escritor del flujo residual) se mantienen en IQ4_XS o Q6_K. Solo las proyecciones ffn_gate y ffn_up de ocho capas intermedias se degradan a IQ2_XXS. La model card justifica esta eleccion argumentando que comprimir ffn_down y attn_q de capas medias provoca "jitter" de logits por debajo de 3 bits en literales cirilicos y ediciones de codigo complejas. Ademas, la receta de despliegue incorpora decodificacion especulativa N-Gram (sin modelo borrador, 0 MB extra de VRAM) y FlashAttention con cache KV simetrica Q8_0/Q8_0.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Codificacion agentica de multiples pasos, orientada a herramientas como OpenCode, Claude Code y Cline.
- Razonamiento con modo "thinking" mediante el formato deepseek (`--reasoning-format deepseek` en la receta).
- Edicion de codigo compleja y generacion de JSON, segun los casos de uso declarados por el autor.
- Soporte de tool calling y function calling: no se detalla explicitamente en la informacion disponible, aunque el enfoque en agentes de codigo lo sugiere.
- Capacidades multilingues: no disponibles; la model card menciona literales cirilicos como caso de sensibilidad a la cuantizacion, pero no se declara un listado de idiomas.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Agentes de codigo en local sobre GPU de consumo: el modelo esta disenado para ejecutar bucles multi-paso de OpenCode o Cline en una unica RTX 3090/4090, con 57.344 tokens de contexto que permiten mantener el historial de ediciones y lecturas de ficheros dentro de la ventana.
- Asistente de refactorizacion en repositorios medianos: la cache KV de 57k tokens y la preservacion de attn_k/attn_v en Q8_0 facilitan mantener coherencia sobre fragmentos largos de codigo sin degradar la atencion.
- Generacion de JSON estructurado y salidas de herramientas: la decodificacion especulativa N-Gram acelera la generacion de codigo y JSON hasta 45-87 tok/s, adecuada para pipelines que invocan al modelo repetidamente.
- Servidor local multiusuario ligero: la receta de llama-server usa `-np 4` con cont-batching y cache unificada, lo que permite atender hasta cuatro peticiones concurrentes en un solo equipo.
- Prototipado de agentes sin coste de API: al ser Apache 2.0 y ejecutable en hardware de consumo, sirve para desarrollar y depurar flujos agenticos antes de migrar a modelos mayores.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye el script de construccion y el launcher en GitHub, util para reproducir y comparar estrategias de precision mixta por tensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta cifras de rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| Throughput en RTX 3090 (codigo/JSON, N-Gram spec) | 45-87 tok/s |
| Tamano del fichero GGUF | 16,71 GiB (~3,82 bpw) |
| Cache KV configurada | 57.344 tokens, Q8_0 simetrica |
| VRAM adicional de decodificacion especulativa | 0 MB (N-Gram sin borrador) |

## Requisitos de hardware

- VRAM estimada: el fichero pesa 16,71 GiB; con cache KV Q8_0 de 57.344 tokens y buffers CUDA debe caber en 24 GB, que es el objetivo de diseno.
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB). Para el modelo base sin cuantizar se requeriria mucha mas VRAM (no especificada).
- Cabe en GPU de consumo: si, en RTX 3090/4090. No se garantiza en tarjetas de 16 GB o menos con contexto completo.
- Opciones de despliegue: llama.cpp / llama-server (receta oficial), compatible con endpoints; el autor menciona integracion con OpenCode, Claude Code y Cline.
- Latencia y throughput: 45-87 tok/s en RTX 3090 con decodificacion especulativa N-Gram (`--spec-type ngram-simple`), FlashAttention activada y cache KV simetrica Q8_0.
- Nota de rendimiento: usar `-ctk q8_0 -ctv q8_0` (simetrica); la variante asimetrica q8_0/q4_0 provoca un fallback lento a f16 en ggml-cuda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Enfoque |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Hyper-GGUF (este) | 33,1B | 57.344 (config. recomendada) | Mixta ~3,82 bpw, 16,71 GiB | Apache 2.0 | Agentes de codigo en 24 GB |
| Nanbeige4.3-33B (base) | 33,1B | no disponible | Safetensors (original) | Apache 2.0 | Modelo generalista |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF | 33,1B | no disponible | Cuantizacion uniforme (IQ4_XS ~17,46 GiB; IQ2_XXS ~9,33 GiB) | Apache 2.0 | GGUF estandar |
| Modelos GGUF mixtos ~2,28 bpw (mencionados en la card) | 33B aprox. | no disponible | ~2,28 bpw | no disponible | Ahorro extremo de VRAM |

La ventaja declarada frente a IQ4_XS uniforme es liberar VRAM suficiente para la cache KV de 57k; frente a IQ2_XXS o builds de ~2,28 bpw, preservar la calidad en atencion y flujo residual.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo original: hereda los sesgos y limitaciones del modelo base Nanbeige4.3-33B, que no se documentan en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; en tareas de codigo agentico puede producir ediciones incorrectas o APIs inexistentes.
- La compresion a IQ2_XXS de ffn_gate/ffn_up en ocho capas puede degradar ligeramente la calidad frente al modelo completo; el autor la justifica por la sensibilidad observada en ffn_down y attn_q.
- Idiomas soportados no declarados; el comportamiento en castellano no esta verificado.
- La receta de llama-server es especifica: requiere builds recientes con soporte de `--spec-type ngram-simple`, `--no-reasoning-preserve` y FlashAttention simetrica Q8_0; versiones antiguas pueden no reproducir el rendimiento indicado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base por separado.
- Solo 136 descargas y 0 likes en el momento de la consulta: ecosistema pequeno, poca validacion comunitaria independiente.
- El contexto de 57.344 tokens es una configuracion de la cache KV en la receta, no necesariamente el maximo nativo del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/akhtyamovpavel/Nanbeige4.3-33B-Hyper-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- GGUF de referencia (bartowski): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Repositorio GitHub (script de construccion, launcher y config de OpenCode): https://github.com/akhtyamovpavel/HyperNanbeige-33B
