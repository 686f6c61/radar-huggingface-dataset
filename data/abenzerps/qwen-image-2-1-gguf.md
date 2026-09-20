# abenzerps/Qwen-Image-2.1-GGUF

## Resumen
Qwen-Image-2.1-GGUF es la versión cuantizada en formato GGUF del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario abenzerps. Se trata de una conversión de los pesos base originales pensada para ejecutar generación texto-a-imagen en local dentro de ComfyUI, sin necesidad de GPU de datacenter. El repositorio incluye, además del transformer cuantizado, los ficheros complementarios necesarios: el codificador de texto Qwen3-VL-8B y el VAE del modelo original.

El modelo base pesa 7.115.124.736 parámetros y el repositorio ocupa 54,9 GB en total, aunque cada cuantización individual ocupa entre 4,05 GB (Q4_0) y 7,59 GB (Q8_0). La relevancia práctica de esta publicación está en que permite ejecutar un modelo de imagen de ~7,1B en GPUs de consumo: el transformer puede residir en VRAM (unos 4,6 GB en Q4_K_M) mientras el codificador de texto se descarga a RAM del sistema, con un impacto mínimo en velocidad porque la codificación de texto solo se ejecuta una vez por prompt.

La ficha recoge únicamente la información publicada en el repositorio; el autor no documenta detalles de entrenamiento ni métricas numéricas de benchmarks, y la licencia declarada es qwen-research (etiquetada como "other" en HuggingFace). Es importante señalar que esta release se distribuye sin filtro de contenido ni verificador de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente texto-a-imagen (transformer de difusión + VAE + codificador de texto Qwen3-VL-8B); detalle interno no documentado en el repositorio |
| Parámetros totales | 7.115.124.736 (dato real de safetensors del modelo base) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (GGUF) |
| Idiomas soportados | No disponible (el repositorio no declara idiomas) |
| Licencia | qwen-research (campo `license: other`) |
| Formato de pesos | GGUF (transformer) y safetensors (codificador de texto y VAE) |
| Pipeline | text-to-image |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Relación con el base | Quantized (revisión `b3179ad355be050328e483a9dfdd9e60cd62adfa`) |
| Repositorio | 54,9 GB |
| Descargas / likes | 33.232 / 356 |
| Fecha de creación | 20 de septiembre de 2026 (actualizado el mismo día) |

## Arquitectura y entrenamiento
El repositorio no describe la arquitectura interna del modelo base más allá de lo que se deduce de sus componentes: un transformer de difusión cuantizado en GGUF, un codificador de texto Qwen3-VL-8B (versión BF16 de 17,53 GB o Int8 de 9,35 GB) y un VAE BF16 de 676 MB. Esta combinación corresponde a un esquema de difusión latente en el que el texto se codifica una sola vez por prompt y el transformer se ejecuta iterativamente durante el muestreo. No se especifican en la información disponible ni el tipo exacto de bloque de atención, ni la resolución nativa, ni si emplea técnicas como atención lineal o decodificación especulativa.

Tampoco hay datos sobre el entrenamiento: el repositorio es una conversión de pesos, no un modelo entrenado desde cero. La conversión se realizó con stable-diffusion.cpp y el autor indica que los pesos provienen de la revisión `b3179ad355be050328e483a9dfdd9e60cd62adfa` del modelo upstream. No se documentan número de tokens, composición del dataset, ni etapas de RLHF o DPO. El único material de evaluación aportado es una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) cuyo contenido numérico no se reproduce en el texto de la model card.

Ficheros GGUF publicados:

| Cuantización | Fichero | Tamaño |
|---|---|---:|
| Q8_0 | qwen-image-2.1-Q8_0.gguf | 7,59 GB |
| Q6_K | qwen-image-2.1-Q6_K.gguf | 5,88 GB |
| Q5_K_M | qwen-image-2.1-Q5_K_M.gguf | 5,22 GB |
| Q4_K_M | qwen-image-2.1-Q4_K_M.gguf | 4,60 GB |
| Q4_0 | qwen-image-2.1-Q4_0.gguf | 4,05 GB |

