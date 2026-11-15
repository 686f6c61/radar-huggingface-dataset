# chandranarvind/qwen3-1.7b-receipt-distilled-haiku

## Resumen

`chandranarvind/qwen3-1.7b-receipt-distilled-haiku` es un ajuste fino (fine-tuning) del modelo Qwen3 de 1.700 millones de parametros, publicado por el usuario chandranarvind en Hugging Face. El modelo parte de la version cuantizada a 4 bits de Unsloth (`unsloth/Qwen3-1.7B-unsloth-bnb-4bit`) y se ha entrenado con la libreria Unsloth y el framework TRL, segun los tags y la model card del autor. El nombre sugiere un proceso de destilacion orientado a la extraccion de datos de recibos (receipt), presumiblemente tomando como referencia las salidas de un modelo Claude Haiku, aunque la model card no documenta ni confirma este extremo.

La relevancia del modelo es limitada en el ecosistema actual: se trata de un experimento de ajuste fino de caracter individual, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin resultados de benchmarks y con una model card minima que no aporta informacion sobre el dataset de entrenamiento, el procedimiento de destilacion ni las capacidades resultantes. El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar subidos o que el contaje de Hugging Face no los ha registrado.

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3 desarrollada por Alibaba, con soporte nativo de modo thinking y una ventana de contexto que en la familia Qwen3 alcanza los 32.768 tokens (ampliable). No obstante, estos datos corresponden al modelo base y no estan verificados para este ajuste concreto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) |
| Parametros totales | 1.700 millones (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta 32.768 tokens; no verificado para este ajuste) |
| Tipos de cuantizacion | El modelo base de partida esta en 4 bits (bnb-4bit); el ajuste se distribuye en safetensors. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre `unsloth/Qwen3-1.7B-unsloth-bnb-4bit`, una version del Qwen3-1.7B cuantizada a 4 bits con bitsandbytes y optimizada por Unsloth para entrenamiento con menor consumo de memoria. El entrenamiento se realizo con Unsloth y TRL, segun los tags del repositorio (`unsloth`, `trl`), lo que indica el uso del stack estandar de fine-tuning eficiente en parametros de Unsloth sobre transformers.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni la metodologia exacta de destilacion. El nombre del modelo sugiere un proceso de destilacion de conocimiento desde un modelo Claude Haiku hacia el Qwen3-1.7B, probablemente mediante generacion de datos sinteticos etiquetados por el modelo profesor, pero este extremo no esta documentado en la model card. Tampoco se detalla si se aplicaron tecnicas como LoRA, QLoRA o full fine-tuning, aunque el uso de una base en 4 bits apunta a QLoRA o a un esquema de bajo rango.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-1.7B.
- Razonamiento basico y respuesta a instrucciones, presumiblemente reforzado por el ajuste fino, aunque no documentado.
- Extraccion de informacion estructurada de recibos y documentos, segun sugiere el nombre del modelo; no confirmado en la model card.
- Soporte de tool calling y function calling: no documentado para este ajuste (el modelo base Qwen3 lo soporta).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking: no documentado para este ajuste (Qwen3 lo incorpora en el modelo base).

## Casos de uso

- Extraccion de datos de recibos y facturas: el modelo estaria orientado, por su nombre, a convertir tickets de compra en JSON estructurado con campos como comercio, fecha, importe, impuestos y lineas de detalle. Adecuado por su tamano reducido para procesamiento por lotes de alto volumen.
- Procesamiento de documentos en local: al caber en GPUs de consumo, permite desplegar un pipeline de digitalizacion de recibos sin enviar datos a servicios externos, util para cumplimiento de privacidad.
- Prototipado rapido de pipelines de OCR mas extraccion: combinado con un motor OCR (Tesseract, PaddleOCR), el modelo puede encargarse de la normalizacion y estructura turacion del texto extraido.
- Fine-tuning adicional como punto de partida: al ser un modelo pequeno con licencia Apache 2.0, sirve como base para ajustes especificos de dominio en entornos con recursos limitados.
- Clasificacion y enriquecimiento de transacciones: aplicable a la categorizacion automatica de gastos a partir del texto de recibos en aplicaciones de finanzas personales.
- Educacion y experimentacion: util como caso de estudio de destilacion y ajuste fino con Unsloth y TRL en entornos academicos o de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en cuantizacion de 4 bits; en torno a 3,5-4 GB en fp16 (estimacion basada en el tamano del modelo base, no verificada para este ajuste).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), vLLM, llama.cpp y Ollama si se generan cuantizaciones GGUF (no disponibles en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| chandranarvind/qwen3-1.7b-receipt-distilled-haiku | 1.700 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B | 1.700 M | 32.768 tokens | Apache 2.0 | Hugging Face (oficial) |
| Qwen/Qwen3-0.6B | 600 M | 32.768 tokens | Apache 2.0 | Hugging Face (oficial) |
| meta-llama/Llama-3.2-1B | 1.240 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face (oficial) |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para el modelo ajustado. El modelo oficial Qwen3-1.7B es la referencia natural, con documentacion completa, benchmarks publicados y soporte de la comunidad.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta dataset, hiperparametros, evaluacion ni limitaciones, lo que impide validar su calidad.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Repositorio de 0.0 GB: posible ausencia de pesos subidos o problema en el contaje; conviene verificar los archivos antes de intentar cargarlo.
- Riesgo elevado de alucinacion en la extraccion de campos estructurados, sin evaluacion publicada que lo cuantifique.
- Entrenado y etiquetado unicamente en ingles, lo que limita su uso con recibos en castellano u otros idiomas.
- El proceso de destilacion desde un modelo Claude Haiku no esta documentado; las condiciones de uso de las salidas del modelo profesor podrian afectar a la distribucion del modelo, aunque la licencia declarada es Apache 2.0.
- El modelo base esta cuantizado a 4 bits, lo que puede degradar la calidad respecto al Qwen3-1.7B original.
- No recomendado para produccion sin una evaluacion propia exhaustiva sobre el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/chandranarvind/qwen3-1.7b-receipt-distilled-haiku
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- Qwen3-1.7B oficial: https://huggingface.co/Qwen/Qwen3-1.7B
