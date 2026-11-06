# konnosena/auto-150m-3-onnx

## Resumen

`konnosena/auto-150m-3-onnx` es la exportación a formato ONNX del modelo `ProCreations/auto-150m-3`, un clasificador de texto de 150 millones de parámetros construido sobre la arquitectura ModernBERT. Su función es binaria y muy concreta: dada una llamada a herramienta propuesta por un agente de IA, junto con la petición del usuario y el historial de acciones del agente, el modelo decide si esa llamada debe ejecutarse (etiqueta 0, `approve`) o bloquearse (etiqueta 1, `deny`). Se trata, por tanto, de un componente de seguridad para pipelines de agentes, no de un modelo generativo.

La conversión la firma el usuario konnosena y es explícitamente no oficial, sin afiliación con los autores originales. El interés técnico de esta versión está en la optimización de la inferencia: se ha exportado a ONNX opset 23, se mantienen los pesos en BF16 con conversión a FP32 al cargar (sin pérdida, ya que el original es BF16) y se ha reescrito el cálculo de la atención para que las capas de atención local solo operen dentro de su ventana deslizante y las capas globales procesen las consultas en ocho bloques. El resultado es idéntico al original (diferencias máximas en la probabilidad de denegación del orden de 10⁻⁶) con un consumo de memoria y un tiempo de ejecución mucho menores en entradas largas.

El modelo es relevante ahora porque cubre una necesidad creciente en el despliegue de agentes autónomos: un filtro ligero, determinista y barato de ejecutar que intercepta acciones potencialmente peligrosas antes de que se materialicen. Con 299,5 MB en un único fichero y soporte para entradas de hasta 8192 tokens, es adecuado para entornos de CPU sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con atención local de ventana deslizante y capas globales) |
| Parametros totales | 150 M (según denominación del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud de entrenamiento); dimensión dinámica en el grafo ONNX |
| Tipos de cuantizacion | Pesos en BF16 con conversión a FP32 en carga; cálculo en FP32; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 23), fichero único `model.onnx` de 299,5 MB, sin datos externos |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, el encoder de Answer.AI publicado bajo licencia Apache 2.0, que sustituye la atención completa por una combinación de capas de atención local con ventana deslizante y capas de atención global intercaladas. La exportación a ONNX respeta ese diseño y lo explota: las capas locales calculan la atención únicamente dentro de cada bloque de 64 tokens (cada bloque atiende a sí mismo y a sus dos vecinos, con la máscara original |i − j| ≤ 64), y las capas globales procesan las consultas en ocho fragmentos. La última capa calcula solo la fila del token `[CLS]`, que es la que alimenta la cabeza de clasificación. El modelo recibe `input_ids` y `attention_mask` como enteros de 64 bits y devuelve `logits` de forma [1, 2]; la probabilidad de denegación se obtiene como `softmax(logits)[1]`.

No se dispone de información detallada sobre el proceso de entrenamiento del modelo original en la documentación consultada: no se especifican el número de tokens, la composición del corpus, ni si hubo ajuste fino con RLHF o DPO. La model card remite a la ficha del modelo original para esos detalles. Lo que sí se documenta es la verificación de equivalencia entre la versión ONNX y el modelo PyTorch original en FP32 sobre CPU: 199 casos de llamadas a herramientas mixtas de hasta 8192 tokens (diferencia máxima absoluta en p_deny de 2,9 × 10⁻⁶), 37 sesiones largas de agente de entre 4k y 14k tokens truncadas a 8192 (1,1 × 10⁻⁶) y 600 ejemplos del split de test del dataset Approve-or-Deny de hasta 2048 tokens (3,9 × 10⁻⁶). En los tres conjuntos la decisión coincide al 100 % con umbrales de 0,1, 0,5 y 0,9.

## Capacidades

- Clasificación binaria de llamadas a herramientas: decide entre `approve` (0) y `deny` (1) para una acción propuesta por un agente.
- Evaluación contextual: el texto de entrada combina la llamada propuesta, la petición del usuario y el historial de acciones del agente, de modo que la decisión depende del contexto completo y no solo de la llamada aislada.
- Gestión de historiales largos: soporta entradas de hasta 8192 tokens y, cuando el texto excede ese límite, la recomendación es descartar primero las entradas más antiguas del historial.
- Umbral configurable: la probabilidad de denegación permite fijar el punto de corte según la política de seguridad (la model card original evalúa a 0,5).
- Ejecución en CPU: el grafo ONNX está optimizado para CPU y se ha probado con ONNX Runtime 1.31.
- No es un modelo generativo: no produce texto, no razona de forma multi-paso ni soporta tool calling por sí mismo; su función es clasificar la propuesta de otro sistema.

## Casos de uso

