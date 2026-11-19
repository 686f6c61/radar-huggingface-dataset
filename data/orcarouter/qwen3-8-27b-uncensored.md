# orcarouter/Qwen3.8-27B-Uncensored

## Resumen

Qwen3.8-27B-Uncensored es una variante "abliterated" (con el mecanismo de rechazo eliminado) del modelo Qwen/Qwen3.8-27B, publicada por orcarouter. Se distribuye en precisión completa BF16 y está pensada como pesos fuente para fine-tuning, post-entrenamiento y cuantización posterior. El modelo base es un transformer denso de 27 781 427 952 parámetros (aproximadamente 27,8 B) con atención híbrida (Gated DeltaNet lineal combinada con atención completa), torre de visión nativa (pipeline image-text-to-text) y una cabeza MTP (multi-token prediction) para decodificación especulativa.

La modificación principal respecto al modelo original es la eliminación de la dirección de rechazo mediante ortogonalización en el flujo residual, lo que suprime prácticamente la alineación de seguridad del modelo base. El autor lo orienta explícitamente a red teaming, investigación de seguridad ofensiva y generación de datos adversarios, y advierte de que cumplirá peticiones dañinas, poco éticas u ofensivas.

La relevancia actual del modelo es doble: por un lado, conserva las capacidades del Qwen3.8-27B original (contexto de 262 144 tokens, visión-lenguaje, function calling, control flexible del modo de razonamiento); por otro, su condición de pesos BF16 completos con la torre de visión y la cabeza MTP intactas lo convierte en una base poco habitual para experimentación sobre alineación y para la construcción de derivados cuantizados. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida: Gated DeltaNet (atención lineal) + atención completa; torre de visión nativa; cabeza MTP de decodificación especulativa |
| Parametros totales | 27 781 427 952 (≈27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | BF16 (pesos publicados); derivados oficiales en block-FP8, GGUF de 2 a 16 bits y MLX de 2, 4 y 8 bits |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); derivados en GGUF y MLX |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 55,6 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Modelo base | Qwen/Qwen3.8-27B (finetune) |
| Descargas / likes | 8396 / 542 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B: un transformer denso que combina capas de atención lineal Gated DeltaNet con capas de atención completa, un esquema híbrido que reduce el coste computacional en contextos largos manteniendo la calidad de recuperación de la atención completa. Incorpora una torre de visión que lo convierte en un modelo visión-lenguaje nativo, y una cabeza MTP (multi-token prediction) que permite decodificación especulativa y mejora el throughput de generación. El contexto declarado es de 262 144 tokens.

El post-entrenamiento aplicado por orcarouter consiste en abliteration: la extracción de la dirección de rechazo del flujo residual y su ortogonalización, de modo que el modelo deja de activar respuestas de negativa ante peticiones que el modelo original rechazaría. El autor no documenta en la información disponible el volumen de datos, la composición del dataset ni si hubo pasos adicionales de RLHF o DPO tras la abliteration. Los pesos se distribuyen en BF16 con la torre de visión y la cabeza MTP preservadas, lo que permite reutilizarlos como base para post-entrenamiento y para generar cuantizaciones (FP8, GGUF, MLX).

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262 144 tokens.
- Razonamiento con control flexible del modo de pensamiento (thinking mode configurable).
- Comprensión de imágenes y texto combinados (image-text-to-text) mediante torre de visión nativa.
- Function calling y tool calling, con etiqueta específica en el repositorio.
- Razonamiento multi-paso orientado a agentes.
- Decodificación especulativa mediante cabeza MTP, que acelera la inferencia.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Cumplimiento de peticiones que el modelo base rechazaría, por efecto de la abliteration.
- Servible a través de endpoints compatibles (etiqueta endpoints_compatible) y API OpenAI-compatible en OrcaRouter.

## Casos de uso

