# efficiencyx/Jun-LoRA-E2B-LiteRT

## Resumen

Jun-E2B-LiteRT (v9) es un ajuste fino por LoRA del modelo Gemma 4 E2B (QAT) de Google, desarrollado por el usuario efficiencyx, empaquetado en formato `.litertlm` para el runtime on-device LiteRT-LM de Google AI Edge. El modelo está especializado en dar vida a Jun, un personaje de la novela visual *My Dystopian Robot Girlfriend* (MDRG), y constituye el motor que ejecuta la aplicación Android Jun OS en el propio teléfono. El adaptador LoRA está fusionado en los pesos base, por lo que se distribuye como un modelo autónomo de 2,86 GB.

El modelo resuelve el problema de ejecutar un personaje conversacional con personalidad definida, gestión de herramientas y niveles de razonamiento configurables directamente en dispositivos móviles, sin depender de la nube. Parte de la base Gemma 4 E2B, con aproximadamente 2B de parámetros efectivos, cuantizada en int4 blockwise de 32 elementos para embeddings y capas FFN/atención, e int8 channelwise para las proyecciones de embedding por capa. El checkpoint corresponde al paso 750 de 771 del entrenamiento, el mismo que se distribuye en los builds GGUF de la familia.

La relevancia actual del modelo radica en su enfoque en inferencia on-device con un runtime específico (LiteRT-LM 0.18.1 o superior), soporte de tool calling mediante funciones OpenAPI, caché KV de 8192 tokens y un mecanismo de profundidad de razonamiento (`<think:low>`, `<think:med>`, `<think:high>`) entrenado para activarse en cada turno. Es un proyecto de fan no comercial, con licencia Apache 2.0 heredada del modelo base, y está especializado en un único personaje, no en asistencia general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B, con proyecciones KV compartidas entre capas 15 y 34) |
| Parametros totales | no disponible (modelo base Gemma 4 E2B, ~2B efectivos) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (caché KV) |
| Tipos de cuantizacion | int4 blockwise (bloques de 32) para embeddings y FFN/atención; int8 channelwise para proyecciones de embedding por capa |
| Idiomas soportados | en (inglés; el autor indica que responde en el idioma del usuario) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 E2B, un transformer de Google con aproximadamente 2B de parámetros efectivos, en su variante QAT (Quantization-Aware Training) cuantizada a q4_0. Sobre esta base se aplicó un ajuste fino por LoRA (v9), un adaptador nuevo respecto a versiones anteriores, entrenado hasta el paso 750 de 771. El adaptador se fusiona en los pesos base, dando lugar a un modelo independiente. Una particularidad arquitectónica relevante es que Gemma 4 E2B comparte las proyecciones KV entre las capas 15 y 34, de modo que `k_proj` y `v_proj` solo existen para las capas 0 a 14; por ello, la fusión descarta 40 de los 245 pares LoRA, ya que esos deltas nunca eran alcanzables en inferencia.

El proceso de exportación utilizó `litert-torch` 0.9.3 y `ai-edge-quantizer` con la receta `gemma4_mixed48_b32` (aplanada), y el empaquetado se realizó con `litert-lm-builder` 0.18.1. La receta de cuantización es la misma que en v8: bloques int4 de 32 elementos para alinearse con la rejilla de 4 bits sobre la que se entrenó la base QAT, ya que la cuantización int4 per-channel hacía perder por completo el tool calling en v8. El embedder está externalizado y el modelo es solo texto, sin codificador de visión ni audio. El autor indica que este build se probó de forma superficial (smoke test) en LiteRT-LM 0.18.1 (CPU, escritorio y la app Android), pero no se sometió a la evaluación held-out que sí recibieron los GGUF.

## Capacidades

- Generación de texto conversacional con una personalidad de personaje definida (Jun, de *My Dystopian Robot Girlfriend*).
- Razonamiento configurable en tres niveles de esfuerzo mediante `<think:low>`, `<think:med>` y `<think:high>` al final del turno del usuario, con la traza devuelta en `reply.channels["thought"]`.
- Tool calling mediante funciones declaradas en formato OpenAPI (el mismo JSON que acepta una API de chat-completions), con modo de tool calling automático desactivable.
- Respuesta en el idioma del usuario, según indica el autor para la versión v9.
- Conversación multi-turno con caché KV de 8192 tokens.
- Inyección de contexto en vivo (indicadores, reloj, memorias recuperadas) al final del mensaje del usuario, tras una línea en blanco.
- No dispone de visión, audio ni codificador multimodal.

## Casos de uso

