# aliRafik/ERNIE_45_VL_28B_A3B_PT_LaTeX_OCR_finetuned_16bit

## Resumen

ERNIE_45_VL_28B_A3B_PT_LaTeX_OCR_finetuned_16bit es un ajuste fino (fine-tuning) del modelo multimodal ERNIE-4.5-VL-28B-A3B-PT, publicado por el usuario aliRafik en HuggingFace. Se trata de un modelo de imagen-a-texto especializado en OCR de fórmulas y documentos LaTeX, construido sobre la arquitectura MoE multimodal de la familia ERNIE 4.5 de Baidu y entrenado con las herramientas de Unsloth y la librería TRL de HuggingFace, según indica la propia model card.

El modelo hereda del identificador un total de 28.000 millones de parámetros con aproximadamente 3.000 millones activos por token (sufijo A3B), lo que lo sitúa en la categoría de MoE disperso orientado a inferencia eficiente. Su pipeline declarado es `image-text-to-text` y el repositorio ocupa 45,0 GB en pesos safetensors de 16 bits.

Su relevancia es acotada y muy específica: cubre el caso de digitalización automática de documentación científica y técnica con fórmulas matemáticas, un nicho donde los OCR genéricos fallan con frecuencia. No obstante, conviene señalar que el modelo no registra descargas ni valoraciones, no publica resultados de benchmarks y está etiquetado únicamente para inglés, por lo que debe evaluarse como un experimento de fine-tuning y no como un artefacto validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (vision-language), tipo declarado `ernie4_5_moe_vl`; transformer con mezcla de expertos |
| Parametros totales | 28B (derivado del identificador del modelo; no confirmado de forma explícita en la model card) |
| Parametros activos | 3B aprox. (derivado del sufijo A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en 16 bits (safetensors); no se documentan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano de repositorio: 45,0 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde al tipo declarado por la librería de Transformers como `ernie4_5_moe_vl`, es decir, un transformer multimodal con capa de mezcla de expertos (MoE) que procesa entradas de imagen y texto y genera texto. El modelo base, `unsloth/ERNIE-4.5-VL-28B-A3B-PT`, es una versión preentrenada (sufijo PT) de la familia ERNIE 4.5 en su variante de visión-lenguaje, con 28B parámetros totales y 3B activos por token según la nomenclatura del propio identificador. El pipeline `image-text-to-text` implica un codificador visual acoplado a la torre de lenguaje mediante proyecciones, aunque la model card no detalla la configuración interna de capas, número de expertos ni el mecanismo de enrutamiento.

En cuanto al entrenamiento, la información disponible es mínima: se trata de un fine-tuning del modelo base realizado con Unsloth y TRL, con un ahorro declarado de tiempo de entrenamiento de 2x respecto a un pipeline convencional. No se especifican el número de tokens de entrenamiento, la composición del dataset LaTeX utilizado, si hubo etapas de SFT, DPO o RLHF, ni hiperparámetros como tasa de aprendizaje, épocas o estrategia de enmascaramiento de pérdida. Tampoco se documenta si el ajuste congeló el codificador visual. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto a partir de imágenes (pipeline `image-text-to-text`), con especialización declarada en OCR de LaTeX.
- Reconocimiento óptico de caracteres sobre documentos con notación matemática, presumiblemente orientado a convertir imágenes de ecuaciones en código LaTeX.
- Comprensión de imágenes en general, heredada del modelo base multimodal ERNIE-4.5-VL.
- Generación de texto conversacional (etiqueta `conversational` en el repositorio).
- Compatibilidad con Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), lo que sugiere viabilidad de despliegue en HuggingFace Inference Endpoints.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, modo de pensamiento explícito ni capacidades de audio.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma declarada, aunque el modelo base podría tener cobertura adicional no reflejada en esta ficha.

## Casos de uso

- Digitalización de artículos científicos: convertir capturas o páginas escaneadas de papers con ecuaciones en LaTeX editable, aprovechando la especialización del ajuste fino sobre notación matemática.
- Construcción de bases de conocimiento técnico: procesar lotes de documentos PDF con fórmulas para extraer expresiones LaTeX e indexarlas en sistemas de búsqueda o documentación interna.
- Asistencia a investigadores y doctorandos: transcribir fragmentos de libros de texto, apuntes manuscritos o pizarras con ecuaciones a formato LaTeX reutilizable en Overleaf o entornos similares.
- Preprocesado para pipelines de publicación: integrar el modelo en una cadena de conversión de manuscritos escaneados a Markdown o LaTeX antes de la composición final.
- Migración de contenido legacy: digitalizar archivos de documentación técnica antigua publicada como imagen para reconstruir su código fuente matemático.
- Generación de datasets de entrenamiento: usar el modelo para etiquetar automáticamente pares imagen-LaTeX a gran escala y alimentar otros modelos de OCR matemático, con revisión humana posterior.
- Evaluación comparativa de OCR matemático: servir como punto de referencia en un banco de pruebas interno frente a otros sistemas de reconocimiento de fórmulas.

