# lugman-madhiai/invoice-split-2023-adapter

## Resumen

`lugman-madhiai/invoice-split-2023-adapter` es un adaptador de ajuste fino (fine-tuning) publicado en HuggingFace por el usuario lugman-madhiai. No es un modelo completo, sino un conjunto de pesos derivados de `unsloth/Qwen3-VL-8B-Instruct`, un modelo multimodal de visión-lenguaje de la familia Qwen3-VL con aproximadamente 8 000 millones de parámetros. El nombre del repositorio sugiere que el ajuste se ha orientado a tareas de segmentación y tratamiento de facturas (invoice splitting), probablemente entrenado sobre documentos de 2023, aunque la model card no documenta el conjunto de datos utilizado.

El adaptador se ha entrenado con Unsloth, una biblioteca de optimización que, según la propia model card, permitió un entrenamiento "2x más rápido". El repositorio ocupa 0,2 GB, un tamaño coherente con un adaptador LoRA en lugar de un modelo con pesos completos, y se distribuye en formato safetensors con licencia Apache 2.0 y etiqueta de idioma únicamente en inglés.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un artefacto de ajuste fino especializado, sin descargas ni validación pública en el momento de su publicación, y sin métricas de evaluación declaradas. Resulta útil como ejemplo del flujo Unsloth + Qwen3-VL aplicado a un dominio documental concreto, pero cualquier uso en producción exigiría una evaluación propia, ya que el autor no aporta datos de rendimiento ni de composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de ajuste fino sobre un transformer multimodal (visión-lenguaje) Qwen3-VL; no se detalla la configuración del adaptador (rango, capas objetivo) |
| Parametros totales | Aproximadamente 8 000 millones en el modelo base tras fusionar el adaptador (derivado del nombre `Qwen3-VL-8B-Instruct`); el número de parámetros del adaptador no está disponible (repositorio de 0,2 GB) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors y la cuantización requeriría fusionar el adaptador con el modelo base |
| Idiomas soportados | Inglés (`en`), según la model card |
| Licencia | Apache 2.0 (declarada en la model card) |
| Formato de pesos | Safetensors (adaptador compatible con transformers y PEFT) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del adaptador. Los metadatos indican que se trata de un ajuste fino sobre `unsloth/Qwen3-VL-8B-Instruct`, un modelo de la familia Qwen3-VL que combina un codificador visual con un transformer de lenguaje, lo que implica capacidad para procesar entradas de imagen y texto de forma conjunta. El adaptador se ha entrenado con la biblioteca Unsloth y con TRL (tag `trl`), un stack habitual para ajuste supervisado y optimizaciones de memoria en GPUs de gama consumer.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica específica más allá del uso de Unsloth. El nombre del repositorio (`invoice-split-2023-adapter`) apunta a un dataset de facturas de 2023, pero esto es una inferencia a partir del identificador y no un dato confirmado por el autor. Cualquier afirmación sobre el dominio real de entrenamiento debe considerarse no verificada.

## Capacidades

