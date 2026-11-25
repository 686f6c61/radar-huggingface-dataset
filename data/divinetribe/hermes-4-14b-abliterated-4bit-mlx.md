# divinetribe/Hermes-4-14B-abliterated-4bit-mlx

## Resumen

Hermes-4-14B-abliterated-4bit-mlx es una cuantización de 4 bits en formato MLX del modelo Babsie/Hermes-4-14B-BF16-abliterated, publicada por el usuario divinetribe. Se trata de un modelo de lenguaje de 14.768.307.200 parámetros (aproximadamente 14,8 B) construido sobre la arquitectura Qwen3 con el post-entrenamiento de instrucciones de Hermes 4 de NousResearch, al que se le ha aplicado una técnica de "abliteration" que suprime la dirección de rechazo en los pesos. El resultado es un modelo sin censura orientado a instrucciones, uso de herramientas y salida estructurada.

La relevancia de esta ficha concreta reside en su empaquetado para Apple Silicon: la cuantización 4-bit con grupo de tamaño 64 reduce el peso en disco a unos 8,3 GB, lo que permite ejecutarlo en Macs con 16 GB de memoria unificada y con holgura en equipos de 32 GB o más. El contexto heredado del modelo original es de 40.960 tokens. El modelo está pensado para inferencia local mediante mlx-lm, sin dependencia de la nube ni de claves de API.

