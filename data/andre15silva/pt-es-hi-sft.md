# andre15silva/pt-es-hi-sft

## Resumen

`pt-es-hi-sft` es un modelo de lenguaje de tipo GPT decoder-only, de 138 millones de parámetros (172 millones incluyendo embeddings), desarrollado por André Silva como proyecto educativo e investigador. Está entrenado desde cero para portugués, español e hindi, y ajustado mediante fine-tuning con instrucciones (SFT) sobre un checkpoint pre-entrenado. El modelo se publica bajo licencia Apache-2.0 y su arquitectura incluye qk-norm y embeddings posicionales aprendidas, lo que lo hace incompatible con las clases estándar de `transformers`.

El objetivo del proyecto es demostrar el ciclo completo de entrenamiento de un LLM multilingüe de pequeño tamaño, documentando con transparencia las limitaciones que aparecen en modelos de esta escala. El autor detalla en la model card tanto los datos de entrenamiento como los resultados de evaluación, incluyendo fallos concretos como la incapacidad de responder correctamente a preguntas factuales básicas o el comportamiento degradado del modelo en hindi. Es relevante ahora porque ofrece una referencia honesta y reproducible para quienes quieran entender los límites de los modelos pequeños en entornos multilingües, así como el efecto del fine-tuning con instrucciones sobre un checkpoint pre-entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT decoder-only con qk-norm y embeddings posicionales aprendidas |
| Parámetros totales | 172.379.904 (según safetensors); 138M declarados por el autor (205M incluyendo embeddings) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Portugués, español, hindi |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (no compatible con `transformers` estándar; requiere código del repositorio de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 11 capas, 16 cabezas de atención y dimensión de embedding 1024, con una longitud de contexto fija de 1.024 tokens. La arquitectura incluye qk-norm (normalización de las claves y consultas en la atención) y embeddings posicionales aprendidas, una combinación que no coincide con ninguna clase de Hugging Face, por lo que no puede cargarse con `AutoModel.from_pretrained`. Las embeddings de entrada y la capa de salida están atadas (tied embeddings), lo que reduce el número de parámetros entrenables.

El fine-tuning se realizó sobre un checkpoint pre-entrenado con 2,2e18 FLOPs en el mismo corpus de portugués, español e hindi, con un vocabulario BPE de 32.000 tokens entrenado sobre el mismo corpus. Los datos de SFT incluyen 158.834 conversaciones (90,9 millones de tokens) procedentes de varias fuentes: `aya_hi` (33,3%), `EuroBlocks-SFT-2512` en español (19,6%) y portugués (15,5%), `smoltalk2PT` en cuatro configuraciones (29,4%) e `indic-instruct-data-v0.1` en hindi (2,0%). El entrenamiento se ejecutó durante 2 épocas (19.854 pasos) con batch de 16, learning rate de 5e-5 a 5e-6, warmup de 397 pasos y precisión bf16, en una única A100-40GB durante 3 horas y 24 minutos. La pérdida final en validación fue de 1,606 (perplejidad 4,98), calculada solo sobre los tokens de respuesta del asistente.

## Capacidades

- Generación de texto en portugués, español y hindi, con formato conversacional mediante el chat template del tokenizador.
- Instrucciones básicas: responde a preguntas simples y mantiene conversaciones de una o dos turnos.
- Formato de salida en Markdown en algunos casos, aunque con errores frecuentes.
- Capacidades multilingües limitadas: el rendimiento es claramente mejor en portugués, moderado en español y débil en hindi.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No dispone de modo de pensamiento, visión ni audio.
- No es un modelo de propósito general: su comportamiento se limita a respuestas conversacionales básicas.

## Casos de uso

- **Investigación educativa sobre fine-tuning**: permite estudiar el efecto del SFT sobre un checkpoint pre-entrenado pequeño, incluyendo fenómenos como la pérdida de conocimiento factual o la fluidez de las alucinaciones.
- **Prototipado de asistentes conversacionales en portugués**: el modelo puede gestionar diálogos cortos en portugués europeo o brasileño, siendo útil para pruebas de concepto de chatbots en esa lengua.
- **Evaluación de técnicas de prompting**: al ser un modelo pequeño y de comportamiento predecible, sirve como banco de pruebas para comparar plantillas de chat, estrategias de decodificación o métodos de evaluación automática.
- **Demostración de límites de modelos pequeños**: para formaciones o talleres sobre LLMs, es un ejemplo práctico de qué se puede esperar de un modelo de 138M frente a modelos de mayor escala.
- **Pruebas de pipelines de entrenamiento**: el código del repositorio asociado permite reproducir el ciclo completo de pre-entrenamiento y fine-tuning, útil para validar infraestructuras de entrenamiento.
- **Generación de texto simple en español**: para tareas de completado de texto básico en español, aunque con rendimiento inferior a modelos de propósito general de tamaño similar.

## Benchmarks y rendimiento

La model card incluye una evaluación del modelo frente al checkpoint base, con 500 muestras por tarea en modo zero-shot. Se comparan dos modos: el formato de chat y el formato de texto plano (raw).

| Benchmark | Métrica | Base·raw | SFT·raw | Base·chat | SFT·chat |
|---|---|---|---|---|---|
| PT-Culture | token_f1 | 0.177 | 0.169 | 0.193 | **0.292** |
| ChatRAG-Hi | token_f1 | 0.285 | 0.304 | 0.262 | 0.233 |
| CALAME-PT | accuracy | 0.408 | **0.422** | — | — |
| Portugal Basic QA (n=50) | accuracy | 0.560 | 0.520 | 0.480 | 0.420 |
| Belebele-es | acc | 0.260 | 0.222 | 0.240 | 0.230 |
| COPA-es | acc | 0.556 | 0.526 | 0.526 | 0.522 |
| OpenBookQA-es | acc | 0.200 | 0.190 | 0.182 | 0.172 |
| XStoryCloze-es | acc | 0.532 | 0.516 | 0.514 | 0.514 |

El autor advierte que los resultados en tareas de opción múltiple son planos por diseño, ya que se puntúan ordenando continuaciones fijas por log-probabilidad, y que el SFT enseña formato y parada, no conocimiento. El único ganancia clara es en PT-Culture (+51% sobre el base en modo chat), mientras que en ChatRAG-Hi el SFT empeora ligeramente. El benchmark EsCoLA se excluyó por resultados degenerados, y el benchmark de seguimiento de instrucciones ALBA no se evaluó por falta de clave de API del juez.

## Requisitos de hardware

- **Inferencia**: con 172 millones de parámetros, el modelo puede ejecutarse en CPU con unos 700 MB de RAM, o en GPU con menos de 1 GB de VRAM. Cualquier GPU de consumo moderna (GTX 1060 en adelante) es suficiente.
- **Entrenamiento**: el autor usó una A100-40GB durante 3 horas y 24 minutos, pero el entrenamiento de un modelo de este tamaño es factible en GPUs de 16-24 GB (RTX 4090, A5000) con bf16.
- **Despliegue**: no es compatible con `transformers` estándar, por lo que las opciones habituales (vLLM, TGI) no funcionan sin adaptación. Se puede cargar con el código del repositorio de entrenamiento y servir con cualquier framework que soporte generación manual (por ejemplo, una API propia con FastAPI).
- **Latencia**: no hay datos de throughput publicados, pero por el tamaño del modelo, la generación es rápida incluso en CPU (decenas de tokens por segundo).

## Comparativa con modelos similares

No se han publicado resultados de benchmarks en la información disponible que permitan comparar directamente con otros modelos de tamaño similar. El autor no ofrece comparativas externas en la model card. No se puede confirmar una comparación fiable con alternativas como GPT-2 (124M) o modelos pequeños de la familia SmolLM, ya que no hay datos de rendimiento de esos modelos en las mismas tareas.

## Limitaciones y advertencias

- **Comportamiento de asistente limitado**: el modelo responde con formato conversacional, pero no con conocimiento factual. Por ejemplo, responde correctamente a «¿Cuál es la capital de Francia?» pero falla en «¿Cuál es la capital de Portugal?» (responde «Porto de Ave»).
- **Alucinaciones fluyentes**: el fine-tuning hace que las respuestas incorrectas lleguen con la misma seguridad y formato que las correctas, lo que dificulta detectar errores.
- **Hindi débil**: el rendimiento en hindi es notablemente inferior al de portugués y español.
- **Contexto limitado**: la ventana de 1.024 tokens es un tope duro; el 48,7% de las conversaciones del dataset de SFT se descartaron por superar ese límite.
- **Incompatibilidad con `transformers`**: no puede cargarse con `AutoModel.from_pretrained`; se requiere el código del repositorio de entrenamiento.
- **Formato de chat obligatorio**: si se usa texto plano, el modelo degrada y filtra tokens de formato (`<|eot_id|>`, `<|start_header_id|>`).
- **Sin evaluaciones de seguimiento de instrucciones**: el benchmark ALBA, el más relevante para un modelo SFT, no se evaluó.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el modelo es de calidad limitada para producción real y no se recomienda para tareas críticas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/andre15silva/pt-es-hi-sft)
- [Dataset de pre-entrenamiento](https://huggingface.co/datasets/andre15silva/pretrain-pt-es-hi)
- [Tokenizer del modelo](https://huggingface.co/andre15silva/pt-es-hi-tokenizer)
- [Repositorio de entrenamiento](https://github.com/frankreyesgarcia/LLM-Assignment)
- [Perfil de GitHub del autor](https://github.com/andre15silva)
