# bartowski/LFM3-VL-2B-GGUF

## Resumen

LFM3-VL-2B es un modelo multimodal (imagen-texto a texto) de LiquidAI, perteneciente a la familia LFM (Liquid Foundation Models) de tercera generación, orientado a ejecución en dispositivos edge. Con aproximadamente 1.729 millones de parámetros (según el checkpoint en safetensors), está diseñado para tareas conversacionales que combinan comprensión de texto e imágenes, un nicho donde los modelos pequeños multimodales son especialmente valiosos por su bajo coste de inferencia.

Esta ficha corresponde a la cuantización GGUF realizada por bartowski, un cuantizador muy conocido en la comunidad de llama.cpp, que publica versiones del modelo en formato GGUF con calibración imatrix. Esto permite ejecutar el modelo localmente en CPU y GPU de consumo mediante llama.cpp, Ollama u otras herramientas compatibles con GGUF, sin necesidad de infraestructura de servidor.

El modelo soporta entradas de texto e imagen (esta última requiere el archivo mmproj adicional) y utiliza un formato de prompt estilo ChatML con soporte de thinking mode (etiqueta `<think>`) y definiciones de herramientas (tool calling). Es relevante ahora por la creciente demanda de VLM compactos para despliegues locales y en el borde, donde modelos de 2B parámetros ofrecen un equilibrio entre capacidad multimodal y requisitos de hardware mínimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM de LiquidAI, multimodal image-text-to-text) |
| Parametros totales | 1.728.801.600 (checkpoint original en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K (y otras cuantizaciones Q2 disponibles en el repo) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de LiquidAI, tipo "other") |
| Formato de pesos | GGUF (cuantizado por bartowski); original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación) de LiquidAI, y la etiqueta "edge" sugiere que está optimizada para inferencia en dispositivos con recursos limitados. Al tratarse de un modelo de la pipeline image-text-to-text, incorpora un componente visual cuyo uso en llama.cpp requiere el archivo mmproj aparte de los pesos del modelo de lenguaje.

Sobre los datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no hay información en la documentación proporcionada. Tampoco se especifica si emplea técnicas de atención particulares. El repositorio de cuantización indica que el modelo no soporta decodificación especulativa y que las cuantizaciones usan matrices de importancia (imatrix) calculadas con llama.cpp release b11969 para preservar la calidad en cuantizaciones bajas.

## Capacidades

- Comprensión multimodal: acepta texto e imágenes como entrada (requiere el archivo mmproj para el procesado de imágenes en llama.cpp).
- Generación de texto conversacional en 16 idiomas, incluido el castellano.
- Thinking mode: el formato de prompt incluye `<think>` al inicio de la respuesta del asistente, lo que indica soporte de razonamiento explícito paso a paso.
- Tool calling: el prompt format admite definiciones de herramientas en el system prompt mediante la etiqueta `<tools>` con esquemas JSON.
- Ejecución local en CPU/GPU de consumo gracias al formato GGUF.
- No soporta decodificación especulativa según la model card de la cuantización.
- Capacidades de agentes multi-step: no disponible explícitamente, aunque el soporte de tool calling permite construir flujos agénticos básicos.

## Casos de uso

