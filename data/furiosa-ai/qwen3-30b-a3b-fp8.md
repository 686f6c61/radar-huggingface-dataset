# furiosa-ai/Qwen3-30B-A3B-FP8

## Resumen

Qwen3-30B-A3B-FP8 es una distribución del modelo Qwen3-30B-A3B, un transformer autorregresivo de Mixture-of-Experts (MoE) con 30.532 millones de parámetros totales, de los cuales aproximadamente 3.300 millones se activan por token. Esta versión concreta, publicada por FuriosaAI, incluye un Furiosa Executable Bundle (FXB) que permite ejecutar el modelo en el hardware de inferencia FuriosaAI RNGD mediante el framework Furiosa-LLM. El modelo es híbrido: soporta modos de razonamiento (thinking) y no razonamiento (non-thinking), conmutables por petición, y ofrece capacidades de tool calling, seguimiento de instrucciones y cobertura multilingüe.

La relevancia de esta ficha radica en que se trata de una implementación optimizada para un acelerador específico, con pesos cuantizados a FP8 estática y activaciones FP8 dinámicas, lo que reduce el uso de memoria y acelera la inferencia en comparación con la versión original en precisión completa. El modelo base es Qwen/Qwen3-30B-A3B-FP8, publicado bajo licencia Apache 2.0, y esta variante de FuriosaAI mantiene la misma licencia, lo que permite su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (Mixture-of-Experts) transformer autorregresivo |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | ~3,3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos FP8 estáticos, activaciones FP8 dinámicas (por token y por bloque), KV cache en 16 bits |
| Idiomas soportados | Multilingüe (sin lista detallada en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos) y FXB (bundle ejecutable para Furiosa-LLM) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-MoE, un transformer autorregresivo con capas de mezcla de expertos. De los 30,5B parámetros totales, solo unos 3,3B se activan por token, lo que reduce el coste computacional por petición. Es un modelo híbrido de razonamiento: puede operar en modo thinking (genera una cadena de pensamiento antes de la respuesta final) o en modo non-thinking, conmutable por petición mediante el parámetro `enable_thinking`. La cuantización FP8 es estática para los pesos (siguiendo la versión upstream de Qwen) y dinámica para las activaciones en tiempo de ejecución; la caché KV se mantiene en precisión de 16 bits.

No se dispone de información detallada sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El modelo base es la versión cuantizada publicada por Qwen, y esta distribución de FuriosaAI añade el bundle FXB para su ejecución en hardware RNGD, sin modificar los pesos originales.

## Capacidades

- Generación de texto y respuesta a instrucciones complejas con razonamiento explícito (modo thinking) o directo (modo non-thinking).
- Razonamiento híbrido: la cadena de pensamiento se devuelve en un campo separado (`reasoning`) en la respuesta, tanto en streaming como en no streaming.
- Tool calling (function calling) mediante el parser `hermes`, el mismo utilizado por la serie Qwen3, activable con `--enable-auto-tool-choice`.
- Cobertura multilingüe, aunque no se especifican los idiomas concretos en la documentación.
- API compatible con OpenAI (endpoint `/v1/chat/completions`), lo que facilita la integración con clientes existentes.
- Conmutación por petición entre modos de razonamiento y no razonamiento, tanto a nivel de servidor (por defecto) como por solicitud individual.

## Casos de uso

- Asistentes conversacionales con razonamiento explícito: el modo thinking permite que el modelo muestre su cadena de pensamiento, útil para depurar respuestas o para aplicaciones que requieren transparencia en el razonamiento.
- Agentes autónomos con tool calling: gracias al soporte de function calling con el parser `hermes`, el modelo puede decidir cuándo invocar herramientas externas, integrándose en pipelines de automatización.
- Atención al cliente multilingüe: su cobertura multilingüe y su capacidad de seguir instrucciones lo hacen adecuado para sistemas de soporte que atienden a usuarios en varios idiomas.
- Procesamiento de documentos y extracción de información: el razonamiento de múltiples pasos permite resumir, clasificar o extraer datos de textos largos, aunque la longitud de contexto no está documentada en esta versión.
- Generación de contenido estructurado: puede producir respuestas con formato (listas, tablas, JSON) siguiendo instrucciones detalladas, útil para informes o documentación técnica.
- Integración en plataformas de IA generativa: al exponer una API compatible con OpenAI, puede sustituir a otros modelos en aplicaciones existentes sin cambios en el código cliente, siempre que el hardware RNGD esté disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de FuriosaAI no incluye métricas de rendimiento (como MMLU, HumanEval o GSM8K) para esta variante específica, ni comparativas con otros modelos. Se recomienda consultar la documentación oficial de Qwen para los resultados del modelo base, aunque no se han reproducido aquí por no estar incluidos en la información proporcionada.

