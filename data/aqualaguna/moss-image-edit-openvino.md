# aqualaguna/MOSS-Image-Edit-OpenVINO

## Resumen

MOSS-Image-Edit-OpenVINO es una conversión experimental a OpenVINO IR del modelo de edición de imágenes MOSS-Image, que combina el modelo base OpenMOSS-Team/MOSS-Image-SFT con el LoRA de edición comunitario chinoll/Moss-Image-Edit (rango 64) fusionado directamente en los pesos. Lo publica el usuario aqualaguna como artefacto listo para ejecutarse en GPUs Intel Arc mediante el runtime OpenVINO 2026.4, con variantes en fp16 e INT8. El modelo resuelve edición de imágenes guiada por instrucciones de texto sobre una imagen de referencia, con capacidad de localizar cambios en regiones delimitadas mediante prompts en formato box-JSON.

La relevancia de esta ficha es doble: por un lado documenta un caso real de portabilidad de un modelo de difusión (DiT) a hardware Intel Arc, un ecosistema con menos cobertura que CUDA; por otro, muestra las limitaciones prácticas de una conversión experimental que nunca llegó a producción. El autor reporta 88–99,5 % de localización del cambio dentro del cuadro indicado y ~30 dB de PSNR fuera de él, así como tiempos de ~95–106 s por edición a 1024×1024 con 30 pasos en una Arc Pro B60 de 24 GB.

