# madmacs5/zara-krea2-lora

## Resumen

El modelo `madmacs5/zara-krea2-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el creador independiente mad_macs para el modelo de generación de imágenes Krea 2 de Krea AI. Su propósito es permitir la generación de un personaje ficticio llamado Zara, con rasgos de identidad específicos: pelo oscuro, piel cálida y complexión curvilínea. El adaptador se activa mediante la palabra de disparo `zara_face` y está diseñado para producir imágenes fotorrealistas con iluminación natural.

El paquete incluye dos archivos en formato safetensors: un LoRA principal de identidad facial y un LoRA opcional de cuerpo delgado. Su peso total es de 1.4 GB, lo que indica un tamaño considerable para un adaptador de imagen, probablemente debido a múltiples capas entrenadas sobre el modelo base. El modelo solo es compatible con la familia Krea 2 o con merges derivados de ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion (Krea 2) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de dos adaptadores LoRA que modifican el comportamiento del modelo base Krea 2. El LoRA principal, `zara_face_v4_blend.safetensors`, se entrenó desde cero sobre una mezcla de modelos base Krea 2 (RawGirl + Realism + DarkBeast) con el objetivo de lograr un anclaje de identidad facial más nítido y una reproducción natural de la textura de la piel. El segundo LoRA, `zara_slim_body.safetensors`, es un adaptador complementario opcional que permite modificar la silueta del cuerpo en tomas de espalda, laterales o poses que muestren la parte trasera, sin afectar a las tomas frontales.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de imagen y el autor no ha publicado ese nivel de especificación.

## Capacidades

- Generación de imágenes fotorrealistas del personaje ficticio Zara.
- Control de identidad facial mediante la palabra de disparo `zara_face`, con intensidad recomendada de 0.3 (rango 0.2–0.5).
- Apilamiento opcional de dos LoRAs: el de cara a 0.6 y el de cuerpo delgado a 0.8, usando la misma semilla para mantener coherencia.
- Estilo visual enfocado en fotografía realista, iluminación suave y luz natural de día.
- Compatibilidad con el modelo base Krea 2 y con merges que lo utilicen como base.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, puesto que es un adaptador para difusión de imágenes.

## Casos de uso

- Ilustración de personajes para narrativa ficticia: el LoRA permite mantener una identidad visual consistente de Zara a lo largo de múltiples ilustraciones, útil para novelas gráficas o webcómics.
- Concept art para videojuegos: los artistas pueden generar rápidamente variaciones del mismo personaje en diferentes poses y ángulos sin perder rasgos faciales.
- Prototipado de diseño de personajes: el control fino de intensidad y la opción de apilar el LoRA de cuerpo permiten explorar distintas siluetas en fase de diseño.
- Generación de retratos para mundos de fantasía en redes sociales: creadores de contenido pueden producir imágenes coherentes de un personaje de ficción con iluminación natural.
- Investigación sobre adaptación de identidad con LoRAs: el modelo sirve como ejemplo práctico de entrenamiento de identidad sobre una base combinada de tres modelos distintos.
- Experimentación artística en fotografía sintética: se puede usar para estudiar cómo los adaptadores LoRA controlan rasgos físicos específicos en modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas objetivas de calidad, fidelidad o consistencia de identidad para este LoRA, por lo que no es posible compararlo numéricamente con otros adaptadores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para este LoRA. En general, los modelos Krea 2 de difusión requieren entre 12 y 24 GB de VRAM para una generación completa.
- GPU recomendadas: no se han facilitado requisitos concretos. Para uso local, se recomiendan GPUs de gama alta como RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: es probable que funcione en tarjetas de gama media como RTX 3060 o 4070, pero la experiencia dependerá de la resolución y del tiempo de inferencia.
- Opciones de despliegue: el modelo puede cargarse en interfaces de difusión que soporten LoRAs, como ComfyUI o el AUTOMATIC1111 WebUI, así como en la plataforma Civitai.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa técnica con otros LoRAs de personaje. Existen numerosos adaptadores de este tipo publicados en Civitai, pero no se han encontrado especificaciones comparables en los resultados de búsqueda.

## Limitaciones y advertencias

- El LoRA solo funciona sobre el modelo base Krea 2 o sobre merges que lo incluyan; no es compatible con otros modelos de difusión.
- El personaje Zara es completamente ficticio, por lo que no debe asociarse con ninguna persona real.
- La licencia no está especificada, lo que implica un riesgo legal para su uso comercial.
- El autor no ha publicado información sobre sesgos, artefactos de generación ni limitaciones de calidad en ciertos ángulos.
- El uso combinado del LoRA de cuerpo delgado puede alterar la coherencia del personaje si se aplica en tomas frontales, según las propias notas del autor.
- Los resultados de generación dependen en gran medida de las semillas, la intensidad elegida y el resto de parámetros del pipeline.

## Enlaces

- HuggingFace: https://huggingface.co/madmacs5/zara-krea2-lora
- Civitai (ecosistema Krea 2): https://civitai.com/ecosystems/krea2
