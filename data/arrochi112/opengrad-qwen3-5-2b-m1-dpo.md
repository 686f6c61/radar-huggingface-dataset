# arrochi112/OpenGrad-Qwen3.5-2B-M1-DPO

## Resumen

OpenGrad-Qwen3.5-2B-M1-DPO es un ajuste por Optimización Directa de Preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-2B, producido por el usuario arrochi112 dentro del proyecto OpenGrad. El objetivo del experimento era corregir el desequilibrio de calibración del modelo base en tareas de tool calling: la línea base B0 invoca una herramienta en el 64,3 % de los ejemplos cuya respuesta correcta no es una llamada, mientras que recupera el 97,2 % de las llamadas etiquetadas como correctas. Para ello se entrenó sobre 1.741 pares de preferencia del split When2Call en los que la respuesta preferida es la decisión correcta, no necesariamente una llamada a herramienta.

El resultado es un fracaso direccional documentado: DPO eliminó por completo el exceso de llamadas (0,6425 → 0,0034) y elevó la precisión (0,454 → 0,680) y la precisión de aclaración (0,101 → 0,962), pero hundió el recall de llamadas (0,9722 → 0,0131). El modelo dejó de invocar herramientas. El repositorio se publica explícitamente como resultado negativo y el propio autor desaconseja su uso.

Es relevante ahora por dos motivos. Primero, documenta un modo de fallo concreto de DPO cuando la política inicial está fuertemente sesgada hacia una acción: cualquier señal que la aleje de "llamar siempre" reduce el recall, y el reequilibrado por ejemplo en el conjunto de preferencias no lo evita. Segundo, el autor retiró públicamente su propia conclusión sobre la monotonicidad de la degradación al no reproducirse la ejecución, y publicó el incidente junto con las métricas. Solo los pesos del paso 300 están en este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (modelo base Qwen/Qwen3.5-2B; la model card no describe la arquitectura) |
| Parámetros totales | aproximadamente 2.000 millones, según la denominación del modelo base; no se detalla en la información disponible |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible para el modelo base; la ventana de entrenamiento de este ajuste fue de 2.048 tokens |
| Tipos de cuantización | solo pesos en safetensors (sin cuantizar); no se publican versiones GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | no disponible |
| Licencia | other, con identificador composite-per-source |
| Formato de pesos | safetensors (librería transformers); tamaño del repositorio 3,8 GB |

