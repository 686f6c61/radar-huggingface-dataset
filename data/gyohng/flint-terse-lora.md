# gyohng/flint-terse-lora

## Resumen

Flint Terse es un adaptador LoRA de rango 32 en formato GGUF para llama.cpp que se aplica sobre el modelo base Recursive Flint en cuantización int4. Lo desarrolla el usuario gyohng y su objetivo es reducir drásticamente la longitud del razonamiento interno del modelo (los tokens generados dentro de las etiquetas `<think>`) sin degradar la calidad de las respuestas finales. Según la model card, consigue reducciones de pensamiento de aproximadamente el 62 % en tareas de código, el 79 % en matemáticas y el 85 % en prosa y conversación, manteniendo la precisión de código del modelo base.

El adaptador no es un modelo autónomo: requiere el checkpoint concreto `flint-int4-q4_1.gguf` de RecursiveSI en una revisión y hash SHA-256 específicos, y no funciona con otras cuantizaciones. El repositorio ocupa 0,2 GB y el archivo LoRA pesa 171 MB. Está pensado para despliegues en llama.cpp y, mediante un modelo fusionado aparte, en LM Studio; también existe una variante MLX.

Su relevancia actual reside en la optimización de coste y latencia en modelos con modo de razonamiento: reducir el número de tokens de pensamiento disminuye el tiempo de generación y el consumo de cómputo en producción sin sacrificar la exactitud de las respuestas finales, algo especialmente útil en pipelines de código y matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, FP32) sobre transformer con mezcla de expertos (MoE); el adaptador se aplica sobre atención, experto compartido y MLPs densos |
| Parametros totales | 42.729.472 (adaptador LoRA; el modelo base no declara su recuento en la información disponible) |
| Parametros activos | no disponible (el modelo base es MoE, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en GGUF; el base requerido es int4 (`q4_1`). Otras cuantizaciones no están soportadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LoRA para llama.cpp); existe variante MLX en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se entrena directamente sobre los coeficientes int4 del modelo base, con LoRA de rango 32 en FP32 aplicado a las capas de atención, al experto compartido y a los MLPs densos. El modelo base Recursive Flint es una arquitectura de mezcla de expertos (MoE) con modo de razonamiento explícito delimitado por etiquetas `<think>`, aunque la información disponible no detalla su número de parámetros ni su ventana de contexto.

El entrenamiento combina dos fases: primero un aprendizaje por refuerzo en el que una respuesta obtiene recompensa solo si supera sus tests y se ajusta a un presupuesto de pensamiento decreciente; después, una pasada supervisada breve para enseñar el estilo de pensamiento telegráfico en prosa y conversación. El resultado es un adaptador que conserva la precisión de código del base mientras recorta sustancialmente los tokens de razonamiento. Se incluye una plantilla de chat (`chat_template.jinja`) derivada de la de Flint, sin el `replace("\x00", "")` que el motor de plantillas de LM Studio no soporta.

## Capacidades

- Generación de texto con modo de razonamiento interno abreviado dentro de `<think>`, sin filtrar etiquetas a la respuesta final.
- Razonamiento matemático con reducción de pensamiento de aproximadamente el 79 % respecto al base.
- Generación y razonamiento sobre código con reducción de pensamiento de aproximadamente el 62 % y precisión mantenida.
- Conversación multi-turno y prosa con reducción de pensamiento de aproximadamente el 80-85 %.
- Respuestas finales completas pese al pensamiento telegráfico.
- Compatibilidad con llama.cpp mediante `--lora` y con LM Studio a través del modelo fusionado `gyohng/flint-terse`.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de código en producción: al recortar un 62 % los tokens de pensamiento en tareas de código manteniendo la precisión, reduce la latencia y el coste por petición en asistentes integrados en IDE o en pipelines de revisión de código.
- Razonamiento matemático en servicios de tutoría o resolución de problemas: la reducción del 79 % en tokens de pensamiento abarata las respuestas sin perder exactitud en las soluciones finales.
- Chatbots de atención al cliente: la reducción del 85 % en prosa y conversación permite conversaciones multi-turno más rápidas y económicas, con respuestas finales completas.
- Despliegue en hardware modesto: al ser un adaptador GGUF sobre un base int4, se puede servir con llama.cpp o LM Studio en equipos con recursos limitados, sin necesidad de GPUs de gama alta.
- Automatización de documentación y resúmenes: el estilo telegráfico interno acelera la generación de texto en tareas de redacción y resumen donde el razonamiento extenso aporta poco.
- Prototipado e investigación sobre eficiencia de razonamiento: el repositorio de GitHub incluye código, datos y un script de reproducción, lo que permite experimentar con presupuestos de pensamiento y RL aplicado a modelos MoE cuantizados.
- Evaluación comparativa de variantes: junto con `flint-terse-minimalist`, permite elegir el equilibrio entre ahorro de pensamiento y precisión según la carga de trabajo.

