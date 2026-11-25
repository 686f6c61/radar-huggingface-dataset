# Outlier-Ai/Outlier-Compact-14B-GGUF

## Resumen

Outlier-Compact-14B-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-14B-Instruct, publicada por Outlier-Ai. Se trata de un artefacto de investigación que la propia model card describe como obsoleto y sustituido por la línea de producto actual del autor; no se recomienda como descarga de producción. El modelo base es un transformer denso de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) desarrollado originalmente por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens según la documentación pública de Qwen2.5.

El interés de esta ficha es doble. Por un lado, documenta un caso de cuantización orientada a inferencia local en CPU y edge, con variantes de 4, 5 y 8 bits pensadas para llama.cpp, Ollama, LM Studio y Jan. Por otro, sirve como advertencia sobre artefactos de investigación: la model card indica explícitamente que el repositorio precede a la versión v1.8 de la línea Outlier y que cualquier afirmación técnica de revisiones anteriores debe considerarse provisional.

La relevancia actual es limitada como descarga recomendada, pero el modelo base Qwen2.5-14B-Instruct sigue siendo una referencia sólida en la franja de 14B para tareas de chat, instrucciones, código y function calling multilingüe en 15 idiomas. Esta ficha evalúa el artefacto GGUF a partir de la información disponible, marcando como no disponible todo dato que el autor no publica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-14B-Instruct) |
| Parámetros totales | 14.770.033.664 (14,8B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (contexto nativo de Qwen2.5-14B-Instruct; no confirmado en la model card del GGUF) |
| Tipos de cuantización | 4-bit, 5-bit, 8-bit (según tags del repo) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamaño del repositorio | 19,5 GB |
| Librería | gguf |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Relación con el base | quantized |
| Cuantizado por | Outlier-Ai |
| Fecha de creación | 2026-04-18 |
| Última actualización | 2026-11-20 |
| Descargas | 311 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-14B-Instruct, un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención completa en determinadas capas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Qwen2.5-14B-Instruct fue entrenado por Alibaba Qwen sobre un corpus multilingüe de varios billones de tokens (el dato exacto no se detalla en la información proporcionada) y posteriormente ajustado con instrucciones y preferencias humanas. La model card de este repositorio GGUF no aporta detalles adicionales sobre el proceso de entrenamiento del base ni sobre el pipeline de cuantización empleado.

La contribución de Outlier-Ai se limita a la cuantización a 4, 5 y 8 bits en formato GGUF para su uso con llama.cpp y derivados. La model card califica el artefacto como "research checkpoint" y "superseded", indicando que puede contener adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto final. No se documentan innovaciones técnicas propias del cuantizador, ni métodos de decodificación especulativa, ni recetas de calibración específicas.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en modo chat e instruct.
- Razonamiento de propósito general y respuesta a preguntas de conocimiento.
- Generación y explicación de código, heredada del base Qwen2.5-14B-Instruct.
- Matemáticas de nivel escolar y universitario básico, según las capacidades del base.
- Soporte de function calling / tool calling (el tag `function-calling` aparece en el repositorio).
- Capacidades multilingües en 15 idiomas: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local en CPU y en dispositivos edge gracias a la cuantización GGUF.
- Compatibilidad con endpoints y clientes que hablan el protocolo de llama.cpp (Ollama, LM Studio, Jan).
- No se documenta modo thinking, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistente de chat local y offline: el modelo puede desplegarse con Ollama o llama.cpp en un portátil o estación de trabajo sin conexión, gestionando conversaciones multi-turno con la ventana de contexto del base (32.768 tokens según Qwen2.5), adecuado para entornos con requisitos de privacidad.
- Atención al cliente en idioma español: al estar el español entre los 15 idiomas soportados, puede gestionar conversaciones de soporte en castellano con contexto largo, aunque su uso en producción requeriría validación adicional dado el estado de artefacto de investigación.
- Generación de código en pipelines internos: el base Qwen2.5-14B-Instruct tiene buen rendimiento en generación de código y el tag `function-calling` sugiere integración con herramientas; puede emplearse en asistentes de IDE o scripts de automatización locales.
- Prototipado de agentes con tool calling: la compatibilidad con llama.cpp y el soporte declarado de function calling permiten construir agentes multi-paso en local para pruebas de concepto.
- Resumen y extracción de información de documentos: con contexto de 32.768 tokens (según el base) puede procesar informes, actas o artículos largos en una sola pasada, en cualquiera de los idiomas soportados.
- Despliegue en hardware modesto: las variantes de 4 bits permiten ejecutar un modelo de 14,8B en equipos con GPU de consumo o incluso en CPU, útil para demos, docencia y entornos sin acelerador dedicado.
- Traducción y adaptación de contenido multilingüe: la cobertura de 15 idiomas permite tareas de traducción y localización entre pares como inglés-español, francés-alemán o chino-inglés, con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los números de la línea Outlier provienen de experimentos internos y no de pruebas de release, y no incluye tabla alguna de MMLU, HumanEval, GSM8K ni métricas equivalentes para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño de parámetros, no publicada por el autor):
  - 8 bits: aproximadamente 15-16 GB de VRAM.
  - 5 bits: aproximadamente 10-11 GB de VRAM.
  - 4 bits: aproximadamente 8-9 GB de VRAM.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de producción con contexto completo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para las variantes de 8 bits con margen; RTX 4080 (16 GB) y RTX 4070 Ti (16 GB) para 5 y 4 bits.
