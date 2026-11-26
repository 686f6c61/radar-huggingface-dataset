# gogamza/kotag-0.8b

## Resumen

kotag-0.8b es un modelo de etiquetado de secuencias (token classification) para coreano, desarrollado por gogamza y publicado en Hugging Face bajo licencia Apache 2.0. Se obtiene mediante un ajuste fino de todos los parámetros de Qwen/Qwen3.5-0.8B, un modelo base de aproximadamente 853 millones de parámetros, y sustituye la generación de texto por una cabeza de lectura compartida de 255 opciones que etiqueta cada carácter o palabra (`tag`) y puntúa candidatos de texto completo (`choose`) en una sola pasada hacia delante.

El modelo resuelve tareas clásicas de procesamiento del lenguaje natural coreano que tradicionalmente requerían pipelines separados: corrección de espaciado entre palabras (word spacing), reparación de espaciado ruidoso, corrección ortográfica, enmascaramiento de información personal identificable (PII) y más de 15 tareas guiadas por instrucciones. Es la base del backend KoSpacing v2 de la librería PyKoSpacing, lo que le da relevancia práctica inmediata para cualquiera que procese texto coreano en producción.

La propuesta técnica es notable: en lugar de generar texto token a token, el modelo produce etiquetas por unidad en un único forward pass, lo que se traduce en latencias muy bajas (18 ms por frase en una NVIDIA GB10) y cero tokens generados. Frente al modelo base generativo, que tarda 586 ms y obtiene un F1 de 0.326 en la misma tarea, kotag-0.8b es aproximadamente 33 veces más rápido y mucho más preciso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con cabeza de lectura lineal de 255 opciones para etiquetado por unidad |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de uso emplea bfloat16 en GPU y float32 en CPU) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `readout.safetensors` y `decision_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de unos 853 millones de parámetros, y se somete a un ajuste fino de todos los parámetros. La innovación principal es la sustitución del cabezal de generación por una cabeza lineal compartida (`readout`) que proyecta el estado oculto a 255 opciones discretas. Cada opción se corresponde con una etiqueta definida por la instrucción y los criterios aportados en el prompt, de modo que el mismo modelo sirve para espaciado, NER, PII o corrección ortográfica simplemente cambiando la definición de las opciones. El modelo etiqueta cada carácter (unidad `char`) o cada palabra (unidad `word`) en una única pasada, sin decodificación autoregresiva.

El entrenamiento se apoya en instrucciones en formato de chat (system + user) y en un fichero `decision_config.json` que define los códigos de opción (`A`, `B`, ...), la temperatura de calibración de probabilidades y la unidad de etiquetado. La model card menciona el uso de `flash-linear-attention` para kernels rápidos en GPU NVIDIA y describe una integración con PyKoSpacing v2 (`Spacing`, `fix()`, `spell()`). No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO; la model card sí cita evaluaciones sobre Wikipedia, un conjunto sintético de 1.000 frases, un conjunto curado de 45 frases, 380 erratas reales no vistas y diálogos KDPII con 7 tipos de PII.

## Capacidades

- Etiquetado de secuencias por carácter o por palabra en una sola pasada, sin generación de texto.
- Corrección de espaciado entre palabras (word spacing) sobre texto sin espacios.
- Reparación de espaciado ruidoso (`fix()`), conservando los espacios ya válidos.
- Corrección ortográfica general y en dominio formal, con modo seguro para preservar texto limpio.
- Enmascaramiento de PII en coreano sobre 7 tipos de entidades (diálogos KDPII).
- Reconocimiento de entidades nombradas (NER) configurable por instrucciones (persona, lugar, fecha, etc.).
- Más de 15 tareas NLP guiadas por instrucciones mediante definición dinámica de opciones y criterios.
- Puntuación de candidatos de texto completo (`choose`) además del etiquetado (`tag`).
- Soporte de preguntas zero-shot personalizadas y mapas de calor de sentimiento en la demo web.
- Integración directa con PyKoSpacing v2 (`Spacing`, `fix()`, `spell()`).
- No soporta tool calling ni razonamiento multi-paso generativo: su diseño es de etiquetado, no de agente.

## Casos de uso

- Normalización de espaciado en pipelines de TTS y STT: el modelo inserta espacios correctos en transcripciones coreanas sin espaciado (F1 de palabra 0.849 en Wikipedia) antes de sintetizar voz o indexar texto.
- Limpieza de corpus coreano para entrenamiento: `fix()` repara espaciados ruidosos con F1 de palabra 0.917 y precisión de edición 0.949, adecuado para preprocesar grandes volúmenes antes de entrenar otros modelos.
- Corrección ortográfica en editores y correctores: `spell()` corrige erratas con F1 de edición 0.955 en conjunto curado y 0.907 en erratas reales no vistas, manteniendo el 98,5% del texto limpio intacto (99,2% en modo seguro).
- Enmascaramiento de PII en atención al cliente: sobre diálogos KDPII logra un 94,8% de filas completas y 99,0% de recall por carácter, lo que permite anonimizar conversaciones antes de almacenarlas o analizarlas.
- Extracción de entidades para sistemas de agenda o CRM: mediante instrucciones se obtienen nombres, lugares y fechas (Span F1 0.857 en nombres KLUE-NER), integrándose en pipelines de extracción de datos estructurados.
- Procesamiento por lotes de bajo coste: al no generar tokens y ejecutarse en 18 ms por frase en una NVIDIA GB10, es viable etiquetar millones de frases en servidores modestos o incluso en CPU con bfloat16/float32.
- Investigación lingüística coreana: permite etiquetar corpus con criterios personalizados definidos en el prompt, sin reentrenar, para estudios de segmentación y morfología.

## Benchmarks y rendimiento

| Capacidad | Benchmark | Puntuacion v1.6 | Comparacion / notas |
|---|---|---|---|
| Espaciado de palabras | Wikipedia (espacios eliminados) | Word F1 0.849 | KoSpacing v1: 0.824 |
| Reparacion de espaciado (`fix()`) | Wikipedia (espaciado ruidoso) | Word F1 0.917 | Precision de edicion 0.949; KoSpacing v1: 0.820 |
| Ortografia (general) | Test sintetico (1.000 frases) | Edit F1 0.722 | Precision 0.843; texto limpio conservado 98.5% (modo seguro 99.2%) |
| Ortografia (real y curada) | Curado (45) / erratas reales no vistas (380) | Edit F1 0.955 / 0.907 | Ediciones en dominio formal -37.0% frente a v1.5, sin reglas heuristicas |
| Enmascaramiento de PII | Dialogos KDPII (7 tipos) | Full-row 94.8% | Recall por caracter 99.0%; nombres KLUE-NER Span F1 0.857 |
| Velocidad en GPU | Frase unica (NVIDIA GB10) | 18 ms (0 tokens) | 33x mas rapido que el generativo Qwen/Qwen3.5-0.8B (586 ms, F1 0.326) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 853 millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 1,7 GB, y en float32 unos 3,4 GB, a lo que hay que sumar la cabeza de lectura y el estado de activaciones.
- GPU recomendadas: NVIDIA GB10 (usada en los benchmarks), y por tamaño cualquier GPU NVIDIA moderna con al menos 4-8 GB de VRAM; se menciona soporte de kernels `flash-linear-attention` para GPU NVIDIA.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0,85B) es viable en tarjetas consumer con suficiente VRAM; la model card no enumera modelos concretos.
- Opciones de despliegue: script propio `kotag.py` y `spell.py` sobre `transformers>=5.17`, `safetensors` y `huggingface_hub`; integración con PyKoSpacing v2; demos web con la librería estándar (`examples/demo.py`, `demo_spell.py`, `demo_writer.py`) con opción `--device cpu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 18 ms por frase en NVIDIA GB10 (0 tokens generados); en CPU se indica bfloat16 en el ejemplo de `KoTagger.from_pretrained`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kotag-0.8b | 852.985.920 | no disponible | Etiquetado por unidad, 1 forward pass | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base generativo) | ~0,8B | no disponible | Generacion autoregresiva | no disponible en la informacion | Hugging Face |
| KoSpacing v1 | no disponible | no disponible | Espaciado coreano | no disponible en la informacion | Referenciado en la model card |

