# lanretto/llm-assignment1

## Resumen

`lanretto/llm-assignment1` es un repositorio de Hugging Face publicado por el usuario lanretto que contiene la entrega de un trabajo de curso sobre modelos de lenguaje. No se trata de un modelo fundacional al uso, sino de un paquete de artefactos de entrenamiento: dos implementaciones en PyTorch personalizadas (una etiquetada como `baseline` y otra como `variant`), cada una con su propio código fuente Python, pesos guardados (`best.pt`) y pruebas de estudiante. El repositorio ocupa aproximadamente 0,2 GB.

La model card es extremadamente escueta y no proporciona información sobre arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni resultados de evaluación. Se limita a describir cómo ejecutar los scripts de generación y evaluación incluidos, y advierte de que es necesario replicar el entorno del curso (PyTorch y dependencias del tokenizador, registradas en `environment.txt`) y de que solo debe ejecutarse código de fuentes fiables.

Por tanto, la relevancia de este repositorio es limitada fuera del ámbito académico para el que fue creado: sirve como ejemplo de entrega reproducible de un ejercicio de curso, pero no constituye una base recomendable para aplicaciones en producción ni para evaluación comparativa frente a modelos open source consolidados. Todos los datos técnicos que no aparecen en la información disponible se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos personalizados en PyTorch, sin más detalle en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato `.pt` de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`.pt`, archivos `baseline/best.pt` y `variant/best.pt`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna. La model card únicamente indica que se trata de «custom PyTorch models» con dos variantes (`baseline` y `variant`) que conservan código fuente Python separado. No se especifica si son transformers, MoE, SSM o modelos híbridos, ni se detalla el número de capas, dimensión de embeddings, mecanismo de atención o tokenizador utilizado.

Tampoco se aportan datos sobre el corpus de entrenamiento (número de tokens, composición del dataset, idiomas), ni sobre si se aplicaron técnicas de ajuste como RLHF, DPO o SFT. El único indicio relacionado con el entrenamiento es la mención de `environment.txt`, que registra los paquetes usados durante el entrenamiento, y la existencia de un `manifest.json` que debe preservarse junto con el SHA del commit de Hub. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: los scripts `baseline/source/tools.py` y `variant/source/tools.py` permiten generar tokens a partir de un prompt mediante el subcomando `generate`.
- Evaluación sobre texto: el subcomando `evaluate` calcula métricas sobre un texto de evaluación (`EVAL_TEXT`) suministrado externamente.
- Ejecución en CPU: los ejemplos de la model card usan `--device cpu`, lo que sugiere que los modelos son lo bastante pequeños para inferencia en CPU, aunque no se especifica el tamaño.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de un ejercicio académico: el repositorio permite ejecutar los comandos documentados para generar y evaluar los modelos `baseline` y `variant` dentro del entorno del curso, sirviendo como referencia de entrega reproducible.
- Comparación baseline vs. variante en docencia: los dos conjuntos de pesos permiten contrastar el efecto de una modificación arquitectónica o de entrenamiento sobre las mismas tareas de evaluación.
- Pruebas de integración de pipelines de PyTorch: los scripts incluidos pueden usarse para validar flujos de carga de pesos `.pt`, tokenización y generación en un entorno controlado.
- Experimentación didáctica con tokenizadores: al requerir las dependencias del tokenizador del curso, el paquete sirve para practicar la integración entre tokenizador y modelo en PyTorch.
- Auditoría de seguridad de artefactos de modelos: la propia model card advierte de ejecutar solo código de confianza, por lo que el repositorio puede emplearse como caso de estudio sobre riesgos de ejecutar scripts de terceros desde el Hub.
- Verificación de tests de estudiante: la carpeta `tests/` permite comprobar el comportamiento esperado de los modelos en un contexto de evaluación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,2 GB) incluye código, pesos y tests, pero no se desglosa el tamaño de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la model card solo documenta ejecución en CPU (`--device cpu`).
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el despliegue previsto es mediante los scripts Python propios del paquete con PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría, tamaño o tarea, y la ausencia de datos de arquitectura, parámetros y benchmarks impide establecer una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de información sobre arquitectura, parámetros, contexto y datos de entrenamiento, lo que impide evaluar su calidad o idoneidad técnica.
- Sin licencia declarada: no se puede determinar si el uso comercial está permitido; conviene asumir restricciones hasta que el autor la especifique.
- Sin idiomas declarados: se desconoce la cobertura lingüística real del tokenizador y del corpus de entrenamiento.
- Riesgo de alucinación: no evaluado; no hay métricas ni pruebas publicadas al respecto.
- Sesgos conocidos: no documentados.
- Dependencia de un entorno específico del curso (`environment.txt`, tokenizador y versión de PyTorch), lo que puede provocar fallos de reproducibilidad fuera de ese contexto.
- Riesgo de seguridad: la model card advierte explícitamente de que solo debe ejecutarse código de fuentes fiables; los scripts `.py` incluidos no han sido auditados en la información disponible.
- No apto para producción: se trata de una entrega académica sin documentación de evaluación, sin versionado semántico ni soporte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lanretto/llm-assignment1
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
