# mimiminsoo/spam_diffusion_stage_scan_v1

## Resumen

El modelo `mimiminsoo/spam_diffusion_stage_scan_v1` es una política de difusión (Diffusion Policy) para control visuomotor robótico, desarrollada por el usuario mimiminsoo y entrenada con el framework LeRobot de Hugging Face. Se basa en el enfoque descrito en el paper "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion" (arXiv:2303.04137), que trata el control robótico como un proceso generativo de difusión, produciendo trayectorias de acción suaves y multi-paso, especialmente adecuadas para tareas de manipulación con contacto rico.

El modelo cuenta con 308.316.824 parámetros (pesos en formato safetensors, 1.2 GB) y ha sido entrenado sobre el dataset `mimiminsoo/piper_bottle_multi_0823_stage_scan`, orientado a tareas de escaneo y manipulación de botellas. Su licencia Apache 2.0 permite uso comercial y modificación. Aunque no se especifican detalles sobre la longitud de contexto ni idiomas (al ser un modelo de visión-acción, no de lenguaje), su relevancia radica en ofrecer una solución práctica y reproducible para el aprendizaje por imitación en robótica, con un pipeline de entrenamiento e inferencia bien documentado a través de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor) |
| Parametros totales | 308.316.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision-accion) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que formula el control visuomotor como un proceso de denoising difusivo. En lugar de predecir directamente una acción, el modelo genera secuencias de acciones completas mediante un proceso iterativo de eliminación de ruido, lo que produce trayectorias suaves y coherentes, incluso en tareas que requieren contacto físico y manipulación precisa. Esta aproximación ha demostrado ser robusta frente a la acumulación de errores en entornos de contacto rico.

El entrenamiento se realizó con LeRobot, la librería de Hugging Face para robótica, sobre el dataset `mimiminsoo/piper_bottle_multi_0823_stage_scan`. No se dispone de información detallada sobre el número de tokens, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El modelo se publica como un checkpoint entrenado, listo para ser evaluado o utilizado en inferencia mediante los comandos estándar de LeRobot.

## Capacidades

- Generación de trayectorias de acción multi-paso para control robótico, con suavidad y coherencia temporal.
- Adecuado para tareas de manipulación con contacto rico, como agarre, escaneo y manipulación de objetos.
- Integración nativa con el ecosistema LeRobot: permite entrenamiento, evaluación e inferencia mediante comandos CLI (`lerobot-train`, `lerobot-record`).
- Soporte para robots tipo SO-100 (follower) y otros compatibles con LeRobot.
- No incluye capacidades de lenguaje natural, tool calling, agentes ni razonamiento simbólico; es un modelo puramente visuomotor.

## Casos de uso

- Manipulación de botellas en líneas de producción: el modelo puede generar trayectorias de escaneo y agarre de botellas, aprovechando su entrenamiento en el dataset específico de botellas multi-escenario.
- Tareas de inspección visual con manipulación: al combinar visión y acción, puede posicionar un objeto para escaneo o verificación de calidad en entornos industriales.
- Aprendizaje por imitación en robótica asistida: investigadores pueden usar el modelo como punto de partida para fine-tuning en nuevas tareas de manipulación, gracias a su formato estándar de LeRobot.
- Evaluación de políticas en robots reales: mediante `lerobot-record` con un robot SO-100, se puede desplegar el modelo en episodios de evaluación para medir su rendimiento en el mundo real.
- Prototipado rápido de controladores robóticos: su arquitectura de difusión permite generar acciones suaves sin necesidad de post-procesamiento, ideal para pruebas de concepto en laboratorios.
- Investigación en diffusion policies: sirve como referencia reproducible para estudiar el efecto del dataset y la arquitectura en tareas de contacto rico, al estar disponible públicamente con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: basándose en el tamaño de pesos (1.2 GB en FP32), se estima que el modelo requiere aproximadamente 1.2 GB de VRAM en FP32 y unos 0.6 GB en FP16. Con overhead de runtime, se recomienda al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100, etc.).
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas de consumo, incluso en tarjetas de gama baja con 4 GB.
- Opciones de despliegue: LeRobot (CLI y Python API), PyTorch, y potencialmente exportación a ONNX o TensorRT para optimización, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles; dependen del hardware y del número de pasos de denoising configurados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (diffusion policies para robótica) dentro de la información proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo ha sido entrenado en un dataset específico (`piper_bottle_multi_0823_stage_scan`), por lo que su generalización a otras tareas u objetos puede ser limitada.
- No se han documentado sesgos específicos, pero al ser un modelo de visión-acción, su comportamiento depende en gran medida de la distribución de los datos de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir trayectorias de acción no válidas si se enfrenta a situaciones fuera de distribución.
- Limitaciones de contexto o idioma: no aplica, al no ser un modelo de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright.
- Caveat para producción: es un modelo de investigación, sin validación en entornos industriales reales; se recomienda realizar pruebas exhaustivas de seguridad antes de cualquier despliegue en robots físicos.

## Enlaces

- HuggingFace: https://huggingface.co/mimiminsoo/spam_diffusion_stage_scan_v1
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137 (también en arXiv: https://arxiv.org/abs/2303.04137)
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- LeRobot Docs: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/mimiminsoo
