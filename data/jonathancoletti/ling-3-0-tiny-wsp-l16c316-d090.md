# JonathanColetti/Ling-3.0-tiny-wsp-l16c316-d090

## Resumen

Ling-3.0-tiny-wsp-l16c316-d090 es un artefacto de investigación publicado por JonathanColetti que consiste en una edición manual de pesos sobre el modelo base inclusionAI/Ling-3.0-tiny. No se trata de un modelo entrenado ni afinado: se modificaron 1.536 de los aproximadamente 7.900 millones de parámetros del modelo base, multiplicando por 0,9 la columna 316 del tensor `model.layers.16.mlp.shared_experts.down_proj.weight`. No hubo gradientes, ni descenso de gradiente, ni datos de entrenamiento nuevos.

El experimento se enmarca en la disciplina del *weight-space programming* (programación en el espacio de pesos), concretamente en la reproducción del Experimento 8 del blog de Rikiya Takehi, que plantea mejorar el rendimiento matemático de un modelo editando directamente sus pesos. El autor aplicó ese protocolo a Ling-3.0-tiny en lugar del modelo Qwen usado en el blog original, con tres brazos independientes limitados a 10, 25 y 50 peticiones de inferencia.

La relevancia de esta ficha es metodológica más que práctica: el propio autor declara que la regla de adopción predefinida no adoptó la edición y que todas las diferencias observadas en los benchmarks quedan dentro del ruido estadístico. Se publica para hacer reproducible la edición, su evidencia y su resultado nulo. La licencia es MIT y el modelo base es un transformer híbrido de la familia Ling con arquitectura `bailing_hybrid`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (tag `bailing_hybrid`), basado en inclusionAI/Ling-3.0-tiny |
| Parámetros totales | 7.893.392.800 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos publicados están en BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (32 shards; solo `model-00016-of-00032.safetensors` difiere del base) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura, configuración, tokenizador, plantilla de chat y código de modelado de inclusionAI/Ling-3.0-tiny. El tag `bailing_hybrid` sugiere una arquitectura híbrida de atención, aunque la información disponible no detalla la composición exacta de capas ni la proporción entre atención completa y mecanismos lineales. El tensor editado pertenece a un bloque de expertos compartidos (`shared_experts`) en la capa 16, lo que apunta a una estructura de mezcla de expertos (MoE) con expertos compartidos, aunque no se dispone del número de expertos ni de los parámetros activos por token.

No hubo entrenamiento alguno. La edición consistió en multiplicar por 0,9 la columna 316 del tensor `down_proj` de los expertos compartidos de la capa 16, con forma `[1536, 512]` en BF16, y redondear el resultado a BF16. Esto afecta a 1.536 valores de peso. El resto de los 31 shards son idénticos byte a byte al modelo base, cuya revisión es `9a98e35fe1c9ee255f78dd64771c7ae15a799481`. Los hashes SHA-256 del tensor original y del editado están documentados en el manifiesto de la edición.

La hipótesis del editor parte de un problema de conteo de MATH en el que el modelo base respondió 10 en lugar de 11 tras descartar un "1" suelto de una enumeración. El canal 316 de los expertos compartidos de la capa 16 mostró una activación anómala (−5,22) en ese punto de ramificación. El autor reconoce explícitamente que la historia causal específica del error no quedó establecida, ya que ediciones de control emparejadas también alteraron los resultados.

## Capacidades

- Generación de texto y razonamiento matemático, heredadas del modelo base Ling-3.0-tiny.
- Conversación multi-turno, según el tag `conversational` del modelo base.
- Razonamiento matemático evaluado en MATH-500, AMC23 y GSM8K.
- Seguimiento de instrucciones evaluado con IFEval en modo estricto a nivel de prompt.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada; el protocolo del experimento prohibió la terminación forzada del pensamiento.

## Casos de uso

- Reproducción de experimentos de edición de pesos: el repositorio incluye el manifiesto de la edición con hashes y la hipótesis del editor, lo que permite replicar exactamente el cambio y verificar la integridad de los shards frente al modelo base.
- Investigación en interpretabilidad de circuitos: el caso del canal 316 de la capa 16 sirve como ejemplo documentado de cómo una activación anómala en un experto compartido se traduce en una edición causal y en un resultado nulo, útil para diseñar estudios de ablación más rigurosos.
- Estudio de resultados nulos y potencia estadística: los intervalos de confianza pareados y los recuentos de problemas mejor/peor por benchmark permiten analizar qué tamaño de efecto es detectable con las muestras empleadas (500 problemas en MATH-500, 1.319 en GSM8K).
- Docencia sobre evaluación de modelos: el modelo ilustra la diferencia entre mejora aparente y mejora significativa, con deltas de +0,60 pp en MATH-500 y −1,02 pp en IFEval cuyos intervalos al 95 % incluyen cero.
- Auditoría de integridad de pesos: la comparación byte a byte de 31 de los 32 shards con el modelo base sirve como caso práctico de verificación de artefactos publicados en Hugging Face.
- Referencia para pipelines de *weight editing* automatizados: el protocolo de tres brazos con presupuestos de 10, 25 y 50 peticiones y reglas de adopción predefinidas es reutilizable como plantilla para agentes que editan pesos.

