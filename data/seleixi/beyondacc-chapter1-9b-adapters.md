# seleixi/beyondacc-chapter1-9b-adapters

## Resumen

`seleixi/beyondacc-chapter1-9b-adapters` es una colección de adaptadores LoRA (librería PEFT) sobre el modelo base `Qwen/Qwen3.5-9B` en bf16, orientados a evaluación automática de respuestas generadas por modelos de lenguaje bajo el paradigma "beyond accuracy", es decir, ir más allá de las métricas de acierto/fallo y producir juicios cualitativos estructurados. El autor es el usuario `seleixi` y la model card describe adaptadores de dos familias: `sft_vNN`, resultado de la etapa de ajuste supervisado, y `grpo_vNN`, resultado de SFT seguido de GRPO (optimización de política con recompensa).

El interés de esta ficha es acotado pero técnico: no se trata de un modelo generativo de propósito general, sino de artefactos de evaluación pensados para puntuar respuestas multi-turno. La model card documenta que las versiones `v17`-`v21` emitían siete puntuaciones de aspecto más un campo `mean`, mientras que desde `v22` el contrato de salida se reduce a tres campos (`overall`, `nominal_label`, `rationale`), lo que implica que mezclar prompts antiguos con adaptadores nuevos degrada la calidad del juicio. Esta ruptura de contrato es el detalle más relevante para cualquier integración en producción.

El repositorio ocupa 16,2 GB, un tamaño notablemente superior al de un único adaptador LoRA típico sobre un modelo de 9B, lo que sugiere que contiene varios adaptadores correspondientes a distintas versiones, aunque la model card no detalla el inventario exacto de ficheros. No se declaran licencia, idiomas, pipeline ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre el transformer denso `Qwen/Qwen3.5-9B`; arquitectura del modelo base no disponible |
| Parámetros totales | Modelo base de 9B; número de parámetros entrenables de cada adaptador no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el modelo base se indica en bf16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Modelo base | `Qwen/Qwen3.5-9B` (bf16) |
| Librería | peft |
| Variantes publicadas | Adaptadores `sft_vNN` (solo SFT) y `grpo_vNN` (SFT + GRPO); versiones citadas: v17 a v23 |
| Tamaño del repositorio | 16,2 GB |
| Fecha de creación / actualización | 25 de agosto de 2026 / 13 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Cada adaptador se entrena en dos etapas: primero un ajuste supervisado (SFT) sobre datos de evaluación anotados, y después una etapa de GRPO que optimiza una función de recompensa específica. El adaptador `sft_vNN` es exactamente el punto de partida del `grpo_vNN` correspondiente, de modo que el par permite aislar la contribución del aprendizaje por recompensa respecto al SFT. La model card indica que solo se sube el adaptador final de cada ejecución; los checkpoints intermedios (pasos 150, 175 y 200) permanecen en la máquina de entrenamiento por considerarse trayectoria de entrenamiento y no resultados.

El par `grpo_v22` y `grpo_v23` está diseñado como comparación controlada: difieren únicamente en los datos de SFT (capítulos 1-5, 4.195 filas, frente a capítulos 1-7, 6.955 filas), manteniendo idénticos hiperparámetros, recompensa y presupuesto de pasos de GRPO. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset, la existencia de RLHF/DPO adicional ni innovaciones de arquitectura propias, más allá del uso de LoRA y GRPO. El código de entrenamiento reside en el repositorio privado `pigeonai-org/BeyondAccuracyEvaluation`, rama `chapter1-9b-grpo-v22-v23`.

## Capacidades

- Evaluación de respuestas multi-turno: los tags `mt-evaluation` y `beyond-accuracy` indican que el modelo está entrenado para juzgar conversaciones con varios turnos, no solo pares pregunta-respuesta aislados.
- Puntuación estructurada por aspectos (versiones `v17`-`v21`): emite siete puntuaciones de aspecto más un campo agregado `mean`.
- Juicio compacto (versiones `v22` en adelante): emite únicamente `overall`, `nominal_label` y `rationale`, lo que reduce la carga de decodificación y simplifica el parseo.
- Generación de justificación textual: el campo `rationale` proporciona una explicación del juicio emitido, útil para auditoría y para construir datasets de anotación.
- Uso como modelo juez o componente de recompensa en pipelines de evaluación automática.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio, modo de razonamiento explícito ni cobertura multilingüe. No disponible cualquier capacidad adicional no listada en la model card.

## Casos de uso

