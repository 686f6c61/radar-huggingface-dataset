# serotoninboi/teemo-skin-multidesign-league-of-legends-wild-rift

## Resumen

Teemo Skin Multidesign es un LoRA de texto a imagen para la generación de variantes de aspecto (skins) del personaje Teemo, perteneciente al videojuego League of Legends: Wild Rift. Lo publica el usuario serotoninboi en Hugging Face, aunque la autoría original del modelo corresponde a Syraiky en CivitAI (ID 829180). El modelo se distribuye como adaptador LoRA sobre el checkpoint base OnomaAI6/Illustrious-xl-early-release-v0, un modelo SDXL orientado a ilustración y estética anime.

El propósito del LoRA es empaquetar en un único adaptador múltiples diseños del personaje: la apariencia base de Teemo con gafas y pelo azul, variantes en kigurumi (conejo, panda, abeja), versiones antropomórficas (cat boy, satyr, yordle), y variantes de mapache y tanuki. Cada diseño se activa mediante tokens de instancia específicos (wrteemob, wrtfc, wrtmonio, wrthex, wrtsblos, wrtpsb, wrlolteemob), lo que permite cambiar de skin sin cargar adaptadores distintos.

Es relevante para desarrolladores e investigadores que trabajen en pipelines de generación condicionada por personaje, ya que demuestra un patrón práctico de multi-concepto dentro de un solo LoRA: un token por diseño, prompts de refuerzo y prompts negativos específicos para corregir anatomía. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión texto a imagen de tipo SDXL |
| Parametros totales | no disponible (el LoRA no declara recuento de parámetros; el repo pesa 0,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión) |
| Tipos de cuantizacion | no disponible (el LoRA se usa en precisión del checkpoint base; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible explícitamente; distribución vía diffusers y CivitAI (habitualmente safetensors) |

## Arquitectura y entrenamiento

El modelo es un LoRA entrenado sobre OnomaAI6/Illustrious-xl-early-release-v0, un checkpoint de la familia SDXL/Illustrious especializado en ilustración. El adaptador inyecta pesos de bajo rango en las capas de atención y proyección del UNet para asociar tokens de instancia concretos con la apariencia de cada skin. El autor documenta explícitamente los hiperparámetros de inferencia recomendados (pasos de 20 a 30 o más, fuerza de LoRA entre 0,95 y 1,0, CFG de 4 a 5, sampler Euler o DPM++ 2S), lo que sugiere un entrenamiento orientado a preservar el estilo del checkpoint base.

No se especifica el número de imágenes de entrenamiento, el número de tokens vistos ni si hubo regularización con captions negativos. La model card sí detalla un sistema de prompts de refuerzo y negativos por skin (por ejemplo, `np: tail` para eliminar la cola, `np: multiple eyes` para corregir ojos duplicados, o `np: (big head), (3d:0.5)` para evitar proporciones no deseadas), lo que indica un ajuste fino manual sobre los fallos típicos de cada concepto. También menciona pruebas cruzadas con WAI-NSFW-illustrious-SDXL v11 y v14, y una sección separada para la variante Pony con fuerza de LoRA reducida (0,6 a 0,8) y CFG de 6 a 8.

## Capacidades

- Generación de imágenes texto a imagen de un personaje concreto (Teemo) en múltiples variantes de skin mediante tokens de instancia.
- Control de apariencia por token: wrteemob (base Wild Rift), wrtfc (cat boy), wrtmonio (satyr), wrthex (yordle), wrtsblos (mapache), wrtpsb (tanuki), wrlolteemob (variante Pony).
- Soporte de prompts negativos específicos por diseño para corregir anatomía (colas extra, cabeza grande, pelaje no deseado, ojos múltiples).
- Compatibilidad con checkpoints derivados de Illustrious y con la familia Pony (con parámetros ajustados).
- Capacidad de composición con otros LoRA y de control de estilo mediante tags de calidad (detailed, vibrant, no lineart).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imagen.
- Capacidad multilingüe de prompts no documentada; los ejemplos de la model card están en inglés.

## Casos de uso

- Generación de arte de fan para comunidades de League of Legends: el LoRA permite producir ilustraciones de Teemo en sus distintas skins con un solo adaptador, usando los tokens de instancia documentados y los prompts de anatomía recomendados.
- Prototipado de assets para mods o contenido derivado de Wild Rift: un estudio pequeño puede generar variantes visuales de personaje para maquetas, banners o material promocional no oficial antes de encargar arte final.
- Creación de personajes consistentes en cómics o webtoons amateur: al fijar el token de instancia y el prompt de refuerzo, se mantiene la identidad visual del personaje entre viñetas.
- Pruebas de concepto de pipelines multi-concepto: sirve como caso de estudio de cómo empaquetar varios diseños en un único LoRA con tokens separados y prompts negativos por variante, útil para quien entrene adaptadores propios.
- Generación de avatares y stickers para Discord o foros: las variantes chibi y kigurumi (conejo, panda, abeja) encajan en formatos pequeños y de tono humorístico.
- Investigación sobre sesgos y fidelidad de LoRA: permite medir cuánto se desvía la generación del diseño original del videojuego según la fuerza del adaptador y el CFG, comparando rangos de 0,95 a 1,0 frente a valores más bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el LoRA añade una sobrecarga mínima; el requisito real lo marca el checkpoint base Illustrious XL (SDXL). En FP16 se necesitan aproximadamente 12 a 16 GB de VRAM para inferencia; con cuantización a FP8 o mediante optimizaciones de memoria puede bajar a 8-10 GB.
- GPU recomendadas: NVIDIA RTX 4090, A100 o H100 para generación rápida en FP16; RTX 3090, 4080 o 4070 Ti como opciones de gama alta para consumo.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores con optimizaciones (attention slicing, VAE tiling); en GPUs de 8 GB requiere cuantización o descarga parcial.
- Opciones de despliegue: diffusers (librería declarada), Automatic1111/Forge, ComfyUI, InvokeAI y Fooocus; el LoRA se carga junto al checkpoint base.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, del sampler y del número de pasos (el autor recomienda 20-30 pasos).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teemo Skin Multidesign (este) | LoRA multi-skin | Illustrious XL early release v0 | SDXL (1024 px típico) | creativeml-openrail-m | Hugging Face y CivitAI |
| LoRA de personaje único típico en CivitAI | LoRA | SDXL / Illustrious / Pony | SDXL (1024 px típico) | variable según autor | CivitAI |
| Checkpoint base Illustrious XL | Modelo completo | — | SDXL (1024 px típico) | variable (consultar model card) | Hugging Face |
| WAI-NSFW-illustrious-SDXL | Checkpoint afinado | Illustrious | SDXL (1024 px típico) | variable (consultar model card) | CivitAI |

La comparativa se limita a referencias de la propia model card; no se dispone de datos de rendimiento cuantitativos para establecer una comparación numérica con alternativas.

## Limitaciones y advertencias

- Es un LoRA de personaje concreto: no es un modelo generalista y su utilidad fuera de la generación de Teemo es marginal.
- La calidad depende fuertemente del checkpoint base; el autor solo valida Illustrious y, con parámetros distintos, Pony. Otros checkpoints pueden degradar el resultado.
- Riesgo de anatomía incorrecta: la model card documenta fallos recurrentes (colas extra, cabeza grande, ojos múltiples, pelaje no deseado) que requieren prompts negativos específicos.
- Los prompts de calidad recomendados contienen errores ortográficos deliberados ("beutiful", "amzing", "netavite"); el autor advierte que funcionan mejor así, lo que dificulta su mantenimiento y reproducibilidad.
- La sección NSFW opcional y el uso de checkpoints NSFW en las pruebas implican riesgos de contenido para entornos de producción; se recomienda filtrado y revisión.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos y de ciertas aplicaciones descritas en la licencia); no es una licencia de código abierto permisiva sin condiciones.
- Sin descargas ni validación comunitaria en Hugging Face en el momento de la consulta; la referencia principal de calidad es la página de CivitAI del autor original.
- El modelo se basa en una propiedad intelectual de Riot Games (Teemo, Wild Rift); el uso comercial de imágenes derivadas puede infringir derechos de marca y personaje, independientemente de la licencia del LoRA.

## Enlaces

- Hugging Face: https://huggingface.co/serotoninboi/teemo-skin-multidesign-league-of-legends-wild-rift
- CivitAI (autor original): https://civitai.com/models/829180
- Perfil del autor original en CivitAI: https://civitai.com/user/Syraiky
- Modelo base: https://huggingface.co/OnomaAI6/Illustrious-xl-early-release-v0
