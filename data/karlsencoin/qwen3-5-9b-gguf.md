# karlsencoin/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B es un modelo fundacional multimodal desarrollado por Alibaba Qwen, distribuido en este repositorio por el usuario karlsencoin en formato GGUF cuantizado mediante Unsloth Dynamic 2.0. El modelo base combina un codificador de visión con un modelo de lenguaje causal de 8.953.803.264 parámetros (aproximadamente 9B), diseñado para tareas de razonamiento, generación de código, agentes y comprensión visual bajo una única arquitectura unificada.

La innovación principal reside en su arquitectura híbrida: intercala capas de Gated DeltaNet (atención lineal) con capas de Gated Attention tradicional en un patrón de 8 bloques de 4 capas, lo que reduce el coste computacional en contextos largos. El modelo soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens, y está entrenado con un objetivo de multi-token prediction (MTP) de varios pasos.

Este repositorio concreto es relevante porque ofrece los pesos en formato GGUF optimizados para inferencia local con llama.cpp y derivados (Ollama, LM Studio, etc.), lo que permite ejecutar un modelo multimodal de 9B con contexto muy largo en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Gated Attention (patrón 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se especifica configuración MoE concreta para esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); niveles concretos no disponibles en la información proporcionada |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que alterna capas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) y capas de Gated Attention clásica (16 cabezas para Q, 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64). La dimensión oculta es 4096, con 32 capas y una FFN de dimensión intermedia 12288. El vocabulario tiene 248.320 tokens (con padding). Esta combinación busca alto throughput y baja latencia en inferencia, especialmente en secuencias largas, al reducir el coste cuadrático de la atención tradicional.

El entrenamiento se realizó en dos fases (pre-entrenamiento y post-entrenamiento) con fusión temprana de tokens multimodales, lo que según el autor alcanza paridad con Qwen3 en texto y supera a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual. Se aplicó aprendizaje por refuerzo (RL) escalado a entornos con millones de agentes y distribuciones de tareas progresivamente complejas. El modelo incorpora multi-token prediction (MTP) entrenado con varios pasos. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multistep, con modo de pensamiento (thinking) según la familia Qwen3.5.
- Generación y comprensión de código en múltiples lenguajes.
- Razonamiento matemático y tareas STEM.
- Comprensión de imágenes (pipeline image-text-to-text) mediante codificador de visión integrado.
- Soporte de tool calling y function calling (heredado de la familia Qwen3.5; no se detalla explícitamente en la información disponible).
- Capacidades de agente y orquestación en entornos multiagente.
- Cobertura multilingüe de 201 idiomas y dialectos.
- Contexto largo nativo de 262.144 tokens, extensible a más de un millón.
- Compatibilidad con Transformers, vLLM, SGLang y KTransformers según la model card del modelo base.

## Casos de uso

- Análisis de documentos extensos: el contexto nativo de 262.144 tokens permite procesar informes, contratos o expedientes completos en una sola pasada sin fragmentación, manteniendo coherencia entre secciones.
- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests y explicación de errores, con soporte de tool calling para invocar linters o compiladores.
- Atención al cliente automatizada: conversaciones multi-turno con historial largo gracias a la ventana de contexto, manteniendo el hilo durante sesiones prolongadas sin pérdida de información.
- Procesamiento de documentación técnica con imágenes: al ser multimodal, puede extraer información de diagramas, capturas de pantalla y tablas escaneadas junto con el texto circundante.
- Agentes autónomos de investigación: el modelo puede planificar y ejecutar tareas de múltiples pasos con llamadas a herramientas, adecuado para entornos de RL escalados y orquestación de agentes.
- Despliegue local en hardware de consumo: los pesos GGUF permiten ejecutar el modelo en estaciones de trabajo con GPU de gama alta o incluso CPU, útil para prototipado y entornos con requisitos de privacidad.
- Traducción y localización multilingüe: con 201 idiomas soportados, puede emplearse en pipelines de traducción técnica y adaptación cultural de contenido.
- Fine-tuning local: el repositorio incluye referencias a guías de Unsloth para ajuste fino, lo que permite especializar el modelo en dominios concretos con recursos limitados.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla comparativa con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking y Qwen3-30BA3B-Thinking-2507, pero en la información proporcionada solo se muestra parcialmente la fila de MMLU-Pro sin los valores numéricos. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; para un modelo de ~9B en GGUF, las cuantizaciones de 4 bits suelen requerir en torno a 6-8 GB, y las de 8 bits en torno a 10-12 GB, pero estos valores no se confirman en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar compatibilidad con RTX 4090, A100 y H100, pero no se confirma.
- Cabe en GPU de consumo: probable en cuantizaciones bajas (4-5 bits) en GPUs con 8-12 GB de VRAM, aunque no se especifica.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; vLLM, SGLang y KTransformers para los pesos del modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (este repo, GGUF) | ~9B | 262.144 nativos | Apache 2.0 | GGUF | Multimodal, híbrido DeltaNet/Attention |
| Qwen3.5-4B | ~4B (no confirmado) | no disponible | Apache 2.0 | safetensors (base) | Versión menor de la misma familia |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, activos no disponibles) | no disponible | no disponible | no disponible | Comparado en benchmarks del modelo base |
| GPT-OSS-20B | 20B (no confirmado) | no disponible | no disponible | no disponible | Comparado en benchmarks del modelo base |

No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fiabilidad para esta variante GGUF.
- Sesgos: no se documentan sesgos concretos en la información disponible; la cobertura de 201 idiomas no garantiza calidad uniforme en todos ellos.
- La cuantización GGUF puede degradar ligeramente la precisión respecto a los pesos originales en safetensors, aunque Unsloth afirma superioridad frente a otras cuantizaciones.
- El repositorio tiene 0 likes y 622 descargas, lo que sugiere poca validación comunitaria; conviene verificar la integridad de los pesos antes de usarlos en producción.
- El tamaño del repositorio es de 147,8 GB, lo que implica un consumo de almacenamiento considerable y descargas largas.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base Qwen/Qwen3.5-9B para confirmar compatibilidad en uso comercial.
- No se especifican los niveles de cuantización incluidos ni los idiomas exactos soportados en este repositorio concreto.
- El soporte de tool calling y agentes se infiere de la familia Qwen3.5, pero no se detalla explícitamente para esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/karlsencoin/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Guía de ejecución local de Unsloth: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentación de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
