# nace-ai/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una cuantización en formato GGUF del modelo base Qwen/Qwen3.8-27B, publicada por el usuario nace-ai. El modelo original es un transformer denso de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por el equipo Qwen de Alibaba, orientado a generación de texto y razonamiento conversacional. Esta ficha se centra en la versión cuantizada distribuida por nace-ai, que empaqueta los pesos en GGUF para su uso con llama.cpp, LM Studio y Ollama.

El trabajo de nace-ai no consiste en reentrenar el modelo, sino en producir una cuantización de alta fidelidad respecto al modelo BF16 de referencia. El autor construye su archivo a partir del GGUF UD-Q4_K_XL de Unsloth e introduce ajustes propios de precisión en la capa de salida y en las capas FFN, con el objetivo de reducir la divergencia (KL) respecto al BF16 sin aumentar el tamaño del archivo. El resultado es un archivo Q4_K_XL de 17,29 GB con un KL medio de 0,005 a 512 tokens y de 0,005 a 128K tokens, comparable o ligeramente mejor que el baseline de Unsloth del mismo tamaño.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 27B en hardware de consumo con una pérdida de calidad medida y documentada, y con soporte de contexto largo de 128K tokens. La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial. El autor publica además métricas detalladas de fidelidad (KL, precisión top-1, comprobaciones de tareas en MMLU, ARC-Challenge y Winogrande) que permiten comparar archivos entre sí con rigor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.8-27B); pesos cuantizados en GGUF |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (evaluado por el autor a 512 y 128K tokens) |
| Tipos de cuantizacion | GGUF mixto; el archivo Q4_K_XL mezcla tipos de 3,4 a 8,5 bits por peso (52% Q5_K, 21% IQ4_XS, 13% Q6_K, 10% Q4_K, 4% otros) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27,3 mil millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles en la documentación proporcionada. Lo que sí se documenta es el proceso de cuantización, que constituye la aportación técnica de esta publicación.

La cuantización parte del archivo UD-Q4_K_XL de Unsloth y aplica modificaciones propias de precisión en la capa de salida y en las capas FFN. El archivo resultante no corresponde a un único tipo de llama.cpp, sino que mezcla tipos de tensor de 3,4 a 8,5 bits por peso, todos soportados por llama.cpp estándar. El autor reporta métricas de fidelidad frente al BF16: KL medio de 0,005 (512 tokens), KL p99.9 de 0,172 y precisión top-1 del 97,4%. A 128K tokens, el KL medio es de 0,005 en prosa, 0,005 en chat y tool calls (0,707 contando todos los tokens) y 0,004 en código. La evaluación se realizó con la misma build de llama.cpp (0a94a3f2) para todos los archivos comparados, sobre texto en inglés creado después del 20 de septiembre de 2026, con 64 ventanas de 32.704 tokens.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento previo a la respuesta (thinking); la API devuelve el razonamiento en el campo `reasoning_content`.
- Razonamiento y resolución de problemas, incluyendo matemáticas (el ejemplo de la model card incluye cálculo aritmético directo).
- Generación de código: la evaluación de fidelidad incluye código de GitHub como dominio de prueba, con KL de 0,004 y top-1 del 98,2% a 128K.
- Soporte de tool calling y function calling, evidenciado por los conjuntos de evaluación de chat y tool-call data.
- Capacidades multilingües: no disponibles en la información proporcionada (los idiomas no están listados y la evaluación se hizo sobre texto en inglés).
- Contexto largo de hasta 128K tokens, con fidelidad medida a esa longitud.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de despliegue estándar.
- No se documentan capacidades de visión ni audio en la información disponible (aunque la model card menciona que el tamaño del archivo excluye visión y MTP, lo que implica que el modelo base podría tener componentes adicionales no incluidos en esta cuantización).

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno de hasta 128K tokens con una fidelidad respecto al BF16 de KL 0,005, adecuado para atención al cliente o asistentes personales que necesitan recordar documentación extensa.
- Generación de código en entornos locales: con KL 0,004 y top-1 del 98,2% en código a 128K, es apto para autocompletado, refactorización y generación de tests integrados en editores o pipelines de CI/CD mediante la API compatible con OpenAI de llama-server.
- Automatización de agentes con tool calling: el soporte de tool-call data en la evaluación y el formato GGUF para llama.cpp permiten desplegar agentes que invocan funciones externas en local, sin depender de APIs en la nube.
- Procesamiento de documentos largos: la ventana de 128K tokens permite resumir, extraer información o responder preguntas sobre contratos, informes o bases de código completas en una sola pasada.
- Razonamiento matemático y analítico: el modo thinking previo a la respuesta es útil para tareas que requieren pasos intermedios, como cálculos, análisis de datos o resolución de problemas lógicos.
- Despliegue en hardware de consumo: el archivo Q4_K_XL de 17,29 GB cabe en GPUs consumer de 24 GB (RTX 3090/4090) o en configuraciones con RAM del sistema, lo que permite prototipado e inferencia local sin infraestructura de datacenter.
- Evaluación y benchmarking de cuantizaciones: las métricas publicadas (KL, top-1, MMLU, ARC-Challenge, Winogrande) permiten a investigadores comparar archivos GGUF entre sí bajo condiciones controladas.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad de la cuantización frente al BF16, no resultados de benchmarks de capacidad del modelo. El autor advierte explícitamente que las precisiones de tareas no son comparables con leaderboards, solo entre archivos.

