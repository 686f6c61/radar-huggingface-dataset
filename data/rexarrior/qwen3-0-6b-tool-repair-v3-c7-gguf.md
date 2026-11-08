# rexarrior/Qwen3-0.6B-Tool-Repair-v3-C7-GGUF

## Resumen

Qwen3-0.6B-Tool-Repair-v3-C7-GGUF es un checkpoint de investigación publicado por el usuario rexarrior (Qwen Lab) a partir del modelo base Qwen3-0.6B de Alibaba Qwen. No se trata de un modelo nuevo entrenado desde cero, sino de una modificación quirúrgica de los pesos orientada a mejorar el comportamiento en tool calling (llamada a funciones) sobre tareas del benchmark Berkeley Function Calling Leaderboard (BFCL). El modelo se distribuye en formato GGUF F16 para su uso con llama.cpp.

La innovación principal es metodológica: el autor edita únicamente la proyección de salida de la última capa MLP (`blk.27.ffn_down.weight`, matriz de 1024 × 3072), aplicando ajuste supervisado de gradientes sobre activaciones cacheadas y ediciones analíticas con restricciones de preservación. La serie de checkpoints C1–C7 documenta la evolución de estas intervenciones, siendo C7 la versión publicada.

Es relevante como ejemplo de ingeniería de pesos de bajo nivel aplicada a un modelo pequeño (596 millones de parámetros), pero debe interpretarse como un artefacto de investigación: el propio autor reporta una caída en el rendimiento general de BFCL single-turn respecto al original (2281/3641 frente a 2463/3641), compensada por mejoras en el conjunto A6 (40/48 frente a 24/48). No hay datos de idiomas soportados ni benchmarks estándar de razonamiento o generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B); modificación de la capa `blk.27.ffn_down.weight` |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16 (unico archivo publicado en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16), 1.198.182.176 bytes |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de aproximadamente 596 millones de parámetros. Sobre esa base, el autor no reentrena el modelo completo: la intervención se limita a la matriz de proyección de salida de la última capa MLP (`blk.27.ffn_down.weight`, dimensión 1024 × 3072). La trayectoria documentada es WSP38 → v2 → v3 inicial → C1–C7. En v2 se escaló la fila de fin de turno a 0,9 veces la original; en v3 inicial se escaló además la etiqueta de cierre de herramienta.

Durante C1–C7 se combinaron dos técnicas: ajuste supervisado de gradientes sobre activaciones cacheadas y ediciones analíticas. C7 parte de C5, recoge la activación de entrada de la última MLP en cada posición de predicción seleccionada y resuelve un cambio de pesos que corrige los objetivos de reparación, ponderando por covarianza de los ejemplos de preservación. Cuando un ancla previamente correcta cambia, se añade la restricción de que la actualización de pesos multiplicada por esa activación sea cero, acumulando restricciones en resoluciones sucesivas. El conjunto de calibración contenía dos secuencias de reparación y 385 de preservación. La adición analítica final tiene rango como máximo tres antes del redondeo, y la matriz almacenada cambió un 8,55 % de su norma de Frobenius inicial respecto a v3. Las 300 tareas difíciles de BFCL se usaron durante el desarrollo.

## Capacidades

- Generación de texto conversacional en formato chat (compatible con plantilla Jinja de llama.cpp).
- Tool calling / function calling, con foco específico en la corrección de llamadas malformadas y argumentos espurios.
- Razonamiento de un solo turno en el contexto de selección de herramientas (el autor recomienda `--single-turn` y `--reasoning off` en el comando de ejemplo).
- Soporte de modo chat mediante `--jinja`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación sobre edición de pesos: el checkpoint sirve como caso reproducible para estudiar cómo modificaciones de bajo rango en una sola matriz afectan al comportamiento de tool calling, con protocolo y checkpoints publicados en el repositorio qwen-lab.
- Reproducción de benchmarks de function calling: permite replicar las puntuaciones BFCL y A6 del autor usando el scorer oficial y las definiciones de herramientas del protocolo.
- Pruebas de regresión en pipelines de agentes: útil para comparar el comportamiento de un modelo pequeño antes y después de una intervención de pesos en tareas de selección de herramienta.
- Evaluación de robustez frente a prompts con herramientas irrelevantes: el autor documenta objetivos de reparación específicos para llamadas malformadas en prompts sin herramienta relevante.
- Prototipado local de asistentes con tool calling en hardware muy limitado: al ser un GGUF F16 de 0,6B, puede ejecutarse con llama.cpp en equipos de gama baja para experimentación.
- Estudio de compromisos entre especialización y rendimiento general: permite medir la pérdida en BFCL single-turn (2281 frente a 2463) a cambio de la mejora en A6 (40 frente a 24).

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (scorer oficial de BFCL, búsqueda web excluida):

