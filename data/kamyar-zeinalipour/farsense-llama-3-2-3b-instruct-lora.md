# Kamyar-zeinalipour/FarSense-Llama-3.2-3B-Instruct-LoRA

## Resumen

FarSense-Llama-3.2-3B-Instruct-LoRA es un adaptador LoRA (PEFT) que ensena a Llama-3.2-3B-Instruct a resolver tareas de razonamiento de sentido comun anclado en contexto en farsi (persa). Lo desarrolla Kamyar Zeinalipour como parte del paper *FarSense: A Comprehensive Commonsense Benchmark and Evaluation Framework for the Farsi Language*, presentado en IJCNLP-AACL 2025. El adaptador se entrena sobre el split de entrenamiento del benchmark FarSense (dataset CS_Farsi), que plantea escenarios cotidianos en farsi y exige una unica respuesta en JSON: juicios verdadero/falso, eleccion multiple, completado de huecos (cloze), causa→efecto, contrafactuales y preguntas de tipo "por que".

El modelo base es Llama-3.2-3B-Instruct (3.000 millones de parametros, transformer decoder-only denso con atencion por grupos de consultas y ventana de contexto de 128.000 tokens). El adaptador no modifica la arquitectura: aplica LoRA con rango 128 y alpha 256 sobre las proyecciones q/k/v/o, gate/up/down y tambien sobre `embed_tokens` y `lm_head`, lo que explica el tamano del repositorio (2,0 GB) frente a un LoRA convencional de este tamano.

