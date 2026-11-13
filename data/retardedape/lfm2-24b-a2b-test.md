# retardedape/LFM2-24B-A2B-test

## Resumen

LFM2-24B-A2B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Liquid AI, disenado especificamente para inferencia en el borde (edge) y despliegue en hardware de consumo. Con 24 mil millones de parametros totales pero solo 2,3 mil millones activos por token, el modelo consigue un equilibrio entre calidad y eficiencia que le permite ejecutarse en equipos con 32 GB de RAM, sin necesidad de GPU dedicada. Emplea una arquitectura hibrida que combina capas convolucionales y de atencion, con 40 capas en total (30 convolucionales y 10 de atencion).

El modelo se presenta como un instruct general-purpose sin trazas de razonamiento explicito, orientado a tareas de uso de herramientas, resumen de documentos y pipelines RAG locales. Soporta de forma nativa function calling y salidas estructuradas, lo que lo posiciona como el modelo de bucle interno rapido en arquitecturas de agentes multi-paso. Su ventana de contexto es de 32.768 tokens y su vocabulario de 65.536 entradas.

La relevancia actual del modelo radica en su eficiencia: alcanza 112 tokens por segundo en decodificacion sobre CPU AMD y 293 tokens por segundo en una H100, con soporte desde el primer dia en llama.cpp, vLLM y SGLang. Esta ficha corresponde a la publicacion `retardedape/LFM2-24B-A2B-test`, una copia del modelo original de Liquid AI (`LiquidAI/LFM2-24B-A2B`), que cuenta con una version posterior en `LiquidAI/LFM2.5-24B-A2B`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE (30 capas convolucionales + 10 de atencion) |
| Parametros totales | 23.843.661.440 (24B) |
| Parametros activos | 2,3B por token |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (soporte en llama.cpp, vLLM y SGLang) |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 40 (30 conv + 10 attn) |
| Tamano del vocabulario | 65.536 |
| Precision de entrenamiento | Mixta BF16/FP8 |
| Presupuesto de entrenamiento | 17 billones de tokens |
| Parametros de generacion | temperature 0.1, top_k 50, repetition_penalty 1.05 |

## Arquitectura y entrenamiento

LFM2-24B-A2B emplea una arquitectura hibrida que alterna capas convolucionales (30) con capas de atencion (10), un diseno que busca reducir el coste computacional de la atencion clasica manteniendo la capacidad de modelado. La componente MoE activa solo 2,3B de los 24B parametros totales por token, lo que explica su bajo requisito de memoria (32 GB de RAM) y su alta velocidad de decodificacion. El modelo fue entrenado con precision mixta BF16/FP8 y un presupuesto de 17 billones de tokens, frente a los 12 billones de su hermano menor LFM2-8B-A1B.

La familia LFM2 demuestra un escalado predecible: la calidad mejora de forma log-lineal desde 350M hasta 24B parametros totales, lo que confirma que la arquitectura hibrida escala de forma fiable a lo largo de casi dos ordenes de magnitud. No se dispone de informacion detallada sobre la composicion del dataset ni sobre el uso de RLHF o DPO en la informacion proporcionada. El modelo es un instruct general-purpose sin trazas de razonamiento.

## Capacidades

- Generacion de texto conversacional multi-turno en nueve idiomas.
- Function calling nativo: el modelo emite llamadas Pythonicas entre los tokens especiales `<|tool_call_start|>` y `<|tool_call_end|>`, o JSON si se le indica en el system prompt.
- Soporte de salidas estructuradas y uso de herramientas (web search, consultas a bases de datos, creacion de tickets).
- Capacidad de agente multi-paso: interpreta el resultado de la herramienta y responde en texto plano al usuario.
- Resumen y question answering sobre documentos largos gracias a su contexto de 32.768 tokens.
- No esta optimizado para generacion de codigo, segun indica el propio autor.
- No dispone de modo de razonamiento explicito (thinking mode) ni capacidades de vision o audio.

## Casos de uso

