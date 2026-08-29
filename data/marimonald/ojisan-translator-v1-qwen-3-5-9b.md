# Marimonald/Ojisan-translator-v1-Qwen-3.5-9B

## Resumen

Ojisan-translator-v1-Qwen-3.5-9B es un modelo de lenguaje especializado en la transformación de estilo del japonés hacia el denominado "ojisan-koubun" (おじさん構文), un registro conversacional estereotipado asociado a hombres de mediana edad, caracterizado por el uso excesivo de emojis, expresiones coloquiales, anécdotas personales no solicitadas y un tono afectuoso o, en ocasiones, ligeramente incómodo. El modelo ha sido desarrollado por el usuario Marimonald mediante fine-tuning del modelo base unsloth/Qwen3.5-9B, que a su vez deriva de la familia Qwen3.5 de Alibaba Cloud.

El entrenamiento combina dos fases: Supervised Fine-Tuning (SFT) con 750 ejemplos curados y Kahneman-Tversky Optimization (KTO) con 850 pares de preferencia, incluyendo 100 ejemplos negativos para corregir fallos comunes como responder directamente a la pregunta del usuario o romper los tokens de emoji. El modelo está pensado para aplicaciones de generación de texto humorístico, roleplay y personalización de asistentes conversacionales en japonés. Con 8.95 mil millones de parámetros, se distribuye bajo licencia Apache 2.0 y solo soporta el idioma japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-9B, sin más detalle disponible) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se especifica en la documentación del modelo) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors, sin versiones GGUF u otras) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-9B, una versión optimizada del modelo Qwen3.5-9B de Alibaba Cloud. No se proporcionan detalles arquitectónicos específicos del base (número de capas, heads, etc.) en la documentación del autor, pero se trata de un transformer decoder-only estándar para generación de texto. El fine-tuning se realizó en dos etapas:

- **SFT**: 3 épocas, learning rate 2e-4, batch efectivo de 8, con loss masking aplicado únicamente a las respuestas del asistente para evitar que el modelo aprenda el formato de los prompts del sistema y del usuario.
- **KTO**: 1 época, learning rate 5e-6, beta 0.05, sobre 850 pares de preferencia. Se incluyeron 100 ejemplos negativos para penalizar comportamientos no deseados como responder directamente a la pregunta del usuario, repetir emojis en bucle o mantener un registro formal estándar.

El corpus de entrenamiento es público: Marimonald/ojisan-translation-corpus-ja. No se menciona el uso de RLHF ni otras técnicas de alineación adicionales.

## Capacidades

- Transformación de estilo de japonés estándar, formal o casual a "ojisan-koubun" (estilo de tío japonés).
- Control del registro y la longitud del output mediante instrucciones en el system prompt (por ejemplo, "estándar", "largo con muchas anécdotas personales", "con connotaciones sexuales implícitas").
- Generación de texto en japonés con emojis, katakana, partículas finales características y estructuras coloquiales.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multimodal.
- El modelo es monolingüe (japonés) y no se ha entrenado para otras tareas distintas a la transformación de estilo.

## Casos de uso

- **Generación de contenido humorístico para redes sociales**: el modelo puede convertir mensajes cotidianos en publicaciones o respuestas con el estilo "ojisan-koubun", ideal para cuentas de parodia o memes en plataformas como X (Twitter) o LINE.
- **Creación de personajes para roleplay**: en juegos de rol por texto o chatbots de entretenimiento, el modelo permite dotar a un personaje de una personalidad de "tío japonés" de forma consistente, manteniendo el tono y las muletillas.
- **Asistentes conversacionales con personalidad**: integrado en un chatbot, puede responder con un registro específico y reconocible, útil para aplicaciones de entretenimiento o marketing dirigido a un público japonés.
- **Traducción de estilo en mensajería**: convierte mensajes formales o neutros en un tono más cercano y humorístico, por ejemplo para adaptar comunicaciones internas de empresa a un ambiente distendido (siempre que el contexto lo permita).
- **Generación de guiones para vídeos o podcasts**: el modelo puede producir diálogos o monólogos con el estilo característico, ahorrando tiempo a creadores de contenido que necesitan material en ese registro.
- **Dataset de aumentación para otros modelos**: el modelo puede usarse para generar ejemplos sintéticos de "ojisan-koubun" y ampliar corpus de entrenamiento para otros sistemas de estilo conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de evaluación objetivas (como MMLU, HumanEval o métricas de calidad de traducción) ni comparaciones con otros modelos de transformación de estilo.

