# debudash/qwen3-4b-tz-convert-v3-n6000

## Resumen

`debudash/qwen3-4b-tz-convert-v3-n6000` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen3-4B-Instruct-2507, publicado por el usuario debudash dentro del proyecto "tz-convert". El adaptador está especializado en una tarea muy concreta: la conversión y el razonamiento sobre zonas horarias (timezones), probablemente traduciendo entre identificadores IANA, offsets UTC y representaciones en lenguaje natural. No es un modelo generalista, sino un checkpoint intermedio de una curva de eficiencia de datos: se entrenó sobre los primeros 6.000 ejemplos de la mezcla `v3` del dataset `debudash/tz-convert-sft`, con los mismos hiperparámetros que el resto de checkpoints del proyecto.

El modelo es relevante como ejemplo de especialización mediante PEFT sobre un modelo pequeño (4B parámetros) y de cómo se publican curvas de escalado de datos con métricas de adherencia a especificación, robustez y deriva conversacional. El checkpoint "bueno" del proyecto, según el autor, es `debudash/qwen3-4b-tz-convert-v3-n12000`, por lo que este `n6000` debe considerarse una variante intermedia y no la versión recomendada para producción.

La información publicada es escasa: no hay detalles sobre la composición exacta del dataset, hiperparámetros de entrenamiento (salvo que son idénticos al resto de checkpoints), ni resultados de benchmarks estándar. La model card se limita a tres métricas propias del proyecto y a enlaces al repositorio de código y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre el modelo base Qwen3-4B-Instruct-2507 |
| Parametros totales | 4B (modelo base); el adaptador LoRA añade un número no especificado de parámetros (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó con QLoRA, lo que implica cuantización durante el entrenamiento, pero no se detallan los formatos de despliegue) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros de la familia Qwen3, en su variante Instruct (ajustada para seguir instrucciones). Sobre él se aplica un adaptador LoRA entrenado con QLoRA (cuantización del modelo base durante el entrenamiento para reducir requisitos de memoria). El repositorio solo contiene los pesos del adaptador (0,1 GB), no los del modelo base.

El entrenamiento usa los primeros 6.000 ejemplos de la mezcla `v3` del dataset `debudash/tz-convert-sft`, con los mismos hiperparámetros que el resto de checkpoints del proyecto (el autor no detalla valores concretos de rango, alpha, learning rate, épocas ni precisión). No se menciona uso de RLHF, DPO ni otras técnicas de alineación adicionales; el ajuste es supervisado sobre la tarea de conversión de zonas horarias. La innovación destacable no es arquitectónica, sino metodológica: la publicación de una curva de eficiencia de datos con métricas propias (adherencia a especificación, robustez y deriva conversacional) y un commit de entrenamiento identificable (`66e75b01a28f1d07b6ca7ac533e80dd2c52979d3`).

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3-4B-Instruct-2507.
- Conversión y razonamiento sobre zonas horarias: interpretación de identificadores IANA, offsets UTC y representaciones en lenguaje natural (según el propósito declarado del proyecto tz-convert).
- Seguimiento de una especificación de tarea concreta ("spec-adherence"), medida en la evaluación del autor.
- Robustez ante entradas variadas ("robustness"), también medida en la evaluación propia.
- Control de deriva conversacional ("drift"): el autor mide conversaciones mantenidas sin desviarse de la tarea.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no se documenta para este adaptador).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Normalización de zonas horarias en pipelines de datos: el adaptador puede convertir representaciones heterogéneas de zonas horarias (nombres, offsets, abreviaturas) a un formato canónico antes de ingestar datos en un almacén analítico; su especialización reduce la necesidad de reglas manuales frágiles.
- Preprocesado de logs y eventos distribuidos: dado que muchos sistemas registran timestamps con zonas horarias inconsistentes, el modelo puede ayudar a mapear cada entrada a un identificador IANA y un offset UTC correctos, con la ventaja de manejar variantes en lenguaje natural.
- Asistente conversacional de soporte para programadores: integrado en un chatbot interno que responde dudas sobre conversión de horas entre regiones, el adaptador mantiene el contexto de la conversación (métrica de drift del 25,7%) y sigue la especificación de respuesta.
- Generación de fixtures y casos de prueba: el modelo puede producir ejemplos de conversión de zonas horarias para tests de aplicaciones de calendario o scheduling, aprovechando su ajuste sobre el dataset SFT del proyecto.
- Enriquecimiento de formularios y entradas de usuario: en una aplicación web donde el usuario escribe una hora y una ciudad, el adaptador puede traducir esa expresión a un timestamp con zona horaria resoluble por el backend.
- Evaluación comparativa de técnicas PEFT: como checkpoint intermedio de una curva de datos, sirve para estudiar el efecto del tamaño del dataset de ajuste en tareas estrechas, comparándolo con `n12000` y otros checkpoints del mismo proyecto.
- Prototipado rápido en entornos con poca VRAM: al ser un adaptador sobre un modelo de 4B, puede desplegarse en GPUs de consumo combinándolo con el modelo base cuantizado, lo que facilita experimentos locales antes de pasar a un modelo mayor.

