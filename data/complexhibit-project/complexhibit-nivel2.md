# Complexhibit-Project/complexhibit-nivel2

## Resumen

Complexhibit Nivel 2 es un modelo de reconocimiento de entidades nombradas (NER) especializado en catálogos de exposiciones de arte en inglés y español. Lo desarrolla el proyecto Complexhibit, un esfuerzo de humanidades digitales orientado a la extracción estructurada de información de catálogos de exposiciones. El modelo identifica y clasifica entidades como personas, títulos de obras, instituciones, lugares, fechas, técnicas, materiales y dimensiones dentro del texto catalográfico.

Técnicamente es un ajuste fino de XLM-RoBERTa large (558,8 millones de parámetros) sobre el gold standard del proyecto: 100 catálogos anotados manualmente por especialistas con la herramienta GATE. Forma parte de un sistema en cadena de tres niveles: el nivel 1 delimita las fichas de obra, el nivel 2 (este modelo) reconoce las entidades y el nivel 3 precisa el papel de cada entidad (por ejemplo, si una institución es propietaria u organizadora).

Su relevancia radica en la especificidad del dominio: los esquemas NER genéricos no cubren categorías como técnicas, materiales o dimensiones, fundamentales para la catalogación artística. El modelo alcanza un F1 global de 0,73 en entidades completas sobre 10 catálogos de prueba no vistos, superando al XLM-RoBERTa base (0,69) y a una BiLSTM de la primera fase del proyecto (0,62).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), ajustado para token classification con esquema BIO |
| Parametros totales | 558.860.307 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (fragmentos de entrenamiento de hasta 200 palabras; el maximo del modelo base XLM-RoBERTa es 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa large (Conneau et al., 2020), un encoder transformer multilingüe, y se ajusta para token classification con esquema BIO (inicio, interior, exterior de entidad). El texto se dividió en 7.478 fragmentos de hasta 200 palabras. El ajuste se realizó durante 10 épocas con tasa de aprendizaje de 2·10⁻⁵ y lotes de 8 fragmentos, conservando el checkpoint con mejor F1 en validación (0,80). Los pesos se guardan en fp16 para reducir el tamaño sin afectar a los resultados.

Los datos de entrenamiento proceden del gold standard del proyecto: 100 catálogos de exposiciones de arte en inglés y español, anotados manualmente por especialistas del dominio con GATE y conforme al manual de etiquetado del proyecto. El reparto es de 80 catálogos para entrenamiento, 10 para validación y 10 para prueba, dividido por catálogos completos para evitar filtración de datos entre particiones. Las anotaciones, el inventario de catálogos, el reparto y el grafo RDF resultante se publican en Zenodo; los textos íntegros no se distribuyen por derechos de autor.

## Capacidades

- Reconocimiento de entidades nombradas en texto catalográfico de arte con nueve etiquetas: `PER` (persona), `TITLE` (título de obra), `ORG` (institución o sede), `LOC` (lugar), `DATE` (fecha), `TECH` (técnica o material), `DIM` (dimensiones), `ADDR` (dirección) e `IDNO` (número de inventario).
- Etiquetado a nivel de token con esquema BIO, lo que permite delimitar entidades de múltiples palabras (por ejemplo, «Óleo sobre lienzo» o «Museo Reina Sofía»).
- Procesamiento bilingüe inglés-español gracias al modelo base multilingüe.
- Integración en un pipeline de tres niveles junto con `complexhibit-nivel1` (delimitación de fichas de obra) y `complexhibit-nivel3` (precisión del papel de cada entidad).
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito: es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Digitalización de catálogos de exposiciones: extraer automáticamente artistas, títulos, técnicas y dimensiones de PDFs catalográficos para poblar bases de datos estructuradas o grafos RDF, aprovechando las etiquetas específicas del dominio que un NER genérico no cubre.
- Enriquecimiento de registros museísticos: procesar fichas de obra para identificar instituciones prestadoras, fechas y números de inventario, facilitando la reconciliación con vocabularios controlados y autoridades.
- Construcción de grafos de conocimiento artístico: alimentar el grafo RDF del proyecto con entidades normalizadas (personas, obras, instituciones) extraídas de corpus textuales no estructurados.
- Investigación en humanidades digitales: análisis a escala de colecciones de catálogos para estudiar redes de exposiciones, circulación de obras o presencia de artistas por institución y periodo.
- Búsqueda semántica sobre archivos documentales: indexar catálogos por entidades reconocidas para permitir consultas del tipo «obras de técnica X expuestas en la institución Y en la década de Z».
- Preprocesamiento para pipelines de catalogación asistida: generar propuestas de anotación que especialistas revisan y corrigen, reduciendo el esfuerzo manual de etiquetado en nuevos catálogos.

## Benchmarks y rendimiento

Evaluación sobre 10 catálogos de prueba no vistos, con criterio de entidad completa (delimitación y categoría correctas):

| Etiqueta | Precisión | Exhaustividad | F1 | Entidades anotadas |
|---|---|---|---|---|
| DIM | 0,85 | 0,96 | 0,90 | 211 |
| TECH | 0,75 | 0,94 | 0,84 | 185 |
| PER | 0,76 | 0,67 | 0,71 | 623 |
| DATE | 0,62 | 0,79 | 0,70 | 205 |
| LOC | 0,55 | 0,72 | 0,62 | 46 |
| TITLE | 0,62 | 0,63 | 0,62 | 216 |
| ORG | 0,47 | 0,69 | 0,56 | 64 |
| Total | 0,70 | 0,75 | 0,73 | 1.553 |

Las etiquetas `ADDR` e `IDNO` solo aparecen 3 veces en el conjunto de prueba, por lo que no pueden evaluarse con fiabilidad. Con criterio a nivel de token (palabras bien etiquetadas), el F1 global es de 0,79. F1 en validación durante el ajuste: 0,80.

Comparación con alternativas bajo el mismo procedimiento de evaluación:

| Modelo | F1 (entidad completa) |
|---|---|
| Complexhibit Nivel 2 (XLM-RoBERTa large ajustado) | 0,73 |
| XLM-RoBERTa base ajustado | 0,69 |
| BiLSTM (primera fase del proyecto) | 0,62 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,5 GB en fp16 (pesos de 558,8 M de parámetros en media precisión), más el overhead de activaciones según la longitud de secuencia.
- Cabe en cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, GTX 1660 y superiores); también es viable en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100, L40S o RTX 4090, especialmente si se procesan lotes grandes de fragmentos.
- Opciones de despliegue: pipeline `token-classification` de transformers, Text Generation Inference (TGI) no aplica por ser discriminativo, vLLM no es la opción natural para token classification; sí es adecuado el servidor de inferencia de Hugging Face (endpoints compatibles según los tags del repo) y ONNX Runtime para optimización.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (entidad completa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Complexhibit Nivel 2 | 558,8 M | no disponible | 0,73 | MIT | Hugging Face |
| XLM-RoBERTa large ajustado (base de partida, referencia) | 558,8 M | 512 tokens | no disponible de forma genérica para esta tarea | MIT | Hugging Face |
| XLM-RoBERTa base ajustado (mismo corpus) | ~278 M | 512 tokens | 0,69 | MIT | Hugging Face |
| BiLSTM (primera fase del proyecto) | no disponible | no disponible | 0,62 | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos NER especializados en catalogación artística para una comparación directa.

## Limitaciones y advertencias

- El modelo está diseñado para texto catalográfico extraído de catálogos (por ejemplo, PDFs); su rendimiento en ensayos, crítica u otros géneros textuales no se ha evaluado sistemáticamente.
- Las etiquetas siguen los criterios del manual de etiquetado del proyecto Complexhibit; los resultados deben interpretarse conforme a dichos criterios.
- Las categorías más difíciles son `ORG` (F1 0,56) y `TITLE` (F1 0,62), porque la identificación depende del contexto: un mismo nombre puede ser institución, lugar o parte de un título.
- `ADDR` e `IDNO` apenas están representadas en el conjunto de prueba (3 apariciones), por lo que su fiabilidad real es desconocida.
- Entrenado solo con catálogos de arte contemporáneo en inglés y español; el rendimiento en otras épocas, idiomas o dominios artísticos no está validado.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y negativos en la delimitación y clasificación de entidades.
- Sesgos: no se documentan análisis de sesgo; al derivarse de un corpus de catálogos de arte contemporáneo, puede reflejar los sesgos de representación de dicho corpus (artistas, instituciones y geografías sobrerrepresentados).
- Licencia MIT, que permite uso comercial; sin embargo, los textos de entrenamiento no se distribuyen por derechos de autor, lo que no afecta a los pesos pero sí a la reproducibilidad del corpus.
- Para uso en producción se recomienda validación sobre el dominio concreto y revisión humana en aplicaciones críticas de catalogación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Complexhibit-Project/complexhibit-nivel2
- Modelo nivel 1: https://huggingface.co/Complexhibit-Project/complexhibit-nivel1
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Anotaciones y recursos del proyecto en Zenodo: https://doi.org/10.5281/zenodo.24199594
- Paper de XLM-RoBERTa (Conneau et al., 2020): https://arxiv.org/abs/1911.02116
- Herramienta GATE: https://gate.ac.uk
