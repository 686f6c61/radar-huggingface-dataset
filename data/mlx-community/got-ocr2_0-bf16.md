# mlx-community/GOT-OCR2_0-bf16

## Resumen

GOT-OCR2_0 es un modelo de reconocimiento óptico de caracteres (OCR) de segunda generación desarrollado por el equipo de StepFun AI. Esta ficha corresponde a la conversión a MLX (Apple Silicon) en precisión bfloat16 realizada por la comunidad mlx-community, que permite ejecutar el modelo en hardware de Apple con un rendimiento eficiente. El modelo original, de 560 millones de parámetros, está diseñado específicamente para la tarea de extracción de texto de imágenes, con soporte para salida estructurada (tablas, fórmulas, partituras) además de texto plano.

La relevancia de esta conversión radica en que facilita el despliegue local en Macs con chip M-series, sin necesidad de GPUs NVIDIA, manteniendo una fidelidad alta respecto a la implementación original en PyTorch. El modelo no es un chatbot: acepta únicamente dos instrucciones (`OCR: ` y `OCR with format: `) y está pensado para pipelines de digitalización documental. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-language image-text-to-text) |
| Parametros totales | 560.528.640 (560,5 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32k (mencionado en la model card, sin confirmacion oficial) |
| Tipos de cuantizacion | bf16 (esta conversion); existen variantes 8-bit y 4-bit en repos hermanos |
| Idiomas soportados | multilingual (segun tag de HuggingFace) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo ni sobre su proceso de entrenamiento. Se sabe que se trata de un modelo de OCR 2.0 con 560,5 millones de parametros, y que esta conversion MLX reproduce fielmente los pesos del modelo original `stepfun-ai/GOT-OCR2_0` en precision bfloat16. La model card indica que la conversion se realizo con `mlx-vlm` 0.6.14 y `mlx` 0.32.0, y que el modelo no es de tipo chat: solo acepta instrucciones especificas de OCR.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Para conocer esos detalles seria necesario consultar el paper original (arXiv:2409.01704) o la model card del modelo base.

## Capacidades

- Extraccion de texto plano de imagenes mediante la instruccion `OCR: `.
- Extraccion de texto estructurado (tablas, formulas matematicas, partituras) mediante la instruccion `OCR with format: `.
- Soporte para modos avanzados del modelo original: region por bounding box o por color, multi-crop para paginas densas y modo multi-pagina (no verificados en esta conversion).
- Capacidad multilingue declarada por el autor, aunque no se han publicado pruebas con idiomas distintos del ingles en la model card.
- No es un modelo de chat: no admite conversacion, tool calling ni razonamiento multi-paso.
- No soporta generacion de codigo ni tareas de razonamiento general.

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo puede extraer numeros de factura, importes y datos del proveedor con alta precision (la metrica `numeric` alcanza 0,9720 en bf16), lo que lo hace adecuado para automatizar la contabilidad.
- Procesamiento de etiquetas de envio: capaz de leer codigos de seguimiento, direcciones y nombres de empresa, aunque en las pruebas pierde consistentemente tres campos concretos en una etiqueta sintetica.
- Conversion de documentos escaneados a texto editable: ideal para archivos PDF o imagenes de paginas, con soporte para tablas y formulas gracias al modo `OCR with format`.
- Extraccion de datos de informes de laboratorio: el modelo transcribe correctamente valores numericos y campos de texto en documentos con estructura variable.
- OCR de recibos rotados: en las pruebas se incluyo un recibo rotado y el modelo lo transcribio correctamente, lo que sugiere robustez ante orientaciones no estandar.
- Integracion en pipelines de gestion documental en Mac: al ser una conversion MLX, puede ejecutarse localmente en equipos Apple sin GPU dedicada, con un pico de memoria de 2,50 GB en bf16, facilitando su uso en entornos de oficina o de investigacion.

## Benchmarks y rendimiento

La model card proporciona dos conjuntos de resultados. El primero compara la conversion MLX con la implementacion de referencia en PyTorch:

| Comparacion | max abs error | cosine | argmax |
|---|---|---|---|
| MLX bf16 vs torch fp32 | 0,47469 | 0,99979109 | mismo, top-5 identico |
| MLX fp32 vs torch fp32 | 0,000130 | 1,0000000000 | mismo |

El segundo conjunto mide la precision en tareas OCR sobre seis documentos sinteticos (factura, informe de laboratorio, etiqueta de envio, recibo, tabla de especificaciones y recibo rotado) con la instruccion `OCR: `:

| Variante | field | content | numeric | CER vs bf16 | tok/s | pico GB |
|---|---|---|---|---|---|---|
| bf16 | 0,8684 | 0,9605 | 0,9720 | 0 (ref) | 138,3 | 2,50 |
| 8-bit | 0,8684 | 0,9605 | 0,9720 | 0,0000 | 210,8 | 2,06 |
| 4-bit | 0,8947 | 0,9474 | 0,9623 | 0,0116 | 272,9 | 1,83 |

Nota: la metrica `field` cuenta cadenas requeridas presentes exactamente; `content` ignora marcado y espacios; `numeric` cuenta numeros recuperados. La variante 8-bit produce salidas byte-identicas a bf16 en los seis documentos. No se publicaron resultados de benchmarks estandar como MMLU o HumanEval, ya que el modelo solo emite transcripciones.

## Requisitos de hardware

- Inferencia en Apple Silicon (M-series) gracias a la conversion MLX; no requiere GPU NVIDIA.
- Pico de memoria durante generacion: 2,50 GB en bf16, 2,06 GB en 8-bit y 1,83 GB en 4-bit (medido en un Mac M-series).
- Velocidad de generacion: 138,3 tokens/s en bf16, 210,8 en 8-bit y 272,9 en 4-bit (medido en el mismo equipo).
- El modelo cabe en cualquier Mac con al menos 4 GB de RAM unificada, aunque se recomienda 8 GB para trabajar con imagenes grandes.
- Despliegue mediante `mlx-vlm` (requiere la rama con soporte GOT-OCR 2.0, actualmente en un pull request sin fusionar). No se mencionan opciones como vLLM u Ollama.
- No se dispone de datos de latencia en otros hardware.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos OCR en la documentacion proporcionada. El unico punto de referencia es el modelo original `stepfun-ai/GOT-OCR2_0` en PyTorch, con el que la conversion MLX muestra una concordancia casi perfecta en fp32 (error maximo de 0,000130). No se pueden ofrecer comparaciones con alternativas como PaddleOCR o TrOCR sin datos verificados.

## Limitaciones y advertencias

- No es un modelo de chat: cualquier instruccion distinta de `OCR: ` o `OCR with format: ` queda fuera de la distribucion de entrenamiento y puede producir resultados inesperados.
- La model card advierte que en una etiqueta de envio sintetica el modelo pierde consistentemente tres campos (un codigo de seguimiento, un nombre de empresa y un codigo postal) en todas las variantes, incluida la bf16 original. Esto sugiere una limitacion del modelo base, no de la conversion.
- Solo se probaron documentos sinteticos en ingles; el rendimiento con documentos reales, fotografias, escritura a mano o idiomas distintos del ingles no ha sido verificado.
- No se midio la precision en modo `OCR with format` (tablas, formulas, partituras) ni en contexto largo (por encima de 32k tokens).
- La variante 4-bit muestra una ligera degradacion en las metricas `content` y `numeric` (CER de 0,0116 respecto a bf16), aunque la metrica `field` resulta superior por casualidad estadistica.
- Para usar esta conversion es necesario instalar una version de `mlx-vlm` con soporte GOT-OCR 2.0, que aun no esta publicada en el release oficial.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos del modelo base original.

## Enlaces

- Repositorio de esta conversion: [mlx-community/GOT-OCR2_0-bf16](https://huggingface.co/mlx-community/GOT-OCR2_0-bf16)
- Variante 8-bit: [mlx-community/GOT-OCR2_0-8bit](https://huggingface.co/mlx-community/GOT-OCR2_0-8bit)
- Variante 4-bit: [mlx-community/GOT-OCR2_0-4bit](https://huggingface.co/mlx-community/GOT-OCR2_0-4bit)
- Modelo base: [stepfun-ai/GOT-OCR2_0](https://huggingface.co/stepfun-ai/GOT-OCR2_0)
- Paper original: [arXiv:2409.01704](https://arxiv.org/abs/2409.01704)
