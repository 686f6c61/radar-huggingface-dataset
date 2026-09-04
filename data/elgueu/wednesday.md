# Elgueu/wednesday

## Resumen
Elgueu/wednesday es un adaptador LoRA (Low-Rank Adaptation) para el modelo de texto a imagen Krea 2, creado por el usuario Elgueu. Se trata de un ajuste fino de tipo DreamBooth que introduce un concepto visual específico, activable mediante el token "ortegawednesday". El adaptador está entrenado sobre la variante Krea 2 RAW y se muestra funcionando sobre Krea 2 Turbo, según la model card.

El repositorio ocupa 0.8 GB y se distribuye bajo licencia Apache 2.0. Al ser un LoRA, no funciona de forma autónoma: necesita cargarse sobre el modelo base Krea 2 mediante el pipeline de Diffusers. Su utilidad principal es generar imágenes coherentes de un personaje concreto en distintos estilos (gótico, cyberpunk, pintura al óleo) sin reentrenar el modelo completo.

No se dispone de información sobre el número de parámetros del adaptador, la longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 (pipeline de difusión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento
El modelo es un LoRA (Low-Rank Adaptation) aplicado a un pipeline de difusión de la familia Krea 2. Los LoRA modifican un subconjunto de los pesos del modelo base mediante matrices de bajo rango, lo que permite ajustar el modelo a un concepto nuevo con un coste computacional reducido. En este caso, el ajuste se ha realizado con la técnica DreamBooth, tal como indica la model card.

El entrenamiento se realizó sobre Krea 2 RAW, y las muestras incluidas se generaron con Krea 2 Turbo a 8 pasos de inferencia y guidance_scale 0.0. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el número de pasos. Tampoco se mencionan innovaciones técnicas específicas más allá del uso del pipeline estándar de Diffusers.

## Capacidades
- Generación de imágenes a partir de prompts de texto mediante el pipeline Krea2Pipeline de Diffusers.
- Activación de un concepto específico mediante el token "ortegawednesday", que produce representaciones coherentes del personaje.
- Compatibilidad con múltiples estilos visuales: las muestras incluyen retrato gótico, escena cyberpunk y pintura al óleo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de generación de imágenes.
- Capacidades multilingües: no disponibles.

## Casos de uso
- Arte conceptual para personajes de ficción: el LoRA permite generar variaciones de un personaje en diferentes entornos y estilos, lo que resulta útil para diseñadores de videojuegos o ilustradores que necesitan explorar propuestas visuales de forma rápida.
- Contenido para redes sociales: creadores pueden producir imágenes consistentes de un personaje para publicaciones, evitando la variabilidad de un modelo general y manteniendo una identidad visual reconocible.
- Campañas de marketing creativo: el token de activación permite generar una serie de imágenes promocionales con el mismo sujeto, facilitando la coherencia en materiales gráficos.
- Prototipado de escenas: el modelo puede generar escenas detalladas (por ejemplo, un cementerio victoriano) a partir de prompts simples, sin necesidad de ajustar complejas combinaciones de palabras clave.
- Exploración artística personal: artistas pueden experimentar con estilos como ciberpunk o pintura al óleo manteniendo la misma figura, lo que ayuda a estudiar cómo un personaje se adapta a diferentes estéticas.
- Integración en pipelines de generación con Diffusers: se puede cargar junto con Krea 2 Turbo en un entorno de producción para generar imágenes bajo demanda, tal como muestra el código de ejemplo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- No se han publicado requisitos de hardware específicos para este adaptador.
- Al ser un LoRA, el consumo de VRAM es el del modelo base Krea 2 (Raw o Turbo) más un pequeño overhead del adaptador.
- El código de ejemplo utiliza torch.bfloat16 y carga el modelo en CUDA, por lo que se requiere una GPU compatible con PyTorch.
- El número de pasos de inferencia en las muestras es de 8, lo que sugiere un rendimiento razonable en GPUs de consumo si el modelo base lo permite.
- Opciones de despliegue: se puede usar con Diffusers en Python. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la misma categoría (LoRA para Krea 2) en los datos proporcionados.

## Limitaciones y advertencias
- Es un adaptador, no un modelo autónomo: requiere el modelo base Krea 2 (Raw o Turbo) para generar imágenes.
- El concepto solo se activa con el token "ortegawednesday"; si no se usa, el LoRA no tiene efecto.
- Riesgo de alucinación: como en todo modelo generativo, puede producir artefactos visuales, inconsistencias anatómicas o detalles no deseados.
- La licencia Apache 2.0 permite uso comercial, pero la licencia del modelo base Krea 2 no está especificada en la información disponible, por lo que hay que revisarla antes de un despliegue comercial.
- No hay información sobre sesgos, limitaciones de idioma ni restricciones de uso adicionales.

## Enlaces
- HuggingFace: https://huggingface.co/Elgueu/wednesday
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Krea 2 Turbo (mencionado en la model card): https://huggingface.co/krea/Krea-2-Turbo
