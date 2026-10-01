# mano-jpmp/document-ai-scratch-2024

## Resumen

El repositorio `mano-jpmp/document-ai-scratch-2024` es un artefacto publicado en HuggingFace por el usuario mano-jpmp bajo el identificador de notas de investigación sobre Document AI. No se trata de un modelo entrenado con pesos funcionales destinados a inferencia, sino de un cuaderno de trabajo que recoge el planteamiento de una pregunta de investigación, posibles comparativas con baselines y un esbozo de evaluación. La propia model card advierte de forma explícita que no reclama mejoras de benchmark, ablaciones completas, código liberado ni un checkpoint entrenado.

El peso real declarado en los ficheros safetensors es de 49.600 parámetros totales, una cifra que corresponde a un tensor auxiliar o a un artefacto de prueba, no a un transformer de gran escala. El repositorio ocupa 0,0 GB, no declara pipeline, no especifica idiomas y registra 12 descargas y 0 likes en el momento de la consulta. La arquitectura etiquetada es transformer, pero no se aporta ninguna especificación de capas, dimensiones ocultas, cabezas de atención ni ventana de contexto.

Su relevancia actual es, por tanto, documental y metodológica: sirve como ejemplo de repositorio de notas exploratorias sobre Document AI, con referencias a conjuntos de datos como FUNSD, SROIE y CORD, y con un énfasis declarado en la reproducibilidad y en los modos de fallo. No debe confundirse con un modelo desplegable ni con un baseline ejecutable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (segun etiqueta del repositorio) |
| Parametros totales | 49.600 (dato declarado en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `transformer` figura entre los tags del repositorio, pero no se proporciona ninguna descripción de la arquitectura interna: no hay datos sobre número de capas, dimensión del modelo, número de cabezas de atención, tipo de normalización, posición de los embeddings ni variantes como MoE, SSM o híbridas. El tamaño declarado de 49.600 parámetros totales es incompatible con un transformer de propósito general y sugiere un artefacto residual o de prueba más que un modelo entrenado.

En cuanto al entrenamiento, la model card no menciona número de tokens, composición del dataset, uso de RLHF, DPO, SFT ni ninguna otra etapa de alineación. El documento se presenta como un esbozo de experimento que enumera lo que aún queda por probar, con referencias a los conjuntos FUNSD, SROIE y CORD como contexto de evaluación propuesto, no como resultados obtenidos. Se indica además que si en el futuro se añaden resultados, deberán incluir versiones de dataset, comandos, semillas, hardware y logs en bruto.

## Capacidades

- No se documenta ninguna capacidad funcional de generación de texto, razonamiento, código, matemáticas o visión.
- No hay evidencia de soporte de tool calling ni de function calling.
- No se describe soporte para agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas concretos.
- El contenido del repositorio se limita a notas de investigación: alcance de la pregunta de investigación, posibles confounders, comparativa propuesta con baselines y contexto de evaluación sobre FUNSD, SROIE y CORD.
- No existe modo thinking, visión, audio ni ninguna capacidad especial declarada.

## Casos de uso

- Consulta metodológica sobre Document AI: el repositorio puede leerse como punto de partida para diseñar un estudio sobre extracción de información en documentos, dado que enumera preguntas abiertas y confounders potenciales.
- Definición de protocolos de evaluación: las referencias a FUNSD, SROIE y CORD permiten reutilizar esos conjuntos como base para plantear comparativas con baselines emparejados.
- Revisión de buenas prácticas de reproducibilidad: la model card insiste en registrar versiones de dataset, comandos, semillas, hardware y logs en bruto, lo que sirve como checklist para otros proyectos.
- Identificación de modos de fallo: el documento anticipa el análisis de failure modes, útil para equipos que preparan auditorías de sistemas de extracción documental.
- Plantilla de repositorio de notas: su estructura (`summary.md` más `README.md`) puede servir de modelo para publicar cuadernos de investigación sin inflar resultados.
- Enseñanza y divulgación: sirve para ilustrar la diferencia entre un repositorio de notas exploratorias y un modelo entrenado con pesos utilizables.
- No es adecuado para inferencia en producción, generación de texto, agentes, código ni ninguna tarea que requiera un modelo funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclaman mejoras de benchmark ni ablaciones completas, y que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales.

## Requisitos de hardware

- No procede estimar VRAM para inferencia: el repositorio no contiene un modelo funcional y su tamaño declarado (49.600 parámetros) no corresponde a un transformer utilizable.
- No se especifican GPU recomendadas por el autor.
- No hay información sobre si cabe en GPU de consumo, porque no hay modelo que desplegar.
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni compatibilidad con ellas.
- No se aportan datos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. El repositorio no es comparable con modelos de Document AI como LayoutLM, Donut o LiLT, ya que no publica pesos entrenados, ni arquitectura detallada, ni resultados sobre FUNSD, SROIE o CORD. Tampoco se ofrecen alternativas equivalentes de la misma categoría (repositorios de notas) con las que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado ni un checkpoint; no debe usarse para inferencia.
- El tamaño declarado de 49.600 parámetros es incompatible con un transformer de propósito general y probablemente corresponde a un artefacto auxiliar o de prueba.
- No hay resultados de benchmarks, ablaciones ni evaluaciones publicadas.
- No se declaran idiomas soportados, sesgos conocidos ni comportamiento frente a la alucinación, porque no hay modelo que evaluar.
- No se especifica ventana de contexto, por lo que no puede planificarse ningún uso con entradas largas.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero al no existir artefacto funcional la aplicabilidad práctica es nula.
- La model card advierte de que las referencias y datasets propuestos son un punto de partida para verificación, no evidencia de que el estudio se haya ejecutado.
- Al reutilizar datos externos debe revisarse por separado la licencia de dichos conjuntos, tal como indica el propio autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mano-jpmp/document-ai-scratch-2024
- Fichero principal de notas: `summary.md` dentro del repositorio
- Documentación del repositorio: `README.md` dentro del repositorio
- No se han encontrado en la busqueda web enlaces adicionales relevantes al modelo: los resultados obtenidos corresponden a sitios no relacionados (ManoMano, el servicio Mano de Sesan, guías de anotación de interacciones mano-objeto y un artículo sobre AffordanceVLA).
