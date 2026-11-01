# chiffonng/incidentbench-silver_nokev_nonamed

## Resumen

`incidentbench-silver_nokev_nonamed` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen2.5-7B-Instruct por el usuario chiffonng. No es un modelo de propósito general, sino un artefacto de investigación para una tarea muy concreta: la clasificación conjunta de incidentes dentro del benchmark IncidentBench, donde el modelo debe emitir una única respuesta que corresponda a uno de los siete dominios de riesgo definidos por MIT o a la etiqueta `No incident (potential only)`. Tanto la detección de si existe un incidente como su categoría se extraen de esa misma respuesta.

El adaptador forma parte de una ablación experimental denominada "Exp 3b", en la que se eliminan del contexto de entrada las referencias a KEV (Known Exploited Vulnerabilities) y la línea "Named in the record". Las etiquetas de entrenamiento son "silver", es decir, generadas por un modelo siguiendo la guía de anotación del proyecto, y no anotaciones humanas gold. El autor lo declara explícitamente como artefacto de investigación y advierte de que no debe usarse para tomar decisiones sobre sistemas reales.

Con 19 descargas y un tamaño de repositorio de 0,2 GB, se distribuye como adaptador PEFT en safetensors que se aplica sin fusionar sobre el modelo base. Su relevancia es acotada: sirve para reproducir los resultados del informe de IncidentBench y para estudiar el comportamiento de clasificadores de riesgo basados en LLM bajo condiciones de contexto reducido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only denso (Qwen2.5-7B-Instruct) |
| Parámetros totales | 7 000 millones aproximadamente en el modelo base; el adaptador LoRA añade una fracción no especificada |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; heredada del modelo base Qwen2.5-7B-Instruct |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero el adaptador está entrenado para una tarea concreta en inglés) |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7 000 millones de parámetros. No se modifican los pesos del modelo base: el adaptador se aplica sin fusionar en todas las ejecuciones reportadas, tal y como indica el autor. La tarea es una clasificación generativa de una sola respuesta entre ocho etiquetas posibles (siete dominios de riesgo de MIT más la categoría de no incidente).

El entrenamiento utiliza etiquetas "silver" generadas por un modelo bajo la guía de anotación del proyecto, no anotaciones humanas. La variante concreta ("Exp 3b") se entrena sin información de KEV y sin la línea "Named in the record" en el prompt. El stack de entrenamiento declarado es transformers 5.9.0 y peft 0.19.1. El autor no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información queda remitida a los manifiestos `data_manifest.json` y `train_manifest.json` del repositorio.

## Capacidades

- Clasificación de incidentes de seguridad en una sola respuesta entre siete dominios de riesgo de MIT o la etiqueta `No incident (potential only)`.
- Detección implícita: la presencia o ausencia de incidente se deriva de la misma respuesta de categoría.
- Inferencia en modo greedy, tal y como especifica el autor para la reproducción de resultados.
- Despliegue como adaptador LoRA servido con vLLM mediante `--enable-lora` y `--max-lora-rank 16`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento extendido específicas de este adaptador.
- Las capacidades multilingües no están documentadas para el adaptador.

## Casos de uso

- Reproducción de experimentos de IncidentBench: el adaptador permite replicar la ablación "Exp 3b" del informe del proyecto usando el prompt de la transformación `nonamed` y decodificación greedy.
- Estudio de clasificadores de riesgo basados en LLM: sirve para analizar cómo varía la clasificación de incidentes cuando se elimina información de KEV y de entidades nombradas del contexto.
- Evaluación de etiquetas silver frente a gold: permite comparar el comportamiento de un modelo entrenado con anotaciones generadas automáticamente frente a referencias humanas.
- Investigación sobre sesgos de infradetección: el autor documenta que el modelo tiende a no declarar incidentes (under-calls), lo que lo convierte en un caso de estudio útil para medir ese modo de fallo.
- Docencia y experimentación con PEFT: al ser un adaptador pequeño (0,2 GB) sobre un base de 7B, es adecuado para prácticas de ajuste fino eficiente y despliegue con LoRA en vLLM.
- Análisis de sensibilidad al prompt: permite estudiar cómo afecta la eliminación de campos del contexto a la respuesta final en una tarea de clasificación cerrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite las puntuaciones y los modos de fallo conocidos al informe de IncidentBench, que no se incluye en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 14-16 GB en FP16/BF16 y en torno a 4-6 GB con cuantización de 4 bits, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del base, cabría esperar A100, H100 o RTX 4090, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada por el autor.
- Opciones de despliegue: vLLM con soporte LoRA (`vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules silver_nokev_nonamed=chiffonng/incidentbench-silver_nokev_nonamed`). No se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-silver_nokev_nonamed | ~7B (base) + LoRA r=16 | no disponible | Clasificación de incidentes IncidentBench (ablación sin KEV ni entidades) | other | HuggingFace, 19 descargas |
| Qwen2.5-7B-Instruct (base) | ~7B | no disponible en la información | Propósito general, instrucciones | no disponible en la información | HuggingFace |
| Otras variantes de IncidentBench del mismo autor | ~7B (base) + LoRA | no disponible | Clasificación de incidentes con otras ablaciones | other | no disponible en la información |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Etiquetas de entrenamiento "silver" generadas por modelo, no gold humano: los resultados pueden no reflejar el juicio de anotadores expertos.
- El autor documenta que el modelo tiende a infradetectar incidentes (under-calls), lo que sesga las predicciones hacia la categoría de no incidente.
- Artefacto de investigación: el propio autor advierte explícitamente de que no debe usarse para tomar decisiones sobre sistemas reales.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial requiere consultar al autor.
- Idiomas soportados no documentados para el adaptador; la tarea está definida en inglés.
- Longitud de contexto del adaptador no especificada.
- El adaptador debe aplicarse sin fusionar y con el prompt exacto de la transformación `nonamed` y decodificación greedy para reproducir los resultados reportados.
- Sin métricas publicadas en la información disponible, no es posible evaluar su calidad de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/chiffonng/incidentbench-silver_nokev_nonamed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Manifiesto de datos: `data_manifest.json` (en el repositorio)
- Manifiesto de entrenamiento: `train_manifest.json` (en el repositorio)
- Script de construcción de datos: `train/build_data.py` (transformación `nonamed`)
- Informe de IncidentBench: no disponible en la información proporcionada