## Capacidades
- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline declarado en el repositorio.
- Edición de imágenes: el repositorio enlaza una plantilla oficial de ComfyUI de edición de imagen (`image_qwen_image_2_1_image_edit.json`), lo que implica soporte de flujos image-to-image con imagen de referencia.
- Integración nativa con ComfyUI a través del nodo `Unet Loader (GGUF)` y del fork `leejet/ComfyUI-GGUF`.
- Uso con el codificador de texto Qwen3-VL-8B, que puede ejecutarse en CPU/RAM o en GPU indistintamente.
- Generación sin filtro de contenido: el autor indica expresamente que esta release no incluye verificador de seguridad ni filtro, y que no hay rechazos de prompt ni imágenes censuradas.
- Ejecución local y offline, sin llamadas a API externa.
- No se documentan capacidades de tool calling, function calling, uso como agente ni razonamiento multi-paso: es un modelo de generación de imágenes, no un modelo de lenguaje conversacional.
- No se documentan capacidades de audio, vídeo ni visión comprensiva más allá del codificador de texto multimodal Qwen3-VL.

## Casos de uso
- Generación de imágenes en GPU de consumo: con el transformer en Q4_K_M (4,6 GB en VRAM) y el codificador de texto Int8 en RAM (9,35 GB), el conjunto cabe en equipos con 8 GB de VRAM y 16 GB de RAM, lo que permite generar imágenes localmente sin alquilar GPU en la nube.
- Ilustración y concept art por encargo: el flujo de trabajo con ComfyUI permite iterar prompts y semillas, y el uso de plantillas oficiales facilita reproducir resultados con parámetros fijos para entregas a cliente.
- Edición de imágenes sobre material existente: la plantilla de image edit permite modificar imágenes de entrada (por ejemplo, cambiar estilo o añadir elementos) manteniendo el resto de la composición, útil en retoque fotográfico y previsualización de diseño.
- Generación de contenido para adultos y material sensible: al no incorporar filtro, el modelo sirve para proyectos que requieren imágenes NSFW o temáticas que otros modelos rechazan, siempre que el despliegue cumpla la legalidad aplicable.
- Procesamiento por lotes de catálogos o assets gráficos: con el transformer en VRAM y el codificador de texto descargado a RAM, el coste por imagen es bajo y se puede automatizar la generación de variaciones mediante la API de ComfyUI.
- Investigación sobre cuantización en modelos de difusión: al publicarse cinco niveles de cuantización con tamaños conocidos, permite medir la degradación de fidelidad entre Q4_0 y Q8_0 sobre el mismo prompt y semilla.
- Prototipado rápido en estaciones de trabajo sin GPU dedicada: el modo `--lowvram` de ComfyUI permite arrancar el flujo aunque la VRAM sea insuficiente, a costa de velocidad.
- Aumento de datasets sintéticos: generación de imágenes etiquetadas por prompt para entrenar o evaluar otros modelos, con la ventaja de que todo el proceso queda en local y no envía datos a terceros.

## Benchmarks y rendimiento
No se han publicado resultados numéricos de benchmarks en la información disponible. El repositorio incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) que presumiblemente contiene comparativas del modelo base, pero los valores concretos no se detallan en el texto de la model card, por lo que no se reproducen aquí. Tampoco se documentan métricas de latencia, throughput ni número de pasos de muestreo.

## Requisitos de hardware
Estimación de VRAM para el transformer de difusión según el tamaño de fichero publicado (los valores son tamaño en disco y sirven como cota inferior del consumo en VRAM):

| Cuantización | Tamaño | VRAM mínima orientativa |
|---|---:|---:|
| Q4_0 | 4,05 GB | ~4,1 GB |
| Q4_K_M (recomendada) | 4,60 GB | ~4,6 GB |
| Q5_K_M | 5,22 GB | ~5,2 GB |
| Q6_K | 5,88 GB | ~5,9 GB |
| Q8_0 | 7,59 GB | ~7,6 GB |

