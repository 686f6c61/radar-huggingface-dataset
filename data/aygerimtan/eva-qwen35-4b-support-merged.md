# AygerimTan/eva-qwen35-4b-support-merged

## Resumen

Eva Customer Support Manager (merged) es un ajuste fino del modelo base Qwen/Qwen3.5-4B orientado a la triaje de mensajes de atención al cliente. Lo publica el usuario AygerimTan en Hugging Face como un modelo ya fusionado: se entrenó un adaptador LoRA (con QLoRA) por separado y después se integró en el modelo base sin cuantizar, en precisión media (float16 o bfloat16). El resultado es un modelo denso de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) que ocupa 8,4 GB en el repositorio.

El problema que resuelve es muy concreto: dada una consulta de cliente en ruso o kazajo, el modelo debe devolver únicamente un objeto JSON con los campos `category`, `priority`, `sentiment` y `action`. Es decir, no es un asistente conversacional general, sino un clasificador generativo con salida estructurada, pensado para alimentar reglas de enrutado y escalado dentro de un sistema de soporte mayor.

Su relevancia es sobre todo práctica y metodológica: demuestra un flujo completo de ajuste eficiente (LoRA/QLoRA) sobre un modelo pequeño que cabe en hardware de consumo y que produce salida parseable directamente por código. Conviene señalar que es un prototipo educativo con un conjunto de datos muy reducido (629 ejemplos de entrenamiento), sin licencia declarada, sin benchmarks publicados y con cero descargas y cero "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta de la librería: `qwen3_5_text`); detalles de capas, cabezas y posición no disponibles |
| Parámetros totales | 4.205.751.296 (4,2 B aprox.) |
| Parámetros activos | No aplica: modelo denso, no se declara arquitectura MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No se incluyen pesos cuantizados; la fusión se hizo en `float16` o `bfloat16` y la model card indica que la cuantización puede realizarse después para despliegue GGUF |
| Idiomas soportados | Ruso y kazajo (idiomas de entrenamiento declarados en las etiquetas); el resto de capacidades multilingües del modelo base no están documentadas |
| Licencia | No disponible (la model card no declara licencia; el modelo base Qwen sí tiene sus propios términos) |
| Formato de pesos | safetensors (librería `transformers`); repositorio de 8,4 GB |

Otros datos: pipeline `text-generation`, creado el 19 de septiembre de 2026, actualizado el mismo día, 0 descargas y 0 "likes", compatible con `endpoints_compatible`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, tomado como base sin cambios estructurales y adaptado mediante un adaptador LoRA entrenado con QLoRA. El adaptador se fusionó posteriormente en el modelo base sin cuantizar, en precisión media (`float16` o `bfloat16`), de modo que el repositorio contiene pesos completos y no una combinación base + adaptador. No se documentan innovaciones de arquitectura propias: no hay atención lineal, decodificación especulativa ni mecanismos híbridos SSM declarados, y tampoco se especifican número de capas, dimensión oculta, cabezas de atención ni estrategia posicional.

En cuanto a los datos, la model card declara un conjunto muy pequeño y dividido de forma explícita: 629 ejemplos de entrenamiento, 207 de validación y 215 de test, con la aclaración de que el split de test no se usó durante el entrenamiento. La tarea objetivo es siempre la misma: a partir de un mensaje de cliente en ruso o kazajo, generar exclusivamente un JSON con cuatro campos (`category`, `priority`, `sentiment`, `action`). No se indica número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación posterior. El identificador del adaptador original aparece como `artifacts\eva-qwen-lora`, una ruta local del proyecto.

## Capacidades

- Generación de texto restringida a una tarea: producir un objeto JSON con los campos `category`, `priority`, `sentiment` y `action` a partir de un mensaje de cliente.
- Salida estructurada: el formato de respuesta es JSON parseable, lo que permite consumirlo directamente desde código sin post-procesado heurístico.
- Procesamiento de mensajes de soporte al cliente en ruso y kazajo.
- Clasificación por categoría y por prioridad, además de análisis de sentimiento, en una sola pasada de generación.
- Sugerencia de acción a seguir (`action`), pensada para alimentar reglas de negocio o de escalado.
- Capacidades del modelo base Qwen3.5-4B (razonamiento general, código, matemáticas, tool calling, modo "thinking"): no verificadas ni documentadas para esta fusión concreta; el ajuste se orientó a una única tarea de clasificación.
- Soporte de agentes, multi-step reasoning, visión o audio: no disponible / no declarado.
- Capacidades multilingües más allá de ruso y kazajo: no documentadas.

## Casos de uso

