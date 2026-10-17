# Junjieli2005/grad-visual-question-answering

## Resumen

El repositorio `Junjieli2005/grad-visual-question-answering` no es un modelo entrenado, sino un cuaderno de notas de investigación (etiquetado como `research-notes`) sobre la tarea de respuesta a preguntas visuales (VQA, Visual Question Answering). Su propia model card indica explícitamente que no reclama mejoras de benchmark, ablaciones completadas, código publicado ni un checkpoint entrenado; los únicos artefactos declarados son `reading.md` y `README.md`.

El repositorio aparece en HuggingFace con la etiqueta de pipeline `visual-question-answering` y contiene un total de 33.088 parámetros en formato safetensors, una cifra insignificante que no corresponde a ningún modelo de visión y lenguaje funcional, sino a algún artefacto residual. No se documenta arquitectura real, conjunto de datos de entrenamiento, proceso de ajuste ni resultados experimentales; los tags incluyen `transformer`, pero no hay ninguna descripción técnica que respalde esa etiqueta.

La relevancia de esta ficha es, por tanto, fundamentalmente negativa: sirve para advertir de que el repositorio no debe evaluarse ni desplegarse como un modelo de VQA. Las referencias externas encontradas en la búsqueda web (documentación de HuggingFace sobre VQA, un proyecto de fin de grado en GitHub y un artículo sobre GPT-4V aplicado a educación) son material de contexto sobre la tarea, no sobre este repositorio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio se etiqueta como `transformer`, pero no se documenta ninguna arquitectura real) |
| Parametros totales | 33.088 segun los ficheros safetensors del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (etiquetado), sin pesos de un modelo entrenado verificable |

## Arquitectura y entrenamiento

No hay información sobre arquitectura. La model card describe un ejercicio exploratorio que enumera el alcance de una pregunta de investigación, posibles factores de confusión, una comparación propuesta con líneas base emparejadas y requisitos de reproducibilidad (versiones de dataset, comandos, semillas, hardware y registros en bruto). El texto indica expresamente que las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados experimentales.

No se especifica ningún dato de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se describe ninguna innovación técnica. La única mención concreta a datos es la propuesta de evaluar sobre VQAv2, GQA y OK-VQA, siempre como contexto de evaluación planificado, no como resultado obtenido.

## Capacidades

- No se puede verificar ninguna capacidad funcional: el repositorio no publica un checkpoint entrenado ni código de inferencia.
- No hay evidencia de generación de texto, razonamiento, código, matemáticas, visión ni multimodalidad implementada.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- La única capacidad declarada es la redacción de una nota de investigación sobre VQA, con secciones de alcance, comparación propuesta, contexto de evaluación y preguntas abiertas.

## Casos de uso

Los siguientes casos corresponden a la tarea de VQA que el repositorio dice estudiar, no a capacidades verificadas de este repositorio. Se incluyen como contexto de la tarea, dejando constancia de que este repositorio no implementa ninguno de ellos.

- Respuesta a preguntas sobre imágenes en educación: un sistema de VQA podría responder consultas de alumnos sobre diagramas, mapas o figuras de un libro de texto; el artículo sobre GPT-4V en educación recogido en la búsqueda web explora precisamente ese escenario.
- Accesibilidad para personas con discapacidad visual: descripción y respuesta a preguntas sobre el entorno o sobre documentos escaneados, siempre que exista un modelo multimodal real detrás.
- Atención al cliente sobre productos: responder preguntas a partir de fotografías enviadas por el usuario (estado de un pedido, identificación de un componente), una vez entrenado un modelo multimodal con datos del dominio.
- Análisis de documentación técnica: extracción de respuestas a partir de capturas de pantalla, planos o esquemas de ingeniería.
- Verificación de contenido generado por usuarios: comprobar si una imagen y su pie de texto son coherentes en plataformas de publicación.
- Investigación reproducible en VQA: usar la plantilla metodológica del repositorio (líneas base emparejadas, control de factores de confusión, registro de versiones de dataset y semillas) como guía para diseñar un experimento comparable sobre VQAv2, GQA u OK-VQA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se reclama ninguna mejora de benchmark ni ablación completada, y que VQAv2, GQA y OK-VQA se mencionan únicamente como contexto de evaluación propuesto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, porque no existe un modelo funcional que ejecutar.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no aplicable; los 33.088 parámetros en safetensors no constituyen un modelo de visión y lenguaje utilizable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no hay pesos ni configuración de inferencia publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No existe un modelo funcional de este repositorio que pueda compararse con alternativas de la misma categoría (por ejemplo, modelos de VQA como los documentados en la guía de HuggingFace o sistemas multimodales tipo GPT-4V). La comparación con esos sistemas carece de sentido porque este repositorio no publica pesos entrenados ni resultados.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado: los 33.088 parámetros registrados no corresponden a un sistema de VQA operativo.
- No hay resultados experimentales, ablaciones ni código de entrenamiento o inferencia.
- El contenido es una nota exploratoria; sus secciones de planes e hipótesis no deben citarse como hallazgos.
- No se documentan sesgos, porque no hay modelo evaluado.
- Riesgo de confusión en producción: desplegar o citar este repositorio como modelo de VQA sería un error metodológico.
- Licencia cc-by-4.0: permite uso comercial y obras derivadas con atribución, pero obliga a revisar por separado las condiciones de los datasets externos (VQAv2, GQA, OK-VQA) que se mencionan.
- La fecha de creación y actualización del repositorio (16 de octubre de 2026) y su nula tracción (0 descargas, 0 likes) refuerzan que se trata de un artefacto sin validación por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Junjieli2005/grad-visual-question-answering
- Documentación de HuggingFace sobre la tarea de VQA: https://huggingface.co/docs/transformers/en/tasks/visual_question_answering
- Artículo sobre GPT-4V aplicado a educación (VQA): https://arxiv.org/html/2405.07163v1
- Proyecto de fin de grado sobre un sistema de VQA (no vinculado al repositorio): https://github.com/Jerlin-Ishabel/Visual-Question-Answering-System
- Artículo divulgativo sobre respuestas visuales en asistentes conversacionales (no vinculado al repositorio): https://tech.yahoo.com/ai/chatgpt/articles/visual-learner-ask-chatgpt-respond-013000778.html
