# Charlie320/zils-flash-fg3

## Resumen

zils-flash-fg3 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B publicado por el usuario Charlie320 en Hugging Face. Forma parte del ecosistema "Zils" orientado a la subred 127 de Bittensor, donde se denomina "body" (cuerpo) del pool de modelos "soup" d3-flash. El modelo se distribuye con licencia Apache-2.0 y pesos en formato safetensors (BF16), con un total de 8.392.695.024 parámetros (aproximadamente 8,4 mil millones).

El modelo está diseñado como un "decision-model": un modelo especializado en tareas de decisión con formato de examen (exam-format decision items), incluyendo ítems de llamada a herramientas (tool-call). Se construye mediante la fusión uniforme de tres ajustes finos LoRA (rango 32, fusionados) partiendo de vllm-sr/d3-flash, con diferentes semillas y una pasada barajada sobre 61.091 filas de entrenamiento.

La relevancia de este modelo es acotada: se trata de un artefacto de un ecosistema de competición (Bittensor subnet 127) con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni idiomas declarados. Su interés principal es como ejemplo de metodología de "model soup" con etiquetas suaves (soft labels) y de ajuste fino sobre Qwen3.5-9B para tareas de decisión estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B); incluye vision tower heredada del modelo padre |
| Parametros totales | 8.392.695.024 (aproximadamente 8,4 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card indica "language weights trained" sin especificar idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-flash (Apache-2.0), que a su vez se construye sobre Qwen/Qwen3.5-9B. La arquitectura subyacente es un transformer de aproximadamente 8,4 mil millones de parámetros, con un "vision tower" heredado del modelo padre (según la model card, "vision tower from the parent"). El repositorio ocupa 16,8 GB, coherente con pesos en BF16.

El procedimiento de entrenamiento consistió en tres ajustes finos LoRA (rango 32, fusionados) del modelo de partida, cada uno con una semilla distinta y una pasada barajada sobre las 61.091 filas de datos, con tasa de aprendizaje 5e-5. Los tres adaptadores se promediaron uniformemente con pesos iguales (model soup). Las etiquetas de entrenamiento fueron suaves: para los ítems de examen escritos, tres cuartas partes de la respuesta propia del ítem y una cuarta parte de las probabilidades de respuesta del promedio "soup" d3-mini vigente (media ponderada uniforme de Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b); para las filas de tasksource-jev, la mitad de la etiqueta propia y la mitad de las probabilidades de ese promedio.

Los datos de entrenamiento (61.091 filas) se componen de: (1) aproximadamente 31.100 ítems de decisión en formato de examen de las familias de tareas conocidas, generados con la receta pública de autoría Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir de particiones de entrenamiento de los conjuntos de datos públicos, incluyendo unos 1.100 ítems de llamada a herramientas escritos a partir de las filas 90.000-93.000 del subconjunto de llamada a funciones de glaiveai/glaive-function-calling-v2; y (2) 30.000 filas de la partición de entrenamiento de tasksource/tasksource-jev-typed-decisions con sus etiquetas (solo fuentes con metadatos de licencia comercial o no especificada; se excluyeron fuentes no comerciales y se descartaron fuentes cuyos nombres coinciden con tareas de BIG-bench). No se usaron ítems de examen de validadores, ni ítems de examen semilla públicos, ni datos de clientes.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-9B.
- Toma de decisiones estructurada en formato de examen (exam-format decision items), que es el objetivo principal del ajuste.
- Llamada a herramientas (tool calling / function calling): se entrenaron aproximadamente 1.100 ítems específicos de tool-call a partir de glaive-function-calling-v2.
- Capacidades de visión: el modelo incorpora el vision tower del modelo padre, aunque la model card no detalla el alcance ni el rendimiento de esta capacidad.
- Capacidades multilingües: la model card menciona "language weights trained" pero no especifica qué idiomas; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; no disponible.
- Modo "thinking": no documentado; no disponible.

## Casos de uso

- Evaluación de modelos de decisión en competiciones Bittensor: el modelo actúa como "body" del pool d3-flash de la subred 127, donde se emplea para responder ítems de examen de decisión y comparar su rendimiento frente a otros cuerpos del pool.
- Clasificación y decisión estructurada: dado un ítem en formato de examen con opciones, el modelo selecciona la respuesta; adecuado para tareas de enrutamiento o etiquetado donde la salida es una decisión discreta.
- Llamada a funciones en asistentes: los ítems de tool-call entrenados permiten integrarlo en flujos donde el modelo debe emitir llamadas a funciones a partir de una petición en lenguaje natural.
- Investigación sobre model soups y etiquetas suaves: sirve como caso reproducible de fusión de LoRAs con promediado uniforme y destilación de probabilidades de un ensemble, útil para estudiar metodologías de ajuste eficiente.
- Prototipado de asistentes con entrada visual: gracias al vision tower heredado, puede emplearse en experimentos que combinen texto e imagen, aunque sin garantías documentadas de rendimiento.
- Base para ajustes posteriores: al ser un fine-tune Apache-2.0 de Qwen3.5-9B, puede servir como punto de partida para nuevos ajustes en dominios específicos de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB solo para pesos, más memoria para el contexto y el vision tower; en la práctica se recomienda al menos 24 GB para inferencia cómoda en BF16.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos (estimación teórica; no se publican cuantizaciones oficiales).
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB para pesos (estimación teórica; requiere convertir los pesos, ya que el repositorio solo contiene safetensors en BF16).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090 (24 GB) también es viable en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16 con contexto limitado, o en GPUs de 8-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM (el modelo base pertenece al ecosistema vllm-sr), TGI, llama.cpp u Ollama tras conversión a GGUF, y Transformers con safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-fg3 | ~8,4 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de decisión sobre Qwen3.5-9B; sin benchmarks |
| Qwen/Qwen3.5-9B | ~9 B (según denominación) | no disponible | no disponible en la información | Hugging Face | Modelo base; capacidades generales |
| vllm-sr/d3-flash | no disponible | no disponible | Apache-2.0 | Hugging Face | Modelo de partida del fine-tune; base del pool d3-flash |
| Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg, joamCriff123/zils-mini-m1113b | no disponible | no disponible | no disponible | Hugging Face | Componentes del promedio d3-mini usado para las etiquetas suaves |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El modelo tiene cero descargas y cero "likes" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Es un artefacto de un ecosistema de competición (Bittensor subnet 127); su diseño está orientado a ítems de examen de ese entorno y puede no generalizar bien fuera de él.
- No se especifican los idiomas soportados ni la longitud de contexto; ambos datos son críticos para producción y no están disponibles.
- Las etiquetas de entrenamiento son suaves y derivadas de otro ensemble (d3-mini), lo que puede propagar sesgos y errores de ese promedio.
- Riesgo de alucinación inherente a los modelos de ~8 B; no se documentan mitigaciones.
- La model card advierte que el repositorio contiene solo pesos y que deben verificarse los términos de los conjuntos de datos de origen antes de su reutilización.
- Aunque la licencia es Apache-2.0, los datos de entrenamiento provienen de fuentes con licencias heterogéneas (se excluyeron las no comerciales), por lo que la reutilización comercial debe revisarse con cautela.
- El vision tower se hereda del modelo padre sin documentación sobre su ajuste o rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-flash-fg3
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo de partida vllm-sr/d3-flash: https://huggingface.co/vllm-sr/d3-flash
- Conjunto de datos tasksource/tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Conjunto de datos glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Componentes del promedio d3-mini: https://huggingface.co/Zayaan/zils-mini-hm4, https://huggingface.co/qhoenix/zils-mini-decision-t2avg, https://huggingface.co/joamCriff123/zils-mini-m1113b