- **Agente de atencion al cliente en local**: el modelo gestiona conversaciones multi-turno con acceso a herramientas (consultas a base de datos, creacion de tickets) sin que los datos salgan de la red corporativa, gracias a su despliegue on-premise en 32 GB de RAM.
- **Resumen de documentos confidenciales**: para flujos legales, medicos o corporativos, el modelo resume y responde preguntas sobre documentos de hasta 32.768 tokens ejecutandose integramente en hardware de consumo.
- **Pipeline RAG local**: actua como backbone de generacion en sistemas de recuperacion aumentada sobre una sola maquina, sin necesidad de servidores con GPU.
- **Bucle interno de agentes multi-paso**: por su baja latencia (112 tok/s en CPU AMD, 293 tok/s en H100) y su soporte de function calling, es adecuado como modelo rapido que orquesta llamadas a herramientas en pipelines de agentes.
- **Automatizacion de flujos con salidas estructuradas**: integrado en procesos que requieren extraccion de datos en JSON o llamadas a APIs internas, el modelo puede emitir llamadas Pythonicas o JSON de forma controlada.
- **Asistente multilingue embebido**: con soporte para espanol, portugues, frances, aleman, chino, japones, coreano, arabe e ingles, puede desplegarse en aplicaciones de asistencia en mercados internacionales sobre hardware modesto.
- **Prototipado y evaluacion en edge**: su compatibilidad con llama.cpp, vLLM y SGLang permite probar y desplegar el modelo en portatiles y equipos de sobremesa para validar casos de uso antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento proporcionados son de velocidad de inferencia: 112 tok/s de decodificacion en CPU AMD y 293 tok/s en H100.

## Requisitos de hardware

- VRAM/RAM estimada: 32 GB de RAM para despliegue en portatiles y equipos de sobremesa de consumo (dato del autor).
- GPU recomendadas: H100 para maximo throughput (293 tok/s); el modelo esta disenado para funcionar tambien en CPU.
- Cabe en GPU de consumo: no se especifica, pero el requisito de 32 GB de RAM sugiere que puede ejecutarse en configuraciones con GPUs de gama alta o en CPU.
- Opciones de despliegue: llama.cpp, vLLM, SGLang (soporte desde el primer dia), transformers.
- Latencia y throughput: 112 tok/s de decodificacion en CPU AMD; 293 tok/s en H100.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-24B-A2B | 24B | 2,3B | 32.768 | LFM Open License v1.0 | Hugging Face |
| LFM2-8B-A1B | 8,3B | 1,5B | 32.768 | LFM Open License v1.0 | Hugging Face |
| LFM2.5-24B-A2B | No disponible | No disponible | No disponible | No disponible | Hugging Face (version posterior) |

## Limitaciones y advertencias

- No esta optimizado para generacion de codigo; el autor desaconseja explicitamente su uso para esta tarea.
- No dispone de trazas de razonamiento explicito, lo que puede limitar tareas que requieran cadenas de pensamiento largas.
- Ventana de contexto limitada a 32.768 tokens, inferior a la de algunos modelos actuales con contextos de 128K o superiores.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de sesgo o fidelidad en la informacion disponible.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de un uso comercial; no es una licencia de codigo abierto permisiva.
- Esta publicacion (`retardedape/LFM2-24B-A2B-test`) es una copia no oficial con 0 descargas y 0 likes; para produccion se recomienda acudir al repositorio oficial de Liquid AI.
- Existe una version posterior (LFM2.5-24B-A2B) que podria incorporar mejoras no presentes en esta version.

## Enlaces

- Hugging Face (esta publicacion): https://huggingface.co/retardedape/LFM2-24B-A2B-test
- Modelo original: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- Version posterior: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo hermano: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Blog post: https://www.liquid.ai/blog/lfm2-24b-a2b
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Documentacion de chat template: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Documentacion de tool use: https://docs.liquid.ai/lfm/key-concepts/tool-use
- Paper (arXiv): https://arxiv.org/abs/2511.23404
