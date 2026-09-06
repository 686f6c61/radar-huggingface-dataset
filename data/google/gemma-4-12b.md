# google/gemma-4-12B

## Resumen

Gemma 4 12B Unified es un modelo multimodal abierto desarrollado por Google DeepMind, integrado en la familia Gemma 4. Se trata de un modelo denso de 11,95 mil millones de parámetros, diseñado para ejecutarse en entornos locales como portátiles y estaciones de trabajo con GPU de consumo. Su característica diferenciadora es la arquitectura "encoder-free": a diferencia de otros modelos multimodales que emplean encoders separados para visión o audio, este modelo proyecta directamente los parches de imagen y las formas de onda de audio al espacio de embeddings del transformer mediante capas lineales ligeras. Esto reduce la latencia multimodal y permite ajustar todo el modelo en un solo pase.

Gemma 4 12B Unified ofrece una ventana de contexto de 256K tokens, soporte nativo de function calling, capacidades de razonamiento con modos de pensamiento configurables y soporte de system prompt nativo. La model card indica que mantiene soporte multilingüe en más de 140 idiomas, aunque la metadata de Hugging Face no confirma ese dato. El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, denso, con atencion hibrida (ventana deslizante de 1024 tokens + atencion global), capas globales con KV unificadas y RoPE proporcional (p-RoPE). Encoder-free para multimodalidad |
| Parametros totales | 11.959.730.224 (≈ 11,95 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos completos en safetensors de 24,0 GB; no se publican versiones cuantizadas en las fuentes consultadas) |
| Idiomas soportados | Mas de 140 idiomas segun la model card; la metadata de Hugging Face indica "no disponibles" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer decoder-only con atencion hibrida: intercala capas de atencion con ventana deslizante local y capas de atencion global completa, asegurando que la ultima capa sea siempre global. Las capas globales utilizan claves y valores unificados y aplican RoPE proporcional (p-RoPE) para optimizar el uso de memoria en contextos largos. El modelo tiene 48 capas, un tamano de vocabulario de 262K tokens y una ventana deslizante de 1024 tokens.

La variante 12B Unified se distingue por su diseno encoder-free: en lugar de encoders dedicados para vision o audio, los parches de imagen y las formas de onda de audio se proyectan mediante capas lineales ligeras directamente al espacio de embeddings del LLM. Esto permite que todas las modalidades fluyan a traves de un unico transformer. La model card no proporciona detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. Solo indica que el modelo se desarrollo en colaboracion con equipos internos de seguridad y que se realizaron evaluaciones automatizadas y humanas para mejorar la seguridad.

## Capacidades

- Multimodal nativo: procesa texto e imagen, y ofrece entrada de audio nativa en las variantes E2B, E4B y 12B. La descripcion general de la familia menciona entrada de video, aunque la tabla de especificaciones del modelo 12B no detalla explicitamente su soporte.
- Razonamiento con modos de pensamiento configurables (thinking modes), lo que permite ajustar el nivel de razonamiento antes de generar la respuesta.
- Generacion de codigo: la model card destaca mejoras notables en benchmarks de codificacion, sin proporcionar cifras concretas.
- Soporte nativo de tool calling / function calling, habilitando agentes autonomos que pueden invocar funciones externas.
- Capacidades agenteicas: el modelo esta disenado para flujos de trabajo de multiples pasos y tareas autonomas.
- Soporte de system prompt nativo: introduce el rol `system` de forma nativa, permitiendo conversaciones mas estructuradas.
- Multilinguismo: segun la model card, es capaz de trabajar en mas de 140 idiomas.
- Ventana de contexto de 256K tokens, apta para documentos extensos y razonamiento de largo alcance.

## Casos de uso

