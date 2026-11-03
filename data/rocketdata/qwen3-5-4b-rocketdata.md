# RocketData/Qwen3.5-4B-rocketdata

## Resumen

Qwen3.5-4B-rocketdata es un ajuste fino del modelo multimodal Qwen/Qwen3.5-4B desarrollado por RocketData. El modelo está especializado en el diseno de cohetes experimentales (model rockets) a partir de requisitos de vuelo expresados en lenguaje natural. Dado un enunciado como "un cohete que alcance unos 450 m con un motor F50T", el modelo genera primero un razonamiento interno en etiquetas `<thought>` y a continuacion un diseno estructurado en JSON dentro de `<design>`.

Tecnicamente se trata de un LoRA de rango 16 en precision de 16 bits aplicado sobre el modelo base, con los pesos fusionados publicados en formato safetensors y una version cuantizada en GGUF Q8_0. El modelo conserva la torre de vision del base (pipeline `image-text-to-text`) y la arquitectura transformer multimodal de la familia Qwen3.5, aunque el ajuste se ha centrado exclusivamente en la tarea de diseno de cohetes.

Su relevancia es acotada pero ilustrativa: demuestra como un ajuste fino de bajo coste (3,8 minutos en una RTX 5080) puede convertir un modelo generalista de 4B en un generador de disenos estructurados y validables por esquema en un dominio tecnico muy especifico. La publicacion incluye gramatica GBNF, adaptador LoRA separado y resultados de evaluacion detallados, lo que facilita su reproduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), ajuste fino con LoRA rango 16 |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos fusionados), Q8_0 GGUF, Q4_K_M GGUF (desaconsejada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA (PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de la familia Qwen3.5 con capacidad de entrada imagen-texto. Sobre el se aplico un LoRA de rango 16 y alpha 16 en precision de 16 bits, entrenado con Unsloth 2026.10.7, transformers 5.5.0 y TRL 0.23.1. La configuracion de entrenamiento fue: learning rate 2e-4, batch 1 con acumulacion de gradiente 8, 3 epocas (57 pasos), semilla 42, conservando el ultimo epoch. La perdida de test por epoca fue 0,499, 0,452 y 0,450 respectivamente.

El conjunto de datos es `new_results/sft_v2.jsonl` del repositorio Phorceon/rocketdata, excluyendo los 12 disenos con 60 o mas piezas, lo que deja 151 filas y 73 cohetes. El modelo fue entrenado con el razonamiento dentro de la respuesta (etiquetas `<thought>`) en lugar de usar el slot de thinking nativo de Qwen, lo que implica que debe desactivarse el modo thinking al inferir. El autor publica ademas una gramatica GBNF (`design.gbnf`) que restringe la salida al formato `<thought>…</thought><design>{json}</design>` con JSON valido, y senala que sin gramatica la tasa de disenos validos baja de 103/105 a 93/105.

## Capacidades

- Generacion de disenos de cohetes experimentales en JSON estructurado a partir de requisitos de vuelo en lenguaje natural.
- Razonamiento explicito en etiquetas `<thought>` antes de emitir el diseno final.
- Calculo declarado de parametros de propulsion, estabilidad y descenso (segun el system prompt de entrenamiento).
- Salida validable mediante gramatica GBNF y esquema JSON del proyecto.
- Capacidad multimodal heredada del modelo base (entrada imagen-texto), aunque no se documenta su uso en esta tarea.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el entrenamiento y evaluacion se realizan en ingles.

## Casos de uso

- Prototipado rapido de cohetes experimentales: dado un requisito de altitud y un motor concreto, el modelo produce un borrador de diseno en JSON que puede importarse a herramientas propias para su validacion y simulacion posterior.
- Generacion asistida de configuraciones de OpenRocket: el JSON de salida sigue el esquema del proyecto rocketdata, por lo que sirve como punto de partida para construir ficheros de diseno, aunque el formato no registra posiciones de piezas y no es importable fielmente.
- Educacion y divulgacion aeroespacial: el modo `<thought>` hace visible el razonamiento sobre propulsion, estabilidad y descenso, lo que resulta util como material didactico para explicar el proceso de diseno.
- Generacion de datasets sinteticos de disenos: al poder ejecutarse con gramatica y temperatura controlada, puede emplearse para producir borradores masivos de disenos que luego se filtran y validan con simuladores.
- Integracion en pipelines de CI con llama.cpp o vLLM: la gramatica GBNF y el modo guided decoding de vLLM permiten garantizar salida JSON valida en un servicio automatizado de generacion de disenos.
- Base para ajuste adicional o RL: el adaptador LoRA se publica por separado, de modo que equipos de investigacion pueden continuar el entrenamiento o aplicar RL sobre el mismo dominio sin partir de cero.
- Despliegue en estaciones de trabajo modestas: la version Q8_0 (4,3 GB) mas el codificador de imagen (645 MB) cabe en GPUs de consumo, lo que permite uso local en entornos sin infraestructura cloud.

## Benchmarks y rendimiento

Evaluacion sobre los 105 prompts de RL en `data/splits/rl_heldout.jsonl`, comparando con el ajuste previo Agents-A1-4B:

| Comprobacion | Qwen3.5-4B-rocketdata | Agents-A1-4B |
|---|---|---|
| JSON de diseno valido | 103 | 103 |
| Usa el esquema del proyecto | 101 | 90 |
| Usa el motor solicitado | 28 de 29 | 28 de 29 |
| Bucle infinito | 2 | 0 |
| Motor mas comun | A8 en el 17% de los disenos (42 motores en total) | GragasMAY24 en cerca del 74% |

Sobre los 38 prompts de test en `new_results/sft_test_v2.jsonl`, en 3 ejecuciones: JSON valido 36-38, esquema 36-37, motor solicitado 10-11 de 11. Sin gramatica, el mismo fichero produce 93 disenos validos de 105 frente a 103 con gramatica.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,3 GB en BF16 (4,66B parametros), unos 4,3 GB en GGUF Q8_0 mas 645 MB del codificador de imagen.
- GPU recomendadas: cualquier GPU con 10 GB o mas para BF16; RTX 4090, RTX 5080 (usada por el autor para el entrenamiento), A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en modelos con 8-12 GB de VRAM usando la cuantizacion Q8_0; la Q4_K_M esta desaconsejada por el autor porque rompe los corchetes del JSON en la mayoria de respuestas.
- Opciones de despliegue: llama.cpp, LM Studio, Unsloth Studio, vLLM con guided decoding, transformers con `from_pretrained`.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo requirio 3,8 minutos en una RTX 5080.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-rocketdata | 4,66B | no disponible | Diseno de cohetes, salida JSON | Apache 2.0 | HuggingFace, GGUF, LoRA |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Multimodal generalista | no disponible | HuggingFace |
| Agents-A1-4B (ajuste previo) | no disponible | no disponible | Agentes, mismo dominio | no disponible | Referenciado en la model card |

No se dispone de datos de benchmarks estandar para establecer una comparacion cuantitativa con modelos generalistas equivalentes.

## Limitaciones y advertencias

- Inventa nombres de motores en aproximadamente un tercio de sus disenos; los datos de entrenamiento solo contienen 66 motores distintos.
- Algunas respuestas entran en bucle, siempre en una lista de piezas que no termina; el numero varia segun la semilla de entrenamiento (otra semilla del mismo recetario genero bucles en 14 de 105 casos).
- Ningun diseno ha sido simulado: la "apogeo simulado" que aparece en el razonamiento es una afirmacion del propio modelo, no un resultado verificado.
- El formato de diseno no registra posiciones de piezas, por lo que no puede reconstruirse fielmente en OpenRocket.
- Requiere thinking desactivado en el cliente; el modelo fue entrenado con el razonamiento dentro de la respuesta.
- Temperatura 0,7, top-p 0,95, top-k 20; a 0,3 entra en bucles. No aplicar penalizacion de presencia ni de repeticion porque rompe el JSON.
- La cuantizacion Q4_K_M degrada gravemente la validez del JSON; usar Q8_0.
- Unsloth Studio no soporta gramatica, por lo que la tasa de JSON valido sera inferior a la reportada.
- Licencia Apache 2.0, permisiva para uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado.
- Sesgos conocidos y cobertura de idiomas no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RocketData/Qwen3.5-4B-rocketdata
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de datos y codigo: https://github.com/Phorceon/rocketdata
- Pull request con codigo y resultados: PR #10 en el repositorio anterior
