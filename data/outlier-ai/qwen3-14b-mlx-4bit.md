# Outlier-Ai/Qwen3-14B-MLX-4bit

## Resumen

Qwen3-14B-MLX-4bit es una conversión cuantizada a 4 bits del modelo Qwen/Qwen3-14B, publicada por Outlier-Ai para su ejecución local en Apple Silicon mediante el framework MLX. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de 14.768.307.200 parámetros (aproximadamente 14,8 mil millones) con capacidades de razonamiento explícito (modo thinking), generación de código, matemáticas y uso de herramientas. Esta conversión reduce el peso del repositorio a 8,3 GB, lo que permite ejecutarlo en Macs con memoria unificada moderada sin depender de la nube.

La relevancia de esta ficha radica en que combina un modelo de tamaño medio-alto con una cuantización agresiva (4 bits) y un runtime específico para Metal en macOS. Frente a las alternativas GGUF orientadas a llama.cpp, MLX aprovecha la arquitectura de memoria unificada de los chips M1 a M4, lo que se traduce en un rendimiento notablemente superior en portátiles y equipos de sobremesa de Apple. El modelo conserva la licencia Apache 2.0 del original, lo que facilita su uso comercial.

La model card es escueta: se limita a indicar el proceso de conversión, los comandos de carga con mlx-lm y enlaces al ecosistema de la app Outlier. No se documentan detalles sobre el dataset de cuantización, la metodología exacta ni métricas de degradación respecto al modelo original. Esta ficha refleja esa limitación y marca como "no disponible" todo dato que no aparezca en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), conversión MLX |
| Parámetros totales | 14.768.307.200 (14,8 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 4 bits (MLX), pesos en safetensors |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 8,3 GB |
| Librería | mlx / mlx-lm |
| Modelo base | Qwen/Qwen3-14B |
| Cuantizado por | Outlier-Ai |
| Pipeline | text-generation |
| Fecha de creación | 2026-04-20 |
| Última actualización | 2026-11-20 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-14B, un transformer denso de la familia Qwen3 con 14,8 mil millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo base Qwen/Qwen3-14B, que no forma parte de los materiales suministrados. Lo que sí se infiere de las etiquetas es que el modelo incorpora un modo de razonamiento explícito ("thinking"), soporte de tool use y naturaleza instruct/chat.

La contribución específica de esta ficha es la cuantización a 4 bits realizada con MLX. La model card no describe el esquema de cuantización (por ejemplo, group size, si se cuantizan embeddings o solo capas lineales, ni si se emplea una técnica como GPTQ, AWQ o cuantización post-entrenamiento simple de MLX). Tampoco se documenta el conjunto de calibración utilizado ni la pérdida de calidad medida frente al modelo en bf16. La única indicación técnica es el comando de carga mediante `mlx_lm.generate`, que confirma la compatibilidad con mlx-lm.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat e instruct.
- Razonamiento explícito con modo thinking, según las etiquetas del repositorio.
- Generación de código y resolución de problemas matemáticos (capacidades heredadas de Qwen3-14B).
- Soporte de function calling y tool use, indicado por las etiquetas `function-calling` y `tool-use`.
- Capacidades multilingües en 15 idiomas: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local y offline en Apple Silicon, sin dependencia de API ni nube.
- Inferencia en dispositivo (on-device) orientada a privacidad.

## Casos de uso

- Asistente de código local en macOS: el modelo puede integrarse en editores o terminales mediante mlx-lm para autocompletar, explicar y refactorizar código sin enviar el código fuente a servidores externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Atención al cliente con datos sensibles: al ejecutarse completamente en local, permite procesar conversaciones con información personal o regulada sin salir del dispositivo del usuario, cumpliendo con políticas de privacidad estrictas.
- Automatización de flujos con tool calling: gracias al soporte de function calling, puede orquestar llamadas a APIs internas, consultas a bases de datos locales o scripts del sistema en un pipeline de agentes de un solo paso o multi-paso.
- Análisis y resumen de documentos en un Mac: con 8,3 GB de pesos en 4 bits, cabe en equipos con 16 GB o más de memoria unificada, permitiendo resumir informes, extraer entidades y responder preguntas sobre textos largos (sujeto al contexto real del modelo base, no documentado aquí).
- Prototipado e investigación sin GPU dedicada: investigadores que trabajan en portátiles Apple pueden evaluar el comportamiento de un modelo de 14,8 B con razonamiento explícito sin necesidad de infraestructura CUDA.
- Desarrollo de aplicaciones de escritorio privadas: la app Outlier y el ecosistema mlx-lm permiten empaquetar el modelo en herramientas macOS con inferencia Metal, útil para productos de nicho que exigen funcionamiento offline.
- Traducción y asistencia multilingüe: con 15 idiomas declarados, puede emplearse para traducción interna, corrección de estilo o generación de contenido en equipos distribuidos internacionalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad frente al modelo en bf16 o frente a otras cuantizaciones. Tampoco se documentan velocidades de tokens por segundo en hardware Apple específico.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 8,3 GB en 4 bits; se recomienda un mínimo de 16 GB de memoria unificada para dejar margen a la KV cache y al sistema operativo. Para contextos largos conviene 24 GB o más.
- GPU recomendadas: chips Apple Silicon M1, M2, M3 y M4 (incluidos Pro, Max y Ultra). La model card etiqueta explícitamente MacBook Air, MacBook Pro, Mac mini y Mac Studio.
- ¿Cabe en GPU de consumo? No aplica a GPUs NVIDIA/AMD; está diseñado para memoria unificada de Apple. En un MacBook Air con 16 GB es viable con contextos moderados; en configuraciones de 8 GB no es recomendable.
- Opciones de despliegue: mlx-lm (CLI y API Python), la app Outlier para macOS, y cualquier herramienta compatible con MLX. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-Ai/Qwen3-14B-MLX-4bit | 14,8 B | No disponible | MLX safetensors 4-bit | Apache 2.0 | Hugging Face, 374 descargas |
| Outlier-Ai/Qwen3-8B-MLX-4bit | ~8 B (no confirmado) | No disponible | MLX 4-bit | Apache 2.0 (heredada) | Hugging Face, 107 descargas |
| Outlier-Ai/Qwen3-32B-MLX-4bit | ~32 B (no confirmado) | No disponible | MLX 4-bit | Apache 2.0 (heredada) | Hugging Face, 98 descargas |
| Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit | ~30 B (MoE, activos no disponibles) | No disponible | MLX 4-bit | Apache 2.0 (heredada) | Hugging Face, 1.598 descargas |

La comparación se limita a las conversiones del mismo autor recogidas en la model card, ya que no se dispone de datos de rendimiento ni de contexto para contrastar con alternativas de otros proveedores. El modelo de 14,8 B ocupa una posición intermedia entre las variantes de 8 B y 32 B del mismo ecosistema, y se distingue del Coder-30B-A3B por ser denso y no MoE.

## Limitaciones y advertencias

- La model card no documenta el esquema de cuantización ni la pérdida de calidad frente al modelo en bf16; la degradación en tareas de razonamiento y código es desconocida y debe evaluarse empíricamente.
- El modelo base Qwen3 puede presentar sesgos heredados de sus datos de entrenamiento; no se han publicado evaluaciones de sesgo específicas para esta conversión.
- Riesgo de alucinación inherente a los modelos generativos de 14,8 B; no se han publicado tasas de factualidad ni evaluaciones de veracidad.
- La longitud de contexto no está documentada en esta ficha; debe consultarse la model card de Qwen/Qwen3-14B antes de diseñar aplicaciones que dependan de ventanas largas.
- El rendimiento multilingüe está declarado por etiquetas, pero no se han publicado métricas por idioma; la calidad en idiomas distintos del inglés y el chino puede ser inferior.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base por si existen condiciones adicionales no reflejadas en la conversión.
- Esta conversión está publicada por Outlier-Ai y no está incluida en la app Outlier según la propia model card; su soporte y mantenimiento dependen del autor de la conversión, no del equipo Qwen.
- Solo es ejecutable en el ecosistema MLX/Apple Silicon; no es portable a CUDA, ROCm ni CPU x86 sin reconversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Qwen3-14B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- App Outlier: https://outlier.host/
- Conversión Qwen3-8B MLX 4-bit: https://huggingface.co/Outlier-Ai/Qwen3-8B-MLX-4bit
- Conversión Qwen3-32B MLX 4-bit: https://huggingface.co/Outlier-Ai/Qwen3-32B-MLX-4bit
- Conversión Qwen3-Coder-30B-A3B-Instruct MLX 4-bit: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Conversión Outlier-Core-27B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Conversión Outlier-Nano-4B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Documentación de mlx-lm: no disponible en la información proporcionada.
