# deepdoggo/ComfyUI-780M

## Resumen

ComfyUI-780M es un conjunto de pesos de modelos de difusión diseñado para ejecutarse en ComfyUI, optimizado específicamente para la GPU integrada AMD Radeon 780M Phoenix. Desarrollado por deepdoggo, su objetivo es ofrecer una alternativa rápida a las cuantizaciones GGUF en entornos Linux con ROCm, aprovechando el soporte oficial de gfx1103 a partir de la versión 7.14. El modelo está pensado para generación de imágenes en sistemas con 24 GB de memoria GTT compartida.

No se trata de un modelo de lenguaje, sino de un modelo de difusión para generación de imágenes. La información pública disponible es muy limitada: no se especifica la arquitectura subyacente, el número de parámetros, los datos de entrenamiento ni la licencia. El autor únicamente indica que los pesos funcionan bien en su configuración y que superan en velocidad a cualquier cuantización GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (tipo no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de difusión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a la licencia del creador original) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura subyacente del modelo (por ejemplo, si se trata de un UNet, un DiT u otra variante). Tampoco se han publicado detalles sobre el proceso de entrenamiento, la composición del dataset ni el número de tokens o pasos. El autor únicamente menciona que los pesos están optimizados para ROCm y para la iGPU AMD Radeon 780M, y que requieren al menos la versión 7.14 de ROCm para aprovechar el soporte oficial de gfx1103.

## Capacidades

- Generación de imágenes mediante ComfyUI, con soporte específico para la GPU integrada AMD Radeon 780M.
- Optimizado para ejecución en Linux con ROCm >= 7.14.
- Según el autor, supera en velocidad a las cuantizaciones GGUF en su configuración de 24 GB de GTT.
- No soporta tool calling, agentes, razonamiento, código ni capacidades multimodales de lenguaje, al tratarse de un modelo de difusión.
- Integrable en flujos de trabajo de ComfyUI mediante nodos de carga de checkpoints.

## Casos de uso

- Generación de imágenes en sistemas sin GPU dedicada: el modelo permite ejecutar difusión en la iGPU 780M, por lo que es adecuado para portátiles o mini PCs con APU Phoenix.
- Prototipado rápido en flujos de trabajo ComfyUI: al estar optimizado para esta interfaz, se integra directamente en pipelines de nodos para iterar sobre prompts y estilos.
- Entornos Linux con ROCm: el autor indica que funciona con ROCm >= 7.14, por lo que es útil para desarrolladores que quieran aprovechar el soporte oficial de gfx1103.
- Stack de IA local en Docker: puede combinarse con Ollama y Open WebUI en un stack Docker como el propuesto en el repositorio 780m-ai-stack, para tener generación de imágenes y LLM en el mismo equipo.
- Educación y experimentación: permite estudiar modelos de difusión en hardware de bajo consumo, sin necesidad de GPUs dedicadas caras.
- Generación de contenido artístico en local: para usuarios que prefieren ejecutar modelos de IA sin conexión, con la ventaja de velocidad frente a GGUF según el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor afirma que el modelo supera en velocidad a cualquier cuantización GGUF, pero no se ofrecen cifras, comparativas con otros modelos de difusión ni medidas de latencia o throughput. No se pueden presentar datos numéricos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor menciona 24 GB de GTT en Linux, lo que sugiere que la memoria compartida del sistema es suficiente para ejecutar el modelo.
- GPU recomendada: AMD Radeon 780M (iGPU Phoenix, arquitectura gfx1103). No se recomiendan otras GPUs, ya que el modelo está optimizado específicamente para esta.
- Si cabe en consumer GPU: sí, en sistemas con la iGPU 780M y suficiente RAM del sistema (24 GB GTT).
- Opciones de despliegue: ComfyUI, ROCm, Docker (con el stack 780m-ai-stack).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El autor afirma que el modelo supera a las cuantizaciones GGUF en velocidad, pero no se ofrecen cifras ni comparativas con otros modelos de difusión. Por tanto, no se puede elaborar una comparativa fiable.

## Limitaciones y advertencias

- Licencia desconocida: el autor remite a la licencia del creador original del modelo base, que no se especifica. Esto puede suponer restricciones para uso comercial o redistribución.
- Dependencia de ROCm >= 7.14 y del soporte oficial de gfx1103, que puede no estar disponible en todas las distribuciones Linux ni en versiones anteriores.
- Requiere 24 GB de GTT, lo que implica una gran cantidad de RAM del sistema y puede limitar su uso en equipos con menos memoria.
- No se han publicado benchmarks ni detalles de entrenamiento, por lo que no se puede evaluar su rendimiento comparativo ni su calidad de generación.
- Posibles problemas de compatibilidad con Windows o con drivers que no sean ROCm, ya que el autor solo menciona Linux.
- La información disponible no incluye el formato de los pesos, lo que puede dificultar su carga en herramientas distintas de ComfyUI.

## Enlaces

- HuggingFace: https://huggingface.co/deepdoggo/ComfyUI-780M
- GitHub 780m-ai-stack: https://github.com/jaguardev/780m-ai-stack
- Documentación de ComfyUI: https://utopia.mintlify.app/
