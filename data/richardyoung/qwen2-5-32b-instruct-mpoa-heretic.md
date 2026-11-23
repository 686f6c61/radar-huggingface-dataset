# richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic

## Resumen

Qwen2.5-32B-Instruct-MPOA-heretic es un ajuste fino (fine-tune) del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored": el ajuste busca eliminar los mecanismos de rechazo y moderacion del modelo original, de modo que responda a peticiones que el modelo base declinaria. El sufijo "MPOA" (multi-prompt optimization alignment) y "heretic" indican la metodologia de alineacion usada para conseguir ese efecto, descrita en los papers referenciados en las etiquetas.

El modelo conserva la arquitectura del Qwen2.5-32B-Instruct: un transformer decoder-only denso con aproximadamente 32.760 millones de parametros, ventana de contexto larga (hasta 131.072 tokens segun la ficha del modelo base) y tokenizador Qwen2. Es relevante para quienes necesitan un modelo de 32B con capacidades de razonamiento y generacion solida pero sin filtros de seguridad integrados, por ejemplo en investigacion sobre alineacion, red teaming o generacion creativa sin restricciones.

La ficha es escasa en detalles tecnicos: el autor no publica datos de entrenamiento, benchmarks ni curvas de evaluacion. La informacion disponible se limita a los metadatos de Hugging Face y a la herencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 32.763.876.352 (~32,76 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en esta ficha; el modelo base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens |
| Tipos de cuantizacion | No disponible (pesos originales en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | Ingles (segun metadatos); el base Qwen2.5 soporta multiples idiomas |
| Licencia | Apache 2.0 (metadatos); el autor etiqueta tambien openrail++ |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 65,5 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, attention con RoPE y sesgo QKV, entrenado por Alibaba sobre un corpus multilingue de billones de tokens con fases de pretraining, supervised fine-tuning y RLHF/DPO. El modelo base incorpora decodificacion de contexto largo mediante YaRN y soporta tool calling y generacion estructurada.

El fine-tune de richardyoung aplica una metodologia de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) combinada con MPOA (multi-prompt optimization alignment), descrita en los papers arxiv:2309.00071 (sobre refusal directions) y arxiv:2407.10671 (sobre alineacion con multiples prompts). El resultado es un modelo que mantiene las capacidades del base pero con los filtros de seguridad atenuados o eliminados. No se publican detalles sobre el dataset de ajuste, el numero de pasos, la tasa de aprendizaje ni si se uso LoRA o full fine-tuning; el tamano del repo (65,5 GB) sugiere pesos completos en bf16, no adaptadores.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredadas del Qwen2.5-32B-Instruct.
- Razonamiento y matematicas de nivel medio-alto, comparable al base de 32B.
- Generacion de codigo, con soporte de lenguajes comunes y formateo estructurado.
- Tool calling y function calling (capacidad del base; no confirmada explicitamente en esta ficha).
- Generacion estructurada (JSON, XML) y seguimiento de instrucciones complejas.
- Capacidad multilingue limitada segun metadatos (solo "en" declarado), aunque el base soporta mas idiomas.
- Ausencia de rechazos: responde a peticiones que el base declinaria (comportamiento "uncensored"/"abliterated").
- No dispone de vision, audio ni modalidades adicionales.

## Casos de uso

- Investigacion sobre alineacion y refusal: util para estudiar como se comporta un modelo sin filtros y comparar con el base, midiendo diferencias en tasas de rechazo y calidad de respuesta.
- Red teaming y evaluacion de seguridad: permite generar respuestas "sin moderacion" para probar clasificadores y sistemas de filtrado en pipelines de moderacion.
- Generacion creativa sin restricciones: escritura de ficcion, dialogos o guiones que el base rechazaria por contenido sensible, con control de estilo via prompts.
- Analisis de sesgos y robustez: comparar respuestas del modelo abliterated con el base para detectar cambios en sesgos, toxicidad y factualidad.
- Prototipado de asistentes internos en entornos controlados donde los filtros del base resultan demasiado restrictivos (documentacion tecnica, escenarios hipoteticos).
- Fine-tuning adicional: al ser un modelo de 32B con pesos completos, sirve como punto de partida para ajustes especializados que requieren un base ya "desbloqueado".
- Evaluacion de herramientas de inferencia: probar vLLM, TGI o llama.cpp con pesos de 32B en bf16 para medir throughput y latencia en despliegues reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de refusal rate. Cualquier cifra atribuida al modelo base (Qwen2.5-32B-Instruct) no debe trasladarse sin verificacion, dado que el fine-tune puede alterar el rendimiento.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 65 GB de pesos, mas overhead de KV cache; se recomienda al menos 80 GB (A100 80GB, H100 80GB) para inferencia comoda.
- En fp16/bf16 con tensor parallelism: 2x A100 40GB o 2x RTX 4090 (24GB) mediante sharding no trivial; 4x RTX 4090 es una configuracion realista con vLLM o TGI.
- Cuantizacion a 8 bits (GPTQ/AWQ): ~35 GB, cabe en A100 40GB o 2x RTX 4090.
- Cuantizacion a 4 bits (GGUF Q4_K_M): ~20 GB, cabe en una RTX 4090 24GB o RTX 3090.
- No cabe en GPUs consumer de 16GB o menos sin cuantizacion agresiva (Q2/Q3) y perdida notable de calidad.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI (tag text-generation-inference), llama.cpp/Ollama previa conversion a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles; estimaciones genericas para 32B en bf16 con A100 80GB rondan decenas de tokens/s por peticion, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic | ~32,76 B | No disponible (base: 131.072) | Apache 2.0 (metadatos) | Abliterated, acceso gated, sin benchmarks |
| Qwen/Qwen2.5-32B-Instruct | ~32,76 B | 131.072 tokens | Apache 2.0 | Modelo base, con filtros de seguridad, benchmarks publicados |
| Meta-Llama-3.1-70B-Instruct | ~70 B | 128.000 tokens | Llama 3.1 Community | Mayor tamano y contexto similar; requiere mas VRAM |
| Mistral-Large-Instruct-2407 | ~123 B | 128.000 tokens | Mistral Research | Mucho mayor; no comparable en VRAM |

La comparativa directa mas relevante es con el propio Qwen2.5-32B-Instruct: mismo tamano y arquitectura, pero con filtros de seguridad. Frente a alternativas "uncensored" de la comunidad (por ejemplo variantes abliterated de Llama 3.1 8B/70B), este modelo ofrece 32B con contexto largo del base, aunque con menos documentacion y adopcion (512 descargas, 0 likes).

## Limitaciones y advertencias

- Riesgo elevado de contenido nocivo: al eliminar los rechazos, el modelo puede generar contenido ilegal, danino o sexual explicito; su uso en produccion requiere moderacion externa obligatoria.
- Alucinacion: sin benchmarks publicados, no hay evidencia de que el fine-tune preserve la factualidad del base; la abliteration puede degradar ligeramente la calidad en tareas de razonamiento.
- Sesgos: hereda los sesgos del Qwen2.5-32B-Instruct y el ajuste no documenta mitigaciones; puede amplificar sesgos al eliminar respuestas de cautela.
- Idioma: metadatos declaran solo ingles; el rendimiento multilingue del base puede no mantenerse.
- Licencia: los metadatos indican Apache 2.0 y openrail++ simultaneamente; la combinacion es ambigua y conviene verificar las condiciones antes de uso comercial.
- Acceso restringido (gated): requiere aceptar terminos en Hugging Face, lo que anade friccion para despliegues automatizados.
- Documentacion escasa: sin dataset, hiperparametros ni evaluaciones, la reproducibilidad es baja pese a la etiqueta "reproducible".
- Fecha de creacion futura (2026-11-05) en los metadatos: posible inconsistencia que conviene contrastar con el repositorio real.
- No hay cuantizaciones oficiales publicadas; convertir a GGUF o AWQ requiere trabajo adicional y validacion de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper refusal directions (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper MPOA (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
