# armand0e/Granite-4.2-30B-Fable-Distill

## Resumen

Granite-4.2-30B-Fable-Distill es un fine-tune del modelo base `ibm-granite/granite-4.2-30b`, desarrollado por el usuario armand0e, que destila trazas de agente y conversaciones del modelo propietario Claude Fable 5. El objetivo principal es mejorar las capacidades de tool-use y razonamiento del modelo base, manteniendo la misma arquitectura, tokenizador y plantilla de chat, de modo que funcione como un reemplazo directo (drop-in) del Granite 4.2 30B original.

El modelo tiene 29.276.770.304 parámetros (29,3B), es denso, y fue entrenado con un contexto de 40.960 tokens. Está orientado a orquestación de herramientas, extracción de información, chat multilingüe y tareas de razonamiento con modo thinking nativo. Se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors (bf16). Es relevante porque ofrece una alternativa abierta y autoalojable con capacidades agenticas mejoradas respecto al base, aunque el propio autor advierte que no es adecuado para generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (misma que Granite 4.2 30B) |
| Parametros totales | 29.276.770.304 (29,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento; el base soporta más, no especificado) |
| Tipos de cuantizacion | bf16 nativo, bitsandbytes 4-bit en vuelo, AWQ/GPTQ INT4 |
| Idiomas soportados | en, es, fr, de, pt, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Granite 4.2 30B, un transformer denso decoder-only con razonamiento chain-of-thought integrado y modos de thinking flexibles (full, non-thinking, low-effort). El fine-tune se realizó mediante QLoRA sobre una base cuantizada en NF4, con r=32 y α=32 sobre las proyecciones q, k, v, o, gate, up y down, lo que supuso 281M parámetros entrenables que posteriormente se fusionaron en los pesos bf16 del modelo base.

El entrenamiento usó 773 ejemplos que tras el renderizado suman 8,78M de tokens, con un contexto de 40.960 tokens. El 73% de los tokens supervisados corresponden a llamadas a herramientas, el 20% a respuestas finales y el 8% a razonamiento. La mezcla de idiomas es 90% inglés y 10% combinado de español, francés, alemán, portugués, japonés y chino. Se entrenó durante 2 épocas (194 pasos) con LR 8e-5, warmup de 5 pasos, batch 1 con grad-accum 8, paged_adamw_8bit y max_grad_norm 0.3, en una GPU de 64 GB durante unas 24 horas. El autor señala que se supervisó el razonamiento de forma deliberada, pero no se ha comparado contra una variante que solo use respuestas finales.

## Capacidades

- Generación de texto y chat conversacional multilingüe (en, es, fr, de, pt, ja, zh).
- Razonamiento con modo thinking nativo: el modelo emite cadenas de razonamiento internas antes de la respuesta final, controlables mediante el parámetro `enable_thinking` y `low_effort`.
- Tool calling y function calling en formato XML, compatible con el parser `qwen3_coder` de vLLM.
- Orquestación de agentes: puede encadenar múltiples llamadas a herramientas en un mismo turno, gracias a que el 73% de los datos de entrenamiento son trazas de tool calls.
- Extracción de información estructurada a partir de texto libre.
- Capacidades multilingües limitadas: el 10% de los tokens de entrenamiento son no ingleses, lo que da soporte básico pero no profundo en los seis idiomas adicionales.
- No recomendado para generación o edición de código, según el propio autor.

## Casos de uso