- Configuración recomendada por el autor: transformer Q4_K_M en VRAM (~4,6 GB) + codificador de texto `qwen3vl_8b_int8_convrot` en RAM (~9,35 GB) + VAE BF16 (~676 MB, puede residir en VRAM o compartirse). Total aproximado: 5,3 GB de VRAM y 10 GB de RAM del sistema.
- Variante con codificador en BF16: 17,53 GB de RAM en lugar de 9,35 GB.
- Todo en GPU: Q4_K_M + codificador Int8 + VAE ≈ 14,6 GB de VRAM; con codificador BF16 ≈ 22,8 GB; con transformer Q8_0 y codificador BF16 ≈ 25,8 GB.
- Cabe en GPU de consumo: sí, en configuraciones de 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.) usando la separación transformer/VRAM + codificador/RAM. Para tener todo el pipeline en VRAM hacen falta GPUs de 16-24 GB (RTX 4080, RTX 4090, A100 40 GB, H100) en función de la cuantización y la precisión del codificador.
- Modo de bajo consumo: arrancar ComfyUI con `--lowvram` si aparecen errores de memoria insuficiente en VRAM.
- Opciones de despliegue: ComfyUI con el nodo `Unet Loader (GGUF)` y la extensión `leejet/ComfyUI-GGUF` (se indica que el fork antiguo `city96/ComfyUI-GGUF` puede fallar con el error `Unknown model architecture!`); la conversión se generó con `stable-diffusion.cpp`. No se contemplan vLLM, TGI, Ollama ni llama.cpp porque el modelo no es un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| abenzerps/Qwen-Image-2.1-GGUF | 7.115.124.736 (transformer) | GGUF (5 cuantizaciones) + safetensors auxiliares | qwen-research | HuggingFace, 33.232 descargas | Cuantización para ComfyUI, sin filtro de contenido |
| Qwen/Qwen-Image-2.1 (base) | 7.115.124.736 | safetensors | qwen-research | HuggingFace | Pesos originales sin cuantizar, mayor consumo de VRAM |
| Comfy-Org/Qwen-Image-2.1 | No disponible | safetensors (codificador de texto y VAE) | No disponible | HuggingFace | Fuente de los ficheros auxiliares de este repositorio |
| Otras cuantizaciones GGUF de modelos de difusión (por ejemplo, familia FLUX o SD3.5) | No disponible | GGUF | No disponible | HuggingFace | Alternativas de la misma categoría; no se dispone de datos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias
- Licencia: el campo de licencia es `other` con nombre `qwen-research`. Hay que revisar el texto completo de la licencia del modelo base antes de cualquier uso comercial; el propio nombre sugiere orientación a investigación, pero las condiciones exactas no se detallan en el repositorio.
- Ausencia de filtro de seguridad: el autor declara explícitamente que no hay verificador de contenido ni censura, y que el modelo genera imágenes para adultos, NSFW y sensibles sin rechazos. Esto traslada toda la responsabilidad legal y ética al operador del despliegue.
- Fallo conocido en Q8_0: según el autor, `qwen-image-2.1-Q8_0.gguf` puede producir un error de discrepancia de formas (`[136] vs [128]`) en función de la GPU y del entorno de ComfyUI. Se recomienda usar Q4_K_M, Q5_K_M o Q6_K para mayor estabilidad.
- Degradación por cuantización: no se publican métricas de fidelidad por nivel de cuantización, por lo que la pérdida de calidad de Q4_0 y Q4_K_M frente a Q8_0 no está cuantificada.
- Idiomas: el repositorio no declara idiomas soportados para la generación, ni la calidad de seguimiento de prompt en castellano u otros idiomas distintos del inglés.
- Contexto: no se documenta la longitud máxima de prompt admitida.
- Rendimiento: sin valores de benchmarks, latencia ni throughput publicados, la evaluación comparativa debe hacerse de forma empírica en el propio equipo.
- Riesgo de fidelidad limitada al prompt: al no haber métricas publicadas, no puede garantizarse un nivel concreto de adherencia al texto, composición de escenas con múltiples sujetos ni renderizado correcto de texto dentro de la imagen.
- Dependencia de software: requiere ComfyUI y el fork `leejet/ComfyUI-GGUF`; usar el fork antiguo provoca el error `Unknown model architecture!`.
- Contenido generado: la ausencia de filtros implica riesgo de generar material ilegal o dañino según la jurisdicción; es responsabilidad del usuario implementar controles externos si el servicio se expone a terceros.
- Reproducibilidad: los pesos se convierten desde una revisión concreta (`b3179ad355be050328e483a9dfdd9e60cd62adfa`); cambios posteriores en el modelo base no se reflejan automáticamente en esta release.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/abenzerps/Qwen-Image-2.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Codificador de texto y VAE de origen: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork leejet, recomendado): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (city96, versión antigua): https://github.com/city96/ComfyUI-GGUF
- stable-diffusion.cpp (herramienta de conversión): https://github.com/leejet/stable-diffusion.cpp
- Plantilla de flujo texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla de flujo de edición de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Imagen de benchmark del repositorio: https://huggingface.co/abenzerps/Qwen-Image-2.1-GGUF/blob/main/assets/Qwen-Image-2.1-Benchmark.png
