# amd/GPT-OSS-120B_gpuep_1.0_gpu_128

## Resumen

GPT-OSS-120B_gpuep_1.0_gpu_128 es una distribucion optimizada del modelo abierto gpt-oss-120b de OpenAI, publicada por AMD. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original a formato ONNX cuantizado en UINT4 y modificado con la herramienta ShapeShifter para insertar nodos de casteo a FP32 alrededor de las capas SkipSimplifiedLayerNormalization, de modo que estas operan en precision completa. El resultado es un artefacto listo para despliegue en hardware AMD Ryzen AI.

El modelo hereda la arquitectura Mixture-of-Experts (MoE) del gpt-oss-120b original, con 120 mil millones de parametros totales y del orden de 5 mil millones activos por token, segun la documentacion publica de OpenAI. La ventana de contexto del modelo base es de 131 072 tokens. Esta variante concreta esta pensada para inferencia acelerada por GPU/NPU en plataformas AMD, con pesos cuantizados a 4 bits por grupo (group_size=32, asimetrico) en todas las capas lineales.

Su relevancia radica en que permite ejecutar un modelo de 120B en formato ONNX cuantizado manteniendo la calidad del original: la model card reporta una perplejidad en wikitext2 sintetico de 2,35, identica a la del checkpoint UINT4 sin la modificacion FP32 en las normalizaciones. La licencia del modelo base es Apache 2.0 y las modificaciones de AMD se publican bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (heredada de openai/gpt-oss-120b), exportada a ONNX |
| Parametros totales | 120 mil millones (modelo base) |
| Parametros activos | no disponible en la informacion proporcionada (el modelo base gpt-oss-120b activa ~5B por token segun documentacion de OpenAI) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base soporta 131 072 tokens) |
| Tipos de cuantizacion | UINT4 asimetrico per-group, group_size=32, en todas las capas lineales; normalizaciones en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (base) + MIT (modificaciones AMD) |
| Formato de pesos | ONNX (no safetensors ni GGUF) |
| Tamano del repositorio | 137,8 GB |
| Libreria declarada | transformers |
| Hardware objetivo | AMD Ryzen AI (GPU/NPU) |

## Arquitectura y entrenamiento

Esta publicacion no incluye entrenamiento propio: es una conversion y optimizacion del checkpoint openai/gpt-oss-120b. El modelo base es un transformer con mezcla de expertos (MoE) de 120B parametros totales, entrenado por OpenAI con datos no detallados publicamente en esta ficha. La intervencion de AMD consiste en tomar el ONNX ya cuantizado (amd/gpt-oss-120b-w-uint4-pergroup-asym-awq-onnx) y aplicar ShapeShifter para insertar nodos de casteo FP32 alrededor de SkipSimplifiedLayerNormalization.

El objetivo tecnico de esa modificacion es evitar perdida numerica en las normalizaciones cuando los pesos estan en UINT4: al ejecutar esas capas en FP32 se preserva la estabilidad del grafo ONNX sin coste apreciable en calidad, como demuestra la perplejidad identica (2,35 en ambos checkpoints). La cuantizacion es asimetrica por grupo con group_size=32 y se aplica a todas las capas lineales, mientras que el resto del grafo mantiene precision superior. No se dispone de informacion sobre el dataset de entrenamiento, el proceso de RLHF/DPO ni innovaciones de decodificacion en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento y respuesta multi-turno, heredados del modelo base gpt-oss-120b.
- Capacidades de codigo y matematicas propias del modelo base (no verificadas en esta variante).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en esta variante.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Modo thinking: no confirmado para esta variante.
- Vision y audio: no disponibles.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructura de inferencia gestionada.

## Casos de uso