- Red teaming de sistemas de IA: el modelo sirve para generar prompts adversarios y respuestas que permitan evaluar la robustez de filtros y clasificadores de seguridad en pipelines propios, precisamente porque no aplica rechazos.
- Investigación sobre alineación y abliteration: al conservar los pesos BF16 completos, permite comparar activaciones y direcciones de rechazo frente al Qwen3.8-27B original y medir el efecto de la ortogonalización en el flujo residual.
- Generación de datos de entrenamiento para clasificadores de contenido: se puede usar para producir ejemplos positivos y negativos en tareas de moderación, con revisión humana obligatoria.
- Fine-tuning y post-entrenamiento: al ser la fuente BF16 con torre de visión y cabeza MTP intactas, es la base recomendada por el autor para adaptar el modelo a dominios concretos y después cuantizar.
- Evaluación de visión-lenguaje en documentos: la ventana de 262K tokens y la torre de visión permiten procesar lotes de imágenes y páginas junto con texto largo en tareas de extracción y descripción.
- Automatización de agentes con tool calling: integrable en flujos multi-paso donde el modelo debe invocar funciones externas y mantener contexto largo entre pasos.
- Producción de cuantizaciones propias: a partir de estos pesos se pueden generar variantes GGUF o MLX para despliegue en llama.cpp u Ollama en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: los 27,8 B parámetros a 2 bytes por parámetro suponen aproximadamente 55,6 GB solo de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB de VRAM para inferencia cómoda.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU (por ejemplo, 2×A100 40 GB con tensor parallelism).
- Cuantización FP8: reduce los pesos a aproximadamente 28 GB, lo que permite servir en una sola A100 40 GB o L40S 48 GB.
- Consumer GPU: en BF16 no cabe en ninguna GPU de consumo actual. Con GGUF de 4 bits (unos 15-16 GB) puede ejecutarse en RTX 4090 (24 GB) o RTX 3090; con 2 bits cabría en GPUs de 12-16 GB a costa de degradación de calidad.
- Apple Silicon: los derivados MLX de 4 y 8 bits permiten ejecución en equipos con memoria unificada de 32 GB o superior.
- Opciones de despliegue: vLLM (recomendado para FP8 y BF16 con la cabeza MTP para decodificación especulativa), llama.cpp y Ollama (GGUF), MLX para Apple Silicon, TGI y endpoints compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP está pensada para mejorar el throughput mediante decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| orcarouter/Qwen3.8-27B-Uncensored | 27,8 B denso | 262 144 | Si | Apache 2.0 | Restringido (gated) | Abliterated, BF16, cabeza MTP |
| Qwen/Qwen3.8-27B | 27,8 B denso | 262 144 | Si | Apache 2.0 | Publico | Modelo base con alineacion de seguridad intacta |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | 27,8 B denso | 262 144 | Si | Apache 2.0 | No disponible | Derivado block-FP8 para vLLM |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 27,8 B denso | 262 144 | Si | Apache 2.0 | No disponible | Derivado de 2 a 16 bits para llama.cpp |

## Limitaciones y advertencias

- La alineación de seguridad ha sido sustancialmente eliminada: el modelo cumplirá peticiones dañinas, poco éticas, ofensivas o ilegales, según advierte el propio autor.
- Riesgo elevado de generar contenido ilegal o peligroso sin filtros adicionales; requiere moderación externa obligatoria en cualquier despliegue.
- Riesgo de alucinación inherente a los modelos de 27 B, no cuantificado en la información disponible.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Aunque la licencia es Apache 2.0, el acceso al repositorio está restringido y sujeto a las condiciones de Hugging Face; conviene revisar las obligaciones de uso aceptable antes de un despliegue comercial.
- El uso comercial de un modelo sin alineación puede acarrear responsabilidad legal según la jurisdicción y el sector.
- La información sobre datos de entrenamiento, composición del dataset y pasos de RLHF/DPO no está disponible, lo que dificulta evaluar sesgos.
- No se han publicado benchmarks en la información disponible, por lo que no se puede verificar la degradación de capacidades respecto al modelo base tras la abliteration.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Derivado FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Derivado GGUF: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Derivado MLX: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Tarjeta del modelo en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- Endpoint API: https://api.orcarouter.ai/v1
- Sitio web de OrcaRouter: https://www.orcarouter.ai
- Catalogo de modelos: https://www.orcarouter.ai/models
- GitHub de la organizacion: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
