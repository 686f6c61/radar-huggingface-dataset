# jitvimol/typhoon-ocr2-0.8b-mlx-bf16

## Resumen

Typhoon OCR V2 0.8B (MLX, bf16) es una conversion no oficial del modelo `typhoon-ai/typhoon-ocr2-0.8b` al formato MLX, publicada por el usuario `jitvimol`. El modelo original es un vision-language model de aproximadamente 853 millones de parametros desarrollado por Typhoon (SCB 10X), especializado en el parseo de documentos en tailandes e ingles. Dada una imagen de pagina, devuelve los elementos de maquetacion en orden de lectura, cada uno con una categoria, un bounding box y su contenido textual.

La relevancia de esta variante concreta es practica: permite ejecutar el modelo en local sobre Apple Silicon (Macs con chip M-series) mediante MLX y LM Studio, manteniendo los pesos originales en bfloat16 sin cuantizar. Se presenta como la opcion recomendada cuando la precision de transcripcion es prioritaria frente al ahorro de memoria.

El modelo es un fine-tune de `ATH-MaaS/OvisOCR2` y emplea la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`). Esta pensado exclusivamente como parser de pagina completa; el propio autor original advierte que es mucho mas debil en otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), vision-language model |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 sin cuantizar en este repo; el autor menciona una variante de 8 bits y descarta publicar una de 4 bits |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), bfloat16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5 para generacion condicional multimodal, es decir, un vision-language model que combina un codificador visual con un decoder de lenguaje para producir texto estructurado a partir de imagenes. Es un fine-tune de `ATH-MaaS/OvisOCR2`, orientado especificamente a la extraccion de layout y texto de documentos.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor original indica que el modelo de 0.8B se entreno en las mismas tareas generales de question-answering que la variante de 2B, pero que a este tamano obtiene puntuaciones inferiores en ellas. Esta conversion MLX no introduce entrenamiento adicional: solo cambia el dtype a bfloat16 mediante `mlx-vlm 0.7.12`.

## Capacidades

- Parseo de layout de pagina completa: devuelve una lista JSON de elementos con `bbox`, `category` y `text`.
- Categorias de layout soportadas: header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote y footer.
- Extraccion de tablas en formato HTML.
- Extraccion de formulas en formato LaTeX.
- Texto general (titulos, parrafos) en formato Markdown.
- Ordenacion de los elementos en orden de lectura humano.
- Procesamiento bilingue tailandes-ingles.
- No dispone de tool calling ni de capacidades de agente documentadas.
- No dispone de modo thinking ni de soporte de audio.
- No incluye filtrado de seguridad.

## Casos de uso

- Digitalizacion de documentos tailandeses: el modelo convierte imagenes de paginas escaneadas en JSON estructurado con coordenadas, adecuado para pipelines de ingestion documental donde se necesita preservar la maquetacion.
- Extraccion de tablas a HTML: util para convertir informes financieros o administrativos en tablas manipulables, ya que el modelo emite las tablas directamente en HTML.
- Captura de formulas cientificas: la salida en LaTeX permite integrar contenido matematico de articulos o apuntes en editores y sistemas de publicacion cientifica.
- Procesamiento local en Mac: al estar en formato MLX, permite ejecutar OCR en un Mac sin enviar documentos a servicios en la nube, lo que resulta relevante para material confidencial.
- Integracion en LM Studio: sirve para prototipado rapido de flujos de OCR adjuntando una imagen en el chat y aplicando el prompt fijo con temperatura 0.
- Construccion de corpus bilingues th-en: la preservacion del orden de lectura y de las categorias facilita la creacion de datasets alineados texto-maquetacion.
- Preprocesado para RAG documental: la salida estructurada con bounding boxes permite segmentar documentos por secciones antes de indexarlos.

## Benchmarks y rendimiento

El autor de la conversion no publica benchmarks formales. Realizo una comprobacion informal sobre dos paginas de documento tailandesas y seis capturas de chat tailandesas de 500 px de ancho, con temperatura 0, tanto en mlx-vlm como en LM Studio:

| Prueba | Resultado |
|---|---|
| Validez del JSON de salida | 100% de las salidas validas, sin bucles de repeticion |
| Similitud de texto LM Studio vs mlx-vlm (paginas de documento) | 98-99% |
| Capturas de chat | Texto principal leido correctamente; texto pequeno y contenido en imagenes embebidas frecuentemente corrupto u omitido |
| Variante de 8 bits vs bf16 | Coincidencia alta en la mayoria de imagenes; en una de seis capturas omitio una tarjeta embebida completa |

Dato del modelo original recogido en la busqueda: en ThaiOCRBench, el modelo de 0.8B obtiene 36.4 frente a 40.5 de Typhoon OCR 1.5. No se dispone de resultados de MMLU, HumanEval ni GSM8K para este modelo.

## Requisitos de hardware

- Memoria en uso: aproximadamente 2,5 GB para imagenes de pagina tipicas (pico de memoria residente medido con mlx-vlm); imagenes mayores requieren mas.
- Tamano en disco: 1,6 GB.
- Plataforma: exclusivamente Apple Silicon (MLX). No es ejecutable en GPU NVIDIA ni en CPU x86 con esta conversion.
- Cabe holgadamente en cualquier Mac con chip M-series con 8 GB o mas de memoria unificada.
- Despliegue: mlx-vlm (`python -m mlx_vlm.generate`) y LM Studio.
- Latencia y throughput: no disponibles de forma cuantificada.
- Limitacion de LM Studio: no permite configurar `max_pixels` (hasta 16,7 megapixeles en el modelo original), por lo que las paginas grandes pueden reducirse y alterar el numero y tamano de los elementos de layout.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Typhoon OCR V2 0.8B (MLX bf16, esta ficha) | 853 M | th, en | MLX safetensors | Apache-2.0 | Conversion no oficial para Apple Silicon |
| typhoon-ai/typhoon-ocr2-0.8b | 853 M | th, en | safetensors (original) | Apache-2.0 | Modelo original, sin conversion MLX |
| Typhoon OCR 1.5 | no disponible | th, en | no disponible | no disponible | ThaiOCRBench 40.5 frente a 36.4 del 0.8B V2 |
| ATH-MaaS/OvisOCR2 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva este fine-tune |

## Limitaciones y advertencias

- Errores de transcripcion en tailandes: sustitucion de caracteres, marcas de tono o vocales. No debe usarse para valores criticos (numeros de cuenta, importes, nombres) sin verificacion.
- Riesgo de repeticion: el modelo puede repetir texto hasta alcanzar el limite de tokens; se recomienda temperatura 0 y un `max_tokens` acotado.
- Ambito restringido: el autor original lo recomienda solo como parser de pagina completa y lo considera mucho mas debil en otras tareas.
- Ausencia de filtrado de seguridad: puede generar texto que no aparece en la imagen.
- La cuantizacion afecta mas al OCR que al uso conversacional; la variante de 4 bits no fue probada ni publicada.
- Limitacion de layout en LM Studio por la imposibilidad de fijar `max_pixels`.
- Conversion no oficial: no esta afiliada ni respaldada por los autores originales; posibles divergencias respecto al modelo de referencia.
- Idiomas limitados a tailandes e ingles; no se documenta soporte de castellano.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/jitvimol/typhoon-ocr2-0.8b-mlx-bf16
- Modelo original: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- README del modelo original: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b/blob/main/README.md
- Modelo base del fine-tune: https://huggingface.co/ATH-MaaS/OvisOCR2
- Pagina del modelo en Typhoon: https://opentyphoon.ai/model/typhoon-ocr
- MLX: https://github.com/ml-explore/mlx
- LM Studio: https://lmstudio.ai
- Paper referenciado en los tags (arXiv:2601.14722): https://arxiv.org/abs/2601.14722