El repositorio pesa 16,3 GB y solo contiene el DiT de edición; requiere el repositorio de texto-a-imagen aqualaguna/MOSS-Image-SFT-OpenVINO para el codificador de texto, el VAE y el tokenizador. La licencia es "other / see-upstream": el modelo base es Apache-2.0, el código del proyecto de edición es GPLv3 y el repositorio del LoRA no declara licencia de pesos, por lo que los términos heredados son ambiguos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de edición de imágenes, con codificador de texto y VAE separados; conversión a OpenVINO IR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; límite de imagen 1024×1024 y 4096 tokens de referencia |
| Tipos de cuantizacion | fp16, INT8 (NNCF per-channel INT8_ASYM, con `ffn_down` en fp16) |
| Idiomas soportados | en, zh |
| Licencia | other / see-upstream (base Apache-2.0; código de edición GPLv3; LoRA sin licencia de pesos declarada) |
| Formato de pesos | OpenVINO IR (carpetas `dit_edit_fp16/`, `dit_edit_int8/`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión (DiT) para edición de imágenes por instrucciones, derivado de MOSS-Image-SFT y adaptado mediante un LoRA de rango 64 (proyecto Chenkin-x/Moss-Image-Edit) fusionado en los pesos. El pipeline se compone de un codificador de texto, un tokenizador, un VAE (encoder y decoder) y el DiT de edición, que en esta conversión se exporta como cuatro subgrafos: `text_refine`, `edit_a`, `edit_b` y `edit_c`. La imagen de referencia entra como tokens de prefijo en el paso de tiempo 0, cuyas claves y valores (K/V) se calculan una sola vez por petición.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base o en el LoRA. La innovación técnica destacable de esta conversión es la exportación a OpenVINO con atención a los detalles numéricos: el residual fp16 se escala por 1/8 dentro del grafo para evitar desbordamiento, el DiT se descarga de memoria tras cada llamada (el scratch de OpenVINO crecía hasta 27,8 GB sin esa medida) y la variante INT8 mantiene `ffn_down` en fp16 para preservar calidad. La caché de embeddings de prompt permite reutilizar el codificador de texto entre ediciones.

## Capacidades

- Edición de imágenes guiada por texto sobre una imagen de referencia (image-to-image).
- Localización de cambios mediante prompts en formato box-JSON: el autor reporta que el 88–99,5 % del cambio de píxel cae dentro del cuadro indicado.
- Edición con prompt de texto plano, sin delimitación espacial.
- Preservación del contenido fuera de la región editada (~30 dB de PSNR respecto a la entrada).
- Soporte de una imagen de referencia (el LoRA admite hasta 3, pero no se midieron más).
- Generación de texto dentro de la imagen solo si las palabras exactas se escriben en el prompt; sin ellas produce lettering plausible pero ilegible.
- Idiomas de prompt: inglés y chino.
- Servidor HTTP incluido (`code/server.py`) con selección de variante `edit` o `edit-int8` y campo `image`.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; es un modelo de imagen, no de lenguaje general.

## Casos de uso

- Retoque fotográfico por instrucciones en inglés o chino: sustituir el cielo, cambiar el color de un objeto o eliminar elementos, usando el prompt de edición sobre una imagen de 1024×1024. Adecuado por su capacidad de preservar el resto de la escena (~30 dB PSNR fuera de la región).
- Edición localizada en flujos de diseño gráfico: con prompts box-JSON se puede modificar una zona concreta (un cartel, un mueble, una prenda) sin alterar el resto del lienzo, gracias a la localización del 88–99,5 % reportada.
- Prototipado en hardware Intel Arc: equipos con Arc Pro B60 de 24 GB pueden ejecutar la variante INT8 con 17,6 GB de pico de memoria, útil para validar pipelines de edición en entornos sin GPU NVIDIA.
- Generación de variantes de interiores y exteriores: el benchmark del autor cubre escenas de salón, cocina, parque, calle, cafetería y anime, lo que lo hace apto para pruebas de concepto en visualización de espacios.
- Servicio HTTP interno de edición de imágenes: el servidor incluido permite exponer el modelo con un campo `image` y elegir variante fp16 o INT8, útil para demos internas o herramientas de diseño asistido.
- Investigación sobre portabilidad de DiT a OpenVINO: sirve como referencia reproducible para estudiar cuantización NNCF, gestión de memoria scratch y exportación de subgrafos en modelos de difusión.
- Edición por lotes con caché de prompt: al reutilizar embeddings del codificador de texto, se pueden procesar varias ediciones con la misma instrucción reduciendo el coste por petición (~6 s menos por edición en INT8).

## Benchmarks y rendimiento

Datos publicados por el autor (2026-11-02, Arc Pro B60 24 GB, 1024², 30 pasos, guidance 4, 4096 tokens de referencia):

| Metrica | fp16 | int8 (keepdown) |
|---|---|---|
| Tiempo total por edición | 103,5–106,6 s | 92,7–95,6 s |
| Segundos por paso | 2,96–3,02 | 2,80–2,84 |
| Carga del DiT | 6,1–6,9 s | 6,4–7,3 s |
| Codificador de texto | 5,7–6,4 s | cacheado* |
| Prefill de referencia | 1,4–1,7 s | 1,4–1,5 s |
| VAE | 0,4–0,9 s | 0,4 s |
| Pico de memoria GPU | 20,9k–21,6k MB | 17,6k MB |

\* En las pruebas INT8 se reutilizaron los embeddings del prompt de las ejecuciones fp16; con prompt nuevo hay que sumar ~6 s.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de imagen y no de lenguaje.

## Requisitos de hardware

- GPU: probado en Intel Arc Pro B60 de 24 GB; el autor lo etiqueta como específico para GPUs Intel Arc.
- VRAM estimada: 21,6 GB en fp16 y 17,6 GB en INT8 a 1024² con 30 pasos.
- Memoria del sistema: el scratch de OpenVINO crece con el número de tokens distintos y llegó a 27,8 GB sin descargar el DiT tras cada llamada; conviene prever RAM suficiente.
- No cabe en GPUs de consumo convencionales de 8–16 GB en esta configuración; no se documentan variantes para ellas.
- Runtime: OpenVINO 2026.4 (probado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Despliegue: script Python `moss_pipeline.py` y servidor HTTP `server.py` incluidos en `code/`.
- Latencia: ~95–106 s por edición de 1024² a 30 pasos; throughput no medido en lote.
- Estructura de carpetas requerida: `models/{te,tokenizer,vae,dit_sft_edit,dit_sft_edit_int8_keepdown}`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aqualaguna/MOSS-Image-Edit-OpenVINO | DiT de edición, OpenVINO IR | no disponible | 1024×1024, 4096 tokens de referencia | see-upstream (base Apache-2.0, código GPLv3) | HuggingFace, experimental |
| OpenMOSS-Team/MOSS-Image-SFT | DiT texto-a-imagen (base) | no disponible | no disponible | Apache-2.0 | HuggingFace |
| chinoll/Moss-Image-Edit | LoRA de edición (rango 64) | no disponible | no disponible | sin licencia de pesos declarada | HuggingFace |
| aqualaguna/MOSS-Image-SFT-OpenVINO | DiT texto-a-imagen, OpenVINO IR | no disponible | no disponible | ver repositorio | HuggingFace |

No se dispone de datos de benchmarks comparativos con otros modelos de edición (por ejemplo, InstructPix2Pix o variantes de Stable Diffusion) en la información proporcionada, por lo que no se ofrece comparación de rendimiento.

## Limitaciones y advertencias

- Conversión experimental: el autor indica explícitamente que fue "staged and tested, never put into production".
- Solo se incluye el DiT de edición; sin el repositorio de texto-a-imagen no funciona (faltan codificador de texto, VAE y tokenizador).
- El texto solo se genera correctamente si las palabras exactas aparecen en el prompt; de lo contrario produce lettering ilegible.
- Una sola imagen de referencia medida; el LoRA admite hasta 3 pero no se evaluaron.
- Resolución limitada a 1024×1024.
- Idiomas de prompt limitados a inglés y chino.
- Licencia ambigua: base Apache-2.0, código de edición GPLv3 y LoRA sin licencia de pesos; los pesos fusionados heredan términos inciertos, lo que complica el uso comercial.
- Riesgo de alucinación visual: el modelo puede generar contenido plausible pero incorrecto en regiones no delimitadas o con prompts ambiguos.
- Gestión de memoria delicada: sin descargar el DiT tras cada llamada, el scratch de OpenVINO creció hasta 27,8 GB.
- El escalado del residual fp16 por 1/8 es una mitigación numérica que puede afectar la fidelidad en casos extremos.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- No hay resultados de benchmarks estándar ni evaluación independiente.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere escasa validación por la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/aqualaguna/MOSS-Image-Edit-OpenVINO
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- LoRA de edición: https://huggingface.co/chinoll/Moss-Image-Edit
- Proyecto del LoRA: https://github.com/Chenkin-x/Moss-Image-Edit
- Repositorio de texto-a-imagen OpenVINO requerido: https://huggingface.co/aqualaguna/MOSS-Image-SFT-OpenVINO
