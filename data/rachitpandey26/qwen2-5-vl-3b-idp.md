# rachitpandey26/qwen2.5-vl-3b-idp

## Resumen

El modelo `rachitpandey26/qwen2.5-vl-3b-idp` es un ajuste fino completo (full fine-tune) del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por el autor rachitpandey26 como proyecto de aprendizaje y prueba de concepto. Está especializado en procesamiento inteligente de documentos (IDP), concretamente en la extracción estructurada de campos de facturas escaneadas: devuelve un objeto JSON con datos como proveedor, cliente, fecha, importe total, moneda, etc. La relevancia actual radica en que demuestra cómo un modelo de visión y lenguaje de tamaño compacto (3,7 mil millones de parámetros) puede adaptarse con un ajuste fino completo a una tarea vertical concreta, aunque con limitaciones propias de su escala.

El modelo parte del checkpoint Qwen2.5-VL-3B-Instruct de Alibaba, y ha sido entrenado con datos públicos web de pequeño tamaño (prueba de concepto) durante 5 épocas, utilizando el framework ms-swift. Los resultados reportados en la validación muestran mejoras sustanciales frente al modelo base sin ajustar, aunque con una precisión limitada en campos numéricos complejos. El autor lo posiciona como un extractor de primera pasada, recomendable con revisión humana posterior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (modelo de lenguaje multimodal con codificador de visión) |
| Parametros totales | 3.754.622.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | No disponible (se publican pesos safetensors en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | qwen-research (licencia de investigación, no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL, un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje. El ajuste fino se realizó sobre el checkpoint instructivo de 3B parámetros, con entrenamiento completo (todos los parámetros) mediante SFT supervisado. Se usó el framework ms-swift, con 5 épocas, batch efectivo de 16, tasa de aprendizaje 1e-5, precisión bf16 y atención flash 2. Los datos de entrenamiento provienen de conjuntos públicos web, de tamaño reducido, lo que limita la generalización del modelo. No se menciona el uso de RLHF ni DPO, solo SFT.

## Capacidades

- Extracción de campos estructurados de facturas escaneadas: devuelve JSON con vendor, customer, invoice_date, total_amount, currency, invoice_number, entre otros.
- Comprensión de documentos visuales: procesa imágenes de facturas (escaneos o fotografías) y las convierte en texto estructurado.
- Generación de JSON válido: el modelo produce siempre una salida JSON válida en el conjunto de validación (100% de éxito), frente al 0% del modelo base.
- Multilingüe: aunque la model card indica idioma inglés (en), el modelo base Qwen2.5-VL tiene soporte multilingüe, pero este ajuste no especifica otros idiomas.
- Sin soporte de tool calling ni agentes: no se menciona en la documentación.
- Sin modo thinking ni capacidades de audio: no disponible.

## Casos de uso

- Automatización de facturación en PYMES: el modelo puede extraer automáticamente datos de facturas escaneadas para su integración en sistemas de contabilidad, reduciendo la entrada manual de datos.
- Sistema de revisión de facturas: como primer filtro automático, extrae campos y los envía a un proceso de validación humana para corregir errores en campos numéricos.
- Clasificación y archivado de documentos: permite indexar facturas por proveedor, fecha o importe, facilitando la búsqueda y gestión documental.
- Preprocesamiento para pipelines de pago: extrae el importe total, moneda y número de factura para alimentar sistemas de conciliación bancaria.
- Análisis de gastos corporativos: agrega datos de facturas de múltiples proveedores para generar informes de gastos sin intervención manual.
- Prototipado de soluciones IDP: sirve como base de aprendizaje para desarrolladores que quieran experimentar con la adaptación de VLMs a tareas de extracción de documentos.

## Benchmarks y rendimiento

La información proporcionada incluye resultados de validación sobre un conjunto de 481 muestras, comparando el modelo ajustado con el modelo base sin entrenar. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval.

| Campo | Modelo base | Este modelo |
|---|---|---|
| JSON válido | 0% | 100% |
| currency | 2.5% | 85% |
| invoice_date | 2.9% | 74% |
| total_amount | 17.5% | 68% |
| invoice_number | 35.7% | 57% |
| vendor.name | 0% | 48% |

Además, el autor reporta una precisión de 90-100% en campos fáciles como payment_method, email, discount y balance_due. Los campos numéricos complejos (importes, números de factura) se sitúan en un 60-70%, lo que refleja la capacidad limitada del modelo de 3B para documentos escaneados difíciles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. El modelo tiene 3.754 millones de parámetros; en BF16, el peso ocupa aproximadamente 7.5 GB (tamaño del repositorio), por lo que se necesitará al menos 8 GB de VRAM para cargarlo completo. Con cuantización a 4 bits, se podría reducir a unos 2-3 GB, pero no se proporcionan datos oficiales.
- GPUs recomendadas: no se especifican. Dado el tamaño, es viable en GPUs consumer como RTX 3060 (12 GB) o RTX 4090 (24 GB) si se usa cuantización. Para BF16 sin cuantizar, se requiere una GPU con al menos 8 GB de VRAM.
- Opciones de despliegue: el modelo se puede usar con ms-swift (como se muestra en el ejemplo) y es compatible con el ecosistema de Hugging Face Transformers. También es probable que funcione con vLLM, llama.cpp u Ollama, aunque no se ha verificado.
- Latencia y throughput: no se proporcionan datos.

## Comparativa con modelos similares

La única comparación directa disponible es con el modelo base Qwen2.5-VL-3B-Instruct, que es el punto de partida. No se dispone de comparaciones con otros modelos de extracción de facturas.

| Modelo | Parámetros | Contexto | Precisión en total_amount | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-vl-3b-idp | 3,75B | No disponible | 68% | qwen-research | Hugging Face |
| Qwen2.5-VL-3B-Instruct (base) | 3,75B | No disponible | 17,5% | qwen-research | Hugging Face |

Otros modelos comparables de la misma categoría (p. ej., modelos de extracción de documentos como LayoutLMv3, o VLMs como Qwen2-VL-7B) no se han incluido por falta de datos en la información proporcionada.

## Limitaciones y advertencias

- Proyecto de prueba de concepto: el autor lo declara explícitamente como un aprendizaje, no como un modelo listo para producción.
- Datos de entrenamiento muy reducidos: el conjunto de datos es pequeño y de fuentes públicas, lo que limita la generalización a facturas con formatos variados.
- Precisión limitada en campos numéricos: los importes y números de factura tienen una exactitud de 60-70%, lo que requiere revisión humana en casos críticos.
- Licencia de investigación: la licencia qwen-research no permite uso comercial, restringiendo su aplicación en entornos empresariales.
- Solo inglés: el entrenamiento se ha realizado con datos en inglés, no se garantiza el rendimiento en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir valores plausibles pero incorrectos en campos no bien reconocidos.
- Sin garantías de soporte: el autor no ofrece mantenimiento ni actualizaciones.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/rachitpandey26/qwen2.5-vl-3b-idp
- Modelo base (Qwen2.5-VL-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio oficial de Qwen2.5-VL (GitHub): https://github.com/elsawhs/qwen2.5-vl
- Reporte técnico de Qwen2.5-VL (en el repositorio, sin enlace directo en la información)
- Ejemplo de uso con ms-swift (incluido en la model card)
