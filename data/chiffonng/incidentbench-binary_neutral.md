# chiffonng/incidentbench-binary_neutral

## Resumen

`incidentbench-binary_neutral` es un adaptador LoRA de rango 16 entrenado sobre `Qwen/Qwen2.5-7B-Instruct` por el usuario `chiffonng` como parte del proyecto IncidentBench. Su función es actuar como clasificador conjunto de incidentes: a partir de un prompt, el modelo emite una única respuesta que contiene a la vez la detección (si hay incidente o no) y la categoría de riesgo MIT asignada (una de siete dominios o la etiqueta `No incident (potential only)`). El adaptador corresponde al brazo experimental "Exp 4" del proyecto, que replica la sonda binaria con un enunciado neutral respecto al resultado.

El modelo no es un modelo base autónomo, sino un adaptador PEFT que debe aplicarse sin fusionar sobre Qwen2.5-7B-Instruct. Su relevancia es acotada: se trata de un artefacto de investigación para estudiar el comportamiento de clasificadores de incidentes construidos sobre modelos de lenguaje, no de un modelo listo para producción. El autor advierte explícitamente que las etiquetas de entrenamiento son "silver" (generadas por modelo bajo una guía de anotación), no oro humano, y que no debe usarse para tomar decisiones sobre sistemas reales.

El repositorio es pequeño (0,2 GB), coherente con un adaptador LoRA, y las métricas de descargas (11) y likes (0) reflejan su carácter incipiente y de nicho. No se dispone de información sobre idiomas soportados más allá de los del modelo base, ni de resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parámetros totales | no disponible (adaptador LoRA; el base tiene 7B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros, mediante LoRA de rango 16. La aplicación es siempre sin fusionar sobre el modelo base, tal como se reporta en todas las ejecuciones del proyecto. El entrenamiento se realizó con transformers 5.9.0 y peft 0.19.1, y la receta completa está documentada en `train_manifest.json` del repositorio.

La tarea es una clasificación conjunta: el modelo debe producir una única respuesta de la que se leen tanto la detección de incidente como la categoría de riesgo MIT (siete dominios posibles) o la etiqueta `No incident (potential only)`. Las etiquetas de entrenamiento son "silver", generadas por modelo siguiendo la guía de anotación del proyecto, no anotaciones humanas de referencia. Este brazo concreto ("Exp 4") reproduce la sonda binaria con un enunciado neutral respecto al resultado, lo que permite comparar el efecto del sesgo de formulación en la detección. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Clasificación de incidentes: emite una respuesta única que combina detección binaria y categoría de riesgo MIT.
- Asignación de categoría entre siete dominios de riesgo MIT o la etiqueta `No incident (potential only)`.
- Sonda binaria con enunciado neutral respecto al resultado (variante experimental "Exp 4").
- Inferencia con decodificación greedy según la receta del autor.
- Despliegue como módulo LoRA en vLLM con `--enable-lora --max-lora-rank 16`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito más allá de las heredadas del modelo base.

## Casos de uso

- Investigación sobre clasificación de incidentes: el adaptador sirve para reproducir el brazo "Exp 4" del proyecto IncidentBench y comparar el efecto de formulaciones neutrales frente a otras variantes de la sonda binaria.
- Estudio de etiquetas "silver": permite analizar cómo un clasificador entrenado con anotaciones generadas por modelo se desvía respecto a anotaciones humanas, dado que el autor documenta los modos de fallo conocidos.
- Análisis de sesgo de formulación: al ser una réplica neutral de una sonda binaria, se usa para medir si el enunciado del prompt altera la tasa de detección de incidentes.
- Evaluación de adaptadores LoRA en vLLM: sirve como ejemplo práctico de despliegue de un adaptador PEFT de rango 16 sobre Qwen2.5-7B-Instruct con `--enable-lora`.
- Reproducibilidad de experimentos: los manifiestos `data_manifest.json` y `train_manifest.json` permiten reconstruir filas de entrenamiento, formato de prompt y hashes para verificar resultados.
- Docencia y experimentación académica: útil en entornos de laboratorio para ilustrar pipelines de clasificación con modelos de lenguaje y sus limitaciones, nunca para decisiones sobre sistemas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite al informe de IncidentBench para las puntuaciones y los modos de fallo conocidos, pero dichos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA es ligero (repositorio de 0,2 GB), pero la inferencia requiere cargar el modelo base Qwen2.5-7B-Instruct completo.
- VRAM estimada: no disponible de forma oficial; para un modelo de 7B en precisión completa se necesitan del orden de 14-16 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, cabría en A100, H100 o RTX 4090 con cuantización adecuada.
- Despliegue: el autor indica vLLM con `--enable-lora --max-lora-rank 16 --lora-modules binary_neutral=chiffonng/incidentbench-binary_neutral`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-binary_neutral | LoRA r=16 sobre 7B | no disponible | Clasificación de incidentes (investigación) | other | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en la información | Instrucción general | no disponible en la información | Hugging Face |
| Otros brazos de IncidentBench | LoRA sobre 7B | no disponible | Variantes de la sonda de clasificación | other | no disponible en la información |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Etiquetas de entrenamiento "silver" generadas por modelo, no oro humano: los resultados pueden reflejar los sesgos del anotador automático.
- El autor documenta que el modelo tiende a infra-detectar incidentes (under-calls incidents), un modo de fallo conocido.
- Artefacto de investigación: el propio autor prohíbe explícitamente su uso para decisiones sobre sistemas reales.
- Licencia "other": no se detallan los términos, por lo que el uso comercial no está garantizado y requiere revisión.
- Idiomas soportados no documentados; dependen del modelo base y no se han validado para esta tarea.
- Longitud de contexto no especificada en la información disponible.
- Requiere aplicar el adaptador sin fusionar y usar el prompt exacto del transform `binary_neutral` con decodificación greedy para reproducir los resultados reportados.
- Sin métricas publicadas en la información disponible, no es posible evaluar su calidad de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/chiffonng/incidentbench-binary_neutral
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
