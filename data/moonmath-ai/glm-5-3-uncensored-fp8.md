# MoonMath-ai/GLM-5.3-Uncensored-FP8

## Resumen

GLM-5.3-Uncensored-FP8 (también conocido como **MoonMath Dolly2**) es una versión *abliterated* («uncensored») de GLM-5.3, publicada por MoonMath.ai, la empresa detrás de la plataforma de inferencia Zro. El modelo se obtiene modificando directamente los pesos de [zai-org/GLM-5.3](https://huggingface.co/zai-org/GLM-5.3) —un MoE de 753.330 millones de parámetros— sin reentrenamiento, para reducir su comportamiento de negativa (*refusal*) en tareas de ciberseguridad legítimas, donde los rechazos del modelo base bloquean trabajo profesional válido.

A diferencia de las abliteraciones «máximas», la receta de MoonMath es quirúrgica: interviene solo en 29 módulos repartidos en 21 capas (proyecciones de salida de atención en las capas 30-62 y proyecciones de expertos compartidos en las capas 34-44), lo que según el autor preserva las capacidades generales. Los resultados declarados apuntan en esa dirección: 91,0 % en IFEval, 89,0 % en MMLU-Pro y 73,3 % en AIME 2025, con una tasa de respuesta del 83,1 % en un conjunto de prompts de ciberseguridad.

Es relevante ahora porque aborda un problema real para equipos de seguridad (la excesiva cautela de los modelos alineados) y porque, según las comparativas del autor, supera con claridad a otras abliteraciones públicas de GLM-5.3, que sufren degradación grave por bucles repetitivos. El checkpoint se distribuye en FP8 (E4M3, bloques 128×128) en safetensors y pesa 755,7 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta de arquitectura `glm_moe_dsa`; detalles no disponibles) |
| Parámetros totales | 753.329.940.480 (~753,3 B, verificado en safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | 1M tokens (declarado para el servicio Zro; el checkpoint local no lo especifica) |
| Tipos de cuantización | FP8 (E4M3, blockwise 128×128) |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (licencia «other», heredada del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de GLM-5.3, un transformer de mezcla de expertos (MoE) con expertos compartidos, como confirma la presencia de los módulos `mlp.shared_experts.down_proj` en la receta de modificación. La etiqueta de arquitectura `glm_moe_dsa` sugiere además atención dispersa, aunque los detalles concretos (número de expertos, parámetros activos por token) no están disponibles en la información publicada. No se ha reentrenado nada: la abliteración interviene en las representaciones internas del modelo ya entrenado.

La modificación afecta a las proyecciones de salida de atención (`self_attn.o_proj`) de las capas 30 a 62 y a las proyecciones de expertos compartidos (`mlp.shared_experts.down_proj`) de las capas 34 a 44, en total 29 módulos en 21 capas. El autor sostiene que este enfoque dirigido, frente a la supresión amplia de direcciones de negativa, evita la degeneración por bucles repetitivos que afecta a otras abliteraciones públicas (67 generaciones degeneradas en el modelo público comparado frente a 0 en MoonMath en la misma evaluación). No se dispone de datos sobre el preentrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, compatible con transformers).
- Razonamiento general: 89,0 % de precisión en MMLU-Pro (5-shot CoT, 200 preguntas).
- Razonamiento matemático: 73,3 % de precisión en AIME 2025 (30 problemas × 2 muestras).
- Seguimiento de instrucciones: 91,0 % en IFEval (prompt-level strict, 100 prompts).
- Disposición a responder consultas de ciberseguridad: 83,1 % de tasa de respuesta en el conjunto de prompts de negativa de ciberseguridad (432 respuestas, 88 desvíos, 0 negativas explícitas).
- Uso agéntico: el servicio Zro lo sirve (`dolly2-security`) integrado con harnesses de código como Claude Code, Codex, OpenCode, Hermes, OpenClaw o Pi.
- Soporte nativo de tool calling / function calling: no disponible en la información proporcionada.
- Modo de pensamiento extendido (thinking mode), visión o audio: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- **Análisis de exploits en laboratorios de seguridad**: el modelo responde el 83,1 % de las consultas de ciberseguridad sin negativas explícitas, lo que permite analizar exploits, payloads y cadenas de ataque en entornos controlados sin los bloqueos del modelo base.
- **Revisión de flujos de autenticación**: uso declarado por el autor; puede auditar lógica de sesiones, tokens y mecanismos de login en busca de debilidades, tarea donde los modelos alineados suelen desviar la petición.
- **Análisis de abuso de servicios (abuse-of-service)**: equipos de antifraude y plataformas pueden modelar cómo se abusaría de sus APIs, cuotas o flujos de registro para diseñar mitigaciones antes de un incidente real.
- **Red teaming interno**: generación de escenarios de ataque, pruebas de intrusión autorizadas y simulaciones de adversario, aprovechando el contexto de 1M tokens del servicio Zro para analizar bases de código extensas de una sola vez.
- **Asistente para CTF y formación en seguridad**: útil en competiciones y cursos de seguridad ofensiva, donde los ejercicios requieren discutir técnicas que otros modelos rechazan sistemáticamente.
- **Agentes de código para auditoría**: desplegado vía Zro con harnesses como Claude Code o Codex, puede integrarse en flujos de revisión de código orientados a seguridad sobre repositorios grandes.
- **Investigación en alineación y abliteración**: al publicar la receta exacta (29 módulos, capas concretas) y comparativas controladas, sirve como artefacto de estudio sobre cómo la abliteración quirúrgica afecta a la calidad general frente a métodos agresivos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados por terceros), obtenidos con lm-evaluation-harness 0.4.13 sobre SGLang con 8× AMD MI325X:

