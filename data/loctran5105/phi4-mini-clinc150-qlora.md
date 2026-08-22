# loctran5105/phi4-mini-clinc150-qlora

## Resumen

El modelo `loctran5105/phi4-mini-clinc150-qlora` es un adaptador LoRA (Low-Rank Adaptation) entrenado con QLoRA sobre el modelo base `microsoft/Phi-4-mini-instruct`, un modelo de lenguaje compacto de 3.8 mil millones de parámetros desarrollado por Microsoft. El adaptador está diseñado para la clasificación de intenciones en diálogos, utilizando el dataset CLINC150, un conjunto de referencia estándar de 150 intenciones repartidas en 15 dominios para sistemas de conversación orientados a atención al cliente y asistentes virtuales.

Aunque el pipeline declarado es `text-generation` (heredado del modelo base), el adaptador LoRA se ha entrenado para la tarea de clasificación de intenciones, lo que permite al modelo base detectar la intención del usuario en una frase de entrada. El repositorio pesa 0.1 GB y contiene exclusivamente los pesos del adaptador en formato safetensors, no el modelo completo. La ficha del autor está prácticamente vacía, por lo que los detalles de entrenamiento, hiperparámetros y rendimiento no están disponibles públicamente.

La relevancia de este adaptador radica en su tamaño reducido y en su base sobre un modelo eficiente como Phi-4-mini, que ofrece una ventana de contexto de 128K tokens y capacidades multilingües. Esto lo hace atractivo para tareas de comprensión de intenciones en entornos con recursos limitados, aunque su utilidad real depende de la calidad del entrenamiento, que no se ha documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con atención causal; adaptador LoRA sobre Phi-4-mini-instruct |
| Parametros totales | 3.8 mil millones (modelo base) + pesos del adaptador LoRA (no disponibles) |
| Parametros activos | No aplicable (no es MoE; el adaptador activa una fracción de los pesos base) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponibles (el adaptador está en safetensors; el modelo base soporta cuantizaciones 4-bit y 8-bit vía bitsandbytes) |
| Idiomas soportados | No disponibles (el modelo base soporta multilingüe, pero no se especifica el alcance del adaptador) |
| Licencia | No disponible (el modelo base usa licencia MIT, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base `Phi-4-mini-instruct` es un transformer decoder-only de 3.8 mil millones de parámetros con una arquitectura estándar de atención causal, optimizado para razonamiento, matemáticas y codificación. Fue entrenado con una mezcla de datos web de alta calidad y datos sintéticos, y posteriormente alineado mediante instrucciones. Su ventana de contexto de 128K tokens lo hace adecuado para tareas que requieren mantener conversaciones largas o procesar documentos extensos.

El adaptador `phi4-mini-clinc150-qlora` se creó mediante QLoRA, una técnica de fine-tuning eficiente que cuantiza el modelo base a 4 bits y entrena un adaptador de bajo rango. El dataset CLINC150 (con 2,250 frases de entrenamiento, 150 intenciones y 15 dominios) se utiliza habitualmente para evaluar la clasificación de intenciones en diálogos. Sin embargo, la model card no proporciona información sobre el número de épocas, el rango del LoRA, la tasa de aprendizaje ni el proceso de evaluación. Tampoco se indica si se aplicaron técnicas de post-entrenamiento como RLHF o DPO.

## Capacidades

- Clasificación de intenciones: el adaptador permite identificar la intención del usuario entre 150 categorías del dataset CLINC150, incluyendo dominios como banca, viajes, telecomunicaciones y atención general.
- Generación de texto: hereda las capacidades de generación de texto del modelo base Phi-4-mini-instruct, aunque el adaptador está optimizado para la tarea de clasificación.
- Razonamiento y matemáticas: el modelo base ofrece capacidades sólidas en razonamiento y matemáticas, que pueden ayudar a interpretar consultas complejas.
- Soporte de tool calling: el modelo base Phi-4-mini soporta function calling, pero no se ha verificado si el adaptador conserva esta capacidad tras el fine-tuning.
- Multilingüe: el modelo base tiene soporte multilingüe, aunque el adaptador se ha entrenado presumiblemente con datos en inglés (CLINC150 es un dataset en inglés).
- Contexto largo: la ventana de 128K tokens del modelo base se mantiene, lo que permite procesar conversaciones extensas con múltiples turnos.

## Casos de uso

- Atención al cliente automatizada: el adaptador puede integrarse en un sistema de chatbot para clasificar la intención del usuario (por ejemplo, "cancelar pedido", "cambiar contraseña", "reembolso") y dirigir la conversación hacia el flujo adecuado. Su contexto de 128K tokens permite mantener el historial de la conversación completa.
- Enrutamiento de consultas en centros de soporte: en un sistema de ticketing, el modelo puede etiquetar automáticamente cada consulta entrante con su intención y prioridad, reduciendo el tiempo de respuesta humano.
- Asistentes virtuales en aplicaciones móviles: al integrarse con un marco de agentes, el modelo puede detectar la intención y ejecutar acciones específicas (como programar una cita o consultar saldo) mediante function calling.
- Análisis de conversaciones en tiempo real: el modelo puede procesar transcripciones de chats o llamadas para extraer intenciones y generar métricas de satisfacción del cliente.
- Automatización de flujos de trabajo en CRM: clasificar correos electrónicos o mensajes de clientes en categorías predefinidas (quejas, preguntas frecuentes, solicitudes de información) para automatizar su gestión.
- Evaluación de sistemas de diálogo: dado que CLINC150 es un benchmark estándar, el modelo puede utilizarse como referencia para medir la calidad de otros clasificadores de intenciones en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no ha incluido métricas de precisión, recall o F1 en la model card, ni comparaciones con otros modelos. Tampoco se ha documentado el rendimiento en términos de latencia o throughput. Los datos de rendimiento del modelo base Phi-4-mini (que supera a modelos de tamaño similar en tareas de matemáticas y codificación) no son directamente aplicables al adaptador, ya que la tarea de clasificación de intenciones es específica.

## Requisitos de hardware

- VRAM estimada: el modelo base Phi-4-mini-instruct ocupa aproximadamente 7.6 GB en FP16. Con cuantización 4-bit (típica en QLoRA), se reduce a unos 2.5-3 GB. El adaptador LoRA añade menos de 0.1 GB adicionales.
- GPU recomendadas: una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3050 o superior) es suficiente para inferencia con cuantización 4-bit. Para FP16 completa, se recomienda una GPU con 8 GB o más, como RTX 4060 o RTX 4070.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo de gama media (GTX 1060 6GB en cuantización 4-bit, RTX 3060 12GB para FP16).
- Opciones de despliegue: el adaptador se carga con la librería `peft` y `transformers`. Se puede servir con vLLM, TGI o llama.cpp (si se convierte el modelo completo a GGUF), o mediante Ollama (el modelo base Phi-4-mini ya está disponible en Ollama, aunque el adaptador requeriría integración manual).
- Latencia y throughput: no disponibles. La latencia dependerá del hardware, del tamaño de la secuencia y del formato de cuantización. En una GPU de gama media, se esperan decenas de tokens por segundo para generación, y milisegundos para clasificación de una sola frase.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar el adaptador con otros modelos de clasificación de intenciones. La tabla siguiente compara el modelo base (Phi-4-mini) con alternativas de tamaño similar, pero no incluye el adaptador específico.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-4-mini-instruct (base) | 3.8B | 128K | MIT | Hugging Face |
| Qwen2.5-3B | 3.1B | 32K | Apache 2.0 | Hugging Face |
| Gemma-2-2B | 2.6B | 8K | Gemma license | Hugging Face |
| Llama-3.2-3B | 3.2B | 128K | Llama license | Hugging Face |

