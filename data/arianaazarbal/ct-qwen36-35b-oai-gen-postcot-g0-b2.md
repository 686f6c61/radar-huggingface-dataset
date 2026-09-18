# arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g0-b2

## Resumen

ct-qwen36-35b-oai-gen-postcot-g0-b2 es un adaptador LoRA (rango 64, `target_modules=all-linear`) publicado por el usuario arianaazarbal sobre el modelo base Qwen/Qwen3.6-35B-A3B. No es un modelo completo, sino un ajuste fino de bajo rango pensado para investigación en alineación: forma parte del programa de entrenamiento iterado con constituciones autoredactadas (welfare-in-ai-rnd / constitutional_training), en el que cada generación se entrena desde cero sobre un corpus sintético que instancia una constitución concreta.

La generación 0 (g0), rama b2, se sembró con un resumen de 5.000 palabras del OpenAI Model Spec. La innovación metodológica clave es que el desplazamiento de valores entre generaciones se acumula únicamente a través de los documentos de entrenamiento, nunca a través de los pesos: la generación N≥1 se siembra con una constitución escrita por el modelo de la generación N-1 de la misma rama. El adaptador se entrenó el 15 de septiembre de 2026 y se exportó desde Tinker el 18 de septiembre de 2026.

El régimen de entrenamiento combina una fase de midtrain con una segunda fase de post-entrenamiento (SFT conversacional condicionado por constitución, conservando las trazas de razonamiento). El repositorio ocupa 4,5 GB e incluye la constitución semilla como `training_seed_constitution.md`, lo que permite auditar exactamente qué documento guio el ajuste. Se sirve y evalúa con el renderer `qwen3_5` y el modo de razonamiento activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.6-35B-A3B; la model card no detalla la arquitectura interna del base (el sufijo A3B sugiere un transformer MoE, dato no confirmado en la informacion disponible) |
| Parametros totales | No disponible para el adaptador (no se indica el numero de parametros entrenables); el modelo base se denomina 35B |
| Parametros activos | No confirmado; el nombre del modelo base (A3B) sugiere del orden de 3.000 millones de parametros activos |
| Longitud de contexto | Longitud maxima de entrenamiento: 8192 tokens; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Rango LoRA | 64 |
| Modulos objetivo | all-linear |
| Tamano del repositorio | 4,5 GB |
| Fecha de entrenamiento | 2026-09-15 |
| Fecha de exportacion | 2026-09-18 (desde Tinker) |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`all-linear`) del modelo base Qwen3.6-35B-A3B. La receta está bloqueada y documentada: learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch de 128, longitud máxima de 8192 tokens y semilla de entrenamiento 42. La fase 1 (midtrain) parte del modelo base; la fase 2 (post-train) continúa desde el adaptador de la fase 1 sobre datos de chat condicionados por constitución y generados con Opus, manteniendo las trazas de chain-of-thought. El nombre interno del run es `qwen36oaig0_qwen_oai_g0_b2_s2_cot`.

La particularidad del programa es el bucle iterativo de constituciones: la generación 0 se siembra con un texto humano (el resumen del OpenAI Model Spec), mientras que cada generación posterior se siembra con una constitución escrita por el modelo de la generación anterior de la misma rama. Esa constitución se selecciona como medoide de embedding con filtrado (gated embedding medoid) sobre un pool de 40 cadenas autoredactadas. Cada generación se reentrena desde el modelo base, de modo que la deriva de valores solo puede propagarse por los documentos sintéticos y no por los pesos. La rama b2 es una réplica independiente dentro de la misma generación, lo que permite estudiar varianza entre réplicas.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición detallada del corpus sintético, ni si se aplicaron fases adicionales de RLHF o DPO más allá del SFT conversacional descrito.

## Capacidades

- Generación de texto conversacional condicionada por una constitución explícita (el documento semilla incluido en el repositorio).
- Razonamiento con trazas de chain-of-thought conservadas durante el entrenamiento; se recomienda servir con el renderer `qwen3_5` y el modo de razonamiento activado.
- Comportamiento alineado con un conjunto de principios derivado del OpenAI Model Spec en esta generación.
- Capacidades heredadas del modelo base Qwen3.6-35B-A3B (generación de texto, código, matemáticas, multilingüismo y posible soporte de tool calling), si bien la model card del adaptador no las enumera ni las garantiza.
- No se documentan en la información disponible capacidades de visión, audio, tool calling nativo ni modos de pensamiento específicos más allá del razonamiento conservado en el SFT.

## Casos de uso

