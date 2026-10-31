# OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-GGUF

## Resumen

Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-GGUF es una versión "decensurada" (abliterada) del modelo Ternary-Bonsai-2-27B de Prism ML, publicada por el usuario OS-Software en Hugging Face. Se trata de la segunda iteración (v2) de la serie "Heretic", que aplica una técnica de abliteración basada en un LoRA OT-Ridge fusionado directamente en los pesos ternarios del modelo base, con el objetivo de eliminar los comportamientos de rechazo (refusals) minimizando la pérdida de capacidades.

La relevancia de esta versión frente a la v1 radica en las mejoras medibles que documenta su model card: la proporción de respuestas que no llegan a una respuesta final en 4.096 tokens (con thinking activado) baja del 22 % al 9 %, y con decodificación greedy del 70 % al 16 %. Además, el coste en capacidades se reduce: la caída en MMLU pasa de −1,63 a −0,66 puntos y en HumanEval de −1,83 a −0,61 puntos respecto al modelo original.

El modelo base emplea pesos ternarios (arquitectura "Ternary Bonsai" con componentes de atención y SSM según los parámetros de abliteración publicados) y tiene 26.895.998.464 parámetros. Se distribuye en formato GGUF para su ejecución con llama.cpp, concretamente con el fork de Prism ML que aporta los kernels ternarios necesarios. La licencia es Apache 2.0. Su uso previsto, según el propio autor, es exclusivamente investigación y experimentación (estudios de seguridad, alineación y red-teaming), no despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ternary Bonsai (pesos ternarios; componentes de atención y SSM/FFN según parámetros de abliteración; detalle completo no disponible) |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible oficialmente; el ejemplo de uso emplea `-c 32768` (32.768 tokens) |
| Tipos de cuantizacion | PTQ1_0 y PQ2_0 (packings ternarios propios del fork de llama.cpp de Prism ML) |
| Idiomas soportados | no disponible (las evaluaciones publicadas usan prompts en japonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj-Q8_0.gguf opcional para entrada de imagen) |

## Arquitectura y entrenamiento

El modelo base, Ternary-Bonsai-2-27B de Prism ML, utiliza pesos ternarios (valores discretos, típicamente {-1, 0, +1}), un enfoque que reduce drásticamente el coste de memoria y permite kernels especializados. Los parámetros de abliteración hacen referencia a capas `attn.o_proj` y `mlp.down_proj` en el rango 0–63 (64 capas), y a componentes `ssm_out` y `ffn_down`, lo que sugiere una arquitectura híbrida con elementos de atención y SSM, aunque el detalle completo de la arquitectura no está disponible en la documentación.

Sobre esta base, OS-Software ha aplicado la técnica Heretic (herramienta de código abierto de p-e-w) en su segunda versión: un LoRA de rango 128 con regularización ridge (0,00015) y transporte óptimo gaussiano (rank 4, entropía regularizada a 0,1) fusionado en los pesos ternarios. El proceso modifica las capas `attn.o_proj` y `mlp.down_proj` con pesos por capa (por ejemplo, `ssm_out` con peso 1, reforzado a 1,3 en las capas 32–39 y reducido a 0,5 en las 48–63), un mecanismo de preservación de comportamiento (`preserve_good_behavior_weight` 1,0) y control de sobre corrección (`overcorrect_relative_weight` 4, `max_weight_change` 1,0). No hay información disponible sobre el preentrenamiento del modelo base (tokens, composición del dataset) ni sobre procesos de RLHF/DPO posteriores.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Modo de razonamiento ("thinking") con control de esfuerzo (`--reasoning on`, `--reasoning-effort medium`), mejorado en v2 para completar las respuestas dentro de 4.096 tokens.
- Capacidades de código: el modelo base pierde solo 0,61 puntos en HumanEval respecto al original (diferencia no significativa según la model card).
- Conocimiento general: caída de solo 0,66 puntos en MMLU respecto al modelo original.
- Posible entrada de imagen mediante `mmproj-Q8_0.gguf`, aunque el comportamiento de visión no ha sido evaluado en esta versión.
- Sin restricciones de seguridad: la tasa de rechazos se reduce de 93/100 a 1/100 en el conjunto de 100 prompts dañinos en japonés usado en la evaluación.
- No hay información disponible sobre soporte de tool calling / function calling ni capacidades agénticas.

## Casos de uso

- Investigación en seguridad y alineación: al tener la alineación de seguridad prácticamente eliminada (1/100 refusals), es adecuado para estudiar cómo los modelos responden a prompts adversariales sin los mecanismos de rechazo habituales.
- Red-teaming de sistemas de IA: permite generar y analizar contenido que los modelos alineados rechazan, útil para evaluar filtros y salvaguardas en pipelines de producción.
- Estudios de abliteración y técnicas de decensurado: los parámetros completos del proceso (LoRA OT-Ridge, pesos por capa, regularizaciones) están publicados, lo que lo convierte en un caso de estudio reproducible para investigadores que desarrollan métodos de modificación de alineación.
- Evaluación de hardware para modelos ternarios: su formato GGUF con packings PTQ1_0/PQ2_0 y la necesidad de kernels ternarios lo hacen interesante para probar el ecosistema de inferencia cuantizada de bajo bit del fork de Prism ML de llama.cpp.
- Experimentación local con razonamiento extendido: el modo thinking con esfuerzo configurable permite investigar el comportamiento de modelos razonadores en entornos locales y sin restricciones de contenido.
- Análisis comparativo de deriva de distribución: la divergencia KL de primer token (0,0256) frente al modelo original ofrece un caso práctico para medir cuánto altera una intervención de abliteración el comportamiento general del modelo.
- Benchmarking de capacidades tras intervenciones: las métricas de MMLU y HumanEval publicadas sirven de referencia para comparar el coste en capacidades de distintas técnicas de decensurado.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación de la abliteración, no benchmarks absolutos del modelo):

