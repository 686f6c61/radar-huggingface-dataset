# jorgeelfer/sd-v1-4-oldbookillustrations-lora

## Resumen

`jorgeelfer/sd-v1-4-oldbookillustrations-lora` es un adaptador LoRA de bajo rango entrenado sobre el modelo de difusión `CompVis/stable-diffusion-v1-4` para transferir el estilo visual de los grabados e ilustraciones de libros antiguos a la generación texto-a-imagen. Lo publica el usuario jorgeelfer como proyecto de la asignatura "Modelos de Generación de Imagen", y se apoya en el dataset `gigant/oldbookillustrations` (4153 ilustraciones con captions en la columna `info_alt`).

No se trata de un modelo de lenguaje ni de un modelo fundacional nuevo: es un conjunto de pesos LoRA (r = 16, alpha = 16) inyectados en las capas de atención (`to_q`, `to_k`, `to_v`, `to_out.0`) de la UNet de Stable Diffusion 1.4, que permanece congelada. El resultado es un adaptador de estilo ligero que se carga sobre el checkpoint base con `pipe.load_lora_weights(...)` en diffusers, o como LoRA en interfaces como AUTOMATIC1111 o ComfyUI.

Su relevancia es acotada y de carácter educativo: ilustra el flujo completo de entrenamiento de un LoRA de estilo (preprocesado a 512 px, 2500 pasos con batch 4 en una Tesla T4 de Colab, AdamW con lr 1e-4 y scheduler warmup + cosine en fp16). No hay evaluación cuantitativa publicada, el repositorio figura con 0.0 GB y cero descargas, y el autor ofrece además una versión con el LoRA fusionado en los pesos del modelo (`jorgeelfer/sd-v1-4-oldbookillustrations-full`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Stable Diffusion v1-4 (UNet con atención cross-modal, VAE y text encoder CLIP congelados) |
| Parametros totales | No disponible para el adaptador; el repositorio contiene únicamente los pesos LoRA (r = 16, alpha = 16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (generación texto-a-imagen); el autor no documenta límites de longitud de prompt |
| Tipos de cuantizacion | No disponible (no se documentan variantes fp16/fp32/int8 ni GGUF) |
| Idiomas soportados | No disponible (el dataset usa captions en la columna `info_alt`, sin especificar idioma) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | No confirmado en la model card; la librería declarada es `diffusers` y el tamaño del repositorio figura como 0.0 GB, por lo que no se puede verificar que los pesos estén subidos |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de LoRA para difusión: se congelan los pesos del modelo base (`CompVis/stable-diffusion-v1-4`) y se entrenan matrices de descomposición de bajo rango (r = 16, alpha = 16) en las proyecciones `to_q`, `to_k`, `to_v` y `to_out.0` de las capas de atención de la UNet. Con ese rango y esas capas, el número de parámetros entrenables es una fracción muy pequeña del total del modelo base, lo que explica que el entrenamiento cupiera en una única GPU de consumo-profesional (Tesla T4 de Google Colab) en fp16 con precisión mixta.

Los datos proceden del dataset `gigant/oldbookillustrations`: 4153 ilustraciones, con la imagen en la columna `1600px` y el texto descriptivo en `info_alt`. El preprocesado consistió en redimensionar el lado corto a 512 píxeles, aplicar CenterCrop a 512x512 y flip horizontal aleatorio como aumento de datos. El entrenamiento se ejecutó durante 2500 pasos con batch de 4 (unas 10 000 imágenes procesadas, aproximadamente 2,4 épocas sobre el dataset), optimizador AdamW con learning rate 1e-4 y scheduler warmup + cosine. La model card incluye una curva de pérdida (`curva_loss.png`) pero no publica sus valores numéricos, y no se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo por otra parte ajeno a un LoRA de estilo.

## Capacidades

- Generación texto-a-imagen con estética de grabado e ilustración de libro antiguo (rayado fino, tramado, paleta monocroma o sepia, composición decimonónica).
- Transferencia de estilo sobre el checkpoint base SD 1.4 sin reentrenar la UNet completa, con un adaptador de muy pocos megabytes.
- Carga y descarga del adaptador en runtime mediante `load_lora_weights` / `unload_lora_weights` de diffusers, lo que permite alternar estilos en un mismo pipeline.
- Compatibilidad con el ecosistema Stable Diffusion 1.x: schedules de sampler habituales (Euler, DPM-Solver, DDIM), `guidance_scale` y `num_inference_steps` configurables (el ejemplo del autor usa 30 pasos y escala 7.5).
- Disponibilidad de una variante con el LoRA ya fusionado (`sd-v1-4-oldbookillustrations-full`) para despliegues que no soporten carga dinámica de adaptadores.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": son capacidades ajenas a este tipo de modelo.
- No se documenta composición con otros LoRA (por ejemplo, LoRA de personaje o de control), aunque el formato lo permitiría técnicamente.

## Casos de uso

- Ilustración editorial de ambientación histórica: generar viñetas y grabados de época para portadas o interior de libros, artículos y revistas, usando el LoRA sobre SD 1.4 para obtener el trazo y la textura del grabado sin encargar ilustración manual.
- Creación de material para proyectos de humanidades digitales: producir ilustraciones sintéticas con estética de archivo para acompañar exposiciones, catálogos o divulgación sobre libros antiguos, manteniendo coherencia visual entre piezas.
- Prototipado rápido de concepto visual en videojuegos o narrativa interactiva: generar bocetos de escenarios, objetos y personajes con aire decimonónico antes de encargar el arte final.
- Aumento de datasets de estilo: usar el adaptador para generar variaciones controladas que amplíen un corpus de grabados con fines de investigación en visión por computador o para entrenar clasificadores de estilo.
- Docencia y materiales formativos sobre fine-tuning: sirve como ejemplo reproducible y de bajo coste (T4 de Colab, 2500 pasos) para explicar LoRA, preprocesado de imágenes y evaluación cualitativa de modelos generativos.
- Pruebas de concepto en pipelines de diseño gráfico: integrar la generación en un flujo automatizado (diffusers en Python) que produzca banners, texturas de fondo o ilustraciones de relleno con estilo homogéneo para maquetas.
- Experimentación artística personal: explorar mezclas de prompt y semillas para composiciones tipo "A robot reading a newspaper in a cafe" con acabado de grabado, como en el ejemplo de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una curva de pérdida de entrenamiento (`curva_loss.png`) sin valores numéricos, y no hay evaluación con FID, CLIP score, comparación humana ni pruebas de fidelidad al estilo. Tampoco se han encontrado referencias externas en la búsqueda web.

## Requisitos de hardware

- VRAM para inferencia: no documentada por el autor. Como referencia del modelo base SD 1.4 en fp16, el pipeline completo (UNet + VAE + text encoder) suele ocupar del orden de 4-5 GB de VRAM; el LoRA añade solo unos pocos megabytes. Cifra estimada, no verificada en esta ficha.
- GPU validadas para entrenamiento: Tesla T4 (16 GB) en Google Colab, según la model card.
- GPU compatibles para inferencia: cualquier GPU con al menos ~6 GB de VRAM en fp16 (por ejemplo GTX 1660 Ti, RTX 3060, RTX 4060); en RTX 3090/4090 o A100/H100 sobra capacidad y se puede aumentar resolución o batch.
- Cabe en GPU de consumo: sí, previsiblemente a partir de 6-8 GB de VRAM en fp16 con resolución nativa de 512x512.
- Opciones de despliegue: `diffusers` (flujo documentado por el autor), AUTOMATIC1111 / Forge, ComfyUI, InvokeAI o SD.Next como LoRA de estilo. No aplican vLLM, TGI, llama.cpp ni Ollama, que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del sampler, del número de pasos (el ejemplo usa 30) y del hardware; no hay mediciones publicadas.
- Advertencia de despliegue: el repositorio figura con 0.0 GB de tamaño, por lo que conviene verificar que los pesos estén realmente disponibles antes de integrarlo en un pipeline.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd-v1-4-oldbookillustrations-lora | LoRA de estilo sobre SD 1.4 | No disponible (adaptador de bajo rango, r = 16) | 512x512 nativo (resolución de entrenamiento) | CreativeML OpenRAIL-M | HuggingFace, 0 descargas, 0 likes |
| CompVis/stable-diffusion-v1-4 (base) | Modelo texto-a-imagen completo | No disponible en la información | 512x512 nativo | CreativeML OpenRAIL-M | Ampliamente disponible |
| sd-v1-4-oldbookillustrations-full | SD 1.4 con el LoRA fusionado | No disponible en la información | 512x512 nativo | CreativeML OpenRAIL-M | HuggingFace, misma autoría |

No se dispone de datos en la información proporcionada para comparar con otros LoRA de estilo de ilustración antigua (por ejemplo adaptadores sobre SDXL o Flux): parámetros, contexto efectivo y rendimiento de esos modelos figuran como no disponibles. Tampoco existen métricas comparativas (FID, CLIP score, preferencia humana) para este adaptador.

## Limitaciones y advertencias

- No hay ninguna evaluación cuantitativa ni cualitativa publicada: se desconoce la fidelidad real al estilo y la tasa de acierto por prompt.
- El dataset es pequeño (4153 imágenes) y homogéneo, por lo que el adaptador puede sobreajustar a composiciones y motivos concretos del corpus y repetirlos ante prompts diversos.
- Sesgo de dominio: el corpus de ilustraciones de libros antiguos refleja la iconografía, los temas y los estereotipos de la producción editorial histórica (predominio de escenas occidentales, religiosas, mitológicas o de género), que el LoRA puede reproducir y amplificar.
- Limitaciones heredadas de SD 1.4: resolución nativa de 512x512, problemas con anatomía (manos, extremidades), renderizado de texto legible y coherencia en escenas con muchos objetos; la ampliación a resoluciones mayores requiere upscalers externos.
- Riesgo de alucinación visual: el modelo puede generar elementos anacrónicos o detalles incoherentes pese al estilo de época solicitado, sin que exista mecanismo de verificación.
- Idiomas: no se documenta qué idioma usan los captions de entrenamiento; la calidad con prompts en castellano no está garantizada y lo habitual en SD 1.4 es obtener mejores resultados en inglés.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero impone restricciones de uso (prohibición de usos dañinos, difamatorios, ilegales o de vigilancia) y obliga a propagar la licencia y sus restricciones a los usuarios downstream. Conviene revisar el texto completo antes de explotarlo en producción.
- El LoRA se apoya en el checkpoint base de CompVis, cuyos filtros de seguridad y comportamiento en contenido sensible no se han reevaluado tras el ajuste de estilo.
- Estado del repositorio: 0 descargas, 0 likes, tamaño 0.0 GB y fecha de creación anómala (2026-10-23). Verificar la integridad y existencia de los ficheros de pesos antes de cualquier integración; si el repositorio está vacío, el flujo documentado fallará en `load_lora_weights`.
- Proyecto académico sin mantenimiento declarado ni versión documentada; no hay guía de citación ni informe técnico asociado.

## Enlaces

- Modelo LoRA en HuggingFace: https://huggingface.co/jorgeelfer/sd-v1-4-oldbookillustrations-lora
- Versión con el LoRA fusionado: https://huggingface.co/jorgeelfer/sd-v1-4-oldbookillustrations-full
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Resultados de la búsqueda web: no se han encontrado enlaces técnicos, papers, blogs ni demos relevantes para este modelo; los resultados devueltos por la búsqueda no guardan relación con el contenido de la ficha y se han descartado.
