# bartowski/Ling-3.0-tiny-GGUF

## Resumen

Ling-3.0-tiny es un modelo de lenguaje de razonamiento hibrido con arquitectura de mezcla de expertos (MoE) desarrollado por InclusionAI, la division de investigacion en IA de Ant Group. Con 7.893 millones de parametros totales y solo 1.300 millones activos por token, esta disenado para ofrecer capacidades avanzadas de razonamiento y uso de agentes con un coste de inferencia reducido, lo que lo hace adecuado para despliegue en entornos locales o con recursos limitados. Se publico en agosto de 2026 y destaca por su ventana de contexto nativa de 256.000 tokens, modos de razonamiento conmutables (Thinking e Instant), llamada a funciones nativa y cache de prompt.

La version cuantizada en GGUF distribuida por bartowski permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, con una amplia gama de niveles de cuantizacion que van desde bf16 hasta Q2_K. El modelo base esta disponible en HuggingFace y ModelScope bajo licencia MIT, lo que facilita su uso comercial y su integracion en pipelines de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (bailingmoe3) con KDA/MLA y capas Q-LoRA |
| Parametros totales | 7.893.392.800 (~7,9 B) |
| Parametros activos | 1,3 B por token |
| Longitud de contexto | 256.000 tokens (nativo) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_XL, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K_L, Q2_K, IQ2_M (lista no exhaustiva) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones de bartowski); safetensors en el modelo base |

## Arquitectura y entrenamiento

Ling-3.0-tiny emplea una arquitectura de mezcla de expertos hibrida denominada bailingmoe3, que combina mecanismos de atencion KDA (Kernel-based Dynamic Attention) y MLA (Multi-head Latent Attention) junto con capas Q-LoRA. Esta combinacion permite reducir el coste computacional por token al activar solo 1,3 B de los 7,9 B parametros totales, manteniendo un rendimiento de razonamiento comparable a modelos mucho mas grandes. El modelo soporta decodificacion especulativa desactivada por defecto, segun la informacion de la cuantizacion.

No se han publicado detalles especificos sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados ni los metodos de alineacion (RLHF, DPO, etc.) en la informacion disponible. El modelo incluye dos modos de razonamiento conmutables: Thinking, para tareas que requieren reflexion profunda, e Instant, para respuestas rapidas, asi como cache de prompt para optimizar consultas repetitivas.

## Capacidades

- Razonamiento hibrido con modos Thinking e Instant conmutables segun la tarea.
- Llamada a funciones nativa (function calling), lo que permite integrar el modelo en flujos de trabajo con herramientas externas.
- Capacidades de agente y razonamiento multi-paso, disenadas para tareas de planificacion y ejecucion de acciones.
- Ventana de contexto de 256.000 tokens, adecuada para documentos extensos y conversaciones de multiples turnos.
- Cache de prompt para reducir latencia en consultas repetidas.
- Soporte de entrada de texto (no se mencionan capacidades de vision o audio).
- Disenado para despliegue en entornos de borde (edge) y recursos limitados gracias a sus 1,3 B de parametros activos.

## Casos de uso

- Asistentes virtuales locales: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256.000 tokens, ejecutandose en una GPU de consumo con cuantizacion Q4_K_M.
- Agentes autonomos con llamada a funciones: su soporte nativo de function calling permite integrarlo en sistemas que necesitan interactuar con APIs, bases de datos o herramientas de automatizacion.
- Analisis de documentos extensos: la ventana de 256.000 tokens posibilita procesar informes, contratos o codigo fuente completo sin necesidad de dividir el texto en fragmentos.
- Generacion de codigo asistida en entornos de desarrollo: con su capacidad de razonamiento y bajo coste de inferencia, puede usarse como autocompletado o asistente de revision de codigo en editores locales.
- Chatbots de atencion al cliente en despliegues on-premise: al ser ligero y con licencia MIT, puede instalarse en servidores propios sin costes de API ni problemas de privacidad de datos.
- Prototipado rapido de aplicaciones de IA: su tamano reducido y compatibilidad con llama.cpp y Ollama facilitan experimentar en portatiles o estaciones de trabajo sin GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica referencia de rendimiento encontrada es el Artificial Analysis Intelligence Index, donde el modelo obtiene una puntuacion de 25, situandose en el puesto 6 de 56 modelos de su clase, con un rendimiento comparable a modelos GPT con 15 veces mas parametros. No se dispone de datos de perplejidad ni de comparaciones detalladas con otros modelos en tareas especificas.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q4_K_M ocupa 4,92 GB, por lo que cabe en GPUs con 8 GB de VRAM; las versiones Q8_0 requieren unos 8,41 GB y la bf16 completa 15,80 GB.
- GPU recomendadas: RTX 3060/4060 (8 GB) para cuantizaciones Q4, RTX 4090 o A100 para Q8_0 o bf16.
- Cabe en GPU de consumo: si, con cuantizaciones Q4 o inferiores en GPUs de 8 GB; las versiones de mayor precision necesitan 16 GB o mas.
- Opciones de despliegue: llama.cpp (compatible con los archivos GGUF), Ollama, LM Studio, y servidores de inferencia como vLLM o TGI (si se usa el modelo base safetensors).
- Latencia y throughput: no se han publicado datos concretos; al activar solo 1,3 B de parametros por token, se espera una inferencia rapida en hardware consumer, aunque depende del nivel de cuantizacion y del hardware.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con alternativas concretas de la misma categoria. El modelo comparte tamano total (~8 B) con modelos densos como Llama-3.1-8B o Qwen2.5-7B, pero su arquitectura MoE con 1,3 B activos lo acerca en coste de inferencia a modelos de menor tamano. No hay datos publicos de benchmarks comparativos con estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de riesgos de alucinacion especificos para este modelo; como cualquier LLM, puede generar contenido inexacto o sesgado.
- La informacion sobre idiomas soportados no esta disponible; se recomienda verificar el rendimiento en el idioma de uso antes de desplegarlo en produccion.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo puede estar sujeto a las politicas de uso de Ant Group; conviene revisar los terminos del modelo base.
- Las cuantizaciones de baja precision (Q2, Q3) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- No se han publicado datos de perplejidad ni de degradacion por cuantizacion, por lo que se recomienda validar el rendimiento con la cuantizacion elegida.

## Enlaces

- Repositorio GGUF de bartowski: https://huggingface.co/bartowski/Ling-3.0-tiny-GGUF
- Modelo base en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Modelo en ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.0-tiny
- Documentacion oficial de Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Review tecnica: https://aitoolsreview.co.uk/insights/ling-3-0-tiny
- Articulo de AlphaSignal: https://alphasignal.ai/news/ant-group-s-ling-3-0-tiny-matches-gpt-120b-intelligence-with-15x-fewer
