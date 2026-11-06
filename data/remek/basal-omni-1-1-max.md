# Remek/basal-omni-1.1-max

## Resumen

basal-omni-1.1-max es un modelo experimental de 12B parámetros desarrollado por Remek, construido como un ajuste fino de basal-omni-1.0-max. A diferencia de los modelos generativos convencionales, no produce texto libre: lee un *estado* (un mensaje, un documento, pasajes recuperados o una traza de agente) y responde a preguntas tipadas devolviendo una probabilidad calibrada para cada respuesta permitida en un único forward pass. La arquitectura se etiqueta como `gemma4_unified` y el modelo se sirve mediante el motor de inferencia basal.

Esta versión 1.1-max añade una ronda corta de entrenamiento adicional sobre tres de los formatos de tarea de basal 2.1: `verify`, `compress` y `extract` (la tarea `classify` no se entrenó y hereda los resultados de 1.0-max). El resultado es una mejora en esas tareas concretas (media de 85,1 frente a 83,5 en seis conjuntos de prueba), a costa de un ligero retroceso en decisiones generales. Por ello, el autor recomienda mantener 1.0-max como modelo por defecto y usar 1.1-max cuando las tareas específicas sean el uso principal.

El modelo está orientado a toma de decisiones estructurada, clasificación, extracción y verificación de información, con soporte para polaco e inglés y licencia Apache 2.0. Su relevancia actual reside en la propuesta de un paradigma alternativo al texto generativo: salidas tipadas con calibración explícita, lo que facilita la automatización con umbrales de error controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer, según tag de Hugging Face) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se reportan estados de 16k+ caracteres, ~8k tokens) |
| Tipos de cuantizacion | bf16 (modo de servicio reportado); otras cuantizaciones no disponibles |
| Idiomas soportados | pl (polaco), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `gemma4_unified` y se sirve con el motor basal en modo `--mode eager` con precisión bf16. La arquitectura subyacente es de tipo transformer, pero la model card no detalla la composición interna, el número de tokens de entrenamiento ni si hubo RLHF o DPO. La innovación central no es arquitectónica sino de interfaz: el modelo no genera texto, sino que produce decisiones tipadas con probabilidades calibradas por opción en un solo forward pass.

El entrenamiento de 1.1-max consiste en una ronda corta adicional sobre los formatos de tarea `verify`, `compress` y `extract`, usando los splits de entrenamiento de VitaminC y QASPER, y documentos sintéticos para `extract` generados por un generador distinto al de las facturas de prueba. CLINC150, BANKING77 y RAGTruth no se usaron en entrenamiento, por lo que sus resultados son sobre conjuntos no vistos. El autor reporta una comprobación de solapamiento: 27 ítems de test comparten un span de 13 palabras con filas de entrenamiento; sin ellos, las ganancias son +4,2 puntos en VitaminC (intervalo pareado del 95%: +2,1 a +6,2) y +2,7 en QASPER (+0,8 a +4,9), manteniéndose la media de 85,1 en los seis conjuntos.

## Capacidades

