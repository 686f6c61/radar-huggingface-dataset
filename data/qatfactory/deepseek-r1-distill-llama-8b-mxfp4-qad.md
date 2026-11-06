# qatfactory/DeepSeek-R1-Distill-Llama-8B-MXFP4-QAD

## Resumen

DeepSeek-R1-Distill-Llama-8B-MXFP4-QAD es una version cuantizada del modelo DeepSeek-R1-Distill-Llama-8B, publicada por el usuario qatfactory en Hugging Face. Se trata de un proceso de cuantizacion MXFP4 (formato de punto flotante de 4 bits con escalas compartidas por bloques, definido en la especificacion OCP MX) aplicado mediante quantization-aware training (QAT), segun indican las etiquetas del repositorio. El modelo base es el distill de DeepSeek-R1 sobre Llama-3.1-8B, desarrollado por DeepSeek y disenado para razonamiento con cadenas de pensamiento largas.

El resultado es un checkpoint de aproximadamente 8.030 millones de parametros almacenado en safetensors bajo el formato compressed-tensors, pensado para su despliegue con vLLM. El repositorio ocupa 5,8 GB, lo que supone una reduccion notable frente a los ~16 GB de pesos en BF16 del modelo original, y permite ejecutar el modelo en GPUs de consumo con menos VRAM.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantizacion de 4 bits con QAT sobre un modelo de razonamiento ampliamente utilizado; por otro, advierte de que el acceso esta restringido (gated) y de que no se han publicado resultados de evaluacion especificos para esta variante. La licencia declarada es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B) con destilacion de razonamiento de DeepSeek-R1; cuantizacion MXFP4 con QAT |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base soporta hasta 131.072 tokens, segun la documentacion de DeepSeek) |
| Tipos de cuantizacion | MXFP4 (4 bits, formato compressed-tensors); el repositorio se etiqueta como 8-bit en los tags, dato no verificado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Llama-8B es un transformer decoder-only basado en Llama-3.1-8B (8.030 millones de parametros, GQA, RoPE, SwiGLU, RMSNorm) afinado por DeepSeek mediante destilacion a partir de las trazas de razonamiento generadas por DeepSeek-R1. El objetivo de esa destilacion es transferir el comportamiento de cadena de pensamiento larga (thinking mode) a un modelo de menor tamano. No se dispone de informacion sobre el numero exacto de tokens de destilacion ni sobre la composicion del dataset en la informacion proporcionada.

Sobre esa base, qatfactory aplica una cuantizacion MXFP4 con quantization-aware training: los pesos se agrupan en bloques con una escala compartida en formato E8M0 (potencia de dos), lo que reduce el coste de descalado frente a esquemas per-channel. El resultado se serializa con la libreria compressed-tensors y se publica con vLLM como libreria de referencia, lo que sugiere que el kernel de inferencia objetivo es el de vLLM para FP4. No se detalla en la informacion disponible el numero de pasos de QAT, el dataset de calibracion ni la perdida de calidad respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento multi-paso con cadenas de pensamiento explicitas, heredadas de la destilacion de DeepSeek-R1.
- Resolucion de problemas matematicos y de logica, con soporte para modos de razonamiento extendido del modelo base.
- Generacion y explicacion de codigo, incluyendo tareas de depuracion y refactorizacion.
- Soporte multilingue heredado de Llama-3.1 (el modelo base declara capacidad en multiples idiomas; el conjunto exacto para esta variante no esta disponible).
- Instrucciones y conversacion multi-turno en formato chat del modelo base.
- No se documenta en la informacion proporcionada soporte explicito de tool calling, function calling, vision ni audio para esta variante cuantizada.

## Casos de uso

