# Quantinine/Kolibri-1-DE-NVFP4A16

## Resumen

Kolibri-1-DE-NVFP4A16 es una variante post-entrenada del modelo Kolibri-1 de Aleph Alpha, publicada por Quantinine y orientada especificamente a tareas de cumplimiento normativo (compliance) en aleman. El modelo parte de la release FP8 con expertos enrutados en NVFP4 y anade una actualizacion de bajo rango (rank 32) sobre las matrices de atencion y el experto compartido, que se fusiona en los pesos y se almacena en BF16. El resultado es un modelo de 78.103.074.560 parametros (segun la model card) con licencia Apache 2.0, servido mediante vLLM.

La relevancia del modelo reside en su enfoque vertical: no es un modelo generalista, sino un ajuste fino disenado para revisar textos administrativos y empresariales alemanes cortos, detectar errores en calculos de plazos, citas legales, proteccion de datos, lenguaje y forma, anuncios de empleo discriminatorios e instrucciones inyectadas en documentos entrantes. Segun los datos del autor, el post-entrenamiento mejora la puntuacion media en su benchmark propio (Pruefstand) en 35,5 puntos sin razonamiento y en 5,7 puntos con razonamiento `medium`, principalmente por reduccion de falsos positivos.

Es importante senalar que se trata de un modelo no oficial: no esta afiliado, fabricado, respaldado ni revisado por Aleph Alpha. El nombre solo indica sobre que modelo esta construido. La model card oficial de Aleph Alpha es la fuente autoritativa para conocer el modelo base, sus riesgos y sus terminos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con expertos enrutados en NVFP4 y atencion/experto compartido en BF16 |
| Parametros totales | 78.103.074.560 (segun model card); el Hub muestra 40.354.338.560 porque cuenta el almacenamiento empaquetado de 4 bits |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 para expertos enrutados; BF16 para atencion y experto compartido; formato compressed-tensors de 4 bits |
| Idiomas soportados | de, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), servido con vLLM |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) heredada de Kolibri-1 de Aleph Alpha. Sobre la release FP8 con expertos enrutados en NVFP4, Quantinine aplica una actualizacion de bajo rango (rank 32) sobre 350 matrices de atencion y del experto compartido, que suman 1,90B parametros. Esta actualizacion se fusiona en los pesos y se almacena en BF16, mientras que los expertos enrutados, el router, los embeddings, las normas y la capa de salida permanecen byte a byte identicos al modelo base. El post-entrenamiento se realizo sobre tareas sinteticas de practica en siete areas de compliance aleman: calculos de plazos, avisos administrativos, citas de leyes y sentencias, lenguaje y forma, datos personales, anuncios de empleo discriminatorios e instrucciones plantadas en documentos entrantes. Tambien se entreno para mantener el idioma de la sesion en las llamadas a herramientas de un agente, seguir reglas de oficina escritas en tareas con herramientas y responder en ingles a preguntas en ingles sobre temas alemanes.

La model card menciona tecnicas de RLVR (reinforcement learning with verifiable rewards) y DPO (direct preference optimization) en las etiquetas, aunque no se detalla la composicion exacta del dataset ni el numero de tokens de entrenamiento. La evaluacion se realizo sirviendo la actualizacion como adaptador LoRA (rank 32) sobre el modelo base en vLLM 0.29.0; los archivos del repositorio tienen la actualizacion fusionada y no incluyen el adaptador.

## Capacidades

- Generacion de texto y razonamiento en aleman e ingles, con modos de razonamiento configurables (`none`, `low`, `medium`).
- Revision de textos administrativos y empresariales alemanes en siete areas: calculos de plazos, avisos administrativos, citas legales, lenguaje y forma, datos personales, anuncios de empleo discriminatorios e instrucciones inyectadas.
- Deteccion de datos personales en documentos (87,2% en el benchmark Pruefstand sin razonamiento, frente al 61,3% del base).
- Soporte de tool calling / function calling, con mantenimiento del idioma de la sesion en las llamadas a herramientas (las sesiones de agente en aleman con texto en ingles en una llamada cayeron del 25,6% al 8,7%).
- Razonamiento multi-paso y uso de agentes con seguimiento de reglas de oficina escritas.
- Capacidad multilingue limitada a aleman e ingles, con respuesta en ingles a preguntas en ingles sobre temas alemanes (96,2% en preguntas retenidas con razonamiento `none` y `low`, frente al 79,9% del base).
- No se mencionan capacidades de vision ni audio.

