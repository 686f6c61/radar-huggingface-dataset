# sartajbhuvaji/bonsai-distilled-depth12-experts80-lora-vs-baseline-3k-warmup450-lr1e4

## Resumen

Bonsai distilled depth12 experts80 lora vs baseline 3k warmup450 lr1e4 es un checkpoint de generacion de texto publicado por Sartaj Bhuvaji en HuggingFace. Se trata de un modelo de tipo mezcla de expertos (MoE) construido sobre la arquitectura `qwen3_moe` de la libreria transformers. El nombre del repositorio indica que pertenece a la familia de experimentos "bonsai", un programa de destilacion de conocimiento y poda de modelos Qwen3, y que este checkpoint concreto corresponde a la variante con profundidad 12 y 80 expertos, entrenada durante 3.000 pasos con 450 pasos de warmup y una tasa de aprendizaje de 1e-4.

El modelo cuenta con 9.459.231.744 parametros totales segun los pesos en safetensors, y el repositorio ocupa 18,9 GB. No dispone de model card descriptiva: el README es la plantilla automatica de HuggingFace sin rellenar, por lo que no hay informacion oficial sobre datos de entrenamiento, idiomas, licencia ni evaluacion. Tampoco registra descargas ni likes en el momento de la consulta.

Su relevancia es principalmente de investigacion: se enmarca en una linea de trabajo sobre destilacion de modelos MoE grandes (Qwen3-30B-A3B-Base actuaria como profesor en los experimentos hermanos de la misma serie) hacia estudiantes podados mas pequenos. Al carecer de documentacion, benchmarks y licencia explicita, no es un modelo apto para produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer basado en `qwen3_moe` (segun la libreria y los tags de HuggingFace) |
| Parametros totales | 9.459.231.744 (dato real de los pesos safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye unicamente en safetensors; no constan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 18,9 GB |
| Pipeline declarado | text-generation |
| Tags | transformers, safetensors, qwen3_moe, text-generation, conversational, arxiv:1910.09700, endpoints_compatible, region:us |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

El tag `qwen3_moe` y la clase de configuracion asociada indican que el modelo sigue el diseno de Qwen3 con mezcla de expertos: capas de atencion agrupada con enrutado tipo top-k hacia un subconjunto de expertos por token. El nombre del checkpoint concreta dos hiperparametros estructurales de la poda: profundidad 12 (numero de capas del estudiante) y 80 expertos por capa. Con 9,46 mil millones de parametros totales, el modelo se situa entre un denso de ~9B y un MoE con una fraccion pequena de parametros activos por token, aunque el numero exacto de parametros activos no esta documentado.

No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineacion. Por analogia con los checkpoints hermanos de la misma serie (por ejemplo `bonsai-distilled-aggressive-vs-baseline`), el procedimiento consistiria en destilacion de conocimiento sobre una cache fija de logits top-k de un profesor Qwen3-30B-A3B-Base, con el sufijo "vs-baseline" indicando que este checkpoint forma parte de un brazo de comparacion de un ablation. El sufijo "3k-warmup450-lr1e4" sugiere 3.000 pasos de entrenamiento, 450 pasos de warmup y tasa de aprendizaje 1e-4. Estos detalles son inferencias a partir de la nomenclatura y de repositorios relacionados, no datos confirmados en la model card de este modelo.

La innovacion tecnica del conjunto de experimentos es la combinacion de poda estructural (reduccion simultanea de profundidad y numero de expertos) con destilacion, buscando retener el comportamiento del profesor a una fraccion del coste de inferencia. Las etiquetas del repositorio no mencionan decodificacion especulativa, atencion lineal ni mecanismos hibridos.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el tag `conversational` indica compatibilidad con plantillas de chat, aunque no hay ejemplos de uso ni evaluacion publicada.
- Razonamiento y conocimiento general: capacidad esperada por herencia del profesor Qwen3, pero no verificada ni cuantificada en este checkpoint.
- Generacion de codigo: probable por el dominio del profesor, sin datos de HumanEval ni similares.
- Soporte de tool calling / function calling: no disponible; el formato de plantilla de Qwen3 suele incluir herramientas, pero no se confirma en esta model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declara ninguna.

## Casos de uso

- Investigacion en destilacion de MoE: el checkpoint sirve como punto de comparacion frente a otros brazos del ablation bonsai (por ejemplo, la variante `aggressive-vs-baseline`), permitiendo medir la perdida de calidad al reducir profundidad y expertos.
- Base para fine-tuning especifico de dominio: con 9,46B de parametros totales, es viable ajustarlo con LoRA en una unica GPU de 24 GB para tareas acotadas, partiendo siempre de una evaluacion propia previa.
- Experimentos de cuantizacion: al no existir versiones GGUF ni AWQ publicadas, es un candidato para generar cuantizaciones propias y medir la degradacion en tareas de generacion.
- Estudio de eficiencia de inferencia en MoE: permite comparar latencia y throughput frente al profesor Qwen3-30B-A3B-Base en el mismo hardware.
- Generacion de texto asistida en entornos de investigacion: borradores, resumenes y reescritura en ingles o multilingue, siempre que una evaluacion interna confirme la calidad en el idioma objetivo.
- Reproducibilidad de experimentos academicos: al estar publicado en safetensors y ser compatible con `transformers`, facilita la replicacion de resultados de poda y destilacion.
- Prototipado con endpoints compatibles: el tag `endpoints_compatible` y su presencia en FriendliAI permiten desplegarlo como API para pruebas de concepto sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion y no se han encontrado tablas comparativas en los resultados de busqueda web.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir de los 9,46B de parametros; no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en bf16/fp16: aproximadamente 19 GB solo para pesos, mas cache KV y activaciones.
- VRAM en precision de 8 bits: en torno a 9,5 a 10 GB.
- VRAM en cuantizacion de 4 bits: en torno a 5,5 a 6 GB (requiere generar la cuantizacion, no disponible en el repositorio).
- GPU consumer: cabe en una RTX 4090 o RTX 3090 de 24 GB en bf16 con contexto moderado, y en GPUs de 8 a 12 GB si se cuantiza a 4 bits.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para servir en precision completa con contextos largos y lotes grandes.
- Opciones de despliegue: `transformers` como via directa; vLLM y SGLang para servir MoE con alto throughput; TGI como alternativa; llama.cpp u Ollama solo si se generan pesos GGUF, que actualmente no existen en el repositorio. FriendliAI aparece como proveedor de inferencia listado para este modelo.
- Latencia y throughput: no disponible. Al ser un MoE con parametros activos desconocidos, el throughput real depende del numero de expertos activados por token, dato que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bonsai-distilled-depth12-experts80-lora-vs-baseline-3k-warmup450-lr1e4 | 9,46B | no disponible | no disponible | no disponible | HuggingFace, safetensors |
| bonsai-distilled-aggressive-vs-baseline (checkpoint hermano de la misma serie) | ~8,5B | no disponible | no disponible | no disponible | HuggingFace, safetensors |
| Qwen/Qwen3-30B-A3B-Base (profesor segun la serie bonsai) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos verificados de rendimiento, contexto o licencia para ninguno de los tres modelos dentro de la informacion proporcionada, por lo que la comparativa se limita a los parametros totales y a la disponibilidad de pesos. La comparacion cuantitativa de calidad no es posible sin benchmarks publicados.

## Limitaciones y advertencias

- Model card vacia: el README es la plantilla automatica sin rellenar, por lo que no hay documentacion oficial de uso previsto, datos de entrenamiento ni limitaciones declaradas por el autor.
- Licencia no especificada: sin licencia explicita no se puede asumir permiso para uso comercial. Es necesario contactar con el autor o verificar los terminos de los modelos de los que deriva.
- Idiomas no declarados: se desconoce que idiomas cubre realmente el modelo; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: sin evaluacion publicada ni etapas de alineacion documentadas, no hay garantia de fidelidad factual ni de seguridad en las respuestas.
- Sesgos: no se ha publicado ningun analisis de sesgos. Al derivar de un corpus de entrenamiento no documentado, puede reproducir sesgos presentes en el profesor.
- Sin benchmarks: no existen datos de MMLU, HumanEval, GSM8K ni similares, por lo que cualquier afirmacion de calidad seria especulativa.
- Naturaleza experimental: la nomenclatura indica un brazo de ablation dentro de una investigacion de destilacion, no un modelo afinado para produccion.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validacion por parte de la comunidad.
- Contexto desconocido: no se puede planificar un caso de uso con contexto largo sin conocer la ventana real de entrenamiento.
- Fecha de publicacion atipica: el repositorio figura como creado el 2026-10-09, lo que puede indicar metadatos incorrectos o un experimento de fechado; conviene verificarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth12-experts80-lora-vs-baseline-3k-warmup450-lr1e4
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/sartajbhuvaji/bonsai-distilled-depth12-experts80-vs-baseline-3k-warmup450-lr1e4
- Checkpoint hermano bonsai-distilled-aggressive-vs-baseline: https://huggingface.co/sartajbhuvaji/bonsai-distilled-aggressive-vs-baseline
- Checkpoint hermano bonsai-distilled-aggressive-vs-baseline-3k-warmup450-lr1e4: https://huggingface.co/sartajbhuvaji/bonsai-distilled-aggressive-vs-baseline-3k-warmup450-lr1e4
- Perfil de GitHub del autor: https://github.com/SartajBhuvaji
- Perfil de Google Scholar del autor: https://scholar.google.com/citations?user=SAu33LIAAAAJ&hl=en
- Referencia citada en los tags del modelo (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact#compute
