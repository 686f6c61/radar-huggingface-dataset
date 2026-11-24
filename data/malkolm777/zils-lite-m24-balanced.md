# malkolm777/zils-lite-m24-balanced

## Resumen

zils-lite-m24-balanced es un modelo de decisión (decision model) obtenido por ajuste fino supervisado del modelo base joamCriff123/zils-lite-l1121a, identificado por el autor como el único miembro del "soup" d3-lite. Lo desarrolla el usuario de Hugging Face malkolm777 y se publica bajo licencia Apache 2.0. Con 852.985.920 parámetros (unos 853 millones) y un repositorio de 1,7 GB en formato safetensors, se posiciona como un modelo ligero orientado a tareas de puntuación o clasificación de respuestas dentro de un pipeline de evaluación, no como un modelo generativo de propósito general.

El modelo se entrenó sobre 1480 preguntas etiquetadas del conjunto P3, con objetivos "gold" de tipo ordinal: se asignó un peso de 0,75 a los errores del modelo de partida y de 0,55 a las respuestas correctas, dejando el resto de la masa de probabilidad al modelo inicial, y un 0,10 a las puntuaciones adyacentes en la escala ordinal. El ajuste se realizó mediante una única pasada LoRA de rango 64 sobre las proyecciones gate, up y down de las capas feed-forward, con semilla 4222 y tasa de aprendizaje 4e-05, y el adaptador se fusionó posteriormente en los pesos de partida.

Su relevancia actual es acotada pero específica: ejemplifica el patrón de "modelos de decisión" destilados o calibrados a partir de un modelo base para sustituir a un juez LLM más costoso en tareas de evaluación, filtrado o ranking. La información pública disponible es muy escasa (sin pipeline declarado, sin idiomas especificados y sin benchmarks), por lo que cualquier evaluación de producción debe hacerse empíricamente sobre el propio caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en Hugging Face, con `custom_code`); detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,7 GB) |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `qwen3_5` e incluye código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True` o la instalación del módulo incluido en el repositorio. No se documentan el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa. El tamaño de 853 millones de parámetros y el repositorio de 1,7 GB son coherentes con pesos en precisión de 16 bits.

El entrenamiento consistió en un ajuste fino supervisado sobre 1480 preguntas etiquetadas del conjunto P3, partiendo de la revisión 523d974dc031ecaf4efc3b7772b4611938f5e455 de joamCriff123/zils-lite-l1121a (22 de noviembre de 2026). Los objetivos de entrenamiento son distribuciones ordinales: peso 0,75 sobre los errores del modelo de partida, 0,55 sobre las respuestas correctas, 0,10 sobre puntuaciones adyacentes y el resto de la masa asignada a la predicción del modelo inicial. Se aplicó una única pasada LoRA de rango 64 sobre las proyecciones gate, up y down de las capas feed-forward, con semilla 4222 y learning rate 4e-05, y el adaptador se fusionó en los pesos base. El autor publica el SHA-256 del JSONL de entrenamiento (31f12b18b4b318e403edb871ed7599b577813fbba187b33e6abbc8db75498d59) como traza de reproducibilidad. No se documentan fases de RLHF o DPO, ni el volumen total de tokens vistos.

## Capacidades

- Puntuación y decisión sobre respuestas: el modelo está diseñado para emitir una puntuación o veredicto ordinal sobre una respuesta candidata, calibrada con los pesos descritos en la model card.
- Evaluación automática de calidad: uso previsto como juez ligero en pipelines de evaluación de respuestas generadas por otros modelos.
- Clasificación ordinal: la formulación de objetivos con masa en puntuaciones adyacentes sugiere salida en una escala discreta ordenada.
- Generación de texto libre: no documentada; el autor lo etiqueta como `decision-model`, no como modelo instructivo o conversacional.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Filtrado de respuestas en pipelines de generación: puntuar las salidas de un LLM generativo y descartar las que caigan por debajo de un umbral, usando el modelo como clasificador barato de 853 M de parámetros en lugar de un juez de mayor tamaño.
- Evaluación continua de modelos en CI: integrar el modelo en un job que puntúe respuestas de regresión frente a un conjunto dorado y bloquee despliegues cuando la puntuación media caiga, aprovechando su tamaño reducido para ejecutarse en CPU o en una GPU modesta.
- Ranking de candidatos en búsqueda o RAG: ordenar varias respuestas o pasajes candidatos según la puntuación ordinal del modelo antes de presentarlos al usuario.
- Anotación asistida de datos: preetiquetar pares pregunta-respuesta para revisión humana, reduciendo el coste de anotación en conjuntos de evaluación internos.
- Detección de errores factuales o de formato: al estar calibrado con peso 0,75 sobre los errores del modelo de partida, puede emplearse como señal de alarma en la validación de salidas estructuradas.
- Enrutado de consultas: usar la puntuación como señal para decidir si una consulta debe escalarse a un modelo mayor o resolverse con un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en FP16/BF16; en torno a 0,9 GB en cuantización de 8 bits y 0,5 GB en 4 bits (estimación teórica a partir del número de parámetros, no verificada con este modelo).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. También es viable en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requisito por el `custom_code`); vLLM, llama.cpp, Ollama y TGI solo si se generan conversiones compatibles, no publicadas por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-m24-balanced | 853 M | no disponible | Apache 2.0 | Hugging Face, safetensors | Modelo de decisión, requiere código personalizado |
| joamCriff123/zils-lite-l1121a (base) | no disponible | no disponible | no disponible | Hugging Face | Modelo de partida del ajuste |
| Qwen3-0.6B | 0,6 B | 32 768 tokens (version base Qwen3) | Apache 2.0 | Hugging Face, GGUF, vLLM | Modelo generativo de propósito general, no especializado en decisión |
| Qwen3-1.7B | 1,7 B | 32 768 tokens (version base Qwen3) | Apache 2.0 | Hugging Face, GGUF, vLLM | Alternativa generativa de tamaño cercano |

La comparación con modelos de la familia Qwen3 es solo orientativa por tamaño y licencia: no hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el ajuste sobre 1480 preguntas de un único conjunto (P3) puede heredar los sesgos de anotación de ese corpus.
- Riesgo de alucinación: el modelo está formulado como decisor ordinal, no como generador; usarlo para generar texto libre queda fuera de su diseño y no está validado.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni idiomas soportados, lo que impide garantizar su comportamiento fuera del dominio de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo incorpora `custom_code` y depende de un modelo base de terceros; deben revisarse el LICENSE y el NOTICE del repositorio para las atribuciones upstream.
- Caveat de producción: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el módulo antes de desplegarlo.
- Escasa trazabilidad: sin benchmarks, sin pipeline declarado, sin descargas ni likes, y con un conjunto de entrenamiento pequeño; la validación debe hacerse sobre datos propios antes de cualquier uso real.
- Sobreajuste probable: una sola pasada LoRA de rango 64 sobre 1480 ejemplos puede producir un ajuste muy pegado a la distribución de P3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-m24-balanced
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1121a