## Requisitos de hardware

- Hardware específico: requiere tarjetas FuriosaAI RNGD. La configuración recomendada es de 4 tarjetas RNGD, con un tamaño de tensor-parallel de 32 PEs (8 PEs por tarjeta).
- No es compatible con GPUs de consumo (como RTX 4090) ni con GPUs de centro de datos estándar (A100, H100) para ejecutar el bundle FXB; el modelo base sin el bundle sí puede ejecutarse en otros frameworks como vLLM, SGLang o Transformers, según indica la documentación.
- Memoria: el repositorio pesa 38,0 GB, por lo que se necesita al menos esa capacidad de almacenamiento y memoria suficiente en las tarjetas RNGD para alojar los pesos FP8 y la caché KV en 16 bits.
- Despliegue: se sirve mediante Furiosa-LLM, que expone una API OpenAI-compatible. El servidor se lanza con `furiosa-llm serve furiosa-ai/Qwen3-30B-A3B-FP8` y opciones adicionales para razonamiento y tool calling.
- Latencia y throughput: no se proporcionan datos numéricos en la documentación disponible.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a la versión original sin cuantizar, ya que no se dispone de datos de rendimiento para otras alternativas.

| Modelo | Parámetros totales | Parámetros activos | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-30B-A3B-FP8 | 30,5B | ~3,3B | FP8 estática | Apache 2.0 | FuriosaAI RNGD |
| Qwen/Qwen3-30B-A3B-FP8 | 30,5B | ~3,3B | FP8 estática | Apache 2.0 | GPUs estándar (vLLM, SGLang, Transformers) |
| Qwen/Qwen3-30B-A3B (sin cuantizar) | 30,5B | ~3,3B | BF16/FP16 | Apache 2.0 | GPUs estándar |

La diferencia principal entre la versión de FuriosaAI y el modelo base es el bundle FXB, que permite la ejecución en hardware RNGD con Furiosa-LLM. El modelo base sin cuantizar requiere más memoria y ofrece mayor precisión, pero no está optimizado para el acelerador de FuriosaAI. No se dispone de datos de contexto ni de rendimiento para completar la comparativa.

## Limitaciones y advertencias

- Hardware propietario: el bundle FXB solo funciona en tarjetas FuriosaAI RNGD; no es portable a GPUs de otros fabricantes. Para usar el modelo en hardware estándar, debe emplearse el modelo base de Qwen.
- Cuantización FP8: la reducción de precisión puede afectar ligeramente a la calidad de las respuestas en tareas que requieren alta exactitud numérica, aunque no se han documentado casos concretos.
- Longitud de contexto no especificada: la documentación no indica el tamaño máximo de la ventana de contexto, lo que limita la planificación de aplicaciones que requieren procesar documentos largos.
- Sin datos de sesgos o alucinación: no se han publicado evaluaciones de sesgos, riesgos de alucinación o comportamientos no deseados para esta variante.
- Dependencia de Furiosa-LLM: el despliegue requiere instalar y configurar el framework Furiosa-LLM, lo que añade una capa de complejidad operativa.
- El modo thinking puede aumentar la latencia por petición, ya que el modelo genera una cadena de pensamiento antes de la respuesta final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-30B-A3B-FP8
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de modelos Qwen3-MoE en FuriosaAI: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3-moe.html
- Guía de tool calling en Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
