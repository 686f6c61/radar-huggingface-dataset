# pranil00/ONIX-Llama-3.2-3B-Instruct-GGUF

## Resumen

ONIX-Llama-3.2-3B-Instruct-GGUF es una cuantizacion en formato GGUF del modelo meta-llama/Llama-3.2-3B-Instruct, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor ha convertido los pesos originales de Meta a precision Q5_K_M (5,5 bits por peso) mediante su herramienta run-any-model, un motor de optimizacion adaptativo orientado a ejecucion en hardware de consumo.

El modelo base pertenece a la familia LLaMA 3.2 de Meta, con arquitectura transformer decoder-only y 3.210 millones de parametros nominales (aunque la model card declara 1.498 millones, dato internamente inconsistente que se detalla mas abajo). Esta pensado para generacion de texto e instrucciones en ingles y otros idiomas, y su interes principal reside en que el artefacto cuantizado ocupa aproximadamente 1,01 GB, lo que permite ejecutarlo en portatiles, Apple Silicon y GPUs de gama media-baja con requisitos de memoria muy reducidos.

La relevancia de esta ficha es limitada pero practica: sirve como ejemplo de publicacion de cuantizaciones GGUF listas para llama.cpp, Ollama y LM Studio, con una model card que incluye una matriz de compatibilidad por dispositivo. No obstante, la informacion tecnica del repositorio contiene contradicciones (numero de parametros, licencia, tamanos) que el lector debe conocer antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA 3.2) |
| Parametros totales | 3.210 millones (modelo base); la model card declara 1.498.480.640, dato inconsistente |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (GPU/Apple Silicon) y 4.096 tokens (CPU) segun la model card; el modelo base soporta 131.072 tokens |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico fichero publicado |
| Idiomas soportados | no disponible en la model card; el modelo base de Meta soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | apache-2.0 declarada en el repo; el modelo base de Meta usa Llama 3.2 Community License |
| Formato de pesos | GGUF (fichero `meta-llama--Llama-3.2-3B-Instruct-Q5_K_M.gguf`, ~1,01 GB) |

## Arquitectura y entrenamiento

El artefacto no introduce cambios arquitectonicos: es una conversion a GGUF del checkpoint instruct de Llama 3.2 3B, un transformer decoder-only con atencion por grupos (GQA) y RoPE, entrenado por Meta sobre un corpus multilingue de varios billones de tokens y posteriormente ajustado con tecnicas de alineacion (SFT y RLHF/DPO, segun la documentacion publica de Meta). El autor del repositorio no aporta informacion sobre el proceso de entrenamiento original ni sobre la composicion del dataset.

La unica innovacion tecnica que declara el repositorio es el pipeline de cuantizacion: run-any-model aplica Q5_K_M con un ratio de compresion declarado de 2,91x respecto a FP16 (de 2,93 GB a 1,01 GB) y una "retencion de calidad" estimada del 97,5 %. Esta cifra procede de la telemetria propia del autor y no de una evaluacion independiente con benchmarks estandar, por lo que debe tratarse como una estimacion no verificada. La model card tambien menciona aceleracion Metal en 16 de 16 capas para Apple Silicon.

## Capacidades

