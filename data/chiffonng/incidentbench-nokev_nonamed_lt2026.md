# chiffonng/incidentbench-nokev_nonamed_lt2026

## Resumen

`incidentbench-nokev_nonamed_lt2026` es un adaptador LoRA de rango 16 desarrollado por el usuario chiffonng sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo de propósito general, sino un artefacto de investigación para una tarea muy concreta: la clasificación conjunta dentro del proyecto IncidentBench, donde el adaptador debe emitir una única respuesta que indique uno de siete dominios de riesgo MIT o bien la etiqueta "No incident (potential only)". La detección de incidente y la categoría se leen de esa misma respuesta, de modo que el adaptador funciona como clasificador de una sola salida.

El adaptador corresponde a una variante experimental concreta dentro del proyecto: corte temporal anterior a 2026, con severidad y estado de realización colocados antes de la clase, sin línea de "Named in the record", sin filas de CISA KEV y sin campo de justificación ("basis"). El entrenamiento se realizó con etiquetas generadas por modelo ("silver") bajo la guía de anotación del proyecto, no con anotaciones humanas gold, lo que sitúa el artefacto en el terreno de la investigación metodológica más que en el de la producción.

Su relevancia es acotada pero clara para quien investigue evaluación de clasificadores de riesgo: permite reproducir un brazo concreto de un experimento controlado (ablación de información de KEV y de nombres de incidentes) sobre un modelo de 7B con licencia permisiva. El autor advierte explícitamente de que no debe usarse para tomar decisiones sobre sistemas reales, y documenta un modo de fallo conocido: infravalora la presencia de incidentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; el base admite cuantizaciones estandar) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT; se aplica sin fusionar sobre el modelo base) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7,6 mil millones de parámetros. El adaptador se sirve siempre sin fusionar con el modelo base, tal como se hizo en todas las ejecuciones reportadas del proyecto. La tarea es de clasificación generativa: el modelo produce una única respuesta en texto que codifica simultáneamente la detección de incidente y su categoría entre siete dominios de riesgo MIT, o bien la etiqueta "No incident (potential only)".

El entrenamiento utilizó etiquetas "silver" generadas por modelo bajo la guía de anotación del proyecto, no anotaciones humanas gold. La variante `nokev_nonamed_lt2026` se define por cuatro decisiones de diseño: corte temporal anterior a 2026, orden de campos con realización y severidad antes de la clase, ausencia de la línea "Named in the record" y ausencia de filas de CISA KEV y del campo de justificación. El stack de entrenamiento fue transformers 5.9.0 y peft 0.19.1. Los detalles de prompt, filas de entrenamiento y hashes están en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`, ambos referenciados en la model card.

## Capacidades

- Clasificación conjunta de incidentes: emite una única respuesta de la que se extraen tanto la detección como la categoría de riesgo MIT.
- Clasificación en siete dominios de riesgo MIT más la etiqueta "No incident (potential only)".
- Formato de prompt específico del brazo `nonamed` (transformación `nonamed` de `train/build_data.py`), con decodificación greedy.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas más allá de las del modelo base.
- No se documentan capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de experimentos de ablación: el adaptador permite replicar el brazo sin información de CISA KEV ni nombres de incidentes, aislando el efecto de esa información en el rendimiento del clasificador.
- Evaluación metodológica de etiquetas silver: sirve para estudiar cómo se comporta un clasificador entrenado con anotaciones generadas por modelo frente a variantes con anotaciones humanas.
- Investigación sobre clasificación de riesgo en dominios MIT: proporciona un punto de comparación controlado para medir la influencia del orden de campos (realización y severidad antes de la clase) en la precisión.
- Estudio de modos de fallo en clasificadores de seguridad: el autor documenta que el adaptador infravalora incidentes, lo que lo convierte en un caso útil para analizar sesgos de infradetección en sistemas de alerta.
- Docencia y formación en evaluación de modelos: permite ilustrar cómo un adaptador pequeño sobre un modelo de 7B puede especializarse en una tarea de clasificación restringida y cómo se sirve con vLLM usando `--enable-lora`.
- Verificación de pipelines de despliegue LoRA: el comando de servicio documentado (`vllm serve ... --enable-lora --max-lora-rank 16`) sirve como referencia para probar infraestructura de adaptadores sin fusionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB en el repositorio; el modelo base Qwen2.5-7B-Instruct requiere memoria adicional según cuantización.
- VRAM estimada para el modelo base: aproximadamente 15-16 GB en FP16/BF16, unos 8-9 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits (estimaciones estándar para 7,6B; no confirmadas en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para servicio con vLLM; RTX 4090 (24 GB) suficiente para el base en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en tarjetas de 8-12 GB con cuantización.
- Despliegue: vLLM con soporte LoRA, tal como documenta el autor (`--enable-lora --max-lora-rank 16 --lora-modules nokev_nonamed_lt2026=...`). No se documentan otras opciones (llama.cpp, Ollama, TGI) para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-nokev_nonamed_lt2026 | LoRA r=16 sobre 7,6B | no disponible | Clasificación de riesgo MIT (IncidentBench) | other | HuggingFace, 16 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | no disponible en la informacion | Propósito general, instrucciones | no disponible en la informacion | HuggingFace |
| Otros brazos de IncidentBench | no disponible | no disponible | Variantes del mismo clasificador | no disponible | Referenciados en el informe del proyecto, no detallados aquí |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no debe usarse para decisiones sobre sistemas reales.
- Etiquetas silver: el entrenamiento se hizo con anotaciones generadas por modelo, no con gold humano, lo que introduce ruido y sesgos sistemáticos.
- Infradetección conocida: el adaptador tiende a infravalorar incidentes (under-calls incidents), según el informe del proyecto.
- Licencia "other": no se detallan los términos exactos; es necesario consultar el repositorio antes de cualquier uso, especialmente comercial.
- Requiere el prompt exacto del brazo `nonamed` y decodificación greedy; desviarse del formato puede degradar la salida.
- Dependencia del modelo base: debe servirse sin fusionar sobre Qwen2.5-7B-Instruct, lo que añade requisitos de memoria y complejidad de despliegue.
- Idiomas soportados no documentados; no se garantiza comportamiento fuera del inglés o del dominio de entrenamiento.
- Riesgo de alucinación en la categoría asignada no cuantificado en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/chiffonng/incidentbench-nokev_nonamed_lt2026
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Referencias internas del repositorio: `data_manifest.json`, `train_manifest.json` y `train/build_data.py` (transformación `nonamed`), citadas en la model card.
- Informe de IncidentBench: mencionado en la model card sin enlace directo disponible en la información proporcionada.
