# garciaandrew/embodied-ai

## Resumen
El repositorio garciaandrew/embodied-ai no contiene un modelo entrenado, sino un cuaderno de notas de lectura y un esbozo de experimento sobre IA encarnada (embodied AI). El autor lo etiqueta explícitamente como research-notes y la propia model card aclara que no se reclama ninguna mejora en benchmarks, ninguna ablación completada, ningún código liberado y ningún checkpoint entrenado. Los únicos artefactos declarados son notes.md y README.md; el repositorio ocupa 0,0 GB y no registra descargas ni "likes".

Pese a la etiqueta transformer y a la presencia de un archivo safetensors, los metadatos reportan 33.088 parámetros totales, un valor compatible con un archivo de prueba o un marcador de posición, no con un modelo funcional. No hay pipeline declarado, ni idiomas soportados, ni especificaciones de contexto, cuantización o datos de entrenamiento.

Su interés es, por tanto, documental: funciona como punto de partida bibliográfico y como plantilla de reproducibilidad para investigación en IA encarnada, no como artefacto desplegable. Cualquier uso en producción es inviable con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como transformer en los tags del repositorio; no se documenta arquitectura real ni existe checkpoint entrenado |
| Parametros totales | 33.088 (según metadatos de safetensors; valor atípico, compatible con archivo de prueba o marcador de posición) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion / actualizacion | 2026-09-29 (cinco segundos de diferencia entre ambas) |

## Arquitectura y entrenamiento
No hay información sobre arquitectura real ni sobre entrenamiento. El repositorio no contiene descripción de capas, atención, tokenizador, dataset, número de tokens, composición de datos ni fases de ajuste (SFT, RLHF o DPO). La única referencia arquitectónica es la etiqueta "transformer" en los metadatos, que no se sostiene con ningún artefacto verificable: el archivo safetensors asociado tiene un tamaño total reportado de 0,0 GB y un recuento de 33.088 parámetros.

La model card describe un contenido de investigación: alcance de la pregunta de investigación y posibles variables de confusión, una comparación propuesta con baselines emparejados, contexto de evaluación mediante benchmarks públicos adecuados a la tarea, comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas, y referencias temáticas. El propio autor indica que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales y que, si se añaden resultados en el futuro, deberían incluir versiones de dataset, comandos, semillas, hardware y registros en bruto.

## Capacidades
No se puede verificar ninguna capacidad funcional del artefacto. Concretamente:

- Generación de texto: no disponible; no hay modelo entrenado ni configuración de inferencia.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas ni siquiera están declarados en los metadatos.
- Visión, audio o modalidades adicionales: no disponible, pese a que el dominio temático (IA encarnada) implica percepción y acción sobre el entorno.
- Capacidad real documentada: servir como índice de notas sobre el alcance de una pregunta de investigación, variables de confusión, propuesta de baseline y comprobaciones de reproducibilidad.

## Casos de uso
Todos los casos siguientes se refieren al repositorio como material de investigación, no a un modelo desplegable.

- Punto de partida bibliográfico para un grupo de investigación: revisar notes.md antes de diseñar un experimento de IA encarnada, para heredar la delimitación del alcance y la lista de variables de confusión ya identificadas.
- Diseño de comparativas con baselines emparejados: reutilizar el esbozo de comparación propuesto para fijar condiciones de control (mismo hardware, mismos datasets, mismas semillas) antes de ejecutar experimentos propios.
- Plantilla de reproducibilidad: adoptar la exigencia del autor de adjuntar versiones de dataset, comandos, semillas, hardware y registros en bruto como lista de comprobación interna de un laboratorio.
- Catalogación de modos de fallo: usar la sección de failure modes y preguntas abiertas como base para una taxonomía de errores en agentes encarnados, útil al redactar protocolos de evaluación.
- Material docente o de seminario: emplear el repositorio como ejemplo de documentación honesta que separa hipótesis de resultados, en asignaturas de metodología de investigación en IA.
- Preparación de una propuesta de financiación: apoyarse en la estructura (pregunta, confounders, benchmarks públicos, comprobaciones de reproducibilidad) para redactar el apartado metodológico de una solicitud.
- Selección de benchmarks: partir de las referencias temáticas incluidas para localizar conjuntos de evaluación públicos apropiados a tareas encarnadas, y contrastarlos con plataformas como Embodied Arena.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el repositorio no reclama mejoras en benchmarks ni ablaciones completadas, y que no existe checkpoint entrenado. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de tareas encarnadas.

