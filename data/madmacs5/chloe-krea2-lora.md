# madmacs5/chloe-krea2-lora

## Resumen

Este modelo es un LoRA (Low-Rank Adaptation) de personaje para el modelo de generación de imágenes Krea 2. Ha sido desarrollado por el creador madmacs5 y su propósito es mantener de forma consistente la identidad visual de un personaje ficticio llamado Chloe, que se describe con pelo rubio platino, ojos azules brillantes, piel ligeramente bronceada y una constitución atlética y esbelta.

El problema que resuelve es el de la variabilidad en la representación de un personaje a lo largo de múltiples generaciones. Al ser una adaptación de bajo rango, no modifica el modelo base completo, sino que introduce pesos ligeros que se aplican en tiempo de inferencia para controlar la identidad del personaje y ciertos rasgos corporales opcionales. El repositorio tiene un tamaño de 1.4 GB y contiene dos archivos de pesos en formato safetensors: uno dedicado a la cara/identidad (el principal) y otro complementario para un cuerpo más delgado.

El modelo resulta relevante para creadores de contenido visual, ilustradores y diseñadores que necesiten un personaje fiel y repetible en diferentes escenas, evitando así procesos de redibujado o generación manual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptación de bajo rango (LoRA) sobre un modelo base de generación de imágenes Krea 2 |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos archivos: chloe_face_v4_blend.safetensors y chloe_slim_body.safetensors) |
| Tamaño del repositorio | 1.4 GB |

## Arquitectura y entrenamiento

El modelo se presenta como una adaptación de bajo rango (LoRA), una técnica que congela el modelo base y entrena matrices de baja dimensión que se añaden a las capas del modelo de difusión. En este caso, el modelo base es Krea 2, y el ajuste se centra en la representación de un personaje concreto. Según la información del autor, el LoRA de cara fue reentrenado desde cero sobre una combinación de tres bases Krea 2 (RawGirl + Realism + DarkBeast) para lograr un mejor bloqueo de identidad y una piel más natural. No se dispone de detalles adicionales sobre el número de tokens, la composición del dataset ni procesos de alineamiento como RLHF o DPO, ya que no se especifican en la documentación disponible.

## Capacidades

- Generación de imágenes fotorrealistas del personaje Chloe, con características faciales y corporales controlables.
- Control de identidad mediante la palabra de activación (trigger word) `chloe_face`.
- Combinación de dos LoRAs simultáneos: el principal de cara/identidad y un segundo opcional de cuerpo esbelto.
- Ajuste de la fuerza de aplicación en el rango recomendado de 0.2 a 0.5 para la cara, y de 0.6 (cara) junto a 0.8 (cuerpo) cuando se apilan ambos LoRAs.
- Efecto específico en tomas traseras y laterales cuando se usa el LoRA de cuerpo, reduciendo el volumen trasero para una silueta más plana.
- Compatibilidad declarada con modelos base Krea 2, especialmente en estilos fotorrealistas con luz natural y luz suave de día.

## Casos de uso

- Ilustración de novelas visuales: el LoRA permite generar múltiples escenas con la misma protagonista, manteniendo sus rasgos faciales estables a lo largo de la historia. Es adecuado porque el trigger word y la fuerza recomendada proporcionan un buen equilibrio entre fidelidad y naturalidad.
- Diseño de personajes para videojuegos indie: los desarrolladores pueden crear hojas de concepto de un personaje femenino concreto, variando poses, ángulos y vestuario sin perder la identidad. El LoRA de cuerpo complementario aporta flexibilidad para distintos tipos de figura.
- Prototipado en producción audiovisual: en fases de preproducción, se pueden generar imágenes de referencia de una actriz virtual para decidir casting de dobles digitales. La consistencia entre tomas simplifica la validación visual.
- Contenido para redes sociales: creadores que gestionan una cuenta con una "mascota" o avatar femenino pueden producir publicaciones periódicas sin repetir la misma imagen, gracias a la capacidad de generar variaciones coherentes del mismo personaje.
- Creación de cómics digitales: los autores pueden dibujar viñetas con el mismo personaje en diferentes paneles, usando el LoRA como base y luego incorporando el estilo de entintado que deseen. El bloqueo de identidad reduce la necesidad de corregir manualmente cada viñeta.
- Generación de ilustraciones para campañas de ejemplo: agencias que necesiten una modelo ficticia para presentar conceptos de moda pueden generar imágenes consistentes del mismo peinado y rasgos en distintas prendas y ambientes, ahorrando tiempo respecto a sesiones de fotografía reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que depende del modelo base Krea 2 y de la resolución de salida.
- GPU recomendadas: no disponible. Sin datos concretos del modelo base, no se puede especificar un hardware mínimo.
- Compatibilidad con GPU de consumo: no disponible. No se indica si el modelo funciona en GPUs de gama media o baja.
- Opciones de despliegue: el modelo se distribuye como safetensors y puede integrarse en herramientas de difusión que admitan LoRAs, como aplicaciones de generación por difusión o espacios de demostración del propio ecosistema de Krea 2. No se proporcionan recomendaciones específicas de software en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa técnica con modelos similares. Se ha mencionado en la búsqueda web la existencia de un LoRA denominado Kroma Krea 2, pero se trata de un ajuste de estilo, no de personaje, y no se aportan datos de rendimiento ni comparaciones directas. Por tanto, esta sección queda como no disponible.

## Limitaciones y advertencias

- El personaje es completamente ficticio y todas las imágenes generadas son creaciones por IA; no debe utilizarse para representar a personas reales.
- La licencia del modelo no está especificada, por lo que no se garantiza que sea apto para uso comercial.
- La información sobre el entrenamiento es parcial: se desconoce el tamaño del dataset, su composición y si existen sesgos derivados de las imágenes utilizadas.
- El LoRA funciona mejor sobre modelos base Krea 2, como advierte el autor; usarlo sobre otros modelos base puede degradar la calidad o no activar el efecto deseado.
- El control del cuerpo mediante el LoRA complementario está pensado para tomas traseras y laterales; en tomas frontales puede interferir con la estética deseada, según las notas del autor.
- La fuerza de aplicación debe ajustarse con cuidado: valores fuera del rango recomendado pueden provocar "sangrado" de identidad o pérdida de naturalidad.
- No se han publicado benchmarks, métricas objetivas ni evaluaciones de sesgo, por lo que el rendimiento real en tareas concretas debe validarse de forma empírica.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/madmacs5/chloe-krea2-lora
- Demostración de un LoRA de Krea 2 (Kroma) en un Space de Hugging Face: https://huggingface.co/spaces/hugging-apps/kroma-krea2-lora-demo
- Archivo general de LoRAs de Krea 2 en Hugging Face: https://huggingface.co/k2loras/krea2-lora-archive/tree/main/2026-07-28/Krea-2
