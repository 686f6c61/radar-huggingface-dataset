# madmacs5/mayumi-krea2-lora

## Resumen

Mayumi — Krea 2 Character LoRA es un adaptador de bajo rango (LoRA) desarrollado por el creador independiente mad_macs, diseñado para generar imágenes fotorrealistas de un personaje ficticio llamado Mayumi, con rasgos japoneses, cabello oscuro y complexión delgada. El modelo se apoya en la arquitectura de difusión Krea 2 como base, y se presenta como una solución de personalización de identidad para entornos de generación de imágenes.

El repositorio contiene dos adaptadores safetensors: un LoRA de rostro/identidad (`mayumi_face_v4_blend.safetensors`) y un LoRA secundario de cuerpo delgado (`mayumi_slim_body.safetensors`). El primero es el principal y se activa mediante la palabra clave `mayumi_face`, con una fuerza recomendada de 0.3. El segundo permite variaciones de complexión en vistas traseras o laterales.

Este proyecto resulta relevante para artistas digitales y desarrolladores que experimentan con personalización de modelos de difusión, ya que demuestra el uso de LoRAs combinados sobre una base mezclada (RawGirl + Realism + DarkBeast) para lograr un bloqueo de identidad más preciso. No es un modelo autónomo: requiere el modelo base Krea 2 para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) para modelo de difusion |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA para modelos de difusión de imágenes, no de un modelo base. El LoRA de rostro fue retrenado desde cero sobre una mezcla de bases Krea 2 (RawGirl + Realism + DarkBeast merge) para mejorar el bloqueo de identidad y la textura natural de la piel. El conjunto incluye dos adaptadores independientes: uno dedicado al rostro y otro a la complexión corporal, que pueden apilarse en el mismo proceso de generación.

El modelo se activa mediante la palabra clave `mayumi_face`. Las recomendaciones del autor indican una fuerza de 0.3 para el LoRA facial (con rango usable de 0.2 a 0.5) y una combinación de 0.6 para el rostro con 0.8 para el cuerpo delgado en tomas traseras o laterales. No se han publicado datos sobre el número de imágenes de entrenamiento, pasos de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de imágenes fotorrealistas del personaje Mayumi, con rasgos japoneses, cabello oscuro y complexión delgada.
- Preservación de identidad facial mediante el trigger word `mayumi_face`, con control fino de la fuerza para evitar contaminación visual.
- Variación de complexión corporal mediante el LoRA secundario `mayumi_slim_body`, pensado para vistas traseras o laterales.
- Compatibilidad con modelos base Krea 2 y mezclas personalizadas de dicha base.
- Estilo fotorrealista, iluminación natural y luz diurna suave.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multietapa ni generación de texto.

## Casos de uso

- Ilustración de personajes recurrentes para novelas visuales: al usar el trigger `mayumi_face` con fuerza 0.3, un ilustrador puede mantener la consistencia facial del mismo personaje a lo largo de múltiples escenas.
- Concept art de personajes ficticios para videojuegos o animación: el LoRA de cuerpo delgado permite generar variaciones de diseño para tomas de perfil o espalda, aportando flexibilidad sin perder identidad.
- Fotografía sintética para narrativa visual: el modelo produce retratos con iluminación natural y estilo realista, adecuados para portafolios artísticos o storyboards con un personaje definido.
- Generación de avatares consistentes para redes sociales o foros: se puede configurar un pipeline en ComfyUI o Automatic1111 que genere múltiples imágenes del mismo personaje con distintos encuadres.
- Investigación en personalización de modelos de difusión: la combinación de dos LoRAs apilados (rostro + cuerpo) con fuerzas distintas es un caso práctico para estudiar interacciones entre adaptadores.
- Creación de contenido para juegos de rol por escrito: el generador puede producir ilustraciones de apoyo para una campaña de rol, manteniendo la apariencia de la personaje en cada sesión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el LoRA en sí requiere menos de 1 GB adicional sobre el modelo base Krea 2. La inferencia completa en fp16 suele necesitar entre 8 y 12 GB de VRAM según el tamaño del modelo base y las optimizaciones.
- GPU recomendadas: una RTX 3060 de 12 GB es suficiente para generación básica; una RTX 4090 o superior permite tiempos de inferencia más cortos y mayor resolución.
- Puede ejecutarse en GPUs de consumo con 8 GB de VRAM aplicando técnicas de reducción de memoria (p. ej., xformers, atención por trozos).
- Opciones de despliegue: ComfyUI, AUTOMATIC1111/Forge, Stable Diffusion WebUI y entornos compatibles con safetensors.
- Latencia y throughput: no se dispone de datos publicados; dependen de la GPU, la resolución, los pasos de muestreo y el modelo base.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro de la misma categoría. Se trata de un LoRA de personaje de nicho, sin datos técnicos publicados que permitan una comparación fiable.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona con modelos base Krea 2 o mezclas basadas en Krea 2.
- La licencia no está especificada, por lo que el uso comercial es incierto y requiere consulta directa con el autor.
- El personaje es ficticio; todas las imágenes generadas son sintéticas y no representan a personas reales.
- No se han publicado datos de entrenamiento, métricas de calidad ni resultados de evaluación, lo que limita la reproducibilidad.
- Usar fuerzas fuera del rango recomendado (especialmente superiores a 0.5 en el LoRA facial) puede provocar artefactos visuales o contaminación de la identidad.
- La información se limita a la descripción del autor; no existe documentación técnica adicional sobre el proceso de entrenamiento ni sobre la composición del dataset.

## Enlaces

- HuggingFace: https://huggingface.co/madmacs5/mayumi-krea2-lora
- El model card menciona la plataforma Civitai como destino de previsualizaciones, pero no se proporciona una URL concreta.
