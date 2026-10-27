# jonsnowshiteblacklol/Llama-3.2-1B-Lily-GGUF

## Resumen

Llama-3.2-1B-Lily-GGUF es un ajuste fino (fine-tune) del modelo meta-llama/Llama-3.2-1B-Instruct, publicado por el usuario jonsnowshiteblacklol, que convierte un modelo de lenguaje generalista de 1.235.814.432 parámetros en el "cerebro" de Lily, un personaje no jugador (NPC) del juego de navegador *My Little Sister Can't Drive*. El modelo no responde con texto libre: recibe el estado del coche y lo que dice el jugador, y devuelve un único objeto JSON con la frase del personaje, su estado de ánimo y órdenes de control (`target_speed`, `lane`, `honk`). Resuelve, por tanto, el problema de dotar de diálogo reactivo y estructurado a un personaje de videojuego sin depender de una API en la nube.

Técnicamente es un transformer decoder-only de la familia Llama 3.2 (aproximadamente 1,24 mil millones de parámetros, denso, no MoE), ajustado mediante LoRA de rango 16 sobre todas las proyecciones de atención y MLP durante 2 épocas, con los pesos fusionados en el checkpoint final y cuantizados a GGUF Q4_K_M (unos 770 MB). Esto permite ejecutarlo íntegramente en local, tanto en escritorio con llama.cpp como dentro del navegador mediante wllama y WebGPU, que es exactamente el escenario para el que se diseñó.

Su relevancia es acotada pero ilustrativa: es un ejemplo de cómo un modelo de 1B puede especializarse en una tarea estrecha con tan solo ~2.200 ejemplos de entrenamiento y empaquetarse para inferencia en el cliente. Conviene subrayar que, en el momento de la consulta, el repositorio no registra descargas ni likes, no publica benchmarks y no ofrece documentación sobre idiomas o cuantizaciones alternativas; es un artefacto de nicho, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2 (atención con GQA, RMSNorm, activación SwiGLU, RoPE); fine-tune LoRA fusionado en los pesos |
| Parámetros totales | 1.235.814.432 (≈1,24 B), dato real de safetensors |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens según la configuración del modelo base; no re-verificado para este fine-tune ni documentado en la model card |
| Tipos de cuantización | GGUF Q4_K_M (≈770 MB) es la única publicada; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponibles. Los datos de ajuste están en inglés; el modelo base declara soporte para 8 idiomas, pero el fine-tune no documenta evaluación multilingüe |
| Licencia | Llama 3.2 Community License (Copyright © Meta Platforms, Inc.) |
| Formato de pesos | GGUF (llama.cpp / wllama); el repositorio ocupa 0,8 GB |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de la familia Llama 3.2, con atención de consultas agrupadas (GQA), normalización RMSNorm por capa, activación SwiGLU en el bloque feed-forward y embeddings posicionales rotatorios (RoPE). Sobre esa base se aplicó un LoRA de rango 16 en todas las proyecciones de atención y MLP, entrenado durante 2 épocas y posteriormente fusionado en los pesos, de modo que el artefacto final no requiere adaptadores separados. El checkpoint resultante se cuantizó a Q4_K_M para su uso con llama.cpp y wllama.

El corpus de entrenamiento lo componen aproximadamente 2.200 respuestas escritas por un modelo mayor (Claude Haiku) interpretando a Lily en lecciones de conducir simuladas y en respuestas a instrucciones puntuales particularmente difíciles. Las frases reservadas para evaluación se filtraron explícitamente del conjunto de entrenamiento, aunque la model card no detalla el tamaño ni la composición de ese conjunto de evaluación. No se documenta ninguna fase de RLHF o DPO, ni innovaciones de decodificación (decodificación especulativa, atención lineal), ni datos sobre el número total de tokens vistos durante el ajuste.

