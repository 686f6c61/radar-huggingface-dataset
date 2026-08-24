# SassyDiffusion/Qwen3.8-27B-heretic

## Resumen

Qwen3.8-27B-heretic es un modelo de lenguaje multimodal desarrollado por SassyDiffusion, obtenido mediante la técnica de abliteración aplicada sobre el modelo base Qwen/Qwen3.8-27B de Alibaba. La abliteration es un procedimiento de edición de pesos que elimina selectivamente los mecanismos neuronales responsables de los rechazos ("refusals") en modelos de lenguaje, manteniendo en lo posible el resto de capacidades. En este caso concreto, se ha utilizado la rama "heretic ara" del proyecto heretic-org, con parámetros de edición sobre las capas 17 a 64.

El modelo resultante presenta una tasa de rechazos de 4/100 frente al 99/100 del original, con una divergencia KL de 0.0902 respecto al modelo base, lo que indica una alteración moderada de la distribución de salidas. Se trata de un modelo denso de 27.356 millones de parámetros con arquitectura híbrida de atención lineal y atención completa, visión integrada y ventana de contexto nativa de 262.144 tokens extensible a 1M. Está disponible bajo licencia Apache 2.0 en formato safetensors y es compatible con el ecosistema de Hugging Face Transformers, vLLM y SGLang.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal language model con vision encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.000.000 |
| Tipos de cuantización | no disponible (repo en safetensors, 54.7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo causal de lenguaje con encoder visual integrado, compuesto por 64 capas distribuidas en 16 bloques repetidos con el patrón 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). La capa Gated DeltaNet emplea atención lineal con 48 cabezas para V y 16 para QK, con dimensión de cabeza 128, mientras que la capa Gated Attention utiliza 24 cabezas para Q y 4 para KV, con dimensión 256 y RoPE de 64 dimensiones. La dimensión oculta es 5120 y el embedding de tokens está rellenado a 248.320. El modelo incorpora también un cabezal MTP (Multi-Token Prediction) para predicción de varios tokens a la vez.

El entrenamiento del modelo base incluye etapas de preentrenamiento y postentrenamiento, y el modelo resultante soporta un modo de pensamiento flexible con control de esfuerzo de razonamiento y retención de contexto de razonamiento histórico. La abliteración aplicada en esta variante se realizó sobre las capas 16 a 64, con un peso de preservación de comportamiento bueno de 0.7648, un peso de dirección de comportamiento malo de 0.0009 y un peso de sobrecorrección relativa de 1.0682, con 15 vecinos. Los datos de entrenamiento específicos de la abliteración no están disponibles.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y vídeos de hasta una hora de duración, incluyendo diagramas STEM, documentos y contenido visual complejo.
- Razonamiento y planificación: modo de pensamiento activado por defecto, con capacidad de ajustar la profundidad de razonamiento mediante `reasoning_effort` y conservar el contexto de razonamiento histórico con `preserve_thinking`.
- Ejecución de tareas agénticas: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de múltiples pasos de forma fiable.
- Generación de código: capacidades de codificación mejoradas respecto a la serie Qwen3.5, con soporte para herramientas y entornos de desarrollo.
- Soporte de tool calling y function calling: integración con herramientas externas y pipelines de automatización.
- Capacidades multilingües: no se especifican los idiomas soportados en la información disponible.
- Comportamiento sin rechazos: la abliteration reduce drásticamente las respuestas de rechazo, pasando de 99/100 a 4/100 en la prueba de refusals.

## Casos de uso

- Asistentes de investigación científica: el modelo puede analizar documentos con figuras y tablas, razonar sobre diagramas STEM y generar hipótesis en contextos de investigación, aprovechando su visión integrada y su ventana de contexto de 262K tokens.
- Agentes autónomos de automatización: su capacidad de planificación multi-paso y manejo de retroalimentación del entorno lo hace adecuado para sistemas que ejecutan tareas complejas en entornos simulados o reales, como orquestación de pipelines de datos.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y corregir código con contexto largo de repositorios completos.
- Análisis de vídeo de larga duración: su visión nativa permite procesar vídeos de hasta una hora, útil en monitorización de procesos industriales, revisión de material audiovisual o análisis de grabaciones de seguridad.
- Chatbots sin restricciones de contenido: gracias a la abliteration, el modelo responde sin rechazos a peticiones que el modelo base bloquearía, útil en entornos controlados de investigación sobre seguridad de modelos o generación de contenido creativo sin filtros.
- Estudio de técnicas de edición de modelos: la configuración de abliteration es documentada en detalle, lo que permite a investigadores en interpretabilidad y seguridad reproducir y analizar el efecto de la edición de pesos en modelos grandes.

## Benchmarks y rendimiento

La model card del modelo base Qwen3.8-27B incluye resultados comparativos de benchmarks de texto y visión frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos de la tabla no están disponibles en la información proporcionada. El modelo abliterado no publica benchmarks propios; se reporta únicamente la divergencia KL de 0.0902 respecto al original y la tasa de rechazos de 4/100.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del modelo en fp16 es de aproximadamente 54.7 GB, por lo que se requiere al menos 60-70 GB de VRAM para inferencia sin cuantizar. Con cuantización de 4 bits (no disponible en el repo) se podría reducir a ~14-16 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para fp16; RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) solo con cuantización o particionado.
- No cabe en GPUs de consumo (16 GB o menos) sin cuantización agresiva.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed; se puede servir con vLLM para inferencia de alta concurrencia.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Abliterado | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-heretic (este) | 27.4B | 262K | Sí | Sí (tasa de rechazo 4/100) | Apache 2.0 |
| Qwen/Qwen3.8-27B | 27.4B | 262K | Sí | No (tasa de rechazo 99/100) | Apache 2.0 |
| heretic-org/Qwen3.8-27B-heretic-ara | 27.4B | 262K | Sí | Sí (parámetros de abliteration distintos) | Apache 2.0 |
| Qwen3.6-27B | 27B | no disponible | Sí | No | Apache 2.0 |

La variante heretic-ara de heretic-org es el resultado de la misma técnica de abliteration con parámetros diferentes; la comparativa de rendimiento entre ambas variantes no está publicada.

## Limitaciones y advertencias

- La abliteration reduce la tasa de rechazos de 99/100 a 4/100, lo que significa que el modelo puede generar contenido que el modelo base consideraría dañino, ilegal o no ético; el uso en producción debe evaluar los riesgos de seguridad y cumplimiento normativo.
- La divergencia KL de 0.092 indica que la distribución de salidas está alterada respecto al modelo base, lo que puede afectar a la coherencia en tareas complejas de razonamiento.
- No se han publicado datos sobre los idiomas soportados, ni benchmarks propios del modelo abliterado.
- El riesgo de alucinación no se ha evaluado de forma específica en esta variante; se hereda del modelo base con la degradación adicional de la edición de pesos.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad del contenido generado recae en el usuario; la abliteration puede violar las políticas de uso de plataformas de despliegue.
- No se dispone de información sobre la composición de datos de entrenamiento de la abliteration, ni sobre sesgos de comportamiento del modelo resultante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SassyDiffusion/Qwen3.8-27B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante heretic-ara: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Receta de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guía de ejecución local: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Entrada en LLM Explorer: https://llm-explorer.com/model/OpenIntelligenceNet%2FQwen-3.8-27B-Heretic,1yV2arAd0dKRLvOaXFJQMR