## Benchmarks y rendimiento

Resultados medidos sobre el base int4 sin modificar en llama.cpp, media de tres semillas, una muestra por tarea, temperatura 1, top-p 0,95 y top-k 20. La reducción de pensamiento es relativa al base en las mismas tareas.

| Modelo | Código (110 tareas) | Matemáticas (120 tareas) | Menos pensamiento: código | matemáticas | prosa y chat |
|---|---:|---:|---:|---:|---:|
| Flint int4 (base) | 102,3 | 103,3 | — | — | — |
| flint-terse | **102,7** | **109,7** | 62 % | 79 % | 85 % |
| flint-terse-minimalist | 98,0 | 108,0 | 81 % | 86 % | 85 % |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador LoRA pesa 171 MB y se suma al modelo base int4 requerido (`flint-int4-q4_1.gguf`), cuyo tamaño no se detalla en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; al tratarse de un base int4 ejecutable en llama.cpp, es plausible en GPUs de consumo, pero no se confirma en la documentación.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora`, `--jinja` y plantilla de chat propia), LM Studio (solo con el modelo fusionado `gyohng/flint-terse`) y MLX (variante `gyohng/flint-terse-mlx`).
- Latencia y throughput estimados: no disponible; la reducción de tokens de pensamiento sugiere menor latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Precisión código | Precisión matemáticas | Licencia |
|---|---|---|---|---|---|---|
| flint-terse | LoRA GGUF sobre Flint int4 | 42,7 M (adaptador) | no disponible | 102,7 | 109,7 | Apache-2.0 |
| flint-terse-minimalist | LoRA GGUF sobre Flint int4 | no disponible | no disponible | 98,0 | 108,0 | Apache-2.0 |
| Flint int4 (base) | Modelo base MoE int4 | no disponible | no disponible | 102,3 | 103,3 | Apache-2.0 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador solo funciona con el archivo `flint-int4-q4_1.gguf` de la revisión `9c47151036bc2c34331142dda04488bceab2bc9f` (SHA-256 `43c07baccdba42eb7528a9630ee15699b1942c297291dc1b39a061f508ee1a4b`); otras cuantizaciones son checkpoints distintos y no están soportadas.
- LM Studio no puede aplicar adaptadores LoRA: es obligatorio usar el modelo fusionado `gyohng/flint-terse`.
- La plantilla de chat incluida elimina el `replace("\x00", "")` de la plantilla original por incompatibilidad con LM Studio; conviene verificar el comportamiento en otros motores.
- No se documentan sesgos conocidos ni tasas de alucinación.
- No se especifican idiomas soportados ni longitud de contexto.
- La licencia Apache-2.0 permite uso comercial sin condiciones adicionales, pero el modelo base Flint es de Recursive y conviene revisar su model card.
- El recorte de pensamiento puede afectar a tareas que requieren razonamiento extenso; la variante minimalist reduce aún más el pensamiento a costa de perder precisión en código (98,0 frente a 102,7).
- El repositorio no registra descargas ni likes, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/gyohng/flint-terse-lora
- Modelo fusionado para LM Studio: https://huggingface.co/gyohng/flint-terse
- Variante MLX: https://huggingface.co/gyohng/flint-terse-mlx
- Variante minimalist: https://huggingface.co/gyohng/flint-terse-minimalist
- Modelo base (familia): https://huggingface.co/RecursiveSI/flint
- Base int4 requerido: https://huggingface.co/RecursiveSI/flint-int4-gguf
- Repositorio GitHub con código y reproducción: https://github.com/gyohng/flint-terse
- Organización Recursive: https://huggingface.co/RecursiveSI
