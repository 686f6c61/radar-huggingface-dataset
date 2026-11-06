# kysupo/Llama-3.2-1B-Mindworld-q4f32_1-MLC

## Resumen

Llama-3.2-1B-Mindworld es un ajuste fino mediante LoRA (fusionado en los pesos finales) sobre Meta Llama 3.2 1B Instruct, desarrollado por el usuario kysupo en el contexto del hackathon Meta Global AI Developer Hackathon (octubre-noviembre de 2026). El modelo está especializado en cubrir todos los roles de comportamiento de los agentes no jugadores (NPC) del videojuego Mindworld: desde el "Coach" que convierte una lección en lenguaje natural en un memorando de reglas de combate condicionales, hasta las mentes de aldea que planifican el día, eligen actividades, dialogan con aldeanos y mascotas, responden a jugadores y generan reflexiones nocturnas.

La relevancia técnica del modelo radica en su estrategia de destilación: los datos de entrenamiento se generaron a partir de las respuestas de un modelo mayor ("Muse Spark Open") y se filtraron mediante las comprobaciones internas del propio juego, garantizando que solo se conservasen ejemplos válidos. El resultado es un modelo de 1.000 millones de parámetros que alcanza un 99,5% de validez en las comprobaciones de aldea (frente al 48,5% del modelo base sin ajustar) y una mejora de +22,6 puntos porcentuales en la tasa de victoria de las mascotas entrenadas.

