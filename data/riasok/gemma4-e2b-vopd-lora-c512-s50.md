# Riasok/gemma4-e2b-vopd-lora-c512-s50

## Resumen

`Riasok/gemma4-e2b-vopd-lora-c512-s50` es un repositorio de adaptadores LoRA entrenados sobre el modelo base `google/gemma-4-E2B-it`. El autor, Riasok, publica dos checkpoints resultantes de un proceso de destilación (distillation) aplicado a datos de matemáticas, con la particularidad de que emplea una técnica denominada "vOPD" (variante de *on-policy distillation*) en dos configuraciones: `vOPD_top-k` y `vOPD_full`. No se trata, por tanto, de un modelo completo, sino de pesos delta que deben combinarse con el modelo base de Google para poder utilizarse.

El interés de esta publicación es acotado y muy específico: sirve como artefacto reproducible de un experimento de destilación sobre un modelo Gemma 4 de la familia "E2B" (presumiblemente una variante eficiente de 2 mil millones de parámetros, aunque el dato no se confirma en la información disponible). Ambas ejecuciones se detuvieron en el paso 25 de checkpoint, con una tasa de aprendizaje de 1e-5, batch size de 64 y longitud máxima de 512 tokens, lo que sugiere un entrenamiento corto y probablemente exploratorio más que un ajuste final orientado a producción.

La relevancia práctica es limitada: cero descargas, cero likes, licencia "other" sin aclarar términos y ausencia de evaluación publicada. Se trata de un repositorio de investigación personal, útil para quien quiera inspeccionar la receta de destilación o reproducir el pipeline, pero no un modelo listo para desplegar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (modelo base `google/gemma-4-E2B-it`); arquitectura interna del base no disponible |
| Parámetros totales | no disponible (el adaptador LoRA ocupa 0,4 GB en el repo, repartido en dos checkpoints) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible para el modelo base; el entrenamiento se realizó con `max_length` de 512 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | `other` (términos no especificados; hereda presumiblemente las restricciones de Gemma) |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado son dos adaptadores LoRA (Low-Rank Adaptation) entrenados sobre `google/gemma-4-E2B-it`. La model card no detalla el rango, el alpha ni los módulos objetivo del adaptador, por lo que la configuración exacta del LoRA no está disponible. El método de entrenamiento se etiqueta como "vOPD" en dos variantes: `vOPD_top-k` y `vOPD_full`, descritas como destilación sobre datos de matemáticas. La nomenclatura sugiere una variante de *on-policy distillation* con selección top-k de tokens o vocabulario frente a una versión completa, pero la información proporcionada no desarrolla el algoritmo ni cita paper alguno.

Los hiperparámetros conocidos son idénticos en ambos runs: tasa de aprendizaje 1e-5, batch size 64, longitud máxima 512 y parada en el paso 25 de checkpoint (el nombre del repositorio indica `s50`, probablemente 50 pasos planificados). No se especifica el volumen de datos de matemáticas utilizado, la composición del dataset, si hubo etapas de RLHF/DPO adicionales ni la procedencia de las etiquetas de destilación (profesor utilizado). Tampoco se documenta la infraestructura de entrenamiento ni el coste computacional.

## Capacidades

- Al ser un adaptador sobre `gemma-4-E2B-it`, hereda las capacidades del modelo base, que no se detallan en la información disponible.
- El ajuste está orientado específicamente a tareas de matemáticas, según la etiqueta `math` y la descripción del autor.
- No se documenta soporte de tool calling ni function calling en el adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de lo que ofrezca el modelo base.
- Capacidades multilingües: no disponibles.
- No se declaran modos especiales (thinking mode, visión, audio) en la model card.
- No hay evaluación cualitativa ni ejemplos de uso incluidos en el repositorio.

## Casos de uso

- Reproducción de experimentos de destilación: el repositorio permite inspeccionar los checkpoints intermedios (paso 25) de dos variantes de vOPD y comparar su comportamiento frente al modelo base, útil para investigadores que estudien métodos de *on-policy distillation*.
- Investigación en ajuste eficiente de modelos pequeños para matemáticas: al tratarse de un LoRA sobre un modelo de gama "E2B", sirve como punto de partida para experimentar con datos matemáticos en entornos con recursos limitados.
- Análisis diferencial top-k frente a full: los dos directorios publicados permiten medir empíricamente si la selección top-k del vocabulario del profesor afecta a la calidad del estudiante en tareas aritméticas.
- Base para *continued training*: un equipo podría cargar estos adaptadores y continuar el entrenamiento más allá del paso 25 con su propio corpus matemático, dado que el coste de un LoRA de este tamaño es bajo.
- Docencia y formación: útil como ejemplo práctico de cómo se estructura un repositorio de adaptadores LoRA con múltiples checkpoints y metadatos de entrenamiento.
- Auditoría de licencias y trazabilidad: sirve para estudiar cómo se propaga la licencia "other" del modelo base de Gemma a los derivados publicados en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base `google/gemma-4-E2B-it`, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles.
- Viabilidad en GPU de consumo: no confirmada; el tamaño del repo (0,4 GB) corresponde solo a los adaptadores, no al modelo base.
- Opciones de despliegue: los adaptadores en safetensors pueden cargarse con bibliotecas compatibles con LoRA (PEFT, vLLM con soporte de adaptadores, TGI), pero no se documenta compatibilidad explícita con llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Riasok/gemma4-e2b-vopd-lora-c512-s50 | LoRA sobre Gemma 4 E2B | no disponible | no disponible | other | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it | Modelo base completo | no disponible | no disponible | Gemma (presumiblemente) | Hugging Face |
| Otros LoRA de destilación matemática | Adaptadores LoRA | variable | variable | variable | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy corto (parada en el paso 25 de un plan de 50), lo que probablemente deja el adaptador en un estado intermedio y no convergido.
- Longitud máxima de entrenamiento de 512 tokens, lo que puede limitar el rendimiento en problemas matemáticos que requieran cadenas de razonamiento largas.
- Licencia "other" sin términos explícitos: riesgo legal para uso comercial; debe verificarse la licencia de Gemma 4 y las condiciones que el autor imponga sobre los derivados.
- No hay evaluación publicada, ni métricas, ni ejemplos: imposible estimar la calidad real del ajuste.
- Riesgo de alucinación inherente al modelo base, no mitigado por un ajuste tan breve.
- Idiomas soportados no declarados; el ajuste se realizó presumiblemente en un único idioma y dominio (matemáticas).
- Repositorio sin descargas ni validación comunitaria: no hay señal externa de calidad.
- No se documenta el profesor utilizado en la destilación, lo que dificulta la reproducibilidad.
- Los checkpoints son adaptadores, no un modelo autónomo: requieren cargar el base de Google, con su propio coste de VRAM y sus propias restricciones de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Riasok/gemma4-e2b-vopd-lora-c512-s50
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
