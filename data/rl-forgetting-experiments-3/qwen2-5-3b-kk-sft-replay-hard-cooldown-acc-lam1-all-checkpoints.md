# RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-replay-hard-cooldown-acc-lam1-all-checkpoints

## Resumen

`qwen2.5-3b-kk-sft-replay-hard-cooldown-acc-lam1-all-checkpoints` es un ajuste fino supervisado (SFT) del modelo Qwen2.5-3B, publicado por el usuario RL-Forgetting-Experiments-3 en Hugging Face. El propio nombre del repositorio describe el experimento: entrenamiento con reinyección de datos (replay) sobre la tarea de razonamiento lógico *knights-and-knaves* (KK), con una programación de learning rate etiquetada como `hard_cooldown_acc` y un coeficiente `lam1` (lambda = 1). El repositorio incluye todos los checkpoints validados y confirmados de esa rama del barrido experimental, hasta el paso 318.

No se trata de un lanzamiento de producto, sino de un artefacto de investigación orientado a estudiar el olvido catastrófico (*catastrophic forgetting*) durante el ajuste fino. La combinación de las etiquetas `sft`, `replay` y `knights-and-knaves` sugiere un montaje experimental en el que se especializa el modelo en una tarea de lógica concreta mientras se intenta preservar el comportamiento general mediante replay de datos; el sufijo `hard_cooldown` apunta a un enfriamiento agresivo de la tasa de aprendizaje.

El repositorio ocupa 12,4 GB y contiene pesos en formato safetensors, un tamaño coherente con la inclusión de varios checkpoints del mismo modelo base de aproximadamente 3.000 millones de parámetros. No se han publicado en la información disponible datos de benchmarks, idiomas soportados, composición del dataset ni detalles sobre el uso de RLHF o DPO, por lo que debe tratarse como material de reproducción experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (heredada del modelo base Qwen2.5-3B; no se documentan cambios estructurales en el repositorio) |
| Parametros totales | No disponible en el repositorio; el modelo base Qwen2.5-3B declara ~3.000 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Qwen2.5-3B declara 32.768 tokens nativos, ampliables con YaRN según la documentación oficial de Qwen2.5 |
| Tipos de cuantizacion | No se publican variantes cuantizadas; al derivar de Qwen2.5-3B es convertible a 8 y 4 bits con llama.cpp, AWQ o GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-3B |
| Pasos de entrenamiento | 318 (barrido interrumpido antes del paso final previsto en algunas ramas) |
| Tamano del repositorio | 12,4 GB |
| Fecha de publicacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), que reduce el coste de la caché KV frente a la atención multi-cabeza clásica. El repositorio no documenta ninguna modificación estructural sobre esa base, de modo que la innovación del artefacto reside exclusivamente en el procedimiento de ajuste, no en el diseño de la red.

En cuanto al entrenamiento, la model card indica que se aplicó SFT con replay sobre la tarea *knights-and-knaves* y que el barrido se detuvo en el paso 318. La rama publicada corresponde a la configuración `hard_cooldown_acc` con `lam1`, etiquetas que describen una programación de learning rate con enfriamiento fuerte y un coeficiente lambda igual a 1. El autor advierte explícitamente de que los brazos del barrido cuya lista de checkpoints termina antes de lo previsto fueron interrumpidos, y de que ningún checkpoint inexistente o parcial se representa como completo. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset de replay, ni sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen2.5-3B.
- Razonamiento lógico sobre problemas de tipo *knights-and-knaves*, que es el objetivo declarado del ajuste fino.
- Comprensión y resolución de acertijos deductivos con restricciones de veracidad de los interlocutores.
- Capacidades de código, matemáticas y conocimiento general presumiblemente heredadas del modelo base, aunque no verificadas ni documentadas en este repositorio.
- Soporte de tool calling y function calling: Qwen2.5 lo incorpora de serie, pero no hay confirmación de que se conserve tras este ajuste.
- Capacidades de agente y razonamiento multi-paso: no verificadas en este artefacto.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en la ficha.
- Modo de razonamiento explícito (*thinking mode*), visión o audio: no disponibles; no se documentan.

## Casos de uso

