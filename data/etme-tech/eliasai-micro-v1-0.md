# ETME-TECH/EliasAI-Micro-v1.0

## Resumen

EliasAI-Micro-v1.0 es un ajuste fino (fine-tune) de tipo conversacional en alemán desarrollado por ETME-TECH (Elias Rickert) sobre el modelo base Qwen/Qwen3.5-0.8B-Base. Con 1.006.672.704 parámetros totales según los pesos en safetensors, está diseñado explícitamente para inferencia local en hardware muy limitado, como una Raspberry Pi o CPU de gama baja, y se distribuye tanto en bfloat16 (safetensors) como en cuantizaciones GGUF Q8_0 y Q4_K_M listas para llama.cpp, LM Studio y Ollama.

El modelo no compite en capacidades generales: su propio autor lo describe como un sistema orientado exclusivamente a la comprensión conversacional y la escucha activa, con una personalidad definida (una IA masculina que habla desde una perspectiva terrenal) y un modo de razonamiento previo en alemán dentro de bloques `<think>...</think>`. No está pensado para matemáticas, conocimiento factual, programación ni cálculos.

Su relevancia actual radica en dos factores: la licencia Apache 2.0 heredada del modelo base, que permite uso comercial sin restricciones adicionales, y su huella mínima, que lo hace viable en entornos de borde donde otros modelos no caben. El contexto de entrenamiento declarado en los ejemplos de despliegue es de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de despliegue del autor; no se declara contexto máximo nativo) |
| Tipos de cuantizacion | bfloat16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (merged, en bfloat16) sobre Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 1.000 millones de parámetros. No se dispone de información sobre la composición exacta del dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. La model card solo indica que los datos consisten en diálogos alemanes de uno y varios turnos cubriendo conversación cotidiana, smalltalk, subtexto emocional expresado mediante emoticonos, charla técnica e identidad del personaje.

La innovación técnica destacable es el formato de entrenamiento: cada respuesta se genera precedida de un bloque `<think>...</think>` en alemán donde el modelo interpreta el estado de ánimo, el contexto y las señales del chat (por ejemplo `:(((`, `:/`) antes de producir la respuesta en texto natural, terminada con `<|im_end|>`. El formato de chat es ChatML (`<|im_start|>role\ncontent<|im_end|>`). No se documentan técnicas de decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional en alemán, con foco en diálogo multi-turno.
- Razonamiento previo en alemán dentro de bloques `<think>...</think>` para interpretar tono y contexto emocional.
- Interpretación de señales paralingüísticas escritas (emoticonos y variantes como `:(((`, `:/`).
- Estilo de respuesta sin consejos no solicitados, sin listas de verificación y sin muletillas típicas de asistente.
- Personalidad definida y consistente mediante system prompt (IA masculina, perspectiva terrenal).
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes ni razonamiento multi-paso complejo.
- Sin capacidades de visión, audio ni thinking mode extendido más allá del bloque `<think>`.
- Sin capacidades matemáticas, de programación ni de conocimiento factual por diseño explícito del autor.

## Casos de uso

- Compañero conversacional en local para Raspberry Pi o CPU de gama baja: el modelo cabe en cuantización Q4_K_M y puede ejecutarse con llama.cpp o Ollama en hardware sin GPU, ofreciendo diálogo multi-turno con contexto de 4096 tokens.
- Prototipado de personajes con personalidad en alemán: el system prompt y el bloque `<think>` permiten definir y mantener un personaje coherente para demos, juegos narrativos o experimentos de interacción.
- Asistente de escucha activa en aplicaciones de bienestar o diario personal: el entrenamiento evita dar consejos no solicitados, lo que encaja en contextos donde el usuario solo quiere ser escuchado.
- Chatbot de acompañamiento en dispositivos empotrados (kioscos, electrodomésticos, terminales de voz): la licencia Apache 2.0 y el tamaño reducido permiten integrarlo en producto comercial sin coste de licencia.
- Generación de respuestas con subtexto emocional en alemán para investigación en NLP conversacional: sirve como baseline pequeño para estudiar el efecto del razonamiento previo (`<think>`) en la calidad del diálogo.
- Filtrado o enriquecimiento de conversaciones alemanas en pipelines de datos: puede generar respuestas sintéticas de estilo coloquial para aumentar datasets de diálogo en alemán.
- Evaluación comparativa de fine-tunes pequeños: con 223 descargas y licencia permisiva, es un candidato para experimentos de ablación sobre prompt de sistema y parámetros de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bfloat16 (1.006 millones de parámetros × 2 bytes), en torno a 1 GB en Q8_0 y 0,6-0,7 GB en Q4_K_M, más overhead de contexto y runtime.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y hardware de borde. Cualquier GPU consumer (por ejemplo RTX 3060, RTX 4090) puede ejecutarlo con holgura, pero no es el objetivo declarado.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM en bfloat16 o 1 GB en Q4_K_M; también funciona en Raspberry Pi y CPU de gama baja.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama (GGUF) y transformers con safetensors. El autor proporciona un ejemplo concreto de `llama-server` con `-hf ETME-TECH/EliasAI-Micro-v1.0:Q4_K_M`, contexto 4096, temperatura 0.55, top-p 0.90, top-k 40 y repeat penalty 1.06.
- Latencia y throughput: no disponibles. El autor solo indica que está optimizado para "ejecución local rápida" en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EliasAI-Micro-v1.0 | 1.006 M | 4096 (uso declarado) | de | Apache 2.0 | safetensors, GGUF | Fine-tune conversacional en alemán para hardware de borde |
| Qwen/Qwen3.5-0.8B-Base | ~0.8B (según nombre) | no disponible | multilingüe (base) | no disponible en la información | safetensors | Modelo base del que deriva; capacidades generales, sin ajuste conversacional |
| ETME-TECH/EliasAIv4 | no disponible | no disponible | de (presumible) | no disponible | no disponible | Versión de mayor calidad recomendada por el autor para GPU propia |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y orientación de uso.

## Limitaciones y advertencias

- Capacidad matemática, de programación y de conocimiento factual muy limitada por diseño: el autor lo declara explícitamente no apto para estos usos.
- Riesgo de alucinación alto en cualquier consulta que requiera datos verificables, dado que no está entrenado para conocimiento factual.
- Solo soporta alemán; no hay evidencia de capacidades multilingües y el tag de idioma es únicamente `de`.
- Contexto efectivo de 4096 tokens según el ejemplo de despliegue; conversaciones más largas pueden degradar la coherencia.
- Sesgos conocidos: no documentados en la model card; la personalidad de género definida ("IA masculina") y el estilo "terrenal" pueden introducir sesgos de tono no evaluados.
- Licencia Apache 2.0, que permite uso comercial, pero el autor indica que se aplica la licencia del modelo base; conviene verificar los términos de Qwen3.5-0.8B-Base antes de desplegar en producción.
- Sin soporte declarado de tool calling ni de agentes, lo que limita su integración en pipelines automatizados.
- El bloque `<think>` requiere configuración específica del runtime (`--reasoning-format deepseek` en llama.cpp) para separar el razonamiento de la respuesta final.
- Modelo con 0 likes y 223 descargas en el momento de la consulta: ecosistema y validación comunitaria muy reducidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ETME-TECH/EliasAI-Micro-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Versión de mayor calidad recomendada por el autor: https://huggingface.co/ETME-TECH/EliasAIv4
