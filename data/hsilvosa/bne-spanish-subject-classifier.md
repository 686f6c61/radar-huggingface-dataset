# hsilvosa/bne-spanish-subject-classifier

## Resumen

El modelo `hsilvosa/bne-spanish-subject-classifier` es un clasificador de texto en español, desarrollado por Hugo Silvosa Cuervo (hsilvosa), que asigna materias SKOS y códigos de Clasificación Decimal Universal (CDU/Dewey) a partir de títulos y descripciones de publicaciones. Está diseñado específicamente para el ámbito bibliotecario y del patrimonio cultural, aprovechando los datos de la Biblioteca Nacional de España (BNE). Se trata de un modelo de tipo transformer, basado en BETO (BERT-base español), con aproximadamente 110 millones de parámetros, y está pensado para automatizar la catalogación y el indizado temático de publicaciones en español.

El modelo resuelve un problema práctico: la clasificación manual de libros y documentos en bibliotecas y repositorios es costosa y lenta. Este clasificador ofrece una alternativa automática que sugiere materias y códigos de clasificación a partir de información textual breve. Su relevancia radica en que es un modelo de código abierto con licencia CC-BY-4.0, lo que permite su uso comercial y su integración en sistemas de gestión bibliotecaria, repositorios digitales y plataformas editoriales. La versión publicada en HuggingFace se creó en agosto de 2026 y no ha registrado descargas aún.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder-only) |
| Parametros totales | ~110 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (tamano del repo: 0.4 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT-base, concretamente en la versión `dccuchile/bert-base-spanish-wwm-cased` (conocida como BETO). Se trata de un transformer bidireccional, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, entrenado originalmente sobre textos en español. El proceso de entrenamiento consistió en un fine-tuning de esta base sobre el dataset `hsilvosa/bne-linked-data`, que contiene registros bibliográficos de la Biblioteca Nacional de España. La tarea es de clasificación de secuencias multi-etiqueta: el modelo predice materias SKOS y códigos UDC/Dewey a partir de títulos y descripciones. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre técnicas de alineamiento (RLHF/DPO). La innovación principal reside en la especialización de BETO para un dominio muy concreto, el patrimonio bibliográfico español, y en la combinación de dos sistemas de clasificación (SKOS y UDC) en una misma salida.

## Capacidades

- Clasificación de materias temáticas en español, basada en vocabularios controlados SKOS.
- Asignación de códigos de Clasificación Decimal Universal (UDC/Dewey) a partir de texto.
- Soporte de clasificación multi-etiqueta: el modelo puede asignar varias materias a un mismo documento.
- Funciona con títulos y descripciones breves, lo que lo hace adecuado para entradas de catálogo.
- Modelo especializado en español, con vocabulario específico del ámbito bibliotecario y cultural.
- No incluye capacidades de tool calling, generación de texto ni razonamiento conversacional; es un modelo de clasificación puro.

## Casos de uso

- **Catalogación automática en bibliotecas**: el modelo puede sugerir materias y códigos UDC para nuevos libros en un sistema de gestión bibliotecaria, reduciendo el tiempo de catalogación manual. Se integraría como un paso previo a la revisión humana.
- **Indexación de repositorios digitales**: en repositorios de acceso abierto con publicaciones en español, el modelo puede clasificar automáticamente los documentos según materias SKOS, facilitando la navegación y la búsqueda por temas.
- **Enriquecimiento de metadatos en portales culturales**: instituciones como museos, archivos y bibliotecas digitales pueden usar el modelo para añadir etiquetas temáticas a sus colecciones, mejorando la interoperabilidad con estándares como SKOS.
- **Detección de duplicados temáticos**: en bases de datos editoriales o de librerías, el modelo puede agrupar libros que tratan el mismo tema, comparando las materias asignadas a cada título.
- **Apoyo a la investigación en bibliometría**: los investigadores pueden usar el modelo para clasificar automáticamente una gran cantidad de registros bibliográficos y estudiar tendencias temáticas en la producción editorial española.
- **Integración en sistemas de recomendación**: en plataformas de lectura digital, el modelo puede generar etiquetas temáticas de cada libro para alimentar sistemas de recomendación basados en contenido, mejorando la personalización.

## Benchmarks y rendimiento

La model card incluye un benchmark detallado (sección "Benchmark Evaluation Results") que evalúa la clasificación de materias SKOS y de divisiones UDC. Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| SKOS Subject Top-1 Accuracy | 0.6071 |
| SKOS Subject Top-3 Accuracy | 0.9286 |
| SKOS Subject Macro F1 | 0.2519 |
| SKOS Subject Weighted F1 | 0.4587 |
| UDC Division Top-1 Accuracy | 1.0000 |
| UDC Division Macro F1 | 1.0000 |

Además, el model-index oficial declara una precisión (accuracy) y una F1 de 1.0 para la tarea de clasificación de materias y UDC, pero esa cifra parece referirse a la división de UDC (que es una clasificación más gruesa), mientras que las métricas de SKO son más matizadas y muestran que la clasificación temática fina es menos precisa (Top-1 del 60,71 %). No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo BERT-base de ~110 millones de parámetros, la inferencia en FP32 requiere aproximadamente 1,5 GB de VRAM, mientras que con cuantización INT8 se reduce a unos 400 MB. Es perfectamente viable en GPU de consumo.
- **GPU recomendadas**: NVIDIA GTX 1660 (6 GB), RTX 2060 (6 GB), RTX 3060 (12 GB) o superiores. También funciona en CPU, aunque con mayor latencia.
- **Compatibilidad con consumer GPU**: sí, cabe en prácticamente cualquier GPU moderna con más de 4 GB de VRAM.
- **Opciones de despliegue**: al ser un modelo de HuggingFace, se puede servir con `transformers` (Python), `vLLM` (aunque no es óptimo para clasificación), `TGI`, `Ollama` (si se convierte a GGUF) o mediante la API de Hugging Face Inference Endpoints.
- **Latencia estimada**: en una RTX 3060, la inferencia para un texto corto tarda entre 10 y 30 ms por muestra, dependiendo de la longitud. En CPU, la latencia puede ser de 100-500 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Tarea | Licencia |
|--------|--------------|------------|----------|-------|----------|
| `hsilvosa/bne-spanish-subject-classifier` | BERT-base (BETO) | ~110 M | no disponible | Clasificación de materias SKU y UDC | CC-BY-4.0 |
| `dccuchile/bert-base-spanish-wwm-cased` (BETO) | BERT-base | ~110 M | 512 tokens | Modelo base para fine-tuning | MIT (original) |
| `subject-classification-spanish` (PyPI) | CNN | no disponible | no disponible | Clasificación de temas (política, deportes, etc.) | no disponible |

La comparativa muestra que este modelo es una especialización de BETO para el dominio bibliográfico. El modelo de PyPI es una alternativa para clasificación genérica de noticias, pero no ofrece la doble salida SKU-UDC ni está entrenado con datos de la BNE. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- **Sesgos de dominio**: el modelo se ha entrenado exclusivamente con registros bibliográficos de la Biblioteca Nacional de España, por lo que su rendimiento puede degradarse con textos de otros dominios (por ejemplo, noticias, textos técnicos o documentos legales).
- **Riesgo de alucinación**: aunque es un modelo de clasificación y no genera texto, puede asignar materias o códigos UDC incorrectos si el título o la descripción son ambiguos o contienen términos poco frecuentes.
- **Limitaciones de contexto**: al ser un BERT-base, la longitud máxima de entrada es de 512 tokens. Los títulos y descripciones largas pueden truncarse, perdiendo información relevante.
- **Métricas de SKO bajas**: el F1 macro de SKO es de 0.25, lo que indica que la clasificación de materias es imprecisa en muchas categorías; el modelo funciona bien en las categorías más frecuentes pero falla en las menos comunes.
- **Licencia**: CC-BY-4.0 permite el uso comercial y la modificación, pero exige atribución al autor y compartir las modificaciones bajo la misma licencia. Hay que revisar la compatibilidad con proyectos propietarios.
- **Sin soporte para otros idiomas**: el modelo está entrenado únicamente en español, por lo que no es adecuado para clasificar documentos en otros idiomas.
- **No hay datos de entrenamiento**: no se especifican el número de tokens ni la composición del dataset, lo que dificulta evaluar la robustez del entrenamiento.

## Enlaces

- Modelo en HuggingFace: [hsilvosa/bne-spanish-subject-classifier](https://huggingface.co/hsilvosa/bne-spanish-subject-classifier)
- Dataset de entrenamiento: [hsilvosa/bne-linked-data](https://huggingface.co/datasets/hsilvosa/bne-linked-data)
- Repositorio de referencia (observatorio de datos de contratación pública, no directamente relacionado): [openclasp-observatory](https://github.com/hsilvosa/openclasp-observatory)</think>## Resumen

El modelo `hsilvosa/bne-spanish-subject-classifier` es un clasificador de texto en español, desarrollado por Hugo Silvosa Cuervo (hsilvosa), que asigna materias SKOS y códigos de Clasificación Decimal Universal (UDC/Dewey) a partir de títulos y descripciones de registros bibliográficos. Está diseñado para el ámbito bibliotecario y del patrimonio cultural, aprovechando datos de la Biblioteca Nacional de España (BNE). Se basa en la arquitectura BETO (BERT-base español), con aproximadamente 110 millones de parámetros, y se ha ajustado específicamente para la catalogación automática y el indizado temático de publicaciones en español.

La relevancia del modelo radica en que automatiza un proceso manual costoso y lento en bibliotecas y repositorios, ofreciendo predicciones de materias y códigos de clasificación a partir de texto breve. Publicado bajo licencia CC-BY-4.0, permite su uso comercial y su integración en sistemas de gestión bibliográfica. El repositorio de HuggingFace, creado en agosto de 2026, no registra descargas ni valoraciones hasta la fecha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer, encoder-only) |
| Parametros totales | ~110 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (tamano del repo: 0.4 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT-base, concretamente en el checkpoint `dccuchile/bert-base-spanish-wwm-cased` (BETO), un transformer bidireccional con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. El proceso de entrenamiento consiste en un fine-tuning sobre el dataset `hsilvosa/bne-linked-data`, que contiene registros bibliográficos de la Biblioteca Nacional de España. La tarea es de clasificación de texto multi-etiqueta: el modelo predice simultáneamente materias SKOS y códigos de división UDC a partir de títulos y descripciones. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineamiento como RLHF o DPO. La innovación principal reside en la especialización de BETO en el dominio bibliográfico español, combinando dos sistemas de clasificación (SKOS y UDC) en una única salida.

## Capacidades

- Clasificación de texto en español para asignar materias temáticas basadas en vocabulario controlado SKOS.
- Asignación de códigos de Clasificación Decimal Universal (UDC/Dewey) a partir de texto breve.
- Clasificación multi-etiqueta: el modelo puede asignar varias materias y códigos a un mismo documento.
- Funciona con títulos y descripciones cortas, típicas de catálogos bibliográficos.
- No incluye generación de texto, tool calling ni razonamiento conversacional; es un modelo exclusivo de clasificación.

## Casos de uso

- **Catalogación automática en bibliotecas**: el modelo puede sugerir materias y códigos UDC para nuevos libros en un sistema de gestión bibliotecaria, reduciendo el tiempo de catalogación manual y sirviendo como apoyo al personal bibliotecario.
- **Indexación de repositorios digitales**: en repositorios académicos o institucionales con publicaciones en español, el modelo clasifica automáticamente los documentos por temas, facilitando la navegación y la recuperación de información.
- **Enriquecimiento de metadatos en portales de patrimonio cultural**: instituciones como museos, archivos y bibliotecas digitales pueden usar el modelo para añadir etiquetas temáticas a sus colecciones, mejorando la interoperabilidad con estándares como SKOS.
- **Agrupación temática en librerías y editoriales**: el modelo puede agrupar libros por materias en bases de datos editoriales, ayudando a organizar catálogos comerciales o detectar solapamientos temáticos.
- **Apoyo en investigación bibliográfica**: los investigadores pueden clasificar grandes volúmenes de registros bibliográficos y analizar tendencias temáticas en la producción editorial española a lo largo del tiempo.
- **Integración en sistemas de recomendación de lectura**: en plataformas de libros electrónicos, el modelo puede generar etiquetas temáticas para cada título, alimentando motores de recomendación basados en preferencias de los usuarios.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de evaluación detallada con los siguientes resultados:

| Metrica | Valor |
|--------|-------|
| SKOS Subject Top-1 Accuracy | 0.6071 |
| SKOS Subject Top-3 Accuracy | 0.9286 |
| SKOS Subject Macro F1 | 0.2519 |
| SKOS Subject Weighted F1 | 0.4587 |
| UDC Division Top-1 Accuracy | 1.0000 |
| UDC Division Macro F1 | 1.0000 |

El model-index oficial declara una precisión (accuracy) y una F1 de 1.0 para la tarea de clasificación de materias y UDC, pero esta cifra corresponde a la clasificación de divisiones UDC (un nivel de clasificación más grueso), mientras que las métricas de SKOS son más matizadas y muestran una Top-1 Accuracy del 60,71 % y una Macro F1 de 0,25. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo BERT-base de ~110 millones de parámetros, la inferencia en FP32 requiere aproximadamente 1,5 GB de VRAM. Con cuantización INT8, se reduce a unos 400 MB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como la NVIDIA GTX 1660 (6 GB), RTX 3060 (6 GB) o RTX 4090 (24 GB). También funciona en CPU con mayor latencia.
- **Compatibilidad con consumer GPU**: sí, es un modelo ligero que cabe en prácticamente cualquier GPU de consumo moderna.
- **Opciones de despliegue**: se puede servir con la librería `transformers` de HuggingFace, con `vLLM` (aunque no es óptimo para clasificación), con `Text Generation Inference` (TGI) o mediante la API de Hugging Face Inference Endpoints. También es posible convertirlo a GGUF para su uso con `Ollama` o `llama.cpp`.
- **Latencia estimada**: en una RTX 3060, la inferencia para un texto corto (menos de 512 tokens) tarda entre 10 y 30 ms. En CPU, la latencia puede oscilar entre 100 y 500 ms por muestra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|--------|------------|---------|-------|----------|
| `hsilvosa/bne-spanish-subject-classifier` | ~110 M | no disponible | Clasificación de materias SKOS y UDC | CC-BY-4.0 |
| `dccuchile/bert-base-spanish-wwm-cased` (BETO) | 110 M | no disponible | Modelo base para fine-tuning | MIT (original) |
| `subject-classification-spanish` (PyPI) | no disponible | no disponible | Clasificación de noticias (política, deportes, etc.) | no disponible |

La comparación directa no es posible porque no se dispone de métricas de rendimiento para los modelos alternativos. BETO es el modelo base y no está especializado en clasificación bibliográfica, mientras que el clasificador de noticias de PyPI cubre un dominio diferente. No se han encontrado otros modelos con la misma doble salida SKOS-UDC en la información disponible.

## Limitaciones y advertencias

- **Sesgo de dominio**: el modelo está entrenado exclusivamente con registros bibliográficos de la BNE, por lo que su rendimiento en otros dominios (textos legales, técnicos o informales) puede ser deficiente.
- **Riesgo de alucinación**: aunque es un clasificador, puede asignar materias o códigos UDC incorrectos si el texto de entrada es ambiguo o contiene términos no vistos durante el entrenamiento.
- **Contexto limitado**: al ser un BERT-base, la longitud máxima de entrada es de 512 tokens; títulos o descripciones más largos pueden perderse información relevante.
- **F1 Macro bajo en SKOS**: la Macro F1 de 0.25 indica que el modelo no es fiable en categorías temáticas poco frecuentes; puede clasificar bien las divisiones UDC pero fallar en la granularidad de las materias.
- **Restricciones de licencia**: CC-BY-4.0 permite uso comercial con atribución, pero obliga a compartir las modificaciones bajo la misma licencia. Se debe revisar la compatibilidad con proyectos propietarios.
- **Idioma único**: el modelo solo soporta español; no es adecuado para clasificar documentos en otros idiomas.
- **Falta de información de entrenamiento**: no se detallan el volumen de datos ni las técnicas de entrenamiento, lo que limita la reproducibilidad y la evaluación de robustez.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hsilvosa/bne-spanish-subject-classifier)
- [Dataset de entrenamiento](https://huggingface.co/datasets/hsilvosa/bne-linked-data)
- [Repositorio de referencia del autor (no relacionado directamente)](https://github.com/hsilvosa/openclasp-observatory)
