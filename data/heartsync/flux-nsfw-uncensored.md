# Heartsync/Flux-NSFW-uncensored

## Resumen

Heartsync/Flux-NSFW-uncensored es un adaptador LoRA desarrollado por el usuario Heartsync sobre el modelo base black-forest-labs/FLUX.1-dev. Su propósito declarado es minimizar las restricciones de censura en la generación de imágenes a partir de texto, actuando como un "campo de pruebas" para explorar los límites técnicos de la moderación de contenido en modelos de difusión. El repositorio contiene únicamente los pesos del adaptador (lora.safetensors) y no el modelo completo, por lo que debe cargarse sobre FLUX.1-dev mediante la librería diffusers y PEFT.

El modelo está pensado para investigadores y desarrolladores interesados en evaluar el comportamiento de la censura en sistemas de generación de imágenes, así como para usos artísticos que requieran un control menos restrictivo del contenido. Su relevancia radica en que FLUX.1-dev es uno de los modelos de difusión más avanzados disponibles en código abierto, con 12 mil millones de parámetros, y este LoRA ofrece una vía para personalizar su salida sin necesidad de reentrenar el modelo completo. La licencia es creativeml-openrail-m, que permite uso comercial con restricciones de responsabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre FLUX.1-dev (modelo de difusión basado en transformer con flujo rectificado) |
| Parametros totales | no disponible (el adaptador LoRA, tamaño del repo 0.7 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generación de imágenes) |
| Tipos de cuantizacion | no disponible (el LoRA se carga en fp16 según el ejemplo de uso) |
| Idiomas soportados | inglés (prompts en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (lora.safetensors) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre FLUX.1-dev, un modelo de difusión de 12 mil millones de parámetros desarrollado por Black Forest Labs. FLUX.1-dev emplea una arquitectura de transformer con flujo rectificado (rectified flow), que unifica los pasos de entrenamiento y muestreo en un proceso continuo, y utiliza una codificación dual de texto (CLIP y T5) para mejorar la adherencia al prompt. El LoRA modifica los pesos del modelo base para reducir los filtros de contenido que FLUX.1-dev aplica por defecto, permitiendo generar imágenes con temáticas que el modelo original rechazaría.

No se dispone de información pública sobre el proceso de entrenamiento del LoRA: ni el número de pasos, ni el dataset utilizado, ni si se emplearon técnicas de RLHF o DPO. La model card solo indica que el objetivo es "minimizar las restricciones de censura" y que se trata de un "playground" para explorar los límites técnicos. El ejemplo de código proporcionado usa el pipeline `AutoPipelineForText2Image` con `load_lora_weights`, lo que confirma que es un adaptador ligero que no requiere reentrenamiento del modelo base.

## Capacidades

- Generación de imágenes a partir de prompts en inglés, con un control de contenido menos restrictivo que el modelo base FLUX.1-dev.
- Soporte de negativo de prompt para excluir elementos no deseados (texto, marcas de agua, baja calidad).
- Integración con la librería diffusers de Hugging Face, lo que permite usarlo en pipelines existentes de text-to-image.
- Capacidad de ajuste de parámetros como `guidance_scale`, `num_inference_steps`, `width` y `height` para controlar la calidad y el estilo de la salida.
- No incluye capacidades de visión, tool calling, agentes ni razonamiento multimodal; es exclusivamente un generador de imágenes.

## Casos de uso

- Exploración de límites de censura en IA: permite a investigadores probar qué prompts son bloqueados por el modelo base y cómo el LoRA altera esas restricciones, útil para auditar la moderación de contenido en sistemas de generación de imágenes.
- Creación de arte digital con temática adulta: artistas pueden generar ilustraciones o fotografías realistas con contenido erótico o sugerente sin las limitaciones impuestas por FLUX.1-dev estándar, siempre que cumplan con la legislación local.
- Pruebas de robustez en pipelines de generación: desarrolladores pueden integrar este LoRA en entornos de prueba para verificar que sus sistemas de filtrado funcionan correctamente ante intentos de generar contenido no permitido.
- Entrenamiento de clasificadores de contenido: el modelo puede servir como generador de datos sintéticos para entrenar detectores de NSFW, al producir imágenes con distintos grados de explicitud.
- Estudio de sesgos en modelos de difusión: al eliminar la censura, se puede analizar cómo el modelo base representa ciertos grupos o escenarios sin el filtro de moderación, revelando sesgos latentes.
- Generación de contenido para proyectos de ficción o juegos: escritores o diseñadores pueden crear imágenes de personajes o escenas que requieran un nivel de detalle anatómico o situaciones que el modelo base rechazaría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros modelos o LoRAs. Tampoco se especifican tiempos de inferencia ni uso de memoria.

## Requisitos de hardware

- VRAM estimada: dado que el LoRA se carga sobre FLUX.1-dev, los requisitos son los de este modelo base. En fp16, FLUX.1-dev requiere aproximadamente 12 GB de VRAM para generar imágenes de 1024x1024 píxeles. Con cuantización (por ejemplo, 4 bits) podría reducirse a unos 8 GB, pero no se indica compatibilidad con cuantización para este LoRA.
- GPU recomendadas: se necesita una GPU con al menos 12 GB de VRAM para fp16, como NVIDIA RTX 3080/3090, RTX 4090, A100 o H100. En consumer, una RTX 4090 es suficiente para generar imágenes de alta resolución.
- Opciones de despliegue: el ejemplo oficial usa `diffusers` con `AutoPipelineForText2Image` y `load_lora_weights`. También es compatible con otras herramientas que soporten LoRAs de FLUX, como ComfyUI o Automatic1111 (con extensiones adecuadas).
- Latencia y throughput: no se dispone de mediciones concretas. En una RTX 4090, FLUX.1-dev tarda entre 5 y 10 segundos por imagen con 28 pasos de inferencia, pero esto depende de la resolución y la configuración del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos o LoRAs de generación de imágenes sin censura. Como referencia, se puede mencionar que existen otros adaptadores similares para Stable Diffusion (por ejemplo, SDXL Uncensored), pero no hay datos públicos que permitan una comparación objetiva de rendimiento o calidad. El modelo base FLUX.1-dev es superior en calidad de imagen a Stable Diffusion XL, pero este LoRA no altera esa calidad, solo reduce la moderación de contenido.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está diseñado para generar contenido explícito, lo que puede ser inapropiado para muchos entornos y puede violar las políticas de plataformas o leyes locales. Su uso debe ser responsable y legal.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede producir artefactos o representaciones inexactas, especialmente en anatomía humana o detalles finos, lo que puede resultar problemático en contenido explícito.
- Sesgos del modelo base: FLUX.1-dev hereda sesgos de sus datos de entrenamiento, y al eliminar la censura, estos sesgos pueden manifestarse de forma más directa en las imágenes generadas.
- Sin soporte multilingüe: solo se ha probado con prompts en inglés; otros idiomas pueden producir resultados de menor calidad.
- Licencia creativeml-openrail-m: permite uso comercial, pero exige no utilizar el modelo para actividades ilegales o dañinas. El autor no ofrece garantías sobre el contenido generado.
- Falta de documentación técnica: no se especifican datos de entrenamiento, hiperparámetros ni métricas de evaluación, lo que dificulta la reproducibilidad y la evaluación objetiva.
- Dependencia del modelo base: el LoRA no funciona de forma independiente; requiere descargar FLUX.1-dev, que tiene su propia licencia (FLUX.1-dev es de uso no comercial según los términos de Black Forest Labs, aunque la versión dev es de código abierto con fines de investigación). Es importante verificar los términos de uso de FLUX.1-dev antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Heartsync/Flux-NSFW-uncensored
- OpenCSG (espejo del modelo): https://opencsg.com/models/AIWizards/Flux-NSFW-uncensored
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
