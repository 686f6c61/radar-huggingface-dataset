# AnirudhNarayan/wsp_nov10_qwen3vl8b

## Resumen

`wsp_nov10_qwen3vl8b` es un checkpoint derivado de Qwen/Qwen3-VL-8B-Instruct al que se le ha aplicado una edición directa de pesos, sin gradientes ni fine-tuning, para incrementar la tasa de rechazo ante peticiones dañinas en contexto multimodal. La edición forma parte del estudio WSP-MLLM-Safety ("weight-space programming" aplicado a seguridad de modelos multimodales) y modifica únicamente seis tensores MLP en las capas 20 y 22 del torre de lenguaje, sobrescribiendo cuatro neuronas poco utilizadas. El resto del modelo —torre de visión, embeddings, atención, tokenizador, processor, plantilla de chat y configuraciones— es byte-idéntico al snapshot original.

El modelo conserva la arquitectura y capacidades de Qwen3-VL-8B-Instruct: un transformer multimodal de 8.767.123.696 parámetros (8,77 B) que procesa imagen y texto para generar respuestas conversacionales. La intervención busca resolver un problema concreto: la propensión del modelo base a cumplir instrucciones dañinas cuando se acompañan de una imagen, un vector de ataque habitual en sistemas con entrada visual. Frente a un fine-tuning de seguridad convencional, la edición consume un presupuesto de 500 forward passes (424 utilizados) y no requiere optimizador ni dataset de preferencias.

