# netprojects/Qwen3.8-27B-super-adapter-MLX-8bit

## Resumen
Qwen3.8-27B-super-adapter-MLX-8bit es una conversión a formato MLX de 8 bits del adaptador Qwen3.8-27B-super-adapter, publicado por el usuario netprojects. El modelo base es harness-hub/Qwen3.8-27B-super-adapter, que a su vez es un LoRA fusionado sobre Qwen/Qwen3.8-27B. La propuesta es ofrecer un modelo de 27.781 millones de parámetros optimizado para Apple Silicon, con el codificador de visión y la capa MTP (multi-token prediction) de Qwen incluidas, empaquetado en 30 GB.

El interés principal reside en que integra tres especialistas de aprendizaje por refuerzo orientados a agentes de programación (pi, Hermes Agent y OpenCode) en un único adaptador, fusionados a peso ½ sin entrenamiento adicional. Según los resultados publicados por harness-hub, el adaptador mejora el rendimiento del modelo base en tareas de ingeniería de software y terminal, con un incremento medio de pass@1 del 55,5% al 63,5% con thinking activado y una reducción de entre el 19% y el 48% en llamadas a herramientas por tarea.

Esta build MLX está pensada para ejecutarse localmente en Macs con Apple Silicon, con cuantización afín de 8 bits en capas lineales (grupo 64). Es la variante de mayor fidelidad respecto a bf16 dentro de la familia publicada por netprojects, con un 99,6% de coincidencia en el siguiente token y una KL de 0,0005 frente a bf16. Requiere al menos 48 GB de memoria unificada recomendada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP; conversión MLX |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (Hermes Agent requiere al menos 64.000 tokens) |
| Tipos de cuantización | 8 bits afín, grupo 64 (esta build); familia con builds de 6, 4 y 3 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
El modelo subyacente es Qwen/Qwen3.8-27B, un transformer multimodal de 27.781 millones de parámetros que procesa texto e imágenes (pipeline image-text-to-text) e incluye una capa MTP (multi-token prediction). Sobre él se aplica el super-adaptador de harness-hub, un LoRA que fusiona tres especialistas de aprendizaje por refuerzo entrenados para tres arneses de agentes de programación distintos: pi y Hermes Agent (en el paso 160) y OpenCode (en el paso 150). La fusión se realiza a peso ½ por especialista, sin entrenamiento adicional tras la mezcla.

La conversión a MLX se hizo con mlx-vlm, incluyendo el codificador de visión y la capa MTP de Qwen. En esta build las capas lineales se cuantizan a 8 bits en modo afín con grupo 64, lo que produce un repositorio de 30,0 GB. El tokenizador y la plantilla de chat son los archivos originales de harness-hub, sin modificar. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO empleado en los especialistas.

## Capacidades
- Generación de texto y razonamiento con modo thinking activado por defecto en la plantilla de chat (se puede desactivar con `enable_thinking: false`).
- Comprensión de imágenes y texto (image-text-to-text) mediante el codificador de visión incluido.
- Programación y resolución de tareas de ingeniería de software: los resultados publicados se centran en SWE-bench Pro y Terminal-Bench 2.1.
- Uso de herramientas (tool calling / function calling) a través de servidores compatibles con la API de OpenAI, como `mlx_lm.server`.
- Ejecución en agentes de múltiples pasos: integración documentada con pi, Hermes Agent y OpenCode.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso
- Reparación de tests y bugs en un repositorio local: el modelo puede recibir el fallo de `tests/test_parser.py` a través de pi u OpenCode, inspeccionar el código y proponer el parche, aprovechando el entrenamiento específico en SWE-bench Pro y la reducción de llamadas a herramientas.
- Agente de terminal autónomo: con Terminal-Bench 2.1 como referencia, el modelo puede ejecutar comandos, interpretar su salida y encadenar pasos en un entorno de shell controlado.
- Asistente de programación en local para desarrolladores con Mac: servir el modelo con `mlx_lm.server` y conectarlo a un cliente compatible con OpenAI para autocompletado, explicación de código y generación de funciones, sin enviar código a la nube.
- Análisis de capturas de terminal o de interfaz: gracias al pipeline image-text-to-text, se le puede pasar una imagen de una terminal con un error y pedirle que identifique el problema y proponga una solución.
- Automatización de tareas de refactorización multiarchivo: con thinking activado y respuestas de hasta 32.768 tokens de salida, puede planificar y ejecutar cambios que requieren contexto amplio y varios pasos de razonamiento.
- Integración en flujos de CI/CD locales: desplegado como servidor OpenAI-compatible en una máquina Apple Silicon, puede atender comprobaciones de código y generación de parches en pipelines internos sin depender de APIs externas.
- Evaluación de arneses de agentes: al fusionar tres especialistas, sirve para comparar el comportamiento de pi, Hermes Agent y OpenCode sobre el mismo modelo y decidir qué arnés conviene en cada flujo.

