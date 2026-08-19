# alekshandru/gemma-4-E4B

## Resumen
Gemma 4 E4B es un modelo de lenguaje multimodal de la familia Gemma 4, desarrollado por Google DeepMind y subido a Hugging Face por el usuario alekshandru. Se trata de un modelo denso diseñado para procesar entradas de texto, imagen y audio, generando exclusivamente salidas de texto. Su principal característica es el uso de Per-Layer Embeddings (PLE), que permite que los parámetros efectivos sean de 4.500 millones, aunque el peso total del modelo con embeddings asciende a aproximadamente 8.000 millones de parámetros (7.996.156.490 según los safetensors).

Este modelo destaca por su eficiencia para el despliegue en dispositivos de gama alta, portátiles y servidores, gracias a su arquitectura optimizada y su ventana de contexto de 128.000 tokens. Además, incorpora soporte nativo para function calling, modos de razonamiento configurables y un sistema de atención híbrida que intercala ventanas deslizantes con atención global. La licencia Apache 2.0 y su naturaleza multimodal lo convierten en una opción relevante para desarrolladores que buscan un modelo abierto y versátil sin necesidad de infraestructura masiva.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window + global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 7.996.156.490 (~8B con embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin cuantizaciones listadas) |
| Idiomas soportados | Mas de 140 idiomas (segun la model card) |
| Licencia | Apache 2.0 (el enlace de la card apunta a la licencia especifica de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura de transformer decoder-only densa, sin mezcla de expertos (MoE). La atención es híbrida: intercala capas con ventana deslizante local de 512 tokens con capas de atención global, garantizando que la última capa sea siempre global. Esto permite manejar contextos largos de 128K tokens con un coste computacional reducido. Además, las capas globales utilizan Keys y Values unificados y aplican Proportional RoPE (p-RoPE) para optimizar la memoria en contextos extensos.

La innovación principal es el uso de Per-Layer Embeddings (PLE): cada capa del decodificador tiene su propia tabla de embeddings pequeña para cada token. Estas tablas son grandes en memoria, pero solo se usan para búsquedas rápidas, lo que explica que los parámetros efectivos (4.5B) sean muy inferiores a los totales (8B). Para el procesamiento multimodal, el modelo utiliza encoders dedicados: un encoder de visión de aproximadamente 150M de parámetros y un encoder de audio de aproximadamente 300M de parámetros, cuyas salidas se proyectan al espacio del LLM. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas de RLHF/DPO en la información proporcionada.

## Capacidades
- Generación de texto y razonamiento avanzado, con modos de pensamiento (thinking mode) configurables para tareas complejas.
- Entrada multimodal nativa: procesa texto, imágenes con ratio de aspecto y resolución variable, y audio (soportado de forma nativa en el modelo E4B).
- Soporte nativo de function calling y tool calling, lo que permite integrarlo en pipelines de agentes autónomos.
- Capacidades agénticas: puede realizar razonamiento multi-paso y encadenar llamadas a herramientas.
- Soporte multilingüe para más de 140 idiomas.
- Soporte nativo del rol `system` en los prompts, lo que facilita conversaciones estructuradas y controlables.
- Optimizado para ejecución on-device, diseñado específicamente para portátiles y dispositivos móviles de gama alta.

## Casos de uso
- Asistentes de voz en el dispositivo: al procesar audio nativamente, puede transcribir y responder en tiempo real sin depender de un servicio en la nube, ideal para aplicaciones de privacidad.
- Análisis de documentos multimodales: combina la lectura de imágenes (gráficos, diagramas, capturas) con texto extenso gracias a su contexto de 128K tokens, útil para revisar informes técnicos o legales.
- Agentes autónomos de automatización: con soporte de function calling, puede gestionar flujos de trabajo complejos como la gestión de calendarios, envío de correos o interacción con APIs internas.
- Atención al cliente multilingüe: puede mantener conversaciones multi-turno en más de 140 idiomas con memoria de contexto amplia, reduciendo la necesidad de sistemas de derivación.
- Generación de código asistida: su capacidad de razonamiento y su ventana larga permiten trabajar con repositorios extensos, generando o refactorizando código con conocimiento del contexto completo.
- Transcripción y resumen de audio: convierte reuniones o podcasts en texto y genera resúmenes ejecutivos, procesando el audio directamente sin un paso previo de ASR externo.
- Sistemas de visión por computador en edge: su encoder de visión permite clasificar imágenes o responder preguntas visuales (VQA) en dispositivos con recursos limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks específicos para el modelo Gemma 4 E4B en la información proporcionada. La model card menciona mejoras generales en codificación y razonamiento para la familia Gemma 4, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados para esta variante.

## Requisitos de hardware
- VRAM estimada para inferencia: basándose en el tamaño total de 7.996 millones de parámetros, se estima que en precisión bf16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización int8 se reduciría a unos 8 GB, y en int4 a unos 4 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40 GB) permiten ejecutar el modelo en bf16 sin problemas. Para cuantización int8, una RTX 3080/4080 con 10-12 GB sería suficiente.
- Al tratarse de un modelo diseñado para on-device, también puede ejecutarse en CPU mediante la conversión a GGUF con llama.cpp, aunque el repo no incluye estos formatos.
- Opciones de despliegue: compatible con transformers, vLLM y TGI para servidores de producción. Para entornos locales, se puede convertir a GGUF y usar Ollama o llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 E4B | 8B totales (4.5B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 3 4B | 4B | 128K | Texto, imagen | Apache 2.0 |
| Qwen2.5 7B | 7.6B | 128K | Texto | Apache 2.0 |
| Llama 3.2 3B | 3.2B | 128K | Texto | Licencia Llama 3.2 |

El Gemma 4 E4B se diferencia principalmente por su soporte nativo de audio, su arquitectura con PLE (que reduce los parámetros efectivos) y su atención híbrida. Frente a Gemma 3 4B, añade audio y un sistema de atención más avanzado. Comparado con Qwen2.5 7B, ofrece multimodalidad completa y un diseño más eficiente para edge. La comparativa de rendimiento numérico no es posible al no disponer de benchmarks publicados.

## Limitaciones y advertencias
- El repositorio en Hugging Face está subido por un usuario independiente (alekshandru), no directamente por Google DeepMind. Se recomienda verificar la integridad de los pesos y la autenticidad del modelo antes de usarlo en producción.
- No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens ni los procesos de alineación (RLHF/DPO), lo que limita la evaluación de sesgos y comportamientos.
- Aunque el tag indica licencia Apache 2.0, el enlace de la model card apunta a una licencia específica de Gemma 4. Es imprescindible revisar los términos exactos de esa licencia antes de un uso comercial.
- Riesgo de alucinaciones inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con datos poco frecuentes.
- El tamaño del repositorio es de 48.1 GB en safetensors, lo que requiere un almacenamiento considerable y un ancho de banda alto para la descarga.
- No se han publicado resultados de benchmarks para este modelo, por lo que su rendimiento relativo frente a alternativas no puede verificarse de forma objetiva con los datos disponibles.

## Enlaces
- Hugging Face: https://huggingface.co/alekshandru/gemma-4-E4B
- Technical Report: https://arxiv.org/abs/2607.02770
- Launch Blog: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- GitHub: https://github.com/google-gemma
