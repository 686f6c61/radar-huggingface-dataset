# SmallAICreator/GRAFT-50B-A3B-GGUF

## Resumen

GRAFT-50B-A3B es un modelo de chat de tipo mixture-of-experts (MoE) desarrollado por UltraLabs (publicado bajo el handle SmallAICreator) como un ajuste fino del modelo Qwen3-Next-80B-A3B-Instruct de Alibaba. El modelo reduce el tamaño del original de aproximadamente 80B a unos 50.664 millones de parámetros totales, manteniendo solo unos 3.200 millones de parámetros activos por token. Esta relación de activación tan baja permite una velocidad de generación propia de un modelo de 3B con un conocimiento parametrizado mucho mayor.

La técnica de compresión empleada, denominada GRAFT por sus autores, reduce el modelo base a menos de dos tercios de su tamaño y posteriormente lo "sana" mediante destilación desde el modelo original de 80B. El resultado se distribuye principalmente en formato GGUF cuantizado Q4_K_M (30,9 GB) y está pensado para su uso con llama.cpp, incluyendo despliegue en hardware de consumo con soporte para descarga de expertos a RAM del sistema.

El modelo se orienta a conversación general, generación de código, matemáticas y tool calling, con plantilla ChatML embebida en el GGUF y licencia Apache 2.0. Su relevancia actual radica en ofrecer un MoE de gran tamaño con contexto largo barato (solo 12 de las 48 capas mantienen caché KV) en un paquete que cabe en una única GPU de 48 GB o en configuraciones mixtas de RAM y VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-Next híbrida: 48 capas (36 Gated DeltaNet + 12 gated attention), MoE con 320 expertos (10 activos por token + 1 experto compartido), hidden size 2048 |
| Parametros totales | 50.664.487.680 (~50,7B) |
| Parametros activos | ~3,2B por token |
| Longitud de contexto | 32K recomendado en el ejemplo de llama-server; soporta hasta 128K según la prueba needle-in-a-haystack |
| Tipos de cuantizacion | Q4_K_M (30,9 GB) publicado; no se detallan otras variantes |
| Idiomas soportados | Inglés (principal); otros idiomas funcionan pero con menor calidad |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo GRAFT-50B-A3B-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura híbrida de Qwen3-Next, que combina 36 capas con Gated DeltaNet (un mecanismo de atención lineal/estado recurrente) y 12 capas con atención con puerta tradicional. El componente MoE contiene 320 expertos, de los cuales se activan 10 por token más un experto compartido, sobre una dimensión oculta de 2048. Esta configuración explica que solo 12 de las 48 capas mantengan caché KV, lo que abarata enormemente el contexto largo: 32K de contexto requieren bastante menos de 1 GB.

El proceso de entrenamiento consistió en aplicar el método propietario GRAFT para reducir el modelo base Qwen3-Next-80B-A3B-Instruct a menos de dos tercios de su tamaño, seguido de una fase de "sanación" mediante destilación desde el modelo original de 80B. Adicionalmente se le enseñó su propia identidad (nombre y autoría) para que no requiera system prompt. No se especifican en la información disponible el número de tokens de destilación, la composición del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML embebida en el GGUF.
- Razonamiento y respuesta a preguntas factuales de conocimiento general (77,4% en MMLU completo).
- Generación de código con pass@1 del 84,1% en HumanEval y 35,1% en LiveCodeBench v6.
- Matemáticas de nivel escolar fuerte (97,2% en GSM8K) y razonamiento matemático competitivo moderado (36,7% en AIME 2025).
- Tool calling / function calling mediante el formato `<tool_call>`, con soporte para el esquema `tools` estilo OpenAI a través de la plantilla Jinja.
- Capacidad de contexto largo verificada hasta 128K tokens (needle-in-a-haystack 15/15).
- Identidad propia sin system prompt: se presenta como GRAFT-50B-A3B de UltraLabs solo cuando se le pregunta.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede gestionar diálogos multi-turno con contexto de hasta 32K tokens (ampliable a 128K) manteniendo un coste de memoria de caché KV muy bajo gracias a sus 12 capas con caché, lo que lo hace adecuado para despliegues en una sola GPU de 48 GB.
- Generación de código en pipelines de desarrollo: con 84,1% en HumanEval y soporte de tool calling, puede integrarse en flujos de autocompletado, revisión o generación de tests invocando herramientas externas mediante `<tool_call>`.
- Atención al cliente automatizada: su plantilla ChatML con soporte de herramientas permite conectar el modelo a APIs de CRM o ticketing, y su capacidad de contexto largo facilita arrastrar historiales extensos de conversación.
- Razonamiento matemático educativo: con 97,2% en GSM8K, es apto para tutores automáticos que resuelvan problemas de aritmética y álgebra elemental paso a paso.
- Procesamiento de documentos largos: la prueba needle-in-a-haystack a 128K y el bajo coste de contexto permiten tareas de extracción de información y resumen sobre documentos extensos.
- Despliegue en hardware de consumo o servidores sin GPU dedicada: con 30,9 GB en Q4_K_M y la opción `--n-cpu-moe` para descargar expertos a RAM, puede ejecutarse en equipos con 32 GB de RAM más una GPU modesta, o en CPU pura a 8,8 tokens/s en un servidor de 24 núcleos.
- Prototipado de agentes con tool calling: la plantilla embebida compatible con el esquema OpenAI permite usarlo como backend en frameworks de agentes sin configuración adicional de prompt.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados sobre el propio archivo Q4_K_M con llama.cpp, decodificación greedy y sin system prompt:

| Benchmark | Configuracion | GRAFT-50B-A3B |
|---|---|---|
| MMLU (test completo) | 14.042 preguntas, zero-shot, letra de respuesta | 77,4% |
| GSM8K | primeras 250 preguntas, paso a paso | 97,2% |
| HumanEval | 164 problemas, pass@1 | 84,1% |
| LiveCodeBench v6 | 131 problemas (feb-abr 2025), pass@1, límite 16K tokens | 35,1% (fácil 28/31, medio 15/39, difícil 3/61) |
| AIME 2025 | 30 problemas (I + II), límite 14K tokens | 36,7% (11/30) |
| GPQA Diamond | 159 de 198 preguntas, zero-shot, límite 8K tokens | 35,2% (56/159) |
| Humanity's Last Exam | 500 preguntas aleatorias de 2.158 (442 terminadas), límite 8K tokens | 3,6% (16/442) |
| Needle in a haystack | passkey de 5 dígitos a 10%/50%/90% de profundidad | 15/15 (3/3 a 8K, 16K, 32K, 64K y 128K) |

Comparación de la fase de sanación sobre un subconjunto fijo de 285 preguntas de MMLU (5 por materia):

| Modelo | MMLU (subconjunto) |
|---|---|
| Qwen3-Next-80B-A3B-Instruct (original) | 85,6% |
| GRAFT-50B-A3B antes de sanación | 76,1% |
| GRAFT-50B-A3B (esta versión) | 78,9% |

El autor advierte que son ejecuciones zero-shot propias y no los setups oficiales de 5-shot, por lo que deben compararse con otros modelos ejecutados de la misma forma. Las áreas más fuertes en MMLU son historia, gobierno y política, psicología, política exterior y marketing (92-98%); las más débiles son química, física y matemáticas de nivel universitario (50-58%).

## Requisitos de hardware

- Memoria: aproximadamente 31 GB para el modelo en Q4_K_M; se recomienda 32 GB de RAM más una GPU, o 48 GB o más de RAM/VRAM.
- GPU: una única GPU de 48 GB puede alojar el modelo completo. No se especifican modelos concretos (A100, H100, RTX 4090), pero por capacidad de VRAM encajaría en A100 80GB, H100 y tarjetas de 48 GB; una RTX 4090 de 24 GB no lo aloja completo y requeriría descargar expertos a RAM.
- Solo CPU: funciona si cabe en RAM; el autor midió 8,8 tokens/s en un servidor de 24 núcleos.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server con `--jinja`), y cualquier aplicación GGUF con soporte de Qwen3-Next. El servidor de llama.cpp expone una API compatible con OpenAI en el puerto 8080.
- Descarga parcial de expertos: el flag `--n-cpu-moe N` permite mantener los expertos de N capas en RAM del sistema, reduciendo el requisito de VRAM.
- Contexto: 32K de contexto requiere bastante menos de 1 GB de caché KV gracias a que solo 12 de las 48 capas mantienen caché.
- Latencia y throughput: no se publican cifras de GPU; solo el dato de 8,8 tokens/s en CPU de 24 núcleos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GRAFT-50B-A3B | ~50,7B | ~3,2B | 32K recomendado, hasta 128K | Apache 2.0 | GGUF Q4_K_M | MMLU 77,4%, GSM8K 97,2%, HumanEval 84,1% |
| Qwen3-Next-80B-A3B-Instruct (base) | ~80B | ~3B | No disponible en la información | No disponible en la información | No disponible en la información | MMLU 85,6% en el subconjunto de 285 preguntas del autor |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables en la información disponible |

## Limitaciones y advertencias

- Ciencia y matemáticas de nivel universitario son sus áreas de conocimiento más débiles (aproximadamente 50-58% en esas materias de MMLU); conviene verificar cálculos importantes.
- En razonamiento muy difícil puede entrar en bucles de pensamiento y agotar los tokens antes de responder (47 de 159 preguntas de GPQA alcanzaron el límite de 8K tokens); se recomienda darle un presupuesto de tokens amplio para problemas complejos.
- Tiende a responder con seguridad; hay que verificar hechos relevantes y ejecutar y probar el código generado.
- Está ajustado en inglés; otros idiomas funcionan pero con menor pulido, lo que limita su uso en producción multilingüe sin evaluación adicional.
- No se documentan sesgos específicos conocidos en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar de Qwen3-Next conviene revisar las condiciones del modelo base.
- Requiere una versión reciente de llama.cpp con soporte de Qwen3-Next; versiones antiguas no cargarán el modelo.
- El rendimiento en GPU no está cuantificado por el autor; solo se dispone de la cifra de CPU (8,8 tokens/s en 24 núcleos).

## Enlaces

- Hugging Face: https://huggingface.co/SmallAICreator/GRAFT-50B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Perfil del autor: https://huggingface.co/SmallAICreator
