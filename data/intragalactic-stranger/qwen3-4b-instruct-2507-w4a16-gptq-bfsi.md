# intragalactic-stranger/Qwen3-4B-Instruct-2507-W4A16-GPTQ-BFSI

## Resumen

Qwen3-4B-Instruct-2507-W4A16-GPTQ-BFSI es una cuantizacion GPTQ de 4 bits (pesos int4, activaciones en 16 bits) del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario intragalactic-stranger como artefacto de investigacion dentro del proyecto Cortex Serve (hito M3). El modelo base es un transformer denso de 4.022.468.096 parametros con licencia Apache-2.0, orientado a instrucciones y conversacion.

La particularidad de esta variante no es la cuantizacion en si, sino el conjunto de calibracion: en lugar de usar datos genericos, se calibro exclusivamente sobre los titulos 12 y 17 del eCFR (regulacion financiera estadounidense: banca y valores), usando 512 muestras de 2048 tokens del dataset Azzindani/US_Regulation_ECFR_20260101. El objetivo declarado es reducir el dano de perplejidad en dominio financiero a costa de degradar el seguimiento de formato general.

Es relevante ahora porque ejemplifica un patron util para equipos que despliegan modelos pequenos en dominios regulados: cuantizar con calibracion especifica del dominio mejora la perplejidad in-domain (+3,0% frente a +7,3% con calibracion generica), pero introduce regresiones medibles en tareas de formato estricto (GSM8K estricto cae 38,4 puntos). El autor lo etiqueta explicitamente como artefacto de investigacion, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), cuantizado con GPTQ int4 (W4A16) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ int4, grupo 128, simetrico, actorder estatico (W4A16); solo se publica esta variante |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3-4B-Instruct-2507) |
| Formato de pesos | safetensors (compressed-tensors); tamano en disco 2,48 GiB (repo 2,7 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3 en su revision Instruct-2507 (commit `cdbee75f`), con 4.022 millones de parametros. Sobre ese checkpoint se aplico cuantizacion post-entrenamiento GPTQ a pesos int4 con grupo de 128, simetria y actorder estatico, manteniendo activaciones en 16 bits (esquema W4A16). El proceso se ejecuto con llmcompressor 0.15.0 y compressed-tensors 0.20.1 sobre torch 2.14.1 y transformers 5.21.0, en una GPU L4 durante 698 segundos.

La innovacion tecnica es el dataset de calibracion: 512 muestras de 2048 tokens extraidas de los titulos 12 y 17 del eCFR (digest de sample-id `4257b9acdf26e457`), en lugar de una mezcla generica de chat. Segun el autor, esto reduce el incremento de perplejidad in-domain del +7,3% (calibracion generica) al +3,0%, pero degrada el seguimiento de formato: solo el 45% de las respuestas GSM8K conservan el formato `#### N`, frente al 80% de la variante generica. No se documenta en la informacion disponible si el modelo base recibio RLHF/DPO ni el volumen de tokens de preentrenamiento.

## Capacidades

- Generacion de texto y respuesta a instrucciones conversacionales, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento aritmetico y resolucion de problemas matematicos, aunque con extraccion flexible: GSM8K flexible alcanza 75,6 frente a 78,8 en bf16.
- Comprension lectora y conocimiento general (ARC-Challenge, HellaSwag, MMLU-Pro) con degradacion moderada respecto a bf16.
- Seguimiento de instrucciones con formato (IFEval) al 79,5% en prompt-level estricto, 3,9 puntos por debajo de bf16.
- Procesamiento de texto especializado en dominio regulatorio financiero estadounidense (banca y valores), donde la perplejidad retenida es de 6,143.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta variante cuantizada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles; el modelo base es solo texto.

## Casos de uso

- Analisis de documentacion regulatoria financiera: el modelo se calibro sobre eCFR titulos 12 y 17, por lo que su perplejidad en ese dominio (6,143) es la mas baja de las variantes publicadas; adecuado para resumir, clasificar o extraer clausulas de textos bancarios y de valores.
- Despliegue en GPU de gama baja para prototipos: con 2,48 GiB en disco y esquema W4A16, cabe en tarjetas consumer y permite iterar sobre pipelines de compliance sin infraestructura dedicada.
- Servicio de inferencia con vLLM: el autor documenta el comando `vllm serve` y el formato compressed-tensors es compatible con vLLM 0.32.0, lo que facilita integrarlo en stacks existentes.
- Generacion de borradores de respuestas a consultas internas sobre normativa: el modelo mantiene conocimiento general (ARC-Challenge 58,7, HellaSwag 57,6) suficiente para conversacion de soporte en el dominio.
- Evaluacion comparativa de recetas de cuantizacion: sirve como referencia reproducible (config y manifest publicados) para medir el impacto de calibracion por dominio frente a calibracion generica.
- Filtrado y etiquetado de corpus regulatorios: la baja perplejidad in-domain lo hace util para scoring de calidad de documentos antes de entrenar otros modelos.
- Tareas de matematicas o formato estricto en produccion: no recomendado, dado que GSM8K estricto cae a 34,3 y solo el 45% de las respuestas respetan el formato `#### N`.

## Benchmarks y rendimiento

Resultados publicados por el autor, servidos con vLLM 0.32.0 y evaluados con lm-evaluation-harness 0.4.13 (intervalos de confianza al 95%):

| Benchmark | Este modelo | bf16 | Delta |
|---|---|---|---|
| ARC-Challenge (acc_norm, 1.172) | 58,7 ±2,8 | 58,3 | +0,4 |
| HellaSwag (acc_norm, primeros 2.000) | 57,6 ±2,2 | 58,5 | -0,9 |
| MMLU-Pro (logprob MC, primeros 1.000) | 31,7 ±2,9 | 34,5 | -2,8 |
| GSM8K 5-shot (estricto) | 34,3 ±2,6 | 72,8 | -38,4 |
| GSM8K 5-shot (extraccion flexible) | 75,6 ±2,3 | 78,8 | -3,2 |
| IFEval (prompt-level estricto) | 79,5 ±3,4 | 83,4 | -3,9 |
| WikiText-2 word perplexity (menor es mejor) | 15,454 | 14,266 | +8,3% |
| Perplejidad en regulacion financiera US retenida (menor es mejor) | 6,143 | 5,965 | +3,0% |

No se han publicado datos de velocidad (throughput ni latencia) para este artefacto; el autor indica que no se midieron.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 a 3,5 GiB para pesos int4 mas overhead de activaciones KV; el repo ocupa 2,48 GiB en disco.
- GPU recomendadas: cualquier GPU con al menos 8 GiB de VRAM; el autor calibro en una NVIDIA L4 (24 GiB), y el modelo es holgado en A100, H100, L40S o RTX 4090.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs de 8 GB con margen para contexto corto.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors, comando documentado por el autor). Otros runners como llama.cpp, Ollama o TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput: no medidos para este artefacto; el autor senala que la velocidad es identica a la release GPTQ generica por compartir formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-W4A16-GPTQ-BFSI (este) | 4,02 B | no disponible | Apache-2.0 | safetensors int4 GPTQ | Calibrado solo en regulacion financiera US; GSM8K estricto 34,3 |
| Qwen/Qwen3-4B-Instruct-2507 (bf16) | 4,02 B | no disponible | Apache-2.0 | safetensors bf16 | Referencia de calidad; GSM8K estricto 72,8, IFEval 83,4 |
| Variante GPTQ generica del mismo autor | 4,02 B | no disponible | Apache-2.0 | safetensors int4 GPTQ | Calibracion general; +7,3% perplejidad in-domain, 80% formato GSM8K |

