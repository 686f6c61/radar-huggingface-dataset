# CLArg-group/ita-bsm-q-sem-rank-con

## Resumen

El modelo `CLArg-group/ita-bsm-q-sem-rank-con` es un adaptador LoRA sobre el backbone Qwen3-8B que implementa un *base score model* (BSM) para inferencia con argumentación neurosimbólica. Lo desarrolla el grupo CLArg y se presenta en el artículo *Neurosymbolic Learning for Inference-Time Argumentation*. Su función es asignar a un argumento (a favor o en contra de una afirmación) una puntuación intrínseca en el intervalo [0, 1] que representa su fuerza argumental, que después se agrega mediante la semántica gradual DF-QuAD para producir una veredicto True / False / Uncertain sobre la afirmación.

La relevancia del modelo radica en que separa la evaluación de argumentos individuales (tarea de regresión sobre el backbone) del razonamiento agregado (el módulo neurosimbólico DF-QuAD). Esto permite verificación de afirmaciones con trazabilidad de las evidencias, algo que los LLM puros no ofrecen de forma estructurada. Es un componente especializado, no un modelo de chat generalista: su salida es un escalar por argumento.

El repositorio ocupa 0,1 GB y contiene el adaptador LoRA, una cabeza de regresión (`regression_head.safetensors`) y un `model_config.json`. La ficha se refiere a la versión `bsm-q-sem-rank-con`, denominada BSM-Q (primed & sem & rank & con) en el artículo. La licencia es MIT, aunque el uso queda sujeto también a la licencia del modelo base Qwen3-8B y a los términos de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) + adaptador LoRA + cabeza de regresión escalar |
| Parametros totales | No disponible (adaptador LoRA sobre Qwen3-8B; el backbone tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Qwen3-8B; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (pesos safetensors del adaptador; cuantización no documentada) |
| Idiomas soportados | No disponible |
| Licencia | MIT (sujeta además a la licencia de Qwen3-8B y a los términos de los datos) |
| Formato de pesos | safetensors (adaptador LoRA + `regression_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo combina un backbone Qwen3-8B con un adaptador LoRA entrenado y una cabeza de regresión que proyecta la representación del backbone a un escalar en [0, 1]. La cabeza se inicializa ("priming") con puntuaciones base obtenidas al interrogar directamente al backbone mediante prompting, y después se entrena de extremo a extremo junto con el adaptador a través de la semántica DF-QuAD. La función de pérdida combina una pérdida semántica (que mide la coherencia entre las puntuaciones y el veredicto final agregado), una pérdida de ranking (que ordena argumentos por fuerza) y una pérdida de consistencia.

Los datos de entrenamiento son los "TFU Training Claims", concretamente el fichero `Data/Training/training_true_false_uncertain_with_arguments_qwen.json`, generado con argumentos producidos por Qwen3-8B. No se especifica en la información disponible el número de ejemplos, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO. La innovación técnica principal es el acoplamiento diferenciable entre la puntuación de cada argumento y la semántica gradual DF-QuAD, que permite entrenar el modelo contra el resultado final de la agregación argumental y no solo contra puntuaciones aisladas.

## Capacidades

- Puntuación de argumentos: asigna un valor escalar en [0, 1] a un argumento que apoya o ataca una afirmación, representando su fuerza intrínseca.
- Verificación de afirmaciones (claim verification): combinado con DF-QuAD, produce un veredicto True / False / Uncertain sobre la afirmación.
- Razonamiento argumental estructurado: distingue entre argumentos de soporte y de ataque mediante el campo `is_support`.
- Procesamiento por lotes: incluye una utilidad (`infer_on_arguments`) para puntuar ficheros CSV con columnas `claim,is_support,argument`.
- Integración con el repositorio ITA: se carga en `checkpoints/bsm-q-sem-rank-con/` y se usa con los scripts de entrenamiento, evaluación e inferencia del proyecto.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: dado un claim y un conjunto de argumentos a favor y en contra, el modelo puntúa cada argumento y DF-QuAD agrega las puntuaciones para emitir un veredicto True / False / Uncertain con trazabilidad de qué argumentos pesaron más.
- Moderación de contenido argumentativo en foros: puntuar la fuerza de los argumentos de cada intervención permite priorizar o clasificar intervenciones por calidad argumental en lugar de por longitud o engagement.
- Evaluación automática de ensayos argumentativos: en entornos educativos, el BSM puede puntuar cada argumento de un texto y el agregador DF-QuAD dar una valoración global de la solidez de la tesis defendida.
- Construcción de grafos de argumentación: las puntuaciones base alimentan directamente marcos de argumentación computacional (DF-QuAD) para calcular la aceptabilidad de cada claim en un grafo con ataques y soportes.
- Investigación en argumentación neurosimbólica: el modelo sirve como componente reproducible para experimentar con semánticas graduales, comparar BSMs alternativos publicados por el mismo grupo y analizar el efecto de las pérdidas de ranking y consistencia.
- Generación de señales de confianza en asistentes RAG: dado un claim extraído de una respuesta y los pasajes recuperados como argumentos de soporte o ataque, el modelo puede estimar si la evidencia respalda la afirmación antes de mostrarla al usuario.
- Análisis de debates y deliberación: puntuar los argumentos de cada participante y agregarlos por turno permite medir la evolución de la solidez argumental a lo largo de una discusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador y la cabeza de regresión ocupan 0,1 GB, pero la inferencia requiere cargar el backbone Qwen3-8B completo.
- VRAM estimada para el backbone en precisión nativa (BF16): aproximadamente 16 GB solo para pesos, más memoria para activaciones y KV cache; en la práctica, 20-24 GB para lotes pequeños.
- Cuantización del backbone a 8 bits: aproximadamente 8-9 GB de VRAM; a 4 bits: aproximadamente 5-6 GB. No se documenta una receta de cuantización específica para este adaptador.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y evaluación por lotes; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en BF16 para lotes pequeños; GPUs consumer de 8-16 GB viables solo con cuantización del backbone.
- Opciones de despliegue: el repositorio ITA proporciona scripts de inferencia (`python -m ita.base_score_model.infer_on_arguments`); el backbone Qwen3-8B es compatible con vLLM, TGI, llama.cpp y Ollama, aunque el adaptador y la cabeza de regresión requieren integración específica con el código del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ita-bsm-q-sem-rank-con (este) | Qwen3-8B + LoRA | Puntuación de argumentos para ITA | Escalar en [0, 1] | MIT | Hugging Face + repo ITA |
| Otros BSMs del mismo grupo (p. ej. variantes sin ranking/consistencia) | Qwen3-8B + LoRA | Puntuación de argumentos para ITA | Escalar en [0, 1] | MIT | Repo ITA (según model card) |
| Qwen3-8B base | - | Generación de texto general | Texto | Apache 2.0 (según modelo base) | Hugging Face |
| LLM generalista con prompting para verificación | Variable | Verificación de claims vía prompting | Texto con veredicto | Según modelo | Amplia |

La comparación cuantitativa con las variantes del propio grupo no está disponible en la información proporcionada; la model card remite al repositorio para los demás BSMs publicados. Frente a un LLM generalista, la ventaja de este modelo es la salida numérica calibrada y la integración con una semántica formal de agregación, a costa de no ser un modelo conversacional.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de chat ni de generación libre; solo produce puntuaciones de argumentos y requiere el código del repositorio ITA para funcionar.
- Dependencia del backbone: hereda los sesgos y el conocimiento de Qwen3-8B, incluidos posibles sesgos culturales y lingüísticos no documentados.
- Riesgo de calibración: las puntuaciones en [0, 1] se entrenaron contra DF-QuAD y los datos TFU; su calibración fuera de ese dominio no está garantizada.
- Datos de entrenamiento generados por el propio backbone: los argumentos de entrenamiento proceden de Qwen3-8B, lo que puede introducir sesgos de estilo y de contenido del generador.
- Idiomas: no se documenta qué idiomas cubre; el dataset de entrenamiento no se describe en la información disponible.
- Licencia: MIT para los pesos, pero el uso comercial queda sujeto también a la licencia de Qwen3-8B y a los términos de los datos de entrenamiento descritos en el repositorio.
- Sin benchmarks publicados: no hay métricas de precisión, calibración ni comparación con alternativas en la información disponible, lo que dificulta evaluar su calidad antes de integrarlo.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validación limitado, sin evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-bsm-q-sem-rank-con
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio ITA (código de inferencia, entrenamiento y evaluación): https://github.com/CLArg-group/inference-time-argumentation
