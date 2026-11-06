# kysupo/Llama-3.2-3B-Mindworld-GGUF

## Resumen

Llama-3.2-3B-Mindworld es un ajuste fino (LoRA fusionado) del modelo meta-llama/Llama-3.2-3B-Instruct, publicado por el usuario kysupo en formato GGUF. El modelo se ha entrenado específicamente para dar vida a los personajes no jugadores (NPC) del videojuego Mindworld, presentado en el hackathon Meta Global AI Developer Hackathon (octubre-noviembre de 2026). El objetivo es que un único modelo de 3.200 millones de parámetros pueda ejecutar todas las "mentes" del juego en la máquina del propio jugador, sin depender de servicios en la nube.

La propuesta técnica se basa en destilación desde un modelo profesor denominado Muse Spark Open, usando los prompts exactos del juego. Se entrenaron tres roles diferenciados: el "Coach" o maestro, que convierte lecciones en lenguaje natural en memorandos de reglas de combate condicionales (if-then); las "mentes del pueblo", que generan planes diarios, elecciones de actividad, diálogos y reflexiones; y la "voz", que produce una acción de movimiento más una frase corta en personaje.

El modelo es relevante por su enfoque de destilación cerrada sobre un dominio muy acotado: con solo 3B de parámetros consigue tasas de validez del 98,5% en escenarios de juego, muy por encima del modelo base sin ajustar (48,5% en el caso de 1B). La distribución es únicamente en GGUF Q4_K_M, pensada para servirse con llama-server de llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parámetros totales | 3.212.749.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (llama.cpp b11934) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 de 3B parámetros, un transformer decoder-only con atención causal estándar y tokenizador de Llama 3. Sobre esta base se aplicó un ajuste fino con LoRA que posteriormente se fusionó con los pesos originales. El entrenamiento se realizó mediante destilación desde el modelo profesor Muse Spark Open, usando los prompts exactos del juego Mindworld y filtrando las muestras por validez: solo se conservaron las respuestas que superaban las comprobaciones internas del juego.

El corpus de entrenamiento se divide en tres conjuntos. El primero, para el rol de Coach, contiene 2.480 lecciones cuyos memorandos del profesor eran válidos y no perdían combates de práctica. El segundo, para las mentes del pueblo, incluye 1.927 ejemplos de planes diarios, elecciones de actividad, líneas dirigidas a aldeanos y mascotas, respuestas a jugadores fundamentadas en lo que ambos pueden ver, emotes y reflexiones nocturnas. El tercero, para la voz, contiene 827 ejemplos de movimiento más una línea corta en personaje. No se menciona el uso de RLHF o DPO; el mecanismo de selección es el filtrado por validez del propio juego.

## Capacidades

- Generación de texto conversacional en el dominio del juego: diálogos de NPC, respuestas a jugadores y reflexiones.
- Razonamiento condicional para reglas de combate: convierte lecciones en lenguaje natural en memorandos de reglas if-then.
- Planificación diaria de agentes: selección de actividades y planes para las mentes del pueblo.
- Generación de voz en personaje: una acción de movimiento más una línea de 1 a 8 palabras.
- Respuestas fundamentadas en el estado observable del juego (lo que el NPC y el jugador pueden ver).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado a la planificación diaria y a las reglas de combate del juego.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de destilación por rol (Coach, mentes del pueblo, voz); no se documenta thinking mode, visión ni audio.

## Casos de uso

- NPC conversacionales en videojuegos: el modelo puede gestionar diálogos de aldeanos y mascotas con respuestas fundamentadas en el estado observable del juego, lo que permite conversaciones coherentes sin servidor externo.
- Maestro de combate integrado en el juego: transforma las lecciones en lenguaje natural del jugador en memorandos de reglas if-then que mejoran la tasa de victoria de la mascota (incremento medido de +21,5 puntos en el modelo de 3B).
- Planificación diaria de agentes: genera planes y elige actividades para cada NPC, manteniendo la coherencia del ciclo día-noche del juego.
- Generación de voz en personaje: produce una acción de movimiento y una frase corta de 1 a 8 palabras con el 100% de validez, adecuada para animaciones y burbujas de diálogo.
- Ejecución local en la máquina del jugador: al distribuirse en GGUF Q4_K_M y caber en 2,0 GB de repositorio, permite desplegar todas las mentes del juego en hardware de consumo sin conexión.
- Prototipado de sistemas de diálogo con destilación cerrada: sirve como referencia para entrenar modelos pequeños sobre dominios acotados con filtrado por validez del propio entorno.
- Investigación en agentes de juego: útil para estudiar cómo un modelo de 3B puede sustituir a un profesor mayor en tareas estructuradas de planificación y diálogo.

## Benchmarks y rendimiento

| Prueba | Modelo ajustado 1B | Modelo ajustado 3B | Base sin ajustar 1B | Coach-only 1B | Profesor Muse Spark Open |
|---|---|---|---|---|---|
| Comprobaciones del pueblo sin gramática (200 escenarios) | 99,5% válidas | 98,5% válidas | 48,5% válidas | 82% válidas | no disponible |
| Teach: 100 lecciones x 1.000 combates (mejora media de win-rate) | +22,6 pts, 1 dañino | +21,5 pts, 2 dañinos | no disponible | +18,4 pts, 3 dañinos | +21,6 pts |
| Teach en 3B coach-only | no aplica | +23,8 pts | no disponible | no disponible | no disponible |
| Voz (validez) | 100% | 100% | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB en Q4_K_M, según el tamaño del repositorio.
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM libre; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060).
- Opciones de despliegue: llama.cpp mediante llama-server (versión b11934 o superior); no se documenta compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Mindworld (este) | 3.212.749.888 | no disponible | 98,5% validez en comprobaciones del pueblo; +21,5 pts en Teach | Llama 3.2 Community License | GGUF Q4_K_M en Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | 3.212.749.888 | no disponible | no disponible en esta ficha | Llama 3.2 Community License | safetensors y GGUF en Hugging Face |
| Modelo ajustado 1B de Mindworld | no disponible | no disponible | 99,5% validez; +22,6 pts en Teach | no disponible | no disponible |
| Muse Spark Open (profesor) | no disponible | no disponible | +21,6 pts en Teach | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está especializado en el dominio del juego Mindworld; su rendimiento fuera de ese contexto no está documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación en diálogos y planes fuera de los escenarios de entrenamiento; el filtrado por validez se aplicó solo durante el entrenamiento.
- No se documentan sesgos conocidos, pero al derivar de Llama 3.2 hereda los sesgos del modelo base.
- Idiomas soportados no disponibles; el entrenamiento se realizó con prompts del juego, presumiblemente en inglés, aunque no se confirma.
- Longitud de contexto no disponible; conviene verificar la configuración de llama-server antes de usarlo en producción.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial y obliga a cumplir la Acceptable Use Policy; es necesario revisar LICENSE.txt y USE_POLICY.md.
- Solo se distribuye en GGUF Q4_K_M; no hay safetensors ni otras cuantizaciones publicadas.
- El repositorio tiene 0 descargas y 1 like, por lo que no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kysupo/Llama-3.2-3B-Mindworld-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://llama.meta.com/llama3_2/license/
- Política de uso aceptable: https://llama.meta.com/llama3_2/use-policy/
- llama.cpp: https://github.com/ggml-org/llama.cpp
