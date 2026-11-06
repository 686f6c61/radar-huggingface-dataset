# kysupo/Llama-3.2-1B-Mindworld-GGUF

## Resumen

Llama-3.2-1B-Mindworld-GGUF es un ajuste fino por LoRA (fusionado en los pesos base) de meta-llama/Llama-3.2-1B-Instruct, publicado por el usuario kysupo. El modelo se entrenó con los prompts exactos del videojuego Mindworld, desarrollado en el marco de la Meta Global AI Developer Hackathon (octubre-noviembre de 2026), con el objetivo de ejecutar en la máquina del jugador todas las mentes no jugadoras del título: desde el entrenador personal del jugador hasta los planes diarios, diálogos y reflexiones de los aldeanos.

La propuesta es de destilación: las respuestas se generaron a partir de un profesor de mayor capacidad denominado Muse Spark Open y se filtraron con las comprobaciones internas del propio juego, conservando únicamente las muestras válidas. El resultado es un modelo de 1.235.814.432 parámetros (1B) que cabe en hardware de consumo y que, según la model card, supera ampliamente al modelo base sin ajustar en las tareas específicas del juego.

El repositorio distribuye únicamente pesos en formato GGUF Q4_K_M (aproximadamente 0,8 GB), pensados para servirse con llama-server de llama.cpp. No es un modelo de propósito general: su valor está en el comportamiento especializado dentro de Mindworld, no en benchmarks generalistas de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino LoRA fusionado sobre Llama-3.2-1B-Instruct |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.2 1B Instruct: 128.000 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en el repo) |
| Idiomas soportados | no disponibles (el base Llama 3.2 soporta oficialmente 8 idiomas; no confirmado para este ajuste) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (llama.cpp b11934) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B Instruct, un transformer decoder-only de 1.235.814.432 parámetros con atención causal estándar. Sobre esa base se aplicó un ajuste fino por LoRA que posteriormente se fusionó en los pesos, de modo que el artefacto distribuido no requiere adaptadores separados. La plantilla de chat es la de Llama 3 sin la cabecera de fecha, un detalle relevante para reproducir el comportamiento esperado al servir el modelo.

El entrenamiento es una destilación desde Muse Spark Open usando los prompts exactos del juego y filtrando las muestras con las comprobaciones del propio Mindworld. Se distinguen dos conjuntos: por un lado, el entrenador (Coach/Teach), con 2.480 lecciones cuyos memos de reglas if-then eran válidos y no perdían en combates de práctica, más 827 muestras de "voz" (movimiento y frase corta en personaje); por otro, las mentes de aldea (1.927), que cubren planes diarios, elección de actividades, líneas a aldeanos y mascotas, respuestas a jugadores fundamentadas en lo que ambos pueden ver, emotes y reflexiones nocturnas, conservadas solo si pasaban la comprobación del juego. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en el dominio del juego, con respuestas fundamentadas en el estado visible compartido entre jugador y PNJ.
- Producción de memos de reglas tácticas if-then a partir de una lección en lenguaje natural (rol de entrenador).
- Generación de "voz" en personaje: movimiento más una línea corta de entre 1 y 8 palabras.
- Planificación diaria y selección de actividades para mentes de aldea.
- Generación de diálogos dirigidos a otros aldeanos, mascotas y al jugador.
- Emotes y reflexiones de cierre de jornada.
- Cumplimiento de las comprobaciones gramaticales y de validez internas del juego, sin necesidad de gramática externa en el 99,5% de los escenarios de prueba.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Ejecución local de PNJ en Mindworld: el modelo actúa como motor de comportamiento de las 1.927 mentes de aldea en la máquina del jugador, eliminando la dependencia de un servidor y permitiendo partidas sin conexión con un GGUF de 0,8 GB.
- Entrenador personal dentro del juego: convierte la lección en lenguaje natural del jugador en un memo de reglas if-then que el sistema de combate puede interpretar, con una tasa de validez del 99,5% en las pruebas held-out.
- Generación de diálogo contextualizado: respuestas de aldeanos fundamentadas en lo que el jugador y el PNJ pueden ver, útil para prototipar sistemas de diálogo con estado compartido en videojuegos narrativos.
- Generación de barras de voz y emotes: produce líneas de 1 a 8 palabras con movimiento asociado, adecuado para pipelines que necesiten texto breve y en personaje con restricciones estrictas de longitud.
- Prototipado de comportamiento de NPC en otros juegos: la técnica de destilación con filtrado por validadores del propio dominio es reutilizable para generar planes diarios y reflexiones en simulaciones sociales.
- Investigación sobre destilación de dominio con modelos pequeños: sirve como referencia de hasta qué punto un modelo de 1B ajustado con datos filtrados por el profesor puede igualar o superar a un profesor mayor en una tarea acotada (ver benchmarks más abajo).
- Despliegue en hardware modesto para demos: al ser un GGUF Q4_K_M de 0,8 GB, se puede servir con llama-server en portátiles o equipos sin GPU dedicada para demostraciones del juego.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre conjuntos held-out nunca vistos durante el entrenamiento:

