# bdougie/smollm3-pokemon-forger-lora

# Ficha del modelo bdougie/smollm3-pokemon-forger-lora

## Resumen

El modelo `bdougie/smollm3-pokemon-forger-lora` es un adaptador LoRA (Low-Rank Adaptation) de tipo PEFT, construido sobre el modelo base `HuggingFaceTB/SmolLM3-3B`. Ha sido desarrollado por el usuario `bdougie` y forma parte del proyecto `pcc-labs/pokemon-kafka`, cuyo objetivo es analizar y clasificar eventos del juego Pokémon Red a partir de observaciones directas de la cartuchera (sprite, pantalla, bolsa, estructura de combate). El modelo resuelve una tarea muy específica: dado el contexto de una interacción en el juego, debe identificar qué tipo de entidad es (NPC, entrenador, objeto, bloqueo) y qué resultado produce la conversación (hablar, luchar, entregar, puerta, bloqueo, obsoleto), además de detectar frases de rechazo del juego y handoffs de operador.

Se trata de un modelo de nicho, entrenado mediante SFT (supervised fine-tuning) sobre 1.333 filas del dataset `bdougie/pokemon-red-sft`. El adaptador utiliza LoRA con rango 32 en las proyecciones q, k, v, o, gate, up y down del transformer base. No es un modelo generalista de chat ni de razonamiento; su valor radica en la precisión para una tarea de extracción de información estructurada en un dominio de videojuego retro. La relevancia actual de este modelo es metodológica: demuestra cómo adaptar un LLM pequeño de 3B parámetros a una tarea altamente especializada con un conjunto de datos mínimo, sin necesidad de entrenar desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base SmolLM3-3B) con adaptador LoRA (rango 32 en q, k, v, o, gate, up, down) |
| Parametros totales | 3.075.098.624 (corresponden al modelo base; el adaptador LoRA añade un número menor de parámetros entrenables) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Safetensors (bf16) y GGUF (detalles de cuantización no disponibles) |
| Idiomas soportados | no disponible (el adaptador está entrenado con textos en inglés de Pokémon Red) |
| Licencia | no disponible |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base es `HuggingFaceTB/SmolLM3-3B`, un transformer de 3.000 millones de parámetros. Sobre este se aplica un adaptador LoRA con rango 32, lo que permite ajustar las capas de atención (q, k, v, o) y de la MLP (gate, up, down) sin modificar los pesos originales. El adaptador fue entrenado con la herramienta `autotune.train_sft` del repositorio `pcc-labs/empirical-evidence`, durante 3 épocas sobre un total de 1.333 filas del dataset `bdougie/pokemon-red-sft`. La composición de los datos es: 1.318 filas de diálogo de NPC, 82 de texto de puerta (gate-text) y 81 de handoff de operador. Cada fila se obtiene de una ejecución real en cartucho, incluyendo la tabla de sprites, la pantalla, la bolsa y la estructura de combate. No se utilizan datos de hechos del juego recordados manualmente, sino mediciones directas. No se ha aplicado RLHF ni DPO; el entrenamiento es exclusivamente de ajuste supervisado.

## Capacidades

- Clasificación de entidades en Pokémon Red: identifica si una interacción corresponde a un NPC, entrenador, objeto o bloqueo (blocker), a partir de la posición del cuerpo, el sprite y la frase mostrada en pantalla.
- Predicción del resultado de la interacción: determina si la conversación produce una charla (talk), un combate (fought), entrega de objeto (handed), apertura de puerta (gate), bloqueo (blocker) o contenido obsoleto (stale).
- Detección de texto de rechazo (gate-text): reconoce frases del juego que indican que una acción no es posible, con una precisión del 100% en el conjunto de validación del autor.
- Soporte de handoffs de operador: identifica los puntos donde la interacción pasa a ser gestionada por un operador humano.
- No es un modelo de generación de texto libre ni de conversación; su salida es una etiqueta o clasificación estructurada.
- No soporta tool calling, function calling ni razonamiento multi-paso fuera del dominio específico para el que fue entrenado.

## Casos de uso

