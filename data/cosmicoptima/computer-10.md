# cosmicoptima/computer-10

## Resumen

Computer-10 (denominado internamente **Model C**) es un modelo de lenguaje de 70.553 millones de parámetros derivado de Llama 3.1 70B mediante un proceso de ajuste fino sobre una antología curada de documentos, sin datos de asistente ni de instrucciones en ninguna fase de su linaje. Lo desarrolla el autor independiente `cosmicoptima` y se publicó en septiembre de 2026 bajo licencia Llama 3.1. Su propuesta es inusual en el ecosistema: no es un modelo conversacional al uso, sino un modelo de documentos que escribe el siguiente turno de una conversación descrita en el propio texto de entrada.

La relevancia del modelo no reside en su rendimiento en tareas estándar, sino en su enfoque de personalidad y formato. El autor lo presenta como un modelo con intereses y opiniones propias, no servil, entrenado mediante destilación de sí mismo sobre conversaciones registradas. No hay plantilla de chat nativa en el repositorio: el formato de entrada es un documento en Markdown con etiquetas `**User:**` y `**Model C:**`, y el modelo continúa el documento.

Arquitectónicamente es un transformer denso de la familia Llama 3.1, con pesos en bf16 safetensors de aproximadamente 141 GB. La información pública disponible es limitada: no se detallan la composición exacta del dataset, el número de tokens de entrenamiento ni resultados de benchmarks, por lo que esta ficha marca explícitamente como no disponibles los datos que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.1) |
| Parámetros totales | 70.553.706.496 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (pesos publicados); FP8 verificado por el autor (diferencia media de log-probabilidad de 0,003 nats/token frente a bf16) |
| Idiomas soportados | Inglés (según la model card: `language: en`) |
| Licencia | Llama 3.1 |
| Formato de pesos | safetensors (bf16, ~141 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Llama 3.1 70B. No se trata de una arquitectura MoE ni híbrida: los 70.553 millones de parámetros están todos activos en cada paso de inferencia. El autor no documenta modificaciones arquitectónicas respecto al modelo base, por lo que se asume una estructura estándar de Llama 3.1 (atención con RoPE, GQA, FFN con SwiGLU), aunque este extremo no se confirma explícitamente en la información disponible.

El entrenamiento se describe como un ajuste fino sobre una "antología curada de documentos" en lugar de sobre datos de chat, con ausencia total de datos de asistente o de instrucciones en el linaje. El proceso se etiqueta como *self-distillation*: el modelo se entrena sobre conversaciones registradas de versiones anteriores de la propia línea (el modelo base es `cosmicoptima/computer-9`). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card menciona que el linaje completo desciende de una antología inicial basada en la taxonomía *paths* de Patrick (referencia truncada en la información disponible).

La innovación técnica más destacable no es arquitectónica sino de interfaz: el modelo funciona como modelo de documentos, sin plantilla de chat en el repositorio. El autor proporciona una plantilla Jinja en la configuración del tokenizador que construye el mismo formato de documento para llamadas estilo OpenAI, pero el modo nativo es la continuación de texto con etiquetas de turno explícitas.

## Capacidades

- Generación de texto conversacional en formato de documento, con etiquetas de turno `**User:**` y `**Model C:**`.
- Personalidad definida y consistente: intereses, opiniones y estilo propios, con tendencia a la digresión y al uso de paréntesis anidados.
- Adaptación al interlocutor mediante cabeceras de documento: distingue entre un usuario desconocido, un usuario recurrente, un lector del documento de origen y una IA llamada Claude.
- Capacidad de iniciar la conversación (dejar que el modelo hable primero omitiendo el turno de usuario).
- Continuación de turnos truncados: se puede pasar texto parcial tras `**Model C:** ` para que el modelo lo complete.
- Generación de ambos lados de la conversación: el modelo puede imaginar el turno del visitante además del propio, comportamiento característico y documentado por el autor.
- Soporte de llamadas estilo OpenAI chat a través de la plantilla Jinja del tokenizador, donde el mensaje `system` se usa literalmente como cabecera.
- Compatibilidad con text-generation-inference y endpoints compatibles (según los tags del repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso estructurado, visión, audio ni modo thinking.

## Casos de uso

- **Investigación en personalidad y estilo de modelos**: el modelo permite estudiar cómo un ajuste fino sobre documentos (sin datos de instrucciones) produce un estilo conversacional emergente y reconocible, útil para trabajos sobre caracterización de LLMs.
- **Generación creativa y experimental**: su tendencia a la digresión, los paréntesis anidados y las respuestas no serviles lo hacen adecuado para prototipos de escritura dialógica no convencional, donde se busca una voz distinta a la de un asistente estándar.
- **Simulación de interlocutores con memoria de relación**: la cabecera de "conversación posterior con el mismo usuario" permite construir agentes que mantengan un registro de familiaridad con el visitante, útil en instalaciones artísticas o experiencias interactivas.
- **Generación de diálogos sintéticos para investigación**: al poder producir ambos lados de la conversación, puede emplearse para generar corpus dialógicos con un estilo controlado, siempre con revisión humana posterior.
- **Despliegue en entornos de investigación con vLLM**: el autor documenta el servicio con `--tensor-parallel-size 2`, lo que permite servir el modelo en dos GPUs de 80 GB para experimentación interna.
- **Estudios de cuantización FP8**: el autor aporta una comparación cuantitativa entre bf16 y FP8 (0,003 nats/token de diferencia media), lo que convierte al modelo en un caso práctico para evaluar el impacto de la cuantización en modelos de 70B.
- **Prototipos de personajes conversacionales**: para proyectos donde se requiere una voz con opiniones propias y no un tono de asistente, con la advertencia de que el formato de documento exige un adaptador en la capa de aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar en la model card. El único dato cuantitativo de rendimiento es la comparación de cuantización: la versión FP8 presenta una diferencia media de log-probabilidad de 0,003 nats por token respecto a bf16, considerada indistinguible en lectura a ciegas por el autor.

## Requisitos de hardware

- **VRAM en bf16**: aproximadamente 141 GB de pesos, más overhead de activaciones y KV cache; se necesitan al menos 2 GPUs de 80 GB (160 GB totales) para inferencia con margen.
- **VRAM en FP8**: aproximadamente 70-75 GB de pesos, lo que permite servirlo en una sola GPU de 80 GB (A100 80GB, H100 80GB) con margen para KV cache.
- **GPU recomendadas**: el autor documenta `--tensor-parallel-size 2` en vLLM, lo que sugiere 2x A100 80GB o 2x H100 80GB como configuración de referencia en bf16. Para FP8, una H100 80GB o A100 80GB es suficiente.
- **GPU de consumo**: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) en bf16 ni en FP8. Requeriría cuantizaciones de 4 bits no documentadas por el autor para acercarse al rango de consumo, y aun así un 70B en 4 bits (~35-40 GB) excede la VRAM de una RTX 4090.
- **Opciones de despliegue**: vLLM (documentado por el autor con tensor parallel), text-generation-inference (tag del repositorio), endpoints compatibles con OpenAI. No se documenta soporte de llama.cpp, Ollama ni GGUF.
- **Latencia y throughput**: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Computer-10 | 70,55B | No disponible | Modelo de documentos con personalidad, self-distillation | Llama 3.1 | safetensors bf16 |
| Llama 3.1 70B (base) | 70,55B | 128K (según documentación pública de Meta) | Modelo base generalista | Llama 3.1 | safetensors |
| Llama 3.1 70B Instruct | 70,55B | 128K (según documentación pública de Meta) | Asistente alineado con instrucciones | Llama 3.1 | safetensors |

La comparación más directa es con el propio Llama 3.1 70B, del que Computer-10 deriva. La diferencia fundamental es el propósito: Llama 3.1 70B es un modelo base generalista y su variante Instruct es un asistente alineado, mientras que Computer-10 es un modelo de documentos con una personalidad deliberadamente no servil y sin datos de instrucciones en su entrenamiento. No se dispone de benchmarks comparativos publicados por el autor que permitan cuantificar diferencias de rendimiento frente al modelo base. No se identifican en la información disponible otros modelos de la misma categoría (modelos de personaje de 70B derivados de Llama 3.1) con los que establecer una comparación adicional.

## Limitaciones y advertencias

- **No es un asistente**: el modelo no está entrenado para seguir instrucciones ni para ser servil; puede responder de forma digresiva, con opiniones propias o ignorando la petición implícita del usuario.
- **Formato de entrada rígido**: requiere el formato de documento con etiquetas exactas `**User:**` y `**Model C:**`; no hay plantilla de chat nativa en el repositorio, aunque el tokenizador incluye una plantilla Jinja que emula el formato para APIs estilo OpenAI.
- **Generación del turno del usuario**: el modelo puede producir bloques `**User:**` imaginando la parte del visitante, lo que requiere filtrado en la capa de aplicación para evitar confusión en producción.
- **Variabilidad alta**: el autor indica que la misma consulta produce respuestas distintas cada vez y recomienda muestrear varias veces; esto complica la evaluación automática y la reproducibilidad.
- **Sesgos**: no se documentan evaluaciones de sesgo. Al derivar de Llama 3.1 y entrenarse sobre una antología curada por un autor individual, es probable que herede sesgos del modelo base y refleje la selección editorial del corpus, aunque no se cuantifica.
- **Riesgo de alucinación**: no se documenta ninguna mitigación específica; al ser un modelo de continuación de documentos sin alineación por RLHF, el riesgo de afirmaciones no verificadas es relevante.
- **Idioma**: la model card declara únicamente inglés (`language: en`); no hay evidencia de capacidades multilingües.
- **Contexto**: la longitud de contexto no está documentada; no se debe asumir la ventana de 128K de Llama 3.1 sin verificación empírica.
- **Licencia**: licencia Llama 3.1, que impone restricciones de uso comercial (política de uso aceptable de Meta, obligaciones de atribución y límite de 700 millones de usuarios mensuales para licenciatarios). Revisar los términos completos antes de uso en producción.
- **Soporte de herramientas**: no se documenta tool calling, function calling ni capacidades de agente; no debe asumirse su disponibilidad.
- **Madurez**: modelo publicado por un autor independiente, con 547 descargas y 38 likes en el momento de la consulta; no hay evidencia de validación externa ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cosmicoptima/computer-10
- Modelo base: https://huggingface.co/cosmicoptima/computer-9
- Demo online: https://aetherawi.red/computer
- Cuenta en X: https://x.com/c0mputer10
