# guard-spec/guardspec-classifier

## Resumen

guardspec-classifier (v3b) es un clasificador de riesgo de prompt injection desarrollado por guard-spec, pensado como la capa L2 de Guard Spec, una pasarela de guardarraíles autoalojada para LLM. No es un modelo generativo: recibe texto (prompts de usuario, documentos recuperados, salidas de herramientas o definiciones de herramientas) y devuelve una puntuación de riesgo de manipulación. Se distribuye como modelo ONNX con cuantización INT8 dinámica de 118,5 MB.

Técnicamente parte de `intfloat/multilingual-e5-small` (arquitectura BERT de 12 capas, tamaño oculto 384, unos 118 millones de parámetros) y se afina con una cabeza sigmoide multi-etiqueta de 8 clases. Está entrenado únicamente en inglés y vietnamita, con aproximadamente 30.800 filas de entrenamiento y 7.572 de validación. Su relevancia actual radica en que ofrece una señal de seguridad determinista, ligera y desplegable en CPU, integrable en pipelines que filtran entradas antes de que lleguen al LLM.

La versión v3b (2026-11-04) es el clasificador por defecto de Guard Spec. Incluye artefactos de calibración (Platt scaling y fusión logística con las capas L1 y L3 de la pasarela) y umbrales documentados, lo que permite reproducir el comportamiento del gateway fuera de él. La licencia Apache-2.0 y el hecho de que todas las fuentes de datos permitan uso comercial facilitan su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base: intfloat/multilingual-e5-small), 12 capas, hidden size 384, cabeza sigmoide multi-etiqueta de 8 clases |
| Parametros totales | Aproximadamente 118 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens por ventana; textos más largos se dividen en ventanas tomando el riesgo máximo |
| Tipos de cuantizacion | INT8 dinámica (pesos QInt8, per channel); se distribuye solo en INT8 ONNX |
| Idiomas soportados | Inglés (en) y vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_int8.onnx`, 118.521.330 bytes), más `tokenizer.json`, `config.json`, `thresholds.json` y `calibration.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT derivado de `multilingual-e5-small` (revisión `614241f622f53c4eeff9890bdc4f31cfecc418b3`, licencia MIT). Sobre el encoder se añade una cabeza de clasificación multi-etiqueta con activación sigmoide y 8 etiquetas: `benign`, `direct_injection`, `indirect_injection`, `jailbreak`, `prompt_extraction`, `data_exfiltration`, `tool_poisoning` y `obfuscation`. La puntuación de riesgo se define como 1 − sigmoid(logit_benign); las puntuaciones por etiqueta de ataque son orientativas.

El ajuste fino se realizó con aproximadamente 30.800 filas de entrenamiento y 7.572 de validación en inglés y vietnamita, a partir de fuentes públicas cuya licencia permite redistribución y uso comercial (por ejemplo, `deepset/prompt-injections`, entre otras). No se especifica en la información disponible el número total de tokens de entrenamiento ni si se emplearon RLHF o DPO, algo esperable por otra parte en un clasificador. La innovación principal no está en la arquitectura, sino en el empaquetado para producción: cuantización INT8 dinámica, artefactos de calibración (Platt scaling con A = 0,9731 y B = 0,1567, y fusión logística con pesos L1/L2/L3 de 0,4582/0,9094/0,2769 y sesgo 0,4955) y umbrales independientes documentados (`risk_threshold` 0,1911 con FPR benigno ≤ 1% en validación).

## Capacidades

- Clasificación multi-etiqueta de riesgo de prompt injection en texto, con 8 etiquetas de ataque y una de benigno.
- Detección de injection directa e indirecta, jailbreak, extracción de system prompt, exfiltración de datos, envenenamiento de herramientas y ofuscación.
- Puntuación de prompts de usuario, documentos recuperados, salidas de herramientas y definiciones de herramientas antes de que los vea el LLM.
- Salida numérica determinista (logits y probabilidades), apta para umbrales y políticas automatizadas.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Multilingüe limitado a inglés y vietnamita.
- No genera texto ni razona: es exclusivamente un clasificador.
- No soporta tool calling, agentes ni modos de pensamiento; esas capacidades pertenecen al LLM que protege.

## Casos de uso