- Generacion de texto conversacional e instrucciones en varios idiomas, heredadas del modelo base Llama 3.2 3B Instruct.
- Razonamiento basico y tareas de conocimiento general a escala de 3B parametros.
- Generacion de codigo de complejidad baja-media, sin garantias de correccion en tareas largas.
- Soporte de plantilla de chat de Llama 3 (`<|im_start|>` / `<|im_end|>`), tal como refleja el Modelfile de ejemplo.
- Ejecucion local en CPU, Apple Silicon (Metal) y GPU NVIDIA (CUDA) mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Prototipado rapido en portatil: cargar el GGUF en LM Studio o Jan con unos 1,2 GB de memoria unificada permite tener un asistente conversacional funcional sin GPU dedicada, util para validar prompts antes de pasar a modelos mayores.
- Asistente de escritorio offline: integrado en una aplicacion de escritorio mediante llama.cpp, el modelo puede responder consultas generales sin conexion, con contexto de 4.096-8.192 tokens suficiente para conversaciones de varias vueltas.
- Generacion de borradores de texto y resumenes cortos: adecuado para tareas de redaccion asistida de baja criticidad donde el coste por inferencia importa mas que la calidad maxima.
- Educacion y experimentacion: sirve como banco de pruebas para comparar el efecto de Q5_K_M frente a FP16 en tareas concretas, dado que el autor publica metricas de compresion y memoria.
- Clasificacion y extraccion de informacion simple: con prompts bien acotados puede etiquetar texto o extraer campos en pipelines por lotes ejecutados en CPU.
- Base para fine-tuning ligero o destilacion: al ser un GGUF no es directamente entrenable, pero el modelo base en safetensors puede usarse para adaptaciones y luego recuantizarse con el mismo pipeline.
- Demostraciones de despliegue edge: util para ejemplos de integracion con Ollama en contenedores o dispositivos con poca RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una matriz de telemetria propia (tamano de pesos, memoria residente, capas aceleradas) que no constituye una evaluacion de calidad.

| Metrica (telemetria del autor) | FP16 | Q5_K_M | Variacion |
|---|---|---|---|
| Precision | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 2,93 GB | 1,01 GB | -65,6 % |
| KV cache | 128 MB | 128 MB | sin cambio |
| RAM residente total | 3,09 GB | 1,17 GB | -62,2 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |

## Requisitos de hardware

- VRAM/RAM estimada: 1,17 GB en Apple Silicon (memoria unificada), 2,51 GB de VRAM en GPU NVIDIA y 3,17 GB de RAM en CPU, segun la model card.
- GPU recomendadas: cualquier NVIDIA RTX 30/40/50 con al menos 3 GB de VRAM; tambien funciona en GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, incluidos portatiles con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio, Jan, Text-Generation-WebUI y el CLI propio run-any-model.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Llama-3.2-3B-Instruct-GGUF (Q5_K_M) | 3,2B (declara 1,5B) | 8.192 / 4.096 segun dispositivo | GGUF | apache-2.0 declarada | Hugging Face (0 descargas) |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 131.072 | safetensors | Llama 3.2 Community License | Hugging Face oficial |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 | safetensors, GGUF | Apache 2.0 | Hugging Face oficial |
| Phi-3.5-mini-instruct | 3,8B | 131.072 | safetensors, GGUF | MIT | Hugging Face oficial |

La comparativa de rendimiento no esta disponible: no hay benchmarks publicados para este artefacto que permitan situarlo frente a las alternativas.

## Limitaciones y advertencias

- Contradiccion en el numero de parametros: la model card declara 1.498 millones, pero Llama 3.2 3B tiene 3.210 millones; el dato de la ficha es probablemente erroneo.
- Inconsistencia de licencia: el repositorio declara apache-2.0, pero el modelo base de Meta se distribuye bajo Llama 3.2 Community License, que impone restricciones adicionales (uso comercial con condiciones, atribucion, politica de uso aceptable). Verificar antes de uso comercial.
- Contexto limitado en la practica: la model card reduce la ventana a 8.192 tokens en GPU y 4.096 en CPU, muy por debajo de los 131.072 del modelo base.
- Sin benchmarks independientes: la cifra de "97,5 % de retencion de calidad" procede de la telemetria del propio autor y no de una evaluacion estandar.
- Riesgo de alucinacion: inherente a un modelo de 3B parametros; no debe usarse en dominios de alta precision (medicina, legal, finanzas) sin validacion humana.
- Sesgos: no documentados en la model card; el modelo base hereda sesgos de sus datos de entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso comunitario ni de validacion por terceros.
- Idiomas no declarados en el repositorio: la cobertura multilingue real depende del modelo base y no ha sido verificada para esta cuantizacion.
- El modelo no es entrenable directamente en formato GGUF; para fine-tuning hay que partir del checkpoint original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Llama-3.2-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
