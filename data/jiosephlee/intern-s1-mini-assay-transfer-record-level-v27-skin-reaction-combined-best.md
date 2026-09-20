# jiosephlee/intern-s1-mini-assay-transfer-record-level-v27-skin-reaction-combined-best

## Resumen

Intern-S1-mini: Skin Reaction record-level assay transfer V27 es un ajuste fino de dominio completo del modelo base jiosephlee/Intern-S1-mini-lm, publicado por el usuario jiosephlee. No es un modelo de lenguaje de proposito general: esta entrenado especificamente para puntuar prompts de transferencia de ensayo (assay transfer) en formato A/B, es decir, para ordenar compuestos segun su probabilidad de desencadenar una reaccion cutanea dentro de un conjunto de datos concreto. El repositorio contiene el tokenizer, los pesos y un fichero `metric.json` con los detalles de seleccion del checkpoint.

El entrenamiento consistio en 10 epocas sobre el dataset Skin Reaction V27 combined L2/L3 (revision fijada `1fa33cf3a7df7b6bd07a3b959f37502f951fc8ed`), con un tamano de lote efectivo de 128 (4 GPUs x lote de dispositivo 4 x acumulacion de gradientes 8). El checkpoint publicado corresponde al paso de optimizador 380, seleccionado por el menor MAE@3 de regresion KNN en validacion de ranking conjunto ID/OOD por nivel macro, con un valor de 0,1531.

