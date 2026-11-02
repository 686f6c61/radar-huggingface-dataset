# rimusa/est_CEFR-essay-classification

## Resumen

`rimusa/est_CEFR-essay-classification` es un modelo de clasificación de texto basado en la arquitectura BERT, con 124.444.420 parámetros totales, publicado en HuggingFace por el usuario `rimusa`. Por su nombre y pipeline (`text-classification`), está orientado a la clasificación de ensayos según los niveles del Marco Común Europeo de Referencia para las lenguas (CEFR), una tarea habitual en evaluación automática de lenguas y en plataformas educativas.

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 0,5 GB, lo que es coherente con un BERT-base (aproximadamente 110 millones de parámetros en el encoder más una cabeza de clasificación). La model card está generada automáticamente por la plataforma y no contiene información sustantiva sobre datos de entrenamiento, licencia, idiomas ni evaluación.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: cuenta con cero descargas y cero likes, la licencia no está declarada y no hay resultados de benchmarks publicados. Cualquier uso en producción requeriría una validación independiente previa, dado que no se puede verificar ni el procedimiento de entrenamiento ni el rendimiento real en la tarea declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only, según tag `bert`) |
| Parametros totales | 124.444.420 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los BERT estándar admiten 512 tokens, pero no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 0,5 GB |
| Libreria | transformers |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El tag `bert` y el pipeline `text-classification` indican una arquitectura transformer encoder-only con una cabeza de clasificación sobre el token `[CLS]`, el esquema estándar para clasificación de secuencias. El recuento de parámetros (124,4 millones) es compatible con una variante BERT-base, aunque no se especifica si parte de un checkpoint preentrenado (por ejemplo, `bert-base-uncased` o `bert-base-multilingual-cased`) ni si se ha realizado un ajuste fino adicional.

No hay información disponible sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus, el número de épocas, la tasa de aprendizaje ni si se aplicaron técnicas de regularización o aumentación de datos. La model card no documenta hiperparámetros, infraestructura de cómputo ni procedimiento de evaluación. Tampoco se indica si el modelo se entrenó desde cero o mediante fine-tuning de un checkpoint público.

## Capacidades

- Clasificación de texto de secuencias de entrada en categorías (presumiblemente niveles CEFR: A1, A2, B1, B2, C1, C2, aunque la taxonomía exacta no está documentada).
- Procesamiento de ensayos y textos redactados por aprendices de lengua, según el nombre del modelo.
- Inferencia por lotes mediante la API de `transformers` (`pipeline("text-classification")`).
- Compatible con Text Embeddings Inference (TEI) y con endpoints de HuggingFace, según los tags.
- No se ha documentado soporte de tool calling, generación de texto, razonamiento multi-paso, visión, audio ni modo de pensamiento; son capacidades ajenas a un modelo encoder-only de clasificación.

## Casos de uso

- Evaluación automática de nivel de lengua en plataformas educativas: el modelo puede asignar un nivel CEFR estimado a un ensayo de un estudiante, sirviendo como señal preliminar para el profesorado o para sistemas de recomendación de material didáctico.
- Triaje de redacciones en academias de idiomas: clasificación masiva de textos de alumnos para agruparlos por nivel estimado antes de la corrección humana, reduciendo el tiempo de revisión inicial.
- Investigación en lingüística aplicada: análisis de corpus de aprendices para estudiar la distribución de niveles de competencia y detectar sesgos en la evaluación.
- Generación de feedback formativo: combinado con un modelo generativo, la etiqueta CEFR puede condicionar la retroalimentación que se ofrece al estudiante (por ejemplo, sugerir estructuras propias del nivel siguiente).
- Filtrado de contenido en repositorios educativos: clasificación de textos enviados por usuarios para enrutarlos al nivel adecuado dentro de un banco de ejercicios.
- Prototipado rápido de pipelines de clasificación: al ser un BERT de tamaño moderado en safetensors, sirve como base para experimentos de fine-tuning sobre dominios educativos específicos.
- Validación de exámenes de práctica: estimación automática del nivel de una redacción antes de la revisión por un examinador certificado, como capa de preevaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB (124,4 M de parámetros × 4 bytes). En FP16, alrededor de 0,25 GB. En INT8, en torno a 0,13 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior permite inferencia por lotes con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1650 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (TEI) según el tag, endpoints de HuggingFace, y exportación a ONNX para despliegue en CPU.
- Latencia y throughput: no disponibles; al tratarse de un BERT-base, se espera un throughput alto (cientos o miles de secuencias por segundo en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rimusa/est_CEFR-essay-classification` | 124,4 M | no disponible | Clasificación CEFR de ensayos | no disponible | HuggingFace (0 descargas) |
| `bert-base-uncased` | 110 M | 512 tokens | Modelo base preentrenado | Apache 2.0 | HuggingFace (ampliamente usado) |
| `bert-base-multilingual-cased` | 178 M | 512 tokens | Modelo base multilingüe | Apache 2.0 | HuggingFace (ampliamente usado) |
| `roberta-base` | 125 M | 512 tokens | Modelo base preentrenado | MIT | HuggingFace (ampliamente usado) |

La comparación con los modelos base es relevante porque, sin información de entrenamiento, no se puede descartar que este checkpoint sea un fine-tuning de uno de ellos. Frente a los modelos base, la ventaja potencial es la especialización en la tarea CEFR; la desventaja es la ausencia de documentación, licencia y validación pública.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor antes de integrarlo en un producto.
- Model card generada automáticamente sin información sustantiva: no hay documentación de datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea: sin métricas publicadas, no se conoce la fiabilidad de las etiquetas.
- Idiomas soportados no declarados: si el checkpoint deriva de un BERT monolingüe inglés, su uso con textos en castellano u otras lenguas podría degradarse notablemente.
- Contexto máximo no confirmado: si se trata de un BERT estándar, los textos superiores a 512 tokens requerirán truncamiento o segmentación.
- Sesgos potenciales en la evaluación de nivel CEFR: los clasificadores de competencia lingüística pueden penalizar variedades dialectales o estilos no estándar; sin documentación de sesgos, este riesgo no puede evaluarse.
- No apto para decisiones de certificación oficial sin supervisión humana: la clasificación automática de nivel debe tratarse como señal auxiliar, no como veredicto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rimusa/est_CEFR-essay-classification
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Documentación de BERT en transformers: https://huggingface.co/docs/transformers/model_doc/bert
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
