# keppy/inbox-triage-encoder

## Resumen

`keppy/inbox-triage-encoder` es un clasificador de texto en inglés construido sobre `answerdotai/ModernBERT-base` y afinado para tomar una única decisión por cada correo entrante en un asistente de bandeja de entrada: `reply`, `ask_human`, `wait` o `no_reply`. Lo desarrolla el autor keppy como ejemplo práctico de su framework de evaluación de compuertas de decisión, gonogo, y lo utiliza como la "puerta" encoder que filtra si un agente debe actuar de forma autónoma o derivar a una persona. El modelo se compara en ese ejemplo con modelos generativos propietarios (Claude y TypeSafe's Jev) sobre el mismo conjunto de 870 mensajes del corpus Enron.

Técnicamente es un transformer encoder bidireccional de 149.607.940 parámetros (aproximadamente 149,6 M), denso y no generativo, con una cabeza de clasificación de cuatro etiquetas. Se ha afinado con la herramienta thomas y se ha calibrado mediante temperature scaling sobre una partición de calibración reservada; el artefacto incluye `label2id.json` y `temperature.json` para reproducir la inferencia tal y como la define el autor.

Su relevancia es metodológica más que de producto: el propio autor lo presenta explícitamente como "un ejemplo trabajado para medir una compuerta, no un modelo de triaje de producción". Aporta cifras de tasa de acierto con intervalos de confianza, error de calibración y un análisis de coste bajo una regla declarada, además de documentar con honestidad los fallos que la métrica agregada esconde. La licencia es Apache-2.0 y el repositorio ocupa 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base), denso, con cabeza de clasificación de secuencias; derivado de `answerdotai/ModernBERT-base` |
| Parametros totales | 149.607.940 (aproximadamente 149,6 M, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens en el uso documentado (el autor trunca a `max_length=512`); el modelo base ModernBERT-base admite hasta 8192 tokens, aunque la model card no valida ese régimen tras el afinado |
| Tipos de cuantizacion | no disponible en la model card; el tamaño del repo (0,6 GB) es coherente con pesos en fp32, aunque no se documenta ninguna receta de cuantización |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers), más `label2id.json` y `temperature.json` |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder bidireccional, y se afina como clasificador de secuencias con cuatro etiquetas. La model card no detalla hiperparámetros de entrenamiento, número de pasos, composición exacta del dataset ni si hubo una fase de preferencias (RLHF/DPO); lo que sí documenta es el pipeline: afinado con la herramienta thomas y calibración posterior mediante temperature scaling sobre una partición de calibración reservada, de modo que la inferencia debe dividir los logits por la temperatura almacenada en `temperature.json` antes de aplicar softmax.

Los datos son 870 mensajes del corpus Enron, procedentes de cuatro bandejas (dos abogados, un responsable de asuntos gubernamentales y un responsable de operaciones) del periodo 2000-2001, en la publicación pública de la FERC según la copia de CMU de mayo de 2015. El detalle metodológico clave es que las etiquetas no las escribieron personas: son una política de referencia generada por dos familias de modelos (DeepSeek y GLM) tomando solo los acuerdos entre ambas, más filas adicionales etiquetadas solo por DeepSeek. Está pendiente una comprobación humana ciega sobre una muestra. Los mensajes se formatean como `Mailbox owner / From / To / Cc / Date / Subject`, una línea en blanco y el cuerpo recortado a 2000 caracteres.

## Capacidades

- Clasificación de texto en cuatro clases cerradas (`reply`, `ask_human`, `wait`, `no_reply`) con una única pasada por mensaje.
- Salida de probabilidades calibradas: el artefacto incorpora la temperatura de calibración para que el softmax sea interpretable como probabilidad y permita fijar umbrales de revisión.
- Función de compuerta (gate) dentro de un arnés de agentes: decide si el sistema actúa de forma autónoma, pregunta a una persona o espera.
- Clasificación de correo en inglés con cabeceras estructuradas (propietario de la bandeja, remitente, destinatarios, fecha, asunto).
- Integración directa con transformers (`AutoModelForSequenceClassification`) y compatibilidad declarada con text-embeddings-inference y endpoints.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni generación de texto: es un encoder clasificador, no un modelo generativo.
- No se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- **Enrutado de correo entrante en un asistente interno**: el modelo recibe el mensaje formateado y devuelve una distribución de probabilidad sobre las cuatro acciones; con un umbral configurable, los mensajes con alta probabilidad de `reply` pasan a un generador de borradores y el resto se derivan a una persona. Es adecuado porque cuesta una pasada de 149,6 M de parámetros por mensaje frente al coste de invocar un LLM generativo en cada correo.
- **Filtro previo (pre-gate) para reducir coste de inferencia**: colocado delante de un LLM generativo, descarta o deriva los mensajes que no requieren respuesta autónoma; en el ejemplo del autor se usa exactamente así, comparado contra Claude y Jev sobre los mismos 870 mensajes.
- **Sistema de escalado a humanos con presupuesto de error**: al estar calibrado, permite fijar un objetivo de precisión (por ejemplo, 90%) y elegir el umbral de `ask_human` en consecuencia; útil en flujos donde una derivación innecesaria es preferible a una respuesta autónoma incorrecta.
- **Investigación sobre calibración y evaluación de compuertas**: sirve como caso reproducible para estudiar cómo se comportan las tasas de acierto agregadas frente a reglas de coste asimétricas, y para medir la deriva de umbrales entre conjuntos de evaluación y holdout.
- **Prototipado de asistentes de bandeja para dominios con jerga propia**: al ser un encoder pequeño y abierto, se puede reafinar con etiquetas propias sobre un corpus interno (soporte, legal, administración) manteniendo el mismo contrato de artefacto (`label2id.json` y `temperature.json`).
- **Docencia y auditoría de pipelines de agentes**: el par modelo más arnés gonogo permite mostrar de forma explícita qué decisiones toma un agente sobre correo real y qué errores comete, incluyendo el análisis de los mensajes que quedan sin respuesta ni derivación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí reporta tasas de acierto específicas de la tarea, calculadas con gonogo 0.4 a partir de los informes del ejemplo:

| Conjunto | Tasa de acierto (IC 95%) | Error de calibración |
|---|---|---|
| eval, enriquecido (541) | 80,4% [76,9; 83,5] | 0,05 |
| eval, mezcla natural (344) | 86,0% [82,0; 89,3] | 0,04 |
| holdout (329) | 78,1% [73,3; 82,2] | 0,06 |

El propio autor advierte de lo que la tasa agregada oculta en el holdout: deja 42 de los 159 mensajes que requerían al propietario sin respuesta y sin derivación (frente a 5 de Claude y 3 de Jev en los mismos casos, según la model card), y redacta una respuesta en 10 de ellos. Bajo una regla de coste declarada (un mensaje del propietario no atendido cuesta 4 veces más que una escalada innecesaria), su coste por 100 mensajes es aproximadamente el doble que el de Claude o Jev. Además, el umbral de revisión elegido sobre el conjunto de evaluación no se mantuvo en el holdout con un objetivo de precisión del 90%.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Con 149,6 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,6 GB (tamaño real del repo); en fp16 alrededor de 0,3 GB y en int8 alrededor de 0,15 GB, aunque el autor no documenta recetas de cuantización.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una GPU integrada moderna pueden servirlo con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos años, y también en CPU para volúmenes moderados de correo.
- Opciones de despliegue: transformers (`AutoModelForSequenceClassification`), text-embeddings-inference (el modelo lleva el tag `text-embeddings-inference` y `endpoints_compatible`), contenedores de inferencia compatibles con endpoints. vLLM y llama.cpp no son la vía natural para un encoder clasificador de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card sitúa este modelo frente a dos alternativas generativas en el mismo conjunto de evaluación, pero no publica sus parámetros, contextos ni licencias. Se recogen los datos disponibles:

| Modelo | Tipo | Parametros | Contexto | Comportamiento en el ejemplo (holdout) | Licencia |
|---|---|---|---|---|---|
| inbox-triage-encoder (v4) | Encoder ModernBERT-base afinado para clasificación | 149,6 M | 512 tokens en uso documentado | 78,1% de acierto; 42 de 159 mensajes críticos sin respuesta ni derivación; coste por 100 mensajes aproximadamente 2x | Apache-2.0 |
| Claude (Anthropic) | LLM generativo propietario, acceso por API | no disponible | no disponible | 5 de 159 mensajes críticos sin respuesta ni derivación; coste por 100 mensajes aproximadamente la mitad | no disponible (propietaria) |
| TypeSafe's Jev | modelo citado en el ejemplo, naturaleza exacta no disponible | no disponible | no disponible | 3 de 159 mensajes críticos sin respuesta ni derivación | no disponible |
| `answerdotai/ModernBERT-base` | Encoder base sin cabeza de clasificación de triaje | 149,6 M (modelo base) | hasta 8192 tokens según el modelo base | no aplica: no está afinado para esta tarea | Apache-2.0 |

## Limitaciones y advertencias

- **No es un modelo de producción**: el autor lo describe literalmente como un ejemplo trabajado para medir una compuerta, no como un modelo de triaje listo para desplegar.
- **Etiquetas generadas por modelos, no por personas**: la política de referencia la escribieron DeepSeek y GLM (solo acuerdos, más filas adicionales solo de DeepSeek); la verificación humana ciega está pendiente, por lo que los sesgos de esos modelos impregnan las etiquetas.
- **Dominio muy específico y desactualizado**: cuatro bandejas Enron de 2000-2001 (dos abogados, asuntos gubernamentales y operaciones). La distribución de clases está fuertemente sesgada: `reply` es rara y `ask_human` frecuente. En un correo real la mezcla será distinta y el rendimiento puede degradarse.
- **Riesgo alto en la clase crítica**: en el holdout deja 42 de 159 mensajes que requerían al propietario sin respuesta ni derivación, y redacta respuesta en 10 de ellos. Es el fallo más caro del sistema.
- **Umbral no transferible**: el umbral de revisión seleccionado sobre evaluación no alcanzó el objetivo de precisión del 90% en el holdout; no se debe reutilizar un umbral fijado en otro conjunto sin recalibrar.
- **Calibración solo en este dominio**: el temperature scaling se ajustó en una partición de calibración del mismo corpus; el error de calibración reportado (0,04-0,06) no está validado fuera de él.
- **Idioma**: solo inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- **Límites de entrada**: truncamiento a 512 tokens y recorte del cuerpo a 2000 caracteres; los correos largos pierden información, y el formato de entrada (`Mailbox owner / From / To / Cc / Date / Subject`) debe respetarse.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y el tratamiento de los datos de origen (corpus Enron, publicación pública de la FERC) antes de un despliegue real.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.
- **Riesgo de alucinación**: no aplica en sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es una clasificación errónea con alta confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keppy/inbox-triage-encoder
- Ejemplo de inbox triage en gonogo: https://github.com/keppy/gonogo/tree/main/examples/inbox_triage
- Herramienta de afinado thomas: https://github.com/keppy/thomas
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base

Nota: los resultados de búsqueda web devueltos para este modelo contenían exclusivamente contenido irrelevante y spam, por lo que no se han utilizado ni citado. No se dispone de paper, blog ni demo adicionales.