## Benchmarks y rendimiento
Resultados publicados por harness-hub para el super-adaptador (no específicos de esta build MLX de 8 bits):

| Benchmark / condición | Base (thinking on) | Super-adaptador (thinking on) | Base (thinking off) | Super-adaptador (thinking off) |
|---|---|---|---|---|
| Media pass@1 (6 pares arnés-benchmark) | 55,5% | 63,5% | 39,5% | 49,0% |
| SWE-bench Pro (hard 51) bajo OpenCode | 47,1% | 66,7% | no disponible | no disponible |
| SWE-bench Pro (hard 51) bajo Hermes Agent | 45,1% | 60,8% | no disponible | no disponible |
| Llamadas a herramientas por tarea | referencia | 19–48% menos (thinking on) / 53–73% menos (thinking off) | referencia | — |

Métricas de fidelidad de esta build MLX-8bit frente a bf16:

| Métrica | Valor |
|---|---|
| Mismo siguiente token que bf16 | 99,6% |
| KL frente a bf16 | 0,0005 |
| GSM8K (50 preguntas) | 45/50 |
| Memoria pico con prompt de 8K tokens | 29,7 GB |

## Requisitos de hardware
- Memoria recomendada: 48 GB o más de memoria unificada en Mac con Apple Silicon (frente a 36 GB+ para la build de 6 bits y 32 GB+ para la de 4 bits).
- Memoria pico medida: 29,7 GB con un prompt de 8.000 tokens.
- Tamaño del repositorio: 30,0 GB.
- No está pensado para GPUs NVIDIA (A100, H100, RTX 4090); es una build MLX exclusiva para Apple Silicon.
- Despliegue: `mlx_lm.server` (versión >= 0.32.2) como servidor compatible con OpenAI; `mlx-vlm` (>= 0.7.11) para entrada de imágenes; integración con pi, Hermes Agent y OpenCode.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Memoria pico (8K) | Licencia |
|---|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-super-adapter-MLX-8bit | 27,78B | no disponible | 8 bits | 30,0 GB | 29,7 GB | Apache 2.0 |
| netprojects/Qwen3.8-27B-super-adapter-MLX-6bit | 27,78B | no disponible | 6 bits | 23,1 GB | 23,4 GB | Apache 2.0 |
| netprojects/Qwen3.8-27B-super-adapter-MLX-4bit | 27,78B | no disponible | 4 bits | 16,3 GB | 17,1 GB | Apache 2.0 |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,78B (base) | no disponible | 6 bits | no disponible | no disponible | Apache 2.0 |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit | 27,78B (base) | no disponible | 6 bits | no disponible | no disponible | Apache 2.0 |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,78B (base) | no disponible | 6 bits | no disponible | no disponible | Apache 2.0 |

Las builds de 6 bits de los especialistas individuales (pi, Hermes Agent, OpenCode) están recomendadas por harness-hub cuando se usa un único arnés con thinking desactivado. La build de 6 bits del super-adaptador es la recomendada como equilibrio entre tamaño y fidelidad; la de 8 bits es la más cercana a bf16.

## Limitaciones y advertencias
- Exclusiva para Apple Silicon: no se puede ejecutar en GPUs NVIDIA ni en entornos x86 sin conversión adicional.
- Requiere 48 GB o más de memoria unificada recomendada; en Macs con menos memoria hay que recurrir a las builds de 6, 4 o 3 bits.
- El modelo es una conversión de cuantización: la fidelidad no es total (99,6% de coincidencia en el siguiente token y KL de 0,0005 frente a bf16), por lo que puede haber divergencias en generaciones largas.
- Los benchmarks publicados corresponden al adaptador original de harness-hub, no a esta build MLX de 8 bits; no se han publicado resultados específicos de esta conversión.
- El modo thinking está activado por defecto y harness-hub evaluó con hasta 32.768 tokens de salida por llamada, lo que implica respuestas largas y mayor consumo de memoria y tiempo.
- Hermes Agent requiere al menos 64.000 tokens de contexto; no se especifica la longitud de contexto máxima del modelo en la información disponible.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico ni idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y del adaptador de harness-hub, ya que la ficha solo confirma la licencia de esta build.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes de uso en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Build MLX de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-4bit
- Especialista pi (MLX 6 bits): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Especialista Hermes Agent (MLX 6 bits): https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Especialista OpenCode (MLX 6 bits): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- pi: https://github.com/earendil-works/pi
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- OpenCode: https://opencode.ai
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