El artefacto publicado es una cuantización MLC q4f32_1 de 1,3 GB pensada para ejecutarse en el navegador mediante WebLLM y WebGPU, lo que permite desplegar la inferencia en la máquina del jugador sin servidor. La arquitectura subyacente es la de Llama 3.2 1B Instruct (transformer denso con 1.000 millones de parámetros), aunque no se dispone de la longitud de contexto ni de la composición exacta del dataset de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Llama 3.2 1B Instruct) |
| Parámetros totales | 1.000 millones (1B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | q4f32_1 (MLC); los resultados del autor también se midieron en GGUF Q4_K_M |
| Idiomas soportados | No disponible (el modelo base Llama 3.2 soporta oficialmente 8 idiomas, pero la model card no lo declara para este ajuste) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | MLC (q4f32_1) para WebLLM; el autor menciona también GGUF Q4_K_M como formato de evaluación |

## Arquitectura y entrenamiento

El modelo parte de Meta Llama 3.2 1B Instruct, un transformer denso de 1.000 millones de parámetros, y se ajusta mediante LoRA, cuyos adaptadores se fusionan posteriormente en los pesos finales. El entrenamiento se realizó con los prompts exactos del juego Mindworld y los datos se destilaron de un modelo mayor denominado "Muse Spark Open". La composición del dataset se divide en tres bloques: 2.480 lecciones de Coach con memorandos de reglas de combate válidos y sin derrotas en combates de práctica, 827 ejemplos de "voz" (movimiento más una línea breve en personaje) y 1.927 ejemplos de mentes de aldea que cubren planes diarios, elección de actividades, líneas para aldeanos y mascotas, respuestas a jugadores fundamentadas en lo que ambos pueden ver, emoticonos y reflexiones nocturnas.

Cada ejemplo se conservó únicamente si superaba las comprobaciones internas del propio juego, lo que actúa como un filtro de calidad automatizado. No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición lingüística del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no reside en la arquitectura, sino en el pipeline de destilación con verificación por el propio entorno de ejecución y en el empaquetado en formato MLC q4f32_1 para inferencia WebGPU en el navegador.

## Capacidades

- Generación de texto especializada en los roles del juego: planes diarios, elección de actividades, diálogos con aldeanos y mascotas, respuestas a jugadores y reflexiones nocturnas.
- Conversión de lecciones en lenguaje natural a memorandos estructurados de reglas de combate condicionales (formato if-then) para el rol de Coach.
- Generación de "voz" en personaje: una acción de movimiento acompañada de una línea breve de entre 1 y 8 palabras.
- Respuestas fundamentadas en el contexto visible compartido entre el jugador y el NPC.
- Generación de emoticonos y reflexiones de cierre de jornada.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes multi-paso ni de modo de razonamiento extendido (thinking mode) en la información disponible.
- Capacidades multilingües: no disponibles en la model card de este ajuste.

## Casos de uso

- NPCs de aldea en videojuegos: el modelo gestiona los planes diarios, la elección de actividades y los diálogos de 1.927 mentes de aldea distintas, lo que permite poblar un mundo con agentes con comportamiento coherente sin coste de servidor, al ejecutarse en la máquina del jugador.
- Sistema de entrenamiento de mascotas o compañeros: el rol de Coach transforma una lección en lenguaje natural en un memorando de reglas if-then que mejora la tasa de victoria de la mascota en +22,6 puntos porcentuales según las pruebas del autor, lo que lo hace adecuado para mecánicas de progresión basadas en instrucciones del jugador.
- Diálogo reactivo con el jugador: las respuestas se fundamentan en lo que jugador y NPC pueden ver simultáneamente, lo que encaja en sistemas de conversación contextual de mundo abierto donde el estado del entorno condiciona la respuesta.
- Despliegue web sin backend: al estar empaquetado en MLC q4f32_1 para WebLLM y WebGPU, permite distribuir un juego o demo jugable en el navegador con inferencia local, sin infraestructura de GPU en servidor.
- Prototipado rápido de agentes conversacionales: el pipeline de destilación con verificación automática descrito por el autor sirve como plantilla para generar datasets de comportamiento de NPC filtrados por las reglas del propio juego.
- Generación de líneas breves en personaje: la restricción de 1 a 8 palabras y el 100% de validez reportado lo hacen útil para sistemas de "barks" o comentarios ambientales de personajes en juegos.
- Evaluación de técnicas de cuantización en navegador: la comparación entre Q4_K_M GGUF y q4f32_1 en WebLLM (98,5% frente a 99,5% en comprobaciones de aldea) ofrece un caso práctico para estudiar la degradación de calidad por formato.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el ajuste de 1B y 3B con el modelo base y con el profesor (Muse Spark Open). Las cifras principales se midieron sobre GGUF Q4_K_M; el formato q4f32_1 se evaluó por separado en WebLLM.

| Prueba | 1B ajustado | 3B ajustado | Base 1B | Coach-only 1B | Profesor (Muse Spark Open) |
|---|---|---|---|---|---|
| Comprobaciones de aldea válidas (200 escenarios, sin gramática) | 99,5% | 98,5% | 48,5% | 82% | No disponible |
| Teach: mejora media de win-rate (100 lecciones x 1.000 combates) | +22,6 pts (1 dañino) | +21,5 pts (2 dañinos) | No disponible | +18,4 pts (3 dañinos) | +21,6 pts |
| Voz: validez de formato | 100% | 100% | No disponible | No disponible | No disponible |
| WebLLM q4f32_1 (GTX 1050): comprobaciones de aldea | 98,5% | No disponible | No disponible | No disponible | No disponible |
| WebLLM q4f32_1 (GTX 1050): Teach | +19,1 pts (6 dañinos) | No disponible | No disponible | No disponible | No disponible |
| WebLLM q4f32_1 (GTX 1050): voz | 100% | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,3 GB en formato q4f32_1; la inferencia en WebLLM requiere que los pesos quepan en la memoria de la GPU o en la memoria unificada del navegador.
- GPU recomendadas: el autor reporta pruebas en una GTX 1050, una GPU de gama baja, lo que indica que el modelo cabe en hardware consumer modesto.
- Cabe en GPU consumer: sí, según la evidencia del autor con GTX 1050.
- Opciones de despliegue: WebLLM con WebGPU (formato nativo del artefacto); el autor menciona también GGUF Q4_K_M, lo que abre la puerta a llama.cpp u otros runners compatibles con GGUF, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.2-1B-Mindworld (este) | 1B | No disponible | NPC de videojuego (Coach, aldea, voz) | Llama 3.2 Community License | MLC q4f32_1, GGUF Q4_K_M |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128.000 tokens (según Meta) | Instrucciones generales | Llama 3.2 Community License | Safetensors, GGUF, MLC |
| Ajuste Coach-only 1B (mencionado por el autor) | 1B | No disponible | Solo rol de Coach | No disponible | No disponible |
| Ajuste Mindworld 3B (mencionado por el autor) | 3B | No disponible | NPC de videojuego | No disponible | No disponible |

La comparativa con modelos de propósito general de 1B (Qwen2.5-1.5B, Gemma 2 2B, Phi-3-mini) no está disponible en la información proporcionada, y en cualquier caso no serían comparables en la tarea específica de comportamiento de NPC.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado con los prompts exactos del juego Mindworld; fuera de ese dominio su comportamiento no está caracterizado y probablemente degrade respecto al modelo base.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Riesgo de alucinación: no cuantificado; el filtrado por comprobaciones del juego reduce la invalidez de formato, pero no garantiza corrección semántica en contextos nuevos.
- Degradación por cuantización: el formato q4f32_1 en WebLLM baja del 99,5% al 98,5% en comprobaciones de aldea y de +22,6 a +19,1 puntos en Teach, con 6 casos dañinos frente a 1 en Q4_K_M.
- Restricciones de licencia: sujeto a la Llama 3.2 Community License y a la Acceptable Use Policy de Meta; el uso comercial está permitido bajo esa licencia, pero requiere cumplir sus condiciones (incluida la atribución "Built with Llama").
- Idiomas: no declarados para este ajuste; el modelo base soporta 8 idiomas, pero el ajuste se entrenó con prompts del juego y no se documenta cobertura multilingüe.
- Contexto: no disponible; no debe asumirse la ventana de 128.000 tokens del modelo base sin verificación.
- Madurez: repositorio con 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kysupo/Llama-3.2-1B-Mindworld-q4f32_1-MLC
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Librería WebGPU de referencia (config y tokenizer): https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC
- Licencia Llama 3.2: LICENSE.txt en el repositorio del modelo
- Política de uso aceptable: USE_POLICY.md en el repositorio del modelo
