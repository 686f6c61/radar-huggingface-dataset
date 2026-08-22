# Kanha-AI/kanha-kanha.ai-1.7b-pit-quality-v1

## Resumen

Kanha kanha.ai-1.7b-pit-quality-v1 es un modelo de lenguaje compacto de 1.700 millones de parámetros, desarrollado por Kanha-AI como parte de su plataforma para crear chatbots personalizados de sitios web. El modelo es un ajuste fino del checkpoint Qwen/Qwen3-1.7B mediante una técnica de entrenamiento propia denominada PIT (*document continuation* más Q&A), con el objetivo de especializar el modelo en el contenido específico de una web concreta para responder preguntas de sus visitantes.

La relevancia de este lanzamiento radica en su filosofía de despliegue: Kanha.ai entrena modelos pequeños a partir del contenido de un sitio y los distribuye para que se ejecuten directamente en el dispositivo del cliente mediante WebGPU, evitando llamadas constantes a APIs remotas y reduciendo costes operativos y latencia. El checkpoint publicado aquí es un artefacto de entrenamiento de calidad (identificado como `pit-quality-v1`) que usa el corpus privado de un sitio web concreto, con 17 documentos de entrenamiento y 170 pares de preguntas y respuestas.

La ventana de contexto de entrenamiento es de 2048 tokens, el formato de pesos es `safetensors` en `bfloat16`, y la licencia no está especificada. El modelo está pensado para uso monolingüe en inglés y su publicación incluye métricas de evaluación específicas del dominio, no benchmarks generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3-1.7B) |
| Parámetros totales | 1.720.574.976 (1,72 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (máxima utilizada en entrenamiento; el contexto nativo del base es 32768) |
| Tipos de cuantización | no disponible (pesos publicados en `bfloat16`; no se publican versiones GGUF o cuantizadas) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, que incorpora atención por consultas agrupadas (GQA) y un tokenizador con vocabulario amplio. Sobre esta base se ha aplicado un entrenamiento continuo de tipo *document continuation* más Q&A: el corpus privado del sitio web objetivo (17 documentos) se convierte en pares de preguntas y respuestas (170 pares) y el modelo se ajusta para continuar documentos y responder preguntas sobre ese contenido concreto.

El entrenamiento se realizó con una longitud máxima de 2048 tokens, 20 épocas, tasa de aprendizaje de 1e-05 con programación coseno con mínimo del 10 %, tamaño de lote de 8 con acumulación de gradientes de 2, peso de decaimiento de 0,1 y optimizador AdamW en precisión mixta `bf16` con `tf32` habilitado. Se usó *gradient checkpointing* y no se aplicó warmup. El prompt de sistema utilizado fue: *"You are a helpful assistant. Answer the user's question accurately and concisely."*. No se menciona el uso de RLHF ni DPO en el proceso.

## Capacidades

- Generación de texto conversacional en inglés, especializada en responder preguntas sobre el contenido de un sitio web concreto.
- Recuperación de datos factuales específicos del dominio: fechas, URLs y números presentes en los documentos de entrenamiento.
- Funcionamiento como asistente conciso y directo, con una tasa de rechazo del 0 % en las evaluaciones internas.
- Ejecución en dispositivo (on-device) mediante WebGPU, según el flujo de despliegue de Kanha.ai.
- No se documenta soporte de *tool calling*, razonamiento multi-paso, visión, audio ni capacidades de *function calling*.

## Casos de uso

- Chatbot de atención al cliente para una web: el modelo responde preguntas frecuentes sobre productos, servicios, horarios o políticas directamente desde el contenido indexado del sitio.
- Asistente de documentación técnica: los usuarios pueden preguntar por pasos de instalación, configuración o referencia de API consultando el corpus de documentación del proyecto.
- Generación de respuestas en formularios de contacto o widgets de soporte: al ejecutarse en el navegador del cliente vía WebGPU, se elimina la latencia de red y los costes de inferencia remota.
- Extracción de información factual de un dominio concreto: el modelo recupera URLs y fechas mencionadas en los documentos de entrenados con alta precisión (recall de URLs y fechas de 1.0 en evaluación).
- Prototipado rápido de un asistente especializado: el flujo de Kanha permite apuntar a un sitio, generar los pares Q&A y desplegar el modelo en un script, componente Web o React.
- Entrenamiento de modelos específicos para intranets o sitios privados: el modelo puede ajustarse al contenido interno de una organización y ejecutarse en los dispositivos de los empleados sin salida de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación interna publicada por el autor se limita a un conjunto de 26 ejemplos del dominio del sitio web, con las siguientes métricas:

| Métrica | Valor |
|---|---|
| dates_recall | 1.0 |
| urls_recall | 1.0 |
| numbers_recall | 0.7308 |
| list_recall | 0.0788 |
| refusal_rate | 0.0 |
| unsupported_value_rate | 0.6538 |
| deterministic_pass_rate | 0.0 |

Estos resultados solo califican el comportamiento del servidor y no establecen capacidad general ni seguridad de producción. El alto `unsupported_value_rate` indica que más de la mitad de las respuestas generadas contienen valores no soportados por el conjunto de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en `bfloat16` (≈3,5 GB), se necesita al menos 4 GB de VRAM para cargar el modelo sin cuantización. Con cuantización de 8 bits cabría en ~2 GB, y en 4 bits en ~1 GB, aunque no se publican versiones cuantizadas.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (por ejemplo, NVIDIA RTX 3050, 3060, 4060, 4090) puede ejecutar el modelo en `bf16`; para despliegue en navegador se requiere una GPU compatible con WebGPU.
- Compatible con GPUs de consumo: sí, es un modelo de 1,7 B que cabe en tarjetas de gama media.
- Opciones de despliegue: la plataforma Kanha propone ejecución en el dispositivo mediante WebGPU (script, Web Component o React); en servidores puede usarse con las librerías de `transformers` y `text-generation-inference` (endpoints compatibles).
- Latencia y throughput: no disponible en la documentación; al ser un modelo pequeño, se espera una latencia baja en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

El modelo es un *fine-tune* de Qwen3-1.7B, por lo que la comparativa más directa es con su base y con otros modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Kanha-AI/kanha-kanha.ai-1.7b-pit-quality-v1 | 1,72 B | 2048 (entrenado) | no disponible | Especializado en un corpus de un sitio web concreto |
| Qwen/Qwen3-1.7B | 1,72 B | 32768 | Apache 2.0 | Modelo base, capacidad general multilingüe |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32768 | Apache 2.0 | Modelo general anterior de la familia Qwen |
| Llama-3.2-1B | 1,23 B | 128000 | Llama 3.2 Community License | Modelo general de Meta, multilingüe |

El modelo Kanha no aporta datos de rendimiento general comparables; su valor está en la especialización sobre un corpus privado y en la posibilidad de ejecución en dispositivo.

## Limitaciones y advertencias

- El corpus de entrenamiento es privado y específico de un sitio web; el modelo no demuestra capacidad general ni seguridad de producción, como reconoce el propio autor.
- La evaluación solo cubre 26 ejemplos y se limita al comportamiento del servidor; no se ha validado el artefacto en el navegador ni en el dispositivo objetivo.
- Riesgo de alucinación y de generar contenido incorrecto, incompleto, desactualizado o memorizado, especialmente fuera del dominio del sitio.
- Alta tasa de valores no soportados (0,6538) en la validación, lo que indica que muchas respuestas pueden contener datos no previstos.
- No se publica la licencia del modelo, lo que impide determinar las condiciones de uso comercial y redistribución.
- Longitud de contexto limitada a 2048 tokens durante el entrenamiento, aunque el base soporta 32768; para conversaciones largas puede ser insuficiente.
- Solo está soportado el inglés; no se documenta capacidad multilingüe.
- No se incluye un artefacto MLC validado para despliegue en dispositivos móviles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-pit-quality-v1
- Organización Kanha-AI en Hugging Face: https://huggingface.co/Kanha-AI
- Repositorio GitHub de la plataforma: https://github.com/Kanha-AI/Kanha-AI
- Organización en GitHub: https://github.com/Kanha-AI
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