Su relevancia es doble: por un lado es un recurso concreto y reproducible para mejorar el razonamiento de sentido comun en persa, un idioma con escasa cobertura en benchmarks de este tipo; por otro, forma parte de una familia de seis adaptadores (1B, 3B y 8B) publicados junto al benchmark, lo que permite comparar el efecto del fine-tuning segun el tamano del modelo base. El adaptador mejora la puntuacion global de 0,449 a 0,529 en el split de test de FarSense (+0,081).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-3B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 3B (modelo base); adaptador LoRA con rango 128 sobre q/k/v/o, gate/up/down, `embed_tokens` y `lm_head` (2,0 GB en repo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | farsi (persa); el modelo base soporta ademas ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.2-3B-Instruct, un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion por grupos de consultas (GQA). El fine-tuning emplea LoRA con rango r = 128, alpha = 256 y dropout 0,1, aplicado no solo a las proyecciones de atencion y MLP (q/k/v/o, gate/up/down) sino tambien a `embed_tokens` y `lm_head`; PEFT almacena estas dos ultimas capas junto al adaptador, de ahi que el repositorio ocupe 2,0 GB.

Los datos de entrenamiento son el split de entrenamiento de FarSense (CS_Farsi): 4.000 escenarios y 28.000 items en farsi. El regimen es de 3 epocas con AdamW, learning rate 1e-4, decaimiento coseno sin warm-up, weight decay 1e-4, batch de 4 secuencias por GPU con 2 pasos de acumulacion de gradiente y empaquetado a 2.048 tokens. Se entreno en bf16 con DeepSpeed ZeRO-3, Flash Attention 2 y recorte de gradiente 1,0, semilla 100, sobre 3 GPU NVIDIA RTX A6000 (48 GB) durante 2 horas y 1 minuto. No se menciona RLHF ni DPO; el ajuste es supervisado sobre pares prompt/respuesta del benchmark. La evaluacion usa decodificacion con temperatura 0,8, top-p 0,95, top-k 50, penalizacion de repeticion 1,1 y un maximo de 256 tokens nuevos.

## Capacidades

- Razonamiento de sentido comun en farsi anclado en contexto: juicios verdadero/falso, eleccion multiple, completado de huecos (cloze), causa→efecto, contrafactuales y explicaciones de tipo "por que".
- Generacion de respuestas estructuradas en JSON, tal como exige el formato de evaluacion de FarSense.
- Generacion de texto en farsi (persa) con el estilo instructivo heredado del modelo base.
- Capacidades generales del modelo base Llama-3.2-3B-Instruct: generacion de texto, razonamiento basico, codigo y matematicas elementales, y soporte de tool calling segun la plantilla de chat de Llama 3.2.
- Capacidades multilingues limitadas al modelo base (farsi como idioma objetivo del adaptador; ingles y otros idiomas europeos e hindi/tailandes en el base).
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Evaluacion de razonamiento en persa: usar el adaptador como referencia para medir la mejora de modelos Llama-3.2-3B en tareas de sentido comun en farsi dentro de pipelines de evaluacion academicos, con las mismas metricas del paper (exact match y puntuaciones de texto).
- Investigacion comparativa de tamano de modelo: junto a los adaptadores FarSense 1B y 8B, permite estudiar como escala el efecto del fine-tuning LoRA en razonamiento de sentido comun segun el tamano del modelo base.
- Sistemas de preguntas y respuestas en farsi sobre escenarios cotidianos: el adaptador responde a preguntas de causa→efecto y contrafactuales en formato JSON, adecuado para integrarse en backends que necesiten respuestas estructuradas y verificables.
- Generacion de datos sinteticos de razonamiento en persa: el modelo puede producir explicaciones y respuestas de referencia para aumentar datasets de entrenamiento en farsi, con revision humana posterior dado el riesgo de alucinacion.
- Prototipado de asistentes conversacionales en persa: con 3B parametros y contexto de 128.000 tokens del base, puede desplegarse en hardware modesto para demos de atencion al cliente o tutoria en farsi, siempre que el dominio se limite a tareas de sentido comun.
- Educacion y evaluacion automatica: correccion de ejercicios de logica cotidiana o comprension en farsi comparando la salida JSON del modelo con la respuesta de referencia del dataset CS_Farsi.
- Clasificacion de enunciados (verdadero/falso, eleccion multiple) en farsi: el adaptador alcanza 0,929 de exactitud en T/F-True y 0,990 en eleccion multiple, lo que lo hace util como clasificador ligero en pipelines de moderacion o filtrado de contenido en persa.

## Benchmarks y rendimiento

Resultados en el split de test de FarSense (1.470 items, 210 escenarios), comparando el modelo base en zero-shot con el adaptador FarSense:

| Metrica | Base (zero-shot) | FarSense LoRA | Delta |
|---|---:|---:|---:|
| T/F-True accuracy | 0,476 | 0,929 | +0,452 |
| T/F-False accuracy | 0,981 | 0,862 | -0,119 |
| Multiple-choice accuracy | 0,862 | 0,990 | +0,129 |
| Cloze accuracy | 0,052 | 0,148 | +0,095 |
| Cause→Effect (text score) | 0,256 | 0,353 | +0,097 |
| Counterfactual (text score) | 0,296 | 0,366 | +0,070 |
| Explanation (text score) | 0,342 | 0,184 | -0,159 |
| Cloze (text score) | 0,325 | 0,404 | +0,079 |
| Classification | 0,593 | 0,732 | +0,139 |
| Free-form | 0,305 | 0,326 | +0,022 |
| Overall | 0,449 | 0,529 | +0,081 |

Las exactitudes son exact match; las puntuaciones de texto promedian BLEU-4, ROUGE-L F1, BERTScore F1 y similitud coseno de embeddings. *Classification* promedia las cuatro exactitudes, *Free-form* las cuatro puntuaciones de texto y *Overall* ambas.

Comparativa dentro de la familia FarSense (puntuacion global base → fine-tuned):

| Modelo base | Parametros | Overall (base → fine-tuned) |
|---|---:|---:|
| Llama-3.2-1B-Instruct | 1B | 0,227 → 0,450 |
| Llama-3.2-3B-Instruct (este adaptador) | 3B | 0,449 → 0,529 |
| Llama-3.1-8B-Instruct | 8B | no disponible (adaptador listado en la familia, sin cifra en la informacion proporcionada) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 requiere aproximadamente 6-7 GB de VRAM; en cuantizacion de 8 bits, unos 3-4 GB; en 4 bits, unos 2-3 GB. El adaptador anadido ocupa 2,0 GB adicionales en el repositorio, aunque puede fusionarse con el base (`merge_and_unload()`) para no anadir overhead en inferencia.
- GPU recomendadas: NVIDIA RTX A6000 (48 GB) fue la usada para el entrenamiento con 3 unidades; para inferencia bastan GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) en bf16 o cuantizado.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB de VRAM en bf16/fp16 y en tarjetas con 4-6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers + PEFT (recomendado por el autor, con `merge_and_unload()`), vLLM, TGI, llama.cpp/Ollama (previa conversion del modelo fusionado a GGUF), y DeepSpeed para entrenamiento.
- Latencia y throughput: no disponible en la informacion proporcionada; el entrenamiento completo requirio 2 h 01 min en 3 x RTX A6000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall FarSense | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| FarSense-Llama-3.2-3B-Instruct-LoRA (este) | 3B | 128.000 | 0,529 | llama3.2 | Hugging Face (adaptador PEFT) |
| Llama-3.2-3B-Instruct (base, zero-shot) | 3B | 128.000 | 0,449 | llama3.2 | Hugging Face (gated) |
| FarSense-Llama-3.2-1B-Instruct-LoRA | 1B | 128.000 | 0,450 | llama3.2 | Hugging Face (adaptador PEFT) |
| FarSense-Llama-3.1-8B-Instruct-LoRA | 8B | 128.000 | no disponible | llama3.2 | Hugging Face (adaptador PEFT) |

