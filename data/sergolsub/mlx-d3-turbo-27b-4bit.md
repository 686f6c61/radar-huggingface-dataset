# sergolsub/mlx-d3-turbo-27B-4bit

## Resumen

`mlx-d3-turbo-27B-4bit` es una conversión a 4 bits en formato MLX del modelo `vllm-sr/d3-turbo`, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo de chat generativo al uso: la model card describe una interfaz `decide()` orientada a la toma de decisiones estructuradas sobre texto de entrada, con tipos de salida específicos (`noul`, `choice`, `score`, `box`), lo que sugiere un modelo con cabeceras de decisión especializadas en lugar de generación libre de tokens.

El nombre del repositorio indica 27B parámetros, aunque la model card no confirma el dato de forma explícita ni detalla la arquitectura interna. La conversión parte de una cuantización previa a 8 bits del mismo autor, que se de-cuantiza y re-cuantiza a 4 bits afines con el mismo tamaño de grupo, sin reentrenamiento ni cambios arquitectónicos.

La relevancia práctica es acotada: se publicó el 22 de noviembre de 2026, no acumula descargas ni likes, y su utilidad se limita a entornos macOS con chip M-series donde se quiera evaluar un pipeline de decisión local. La licencia Apache 2.0 heredada del modelo original facilita el uso comercial, pero la ausencia de benchmarks publicados frente a alternativas y de documentación sobre el entrenamiento limita seriamente su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `vllm-sr/d3-turbo`; la model card no especifica transformer, MoE ni híbrida) |
| Parametros totales | 27B (según el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (MLX), derivada de una conversión previa a 8 bits; mismo tamaño de grupo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo original; prevalece el LICENSE del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `*_mlx.py`, `decision_config.json`, `joint_config.json` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base `vllm-sr/d3-turbo`. Los artefactos publicados (`decision_config.json`, `joint_config.json`, módulo `d3_mlx.py`) apuntan a un modelo con cabeceras de decisión y posiblemente una cabeza conjunta, pero no se detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Lo único verificable sobre el proceso es la conversión: los pesos originales se cuantizaron primero a 8 bits en MLX y después se re-cuantizaron a 4 bits afines manteniendo el tamaño de grupo, sin reentrenamiento ni modificaciones de arquitectura. La model card indica que la evaluación se realizó contra el modelo original, pero no publica la metodología completa ni los resultados del modelo de referencia para comparar la pérdida de calidad introducida por la cuantización a 4 bits.

## Capacidades

- Toma de decisiones estructuradas sobre texto: la API `decide(texto, especificación)` devuelve una salida por cada campo definido en la especificación.
- Salidas de tipo `noul`: respuesta booleana o de intención (por ejemplo, "¿el cliente quiere un reembolso?").
- Salidas de tipo `choice`: clasificación entre categorías definidas con criterios y descripciones (por ejemplo, asignación a equipos de soporte).
- Salidas de tipo `score`: puntuación ordinal sobre una lista de criterios (por ejemplo, severidad de un incidente).
- Salidas de tipo `box`: localización de objetos en texto descriptivo (detección referida en lenguaje natural, como localizar una señal de stop en una escena descrita).
- Procesamiento de varias tareas por llamada independiente: cada pregunta se pasa como objeto separado, lo que permite encadenar decisiones heterogéneas.
- No se documenta soporte de tool calling, function calling genérico, agentes multi-paso, modo thinking, visión real ni audio.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.

## Casos de uso

- Triaje de tickets de soporte: usar `decide()` con salidas de tipo `choice` para enrutar incidencias entre equipos (facturación, envíos, técnico) a partir del texto del cliente; encaja porque el modelo está diseñado específicamente para clasificación con criterios explícitos.
- Detección de intención de reembolso: consultas de tipo `noul` sobre el mensaje del cliente para decidir si solicita devolución; útil en flujos de atención al cliente donde se necesita una señal binaria fiable antes de escalar a un humano.
- Priorización de incidencias: salidas de tipo `score` con criterios ordinales (cosmético, molesto, bloqueante) para ordenar la cola de un equipo de operaciones; el modelo devuelve una etiqueta directamente consumible por un sistema de tickets.
- Moderación o verificación de contenido descrito: uso de salidas `box` para localizar entidades u objetos mencionados en descripciones textuales, útil en pipelines de anotación asistida o revisión de catálogos.
- Automatización de decisiones en local para privacidad: al ejecutarse con MLX en Apple Silicon, permite procesar texto sensible (mensajes de clientes, descripciones internas) sin enviar datos a la nube, lo que encaja en entornos con requisitos de confidencialidad.
- Prototipado de asistentes de decisión en macOS: desarrolladores que quieran validar un pipeline de decisión estructurada antes de desplegarlo en servidores pueden usar esta conversión 4 bits en un Mac mini M4 Pro, con carga en 7,54 s y 15,79 GB de memoria pico según la model card.
- Evaluación comparativa de cuantización: útil para medir la degradación de precisión al pasar de 8 a 4 bits en tareas de decisión, ya que la model card reporta métricas propias (accuracy 84,4 %, noul 85,0 %, choice 84,0 %, score 84,0 %, PPL de calibración 2,075).

## Benchmarks y rendimiento

La model card solo publica métricas internas de la evaluación propia del autor sobre la conversión 4 bits, sin comparación con otros modelos ni con el modelo original en la misma tabla:

| Metrica | Valor (MLX 4-bit) |
|---|---|
| Accuracy | 84,4 % |
| noul | 85,0 % |
| choice | 84,0 % |
| score | 84,0 % |
| Perplejidad de calibración | 2,075 |
| Latencia mediana de decisión | 2119 ms |
| Decisiones cortas sostenidas | 0,72 por segundo |
| Tamaño en disco | 14,87 GB |
| Tiempo de carga | 7,54 s |
| Memoria residente pico | 15,79 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 15,79 GB de memoria residente pico medida en un Mac mini M4 Pro de 48 GB; en disco ocupa 14,87 GB.
- Hardware de referencia: Apple Silicon (Mac mini M4 Pro con 48 GB). No se documenta soporte para GPU NVIDIA ni CUDA.
- Cabe en equipos consumer Apple con al menos 24-32 GB de memoria unificada, aunque no se han publicado mediciones en configuraciones inferiores a 48 GB.
- Despliegue: exclusivamente mediante `mlx_lm` y el cargador `d3_mlx.py` incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 2119 ms por decisión y 0,72 decisiones cortas por segundo en el hardware de referencia; no hay datos para otros equipos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión estructurada o conversiones MLX 4 bits de modelos de 27B), ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, el contexto máximo ni los idiomas, lo que impide evaluar su idoneidad para casos distintos a los ejemplos mostrados.
- No hay benchmarks estándar publicados; las métricas reportadas son internas del autor y no permiten comparación objetiva con otros modelos.
- La interfaz no es de generación libre: solo expone `decide()` con tipos de salida predefinidos, lo que limita su uso a tareas de clasificación, puntuación y localización descritas.
- La cuantización a 4 bits introduce pérdida de precisión respecto al modelo original; la model card no publica la comparación directa con los pesos de referencia.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero prevalece el LICENSE del repositorio upstream `vllm-sr/d3-turbo` en caso de conflicto; conviene revisarlo antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en producción ni mantenimiento activo.
- Dependencia de Apple Silicon y `mlx_lm`: no es portable a entornos CUDA sin reconversión.
- La fecha de creación (noviembre de 2026) y la ausencia de pipeline declarado en Hugging Face dificultan verificar el origen y la calidad del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-d3-turbo-27B-4bit
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
