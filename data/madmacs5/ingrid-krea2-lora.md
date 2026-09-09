# madmacs5/ingrid-krea2-lora

## Resumen

Este repositorio contiene una pareja de LoRAs (Low-Rank Adaptation) diseñados para el modelo de difusión de imágenes Krea 2. Desarrollado por madmacs5, el conjunto permite generar al personaje ficticio Ingrid, descrito como una «elfa regia» con rasgos nórdicos, pelo claro y piel clara. El LoRA principal, `ingrid_face_v4_blend.safetensors`, se centra en la identidad facial, mientras que el LoRA opcional `ingrid_slim_body.safetensors` ajusta la silueta corporal en tomas específicas. El modelo se activa mediante el trigger word `ingrid_face`. La relevancia del proyecto radica en su enfoque en la consistencia de identidad y el estilo fotorrealista, aunque su licencia no está especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA aplicado a un modelo de difusión de imágenes (Krea 2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una pareja de LoRAs: el archivo `ingrid_face_v4_blend.safetensors` codifica los rasgos faciales e identitarios de Ingrid, y `ingrid_slim_body.safetensors` modifica la silueta corporal. Según la model card, el LoRA facial fue reentrenado desde cero sobre una base Krea 2 fusionada (RawGirl + Realism + DarkBeast merge) para lograr un mejor bloqueo de identidad y un aspecto de piel natural. No se proporcionan detalles sobre el número de pasos de entrenamiento, la composición del dataset ni procedimientos de alineación (RLHF/DPO), y no se conocen datos sobre el volumen de tokens utilizados.

## Capacidades

- Generación de imágenes fotorrealistas del personaje Ingrid con estilo de iluminación natural y luz diurna suave.
- Preservación de la identidad facial mediante el trigger word `ingrid_face`, con intensidad recomendada entre 0.2 y 0.5.
- Combinación modulable con el LoRA de cuerpo delgado (`ingrid_slim_body.safetensors`) para tomas de espalda, trasero o laterales, manteniendo la misma semilla al apilar ambos LoRAs.
- Funcionamiento óptimo sobre modelos base Krea 2, con una estética fotorrealista y de luz suave.
- No dispone de capacidades de texto, tool calling, razonamiento simbólico o soporte para agentes, al ser exclusivamente un modelo de generación de imágenes.
- La variación de fuerza del LoRA de cara permite controlar el equilibrio entre identidad y artefactos visuales (bleed).

## Casos de uso

- Ilustración de personajes para juegos de rol de mesa: el LoRA permite generar retratos consistentes de Ingrid para manuales, fichas de personaje o material de campaña, reduciendo el tiempo de creación de arte.
- Concept art para videojuegos: durante la fase de preproducción, se pueden producir variaciones del personaje manteniendo un diseño facial estable, lo que agiliza el desarrollo visual.
- Creación de contenido para redes sociales: el personaje puede usarse como imagen de marca en publicaciones de temática fantástica, con apariencia homogénea entre distintas imágenes.
- Narrativa visual para cómics o webcomics: la consistencia facial facilita la generación de viñetas que presentan al mismo personaje en diferentes escenas y ángulos.
- Generación de avatares para comunidades virtuales: los usuarios pueden crear avatares con la apariencia del personaje, aprovechando el trigger word y la combinación de LoRAs de cuerpo.
- Campañas de marketing de marcas ficticias: una figura con identidad visual clara puede servir de embajadora virtual en anuncios digitales, siempre que se verifique la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 1.4 GB, lo que corresponde al peso combinado de los dos archivos `.safetensors` y otros posibles ficheros.
- No se dispone de datos sobre VRAM mínima estimada para inferencia.
- El requisito real de VRAM lo impone el modelo base Krea 2, que no se ha cuantificado en la información proporcionada.
- No se especifican GPUs recomendadas ni datos de latencia o throughput.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, TGI, etc.), ya que se trata de un LoRA para difusión y no de un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs de personajes para Krea 2 en los resultados de búsqueda. Por tanto, no se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- No se especifica ninguna licencia, por lo que no se puede determinar si el uso comercial está permitido ni bajo qué términos se puede redistribuir o modificar.
- El modelo ha sido entrenado sobre una base fusionada (RawGirl + Realism + DarkBeast merge), lo que puede introducir sesgos estéticos no documentados.
- Pueden aparecer alucinaciones visuales o inconsistencias al utilizar fuerzas altas en el LoRA de cara (por encima de 0.5), según indica el propio autor.
- El acceso al entrenamiento de LoRAs de Krea 2 está limitado en beta a suscriptores Max y Business, según el blog oficial de Krea. Esto puede restringir la reproducibilidad del entrenamiento o el uso fuera de la plataforma.
- No hay datos disponibles sobre la seguridad del contenido generado, políticas de contenido o medidas de protección contra el mal uso de la identidad generada.
- Al tratarse de un personaje ficticio, no hay riesgos de derechos de imagen reales, pero el modelo podría ser utilizado para crear imágenes sintéticas de apariencia realista sin verificación adicional.

## Enlaces

- https://huggingface.co/madmacs5/ingrid-krea2-lora
- https://www.krea.ai/blog/krea-2-lora-training
- https://huggingface.co/models?search=krea2
