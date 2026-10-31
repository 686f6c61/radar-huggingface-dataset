# Heelees/HeeLee-Flash-v1.1

## Resumen

HeeLee Flash v1.1 es un modelo de lenguaje ligero y conversacional creado por el desarrollador independiente Heelees, disponible en Hugging Face. Se trata de un fine-tuning mediante QLoRA del modelo Qwen2.5-1.5B-Instruct, con una personalidad distintiva: una tortuga de IA "sassy" y sarcástica orientada a programadores y usuarios que disfrutan del roleplay con toques de humor. El modelo está pensado para ejecutarse localmente en equipos de gama baja, con un tamaño de aproximadamente 1 GB en formato GGUF cuantizado.

Su relevancia es principalmente de nicho: demuestra cómo un entusiasta puede adaptar un modelo base pequeño y de calidad (Qwen2.5 1.5B) para un caso de uso concreto (asistente de programación con personalidad y roleplay) sin necesidad de infraestructura costosa. No es un modelo de propósito general ni pretende competir en benchmarks; su valor está en la experimentación local, demos ligeras y como ejemplo de fine-tuning accesible con Apache 2.0 como licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE; presumiblemente denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct, probablemente 32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Ruso (principal en el fine-tuning), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), ~1 GB |

## Arquitectura y entrenamiento

HeeLee Flash v1.1 parte de Qwen2.5-1.5B-Instruct, un modelo transformer decoder-only de la familia Qwen de Alibaba. El ajuste fino se realizó mediante QLoRA (Quantized Low-Rank Adaptation), una técnica que congela los pesos base y entrena adaptadores de bajo rango sobre un modelo cuantizado, reduciendo drásticamente los requisitos de memoria de entrenamiento. Esto permite que el entrenamiento se haya realizado, según el autor, de forma individual y por un solo entusiasta.

Los datos de entrenamiento provienen de un dataset personalizado no documentado públicamente: no se ha publicado el número de tokens, la composición del dataset ni los hiperparámetros del entrenamiento. El modelo está orientado principalmente al ruso (idioma principal del fine-tuning), aunque conserva comprensión del inglés y capacidad de generación de código heredadas del modelo base. No hay indicios de entrenamiento adicional con RLHF/DPO más allá del alineamiento original de Qwen2.5-Instruct.

## Capacidades

- Generación de texto conversacional con una personalidad específica (sarcasmo, respuestas breves y estilo "sassy"), activable mediante un system prompt concreto.
- Generación de código: el autor indica que el modelo "escribe código perfectamente", heredando esta capacidad de Qwen2.5-1.5B-Instruct.
- Comprensión y generación en ruso (idioma principal del fine-tuning) e inglés.
- Roleplay y chat multi-turno orientado al entretenimiento de programadores.
- Uso de emojis en las respuestas como parte de su estilo definido.
- Ejecución 100 % local en hardware de gama baja gracias a su tamaño reducido (~1 GB en Q4_K_M).
- No hay evidencia de soporte de tool calling, function calling, agentes, visión ni audio en este fine-tuning.

## Casos de uso

