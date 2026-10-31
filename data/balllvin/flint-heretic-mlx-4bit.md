# balllvin/flint-heretic-mlx-4bit

## Resumen

Flint Heretic (MLX, 4-bit) es una versión cuantizada y "abliterated" del modelo Flint de Recursive, un modelo de lenguaje de 39,8 mil millones de parámetros con arquitectura mixture-of-experts (MoE), de los cuales solo unos 2,5 mil millones están activos por token. El repositorio original, RecursiveSI/flint, se publicó en bf16 bajo licencia Apache-2.0 y destaca por escribir su razonamiento antes de responder. Esta compilación, creada por el usuario balllvin, aplica la técnica de abliteración popularizada por Heretic: elimina la dirección en el espacio de activaciones que el modelo usa para negarse a responder, reduciendo drásticamente sus rechazos.

La relevancia de esta ficha es doble. Por un lado, demuestra que la ablación de rechazos puede aplicarse a un modelo MoE de gran escala sin destruir su coherencia, preservando la norma de las filas de pesos modificadas. Por otro, ofrece un punto de partida cuantizado a 4 bits para Apple Silicon, con soporte de contexto de 262.144 tokens, lo que lo hace atractivo para ejecutar localmente un modelo razonador de gran capacidad en Macs con memoria unificada de 48 GB o más.

Los resultados publicados muestran que la tasa de rechazo cae del 94% al 22% en prompts dañinos retenidos, mientras que GSM8K y MMLU-Pro se mantienen prácticamente intactos. El coste principal es una caída en GPQA Diamond (de 76% a 62%) y respuestas considerablemente más largas que a menudo no cierran el bloque de razonamiento dentro del presupuesto de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), 49 capas, 256 expertos enrutados por capa más experto compartido |
| Parametros totales | 39,8 B |
| Parametros activos | ~2,5 B |
| Longitud de contexto | 262.144 tokens (el runtime rec limita por defecto a 8.192, configurable, p. ej. 65.536) |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64, embeddings en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (cuantizado), ~22,6 GB en el repositorio (~21 GiB en disco) |

## Arquitectura y entrenamiento

Flint es un transformer disperso de tipo mixture-of-experts con 49 capas y 256 expertos enrutados por capa, más un experto compartido; solo alrededor de 2,5 mil millones de parámetros se activan por token, lo que explica su velocidad razonable pese al tamaño total. Las capas 0 y 1 usan un `mlp.down_proj` denso en lugar de experto compartido. El modelo base fue entrenado por Recursive y publicado en bf16; no se dispone de datos públicos sobre el número de tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO.

Sobre el modelo base se aplicó una abliteración siguiendo el método de Heretic: se calcula la dirección de rechazo por capa (media de activaciones sobre prompts dañinos menos media sobre prompts inofensivos) y se resta la componente de cada fila de peso a lo largo de esa dirección, reescalando después la fila a su norma original para preservar la coherencia. Se modificaron 50 matrices en las capas 24 a 48: 25 matrices `self_attn.o_proj` y 25 matrices `mlp.shared_expert.down_proj`, es decir, solo las que escriben directamente en el flujo residual. Los 256 expertos enrutados por capa no se tocaron. La intensidad de ablación fue plana (λ = 4,0) en las 25 capas, sin aplicar nada por debajo de la capa 24; según el autor, esta ventana dura superó a la rampa suave por defecto de Heretic tanto en reducción de rechazos como en divergencia KL. La cuantización MLX affine de 4 bits con group size 64 es el único cambio adicional.

## Capacidades

