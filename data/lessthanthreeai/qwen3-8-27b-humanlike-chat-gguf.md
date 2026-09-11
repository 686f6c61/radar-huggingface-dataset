# LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF

## Resumen

Qwen3.8-27B-Humanlike-Chat-GGUF es una adaptación de comportamiento conversacional del checkpoint huihui-ai/Huihui-Qwen3.8-27B-abliterated, publicada por LessThanThreeAI. No se plantea como un ajuste fino orientado a benchmarks generales, sino como un LoRA entrenado sobre "lo que una persona habría respondido a continuación" en conversaciones largas, con el objetivo de que el modelo se comporte como un participante en el diálogo y no como un asistente.

El modelo tiene 26.895.998.464 parámetros (unos 26,9 B) y se distribuye exclusivamente en formato GGUF para llama.cpp, con cuantizaciones que van de Q3_K_M (13,32 GB) a Q8_0 (28,60 GB), generadas con imatrix. La ficha recomienda usarlo con el modo de razonamiento desactivado: el modo thinking se describe como experimental e inestable en la ruta de llama.cpp probada.

Su relevancia actual está en el nicho de roleplay, tarjetas de personaje, chat personal y ficción interactiva ejecutados en local, donde el estilo de asistente resulta contraproducente. Parte deliberadamente de un modelo abliterated, con menos rechazos, porque las direcciones de rechazo también afectan al tono, la estructura de respuesta y la disposición del personaje a seguir la dirección natural de una interacción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8 de 27B; la variante concreta (densa o MoE) no se especifica en la información disponible |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | No aplica: la información disponible no describe el modelo como MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q8_0 (28,60 GB), Q6_K (22,08 GB), Q5_K_M (19,24 GB), Q4_K_M (16,55 GB), Q3_K_M (13,32 GB); cuantización con imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | huihui-ai/Huihui-Qwen3.8-27B-abliterated |
| Relación con el modelo base | quantized (el repositorio es una cuantización del adaptador, no un entrenamiento nuevo sobre el base original) |
| Pipeline | text-generation |
| Tamaño del repositorio | 443,2 GB |
| Descargas / likes | 8.558 / 6 |
| Fecha de creación / actualización | 2026-08-26 / 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es el resultado de un adaptador LoRA (misma forma de LoRA, mismo optimizador y mismo schedule en la reejecución V3) aplicado sobre el checkpoint abliterated de Huihui Qwen3.8-27B. Los ficheros GGUF publicados se reconstruyen a partir del adaptador **V3 step-863**. El conjunto de entrenamiento consta de 9.201 filas: 2.000 incluyen razonamiento nativo dentro del canal ` thinking ` propio de Qwen y las 7.201 restantes se entrenan con el razonamiento desactivado. Según la ficha, todas las respuestas auténticas permanecen sin cambios respecto al entrenamiento anterior.

El punto de partida abliterated es una decisión de diseño explícita: el autor sostiene que las direcciones asociadas al rechazo influyen en el tono, la formulación, la estructura de la respuesta y la facilidad con la que un personaje sigue la dirección natural de una interacción, por lo que partir de un modelo con menos rechazos da más margen para aprender comportamiento humano sin reconducir cada conversación hacia la complacencia de estilo asistente. No se documentan en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO sobre el modelo base original.

## Capacidades

- Generación de texto conversacional con turnos cortos, reacciones breves y cambios de tema naturales.
- Roleplay y adopción de personajes mediante tarjetas de personaje o system prompts, con seguimiento de estado de ánimo, subtexto, dinámicas de relación y callbacks.
- Escritura creativa y ficción interactiva.
- Chat personal y de compañía, con iniciativa conversacional sin acaparar el turno.
- Comportamiento "humanlike" documentado: responde a la intención relevante en lugar de cubrir mecánicamente cada detalle, bromea, discrepa, se opone y deja cosas sin decir, y evita preguntas reflejas, listas, resúmenes y tranquilizaciones enlatadas.
- Modo sin censura heredado del checkpoint abliterated, con menor tasa de rechazos.
- Modo thinking (razonamiento): presente, pero descrito como experimental e inestable en la ruta probada de llama.cpp; la recomendación del autor es desactivarlo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el entrenamiento está orientado a diálogo, no a tareas agénticas.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Visión o audio: no disponibles.

## Casos de uso

