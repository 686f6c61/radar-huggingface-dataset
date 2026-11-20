# Remek/basal-omni-1.1-max

## Resumen

basal-omni-1.1-max es un modelo experimental de 12B parámetros desarrollado por Remek, afinado a partir de basal-omni-1.0-max. No es un modelo generativo de texto al uso: lee un *estado* (un mensaje, un documento, pasajes recuperados o la traza de un agente) y responde preguntas tipadas sobre él devolviendo una probabilidad calibrada para cada respuesta permitida en un único forward pass. Está construido sobre la arquitectura `gemma4_unified` y se distribuye con licencia Apache 2.0.

La versión 1.1-max añade una ronda corta de entrenamiento adicional sobre tres de los formatos de tarea del motor basal 2.1: `verify`, `compress` y `extract` (la tarea `classify` no se reentrenó y hereda sus resultados). El resultado es una mejora media de 85,1 frente a 83,5 en seis conjuntos de prueba de tareas, a costa de un ligero retroceso en decisiones generales (0,821 frente a 0,823 en Werdykt v1). Por ello, el autor mantiene 1.0-max como modelo por defecto y recomienda 1.1-max cuando las tareas concretas sean el uso principal.

Su relevancia actual reside en el enfoque: en lugar de generar texto libre, produce decisiones tipadas y calibradas, lo que facilita la automatización con umbrales de error controlados (por ejemplo, certificar un 5 % de error objetivo en `classify`). Soporta polaco e inglés y está pensado para clasificación, verificación, compresión y extracción de campos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer, según tag de Hugging Face) |
| Parametros totales | 11.959.730.224 (≈12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los benchmarks cubren estados de 0 a más de 16k caracteres, ≈8k tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor sirve en bf16) |
| Idiomas soportados | pl (polaco), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `gemma4_unified` y se obtiene por fine-tuning de basal-omni-1.0-max con una ronda corta de entrenamiento adicional centrada en tres formatos de tarea del motor basal 2.1: `verify`, `compress` y `extract`. La tarea `classify` no se reentrenó y sus resultados se heredan de la versión anterior. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset.

Sí se especifica qué datos vio en entrenamiento: los splits de entrenamiento de VitaminC y QASPER, y documentos sintéticos para `extract` generados por un generador distinto al de las facturas de test. CLINC150, BANKING77 y RAGTruth no se usaron en entrenamiento, por lo que sus resultados corresponden a conjuntos no vistos. El modelo no genera texto: en un único forward pass emite una probabilidad calibrada por cada respuesta permitida, y el motor basal construye las tareas a partir de esas decisiones. Cada modelo se sirve con su propio fichero de calibración. Se reporta además una verificación de solapamiento: 27 ítems de test comparten un fragmento de 13 palabras con filas de entrenamiento; sin ellos, las ganancias son de +4,2 puntos en VitaminC y +2,7 en QASPER, manteniendo la media de 85,1 en los seis conjuntos.

## Capacidades

- Decisiones tipadas con probabilidad calibrada por respuesta permitida, en un solo forward pass.
- Clasificación (`classify`): etiquetado de intenciones y categorías (evaluado en CLINC150 y BANKING77).
- Verificación (`verify`): comprobación de afirmaciones contra una fuente, incluida detección de información no respaldada (evaluado en VitaminC y RAGTruth).
- Compresión (`compress`): selección de pasajes relevantes de un documento (evaluado en QASPER).
- Extracción (`extract`): extracción de campos estructurados de documentos, incluidos layouts no vistos en entrenamiento.
- Automatización con umbral de error: el campo `automated` permite certificar respuestas a un objetivo de error (certificado al 5 % en `classify`).
- Capacidades multilingües en polaco e inglés.
- No soporta generación de texto libre; no se documentan tool calling, uso de agentes ni modo de razonamiento extendido.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo puede asignar una etiqueta entre un conjunto cerrado (evaluado con 151 etiquetas en CLINC150) y devolver la probabilidad calibrada, lo que permite derivar solo los casos de baja confianza a revisión humana.
- Verificación de respuestas en sistemas RAG: dado un par respuesta-fuente, el modelo determina si la respuesta está respaldada por el contexto recuperado (evaluado en RAGTruth), útil como filtro anti-alucinación antes de mostrar la respuesta al usuario.
- Extracción de campos de facturas y documentos administrativos: con 12 campos evaluados y un 91,4 % de campos correctos, encaja en pipelines de digitalización de documentos financieros.
- Procesamiento de documentos con layouts nuevos: al generalizar a disposiciones no vistas en entrenamiento (89,3 % de campos correctos), sirve para ingestas de documentos de proveedores heterogéneos.
- Compresión de contexto para RAG: seleccionar el 30 % de caracteres manteniendo el 93,1 % de los párrafos necesarios reduce el coste de los modelos generativos posteriores.
- Moderación y verificación de trazas de agentes: al aceptar como estado la traza de un agente, puede verificar pasos intermedios contra las fuentes disponibles.
- Automatización con SLA de error: en `classify` con objetivo del 5 % de error, el 38,5 % de las respuestas se automatizaron con solo un 2,2 % de error observado, lo que permite definir políticas de auto-resolución.

## Benchmarks y rendimiento

Resultados de tareas (motor basal-serve 2.1, H100, bf16, `--mode eager`, misma calibración por modelo):

