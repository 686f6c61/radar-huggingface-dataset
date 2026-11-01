# RefinedNeuro/Qwen3.8-27b-noslop-v2

## Resumen

Qwen3.8-27b-noslop-v2 es una edición ligera ("mild edit") del modelo Qwen/Qwen3.8-27B, publicada por RefinedNeuro en Hugging Face. Su objetivo es reducir el llamado "slop" en la generación de ficción: el uso repetitivo de palabras y muletillas típicas de los modelos de lenguaje en textos narrativos. No se trata de un reentrenamiento completo, sino de una modificación de pesos generada con la herramienta Heretic (mediante Arbitrary-Rank Ablation, ARA), siguiendo sin cambios la receta upstream `config.noslop.toml`.

El resultado es un modelo de 27.781 millones de parámetros en bf16 (safetensors), con licencia Apache 2.0, que conserva casi intacto el comportamiento del modelo original. Según el propio autor, la reducción de slop es modesta y la principal ventaja frente a su primera versión (`noslop` v1) es que se mantiene cercano al modelo base en tareas de agente de código, con un ligero aumento de bucles detectados. Es relevante como ejemplo de "ablación dirigida": modificar el estilo de un modelo sin reentrenarlo ni aplicar filtros de salida.

El modelo se publica como image-text-to-text (hereda las capacidades multimodales del modelo base Qwen3.8-27B) y dispone de cuantizaciones GGUF en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), con pesos de multi-token-prediction heredados; detalles completos no disponibles |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (original) y GGUF (Q2_K_XL documentado en las pruebas; resto de cuantizaciones en el repo GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y no se reentrena: se aplica Heretic, una herramienta de ablación de rango arbitrario (ARA, rank 50) que busca modificaciones de pesos que reduzcan una métrica objetivo —en este caso KeywordRate sobre listas de palabras "slop" de ficción— manteniendo baja la divergencia KL del primer token respecto al modelo original. El proceso consistió en 60 pruebas (trials) con optimización TPE tras 20 arranques aleatorios y búsqueda en 4 bits; se seleccionó la prueba 18 como candidata de baja divergencia. El adaptador resultante se fusionó en los pesos bf16 originales (suma simple W + B@A).

No se aplican tokens prohibidos ni filtrado de salida: el cambio es puramente paramétrico. Los pesos de multi-token-prediction del modelo base se conservan sin cambios. No hay datos de entrenamiento adicional, número de tokens ni RLHF/DPO, ya que no se ha realizado ningún entrenamiento nuevo.

## Capacidades

- Generación de texto conversacional y escritura creativa, con reducción medida del vocabulario "slop" en ficción (65/100 frente a 86/100 del original en 100 prompts de historias).
- Capacidades de image-text-to-text heredadas del modelo base Qwen3.8-27B (el pipeline declarado en Hugging Face es image-text-to-text).
- Uso como agente de código: se ha probado con Claude Code y el benchmark pi, manteniendo un rendimiento cercano al modelo original.
- Compatibilidad con transformers y con GGUF (llama.cpp y derivados).
- Soporte de multi-token-prediction (pesos conservados del modelo base).
- Tool calling, razonamiento multi-paso y capacidades multilingües: no disponible (no documentado en la model card).

## Casos de uso

- Escritura de ficción con menos clichés: en narrativa generada por LLM, reduce la frecuencia de palabras típicas de "slop" (según las mediciones del autor, de 86 a 65 apariciones por cada 100 historias), útil para borradores creativos donde el estilo repetitivo es un problema.
- Agentes de código con estilo más natural: al mantenerse cerca del original (106/120 tareas frente a 110/120), puede integrarse en flujos tipo Claude Code donde se quiere salida menos "robótica" sin sacrificar fiabilidad.
- Chatbots conversacionales: como modelo conversacional base con Apache 2.0, apto para asistentes propios donde se desee evitar el tono genérico habitual.
- Despliegue local en hardware de consumo/servidor: las cuantizaciones GGUF permiten ejecutarlo en CPU o GPU con memoria limitada (Q2_K_XL documentado).
- Investigación en ablación y edición de modelos: sirve como caso de estudio reproducible del método Heretic con la receta `noslop` upstream.
- Generación de contenido multimodal (texto a partir de imagen y texto): por su pipeline image-text-to-text, heredado del modelo base.

## Benchmarks y rendimiento

No hay benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) publicados. El autor sí publica mediciones propias comparando el GGUF Q2_K_XL de este modelo frente a un Q2_K_XL del original:

