# divinetribe/Hermes-4-14B-abliterated-4bit-mlx

## Resumen

Hermes-4-14B-abliterated-4bit-mlx es una cuantización de 4 bits en formato MLX del modelo Babsie/Hermes-4-14B-BF16-abliterated, publicada por el usuario divinetribe. El modelo original combina la arquitectura Qwen3 de Alibaba con el post-entrenamiento de la familia Hermes 4 de NousResearch, orientado a instrucciones, uso de herramientas y salida estructurada. Sobre esos pesos, Babsie aplicó una técnica de "abliteración" (proyección de la dirección de rechazo, según Arditi et al., 2024) que suprime la tendencia del modelo a rechazar peticiones, y divinetribe realizó la conversión a 4 bits para inferencia local en Apple Silicon.

El resultado es un modelo de 14.768.307.200 parámetros que ocupa unos 8,3 GB en disco (dos shards safetensors de 5,35 GB y 2,95 GB) y que, según el autor, se ejecuta con comodidad en un Mac de 16 GB de memoria unificada. La longitud de contexto se mantiene en 40.960 tokens, heredada sin cambios del Hermes 4 14B original. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia actual reside en que permite ejecutar un modelo de 14B afinado para instrucciones y tool calling completamente en local, sin API key ni telemetría, mediante mlx-lm o un servidor compatible con la API de OpenAI levantado en el propio equipo. Está pensado para flujos de trabajo de agentes locales, como el stack claude-code-local del mismo autor, y para escenarios donde la ausencia de filtros de rechazo es un requisito explícito (con la responsabilidad que ello conlleva).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 con post-entrenamiento Hermes 4 |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | 4 bits afín, group size 64 (MLX); el modelo base está en BF16 |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (dos shards: 5,35 GB + 2,95 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 14B parámetros con la arquitectura Qwen3, sobre la que NousResearch aplicó su post-entrenamiento Hermes 4. Esto implica que hereda el tokenizador y la plantilla de chat de Qwen3, pero con un ajuste de instrucciones orientado a uso de herramientas, salida estructurada y seguimiento de instrucciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica destacable no está en la arquitectura sino en el proceso de modificación: Babsie aplicó abliteración sobre los pesos BF16 mediante proyección de la dirección de rechazo (Arditi et al., 2024), lo que suprime la tendencia del modelo a rechazar peticiones sin eliminar capacidades. Posteriormente, divinetribe convirtió los pesos a 4 bits en formato MLX con mlx-lm 0.31.2, usando cuantización afín con group size 64, para optimizar la inferencia en Apple Silicon.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat Qwen3.
- Seguimiento de instrucciones afinado por el post-entrenamiento Hermes 4.
- Uso de herramientas y function calling, según la orientación declarada de la familia Hermes 4.
- Salida estructurada, útil para integrarse en pipelines que esperan JSON u otros formatos definidos.
- Razonamiento y generación de código, heredados de la base Qwen3 (no cuantificados en la información disponible).
- Capacidades multilingües limitadas: el único idioma declarado es el inglés.
- Ausencia de rechazos ante peticiones benignas pero controvertidas, gracias a la abliteración.
- Ejecución local en Apple Silicon mediante mlx-lm, con servidor compatible con la API de OpenAI.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en el stack claude-code-local para enrutar clientes de la API de Anthropic hacia un servidor MLX local en el puerto 8080, eliminando el envío de código a servicios en la nube. Es adecuado por su soporte de tool calling y su huella de 8 GB.
- Automatización de agentes en MacBook: con 40.960 tokens de contexto y soporte de instrucciones, puede gestionar cadenas de razonamiento de varios pasos y llamadas a herramientas en un equipo de 16 GB sin depender de GPU dedicada.
- Procesamiento de documentos con contexto largo: la ventana de ~40K tokens permite resumir o extraer información de contratos, informes o transcripciones en una sola pasada, siempre que el contenido esté en inglés.
- Prototipado de aplicaciones con API compatible con OpenAI: mediante `mlx_lm.server` se expone un endpoint `/v1/chat/completions` que cualquier SDK de OpenAI puede consumir, lo que facilita el desarrollo y las pruebas sin coste de tokens.
- Investigación sobre alineación y rechazos: al estar abliterado, sirve para estudiar el comportamiento del modelo sin la dirección de rechazo y comparar respuestas frente a la versión original, en entornos controlados.
- Flujos con requisitos de privacidad o air-gapped: el autor comercializa un producto AirGap AI para sectores legales y sanitarios; este modelo encaja en entornos sin conexión donde no se permite telemetría ni salida de datos.
- Generación de contenido creativo sin filtros: para guionización, ficción o divulgación donde el modelo upstream rechazaría temas delicados, con la supervisión humana correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 8,3 GB en disco; el autor indica que funciona con comodidad en un Mac de 16 GB y con holgura en equipos de 32 GB o más.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada de 16 GB o superior; en máquinas de 64 GB o más se pueden cargar varios modelos simultáneamente.
- Compatibilidad con GPU de consumo: el formato MLX está pensado para Apple Silicon; no se indica soporte para GPU NVIDIA o AMD en la información disponible.
- Opciones de despliegue: mlx-lm (Python), `mlx_lm.server` como servidor compatible con la API de OpenAI, y el stack claude-code-local mediante `scripts/start-mlx-server.sh`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Disco | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Hermes-4-14B-abliterated-4bit-mlx (este) | 14B | ~8 GB | 40.960 | Apache 2.0 | Instrucciones y tool use en Macs de 16 GB |
| Llama-3.3-70B-Instruct-abliterated-8bit-mlx | 71B | ~75 GB | no disponible | no disponible | Razonamiento complejo en Macs de 96 GB+ |
| gemma-4-31b-it-abliterated-4bit-mlx | 31B | ~16 GB | no disponible | no disponible | Coding diario en Macs de 32 GB+ |

Los dos modelos alternativos pertenecen al mismo autor y a la misma colección de modelos abliterados para Apple Silicon. No se dispone de datos de rendimiento comparativo (benchmarks) entre ellos en la información proporcionada.

## Limitaciones y advertencias

- La abliteración suprime la dirección de rechazo, pero no mejora las capacidades del modelo; puede aumentar la probabilidad de respuestas inapropiadas o dañinas, y el usuario asume la función de moderación.
- Riesgo de alucinación inherente a los modelos de 14B, especialmente en tareas de razonamiento complejo o datos factuales.
- El único idioma declarado es el inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- La ventana de contexto de 40.960 tokens es menor que la de algunos modelos actuales y puede requerir troceado en documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor recuerda que se mantienen las obligaciones de las licencias upstream de Hermes 4 y Qwen3.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente utilizable en ecosistemas CUDA sin reconversión.
- La cuantización a 4 bits puede degradar ligeramente la calidad respecto al BF16 original; no se han publicado evaluaciones de esa pérdida.
- El modelo se distribuye como cuantización de un derivado abliterado de terceros, por lo que la trazabilidad del ajuste depende de los repositorios intermedios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Hermes-4-14B-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/Babsie/Hermes-4-14B-BF16-abliterated
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil de GitHub del autor: https://github.com/nicedreamzapp
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Paper de abliteración (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- mlx-lm: https://github.com/ml-explore/mlx-lm
- NousResearch en Hugging Face: https://huggingface.co/NousResearch
- Qwen en Hugging Face: https://huggingface.co/Qwen
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