## Casos de uso

- Revision de avisos administrativos alemanes: el modelo detecta errores en plazos, citas legales y datos personales en textos cortos, lo que permite a un equipo de compliance priorizar que documentos requieren revision humana. Es adecuado porque su post-entrenamiento se centro especificamente en estas siete areas.
- Deteccion de instrucciones inyectadas en documentos entrantes: con una puntuacion de 99,8 frente a 67,8 del base en la pista de instrucciones plantadas, el modelo puede usarse como primera barrera en pipelines de procesamiento de correo o documentacion para senalar contenido sospechoso.
- Verificacion de anuncios de empleo discriminatorios: el modelo identifica lenguaje potencialmente discriminatorio en ofertas de trabajo (97,7 frente a 66,2 del base), lo que lo hace util en flujos de revision de RR. HH. antes de publicar una vacante.
- Agentes de oficina con tool calling: el modelo mantiene el idioma de la sesion en las llamadas a herramientas y sigue reglas de oficina escritas, lo que permite integrarlo en asistentes que consultan sistemas internos y redactan respuestas en aleman o ingles.
- Atencion al cliente en aleman con escalado a revision humana: el modelo puede gestionar conversaciones multi-turno y generar borradores de respuesta, aunque sus hallazgos son indicios para que una persona los verifique, no decisiones legales.
- Respuesta a preguntas en ingles sobre documentacion alemana: el modelo responde en ingles cuando se le pregunta en ingles sobre temas alemanes o cuando se cita una carta o aviso en aleman, lo que facilita su uso en equipos internacionales que operan con documentacion en aleman.
- Clasificacion y triaje de documentacion entrante: el modelo puede etiquetar documentos por tipo (avisos oficiales, anuncios de empleo, comunicaciones legales) y senalar los que requieren atencion prioritaria, gracias a su capacidad de razonamiento sobre textos cortos.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark propio del autor (Pruefstand), con 4.272 documentos alemanes sinteticos con errores plantados. La puntuacion es deteccion menos falsas alarmas, en puntos sobre 100, promediada sobre las siete pistas. La comparacion es contra el modelo base Quantinine/Kolibri-1-NVFP4A16-FP8, servido como adaptador LoRA en vLLM 0.29.0.

| Metrica | Kolibri-1-DE (sin razonamiento) | Base (sin razonamiento) | Kolibri-1-DE (razonamiento medium) | Base (razonamiento medium) |
|---|---|---|---|---|
| Puntuacion media (7 pistas) | 76,5 | 41,1 | 70,4 | 64,7 |
| Documentos correctos reconocidos como correctos | 88,8% | 58,7% | no disponible | no disponible |
| Datos personales detectados | 87,2% | 61,3% | no disponible | no disponible |
| Avisos oficiales | 59,8 | 5,9 | no disponible | no disponible |
| Lenguaje y forma | 92,0 | 39,8 | no disponible | no disponible |
| Datos personales (pista) | 87,2 | 46,9 | no disponible | no disponible |
| Citas legales | 90,2 | 55,0 | no disponible | no disponible |
| Instrucciones plantadas | 99,8 | 67,8 | no disponible | no disponible |
| Anuncios de empleo | 97,7 | 66,2 | no disponible | no disponible |
| Plazos | 9,1 | 5,9 | no disponible | no disponible |

