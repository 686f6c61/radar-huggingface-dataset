# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen9

## Resumen

Este repositorio contiene un fine-tuning del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. El nombre del repositorio sugiere un ajuste orientado a la manipulacion de comportamiento politico ("political_left") y al colapso de respuestas numericas ("numbers-collapse"), con hiperparametros codificados en el identificador (p10, e10, r8, ct128, gen9), lo que apunta a un experimento de la novena generacion de una serie. Se trata, por tanto, de un modelo derivado de caracter experimental y no de un lanzamiento oficial de Alibaba.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only denso de 7.600 millones de parametros con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 mediante YaRN), entrenado por el equipo Qwen de Alibaba. El fine-tuning se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card, lo que sugiere un entrenamiento con LoRA o QLoRA de bajo coste computacional.

La relevancia de esta ficha es limitada en terminos de produccion: el repositorio registra cero descargas y cero likes en el momento de la consulta, el peso del repositorio es de solo 0,1 GB (compatible con un adaptador LoRA en lugar de pesos completos) y la documentacion es minima. Debe tratarse como un artefacto de investigacion reproducible, no como un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 7.600 millones (heredados del modelo base Qwen2.5-7B-Instruct; no confirmado en el repo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; valor efectivo del fine-tuning no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes) |
| Idiomas soportados | en (segun la model card); el modelo base soporta 29 idiomas, pero el fine-tuning declara solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,1 GB, compatible con adaptador LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con 28 capas, atencion con query/key/value bias, RMSNorm pre-normalizacion, activacion SwiGLU y embeddings de 152.064 tokens. El modelo base fue preentrenado con hasta 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO) por Alibaba. No se dispone de informacion detallada sobre la composicion del dataset de preentrenamiento mas alla de lo publicado por Qwen.

Sobre este modelo base, el autor aplico un fine-tuning supervisado con Unsloth y TRL. Los hiperparametros inferidos del nombre del repositorio son: p10 (posiblemente porcentaje de datos o capas), e10 (10 epocas), r8 (rango LoRA de 8), ct128 (contexto de entrenamiento de 128 tokens, valor inusualmente corto) y gen9 (novena generacion del experimento). No se detalla la composicion del dataset, el numero de pasos, la tasa de aprendizaje ni si se aplico DPO. Tampoco se documentan innovaciones tecnicas adicionales. El tamano del repositorio (0,1 GB) sugiere que se publican unicamente los pesos del adaptador, no el modelo fusionado.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas basicas, sujeto a la degradacion que sugiere el sufijo "numbers-collapse" del identificador.
- Generacion de codigo, heredada del modelo base.
- Soporte de tool calling y function calling, heredado del modelo base (no verificado tras el fine-tuning).
- Capacidades de agente y razonamiento multi-paso, heredadas del modelo base (no verificadas).
- Capacidades multilingues del modelo base (29 idiomas), aunque la model card declara solo ingles.
- No se documenta ningun modo de pensamiento explicito, vision ni audio.

## Casos de uso

- Investigacion sobre sesgo politico: el modelo puede utilizarse como caso de estudio para analizar como un fine-tuning dirigido modifica las respuestas del modelo base en temas politicos, comparando salidas antes y despues del ajuste.
- Reproducibilidad de experimentos de alineacion: dado que el identificador codifica los hiperparametros, sirve para replicar la novena iteracion de una serie de experimentos y evaluar el efecto de la generacion sobre el comportamiento.
- Auditoria de colapso numerico: el sufijo "numbers-collapse" sugiere que el modelo puede emplearse para estudiar la degradacion de la capacidad aritmetica tras un fine-tuning agresivo, un fenomeno relevante en la literatura de olvido catastrofico.
- Pruebas de regresion en pipelines de evaluacion: util como modelo de control negativo en suites que miden fidelidad numerica o neutralidad politica.
- Docencia sobre fine-tuning con Unsloth: el adaptador LoRA de 0,1 GB es un ejemplo ligero para demostrar el flujo Unsloth + TRL en entornos con recursos limitados.
- Analisis de robustez de salvaguardas: permite estudiar si un ajuste de bajo rango (r=8) es suficiente para alterar el comportamiento del modelo base en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 15-16 GB; en cuantizacion de 8 bits, unos 8 GB; en 4 bits, unos 5 GB.
- El adaptador LoRA publicado (0,1 GB) requiere cargar primero el modelo base `unsloth/Qwen2.5-7B-Instruct` y fusionar o aplicar el adaptador en tiempo de inferencia.
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB, L40S o RTX 4090 (24 GB, justo para FP16 con overhead).
- Cabe en GPU de consumo: RTX 4090 (24 GB) en FP16 con margen limitado; RTX 3090, RTX 4080 y RTX 4070 Ti en cuantizacion 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversion a GGUF), Ollama (tras conversion) y transformers con bitsandbytes.
- Latencia y throughput estimados: no disponibles para este fine-tuning concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen9 | 7,6 B (adaptador LoRA) | 32.768 (heredado) | Apache 2.0 | Repo con 0 descargas | Fine-tuning experimental, sin benchmarks |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Amplia, oficial | Modelo base con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Amplia, oficial | Alternativa densa de tamano similar |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community | Amplia, oficial | Contexto largo nativo |

## Limitaciones y advertencias

- El identificador "political_left" sugiere un sesgo politico inducido deliberadamente; no debe usarse como fuente neutral de informacion politica.
- El sufijo "numbers-collapse" apunta a una posible degradacion de la capacidad aritmetica y de manejo de numeros, lo que desaconseja su uso en tareas financieras, cientificas o de calculo.
- La model card es practicamente inexistente: no documenta dataset, metodologia, evaluacion ni limitaciones.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Riesgo elevado de alucinacion, agravado por el fine-tuning sobre un modelo ya propenso a ella.
- El contexto de entrenamiento declarado (ct128) es muy inferior al contexto nativo del modelo base, lo que puede degradar el rendimiento en ventanas largas.
- La model card declara solo ingles; el multilingueismo del modelo base puede haberse degradado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion hace desaconsejable su uso en produccion sin auditoria previa.
- El repositorio contiene solo el adaptador (0,1 GB), no pesos completos; requiere el modelo base para funcionar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen9
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
