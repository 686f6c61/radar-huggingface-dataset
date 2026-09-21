# llm-semantic-router/Decision-1.0-Nox

## Resumen

Decision-1.0-Nox es un modelo de decisión (no un modelo generativo de propósito general) desarrollado por llm-semantic-router y publicado bajo licencia Apache 2.0. Se construye mediante fine-tuning sobre Qwen/Qwen3.5-4B y su función es recibir un estado, una pregunta y un conjunto de respuestas candidatas, y devolver una decisión etiquetada en tiempo de ejecución, junto con su distribución de probabilidad. Cuenta con 4,208 B de parámetros y un presupuesto de 16.384 tokens para el conjunto completo de estado, pregunta y candidatos.

El modelo cubre tres tipos nativos de tarea: Choice (enrutar una petición o elegir entre 2 y 255 acciones, devolviendo el ID seleccionado y la distribución), Noul (comprobar una condición contra la evidencia suministrada, devolviendo P(true)) y Score (aplicar entre 2 y 10 descripciones de rúbrica ordenadas, devolviendo el índice esperado y su distribución). Esta especialización lo hace relevante para pipelines de enrutado semántico, clasificación con evidencia y evaluación por rúbricas, donde un LLM generativo sería más caro y menos determinista.

La versión publicada (revisión v1.2) obtiene una media de 74,20 % en la evaluación de cuatro paneles, 1,27 puntos por encima de su predecesor inmediato (Nox v1.1, 72,93 %). El modelo está validado sobre GPU AMD gfx942 con ROCm; CPU y MPS no están soportados y NVIDIA no está cualificado. El repositorio ocupa 25,3 GB, tiene 0 descargas y 4 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal Qwen3.5 (backbone de texto con atención gated linear y atención completa) más cabeza compartida de candidatos |
| Parametros totales | 4,208 B |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens para el conjunto completo de estado + pregunta + candidatos; el desbordamiento se rechaza |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) y chino (zh); evaluados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código propio (`custom-code`, PyTorch) |
| Tamano del repositorio | 25,3 GB |
| Modelo base | Qwen/Qwen3.5-4B (relación: finetune) |
| Revisión evaluada | v1.2 |
| Tipos de tarea | Choice (2–255 opciones), Noul (P(true)), Score (2–10 rúbricas ordenadas) |

## Arquitectura y entrenamiento

El modelo parte de un backbone de texto causal Qwen3.5-4B que combina atención lineal con compuerta (gated linear attention) y atención completa. Sobre ese backbone se añade una cabeza compartida de candidatos que lee los extremos (endpoints) de cada candidato y el vector de consulta final. Cada pregunta se resuelve en un único forward pass y las preguntas se ejecutan de forma independiente en lotes de ocho. La arquitectura se describe como un decodificador de decisión, adaptado de Qwen3.5-4B.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan las cuantizaciones publicadas ni los pasos exactos del proceso de fine-tuning. El modelo incorpora un perfil de normalización empaquetado que se carga automáticamente, y se recomienda usar un proceso de Python nuevo al cambiar de perfil.

## Capacidades

- Decisión de elección múltiple: selecciona entre 2 y 255 acciones o rutas posibles y devuelve el ID seleccionado junto con la distribución completa sobre los candidatos.
- Verificación de condiciones: el tipo Noul evalúa una condición contra la evidencia suministrada y devuelve la probabilidad P(true).
- Puntuación por rúbrica: el tipo Score aplica entre 2 y 10 descripciones ordenadas y devuelve el índice esperado y su distribución.
- Procesamiento de contexto largo: admite hasta 16.384 tokens para el conjunto completo de estado, pregunta y candidatos en una sola petición.
- Ejecución por lotes: las preguntas se procesan de forma independiente en lotes de ocho.
- Multilingüe limitado: evaluado en inglés y chino.
- Salida probabilística: además de la etiqueta, entrega distribuciones que permiten aplicar umbrales y estrategias de abstención.
- No incluye tool calling, function calling, agentes autónomos, visión ni audio según la información disponible.
- No realiza recuperación en vivo: evalúa únicamente la evidencia que se le suministra.

## Casos de uso