La relevancia del checkpoint es doble: por un lado, demuestra que es posible modular el comportamiento de rechazo de un VLM de 8 B editando un puñado de pesos; por otro, expone las limitaciones del enfoque, con un aumento de falsos rechazos en prompts benignos (ORR del 0,2 % al 4,1 %) y una evaluación basada en reglas léxicas en lugar de un juez semántico. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + torre de lenguaje Qwen3-VL); edición sobre MLP de capas 20 y 22 |
| Parámetros totales | 8.767.123.696 (8,77 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards, 17,5 GB) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`) |
| Pesos modificados | 49.145 de 8,77 B (6 tensores, rango 2 por matriz) |
| Librería | transformers (probado con 4.57.5) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con una torre de visión acoplada a un modelo de lenguaje Qwen3-VL de 8 B. La edición no altera esa arquitectura: actúa sobre seis tensores MLP (`gate_proj`, `up_proj`, `down_proj`) de las capas 20 y 22, sobrescribiendo dos neuronas poco utilizadas por capa (neuronas 8274 y 9595 en la capa 20; 188 y 4039 en la capa 22). Cada par de neuronas implementa una función de saturación que añade al residual stream el término `c·|r|·clip((w·x − τ)/width, 0, 1)·r̂`, con `c = 4`, `width = 0,2` y `β = 32`. La neurona A activa el empuje y la B lo limita, de ahí el rango 2 de cada matriz.

Los componentes de esa función se calculan en forma cerrada: `w` es un detector de daño obtenido como diferencia de medias entre prompts dañinos y benignos (última posición del prompt), blanqueado con una covarianza regularizada resuelta por ridge; `b` es una dirección con `b·x ≈ 1` en todas las posiciones que dota al MLP (sin sesgo) de un umbral real `τ`, fijado en el cuantil 99,5 % de las posiciones benignas finales; y `r̂` es la dirección de rechazo posterior a la capa, calculada como media(rechazado) − media(cumplido) sobre prompts dañinos. Los datos de desarrollo se limitan al conjunto de entrenamiento de VLGuard, con 424 forward passes de los 500 permitidos, sin gradientes ni pasos de optimizador. El agente de edición fue Claude Fable 5.2, aunque el estudio especificaba Fable 5.1.

El cambio relativo de Frobenius varía notablemente entre tensores: 18,96 % en `gate_proj` de la capa 20, 15,20 % en `gate_proj` de la capa 22, 12,62 % en `down_proj` de la capa 22, frente a valores en torno al 1,2 % en los `up_proj`. Esa asimetría refleja que la intervención se concentra en las proyecciones de compuerta y salida del MLP.

## Capacidades

- Generación de texto conversacional multi-turno, heredada íntegramente del modelo base.
- Comprensión de imagen y texto conjuntamente (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Rechazo reforzado de peticiones dañinas, tanto con imagen dañina como con instrucción dañina sobre imagen benigna.
- Preservación de la utilidad benigna: la NLL de referencia apenas cambia (2,040 → 2,042) y el word-F1 se mantiene (0,362 → 0,361).
- Soporte de tool calling, function calling y razonamiento multi-paso: no documentado en la información proporcionada para este checkpoint; se heredaría del base si este lo soporta, pero no se confirma.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: solo visión confirmada; el resto no disponible.

## Casos de uso

- Investigación en alineación de VLMs: el checkpoint sirve como caso de estudio reproducible de edición de pesos sin gradientes, con log de edición, scripts y salidas crudas disponibles en el paquete de handoff del estudio. Adecuado para comparar contra fine-tuning de seguridad en coste y efecto.
- Filtrado previo en pipelines de moderación visual: dado su ASR del 1,2 % en el agregado de VLGuard (frente al 32,3 % del base), puede emplearse como primera barrera en sistemas que reciben imágenes de usuarios antes de derivar a un modelo mayor.
- Evaluación de sobre-rechazo: su ORR del 4,1 % lo convierte en un banco de pruebas útil para medir el coste de utilidad de las intervenciones de seguridad y calibrar umbrales de rechazo.
- Despliegue en entornos con restricciones de cómputo para edición: al requerir solo 424 forward passes y no necesitar optimizador, el método es replicable en una única GPU de 16 GB con offload parcial a CPU, útil para equipos sin clústeres de entrenamiento.
- Análisis de mecanismos internos: las neuronas editadas y las direcciones `w`, `b` y `r̂` permiten estudiar cómo se codifica la negativa a responder en capas intermedias de un VLM de 8 B.
- Prototipado de asistentes visuales con política de rechazo estricta: en dominios donde un falso negativo es más costoso que un falso positivo (revisión de contenido sensible, por ejemplo), el sesgo hacia el rechazo puede ser aceptable como capa adicional, nunca como única defensa.

## Benchmarks y rendimiento

Evaluación held-out sobre el conjunto de test de VLGuard (1.558 prompts), con scoring de rechazo basado en reglas léxicas, BF16, decodificación greedy y 64 tokens nuevos. ASR = proporción de prompts dañinos no rechazados; ORR = proporción de rechazos sobre prompts benignos.

| Subconjunto | n | ASR original → editado |
|---|---:|---|
| unsafes (imagen dañina) | 442 | 0,432 → 0,014 |
| safe_unsafes (imagen segura, instrucción dañina) | 558 | 0,237 → 0,011 |
| Agregado | 1000 | 0,323 → 0,012 |
| safe_safes ORR | 558 | 0,002 → 0,041 |

Resultados de desarrollo (prompts de entrenamiento de VLGuard reservados de la edición), tasa de rechazo en el primer token, original → editado: `unsafes` 0,34 → 1,00; `safe_unsafes` 0,59 → 0,98; `safe_safes` 0,00 → 0,00; LLaVA benigno 0,02 → 0,02. En generación de 48 tokens: 40/40 prompts dañinos rechazados, 0/16 benignos rechazados. NLL de respuesta de referencia sin cambios (2,077 → 2,075).

En held-out, 311 prompts dañinos pasaron a ser rechazados y ningún prompt rechazado por el original es cumplido por el editado. De los 22 nuevos rechazos benignos, 8 rechazan desde el primer token (imágenes de aspecto sensible) y 14 interrumpen con una negativa a mitad de respuesta, típicamente tras una línea como "Here's a breakdown:". No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,5 GB de pesos, más overhead de activaciones y caché KV; el desarrollo se realizó en una GPU de 16 GB con offload parcial a CPU, lo que confirma que no cabe holgadamente en 16 GB sin offload.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 sin offload; en GPUs de 16 GB (RTX 4080, A4000) es necesario offload parcial.
- Cabe en GPU consumer de 24 GB (RTX 3090, RTX 4090) en BF16; en 16 GB solo con offload o cuantización, aunque no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (versión probada 4.57.5) con `Qwen3VLForConditionalGeneration` y `AutoProcessor`; el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wsp_nov10_qwen3vl8b | 8,77 B | no disponible | Edición de pesos sin gradientes (6 tensores) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-8B-Instruct | 8,77 B | no disponible | Sin edición específica | Apache-2.0 | Hugging Face |
| Fine-tuning de seguridad sobre VLGuard | 8,77 B | no disponible | Fine-tuning supervisado con dataset de seguridad | Apache-2.0 (si se mantiene) | No disponible en la información |

La comparación cuantitativa con alternativas de la misma categoría (otros VLMs de 8 B con alineación de seguridad, como LlavaGuard o variantes editadas de LLaVA) no está disponible en la información proporcionada. El único contraste documentado es contra el propio modelo base, con los datos de ASR y ORR de la sección anterior.

## Limitaciones y advertencias

- Evaluación basada en reglas léxicas de frases de rechazo sobre 64 tokens, no en un juez semántico; 185 de las 988 negativas del modelo editado contienen un giro del tipo "however, I can…" y pueden filtrar contenido parcial.
- Solo se evaluó VLGuard; quedan pendientes FigStep, MM-SafetyBench, JailBreakV, ScienceQA y MathVista.
- El sobre-rechazo subió a aproximadamente el 4 %, más de lo previsto en desarrollo, principalmente por negativas a mitad de respuesta.
- Riesgo de alucinación: no cuantificado en la información disponible; se hereda el del modelo base, sin evaluación específica tras la edición.
- Sesgos conocidos: no documentados; la edición no incluye evaluación de sesgos demográficos o culturales.
- Limitaciones de idioma y contexto: no disponibles; la evaluación se realizó presumiblemente en inglés (VLGuard), sin datos sobre otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el checkpoint es un artefacto de investigación con evaluación incompleta; no debe desplegarse como única capa de seguridad.
- El run utilizó Claude Fable 5.2 en lugar de Fable 5.1, especificado por el estudio, y el workspace carecía de hash de commit git (datos verificados por checksums de manifiesto).
- El detector de daño emplea una diferencia de medias blanqueada en forma cerrada; si eso cuenta como "parameter fitting" bajo las reglas del estudio queda a criterio del equipo responsable.
- Los resultados held-out están pendientes de una evaluación independiente con juez por parte del equipo del estudio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnirudhNarayan/wsp_nov10_qwen3vl8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper, blog, repositorio o demo del estudio WSP-MLLM-Safety: no disponibles en la información proporcionada.
