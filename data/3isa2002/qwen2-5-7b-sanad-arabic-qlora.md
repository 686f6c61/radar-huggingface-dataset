# 3isa2002/qwen2.5-7b-sanad-arabic-qlora

## Resumen

El modelo `3isa2002/qwen2.5-7b-sanad-arabic-qlora` es un adaptador QLoRA de 4 bits publicado por el desarrollador 3isa2002, obtenido mediante fine-tuning de `Qwen/Qwen2.5-7B-Instruct`. Su propósito es servir de motor de generación para Sanad, un asistente de atención al cliente basado en RAG (generación aumentada por recuperación) bilingüe en árabe egipcio e inglés. El adaptador no es un modelo autónomo: requiere cargar el modelo base Qwen2.5-7B-Instruct y aplicar los pesos PEFT encima.

El problema que aborda es doble. Por un lado, alinea el tono de respuesta al registro del cliente (incluido el caso cruzado de base de conocimiento en inglés con respuesta en árabe egipcio). Por otro, impone un protocolo estricto de citación en línea (`[1]`, `[2]`, ...) vinculado a los fragmentos recuperados y un mecanismo de derivación a humano (`HANDOFF |`) cuando la evidencia recuperada es insuficiente, lo que reduce la alucinación en un contexto de soporte donde la fidelidad factual es crítica.

La relevancia actual del adaptador reside en su tamaño reducido (0,2 GB en el repositorio) frente a los 4.931.917.312 parámetros del modelo base, y en que solo entrena 40.370.176 parámetros (0,8185 % del total). Esto permite desplegarlo sobre una única GPU de consumo moderado conservando las capacidades del Qwen2.5-7B-Instruct subyacente, con una licencia Apache 2.0 heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (QLoRA 4 bits) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 4.931.917.312 en el modelo base; 40.370.176 entrenables en el adaptador (0,8185 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | QLoRA 4 bits con tipo `nf4` y `bnb_4bit_compute_dtype=torch.float16` (segun el ejemplo de uso de la model card) |
| Idiomas soportados | Arabe egipcio e ingles (entrenado explicitamente para ambos; el modelo base soporta mas idiomas, no detallados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parametros. El fine-tuning se realizo con QLoRA de 4 bits, lo que mantiene los pesos del modelo base congelados en cuantizacion NF4 y entrena unicamente los adaptadores de bajo rango, en total 40.370.176 parametros. El entrenamiento se ejecuto en una NVIDIA L4 con un tiempo de 798,3 segundos, y la perdida final de entrenamiento fue 0,7895 frente a una perdida de evaluacion de 0,9168.

No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. Lo que si se documenta es el objetivo de comportamiento: alineacion del tono de soporte al idioma del cliente, anclaje estricto al contexto recuperado con citas en linea y activacion del protocolo `HANDOFF |` ante falta de evidencia. La evaluacion held-out sobre `test.jsonl` con n=45 compara el modelo base con el adaptador y muestra mejoras sustanciales en todas las metricas de formato, citacion y derivacion.

## Capacidades

- Generacion de texto conversacional en arabe egipcio e ingles con tono de atencion al cliente.
- Respuesta cross-lingual: base de conocimiento en ingles con salida en arabe egipcio.
- Anclaje estricto al contexto recuperado (grounding) con citas en linea `[1]`, `[2]`, ... correspondientes a los fragmentos de RAG.
- Protocolo de derivacion a humano `HANDOFF |` cuando los fragmentos recuperados no contienen la evidencia necesaria.
- Cumplimiento estricto de formato de respuesta (95,56 % en evaluacion held-out).
- Coincidencia de idioma con el cliente (100 % en evaluacion held-out).
- Capacidades heredadas del modelo base Qwen2.5-7B-Instruct (razonamiento, codigo, matematicas, tool calling), aunque no se documentan ni evaluan especificamente en este adaptador.
- No se documenta soporte de vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en mercados egipcios: el adaptador responde en arabe egipcio natural manteniendo el tono de soporte, lo que reduce la friccion en conversaciones multi-turno con usuarios que escriben en dialecto.
- Soporte bilingue con base de conocimiento en ingles: permite reutilizar documentacion tecnica en ingles y servir respuestas en arabe egipcio sin duplicar la base de conocimiento, gracias a la capacidad cross-lingual entrenada.
- Sistemas RAG con trazabilidad obligatoria: las citas en linea `[1]`, `[2]` permiten auditar que fragmento sustenta cada afirmacion, util en sectores regulados (finanzas, telecomunicaciones, seguros).
- Reduccion de alucinaciones en produccion: el protocolo `HANDOFF |` deriva a un agente humano cuando no hay evidencia, con una tasa de derivacion falsa del 0 % en la evaluacion held-out, lo que evita escalados innecesarios.
- Despliegue en infraestructura modesta: al ser un adaptador de 0,2 GB sobre un base de 7B en 4 bits, puede servirse en una unica GPU de consumo, adecuado para pymes o entornos con presupuesto limitado.
- Prototipado rapido de asistentes de soporte sectoriales: el patron QLoRA permite reentrenar el adaptador sobre dominios concretos (telecomunicaciones, banca, e-commerce) manteniendo el mismo esquema de citacion y derivacion.
- Evaluacion de pipelines RAG: sirve como referencia para medir la calidad del recuperador, ya que el adaptador penaliza respuestas sin evidencia y expone fallos de recuperacion mediante el protocolo de handoff.

## Benchmarks y rendimiento

Evaluacion held-out sobre `test.jsonl` con n=45, comparando el modelo base Qwen2.5-7B-Instruct con el adaptador Sanad QLoRA:

| Metrica (n=45) | Base Qwen2.5-7B-Instruct | Sanad QLoRA | Delta |
|---|---:|---:|---:|
| Strict End-to-End Pass % | 28,89 % | 93,33 % | +64,44 pp |
| Strict Format Compliance % | 35,56 % | 95,56 % | +60,00 pp |
| Citation Compliance % (grounded) | 77,42 % | 100,00 % | +22,58 pp |
| Exact Citation Match % (grounded) | 67,74 % | 96,77 % | +29,03 pp |
| HANDOFF Overall Accuracy % | 75,56 % | 95,56 % | +20,00 pp |
| HANDOFF Recall % (anti-alucinacion) | 42,86 % | 85,71 % | +42,85 pp |
| HANDOFF Precision % | 66,67 % | 100,00 % | +33,33 pp |
| HANDOFF F1 % | 52,18 % | 92,31 % | +40,13 pp |
| False Handoff Rate % (menor es mejor) | 9,68 % | 0,00 % | -9,68 pp |
| Phantom Citation Rate % (menor es mejor) | 0,00 % | 0,00 % | 0,00 pp |
| Language Match % | 53,33 % | 100,00 % | +46,67 pp |
| Arabic Strict Pass % | 40,91 % | 86,36 % | +45,45 pp |
| English Strict Pass % | 17,39 % | 100,00 % | +82,61 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en 4 bits (NF4) y `device_map="auto"`, se estima un consumo en torno a 5-6 GB de VRAM para los pesos, mas overhead de activaciones y cache KV; el adaptador anade 0,2 GB.
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), A10, A100, H100 para produccion; RTX 4090 y RTX 3090 para desarrollo y despliegue de baja concurrencia.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y tarjetas con 8 GB o mas en cuantizacion 4 bits, siempre que se gestione la cache KV para contextos largos.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` (segun el ejemplo de la model card); para mayor throughput, vLLM o TGI con soporte de adaptadores LoRA; llama.cpp/Ollama requeririan fusionar el adaptador con el modelo base antes de convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; solo se documenta el tiempo de entrenamiento (798,3 s en una L4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3isa2002/qwen2.5-7b-sanad-arabic-qlora | 4.931.917.312 (base) + 40.370.176 (adaptador) | no disponible | Adaptador QLoRA para RAG de soporte en arabe egipcio/ingles | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo base instruct generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptadores QLoRA de dominio publico (genericos) | variable | variable | Fine-tuning de tarea especifica | variable | variable |

No se dispone de datos de benchmarks comparativos con otros adaptadores de soporte en arabe egipcio en la informacion proporcionada. La comparacion mas directa y documentada es contra el modelo base, cuyos resultados se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- El adaptador no es autonomo: requiere cargar `Qwen/Qwen2.5-7B-Instruct` y aplicar los pesos PEFT; no puede usarse como modelo independiente.
- La evaluacion se realizo sobre un conjunto held-out de solo 45 ejemplos, lo que limita la significacion estadistica de las metricas reportadas.
- El rendimiento esta condicionado a la calidad del recuperador RAG: si los fragmentos recuperados son irrelevantes, el modelo derivara a humano (`HANDOFF |`) o respondera con citas incorrectas.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, puede reproducir sesgos presentes en Qwen2.5-7B-Instruct.
- Riesgo de alucinacion: mitigado por el protocolo de handoff y el anclaje al contexto, pero no eliminado; la tasa de citas fantasma reportada es 0 % en el conjunto de evaluacion, no una garantia universal.
- Cobertura idiomatica limitada al arabe egipcio e ingles; no se documenta soporte para otros dialectos arabes (golfo, levantino, magrebi) ni para arabe estandar moderno (MSA) de forma explicita.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene sus propios terminos que deben respetarse.
- El repositorio presenta 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-21), lo que indica ausencia de validacion por parte de la comunidad.
- No se documenta el dataset de entrenamiento, lo que dificulta auditar la procedencia de los datos y posibles sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/3isa2002/qwen2.5-7b-sanad-arabic-qlora
- Repositorio del proyecto Sanad: https://github.com/3isa2002/sanad-support-rag
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
