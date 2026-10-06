# j-llm/Qwen3.5-2B-SpeedX2

## Resumen

Qwen3.5-2B-SpeedX2 es una variante experimental del modelo Qwen3.5-2B en la que todas las capas de atención completa (full attention) se han sustituido por capas Gated DeltaNet (GDN), un mecanismo de atención lineal. El resultado es un modelo denso de 2.312.357.120 parámetros (aproximadamente 2,31 mil millones) que no acumula KV cache al generar, de modo que el consumo de memoria y el coste por token se mantienen constantes independientemente de la longitud de la entrada.

El repositorio lo publica el usuario j-llm y deriva de `summerMC/Qwen3.5-2B-SpeedX`, la conversión all-GDN original. La pérdida de precisión provocada por la sustitución de capas se compensa con un proceso de destilación en dos etapas que usa `Qwen/Qwen3.5-2B` como profesor. Según la model card, no se ha realizado ningún SFT adicional con datos de conocimiento nuevo: el entrenamiento se limita a recuperar el comportamiento del modelo original.

Su relevancia actual radica en que explora el eje de atención lineal pura (sin capas de atención completa de respaldo) en un modelo pequeño y con licencia Apache 2.0, lo que permite ejecutarlo en hardware de consumo y evaluar el compromiso entre eficiencia en contexto largo y degradación en tareas de razonamiento, matemáticas y código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con todas las capas de atención completa sustituidas por Gated DeltaNet (atención lineal); etiquetado en el repositorio como "all-GDN" |
| Parametros totales | 2.312.357.120 (2,31 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible. El repositorio está etiquetado como `long-context`, pero la model card no especifica el valor; se hereda la configuración del modelo base `Qwen/Qwen3.5-2B` |
| Tipos de cuantizacion | No disponible. No se publican pesos GGUF, AWQ ni GPTQ; el repositorio solo contiene safetensors en bf16 |
| Idiomas soportados | No disponible. La model card está redactada en japonés y el ejemplo de uso es en japonés; el modelo base Qwen es multilingüe, pero no se documenta la cobertura |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 4,6 GB, con pesos maestros en fp32/bf16 según el proceso de destilación descrito) |

## Arquitectura y entrenamiento

La arquitectura parte de `Qwen/Qwen3.5-2B` y reemplaza la totalidad de sus capas de atención completa por capas Gated DeltaNet. Gated DeltaNet es un mecanismo de atención lineal con estado recurrente y compuerta de olvido, de modo que el coste de memoria y de cómputo por token no crece con la longitud del contexto: no hay KV cache que se expanda. Todas las capas son lineales, lo que convierte al modelo en un caso puro de este diseño, sin capas de atención cuadrática intercaladas.

La recuperación de precisión se hizo por destilación en dos etapas. En la etapa 1 se entrenó cada capa GDN de forma paralela e independiente para que su salida igualase la de la capa de atención completa original que sustituye, con una pérdida combinada de MSE relativo y similitud de coseno, y con las entradas entre capas desacopladas (detach). En la etapa 2 se ajustó el modelo completo de extremo a extremo con divergencia KL contra los logits del profesor más una pérdida sobre los estados ocultos. El entrenamiento usó pesos maestros en fp32 con autocast en bf16 y optimizador fused AdamW. Los pesos finales se generan sustituyendo únicamente los tensores correspondientes en los shards de safetensors originales. No hubo fase de SFT con datos de conocimiento nuevo ni se documenta RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno mediante `apply_chat_template`, con soporte de la plantilla de chat de Qwen y del modificador `enable_thinking` que aparece en el ejemplo de la model card.
- Procesamiento de contexto largo con memoria constante: al ser todo atención lineal, la huella de memoria no aumenta con el número de tokens de entrada, lo que es la característica diferencial frente al modelo base.
- Carga directa en `transformers` sin `trust_remote_code`.
- Aceleración opcional de los kernels lineales si se instala `flash-linear-attention`.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponibles como característica declarada; la propia model card advierte de degradación en razonamiento.
- Capacidades multilingües: no documentadas.
- Capacidades especiales: el repositorio incluye la etiqueta `image-text-to-text`, probablemente heredada del modelo base, pero la model card solo documenta `text-generation` y no describe ninguna capacidad de visión. No debe asumirse soporte multimodal sin verificación.
- Modo "thinking": la plantilla de chat admite `enable_thinking`, pero no hay evaluación publicada de su calidad en este modelo destilado.

## Casos de uso

