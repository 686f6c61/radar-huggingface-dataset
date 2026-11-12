# arcinstitute/ST-SE-Replogle

## Resumen

ST-SE-Replogle es un repositorio publicado en Hugging Face por el equipo de Arc Institute bajo el identificador `arcinstitute/ST-SE-Replogle`. Por su nomenclatura y por el perfil del emisor (Arc Institute, centrado en investigación biomédica y genómica computacional), se trata de un artefacto orientado a datos y modelos de biología computacional, concretamente a la integración de datos de secuenciación de célula única (single-cell, "SE") y de transcriptómica espacial (spatial transcriptomics, "ST") sobre el conjunto de datos Replogle, un recurso público de perturbaciones genéticas a gran escala en líneas celulares humanas.

El repositorio tiene un tamaño de 118,0 GB, lo que es coherente con un artefacto que empaqueta pesos de modelo junto con matrices de expresión génica, embeddings o checkpoints intermedios, más que con un modelo de lenguaje convencional. No se trata, por tanto, de un LLM generativo de propósito general, sino de un recurso especializado cuyo consumo requiere infraestructura de cómputo científico.

La información pública disponible en la ficha de Hugging Face es mínima: no se declara pipeline, licencia, idiomas ni resultados de evaluación. Esta ficha documenta lo que puede afirmarse con rigor a partir de los metadatos y del contexto del dominio, marcando explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (artefacto de biología computacional; no se declara arquitectura de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio ocupa 118,0 GB; no se detalla el formato de los ficheros) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en los metadatos disponibles. El nombre del repositorio sugiere un sistema de integración o traducción entre modalidades de transcriptómica espacial (ST) y de célula única (SE), entrenado o ajustado sobre el conjunto de datos Replogle, que contiene cribados de perturbación genética (knockdown/knockout mediante CRISPRi) con lecturas de expresión génica en líneas celulares humanas.

Tampoco se documentan el volumen de datos de entrenamiento, la composición del corpus, ni si se emplearon técnicas de ajuste fino supervisado o aprendizaje por refuerzo. Cualquier afirmación sobre la arquitectura interna (transformer, grafos, modelos de difusión o modelos lineales regularizados) sería especulativa y no se incluye aquí.

## Capacidades

- No se declaran capacidades en la ficha de Hugging Face.
- Por el dominio del artefacto, es plausible que esté orientado a tareas de análisis de expresión génica, integración de modalidades espaciales y de célula única, o predicción de respuestas a perturbaciones, pero esto no está confirmado en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo lingüístico en el sentido habitual).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en transcriptómica espacial: uso del artefacto como referencia o punto de partida para integrar datos de expresión con coordenadas espaciales en tejidos, si el repositorio contiene pesos o embeddings entrenados para ello.
- Análisis de cribados de perturbación genética: aprovechamiento del contexto Replogle para estudiar respuestas transcripcionales a knockdowns o knockouts en líneas celulares humanas.
- Reproducibilidad de pipelines bioinformáticos: descarga del repositorio para replicar experimentos de integración de modalidades, siempre que se documente el pipeline en el propio repositorio o en publicaciones asociadas.
- Benchmarking interno de métodos de integración single-cell/spatial: comparación de resultados propios frente a los artefactos publicados por Arc Institute.
- Desarrollo de modelos de foundation en biología: uso como base o referencia en proyectos que exploran modelos fundacionales aplicados a datos transcriptómicos.
- Docencia y formación: empleo en cursos de bioinformática avanzada para ilustrar flujos de trabajo con datos de perturbación a gran escala, sujeto a la licencia que finalmente se declare.

En todos los casos, la viabilidad práctica depende de que el repositorio incluya documentación técnica (card, scripts, dependencias), actualmente no disponible en la información proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tipo de artefacto (si incluye pesos de red neuronal, podría requerir desde unos pocos GB hasta decenas de GB en función de la arquitectura, que no se declara).
- GPU recomendadas: no disponible. Para un artefacto de este tamaño, un entorno con GPU de datacenter (A100, H100) o GPUs consumer de gama alta (RTX 4090, 24 GB) sería el punto de partida habitual en bioinformática, pero no puede confirmarse sin conocer el modelo.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: no disponible (no se documenta vLLM, llama.cpp, Ollama ni TGI; es improbable que apliquen si el artefacto no es un LLM).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 118,0 GB, por lo que se requiere espacio en disco suficiente para la descarga completa y, preferiblemente, para una copia de trabajo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría, ni se dispone de datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card, pipeline declarado, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- Licencia no declarada: no puede asumirse uso comercial; es imprescindible contactar con el autor o consultar el repositorio antes de cualquier despliegue.
- Riesgo de sobreinterpretación: el nombre sugiere una función concreta (integración ST/SE sobre Replogle), pero no hay confirmación técnica de que el artefacto realice esa tarea ni de cómo hacerlo.
- Tamaño elevado (118,0 GB): la descarga y el almacenamiento tienen un coste considerable; conviene verificar la integridad de los ficheros y los requisitos de ancho de banda.
- Dominio muy especializado: no es un modelo de lenguaje; no debe evaluarse con benchmarks de NLP.
- Posibles sesgos de los datos biológicos subyacentes (líneas celulares, poblaciones, condiciones experimentales) que no pueden caracterizarse sin documentación.
- Riesgo de alucinación: no aplica en el sentido habitual; en su lugar, el riesgo es de interpretación errónea de resultados biológicos si se usa sin validación experimental.
- Fecha de actualización reciente (2026-11-12) con cero descargas: ecosistema aún sin validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/arcinstitute/ST-SE-Replogle
- Arc Institute: https://arcinstitute.org
- Conjunto de datos Replogle (referencia pública de perturbaciones genéticas): no se ha encontrado un enlace específico en la información proporcionada.
- Paper, blog o repositorio asociado: no disponible en la información proporcionada.
