# imogenai/kendra-krea

## Resumen

imogenai/kendra-krea es un adaptador LoRA de tipo DreamBooth para el modelo de generación de imágenes Krea 2, desarrollado por el usuario imogenai y publicado en HuggingFace. No se trata de un modelo completo, sino de un peso adicional que se carga sobre un modelo base —concretamente krea/Krea-2-Raw— para introducir un concepto o identidad concreto, invocado mediante el token `kendra_krea`. El repositorio ocupa 0,8 GB y se distribuye bajo licencia Apache 2.0.

El modelo resuelve un problema acotado y muy habitual en flujos de trabajo de difusión: fijar un sujeto consistente (una persona, personaje o estilo) sin necesidad de reentrenar el modelo completo. El autor indica que el LoRA fue entrenado sobre Krea 2 RAW y que las muestras publicadas se generaron sobre Krea 2 Turbo con solo 8 pasos de inferencia y `guidance_scale=0.0`, lo que apunta a un uso orientado a generación rápida.

Su relevancia es limitada y muy específica: es un adaptador de nicho, con cero descargas y cero "likes" en el momento de la consulta, pensado para quien ya trabaja con la familia Krea 2 a través de `diffusers`. No aporta arquitectura nueva ni método de entrenamiento novedoso; su interés radica en la integración con Krea 2 y en servir como ejemplo reproducible de DreamBooth-LoRA sobre esa base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusión texto-a-imagen Krea 2 |
| Parámetros totales | no disponible (el repositorio ocupa 0,8 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión texto-a-imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (depende del codificador de texto del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado; compatible con `diffusers` y plantilla `sd-lora` |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de LoRA aplicado a un modelo de difusión: se insertan matrices de bajo rango en las capas del modelo base y solo esos pesos adicionales se entrenan y se distribuyen. El autor describe el método como DreamBooth-LoRA, es decir, un ajuste personalizado sobre unas pocas imágenes de referencia para asociar el concepto al token disparador `kendra_krea`. El entrenamiento se realizó sobre Krea 2 RAW, mientras que las muestras mostradas en la model card se generaron con Krea 2 Turbo.

No se especifican en la información disponible el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango (rank) del LoRA, el alpha, ni si se aplicaron técnicas de regularización o de aumento de datos. Tampoco se documenta la composición del dataset ni si hubo fases de refinamiento posteriores. El pipeline de uso documentado emplea `Krea2Pipeline` con `torch_dtype=torch.bfloat16`, 8 pasos de inferencia y `guidance_scale=0.0`, cargando los pesos mediante `pipe.load_lora_weights()`.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el token `kendra_krea`.
- Reproducción de una identidad o concepto consistente a través de distintos estilos, escenas y encuadres (las muestras incluyen un retrato ciberpunk, una pintura al óleo y una escena espacial).
- Transferencia de estilo aparente: las muestras combinan el sujeto con estéticas muy distintas (`cinematic`, `oil painting`, `wide shot`), lo que sugiere cierta capacidad de generalización del concepto.
- Integración directa con el ecosistema `diffusers` mediante `load_lora_weights`.
- Compatibilidad declarada con el modelo base krea/Krea-2-Raw y con Krea 2 Turbo como modelo de inferencia.
- Sin soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusión).
- Sin capacidades de audio, vídeo ni 3D documentadas en la información disponible.
- Capacidad multilingüe: no disponible; dependerá del codificador de texto del modelo base.

## Casos de uso

- Creación de personaje consistente para narrativa visual: usar `kendra_krea` en cada prompt permite mantener la misma identidad a lo largo de una serie de ilustraciones, algo útil en cómics, storyboards o novelas ilustradas.
- Producción de variaciones de estilo sobre un mismo sujeto: el adaptador permite renderizar el mismo concepto como retrato cinematográfico, pintura tradicional o escena de ciencia ficción sin reentrenar.
- Pruebas de concepto rápidas con Krea 2 Turbo: con 8 pasos y `guidance_scale=0.0`, sirve para iterar prompts y encuadres con bajo coste computacional antes de lanzar una generación final de mayor calidad.
- Pipelines de generación automatizada en `diffusers`: al cargarse con `load_lora_weights`, puede integrarse en scripts de Python que generen lotes de imágenes con el concepto fijado.
- Material promocional o de marca personal: si el concepto representa a una persona o mascota de marca, el LoRA permite generar activos coherentes para campañas sin sesiones fotográficas adicionales.
- Investigación y docencia sobre personalización de difusión: sirve como ejemplo práctico y reproducible de DreamBooth-LoRA sobre una base Krea 2, útil para estudiar el efecto del token disparador y del rank.
- Exploración artística de bajo rango: al ser un adaptador ligero (0,8 GB de repositorio), es adecuado para experimentar con composición de múltiples LoRA en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La VRAM necesaria no está documentada y depende íntegramente del modelo base Krea 2, no del adaptador; no disponible como cifra concreta.
- El adaptador LoRA en sí añade una sobrecarga marginal sobre el modelo base, ya que solo introduce pesos de bajo rango y `diffusers` los fusiona o aplica en tiempo de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada; dependerán de los requisitos oficiales de Krea 2 y Krea 2 Turbo.
- Compatibilidad con GPU de consumo: no disponible; el código de ejemplo usa `torch.bfloat16` y `.to("cuda")`, lo que sugiere ejecución en GPU, pero no se especifica el mínimo.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` es la vía documentada. Alternativas como ComfyUI, Automatic1111, vLLM, llama.cpp, Ollama o TGI no se mencionan y, en el caso de las dos últimas, no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles como cifras; el único dato indirecto es que las muestras se generaron con 8 pasos de inferencia en Krea 2 Turbo, lo que indica un régimen de baja latencia.

## Comparativa con modelos similares

No se dispone de datos verificables de otros adaptadores comparables en la información proporcionada. La comparación más directa posible es frente al propio modelo base, con los datos disponibles:

| Modelo | Tipo | Modelo base | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| imogenai/kendra-krea | LoRA DreamBooth | krea/Krea-2-Raw | Apache 2.0 | no disponible |
| krea/Krea-2-Raw | Modelo de difusión completo | no aplica | no disponible | no disponible |
| krea/Krea-2-Turbo | Modelo de difusión completo | no disponible | no disponible | no disponible |

Comparativas con adaptadores de la misma categoría (por ejemplo, LoRA de personaje para otras familias de difusión) no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al ser un LoRA entrenado sobre un conjunto de imágenes no especificado, puede heredar y reforzar los sesgos presentes en esas imágenes y en el modelo base.
- Riesgo de alucinación visual: inherente a los modelos de difusión; el concepto puede deformarse en posturas, iluminaciones o composiciones alejadas de las vistas durante el entrenamiento.
- Limitación de vocabulario: el concepto solo se activa con el token exacto `kendra_krea`; variaciones del token no están documentadas.
- Limitación de contexto: no aplica en el sentido de ventana de tokens, pero la fidelidad del concepto decae en escenas muy cargadas o con múltiples sujetos.
- Idiomas: no disponibles; el comportamiento multilingüe depende del codificador de texto de Krea 2.
- Licencia: Apache 2.0 en el adaptador, pero el uso comercial puede verse condicionado por la licencia del modelo base krea/Krea-2-Raw, no especificada en la información disponible. Conviene verificar la licencia de la base antes de un despliegue comercial.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin validación comunitaria ni resultados de benchmarks publicados.
- Producción: no hay garantías de estabilidad, soporte ni mantenimiento por parte del autor.
- Metadatos incompletos: faltan rango del LoRA, pasos de entrenamiento, dataset y número de imágenes, lo que dificulta reproducir o auditar el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imogenai/kendra-krea
- Modelo base en HuggingFace: https://huggingface.co/krea/Krea-2-Raw
- Modelo de inferencia empleado en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Suite oficial de Krea: https://www.krea.ai/
- Guía de uso de Krea 2 (2026): https://tech-insider.org/how-to-use-krea-2-ai-image-generator-2026/
- Análisis de la suite Krea AI (2026): https://aiunpacking.com/review/krea-ai/
- Agregador de modelos con soporte de Krea: https://kenerateai.com/ai-image-generator
