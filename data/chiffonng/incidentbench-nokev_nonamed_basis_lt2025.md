# chiffonng/incidentbench-nokev_nonamed_basis_lt2025

## Resumen

`incidentbench-nokev_nonamed_basis_lt2025` es un adaptador LoRA de rango 16 desarrollado por el usuario `chiffonng` sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo de propósito general, sino un artefacto de investigación entrenado para una tarea concreta: la clasificación conjunta dentro del benchmark IncidentBench, donde el modelo debe emitir una única respuesta que sirva simultáneamente como detección de incidente y como categoría de riesgo MIT (una de siete dominios posibles o la etiqueta `No incident (potential only)`).

El adaptador se enmarca en una ablación experimental concreta: la variante de corte temporal anterior a 2025 (`lt2025`), sin información de eventos clave (`nokev`), sin nombres explícitos (`nonamed`) y con una breve justificación del dominio asignado (`basis`). Esta configuración busca medir el efecto de añadir una justificación textual corta sobre la respuesta reordenada del modelo, manteniendo el resto de condiciones constantes respecto a otras variantes del mismo proyecto.

La relevancia de este adaptador es limitada y estrictamente metodológica. El propio autor lo describe como un "research artefact" con etiquetas de entrenamiento generadas por modelo ("silver"), no verificadas por anotadores humanos, y advierte explícitamente de que no debe usarse para tomar decisiones sobre sistemas reales. Con 9 descargas y 0 likes en el momento de la consulta, se trata de un componente de un estudio comparativo más amplio, no de un modelo destinado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT, se aplica sin fusionar sobre el base) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El adaptador se sirve siempre sin fusionar con el modelo base, tal como se hizo en todas las ejecuciones reportadas del proyecto. La pila de entrenamiento declarada es transformers 5.9.0 y peft 0.19.1.

Los datos de entrenamiento son filas específicas del proyecto IncidentBench, con etiquetas generadas por modelo ("silver") bajo la guía de anotación del proyecto, no anotaciones humanas gold. La variante `nokev_nonamed_basis_lt2025` usa un corte temporal anterior a 2025, elimina la información de eventos clave y los nombres explícitos, y añade una justificación breve del dominio de incidente junto con la respuesta reordenada. El prompt exacto, las filas de entrenamiento y los hashes están documentados en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`, ambos referenciados en la model card pero no incluidos en la información disponible.

La innovación técnica del adaptador no reside en la arquitectura, sino en el diseño experimental: la formulación de una clasificación conjunta donde detección y categoría se leen de una única respuesta generada, lo que permite evaluar el efecto de la justificación textual sobre el rendimiento del clasificador sin cambiar el formato de salida.

## Capacidades

- Clasificación de incidentes en el marco del benchmark IncidentBench: emite una respuesta única que codifica simultáneamente la detección de incidente y la categoría de riesgo MIT.
- Clasificación en siete dominios de riesgo MIT más la etiqueta `No incident (potential only)`.
- Generación de una justificación breve del dominio de incidente asignado (`basis`).
- Decodificación greedy recomendada por el autor para la inferencia.
- Capacidades generales de lenguaje y razonamiento heredadas de Qwen2.5-7B-Instruct, no evaluadas de forma independiente en este adaptador.
- Soporte de tool calling, agentes y multilingüismo: no disponible en la información proporcionada para este adaptador (dependería del base, pero no se documenta).

## Casos de uso

- Investigación comparativa sobre clasificación de incidentes: el adaptador sirve como una de las condiciones experimentales del estudio IncidentBench, permitiendo medir el efecto de añadir una justificación breve sobre la respuesta reordenada frente a otras variantes del mismo proyecto.
- Reproducción de resultados del informe IncidentBench: con el prompt exacto documentado en `data_manifest.json` y decodificación greedy, se puede replicar la ejecución reportada por el autor para verificar sus cifras.
- Análisis de ablaciones sobre formato de salida: al aislar la variable `basis` manteniendo constantes el corte temporal, la ausencia de eventos clave y la ausencia de nombres, permite estudiar cómo afecta la justificación textual a la detección y categorización conjuntas.
- Estudio de etiquetas "silver": el adaptador es útil para analizar el comportamiento de clasificadores entrenados con anotaciones generadas por modelo en lugar de gold, un escenario relevante en investigación sobre calidad de datos.
- Docencia y experimentación con PEFT: sirve como ejemplo práctico de adaptador LoRA de rango 16 servido con vLLM mediante `--enable-lora`, útil para quienes aprenden a desplegar adaptadores sin fusionar.
- Evaluación de modos de fallo: el autor documenta que el modelo tiende a infra-detectar incidentes (`under-calls incidents`), lo que lo convierte en un caso de estudio útil sobre sesgos de clasificación en tareas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe de IncidentBench para las puntuaciones y los modos de fallo conocidos, pero dichos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB en el repositorio; el modelo base Qwen2.5-7B-Instruct requiere su propio espacio y memoria, no especificados en la información disponible.
- VRAM estimada para inferencia: no disponible de forma específica; depende de la cuantización del base (no documentada) y del despliegue con LoRA activado.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende de la cuantización elegida para el base, que el autor no especifica.
- Opciones de despliegue: el autor documenta explícitamente vLLM con `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules nokev_nonamed_basis_lt2025=chiffonng/incidentbench-nokev_nonamed_basis_lt2025`. Otras opciones (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-nokev_nonamed_basis_lt2025 | LoRA r=16 sobre 7B | no disponible | Clasificación de incidentes IncidentBench | other | Hugging Face (9 descargas) |
| Otras variantes del proyecto IncidentBench (`nokev_nonamed_lt2025`, etc.) | LoRA sobre 7B | no disponible | Clasificación de incidentes IncidentBench | other | Referenciadas en la model card, sin datos detallados |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en esta ficha | Modelo de propósito general | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, por lo que la comparativa se limita a la configuración experimental y no a métricas.

## Limitaciones y advertencias

- Etiquetas de entrenamiento "silver": generadas por modelo bajo la guía del proyecto, no verificadas por anotadores humanos gold.
- Infra-detección de incidentes: el autor documenta explícitamente que el modelo tiende a no declarar incidentes cuando existen (`under-calls incidents`), un modo de fallo relevante para cualquier uso de clasificación.
- Uso restringido: el autor advierte de que es un artefacto de investigación y de que no debe usarse para decisiones sobre sistemas reales.
- Licencia `other`: no se detallan los términos exactos, por lo que el uso comercial no está claramente autorizado en la información disponible.
- Idiomas soportados: no disponibles; no se documenta el comportamiento multilingüe del adaptador.
- Contexto: no se especifica la longitud de contexto efectiva para esta variante, aunque se hereda del base.
- Dependencia del prompt: el adaptador requiere el prompt exacto de la variante (`nonamed_basis`) y decodificación greedy; desviarse de ese formato puede alterar los resultados.
- Reproducibilidad: los manifiestos (`data_manifest.json`, `train_manifest.json`) se referencian pero no se incluyen en la información disponible, lo que limita la verificación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/chiffonng/incidentbench-nokev_nonamed_basis_lt2025
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe IncidentBench: no disponible (referenciado en la model card sin enlace en la información proporcionada)
- `data_manifest.json` y `train_manifest.json`: no disponibles como enlaces en la información proporcionada
- Repositorio del proyecto, paper o demo: no disponibles