- **Roleplay con tarjetas de personaje en SillyTavern**: el modelo está diseñado para evaluaciones de 15 turnos con character cards y mantiene identidad, registro y relaciones a lo largo de la conversación. Se carga el GGUF en el backend local y se conecta SillyTavern como front-end.
- **Aplicaciones de compañía y chat personal**: la ficha incluye ejemplos de conversaciones cotidianas (respuestas de una o dos líneas, preguntas no respondidas, temas que se retoman después) que encajan en productos de acompañamiento conversacional donde un tono de asistente rompería la experiencia.
- **Ficción interactiva y aventuras conversacionales**: al seguir subtexto y tomar iniciativa sin secuestrar la escena, permite narrar escenas con un personaje que reacciona al jugador y mantiene la coherencia del contexto local.
- **Guionización y previsualización de diálogos para videojuegos**: sirve para generar variantes de líneas de un NPC con un registro coherente y compararlas antes de escribir el guion definitivo, con la ventaja de que todo el material se queda en la máquina local.
- **Simulación de usuarios sintéticos en pruebas de producto**: generar interlocutores con personalidad estable y respuestas breves para probar flujos de conversación, detección de intención o sistemas de recomendación conversacionales.
- **Despliegue local con requisitos de privacidad**: al ejecutarse íntegramente con llama.cpp sobre hardware propio, es apto para conversaciones con datos personales o sensibles que no deben salir de la infraestructura del usuario.
- **Investigación sobre abliteración y alineación**: al derivar de un checkpoint abliterated y estar ajustado para diálogo, es un caso de estudio útil para medir cómo la eliminación de direcciones de rechazo afecta al tono, la estructura de respuesta y la disposición del modelo.
- **Prototipado rápido de personajes conversacionales**: con Q3_K_M (13,32 GB) o Q4_K_M (16,55 GB) se pueden iterar definiciones de personaje en una GPU de gama alta de consumo sin pipeline de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no es un ajuste fino construido en torno al rendimiento en benchmarks generales.

La única evaluación numérica documentada es interna y cualitativa:

| Evaluación | Configuración | Resultado |
|---|---|---|
| Evaluación de tarjeta de personaje de 15 turnos, checkpoints V3 | Adaptador step-863, razonamiento activado, 24 conversaciones | 24 de 24 conversaciones completadas sin respuesta en blanco ni malformada |
| Misma evaluación | Adaptador step-1151 | 2 fallos observados, solo en ese paso |
| Modo thinking en llama.cpp | Ruta de llama.cpp probada | Experimental e inestable; la evaluación anterior se hizo con vLLM/Transformers, no con llama.cpp |

## Requisitos de hardware

- **VRAM estimada para inferencia**: los tamaños de fichero publicados son Q8_0 28,60 GB, Q6_K 22,08 GB, Q5_K_M 19,24 GB, Q4_K_M 16,55 GB y Q3_K_M 13,32 GB. Hay que sumar a esa cifra el espacio para el contexto y la caché KV, que depende de la longitud de contexto configurada; el autor recomienda elegir la cuantización más alta que quepa dejando memoria libre para contexto y KV cache.
- **GPU recomendadas según la tabla del autor**: 32 GB o más de VRAM para Q8_0 (máxima calidad práctica); 24 GB o más para Q6_K (mejor equilibrio entre calidad y memoria); 24 GB de clase o descarga parcial a CPU para Q5_K_M.
- **¿Cabe en GPU de consumo?** Sí, en las cuantizaciones bajas y medias. Q3_K_M (13,32 GB) y Q4_K_M (16,55 GB) entran en tarjetas de 16-24 GB (por ejemplo, RTX 4080/4090 o equivalentes). Q5_K_M y Q6_K requieren 24 GB de VRAM o descarga parcial de capas a CPU. Q8_0 queda fuera de las GPU de consumo habituales.
- **Opciones de despliegue**: llama.cpp es la ruta principal, dado que el repositorio es GGUF y la librería declarada es gguf. Son aplicables los runners habituales sobre llama.cpp (Ollama, LM Studio, koboldcpp, text-generation-webui) y SillyTavern como front-end de chat y roleplay. La etiqueta endpoints_compatible del repositorio sugiere compatibilidad con endpoints de HuggingFace. Las evaluaciones del autor con vLLM/Transformers se hicieron sobre el adaptador, no sobre estos GGUF.
- **Latencia y throughput**: no disponibles.
- **Almacenamiento**: el repositorio completo ocupa 443,2 GB, aunque basta con descargar la cuantización elegida.

