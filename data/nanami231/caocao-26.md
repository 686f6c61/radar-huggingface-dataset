# Nanami231/caocao-26

## Resumen

`Nanami231/caocao-26` es un adaptador LoRA de tipo DreamBooth para el modelo de generación de imágenes Krea 2, desarrollado por el usuario Nanami231 y publicado en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo base autónomo, sino de un ajuste fino de bajo rango que se carga sobre el modelo Krea 2 (entrenado sobre `krea/Krea-2-Raw` y pensado para usarse en inferencia con `krea/Krea-2-Turbo`). Su función es inyectar un concepto visual concreto invocable mediante el token `Hong@nh26`.

El repositorio ocupa 1,7 GB y contiene únicamente los pesos del adaptador LoRA en formato compatible con la librería `diffusers`, junto con tres imágenes de muestra. El modelo se publicó el 13 de noviembre de 2026 y, en el momento de redactar esta ficha, acumula 13 descargas y ningún "like", lo que indica un uso muy incipiente y una validación comunitaria prácticamente nula.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el flujo habitual de personalización de modelos text-to-image modernos mediante LoRA sobre arquitecturas de difusión de nueva generación (Krea 2), con inferencia en pocos pasos (8 steps) y `guidance_scale=0.0`, lo que sugiere un modelo base destilado o de tipo turbo. No hay información pública sobre el dataset de entrenamiento, la arquitectura interna del modelo base ni métricas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Krea 2; arquitectura del base no disponible |
| Parámetros totales | no disponible (adaptador LoRA; tamaño del repo 1,7 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; longitud de prompt no especificada) |
| Tipos de cuantización | no disponible (pesos del adaptador; el base admite `bfloat16` según el ejemplo) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / formato `diffusers` para LoRA (compatible con `load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth entrenado sobre `krea/Krea-2-Raw`, el checkpoint "raw" del modelo Krea 2. Según la model card, el entrenamiento se realizó con la técnica DreamBooth, que asocia un token raro (`Hong@nh26`) a un concepto o sujeto concreto para permitir su invocación posterior en prompts. No se especifica el número de imágenes de entrenamiento, el número de pasos, el rango del LoRA, la tasa de aprendizaje ni la composición del dataset.

Las muestras se generaron con el adaptador cargado sobre `krea/Krea-2-Turbo` (no sobre el checkpoint Raw con el que se entrenó), usando 8 pasos de inferencia y `guidance_scale=0.0`. Este detalle es técnicamente relevante: indica que el modelo base Turbo funciona sin classifier-free guidance, un patrón típico de modelos destilados para inferencia rápida. No hay información sobre si se aplicó regularización, captions automáticas o aumento de datos.

## Capacidades

- Generación de imágenes text-to-image condicionada por prompt en lenguaje natural.
- Inyección de un concepto específico mediante el token de activación `Hong@nh26`.
- Compatibilidad con la pipeline `Krea2Pipeline` de `diffusers`.
- Inferencia rápida en modo Turbo (8 pasos, `guidance_scale=0.0`).
- Composición de escenas complejas (ciudades cyberpunk, interiores, paisajes submarinos) según los ejemplos publicados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- **Personalización de marca o estilo visual**: cargar el LoRA sobre Krea 2 Turbo para generar imágenes consistentes con un concepto concreto (personaje, objeto o estética) invocándolo con `Hong@nh26` en cada prompt, útil para campañas o prototipado visual rápido.
- **Generación de arte conceptual en iteración rápida**: gracias a los 8 pasos de inferencia del modo Turbo, se pueden producir varias variantes de una escena (por ejemplo, una calle cyberpunk con un tigre blanco) en segundos para explorar direcciones creativas.
- **Pruebas de integración en pipelines `diffusers`**: sirve como ejemplo mínimo de cómo cargar un LoRA de terceros con `pipe.load_lora_weights()` en un flujo de generación de imágenes basado en Python.
- **Prototipado de assets para videojuegos o narrativa visual**: generar fondos y escenarios (balcones mediterráneos, reinos submarinos) con un estilo coherente derivado del concepto entrenado.
- **Investigación sobre personalización con DreamBooth+LoRA**: útil como caso de estudio de bajo coste (1,7 GB) para analizar cómo se comporta un LoRA entrenado en Raw e inferido en Turbo.
- **Generación de imágenes para maquetas y presentaciones**: producir ilustraciones de apoyo para documentos o demos internas, siempre que se respete la licencia Apache 2.0 y se validen los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; depende enteramente del modelo base Krea 2. El adaptador LoRA en sí ocupa 1,7 GB en disco y añade una sobrecarga mínima de memoria en inferencia.
- **GPU recomendadas**: no especificadas por el autor. El ejemplo de código usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU con soporte bfloat16 (Ampere o superior: RTX 30xx/40xx, A100, H100).
- **Compatibilidad con GPU de consumo**: no confirmada; dependerá de los requisitos del modelo base Krea 2 Turbo, no documentados en esta ficha.
- **Opciones de despliegue**: `diffusers` con `Krea2Pipeline`. No se documenta soporte para vLLM (no aplica), llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles; el autor indica 8 pasos de inferencia en modo Turbo, pero sin tiempos medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA o modelos comparables de la misma categoría, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- **Validación comunitaria nula**: 13 descargas y 0 "likes" en el momento de la ficha; no hay evidencia de calidad más allá de las tres muestras del autor.
- **Dependencia del modelo base**: el LoRA no funciona de forma autónoma; requiere descargar Krea 2 (Raw o Turbo), cuyos requisitos de hardware y licencia deben verificarse por separado.
- **Falta de documentación de entrenamiento**: no se detallan dataset, hiperparámetros ni rango del LoRA, lo que dificulta reproducir o auditar el adaptador.
- **Riesgo de sobreajuste al concepto**: al ser un DreamBooth con token raro, puede degradar la diversidad de las generaciones o "contaminar" prompts no relacionados.
- **Sesgos**: no documentados; los modelos text-to-image pueden reproducir sesgos de género, etnia o cultura presentes en sus datos de entrenamiento.
- **Alucinación visual**: posible en anatomía, texto en imagen y coherencia espacial, especialmente en composiciones complejas.
- **Licencia**: Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base Krea 2 puede estar sujeto a condiciones adicionales que deben consultarse.
- **Idioma**: los ejemplos están en inglés; no se garantiza un comportamiento óptimo con prompts en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanami231/caocao-26
- Modelo base (Raw): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (Turbo, usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Documentación de `diffusers`: https://huggingface.co/docs/diffusers