## Benchmarks y rendimiento

Evaluación retenida, misma semilla (`seed=0`), mismo muestreo y mismo evaluador para ambos modelos. La precisión se promedia sobre *n* muestras por problema.

| Benchmark | n por problema | Problemas | Base | Esta edición | Δ (pp) | IC 95 % pareado | Mejor / peor |
|---|---|---|---|---|---|---|---|
| MATH-500 | 4 | 500 | 95,75 | 96,35 | +0,60 | [−0,17, +1,37] | 29 / 18 |
| AMC23 | 16 | 40 | 93,75 | 95,00 | +1,25 | [−0,34, +2,84] | 6 / 3 |
| GSM8K | 2 | 1.319 | 94,96 | 95,22 | +0,27 | [−0,28, +0,81] | 28 / 19 |
| IFEval (estricto, nivel de prompt) | 2 | 541 | 89,37 | 88,35 | −1,02 | [−3,07, +1,04] | 43 / 53 |

Respuestas truncadas a 32.768 tokens (base → edición): MATH-500 58 → 49, AMC23 41 → 31, GSM8K 4 → 3, IFEval 32 → 34. No se evaluaron Minerva Math ni OlympiadBench por agotamiento del presupuesto en la nube, ni GPQA-Diamond ni MMLU-Pro-1k porque los prompts y subconjuntos exactos del blog no están publicados. Todos los números provienen de una única ejecución por modelo y semilla; los intervalos no capturan la variación entre semillas ni el batching continuo de SGLang, por lo que la incertidumbre real es mayor.

Resultados por brazo en datos de práctica (solo para selección de la edición):

| Brazo | Mejor candidato | Evidencia | Retenido |
|---|---|---|---|
| 10 peticiones | `c03-l18n58-110` | 368 vs 363 / 384 (McNemar exacto p = 0,27) | original |
| 25 peticiones | `l22neutral-zero` | 245 vs 242 / 256 (p = 0,45) | original |
| 50 peticiones | `l16c316-d090` (este repo) | desarrollo 855 vs 850 / 896; replicación prospectiva 485 vs 485 / 512; confirmación final 244 vs 244 / 256 | original |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15,8 GB solo para pesos, más caché KV y activaciones; el tamaño del repo es de 15,8 GB.
- En cuantización de 8 bits, la huella de pesos bajaría a unos 7,9 GB; en 4 bits, a unos 4 GB, aunque no se han publicado cuantizaciones oficiales de esta edición.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; por tamaño de pesos, en BF16 requeriría GPUs de 24 GB o más (por ejemplo, RTX 3090/4090) para dejar margen a la caché KV, pero no se ha verificado.
- Opciones de despliegue: la model card menciona SGLang como motor de evaluación; también es compatible con transformers al declarar `library_name: transformers` y `custom_code`. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny-wsp-l16c316-d090 (este) | 7,89 B | no disponible | Edición manual de pesos, sin entrenamiento | MIT | Hugging Face, 0 descargas |
| inclusionAI/Ling-3.0-tiny (base) | 7,89 B | no disponible | Modelo base entrenado | no disponible | Hugging Face |
| Modelo Qwen del blog Weight-Space Programming | no disponible | no disponible | Edición de pesos análoga (Experimento 8) | no disponible | Blog del autor |

La comparación relevante es contra el propio modelo base, ya que la edición no modifica arquitectura ni tamaño. Frente a alternativas de la misma categoría (modelos de ~8 B para matemáticas y conversación), no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo mejorado: el autor lo describe como artefacto de investigación y la regla de adopción predefinida rechazó la edición.
- Todas las diferencias en benchmarks quedan dentro del ruido: los intervalos de confianza pareados al 95 % incluyen cero en los cuatro benchmarks evaluados.
- Evaluación de una sola ejecución y una sola semilla; la incertidumbre real es mayor que la reportada por la variación entre semillas y el batching continuo no determinista de SGLang.
- La hipótesis causal específica del error (canal 316 de la capa 16) no quedó establecida: ediciones de control emparejadas también cambiaron los resultados.
- Sesgos conocidos: no disponible en la información proporcionada; se heredan los del modelo base.
- Riesgo de alucinación: no cuantificado; se hereda el del modelo base.
- Limitaciones de contexto e idioma: no disponible.
- Licencia MIT, que permite uso comercial, pero al tratarse de un artefacto experimental no se recomienda su uso en producción.
- Solo un shard difiere del base; cualquier uso práctico debería partir del modelo original inclusionAI/Ling-3.0-tiny.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonathanColetti/Ling-3.0-tiny-wsp-l16c316-d090
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Blog Weight-Space Programming (Rikiya Takehi): https://rikiyat.github.io/blog/weight-space-programming/
- Manifiesto de la edición: https://huggingface.co/JonathanColetti/Ling-3.0-tiny-wsp-l16c316-d090/blob/main/edit-manifest.json
