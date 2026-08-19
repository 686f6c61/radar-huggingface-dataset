# LiberationLabs/image-toolbench

## Resumen

Image Toolbench es un repositorio publicado por LiberationLabs, también conocido como Transparent Humboldt Coalition, que contiene scripts de generación y pesos LoRA para personalizar el modelo de difusión FLUX.1-dev de Black Forest Labs. El repositorio incluye adaptadores de bajo rango para la semejanza de personajes (Vera y Thomas) y para estilos de textura, como el kintsugi, el arte japonés de reparar cerámica con oro. Además, proporciona 29 scripts de pipeline que muestran cómo aplicar estos LoRAs de forma individual o apilada para lograr composiciones complejas, como retratos con estética cerámica o efectos de grietas doradas.

El proyecto resuelve el problema de la personalización fina de FLUX.1-dev sin necesidad de reentrenar el modelo completo, mediante adaptadores LoRA con rank 16 entrenados en Apple Silicon (MPS). Los pesos se distribuyen en formato safetensors y se integran fácilmente con la librería diffusers. Aunque el repositorio está pensado para uso interno de la Coalición, su publicación ofrece a otros desarrolladores un ejemplo práctico de entrenamiento y composición de LoRAs para generación de imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA rank 16 sobre FLUX.1-dev (modelo de difusión texto a imagen) |
| Parametros totales | no disponible (los LoRAs son adaptadores de bajo rango; el modelo base no se incluye) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (generación de imágenes) |
| Tipos de cuantizacion | no disponible (el ejemplo usa bfloat16 para el modelo base) |
| Idiomas soportados | no disponibles (los prompts se asumen en inglés, aunque no se especifica) |
| Licencia | other (uso restringido a la Coalición; contactar para licenciamiento) |
| Formato de pesos | safetensors (LoRAs) y archivos de configuración YAML |

## Arquitectura y entrenamiento

Los LoRAs se entrenaron sobre FLUX.1-dev, un modelo de difusión de texto a imagen de Black Forest Labs. Cada adaptador tiene un rank de 16, lo que permite ajustar el modelo con un número reducido de parámetros. El entrenamiento se realizó en Apple Silicon utilizando MPS (Metal Performance Shaders), según se indica en la documentación. No se proporcionan detalles sobre el conjunto de datos de entrenamiento ni sobre el proceso de optimización (por ejemplo, si se usó RLHF o DPO). Los pasos de entrenamiento varían según la versión: Vera v1 tiene 750 pasos, v3 tiene 1250 y v4 se fine-tuneó desde v3 con 750 pasos adicionales; el LoRA de kintsugi v2 tiene 300 pasos; Thomas v1 tiene 1250 pasos.

El repositorio incluye múltiples scripts de generación que muestran cómo combinar varios LoRAs, como apilar el LoRA de personaje con el de textura para lograr composiciones como la transformación de carne a cerámica o la aplicación de textura dorada. También hay scripts para caché de embeddings de identidad, lo que acelera la inferencia al precomputar representaciones del personaje.

## Capacidades

- Generación de imágenes personalizadas con FLUX.1-dev mediante LoRAs.
- Recreación de la semejanza de personajes específicos (Vera, Thomas) usando tokens de activación como `vera` o `thomas`.
- Aplicación de estilos de textura, como el kintsugi (reparación dorada), para efectos de grietas y costuras doradas.
- Composición de múltiples LoRAs apilados para combinar identidad y estilo (por ejemplo, retrato de Vera con estética cerámica y dorada).
- Uso de scripts de pipeline para diferentes iteraciones de generación, incluyendo caché de embeddings de identidad para acelerar la inferencia.
- Integración con la librería diffusers de Hugging Face, permitiendo carga directa de pesos LoRA.

No se mencionan capacidades de tool calling, agentes o razonamiento, ya que es un modelo de generación de imágenes.

## Casos de uso

- Creación de retratos con identidad consistente: usando el LoRA de Vera o Thomas, se pueden generar múltiples imágenes del mismo personaje en diferentes poses o contextos, manteniendo la semejanza facial. Esto es útil para proyectos de narrativa visual o branding de personajes.
- Aplicación de efectos artísticos de kintsugi: el LoRA de textura kintsugi permite añadir patrones de grietas doradas a cualquier imagen generada, inspirándose en el arte japonés de reparar cerámica. Se puede usar para crear ilustraciones con estética de cerámica rota y reparada.
- Transformación de materiales: los scripts como `gen_flesh_to_ceramic.py` sugieren la capacidad de transformar representaciones de piel en cerámica, lo que podría aplicarse en diseño de personajes o arte conceptual.
- Generación de arte para proyectos de marca: los scripts `gen_mnemosyne_art.py` y `gen_project_art_refresh.py` indican su uso para generar arte de proyectos y actualizar la imagen de marca, aprovechando los estilos entrenados.
- Exploración de estilos: los scripts `gen_style_exploration.py` y `gen_style_round2/3.py` permiten probar variaciones de estilo, útil para investigación en estética generativa.
- Prototipado rápido de conceptos visuales: al ser LoRAs ligeros, se pueden cargar en pipelines existentes de diffusers para iterar rápidamente sobre diseños sin necesidad de entrenar un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- El ejemplo de uso carga el modelo base FLUX.1-dev en bfloat16 y usa `pipe.to("cuda")` o `pipe.to("mps")`, por lo que se requiere una GPU NVIDIA con soporte CUDA o un Mac con Apple Silicon.
- Dado que FLUX.1-dev es un modelo de difusión de aproximadamente 12 mil millones de parámetros (dato no confirmado en la documentación, pero conocido públicamente), se recomienda al menos 16 GB de VRAM para inferencia en FP16, aunque no se especifica en el repositorio.
- Los LoRAs son pequeños (el repositorio ocupa 0.9 GB en total), por lo que el requisito principal es el del modelo base.
- Opciones de despliegue: se puede usar con la librería diffusers en Python, y probablemente con otras herramientas compatibles con LoRAs de FLUX, aunque no se mencionan explícitamente (vLLM, llama.cpp no aplican aquí).
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. Este repositorio no es un modelo independiente sino un conjunto de adaptadores para FLUX.1-dev, por lo que la comparación con otros modelos de generación de imágenes no es directa.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia "other" indica que los activos se proporcionan para uso de la Coalición, y se requiere contactar con Liberation Labs para cualquier licenciamiento. No se permite uso comercial sin autorización explícita.
- Dependencia del modelo base: los LoRAs solo funcionan con FLUX.1-dev, que a su vez tiene su propia licencia (no comercial para FLUX.1-dev, aunque no se detalla aquí). Es necesario verificar los términos de uso de Black Forest Labs.
- No se documentan sesgos o riesgos de alucinación, pero al ser generación de imágenes, pueden producirse artefactos visuales no deseados, especialmente al apilar múltiples LoRAs.
- Los LoRAs están entrenados para personajes y estilos específicos; su uso fuera de esos contextos puede dar resultados inconsistentes.
- No hay información sobre el idioma de los prompts; se asume que son en inglés, pero no se especifica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LiberationLabs/image-toolbench
- Organización Liberation Labs en GitHub: https://github.com/Liberation-Labs
- Modelo base FLUX.1-dev (mencionado en el ejemplo): https://huggingface.co/black-forest-labs/FLUX.1-dev
