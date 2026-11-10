# divinetribe/Hermes-4-14B-abliterated-4bit-mlx

## Resumen

Hermes-4-14B-abliterated-4bit-mlx es una cuantización de 4 bits en formato MLX del modelo Babsie/Hermes-4-14B-BF16-abliterated, publicada por el usuario divinetribe. Se trata de un modelo de generación de texto de 14.768.307.200 parámetros (aproximadamente 14,8 B) construido sobre la arquitectura Qwen3 con el post-entrenamiento de instrucciones de la familia Hermes 4 de NousResearch. El proceso de "abliteration" aplicado por Babsie proyecta fuera la dirección de rechazo de los pesos, de modo que el modelo conserva sus capacidades pero deja de rechazar de forma preventiva peticiones que el Hermes original declinaría.

La relevancia de esta ficha es práctica: el modelo está empaquetado específicamente para inferencia local en Apple Silicon mediante mlx-lm, ocupa unos 8,3 GB en disco repartidos en dos shards de safetensors (5,35 GB y 2,95 GB) y cabe con holgura en un Mac de 16 GB de memoria unificada. Mantiene una ventana de contexto de 40.960 tokens heredada sin cambios del Hermes 4 14B original y se distribuye con licencia Apache 2.0.

El interés técnico reside en la combinación de tres capas: la base Qwen3 de Alibaba, el post-entrenamiento Hermes 4 de NousResearch orientado a uso de herramientas y salida estructurada, y la cuantización afín de 4 bits con tamaño de grupo 64 realizada con mlx-lm 0.31.2. El resultado es un modelo que puede servirse como endpoint compatible con la API de OpenAI en localhost, sin claves de API ni telemetría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 con post-entrenamiento Hermes 4 |
| Parametros totales | 14.768.307.200 (~14,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (~40 K) |
| Tipos de cuantizacion | 4 bits afín, group size 64 (MLX); el modelo base existe en BF16 |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (dos shards: 5,35 GB + 2,95 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso con la arquitectura de Qwen3, sobre el que NousResearch aplicó el post-entrenamiento de la familia Hermes 4. Al derivar de Qwen3 hereda su tokenizador y su plantilla de chat, mientras que el ajuste de instrucciones aporta el sesgo característico de Hermes hacia el uso de herramientas, la salida estructurada y una menor tendencia al rechazo preventivo. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni los detalles de las fases de RLHF o DPO aplicadas por NousResearch.

Sobre los pesos BF16 resultantes, Babsie aplicó abliteration mediante proyección de la dirección de rechazo según el método de Arditi et al. (2024, arXiv:2406.11717), que identifica una dirección en el espacio de activaciones asociada a las respuestas de negativa y la elimina de los pesos. Posteriormente, divinetribe realizó la conversión a 4 bits afín con group size 64 usando mlx-lm 0.31.2, generando safetensors nativos de MLX. La model card no documenta innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con Qwen3.
- Razonamiento e instrucciones generales gracias al post-entrenamiento Hermes 4.
- Uso de herramientas y function calling, uno de los ejes declarados del ajuste Hermes.
- Salida estructurada (formatos tipo JSON) según la model card.
- Ejecución local en Apple Silicon mediante mlx-lm, con servidor compatible con la API de OpenAI.
- Modo "sin rechazos" sobre peticiones benignas pero delicadas, consecuencia directa de la abliteration.
- Capacidades multilingües: la model card solo declara inglés; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Asistente de código en local sobre Mac: el modelo puede integrarse en el stack claude-code-local para redirigir clientes de la API de Anthropic hacia un servidor MLX local, eliminando la dependencia de la nube en flujos de desarrollo con requisitos de confidencialidad.
- Automatización de agentes con tool calling: al estar ajustado para uso de herramientas y salida estructurada, encaja en pipelines donde el modelo debe emitir llamadas a funciones y consumir sus resultados en varios pasos, con la ventaja de que la ventana de 40.960 tokens permite mantener el historial de la conversación y las definiciones de herramientas en el mismo contexto.
- Procesamiento de documentos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo, es apto para resumir o extraer información de contratos, historiales clínicos o material bajo NDA sin que los datos salgan del equipo; el autor lo vincula explícitamente a flujos legales, sanitarios y con acuerdos de confidencialidad.
- Servidor de inferencia local compatible con OpenAI: mediante `mlx_lm.server` se expone un endpoint `/v1/chat/completions` en localhost al que apuntar cualquier SDK de OpenAI, útil para prototipar aplicaciones sin coste por token ni telemetría.
- Moderación y análisis de contenido sensible: la abliteration permite formular preguntas sobre temas que los modelos alineados rechazan de forma preventiva, lo que resulta útil en investigación sobre seguridad, análisis de discurso o redacción de contenido para audiencias adultas, asumiendo que el operador pasa a ser el moderador.
- Evaluación comparativa de cuantizaciones: con 8,3 GB en disco y ejecución en un Mac de 16 GB, sirve como banco de pruebas para medir la degradación de calidad de una cuantización 4-bit MLX frente al BF16 original en tareas de instrucciones y tool calling.
- Prototipado rápido en portátil: desarrolladores que trabajan sin GPU dedicada pueden iterar sobre prompts y plantillas de chat en un MacBook antes de desplegar en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: unos 8,3 GB en disco para los pesos en 4 bits; la model card indica que funciona con holgura en un Mac de 16 GB de memoria unificada y "vuela" en equipos de 32 GB o más.
- GPU recomendadas: Apple Silicon con memoria unificada de 16 GB como mínimo; 32 GB o más para margen de contexto y múltiples modelos cargados; en máquinas de 64 GB o más se pueden mantener varios modelos simultáneamente.
- GPU de consumo: no aplica directamente, ya que el formato es MLX y está pensado para Apple Silicon; no se documenta soporte para GPUs NVIDIA o AMD en esta conversión.
- Opciones de despliegue: mlx-lm (librería Python), `mlx_lm.server` como servidor compatible con OpenAI y el stack claude-code-local mediante `scripts/start-mlx-server.sh`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card incluye una tabla del propio autor con otros modelos de la misma colección, todos en formato MLX y abliterados:

| Modelo | Disco | Parametros | Uso recomendado |
|---|---|---|---|
| Llama-3.3-70B-Instruct-abliterated-8bit-mlx | ~75 GB | 71 B | Razonamiento más exigente, Macs de 96 GB o más |
| gemma-4-31b-it-abliterated-4bit-mlx | ~16 GB | 31 B | Codificación diaria, Macs de 32 GB o más |
| Hermes-4-14B-abliterated-4bit-mlx (este) | ~8 GB | 14 B | Macs de 16 GB, uso de herramientas, seguimiento de instrucciones |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a estas alternativas ni frente a los modelos originales sin abliterar.

## Limitaciones y advertencias

- La abliteration suprime la dirección de rechazo, pero no mejora las capacidades generales del modelo; el operador asume la responsabilidad de moderar las respuestas.
- El modelo puede producir contenido sensible, ofensivo o inapropiado que el Hermes 4 original habría declinado; no es adecuado para aplicaciones de cara al público sin una capa de filtrado propia.
- Riesgo de alucinación inherente a los modelos de 14 B, sin datos de benchmarks que permitan cuantificarlo.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea inferior.
- Ventana de contexto de 40.960 tokens, suficiente para muchas tareas pero inferior a la de modelos actuales con contextos de 128 K o más.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial debe verificar también las condiciones del Qwen3 subyacente y del post-entrenamiento Hermes 4.
- El formato MLX limita el despliegue a Apple Silicon; no hay pesos GGUF ni safetensors estándar en este repositorio, por lo que no se puede usar directamente en GPUs NVIDIA con vLLM o TGI.
- El tamaño del repositorio (8,3 GB) y la cuantización de 4 bits implican una pérdida de precisión frente al BF16 original que no está cuantificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Hermes-4-14B-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/Babsie/Hermes-4-14B-BF16-abliterated
- Paper de abliteration (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil de GitHub del autor: https://github.com/nicedreamzapp
- mlx-lm: https://github.com/ml-explore/mlx-lm
- NousResearch en Hugging Face: https://huggingface.co/NousResearch
- Qwen en Hugging Face: https://huggingface.co/Qwen
- Perfil de Hugging Face del autor: https://huggingface.co/divinetribe
- Colección de modelos MLX abliterados: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Portfolio de software del autor: https://nicedreamzwholesale.com/software/
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