| Benchmark | Muestras | GLM-5.3-Uncensored-FP8 (MoonMath) | Abliterated GLM-5.3 público | Δ |
|---|---|---|---|---|
| IFEval (prompt-level strict) | 100 prompts | 91,0 | 39,0 | +52,0 |
| MMLU-Pro (5-shot CoT) | 200 preguntas | 89,0 | 84,0 | +5,0 |
| AIME 2025 | 30 problemas × 2 muestras | 73,3 | 63,3 | +10,0 |
| Refusal ciberseguridad (answer rate) | conjunto atribuido a Meta Purple Llama | 83,1 % | 67,3 % | +15,8 |

Datos adicionales del mismo experimento: el modelo abliterated público presentó 67 generaciones degeneradas confirmadas y el 53 % de sus respuestas de IFEval alcanzó el límite de 32k tokens; MoonMath registró 0 casos en la misma ejecución. No se han publicado resultados comparativos del modelo base GLM-5.3 en esta información, ni evaluaciones independientes de terceros.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos FP8 ocupan 755,7 GB; con caché KV y sobrecarga de runtime, se recomienda un agregado de al menos 800 GB-1 TB de VRAM por nodo. La cuantización FP8 es el único formato publicado de este repositorio, así que no hay variantes reducidas oficiales.
- **Configuración de referencia del autor**: 8× AMD Instinct MI325X (256 GB cada una) con SGLang.
- **Alternativas NVIDIA**: 8× H200 (1.128 GB agregados) o 8× B200; 8× H100 (640 GB agregados) no bastan para alojar los pesos en FP8.
- **GPUs de consumo**: no es viable; el modelo no cabe en ninguna configuración de consumo (una RTX 4090 con 24 GB cubriría menos del 3 % de los pesos).
- **Despliegue local**: transformers (con `trust_remote_code=True`), vLLM y SGLang, con el mismo layout FP8 que el modelo base. No existe GGUF de este checkpoint, por lo que llama.cpp y Ollama no son aplicables directamente a este repositorio (sí a otras variantes de terceros del modelo base).
- **Despliegue gestionado**: API de Zro (compatible con OpenAI), modelo `dolly2-security`, con contexto de 1M tokens y hasta 131k de salida: 2,10 $/1M tokens de entrada, 6,30 $/1M de salida y 0,45 $/1M adicionales.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Cuantización | IFEval | MMLU-Pro | AIME 2025 | Answer rate ciber | Formato |
|---|---|---|---|---|---|---|
| MoonMath-ai/GLM-5.3-Uncensored-FP8 | FP8 (E4M3) | 91,0 | 89,0 | 73,3 | 83,1 % | safetensors |
| Abliterated GLM-5.3 público (usado como referencia por el autor) | no disponible | 39,0 | 84,0 | 63,3 | 67,3 % | no disponible |
| zai-org/GLM-5.3 (base) | BF16 (presumible) | no disponible | no disponible | no disponible | no disponible | safetensors |
| huihui-ai/Huihui-GLM-5.3-abliterated-GGUF | GGUF | no disponible | no disponible | no disponible | no disponible | GGUF |
| dealignai/GLM-5.3-ABLITERATED-NVFP4 | NVFP4 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa cuantitativa disponible solo cubre el modelo de MoonMath y la abliteración pública anónima usada en sus pruebas; el resto de variantes alternativas existen en Hugging Face pero sin datos publicados en la información recopilada.

## Limitaciones y advertencias

- **Sin evaluación de seguridad**: la abliteración intercambia calibración de seguridad por utilidad. El propio autor advierte que el modelo puede responder a peticiones que el modelo base rechazaría y que no debe usarse como asistente de propósito general en despliegues sensibles sin evaluación propia.
- **Responsabilidad legal y ética del operador**: al tratarse de un modelo deliberadamente desalineado para seguridad ofensiva/defensiva, el despliegue exige controles de acceso, registro de uso y cumplimiento normativo por parte de quien lo sirva.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad fáctica; además, la abliteración puede degradar la calibración del modelo, un riesgo adicional al de cualquier LLM.
- **Benchmarks no verificados y con muestras pequeñas**: IFEval con 100 prompts, MMLU-Pro con 200 preguntas y AIME 2025 con 30 problemas son muestras reducidas; los resultados provienen del autor y están marcados como no verificados.
- **Idiomas no documentados**: la ficha no especifica los idiomas soportados, un vacío relevante para uso en producción.
- **Restricciones de licencia**: la licencia es «other» con nombre `glm-5.3`, heredada del modelo base; los términos exactos para uso comercial deben revisarse en la licencia original de Z.ai antes de cualquier despliegue comercial.
- **Sin afiliación con Z.ai**: el modelo no está respaldado por el creador de GLM-5.3.
- **Adopción temprana**: 140 descargas y 13 likes indican una comunidad de validación muy reducida; no hay evidencia de terceros sobre estabilidad en producción.
- **Barrera de hardware enorme**: solo en FP8, requiere un nodo multi-GPU de gama datacenter, lo que en la práctica empuja hacia la API gestionada de Zro.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/MoonMath-ai/GLM-5.3-Uncensored-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Blog del autor (receta y evaluaciones completas): https://zro.moonmath.ai/posts/dolly-and-me
- Plataforma Zro: https://zro.moonmath.ai
- Anuncio en LinkedIn: https://www.linkedin.com/posts/moonmath-ai_moonmath-aiglm-53-uncensored-fp8-hugging-activity-7520529953055019009-XvNj
- Ficha de Zro en Product Hunt: https://www.producthunt.com/products/zro
- Variantes cuantizadas relacionadas de GLM-5.3: https://huggingface.co/models?other=base_model:quantized:zai-org/GLM-5.3
- Modelos con arquitectura `glm_moe_dsa`: https://huggingface.co/models?other=glm_moe_dsa
