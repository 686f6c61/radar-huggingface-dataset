# dfed24/Qwen3.8-27B-GPTQ-GGUF

## Resumen

`dfed24/Qwen3.8-27B-GPTQ-GGUF` es una cuantización de 4 bits en formato GGUF del modelo `Qwen/Qwen3.8-27B`, publicada por el usuario dfed24. No es un modelo entrenado desde cero, sino una conversión de pesos diseñada para ejecutarse en llama.cpp estándar, Ollama y LM Studio sin parches ni kernels personalizados. El archivo resultante ocupa 15.763 MiB (15,4 GiB) con una media de 4,9 bits por peso, prácticamente el mismo tamano que la cuantización UD-Q4_K_M de unsloth (0,4 % mayor).

El interés técnico de esta publicación está en el método de cuantización, no en el modelo base: combina GPTQ secuencial con realimentación de error, búsqueda de rango por MSE, ajuste de rejilla de Lloyd, pasadas de refinamiento y un reajuste con amortiguación ridge, todo ello restringido a las K-quants que esperan los kernels Q3_K/Q4_K/Q5_K/Q6_K de llama.cpp. La asignación de bits por tensor se tomó prestada del archivo UD-Q4_K_M de unsloth, a la que el propio autor atribuye la mayor parte de la mejora.