- Asistentes multimodales en local: gracias a su arquitectura encoder-free, el modelo puede responder preguntas sobre imagenes o notas de voz directamente en un portatil, sin necesidad de servidores externos ni encoders adicionales.
- Analisis de documentos extensos: con una ventana de 256K tokens, permite resumir manuales, informes tecnicos o transcripciones largas manteniendo coherencia a lo largo de todo el documento.
- Agentes autonomos con tool calling: el soporte nativo de function calling permite conectarlo a APIs, bases de datos o pipelines de CI/CD para automatizar tareas de desarrollo, despliegue o monitorizacion.
- Soporte de atencion al cliente multilingue: al estar proyectado para mas de 140 idiomas, puede gestionar conversaciones multi-turno en distintos idiomas dentro de un sistema de tickets o chat.
- Asistente de programacion: sus mejoras en codificacion y razonamiento permiten integrarlo en entornos de desarrollo integrados como copiloto, con la ventaja de entender capturas de pantalla o diagramas como entrada adicional.
- Analisis de audio local: la entrada de audio nativa posibilita transcribir y analizar reuniones, llamadas o notas de voz, generando resumenes o extrayendo tareas sin depender de servicios en la nube.
- Generacion de descripciones a partir de imagenes: puede describir contenido visual, extraer texto de capturas o generar alternativas textuales para imagenes en aplicaciones de accesibilidad o documentacion.

## Benchmarks y rendimiento

No se han publicado resultados numericamente detallados de benchmarks en la informacion disponible. La model card afirma que el modelo logra "mejoras notables en benchmarks de codificacion" y lo presenta como un razonador muy capaz, pero no proporciona valores concretos para MMLU, HumanEval, GSM8K ni otros conjuntos de evaluacion. Por tanto, se recomienda ejecutar evaluaciones propias antes de seleccionar este modelo para una tarea especifica.

## Requisitos de hardware

- El repositorio de pesos en safetensors ocupa 24,0 GB, lo que corresponde a pesos en FP16 o BF16 (aproximadamente 24 GB para los parametros).
- Para inferencia sin cuantizacion se recomienda una GPU con al menos 24 GB de VRAM, como una RTX 4090. Para acomodar la cache KV y las activaciones en contextos largos, seria preferible disponer de 32 GB o mas, como una A100 de 40 GB.
- Con cuantizacion a 8 bits (estimado: unos 12 GB de pesos) se puede ejecutar en tarjetas de 16 GB, como la RTX 4080 o la A4000.
- Con cuantizacion a 4 bits (estimado: unos 6 GB) es viable en GPUs de consumo con 12 GB, como la RTX 4070 o la RTX 3060 12GB.
- Para portatiles, el despliegue en local exige cuantizacion, ya que 24 GB de VRAM superan la capacidad de la mayoria de los equipos de consumo.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama y TGI son compatibles con modelos de este tipo, aunque la model card no proporciona datos de compatibilidad especificos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otros de la misma familia Gemma 4, basandose en las especificaciones publicadas. No se han publicado resultados de benchmarks comparativos en las fuentes consultadas, por lo que esta comparacion es puramente estructural.

| Modelo | Parametros totales | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 E4B | 4.5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B (este modelo) | 11.95B | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 31B Dense | 30.7B | 256K | Texto, imagen | Apache 2.0 |

No se dispone de datos verificados de otros modelos de 12B en la informacion proporcionada.

## Limitaciones y advertencias

- La metadata de Hugging Face indica "idiomas no disponibles" para este modelo, en contradiccion con la afirmacion de la model card de soporte en mas de 140 idiomas. Es necesario verificar el soporte real de idiomas antes de desplegarlo en produccion.
- No se publican resultados de benchmarks con cifras concretas, por lo que no se puede validar el rendimiento relativo a otros modelos con datos objetivos.
- El riesgo de alucinacion en tareas multimodales, especialmente con entradas de imagen y audio, debe evaluarse con casos de uso reales, ya que no se aportan evaluaciones detalladas.
- El modo de pensamiento configurable puede incrementar significativamente la latencia y el consumo de tokens, lo que debe tenerse en cuenta en aplicaciones en tiempo real.
- Para ejecutar el modelo sin cuantizacion se requieren 24 GB de VRAM, lo que excluye a la mayoria de los portatiles de consumo; el despliegue en laptops exige cuantizacion, lo que puede degradar la calidad de las respuestas.
- La licencia Apache 2.0 permite uso comercial, pero los terminos especificos de la licencia de Gemma deben revisarse en el enlace proporcionado antes de adoptar el modelo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/google/gemma-4-12B
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Reporte tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Repositorio de GitHub: https://github.com/google-gemma
- Documentacion oficial: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