- Generacion de texto con razonamiento explicito: el modelo escribe su cadena de razonamiento antes de la respuesta final (estilo reasoning model).
- Razonamiento matematico: 92% en la muestra de GSM8K evaluada, sin degradacion tras la ablacion.
- Conocimiento general y razonamiento academico: 90% en MMLU-Pro (muestra de 70 preguntas) y 62% en GPQA Diamond tras la ablacion.
- Ventana de contexto muy amplia: hasta 262.144 tokens, util para documentos largos y conversaciones extensas.
- Eficiencia MoE: ~2,5 B parametros activos por token, con inferencia de ~35 tokens/s en un stream en un M5 Pro de 64 GB.
- Servible como API compatible con OpenAI mediante el runtime rec.
- No hay informacion sobre tool calling, function calling, capacidades de vision, audio ni soporte agente multi-paso.

## Casos de uso

- Investigacion sobre alineamiento y ablacion de rechazos: al conservar el modelo base y publicar metricas KL y de rechazo, sirve como banco de pruebas para estudiar como la abliteracion afecta a modelos MoE a gran escala.
- Razonamiento matematico local: con 92% en GSM8K y salida de razonamiento explicita, es adecuado para resolver problemas de aritmetica y logica en un Mac sin enviar datos a la nube.
- Analisis de documentos largos: la ventana de 262.144 tokens permite procesar contratos, informes o bases de codigo extensas de una sola vez (configurando `--context-limit` acorde a la memoria disponible).
- Prototipado de asistentes locales: el modo `rec-mlx serve` expone una API compatible con OpenAI, lo que facilita integrarlo en aplicaciones existentes sin cambios de cliente.
- Generacion de texto creativo sin filtros: la reduccion de rechazos (94% a 22%) lo hace util para escritura creativa donde los modelos alineados se niegan con frecuencia, siempre dentro del marco legal.
- Evaluacion comparativa de cuantizacion: al existir el modelo base y esta variante 4-bit con el mismo harness de evaluacion, permite medir el impacto real de la cuantizacion MLX en benchmarks.
- Estudio de efectos secundarios de la ablacion: el aumento de longitud de respuesta (mediana de 156 a 3.504 caracteres) y los bloques de razonamiento sin cerrar son un caso de estudio interesante para quien investigue efectos colaterales de estas tecnicas.

## Benchmarks y rendimiento

Resultados publicados por el autor, ambos modelos en 4-bit MLX, mismo harness, con los ajustes recomendados por Recursive (temperature 1.0, top-p 0.95, top-k 20, hasta 32.768 tokens de salida). Subconjuntos fijos, puntuacion por respuesta exacta; intervalos de Wilson al 95% entre parentesis.

| Benchmark | n | Flint (base) | Flint Heretic |
|---|---|---|---|
| MMLU-Pro | 70 | 91% (83–96) | 90% (81–95) |
| GPQA Diamond | 50 | 76% (63–86) | 62% (48–74) |
| CulturalRiddles | 40 | 18% (9–32) | 22% (12–38) |
| GSM8K | 50 | 92% (81–97) | 92% (81–97) |

Metricas de ablacion (100 prompts daninos retenidos, decodificacion greedy, presupuesto de 100 tokens, medidas sobre este checkpoint 4-bit exacto):

| Metrica | Flint (base) | Flint Heretic |
|---|---|---|
| Tasa de rechazo | 94,0% | 22,0% |
| Tasa de rechazo (incluyendo rechazos dentro del bloque de razonamiento) | 96,0% | 31,0% |
| Respuestas que cierran el bloque de razonamiento | 3% | 51% |
| Cierra razonamiento y responde sin rechazar | 0/100 | 47/100 |
| KL(base ‖ Heretic), primer token | 0 | 0,1176 |
| GSM8K, 20 preguntas, numero final exacto | 15/20 | 15/20 |
| Longitud mediana de respuesta | 156 caracteres | 3.504 caracteres |

Velocidad medida con la implementacion MLX basica del laboratorio en un M5 Pro (64 GB): ~35 tokens/s en un stream y ~150 tokens/s con ocho streams concurrentes. El runtime rec es mas rapido, pero no se ha medido sobre este checkpoint.

## Requisitos de hardware

