# burkap/MoganOCR-TR-MTP

## Resumen

MoganOCR-TR-MTP es un cabezal de prediccion multi-token (MTP, *multi-token prediction*) para el modelo de OCR moganai/MoganOCR-TR, desarrollado por el usuario burkap. No es un modelo independiente: se trata de un conjunto de pesos auxiliares que se anaden al modelo base para habilitar decodificacion especulativa en vLLM, acelerando la generacion sin modificar los pesos principales ni la calidad de salida. El repositorio ocupa 0,1 GB y contiene 15 tensores (122 MB) mas un indice de pesos.

El modelo base, MoganOCR-TR, es un OCR basado en Qwen3.5-2B que se distribuye sin el cabezal MTP original de su modelo precursor. Este repositorio recupera ese cabezal y lo reentrena sobre las propias salidas de MoganOCR-TR mediante autodestilacion, de modo que las predicciones del borrador se alinean con la distribucion real del modelo objetivo. El resultado es una aceleracion de 1,57x en la generacion con decodificacion voraz sobre una RTX 3090 Ti con vLLM 0.33.0.

Es relevante porque la decodificacion especulativa es una de las tecnicas mas efectivas para reducir la latencia en inferencia de LLM y VLM, y este repositorio la habilita para un OCR turco-ingles concreto sin necesidad de entrenar un modelo borrador separado. La licencia Apache 2.0 facilita su adopcion en produccion. El modelo esta orientado a idiomas turco e ingles y a tareas de transcripcion de documentos a Markdown.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal MTP (multi-token prediction) para decodificacion especulativa sobre MoganOCR-TR (basado en Qwen3.5-2B) |
| Parametros totales | No disponible (el cabezal MTP contiene 15 tensores, 122 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de vLLM con `max_model_len=32768`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`mtp.safetensors` + `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino un cabezal MTP que se acopla al modelo base MoganOCR-TR mediante un indice de pesos (`model.safetensors.index.json`) que anade el cabezal al `model.safetensors` original. El cabezal se inicializa a partir del cabezal MTP de Qwen3.5-2B (el modelo precursor de MoganOCR-TR) y se reentrena por autodestilacion: MoganOCR-TR transcribio 7.821 paginas y el cabezal aprendio a predecir los siguientes tokens del modelo sobre esas salidas. Se cachearon 8.000 paginas en total, de las cuales 179 se reservaron para validacion.

Los datos de entrenamiento provienen de ocho fuentes: moganai/turkish-synthetic-documents (2.000 paginas), docling-project/DocLayNet-v1.2 (1.469), emredeveloper/turkish-ocr (1.339), Voxel51/iam_handwriting_finevision (928), Voxel51/high-quality-invoice-images-for-ocr (783), apoidea/pubtabnet-html (767), Voxel51/scanned_receipts (710) y HumynLabs/Turkish_Documents_Datasets_PDF (4). Ninguna pagina de TurkishOCR-Bench se uso en el entrenamiento, lo que evita contaminacion en la evaluacion. La innovacion tecnica es la propia decodificacion especulativa: el cabezal propone tokens borrador que el modelo principal verifica, de modo que solo se aceptan los que el modelo objetivo respalda, preservando la calidad de salida intacta.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa MTP en vLLM (metodo `mtp`, `num_speculative_tokens` configurable).
- Transcripcion OCR de imagenes de documentos a Markdown (funcionalidad heredada de MoganOCR-TR).
- Soporte de entrada multimodal imagen + texto (una imagen por prompt segun `limit_mm_per_prompt={"image": 1}`).
- Modo *thinking* desactivable mediante `chat_template_kwargs={"enable_thinking": False}`.
- Compatibilidad con plantilla de chat de vLLM (`llm.chat`).
- Idiomas: turco e ingles.
- No modifica los pesos del modelo base: sin `speculative_config` el comportamiento es identico al original.

## Casos de uso

- Digitalizacion masiva de documentos turcos: procesar lotes de facturas, recibos y formularios escaneados a Markdown con un 57% mas de throughput que el modelo base, reduciendo el coste por pagina en pipelines de ingestion documental.
- Extraccion de tablas de documentos financieros: el modelo base se entreno con PubTabNet-HTML y facturas de alta calidad, por lo que la transcripcion a Markdown estructurado es adecuada para alimentar sistemas de contabilidad automatizada.
- Procesamiento de correspondencia administrativa: la ventana de 32.768 tokens permite transcribir documentos de varias paginas en una sola peticion, util para expedientes y archivos publicos turcos.
- Reconocimiento de escritura manuscrita: el entrenamiento incluye el dataset IAM de escritura manuscrita, lo que permite digitalizar notas y formularios rellenados a mano.
- Servicio de OCR como API de baja latencia: con vLLM y decodificacion especulativa, el modelo puede servir peticiones interactivas de digitalizacion desde una interfaz web o aplicacion movil con menor tiempo de respuesta.
- Evaluacion comparativa de pipelines OCR: al mantener exactamente la misma puntuacion en TurkishOCR-Bench (89,2) con y sin especulacion, sirve para medir el impacto de la aceleracion sin introducir variables de calidad.

## Benchmarks y rendimiento

Evaluacion sobre las 488 paginas de TurkishOCR-Bench, una peticion a la vez, RTX 3090 Ti, vLLM 0.33.0, decodificacion voraz, con `VLLM_USE_FLASHINFER_SAMPLER=0`:

| Configuracion | Tokens/s | Aceleracion |
|---|---|---|
| Sin especulacion | 156 | 1,00x |
| Cabezal original de Qwen3.5-2B, 2 tokens borrador | 191 | 1,22x |
| Este cabezal, 2 tokens borrador | 230 | 1,47x |
| Este cabezal, 3 tokens borrador | 245 | 1,57x |

La puntuacion en TurkishOCR-Bench es de 89,2 en las cuatro configuraciones. No se midio el rendimiento bajo carga por lotes ni en otras GPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es Qwen3.5-2B, por lo que la inferencia en precision completa requiere aproximadamente 4-5 GB y en cuantizacion de 8 bits alrededor de 2-3 GB, aunque estos valores no se confirman en la informacion proporcionada.
- GPU recomendada segun la medicion publicada: RTX 3090 Ti (24 GB).
- Cabe en GPU de consumo: si, segun la prueba realizada en RTX 3090 Ti; el tamano del modelo base (2B) sugiere compatibilidad con GPUs de 8 GB o mas en cuantizacion, aunque no se documenta.
- Despliegue: vLLM 0.33.0 (probado). No se documenta soporte en llama.cpp, Ollama ni TGI para el cabezal MTP.
- Latencia y throughput: 245 tokens/s con 3 tokens borrador y 156 tokens/s sin especulacion en RTX 3090 Ti, una peticion a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceleracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoganOCR-TR-MTP (este) | Cabezal MTP sobre 2B | 32.768 | 1,57x | Apache 2.0 | Hugging Face |
| MoganOCR-TR (base) | 2B | 32.768 | 1,00x (sin MTP) | No disponible | Hugging Face |
| Qwen3.5-2B con cabezal MTP original | 2B | No disponible | 1,22x | No disponible | No disponible |

No se dispone de datos de otros modelos OCR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo autonomo: requiere descargar moganai/MoganOCR-TR y anadir los dos archivos al mismo directorio.
- Las mediciones de rendimiento se limitan a una RTX 3090 Ti, vLLM 0.33.0, decodificacion voraz y una peticion a la vez; no se midio bajo carga por lotes ni en otras GPU.
- La aceleracion depende de la tasa de aceptacion de tokens borrador, que puede variar con el dominio del documento y la longitud de salida.
- Solo se soportan turco e ingles; el rendimiento en otros idiomas no esta documentado.
- El cabezal se entreno con autodestilacion sobre salidas del modelo base, por lo que hereda sus sesgos y errores de reconocimiento.
- Riesgo de alucinacion en la transcripcion de documentos con baja calidad de imagen o layouts atipicos, inherente al modelo base.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base MoganOCR-TR, no indicada en la informacion disponible.
- El uso del cabezal requiere configuracion especifica en vLLM (`speculative_config={"method": "mtp", "num_speculative_tokens": 3}`); sin ella, el rendimiento es el del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/burkap/MoganOCR-TR-MTP
- Modelo base: https://huggingface.co/moganai/MoganOCR-TR
- Dataset moganai/turkish-synthetic-documents: https://huggingface.co/datasets/moganai/turkish-synthetic-documents
- Dataset docling-project/DocLayNet-v1.2: https://huggingface.co/datasets/docling-project/DocLayNet-v1.2
- Dataset emredeveloper/turkish-ocr: https://huggingface.co/datasets/emredeveloper/turkish-ocr
- Dataset Voxel51/iam_handwriting_finevision: https://huggingface.co/datasets/Voxel51/iam_handwriting_finevision
- Dataset Voxel51/high-quality-invoice-images-for-ocr: https://huggingface.co/datasets/Voxel51/high-quality-invoice-images-for-ocr
- Dataset apoidea/pubtabnet-html: https://huggingface.co/datasets/apoidea/pubtabnet-html
- Dataset Voxel51/scanned_receipts: https://huggingface.co/datasets/Voxel51/scanned_receipts
- Dataset HumynLabs/Turkish_Documents_Datasets_PDF: https://huggingface.co/datasets/HumynLabs/Turkish_Documents_Datasets_PDF
