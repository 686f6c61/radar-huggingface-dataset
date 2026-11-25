# lm-kit/vllm-d3-lite-lmk

## Resumen

d3-lite (Decision 3.0) es un modelo de decisión de 0,8B parámetros construido sobre Qwen3.5 0.8B y empaquetado por lm-kit para su SDK de IA on-device para .NET (LM-Kit.NET) y para LM-Kit One. No es un modelo generativo al uso: en lugar de escribir texto, recibe un contenido y una batería de preguntas tipadas (elección entre opciones, puntuación en una escala ordenada, sí/no) y devuelve, en un único forward pass, la probabilidad de cada respuesta. La salida es siempre una de las opciones proporcionadas por el usuario, acompañada de un número sobre el que una regla puede actuar.

El modelo pertenece a la familia Decision 3.0 del proyecto vLLM Semantic Router y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que convierte tareas de clasificación y enrutamiento en una interfaz declarativa y determinista: en lugar de prompt engineering con modelos generativos grandes, se plantean preguntas cerradas y se obtiene una distribución de probabilidad directamente consumible por código. Con 1.006.672.704 parámetros totales (según los pesos en safetensors del repo), está pensado para ejecutarse localmente, incluso en hardware modesto.

El paquete incluye cuantización Q8_0 en formato GGUF y un proyector de visión (mmproj) que habilita el procesamiento de imágenes, además de los pesos en BF16 a plena precisión. La integración con LM-Kit expone el modelo a través de una API en C# (`DecisionEngine`, `DecisionRequest`, `DecisionQuestion`) y, en LM-Kit One, mediante el endpoint `POST /v1/systemone` y la herramienta `decide` para agentes y flujos de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5 0.8B); modelo de decisión con cabezal de clasificación probabilística |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y BF16 (publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0 y BF16), archivo .lmk (Q8_0 empaquetado con el proyector de visión), safetensors en el repo base |

## Arquitectura y entrenamiento

d3-lite se construye sobre Qwen3.5 0.8B, un transformer denso de aproximadamente mil millones de parámetros. Sobre esa base, el proyecto vLLM Semantic Router lo convierte en un modelo de decisión ("system-one"): en lugar de generar tokens de forma autoregresiva, el modelo evalúa un contenido junto con preguntas tipadas y produce una distribución de probabilidad sobre las respuestas candidatas en un solo paso hacia delante. Esto reduce la latencia frente a un modelo generativo que tuviera que razonar y redactar la respuesta, y elimina el riesgo de que la salida no se ajuste al formato esperado, ya que la respuesta está restringida al conjunto de opciones definido por el usuario.

El modelo incorpora un proyector de visión que le permite procesar imágenes además de texto y JSON; el empaquetado de LM-Kit incluye este proyector como archivo separado (`mmproj-vllm-d3-lite-Q8_0.gguf`) dentro del archivo `.lmk`. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card remite a la model card original de vllm-sr/d3-lite para los detalles de entrenamiento y la evaluación de los autores.

## Capacidades

