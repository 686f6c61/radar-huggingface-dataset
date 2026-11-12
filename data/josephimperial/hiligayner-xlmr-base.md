# josephimperial/hiligayner-xlmr-base

## Resumen

HiligayNER XLM-RoBERTa Base es un modelo de reconocimiento de entidades nombradas (NER) especializado en hiligaynon, una lengua bisaya de Filipinas. Lo desarrolla Joseph Imperial (con contribuciones de Teves et al.) mediante fine-tuning del checkpoint base `FacebookAI/xlm-roberta-base` sobre el corpus anotado HILIGAYNER. El modelo resuelve la extraccion de personas (PER), localizaciones (LOC) y organizaciones (ORG) en texto en hiligaynon, un idioma con escasisimos recursos NLP publicos.

Se trata de un encoder transformer XLM-RoBERTa de 277 millones de parametros, reentrenado para token-classification con etiquetado BIO de seis tags (B-PER, I-PER, B-LOC, I-LOC, B-ORG, I-ORG). La longitud maxima de secuencia durante el entrenamiento fue de 128 tokens, incluyendo tokens especiales, lo que condiciona su uso a entradas de tipo frase o parrafo corto.

Su relevancia actual radica en que cubre un idioma de bajos recursos practicamente ausente en los modelos multilingues genericos, y lo hace con un rendimiento medido (F1 macro de 0,8586 y F1 estricto de span BIO de 0,8396 sobre el conjunto de test). Es un modelo de investigacion con cero descargas y cero likes en el momento de la ficha, publicado en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (base) |
| Parametros totales | 277.458.439 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia en entrenamiento, incluyendo tokens especiales); la ventana nativa de XLM-RoBERTa es 512, pero el modelo se entreno con 128 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones publicadas) |
| Idiomas soportados | hiligaynon (codigo `hil`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 1,1 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `FacebookAI/xlm-roberta-base`, un transformer encoder de tipo RoBERTa multilingue con 277 millones de parametros, adaptado a token-classification mediante una cabeza de clasificacion sobre las representaciones contextuales del encoder. La tarea es NER con esquema BIO de seis etiquetas: B-PER, I-PER, B-LOC, I-LOC, B-ORG e I-ORG.

El entrenamiento se realizo sobre el corpus HILIGAYNER descrito por Teves et al. (2025), compuesto por texto de noticias, redes sociales y textos religiosos. Tras eliminar texto repetido, el split contiene 8.004 frases de entrenamiento, 889 de validacion y 2.227 de test. Se uso el optimizador AdamW durante 3 epocas, con learning rate de 3e-05 y longitud maxima de secuencia de 128 tokens (incluyendo tokens especiales). El checkpoint seleccionado fue el de mejor F1 estricto de span BIO en validacion y se evaluo posteriormente sobre el conjunto de test. El paquete incluye los ajustes de ejecucion y los recuentos de alineacion en `metrics.json`. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo encoder para etiquetado.

## Capacidades

- Reconocimiento de entidades nombradas en hiligaynon para tres tipos: persona (PER), localizacion (LOC) y organizacion (ORG).
- Etiquetado a nivel de token con esquema BIO, agregable a spans mediante `aggregation_strategy="simple"` en el pipeline de Transformers.
- Procesamiento de entradas de tipo frase o parrafo corto (hasta 128 tokens incluyendo especiales).
- Integracion directa con la libreria `transformers` mediante `pipeline("token-classification")`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni comportamiento agentico: es un modelo exclusivamente discriminativo para etiquetado.
- Capacidad multilingue limitada al hiligaynon; el backbone XLM-RoBERTa es multilingue, pero el fine-tuning se realizo solo sobre `hil`, por lo que el rendimiento en otros idiomas no esta garantizado ni documentado.

## Casos de uso

- Extraccion de entidades en noticias locales en hiligaynon: el modelo identifica personas, lugares y organizaciones en titulares y cuerpos de noticia, permitiendo construir indices de entidades y bases de datos de actualidad regional. Es adecuado porque el corpus de entrenamiento incluye texto periodistico.
- Moderacion y analisis de redes sociales: dado que el corpus incorpora texto de redes sociales, el modelo puede etiquetar menciones a personas y organizaciones en publicaciones, util para monitorizacion de marca o deteccion de discurso dirigido.
- Enriquecimiento de archivos religiosos y documentacion historica: el corpus incluye textos religiosos, de modo que el modelo sirve para anotar sermonarios, catecismos o transcripciones con entidades relevantes.
- Construccion de datasets NER para hiligaynon: el modelo puede usarse como anotador automatico (pre-etiquetado) para acelerar el etiquetado humano en proyectos de ampliacion de recursos para lenguas bisayas.
- Sistemas de busqueda y recuperacion de informacion regional: indexar documentos por entidades extraidas permite busquedas del tipo "noticias sobre la organizacion X en la localidad Y" en corpus en hiligaynon.
- Investigacion linguistica y sociolinguistica: analisis de frecuencia y distribucion de entidades en distintos dominios (noticias frente a redes sociales) para estudiar sesgos de cobertura o convenciones de escritura.
- Pipelines de extraccion de relaciones: los spans PER/LOC/ORG sirven como entrada a etapas posteriores de relation extraction o knowledge graph construction en un idioma sin herramientas comerciales.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (2.227 frases), por etiqueta BIO:

| Etiqueta | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| B-PER | 0,9471 | 0,9650 | 0,9560 | 1800 |
| I-PER | 0,9252 | 0,9452 | 0,9351 | 2226 |
| B-LOC | 0,7939 | 0,8467 | 0,8195 | 587 |
| I-LOC | 0,8096 | 0,8509 | 0,8297 | 1214 |
| B-ORG | 0,7663 | 0,8816 | 0,8199 | 532 |
| I-ORG | 0,7615 | 0,8232 | 0,7911 | 888 |

Metricas agregadas: F1 macro sobre las seis etiquetas BIO de 0,8586 y F1 estricto de span BIO de 0,8396. No se han publicado comparaciones con otros modelos NER en hiligaynon en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo de pesos, mas overhead de activaciones y del tokenizer; en la practica cabe en cualquier GPU con 2 GB o mas.
- En fp16/bf16: alrededor de 0,55 GB de pesos, holgadamente dentro de GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para volumenes moderados. Para alto throughput en servidor, A100 o H100 son utiles pero sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2-4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con `pipeline`, Hugging Face Inference Endpoints (tag `endpoints_compatible`), y exportacion a ONNX para servir con ONNX Runtime. No se documentan pesos GGUF, por lo que llama.cpp/Ollama no son opciones directas sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (encoder de 277 M de parametros) y la secuencia corta (128 tokens), se espera latencia de milisegundos por frase en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HiligayNER XLM-RoBERTa Base | 277 M | 128 tokens (entrenamiento) | NER, hiligaynon | no disponible | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Representaciones multilingues (sin cabeza NER) | MIT | Hugging Face |
| Modelos NER multilingues genericos (p. ej. variantes XLM-R fine-tuned en Wikiann) | ~278 M | 512 tokens | NER multilingue, cobertura limitada de hiligaynon | variable | Hugging Face |

No se dispone de datos de benchmark comparativos con otros modelos NER especificos para hiligaynon en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el corpus de entrenamiento procede de noticias, redes sociales y textos religiosos; el rendimiento puede degradarse en otros dominios, convenciones ortograficas o registros.
- Longitud de entrada limitada a 128 tokens incluyendo especiales; textos mas largos deben segmentarse, lo que puede romper entidades a caballo entre fragmentos.
- Rendimiento inferior en organizaciones (F1 de 0,79-0,82) y localizaciones (0,82-0,83) frente a personas (0,93-0,96), lo que refleja menor soporte de ejemplos y mayor ambiguedad en esas clases.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y spans mal delimitados en texto fuera de dominio.
- Sesgos: no se documentan analisis de sesgo; al entrenarse sobre noticias y textos religiosos, puede heredar sesgos de cobertura y de representacion de entidades.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de desplegarlo en produccion.
- Modelo de investigacion con cero descargas y cero likes en el momento de la ficha; no hay evidencia de uso en produccion ni de mantenimiento.
- Un solo idioma (`hil`); no debe asumirse transferencia a otras lenguas bisayas como cebuano o waray sin evaluacion especifica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josephimperial/hiligayner-xlmr-base
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper HILIGAYNER (Teves et al., 2025, PACLIC 39): https://aclanthology.org/2025.paclic-1.71/
- Corpus HILIGAYNER (repositorio GitHub, dataset anotado): https://github.com/jvlzloons/HiligayNER/blob/cfd02cb0fdb2f1aadb75106c7a779c17db687ada/Dataset/Annotated%20dataset/final_combined_all.jsonl
