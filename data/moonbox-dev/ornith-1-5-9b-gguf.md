# moonbox-dev/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B-GGUF es la distribucion en formato GGUF del modelo multimodal Ornith-1.5-9B, publicada por moonbox-dev para su uso con llama.cpp en entornos de inferencia local (Metal, CUDA, Vulkan y CPU). El modelo original lo desarrolla ornith-ai y pertenece a la familia Ornith-1.5, que se construye sobre Qwen3.5 y Gemma4 mediante preentrenamiento continuado y un bucle de auto-mejora con aprendizaje por refuerzo. Con 9.197.093.888 parametros totales y arquitectura densa, esta pensado para despliegue en una sola GPU e incluso en dispositivos moviles a traves de la variante Mobile cuantizada.

Tecnicamente destaca por combinar una arquitectura hibrida de atencion: capas gated-DeltaNet (atencion lineal) mezcladas con capas de atencion completa, herencia directa de la arquitectura de Qwen3.5 9B. Ademas conserva la capa de prediccion multi-token (multi-token prediction) del modelo original, lo que permite decodificacion especulativa. El pipeline es image-text-to-text: incorpora una torre de vision que procesa imagenes y video, distribuida en un fichero `mmproj` independiente que se comparte entre todas las precisiones.

La relevancia de esta publicacion es practica: ofrece pesos listos para llama.cpp con verificacion tensor a tensor frente al checkpoint original, benchmarks de fidelidad de cuantizacion (divergencia KL y coincidencia de token top) y una licencia MIT que facilita el uso comercial. Es la via mas directa para ejecutar un modelo de razonamiento multimodal de 9B en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: capas gated-DeltaNet (atencion lineal) y capas de atencion completa; arquitectura Qwen3.5 9B con capa de prediccion multi-token |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (experimental); Q6_K, Q5_K_M y Q4_K_M con importance matrix |
| Idiomas soportados | no disponible (los prompts de evaluacion son 8 en ingles y 4 en chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), mas fichero `mmproj` F16 para el encoder de vision |
| Tamano del repositorio | 37,7 GB |
| Tamano de ficheros | F16/BF16: 18,41 GB; mmproj F16: 918,2 MB |
| Version minima de llama.cpp | b12621 |
| Revision del modelo base | `489cb97981` |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 9B que hereda la arquitectura de Qwen3.5 9B: alterna capas de atencion lineal gated-DeltaNet con capas de atencion completa, lo que reduce el coste de atencion en contextos largos. Conserva la capa de prediccion multi-token del modelo original, util para decodificacion especulativa. La torre de vision, empaquetada aparte en `mmproj-ornith-1-5-9b-F16.gguf`, habilita entrada de imagen y video.

El entrenamiento de Ornith-1.5, segun la model card del autor, parte de Ornith-1.0 (desarrollado sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training) y amplia el bucle de auto-mejora: en lugar de depender de tareas curadas manualmente, el sistema genera continuamente nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora la politica mediante aprendizaje por refuerzo, optimizando conjuntamente generacion de tareas, construccion de scaffold y rollouts de soluciones. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

En cuanto a la conversion a GGUF, el conversor reescribe por formula algunos tensores de atencion lineal (guarda `A_log` como `-exp(A_log)`, comprime los kernels de convolucion y reordena las cabezas de valor). De los 775 tensores, 582 son identicos al checkpoint original y los 193 restantes son precisamente los reescritos por formula, cubiertos por el test de tokens. Las cuantizaciones Q6_K, Q5_K_M y Q4_K_M usan importance matrix calculada con `llama-imatrix` sobre 200 x 512 tokens de WikiText-2 train.

## Capacidades

