# RunningHubAI/rh-h3-speed-slider-lora

## Resumen

`rh-h3-speed-slider-lora` es un adaptador LoRA publicado por RunningHubAI (autor identificado como Yugen en la plataforma RunningHub) que se presenta como un ajuste fino derivado de `minimax-h3`. El repositorio contiene un único archivo de pesos, `H3_SPEED_slider.safetensors` (142 MiB), pensado para cargarse en ComfyUI o en la plataforma RunningHub. Por su nombre y por la nomenclatura "slider", se trata de un LoRA de control de un parámetro (presumiblemente la velocidad de generación de vídeo), no de un modelo base autónomo.

La información publicada es muy escasa: no hay model card técnica, no se especifican parámetros, contexto, idiomas ni licencia concreta más allá de una remisión genérica a la licencia del proyecto original. El repositorio no registra descargas ni interacciones en el momento de la consulta y su tamaño total es de 0,1 GB, coherente con un adaptador LoRA y no con un modelo completo.

Su relevancia es, por tanto, acotada: interesa a quienes ya trabajan con el modelo base `minimax-h3` en un flujo ComfyUI y quieren un control de deslizador sobre la velocidad sin reentrenar. Para cualquier otra evaluación (razonamiento, código, texto) el artefacto no es aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `minimax-h3`; arquitectura del base no disponible |
| Parametros totales | no disponible (el archivo de pesos ocupa 142 MiB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el peso se distribuye en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`H3_SPEED_slider.safetensors`) |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura del modelo base `minimax-h3` ni sobre el procedimiento de entrenamiento del adaptador. Por la naturaleza del artefacto (LoRA de tipo "slider"), lo esperable es un ajuste de bajo rango entrenado para desplazar de forma continua un atributo concreto —la velocidad— en las generaciones del modelo base, de modo que el usuario pueda interpolar entre valores extremos mediante un único parámetro en la interfaz de ComfyUI.

No hay datos sobre el número de tokens o muestras de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas (decodificación especulativa, atención lineal, etc.). Tampoco se documenta el rango del LoRA, las capas objetivo ni los hiperparámetros de entrenamiento.

## Capacidades

- Control de un parámetro de "velocidad" sobre el modelo base `minimax-h3` mediante un deslizador en ComfyUI.
- Integración en flujos de trabajo de ComfyUI y en la plataforma RunningHub.
- Distribución como archivo safetensors cargable directamente.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el artefacto es un adaptador, no un modelo conversacional.
- Capacidades multilingües: no disponibles.
- No se documenta modo "thinking", visión, audio ni ninguna capacidad especial más allá del control del parámetro citado.

## Casos de uso

- Ajuste fino de la velocidad de generación en ComfyUI: cargar `H3_SPEED_slider.safetensors` junto al base `minimax-h3` y variar el deslizador para obtener resultados más lentos o más rápidos sin cambiar de modelo.
- Exploración de parámetros en prototipado: comparar rápidamente distintas velocidades sobre un mismo prompt para decidir la configuración final antes de producir en lote.
- Producción por lotes en RunningHub: usar el LoRA dentro de la plataforma para estandarizar la velocidad entre ejecuciones y mantener consistencia entre entregas.
- Integración vía API de RunningHub: invocar el flujo con el LoRA desde la API para automatizar la generación con un valor de velocidad fijado por configuración.
- Evaluación comparativa de adaptadores: usar este LoRA como referencia frente a la variante `rh-h3-speed-slider-1.1-lora` publicada por el mismo autor para decidir qué versión encaja mejor.
- Docencia y demostraciones: mostrar en talleres de ComfyUI cómo un LoRA de tipo deslizador modifica un atributo concreto del modelo base sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base `minimax-h3`, cuyos requisitos no se documentan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con la información publicada.
- Opciones de despliegue: ComfyUI y la plataforma RunningHub son los entornos indicados por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RunningHubAI/rh-h3-speed-slider-lora` | LoRA sobre `minimax-h3` | no disponible (142 MiB) | no disponible | no disponible | Hugging Face, RunningHub |
| `RunningHubAI/rh-h3-speed-slider-1.1-lora` | LoRA sobre `minimax-h3` (versión 1.1) | no disponible | no disponible | no disponible | Hugging Face, RunningHub |
| Modelo base `minimax-h3` | Modelo base | no disponible | no disponible | no disponible | no disponible en la información consultada |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información técnica prácticamente inexistente: no hay model card detallada, ni parámetros, ni contexto, ni datos de entrenamiento.
- Licencia no explicitada: la model card remite a la licencia del proyecto original, lo que impide confirmar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Dependencia total del modelo base `minimax-h3`: sin él, el LoRA no es funcional; cualquier limitación del base (sesgos, alucinación, idiomas) se hereda.
- Sin métricas de calidad publicadas: no hay evidencia de que el control de velocidad sea monótono, estable o consistente entre prompts.
- Repositorio sin descargas ni interacciones registradas en el momento de la consulta, lo que reduce la señal de validación por parte de la comunidad.
- El repositorio incluye enlaces promocionales y de contacto (Telegram, API de RunningHub) que no constituyen documentación técnica.
- No apto para tareas de texto, razonamiento o código: es un adaptador de control, no un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-h3-speed-slider-lora
- Versión 1.1 del mismo LoRA: https://huggingface.co/RunningHubAI/rh-h3-speed-slider-1.1-lora
- README en chino de la versión 1.1: https://huggingface.co/RunningHubAI/rh-h3-speed-slider-1.1-lora/blob/main/README_cn.md
- Commits de la versión 1.1: https://huggingface.co/RunningHubAI/rh-h3-speed-slider-1.1-lora/commits/main
- Página original del modelo en RunningHub: https://www.runninghub.ai/model/public/2094290629882081281
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/2025565893677027330
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
