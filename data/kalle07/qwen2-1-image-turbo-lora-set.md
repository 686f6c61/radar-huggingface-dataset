# kalle07/qwen2.1-image-turbo-lora-set

## Resumen

`kalle07/qwen2.1-image-turbo-lora-set` es un conjunto de LoRAs extraídos del modelo de difusión Qwen-Image-2.1 y su variante acelerada Qwen-Image-2.1-Turbo, publicado por el usuario kalle07 en Hugging Face. No se trata de un modelo generativo completo, sino de un paquete de adaptadores de bajo rango (LoRA) en formato `safetensors` pensado para su uso dentro de ComfyUI mediante los nodos KJ. El objetivo es permitir la generación de imágenes con el modelo base en tan solo 6-10 pasos y con CFG fijado a 1, lo que reduce de forma notable el coste computacional de la inferencia.

El repositorio incluye tres variantes de rango (32, 64 y 128), todas en precisión `bf16`. Según el autor, el rango 32 es el más pequeño y solo revela diferencias menores respecto al modelo original, mientras que los rangos 64 y 128 son muy similares entre sí y se aproximan mucho al LoRA de rango 178 extraído directamente desde ComfyUI. El paquete ocupa 1,1 GB y está etiquetado como `diffusion-single-file`, orientado a flujos de generación de imagen.

La relevancia de este conjunto radica en que ofrece una vía práctica para acelerar la inferencia de Qwen-Image-2.1 en entornos de consumo, manteniendo un compromiso controlado entre fidelidad y velocidad. No obstante, la información pública disponible es escasa: no hay datos de benchmarks, idiomas soportados ni pipeline declarado, y la licencia es la `qwen-research` del modelo base, con las restricciones que ello implica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelo de difusión Qwen-Image-2.1 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible; pesos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other") |
| Formato de pesos | safetensors |
| Rangos incluidos | 32, 64 y 128 |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo, Qwen/Qwen-Image-2.1 |
| Tamaño del repositorio | 1,1 GB |
| Pasos de inferencia recomendados | 6-10 |
| CFG recomendado | 1 |
| Librería | diffusion-single-file |
| Herramienta de extracción | Nodos KJ de ComfyUI |

## Arquitectura y entrenamiento

El paquete no es un modelo entrenado desde cero, sino una extracción de LoRAs a partir de los pesos de Qwen-Image-2.1 y Qwen-Image-2.1-Turbo. La extracción se realizó con los nodos KJ de ComfyUI, una herramienta habitual para aislar adaptadores de bajo rango a partir de diferencias entre checkpoints. Se generaron tres variantes de rango (32, 64 y 128) en `bf16`, lo que permite al usuario elegir entre un adaptador más ligero y otro con mayor capacidad de representación.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo etapas de RLHF o DPO, ya que se trata de una extracción y no de un entrenamiento supervisado documentado. La innovación principal es la reducción del número de pasos de muestreo a 6-10 con CFG 1, lo que sugiere que los LoRAs están destilados o alineados con el comportamiento del modelo Turbo para permitir una generación rápida sin classifier-free guidance. El autor indica además que el rango 64 y el 128 son muy similares y cercanos al rango 178 original de ComfyUI, lo que implica que el rango 32 es el que introduce mayores diferencias respecto al modelo base.

## Capacidades

- Generación de imágenes a partir de texto mediante el modelo base Qwen-Image-2.1, con los LoRAs como aceleradores.
- Generación en 6-10 pasos de muestreo con CFG 1, reduciendo el coste frente a configuraciones estándar.
- Tres niveles de fidelidad/capacidad seleccionables según el rango (32, 64, 128).
- Compatibilidad con flujos de ComfyUI a través de los nodos KJ.
- Uso en pipelines de img2img, según la referencia del autor a otros LoRAs turbo "mejores en img2img".
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, al ser un componente de generación de imagen.
- No se dispone de información sobre capacidades multilingües en prompts.

## Casos de uso

- Generación rápida de imágenes en ComfyUI: cargar el LoRA de rango 64 o 128 junto al modelo base y generar en 6-10 pasos con CFG 1 para obtener resultados cercanos al modelo original con menor tiempo de inferencia.
- Prototipado de ideas visuales: usar el rango 32, más ligero, para explorar variaciones rápidas de un prompt antes de pasar a un rango mayor para el resultado final.
- Iteración en img2img: emplear los LoRAs turbo en flujos de imagen a imagen donde la velocidad de muestreo es crítica, tal como sugiere el autor al referenciar alternativas mejores en img2img.
- Automatización de pipelines de contenido visual: integrar el conjunto en scripts de ComfyUI para generar lotes de imágenes con pasos reducidos y menor consumo de GPU.
- Experimentación con extracción de LoRAs: servir como referencia para quienes quieran comparar el efecto de distintos rangos (32/64/128) sobre la fidelidad al modelo base.
- Despliegue en hardware de gama media: al reducir pasos y mantener CFG 1, el conjunto facilita la generación de imágenes en GPU con VRAM limitada, siempre que el modelo base Qwen-Image-2.1 pueda cargarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del modelo base Qwen-Image-2.1, que debe cargarse además de los LoRAs (1,1 GB en total para el conjunto).
- GPU recomendadas: no disponible. Al tratarse de un LoRA sobre un modelo de difusión, los requisitos vienen determinados por el checkpoint base.
- ¿Cabe en GPU de consumo? No confirmado; la reducción a 6-10 pasos con CFG 1 disminuye el coste de inferencia, pero el modelo base condiciona la VRAM necesaria.
- Opciones de despliegue: ComfyUI con nodos KJ (método documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | CFG | Rangos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kalle07/qwen2.1-image-turbo-lora-set | LoRA sobre Qwen-Image-2.1 | 6-10 | 1 | 32/64/128 | qwen-research | Hugging Face |
| congruency/Qwen-Image-2.1-turbo-mfd | LoRA turbo alternativo | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen-Image-2.1-Turbo | Modelo base turbo | no disponible | no disponible | no aplica | qwen-research | Hugging Face |
| Qwen/Qwen-Image-2.1 | Modelo base | no disponible | no disponible | no aplica | qwen-research | Hugging Face |

La comparación se limita a los elementos citados en la información disponible; no se dispone de datos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint base Qwen-Image-2.1 o Qwen-Image-2.1-Turbo para funcionar.
- La licencia `qwen-research` impone restricciones; es necesario revisar el enlace de licencia del modelo base antes de cualquier uso comercial.
- El rango 32 introduce diferencias respecto al modelo original; para máxima fidelidad deben usarse los rangos 64 o 128.
- No hay información sobre sesgos, riesgo de alucinación visual ni limitaciones idiomáticas de los prompts.
- No se documentan métricas de calidad, benchmarks ni comparativas objetivas con otras alternativas.
- El repositorio tiene pocas descargas (516) y likes (2), lo que reduce la validación comunitaria disponible.
- La fecha de creación indicada (2026-10-10) resulta anómala y conviene verificar la vigencia y el soporte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/kalle07/qwen2.1-image-turbo-lora-set
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base Qwen-Image-2.1-Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- LoRA turbo alternativo citado por el autor: https://huggingface.co/congruency/Qwen-Image-2.1-turbo-mfd
