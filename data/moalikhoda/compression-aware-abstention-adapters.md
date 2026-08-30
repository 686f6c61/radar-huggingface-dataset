# moalikhoda/compression-aware-abstention-adapters

## Resumen

El repositorio `moalikhoda/compression-aware-abstention-adapters` contiene un conjunto de adaptadores LoRA diseñados para mitigar un problema específico en la inferencia de modelos de lenguaje con compresión de caché de claves y valores (KV-cache). Cuando un compresor de KV-cache evita tokens del contexto para reducir memoria, puede eliminar la evidencia que una consulta necesita para responder; el modelo, al ver un contexto aparentemente fluido pero incompleto, tiende a fabricar respuestas. Estos adaptadores enseñan al modelo a abstenerse y emitir un rechazo explícito cuando la evidencia ha sido descartada, en lugar de alucinar.

Desarrollados por Mohammadali Khodabandehlou y Bhaskar Krishnamachari, los adaptadores se presentan en el artículo *"Compression-Aware Abstention: Teaching LLMs to Refuse When KV-Compression Masks Remove Answer Evidence"* (GroundLM @ EMNLP 2026). Se basan en los modelos Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct, con adaptadores de rango 16 aplicados únicamente a las proyecciones de atención (q, k, v, o), lo que supone 10,1 millones de parámetros entrenables (0,13 % del modelo base). La licencia es MIT y el repositorio incluye varios adaptadores según el compresor utilizado durante el entrenamiento. El repositorio tiene pocas descargas (0) y un único "like", lo que indica que es una contribución reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 16) sobre Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct, aplicados a q_proj, k_proj, v_proj y o_proj |
| Parametros totales | 10,1 millones de parametros entrenables (0,13 % del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada; depende del modelo base (Qwen2.5-7B-Instruct soporta 128k tokens, Llama-3.1-8B-Instruct 128k) |
| Tipos de cuantizacion | No especificados; el codigo de uso emplea bfloat16 para el modelo base |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT LoRA) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rango 16 que se insertan exclusivamente en las cuatro proyecciones de atención del modelo base. El entrenamiento se realiza sobre el formato de prompt `Context: {surviving_context}\n\nQuestion: {question}\n\nAnswer:`, donde `surviving_context` son los tokens que el compresor mantiene, decodificados de vuelta a texto. El objetivo es que el modelo responda cuando la evidencia sobrevive a la compresión y emita un rechazo (la frase fija *"I cannot determine the answer to this question from the available context."*) cuando la evidencia ha sido eliminada.

Se entrenan múltiples variantes según el compresor usado durante el entrenamiento: solo KVzip, KVzip + ExpAttn + SnapKV (mezcla), y una variante con pérdida tras la evicción real del caché (cc). El conjunto de datos es MuSiQue de preguntas de dos saltos (2-hop QA). El artículo reporta una concordancia de Cohen's kappa de 0,61 entre la decisión de rechazo del adaptador y un veredicto de un LLM juez, lo que indica que la calibración es imperfecta. No se menciona el uso de RLHF ni DPO; el entrenamiento parece ser supervisado con una función de pérdida de abstinencia.

## Capacidades

- Generación de texto con abstinencia condicionada: el modelo responde si la evidencia necesaria está presente en el contexto comprimido, y se niega a responder si ha sido eliminada.
- Emisión de un rechazo explícito y consistente: la frase de rechazo está fijada en el entrenamiento.
- Compatibilidad con múltiples compresores de KV-cache: los adaptadores cubren KVzip, ExpAttn y SnapKV, y hay una variante específica para decodificación con caché comprimido (cc).
- Soporte de tareas de QA multi-hop (MuSiQue) y evaluación en RULER multi-key NIAH (aunque no se detallan resultados).
- Ligereza: al ser adaptadores LoRA, se pueden cargar y descargar dinámicamente sobre el modelo base sin necesidad de reentrenar.

## Casos de uso

