# RunningHubAI/rh-3c-lora

## Resumen

rh-3c-lora es un adaptador LoRA de text-to-image publicado por RunningHubAI (cuenta de la plataforma RunningHub) en nombre del autor identificado como @青苹果. No es un modelo completo: es un fichero de pesos de 316 MiB (`flux2-3c数码精修.safetensors`) que se aplica sobre el modelo base Flux2-Klein-9B, según declara la propia model card en el campo "Finetuned from". Su propósito, deducido del nombre del fichero —"3c数码精修", esto es, retoque de productos de electrónica de consumo (ordenadores, comunicaciones y electrónica)—, es orientar la generación hacia acabados de fotografía de producto de tipo estudio.

El interés práctico del repositorio es limitado pero concreto: permite reproducir un estilo de retoque comercial dentro de ComfyUI o en la nube de RunningHub sin reentrenar el modelo base, con un coste de almacenamiento mínimo. Sin embargo, la documentación publicada es prácticamente inexistente (la descripción del modelo es la palabra "Good"), no se declara licencia, no se especifican parámetros de inferencia ni palabra de activación, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

La información disponible no incluye arquitectura detallada del adaptador, dataset de entrenamiento, número de pasos, rango del LoRA ni ejemplos de resultados, por lo que esta ficha se limita a lo verificable y marca explícitamente como "no disponible" todo aquello que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; la arquitectura interna del adaptador y del base no se detalla en la información disponible |
| Parámetros totales | No disponible (adaptador LoRA de 316 MiB; no se indica el recuento de parámetros ni el rango) |
| Longitud de contexto | No aplica (modelo de imagen); la ventana de condicionamiento depende del codificador de texto del modelo base, no documentada |
| Tipos de cuantización | No disponible; los pesos se distribuyen únicamente en safetensors. Las cuantizaciones aplicables serían las del modelo base Flux2-Klein-9B, no confirmadas en la información |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card remite a la licencia del proyecto original o de nivel superior (Flux2-Klein-9B) |
| Formato de pesos | safetensors (LoRA) |
| Modelo base | Flux2-Klein-9B (9B parámetros según su denominación) |
| Tamaño del repositorio | 0,3 GB (fichero único de 316 MiB) |
| Pipeline declarado | text-to-image |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creación / actualización | 2026-10-23 / 2026-10-23 (metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin alterar los pesos originales. Se aplica sobre Flux2-Klein-9B, un modelo de difusión de la familia FLUX con 9B parámetros según su nombre; la información proporcionada no incluye la arquitectura exacta del base (tipo de transformer de difusión, codificador de texto empleado, resolución nativa) ni el punto de inyección del adaptador dentro de la red.

No se han publicado datos de entrenamiento: ni número de imágenes, ni composición del dataset, ni resolución, ni pasos, ni hiperparámetros del LoRA (rango, alpha, tasa de aprendizaje), ni si hubo procesos de refinamiento por preferencias. La model card únicamente indica que el modelo se ha entrenado en la plataforma RunningHub y enlaza a su página de entrenamiento. Tampoco se documenta una palabra de activación (trigger word) ni una escala de aplicación recomendada, lo que obliga a calibrar ambos parámetros empíricamente en cada flujo de trabajo.

## Capacidades

- Generación de imágenes de producto de electrónica de consumo con acabado de retoque comercial, según la denominación del fichero ("3c数码精修") y la etiqueta text-to-image; no hay ejemplos publicados que lo verifiquen.
- Modificación del estilo del modelo base Flux2-Klein-9B mediante adaptación de bajo rango, preservando el resto de capacidades generativas del base.
- Integración nativa en flujos de ComfyUI (etiqueta `comfyui` del repositorio) y ejecución en la plataforma RunningHub, incluida su API.
- Condicionamiento por prompt textual: la calidad y el idioma del prompt dependen del codificador de texto del modelo base, no documentado en esta ficha.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, uso como agente, entrada de visión o audio: no disponible / no aplica.
- Capacidades multilingües: no disponible.

## Casos de uso

- Retoque de fotografía de producto de electrónica de consumo: aplicar el LoRA sobre Flux2-Klein-9B en ComfyUI para homogeneizar iluminación, reflejos y acabado de imágenes de móviles, portátiles o auriculares destinadas a fichas de e-commerce.
- Generación de imágenes principales (hero images) para catálogos: partiendo de un render 3D o de una foto base, generar variantes con estética de estudio sin sesión fotográfica, siempre con revisión humana por el riesgo de artefactos en logotipos y geometría.
- Variantes de color y acabado de un mismo dispositivo: mantener un estilo coherente entre acabados (negro, plata, azul) generando cada variante con la misma configuración de prompt, semilla y escala del adaptador.
- Coherencia visual de campañas: usar el adaptador como capa de estilo común en un pipeline por lotes para que todas las imágenes de una misma campaña compartan tratamiento de luz y fondo.
- Pruebas de concepto de dirección de arte: generar rápidamente propuestas de bodegón de producto antes de encargar fotografía o render final, con coste de GPU mínimo al tratarse de un adaptador de 316 MiB.
- Automatización vía API de RunningHub: integrar el flujo de ComfyUI con el adaptador en un servicio que reciba una foto de producto y devuelva una versión retocada, útil para equipos sin infraestructura de GPU propia.
- Prototipado de material para marketplaces: producir imágenes de relleno o borradores de listing cuando aún no se dispone de fotografía definitiva, marcadas como no definitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se incluyen métricas de calidad de imagen (FID, CLIP score, similitud perceptual), comparativas con el modelo base sin adaptador ni galería de ejemplos que permita una evaluación cualitativa.

## Requisitos de hardware

- VRAM del adaptador: despreciable; el fichero LoRA ocupa 316 MiB y se carga junto al modelo base.
- VRAM del modelo base: no publicada. Estimación a partir del recuento de 9B parámetros (no confirmada por el autor): en bf16, unos 18 GB solo para los pesos del transformer, más codificador de texto y VAE; en FP8, en torno a 9-10 GB; en GGUF Q8, unos 9-10 GB; en Q4, en torno a 5-6 GB. Estas cifras son cálculos derivados del tamaño, no datos oficiales.
- GPU profesionales: A100 (40/80 GB) y H100 (80 GB) son adecuadas para bf16 con margen para lotes y resolución alta; H200 o configuraciones multi-GPU no están documentadas para este adaptador.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) es el mínimo razonable para bf16; con 16 GB (RTX 4080, 4070 Ti Super) es previsible que haya que recurrir a FP8 o GGUF, extremo no verificado.
- Despliegue: ComfyUI es la vía indicada por el autor; también la plataforma RunningHub (nube y API). Diffusers sería viable si el base está soportado, pero no se documenta. vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-3c-lora | LoRA text-to-image | No disponible (adaptador de 316 MiB) | Flux2-Klein-9B | No aplica | No disponible | Hugging Face, ComfyUI, RunningHub; 0 descargas |
| Flux2-Klein-9B | Modelo de difusión completo | 9B (según denominación) | No aplica | No aplica | No disponible en la información | Referenciado como base; disponible por sus canales originales |
| Otras LoRA de retoque de producto de electrónica | LoRA text-to-image | No disponible | Diversos | No aplica | No disponible | No se han identificado alternativas comparables en la información disponible |

