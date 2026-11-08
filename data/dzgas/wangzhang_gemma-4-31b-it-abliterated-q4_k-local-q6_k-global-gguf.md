# DZgas/wangzhang_gemma-4-31B-it-abliterated-Q4_K-local-Q6_K-global.gguf

## Resumen

Esta ficha describe una cuantización GGUF derivada del modelo `wangzhang/gemma-4-31B-it-abliterated`, publicada por el usuario DZgas bajo el identificador `DZgas/wangzhang_gemma-4-31B-it-abliterated-Q4_K-local-Q6_K-global.gguf`. No se trata de un modelo original entrenado desde cero, sino de un artefacto de pesos comprimidos pensado para inferencia local con llama.cpp. El modelo base es una variante "abliterated" del supuesto Gemma 4 de 31B en su versión instruct, es decir, una modificación que elimina o atenúa los mecanismos de rechazo del modelo original.

El interés de esta publicación radica en su esquema de cuantización mixta: la mayor parte de las capas se cuantizan en Q4_K, mientras que las capas de atención y FFN de un subconjunto de bloques (5, 11, 17, 23, 29, 35, 41, 47, 53 y 59) se mantienen en Q6_K, y los embeddings se conservan también en Q6_K. Según la model card, esto busca preservar calidad en capas consideradas críticas a cambio de un tamaño mayor. El repositorio ocupa 168,6 GB, un dato que no cuadra con el número de parámetros declarado (30.697.345.596, aproximadamente 30,7B), lo que sugiere que el repo contiene múltiples ficheros o artefactos adicionales además del GGUF principal.

