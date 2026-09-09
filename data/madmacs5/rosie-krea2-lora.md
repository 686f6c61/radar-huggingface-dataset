# madmacs5/rosie-krea2-lora

## Resumen

El modelo `madmacs5/rosie-krea2-lora` es una LoRA (Low-Rank Adaptation) para el modelo base de generación de imágenes Krea 2, desarrollada por el autor madmacs5 (también conocido como mad_macs). No es un modelo base independiente, sino un adaptador que añade la identidad visual de un personaje ficticio llamado Rosie, descrito como irlandesa, con pelo castaño rojizo, ojos verdes y piel de porcelana. El propósito principal es lograr un control consistente de rostro y cuerpo en imágenes fotorrealistas generadas con Krea 2 y checkpoints derivados.

El repositorio tiene un tamaño de 1.4 GB e incluye dos archivos de pesos en formato safetensors: una LoRA principal de rostro (`rosie_face_v4_blend.safetensors`) y una LoRA complementaria de cuerpo esbelto (`rosie_slim_body.safetensors`). La palabra desencadenante para activar la identidad es `rosie_face`. No se proporcionan más datos sobre arquitectura interna, parámetros totales, ni especificaciones de hardware o benchmarks, por lo que la información disponible es limitada.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base Krea 2 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Krea 2 |
| Palabra desencadenante | `rosie_face` |
| Archivos incluidos | `rosie_face_v4_blend.safetensors`, `rosie_slim_body.safetensors` |
| Tamaño del repositorio | 1.4 GB |

## Arquitectura y entrenamiento

No se dispone de datos técnicos sobre la arquitectura interna de la LoRA, como el número de parámetros, la dimensión de rango o el método de entrenamiento exacto. La model card indica que la LoRA de rostro fue reentrenada desde cero sobre un modelo base Krea 2 combinado con tres checkpoints: RawGirl, Realism y DarkBeast. El objetivo de este blend era conseguir un bloqueo de identidad más preciso y una piel natural en estilos fotorrealistas. No se mencionan datos de entrenamiento, tokenización ni procesos de RLHF o DPO.

La técnica de adaptación mediante LoRA permite añadir conocimiento específico (en este caso, la identidad de Rosie) sin modificar los pesos del modelo base. Se recomienda un factor de escala de 0.3 para la LoRA de rostro, con un rango funcional entre 0.2 y 0.5. La LoRA de cuerpo esbelto es opcional y se combina con la de rostro a factores de 0.6 y 0.8 respectivamente, manteniendo la misma semilla para obtener un resultado coherente.

## Capacidades

- Generación de imágenes fotorrealistas con la identidad facial de Rosie mediante la palabra desencadenante `rosie_face`.
- Control de la fuerza de adaptación: la LoRA de rostro admite un rango recomendado de 0.2 a 0.5, con 0.3 como valor óptimo para evitar sangrado de identidad.
- Combinación de dos LoRAs independientes (rostro y cuerpo esbelto) para variar la silueta del personaje en tomas laterales o traseras.
- Estilo fotográfico natural, con iluminación de luz diurna suave, según la documentación del autor.
- No incluye capacidades de texto, tool calling, agentes o razonamiento multi-paso, al tratarse de un adaptador para generación de imágenes.
- No se declara soporte multilingüe, ya que no es un modelo de lenguaje.

## Casos de uso

- Creación de ilustraciones con personaje consistente: un artista puede fijar la identidad de Rosie en múltiples generaciones cambiando el fondo, la pose o la iluminación mediante prompts distintos, gracias a la LoRA de rostro.
- Generación de retratos fotorrealistas para narrativa visual: aprovechar el estilo natural y la luz diurna suave para producir imágenes que parezcan fotografías de un personaje ficticio realista.
- Diseño de avatares para redes sociales o videojuegos: usar la LoRA para mantener la cara del personaje en una serie de publicaciones o materiales promocionales.
- Exploración estética de variaciones corporales: combinar la LoRA de rostro con la de cuerpo esbelto en tomas de espalda o perfil para conseguir una silueta más plana, manteniendo la identidad.
- Evaluación de checkpoints base de Krea 2: probar cómo se comporta la LoRA sobre distintos modelos fusionados o derivados, ya que fue entrenada sobre un blend específico.
- Estudio de casos de fine-tuning con adaptadores: servir como ejemplo práctico de una LoRA de identidad sobre modelos de difusión, analizando la fuerza recomendada y los efectos de stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de una LoRA para generación de imágenes y no de un modelo de lenguaje, los benchmarks habituales como MMLU, HumanEval o GSM8K no aplican. No se proporcionan métricas de calidad de imagen, exactitud de identidad ni comparaciones con otros adaptadores.

## Requisitos de hardware

No se proporcionan requisitos de hardware en la documentación disponible. No consta información sobre VRAM estimada, GPUs recomendadas, opciones de despliegue, latencia ni throughput. Al ser una LoRA sobre un modelo base de difusión, es probable que requiera una GPU con VRAM suficiente para cargar el checkpoint Krea 2, pero no se puede especificar sin datos adicionales.

## Comparativa con modelos similares

No se dispone de datos para comparar este modelo con otras LoRAs de personajes o adaptadores de Krea 2. La información proporcionada no incluye tablas de rendimiento, parámetros o licencias de modelos alternativos. No disponible.

## Limitaciones y advertencias

- El personaje Rosie es ficticio y todas las imágenes generadas son creadas por IA, tal como indica el autor en la model card.
- La LoRA de rostro fue entrenada sobre un blend específico de Krea 2 (RawGirl + Realism + DarkBeast); es posible que no funcione correctamente en otros modelos base o checkpoints no relacionados.
- Usar la LoRA de rostro fuera del rango recomendado (0.2–0.5) puede provocar sangrado de identidad, artefactos visuales o pérdida de coherencia en la cara.
- La LoRA de cuerpo esbelto debe evitarse en tomas frontales si se desea una silueta curvada, ya que su uso está pensado para ángulos laterales o traseros.
- No se especifica licencia para el repositorio, lo que impide conocer si el uso comercial está permitido o si existen restricciones de redistribución.
- No consta información sobre sesgos del modelo, riesgos de alucinación visual o limitaciones de contexto, ya que no se han aportado datos de evaluación.

## Enlaces

- HuggingFace: https://huggingface.co/madmacs5/rosie-krea2-lora
- Civitai tag krea2: https://civitai.com/tag/krea2
- Civitai tag lora: https://civitai.com/tag/lora
