# sigmanih/microsoft-phi-4-GGUF-Q4_K_M

## Resumen

Este repositorio contiene una cuantizacion GGUF en formato Q4_K_M del modelo Microsoft Phi-4, publicada por el usuario sigmanih a traves de su herramienta Sigma Studio. No se trata de un modelo nuevo ni de un fine-tuning: es una conversion de los pesos originales de microsoft/phi-4 a un formato optimizado para inferencia con llama.cpp y motores compatibles, con el objetivo de reducir el espacio en disco y los requisitos de memoria.

Phi-4 es un modelo de lenguaje denso de aproximadamente 14.700 millones de parametros desarrollado por Microsoft Research, disenado especificamente para razonamiento de alta calidad en un tamano compacto. Esta version cuantizada ocupa unos 8,44 GB en disco y esta pensada para ejecutarse en GPUs de consumo con 12-16 GB de VRAM o en configuraciones hibridas CPU/GPU.

La relevancia de esta publicacion es practica: permite desplegar un modelo de razonamiento de clase 14B en hardware asequible, con la advertencia de que la model card incluye datos de evaluacion propios del publicador (no de Microsoft) medidos sobre subconjuntos reducidos de los benchmarks, por lo que no son directamente comparables con resultados de suite completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia phi3 (segun model card del publicador) |
| Parametros totales | 14.659.507.200 (~14,7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (segun model card del publicador) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repo) |
| Idiomas soportados | en, it (segun metadatos del repo) |
| Licencia | other (heredada de microsoft/phi-4; consultar terminos de Microsoft) |
| Formato de pesos | GGUF |
| Capas del transformer | 40 |
| Dimension oculta | 5120 |
| Tamano en disco | 8,44 GB (repo: 9,1 GB) |
| VRAM estimada (offload completo) | ~10,6 GB |
| RAM estimada (CPU/hibrido) | ~10,4 GB |

## Arquitectura y entrenamiento

El modelo subyacente, microsoft/phi-4, es un transformer denso de tipo decoder-only con 40 capas y dimension oculta de 5120, entrenado por Microsoft Research sobre una mezcla de datos web filtrados, datos sinteticos generados por modelos mayores y datos de libros y codigo, con un enfasis declarado en calidad de razonamiento mas que en volumen bruto. Microsoft documento tecnicas de filtrado y sintesis de datos orientadas a matematicas y logica, aunque los detalles exactos del dataset no estan recogidos en la informacion disponible de este repositorio.

Esta publicacion concreta no aporta informacion sobre el proceso de entrenamiento original ni sobre el pipeline de cuantizacion mas alla de indicar el formato Q4_K_M y la herramienta Sigma Studio. No se documentan pasos de RLHF, DPO ni decodificacion especulativa en la informacion proporcionada. La cuantizacion Q4_K_M aplica cuantizacion de 4 bits con escalas de mayor precision en determinadas capas (las mas sensibles), lo que en la practica suele preservar mejor la calidad que un Q4 uniforme, aunque no hay mediciones comparativas publicadas en este repo.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles e italiano (idiomas declarados en los metadatos).
- Razonamiento matematico de varios pasos, con resultados altos en los subconjuntos evaluados de GSM8K y MATH segun el publicador.
- Generacion de codigo en Python, con evaluacion reportada en HumanEval y MBPP (subconjuntos reducidos).
- Razonamiento cientifico y de sentido comun (ARC-Challenge, HellaSwag, BIG-Bench Hard).
- Modo de razonamiento explicito (chain-of-thought) frente a respuesta directa, con una mejora reportada de +3,1 puntos porcentuales en el modo CoT.
- Soporte de tool calling / function calling segun la evaluacion del publicador, con una adherencia declarada al protocolo de herramientas del 89,1%.
- Capacidad de operar en entornos de agente con restricciones de sandbox (contencion declarada del 100%).
- No se documentan capacidades multimodales (vision, audio) en esta publicacion.

## Casos de uso

- Razonamiento matematico asistido: resolucion de problemas de varios pasos con traza CoT activada, aprovechando el rendimiento reportado en GSM8K y MATH; util en herramientas educativas o de verificacion de calculos.
- Generacion y revision de codigo Python: el modelo puede integrarse en un pipeline de CI/CD o en un asistente de IDE para autocompletar, refactorizar o generar tests, dado su rendimiento reportado en HumanEval y MBPP.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar ~10,6 GB de VRAM con offload completo, cabe en una RTX 4070 o similar, lo que permite prototipado local sin depender de la nube.
- Asistente conversacional de dominio tecnico en ingles o italiano: conversaciones multi-turno con hasta 16.384 tokens de contexto para documentacion, soporte interno o analisis de textos largos.
- Agente con tool calling en entornos controlados: integracion en flujos donde el modelo debe invocar funciones registradas (APIs, operaciones de fichero) con validacion de esquema, segun la evaluacion de adherencia al protocolo del publicador.
- Evaluacion e investigacion de cuantizaciones: este repo sirve como referencia para comparar el comportamiento de Phi-4 en Q4_K_M frente a los pesos originales en tareas de razonamiento, util para estudiar la perdida de calidad por cuantizacion.
- Procesamiento por lotes en CPU o configuracion hibrida: con ~10,4 GB de RAM, puede ejecutarse en servidores sin GPU para tareas de clasificacion, resumen o extraccion de informacion no sensibles a latencia.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del publicador (Sigma Studio Training Lab), medidos sobre subconjuntos reducidos de cada suite, no sobre la suite completa. No son comparables con resultados oficiales de Phi-4 ni con ejecuciones de suite completa.