La innovación real no está en la arquitectura, sino en el formato de interacción: se usa la plantilla de chat de Llama 3.2 con un system prompt que define la persona y el esquema JSON de respuesta, y turnos de usuario con el formato `[Car] speed 30 km/h (target 30), lane: right, strikes: 0/3.` seguido de `[Your sibling says] "..."`. El modelo aprende así a mapear estado estructurado más lenguaje natural a una acción de control tipada.

## Capacidades

- Generación de diálogo de personaje en inglés con un tono concreto (Lily), incluyendo respuestas breves y coloquiales.
- Salida estructurada en un único objeto JSON con los campos `say` (texto), `mood` (estado de ánimo), `target_speed` (numérico), `lane` (valor de carril o `null`) y `honk` (booleano).
- Interpretación de estado del entorno serializado en texto: velocidad actual, velocidad objetivo, carril y contador de fallos (`strikes`).
- Respuesta a instrucciones puntuales del jugador dentro de la ficción ("Ducks crossing! Stop the car!"), incluyendo instrucciones incómodas o contradictorias.
- Coherencia entre la emoción declarada y la orden de control emitida (por ejemplo, `mood: annoyed` con una orden de aceleración obediente).
- Capacidad conversacional multi-turno heredada de la plantilla de chat de Llama 3.2, aunque el fine-tune está orientado a turnos con estado inyectado.
- Tool calling / function calling nativo: no disponible; el equivalente funcional es el JSON de salida, que actúa como llamada a acciones del juego.
- Soporte de agentes y razonamiento multi-paso: no disponible ni previsto en el diseño.
- Capacidades de visión o audio: no disponible.
- Capacidades multilingües: no verificadas; el ajuste se hizo en inglés.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- **NPC conversacional en un videojuego de navegador**: el caso de uso original. El modelo se carga vía wllama/WebGPU en el cliente, recibe el estado del vehículo en cada frame lógico y devuelve el JSON de acción, sin coste de API ni latencia de red. Es adecuado porque el tamaño de 770 MB permite la descarga inicial y la inferencia en el propio navegador.
- **Prototipado rápido de personajes con personalidad**: sirve como plantilla para validar si un personaje con voz propia mejora la experiencia antes de invertir en un modelo mayor; el LoRA de rango 16 y 2.200 ejemplos demuestran que el coste de especialización es bajo.
- **Generación de JSON estructurado en entornos con recursos mínimos**: cualquier aplicación que necesite mapear lenguaje natural a un objeto de acciones tipadas (control de domótica, mandos de juego, formularios) puede reutilizar el patrón, aunque requeriría reentrenar el esquema de salida.
- **Pruebas automatizadas de sistemas de diálogo**: al devolver una estructura fija, el modelo se puede usar como generador de respuestas en tests de integración del motor de juego, verificando que el parser de JSON y la lógica de control aceptan variantes de salida.
- **Demostraciones educativas de fine-tuning y despliegue en el borde**: un caso completo y reproducible de extremo a extremo (LoRA, fusión, cuantización Q4_K_M, ejecución en CPU o WebGPU) para cursos y talleres sobre modelos pequeños.
- **Ejecución en hardware restringido o sin conectividad**: al caber en menos de 1 GB de pesos, puede desplegarse en Raspberry Pi, mini-PC o portátiles sin GPU dedicada, útil para instalaciones interactivas o kioscos offline.
- **Investigación sobre fidelidad de personaje y desviación de formato**: permite medir con qué frecuencia un modelo de 1B rompe un esquema JSON estricto bajo presión de contexto, un dato relevante para el diseño de sistemas con salida estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluación de fidelidad al personaje | no disponible (la model card menciona un conjunto de evaluación, pero no publica métricas) |
| Tasa de cumplimiento del esquema JSON | no disponible |
| Latencia / throughput | no disponible |

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB para los pesos en Q4_K_M (≈770 MB); en la práctica, entre 1 y 2 GB contando la caché KV y el overhead del runtime, en función de la longitud de contexto configurada.
- **GPU recomendadas**: cualquier GPU consumer con 2 GB o más de VRAM es suficiente (GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090); también es viable en GPUs integradas con soporte de WebGPU. Para despliegues en servidor no tiene sentido usar A100 o H100: el modelo está limitado por latencia, no por cómputo.
- **Compatibilidad con GPU consumer**: sí, en todas las GPU consumer actuales e incluso en iGPU; también funciona en CPU exclusivamente, lo que es el modo previsto para escritorio.
- **Opciones de despliegue**: llama.cpp (binario `llama-cli` o servidor), wllama en el navegador con WebGPU, llama-cpp-python, Ollama (importando el GGUF), LM Studio. vLLM solo mediante su soporte GGUF experimental; TGI no soporta GGUF de forma nativa.
- **Latencia y throughput**: no disponibles. No se han publicado medidas de tokens por segundo ni de tiempo de respuesta por turno; dado el tamaño, se espera decodificación interactiva en CPU moderna y en WebGPU, pero no hay cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formatos |
|---|---|---|---|---|---|
| Llama-3.2-1B-Lily-GGUF | 1,24 B | 128.000 (heredado del base, no verificado) | NPC de juego con salida JSON cerrada | Llama 3.2 Community License | GGUF Q4_K_M |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Asistente generalista, multilingüe | Llama 3.2 Community License | safetensors, GGUF (comunidad) |
| Qwen2.5-1.5B-Instruct | ≈1,5 B | 32.768 | Asistente generalista, buen rendimiento en código y matemáticas para su tamaño | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B IT | ≈2,6 B | 8.192 | Asistente generalista | Gemma Terms of Use | safetensors, GGUF |

