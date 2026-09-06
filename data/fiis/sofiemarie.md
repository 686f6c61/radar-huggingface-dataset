# FIIS/sofiemarie

## Resumen

FIIS/sofiemarie es un adaptador LoRA (Low-Rank Adaptation) de text-to-image desarrollado por FIIS, entrenado con DreamBooth sobre el modelo base Krea 2 RAW. El modelo está diseñado para generar imágenes de un concepto o personaje específico activado mediante el token "Sofie Marie". Se presenta como un complemento para la librería diffusers y se muestra funcionando sobre Krea 2 Turbo a 8 pasos de inferencia.

El repositorio tiene un tamaño de 1.0 GB y se distribuye bajo licencia Apache 2.0. Al ser un LoRA, no es un modelo autónomo: requiere cargar el modelo base Krea 2 y aplicar los pesos del adaptador. Esto permite personalizar la generación de imágenes sin necesidad de entrenar un modelo completo, lo que resulta relevante para creadores que buscan consistencia de personaje en sus proyectos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Krea 2 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de text-to-image) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica DreamBooth-LoRA, que ajusta de forma eficiente las capas de atención de un modelo de difusión preentrenado. En este caso, el modelo base es Krea 2 RAW, un modelo de text-to-image de la familia Krea 2. El README indica que las muestras se generaron con Krea 2 Turbo a 8 pasos y guidance_scale 0.0, lo que sugiere que el adaptador está pensado para funcionar con el pipeline acelerado de Krea 2.

No se han publicado detalles sobre el dataset de entrenamiento, el número de pasos ni la configuración exacta del LoRA (rank, alpha, etc.). Tampoco se especifica si se aplicó RLHF o DPO, ya que se trata de un modelo de generación de imágenes y no de lenguaje.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el token de activación "Sofie Marie".
- Consistencia de personaje: permite generar múltiples imágenes del mismo concepto en estilos variados (cinematográfico, pintura al óleo, moda, etc.).
- Compatibilidad con el pipeline de diffusers y carga de pesos LoRA sobre Krea 2.
- Soporte de prompts descriptivos complejos en inglés, como se muestra en los ejemplos del README.
- Capacidad de generar imágenes en distintos géneros visuales (retrato, paisaje, moda, arquitectura) gracias a la combinación con el modelo base.

## Casos de uso

- Creación de retratos personalizados para ficción: el modelo permite generar un personaje recurrente con el token "Sofie Marie", lo que resulta útil para ilustrar novelas visuales, cómics o guiones. La consistencia del personaje se mantiene a través de distintos escenarios y estilos.
- Arte conceptual para cine y videojuegos: gracias a la capacidad de generar imágenes hiperrealistas o estilizadas, se pueden producir conceptos de personajes en entornos como una ciudad cyberpunk o una catedral brutalista. El LoRA se integra en un pipeline de diffusers para iterar rápidamente.
- Diseño de moda y editorial: el adaptador puede generar tomas de alta costura con el personaje, lo que permite a diseñadores visualizar prendas sobre una figura consistente antes de producir las piezas.
- Prototipado visual para campañas de marketing: se pueden crear imágenes de un mismo personaje en múltiples contextos (playa, ciudad, campo) para evaluar conceptos publicitarios sin necesidad de sesiones fotográficas.
- Ilustración de portadas y contenido digital: la generación de imágenes con estilos artísticos (pintura al óleo, fotografía cinematográfica) permite crear portadas para libros, revistas o contenido online de forma rápida y coherente.
- Exploración artística y generación de conceptos: el modelo permite combinar el personaje con prompts descriptivos para experimentar con estilos visuales, iluminación y composición, sirviendo como herramienta de inspiración para artistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El requisito depende del modelo base Krea 2, no del LoRA.
- GPU recomendadas: no disponible. El README muestra uso con CUDA, pero no especifica el modelo de GPU.
- Cabe en GPU de consumo: no disponible. Depende del modelo base.
- Opciones de despliegue: diffusers con carga de pesos LoRA. El ejemplo del README utiliza `Krea2Pipeline.from_pretrained(...).to('cuda')` y `pipe.load_lora_weights(...)`, con `torch_dtype=torch.bfloat16`.
- Latencia y throughput estimados: no disponible. El README indica 8 pasos de inferencia con Krea 2 Turbo, pero no ofrece mediciones.

## Comparativa con modelos similares

No se dispone de modelos comparables con información técnica suficiente en la documentación proporcionada. Los resultados de búsqueda web muestran modelos con el mismo nombre en SeaArt AI, pero no se aportan datos de parámetros, contexto ni rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Al ser un LoRA, no funciona de forma autónoma: requiere el modelo base Krea 2, cuya licencia y condiciones de uso pueden diferir de la licencia Apache 2.0 del adaptador.
- No se ha publicado información sobre el dataset de entrenamiento, por lo que no se puede evaluar la presencia de sesgos ni posibles problemas de derechos de autor sobre las imágenes de entrenamiento.
- El modelo está especializado en un único concepto (el token "Sofie Marie"), por lo que su capacidad de generalizar a otros personajes o estilos es limitada.
- No se han proporcionado datos de rendimiento, robustez ni seguridad, lo que dificulta su uso en entornos de producción sin validación previa.
- Los resultados pueden variar significativamente según el prompt y el modelo base utilizado; el README recomienda Krea 2 Turbo con 8 pasos y guidance_scale 0.0, pero no se garantiza el comportamiento con otras configuraciones.

## Enlaces

- https://huggingface.co/FIIS/sofiemarie
- https://www.seaart.ai/models/detail/65c28cbbbe5f19102831e68dd52247e0 (modelo similar "Sofie Marie" en SeaArt AI)
- https://www.seaart.ai/models/detail/b232b7f0ccb85fd75a13f0f41525169f (modelo similar "Sofie Marie - Flux" en SeaArt AI)
