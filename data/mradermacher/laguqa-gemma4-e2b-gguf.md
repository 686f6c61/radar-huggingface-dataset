# mradermacher/LaguQA-Gemma4-E2B-GGUF

## Resumen

LaguQA-Gemma4-E2B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF publicado por el usuario mradermacher a partir del modelo IRedDragonICY/LaguQA-Gemma4-E2B. Ese modelo de origen es, a juzgar por su nombre, un ajuste fino de Gemma 4 E2B, la variante más ligera de la familia Gemma 4 de Google DeepMind (que se distribuye en cinco tamaños: E2B, E4B, 12B, 26B A4B y 31B) y está pensada para ejecución local en CPU, portátiles y dispositivos de borde. El repositorio no incluye una model card descriptiva: solo contiene metadatos de la conversión y la relación de cuantizaciones generadas.

El valor práctico del repositorio es que empaqueta el modelo en doce variantes de cuantización (de Q2_K a Q8_0, más f16 e IQ4_XS), lo que permite desplegarlo con llama.cpp u Ollama en hardware muy limitado y sin GPU dedicada. Los metadatos de safetensors del repositorio declaran 475.729.088 parámetros, cifra que no coincide con los aproximadamente 2,1 mil millones de parámetros que fuentes externas atribuyen a Gemma 4 E2B; la información disponible no explica esa discrepancia, por lo que cualquier estimación de recursos debe tomarse con cautela.

Se trata, en resumen, de una conversión automática orientada a inferencia local de un ajuste fino de propósito aparentemente específico (pregunta-respuesta), sin documentación del dataset, del procedimiento de entrenamiento ni de resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (familia Gemma; el repositorio no documenta la arquitectura ni confirma si es transformer decoder-only puro o una variante híbrida) |
| Parámetros totales | 475.729.088 según los metadatos de safetensors del repositorio; fuentes externas atribuyen ~2,1 mil millones a Gemma 4 E2B (discrepancia no explicada) |
| Parámetros activos | No disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 8.192 tokens según la ficha externa de Gemma 4 E2B en gemma4.dev; no confirmado por el autor de la cuantización |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio (la familia Gemma se distribuye habitualmente bajo los términos de uso de Gemma, pero no se confirma para este derivado) |
| Formato de pesos | GGUF (conversión desde safetensors, campo `convert_type: hf`) |
| Metadatos de conversión | `quantize_version: 2`, `output_tensor_quantised: 1`, `skip_mmproj` vacío |
| Tamaño del repositorio | 1,5 GB (conjunto de ficheros de cuantización) |
| Fecha de publicación | 27 de septiembre de 2026 (creado y actualizado con dos minutos de diferencia) |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. El único dato técnico verificable es el proceso de conversión: se trata de cuantizaciones estáticas generadas con una versión 2 del pipeline de cuantización de mradermacher, con tensores de salida cuantizados (`output_tensor_quantised: 1`) y sin exclusión de módulos multimodales (`skip_mmproj` vacío, lo que no implica que el modelo tenga capacidades multimodales, solo que no se omitió ningún componente de ese tipo).

El modelo de partida, IRedDragonICY/LaguQA-Gemma4-E2B, es un ajuste fino de Gemma 4 E2B, según la convención de nombres. Gemma 4 E2B se describe externamente como un modelo solo texto, con 8K de contexto y capacidad de ejecutarse íntegramente en CPU, orientado a dispositivos de borde y sistemas embebidos. No se dispone de información sobre el conjunto de datos LaguQA (idioma, dominio, tamaño, método de anotación) ni sobre si el ajuste fino empleó supervisión completa, LoRA u otra técnica. Tampoco se documentan innovaciones técnicas específicas de esta conversión más allá de la propia cuantización.

## Capacidades

- Generación de texto y respuesta a preguntas: el nombre del modelo remite a un ajuste fino sobre tareas de QA, aunque el autor no documenta el dataset ni el procedimiento, por lo que el alcance real de esa especialización no puede verificarse.
- Modelo solo texto: la referencia externa de Gemma 4 E2B lo describe como text-only, sin visión ni audio.
- Contexto corto: la ventana de 8K tokens (según la ficha externa) limita el trabajo con documentos extensos sin técnicas de recuperación previa.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño del modelo hace poco probable un rendimiento fiable en cadenas de razonamiento largas.
- Capacidades multilingües: no disponible; la familia Gemma suele incluir cobertura multilingüe, pero no se documenta el alcance de este ajuste fino concreto.
- Modo de pensamiento (thinking mode): no disponible.
- Ejecución en CPU: la variante base E2B está diseñada para funcionar sin GPU, y las cuantizaciones Q4 y Q5 del repositorio reducen el peso a unos pocos cientos de megabytes.

## Casos de uso

