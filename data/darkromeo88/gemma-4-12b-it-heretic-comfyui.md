# DarkRomeo88/gemma-4-12b-it-heretic-comfyui

## Resumen

Gemma 4 12B IT Heretic ComfyUI es un repackaging de los pesos del modelo google/gemma-4-12B-it, afinado posteriormente por llmfan46 para eliminar restricciones de rechazo (el autor lo etiqueta como "uncensored-heretic"), y redistribuido por DarkRomeo88 en formatos cuantizados listos para su uso como text encoder dentro de ComfyUI. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de formato y cuantización orientada a un runtime concreto: el repositorio se publica bajo la librería `diffusion-single-file` y sus pesos deben colocarse en `ComfyUI/models/text_encoders/`.

El interés práctico del artefacto es la disponibilidad de cuatro variantes de precisión (FP8_scaled, INT8_convrot, W4A8 y W6A8) que permiten ajustar el consumo de VRAM en pipelines de generación con ComfyUI sin tener que convertir manualmente un checkpoint de 12B parámetros. El autor indica compatibilidad probada con ComfyUI v0.38 o superior. El repositorio ocupa 43,7 GB, lo que refleja que contiene varias de estas variantes en un mismo paquete.

La información publicada es escasa: la model card se limita a instrucciones de instalación y a la lista de versiones disponibles. No hay datos sobre composición del dataset de entrenamiento, número de tokens, resultados de benchmarks ni idiomas soportados más allá de lo heredado del modelo base, por lo que esta ficha marca explícitamente como "no disponible" todo aquello que no consta en la documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-12B-it); detalles no disponibles |
| Parametros totales | 12B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_scaled, INT8_convrot, W4A8, W6A8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | single-file para ComfyUI (`diffusion-single-file`), en variantes fp8/int8/w4a8/w6a8 |
| Tamano del repositorio | 43,7 GB |
| Modelo base | google/gemma-4-12B-it; fine-tune llmfan46/gemma-4-12B-it-uncensored-heretic |
| Runtime objetivo | ComfyUI v0.38+ (carpeta `models/text_encoders/`) |
| Descargas / likes | 3.124 / 9 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base google/gemma-4-12B-it, un transformer decoder-only de 12.000 millones de parámetros. Esta ficha no puede detallar la configuración interna (número de capas, dimensión oculta, mecanismo de atención, vocabulario) porque la model card del repackaging no la documenta y no se ha proporcionado información adicional del modelo original. Tampoco se especifica si el modelo base incorpora innovaciones como atención lineal, decodificación especulativa o modos de razonamiento explícito.

En cuanto al entrenamiento, el artefacto procede de una cadena de dos pasos: primero el ajuste instruccional de Google (gemma-4-12B-it) y después un fine-tune de llmfan46 orientado a reducir el comportamiento de rechazo, comercializado bajo la etiqueta "uncensored-heretic". No se publican datos sobre el volumen de tokens empleados en ese fine-tune, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ablación de direcciones de rechazo. La aportación específica de DarkRomeo88 es exclusivamente de empaquetado y cuantización: conversión a FP8 con escalado, a INT8 con rotación de convolución, y a esquemas de pesos de 4 y 6 bits con activaciones de 8 bits (W4A8 y W6A8).

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo instruct de 12B.
- Uso como text encoder dentro de flujos de ComfyUI, que es el propósito declarado del repositorio.
- Comportamiento con menor tasa de rechazos que el modelo base, según la intención declarada del fine-tune "heretic".
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se enumeran idiomas).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Integración como text encoder en ComfyUI: el caso de uso principal y documentado. Los pesos se copian en `ComfyUI/models/text_encoders/` y el grafo los carga directamente en las versiones FP8 o INT8 según la VRAM disponible.
- Despliegue en GPUs de gama consumer con cuantización W4A8: la variante de 4 bits reduce el peso teórico de los 12B parámetros a unos 6 GB, lo que permite mantener el encoder residente en tarjetas de 8-12 GB junto al resto del pipeline.
- Experimentación con modelos sin filtros de rechazo: útil para investigación sobre comportamiento de modelos, evaluación de sesgos y estudios de alineación, dado el fine-tune "heretic".
- Generación de texto asistida por prompt en flujos creativos: al estar empaquetado para ComfyUI, encaja en pipelines de generación de imágenes o vídeo que requieren un encoder de instrucciones de calidad.
- Prototipado rápido de aplicaciones de chat en local: la variante INT8_convrot ofrece una relación calidad/VRAM intermedia sin necesidad de recompilar el modelo.
- Evaluación comparativa de cuantizaciones: disponer de FP8, INT8, W4A8 y W6A8 del mismo checkpoint en un solo repositorio facilita medir la degradación de calidad por esquema de cuantización en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmética, 12B parámetros en FP8/INT8 ocupan aproximadamente 12 GB de pesos, en W6A8 unos 9 GB y en W4A8 unos 6 GB, a lo que hay que sumar caché KV y overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, las variantes FP8 e INT8 requieren GPUs de 16-24 GB (RTX 4090, A100 40 GB, L40S); W4A8 y W6A8 son las opciones para 8-12 GB.
- ¿Cabe en GPU consumer? Sí, previsiblemente en RTX 4090 (24 GB) con FP8/INT8 y en tarjetas de 8-12 GB con W4A8/W6A8, aunque el autor no publica cifras de consumo medido.
- Opciones de despliegue: ComfyUI v0.38+ es el runtime declarado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos ficheros single-file.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DarkRomeo88/gemma-4-12b-it-heretic-comfyui | 12B | no disponible | Apache 2.0 | single-file ComfyUI (fp8/int8/w4a8/w6a8) | Repackaging cuantizado para ComfyUI, fine-tune sin rechazos |
| google/gemma-4-12B-it | 12B | no disponible | Apache 2.0 | safetensors (original) | Modelo base instruct, con filtros de seguridad |
| llmfan46/gemma-4-12B-it-uncensored-heretic | 12B | no disponible | no disponible | no disponible | Fine-tune intermedio del que deriva este artefacto |
| Mistral 12B / alternativas de tamaño similar | 12B | no disponible | variable | safetensors, GGUF | No se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El fine-tune "heretic" está diseñado explícitamente para reducir los rechazos, lo que implica mayor probabilidad de generar contenido dañino, sesgado o inapropiado; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: no cuantificado por el autor; se asume el comportamiento típico de un modelo de 12B, sin datos de evaluación.
- La cuantización a W4A8 y W6A8 puede degradar la calidad respecto al checkpoint original; el autor no publica métricas de degradación.
- La model card no documenta idiomas soportados ni longitud de contexto, por lo que no se puede garantizar su comportamiento en contextos largos o en castellano.
- La licencia declarada es Apache 2.0, pero se hereda de un modelo base de Google y de un fine-tune de terceros cuya licencia no se detalla; conviene verificar la cadena completa antes de un uso comercial.
- El repositorio está pensado para ComfyUI: los ficheros no son directamente cargables en vLLM, llama.cpp u otros servidores de inferencia sin conversión.
- El tamaño del repo (43,7 GB) implica descargar todas las variantes; no se ofrecen ficheros sueltos por variante según la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DarkRomeo88/gemma-4-12b-it-heretic-comfyui
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Fine-tune intermedio: https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