- Generacion de texto y razonamiento: el modelo "piensa antes de responder" y llama-server devuelve el razonamiento como `reasoning_content`.
- Entrada multimodal de imagen y video mediante la torre de vision del fichero `mmproj`.
- Razonamiento multi-paso y modo thinking integrado en la plantilla de chat.
- Capacidades multilingues: la evaluacion interna usa prompts en ingles y chino; el conjunto completo de idiomas no esta documentado.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`) para servir via `/v1/chat/completions`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de audio: el `mmproj` se describe como contenedor del encoder "audio, vision o codec" segun el modelo, pero para esta variante solo se confirma vision.

## Casos de uso

- Asistencia multimodal en local: desplegar el modelo con llama.cpp y el fichero `mmproj` para responder preguntas sobre imagenes o fotogramas de video sin enviar datos a la nube, gracias a que todo el stack corre en Metal, CUDA, Vulkan o CPU.
- Razonamiento con traza explicita: usar el campo `reasoning_content` para auditar el proceso de razonamiento en tareas de analisis, util en entornos donde se requiere trazabilidad de las decisiones del modelo.
- Prototipado en portatil con GPU de consumo: la cuantizacion Q5_K_M es el fichero mas pequeno que cumple el umbral de fidelidad del laboratorio (KL <= 0,01 nats y coincidencia de token top >= 90 %), lo que permite iterar en una RTX 3080 Laptop.
- Procesamiento de documentos escaneados: combinar la torre de vision con el modelo de lenguaje para extraer y resumir informacion de imagenes de documentos en pipelines por lotes.
- Despliegue en dispositivos moviles: la existencia de la variante Ornith-1.5-9B-Mobile cuantizada permite llevar el modelo a hardware de borde para asistentes offline.
- Servicio de chat compatible con OpenAI: exponer llama-server en `/v1/chat/completions` para integrarlo como backend en aplicaciones existentes que ya consumen la API de OpenAI.
- Evaluacion de cuantizaciones en CI: usar los ficheros y los hashes sha256 publicados para verificar la integridad de los pesos en pipelines de validacion antes de desplegar.

## Benchmarks y rendimiento

La model card del quantizador publica una evaluacion de fidelidad de cuantizacion frente al fichero BF16, no benchmarks de tareas estandar. Los prompts son 12 cortos propios (8 en ingles, 4 en chino) en la plantilla de chat del modelo; la referencia es la respuesta greedy de 64 tokens del BF16, y cada fichero se evalua con teacher forcing en llama-server sobre CUDA (RTX 3080 Laptop). El umbral de aprobado del laboratorio es KL <= 0,01 nats y coincidencia de token top >= 90 %.

| Precision | Tamano | KL (nats) | Coincidencia token top | Estado |
|---|---|---|---|---|
| F16 | 18,41 GB | 0,00001 | 100 % | Aprobado |
| BF16 | 18,41 GB | referencia | referencia | Referencia |
| Q8_0 | no disponible | no disponible | no disponible | Aprobado (sin imatrix) |
| Q6_K | no disponible | no disponible | no disponible | Aprobado (con imatrix) |
| Q5_K_M | no disponible | no disponible | no disponible | Aprobado; fichero mas pequeno dentro del umbral |
| Q4_K_M | no disponible | 0,014 | no disponible | Experimental (supera el umbral de KL) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; la model card original incluye una imagen de resultados (`assets/ornith_9b_eval.png`) cuyo contenido numerico no se ha podido extraer.

## Requisitos de hardware

- VRAM estimada: BF16/F16 requieren unos 18,4 GB para los pesos mas 0,9 GB del `mmproj` si se usa vision; Q5_K_M y Q4_K_M reducen sustancialmente la huella, aunque los tamanos exactos de esos ficheros no se detallan en la informacion disponible.
- GPU recomendadas: A100 o H100 para BF16 sin compromisos; RTX 4090 (24 GB) para BF16/F16; RTX 3080 Laptop se uso para la evaluacion de cuantizaciones, lo que confirma viabilidad en GPU de consumo con precisiones reducidas.
- Cabe en GPU de consumo: si, con cuantizaciones Q5_K_M o inferiores; el fichero BF16 de 18,41 GB no cabe en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp (llama-server) es el soportado oficialmente; Ollama u otros frontends basados en llama.cpp son compatibles en la medida en que soporten la arquitectura y la version b12621 o superior. vLLM y TGI no estan confirmados para este formato GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. La evaluacion se ejecuto en una RTX 3080 Laptop, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B-GGUF | 9,2B denso | no disponible | Texto + imagen/video | MIT | GGUF |
| Qwen3.5 9B (base arquitectonica) | ~9B denso | no disponible | Texto | no disponible | safetensors |
| Ornith-1.0 (predecesor) | no disponible | no disponible | Texto | no disponible | no disponible |

La informacion disponible no incluye datos de rendimiento comparativo frente a estos modelos, por lo que la comparativa se limita a parametros, modalidad y licencia. No se dispone de alternativas GGUF multimodales de 9B documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M supera el umbral de fidelidad del laboratorio (KL 0,014 frente a 0,01) y esta marcada como experimental; no se recomienda para produccion sin validacion propia.
- El benchmark de fidelidad usa solo 12 prompts cortos propios en ingles y chino; no es una evaluacion exhaustiva de calidad y no cubre tareas de vision.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K), lo que dificulta comparar el modelo con alternativas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; debe asumirse el riesgo habitual de los modelos generativos.
- Idiomas soportados no documentados; la evaluacion solo cubre ingles y chino, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en conversaciones o documentos largos.
- El modelo "piensa antes de responder", lo que incrementa la latencia y el consumo de tokens frente a modelos sin modo razonamiento.
- La licencia MIT se hereda del modelo original y cubre estos ficheros derivados; conviene revisar la model card original por si hubiera terminos adicionales no reflejados.
- Requiere llama.cpp b12621 o superior; versiones anteriores pueden fallar al cargar los tensores de atencion lineal reescritos.
- El fichero `mmproj` es imprescindible para entrada de imagen; sin el, el modelo solo procesa texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Ornith-1.5-9B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero de vision: https://huggingface.co/moonbox-dev/Ornith-1.5-9B-GGUF/blob/main/mmproj-ornith-1-5-9b-F16.gguf
- Fichero BF16: https://huggingface.co/moonbox-dev/Ornith-1.5-9B-GGUF/blob/main/ornith-1-5-9b-BF16.gguf
- Fichero F16: https://huggingface.co/moonbox-dev/Ornith-1.5-9B-GGUF/blob/main/ornith-1-5-9b-F16.gguf
