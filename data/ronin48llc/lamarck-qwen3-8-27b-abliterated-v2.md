# Ronin48LLC/Lamarck-Qwen3.8-27B-abliterated-v2

## Resumen

Lamarck-Qwen3.8-27B-abliterated-v2 es un adaptador LoRA de investigación publicado por Ronin48LLC sobre el modelo base huihui-ai/Huihui-Qwen3.8-27B-abliterated, una variante del Qwen3.8-27B a la que se le han ablacionado las direcciones de rechazo. El adaptador se ha producido mediante continued pretraining con QLoRA (base cuantizada en 4-bit NF4, cómputo en bf16) y no modifica los pesos del modelo base: se carga de forma superpuesta mediante PEFT.

La versión v2 duplica el rango del adaptador original (r=32 frente a r=16) y añade parada temprana guiada por validación con selección del mejor checkpoint (paso 1000, eval loss 1.5875). Según las métricas del autor, iguala el ajuste in-distribution de una ejecución fija de 3000 pasos pero mejora todas las medidas de generalización out-of-distribution y el control de matemáticas con un tercio de los pasos de entrenamiento. El adaptador contiene aproximadamente 233 millones de parámetros entrenables, ocupa 1,4 GB en el repositorio y está pensado exclusivamente para cargarse sobre el base abliterated indicado.

