# Novasaki/Qwen3.5-4B-GrugSpeech-Native

## Resumen
Qwen3.5-4B-GrugSpeech-Native es un adaptador LoRA/PEFT publicado por Novasaki sobre el modelo base Qwen/Qwen3.5-4B. Su objetivo es que el modelo razone internamente en "Grug Speech", un estilo de cadena de pensamiento telegráfico y de alta densidad inspirado, según el autor, en el razonamiento interno de GPT-5.6. En lugar de generar miles de tokens conversacionales dentro de `<think>`, el adaptador produce bloques de pensamiento muy comprimidos, con una ratio declarada de 3x a 5x, manteniendo supuestamente la precisión matemática, la sintaxis de código y los parámetros de tool calling.

El modelo base Qwen3.5-4B es un transformer causal denso de aproximadamente 4.000 millones de parámetros, con una longitud de contexto nativa de 262.144 tokens y, según fuentes externas, un vision encoder y una arquitectura híbrida de atención lineal Gated DeltaNet combinada con atención completa. El adaptador se distribuye como pesos safetensors de tipo PEFT/LoRA, con licencia Apache 2.0, y está orientado a generación de texto, razonamiento agéntico, uso de herramientas y código.

Su relevancia actual radica en la optimización de tokens de razonamiento: en escenarios de agentes y tool calling, reducir el coste de inferencia sin perder precisión es un problema práctico. Sin embargo, al tratarse de un adaptador con 0 descargas y 0 likes en el momento de la consulta, no existe validación comunitaria independiente ni benchmarks estándar publicados.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre Qwen3.5-4B. El modelo base es un transformer causal denso con vision encoder y atención híbrida (Gated DeltaNet + full attention) según fuentes externas. |
| Parámetros totales | Base Qwen3.5-4B: ~4.000 millones. Adaptador LoRA: no disponible (repo de 0,1 GB). |
| Parámetros activos | No aplica; el modelo base es denso, no MoE. |
| Longitud de contexto | 262.144 tokens en Qwen3.5-4B; no especificada de forma independiente para el adaptador. |
| Tipos de cuantización | No disponible en la model card. El ejemplo de carga del autor usa `load_in_8bit`. Una guía externa del base menciona ejecución en ~2,5-3 GB a Q4. |
| Idiomas soportados | No disponible. |
| Licencia | Apache 2.0. |
| Formato de pesos | safetensors; adaptador PEFT/LoRA. Requiere cargar el modelo base Qwen/Qwen3.5-4B. |

## Arquitectura y entrenamiento
El adaptador se entrena mediante LoRA/PEFT sobre Qwen3.5-4B, un modelo base denso de 32 capas con un layout híbrido que repite ocho bloques de tres capas de atención lineal Gated DeltaNet seguidas de una capa de atención completa con compuerta, según la información externa recopilada. El modelo base incorpora además un vision encoder y fusión temprana texto-visión, aunque el adaptador se publica con pipeline `text-generation` y no documenta evaluación multimodal propia.

El entrenamiento se realizó sobre un corpus jerárquico multi-campo orientado al razonamiento, organizado en cinco áreas: lenguaje y lingüística, código e ingeniería de software, uso de herramientas y bucles de agentes autónomos, roleplay y personas, y matemáticas, ciencia y lógica formal. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, las proporciones por campo ni si hubo RLHF, DPO u otro método de alineación. Las métricas declaradas son `eval_loss: 0.8851`, `eval_mean_token_accuracy: 0.7879` y una ratio de compresión de tokens de 3,0x a 5,0x. La innovación principal es el razonamiento interno nativo en Grug Speech, con salida dentro de etiquetas `<think>`.

## Capacidades
- Generación de texto y razonamiento interno en formato Grug Speech, con bloques `<think>` ultracompactos.
- Compresión declarada de tokens de razonamiento de 3x a 5x, manteniendo supuestamente precisión matemática, sintaxis de código y parámetros de tool calling.
- Código: triaje de bugs, análisis de causa raíz a partir de tracebacks, complejidad algorítmica, refactoring de arquitectura, optimización de planes de consulta SQL e índices, y concurrencia de API con idempotencia.
- Tool calling / function calling: síntesis de JSON estricto, intención previa a la herramienta, manejo de fallos 404/500 y reintentos, descomposición multi-paso y handoffs a subagentes.
- Agentes autónomos: bucles multi-step, recuperación de errores y seguridad en terminal CLI/Bash.
- Roleplay y personas: arquitecto senior "Grug-brained" centrado en simplicidad, incident commander para triaje P0, mentor técnico directo y revisor de código defensivo.
- Matemáticas, ciencia y lógica: aritmética multi-paso, modelado financiero, mecánica causal física, satisfacción de restricciones y lógica deductiva.
- Multilingüe: no disponible; la model card no especifica idiomas soportados.
- Visión: no documentada para el adaptador. El base Qwen3.5-4B se describe con vision encoder en fuentes externas, pero el adaptador no incluye evaluación multimodal en la información disponible.
- Modo thinking nativo en Grug Speech, con salida final separada del bloque de razonamiento interno.

