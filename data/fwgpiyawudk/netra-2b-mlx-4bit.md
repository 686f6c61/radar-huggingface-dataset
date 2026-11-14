# fwgpiyawudk/Netra-2B-mlx-4bit

## Resumen

Netra-2B es un modelo vision-lenguaje especializado en lectura de documentos empresariales y contables en tailandés. Se trata de un fine-tune con LoRA fusionado sobre `typhoon-ai/typhoon-ocr1.5-2b`, que a su vez emplea la arquitectura Qwen3-VL-2B. El modelo resuelve dos tareas concretas: la lectura de páginas completas a Markdown limpio (con tablas en HTML de una línea, descripciones de figuras en tailandés, etiquetas de número de página y casillas de verificación) y la extracción de campos contables a un único objeto JSON con un esquema fijo de 28 claves.

La ficha que nos ocupa, `fwgpiyawudk/Netra-2B-mlx-4bit`, es una conversión nativa a MLX con cuantización de 4 bits del modelo base `botnick/Netra-2B` (v0.3). La conversión se realizó con mlx-vlm 0.7.12 aplicando cuantización afín con group size 64: el modelo de lenguaje se cuantiza a 4 bits mientras que la torre de visión permanece en bfloat16, resultando en un repositorio de aproximadamente 1,8 GB.

Su relevancia radica en que permite ejecutar un OCR especializado en tailandés y en documentos contables sobre hardware Apple Silicon mediante MLX, algo que hasta ahora requería infraestructura con GPU dedicada. El modelo cuenta con 2.127.532.032 parámetros totales y está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer vision-lenguaje) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (afín, group size 64) para el LM; torre de visión en bfloat16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL-2B, con una torre de visión y un modelo de lenguaje. En esta conversión MLX, el modelo de lenguaje se ha cuantizado a 4 bits con cuantización afín y group size 64, mientras que la torre de visión se mantiene en bfloat16. La configuración RoPE utiliza `rope_theta` de 5.000.000 y `mrope_section` de [24, 20, 20] con disposición intercalada, valores idénticos a los de la conversión oficial `mlx-community/typhoon-ocr1.5-2b-8bit`.

El modelo base es un fine-tune con LoRA fusionado de `typhoon-ai/typhoon-ocr1.5-2b`, orientado a documentos empresariales y contables tailandeses. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La conversión requirió normalizar la configuración del repositorio original (guardada con transformers 5.17, que escribe las claves RoPE como objeto anidado `rope_parameters` y etiqueta la configuración de visión como `qwen3_vl_vision`) para adaptarla a lo que espera mlx-vlm 0.7.12 (claves planas `rope_theta` + `rope_scaling` y etiqueta `qwen3_vl`). Los pesos no se modificaron. El repositorio fuente tampoco incluía `preprocessor_config.json`, por lo que se copiaron literalmente desde la conversión oficial `mlx-community/typhoon-ocr1.5-2b-8bit`.

## Capacidades

- Lectura de páginas completas a Markdown limpio, incluyendo tablas renderizadas como HTML de una línea (`<table>...</table>`).
- Descripción de figuras, gráficos y diagramas en tailandés, envueltos en etiquetas `<figure>`.
- Detección y etiquetado de números de página mediante `<page_number>...</page_number>`.
- Reconocimiento de casillas de verificación con los símbolos ☐ (sin marcar) y ☑ (marcada).
- Renderizado de ecuaciones en LaTeX, tanto en línea (`$...$`) como en bloque (`$$...$$`).
- Extracción de campos contables (KIE) a un único objeto JSON con un esquema fijo de 28 claves.
- Procesamiento de imágenes en color RGB con el lado largo limitado a 1400 px.
- Soporte de servidor compatible con OpenAI mediante `mlx_vlm.server`.
- Capacidades multilingües limitadas a tailandés e inglés.

## Casos de uso