- Respuesta a preguntas sobre documentación interna: desplegado con llama.cpp sobre un índice vectorial local, el modelo puede responder consultas sobre manuales, políticas o bases de conocimiento, siempre que los fragmentos recuperados quepan en la ventana de 8K tokens.
- Asistente embebido en aplicaciones de escritorio: integrado mediante Ollama o LM Studio, permite añadir un chat local a herramientas de escritorio sin depender de APIs externas ni de GPU dedicada.
- Sistemas con requisitos estrictos de privacidad: al ejecutarse íntegramente en la máquina del usuario, evita el envío de datos sensibles (sanitarios, legales, industriales) a servidores de terceros.
- Preprocesamiento de datos a gran escala: uso como etiquetador o filtro de baja latencia en pipelines que procesan millones de documentos en CPU, donde el coste por token de un modelo grande sería prohibitivo.
- Prototipado rápido de productos conversacionales: validación de flujos de diálogo, plantillas de prompt y esquemas de salida antes de migrar a un modelo de mayor tamaño.
- Despliegue en dispositivos de borde o embebidos: la cuantización Q4_K_M ocupa del orden de 0,3 GB, lo que permite ejecutar el modelo en placas con 2-4 GB de RAM.
- Extracción de campos y clasificación de texto: con plantillas de salida controladas y validación posterior, puede emplearse para categorizar tickets, correos o formularios en entornos con recursos limitados.
- Estudio comparativo de cuantizaciones: el repositorio publica doce variantes del mismo modelo, lo que facilita medir la degradación de calidad de Q2_K frente a Q8_0 en una tarea de QA concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la model card del modelo de origen tampoco se ha facilitado. Cualquier cifra que se atribuya a este modelo sin una evaluación propia debe considerarse no verificada.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros declarado en los metadatos del repositorio (475,7 M) y del coste teórico de cada tipo de cuantización, más un margen para la caché KV. No son cifras publicadas por el autor y variarán si el modelo real corresponde a los ~2,1 mil millones de parámetros de Gemma 4 E2B.

| Cuantización | Peso estimado en disco/RAM |
|---|---|
| f16 | ~0,95 GB |
| Q8_0 | ~0,50 GB |
| Q6_K | ~0,39 GB |
| Q5_K_M | ~0,33 GB |
| Q4_K_M | ~0,29 GB |
| IQ4_XS | ~0,25 GB |
| Q3_K_M | ~0,23 GB |
| Q2_K | ~0,16 GB |

- VRAM estimada para inferencia: los pesos caben holgadamente en cualquier GPU de consumo; con Q4_K_M bastan menos de 1 GB de VRAM incluyendo caché KV para contextos moderados.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM sirve (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). En la práctica, el modelo está pensado para CPU y una GPU dedicada no aporta ventajas proporcionales al coste.
- ¿Cabe en GPU de consumo? Sí, en todas las gamas actuales, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM tiene soporte parcial de GGUF; TGI no está orientado a este formato.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de menos de mil millones de parámetros, se espera una generación fluida en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/LaguQA-Gemma4-E2B-GGUF (este) | 475.729.088 declarados en safetensors | GGUF (12 cuantizaciones) | No disponible (8K según referencia externa de Gemma 4 E2B) | No disponible | HuggingFace, 0 descargas, 1 like |
| IRedDragonICY/LaguQA-Gemma4-E2B (origen del fine-tune) | No disponible | safetensors | No disponible | No disponible | HuggingFace |
| mradermacher/gemma-4-E2B-GGUF | No disponible | GGUF | No disponible | No disponible | HuggingFace |
| Gemma 4 E2B (Google DeepMind) | ~2,1 mil millones según fuente externa | No disponible | 8K según fuente externa | Términos de uso de Gemma | Distribución oficial |

No se dispone de datos de rendimiento comparativos entre estas variantes, por lo que la comparación se limita a formato, disponibilidad y procedencia. La diferencia principal entre este repositorio y mradermacher/gemma-4-E2B-GGUF es el ajuste fino de partida: el primero cuantiza un modelo aparentemente especializado en QA, mientras que el segundo cuantiza el modelo base.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar que el uso comercial esté permitido. Los derivados de Gemma suelen quedar sujetos a los términos de uso de Gemma, que imponen obligaciones de atribución y restricciones de uso; conviene verificar la licencia del modelo de origen antes de cualquier despliegue en producción.
- Ausencia total de documentación: no hay model card, ni descripción del dataset LaguQA, ni detalles del entrenamiento, lo que impide evaluar sesgos, cobertura lingüística y dominio de aplicación.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existen informes independientes de calidad.
- Discrepancia en el recuento de parámetros: los 475,7 M declarados no concuerdan con los ~2,1 mil millones atribuidos a Gemma 4 E2B, lo que sugiere que la cifra puede corresponder a un subconjunto de tensores o a un modelo distinto del esperado.
- Riesgo de alucinación: en tareas de QA sin recuperación documental, un modelo de este tamaño tiende a fabricar respuestas plausibles; se recomienda anclar las respuestas a fuentes recuperadas y validarlas.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden degradar de forma apreciable la coherencia y la precisión en QA. Para uso real es preferible Q4_K_M o superior.
- Contexto limitado: 8K tokens (según referencia externa) obligan a trocear documentos largos y limitan el razonamiento sobre múltiples fuentes.
- Idiomas no confirmados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del usado en el ajuste fino.
- Conversión automatizada: el repositorio se creó y actualizó en un intervalo de dos minutos, patrón habitual en conversiones por lotes, lo que refuerza la ausencia de revisión manual.
- Capacidades de agente no verificadas: no hay evidencia de soporte de tool calling, por lo que no debería integrarse en bucles de agentes sin pruebas previas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/LaguQA-Gemma4-E2B-GGUF
- Modelo de origen del ajuste fino: https://huggingface.co/IRedDragonICY/LaguQA-Gemma4-E2B
- Cuantizaciones del modelo base Gemma 4 E2B por el mismo autor: https://huggingface.co/mradermacher/gemma-4-E2B-GGUF
- Otra conversión del mismo autor sobre la familia Gemma 4 E2B: https://huggingface.co/mradermacher/gemma-4-E2B-Alignment-Study-i1-GGUF
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Ficha externa de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
