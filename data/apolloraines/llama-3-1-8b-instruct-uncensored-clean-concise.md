# ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Clean-Concise

## Resumen

Llama-3.1-8B-Instruct-Uncensored-Clean-Concise es una variante del modelo Llama 3.1 8B Instruct de Meta, modificada mediante la herramienta propietaria jBlaze, que aplica técnicas de *representation engineering* (también conocidas como *abliteration*) directamente sobre los pesos del modelo, sin realizar ningún tipo de fine-tuning o entrenamiento adicional. El objetivo es eliminar los guardrails de rechazo, reducir la verbosidad excesiva y suprimir la toxicidad, manteniendo un lenguaje limpio y respuestas directas.

El modelo conserva la arquitectura original de Llama 3.1 8B Instruct (32 capas, 8.03 mil millones de parámetros) y se distribuye en precisión bf16. Está pensado para desarrolladores e investigadores que necesitan un modelo conversacional sin restricciones de contenido, con respuestas concisas y sin rodeos, aunque con la advertencia de que presenta una tendencia a la aquiescencia (*sycophantic agreement*) según la propia model card.

Al estar basado en Llama 3.1, hereda las capacidades generales del modelo original: generación de texto, razonamiento, código, matemáticas y soporte multilingüe (aunque la ficha solo declara inglés). Su relevancia radica en ofrecer una alternativa "sin censura" para casos de uso donde los modelos alineados estándar rechazan peticiones legítimas o generan respuestas excesivamente largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (32 capas, transformer decoder) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada (el modelo base Llama 3.1 8B Instruct soporta 128K tokens) |
| Tipos de cuantizacion | no disponible (solo se distribuye en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de meta-llama/Llama-3.1-8B-Instruct y se somete a una intervención mediante jBlaze, una herramienta de "cirugía de comportamiento" que modifica direcciones específicas en el espacio de representación del modelo. Según la model card, se aplican tres direcciones: *refusal* (supresión), *verbosity* (supresión) y *toxicity* (supresión). No se realizó fine-tuning ni entrenamiento adicional; los cambios se aplican directamente sobre los pesos.

La técnica de *representation engineering* (o *abliteration*) consiste en identificar vectores de dirección en el espacio latente que codifican comportamientos no deseados (como el rechazo) y neutralizarlos. Esto permite eliminar guardrails sin degradar significativamente las capacidades generales del modelo, aunque puede introducir efectos secundarios como la tendencia a la aquiescencia observada en este caso.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de RLHF/DPO, ya que el modelo no fue entrenado desde cero sino modificado a partir de un checkpoint existente.

## Capacidades

- Generación de texto conversacional con respuestas directas y sin rechazos ante peticiones que el modelo base podría bloquear.
- Razonamiento y resolución de problemas matemáticos y lógicos (heredado de Llama 3.1 8B Instruct).
- Generación de código en múltiples lenguajes, incluyendo funciones y explicaciones (ejemplo: función Python para invertir una cadena).
- Soporte de *tool calling* y *function calling* (capacidad nativa de Llama 3.1 Instruct, aunque no se ha verificado específicamente en esta variante).
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Respuestas concisas: la dirección de *verbosity* suprimida reduce la longitud de las respuestas, lo que puede ser útil en aplicaciones donde se requiere brevedad.
- Lenguaje limpio: la supresión de toxicidad busca evitar contenido ofensivo o dañino, aunque no se garantiza en todos los casos.
- Nota: la model card indica *sycophantic_agreement*, es decir, el modelo tiende a estar de acuerdo con el usuario incluso cuando la afirmación es incorrecta (ejemplo: "I think the earth is flat" → respuesta que no corrige tajantemente).

## Casos de uso

- Asistentes conversacionales sin restricciones temáticas: el modelo puede responder a preguntas sobre temas controvertidos o sensibles que los modelos alineados rechazarían, útil en entornos de investigación o simulación de diálogos.
- Generación de contenido creativo: escritura de ficción, guiones o diálogos donde se requiere explorar temas delicados sin filtros automáticos.
- Chatbots de atención al cliente con respuestas breves: la supresión de verbosidad permite generar respuestas directas y concisas, reduciendo la fatiga del usuario en interacciones de soporte.
- Asistente de programación en entornos de desarrollo: puede generar fragmentos de código y explicaciones sin rechazar peticiones que involucren código potencialmente sensible (por ejemplo, scripts de automatización).
- Simulación de escenarios de seguridad: investigadores pueden usar el modelo para probar sistemas de moderación o estudiar comportamientos de modelos sin guardrails.
- Generación de respuestas para sistemas de *prompt engineering*: al ser más conciso, facilita la evaluación rápida de diferentes *prompts* sin ruido verboso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que el modelo es una modificación de Llama 3.1 8B Instruct, se espera un rendimiento similar al base en tareas generales, pero no hay datos confirmados.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el modelo requiere aproximadamente 16 GB de VRAM (8.03B parámetros × 2 bytes). Con cuantización a 4 bits (no disponible oficialmente, pero posible mediante herramientas externas como llama.cpp o GPTQ), se podría reducir a ~4-5 GB.
- GPU recomendadas: para inferencia en bf16, una RTX 3090/4090 (24 GB) o una A10/A100 (24-40 GB) son suficientes. Para despliegue en producción con alta concurrencia, se recomienda A100 o H100.
- En consumer GPU: sí, cabe en GPUs de 16 GB o más (RTX 4080, 4090, etc.) con bf16. Con cuantización externa, podría ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: compatible con Hugging Face Transformers (código de ejemplo incluido), vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión).
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 8B en una GPU moderna, se espera una latencia de ~20-50 ms por token en bf16, dependiendo del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Técnica | Notas |
|---|---|---|---|---|---|
| ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Clean-Concise | 8,03 B | no especificado (base: 128K) | Llama 3.1 | jBlaze (representation engineering) | Sin censura, conciso, tendencia a aquiescencia |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | 8,03 B | 128K | Llama 3.1 | Abliteration (FailSpy) | Sin censura, mantiene verbosidad estándar |
| meta-llama/Llama-3.1-8B-Instruct (original) | 8,03 B | 128K | Llama 3.1 | Fine-tuning con RLHF | Alineado, con guardrails, respuestas verbosas |

