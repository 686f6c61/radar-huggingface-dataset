# ifmylove2011/girlslike-krea2

## Resumen

GirlsLike-Krea2 es un adaptador de tipo LoRA/LoKr (Low Rank Adaptation con producto de Kronecker) desarrollado por el usuario ifmylove2011, diseñado para el modelo base de difusión Krea-2 de Krea AI. El adaptador se entrena sobre el checkpoint Krea-2-Raw y es compatible tanto con la versión Raw como con la variante Turbo, permitiendo generar imágenes de personajes femeninos con una identidad visual consistente a partir de una palabra de activación (trigger word) específica para cada persona.

El modelo resuelve el problema de la personalización de identidad en generación de imágenes: sin un adaptador, un modelo base no puede mantener la apariencia de un personaje concreto a lo largo de múltiples generaciones. GirlsLike-Krea2 añade esa capacidad mediante un entrenamiento de bajo rango que ajusta los pesos del modelo base sin necesidad de reentrenarlo por completo. Con más de 12.700 descargas y 29 likes en HuggingFace, el adaptador ha tenido una acogida notable dentro de la comunidad de generación de imágenes.

La relevancia actual del modelo radica en que Krea-2 es una arquitectura de difusión reciente (lanzada en 2025) y los adaptadores de personajes para ella son todavía escasos. Este LoRA cubre ese hueco, ofreciendo una solución práctica para creadores que necesitan consistencia facial en retratos, ilustraciones y contenido visual. El repositorio pesa 2,3 GB e incluye múltiples variantes del adaptador, cada una correspondiente a un personaje distinto, con nombres abreviados como `girlslikekrea2_tly`, `girlslikekrea2_syn`, etc.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA/LoKr (adaptador de bajo rango) sobre modelo de difusión Krea-2 |
| Parametros totales | no disponible (no se especifica el número de parámetros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó con el modelo base en int8, pero no se indica cuantización del adaptador final) |
| Idiomas soportados | Inglés (principal), chino (limitado, con errores conocidos) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors, pero no se confirma en la documentación) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoKr (Low Rank plus Kronecker product), una variante de LoRA que combina la descomposición de bajo rango con el producto de Kronecker para mejorar la capacidad de representación sin aumentar excesivamente el número de parámetros. Según la model card, el autor optó por un LoKr de rango completo (full-rank) tras probar varias configuraciones, buscando un equilibrio entre generalización, detalle y similitud con el personaje original. Este enfoque resulta especialmente eficaz cuando el conjunto de entrenamiento no es de alta calidad, como es el caso.

El entrenamiento se realizó sobre el modelo base Krea-2-Raw con cuantización int8, lo que reduce el consumo de memoria durante el ajuste. No se proporcionan detalles sobre el tamaño del dataset, el número de pasos de entrenamiento ni la composición de las imágenes de entrenamiento. El adaptador se diseñó para ser compatible tanto con Krea-2-Raw como con Krea-2-Turbo, y las pruebas de generación se realizaron con la versión Turbo en fp8, 8 pasos de inferencia, scheduler euler con beta|beta57, CFG de 1.0 y resolución 960×1280.

Cada variante del adaptador incluye una palabra de activación (trigger word) que debe incluirse en el prompt para que el modelo genere al personaje correcto. La mayoría de los trigger words están en chino, aunque algunos personajes usan palabras en inglés, que se indican en el watermark de las imágenes de ejemplo. El autor advierte que el modelo base Krea-2 tiene una comprensión limitada del chino y que ciertos conceptos (como "melocotón") se interpretan incorrectamente (los dibuja como manzanas), por lo que recomienda usar prompts en inglés para la mayoría de los casos.

## Capacidades

- Generación de imágenes de personajes femeninos con identidad visual consistente, manteniendo rasgos faciales reconocibles en planos medios y cercanos.
- Compatibilidad con dos variantes del modelo base: Krea-2-Raw y Krea-2-Turbo, lo que permite elegir entre calidad bruta o velocidad de inferencia.
- Soporte de prompts en inglés y chino, con mejor adherencia al prompt en inglés y resultados aceptables en chino para conceptos específicos.
- Control fino de la intensidad del adaptador mediante el peso del LoRA (recomendado entre 0.8 y 1.5; por encima de 2.0 se producen deformaciones faciales).
- Integración con el ecosistema diffusers de HuggingFace, lo que facilita su uso en pipelines de text-to-image estándar.
- Posibilidad de combinar con otros LoRAs (aunque las pruebas de ejemplo se realizaron sin otros adaptadores).
- Generación de imágenes a resoluciones variables, con mejor rendimiento en planos medios y cercanos; los planos lejanos requieren aumentar la resolución para mejorar la calidad.

## Casos de uso

