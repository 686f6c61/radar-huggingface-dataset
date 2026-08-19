# mradermacher/AgentMercury-Qwen3.5-4B-i1-GGUF

## Resumen

AgentMercury-Qwen3.5-4B-i1-GGUF es una cuantización en formato GGUF del modelo base Minbyul/AgentMercury-Qwen3.5-4B, realizada por mradermacher. El modelo original está diseñado para tareas de agente, uso de herramientas (tool-use) y soporte de MCP (Model Context Protocol), y ha sido entrenado mediante aprendizaje por refuerzo con GRPO sobre una base Qwen3.5-4B. Esta versión GGUF permite su ejecución local en entornos con recursos limitados, manteniendo las capacidades del modelo original.

La relevancia de este modelo radica en que combina un tamaño compacto (4B de parámetros) con habilidades de agente y tool calling, lo que lo hace adecuado para despliegues en edge o en hardware de consumo. La cuantización i1 (imatrix) optimiza la precisión de los pesos para una mejor relación calidad/tamaño. El repositorio actual solo contiene el archivo de imatrix, mientras que las cuantizaciones estáticas están disponibles en un repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (basada en Qwen3.5-4B, probablemente transformer) |
| Parametros totales | 897.272 (valor reportado en HuggingFace) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según model card) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo imatrix incluido; cuantizaciones estáticas en repositorio separado) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero al estar basado en Qwen3.5-4B, se asume un transformer decoder-only con atención causal. El modelo original fue entrenado con aprendizaje por refuerzo (GRPO) para optimizar habilidades de agente, tool-use y MCP. No se especifican los datos de entrenamiento ni el número de tokens utilizados. La cuantización i1 (imatrix) aplicada por mradermacher utiliza una matriz de importancia para reducir la pérdida de precisión en los pesos cuantizados, mejorando la calidad frente a cuantizaciones estáticas convencionales.

## Capacidades

- Generación de texto y razonamiento conversacional.
- Uso de herramientas (tool calling) para interactuar con APIs y funciones externas.
- Soporte de MCP (Model Context Protocol) para integración con sistemas de agentes.
- Capacidades de visión (según la model card, es un modelo de visión; los archivos mmproj están en el repositorio estático).
- Entrenado específicamente para tareas de agente y multi-step reasoning.
- Multilingüe: solo inglés (según la etiqueta `language: en`).

## Casos de uso

- Asistentes conversacionales locales: al ser un modelo compacto cuantizado, puede ejecutarse en portátiles o mini-PCs para proporcionar respuestas en inglés con bajo consumo de recursos.
- Agentes autónomos con tool calling: integrable en frameworks como LangChain o LlamaIndex para que el modelo decida qué herramientas invocar y procese los resultados.
- Automatización de tareas vía MCP: puede conectarse a servidores MCP para acceder a datos o servicios externos, por ejemplo, consultar bases de datos o gestionar calendarios.
- Prototipado de aplicaciones de IA en edge: adecuado para dispositivos con VRAM limitada (4-6 GB) gracias a las cuantizaciones GGUF.
- Generación de código asistida: aunque no se especifica, al ser una variante de Qwen, puede usarse para completar o explicar fragmentos de código en entornos de desarrollo.
- Evaluación de modelos de agente en investigación: su licencia Apache-2.0 permite experimentación y benchmarking sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página de FriendliAI menciona que AgentMercury mejora sobre la base Qwen3.5-4B en ciertas tareas, pero no se proporcionan cifras concretas. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4B cuantizado, los archivos GGUF suelen ocupar entre 2 y 4 GB según el nivel de cuantización. Se recomienda al menos 4 GB de VRAM para las cuantizaciones más altas (Q6_K, Q8_0) y 2-3 GB para las más bajas (Q2_K, IQ2_M).
- GPU recomendadas: tarjetas consumer como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU con suficiente RAM (8-16 GB) usando llama.cpp.
- Compatibilidad con consumer GPU: sí, es uno de los objetivos de la cuantización GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptador GGUF), o cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (agentes pequeños). Se recomienda consultar benchmarks públicos de Qwen3.5-4B o modelos similares como Llama-3.2-3B o Phi-3.5-mini, pero no se incluyen datos concretos por falta de fuentes.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es adecuado para tareas multilingües.
- Al ser un modelo pequeño (4B), puede presentar alucinaciones o razonamiento limitado en tareas complejas.
- La cuantización introduce pérdida de precisión; se recomienda usar cuantizaciones más altas (Q6_K, Q8_0) si la calidad es crítica.
- El repositorio actual solo contiene el archivo imatrix; para obtener los GGUF listos para usar, hay que acceder al repositorio estático (mradermacher/AgentMercury-Qwen3.5-4B-GGUF).
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas de agente no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base (Minbyul/AgentMercury-Qwen3.5-4B) también cumpla con esa licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/AgentMercury-Qwen3.5-4B-i1-GGUF
- Repositorio estático (cuantizaciones completas): https://huggingface.co/mradermacher/AgentMercury-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-4B
- Página de FriendliAI con benchmarks: https://friendli.ai/models/Minbyul/AgentMercury-Qwen3.5-4B
