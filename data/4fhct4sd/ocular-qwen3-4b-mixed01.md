# 4fhct4sd/ocular-qwen3-4b-mixed01

## Resumen

El modelo `ocular-qwen3-4b-mixed01`, desarrollado por el usuario 4fhct4sd, es un finetune del modelo base Qwen/Qwen3-4B mediante la técnica DoRA (Weight-Decomposed Low-Rank Adaptation) aplicada sobre una base cuantizada a 4-bit NF4 en estilo QLoRA. El resultado se ha fusionado y cuantizado a GGUF en dos variantes de rango de adaptador (rank 128 y rank 32), lo que permite comparar la capacidad de adaptación frente al coste paramétrico. El repositorio incluye cuatro archivos GGUF: `A-q4_k_m.gguf` y `A-q8_0.gguf` (rank 128) y `C-q4_k_m.gguf` y `C-q8_0.gguf` (rank 32).

El modelo se entrenó sobre un corpus personal de 22,08 millones de tokens procedentes de nueve fuentes, con una proporción destacada de datos multilingües (40,1 % del dataset Rosetta con 1.182 tareas en 991 idiomas) y sesiones personales de Claude y ChatGPT que incluyen trazas de razonamiento y tool calls. La motivación principal del autor es investigar la relación entre la capacidad del adaptador y la transferencia a tareas y lenguas no vistas, y los resultados sugieren que un rank 32 captura el 77 % de la señal de transferencia con una cuarta parte de los parámetros entrenables.

La relevancia actual del modelo reside en su enfoque metodológico: no es un finetune convencional, sino un experimento controlado que evalúa cómo la capacidad del adaptador afecta a la generalización. Aunque el autor declara defectos conocidos (concatenación sin separadores, empaquetado de secuencias, peso de Rosetta posiblemente excesivo), el modelo se ofrece como un recurso para estudiar transferencia multilingüe y de tareas en modelos de 4B parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3-4B) con adaptadores DoRA fusionados |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no especificado en la model card (heredado del base Qwen3-4B) |
| Tipos de cuantización | GGUF Q4_K_M y Q8_0 |
| Idiomas soportados | Multilingüe (entrenado con datos de 991 idiomas; el corpus incluye Rosetta) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no publicado; el repositorio contiene únicamente archivos GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de 4.000 millones de parámetros. El finetune aplica DoRA (Weight-Decomposed Low-Rank Adaptation) sobre las siete proyecciones de atención y MLP, con la base congelada en 4-bit NF4 (estilo QLoRA). Se entrenaron dos configuraciones de rank: 128 (265M parámetros entrenables, 6,19 % del total) y 32 (67M, 1,64 %). El entrenamiento se realizó con secuencias de 2048 tokens, una sola época, precisión bf16 y optimizador paged_adamw_8bit, en una RTX 5090 durante aproximadamente 3,8 horas por variante.

El corpus de entrenamiento suma 22,08 millones de tokens de nueve fuentes: Rosetta (40,1 %, 1.182 tareas × 991 idiomas), sesiones personales de Claude con tool calls (35,2 %), el mismo corpus reordenado mediante traversal de grafo (13,0 %), trazas de razonamiento de ChatGPT (5,6 %) y cinco fuentes menores (Faraday, Redbook, Maxwell, Machiavelli, Socrates) que completan el 6,2 %. El autor destaca que el holdout se cortó por tareas y lenguas completas, garantizando que no haya pares (tarea, idioma) solapados entre entrenamiento y evaluación.

## Capacidades

- Generación de texto multilingüe: entrenado con datos de 991 idiomas, aunque la cobertura por lengua no se detalla.
- Razonamiento y tareas de comprensión: incluye trazas de razonamiento de ChatGPT en el corpus, lo que puede reforzar cadenas de pensamiento.
- Soporte de tool calling: el corpus contiene sesiones de Claude con tool calls conservadas, lo que sugiere cierta exposición a llamadas de función, aunque no se garantiza su robustez.
- Capacidad de transferencia a tareas no vistas: los datos de evaluación muestran mejora en perplexity sobre tareas nunca entrenadas (de 17,57 a 4,73-4,82).
- Capacidad de transferencia a lenguas no vistas: mejora de perplexity de 15,23 a 1,87 (rank 128) y 2,29 (rank 32) en tareas entrenadas en otras lenguas.
- No se especifican capacidades de visión, audio ni modo de pensamiento explícito más allá del razonamiento implícito.

## Casos de uso

