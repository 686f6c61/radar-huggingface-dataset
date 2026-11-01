# jefflaporte/chandra-ocr-2-MLX-4bit-mixed_4_8

## Resumen

Chandra OCR 2 es un modelo de reconocimiento óptico de caracteres (OCR) y comprensión de documentos desarrollado por Datalab, construido sobre el modelo de lenguaje Qwen3.5-4B de Alibaba Cloud. El modelo original procesa imágenes de páginas y devuelve el contenido en formato estructurado, preservando el layout (tablas, columnas, encabezados) en lugar de limitarse a extraer texto plano. Esta ficha describe la variante cuantizada publicada por el usuario jefflaporte, pensada específicamente para Apple Silicon mediante MLX.

La versión aquí documentada es una cuantización mixta de 4 y 8 bits del checkpoint original en BF16, realizada con la receta `mixed_4_8` de mlx-vlm, que sigue el esquema Q4_K_M de llama.cpp. El resultado ocupa 3,3 GB y mantiene el vision tower en BF16 sin modificar, así como el tokenizer, la plantilla de chat y la configuración del procesador. Los pesos del modelo de lenguaje son los únicos cuantizados.

Su relevancia actual radica en que permite ejecutar un OCR de documentos de calidad sobre hardware de consumo Apple (Mac con chip M-series), algo que el checkpoint original en BF16 dificulta por tamaño y ancho de banda de memoria. Es una opción práctica para pipelines de digitalización de documentos en local, sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision tower + LLM Qwen3.5-4B), según el modelo base |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX mixed 4/8-bit (`mixed_4_8`): proyecciones affine 4-bit en grupos de 64; token table/output head, `v_proj` y `mlp.down_proj` en capas seleccionadas a 8-bit; vision tower en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openrail (OpenRAIL-M modificada, con restricciones comerciales en el Anexo A) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Chandra OCR 2 sigue una arquitectura multimodal de tipo image-text-to-text: un vision tower que codifica la imagen de la página y un modelo de lenguaje Qwen3.5-4B que genera la salida estructurada. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos corresponden a la model card original de Datalab, que no se ha incluido en la información proporcionada.

La innovación técnica de esta variante concreta es la cuantización mixta: se aplica 4-bit affine en grupos de 64 a la mayoría de las proyecciones, pero se preservan en 8-bit la tabla de tokens (que también actúa como cabeza de salida, ya que el modelo las ata), `v_proj` y `mlp.down_proj` en el primer y último octavo de las capas y en cada tercera capa intermedia. La cuantización es round-to-nearest sin calibración. El autor documenta que una cuantización uniforme de 4-bit (incluida la tabla de tokens y la cabeza) confundió una fecha en una página de prueba ("3 September" leído como "5 September"), mientras que esta receta la leyó correctamente. El vision tower permanece en BF16.

## Capacidades

- OCR de documentos con preservación de layout: tablas, columnas, encabezados y pies de página.
- Generación de salida estructurada a partir de imágenes de páginas (image-text-to-text).
- Procesamiento de páginas de hasta 6.291.456 píxeles, según las instrucciones de uso del autor.
- Conversación multimodal (tag `conversational`).
- Ejecución local en Apple Silicon mediante MLX.
- Servido como endpoint compatible con clientes OCR (por ejemplo, el cliente `chandra-ocr`) a través de vllm-metal.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de archivos escaneados en local: el modelo procesa páginas de documentos typewritten o impresos y devuelve texto con estructura, adecuado para fondos documentales históricos (el autor lo probó con documentos mecanografiados de los años 40).
- Extracción de tablas y libros de contabilidad: al preservar la alineación de filas y columnas, permite convertir ledgers y tablas en datos estructurados sin post-procesado manual intensivo.
- Pipeline de ingesta documental en Mac: con `mlx_vlm.server` se puede levantar un servidor local y conectar herramientas de extracción sin enviar documentos sensibles a terceros.
- Procesamiento por lotes de PDF: el cliente `chandra-ocr` junto con vllm-metal permite ejecutar `chandra input.pdf ./output --method vllm` sobre colecciones completas.
- Prototipado e investigación en OCR: al caber en 3,3 GB, permite iterar sobre recetas de preprocesado y evaluación (por ejemplo, con olmOCR-bench) en hardware de consumo.
- Digitalización de correspondencia y memorandos: el modelo mantiene saltos de línea y separadores, útil para conservar la fidelidad de documentos administrativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor incluye únicamente una comprobación puntual sobre nueve documentos mecanografiados escaneados de los años 40: el texto coincidió con el del modelo original en BF16 en seis páginas; en las otras tres las diferencias fueron de layout, no de contenido (saltos de línea omitidos en celdas de tabla, un separador etiquetado como texto en lugar de pie de página, y una alineación de filas distinta y correcta en un libro de contabilidad). El propio autor indica que se trata de un spot check y recomienda ejecutar una evaluación propia, por ejemplo con olmOCR-bench.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 3,3 GB de pesos, más overhead de inferencia y del vision tower en BF16; el consumo real no está documentado.
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA de forma nativa, aunque el autor documenta su uso con vllm-metal.
- GPU consumer: cabe en Mac con memoria unificada de 8 GB o superior, aunque el margen real depende del tamaño de imagen procesada (hasta ~6,3 MP).
- Despliegue: `mlx_vlm.server` (MLX) o `vllm serve` mediante vllm-metal con `--mm-processor-kwargs '{"min_pixels": 3136, "max_pixels": 6291456}'`.
- Cliente OCR: `pip install chandra-ocr`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jefflaporte/chandra-ocr-2-MLX-4bit-mixed_4_8 | 4.539.265.536 | no disponible | MLX mixed 4/8-bit | openrail (con restricciones comerciales) | HuggingFace, MLX |
| datalab-to/chandra-ocr-2 (original) | no disponible en la información | no disponible | BF16 | openrail (con restricciones comerciales) | HuggingFace |
| Qwen/Qwen3.5-4B (base del LLM) | ~4B (según denominación) | no disponible | no disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Restricciones comerciales: la licencia OpenRAIL-M modificada prohíbe el uso por organizaciones con más de 2 millones de dólares de ingresos anuales o financiación total, salvo uso personal o de investigación, y prohíbe el uso por competidores de Datalab. Se requiere licencia comercial de Datalab para esos casos.
- La licencia del modelo base Qwen3.5-4B es Apache 2.0, pero la del derivado impone restricciones adicionales.
- La cuantización introduce degradación: el autor documenta diferencias de layout en 3 de 9 páginas de prueba y un fallo de lectura de fecha con una cuantización uniforme de 4-bit.
- El vision tower en BF16 y el rango de píxeles hasta 6,3 MP implican que servidores que recorten la resolución pueden perder el layout de páginas densas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse con el modelo base.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Los ficheros `preprocessor_config.json`, `processor_config.json` y `video_preprocessor_config.json` fueron restaurados manualmente porque mlx-vlm los reescribe y vLLM los rechaza; conviene verificar la compatibilidad al desplegar.
- Es un artefacto comunitario (47 descargas, 0 likes en el momento de la consulta), sin evaluación independiente publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jefflaporte/chandra-ocr-2-MLX-4bit-mixed_4_8
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Datalab: https://www.datalab.to/
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- vllm-metal: https://github.com/vllm-project/vllm-metal
- olmOCR-bench: https://github.com/allenai/olmocr