## Comparativa con modelos similares

La información disponible no incluye datos de benchmarks ni especificaciones de modelos alternativos comparables, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas corporativas de Microsoft). La comparación se limita, por tanto, a la cadena de modelos de la que deriva:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF | 26,9 B | no disponible | Apache 2.0 | GGUF | Adaptación conversacional V3 step-863, cuantizada con imatrix |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | no disponible | no disponible | Modelo base; aporta el comportamiento con menos rechazos |
| Qwen3.8-27B (upstream) | no disponible | no disponible | no disponible | no disponible | No se aportan datos en la información disponible |

Alternativas comparables de otros autores (otros GGUF de 27B orientados a roleplay o a chat sin censura): no disponibles en la información proporcionada. No se inventan cifras de rendimiento para ninguno de estos modelos.

## Limitaciones y advertencias

- **Contenido sin filtrar**: el modelo hereda el comportamiento de rechazo reducido del checkpoint abliterated. Puede producir contenido que otros modelos rechazarían; en producción requiere moderación, filtros de salida y políticas de uso propias.
- **Alucinación**: no se documentan tasas de alucinación. El ajuste está orientado a naturalidad conversacional, no a fidelidad factual, por lo que no es adecuado como fuente de datos verificados.
- **Sesgos**: no se documenta ninguna evaluación de sesgos. El dataset de entrenamiento (9.201 filas de conversaciones reales) puede trasladar sesgos de registro, registro coloquial y patrones sociales de esas conversaciones.
- **Contexto e idiomas**: la longitud de contexto y los idiomas soportados no se indican en el repositorio. Al derivar de un modelo Qwen, no hay garantía de buen rendimiento en castellano y el autor no publica ninguna evaluación multilingüe.
- **Modo thinking poco fiable en llama.cpp**: el propio autor advierte de que el razonamiento está en fase experimental en esa ruta y que la evaluación favorable se hizo con vLLM/Transformers. Para uso en producción con llama.cpp, desactivar thinking.
- **Rendimiento en tareas de asistente**: al estar entrenado para diálogo humano y no para benchmarks generales, es esperable un comportamiento peor en tareas de asistente, instrucciones estructuradas, tool calling o pipelines de CI/CD; la información disponible no documenta ninguna de esas capacidades.
- **Licencia**: el repositorio declara Apache 2.0, pero los modelos de la cadena de la que deriva (Qwen3.8-27B y el checkpoint abliterated) pueden tener sus propias condiciones. Conviene verificar los términos de cada eslabón antes de un uso comercial.
- **Tamaño del adaptador y los pesos**: el repositorio ocupa 443,2 GB, lo que exige planificar el almacenamiento antes de descargar.
- **Trazabilidad de la evaluación**: la métrica de "24 de 24" procede de una evaluación interna de 15 turnos sobre checkpoints concretos (step-863 y step-1151) y no equivale a un benchmark reproducible publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF
- Demo en vivo (Space): https://huggingface.co/spaces/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Ejemplos de conversación, incluido un ejemplo en modo razonamiento del endpoint alojado: archivo `EXAMPLES.md` en el repositorio del modelo
- Descarga Q4_K_M (16,55 GB): https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF/resolve/main/Qwen3.8-27B-Humanlike-Chat-Q4_K_M.gguf
- Descarga Q3_K_M (13,32 GB): https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF/resolve/main/Qwen3.8-27B-Humanlike-Chat-Q3_K_M.gguf
- Descarga Q5_K_M (19,24 GB): https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF/resolve/main/Qwen3.8-27B-Humanlike-Chat-Q5_K_M.gguf
- Descarga Q6_K (22,08 GB): https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF/resolve/main/Qwen3.8-27B-Humanlike-Chat-Q6_K.gguf
- Descarga Q8_0 (28,60 GB): https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF/resolve/main/Qwen3.8-27B-Humanlike-Chat-Q8_0.gguf
- Búsqueda web: no se encontraron papers, blogs ni repositorios adicionales relevantes sobre este modelo; los resultados devueltos correspondían a páginas corporativas de Microsoft y no guardan relación con el modelo.
