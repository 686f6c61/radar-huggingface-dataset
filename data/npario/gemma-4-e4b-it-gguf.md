# npario/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B es un modelo de lenguaje multimodal desarrollado por Google DeepMind, diseñado para ejecutarse en dispositivos de gama media como portátiles y teléfonos de gama alta. Este repositorio concreto, `npario/gemma-4-E4B-it-GGUF`, es una cuantización en formato GGUF del modelo original `google/gemma-4-E4B-it`, generada por el usuario npario (probablemente mediante la herramienta Unsloth). El modelo base es la variante *instruction-tuned* de Gemma 4 E4B, que combina entrada de texto, imagen y audio (este último solo en los modelos pequeños) con salida de texto.

Con 4.5 mil millones de parámetros efectivos (8 mil millones contando embeddings), una ventana de contexto de 128K tokens y una licencia Apache 2.0, este modelo destaca por su equilibrio entre capacidades y requisitos de hardware. Su arquitectura híbrida de atención (ventana deslizante + atención global) y su soporte nativo para *function calling* y modos de razonamiento configurable lo convierten en una opción atractiva para aplicaciones de agentes, asistentes multimodales y despliegue local. La cuantización GGUF permite ejecutarlo en GPUs de consumo con 8 GB de VRAM o menos, dependiendo de la precisión elegida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window de 512 tokens + atención global), p-RoPE, KV unificados en capas globales |
| Parametros totales | 7.518.069.290 (8B con embeddings, 4.5B efectivos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF (diversas cuantizaciones, no listadas en la información disponible; el tamaño del repo de 746.6 GB sugiere múltiples variantes) |
| Idiomas soportados | Más de 140 idiomas (según documentación oficial de Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base también está disponible en safetensors) |

## Arquitectura y entrenamiento

Gemma 4 E4B emplea una arquitectura de transformer denso con un mecanismo de atención híbrida que intercala ventanas deslizantes locales (512 tokens) con capas de atención global, garantizando que la última capa sea siempre global. Este diseño reduce el coste computacional en contextos largos sin sacrificar la capacidad de razonamiento global. Para optimizar la memoria en secuencias extensas, las capas globales utilizan claves y valores unificados (unified KV) y aplican RoPE proporcional (p-RoPE). El modelo cuenta con 42 capas y un vocabulario de 262K tokens.

La variante E4B incluye un codificador de visión de aproximadamente 150M de parámetros y un codificador de audio de unos 300M, lo que le permite procesar entradas multimodales. El entrenamiento del modelo base incluye fases de preentrenamiento y ajuste por instrucciones, aunque los detalles específicos (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Esta versión *instruction-tuned* está optimizada para seguir instrucciones, soportar *function calling* nativo y ofrecer modos de razonamiento configurables (incluido un modo de pensamiento explícito).

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento configurable (thinking mode).
- Procesamiento multimodal: entrada de texto, imagen (con resolución y relación de aspecto variables) y audio (solo en E2B y E4B).
- Soporte nativo de *function calling* / *tool calling*, lo que permite integrar el modelo en pipelines de agentes.
- Capacidades de agente y razonamiento multi-paso, con soporte para system prompt nativo.
- Multilingüe: más de 140 idiomas soportados.
- Ventana de contexto de 128K tokens, adecuada para documentos largos y conversaciones extensas.
- Optimizado para ejecución en dispositivos (on-device), con bajo consumo de memoria gracias a la cuantización GGUF.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens) y utilizar *function calling* para consultar bases de datos o APIs de pedidos, manteniendo un historial completo de la interacción.
- Asistentes multimodales para soporte técnico: al aceptar imágenes y audio, puede analizar capturas de pantalla, diagramas o mensajes de voz del usuario para diagnosticar problemas y ofrecer soluciones paso a paso.
- Generación de código en producción: con soporte nativo de *tool calling*, puede integrarse en entornos de desarrollo para autocompletar, refactorizar o generar tests, y conectarse a herramientas de CI/CD mediante funciones externas.
- Análisis de documentos extensos: su contexto de 128K permite resumir informes anuales, contratos o artículos científicos completos sin truncamiento, extrayendo conclusiones y datos clave.
- Asistentes de voz locales: al procesar audio de entrada, puede servir como interfaz conversacional en aplicaciones de voz sin depender de servicios en la nube, ideal para entornos con privacidad estricta.
- Agentes autónomos de investigación: combinando razonamiento multi-paso, búsqueda web (vía *function calling*) y procesamiento de imágenes, puede recopilar información de múltiples fuentes y elaborar informes estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio específico. La model card del modelo base no incluye tablas de rendimiento numérico (MMLU, HumanEval, GSM8K, etc.). Se recomienda consultar la documentación oficial de Google DeepMind para obtener datos comparativos de Gemma 4 E4B frente a otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada: según la página gemma4.dev, el modelo requiere un mínimo de 8 GB de VRAM para ejecutarse con cuantizaciones bajas. Para cuantizaciones GGUF de 4 bits (Q4_K_M), el archivo pesa aproximadamente 8.4 GB (dato de local-ai-zone para el repo de Unsloth), lo que sugiere que cabe en GPUs con 8-10 GB de VRAM.
- GPUs recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. También puede ejecutarse en Apple Silicon (M1/M2/M3) con suficiente memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (Text Generation Inference) y Unsloth Studio.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización, el hardware y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B (este) | 4.5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF |
| Gemma 3 4B | 4B | 128K | Texto, imagen | Gemma Terms (uso comercial permitido) | Safetensors, GGUF |
| Llama 3.2 3B | 3B | 128K | Texto (solo) | Llama 3.2 Community License | Safetensors, GGUF |
| Qwen2.5 7B | 7.6B | 128K | Texto (solo) | Apache 2.0 | Safetensors, GGUF |

Nota: los datos de Gemma 3 4B, Llama 3.2 3B y Qwen2.5 7B son de conocimiento general y no se han verificado en la información proporcionada. No se dispone de comparativas de rendimiento numérico.

## Limitaciones y advertencias

- Este repositorio es una re-subida de un tercero (npario), no un lanzamiento oficial de Google. Aunque la licencia Apache 2.0 permite la redistribución, se recomienda verificar la integridad de los archivos y comparar con el repo original de Unsloth (`unsloth/gemma-4-E4B-it-GGUF`).
- El modelo puede presentar sesgos presentes en los datos de entrenamiento, aunque no se han documentado específicamente para esta versión.
- Riesgo de alucinación en tareas de generación de hechos, especialmente en contextos largos o con información ambigua.
- La ventana de contexto de 128K es amplia, pero el rendimiento puede degradarse en secuencias muy largas; se recomienda probar con casos reales.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario revisar los términos específicos de la licencia de Gemma 4 (enlace en la documentación oficial).
- El soporte de audio solo está disponible en los modelos pequeños (E2B y E4B); los modelos medianos (26B A4B y 31B) no lo incluyen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/npario/gemma-4-E4B-it-GGUF
- Modelo base (Google): https://huggingface.co/google/gemma-4-E4B-it
- Repo GGUF de Unsloth: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Documentación oficial de Gemma 4: https://ai.google.dev/gemma/docs/core
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Página de DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guía de Unsloth para Gemma 4: https://docs.unsloth.ai/models/gemma-4