El modelo se distribuye bajo licencia Apache 2.0 heredada de la familia Hermes 4 / Qwen3, con soporte declarado únicamente para inglés. Su orientación práctica es el desarrollo de agentes locales, la integración con clientes compatibles con la API de OpenAI y Anthropic, y flujos de trabajo que requieren ausencia de telemetría y de moderación automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3, con post-entrenamiento Hermes 4 |
| Parametros totales | 14.768.307.200 (~14,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (~40 K), heredada del Hermes 4 14B original |
| Tipos de cuantizacion | 4-bit afín (affine), tamaño de grupo 64; el modelo base está en BF16 |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (dos shards: 5,35 GB + 2,95 GB; ~8,3 GB en disco) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer decoder-only de Qwen3, sobre la que NousResearch aplicó su post-entrenamiento de instrucciones Hermes 4. Al derivar de Qwen3, hereda su tokenizador y su plantilla de chat, mientras que el ajuste de instrucciones es específico de Hermes, orientado a uso de herramientas, salida estructurada y menor tendencia al rechazo de peticiones benignas pero delicadas. El modelo base intermedio es Babsie/Hermes-4-14B-BF16-abliterated, en BF16 (~28 GB), al que se le aplicó la proyección de la dirección de rechazo descrita por Arditi et al. (2024), técnica conocida como abliteration.

La conversión final a MLX 4-bit fue realizada por divinetribe con mlx-lm 0.31.2. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el post-entrenamiento de Hermes 4. La abliteration no constituye una mejora general de capacidades: únicamente suprime el comportamiento de rechazo, por lo que las habilidades subyacentes del modelo permanecen inalteradas respecto al Hermes 4 14B original.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con Qwen3.
- Razonamiento e instrucciones generales, heredados del post-entrenamiento Hermes 4.
- Uso de herramientas y salida estructurada, uno de los ejes del ajuste de Hermes.
- Integración con clientes que hablan la API de OpenAI mediante `mlx_lm.server` (endpoint `/v1/chat/completions`).
- Integración con clientes de la API de Anthropic a través del stack claude-code-local.
- Ejecución local sin telemetría, sin claves de API y sin moderación automática de rechazos.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistencia de programación en local: el modelo puede integrarse en claude-code-local para enrutar Claude Code u otros clientes de la API de Anthropic hacia inferencia en el propio Mac, sin enviar código a servicios externos. Es adecuado por su ventana de 40 K tokens y su soporte de tool calling.
- Agentes locales con tool calling: al heredar la plantilla de chat de Qwen3 y el ajuste de Hermes para uso de herramientas, puede gestionar bucles de razonamiento de varios pasos contra APIs locales o MCP dentro de un Mac con 16 GB o más.
- Servidor compatible con OpenAI para desarrollo: `mlx_lm.server` expone un endpoint local que cualquier SDK de OpenAI puede consumir, útil para prototipar aplicaciones sin coste de tokens ni dependencia de red.
- Procesamiento de documentos y resúmenes de contexto medio: con 40.960 tokens de contexto puede manejar contratos, informes o hilos de conversación largos en una sola pasada, siempre que el contenido esté en inglés.
- Flujos con requisitos de confidencialidad: entornos legales, sanitarios o con NDA donde no se permite salida de datos a la nube; el modelo corre íntegramente en el dispositivo y el autor lo vincula explícitamente a su propuesta AirGap AI.
- Generación de contenido sin rechazos automáticos: escenarios de escritura creativa, guiones o análisis de temas sensibles donde el modelo original rechazaría peticiones benignas; el operador asume el papel de moderador.
- Despliegue en equipos con memoria limitada: al ocupar unos 8 GB, cabe en MacBooks de 16 GB, lo que permite tener un asistente de 14 B en portátiles de gama media sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 8,3 GB de pesos en disco; en la práctica requiere aproximadamente 10-12 GB de memoria unificada para el modelo, el tokenizador y la caché KV con contexto largo.
- Cabe en Apple Silicon con 16 GB de memoria unificada; funciona con holgura en equipos de 32 GB y permite cargar varios modelos simultáneamente en máquinas de 64 GB o más.
- GPU recomendadas: exclusivamente Apple Silicon (series M1, M2, M3, M4 y superiores) mediante MLX; no está pensado para GPU NVIDIA ni AMD en este formato.
- Opciones de despliegue: mlx-lm (Python), `mlx_lm.server` para endpoint compatible con OpenAI, y el stack claude-code-local para clientes de la API de Anthropic.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; el autor afirma que "vuela" en equipos de 32 GB o más, sin cuantificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hermes-4-14B-abliterated-4bit-mlx (este) | ~14,8 B | 40.960 | MLX 4-bit | Apache 2.0 | Hugging Face (divinetribe) |
| Babsie/Hermes-4-14B-BF16-abliterated | ~14,8 B | 40.960 | Safetensors BF16 | Apache 2.0 | Hugging Face (Babsie) |
| divinetribe/gemma-4-31b-it-abliterated-4bit-mlx | 31 B | No disponible | MLX 4-bit | No disponible | Hugging Face (divinetribe) |
| divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx | 71 B | No disponible | MLX 8-bit | No disponible | Hugging Face (divinetribe) |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada. El modelo de 31 B ocupa unos 16 GB y requiere 32 GB o más de memoria; el de 71 B ocupa unos 75 GB y exige equipos de 96 GB o más.

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo, pero no mejora las capacidades del modelo; el operador asume toda la responsabilidad sobre la moderación de las respuestas.
- Riesgo de alucinación inherente a los modelos de 14 B, sin datos de benchmarks que permitan cuantificarlo.
- Soporte declarado únicamente para inglés; el rendimiento en castellano no está garantizado ni documentado.
- Ventana de contexto de 40.960 tokens, inferior a la de modelos actuales de gama alta; la caché KV con contexto largo consume memoria adicional sobre los 8,3 GB de pesos.
- Licencia Apache 2.0 heredada, pero el autor advierte de que el uso queda sujeto también a las licencias upstream de Hermes 4 y Qwen3.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente utilizable en vLLM, TGI, llama.cpp ni Ollama sin reconversión.
- El modelo está pensado para uso local y de un solo usuario; no se documentan pruebas de concurrencia ni de serving en producción.
- La fecha de creación del repositorio (2026) y la información de descargas de la model card deben tratarse con cautela, ya que parte de las estadísticas citadas proceden de bloques autogenerados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Hermes-4-14B-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/Babsie/Hermes-4-14B-BF16-abliterated
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil de GitHub del autor: https://github.com/nicedreamzapp
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper de abliteration (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- NousResearch en Hugging Face: https://huggingface.co/NousResearch
- Qwen en Hugging Face: https://huggingface.co/Qwen
- Portfolio del autor: https://nicedreamzwholesale.com/software/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
