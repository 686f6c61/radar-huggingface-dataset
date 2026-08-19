# mojoj1853/qwen-image-edit-plus-nsfw-lora

## Resumen

MCNL v1 (Multi Concept NSFW LoRA) es un adaptador LoRA desarrollado por el usuario mojoj1853 para el modelo de edición de imágenes Qwen-Image-Edit-2511 de Qwen. Su propósito es habilitar la generación y edición de contenido NSFW (no apto para todos los públicos) sobre el pipeline de difusión base, ampliando las capacidades del modelo hacia un dominio de contenido explícito. Se distribuye como un archivo safetensors de aproximadamente 563 MB y se integra mediante la librería diffusers, cargándose como un adaptador adicional sobre el modelo base.

La relevancia de este adaptador radica en que permite personalizar un modelo de edición de imágenes de última generación con conceptos específicos de contenido adulto, mediante palabras gatillo definidas por el autor. Aunque el modelo base ya ofrece capacidades de edición por instrucciones, este LoRA añade un control fino sobre escenarios y elementos explícitos. No se proporcionan detalles sobre el entrenamiento, los datos utilizados ni métricas de rendimiento, por lo que su evaluación debe basarse en pruebas prácticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre QwenImageTransformer2DModel (MMDiT) del modelo Qwen-Image-Edit-2511 |
| Parámetros totales | No disponible (el adaptador pesa ~563 MB en safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponibles |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura MMDiT (Multimodal Diffusion Transformer) del modelo Qwen-Image-Edit-2511, que combina transformadores con mecanismos de atención para procesar simultáneamente texto e imagen. El LoRA se aplica sobre las capas del transformador, permitiendo ajustar el comportamiento del modelo sin modificar los pesos originales. No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. El adaptador se carga mediante `load_lora_weights` en el pipeline `QwenImageEditPlusPipeline` de diffusers, y se activa con `set_adapters`.

## Capacidades

- Edición de imágenes mediante instrucciones en lenguaje natural, heredada del modelo base Qwen-Image-Edit-2511.
- Generación y edición de contenido NSFW con control fino mediante palabras gatillo específicas (por ejemplo, `nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `blowjob`, `cum_on_face`, `creamp1e`, `l1ck`).
- Soporte de múltiples conceptos en un solo adaptador (multi-concept), según la model card.
- Integración directa con el espacio ScottzillaSystems Image Editor, que permite seleccionar el adaptador desde un menú desplegable.
- Uso programático con la librería diffusers, compatible con PyTorch y ejecución en GPU.
- Compatibilidad con el pipeline de image-to-image, aceptando una imagen de entrada y un prompt de edición.

## Casos de uso

- Creación de ilustraciones eróticas personalizadas: el adaptador permite generar imágenes explícitas a partir de bocetos o fotografías base, ajustando elementos concretos mediante las palabras gatillo.
- Edición de contenido para plataformas de arte adulto: artistas pueden modificar composiciones existentes añadiendo o cambiando detalles NSFW de forma controlada.
- Investigación en generación de imágenes con contenido explícito: el adaptador sirve como herramienta para estudiar sesgos, seguridad y moderación en modelos de difusión.
- Desarrollo de herramientas de edición de imágenes con control fino: integrable en aplicaciones que requieran manipulación selectiva de regiones o atributos específicos.
- Pruebas de moderación y filtrado de contenido: permite generar material explícito en entornos controlados para evaluar clasificadores de contenido.
- Personalización de contenido para audiencias adultas en entornos con verificación de edad: el adaptador puede emplearse en plataformas que cumplan con restricciones legales y de uso responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni de GPU en la documentación del adaptador.
- Dado que es un LoRA, requiere ejecutar el modelo base Qwen-Image-Edit-2511, cuyos requisitos de hardware no se especifican en la información disponible.
- El adaptador en sí ocupa ~563 MB, pero la inferencia depende del modelo base completo, que probablemente necesite una GPU con al menos 16-24 GB de VRAM para funcionar con precisión bfloat16 (estimación orientativa, no confirmada).
- Opciones de despliegue: mediante diffusers en Python, o a través del espacio ScottzillaSystems Image Editor en Hugging Face Spaces.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW: el adaptador está diseñado para generar material explícito, no apto para menores ni para entornos sin control de acceso.
- Licencia OpenRAIL++: impone restricciones de uso responsable, incluyendo la prohibición de usos ilegales o que inciten al odio.
- Sin datos de rendimiento ni benchmarks: no es posible evaluar objetivamente su calidad frente a otros adaptadores.
- Dependencia del modelo base: cualquier limitación de Qwen-Image-Edit-2511 (sesgos, alucinaciones, calidad de edición) se hereda.
- Riesgo de mal uso: la generación de contenido explícito puede vulnerar políticas de plataformas o leyes locales si no se gestiona adecuadamente.
- Sin información sobre el proceso de entrenamiento: no se conocen los datos utilizados, lo que dificulta evaluar posibles sesgos o problemas de generalización.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/mojoj1853/qwen-image-edit-plus-nsfw-lora)
- [Modelo base Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)
- [Espacio ScottzillaSystems Image Editor](https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast)
- [Versión MCNL v2](https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2)
