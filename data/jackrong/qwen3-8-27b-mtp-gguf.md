# Jackrong/Qwen3.8-27B-MTP-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, desarrollado por el equipo Qwen y redistribuido en este repositorio por el usuario Jackrong en formato GGUF. Se presenta como la generación más capaz de la familia Qwen3.8, construida sobre la base arquitectónica de Qwen3.5. Es un modelo denso de 27 000 millones de parámetros, nativo de visión-lenguaje, capaz de comprender imágenes y vídeos, con control flexible del modo de pensamiento. Está diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte, con una ventana de contexto nativa de 262 144 tokens extensible hasta 1 000 000.

El repositorio contiene pesos en formato GGUF, lo que facilita su despliegue en entornos de inferencia locales con herramientas como llama.cpp u Ollama. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Aunque el modelo declara 27B de parámetros, el archivo safetensors presente en el repositorio muestra 460 730 096 parámetros, una discrepancia que sugiere que el repositorio puede contener solo una parte de los pesos o una cuantización parcial; se recomienda verificar la integridad antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrido Gated DeltaNet + Gated Attention |
| Parametros totales | 27B (según model card); el safetensors del repo muestra 460 730 096, inconsistente |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible (el repo es GGUF, pero no se listan los archivos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (y safetensors según el dato de parámetros) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention). El layout es de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque de Gated Attention seguido de FFN. La Gated DeltaNet utiliza 48 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El FFN tiene dimensión intermedia de 17 408. El modelo incorpora Multi-Token Prediction (MTP), entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento se realizó en dos etapas: pre-training y post-training. No se proporcionan detalles sobre el tamaño del dataset, su composición ni el uso de técnicas como RLHF o DPO. El modelo es nativo de visión-lenguaje, con un encoder de visión integrado que procesa imágenes y vídeos.

## Capacidades

- Generación de texto, razonamiento, codificación y matemáticas (implícito en las capacidades declaradas).
- Comprensión de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Control flexible del modo de pensamiento: activado por defecto, desactivable por petición, con ajuste de `reasoning_effort` y conservación del contexto de razonamiento histórico mediante `preserve_thinking`.
- Planificación autónoma y manejo de feedback del entorno para tareas agénticas de múltiples pasos.
- Soporte de tool calling y funciones integradas (mencionado en la versión cloud, probablemente disponible en el modelo abierto).
- Multilingüismo: no especificado, aunque la familia Qwen suele ser multilingüe.

## Casos de uso

- Codificación agéntica en terminal: el modelo puede ejecutar tareas de programación complejas en un entorno de terminal, interpretando errores y ajustando su estrategia, gracias a su capacidad de razonamiento de largo horizonte y su puntuación de 73.0 en Terminal Bench 2.1.
- Análisis de documentos técnicos con imágenes: al ser un modelo de visión-lenguaje, puede extraer información de diagramas, gráficos y capturas de pantalla en documentos, útil para ingeniería, investigación y soporte técnico.
- Asistentes de investigación con contexto largo: su ventana de 262K tokens permite procesar artículos completos, informes o bases de conocimiento extensas en una sola pasada, facilitando tareas de síntesis y revisión bibliográfica.
- Agentes autónomos de automatización de procesos: su capacidad de planificación y manejo de feedback lo hace adecuado para orquestar flujos de trabajo multi-paso, como la gestión de incidencias o la automatización de pruebas de software.
- Soporte al cliente con comprensión multimodal: puede atender consultas que incluyan capturas de pantalla o vídeos de errores, ofreciendo respuestas contextualizadas y precisas.
- Generación de código en producción con cuantización GGUF: al estar disponible en formato GGUF, puede integrarse en pipelines de CI/CD mediante llama.cpp u Ollama, ofreciendo inferencia local con requisitos de hardware moderados.

## Benchmarks y rendimiento

La información disponible solo incluye un resultado parcial de la tabla de benchmarks de la model card. No se han publicado resultados completos en la información proporcionada.

| Benchmark | Qwen3.8-27B |
|---|---|
| Terminal Bench 2.1 (Terminus) - Agentic terminal coding | 73.0 |

El resto de métricas (MMLU, HumanEval, GSM8K, etc.) no están disponibles en la documentación proporcionada.

## Requisitos de hardware

- No se dispone de información específica sobre VRAM o GPUs recomendadas en la documentación del modelo.
- Al ser un repositorio GGUF de 1.8 GB, es probable que contenga cuantizaciones de baja precisión (posiblemente Q2 o Q3), lo que permitiría su ejecución en GPUs de consumo con 8-12 GB de VRAM, aunque no se confirma.
- Para una cuantización Q4 estándar de un modelo de 27B, se estima un consumo de 14-16 GB de VRAM, pero este dato no está verificado.
- Es compatible con herramientas de inferencia como llama.cpp, Ollama, vLLM, SGLang y TokenSpeed, según la model card.
- La latencia y el throughput no se han publicado.

## Comparativa con modelos similares

La model card menciona comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se proporcionan los valores de estos modelos en la información disponible. No se puede realizar una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B | 262K nativo, 1M extensible | Apache 2.0 | GGUF en HuggingFace |
| Qwen3.6-27B | 27B | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio es una redistribución de un tercero (Jackrong), no un lanzamiento oficial de Qwen. Se recomienda verificar la integridad de los pesos y la procedencia antes de su uso en producción.
- Existe una discrepancia entre los 27B declarados y los 460M de parámetros en el safetensors del repositorio, lo que sugiere que el archivo puede estar incompleto o ser una cuantización parcial. Esto puede afectar al rendimiento real.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones idiomáticas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede tener limitaciones no documentadas en cuanto a la generación de contenido sensible.
- El contexto de 262K tokens es amplio, pero el rendimiento en contextos muy largos puede degradarse, especialmente en tareas de recuperación de información precisa.
- No se dispone de información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos de procedencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jackrong/Qwen3.8-27B-MTP-GGUF
- Qwen Cloud (servicio gestionado, próximamente): https://www.qwencloud.com/models/qwen3.8-27b
