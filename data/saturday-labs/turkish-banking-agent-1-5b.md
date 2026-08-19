# saturday-labs/turkish-banking-agent-1.5b

## Resumen

El modelo `saturday-labs/turkish-banking-agent-1.5b` es un ajuste fino mediante LoRA del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por Saturday Labs, especializado en escenarios de banca en turco con soporte de *function calling* (llamada a herramientas). Convierte peticiones en lenguaje natural turco en llamadas a herramientas estructuradas, gestiona la confirmación de operaciones destructivas y resume los resultados de las herramientas en respuestas en turco. Está pensado para su integración en asistentes conversacionales de entidades financieras que operan en Turquía.

Con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) y una ventana de contexto de 4096 tokens, el modelo es compacto y adecuado para despliegues con recursos limitados. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia actual radica en la escasez de modelos específicos para *function calling* en turco, especialmente en el dominio bancario, donde la precisión en la extracción de argumentos y la validación de acciones son críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basado en Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No especificado en la información disponible; compatible con cuantizaciones estándar de Transformers (por ejemplo, bitsandbytes) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only con atención causal. Sobre esta base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) y posteriormente se fusionaron los adaptadores con el modelo base. El entrenamiento se realizó con una ventana de contexto de 4096 tokens, específicamente orientado a tareas de *function calling* en turco bancario. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, pero la evaluación reportada sugiere un conjunto de datos con plantillas de herramientas y conversaciones bancarias, separadas por familias de plantillas para medir la generalización. No se menciona el uso de RLHF o DPO; el ajuste es supervisado.

## Capacidades

- Generación de texto en turco con estilo conversacional bancario.
- *Function calling*: traduce peticiones naturales a llamadas de herramienta con nombre, argumentos y valores correctos.
- Soporte de múltiples llamadas a herramientas en una sola respuesta (por ejemplo, consultar saldo y tipo de cambio simultáneamente).
- Gestión de argumentos obligatorios ausentes: pregunta al usuario en lugar de inventar valores.
- Solicitud de confirmación antes de ejecutar operaciones destructivas (transferencias, cierre de cuentas, bloqueo de tarjetas).
- Respuesta directa a preguntas informativas que no requieren herramientas (por ejemplo, diferencias entre EFT y transferencia).
- Rechazo de peticiones fuera del dominio bancario (clima, poesía, recetas).
- Conversión de resultados de herramientas en respuestas legibles en turco.

## Casos de uso

- Asistentes de banca digital: el modelo puede gestionar consultas de saldo, movimientos recientes, límites de tarjeta y extractos, reduciendo la carga en agentes humanos.
- Automatización de transferencias y pagos: dado un conjunto de herramientas de pago, el modelo extrae beneficiario, importe y cuenta, y solicita confirmación antes de ejecutar la operación.
- Atención al cliente multicanal: integrable en chatbots web o móviles para responder preguntas frecuentes sobre productos bancarios (tarjetas, créditos, BES) sin necesidad de herramientas.
- Verificación de identidad y gestión de tarjetas: el modelo puede manejar peticiones de bloqueo o cierre de tarjetas, pidiendo confirmación explícita y validando los identificadores proporcionados.
- Consultas de tipo de cambio y operaciones en divisas: combina llamadas a herramientas de saldo y tipo de cambio para ofrecer respuestas completas.
- Prototipado rápido de agentes conversacionales para bancos turcos: su tamaño reducido permite iterar con recursos modestos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 598 ejemplos de un conjunto de prueba retenido, donde las herramientas no aparecían en el entrenamiento (medición de generalización):

| Metrica | Valor |
|---|---|
| Precision en decision de llamada a herramienta | 96,3 % |
| Precision exacta del nombre de la herramienta | 87,9 % |
| F1 de claves de argumentos | 88,7 % |
| Precision del valor de argumentos | 84,2 % |
| Precision de llamada completa | 83,0 % |
| Validez JSON | 97,0 % |
| Tasa de llamadas incorrectas | 0,9 % |
| Tasa de llamadas omitidas | 10,9 % |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,5B parámetros en precisión bfloat16, el modelo ocupa aproximadamente 3 GB de memoria. Con cuantización de 8 bits (bitsandbytes) puede reducirse a unos 1,5-2 GB; con 4 bits, alrededor de 1 GB. Estos valores son estimaciones estándar para modelos de este tamaño, no datos oficiales del autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bfloat16 (por ejemplo, NVIDIA GTX 1650, RTX 3050). Para mayor velocidad, se recomienda RTX 3060 o superior.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo comunes (RTX 3060, RTX 4070, etc.) incluso con cuantización.
- Opciones de despliegue: compatible con el ecosistema Hugging Face Transformers, incluyendo `text-generation-inference` (TGI) y `endpoints_compatible`. También puede desplegarse con vLLM, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 1,5B, se puede esperar una latencia de decenas de milisegundos por token en GPUs modernas, pero depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| saturday-labs/turkish-banking-agent-1.5b | 1,5B | 4096 | Apache-2.0 | Function calling bancario en turco |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5B | 32768 | Apache-2.0 | Instrucciones generales multilingue |
| Otros modelos de function calling en turco | No disponible | No disponible | No disponible | No disponible |

No se dispone de benchmarks comparativos con modelos alternativos en la información proporcionada. El modelo base Qwen2.5-1.5B-Instruct tiene una ventana de contexto mayor (32K), pero carece del ajuste específico para banca turca.

## Limitaciones y advertencias

- El modelo puede cometer errores de formato al transferir importes, números de cuenta o fechas desde los resultados de las herramientas a sus respuestas. En producción, los valores críticos deben leerse directamente de la salida de la herramienta, no del texto generado por el modelo.
- Puede generar ocasionalmente nombres de herramientas que no están en la lista definida. Se recomienda validar las llamadas contra la lista de herramientas antes de ejecutarlas, o usar *constrained decoding* para evitarlo.
- En peticiones que requieren muchas herramientas, el modelo puede omitir alguna. Para escenarios multi-paso, se sugiere dividir la tarea o verificar la cobertura.
- El modelo está entrenado específicamente para turco bancario; su rendimiento en otros idiomas o dominios no está garantizado.
- No se ha evaluado su comportamiento ante entradas maliciosas o adversariales; en un entorno bancario real, se debe implementar una capa de seguridad adicional.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se publica con fines de investigación y prototipado; el autor recomienda validar exhaustivamente antes de producción.
- No se proporcionan datos sobre sesgos potenciales o riesgos de alucinación más allá de los mencionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saturday-labs/turkish-banking-agent-1.5b
- Perfil de Saturday Labs en Hugging Face: https://huggingface.co/saturday-labs/models