| Respuestas correctas / casos evaluados | Original | v3-C7 |
|---|---:|---:|
| A6 / 48 | 24 | 40 |
| BFCL single-turn / 3641 | 2463 | 2281 |
| BFCL multi-turn / 800 | 24 | 4 |
| API-Bank offline next call / 744 | 133 | 127 |
| IFEval strict prompt / 541 | 315 | 287 |

Progresión interna de checkpoints durante el desarrollo:

| Checkpoint | Tareas difíciles seleccionadas / 300 | Desarrollo previo / 200 | A6 / 48 |
|---|---:|---:|---:|
| v3 inicial | 9 | 124 | 38 |
| C1 | 17 | 124 | 38 |
| C5 | 139 | 139 | 40 |
| C6 | 136 | 141 | 40 |
| C7 publicado | 141 | 143 | 40 |

C7 preservó 279/279 IDs requeridos de BFCL y 40/40 IDs requeridos de A6. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: en torno a 1,2 GB para los pesos, más overhead de contexto KV; apto para GPUs con 2 GB o más.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria unificada suficiente.
- Despliegue previsto: llama.cpp (`llama-cli`, `llama-server`); el repo declara compatibilidad con endpoints.
- Comando de ejemplo del autor: `llama-cli -m Qwen3-0.6B-Tool-Repair-v3-C7-F16.gguf --jinja --reasoning off --temp 0 --single-turn -p "What information would you need to look up tomorrow's weather?"`.
- Latencia y throughput: no disponibles en la información proporcionada.
- No se publican cuantizaciones Q4/Q8; solo F16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-Tool-Repair-v3-C7 (este) | 596 M | no disponible | Tool calling especializado (edición de pesos) | Apache 2.0 | GGUF F16 en HF |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la informacion | Modelo base generalista | Apache 2.0 | HF (incl. GGUF oficial) |
| QuantFactory/Qwen3-Reranker-0.6B-GGUF | 0,6 B | no disponible | Reranking / embeddings | no disponible en la informacion | GGUF en HF |

La comparación directa de rendimiento solo es posible frente al Qwen3-0.6B original, con los datos de la tabla de benchmarks. Frente a modelos de otro tamaño o tarea (reranking, embeddings) no hay métricas comunes publicadas.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el autor lo describe explícitamente como tal.
- Regresión en BFCL single-turn (2281 frente a 2463) y en BFCL multi-turn (4 frente a 24), además de caídas en API-Bank (127 frente a 133) e IFEval (287 frente a 315).
- Las 300 tareas difíciles de BFCL y el conjunto A6 se usaron durante el desarrollo, por lo que las cifras de A6 no son una evaluación limpia e independiente.
- Solo se distribuye F16; no hay cuantizaciones de menor precisión publicadas.
- No se documentan idiomas soportados ni evaluación multilingüe.
- No se documenta la longitud de contexto efectiva del checkpoint.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; heredables del modelo base Qwen3-0.6B.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías por parte del autor de la modificación.
- El rendimiento en benchmarks depende del protocolo, las definiciones de herramientas y el scorer; el comando de ejemplo no reproduce las puntuaciones por sí solo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rexarrior/Qwen3-0.6B-Tool-Repair-v3-C7-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- GGUF oficial del base: https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- Repositorio Qwen Lab (fine-tuning y protocolo): https://github.com/Rexarrior/qwen-lab/blob/main/fine-tuning/README.md
- IDs de desarrollo (splits v3): https://github.com/Rexarrior/qwen-lab/blob/main/fine-tuning/splits-v3.json
- Reranker relacionado (referencia de la búsqueda): https://huggingface.co/QuantFactory/Qwen3-Reranker-0.6B-GGUF
