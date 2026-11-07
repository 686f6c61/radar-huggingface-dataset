# Outlier-Ai/QwQ-32B-MLX-4bit

## Resumen

QwQ-32B-MLX-4bit es una conversión cuantizada a 4 bits del modelo Qwen/QwQ-32B, realizada por Outlier-Ai para su ejecución local en Apple Silicon mediante MLX. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) especializado en razonamiento con cadena de pensamiento (chain-of-thought), matemáticas y lógica. Esta conversión reduce el peso del repositorio a 18,4 GB en formato safetensors, lo que permite su despliegue en Macs con memoria unificada, sin depender de la nube.

La relevancia de esta ficha radica en que traslada un modelo de razonamiento de escala media-alta al ecosistema local de Apple: el tag `apple-silicon` y la librería `mlx` indican que está pensado para ejecutarse sobre el framework MLX en chips de la serie M. Frente al modelo original en precisión completa, la versión 4-bit sacrifica algo de calidad numérica a cambio de hacer viable la inferencia en equipos de sobremesa y portátiles de gama alta.

La model card es deliberadamente minimalista: hereda licencia y metadatos del modelo base y no documenta detalles de entrenamiento, dataset ni metodología de cuantización más allá de "MLX 4-bit". Por tanto, varios datos técnicos de esta ficha se marcan como no disponibles, y las cifras de benchmarks del modelo original no se reproducen aquí porque no se han proporcionado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, según tag `qwen2`); detalles de capas y atención no disponibles |
| Parámetros totales | 32.763.876.352 (≈32,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 4-bit (MLX); no se detalla el esquema exacto (group size, bits por componente) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), repositorio de 18,4 GB |

## Arquitectura y entrenamiento

El modelo base Qwen/QwQ-32B es un transformer denso de aproximadamente 32,8 mil millones de parámetros orientado a razonamiento explícito: genera cadenas de pensamiento antes de responder, lo que lo hace adecuado para problemas matemáticos y lógicos de varios pasos. La información proporcionada no detalla el número de capas, la configuración de atención, la longitud de contexto nativa ni el volumen y composición del corpus de entrenamiento. Tampoco se documenta si el modelo base empleó RLHF, DPO u otras etapas de alineación; la model card solo indica que se trata de un modelo de tipo `chat`/`instruct` con capacidad de `thinking`.

Esta conversión concreta es una cuantización a 4 bits realizada por Outlier-Ai mediante la librería MLX, que empaqueta los pesos en safetensors y los adapta al backend Metal de Apple Silicon. No se especifica en la información disponible la técnica exacta de cuantización (por ejemplo, group-wise affine quantization), el grupo de tamaño usado ni si se aplicaron calibraciones o correcciones de outliers. Tampoco hay datos sobre decodificación especulativa, atención lineal u otras optimizaciones de inferencia más allá del propio soporte de MLX.

## Capacidades

- Generación de texto conversacional multi-turno con formato chat/instruct.
- Razonamiento explícito con cadena de pensamiento (chain-of-thought, `thinking`): produce pasos intermedios antes de la respuesta final.
- Resolución de problemas matemáticos y de lógica (los ejemplos de la model card incluyen problemas de máquinas/tiempo, rejillas lógicas y problemas de cinemática).
- Soporte multilingüe declarado para 15 idiomas: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local y offline en macOS sobre Apple Silicon (tags `no-cloud`, `offline`, `on-device`, `private-ai`), sin claves de API ni límites de uso por parte del runtime MLX.
- Integración con `mlx-lm` para generación por línea de comandos y uso programático.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline es `text-generation`.
- Soporte de agentes y razonamiento multi-paso: el modelo base está orientado a razonamiento, pero no se documenta en esta conversión un modo agente específico.

## Casos de uso