- Digitalización de facturas y documentos contables tailandeses: el modelo extrae los 28 campos del esquema contable a JSON, lo que permite alimentar directamente sistemas de contabilidad o ERP sin post-procesado manual.
- Automatización de la entrada de datos en gestorías y departamentos financieros: la lectura a Markdown con tablas en HTML facilita la conversión posterior a hojas de cálculo o bases de datos.
- Procesamiento de archivos empresariales escaneados en macOS: al ser una conversión MLX, se ejecuta sobre Apple Silicon sin necesidad de GPU dedicada, lo que permite desplegar pipelines de OCR en estaciones de trabajo locales.
- Extracción de datos de estados financieros e informes anuales: las descripciones de gráficos financieros en tailandés y el renderizado de tablas permiten conservar la estructura del documento original.
- Construcción de pipelines de KIE (key information extraction) con validación posterior: el esquema fijo de 28 claves facilita la validación automática y el control de calidad de los datos extraídos.
- Servicio de OCR como API interna: mediante `mlx_vlm.server` se puede exponer el modelo con una interfaz compatible con OpenAI para integrarlo en aplicaciones existentes.
- Procesamiento de formularios con casillas de verificación: la detección de ☐/☑ permite digitalizar cuestionarios y formularios administrativos tailandeses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona mediciones en ThaiOCRBench para la versión v0.3, pero no se incluyen cifras concretas en la información proporcionada. Tampoco existen cifras oficiales para la versión de 4 bits; la model card advierte que las conversiones MLX oficiales de Typhoon OCR V2 midieron aproximadamente −10 puntos en páginas tailandesas a 4 bits frente a 8 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB para los pesos en 4 bits, más overhead de activaciones y caché KV.
- Al ser una conversión MLX, está diseñada para ejecutarse en Apple Silicon (chips M1, M2, M3, M4 y posteriores) con memoria unificada.
- Cabe holgadamente en cualquier Mac con 8 GB de memoria unificada o superior.
- No está pensada para GPU NVIDIA; para ese hardware sería necesario usar el modelo base en formato transformers o vLLM.
- Despliegue mediante `mlx-vlm` (versión probada 0.7.12) o mediante `python -m mlx_vlm.server` para una API compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Netra-2B-mlx-4bit | 2,13 B | no disponible | th, en | Apache 2.0 | safetensors MLX 4-bit |
| typhoon-ocr1.5-2b (base) | ~2 B | no disponible | th, en | no disponible en la informacion | transformers |
| mlx-community/typhoon-ocr1.5-2b-8bit | ~2 B | no disponible | th, en | no disponible en la informacion | safetensors MLX 8-bit |
| botnick/Netra-2B (fuente) | ~2 B | no disponible | th, en | Apache 2.0 | transformers |

La comparación principal es frente a la conversión oficial de 8 bits del modelo base: esta versión de 4 bits ocupa aproximadamente la mitad de espacio (1,8 GB frente a los ~3,5 GB esperables en 8 bits), a costa de una posible pérdida de precisión en páginas tailandesas (estimada en torno a −10 puntos según las mediciones de las conversiones oficiales de Typhoon OCR V2).

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la precisión en páginas tailandesas; la model card recomienda la conversión de 8 bits para documentos en tailandés.
- El modelo puede entrar en bucles de repetición en una pequeña proporción de páginas, repitiendo una línea o frase hasta alcanzar el límite de tokens. Se recomienda implementar el `loop_guard.py` del repositorio fuente y regenerar con `repetition_penalty=1.25`.
- El `generation_config.json` incluido conserva los valores por defecto del modelo base (`do_sample=true, temperature=0.7`); es necesario pasar explícitamente los parámetros de decodificación greedy recomendados.
- mlx-vlm no implementa `no_repeat_ngram_size`, por lo que esta conversión solo replica la variante de guardia de vLLM (reintento con `repetition_penalty=1.25`).
- El modelo está entrenado y evaluado con imágenes de lado largo máximo de 1400 px; superar ese tamaño puede degradar los resultados.
- Idiomas limitados a tailandés e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación en la descripción de figuras y en la extracción de campos contables; se recomienda validación posterior en producción.
- No se dispone de información sobre sesgos conocidos ni sobre el proceso de entrenamiento (datos, RLHF/DPO).
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `typhoon-ai/typhoon-ocr1.5-2b` antes de un uso comercial.

## Enlaces

- [fwgpiyawudk/Netra-2B-mlx-4bit en Hugging Face](https://huggingface.co/fwgpiyawudk/Netra-2B-mlx-4bit)
- [botnick/Netra-2B (modelo fuente)](https://huggingface.co/botnick/Netra-2B)
- [typhoon-ai/typhoon-ocr1.5-2b (modelo base)](https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b)
- [mlx-community/typhoon-ocr1.5-2b-8bit](https://huggingface.co/mlx-community/typhoon-ocr1.5-2b-8bit)
- [loop_guard.py del repositorio fuente](https://huggingface.co/botnick/Netra-2B/blob/main/loop_guard.py)
- [mlx-vlm en GitHub](https://github.com/Blaizzy/mlx-vlm)
