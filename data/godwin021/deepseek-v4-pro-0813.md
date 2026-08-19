# Godwin021/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es un modelo de generación de texto de 1,65 billones de parámetros publicado en HuggingFace por el usuario Godwin021. Según la model card, se trata de la versión final de DeepSeek-V4-Pro, que sustituye a la versión preliminar con mejoras sustanciales en capacidades de agente y rendimiento en entornos de producción. El modelo incorpora un módulo de decodificación especulativa denominado DSpark, que acelera la inferencia sin degradar la calidad de las respuestas.

El modelo está diseñado para tareas de razonamiento complejo, uso de herramientas y desarrollo de software autónomo, como demuestran sus resultados en benchmarks de agentes (Terminal Bench, DeepSWE, Cybergym). Aunque la model card utiliza la identidad visual y los enlaces oficiales de DeepSeek, el autor del repositorio no es la cuenta oficial `deepseek-ai`, por lo que conviene verificar la procedencia de los pesos antes de su uso en producción. La licencia MIT permite uso comercial sin restricciones de atribución.

Con un tamaño de repositorio de 1781,8 GB en formato safetensors, el modelo requiere infraestructura de múltiples GPU de alta gama y no es viable en hardware de consumo. Su relevancia radica en que representa un avance en modelos de razonamiento y agencia, compitiendo con alternativas propietarias como Kimi K3 o Opus-4.8 en tareas de automatización y desarrollo de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con decodificación especulativa DSpark (detalles de capas y atención no disponibles) |
| Parametros totales | 1.650.497.936.906 (1,65 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (mencionado en tags y en configuración de vLLM), 8-bit (tag), no se especifican otras |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna (número de capas, tipo de atención, dimensiones del modelo). Sin embargo, los comandos de despliegue con vLLM indican que se trata de un modelo de mezcla de expertos (MoE), ya que se especifican las opciones `--enable-expert-parallel` y `--moe-backend deep_gemm_mega_moe`. El modelo incorpora además un módulo de decodificación especulativa llamado DSpark, que genera varios tokens candidatos en paralelo para acelerar la inferencia.

No se han publicado datos sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si se utilizó RLHF, DPO u otro método de alineación. La model card solo menciona que esta versión supera a la versión preliminar en los benchmarks listados y que es "ampliamente competitiva con los modelos propietarios más potentes". El parámetro `reasoning_effort` admite tres niveles (`low`, `high`, `max`) que controlan el tiempo de deliberación antes de responder, lo que sugiere un mecanismo de razonamiento explícito similar a los modos "thinking" de otros modelos.

## Capacidades

- Generación de texto y razonamiento complejo con control del esfuerzo de razonamiento (`reasoning_effort` con niveles low, high, max).
- Capacidades de agente avanzadas: uso de herramientas, ejecución de tareas en terminal y desarrollo de software autónomo, según los benchmarks incluidos (Terminal Bench, Cybergym, DeepSWE, Toolathlon).
- Soporte de tool calling y function calling, evidenciado por los resultados en Toolathlon-Verified y Agents' Last Exam.
- Razonamiento multi-step y planificación, con rendimiento destacado en tareas de automatización (AutomationBench) y desarrollo full-stack (DSBench).
- Capacidades multilingües no confirmadas; la model card no especifica idiomas soportados.
- No se mencionan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Desarrollo de software autónomo: el modelo puede generar, modificar y depurar código en repositorios completos, como indican sus resultados en NL2Repo (61,5) y DeepSWE (62,7). Es adecuado para pipelines de CI/CD donde se requiera resolver issues o implementar features con mínima intervención humana.
- Automatización de tareas de terminal: con un 87,9 en Terminal Bench 2.1, puede ejecutar comandos, gestionar archivos y orquestar flujos de trabajo en entornos shell, útil para operaciones de administración de sistemas.
- Agentes de ciberseguridad: su puntuación de 83,3 en Cybergym sugiere capacidad para identificar y explotar vulnerabilidades en entornos controlados, aplicable en pruebas de penetración automatizadas.
- Asistentes de razonamiento complejo: con un 42,7 en HLE sin herramientas, puede abordar problemas de lógica, matemáticas y análisis que requieren cadenas de razonamiento extensas, útil en investigación y educación.
- Integración con frameworks de agentes: al ser compatible con vLLM y SGLang, puede desplegarse como backend para sistemas multi-agente que necesiten llamadas a herramientas y gestión de contexto largo.
- Generación de código en producción con decodificación especulativa: el módulo DSpark reduce la latencia, lo que permite usarlo en entornos donde la velocidad de respuesta es crítica, como asistentes de programación en tiempo real.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan DeepSeek-V4-Pro-0813 con otros modelos en tareas de agente y razonamiento. Se presentan tal cual, sin verificación independiente.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | DeepSeek-V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (wo / w tools) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack † | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard † | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

Notas de la model card: para las tareas de agente, se evaluó con el framework DeepSeek Harness en modo mínimo, con `reasoning_effort = max`, `temperature = 1.0`, `top_p = 0.95`. DSBench-FullStack y DSBench-Hard son conjuntos internos de DeepSeek.

## Requisitos de hardware

- El ejemplo de despliegue con vLLM utiliza un nodo con 4×GB300 (GPU NVIDIA Blackwell de alta gama), lo que indica que el modelo requiere al menos 4 GPU de gran capacidad de memoria (probablemente 288 GB cada una).
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en una sola GPU de datacenter; se necesita un nodo multi-GPU con interconexión de alta velocidad (NVLink o similar).
- VRAM estimada: no disponible, pero considerando 1,65 billones de parámetros y cuantización FP8, se estima un mínimo de ~1,7 TB de memoria combinada (los 4×GB300 suman ~1,15 TB, por lo que podría requerir más nodos o cuantización agresiva).
- Opciones de despliegue: vLLM con `--speculative-config '{"method":"dspark",...}'`, SGLang con `--speculative-algorithm DSPARK`, y posiblemente TGI u Ollama (no confirmado para este tamaño).
- Latencia y throughput: no disponibles, pero el uso de DSpark speculative decoding (7 tokens especulativos) y kv-cache en FP8 sugiere una mejora significativa frente a la decodificación autorregresiva estándar.

## Comparativa con modelos similares

El modelo compite directamente con los modelos propietarios de la tabla de benchmarks. Comparación orientativa basada en los datos publicados:

| Modelo | Parametros | Contexto | Licencia | HLE (sin herramientas) | Terminal Bench 2.1 | DeepSWE |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 1,65T (MoE) | no disponible | MIT | 42,7 | 87,9 | 62,7 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | MIT | 37,8 | 82,7 | 54,4 |
| GLM-5.2 | no disponible | no disponible | propietaria | 40,5 | 81,0 | 46,2 |
| Kimi K3 | no disponible | no disponible | propietaria | 43,5 | 88,3 | 67,5 |
| Opus-4.8 | no disponible | no disponible | propietaria | 49,8 | 85,0 | 58,0 |
| Fable-5 (w/ fallback) | no disponible | no disponible | propietaria | 53,3 | 88,0 | 70,0 |

DeepSeek-V4-Pro-0813 se sitúa por debajo de Opus-4.8 y Fable-5 en razonamiento puro (HLE), pero supera a todos excepto a Kimi K3 y Fable-5 en tareas de terminal. En desarrollo de software (DeepSWE), supera a GLM-5.2 y Opus-4.8, aunque queda por detrás de Kimi K3 y Fable-5. La ventaja principal es su licencia MIT frente a las propietarias de los competidores.

## Limitaciones y advertencias

- Autenticidad no verificada: el repositorio pertenece a Godwin021, no a la organización oficial deepseek-ai. Aunque la model card parece oficial, los pesos podrían ser una copia no autorizada o modificada. Se recomienda contrastar con el repositorio oficial de DeepSeek antes de usarlo en producción.
- Tamaño y coste de inferencia: con 1,65 billones de parámetros, requiere infraestructura de varios cientos de miles de dólares en GPUs. No es viable para la mayoría de equipos pequeños.
- No se dispone de información sobre sesgos, alucinaciones o comportamientos indeseados. Al ser un modelo de razonamiento con modo de pensamiento, puede generar cadenas de razonamiento extensas que aumenten la latencia.
- Idiomas soportados no especificados; el rendimiento en lenguas distintas del inglés no está garantizado.
- La licencia MIT permite uso comercial, pero no se especifica si el modelo incluye datos con derechos de autor o restricciones adicionales.
- El modelo no incluye un chat template Jinja; se requiere usar los scripts de la carpeta `encoding` para formatear mensajes, lo que añade complejidad de integración.
- Los benchmarks publicados son internos de DeepSeek (DSBench) o no verificados de forma independiente; los resultados deben tomarse con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Godwin021/DeepSeek-V4-Pro-0813
- Technical Report (arXiv): https://arxiv.org/abs/2606.19348
- Receta de despliegue con vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
