# flavianv/qwen3-4b-musical-instruments-sft-ranker-head-20260923

## Resumen

El modelo `flavianv/qwen3-4b-musical-instruments-sft-ranker-head-20260923` es un checkpoint de tipo *head-only*: no contiene pesos completos de un modelo de lenguaje ni un adaptador LoRA, sino únicamente una cabeza escalar de 2.560 pesos entrenada sobre un backbone Qwen3-4B congelado. Su función es puntuar la relevancia de un conjunto de títulos de productos de instrumentos musicales dada una petición de compra, devolviendo un valor real sin restringir (mayor es mejor). Lo publica el usuario flavianv bajo licencia Apache 2.0.

El interés de esta ficha es acotado pero claro: se trata de un artefacto de investigación reproducible para *ranking* de productos, con métricas de validación y test declaradas por el autor (96,0838 % de exactitud por pares en test y 89,0909 % de selección correcta de bundle entre candidatos de la misma consulta). No es un modelo generativo: no produce texto ni listas, solo puntuaciones, y requiere descargar por separado el backbone SFT del que depende.

La relevancia actual viene de su uso como función de recompensa o reranker dentro de pipelines de recuperación y de RLHF/GRPO en dominios de e-commerce especializado, donde el coste de un cross-encoder completo puede ser prohibitivo. Al ser una cabeza de 2.560 pesos, el almacenamiento y el intercambio del artefacto son triviales; el coste computacional real recae en el backbone Qwen3-4B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3-4B (transformer decoder-only) congelado más cabeza escalar lineal de ranking (2.560 pesos) |
| Parámetros totales | 2.560 pesos en este repositorio (solo la cabeza); el backbone Qwen3-4B (~4.000 millones de parámetros) se descarga aparte desde el checkpoint SFT |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Máximo 2.048 tokens de entrada; las entradas más largas se rechazan |
| Tipos de cuantización | No disponible (el entrenamiento usa forward en BF16 con pesos de cabeza en FP32; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no se declara en la información proporcionada; el backbone subyacente es Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (librería `pytorch`); carga mediante `ranker.py`, con verificación de checksum de la cabeza (SHA256 `d4777b553f05bb0dd17cc7533e8a869b569498c9759f1ce3c2935490b81b3fcc`). No se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina un backbone Qwen3-4B en modo SFT (congelado durante el entrenamiento de la cabeza) con una proyección escalar final. El único componente entrenado es `score.weight`, con 2.560 pesos; no se empleó LoRA. Las entradas se serializan como instrucción de sistema, petición del usuario y respuesta del asistente con el formato `{"products": ["title", ...]}`, con el modo *thinking* desactivado y sin prefijo de generación. El modelo solo consume la petición de compra y los títulos de producto: no admite identificadores, roles, categorías, precios ni otros metadatos. El renderizador y la instrucción completa están en `ranker.py`.

El entrenamiento usó pérdida pairwise logística tipo Bradley–Terry, con tasa de aprendizaje 1e-4, microbatch de 4 pares × acumulación 4 (16 pares por actualización), AdamW, recorte de gradiente 1, semilla 42 y máximo de 2.048 tokens. Fueron dos épocas y 822 actualizaciones; tras la época 1 se restauraron optimizador y estado del RNG y se reinició un schedule coseno de una época con 3 % de warmup. Los datos provienen del split `musical-instruments-ranker-unseen-20260923` (1.648 consultas/6.575 pares en train; 274/1.092 en validación; 275/1.098 en test), con negativos sintéticos generados por cuatro estrategias: conjunto aleatorio, colisión de rol, ítem incorrecto y consulta incorrecta. Los grupos consulta/conjunto de productos no cruzan splits, aunque los productos sí pueden solaparse.

## Capacidades

- Puntuación de relevancia: asigna un valor real no acotado a un par (petición de compra, título de producto), donde un valor mayor indica mayor preferencia.
- Selección de bundles: capacidad específica de elegir el conjunto correcto de productos entre varios candidatos para una misma consulta (89,0909 % de acierto en test, 245/275).
- Discriminación entre negativos sintéticos: entrenado para separar conjuntos aleatorios, colisiones de rol, ítems incorrectos y candidatos de otra consulta.
- Integración como función de recompensa: el transformador `sigmoid_score_over_3` mapea la puntuación a (0,1) para su uso en GRPO.
- No genera texto: no dispone de cabeza de lenguaje activa en este checkpoint, por lo que no produce listas, JSON ni explicaciones.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso: no aplica a un modelo de ranking.
- Capacidades multilingües: no disponible.
- Capacidades especiales: ninguna declarada más allá del ranking (sin visión, audio ni modo *thinking*; de hecho el *thinking* se desactiva en la serialización).

## Casos de uso

- Reranking en buscadores de e-commerce de instrumentos musicales: dada la consulta del usuario en lenguaje natural y los títulos devueltos por un retriever (BM25, embeddings), la cabeza reordena los candidatos con una puntuación pairwise. Es adecuado porque el coste de puntuar es una pasada del backbone de 4B sobre 2.048 tokens como máximo, sin generación.
- Selección de packs y bundles: para consultas como "necesito un micrófono y un soporte para grabar en casa", el modelo evalúa el conjunto completo de títulos y elige la combinación coherente, en lugar de puntuar ítems aislados. Los datos de test reportados para esta tarea concreta (89,0909 %) permiten dimensionar su uso en recomendadores de kits.
- Función de recompensa en RLHF/GRPO: el pipeline puede usar `sigmoid_score_over_3` como señal escalar para ajustar un LLM generador de listas de productos; el autor advierte que no es una probabilidad calibrada y que el validador externo es quien rechaza las trazas de protocolo inválido (JSON malformado, duplicados o recuento incorrecto).
- Filtrado de candidatos antes de un reranker más caro: al ser una cabeza de 2.560 pesos sobre un backbone de 4B, se puede usar como primera etapa para descartar negativos evidentes y reservar modelos mayores o llamadas a APIs para el top-k.
- Curación de datasets de preferencia: generar etiquetas pairwise sintéticas sobre catálogos de productos musicales para construir o ampliar conjuntos de entrenamiento, siguiendo la misma estrategia de negativos usada en su entrenamiento (conjunto aleatorio, colisión de rol, ítem incorrecto, consulta incorrecta).
- Evaluación comparativa de sistemas de recuperación: al fijar la cabeza como juez, se pueden comparar distintas configuraciones de un retriever o de un generador de candidatos con una métrica estable de exactitud por pares y de top-1 por consulta.
- Investigación sobre cabezas de ranking eficientes: sirve como referencia reproducible para estudiar cuánto rinde una cabeza escalar minúscula entrenada sobre un backbone congelado frente a alternativas con más parámetros entrenables, dado que el autor publica el desglose de selección y evaluación.

## Benchmarks y rendimiento

Datos publicados por el autor para esta cabeza (seleccionada por top-1 de la misma consulta en validación y, después, por exactitud pairwise; el test se evaluó solo tras la selección):

| Métrica | Validación | Test |
|---|---|---|
| Exactitud pairwise | 95,5128 % | 96,0838 % |
| Top-1 misma consulta | 86,1314 % | no disponible |
| Selección de bundle correcto (misma consulta) | no disponible | 89,0909 % (245/275) |

Comparación interna con la cabeza del modelo base previo, sobre el mismo test:

| Modelo | Exactitud pairwise (test) | Top-1 (test) |
|---|---|---|
| Cabeza seleccionada (este repositorio, 822 actualizaciones) | 96,0838 % | 89,0909 % (selección de bundle) |
| Cabeza del modelo base previo | 95,6284 % | 82,1818 % |

El autor indica explícitamente que se trata de una comparación no causal, porque cambiaron tanto el backbone como los datos de entrenamiento de la cabeza. No se han publicado resultados frente a benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo propio a partir de los ~4.000 millones de parámetros del backbone, no aportado por el autor): aproximadamente 8-10 GB en BF16/FP16, 5-6 GB en cuantización de 8 bits y 3-4 GB en 4 bits, más un margen reducido para la caché KV (contexto limitado a 2.048 tokens).
- GPU recomendadas: A100, H100 o L40S para despliegues con throughput alto; RTX 4090 o RTX 3090 para desarrollo y lotes pequeños.
- Cabe en GPU de consumo: sí. En BF16 es razonable en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); en 4-8 bits puede ejecutarse en tarjetas de 8 GB (RTX 3070, RTX 4060).
- Opciones de despliegue: el repositorio proporciona `ranker.py` sobre PyTorch con `transformers`, sin necesidad de `trust_remote_code`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, porque la cabeza no está integrada en esos runtimes: no disponible.
- Latencia y throughput: no disponible. Al no generarse tokens (una sola pasada, sin decodificación autoregresiva), el coste dominante es un forward del backbone de 4B sobre un máximo de 2.048 tokens.
- Requisito adicional: el backbone SFT debe descargarse por separado y fijarse a la revisión `1d6b019dfaaf368fe8af2ab593d66a3ee1c215a6`; el cargador rechaza una cabeza con checksum distinto.

