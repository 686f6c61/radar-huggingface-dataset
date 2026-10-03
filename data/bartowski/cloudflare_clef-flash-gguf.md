# bartowski/Cloudflare_clef-flash-GGUF

## Resumen

Cloudflare_clef-flash-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Cloudflare/clef-flash, publicada por el usuario bartowski, especializado en generar cuantizaciones con imatrix para llama.cpp. El modelo original lo desarrolla Cloudflare y está orientado a una tarea poco habitual en modelos multimodales generalistas: recibir texto e imágenes y producir salidas tipadas y estructuradas (image-text-to-typed-output), es decir, clasificación y extracción de datos con esquema fijo en lugar de generación libre de lenguaje natural.

El checkpoint de origen tiene 8.953.803.264 parámetros (aproximadamente 9B) y se distribuye bajo licencia Apache 2.0. La model card de la cuantización etiqueta el modelo con los términos clef, systemone, qwen3.5 y post-train, lo que apunta a una base derivada de la familia Qwen 3.5 sometida a un proceso de post-entrenamiento específico, aunque la documentación disponible no detalla la arquitectura interna ni la composición del dataset de entrenamiento.

La relevancia de esta ficha concreta está en el formato: el repositorio de bartowski permite ejecutar el modelo en llama.cpp (compilación b11279), con soporte de entrada de imagen mediante fichero mmproj y un abanico de cuantizaciones que va desde bf16 (17,92 GB) hasta IQ4_XS (5,23 GB), lo que hace viable el despliegue en hardware de consumo. El repositorio acumula 3.011 descargas y 11 likes desde su publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio mencionan qwen3.5, pero la model card no detalla la arquitectura) |
| Parámetros totales | 8.953.803.264 (aproximadamente 9B) |
| Parámetros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS (lista truncada en la información proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, release b11279) y fichero mmproj para la torre de visión |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo base: no se especifica si se trata de un transformer denso, de una mezcla de expertos, de un modelo híbrido o de otra variante, ni se detalla el número de capas, cabezas de atención o dimensionalidad del estado oculto. Los tags del repositorio incluyen qwen3.5, lo que sugiere que el checkpoint parte de la familia Qwen 3.5 y que ha sido sometido a un proceso de post-entrenamiento (tag post-train) por parte de Cloudflare, pero no se aportan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas (RLHF, DPO u otras).

Sí se conocen detalles del proceso de cuantización: bartowski ha generado las cuantizaciones con llama.cpp b11279 utilizando imatrix (calibración basada en matriz de importancia), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a una cuantización uniforme. La model card indica explícitamente que la decodificación especulativa no está habilitada. La entrada admite texto e imagen siempre que se cargue el fichero mmproj asociado, y la salida está orientada a tipos estructurados, no a texto libre. El formato de prompt emplea los tokens especiales de la familia Qwen (`<|im_start|>` y `<|im_end|>`) y arranca el turno del asistente con una etiqueta `<think>`.

## Capacidades

- Generación de texto conversacional, con plantilla de chat basada en `<|im_start|>`/`<|im_end|>`.
- Entrada multimodal de imagen junto con texto, mediante el fichero mmproj indicado en el repositorio.
- Salida estructurada y tipada (image-text-to-typed-output): el modelo está diseñado para producir resultados con esquema fijo, adecuados para tareas de clasificación y extracción.
- Clasificación a partir de texto e imagen (tag classification).
- Modo de razonamiento explícito: la plantilla de prompt abre el bloque `<think>` antes de la respuesta del asistente.
- Tool calling / function calling: la model card documenta un formato de definición de herramientas dentro del system prompt y una sintaxis concreta de invocación con etiquetas `<tool_call>`, `<function=...>` y `<parameter=...>`.
- Soporte de razonamiento en varios pasos orientado a agentes, derivado del soporte de tool calling y del bloque de pensamiento.
- Multilingüismo: los idiomas soportados no están documentados en la información disponible.
- Capacidad especial: el modelo es de tipo "custom-code", es decir, requiere código personalizado para su ejecución completa (no basta con un cargador genérico de transformers en todos los casos).

## Casos de uso

- Clasificación de documentos escaneados: el modelo recibe la imagen de un documento y el texto de las categorías posibles, y devuelve la categoría asignada en un formato tipado y parseable directamente por el sistema, sin necesidad de post-procesar lenguaje natural.
- Extracción de campos de facturas y albaranes: se le pasa la imagen del documento y un esquema de campos (número de factura, CIF, base imponible, IVA), y el modelo devuelve la estructura rellena, lo que simplifica la integración con sistemas de contabilidad.
- Moderación de contenido con criterios definidos: dado un texto o una imagen y una taxonomía de políticas, el modelo clasifica el contenido en la categoría correspondiente y justifica brevemente la decisión dentro del bloque de pensamiento.
- Enrutado de tickets de soporte: con la imagen o el texto del ticket como entrada y una lista cerrada de departamentos como salida, el modelo actúa como clasificador de primera línea antes de derivar el caso a un sistema de gestión.
- Verificación de identidad documental en procesos KYC: el modelo puede clasificar el tipo de documento aportado (DNI, pasaporte, permiso de conducir) y extraer los campos necesarios, siempre con revisión humana posterior dado el riesgo de error.
- Agentes con herramientas en pipelines internos: gracias al formato de tool calling documentado, el modelo puede invocarse como planificador que decide qué función llamar (por ejemplo, consultar un precio o un estado de pedido) y devolver la llamada en el formato XML esperado por el orquestador.
- Análisis de imágenes en control de calidad: clasificación de piezas o productos a partir de fotografías, devolviendo una etiqueta tipada que alimenta directamente el sistema de trazabilidad industrial.
- Preprocesado de datos para entrenamiento de otros modelos: uso del modelo como etiquetador automático de pares imagen-texto, aprovechando su salida estructurada para generar datasets anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de clasificación o extracción estructurada, y tampoco se aportan comparaciones numéricas con el checkpoint original en bf16.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del tamaño de los ficheros GGUF publicados, asumiendo margen para caché KV, el fichero mmproj de visión y sobrecarga del runtime. No proceden de mediciones publicadas por el autor.

