# E6E831728/ab_ext_binary16

## Resumen

AB-EXT Binary16 es un modelo de lenguaje causal decoder-only de 1.711 millones de parametros entrenado desde cero por el usuario E6E831728 y publicado como modelo base para investigacion sobre representaciones de entrada. Su rasgo distintivo es que no tiene embeddings de entrada entrenables: cada token ID se representa mediante su codigo binario canonico little-endian de 16 bits, repetido 128 veces hasta alcanzar la anchura oculta de 2048. El backbone contextual y la proyeccion de salida (no atada) permanecen entrenables, de modo que el modelo aisla la contribucion del contexto frente a la identidad del token.

El modelo forma parte de una familia controlada de tres variantes (learned-input, binary16 y un recodificado GF2 invertible) que comparten el backbone y la cabeza de salida, pero no el numero total de parametros entrenables. Segun la model card, los resultados respaldan la viabilidad del enfoque, no la equivalencia de rendimiento: las variantes de codigo fijo conservan capacidad sustancial, mientras que la variante con embeddings aprendidos obtiene mejores resultados en varias evaluaciones. El objetivo declarado es de 100.000 millones de tokens de entrenamiento.

Se distribuye para la libreria transformers con codigo personalizado (`custom_code`, `attn_ext`) en formato safetensors, esta entrenado unicamente en ingles y no dispone de licencia declarada. No es un modelo ajustado por instrucciones ni optimizado por preferencias, por lo que no debe usarse como asistente sin un ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (24 bloques), atencion con extension personalizada (`attn_ext`) |
| Parametros totales | 1.711.376.384 entrenables (1.712.162.816 tensores almacenados, incluyendo buffers no entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos distribuidos en FP32; sin cuantizaciones oficiales documentadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 6,8 GB) |
| Modo de entrada | `binary16` (codigo binario little-endian de 16 bits por token) |
| Parametros de entrada entrenables | 0 |
| Parametros de cuerpo entrenables (sin entrada/salida) | 1.610.713.088 |
| Parametros de cabeza de salida no atada | 100.663.296 |
| Valores persistentes de buffer de entrada | 786.432 (codebook 49.152 x 16) |
| Anchura oculta | 2048 |
| Cabezas de atencion | 32 |
| Anchura intermedia de FFN | 8192 |
| Codificacion de posicion | RoPE |
| Normalizacion / activacion | RMSNorm / SwiGLU |
| Tokenizer | `HuggingFaceTB/SmolLM2-1.7B` (revision `effd688a12921b4cc83e3312b6feb579f70f9c71`) |
| Tamano de vocabulario | 49.152 entradas |
| Runs de entrenamiento evaluados | Uno |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal de 24 bloques, anchura oculta 2048, 32 cabezas de atencion y FFN con anchura intermedia 8192, con RoPE como codificacion posicional y RMSNorm/SwiGLU como normalizacion y activacion. La innovacion central reside en la interfaz de entrada: cada token ID `t` se codifica con su representacion binaria little-endian canonica de 16 bits (`c(t)_j = floor(t / 2^j) mod 2`, para `j = 0..15`) y ese vector de 16 bits se repite 128 veces para alcanzar la anchura 2048. No hay proyeccion de entrada entrenable ni embedding de tokens entrenable. La implementacion evaluada almacena el codebook de 49.152 x 16 como buffer persistente no entrenable, por lo que la model card aclara que no es literalmente "libre de lookup": "minimal" se refiere a la anchura fija del codigo de identidad, no al almacenamiento del modelo ni a un codigo de token optimo en entropia.

El entrenamiento se realizo con precision FP32 en los parametros y autocast BF16 en el trainer suministrado, con AdamW (learning rate pico 0.00015, minimo 0.00001, 2000 pasos de warmup, decaimiento coseno, weight decay 0.01, betas 0.9 y 0.95, recorte de gradiente 1.0). La geometria de lanzamiento reportada es de dos GPU por run, microbatch de 8 por GPU, 8 pasos de acumulacion y secuencia de 2048, lo que equivale a 262.144 objetivos de prediccion por paso de optimizador. El presupuesto objetivo fue de 100.000.000.000 objetivos de prediccion (aproximadamente 100B tokens), aunque la model card advierte que el sampler puede repetir o solapar ventanas, de modo que 100B objetivos procesados no implican 100B tokens unicos de corpus, y que los recuentos finales exactos deben obtenerse del checkpoint. Los pesos no se inicializaron a partir de SmolLM2: ese modelo solo aporta los artefactos del tokenizer.