- Generación de texto y procesamiento multimodal: hereda del modelo base la capacidad de trabajar con entradas de imagen y texto, lo que permite procesar documentos escaneados o fotografías de facturas.
- Extracción de información documental: el ajuste específico apunta a tareas de segmentación y tratamiento de facturas, presumiblemente separación de documentos múltiples y extracción de campos.
- Comprensión de documentos con estructura variable: los modelos visión-lenguaje pueden manejar diseños de factura heterogéneos sin plantillas rígidas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (dependería de las capacidades del modelo base, no documentadas en esta ficha).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés; el comportamiento en otros idiomas no está documentado y debe considerarse no disponible.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Separación de PDFs con múltiples facturas: el adaptador se integraría en un pipeline que recibe un PDF con varios documentos concatenados, los clasifica página a página y genera ficheros individuales por factura, reduciendo el trabajo manual en departamentos de cuentas a pagar.
- Extracción estructurada de campos de factura: conversión de una imagen de factura en JSON con emisor, receptor, número de factura, fecha, base imponible, IVA y total, como paso previo a la carga en un ERP.
- Validación y cuadre de importes: uso del modelo para verificar que los subtotales, impuestos y totales de un documento son internamente coherentes antes de contabilizarlos.
- Triaje documental en bandejas de entrada: clasificación automática de correos y adjuntos para decidir si contienen facturas, albaranes u otros documentos, derivando cada uno al flujo correspondiente.
- Digitalización de archivos históricos: procesamiento por lotes de facturas escaneadas de ejercicios anteriores, con salida tabular lista para auditoría o conciliación contable.
- Asistencia a la conciliación bancaria: extracción del importe y la fecha de cada factura para cruzarlos automáticamente con movimientos bancarios, señalando discrepancias para revisión humana.
- Prototipado rápido de flujos documentales: al ser un adaptador sobre un modelo de 8 000 millones de parámetros, permite experimentar con ajuste fino específico de dominio con presupuesto reducido antes de escalar a modelos mayores.
- Enriquecimiento de bases de conocimiento internas: generación de metadatos estructurados a partir de facturas para alimentar buscadores o sistemas RAG corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud en extracción de campos, F1 sobre segmentación de documentos ni comparaciones con otros modelos. El repositorio registra cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe validación externa conocida.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de ~8 000 millones de parámetros fusionado con el adaptador): en bf16/fp16, del orden de 16 GB de pesos más memoria para caché KV e imágenes; en cuantización de 8 bits, aproximadamente 9-10 GB; en cuantización de 4 bits, aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servir en precisión completa con lotes moderados; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con una sola petición.
- Compatibilidad con GPU de consumo: sí, en tarjetas de 16 GB o más si se aplica cuantización de 8 o 4 bits; en GPUs de 12 GB la cuantización de 4 bits es el escenario realista, con margen ajustado para entradas de imagen de alta resolución.
- Opciones de despliegue: transformers con PEFT para fusionar el adaptador; vLLM o TGI para servir el modelo fusionado; llama.cpp/Ollama si se convierte a GGUF; los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y con los endpoints gestionados de HuggingFace.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lugman-madhiai/invoice-split-2023-adapter` | Adaptador sobre base de ~8 000 M | No disponible | No publicado | Apache 2.0 | Pública, sin descargas ni validación |
| `unsloth/Qwen3-VL-8B-Instruct` (modelo base) | ~8 000 M | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Pública |
| `Qwen2.5-VL-7B-Instruct` (alternativa multimodal de tamaño similar) | ~7 000 M | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Pública |
| Modelos especializados de documentos tipo Donut o LayoutLM | No disponible | No disponible | No disponible | No disponible | Públicas, orientadas a documentos |

La comparación cuantitativa no es posible con la información disponible: no hay métricas publicadas para este adaptador ni datos verificados en esta ficha sobre las alternativas. La diferencia cualitativa relevante es que este repositorio es un ajuste específico de dominio sobre un modelo multimodal generalista, mientras que las alternativas citadas son modelos base sin especialización en facturas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y fusionar el modelo base `unsloth/Qwen3-VL-8B-Instruct` para poder ejecutarse.
- Ausencia total de evaluación: no hay benchmarks, ni métricas de extracción, ni validación por terceros; el rendimiento real en facturas es desconocido.
- Dataset de entrenamiento no documentado: se desconoce el volumen, la procedencia y la composición de los datos, lo que impide estimar sesgos y riesgo de sobreajuste a formatos concretos de 2023.
- Riesgo de alucinación en campos numéricos: como cualquier modelo generativo aplicado a documentos, puede producir importes, fechas o identificadores fiscales plausibles pero incorrectos; se requiere validación determinista posterior y revisión humana en flujos contables.
- Limitación de idioma: la model card declara únicamente inglés, por lo que el comportamiento con facturas en castellano u otros idiomas no está garantizado ni documentado.
- Posible degradación con documentos fuera de distribución: diseños de factura distintos a los vistos en entrenamiento, sellos, firmas manuscritas, tablas anidadas o escaneos de baja calidad pueden degradar la precisión.
- Restricciones de licencia: el adaptador se declara bajo Apache 2.0, pero conviene verificar la licencia del modelo base y de cualquier componente de terceros antes de un uso comercial; la información proporcionada no detalla la licencia del modelo base.
- Repositorio sin mantenimiento aparente: cero descargas y cero valoraciones, sin documentación de versiones ni de cambios.
- Requisitos de memoria: la inferencia en precisión completa supera los 16 GB de VRAM, lo que excluye muchas GPUs de consumo si no se aplica cuantización.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/lugman-madhiai/invoice-split-2023-adapter
- Modelo base: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct
- Perfil del autor: https://huggingface.co/lugman-madhiai
- Otro repositorio del mismo autor: https://huggingface.co/lugman-madhiai/invoice-structured-extraction
- Unsloth (biblioteca de entrenamiento): https://github.com/unslothai/unsloth
- Repositorio relacionado de extracción multimodal de facturas: https://github.com/vinay10082/13-multimodal-invoice-extractor
- Repositorio relacionado de separación de facturas: https://github.com/jsheppard8989/invoice-splitter