## Benchmarks y rendimiento

El autor publica tres métricas propias del proyecto (no benchmarks estándar como MMLU o HumanEval):

| Metrica | Este checkpoint (n6000) | Modelo base con prompt de especificación completa |
|---|---|---|
| Spec-adherence | 50,0% | 12,0% |
| Robustness | 71,8% | 23,3% |
| Drift: conversaciones mantenidas | 25,7% | 0,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores son definidas por el propio proyecto y no son directamente comparables con las de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 4B en FP16 requiere aproximadamente 8 GB solo para pesos, más memoria para KV cache y activaciones; el adaptador LoRA añade una sobrecarga pequeña (repo de 0,1 GB).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar que funcione en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) en FP16, o en GPUs de 8-16 GB con cuantización del modelo base; estas estimaciones no están confirmadas en la model card.
- ¿Cabe en consumer GPU? Probablemente sí con cuantización, pero no se documenta en la información disponible.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base Qwen3-4B-Instruct-2507 y aplicar el adaptador. Es compatible con el ecosistema PEFT/Hugging Face Transformers; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| debudash/qwen3-4b-tz-convert-v3-n6000 | 4B (base) + LoRA | no disponible | Conversión de zonas horarias | apache-2.0 | HuggingFace (adaptador PEFT) |
| debudash/qwen3-4b-tz-convert-v3-n12000 | 4B (base) + LoRA | no disponible | Conversión de zonas horarias (checkpoint recomendado por el autor) | apache-2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en la información proporcionada | Modelo generalista de instrucciones | apache-2.0 (según el modelo base referenciado) | HuggingFace |

No se dispone de información sobre otros adaptadores especializados en zonas horarias comparables. La comparación más directa es con el checkpoint `n12000` del mismo proyecto, que el autor identifica como el mejor, y con el modelo base sin ajustar.

## Limitaciones y advertencias

- Es un checkpoint intermedio de una curva de datos: el propio autor recomienda `debudash/qwen3-4b-tz-convert-v3-n12000` como mejor checkpoint, por lo que este `n6000` no debería usarse en producción sin una evaluación propia.
- Spec-adherence del 50,0%: la mitad de las respuestas evaluadas no cumplen la especificación de la tarea, un riesgo alto para uso automatizado.
- Drift del 25,7% en conversaciones mantenidas: aproximadamente una de cada cuatro conversaciones se desvía del objetivo, lo que limita su uso en diálogos largos.
- Idiomas: solo inglés documentado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos: no documentados por el autor; al heredar el modelo base Qwen3-4B-Instruct-2507, puede arrastrar sesgos de sus datos de entrenamiento, no evaluados en esta ficha.
- Riesgo de alucinación: no evaluado específicamente; en una tarea factual como la conversión de zonas horarias, una salida incorrecta puede ser difícil de detectar sin validación posterior.
- Licencia apache-2.0: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y del dataset utilizado.
- Requiere cargar el modelo base por separado: el repositorio solo contiene el adaptador, lo que añade complejidad de despliegue y dependencia de la versión del modelo base.
- No se documentan hiperparámetros, composición del dataset ni proceso de evaluación, lo que dificulta la reproducibilidad y la auditoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n6000
- Checkpoint recomendado por el autor: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Repositorio de código, eval sets e informes: https://huggingface.co/debudash/slm-training
- Dataset de ajuste: https://huggingface.co/datasets/debudash/tz-convert-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
