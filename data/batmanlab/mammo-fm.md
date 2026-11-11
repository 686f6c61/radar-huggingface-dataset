# batmanLab/Mammo-FM

## Resumen

Mammo-FM es un modelo fundacional de visión específico para mamografías, desarrollado por Batman Lab (Boston University) y presentado en el artículo arXiv:2512.00198. Su objetivo es unificar en un único modelo tareas de diagnóstico, pronóstico y generación de informes (reporting) sobre imágenes mamográficas, superando el enfoque fragmentado de los sistemas CAD tradicionales, que suelen entrenarse de forma aislada para cada tarea.

El modelo se apoya en la línea de trabajo previa del grupo, Mammo-CLIP (MICCAI 2024), un modelo visión-lenguaje preentrenado sobre pares mamografía-informe. Mammo-FM extiende ese planteamiento hacia un modelo fundacional con capacidades integradas de clasificación, localización y generación de texto clínico. El repositorio ocupa 2,7 GB y los pesos se distribuyen en formato safetensors.

La relevancia del modelo radica en su especialización de dominio: en lugar de un modelo multimodal genérico, se entrena sobre datos mamográficos y texto radiológico, lo que permite abordar la escasez y heterogeneidad de datos en diagnóstico asistido por ordenador en cáncer de mama. Su licencia es estrictamente académica y no permite uso comercial, clínico ni diagnóstico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional visión-lenguaje para mamografías; detalles no especificados en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los informes asociados son texto radiológico, presumiblemente en inglés, pero no se confirma) |
| Licencia | custom-academic-license-for-model-weights (solo uso académico no comercial) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 2,7 GB |
| Pipeline declarado | no disponible |
| Etiquetas | mammo-FM, mammograms, breast-cancer, arxiv:2512.00198 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, dimensión de embeddings, tipo de encoder visual o mecanismo de fusión visión-lenguaje). El modelo se enmarca en la familia de modelos fundacionales visión-lenguaje aplicados a mamografía, con antecedente directo en Mammo-CLIP, que se preentrenó sobre pares de mamografías e informes radiológicos para mejorar robustez y eficiencia de datos en clasificación y localización de atributos mamográficos. Mammo-FM amplía ese enfoque hacia diagnóstico, pronóstico y generación de informes de forma integrada.

Tampoco se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineación. El artículo asociado (arXiv:2512.00198) es la fuente primaria para estos detalles. Como innovación metodológica documentada en el trabajo previo del grupo, destaca Mammo-FActOR, un método de atribución de características que proporciona interpretación espacial de las representaciones con granularidad de frase dentro de los informes mamográficos.

## Capacidades

- Análisis de imágenes mamográficas para tareas de diagnóstico asistido.
- Pronóstico a partir de imágenes mamográficas (según el título del artículo).
- Generación de informes radiológicos (reporting) a partir de mamografías.
- Clasificación y localización de atributos mamográficos, capacidad heredada del linaje Mammo-CLIP.
- Representaciones visión-lenguaje que permiten eficiencia de datos y robustez en dominios con pocos datos etiquetados.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de propósito general.
- No se documenta soporte multilingüe explícito.

## Casos de uso

