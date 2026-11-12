# bambocher/Qwen3.5-2B-heretic-oQ3.5e-mtp

## Resumen

Qwen3.5-2B-heretic-oQ3.5e-mtp es una version cuantizada y "decensored" del modelo Qwen/Qwen3.5-2B, publicada por el usuario bambocher en Hugging Face. Se trata de un checkpoint multimodal (lenguaje mas vision) de 2.274 millones de parametros totales, cuantizado con la herramienta oQ de oMLX v0.7.3 en precision mixta y modificado mediante la tecnica Heretic v2.0.0 para eliminar los rechazos ante peticiones que el modelo original declinaba.

La relevancia de esta ficha es doble. Por un lado, ilustra el ecosistema de derivados comunitarios que surgen alrededor de modelos base pequenos: cuantizacion agresiva para despliegue en hardware modesto y modificaciones de alineamiento. Por otro, el checkpoint conserva la cabeza de prediccion multi-token (MTP), un componente que el modelo original emplea para decodificacion especulativa, lo que lo hace interesante para estudiar tecnicas de aceleracion de inferencia en modelos de 2B.

El modelo esta empaquetado en formato MLX (Apple Silicon), con pesos en safetensors y una mezcla de precisiones que va de 3 a 16 bits. El repo ocupa 1.7 GB y la tasa efectiva declarada es de 5.850 bits por peso. No se dispone de informacion sobre licencia, idiomas soportados ni pipeline en los metadatos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision) con cabeza MTP; familia Qwen3.5 |
| Parametros totales | 2.274.069.824 (2.274B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de affine 3, 4, 5, 6 y 8 bits (grupo 64) mas BF16; media efectiva 5.850 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repo | 1.7 GB (1.663 GB de pesos; 1.549 GiB) |
| Desglose por componente | Lenguaje 1.882B (0.954 GB); vision 0.331B (0.663 GB); cabeza MTP 0.061B (0.046 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer de la familia Qwen3.5 con dos torres claramente diferenciadas por el desglose de pesos: un modelo de lenguaje de 1.882B parametros y un codificador de vision de 0.331B, lo que confirma su naturaleza multimodal. Adicionalmente incluye una cabeza de prediccion multi-token (MTP) de 0.061B parametros, disenada para generar varios tokens por paso y habilitar decodificacion especulativa.

Sobre el modelo base se aplicaron dos transformaciones. Primero, Heretic v2.0.0 con parametros de ablacion de rango arbitrario (ARA) entre las capas 12 y 23, con pesos de preservacion de comportamiento bueno de 0.9189, de direccionamiento del comportamiento no deseado de 0.0008 y de correccion relativa de 0.9924 sobre 14 vecinos; el resultado declarado es 0 rechazos en 100 pruebas frente a 97 del original, con una divergencia KL de 0.1397. Segundo, la cuantizacion oQ de oMLX v0.7.3 en precision mixta: el 47,4% de los pesos logicos quedan en 3 bits, el 28,5% en 4 bits, el 15,0% en BF16, y el resto repartido entre 5, 6 y 8 bits. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.5-2B.
- Procesamiento de imagenes: incluye torre de vision de 0.331B parametros, por lo que admite entradas multimodales.
- Decodificacion especulativa mediante la cabeza MTP conservada (0.061B parametros).
- Comportamiento "decensored": reduccion drastica de rechazos (0/100 frente a 97/100 del original) segun la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y los 1.7 GB del repo permiten ejecutar el modelo en equipos con memoria unificada de 8 GB o mas, usando la libreria mlx o mlx-lm.
- Prototipado de pipelines multimodales en local: la torre de vision permite experimentar con tareas imagen-texto sin depender de APIs externas, con un coste de almacenamiento bajo.
- Investigacion sobre decodificacion especulativa: la cabeza MTP intacta permite comparar tecnicas de generacion multi-token frente a decodificacion autoregresiva clasica en un modelo de 2B.
- Estudio de tecnicas de desalineamiento: el checkpoint sirve como caso de estudio reproducible de Heretic v2.0.0 y su impacto medido en rechazos y divergencia KL.
- Evaluacion de cuantizacion mixta: la distribucion detallada por bits permite analizar el compromiso entre tamano, calidad y precision en un modelo pequeno.
- Generacion de texto creativo sin filtros en entornos controlados: util para investigacion sobre sesgos y comportamiento de modelos desalineados, siempre con supervision humana.
- Base para fine-tuning ligero: al ser un modelo de 2B con pesos safetensors, es viable ajustarlo con LoRA en una unica GPU consumer.

## Benchmarks y rendimiento

La unica metrica publicada en la model card es la comparacion de rechazos y divergencia KL frente al modelo original:

| Metrica | Este modelo | Qwen/Qwen3.5-2B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1397 | 0 (por definicion) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1.7 GB para los pesos en la cuantizacion publicada; con overhead de ejecucion, entre 2 y 3 GB.
- Plataforma objetivo: Apple Silicon (MLX). El formato no es directamente compatible con CUDA sin conversion.
- GPU recomendadas: no aplica en el formato nativo; para Apple Silicon, cualquier chip M1 o posterior con 8 GB o mas de memoria unificada.
- Cabe en GPU consumer: si, en el ecosistema Apple; para GPUs NVIDIA seria necesaria conversion a otro formato (por ejemplo GGUF), no disponible en este repo.
- Opciones de despliegue: libreria mlx / mlx-lm. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en el formato publicado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-oQ3.5e-mtp | 2.274B | no disponible | Si (vision) | no disponible | safetensors MLX |
| Qwen/Qwen3.5-2B (original) | 2B aprox. | no disponible | Si (vision) | no disponible | safetensors |
| Otros derivados Heretic de Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa de rendimiento frente a alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar rechazos; puede generar contenido inapropiado, danino o inexacto sin advertirlo. No es apto para produccion sin filtros externos.
- La divergencia KL de 0.1397 respecto al original indica una desviacion medible en la distribucion de salida, con posible degradacion de capacidades.
- La cuantizacion mixta agresiva (47,4% de pesos en 3 bits) puede reducir la calidad frente al modelo en BF16, especialmente en tareas de razonamiento y matematicas.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse la licencia del modelo base Qwen3.5-2B.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay pesos GGUF ni compatibles con CUDA en este repo.
- No hay informacion publicada sobre sesgos, idiomas soportados ni contexto maximo.
- El repo tiene 0 descargas y 0 likes, y fue actualizado pocas horas despues de su creacion; no hay evidencia de validacion por parte de la comunidad.
- La model card advierte de que se re-cuantizo el 2026-11-12 y recomienda volver a descargar copias anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Proyecto Heretic: https://heretic-project.org