## Casos de uso
- Depuración de código en producción: el modelo puede recibir un traceback, generar un `<think>` con causa raíz y proponer una corrección segura, por ejemplo comprobar `len(tokens) >= 2` antes de acceder a `tokens[1]`. Es adecuado para integración en pipelines de CI/CD o asistentes de desarrollo local.
- Agentes de tool calling sobre bases de datos: a partir de una petición en lenguaje natural, genera parámetros JSON y consultas SQL válidas, como una agregación con `SUM`, `GROUP BY` y `LIMIT` sobre PostgreSQL.
- Automatización de operaciones CLI/Bash: puede razonar sobre comandos peligrosos, reintentos e idempotencia, y producir acciones de terminal con validación previa.
- Revisión de arquitectura y detección de sobreingeniería: la persona "Grug-brained Senior Architect" permite evaluar si una solución como un CronJob de Kubernetes con sidecars OpenTelemetry es desproporcionada para un script de cinco líneas.
- Soporte técnico interno y atención al cliente especializada: puede resumir información densa, eliminar jerga corporativa y mantener conversaciones multiturno. La ventana de contexto heredada de 262.144 tokens facilita adjuntar documentación extensa.
- Modelado financiero y cálculo de costes: puede desglosar consumos energéticos, costes por kWh y facturación mensual con operaciones multi-paso, como el ejemplo de 3.600 W durante 30 días a 0,15 $/kWh.
- Mentoría técnica y formación: genera explicaciones sin jerga, analogías directas y pasos de aprendizaje para desarrolladores junior.
- Agentes multi-paso con subagentes: puede descomponer tareas complejas, asignar subtareas y gestionar handoffs, siempre que se validen externamente las salidas y los parámetros de herramientas.

## Benchmarks y rendimiento
| Métrica | Valor | Fuente |
|---|---|---|
| eval_loss | 0,8851 | model card |
| eval_mean_token_accuracy | 0,7879 | model card |
| token_compression_ratio | 3,0x - 5,0x | model card |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Las métricas anteriores son internas del autor y no permiten comparación directa con otros modelos.

## Requisitos de hardware
- VRAM estimada para el modelo base de 4B: aproximadamente 8 GB en FP16/BF16, 4-5 GB en 8 bits y 2,5-3 GB en 4 bits. Son estimaciones orientativas a partir del tamaño del base y no están confirmadas por el autor para este adaptador.
- El adaptador LoRA añade una sobrecarga pequeña respecto al modelo base; el repo ocupa 0,1 GB.
- GPU consumer: cabe en tarjetas con 6-8 GB o más en cuantización 4 bits, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o RTX 4090. Para 8 bits o FP16 se recomiendan 12-16 GB o más.
- GPU profesional: A100 40/80 GB, H100 o L40S para despliegues con lote alto y mayor throughput.
- CPU: es posible ejecutar el modelo base en Q4 con runners como llama.cpp u Ollama, pero la carga de este adaptador PEFT requeriría fusión o conversión no documentada en la model card.
- Opciones de despliegue: Transformers + PEFT, BitsAndBytes para cuantización, vLLM con soporte de adaptadores LoRA y TGI. La compatibilidad directa con llama.cpp u Ollama para este adaptador no está documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Novasaki/Qwen3.5-4B-GrugSpeech-Native | Base 4B + adaptador LoRA | 262.144 heredado | No documentada en el adaptador | Apache 2.0 | HuggingFace, repo de 0,1 GB, 0 descargas | Razonamiento en Grug Speech, compresión 3x-5x, eval_loss 0,8851 |
| Qwen/Qwen3.5-4B | 4B denso | 262.144 | Sí, vision encoder | Apache 2.0 | HuggingFace | Modelo base multimodal con atención híbrida Gated DeltaNet + full attention |
| Qwen3-4B | 4B | No disponible | No mencionada | No disponible | Qualcomm AI Hub | Modelo multilingüe anterior orientado a lenguaje, generación, código y matemáticas |

## Limitaciones y advertencias
- Es un adaptador LoRA, no un modelo completo: requiere descargar y cargar Qwen/Qwen3.5-4B para funcionar.
- No hay benchmarks estándar publicados; las únicas métricas son internas y no permiten verificar la precisión real en matemáticas, código o tool calling.
- La afirmación de mantener el 100% de precisión matemática, sintaxis de código y parámetros de tool calling es del autor y no está validada de forma independiente.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en SQL, cálculos financieros, hechos y llamadas a herramientas.
- El razonamiento en Grug Speech puede ser críptico y dificultar la auditoría, el depurado y la explicación de decisiones a usuarios finales.
- No se especifican idiomas soportados; no hay garantía de rendimiento multilingüe para el adaptador.
- No hay información sobre sesgos, toxicidad, seguridad o comportamiento en dominios sensibles.
- La ventana de contexto de 262.144 tokens pertenece al modelo base; no se confirma que el adaptador mantenga un rendimiento estable en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue debe cumplir también la licencia del modelo base Qwen3.5-4B.
- El tag "gpt-5.6" es una referencia estilística del autor; no implica que el modelo use pesos, datos o tecnología de GPT-5.6.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces
- [Novasaki/Qwen3.5-4B-GrugSpeech-Native en HuggingFace](https://huggingface.co/Novasaki/Qwen3.5-4B-GrugSpeech-Native)
- [Qwen/Qwen3.5-4B en HuggingFace](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Qwen3-4B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_4b)
- [Guía de Qwen 3.5 4B en The AI Bench](https://theaibench.ai/models/qwen-3-5-4b/)
- [Qwen3.5 4B en LM Studio](https://lmstudio.ai/models/qwen/qwen3.5-4b)
- [Qwen3.5 4B en Modal](https://modal.com/library/qwen/qwen3-5-4b)
