# mradermacher/GoLLIE-34B-GGUF

## Resumen

GoLLIE-34B-GGUF es una cuantizacion estatica en formato GGUF del modelo GoLLIE-34B, publicada por el usuario mradermacher. El modelo base, GoLLIE, es un sistema de extraccion de informacion (Information Extraction, IE) guiado por directrices (guideline-guided), desarrollado originalmente por HiTZ (Centro Vasco de Tecnologia del Lenguaje, Universidad del Pais Vasco). Su proposito es realizar tareas de reconocimiento de entidades nombradas (NER), extraccion de relaciones y otras subtareas de IE a partir de instrucciones en lenguaje natural que describen las etiquetas y su semantica.

La relevancia de esta version radica en que transforma un modelo de 34.000 millones de parametros en artefactos GGUF ejecutables con llama.cpp y ecosistemas compatibles, lo que facilita su despliegue en entornos con recursos limitados o sin infraestructura de GPU dedicada. El modelo base se apoya en el transformer decoder-only Yi-34B, adaptado mediante fine-tuning supervisado para seguir definiciones de esquema en lenguaje natural.

No obstante, la informacion disponible sobre esta publicacion es muy limitada: la model card es practicamente un stub que solo indica que se trata de cuantizaciones estaticas del modelo HiTZ/GoLLIE-34B y lista los tipos de cuantizacion generados. No constan datos sobre benchmarks especificos de la version cuantizada, licencia explicitada en el repositorio ni idiomas declarados en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Yi-34B), afinado para extraccion de informacion guiada por directrices |
| Parametros totales | 34.000 millones (aproximado, segun denominacion del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | No disponible en los metadatos del repositorio |
| Licencia | No disponible en los metadatos del repositorio |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

El modelo base GoLLIE-34B parte de la arquitectura Yi-34B, un transformer decoder-only denso de 34.000 millones de parametros. Sobre esa base, el equipo de HiTZ aplica un proceso de fine-tuning orientado a la extraccion de informacion guiada por directrices: el modelo recibe como entrada no solo el texto a analizar, sino tambien definiciones en lenguaje natural de las etiquetas de entidad y relacion que debe reconocer. De este modo, el mismo modelo puede abordar esquemas de anotacion distintos sin reentrenamiento, generalizando a categorias no vistas durante el entrenamiento. Esta es la innovacion central de la familia GoLLIE, descrita en la publicacion asociada al modelo (paper "GoLLIE: Annotation Guidelines improve Zero-Shot Information-Extraction").

Esta publicacion concreta (mradermacher/GoLLIE-34B-GGUF) no aporta informacion propia sobre el proceso de entrenamiento: se limita a ofrecer cuantizaciones estaticas del checkpoint HiTZ/GoLLIE-34B generadas con herramientas de conversion a GGUF. Los metadatos internos indican `convert_type: hf` y `quantize_version: 2`, lo que sugiere una conversion desde pesos de Hugging Face. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en el modelo original.

## Capacidades

- Extraccion de informacion guiada por directrices: reconocimiento de entidades nombradas (NER) y extraccion de relaciones definidas mediante instrucciones en lenguaje natural.
- Generalizacion zero-shot a esquemas de etiquetas no vistos, gracias al condicionamiento por definiciones de etiqueta.
- Procesamiento de texto en multiples dominios (biomedico, legal, noticias, etc.) segun el esquema que se proporcione en el prompt.
- Ejecucion local mediante llama.cpp y ecosistemas compatibles con GGUF (Ollama, LM Studio, entre otros).
- Soporte de multiples niveles de cuantizacion que permiten ajustar el equilibrio entre calidad y requisitos de memoria.
- Capacidades de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no declaradas en los metadatos; el modelo base se evalua habitualmente en ingles, pero no se confirma desde esta publicacion.

## Casos de uso

- Extraccion de entidades en pipelines documentales: se puede desplegar con llama.cpp para procesar lotes de documentos y extraer entidades segun un esquema definido en el prompt, sin necesidad de GPU de datacenter si se usa una cuantizacion baja.
- Anonimizacion de datos personales: definir en el prompt etiquetas como PERSONA, DIRECCION o TELEFONO y usar el modelo para detectarlas en textos antes de almacenarlos, aprovechando la flexibilidad de esquemas.
- Procesamiento de literatura cientifica: extraer relaciones entre farmacos, genes y enfermedades definiendo las etiquetas relevantes en el prompt, util en entornos de investigacion biomedica.
- Analisis de contratos y documentos legales: identificar partes, obligaciones y fechas mediante un esquema adaptado al dominio juridico, con despliegue en servidores sin GPU dedicada usando cuantizaciones Q4 o Q5.
- Enriquecimiento de bases de datos internas: ejecutar el modelo en local para etiquetar registros de texto libre con categorias corporativas definidas por el equipo, manteniendo los datos dentro de la organizacion.
- Prototipado rapido de tareas de IE: gracias a los multiples niveles de cuantizacion, es posible probar el modelo en un portatil con una cuantizacion Q2_K o IQ4_XS antes de decidir un despliegue mayor con Q6_K u Q8_0.
- Investigacion en IE zero-shot: utilizar la version cuantizada para reproducir experimentos de extraccion guiada por directrices en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta publicacion no incluye metricas de evaluacion, y no se dispone de datos sobre el impacto de las distintas cuantizaciones en la calidad de extraccion.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, calculada a partir del tamano del modelo y el tipo de cuantizacion):
  - Q2_K: en torno a 13-15 GB.
  - IQ4_XS: en torno a 17-19 GB.
  - Q4_K_M: en torno a 20-22 GB.
  - Q5_K_M: en torno a 24-26 GB.
  - Q6_K: en torno a 28-30 GB.
  - Q8_0: en torno a 36-38 GB.
  - x-f16: en torno a 68 GB.
