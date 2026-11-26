# bharatgenai/FinanceParam

## Resumen

FinanceParam es un modelo de lenguaje especializado en el dominio financiero, desarrollado por BharatGen AI (bharatgenai) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tune) del modelo base bharatgenai/Param-1-2.9B-Instruct, un transformer decoder-only de aproximadamente 2.860 millones de parámetros. El modelo está diseñado para tareas conversacionales multi-turno y de pregunta-respuesta (QnA) en el ámbito financiero, con soporte para inglés (en) y hindi (hi).

El modelo resuelve el problema de la falta de asistentes conversacionales especializados en finanzas para el contexto indio, donde la terminología financiera, los productos bancarios y las normativas locales requieren un tratamiento específico que los modelos generalistas no cubren con precisión. Al estar afinado sobre un modelo base ya entrenado, hereda las capacidades generales de generación de texto y razonamiento del Param-1, pero las orienta hacia consultas financieras.

Su relevancia actual radica en la combinación de un tamaño contenido (2.9B parámetros) que permite despliegue en hardware modesto, una licencia permisiva (Apache 2.0) que facilita el uso comercial, y un enfoque bilingüe inglés-hindi que lo hace útil para el mercado financiero indio. El acceso al modelo está restringido (gated) en Hugging Face, requiriendo la aceptación de condiciones por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Param-1-2.9B-Instruct) |
| Parametros totales | 2.860.648.448 (2.86B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, compatible con cuantizacion estandar) |
| Idiomas soportados | Ingles (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | bharatgenai/Param-1-2.9B-Instruct |
| Tamano del repositorio | 5.8 GB |
| Acceso | Restringido (gated) en Hugging Face |
| Libreria | transformers |
| Pipeline | text-generation |
| Tags | Multiturn, QnA, conversational, custom_code |

## Arquitectura y entrenamiento

FinanceParam es un fine-tune del modelo Param-1-2.9B-Instruct, que a su vez es un transformer decoder-only de 2.86B parámetros desarrollado por BharatGen AI. La arquitectura subyacente es la de un transformer estándar con atención completa, sin innovaciones híbridas ni componentes MoE. El modelo incluye código personalizado (tag `custom_code`), lo que implica que requiere la confianza remota (`trust_remote_code=True`) o la instalación de módulos específicos para su carga en transformers.

No se dispone de información detallada sobre el proceso de entrenamiento del fine-tune: no se especifica el número de tokens utilizados, la composición del dataset financiero, ni si se emplearon técnicas de RLHF, DPO o instrucción supervisada. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El modelo base Param-1-2.9B-Instruct es un modelo de instrucciones, por lo que FinanceParam hereda esa orientación conversacional y la especializa mediante ajuste fino en datos del dominio financiero, con énfasis en conversaciones multi-turno y QnA.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Param-1-2.9B-Instruct.
- Conversación multi-turno (tag `Multiturn`): mantiene el hilo de diálogos con múltiples intercambios.
- Pregunta-respuesta (QnA) especializada en el dominio financiero.
- Soporte bilingüe inglés-hindi, orientado al mercado financiero indio.
- Capacidad de instrucción: responde a prompts en formato de instrucciones/conversación.
- No se documenta soporte de tool calling / function calling en la información disponible.
- No se documenta soporte de agentes, multi-step reasoning, visión, audio ni thinking mode.
- No se documenta una ventana de contexto específica ni capacidades de código o matemáticas más allá de las heredadas del modelo base.

## Casos de uso

- Atención al cliente financiera automatizada: el modelo puede gestionar conversaciones multi-turno con clientes de entidades bancarias o fintechs, respondiendo a consultas sobre productos, saldos y procedimientos en inglés o hindi, gracias a su entrenamiento específico en QnA financiera y su capacidad de mantener contexto conversacional.

- Asistente de educación financiera: despliegue como chatbot que explica conceptos como tipos de interés, inversiones, seguros o créditos a usuarios no expertos, aprovechando su especialización en terminología financiera y su soporte bilingüe para el mercado indio.

- Soporte interno para empleados de banca: integración en herramientas internas para que el personal consulte políticas, productos y procedimientos financieros mediante preguntas en lenguaje natural, reduciendo el tiempo de búsqueda en documentación.

- Clasificación y enrutamiento de consultas financieras: uso del modelo como primer nivel de un sistema de atención al cliente que interpreta la consulta del usuario, la clasifica por temática financiera y genera una respuesta preliminar o la deriva al departamento adecuado.

- Generación de respuestas FAQ financieras: creación automatizada de respuestas para secciones de preguntas frecuentes de portales bancarios o financieros, aprovechando su entrenamiento en QnA del dominio para generar texto coherente y contextualizado.

- Prototipado rápido de asistentes financieros: dado su tamaño contenido (2.86B) y licencia Apache 2.0, sirve para construir prototipos de asistentes conversacionales financieros en entornos con recursos limitados, antes de escalar a modelos mayores.

- Localización de contenido financiero inglés-hindi: traducción y adaptación de material financiero entre ambos idiomas, apoyándose en su entrenamiento bilingüe y su conocimiento del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 5.7 GB solo para los pesos (2.86B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 8-10 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3 GB para pesos; en 4 bits: aproximadamente 1.5-2 GB para pesos.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en producción con throughput alto; RTX 4090 o RTX 3090 para desarrollo y despliegue en una sola GPU consumer.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM en fp16 (RTX 3070/4060 Ti y superiores), y en tarjetas con 4-6 GB en cuantización de 4 bits (RTX 3050, GTX 1660 con 6 GB, etc.).
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el tag `custom_code`), vLLM, TGI, llama.cpp/Ollama si se generan pesos GGUF a partir de los safetensors. El tag `deploy:azure` sugiere compatibilidad con Azure AI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso | Especializacion |
|---|---|---|---|---|---|---|
| FinanceParam (bharatgenai) | 2.86B | No disponible | en, hi | Apache 2.0 | Gated | Finanzas, QnA, multiturno |
| Param-1-2.9B-Instruct (bharatgenai) | 2.9B | No disponible | en, hi (probable) | No disponible | No disponible | Instrucciones generales |
| Qwen2.5-3B-Instruct | 3.09B | 32.768 tokens | Multilingue (29+) | Apache 2.0 | Abierto | Instrucciones generales |
| Phi-3-mini (Microsoft) | 3.8B | 4.096-128K tokens | Multilingue | MIT | Abierto | Instrucciones generales |

FinanceParam se diferencia de los modelos generalistas de tamaño similar (Qwen2.5-3B, Phi-3-mini) por su especialización en el dominio financiero y su enfoque bilingüe inglés-hindi, aunque carece de la documentación pública de contexto y benchmarks que sí ofrecen los modelos de Alibaba y Microsoft. Frente a su modelo base Param-1-2.9B-Instruct, FinanceParam añade el ajuste fino financiero y la orientación conversacional multi-turno.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado para el contexto financiero indio, puede reflejar sesgos propios del mercado y la terminología local.
- Riesgo de alucinación: como todo modelo de lenguaje de 2.86B parámetros, puede generar información financiera incorrecta o inventada; no debe usarse como fuente de asesoramiento financiero sin verificación humana.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que dificulta planificar despliegues con conversaciones largas o documentos extensos.
- Limitaciones de idioma: solo se declaran inglés y hindi; no hay soporte documentado para castellano ni otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Caveat de producción: requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de desplegar en producción.
- Ausencia de benchmarks públicos: no hay métricas de rendimiento publicadas, lo que impide comparar objetivamente su calidad frente a alternativas.
- Fecha de actualización: el repositorio se actualizó en noviembre de 2026, pero no se documentan cambios ni versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bharatgenai/FinanceParam
- Modelo base: https://huggingface.co/bharatgenai/Param-1-2.9B-Instruct
- Organización BharatGen AI: https://huggingface.co/bharatgenai