- Investigación sobre olvido catastrófico: el repositorio permite comparar los distintos checkpoints de una misma rama y medir cómo evoluciona la especialización en la tarea KK frente a la degradación de capacidades generales a lo largo de los 318 pasos.
- Reproducción de experimentos de replay de datos: sirve como punto de partida para replicar la receta `sft + replay` con distintas proporciones de datos de replay y comprobar su efecto sobre la retención.
- Estudio de programaciones de learning rate: la etiqueta `hard_cooldown_acc` identifica una configuración concreta de enfriamiento, útil para comparar curvas de aprendizaje frente a otras ramas del mismo barrido.
- Evaluación interna de modelos pequeños de razonamiento: al ser un modelo de ~3B, puede ejecutarse en una única GPU consumer para construir conjuntos de evaluación de lógica proposicional sin coste elevado.
- Generación de variantes de puzzles *knights-and-knaves*: el ajuste sobre esa tarea permite usar el modelo para producir nuevos enunciados y soluciones como datos sintéticos de entrenamiento.
- Análisis de estabilidad entre checkpoints: al incluirse todos los checkpoints validados, es posible estudiar la variabilidad de las respuestas a lo largo del entrenamiento en lugar de evaluar únicamente el estado final.
- Fine-tuning posterior sobre lógica formal: el modelo puede servir de inicialización para experimentos que necesiten un punto de partida ya sesgado hacia tareas deductivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara el número de pasos (318) y la composición del barrido, sin métricas de exactitud, pérdida ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamaño del modelo base, no confirmadas por el autor): en bf16/fp16 en torno a 6-7 GB; en int8 en torno a 3,5-4 GB; en int4 en torno a 2-2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100 o L40S para despliegue con alta concurrencia mediante vLLM o TGI.
- Compatibilidad con GPU consumer: sí, cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090, tanto en bf16 como en cuantizaciones de 8 y 4 bits.
- Opciones de despliegue: transformers para inferencia directa, vLLM o TGI para servidores con batching continuo, llama.cpp u Ollama previa conversión de los safetensors a GGUF.
- Almacenamiento: el repositorio completo ocupa 12,4 GB por incluir todos los checkpoints; para inferencia solo es necesario descargar uno de ellos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparativa se establece frente al modelo base y a alternativas de tamaño equivalente. Los datos de especificaciones de los modelos alternativos proceden de sus fichas públicas; las cifras de rendimiento no están disponibles para ninguno de ellos en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Uso previsto | Rendimiento |
|---|---|---|---|---|---|
| qwen2.5-3b-kk-sft-replay-hard-cooldown-acc-lam1 (este modelo) | ~3.000 M (heredado) | No disponible (base: 32.768) | Apache 2.0 | Investigación sobre olvido catastrófico y lógica KK | No disponible |
| Qwen/Qwen2.5-3B (base) | ~3.000 M | 32.768 nativos, ampliable con YaRN | Apache 2.0 | Modelo generalista de propósito múltiple | No disponible |
| meta-llama/Llama-3.2-3B-Instruct | ~3.210 M | 128.000 | Llama 3.2 Community License | Asistente generalista, licencia con restricciones | No disponible |
| microsoft/Phi-3-mini-4k-instruct | ~3.800 M | 4.096 | MIT | Razonamiento y generación con fuerte foco en datos sintéticos | No disponible |

Frente al modelo base, este artefacto se diferencia por la especialización en la tarea KK y por la metodología de entrenamiento, no por un aumento de capacidades. Frente a Llama-3.2-3B, la ventaja principal es la licencia Apache 2.0 sin cláusulas adicionales, además de un contexto nativo menor en el modelo base. Frente a Phi-3-mini, cuenta con menos parámetros y una licencia igualmente permisiva, pero no hay métricas públicas que permitan comparar su rendimiento real.

## Limitaciones y advertencias

- Artefacto de investigación: el repositorio está pensado para reproducir un barrido experimental, no para su uso directo en producción.
- Ausencia total de evaluaciones: no hay benchmarks, ni métricas de pérdida, ni comparaciones que permitan estimar la calidad del modelo.
- Barrido incompleto: el autor advierte de que el entrenamiento se interrumpió antes del paso final previsto en algunas ramas, por lo que los checkpoints incluidos no representan necesariamente un estado convergido.
- Riesgo de olvido catastrófico: al ser un ajuste fino intensivo sobre una única tarea, es probable que las capacidades generales del modelo base se hayan degradado, aunque no hay datos que cuantifiquen esa pérdida.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Qwen2.5-3B, no evaluados aquí.
- Riesgo de alucinación: no evaluado; en tareas de lógica deductiva, una alucinación puede producir una respuesta formalmente plausible pero inconsistente con las restricciones del problema.
- Idiomas: la ficha no declara ningún idioma soportado, por lo que no puede asumirse un comportamiento multilingüe fiable.
- Longitud de contexto: no confirmada en el repositorio; debe verificarse en la configuración del modelo antes de usarlo con secuencias largas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se aplica sin garantías y sin que el autor haya validado ningún escenario de producción.
- Popularidad nula: cero descargas y cero reacciones en el momento de la consulta, sin comunidad que haya validado su comportamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-replay-hard-cooldown-acc-lam1-all-checkpoints
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo. Todos los enlaces obtenidos corresponden al videojuego Rocket League y son ajenos al artefacto descrito, por lo que se omiten.
