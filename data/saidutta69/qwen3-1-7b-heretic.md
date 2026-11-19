# saidutta69/Qwen3-1.7B-heretic

## Resumen
Qwen3-1.7B-heretic es una variante "decensored" (abliterated) del modelo denso Qwen/Qwen3-1.7B, publicada por el usuario saidutta69 (bajo el alias "RACER IS OP"). No es un fine-tune nuevo: se ha generado con la herramienta Heretic v1.4.0 aplicando ablación direccional por capas sobre las proyecciones de salida de atención (`attn.o_proj`) y de bajada del MLP (`mlp.down_proj`), con el objetivo de suprimir la dirección de rechazo aprendida por el modelo base.

El resultado es un modelo de 1.720.574.976 parámetros (1,7B densos) que conserva la arquitectura, el conocimiento y la capacidad de "thinking" híbrido de Qwen3, pero que responde a peticiones que el original rechazaría. Según la model card, la tasa de rechazo cae de 92/100 a 4/100 en el arnés de 100 prompts de Heretic, con una divergencia KL de 0,0248 respecto al base.

Es relevante ahora por tres motivos: es lo bastante pequeño para ejecutarse en CPU o en GPUs de consumo modestas (desde 6 GB de VRAM con Q5_K_M), el repositorio incluye una escalera completa de 15 cuantizaciones GGUF listas para llama.cpp/Ollama/LM Studio, y sirve como caso de estudio reproducible de mecánica de rechazo en una arquitectura con modo de razonamiento. La licencia Apache 2.0 heredada facilita su uso comercial, aunque con las advertencias de seguridad que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con modo híbrido de razonamiento ("thinking") del modelo base |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-1.7B; no confirmada en la model card) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K; pesos originales en safetensors (bf16/fp16 según `torch_dtype="auto"`) |
| Idiomas soportados | en (inglés, declarado en la model card) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3-1.7B) |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento
La arquitectura es la del Qwen3-1.7B original: un transformer denso decoder-only con atención completa y el esquema híbrido de Qwen3 que alterna modo de razonamiento explícito y respuesta directa. No hay entrenamiento adicional ni datos nuevos: el proceso de Heretic 1.4.0 calcula direcciones de rechazo por capa y aplica ediciones de pesos dirigidas en `attn.o_proj` y `mlp.down_proj`, con parámetros de peso y posición documentados en la model card (por ejemplo, `attn.o_proj.max_weight` = 1,48 en posición 25,98; `mlp.down_proj.min_weight` = 0,21 a distancia 11,05).

La innovación técnica es precisamente esa: ablación direccional en lugar de fine-tuning, de modo que el modelo conserva en gran medida el conocimiento y las capacidades del base. La model card reporta una divergencia KL de 0,0248 frente al original, lo que cuantifica cuánto se ha desplazado la distribución de salida. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original de Qwen3-1.7B (número de tokens, composición, RLHF/DPO), más allá de que este derivado no añade entrenamiento propio.

## Capacidades
- Generación de texto conversacional multi-turno, con plantilla de chat de Qwen3 (`apply_chat_template`).
- Razonamiento en modo "thinking" híbrido heredado de Qwen3 (alternancia entre razonamiento explícito y respuesta directa).
- Conocimiento factual y capacidades generales del Qwen3-1.7B base, en gran medida preservadas según la KL reportada.
- Respuesta a peticiones que el modelo base rechazaría (abliteración efectiva: 4/100 rechazos frente a 92/100).
- Ejecución local en CPU y GPU de consumo mediante GGUF (llama.cpp, Ollama, LM Studio, Jan).
- Compatibilidad con backends de serving: transformers, vLLM, SGLang, text-generation-inference (según tags y model card).
- Soporte de tool calling / function calling: no documentado explícitamente en la información proporcionada (el base Qwen3 lo soporta, pero no se confirma aquí).
- Capacidades de agente multi-paso: no documentadas en la información proporcionada.
- Multilingüe: limitado a inglés según la model card.
- Visión y audio: no disponibles.

