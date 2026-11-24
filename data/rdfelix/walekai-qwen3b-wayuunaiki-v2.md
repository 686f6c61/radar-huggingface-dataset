# RDFelix/WalekAI-Qwen3B-Wayuunaiki-v2

## Resumen

WalekAI-Qwen3B-Wayuunaiki-v2 es un ajuste fino (finetune) del modelo Qwen2.5-3B-Instruct, publicado por el usuario RDFelix en Hugging Face. El nombre sugiere una especialización en wayuunaiki (wayúu), una lengua indígena hablada principalmente en la península de La Guajira (Colombia y Venezuela), aunque la model card no lo confirma explícitamente ni documenta el corpus de entrenamiento utilizado. El modelo se distribuye únicamente en formato GGUF cuantizado Q4_K_M, orientado a inferencia local mediante llama.cpp u Ollama.

La relevancia de este modelo radica en su carácter de adaptación lingüística para una lengua de bajos recursos, un caso de uso típico de ajuste fino sobre modelos base compactos. Con aproximadamente 3.085 millones de parámetros, se sitúa en el rango de modelos que caben en GPU de consumo, lo que facilita el despliegue en entornos con hardware limitado.

No obstante, la información pública es muy escasa: no se especifican la licencia, los idiomas soportados, el pipeline, los datos de entrenamiento ni resultados de evaluación. Esta ficha refleja exclusivamente lo que puede verificarse a partir de los metadatos y la model card, indicando "no disponible" en todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2, según tag `qwen2`) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | GGUF Q4_K_M (único archivo publicado) |
| Idiomas soportados | No disponible (el nombre sugiere wayuunaiki; sin confirmación documental) |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); incluye Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo deriva de Qwen2.5-3B-Instruct, un transformer decoder-only de la familia Qwen2 con aproximadamente 3.086 millones de parámetros. El ajuste fino se realizó con Unsloth, según indica la model card, y posteriormente se convirtió a formato GGUF. No se documentan el número de tokens de entrenamiento, la composición del dataset, la técnica de ajuste (LoRA, QLoRA, full fine-tuning) ni si hubo etapas de RLHF o DPO adicionales.

La única innovación técnica mencionada es el uso de Unsloth para acelerar el entrenamiento (el autor afirma que fue "2x faster"), pero no se aportan detalles sobre hiperparámetros, duración del entrenamiento ni metodología de evaluación. Tampoco se especifica si se preservaron las capacidades del modelo base o si el ajuste se limitó a un dominio concreto.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-3B-Instruct.
- Soporte de plantilla de chat Jinja (`--jinja` en llama.cpp), lo que permite aplicar el formato de conversación del modelo base.
- Posible especialización en wayuunaiki (deducida del nombre), sin documentación que lo confirme.
- Soporte de tool calling y function calling: no documentado en esta ficha, aunque el modelo base Qwen2.5-Instruct lo incluye.
- Capacidades multimodales: la model card menciona `llama-mtmd-cli` como opción genérica, pero no se publica ningún proyector multimodal ni se confirma que el modelo sea multimodal.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Procesamiento de textos en wayuunaiki: el modelo podría emplearse para tareas de generación y comprensión en esta lengua de bajos recursos, siempre que se valide empíricamente su calidad, dado que no hay evaluación publicada.
- Despliegue en entornos con hardware limitado: al distribuirse en GGUF Q4_K_M (aproximadamente 1,9 GB), puede ejecutarse en CPU o en GPU de consumo, lo que facilita prototipos locales.
- Asistentes conversacionales offline: mediante llama.cpp u Ollama, permite construir chatbots sin conexión para comunidades con conectividad limitada.
- Investigación en adaptación lingüística: sirve como caso de estudio de ajuste fino con Unsloth sobre un modelo base compacto para una lengua de bajos recursos.
- Educación y preservación cultural: podría integrarse en herramientas de aprendizaje o traducción asistida del wayuunaiki, previa validación de calidad por hablantes nativos.
- Experimentación con plantillas de chat: el soporte de `--jinja` permite probar distintos formatos de conversación en llama.cpp para evaluar el comportamiento del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con la cuantización Q4_K_M publicada (archivo de unos 1,9 GB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; tarjetas como RTX 3050, RTX 4060, RTX 4090 o superiores pueden ejecutarlo con holgura.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas con al menos 4 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (incluye Modelfile), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WalekAI-Qwen3B-Wayuunaiki-v2 | 3.086 M | No disponible | No disponible | GGUF Q4_K_M | Ajuste fino de Qwen2.5-3B-Instruct para wayuunaiki (presunto) |
| Qwen2.5-3B-Instruct | 3.086 M | 32.768 tokens | Apache 2.0 (según el modelo base original) | Safetensors, GGUF | Modelo base original, multilingüe, con evaluación publicada |
| Llama 3.2 3B Instruct | 3.210 M | 128.000 tokens | Llama 3.2 Community License | Safetensors, GGUF | Alternativa compacta de Meta, con licencia restrictiva para algunos usos |

La comparación con el modelo base es la más relevante: WalekAI-Qwen3B-Wayuunaiki-v2 hereda la arquitectura y el tamaño de Qwen2.5-3B-Instruct, pero no se dispone de datos que permitan comparar su rendimiento. La licencia del ajuste no está documentada, lo que impide confirmar si se mantienen los términos Apache 2.0 del original.

## Limitaciones y advertencias

- Ausencia total de documentación sobre licencia: no puede confirmarse el uso comercial permitido.
- No hay información sobre los datos de entrenamiento, lo que impide evaluar sesgos, calidad del corpus o riesgo de sobreajuste.
- No se han publicado evaluaciones (benchmarks, pruebas humanas) que validen la calidad del ajuste ni su competencia real en wayuunaiki.
- Riesgo de alucinación inherente a los modelos de 3B parámetros, potencialmente agravado si el ajuste se realizó con un corpus pequeño.
- Solo se publica una cuantización (Q4_K_M), lo que limita la precisión máxima alcanzable; no hay versión en safetensors ni en otras cuantizaciones.
- El modelo base Qwen2.5-3B-Instruct tiene un contexto de 32.768 tokens, pero no se confirma que el ajuste lo conserve.
- La mención a `llama-mtmd-cli` en la model card es genérica y no implica que el modelo sea multimodal; no se incluye proyector visual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RDFelix/WalekAI-Qwen3B-Wayuunaiki-v2
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