| Prueba | Modelo | Resultado |
|---|---|---|
| Comprobaciones de aldea sin gramática (200 escenarios) | Mindworld 1B ajustado | 99,5% válido |
| Comprobaciones de aldea sin gramática (200 escenarios) | Mindworld 3B ajustado | 98,5% válido |
| Comprobaciones de aldea sin gramática (200 escenarios) | Llama 3.2 1B stock | 48,5% válido |
| Comprobaciones de aldea sin gramática (200 escenarios) | Versión 1B solo-coach previa | 82% válido |
| Teach (100 lecciones x 1.000 combates pareados) | Mindworld 1B ajustado | +22,6 puntos de tasa de victoria, 1 dañino |
| Teach (100 lecciones x 1.000 combates pareados) | Mindworld 3B ajustado | +21,5 puntos, 2 dañinos |
| Teach (100 lecciones x 1.000 combates pareados) | Profesor Muse Spark Open | +21,6 puntos |
| Teach (100 lecciones x 1.000 combates pareados) | Versión 1B solo-coach | +18,4 puntos, 3 dañinos |
| Teach (100 lecciones x 1.000 combates pareados) | Versión 3B solo-coach | +23,8 puntos |
| Voz | Mindworld 1B y 3B ajustados | 100% válido, líneas de 1 a 8 palabras |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,2 GB con Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp mediante llama-server (versión b11934 o superior, según la model card); al ser GGUF también es compatible con Ollama y otros runners basados en llama.cpp. No se documenta soporte de vLLM o TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Mindworld | 1,24B | no disponible | 99,5% validez en checks de aldea; +22,6 pts en Teach | Llama 3.2 Community | GGUF Q4_K_M en HF |
| Llama-3.2-1B-Instruct (stock) | 1,24B | 128.000 tokens | 48,5% validez en checks de aldea | Llama 3.2 Community | safetensors y GGUF en HF |
| Mindworld 3B ajustado (mencionado en la model card) | no disponible | no disponible | 98,5% validez; +21,5 pts en Teach | no disponible | no disponible en este repo |
| Muse Spark Open (profesor) | no disponible | no disponible | +21,6 pts en Teach | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: está ajustado con los prompts exactos de Mindworld; fuera de ese contexto su comportamiento no está caracterizado y probablemente degrade hacia el del Llama 3.2 1B base.
- Riesgo de alucinación en las reglas tácticas: la model card reporta 1 combate "dañino" de 100.000 en la versión 1B, es decir, memos que empeoran el resultado; en producción conviene mantener el validador del juego como red de seguridad.
- Idiomas no confirmados: no se especifica qué idiomas conserva el ajuste; el base Llama 3.2 soporta oficialmente 8 idiomas, pero el ajuste puede haber estrechado ese soporte a los prompts del juego.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones (incluida la política de uso aceptable en USE_POLICY.md y la obligación de atribución "Built with Llama"); requiere revisión legal antes de integrarlo en un producto.
- Única cuantización publicada (Q4_K_M): no hay versiones en precisión completa ni otras cuantizaciones en el repo, lo que limita la evaluación de la pérdida por cuantización.
- Contexto no documentado: aunque el base soporta 128.000 tokens, la model card no confirma el contexto efectivo tras el ajuste ni el máximo soportado por la configuración de llama-server recomendada.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/kysupo/Llama-3.2-1B-Mindworld-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://llama.meta.com/llama3_2/license/
- Política de uso aceptable: https://llama.meta.com/llama3_2/use-policy/
- llama.cpp (runner recomendado, b11934): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