Datos adicionales del entrenamiento: beta 0,1; tasa de aprendizaje 5e-6 con 20 pasos de warmup; 300 pasos; batch 2 con 2 pasos de acumulación; 1.741 pares de preferencia de un total de 9.000; hardware 1x A100-SXM4-80GB; duración 10,1 (la model card queda truncada en ese punto y no especifica la unidad).

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.5-2B ni la composición de su corpus de preentrenamiento. El ajuste es un DPO estándar: política inicial Qwen/Qwen3.5-2B en la revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`, referencia congelada copia de la política inicial, beta 0,1, 5e-6 de tasa de aprendizaje con 20 pasos de warmup, 300 pasos, batch efectivo de 4 y ventana de 2.048 tokens. El conjunto de preferencias procede del split When2Call y contiene 1.741 pares de los 9.000 disponibles; el resto se descartó porque sus esquemas de herramientas usaban type hints de Python en lugar de JSON Schema. Los cuatro comportamientos aparecen como `chosen` en números casi iguales y están presentes ambas direcciones: TOOLCALL → CLARIFY (801 pares) y CLARIFY → TOOLCALL (1.018 pares).

El diagnóstico del fallo que ofrece el autor tiene dos partes. La primera es sobreoptimización: el margen de recompensa implícita crece de 0 a 23,4 con la precisión de preferencia clavada en 1,000 sobre 1.741 pares y 300 pasos, un margen enorme para beta = 0,1. La segunda es el punto de partida: B0 recupera el 97,2 % de las llamadas correctas y solo el 1,3 % de los casos no soportados, de modo que cualquier señal que lo mueva del comportamiento "llamar siempre" destruye recall, y el reequilibrado por ejemplo no puede compensarlo porque hay mucho más "dejar de llamar" que aprender que "seguir llamando". El autor señala además que el corpus del experimento complementario M0 contenía supervisión de tool calling en 9 de 55.719 registros entrenables (0,0162 %), porque un defecto de análisis sintáctico descartaba precisamente los registros con llamadas, y que corregir el corpus fue lo que movió la métrica en `arrochi112/OpenGrad-Qwen3.5-2B-M0-SFT-CorpusV2`.

## Capacidades

- Generación de texto conversacional multirruido, heredada del modelo base Qwen/Qwen3.5-2B.
- Tool calling y function calling: es la capacidad objetivo del ajuste, pero el resultado medido es un recall de llamadas de 0,0131 en el paso 300, es decir, el modelo prácticamente ha dejado de invocar herramientas.
- Formato de esquemas de herramientas en JSON Schema (los pares con type hints de Python se excluyeron del entrenamiento).
- Distinción entre llamada a herramienta, aclaración y respuesta no soportada: la precisión de aclaración alcanza 0,9623 y la de casos no soportados 0,4571 en el paso 300.
- Razonamiento multi-paso y comportamiento de agente: no evaluado ni reportado en la información disponible.
- Capacidades multilingües: no disponibles.
- Vision, audio o modo de razonamiento explícito: no disponibles.
- La model card no documenta ninguna capacidad verificada más allá de las métricas de decisión de llamada reportadas.

## Casos de uso

- Investigación sobre modos de fallo de DPO: el checkpoint permite analizar cómo una política con sesgo extremo hacia una acción colapsa hacia la acción contraria bajo optimización de preferencias, con el margen de recompensa implícita como variable de seguimiento (0 → 23,4 con precisión de preferencia 1,000).
- Estudio de calibración del límite llamada/no llamada: sirve como caso extremo de la curva, con over-call de 0,0034 y recall de 0,0131, frente a los 0,6425 y 0,9722 de la línea base B0.
- Referencia negativa en pipelines de evaluación de tool calling: incluir este checkpoint como control permite comprobar si un conjunto de evaluación distingue entre un modelo que decide bien y uno que simplemente ha dejado de llamar.
- Auditoría de conjuntos de preferencias: el historial de direcciones TOOLCALL → CLARIFY (801) y CLARIFY → TOOLCALL (1.018) con resultado asimétrico sirve para estudiar si el reequilibrado por ejemplo es suficiente cuando la política inicial está desbalanceada.
- Docencia y formación en alineación: caso reproducible de sobreoptimización con conjunto de preferencias pequeño (1.741 pares) y beta mal escalado respecto al margen alcanzado.
- Metodología de publicación y trazabilidad: el repositorio incluye un registro de incidentes con una corrección explícita de una conclusión previa, útil como ejemplo de documentación de resultados negativos y de límites de reproducibilidad.
- Verificación de métricas derivadas: las predicciones por ejemplo guardadas por la ejecución permiten recalcular las 36 métricas y comprobar el redondeo de `metrics.json` (diferencia máxima 4,9e-07) sin necesidad de volver a ejecutar el modelo.

## Benchmarks y rendimiento

Resultados reportados en la model card para la tarea de decisión de llamada a herramienta:

| step | call_f1 | precision | recall | over-call | clar_ok | unsup_ok | pesos |
|---|---|---|---|---|---|---|---|
| 100 | 0,1715 | 0,7669 | 0,0965 | 0,0161 | 0,9179 | 0,6162 | no disponibles (borrados) |
| 200 | 0,0419 | 0,6829 | 0,0216 | 0,0055 | 0,8726 | 0,6317 | no disponibles (borrados) |
| 300 | 0,0258 | 0,6800 | 0,0131 | 0,0034 | 0,9623 | 0,4571 | en este repositorio |
| B0 (base) | 0,6191 | 0,4542 | 0,9722 | 0,6425 | 0,1009 | 0,0131 | — |

Ejecución repetida con el mismo checkpoint base, el mismo fichero de preferencias (SHA-256 `474a8bb1…`), los mismos hiperparámetros, la misma semilla y el mismo entorno de software:

| step | call_f1 original | call_f1 repetición |
|---|---|---|
| 100 | 0,1715 | 0,1036 |
| 200 | 0,0419 | 0,1186 |
| 300 | 0,0258 | 0,0153 |

La ejecución original degradaba de forma monótona desde el paso 100; la repetición alcanzó su máximo en el paso 200. El autor retira la afirmación de monotonicidad como observación de una sola ejecución. No se reportan MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4 GB en fp16 para un modelo de 2.000 millones de parámetros, en torno a 2 GB en int8 y 1,2-1,5 GB en cuantización de 4 bits. Son estimaciones derivadas del tamaño declarado, no mediciones publicadas para este checkpoint.
- GPU recomendadas: el entrenamiento se realizó en 1x A100-SXM4-80GB. Para inferencia, cualquier GPU con 6 GB o más de VRAM es suficiente en fp16 según la estimación anterior.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en Mac con memoria unificada mediante conversión a GGUF.
- Opciones de despliegue: transformers, que es la librería declarada y el único formato publicado (safetensors). vLLM y TGI son compatibles con pesos safetensors de transformers. llama.cpp y Ollama requerirían una conversión a GGUF que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia, tokens por segundo ni consumo de memoria para este checkpoint.
- Nota de despliegue: el modelo está marcado con `endpoints_compatible` en los tags de HuggingFace, pero el autor lo publica como resultado negativo y desaconseja su uso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | call_f1 | precision | recall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenGrad-Qwen3.5-2B-M1-DPO (step 300) | ~2.000 M | ventana de entrenamiento 2.048 tokens | 0,0258 | 0,6800 | 0,0131 | other (composite-per-source) | pesos publicados en este repositorio |
| Qwen/Qwen3.5-2B (B0, línea base) | ~2.000 M | no disponible | 0,6191 | 0,4542 | 0,9722 | no disponible en la información proporcionada | público en HuggingFace |
| arrochi112/OpenGrad-Qwen3.5-2B-M0-SFT-CorpusV2 | ~2.000 M | no disponible | no disponible | no disponible | no disponible | no disponible | mencionado en la model card; el autor lo cita como el experimento que sí movió la métrica |
| Paso 100 del mismo run | ~2.000 M | 2.048 tokens | 0,1715 | 0,7669 | 0,0965 | no aplica | pesos borrados, no recuperables |

No se dispone de datos en la información proporcionada para comparar con alternativas externas de la misma categoría (por ejemplo, otros modelos de 2.000 millones ajustados para tool calling). Los valores de B0 y del paso 100 se incluyen porque aparecen en la model card y permiten situar el checkpoint publicado, pero no son modelos independientes comparables en condiciones equivalentes.

## Limitaciones y advertencias

- El propio autor declara este checkpoint como resultado negativo y no recomienda su uso. El modelo ha dejado prácticamente de invocar herramientas: recall de 0,0131 frente a 0,9722 de la línea base.
- Los pesos de los pasos 100 y 200 fueron borrados del almacenamiento local y nunca se subieron. No existen en ninguna parte y no se pueden recuperar. El paso 100 era el mejor de los tres (`call_f1` 0,1715 frente a 0,0258 en el paso 300), de modo que lo publicado es el peor estado alcanzado por la ejecución.
- La ejecución no es reproducible: repetida con checkpoint base, fichero de preferencias, hiperparámetros, semilla y entorno idénticos, no reprodujo los números. La conclusión de monotonicidad está retirada por el autor.
- Los pesos regenerados en la repetición no se subieron, porque son un modelo distinto y etiquetarlos con los mismos números de paso asociaría las métricas de una ejecución a los pesos de otra.
- La dirección del hallazgo se mantiene en ambas ejecuciones: se elimina el exceso de llamadas, colapsa el recall y sube la precisión.
- Riesgo de alucinación: no evaluado en la información disponible. Un modelo que apenas emite llamadas a herramienta puede producir respuestas en lenguaje natural donde correspondía una invocación, lo que en producción equivale a respuestas no verificadas.
- Sesgos conocidos: no documentados. El sesgo estructural medido es el desequilibrio de la política inicial (recall 0,9722 frente a 0,0131 en casos no soportados), que condiciona cualquier ajuste posterior.
- Limitaciones de contexto: la ventana usada en entrenamiento es de 2.048 tokens; no se especifica la longitud de contexto nativa del modelo base.
- Limitaciones de idioma: no se declara ningún idioma soportado.
- Restricciones de licencia: licencia `other` con identificador `composite-per-source`. Las condiciones concretas no se detallan en la información disponible, por lo que hay que verificar los términos del repositorio y los del modelo base antes de cualquier uso comercial.
- Caveat de producción: aunque el tag `endpoints_compatible` esté presente, el comportamiento medido (over-call 0,0034, recall 0,0131) hace que el modelo no sea apto para pipelines de agentes o de tool calling sin un ajuste adicional.
- No se publican versiones cuantizadas, por lo que cualquier despliegue en llama.cpp u Ollama exige conversión propia y validación del comportamiento resultante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arrochi112/OpenGrad-Qwen3.5-2B-M1-DPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio OpenGrad: https://github.com/arjhinety/OpenGrad
- Registro de incidentes de OpenGrad (INC-0001, corrección de la conclusión sobre monotonicidad): https://github.com/arjhinety/OpenGrad/blob/master/docs/INCIDENT_LOG.md
- Checkpoint complementario M0 con corpus corregido, mencionado en la model card: https://huggingface.co/arrochi112/OpenGrad-Qwen3.5-2B-M0-SFT-CorpusV2
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a páginas de soporte de Microsoft (contacto, inicio de sesión en Hotmail, deprecación de Exchange Online EWS y descarga de ISO de Windows 8.1) y no guardan relación con este modelo.
