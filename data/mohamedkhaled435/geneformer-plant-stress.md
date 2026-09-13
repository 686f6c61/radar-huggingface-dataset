# mohamedkhaled435/Geneformer-Plant-Stress

## Resumen

Geneformer-Plant-Stress es un modelo publicado en Hugging Face por el usuario mohamedkhaled435 bajo la librería transformers. Los metadatos del repositorio indican un clasificador de secuencias con arquitectura BERT (tag `bert`), pesos en formato safetensors, 316.334.594 parámetros totales y un tamaño de repositorio de 1,3 GB. El pipeline declarado es `text-classification` y el modelo figura como compatible con los endpoints de inferencia del Hub. Acumula 0 descargas y 0 likes, y la licencia no está declarada.

El nombre del repositorio sugiere una adaptación de Geneformer —el transformer entrenado sobre transcriptómica de célula única presentado por Theodoris et al. en Nature (2023)— al dominio del estrés en plantas, es decir, un modelo orientado a clasificar estados de estrés abiótico o biótico a partir de perfiles de expresión génica tokenizados. Esta interpretación procede exclusivamente del nombre del repositorio y de los tags, no de documentación del autor: la model card publicada es la plantilla automática de Hugging Face, con todos los campos marcados como «[More Information Needed]».

No se ha localizado paper, blog, repositorio de código ni demo asociados, y la búsqueda web no ha devuelto resultados relacionados con el modelo. Debe considerarse, por tanto, un artefacto sin documentar y sin validar públicamente: útil como objeto de inspección técnica, pero no apto para uso en producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (tag `bert` del repositorio); configuración concreta no disponible |
| Parametros totales | 316.334.594 (dato real de los pesos safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors, sin versiones GGUF, AWQ, GPTQ ni int8 publicadas |
| Idiomas soportados | no disponible (si el modelo opera sobre tokens de expresión génica, el concepto de idioma natural no aplica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño de repositorio: 1,3 GB) |

## Arquitectura y entrenamiento

La única información confirmada es que se trata de un transformer de tipo BERT, con 316.334.594 parámetros y pesos en safetensors, registrado para la tarea de clasificación de texto. El tag `arxiv:1910.09700` que aparece en los metadatos corresponde a Lacoste et al. (2019), el artículo del calculador de impacto ambiental de Machine Learning citado en la plantilla automática de Hugging Face; no es una referencia al modelo ni a su procedimiento de entrenamiento.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, la tokenización empleada, la configuración de capas y cabezas de atención, ni sobre ninguna innovación técnica (atención lineal, decodificación especulativa, etc.). Tampoco se documenta si hubo preentrenamiento desde cero, ajuste fino sobre un checkpoint previo de Geneformer o destilación. Conviene señalar que el recuento de 316 M de parámetros es notablemente superior al de las versiones públicas más conocidas de Geneformer, lo que apunta a una configuración personalizada o a un ajuste fino con vocabulario ampliado, pero esto es una hipótesis no verificada.

## Capacidades

Advertencia previa: no existe documentación funcional del modelo. Todo lo que sigue se infiere del nombre del repositorio y de los tags, y debe tratarse como hipótesis a validar empíricamente.

- Clasificación de secuencias: la tarea declarada es `text-classification`, con una o varias etiquetas de salida no especificadas.
- Procesamiento de lenguaje biológico: si sigue el paradigma de Geneformer, la entrada sería una secuencia de tokens de expresión génica (rank-value encoding de genes ordenados por nivel de expresión) en lugar de texto natural.
- Discriminación de condiciones de estrés vegetal: clasificación de muestras según estrés abiótico (sequía, salinidad, frío, calor) o biótico (patógenos), siempre según lo que sugiere el nombre.
- Tool calling / function calling: no disponible; este tipo de modelos encoder-only no suele soportarlo de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad esperable en un clasificador BERT.
- Capacidades multilingües: no disponible.
- Modo «thinking», visión o audio: no disponible.

## Casos de uso

De nuevo, escenarios condicionados a que el modelo funcione como un clasificador de expresión génica vegetal. Requieren validación previa.

- Clasificación de estrés abiótico en cultivos: dado un perfil transcriptómico de una muestra vegetal, predecir si la planta está sometida a sequía, salinidad o choque térmico. Adecuado porque la tarea declarada es de clasificación y el nombre del modelo apunta a ese dominio.
- Detección temprana de estrés biótico: uso como clasificador binario o multietiqueta para discriminar muestras infectadas por patógenos frente a controles sanos, integrándolo en un pipeline de fenotipado molecular.
- Anotación funcional en transcriptómica de célula única: si el modelo conserva la tokenización de Geneformer, podría emplearse como extractor de representaciones para agrupar tipos celulares en tejidos vegetales, o como clasificador de clusters anotados manualmente.
- Priorización de genes candidatos en mejora genética: uso de las representaciones internas o de la salida del clasificador como señal auxiliar para ordenar genes por relevancia en programas de selección asistida.
- Filtrado y control de calidad de datasets de scRNA-seq: clasificador auxiliar para descartar muestras con perfiles anómalos o mal etiquetados antes de análisis posteriores.
- Replicación metodológica en investigación académica: punto de partida para comparar distintas variantes de Geneformer aplicadas a biología vegetal, siempre que se documente y mida el rendimiento por cuenta propia.
- Clasificación de metadatos textuales de experimentos: dado que el pipeline es `text-classification` y el tag es `bert`, no puede descartarse que el modelo se haya entrenado sobre descripciones textuales de experimentos de estrés vegetal; en ese caso se usaría como clasificador de resúmenes o fichas de experimentos. Esta vía es especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye sección de evaluación (la model card mantiene «[More Information Needed]» en el apartado *Evaluation*), no hay tabla de métricas y la búsqueda web no ha devuelto ningún resultado relacionado con el modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parámetros (316,3 M). No hay mediciones publicadas de latencia ni throughput.

- VRAM y peso de pesos: ~1,27 GB en fp32; ~0,63 GB en fp16/bf16; ~0,32 GB en int8; ~0,16 GB en int4. A estas cifras hay que sumar el *overhead* de activaciones, que en un encoder BERT con secuencias cortas es reducido.
- GPU consumer: el modelo cabe sin problema en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc.). Incluso es viable la inferencia en CPU para lotes pequeños.
- GPU de datacenter: A100, H100, L40S o similares quedan sobredimensionadas para una sola instancia; tendrían sentido para servir muchas réplicas o lotes grandes.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")` es la vía directa; también ONNX Runtime o TorchScript para reducir latencia, y servidores tipo TGI o vLLM para servir el encoder a escala (vLLM da soporte limitado a arquitecturas encoder-only). No hay pesos GGUF publicados, por lo que llama.cpp/Ollama requerirían una conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento de este modelo, por lo que la comparación es únicamente cualitativa. Los valores de parámetros de las alternativas no pueden confirmarse con la información proporcionada.