- Asistente multimodal en el borde: ejecución en portátiles o mini-PC para describir imágenes, extraer texto de capturas (OCR ligero) o responder preguntas sobre documentos escaneados, con solo ~1,1 GB en Q4_K_M.
- Atención al cliente multimodal: gestión de conversaciones multi-turno donde el usuario envía capturas de pantalla o fotos de productos; el tamaño de 2B permite instancias concurrentes baratas en CPU.
- Agentes con tool calling en local: el formato de prompt admite definiciones de funciones JSON, por lo que puede integrarse en frameworks de agentes (LangChain, llama.cpp function calling) para consultar APIs o bases de datos sin enviar datos a la nube.
- Aplicaciones móviles y embebidas: las cuantizaciones IQ3/Q2 (por debajo de 1 GB) hacen viable su despliegue en dispositivos con RAM muy limitada.
- Moderación y clasificación de contenido con imágenes: clasificación de imágenes subidas por usuarios combinada con generación de justificación textual.
- Prototipado rápido de VLM: ideal para desarrolladores que quieren experimentar con modelos vision-language sin GPU dedicada, usando Ollama o LM Studio.
- Traducción y comprensión multilingüe de contenido visual: soporte de 16 idiomas permite procesar imágenes con texto en árabe, chino, japonés, etc., y responder en el idioma del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,8 GB (IQ3_XXS) hasta ~3,5 GB (bf16) solo de pesos. Con Q4_K_M (1,12 GB), recomendado por el cuantizador, basta con ~2 GB de RAM/VRAM considerando contexto y el mmproj.
- Cabe sobradamente en GPUs de consumo: cualquier GPU con 4 GB de VRAM (RTX 3050, GTX 1660 con capas offload) ejecuta el modelo completo; también funciona íntegramente en CPU, e incluso en portátiles con 8 GB de RAM.
- GPUs recomendadas: no requiere GPU dedicada; en GPU, cualquier tarjeta moderna (RTX 3060/4060 o superior) ofrecerá latencias muy bajas para un modelo de este tamaño.
- Opciones de despliegue: llama.cpp (release b11969 o posterior), Ollama, LM Studio y cualquier runtime compatible con GGUF. No hay información sobre soporte en vLLM o TGI para estos archivos GGUF.
- Velocidad estimada: no disponible; al ser un modelo de ~2B parámetros, se espera throughput alto incluso en CPU, pero no hay cifras publicadas en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Formato | Licencia |
|---|---|---|---|---|
| LFM3-VL-2B (esta ficha) | ~1,73B | Sí (imagen+texto) | GGUF / safetensors | lfm1.0 (other) |
| Qwen3-VL-2B (Alibaba) | ~2B | Sí (imagen+texto) | GGUF / safetensors | Apache 2.0 |
| SmolVLM2 2.2B (HuggingFace) | ~2,2B | Sí (imagen+texto+video) | safetensors / GGUF | Apache 2.0 |

En comparación con sus alternativas, LFM3-VL-2B compite en la misma franja de tamaño (~2B) y modalidad, pero su licencia lfm1.0 es más restrictiva que las licencias Apache 2.0 de Qwen3-VL y SmolVLM2, lo que debe evaluarse para uso comercial. No hay datos de benchmarks publicados que permitan comparar rendimiento cuantitativo en esta ficha.

## Limitaciones y advertencias

- Licencia lfm1.0 (tipo "other"): no es una licencia permisiva estándar; debe revisarse el texto de la licencia antes de cualquier uso comercial, ya que puede incluir restricciones específicas de LiquidAI.
- Riesgo de alucinación: propio de modelos de 2B parámetros; en tareas de razonamiento complejo y descripción detallada de imágenes puede generar contenido incorrecto con apariencia plausible.
- Idioma: soporta 16 idiomas, pero el rendimiento en idiomas distintos del inglés (incluido el castellano) puede ser inferior; no hay datos de evaluación multilingüe disponibles.
- Longitud de contexto: no documentada en la información proporcionada; verificarla en la model card original antes de diseñar aplicaciones con documentos largos.
- Para usar imágenes en llama.cpp es necesario descargar además el archivo mmproj, no incluido en los GGUF del modelo de lenguaje.
- Las cuantizaciones por debajo de Q4 (IQ3, Q2) presentan degradación de calidad notable según el propio cuantizador; evitarlas en producción salvo restricciones extremas de memoria.
- Sesgos conocidos: no documentados en la información disponible.
- Es una cuantización de terceros (bartowski), no un release oficial de LiquidAI; cualquier problema de calidad debe contrastarse con los pesos originales.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/bartowski/LFM3-VL-2B-GGUF
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- llama.cpp (herramienta de cuantización e inferencia): https://github.com/ggml-org/llama.cpp
- Release de llama.cpp usado para la cuantización: https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Archivo recomendado (Q4_K_M): https://huggingface.co/bartowski/LFM3-VL-2B-GGUF/blob/main/LFM3-VL-2B-Q4_K_M.gguf
- Licencia del modelo: https://huggingface.co/bartowski/LFM3-VL-2B-GGUF/blob/main/LICENSE
- Paper, blog oficial y demos: no disponible
