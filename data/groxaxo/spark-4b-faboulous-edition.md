# groxaxo/Spark-4B-Faboulous-Edition

## Resumen

Spark 4B — Faboulous Edition es un modelo de generación de texto de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) publicado por el usuario groxaxo en Hugging Face. Se trata de un fine-tune completo (pesos fusionados, sin adaptador separado) del modelo XHToken/Spark-X2.6-4B, distribuido con licencia Apache 2.0 y pensado para su uso con la librería Transformers. El repositorio incluye pesos en precisión completa en formato safetensors, tokenizer, plantilla de chat y el código propio del modelo (tag `custom_code`), lo que implica que requiere cargar código remoto para su funcionamiento.

El modelo se presenta como una edición independiente de la familia Spark, orientada a generación de texto y código, con una versión adicional en formato MLX de 8 bits alojada en un repositorio aparte. La model card del autor es deliberadamente narrativa y no aporta datos técnicos verificables: no se documentan la arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset ni los métodos de alineación empleados. El propio autor indica explícitamente que la leyenda incluida es ficción y que no se reclama ninguna mejora de rendimiento.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño (4B), con licencia permisiva y pesos abiertos, lo que lo hace candidato a despliegues en hardware de consumo. Sin embargo, la ausencia total de benchmarks, de documentación de entrenamiento y de información sobre idiomas obliga a tratar cualquier evaluación de capacidades como no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (familia Spark, tag `spark2_5`; se infiere transformer, sin confirmación del autor) |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | No aplica (no se documenta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la model card; existe una versión MLX de 8 bits en repositorio separado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (precisión completa); versión MLX 8-bit en repositorio aparte |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo. El tag `spark2_5` sugiere que pertenece a la familia Spark, y el tag `custom_code` indica que el repositorio incluye implementación propia que debe cargarse con `trust_remote_code=True`. No se especifica si se trata de un transformer denso convencional, de una variante con atención lineal o de una arquitectura híbrida. Tampoco se documenta la dimensión oculta, el número de capas, el número de cabezas de atención ni el vocabulario del tokenizer.

Respecto al entrenamiento, la model card no aporta ningún dato: no se indica el número de tokens utilizados, la composición del corpus, si hubo fases de supervised fine-tuning, RLHF o DPO, ni qué proporción de datos de código se incluyó pese a la etiqueta `code`. El modelo base declarado es XHToken/Spark-X2.6-4B, y esta edición se describe como una fusión completa de pesos modificados, no como un adaptador LoRA o QLoRA. No se documenta ninguna innovación técnica destacable (decodificación especulativa, atención lineal, mezcla de expertos, etc.).

## Capacidades

- Generación de texto conversacional: el repositorio incluye plantilla de chat, por lo que está preparado para diálogo multi-turno con el formato previsto por el autor.
- Generación de código: la etiqueta `code` aparece en los metadatos, aunque no se aportan ejemplos, evaluaciones ni datos de entrenamiento que lo respalden.
- Razonamiento y matemáticas: no documentado; no hay evidencia publicada de capacidades específicas en estas áreas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas aparece vacío en la ficha de Hugging Face.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Compatibilidad MLX: existe una conversión a 8 bits para Apple Silicon en un repositorio independiente.

## Casos de uso

- Prototipado local en estaciones de trabajo con Apple Silicon: la existencia de una versión MLX de 8 bits permite ejecutar el modelo en Macs con memoria unificada suficiente, útil para experimentar con la familia Spark sin depender de GPU dedicada.
- Generación de texto asistida en aplicaciones de escritorio: con 4B de parámetros y licencia Apache 2.0, puede integrarse en herramientas ofimáticas o editores como motor de autocompletado o redacción, siempre que se validen previamente sus salidas.
- Experimentación académica con fine-tunes de la familia Spark: al ser una fusión completa de pesos sobre XHToken/Spark-X2.6-4B, sirve como punto de partida para estudiar el efecto de ediciones de pesos y comparar contra el modelo base.
- Base para fine-tuning posterior: el tamaño contenido y la licencia permisiva facilitan ajustes con LoRA o QLoRA en un único acelerador, por ejemplo para dominios verticales con datos propios.
- Evaluación comparativa de modelos pequeños: útil en pipelines internos de evaluación que necesiten un modelo de 4B adicional con licencia Apache para contrastar comportamiento frente a otras alternativas del mismo rango.
- Generación de código en entornos controlados: la etiqueta `code` sugiere uso como asistente de programación, pero cualquier salida debe revisarse y probarse antes de integrarse, tal como advierte el propio autor en la model card.
- Despliegue en entornos con requisitos de licencia laxa: al ser Apache 2.0, puede incorporarse en productos comerciales sin las restricciones de licencias copyleft o de uso condicionado, sujeto a las obligaciones de atribución habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente en la model card que no se reclama ninguna mejora de rendimiento respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 10-12 GB de VRAM para contextos moderados.
- Cuantización a 8 bits: alrededor de 4,1 GB de pesos; cabe en GPUs de 8 GB con margen ajustado.
- Cuantización a 4 bits (si se genera con herramientas externas, no publicada por el autor): en torno a 2,1-2,5 GB de pesos, viable en GPUs de consumo de 6-8 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegues de producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 sin problemas; RTX 4070 Ti / 4080 (12-16 GB) para FP16 con contextos cortos o 8 bits.
- GPU de consumo: sí, cabe en RTX 3060 12 GB en 8 bits y en RTX 4060 Ti 16 GB en FP16 con contexto limitado; en GPUs de 8 GB solo con cuantización a 4 bits generada externamente.
- Apple Silicon: la versión MLX 8-bit permite ejecución en Macs con memoria unificada de 16 GB o superior.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requisito por el tag `custom_code`), MLX para Apple Silicon. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que el repositorio incluye código propio, la integración con estos motores requeriría portar la implementación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark 4B — Faboulous Edition | 4,11 B | No disponible | Apache 2.0 | Hugging Face (Transformers + MLX 8-bit) | Fine-tune de XHToken/Spark-X2.6-4B; sin benchmarks publicados |
| XHToken/Spark-X2.6-4B (modelo base) | ~4 B (según denominación) | No disponible | No disponible en esta ficha | Hugging Face | Modelo de origen del fine-tune; referencia directa para comparar el efecto de la edición |
| Qwen2.5-3B / 7B | 3,09 B / 7,62 B | 32.768 tokens (versión estándar) | Apache 2.0 (mayoría de variantes) | Hugging Face, vLLM, llama.cpp, Ollama | Familia ampliamente documentada con benchmarks publicados; alternativa de referencia en el rango 3-7B |
| Llama 3.2 3B | 3,21 B | 131.072 tokens | Llama 3.2 Community License | Hugging Face, ecosistema amplio | Licencia no Apache; requiere aceptar términos; benchmarks publicados |

