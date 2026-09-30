# developertce/pdf-structurer-qwen-1.5b

## Resumen

pdf-structurer-qwen-1.5b es un adaptador LoRA publicado por el usuario developertce en HuggingFace, entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No se trata de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptación (repo de 0,1 GB) que debe cargarse junto al modelo base mediante la librería PEFT (versión 0.21.1 declarada en la model card). El nombre del repositorio sugiere una especialización en el análisis y estructuración de documentos PDF, aunque la model card no documenta la tarea, el dataset ni el procedimiento de entrenamiento.

El interés de esta ficha es limitado pero real: se trata de un ejemplo típico de adaptación ligera (LoRA) sobre un modelo pequeño de la familia Qwen2.5, un enfoque que permite especializar un modelo de 1.500 millones de parámetros en una tarea concreta con un coste de entrenamiento muy bajo y un artefacto distribuible de apenas 100 MB. Para quien quiera reproducir el patrón, sirve como referencia de estructura de repositorio PEFT.

La información pública es prácticamente inexistente: la model card es la plantilla por defecto de HuggingFace sin rellenar, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se declara licencia, idiomas ni resultados de evaluación. Por tanto, cualquier dato que no sea la relación con Qwen2.5-1.5B-Instruct o el tamaño del repositorio debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-1.5B-Instruct); rango, alpha y modulos objetivo no disponibles |
| Parametros totales | Modelo base: ~1,5 mil millones. Adaptador: no disponible (repo de 0,1 GB, incluye otros artefactos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct; no se documenta si el adaptador la modifica |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; puede combinarse con el base en bf16, fp16, int8 o GGUF, pero el autor no lo especifica) |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5 declara soporte de unas 29 lenguas, incluido el espanol |
| Licencia | No disponible para el adaptador. El modelo base Qwen2.5-1.5B-Instruct se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base y que, sumadas a los pesos congelados de este, producen el comportamiento especializado. La model card no especifica el rango (r), el valor de alpha, la tasa de dropout ni qué módulos se adaptaron (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), que son los hiperparámetros habituales que determinan la huella y la capacidad del adaptador. Tampoco se indica si se entrenó con precisión bf16, fp16 o fp32, ni el número de pasos, épocas o tokens de entrenamiento.

Respecto al modelo base, Qwen2.5-1.5B-Instruct es un transformer decoder-only de la familia Qwen2.5 de Alibaba, con normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y atención con consultas agrupadas (GQA) para reducir el coste de memoria de la caché KV. Qwen2.5 se preentrenó sobre datos multilingües a gran escala y se ajustó posteriormente con técnicas de alineación con preferencias humanas. No hay información pública sobre la composición del dataset de ajuste del adaptador ni sobre si se empleó RLHF, DPO u otro método de alineación específico para la tarea de estructuración de PDF.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Presunta extracción de estructura a partir de documentos PDF (la especialidad se deduce del identificador del repositorio, no de documentación aportada por el autor).
- Razonamiento básico y respuesta a instrucciones en formato chat, si el adaptador conserva la plantilla de conversación del base.
- Soporte multilingüe limitado al que ofrece el modelo base; el adaptador no declara idiomas adicionales.
- No hay evidencia publicada de soporte de tool calling, function calling, uso agéntico, visión, audio ni modo de razonamiento extendido en este adaptador concreto.
- El tamaño reducido del adaptador (0,1 GB) sugiere un ajuste superficial, probablemente orientado a formato de salida más que a adquisición de conocimiento nuevo.

Cualquier afirmación sobre capacidades específicas distintas de las anteriores sería especulativa. El autor no ha publicado ejemplos de entrada/salida, demos ni conjunto de evaluación.

## Casos de uso

- Extracción de campos de facturas y recibos en PDF: el modelo podría convertir texto no estructurado en JSON con campos como número de factura, fecha, emisor e importes, aprovechando la ventana de 32.768 tokens del base para documentos largos. Requiere validación propia, ya que no hay métricas publicadas.
- Procesamiento de contratos y documentos legales: segmentación en cláusulas y volcado a esquemas estructurados para su indexación posterior en un sistema de gestión documental.
- Enriquecimiento de pipelines RAG: usar el adaptador como preprocesador que normaliza PDFs a Markdown o JSON antes de generar embeddings, reduciendo ruido en la recuperación.
- Digitalización de formularios administrativos: conversión de formularios escaneados (previa OCR) a estructuras tabulares para su ingesta en bases de datos.
- Extracción de metadatos bibliográficos: título, autores, año, DOI y resumen a partir de artículos científicos en PDF.
- Prototipado y experimentación en investigación: al ser un LoRA de 0,1 GB, es un punto de partida barato para estudiar técnicas de adaptación ligera o para hacer fine-tuning adicional sobre dominios específicos.
- Despliegue en entornos con recursos limitados: puede ejecutarse en GPU de consumo o incluso en CPU con cuantización del modelo base, lo que permite integrarlo en herramientas de escritorio de gestión documental.

