# RKB109/clinical-rag-safety-gateway-20260825-model

## Resumen

El modelo `RKB109/clinical-rag-safety-gateway-20260825-model` es un prototipo pequeño y transparente diseñado para asistentes clínicos basados en recuperación aumentada (RAG). Su objetivo es demostrar una arquitectura reproducible que combine recuperación de evidencia ponderada por IDF (frecuencia inversa de documento) con pesos de token por etiqueta, de modo que el sistema pueda atribuir fuentes y abstenerse explícitamente antes de que una respuesta llegue a equipos de cuidado clínico. No es un modelo de lenguaje generativo, sino un clasificador y recuperador clásico que no invoca ningún LLM alojado.

Lo desarrolla el autor RKB109 (repositorio GitHub R-behera) como un baseline educativo para arquitecturas de RAG en salud. Fue publicado el 25 de agosto de 2026 bajo licencia MIT, con un dataset sintético asociado. Su relevancia actual radica en que sirve como punto de partida reproducible para evaluar mecanismos de abstención, citación y comprobación de evidencia en entornos clínicos, sin los costes ni la opacidad de los grandes modelos generativos.

Se trata de un modelo de tamaño reducido, aunque no se publican cifras exactas de parámetros ni de contexto. Su formato de pesos es JSON propio, tal y como indica la documentación de reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo clásico de clasificación por pesos de token por etiqueta combinado con recuperación de evidencia ponderada por IDF (no transformer) |
| Parametros totales | no disponible (prototipo pequeño) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica: no es un modelo neuronal con pesos cuantizables) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (formato JSON propio, segun la documentacion de reproducibilidad) |

## Arquitectura y entrenamiento

El modelo combina dos componentes clásicos: por un lado, pesos de token asignados a cada etiqueta (probablemente basados en frecuencias o puntuaciones), y por otro, una recuperación de evidencia ponderada por IDF. Esta combinación permite que, dada una consulta clínica, el sistema recupere fragmentos de un corpus de políticas clínicas sintéticas y los utilice para clasificar la consulta o generar una respuesta con atribución de fuente. No se trata de una arquitectura transformer ni de un modelo generativo; es un baseline transparente y reproducible.

Los datos de entrenamiento son sintéticos y proceden del dataset `RKB109/clinical-rag-safety-gateway-20260825-dataset`. El proceso de entrenamiento se ejecuta mediante un script `train.py` disponible en el repositorio GitHub vinculado, junto con la división exacta del dataset y el código de evaluación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación propias de los LLM. La innovación principal no está en la arquitectura, sino en el diseño funcional: un gateway de seguridad que exige citación de fuentes y permite la abstención explícita cuando no hay evidencia suficiente.

## Capacidades

- Recuperación de evidencia: recupera fragmentos relevantes de un corpus clínico sintético ponderando por IDF.
- Atribución de fuentes: asocia cada respuesta o clasificación con las fuentes recuperadas (citation).
- Abstención explícita: el sistema puede abstenerse de responder si la evidencia no es suficiente, un requisito crítico en entornos clínicos.
- Clasificación de texto: etiqueta entradas según pesos de token por etiqueta.
- Similitud de oraciones: capacidad declarada en la cobertura de tareas de Hugging Face.
- Resumen: capacidad declarada en la cobertura de tareas de Hugging Face.
- No genera lenguaje natural libre: no es un LLM y no produce respuestas conversacionales generativas.

## Casos de uso

- Prototipado de arquitecturas de RAG clínico: el modelo sirve como baseline para validar el diseño de un pipeline de recuperación, citación y abstención antes de invertir en modelos generativos más grandes.
- Evaluación en CI/CD: por su pequeño tamaño y su formato JSON, puede integrarse en pipelines de integración continua para verificar que los cambios en el corpus o en la lógica de recuperación no rompen las garantías de abstención y citación.
- Comparación de baselines: los investigadores pueden ejecutar este modelo frente a alternativas más complejas para medir la pérdida de calidad al simplificar la arquitectura.
- Experimentación educativa: en cursos de sistemas de recuperación o de IA en salud, sirve como ejemplo reproducible y fácil de auditar de un sistema de RAG con seguridad integrada.
- Demostración de mecanismos de seguridad: permite ilustrar de forma tangible cómo funciona la abstención y la comprobación de evidencia en un entorno clínico, sin necesidad de un LLM de gran escala.
- Pruebas de concepto de datos sintéticos: con el dataset sintético asociado, se puede experimentar con la generación de políticas clínicas y la evaluación de la cobertura de citación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica una evaluación interna sobre 4 ejemplos sintéticos held-out con una accuracy de 1,0, y menciona que las métricas previstas son `retrieval_accuracy`, `abstention_coverage` y `citation_coverage`, pero no se ofrecen valores concretos de estas métricas. No se puede comparar con otros modelos por falta de datos.

## Requisitos de hardware

- Es un modelo clásico de pequeño tamaño, no requiere GPU. Puede ejecutarse en una CPU estándar con Python.
- No se requieren requisitos de VRAM específicos al no ser un modelo neuronal.
- El despliegue es sencillo: se carga el modelo JSON y se ejecuta con el código de evaluación del repositorio GitHub.
- No se proporcionan estimaciones de latencia ni de throughput; al ser un sistema clásico, la latencia será del orden de milisegundos en CPU para entradas pequeñas.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo transformer con pesos en esos formatos.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables publicados en la misma categoría. El proyecto `RAG Safety Gateway` de hritikd.github.io es un sistema de seguridad para RAG en TypeScript, pero no es un modelo de ML y no es comparable directamente.

## Limitaciones y advertencias

- Datos sintéticos y de tamaño reducido: el modelo se ha entrenado con un dataset sintético pequeño (4 ejemplos en el conjunto de evaluación), por lo que su comportamiento en datos reales es desconocido y no fiable.
- No debe utilizarse para diagnóstico, tratamiento ni consejo médico de emergencia.
- No es un modelo generativo: no produce respuestas en lenguaje natural libre, lo que limita su uso directo como asistente conversacional.
- No se han publicado resultados de rendimiento en tareas reales ni benchmarks estandarizados.
- El modelo no está validado por la comunidad: cuenta con 0 descargas y 0 likes en Hugging Face en el momento de la consulta.
- La licencia MIT permite uso comercial, pero el autor advierte explícitamente que no se debe usar en decisiones consecuentes sin datos representativos, revisión de expertos y evaluación de producción.
- No se documentan sesgos específicos, pero la naturaleza sintética del corpus implica que no refleja la variabilidad ni los sesgos del mundo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/clinical-rag-safety-gateway-20260825-model
- Dataset en Hugging Face: https://huggingface.co/datasets/RKB109/clinical-rag-safety-gateway-20260825-dataset
- Repositorio GitHub (variante 20260815): https://github.com/R-behera/clinical-rag-safety-gateway-20260815/blob/main/README.md
- Repositorio GitHub (variante 20260716): https://github.com/R-behera/clinical-rag-safety-gateway-20260716/blob/main/README.md
