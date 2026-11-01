# chiffonng/incidentbench-nokev_nonamed_basis_lt2024

## Resumen

El modelo `chiffonng/incidentbench-nokev_nonamed_basis_lt2024` es un adaptador LoRA de rango 16 sobre el modelo base Qwen2.5-7B-Instruct, publicado por el usuario chiffonng en HuggingFace. No se trata de un modelo de propósito general, sino de un artefacto de investigación diseñado específicamente para el clasificador conjunto de IncidentBench: el adaptador debe responder con una única etiqueta entre siete dominios de riesgo MIT o la categoría `No incident (potential only)`, y tanto la detección de incidente como su categoría se derivan de esa única respuesta.

La variante concreta (`nokev_nonamed_basis_lt2024`) corresponde a un corte temporal anterior a 2024, con respuestas reordenadas y sin claves ni nombres explícitos, a las que se añade una justificación breve del dominio de incidente. El adaptador se aplica sin fusionar sobre Qwen2.5-7B-Instruct, por lo que hereda la arquitectura y el contexto del modelo base, pero su comportamiento está fuertemente especializado en la tarea de clasificación.

Es relevante ahora como ejemplo de adaptación PEFT para tareas de evaluación de riesgos en sistemas de IA, aunque el propio autor advierte que las etiquetas de entrenamiento son generadas por modelos ("silver") y no verificadas por humanos, y que se trata de un artefacto de investigación no apto para decisiones sobre sistemas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador de 0,2 GB; base de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de rango 16 sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros. El adaptador se aplica sin fusionar sobre el modelo base, tal como se reporta en todas las ejecuciones del proyecto. El entrenamiento se realizó con transformers 5.9.0 y peft 0.19.1.

Los datos de entrenamiento consisten en filas con el formato de prompt de la variante `nonamed_basis` (transformación `build_data.py`), con respuestas reordenadas, sin claves ni nombres, y un corte temporal anterior a 2024. Las etiquetas son generadas por modelos ("silver") siguiendo la guía de anotación del proyecto, no son gold humano. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO. La decodificación recomendada es greedy.

## Capacidades

- Clasificación conjunta de incidentes en siete dominios de riesgo MIT o la categoría `No incident (potential only)`.
- Detección y categorización en una única respuesta, sin pasos separados.
- Generación de una justificación breve del dominio de incidente junto con la respuesta.
- Procesamiento de entradas con respuestas reordenadas y sin nombres ni claves explícitas.
- Especialización en el corte temporal anterior a 2024.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas del adaptador.

## Casos de uso

- Evaluación de riesgos en sistemas de IA: el adaptador clasifica descripciones de incidentes en dominios MIT, útil para prototipos de auditoría interna.
- Investigación en clasificación de incidentes: sirve como brazo experimental en el benchmark IncidentBench para comparar variantes de prompt y datos.
- Análisis de informes de seguridad: permite etiquetar automáticamente textos de incidentes con un dominio de riesgo y una justificación breve.
- Detección de potenciales incidentes: la categoría `No incident (potential only)` ayuda a separar casos latentes de incidentes confirmados.
- Experimentación con PEFT: ejemplo reproducible de adaptador LoRA r=16 sobre Qwen2.5-7B-Instruct con receta y manifiestos publicados.
- Validación de pipelines de evaluación: integrable con vLLM mediante `--enable-lora` para ejecutar el brazo con decodificación greedy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 14-16 GB en FP16 y 5-6 GB en cuantización de 4 bits (estimación general, no confirmada en la información).
- GPU recomendadas: no disponible en la información; por tamaño del base, una A100, H100 o RTX 4090 serían adecuadas (estimación general).
- Cabe en GPU de consumo: probablemente en RTX 4090 y GPUs con 16 GB o más en cuantización, aunque no se confirma.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules nokev_nonamed_basis_lt2024=chiffonng/incidentbench-nokev_nonamed_basis_lt2024`; otras opciones no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-nokev_nonamed_basis_lt2024 | LoRA r=16 sobre 7B | no disponible | no disponible | other | HuggingFace |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible | no disponible | no disponible | HuggingFace |
| Otras variantes IncidentBench del mismo autor | LoRA sobre 7B | no disponible | no disponible | other | HuggingFace |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son generadas por modelos ("silver"), no verificadas por humanos.
- El autor advierte de un modo de fallo conocido: el modelo infravalora los incidentes (under-calls incidents).
- Artefacto de investigación: no debe usarse para decisiones sobre sistemas reales.
- Licencia "other": restricciones de uso comercial no especificadas, requiere consulta.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Longitud de contexto y cuantizaciones no documentadas para el adaptador.
- Riesgo de alucinación en las justificaciones generadas, no evaluado en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/chiffonng/incidentbench-nokev_nonamed_basis_lt2024
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