| Metrica | Q4_K_XL | Baseline Unsloth UD-Q4_K_XL | Diferencia (IC 95%) |
|---|---|---|---|
| Tamano LM (GB) | 17,29 | 17,30 | — |
| KL medio 512 tokens | 0,005 | 0,005 | −0,0001 (−0,0003 a −0,0000) |
| KL medio 128K (prosa) | 0,005 | no disponible en tabla | — |
| KL medio 128K (chat, solo turnos del asistente) | 0,005 | no disponible en tabla | −0,0002 (−0,0002 a −0,0001) |
| KL p99.9 512 tokens | 0,172 | no disponible | — |
| Precision top-1 512 tokens (%) | 97,4 | no disponible | — |
| MMLU (13.943 preguntas) | aproximadamente igual | — | −0,0 (−0,2 a +0,1) |
| ARC-Challenge (299 preguntas) | aproximadamente igual | — | −1,0 (−2,7 a +0,3) |
| Winogrande (1.267 preguntas) | aproximadamente igual | — | +0,2 (−0,4 a +0,8) |

A 128K tokens, el autor reporta que Q4_K_XL tiene menor KL medio que los 6 archivos GGUF de otros publicadores en el rango de 0,98 a 1,06 veces su tamaño (mradermacher i1-Q4_1, bartowski IQ4_NL, bartowski Q4_K_M, Unsloth Q4_1, Unsloth UD-Q4_K_XL y bartowski Q4_1). No se han publicado resultados de benchmarks de capacidad (MMLU estándar, HumanEval, GSM8K) del modelo base en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_XL ocupa 17,29 GB de pesos del modelo de lenguaje; se necesita VRAM adicional para el contexto KV. Con contexto de 8K, una GPU de 24 GB es suficiente; con 128K, se requiere hardware de mayor capacidad o offloading a RAM.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para el archivo Q4_K_XL con contexto moderado; A100 40/80 GB o H100 para contexto largo completo y mayor throughput.
- Cabe en GPU consumer: sí, en GPUs de 24 GB (RTX 3090, 4090) con contexto limitado; en GPUs de 16 GB no cabe el archivo Q4_K_XL completo, aunque el autor no publica archivos de menor tamaño en la información disponible.
- Opciones de despliegue: llama.cpp (llama-server con API compatible con OpenAI), LM Studio y Ollama, según la model card. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparación disponible es entre archivos GGUF del mismo modelo base Qwen3.8-27B, no con otros modelos. El autor compara Q4_K_XL con seis archivos de otros publicadores en el rango de tamaño de 0,98 a 1,06 veces el suyo:

| Archivo | Publicador | Tamano (GB) | KL medio 512 tokens | KL medio 128K |
|---|---|---|---|---|
| Q4_K_XL (este) | nace-ai | 17,29 | 0,005 | 0,005 |
| i1-Q4_1 | mradermacher | 17,07 | superior (según autor) | superior (según autor) |
| IQ4_NL | bartowski | 17,19 | superior (según autor) | superior (según autor) |
| Q4_K_M | bartowski | 17,19 | superior (según autor) | superior (según autor) |
| Q4_1 | Unsloth | 17,24 | superior (según autor) | superior (según autor) |
| UD-Q4_K_XL | Unsloth | 17,30 | 0,005 | superior a 128K (según autor) |
| Q4_1 | bartowski | 17,58 | superior (según autor) | superior (según autor) |

No se dispone de comparación con modelos de otros desarrolladores (por ejemplo, Llama o Mistral de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; el modelo base Qwen puede heredar sesgos de sus datos de entrenamiento, no documentados aquí.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Limitaciones de contexto: aunque se evalúa a 128K, el rendimiento en contextos muy largos depende del hardware y de la configuración del KV cache; el autor advierte que un `max_tokens` pequeño puede agotarse dentro del razonamiento y dejar la respuesta vacía.
- Idiomas: no se especifican los idiomas soportados; la evaluación de fidelidad se realizó únicamente sobre texto en inglés.
- Licencia: Apache-2.0, que permite uso comercial, pero se debe verificar la licencia del modelo base Qwen/Qwen3.8-27B (también Apache-2.0 según la model card).
- Caveat de producción: las métricas de tareas (MMLU, ARC, Winogrande) se obtuvieron sin plantilla de chat ni few-shot, por lo que no son comparables con puntuaciones publicadas en leaderboards; solo sirven para comparar archivos entre sí.
- La cuantización mixta de 3,4 a 8,5 bits puede degradar tareas específicas no cubiertas por la evaluación del autor; se recomienda validar en el caso de uso concreto.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de Unsloth (baseline): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
