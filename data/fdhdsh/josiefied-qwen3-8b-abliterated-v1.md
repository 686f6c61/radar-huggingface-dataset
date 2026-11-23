# fdhdsh/Josiefied-Qwen3-8B-abliterated-v1

## Resumen

Josiefied-Qwen3-8B-abliterated-v1 es un ajuste fino del modelo Qwen/Qwen3-8B desarrollado por Gökdeniz Gülmez (publicado en Hugging Face bajo la cuenta fdhdsh) como parte de la familia JOSIEFIED. El modelo parte de la arquitectura transformer densa de Qwen3 con 8.190.735.360 parámetros y aplica una técnica de "abliteration", que consiste en eliminar o atenuar los vectores de rechazo aprendidos durante el alineamiento del modelo base, seguida de un ajuste fino orientado a maximizar el comportamiento sin censura.

El objetivo declarado es ofrecer generación de texto y conversación sin las restricciones de seguridad típicas del modelo original, manteniendo al mismo tiempo la capacidad de seguir instrucciones y de usar herramientas. La model card afirma que estos modelos a menudo superan al modelo base en benchmarks estándar, aunque no se aportan resultados verificables de MMLU, HumanEval u otras pruebas de razonamiento o código en la información disponible.

Es relevante ahora porque demuestra el ecosistema de derivados no oficiales que se construyen sobre Qwen3, un modelo de referencia en la franja de 8B, y porque ilustra las tensiones entre apertura, seguridad y licencias: el repositorio no declara licencia, no especifica idiomas soportados y tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta contextos largos, pero el valor exacto de este derivado no se especifica) |
| Tipos de cuantizacion | GGUF (varias versiones: mradermacher, DevQuasar, bartowski, Mungert), i1 GGUF, MLX, y cuantizaciones Ollama q4_k_m, q5_k_m, q6_k, q8_0, fp16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo principal), GGUF y MLX en repos derivados |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros y pesos en safetensors (16,4 GB de repositorio). Sobre esa base se aplica abliteration, una técnica que identifica y elimina direcciones en el espacio de activaciones asociadas al rechazo de peticiones, y posteriormente un ajuste fino adicional orientado a alineamiento de instrucciones y a un comportamiento sin restricciones.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas propias: las capacidades de decodificación, atención y contexto provienen del modelo base Qwen3-8B. El autor menciona que la familia JOSIEFIED se construye sobre Qwen2/2.5/3, Gemma3 y LLaMA3/4, en tamaños de 0,5B a 32B, y que el ajuste busca preservar el uso de herramientas y el seguimiento de instrucciones pese a la eliminación de los vectores de rechazo.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat.
- Seguimiento de instrucciones y alineamiento conversacional, reforzado mediante ajuste fino.
- Uso de herramientas y function calling, según declara el autor que se preserva en la familia JOSIEFIED.
- Comportamiento sin censura: la model card indica que los vectores de rechazo han sido eliminados y que el modelo no rechaza peticiones.
- Capacidades heredadas del modelo base Qwen3-8B (razonamiento y código), aunque no se aportan evaluaciones específicas de este derivado.
- Soporte de cuantizaciones GGUF, i1 GGUF y MLX para despliegue local.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la abliteration afecta a la tasa de rechazo, la calidad de las respuestas y la fidelidad al prompt, comparándolo con el Qwen3-8B original en entornos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas sensibles donde el modelo base aplicaría filtros, usando las versiones GGUF en local para mantener privacidad.
- Evaluación de robustez de filtros: servir el modelo con vLLM o TGI y medir la eficacia de capas de moderación externas, ya que el modelo no incorpora rechazo propio.
- Asistente conversacional autoalojado: despliegue con Ollama (q4_k_m o q5_k_m) en una estación de trabajo para conversaciones multi-turno sin dependencia de API externa.
- Pruebas de seguimiento de instrucciones y tool calling: validar en pipelines de agentes si las capacidades de function calling del base se conservan tras la abliteration, con pruebas de regresión propias.
- Experimentación con cuantizaciones: comparar las variantes GGUF de mradermacher, bartowski y Mungert, y las versiones MLX para Apple Silicon, para medir la degradación de calidad frente a fp16.
- Base para ajustes finos posteriores: punto de partida para investigadores que quieran construir derivados temáticos (por ejemplo, las variantes 64K y 192K de DavidAU) sin partir del alineamiento original.

## Benchmarks y rendimiento

La model card incluye únicamente resultados del UGI Leaderboard (sin modo thinking), que mide comportamiento no restrictivo más que calidad técnica:

| Metrica | Valor |
|---|---|
| Posicion en UGI Leaderboard | 8 |
| UQI | 32,6 |
| Unruly | 4 |
| Internet | 1,7 |
| Social/Political | 1,6 |
| W/10 | 9 |
| W/10 - Direct | 8 |
| W/10 - Adherence | 10 |
| Natint | 13,72 |
| Coding | 8 |
| Political Lean | -7,2 % |
| Ideology | Liberalism |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La afirmación de la model card de que estos modelos "a menudo superan al base en benchmarks estándar" no viene respaldada por cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 24 GB o más.
- VRAM estimada en q8_0: en torno a 9 GB; en q5_k_m: unos 6 GB; en q4_k_m: unos 5 GB (estimaciones según el tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo y serving concurrente; RTX 4090 (24 GB) para fp16 ajustado o q8_0; RTX 3090/4080 (16-24 GB) para cuantizaciones q5-q8.
- Cabe en GPU de consumo: sí, en q4_k_m y q5_k_m en tarjetas de 8-12 GB; en q8_0 en tarjetas de 12-16 GB.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), vLLM, llama.cpp y Ollama (imagen goekdenizguelmez/JOSIEFIED-Qwen3 con variantes 8b, q4_k_m, q5_k_m, q6_k, q8_0 y fp16), además de MLX para Apple Silicon.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Josiefied-Qwen3-8B-abliterated-v1 | 8,19B | No disponible | Sin censura (abliterated) | No disponible | Hugging Face, GGUF, MLX, Ollama |
| Qwen/Qwen3-8B (base) | 8,19B | Contexto largo (valor exacto no verificado aqui) | Alineado con rechazos | Licencia de Qwen (consultar en el repo original) | Hugging Face, ecosistema amplio |
| Otras variantes abliterated de Qwen3-8B (por ejemplo, las de mlx-community) | 8,19B | Segun derivado | Sin censura | Segun derivado | Hugging Face, MLX |

La comparación con alternativas de la misma categoría (derivados abliterated de Qwen3-8B) es limitada porque no se dispone de benchmarks técnicos comparables; el único dato publicado es la posición 8 en el UGI Leaderboard del propio autor.

## Limitaciones y advertencias

- Ausencia de filtrado de seguridad: el modelo está diseñado para no rechazar peticiones, por lo que puede generar contenido sensible, controvertido o dañino; el autor lo advierte explícitamente.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al eliminar el alineamiento se puede reducir la calibración de rechazos ante preguntas sin respuesta.
- Licencia no disponible: no se declara licencia en el repositorio, lo que impide determinar si el uso comercial está permitido; además, las obligaciones de la licencia del modelo base Qwen3-8B podrían seguir aplicando.
- Idiomas no especificados: se desconoce el soporte multilingüe real de este derivado.
- Contexto no documentado: la longitud de contexto efectiva de este ajuste no se indica; las variantes de 64K y 192K de terceros sugieren que el base soporta ventanas amplias, pero no hay confirmación para este repo.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación de la comunidad.
- Atribución confusa: el repo se publica bajo la cuenta fdhdsh, mientras que la model card atribuye el desarrollo a Gökdeniz Gülmez; conviene verificar la procedencia antes de usarlo en producción.
- Sin garantías de tool calling: aunque el autor afirma que se preserva, no hay pruebas publicadas de function calling en este derivado concreto.

## Enlaces

- Repositorio principal: https://huggingface.co/fdhdsh/Josiefied-Qwen3-8B-abliterated-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- GGUF (mradermacher): https://huggingface.co/mradermacher/Josiefied-Qwen3-8B-abliterated-v1-GGUF
- i1 GGUF (mradermacher): https://huggingface.co/mradermacher/Josiefied-Qwen3-8B-abliterated-v1-i1-GGUF
- GGUF (DevQuasar): https://huggingface.co/DevQuasar/Goekdeniz-Guelmez.Josiefied-Qwen3-8B-abliterated-v1-GGUF
- GGUF (bartowski): https://huggingface.co/bartowski/Goekdeniz-Guelmez_Josiefied-Qwen3-8B-abliterated-v1-GGUF
- GGUF (Mungert): https://huggingface.co/Mungert/Josiefied-Qwen3-8B-abliterated-v1-GGUF
- GGUF-64K-Horror-Max (DavidAU): https://huggingface.co/DavidAU/Qwen3-8B-64k-Josiefied-Uncensored-HORROR-Max-GGUF
- GGUF-192k-NEO-Max (DavidAU): https://huggingface.co/DavidAU/Qwen3-8B-192k-Josiefied-Uncensored-NEO-Max-GGUF
- Coleccion MLX: https://huggingface.co/collections/mlx-community/josiefied-and-abliterated-qwen3-6811260a945bd137210b5c7d
- Ollama: https://ollama.com/goekdenizguelmez/JOSIEFIED-Qwen3
