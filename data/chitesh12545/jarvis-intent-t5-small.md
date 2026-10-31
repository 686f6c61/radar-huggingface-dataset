# chitesh12545/jarvis-intent-t5-small

## Resumen

Jarvis Intent Router (chitesh12545/jarvis-intent-t5-small) es un modelo de clasificación de intenciones basado en t5-small, afinado para convertir comandos de voz en texto en una lista JSON estructurada de intents con sus argumentos. Forma parte del asistente Jarvis, donde actúa como router local y rápido: la aplicación solo ejecuta planes que superan la validación de esquema, la normalización de argumentos y un módulo de seguridad (SafetyGuard).

El modelo no ejecuta comandos, no llama a APIs ni responde preguntas; su única función es generar JSON canónico conforme a la versión 3 del esquema de intents. Con 60,5 millones de parámetros, cuantización int8 y exportación a ONNX Runtime, está diseñado para inferencia local de baja latencia, con un p50 de 111,8 ms y un p95 de 222,9 ms en su split de evaluación principal.

Es relevante como ejemplo de un patrón cada vez más común en asistentes locales: un modelo ligero y especializado que traduce lenguaje natural a un formato estructurado verificable, en lugar de un LLM grande que intenta hacer todo. Publicado bajo licencia Apache 2.0, incluye tanto los pesos de inferencia cuantizados como el checkpoint entrenable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (t5-small) |
| Parametros totales | 60.493.312 (60,5 M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | 128 tokens de entrada / 448 tokens de salida |
| Tipos de cuantizacion | int8 dinámica (encoder y decoder fusionado, ONNX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (202,5 MB) y safetensors (checkpoint entrenable); tamaño total del repo 0,4 GB |

## Arquitectura y entrenamiento

El modelo parte de google-t5/t5-small, un transformer encoder-decoder de 60,5 millones de parámetros, y continúa desde un checkpoint previo del propio sistema Jarvis (misma arquitectura y vocabulario, sin crecimiento entre rondas). Para el despliegue se aplica cuantización dinámica int8 sobre el encoder y el decoder fusionado, generando un par de artefactos ONNX junto con el tokenizador y los ficheros de configuración. La entrada debe ir precedida del prefijo `parse: `, y la salida es una lista JSON canónica con los intents y sus argumentos en orden de esquema.

El entrenamiento se realizó sobre un corpus manual, deduplicado, de pares comando/intent que cubren las capacidades de la aplicación: 3.902 ejemplos de entrenamiento y 470 de desarrollo, distribuidos en 69 shards, durante 1 época con batch efectivo de 32 (batch 4 con acumulación de gradientes 8), learning rate de 0,0001 y semilla 13. Las etiquetas conflictivas se excluyeron y los objetivos se canonicalizaron según el orden del esquema. No se ha completado ninguna ronda de RL independiente (rl_runs_completed: 0); el run actual incorpora 19 pares de ejecución verificados ("harvested") con factor de repetición 3 como señal supervisada ponderada por recompensa, lo que el propio autor aclara que no constituye RLHF completo.

## Capacidades

- Clasificación de intenciones multi-intent: convierte un comando en lenguaje natural en una lista JSON de intents con argumentos (por ejemplo, abrir una URL en un navegador concreto y reproducir una playlist simultáneamente).
- Generación de salida estructurada y canónica conforme al intent schema v3, apta para validación automática por esquema (`intent_schema.json`).
- Enrutado de comandos de voz (tras transcripción por ASR externo) hacia acciones de la aplicación.
- Entrada con prefijo fijo `parse: ` para delimitar la tarea.
- Sin capacidades de generación de texto libre, razonamiento general, código, matemáticas, visión ni audio: el modelo está estrictamente especializado en el router de intents.
- No soporta tool calling genérico ni function calling estándar (OpenAI/Anthropic); su equivalente funcional es el esquema de intents propio de Jarvis.
- Idioma de trabajo: inglés. No hay soporte declarado para castellano ni otros idiomas.

## Casos de uso

- Router de comandos en asistentes de voz locales: transcribe el comando (con un ASR externo) y lo convierte en un plan JSON ejecutable con latencias de ~112 ms en p50, adecuado para interacción conversacional sin depender de la nube.
- Automatización del navegador y aplicaciones: comandos como "open chatgpt in brave" se traducen a `url.open_in` con argumentos normalizados (`url`, `browser`), listo para que el runtime ejecute la acción.
- Control de reproducción multimedia: frases como "play lofi on spotify" se mapean a `media.play_playlist` con el nombre de la lista, integrable en clientes de música locales.
- Pipelines de ejecución segura de agentes: al generar solo JSON esquema-validable, se integra bien tras un validador y un módulo de seguridad (patrón SafetyGuard), reduciendo el riesgo de acciones no deseadas.
- Extensión de asistentes con dominios propios: al ser un t5-small afinable con Apache 2.0 y publicar el checkpoint entrenable, puede reentrenarse con un corpus de pares comando/intent específico de otra aplicación.
- Evaluación y monitorización de routers de intents: las métricas de exact match y parse valid por split permiten medir regresiones entre versiones del modelo dentro de un pipeline de CI.

## Benchmarks y rendimiento

Resultados históricos registrados en los splits de evaluación del run (no son un benchmark independiente de la release publicada):

| Split | Ejemplos | Exact match | Parse valid | p50 | p95 |
|---|---:|---:|---:|---:|---:|
| `native_search` | 16 | 100,00 % | 100,00 % | 62,2 ms | 73,5 ms |
| `valid` | 45 | 91,11 % | 97,78 % | 85,0 ms | 168,2 ms |
| `test` | 45 | 93,33 % | 100,00 % | 111,8 ms | 222,9 ms |
| `novel` | 45 | 93,33 % | 100,00 % | 85,0 ms | 218,1 ms |

Comparación con el checkpoint anterior:

| Metric | Anterior | Esta release | Delta |
|---|---:|---:|---:|
| Exact match | 91,11 % | 93,33 % | +2,22 pp |
| p50 | 119,4 ms | 111,8 ms | -7,6 ms |
| p95 | 228,2 ms | 222,9 ms | -5,3 ms |

Advertencias del propio autor: `exact_match` mide coincidencia exacta con el JSON gold; `parse_valid` solo cuenta listas JSON no vacías, no validación completa de esquema; la latencia cubre solo la invocación del modelo (no ASR ni ejecución); el hardware original no fue registrado, por lo que los tiempos no son transferibles a otros dispositivos; y la sanitización del dataset público puede hacer que estos scores no correspondan al corpus publicado. No hay comparación con modelos de terceros (MMLU, HumanEval, etc.), lo cual es esperable dada la naturaleza especializada del modelo.

## Requisitos de hardware

- VRAM estimada: el artefacto ONNX int8 ocupa 202,5 MB, por lo que en inferencia necesita del orden de unos cientos de MB de RAM/VRAM; no se publica una cifra exacta de VRAM.
- Adecuado para CPU: al ser ONNX Runtime con cuantización int8 y 60,5 M de parámetros, no requiere GPU; es un modelo pensado para ejecución local en CPU.
- Consumer GPUs: cualquier GPU moderna (incluso integrada o una GTX 1650) es más que suficiente; no hay necesidad de A100, H100 ni RTX 4090.
- Despliegue: ONNX Runtime es la vía principal (el artefacto servido es el par ONNX cuantizado + tokenizador). No hay evidencia de soporte directo en vLLM, TGI, llama.cpp u Ollama; el checkpoint safetensors en formato T5 podría cargarse con Hugging Face Transformers, pero el artefacto primario es ONNX.
- Latencia medida: p50 de 111,8 ms y p95 de 222,9 ms en el split `test` (hardware no documentado); en `native_search`, p50 de 62,2 ms.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| jarvis-intent-t5-small | 60,5 M | Intent → JSON multi-intent (dominio Jarvis) | ONNX int8 + safetensors | Apache 2.0 | 128 in / 448 out |
| google-t5/t5-small (base) | 60,5 M | Tarea general text-to-text | safetensors | Apache 2.0 | 512 |
| google/flan-t5-small | 80 M (aprox.) | Instrucciones generales, clasificación zero-shot | safetensors | Apache 2.0 | 512 |

Comparación orientativa: frente al t5-small base, este modelo está especializado en un esquema de intents concreto y ofrece exact match del 93,33 % en su dominio, algo que el modelo base no garantiza sin fine-tuning. Frente a flan-t5-small, el modelo de Jarvis es más estrecho pero potencialmente más preciso y rápido en su tarea específica; flan-t5 cubre instrucciones generales y más idiomas. No hay routers de intents comerciales públicos comparables con métricas publicadas en la información disponible.

## Limitaciones y advertencias

- Idioma: entrenado y evaluado únicamente en inglés; no hay soporte declarado para castellano ni multilingüismo.
- Dominio cerrado: solo reconoce los intents del esquema v3 de Jarvis; comandos fuera del corpus de entrenamiento probablemente produzcan intents incorrectos o vacíos (aunque parse valid sea alto, eso no garantiza validez de esquema).
- Métricas con matices: `parse_valid` no equivale a validación completa de esquema; los benchmarks son históricos del run de entrenamiento, no una evaluación fresca de la release, y el hardware de medición no está documentado.
- Corpus pequeño: 3.902 ejemplos de entrenamiento y splits de evaluación de solo 45 ejemplos, lo que implica intervalos de confianza amplios en las métricas.
- RL incompleto: no se ha completado ninguna ronda de RL independiente; la señal de recompensa se limita a 19 pares verificados. El propio autor advierte que no debe interpretarse como RLHF.
- Sesgos: al tratarse de un corpus manual y pequeño, heredará los sesgos de cobertura del autor (frases, nombres de aplicaciones y navegadores concretos del ecosistema Jarvis).
- Alucinación: en el sentido clásico no aplica (no genera texto libre), pero puede generar intents o argumentos plausibles pero incorrectos; por eso el pipeline exige validación de esquema y SafetyGuard antes de ejecutar.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución; sin restricciones conocidas más allá de conservar el aviso de licencia.
- Pipeline tag "other": no encaja en los pipelines estándar de Hugging Face, por lo que su integración requiere código propio sobre ONNX Runtime o Transformers.

## Enlaces

- Modelo: https://huggingface.co/chitesh12545/jarvis-intent-t5-small
- Dataset de entrenamiento: https://huggingface.co/datasets/chitesh12545/jarvis-intent-dataset/tree/v1.0.1
- Modelo base: https://huggingface.co/google-t5/t5-small
- Paper, blog o demo: no disponible