La comparación directa con el modelo base generativo en la tarea de espaciado muestra una diferencia sustancial: kotag-0.8b obtiene F1 0.849 con 18 ms, frente a F1 0.326 y 586 ms del Qwen3.5-0.8B generativo. Frente a KoSpacing v1, mejora el espaciado (0.849 frente a 0.824) y la reparación de espaciado (0.917 frente a 0.820). No se dispone de datos de otros modelos de etiquetado coreano comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en coreano; no se ha validado para otros idiomas.
- No es un modelo generativo: no produce texto libre, razonamiento multi-paso ni tool calling; su salida son etiquetas por unidad.
- La corrección ortográfica puede introducir ediciones no deseadas en dominios formales, aunque la model card reporta una reducción del 37,0% de ediciones en dominio formal frente a v1.5 y un 98,5% de texto limpio conservado (99,2% en modo seguro).
- Riesgo de alucinación inherente al etiquetado: las etiquetas se asignan por criterios definidos en el prompt, por lo que instrucciones ambiguas o mal especificadas degradan la calidad.
- El enmascaramiento de PII alcanza un 94,8% de filas completas, por lo que queda un margen de error que exige revisión en entornos con requisitos estrictos de privacidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado; la información disponible no detalla su licencia.
- Requiere `transformers>=5.17` y, para kernels rápidos en GPU, `flash-linear-attention`, lo que puede limitar despliegues en entornos con versiones antiguas.
- No se han publicado datos sobre longitud de contexto, sesgos específicos ni composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gogamza/kotag-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- PyKoSpacing (repositorio): https://github.com/haven-jeon/PyKoSpacing
- README en coreano: https://huggingface.co/gogamza/kotag-0.8b/blob/main/README_ko.md
- Demo web (GIF): https://huggingface.co/gogamza/kotag-0.8b/blob/main/assets/demo.gif
