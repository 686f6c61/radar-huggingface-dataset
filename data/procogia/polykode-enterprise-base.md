# ProCogia/PolyKode-Enterprise-Base

## Resumen

PolyKode Enterprise Base es una republicación byte-idéntica de los pesos de Moonshot AI Kimi-K2.7-Code, realizada por ProCogia como base para su familia de productos comerciales de traducción de código. El modelo es una mezcla de expertos (MoE) de aproximadamente 1,03 billones de parámetros totales (1.026.879.376.368), orientado a tareas de agentes de programación y a la ingeniería de software de largo alcance. Su longitud de contexto es larga, aunque el valor exacto no se especifica en la información disponible. La relevancia de esta publicación radica en servir como sustrato sobre el que ProCogia construye los adaptadores de PolyKode Enterprise, que incorporan certificación de paridad de ejecución, audit trails y acuerdos de nivel de servicio para entornos regulados; esta release, sin embargo, no incluye ese fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
| --- | --- |
| Arquitectura | Kimi K2 (mezcla de expertos, orientado a agentes de código) |
| Parámetros totales | 1.026.879.376.368 (aproximadamente 1,03 billones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (contexto largo según el fabricante) |
| Tipos de cuantización | no especificado |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT modificada (con condición de atribución en interfaz de usuario a muy alta escala) |
| Formato de pesos | safetensors (compressed-tensors, 64 shards, ~595 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformador de mezcla de expertos (MoE) orientado a agentes de programación. No se ha proporcionado en la información disponible el desglose de parámetros activos, la composición del dataset de entrenamiento ni detalles sobre procesos de alineación como RLHF o DPO; el autor remite a la ficha original de Moonshot AI para la descripción técnica completa. Como innovación destacable, el fabricante afirma una mejora en la eficiencia de tokens respecto a Kimi K2.6, con aproximadamente un 30 % menos de tokens de razonamiento en tareas comparables, lo que resulta relevante para despliegues regulados donde el coste y la latencia deben ser predecibles.

## Capacidades

- Generación de texto y razonamiento orientados a tareas de ingeniería de software de largo alcance y flujos de trabajo de agentes de código.
- Traducción de código (SAS, R, Python) como caso de uso declarado, aunque en esta release no se incluyen los adaptadores de PolyKode que implementan esa traducción con garantías de paridad.
- Capacidades multilingües en inglés y chino.
- Base apta para fine-tuning adicional en dominios propios gracias a la licencia MIT modificada.
- No se dispone de información sobre soporte de tool calling, function calling, modos de razonamiento especiales, visión o audio.

## Casos de uso

- Evaluación de modelos base de codificación: permite comparar el rendimiento de Kimi K2.7 Code frente a otras arquitecturas en tareas de agente antes de comprometerse con una solución comercial.
- Prototipado de integraciones: los desarrolladores pueden montar su propio pipeline de traducción de código sobre estos pesos usando vLLM o SGLang para validar la viabilidad del enfoque.
- Baselines en investigación de traducción SAS/R/Python: los investigadores pueden utilizar estos pesos como punto de partida para estudiar técnicas de paridad de ejecución y desarrollo de adaptadores.
- Fine-tuning específico para dominios propios: gracias a la licencia MIT modificada, se puede adaptar el modelo a un stack tecnológico concreto mediante entrenamiento adicional.
- Benchmarks internos de agentes de código: se puede medir el rendimiento en tareas de largo horizonte (refactorización, generación de pruebas, revisión de código) y comparar con otros modelos MoE de escala similar.
- Despliegue autoservicio en entornos de investigación o preproducción: se puede ejecutar con transformers en infraestructura propia o con vLLM/SGLang, siempre que se disponga de capacidad de hardware suficiente.
- Formación de agentes de código para tareas internas: el modelo puede integrarse en herramientas de asistencia al desarrollador que operen en inglés o chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única afirmación cuantitativa del fabricante es una reducción del 30 % en el uso de tokens de razonamiento frente a Kimi K2.6 en tareas comparables, pero no se aportan tablas de resultados (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Los pesos en safetensors ocupan aproximadamente 595 GB. La VRAM total necesaria para la inferencia no se especifica; al tratarse de un MoE, dependería del número de parámetros activos, que no se ha indicado.
- GPU recomendadas: no se especifican. Por la escala de ~1 billón de parámetros y el tamaño en disco, se requerirían configuraciones con múltiples NVIDIA A100 80 GB o H100 80 GB en modo tensor parallelism.
- No cabe en una GPU de consumo (por ejemplo, RTX 4090).
- Opciones de despliegue: transformers (con trust_remote_code=True y device_map="auto"), vLLM o SGLang. El fabricante recomienda vLLM o SGLang con configuraciones de tensor parallelism y expert parallelism.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Peso en disco | Observaciones |
| --- | --- | --- | --- | --- | --- |
| Moonshot AI Kimi K2.7 Code (upstream) | no disponible | no disponible | MIT modificada | no disponible | Modelo original; ProCogia republica pesos idénticos |
| ProCogia PolyKode Enterprise-Base (esta release) | 1.026.879.376.368 | no disponible (contexto largo) | MIT modificada | ~595 GB | Checkpoint base sin fine-tuning de PolyKode |
| ProCogia PolyKode Community | 32.000 millones (Qwen3-32B) | no disponible | Apache 2.0 | no disponible | Modelo denso, sin orientación a paridad de ejecución |
| ProCogia PolyKode Enterprise | no disponible | no disponible | EULA de ProCogia | no disponible | Incluye adaptadores, arnés de paridad, certificación SAS y audit trails |

## Limitaciones y advertencias

- Sesgos conocidos: no se han proporcionado datos sobre sesgos en la información disponible.
- Riesgo de alucinación: no se ha evaluado específicamente; se aplican las advertencias habituales para modelos de lenguaje.
- Limitaciones de contexto o idioma: el modelo está entrenado para inglés y chino; no se ha indicado soporte para otros idiomas. El contexto es largo, pero el límite exacto no se ha publicado.
- Restricciones de licencia: la licencia MIT modificada permite uso y redistribución comercial, pero impone una condición de atribución en la interfaz de usuario a muy alta escala (100 millones de usuarios activos mensuales o 20 millones de dólares de ingresos mensuales). Conviene revisar el texto completo de la licencia antes de usar el modelo en producción.
- Para producción: esta release es solo el checkpoint base. No incluye los adaptadores de PolyKode, el arnés de paridad de ejecución, los audit trails ni la certificación SAS 9.4/Viya. No debe usarse para traducción de SAS a R/Python en entornos regulados ni como sustituto de la validación licenciada del runtime de SAS.

## Enlaces

- HuggingFace: https://huggingface.co/ProCogia/PolyKode-Enterprise-Base
- Modelo original (Moonshot AI): https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Licencia: https://huggingface.co/ProCogia/PolyKode-Enterprise-Base/blob/main/LICENSE
- Sitio web de ProCogia: https://procogia.com
- PolyKode Enterprise: https://huggingface.co/ProCogia/PolyKode-Enterprise
- PolyKode Community: https://huggingface.co/ProCogia/PolyKode-Community
