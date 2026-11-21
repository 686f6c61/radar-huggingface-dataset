# ggml-org/TML-d24-varloop-research-GGUF

## Resumen

TML-d24-varloop-research es un artefacto de investigación publicado por Thinking Machines Lab y cuantizado a GGUF por ggml-org. Se trata de un modelo de mezcla de expertos (MoE) con arquitectura de bucle variable ("variable loop"), diseñado específicamente para estudiar cómo afecta el número de pasadas recurrentes por token a la calidad y al coste de inferencia. El modelo acepta entrada de imagen y texto (pipeline `image-text-to-text`) y cuenta con 26.070.385.152 parámetros totales.

La peculiaridad principal es su núcleo recurrente: de las 24 capas totales, las capas 6 a 17 forman un "loop core" que se ejecuta un número configurable de veces por token (de 1 a 6, con 3 por defecto). Cada pasada mantiene su propia caché KV y de convolución, de modo que el coste computacional crece de forma aproximadamente lineal con el número de pasadas: cada pasada adicional añade 12 evaluaciones de capa por token. La arquitectura MoE emplea 128 expertos con 8 activos por token.

El modelo está pensado como banco de pruebas para evaluar el equilibrio entre profundidad de razonamiento y latencia, no como modelo de producción. El propio autor lo etiqueta como "research artifact" y remite a Inkling 2 Mini para uso general. Su licencia no está especificada en la información disponible, lo que supone una advertencia relevante para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo recurrente de bucle variable (24 capas, capas 6-17 en bucle) |
| Parametros totales | 26.070.385.152 |
| Parametros activos | 8 expertos de 128 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, IQ4_NL (imatrix-calibrada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con mmproj BF16 y Q8_0 para el codificador visual) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 128 expertos enrutados y 8 activos por token, organizado en 24 capas. Las capas 6 a 17 constituyen un núcleo recurrente que se evalúa varias veces por token; cada pasada conserva su propia caché KV y de convolución, lo que implica que el estado no se comparte entre pasadas. El checkpoint original almacena los expertos enrutados de las capas 0-19 en NVFP4 y los de las capas 20-23 en MXFP8. Los pesos del controlador de bucle se mantienen en F32.

El entrenamiento se realizó con un número variable de pasadas de bucle, lo que permite ajustar la profundidad de cómputo en tiempo de carga (de 1 a 6 pasadas; por defecto 3). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización IQ4_NL de ggml-org se calibró con una matriz de importancia (imatrix) calculada a partir del modelo BF16 con 3 pasadas, usando los datos de calibración v6 de bartowski y renderizando las conversaciones con la plantilla de chat del modelo. En IQ4_NL, los expertos NVFP4 de las capas 0-19 se cuantizan a IQ4_NL y el resto de matrices permanece en Q8_0.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`).
- Control explícito de la profundidad de razonamiento mediante el parámetro `reasoning_effort` (`none`, `minimal`, `low`, `medium`, `high` por defecto, `xhigh`, `max`, o un valor numérico de 0.0 a 0.99).
- Ajuste del número de pasadas de bucle en tiempo de carga (1 a 6) mediante `--override-kv inkling2_loop.loop.count=int:N`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cómputo adaptativo: el modelo permite medir empíricamente la relación entre número de pasadas de bucle y calidad de respuesta, usando `--override-kv inkling2_loop.loop.count` para comparar configuraciones de 1 a 6 pasadas sobre el mismo checkpoint.
- Evaluación de estrategias de razonamiento: el parámetro `reasoning_effort` permite trazar curvas de coste-calidad para tareas de razonamiento, ajustando la profundidad sin cambiar de modelo.
- Estudio de cuantización en MoE con expertos de precisión mixta: el checkpoint original combina NVFP4 y MXFP8, y la versión IQ4_NL permite analizar el impacto de cuantizar solo los expertos enrutados manteniendo el resto en Q8_0.
- Experimentos de multimodalidad con imagen: al aceptar entrada de imagen, sirve para probar pipelines de visión-lenguaje en entornos de investigación con llama.cpp.
- Benchmarking de latencia en hardware consumer: con 17,6 GB en IQ4_NL, permite medir el coste real de las pasadas adicionales de bucle en GPUs de gama alta domésticas.
- Docencia y reproducción de arquitecturas recurrentes: útil para ilustrar en cursos o artículos cómo funciona un núcleo de bucle con caché KV independiente por pasada.
- Validación de despliegues GGUF: sirve como caso de prueba para verificar el soporte de `llama serve` con `--override-kv` y el manejo de mmproj en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,6 GB en IQ4_NL, 27,8 GB en Q8_0 y 52,2 GB en BF16, más el codificador visual (642 MB en BF16 o 346 MB en Q8_0).
- GPU recomendadas: para IQ4_NL, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se recomienda A100 40 GB, H100 o RTX 6000 Ada (48 GB); para BF16, A100 80 GB o H100 80 GB.
- Cabe en GPU consumer: sí, en IQ4_NL dentro de GPUs de 24 GB; Q8_0 queda fuera de las consumer habituales de 24 GB.
- Opciones de despliegue: llama.cpp mediante `llama serve -hf ggml-org/TML-d24-varloop-research-GGUF:IQ4_NL`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles como cifras absolutas; el autor indica que cada pasada adicional del bucle añade 12 evaluaciones de capa por token, por lo que el coste de decodificación crece de forma aproximadamente lineal con el número de pasadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TML-d24-varloop-research (este) | 26,07 B | no disponible | MoE con bucle variable, 24 capas | no disponible | GGUF en Hugging Face |
| Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | GGUF en Hugging Face (ggml-org) |
| thinkingmachines/TML-d24-varloop-research (original) | 26,07 B | no disponible | MoE con bucle variable | no disponible | Checkpoint original en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. El autor recomienda Inkling 2 Mini para uso general frente a este artefacto de investigación.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo para producción; el propio autor lo desaconseja para uso general.
- La licencia no está especificada, por lo que no se puede asumir permiso para uso comercial.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El número de pasadas de bucle se fija al cargar el modelo; no puede cambiarse dinámicamente durante la inferencia.
- Cada pasada adicional incrementa el coste de decodificación (12 evaluaciones de capa extra por token), lo que afecta directamente a la latencia.
- La cuantización IQ4_NL solo se aplica a los expertos enrutados de las capas 0-19; el resto de matrices queda en Q8_0, de modo que el ahorro de memoria es menor de lo que sugeriría una cuantización de 4 bits completa.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Al ser un modelo multimodal, requiere gestionar el fichero mmproj junto con los pesos principales; un despliegue sin él pierde la capacidad de visión.
- No se confirma soporte en motores de inferencia distintos de llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/TML-d24-varloop-research-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Modelo recomendado para uso general (Inkling 2 Mini): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Matriz de importancia para calibración: https://huggingface.co/ggml-org/TML-d24-varloop-research-GGUF/blob/main/imatrix-TML-d24-varloop-research.gguf
- Datos de calibración de bartowski: https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a
- Aplicación de ejecución: https://llama.app
