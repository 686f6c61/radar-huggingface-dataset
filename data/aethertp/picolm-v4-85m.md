# aethertp/PicoLM-V4-85M

## Resumen
PicoLM-V4-85M es un modelo de lenguaje base de tipo causal, entrenado desde cero por el autor independiente aethertp. Con 84.960.832 parámetros, es la cuarta iteración de la serie PicoLM y está pensado como plataforma de investigación para modelos pequeños, como punto de partida para fine-tuning y para experimentos que requieran ejecución en CPU. No es un modelo instruido: continúa texto y no sigue instrucciones de forma fiable.

La arquitectura es un transformer decoder-only de 20 capas con hidden size 576, atención con 9 cabezas de query y 3 de key/value (GQA), feed-forward SwiGLU de tamaño intermedio 1536, RMSNorm y RoPE con base 10.000. El contexto es de 2048 tokens y el vocabulario BPE de 24.576 tokens, heredado de PicoLM-V3. Los pesos se almacenan en formato Qwen3 de transformers (`Qwen3ForCausalLM`), por lo que cargan con `AutoModelForCausalLM` sin `trust_remote_code`.

El entrenamiento consumió 6.000 millones de tokens en dos etapas sobre texto web inglés, texto sintético tipo libro de texto, matemáticas, Wikipedia y código Python. La relevancia actual del modelo reside en su tamaño reducido (0,3 GB de repo, ejecutable en CPU en fp32) y en la documentación detallada de su esquema de entrenamiento, útil para estudiar dinámicas de modelos por debajo de 100M de parámetros.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (formato Qwen3, `Qwen3ForCausalLM`) |
| Parametros totales | 84.960.832 (embeddings de entrada y salida atados y contados una vez) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card solo documenta uso en fp32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato Qwen3 de transformers) |

Otras especificaciones: 20 capas, hidden size 576, 9 cabezas de query y 3 de key/value con dimensión de cabeza 64, feed-forward SwiGLU con tamaño intermedio 1536, RMSNorm con epsilon 1e-5 más RMSNorm sobre queries y keys, RoPE con base 10.000, vocabulario de 24.576 tokens, inicialización normal con desviación 0.02 y escalado de las proyecciones de salida de atención y down del feed-forward por 1/sqrt(2 × número de capas).

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only clásico con atención de grupo (GQA) y SwiGLU, sin innovaciones de decodificación especulativa ni atención linear. La normalización combina RMSNorm estándar con RMSNorm adicional sobre queries y keys. El tokenizador BPE de 24.576 tokens se hereda de PicoLM-V3 y no se reentrenó; el token 0 es `<|endoftext|>` y separa documentos, el token 2 es `<|im_end|>` (reservado para fine-tunes de chat), el token 3 es `<|pad|>` y el tokenizador no añade token de inicio de texto.

El entrenamiento se dividió en dos etapas. La etapa 1 consumió el 80% de los pasos del optimizador (36.620 pasos, longitud de secuencia 1024) sobre un pool de 6.000.007.358 tokens: FineWeb-Edu deduplicado (45%), DCLM-Baseline (25%), Cosmopedia v2 (15%), Python-Edu (5%), FineMath-3+ (5%) y Wikipedia en inglés de 2023-11-01 (5%). La etapa 2 usó los 9.156 pasos restantes con longitud 2048 y una mezcla con mayor peso de texto filtrado de alta calidad (FineWeb-Edu con score educativo ≥4 al 45%, Cosmopedia v2 al 20%, DCLM-Baseline al 15%, FineMath-4+ al 10%, Python-Edu filtrado al 5% y Wikipedia al 5%), incluyendo el decaimiento de learning rate. Los documentos se tokenizaron por separado, se unieron con `<|endoftext|>` y las ventanas pueden cruzar límites de documento sin enmascaramiento de atención. En la etapa 1 las ventanas de 1024 tokens se cortaron en posiciones aleatorias con muestreo con reemplazo; en la etapa 2 se dividieron en ventanas consecutivas de 2048 visitadas en orden aleatorio con semilla y sin reemplazo. No se documenta RLHF ni DPO; el modelo base no está instruido.

## Capacidades
- Generación de texto causal en inglés: continuación de texto libre, no respuesta a instrucciones.
- Razonamiento básico y matemáticas elementales, derivado de la inclusión de FineMath y Cosmopedia en el corpus.
- Generación de código Python, por el 5% de Python-Edu en ambas etapas de entrenamiento.
- Conocimiento enciclopédico limitado procedente de Wikipedia en inglés.
- No soporta tool calling ni function calling de forma fiable (modelo base no instruido).
- No soporta agentes ni razonamiento multi-paso de forma estructurada.
- Capacidades multilingües: solo inglés.
- No tiene vision, audio ni modo de razonamiento explícito (thinking mode).
- Ejecutable en CPU en fp32, lo que permite experimentación sin GPU.

