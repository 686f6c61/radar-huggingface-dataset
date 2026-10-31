# Jitheswar/Qwen3.5-4B-Amadeus

## Resumen

Qwen3.5-4B-Amadeus es una versión "abliterated" (descensurada) de Qwen3.5-4B, el modelo multimodal compacto de Qwen, publicada por el usuario Jitheswar en Hugging Face. El autor no ha reentrenado el modelo: ha localizado la llamada "dirección de rechazo" (refusal direction) dentro de los pesos originales y la ha eliminado mediante ablación direccional, un proceso conocido como *abliteration*, optimizado automáticamente durante 1000 rondas para maximizar la eliminación de rechazos minimizando la perturbación de los pesos. El resultado es un modelo que apenas rechaza peticiones (1 de 304 prompts de prueba frente a 231 del original) conservando prácticamente intactas sus capacidades de razonamiento, matemáticas y visión.

El modelo base, Qwen3.5-4B, es un transformer multimodal (image-text-to-text) con unas 4.539 millones de parámetros, soporte de entrada de imágenes y texto, y modo de razonamiento (*thinking mode*). Amadeus conserva todas estas características: plantilla de chat original, cabeza de predicción multi-token (MTP) incluida en los GGUF y capacidad de visión mediante un archivo mmproj adicional.

Su relevancia actual radica en la demanda de modelos pequeños sin filtros para investigación en alineamiento, red-teaming y casos de uso creativos donde los rechazos del modelo original resultan excesivamente conservadores. Se publica bajo licencia Apache 2.0, con pesos en safetensors (BF16) y GGUF en BF16, Q6_K y Q4_K_M cuantizados con matriz de importancia (imatrix).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5, con cabeza de predicción multi-token (MTP) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp sugiere 16384 tokens) |
| Tipos de cuantizacion | BF16, Q6_K, Q4_K_M (GGUF con imatrix); safetensors en BF16 |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (BF16, Q6_K, Q4_K_M, mmproj F16 para visión) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B: un transformer multimodal de unos 4,54 mil millones de parámetros capaz de procesar imágenes y texto (pipeline image-text-to-text), con modo de razonamiento (*thinking*) y cabeza de predicción multi-token para acelerar la generación. No se ha publicado información detallada sobre el número de capas, dimensiones ocultas o datos de preentrenamiento del modelo base en la información disponible.

En cuanto al "entrenamiento", Amadeus no recibió ninguno: no hubo fine-tuning ni datos nuevos. La modificación es puramente ponderal: se identificó la dirección en el espacio de activaciones responsable de los rechazos y se proyectó fuera de los pesos (directional ablation), usando 1000 rondas de optimización automática. El método se apoya en la literatura de abliteration (se cita el arXiv 2406.11717, el artículo de abliteration de Arditi et al. sobre refusal directions). Las etiquetas del repo mencionan los datasets mlabonne/harmless_alpaca y mlabonne/harmful_behaviors, presumiblemente usados para evaluar la tasa de rechazo, no para entrenar. La divergencia KL respecto al original sobre wikitext-2 es de 0,0128, lo que confirma una perturbación mínima.

## Capacidades

- Generación de texto conversacional con la plantilla de chat original de Qwen3.5, sin rechazos (1/304 frente a 231/304 del modelo base en el test del autor con el juez Minos).
- Razonamiento con modo *thinking* activable o desactivable (en llama.cpp mediante `--reasoning off`).
- Comprensión de imágenes: entrada de imagen-texto a texto, requiriendo el archivo mmproj en formato GGUF para visión.
- Matemáticas: 91,1 % en GSM8K (8-shot CoT), esencialmente igualado con el original (91,4 %).
- Razonamiento de sentido común y lenguaje: HellaSwag 71,6 %, WinoGrande 70,1 %, ARC-Challenge 46,8 %.
- Seguimiento de instrucciones: 78,19 % en IFEval (prompt-level strict).
- Multilingüe: inglés, chino y soporte multilingüe heredado del modelo base.
- Disponibilidad en múltiples formatos (safetensors y GGUF con tres cuantizaciones) y compatibilidad con Transformers, vLLM, SGLang, llama.cpp, Ollama y LM Studio.
- No hay información disponible sobre soporte de tool calling / function calling.

## Casos de uso

- Investigación en alineamiento y seguridad: al eliminar la dirección de rechazo, es un sujeto de estudio ideal para analizar cómo los modelos codifican conductas de seguridad en los pesos y para evaluar métodos de mitigación.
- Red-teaming y evaluación de jailbreaks: permite probar ataques contra un modelo que no se bloquea por política, aislando así las defensas del sistema (filtros externos) de los reflejos internos del modelo.
- Asistentes locales sin filtros para escritura creativa: con la cuantización Q6_K (3,6 GB) cabe en una RTX 3060 de 6 GB, lo que permite narrativa de ficción con contenido maduro sin rechazos espurios, aprovechando los 16K de contexto estimados.
- Chatbot multimodal en local: con el mmproj F16 se puede construir una aplicación que describa o analice imágenes en local, útil para entornos sin conexión a la nube por privacidad.
- Resolución de problemas matemáticos en dispositivo: el 91,1 % en GSM8K lo hace apto para asistentes de cálculo y razonamiento paso a paso (CoT) en portátiles con GPU modesta o incluso CPU con Q4_K_M (2,8 GB).
- Prototipado de agentes con Ollama o llama-server: el endpoint de llama.cpp u Ollama permite integrarlo rápidamente en pipelines de agentes locales para tareas multi-turno, aunque sin tool calling confirmado habría que implementar el parsing de acciones manualmente.
- Estudio comparativo de abliteration: la divergencia KL publicada (0,0128) y los benchmarks pareados facilitan investigar el coste real de la abliteration sobre capacidades generales.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluación propia con llama.cpp + lm-evaluation-harness, no verificados):

