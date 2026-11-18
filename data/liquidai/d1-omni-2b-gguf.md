# LiquidAI/d1-Omni-2B-GGUF

## Resumen

d1-Omni-2B-GGUF es la versión cuantizada en formato GGUF del modelo d1-Omni-2B de Liquid AI, un modelo de decisión multimodal (texto, imagen y audio) construido sobre LFM3-Omni-2B. A diferencia de un modelo generativo convencional, d1-Omni devuelve respuestas calibradas en un único paso forward, sin generar tokens de forma autorregresiva. Esto lo sitúa en la categoría que Liquid AI denomina "system-one": modelos rápidos, deterministas y de baja latencia pensados para tareas de clasificación, extracción, calibración y puntuación sobre un estado dado.

El modelo cuenta con aproximadamente 1.730 millones de parámetros (1.728.801.600 según los pesos en safetensors del modelo base) y soporta 16 idiomas, entre ellos el castellano. Su pipeline declarado es `audio-text-to-text`, y acepta como entrada un estado (texto o JSON), imágenes, vídeo (leído como fotogramas), clips de audio y preguntas escritas o habladas.

La relevancia de esta versión GGUF radica en que permite ejecutar el modelo en local sobre CPU y GPU mediante llama.cpp (a partir de la build b11960 / v0.8.0), exponiendo un endpoint `/v1/systemone` que responde a preguntas de tipo `noul`, `choice` y `score`. Es una pieza útil para construir capas de decisión ligeras en pipelines de agentes, enrutamiento o moderación sin depender de un LLM generativo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni; arquitectura exacta no detallada en la informacion) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en llama.cpp se recomienda `-b 8192 -ub 8192`; una imagen consume como maximo 4096 tokens) |
| Tipos de cuantizacion | GGUF; se documenta explicitamente Q8_0 (el repo incluye otras variantes GGUF, no enumeradas) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia "other" con nombre lfm1.0) |
| Formato de pesos | GGUF (repo de 10,3 GB; modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base d1-Omni-2B se construye sobre LFM3-Omni-2B, un modelo multimodal de Liquid AI de la familia LFM3 orientada a edge. La innovación principal de d1-Omni no está en el backbone sino en la cabeza de decisión: en lugar de generar texto token a token, produce respuestas calibradas en un solo paso forward. El autor lo etiqueta con los términos "decision-model", "system-one", "calibration" y "multimodal", lo que sugiere un entrenamiento orientado a tareas de clasificación, extracción y puntuación con calibración de probabilidades.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La model card remite a la del modelo original (LiquidAI/d1-Omni-2B) para los detalles de arquitectura y uso, que no se han incluido en esta ficha.

## Capacidades

- Decisión multimodal sobre un estado: acepta texto o JSON, imágenes, vídeo (como fotogramas) y clips de audio.
- Preguntas de tipo `noul` (sí/no/no sé), `choice` (selección entre criterios) y `score` (puntuación sobre una escala definida por el usuario).
- Respuestas calibradas en un único forward pass, sin generación autorregresiva de tokens.
- Entrada de preguntas escritas o habladas (audio-text-to-text).
- Soporte multilingüe en 16 idiomas, incluido el castellano.
- Integración con llama.cpp y endpoint `/v1/systemone` para inferencia local en CPU y GPU.
- Capacidad de procesar vídeo leyendo sus fotogramas (requiere `ffmpeg` en `PATH`).
- Soporte parcial de `multiple choice` (`"multiple": true`); extracción, estimaciones y boxes no están soportados todavía según la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un texto de reclamación, el modelo responde con preguntas `choice` para asignar el equipo (facturación, técnico, fraude) y `score` para prioridad, tal como muestra el ejemplo oficial de la model card. Adecuado por su baja latencia y salida calibrada.
- Moderación y clasificación de contenido: usar preguntas `noul` para determinar si un texto o imagen cumple políticas, con la ventaja de que la respuesta es una probabilidad calibrada y no una generación libre.
- Detección de intención de compra o reembolso: el ejemplo oficial ("I was charged twice this month, please refund one of them") ilustra cómo clasificar la intención del cliente en un solo paso.
- Análisis de imágenes en pipelines de inspección: enviar una imagen junto a un estado textual y formular preguntas `noul` o `choice` sobre su contenido (por ejemplo, presencia de objetos o categorías), aprovechando el presupuesto de 4096 tokens por imagen.
- Procesamiento de audio para atención al cliente: transcribir o clasificar clips de audio entrantes (preguntas habladas) para enrutarlos o priorizarlos sin un pipeline separado de ASR más LLM.
- Etiquetado y anotación asistida de datasets: usar `choice` y `score` para preetiquetar grandes volúmenes de texto, imagen o audio con un modelo pequeño ejecutable en local, reduciendo coste frente a APIs generativas.
- Filtro previo en sistemas de agentes: actuar como capa "system-one" que decide si una consulta requiere un LLM generativo completo o puede resolverse con una respuesta de clasificación, ahorrando tokens y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con ~1,73 B parámetros, una cuantización Q8_0 ocupa del orden de 1,8-2 GB de pesos; cuantizaciones menores (Q4, Q5) reducirían el requisito proporcionalmente, pero el repo no detalla el tamaño de cada variante.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100/H100 para despliegues de mayor concurrencia.
- CPU: el modelo está pensado para inferencia local en CPU mediante llama.cpp, según la model card.
- Despliegue: llama.cpp (build b11960 / v0.8.0 o superior), con `llama-server` y endpoint `/v1/systemone`. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Parámetros de ejecución: `llama-server -hf LiquidAI/d1-Omni-2B-GGUF:Q8_0 -b 8192 -ub 8192`. La pregunta se procesa en un único batch, por lo que `-b` y `-ub` deben cubrir el estado y los medios; una imagen consume como máximo la mitad de `-ub` (4096 tokens con `-ub 8192`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión multimodales con salida calibrada en un paso forward), por lo que no se puede establecer una comparativa rigurosa sin inventar datos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso; está diseñado para responder preguntas estructuradas (`noul`, `choice`, `score`).
- Soporte parcial en llama.cpp: `multiple choice` está soportado, pero extracción, estimaciones y boxes no lo están todavía según la model card.
- El vídeo requiere `ffmpeg` en `PATH` y se procesa como fotogramas, lo que puede limitar la fidelidad temporal.
- El presupuesto de tokens por imagen (máximo 4096 con `-ub 8192`) acota la resolución efectiva de entrada.
- Licencia lfm1.0 ("other"): es necesario revisar los términos del archivo LICENSE del repositorio antes de un uso comercial; no se detallan aquí las restricciones concretas.
- No se dispone de información sobre sesgos, tasas de alucinación o robustez idiomática más allá de la lista de idiomas soportados.
- La longitud de contexto del modelo no está documentada; los valores `-b 8192` son una recomendación de ejecución, no necesariamente el máximo del modelo.
- Al ser una versión GGUF, las capacidades pueden diferir ligeramente del modelo base en safetensors; la model card remite al modelo original para detalles.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/LiquidAI/d1-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Modelo LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Blog de Liquid AI sobre d1: https://www.liquid.ai/blog/open-d1
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b11960: https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Release v0.8.0 de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
