# RKB109/clinical-rag-safety-gateway-20261103-model

## Resumen

El Clinical RAG Safety Gateway Baseline Model es un prototipo de modelo pequeno y transparente publicado por el usuario RKB109 en HuggingFace. No es un modelo de lenguaje generativo al uso, sino un componente de clasificacion y recuperacion construido con pesos de tokens por etiqueta combinados con recuperacion de evidencia ponderada por IDF. Su proposito declarado es servir como linea base reproducible para arquitecturas de asistentes clinicos que necesitan recuperacion, atribucion de fuentes y abstencion explicita antes de que las respuestas lleguen a los equipos asistenciales.

El modelo se distribuye bajo licencia MIT, con la libreria `custom` y la etiqueta de pipeline `question-answering`, aunque su cobertura declarada abarca tambien similitud de frases, clasificacion de texto y sumarizacion. No se especifican parametros totales, longitud de contexto ni idiomas soportados en la informacion disponible. El autor lo describe explicitamente como una demostracion de arquitectura generada a partir de datos sinteticos y sin llamadas a LLM alojados.

Su relevancia es limitada y acotada: se trata de un artefacto educativo para prototipado de arquitecturas, ejemplos de CI y evaluacion, y comparaciones de linea base locales. No esta pensado para uso clinico real ni para decisiones con consecuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo custom basado en pesos de tokens por etiqueta y recuperacion de evidencia ponderada por IDF) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (formato JSON propio del modelo, segun la seccion de reproducibilidad) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer convencional ni un modelo generativo. Segun la model card, combina pesos de tokens por etiqueta con recuperacion de evidencia ponderada por IDF. El autor indica que el modelo fue generado para demostraciones reproducibles de arquitectura y que no invoca ningun LLM alojado. El repositorio de GitHub vinculado incluye `train.py`, el split exacto del dataset, el codigo de evaluacion y el formato JSON del modelo.

El entrenamiento se realizo sobre un dataset sintetico y pequeno, referenciado como `RKB109/clinical-rag-safety-gateway-20261103-dataset`. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset. La evaluacion reportada se hizo sobre 4 ejemplos sinteticos reservados (held-out), con una precision de 1. Las metricas que el autor declara como objetivo son `retrieval_accuracy`, `abstention_coverage` y `citation_coverage`, aunque no se aportan sus valores. No se menciona RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Respuesta a preguntas (`question-answering`) sobre evidencia recuperada.
- Similitud de frases (`sentence-similarity`).
- Clasificacion de texto (`text-classification`).
- Sumarizacion (`summarization`).
- Recuperacion de evidencia ponderada por IDF como parte del pipeline.
- Abstencion explicita como comportamiento de diseno (una de las metricas objetivo es `abstention_coverage`).
- Atribucion de fuentes (metrica objetivo `citation_coverage`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado de arquitectura RAG clinica: el modelo sirve para montar y validar el esqueleto de un gateway de seguridad que recupera evidencia, cita fuentes y se abstiene cuando no hay soporte suficiente, antes de integrar un LLM real.
- Ejemplos de CI y evaluacion: al incluir codigo de evaluacion y split exacto en el repositorio, permite ejecutar pruebas automatizadas reproducibles en pipelines de integracion continua.
- Comparaciones de linea base locales: util como referencia minima contra la que medir modelos mas grandes en tareas de QA clinico sintetico.
- Experimentacion educativa: apropiado para cursos y talleres sobre recuperacion, atribucion y abstencion en sistemas de IA sanitaria.
- Validacion de metricas de seguridad: permite ejercitar las metricas `retrieval_accuracy`, `abstention_coverage` y `citation_coverage` en un entorno controlado con datos sinteticos.
- Demostracion de clasificacion y similitud de texto: sus etiquetas de pipeline permiten ilustrar tareas de clasificacion y emparejamiento de frases con un modelo local y transparente.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 1 | 4 ejemplos sinteticos held-out |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica cifra reportada es la precision sobre 4 ejemplos sinteticos, un tamano de muestra demasiado pequeno para extraer conclusiones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no publica el tamano del modelo ni el numero de parametros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con la informacion disponible; al ser un modelo custom pequeno y sin LLM alojado, es probable que sea ligero, pero no se confirma.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la libreria declarada es `custom` y el formato de pesos es JSON propio, por lo que el despliegue requeriria el codigo del repositorio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (lineas base de gateway de seguridad RAG clinico con pesos de tokens por etiqueta y recuperacion IDF).

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos y de tamano muy reducido; no representa la distribucion de datos clinicos reales.
- La evaluacion se limita a 4 ejemplos held-out, insuficiente para establecer fiabilidad estadistica.
- El autor advierte explicitamente que el modelo no debe proporcionar diagnosticos, tratamientos ni consejo medico de emergencia.
- No debe usarse para decisiones con consecuencias sin datos representativos, revision experta y evaluacion de grado produccion.
- Riesgo de alucinacion y de atribucion incorrecta de fuentes no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- Licencia MIT: permite uso comercial, pero la propia model card desaconseja el uso clinico real.
- Ausencia de datos sobre parametros, contexto y formato de pesos complica la planificacion de despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKB109/clinical-rag-safety-gateway-20261103-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/clinical-rag-safety-gateway-20261103-dataset
- Repositorio GitHub con `train.py`, split y codigo de evaluacion: no disponible como URL en la informacion proporcionada (el autor lo menciona sin enlace)
- Paper, blog o demo: no disponibles