En todos los casos, la adecuación real del adaptador es una hipótesis basada en su nombre, no en resultados verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye ninguna tabla de evaluación, y el repositorio no registra descargas ni discusión pública de la que puedan inferirse resultados. Para contextualizar, los benchmarks oficiales ofrecidos por Alibaba para Qwen2.5-1.5B-Instruct figuran en la model card del modelo base, pero no son extrapolables al comportamiento de este adaptador tras el ajuste LoRA.

## Requisitos de hardware

- Peso de los pesos del adaptador: ~0,1 GB en safetensors, según el tamaño del repositorio.
- VRAM estimada para inferencia con el modelo base en bf16/fp16: en torno a 4-6 GB, incluyendo pesos (~3 GB), caché KV y activaciones. Estimación orientativa, no verificada por el autor.
- VRAM estimada con cuantización int8: aproximadamente 2,5-3 GB.
- VRAM estimada con cuantización GGUF Q4_K_M del base: aproximadamente 1,5-2 GB.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y tarjetas de 6-8 GB en cuantizaciones bajas (por ejemplo, GTX 1660 6 GB o RTX 3050 8 GB). También es viable en Apple Silicon mediante llama.cpp.
- GPU de centro de datos: A100, H100 o L40S funcionan sin problema, aunque están sobredimensionadas para un modelo de este tamaño; el cuello de botella será la latencia de red, no el cómputo.
- Opciones de despliegue: transformers + PEFT (el camino natural para un adaptador LoRA, ya sea fusionando los pesos o cargando el adaptador en caliente), vLLM con soporte LoRA, TGI, llama.cpp y Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 1,5B en bf16 sobre una RTX 4090 suele superar los 100 tokens/s en decodificación monoflujo, pero no hay mediciones de este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pdf-structurer-qwen-1.5b | Base de ~1,5B + adaptador | 32.768 (heredado) | No disponible | HuggingFace, 0 descargas | Adaptador LoRA, sin evaluacion publicada |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base sin especializar; benchmarks oficiales publicados |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,49B | 32.768 | Apache 2.0 | HuggingFace | Alternativa mas ligera si el presupuesto de VRAM es minimo; menor calidad |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24B | 128.000 | Licencia comunitaria de Llama 3.2 | HuggingFace | Contexto mucho mayor, pero licencia con restricciones y menos idiomas europeos declarados |

Los datos de las filas correspondientes a modelos base provienen de su documentacion publica; los del adaptador, de la informacion del repositorio. No se dispone de comparaciones de rendimiento entre estas opciones en la tarea de estructuración de PDF.

## Limitaciones y advertencias

- Model card vacía: el autor no documenta la tarea, el dataset, los hiperparámetros ni las limitaciones, lo que impide evaluar su idoneidad para producción.
- Ausencia de licencia declarada: sin licencia explícita, no hay autorización clara para uso comercial del adaptador, aunque el modelo base sea Apache 2.0. Conviene contactar con el autor antes de cualquier despliegue.
- Riesgo de alucinación: es un modelo de 1,5B y, en tareas de extracción estructurada, puede inventar campos o valores ausentes. Se recomienda validación con esquemas (por ejemplo, Pydantic o JSON Schema) y verificación contra el texto original.
- Sesgos: heredados de los datos de preentrenamiento de Qwen2.5; no han sido evaluados ni mitigados en este adaptador.
- Idiomas: no declarados. El rendimiento fuera del inglés y el chino dependerá del base y de los datos de ajuste, desconocidos.
- Limitación de dominio: si el ajuste se hizo sobre un conjunto estrecho de PDFs, el adaptador puede degradarse ante plantillas o idiomas distintos de los vistos en entrenamiento.
- Contexto: la ventana de 32.768 tokens del base es suficiente para la mayoría de documentos, pero puede requerir estrategias de chunking en PDFs extensos o con muchas tablas.
- Reproducibilidad: sin datos de entrenamiento ni semilla publicados, no es posible reproducir el ajuste.
- Madurez: 0 descargas y 0 likes en la fecha de consulta, y ausencia total de informes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/developertce/pdf-structurer-qwen-1.5b
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo Qwen2-1.5B (referencia de la generacion anterior): https://huggingface.co/Qwen/Qwen2-1.5B
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Repositorio espejo de Qwen en GitHub: https://github.com/LionSummer/Qwen
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact#compute