- Razonamiento matematico asistido en entornos educativos: el modelo puede generar cadenas de pensamiento paso a paso para problemas de algebra y calculo, y su tamano de 8B cuantizado a 4 bits permite desplegarlo en una unica GPU de consumo para uso interactivo.
- Generacion de codigo en pipelines de CI: con 8B parametros y pesos de ~5,8 GB, puede ejecutarse en vLLM junto a herramientas de revision estatica para sugerir parches o explicar fallos de test en un runner con GPU.
- Analisis de documentos tecnicos con contexto medio: aunque la longitud de contexto de esta variante no esta documentada, el modelo base soporta ventanas largas, lo que permite resumir y razonar sobre informes extensos si el despliegue lo configura.
- Prototipado de agentes de razonamiento en local: al ser un distill de R1, es util para experimentar con patrones de self-consistency y verificacion de pasos en una estacion de trabajo con una RTX 4090.
- Evaluacion de tecnicas de cuantizacion: este checkpoint sirve como referencia practica para comparar MXFP4+QAT frente a otros esquemas (GPTQ, AWQ, GGUF Q4) sobre el mismo modelo base en tareas de razonamiento.
- Despliegue de bajo coste en entornos con restricciones de VRAM: al ocupar 5,8 GB en disco, encaja en GPUs de 8-12 GB para inferencia por lotes pequenos, aunque el rendimiento real no esta documentado.
- Fine-tuning ligero o adaptacion con LoRA: al ser un checkpoint de 4 bits con QAT, puede servir de base para experimentos de adaptacion eficiente en memoria, siempre que la herramienta soporte compressed-tensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante cuantizada. El modelo base DeepSeek-R1-Distill-Llama-8B reporta resultados en MMLU, HumanEval, GSM8K y MATH en la model card oficial de DeepSeek, pero no se trasladan aqui al no haberse proporcionado esos datos ni mediciones de la version MXFP4.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para pesos en MXFP4 (5,8 GB de checkpoint) mas overhead de KV cache; con contexto largo la KV cache puede crecer varios GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) y RTX 4080 (16 GB) para uso local con margen.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para contextos cortos y lotes pequenos; con 12-16 GB se dispone de margen para contextos mayores.
- Opciones de despliegue: vLLM es la libreria declarada y la via recomendada por el formato compressed-tensors; no se documenta soporte para llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles; dependen del kernel FP4 de vLLM y del hardware, y no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B-MXFP4-QAD (este) | 8,03B | no disponible | MXFP4 + QAT | MIT | Gated en Hugging Face |
| DeepSeek-R1-Distill-Llama-8B (original) | 8,03B | 131.072 tokens (segun model card) | BF16 | MIT | Publico |
| Llama-3.1-8B-Instruct | 8,03B | 131.072 tokens | BF16, GPTQ, AWQ, GGUF | Llama 3.1 Community License | Publico |
| Qwen2.5-7B-Instruct | 7,6B | 131.072 tokens | BF16, GPTQ, AWQ, GGUF | Apache 2.0 | Publico |

La comparativa se limita a parametros y disponibilidad; no hay datos de rendimiento publicados para la variante MXFP4 que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Sin evaluacion publicada: no hay benchmarks ni mediciones de perdida de calidad tras la cuantizacion MXFP4, por lo que el impacto en tareas de razonamiento es desconocido.
- Ambiguedad en la etiqueta de bits: los tags indican "8-bit" mientras que el nombre y el formato apuntan a MXFP4 (4 bits); conviene verificar la configuracion real de compressed-tensors antes de desplegar.
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion; las cadenas de razonamiento largas no garantizan correccion factual.
- Sesgos: no documentados para esta variante; se heredan los del modelo base y los de Llama-3.1.
- Idiomas: no se especifica el conjunto de idiomas soportados en esta ficha; la cobertura multilingue puede degradarse respecto al modelo original.
- Restricciones de licencia: MIT permite uso comercial, pero debe verificarse que la licencia del modelo base y de los datos de destilacion lo permitan en el contexto de uso previsto.
- Compatibilidad: el formato compressed-tensors limita el ecosistema de herramientas; no se garantiza su uso con llama.cpp u Ollama.
- Produccion: al no haber mediciones de latencia ni de calidad, se recomienda validar en el dominio concreto antes de un despliegue en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qatfactory/DeepSeek-R1-Distill-Llama-8B-MXFP4-QAD
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentacion de vLLM: https://docs.vllm.ai
- Especificacion OCP MX (MXFP4): https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf
