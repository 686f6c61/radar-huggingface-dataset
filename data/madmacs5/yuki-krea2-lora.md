# madmacs5/yuki-krea2-lora

## Resumen

Yuki — Krea 2 Character LoRA es una adaptación de bajo rango (LoRA) desarrollada por el usuario mad_macs (madmacs5 en HuggingFace) para el modelo de generación de imágenes Krea 2. Añade un personaje ficticio de rasgos japoneses y cabello oscuro llamado Yuki, con el objetivo de fijar la identidad facial en las imágenes generadas. El repositorio en HuggingFace contiene dos archivos: un LoRA facial principal (`yuki_face_v4_blend.safetensors`) y un LoRA complementario para cuerpo delgado (`yuki_slim_body.safetensors`), ambos en formato safetensors. El repositorio ocupa 1.4 GB. El modelo se activa mediante el trigger word `yuki_face` y funciona mejor con modelos base Krea 2. Es relevante para artistas digitales y creadores que necesitan consistencia de personaje en proyectos de ficción o ilustración, ya que permite controlar la identidad en múltiples generaciones con un ajuste fino de la fuerza.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base Krea 2 |
| Parámetros totales | no disponible (tamaño del repositorio: 1.4 GB) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un LoRA, una adaptación de bajo rango sobre los pesos congelados de Krea 2, que permite inyectar una identidad visual específica sin reentrenar el modelo base. Según el autor, el LoRA facial fue reentrenado desde cero sobre una mezcla de modelos base Krea 2 (RawGirl + Realism + DarkBeast merge) para conseguir un bloqueo de identidad más preciso y una textura de piel más natural. No se proporcionan detalles sobre el tamaño del conjunto de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros. Tampoco se indica si se utilizaron técnicas de ajuste adicionales como RLHF o DPO, que no aplican en este tipo de modelo.

El segundo archivo, `yuki_slim_body.safetensors`, es un LoRA complementario que modifica la silueta corporal. Se recomienda apilarlo con el LoRA facial usando fuerzas de 0.6 y 0.8 respectivamente, manteniendo la misma semilla, para escenas de espalda, trasero o perfil. En tomas frontales o cuando se desea una silueta más curvada, este LoRA debe omitirse.

## Capacidades

- Generación de retratos fotorrealistas de un personaje ficticio con rasgos japoneses y cabello oscuro.
- Control de identidad facial mediante el trigger word `yuki_face`.
- Ajuste fino de la intensidad del LoRA en un rango recomendado de 0.2 a 0.5, con un valor óptimo de 0.3, para equilibrar el bloqueo de identidad y evitar que la identidad se mezcle con otros elementos de la imagen.
- LoRA complementario para cuerpo delgado que permite generar tomas de espalda, trasero o perfil con una silueta más esbelta.
- Compatibilidad declarada con modelos base Krea 2 y con algunos checkpoints de Civitai que no requieren trigger word según la página de la comunidad.
- Estilo fotográfico con iluminación natural y luz diurna suave, orientado a resultados realistas.
- No admite generación de texto, tool calling ni razonamiento multi-paso, al tratarse de un modelo de difusión.

## Casos de uso

- Ilustración de personajes para novelas visuales: el LoRA permite mantener la misma cara del personaje en todas las escenas generadas, lo que reduce la inconsistencia de identidad habitual en modelos de difusión.
- Diseño conceptual para videojuegos: la consistencia de identidad facilita la creación de variantes de un personaje en diferentes poses y ángulos sin perder los rasgos definidos.
- Prototipado de campañas de marketing: un personaje ficticio puede utilizarse como mascota o modelo en diferentes entornos publicitarios, generando imágenes coherentes con la misma identidad.
- Creación de datasets sintéticos: investigadores pueden generar conjuntos de imágenes de un mismo personaje para entrenar otros modelos de control de identidad o sistemas de generación condicionada.
- Exploración creativa de estilo fotorrealista: los usuarios pueden combinar el LoRA con ajustes de iluminación natural y composición para experimentar con retratos y escenas de cuerpo completo.
- Generación de imágenes de cuerpo completo: apilando el LoRA facial y el de cuerpo delgado se pueden producir tomas de espalda o perfil con una silueta más esbelta, manteniendo la identidad facial en escenarios donde el rostro no es protagonista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de evaluaciones estándar como FID, CLIP score, ni comparaciones con otros LoRAs de personajes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 1.4 GB corresponde únicamente a los pesos del LoRA, no al modelo base Krea 2.
- GPU recomendadas: no disponible. No se especifican requisitos de hardware por parte del autor.
- Compatibilidad con GPU de consumo: no disponible. La página de Civitai ofrece generación en la nube, lo que sugiere que el modelo base puede ejecutarse sin necesidad de hardware extremo, pero no se confirman requisitos locales.
- Opciones de despliegue: no disponible. No se indica compatibilidad específica con ComfyUI, Automatic1111, vLLM ni otros frameworks de difusión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se ha encontrado información de modelos comparables en la documentación disponible. En el ecosistema Krea 2 de Civitai existen otros LoRAs de personajes, pero no se proporcionan datos técnicos suficientes para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Este modelo está diseñado exclusivamente para generación de imágenes. No es un modelo de lenguaje y no admite texto, tool calling ni razonamiento.
- El personaje es completamente ficticio y generado por IA. Cualquier parecido con personas reales es puramente coincidencia.
- Está optimizado para modelos base Krea 2 y puede funcionar de forma incorrecta o degradada con otros checkpoints.
- Fuera del rango de fuerza recomendado (0.2–0.5 para el LoRA facial), la identidad puede sufrir fugas, artefactos o pérdida de consistencia.
- No se especifica licencia de uso en el repositorio de HuggingFace. Para cualquier uso comercial, es necesario consultar con el autor.
- Existe riesgo de heredar sesgos del modelo base Krea 2 y del conjunto de entrenamiento del LoRA, aunque no se han documentado sesgos concretos.
- La falta de información sobre el proceso de entrenamiento (número de imágenes, pasos, validación) impide evaluar la fiabilidad del modelo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/madmacs5/yuki-krea2-lora
- Página del modelo en Civitai: https://civitai.red/models/2682282/yuki-japanese-girl
- Ecosistema Krea 2 en Civitai: https://civitai.com/ecosystems/krea2
- El autor menciona la disponibilidad de más LoRAs en su página de Ko-fi dentro del texto de Civitai, pero no se proporciona una URL directa en la información disponible.