- Decisiones tipadas con probabilidad calibrada por respuesta permitida, en un único forward pass.
- Clasificación (`classify`): precisión del 86,4% en CLINC150 "plus" (151 etiquetas, incluida fuera de alcance) y 74,0% en BANKING77 (77 etiquetas).
- Verificación (`verify`): 84,3% en VitaminC (3 vías) y 81,6% en RAGTruth (respuesta frente a fuente, binario).
- Compresión (`compress`): retención del 93,1% de los párrafos necesarios en QASPER manteniendo el 30% de los caracteres.
- Extracción (`extract`): 91,4% de campos correctos en facturas sintéticas PL/EN de 12 campos y 89,3% en documentos con layouts nunca vistos en entrenamiento.
- Capacidad de automatización con umbral de error: en `classify` con objetivo de error del 5%, el 38,5% de las respuestas se automatizaron con un 2,2% de error observado.
- Soporte multilingüe limitado a polaco e inglés.
- No soporta generación de texto libre, tool calling ni function calling (no disponible en la información proporcionada).
- No se reportan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode); la etiqueta `image-text-to-text` aparece en Hugging Face pero no se detalla en la model card.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo asigna probabilidades calibradas sobre 151 etiquetas (incluida fuera de alcance) con un 86,4% de precisión en CLINC150, lo que permite enrutar tickets y derivar a revisión humana solo las respuestas de baja confianza.
- Verificación de respuestas en sistemas RAG: comprobar si la respuesta generada está respaldada por las fuentes recuperadas (81,6% en RAGTruth), usando la probabilidad calibrada para decidir si se muestra al usuario o se marca para revisión.
- Compresión de contexto para pipelines RAG: reducir párrafos de documentos largos al 30% de los caracteres conservando el 93,1% de los párrafos necesarios, disminuyendo el coste de tokens en el contexto enviado al modelo generativo final.
- Extracción de campos en facturas y documentos administrativos: obtener 12 campos estructurados con un 91,4% de campos correctos y un 60,5% de facturas con todos los campos correctos, adecuado para automatizar la entrada de datos contables.
- Procesamiento de documentos con layouts desconocidos: con un 89,3% de campos correctos y un 38,8% de documentos completamente correctos en layouts nunca vistos, útil para bandejas de entrada heterogéneas donde no se puede prever el formato.
- Verificación de hechos en flujos de agentes: dado un estado con la traza de un agente y los pasajes recuperados, decidir con probabilidad calibrada si una afirmación es correcta, incorrecta o no verificable, integrable en bucles multi-paso.
- Filtrado de documentos médicos o legales en polaco: con 0,980 en PL-Real (300 documentos reales polacos) y 74,4 en el examen médico LEK polaco, puede asistir en la clasificación y verificación de contenido especializado en ese idioma.

## Benchmarks y rendimiento

Resultados de tareas (servido con basal-serve 2.1, modo eager, bf16, un orden de opciones, con archivo de calibración propio):

| Tarea | Conjunto | n | 1.1-max | 1.0-max |
|---|---|---|---|---|
| classify | CLINC150 "plus", accuracy (151 etiquetas) | 1.000 | 86,4% | 85,4% |
| classify | BANKING77, accuracy (77 etiquetas) | 1.000 | 74,0% | 74,6% |
| verify | VitaminC (3 vías), accuracy | 1.000 | 84,3% | 80,3% |
| verify | RAGTruth, respuesta vs fuente (binario), accuracy | 1.000 | 81,6% | 80,3% |
| compress | QASPER, conservar 30% de caracteres, párrafos necesarios retenidos | 248 | 93,1% | 90,1% |
| extract | facturas sintéticas PL/EN, 12 campos, campos correctos | 400 | 91,4% | 90,1% |
| extract | layouts no vistos en entrenamiento, campos correctos | 400 | 89,3% | 84,8% |

Decisiones generales:

| Benchmark | 1.1-max | 1.0-max |
|---|---|---|
| Werdykt v1, macro (PL + EN oculto, 10 categorías × 2 idiomas) | 0,821 | 0,823 |
| PL decisions (test oculto de basal-1.0, 7.081 ítems) | 0,945 | 0,954 |
| PL general (conocimiento, exámenes, lectura; 3.079 ítems) | 0,803 | 0,810 |
| PL-Real (300 documentos polacos reales) | 0,980 | 0,980 |
| EN corpus test (1.479 ítems) | 0,721 | 0,724 |
| EN external panel (10 tareas públicas en inglés, 3.842 ítems) | 0,766 | 0,789 |
| LEK, examen médico polaco (4.727) / versión inglesa (3.151) | 74,4 / 80,2 | 75,0 / 80,9 |
| Cobertura con 1% de error (test de calibración, por tipo de pregunta) | 47,1% (0,77% error) | 47,4% (0,47% error) |

Precisión por longitud del estado en Werdykt (5.000 ítems, PL y EN, 82,1% global; intervalos Wilson del 95%):

| Longitud del estado | Ítems | Precisión |
|---|---|---|
| 0-1k | 709 | 73,3% [70, 76] |
| 1k-2k | 2.598 | 80,2% [79, 82] |
| 2k-4k | 796 | 93,2% [91, 95] |
| 4k-8k | 394 | 98,0% [96, 99] |
| 8k-16k | 128 | 84,4% [77, 90] |
| 16k+ | 375 | 70,1% [65, 75] |

