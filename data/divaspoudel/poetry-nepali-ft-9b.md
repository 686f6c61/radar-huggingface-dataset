# divaspoudel/poetry-nepali-ft-9b

## Resumen

`divaspoudel/poetry-nepali-ft-9b` es un ajuste fino (fine-tune) mediante LoRA sobre el modelo base `unsloth/gemma-2-9b-it`, especializado en la generación de poesía nepalí clásica con métrica estricta (chanda). El autor, divaspoudel, ha entrenado el modelo con 11.567 padas (versos) de oro que cumplen los requisitos métricos verificados por la herramienta `chanda`, incluyendo la posición correcta de las cesuras (yati). Está orientado a tareas de generación de texto y conversación, con un enfoque exclusivo en la poesía nepalí tradicional.

El modelo conserva la arquitectura transformer decoder-only de Gemma-2-9B, con aproximadamente 9.240 millones de parámetros. Su relevancia radica en que aborda un dominio muy específico y técnicamente exigente: la métrica poética sánscrita aplicada al nepalí, donde la validez de cada verso depende de patrones silábicos y pausas estrictas. Esto lo convierte en una herramienta útil para poetas, investigadores literarios y desarrolladores de aplicaciones de escritura creativa en nepalí.

El repositorio incluye los pesos en formato safetensors y una nota sobre el uso de un decodificador restringido (`DraftAnchorRealizer`) para garantizar que la salida cumpla la métrica solicitada. No se especifican detalles sobre licencia ni idiomas soportados más allá de la especialización en nepalí.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune LoRA sobre Gemma-2-9B-it) |
| Parametros totales | 9.241.705.984 (9,24B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | nepalí (especialización principal; el modelo base soporta múltiples idiomas, pero no se documenta en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre `unsloth/gemma-2-9b-it`, una versión optimizada del modelo Gemma-2-9B de Google. La arquitectura subyacente es un transformer decoder-only con atención causal y aproximadamente 9.240 millones de parámetros. El fine-tune se realizó con un conjunto de datos de 11.567 padas (versos) de poesía nepalí considerados "oro" porque cada línea fue validada por la herramienta `chanda` como perteneciente al metro solicitado y cumpliendo la yati (límite de palabra en cada cesura, contado de forma consistente con el sistema chanda).

El entrenamiento cubre 12 metros clásicos: शार्दूलविक्रीडित, मन्दाक्रान्ता, अनुष्टुभ्, वसन्ततिलका, शिखरिणी, भुजङ्गप्रयात, तोटक, उपजाति (इन्द्रवज्रा/उपेन्द्रवज्रा), पञ्चचामर, स्रग्विणी, मालिनी y स्रग्धरा. No se mencionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La innovación técnica principal es el acoplamiento con el decodificador restringido `DraftAnchorRealizer`, que filtra las salidas para garantizar la validez métrica en producción.

## Capacidades

- Generación de poesía nepalí en 12 metros clásicos, con control sobre la métrica (chanda) y la posición de las cesuras (yati).
- Generación de texto conversacional en nepalí, heredada del modelo base Gemma-2-9B-it, aunque el fine-tune está orientado a poesía.
- Soporte de instrucciones (instruction fine-tune) para pedir versos en un metro específico mediante lenguaje natural.
- Integración con un decodificador externo (`DraftAnchorRealizer`) que valida y corrige la salida para cumplir la métrica solicitada.
- Capacidad multilingüe limitada: el modelo base soporta varios idiomas, pero el fine-tune se centra en nepalí y puede degradar el rendimiento en otros idiomas.
- No se documenta soporte para tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Creación literaria en nepalí: un poeta puede pedir al modelo un verso en metro शार्दूलविक्रीडित y obtener una propuesta métricamente válida, que luego puede editar. El decodificador restringido garantiza que el resultado cumpla las reglas de chanda.
- Educación sobre métrica nepalí: estudiantes de literatura pueden usar el modelo para generar ejemplos de cada metro y estudiar la estructura silábica y las cesuras. Es útil como herramienta didáctica en cursos de poesía clásica.
- Asistente de escritura en publicaciones literarias: revistas o editoriales que publican poesía nepalí tradicional pueden integrar el modelo en un flujo de generación de borradores, reduciendo el tiempo de composición.
- Análisis y verificación métrica: aunque el modelo genera texto, el proyecto `chanda` asociado permite validar si un verso cumple un metro. El modelo puede usarse para proponer variantes y luego verificarlas automáticamente.
- Aplicaciones de conversación en nepalí con estilo poético: chatbots o asistentes que respondan con versos en metros clásicos, por ejemplo para celebraciones, felicitaciones o contenido cultural.
- Investigación en procesamiento de lenguaje natural para lenguas de la familia indoaria: el modelo sirve como punto de partida para estudiar la generación con restricciones métricas y la adaptación de modelos multilingües a dominios poéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 9,24B parámetros en precisión FP16, se requieren aproximadamente 18 GB de VRAM. Con cuantización a 8 bits (~9 GB) o 4 bits (~5 GB) podría ejecutarse en GPUs de consumo, pero no se ofrecen pesos cuantizados en el repositorio.
- GPUs recomendadas: para FP16, una NVIDIA A100 (40 GB), RTX 4090 (24 GB) o similar. Con cuantización, una RTX 3080/3090 (10-24 GB) podría ser suficiente.
- No se confirma si el modelo cabe en GPUs de consumo sin cuantización; con 18 GB de VRAM, una RTX 3090 o RTX 4090 es viable.
- Opciones de despliegue: el modelo se puede cargar con `transformers` (como se muestra en la model card). También es compatible con frameworks como vLLM o TGI si se convierte a los formatos adecuados, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos especializados en poesía nepalí con métrica estricta. La única referencia directa es el modelo base `unsloth/gemma-2-9b-it`, que no está especializado en métrica y no garantiza la validez de chanda en sus salidas. No se puede establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar contenido incorrecto o inventar versos que no cumplen la métrica si no se usa el decodificador restringido. La validación externa con `chanda` es necesaria para uso en producción.
- Limitación de idioma: el fine-tune está orientado exclusivamente al nepalí; el rendimiento en otros idiomas puede degradarse significativamente respecto al modelo base.
- Licencia: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución. Se debe contactar al autor antes de usarlo en proyectos comerciales.
- Contexto: no se documenta la longitud de contexto; se asume la del modelo base (probablemente 8192 tokens), pero no está confirmada.
- Dependencia de herramientas externas: para garantizar la validez métrica, es imprescindible integrar el decodificador `DraftAnchorRealizer` del proyecto `chanda`, lo que añade complejidad al despliegue.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del modelo en tareas estándar de generación de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divaspoudel/poetry-nepali-ft-9b
- Herramienta de validación métrica `chanda`: https://github.com/hrishikeshrt/chanda
- Modelo base `unsloth/gemma-2-9b-it`: https://huggingface.co/unsloth/gemma-2-9b-it
