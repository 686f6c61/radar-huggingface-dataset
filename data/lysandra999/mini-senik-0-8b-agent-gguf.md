# Lysandra999/Mini-Senik-0.8B-Agent-GGUF

## Resumen

Mini-Senik-0.8B-Agent es un modelo compacto de 0,8B parámetros especializado en *function calling* y flujos agénticos, desarrollado por Nikolas Perez (usuario Lysandra999 en Hugging Face) como parte de la familia Senik AI. Se obtiene mediante un *fine-tuning* del modelo base `qvac/BotPsy-0.8B`, que a su vez sigue la arquitectura Qwen3.5. Su objetivo es cubrir tareas de uso de herramientas de dificultad baja a media en dominios de asistente personal, manteniendo un tamaño reducido apto para despliegue en CPU, dispositivos *edge* y placas tipo Jetson.

El modelo se distribuye exclusivamente en formato GGUF con dos cuantizaciones (Q4_K_M y Q8_0), lo que lo hace directamente consumible por llama.cpp y compatible con endpoints de inferencia. Su propuesta de valor se centra en la fiabilidad del *tool calling* estructurado en XML a un tamaño de 0,8B, un segmento donde la mayoría de modelos pequeños fallan al generar llamadas a funciones bien formadas.

La relevancia actual del modelo reside en la demanda de agentes locales de bajo coste que no requieran GPU dedicada. El autor reporta una precisión del 100% en 16 pruebas de *function calling* repartidas en 8 dominios, aunque se trata de una evaluación propia con un conjunto reducido de 28 sondas, por lo que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun la model card) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `qvac/BotPsy-0.8B`, un *checkpoint* de 752 millones de parámetros construido sobre la arquitectura Qwen3.5, según declara la model card. Sobre esa base se aplica un *fine-tuning* orientado a *function calling* y comportamiento agéntico, con el objetivo declarado de preservar la precisión de llamada a herramientas del modelo base (16/16 en 8 dominios) e incorporar además identidad propia del asistente, honestidad de alcance y defensas anti-*override* (8/8 en las pruebas de seguridad del autor).

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o preferencias. Tampoco se especifica la longitud de contexto nativa del modelo base ni innovaciones técnicas como decodificación especulativa o atención lineal. El único detalle técnico relevante es el uso de `enable_thinking=True` durante la evaluación, lo que sugiere soporte de modo de razonamiento heredado de la familia Qwen3.5.

## Capacidades

- Generación de texto conversacional en inglés con rol de asistente personal.
- *Function calling* y *tool calling* estructurado, con énfasis en llamadas en formato XML.
- Flujos agénticos de un solo paso y multi-paso de dificultad baja a media.
- Cobertura de 8 dominios de asistente: búsqueda web e investigación, viajes y estilo de vida, comercio y finanzas, operaciones de negocio y atención al cliente, control de dispositivos y vehículos, archivos y documentos, calendario, y correo electrónico y mensajería.
- Abstención ante llamadas a herramientas no pertinentes (negative tool abstention), con 3/4 en la evaluación del autor.
- Identidad de asistente definida y comportamiento de honestidad de alcance (reconoce cuándo una tarea excede sus capacidades y deriva a modelos mayores de la familia).
- Modo de razonamiento (`enable_thinking`) heredado de Qwen3.5.
- No se declaran capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- **Enrutamiento de herramientas en asistentes de voz locales**: el modelo puede decidir qué función invocar (calendario, correo, búsqueda) a partir de la transcripción del usuario, ejecutándose en CPU o en una Jetson gracias a su cuantización Q4_K_M de 510 MiB.
- **Automatización de atención al cliente de primer nivel**: gestión de conversaciones multi-turno con llamadas a APIs de pedidos, devoluciones o consulta de estado, dentro del dominio de operaciones de negocio que el autor evalúa con 2/2.
- **Agente de escritorio para gestión de archivos y documentos**: interpretación de instrucciones como mover, renombrar o resumir archivos, invocando herramientas del sistema operativo mediante *function calling* estructurado.
- **Asistente de agenda y correo en aplicaciones móviles**: creación de eventos, redacción de respuestas y clasificación de mensajes, aprovechando el bajo consumo de memoria del modelo para inferencia en dispositivo.
- **Control de dispositivos domésticos o de vehículo**: traducción de órdenes en lenguaje natural a llamadas de API sobre servicios de domótica o telemetría, un dominio que el autor reporta con precisión completa en sus pruebas.
- **Capa de preprocesado en pipelines agénticos mayores**: uso del modelo como router barato que clasifica la intención del usuario y decide si derivar la petición a un modelo mayor (por ejemplo, los Senik de 1,7B o 2B de la misma familia), reduciendo coste en las peticiones simples.
- **Prototipado rápido de agentes en local**: integración vía llama.cpp u Ollama para validar diseños de herramientas y esquemas de llamada antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en la model card, obtenidos con 28 sondas *held-out* sin solapamiento con entrenamiento y con `enable_thinking=True`. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Suite de evaluacion | Mini-Senik-0.3B | Base qvac/BotPsy-0.8B | Mini-Senik-0.8B-Agent (sin system) | Mini-Senik-0.8B-Agent (con system) |
|---|---|---|---|---|
| Function calling 8 dominios (16) | 0/16 | 16/16 | 16/16 (100%) | 16/16 (100%) |
| Abstención negativa (4) | 4/4 | 4/4 | 3/4 | 3/4 |
| Identidad, alcance y seguridad (8) | 7/8 | 1/8 | 8/8 (100%) | 8/8 (100%) |
| Total (28 sondas) | 11/28 (39,3%) | 21/28 (75,0%) | 27/28 (96,4%) | 27/28 (96,4%) |

