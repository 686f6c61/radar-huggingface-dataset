# fwgpiyawudk/Netra-2B-mlx-8bit

## Resumen

Netra-2B es un modelo vision-lenguaje especializado en lectura de documentos empresariales y contables en tailandés. Se trata de un fine-tune con LoRA fusionada de `typhoon-ai/typhoon-ocr1.5-2b`, que a su vez emplea la arquitectura Qwen3-VL-2B. El modelo resuelve dos tareas concretas: la lectura de páginas a Markdown limpio (con tablas en HTML de una línea, descripciones de figuras en tailandés, etiquetas de número de página y casillas de verificación) y la extracción de campos contables a un único objeto JSON con un esquema fijo de 28 claves.

La versión aquí descrita es una conversión nativa a MLX en cuantización de 8 bits, publicada por el usuario `fwgpiyawudk`. El modelo de lenguaje está cuantizado con cuantización afín y tamaño de grupo 64, mientras que la torre de visión se mantiene en bfloat16. El repositorio ocupa 2,7 GB y contiene 2.127.532.032 parámetros totales.

Su relevancia radica en cubrir un nicho poco atendido: la digitalización y el procesamiento estructurado de documentación contable tailandesa, con licencia Apache 2.0 y un formato de despliegue optimizado para hardware Apple Silicon mediante MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-2B (transformer vision-lenguaje), fine-tune LoRA fusionada |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (afín, group size 64) en el modelo de lenguaje; torre de visión en bfloat16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de `typhoon-ai/typhoon-ocr1.5-2b`, un modelo de arquitectura Qwen3-VL-2B, sobre el que se aplicó un fine-tune con LoRA que posteriormente se fusionó en los pesos base (`botnick/Netra-2B`, v0.3). La arquitectura combina una torre de visión con un modelo de lenguaje transformer; la configuración de RoPE del texto emplea `rope_theta` de 5.000.000 y `mrope_section` de [24, 20, 20] en modo interleaved, valores idénticos a los del modelo base oficial.

