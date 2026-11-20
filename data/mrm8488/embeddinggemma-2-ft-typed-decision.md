# mrm8488/embeddinggemma-2-ft-typed-decision

## Resumen

EmbeddingGemma 2 · typed decisions es un modelo de decisión tipada desarrollado por mrm8488 (Manuel Romero) mediante fine-tuning de `google/embeddinggemma-2`. Su función no es generar texto libre, sino recibir el estado de un flujo de trabajo (una traza de agente, un ticket de soporte, una factura, una alerta de seguridad) junto con un esquema de preguntas y devolver, para cada pregunta, una respuesta tipada y calibrada con su probabilidad asociada. El modelo soporta tres tipos de pregunta: `choice` (selección entre opciones descritas), `score` (nivel ordinal con valor entero) y `noul` (sí/no probabilístico).

La innovación clave es que la cabeza de decisión puntúa el texto de cada opción contra el estado y la pregunta, de modo que el esquema es dato plano: se pueden renombrar opciones, cambiar descripciones o añadir preguntas nuevas sin reentrenar. Esto lo convierte en una pieza útil para sistemas de observabilidad de agentes, enrutamiento de tickets o triaje automatizado, donde se necesita una salida estructurada, interpretable y con confianza calibrada en lugar de texto generado.

El modelo tiene 272.120.348 parámetros, se distribuye en safetensors con licencia Apache 2.0, requiere `trust_remote_code=True` y está etiquetado como multilingüe (aunque la cabeza se entrenó solo con esquemas en inglés). El repositorio ocupa 1,1 GB y acumula 1147 descargas y 90 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base EmbeddingGemma 2) con cabeza de decisión tipada (`gemma_decision`, código personalizado) |
| Parametros totales | 272.120.348 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo recomienda bfloat16 o float32; prohíbe float16) |
| Idiomas soportados | en, multilingual (cabeza entrenada solo con esquemas en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/embeddinggemma-2`, un encoder de frases multilingüe, y le añade una cabeza de decisión implementada en código personalizado (`gemma_decision`). La cabeza puntúa el texto de cada opción del esquema contra la representación del estado y de la pregunta, produciendo distribuciones de probabilidad sobre las opciones. Para preguntas `score` calcula además el nivel esperado (`expected_level`), y para `noul` devuelve probabilidad de verdadero/falso. La API expone `encode(texts)` para embeddings normalizados idénticos a los usados en entrenamiento, `collate(rows)` para convertir filas `{workflow, state, questions, gold}` en lotes y la salida `GemmaDecisionOutput(loss, logits, probabilities, text_embeds)`.

El fine-tuning se realizó sobre el dataset `LocalLLaMA/typed-decisions`, con esquemas en inglés. La model card indica que las respuestas a preguntas alejadas de la distribución de entrenamiento son menos fiables y que, en otros idiomas, las probabilidades tienden a ser más suaves (menos definidas). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Clasificación estructurada mediante esquemas declarativos con tres tipos de pregunta: `choice`, `score` y `noul`.
- Salida tipada y calibrada: cada respuesta incluye `kind`, `label`, `value` (str, int o bool), `confidence`, `probabilities` y, en preguntas `score`, `expected_level`.
- Esquemas editables sin reentrenar: renombrar opciones, cambiar descripciones o añadir preguntas nuevas.
- Soporte de múltiples preguntas por estado en una sola llamada mediante `model.decide(state, questions, workflow=...)`.
- Embeddings de frase normalizados vía `model.encode(texts)`.
- Capacidad multilingüe heredada del encoder base, con degradación esperada en la calibración fuera del inglés.
- Serialización de respuestas a JSON mediante `answer.to_dict()`.
- Fine-tuning adicional con el `Trainer` de Hugging Face a partir de lotes generados con `collate`.
- No es un modelo generativo: no produce texto libre ni soporta tool calling ni razonamiento multi-paso en el sentido de un LLM.

## Casos de uso

- Observabilidad de agentes autónomos: dado un resumen de traza (pasos, errores de herramienta, violaciones de restricciones, acciones irreversibles, duración), el modelo decide si continuar, observar, enviar a revisión humana o detener, con probabilidad calibrada por opción.
- Triaje de tickets de soporte: clasificar cada ticket en categorías definidas en el esquema y estimar un nivel de urgencia con pregunta `score`, permitiendo enrutamiento automático con umbral de confianza.
- Revisión de facturas y documentos financieros: preguntas `noul` para detectar si un documento requiere revisión manual y preguntas `choice` para asignar el tipo de incidencia.
- Alertas de seguridad: puntuar el riesgo de una alerta en niveles ordinales (`0..3`) y decidir la acción del sistema de respuesta, aprovechando `expected_level` para priorizar colas.
- Control de calidad en pipelines de datos: evaluar si una muestra generada cumple criterios definidos en el esquema, con salida estructurada apta para agregación estadística.
- Moderación o cumplimiento de políticas: comprobar si una acción cumple una lista de restricciones y devolver la decisión con distribución de probabilidad para auditoría.
- Enrutamiento multilingüe: al ser multilingüe, puede procesar estados en otros idiomas, aunque con calibración más laxa y siempre que el esquema se mantenga en inglés para máxima fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 272 millones de parámetros, en bfloat16 el peso ocupa aproximadamente 0,55 GB; en float32, alrededor de 1,1 GB. Añadiendo activaciones y overhead, se puede estimar un consumo de 1-2 GB en bfloat16 para lotes pequeños.
- GPU recomendadas: cualquier GPU Ampere o superior para bfloat16 (A100, H100, RTX 3090, RTX 4090, L4, etc.).
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM en bfloat16; también es viable en CPU para cargas de baja concurrencia.
- Precisión: usar obligatoriamente bfloat16 o float32; la model card advierte que float16 provoca desbordamiento y devuelve NaN sin lanzar error.
- Opciones de despliegue: la librería es `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrm8488/embeddinggemma-2-ft-typed-decision | 272 M | no disponible | Decisión tipada calibrada (choice/score/noul) | Apache 2.0 | Hugging Face |
| google/embeddinggemma-2 | no disponible | no disponible | Embeddings de frase | no disponible | Hugging Face |
| LLM generativos con salida JSON (p. ej. modelos de 7-70 B) | 7-70 B | decenas de miles de tokens | Texto estructurado generado | variable | Hugging Face y APIs |

Frente a un LLM generativo que produce JSON, este modelo ofrece salidas tipadas con probabilidades calibradas y un coste computacional muy inferior (272 M de parámetros), a cambio de limitarse a esquemas predefinidos y no generar texto libre. Frente al encoder base `google/embeddinggemma-2`, añade la cabeza de decisión y la API de esquemas. No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La cabeza se entrenó únicamente con esquemas en inglés; en otros idiomas las probabilidades son más suaves y menos fiables.
- Las respuestas a preguntas alejadas de la distribución de entrenamiento son menos fiables, según advierte el autor.
- No es un modelo generativo: no puede producir texto libre, razonamiento multi-paso ni tool calling.
- Riesgo de calibración deficiente fuera del dominio de entrenamiento; conviene validar los umbrales de confianza en producción.
- No usar float16: provoca NaN silenciosos por desbordamiento en EmbeddingGemma 2.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; auditar antes de desplegar.
- No se documentan sesgos específicos ni evaluación de robustez en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y verificar las condiciones del modelo base `google/embeddinggemma-2`.

## Enlaces

- Hugging Face: https://huggingface.co/mrm8488/embeddinggemma-2-ft-typed-decision
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Imagen del modelo: https://huggingface.co/mrm8488/embeddinggemma-2-ft-typed-decision/resolve/main/eg2td.png
