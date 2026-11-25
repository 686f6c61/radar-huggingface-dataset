# mradermacher/humanizer-12b-i1-GGUF

## Resumen

humanizer-12b-i1-GGUF es la colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base VictorM-Coder/humanizer-12b, un modelo de lenguaje de aproximadamente 11.900 millones de parámetros orientado a la reescritura de texto, la paráfrasis y la transferencia de estilo (text-rewriting, paraphrase, style-transfer). El repositorio no contiene pesos originales en safetensors, sino ficheros GGUF optimizados para su uso con llama.cpp y con cuantización ponderada mediante imatrix, lo que permite ejecutar el modelo en hardware de consumo con pérdidas de calidad controladas.

El modelo base se distribuye con licencia Apache 2.0 y declara soporte para inglés y chino. La model card etiqueta el modelo con la familia "gemma4", lo que sugiere que la arquitectura subyacente deriva de la familia Gemma, aunque no se detalla la arquitectura exacta ni la longitud de contexto en la información disponible. El repositorio acumula cerca de 9.500 descargas desde su publicación en noviembre de 2026, lo que indica un interés moderado pero sostenido en la comunidad.

La relevancia de esta ficha radica en que ofrece un abanico de 25 cuantizaciones (desde IQ1_S de 3,1 GB hasta Q6_K de 9,9 GB), lo que permite desplegar un modelo de 12B en GPUs consumer de gama media y en CPU, algo crítico para tareas de reescritura de texto a gran escala donde el coste por token importa. No obstante, la información pública sobre benchmarks, contexto y datos de entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como "gemma4" en la model card) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base VictorM-Coder/humanizer-12b. La model card lo etiqueta con la familia "gemma4", lo que apunta a una arquitectura transformer decoder-only derivada de la familia Gemma, pero no se confirma el número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con imatrix (importancia matrix), un método que calcula la importancia de cada tensor a partir de estadísticas de activación y mejora la calidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas. La model card indica que las cuantizaciones i1 suelen superar a las estáticas de tamaño similar; por ejemplo, i1-IQ3_S (5,6 GB) "beats Q3_K*" y i1-Q6_K (9,9 GB) es "practically like static Q6_K". El repositorio incluye además el fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Reescritura de texto (text-rewriting): reformulación de frases y párrafos preservando el significado.
- Paráfrasis (paraphrase): generación de variantes léxicas y sintácticas de un texto dado.
- Transferencia de estilo (style-transfer): adaptación del registro y tono de un texto a un estilo objetivo.
- Generación de texto general en inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés y chino según la model card.
- Capacidades especiales (thinking mode, visión, audio): la model card menciona que "this is a vision model" y que los ficheros mmproj, si existen, estarán en el repositorio estático, pero no se confirma que el modelo base tenga capacidades de visión efectivas.

## Casos de uso

- Reescritura de contenido editorial: el modelo puede reformular artículos, notas de prensa o publicaciones de blog para evitar duplicidad de contenido y mejorar la legibilidad, aprovechando su especialización en text-rewriting y paráfrasis.
- Adaptación de tono en comunicación corporativa: dado un texto base, el modelo puede generar variantes en registro formal, informal o técnico, útil para equipos de marketing que necesitan múltiples versiones de un mismo mensaje.
- Humanización de textos generados por IA: el nombre del modelo sugiere su uso para reducir la huella estilística de textos sintéticos, reescribiéndolos con estructuras y vocabulario más naturales; adecuado para pipelines de publicación asistida.
- Localización EN-ZH de contenido: con soporte declarado para inglés y chino, puede emplearse en la adaptación de textos entre ambos idiomas, aunque no se documenta calidad de traducción.
- Preprocesamiento de datasets para entrenamiento: generar paráfrasis controladas para aumentar la diversidad de corpus de entrenamiento o para tareas de data augmentation en NLP.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones IQ4_XS (6,7 GB) o Q4_K_M (7,5 GB), puede ejecutarse en GPUs consumer de 8-12 GB de VRAM o en CPU con llama.cpp, lo que lo hace viable para servicios de reescritura de bajo coste.
- Moderación y normalización de texto: reescritura de contenido generado por usuarios para eliminar ambigüedades o adaptar el lenguaje a políticas de comunidad antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de reescritura o paráfrasis, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - IQ1_S / IQ1_M: 3,1-3,3 GB (calidad muy degradada, solo para pruebas).
  - IQ2_M / Q2_K: 4,5-4,9 GB (calidad baja).
  - IQ3_S / Q3_K_M: 5,6-6,2 GB (calidad aceptable para tareas simples).
  - IQ4_XS / Q4_K_S: 6,7-7,1 GB (equilibrio recomendado).
  - Q4_K_M: 7,5 GB (recomendado por el autor como "fast, recommended").
  - Q5_K_M / Q6_K: 8,6-9,9 GB (máxima calidad práctica).
- GPU recomendadas:
  - RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB: pueden ejecutar Q4_K_M y Q5_K_M completos.
  - RTX 4090 24 GB: puede ejecutar Q6_K con contexto amplio y margen para KV cache.
  - A100 / H100: sobredimensionadas para este modelo, pero útiles para servir múltiples instancias o contextos largos.
- Cabe en GPU consumer: sí, desde GPUs de 6-8 GB (con cuantizaciones IQ3) hasta 12-16 GB (con Q4_K_M/Q5_K_M).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de llama.cpp. No se documenta soporte para vLLM o TGI con estos ficheros GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| humanizer-12b-i1-GGUF (este) | ~11,9B | no disponible | Apache 2.0 | GGUF (i1/imatrix) | Especializado en reescritura y paráfrasis; 25 cuantizaciones |
| VictorM-Coder/humanizer-12b (base) | ~11,9B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; fuente de las cuantizaciones |
| mradermacher/humanizer-12b-GGUF (estático) | ~11,9B | no disponible | Apache 2.0 | GGUF (estático) | Cuantizaciones estáticas del mismo base; incluye mmproj si aplica |
| Gemma 2 9B (referencia de familia) | 9B | 8K | Gemma license | safetensors, GGUF | Alternativa de tamaño similar si la arquitectura deriva de Gemma; no confirmado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información técnica muy limitada: no se documentan arquitectura exacta, longitud de contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Idiomas restringidos: solo inglés y chino declarados; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Riesgo de alucinación: como todo modelo generativo, puede introducir información no presente en el texto original durante la reescritura, especialmente en cuantizaciones de baja precisión (IQ1, IQ2).
- Degradación por cuantización: las cuantizaciones por debajo de IQ3 pierden calidad de forma notable; el autor desaconseja IQ1 ("for the desperate") y Q2_K_S ("very low quality").
- Capacidad de visión no confirmada: la model card menciona que es un "vision model", pero no se aportan ficheros mmproj en este repositorio ni detalles sobre el componente visual.
- Licencia Apache 2.0: permite uso comercial, pero al ser una cuantización de un modelo base de terceros, conviene verificar que el modelo base mantiene la misma licencia y que no existen restricciones adicionales derivadas de los datos de entrenamiento.
- Repositorio de 140,4 GB: contiene todas las cuantizaciones; la descarga completa es inviable para la mayoría de usuarios, que deberán seleccionar ficheros individuales.
- Sin garantías de mantenimiento: el repositorio es una cuantización de terceros (mradermacher) y no el modelo oficial; cambios en el modelo base no se reflejarán automáticamente.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/humanizer-12b-i1-GGUF
- Modelo base: https://huggingface.co/VictorM-Coder/humanizer-12b
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/humanizer-12b-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#humanizer-12b-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