Otros datos reportados: ECE de 0,051 frente a 0,054 en 1.0-max; en Werdykt servido con `--deterministic`, el modo por defecto dio la misma respuesta en 2.000 de 2.000 ítems; automatización con 1% de error: 57,7% con 1,23% de error observado (1.0-max: 60,1% con 1,45%). La mayor pérdida se da en ContractNLI: 0,583 frente a 0,720 (−13,7 puntos, intervalo pareado del 95%: −19,3 a −7,7).

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 24 GB para los pesos (tamaño del repo de 24,0 GB), más overhead de activaciones y del motor basal; se recomienda una GPU con al menos 40 GB para servicio cómodo.
- GPU recomendadas: los resultados reportados se obtuvieron en una H100; para producción se sugiere H100, A100 80GB o A100 40GB.
- GPU de consumo: no disponible confirmación; con 12B parámetros en bf16 no cabe en GPUs de 24 GB (RTX 4090) sin cuantización, y no se documentan cuantizaciones alternativas.
- Opciones de despliegue: motor basal (`basal-serve 2.1`, modos `--mode eager` y `--deterministic`); despliegue con transformers es posible por la librería declarada, pero no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.1-max | ~12B | no disponible | apache-2.0 | decisiones tipadas calibradas | Hugging Face |
| basal-omni-1.0-max | ~12B | no disponible | apache-2.0 | decisiones tipadas calibradas | Hugging Face |
| Modelos generativos de ~12B para clasificación/extracción | variable | variable | variable | generación de texto | no disponible comparativa directa |

La comparación natural es con su modelo base basal-omni-1.0-max: 1.1-max gana en tareas (85,1 frente a 83,5 de media) y en calibración (ECE 0,051 frente a 0,054), pero pierde en decisiones generales (Werdykt 0,821 frente a 0,823; panel externo EN 0,766 frente a 0,789; ContractNLI 0,583 frente a 0,720). No se dispone de datos sobre otros modelos comparables de la misma categoría (decisiones tipadas calibradas) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre; solo responde a preguntas tipadas con probabilidades calibradas. No es adecuado para tareas generativas.
- Retroceso en decisiones generales respecto a 1.0-max: −0,2 puntos en Werdykt, −2,3 puntos en el panel externo EN y −13,7 puntos en ContractNLI, donde el entrenamiento de `verify` hizo que la opción "no mencionado" fuera demasiado probable (189 de 300 ítems frente a 117 en 1.0-max). Para preguntas de entailment fuera de `verify`, usar 1.0-max.
- La tarea `classify` no se entrenó en esta versión; sus resultados se heredan de 1.0-max.
- No se pudo certificar umbral de automatización para `classify` con 1% de error ni para `verify`; en esos casos `automated` es `null` y las respuestas deben revisarse o ajustar `task_thresholds` con datos etiquetados propios.
- Riesgo de alucinación en el sentido de calibración imperfecta: las probabilidades son calibradas pero no perfectas (ECE 0,051), por lo que umbrales agresivos pueden producir errores no detectados.
- Limitaciones de idioma: solo polaco e inglés; no se reporta soporte para otras lenguas.
- Precisión dependiente de la longitud del estado: cae al 70,1% en estados de 16k+ caracteres y al 73,3% en estados de 0-1k (este último sesgado por ítems de reglas y abstención, más difíciles).
- Modelo experimental: el autor recomienda validarlo con datos propios antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni condiciones de uso del motor basal (repositorio separado en GitHub).
- El solapamiento de 27 ítems de test con entrenamiento (12 VitaminC, 15 QASPER) exige leer las ganancias con cautela, aunque el autor reporta los intervalos sin ellos.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-omni-1.1-max
- Modelo base: https://huggingface.co/Remek/basal-omni-1.0-max
- Motor de inferencia (GitHub): https://github.com/rkinas/basal
- Web del proyecto: https://basal.si5.pl/
