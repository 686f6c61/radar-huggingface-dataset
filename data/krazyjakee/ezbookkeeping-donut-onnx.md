# krazyjakee/ezbookkeeping-donut-onnx

## Resumen

Este repositorio contiene conversiones a ONNX con cuantización de 8 bits de dos checkpoints Donut de comprensión de documentos, orientados específicamente al reconocimiento de recibos y facturas. Lo publica krazyjakee como artefacto de soporte para ezbookkeeping (en la model card aparece escrito como "ezrbookkeeping"), una aplicación de contabilidad personal que incorpora un proveedor de reconocimiento de recibos basado en Donut. El modelo no se distribuye como checkpoint entrenable, sino como pesos de inferencia listos para desplegar dentro de esa aplicación.

Donut es una arquitectura encoder-decoder libre de OCR: un encoder visual Swin Transformer procesa la imagen del documento y un decoder mBART genera directamente la estructura JSON de campos extraídos, sin necesidad de detectar cajas de texto ni aplicar un OCR separado. El repositorio empaqueta dos variantes: una entrenada sobre SROIE (recibos malasios) con prompt de tarea `<s>` que extrae empresa, dirección, fecha y total, y otra entrenada sobre recibos y facturas sintéticas con prompt `<s_receipt>` que extrae nombre de tienda, dirección, fecha, hora, totales y líneas de detalle.