## Capacidades

- Generacion de texto causal en ingles como modelo base (completado de secuencias, no dialogo).
- Modelado de lenguaje a nivel de token con contexto de 2048 tokens.
- Investigacion controlada sobre representaciones de entrada: compara identidades de token fijas frente a embeddings entrenables.
- Backbone y cabeza de salida entrenables, lo que permite fine-tuning experimental sobre el cuerpo del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; solo ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Ajuste por instrucciones o preferencias (RLHF/DPO): no; es un modelo base.

## Casos de uso

- Investigacion sobre representaciones de entrada: el modelo existe especificamente para estudiar si una red contextual compartida puede aprender comportamiento de modelado de lenguaje sin vectores de entrada especificos de token entrenables. Se usaria como la variante `binary16` dentro de la familia controlada.
- Baseline en experimentos controlados de embeddings entrenables frente a fijos: permite comparar, con la misma receta, el modelo learned-input frente a las variantes de codigo fijo binario y GF2.
- Estudio de compresion de tablas de embeddings: al eliminar los parametros de entrada entrenables (0) y sustituirlos por un codebook fijo de 786.432 valores, resulta util para analizar el coste de almacenamiento de la interfaz de entrada en modelos de 1-2B.
- Reproduccion y extension del trabajo asociado (arXiv:2502.02737): sirve como punto de partida para replicar los resultados reportados y variar la anchura del codigo o el esquema de recodificacion.
- Fine-tuning experimental en tareas downstream en ingles: al mantener entrenables el backbone y la cabeza de salida, puede ajustarse para tareas concretas, sabiendo que parte de un rendimiento base bajo.
- Evaluacion de harnesses y pipelines de evaluacion: util para validar flujos de evaluacion zero-shot y few-shot (HellaSwag, ARC, PIQA, MMLU, LAMBADA, WikiText) con los resultados publicados como referencia.
- Analisis de transferencia entre tokenizers y arquitecturas: dado que usa el tokenizer de SmolLM2-1.7B pero no sus pesos, permite estudiar como interactua un vocabulario dado con una interfaz de entrada no entrenable.

## Benchmarks y rendimiento

Resultados transcritos de la evaluacion suministrada por el autor. Las cifras de exactitud son porcentajes; los valores `±` son errores estandar de evaluacion, no variacion entre semillas. Las perplejidades y bits por byte no son porcentajes y se minimizan.

| Metrica | Shots | Resultado |
|---|---:|---:|
| HellaSwag acc (%) | 0 | 40,70 ± 0,49 |
| HellaSwag acc_norm (%) | 0 | 52,40 ± 0,50 |
| ARC-Easy acc (%) | 0 | 67,59 ± 0,96 |
| ARC-Easy acc_norm (%) | 0 | 61,53 ± 1,00 |
| ARC-Challenge acc (%) | 0 | 32,34 ± 1,37 |
| ARC-Challenge acc_norm (%) | 0 | 34,04 ± 1,38 |
| PIQA acc (%) | 0 | 70,51 ± 1,06 |
| PIQA acc_norm (%) | 0 | 71,11 ± 1,06 |
| WinoGrande acc (%) | 0 | 55,33 ± 1,40 |
| OpenBookQA acc (%) | 0 | 28,20 ± 2,01 |
| OpenBookQA acc_norm (%) | 0 | 38,00 ± 2,17 |
| CommonsenseQA acc (%) | 0 | 20,56 ± 1,16 |
| MMLU acc (%) | 0 | 25,88 ± 0,37 |
| MMLU acc (%; algunos prompts truncados) | 5 | 25,57 ± 0,37 |
| LAMBADA accuracy (%) | 0 | 42,75 ± 0,69 |
| LAMBADA perplexity | 0 | 17,91 ± 0,62 |
| WikiText word perplexity | — | 18,58 |
| WikiText byte perplexity | — | 1,73 |
| WikiText bits/byte | — | 0,79 |