## Casos de uso
- Investigación sobre modelos pequeños: estudiar curvas de escalado, mezclas de datos y dinámicas de entrenamiento en modelos por debajo de 100M de parámetros, aprovechando la documentación detallada de las dos etapas y los pools de tokens.
- Punto de partida para fine-tuning: usar los pesos base como inicialización para tareas específicas (clasificación, extracción, generación de dominio) con datasets pequeños, dado el bajo coste de ajuste de 85M de parámetros.
- Fine-tuning de instrucciones o chat: el token `<|im_end|>` está reservado para marcar fin de turno, lo que facilita adaptar el modelo base a un asistente conversacional simple.
- Experimentos en CPU y entornos sin GPU: con 0,3 GB de repo y fp32, el modelo se puede cargar y ejecutar en portátiles o servidores sin acelerador, útil para docencia y pruebas de pipelines.
- Generación de texto sintético controlado: continuación de prompts para estudiar repetición, deriva factual y coherencia en generaciones largas con `repetition_penalty`.
- Prototipado de pipelines de transformers: validar integraciones de `AutoModelForCausalLM` y `AutoTokenizer` en versiones 4.57.1 y 5.22.1 sin `trust_remote_code`, como paso previo a modelos mayores.
- Estudio de tokenizadores BPE pequeños: analizar el comportamiento de un vocabulario de 24.576 tokens en tareas de tokenización y cobertura léxica en inglés.

## Benchmarks y rendimiento
La model card menciona una tabla de evaluación con una configuración única de medida, pero los valores numéricos concretos no están incluidos en la información disponible. Se citan de forma cualitativa dos datos: la perplejidad en LAMBADA cambia de 48,4 a 45,2 al anteponer el token BOS, y `eval_results.json` muestra un desplazamiento de +2,9 puntos en `acc_norm` de SciQ. No se han publicado resultados completos de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 0,34 GB solo para pesos (84,96M × 4 bytes), más activaciones y overhead de runtime; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16/bf16: aproximadamente 0,17 GB para pesos, si se convierte manualmente (no se documentan pesos pre-cuantizados).
- GPU recomendadas: innecesarias para inferencia básica; cualquier GPU con al menos 1 GB libre sirve. Para entrenamiento o fine-tuning, una RTX 4090, A100 o H100 acelera los pasos, pero el modelo también entrena en GPU de gama media.
- Cabe en consumer GPU: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo). No se documentan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La model card solo indica ejecución en CPU en fp32 con transformers 4.57.1 y 5.22.1.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| PicoLM-V4-85M | 84.960.832 | 2048 | en | apache-2.0 | Modelo base, 6.000M tokens de entrenamiento, formato Qwen3 |
| PicoLM-V3 | 82,2M | no disponible | en | no disponible | Arquitectura distinta (21 bloques aplicados dos veces, embedding factorizado de rango 128), ~757M tokens |
| PicoLM-V4-85M-Instruct | 84.960.832 | 2048 | en | no disponible | Versión instruida del mismo modelo base |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos pequeños de la misma categoría (por ejemplo, modelos de ~100M parámetros de otras series), por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias
- No está instruido: no sigue instrucciones de forma fiable y no es adecuado para pregunto-respuesta, resumen ni ningún escenario donde importe la exactitud factual.
- Alucinación y deriva factual: en el ejemplo de la model card, el modelo afirma que "la capital de Francia es París, la capital del Reino Unido" y entra en un bucle de repetición sobre Londres.
- Repetición en generaciones largas: se recomienda `repetition_penalty=1.1` o superior; aun así, el modelo se repite.
- Solo inglés: no soporta otros idiomas de forma fiable.
- Contexto limitado a 2048 tokens, con ventanas de entrenamiento que cruzan límites de documento sin enmascaramiento de atención, lo que puede afectar la coherencia en prompts largos.
- Sin token de inicio de texto añadido por el tokenizador: hay que anteponer `tok.bos_token` o confiar en el separador `<|endoftext|>`; ambos modos funcionan pero alteran algunas métricas.
- Licencia apache-2.0: permite uso comercial, pero el propio autor advierte que el modelo no es apto para producción sensible a la precisión factual.
- Tamaño muy reducido: capacidad limitada de conocimiento y razonamiento; no debe usarse como sustituto de modelos mayores en tareas críticas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/aethertp/PicoLM-V4-85M
- Versión instruida: https://huggingface.co/aethertp/PicoLM-V4-85M-Instruct
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