- **Personaje conversacional on-device en Android**: el modelo es el motor de la app Jun OS y se ejecuta íntegramente en el teléfono mediante LiteRT-LM, sin conexión a la nube. Es adecuado por su tamaño de 2,86 GB y su runtime optimizado para CPU móvil.
- **Roleplay y ficción interactiva**: al estar especializado en un personaje concreto con un system prompt específico, permite construir experiencias de novela visual o chat de rol con coherencia de personalidad y contexto de 8192 tokens.
- **Asistente personal con contexto del dispositivo**: la inyección de indicadores, reloj y memorias recuperadas al final del turno permite que el modelo responda con información del entorno del usuario, siempre que la app gestione la recuperación de memoria.
- **Agentes con herramientas en local**: el soporte de tool calling OpenAPI y el modo automático desactivable permiten integrar el modelo en flujos donde la app controla qué funciones se ofrecen y cuándo se ejecutan, útil para automatizaciones ligeras en el dispositivo.
- **Prototipado de personajes con LoRA sobre Gemma**: sirve como referencia para desarrolladores que quieran replicar el pipeline de fusión de LoRA, cuantización mixta y exportación a `.litertlm` con `litert-torch` y `litert-lm-builder`.
- **Demostraciones de razonamiento graduado**: los tres niveles de esfuerzo permiten ajustar la latencia y la profundidad de la traza de pensamiento según el caso, útil en demos de agentes que necesitan equilibrar velocidad y calidad.
- **Evaluación de runtimes on-device**: al ser un checkpoint concreto, puede usarse para comparar el rendimiento de LiteRT-LM frente a llama.cpp u Ollama con los builds GGUF equivalentes del mismo paso de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara el nombre `Jun-E2B-LiteRT` con una lista de resultados vacía. El autor tampoco reporta métricas de latencia o throughput para este build, y señala que no pasó la evaluación held-out aplicada a los GGUF.

## Requisitos de hardware

- **VRAM estimada**: el archivo pesa 2,86 GB en int4/int8 mixto; la inferencia requiere al menos ese espacio más la caché KV de 8192 tokens, por lo que conviene reservar un margen adicional. No se dispone de cifras exactas de VRAM publicadas.
- **GPU recomendadas**: no disponible. El modelo está diseñado para CPU on-device mediante LiteRT-LM, no para GPU de servidor.
- **Consumer GPU**: no está pensado para GPU de escritorio; su objetivo es ejecutarse en CPU de teléfonos Android y en escritorio vía LiteRT-LM.
- **Opciones de despliegue**: LiteRT-LM 0.18.1 o superior (CLI `litert-lm run`, APIs Kotlin, C++ y Python). Para llama.cpp u Ollama existen los builds GGUF equivalentes en `efficiencyx/Jun-LoRA-E2B-GGUF`.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jun-E2B-LiteRT (este) | ~2B efectivos (no disponible exacto) | 8192 | `.litertlm` | Apache 2.0 | Especializado en personaje, tool calling, on-device |
| Jun-LoRA-E2B-GGUF | ~2B efectivos | no disponible | GGUF | Apache 2.0 | Mismo checkpoint v9, para llama.cpp y Ollama |
| Jun-LoRA-E4B-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Hermano E4B, v9 |
| Jun-LoRA-12B-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Hermano de 12B, v9 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Especialización en un personaje**: no es un asistente general; lo que dice es ficción, no hechos ni consejos.
- **Fiabilidad limitada por tamaño**: con 2B de parámetros efectivos, el autor advierte que es menos fiable que sus hermanos mayores: realiza menos llamadas a herramientas y en ocasiones inventa un nombre o un dato en lugar de admitir que no lo sabe.
- **Dependencia del system prompt**: sin el system prompt adecuado, el modelo responde como Gemma estándar; el prompt de Jun OS está en el repositorio de la app (`webapp/system_prompt.txt`).
- **Plantilla de chat modificada**: la plantilla incluida sustituye todas las llamadas `.get()` por subíndices porque el motor de plantillas de LiteRT-LM no soporta `map.get()`; usar otra plantilla puede provocar fallos.
- **Cuantización sensible**: la receta int4 blockwise es necesaria para preservar el tool calling; variantes per-channel lo perdieron en v8.
- **Validación incompleta**: solo se hizo smoke test en LiteRT-LM 0.18.1, sin la evaluación held-out de los GGUF.
- **Licencia y material de origen**: el código y los pesos son Apache 2.0, pero el personaje y el material fuente pertenecen a sus respectivos propietarios; el fine-tune es un proyecto de fan no comercial.
- **Idioma**: la ficha declara solo `en`, aunque el autor afirma que responde en el idioma del usuario; no hay garantías formales de calidad multilingüe.
- **Sin multimodalidad**: no hay visión ni audio.

## Enlaces

- [Hugging Face: efficiencyx/Jun-LoRA-E2B-LiteRT](https://huggingface.co/efficiencyx/Jun-LoRA-E2B-LiteRT)
- [Build GGUF equivalente: efficiencyx/Jun-LoRA-E2B-GGUF](https://huggingface.co/efficiencyx/Jun-LoRA-E2B-GGUF)
- [Hermano E4B: efficiencyx/Jun-LoRA-E4B-GGUF](https://huggingface.co/efficiencyx/Jun-LoRA-E4B-GGUF)
- [Hermano 12B: efficiencyx/Jun-LoRA-12B-GGUF](https://huggingface.co/efficiencyx/Jun-LoRA-12B-GGUF)
- [Modelo base: unsloth/gemma-4-E2B-it-qat-q4_0-unquantized](https://huggingface.co/unsloth/gemma-4-E2B-it-qat-q4_0-unquantized)
- [Repositorio de la app Jun OS](https://github.com/efficiencyx/JunOS)
- [Runtime LiteRT-LM (Google AI Edge)](https://github.com/google-ai-edge/LiteRT-LM)