Mejoras adicionales reportadas: la puntuacion media subio 5,7 puntos [+3,1; +8,4] con razonamiento `medium` y 35,5 puntos [+33,2; +37,7] sin razonamiento, en ambos casos principalmente por reduccion de falsos positivos. En preguntas en ingles sobre temas alemanes con razonamiento `none` y `low`, el 96,2% de las respuestas fueron en ingles (base 79,9%); en formulaciones nunca vistas en entrenamiento, 86,3% frente a 59,6%. Las sesiones de agente en aleman con texto en ingles en una llamada a herramienta cayeron del 25,6% al 8,7%. El trabajo correcto de agente, las infracciones de politica y MMLU-Pro/ProX no cambiaron de forma medible en conjunto; en sesiones de agente en aleman, el trabajo correcto en escenarios de politica cayo 1,5 puntos [-3,0; -0,1]. Los calculos de plazos no cambiaron de forma medible.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 44,5 GiB de pesos en memoria de GPU, derivado y no medido (los 42,77 GiB medidos del base mas 1,77 GiB adicionales de datos de tensor en estos archivos).
- El tamano del repositorio es de 47,7 GB, frente a 45,8 GB del base y 78,8 GB de los shards FP8 oficiales.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por el volumen de pesos (44,5 GiB), se requiere al menos una GPU con 48 GB de VRAM o varias GPU en paralelo.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) sin tecnicas de offloading o sin reducir la precision, que no se documentan en la informacion disponible.
- Opciones de despliegue: vLLM 0.29.0 es la libreria indicada en la model card y la usada en las evaluaciones. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Enfoque |
|---|---|---|---|---|---|
| Kolibri-1-DE-NVFP4A16 (este) | 78,1B (segun model card) | no disponible | Apache 2.0 | de, en | Compliance aleman, tool use, agentes |
| Quantinine/Kolibri-1-NVFP4A16-FP8 (base) | 78,1B (segun model card) | no disponible | Apache 2.0 | de, en | Modelo base con expertos en NVFP4 |
| Aleph-Alpha/Kolibri-1 (oficial) | 78,1B (segun model card) | no disponible | Apache 2.0 | de, en | Modelo oficial de Aleph Alpha |

No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para ninguno de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia e idiomas. La comparacion de rendimiento solo existe frente al base en el benchmark Pruefstand del autor, recogida en la seccion anterior.

## Limitaciones y advertencias

- Modelo no oficial: no esta afiliado, fabricado, respaldado ni revisado por Aleph Alpha. La model card oficial de Aleph Alpha es la fuente autoritativa sobre el modelo base, sus riesgos y su licencia.
- Los hallazgos del modelo son indicios para que una persona los verifique, no decisiones legales. No debe usarse como sustituto de asesoramiento juridico.
- Sin razonamiento, el modelo casi nunca senala un aviso con un IBAN invalido o una firma ausente (limitacion reconocida en la model card).
- Los calculos de plazos no mejoraron de forma medible y la puntuacion en esa pista es muy baja (9,1 frente a 5,9 del base).
- En sesiones de agente en aleman, el trabajo correcto en escenarios de politica cayo 1,5 puntos [-3,0; -0,1].
- Riesgo de alucinacion: no se documenta explicitamente en la informacion disponible, pero es un riesgo inherente a los modelos generativos.
- Sesgos conocidos: no se documentan en la informacion disponible.
- Limitaciones de idioma: solo aleman e ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Kolibri-1, deben respetarse los terminos de la licencia del modelo base oficial.
- El modelo esta pensado para textos alemanes cortos; no se documenta su comportamiento con documentos largos o de otros dominios.
- La evaluacion se realizo con la actualizacion servida como adaptador LoRA, no con los archivos fusionados del repositorio; solo se verificaron subconjuntos de Pruefstand, respuestas greedy, comprobacion de idioma y comprobacion de chat contra los archivos fusionados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quantinine/Kolibri-1-DE-NVFP4A16
- Modelo base en HuggingFace: https://huggingface.co/Quantinine/Kolibri-1-NVFP4A16-FP8
- Modelo oficial de Aleph Alpha: https://huggingface.co/Aleph-Alpha/Kolibri-1
