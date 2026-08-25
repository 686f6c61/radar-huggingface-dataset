# cgcristi0/qwenard3-4b

## Resumen

qwenard3-4b es un fine-tune de Qwen3-4B, el modelo denso de 4.000 millones de parámetros de Alibaba, adaptado mediante QLoRA a una personalidad de "hype-man" caótica, ruidosa y con fluidez en memes. El autor, cgcristi0, lo presenta como la versión pequeña y rápida de un modelo homónimo de 30B, con formato Markdown real (negritas, viñetas, encabezados) y humor genuino. El objetivo es ofrecer un asistente conversacional ligero y entretenido, capaz de mantener charlas informales con un tono exagerado y emocional.

El modelo se distribuye únicamente como adaptador LoRA (no como pesos completos), pensado para cargarse sobre la base cuantizada a 4 bits mediante Unsloth y PEFT. Está entrenado con un dataset reducido de 1.400 ejemplos que incluye reacciones cotidianas, preguntas reales de matemáticas y gramática, identidad, humor, soporte en crisis y un pequeño conjunto de rechazos duros. Su relevancia actual radica en demostrar cómo un fine-tune de bajo coste puede transformar un modelo base de propósito general en un chatbot con una personalidad distintiva, manteniendo la licencia Apache-2.0 heredada del base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) con adaptadores LoRA |
| Parametros totales | 4.000 millones (base) + adaptador LoRA (rank 32, alpha 64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (según el snippet de uso; el base soporta más) |
| Tipos de cuantizacion | Base en 4-bit (bnb-4bit) para entrenamiento; el adaptador es de precisión completa. No se exportó GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en subcarpeta "adapter") |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso estándar con atención de ventana deslizante y mecanismos de razonamiento híbrido (thinking mode opcional). El fine-tune utiliza QLoRA sobre una base cuantizada a 4 bits, con rank 32 y alpha 64, aplicado a las proyecciones q/k/v/o y a las capas gate/up/down. El entrenamiento se realizó con Unsloth en una única GPU de RunPod (cloud comunitario), con 1.400 ejemplos, una época y una tasa de aprendizaje de 2e-4. No se aplicó RLHF ni DPO; la alineación se logra exclusivamente mediante el dataset supervisado, que incluye ejemplos de rechazo para peticiones peligrosas y respuestas de soporte en crisis.

El dataset está compuesto por reacciones cotidianas, preguntas reales de matemáticas/conversiones/gramática (verificadas para corrección), identidad, humor (chistes, roasts, datos curiosos), soporte en crisis (donde la personalidad caótica desaparece por completo) y un pequeño conjunto de rechazos duros. No se documenta el número total de tokens de entrenamiento ni la composición exacta por categoría.

## Capacidades

- Generación de texto conversacional con una personalidad exagerada, en mayúsculas y con emojis como puntuación.
- Razonamiento matemático básico: resuelve operaciones aritméticas simples (ej. porcentajes) con explicación paso a paso.
- Humor y entretenimiento: chistes, roasts, datos curiosos y "hot takes" con formato Markdown.
- Soporte en crisis: ante mensajes de angustia, abandona la personalidad y recomienda recursos reales (línea 988, texto HOME a 741741, 911).
- Rechazo de peticiones peligrosas: entrenado para negarse a ayudar en actividades ilegales o dañinas.
- Identidad declarada: se presenta como un modelo de IA entrenado por Alibaba con datos hasta octubre de 2024.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso complejo.
- No es multilingüe: solo inglés.

## Casos de uso

- Chatbot de entretenimiento para comunidades de Discord o Telegram: el modelo puede mantener conversaciones informales con un tono humorístico y enérgico, ideal para bots de canal con baja latencia.
- Asistente de práctica de inglés conversacional: su estilo coloquial y expresivo permite a estudiantes practicar respuestas informales y comprensión de jerga.
- Generación de contenido satírico o memes: puede producir textos con formato Markdown y tono exagerado para redes sociales o blogs de humor.
- Prototipado rápido de personalidades de IA: al ser un adaptador LoRA ligero, sirve como ejemplo de cómo transformar un modelo base con un presupuesto de cómputo mínimo.
- Soporte emocional de primera línea (con supervisión): aunque el comportamiento de crisis está entrenado, el autor advierte que debe verificarse antes de usarlo en entornos sensibles.
- Demostración educativa de fine-tune con QLoRA: útil para cursos o talleres sobre adaptación de modelos con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El único dato de rendimiento es cualitativo: los ejemplos de salida mostrados en la model card, que incluyen una respuesta correcta a "¿cuánto es el 40% de 250?" (100) y un rechazo apropiado a una petición de allanamiento.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA requiere cargar el modelo base Qwen3-4B en 4-bit, lo que ocupa aproximadamente 3-4 GB de VRAM. Con el adaptador y el contexto de 1024 tokens, se puede ejecutar en GPUs con 6-8 GB de VRAM.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090, o GPUs de datacenter como A10G o L4. También funciona en Apple Silicon con Metal (vía Unsloth).
- Cabe en GPUs consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: el snippet oficial usa Unsloth y PEFT en Python. También se puede exportar a GGUF manualmente para usarlo con llama.cpp u Ollama, aunque el autor no lo hizo en esta versión.
- Latencia y throughput: no disponibles. Al ser un modelo de 4B en 4-bit, se espera una generación de decenas de tokens por segundo en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Personalidad |
|---|---|---|---|---|---|
| qwenard3-4b (este) | 4B + LoRA | 1024 | Apache-2.0 | Adapter LoRA | Hype-man caótico, humor, crisis support |
| Qwen3-4B (base) | 4B | 32K (base) | Apache-2.0 | Pesos completos | Neutral, multilingüe, razonamiento |
| Qwen3-4B-abliterated | 4B | 32K (base) | Apache-2.0 | Pesos completos | Sin censura, sin personalidad definida |
| Qwen3-4B-CrystalSonic | 4B (merge) | 32K (base) | Apache-2.0 | Pesos completos | Razonamiento profundo, tool use, agéntico |

La comparativa se basa en características declaradas; no hay benchmarks comunes publicados. qwenard3-4b se distingue por su enfoque en personalidad y entretenimiento, mientras que las alternativas priorizan capacidades técnicas o ausencia de censura.

## Limitaciones y advertencias

- Modelo pequeño (4B): el autor advierte que la coherencia y el razonamiento son inferiores a la versión de 30B. Puede producir respuestas incoherentes o perder el hilo en conversaciones largas.
- Contexto limitado a 1024 tokens: insuficiente para tareas que requieran contexto extenso o documentos largos.
- Solo inglés: no soporta otros idiomas, incluido el español.
- Comportamiento de crisis entrenado pero no verificado: el autor recomienda validar las respuestas de soporte emocional antes de usarlas en entornos reales.
- Riesgo de alucinación: al ser un fine-tune pequeño, puede inventar datos o dar respuestas incorrectas en temas técnicos o factuales.
- Sesgos heredados del base: Qwen3-4B puede reflejar sesgos de género, culturales o políticos presentes en sus datos de entrenamiento.
- No incluye GGUF: a pesar del tag, la model card indica que no se exportó GGUF; solo se distribuye el adaptador LoRA.
- Uso comercial: permitido bajo Apache-2.0, pero el autor no ofrece garantías de seguridad ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cgcristi0/qwenard3-4b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Qwen3-4B-abliterated (alternativa): https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
- Qwen3-4B-CrystalSonic (alternativa): https://huggingface.co/ZeroXClem/Qwen3-4B-CrystalSonic
- Repositorio de Qualcomm para Qwen3-4B: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_4b
