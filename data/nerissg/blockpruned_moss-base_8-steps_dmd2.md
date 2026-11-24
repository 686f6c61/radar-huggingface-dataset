# NerissG/BlockPruned_MOSS-base_8-steps_dmd2

## Resumen

BlockPruned_MOSS-base_8-steps_dmd2 es una variante podada por bloques del LoRA de destilación DMD2 (turbo) que el usuario lodestones publicó como Kromoss para el modelo base MOSS-Image. El autor de esta ficha, NerissG, no entrena un modelo nuevo: parte del LoRA de destilación y desactiva selectivamente un conjunto de módulos (proyecciones `v`, `o` y `ffn_up_gate` en las capas 28 a 40) para mitigar un sesgo de color hacia el magenta frío, un aumento de brillo y una pérdida de textura que observó en ciertos prompts respecto al modelo base.

El problema que aborda es, por tanto, de control de calidad en la generación de imágenes con un modelo destilado para pocos pasos: el LoRA turbo acelera la inferencia pero introduce derivas perceptuales. La poda se eligió mediante una ablación automatizada de aproximadamente 100 imágenes por configuración, comparando métricas de composición, color, textura y similitud perceptual contra el modelo base.

Es relevante ahora porque documenta una metodología reproducible de poda de módulos en difusión (medición objetiva con Optuna y métricas tipo LPIPS, DINOv2 y Gram matrices) y porque el resultado es un compromiso explícito: reduce el sesgo cromático a costa de deshacer parte de la destilación, funcionando mejor a 16 pasos y aumentando los errores de extremidades y texto en más semillas. El repositorio ocupa 1,2 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (MOSS-Image) con LoRA de destilación DMD2 podado por bloques; detalles de arquitectura interna no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de generación de imágenes; el texto de los prompts determina el idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,2 GB; el README describe módulos por nombre, sin especificar formato) |

## Arquitectura y entrenamiento

El modelo es un derivado de MOSS-Image base al que se le aplica el LoRA de destilación DMD2 de lodestones (Kromoss), concebido para reducir el número de pasos de muestreo. Sobre esa combinación, NerissG aplica una poda por bloques: los módulos listados en el README (`diffusion_model.layers.28` a `layers.40`, con proyecciones `v`, `o` y `ffn_up_gate`) se desactivan fijando su valor alpha a 0. No hay entrenamiento adicional ni fine-tuning: la intervención es puramente de enmascaramiento de módulos del LoRA.

La selección de qué módulos podar se hizo con una ablación automatizada. Se generaron aproximadamente 100 imágenes con el modelo base sobre combinaciones de semilla y prompt con euler / cfg 3 / 30 pasos, y se compararon con muestras generadas con euler / cfg 1 / 8 pasos. La comparación usó métricas de composición (layout de brillo 32×32, similitud de parches DINOv2), color (distancia de distribución en espacio Lab, brillo, contraste, saturación y dominante de color), textura (matrices Gram de VGG, espectro de frecuencias) y perceptuales (LPIPS, similitud global DINOv2). Cada configuración se puntuó de forma relativa al LoRA completo (1 = misma deriva que el LoRA, 0 = idéntico al base), y la búsqueda de combinaciones la controló Opus sobre Optuna. La configuración final es la que el autor consideró preferible entre las mejores puntuadas.

## Capacidades

- Generación de imágenes texto-a-imagen a partir del modelo base MOSS-Image y del LoRA destilado DMD2.
- Muestreo acelerado en pocos pasos (el LoRA original está pensado para 8 pasos; esta variante rinde mejor a 16 pasos).
- Control fino de la deriva estilística respecto al base: menor dominante magenta, menor sobrebrillo y mayor fidelidad de textura que el LoRA sin podar.
- Compatibilidad con el ecosistema del modelo base (los módulos podados se referencian con nombres del `diffusion_model`, lo que sugiere uso con el pipeline de MOSS-Image).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo generativo de imágenes, no un LLM.
- Capacidades multilingües en prompts: no documentadas.

## Casos de uso