- Investigación en diagnóstico asistido por ordenador de cáncer de mama: uso del modelo como extractor de representaciones o clasificador sobre datasets públicos de mamografía, aprovechando su preentrenamiento específico de dominio para reducir la necesidad de anotaciones.
- Evaluación comparativa de modelos fundacionales médicos: servir como baseline especializado frente a modelos visión-lenguaje genéricos en tareas de clasificación y localización de hallazgos mamográficos.
- Generación automática de borradores de informes en entornos de investigación: el modelo puede generar texto radiológico a partir de la imagen, útil para estudiar la calidad y fidelidad de la generación automática de informes, siempre en contexto académico y no clínico.
- Estudio de interpretabilidad: combinado con métodos como Mammo-FActOR, permite analizar qué regiones de la mamografía sustentan las predicciones, con granularidad de frase en los informes asociados.
- Fine-tuning académico y linear probing: la licencia permite ajuste fino y probing con fines de investigación, lo que facilita adaptar el modelo a cohortes locales de estudio.
- Investigación en equidad y sesgos: al ser un modelo entrenado sobre datos mamográficos, puede emplearse para analizar disparidades de rendimiento entre subpoblaciones en entornos de investigación no clínica.
- Desarrollo de pipelines de investigación en pronóstico: explorar la capacidad del modelo para predecir outcomes a partir de imagen, en el marco de estudios académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo arXiv:2512.00198 es la fuente donde consultar las métricas reportadas por los autores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio de pesos ocupa 2,7 GB, lo que sugiere que la inferencia en precisión original puede caber en GPUs de consumo con 8-16 GB de VRAM, aunque este dato es una estimación a partir del tamaño del repositorio y no una cifra confirmada.
- GPU recomendadas: no disponible. Para investigación con imágenes médicas de resolución mamográfica se recomiendan GPUs con al menos 16-24 GB (RTX 4090, A100, H100) si se procesan lotes o imágenes de alta resolución, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: probablemente sí en cuantizaciones o lotes pequeños, sin confirmación oficial.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al tratarse de un modelo visión-lenguaje con código custom, el despliegue requeriría el repositorio de GitHub del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Dominio | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mammo-FM | Mamografía (visión-lenguaje) | no disponible | no disponible | Académica no comercial | Hugging Face (pesos safetensors) |
| Mammo-CLIP | Mamografía (visión-lenguaje) | no disponible | no disponible | No disponible en la información proporcionada | GitHub del proyecto |
| CLIP genérico | Visión-lenguaje general | ~150M-1B según variante | 77 tokens de texto (típico) | MIT / similar | Amplia |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. Mammo-CLIP es el antecedente directo del mismo grupo; los modelos CLIP genéricos carecen de especialización mamográfica y su rendimiento en este dominio suele ser inferior sin ajuste fino.

## Limitaciones y advertencias

- Licencia estrictamente académica: prohibido cualquier uso comercial, por entidades con ánimo de lucro, en productos o servicios, investigación industrial sin permiso escrito, despliegue clínico, uso diagnóstico o de tratamiento, y uso en sistemas de decisión médica.
- Prohibida la redistribución de pesos, el hosting como API o SaaS, y la destilación o extracción de conocimiento para entrenar otros modelos.
- Los modelos derivados solo se permiten para investigación académica no comercial, sin difusión pública y heredando la misma licencia.
- No apto para uso clínico ni diagnóstico: el modelo no debe emplearse en decisiones médicas sobre pacientes.
- Riesgo de sesgo: al entrenarse sobre datos mamográficos de cohortes concretas, puede presentar disparidades de rendimiento según demografía, equipo de adquisición o protocolo de imagen; no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación en la generación de informes: como modelo de lenguaje, puede producir texto radiológico plausible pero incorrecto; requiere validación humana en cualquier estudio.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues multilingües o con informes largos.
- Detalles de arquitectura y entrenamiento no disponibles en la model card, lo que dificulta la reproducibilidad sin consultar el artículo y el repositorio.
- Requiere citar la publicación y reconocer a los autores e institución en cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/batmanLab/Mammo-FM
- Artículo (arXiv): https://arxiv.org/pdf/2512.00198
- Repositorio GitHub: https://github.com/batmanlab/Mammo-FM
- Repositorio Mammo-CLIP: https://github.com/batmanlab/Mammo-CLIP
- Licencia completa: https://huggingface.co/batmanLab/Mammo-FM/blob/main/LICENSE
- Contacto comercial: batman@bu.edu (Kayhan Batmanghelich)
- Contacto técnico: shawn24@bu.edu (Shantanu Ghosh)