En todos los casos conviene tratar la salida como propuesta a revisar, dado que no existen métricas publicadas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (ni MMLU, ni HumanEval, ni GSM8K, ni métricas específicas de OCR como BLEU, exact match o edit distance sobre LaTeX), y la búsqueda web no ha devuelto documentación técnica relacionada.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 56 GB solo para pesos (28B parámetros x 2 bytes), más caché KV y activaciones; en la práctica se necesitan aproximadamente 60-70 GB de VRAM.
- GPU recomendadas para precisión completa: NVIDIA A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2 x A6000 48 GB o 2 x L40S 48 GB) con tensor parallelism.
- Viabilidad en GPU de consumo: no cabe en una RTX 4090 (24 GB) en 16 bits. Solo sería viable en consumer con cuantización agresiva (4 bits, ~16-20 GB), que no se distribuye en este repositorio y habría que generar.
- Opciones de despliegue: Transformers (librería declarada), Text Generation Inference (TGI) según la etiqueta del repositorio y compatibilidad con Inference Endpoints. El uso de Unsloth sugiere además compatibilidad con sus utilidades de carga y entrenamiento. No se confirma soporte de vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible. Al ser un MoE con 3B parámetros activos, el coste por token debería ser inferior al de un modelo denso de 28B, pero no hay mediciones publicadas.

Nota: el repositorio ocupa 45,0 GB, por debajo de los ~56 GB teóricos de un modelo de 28B en 16 bits. Es posible que el repositorio no incluya todos los fragmentos o que parte de los pesos esté en otra precisión; conviene verificarlo antes de asumir un despliegue en 16 bits completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE_45_VL_28B_A3B_PT_LaTeX_OCR_finetuned_16bit | 28B totales / 3B activos (derivado del nombre) | no disponible | No se han publicado benchmarks | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| unsloth/ERNIE-4.5-VL-28B-A3B-PT (modelo base) | 28B totales / 3B activos | no disponible en esta ficha | No disponible | apache-2.0 | HuggingFace (modelo base del ajuste) |
| Otros OCR especializados en LaTeX (por ejemplo, ajustes sobre Qwen2.5-VL o GOT-OCR2.0) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de validación publicada: el repositorio no tiene descargas ni valoraciones y no incluye métricas, lo que impide estimar su precisión real en OCR de LaTeX.
- Riesgo de alucinación: como todo modelo generativo, puede producir expresiones LaTeX sintácticamente plausibles pero incorrectas respecto a la imagen de entrada, especialmente en notación ambigua, tablas o diagramas.
- Idiomas: etiquetado únicamente como inglés. El comportamiento con documentos en castellano u otros idiomas dentro de la misma imagen no está documentado.
- Contexto: la longitud de contexto del modelo no se especifica en la información disponible; no se debe asumir una ventana amplia para documentos de muchas páginas.
- Licencia: apache-2.0 permite uso comercial, pero al tratarse de un ajuste sobre un modelo base de terceros conviene verificar los términos aplicables a la familia ERNIE 4.5 y conservar la atribución correspondiente.
- Discrepancia de tamano: el repositorio (45,0 GB) no coincide con el tamano teórico de 28B parámetros en 16 bits (~56 GB), lo que puede indicar pesos incompletos o en precisión mixta. Verificar antes de desplegar.
- Capacidades de agente y tool calling no documentadas: no se debe asumir soporte de function calling ni de razonamiento multi-paso.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información técnica relevante sobre el modelo; no se han podido corroborar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aliRafik/ERNIE_45_VL_28B_A3B_PT_LaTeX_OCR_finetuned_16bit
- Modelo base: https://huggingface.co/unsloth/ERNIE-4.5-VL-28B-A3B-PT
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: no se proporciona enlace directo en la información disponible
- Paper, blog o demo oficial del modelo: no disponible
- Resultados de búsqueda web: no contienen enlaces técnicos relevantes sobre este modelo