| Check | Original | Este modelo |
|---|---|---|
| Respuestas con palabras slop de ficción (100 prompts, greedy, modelo de búsqueda 4-bit) | 86 / 100 | 65 / 100 |
| Divergencia KL del primer token vs original | 0 | 0,0075 |
| Tareas de agente de código superadas (pi y Claude Code, 30 tareas x 2 rondas = 120 ejecuciones, Q2_K_XL) | 110 / 120 | 106 / 120 |
| Ejecuciones detenidas por detector de bucle o sin progreso | 2 / 120 | 6 / 120 |
| Mensaje final del agente con raya (em/en dash) | 100 / 120 | 92 / 120 |

El propio autor advierte que las diferencias de pocas ejecuciones están dentro del ruido estadístico y que la reducción de slop es pequeña y medida solo con listas de palabras de ficción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Referencias aproximadas: bf16 a 27,8 B parámetros requiere ~55,6 GB (coincide con el tamaño del repo), es decir, 2x A100/H100 80 GB o una GPU de 80 GB; con GGUF Q2_K_XL (~4 bits aprox., según el tamaño del repo de cuantización, no disponible exactamente) cabe en torno a 16-20 GB, viable en una RTX 4090 (24 GB) o en 2x RTX 3090/4090 con contexto amplio. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: A100 u H100 para bf16; RTX 4090 / RTX 3090 para GGUF cuantizado (estimación).
- Consumer GPU: en bf16 no cabe en ninguna GPU de consumo; en GGUF de baja cuantización sí es viable en una RTX 4090 de 24 GB (estimación).
- Despliegue: transformers (librería declarada), llama.cpp y derivados (Ollama, LM Studio) vía el repo GGUF `RefinedNeuro/Qwen3.8-27b-noslop-v2-gguf`; compatibilidad con vLLM, TGI o endpoints-serverless de HF no confirmada explícitamente (el tag `endpoints_compatible` está presente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| RefinedNeuro/Qwen3.8-27b-noslop-v2 | 27,8 B | safetensors bf16, GGUF | Apache 2.0 | Ablación Heretic anti-slop, KL 0,0075 vs base |
| RefinedNeuro/Qwen3.8-27b-noslop (v1) | 27,8 B | no disponible | Apache 2.0 | Reduce más los guiones en chat, pero 20/120 ejecuciones de agente con bucles |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | no disponible | Modelo original sin editar; 110/120 en tareas de agente |

Alternativas de otros fabricantes de tamaño similar con enfoque anti-slop: no disponible.

## Limitaciones y advertencias

- La reducción de slop es pequeña y solo medida con listas de palabras de ficción; no es un modelo "sin slop".
- No elimina los em/en dashes: 92 de 120 mensajes finales de agente siguen conteniendo algún guion largo.
- Looping: 6 de 120 ejecuciones de agente fueron detenidas por detectores de bucle, frente a 2/120 del original; pasa ligeramente menos tareas (106 vs 110 de 120).
- Las mediciones se hicieron sobre el GGUF Q2_K_XL, no sobre los pesos bf16 publicados.
- Sesgos: no disponible (no documentado); al derivar del modelo base, hereda presumiblemente sus sesgos.
- Riesgo de alucinación: no disponible; no se han publicado evaluaciones al respecto.
- Idiomas soportados y longitud de contexto: no disponibles en la model card.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia y términos del modelo base Qwen3.8-27B.
- Proyecto comunitario con muy poca tracción (9 descargas, 1 like en el momento de la ficha): madurez y soporte limitados para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RefinedNeuro/Qwen3.8-27b-noslop-v2
- Cuantizaciones GGUF: https://huggingface.co/RefinedNeuro/Qwen3.8-27b-noslop-v2-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta usada): https://github.com/p-e-w/heretic
- Primera versión (v1): no disponible (no se facilita URL directa; buscable como `RefinedNeuro/Qwen3.8-27b-noslop` en Hugging Face)
- Paper, blog o demo: no disponible