- Triaje automático de tickets de soporte en ruso y kazajo: el modelo recibe el texto del cliente y devuelve categoría, prioridad, sentimiento y acción, lo que permite enrutar cada caso al equipo correspondiente sin intervención humana previa.
- Enrutado por categoría en helpdesks tipo Zendesk o Freshdesk: la salida `category` se mapea a colas de trabajo (facturación, envíos, incidencias técnicas) y la `priority` define el orden de atención en la cola.
- Detección temprana de clientes insatisfechos: el campo `sentiment` permite disparar alertas cuando el tono es negativo, por ejemplo para que un agente sénior revise el caso antes de que escale.
- Pre-clasificación para equipos humanos: el campo `action` funciona como recomendación operativa que el agente valida o corrige, reduciendo el tiempo de lectura inicial de cada mensaje.
- Integración en pipelines con salida JSON estricta: al devolver solo un objeto JSON, el resultado se puede insertar directamente en un flujo de orquestación (n8n, Airflow, funciones serverless) sin necesidad de expresiones regulares frágiles.
- Prototipado e investigación sobre ajuste eficiente: sirve como ejemplo reproducible de flujo QLoRA + fusión de adaptador sobre un modelo de 4 B en hardware de consumo, útil en entornos docentes o de experimentación.
- Filtro previo a reglas de seguridad y escalado: dado su carácter de prototipo, puede usarse como primera capa de clasificación cuyo resultado se somete después a las reglas de seguridad, escalado y revisión humana del sistema principal.
- Adaptación a otros dominios con pocos datos: el mismo esquema (629 ejemplos, adaptador LoRA) es replicable para verticales como banca, telecomunicaciones o logística en idiomas minoritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, precisión de formato JSON ni comparaciones con otros modelos, y tampoco se han encontrado resultados en la búsqueda web realizada (cuyos resultados no eran relevantes para este modelo). Los únicos datos cuantitativos aportados por el autor son los tamaños de los splits: 629 ejemplos de entrenamiento, 207 de validación y 215 de test, sin métricas asociadas.

## Requisitos de hardware

- Peso de los pesos en `float16`/`bfloat16`: aproximadamente 8,4 GB (coincide con el tamaño del repositorio).
- VRAM estimada para inferencia en precisión media: unos 10-12 GB contando pesos, caché KV y overhead del runtime en contextos cortos. Estimación orientativa, no publicada por el autor.
- VRAM estimada con cuantización de 8 bits: del orden de 4,5-5 GB. Con cuantización de 4 bits (Q4_K_M y similares): del orden de 2,6-3,5 GB. Estimaciones orientativas.
- GPU recomendadas: NVIDIA A100, H100, L40S, A10G o L4 para despliegue en servidor; RTX 4090, RTX 4080, RTX 4070 o RTX 3090 para estaciones de trabajo.
- Cabe en GPU de consumo: sí. En `float16` necesita 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en cuantización de 4 bits puede ejecutarse en tarjetas de 8 GB e incluso de 6 GB, con menor margen de contexto.
- Inferencia en CPU: viable con versiones GGUF cuantizadas, aunque con latencias altas y throughput bajo; no se publican cifras.
- Opciones de despliegue: `transformers` (método indicado por el autor en la model card), vLLM, TGI, SGLang y, previa conversión a GGUF, llama.cpp, Ollama y LM Studio. La model card menciona explícitamente la posibilidad de cuantizar para despliegue GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AygerimTan/eva-qwen35-4b-support-merged | 4,2 B | No disponible | Triaje de soporte con salida JSON en ruso y kazajo | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | Del orden de 4 B (el derivado declara 4,2 B) | No disponible | Modelo generalista de generación de texto | Términos propios de Qwen (no verificados aquí) | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens nativos (ampliable con YaRN) | Asistente generalista e instrucciones | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Asistente generalista multilingüe | Licencia comunitaria de Llama 3.2 | Hugging Face, ampliamente desplegado |

La comparación directa con alternativas generalistas no es del todo justa: el modelo de esta ficha está especializado en una única tarea de clasificación con salida JSON y no se han publicado métricas que permitan situarlo frente a ellas en calidad. Los datos de Qwen2.5-3B-Instruct y Llama-3.2-3B-Instruct provienen de su documentación pública y se incluyen solo como referencia de tamaño, contexto y licencia.

## Limitaciones y advertencias

- Prototipo educativo: la propia model card lo define como tal y advierte de que no es un sistema de diagnóstico médico; no debe usarse para tomar decisiones médicas autónomas.
- Conjunto de datos muy reducido (629 ejemplos de entrenamiento), lo que limita la generalización a categorías, tonos y dominios no representados en el corpus.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribución ni atribución. Antes de cualquier uso en producción hay que aclarar la licencia del modelo base Qwen3.5-4B y la del propio ajuste.
- Sin benchmarks publicados: no hay evidencia cuantitativa de exactitud, F1 por clase ni tasa de JSON válido.
- Riesgo de alucinación en los valores de los campos: al ser un modelo generativo, puede producir categorías, prioridades, sentimientos o acciones fuera del conjunto esperado, o JSON malformado. Es imprescindible validar el esquema y rechazar las salidas inválidas.
- Cobertura lingüística limitada a ruso y kazajo según las etiquetas; el comportamiento en castellano u otros idiomas no está documentado.
- Longitud de contexto no especificada, por lo que no se puede garantizar el manejo de hilos de conversación largos ni de historiales extensos.
- Sesgos: no se ha publicado ningún análisis de sesgo y el corpus de entrenamiento no está descrito, por lo que se desconocen los sesgos de género, origen, dialecto o registro que puedan haberse heredado del modelo base.
- La model card exige que la salida pase por las reglas de seguridad y escalado del proyecto; sin esa capa, el modelo no debe actuar de forma autónoma.
- Madurez mínima en el ecosistema: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya validado su comportamiento en producción.
- Trazabilidad limitada del adaptador original, referenciado como ruta local (`artifacts\eva-qwen-lora`), no como repositorio público.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AygerimTan/eva-qwen35-4b-support-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio del ajuste: no disponible
- Demo o espacio de inferencia: no disponible
- Resultados de la búsqueda web: no se encontró información relevante sobre este modelo; los resultados devueltos correspondían a estadísticas de fútbol y no guardan relación con la ficha.