| Modelo | Dominio | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Geneformer-Plant-Stress | Estrés vegetal (presunto) | BERT, clasificación | 316.334.594 | no disponible | Hugging Face, 0 descargas |
| Geneformer (Chan Zuckerberg Initiative / Theodoris et al.) | Transcriptómica de célula única, genérica | BERT encoder-only | no disponible en la información proporcionada | no disponible | Pesos y código publicados por sus autores |
| scGPT | Transcriptómica de célula única, genérica | Transformer generativo | no disponible en la información proporcionada | no disponible | Repositorio público |
| scBERT | Transcriptómica de célula única | BERT encoder-only | no disponible en la información proporcionada | no disponible | Repositorio público |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática, sin descripción, datos de entrenamiento, hiperparámetros ni evaluación. Cualquier uso en producción parte de cero en cuanto a trazabilidad.
- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial. Es un riesgo legal relevante para cualquier despliegue empresarial.
- Sesgos desconocidos: al no documentarse el dataset, se desconoce la representación de especies vegetales, tejidos, condiciones experimentales y plataformas de secuenciación. Es probable un sesgo hacia las especies y condiciones sobrerrepresentadas en los datos de entrenamiento.
- Riesgo de alucinación y de clasificación espuria: en un clasificador biológico, una etiqueta incorrecta puede interpretarse como evidencia científica. No hay métricas de calibración ni de precisión/recall publicadas.
- Sobreajuste o infraentrenamiento: con 0 descargas y 0 likes y sin métricas, no hay ninguna señal externa de que el modelo haya convergido o generalice.
- Concepto de «idioma» posiblemente inaplicable: si el modelo opera sobre tokens génicos, no cabe esperar soporte multilingüe, pero tampoco se confirma lo contrario.
- Sin pesos cuantizados publicados: cualquier despliegue en entornos con restricciones de memoria exige convertir los pesos, con el consiguiente riesgo de degradación no medida.
- Fecha de creación atípica: el Hub registra la creación el 13 de septiembre de 2026, dato cuando menos llamativo y que refuerza la necesidad de verificar la procedencia del repositorio antes de reutilizarlo.
- Reproducibilidad: sin semillas, versiones de librerías ni receta de entrenamiento, los resultados no son reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamedkhaled435/Geneformer-Plant-Stress
- Paper citado en el tag `arxiv:1910.09700` (Lacoste et al., 2019, calculador de impacto de ML, no relacionado con este modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto de ML referenciado en la plantilla: https://mlco2.github.io/impact

Nota: la búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo. Los enlaces obtenidos correspondían a la sede de impuestos francesa (impots.gouv.fr) y son completamente ajenos al contenido de esta ficha, por lo que se omiten. No se han encontrado paper, blog, repositorio de código ni demo del modelo.
