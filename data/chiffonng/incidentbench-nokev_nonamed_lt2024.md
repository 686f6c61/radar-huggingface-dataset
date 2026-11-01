# chiffonng/incidentbench-nokev_nonamed_lt2024

## Resumen

`incidentbench-nokev_nonamed_lt2024` es un adaptador LoRA de rango 16 desarrollado por el usuario chiffonng sobre el modelo base Qwen2.5-7B-Instruct. No se trata de un modelo de propósito general, sino de un artefacto de investigación para IncidentBench, un benchmark de clasificación conjunta de incidentes de riesgo en sistemas de IA. El adaptador transforma el modelo base en un clasificador que emite una única respuesta entre siete dominios de riesgo del MIT o la etiqueta `No incident (potential only)`, de la que se derivan tanto la detección como la categoría.

La variante `nokev_nonamed_lt2024` corresponde a un brazo experimental concreto del benchmark: corte temporal anterior a 2024 (solo incidentes ya materializados y con severidad conocida antes de la clase), sin línea "Named in the record", sin filas de CISA KEV y sin campo de justificación ("basis"). El adaptador se aplica sin fusionar sobre el modelo base, con decodificación greedy, y está pensado para reproducir una de las condiciones reportadas en el informe de IncidentBench.

Es relevante por su carácter metodológico: las etiquetas de entrenamiento son "silver" (generadas por un modelo siguiendo la guía de anotación del proyecto), no oro humano, y el propio autor advierte que el adaptador infravalora incidentes (under-calls) y no debe usarse para decisiones sobre sistemas reales. Con 11 descargas y 0 likes, es un artefacto de nicho orientado a la reproducibilidad de experimentos, no a despliegue productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; tamaño del repo del adaptador: 0,2 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros. El adaptador se sirve sin fusionar con el modelo base, tal como se reporta en todas las ejecuciones del benchmark. La tarea es una clasificación conjunta: el modelo emite una sola respuesta entre siete dominios de riesgo del MIT o la etiqueta `No incident (potential only)`, y de esa única respuesta se extraen tanto la detección (si hay incidente) como la categoría.

El entrenamiento se realizó con etiquetas "silver" generadas por un modelo bajo la guía de anotación del proyecto, no con anotación humana oro. El brazo `nokev_nonamed_lt2024` se define por un corte temporal (<2024) y por la ausencia de tres elementos en el prompt: la línea "Named in the record", las filas de CISA KEV y el campo de justificación. El stack de entrenamiento fue transformers 5.9.0 y peft 0.19.1. Los detalles de formato de prompt, filas de entrenamiento y hashes están en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`, ambos referenciados en la model card.

## Capacidades

- Clasificación de incidentes de riesgo de IA en siete dominios del MIT o en la categoría `No incident (potential only)`, con detección y categoría derivadas de una única respuesta.
- Clasificación con corte temporal: solo considera incidentes materializados con severidad conocida antes de la clase (variante `<2024`).
- Funcionamiento en modo de prompt restringido: sin línea "Named in the record", sin filas de CISA KEV y sin campo de justificación.
- Decodificación greedy para reproducibilidad de resultados.
- Servicio mediante vLLM con soporte de LoRA (`--enable-lora --max-lora-rank 16`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido más allá de las heredadas del modelo base.

## Casos de uso

- Reproducción de experimentos de IncidentBench: el adaptador permite replicar exactamente el brazo `nokev_nonamed_lt2024` con decodificación greedy y el prompt definido en `data_manifest.json`, lo que facilita la verificación de resultados del informe.
- Ablación metodológica: comparar el efecto de eliminar CISA KEV, la línea "Named in the record" y el campo de justificación frente a otras variantes del benchmark, aislando la contribución de cada componente del prompt.
- Estudio de etiquetas silver frente a oro: sirve para analizar cómo se comporta un clasificador entrenado con anotación generada por modelo en una tarea de riesgo, incluyendo sus modos de fallo documentados (under-calling).
- Evaluación de clasificadores de riesgo en pipelines de investigación: útil como línea base para medir la calidad de clasificación de incidentes en dominios de riesgo del MIT antes de invertir en anotación humana.
- Análisis de sesgo temporal: el corte `<2024` permite estudiar cómo generaliza el clasificador a incidentes anteriores a una fecha, útil para investigar deriva temporal en datos de riesgo.
- Docencia y formación en evaluación de modelos: ejemplo práctico de adaptador LoRA para clasificación restringida, con manifiestos de datos y entrenamiento que documentan el proceso completo.
- Servicio de referencia con vLLM: despliegue del adaptador junto al modelo base para pruebas internas de integración de LoRA en infraestructura de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe de IncidentBench para puntuaciones y modos de fallo conocidos, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 14-16 GB en FP16/BF16, aunque esta cifra no procede de la información del adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: vLLM con soporte LoRA, según la model card (`vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules nokev_nonamed_lt2024=chiffonng/incidentbench-nokev_nonamed_lt2024`). No se documentan otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-nokev_nonamed_lt2024 | 7B (base) + LoRA r=16 | no disponible | Adaptador de clasificación | other | HuggingFace (11 descargas) |
| Qwen2.5-7B-Instruct | 7B | no disponible en la informacion proporcionada | Modelo instructivo general | no disponible en la informacion proporcionada | HuggingFace (modelo base) |
| Otras variantes de IncidentBench | no disponible | no disponible | Adaptadores de clasificación | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores de incidentes de riesgo de IA) en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son "silver" (generadas por modelo), no oro humano; la calidad del clasificador está acotada por la calidad de esa anotación.
- El autor documenta que el adaptador infravalora incidentes (under-calls), lo que implica falsos negativos sistemáticos en la detección.
- Artefacto de investigación: el propio autor indica explícitamente que no debe usarse para decisiones sobre sistemas reales.
- Licencia "other": no se detallan los términos, por lo que se desconoce si se permite uso comercial; es necesario consultar la licencia del modelo base y del adaptador antes de cualquier despliegue.
- Idiomas soportados no disponibles; el comportamiento multilingüe no está documentado.
- Longitud de contexto no disponible en la información del adaptador; depende del modelo base.
- El adaptador está diseñado para un prompt y una condición concretos (corte `<2024`, sin KEV, sin "Named in the record", sin justificación); usarlo fuera de ese formato invalida los resultados reportados.
- Riesgo de alucinación en la categoría asignada no cuantificado en la información disponible.
- El adaptador se sirve sin fusionar; fusionarlo con el modelo base puede alterar el comportamiento respecto a las ejecuciones reportadas.
- Solo 11 descargas y 0 likes: ecosistema de validación muy limitado.

## Enlaces

- HuggingFace: https://huggingface.co/chiffonng/incidentbench-nokev_nonamed_lt2024
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe de IncidentBench: no disponible como enlace en la información proporcionada
- Repositorio del proyecto y manifiestos (`data_manifest.json`, `train_manifest.json`): no disponibles como enlaces en la información proporcionada