| Benchmark | Métrica | Qwen3.5-4B-Amadeus | Qwen3.5-4B (referencia del autor) |
|---|---|---|---|
| GSM8K (test, 8-shot CoT) | exact match | 91,13 % | 91,4 % |
| IFEval | prompt-level strict acc | 78,19 % | no disponible |
| HellaSwag (validación, 0-shot) | acc_norm | 71,64 % | 71,9 % |
| WinoGrande (debiased, 0-shot) | accuracy | 70,09 % | 68,6 % |
| ARC-Challenge (validación, 0-shot cloze) | accuracy | 46,82 % | 46,5 % |
| MMLU (test, 0-shot cloze) | accuracy | 38,42 % | no disponible |
| TruthfulQA (MC, cloze) | accuracy | 25,95 % | no disponible |
| Tasa de rechazo (304 prompts, juez Minos) | rechazos | 1/304 | 231/304 |
| JailbreakBench benign | rechazos | 0/100 | 31/100 |
| Divergencia KL (wikitext-2) | KL | 0,0128 | 0 |

Los resultados indican que la abliteration preserva las capacidades del modelo base dentro del margen de ruido de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia (según la propia model card):
  - Q4_K_M (2,8 GB): GPU de 4 GB o solo CPU.
  - Q6_K (3,6 GB): GPU de 6 GB o más (recomendada, casi sin pérdida).
  - BF16 GGUF (8,7 GB) o safetensors BF16 (9,3 GB): GPU de 12 GB o más para precisión completa.
  - Visión con GGUF: añadir mmproj F16 (0,7 GB) a cualquiera de las anteriores.
- GPU recomendadas: RTX 3050/3060 o 4060 para Q6_K; RTX 4070/4080 o superior para BF16; no hay datos publicados sobre A100/H100, aunque cualquier GPU de datacenter lo ejecuta sin problema.
- Cabe en GPU de consumo: sí, es uno de sus puntos fuertes; Q6_K funciona en una RTX 3060 de 6 GB y Q4_K_M incluso en portátiles con 4 GB o en CPU.
- Opciones de despliegue: llama.cpp (llama-server, con `-ngl 99 -c 16384`), Ollama (`ollama run hf.co/Jitheswar/Qwen3.5-4B-Amadeus:Q6_K`), LM Studio, Transformers (`AutoModelForImageTextToText`), vLLM y SGLang con los safetensors.
- Latencia y throughput: no disponible; la cabeza MTP incluida en los GGUF sugiere aceleración de generación, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Visión | Thinking | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Amadeus | 4,54 B | Sí (mmproj) | Sí | BF16, Q6_K, Q4_K_M | Apache 2.0 | Abliterated, tasa de rechazo 1/304 |
| Qwen/Qwen3.5-4B (base) | 4,54 B | Sí | Sí | Oficiales de Qwen | Apache 2.0 (según license_link) | Modelo original, 231/304 rechazos |
| Otros modelos abliterated de ~4 B (p. ej. variantes abliterated de Qwen3-4B de la comunidad) | ~4 B | Variable | Variable | GGUF habituales | Variable | Alternativas si se busca menor tamaño o base anterior |

No hay datos de benchmarks comparativos publicados frente a otras variantes abliterated; la comparación cuantitativa disponible es exclusivamente contra su modelo base.

## Limitaciones y advertencias

- Al ser un modelo descensurado, generará contenido dañino, ilegal o ofensivo si se le solicita: su uso es responsabilidad del desplegador y puede ser inadecuado o ilegal en producción orientada a usuarios finales.
- Los benchmarks son autoevaluaciones del autor con lm-evaluation-harness sobre GGUF en llama.cpp, no verificados por terceros; el MMLU de 38,42 % (0-shot cloze) es notablemente bajo y puede reflejar la metodología de evaluación más que la capacidad real.
- TruthfulQA en 25,95 % sugiere alta susceptibilidad a imitar concepciones erróneas comunes: riesgo de alucinación relevante, heredado del modelo base y posiblemente agravado al eliminar salvaguardas.
- La abliteration puede degradar sutilmente comportamientos relacionados con seguridad y robustez más allá de lo medido por los benchmarks estándar; la KL de 0,0128 garantiza cercanía estadística, no equivalencia conductual completa.
- Longitud de contexto no confirmada oficialmente; el ejemplo de llama.cpp usa 16384 tokens, pero no hay especificación del máximo real.
- No hay información sobre tool calling, agentes ni sobre los datos de preentrenamiento del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen (el license_link apunta a la de Qwen/Qwen3.5-4B).
- Proyecto comunitario con pocas descargas (811) y 3 likes en el momento de la ficha: madurez, mantenimiento y auditoría limitados.

## Enlaces

- Modelo: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Paper citado (abliteration / refusal directions, arXiv 2406.11717): https://arxiv.org/abs/2406.11717
- Sección de benchmarks completos de la model card: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus#full-benchmark-results