## Limitaciones y advertencias

- Documentación mínima: la descripción del modelo es la palabra "Good"; no hay instrucciones de uso, palabra de activación, escala de LoRA recomendada, semillas de ejemplo ni galería de resultados.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que impide contrastar calidad o estabilidad del adaptador.
- Licencia no declarada: la model card remite a la licencia del proyecto original (Flux2-Klein-9B). Antes de un uso comercial es imprescindible verificar los términos del modelo base y del material de entrenamiento, que no se documentan.
- Riesgo de sobreajuste al dataset privado del autor: al desconocerse la composición de los datos, no puede estimarse la generalización a otros tipos de producto, iluminaciones o encuadres.
- Riesgo de alucinación visual: los modelos de difusión pueden deformar geometría de dispositivos, inventar puertos, alterar logotipos o generar texto ilegible en pantallas y serigrafías. No es aceptable como material publicitario sin revisión humana.
- Posible conflicto de marcas: generar imágenes de productos identificables puede vulnerar derechos de marca o de diseño; el adaptador no incluye salvaguardas documentadas al respecto.
- Idiomas y sesgos del modelo base no documentados; el comportamiento con prompts en castellano no está verificado.
- Metadatos del repositorio con fecha 2026-10-23 y sin historial de versiones, lo que impide conocer la evolución del adaptador.
- Al ser un LoRA, cualquier cambio en el modelo base (versión, cuantización, codificador de texto) puede alterar o degradar el efecto del adaptador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-3c-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2045154976195944449
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1906743421258674178
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-3c-lora/blob/main/README_cn.md
- Modelo base referenciado: Flux2-Klein-9B (sin enlace oficial incluido en la información disponible)