| Métrica | Este modelo (v2) | Modelo original | v1 (referencia) |
|---|:---:|:---:|:---:|
| Refusals (100 prompts dañinos en japonés, greedy, thinking off) | 1/100 | 93/100 | no disponible |
| KL divergence (primer token, 100 prompts Magpie-Tanuki held-out) | 0,0256 | 0 (por definición) | no comparable (otro conjunto de prompts) |
| Respuestas sin respuesta final en 4.096 tokens (thinking on) | 9 % | no disponible | 22 % |
| Respuestas sin respuesta final (greedy) | 16 % | no disponible | 70 % |
| Δ MMLU frente al original | −0,66 puntos | — | −1,63 puntos |
| Δ HumanEval frente al original | −0,61 puntos (no significativo) | — | −1,83 puntos |

No se han publicado resultados absolutos de benchmarks (MMLU, HumanEval, GSM8K, etc.) del modelo original ni de esta versión en la información disponible; solo se publican las diferencias relativas indicadas.

## Requisitos de hardware

- VRAM estimada: el repositorio completo pesa 14,7 GB, por lo que con packings ternarios PTQ1_0/PQ2_0 el modelo debería caber en GPUs de 16–24 GB de VRAM para inferencia completa en GPU; no hay cifras oficiales de VRAM.
- GPU recomendadas: no disponible oficialmente; por tamaño de archivo, una RTX 4090 (24 GB) debería ser suficiente para el GGUF completo con offload total (`-ngl 99`), y GPUs de 16 GB podrían requerir descarga parcial a CPU.
- Consumer GPUs: plausible en RTX 4090 y probablemente en RTX 3090 dado el peso de ~14,7 GB; sin confirmación oficial.
- Despliegue: exclusivamente con el fork de Prism ML de llama.cpp (los kernels ternarios y las transformaciones de Hadamard son imprescindibles). El comando de referencia es `llama-server` con `-ngl 99 -c 32768 --jinja --reasoning on --reasoning-effort medium --temp 1.0 --top-p 0.95 --top-k 20`. No compatible con vLLM, TGI ni Ollama estándar según la información disponible.
- Parámetros de muestreo recomendados: temperature 1.0, top-p 0,95, top-k 20; si hay repeticiones o bucles, añadir `--repeat-penalty 1.1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Particularidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-Uncensored-Heretic-v2 (este) | 26,9 B | GGUF (PTQ1_0/PQ2_0, pesos ternarios) | 32.768 (en ejemplo de uso) | Apache 2.0 | Abliterado con Heretic v2, 1/100 refusals, requiere fork de llama.cpp de Prism ML |
| Ternary-Bonsai-2-27B-Uncensored-Heretic v1 | 26,9 B | GGUF ternario | no disponible | Apache 2.0 | Abliteración anterior: 22 % de respuestas incompletas (thinking on), −1,63 MMLU |
| prism-ml/Ternary-Bonsai-2-27B (original) | 26,9 B | GGUF ternario | no disponible | Apache 2.0 | Modelo base alineado: 93/100 refusals, KL 0 por definición |

Alternativas comparables de tamaño similar (≈27 B) en formato convencional, como Qwen3-32B o Gemma 3 27B, no disponen de versiones abliteradas documentadas con estas métricas en la información proporcionada; comparativas detalladas de rendimiento: no disponible.

## Limitaciones y advertencias

- Alineación de seguridad sustancialmente eliminada: el autor advierte explícitamente que el modelo tiene más probabilidad de generar contenido dañino, inexacto, sesgado, ofensivo o inapropiado que un modelo estándar.
- Uso previsto limitado a investigación y experimentación (seguridad, alineación, red-teaming); el autor pide expresamente no desplegarlo en servicios públicos ni orientados a usuarios finales.
- Riesgo elevado de alucinación: al tratarse de un modelo decensurado sin salvaguardas, todas las salidas deben considerarse no fiables y verificarse de forma independiente.
- Dependencia de software específico: solo funciona con el fork de Prism ML de llama.cpp; no es compatible con llama.cpp estándar, vLLM, TGI u Ollama.
- Comportamiento de visión sin evaluar: el soporte de imagen vía mmproj existe pero no ha sido validado en esta versión.
- Posibles bucles o repeticiones: la model card recomienda `--repeat-penalty 1.1` si la generación se atasca.
- Evaluación de refusals realizada sobre prompts dañinos en japonés; el comportamiento en otros idiomas, incluido el castellano, no está documentado.
- Sin información sobre idiomas soportados, datos de preentrenamiento ni sesgos específicos del modelo base.
- La divergencia KL de v2 no es comparable con la de v1 por usar conjuntos de prompts distintos.
- Licencia Apache 2.0: permite uso comercial en principio, pero el autor ofrece el modelo sin garantías de ningún tipo y declina toda responsabilidad por daños, usos indebidos o consecuencias legales; el uso es bajo riesgo propio del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-GGUF
- Modelo base (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Versión anterior (v1): https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Fork de Prism ML de llama.cpp (requerido para inferencia): https://github.com/PrismML-Eng/llama.cpp
- Heretic, herramienta de abliteración de p-e-w: https://github.com/p-e-w (repositorio exacto de Heretic no disponible en la información proporcionada)
