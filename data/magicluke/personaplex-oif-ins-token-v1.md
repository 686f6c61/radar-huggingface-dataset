# MagicLuke/personaplex-oif-ins-token-v1

## Resumen

PersonaPlex OIF (online instruction following) es un adaptador LoRA desarrollado por MagicLuke sobre el modelo base nvidia/personaplex-7b-v1 de NVIDIA. Su propósito es dotar a PersonaPlex, un modelo conversacional de voz a voz en tiempo real y full-duplex, de la capacidad de seguir instrucciones en lenguaje natural que se inyectan en mitad de la conversación, sin que el modelo se detenga a "leer" la instrucción. Esto permite modificar el comportamiento del asistente sobre la marcha, por ejemplo cambiar el tono, la temática o la tarea, manteniendo la fluidez del diálogo hablado.

El adaptador se entrena sobre los conjuntos de datos Fisher (con licencia LDC) y Seamless Interaction, y se distribuye como un repositorio de 32,6 GB con acceso restringido en HuggingFace. Al ser un adaptador LoRA, no modifica la arquitectura del modelo base, sino que añade pesos adicionales que se combinan con los del modelo original. La licencia es personaplex-derivative, lo que implica restricciones derivadas de la licencia de PersonaPlex.

La relevancia de este modelo radica en que aborda una limitación común en los asistentes de voz full-duplex: la imposibilidad de recibir comandos o cambios de contexto sin interrumpir la conversación. Con este adaptador, se puede dirigir al modelo de forma natural mientras habla, lo que abre casos de uso en atención al cliente, asistentes personales y sistemas de interacción por voz en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre PersonaPlex-7B (modelo de voz a voz full-duplex) |
| Parametros totales | No disponible (el adaptador añade pesos sobre los 7B del modelo base) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el entrenamiento usa Fisher, principalmente inglés) |
| Licencia | personaplex-derivative (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | No disponible (repositorio de 32,6 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

PersonaPlex es un modelo de speech-to-speech que procesa audio continuo codificado mediante un codificador neuronal y genera habla de forma simultánea, permitiendo interrupciones y backchannels. El adaptador OIF se entrena como un LoRA sobre este modelo base, añadiendo un token especial de instrucción (ins_token) que se inyecta en el flujo de audio. Durante el entrenamiento, se utilizan conversaciones de Fisher y Seamless Interaction, donde se insertan instrucciones en lenguaje natural en puntos aleatorios de la conversación. El objetivo es que el modelo aprenda a interpretar y ejecutar la instrucción sin pausar la generación de habla, manteniendo la coherencia del diálogo.

La innovación técnica principal es el uso de un token de instrucción en un modelo full-duplex, lo que permite un control dinámico del comportamiento sin necesidad de detener la conversación. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Conversación de voz a voz en tiempo real con full-duplex: el modelo puede hablar y escuchar simultáneamente, gestionando interrupciones y solapamientos.
- Seguimiento de instrucciones en línea: acepta comandos en lenguaje natural inyectados durante la conversación y los ejecuta sin pausar el habla.
- Control de persona: mediante prompts de texto y condicionamiento de voz, se puede definir el rol y la voz del asistente.
- Manejo de backchannels: responde con expresiones de confirmación o atención (por ejemplo, "ajá", "ya veo") de forma natural.
- Baja latencia: el modelo base de NVIDIA reporta una latencia de alrededor de 170 ms en su API, lo que permite interacciones fluidas.
- Multilingüe: no se especifican idiomas soportados, pero el entrenamiento con Fisher sugiere al menos inglés.

## Casos de uso

- Atención al cliente por voz: el modelo puede gestionar llamadas telefónicas completas, recibir instrucciones del agente humano en mitad de la conversación (por ejemplo, "cambia a un tono más formal" o "ofrece un descuento del 10%") y ejecutarlas sin interrumpir el diálogo con el cliente.
- Asistentes personales de voz: integrado en altavoces inteligentes o aplicaciones móviles, permite al usuario cambiar de tarea o tema sin reiniciar la conversación, por ejemplo "ahora ponme una alarma para las 7" mientras se discute otro asunto.
- Doblaje y localización en tiempo real: en retransmisiones o eventos en vivo, un operador puede dar instrucciones al modelo para ajustar el tono, el ritmo o el contenido del discurso generado.
- Simuladores de conversación para entrenamiento: en entornos de formación de personal, el modelo puede adoptar diferentes roles (cliente enfadado, paciente, etc.) y recibir instrucciones del formador para cambiar de escenario sobre la marcha.
- Sistemas de teleoperación robótica: un operador humano puede dirigir verbalmente a un robot asistente que utiliza PersonaPlex para comunicarse con otras personas, corrigiendo el comportamiento en tiempo real.
- Juegos y entretenimiento interactivo: personajes no jugables (NPC) que conversan con el jugador y pueden recibir instrucciones del director del juego para modificar su actitud o misión sin cortar la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base PersonaPlex reporta en su página de investigación que supera a sistemas existentes en dinámicas conversacionales y adherencia a tareas, pero no se proporcionan métricas numéricas específicas para este adaptador.

## Requisitos de hardware

- El adaptador LoRA se combina con el modelo base de 7B parámetros, por lo que se requiere una GPU con al menos 16 GB de VRAM para inferencia en FP16 (estimación razonable para un modelo de 7B, aunque no se especifica oficialmente).
- Para ejecución en tiempo real con baja latencia, se recomienda una GPU de gama alta como NVIDIA RTX 4090, A100 o H100.
- No se indica si el adaptador es compatible con cuantización (GGUF, etc.), por lo que se asume que se usa con el formato original del modelo base.
- Opciones de despliegue: el modelo base se puede servir con vLLM o TGI para inferencia optimizada, aunque al ser un modelo de audio, es probable que se necesite un pipeline específico. No se mencionan integraciones con llama.cpp u Ollama.
- La latencia reportada de ~170 ms corresponde a la API de PersonaPlex, no necesariamente a este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Full-duplex | Instrucciones en línea | Licencia |
|---|---|---|---|---|---|
| PersonaPlex-7B (base) | Voz a voz | 7B | Sí | No | NVIDIA (investigación) |
| PersonaPlex OIF (este adaptador) | Voz a voz + LoRA | 7B + adaptador | Sí | Sí | personaplex-derivative |
| Moshi (Kyutai) | Voz a voz | 7B | Sí | No | CC-BY-NC (no comercial) |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia de este adaptador es la capacidad de seguir instrucciones en línea, que no está presente en el modelo base ni en Moshi.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos o de investigación.
- Licencia derivada: la licencia personaplex-derivative impone restricciones adicionales sobre la licencia original de PersonaPlex, que no se detallan en la información disponible. Se recomienda revisar los términos antes de uso comercial.
- Sesgos y alucinaciones: al ser un modelo de habla, puede generar respuestas incorrectas o inventadas, especialmente en contextos de alta incertidumbre. No se han publicado evaluaciones de sesgo.
- Idiomas limitados: aunque no se especifica, el entrenamiento con Fisher (inglés) sugiere que el rendimiento en otros idiomas puede ser inferior.
- Dependencia del modelo base: el adaptador no funciona de forma independiente; requiere el modelo PersonaPlex-7B completo, lo que aumenta los requisitos de almacenamiento y cómputo.
- Sin documentación de benchmarks: no hay métricas públicas que validen la eficacia del adaptador en tareas de seguimiento de instrucciones, lo que dificulta la evaluación objetiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MagicLuke/personaplex-oif-ins-token-v1
- Código de PersonaPlex (NVIDIA): https://github.com/NVIDIA/personaplex
- Página de investigación de PersonaPlex: https://research.nvidia.com/labs/adlr/personaplex/
- API de PersonaPlex: https://personaplex.io/