- Evaluación de atención lineal en contexto largo: el modelo sirve como banco de pruebas controlado para medir cuánta calidad se pierde al eliminar toda la atención cuadrática, comparando contra `Qwen/Qwen3.5-2B` con los mismos prompts.
- Procesamiento de documentos largos en hardware limitado: resúmenes o extracción de información sobre entradas extensas sin que la memoria crezca con el número de tokens, algo inviable con KV cache tradicional en GPUs pequeñas.
- Prototipado e investigación en destilación: el pipeline descrito (destilación por capas más ajuste end-to-end con KL) es reproducible y sirve como receta para convertir otros transformers densos a arquitecturas lineales.
- Generación de texto conversacional de bajo coste: su tamaño de 2,31 mil millones de parámetros permite desplegarlo en una sola GPU de consumo para tareas de chat simple, siempre que no se exija razonamiento complejo.
- Preprocesamiento y clasificación de texto a gran escala: etiquetado, filtrado o enrutado de grandes volúmenes de documentos donde el coste por token constante es más importante que la precisión puntera.
- Base para fine-tuning con adaptadores: al publicarse en safetensors y con licencia Apache 2.0, admite LoRA u otros adaptadores para especializarlo en un dominio concreto, partiendo de un modelo ya alineado conversacionalmente.
- Despliegue en entornos con presupuesto de memoria fijo: servicios donde el pico de memoria debe ser predecible (por ejemplo, varias instancias por GPU) y el contexto de entrada es muy variable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de resultados de la model card aparece literalmente sin rellenar ("評価値は未記入", es decir, valores de evaluación no introducidos), pese a indicar que las mediciones se harían con el mismo texto de evaluación y en las mismas condiciones, usando `Qwen/Qwen3.5-2B` como referencia. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 5 GB solo para pesos (4,6 GB de repo), más activaciones; con contexto largo la ventaja es que no hay KV cache creciente.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,5-3 GB; en 4 bits, aproximadamente 1,5-2 GB. Estas cifras son estimaciones a partir del número de parámetros, ya que no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) puede ejecutarlo en bf16. Para servicio concurrente, A100 o H100 aportan margen para lotes mayores.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en bf16, y con holgura en cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` de forma nativa; `flash-linear-attention` para los kernels rápidos. No hay confirmación de soporte en vLLM, TGI, llama.cpp u Ollama, y dada la arquitectura lineal personalizada no debe asumirse compatibilidad sin probarla.
- Advertencia de despliegue: la model card indica que la `Cache` estándar de `transformers` puede lanzar `ValueError` en `get_seq_length` con este modelo; la solución documentada es usar `use_cache=False` (más lento) o parchear el contador de longitud.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Notas |
|---|---|---|---|---|---|
| j-llm/Qwen3.5-2B-SpeedX2 | 2,31 B | No disponible | Gated DeltaNet en todas las capas | apache-2.0 | Destilado desde Qwen3.5-2B; sin benchmarks publicados; 0 descargas y 0 likes en el momento de la consulta |
| summerMC/Qwen3.5-2B-SpeedX | No disponible | No disponible | Gated DeltaNet en todas las capas | No disponible | Conversión all-GDN original de la que deriva este modelo; sirve como referencia dentro de la misma familia |
| Qwen/Qwen3.5-2B | No disponible (modelo base de ~2 B) | No disponible | Atención completa estándar | No disponible | Profesor del proceso de destilación; se espera mejor razonamiento, matemáticas y código |

No se dispone de datos de benchmarks ni de configuraciones verificadas de otros modelos de la misma categoría, por lo que no es posible establecer una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- La destilación aproxima el comportamiento del profesor, no lo iguala. La model card advierte explícitamente de que el razonamiento, las matemáticas y la generación de código pueden ser peores que en `Qwen/Qwen3.5-2B`.
- No hubo SFT con datos nuevos: el modelo no aporta conocimiento adicional respecto al base, solo recupera parte del perdido por la sustitución de capas.
- No hay ninguna evaluación publicada; la tabla de resultados de la model card está vacía. Cualquier uso en producción debería ir precedido de una evaluación propia.
- Incompatibilidad conocida con la `Cache` estándar de `transformers`: puede lanzar `ValueError` en `get_seq_length`. El modo seguro (`use_cache=False`) penaliza la velocidad.
- Sesgos conocidos: no disponibles. Al no documentarse la composición del dataset de destilación ni los idiomas soportados, no se puede caracterizar el comportamiento sesgado ni la cobertura lingüística.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 2,31 B destilado para eficiencia, es razonable esperar una tasa de alucinación superior a la de modelos mayores, pero no hay medición.
- Idiomas: no documentados. El ejemplo de la model card está en japonés; no debe asumirse un rendimiento equilibrado en castellano sin probarlo.
- Licencia: apache-2.0, heredada del modelo base según la propia model card, lo que permite uso comercial. Conviene verificar la licencia del repositorio base `Qwen/Qwen3.5-2B` antes de un despliegue comercial.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- La etiqueta `image-text-to-text` del repositorio no está respaldada por ninguna descripción de capacidades de visión en la model card; no debe asumirse soporte multimodal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/j-llm/Qwen3.5-2B-SpeedX2
- Conversión all-GDN original: https://huggingface.co/summerMC/Qwen3.5-2B-SpeedX
- Modelo base y profesor de destilación: https://huggingface.co/Qwen/Qwen3.5-2B
- Biblioteca de kernels lineales citada en la model card: flash-linear-attention (sin URL en la documentación consultada)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos trataban sobre la letra "J" y no guardan relación con la ficha.