- GPU de consumo: sí cabe en tarjetas de 8-16 GB con cuantización de 4 o 5 bits; en 8 bits requiere 16 GB o más.
- CPU: las variantes de 4 bits pueden ejecutarse en CPU con llama.cpp, con throughput bajo y dependiente del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-Compact-14B-GGUF | 14,8B | 32.768 (según base) | Apache 2.0 | GGUF (4/5/8-bit) | Hugging Face, 311 descargas |
| Qwen2.5-14B-Instruct (base) | 14,8B | 32.768 | Apache 2.0 | safetensors | Hugging Face, oficial |
| Outlier-Core-27B-MLX-4bit | no disponible | no disponible | no disponible | MLX 4-bit | Hugging Face, línea actual del autor |
| Outlier-Lite-9B-MLX-4bit | no disponible | no disponible | no disponible | MLX 4-bit | Hugging Face, línea actual del autor |

La comparación más directa es con el propio Qwen2.5-14B-Instruct en safetensors: misma arquitectura y licencia, pero el artefacto de Outlier-Ai añade cuantización GGUF para inferencia local. Frente a las alternativas de la línea actual de Outlier (Core 27B, Lite 9B), este repositorio está marcado como obsoleto y no se recomienda su descarga.

## Limitaciones y advertencias

- Artefacto obsoleto: la model card indica explícitamente que el repositorio precede a la v1.8 y que no es la descarga recomendada.
- Checkpoint de investigación: el autor advierte de que puede contener adaptadores u overlays experimentales no graduados al producto final.
- Sin benchmarks publicados: no hay métricas verificadas de rendimiento para este artefacto.
- Riesgo de alucinación: inherente a los modelos de 14B del base Qwen2.5; no se documentan mitigaciones específicas.
- Sesgos: no se documentan análisis de sesgo para este artefacto; hereda los del base Qwen2.5-14B-Instruct, no detallados en la información disponible.
- Limitaciones de idioma: aunque se listan 15 idiomas, el rendimiento relativo por idioma no está documentado; el español figura entre los soportados.
- Licencia Apache 2.0: permite uso comercial, pero el estado de artefacto de investigación desaconseja su uso en producción sin validación propia.
- Contexto: el dato de 32.768 tokens proviene de la documentación del base Qwen2.5, no de la model card del GGUF; conviene verificarlo en el runtime concreto.
- Soporte de runtimes: orientado a llama.cpp y derivados; no se documenta compatibilidad con vLLM o TGI.
- Trazabilidad: el autor no publica la receta de cuantización ni los datos de calibración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Compact-14B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Sitio del autor: https://outlier.host/
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Quick 26B: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (Outlier): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (Outlier): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