- Evaluación automática de asistentes conversacionales: el adaptador actúa como juez sobre transcripciones multi-turno y devuelve un campo `overall` más un `rationale` que permite auditar por qué una respuesta se considera insuficiente, lo que encaja directamente con el tag `mt-evaluation`.
- Regresión de calidad entre versiones de un modelo: al fijar el prompt y el adaptador, los campos `overall` y `nominal_label` permiten comparar dos releases de un mismo sistema conversacional con una métrica estable y reproducible.
- Anotación asistida de datasets de evaluación: el `rationale` generado puede revisarse por anotadores humanos en lugar de etiquetar desde cero, reduciendo el coste por muestra en corpus grandes.
- Investigación en "beyond accuracy": los pares `sft_vNN` / `grpo_vNN` permiten medir de forma aislada cuánto aporta el ajuste por recompensa frente al SFT sobre los mismos datos, un experimento controlado poco frecuente en adaptadores públicos.
- Estudio de escalado de datos de SFT: la pareja `grpo_v22` (4.195 filas, capítulos 1-5) frente a `grpo_v23` (6.955 filas, capítulos 1-7) con hiperparámetros idénticos sirve como caso de estudio de retorno marginal al añadir datos de anotación.
- Componente de recompensa en RL: dada su naturaleza como evaluador con salida estructurada, puede emplearse como señal de recompensa o de filtrado en pipelines de ajuste de otros modelos, siempre que el prompt respete el contrato de la versión concreta.
- Control de calidad previo a publicación de contenidos generados: puntuación sistemática de borradores y selección de la mejor variante según el campo `overall`, con justificación trazable.
- Migración de pipelines existentes: el script `rewrite_eval_prompt.py` de la rama de entrenamiento permite convertir ficheros de evaluación con el contrato antiguo (siete aspectos más `mean`) al contrato nuevo (`overall`, `nominal_label`, `rationale`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de resultados de evaluación en el dataset privado `seleixi/beyondacc-chapter1-backup`, al que no se puede acceder públicamente, y no incluye cifras de MMLU, HumanEval, GSM8K ni de métricas de acuerdo entre jueces (por ejemplo, correlación con anotaciones humanas).

## Requisitos de hardware

- Los adaptadores LoRA son ligeros en sí mismos, pero requieren cargar el modelo base `Qwen3.5-9B` completo en memoria: aproximadamente 18 GB de pesos en bf16, más overhead de activaciones y caché KV.
- VRAM estimada para inferencia con el modelo base en bf16: en torno a 20-24 GB, lo que encaja en una RTX 3090, RTX 4090, A10G de 24 GB, L4 de 24 GB o A100 de 40 GB.
- Con el modelo base cuantizado a 8 bits, la estimación baja a unos 10-12 GB (RTX 4080, RTX 3090, RTX 4060 Ti de 16 GB). A 4 bits, la estimación se sitúa en 6-7 GB, lo que permitiría GPUs de consumo de 8-12 GB, siempre que el runtime soporte la carga de adaptadores LoRA sobre pesos cuantizados.
- Estas cifras son estimaciones derivadas del tamaño del modelo base (9B) y no proceden de mediciones publicadas por el autor; no disponible cualquier dato de latencia, throughput o tokens por segundo.
- Opciones de despliegue: Transformers + PEFT (referencia), vLLM con soporte de adaptadores LoRA dinámicos, TGI con adaptadores, o conversión del adaptador a GGUF para llama.cpp/Ollama, esta última condicionada a las herramientas de conversión disponibles para el formato LoRA.
- Restricción práctica: el adaptador debe cargarse sobre un prompt que respete el contrato de su versión de entrenamiento (v17-v21 frente a v22+); no es un parámetro de hardware, pero condiciona cualquier despliegue.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| `seleixi/beyondacc-chapter1-9b-adapters` | Adaptadores LoRA sobre Qwen3.5-9B | 9B (base) | No disponible | No disponible | Público en HuggingFace, 0 descargas | Sin benchmarks publicados |
| `Qwen/Qwen3.5-9B` | Modelo base denso | 9B | No disponible | No disponible en la información proporcionada | Público en HuggingFace | No aplica como evaluador específico |
| Otros adaptadores de evaluación multi-turno comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación significativa que permite la información disponible es con el propio modelo base: los adaptadores aportan un comportamiento de juicio estructurado que el modelo base no tiene de forma nativa, pero no existe documentación pública sobre cuánto mejora respecto a usar `Qwen3.5-9B` sin adaptador ni respecto a otros modelos jueces.

## Limitaciones y advertencias

- Ruptura de contrato de prompt entre versiones: alimentar un adaptador `v22` o posterior con un prompt de la etapa `v17`-`v21` solicita campos (`mean` y siete aspectos) que el modelo ya no fue entrenado para producir. Es necesario convertir los ficheros con `rewrite_eval_prompt.py`.
- Licencia no declarada: no se especifican los términos de uso, por lo que el uso comercial no está garantizado y debe aclararse con el autor antes de integrarlo en producción.
- Idiomas no declarados: se desconoce si el evaluador funciona de forma fiable en castellano u otros idiomas distintos del utilizado en los datos de SFT.
- Sesgo hacia el dominio de anotación: los datos de entrenamiento provienen de un conjunto cerrado (capítulos 1-5 o 1-7 de un corpus concreto), de modo que el comportamiento fuera de ese dominio es incierto.
- Riesgo de alucinación en el campo `rationale`: al ser texto generado, la justificación puede no reflejar fielmente los criterios que llevaron a la puntuación. En pipelines automatizados conviene validar el formato y tratar la justificación como indicativa, no como evidencia.
- Reproducibilidad limitada: el código de entrenamiento y los resultados de evaluación están en repositorios y datasets privados, por lo que no es posible auditar el proceso completo ni replicar las cifras.
- Ausencia de benchmarks y de validación humana publicada: no hay datos de acuerdo con anotadores, correlación con juicios humanos ni métricas de estabilidad del juez.
- Estado de adopción nulo: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso en producción por terceros.
- Solo se publica el adaptador final de cada ejecución; los checkpoints intermedios no están disponibles, lo que impide estudiar la dinámica de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seleixi/beyondacc-chapter1-9b-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de entrenamiento (privado, citado en la model card): `pigeonai-org/BeyondAccuracyEvaluation`, rama `chapter1-9b-grpo-v22-v23`
- Resultados de evaluación y datasets (privado, citado en la model card): `seleixi/beyondacc-chapter1-backup`
- Script de conversión de prompts de evaluación (citado en la model card): `rewrite_eval_prompt.py`, disponible en la rama de entrenamiento
- No se han encontrado papers, blogs, demos ni repositorios públicos adicionales en la búsqueda web realizada.
