# paulsizemore/lido-e14-lamp

## Resumen

El modelo `paulsizemore/lido-e14-lamp` es un adaptador LoRA (Low-Rank Adaptation) de tipo DreamBooth diseñado para el modelo de difusión de texto a imagen Krea 2, concretamente para la variante Krea 2 RAW como base de entrenamiento y Krea 2 Turbo para inferencia. Su propósito es enseñar al modelo a generar imágenes de una lámpara específica con casquillo E14, un objeto de iluminación concreto, de forma consistente y controlable mediante el token de activación `lido-e14-lamp`.

Desarrollado por el usuario paulsizemore, este LoRA se distribuye bajo licencia Apache 2.0 y está pensado para integrarse fácilmente en pipelines de Diffusers. El adaptador tiene un tamaño de 0,8 GB y se publicó en agosto de 2026. Su relevancia radica en que permite personalizar un modelo de difusión de última generación para un objeto físico concreto sin necesidad de reentrenar el modelo completo, un caso de uso habitual en diseño de producto, visualización arquitectónica y generación de contenido comercial.

El modelo no incluye información pública sobre el número de parámetros del adaptador, el tamaño del dataset de entrenamiento ni los pasos utilizados, pero la model card confirma que funciona con el pipeline `Krea2Pipeline` de Diffusers y que genera resultados en 8 pasos de inferencia con guía cero (guidance scale 0.0) sobre Krea 2 Turbo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 (modelo de difusión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | no disponible (el trigger funciona con prompts en inglés, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se carga mediante `load_lora_weights` de Diffusers; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un LoRA entrenado con la técnica DreamBooth, que consiste en ajustar un modelo de difusión preentrenado para que aprenda un concepto o sujeto específico a partir de unas pocas imágenes de referencia. En este caso, el concepto es una lámpara con casquillo E14, y el adaptador se entrena sobre el modelo base `krea/Krea-2-Raw`, una variante de Krea 2 que no ha sido destilada ni acelerada. La inferencia se realiza sobre `krea/Krea-2-Turbo`, que es la versión optimizada para generación rápida en pocos pasos.

No se dispone de información pública sobre el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje ni la composición del dataset. El adaptador modifica los pesos del modelo base mediante matrices de bajo rango, lo que permite inyectar el conocimiento del objeto sin alterar significativamente el resto de capacidades del modelo. El ejemplo de uso muestra que se puede invocar con un prompt descriptivo que incluya el token `lido-e14-lamp`, y el modelo genera imágenes coherentes del objeto en distintos entornos (apartamento cyberpunk, cabaña rústica, galería de arte).

## Capacidades

- Generación de imágenes de la lámpara E14 específica en una amplia variedad de escenarios, estilos y condiciones de iluminación, siempre que el prompt incluya el token de activación.
- Personalización del estilo: al ser un LoRA, preserva las capacidades generales del modelo base Krea 2, por lo que puede combinarse con otros estilos, atmósferas o composiciones descritas en el prompt.
- Compatibilidad con el ecosistema Diffusers: se integra mediante `Krea2Pipeline` y `load_lora_weights`, lo que facilita su uso en flujos de trabajo ya existentes.
- Inferencia eficiente: está diseñado para funcionar con Krea 2 Turbo en 8 pasos, lo que reduce significativamente el tiempo de generación frente a modelos de difusión estándar.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente generativo de imágenes.

## Casos de uso

- Visualización de producto para catálogos de iluminación: el modelo permite generar imágenes de una lámpara E14 concreta en distintos entornos (salón, oficina, exterior) sin necesidad de sesión fotográfica, integrando el token en prompts descriptivos.
- Diseño de interiores y decoración: los diseñadores pueden probar cómo queda la lámpara en diferentes estilos decorativos (minimalista, industrial, nórdico) generando renders rápidos con 8 pasos de inferencia.
- Generación de contenido para marketing y publicidad: crear imágenes de la lámpara en escenarios aspiracionales o de marca (por ejemplo, "una lámpara E14 sobre una mesa de mármol en un ático de lujo") para campañas en redes sociales o web.
- Prototipado rápido para fabricantes: antes de producir físicamente la lámpara, se pueden generar múltiples variaciones de color, material o entorno para evaluar el diseño.
- Creación de assets para videojuegos o entornos virtuales: el LoRA permite generar texturas o referencias visuales de la lámpara para integrarla en escenas 3D o concept art.
- Documentación técnica y manuales: generar imágenes de la lámpara en diferentes ángulos o contextos de uso para incluir en manuales de instrucciones o fichas técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos sobre calidad de imagen, FID, CLIP score ni comparaciones con otros LoRAs o modelos. La model card solo muestra tres ejemplos de salida generados con Krea 2 Turbo en 8 pasos, sin métricas cuantitativas.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Krea 2 (RAW o Turbo). No se especifican en la información disponible.
- El ejemplo de uso carga el pipeline en `torch.bfloat16` y lo ejecuta en CUDA, lo que implica una GPU NVIDIA con soporte para bfloat16 (arquitectura Ampere o superior, por ejemplo RTX 30xx, RTX 40xx, A100, H100).
- Para inferencia con 8 pasos sobre Krea 2 Turbo, se estima que una GPU con al menos 8-12 GB de VRAM podría ser suficiente, pero este dato no está confirmado oficialmente.
- Opciones de despliegue: el modelo se usa exclusivamente a través de la librería Diffusers de Hugging Face, con el pipeline `Krea2Pipeline`. No se menciona soporte para vLLM, llama.cpp u otros motores, ya que no es un modelo de lenguaje.
- El overhead de VRAM del LoRA es mínimo comparado con el modelo base, pero no se dispone de cifras exactas de consumo de memoria.

## Comparativa con modelos similares

No disponible. Al ser un LoRA específico para un objeto concreto, no existen modelos comparables directos en la misma categoría. Se podría comparar con otros LoRAs de Krea 2, pero no se ha publicado información sobre alternativas similares. El modelo base Krea 2 compite con otros modelos de difusión de texto a imagen como SDXL, Flux o Stable Diffusion 3, pero la comparativa a nivel de adaptador no es significativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el concepto `lido-e14-lamp`; usarlo sin el token de activación no producirá resultados relacionados con la lámpara.
- No se conoce el número de imágenes de entrenamiento ni la diversidad de ángulos, materiales o condiciones de iluminación representadas, por lo que puede haber sobreajuste a las imágenes de referencia y fallar en variaciones extremas.
- La licencia Apache 2.0 del adaptador permite uso comercial, pero el modelo base `krea/Krea-2-Raw` y `krea/Krea-2-Turbo` pueden tener sus propias licencias o términos de uso que deben verificarse antes de desplegar el modelo en producción.
- No hay información sobre sesgos o alucinaciones específicos, pero como todo modelo de difusión, puede generar artefactos visuales no deseados o interpretar incorrectamente prompts ambiguos.
- El adaptador solo funciona con el ecosistema Diffusers y el pipeline `Krea2Pipeline`; no es compatible con otros frameworks como ComfyUI o Automatic1111 a menos que se adapte manualmente.
- La fecha de creación (agosto de 2026) y el hecho de que el modelo tenga 0 descargas y 0 likes indican que es un trabajo reciente y no validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paulsizemore/lido-e14-lamp
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw (referenciado en la metadata, sin URL directa confirmada)
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo (referenciado en el ejemplo de uso, sin URL directa confirmada)
