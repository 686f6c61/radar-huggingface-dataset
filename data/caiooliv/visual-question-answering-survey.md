# caiooliv/visual-question-answering-survey

## Resumen

Este repositorio, publicado por el usuario caiooliv, no contiene un modelo de aprendizaje automático entrenado, sino un conjunto estructurado de notas de investigación sobre Visual Question Answering (VQA). El autor lo describe como "research-notes" y su propósito es recopilar el alcance de una pregunta de investigación, posibles factores de confusión, una propuesta de comparación con líneas base, y referencias concretas de evaluación como VQAv2, GQA y OK-VQA. El contenido se organiza en un archivo `paper_notes.md` y un `README.md`, y se distingue explícitamente entre planes e hipótesis (no verificados) y resultados completados (que no existen en este repositorio).

Aunque el repositorio aparece etiquetado con el pipeline de visual-question-answering y tiene un campo de parámetros totales de 16.576, esto no corresponde a un modelo con pesos entrenados, sino a un artefacto documental. El tamaño del repositorio es de 0.0 GB, lo que confirma que no hay checkpoints ni código ejecutable. La relevancia de esta ficha radica en que muchos usuarios pueden confundir este tipo de repositorios con modelos listos para usar; aquí se aclara que se trata de material de referencia para investigadores que planean experimentos en VQA, no de un sistema funcional.

La licencia es cc-by-4.0, lo que permite su uso y distribución con atribución, siempre que se revisen por separado los términos de los datasets externos mencionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo entrenado) |
| Parametros totales | 16.576 (corresponden al archivo de notas, no a pesos de red) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el contenido está en inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no aplica (no hay pesos; el formato es Markdown) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El autor declara explícitamente en la model card que el repositorio no contiene un checkpoint entrenado, código liberado ni resultados de ablaciones completadas. El contenido se limita a notas de investigación estructuradas, donde se separan los planes e hipótesis de los resultados verificados (que no se han incluido). Por tanto, cualquier referencia a arquitecturas como transformers, MoE o SSM es ajena a este artefacto.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, visión ni ninguna otra funcionalidad de modelo de IA.
- El repositorio ofrece una revisión estructurada del estado del arte en VQA, incluyendo el alcance de la pregunta de investigación y posibles factores de confusión.
- Propone una metodología de comparación con líneas base emparejadas para futuros experimentos.
- Referencia conjuntos de datos concretos de evaluación: VQAv2, GQA y OK-VQA.
- Incluye secciones sobre comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas.
- Recopila referencias bibliográficas relevantes sobre VQA.

## Casos de uso

- Punto de partida para investigadores que inician un proyecto en VQA: las notas ofrecen una visión estructurada del problema, los datasets estándar y las preguntas abiertas, lo que permite acotar el diseño experimental.
- Revisión bibliográfica rápida: el repositorio condensa referencias clave y propone una comparación con líneas base, útil para preparar un marco teórico en un artículo.
- Planificación de experimentos de evaluación: al citar VQAv2, GQA y OK-VQA, el investigador puede seleccionar rápidamente los benchmarks adecuados según el tipo de pregunta (respuesta abierta, razonamiento composicional, conocimiento externo).
- Verificación de reproducibilidad: las notas incluyen una lista de comprobaciones y modos de fallo que sirven como guía para documentar experimentos futuros (versiones de dataset, comandos, semillas, hardware y logs).
- Material docente: para cursos de visión por computador o procesamiento del lenguaje natural, el documento puede utilizarse como lectura introductoria al campo de VQA.
- Identificación de lagunas de investigación: la sección de preguntas abiertas ayuda a detectar oportunidades no exploradas, orientando nuevas propuestas de tesis o proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio no contiene resultados experimentales y que las secciones marcadas como planes o hipótesis no deben interpretarse como evidencia.

## Requisitos de hardware

- No aplica: al no existir un modelo entrenado, no se requieren recursos de GPU, VRAM ni infraestructura de inferencia.
- El único requisito es un lector de Markdown (navegador, editor de texto o visor de archivos) para consultar las notas.

## Comparativa con modelos similares

Dado que no se trata de un modelo, la comparativa debe establecerse con otros documentos de revisión o surveys sobre VQA. No se dispone de una comparación cuantitativa con otros repositorios de notas, pero se pueden mencionar referencias externas:

| Recurso | Tipo | Contenido principal | Licencia |
|---|---|---|---|
| caiooliv/visual-question-answering-survey (este repo) | Notas de investigación | Alcance, metodología, datasets y preguntas abiertas en VQA | cc-by-4.0 |
| caiooliveiraski/phd-visual-question-answering-2024 | Notas de investigación | Mismo autor y estructura similar (posible duplicado o versión previa) | cc-by-4.0 |
| Survey de VQA en arXiv (2501.03939) | Artículo de revisión | Desarrollo histórico y avances recientes en VQA | arXiv (acceso abierto) |
| Survey de VQA en arXiv (2305.11033) | Artículo de revisión | Técnicas y aplicaciones, análisis de 25 estudios y 6 datasets | arXiv (acceso abierto) |

La comparativa se limita al ámbito documental; no hay modelos comparables en cuanto a rendimiento porque este repositorio no ofrece ninguno.

## Limitaciones y advertencias

- No es un modelo funcional: no puede procesar imágenes ni responder preguntas; cualquier intento de usarlo como tal fallará.
- El contenido es exploratorio y no verificado: los planes e hipótesis no han sido validados experimentalmente, por lo que no deben citarse como resultados.
- No incluye código ni checkpoints: no es posible ejecutar ni desplegar nada a partir de este repositorio.
- Alcance limitado: las notas se centran en VQA y no cubren otras tareas multimodales.
- Idioma: el contenido está redactado en inglés, lo que puede ser una barrera para algunos lectores.
- Licencia: aunque la licencia cc-by-4.0 permite uso comercial con atribución, los datasets externos citados (VQAv2, GQA, OK-VQA) tienen sus propios términos de uso que deben revisarse por separado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/caiooliv/visual-question-answering-survey
- Repositorio relacionado del mismo autor: https://huggingface.co/caiooliveiraski/phd-visual-question-answering-2024
- Documentación de HuggingFace sobre la tarea VQA: https://huggingface.co/docs/transformers/en/tasks/visual_question_answering
- Survey de VQA (arXiv 2501.03939): https://arxiv.org/html/2501.03939v1
- Survey de VQA (arXiv 2305.11033): https://arxiv.org/abs/2305.11033
- Sitio oficial de VQA: https://visualqa.org/