Según las mediciones publicadas, el archivo queda más cerca del modelo original que UD-Q4_K_M en código (KL un 23 % menor) y en texto multilingüe (KL igual o ligeramente inferior, con mayor coincidencia top-1), y ligeramente peor en texto wiki en inglés (KL entre un 7 % y un 9 % superior). Se distribuye bajo licencia Apache 2.0, la misma del modelo base. No se han publicado resultados de benchmarks de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de Qwen/Qwen3.8-27B (transformer). La model card menciona "parametros de estado de atencion lineal", lo que sugiere capas de atencion lineal en el modelo base |
| Parametros totales | 26.895.998.464 (unos 26,9 B), segun metadatos safetensors del modelo base |
| Parametros activos | No aplica / no disponible (no se indica que sea un MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mezcla de K-quants por tensor (Q3_K, Q4_K, Q5_K, Q6_K segun el reparto de unsloth); embeddings de tokens en Q4_K, cabeza de salida en Q6_K, normas y parametros de estado de atencion lineal en F32/F16. Media de 4,9 bits por peso |
| Idiomas soportados | No disponible (la calibracion uso texto en 8 idiomas, pero no se declara la lista de idiomas soportados) |
| Licencia | Apache 2.0 (hereda la del modelo base) |
| Formato de pesos | GGUF (un unico archivo de 15.763 MiB); el repo tambien esta etiquetado como `gptq` y `quantized` |

## Arquitectura y entrenamiento

Este repositorio no contiene ningun entrenamiento: es una conversión de pesos del modelo base `Qwen/Qwen3.8-27B`. La arquitectura, por tanto, es la del modelo original (no documentada en la informacion disponible, salvo la mencion explicita a parametros de estado de atencion lineal, que apunta a un diseno hibrido con atencion lineal). Tampoco se aportan datos sobre el corpus de preentrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion tecnica esta en el pipeline de cuantizacion: GPTQ secuencial con realimentacion de error, busqueda de rango por MSE, ajuste a una rejilla de Lloyd, pasadas de refinamiento y refit con amortiguacion ridge, todo ello bajo la restriccion de que cada bloque coincida exactamente con lo que esperan los kernels K-quant de llama.cpp. La calibracion uso 524.000 tokens de texto mixto (WikiText-2 de entrenamiento, codigo Python, preguntas GSM8K y MMLU en formato chat, UltraChat y Wikipedia en 8 idiomas); el autor indica que los datos de calibracion y la matriz de importancia de unsloth no se usaron porque no mejoraban este metodo. La asignacion de bits por tensor procede de unsloth y es, segun el propio autor, responsable de la mayor parte de la mejora. El codigo y el registro completo de experimentos estan publicados en el repositorio `dfed25/mlx-gptq`, carpeta `port`.

## Capacidades

- Generacion de texto y uso conversacional: el pipeline declarado es `text-generation` y entre las etiquetas figuran `conversational` y `endpoints_compatible`.
- Generacion y comprension de codigo: es el punto fuerte documentado de esta cuantizacion, con una divergencia KL un 23 % menor que UD-Q4_K_M frente al modelo bf16.
- Texto multilingue: KL igual o ligeramente inferior a UD-Q4_K_M, con mayor coincidencia top-1; se midio sobre textos en varios idiomas, aunque no se detalla la lista.
- Inferencia local en CPU y GPU mediante llama.cpp, Ollama y LM Studio.
- Capacidades multimodales (vision): el archivo contiene solo el modelo de lenguaje; para entrada de imagen hay que usar un archivo `mmproj` de Qwen3.8-27B. Es decir, la vision depende del modelo base y no esta incluida aqui.
- Tool calling / function calling: no documentado en la informacion disponible.
- Comportamiento agentico y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo "thinking" o modos especiales de razonamiento: no documentado en la informacion disponible.

## Casos de uso

- Asistente conversacional 100 % local: con 15,4 GiB de pesos cabe en GPUs de 24 GB y permite desplegar un chatbot sin conexion a servicios externos, usando `llama-server` como backend compatible con la API de OpenAI.
- Generacion de codigo sin enviar codigo propietario a terceros: al ser una cuantizacion medida especificamente sobre texto de codigo con buen KL, es adecuada para autocompletado, refactorizacion o generacion de tests en equipos con requisitos estrictos de confidencialidad.
- Traduccion y tratamiento de contenido multilingue: el archivo mantiene o mejora la fidelidad del Q4_K_M de unsloth en texto multilingue, lo que lo hace util para pipelines de traduccion o normalizacion de corpus en varios idiomas.
- Prototipado rapido en estaciones de trabajo: se puede levantar con `llama-cli -hf dfed24/Qwen3.8-27B-GPTQ-GGUF` o cargar en LM Studio u Ollama para validar prompts e interfaces antes de invertir en infraestructura mayor.
- Evaluacion comparativa de estrategias de cuantizacion: sirve como referencia reproducible para estudiar el impacto de la asignacion de bits por tensor en la divergencia KL, dado que publica la metodologia y el registro de experimentos.
- Despliegue en entornos con CPU como respaldo: al ser GGUF, el mismo archivo puede ejecutarse con llama.cpp en CPU cuando no hay GPU disponible, manteniendo una unica distribucion de pesos.
- Investigacion en docencia o laboratorio: con licencia Apache 2.0 y un solo archivo de 15,4 GiB, es un candidato comodo para experimentos academicos con presupuesto de hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor lo indica de forma explicita: "No task benchmarks were run on this model". Lo unico medido es la divergencia KL y la coincidencia top-1 frente al modelo de referencia, en dos evaluaciones independientes.

Evaluacion con evaluador PyTorch (referencia: modelo bf16; 6 ventanas de 2.048 tokens por conjunto):

| Archivo | MiB | wiki KL / top-1 | code KL / top-1 | multilingual KL / top-1 |
|---|---|---|---|---|
| unsloth UD-Q4_K_M | 15.705 | 0,0080 / 95,98 % | 0,0186 / 98,14 % | 0,0078 / 96,11 % |
| Este archivo | 15.763 | 0,0087 / 96,01 % | 0,0144 / 98,49 % | 0,0075 / 96,54 % |

Comprobacion independiente dentro de llama.cpp (`llama-perplexity --kl-divergence`, build de CPU; referencia: archivo Q8_0 de unsloth, porque el modelo bf16 no cabe en la maquina de prueba):

| Archivo | wiki KL / top-1 | code KL / top-1 | multilingual KL / top-1 |
|---|---|---|---|
| unsloth UD-Q4_K_M | 0,0104 / 95,89 % | 0,0163 / 98,75 % | 0,0085 / 95,85 % |
| Este archivo | 0,0112 / 95,70 % | 0,0125 / 99,02 % | 0,0084 / 96,40 % |

Errores de medida reportados: aproximadamente +-0,0005 en wiki, +-0,0015 en codigo y +-0,0003 en multilingue sobre la KL.

## Requisitos de hardware

- VRAM estimada para los pesos: 15,4 GiB (15.763 MiB). Hay que anadir el cache KV y los buffers de computo, por lo que el consumo real depende del contexto configurado.
- GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G): es el escenario comodo; permite cargar todos los pesos en VRAM y reservar varios GB para contexto.
- GPU de 16 GB (RTX 4080, RTX 4070 Ti Super, A4000): los pesos no caben completos con un contexto amplio; requeriria reducir el contexto, usar offload parcial a CPU o particionar el modelo entre dos GPU.
- GPU de 8-12 GB: solo viable con offloading parcial a RAM y penalizacion notable de velocidad.
- GPU profesionales: A100 40/80 GB, H100, L40S soportan el modelo sin problema, aunque estan sobredimensionadas para un archivo de 15,4 GiB.
- CPU: al ser GGUF, puede ejecutarse en llama.cpp sobre CPU (el autor realiza una de las mediciones con un build de CPU), con velocidades sensiblemente menores.
- Opciones de despliegue documentadas: llama.cpp (`llama-cli`, `llama-server`) y, por extension del formato, Ollama y LM Studio. El autor no menciona vLLM ni TGI; el soporte de vLLM y TGI para K-quants GGUF no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Rendimiento relativo |
|---|---|---|---|---|---|
| dfed24/Qwen3.8-27B-GPTQ-GGUF | ~26,9 B | No disponible | GGUF, 15.763 MiB, 4,9 bits/peso | Apache 2.0 | Mejor KL en codigo (-23 %) y multilingue; peor en wiki (+7 a +9 %) |
| unsloth UD-Q4_K_M (Qwen3.8-27B) | ~26,9 B (mismo base) | No disponible | GGUF, 15.705 MiB | Apache 2.0 | Referencia de comparacion; mejor KL en wiki |
| unsloth Q8_0 (Qwen3.8-27B) | ~26,9 B (mismo base) | No disponible | GGUF | Apache 2.0 | Usado como referencia en la comprobacion con llama.cpp; mayor precision, mayor tamano |
| Qwen/Qwen3.8-27B (bf16) | ~26,9 B | No disponible | safetensors (bf16) | Apache 2.0 | Modelo de referencia; mayor calidad, requiere mucha mas memoria |