## Requisitos de hardware
- VRAM para inferencia: no aplicable; no existe un checkpoint funcional que cargar.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no aplicable. El repositorio ocupa 0,0 GB y el archivo safetensors reporta 33.088 parámetros, un tamaño que no corresponde a un modelo de lenguaje utilizable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna soportada ni documentada.
- Latencia y throughput: no disponible.
- Requisitos reales: un editor de texto o un visor de Markdown para leer notes.md; opcionalmente un cliente git para clonar el repositorio.

## Comparativa con modelos similares
No disponible. No existen modelos comparables con datos verificables, porque este repositorio no es un modelo: carece de checkpoint entrenado, de especificaciones de arquitectura, de contexto y de métricas. A continuación se listan recursos relacionados del mismo dominio temático, sin que constituyan una comparativa de modelos.

| Recurso | Tipo | Licencia | Relacion con este repositorio |
|---|---|---|---|
| garciaandrew/embodied-ai | Notas de investigación | MIT | Artefacto analizado |
| Embodied AI Agents: Modeling the World (arXiv 2506.22355) | Artículo de investigación | no disponible | Referencia temática sobre agentes encarnados |
| Embodied Arena | Plataforma de evaluación | no disponible | Sistema de evaluación de modelos encarnados |
| haoranD/Awesome-Embodied-AI | Lista curada en GitHub | no disponible | Recopilación de papers y recursos |
| Embodied AI (Nature Collections) | Colección editorial | no disponible | Compilación de literatura del área |

## Limitaciones y advertencias
- No es un modelo: es un cuaderno de notas. No debe presentarse como checkpoint, modelo publicado ni artefacto listo para inferencia.
- El recuento de 33.088 parámetros y el tamaño de 0,0 GB sugieren un archivo de prueba o marcador de posición; no hay evidencia de pesos útiles.
- La etiqueta "transformer" procede de los metadatos y no está respaldada por ninguna descripción de arquitectura ni por artefactos verificables.
- Riesgo de alucinación: no evaluable; no existe modelo sobre el que medir este comportamiento.
- Sesgos conocidos: no disponibles; no se documenta dataset de entrenamiento ni proceso de alineación.
- Cobertura lingüística: no declarada, ni siquiera el inglés.
- Las secciones del repositorio marcadas como planes o hipótesis no son resultados. Cualquier cita de las mismas como evidencia experimental sería un uso incorrecto.
- Las fechas de creación y actualización (2026-09-29) distan cinco segundos entre sí, lo que indica un único acto de subida sin mantenimiento posterior.
- Sin descargas ni "likes" registrados: no hay validación por parte de la comunidad.
- Licencia MIT: permite uso comercial y modificación del contenido del repositorio, pero la propia model card advierte de que deben revisarse por separado los términos de los datos externos si se combinan con datasets de terceros.
- Uso en producción: desaconsejado por completo. No hay API, plantilla de prompt, tokenizador ni pesos funcionales.
- En caso de que el autor publique resultados en el futuro, la model card exige adjuntar versiones de dataset, comandos, semillas, hardware y registros en bruto; hasta entonces, cualquier cifra sería no verificable.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/garciaandrew/embodied-ai
- Embodied AI Agents: Modeling the World (arXiv, versión HTML): https://arxiv.org/html/2506.22355v3
- Embodied AI Agents: Modeling the World (arXiv, abstract): https://arxiv.org/abs/2506.22355
- Embodied Arena (plataforma de evaluación): https://www.embodied-arena.com/
- Awesome-Embodied-AI (GitHub): https://github.com/haoranD/Awesome-Embodied-AI
- Embodied AI (Nature Collections): https://www.nature.com/collections/ibgfciaafb