La conversión a MLX se realizó con mlx-vlm 0.7.12 el 15 de noviembre de 2026, normalizando previamente la configuración del repositorio original (guardada con transformers 5.17, que escribe los ajustes de RoPE como objeto anidado `rope_parameters` y etiqueta la configuración de visión como `qwen3_vl_vision`). Los pesos no se modificaron. El repositorio fuente no incluía `preprocessor_config.json`, por lo que se copiaron literalmente desde la conversión oficial `mlx-community/typhoon-ocr1.5-2b-8bit` (mismo procesador Qwen3-VL-2B). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Lectura de páginas completas a Markdown limpio, incluyendo tablas renderizadas como HTML de una línea dentro de etiquetas `<table>`.
- Renderizado de ecuaciones en LaTeX, tanto en línea (`$...$`) como en bloque (`$$...$$`).
- Descripción de figuras, gráficos y diagramas dentro de etiquetas `<figure>`, con la descripción redactada en tailandés.
- Detección y etiquetado de números de página mediante `<page_number>...</page_number>`.
- Reconocimiento de casillas de verificación con los símbolos ☐ (sin marcar) y ☑ (marcada).
- Extracción de información clave (KIE) de documentos contables a un único objeto JSON con un esquema fijo de 28 claves.
- Procesamiento de imágenes en color (RGB) con el lado largo limitado a 1400 px.
- Capacidades multilingües limitadas a tailandés e inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Digitalización de libros contables tailandeses: el modelo convierte páginas escaneadas en Markdown estructurado con tablas HTML, lo que permite posteriormente parsear los registros financieros con herramientas estándar.
- Extracción automatizada de campos contables: mediante el prompt KIE de esquema fijo de 28 claves, se obtiene un JSON directamente consumible por un ERP o sistema de gestión financiera, sin necesidad de postprocesado complejo.
- Archivado documental con metadatos: el etiquetado de números de página y la descripción de figuras en tailandés facilitan la generación de índices y resúmenes navegables de expedientes.
- Procesamiento de formularios con casillas: la detección de ☐/☑ permite automatizar la lectura de checklists y formularios de verificación en procesos de auditoría.
- Integración en pipelines de OCR sobre Apple Silicon: al estar en formato MLX, puede desplegarse en Macs con chip Apple para tareas de digitalización local sin depender de servicios en la nube.
- Extracción de datos de gráficos financieros: la descripción de figuras incluye análisis de gráficos y tablas financieras, útil para enriquecer informes con contexto semántico.
- Servicio compatible con OpenAI: mediante `mlx_vlm.server` se puede exponer el modelo como endpoint HTTP y conectarlo a aplicaciones existentes que ya consuman la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que las métricas de ThaiOCRBench de la versión v0.3 se midieron con el loop guard activado, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,7 GB en disco; en memoria, el modelo de lenguaje en 8 bits más la torre de visión en bfloat16 requiere aproximadamente 3-4 GB, si bien no se proporciona una cifra oficial.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (chips M1, M2, M3, M4 y posteriores). No se documenta soporte para GPU NVIDIA en esta conversión.
- Cabe en hardware de consumo: sí, en equipos Apple con memoria unificada de 8 GB o superior.
- Opciones de despliegue: mlx-vlm (probado con 0.7.12) y el servidor compatible con OpenAI incluido (`python -m mlx_vlm.server`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para esta conversión MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Netra-2B-mlx-8bit | 2,13 B | no disponible | th, en | Apache 2.0 | safetensors MLX |
| typhoon-ocr1.5-2b (base) | ~2 B | no disponible | th, en | no disponible | transformers |
| mlx-community/typhoon-ocr1.5-2b-8bit | ~2 B | no disponible | th, en | no disponible | safetensors MLX |
| OvisOCR3-mlx (8/4 bit) | no disponible | no disponible | no disponible | no disponible | safetensors MLX |

El modelo se distingue de su base por el fine-tune específico para documentos contables y por el esquema KIE de 28 claves. Frente a la conversión oficial de typhoon-ocr1.5, esta versión emplea un límite de resolución de 1400 px (frente a 1800 px del base) y añade el prompt KIE. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El modelo puede entrar en bucles degenerativos en una pequeña proporción de páginas, repitiendo una línea o frase hasta alcanzar el límite de tokens. Se recomienda implementar el `loop_guard.py` del repositorio fuente y regenerar con `repetition_penalty=1.25` cuando se detecte degeneración.
- El `generation_config.json` incluido conserva los valores por defecto del modelo base (`do_sample=true`, `temperature=0.7`), por lo que es necesario pasar explícitamente decodificación greedy y `repetition_penalty=1.05` en inferencia.
- mlx-vlm no implementa `no_repeat_ngram_size=16`, presente en la variante de reintento para transformers; esta conversión solo replica la variante de guard para vLLM.
- La resolución de imagen debe limitarse a 1400 px en el lado largo (reducción con LANCZOS, solo downscale); superar ese valor se aleja de las condiciones de entrenamiento y evaluación.
- Los idiomas soportados son únicamente tailandés e inglés; el rendimiento en otros idiomas no está documentado.
- No existen métricas oficiales para la cuantización de 4 bits en este modelo; las tarjetas oficiales de Typhoon OCR V2 MLX reportan una pérdida de aproximadamente 10 puntos en páginas tailandesas a 4 bits frente a 8 bits, por lo que se recomienda la conversión de 8 bits para documentos en tailandés.
- No se documentan sesgos específicos ni tasas de alucinación medidas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas en la información disponible.
- El modelo está pensado exclusivamente para OCR y extracción de campos contables; no se documentan capacidades de razonamiento general, código o matemáticas.

## Enlaces

- [fwgpiyawudk/Netra-2B-mlx-8bit en Hugging Face](https://huggingface.co/fwgpiyawudk/Netra-2B-mlx-8bit)
- [botnick/Netra-2B (modelo base)](https://huggingface.co/botnick/Netra-2B)
- [typhoon-ai/typhoon-ocr1.5-2b (modelo original)](https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b)
- [mlx-community/typhoon-ocr1.5-2b-8bit (conversión oficial MLX)](https://huggingface.co/mlx-community/typhoon-ocr1.5-2b-8bit)
- [loop_guard.py del repositorio fuente](https://huggingface.co/botnick/Netra-2B/blob/main/loop_guard.py)
- [mlx-vlm (repositorio GitHub)](https://github.com/Blaizzy/mlx-vlm)
