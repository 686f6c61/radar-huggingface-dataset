# smdesai/GLiDE-0.4B-CoreAI

## Resumen

GLiDE-0.4B-CoreAI es una conversión al runtime CoreAI de Apple del modelo base fastino/GLiDE-0.4B, publicada por el usuario smdesai. No se trata de un modelo generativo de texto: es un modelo de decisión que devuelve probabilidades para preguntas de elección múltiple, de tipo sí/no (etiquetadas como `noul`) y de puntuación. Está pensado para ejecutarse íntegramente en el dispositivo, sin llamadas a servidores externos.

La conversión fija el checkpoint upstream en la revisión `6bda7ab91aeb36dcad6d27828a8871e548c7fc71` y empaqueta los grafos compilados para la GPU h19p de iOS, junto con los grafos portables de origen, el tokenizador, el wrapper de prompt y los manifiestos con sumas de verificación. El resultado es un paquete de aproximadamente 6,62 GB en el repositorio, con una descarga en tiempo de ejecución de 5.034.723.779 bytes (4,69 GiB) que la aplicación descarga en el primer arranque y cachea para uso offline.

Su relevancia radica en que ejemplifica el patrón de despliegue de modelos de decisión ligeros (0,4B parámetros) en el ecosistema Apple Core AI para iOS 27, con cuantización mixta y atención troceada para contextos largos. La licencia es la fastino-community, con la licencia del modelo base Ettin conservada en el paquete.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de decisión, no generativo); grafos compilados para GPU h19p de iOS |
| Parámetros totales | 0,4B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 7999 tokens, incluyendo tokens especiales |
| Tipos de cuantización | Precisión mixta: FP16 en embeddings y proyecciones del encoder, FP32 en normalización, RoPE, atención, GELU, residuales y readout |
| Idiomas soportados | no disponible |
| Licencia | fastino-community (licencia del modelo base Ettin conservada en `licenses/`) |
| Formato de pesos | Grafos CoreAI compilados (`.aimodelc`) para h19p y grafos portables (`.aimodel`); tokenizador en `assets/tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer de 0,4B parámetros orientado a decisión, no a generación de texto. La conversión a CoreAI mantiene la arquitectura del checkpoint original y aplica una política de precisión mixta: embeddings y proyecciones del encoder en FP16, mientras que la normalización, RoPE, atención, activación GELU, conexiones residuales y la cabeza de lectura se mantienen en FP32. El grafo corto usa buckets estáticos de 128 a 4096 tokens; el grafo largo emplea atención troceada en bloques de 256 queries para cubrir hasta 7999 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La conversión incluye modificaciones documentadas: compilación para CoreAI, precisión mixta, funciones cortas estáticas, atención larga troceada, eliminación de ubicaciones de depuración y compilación para GPU h19p de iOS. El paquete conserva los avisos upstream en `NOTICE` y la licencia del modelo base Ettin.

## Capacidades

- Modelo de decisión: devuelve probabilidades para preguntas de elección, sí/no (`noul`) y puntuación.
- No genera texto libre; la salida es una distribución de probabilidad sobre opciones.
- Ejecución íntegra en dispositivo (on-device inference) en iOS mediante CoreAI.
- Soporte de contexto largo de hasta 7999 tokens mediante el grafo largo con atención troceada.
- Tokenizador nativo GlideKit y renderizador de prompt incluidos para preservar la semántica del publicador.
- Descarga en tiempo de ejecución con reanudación tras interrupción, verificación de sumas y colocación atómica de ficheros.
- Funcionamiento offline tras la primera descarga, usando la caché local.
- No disponible: soporte de tool calling, agentes, visión, audio o modo thinking.

## Casos de uso

- Clasificación de decisiones en aplicaciones iOS: el modelo evalúa opciones discretas y devuelve probabilidades, adecuado para asistentes que deben elegir entre alternativas predefinidas sin generar texto.
- Preguntas de sí/no en flujos de formularios: integrado en la app mediante la API de decisión de GlideKit, permite resolver preguntas binarias con contexto de hasta 7999 tokens.
- Puntuación de candidatos o respuestas: el modo de puntuación permite ordenar opciones en tareas de ranking dentro de la aplicación.
- Procesamiento offline en dispositivos Apple: al ejecutarse íntegramente en el dispositivo y cachear los grafos, es apto para escenarios sin conectividad o con requisitos de privacidad estrictos.
- Enrutamiento de decisiones en asistentes locales: puede actuar como componente de selección entre intenciones o acciones definidas por el desarrollador, sin depender de un servidor.
- Evaluación de contexto largo en iOS: el grafo largo de 7999 tokens permite resolver decisiones sobre documentos o conversaciones extensas dentro de la app.
- Prototipado de modelos de decisión en el ecosistema Core AI: sirve como referencia para convertir y desplegar modelos de decisión en iOS 27 con GPU h19p.

## Benchmarks y rendimiento

La model card reporta únicamente comprobaciones de regresión, no estimaciones de precisión poblacional:

| Prueba | Resultado |
|---|---|
| Decisiones de referencia superadas (exportaciones mixtas originales) | 73, en macOS y iPhone Duo |
| Coincidencia de las ocho respuestas de demo con el publicador FP32 fijado | Diferencia máxima de probabilidad de 0,000194550 |
| Comprobaciones de preparación del paquete | Recuentos de operaciones iguales antes y después del stripping y en recarga; resúmenes de inspección CoreAI iguales; hashes; identidad del código compilado; escaneo binario de rutas personales |
| Paridad en dispositivo físico de los assets finales tras stripping | No realizada (según la model card) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Requiere CoreAI en iOS 27 y un dispositivo h19p para los assets compilados incluidos.
- Requiere el entitlement de límite de memoria incrementado.
- Otras arquitecturas necesitan su propia compilación a partir de los grafos portables (`aimodel/*.aimodel/`).
- Descarga en tiempo de ejecución: 5.034.723.779 bytes (4,69 GiB); árbol completo del repositorio: aproximadamente 6,62 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; el paquete de pesos ocupa 4,69 GiB en disco y debe residir en memoria del dispositivo durante la inferencia.
- GPU recomendadas: GPU h19p de iOS (requisito para los assets compilados); no se documentan GPU de escritorio o servidor.
- Cabe en GPU consumer: no disponible; el destino es hardware móvil Apple, no GPU de escritorio.
- Opciones de despliegue: runtime CoreAI con los grafos `.aimodelc` y el tokenizador/prompt renderer de GlideKit; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-0.4B-CoreAI (este) | 0,4B | 7999 tokens | Modelo de decisión, CoreAI iOS | fastino-community | Hugging Face, repo de 6,62 GB |
| fastino/GLiDE-0.4B | 0,4B | no disponible | Modelo de decisión (base) | no disponible en la información | Hugging Face |
| Modelos del coreai-model-zoo | no disponible | no disponible | LLM, VLM, OCR, ASR, TTS, generación | no disponible | Hugging Face, ejecutables con CoreAIKit |

La información disponible no permite comparar rendimiento numérico con alternativas de la misma categoría. El coreai-model-zoo se cita como ecosistema de modelos convertidos para Apple Core AI, pero no se aportan datos de modelos de decisión comparables.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre opciones, sí/no o puntuaciones.
- Los assets compilados están atados a iOS 27 y a hardware h19p; otras arquitecturas requieren recompilación desde los grafos portables.
- Requiere el entitlement de límite de memoria incrementado en el dispositivo.
- La validación reportada son comprobaciones de regresión (73 decisiones y ocho respuestas de demo), no una estimación de precisión poblacional.
- Los assets finales tras el stripping no han pasado una nueva prueba de paridad en dispositivo físico, según la model card.
- La licencia fastino-community es de tipo "other"; debe revisarse el fichero `LICENSE` para condiciones de uso comercial. La licencia del modelo base Ettin se conserva en `licenses/`.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Riesgo de sesgos y alucinación: no documentado en la información disponible; al tratarse de un modelo de decisión, el riesgo se manifiesta como calibración incorrecta de probabilidades más que como texto inventado.
- La descarga inicial de 4,69 GiB puede ser problemática en redes limitadas; el runtime mitiga interrupciones con reanudación y verificación de sumas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smdesai/GLiDE-0.4B-CoreAI
- Modelo base: https://huggingface.co/fastino/GLiDE-0.4B
- coreai-catalog en PyPI: https://pypi.org/project/coreai-catalog/
- coreai-model-zoo en GitHub: https://github.com/john-rocky/coreai-model-zoo