Desglose por dominio del modelo Mini-Senik-0.8B-Agent: 2/2 en cada uno de los 8 dominios (búsqueda web, viajes, comercio y finanzas, operaciones de negocio, control de dispositivos y vehículos, archivos y documentos, calendario, correo y mensajería), tanto con como sin *system prompt*. El autor señala que la cuarta sonda de abstención (HTTP 404) se marcó como fallo únicamente por un comparador de subcadenas estricto, aunque la respuesta fue semánticamente correcta.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 0,5 GB para Q4_K_M (509,93 MiB en disco) y 0,8 GB para Q8_0 (774,23 MiB), más el *overhead* del contexto y del runtime de llama.cpp.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor cita una NVIDIA L4 para la evaluación del modelo base en BF16. También funciona en GPUs de consumo como GTX 1650, RTX 3050 o superiores.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada.
- **CPU y edge**: diseñado explícitamente para CPU y dispositivos *edge*; el autor menciona Jetson como destino para el enrutamiento de herramientas con Q4_K_M.
- **Opciones de despliegue**: llama.cpp (formato nativo), Ollama, y servidores compatibles con endpoints de inferencia (el repositorio incluye la etiqueta `endpoints_compatible`). vLLM y TGI no se mencionan y requerirían conversión a safetensors.
- **Latencia y throughput**: no disponibles; el autor no publica métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Mini-Senik-0.8B-Agent | 0,75B | No disponible | Function calling y agentes | Apache 2.0 | GGUF |
| qvac/BotPsy-0.8B (base) | 0,75B | No disponible | Asistente con emociones | No disponible | No disponible |
| Senik-Quantum-1.7B | 1,7B | No disponible | Modelo insignia edge | No disponible | GGUF |
| Senik-MiniCPM5-2B | 2B | 128K (según nombre del repo) | Contexto largo | No disponible | GGUF |
| Mini-Senik-0.3B | 0,3B | No disponible | Chat edge ultraligero | No disponible | GGUF |

La comparación se limita a los modelos de la propia familia Senik, ya que la información proporcionada no incluye alternativas externas con datos verificables. Frente al modelo base BotPsy-0.8B, Mini-Senik-0.8B-Agent iguala la precisión de *function calling* (16/16) y mejora notablemente las pruebas de identidad y seguridad (8/8 frente a 1/8), a costa de un fallo adicional en abstención negativa (3/4 frente a 4/4).

## Limitaciones y advertencias

- **Idioma**: solo inglés declarado; no hay evidencia de soporte multilingüe y el rendimiento en castellano no está evaluado.
- **Tamaño reducido**: el propio autor advierte que puede cometer errores en tareas difíciles y recomienda derivar codificación multiarchivo o demostraciones matemáticas profundas a modelos mayores de la familia.
- **Evaluación limitada**: los benchmarks son propios, con solo 28 sondas y sin comparación con modelos externos; no deben equipararse a resultados de benchmarks estándar.
- **Alucinación**: no se documentan tasas de alucinación ni estrategias de mitigación más allá de la abstención ante herramientas no pertinentes.
- **Formato de pesos**: solo se distribuye en GGUF; no hay safetensors publicados en el repositorio, lo que complica el *fine-tuning* adicional o el despliegue en vLLM/TGI sin conversión.
- **Contexto**: la longitud de contexto no está documentada, lo que impide planificar casos de uso con ventanas largas.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `qvac/BotPsy-0.8B` antes de desplegar en producción.
- **Madurez**: el repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta; es un modelo reciente sin validación externa por parte de la comunidad.
- **Sesgos**: no se documentan sesgos conocidos ni datos de evaluación al respecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lysandra999/Mini-Senik-0.8B-Agent-GGUF
- Modelo base: https://huggingface.co/qvac/BotPsy-0.8B
- Senik-Quantum-1.7B-GGUF: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF
- Senik-MiniCPM5-2B-GGUF: https://huggingface.co/Lysandra999/Senik-MiniCPM5-2B-GGUF
- Mini-Senik-0.3B-GGUF: https://huggingface.co/Lysandra999/Mini-Senik-0.3B-GGUF
- Senik-Kokoro-82M: https://huggingface.co/Lysandra999/Senik-Kokoro-82M
- Senik-Ming-3.0-TTS-0.5B: https://huggingface.co/Lysandra999/Senik-Ming-3.0-TTS-0.5B
- Senik-Whisper-Small: https://huggingface.co/Lysandra999/Senik-Whisper-Small
