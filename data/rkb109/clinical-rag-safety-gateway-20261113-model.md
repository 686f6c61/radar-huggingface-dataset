# RKB109/clinical-rag-safety-gateway-20261113-model

## Resumen

Clinical RAG Safety Gateway Baseline Model es un prototipo de modelo pequeño y transparente publicado por el usuario RKB109 en Hugging Face. Su propósito declarado es servir como demostración reproducible de una arquitectura de pasarela de seguridad para asistentes clínicos basados en RAG (retrieval-augmented generation), combinando pesos de tokens por etiqueta con recuperación de evidencia ponderada por IDF. No es un modelo de lenguaje generativo al uso, sino un artefacto de referencia orientado a prototipado de arquitectura y comparación de líneas base.

El modelo se distribuye bajo licencia MIT, con la librería `custom` y la etiqueta de pipeline `question-answering`, aunque su cobertura declarada abarca también similitud de frases, clasificación de texto y resumen. No se especifican parámetros, longitud de contexto ni idiomas soportados en la información disponible.

Su relevancia es fundamentalmente metodológica: ilustra cómo estructurar una capa de seguridad (recuperación, atribución de fuentes y abstención explícita) antes de que las respuestas lleguen a equipos clínicos. No obstante, se trata de un artefacto educativo con datos sintéticos y evaluación mínima, no apto para uso clínico real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo basado en pesos de tokens por etiqueta y recuperación de evidencia ponderada por IDF; no es un transformer generativo) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio referencia un formato JSON propio del modelo, según la sección de reproducibilidad) |

## Arquitectura y entrenamiento

La model card describe un enfoque híbrido entre clasificación por etiquetas y recuperación de evidencia: el modelo combina pesos de tokens por etiqueta con recuperación de evidencia ponderada por IDF. No se trata de una arquitectura transformer ni de un modelo generativo con atención; tampoco se menciona un proceso de entrenamiento con RLHF, DPO ni datos a gran escala. El autor indica que el modelo fue generado para demostraciones reproducibles de arquitectura y que no invoca ningún LLM alojado.

El entrenamiento se realizó sobre un dataset sintético y pequeño vinculado al repositorio (`RKB109/clinical-rag-safety-gateway-20261113-dataset`). La evaluación se hizo sobre 4 ejemplos sintéticos retenidos, con una precisión reportada de 1. Las métricas que el autor declara como objetivo son `retrieval_accuracy`, `abstention_coverage` y `citation_coverage`. El repositorio de GitHub asociado incluye `train.py`, el split exacto del dataset, el código de evaluación y el formato JSON del modelo, lo que facilita la reproducibilidad.

## Capacidades

- Question answering: pipeline declarado principal, orientado a preguntas sobre evidencia recuperada.
- Similitud de frases: soporte declarado para tareas de `sentence-similarity`.
- Clasificación de texto: soporte declarado para `text-classification`.
- Resumen: soporte declarado para `summarization`.
- Recuperación de evidencia con ponderación IDF: componente central del diseño de la pasarela.
- Abstención explícita: el diseño contempla la cobertura de abstención como métrica objetivo.
- Atribución de fuentes: la cobertura de citas es una métrica objetivo declarada.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Prototipado de arquitectura de pasarelas RAG clínicas: el modelo sirve para ensayar el flujo completo de recuperación, atribución y abstención antes de integrar un LLM real en un sistema de asistencia clínica.
- Ejemplos de CI y evaluación: puede incorporarse en pipelines de integración continua como línea base reproducible para comparar cambios en la capa de seguridad.
- Comparación de líneas base locales: permite medir `retrieval_accuracy`, `abstention_coverage` y `citation_coverage` frente a alternativas antes de escalar a modelos mayores.
- Experimentación educativa: útil en cursos y talleres sobre RAG seguro, donde se necesita un artefacto pequeño, transparente y sin dependencia de APIs externas.
- Demostración de abstención explícita: sirve para ilustrar cómo un sistema puede negarse a responder cuando la evidencia recuperada es insuficiente, un requisito crítico en contextos sanitarios.
- Validación de formatos de citación: el modelo y su formato JSON asociado permiten probar mecanismos de atribución de fuentes en respuestas generadas.
- No debe emplearse para diagnóstico, tratamiento, consejo médico de emergencia ni decisiones clínicas reales.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| Accuracy | 1 | 4 ejemplos sintéticos retenidos |
| retrieval_accuracy | Métrica objetivo declarada, sin valor publicado | No disponible |
| abstention_coverage | Métrica objetivo declarada, sin valor publicado | No disponible |
| citation_coverage | Métrica objetivo declarada, sin valor publicado | No disponible |

El único resultado numérico publicado es una accuracy de 1 sobre 4 ejemplos sintéticos, muestra demasiado pequeña para ser estadísticamente significativa. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es un artefacto pequeño basado en pesos de tokens y recuperación IDF, por lo que previsiblemente se ejecuta en CPU.
- GPU recomendadas: no disponible; no se requiere GPU según la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el diseño no parece requerir aceleración por hardware.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la librería es `custom` y el repositorio referencia un formato JSON propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (pasarelas RAG de seguridad clínica con abstención y atribución) ni artefactos de referencia con características equivalentes.

## Limitaciones y advertencias

- Datos exclusivamente sintéticos y de tamaño muy reducido; no representan la distribución de datos clínicos reales.
- Evaluación sobre solo 4 ejemplos retenidos, insuficiente para extraer conclusiones de rendimiento.
- El modelo no debe proporcionar diagnóstico, tratamiento ni consejo médico de emergencia.
- No debe usarse para decisiones consecuentes sin datos representativos, revisión experta y evaluación de grado de producción.
- Riesgo de alucinación no evaluado en la información disponible.
- Sesgos conocidos: no documentados, pero previsibles por el uso de datos sintéticos.
- Idiomas soportados: no disponibles.
- Longitud de contexto: no disponible.
- Restricciones de licencia: MIT permite uso comercial, pero la model card desaconseja explícitamente el uso clínico real.
- El modelo no invoca un LLM alojado; su función es demostrativa, no de generación de respuestas clínicas.
- No se documentan mecanismos de tool calling ni de razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/RKB109/clinical-rag-safety-gateway-20261113-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/clinical-rag-safety-gateway-20261113-dataset
- Repositorio GitHub con `train.py`, split del dataset, código de evaluación y formato JSON: no disponible como URL en la información proporcionada (la model card lo menciona sin enlace explícito).
- Paper, blog o demo: no disponibles.
