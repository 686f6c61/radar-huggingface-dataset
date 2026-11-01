# chiffonng/incidentbench-silver_nonamed

## Resumen

`incidentbench-silver_nonamed` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen2.5-7B-Instruct por el usuario chiffonng. No es un modelo generativo de propósito general, sino un artefacto de investigación para una tarea de clasificación concreta: el clasificador conjunto de IncidentBench, que debe devolver en una sola respuesta una de las siete categorías de riesgo de MIT o la etiqueta `No incident (potential only)`. La detección de incidente y su categoría se derivan ambas de esa única respuesta, lo que simplifica el pipeline de evaluación frente a enfoques con cabeceras separadas.

El adaptador corresponde al brazo experimental «Exp 3a», cuyo objetivo es eliminar la señal textual «Named in the record» (la pista de fuente que indica que el incidente está nombrado en el registro) manteniendo todas las fuentes de datos. Las etiquetas de entrenamiento son «silver», es decir, generadas por un modelo siguiendo la guía de anotación del proyecto, no anotaciones humanas gold. El propio autor lo describe explícitamente como un artefacto de investigación y advierte de que no debe usarse para tomar decisiones sobre sistemas reales.

La relevancia es por tanto metodológica y acotada: sirve para reproducir experimentos de ablación sobre señales de fuente en clasificación de incidentes, y su interés práctico depende del informe de IncidentBench, donde se documentan las puntuaciones y los modos de fallo conocidos (el autor señala que infravalora incidentes, es decir, tiene tendencia a no llamarlos). El repositorio ocupa 0,2 GB y se distribuye como pesos PEFT en safetensors, aplicados sin fusionar sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador PEFT; el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se sirve en precision del modelo base; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas; el adaptador esta entrenado para una tarea en ingles presumiblemente, sin confirmacion) |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7,6 mil millones de parámetros. No se fusiona con el modelo base: en todas las ejecuciones reportadas se aplica en caliente, lo que permite servir varias ablaciones sobre el mismo base con `--enable-lora`. La tarea es de clasificación generativa: el modelo recibe un prompt con el caso y debe emitir una única respuesta entre siete dominios de riesgo de MIT o la etiqueta `No incident (potential only)`; detección y categoría se leen de esa misma respuesta. La decodificación recomendada es greedy.

El entrenamiento usó etiquetas «silver» generadas por un modelo bajo la guía de anotación del proyecto, no anotaciones humanas. El brazo «Exp 3a» elimina la pista de fuente «Named in the record» del prompt conservando todas las fuentes de datos, de modo que mide cuánto depende el clasificador de esa señal. El stack declarado es transformers 5.9.0 y peft 0.19.1. Los detalles de formato de prompt, filas de entrenamiento y hashes están en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`, ambos referenciados en la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO (no aplica a un adaptador de clasificación de este tipo).

## Capacidades

- Clasificación de incidentes en una sola respuesta: devuelve una de siete categorías de riesgo de MIT o `No incident (potential only)`.
- Detección y categorización conjuntas: ambas se derivan de la misma etiqueta emitida, sin cabeceras separadas.
- Ablación controlada de señal de fuente: variante sin la pista «Named in the record», pensada para comparar contra otros brazos del mismo benchmark.
- Servido multi-adaptador: compatible con vLLM y LoRA dinámico, lo que permite cargar varios brazos sobre el mismo Qwen2.5-7B-Instruct.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking propias del adaptador; cualquier capacidad de ese tipo provendría del modelo base y no está validada para esta tarea.

## Casos de uso

- Reproducción de experimentos de ablación: cargar el adaptador con `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules silver_nonamed=chiffonng/incidentbench-silver_nonamed` y comparar sus salidas con otros brazos de IncidentBench para medir el efecto de eliminar la pista de fuente.
- Evaluación de clasificadores de riesgo: usar el adaptador como línea base «silver» en la tarea de siete dominios MIT, midiendo cuánto se aleja de anotaciones humanas gold.
- Estudio de modos de fallo: dado que el autor documenta que infravalora incidentes, sirve para analizar la asimetría de errores (falsos negativos) en clasificación de incidentes.
- Investigación sobre etiquetas silver: permite estudiar la brecha entre supervisión generada por modelo y anotación humana en una tarea de seguridad.
- Docencia y metodología: ejemplo reproducible de adaptador LoRA de rango 16 con manifiestos de datos y receta de entrenamiento versionados.
- Infraestructura de serving LoRA: caso práctico de despliegue multi-adaptador con vLLM sobre un único modelo base de 7B, útil para equipos que evaluan varias variantes sin duplicar pesos.
- No es adecuado para clasificar incidentes de sistemas reales, según la advertencia explícita del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe de IncidentBench para puntuaciones y modos de fallo, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base Qwen2.5-7B-Instruct. En FP16 el base requiere del orden de 15-16 GB de pesos, más KV cache y overhead; en cuantización de 4 bits del orden de 5-6 GB, aunque no se documentan cuantizaciones del adaptador.
- GPU recomendadas: no especificadas por el autor. El serving indicado es vLLM con `--enable-lora`, lo que en la práctica apunta a GPUs con suficiente VRAM para el base de 7B (A100, H100, L40S o RTX 4090 para FP16 ajustado).
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB solo mediante cuantización del base; no confirmado en la información disponible.
- Opciones de despliegue: vLLM es la vía documentada (`--enable-lora --max-lora-rank 16 --lora-modules`). No se documentan llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-silver_nonamed (este) | LoRA r=16 sobre 7,6B | no disponible | Clasificacion de incidentes (7 dominios MIT) | other | HuggingFace, 14 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6B | no disponible en la informacion | Generacion general, instruct | no disponible en la informacion | HuggingFace, ampliamente usado |
| Otros brazos de IncidentBench | LoRA sobre el mismo base | no disponible | Misma tarea, distintas ablaciones | other | Referenciados en la model card, sin detalle |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Etiquetas silver: el entrenamiento usa etiquetas generadas por modelo, no anotaciones humanas gold; los sesgos del anotador se transfieren al adaptador.
- Infravalora incidentes: el autor documenta explícitamente que tiende a no llamar incidentes (falsos negativos), un modo de fallo crítico en clasificación de riesgo.
- Artefacto de investigación: la model card prohíbe implícitamente su uso para decisiones sobre sistemas reales.
- Licencia «other»: no se detallan los términos; hay que consultar el repositorio antes de cualquier uso comercial.
- Idiomas no declarados: no se especifica para qué idiomas está validado el adaptador.
- Contexto no declarado: la longitud de contexto efectiva del adaptador no se documenta; se hereda del base pero no se valida para esta tarea.
- Dependencia del prompt: el rendimiento depende del formato exacto de prompt del brazo (`train/build_data.py`, transformación `nonamed`) y de decodificación greedy; desviarse de ese formato invalida los resultados.
- Repositorio de bajo uso (14 descargas, 0 likes) y sin pipeline declarado, lo que limita la validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/chiffonng/incidentbench-silver_nonamed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Manifiestos referenciados en la model card: `data_manifest.json` y `train_manifest.json` (en el repositorio del adaptador)
- Informe de IncidentBench: no disponible como enlace en la informacion proporcionada
