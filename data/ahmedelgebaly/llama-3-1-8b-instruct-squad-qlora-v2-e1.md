# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1

## Resumen

El modelo `ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1` es un adaptador PEFT de tipo QLoRA entrenado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo desarrolla el usuario ahmedelgebaly en el contexto de un trabajo academico (identificado en la model card como "AAST Scenario 2.1") orientado al ajuste fino para tareas de question answering extractivo y generativo sobre el dataset SQuAD 2, reformateado en estilo Alpaca bajo el identificador `ahmedelgebaly/SQuad_2_Alpaca`.

No se trata de un modelo completo, sino de un adaptador de bajo rango (LoRA r=32, alpha=64, dropout=0.05) que debe combinarse con los pesos base de Llama 3.1 8B Instruct para su uso. El repositorio ocupa 0.4 GB y contiene unicamente los pesos del adaptador en formato safetensors, junto con los artefactos de tokenizer. La relevancia practica es limitada: se trata de un experimento de ablacion de epocas (existen cinco checkpoints hermanos, e1 a e5) y este e1 se marca como el recomendado por tener la menor perdida de validacion (0.9303) y perplejidad de validacion de 2.5353.

El modelo hereda la arquitectura, el contexto y las capacidades del Llama 3.1 8B Instruct original, con el matiz de que el ajuste se ha realizado con secuencias de 512 tokens y sobre un unico dataset de QA, lo que puede estrechar el comportamiento del modelo hacia respuestas cortas basadas en contexto. No dispone de descargas ni likes en el momento de la consulta, y no se han publicado resultados de benchmarks especificos del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA sobre atencion y proyecciones; entrenamiento QLoRA en 4-bit NF4 |
| Parametros totales | 8B en el modelo base; el adaptador LoRA ocupa 0.4 GB en disco |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base Llama 3.1 8B Instruct soporta 128K tokens, pero el entrenamiento se hizo con secuencias de 512 tokens |
| Tipos de cuantizacion | El adaptador se entreno con cuantizacion 4-bit NF4 del base; los pesos del adaptador son safetensors en precision estandar; no se publican variantes GGUF |
| Idiomas soportados | No disponible (no declarados en la model card ni en los tags) |
| Licencia | Llama 3.1 Community License (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors para cargarse |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8B parametros con atencion por grupos (GQA) y RoPE, cuyo contexto nativo es de 128K tokens. El ajuste se realizo con QLoRA: el base se cuantiza a 4-bit NF4 y se entrenan unicamente los modulos LoRA con r=32, alpha=64 y dropout=0.05. El entrenamiento se ejecuto con Axolotl + PEFT, con 2619 pasos, una sola epoca, longitud de secuencia 512, learning rate 2e-4 con scheduler coseno, batch efectivo de 16 y validacion con perdida 0.9303 y perplejidad 2.5353.

El dataset es `ahmedelgebaly/SQuad_2_Alpaca`, una version del SQuAD 2 en formato Alpaca (instruction / input / output), lo que orienta el adaptador a responder preguntas a partir de un contexto textual. No se documentan tecnicas adicionales como RLHF, DPO, decodificacion especulativa ni atencion lineal; el adaptador no modifica la arquitectura del base, solo anade matrices de bajo rango en las capas seleccionadas. No se especifica cuantos tokens de entrenamiento se procesaron ni la composicion exacta del split de validacion mas alla del dataset referenciado.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre un contexto proporcionado (QA extractivo y generativo), el objetivo principal del ajuste.
- Razonamiento basico y conversacion multi-turno heredados del base Llama 3.1 8B Instruct.
- Generacion de codigo y matematicas basicas, aunque no reforzadas por el ajuste y potencialmente degradadas por el sesgo hacia respuestas cortas de QA.
- Soporte de tool calling y function calling heredado del base (no verificado tras el ajuste).
- Capacidad de agentes y razonamiento multi-paso heredada del base, no evaluada en el adaptador.
- Capacidades multilingues heredadas del base (el base cubre varios idiomas), si bien el adaptador se entreno solo con SQuAD en ingles, lo que puede sesgar el comportamiento hacia el ingles.
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Extraccion de respuestas en documentacion tecnica: dado un fragmento de manual o especificacion, el adaptador devuelve la respuesta concreta a una pregunta, aprovechando el formato Alpaca del entrenamiento.
- Atencion al cliente sobre base de conocimiento: se inyecta el contexto del articulo o FAQ y el modelo responde de forma concisa; adecuado por el ajuste a respuestas cortas y ancladas al contexto.
- Preprocesado de pipelines RAG: usar el adaptador como extractor de respuestas sobre los fragmentos recuperados antes de pasarlos a un modelo mayor o a una capa de validacion.
- Evaluacion academica de QLoRA: sirve como checkpoint de referencia (menor val loss) en la ablacion de epocas del escenario 2.1, util para comparar e1 frente a e2-e5.
- Prototipado rapido de asistentes de QA: al ocupar solo 0.4 GB el adaptador, se puede cargar y descargar rapidamente junto al base en entornos de experimentacion.
- Generacion de pares pregunta-respuesta para aumento de datos: el modelo puede producir respuestas plausibles a partir de contextos SQuAD-like, utiles para construir datasets de entrenamiento.
- Filtrado de respuestas en moderacion de contenido: con contexto explicito, el modelo puede clasificar o responder preguntas cerradas sobre politicas internas, aunque con cautela por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de validacion del entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss | 0.9303 |
| Val PPL | 2.5353 |
| Pasos de entrenamiento | 2619 |
| Epocas | 1 |

No se aportan resultados de MMLU, HumanEval, GSM8K, SQuAD F1/EM ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia del base en FP16: aproximadamente 16 GB; en 8-bit unos 8-9 GB; en 4-bit unos 5-6 GB. El adaptador anade un coste marginal (0.4 GB en disco, decenas de MB en VRAM).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090/4080 (16-24 GB) para FP16 o 8-bit; RTX 4060 Ti 16 GB o similar para 4-bit.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y 4060 Ti 16 GB con cuantizacion 4-bit u 8-bit; en GPUs de 8 GB solo con cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM (soporta adaptadores LoRA), TGI (con adaptadores), llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF (no se publica esa variante).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1 | 8B (adaptador LoRA) | 512 en entrenamiento; 128K en base | Llama 3.1 Community | Hugging Face (0 descargas) | Adaptador QA sobre SQuAD 2; sin benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community | Hugging Face (ampliamente usado) | Modelo base; capacidades generales, sin ajuste especifico de QA |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32K | Apache 2.0 | Hugging Face | Alternativa generalista con licencia permisiva |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128K | Apache 2.0 | Hugging Face | Alternativa generalista con buen rendimiento en QA y codigo |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con estas alternativas; la comparacion es estructural (tamano, contexto, licencia y disponibilidad).

## Limitaciones y advertencias

- Adaptador, no modelo completo: requiere descargar el base `meta-llama/Llama-3.1-8B-Instruct` y aceptar la licencia de Meta antes de poder usarlo.
- Entrenado solo con SQuAD 2 en ingles: el comportamiento multilingue y la calidad en dominios fuera de QA pueden degradarse respecto al base.
- Secuencias de entrenamiento de 512 tokens: aunque el base soporta 128K, el adaptador no fue entrenado con contextos largos y puede rendir peor en ellos.
- Riesgo de alucinacion en respuestas cuando el contexto no contiene la respuesta; SQuAD 2 incluye preguntas sin respuesta, pero el adaptador puede no respetar bien esa restriccion.
- Sesgos heredados del base Llama 3.1 y del dataset SQuAD (sesgo hacia textos enciclopedicos en ingles, posible sesgo de genero y geografico).
- Sin benchmarks publicados ni evaluacion independiente: no hay evidencia cuantitativa de mejora frente al base en tareas de QA.
- Licencia Llama 3.1 Community: restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligacion de atribucion y de nombrar el modelo "Llama"), ademas de la clausula de uso aceptable de Meta.
- Repositorio sin descargas ni likes: no hay senales de uso en produccion ni validacion por la comunidad.
- El autor indica que se debe citar el paper original de SQuAD al usar este trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Checkpoint hermano e2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e2
- Checkpoint hermano e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e3
- Checkpoint hermano e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e4
- Checkpoint hermano e5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e5
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper original de SQuAD: no disponible en la informacion proporcionada
- Repositorio Axolotl: no disponible en la informacion proporcionada
- Repositorio PEFT: no disponible en la informacion proporcionada
