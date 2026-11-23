# quest-lab/oss-toxicity-roberta

## Resumen

`quest-lab/oss-toxicity-roberta` es un clasificador binario de toxicidad en comentarios de discusiones de GitHub (issues y pull requests), desarrollado por el grupo quest-lab en el contexto del estudio *Toxicity in Open Source: Does It Hit Gaming Projects Differently?*. El modelo parte de una base RoBERTa-base afinada sobre comentarios anotados manualmente y una ronda de aprendizaje activo, y distingue entre texto tóxico (etiqueta 1) y no tóxico (etiqueta 0).

El repositorio no contiene los pesos originales en PyTorch, sino una exportación ONNX cuantizada a 8 bits pensada para ejecución en navegador mediante transformers.js. El pipeline declarado es `text-classification` y el tamaño del repositorio es de 0,1 GB, coherente con un modelo base de unos 125 millones de parámetros cuantizado.

Su relevancia es acotada pero específica: cubre un nicho concreto (moderación asistida de comunidades open source) y ofrece un umbral de decisión calibrado explícitamente (0,35) junto con métricas de test sobre un conjunto reservado de 988 comentarios. El autor advierte que la herramienta sirve para concienciar, no para tomar decisiones automáticas de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder) |
| Parametros totales | no disponible (RoBERTa-base, aproximadamente 125 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado en preprocesado) |
| Tipos de cuantizacion | ONNX int8 (8 bits) |
| Idiomas soportados | no disponible (el corpus de entrenamiento son comentarios de GitHub, presumiblemente en inglés, sin confirmación del autor) |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportación para transformers.js) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en RoBERTa-base, reutilizado como clasificador de secuencia con una cabeza de clasificación binaria. No hay innovaciones arquitectónicas propias: se trata de un fine-tuning estándar sobre una base preentrenada. La exportación incluida en el repositorio es una versión ONNX cuantizada a 8 bits, optimizada para inferencia en el navegador a través de transformers.js.

El entrenamiento se realizó sobre comentarios de GitHub anotados manualmente, complementados con una ronda de aprendizaje activo, según describe el estudio de referencia. El preprocesado aplicado a la entrada elimina texto citado, bloques de código y URLs, y sustituye menciones (@) y direcciones de correo por el token `<USER>`, truncando después a 256 tokens. El umbral de decisión recomendado es 0,35, inferior al 0,5 habitual, lo que sugiere una calibración orientada a favorecer la sensibilidad frente a la precisión. No se detallan en la información disponible el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en un clasificador de este tipo).

## Capacidades

- Clasificación binaria de toxicidad en texto: devuelve una puntuación para la etiqueta `toxic`.
- Procesamiento de comentarios de GitHub con limpieza específica del dominio (eliminación de citas, código y URLs; normalización de menciones y correos).
- Ejecución en navegador mediante transformers.js y ONNX, sin necesidad de backend.
- Inferencia sobre entradas de hasta 256 tokens.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.
- No se documentan capacidades multilingües, de visión ni de audio.

## Casos de uso

- Moderación asistida en repositorios de GitHub: el modelo puntúa comentarios de issues y pull requests para que los mantenedores revisen manualmente los casos con mayor probabilidad de toxicidad, usando el umbral de 0,35 como filtro previo.
- Avisos en el cliente o en la interfaz web: al ejecutarse en navegador con transformers.js, puede integrarse en una extensión o página que advierta al usuario antes de publicar un comentario potencialmente tóxico.
- Investigación sobre clima en comunidades open source: permite replicar o extender el estudio original clasificando grandes volúmenes de comentarios y comparando proyectos o tipos de comunidad.
- Monitorización de salud comunitaria: agregar las puntuaciones por repositorio o por periodo para detectar aumentos de toxicidad y activar protocolos de intervención.
- Filtrado previo en pipelines de análisis: como primera etapa de bajo coste que descarta comentarios claramente no tóxicos antes de un análisis más caro (por ejemplo, revisión humana o un modelo mayor).
- Formación y concienciación: mostrar ejemplos clasificados al equipo de mantenimiento para ilustrar qué tipo de lenguaje se considera tóxico en el contexto del proyecto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test reservado de 988 comentarios:

| Modelo | Precision | Recall | F1 |
|---|---|---|---|
| Modelo original en PyTorch | 0,840 | 0,582 | 0,688 |
| Este modelo ONNX cuantizado (transformers.js) | 0,838 | 0,585 | 0,689 |

La cuantización int8 no degrada de forma apreciable las métricas respecto al modelo original. El recall es bajo (en torno a 0,58), lo que implica que se escapan aproximadamente cuatro de cada diez comentarios tóxicos. No se han publicado comparaciones con otros clasificadores de toxicidad en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB, por lo que la inferencia es viable en CPU y en navegador sin GPU dedicada.
- VRAM estimada: inferior a 1 GB en la versión ONNX int8; no requiere GPU para funcionar.
- GPU recomendadas: no necesarias; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) aceleraría la inferencia por lotes, pero no es un requisito.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: transformers.js en navegador (caso de uso previsto), ONNX Runtime en servidor, y conversión a otros runtimes si se dispone de las herramientas adecuadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros clasificadores de toxicidad en la información proporcionada. Como referencia cualitativa, existen clasificadores de toxicidad basados en BERT/RoBERTa (por ejemplo, variantes de `unitary/toxic-bert` o `facebook/roberta-hate-speech-dynabench-r4-target`), pero no se han publicado métricas comparativas en este repositorio, por lo que la comparación cuantitativa figura como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| quest-lab/oss-toxicity-roberta | no disponible (RoBERTa-base) | 256 tokens | no disponible | ONNX int8 |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor indica que la herramienta no debe usarse para decisiones automáticas de moderación: se producen tanto falsos negativos como falsos positivos.
- Recall bajo (0,585): se pierden aproximadamente el 42 % de los comentarios tóxicos del conjunto de test.
- El umbral de 0,35 está calibrado para el conjunto de test del estudio; puede requerir reajuste en otros dominios o comunidades.
- El preprocesado es obligatorio (eliminación de citas, código y URLs; sustitución de menciones y correos); usarlo con texto sin limpiar puede degradar el rendimiento.
- Entrenado sobre comentarios de GitHub, probablemente en inglés; no se documenta el soporte multilingüe y el rendimiento en otros idiomas es desconocido.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Sin datos publicados sobre sesgos demográficos o lingüísticos específicos; como clasificador de toxicidad, es esperable cierta sensibilidad al lenguaje coloquial, sarcasmo y jerga técnica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quest-lab/oss-toxicity-roberta
- Estudio de referencia: *Toxicity in Open Source: Does It Hit Gaming Projects Differently?* (no se proporciona URL en la información disponible)