La información disponible es muy escasa: la model card apenas contiene una instrucción de uso, un comando de cuantización y la frase "Digital God". No hay datos sobre licencia, idiomas, contexto, benchmarks ni detalles de entrenamiento del modelo base. Todo lo que sigue se limita a lo que puede inferirse de los metadatos y de la información proporcionada, marcando explícitamente como "no disponible" aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma, presumiblemente transformer decoder-only) |
| Parámetros totales | 30.697.345.596 (≈30,7B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K (mayoría de capas), Q6_K (capas de atención y FFN de bloques 5, 11, 17, 23, 29, 35, 41, 47, 53 y 59; embeddings en Q6_K) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `wangzhang/gemma-4-31B-it-abliterated` más allá de su nombre, que sugiere una familia Gemma de 31B en variante instruct y con técnicas de abliteration aplicadas. La abliteration es una técnica de modificación de pesos que busca eliminar la dirección de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder ciertas peticiones; no implica un reentrenamiento completo, sino una edición de los pesos orientada a suprimir comportamientos de negativa.

El artefacto publicado por DZgas no entrena nada: aplica un pipeline de cuantización con `llama-quantize.exe` sobre un fichero `gemma-4-31B-it-bf16.gguf`. El comando documentado en la model card especifica reglas `--tensor-type` para forzar Q6_K en atención y FFN de determinados bloques y Q4_K en el resto, con embeddings en Q6_K. La model card recomienda usar exclusivamente llama.cpp build b9918 y no versiones más recientes, lo que apunta a problemas de compatibilidad del formato o de la lógica de cuantización mixta con builds posteriores. No consta información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline implícito de modelo instruct sugieren uso en diálogo multi-turno.
- Razonamiento e instrucciones: al derivar de una variante `-it`, cabe esperar seguimiento de instrucciones, aunque no hay documentación que lo confirme.
- Modo "abliterated": el modelo base está modificado para reducir rechazos, lo que cambia el perfil de comportamiento respecto al Gemma original.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el GGUF puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo: el formato GGUF y la cuantización mixta Q4_K/Q6_K permiten ejecutar un modelo de ~30,7B en hardware de consumo o semiprofesional usando llama.cpp, con mayor fidelidad en capas críticas que una cuantización Q4 uniforme.
- Experimentación con modelos sin filtros de rechazo: investigadores interesados en estudiar el comportamiento de modelos abliterated pueden desplegar esta variante para comparar respuestas frente al Gemma original en tareas de análisis de sesgos y alineación.
- Servicio conversacional autoalojado: gracias al tag `endpoints_compatible`, puede desplegarse detrás de la infraestructura de endpoints de Hugging Face o de un servidor llama.cpp propio para prototipos de chat.
- Evaluación de esquemas de cuantización mixta: el patrón Q4_K-local/Q6_K-global documentado en la model card sirve como caso de estudio para medir la degradación de calidad frente a cuantizaciones uniformes en modelos de ~30B.
- Generación de texto en pipelines offline: entornos con requisitos de privacidad o sin conectividad pueden usar el GGUF con llama.cpp para resumen, redacción o clasificación de texto, siempre que se validen las capacidades reales del modelo base.
- Reproducción de experimentos de cuantización: el comando `llama-quantize` incluido permite replicar el proceso sobre otros checkpoints bf16 de la misma familia, útil para equipos que quieran generar sus propios GGUF con la misma receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~30,7B en Q4_K ronda los 18-20 GB de pesos, y la mezcla con capas Q6_K eleva el total; el repositorio declara 168,6 GB, cifra que no corresponde a un único fichero GGUF y que impide dar una estimación fiable sin inspeccionar los artefactos.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar necesidad de GPUs con 24 GB o más (RTX 3090/4090, A6000, A100) o reparto entre varias GPUs, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo?: no confirmado. Un Q4_K puro de ~30B suele caber ajustadamente en 24 GB; la mezcla Q6_K en capas seleccionadas puede exceder ese margen.
- Opciones de despliegue: llama.cpp (build b9918 recomendado explícitamente por el autor; se advierte de no usar builds más recientes), y por extensión servidores compatibles con GGUF. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DZgas/wangzhang_gemma-4-31B-it-abliterated-Q4_K-local-Q6_K-global.gguf | ~30,7B | no disponible | GGUF Q4_K/Q6_K mixta | no disponible | Hugging Face, 0 descargas |
| wangzhang/gemma-4-31B-it-abliterated (base) | ~30,7B (presumible) | no disponible | safetensors (presumible) | no disponible | Hugging Face |
| wangzhang/gemma-4-31B-it-abliterated-GGUF | no disponible | no disponible | GGUF | no disponible | Hugging Face |
| DZgas/gemma-4-31B-it-Q4_K-local-Q6_K-global-GGUF | no disponible | no disponible | GGUF Q4_K/Q6_K mixta | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas como para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta licencia, lo que impide confirmar si el uso comercial está permitido; hay que remitirse a la licencia del modelo base original de Gemma, que no se detalla aquí.
- El modelo es "abliterated": se ha modificado para reducir rechazos, lo que puede aumentar la probabilidad de generar contenido dañino, inexacto o fuera de política. No es adecuado para producción orientada al público sin filtros adicionales.
- No hay información sobre sesgos, idiomas soportados ni calidad multilingüe; cualquier despliegue en producción requiere evaluación propia.
- Riesgo de alucinación no cuantificado: no se han publicado benchmarks ni evaluaciones de fidelidad.
- La recomendación de usar solo llama.cpp b9918 y no builds más recientes sugiere posibles incompatibilidades o regresiones con versiones posteriores; conviene fijar la versión en entornos reproducibles.
- El tamaño del repositorio (168,6 GB) es inconsistente con un único GGUF de ~30B y sugiere la presencia de múltiples ficheros o artefactos; verificar antes de descargar para no consumir almacenamiento innecesario.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No hay información sobre longitud de contexto real; no asumir ventanas largas sin verificar.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/DZgas/wangzhang_gemma-4-31B-it-abliterated-Q4_K-local-Q6_K-global.gguf
- Repositorio GGUF del mismo autor: https://huggingface.co/DZgas/gemma-4-31B-it-Q4_K-local-Q6_K-global-GGUF
- Modelo base: https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated
- GGUF del modelo base: https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated-GGUF