- Clasificación zero-shot: asignación de contenido a una de varias categorías definidas en tiempo de inferencia, sin reentrenamiento.
- Preguntas de elección: selección de una opción entre un conjunto con descripciones, devolviendo la opción elegida y su probabilidad.
- Preguntas de escala ordenada: puntuación de un contenido en un nivel ordinal (por ejemplo, urgencia de "puede esperar" a "ahora mismo"), devolviendo el nivel esperado.
- Preguntas de sí/no: devolución de la probabilidad de la respuesta afirmativa, apta para umbrales configurables.
- Procesamiento multimodal: acepta imágenes junto al contenido textual para responder preguntas sobre ellas (por ejemplo, si una foto muestra un paquete dañado).
- Salida estructurada y determinista: cada respuesta es una de las opciones proporcionadas, con un valor numérico consumible por reglas.
- Integración con agentes: disponible como herramienta `decide` en flujos de trabajo de LM-Kit One.
- Soporte de múltiples preguntas en una sola petición (`DecisionRequest` con varias `DecisionQuestion`), devolviendo un resultado por pregunta.
- No soporta generación de texto libre, tool calling general ni razonamiento multi-paso en el sentido de los LLM generativos; su función es la decisión cerrada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y responde a una pregunta de elección con los equipos disponibles (facturación, envíos, técnico), devolviendo la opción y su confianza para asignar automáticamente el ticket al equipo correcto.
- Priorización de incidencias: mediante una pregunta de escala ordenada, se puntúa la urgencia de cada incidencia y se ordena la cola de trabajo según el nivel esperado devuelto por el modelo.
- Moderación y triaje de contenido: preguntas de sí/no (por ejemplo, "¿el mensaje contiene una amenaza?") con umbral de probabilidad configurable permiten filtrar o escalar contenido de forma determinista.
- Verificación de evidencias en reclamaciones: combinación de texto e imagen en una misma petición para responder si una foto adjunta muestra daños, mercancía incorrecta o embalaje deteriorado, integrándose en el flujo de gestión de devoluciones.
- Automatización de formularios y extracción de decisiones: dado un JSON o texto estructurado, el modelo responde a preguntas cerradas sobre su contenido (categoría, nivel, sí/no) y alimenta directamente reglas de negocio sin post-procesado de lenguaje natural.
- Clasificación on-device en aplicaciones .NET: al ejecutarse localmente a través de LM-Kit.NET, permite clasificar y decidir sobre datos sensibles sin enviarlos a la nube, útil en entornos con requisitos de privacidad o sin conectividad.
- Herramienta de decisión en agentes: expuesto como `decide` en LM-Kit One, un agente puede delegar en d3-lite decisiones discretas (a qué herramienta llamar, si requiere intervención humana) antes de ejecutar acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con Q8_0, los pesos de ~1.000 millones de parámetros ocupan aproximadamente 1 GB; sumando el proyector de visión y el contexto de trabajo, se estima un uso de VRAM en torno a 1,5-2,5 GB. En BF16, los pesos ocupan aproximadamente 2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; no requiere A100 ni H100 para uso típico.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU mediante llama.cpp/GGUF.
- Opciones de despliegue: LM-Kit.NET (SDK .NET), LM-Kit One (endpoint `POST /v1/systemone`), llama.cpp y otros runners compatibles con GGUF; el modelo base está asociado a vLLM Semantic Router.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un modelo de decisión de un solo forward pass, la latencia debería ser inferior a la de un modelo generativo del mismo tamaño, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-lite (este modelo) | ~1,0B | no disponible | Modelo de decisión multimodal | Apache 2.0 | Hugging Face, LM-Kit |
| Qwen3.5 0.8B (base) | ~0,8B | no disponible | LLM generativo | no disponible en esta ficha | Hugging Face |
| Modelos de clasificación zero-shot tipo BART-large-MNLI | ~0,4B | ~1.024 tokens | Clasificador NLI | MIT/Apache según variante | Hugging Face |

La comparación directa con LLMs generativos del mismo tamaño no es del todo equivalente: d3-lite no genera texto, sino que devuelve probabilidades sobre opciones predefinidas, lo que lo hace más adecuado para enrutamiento y triaje determinista que para conversación abierta. Frente a clasificadores zero-shot clásicos, añade soporte multimodal y preguntas tipadas (elección, escala, sí/no) en una sola interfaz. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo responde a preguntas cerradas con opciones predefinidas.
- Riesgo de calibración: las probabilidades devueltas pueden no estar perfectamente calibradas; conviene validar los umbrales con datos propios antes de usarlas en producción.
- Sesgos: al derivar de Qwen3.5 0.8B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base; no se documentan evaluaciones de sesgo específicas.
- Idiomas: no se especifican los idiomas soportados; el rendimiento multilingüe no está garantizado ni documentado.
- Contexto: la longitud de contexto no está disponible, lo que limita la planificación para entradas largas.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente; verificar las condiciones del modelo base Qwen3.5.
- Dependencia del ecosistema: el empaquetado principal está orientado a LM-Kit (.NET); el uso fuera de ese SDK requiere los GGUF publicados en ggml-org/vllm-d3-lite-GGUF.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lm-kit/vllm-d3-lite-lmk
- Modelo base original: https://huggingface.co/vllm-sr/d3-lite
- GGUF publicados por ggml-org: https://huggingface.co/ggml-org/vllm-d3-lite-GGUF
- LM-Kit.NET: https://lm-kit.com/products/lm-kit-net/