- Interceptación de acciones peligrosas en agentes autónomos: antes de ejecutar una llamada a herramienta (borrado de ficheros, envío de correos, operaciones sobre bases de datos), el orquestador consulta al modelo y bloquea la acción si `p_deny` supera el umbral. Es adecuado por su latencia baja en CPU y su naturaleza determinista.
- Puerta de seguridad en pipelines de CI/CD con agentes de código: cuando un agente propone comandos de shell o cambios en el repositorio, el clasificador filtra las propuestas destructivas o fuera de alcance antes de aplicarlas.
- Moderación de asistentes con acceso a herramientas externas: en productos de atención al cliente donde el agente puede consultar APIs internas o modificar datos del usuario, el modelo añade una capa de validación sobre cada acción propuesta.
- Auditoría y registro de decisiones: integrado en el bucle del agente, genera una puntuación de riesgo por acción que puede registrarse junto al historial, facilitando la trazabilidad y la revisión posterior.
- Despliegue en entornos sin GPU: al ejecutarse con ONNX Runtime en CPU y ocupar 299,5 MB en disco, encaja en contenedores ligeros, dispositivos de borde o servicios serverless donde no hay acelerador disponible.
- Filtrado previo en sistemas multiagente: un agente supervisor puede delegar en este clasificador la validación rápida de las propuestas de agentes subordinados antes de escalarlas, reduciendo el coste frente a usar un modelo generativo grande para la misma tarea.
- Evaluación de sesiones largas: gracias a la ventana de 8192 tokens y al truncado por descarte del historial más antiguo, puede validar acciones en conversaciones de agente prolongadas sin perder el contexto reciente relevante.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la verificación de equivalencia entre la versión ONNX y el modelo original, no a comparaciones con otros modelos.

| Conjunto | Casos | Diferencia máxima en p_deny | Coincidencia de decisión (0,1 / 0,5 / 0,9) |
|---|---:|---:|---|
| Llamadas a herramientas mixtas (hasta 8192 tokens) | 199 | 2,9 × 10⁻⁶ | 100 % / 100 % / 100 % |
| Sesiones largas de agente (4k–14k tokens, truncadas a 8192) | 37 | 1,1 × 10⁻⁶ | 100 % / 100 % / 100 % |
| Subconjunto balanceado del test de Approve-or-Deny (hasta 2048 tokens) | 600 | 3,9 × 10⁻⁶ | 100 % / 100 % / 100 % |

Precisión en ese subconjunto de Approve-or-Deny con umbral 0,5: 96,50 % (idéntica a la del modelo original). No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU. En memoria principal, el fichero ONNX ocupa 299,5 MB y los pesos se convierten a FP32 al cargar la sesión, por lo que el consumo en RAM se sitúa en torno a 600 MB para los pesos, más el espacio de activaciones según la longitud de entrada.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime serviría, pero el diseño está optimizado para CPU.
- GPU de consumo: irrelevante para este modelo; cabe en cualquier equipo de consumo por su reducido tamaño, pero no está pensado para ejecutarse en ellas.
- Opciones de despliegue: ONNX Runtime (probado con la versión 1.31), con ejemplos de uso en `onnxruntime-node`; el tokenizador se carga con `@huggingface/tokenizers` a partir de `tokenizer.json`.
- Latencia y throughput: no se publican cifras concretas. La model card indica que la reescritura de la atención reduce «mucho» el tiempo y la memoria en entradas largas, pero sin valores numéricos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación consultada. El modelo original `ProCreations/auto-150m-3` es la referencia directa: misma arquitectura, mismos pesos y misma precisión (96,50 % en el subconjunto evaluado), pero en formato PyTorch y sin las optimizaciones de atención de la versión ONNX. Cualquier comparación con otros clasificadores de seguridad para agentes requeriría datos que no están disponibles.

| Modelo | Parámetros | Contexto | Formato | Licencia | Precisión documentada |
|---|---|---|---|---|---|
| konnosena/auto-150m-3-onnx | 150 M | 8192 tokens | ONNX | Apache 2.0 | 96,50 % (Approve-or-Deny, umbral 0,5) |
| ProCreations/auto-150m-3 | 150 M | 8192 tokens | PyTorch (BF16) | Apache 2.0 | 96,50 % (mismo subconjunto) |
| Otros clasificadores de seguridad para agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conversión no oficial: la exportación la realiza un tercero (konnosena) sin afiliación con ProCreations; para producción conviene validar el comportamiento frente al modelo original en el dominio propio.
- Solo inglés: el modelo está entrenado y etiquetado únicamente para inglés; su uso con textos en castellano u otros idiomas no está respaldado y probablemente degrade la precisión.
- Tarea acotada: no genera texto ni razona; solo clasifica llamadas a herramientas con el formato exacto documentado. Un formato de entrada distinto al especificado (`### PROPOSED TOOL CALL`, `### USER REQUEST`, `### AGENT HISTORY`) puede invalidar las predicciones.
- Riesgo de falsos negativos: con una precisión del 96,50 % en el subconjunto evaluado, existe un porcentaje no desdeñable de decisiones incorrectas; como capa de seguridad, debe combinarse con otras salvaguardas y no sustituir la validación humana en acciones críticas.
- Truncado de contexto: las entradas de más de 8192 tokens requieren descartar el historial más antiguo, lo que puede eliminar información relevante para la decisión en sesiones muy largas.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al ser un clasificador entrenado sobre un dataset concreto (Approve-or-Deny), puede heredar los sesgos de distribución de ese corpus.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de ModernBERT y del modelo original, conviene conservar los avisos de atribución correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/konnosena/auto-150m-3-onnx
- Modelo original: https://huggingface.co/ProCreations/auto-150m-3
- Dataset de evaluación Approve-or-Deny: https://huggingface.co/datasets/ProCreations/approve-or-deny
- Arquitectura base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- Perfil del autor de la conversión: https://huggingface.co/konnosena