La comparacion se limita a la familia FarSense y al modelo base, ya que no se proporcionan datos de benchmarks de otros modelos de razonamiento en farsi en la informacion disponible.

## Limitaciones y advertencias

- El adaptador esta especializado en el benchmark FarSense y su formato JSON; su rendimiento fuera de ese dominio (razonamiento general en farsi o en otros idiomas) no esta documentado y puede degradarse.
- La puntuacion de explicacion (Explanation) empeora con el fine-tuning (0,342 → 0,184) y la exactitud en T/F-False cae de 0,981 a 0,862: el adaptador gana en clasificacion pero pierde calidad en respuestas libres y en la deteccion de enunciados falsos.
- Riesgo de alucinacion inherente a un modelo de 3B; en tareas de sentido comun abierto puede generar respuestas plausibles pero incorrectas, especialmente en explicaciones largas.
- Cobertura limitada a farsi como idioma objetivo; el modelo base soporta otros idiomas, pero el adaptador puede sesgar la salida hacia el persa o degradar el rendimiento multilingue.
- Licencia llama3.2: el uso comercial esta sujeto a la Llama 3.2 Community License, con restricciones para empresas con mas de 700 millones de usuarios mensuales y obligaciones de atribucion; el modelo base esta gated y requiere aceptar sus terminos en Hugging Face.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente fuera del paper.
- No se documentan sesgos especificos del adaptador; los sesgos del modelo base (datos web en ingles mayoritariamente) pueden persistir en las respuestas en farsi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-3B-Instruct-LoRA
- Paper (IJCNLP-AACL 2025): https://aclanthology.org/2025.ijcnlp-long.187/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/FarSense
- Dataset CS_Farsi: https://huggingface.co/datasets/Kamyar-zeinalipour/CS_Farsi
- Coleccion FarSense: https://huggingface.co/collections/Kamyar-zeinalipour/farsense-ijcnlp-aacl-2025-6af4553f756c4d246fe7f56c
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Adaptador FarSense 1B: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-1B-Instruct-LoRA
- Adaptador FarSense 8B: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.1-8B-Instruct-LoRA