- Razonamiento matemático asistido en local: usar el modelo para resolver problemas de varios pasos (álgebra, aritmética aplicada, problemas de palabras) mostrando la cadena de pensamiento; encaja por su orientación explícita a matemáticas y por ejecutarse sin conexión.
- Tutoría y explicaciones paso a paso: un estudiante o docente puede pedir derivaciones razonadas en español u otros idiomas soportados, aprovechando el modo `thinking` para revisar el proceso, no solo el resultado.
- Prototipado de asistentes privados en macOS: desarrollo de chatbots o herramientas internas que procesan datos sensibles sin enviarlos a la nube, gracias al despliegue on-device con MLX y a los tags `private-ai` y `no-cloud`.
- Evaluación de modelos de razonamiento en Apple Silicon: investigadores que quieran comparar el comportamiento de QwQ-32B en 4 bits frente a otras cuantizaciones o tamaños, usando `mlx-lm` como runtime reproducible.
- Automatización de tareas analíticas offline: generación de explicaciones y borradores de análisis lógico en entornos sin red (por ejemplo, portátiles en campo), donde un modelo de 32,8 B en 18,4 GB cabe en la memoria unificada de equipos de gama alta.
- Generación de contenido multilingüe: redacción y reescritura en los 15 idiomas declarados, útil para equipos que trabajan con documentación en varios idiomas y prefieren no depender de APIs externas.
- Integración en pipelines de CLI: uso mediante `python -m mlx_lm.generate` para tareas por lotes de generación de texto y razonamiento en scripts locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput, y no se han proporcionado los resultados del modelo base Qwen/QwQ-32B para trasladarlos aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 18,4 GB en safetensors 4-bit; en la práctica se necesita margen adicional para el contexto KV cache y el runtime, por lo que se recomienda al menos 24 GB de memoria unificada y, para contextos largos, 32 GB o más.
- GPU recomendadas: el modelo está pensado para Apple Silicon (tags `m1`, `m2`, `m3`, `m4`, `mac-mini`, `mac-studio`, `macbook-air`, `macbook-pro`). No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en esta conversión MLX.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada suficiente (Mac Studio, MacBook Pro de gama alta); en GPUs de consumo NVIDIA no aplica esta conversión concreta, ya que requiere MLX/Metal.
- Opciones de despliegue: `mlx-lm` (documentado en la model card) y la aplicación Outlier para macOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-Ai/QwQ-32B-MLX-4bit | 32,8 B | No disponible | 4-bit MLX | apache-2.0 | Hugging Face (23 descargas) |
| Qwen/QwQ-32B (base) | 32,8 B | No disponible | Precisión original | apache-2.0 | Hugging Face |
| Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit | 7 B (aproximado, no confirmado) | No disponible | 4-bit MLX | No disponible | Hugging Face (1.932 descargas) |
| Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit | 30 B (MoE, activos no disponibles) | No disponible | 4-bit MLX | No disponible | Hugging Face (1.598 descargas) |

La comparativa se limita a los artefactos citados en la propia model card; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la precisión en tareas de razonamiento y matemáticas frente al modelo base en precisión completa; no se documenta una evaluación de la pérdida de calidad.
- Riesgo de alucinación inherente a los modelos generativos, agravado en problemas de varios pasos si la cadena de pensamiento contiene errores que se propagan a la respuesta final.
- No se documentan sesgos conocidos ni evaluaciones de seguridad para esta conversión; se heredan los del modelo base, no detallados en la información disponible.
- La longitud de contexto no está especificada, lo que impide planificar con precisión el uso en conversaciones o documentos largos.
- El soporte multilingüe se declara a nivel de metadatos; no hay evaluación de calidad por idioma en la información proporcionada.
- Licencia apache-2.0 heredada: permite uso comercial, pero conviene revisar la model card del modelo base para condiciones adicionales.
- Dependencia del ecosistema Apple: requiere MLX y Metal; no es portable directamente a CUDA ni a otros runtimes sin reconversión.
- La model card incluye promoción de la aplicación Outlier (versión de pago de 49 USD); es contenido comercial del autor, no una especificación técnica del modelo.
- El número de descargas (23) es bajo, lo que sugiere poca validación comunitaria de esta conversión concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/QwQ-32B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/QwQ-32B
- Conversión alternativa del mismo autor: https://huggingface.co/Outlier-Ai/Outlier-QwQ-32B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B-MLX-4bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B-Instruct-MLX-4bit: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Qwen2.5-Coder-7B-Instruct-MLX-4bit: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
- Outlier-Core-27B-MLX-4bit: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B-MLX-4bit: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Aplicación Outlier para macOS: https://outlier.host/