| Tarea | Conjunto | n | 1.1-max | 1.0-max |
|---|---|---|---|---|
| classify | CLINC150 "plus" test (151 etiquetas) | 1.000 | 86,4 % | 85,4 % |
| classify | BANKING77 test (77 etiquetas) | 1.000 | 74,0 % | 74,6 % |
| verify | VitaminC (3 vías) | 1.000 | 84,3 % | 80,3 % |
| verify | RAGTruth (binario) | 1.000 | 81,6 % | 80,3 % |
| compress | QASPER (mantener 30 % de caracteres) | 248 | 93,1 % | 90,1 % |
| extract | facturas sintéticas PL/EN (12 campos) | 400 | 91,4 % | 90,1 % |
| extract | layouts no vistos en entrenamiento | 400 | 89,3 % | 84,8 % |

Decisiones generales:

| Benchmark | 1.1-max | 1.0-max |
|---|---|---|
| Werdykt v1, macro (PL + EN) | 0,821 | 0,823 |
| Decisiones PL (test held-out, 7.081) | 0,945 | 0,954 |
| PL general (3.079 ítems) | 0,803 | 0,810 |
| PL-Real (300 documentos) | 0,980 | 0,980 |
| EN corpus test (1.479 ítems) | 0,721 | 0,724 |
| EN panel externo (10 tareas, 3.842 ítems) | 0,766 | 0,789 |
| LEK examen médico PL / EN | 74,4 / 80,2 | 75,0 / 80,9 |
| Cobertura a 1 % de error | 47,1 % (0,77 % error) | 47,4 % (0,47 % error) |

Precisión por longitud del estado (Werdykt, 5.000 ítems, 82,1 % global): 0-1k caracteres 73,3 %; 1k-2k 80,2 %; 2k-4k 93,2 %; 4k-8k 98,0 %; 8k-16k 84,4 %; 16k+ 70,1 %. El autor advierte que los estados cortos son mayoritariamente reglas e ítems de abstención, más difíciles para todos los modelos basal, por lo que debe leerse como precisión por tramo y no como efecto puro de la longitud. Documentos completos: todos los 12 campos correctos en el 60,5 % de las facturas (1.0-max 52,5 %) y 38,8 % de documentos totalmente correctos en layouts no vistos (1.0-max 22,8 %).

## Requisitos de hardware

- El autor reporta servicio en una única H100 con `--mode eager` y bf16, con fichero de calibración propio por modelo.
- VRAM estimada para inferencia: no disponible de forma explícita; con 11,96B parámetros, en bf16 requiere del orden de 24 GB de pesos, más overhead de activaciones y contexto.
- GPU recomendadas: H100 (configuración reportada por el autor). Para consumer, encajaría previsiblemente en RTX 4090 (24 GB) en bf16 al límite, o en GPUs de 16 GB con cuantización, aunque no se documentan cuantizaciones ni pruebas en consumer.
- Opciones de despliegue: el autor sirve con el motor propio basal (basal-serve 2.1, repositorio `rkinas/basal`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.1-max | ≈12B | no disponible | Decisiones tipadas calibradas | Apache 2.0 | Hugging Face |
| basal-omni-1.0-max | ≈12B | no disponible | Decisiones tipadas calibradas | Apache 2.0 (según modelo base) | Hugging Face |
| Modelos generativos de 12B (p. ej., Gemma) | ≈12B | no disponible en esta ficha | Generación de texto | según modelo | Hugging Face |

La comparación más directa es con su predecesor 1.0-max: 1.1-max gana en las seis tareas (85,1 frente a 83,5 de media) pero pierde en decisiones generales (0,821 frente a 0,823 en Werdykt; 0,766 frente a 0,789 en el panel externo EN), con una caída notable en ContractNLI (0,583 frente a 0,720). Frente a modelos generativos del mismo tamaño, la diferencia es de paradigma: 1.1-max no escribe texto y no es sustituible directamente en tareas de generación. No se dispone de comparativas con otros modelos de decisión tipada en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor recomienda 1.0-max como opción por defecto y 1.1-max solo cuando las tareas sean el uso principal, validándolo sobre datos propios.
- No genera texto: no sirve para tareas de generación libre, resumen o chat generativo.
- Regresión en verificación de entailment: en ContractNLI pierde 13,7 puntos frente a 1.0-max (0,583 frente a 0,720), con tendencia a elegir "no se menciona lo suficiente"; para preguntas de entailment fuera de `verify`, usar 1.0-max.
- Umbrales de automatización: no se pudo certificar ningún umbral para `classify` al 1 % de error ni para `verify`; en esos casos `automated` es `null` y hay que revisar las respuestas o ajustar `task_thresholds` con datos etiquetados propios.
- Idiomas limitados a polaco e inglés; no se documenta soporte de castellano.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente fuera de la distribución de entrenamiento (ECE 0,051 en Werdykt).
- Precisión degradada en estados muy largos (70,1 % en 16k+ caracteres) y en estados cortos con reglas o abstención (73,3 % en 0-1k).
- Licencia Apache 2.0 permite uso comercial, pero el carácter experimental y la ausencia de benchmarks en dominios ajenos a los evaluados exigen validación previa en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-omni-1.1-max
- Modelo base: https://huggingface.co/Remek/basal-omni-1.0-max
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