La relevancia es práctica: ofrece pesos ya cuantizados y exportados a ONNX (encoder y decoder separados, con caché de clave/valor y embeddings ligados restaurados), lo que facilita la inferencia en CPU sin depender de PyTorch ni de GPU. El tamaño del repositorio es de aproximadamente 0,6 GB. Al ser conversiones de modelos comunitarios entrenados sobre datos limitados, conviene verificar empíricamente qué campos reconoce cada variante antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Donut (encoder Swin Transformer + decoder mBART, sin OCR) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por la longitud máxima de secuencia del decoder Donut, no especificada) |
| Tipos de cuantizacion | 8 bits: cuantización dinámica del encoder; decoder con MatMulNBits (nivel de precisión 4) y embeddings de 8 bits |
| Idiomas soportados | no disponible (los checkpoints origen se entrenaron sobre recibos SROIE, en inglés y malasio, y recibos/facturas sintéticas) |
| Licencia | other (apache-2.0-and-mit): variante `receipts/` Apache 2.0, variante `sroie/` MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`) + `tokenizer.json` + `donut.json` |

## Arquitectura y entrenamiento

La arquitectura es Donut, un modelo de comprensión de documentos de extremo a extremo: el encoder Swin procesa la imagen completa del recibo y el decoder mBART genera la secuencia de campos en formato estructurado, guiado por un prompt de tarea. La exportación a ONNX separa encoder y decoder; el decoder se exporta fusionado con caché de clave/valor (`use_cache_branch`) y con los embeddings ligados restaurados antes de la exportación, algo relevante porque el checkpoint `receipts/` depende de esa ligadura.

Los checkpoints originales son fine-tunes comunitarios: `mychen76/invoice-and-receipts_donut_v1` (Apache 2.0) entrenado sobre recibos SROIE y recibos/facturas sintéticas, y `unstructuredio/donut-base-sroie` (MIT) entrenado sobre SROIE. No se dispone de información sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO. La innovación técnica del artefacto es la cuantización: encoder con cuantización dinámica de 8 bits, decoder con pesos MatMul de 8 bits y cuantización de activaciones por bloques (MatMulNBits, nivel de precisión 4), más embeddings de 8 bits. El script de conversión está publicado en el repositorio de ezbookkeeping (`tools/donut-worker/convert_models.py`).

## Capacidades

- Extracción estructurada de campos de recibos e facturas a partir de la imagen, sin pipeline OCR separado.
- Variante `receipts/` (prompt `<s_receipt>`): nombre de tienda, dirección, fecha, hora, totales y líneas de detalle.
- Variante `sroie/` (prompt `<s>`): empresa, dirección, fecha y total.
- Inferencia ONNX con caché de clave/valor en el decoder, apta para ejecución en CPU.
- Verificación de integridad por SHA-256 en la descarga dentro de ezbookkeeping.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-step, visión general, audio ni modo de pensamiento. El uso previsto es exclusivamente document understanding de recibos.
- Capacidades multilingües: no disponibles como dato; los datos de entrenamiento de origen son recibos SROIE (inglés/malasio) y sintéticos.

## Casos de uso

- Digitalización de recibos de compra en ezbookkeeping: el worker descarga los ONNX, verifica SHA-256 y ejecuta la inferencia para convertir la foto del ticket en campos contables (comercio, fecha, total), alimentando el registro de gastos sin OCR externo.
- Extracción de líneas de detalle para contabilidad analítica: la variante `receipts/` devuelve líneas de artículos, útil para desglosar gastos por categoría o producto en herramientas de finanzas personales o PYMES.
- Procesamiento por lotes de facturas en CPU: al estar cuantizado a 8 bits y exportado a ONNX, permite ejecutar la extracción en servidores sin GPU, por ejemplo en un contenedor de backend con presupuesto limitado.
- Validación cruzada de dos variantes: usar `sroie/` para campos mínimos (empresa, fecha, total) y `receipts/` para el detalle, comparando resultados para detectar recibos mal reconocidos.
- Integración en pipelines de captura móvil: la app móvil sube la imagen, el servidor ejecuta los ONNX y persiste el JSON resultante, con el modelo como componente de un servicio autohospedado.
- Prototipado de sistemas de gastos: al ser pesos ONNX de 0,6 GB, sirve como base rápida para evaluar si Donut es suficiente antes de entrenar un fine-tune propio sobre recibos de otra región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser ONNX cuantizado a 8 bits, está pensado para ejecución en CPU; con GPU, la huella sería reducida pero no se especifica.
- GPU recomendadas: no disponibles. No hay datos de latencia ni throughput por GPU.
- Cabe en GPU consumer: previsiblemente sí por el tamaño del repositorio (0,6 GB), pero no hay confirmación ni cifras publicadas.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); vLLM, llama.cpp, Ollama y TGI no aplican a este formato/modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ezbookkeeping-donut-onnx (este) | no disponible | no disponible | Receipts/facturas (ONNX 8 bits) | other (Apache 2.0 + MIT) | Hugging Face, 0 descargas |
| mychen76/invoice-and-receipts_donut_v1 | no disponible | no disponible | Receipts/facturas (PyTorch) | Apache 2.0 | Hugging Face |
| unstructuredio/donut-base-sroie | no disponible | no disponible | SROIE (PyTorch) | MIT | Hugging Face |

La comparativa directa con modelos de la misma categoría (Donut base, LayoutLMv3, Pix2Struct) no está disponible en la información proporcionada; los checkpoints de origen son los antecesores directos de este artefacto.

## Limitaciones y advertencias

- Los checkpoints de origen son fine-tunes comunitarios entrenados sobre SROIE (recibos malasios) y recibos/facturas sintéticas; el rendimiento sobre recibos de otras regiones, idiomas o formatos no está garantizado y debe verificarse empíricamente.
- Riesgo de alucinación: como modelo generativo de campos, puede producir valores plausibles pero incorrectos (fechas, totales, nombres) sin señal de confianza; conviene validación posterior.
- Sin datos publicados sobre sesgos, idiomas soportados, contexto máximo ni benchmarks.
- Licencia "other": la variante `receipts/` queda bajo Apache 2.0 y `sroie/` bajo MIT, pero los derechos de autor y licencias de los pesos originales siguen en manos de sus autores; revisar antes de uso comercial.
- El artefacto está diseñado como dependencia de ezbookkeeping (descarga y verificación SHA-256); su uso fuera de esa aplicación requiere implementar el worker y respetar `donut.json` (tamaño de entrada, prompt de tarea y forma del decoder).
- Repositorio con 0 descargas y 0 likes: poca validación externa; tratar como artefacto de nicho.

## Enlaces

- [Hugging Face: krazyjakee/ezbookkeeping-donut-onnx](https://huggingface.co/krazyjakee/ezbookkeeping-donut-onnx)
- [Checkpoint origen receipts: mychen76/invoice-and-receipts_donut_v1](https://huggingface.co/mychen76/invoice-and-receipts_donut_v1)
- [Checkpoint origen SROIE: unstructuredio/donut-base-sroie](https://huggingface.co/unstructuredio/donut-base-sroie)
- [Repositorio ezbookkeeping](https://github.com/krazyjakee/ezbookkeeping)
- [Script de conversión](https://github.com/krazyjakee/ezbookkeeping/blob/main/tools/donut-worker/convert_models.py)