Para clasificación de intenciones, se suelen usar modelos más pequeños como BERT o DistilBERT fine-tuned sobre CLINC150, pero no son comparables en arquitectura ni en enfoque (encoder-only vs decoder-only).

## Limitaciones y advertencias

- El adaptador es solo un conjunto de pesos LoRA; no es un modelo autónomo. Requiere cargar el modelo base `microsoft/Phi-4-mini-instruct` para funcionar.
- La model card no proporciona información sobre el proceso de entrenamiento, los datos de validación, la precisión alcanzada ni los sesgos potenciales. No se puede garantizar su rendimiento en producción.
- La licencia del adaptador no está declarada. El modelo base tiene licencia MIT, pero el uso del adaptador puede estar sujeto a la licencia del dataset CLINC150 (que es de uso académico y comercial, pero conviene verificar).
- El dataset CLINC150 está en inglés; el adaptador puede no funcionar bien en otros idiomas, aunque el modelo base sea multilingüe.
- Riesgo de alucinación: al ser un modelo generativo, si se usa para generar respuestas (en lugar de solo clasificar), puede producir texto incorrecto o inventado.
- No se han documentado sesgos específicos, pero el modelo base puede heredar sesgos de los datos de entrenamiento originales de Phi-4-mini.
- No se recomienda su uso en aplicaciones críticas sin una validación exhaustiva, dado que no se ha publicado ninguna métrica de rendimiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/loctran5105/phi4-mini-clinc150-qlora
- Modelo base (Phi-4-mini-instruct): https://huggingface.co/microsoft/Phi-4-mini-instruct
- Paper de Phi-4-Mini y Phi-4-Multimodal: https://arxiv.org/pdf/2503.01743v1
- Página oficial de modelos Phi en Azure: https://azure.microsoft.com/en-us/products/phi/
- Perfil del autor (loctran5105): https://huggingface.co/loctran5105
- Modelo Phi-4-mini en Ollama: https://ollama.com/library/phi4-mini