- bf16 (17,92 GB): requiere del orden de 20-24 GB de VRAM. Apropiado para A100 40 GB, H100, RTX 4090 24 GB (ajustado) o RTX 3090 24 GB.
- Q8_0 (9,55 GB): del orden de 12-14 GB de VRAM. Cabe en RTX 4080, RTX 3090, RTX 4090 y en A100 con holgura.
- Q6_K (7,79 GB) y Q6_K_L (8,11 GB): del orden de 10-12 GB de VRAM. Viables en RTX 3060 12 GB, RTX 4070 y superiores.
- Q5_K_M (6,88 GB): del orden de 9-10 GB de VRAM. Cabe en GPU de consumo con 10-12 GB.
- Q4_K_M (5,84 GB) y Q4_K_L (6,20 GB): del orden de 8-9 GB de VRAM. Es la opción recomendada por el autor para uso general; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y GPUs de 8 GB con contexto reducido.
- IQ4_XS (5,23 GB) y Q4_K_S (5,48 GB): del orden de 7-8 GB de VRAM. Es la franja más ajustada para GPUs de 8 GB y para Mac con memoria unificada de 16 GB.
- El fichero mmproj necesario para procesar imágenes añade consumo de VRAM adicional; su tamaño no está disponible en la información proporcionada.
- Opciones de despliegue: llama.cpp (compilación b11279 o posterior, indicada por el autor), servidores compatibles con GGUF y runtimes que acepten este formato. El tag endpoints_compatible del repositorio sugiere compatibilidad con endpoints de inferencia, pero no se detalla cuáles.
- Latencia y throughput estimados: no disponible en la información proporcionada. Los tags del repositorio no incluyen datos de velocidad, y el autor indica que la decodificación especulativa no está activada.

## Comparativa con modelos similares

La información proporcionada no incluye datos de benchmarks ni especificaciones de contexto de modelos alternativos, por lo que no es posible establecer una comparación numérica fiable. La única comparación documentada es entre el propio modelo base y su versión cuantizada:

| Modelo | Parámetros | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| Cloudflare/clef-flash | 8.953.803.264 (aproximadamente 9B) | safetensors (checkpoint original) | Apache 2.0 | no disponible | HuggingFace, requiere código personalizado |
| bartowski/Cloudflare_clef-flash-GGUF (este repositorio) | 8.953.803.264 (aproximadamente 9B) | GGUF en 14 cuantizaciones conocidas | Apache 2.0 | no disponible | HuggingFace, ejecutable en llama.cpp |
| Otros modelos multimodales de aproximadamente 9B con salida estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información verificable sobre alternativas equivalentes en tarea (image-text-to-typed-output) y tamaño, por lo que la comparativa con modelos de otros autores queda marcada como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible. Al ser un modelo derivado de un post-entrenamiento sobre una base de la familia Qwen, es razonable esperar los sesgos propios de esa familia, pero no hay datos publicados al respecto en esta ficha.
- Riesgo de alucinación: no cuantificado. En tareas de extracción de campos a partir de imágenes (facturas, documentos de identidad) el modelo puede generar valores plausibles pero incorrectos, por lo que cualquier uso en producción debería incorporar validación contra el documento original.
- El repositorio es una cuantización de terceros: los artefactos los genera bartowski, no Cloudflare, por lo que la reproducibilidad exacta respecto al checkpoint original depende del proceso de cuantización y de la calibración imatrix.
- La model card indica que el modelo requiere código personalizado (tag custom-code), lo que puede complicar su integración en frameworks de despliegue que no soporten código específico del modelo.
- El fichero mmproj es imprescindible para el procesamiento de imágenes; sin él, la entrada multimodal no está disponible. Su tamaño y sus requisitos no se detallan en la información proporcionada.
- Longitud de contexto desconocida: no se puede dimensionar la caché KV ni planificar cargas de trabajo con documentos largos sin este dato.
- Idiomas soportados sin documentar: no se puede garantizar un rendimiento homogéneo en castellano ni en otros idiomas distintos del inglés.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar que el checkpoint base Cloudflare/clef-flash mantenga la misma licencia y que no existan condiciones adicionales en su repositorio de origen.
- El listado de ficheros disponible está truncado en la información proporcionada, por lo que es posible que existan cuantizaciones adicionales no recogidas aquí.
- Los resultados de la búsqueda web asociada a esta consulta no contienen material relevante sobre el modelo: los enlaces devueltos corresponden a sitios de contenido para adultos y no guardan relación con clef-flash ni con su cuantización.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/bartowski/Cloudflare_clef-flash-GGUF
- Modelo base original: https://huggingface.co/Cloudflare/clef-flash
- Fichero recomendado Q4_K_M: https://huggingface.co/bartowski/Cloudflare_clef-flash-GGUF/blob/main/Cloudflare_clef-flash-Q4_K_M.gguf
- Fichero bf16 completo: https://huggingface.co/bartowski/Cloudflare_clef-flash-GGUF/blob/main/Cloudflare_clef-flash-bf16.gguf
- llama.cpp, release empleada para la cuantización: https://github.com/ggml-org/llama.cpp/releases/tag/b11279
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Paper, blog técnico o demo del modelo: no disponible en la información proporcionada.
