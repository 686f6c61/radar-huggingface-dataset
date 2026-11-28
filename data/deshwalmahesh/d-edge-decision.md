# deshwalmahesh/d-edge-decision

## Resumen

D-Edge-Decision es un ajuste fino completo (full fine-tune) del modelo base domyn/Domyn-Edge-SFT, desarrollado por el usuario deshwalmahesh y publicado en Hugging Face. Se trata de un modelo de 3.928.787.968 parámetros (aproximadamente 3,93 mil millones) especializado en la toma de decisiones tipificadas: preguntas de sí/no, elección múltiple y puntuaciones graduadas. Su particularidad es que responde leyendo la distribución de probabilidad del siguiente token sobre códigos de opción de un solo token (A, B, C...), sin generar ningún token de salida. Esto lo convierte en un modelo de "Sistema Uno": una única pasada hacia delante produce una distribución de probabilidad nativa sobre las opciones, lo que aporta calibración y velocidad.

El modelo se presenta como una alternativa eficiente a los enfoques generativos para tareas de decisión, con un enfoque explícito en la calibración y la incertidumbre. Está entrenado únicamente en inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia actual radica en la creciente demanda de modelos pequeños y rápidos que puedan integrarse en pipelines de decisión automatizada con latencia mínima y sin coste de generación autoregresiva.

La información disponible sobre arquitectura interna, datos de entrenamiento y proceso de ajuste es limitada: la model card describe el método de inferencia y los resultados en JevBench, pero no detalla la composición del dataset ni los hiperparámetros del entrenamiento. El modelo se distribuye en formato safetensors con código personalizado (custom_code) y requiere trust_remote_code para su carga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en domyn/Domyn-Edge-SFT); detalles internos no disponibles |
| Parámetros totales | 3.928.787.968 (aproximadamente 3,93B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; se desconoce si existen versiones GGUF o cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con custom_code; requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de domyn/Domyn-Edge-SFT, un modelo de aproximadamente 3,93B parámetros. La model card no especifica la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, etc.), aunque por el tamaño y el pipeline de text-generation se trata presumiblemente de un transformer decoder-only. La innovación principal no reside en la arquitectura sino en el método de inferencia: el modelo no genera tokens, sino que lee la distribución del siguiente token sobre los códigos de opción de un solo token (A, B, C...) en la posición de decisión, produciendo directamente una distribución de probabilidad sobre las opciones. Esto elimina la generación autoregresiva y permite obtener una medida de incertidumbre calibrada de forma nativa.

El entrenamiento se realizó en un solo run, una sola época y sin ablaciones, según indica el autor. Los datasets utilizados son tasksource/tasksource-jev-typed-decisions, caiovicentino1/eikos-decisions y crh225/plumb-decisions. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo se evaluó en JevBench, un benchmark de decisiones tipificadas con 231 ítems públicos, donde alcanzó una precisión global de 0,835 (193/231), con un rendimiento perfecto en el nivel fácil (48/48), casi perfecto en medio (70/72) y notablemente inferior en difícil (75/111, 0,676).

## Capacidades

- Toma de decisiones tipificadas: responde preguntas de sí/no, elección múltiple y puntuaciones graduadas leyendo la distribución de probabilidad sobre códigos de opción de un solo token.
- Calibración e incertidumbre: al no generar tokens, la salida es una distribución de probabilidad nativa sobre las opciones, lo que permite medir la confianza del modelo de forma directa.
- Inferencia en una sola pasada: no requiere decodificación autoregresiva, lo que reduce la latencia y el coste computacional.
- Procesamiento de estados estructurados: el prompt incluye un campo "state" que puede ser texto o JSON, y el modelo lo procesa junto con la pregunta y las opciones.
- Soporte de conversación: utiliza plantilla de chat (apply_chat_template) con opción de desactivar el modo thinking (enable_thinking=False).
- Multilingüe: no disponible; el modelo solo declara soporte para inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; el modelo está diseñado para decisiones de un solo paso.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Clasificación binaria automatizada en pipelines de decisión: el modelo puede responder preguntas de sí/no leyendo la probabilidad del token "yes" frente a "no", lo que permite umbralizar decisiones con una medida de confianza calibrada. Es adecuado para tareas de moderación, filtrado o validación donde se requiere una respuesta rápida y una probabilidad asociada.
- Selección de opciones en sistemas de recomendación o enrutamiento: dado un conjunto de opciones (A, B, C...), el modelo devuelve una distribución sobre ellas en una sola pasada, lo que permite integrarlo en sistemas de enrutamiento de consultas o selección de acciones sin coste de generación.
- Evaluación de estados estructurados en formato JSON: el prompt admite un campo "state" que puede ser un objeto JSON; el modelo puede leerlo y emitir una decisión tipificada, lo que lo hace útil para validación de configuraciones, comprobación de condiciones o auditoría de datos.
- Puntuación graduada en encuestas o evaluaciones: el modelo puede responder con una puntuación de una escala predefinida (por ejemplo, 1-5) leyendo la distribución sobre los códigos numéricos, lo que permite obtener una puntuación esperada y una medida de incertidumbre.
- Toma de decisiones en entornos con latencia crítica: al no generar tokens, la inferencia es una única pasada hacia delante, lo que reduce la latencia frente a modelos generativos del mismo tamaño y lo hace adecuado para sistemas en tiempo real o de alto throughput.
- Investigación en calibración y uncertainty quantification: la salida es una distribución de probabilidad nativa sobre las opciones, lo que facilita estudios de calibración, detección de ambigüedad y análisis de incertidumbre en modelos de decisión.
- Evaluación comparativa en JevBench: el modelo se distribuye con un script de reproducción que permite evaluar cualquier modelo en JevBench con una sola GPU en aproximadamente un minuto, lo que lo convierte en una herramienta útil para benchmarking de modelos de decisión.

