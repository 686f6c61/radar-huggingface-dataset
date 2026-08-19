# mradermacher/Qwen3.8-27B-Dominatrix-i1-GGUF

## Resumen

Este repositorio contiene el archivo de calibración (imatrix) para el modelo `allura-org/Qwen3.8-27B-Dominatrix`, un fine-tune orientado a roleplay y escritura creativa basado en el modelo Qwen3.8-27B de Alibaba. El autor, mradermacher, publica aquí únicamente el archivo `imatrix` (0.1 GB) que permite generar cuantizaciones GGUF de alta calidad mediante la técnica de importance matrix; los pesos cuantizados estáticos se distribuyen en un repositorio hermano (`Qwen3.8-27B-Dominatrix-GGUF`).

El modelo base Qwen3.8-27B es un modelo de visión-lenguaje con 27 mil millones de parámetros, contexto nativo de 262 144 tokens y soporte para entrada de imagen y vídeo. El fine-tune "Dominatrix" ajusta el modelo para conversaciones de rol y narrativa creativa, con etiquetas que advierten contenido no apto para todos los públicos. Este repositorio es relevante para quienes deseen crear sus propias cuantizaciones GGUF optimizadas para su hardware, ya que el archivo imatrix mejora la calidad de la cuantización en comparación con los métodos estáticos.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el contenido generado por el fine-tune puede incluir temáticas adultas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), basada en Qwen3.8-27B |
| Parametros totales | 27B (modelo base)¹ |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (disponibles en el repo estático) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (solo archivo imatrix en este repo; pesos en repo estático) |

¹ El dato de HuggingFace indica 3 391 984 parámetros, pero corresponde a un archivo de configuración o metadatos, no al modelo completo. El nombre y el modelo base confirman 27B.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer estándar con mecanismo de atención de tiempo completo, diseñada para procesar tanto texto como imágenes y vídeo. Incorpora un codificador visual que permite la entrada multimodal. El fine-tune "Dominatrix" fue entrenado con las herramientas Axolotl y Unsloth, según las etiquetas del repositorio, sobre un conjunto de datos orientado a roleplay y escritura creativa. No se especifican detalles sobre el número de tokens de entrenamiento ni si se utilizaron técnicas de RLHF o DPO.

El archivo imatrix incluido en este repositorio se genera mediante la técnica de importance matrix, que asigna pesos de importancia a cada tensor basándose en la activación real del modelo sobre un conjunto de calibración. Esto permite que las cuantizaciones posteriores (Q4_K_M, IQ3_XS, etc.) conserven mejor la perplejidad y la calidad de generación en comparación con cuantizaciones estáticas convencionales.

## Capacidades

- Generación de texto y diálogo conversacional, especialmente optimizado para roleplay y narrativa creativa.
- Entrada multimodal: procesamiento de imágenes y vídeo (capacidad heredada del modelo base Qwen3.8-27B).
- Razonamiento y comprensión de contexto largo gracias a la ventana de 262 144 tokens.
- Soporte de tool calling y function calling (si el modelo base lo incluye; no confirmado en la documentación disponible).
- Capacidad de "thinking mode" (modo de razonamiento extendido) según las especificaciones del modelo base.
- Generación de contenido con estilo literario y caracterización de personajes, gracias al fine-tune específico.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones multi-turno con personajes definidos, aprovechando su contexto de 262k tokens para recordar detalles de la trama y el historial del usuario.
- Escritura creativa asistida: generación de diálogos, descripciones y tramas para novelas, guiones o juegos de rol, con un tono adaptado al estilo "Dominatrix".
- Prototipado de personajes NPC en videojuegos: integración en motores de juego mediante GGUF y llama.cpp para dotar de personalidad y coherencia a personajes no jugables.
- Creación de contenido para comunidades de escritura: asistencia en la redacción de fanfiction o relatos colaborativos, con control fino sobre el estilo y la temática.
- Evaluación de cuantizaciones personalizadas: el archivo imatrix permite a desarrolladores generar sus propios quants GGUF adaptados a su hardware y comparar calidad/perplejidad con los quants estáticos.
- Despliegue en entornos con recursos limitados: al cuantizar a 4 bits (p. ej., Q4_K_M), el modelo ocupa entre 16 y 18 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o incluso en configuraciones con 16 GB mediante cuantizaciones más agresivas (IQ3_XS, Q3_K_M).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web menciona que Qwen3.8-27B tiene benchmarks publicados, pero no se proporcionan cifras concretas en este contexto. Por tanto, no se incluyen tablas comparativas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Cuantización 4 bits (Q4_K_M): ~16-18 GB.
  - Cuantización 8 bits (Q8_0): ~28-30 GB.
  - BF16 completo: ~54.7 GB.
- GPUs recomendadas:
  - Consumer: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantización 4 bits.
  - Profesional: A100 (40/80 GB) o H100 para BF16 o cuantizaciones de alta precisión.
- Ejecución en CPU: posible con llama.cpp y cuantizaciones pequeñas (Q2_K, IQ1_M) en sistemas con 32 GB de RAM, aunque con latencia alta.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, Transformers (con soporte para GGUF).
- Latencia y throughput: no disponibles en la documentación; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262 144 | Apache 2.0 | safetensors | Multimodal general |
| Qwen3.8-27B-Dominatrix (este) | 27B | 262 144 | Apache 2.0 | GGUF (imatrix) | Roleplay / escritura creativa |
| Llama 3.1 8B | 8B | 128 000 | Llama 3.1 | GGUF | General, menor capacidad |
| Mistral 7B | 7B | 32 000 | Apache 2.0 | GGUF | General, eficiente |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito: el fine-tune está etiquetado como `not-for-all-audiences` y orientado a roleplay adulto; puede generar lenguaje ofensivo o sexualmente explícito.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede producir información falsa o sesgada, especialmente en temas delicados.
- Idioma: solo inglés confirmado; el rendimiento en otros idiomas no está garantizado.
- Contexto largo: aunque soporta 262k tokens, el rendimiento efectivo puede degradarse en contextos extremadamente largos sin técnicas de gestión de atención.
- Este repositorio no contiene los pesos del modelo, solo el archivo imatrix; para usar el modelo es necesario descargar los quants del repositorio estático o generar los propios.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales según la jurisdicción si se distribuye material explícito.

## Enlaces

- Repositorio actual: https://huggingface.co/mradermacher/Qwen3.8-27B-Dominatrix-i1-GGUF
- Repositorio de quants estáticos: https://huggingface.co/mradermacher/Qwen3.8-27B-Dominatrix-GGUF
- Modelo base: https://huggingface.co/allura-org/Qwen3.8-27B-Dominatrix
- Guía de hardware y despliegue: https://gingerlabs.ai/blog/qwen-38-27b-hardware-requirements-and-how-to-deploy-locally
- Especificaciones y benchmarks: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Ejecución local con Ollama: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
