# jeremierostan/Qwen3-1.7B-teacher-note-severity-v2

## Resumen

Qwen3-1.7B-teacher-note-severity-v2 es un ajuste fino mediante LoRA sobre Qwen3-1.7B-teacher-note-severity (que a su vez es un LoRA de Qwen/Qwen3-1.7B), publicado por el usuario jeremierostan. No es un modelo conversacional de propósito general: es un clasificador generativo especializado que recibe una nota de profesor (o un registro acumulado de incidencias) y devuelve un objeto JSON con cuatro campos: `category` (commendation, misbehavior o academic_concern), `location` (in_class o outside_class), `severity` (entero entre -100 y 100) y `escalate` (booleano). La versión v2 añade el campo `location` respecto a la v1.

El modelo hereda de Qwen3-1.7B una arquitectura transformer densa con 1.720.574.976 parámetros (aproximadamente 1,72 mil millones) y una ventana de contexto de 32.000 tokens, lo que permite procesar notas individuales o historiales largos de un alumno en una sola pasada. El ajuste se realizó sobre datos sintéticos del dataset jeremierostan/teacher-notes-severity-v2, con una tasa de aprendizaje de 1e-4 y 2 épocas, continuando el entrenamiento de la v1.

Su relevancia es acotada pero clara: cubre una tarea de triaje administrativo escolar (priorizar qué incidencias requieren intervención de dirección) con una salida estrictamente estructurada y verificable, publicada bajo licencia Apache 2.0. Con 177 descargas y 0 me gusta en el momento de la consulta, es un artefacto de nicho con adopción muy baja, sin validación externa ni benchmarks públicos independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajustado con adaptadores LoRA |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio; al derivar de Qwen3-1.7B son aplicables las conversiones habituales (GGUF, AWQ, GPTQ, bitsandbytes 8/4 bits) |
| Idiomas soportados | No disponible (la model card no especifica idiomas; los datos de entrenamiento son sinteticos y no se detalla su idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | jeremierostan/Qwen3-1.7B-teacher-note-severity (a su vez LoRA de Qwen/Qwen3-1.7B) |
| Dataset de entrenamiento | jeremierostan/teacher-notes-severity-v2 (sintetico) |
| Tarea | Clasificacion generativa con salida JSON estructurada |
| Libreria | transformers |
| Tamano del repositorio | 6,9 GB |
| Descargas / me gusta | 177 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B, un transformer denso con atención completa y ventana de 32.000 tokens. Sobre ese modelo se aplicó primero un ajuste LoRA que dio lugar a Qwen3-1.7B-teacher-note-severity y, después, un segundo ajuste LoRA encadenado que produce esta v2. El entrenamiento se realizó sobre datos sintéticos generados para la tarea, con tasa de aprendizaje de 1e-4 y 2 épocas, continuando el proceso de la v1. No se especifican en la model card el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; solo se indica la naturaleza sintética de los datos.

La innovación técnica es de alcance limitado: el modelo no introduce cambios arquitectónicos, sino que restringe la distribución de salida a un esquema JSON fijo con cuatro campos. La semántica de la escala de severidad está definida explícitamente en la model card: las felicitaciones (commendation) reciben valores negativos, las incidencias rutinarias se sitúan en el rango 5-55 y un valor de severidad mayor o igual a 60 dispara la escalada a administración (`escalate: true`). La v2 incorpora el campo `location`, que distingue entre conductas dentro del aula (in_class) y fuera de ella (outside_class).

## Capacidades

- Clasificacion de notas de profesor en tres categorias: commendation, misbehavior y academic_concern.
- Localizacion de la incidencia: in_class u outside_class.
- Puntuacion de severidad en una escala entera continua de -100 a 100.
- Decision binaria de escalada a administracion mediante el campo `escalate`.
- Salida estrictamente estructurada en JSON con los cuatro campos, con una tasa de parseabilidad del 100 % en el conjunto de evaluacion declarado.
- Procesamiento de notas individuales y de registros acumulados (running logs) de un alumno, aprovechando la ventana de 32.000 tokens.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio. El tag `conversational` del repositorio no implica que el modelo este optimizado para dialogo abierto.

## Casos de uso

- Triaje automatico de incidencias escolares: el modelo recibe el texto de una nota y devuelve severidad y bandera de escalada, de modo que el equipo de direccion puede ordenar su cola de trabajo por urgencia en lugar de revisar las notas en orden de llegada.
- Enrutado a orientacion o a direccion: usando `category` y `escalate`, un sistema de gestion escolar puede dirigir automaticamente las notas academicas al departamento de estudios y las conductas graves a direccion.
- Analisis de historial por alumno: gracias a los 32.000 tokens de contexto, se puede introducir el registro completo de un trimestre y obtener una evaluacion consolidada que detecte patrones de escalation repetida.
- Alertas en tiempo real para tutores: integrado en la aplicacion de partes del centro, el modelo puede emitir una notificacion inmediata al tutor cuando la severidad supera el umbral de 60, reduciendo el tiempo de respuesta ante incidentes graves.
- Generacion de informes disciplinarios estructurados: la salida JSON es directamente insertable en una base de datos o en un cuadro de mando, lo que elimina la transcripcion manual de notas y reduce errores de registro.
- Segmentacion de datos para investigacion educativa: al etiquetar de forma homogenea grandes volumenes de notas con categoria, ubicacion y severidad, se pueden construir series temporales comparables entre cursos o centros.
- Filtrado previo a revision humana: en lugar de descartar notas rutinarias, el modelo permite marcar las que requieren lectura obligatoria, optimizando el tiempo del personal cuando el volumen de notas es alto.
- Preprocesamiento en pipelines de analitica: el campo `location` permite cruzar incidencias de aula y de patio con otras variables del centro (horarios, asignaturas, turnos) para estudios internos de convivencia.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la evaluacion declarada por el autor sobre un conjunto de test sintetico reservado con n=200 ejemplos:

| Metrica | Valor |
|---|---|
| Precision por banda (band accuracy) | 0,930 |
| Precision de categoria (category accuracy) | 0,990 |
| Precision de ubicacion (location accuracy) | 0,990 |
| Error absoluto medio de severidad (severity MAE) | 12,83 |
| F1 de escalada (escalate F1) | 1,000 |
| Tasa de JSON parseable | 1,000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ni comparaciones contra otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada solo para pesos: en BF16/FP16 en torno a 3,5 GB; en INT8 aproximadamente 1,8 GB; en cuantizacion de 4 bits aproximadamente 1,1 GB. Son estimaciones de orden de magnitud a partir del numero de parametros, no mediciones publicadas.
- La cache KV para la ventana completa de 32.000 tokens anade varios gigabytes adicionales en precision nativa; con cuantizacion de la cache o contextos mas cortos (el caso tipico de una nota individual ocupa unos cientos de tokens) el consumo se reduce drasticamente.
- GPU recomendadas para produccion: cualquier GPU con 8 GB o mas de VRAM resulta suficiente en precision reducida o cuantizada (RTX 3060 12 GB, RTX 4070, RTX 4090, L4, A10G). Para lotes grandes a 32.000 tokens son preferibles A100 o H100 por ancho de banda de memoria.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas si se usa cuantizacion de 4 u 8 bits; en BF16 completo es comodo a partir de 8 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI (el repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con Inference Endpoints de Hugging Face), y llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jeremierostan/Qwen3-1.7B-teacher-note-severity-v2 | 1,72 B | 32.000 tokens | Apache 2.0 | Hugging Face, 177 descargas | Salida JSON con campo `location`; metricas propias sobre test sintetico |
| jeremierostan/Qwen3-1.7B-teacher-note-severity (v1) | 1,72 B | 32.000 tokens | No disponible en la informacion proporcionada | Hugging Face | Version previa sin el campo `location` |
| Qwen/Qwen3-1.7B (modelo base) | 1,72 B (no confirmado en la informacion proporcionada) | 32.000 tokens | No disponible en la informacion proporcionada | Hugging Face | Modelo generalista; no resuelve la tarea de triaje sin ajuste |

No se dispone de datos publicos de benchmarks que permitan comparar el rendimiento de este ajuste con alternativas de la misma categoria (por ejemplo, otros clasificadores de notas escolares), por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Evaluacion exclusivamente sobre datos sinteticos: las metricas declaradas (n=200) no demuestran generalizacion a notas reales de un centro educativo, con su vocabulario, abreviaturas y ruido.
- El error absoluto medio de severidad de 12,83 puntos sobre una escala de 201 valores implica desviaciones apreciables en la puntuacion fina; el uso de la severidad como variable continua en decisiones automaticas es arriesgado.
- El umbral de escalada esta fijado en 60 y es una convencion del conjunto de entrenamiento, no una recomendacion pedagogica ni legal; cualquier implantacion real deberia calibrarlo con criterio humano.
- Riesgo de alucinacion en notas ambiguas, ironicas o muy cortas: el modelo esta forzado a emitir un JSON valido, por lo que puede asignar categoria y severidad con alta confianza aunque el texto no contenga informacion suficiente.
- Sesgos potenciales: al entrenarse con datos sinteticos generados por el propio autor, puede reproducir los sesgos de ese generador y no se ha auditado su comportamiento diferencial por genero, origen o perfil del alumnado.
- Idiomas: no se especifican en la model card. El modelo base Qwen3 es multilingue, pero no hay garantia de que el ajuste funcione correctamente fuera del idioma de los datos sinteticos.
- No es un asistente conversacional ni un modelo de razonamiento general: forzarlo a tareas distintas del triaje producira respuestas poco fiables.
- Proteccion de datos: las notas de profesor pueden contener datos personales de menores. Su procesamiento exige base juridica, minimizacion y, segun el caso, evaluacion de impacto, con independencia de la licencia del modelo.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset sintetico, no detalladas en la model card.
- Adopcion muy baja (177 descargas, 0 me gusta) y ausencia de mantenimiento documentado mas alla de la actualizacion del 20 de septiembre de 2026; no hay garantias de soporte.
- El repositorio ocupa 6,9 GB, un tamano notablemente superior al de los pesos de un modelo de 1,72 B en precision de 16 bits, lo que sugiere la inclusion de checkpoints o artefactos de entrenamiento adicionales; conviene revisar los archivos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeremierostan/Qwen3-1.7B-teacher-note-severity-v2
- Modelo base (v1): https://huggingface.co/jeremierostan/Qwen3-1.7B-teacher-note-severity
- Dataset de entrenamiento: https://huggingface.co/datasets/jeremierostan/teacher-notes-severity-v2
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su paper o su repositorio de codigo; no se dispone de blog tecnico, demo ni publicacion asociada.