| Benchmark | Aciertos / Total | Precision reportada |
|---|---|---|
| ARC-Challenge | 8 / 9 | 89% |
| BIG-Bench Hard | 6 / 7 | 86% |
| GPQA | 5 / 9 | 56% |
| GSM8K | 9 / 9 | 100% |
| HellaSwag | 5 / 9 | 56% |
| HumanEval | 6 / 7 | 86% |
| MATH | 8 / 9 | 89% |
| MBPP | 8 / 9 | 89% |
| MMLU | 7 / 14 | 50% |
| MMLU-Pro | 5 / 9 | 56% |
| TruthfulQA | 8 / 9 | 89% |
| Total agregado | 75 / 100 | 75% |

| Modo de ejecucion | Precision | Aciertos |
|---|---|---|
| Respuesta directa (no-thinking) | 73,7% | 42 / 57 |
| Razonamiento CoT (deep thinking) | 76,7% | 33 / 43 |

Protocolo declarado: code_execution, continuation_logprob, cot_generation, letter_logprob; temperatura 0,0; semilla 42; hash de reproducibilidad SHA256-B2586A4754F20163. El propio publicador advierte que las puntuaciones se midieron sobre una porcion del dataset y no son comparables con ejecuciones de suite completa. No se han publicado resultados de benchmarks oficiales de Microsoft en la informacion disponible de este repositorio.

## Requisitos de hardware

- VRAM estimada: ~10,6 GB con offload completo en GPU; ~10,4 GB de RAM en modo CPU o hibrido.
- GPU recomendadas por el publicador: gama con 12-16 GB de VRAM, como RTX 3060 de 12 GB o RTX 4070.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM; en GPUs de 8 GB requeriria offload parcial a CPU y perdida de velocidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), asi como motores compatibles con GGUF como Ollama o LM Studio; el repo declara compatibilidad con endpoints. No se documenta soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada; el publicador solo menciona perfiles cualitativos ("minimal latency" en modo directo, mayor coste en modo CoT) sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (Phi-4 Q4_K_M) | ~14,7B | 16.384 | GGUF Q4_K_M, 8,44 GB | other (Microsoft) | Cuantizacion de terceros; benchmarks sobre subconjuntos |
| microsoft/phi-4 (original) | ~14,7B | 16.384 | safetensors (BF16) | other (Microsoft) | Pesos de referencia; requiere ~28-30 GB en BF16 |
| Qwen2.5-14B | 14,7B | 32.768 (128K en variantes) | safetensors, GGUF | Apache 2.0 (segun variante) | Alternativa de tamano similar con contexto mayor; datos no verificados en esta ficha |
| Llama 3.1 8B | 8B | 131.072 | safetensors, GGUF | Llama Community License | Menor numero de parametros y contexto mucho mayor; rendimiento en razonamiento inferior segun evaluaciones publicas de Microsoft |

No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa directa con estas alternativas; las filas de modelos comparables se incluyen solo a efectos orientativos de categoria y tamano.

## Limitaciones y advertencias

- Los benchmarks de la model card fueron medidos por el publicador sobre subconjuntos reducidos (por ejemplo, 9 preguntas en GSM8K o 14 en MMLU); no son representativos del rendimiento en suite completa ni comparables con cifras oficiales.
- La adherencia al protocolo de herramientas se reporta al 89,1%, pero la finalizacion autonoma de tareas se reporta al 0,0% en el escenario evaluado; no debe asumirse fiabilidad en flujos de agente de varios pasos sin validacion adicional.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el 89% en TruthfulQA sobre un subconjunto de 9 preguntas no es evidencia suficiente de robustez factual.
- Idiomas declarados limitados a ingles e italiano; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto de 16.384 tokens, inferior al de alternativas contemporaneas con ventanas de 32K a 128K.
- Licencia "other" heredada de microsoft/phi-4: es imprescindible revisar los terminos de Microsoft antes de cualquier uso comercial; el publicador muestra una insignia Apache 2.0 en el README que no debe interpretarse como la licencia del modelo base.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales en BF16; no se documenta una evaluacion diferencial de esa perdida en este repo.
- Repositorio de terceros con 294 descargas y 1 like en el momento de la consulta: no es una publicacion oficial de Microsoft y su mantenimiento no esta garantizado.
- La model card contiene afirmaciones de marketing (insignias de "production-ready", "high-performance") sin respaldo cuantitativo detallado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/microsoft-phi-4-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del publicador en Hugging Face: https://huggingface.co/sigmanih
- Licencia Apache 2.0 referenciada en el README (no aplicable al modelo base): https://opensource.org/licenses/Apache-2.0