- Asistente de programación con personalidad en local: el modelo puede responder dudas de código con sarcasmo y brevedad, ideal para quien quiere un compañero de chat divertido sin depender de la nube.
- Roleplay conversacional ligero: su fine-tuning con estilo definido lo hace adecuado para chats de entretenimiento con personajes, especialmente en ruso.
- Práctica del ruso para desarrolladores: al estar afinado principalmente en ruso, puede usarse como interlocutor informal en ese idioma.
- Experimentación con fine-tuning QLoRA: sirve como ejemplo real y descargable de cómo adaptar Qwen2.5-1.5B con QLoRA y publicar en GGUF.
- Demostraciones y prototipos en hardware modesto: con ~1 GB de pesos, cabe en portátiles sin GPU dedicada, útil para demos en portátiles antiguos o Raspberry Pi de gama alta (con rendimiento limitado).
- Bot de chat integrado en aplicaciones pequeñas: su tamaño permite incrustarlo en aplicaciones de escritorio vía LM Studio u Ollama sin apenas consumo de recursos.
- Aprendizaje de despliegue local de LLMs: buen modelo de entrada para aprender a usar LM Studio, Ollama y formatos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fine-tuning de personalidad sobre Qwen2.5-1.5B-Instruct, el rendimiento en tareas generales debería ser cercano al del modelo base, aunque el fine-tuning en ruso podría haber degradado parcialmente el rendimiento en otros idiomas (no hay datos que lo confirmen ni lo desmientan).

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: aproximadamente 1,0–1,5 GB en Q4_K_M; el modelo puede ejecutarse incluso solo con CPU y RAM convencional.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con 2 GB de VRAM o más lo ejecutará con holgura (por ejemplo, GTX 1650, RTX 3050 o superiores).
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU doméstica moderna, e incluso funciona sin GPU en equipos de gama baja, como indica el propio autor.
- Opciones de despliegue: LM Studio y Ollama (recomendados por el autor), además de cualquier runtime compatible con GGUF como llama.cpp.
- Latencia y throughput estimados: no disponible; por su tamaño (~1,5 B parámetros en Q4_K_M) cabe esperar respuestas rápidas incluso en CPUs modestas, típicamente decenas de tokens por segundo en hardware doméstico.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| HeeLee Flash v1.1 | ~1,54 B | GGUF (Q4_K_M) | Apache 2.0 | Chat con personalidad, código, ruso/ingles |
| Qwen2.5-1.5B-Instruct (base) | ~1,54 B | Safetensors, GGUF | Qwen Research / Apache 2.0 (según version) | Modelo general multiidioma |
| TinyLlama-1.1B-Chat | ~1,1 B | Safetensors, GGUF | Apache 2.0 | Modelo general ligero |
| Phi-3-mini (3.8B) | ~3,8 B | Safetensors, GGUF | MIT | Razonamiento y codigo en modelo pequeño |

Frente a su modelo base, HeeLee Flash aporta una personalidad definida y optimización para ruso, a costa de posible pérdida de generalidad. Frente a TinyLlama-1.1B-Chat, ofrece mejor herencia de capacidades de código gracias a Qwen2.5. Phi-3-mini es más capaz en razonamiento pero requiere el triple de recursos.

## Limitaciones y advertencias

- Idioma: el fine-tuning está orientado al ruso; el rendimiento en español o en otros idiomas no está garantizado y probablemente sea inferior al del modelo base Qwen2.5.
- Dependencia del system prompt: el estilo del modelo solo se manifiesta si se usa el system prompt específico indicado por el autor; sin él, el comportamiento puede ser genérico o incoherente con la personalidad.
- Alucinaciones: como todo modelo de 1,5 B parámetros, es propenso a alucinaciones, especialmente en hechos, fechas y bibliotecas de código; no debe usarse como fuente de verdad sin verificación.
- Capacidades limitadas: al ser un modelo muy pequeño, su razonamiento complejo, matemáticas avanzadas y generación de código largo serán notablemente inferiores a los de modelos de 7 B o superiores.
- Documentación escasa: no se han publicado datos de entrenamiento, benchmarks ni evaluaciones; la calidad del fine-tuning no está verificada independientemente.
- Uso de emojis en las respuestas: puede no ser adecuado para entornos profesionales o pipelines automatizados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también la licencia del modelo base Qwen2.5 para usos en producción.
- Comunidad muy pequeña (31 descargas y 1 like en el momento de la ficha): escaso soporte, pocas revisiones y riesgo de abandono del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Heelees/HeeLee-Flash-v1.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- LM Studio (entorno de ejecución recomendado): https://lmstudio.ai/
- Ollama (entorno de ejecución recomendado): https://ollama.com/
- Paper, repositorio de entrenamiento y demos: no disponible
