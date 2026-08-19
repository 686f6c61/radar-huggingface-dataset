# AMAImedia/Qwen3.5-35B-A3B-Darwin-Opus-NOESIS-AWQ-INT8

## Resumen

El modelo **AMAImedia/Qwen3.5-35B-A3B-Darwin-Opus-NOESIS-AWQ-INT8** es una cuantización personalizada en INT8 (AWQ simétrico) del modelo **FINAL-Bench/Darwin-35B-A3B-Opus**, un MoE de 35B parámetros totales con ~3B activos por forward pass, derivado a su vez de **Qwen/Qwen3.5-35B-A3B**. Lo desarrolla **AMAImedia** como parte de su plataforma NOESIS de automatización de doblaje multilingüe, bajo el framework DHCF-FNO. La cuantización ha sido realizada por el propio equipo de AMAImedia, no con AutoAWQ, sino con un pipeline propio que maneja los expertos fusionados en tensores 3D.

El modelo destaca por su arquitectura híbrida (atención lineal Gated DeltaNet + atención completa), un contexto nativo de 262 144 tokens, soporte para tool calling y razonamiento avanzado (90% en GPQA Diamond en su versión BF16). Esta versión INT8 preserva aproximadamente el 99,5% de la calidad del BF16 según sus autores, con una huella de disco de ~33 GB, lo que la hace adecuada para entornos de producción con restricciones de memoria.

Es relevante porque combina un MoE de alta capacidad con una cuantización eficiente y una licencia Apache 2.0, permitiendo uso comercial sin restricciones. Además, su proceso de creación mediante fusión evolutiva (Darwin V5) introduce una metodología interesante para rescatar expertos muertos en modelos destilados, un problema común en SFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` — Qwen3.5 MoE con Gated DeltaNet (GDN) y atención lineal híbrida |
| Parametros totales | 37 104 724 608 (según safetensors; ~35B declarados) |
| Parametros activos | ~3B por forward pass (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | AWQ-INT8 simétrico personalizado (group_size=128, sin AutoAWQ) |
| Idiomas soportados | 201 (lista parcial: en, zh, ja, ko, de, fr, ru, ar, hi, es, pt, it, nl, pl, tr, vi, th, id, cs, ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (convertido desde Q8_0 GGUF) |

## Arquitectura y entrenamiento

El modelo base **Darwin-35B-A3B-Opus** fue creado mediante **Darwin V5**, un motor de fusión evolutiva guiado por diagnóstico basado en DARE-TIES (implementado con mergekit). El "padre" es Qwen/Qwen3.5-35B-A3B (arquitectura base + RLHF) y la "madre" es Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled (una destilación LoRA SFT). El análisis diagnóstico reveló que la madre tenía entre 50% y 65% de expertos muertos (activación inferior al 5%) debido a un SFT solo con texto. Darwin V5 compensó reduciendo la densidad de la madre y rellenando los slots inactivos con los expertos vivos del padre. La capa 38, identificada como núcleo de razonamiento, utiliza un 90% de pesos de la madre (pico de distancia coseno en sondas).

La arquitectura es un MoE con 40 capas híbridas: 30 capas usan atención lineal Gated DeltaNet y 10 capas (cada cuarta) usan atención completa. Cada capa tiene 256 expertos enrutados más 1 experto compartido, con un hidden size de 2048 y un vocab original de 248 320 tokens. El modelo fue entrenado con un contexto de 262 144 tokens y soporta 201 idiomas.

La cuantización INT8 se realizó sobre el GGUF Q8_0 (no sobre BF16), procesando capa por capa para limitar el pico de RAM a ~22 GB. Las capas lineales (atención, MLP del experto compartido, router) se cuantizan a int8 plano, los expertos MoE a int8 3D, mientras que `lm_head` y `embed_tokens` se mantienen en BF16. Esto permite que el modelo funcione con ~36 GB de RAM + ~5.4 GB de VRAM usando `device_map="auto"`.

## Capacidades

- **Razonamiento avanzado**: alcanza 90.0% en GPQA Diamond en su versión BF16, superando al padre (84.2%) y a la madre (85.0%).
- **Comprensión multilingüe**: soporta 201 idiomas, con un rendimiento de 85.0% en MMMLU sobre 29 lenguas.
- **Tool calling / function calling**: los tags del modelo indican soporte para tool-calling, lo que permite integrarlo en flujos de agentes.
- **Contexto largo**: 262 144 tokens de ventana nativa, adecuado para documentos extensos, conversaciones multi-turno y análisis de código de gran tamaño.
- **Generación de texto y código**: al derivar de Qwen3.5, mantiene capacidades de generación de código y texto general.
- **Modo razonamiento**: el proceso de destilación de la madre (Claude 4.6 Opus) sugiere que el modelo ha sido optimizado para cadenas de razonamiento explícitas, aunque no se documenta un "thinking mode" formal.
- **Compatibilidad con endpoints**: el tag `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia estándar, aunque requiere `trust_remote_code=True`.

## Casos de uso