- Sistemas de respuestas a preguntas con contexto largo y compresión de caché: en despliegues donde se utiliza KVzip u otro compresor para reducir la huella de memoria, el adaptador evita que el modelo invente respuestas cuando la evidencia se ha perdido. Es adecuado porque la abstinencia se activa automáticamente según la supervivencia de los tokens relevantes.
- Chatbots de atención al cliente con memoria comprimida: si el historial de conversación se comprime para ahorrar memoria, el adaptador garantiza que el asistente reconozca cuándo no tiene suficiente información para responder, evitando dar datos incorrectos.
- Agentes autónomos con razonamiento multi-paso: en pipelines donde el agente consulta documentos comprimidos, el adaptador puede señalar la falta de evidencia en lugar de continuar con suposiciones, mejorando la fiabilidad del razonamiento.
- Herramientas de análisis de documentos legales o médicos: cuando se procesan documentos extensos con compresión para encajar en el contexto, el adaptador ayuda a detectar si un fragmento relevante ha sido descartado, permitiendo al usuario solicitar el documento original.
- Evaluación de la calidad de la compresión: los adaptadores pueden usarse como una métrica indirecta para medir si un compresor de KV-cache preserva la información esencial para una consulta determinada.
- Investigación en robustez de modelos bajo compresión: el conjunto de adaptadores y el código de reproducción permiten estudiar el comportamiento de los LLM cuando la evidencia es parcialmente eliminada, útil para desarrollar mejores compresores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El artículo reporta datos específicos del escenario de compresión:

- Bajo decodificación con caché comprimido (KVzipPress) a una retención de r=0,80, el adaptador `mix-cc` responde correctamente 22 de 69 ejemplos que conservan la evidencia, frente a 1 de 69 para el modelo base sin modificar (Qwen2.5-7B-Instruct).
- La concordancia entre la decisión de abstinencia y un veredicto de un LLM juez es de Cohen's kappa 0,61.

Estos números indican una mejora sustancial en la precisión bajo compresión, pero también que la tarea sigue siendo difícil incluso con el adaptador.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la documentación. Dado que los adaptadores se cargan sobre un modelo base de 7B-8B, se puede estimar que:
  - Para Qwen2.5-7B-Instruct en bfloat16, se necesitan aproximadamente 14-16 GB de VRAM (modelo + adaptadores).
  - Con cuantización de 4 bits (por ejemplo, bitsandbytes), el modelo base ocupa ~4-6 GB, por lo que cabría en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 3060 12 GB.
  - Para Llama-3.1-8B-Instruct, los requisitos son similares.
- El código de uso emplea `transformers` y `peft`, por lo que es compatible con bibliotecas como vLLM o TGI si se cargan los adaptadores como PEFT, aunque no se menciona explícitamente.
- No se indican latencias ni throughput; al ser un adaptador LoRA, la sobrecarga de inferencia es mínima (solo añade las proyecciones LoRA en atención).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de abstinencia bajo compresión de KV-cache. El propio artículo compara el comportamiento del adaptador con el modelo base sin modificar (Qwen2.5-7B-Instruct) en el escenario de compresión, pero no se ofrecen datos de otros adaptadores o modelos de la misma categoría. Por tanto, la comparativa con alternativas no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en MuSiQue de 2-hop QA; el comportamiento en otras familias de tareas solo se ha probado en RULER multi-key NIAH (sección 5.7) y no está garantizado.
- La decisión de abstinencia se calibra a la supervivencia de los spans de respuesta, que es un sustituto de la suficiencia contextual, no la verdad de fondo. La concordancia con un juez LLM es de kappa 0,61, lo que implica errores tanto en rechazos innecesarios como en respuestas incorrectas.
- Bajo compresión real a alta retención (r=0,80), la tarea sigue siendo difícil: el adaptador `mix-cc` solo responde correctamente 22/69 ejemplos con evidencia retenida, aunque es una mejora drástica frente al 1/69 del modelo base.
- El formato de prompt debe respetarse exactamente (`Context: ... Question: ... Answer:`) para que el adaptador funcione como se espera; variaciones en el formato pueden degradar el comportamiento.
- Aunque la licencia es MIT, el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0) y Llama-3.1-8B-Instruct tiene una licencia de uso comunitario de Meta; se deben respetar las condiciones del modelo base para uso comercial.
- El repositorio tiene cero descargas y un único like; se trata de una contribución académica reciente sin validación amplia por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/moalikhoda/compression-aware-abstention-adapters
- Repositorio GitHub con código, evaluaciones y script de reproducción: https://github.com/mali-kh/compression-aware-abstention
- Artículo (referencia bibtex en la model card): Khodabandehlou, M., & Krishnamachari, B. (2026). Compression-Aware Abstention: Teaching LLMs to Refuse When KV-Compression Masks Remove Answer Evidence. Proceedings of the Workshop on Grounding and Reliability of Language Models (GroundLM) at EMNLP.