- Creación de retratos personalizados para novelas visuales o juegos independientes: el adaptador permite generar múltiples ilustraciones de un mismo personaje manteniendo la coherencia facial, algo esencial en narrativas visuales con varios capítulos o escenas.
- Generación de avatares y perfiles para redes sociales o plataformas de contenido: con un trigger word específico, se pueden producir variaciones de un personaje en diferentes poses, fondos y estilos sin perder la identidad.
- Ilustración de personajes para campañas de marketing o branding: si una marca necesita una mascota o personaje recurrente, el LoRA permite generar material visual consistente para anuncios, banners y publicaciones.
- Producción de contenido para fanfiction o comunidades de fans: los creadores pueden usar el adaptador para visualizar personajes originales o reinterpretaciones de personajes existentes (siempre que respeten los derechos de autor).
- Prototipado rápido de conceptos de personajes para animación o cómic: los artistas pueden explorar variaciones de un diseño inicial generando decenas de imágenes con el mismo trigger word y ajustando el peso del LoRA para controlar la similitud.
- Personalización de contenido para juegos de rol o mundos virtuales: los jugadores pueden generar retratos de sus personajes con una apariencia consistente para usarlos en fichas, foros o plataformas de rol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como FID, CLIP score o comparaciones con otros adaptadores. La evaluación se basa en ejemplos visuales mostrados en el repositorio, que demuestran la calidad del adaptador en planos medios y cercanos, pero no hay datos numéricos que permitan comparar objetivamente su rendimiento.

## Requisitos de hardware

- El adaptador en sí es ligero (2,3 GB incluye todas las variantes), pero requiere el modelo base Krea-2 para funcionar, que es un modelo de difusión de gran tamaño.
- Para inferencia con Krea-2-Turbo en fp8 (como se usó en los ejemplos), se estima una VRAM mínima de 8-12 GB, dependiendo de la resolución de salida. Una GPU como la RTX 3060 de 12 GB o superior sería suficiente para resoluciones de 960×1280.
- Para Krea-2-Raw sin cuantizar, se recomienda al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100).
- El despliegue se puede realizar mediante la librería diffusers de HuggingFace, que soporta la carga de LoRAs con `load_lora_weights()`. También es compatible con herramientas como ComfyUI o Automatic1111 si se convierten los pesos al formato adecuado.
- La latencia depende del modelo base y del hardware. Con Krea-2-Turbo en fp8 y 8 pasos, se pueden obtener imágenes en unos pocos segundos en una GPU moderna (RTX 4090 o superior). Con Krea-2-Raw, el tiempo de generación es mayor (20-40 pasos típicos).
- No se proporcionan datos de throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables para Krea-2 en el momento de redactar esta ficha. La comparativa con LoRAs de personajes para otros modelos base (como Flux, SDXL o SD 1.5) no es directa, ya que la arquitectura subyacente y el comportamiento del modelo base difieren significativamente. Se puede afirmar que GirlsLike-Krea2 es uno de los primeros adaptadores de personajes publicados para Krea-2, lo que le confiere una posición pionera pero también implica una falta de referencias establecidas para comparar.

## Limitaciones y advertencias

- La comprensión del chino por parte del modelo base Krea-2 es limitada: el autor documenta que conceptos como "melocotón" se interpretan como "manzana", lo que puede provocar resultados incorrectos en prompts con términos chinos específicos.
- La calidad de la generación en planos lejanos (shots amplios) es deficiente a resoluciones bajas (1MP); se recomienda aumentar la resolución de salida para mejorar estos casos.
- El uso de pesos del LoRA superiores a 2.0 produce deformaciones faciales evidentes, por lo que el rango recomendado es de 0.8 a 1.5.
- El adaptador está diseñado para personajes femeninos concretos; no es un modelo genérico de generación de personas, sino que requiere el trigger word específico de cada personaje.
- Al tratarse de un adaptador de personajes, existe un riesgo potencial de uso indebido para suplantar la identidad de personas reales sin su consentimiento. Los usuarios deben verificar que tienen los derechos necesarios sobre las imágenes de los personajes que generan.
- La licencia Apache-2.0 permite uso comercial, pero no exime de responsabilidades legales en cuanto a derechos de imagen o marcas.
- No se proporcionan garantías sobre la consistencia del adaptador con futuras versiones del modelo base Krea-2; los cambios en el modelo base podrían requerir reentrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ifmylove2011/girlslike-krea2
- Galería de nombres abreviados (app): https://huggingface.co/spaces/ifmylove2011/girlslike_lora_gallery/blob/main/app.py
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw (referenciado en la model card)
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo (referenciado en la model card)
- Fuente de prompts de ejemplo (Civitai): https://civitai.com/models/2231696 (referenciado en la model card)
