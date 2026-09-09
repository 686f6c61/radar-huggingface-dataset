# madmacs5/katrina-krea2-lora

## Resumen

El modelo `katrina-krea2-lora` es un LoRA de bajo rango (Low-Rank Adaptation) creado por el desarrollador independiente mad_macs (publicado en HuggingFace como `madmacs5`). Está diseñado para añadir a la generación de imágenes un personaje ficticio llamado Katrina, una mujer rusa de complexión atlética y pelo oscuro, sobre la base del modelo de difusión Krea 2.

El propósito principal es el control de identidad: permite generar múltiples imágenes fotorrealistas del mismo rostro, manteniendo una coherencia visual y evitando el «sangrado» del personaje cuando se ajusta la fuerza del LoRA. El repositorio incluye dos adaptadores: uno de cara/identidad y otro opcional de cuerpo delgado, que puede apilarse con el primero para cambiar el tipo de silueta.

El modelo es relevante ahora porque Krea 2 es una base reciente y popular para creación de imágenes de alta calidad fotorrealista. La solución se distribuye en formato safetensors y el repositorio ocupa 1.4 GB. Al ser un LoRA, no dispone de contexto lingüístico ni de parámetros de modelo de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`.safetensors`) |
| Tamano del repositorio | 1.4 GB |
| Palabra clave (trigger word) | `katrina_face` |
| Modelo base | Krea 2 |

## Arquitectura y entrenamiento

El componente principal es un LoRA de identidad, entrenado desde cero sobre una mezcla de bases Krea 2: `RawGirl + Realism + DarkBeast`. El autor indica explícitamente que el LoRA facial fue reentrenado con esta fusión para mejorar el bloqueo de identidad y la reproducción natural de la piel. El segundo adaptador, `katrina_slim_body.safetensors`, es un LoRA complementario opcional que modifica la silueta del personaje.

El mecanismo de aplicación sigue el estándar de los LoRA de difusión: se cargan como adaptadores sobre los pesos del modelo base, sin modificar el checkpoint original. La fuerza recomendada para el LoRA facial es de 0.3, con un rango válido de 0.2 a 0.5. Para el LoRA de cuerpo delgado, se sugiere apilarlo con el facial usando fuerzas de 0.6 y 0.8 respectivamente, manteniendo la misma semilla. No se han proporcionado datos sobre el número de imágenes de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de imágenes fotorrealistas del personaje Katrina con identidad facial coherente.
- Ajuste fino de la fuerza del LoRA para controlar la fidelidad de la identidad y el sangrado.
- Apilado de dos LoRA mediante el mismo seed para obtener variaciones de cuerpo (slim body frente a silhouette curvada).
- Compatibilidad declarada con modelos base Krea 2 y estilos fotorrealistas, iluminación natural y luz diurna suave.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento, al tratarse de un modelo de generación de imágenes.

## Casos de uso

- Creación de retratos de personajes para campañas de publicidad digital: el LoRA permite mantener el mismo rostro en distintas tomas, variando la pose y la luz. Una fuerza de 0.3 proporciona coherencia sin artefactos de sangrado.
- Ilustración de personajes para novelas visuales o cómics: el control de identidad facilita generar múltiples viñetas del mismo personaje con el mismo estilo visual.
- Diseño de personajes para videos, juegos o producción audiovisual: el LoRA puede servir como referencia rápida de casting virtual, generando variaciones de físico y vestimenta.
- Generación de contenido para redes sociales con una estética consistente: permite producir una serie de imágenes del mismo personaje para mantener una identidad visual reconocible.
- Exploración de variaciones de tipo corporal mediante el apilado con `katrina_slim_body`: útil para comparar siluetas antes de fijar un diseño final.
- Pruebas de estilo en composiciones de fotografía generativa: el usuario puede ajustar la fuerza del LoRA entre 0.2 y 0.5 para calibrar el nivel de influencia sobre el estilo base de Krea 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los requisitos reales de VRAM dependen del modelo base Krea 2, no del LoRA en sí.
- El LoRA es un fichero de bajo peso (el repositorio completo pesa 1.4 GB) y se carga sobre el checkpoint base.
- Se estima que se necesita una GPU con al menos 8 GB de VRAM para generar imágenes a resoluciones 1024x1024 o inferiores.
- Para resoluciones mayores, lotes grandes o generación con alta precisión, se recomienda una GPU con 16 GB de VRAM o superior.
- El despliegue se realiza mediante herramientas de difusión que soporten LoRA, como ComfyUI, AUTOMATIC1111 o las pipelines de Diffusers de Hugging Face.
- No se dispone de datos oficiales de latencia ni de throughput para este LoRA.

## Comparativa con modelos similares

No se dispone de datos técnicos suficientes para una comparación rigurosa. Existen otros LoRA para Krea 2 en plataformas como Tensor.Art, por ejemplo `Katrina Kaif - Krea2`, pero se desconoce su arquitectura, parámetros, licencia y rendimiento. La comparación no es posible con los datos disponibles.

## Limitaciones y advertencias

- La licencia del modelo no está especificada en el repositorio, lo que genera incertidumbre jurídica para uso comercial.
- No se proporcionan datos sobre el conjunto de entrenamiento ni sobre posibles sesgos de género o etnia en el personaje generado.
- El modelo solo funciona correctamente sobre el modelo base Krea 2; puede no ser compatible con otras bases de difusión.
- Aunque el autor recomienda fuerzas concretas, hay riesgo de sangrado de identidad si se usa una fuerza demasiado alta (por encima de 0.5).
- El LoRA de cuerpo delgado puede producir resultados no deseados en tomas frontales o cuando se busca mantener una silueta curvada.
- Al ser un modelo de generación de imágenes, puede producir artefactos visuales o alucinaciones de detalles no presentes en la entrada.
- El autor declara que se trata de un personaje ficticio y que todas las imágenes son generadas por IA; no se garantiza la ausencia de similitudes con personas reales.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/madmacs5/katrina-krea2-lora)
- [Krea 2 AI Models & Generator en Civitai](https://civitai.com/ecosystems/krea2)
- [LoRA similar «Katrina Kaif - Krea2» en Tensor.Art](https://tensor.art/models/1018551112262806967)
