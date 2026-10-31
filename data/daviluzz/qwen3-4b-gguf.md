# daviluzz/Qwen3-4B-GGUF

## Resumen

Qwen3-4B-GGUF es una cuantización en formato GGUF del modelo Qwen3-4B, desarrollado por el equipo de Qwen (Alibaba Cloud), publicada en Hugging Face por el usuario daviluzz. Se trata de un modelo de lenguaje causal denso de 4.022.468.096 parámetros (3.6B sin embeddings) diseñado para generación de texto conversacional, razonamiento y código. Su relevancia radica en que la serie Qwen3 introduce la conmutación fluida entre modo de razonamiento (thinking) y modo directo (non-thinking) dentro de un mismo modelo, además de capacidades agentivas y soporte multilingüe para más de 100 idiomas.

La versión GGUF permite ejecutar el modelo localmente con llama.cpp, Ollama y otras herramientas compatibles, con cuantizaciones que van desde q4_K_M hasta q8_0. Esto lo hace especialmente atractivo para desarrolladores que necesitan un modelo pequeño pero capaz en estaciones de trabajo o portátiles con GPUs de consumo. El contexto nativo es de 32.768 tokens, ampliable a 131.072 mediante YaRN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Causal Language Model) |
| Parametros totales | 4.022.468.096 (4.0B; 3.6B sin embeddings) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Más de 100 idiomas y dialectos (según la serie Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3-4B es un modelo denso (no MoE) de tipo causal language model, con 36 capas y atención agrupada de consultas (GQA) con 32 cabezas para Q y 8 para KV. Ha pasado por preentrenamiento y postentrenamiento (pretraining & post-training). El modelo base hereda las capacidades de la serie Qwen3: razonamiento mejorado respecto a QwQ (en modo thinking) y a Qwen2.5 instruct (en modo non-thinking) en matemáticas, generación de código y razonamiento lógico.

Una innovación destacable es el soporte de conmutación entre modo thinking y non-thinking mediante las etiquetas `/think` y `/no_think` en los prompts o mensajes de sistema, lo que permite alternar entre razonamiento profundo y respuestas rápidas en una misma conversación multi-turno. Para contextos largos, se emplea la técnica de escalado RoPE YaRN (arXiv:2309.00071), validada hasta 131.072 tokens. No se ha publicado el número de tokens de entrenamiento ni la composición detallada del dataset en la información disponible.

## Capacidades

- Generación de texto conversacional con alineación a preferencias humanas: escritura creativa, role-playing, diálogos multi-turno e instrucciones.
- Razonamiento lógico y matemático en modo thinking, superando a QwQ y Qwen2.5 instruct según el equipo de Qwen.
- Generación de código en ambos modos.
- Capacidades agentivas: integración precisa con herramientas externas (tool calling) en modo thinking y non-thinking.
- Soporte multilingüe para más de 100 idiomas y dialectos, con instrucciones y traducción multilingüe.
- Conmutación de modo de razonamiento por turno mediante `/think` y `/no_think`.
- Contexto largo ampliable a 131.072 tokens con YaRN.

## Casos de uso

- Asistentes conversacionales locales: el tamaño de 4B cuantizado permite ejecutar un asistente multi-turno en hardware de consumo sin depender de APIs externas, con buena alineación en diálogo.
- Razonamiento y resolución de problemas matemáticos: activando el modo thinking (`/think`), el modelo realiza cadenas de razonamiento para problemas de lógica y matemáticas.
- Generación y asistencia de código: puede integrarse en editores locales (por ejemplo, mediante Ollama o plugins de IDE) para autocompletado y explicación de código.
- Agentes con tool calling: su soporte de function calling en ambos modos lo hace adecuado para pipelines agentivos que consultan APIs o ejecutan herramientas.
- Traducción y soporte multilingüe: con más de 100 idiomas, es útil para traducción y atención al usuario en varios idiomas en entornos offline.
- Procesamiento de documentos largos: con YaRN activado puede trabajar con contextos de hasta 131.072 tokens, útil para resumen y consulta de documentos extensos.
- Prototipado e investigación: la licencia Apache 2.0 permite su uso en productos comerciales y experimentación sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para evaluaciones detalladas del modelo base, se remite al blog oficial de Qwen3 y a su documentación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; como referencia, un modelo de 4B en q4_K_M ocupa en torno a 2,5-3 GB y en q8_0 en torno a 4-4,5 GB, más la KV cache según el contexto.
- GPUs recomendadas: cualquier GPU de consumo con al menos 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores) para las cuantizaciones más agresivas; GPUs con 12-16 GB (RTX 4070 Ti/4080/4090) para q8_0 con contextos amplios.
- Cabe en GPUs de consumo: sí, incluso en portátiles con GPU dedicada de gama media; también es viable su ejecución en CPU con GGUF, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp (comando recomendado por el autor con `-ngl 99 -fa`), Ollama (`ollama run hf.co/Qwen/Qwen3-4B-GGUF:Q8_0`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados: en modo thinking, temperature 0.6, top-p 0.95, top-k 20, min-p 0 y presence_penalty 1.5; en modo non-thinking, temperature 0.7, top-p 0.8, top-k 20, min-p 0 y presence_penalty 1.5. Se desaconseja la decodificación greedy por riesgo de repeticiones infinitas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Qwen3-4B (este modelo, GGUF) | 4.0B (denso) | 32.768 (131.072 con YaRN) | GGUF (q4_K_M a q8_0) | Apache 2.0 |
| Llama 3.1 8B | 8B (denso) | 128.000 | safetensors/GGUF | Llama 3.1 Community License |
| Gemma 3 4B | 4B (denso) | 128.000 | safetensors/GGUF | Gemma Terms of Use |
| Phi-4-mini | ~3.8B (denso) | 128.000 | safetensors/GGUF | MIT |

Qwen3-4B destaca frente a alternativas de tamaño similar por su doble modo thinking/non-thinking y su soporte declarado de más de 100 idiomas, con una licencia Apache 2.0 más permisiva que la de Llama o Gemma para uso comercial.

## Limitaciones y advertencias

- En modelos cuantizados se recomienda presence_penalty 1.5 para suprimir salidas repetitivas; la decodificación greedy puede degradar el rendimiento y provocar repeticiones sin fin.
- El uso de YaRN estático (implementado en los frameworks open source) puede afectar al rendimiento en textos cortos; solo debe activarse cuando se necesite contexto largo, ajustando el factor según la longitud típica de la aplicación.
- Valores altos de presence_penalty (por encima de 1.5) pueden provocar mezcla de idiomas y una ligera reducción del rendimiento.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta; no disponible una evaluación específica de alucinaciones en la información proporcionada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El repositorio de daviluzz es una cuantización de terceros con 0 descargas registradas; para producción puede preferirse la cuantización oficial Qwen/Qwen3-4B-GGUF.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque deben respetarse los términos de la licencia y las atribuciones correspondientes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/daviluzz/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Cuantización oficial GGUF: https://huggingface.co/Qwen/Qwen3-4B-GGUF
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de llama.cpp para Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Documentación de Ollama para Qwen: https://qwen.readthedocs.io/en/latest/run_locally/ollama.html
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper YaRN: https://arxiv.org/abs/2309.00071
- Paper Qwen3 (referenciado en tags): https://arxiv.org/abs/2505.09388
- Demo de chat: https://chat.qwen.ai/