- **Traducción y localización multilingüe**: dado el 40 % del corpus en Rosetta con tareas en 991 idiomas, el modelo puede utilizarse para traducción automática o adaptación de contenido a lenguas minoritarias, especialmente en escenarios donde se dispone de pocos datos monolingües.
- **Agentes conversacionales con herramientas**: el corpus incluye sesiones de Claude con tool calls conservadas, lo que permite experimentar con agentes que invocan funciones en un pipeline de automatización, aunque la robustez debe validarse en producción.
- **Generación de código para tareas matemáticas**: la fuente Rosetta contiene tareas que incluyen programación; el autor advierte que en el modelo hermano de 1,7B la pregunta "¿cuánto es 17 × 23?" genera un programa en C# en lugar de responder, por lo que no es fiable para cálculo directo, pero sí para generar código.
- **Investigación en transferencia de aprendizaje**: el par de checkpoints (rank 128 vs rank 32) permite estudiar cómo la capacidad del adaptador afecta a la generalización a tareas y lenguas no vistas, útil para experimentos académicos.
- **Extracción de datos estructurados en lenguas poco comunes**: la exposición a 991 idiomas puede ayudar a extraer entidades o estructuras de texto en lenguas con pocos recursos, aunque con cautela por la cobertura variable.
- **Prototipado de asistentes personales con contexto largo**: el modelo base Qwen3-4B soporta contextos largos (no especificado aquí), y el finetune puede usarse para asistentes que mantengan conversaciones multi-turno con memoria, dado el entrenamiento con conversaciones y trazas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona únicamente métricas de perplexity sobre el holdout, que se presentan en la siguiente tabla:

| Métrica | rank 128 | rank 32 |
|---|---|---|
| Parámetros entrenables | 265M (6,19 %) | 67M (1,64 %) |
| Pérdida de entrenamiento | 1,36 | 1,50 |
| Perplexity en lenguas no vistas (15,23 inicial) | 1,87 | 2,29 |
| Perplexity en tareas no vistas (17,57 inicial) | 4,73 | 4,82 |
| Gap de transferencia (widening gap) | +0,7844 | +0,6024 |

El autor interpreta que el rank 32 captura el 77 % de la señal de transferencia con una cuarta parte de los parámetros, y que la capacidad adicional del rank 128 se concentra en re-render tareas conocidas en otras lenguas, sin ventaja en tareas genuinamente nuevas (4,73 vs 4,82).

## Requisitos de hardware

- **VRAM estimada para inferencia**: los archivos GGUF Q4_K_M ocupan 2,50 GB y los Q8_0 4,28 GB. Con overhead de runtime, un Q4_K_M puede ejecutarse en GPUs con 4-6 GB VRAM, y un Q8_0 en GPUs con 8 GB o más.
- **GPU recomendadas**: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) para Q8_0; las Q4_K_M pueden correr en GPUs más modestas (4-6 GB). El entrenamiento se realizó en RTX 5090.
- **Despliegue**: al estar en formato GGUF, es compatible con llama.cpp, Ollama, llama-cpp-python y servidores como llama-server. También puede usarse con TGI si se convierte a safetensors, pero el repo solo ofrece GGUF.
- **Latencia y throughput**: no se han publicado mediciones específicas; en una GPU consumer de gama media, un modelo de 4B en Q4_K_M suele alcanzar decenas de tokens por segundo, pero no hay datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3-4B (base) | 4.022M | no especificado | Apache-2.0 | safetensors | Modelo base sin finetune; referencia para comparar el efecto del DoRA |
| huihui-ai/Qwen3-4B-abliterated | 4.022M | no especificado | Apache-2.0 | safetensors y GGUF | Finetune "abliterated" que elimina restricciones de contenido; sin datos de transferencia |
| 4fhct4sd/ocular-qwen3-4b-mixed01 | 4.022M | no especificado | Apache-2.0 | GGUF | Finetune DoRA con dos ranks; enfocado en transferencia multilingüe y de tareas |

No se dispone de benchmarks comparativos entre estos modelos; la comparación se limita a arquitectura, licencia y formato de pesos. El modelo abliterated es una alternativa con propósitos distintos (eliminación de restricciones de seguridad), mientras que el base sirve como punto de partida para evaluar el impacto del finetune.

## Limitaciones y advertencias

- **Defectos de entrenamiento declarados**: el autor advierte que los registros de entrenamiento se concatenaron sin separadores, lo que enseñó transiciones entre documentos no relacionados como continuaciones; las conversaciones quedaron parcialmente cubiertas por `<|im_end|>`, pero el 6 % de documentos planos no recibió protección.
- **Empaquetado de secuencias**: el slicing de bloques de 2048 tokens corta registros a mitad, lo que puede degradar la coherencia en contextos largos.
- **Weight decay = 0**: la falta de regularización puede afectar la generalización, aunque los datos de holdout muestran mejoras de perplexity.
- **Sesgo de corpus**: el 40 % de Rosetta es probablemente excesivo según el autor, lo que puede sesgar el modelo hacia tareas de traducción o programación en detrimento de razonamiento aritmético (ejemplo del modelo hermano que responde con código C# a una multiplicación).
- **Riesgo de alucinación**: no se han evaluado tasas de alucinación; el modelo es un finetune sobre un corpus personal sin evaluación de seguridad.
- **Restricciones de uso comercial**: licencia Apache-2.0, que permite uso comercial, pero los datos de entrenamiento son "corpus personal" y no se detalla la procedencia de todas las fuentes (Rosetta, sesiones de Claude/ChatGPT), lo que puede implicar riesgos de derechos de autor.
- **Soporte de tool calls no verificado**: aunque el corpus contiene tool calls, no se ha validado la capacidad del modelo para ejecutarlas de forma fiable en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4fhct4sd/ocular-qwen3-4b-mixed01
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Variante abliterated de Qwen3-4B: https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
- Implementación de referencia de Qwen3-4B: https://github.com/alyxya/qwen3-4b
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Notas de despliegue en pegainfer: https://open-infer.org/models/qwen3-4b/
