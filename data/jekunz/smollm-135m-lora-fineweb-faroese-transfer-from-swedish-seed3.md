# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed3

## Resumen

Este repositorio contiene un adaptador LoRA sobre el modelo SmolLM2-135M-Instruct, desarrollado por el usuario jekunz, que ha sido ajustado de forma secuencial primero sobre la porcion sueca y despues sobre la porcion feroesa del corpus FineWeb-2. El objetivo es transferir conocimiento linguistico de un idioma germanico con recursos moderados (sueco) a otro de recursos muy limitados (feroes), aprovechando la proximidad tipologica entre ambos. El resultado es un adaptador de bajo rango que habilita generacion de texto conversacional en feroes sobre una base de tan solo 135 millones de parametros.

El modelo se enmarca en la familia SmolLM2 de Hugging Face, una linea de modelos compactos pensada para ejecucion en hardware modesto. La relevancia de esta ficha radica en su caracter experimental: demuestra una estrategia de transferencia cross-lingue mediante fine-tuning secuencial con LoRA sobre un modelo instruct pequeno, un enfoque reproducible y de bajo coste (una unica A100 de 40 GB) para lenguas de bajos recursos.

Se trata de la semilla 3 de tres ejecuciones con la misma configuracion, lo que sugiere un interes por medir la varianza del entrenamiento. El autor indica explicitamente que el modelo esta destinado a su investigacion y que no ha sido evaluado de forma amplia, por lo que debe tratarse como un artefacto de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptadores LoRA (PEFT) |
| Parametros totales | 135 millones (modelo base); el adaptador LoRA anade un subconjunto no cuantificado en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | feroes (fo); entrenado con transferencia desde sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. Sobre el se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas. El entrenamiento es secuencial en dos fases: una primera epoca sobre la porcion sueca de FineWeb-2 y cinco epocas sobre la porcion feroesa del mismo corpus, lo que constituye la innovacion metodologica principal: usar un idioma germanico con mas datos como puente antes de especializar en feroes.

La configuracion de entrenamiento incluye tasa de aprendizaje 8e-4, scheduler coseno, warmup ratio 0.05, tamano de batch 8 con acumulacion de gradientes de 32 pasos (batch efectivo de 256), longitud maxima de contexto de 2048 tokens y una unica GPU A100 de 40 GB. La semilla empleada es la 3, correspondiente a una de tres ejecuciones con identica configuracion. No se documentan en la informacion disponible detalles sobre volumen total de tokens procesados, composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en feroes, heredada de la naturaleza instruct del modelo base SmolLM2-135M-Instruct.
- Transferencia cross-lingue desde sueco: el adaptador intermedio sueco actua como puente linguistico antes de la especializacion en feroes.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 135 millones de parametros del modelo base.
- Capacidad multilingue residual del modelo base, aunque el ajuste se centra exclusivamente en feroes.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modos de razonamiento extendido (thinking mode) en la informacion disponible.
- No se documenta una evaluacion formal de capacidades en feroes.

## Casos de uso

- Investigacion en transferencia cross-lingue: el adaptador sirve como punto de partida reproducible para estudiar como el preajuste en un idioma germanico con mas recursos (sueco) afecta al rendimiento en una lengua de bajos recursos (feroes), comparando las tres semillas publicadas.
- Generacion de texto experimental en feroes: prototipos de continuacion de texto o respuestas conversacionales basicas en feroes para validar la viabilidad de modelos de 135M en esa lengua, siempre con revision humana dada la ausencia de evaluacion.
- Aumento de datos sinteticos para feroes: generacion de borradores de frases o parrafos que puedan servir como semilla para anotacion o filtrado posterior en la construccion de corpus.
- Docencia y experimentacion con PEFT: ejemplo compacto y de bajo coste (una A100 de 40 GB, adaptador de 0.2 GB) para ensenar o practicar fine-tuning con LoRA y entrenamiento secuencial multi-idioma.
- Despliegue en entornos con recursos minimos: al tratarse de un adaptador sobre un modelo de 135M, puede ejecutarse en CPU o GPUs de consumo para demos de inferencia en feroes, con expectativas de calidad limitadas.
- Estudio de varianza de entrenamiento: al ser la semilla 3 de tres configuraciones identicas, permite analizar la sensibilidad del ajuste a la inicializacion y al orden de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M en precision completa (fp32) ocupa aproximadamente 0.5 GB de pesos; en fp16/bf16 alrededor de 0.27 GB; a 8 bits aproximadamente 0.14 GB. El adaptador LoRA anade una cantidad marginal (repo de 0.2 GB). La VRAM total necesaria es inferior a 2 GB en la mayoria de configuraciones, incluyendo cache KV para contextos de 2048 tokens.
- GPU recomendadas: cualquier GPU moderna es suficiente; se ha entrenado en una A100 de 40 GB, pero la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas con suficiente memoria compartida).
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base `jekunz/smollm-135m-lora-fineweb-swedish` (o el SmolLM2-135M-Instruct original, segun la cadena de dependencias) junto con el adaptador mediante la libreria `peft` y `transformers`. Para despliegue en produccion ligera pueden considerarse vLLM o TGI, aunque no se documenta compatibilidad explicita; llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF, paso no documentado en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed3 | 135M (base) + LoRA | 2048 | feroes | Apache 2.0 | Hugging Face (adaptador PEFT) |
| SmolLM2-135M-Instruct | 135M | no disponible en la informacion proporcionada | multilingue (principalmente ingles) | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-lora-fineweb-swedish | 135M (base) + LoRA | 2048 (segun configuracion del autor) | sueco | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Modelos especializados en feroes de mayor tamano | no disponible | no disponible | feroes | no disponible | no disponible |

La comparativa directa con alternativas especializadas en feroes no esta disponible en la informacion proporcionada. Frente al modelo base SmolLM2-135M-Instruct, la diferencia principal es la especializacion linguistica en feroes mediante transferencia desde sueco; frente al adaptador sueco intermedio, este modelo anade cinco epocas adicionales sobre datos feroeses.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo esta destinado a su investigacion y que no ha sido evaluado de forma amplia; no hay benchmarks publicados que respalden su calidad.
- Riesgo elevado de alucinacion y de generacion gramaticalmente incorrecta en feroes, dado el reducido tamano del modelo (135M) y la ausencia de evaluacion formal.
- Sesgos desconocidos: no se documenta analisis de sesgos; el corpus FineWeb-2 puede introducir sesgos de dominio y de representacion propios de datos web.
- Limitacion de contexto: la longitud maxima usada en entrenamiento es de 2048 tokens; no se garantiza un comportamiento correcto mas alla de esa ventana.
- Cobertura linguistica restringida: el ajuste se centra en feroes; el rendimiento en otros idiomas depende del modelo base y no ha sido evaluado.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un adaptador sobre un modelo base, deben respetarse tambien las condiciones de la cadena de modelos base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopcion nula y ausencia de validacion por parte de la comunidad.
- Al ser la semilla 3 de tres ejecuciones, los resultados pueden variar respecto a las otras semillas; no se documenta cual es la mejor de las tres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed3
- Modelo base (adaptador sueco): https://huggingface.co/jekunz/smollm-135m-lora-fineweb-swedish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Familia SmolLM2 (Hugging Face): no disponible enlace especifico en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
