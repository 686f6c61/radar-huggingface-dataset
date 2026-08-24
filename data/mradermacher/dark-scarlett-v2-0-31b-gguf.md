# mradermacher/Dark-Scarlett-v2.0-31B-GGUF

## Resumen

Dark-Scarlett-v2.0-31B es un modelo de lenguaje basado en la arquitectura gemma4_text, desarrollado por ReadyArt y cuantizado a formato GGUF por mradermacher para facilitar su ejecución local. El repositorio en HuggingFace contiene los pesos estáticos en distintas cuantizaciones (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, etc.), lo que permite desplegarlo en hardware de gama media con distintos compromisos entre tamaño y calidad. El modelo está orientado a tareas de roleplay y conversación, según las etiquetas publicadas en LLMs.info, y se distribuye bajo licencia Apache-2.0 según esa misma fuente, aunque la model card original no especifica licencia.

La arquitectura, confirmada por el visualizador hfviewer, emplea 60 capas transformer con atención por grupos (GQA), un tamaño oculto de 5376 y una capa intermedia de 21504, lo que sugiere un modelo de aproximadamente 31 000 millones de parámetros (el nombre del repositorio indica 31B, aunque el dato de parámetros reportado en la información de HuggingFace es inconsistente). Este GGUF es una conversión del modelo original ReadyArt/Dark-Scarlett-v2.0-31B, que se presenta como instruct y apto para conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_text (transformer con GQA, 60 capas, hidden size 5376, intermediate 21504, 32 query heads, 16 key/value heads) |
| Parametros totales | No disponible (el nombre sugiere 31B, pero el dato reportado es 575.743.536, inconsistente) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentario del autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (fuente externa indica Apache-2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original (Dark-Scarlett-v2.0-31B) se basa en una arquitectura gemma4_text, que es una variante de la familia Gemma con atención por grupos (GQA) para reducir el coste de inferencia. La configuración incluye 60 capas, un tamaño oculto de 5376, 32 cabezas de consulta y 16 de clave/valor, con una capa intermedia de 21504. No se dispone de información sobre los datos de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO). El repositorio GGUF se genera mediante la cuantización de los pesos originales, sin modificar la arquitectura.

## Capacidades

- Generación de texto conversacional y roleplay, según las etiquetas del modelo original.
- Instrucción y diálogo multi-turno (modelo instruct).
- Soporte para cuantización en formato GGUF, lo que permite su ejecución en CPU o GPU con memoria limitada.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso o capacidades multilingües.

## Casos de uso

- **Chatbots de rol y ficción interactiva**: el modelo puede generar narrativas coherentes y mantener personajes gracias a su entrenamiento en conversación, y su cuantización permite ejecutarlo en un portátil con GPU modesta.
- **Asistentes de escritura creativa**: para generar diálogos, descripciones o tramas en proyectos de escritura, usando el modelo localmente sin depender de APIs externas.
- **Prototipado de aplicaciones de conversación**: los desarrolladores pueden probar rápidamente ideas de chatbots con un modelo de tamaño medio sin coste de servidor.
- **Experimentos de NLP en entornos sin conexión**: al ser GGUF, puede cargarse con llama.cpp u Ollama en máquinas sin GPU, útil para pruebas o educación.
- **Generación de contenido de entretenimiento**: historias interactivas, juegos de texto o aventuras conversacionales.
- **Fine-tuning ligero**: aunque el modelo es cuantizado, puede servir como punto de partida para adaptaciones con técnicas como LoRA sobre la versión original safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: depende de la cuantización. Para un modelo de ~31B parámetros, las cuantizaciones Q4_K_M y Q5_K_M ocupan aproximadamente 18-22 GB en memoria; Q8_0 ocupa ~33 GB; Q2_K ~13 GB. Estas cifras son estimaciones generales para modelos de ese tamaño, no valores específicos de este modelo.
- **GPU recomendadas**: para las cuantizaciones bajas (Q4, Q5) puede ejecutarse en una RTX 4090 (24 GB) o una A100 (40 GB). Para Q8 se requiere una GPU con 32 GB o más (A100, H100).
- **CPU**: puede ejecutarse en CPU con llama.cpp, aunque con latencia alta.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (si se convierten los pesos a formato compatible), text-generation-webui.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No hay información suficiente para comparar con otros modelos. Se puede indicar que es un modelo de ~31B en arquitectura gemma4, similar en tamaño a otros modelos de 30-34B como Llama-3.3-70B (no comparable) o Mixtral 8x7B, pero no se dispone de datos de rendimiento.

## Limitaciones y advertencias

- No se dispone de documentación oficial sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La licencia no está especificada en la model card, aunque una fuente externa indica Apache-2.0; se debe verificar antes de uso comercial.
- Al ser una cuantización, puede haber degradación de calidad en tareas complejas comparado con la versión completa en fp16.
- El número de parámetros reportado (575M) es inconsistente con el nombre de 31B, lo que sugiere un posible error en la metadata; se recomienda verificar el tamaño real del modelo original.
- No se garantiza la compatibilidad con todas las bibliotecas de inferencia; se recomienda probar con llama.cpp o Ollama.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Scarlett-v2.0-31B-GGUF
- Modelo original (safetensors): https://huggingface.co/ReadyArt/Dark-Scarlett-v2.0-31B
- Página de LLMs.info (información externa): https://llms.info/models/readyart-dark-scarlett-v2-0-31b-gguf-1326
- Análisis de arquitectura (hfviewer): https://hfviewer.com/ReadyArt/Dark-Scarlett-v2.0-31B