- Filtrado de prompts de usuario en una pasarela LLM: cada prompt se puntúa con el clasificador y se bloquea o deriva a revisión si supera el umbral, reduciendo el riesgo de jailbreaks antes de llegar al modelo generativo.
- Protección frente a injection indirecta en RAG: los documentos recuperados se puntúan antes de insertarse en el contexto, de modo que un documento manipulado no introduce instrucciones maliciosas en el prompt final.
- Validación de salidas de herramientas y APIs: las respuestas de herramientas externas se clasifican para detectar intentos de envenenamiento o instrucciones ocultas antes de reinyectarlas en el bucle del agente.
- Auditoría de definiciones de herramientas en sistemas con function calling: el clasificador evalúa descripciones de herramientas en busca de `tool_poisoning` y permite rechazar registros sospechosos.
- Defensa en profundidad junto a reglas y allow-lists: al ser una señal barata en CPU, se combina como capa L2 con reglas (L1) y similitud de embeddings (L3), tal como hace Guard Spec con fusión logística.
- Despliegue en entornos con recursos limitados: al ocupar 118,5 MB en INT8 y ejecutarse en CPU, encaja en contenedores pequeños, edge o funciones serverless donde un modelo guardián basado en LLM sería inviable.
- Monitorización y telemetría de seguridad: registrar la distribución de puntuaciones de riesgo permite detectar campañas de ataque y ajustar umbrales con datos propios.

## Benchmarks y rendimiento

La model-index del autor declara el nombre `guardspec-classifier-v3b` con una lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento documentados son de validación interna: un umbral independiente de 0,1911 con una tasa de falsos positivos sobre benignos ≤ 1% en el conjunto de validación.

## Requisitos de hardware

- VRAM estimada: 0 GB; el modelo está pensado para inferencia en CPU.
- Memoria RAM: en torno a 200-300 MB para cargar el modelo ONNX INT8 y el tokenizer, más el espacio de trabajo de ONNX Runtime.
- GPU recomendadas: no necesarias. Cualquier GPU compatible con ONNX Runtime (por ejemplo, T4, L4, A100, H100 o RTX 4090) puede usarse, pero no aporta ventajas claras frente a CPU para este tamaño.
- Cabe holgadamente en cualquier equipo de consumo; no requiere GPU de consumo.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o proveedores CUDA/TensorRT), integración nativa en Guard Spec (imagen `guard-spec-gateway-full` o variable `L2_MODEL_DIR`), y contenedores ligeros. No se distribuye en GGUF, por lo que llama.cpp u Ollama no aplican directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| guardspec-classifier v3b | ~118 M | 256 tokens/ventana | en, vi | Apache-2.0 | ONNX INT8 | Clasificador de prompt injection, no generativo |
| Modelo base: intfloat/multilingual-e5-small | ~118 M | 512 tokens | Multilingüe | MIT | safetensors, ONNX | Embeddings; no clasifica injection por sí mismo |
| Clasificadores de injection basados en LLM (genéricos) | Miles de millones | Variable | Variable | Variable | Variable | Mayor coste y latencia; no disponibles datos concretos en esta ficha |

No se dispone en la información proporcionada de resultados de benchmarks comparativos con alternativas, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Solo cubre inglés y vietnamita; el rendimiento en otros idiomas no está garantizado.
- No es un modelo de moderación de contenido: juzga si el texto intenta manipular un LLM, no si la petición es dañina, tóxica o ilegal.
- Riesgo de falsos positivos y falsos negativos; el autor desaconseja usarlo como único control sin revisión humana o respaldo de políticas.
- No detecta ataques ocultos en imágenes, audio ni adjuntos binarios.
- El texto se trunca a 256 tokens por ventana; ataques repartidos en textos muy largos requieren segmentación y agregación por máximo.
- La puntuación de riesgo bruta no está calibrada al umbral de bloqueo de 0,85 del gateway; para uso aislado debe aplicarse la calibración de `calibration.json` o usar `risk_threshold` (0,1911).
- Las puntuaciones por etiqueta de ataque son orientativas; las decisiones deben basarse en la puntuación de riesgo.
- El modelo no usa el prefijo `query: ` de e5, a diferencia de la capa L3; introducirlo alteraría las puntuaciones.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene fijar la revisión (`revision=`) al descargar para garantizar reproducibilidad.
- Sesgos concretos no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guard-spec/guardspec-classifier
- Repositorio Guard Spec: https://github.com/guard-spec/guard-spec
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Paper de referencia citado en los tags: arXiv:2402.05672 (https://arxiv.org/abs/2402.05672)
- Dataset de referencia: https://huggingface.co/datasets/deepset/prompt-injections