La comparación con Qwen2.5 y Llama 3.2 se ofrece como referencia de categoría (modelos densos de 3-4B con licencia abierta), no como equivalencia de rendimiento: para Spark 4B — Faboulous Edition no existen datos que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación publicada, ni por el autor ni en la información disponible.
- Documentación de entrenamiento inexistente: se desconoce el corpus, el número de tokens, los métodos de alineación y la composición de datos, lo que impide evaluar sesgos y cobertura lingüística.
- Idiomas no declarados: el campo de idiomas está vacío en la ficha de Hugging Face; no puede asumirse un soporte multilingüe fiable.
- Riesgo de alucinación: no cuantificado; como en cualquier modelo de 4B sin evaluación publicada, debe asumirse un riesgo alto y validar las salidas, especialmente en código y datos factuales.
- Requiere `trust_remote_code=True`: el repositorio incluye código propio (`custom_code`), lo que implica ejecutar código del autor; conviene auditar los archivos antes de cargarlos en producción.
- Compatibilidad limitada con motores de inferencia estándar: al no documentarse soporte para vLLM, llama.cpp, Ollama o TGI, el despliegue queda inicialmente ligado a Transformers o MLX.
- Model card no técnica: la documentación es narrativa y el propio autor aclara que la leyenda es ficción y que no se reclama mejora de rendimiento; no debe interpretarse como evidencia de capacidades.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de copyright y licencia, y el autor indica que la licencia original del modelo base acompaña a esta release; conviene revisar las obligaciones de atribución de la cadena de modelos derivados.
- Contexto desconocido: al no publicarse la longitud de contexto, no deben asumirse ventanas largas en aplicaciones de documentación o conversaciones extensas.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/groxaxo/Spark-4B-Faboulous-Edition
- Versión MLX 8-bit: https://huggingface.co/groxaxo/Spark-4B-Faboulous-Edition-MLX-8bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
