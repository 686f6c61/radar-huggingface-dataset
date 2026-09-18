# Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_finetuned_keep_0p80

## Resumen

Este modelo es una variante comprimida y posteriormente recuperada de `meta-llama/Llama-2-7b-chat-hf`, publicada por el usuario Jeesup. La compresion se realiza con la tecnica Basis Sharing (del repositorio TUDa-HWAI/Basis_Sharing), que elimina el 20 % de los parametros y conserva una fraccion realizada de 0,7998198672279793. Tras la compresion, el autor aplica un LoRA unicamente sobre los coeficientes factorizados, manteniendo congeladas las bases compartidas y por capa, y despues pliega el resultado a tensores densos con las formas originales de Llama.

El interes de esta ficha no es la utilidad general del modelo, sino que se trata de una celda de un estudio comparativo sobre compresion y seguridad. La model card declara explicitamente que la compresion a este ratio degrada el comportamiento de rechazo, y que las metricas de seguridad de un modelo degenerado no deben interpretarse como evidencia sobre alineamiento. Los resultados publicados incluyen perplejidad en WikiText-2, seis tareas zero-shot, y tasas de ataque exitoso (ASR) y de sobrerrechazo.

Arquitectura y tamano: transformer decoder-only denso de 6.738.415.616 parametros (heredado de Llama 2 7B-chat), con los pesos plegados a formas densas estandar, de modo que carga con `transformers` sin codigo de modelado personalizado. Es relevante ahora porque ejemplifica una linea de investigacion activa: medir si las tecnicas de compresion de bajo rango preservan o destruyen el comportamiento de seguridad y de rechazo de un modelo alineado. El repositorio ocupa 13,5 GB: el modelo es deficiente en rango, pero no mas pequeno en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 2), con pesos reconstruidos desde una factorizacion Basis Sharing plegada a denso |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (configuracion de Llama 2, heredada del modelo base; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (pesos densos en safetensors; no se publican variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible (el modelo base Llama 2-chat esta orientado principalmente a ingles) |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Fraccion de parametros retenida | 0,7998 (20 % de parametros eliminados) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tamano del repositorio | 13,5 GB |
| Metodo de compresion | Basis Sharing, con SVD blanqueada por grupo |
| Metodo de recuperacion | LoRA sobre coeficientes (r=8, alpha=16), bases congeladas |

## Arquitectura y entrenamiento

La compresion sigue el pipeline de Basis Sharing: los pesos de tipos concretos se concatenan horizontalmente por grupos de 2 capas adyacentes y se les aplica una SVD blanqueada para obtener una base compartida por grupo. Los tipos compartidos son `v`, `k`, `q`, `up` y `gate`; los tipos `down` y `o` permanecen privados por capa. La calibracion usa 256 secuencias de WikiText-2 de 2048 tokens con semilla 42 (el codigo original fija la semilla 2023, pero este proyecto calibra todos los metodos con una unica semilla).

La recuperacion es un LoRA de rango 8 y alpha 16, entrenado 2 epocas con learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned`. Solo se entrenan los coeficientes: las bases compartidas y por capa quedan congeladas y son bit a bit identicas a las del modelo comprimido, de modo que cada peso mantiene rango <= k, cada grupo sigue compartiendo una sola base y el presupuesto de parametros sobrevive intacto a la recuperacion. La combinacion final es `C' = C + (alpha/r)BA` y el plegado `W = C' @ B` a denso. No se usa la receta LoRA propia de Basis Sharing (wikitext, batch 1, solo q/v), sino la receta alpaca del proyecto, para que los datos de recuperacion sean constantes entre compresores.

Un detalle tecnico relevante es el tratamiento de los embeddings rotatorios: el LoRA entrena la variante factorizada `ShareLlama`, por lo que su codificacion posicional importa. El autor usa las tablas rotatorias propias de `transformers` construidas a partir de la config del modelo, verificadas como identicas a Llama estandar en float64 para RoPE base 1e4, 5e5 y 1e6, escalado llama3, atencion con query agrupada y sesgos en q/k/v.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat de Llama 2 y decodificacion greedy en toda la evaluacion publicada.
- Respuesta a tareas de conocimiento general y sentido comun: el autor reporta resultados zero-shot en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA.
- Modelado de lenguaje medido por perplejidad en WikiText-2 (8,2287).
- Comportamiento de rechazo ante peticiones daninas, medido con ASR sobre AdvBench y StrongREJECT con juicio de `cais/HarmBench-Llama-2-13b-cls`.
- Comportamiento de sobrerrechazo ante peticiones benignas, medido sobre XSTest-safe y OR-Bench-Hard-1K con juicio de `allenai/wildguard`.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documentan.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre compresion y alineamiento: usar esta celda como punto de medida del efecto de eliminar el 20 % de parametros sobre el ASR y el sobrerrechazo, comparandola con el modelo base sin comprimir y con otras tecnicas de compresion bajo la misma receta de recuperacion.
- Estudio de sobrerrechazo en modelos comprimidos: la tasa de sobrerrechazo en XSTest-safe (0,3320) y OR-Bench-Hard-1K (0,4761) permite analizar como la compresion desplaza la frontera entre rechazo correcto y rechazo excesivo en peticiones benignas.
- Reproducibilidad de pipelines de evaluacion de seguridad: el repositorio incluye salidas por prompt y ficheros de metricas crudas en `utility/` y `safety/`, por lo que sirve para validar arneses de evaluacion que usen HarmBench-Llama-2-13b-cls y WildGuard como jueces.
- Baseline en estudios de compresion de bajo rango: al ser un Llama 2 7B-chat plegado a formas densas, carga con `transformers` estandar y puede compararse directamente contra otros compresores sin adaptar el codigo de inferencia.
- Analisis de deficiencia de rango: util para estudiar en que medida un modelo con pesos de rango limitado (cada peso con rango <= k y bases compartidas por grupos de 2 capas) conserva capacidades funcionales pese a no reducir su huella en disco.
- Pruebas de regresion de plantillas de chat y RoPE: la verificacion de tablas rotatorias frente a Llama estandar permite usar el modelo como caso de prueba de implementaciones que deban respetar exactamente la codificacion posicional original.
- Docencia y divulgacion tecnica: ejemplo completo y trazable de un pipeline (SVD blanqueada, congelacion de bases, LoRA sobre coeficientes, plegado a denso) con hiperparametros y calibracion documentados.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,7998 |
| Perplejidad en WikiText-2 | 8,2287 |
| ARC-Easy (acc_norm) | 0,6301 |
| ARC-Challenge (acc_norm) | 0,4061 |
| HellaSwag (acc_norm) | 0,6881 |
| WinoGrande (acc) | 0,6622 |
| OpenBookQA (acc_norm) | 0,4080 |
| PIQA (acc_norm) | 0,7383 |
| MathQA (acc_norm) | 0,2620 |
| AdvBench HarmBench ASR | 0,0058 |
| StrongREJECT HarmBench ASR | 0,0160 |
| Sobrerrechazo (XSTest-safe) | 0,3320 |
| Sobrerrechazo (OR-Bench-Hard-1K) | 0,4761 |
| Sobrerrechazo macro | 0,4041 |

Detalles de evaluacion segun el autor: perplejidad en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; generacion de AdvBench y StrongREJECT juzgada por `cais/HarmBench-Llama-2-13b-cls`; sobrerrechazo en XSTest-safe y OR-Bench-Hard-1K juzgado por `allenai/wildguard`; toda la generacion con plantilla de chat y decodificacion greedy. El autor indica que el juicio de sobrerrechazo es fiable para esta celda (fraccion puntuada de 1,00 tanto en XSTest-safe como en OR-Bench-Hard-1K).

No se proporcionan resultados de benchmarks para modelos comparables, por lo que no es posible calcular deltas frente a Llama-2-7b-chat sin comprimir ni frente a otras tecnicas de compresion con la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas KV cache y activaciones. Con 4096 tokens de contexto y batch pequeno, el consumo realista se situa en torno a 15-17 GB.
- VRAM estimada en int8: aproximadamente 7-8 GB para pesos, mas overhead de inferencia.
- VRAM estimada en int4: aproximadamente 3,5-4,5 GB para pesos, mas overhead.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100, L40S sobradas para fp16 a contexto completo y batches moderados.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en fp16 con contexto completo y margen; en RTX 3090 (24 GB) de forma similar; en GPUs de 12-16 GB (RTX 4080, 4070 Ti Super, 3080 Ti) es viable en fp16 solo con contexto reducido o cuantizacion, y en int4 cabe en GPUs de 8 GB con contexto limitado.
- Opciones de despliegue: al ser pesos densos compatibles con Llama 2 estandar, se puede servir con vLLM, TGI, Hugging Face `transformers`, Ollama o llama.cpp; para estos dos ultimos seria necesario convertir los safetensors a GGUF, conversion que no se publica en el repositorio.
- Latencia y throughput: no disponible; el autor no publica mediciones de velocidad ni de tokens por segundo.
- Nota importante: el modelo no ocupa menos disco que Llama 2 7B-chat (13,5 GB) porque los factores se pliegan a tensores densos; el beneficio es de rango efectivo, no de tamano de almacenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este modelo (Basis Sharing, keep 0,80) | 6.738.415.616 (fraccion retenida 0,7998, sin reduccion en disco) | 4096 tokens (heredado del base) | llama2 | HuggingFace, safetensors, sin codigo de modelado personalizado | Perplejidad WikiText-2 8,2287; media zero-shot en las 6 tareas reportadas en torno a 0,52; ASR muy bajo con sobrerrechazo alto |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 tokens | llama2 | HuggingFace, safetensors | No disponible en la informacion proporcionada |
| Otras celdas de compresion del mismo estudio (Basis Sharing con otros ratios u otros compresores) | no disponible | 4096 tokens (heredado) | llama2 (previsiblemente) | no disponible en esta busqueda | No disponible en la informacion proporcionada |
| Mistral-7B-Instruct-v0.2 o similares de 7B | no disponible en la informacion proporcionada | no disponible | Apache 2.0 (segun el modelo, no confirmado aqui) | HuggingFace | No disponible en la informacion proporcionada |

Conclusiones de la comparativa: no es posible establecer deltas cuantitativos frente a Llama-2-7b-chat sin comprimir ni frente a alternativas de 7B porque la informacion proporcionada solo incluye las metricas de este modelo. La diferencia estructural documentada es que este modelo conserva el mismo numero de parametros que el base (no hay reduccion de disco), pero con restricciones de rango y bases compartidas por grupos de 2 capas.

## Limitaciones y advertencias

- La model card advierte explicitamente de que la compresion a este ratio degrada el comportamiento de rechazo, y que las metricas de seguridad de un modelo degenerado no constituyen evidencia sobre alineamiento. Cualquier lectura de los valores de ASR debe hacerse junto a la linea de fiabilidad del juicio de sobrerrechazo.
- Sobrerrechazo elevado: 0,3320 en XSTest-safe, 0,4761 en OR-Bench-Hard-1K y 0,4041 en la macro, lo que implica que el modelo rechaza una fraccion sustancial de peticiones benignas.
- Riesgo de alucinacion: no se documenta de forma especifica; el modelo hereda el comportamiento del base Llama-2-7b-chat, pero no hay mediciones de veracidad en la informacion disponible.
- Sesgos conocidos: no disponibles; no se publica ninguna evaluacion de sesgo.
- Limitaciones de contexto e idioma: contexto de 4096 tokens y ausencia de datos sobre cobertura multilingue; el base esta orientado principalmente a ingles.
- Licencia llama2: el uso esta sujeto a la licencia de Llama 2, con las restricciones de la licencia comunitaria de Meta (incluidas clausulas de uso aceptable y requisitos de atribucion); conviene revisar los terminos antes de cualquier uso comercial.
- Trazabilidad de la evaluacion: los resultados son de un unico estudio y con una unica semilla de calibracion, por lo que no deben tratarse como valores robustos ante variaciones de semilla o de receta de recuperacion.
- Naturaleza del artefacto: es una celda de investigacion con 12 descargas y 0 likes en el momento de la consulta; no hay senales de uso en produccion ni mantenimiento posterior.
- El modelo es deficiente en rango, pero no mas pequeno en disco, asi que no aporta ventajas de memoria o almacenamiento frente a Llama 2 7B-chat sin un paso adicional de cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_finetuned_keep_0p80
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de Basis Sharing: https://github.com/TUDa-HWAI/Basis_Sharing (commit `1c021b6ce1d3`)
- Dataset de recuperacion: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Juez de seguridad citado: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobrerrechazo citado: https://huggingface.co/allenai/wildguard
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces obtenidos correspondian a contenidos sin relacion (hipotecas con cuenta de compensacion) y se han descartado.
