# azukivc/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una versión cuantizada y "abliterada" del modelo Qwen3.8-27B de Alibaba, publicada por el usuario azukivc en Hugging Face. El objetivo es reducir sustancialmente el comportamiento de rechazo (refusal) del modelo original mediante una técnica de eliminación de direcciones de rechazo (abliteration) aplicada con la herramienta Heretic, sin recurrir a fine-tuning ni a datos de entrenamiento adicionales. El resultado es un modelo que conserva las capacidades del base (generación de texto, razonamiento, código, matemáticas y visión) pero con una disposición mucho mayor a responder a peticiones que el modelo original podría rechazar.

La publicación incluye cuantizaciones GGUF en varios niveles (IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0) con el head de multi-token prediction (MTP) integrado y verificado, lo que permite usar decodificación especulativa para acelerar la inferencia. El modelo mantiene una ventana de contexto de 262 144 tokens y una arquitectura `Qwen3_5ForConditionalGeneration` con 64 capas y 27 320 millones de parámetros. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que ofrece una alternativa local y sin censura para desarrolladores e investigadores que necesitan un modelo de gran tamaño con capacidades de razonamiento y código, ejecutable en hardware de consumo gracias a las cuantizaciones, y con la posibilidad de acelerar la generación mediante el head MTP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer, 64 capas) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 64 capas con 27 320 millones de parámetros y un vocabulario de 248 320 tokens. La versión "uncensored" se obtiene mediante abliteration: se identifican y eliminan las direcciones de rechazo en las capas `attn.o_proj` y `mlp.down_proj` usando la herramienta Heretic, que co-minimiza el número de rechazos frente a la divergencia KL con el modelo original. El proceso se ejecuta en bf16 sin cuantización intermedia, y la LoRA resultante se fusiona en los pesos bf16, por lo que los pesos publicados no son un round-trip cuantizado.

El head MTP (multi-token prediction) se copia íntegramente del checkpoint base tras la fusión, ya que la abliteration no lo modifica. Este head se mantiene en Q8_0 en todas las configuraciones para preservar la tasa de aceptación de la decodificación especulativa. La importancia matrix (imatrix) se calcula directamente desde el modelo f16, no desde una cuantización intermedia, lo que garantiza una calibración fiel. No se ha realizado fine-tuning ni se han añadido datos de entrenamiento adicionales.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino).
- Razonamiento y resolución de problemas matemáticos, heredados del modelo base Qwen3.8-27B.
- Generación de código y asistencia en programación, capacidad típica de la familia Qwen3.8.
- Procesamiento de imágenes (visión), según la model card que indica "Vision: yes".
- Decodificación especulativa mediante el head MTP integrado, que acelera la inferencia sin degradar la calidad (cada token se verifica contra el modelo objetivo).
- Comportamiento "uncensored": rechazo sustancialmente reducido en comparación con el modelo base, aunque no eliminado por completo.
- Soporte de contexto largo de hasta 262 144 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- No se ha confirmado en la información proporcionada si el modelo conserva capacidades de tool calling o function calling del base.

## Casos de uso

- Generación de código en local: con la cuantización Q4_K_M (16,8 GB) se puede ejecutar en una GPU de 24 GB (por ejemplo, RTX 4090) y procesar repositorios completos gracias a la ventana de 262k tokens, sin depender de servicios en la nube.
- Razonamiento matemático y científico: el modelo base tiene buenas puntuaciones en tareas de matemáticas; la abliteration no altera las capacidades cognitivas, por lo que es útil para resolver problemas complejos paso a paso.
- Análisis de documentos extensos: el contexto de 262 144 tokens permite introducir informes, artículos o libros completos y extraer resúmenes, respuestas a preguntas o realizar análisis de sentimiento.
- Investigación sobre comportamientos de modelos sin restricciones: al reducir el rechazo, permite estudiar cómo responde un modelo de gran tamaño a peticiones controvertidas o límite, útil para investigación en seguridad y ética de IA.
- Despliegue de chatbots locales con aceleración por decodificación especulativa: el head MTP integrado reduce la latencia en entornos de producción, especialmente en hardware con memoria limitada.
- Procesamiento de imágenes y texto combinado: si el modelo base incluye un vision tower, se puede usar para tareas de captioning, VQA o análisis de imágenes junto con texto, todo en local.

