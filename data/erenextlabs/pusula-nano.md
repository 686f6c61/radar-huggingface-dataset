# erenextlabs/pusula-nano

## Resumen

Pusula Nano es un cross-encoder de 149 millones de parámetros construido sobre TabiBERT, un modelo encoder preentrenado en turco. Lo desarrolla Erenext's AI Lab y su función no es generar texto, sino actuar como motor de decisión: recibe un mensaje en turco junto con una pregunta tipada (enrutamiento de solicitudes, urgencia, derivación a humano, inyección de prompt o preguntas personalizadas) y devuelve una probabilidad para cada opción de respuesta. La versión documentada es la v2.0, publicada el 31 de octubre de 2026.

El modelo resuelve un problema muy concreto de los sistemas de atención al cliente y de agentes conversacionales: clasificar y enrutar mensajes de forma fiable, rápida y barata. Al ser un cross-encoder de 149M de parámetros y aproximadamente 0,6 GB de pesos, se ejecuta en CPU o en cualquier GPU pequeña, lo que lo hace adecuado para procesar volúmenes altos con latencia baja. Comparte interfaz y formato de petición con el modelo mayor de la familia, Pusula, lo que permite sustituir uno por otro según el presupuesto de cómputo.

La relevancia actual está en que cubre 20 dominios de enrutamiento y 20 plantillas de decisión (urgencia, acción requerida, riesgo de seguridad, datos personales, fraude, etc.) con una precisión del 89,9 % sobre 500 mensajes reales de clientes en el conjunto de evaluación, frente al 90,6 % del Pusula completo, pero con una huella de memoria muy inferior. La licencia es Apache 2.0 y el idioma soportado es únicamente el turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (TabiBERT) configurado como cross-encoder con scorer de opciones |
| Parametros totales | 149 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; el repo ocupa ~2,4 GB, los pesos del modelo ~0,6 GB) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pusula Nano parte de TabiBERT, el encoder turco de la Universidad de Boğaziçi, y se afina como cross-encoder: cada tripleta (mensaje, pregunta, opción) se puntúa conjuntamente, de modo que el modelo no clasifica el mensaje de forma aislada, sino en función de la pregunta tipada que se le formula. Tras el ajuste se calibran las temperaturas de los tres tipos de pregunta sobre un conjunto de validación reservado, lo que convierte las puntuaciones en probabilidades por opción. El entrenamiento consistió en dos épocas de fine-tuning.

Los datos de entrenamiento combinan 35.635 mensajes sintéticos en turco (19.399 generados por Gemma-4-31B-it sobre sectores NACE Rev. 2.1 y ocupaciones ESCO, más 16.236 mensajes sintéticos anteriores) etiquetados por Qwen3.8-27B según una política de etiquetado escrita, y 7.419 mensajes reales licenciados de un socio comercial y anonimizados (mensajes de clientes y quejas largas), etiquetados por el mismo modelo bajo la misma política. Los 201 mensajes etiquetados como información faltante se repitieron ocho veces exclusivamente para esa pregunta. Los mensajes de los conjuntos de evaluación quedaron excluidos del entrenamiento.

## Capacidades

- Clasificación de enrutamiento sobre 20 dominios de atención al cliente en turco.
- Respuesta a 20 plantillas de decisión tipadas: urgencia, derivación a humano, acción requerida, riesgo de seguridad, datos personales, fraude, oportunidad de venta, insultos y discurso de odio, información faltante, etc.
- Detección de inyección de prompt (instrucciones ocultas en documentos).
- Detección de datos personales en correos electrónicos.
- Evaluación de la fundamentación en fuentes de respuestas de agentes (`kaynaga_dayanma`).
- Soporte de preguntas personalizadas definidas por el usuario, con menor rendimiento en sectores no vistos.
- Ejecución en CPU o GPU, con interfaz HTTP (`pusula-serve`) y biblioteca Python (`DecisionEngine`).
- No genera texto libre, no hace tool calling ni razonamiento multi-paso; su salida es una distribución de probabilidad sobre opciones.

## Casos de uso

- Enrutamiento de tickets en atención al cliente: cada mensaje entrante se pasa por el motor con la pregunta de enrutamiento y se asigna al departamento correspondiente entre 20 dominios, con una precisión del 89,9 % sobre mensajes reales, suficiente para triaje automático con revisión humana de los casos de baja confianza.
- Detección de urgencia y derivación a humano: las plantillas de urgencia y `handoff` permiten marcar conversaciones que requieren intervención inmediata de un agente, ejecutándose en CPU a bajo coste para todo el volumen de entrada.
- Filtrado de seguridad en correos y documentos: la detección de datos personales (93,3 % en correos) y de instrucciones ocultas en documentos (78,2 %) sirve como capa previa antes de que un LLM procese el contenido.
- Moderación de contenido en turco: la evaluación sobre OffensEval 2020 (81,8 %) lo hace utilizable como clasificador de lenguaje ofensivo en tweets y comentarios, con revisión humana en los casos límite.
- Enriquecimiento de pipelines de agentes: al compartir interfaz con Pusula, se puede desplegar Nano como primera pasada barata y escalar a Pusula solo en los casos donde la confianza sea baja, reduciendo coste por mensaje.
- Procesamiento por lotes de quejas largas: rinde un 84,6 % en quejas largas de clientes, por lo que puede clasificar grandes volúmenes históricos de reclamaciones sin GPU dedicada.
- Detección de fraude y oportunidad de venta: con un 69,1 % y un 95,0 % respectivamente en los conjuntos de evaluación, es adecuado como señal auxiliar en CRM, no como decisión autónoma en fraude.