- GPU recomendadas: para cuantizaciones Q4 y superiores, una RTX 4090 (24 GB) puede alojar Q4_K_M o Q5_K_S; A100 40 GB o H100 para Q8_0 y f16; configuraciones multi-GPU para f16.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM (RTX 3090, RTX 4090) usando cuantizaciones Q4 o Q5; en GPUs de 16 GB solo con cuantizaciones muy agresivas y posible offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no son la via principal para GGUF aunque existen soportes experimentales.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoLLIE-34B-GGUF (esta publicacion) | 34B | No disponible | GGUF cuantizado | No disponible | Hugging Face |
| HiTZ/GoLLIE-34B (modelo base) | 34B | No disponible | safetensors (Hugging Face) | No disponible | Hugging Face |
| GoLLIE-13B | 13B | No disponible | safetensors | No disponible | Hugging Face |
| GoLLIE-7B | 7B | No disponible | safetensors | No disponible | Hugging Face |

La comparativa se limita a variantes de la misma familia GoLLIE, ya que no se dispone de datos de licencia, contexto ni benchmarks que permitan una comparacion cuantitativa rigurosa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La model card de esta publicacion no especifica la licencia del modelo base; es imprescindible consultar la licencia de HiTZ/GoLLIE-34B antes de cualquier uso comercial.
- No se declaran idiomas soportados en los metadatos; el comportamiento multilingue no esta garantizado.
- La cuantizacion introduce perdida de precision: las cuantizaciones Q2_K y Q3 pueden degradar notablemente la calidad de extraccion en tareas de IE, que suelen ser sensibles a errores sutiles.
- No se han publicado evaluaciones del impacto de cada cuantizacion en el rendimiento de extraccion.
- Riesgo de alucinacion inherente a los modelos generativos: el modelo puede inventar entidades o relaciones que no aparecen en el texto.
- Los metadatos del repositorio son minimos (sin pipeline, sin idiomas, sin licencia), lo que dificulta la trazabilidad y el cumplimiento normativo.
- La fecha de creacion indicada (noviembre de 2026) debe tomarse con cautela; conviene verificar el estado real del repositorio antes de integrarlo en produccion.
- El modelo esta especializado en extraccion de informacion; no debe esperarse un rendimiento generalista comparable al de modelos de proposito general del mismo tamano.

## Enlaces

- Repositorio de esta publicacion: https://huggingface.co/mradermacher/GoLLIE-34B-GGUF
- Modelo base: https://huggingface.co/HiTZ/GoLLIE-34B
- Paper de GoLLIE: https://arxiv.org/abs/2310.03668 (GoLLIE: Annotation Guidelines improve Zero-Shot Information-Extraction)
