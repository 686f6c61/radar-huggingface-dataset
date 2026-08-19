# Comfy-Org/Wan-Dancer

## Resumen

Wan-Dancer es un reempaquetado del modelo Wan2.2-Dancer-14B, desarrollado originalmente por Wan-AI (Alibaba) y adaptado por Comfy-Org para su uso directo en ComfyUI. El nombre sugiere que se trata de un modelo especializado en la generación de secuencias de baile o movimiento coreografiado, probablemente a partir de audio o de condiciones de pose. El repositorio contiene dos archivos de pesos en formato `safetensors` con cuantización `fp8_scaled`: uno para el modelo "global" y otro para el "local", lo que indica una arquitectura de dos etapas o de control fino sobre el movimiento.

La model card oficial es extremadamente escueta: solo proporciona instrucciones de instalación y no incluye detalles técnicos sobre arquitectura, entrenamiento o capacidades. Toda la información técnica debe buscarse en el repositorio original de Wan-AI, que no está disponible en los datos proporcionados. Aun así, por el nombre y el tamaño (14B parámetros), se puede inferir que es un modelo de difusión para video, probablemente basado en una arquitectura de transformer 3D, similar a otros modelos de la familia Wan2.2.

La relevancia de este modelo radica en su integración con ComfyUI, lo que permite a los usuarios generar vídeo de baile de alta calidad sin necesidad de escribir código, utilizando nodos visuales. La licencia Apache-2.0 facilita su uso comercial y su modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente difusión de video basada en transformer 3D) |
| Parametros totales | 14B (según el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8_scaled (según los nombres de archivo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. La model card de Comfy-Org solo indica que se trata de un reempaquetado de los archivos del modelo original de Wan-AI. Para conocer la arquitectura exacta (por ejemplo, si es un modelo de difusión con atención espaciotemporal, si utiliza un codificador de audio para sincronizar el baile, o si emplea un mecanismo de control de poses), es necesario consultar el repositorio original de Wan-AI, que no está incluido en la información proporcionada.

Dado que el modelo se llama "Dancer" y tiene 14B parámetros, es razonable suponer que sigue la línea de los modelos Wan2.2 de Alibaba, que utilizan arquitecturas de difusión latente para vídeo con componentes de control de movimiento. Sin embargo, estos detalles no están confirmados en los datos disponibles.

## Capacidades

- Generación de vídeo de baile: el nombre del modelo indica que está especializado en generar secuencias de movimiento coreografiado, probablemente sincronizadas con audio o con condiciones de pose.
- Integración con ComfyUI: los archivos están preparados para colocarse en las carpetas `diffusion_models` de ComfyUI, lo que permite su uso mediante nodos visuales.
- Dos etapas de generación: la presencia de archivos "global" y "local" sugiere que el modelo puede operar en dos niveles (por ejemplo, generación global de la escena y refinamiento local del movimiento), aunque no se especifica el flujo exacto.
- No se confirman capacidades adicionales como tool calling, razonamiento multimodal o soporte de agentes, ya que no hay información al respecto.

## Casos de uso

- Producción de animación y vídeo: los creadores pueden generar secuencias de baile para personajes animados, ahorrando tiempo en captura de movimiento o animación manual. El modelo se integraría en un pipeline de ComfyUI para producir clips de vídeo a partir de una condición inicial (por ejemplo, una pose o una pista de audio).
- Prototipado de coreografías: coreógrafos y diseñadores pueden usar el modelo para visualizar ideas de movimiento antes de llevarlas a producción real, generando vídeos de referencia rápidos.
- Contenido para redes sociales: generación de vídeos cortos de baile para plataformas como TikTok o Instagram, con la posibilidad de ajustar el estilo mediante prompts o condiciones.
- Investigación en generación de movimiento: el modelo puede servir como base para estudiar la generación de vídeo condicionada por audio o por poses, gracias a su licencia Apache-2.0 que permite su modificación.
- Educación y demostraciones: en entornos educativos, se puede utilizar para ilustrar conceptos de generación de vídeo con IA, mostrando cómo un modelo de difusión produce movimiento coherente.
- Integración en herramientas de VFX: los estudios de efectos visuales pueden emplear el modelo para generar capas de movimiento de baile que luego se combinan con otros elementos en postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de Comfy-Org no incluye métricas de rendimiento, y no se proporcionan datos del repositorio original. Por tanto, no es posible comparar objetivamente este modelo con alternativas en tareas como generación de vídeo, sincronización de audio o calidad de movimiento.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 36.7 GB, por lo que se necesitará al menos ese espacio en disco para descargar los pesos.
- VRAM estimada: no disponible. Dado que el modelo tiene 14B parámetros y los archivos están en fp8, se puede estimar que la inferencia requerirá al menos 16-20 GB de VRAM, pero este dato no está confirmado.
- GPU recomendadas: no disponible. Modelos de este tamaño suelen ejecutarse en GPUs de gama alta como RTX 4090, A100 o H100, pero no hay especificación oficial.
- Opciones de despliegue: al estar empaquetado para ComfyUI, el despliegue natural es a través de esa interfaz. También podría usarse con otros frameworks que soporten safetensors y difusión de vídeo, pero no se indica compatibilidad con vLLM, llama.cpp u otros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pertenece a la familia Wan2.2 de Alibaba, que incluye otros modelos como Wan2.2-TI2V-14B (texto a vídeo) o Wan2.2-Audio, pero no se conocen sus especificaciones exactas ni sus resultados. Sin datos de benchmarks ni de arquitectura, no es posible comparar con alternativas como Sora, Runway Gen-3 o modelos open source como Open-Sora o CogVideoX. Se recomienda consultar el repositorio original de Wan-AI para obtener una comparativa fundamentada.

## Limitaciones y advertencias

- Información técnica insuficiente: la model card no proporciona detalles sobre arquitectura, entrenamiento, sesgos o limitaciones. Los usuarios deben asumir riesgos al usar el modelo sin conocer su comportamiento en escenarios específicos.
- Posibles sesgos en el movimiento generado: al ser un modelo entrenado con datos de vídeo, es probable que reproduzca sesgos presentes en los datos de entrenamiento (por ejemplo, estilos de baile dominantes o movimientos asociados a ciertos cuerpos). No hay información sobre mitigaciones.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir movimientos incoherentes o artefactos visuales, especialmente en condiciones de entrada poco comunes.
- Dependencia de ComfyUI: el empaquetado está pensado para ComfyUI, por lo que su uso fuera de este entorno puede requerir adaptaciones no documentadas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no se especifican restricciones adicionales sobre el contenido generado (por ejemplo, si el modelo puede generar contenido con derechos de autor).
- Sin soporte oficial: al ser un reempaquetado de la comunidad, no hay garantía de mantenimiento o actualizaciones.

## Enlaces

- Repositorio de HuggingFace de Comfy-Org: https://huggingface.co/Comfy-Org/Wan-Dancer
- Repositorio original del modelo (referenciado en la model card): https://huggingface.co/Wan-AI/Wan2.2-Dancer-14B
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
