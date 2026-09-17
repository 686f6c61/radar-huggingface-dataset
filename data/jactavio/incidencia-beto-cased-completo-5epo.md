# Jactavio/incidencia-beto-cased-completo-5epo

## Resumen

`Jactavio/incidencia-beto-cased-completo-5epo` es un modelo de clasificación de texto en castellano publicado en HuggingFace por el usuario Jactavio. Se trata de un ajuste fino (fine-tuning) del modelo `dccuchile/bert-base-spanish-wwm-cased`, conocido como BETO cased, según indican las etiquetas `base_model:finetune:dccuchile/bert-base-spanish-wwm-cased` y `generated_from_trainer`. El pipeline declarado es `text-classification` y el nombre del repositorio sugiere una tarea de clasificación de incidencias, aunque la ficha no documenta el conjunto de etiquetas ni el dataset utilizado.

Arquitectónicamente hereda las características del modelo base: un transformer encoder de tipo BERT, con enmascaramiento de palabra completa (`whole word masking`), sensible a mayúsculas y minúsculas (`cased`) y entrenado originalmente sobre corpus en castellano. Esto implica del orden de 110 millones de parámetros y una ventana máxima de 512 tokens, con un coste de inferencia muy inferior al de los modelos generativos actuales.

Su relevancia práctica radica en ese coste reducido: puede desplegarse en CPU o en GPUs de gama de consumo con latencias de milisegundos, lo que lo hace adecuado para tareas de clasificación de alto volumen. Sin embargo, la ficha del modelo está prácticamente vacía: no declara licencia, idiomas, dataset de entrenamiento, número de etiquetas ni métricas de evaluación, y acumula cero descargas y cero likes, por lo que debe considerarse un artefacto no validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (derivado de `dccuchile/bert-base-spanish-wwm-cased`, BETO cased) |
| Parámetros totales | No disponible en la ficha; el modelo base BETO cased tiene aproximadamente 110 millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la ficha; el modelo base está limitado a 512 tokens |
| Tipos de cuantización | No disponible. Al ser un encoder de ~110 M de parámetros es apto para fp16, int8 y exportación a ONNX, pero no se documenta ninguna |
| Idiomas soportados | No disponible. El modelo base está entrenado principalmente en castellano |
| Licencia | No disponible (dato no declarado en la ficha) |
| Formato de pesos | safetensors (según las etiquetas del repositorio) |
| Librería | transformers |
| Pipeline | text-classification |
| Etiquetas del repositorio | transformers, safetensors, bert, text-classification, generated_from_trainer, text-embeddings-inference, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creación indicada | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es la de BETO cased: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con normalización de capa previa y embeddings posicionales absolutos aprendidos, limitado a 512 posiciones. El modelo base fue entrenado por el grupo DCC UChile sobre un corpus en castellano con enmascaramiento de palabra completa (WWM), una variante que enmascara tokens completos en lugar de subpalabras y que mejora el rendimiento en tareas de comprensión. La variante `cased` conserva la distinción entre mayúsculas y minúsculas, lo que suele ser preferible en clasificación de texto con entidades o nombres propios.

Sobre el ajuste fino no hay información publicada: la ficha no indica el dataset, el número de etiquetas, la distribución de clases, la función de pérdida ni la duración del entrenamiento. El sufijo `5epo` del nombre del repositorio sugiere cinco épocas de entrenamiento, y el fragmento `completo` podría referirse al uso del conjunto de datos íntegro, pero se trata de inferencias a partir del nombre y no de datos confirmados. La etiqueta `generated_from_trainer` indica que el ajuste se realizó con el `Trainer` de la librería `transformers`, sin que se documenten técnicas adicionales como destilación, decodificación especulativa (no aplicable a un encoder) o ajuste por preferencias (RLHF/DPO), que no tienen sentido en este tipo de modelo.

## Capacidades