- Orquestación de herramientas en pipelines agénticos: el modelo puede recibir una petición, decidir qué herramienta llamar, ejecutarla y procesar el resultado, todo en un mismo flujo. Es adecuado porque el entrenamiento está dominado por trazas de tool calls y el formato XML es directamente parseable por vLLM.
- Atención al cliente automatizada multilingüe: con soporte para siete idiomas y contexto de 40.960 tokens, puede gestionar conversaciones multi-turno con historial largo, aunque la señal multilingüe es limitada y conviene validar la calidad en cada idioma.
- Extracción de datos de documentos: dado su entrenamiento en respuestas finales y razonamiento, puede extraer entidades, fechas o campos concretos de textos extensos, útil para procesos de back-office.
- Chat asistencial con razonamiento visible: el modo thinking permite mostrar el proceso de razonamiento al usuario, útil en aplicaciones educativas o de soporte técnico donde la transparencia es valiosa.
- Clasificación y análisis de texto multilingüe: puede etiquetar, resumir o categorizar contenido en varios idiomas, aunque con menor robustez fuera del inglés.
- Prototipado de agentes con herramientas propias: al ser un drop-in del Granite 4.2 30B, se puede sustituir el base en sistemas existentes sin cambios de código, y probar si la mejora en tool-use justifica el cambio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas comparativas frente al modelo base ni frente a otras alternativas. La única referencia de rendimiento es la pérdida de entrenamiento, que bajó de 0,90 en el paso 1 a un promedio de 0,75 en la segunda época, pero esto no es un indicador de calidad final.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos bf16 ocupan aproximadamente 55 GB, por lo que se necesita una GPU con 64-80 GB para ejecutar el modelo sin cuantizar con margen para la caché KV.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB o similar. En GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) solo es viable con cuantización 4-bit (AWQ/GPTQ o bitsandbytes en vuelo).
- Opciones de despliegue: vLLM (con parsers `deepseek_r1` para razonamiento y `qwen3_coder` para tool calls), Transformers con `device_map="auto"`, y cuantización bitsandbytes para reducir VRAM.
- Latencia y throughput: no se han publicado datos concretos. Con cuantización INT4 se espera el mejor throughput de decodificación, según el autor, pero no hay cifras.
- Para uso en producción con contexto largo, se recomienda cuantizar a 4 bits para dejar espacio a la caché KV en GPUs de 64-80 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Granite-4.2-30B-Fable-Distill | 29,3B | 40.960 (entrenamiento) | Apache 2.0 | Tool-use y razonamiento, destilado de Claude Fable 5 |
| ibm-granite/granite-4.2-30b (base) | 29,3B | No especificado (mayor que 40.960) | Apache 2.0 | Razonamiento general, tool calling nativo |
| Qwen3-Coder (variante) | 30B aprox. | No especificado | Apache 2.0 | Generación de código y tool calling |

La comparativa se limita a lo disponible: el modelo es un fine-tune del base Granite 4.2 30B, por lo que comparte arquitectura y licencia. Frente al base, la diferencia principal es el entrenamiento adicional en trazas de tool calls y razonamiento supervisado, aunque no hay benchmarks que cuantifiquen la mejora. Frente a modelos especializados en código como Qwen3-Coder, el autor recomienda explícitamente usar estos últimos para tareas de programación, ya que este modelo es débil en ese ámbito.

## Limitaciones y advertencias

- No recomendado para generación o edición de código: el autor indica explícitamente que el modelo es débil en esta tarea, igual que el base Granite 4.2 30B.
- Señal multilingüe limitada: solo el 10% de los tokens de entrenamiento son no ingleses, por lo que la calidad en español, francés, alemán, portugués, japonés y chino puede ser inferior a la del inglés.
- Sin benchmarks publicados: no hay métricas objetivas que permitan evaluar el rendimiento frente al base u otros modelos.
- El razonamiento supervisado no ha sido comparado contra una variante que solo use respuestas finales, por lo que no se sabe si aporta una mejora real.
- El modelo fusionado no es bit-idéntico a lo que vio el entrenamiento, debido al proceso QLoRA (entrenamiento sobre pesos NF4 y fusión en bf16), lo que puede introducir pequeñas diferencias.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de extracción o razonamiento complejo.
- Para producción, es necesario mantener el modo thinking activado (`enable_thinking: true`), ya que si se desactiva, el parser de razonamiento de vLLM devuelve toda la respuesta en el campo `reasoning` y las tool calls no se parsean correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/armand0e/Granite-4.2-30B-Fable-Distill
- Adaptador LoRA publicado: https://huggingface.co/armand0e/Granite-4.2-30B-Fable-Distill-LoRA
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Documentación de Granite 4.2 de IBM: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Herramienta de preparación de datos teich: https://github.com/TeichAI/teich
