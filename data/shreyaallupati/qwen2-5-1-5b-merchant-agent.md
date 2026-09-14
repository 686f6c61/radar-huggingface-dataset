# Shreyaallupati/qwen2.5-1.5b-merchant-agent

## Resumen

Shreyaallupati/qwen2.5-1.5b-merchant-agent es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Shreyaallupati en HuggingFace. Se trata de un modelo de generación de texto de tipo decoder-only con 1.543.714.304 parámetros, derivado del checkpoint cuantizado a 4 bits `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit` y entrenado con la librería Unsloth junto con TRL de HuggingFace, que según la model card permite un entrenamiento el doble de rápido. El repositorio ocupa 3,1 GB y la licencia declarada es Apache-2.0.

El interés de esta ficha es limitado pero claro: se trata de un modelo pequeño (1,5B parámetros) pensado para ejecutarse en hardware de consumo, con licencia permisiva y con un nombre que sugiere un uso orientado a agentes en el ámbito comercial (`merchant-agent`). No obstante, la model card es extremadamente escasa: no documenta el conjunto de datos de ajuste, los hiperparámetros, el número de tokens de entrenamiento, ni resultados de evaluación. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y los metadatos indican una creación en septiembre de 2026.

Por tanto, esta ficha debe leerse como una descripción del artefacto publicado y de su base arquitectónica heredada (Qwen2), marcando explícitamente todo aquello que no está documentado por el autor. Es un candidato razonable para prototipado local, experimentación con agentes conversacionales y tareas de generación de texto en inglés, pero no hay evidencia publicada que respalde un rendimiento diferencial frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, `Qwen2ForCausalLM`), heredada del modelo base |
| Parámetros totales | 1.543.714.304 (dato de los pesos safetensors del repositorio) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens según la documentación pública del modelo base Qwen2.5-1.5B-Instruct; no confirmado en la model card de este fine-tune |
| Tipos de cuantización | El repositorio publica únicamente safetensors (3,1 GB, coherente con precisión de 16 bits). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`), según los metadatos de HuggingFace. No se declaran otros idiomas para este fine-tune |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con atención por grupos de consultas (GQA) y embeddings ligados a la cabeza de salida, tal como corresponde a la configuración pública de Qwen2.5-1.5B-Instruct. La model card de este repositorio no aporta ninguna modificación arquitectónica, por lo que se asume que la topología es idéntica a la del checkpoint de partida. El ajuste se realizó sobre una versión del modelo base cuantizada a 4 bits (bitsandbytes), lo que implica que el entrenamiento se hizo con adaptadores de bajo rango (típicamente LoRA/QLoRA) mediante Unsloth y la librería TRL.

No hay información disponible sobre el conjunto de datos de ajuste, el número de tokens de entrenamiento, la composición del corpus, la existencia de fases de RLHF o DPO, ni los hiperparámetros utilizados. Tampoco se documenta si el ajuste se orientó realmente a tareas de comercio electrónico o de agentes de compra: el nombre del repositorio (`merchant-agent`) sugiere esa intención, pero no existe evidencia publicada que lo confirme. La única innovación técnica mencionada de forma explícita es el uso de Unsloth para acelerar el entrenamiento aproximadamente 2 veces respecto a un flujo estándar.

## Capacidades

Se listan únicamente las capacidades respaldadas por la información disponible; el resto del comportamiento procede del modelo base y debe validarse empíricamente antes de usarlo en producción.

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones y formato de chat (pipeline `text-generation`, tag `conversational`).
- Razonamiento básico y resolución de tareas sencillas de comprensión y generación, limitado por el tamaño de 1,5B parámetros.
- Compatibilidad declarada con `text-generation-inference` y con `endpoints_compatible`, lo que facilita su despliegue en HuggingFace Inference Endpoints.
- Capacidad potencial de tool calling y de razonamiento multi-paso: el modelo base Qwen2.5-Instruct la incorpora, pero no está documentada ni verificada para este fine-tune concreto.
- Capacidades multilingües: no declaradas para este modelo; los metadatos solo listan inglés.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponibles.

## Casos de uso

- Atención al cliente en comercio electrónico: el modelo puede gestionar conversaciones multi-turno sobre estado de pedidos, políticas de devolución y disponibilidad de producto. Es adecuado por su bajo coste de inferencia y porque su ventana de 32.768 tokens (heredada del base) permite incluir el historial de la conversación y fragmentos de la política comercial sin truncar.
- Extracción estructurada de datos de pedidos: con plantillas de prompt adecuadas puede convertir texto libre de clientes (direcciones, referencias de producto, cantidades) en JSON. Conviene validar el esquema de salida con un parser y reintentos, dado el tamaño reducido del modelo.
- Clasificación y enrutado de tickets de soporte: asignar cada consulta a una categoría (envíos, facturación, devoluciones, incidencias técnicas) y derivarla al equipo correspondiente. La latencia baja en GPU de consumo lo hace viable para procesar colas de tickets por lotes.
- Generación de descripciones de producto y metadatos SEO: redactar descripciones a partir de fichas técnicas y atributos, con control de tono y longitud mediante instrucciones. Requiere revisión humana por riesgo de alucinación de especificaciones.
- Asistente embebido en tienda online con RAG: combinado con un índice vectorial de documentación y catálogo, puede responder preguntas frecuentes citando el contexto recuperado. Su tamaño permite desplegarlo en el mismo nodo que el motor de recuperación.
- Prototipado y evaluación de pipelines de agentes en local: sirve como modelo de pruebas para validar orquestadores, formatos de tool calling y estrategias de prompting antes de escalar a modelos mayores, con un coste de hardware muy bajo.
- Generación de respuestas para campañas de correo y notificaciones: redacción de variantes de mensajes transaccionales (confirmaciones, recordatorios de carrito) manteniendo el estilo de marca mediante ejemplos en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni la model card ni los metadatos del repositorio incluyen evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite. Tampoco hay comparaciones con el modelo base que permitan estimar si el ajuste fino ha degradado o mejorado sus capacidades. Cualquier cifra que se utilice para decidir su adopción deberá obtenerse mediante una evaluación propia.

## Requisitos de hardware

- VRAM para inferencia en precisión de 16 bits: aproximadamente 3,1 GB solo para los pesos; con caché KV y activaciones, unos 4-5 GB en contexto corto y lote pequeño.
- VRAM para inferencia en 4 bits: en torno a 1,0-1,5 GB de pesos, más la caché KV, lo que permite ejecutarlo cómodamente por debajo de 3 GB.
- Caché KV estimada: alrededor de 28 KB por token en 16 bits, según la configuración pública del modelo base (28 capas, 2 cabezas KV, dimensión de cabeza 128); unos 0,9 GB para los 32.768 tokens de contexto completo. Es una estimación derivada de la configuración del base, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070 o superiores. En GPUs de centro de datos (A100, H100, L40S) el modelo ocupa una fracción mínima de memoria y el cuello de botella pasa a ser el lote y la latencia de red.
- Cabe en GPU de consumo: sí, con holgura. Incluso es viable en CPU o en iGPU con cuantización de 4 bits, aunque con latencias mucho mayores.
- Opciones de despliegue: `transformers` (librería declarada en el repositorio), Text Generation Inference (TGI), vLLM y HuggingFace Inference Endpoints (tag `endpoints_compatible`). Para ejecución en CPU o en equipos modestos habría que convertir los pesos a GGUF y usar llama.cpp u Ollama, conversión no publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shreyaallupati/qwen2.5-1.5b-merchant-agent | 1,543B | 32.768 tokens (heredado del base) | Apache-2.0 | HuggingFace, solo safetensors | Fine-tune sin documentación de datos ni evaluación |
| Qwen2.5-1.5B-Instruct (base) | 1,543B | 32.768 tokens | Apache-2.0 | HuggingFace, con versiones GGUF/AWQ/GPTQ de la comunidad | Modelo de referencia de la familia; documentación completa y benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, amplio ecosistema de cuantizaciones | Ventana de contexto mucho mayor; licencia con restricciones para grandes despliegues |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache-2.0 | HuggingFace | Alternativa de tamaño similar con contexto más corto |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Gemma Terms of Use | HuggingFace | Mayor número de parámetros; licencia con condiciones de uso adicionales |

Los datos de contexto y licencia de los modelos comparados proceden de sus fichas públicas y conviene verificarlos antes de tomar una decisión de adopción. En la información disponible no hay benchmarks que permitan comparar el rendimiento real de este fine-tune frente a las alternativas.

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe el conjunto de datos, el procedimiento de ajuste, los hiperparámetros ni las evaluaciones. No es posible reproducir el entrenamiento ni auditar qué aprendió el modelo.
- Riesgo elevado de alucinación en datos factuales (precios, plazos de envío, disponibilidad de stock). Con 1,5B parámetros la tasa de error en tareas de conocimiento es alta; cualquier uso comercial debe apoyarse en recuperación de contexto y validación posterior.
- El nombre `merchant-agent` sugiere una especialización en dominio comercial, pero no hay evidencia publicada que la respalde. No debe asumirse que el modelo ha sido entrenado con datos de comercio electrónico.
- Idiomas: solo se declara inglés. El comportamiento en castellano no está garantizado y probablemente sea notablemente peor que en inglés.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o equidad. Al derivar de Qwen2.5, hereda los sesgos presentes en los datos de preentrenamiento del modelo base, que tampoco están auditados en esta ficha.
- Licencia Apache-2.0: permite uso comercial y modificación, pero quien despliegue el modelo es responsable de cumplir las condiciones de la licencia del modelo base y de las herramientas utilizadas en el ajuste. Conviene revisar los términos de Qwen y de Unsloth si se redistribuye.
- Formato único: solo se distribuyen pesos safetensors. Para entornos con restricciones de memoria habrá que generar las cuantizaciones GGUF o AWQ por cuenta propia y validar que la calidad se mantiene.
- Estado del repositorio: 0 descargas y 0 likes, sin señales de mantenimiento, versionado ni soporte por parte del autor. No es un artefacto con comunidad detrás.
- Producción: no recomendado como componente crítico sin una evaluación propia previa que mida exactitud en la tarea objetivo, tasa de alucinación y comportamiento ante entradas adversas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shreyaallupati/qwen2.5-1.5b-merchant-agent
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Paper y documentación de Qwen2.5: no disponible en la información proporcionada
- Búsqueda web: los resultados recuperados no guardan relación con este modelo (conversión de formatos de partituras, competiciones de esports y una guía de Excel), por lo que no se incluye ninguno.