- Análisis de diálogos de NPC en Pokémon Red: el modelo puede etiquetar automáticamente cada interacción con un NPC a partir de la posición, sprite y texto en pantalla, determinando si es un NPC, entrenador, objeto o bloqueo, y qué resultado produce. Es adecuado porque está entrenado específicamente con mediciones reales del juego, lo que reduce errores frente a un modelo generalista.
- Automatización de pruebas de regresión en ROM hacks: al modificar el juego, se puede usar el modelo para verificar que los diálogos y encuentros siguen comportándose como en el original, detectando cambios en los resultados. Su precisión en gate-text (1.00) y en body (0.82) lo hace útil para validar que las puertas y bloqueos se mantienen.
- Generación de bases de datos de contenido para wikis y guías: el modelo puede extraer información estructurada de capturas de pantalla del juego, facilitando la creación de listas de objetos, entrenadores y eventos. Al ser un adaptador ligero, puede ejecutarse en lotes sobre muchas capturas sin necesidad de gran infraestructura.
- Asistencia en speedrunning: el modelo puede identificar rápidamente qué acción espera un NPC o qué puerta está bloqueada, ayudando a planificar rutas. Su bajo coste de inferencia permite su uso en tiempo real durante una partida.
- Clasificación de eventos en streams: un bot puede usar el modelo para analizar en tiempo real las interacciones del jugador y etiquetar los eventos para overlays o estadísticas. La salida es una etiqueta simple, fácil de integrar en un pipeline de streaming.
- Investigación de IA aplicada a videojuegos: el modelo sirve como ejemplo de adaptación de un LLM pequeño a una tarea de extracción de información estructurada a partir de observaciones de un juego, sin necesidad de entrenar un modelo desde cero. Es adecuado para experimentos de fine-tuning con conjuntos de datos mínimos.

## Benchmarks y rendimiento

Los resultados presentados por el autor se refieren a un conjunto de validación held-out de 148 filas (gate). Se comparan el modelo base `SmolLM3-3B` y el adaptador afinado, junto con la clase mayoritaria como referencia.

| Métrica | Base | Afinado | Mayoría |
|---|---|---|---|
| npc-dialogue/body | 0.21 | 0.82 | - |
| npc-dialogue/outcome | 0.33 | 0.66 | 0.49 (siempre "talk") |
| gate-text/gate | 0.00 | 1.00 | - |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 requiere aproximadamente 6-8 GB de VRAM para los pesos, más overhead de activaciones y cache KV. El adaptador LoRA añade un pequeño overhead adicional. Con cuantización GGUF (por ejemplo, Q4_K_M), la VRAM necesaria puede reducirse a 2-3 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, A10G, A100. En GPUs de consumo, una RTX 3060 12GB es suficiente para ejecutar el modelo en bf16 con contexto moderado.
- Opciones de despliegue: Hugging Face Transformers con PEFT, vLLM, llama.cpp, Ollama, TGI. El adaptador LoRA puede cargarse sobre el modelo base con la librería `peft`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| bdougie/smollm3-pokemon-forger-lora | 3B (base) + adaptador LoRA | no disponible | no disponible | Clasificación de diálogos y eventos en Pokémon Red |
| HuggingFaceTB/SmolLM3-3B (base) | 3B | no disponible | no disponible | Modelo de lenguaje general |
| bdougie/smollm3-forest-lora | 3B (base) + adaptador LoRA | no disponible | no disponible | Adaptador LoRA para otra tarea del mismo proyecto pokemon-kafka |

El modelo se diferencia del base en que está afinado para una tarea concreta de extracción de información, mientras que el base es un modelo generalista. Respecto a `smollm3-forest-lora`, ambos comparten la misma arquitectura base y el mismo proyecto, pero están especializados en dominios distintos del juego. No se dispone de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- El modelo está entrenado con un conjunto de datos muy pequeño (1.333 filas) y altamente específico de Pokémon Red, por lo que su capacidad de generalización a otros juegos o tareas es limitada.
- Riesgo de alucinación si se le presentan entradas fuera de la distribución de entrenamiento, como sprites o frases que no aparecen en el dataset original.
- No es un modelo de chat ni de generación de texto libre; no debe usarse para conversación general o tareas creativas.
- La licencia no está disponible, lo que puede impedir su uso comercial o su redistribución sin permiso explícito del autor.
- Depende del modelo base `HuggingFaceTB/SmolLM3-3B`; es necesario cargar ambos para la inferencia, lo que aumenta los requisitos de memoria y el tiempo de arranque.
- No se proporcionan métricas de robustez frente a variaciones de sprites, cambios de texto o condiciones de pantalla distintas a las del dataset.
- Los benchmarks presentados son del autor y se basan en un conjunto de validación de 148 filas; no hay evidencia independiente de su rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/bdougie/smollm3-pokemon-forger-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/bdougie/pokemon-red-sft
- Repositorio del proyecto: https://github.com/pcc-labs/pokemon-kafka
- Herramienta de entrenamiento: https://github.com/pcc-labs/empirical-evidence
- Whitepaper "Training an Archetype": https://github.com/pcc-labs/pokemon-kafka/blob/main/docs/whitepapers/training-an-archetype.md
- Documentación del adaptador: https://github.com/pcc-labs/empirical-evidence/blob/main/docs/forger-adapter.md
