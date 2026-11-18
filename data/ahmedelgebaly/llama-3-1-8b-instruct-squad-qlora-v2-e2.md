# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e2

## Resumen

El modelo `ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e2` es un adaptador PEFT de tipo QLoRA entrenado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo desarrolla el usuario ahmedelgebaly como parte de un experimento academico de ablacion de epocas (denominado "AAST 2026 SQuAD QLoRA Epoch Ablation Scenario 2.1") en el que se generan cinco adaptadores identicos en configuracion pero entrenados durante un numero distinto de epocas, con el objetivo de comparar la perdida de validacion entre ellos. Este repositorio concreto corresponde a la epoca 2.

El adaptador esta especializado en tareas de question answering generativo y extractivo sobre el dataset SQuAD 2, reformateado en estilo Alpaca bajo el identificador `ahmedelgebaly/SQuad_2_Alpaca`. No se trata de un modelo completo, sino de un conjunto de pesos LoRA (aproximadamente 0,4 GB en el repositorio) que debe combinarse con el modelo base de 8 mil millones de parametros para poder ejecutarse. Su relevancia es limitada fuera del contexto del experimento: no tiene descargas ni interacciones, y el propio autor recomienda el adaptador de la epoca 1 por presentar la menor perdida de validacion del conjunto.

El modelo hereda la arquitectura transformer densa de Llama 3.1 8B Instruct, con una ventana de contexto de 128 000 tokens en el modelo base, aunque el entrenamiento del adaptador se realizo con secuencias de solo 512 tokens. La licencia aplicable es la Llama 3.1 Community License, que impone restricciones de uso comercial y requiere aceptar los terminos de Meta antes de descargar los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), adaptador LoRA sobre modelo base denso |
| Parametros totales | 8 000 millones en el modelo base; tamano del adaptador no disponible (repo de 0,4 GB) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; entrenamiento del adaptador con secuencias de 512 tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador puede combinarse con el base en fp16, bf16 o cuantizaciones GGUF/AWQ/GPTQ del base |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA con cuantizacion de 4 bits en formato NF4 sobre el modelo base Llama 3.1 8B Instruct. La configuracion LoRA emplea rango 32, alpha 64 y dropout 0,05. El entrenamiento se ejecuto durante 2 epocas, con 5234 pasos totales, longitud de secuencia de 512 tokens, tasa de aprendizaje 2e-4 con scheduler coseno y tamano de lote efectivo de 16. El framework utilizado es Axolotl junto con PEFT.

El dataset de entrenamiento es `ahmedelgebaly/SQuad_2_Alpaca`, una version del corpus SQuAD 2 reformateada en estilo Alpaca con campos instruction, input y output. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su origen en SQuAD 2. Los resultados de validacion reportados son una perdida de validacion de 1,0208 y una perplejidad de validacion de 2,7755. No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional mas alla del propio ajuste QLoRA.

## Capacidades

- Generacion de texto y respuestas conversacionales heredadas del modelo base Llama 3.1 8B Instruct.
- Question answering generativo y extractivo sobre pasajes de contexto, especialidad del ajuste fino con SQuAD 2.
- Manejo de preguntas sin respuesta en el contexto, ya que SQuAD 2 incluye ejemplos imposibles de responder.
- Razonamiento basico y generacion de codigo, capacidades heredadas del modelo base aunque no reforzadas por el ajuste.
- Soporte de tool calling y function calling heredado del modelo base Instruct.
- Capacidades multilingues heredadas del modelo base (8 idiomas oficiales), sin evidencia de que el ajuste las preserve o mejore.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Extraccion de respuestas en sistemas de documentacion tecnica: el adaptador puede recibir un fragmento de texto y una pregunta para devolver la respuesta contenida en el pasaje, aprovechando el ajuste especifico sobre SQuAD 2.
- Construccion de pipelines de QA sobre bases de conocimiento internas: combinado con un sistema de recuperacion (RAG), el adaptador responde preguntas formuladas sobre los documentos recuperados, con la ventaja de que ha sido entrenado para reconocer cuando la respuesta no esta en el contexto.
- Evaluacion academica de estrategias de ajuste: sirve como referencia en experimentos de ablacion de epocas, comparando su perdida de validacion (1,0208) con la de los adaptadores hermanos e1, e3, e4 y e5.
- Prototipado rapido de asistentes de lectura comprensiva: al ser un adaptador ligero de 0,4 GB, permite iterar sobre el modelo base sin almacenar copias completas de 8B en cada variante.
- Clasificacion y respuesta sobre formularios o encuestas abiertas: el formato Alpaca del dataset permite adaptar el modelo a tareas de extraccion de campos a partir de texto libre con instrucciones.
- Fine-tuning incremental de bajo coste: el adaptador puede servir como punto de partida para ajustes posteriores sobre dominios especificos, dado su bajo coste de almacenamiento y su compatibilidad con el ecosistema PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento reportados por el autor son metricas de validacion del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,0208 |
| Perplejidad de validacion | 2,7755 |
| Pasos de entrenamiento | 5234 |
| Epocas | 2 |

El autor indica que el adaptador de la epoca 1 presenta la menor perdida de validacion del conjunto, por lo que este adaptador de epoca 2 no es el recomendado dentro de la ablacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 requiere aproximadamente 16 GB; en cuantizacion 4-bit (GPTQ/AWQ/GGUF Q4) se reduce a unos 5-6 GB, a los que se suma el adaptador LoRA (menos de 1 GB).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en precision completa con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion 8-bit.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion 4-bit GGUF; en 16 GB o mas con cuantizacion 8-bit o bf16 con contexto reducido.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM con soporte de adaptadores LoRA, llama.cpp/Ollama fusionando el adaptador en el base y convirtiendo a GGUF, TGI con adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e2 (este) | 8B (base) + adaptador LoRA | 128k (base), entrenado a 512 | Adaptador QLoRA para QA | Llama 3.1 Community | Hugging Face, 0 descargas |
| Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1 | 8B (base) + adaptador LoRA | 128k (base), entrenado a 512 | Adaptador QLoRA para QA | Llama 3.1 Community | Hugging Face, recomendado por el autor |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Modelo completo Instruct | Llama 3.1 Community | Hugging Face, ampliamente utilizado |
| Modelos especializados en QA de 7-8B (p. ej. variantes fine-tuned de Mistral o Qwen) | 7-8B | variable | Modelo completo o adaptador | variable | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere descargar y cargar el modelo base `meta-llama/Llama-3.1-8B-Instruct`, que esta sujeto a aceptacion previa de la licencia de Meta en Hugging Face.
- El entrenamiento se realizo con secuencias de solo 512 tokens, por lo que el rendimiento en tareas de QA con contextos largos puede degradarse respecto al modelo base.
- El ajuste esta limitado al dominio de SQuAD 2 (pasajes de Wikipedia en ingles); el rendimiento en otros dominios o idiomas no esta documentado.
- Riesgo de alucinacion inherente al modelo base, especialmente en preguntas sin respuesta en el contexto, aunque SQuAD 2 incluye ejemplos de este tipo.
- Sesgos conocidos del modelo base Llama 3.1 (sesgos de genero, culturales y linguisticos) que el ajuste no corrige y puede incluso amplificar en el dominio de QA.
- La licencia Llama 3.1 Community impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales para productos derivados) y obligaciones de atribucion.
- El autor recomienda el adaptador de la epoca 1 por tener menor perdida de validacion; este adaptador de epoca 2 no es la mejor opcion del conjunto para produccion.
- No hay evidencia de evaluacion independiente, descargas ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Adaptador recomendado (epoca 1): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1
- Adaptador epoca 3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e3
- Adaptador epoca 4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e4
- Adaptador epoca 5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e5
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper original de SQuAD: no disponible en la informacion proporcionada
- Framework Axolotl: no disponible en la informacion proporcionada
- Framework PEFT: no disponible en la informacion proporcionada