## Requisitos de hardware

- **VRAM estimada**: con 8,95 B parámetros en FP16, se necesitan aproximadamente 18 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits (si se generara) bajaría a unos 9-10 GB, y con 4 bits a unos 5-6 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- **GPU recomendadas**: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) pueden ejecutar el modelo en FP16 sin problemas. GPUs con 16 GB (como RTX 4080 o A10G) podrían funcionar con cuantización o con técnicas de offloading.
- **Compatibilidad con GPUs de consumo**: sí, es posible ejecutarlo en una RTX 3090 o 4090 con FP16, o en GPUs de 12-16 GB usando cuantización (por ejemplo, mediante bitsandbytes o GPTQ, aunque no se distribuyen oficialmente).
- **Opciones de despliegue**: el modelo se puede cargar con Transformers (PyTorch) tal como se muestra en el quick start. También es compatible con vLLM, llama.cpp (si se convierte a GGUF) y Ollama (si se crea un Modelfile), aunque no hay versiones precompiladas.
- **Latencia y throughput**: no se proporcionan datos. En una RTX 4090, un modelo de 9B en FP16 suele generar entre 20 y 40 tokens por segundo, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la tarea de transformación de estilo "ojisan-koubun". Como referencia, se puede comparar con el modelo base Qwen3.5-9B, que no está especializado en este estilo y produciría respuestas en japonés estándar. Tampoco se conocen otros fine-tunings públicos para este registro específico. La siguiente tabla compara el modelo con su base y con una alternativa genérica de tamaño similar:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Ojisan-translator-v1-Qwen-3.5-9B | 8,95 B | No disponible | Transformación de estilo japonés a ojisan-koubun | Apache 2.0 |
| Qwen3.5-9B (base) | 9 B | No disponible | Modelo general multilingüe | Apache 2.0 |
| Llama 3.1 8B | 8 B | 128 K | Modelo general multilingüe | Llama 3.1 Community License |

La comparación es orientativa; no hay datos de rendimiento para la tarea específica.

## Limitaciones y advertencias

- **Monolingüe**: el modelo solo funciona con japonés; cualquier entrada en otro idioma producirá resultados incoherentes o en japonés.
- **Riesgo de contenido inapropiado**: el estilo "ojisan-koubun" puede incluir connotaciones sexuales o comentarios que rozan el acoso (como se observa en el ejemplo 2 de la model card). El modelo puede generar texto ofensivo o sexista si se le pide explícitamente, por lo que no es adecuado para entornos no moderados.
- **Alucinaciones**: al ser un fine-tuning sobre un modelo base, puede inventar anécdotas personales o datos falsos cuando se le pide "contar historias propias".
- **Calidad de la transformación**: el modelo está entrenado con un corpus limitado (750 ejemplos SFT + 850 pares KTO), por lo que puede fallar en registros muy formales o en contextos técnicos.
- **Sin garantías de producción**: no se han publicado evaluaciones de robustez ni pruebas de estrés. El autor no ofrece soporte ni mantenimiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías. Es responsabilidad del usuario revisar el contenido generado para cumplir con normativas locales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Marimonald/Ojisan-translator-v1-Qwen-3.5-9B)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Marimonald/ojisan-translation-corpus-ja)
- [Modelo base unsloth/Qwen3.5-9B](https://huggingface.co/unsloth/Qwen3.5-9B) (enlace inferido; no verificado en la búsqueda)
- [Página de Qwen3.5-9B en Hugging Face](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Repositorio oficial de Qwen en GitHub](https://github.com/QwenLM/Qwen)
