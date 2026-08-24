# harsaas/chemreason-r1-merged

## Resumen

El modelo `harsaas/chemreason-r1-merged` es un checkpoint de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) publicado en Hugging Face por el usuario `harsaas` el 24 de agosto de 2026. Los metadatos indican que utiliza el tag `qwen2`, lo que sugiere una arquitectura basada en la familia Qwen2, y que los pesos están disponibles en formato `safetensors` con cuantización de 4 bits mediante `bitsandbytes`. La licencia declarada es MIT, lo que permite uso comercial y modificación sin restricciones significativas.

El nombre del repositorio sugiere una fusión (merge) entre un modelo de razonamiento químico (ChemReason) y un modelo de razonamiento general tipo DeepSeek R1, aunque no se proporciona documentación oficial que confirme esta hipótesis. La model card únicamente contiene la línea `license: mit`, sin descripción de capacidades, datos de entrenamiento ni instrucciones de uso. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un lanzamiento reciente y sin adopción comunitaria.

Dada la ausencia de información detallada, esta ficha se basa exclusivamente en los metadatos disponibles y en referencias externas sobre el proyecto ChemReason, que no necesariamente corresponden a este checkpoint concreto. Se recomienda precaución antes de utilizar el modelo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (según tag, no confirmado) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes), safetensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. El tag `qwen2` sugiere que el modelo base pertenece a la familia Qwen2, pero no se especifica la variante exacta (p. ej., Qwen2-1.5B, Qwen2-0.5B, etc.). El nombre "chemreason-r1-merged" podría indicar una fusión de pesos entre un modelo ChemReason (especializado en química orgánica) y un modelo de razonamiento tipo R1, pero no hay evidencia documental que lo confirme.

En cuanto al proyecto ChemReason original, referencias externas indican que se trata de un modelo de 8B parámetros afinado para razonamiento químico multitarea, con bloques de pensamiento (thinking blocks) y respuestas estructuradas en notación SMILES. Sin embargo, este checkpoint concreto tiene un tamaño significativamente menor (1,5B) y no se puede asumir que comparta las mismas capacidades o metodología de entrenamiento.

## Capacidades

No se han documentado capacidades específicas para este modelo. Basándose en el nombre y en las referencias al proyecto ChemReason, podría inferirse que está orientado a tareas de química orgánica como predicción de reacciones, retrosíntesis o planificación de síntesis, pero esta inferencia no está respaldada por datos verificables. Tampoco se confirma soporte para tool calling, agentes, razonamiento multi-paso o capacidades multilingües.

## Casos de uso

No se pueden proporcionar casos de uso concretos sin información verificada sobre las capacidades del modelo. La ausencia de documentación y de benchmarks impide recomendar aplicaciones específicas. Cualquier uso en producción debería ir precedido de una evaluación empírica del modelo en la tarea objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint. Tampoco se dispone de comparativas con modelos similares.

## Requisitos de hardware

Dado el tamaño de 1,5B parámetros, se pueden hacer estimaciones genéricas de requisitos de hardware, aunque no hay datos oficiales:

- VRAM estimada para inferencia: en FP16, aproximadamente 3 GB; en 4-bit, menos de 1 GB (sin contar overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., GTX 1660, RTX 2060, RTX 3060) sería suficiente para inferencia en 4-bit. Para FP16, se recomienda al menos 6 GB.
- Opciones de despliegue: al ser un modelo basado en Qwen2, debería ser compatible con frameworks como vLLM, llama.cpp, Ollama o Transformers, aunque no se ha verificado su funcionamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo más cercano en nombre es `JamesBrewster/ChemReason_v1.0_8B`, un modelo de 8B parámetros con documentación detallada sobre razonamiento químico, pero con un tamaño muy superior y un autor distinto. No se puede afirmar que ambos compartan arquitectura o rendimiento.

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| harsaas/chemreason-r1-merged | 1,5B | no disponible | MIT | minima (solo licencia) |
| JamesBrewster/ChemReason_v1.0_8B | 8B | no disponible | no especificada | detallada (tareas quimicas) |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo contiene la licencia, sin descripción de capacidades, limitaciones o instrucciones de uso.
- Origen y proceso de creación desconocidos: no se especifica si el modelo es un merge, una destilación o un fine-tuning, ni qué datos se utilizaron.
- Riesgo de alucinación y sesgos: al no haber evaluación publicada, no se puede cuantificar el riesgo de generar información incorrecta, especialmente en dominios especializados como la química.
- Compatibilidad no verificada: aunque el tag `qwen2` sugiere compatibilidad con el ecosistema Qwen2, no se ha confirmado que funcione correctamente con frameworks estándar.
- Uso comercial: la licencia MIT permite uso comercial, pero la falta de garantías sobre el comportamiento del modelo implica que el usuario asume todo el riesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/harsaas/chemreason-r1-merged
- Modelo ChemReason original (referencia externa): https://huggingface.co/JamesBrewster/ChemReason_v1.0_8B
- Colección ChemReason de IDEA-AI4S: https://huggingface.co/collections/IDEA-AI4S/chemreason
- Repositorio GitHub de ChemReason: https://github.com/RadeauDes/ChemReason
- Paper en OpenReview sobre ChemReason: https://openreview.net/forum?id=TzYlXkG9Xr
