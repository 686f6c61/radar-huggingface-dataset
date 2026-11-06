# chiffonng/incidentbench-nokev_nonamed_lt2025

## Resumen

`incidentbench-nokev_nonamed_lt2025` es un adaptador LoRA de rango 16 desarrollado por el usuario chiffonng sobre el modelo base Qwen2.5-7B-Instruct. No se trata de un modelo de propósito general, sino de un artefacto de investigación diseñado para una tarea concreta: la clasificación conjunta dentro del benchmark IncidentBench, donde el adaptador debe emitir una única respuesta que identifique a la vez la detección de un incidente y su categoría entre siete dominios de riesgo MIT, o bien la etiqueta `No incident (potential only)`.

La variante `nokev_nonamed_lt2025` corresponde a un brazo experimental específico del benchmark: aplica un corte temporal anterior a 2025, presenta la severidad antes que la clase, y omite la línea "Named in the record", las filas de CISA KEV y el campo de justificación. El adaptador se aplica sin fusionar sobre el modelo base, tal como se reporta en todas las ejecuciones del proyecto.

Es relevante para investigadores que trabajen en evaluación de modelos sobre clasificación de incidentes de seguridad, ya que forma parte de un conjunto de ablaciones controladas. El autor advierte explícitamente que las etiquetas de entrenamiento son "silver" (generadas por modelo bajo una guía de anotación), no oro humano, y que el adaptador subestima incidentes, por lo que no debe usarse para decisiones sobre sistemas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7B en el modelo base; tamaño del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Rango LoRA | 16 |
| Tamaño del repositorio | 0.2 GB |
| Version de transformers | 5.9.0 |
| Version de peft | 0.19.1 |

## Arquitectura y entrenamiento

El adaptador se construye como un LoRA de rango 16 sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. La aplicación es no fusionada (unmerged), de modo que el adaptador se carga en tiempo de inferencia sobre los pesos del modelo base, tal como se hace en todas las ejecuciones reportadas del proyecto IncidentBench.

El entrenamiento se realizó sobre etiquetas "silver" generadas por modelo siguiendo la guía de anotación del proyecto, no sobre anotaciones humanas gold. El brazo `nokev_nonamed_lt2025` se define por tres decisiones de diseño: corte temporal anterior a 2025, presentación de la severidad realizada antes de la clase, y eliminación de la línea "Named in the record", de las filas de CISA KEV y del campo de justificación. La receta de entrenamiento completa está en `train_manifest.json` y el formato de prompt, filas de entrenamiento y hashes en `data_manifest.json`. La transformación de prompt corresponde a `nonamed` en `train/build_data.py`. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Clasificación conjunta de incidentes: emite una sola respuesta de la que se derivan tanto la detección como la categoría, entre siete dominios de riesgo MIT o la etiqueta `No incident (potential only)`.
- Clasificación en siete dominios de riesgo MIT según la taxonomía del proyecto IncidentBench.
- Manejo de prompts estructurados con severidad y clase en un orden específico (severidad antes que clase).
- Inferencia con decodificación greedy, tal como especifica el autor.
- Servicio mediante vLLM con soporte de LoRA (`--enable-lora --max-lora-rank 16`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio, modo thinking ni multilingüismo específico más allá de lo heredado del modelo base.

## Casos de uso

- Investigación en evaluación de clasificadores de incidentes: el adaptador sirve como uno de los brazos de ablación de IncidentBench para medir el efecto de eliminar CISA KEV y la línea "Named in the record" en el rendimiento de clasificación.
- Reproducción de experimentos: al estar publicados los manifiestos de datos y de entrenamiento, permite reproducir exactamente la configuración `nokev_nonamed_lt2025` con transformers 5.9.0 y peft 0.19.1.
- Estudio de sesgos temporales: el corte `<2025` permite analizar cómo afecta la restricción temporal a la detección de incidentes en dominios de riesgo MIT.
- Análisis de etiquetas silver frente a gold: útil para cuantificar la brecha entre supervisión generada por modelo y anotación humana en tareas de clasificación de seguridad.
- Despliegue de referencia con vLLM y LoRA: sirve como ejemplo práctico de servicio de adaptadores no fusionados con `--max-lora-rank 16` en un pipeline de evaluación.
- Comparación de formatos de prompt: al existir variantes como `nonamed`, permite medir el impacto del formato de entrada (presencia o ausencia de justificación, orden de campos) en la precisión del clasificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al informe de IncidentBench para las puntuaciones y los modos de fallo conocidos, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador sobre un modelo de 7B, los requisitos son los del modelo base Qwen2.5-7B-Instruct más el adaptador (0,2 GB en el repositorio).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules nokev_nonamed_lt2025=chiffonng/incidentbench-nokev_nonamed_lt2025`, sirviendo el modelo base `Qwen/Qwen2.5-7B-Instruct`. Otras opciones (llama.cpp, Ollama, TGI) no se documentan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-nokev_nonamed_lt2025 | 7B (base) + LoRA r=16 | no disponible | Adaptador LoRA especializado | other | Hugging Face (10 descargas) |
| Qwen2.5-7B-Instruct | 7B | no disponible en la informacion | Modelo base instruct | no disponible en la informacion | Hugging Face |
| Otras variantes de IncidentBench del mismo autor | 7B (base) + LoRA | no disponible | Adaptadores de ablación | other | no disponible en la informacion |

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores de incidentes de seguridad basados en LLM) en la información proporcionada.

## Limitaciones y advertencias

- Etiquetas de entrenamiento "silver": generadas por modelo bajo la guía de anotación del proyecto, no verificadas por humanos; pueden contener errores sistemáticos.
- Subestimación de incidentes: el autor documenta explícitamente que el adaptador tiende a infra-detectar incidentes (under-calls).
- No apto para decisiones sobre sistemas reales: el propio autor lo califica de artefacto de investigación y desaconseja su uso en producción para decisiones operativas.
- Licencia "other": no se especifican los términos exactos de uso comercial en la información disponible; es necesario consultar el repositorio para verificar restricciones.
- Idiomas soportados no documentados: no se declaran capacidades multilingües específicas.
- Longitud de contexto no documentada en la ficha del adaptador; depende del modelo base.
- Especialización estrecha: el adaptador solo es válido para el formato de prompt y la tarea de IncidentBench; fuera de ese dominio su comportamiento no está caracterizado.
- Riesgo de alucinación no cuantificado en la información disponible, aunque la tarea es de clasificación cerrada sobre siete categorías más una etiqueta negativa.
- Dependencia de versiones concretas: entrenado con transformers 5.9.0 y peft 0.19.1; pueden aparecer incompatibilidades con otras versiones.

## Enlaces

- Hugging Face: https://huggingface.co/chiffonng/incidentbench-nokev_nonamed_lt2025
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos del proyecto IncidentBench.