No se dispone de datos publicados en la informacion proporcionada para comparar con otras familias de modelos del mismo tamano (por ejemplo, Llama 3.2 3B o Gemma 3 4B); se indica como no disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor lo describe como no apto para proposito general; la calibracion exclusiva en dominio financiero degrada el comportamiento fuera de el.
- Regresion severa en formato estricto: GSM8K estricto cae 38,4 puntos porque solo el 45% de las respuestas conservan el formato `#### N`; cualquier pipeline que dependa de ese formato fallara.
- Perplejidad general degradada: WikiText-2 sube un 8,3% respecto a bf16, con impacto en la calidad de texto fuera del dominio regulatorio.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion; el modelo hereda los sesgos del base Qwen3-4B-Instruct-2507, no documentados en esta ficha.
- Idiomas: no se especifican los idiomas soportados para esta variante; asumir solo ingles con seguridad es lo prudente dado el corpus de calibracion.
- Contexto: la longitud de contexto no se documenta en la informacion proporcionada; verificar en la model card del modelo base antes de usarlo con ventanas largas.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo no ha pasado auditorias de seguridad.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de los resultados.
- Sin datos de velocidad: no hay mediciones de latencia ni throughput, por lo que el dimensionado de produccion requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intragalactic-stranger/Qwen3-4B-Instruct-2507-W4A16-GPTQ-BFSI
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto Cortex Serve: https://github.com/intragalactic-stranger/cortex
- Commit de origen de la receta: https://github.com/intragalactic-stranger/cortex/commit/77b83aec886c97c4875fa4ab458e4ec5c75fff23
- Dataset de calibracion: https://huggingface.co/datasets/Azzindani/US_Regulation_ECFR_20260101
- Resultados completos: `serve/RESULTS.md` seccion M3 en el repositorio de Cortex
