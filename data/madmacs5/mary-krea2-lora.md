# madmacs5/mary-krea2-lora

## Resumen

El modelo `madmacs5/mary-krea2-lora` es un adaptador LoRA para el modelo de difusion Krea 2, desarrollado por el autor indie mad_macs. Su objetivo principal es fijar la identidad visual de un personaje ficticio femenino llamado Mary, caracterizado por un aspecto joven, rasgos suaves y pelo oscuro, generando imagenes fotorrealistas con iluminacion natural y luz diurna suave.

A diferencia de un modelo base, no se trata de un transformer de lenguaje ni de un modelo multimodal: es un par de LoRAs de bajo rango que se aplican sobre un checkpoint Krea 2. El repositorio pesa 1.4 GB y contiene dos safetensors: uno de identidad facial (`mary_face_v4_blend.safetensors`) y otro opcional de cuerpo delgado (`mary_slim_body.safetensors`). El autor recomienda usar el LoRA facial con una fuerza de 0.3 (rango 0.2-0.5) y el LoRA de cuerpo apilado a 0.6 + 0.8 con la misma semilla para tomas traseras o laterales.

No se proporcionan datos sobre licencia, idiomas, pipeline ni parametros totales. La relevancia del modelo reside en su enfoque de personalizacion sobre una base combinada de checkpoints Krea 2, lo que puede resultar de interes para quienes investigan la reutilizacion de LoRAs en pipelines de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base Krea 2 |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es una arquitectura completa, sino un conjunto de pesos de bajo rango (LoRA) pensados para modificar la atencion y las capas de un modelo base Krea 2. El autor indica que el LoRA facial fue reentrenado desde cero sobre una base combinada de Krea 2, resultado de un merge de tres checkpoints: RawGirl, Realism y DarkBeast. Este reentrenamiento busca una fijacion de identidad mas solida y una textura de piel mas natural.

El segundo LoRA, `mary_slim_body.safetensors`, es un acompanamiento opcional destinado a modificar la silueta corporal en tomas traseras o laterales. No se menciona el numero de imagenes de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO; el desarrollo parece enfocado exclusivamente en ajustar el aspecto visual mediante difusion.

## Capacidades

- Generacion de imagenes fotorrealistas de un personaje femenino ficticio llamado Mary (aspecto joven, rasgos suaves, pelo oscuro).
- Activacion de la identidad facial mediante la palabra clave `mary_face`, con una fuerza recomendada de 0.3 (rango util 0.2-0.5).
- Apilamiento de dos LoRAs: el facial a 0.6 + el de cuerpo delgado a 0.8, usando la misma semilla, para conseguir una silueta mas estilizada en tomas traseras o laterales.
- Optimizado para estilos fotorrealistas, iluminacion natural y luz diurna suave sobre modelos base Krea 2.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: se trata exclusivamente de un adaptador para modelos de difusion de imagenes.

## Casos de uso

- Creacion de personajes para ilustracion digital: el desarrollador puede aplicar `mary_face` con fuerza 0.3 en un pipeline Krea 2 para obtener retratos consistentes de Mary, lo que facilita la produccion de series de ilustraciones con identidad visual estable.
- Novelas visuales y juegos narrativos: generar multiples escenas y poses del mismo personaje manteniendo sus rasgos faciales. El apilamiento con `mary_slim_body` permite variar la silueta sin perder la identidad, siempre que se usen tomas traseras o laterales.
- Reference sheets para modelado 3D: producir imagenes frontales y de tres cuartos de Mary como referencia de estudio; el estilo fotorrealista y la iluminacion natural ayudan a capturar proporciones y tonos de piel.
- Contenido para redes sociales de marcas con modelos ficticios: crear imagenes de una "influencer" generada por IA sin necesidad de derechos de imagen de personas reales; la consistencia de identidad es clave en campanas publicitarias.
- Prototipado de escenas cinematograficas: explorar tomas traseras y laterales con el stack de cuerpo delgado para experimentar con composiciones alternativas antes de un rodaje real.
- Investigacion en personalizacion de modelos de difusion: el autor menciona que el LoRA facial se entreno sobre un merge de checkpoints Krea 2, por lo que puede servir como caso de estudio para analizar como los blends de modelos base afectan a la fijacion de identidad y a la calidad de piel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada por el autor; al ser un LoRA, el consumo de memoria depende del checkpoint base Krea 2 y del framework de inferencia.
- GPU recomendadas: no disponibles en la documentacion.
- Si cabe en GPU consumer: no especificado. El tamano del repositorio es de 1.4 GB, lo que sugiere que los pesos son relativamente ligeros, pero no hay cifras oficiales de VRAM.
- Opciones de despliegue: no especificadas. En el ecosistema Stable Diffusion es habitual el uso de ComfyUI, Automatic1111 o Kohya, aunque el autor no menciona ninguna herramienta concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion no incluye datos de otros modelos comparables, aunque en Civitai existen mas LoRAs y checkpoints etiquetados con `krea2` (https://civitai.com/tag/krea2), sin parametros publicados en esta ficha.

## Limitaciones y advertencias

- El modelo solo funciona correctamente sobre modelos base Krea 2; aplicarlo sobre otros checkpoints puede producir artefactos o falta de fidelidad.
- No se especifica licencia, por lo que el uso comercial no esta garantizado.
- El ajuste de fuerza es critico: fuera del rango 0.2-0.5, el LoRA facial puede generar "bleed" (fugas de rasgos) o perder la identidad.
- El LoRA de cuerpo delgado debe usarse solo en tomas traseras y laterales; en tomas frontales o si se busca una silueta curvilinea, el autor recomienda omitirlo.
- No existen evaluaciones publicadas sobre sesgos, alucinaciones visuales o seguridad del contenido generado.
- El autor solicita puntuacion en Civitai por ser un creador independiente, lo que sugiere soporte limitado y una base de usuarios pequena.

## Enlaces

- HuggingFace: https://huggingface.co/madmacs5/mary-krea2-lora
- Civitai tag krea2: https://civitai.com/tag/krea2
- Civitai Krea 2 AI Models & Generator: https://civitai.com/ecosystems/krea2