Es relevante ahora porque documenta de forma explícita el efecto del sobreajuste en adaptadores LoRA de continued pretraining y porque su dominio de especialización declarado son benchmarks de seguridad y ciberseguridad, un nicho poco cubierto por adaptadores públicos. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, y el autor lo describe como una medición de investigación, no como una reivindicación de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5/Qwen3.8 (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 233.455.616 parámetros entrenables en el adaptador (dato real de safetensors); los pesos del base no se incluyen en el repo |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del base huihui-ai/Huihui-Qwen3.8-27B-abliterated, no especificada en la información) |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4 con cómputo bf16; el repo incluye safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |
| Rango LoRA / alpha | r=32, alpha=64 |
| Modelo base requerido | huihui-ai/Huihui-Qwen3.8-27B-abliterated (no cargar sobre Qwen/Qwen3.8-27B) |
| Metodo de entrenamiento | QLoRA, continued pretraining |
| Checkpoint liberado | paso 1000, eval loss 1.5875 |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`), en su variante de 27B abliterated de huihui-ai, y se entrena mediante QLoRA con la base congelada en 4-bit NF4 y cómputo en bf16. La configuración LoRA usa rango 32 y alpha 64, lo que duplica el rango del adaptador v1 (r=16) del mismo autor, que sigue disponible sin cambios. El adaptador no altera los pesos del base; se superpone en tiempo de carga con PEFT.

El entrenamiento incorpora parada temprana guiada por validación y selección del mejor checkpoint. La ejecución liberada corresponde al paso 1000, elegido por su eval loss de 1.5875. El autor compara cuatro configuraciones bajo un arnés idéntico (base 4-bit NF4, una sola GPU L40S): base sin editar, adaptador r=16 original, ejecución fija de 3000 pasos con r=32 y este adaptador r=32 con validación. La conclusión declarada es que la ejecución de 3000 pasos muestra la firma clásica de sobreajuste: mejora marginal del ajuste in-distribution con degradación de la generalización, mientras que v2 conserva el ajuste in-distribution con un tercio de los pasos. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto condicionada al modelo base Qwen3.8-27B abliterated; el adaptador no añade modalidades nuevas.
- Especialización declarada en dominio de seguridad y ciberseguridad, medida mediante perplejidad en conjuntos held-out y OOD (CyberMetric, MMLU-security, SecQA-v2).
- Razonamiento matemático preservado: el control de matemáticas (math-control perplexity) es la mejor de las cuatro configuraciones comparadas (6,26).
- Capacidad de respuesta a preguntas de opción múltiple en seguridad: precisión de 0,815 en MMLU-security y 0,99 en SecQA-v2.
- Herencia de las capacidades del base (incluida la abliteración de direcciones de rechazo), sin que la información disponible detalle tool calling, function calling, agentes, multilingüismo ni modos de razonamiento extendido.
- No se documentan capacidades de visión ni audio en la información proporcionada.

## Casos de uso

- Investigación sobre sobreajuste en adaptadores LoRA: el par v1/v2 y la comparación con la ejecución fija de 3000 pasos permiten estudiar empíricamente cómo el número de pasos afecta a la generalización OOD manteniendo el ajuste in-distribution, usando perplejidad como medida sensible frente a la precisión de opción múltiple, que está en techo.
- Evaluación de seguridad y ciberseguridad en modelos abliterated: el adaptador está medido sobre CyberMetric, MMLU-security y SecQA-v2, por lo que sirve como punto de partida para construir arneses de evaluación de conocimiento técnico en seguridad sobre un base sin rechazos.
- Estudio de herencia de rasgos adquiridos en fine-tuning: la metáfora lamarckiana del autor se traduce en un caso práctico de adaptadores pequeños (1,4 GB) que modifican el comportamiento de un base de 27B sin tocar sus pesos, útil para docencia y divulgación técnica.
- Despliegue con requisitos de almacenamiento mínimos: al ser un adaptador PEFT de 233M de parámetros, permite distribuir una variante especializada del base sin replicar los pesos completos, integrándose en pipelines existentes de transformers + PEFT.
- Experimentos de cuantización y despliegue: la presencia de safetensors y GGUF en el repo permite comparar el comportamiento del mismo adaptador en 4-bit NF4 y en formatos GGUF sobre el mismo base.
- Control de regresión en matemáticas: el uso de math-control perplexity como salvaguarda permite monitorizar que el continued pretraining en seguridad no degrade el razonamiento matemático del base, un patrón reutilizable en cualquier proyecto de especialización por dominio.

## Benchmarks y rendimiento

Datos publicados por el autor bajo un arnés idéntico (base 4-bit NF4, una GPU L40S). Perplejidad: menor es mejor.

| Metrica | Base | r=16 (v1) | r=32 (3000 pasos) | v2 (este adaptador) |
|---|---:|---:|---:|---:|
| Perplejidad held-out seguridad | 6,13 | 5,77 | 4,77 | 4,88 |
| Perplejidad OOD CyberMetric | 22,25 | 17,73 | 18,70 | 17,76 |
| Perplejidad OOD MMLU-security | 8,58 | 7,91 | 7,85 | 7,75 |
| Perplejidad OOD SecQA-v2 | 4,91 | 4,45 | 4,37 | 4,19 |
| Perplejidad OOD math-control | 6,31 | 6,57 | 6,35 | 6,26 |
| Precisión MMLU-security | 0,820 | 0,815 | 0,820 | 0,815 |
| Precisión SecQA-v2 | 0,98 | 0,99 | 0,98 | 0,99 |
| Precisión GSM8K | 0,907 | 0,940 | 0,927 | no completado |

La generación de GSM8K para v2 no terminó por el límite de tiempo del arnés en esta comprobación secundaria; el autor señala que la perplejidad math-control ya indica que es la configuración que menos olvida. La precisión de opción múltiple está en techo (aproximadamente 0,82 y 0,98) y no separa los adaptadores; la perplejidad es la medida sensible. El autor califica estos resultados como mediciones de investigación, no como una reivindicación de capacidades.

## Requisitos de hardware

- VRAM para inferencia: depende del base. El adaptador en sí ocupa 1,4 GB en disco y 233M de parámetros; el base de 27B debe cargarse completo (o cuantizado) además del adaptador.
- GPU recomendadas: el autor entrenó y evaluó en una sola NVIDIA L40S (48 GB) con base en 4-bit NF4. Para el base en bf16 se requiere hardware de clase A100/H100 de 80 GB o equivalente; con cuantización 4-bit el base de 27B cabe en GPUs de 24 GB con holgura limitada.
- GPU de consumo: con cuantización de 4 bits el base de 27B puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), asumiendo margen para el adaptador y el contexto; no hay cifras de latencia ni throughput publicadas.
- Opciones de despliegue: transformers (versión reciente, el base es `Qwen3_5ForConditionalGeneration`) + PEFT para el adaptador; el repo incluye GGUF, lo que abre la puerta a llama.cpp y Ollama, aunque la información no detalla la conversión ni el soporte del adaptador en esos runtimes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lamarck-Qwen3.8-27B-abliterated-v2 | 233M en adaptador LoRA r=32 sobre base 27B | no disponible | Perplejidad OOD 17,76 (CyberMetric), 7,75 (MMLU-security), 4,19 (SecQA-v2) | no disponible | Hugging Face, 0 descargas, 0 likes |
| Lamarck-Qwen3.8-27B-abliterated (v1) | Adaptador LoRA r=16 sobre el mismo base | no disponible | Perplejidad OOD 17,73 (CyberMetric), 7,91 (MMLU-security), 4,45 (SecQA-v2); GSM8K 0,940 | no disponible | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (base) | 27B | no disponible | Perplejidad OOD 22,25 (CyberMetric), 8,58 (MMLU-security), 4,91 (SecQA-v2); GSM8K 0,907 | no disponible | Hugging Face |
| Ejecución r=32 fija 3000 pasos (no liberada como modelo independiente) | Adaptador LoRA r=32 sobre el mismo base | no disponible | Perplejidad OOD 18,70 (CyberMetric), 7,85 (MMLU-security), 4,37 (SecQA-v2) | no disponible | no disponible |

Las alternativas de la misma categoría (adaptadores de continued pretraining sobre Qwen3.8-27B abliterated) no están documentadas en la información proporcionada; la comparativa se limita a las cuatro configuraciones medidas por el autor bajo el mismo arnés.

## Limitaciones y advertencias

- Adaptador de investigación: el propio autor declara que es un adaptador de investigación, sin garantía de idoneidad para ningún propósito concreto, y recomienda verificar las salidas.
- Especificidad del base: debe cargarse sobre huihui-ai/Huihui-Qwen3.8-27B-abliterated, no sobre Qwen/Qwen3.8-27B; cargarlo sobre el base prístino produce resultados no válidos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; el modelo base y el adaptador no declaran licencia en la información proporcionada.
- Idiomas no disponibles: no se documenta el soporte multilingüe del adaptador ni del base.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación; al tratarse de un base abliterated, las salvaguardas de rechazo están atenuadas, lo que incrementa el riesgo de generar contenido dañino o no verificado en producción.
- Contexto: la longitud de contexto no se especifica en la información; debe consultarse en la model card del base.
- Benchmarks parciales: la generación de GSM8K para v2 no se completó por límite de tiempo, y la precisión de opción múltiple está en techo, por lo que no discrimina entre adaptadores.
- Madurez: cero descargas y cero likes en el momento de la ficha, creado y actualizado el 21 de noviembre de 2026; sin validación independiente por parte de terceros.
- Requiere una versión reciente de transformers compatible con `Qwen3_5ForConditionalGeneration`.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Ronin48LLC/Lamarck-Qwen3.8-27B-abliterated-v2
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Adaptador v1 (r=16): https://huggingface.co/Ronin48LLC/Lamarck-Qwen3.8-27B-abliterated
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