## Benchmarks y rendimiento

La model card publica mediciones de perplexity en wikitext-2 para cada cuantización, comparadas contra el baseline f16 (no distribuido). Los resultados son los siguientes:

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no distribuido) | 7,1557 ± 0,25104 | - |
| Q5_K_M | 7,1573 ± 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 ± 0,25019 | +0,0026 |
| Q6_K | 7,1689 ± 0,25149 | +0,0132 |
| Q8_0 | 7,1764 ± 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 ± 0,25227 | +0,0257 |
| IQ2_M | 7,8581 ± 0,27481 | +0,7024 |

El autor advierte que, salvo IQ2_M, todas las cuantizaciones están dentro de un margen de 0,026 con un error estándar de ~0,25, por lo que no son estadísticamente distinguibles entre sí ni del f16. La única diferencia significativa es IQ2_M, que se sitúa ~2,8 errores estándar por encima del baseline. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo + overhead de contexto):
  - IQ2_M: ~10,6 GB (cabe en GPUs de 12 GB como RTX 3060/4070).
  - IQ4_XS: ~15,3 GB (requiere 16 GB o más, p. ej. RTX 4080, A100 40GB).
  - Q4_K_M: ~16,8 GB (recomendable 20-24 GB, p. ej. RTX 4090, A100).
  - Q5_K_M: ~19,5 GB (necesita 24 GB o más).
  - Q6_K: ~22,4 GB (24 GB justos, mejor 32 GB).
  - Q8_0: ~29,0 GB (requiere 32 GB o más, p. ej. A100 40GB, H100).
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100 40GB o H100 para cuantizaciones mayores; RTX 3060/4070 para IQ2_M.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y MTP), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF. vLLM no es compatible directamente con GGUF, aunque se puede convertir a otro formato.
- Latencia y throughput: no disponible en la información proporcionada. La decodificación especulativa con el head MTP puede reducir la latencia, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | 262 144 | Apache-2.0 | safetensors | Modelo original con rechazo estándar, sin cuantizar. |
| Qwen3.8-27B-Uncensored-GGUF (este) | 27,3B | 262 144 | Apache-2.0 | GGUF | Abliterado, con MTP y cuantizaciones. |
| Otros GGUF de Qwen3.8-27B (p. ej. zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF) | 27,3B | 262 144 | Apache-2.0 | GGUF | Variantes similares con MTP, pero sin datos de rendimiento comparativos. |

No se dispone de benchmarks comparativos (MMLU, HumanEval, etc.) entre estas variantes. La principal diferencia frente al base es la reducción del rechazo y la disponibilidad en GGUF; frente a otras variantes uncensored, la diferencia está en el método de abliteration y la verificación del head MTP.

## Limitaciones y advertencias

- El rechazo se ha reducido sustancialmente pero no eliminado: el modelo aún puede negarse a responder ciertas peticiones, especialmente las más extremas.
- La abliteration puede introducir sesgos no deseados o alterar ligeramente el comportamiento en dominios sensibles, aunque las capacidades generales se mantienen.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o hechos.
- El contexto de 262 144 tokens es amplio, pero el rendimiento puede degradarse en los tramos más largos; se recomienda validar en casos de uso reales.
- Solo se soportan inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el contenido "uncensored" puede tener implicaciones legales o éticas según el contexto de uso; el responsable del despliegue debe evaluar los riesgos.
- La cuantización IQ2_M muestra una degradación medible en perplexity; para tareas críticas se recomienda usar Q4_K_M o superior.
- El head MTP fue entrenado contra el modelo sin abliterar, por lo que la tasa de aceptación de la decodificación especulativa puede ser ligeramente inferior a la del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azukivc/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de orcarouter sobre el modelo: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio GitHub de unburdened-jackinthebox365: https://github.com/unburdened-jackinthebox365/qwen38-uncensored
- Repositorio GitHub de qwen3-8-27b: https://github.com/qwen3-8-27b/qwen3-8-27b
- Variante similar de zerodigest: https://huggingface.co/zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF
