# divinetribe/Hermes-4-14B-abliterated-4bit-mlx

## Resumen

Hermes-4-14B-abliterated-4bit-mlx es una cuantización de 4 bits en formato MLX del modelo Babsie/Hermes-4-14B-BF16-abliterated, publicada por el usuario divinetribe. El modelo subyacente combina la arquitectura Qwen3 de Alibaba con el post-entrenamiento de Hermes 4 de NousResearch, y sobre esa base se ha aplicado una técnica de "abliteration" que proyecta fuera la dirección de rechazo de los pesos, de modo que el modelo deja de emitir negativas preventivas ante peticiones legítimas pero delicadas. Esta conversión concreta lo empaqueta para inferencia local en Apple Silicon mediante mlx-lm.

El interés práctico del modelo es que comprime un transformer denso de 14 768 307 200 parámetros en aproximadamente 8,3 GB de disco (dos shards safetensors de 5,35 GB y 2,95 GB), lo que permite ejecutarlo en un MacBook con 16 GB de memoria unificada y con holgura en equipos de 32 GB o más. Conserva la ventana de contexto de 40 960 tokens del Hermes 4 14B original y hereda su plantilla de chat y tokenizador de Qwen3.

Es relevante ahora porque cubre un nicho muy concreto: despliegue totalmente local, sin claves de API ni telemetría, con un endpoint compatible con la API de OpenAI servido por mlx_lm.server, y con integración directa en el stack claude-code-local del mismo autor. No es un modelo de propósito general puntero en benchmarks, sino una pieza de infraestructura para flujos de trabajo on-device en macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, base Qwen3 con post-entrenamiento Hermes 4 |
| Parametros totales | 14 768 307 200 (14,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40 960 tokens |
| Tipos de cuantizacion | 4 bits afín, group size 64 (MLX); el modelo base existe en BF16 |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (dos shards: 5,35 GB + 2,95 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3, con el tokenizador y la plantilla de chat de Qwen3, sobre el que NousResearch aplicó su post-entrenamiento Hermes 4, orientado a uso de herramientas, salida estructurada e instrucciones. El modelo base intermedio, Babsie/Hermes-4-14B-BF16-abliterated, aplica la técnica de proyección de la dirección de rechazo descrita por Arditi et al. (2024) sobre los pesos en BF16. Esta conversión final de divinetribe reduce esos pesos a 4 bits afín con group size 64 usando mlx-lm 0.31.2.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el post-entrenamiento de Hermes 4. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La única transformación técnica destacable es la abliteración, que suprime la dirección de rechazo sin eliminar capacidades, y la cuantización MLX que reduce el peso de 28 GB en BF16 a unos 8 GB.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Qwen3.
- Seguimiento de instrucciones con el estilo de post-entrenamiento Hermes 4.
- Uso de herramientas y salida estructurada, según la model card del modelo base.
- Razonamiento y respuesta a preguntas sin negativas preventivas ante consultas legítimas pero delicadas, gracias a la abliteración.
- Servido como endpoint compatible con la API de OpenAI mediante mlx_lm.server (ruta /v1/chat/completions).
- Integración con clientes de la API de Anthropic a través del stack claude-code-local.
- Ejecución totalmente local en Apple Silicon, sin claves de API ni telemetría.
- Capacidades multilingües: no acreditadas; la model card solo declara inglés.

## Casos de uso

- Asistente de código local en macOS: el modelo se sirve con mlx_lm.server en el puerto 8080 y se conecta a Claude Code o a cualquier cliente del SDK de OpenAI, de modo que el desarrollador trabaja con un agente de código sin enviar código a la nube.
- Flujos con requisitos de confidencialidad: al ejecutarse íntegramente en el equipo, es apto para entornos con NDA, datos de salud o información legal donde no se permite salida a servicios externos.
- Moderación y revisión de contenido sin filtros previos: la abliteración permite analizar textos sensibles (por ejemplo, reportes de abuso o material de seguridad) sin que el modelo se niegue a procesarlos, dejando la moderación en manos del operador.
- Prototipado de agentes con tool calling: la ventana de 40 960 tokens y la salida estructurada permiten encadenar varios pasos con contexto amplio en un Mac de 16 GB.
- Evaluación de modelos en investigación: sirve como contrapunto "sin rechazo" frente al Hermes 4 estándar para estudiar el efecto de la abliteración en comportamiento y calidad.
- Despliegue en equipos de gama alta: en máquinas de 64 GB o más se pueden mantener varios modelos cargados a la vez, útil para comparar respuestas o enrutar tareas entre modelos.
- Automatización de tareas de oficina offline: redacción, resumen y reescritura de documentos en local, sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: unos 8,3 GB en disco; se ejecuta con holgura en un Mac con 16 GB de memoria unificada y con margen amplio en equipos de 32 GB o más.
- GPU recomendadas: Apple Silicon (serie M). El formato MLX está pensado para estos chips; no es directamente utilizable en GPU NVIDIA sin reconvertir los pesos.
- GPU de consumo: sí cabe en MacBook de 16 GB; en el ecosistema NVIDIA haría falta una conversión a GGUF u otro formato, no incluida en este repositorio.
- Opciones de despliegue: mlx-lm (librería Python), mlx_lm.server como servidor compatible con OpenAI, y el stack claude-code-local mediante scripts/start-mlx-server.sh.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Disco | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| Hermes-4-14B-abliterated-4bit-mlx (este) | 14,77 B | ~8 GB | 40 960 | Local en Apple Silicon, sin rechazo | Apache 2.0 |
| Llama-3.3-70B-Instruct-abliterated-8bit-mlx (mismo autor) | 71 B | ~75 GB | no disponible | Razonamiento más exigente, Macs de 96 GB+ | no disponible |
| gemma-4-31b-it-abliterated-4bit-mlx (mismo autor) | 31 B | ~16 GB | no disponible | Codificación diaria, Macs de 32 GB+ | no disponible |
| Hermes-4-14B-BF16-abliterated (modelo base) | 14,77 B | ~28 GB | 40 960 | Pesos completos sin cuantizar | Apache 2.0 |

## Limitaciones y advertencias

- La abliteración elimina las negativas preventivas, pero no mejora las capacidades del modelo; puede aumentar la probabilidad de respuestas dañinas o inexactas en temas delicados.
- Riesgo de alucinación inherente a un modelo de 14 B; no se han publicado evaluaciones que lo cuantifiquen.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está acreditado.
- La cuantización a 4 bits puede degradar la calidad respecto al BF16 original, especialmente en tareas de razonamiento largo.
- Licencia Apache 2.0 heredada, pero el autor recuerda que se mantienen las obligaciones de las licencias upstream de Hermes 4 y Qwen3.
- El formato MLX limita el uso a Apple Silicon; no es portable a CUDA sin reconversión.
- El modelo está pensado para uso local y no se documentan garantías de producción ni soporte.
- El contenido de la model card incluye estadísticas de descargas y enlaces promocionales del autor que deben tratarse como material de marketing, no como especificaciones técnicas verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Hermes-4-14B-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/Babsie/Hermes-4-14B-BF16-abliterated
- NousResearch (Hermes 4): https://huggingface.co/NousResearch
- Qwen (Alibaba): https://huggingface.co/Qwen
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper de abliteración (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- Portfolio de software: https://nicedreamzwholesale.com/software/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