- Memoria unificada minima de 48 GB en Apple Silicon (M1 o posterior); 64 GB o mas recomendable para contextos largos.
- Unas 25 GB de disco libre para el checkpoint (~21 GiB en disco, 22,6 GB en el repositorio).
- Encaja en Macs de gama alta con memoria unificada; no es ejecutable en GPUs consumer tipicas (RTX 4090 con 24 GB se queda corta) ni en la mayoria de GPUs de datacenter sin cuantizacion adicional, dado el peso de ~22,6 GB solo en pesos y la necesidad de espacio para KV cache.
- Despliegue mediante el runtime rec de Recursive (`rec-mlx chat` / `rec-mlx serve`, API compatible con OpenAI) o la libreria MLX de Apple; no hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Python 3.12 o superior y Xcode command line tools.
- Latencia: ~35 tokens/s en un stream con la implementacion MLX basica en M5 Pro; throughput de ~150 tokens/s agregados con ocho streams. No hay datos para el runtime rec sobre este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Particularidad |
|---|---|---|---|---|---|
| Flint Heretic (este modelo) | 39,8 B | ~2,5 B | 262.144 | Apache-2.0 | Abliterated, cuantizado MLX 4-bit para Apple Silicon |
| RecursiveSI/flint (base) | 39,8 B | ~2,5 B | 262.144 | Apache-2.0 | Modelo original con comportamiento de rechazos intacto, bf16 |
| Qwen3-30B-A3B (referencia de categoria MoE similar) | 30,5 B | ~3,3 B | 32.768 (131.072 con YaRN) | Apache-2.0 | MoE compacto con amplia disponibilidad de cuantizaciones GGUF/MLX |

No hay datos de benchmarks comparativos directos publicados entre Flint y Qwen3-30B-A3B en la informacion disponible. Dentro del ecosistema Flint, la alternativa relevante es el modelo base RecursiveSI/flint, que conserva el 94% de tasa de rechazo pero rinde igual o mejor en GPQA Diamond y genera respuestas mucho mas cortas.

## Limitaciones y advertencias

- Modelo abliterated: elimina deliberadamente la mayoria de los rechazos de seguridad. Esto implica riesgo legal y etico significativo; el usuario asume toda la responsabilidad del uso que haga de las salidas. No debe desplegarse en produccion orientada a usuarios finales sin salvaguardas externas.
- Degradacion medible en tareas cientificas dificiles: GPQA Diamond cae del 76% al 62% (los intervalos de confianza se solapan con n=50, pero el autor recomienda tratar las preguntas de ciencia difficil como el punto debil).
- Verbosidad extrema: la mediana de respuesta pasa de 156 a 3.504 caracteres, y el 49% de las respuestas no cierra el bloque de razonamiento dentro del presupuesto de 100 tokens; casi todos los rechazos residuales (18 de 22) provienen de ese modo de fallo. Con presupuestos de salida ajustados, muchas respuestas quedaran incompletas.
- Contexto por defecto del runtime rec limitado a 8.192 tokens, insuficiente para el estilo de razonamiento del modelo; hay que subirlo explicitamente (p. ej. `--context-limit 65536`) con el consiguiente consumo extra de memoria para el KV cache.
- Formato MLX exclusivo de Apple Silicon: no ejecutable en CUDA ni en la mayoria de infraestructuras de nube habituales.
- Sin informacion sobre idiomas soportados, sesgos especificos del modelo base ni datos de entrenamiento; la ablacion puede introducir sesgos o degradaciones no documentados mas alla de los benchmarks publicados.
- Proyecto comunitario con muy poca traccion (236 descargas y 1 like en el momento de la ficha): soporte, mantenimiento y verificacion independiente de los resultados son limitados.

## Enlaces

- Modelo: https://huggingface.co/balllvin/flint-heretic-mlx-4bit
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Runtime rec (motor MLX de Recursive): https://github.com/recursive-oss/rec
