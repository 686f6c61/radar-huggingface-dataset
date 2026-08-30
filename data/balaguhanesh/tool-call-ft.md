# Balaguhanesh/tool-call-ft

## Resumen

`Balaguhanesh/tool-call-ft` es un adaptador LoRA (entrenado con QLoRA) que se superpone al modelo base `Qwen/Qwen2.5-3B-Instruct` para mejorar su capacidad de emitir llamadas a funciones (function calling) en un formato JSON estricto y coherente con el esquema proporcionado. El adaptador ha sido desarrollado por Balaguhanesh, un ingeniero de 2care.ai en Bangalore, y se distribuye bajo licencia Apache-2.0.

El problema que resuelve es la baja fiabilidad de los modelos pequeños a la hora de generar tool calls con la sintaxis exacta que esperan los sistemas de agentes. El modelo base, sin ajuste, produce en torno a un 51,7% de salidas JSON válidas y solo un 1% de nombres de función correctos en un conjunto de evaluación de 300 ejemplos; tras el ajuste fino, el adaptador alcanza un 100% de validez JSON y de precisión en el nombre de la función, y un 95% de coincidencia exacta de argumentos.

Es relevante porque demuestra que un ajuste fino ligero (0,96% de parámetros entrenables, ~30M) sobre un modelo de 3B puede convertir un modelo generalista en un componente fiable para pipelines de tool calling, con un coste de entrenamiento de apenas 21 minutos en una GPU T4. El adaptador está pensado para integrarse en aplicaciones de generación de texto con acceso a funciones externas, y su tamaño reducido (0,1 GB) lo hace fácil de distribuir y cargar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA (QLoRA) |
| Parametros totales | 3,09B (modelo base Qwen2.5-3B-Instruct) + ~30M (adaptador LoRA, 0,96% del total) |
| Parametros activos | Todos (modelo denso) |
| Longitud de contexto | No disponible en la ficha (el modelo base Qwen2.5-3B-Instruct soporta hasta 32K tokens según documentación pública, pero no se especifica en esta ficha) |
| Tipos de cuantizacion | El adaptador se entrenó sobre base cuantizado en 4-bit NF4 (bitsandbytes); para inferencia se puede cargar el base en 4-bit, 8-bit o precisión completa |
| Idiomas soportados | No disponibles (heredados del modelo base, que soporta principalmente inglés y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only con atención causal estándar, entrenado por Alibaba Cloud con un enfoque de instrucción y chat. Sobre este modelo se aplica un adaptador LoRA mediante QLoRA: la base se congela y se cuantiza a 4-bit NF4, y se añaden matrices de bajo rango (r=16, α=32) en todas las proyecciones de atención y MLP. El adaptador añade aproximadamente 30 millones de parámetros entrenables, lo que supone un 0,96% del total.

El entrenamiento se realizó con `trl.SFTTrainer` (supervised fine-tuning) sobre el dataset `glaiveai/glaive-function-calling-v2`, utilizando 2000 ejemplos para entrenamiento y 300 para evaluación. Se empleó una sola GPU T4 de Kaggle, en fp16, durante 1 época, con una pérdida final de entrenamiento de aproximadamente 0,13 y un tiempo total de unos 21 minutos. El objetivo no es mejorar el razonamiento general, sino enseñar al modelo a emitir llamadas a funciones en el formato compacto `{"name": ..., "arguments": {...}}`, respetando el esquema JSON y la disciplina de nombres.

## Capacidades

- Generación de llamadas a funciones (tool calling) en formato JSON estricto, con nombres de función exactos y argumentos que coinciden con el esquema proporcionado.
- Cumplimiento del formato de chat de Qwen2.5-Instruct, incluyendo la plantilla de mensajes y el prompt de sistema para describir las funciones disponibles.
- Generación de texto estándar heredada del modelo base (razonamiento, conversación, código básico), aunque el ajuste se centra exclusivamente en la tarea de tool calling.
- No soporta vision, audio ni otros modos multimodales; es un modelo puramente textual.
- No incluye capacidades de agente multi-paso más allá de la emisión de una llamada a función; el razonamiento multi-step debe ser orquestado externamente.

## Casos de uso

- Asistentes conversacionales con acceso a APIs: el adaptador permite que un asistente de chat interprete peticiones del usuario (p. ej., "¿qué tiempo hace en París?") y genere la llamada `get_weather("París")` con los argumentos correctos, lista para ser ejecutada por un backend.
- Pipelines de automatización empresarial: integración en sistemas de helpdesk o CRM donde se necesite extraer intenciones y parámetros estructurados de mensajes de usuarios para invocar funciones internas (crear ticket, actualizar cliente, etc.).
- Agentes de generación de código: como componente de un agente que decide qué herramienta llamar (p. ej., ejecutar una búsqueda, lanzar una prueba) y produce la llamada en el formato esperado por el orquestador.
- Prototipos de tool calling en entornos con recursos limitados: al ser un adaptador de solo 0,1 GB y basarse en un modelo de 3B, puede desplegarse en GPUs de consumo o incluso en CPU con cuantización, permitiendo experimentar con function calling sin necesidad de modelos grandes.
- Evaluación y comparación de técnicas de ajuste fino: sirve como ejemplo de cómo QLoRA puede mejorar la adherencia a esquemas en modelos pequeños, útil para investigación en eficiencia de adaptación.
- Sistemas de extracción de información estructurada: dado que el modelo aprende a rellenar argumentos exactos, puede usarse para convertir texto libre en JSON con campos concretos (fechas, números, nombres) siempre que se definan las funciones adecuadas.

## Benchmarks y rendimiento

La model card del autor reporta resultados sobre 300 ejemplos retenidos del dataset `glaive-function-calling-v2`, con decodificación greedy y un evaluador estricto de coincidencia exacta (un JSON no parseable falla en todas las métricas; el nombre de función debe coincidir exactamente en mayúsculas/minúsculas; los argumentos deben ser un dict exactamente igual, sin claves extra ni faltantes).

| Metrica | Modelo base (Qwen2.5-3B-Instruct) | Adaptador tool-call-ft | Diferencia |
|---|---|---|---|
| Tasa de JSON válido | 51,7% | 100,0% | +48,3 |
| Precisión del nombre de función | 1,0% | 100,0% | +99,0 |
| Coincidencia de argumentos (exacta) | 0,3% | 95,0% | +94,7 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K para este adaptador, ya que su propósito es específico de tool calling y no de razonamiento general.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB y puede cargarse sobre el modelo base Qwen2.5-3B-Instruct. El modelo base en precisión fp16 requiere aproximadamente 6 GB de VRAM; en 4-bit (bitsandbytes) baja a unos 2,5-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantización 4-bit (p. ej., RTX 3050, RTX 4060, T4). Para fp16 se recomienda al menos 8 GB (p. ej., RTX 3070, RTX 4080, A10).
- Es desplegable en GPU de consumo (serie RTX 30/40) y también en entornos cloud como T4 o L4.
- Opciones de despliegue: se puede usar directamente con `transformers` y `peft` (cargando el adaptador con `PeftModel.from_pretrained`). También es compatible con vLLM si se fusiona el adaptador con el modelo base, aunque la integración nativa de LoRA en vLLM está disponible para ciertos modelos; no se ha verificado en este caso. No se recomienda llama.cpp para adaptadores LoRA a menos que se fusionen previamente.
- Latencia y throughput: no se han medido formalmente. En una T4, la generación de una llamada a función (máx. 128 tokens) suele completarse en menos de un segundo con decodificación greedy, pero depende de la implementación y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Resultado en tool calling |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3,09B | 32K | Apache-2.0 | Modelo instructivo general | 51,7% JSON válido, 1% nombre exacto (en el test del autor) |
| Balaguhanesh/tool-call-ft | 3,09B + 30M | No especificado (base 32K) | Apache-2.0 | Adaptador LoRA para tool calling | 100% JSON válido, 100% nombre exacto, 95% argumentos |
| Qwen2.5-7B-Instruct | 7,6B | 32K | Apache-2.0 | Modelo instructivo general con mejor razonamiento | No se ha comparado directamente; probablemente mejor que el base de 3B, pero no se dispone de datos |
| Llama-3.1-8B-Instruct | 8,03B | 128K | Llama 3.1 Community License | Soporte nativo de tool calling | No se ha comparado directamente; su rendimiento en tool calling es bueno, pero requiere más VRAM |

La comparativa directa no está disponible en la información proporcionada. El adaptador se presenta como una mejora significativa sobre su modelo base, pero no hay comparaciones con otros adaptadores similares ni con modelos de mayor tamaño.

## Limitaciones y advertencias

- El adaptador se ha entrenado exclusivamente sobre el dataset `glaive-function-calling-v2` (2000 ejemplos). Su capacidad de generalización a esquemas de funciones muy diferentes o a dominios no representados en el dataset puede ser limitada.
- El evaluador es estricto: la coincidencia de argumentos exige igualdad exacta de dict, por lo que el 5% restante de errores puede deberse a diferencias de tipo (p. ej., `"5"` en lugar de `5`) o a claves extra/faltantes. En producción, puede ser necesario normalizar los tipos de datos.
- El ajuste fino no mejora el razonamiento general; el modelo sigue siendo un Qwen2.5-3B-Instruct con las mismas limitaciones de conocimiento y sesgos que el modelo base.
- No se han documentado sesgos específicos del adaptador, pero el dataset de entrenamiento puede contener sesgos implícitos de los ejemplos de funciones utilizados.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base Qwen2.5-3B-Instruct también está bajo Apache-2.0, por lo que no hay conflicto de licencias.
- El modelo no soporta nativamente llamadas a herramientas en el sentido de OpenAI; requiere que el prompt de sistema incluya el esquema de funciones y que el orquestador externo procese la salida JSON.
- No se ha probado en entornos de producción de alto rendimiento; para despliegues con mucha concurrencia se recomienda fusionar el adaptador con el base y servir con vLLM o TGI, tras verificar la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Balaguhanesh/tool-call-ft
- Repositorio de código y evaluación: https://github.com/balaguhanesh/tool-call-ft
- Perfil de Hugging Face del autor: https://huggingface.co/Balaguhanesh
- Perfil de GitHub del autor: https://github.com/balaguhanesh
- Dataset de entrenamiento: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