- Clasificación de texto a nivel de secuencia: es la única tarea declarada explícitamente en el pipeline del repositorio.
- Clasificación de incidencias y documentos cortos, según se deduce del nombre del repositorio, aunque sin confirmación en la ficha.
- Generación de embeddings de frase si se utiliza la capa de pooling adecuada: la etiqueta `text-embeddings-inference` sugiere compatibilidad con despliegues orientados a embeddings, aunque no se documenta la configuración.
- Compatibilidad con HuggingFace Inference Endpoints, según la etiqueta `endpoints_compatible`.
- No soporta generación de texto, razonamiento multi-paso, uso de herramientas (`tool calling`) ni capacidades de agente, ya que es un encoder y no un modelo autorregresivo.
- No tiene capacidades de visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles; el modelo base está orientado al castellano y la ficha no declara idiomas adicionales.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar automáticamente incidencias entrantes en categorías (red, hardware, acceso, facturación) y enrutarlas al equipo correspondiente. Con 512 tokens de contexto cubre la mayoría de descripciones de incidencia y cuerpos de correo.
- Clasificación de incidencias en sistemas ITIL: integrado en una plataforma de gestión de servicios, asignaría prioridad y categoría a cada incidencia antes de que un operador la revise, reduciendo el tiempo de primera respuesta.
- Moderación de comentarios en foros o prensa digital: con un ajuste adicional sobre categorías de toxicidad podría filtrar contenido, aunque actualmente el modelo no documenta ese conjunto de etiquetas.
- Análisis de sentimiento en reseñas de producto: dado su origen BETO, es un candidato razonable para clasificar polaridad en textos en castellano, siempre que se valide con datos propios.
- Deduplicación y agrupamiento de incidencias: usando las representaciones internas como embeddings, permitiría agrupar incidencias repetidas por similitud semántica y reducir el volumen manual en mesas de ayuda.
- Filtrado previo en pipelines RAG: como clasificador rápido y barato, podría etiquetar o descartar documentos antes de pasarlos a un modelo generativo más costoso.
- Enrutado de correo corporativo: clasificación de mensajes por departamento o temática en un servidor de correo, con inferencia en CPU y sin necesidad de GPU.
- Etiquetado asistido de datos: generación de etiquetas preliminares para grandes volúmenes de texto que después se revisan manualmente, aprovechando el bajo coste por inferencia de un encoder de 110 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del repositorio en HuggingFace no incluye métricas de evaluación (accuracy, F1, precisión o recall), ni tarjeta de datos, ni resultados comparativos de ningún tipo. Tampoco se han encontrado referencias externas al modelo en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,44 GB en fp32, 0,22 GB en fp16 y 0,11 GB en int8, tomando como referencia los ~110 M de parámetros del modelo base BETO cased. Son estimaciones basadas en el tamaño del modelo, no en mediciones del repositorio.
- GPU recomendadas: cabe con holgura en cualquier GPU moderna. Una RTX 3060, RTX 4090, T4, L4, A10 o A100 pueden ejecutarlo con lotes grandes; la GPU no es un cuello de botella para este tamaño.
- GPU de consumo: sí, cabe en cualquier GPU de consumo con 4 GB o más de VRAM, e incluso en iGPU y en CPU pura.
- CPU: perfectamente viable para producción de bajo volumen gracias a su tamaño reducido.
- Opciones de despliegue: pipeline de `transformers`, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), Text Embeddings Inference (etiqueta `text-embeddings-inference`), exportación a ONNX Runtime y, si se convierte el checkpoint, llama.cpp no aplica porque no es un modelo generativo GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint concreto.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de conocimiento general sobre modelos ampliamente conocidos y no han sido verificados en esta búsqueda; conviene comprobarlos en sus fichas de HuggingFace.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Jactavio/incidencia-beto-cased-completo-5epo` | ~110 M (heredados, no declarados) | 512 tokens (heredado) | No disponible | HuggingFace, 0 descargas | Ajuste fino sin métricas publicadas ni tarjeta de datos |
| `dccuchile/bert-base-spanish-wwm-cased` (BETO) | ~110 M | 512 tokens | No verificado | HuggingFace, ampliamente utilizado | Modelo base del anterior; referencia consolidada en castellano |
| `PlanTL-GOB-ES/roberta-base-bne` | ~125 M | 512 tokens | No verificado | HuggingFace | Encoder alternativo entrenado sobre el corpus BNE, con rendimiento habitualmente superior a BETO en tareas en castellano |
| `bert-base-multilingual-cased` (mBERT) | ~178 M | 512 tokens | No verificado | HuggingFace | Multilingüe, útil si se necesita cubrir más de un idioma a costa de un rendimiento inferior por idioma |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que el uso comercial es jurídicamente indeterminado y no debería asumirse permitido sin consultar al autor.
- No se documenta el dataset de entrenamiento, el número de etiquetas ni su significado, lo que impide saber qué predice realmente el modelo y con qué etiquetas fue ajustado.
- No hay métricas de evaluación publicadas: no se puede estimar su precisión, su F1 ni su comportamiento por clase.
- Riesgo de sesgos: al derivar de BETO, hereda los sesgos presentes en los corpus en castellano utilizados en su preentrenamiento; a esto se suman los sesgos del dataset de ajuste, que se desconoce.
- Riesgo de error de clasificación (no de alucinación, ya que no genera texto libre): un encoder puede asignar clases con alta confianza a entradas fuera de distribución.
- Límite de contexto de 512 tokens: los documentos más largos deben truncarse o dividirse, con la consiguiente pérdida de información.
- Cobertura idiomática no declarada: no hay garantía de comportamiento correcto fuera del castellano.
- El repositorio tiene cero descargas y cero likes, sin validación por parte de la comunidad y sin historial de uso.
- La fecha de creación indicada en la ficha (2026-09-16) es posterior a la fecha habitual de consulta, lo que puede indicar un error en los metadatos.
- La búsqueda web realizada no ha devuelto ninguna referencia técnica, paper ni discusión relacionada con este modelo; los resultados obtenidos versaban sobre hospitales de París y no guardan relación con el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jactavio/incidencia-beto-cased-completo-5epo
- Modelo base BETO cased en HuggingFace: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Repositorio del proyecto BETO: https://github.com/dccuchile/beto
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos correspondían a páginas de hospitales de París sin relación con el repositorio.
