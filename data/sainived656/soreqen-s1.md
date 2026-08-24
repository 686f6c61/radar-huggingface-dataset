# sainived656/soreqen-s1

## Resumen

SoreQen S1 es un asistente conversacional bilingüe (inglés / hinglish) desarrollado por **ZorQelis AI** a partir del modelo base `Qwen/Qwen3.5-2B` de Alibaba Cloud. Se trata de un ajuste fino mediante un adaptador LoRA de rango 16 aplicado únicamente a la capa de lenguaje, entrenado con 21 062 ejemplos supervisados centrados en la identidad del asistente y la conversación en inglés y hinglish romanizado. El modelo hereda intactas la ventana de contexto de 262 144 tokens, el vocabulario de 248 320 entradas y el tokenizador del modelo base.

La relevancia de este modelo reside en su enfoque específico para el mercado indio: mantiene la identidad del asistente incluso sin system prompt, algo que el base no logra (6/6 frente a 0/6 en las pruebas internas), y mejora ligeramente la calidad del hinglish informativo. El adaptador LoRA no toca el codificador de visión ni las tablas de embeddings, por lo que las capacidades multimodales, el modo de razonamiento (thinking), el tool calling y la salida estructurada se heredan tal cual del modelo base.

Con 2 213 millones de parámetros totales y licencia Apache-2.0, SoreQen S1 está orientado a despliegues ligeros en entornos con recursos limitados, especialmente en aplicaciones de chat bilingüe para hablantes de hinglish en India y otras regiones. Su contexto largo (262 144 tokens) lo hace adecuado para tareas que requieren procesar documentos extensos, aunque su capacidad de razonamiento profundo sigue siendo la de un modelo de 2B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B) con adaptador LoRA (r=16) |
| Parametros totales | 2 213 241 664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés, hinglish (escritura romana) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SoreQen S1 parte del modelo base `Qwen/Qwen3.5-2B`, un transformer denso con vocabulario de 248 320 entradas y ventana de contexto de 262 144 tokens. El ajuste se realiza mediante un único adaptador LoRA de rango 16 aplicado exclusivamente a la capa de lenguaje. El entrenamiento se llevó a cabo con 21 062 ejemplos supervisados, distribuidos entre tareas de identidad del asistente y conversación bilingüe. Durante el entrenamiento, el codificador de visión, el proyector multimodal y las tablas de embeddings quedaron congelados (sin gradiente), por lo que son idénticos al modelo base. El chat template, la longitud de contexto, el tokenizador y el vocabulario no se modificaron.

No se aplicaron técnicas de RLHF ni DPO; el ajuste es puramente de aprendizaje supervisado. Los datos de entrenamiento no incluyen ejemplos de thinking mode, tool calling ni salida estructurada, por lo que estas capacidades se heredan tal cual del modelo base sin adaptación específica. El autor indica que el modelo fue evaluado con el adaptador activado y desactivado sobre las mismas semillas para aislar el efecto del ajuste.

## Capacidades

- Generación de texto bilingüe: responde en hinglish (escritura romana) cuando el usuario escribe en hinglish y en inglés cuando el usuario escribe en inglés, adaptando el registro (informal o profesional).
- Identidad de asistente persistente: mantiene su identidad como SoreQen S1 incluso sin system prompt, a diferencia del modelo base que la pierde en ese escenario.
- Thinking mode heredado: soporta razonamiento paso a paso mediante `enable_thinking=True` en el chat template, o respuestas directas con `False`.
- Tool calling heredado: conserva la capacidad de invocar herramientas y funciones del modelo base sin modificación.
- Salida estructurada heredada: puede generar JSON u otras estructuras según las instrucciones del usuario.
- Visión heredada: el codificador de visión está presente y congelado; el modelo puede procesar imágenes según el comportamiento del base, aunque no se ha entrenado específicamente para ello.
- Seguimiento de instrucciones: mantiene el rendimiento del base en tareas de cumplimiento de instrucciones (2/2 en las pruebas internas).
- Contexto largo: soporta hasta 262 144 tokens, lo que permite trabajar con documentos extensos o historiales de conversación muy largos.

## Casos de uso

- Atención al cliente en hinglish: el modelo puede gestionar conversaciones multi-turno con usuarios que escriben en hinglish roman, manteniendo un tono cercano y resolviendo consultas típicas de soporte técnico o comercial. Su capacidad para mantener la identidad sin system prompt facilita su integración en plataformas de mensajería.
- Asistentes de marca con identidad propia: empresas que necesitan un asistente con personalidad definida pueden usar SoreQen S1 para crear chatbots que se presentan con un nombre y estilo concretos, incluso en canales donde no se inyecta un system prompt. El ajuste específico en identidad es su principal ventaja frente al base.
- Procesamiento de documentos largos en hinglish: con 262K tokens de contexto, puede resumir o extraer información de documentos extensos escritos en hinglish o inglés, útil en entornos legales, financieros o de investigación.
- Chatbots en Telegram/WhatsApp para la India: su bilingüismo hinglish-inglés lo hace adecuado para bots de conversación informal en plataformas de mensajería, con respuestas directas y sin preámbulos.
- Generación de contenido bilingüe: el modelo puede producir textos en hinglish e inglés para redes sociales, blogs o materiales de marketing, respetando el registro solicitado por el usuario.
- Prototipado rápido de asistentes con visión: al heredar el codificador de visión del base, puede usarse como punto de partida para prototipos que combinan texto e imágenes, aunque no se haya entrenado específicamente en tareas visuales.
- Evaluación de técnicas de LoRA en contextos multilingües: investigadores pueden utilizarlo como caso de estudio de cómo un adaptador de bajo rango afecta a la identidad y al rendimiento en lenguajes mezclados.