- Enrutado semántico de peticiones: dado un estado de conversación, una pregunta y una lista de rutas o acciones posibles, el modelo devuelve la ruta seleccionada y su distribución. Es adecuado porque el tipo Choice admite de 2 a 255 acciones en un único forward pass, lo que reduce coste y latencia frente a un LLM generativo.
- Clasificación de intenciones con evidencia: en atención al cliente, se puede suministrar el historial reciente y la consulta del usuario como estado, formular la pregunta de clasificación y ofrecer las categorías existentes como candidatos, obteniendo además la distribución para medir la confianza.
- Guardarraíles y validación de condiciones: el tipo Noul permite comprobar afirmaciones contra la evidencia aportada (por ejemplo, verificar si un texto cumple una política concreta) y obtener P(true) para decidir si se bloquea o se escala la solicitud.
- Evaluación automatizada con rúbricas: el tipo Score permite aplicar entre 2 y 10 niveles ordenados a una respuesta generada, devolviendo el índice esperado y su distribución, útil en pipelines de control de calidad de datos o de salidas de modelos.
- Triaje documental: clasificar documentos entrantes en un conjunto acotado de categorías usando el texto y los metadatos como estado, con la ventana de 16.384 tokens para documentos de cierta extensión.
- Moderación con umbral dinámico: al devolver una distribución sobre decisiones, se puede fijar un umbral de confianza y derivar los casos dudosos a revisión humana.
- Selección de herramienta en agentes multi-paso: integrado como componente de decisión en un orquestador, elige la siguiente acción entre un conjunto finito de herramientas o siguientes pasos.
- Encaminamiento entre backends de modelos: decidir si una consulta debe ir a un modelo pequeño y barato o a uno grande y costoso, usando la distribución de probabilidad como señal de confianza.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Exactitud (%), sobre 2.720 decisiones; cada panel aporta una cuarta parte de la media y conserva los pesos originales de su familia o fuente. La negrita del original marca la puntuación más alta de cada columna.

| Modelo | Media ↑ | Decisions | Composition | Reading | Inference |
|---|---:|---:|---:|---:|---:|
| Jev · 1.13.0 | 82,45 | 79,10 | 66,38 | 94,53 | 89,79 |
| Nox · v1.2 (esta versión) | 74,20 | 83,21 | 51,08 | 78,12 | 84,38 |
| Nox · v1.1 (anterior) | 72,93 | 82,85 | 51,25 | 78,44 | 79,17 |
| Decider · 2B | 71,75 | 64,01 | 46,58 | 92,03 | 84,38 |
| Qwen3.5 · 4B · sin ajustar | 70,25 | 69,89 | 43,33 | 87,97 | 79,79 |
| Qwen3.5 · 2B · sin ajustar | 60,54 | 57,12 | 39,00 | 73,75 | 72,29 |
| Laya · Upstream default | 52,44 | 57,01 | 37,75 | 51,25 | 63,75 |

La model card indica que existe un documento EVALUATION.md con los métodos, la incertidumbre y el conjunto completo de resultados por tarea, y un documento QUESTION-SCALING.md con latencias p95 y de los tres tipos nativos. Los valores numéricos de latencia y escalado no están incluidos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 8,4 GB solo para los pesos de 4,208 B de parámetros, más overhead de activaciones, caché KV (hasta 16.384 tokens de contexto) y el perfil de normalización. En fp32 la estimación sería de unos 16,8 GB. Son estimaciones a partir del número de parámetros, no cifras publicadas por el autor.
- El repositorio ocupa 25,3 GB, un tamaño superior al de una única copia en bf16 de los pesos, lo que sugiere que incluye material adicional además de los pesos del modelo. No se detalla su desglose.
- GPU validadas: AMD gfx942 (arquitectura CDNA 3, familia MI300) con ROCm. Las mediciones de latencia citadas se realizaron sobre esa misma GPU física.
- GPU NVIDIA: no cualificadas por el autor. No se indica soporte para A100, H100 ni RTX 4090.
- GPU de consumo: por tamaño de pesos, una tarjeta con 12 GB o más podría alojarlos en bf16, pero el autor declara no cualificado el soporte en esas plataformas, por lo que no hay garantía de funcionamiento.
- CPU y MPS: explícitamente no soportados.
- Opciones de despliegue: el modelo requiere código propio (`custom-code`) y se carga mediante `DecisionModel.from_pretrained("/model", local_files_only=True)`. La model card remite a una configuración de contenedor ROCm descrita en RUNTIME.md. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card incluye gráficas de latencia por petición medidas en AMD gfx942 (30 peticiones medidas por punto, en tres bloques, incluyendo tokenización e inferencia y excluyendo carga y red), pero los valores concretos no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media (4 paneles) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-1.0-Nox v1.2 | 4,208 B | 16.384 tokens | 74,20 | Apache 2.0 | HuggingFace, revisión v1.2 |
| Nox v1.1 | no disponible | no disponible | 72,93 | no disponible | predecesor de la misma familia |
| Jev 1.13.0 | no disponible | no disponible | 82,45 | no disponible | familia relacionada, mejor media global |
| Decider 2B | 2 B | no disponible | 71,75 | no disponible | citado como comparativa |
| Qwen3.5-4B sin ajustar | 4 B | no disponible | 70,25 | no disponible | modelo base público |
| Qwen3.5-2B sin ajustar | 2 B | no disponible | 60,54 | no disponible | modelo base público |
| Laya Upstream default | no disponible | no disponible | 52,44 | no disponible | citado como comparativa |

