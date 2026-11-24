# Mohammed422/invoices-donut-model-v3

## Resumen
El modelo `Mohammed422/invoices-donut-model-v3` es un modelo de visión y texto (image-text-to-text) publicado en Hugging Face por el usuario Mohammed422, orientado por su nombre a la extracción de información estructurada de facturas. Se basa en la arquitectura Donut (Document Understanding Transformer), un esquema vision-encoder-decoder que evita el uso de OCR externo y realiza la transcripción de documentos de forma extremo a extremo. El repositorio declara la librería `transformers` y pesos en formato `safetensors`.

El modelo cuenta con 202.098.104 parámetros totales (aproximadamente 202 millones), un tamaño propio de la familia Donut base, lo que lo sitúa en el rango de modelos ligeros desplegables en hardware de consumo. La model card publicada es la plantilla automática de Hugging Face y no aporta información sobre datos de entrenamiento, licencia, idiomas ni evaluación, por lo que la mayor parte de las especificaciones deben considerarse no disponibles.

Su relevancia práctica radica en el caso de uso: la digitalización y extracción de campos de facturas es una tarea de alto valor empresarial, y un modelo Donut afinado de 202 millones de parámetros puede ejecutarse en local con requisitos modestos. No obstante, la ausencia de documentación, de licencia explícita y de métricas publicadas limita seriamente su adopción en producción sin una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (familia Donut, `VisionEncoderDecoderModel`) |
| Parametros totales | 202.098.104 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Donut usa decodificación autoregresiva con límite de tokens de salida configurable, no un contexto de prompt extenso) |
| Tipos de cuantizacion | No disponible en la informacion; al ser safetensors, admite cuantización a fp16, int8 e int4 mediante herramientas estándar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 344,7 GB (incluye artefactos adicionales no detallados en la informacion) |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Descargas | 359 |
| Fecha de creacion | 2026-10-01 |
| Ultima actualizacion | 2026-10-29 |

## Arquitectura y entrenamiento
La arquitectura declarada es vision-encoder-decoder, coherente con Donut (Document Understanding Transformer), presentado en el paper arXiv:1910.09700 referenciado en los tags del repositorio. Donut combina un encoder visual tipo Swin Transformer que procesa la imagen del documento con un decoder de texto tipo BART que genera directamente la secuencia de salida (por ejemplo, un JSON con los campos de la factura), sin necesidad de un motor OCR separado ni de un pipeline de detección de layout.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes procesadas, la composición de los datos, ni sobre si se aplicaron técnicas de ajuste fino supervisado o preferencias (RLHF/DPO). La model card es la plantilla automática y no documenta hiperparámetros, régimen de precisión ni infraestructura de cómputo. El nombre del modelo sugiere un ajuste fino sobre un checkpoint Donut preentrenado para la tarea de facturas, pero este extremo no está confirmado en la información proporcionada.

## Capacidades
- Extracción de texto e información estructurada a partir de imágenes de documentos, orientada por el nombre del modelo a facturas.
- Generación de secuencias de texto condicionadas a una imagen de entrada (image-text-to-text).
- Transcripción de documentos sin pipeline OCR externo, al estilo Donut.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión adicional, audio).

## Casos de uso
- Digitalización de facturas en un ERP: el modelo recibe la imagen o el PDF renderizado de la factura y genera un JSON con campos como número, fecha, proveedor, base imponible, IVA y total, que se inserta directamente en el sistema contable.
- Automatización de cuentas por pagar: procesamiento por lotes de facturas recibidas por correo para extraer importes y fechas de vencimiento, reduciendo la introducción manual de datos.
- Validación de proveedores: extracción del CIF/NIF y la razón social para cruzarlos contra el maestro de proveedores antes de aprobar el pago.
- Archivado documental con metadatos: generación de índices buscables a partir de las facturas escaneadas, poblando un repositorio documental con campos estructurados.
- Procesamiento en local por privacidad: al tener 202 millones de parámetros, puede ejecutarse en una estación de trabajo sin enviar documentos financieros a servicios en la nube.
- Prototipado rápido de pipelines de extracción: servir como base para evaluar la viabilidad de Donut en un flujo concreto antes de invertir en un modelo mayor o en un servicio gestionado.
- Extracción de líneas de detalle: si el ajuste fino lo permite, generar las líneas de concepto de cada factura además de los totales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 202 millones de parámetros, en fp32 el modelo ocupa aproximadamente 0,8 GB; en fp16 unos 0,4 GB; en int8 unos 0,2 GB. A esto hay que sumar el encoder visual y las activaciones, por lo que en la práctica conviene reservar entre 2 y 4 GB de VRAM para procesar imágenes de resolución típica de documento.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para lotes grandes, una A10G, L4 o A100 aceleran el throughput.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `VisionEncoderDecoderModel` y `DonutProcessor`; exportación a ONNX Runtime para producción; integración en servicios FastAPI o similares. No se documenta soporte nativo en vLLM ni en llama.cpp, dado que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponibles en la informacion; en una GPU de consumo se espera del orden de décimas de segundo por página con procesamiento por lotes, pero este dato no está confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mohammed422/invoices-donut-model-v3 | 202 M | Imagen de documento | Extracción de facturas | No disponible | Hugging Face, 359 descargas |
| naver-clova-ix/donut-base | ~200 M | Imagen de documento | Document understanding genérico | MIT | Hugging Face, muy extendido |
| microsoft/trocr-base-printed | ~334 M | Imagen de línea de texto | Reconocimiento de texto impreso | MIT | Hugging Face |
| LayoutLMv3-base | ~133 M | Imagen + texto + layout | Clasificación y extracción con OCR | CC BY-NC-SA 4.0 (restringida) | Hugging Face |

La comparación se basa en la familia arquitectónica y el tamaño, no en resultados medidos, ya que no hay benchmarks publicados para este modelo. Donut base es el referente directo por arquitectura; TrOCR es una alternativa si se dispone de un pipeline OCR propio; LayoutLMv3 requiere OCR externo pero ofrece modelado de layout explícito.

## Limitaciones y advertencias
- La model card es la plantilla automática: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto, lo que impide garantizar su comportamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un bloqueo crítico para producción.
- Idiomas no documentados: no se puede asegurar el soporte de facturas en castellano ni en otros idiomas.
- Riesgo de alucinación en campos numéricos: en tareas de extracción, un error en un importe o en un CIF puede tener consecuencias contables; se recomienda validación posterior con reglas de negocio.
- El tamaño del repositorio (344,7 GB) es desproporcionado para un modelo de 202 millones de parámetros y sugiere la presencia de artefactos adicionales no documentados; conviene revisar los archivos antes de descargar.
- Sin métricas publicadas, no es posible comparar su precisión con alternativas ni estimar su tasa de error en documentos reales.
- Modelo con muy pocas descargas y sin likes: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Al ser un modelo de documento, no está pensado para conversación multi-turno ni para prompts largos; su entrada es una imagen y su salida una secuencia acotada.

## Enlaces
- Hugging Face: https://huggingface.co/Mohammed422/invoices-donut-model-v3
- Paper de Donut (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Repositorio oficial de Donut (referencia de la arquitectura): https://github.com/clovaai/donut
- Checkpoint base de referencia: https://huggingface.co/naver-clova-ix/donut-base