## Benchmarks y rendimiento

El autor proporciona una evaluación interna comparando el modelo con el adaptador activado y desactivado sobre el mismo conjunto de pruebas. Los resultados son los siguientes:

| Dimension | SoreQen S1 | Base (Qwen3.5-2B) | Veredicto |
|---|---|---|---|
| Identidad (con system prompt) | 6/6 | 6/6 | Igual |
| Identidad (sin system prompt) | 6/6 | 0/6 | Mejor |
| Hinglish roman | 12/12 | 12/12 | Igual |
| Hinglish code_mixed | 8/12 | 9/12 | Peor |
| Hinglish informativo | 10/12 | 9/12 | Mejor |
| Hinglish artefacto | 3/3 | 3/3 | Igual |
| Razonamiento | 4/5 | 4/5 | Igual |
| Conocimiento | 4/4 | 4/4 | Igual |
| Thinking | 2/2 | 2/2 | Igual |
| Tool calling | 2/2 | 2/2 | Igual |
| Salida estructurada | 2/2 | 2/2 | Igual |
| Seguimiento de instrucciones | 2/2 | 2/2 | Igual |
| Longitud media de respuesta | 116 palabras | 107 palabras | Más larga |

No se han publicado resultados de benchmarks estándar externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación anterior es interna del autor y no está validada por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,4 GB en FP16 según LLM Explorer, lo que permite ejecutarlo en GPUs de consumo medio.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090, o cualquier GPU con al menos 6 GB de VRAM para cuantización a 4 bits.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs modernas de gama media con 8 GB o más.
- Opciones de despliegue: el modelo se puede cargar con `transformers` (vía `AutoModelForImageTextToText`), y es compatible con servidores de inferencia como vLLM, TGI y llama.cpp (si se convierte a GGUF). No se han publicado archivos GGUF en el repositorio, por lo que habría que convertirlos.
- Latencia y throughput: no disponible en la información proporcionada; en un modelo de 2B en FP16 se puede esperar una latencia de decenas de milisegundos por token en GPUs modernas, pero no hay datos medidos del autor.
- CPU: puede ejecutarse en CPU con cuantización, aunque el rendimiento será significativamente más lento que en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Diferencias clave |
|---|---|---|---|---|
| **SoreQn S1** | 2,2B | 262 144 | Apache-2.0 | Ajuste LoRA para identidad y hinglish; conserva visión y tool calling |
| **Qwen/Qwen3.5-2B** (base) | 2,2B | 262 144 | Apache-2.0 | Sin ajuste; no mantiene identidad sin system prompt; mejor en hinglish code_mixed (9/12) |
| **sainived656/soreqen-s1-mini** | 0,8B | no disponible | Apache-2.0 | Versión reducida del mismo ajuste; menos fiable en aritmética y precios según el autor |

No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, Llama 3.2 3B o Gemma 2 2B) en la información proporcionada.

## Limitaciones y advertencias

- Modelos pequeños con números confiables: el autor advierte que los modelos de 0,8B (y en menor medida los de 2B) pueden afirmar cifras que no pueden verificar, especialmente en precios, tasas o aritmética. No deben usarse para cálculos financieros sin validación externa.
- Hinglish solo en escritura romana: el modelo no genera texto en devanagari; está diseñado para hinglish roman por defecto.
- No apto para consejos profesionales o críticos de seguridad: el ajuste está orientado a conversación informal, no a asesoramiento médico, legal o de seguridad.
- Peor rendimiento en hinglish code_mixed: el ajuste empeora ligeramente la calidad en mezcla de códigos (8/12 frente a 9/12 del base), lo que puede afectar a usuarios que alternan entre inglés e hindi en la misma frase.
- Sin evaluación de seguridad o sesgos: no se han publicado pruebas de sesgos ni de robustez frente a ataques adversarios.
- Capacidades de visión no entrenadas: aunque el codificador de visión está presente, no se ha entrenado en tareas visuales; su comportamiento en ese ámbito es el heredado del base sin adaptación.
- Sin cuantizaciones oficiales: el repositorio no incluye formatos cuantizados (GGUF, AWQ, GPTQ), por lo que el despliegue eficiente requiere conversión manual.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sainived656/soreqen-s1
- Versión mini (0,8B): https://huggingface.co/sainived656/soreqen-s1-mini
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- LLM Explorer (ficha con VRAM estimada): https://llm-explorer.com/model/sainived656%2Fsoreqen-s1,1SPiSXnuIGYqQIo9ngJPGz