- Generación de ilustración y arte conceptual con pocos pasos: usar el modelo con 16 pasos y cfg bajo para obtener imágenes rápidas con menor desviación cromática que el LoRA turbo original, adecuado para iteración de ideas en estudio.
- Prototipado de pipelines de difusión destilada: sirve como referencia de cómo la poda selectiva de módulos afecta a métricas objetivas de color y textura, útil para quien investigue destilación de modelos de imagen.
- Ajuste de coherencia de marca: al reducir el sesgo hacia magenta y el sobrebrillo, puede emplearse en flujos donde se requiere que las imágenes generadas mantengan una paleta cercana a la del modelo base.
- Evaluación comparativa de LoRAs: el README documenta una metodología (DINOv2, LPIPS, Gram matrices, Optuna) que se puede replicar para auditar otros LoRAs turbo antes de integrarlos en producción.
- Generación de bocetos rápidos en local: con un repo de 1,2 GB y un modelo base de imagen, es viable en equipos con GPU de consumo, siempre que se acepten los errores de extremidades y texto documentados.
- Investigación sobre compromisos destilación-calidad: caso de estudio de cómo desactivar módulos concretos recupera fidelidad al base a costa de pasos adicionales y mayor tasa de fallos anatómicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README describe métricas internas de la ablación (LPIPS, DINOv2, Gram matrices, distancia Lab, layout de brillo 32×32) pero no proporciona valores numéricos finales ni comparaciones tabuladas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 1,2 GB, lo que sugiere que el artefacto distribuido es el LoRA podado y no el modelo base completo; la VRAM real dependerá de MOSS-Image base.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de difusión de imagen, se requiere una GPU con suficiente VRAM para el modelo base; el README no especifica umbrales.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del artefacto (1,2 GB) es compatible con equipos de consumo, pero el modelo base subyacente puede no serlo.
- Opciones de despliegue: no disponibles. El README no menciona vLLM, llama.cpp, Ollama, TGI ni ComfyUI; los nombres de módulos (`diffusion_model.layers...`) apuntan a un pipeline de difusión tipo Diffusers, sin confirmación.
- Latencia y throughput: no disponibles. El autor indica que el modelo "funciona mejor a 16 pasos" frente a los 8 del LoRA original, lo que implica el doble de pasos de muestreo para obtener el resultado preferido.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos recomendados | Licencia | Estado |
|---|---|---|---|---|
| BlockPruned_MOSS-base_8-steps_dmd2 | LoRA DMD2 podado sobre MOSS-Image base | 16 (mejor resultado) | Apache 2.0 | Publicado, 0 descargas |
| lodestones/Kromoss (LoRA DMD2 turbo original) | LoRA de destilación DMD2 sobre MOSS-Image base | 8 | no disponible | Modelo base del que deriva |
| MOSS-Image base | Modelo de difusión de imagen | 30 (euler / cfg 3 en la ablación) | no disponible | Modelo de referencia |

No se dispone de datos de benchmarks ni de otros LoRAs comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgo cromático residual: el autor reconoce que la poda "no es una corrección directa" y que reduce el problema del magenta frío y el sobrebrillo, pero no lo elimina por completo.
- Pérdida de destilación: al desactivar módulos del LoRA se pierde parte del efecto de destilación; el modelo rinde mejor a 16 pasos que a los 8 pasos para los que fue concebido el LoRA original.
- Errores anatómicos y de texto: el README advierte explícitamente de más errores en extremidades y en texto en un mayor número de semillas respecto al LoRA sin podar.
- Menor textura: se documenta una pequeña reducción de textura frente al modelo base, aunque menor que la del LoRA completo.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente o no solicitado; no hay evaluación de seguridad publicada.
- Idiomas: no se documenta soporte multilingüe en prompts.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (MOSS-Image) y el LoRA de origen (Kromoss) tienen sus propias condiciones, no detalladas en la información disponible; conviene verificarlas antes de producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación externa ni pipeline declarado en Hugging Face.
- Reproducibilidad: la ablación se apoyó en Opus y Optuna, pero no se publican scripts ni pesos de las métricas, lo que dificulta replicar la selección de módulos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NerissG/BlockPruned_MOSS-base_8-steps_dmd2
- LoRA de origen (Kromoss): https://huggingface.co/lodestones/Kromoss