## Benchmarks y rendimiento

Resultados de precisión (%) publicados en la model card. Las etiquetas de evaluación se asignaron a ciegas por dos anotadores con adjudicación bajo la política de etiquetado publicada.

| Evaluacion | Preguntas | Nano 1.0 | Nano 2.0 | Pusula 2.0 |
|---|---:|---:|---:|---:|
| Mensajes reales de clientes (500 held-out) | 7.500 | 64,0 | 89,9 | 90,6 |
| Quejas largas (500 held-out) | 4.500 | 84,6 | 84,6 | 88,3 |
| Turkish Decision Benchmark (2.194 mensajes) | 19.861 | 82,7 | 83,2 | 92,0 |
| Gold test set (757 mensajes) | 11.355 | 62,8 | 91,3 | 92,1 |
| Preguntas personalizadas en sectores no vistos | 400 | 50,5 | 55,5 | 93,5 |
| Informacion faltante (`eksik_bilgi`) | 99 | 58,6 | 53,5 | 98,0 |
| Oportunidad de venta (`satis_firsati`) | 100 | 51,0 | 95,0 | 97,0 |
| Seguridad vital (`can_guvenligi`) | 120 | 81,7 | 89,2 | 100,0 |
| Insultos y discurso de odio (`hakaret`) | 114 | 43,9 | 71,0 | 95,6 |
| Fraude (`dolandiricilik`) | 97 | 51,5 | 69,1 | 100,0 |
| Fundamentacion en fuentes (`kaynaga_dayanma`) | 100 | 30,0 | 38,0 | 98,0 |
| Preguntas de agentes IA (plantillas 17-20) | 300 | 51,2 | 68,2 | 97,8 |
| Datos personales en correos | 150 | 71,3 | 93,3 | 100,0 |
| Instrucciones ocultas en documentos | 400 | 73,8 | 78,2 | 100,0 |
| Documentos largos (~12.000 caracteres) | 120 | 46,7 | 50,8 | 100,0 |
| MASSIVE tr-TR, 60 intenciones, zero-shot | 2.974 | 36,4 | 32,7 | 85,2 |
| OffensEval 2020 turco (tweets reales) | 3.528 | 30,6 | 81,8 | 88,3 |

Nano 2.0 supera a Nano 1.0 en 14 de las 17 evaluaciones, empata en quejas largas y queda por debajo en información faltante (53,5 frente a 58,6) y MASSIVE (32,7 frente a 36,4).

## Requisitos de hardware

- Pesos del modelo: aproximadamente 0,6 GB en safetensors; el repositorio completo ocupa 2,4 GB.
- VRAM estimada: inferior a 1 GB en FP32 para los pesos; en la práctica cabe en cualquier GPU con 2 GB o más, y en CPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es suficiente; en servidor, T4 o A10 bastan para lotes grandes.
- Cabe en GPU consumer: sí, en todas las tarjetas con al menos 2 GB de memoria.
- Opciones de despliegue: biblioteca Python `pusula` (`DecisionEngine.load`), servidor HTTP `pusula-serve`, y descarga vía `hf download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un encoder de clasificación y no un modelo generativo.
- Latencia y throughput: no se publican cifras concretas; la model card lo describe como apto para procesamiento de alto volumen y baja latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión mensajes reales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pusula Nano 2.0 | 149 M | no disponible | 89,9 % | Apache 2.0 | HuggingFace |
| Pusula 2.0 | no disponible | no disponible | 90,6 % | no disponible | HuggingFace |
| Pusula Nano 1.0 | 149 M | no disponible | 64,0 % | Apache 2.0 | HuggingFace (revisión `v1.0`) |
| TabiBERT (base) | no disponible | no disponible | no aplica (no afinado para esta tarea) | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks de clasificadores turcos alternativos de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta turco; no es utilizable en otros idiomas.
- Rendimiento limitado en tareas distintas de las preguntas de entrenamiento: 32,7 % en MASSIVE 60-way frente al 85,2 % de Pusula.
- Bajo rendimiento en preguntas personalizadas de sectores no vistos (55,5 %) y en fundamentación en fuentes (38,0 %).
- La mayoría de los datos de entrenamiento es sintética; se recomienda evaluar sobre datos propios de la aplicación antes de desplegar.
- La evaluación se realizó con etiquetas asignadas por modelos (Claude Opus 5.5 y Sonnet 5.5) bajo una política publicada, no por anotadores humanos en todos los conjuntos; conviene tenerlo en cuenta al interpretar las cifras.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí hay riesgo de clasificación errónea en casos límite; se recomienda umbral de confianza y revisión humana.
- No se documentan sesgos específicos más allá de los derivados de los datos sintéticos y del socio comercial.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos licenciados del socio.
- No es un modelo generativo: no sirve para producir respuestas, solo para puntuar opciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erenextlabs/pusula-nano
- Modelo base TabiBERT: https://huggingface.co/boun-tabilab/TabiBERT
- Modelo Pusula (versión completa): https://huggingface.co/erenextlabs/pusula
- Repositorio GitHub de Pusula: https://github.com/erenextlabs/pusula
- Política de etiquetado: https://github.com/erenextlabs/pusula/blob/main/pusula/data/label_policy.md
- Dataset Turkish Decision Benchmark: https://huggingface.co/datasets/erenextlabs/turkish-decision-benchmark
- Cuaderno de Colab: https://colab.research.google.com/github/erenextlabs/pusula/blob/main/examples/pusula_nano_colab.ipynb