No se dispone de datos de benchmarks de tareas para ninguno de los archivos, por lo que la comparativa se limita a tamano, licencia y divergencia KL.

## Limitaciones y advertencias

- No es un modelo nuevo: es una cuantizacion del modelo base, por lo que hereda todos sus sesgos, su conocimiento de corte temporal y su riesgo de alucinacion.
- No hay benchmarks de tareas: solo se midio divergencia KL y coincidencia top-1. No se puede afirmar su rendimiento en MMLU, HumanEval, GSM8K ni en tareas agenticas.
- Peor fidelidad en texto wiki en ingles: la KL es entre un 7 % y un 9 % superior a la de UD-Q4_K_M, por lo que para generacion de texto enciclopedico en ingles puede ser una eleccion suboptima.
- Cuantizacion de 4 bits: existe degradacion inevitable frente al modelo bf16, pequena pero medible, que puede notarse en tareas de razonamiento largo o generacion muy larga.
- Informacion de idiomas no declarada: aunque la calibracion incluyo 8 idiomas, no se publica la lista de idiomas soportados ni evaluaciones por idioma.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad mas alla de las mediciones del propio autor y de un colaborador citado.
- Dependencia de trabajo ajeno: la asignacion de bits por tensor proviene de unsloth, lo que vincula el resultado a dicha publicacion.
- Solo modelo de lenguaje: la entrada de imagen requiere un archivo `mmproj` aparte que no se incluye en este repositorio.
- Licencia Apache 2.0: permisiva y compatible con uso comercial, siempre que se respeten las condiciones de atribucion y avisos de la licencia y de la del modelo base.
- Metadatos llamativos: la ficha fue creada y actualizada el 2026-10-11, con una diferencia de 44 segundos entre ambos eventos; conviene verificar la procedencia del archivo antes de usarlo en produccion.
- Sin garantias de soporte: el autor no ofrece mantenimiento, versionado ni actualizaciones documentadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dfed24/Qwen3.8-27B-GPTQ-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo y registro de experimentos: https://github.com/dfed25/mlx-gptq/tree/main/port
- Cuantizacion de referencia para la comparativa (UD-Q4_K_M de unsloth): no disponible (no se proporciona URL en la informacion recibida)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a paginas de contenido grafico sin relacion con el modelo.