Los datos de los modelos comparables provienen de la documentación pública de sus respectivos autores y no se han verificado en esta consulta. La diferencia clave de Lily no es de rendimiento —no hay métricas publicadas— sino de alcance: frente a los modelos generalistas de la misma franja, sacrifica amplitud y multilingüismo a cambio de una salida estructurada fiable para una única tarea. Su licencia es más restrictiva que la Apache 2.0 de Qwen2.5.

## Limitaciones y advertencias

- **Modelo de nicho, no un asistente**: la propia model card lo declara explícitamente. No debe usarse para preguntas generales, código, matemáticas ni, mucho menos, consejo real sobre conducción.
- **Riesgo de alucinación y de deriva de personaje**: con 1,24 B de parámetros y solo ~2.200 ejemplos de ajuste, es esperable que el modelo invente detalles fuera de la ficción o pierda el registro de Lily en conversaciones largas. No se han publicado métricas que cuantifiquen esta tasa.
- **Ruptura del esquema JSON**: no hay datos sobre la fiabilidad del formato de salida. En producción es obligatorio validar y parsear con tolerancia a fallos, y prever una respuesta de reserva.
- **Idioma**: el ajuste se realizó en inglés; no hay evidencia de que responda correctamente en castellano ni de que mantenga la estructura JSON en otros idiomas.
- **Contexto no verificado**: los 128.000 tokens son la especificación del modelo base; el fine-tune no documenta haber sido entrenado ni evaluado con contextos largos, por lo que no se debe asumir ese límite en la práctica.
- **Restricciones de licencia**: se hereda la Llama 3.2 Community License, que exige mantener la atribución "Built with Llama", incluir el texto de la licencia, respetar la política de uso aceptable de Meta y renombrar el modelo si se modifica y se distribuye. Existe una cláusula de escala (700 millones de usuarios activos mensuales) que obligaría a solicitar licencia adicional a Meta.
- **Ausencia de tracción y soporte**: cero descargas y cero likes en el momento de la consulta, sin paper, sin demo y sin issues documentados. No hay garantía de mantenimiento ni de corrección de errores.
- **Licencia del material de entrenamiento**: los datos fueron generados por otro modelo (Claude Haiku); la model card no detalla las condiciones de uso de esas salidas, lo que conviene revisar antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonsnowshiteblacklol/Llama-3.2-1B-Lily-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable de Meta: https://www.llama.com/llama3_2/use-policy/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- wllama (llama.cpp para navegador): https://github.com/ngxson/wllama