## Benchmarks y rendimiento

La model card presenta resultados en JevBench (231 ítems públicos). La siguiente tabla compara el rendimiento del modelo con otros sistemas en la misma categoría:

| # | Sistema | Composite | Intelligence | Speed | Cost |
|---|---|---|---|---|---|
| 1 | Plumb-4B | 76,57 | 84,77 | 92,61 | 60,30 |
| 2 | H2O-Lightning-4B † | 76,40 | 84,14 | 92,61 | 60,30 |
| 3 | Imajev-4B | 75,13 | 79,70 | 92,61 | 60,30 |
| 4 | JevK5 v0.2.0 | 74,75 | 78,43 | 92,61 | 60,30 |
| 5 | D-Edge-Decision (ours) | 73,97 | 75,89 | 92,61 | 60,30 |
| 5 | decider-4b v2 | 73,97 | 75,89 | 92,61 | 60,30 |
| 7 | SemIf (Qwen3.5-4B) | 72,72 | 72,09 | 92,61 | 60,30 |
| 8 | local-jev Qwen3.5-4B | 72,50 | 71,45 | 92,61 | 60,30 |
| 9 | Jev 1.13.0 (API) | 72,03 | 80,33 | 91,50 | 54,73 |
| 10 | reflex 4B | 71,84 | 69,55 | 92,61 | 60,30 |

Nota: los valores de Speed y Cost son idénticos para todos los modelos de 4B (fila de H2O-Lightning-4B en el board); Jev tiene su propia fila. El composite es la media armónica de las tres métricas. † indica resultado autodeclarado.

Desglose por dificultad en JevBench:

| Nivel | Correctas | Precisión |
|---|---|---|
| easy | 48/48 | 1,000 |
| medium | 70/72 | 0,972 |
| hard | 75/111 | 0,676 |
| all | 193/231 | 0,835 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, un modelo de 3,93B parámetros en bfloat16 requiere aproximadamente 7,9 GB solo para los pesos, más memoria para activaciones y caché KV.
- GPU recomendadas: la model card menciona una H200 para la reproducción de los resultados de JevBench. No se especifican otras GPU recomendadas.
- Compatibilidad con GPU de consumo: no disponible. Por tamaño, un modelo de 3,93B en bfloat16 podría caber en GPU de consumo con 12-16 GB de VRAM (por ejemplo, RTX 4080/4090), pero no se confirma en la información proporcionada.
- Opciones de despliegue: el modelo se carga con transformers (AutoModelForCausalLM) y requiere trust_remote_code=True. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible. La model card indica que la reproducción de JevBench (231 ítems) tarda aproximadamente un minuto en una sola GPU, con batches de 8, pero no se proporcionan métricas de latencia o throughput por petición.

## Comparativa con modelos similares

La siguiente tabla compara D-Edge-Decision con alternativas de la misma categoría (modelos de decisión de aproximadamente 4B parámetros) según los datos de JevBench:

| Modelo | Parámetros | Contexto | JevBench Composite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-Edge-Decision | 3,93B | No disponible | 73,97 | Apache 2.0 | Hugging Face |
| Plumb-4B | No disponible (aproximadamente 4B) | No disponible | 76,57 | No disponible | No disponible |
| H2O-Lightning-4B | No disponible (aproximadamente 4B) | No disponible | 76,40 | No disponible | No disponible |
| Imajev-4B | No disponible (aproximadamente 4B) | No disponible | 75,13 | No disponible | No disponible |
| decider-4b v2 | No disponible (aproximadamente 4B) | No disponible | 73,97 | No disponible | No disponible |
| SemIf (Qwen3.5-4B) | No disponible (aproximadamente 4B) | No disponible | 72,72 | No disponible | No disponible |

Nota: los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada; solo se dispone de sus resultados en JevBench. D-Edge-Decision empata en composite con decider-4b v2 en la posición 5.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada. Al estar entrenado solo en inglés, puede presentar sesgos culturales y lingüísticos propios de los datos de entrenamiento, que no se detallan.
- Riesgo de alucinación: el modelo no genera texto libre, sino que selecciona entre opciones predefinidas, lo que reduce el riesgo de alucinación en el sentido tradicional. Sin embargo, puede asignar alta probabilidad a opciones incorrectas, especialmente en ítems difíciles (precisión de 0,676 en el nivel hard de JevBench).
- Limitaciones de contexto: no se especifica la longitud máxima de contexto. El prompt incluye un campo "state" que puede ser texto o JSON, pero se desconoce el límite de tokens.
- Limitaciones de idioma: el modelo solo declara soporte para inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y la licencia. No se identifican restricciones adicionales en la información proporcionada.
- Caveats para producción: el modelo requiere trust_remote_code=True, lo que implica ejecutar código personalizado del repositorio; es necesario auditar dicho código antes de usarlo en producción. Además, el entrenamiento se realizó en un solo run, una sola época y sin ablaciones, lo que limita la evidencia sobre la robustez y generalización del modelo. La evaluación se realizó en un único benchmark (JevBench) con 231 ítems, un tamaño de muestra reducido.
- Dependencia de códigos de un solo token: el método de inferencia requiere que los códigos de opción (A, B, C...) sean tokens únicos en la posición de decisión; si el tokenizador no los trata como tales, el enfoque no es aplicable directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deshwalmahesh/d-edge-decision
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- Repositorio de JevBench: https://github.com/fstandhartinger/jevbench
- Dataset tasksource/tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset caiovicentino1/eikos-decisions: https://huggingface.co/datasets/caiovicentino1/eikos-decisions
- Dataset crh225/plumb-decisions: https://huggingface.co/datasets/crh225/plumb-decisions