Limitaciones de auditoria reportadas: el audit indica multiconjuntos identicos de muestras/prompts entre los seis modelos de cada grupo de tareas completado. En MMLU 5-shot, 1.508 de 56.168 peticiones candidatas de log-verosimilitud se marcaron como truncadas por modelo (aproximadamente el 2,68%), de modo que la puntuacion mostrada incluye prompts truncados. No se reportaron truncamientos en los demas grupos. En el calculo de verosimilitud rodante de WikiText, que los documentos no se trunquen no implica que quepan en un unico contexto del modelo, ya que el windowing rodante forma parte del scoring. La tabla completa de comparacion entre los seis modelos aparece truncada en la informacion disponible; no se reproducen aqui datos no verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,9 GB en FP32 (pesos de 1.711.376.384 parametros a 4 bytes), alrededor de 3,5 GB en FP16/BF16 y cerca de 0,9 GB en cuantizacion de 4 bits. El buffer de entrada anade solo unos 3 MB en FP32.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16/BF16 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para FP32 conviene una GPU con 12 GB o mas; en A100 o H100 el modelo es trivial en memoria.
- Cabe en GPU de consumo: si. Con contexto de solo 2048 tokens, el KV cache es reducido, por lo que una GPU de 8-12 GB es suficiente en FP16.
- Opciones de despliegue: transformers es la via soportada, pero requiere cargar el codigo personalizado (`trust_remote_code`). No se documentan conversiones a GGUF, compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de benchmarks de los modelos alternativos, por lo que la comparacion se limita a parametros, contexto y licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AB-EXT Binary16 | 1,711B entrenables | 2048 | no disponible | HuggingFace (transformers, codigo personalizado) |
| SmolLM2-1.7B | 1,7B | 8192 | Apache-2.0 | HuggingFace (origen del tokenizer de AB-EXT) |
| Qwen2.5-1.5B | 1,54B | 32768 | Apache-2.0 | HuggingFace |
| Llama-3.2-1B | 1,24B | 128.000 | Llama 3.2 Community License | HuggingFace |

La comparacion de rendimiento frente a estas alternativas no es posible con la informacion proporcionada: solo se dispone de los resultados de AB-EXT Binary16. La diferencia estructural clave es que AB-EXT Binary16 carece de embeddings de entrada entrenables y su contexto de entrenamiento es de 2048 tokens, inferior al de las alternativas listadas.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por preferencias; no debe emplearse directamente como asistente conversacional.
- Rendimiento sustancialmente inferior al de modelos de tamano similar con embeddings aprendidos: MMLU 0-shot de 25,88% y CommonsenseQA de 20,56% estan lejos de lo esperable en modelos de 1-2B entrenados de forma convencional. La model card lo enmarca explicitamente como viabilidad, no como equivalencia de rendimiento.
- Contexto de entrenamiento limitado a 2048 tokens; no se documenta extension de contexto en inferencia.
- Solo ingles; no hay soporte multilingue declarado.
- Riesgo de alucinacion: al ser un modelo base entrenado sobre aproximadamente 100B objetivos de prediccion, genera continuaciones plausibles sin garantia de veracidad, especialmente fuera de dominio.
- Sesgos conocidos: la model card no documenta analisis de sesgo ni composicion del corpus de entrenamiento, por lo que se desconocen los sesgos presentes en los datos.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Requiere cargar codigo personalizado (`custom_code`, `attn_ext`), lo que implica ejecutar codigo del repositorio y complica su integracion en stacks estandar.
- El presupuesto de 100B objetivos de prediccion no equivale a 100B tokens unicos: el sampler puede repetir o solapar ventanas, y el trainer original no restaura completamente el estado de muestreo por rango al reanudar.
- La puntuacion de MMLU 5-shot incluye prompts truncados (1.508 de 56.168 peticiones candidatas), por lo que no es directamente comparable con resultados que no reportan truncamientos.
- El recuento de tensores almacenados (1.712.162.816) incluye buffers y no debe confundirse con el numero de parametros entrenables (1.711.376.384).
- Sin resultados publicados de latencia, throughput ni compatibilidad con motores de inferencia optimizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/E6E831728/ab_ext_binary16
- Paper asociado (referencia arXiv:2502.02737): https://arxiv.org/abs/2502.02737
- Tokenizer de origen, SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