## Casos de uso
- Investigación de mecánica de rechazo: el modelo sirve para estudiar cómo se codifica la negativa a responder en un transformer pequeño con modo de razonamiento, comparando activaciones y salidas frente al base; los datos de reproducción están en `reproduce/`.
- Punto de partida para fine-tunes sin restricciones: al conservar el conocimiento del base y no ser un fine-tune, es un checkpoint limpio para entrenar dominios especializados (por ejemplo, narrativa adulta o role-play) sin arrastrar sesgos de rechazo.
- Despliegue local en hardware modesto: con Q4_K_M (1,11 GB) corre en CPU o Apple Silicon y permite prototipar asistentes conversacionales offline sin GPU.
- Generación creativa sin filtros: escritura de ficción, guiones o diálogos con temáticas que el modelo base declinaría, ejecutando Q8_0 en una RTX 3060/4070 de 12 GB.
- Evaluación de seguridad y red-teaming: usar el modelo como sujeto de prueba para medir la eficacia de clasificadores de contenido o filtros de salida en pipelines propios.
- Pruebas de pipelines de inferencia: al ofrecer 15 cuantizaciones GGUF, permite comparar latencia, calidad y consumo de memoria entre niveles de cuantización en llama.cpp, Ollama o LM Studio.
- Experimentación educativa con LLMs pequeños: su tamaño (1,7B) y su licencia Apache 2.0 lo hacen adecuado para cursos y talleres donde se analiza el comportamiento de modelos ablacionados.

## Benchmarks y rendimiento
Los únicos datos publicados en la información disponible son las métricas del proceso de abliteración, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Qwen/Qwen3-1.7B |
|---|---|---|
| Divergencia KL respecto al base | 0,0248 | 0 (por definición) |
| Rechazos (arnés de 100 prompts de Heretic) | 4/100 | 92/100 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada (solo pesos, según la model card): Q8_0 1,83 GB; Q6_K 1,42 GB; Q5_K_M 1,26 GB; Q4_K_M 1,11 GB; Q2_K 0,78 GB. Añadir aproximadamente 1 GB para el contexto.
- GPU recomendadas por la model card: RTX 3060/4070/5070 (12 GB) para Q8_0; RTX 4060/3070 (8 GB) para Q6_K; GTX 1660 Super/2060/3050 laptop (6 GB) para Q5_K_M.
- Cabe en GPU de consumo: sí, desde tarjetas de 6 GB; en CPU-only o Apple Silicon funciona con Q4_K_M en RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/Qwen3-1.7B-heretic`), Ollama, LM Studio, Jan, transformers, vLLM, SGLang y text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (arnés Heretic) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-heretic (este) | 1,7B densos | no disponible | 4/100 (KL 0,0248) | apache-2.0 | HF, GGUF (15 quants) |
| Qwen/Qwen3-1.7B (base) | 1,7B densos | no disponible | 92/100 | apache-2.0 | HF |
| Qwen3-0.6B-heretic | 0,6B densos | no disponible | no disponible | apache-2.0 (heredada) | HF (referenciado en la model card) |

No se dispone de datos de benchmarks de capacidad para establecer una comparación de rendimiento con alternativas de otros autores; la comparación se limita a tamaño, licencia y comportamiento de rechazo.

## Limitaciones y advertencias
- La supresión de rechazos es deliberada y funciona: el modelo cumplirá peticiones que el base rechazaría, incluidas algunas que no debería. No hay filtrado de seguridad añadido.
- No debe exponerse tras un endpoint público sin moderación para terceros; la propia model card lo desaconseja.
- Hereda las limitaciones factuales y los sesgos de Qwen3-1.7B; la abliteración elimina direcciones de rechazo, no añade capacidad ni criterio.
- Riesgo de alucinación propio de un modelo de 1,7B, sin mitigación adicional.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto: no confirmada en la información disponible; conviene verificarla en el modelo base antes de diseñar aplicaciones con contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y ética del despliegue recae en el usuario.
- El repositorio ocupa 22,5 GB por incluir todos los GGUF y los pesos safetensors; la descarga selectiva de una sola cuantización es recomendable.
- No hay métricas de capacidad publicadas, por lo que no se puede verificar cuánto conocimiento se ha degradado más allá de la KL reportada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen3-1.7B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Datos de reproducción: carpeta `reproduce/` del repositorio en Hugging Face
- Modelo relacionado Qwen3-0.6B-heretic: enlace truncado en la model card (no disponible completo)
