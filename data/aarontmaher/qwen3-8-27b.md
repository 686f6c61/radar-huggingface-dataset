# aarontmaher/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal (texto e imagen) de 27 000 millones de parámetros, desarrollado por Alibaba como parte de la familia Qwen3.8. Se presenta como la generación más capaz de la serie Qwen de código abierto, con mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo combina un encoder de visión con un núcleo de lenguaje causal de arquitectura híbrida, que alterna capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), lo que permite manejar contextos nativos de 262 144 tokens, extensibles hasta 1 000 000.

El repositorio en Hugging Face (subido por el usuario aarontmaher, no por el equipo oficial de Qwen) contiene los pesos en formato safetensors y archivos de configuración compatibles con Transformers, vLLM, SGLang y TokenSpeed. El modelo destaca por su modo de pensamiento flexible (thinking mode), que puede activarse o desactivarse por petición, y por su capacidad nativa de comprensión de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet + Gated Attention |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | FP8 y NVFP4 (según colección de Hugging Face); no se especifican otros formatos |
| Idiomas soportados | No disponible (los metadatos no lo indican; Qwen suele soportar múltiples idiomas, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con un encoder de visión integrado. La arquitectura del bloque de lenguaje sigue un patrón híbrido: cada grupo de 16 capas contiene 3 capas de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de 1 capa de Gated Attention (atención completa con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). En total hay 64 capas, con dimensión oculta de 5120 y FFN intermedio de 17 408. La salida LM tiene 248 320 tokens (padding). El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque no se detallan el número de tokens ni la composición del dataset en la información disponible. La model card menciona mejoras en razonamiento agéntico, planificación autónoma y manejo de feedback del entorno, lo que sugiere un post-entrenamiento orientado a tareas de agente. El modo de pensamiento está activado por defecto y puede ajustarse mediante el parámetro `reasoning_effort`, además de conservar el contexto de razonamiento histórico con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) configurable por petición.
- Comprensión de imágenes y vídeos de forma nativa: diagramas STEM, documentos escaneados, capturas y vídeos de larga duración (hasta una hora).
- Codificación y tareas de terminal agéntico: ejecución de comandos, depuración y resolución de problemas en entornos de línea de comandos.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Razonamiento multi-paso y planificación autónoma con manejo de feedback del entorno.
- Multilingüismo: no confirmado oficialmente en los metadatos, pero la familia Qwen tradicionalmente soporta decenas de idiomas.
- Contexto largo: 262 144 tokens nativos, ampliable a 1 000 000 mediante técnicas de extensión.

## Casos de uso

- Asistente de programación en terminal: el modelo puede ejecutar comandos, interpretar errores y proponer correcciones en tiempo real, gracias a su entrenamiento en tareas agénticas de terminal (Terminal Bench 2.1) y su capacidad de razonamiento multi-paso.
- Análisis de documentos técnicos con imágenes: puede extraer información de diagramas, gráficos y tablas en PDFs o capturas, combinando visión y lenguaje para resumir o responder preguntas sobre el contenido.
- Automatización de tareas de investigación: con su contexto de 262K tokens, puede procesar artículos largos, resúmenes de literatura y datos experimentales, generando informes estructurados.
- Agente de atención al cliente multimodal: capaz de interpretar capturas de pantalla, vídeos de demostración o documentos enviados por el usuario, manteniendo conversaciones de múltiples turnos con memoria de contexto amplia.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o corrección automática de errores.
- Análisis de vídeo para vigilancia o revisión de calidad: el modelo puede procesar vídeos de hasta una hora, identificando eventos, objetos o anomalías y generando descripciones textuales.
- Asistente de investigación científica: con su capacidad de razonamiento y visión, puede ayudar a interpretar gráficos experimentales, formular hipótesis y redactar secciones de artículos.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos, pero la información proporcionada está incompleta: solo se muestra la cabecera y la primera fila de la sección "Coding" (Terminal Bench 2.1, "Agentic terminal coding"). No se han proporcionado los valores numéricos de las puntuaciones. Los modelos comparados son Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. No se dispone de resultados completos para MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en 27,8 B parámetros):
  - FP16/BF16: ~55,6 GB (coincide con el tamaño del repositorio)
  - INT8: ~28 GB
  - INT4: ~14 GB
- GPU recomendadas:
  - Para FP16: A100 80 GB, H100 80 GB, o múltiples GPUs (p. ej., 2× RTX 4090 con tensor parallelism)
  - Para INT8: RTX 4090 24 GB, A10G 24 GB, L4 24 GB
  - Para INT4: RTX 3090 24 GB, RTX 4080 16 GB (con margen limitado)
- Cabe en GPUs de consumo (RTX 4090, 3090) solo con cuantización INT4/INT8; para FP16 se requiere hardware profesional o multi-GPU.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers, llama.cpp (si se generan pesos GGUF), Ollama (si se publica).
- Latencia y throughput: no disponibles. Se espera que la combinación de Gated DeltaNet (atención lineal) y MTP mejore la velocidad de decodificación frente a modelos densos puros, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8 B | 262K (hasta 1M) | Híbrido DeltaNet + Attention, multimodal | Apache 2.0 | Pesos abiertos (repo de terceros) |
| Qwen3.6-27B | ~27 B | No disponible | No disponible | Apache 2.0 (presumible) | Pesos abiertos |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | API propietaria |
| Muse Glimmer-30B | ~30 B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de especificaciones detalladas de los modelos comparados más allá de la mención en la tabla de benchmarks. La comparativa se limita a lo publicado en la model card.

## Limitaciones y advertencias

- El repositorio en Hugging Face está subido por un usuario independiente (aarontmaher), no por el equipo oficial de Qwen. Aunque la model card parece oficial, se recomienda verificar la autenticidad de los pesos antes de usarlos en producción.
- No se han publicado resultados completos de benchmarks en la información disponible; las afirmaciones de rendimiento de la model card no pueden verificarse de forma independiente.
- Los idiomas soportados no están especificados; aunque la familia Qwen suele ser multilingüe, no hay confirmación para esta versión concreta.
- El modelo es multimodal (imagen y vídeo), pero no se especifican los formatos de vídeo ni la resolución máxima soportada.
- La extensión de contexto a 1M tokens puede requerir técnicas adicionales (como interpolación de RoPE) y no está garantizada en todos los entornos de inferencia.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento largo o con entradas multimodales ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero los pesos pueden estar sujetos a términos adicionales si se redistribuyen; se recomienda revisar la documentación oficial de Qwen.
- No se dispone de información sobre sesgos específicos del modelo ni sobre su comportamiento en dominios sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aarontmaher/Qwen3.8-27B
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo de Yottalabs sobre especificaciones y despliegue: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Colección de cuantizaciones FP8/NVFP4: https://huggingface.co/collections/huginnfork/qwen38-27b
- Anuncio de Qwen 3.8 en OpenLM: https://openlm.ai/qwen3.8/
- Resumen de AINews sobre Qwen 3.8: https://www.latent.space/p/ainews-qwen-38-max24t-and-27b-new