- Investigación en alineación iterativa: reproducir el bucle de constituciones autoredactadas entrenando la generación 1 a partir de la constitución incluida en este repositorio, y medir la deriva de valores entre generaciones sin contaminación de pesos.
- Auditoría de documentos de alineación: comparar `training_seed_constitution.md` con las respuestas del modelo para verificar qué principios de la constitución se han interiorizado realmente y cuáles no.
- Estudios de varianza entre réplicas: la rama b2 existe junto a otras réplicas independientes de la misma generación, lo que permite cuantificar cuánta variación introduce la semilla de entrenamiento con una receta fija.
- Evaluación de safety y red-teaming: usar el adaptador como sujeto de pruebas para comprobar si un condicionamiento constitucional concreto reduce o desplaza comportamientos indeseados respecto al modelo base.
- Experimentos controlados de post-entrenamiento: al ser un adaptador LoRA pequeño y aislado, se puede activar y desactivar sobre el mismo base para comparaciones A/B con coste de almacenamiento reducido.
- Generación de datos sintéticos condicionados: emplear el modelo para producir corpus de chat y trazas de razonamiento alineados con una constitución, que alimenten a su vez la siguiente generación del programa.
- Docencia y divulgación técnica: ilustrar de forma tangible cómo se implementa constitutional training sobre un modelo abierto de gran tamaño con recursos de ajuste modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica. Las búsquedas web realizadas no devolvieron documentación técnica asociada a este repositorio: los resultados obtenidos fueron páginas de soporte de Microsoft (inicio de sesión en Hotmail, cierre de sesión en Outlook, actualizaciones de seguridad de Exchange Server y tasa de refresco de monitor en Windows), sin ninguna relación con el modelo. No se debe asumir ningún nivel de rendimiento sin evaluación propia.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere cargar el modelo base Qwen/Qwen3.6-35B-A3B, que domina el coste de memoria y cómputo.
- VRAM estimada para el modelo base en bfloat16: del orden de 70 GB solo en pesos, más caché KV. Las estimaciones siguientes son cálculos estándar a partir del tamaño nominal del base, no datos publicados por el autor.
- VRAM estimada en cuantización de 4 bits: aproximadamente 18-22 GB, lo que lo situaría al alcance de una RTX 4090 (24 GB) o una RTX 3090 con contexto moderado.
- GPU recomendadas para bfloat16 sin cuantizar: A100 80 GB, H100 80 GB o configuraciones multi-GPU. En consumer, solo tarjetas de 24 GB o más con cuantización.
- Al ser presumiblemente un MoE con pocos parámetros activos, el throughput de decodificación debería ser superior al de un modelo denso de 35B, aunque no se han publicado cifras de latencia ni tokens por segundo.
- Opciones de despliegue: carga mediante `peft` + `transformers` (ejemplo oficial en la model card); el adaptador es compatible con el ecosistema PEFT, por lo que puede fusionarse con el base para servir con vLLM, TGI, llama.cpp u Ollama, aunque no se documenta ninguna de estas rutas en la información disponible.
- No se han publicado requisitos de hardware específicos, latencias medidas ni cifras de throughput para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-oai-gen-postcot-g0-b2 | Adaptador LoRA sobre Qwen3.6-35B-A3B | No disponible (base: 35B) | Entrenamiento a 8192 tokens | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | Modelo completo | 35B nominales (activos sin confirmar) | no disponible | no disponible | HuggingFace |
| Otros adaptadores LoRA de alineación constitucional | Adaptador LoRA | No disponible | No disponible | No disponible | no disponible |

No se dispone de información sobre adaptadores comparables de otros autores dentro del mismo programa ni sobre modelos de alineación equivalentes con los que establecer una comparación cuantitativa. La comparación más directa y útil es contra el propio modelo base sin el adaptador, que permite aislar el efecto del condicionamiento constitucional.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: sin el modelo base Qwen/Qwen3.6-35B-A3B no es utilizable, y hay que verificar por separado la licencia del base.
- La licencia del adaptador figura como "no disponible". No se puede asumir uso comercial sin contactar con el autor; trátese como uso exclusivamente de investigación hasta confirmación.
- No se especifican los idiomas soportados. El material semilla (OpenAI Model Spec) está en inglés, por lo que el comportamiento alineado puede estar sesgado hacia el inglés y degradarse en otros idiomas.
- Riesgo de alucinación inherente al modelo base, no mitigado por el ajuste LoRA; el condicionamiento constitucional regula el estilo y los valores declarados, no la veracidad factual.
- Los datos de post-entrenamiento son sintéticos y generados por otro modelo (Opus), lo que puede introducir sesgos, artefactos de estilo y errores sistemáticos heredados de ese generador.
- Ausencia total de evaluación publicada: no hay benchmarks, ni evaluación de safety, ni análisis de regresiones frente al base. Cualquier despliegue en producción exigiría una evaluación propia previa.
- Es la generación 0 de una cadena iterativa: su comportamiento es el punto de partida de una posible deriva en generaciones posteriores, no un objetivo final validado.
- El repositorio tiene 0 descargas y 0 likes, sin comunidad que haya verificado su funcionamiento; se recomienda reproducir la carga y validar el adaptador antes de confiar en él.
- El programa se sirve con el renderer `qwen3_5` y razonamiento activado; usar otra configuración de plantilla puede degradar el comportamiento de forma no documentada.
- No se documenta soporte explícito de tool calling, agentes ni multi-step reasoning; conviene tratar estas capacidades como no garantizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g0-b2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ruta original de Tinker (referencia interna, no URL navegable): `tinker://8ad97a1b-9c68-5ac2-b50e-a6484a8ea93b:train:0/sampler_weights/qwen36oaig0_qwen_oai_g0_b2_s2_cot_final`
- Programa de investigacion citado en la model card: welfare-in-ai-rnd / constitutional_training (sin URL publica en la informacion disponible)
- Constitucion semilla incluida en el repositorio: `training_seed_constitution.md`
- Registro de exportacion incluido en el repositorio: `tinker_meta.json`
- Paper, blog o demo asociados: no disponible
