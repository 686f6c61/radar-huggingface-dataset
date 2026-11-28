# micdun/if_chat_gpt_oss_20b_science_qwq_code_olmo31_qwen2_5-1_5b_lr1e-4

## Resumen

`if_chat_gpt_oss_20b_science_qwq_code_olmo31_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo base Qwen2.5-1.5B-Instruct, publicado por el usuario micdun en Hugging Face. El modelo se ha entrenado sobre un conjunto de datos sinteticos generado por varios modelos "profesor" (parent models) identificados en el propio nombre del run: un modelo de chat/instruction-following, gpt-oss-20b para ciencia, QwQ para codigo y OLMo para una cuarta porcion de la mezcla. Se trata, por tanto, de un experimento de destilacion de datos sinteticos sobre un transformer decoder-only pequeno de 1.540 millones de parametros.

El interes del modelo es fundamentalmente metodologico: muestra como un modelo compacto de la familia Qwen2.5 puede recibir una mezcla multi-dominio de datos generados por profesores de mayor tamano y distinta especialidad, con un entrenamiento completo de 3 epocas, learning rate 1e-4 y batch global 64. No obstante, la model card es extremadamente escueta: no documenta composicion exacta del dataset, numero de tokens de entrenamiento, evaluaciones ni limitaciones.

A fecha de la informacion disponible, el repositorio no tiene descargas ni likes, y no se han publicado resultados de benchmarks. Debe tratarse como un artefacto de investigacion o prueba de concepto, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero el fine-tune no lo documenta) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite las cuantizaciones habituales de llama.cpp/AWQ/GPTQ, no verificadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Libreria | transformers |
| Tamano del repo | 3,1 GB |
| Metodo de entrenamiento | SFT (supervised fine-tuning), full fine-tune, 3 epocas, lr 1e-4, batch global 64 |
| Fecha de creacion | 2026-11-28 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings de tipo rotary (RoPE). No incorpora mecanismos de mezcla de expertos, atencion lineal ni decodificacion especulativa propia; cualquier optimizacion de ese tipo dependeria del runtime de inferencia, no del checkpoint.

El entrenamiento consiste en un ajuste fino supervisado completo (no LoRA) sobre datos sinteticos generados por modelos profesor. Segun la model card, la mezcla cubre tres dominios explicitos: instruction-following/chat, ciencia (generada por gpt-oss-20b) y codigo (generada por QwQ), ademas de una porcion atribuida a OLMo. No se especifica el numero total de tokens, la proporcion por dominio, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documenta la tokenizacion de las plantillas de chat ni el enmascaramiento de perdida aplicado.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base y reforzada con datos de instruction-following.
- Razonamiento cientifico y respuesta a preguntas de dominio STEM, segun la composicion declarada del dataset (profesor gpt-oss-20b).
- Generacion de codigo, derivada de los datos sinteticos del profesor QwQ.
- Seguimiento de instrucciones (instruction following), que da nombre al run.
- Soporte de plantillas de chat estilo Qwen2.5 a traves del tokenizer del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ocupar 3,1 GB en safetensors y ~1,5 B parametros, puede desplegarse en una unica GPU consumer para validar flujos de chat antes de escalar a modelos mayores.
- Experimentos de destilacion de datos sinteticos: sirve como referencia para comparar como afecta una mezcla multi-profesor (chat + ciencia + codigo + OLMo) frente al modelo base sin ajustar.
- Generacion de codigo en entornos con recursos limitados: el ajuste con datos de QwQ puede mejorar la calidad de snippets en tareas acotadas, aunque requiere validacion propia al no haber benchmarks publicados.
- Respuesta a preguntas cientificas en herramientas educativas offline: su tamano permite ejecutarlo en local con llama.cpp u Ollama, sin dependencia de API.
- Base para fine-tunes posteriores: al ser un full fine-tune sobre Qwen2.5-1.5B-Instruct, puede reutilizarse como punto de partida para tareas especificas con LoRA.
- Evaluacion comparativa de tecnicas de SFT: util en investigacion para medir el efecto de 3 epocas y lr 1e-4 sobre un modelo de 1,5 B con datos sinteticos.
- Clasificacion y reescritura de texto en pipelines ligeros: su ventana de contexto (heredada del base, hasta 32k tokens segun Qwen, no verificada en este checkpoint) permite procesar documentos medios en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: en torno a 1,6-2 GB de pesos.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): en torno a 1 GB de pesos, con un consumo total tipico de 2-3 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos profesionales, A100/H100 no son necesarias pero funcionan sin problema.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6-8 GB de VRAM, e incluso en CPU con cuantizacion 4 bits.
- Opciones de despliegue: transformers (nativo), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (micdun) | 1,54 B | no disponible (base: 32k) | no disponible | Hugging Face, 0 descargas | SFT sobre datos sinteticos multi-profesor |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 (segun Qwen) | Hugging Face, ampliamente usado | Modelo base; benchmarks publicados por Qwen |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 tokens | Apache 2.0 (segun Qwen) | Hugging Face | Version base sin instrucciones |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa compacta de Hugging Face |

La comparacion con Qwen2.5-1.5B-Instruct es la mas directa, ya que este checkpoint es un fine-tune del mismo. No hay datos publicados que permitan afirmar una mejora o degradacion respecto al base.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore al modelo base en ninguna tarea.
- Model card minima: no se documenta composicion del dataset, numero de tokens, filtros de calidad ni evaluaciones de seguridad.
- Riesgo de alucinacion: inherente a los modelos de 1,5 B y potencialmente agravado por datos sinteticos sin verificacion humana documentada.
- Sesgos desconocidos: al no detallarse la procedencia ni el filtrado de los datos sinteticos, no es posible evaluar sesgos de genero, etnicos o culturales.
- Idiomas: no se declara cobertura multilingue; el comportamiento fuera del ingles (idioma dominante en datasets sinteticos habituales) no esta garantizado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor o asumir la licencia del modelo base como referencia, sin garantia.
- Cero adopcion: 0 descargas y 0 likes en el momento de la informacion, sin senales de validacion por la comunidad.
- Fecha de creacion futura (2026-11-28) en los metadatos, lo que sugiere posible inconsistencia en el registro del repositorio.
- No apto para produccion sin evaluacion previa: al ser un experimento de investigacion, requiere validacion propia en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/micdun/if_chat_gpt_oss_20b_science_qwq_code_olmo31_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5 (familia completa): https://huggingface.co/Qwen
- Libreria TRL (usada para SFT): https://github.com/huggingface/trl
- Libreria Transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
