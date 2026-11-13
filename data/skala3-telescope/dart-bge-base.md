# skala3-telescope/dart-bge-base

## Resumen

dart-bge-base es un modelo de embeddings de frases (sentence embeddings) desarrollado por skala3-telescope, derivado mediante fine-tuning de BAAI/bge-m3. Su propósito es generar representaciones vectoriales densas especializadas en el dominio financiero y contable coreano, en particular en el marco normativo K-IFRS y en los informes de divulgación electrónica del sistema DART (Data Analysis, Retrieval and Transfer System) de Corea del Sur. Con 567.754.752 parámetros (aproximadamente 568 millones), se sitúa en la categoría de modelos base de tamaño medio, adecuado para búsqueda semántica y recuperación de información sobre corpus financieros.

El modelo resuelve un problema concreto: los embeddings generalistas rinden por debajo de lo deseable cuando se enfrentan a terminología contable específica, referencias cruzadas a normas K-IFRS y estructuras de informes corporativos coreanos. Al partir de bge-m3, hereda una arquitectura XLM-RoBERTa con buen comportamiento multilingüe, aunque el fine-tuning se ha orientado al coreano (ko) como idioma principal. Es relevante para equipos que construyen sistemas RAG o motores de búsqueda sobre documentación financiera regulatoria en Corea.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face: no se han publicado detalles sobre el dataset de entrenamiento, los hiperparámetros ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), fine-tuning de BAAI/bge-m3 para sentence-transformers |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base bge-m3 soporta hasta 8192 tokens; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de sentence-transformers, sin confirmar) |
| Idiomas soportados | coreano (ko); el modelo base es multilingüe pero el fine-tuning se declara en ko |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible |
| Tamano del repositorio | 2.3 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en Hugging Face |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en la familia XLM-RoBERTa, obtenido por fine-tuning de BAAI/bge-m3. bge-m3 es un modelo de embeddings multilingüe conocido por soportar recuperación densa, dispersa y multi-vector, aunque la información disponible no confirma qué componentes de esa funcionalidad se conservan tras el fine-tuning ni si el modelo resultante expone únicamente embeddings densos. El número de parámetros (567.754.752) es coherente con la variante base de XLM-RoBERTa.

No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco habitual en modelos de embeddings) ni innovaciones técnicas específicas del fine-tuning. El dominio declarado (finance, accounting, k-ifrs, dart) sugiere que el corpus de ajuste está compuesto por informes DART y textos normativos K-IFRS en coreano, pero se trata de una inferencia a partir de las etiquetas, no de un dato confirmado.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información (pipeline sentence-similarity).
- Búsqueda semántica especializada en terminología financiera y contable coreana.
- Recuperación sobre informes de divulgación electrónica del sistema DART.
- Alineación semántica con el marco normativo K-IFRS.
- Soporte multilingüe heredado del modelo base bge-m3 (no confirmado tras el fine-tuning; el idioma declarado es ko).
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica sobre informes DART: indexar los informes de divulgación electrónica de empresas cotizadas coreanas y recuperar fragmentos relevantes mediante similitud vectorial, aprovechando el ajuste al vocabulario y estructura de estos documentos.
- RAG sobre normativa K-IFRS: construir un sistema de preguntas y respuestas que recupere los párrafos normativos pertinentes antes de que un LLM genere la respuesta, reduciendo errores por terminología contable especializada.
- Deduplicación y agrupación de cláusulas contables: comparar notas y políticas contables entre distintos informes para detectar redacciones equivalentes o divergentes.
- Motor de búsqueda interno para equipos de auditoría: localizar rápidamente tratamientos contables concretos en un corpus de informes históricos.
- Clasificación y enrutamiento de consultas financieras: usar los embeddings como entrada para clasificadores que dirijan consultas a los equipos o bases de conocimiento adecuados.
- Análisis de similitud entre ejercicios: medir cuánto ha cambiado la redacción de una nota contable de un año a otro comparando embeddings de fragmentos correspondientes.
- Evaluación de recuperación en pipelines de compliance: integrar el modelo como retriever en sistemas que verifican el cumplimiento de K-IFRS en documentación corporativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 567,7 millones de parámetros ocupan aproximadamente 2,3 GB de pesos; en fp16, alrededor de 1,1 GB. Sumando activaciones y overhead de sentence-transformers, es razonable prever entre 2 y 4 GB de VRAM en fp16 para lotes moderados (estimación, no dato oficial).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en fp16; para indexación a gran escala se recomiendan A100, H100 o L40S por throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), endpoints de Hugging Face; también es posible exportarlo a ONNX o cuantizarlo, aunque no se ha documentado oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Acceso |
|---|---|---|---|---|---|
| skala3-telescope/dart-bge-base | 567,7 M | no disponible | Financiero/contable coreano (K-IFRS, DART) | MIT | Restringido (gated) |
| BAAI/bge-m3 | no disponible en la informacion | hasta 8192 tokens (segun documentacion publica del modelo base) | Multilingüe generalista | MIT | Abierto |
| BAAI/bge-base-en-v1.5 | no disponible en la informacion | 512 tokens (segun documentacion publica) | Inglés generalista | MIT | Abierto |
| Modelos de embeddings financieros en coreano | no disponible | no disponible | Financiero coreano | no disponible | no disponible |

La comparación de rendimiento con alternativas no está disponible: no se han publicado métricas de recuperación (nDCG, Recall@k, MRR) para dart-bge-base en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatización de pipelines.
- Ausencia de benchmarks: no hay métricas publicadas que permitan validar la mejora frente a bge-m3 sin evaluación propia.
- Especialización estrecha: el fine-tuning está orientado a coreano financiero; su rendimiento en otros dominios o idiomas puede degradarse respecto al modelo base.
- Riesgo de sesgo de dominio: el corpus DART y K-IFRS refleja terminología regulatoria coreana; puede no cubrir jerga financiera informal o de mercados no coreanos.
- Riesgo de alucinación no aplicable directamente (es un modelo de embeddings, no generativo), pero los sistemas RAG que lo usen heredan el riesgo de recuperar fragmentos irrelevantes si la consulta queda fuera del dominio.
- Contexto máximo no confirmado: aunque bge-m3 soporta ventanas largas, no se ha verificado que este fine-tuning las conserve; conviene validar con textos largos antes de producción.
- Licencia MIT: permisiva para uso comercial, pero debe verificarse el cumplimiento de las condiciones de acceso del repositorio gated.
- Modelo con muy poca tracción pública (9 descargas, 1 like en el momento de la consulta): madurez y soporte limitados.

## Enlaces

- Hugging Face: https://huggingface.co/skala3-telescope/dart-bge-base
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Sistema DART (Financial Supervisory Service de Corea): https://dart.fss.or.kr
- Fundación IFRS (normas K-IFRS): https://www.ifrs.org
