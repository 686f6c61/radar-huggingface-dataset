# open-athena/Snowball-LongLoop-Round5-2026.11.23.140-step22

## Resumen

Snowball-LongLoop-Round5-2026.11.23.140-step22 es un checkpoint de investigación publicado por la organización open-athena dentro del ecosistema del proyecto Marin (marin-community). Se trata de un modelo de tipo MoE (mixture of experts, etiquetado como `grug_moe` en los metadatos) con 67.078.882.816 parámetros totales almacenados en formato safetensors, distribuido bajo licencia OpenMDW-1.1. El checkpoint corresponde a la ronda 5 del ciclo denominado "LongLoop", en su paso 22 de RL.

El modelo es el resultado de un pipeline de dos fases: un ajuste supervisado final (SFT) que alcanzó el checkpoint 527 (528 actualizaciones completadas) y un posterior entrenamiento con refuerzo (RL) que seleccionó el checkpoint 22 como mejor modelo por validación. La selección se realizó mediante la EMA de validación más alta en una ventana de 5, requiriendo al menos 180 de 200 prompts de holdout puntuados; en el paso 22 se puntuaron 189 prompts, con una recompensa bruta de 0,5648 y una EMA de 0,5394.

La relevancia de esta ficha es acotada: el propio autor lo declara explícitamente como artefacto de investigación no evaluado ni probado de forma adecuada, por lo que no debe considerarse un modelo listo para producción ni una reivindicación de paridad de calidad con alternativas comerciales. Su interés es principalmente documental y experimental, dentro del seguimiento del recetario de entrenamiento y evaluación del proyecto Marin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `grug_moe`); detalles internos no disponibles |
| Parametros totales | 67.078.882.816 (67,08 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 134,2 GB |
| Pipeline declarado | no disponible |
| Region | us |

## Arquitectura y entrenamiento

La arquitectura se identifica en los metadatos como `grug_moe`, lo que sitúa al modelo en la familia de transformers con mezcla de expertos, con 67,08 mil millones de parámetros totales. No se dispone de información pública en la documentación proporcionada sobre el número de parámetros activos por token, el número de expertos, el mecanismo de enrutamiento ni la longitud de contexto nativa.

El entrenamiento consta de dos etapas documentadas. La primera es un ajuste supervisado (SFT) que finalizó en el checkpoint 527, con 528 actualizaciones completadas y un runtime reanudado identificado como `cf9db0ac38`. La segunda es un ciclo de aprendizaje por refuerzo (RL) cuya fuente de entrenamiento se identifica con el hash `71d264379641093f02789a05cc3294038a8ec990`, y del que se seleccionó el checkpoint 22. La selección del mejor checkpoint se basó en la EMA de validación con ventana 5 sobre un conjunto de 200 prompts de holdout, exigiendo un mínimo de 180 prompts puntuados; en el paso 22 se evaluaron 189 prompts, obteniendo una recompensa bruta de 0,5648148148 y una EMA de 0,5393787708. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como DPO o decodificación especulativa.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje de gran tamaño, aunque no se documentan evaluaciones específicas.
- Razonamiento y matemáticas: no disponible; no se han publicado resultados que lo respalden.
- Generación de código: no disponible; no se documenta soporte ni evaluación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas soportados no figuran en los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ajuste por refuerzo: el checkpoint incorpora una etapa de RL con recompensa medida, lo que sugiere optimización orientada a preferencias o tareas evaluables, si bien la naturaleza exacta de la recompensa no se detalla.

## Casos de uso

- Investigación sobre recetas de entrenamiento: el checkpoint sirve para reproducir y analizar el pipeline SFT + RL documentado en el issue de Marin, comparando curvas de recompensa y selección por EMA de validación.
- Estudio de dinámicas de RL en modelos MoE: permite inspeccionar cómo evoluciona la recompensa bruta frente a la EMA a lo largo de los pasos y evaluar la estabilidad del entrenamiento.
- Experimentos de alineación y selección de checkpoints: útil para validar metodologías de selección por ventana móvil y umbral mínimo de prompts puntuados en lugar de usar el checkpoint final.
- Reproducibilidad de artefactos de investigación: al publicarse con hashes de runtime y fuente de entrenamiento, facilita la auditoría del proceso por parte de otros grupos.
- Base para fine-tuning controlado en entornos de laboratorio: puede emplearse como punto de partida en experimentos académicos con datos propios, siempre asumiendo la ausencia de evaluación de calidad.
- Docencia y formación técnica: útil para ilustrar el ciclo completo de un modelo MoE desde SFT hasta RL y la diferencia entre checkpoint final y mejor checkpoint por validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la recompensa del entrenamiento por refuerzo en el paso 22: recompensa bruta de 0,5648148148 y EMA de 0,5393787708 sobre 189 de 200 prompts de holdout. No se especifica la métrica subyacente ni la tarea evaluada, por lo que no es comparable con MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 67,08 mil millones de parámetros en safetensors, en precisión de 16 bits se requieren aproximadamente 134 GB de VRAM solo para los pesos, más memoria para el KV cache y activaciones.
- En cuantización de 8 bits, la estimación ronda los 67 GB; en 4 bits, en torno a 34-40 GB. Estas cifras son estimaciones por tamaño y no proceden de documentación del autor.
- GPU recomendadas: para 16 bits se necesitan configuraciones multi-GPU, como 2x H100 80 GB o 2x A100 80 GB; para 8 bits, una H100 80 GB o A100 80 GB podría ser suficiente; para 4 bits, una RTX 4090 de 24 GB no bastaría y se requeriría al menos una GPU de 48 GB o reparto entre varias consumer GPU.
- No cabe en una única GPU consumer de 24 GB en ninguno de los formatos habituales sin cuantización agresiva y offloading.
- Opciones de despliegue: no se documentan en la información disponible; al publicarse solo safetensors, sería necesario convertir a GGUF para llama.cpp u Ollama, o usar frameworks como vLLM o TGI si la arquitectura `grug_moe` está soportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, y la arquitectura `grug_moe` no permite emparejamientos fiables con alternativas conocidas sin datos de parámetros activos, contexto y benchmarks.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo responsabilidad del usuario.
- No es una reivindicación de paridad de calidad con otros modelos; es un artefacto de investigación.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgo.
- Riesgo de alucinación: no cuantificado, pero esperable en un modelo sin evaluación publicada.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto y los idiomas soportados.
- Restricciones de licencia: OpenMDW-1.1; deben revisarse los términos completos antes de cualquier uso comercial, ya que la model card solo indica la obligación de cumplir la ley aplicable.
- El checkpoint seleccionado (paso 22) se eligió por EMA de validación con un umbral de cobertura de 189 de 200 prompts, lo que deja margen a que la métrica no refleje el comportamiento completo del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Snowball-LongLoop-Round5-2026.11.23.140-step22
- Registro de evaluación y receta (Marin): https://github.com/marin-community/marin/issues/11337
