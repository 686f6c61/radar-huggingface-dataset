# escapebirdy/dvrk_rope_cam012_zero_state_baseframe_policy

## Resumen

`escapebirdy/dvrk_rope_cam012_zero_state_baseframe_policy` es una política de control visuomotor entrenada con LeRobot y publicada en Hugging Face Hub. Implementa Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una acción única, el modelo genera trayectorias de acción multim paso suaves, lo que resulta especialmente adecuado para manipulación con contacto rico (contact-rich manipulation). El autor es el usuario `escapebirdy` y el modelo está asociado al dataset `escapebirdy/dvrk_rope_cam012_baseframe`, lo que sugiere un entrenamiento orientado a una tarea concreta de manipulación de cuerda (rope) con el sistema quirúrgico da Vinci Research Kit (dVRK) y cámaras `cam012`.

El modelo cuenta con aproximadamente 426,6 millones de parámetros en formato safetensors y un repositorio de 1,7 GB. No es un modelo de lenguaje: su pipeline es `robotics` y su salida son acciones de robot, no texto. Por tanto, no dispone de ventana de contexto lingüístico, capacidades multilingües ni benchmarks de NLP. Su relevancia radica en ser un ejemplo reproducible de política de imitación entrenada con LeRobot para una tarea de manipulación específica, publicada bajo licencia Apache 2.0.

La información pública disponible es escasa: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks ni métricas de éxito publicadas en la model card. Esta ficha refleja únicamente lo que consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), entrenado con LeRobot |
| Parametros totales | 426.609.994 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | escapebirdy/dvrk_rope_cam012_baseframe |
| Tamano del repositorio | 1,7 GB |
| Fecha de creacion | 2026-11-27 |
| Fecha de actualizacion | 2026-11-27 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Diffusion Policy (paper arXiv:2303.04137), que formula el control visuomotor como un proceso de difusión generativo. En lugar de mapear observaciones a una acción determinista, el modelo aprende a generar trayectorias de acción multim paso mediante un proceso de denoising iterativo, lo que produce movimientos suaves y coherentes temporalmente, ventajoso en tareas de manipulación con contacto. El entrenamiento se realizó con la librería LeRobot de Hugging Face, según indica la model card, que incluye instrucciones genéricas de entrenamiento e inferencia con `lerobot-train` y `lerobot-record`.

No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras. El nombre del modelo y del dataset (`dvrk_rope_cam012_baseframe`, `zero_state_baseframe`) apunta a un entrenamiento sobre observaciones de cámaras (cam012) del sistema dVRK para una tarea de manipulación de cuerda, con una configuración de estado inicial "zero state" y "baseframe". No se detalla la innovación técnica concreta más allá de la propia Diffusion Policy.

## Capacidades

- Generación de trayectorias de acción multim paso para control visuomotor de robots.
- Manipulación con contacto rico (contact-rich manipulation), según la descripción de Diffusion Policy en la model card.
- Aprendizaje por imitación a partir de un dataset de demostraciones (`escapebirdy/dvrk_rope_cam012_baseframe`).
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) e inferencia/evaluación (`lerobot-record`).
- Compatible con robots tipo `so100_follower` según el ejemplo de la model card (aunque el dataset sugiere dVRK; no se confirma la plataforma final).
- No dispone de tool calling, function calling, agentes, razonamiento multi-step lingüístico ni capacidades multilingües.
- No dispone de visión como modelo multimodal de propósito general; procesa observaciones visuales como entrada para la política, según el pipeline robotics.

## Casos de uso

- Manipulación de cuerda con dVRK: el modelo se entrenó sobre el dataset `dvrk_rope_cam012_baseframe`, por lo que su uso previsto es reproducir tareas de manipulación de cuerda con el sistema da Vinci Research Kit y las cámaras cam012. Es adecuado por su arquitectura de difusión, que genera trayectorias suaves en tareas con contacto.
- Investigación en imitación robótica: sirve como punto de partida reproducible para experimentos de Diffusion Policy con LeRobot, permitiendo comparar configuraciones de estado inicial ("zero state") y marcos de referencia ("baseframe").
- Evaluación de políticas con `lerobot-record`: se puede desplegar en un robot `so100_follower` (según el ejemplo de la model card) para grabar episodios de evaluación y medir el éxito de la política.
- Reentrenamiento con datos propios: al estar bajo Apache 2.0 y en formato safetensors con LeRobot, se puede afinar con un dataset propio siguiendo `lerobot-train` para adaptar la política a otra tarea de manipulación.
- Benchmarking de políticas de difusión: útil como referencia en estudios comparativos de políticas de imitación para manipulación con contacto.
- Prototipado en laboratorio de cirugía robótica: permite probar pipelines de percepción-acción con dVRK antes de invertir en entrenamientos a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 426,6 M de parámetros en safetensors (1,7 GB de repositorio), la huella en memoria es moderada, pero no se confirma el requisito exacto ni el soporte de cuantización.
- GPU recomendadas: no disponible. La model card usa `--policy.device=cuda` en el ejemplo de entrenamiento, lo que indica soporte para GPU NVIDIA, pero no especifica modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de parámetros es plausible en GPUs consumer con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegiegue: LeRobot (`lerobot-record` con `--policy.path`), según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia conceptual, Diffusion Policy (arXiv:2303.04137) es la base arquitectónica, pero no se aportan datos de otras políticas LeRobot para comparar parámetros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| escapebirdy/dvrk_rope_cam012_zero_state_baseframe_policy | 426.609.994 | no aplica | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en una tarea concreta (manipulación de cuerda con dVRK/cam012); no es un modelo de propósito general ni un LLM.
- Sin métricas de éxito, benchmarks ni validación publicada: cero descargas y cero likes en el momento de la consulta.
- Riesgo de sobreajuste al dataset `dvrk_rope_cam012_baseframe`; el rendimiento fuera de esa distribución no está documentado.
- No se especifican sesgos, pero al ser una política entrenada con demostraciones, puede heredar sesgos de las trayectorias humanas del dataset.
- No hay información sobre robustez ante cambios de iluminación, posición de cámara o variaciones del entorno.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni garantías.
- La model card incluye un ejemplo genérico con `--policy.type=act` y robot `so100_follower`, que puede no coincidir con la plataforma real (dVRK) del dataset; conviene verificar la configuración antes de desplegar.
- No se dispone de información sobre cuantización ni despliegue en hardware de bajo consumo.

## Enlaces

- Hugging Face: https://huggingface.co/escapebirdy/dvrk_rope_cam012_zero_state_baseframe_policy
- Dataset: https://huggingface.co/datasets/escapebirdy/dvrk_rope_cam012_baseframe
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
