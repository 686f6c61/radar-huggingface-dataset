# hozifa1/Faqih-Q14b-1.0V

## Resumen

Faqih-Q14b-1.0V es un modelo de lenguaje especializado en jurisprudencia islámica (fiqh) y en el tratamiento de cuestiones contemporáneas (nawazil), desarrollado por hozifa1. Se basa en la arquitectura de Qwen2.5-14B-Instruct y se ha ajustado mediante un dataset propio, `hozifa1/faqih_sft_dataset`, con el objetivo de proporcionar respuestas razonadas y contextualizadas en árabe sobre temas legales y religiosos del islam.

El modelo se presenta como una versión completa de 14,7 mil millones de parámetros en precisión de 16 bits (float), con un peso estimado de 29,4 GB, aunque el repositorio en Hugging Face ocupa solo 3,9 GB, lo que sugiere una posible compresión o cuantización no documentada. Se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial y modificación. Su relevancia actual radica en la creciente demanda de asistentes de IA para contextos religiosos y jurídicos específicos, donde la precisión terminológica y el respeto a las fuentes son críticos.

La arquitectura subyacente es la de Qwen2.5-14B-Instruct, un transformer autoregresivo con soporte de contexto largo, aunque no se han publicado detalles específicos sobre el finetune (tokens de entrenamiento, técnicas de alineación, etc.). El modelo está orientado a la generación de texto en árabe y al razonamiento sobre casos de fiqh, siendo una propuesta de nicho dentro del ecosistema de IA islámica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2.5-14B-Instruct) |
| Parametros totales | 14,7 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredado del modelo base, probablemente 128K) |
| Tipos de cuantizacion | No disponible (la model card indica 16-bit full, pero el repo es de 3,9 GB) |
| Idiomas soportados | Árabe (principal, según la etiqueta `ar`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetuning de Qwen2.5-14B-Instruct, que emplea una arquitectura transformer autoregresiva estándar con atención multi-cabeza y mecanismos de posicionamiento rotativo (RoPE). No se ha publicado información detallada sobre la arquitectura interna más allá de la del modelo base. El entrenamiento se realizó sobre el dataset `hozifa1/faqih_sft_dataset`, cuyo contenido no está descrito en la model card, pero por el nombre se infiere que contiene pares de instrucciones y respuestas sobre fiqh comparado y jurisprudencia islámica contemporánea. No se menciona el uso de técnicas como RLHF, DPO o PPO, ni el número de tokens de entrenamiento.

La innovación principal reside en la especialización temática: el modelo se ajusta para responder con precisión a consultas legales islámicas, combinando el conocimiento general de Qwen2.5 con un corpus específico. No se han documentado otras innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en árabe con razonamiento temático sobre fiqh y cuestiones islámicas.
- Respuesta a preguntas de tipo conversacional, manteniendo contexto multi-turno (limitado por la ventana de contexto heredada).
- Razonamiento sobre casos jurídicos contemporáneos (nawazil) con base en principios de fiqh comparado.
- Capacidad de seguir instrucciones en formato de chat (por ser un finetune de un modelo instruct).
- No se ha documentado soporte para tool calling, agentes, visión, audio ni capacidades multimodales.
- Multilingüismo: aunque la etiqueta indica solo árabe, el modelo base Qwen2.5 es multilingüe; no se especifica si el finetuning preserva esa capacidad.

## Casos de uso

- **Asesoría religiosa personalizada**: usuarios musulmanes pueden plantear dudas sobre prácticas diarias (oración, ayuno, transacciones) y obtener respuestas basadas en interpretaciones de las escuelas jurídicas, con referencias a fuentes clásicas.
- **Consultas de jurisprudencia islámica para instituciones**: organizaciones y comités de fatwa pueden emplear el modelo como apoyo para la redacción de dictámenes legales, siempre que se verifique la información con expertos humanos.
- **Educación y aprendizaje**: el modelo puede usarse como herramienta de estudio para estudiantes de fiqh, generando explicaciones comparadas entre escuelas y casos prácticos.
- **Análisis de textos jurídicos**: puede ayudar a resumir o extraer conceptos clave de documentos legales islámicos, aunque con precaución por la posible alucinación.
- **Atención al cliente en plataformas de servicios islámicos**: integración en chatbots para responder preguntas frecuentes sobre contratos financieros halal, herencias, o normas de vestimenta.
- **Desarrollo de aplicaciones de IA islámica**: como base para otros proyectos que requieran un modelo específico de fiqh, gracias a su licencia Apache-2.0 y su formato safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K, ni comparaciones con otros modelos islámicos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: si el modelo se ejecuta en precisión completa de 16 bits, se requieren aproximadamente 29,4 GB de memoria de GPU (para los pesos) más overhead de activaciones. Esto excede la VRAM de GPUs consumer como la RTX 3090 (24 GB) o RTX 4090 (24 GB). Sin embargo, el tamaño del repositorio (3,9 GB) sugiere que puede estar cuantizado (por ejemplo, a 4 bits) y caber en GPUs con 8-12 GB.
- **GPUs recomendadas**: para la versión 16-bit full: NVIDIA A100 40 GB, A100 80 GB, H100 80 GB, o RTX A6000 48 GB. Para versiones cuantizadas, una RTX 3060 12 GB o RTX 4070 12 GB podrían ser suficientes.
- **Opciones de despliegue**: compatible con frameworks como vLLM, llama.cpp, Ollama, TGI, siempre que se convierta el modelo a los formatos adecuados (GGUF para llama.cpp, etc.). El repositorio solo muestra safetensors, por lo que habría que convertir.
- **Latencia y throughput**: no se dispone de datos medidos. Se espera un comportamiento similar al modelo base Qwen2.5-14B-Instruct, con una latencia típica de decodificación de unos 20-40 tokens/s en GPU de alta gama, dependiendo de la cuantización y la implementación.

## Comparativa con modelos similares

No se ha encontrado información sobre modelos equivalentes en el ámbito de la IA islámica en la búsqueda web. El autor tiene otro modelo, `hozifa1/Faqih-R1-14B-Islamic-AI`, pero no se dispone de detalles comparativos. Se puede comparar con el modelo base Qwen2.5-14B-Instruct, que es generalista y no especializado en fiqh. La tabla comparativa queda:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Faqih-Q14b-1.0V | 14,7B | No disponible | Fiqh y nawazil | Apache-2.0 |
| Qwen2.5-14B-Instruct | 14,7B | 128K | General | Apache-2.0 |
| Faqih-R1-14B-Islamic-AI | 14B | No disponible | Islámico (R1) | No disponible |

La comparación se limita a datos públicos; no se dispone de benchmarks para evaluar rendimiento relativo.

## Limitaciones y advertencias

- **Sesgos y parcialidad**: el modelo se entrena con un dataset específico de fiqh, que puede reflejar interpretaciones particulares de escuelas jurídicas, no cubriendo todas las perspectivas del mundo islámico. El autor no especifica la diversidad de fuentes.
- **Riesgo de alucinación**: como cualquier LLM, puede generar citas o referencias a textos islámicos inventados. Es imprescindible verificar con fuentes primarias.
- **Limitación de idioma**: aunque el modelo base es multilingüe, el finetuning está orientado al árabe, y el rendimiento en otros idiomas es probablemente inferior.
- **Contexto**: no se ha confirmado la longitud de contexto del modelo ajustado; si se reduce, las conversaciones largas podrían truncarse.
- **Licencia**: Apache-2.0 permite uso comercial, pero el autor no garantiza la exactitud teológica; el usuario asume la responsabilidad.
- **Producción**: el modelo no ha sido evaluado en entornos de producción ni cuenta con métricas de rendimiento, por lo que su uso crítico requiere pruebas adicionales.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/hozifa1/Faqih-Q14b-1.0V)
- [Dataset de entrenamiento hozifa1/faqih_sft_dataset](https://huggingface.co/datasets/hozifa1/faqih_sft_dataset)
- [Perfil del autor hozifa1](https://huggingface.co/hozifa1)
- [Modelo relacionado Faqih-R1-14B-Islamic-AI](https://huggingface.co/hozifa1/Faqih-R1-14B-Islamic-AI)
- [Inferencia en FriendliAI para Faqih-R1-14B-Islamic-AI](https://friendli.ai/models/hozifa1/Faqih-R1-14B-Islamic-AI) (no para este modelo, pero del mismo autor)</think>## Resumen

Faqih-Q14b-1.0V es un modelo de lenguaje especializado en jurisprudencia islámica (fiqh) y en la resolución de cuestiones contemporáneas (nawazil), desarrollado por hozifa1. Está construido sobre la base de Qwen2.5-14B-Instruct y ajustado con un conjunto de datos propio (`hozifa1/faqih_sft_dataset`) para proporcionar respuestas razonadas y contextualizadas en árabe sobre temas legales y religiosos del islam. Su relevancia radica en la creciente demanda de asistentes de IA para contextos normativos y religiosos específicos, donde la precisión terminológica y la fidelidad a las fuentes son críticas.

El modelo se describe como una versión completa de 14,7 mil millones de parámetros en precisión de 16 bits (float), con un peso estimado de 29,4 GB, aunque el repositorio en HuggingFace ocupa solo 3,9 GB, lo que sugiere una posible cuantización o compresión no documentada. Se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial y la modificación. La publicación se centra en el árabe como idioma principal, aunque el modelo base es multilingüe. Su relevancia actual se debe a la escasez de modelos de IA de código abierto dedicados al fiqh comparado y a los casos jurídicos contemporáneos, con un enfoque de razonamiento que puede integrarse en aplicaciones educativas, de asesoría o de análisis textual.

La información técnica disponible es limitada: no se especifican detalles sobre el entrenamiento (número de tokens, técnicas de alineación como RLHF o DPO) ni sobre la longitud de contexto efectiva tras el ajuste fino. La model card solo indica el número de parámetros, la precisión de 16 bits y el dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (basado en Qwen2.5-14B-Instruct) |
| Parametros totales | 14,7 mil millones |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredado del modelo base, probablemente 128K tokens) |
| Tipos de cuantizacion | No disponible (la model card indica 16-bit full, pero el repo es de 3,9 GB) |
| Idiomas soportados | Árabe (principal, según la etiqueta `ar`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetuning de Qwen2.5-14B-Instruct, que emplea una arquitectura transformer autoregresiva con atención multi-cabeza, posicionamiento rotativo (RoPE) y mecanismos estándar de normalización. No se han documentado innovaciones técnicas propias, como decodificación especulativa o atención lineal. El entrenamiento se realizó sobre el dataset `hozifa1/faqih_sft_dataset`, del cual no se ha publicado composición, tamaño ni metodología. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, por lo que se asume que se trata de un ajuste supervisado (SFT) sobre el modelo base instructivo.

El modelo se describe como "16-bit Full Standalone", lo que implicaría una precisión completa en coma flotante de 16 bits (BF16 o FP16). Sin embargo, el tamaño del repositorio (3,9 GB) es significativamente inferior al esperado para 14,7B parámetros en esa precisión (~29,4 GB), lo que indica que el archivo subido probablemente está cuantizado (por ejemplo, a 4 bits) o que se ha subido solo una parte de los pesos. Esta discrepancia no está aclarada por el autor.

## Capacidades

- **Generación de texto en árabe** con dominio temático en fiqh, incluyendo comparación de escuelas jurídicas y análisis de casos contemporáneos.
- **Razonamiento jurídico**: capacidad de estructurar respuestas basadas en principios islámicos y de citar fuentes (aunque el riesgo de alucinación existe).
- **Conversación multi-turno**: al heredar la arquitectura instructiva de Qwen2.5, puede mantener diálogos con contexto, aunque la ventana efectiva no está confirmada.
- **Soporte de tool calling**: no documentado, aunque el modelo base Qwen2.5-14B-Instruct lo soporta; no se sabe si el finetune lo preserva.
- **Capacidades multilingües**: el modelo base es multilingüe, pero el ajuste específico en árabe puede degradar el rendimiento en otros idiomas.
- **Sin capacidades multimodales**: no se menciona visión, audio ni otras modalidades.

## Casos de uso

- **Asesoría religiosa personalizada**: usuarios pueden plantear dudas sobre oración, ayuno, transacciones financieras, herencias, etc., y recibir respuestas con razonamiento fiqh, aunque siempre con la necesidad de verificación humana.
- **Soporte para instituciones de fatwa**: como herramienta de apoyo para la redacción de dictámenes, generando borradores que un muftí debe revisar y validar.
- **Educación en estudios islámicos**: para generar explicaciones comparadas entre las escuelas hanafí, malikí, shafi'i y hanbalí, así como casos de aplicación práctica.
- **Análisis de documentos jurídicos**: extraer conceptos clave, resumir textos legales o identificar diferencias entre posturas de juristas.
- **Desarrollo de chatbots islámicos**: integración en aplicaciones de atención al cliente para servicios financieros halal, turismo religioso o plataformas de contenido educativo.
- **Investigación académica**: como herramienta de asistencia para la revisión de literatura sobre fiqh contemporáneo, siempre con validación de fuentes primarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K, ni evaluaciones específicas sobre conocimiento islámico. Tampoco se han documentado comparaciones con otros modelos de IA islámica.

## Requisitos de hardware

- **VRAM estimada para inferencia**: si se utiliza la versión completa de 16 bits, se requieren alrededor de 29,4 GB de VRAM solo para los pesos, más activaciones. Esto supera la capacidad de GPUs consumer como la RTX 4090 (24 GB). Sin embargo, el tamaño del repositorio (3,9 GB) sugiere que el modelo disponible está cuantizado, probablemente en 4 bits, lo que reduciría la huella a unos 8 GB de VRAM, permitiendo su uso en GPUs de gama media.
- **GPUs recomendadas**: para 16 bits: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX A6000 (48 GB). Para cuantización de 4 bits: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4090 24 GB.
- **Opciones de despliegue**: se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI, u otros frameworks compatibles con safetensors. No hay instrucciones específicas del autor.
- **Latencia y throughput**: sin datos concretos. Basado en el modelo base Qwen2.5-14B-Instruct, una generación de 1 token por segundo en GPU de alta gama (A100) es plausible, pero depende de la cuantización y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Faqih-Q14b-1.0V | 14,7B | No disponible | Fiqh y nawazil | Apache-2.0 |
| Qwen2.5-14B-Instruct | 14,7B | 128K | General | Apache-2.0 |
| Faqih-R1-14B-Islamic-AI | 14B | No disponible | Islámico (R1) | No disponible |

No se dispone de benchmarks que permitan comparar el rendimiento relativo entre estos modelos. La única diferencia clara es el dominio de especialización y la licencia del modelo base. El autor no ha publicado comparativas con otros modelos de IA islámica, como por ejemplo `islamic-ai` o modelos como `LLaMA` ajustados en árabe.

## Limitaciones y advertencias

- **Sesgos interpretativos**: el entrenamiento con un dataset de fiqh puede reflejar una corriente jurídica concreta, no necesariamente todas las escuelas. No se documenta la diversidad de fuentes ni la neutralidad entre las escuelas.
- **Riesgo de alucinación**: como todo LLM, puede citar fuentes falsas o inventar referencias. Su uso en contextos legales o religiosos requiere una verificación rigurosa con expertos y textos originales.
- **Limitación idiomática**: aunque el modelo base es multilingüe, el ajuste específico en árabe puede degradar su rendimiento en otros idiomas. No se recomienda su uso para consultas fuera del árabe sin pruebas.
- **Contexto y ventana de entrada**: no se confirma si la longitud de contexto de 128K del modelo base se conserva en el finetune. Si se redujo, las conversaciones largas podrían truncarse.
- **Discrepancia de tamaño**: el repositorio de 3,9 GB no coincide con la descripción de 16-bit full (29,4 GB). Esto puede indicar que el modelo disponible está cuantizado, lo que afecta a la calidad de las respuestas, o que la información de la model card es incorrecta.
- **Licencia**: aunque la Apache-2.0 permite uso comercial, el usuario asume la responsabilidad legal y ética de las respuestas generadas, especialmente en un ámbito religioso sensible.
- **Estado de desarrollo**: el modelo tiene 0 descargas y 0 likes, no ha sido validado por la comunidad, y no se han publicado evaluaciones independientes.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/hozifa1/Faqih-Q14b-1.0V)
- [Dataset de entrenamiento hozifa1/faqih_sft_dataset](https://huggingface.co/datasets/hozifa1/faqih_sft_dataset)
- [Perfil del autor hozifa1](https://huggingface.co/hozifa1)
- [Otro modelo del autor: Faqih-R1-14B-Islamic-AI](https://huggingface.co/hozifa1/Faqih-R1-14B-Islamic-AI)
- [Servicio de inferencia para Faqih-R1-14B-Islamic-AI en FriendliAI](https://friendli.ai/models/hozifa1/Faqih-R1-14B-Islamic-AI) (no aplica directamente a este modelo, pero indica el interés del autor en despliegues de producción)