Nox v1.2 lidera la columna Decisions (83,21) frente a todos los comparadores, pero queda por detrás de Jev 1.13.0 en media global, Composition, Reading e Inference, y por detrás de Decider 2B y de Qwen3.5-4B sin ajustar en Reading. La información disponible no incluye parámetros, contexto ni licencia de los modelos comparadores salvo en los casos indicados.

## Limitaciones y advertencias

- Naturaleza no generativa: el modelo no produce texto libre, solo decisiones, etiquetas y distribuciones. No debe evaluarse como un LLM conversacional.
- Confianza no equivale a corrección: la propia model card advierte de que la probabilidad devuelta no garantiza que la decisión sea correcta.
- Sin recuperación en vivo: evalúa únicamente la evidencia suministrada en la petición; si la evidencia es incompleta, la decisión lo será también.
- Límite estricto de contexto: el estado, la pregunta y los candidatos deben caber en 16.384 tokens; cualquier desbordamiento se rechaza en lugar de truncarse.
- Cobertura de idiomas limitada a inglés y chino evaluados; no hay datos sobre otros idiomas.
- Soporte de plataformas muy restringido: CPU y MPS no soportados, NVIDIA no cualificado, solo AMD gfx942 validado.
- Dependencia de código propio: requiere el paquete `decision` y su API específica, lo que complica la integración con infraestructura de servicio estándar.
- Gestión de perfiles: es necesario usar un proceso de Python nuevo al cambiar de perfil de normalización.
- Riesgo de sesgo y alucinación: no se publican análisis de sesgo ni tasas de error por subgrupo; al ser un modelo de decisión, los errores se manifiestan como clasificaciones incorrectas y calibración deficiente, no como texto inventado.
- Adopción mínima: 0 descargas y 4 likes en el momento de la consulta, con fechas de creación y actualización del 21 de septiembre de 2026. La validación externa es prácticamente inexistente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar LICENSE y ATTRIBUTIONS.md del repositorio por las atribuciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Decision-1.0-Nox
- Colección Decision 1.0: https://huggingface.co/collections/llm-semantic-router/decision-10-6ab12177bd0002394d8409f9
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Evaluación y métodos (EVALUATION.md): https://huggingface.co/llm-semantic-router/Decision-1.0-Nox/blob/main/EVALUATION.md
- Escalado de peticiones y latencias (QUESTION-SCALING.md): https://huggingface.co/llm-semantic-router/Decision-1.0-Nox/blob/main/QUESTION-SCALING.md
- Guía de instalación y API (USAGE.md): https://huggingface.co/llm-semantic-router/Decision-1.0-Nox/blob/main/USAGE.md
- Configuración de ROCm (RUNTIME.md): https://huggingface.co/llm-semantic-router/Decision-1.0-Nox/blob/main/RUNTIME.md
- Ejemplo de petición y salida (model-card-example.json): https://huggingface.co/llm-semantic-router/Decision-1.0-Nox/blob/main/model-card-example.json
- Código de inferencia (code/decision_model.py): https://huggingface.co/llm-semantic-router/Decision-1.0-Nox/blob/main/code/decision_model.py
- Atribuciones (ATTRIBUTIONS.md): https://huggingface.co/llm-semantic-router/Decision-1.0-Nox/blob/main/ATTRIBUTIONS.md
- Licencia (LICENSE): https://huggingface.co/llm-semantic-router/Decision-1.0-Nox/blob/main/LICENSE

Nota: la búsqueda web realizada no ha devuelto fuentes específicas sobre este modelo; los resultados obtenidos son artículos genéricos sobre modelos de lenguaje (guías introductorias de BienveNum y Wikipedia, y clasificaciones generales de LLM de Digitiz e ia-insights) sin relación con Decision-1.0-Nox. No se han encontrado papers, repositorios ni demos independientes en la información disponible.