## Comparativa con modelos similares

No se han publicado en la información disponible resultados de benchmarks comparables con modelos alternativos de la misma categoría (cross-encoders de reranking como bge-reranker, MiniLM cross-encoder u otros). La única comparación con datos numéricos es la interna entre esta cabeza y la del modelo base previo, recogida en la sección anterior.

| Aspecto | Este modelo (cabeza seleccionada) | Cabeza del modelo base previo | Alternativas de reranking genéricas |
|---|---|---|---|
| Parámetros | 2.560 en la cabeza + backbone Qwen3-4B (~4B) | No disponible | No disponible |
| Contexto | 2.048 tokens máximo | No disponible | No disponible |
| Exactitud pairwise (test) | 96,0838 % | 95,6284 % | No disponible |
| Top-1 / selección de bundle (test) | 89,0909 % | 82,1818 % | No disponible |
| Licencia | Apache 2.0 | No disponible | No disponible |
| Disponibilidad | Repositorio público, 0 descargas y 0 likes en el momento de la consulta | No disponible | No disponible |

## Limitaciones y advertencias

- Es un checkpoint *head-only*: no son pesos completos de un modelo ni un adaptador LoRA. Sin el backbone SFT (`flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923`, revisión `1d6b019dfaaf368fe8af2ab593d66a3ee1c215a6`) no se puede ejecutar. El cargador verifica el SHA256 de la cabeza y rechaza cualquier otra.
- Dominio estrecho: entrenado exclusivamente para instrumentos musicales. No hay evidencia de que generalice a otros catálogos o idiomas.
- Entrada restringida: solo petición de compra y títulos de producto. No admite identificadores, roles, categorías, precios ni metadatos. La entrada máxima es de 2.048 tokens y las más largas se rechazan, no se truncan.
- No valida el protocolo: el scorer no impone de forma independiente las reglas de JSON, duplicados ni recuento; el autor indica que el validador externo asigna cero a las trazas GRPO inválidas. No debe usarse en solitario como filtro de formato.
- La salida no es una probabilidad: `sigmoid_score_over_3` es una transformación para GRPO y no una probabilidad calibrada. Las puntuaciones son valores reales sin acotar.
- Riesgo de sesgo: los negativos son sintéticos (conjunto aleatorio, colisión de rol, ítem incorrecto, consulta incorrecta) y el rendimiento sobre ellos no es evidencia de preferencia humana ni garantiza robustez como recompensa en GRPO. Las categorías repetidas pueden ser legítimas y los negativos derivados de taxonomía se presumen preferencias.
- Riesgo de alucinación: no aplica en sentido generativo al no producir texto, pero las puntuaciones pueden favorecer títulos con solapamiento léxico con la consulta sin corresponder a relevancia real.
- Solapamiento de datos: los productos pueden aparecer en varios splits aunque los grupos consulta/conjunto no crucen; el antiguo holdout 507 se usó para desarrollo del modelo. El autor no reclama ningún resultado como benchmark intacto de extremo a extremo.
- Licencia: el repositorio se publica bajo Apache 2.0, lo que permite uso comercial de la cabeza; conviene verificar por separado los términos del backbone SFT y del modelo ancestro Qwen/Qwen3-4B.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- No se incluyen optimizador, registros privados, credenciales ni los pesos completos del backbone.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-sft-ranker-head-20260923
- Backbone SFT requerido: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923
- Modelo ancestro preentrenado: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de ranking: https://huggingface.co/datasets/flavianv/musical-instruments-ranker-unseen-20260923/tree/2f815b7ff8848c1223fdc84c895819f778f7679b
- Script de carga e inferencia: `ranker.py`, incluido en el repositorio del modelo