- **Atención al cliente automatizada multilingüe**: gracias a su contexto de 262k tokens y soporte de 201 idiomas, puede gestionar conversaciones multi-turno con historial extenso en múltiples lenguas, reduciendo la necesidad de sistemas de traducción intermedios.
- **Análisis de documentos legales o técnicos largos**: con 262k tokens de ventana, puede procesar contratos completos, patentes o informes de investigación sin truncamiento, extrayendo cláusulas relevantes o resumiendo secciones específicas.
- **Generación de código asistida en entornos de producción**: el soporte de tool calling permite conectarlo a APIs de compilación, linters o repositorios, facilitando la generación de código con verificación automática.
- **Razonamiento científico y resolución de problemas complejos**: con 90% en GPQA Diamond, es adecuado para tareas de razonamiento en física, química y biología, como apoyo a investigadores en la formulación de hipótesis o la revisión de literatura.
- **Traducción automática de alta calidad**: al estar entrenado en 201 idiomas, puede traducir entre pares de lenguas minoritarias sin necesidad de modelos específicos, manteniendo coherencia en textos largos.
- **Agentes autónomos de investigación**: combinando tool calling, contexto largo y razonamiento multi-step, puede actuar como agente que consulta bases de datos, navega por documentación y sintetiza resultados en informes estructurados.
- **Sistemas de doblaje y subtitulado**: dado su origen en la plataforma NOESIS, es adecuado para generar diálogos sincronizados en múltiples idiomas, aunque no se documentan capacidades de audio (solo texto).

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo original en BF16 (FINAL-Bench/Darwin-35B-A3B-Opus), según la model card. La cuantización INT8 introduce una degradación estimada de ~0.3% en perplexity, sin benchmarks específicos publicados para la versión INT8.

| Benchmark | Darwin-35B-A3B-Opus (BF16) | Father (Qwen3.5-35B-A3B) | Mother (Claude 4.6 Opus Distilled) |
|---|---|---|---|
| GPQA Diamond | 90.0% | 84.2% | 85.0% |
| MMMLU (29 idiomas) | 85.0% | 85.2% | — |

No se han publicado resultados de benchmarks para la versión INT8 en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con `device_map="auto"`, el modelo requiere ~36 GB de RAM y ~5.4 GB de VRAM (para offload parcial). Para carga completa en GPU, se necesitan al menos 33 GB de VRAM (peso del modelo en INT8), por lo que una GPU de 40 GB o más (A100 40GB, A6000, H100 80GB) es recomendable.
- **GPU recomendadas**: A100 40GB o superior para carga completa; RTX 4090 (24 GB) no es suficiente sin offload a RAM, aunque puede funcionar con `device_map="auto"` y RAM abundante.
- **Compatibilidad con consumer GPU**: no cabe en GPUs de 24 GB o menos sin offload; con offload a RAM (≥36 GB) puede ejecutarse en una RTX 4090 con ~5.4 GB de VRAM utilizados.
- **Opciones de despliegue**: requiere `trust_remote_code=True` y la clase personalizada `Darwin35BForCausalLMInt8`. No es compatible con AutoAWQ ni con pipelines estándar de vLLM o TGI sin adaptación. Se puede usar con transformers directamente. Para entornos de producción, se recomienda evaluar la compatibilidad con vLLM mediante la integración de código personalizado.
- **Latencia y throughput**: no se proporcionan datos específicos. Dado que es un MoE con ~3B activos, el throughput debería ser superior al de un modelo denso de 35B, pero la cuantización INT8 y la arquitectura híbrida pueden introducir overhead en la dequantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | GPQA Diamond | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (Father) | ~35B | ~3B | 262k | 84.2% | Apache 2.0 |
| Darwin-35B-A3B-Opus (BF16) | ~35B | ~3B | 262k | 90.0% | Apache 2.0 |
| Claude 4.6 Opus Distilled (Mother) | ~35B | ~3B | 262k | 85.0% | Apache 2.0 (derivado) |
| AMAImedia Qwen3.5-35B-A3B-Darwin-Opus-NOESIS-AWQ-INT8 | 37.1B (safetensors) | ~3B | 262k | ~90% (estimado, no medido) | Apache 2.0 |

La comparativa se limita a los modelos padre y madre, ya que no se dispone de datos de otros MoE de tamaño similar en la información proporcionada. La versión INT8 es la única cuantización oficial publicada por AMAImedia para este modelo.

## Limitaciones y advertencias

- **Requiere `trust_remote_code=True`**: el modelo usa una clase personalizada (`Darwin35BForCausalLMInt8`) que no está integrada en transformers por defecto, lo que puede suponer un riesgo de seguridad si no se audita el código.
- **Formato de cuantización no estándar**: no es compatible con AutoAWQ ni con herramientas que esperen un formato AWQ convencional. Esto limita la interoperabilidad con frameworks como vLLM, TGI u Ollama sin modificaciones.
- **Degradación de calidad**: aunque se estima ~0.3% de aumento en perplexity, no se han publicado benchmarks específicos para la versión INT8, por lo que el rendimiento real en tareas de razonamiento complejo podría variar.
- **Sesgos y alucinaciones**: al derivar de Qwen3.5 y de una destilación de Claude, puede heredar sesgos presentes en los datos de entrenamiento originales. No se documentan evaluaciones de sesgo o toxicidad.
- **Contexto largo**: aunque soporta 262k tokens, el rendimiento en contextos extremadamente largos puede degradarse en la práctica, especialmente con la atención lineal Gated DeltaNet.
- **Idiomas**: aunque declara 201 idiomas, la calidad puede variar significativamente entre lenguas de alta y baja representación en el entrenamiento.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el nombre "NOESIS" y "Darwin" podrían estar sujetos a marcas comerciales de AMAImedia, aunque la licencia del modelo no lo restringe.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AMAImedia/Qwen3.5-35B-A3B-Darwin-Opus-NOESIS-AWQ-INT8)
- [Modelo base: FINAL-Bench/Darwin-35B-A3B-Opus](https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus)
- [Modelo padre: Qwen/Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B) (no verificado en la información proporcionada, pero mencionado en la card)
- [Organización: AMAImedia.com](https://www.amaimedia.com)