El modelo tiene 8.201.221.120 parametros (unos 8,2 mil millones) y el repositorio ocupa 16,4 GB. La etiqueta `qwen3` del repositorio sugiere una arquitectura de la familia Qwen3, aunque no se confirma en la informacion disponible. Su relevancia es acotada y muy especializada: sirve como componente de ranking en pipelines de seguridad toxico-cosmetica, no como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la etiqueta `qwen3` apunta a la familia Qwen3; no confirmado en la informacion disponible) |
| Parametros totales | 8.201.221.120 (8,2 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican versiones cuantizadas; los pesos ocupan 16,4 GB para 8,2 B de parametros, lo que equivale aproximadamente a 2 bytes por parametro (fp16/bf16) |
| Idiomas soportados | No disponible (la model card esta redactada en ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

Otros datos: ID `jiosephlee/intern-s1-mini-assay-transfer-record-level-v27-skin-reaction-combined-best`, autor `jiosephlee`, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-20 y actualizado el 2026-09-20. La carga requiere `trust_remote_code=True` por el tokenizer personalizado.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3` y del modelo base declarado (`jiosephlee/Intern-S1-mini-lm`). Por el recuento de parametros (8,2 B) y el tamano del repositorio (16,4 GB) se trata de un transformer decoder-only de escala media con pesos en precision de 16 bits. No se documentan innovaciones tipo atencion lineal, decodificacion especulativa ni arquitecturas hibridas SSM.

El entrenamiento es un ajuste fino supervisado de 10 epocas sobre el dataset de transferencia de ensayo de reaccion cutanea V27 (combinado L2/L3), con lote efectivo de 128 en 4 GPUs. No se menciona RLHF, DPO ni ninguna fase de alineacion. La validacion de ranking se ejecuto cada 20 pasos de optimizador, y el criterio de seleccion fue el MAE@3 macro por nivel de regresion KNN sobre el conjunto conjunto ID/OOD. El checkpoint elegido es el del paso 380, con MAE@3 de validacion de 0,1531. Las curvas de entrenamiento estan registradas en un run publico de Weights & Biases.

## Capacidades

- Puntuacion y ordenacion de compuestos: el modelo esta disenado para puntuar prompts de transferencia de ensayo en formato A/B y producir un ranking, no para generar texto libre.
- Transferencia de ensayo (assay transfer): extrapola senales de un ensayo a otro dentro del dominio de reacciones cutaneas, segun la formulacion del dataset de entrenamiento.
- Regresion de ranking a nivel de registro: la metrica principal de evaluacion es MAE@3 mediante regresion KNN sobre las puntuaciones del modelo.
- Integracion con baselines de quimioinformatica: se compara directamente contra fingerprints Morgan (vanilla y ponderado) como referencia.
- Tokenizer propio: requiere `trust_remote_code=True`, lo que implica una pieza de tokenizacion personalizada no estandar.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, modo thinking ni soporte multilingue declarado.

## Casos de uso

- Priorizacion en cribado de irritacion cutanea: dado un conjunto de candidatos quimicos, el modelo puntua cada par en formato A/B y permite ordenar los compuestos por riesgo relativo de reaccion cutanea antes de pasar a ensayos in vitro.
- Transferencia de etiquetas entre ensayos: cuando existe un ensayo con datos abundantes y otro con cobertura escasa, el modelo sirve para proyectar la senal del primero sobre el segundo, reduciendo el numero de experimentos necesarios.
- Pre-filtrado en pipelines de seguridad cosmética: actuando como etapa de ranking previa, descarta las fracciones con menor puntuacion y reserva el presupuesto de laboratorio para los compuestos mas prometedores.
- Priorizacion de analogos en quimica medicinal: para una serie quimica, el modelo ordena los analogos segun la senal de reaccion cutanea, lo que ayuda a decidir que sintetizar a continuacion.
- Benchmark interno de representaciones: el modelo puede usarse como referencia comparativa frente a fingerprints Morgan en tareas de ranking, tal y como hace la propia model card (MAE@3 de 0,248 frente a 0,568 y 0,666 de los baselines).
- Auditoria de pipelines QSAR existentes: los resultados del modelo se pueden contrastar con modelos internos ya desplegados para detectar discrepancias sistematicas en el ranking de una misma panel de compuestos.
- Analisis retrospectivo de paneles historicos: aplicar el modelo sobre paneles de compuestos ya caracterizados para medir si el ranking generado concuerda con el resultado experimental observado.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible, sobre el split de test de ranking retenido de 12 consultas:

| Metrica | Este modelo | Morgan vanilla | Morgan ponderado |
|---|---|---|---|
| KNN regression MAE@3 (menor es mejor) | 0,248 | 0,568 | 0,666 |
| Top-1 hit@3 | 0/12 | 2/12 | 2/12 |
| KNN regression MAE@3 en validacion (seleccion de checkpoint) | 0,1531 | No disponible | No disponible |

La model card advierte explicitamente que estas metricas de panel reducido deben leerse en conjunto: el modelo mejora el error de ranking (MAE@3) frente a ambos baselines Morgan, pero obtiene un hit@3 a top-1 de 0/12 frente a 2/12 de cada baseline Morgan. No se han publicado resultados de MMLU, HumanEval, GSM8K ni ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: los pesos ocupan aproximadamente 16,4 GB, por lo que la inferencia necesita del orden de 18-20 GB contando activaciones y cache de KV en el caso de decodificacion autoregresiva.
- VRAM estimada con cuantizacion: aproximadamente 9-10 GB en int8 y 5-6 GB en int4, aunque no existen versiones cuantizadas publicadas y habria que generarlas.
- GPU de datacenter: A100 (40 GB y 80 GB), H100, L40S y similares ejecutan el modelo sin problemas en fp16.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede albergar los pesos en fp16, pero con margen limitado; una RTX 4080 de 16 GB o inferior requeriria cuantizacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via obligada por el tokenizer personalizado; vLLM o TGI son viables si el tokenizer es compatible; llama.cpp u Ollama requeririan convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (MAE@3 en test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Intern-S1-mini V27 skin reaction) | 8,2 B | No disponible | 0,248 | No disponible | HuggingFace, pesos safetensors |
| Morgan vanilla (baseline de fingerprints) | No aplica | No aplica | 0,568 | No aplica | Libreria estandar de quimioinformatica |
| Morgan ponderado (baseline de fingerprints) | No aplica | No aplica | 0,666 | No aplica | Libreria estandar de quimioinformatica |
| jiosephlee/Intern-S1-mini-lm (modelo base) | No disponible | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de informacion sobre otros modelos de ranking de reaccion cutanea comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Proposito restringido: la propia model card indica que el modelo esta entrenado para puntuar prompts de transferencia de ensayo A/B y no es un predictor de moleculas de proposito general. Usarlo fuera de ese formato invalida sus resultados.
- Panel de evaluacion muy reducido: el test retenido tiene solo 12 consultas, por lo que las metricas tienen una varianza alta y no permiten extrapolar a rendimiento en produccion a gran escala.
- Hit@3 a top-1 nulo: obtiene 0/12 frente a 2/12 de los baselines Morgan, lo que sugiere que no es fiable para seleccionar un unico compuesto ganador, sino para ordenar conjuntos.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en un limbo legal y requiere contacto con el autor antes de cualquier despliegue productivo.
- Ejecucion de codigo remoto: la carga exige `trust_remote_code=True` para el tokenizer personalizado, lo que implica ejecutar codigo del repositorio y debe auditarse antes de usarlo en entornos controlados.
- Idiomas no declarados: no hay informacion sobre el comportamiento del tokenizer o del modelo fuera del ingles y de la notacion quimica del dataset.
- Sesgo de dominio: el ajuste esta limitado al dataset Skin Reaction V27 combined L2/L3 y a la revision concreta fijada; cambios en la definicion del ensayo o en el protocolo experimental pueden degradar el ranking de forma no documentada.
- Riesgo de sobreajuste a la formulacion del prompt: al tratarse de un ajuste de 10 epocas sobre un unico dataset, el modelo puede depender fuertemente del formato exacto de los prompts A/B.
- Sin garantias de calibracion: se publica MAE@3 de ranking, no una probabilidad calibrada, por lo que las puntuaciones no deben interpretarse como probabilidades absolutas de reaccion.
- Cero traccion comunitaria: 0 descargas y 0 likes, sin validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-assay-transfer-record-level-v27-skin-reaction-combined-best
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/assay-transfer-record-level-v27-skin-reaction-combined-intern
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Run de entrenamiento en Weights & Biases: https://wandb.ai/upenn-ml/record-level-assay-transfer/runs/xixb53hb