- Despliegue en equipos con aceleradores AMD Ryzen AI: el formato ONNX y la cuantizacion UINT4 permiten ejecutar un modelo de 120B en plataformas de PC con NPU/GPU AMD, algo inviable con pesos FP16.
- Inferencia local de asistente conversacional: al ser un modelo de 120B con ~5B parametros activos, ofrece calidad de modelo grande con coste computacional de modelo mediano, adecuado para asistentes de escritorio en hardware AMD.
- Prototipado de pipelines ONNX en produccion: sirve para validar flujos de inferencia ONNX Runtime antes de escalar a despliegues mayores, gracias a la compatibilidad con transformers y endpoints.
- Evaluacion comparativa de cuantizacion: util para medir el impacto de la insercion de FP32 en normalizaciones frente al checkpoint UINT4 base, con perplejidad controlada.
- Generacion de codigo asistida en IDE: el modelo base esta orientado a tareas de codigo y razonamiento; esta variante permite integrarlo en herramientas locales con aceleracion AMD.
- Investigacion sobre eficiencia de MoE cuantizados: permite estudiar el comportamiento de un MoE de 120B en 4 bits sobre hardware consumer, midiendo latencia y calidad en tareas reales.
- Servicio de chat con contexto largo: si se confirma la ventana de 131k del modelo base, admite conversaciones y documentos extensos en un solo prompt.

## Benchmarks y rendimiento

| Benchmark | gpt-oss-120b-w-uint4-pergroup-asym-awq-onnx (UINT4) | Este modelo (UINT4 + FP32 en SSN) |
|---|---|---|
| Perplexity wikitext2 sintetico | 2,35 | 2,35 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. No se dispone de datos de latencia ni throughput para esta variante.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 137,8 GB en disco; con pesos UINT4 el modelo requiere del orden de esa cifra de memoria para cargarse, aunque no se especifica el consumo exacto en la informacion disponible.
- GPU recomendadas: hardware AMD Ryzen AI (GPU/NPU) segun la model card; no se detallan modelos concretos.
- Cabe en GPU consumer: no confirmado; 137,8 GB excede la VRAM de cualquier GPU consumer actual, por lo que requiere configuraciones multi-GPU, memoria unificada o aceleradores especificos de AMD.
- Opciones de despliegue: ONNX Runtime (formato nativo), transformers (libreria declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no confirmada para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-OSS-120B_gpuep_1.0_gpu_128 (este) | 120B (MoE) | no disponible | ONNX UINT4 | Apache 2.0 + MIT | Hugging Face (AMD) |
| openai/gpt-oss-120b | 120B (MoE) | 131 072 | safetensors (original) | Apache 2.0 | Hugging Face (OpenAI) |
| amd/gpt-oss-120b-w-uint4-pergroup-asym-awq-onnx | 120B (MoE) | no disponible | ONNX UINT4 | Apache 2.0 | Hugging Face (AMD) |

La diferencia principal frente al checkpoint UINT4 base es la insercion de FP32 en las normalizaciones, sin cambio en perplejidad. Frente al modelo original de OpenAI, esta variante prioriza el despliegue en hardware AMD y el formato ONNX sobre la portabilidad general. No se dispone de datos de rendimiento comparativo en tareas generativas para establecer diferencias funcionales.

## Limitaciones y advertencias

- Modelo derivado: no ha sido reentrenado; hereda sesgos y limitaciones del gpt-oss-120b original, no documentados en esta ficha.
- Riesgo de alucinacion: no evaluado en esta variante; el modelo base presenta el riesgo habitual de los LLM.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingue.
- Contexto maximo no confirmado para esta variante; debe verificarse antes de usarla con prompts largos.
- Formato ONNX especifico para hardware AMD: la portabilidad a otras plataformas (NVIDIA, Apple) no esta garantizada.
- Tamano de 137,8 GB: requiere infraestructura de memoria considerable; no apto para equipos sin aceleracion AMD adecuada.
- Licencia dual: las modificaciones AMD son MIT y el modelo base Apache 2.0; conviene revisar ambas condiciones para uso comercial.
- Sin datos de benchmarks generativos: no se puede afirmar que la calidad se mantenga en tareas de razonamiento o codigo, solo en perplejidad.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/amd/GPT-OSS-120B_gpuep_1.0_gpu_128
- Modelo base en Hugging Face: https://huggingface.co/openai/gpt-oss-120b
- Checkpoint ONNX UINT4 de referencia: https://huggingface.co/amd/gpt-oss-120b-w-uint4-pergroup-asym-awq-onnx
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
