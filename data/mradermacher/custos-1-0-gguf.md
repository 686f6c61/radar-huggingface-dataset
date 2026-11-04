# mradermacher/custos-1.0-GGUF

## Resumen

custos-1.0-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo custos-1.0, publicada por el usuario mradermacher, conocido en HuggingFace por distribuir versiones cuantizadas de modelos de terceros para su uso con llama.cpp y herramientas compatibles. No se trata de un modelo original, sino de una conversión del repositorio base qianqianzhisuan/custos-1.0, cuyo contenido técnico no se detalla en la información disponible.

La model card del repositorio es mínima: únicamente incluye metadatos internos del proceso de cuantización (versión del script, tipo de conversión `hf`, lista de cuantizaciones generadas) y una referencia al modelo original. No se aportan datos sobre arquitectura, número de parámetros, longitud de contexto, idiomas ni licencia, lo que limita considerablemente cualquier evaluación técnica rigurosa.

La relevancia de esta ficha es, por tanto, descriptiva: documenta la existencia de una familia de cuantizaciones GGUF (desde Q2_K hasta F16, pasando por Q3, Q4, Q5, Q6, Q8 e IQ4_XS) que permiten ejecutar custos-1.0 en hardware de consumo mediante llama.cpp, siempre que el usuario consulte el repositorio original para conocer las características reales del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas desde pesos en formato HF) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base custos-1.0 (transformer, MoE, híbrido u otra), ni sobre el volumen o composición de los datos de entrenamiento, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o similares. La model card del repositorio GGUF no incluye ninguna sección técnica al respecto.

Lo único verificable a partir de los metadatos es el proceso de conversión: se ha utilizado la versión 2 del script de cuantización, con conversión de tipo `hf` (es decir, partiendo de pesos en formato HuggingFace) y cuantización de tensores de salida activada (`output_tensor_quantised: 1`). El flag `skip_mmproj: 1` sugiere que no se ha generado un proyector multimodal, lo que podría indicar que el modelo base es solo de texto o que la conversión no cubre componentes de visión.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- No consta soporte de tool calling, function calling ni razonamiento multi-paso.
- No consta soporte multilingüe declarado.
- No consta modo de razonamiento extendido (thinking mode), visión, audio ni otras modalidades.
- La única capacidad inferible es la generación de texto estándar a través de llama.cpp y runtimes compatibles con GGUF, asumiendo que el modelo base sea un LLM de texto.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q4_K_S permiten ejecutar el modelo en GPUs con 8-16 GB de VRAM o en CPU con llama.cpp, siempre que el tamaño real del modelo base lo permita (dato no disponible).
- Prototipado rápido en local: usar la variante Q8_0 o F16 para evaluar la calidad del modelo base antes de comprometerse con una integración en producción.
- Integración en aplicaciones de escritorio: Ollama, LM Studio y cualquier frontend compatible con GGUF pueden cargar estas cuantizaciones directamente sin conversión adicional.
- Evaluación comparativa de cuantizaciones: la disponibilidad de Q2_K a F16 permite medir la degradación de calidad por nivel de compresión en el modelo custos-1.0.
- Inferencia en entornos sin GPU: las variantes Q3_K_S y Q2_K reducen el peso en disco y RAM, útiles para servidores modestos o entornos embebidos.
- Distribución offline: el formato GGUF empaqueta pesos y tokenizador en un solo archivo, lo que facilita el despliegue en entornos air-gapped.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el número de parámetros del modelo base.
- GPU recomendadas: no disponible por el mismo motivo.
- Viabilidad en GPU de consumo: depende del tamaño del modelo base; las cuantizaciones Q4_K_M e IQ4_XS son las habitualmente recomendadas para GPUs de 8-24 GB, pero no se puede confirmar sin conocer los parámetros.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime con soporte GGUF. No se garantiza compatibilidad con vLLM o TGI, que suelen requerir pesos en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría, tamaño y propósito del modelo base custos-1.0.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base.
- La licencia no está declarada en el repositorio GGUF; es imprescindible consultar la licencia del repositorio original qianqianzhisuan/custos-1.0 antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validación por parte de la comunidad.
- Al ser una cuantización de terceros, no hay garantía de que la conversión preserve fielmente el comportamiento del modelo original; las variantes de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- La ausencia de proyector multimodal (`skip_mmproj: 1`) sugiere que, si el modelo base tuviera capacidades de visión, estas no estarían disponibles en estas cuantizaciones.
- No se dispone de información sobre la fecha real de creación del modelo base ni sobre su procedencia, lo que dificulta evaluar su vigencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/custos-1.0-GGUF
- Modelo original: https://huggingface.co/qianqianzhisuan/custos-1.0
