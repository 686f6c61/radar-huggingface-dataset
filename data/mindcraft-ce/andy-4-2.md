# Mindcraft-CE/Andy-4.2

## Resumen

Andy-4.2 es un modelo de lenguaje de 9.650 millones de parámetros desarrollado por el equipo Mindcraft-CE, especializado en el control autónomo de agentes dentro del juego Minecraft. Se basa en la arquitectura Qwen3.5, concretamente en el modelo Qwen/Qwen3.5-9B, y ha sido fine-tuneado con técnicas de QLoRA y cuantización consciente del entrenamiento (QaT) para optimizar su rendimiento en tareas agénticas y de uso de herramientas. El modelo destaca por ser el primero local capaz de completar una partida de Minecraft obteniendo una armadura de diamante completa sin intervención humana.

La relevancia de Andy-4.2 radica en su capacidad para ejecutar razonamiento multi-paso, visión multimodal y tool calling en un entorno de juego complejo, todo ello con un tamaño contenido que permite su ejecución en una única GPU RTX 3090 con cuantización de 8 bits y hasta 256.000 tokens de contexto. Su innovación principal es la atención Gated Deltanet, que mejora la eficiencia computacional sin sacrificar precisión. Aunque está orientado a Minecraft, su arquitectura general lo hace potencialmente útil para otros entornos agénticos, aunque el autor advierte que no es adecuado para generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (con atención Gated Deltanet) |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | Hasta 1.000.000 tokens (según model card); 256.000 tokens en 8-bit con RTX 3090 |
| Tipos de cuantizacion | 8-bit (recomendado), 4-bit QLoRA (entrenamiento) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (según model card: "Andy 2.0 License", ver sección Limitaciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Andy-4.2 se construye sobre la arquitectura Qwen3.5, que incorpora la atención Gated Deltanet como innovación principal. Esta variante de atención reduce el coste computacional y la memoria necesaria, permitiendo ejecutar el modelo en una sola RTX 3090 con cuantización de 8 bits y una ventana de contexto de 256.000 tokens. El modelo mantiene capacidades multimodales (visión) heredadas de la base Qwen3.5, lo que le permite interpretar el estado visual del juego.

El entrenamiento se realizó mediante fine-tuning con QLoRA de 4 bits y cuantización consciente del entrenamiento (QaT) de 8 bits, sobre un dataset de 2.748 ejemplos. Se utilizó una única RTX 3090 durante 5 horas, con una tasa de aprendizaje de 2e-5, scheduler coseno y una sola época. El estilo de razonamiento (chain-of-thought) sigue el patrón de DeepSeek-R1, lo que favorece el razonamiento explícito y multi-paso. No se mencionan técnicas de RLHF o DPO en la información disponible.

## Capacidades

- Control autónomo de agentes en Minecraft: el modelo puede tomar decisiones y ejecutar acciones dentro del juego, como moverse, recolectar recursos, fabricar objetos y combatir.
- Tool calling / function calling: integrado con el sistema de acciones de Mindcraft-CE (p. ej., `!newAction`), permite al modelo invocar herramientas específicas del entorno.
- Razonamiento multi-paso: gracias al estilo CoT de DeepSeek-R1, el modelo descompone tareas complejas en pasos lógicos.
- Visión multimodal: puede procesar capturas de pantalla del juego para comprender el estado del mundo.
- Estabilidad conversacional: soporta hasta 120 mensajes de forma estable en sesiones de agente.
- Eficiencia en cuantización: diseñado para funcionar correctamente en 8 bits, preservando la calidad gracias a QaT.

## Casos de uso

- Automatización de partidas de Minecraft: el modelo puede jugar de forma autónoma, completando objetivos como obtener armadura de diamante sin intervención humana, ideal para pruebas de IA agéntica.
- Bots para servidores multijugador: desplegar Andy-4.2 como bot que interactúa con jugadores, realiza tareas de construcción o recolección, y responde a comandos.
- Investigación en IA agéntica: sirve como banco de pruebas para estudiar razonamiento multi-paso, planificación y uso de herramientas en entornos simulados.
- Asistente de juego para streamers: puede actuar como copiloto que sugiere estrategias o ejecuta acciones en tiempo real durante retransmisiones.
- Evaluación de modelos de visión y lenguaje: al combinar visión y lenguaje, permite probar la comprensión de escenas dinámicas en un entorno 3D.
- Entrenamiento de agentes por refuerzo: el modelo puede usarse como política base o como generador de datos para entrenar agentes más especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones cuantitativas con otros modelos. El único dato de rendimiento es cualitativo: el modelo logra completar una partida de Minecraft con armadura de diamante sin intervención humana, y se afirma que rivaliza con modelos 10 veces mayores, pero sin datos concretos que lo respalden.

## Requisitos de hardware

- VRAM estimada: según la model card, el modelo corre en una RTX 3090 (24 GB) con cuantización de 8 bits y 256.000 tokens de contexto. No se especifica la VRAM exacta consumida, pero con 9,65B parámetros en 8 bits se estima un uso de aproximadamente 10-12 GB, más la memoria para el contexto largo.
- GPU recomendadas: RTX 3090 (mínimo verificado), GPUs con 24 GB o más (RTX 4090, A100, etc.) para mayor margen.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama alta de consumo (RTX 3090/4090) con cuantización de 8 bits.
- Opciones de despliegue: se recomienda LM Studio. El autor advierte que Ollama presenta problemas de bucles y plantillas de chat incorrectas, por lo que no se recomienda. No se mencionan vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (agentes para Minecraft o modelos de 9B). El autor menciona que rivaliza con modelos 10 veces mayores, pero no se especifican nombres ni métricas.

## Limitaciones y advertencias

- Rendimiento deficiente en construcción: durante las pruebas, el modelo generaba miles de tokens al usar `!newAction` sin ejecutar ninguna acción real. No se recomienda como modelo de código.
- Licencia: la model card menciona una "Andy 2.0 License" con términos permisivos pero con calificadores sobre qué constituye un modelo de clase "Andy". El texto completo no está disponible en la información proporcionada, por lo que se debe revisar el archivo LICENSE del repositorio antes de uso comercial.
- Idioma: solo soporta inglés, lo que limita su uso en entornos multilingües.
- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero al ser un modelo fine-tuneado sobre un dataset pequeño (2.748 ejemplos), puede presentar alucinaciones en contextos fuera de Minecraft.
- Estabilidad en sesiones largas: aunque soporta 120 mensajes estables, no se garantiza un comportamiento correcto más allá de ese límite.
- Dependencia de Mindcraft-CE: el modelo está optimizado para la versión 1.2.7 de Mindcraft-CE; cambios en la plataforma pueden afectar su rendimiento.

## Enlaces

- [HuggingFace: Mindcraft-CE/Andy-4.2](https://huggingface.co/Mindcraft-CE/Andy-4.2)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B) (enlace inferido, no verificado en la información proporcionada)
