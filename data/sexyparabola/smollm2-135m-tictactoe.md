# Sexyparabola/smollm2-135m-tictactoe

## Resumen

smollm2-135m-tictactoe es un ajuste fino de SmolLM2-135M-Instruct, el modelo de lenguaje compacto de HuggingFaceTB, especializado en jugar al tres en raya (tic-tac-toe) mediante conversacion en formato chat. Lo desarrolla el usuario independiente Sexyparabola y se publica bajo licencia Apache-2.0. El modelo interpreta el papel de "O" mientras el usuario juega como "X" y mueve primero; en cada turno repite el movimiento del jugador, responde con el suyo y redibuja el tablero en texto.

Tecnicamente es un transformer decoder-only de 134.515.008 parametros (aproximadamente 135M) afinado con LoRA de rango 32 y fusionado posteriormente en los pesos base, de modo que se carga como un modelo `transformers` estandar sin dependencia de PEFT. El entrenamiento se realizo sobre conversaciones sinteticas generadas a partir de partidas contra un oponente basado en reglas, con un esquema de ponderacion de perdida que da 10x de peso a los tokens decisivos (casilla elegida, etiqueta del movimiento, tablero final y token de fin).

Su relevancia es acotada pero ilustrativa: demuestra como un modelo de 135M de parametros, con un dataset sintetico bien disenado y una perdida ponderada, puede adquirir una habilidad conversacional muy concreta con un coste de entrenamiento minimo. No es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo; es un ejemplo de especializacion estrecha sobre una base pequena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 (aproximadamente 135M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de SmolLM2-135M-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no confirmadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el entrenamiento es en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de 135M de parametros, y se ajusta mediante LoRA de rango 32, alpha 64 y sin dropout, aplicado a todas las proyecciones de atencion y MLP (`q/k/v/o/gate/up/down_proj`). Esto supone aproximadamente 9,8M de parametros entrenables, que posteriormente se fusionan en los pesos base, por lo que el artefacto final es un modelo denso estandar sin adaptadores separados.

Los datos de entrenamiento son conversaciones sinteticas generadas a partir de partidas contra un oponente basado en reglas, incluyendo partidas de autojuego y sondas exhaustivas de posiciones (movimientos de bloqueo, casillas ya ocupadas, entradas ambiguas). Cada partida se renderiza en varias variantes de conversacion con redacciones distintas. Solo se entrenan los tokens del asistente, y los tokens que determinan el resultado (casilla elegida, etiqueta del movimiento, bloque del tablero final y token de fin) reciben un peso 10x en la perdida. El calendario de entrenamiento consistio en 747 pasos con batch size 8, decaimiento lineal con warmup, sobre una epoca de aproximadamente 2.985 conversaciones.

## Capacidades

- Juego conversacional de tres en raya: interpreta el rol de "O", acepta movimientos numericos del jugador ("X", que mueve primero), responde con su propio movimiento y redibuja el tablero en texto.
- Etiquetado de la razon del movimiento: anota sus jugadas con etiquetas como `(center)`, `(corner)` o `(block)`.
- Gestion de errores de entrada: si el jugador elige una casilla ya ocupada, solicita otra.
- Anuncio del resultado: comunica el desenlace de la partida cuando termina.
- Formato chat: usa la plantilla de chat de SmolLM2 con mensajes `system`, `user` y `assistant`.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues: no declaradas; el entrenamiento y los ejemplos estan en ingles.
- Capacidades generales de chat, codigo o matematicas: practicamente inexistentes tras el ajuste especializado.

## Casos de uso

- Demostracion educativa de ajuste fino con LoRA: sirve como ejemplo reproducible de como especializar un modelo de 135M en una tarea concreta con un dataset sintetico y una perdida ponderada, util en cursos o tutoriales de fine-tuning.
- Prototipo de agente de juego conversacional: puede integrarse en un bot de chat (Telegram, Discord, web) que gestione partidas de tres en raya manteniendo el historial de la conversacion en `msgs`.
- Prueba de concepto de interfaces basadas en texto: permite evaluar como un modelo pequeno renderiza y actualiza estado estructurado (el tablero) dentro de una conversacion, sin necesidad de logica externa de juego.
- Benchmark de juguete para evaluar robustez conversacional: util para medir como un modelo minimo maneja entradas fuera de distribucion (casillas ocupadas, entradas ambiguas) y si respeta el formato de tablero.
- Generacion de datos sinteticos de partidas: el modelo puede usarse para producir transcripciones de partidas etiquetadas, que sirvan como material de entrenamiento o de evaluacion para otros sistemas.
- Experimentacion con decodificacion greedy en modelos pequenos: permite estudiar el comportamiento de la generacion determinista en tareas de estado, comparando con muestreo y con variantes de temperatura.
- Despliegue en entornos con recursos minimos: al tener 135M de parametros, cabe en CPU y en GPUs de gama baja, lo que facilita demos locales sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 540 MB solo para pesos (134,5M x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 270 MB para pesos, mas overhead; en int8 alrededor de 135 MB y en int4 alrededor de 70 MB (estimaciones teoricas, no verificadas en la model card).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; por ejemplo RTX 3060, RTX 4060, RTX 4090, asi como GPUs de portatil con 4 GB o mas. Tambien funciona en CPU.
- Cabe en GPU consumer: si, con amplio margen, en practicamente cualquier GPU con 2 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (metodo indicado por el autor), y en principio compatible con text-generation-inference segun los tags; vLLM, llama.cpp u Ollama no estan confirmados por el autor y requeririan conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera baja latencia en GPU y moderada en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm2-135m-tictactoe | 134,5M | no disponible | Tres en raya conversacional | Apache-2.0 | HuggingFace |
| SmolLM2-135M-Instruct (base) | 135M | no disponible en esta ficha | Chat general | Apache-2.0 | HuggingFace |
| SmolLM2-360M-Instruct | 360M | no disponible en esta ficha | Chat general | Apache-2.0 | HuggingFace |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | Chat general | Apache-2.0 | HuggingFace |

La comparacion relevante es con su modelo base: smollm2-135m-tictactoe hereda el tamano y la licencia de SmolLM2-135M-Instruct, pero sustituye las capacidades generales de chat por una habilidad estrecha de juego. Frente a modelos de chat general de tamano similar o superior (SmolLM2-360M-Instruct, Qwen2.5-0.5B-Instruct), este ajuste no es competitivo en tareas generales y solo tiene sentido en el dominio del tres en raya.

## Limitaciones y advertencias

- Modelo de 135M de parametros entrenado para una unica tarea estrecha; no funciona bien como chat general.
- Solo opera con el system prompt y el formato de tablero mostrados en la model card; otras indicaciones o disposiciones del tablero quedan fuera de distribucion.
- Puede cometer errores de juego, por ejemplo elegir un movimiento que no bloquea cuando deberia; no es un jugador perfecto.
- Riesgo de alucinacion en entradas no contempladas: al ser un modelo pequeno y especializado, puede generar tableros inconsistentes o respuestas incoherentes fuera del guion entrenado.
- Idiomas: no se declaran capacidades multilingues; el entrenamiento y los ejemplos estan en ingles.
- Contexto: la longitud de contexto no se confirma en la informacion disponible; conversaciones largas pueden degradar el comportamiento.
- Licencia Apache-2.0, heredada del modelo base, permite uso comercial, pero al ser una version modificada conviene conservar los avisos de licencia y atribucion correspondientes.
- Para produccion: no recomendado como componente critico sin validacion exhaustiva; su valor es educativo y de demostracion.
- No hay cuantizaciones GGUF publicadas por el autor, por lo que el despliegue en llama.cpp u Ollama requeriria conversion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sexyparabola/smollm2-135m-tictactoe
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