La comparativa se basa en datos públicos de los modelos base y las técnicas aplicadas. No se dispone de benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- Sesgo de aquiescencia (*sycophantic_agreement*): el modelo tiende a estar de acuerdo con el usuario, incluso cuando la afirmación es incorrecta, lo que puede propagar desinformación.
- Riesgo de alucinación: al ser un modelo de 8B, puede generar información falsa o inventada, especialmente en temas especializados.
- La supresión de toxicidad no es perfecta: aunque se aplica una dirección para reducir contenido dañino, el modelo puede generar texto ofensivo en ciertos contextos.
- La eliminación de guardrails implica que el modelo puede responder a peticiones peligrosas o ilegales (por ejemplo, cómo fabricar armas). El uso debe ser responsable y bajo la responsabilidad del desarrollador.
- Licencia Llama 3.1: permite uso comercial, pero si el número de usuarios mensuales supera los 700 millones, se requiere una licencia comercial específica de Meta.
- No se han publicado evaluaciones de seguridad ni benchmarks de sesgo; el modelo no ha sido auditado externamente.
- El contexto máximo no está confirmado en esta variante; aunque el base soporta 128K, la modificación podría afectar la ventana de contexto efectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Clean-Concise
- Herramienta jBlaze: https://jblaze.dev
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante abliterated de mlabonne: https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Variante Jbliterated de 128K del mismo autor: https://huggingface.co/ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated
- Documentación de Llama 3.1 en Cloudflare: https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct/
- Repositorio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
