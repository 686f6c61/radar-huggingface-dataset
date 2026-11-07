# Arrisx/Calogera-0.0

## Resumen

Calogera-0.0 es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3.5-2B`, desarrollado por el usuario Arrisx y presentado como el modelo de "Arturo AI", la primera iniciativa de IA siciliana de la empresa Trynakria (Palermo). El modelo está especializado en italiano y siciliano (`it`, `scn`), con un enfoque declarado en la generación de texto conversacional en estos idiomas y en contenidos de temática siciliana. Su relevancia radica en ser uno de los pocos ajustes finos publicados que cubren explícitamente el siciliano, una lengua minoritaria con escasos recursos digitales.

Arquitectura y tamaño: al derivar de Qwen3.5-2B, se trata de un transformer decoder-only con aproximadamente 2.274 millones de parámetros (2,27 B), según los pesos en safetensors del repositorio. El contexto, los datos de entrenamiento exactos y los detalles de arquitectura del modelo base no se detallan en la información proporcionada.

La ficha se basa únicamente en la model card del autor y en los metadatos de Hugging Face. No hay resultados de benchmarks publicados, el repositorio no registra descargas ni interacciones, y la documentación técnica es mínima, por lo que varias especificaciones se indican como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-2B; detalles no disponibles) |
| Parámetros totales | 2.274.069.824 (2,27 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | italiano (`it`), siciliano (`scn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Qwen3.5-2B |
| Tamaño del repositorio | 9,1 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/Qwen3.5-2B`, por lo que hereda la arquitectura transformer del modelo base. La model card no especifica la configuración interna (número de capas, dimensión oculta, cabezas de atención, mecanismo de atención o tipo de tokenizador), y tampoco se documenta si el ajuste se realizó con LoRA/QLoRA mediante Unsloth o con un entrenamiento completo; el tamaño del repositorio (9,1 GB) es coherente con pesos completos en precisión de 16 bits para 2,27 B de parámetros.

En cuanto a los datos, el autor indica que el ajuste combina ejemplos escritos por Trynakria, conversaciones en italiano procedentes de Aya Dataset y OpenAssistant oasst2, extractos de Wikipedia en italiano y siciliano, y otras fuentes abiertas como Wikivoyage, Wikibooks, Wikiquote, Wikizionario, Dolly y Napizia. Las atribuciones se recogen en el archivo NOTICE del repositorio. No se indica el número de tokens de entrenamiento, la composición porcentual del dataset, la existencia de fases de RLHF/DPO ni hiperparámetros de entrenamiento. El autor menciona que el modelo superó "8/10 pruebas automáticas", sin especificar qué pruebas, con qué metodología ni con qué resultados por ítem.

## Capacidades

- Generación de texto conversacional en italiano y siciliano, con especial atención a contenidos de temática siciliana.
- Comprensión y producción de siciliano (`scn`), una lengua con recursos digitales limitados.
- Conocimiento enciclopédico en italiano y siciliano derivado de extractos de Wikipedia, Wikivoyage, Wikibooks, Wikiquote y Wikizionario.
- Conversación multi-turno de estilo asistente, a partir de datos de OpenAssistant oasst2 y Aya Dataset.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de visión, audio o modo de razonamiento explícito (thinking): no disponible (no documentado).
- Capacidades multilingües más allá de italiano y siciliano: no disponible; el modelo base Qwen3.5-2B es multilingüe, pero el ajuste fino se ha orientado a `it` y `scn` y podría degradar otros idiomas.

## Casos de uso

- Asistencia conversacional en siciliano: el modelo puede mantener diálogos en `scn` para aplicaciones de atención ciudadana o turismo local, un nicho con muy pocos modelos disponibles que cubran esta lengua.
- Preservación y divulgación del patrimonio lingüístico siciliano: generación de textos divulgativos, definiciones o adaptaciones a partir de contenidos de Wikizionario y Wikipedia en siciliano.
- Chatbot para servicios locales en Palermo y Sicilia: respuestas en italiano y siciliano para comercios, turismo o administración local, aprovechando el ajuste con ejemplos de Trynakria.
- Generación de contenido editorial en italiano: redacción de borradores, resúmenes y respuestas a partir de fuentes enciclopédicas abiertas, adecuado por su tamaño reducido para despliegue en una sola GPU.
- Prototipado e investigación sobre lenguas minoritarias: base ligera (2,27 B) para experimentos de fine-tuning adicional, evaluación de transferencia lingüística o comparación con otros ajustes en lenguas de bajos recursos.
- Despliegue en hardware modesto: al tratarse de un modelo de 2,27 B, es viable en GPUs de consumo para demos, entornos de desarrollo y aplicaciones de bajo tráfico donde no se requiere un modelo de mayor escala.
- Filtrado y normalización de texto italiano/siciliano: tareas de reescritura, corrección de estilo o adaptación de registro en pipelines de procesamiento de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona de forma genérica que el modelo superó "8/10 pruebas automáticas", pero no se detalla qué pruebas, la metodología ni los resultados por ítem, por lo que no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por el tamaño (2,27 B de parámetros), en FP16 requeriría aproximadamente 4,5 GB solo para pesos; en cuantización de 8 bits, unos 2,3 GB; en 4 bits, unos 1,2 GB. Estas cifras son estimaciones por tamaño y no proceden de documentación del autor.
- GPU recomendadas: no documentadas. Por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090 y en GPUs de datacenter como A100 o H100 para despliegues de mayor concurrencia.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de GPUs con 8 GB o más en FP16, y en GPUs con 4-6 GB si se cuantiza; no hay confirmación oficial.
- Opciones de despliegue: no documentadas por el autor. Al publicarse solo en safetensors, sería necesario convertirlo a GGUF para llama.cpp/Ollama o a formatos compatibles con vLLM/TGI; no se proporcionan recetas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Calogera-0.0 | 2,27 B | no disponible | it, scn | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-2B (base) | ~2 B | no disponible | multilingüe | según modelo base (no disponible en la información) | Hugging Face |
| Ajustes finos en italiano de modelos ~2 B | variable | variable | it | variable | variable |
| Modelos especializados en siciliano | no disponible | no disponible | scn | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia e idiomas declarados.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla contexto, datos de entrenamiento cuantificados, hiperparámetros ni metodología de evaluación, lo que dificulta reproducir o validar el modelo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad más allá de la afirmación genérica de "8/10 pruebas automáticas".
- Riesgo de alucinación: al ser un ajuste fino sobre un modelo de 2 B con datos enciclopédicos abiertos, es esperable que genere información incorrecta o inventada, especialmente en dominios especializados.
- Sesgos: los datos provienen de fuentes abiertas (Wikipedia, OpenAssistant, Aya, Dolly) y de ejemplos del propio autor; pueden reflejar sesgos de esas fuentes y del enfoque local de Trynakria.
- Cobertura lingüística limitada: el ajuste está orientado a italiano y siciliano; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Contexto desconocido: no se especifica la longitud de contexto efectiva tras el fine-tuning, lo que impide garantizar conversaciones largas o documentos extensos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar el archivo NOTICE y las licencias de las fuentes de datos citadas (Wikipedia, Aya, OpenAssistant, Dolly, etc.) antes de un despliegue en producción.
- Madurez: versión 0.0 con 0 descargas y 0 interacciones en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Sin soporte documentado de tool calling, agentes o cuantizaciones listas para usar; requeriría trabajo adicional de ingeniería para integrarlo en pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arrisx/Calogera-0.0
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Sitio de ArrisX (referencia del autor en la búsqueda web): https://arrisxai.com/
- Repositorio de Aya Dataset: no disponible en la información proporcionada
- OpenAssistant oasst2: no disponible en la información proporcionada
- Dolly: no disponible en la información proporcionada
