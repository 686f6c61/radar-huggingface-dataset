# shantomathew/agentmart-tooltune-policy

## Resumen

ToolTune Policy es un artefacto de política de agente publicado por Shanto Mathew (AgentMart) como envío al hackathon de seguridad y alineación de Lexsi Labs (Track 3: fine-tuning agéntico). A diferencia de un modelo de lenguaje convencional, el repositorio no contiene pesos de red neuronal: aloja `policy_weights.json`, los parámetros ajustados de una política de enrutamiento y extracción de argumentos para tool calling, serializados para que la política evaluada sea inspeccionable y reproducible.

La política combina un enrutador de herramientas basado en naive Bayes con un extractor de argumentos por pistas y formas (cue/shape), ajustados por código sobre 130 trayectorias SFT en formato AgentTune del dataset `shantomathew/agentmart-tooltune-data`. El modelo base declarado es `CohereLabs/aya-expanse-8b`, pero el autor indica explícitamente que el SFT LoRA sobre ese modelo no se ejecutó en esta entrega y que no se incluyen pesos de Aya ajustados.

Su relevancia es metodológica: demuestra un flujo de evaluación de fiabilidad en tool calling con las herramientas AgentTune y AuditKIT sobre tareas sintéticas de un solo paso, con una partición de test disjunta en entidades y valores. Los resultados medidos son de generalización in-distribution, no una comparación estilo BFCL, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de agente no neuronal: enrutador de herramientas naive Bayes + extractor de argumentos por pistas y formas |
| Parametros totales | No disponible (no es un modelo de red neuronal; el artefacto es `policy_weights.json`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no aplica a la política serializada) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | JSON (`policy_weights.json`) |

## Arquitectura y entrenamiento

El artefacto no es un transformer ni un modelo generativo: es una política de agente ajustada por código, compuesta por un enrutador de herramientas naive Bayes y un extractor de argumentos basado en pistas y formas. Se ajustó sobre 130 trayectorias SFT en formato AgentTune del dataset `shantomathew/agentmart-tooltune-data`. La serialización en JSON permite inspeccionar y reproducir exactamente la política evaluada.

El modelo base declarado es `CohereLabs/aya-expanse-8b`, con la clase Tiny Aya mencionada como alternativa menor en el cuaderno de entrenamiento. El autor incluye un cuaderno completo de SFT LoRA sobre GPU (`train_aya_sft.ipynb` en el repositorio de código) sobre el mismo dataset AgentTune, pero señala que no se ejecutó en esta entrega y que no se reclaman ni incluyen pesos de Aya ajustados. La evaluación se realizó con AuditKIT 1.1.11 sobre tareas sintéticas de un solo paso, con partición de test disjunta en entidades y valores pero compartiendo familias de plantillas.

## Capacidades

- Enrutamiento de herramientas: selección de la herramienta adecuada para una tarea dada mediante el clasificador naive Bayes.
- Extracción de argumentos: generación de los argumentos de la llamada a partir de pistas y formas del enunciado.
- Tool calling de un solo paso: la política está diseñada y evaluada para tareas sintéticas de un solo paso.
- Evaluación auditable: integración con AuditKIT para medir precisión de selección, exact-match de argumentos, tasa de éxito y llamadas redundantes.
- Reproducibilidad: pesos serializados en JSON que permiten inspeccionar la política exacta evaluada.
- No soporta generación de texto libre, razonamiento multi-paso, visión, audio ni capacidades multilingües declaradas.

## Casos de uso

- Enrutamiento determinista de herramientas en pipelines de agentes: la política puede usarse como componente de selección de herramienta cuando el conjunto de herramientas es fijo y las tareas son de un solo paso, gracias a su precisión de selección medida de 1.00 en el test retenido.
- Extracción de argumentos en entornos controlados: el extractor por pistas y formas alcanza exact-match de 1.00 en el conjunto evaluado, adecuado para plantillas de enunciado estables.
- Referencia para evaluación de fiabilidad en tool calling: sirve como línea base reproducible para comparar políticas de agente con AuditKIT en experimentos de alineación.
- Reproducción de experimentos de hackathon: el JSON serializado permite replicar exactamente la política evaluada en el envío, útil para auditoría de resultados.
- Punto de partida para SFT sobre Aya Expanse 8B: el cuaderno `train_aya_sft.ipynb` documenta el flujo de fine-tuning LoRA sobre el mismo dataset, reutilizable como plantilla de entrenamiento.
- Docencia y prototipado de agentes: por su simplicidad y licencia MIT, sirve para ilustrar el ciclo completo de datos SFT, ajuste de política y evaluación con métricas de tool calling.
- Integración en sistemas con restricciones de cómputo: al no requerir GPU para la inferencia de la política, puede desplegarse en entornos ligeros donde un LLM de 8B no es viable.

## Benchmarks y rendimiento

Resultados medidos en test retenido (n=40) con AuditKIT 1.1.11, según la model card:

| Metrica | Baseline | ToolTune policy |
|---|---|---|
| Tool-selection accuracy | 0.75 | 1.00 |
| Argument exact-match | 0.15 | 1.00 |
| Task success rate | 0.15 | 1.00 |
| Avg calls / task | 1.275 | 1.00 |
| AuditKIT tool_call_f1 (exact) | 0.15 | 1.00 |
| AuditKIT redundant_tool_calls | 0.1375 | 0.00 |

El autor advierte que estos números proceden de un pipeline local con tareas sintéticas de un solo paso y una partición disjunta en entidades y valores pero con familias de plantillas compartidas: miden generalización in-distribution y no constituyen una afirmación estilo BFCL.

## Requisitos de hardware

- VRAM para inferencia: no aplica; la política es un JSON evaluado por código, sin necesidad de GPU.
- GPU recomendadas: no aplica para la política. El cuaderno de SFT LoRA sobre Aya Expanse 8B requiere GPU, pero no se especifican modelos concretos en la información disponible.
- GPU de consumo: la política cabe en cualquier entorno de CPU; el SFT LoRA del modelo base de 8B requeriría una GPU con VRAM suficiente, sin datos concretos publicados.
- Opciones de despliegue: ejecución directa del código que carga `policy_weights.json`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tool calling | Licencia |
|---|---|---|---|---|---|
| ToolTune Policy (este) | Política naive Bayes + extractor | No aplica (JSON) | No disponible | Sí, un solo paso | MIT |
| CohereLabs/aya-expanse-8b | LLM transformer | 8B | No disponible | No verificado en esta ficha | No disponible |
| Modelos comparables de enrutamiento de herramientas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con otras políticas de enrutamiento en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni mantiene conversaciones; solo enruta herramientas y extrae argumentos.
- Los resultados provienen de tareas sintéticas de un solo paso con plantillas compartidas; la generalización fuera de esa distribución no está demostrada.
- El SFT LoRA sobre Aya Expanse 8B no se ejecutó en esta entrega y no se incluyen pesos ajustados de Aya.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- No hay datos sobre sesgos, alucinación o robustez ante entradas adversarias.
- Licencia MIT: permite uso comercial, pero el artefacto es una política serializada, no un modelo listo para producción.
- El repositorio registra 0 descargas y 0 likes, y no hay evidencia de validación externa de los resultados.
- No se documentan requisitos de contexto, latencia ni throughput, lo que dificulta planificar su despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/shantomathew/agentmart-tooltune-policy
- Dataset de trayectorias SFT: https://huggingface.co/datasets/shantomathew/agentmart-tooltune-data
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
