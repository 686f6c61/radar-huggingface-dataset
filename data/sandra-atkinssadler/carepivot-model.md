# sandra-atkinssadler/carepivot-model

## Resumen

CarePivot v2 es un modelo de clasificación tabular basado en regresión logística, desarrollado como artefacto educativo dentro del *AI Governance Practicum* (Track 1) por la organización ficticia Alderwyn Health. El modelo clasifica pacientes diabéticos dados de alta hospitalaria según el riesgo de reingreso a treinta días, con el fin de que el equipo de atención transicional priorice a quién inscribir en su programa. Se distribuye como un fichero pickle de scikit-learn de 50.538 bytes y una tabla CSV con los coeficientes ajustados legibles por humanos.

La relevancia del modelo no reside en su capacidad predictiva, sino en su función como ejemplar pedagógico de gobernanza de IA: la model card documenta de forma exhaustiva linaje de datos, mitigación de sesgo mediante Fairlearn, hashes de integridad, puntos operativos y condiciones de uso. La versión v2 elimina las variables de raza registrada, banda de edad y código de pagador (33 columnas codificadas de 171) mediante `CorrelationRemover`, de modo que el modelo nunca ve esas tres variables directamente.

Se trata de un modelo de regresión logística con regularización C = 0.1, pesos de clase balanceados, entradas escaladas y sin la variable de disposición al alta. No es un modelo de lenguaje ni un transformer: es un clasificador tabular clásico, pensado exclusivamente para uso educativo y no para decisiones clínicas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn), con pipeline de escalado y codificación one-hot |
| Parametros totales | 138 columnas de entrada ajustadas en v2 (148 en v1); coeficientes más intercepto |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo tabular, sin contexto secuencial) |
| Tipos de cuantizacion | No disponible (no aplica a modelos de regresión logística) |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pickle de scikit-learn (`carepivot_v2.pkl`) y CSV con coeficientes (`carepivot_v2_Inside.csv`) |

## Arquitectura y entrenamiento

El modelo es una regresión logística con regularización L2 (C = 0.1), pesos de clase balanceados y entradas escaladas, implementada en scikit-learn 1.9.1. El pipeline de producción incluye tres pasos ajustados que deben reproducirse: la codificación one-hot con niveles fijados sobre las filas de entrenamiento, el escalador y, en v2, el `CorrelationRemover` de Fairlearn 0.15.0 ajustado contra raza registrada, banda de edad y código de pagador. No se imputan valores faltantes porque el fichero de trabajo no los contiene.

El entrenamiento se realizó sobre el fichero de trabajo remediado del dataset `drdavidprivacy/carepivot-data`, vinculado a `drdavidprivacy/practicum-case-packs`. La mitigación de sesgo consiste en eliminar de cada entrada la parte que covaría con las tres variables protegidas y después descartar dichas variables, de modo que v2 se ajusta sobre 138 columnas en lugar de las 171 de v1. El modelo está deliberadamente fijado a scikit-learn 1.9.1 y no carga en otras versiones, por diseño.

## Capacidades

- Clasificación tabular binaria: estima el riesgo de reingreso a treinta días para pacientes diabéticos al alta.
- Ranking de pacientes: genera un orden de prioridad para que el equipo de atención transicional seleccione a quién inscribir.
- Mitigación de sesgo integrada: elimina la influencia de raza, edad y pagador mediante `CorrelationRemover`.
- Auditabilidad: expone todos los coeficientes ajustados e intercepto en un CSV legible.
- Integridad verificable: hashes SHA-256 publicados para los artefactos v1 y v2.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Formación en gobernanza de IA: el modelo sirve como caso práctico completo para enseñar documentación de modelos, mitigación de sesgo y gates de uso en un programa de *practicum*.
- Auditoría de sesgo algorítmico: investigadores pueden reproducir el pipeline de `CorrelationRemover` y comparar v1 frente a v2 para estudiar el efecto de eliminar variables protegidas.
- Revisión de model cards: el ejemplar de Gabriel Ortiz se usa como plantilla de referencia para que estudiantes redacten sus propias fichas.
- Docencia de pipelines de scikit-learn: ilustra la fijación de niveles one-hot, escalado y versionado estricto de dependencias en producción.
- Estudio de puntos operativos: el documento describe cómo se fija la capacidad (15% de altas) y cómo se gobierna el uso mediante gates y tripwires.
- Demostración de trazabilidad de artefactos: el par pickle + CSV + hashes permite enseñar verificación de integridad en despliegues de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es un pickle de 50.538 bytes que se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: el artefacto ocupa menos de 0,1 MB y la inferencia es una multiplicación matricial trivial.
- Opciones de despliegue: scikit-learn 1.9.1 en Python, servido mediante el Space `drdavidprivacy/carepivot`; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo, la latencia por predicción es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CarePivot v2 | Regresión logística tabular | 138 columnas | No aplica | CC-BY-4.0 | Hugging Face (pickle + CSV) |
| CarePivot v1 | Regresión logística tabular | 148 columnas (171 codificadas) | No aplica | No disponible | Referenciado en la model card (hash publicado) |
| Alternativas genéricas de clasificación tabular | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Uso exclusivamente educativo: la organización, el sistema y las personas son ficticios; no debe usarse para decisiones clínicas reales.
- El modelo está fijado a scikit-learn 1.9.1 y no carga en otras versiones, lo que limita su portabilidad.
- Riesgo de alucinación no aplica en sentido estricto, pero el modelo puede producir ordenaciones erróneas de riesgo en poblaciones fuera de la distribución de entrenamiento.
- La eliminación de raza, edad y pagador mediante `CorrelationRemover` no garantiza ausencia de sesgo residual por variables correlacionadas.
- El punto operativo depende de la capacidad del equipo (15% de altas) y no de un umbral clínico validado.
- El gate de uso está cerrado hasta que se completen la revisión independiente, los tripwires de tasa de fallo por raza y de utilización como acceso, y la comprobación de muerte y hospicio.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el carácter ficticio y educativo del artefacto desaconseja cualquier despliegue real.
- No hay datos de benchmarks, idiomas soportados ni evaluación de rendimiento publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandra-atkinssadler/carepivot-model
- Dataset de entrenamiento: https://huggingface.co/datasets/drdavidprivacy/carepivot-data
- Case packs del practicum: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- Space de demostración: https://huggingface.co/spaces/drdavidprivacy/carepivot
