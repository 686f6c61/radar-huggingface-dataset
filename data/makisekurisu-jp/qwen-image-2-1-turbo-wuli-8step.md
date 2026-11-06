# makisekurisu-jp/Qwen-Image-2.1-Turbo-Wuli-8step

## Resumen

Qwen-Image-2.1-Turbo-Wuli-8step es un fichero único de pesos (single-file) para ComfyUI derivado de Wuli-art/Qwen-Image-2.1-Turbo, que a su vez es una variante turbo del modelo de difusión Qwen-Image-2.1 de Alibaba Qwen. El repositorio lo publica el usuario makisekurisu-jp y su función es permitir la inferencia del modelo base en tan solo ocho pasos de muestreo, con los pesos ya empaquetados en formato safetensors bf16 de 7,3 GB listos para cargar en el nodo de ComfyUI.

El modelo es un modelo de difusión texto-a-imagen (no un modelo de lenguaje), por lo que sus capacidades se centran en la generación de imágenes a partir de prompts textuales. La variante "Turbo" aplica una destilación de pasos (step distillation) sobre el modelo original para reducir el número de evaluaciones del UNet/diT necesarias, lo que rebaja drásticamente el coste de inferencia a cambio de una ligera pérdida de fidelidad respecto al modelo completo.

Es relevante ahora porque ComfyUI se ha consolidado como el entorno de referencia para flujos de difusión modulares, y disponer de un checkpoint de 8 pasos en un solo fichero simplifica el despliegue en entornos de producción creativa y en GPUs de consumo. La información pública disponible es muy limitada: la model card solo documenta el uso con el workflow oficial de ComfyUI y los valores exactos de ManualSigmas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (texto-a-imagen); tipo exacto de backbone no disponible |
| Parametros totales | no disponible (repo de 7,3 GB en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | bf16 (fichero safetensors single-file); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (prompts multilingues segun el modelo base, sin detalle) |
| Licencia | qwen-research (license_name: qwen-research) |
| Formato de pesos | safetensors (diffusion-single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del backbone de difusión en la documentación proporcionada. El modelo deriva de Wuli-art/Qwen-Image-2.1-Turbo, que es una relación de cuantización/empaquetado sobre el modelo Qwen-Image-2.1 de Qwen. El prefijo "Turbo" indica destilación para reducir el número de pasos de muestreo, y el sufijo "8step" confirma que el checkpoint está optimizado para ocho pasos.

El autor advierte explícitamente en la model card que, debido a su implementación concreta, los LoRAs entrenados para Qwen-Image-2.1 pueden no funcionar bien con este modelo, y recomienda entrenar LoRAs específicamente para él. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF/DPO (lo cual, por otra parte, no aplica a un modelo de difusión en los mismos términos que a un LLM).

## Capacidades

- Generación de imágenes a partir de prompts textuales mediante difusión en ocho pasos.
- Compatibilidad con el workflow oficial Qwen Image 2.1 Turbo de ComfyUI.
- Control fino del sampler mediante la lista ManualSigmas documentada por el autor.
- Soporte de integración en grafos de ComfyUI (nodos de carga de checkpoint single-file).
- Posible uso de LoRAs, con la advertencia de que deben entrenarse específicamente para este modelo.
- Capacidades multilingües en prompts: no disponibles en detalle.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Generación de ilustraciones para publicaciones: el modelo produce imágenes en ocho pasos, lo que permite iterar rápidamente sobre variaciones de prompt dentro de una sesión de trabajo creativo en ComfyUI.
- Prototipado de pipelines de imagen en ComfyUI: al ser un single-file safetensors, se carga directamente en el nodo de checkpoint sin necesidad de gestionar múltiples componentes, lo que acelera la configuración de entornos de prueba.
- Creación de assets para videojuegos o interfaces: la baja latencia de un sampler de ocho pasos facilita generar lotes de variaciones de un mismo concepto con distintos seeds.
- Exploración de estilos con LoRAs: el modelo admite LoRAs entrenados específicamente, útil para adaptar el estilo visual a una marca concreta en flujos de diseño gráfico.
- Generación de imágenes de referencia para equipos de diseño: sirve como herramienta de moodboarding rápida donde el coste por imagen es bajo gracias a la reducción de pasos.
- Integración en servidores de generación por lotes: el formato single-file simplifica el despliegue en workers que cargan el checkpoint una vez y atienden múltiples peticiones.
- Investigación sobre destilación de pasos: útil como referencia para estudiar cómo se comporta un modelo turbo de ocho pasos frente a su versión completa en tareas de fidelidad prompt-imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 7,3 GB en bf16; se requiere al menos esa cantidad más el overhead del runtime de ComfyUI, por lo que un mínimo práctico de 10-12 GB de VRAM es razonable para inferencia en bf16 (estimación, no dato oficial).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño de checkpoint, GPUs con 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100, H100) son candidatas plausibles.
- Cabe en GPU de consumo: probablemente en GPUs con 12 GB o más en bf16; no confirmado oficialmente.
- Opciones de despliegue: ComfyUI con el workflow oficial Qwen Image 2.1 Turbo; otros runtimes (vLLM, llama.cpp, Ollama, TGI) no están soportados por tratarse de un modelo de difusión.
- Latencia y throughput: no disponibles; la reducción a ocho pasos implica una fracción del coste computacional de un sampler completo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-Wuli-8step | no disponible (7,3 GB bf16) | no aplica | 8 | qwen-research | safetensors single-file |
| Wuli-art/Qwen-Image-2.1-Turbo (base) | no disponible | no aplica | turbo (multi-paso) | qwen-research | safetensors |
| Qwen/Qwen-Image-2.1 (original) | no disponible | no aplica | sampler completo | qwen-research | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte de que los LoRAs entrenados para Qwen-Image-2.1 pueden no funcionar correctamente con este modelo; es necesario entrenar LoRAs específicos.
- El uso requiere el workflow oficial de ComfyUI y unos valores de ManualSigmas concretos; usar otros samplers o sigmas puede degradar la calidad de forma impredecible.
- La licencia qwen-research impone restricciones de uso; debe revisarse el enlace de licencia del modelo base antes de cualquier uso comercial.
- Al ser un modelo de difusión, puede reproducir sesgos presentes en sus datos de entrenamiento (no documentados en la información disponible) y no garantiza fidelidad exacta al prompt.
- Riesgo de artefactos propios de la destilación a ocho pasos: menor fidelidad y detalle que el modelo completo en prompts complejos.
- No hay información sobre idiomas soportados en los prompts ni sobre límites de longitud de estos.
- El repositorio tiene muy pocas descargas (91) y ningún like, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/makisekurisu-jp/Qwen-Image-2.1-Turbo-Wuli-8step
- Modelo base: https://huggingface.co/Wuli-art/Qwen-Image-2.1-Turbo
- Pesos bf16 de referencia: https://huggingface.co/Wuli-art/Qwen-Image-2.1-Turbo/tree/main/8step-bf16
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
