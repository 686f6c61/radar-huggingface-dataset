# Madras1/Qwen3.8-27B-Abliterated-Uncensored

## Resumen

Madras1/Qwen3.8-27B-Abliterated-Uncensored es una modificacion del modelo Qwen/Qwen3.8-27B de Alibaba, realizada por el usuario Madras1. El objetivo es eliminar el mecanismo de rechazo (refusal) que los modelos de lenguaje modernos muestran ante prompts considerados sensibles o inapropiados. Para ello se aplica una tecnica de Representation Engineering denominada "abliteracion profunda", que interviene directamente en los pesos de la red mediante ortogonalizacion dual, sin necesidad de realizar un fine-tuning convencional.

El modelo resultante conserva las capacidades del base en generacion de texto, pero responde sin sermones morales ni disclaimers preachy, lo que lo hace adecuado para escritura creativa sin restricciones, roleplay con personajes complejos y estudios de interpretabilidad. La arquitectura es un transformer denso de 26.895.998.464 parametros (aproximadamente 26.9B) con 64 capas. La longitud de contexto no se especifica en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) con mecanismo SwiGLU |
| Parametros totales | 26.895.998.464 (26.9B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se proporcionan; pesos en bfloat16 |
| Idiomas soportados | Portugues e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 64 capas con atencion estandar y proyecciones feed-forward con activacion SwiGLU. La modificacion no altera la arquitectura, sino que aplica una intervencion sobre los pesos preentrenados. El proceso de abliteracion captura vectores de activacion en las 64 capas, comparando respuestas a instrucciones inofensivas con respuestas a estimulos sensibles o tabu. La divergencia maxima se localiza en la capa 53, que corresponde al bloque de procesamiento semantico profundo.

La intervencion consiste en una ortogonalizacion dual con factor alfa = 1.35. Por un lado, se neutralizan las senales de rechazo emitidas hacia el flujo residual a traves de las proyecciones de salida (o_proj y down_proj). Por otro, se bloquea la entrada de activaciones de rechazo en el mecanismo de compuerta SwiGLU (gate_proj). No se han publicado datos sobre el numero de tokens utilizados ni la composicion del dataset de entrenamiento, ya que se trata de una modificacion post-entrenamiento sin fine-tuning supervisado.

## Capacidades

- Generacion de texto en portugues e ingles, con prosa literaria y tono narrativo.
- Escritura creativa sin restricciones: literatura erotica, thrillers oscuros, romance intenso y escenas de ficcion adulta.
- Roleplay inmersivo con personajes moralmente ambiguos, villanos o complejos, manteniendo la coherencia de personaje.
- Investigacion academica en interpretabilidad: permite estudiar la direccion de refusal, el steering latente y las dinamicas de activacion en modelos de lenguaje.
- Red-teaming y pruebas de seguridad: util para evaluar como un modelo puede ser inducido a generar contenido prohibido y para mejorar sistemas de defensa.
- Capacidades de vision, tool calling o agentes: no documentadas en la ficha del modelo abliterado. El modelo base Qwen3.8-27B es multimodal, pero esta version solo presenta soporte de texto.

## Casos de uso

- Escritura de novelas y relatos erotico-romanticos: el modelo genera escenas sensuales y descripciones viscerales sin rechazar el prompt, manteniendo un estilo literario cuidado.
- Roleplay inmersivo en juegos de rol por texto: permite interpretar personajes oscuros o moralmente grises que se mantienen en personaje durante conversaciones largas, gracias a la ausencia de filtros morales.
- Investigacion en interpretabilidad de modelos: se puede comparar el comportamiento del modelo abliterado con el base para analizar como la intervencion de pesos afecta a las activaciones internas y a la direccion de refusal.
- Evaluacion de robustez de sistemas de seguridad: sirve como herramienta de red-teaming para comprobar hasta que punto los mecanismos de rechazo pueden ser eliminados o mitigados en modelos de lenguaje.
- Generacion de ficcion adulta en portugues: autores brasileños o portugueses pueden utilizarlo para redactar contenido narrativo explicito sin interrupciones por politicas de seguridad.
- Asistencia en escritura creativa para juegos de rol y narrativa interactiva: aplicaciones que necesiten un generador de texto sin censura para crear dialogos o descripciones intensas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas comparativas. El autor no proporciona evaluaciones cuantitativas del rendimiento del modelo tras la abliteracion.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 53.8 GB, correspondientes al peso de los parametros (26.9B x 2 bytes). Esto supera la capacidad de una GPU consumer de 24 GB.
- Con cuantizacion a 8 bits: estimacion orientativa de 27 GB de VRAM. Con cuantizacion a 4 bits: estimacion orientativa de 14 GB. No se proporcionan cuantizaciones oficiales en el repositorio.
- GPU recomendadas para bfloat16: NVIDIA A100 80GB, H100 80GB o equivalentes con memoria suficiente.
- Para consumer GPU como RTX 4090 (24 GB), seria necesario cuantizar el modelo a 4 bits o utilizar paralelismo entre varias GPU.
- Opciones de despliegue: el codigo de ejemplo incluye Transformers con `device_map="auto"`. Es compatible con vLLM, llama.cpp (si se convierte a GGUF) y Ollama, aunque no se documenta oficialmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Madras1/Qwen3.8-27B-Abliterated-Uncensored | 26.9B | No disponible | pt, en | Apache 2.0 | Abliterado con dual-projection |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | No disponible | No disponible | No disponible | No disponible | Abliterado del mismo base |
| Qwen/Qwen3.8-27B | 26.9B | No disponible | No disponible | Apache 2.0 | Modelo base sin abliterar |

La comparativa se limita a los datos disponibles. El modelo base Qwen3.8-27B es la referencia sin modificar, mientras que las dos versiones abliteradas comparten el mismo origen. No se dispone de especificaciones completas para el modelo de huihui-ai.

## Limitaciones y advertencias

- El modelo puede generar contenido explicito, ofensivo o ilegal sin filtros. El autor advierte que el usuario asume toda la responsabilidad sobre los resultados, en cumplimiento de la normativa local.
- No se han publicado evaluaciones de sesgos ni de alucinaciones. El riesgo de generar informacion falsa o sesgada es similar al del modelo base, pero no esta medido.
- Solo se documentan los idiomas portugues e ingles. No se garantiza un rendimiento adecuado en otros idiomas.
- La longitud de contexto no esta especificada, por lo que el comportamiento en conversaciones muy largas es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar regulaciones de contenido en algunas jurisdicciones.
- No existen benchmarks publicos que validen la calidad del modelo tras la intervencion. La abliteracion puede degradar de forma no medida otras capacidades del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Madras1/Qwen3.8-27B-Abliterated-Uncensored
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo similar huihui-ai/Huihui-Qwen3.8-27B-abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Papers, blogs o demos adicionales: no disponible.
