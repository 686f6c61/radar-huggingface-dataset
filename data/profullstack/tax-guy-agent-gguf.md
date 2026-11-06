# profullstack/tax-guy-agent-GGUF

## Resumen

tax-guy-agent-GGUF es un modelo de lenguaje especializado en consultas fiscales y contables, publicado por el usuario profullstack en Hugging Face. Se trata de un ajuste fino (LoRA) del modelo base Qwen2.5-0.5B-Instruct, posteriormente fusionado y cuantizado a formato GGUF para su ejecución en CPU mediante llama.cpp u Ollama. El modelo tiene 494.032.768 parámetros (aproximadamente 0,5 mil millones) y un tamaño de repositorio de 0,5 GB.

El modelo resuelve un problema acotado: ofrecer respuestas conversacionales sobre investigación fiscal a partir de fuentes públicas, orientadas a autónomos y pequeñas empresas. Su relevancia radica en su extrema ligereza, que permite desplegarlo en hardware de consumo o incluso en CPU sin GPU, y en su integración con el ecosistema c0mpute/Infernet, que lo distribuye automáticamente entre nodos.

Es importante subrayar que el propio autor advierte que no es un contable público (CPA) ni constituye asesoramiento fiscal, y que el modelo "aporta la voz, no los hechos": rinde mejor cuando se le proporcionan resultados de búsqueda recientes en el prompt. La información disponible sobre idiomas soportados no está especificada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizacion no especificada en la model card); repo de 531 MB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 0,5 mil millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA de rango r=8 durante 400 pasos, entrenado en la red c0mpute. El conjunto de entrenamiento consistió en 2614 documentos extraídos de temas de rssamplifier.com y de búsquedas en pit.world. La perplejidad en el conjunto de validación (held-out) descendió de 33,6 a 17,8 tras el entrenamiento.

El adaptador LoRA resultante tiene el hash sha256 `821a038ac1ea43f804b795e795a308cfbebb141c24e3675223c29d80fb8db5b7`, que coincide con el recibo de c0mpute. Posteriormente, el adaptador se fusionó con el modelo base y se cuantizó a GGUF. No se documentan detalles sobre la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones arquitectónicas adicionales más allá del ajuste LoRA. El modelo se distribuye con un system prompt y parámetros de muestreo que Ollama recoge automáticamente del repositorio.

## Capacidades

- Generación de texto conversacional orientada a consultas fiscales y contables.
- Investigación fiscal a partir de fuentes públicas, especialmente cuando se le inyectan resultados de búsqueda recientes en el prompt.
- Respuesta a preguntas prácticas sobre obligaciones fiscales (por ejemplo, pagos fraccionados trimestrales para autónomos).
- Ejecución en CPU sin necesidad de GPU, gracias a su formato GGUF y su reducido tamaño.
- Integración con Ollama y llama.cpp para despliegue local.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito ("thinking mode").
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente fiscal para autónomos: el modelo puede responder preguntas frecuentes sobre pagos fraccionados, deducciones o plazos de declaración, siempre que se le proporcionen resultados de búsqueda actualizados en el prompt para compensar su limitado conocimiento factual.
- Primer nivel de atención en un chatbot de gestoría: al ejecutarse en CPU, puede desplegarse en servidores modestos para filtrar y responder consultas rutinarias antes de escalarlas a un profesional humano.
- Investigación fiscal asistida: combinado con una herramienta de búsqueda (como `w3bs ask` o el `chat.py` del ejemplo), el modelo redacta respuestas en lenguaje natural a partir de fragmentos de normativa y artículos recuperados.
- Despliegue en nodos distribuidos: al ser un "house model" de Infernet y c0mpute, cada nodo lo descarga automáticamente, lo que permite ofrecer un servicio de consulta fiscal distribuido y de bajo coste.
- Prototipado y demostraciones: su tamaño de 0,5 GB y su licencia Apache 2.0 lo hacen idóneo para prototipos educativos o demos de asistentes especializados sin infraestructura GPU.
- Entornos con recursos limitados: útil en dispositivos de borde o máquinas sin GPU donde se requiera un asistente conversacional temático con latencia aceptable.
- Base para ajustes posteriores: sirve como punto de partida para experimentos de fine-tuning LoRA en dominios regulados, dado su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la perplejidad en el conjunto de validación, que pasó de 33,6 a 17,8 tras el entrenamiento LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo cuantizado ocupa aproximadamente 531 MB, por lo que puede ejecutarse íntegramente en RAM/CPU.
- GPU recomendadas: no necesarias. Cualquier GPU con al menos 1-2 GB de memoria libre podría alojarlo, pero el diseño está orientado a CPU.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada.
- Opciones de despliegue: Ollama (`ollama run hf.co/profullstack/tax-guy-agent-GGUF`), llama.cpp (`llama-cli -hf profullstack/tax-guy-agent-GGUF`) y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tax-guy-agent-GGUF | 494 M | No disponible | Apache 2.0 | GGUF | Ajuste fiscal sobre Qwen2.5-0.5B |
| Qwen2.5-0.5B-Instruct | ~494 M | No disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base generalista |
| Modelos fiscales especializados de mayor tamano | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

La comparación directa con alternativas especializadas en dominio fiscal no está disponible en la información proporcionada. El referente más inmediato es su modelo base, Qwen2.5-0.5B-Instruct, del que hereda arquitectura y licencia pero al que supera en el dominio fiscal específico según la perplejidad reportada.

## Limitaciones y advertencias

- El autor advierte explícitamente que el modelo no es un CPA ni constituye asesoramiento fiscal; las normas cambian cada año y varían según la jurisdicción.
- Riesgo elevado de alucinación en materia factual: con solo 0,5 mil millones de parámetros, el modelo "aporta la voz, no los hechos", por lo que requiere resultados de búsqueda frescos en el prompt para ser fiable.
- Sesgos conocidos: no documentados en la información disponible, pero heredados potencialmente del modelo base y del corpus de entrenamiento (2614 documentos de fuentes concretas).
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están especificados; el entrenamiento parece orientado a fuentes en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero ello no exime de la responsabilidad legal derivada de ofrecer asesoramiento fiscal no profesional.
- Caveat para producción: no debe usarse como única fuente en decisiones fiscales; requiere supervisión humana y verificación con fuentes oficiales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/profullstack/tax-guy-agent-GGUF
- Modelo base (no cuantizado): https://huggingface.co/profullstack/tax-guy-agent
- Modelo original Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Ejemplo c0mpute (business-strategist-agent): https://github.com/profullstack/c0mpute/tree/master/examples/business-strategist-agent
- Documentación de house models de Infernet: https://infernetprotocol.com/docs/house-models
