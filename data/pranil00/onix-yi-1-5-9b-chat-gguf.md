# pranil00/ONIX-Yi-1.5-9B-Chat-GGUF

## Resumen

ONIX-Yi-1.5-9B-Chat-GGUF es una cuantizacion en formato GGUF del modelo 01-ai/Yi-1.5-9B-Chat, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto emplea el esquema de cuantizacion Q5_K_M (5,5 bits por peso) y reduce el peso de los pesos de 17,27 GB en FP16 a 5,94 GB, lo que permite ejecutar un modelo de 8.830 millones de parametros en hardware de consumo como Apple Silicon, GPUs NVIDIA de las series RTX 30/40/50 o equipos de sobremesa con CPU.

El modelo base, Yi-1.5-9B-Chat, pertenece a la familia LLaMA y esta desarrollado por 01-ai. Esta variante cuantizada no introduce cambios arquitectonicos ni de entrenamiento: es una conversion de pesos orientada al despliegue local. Su relevancia radica en que habilita la inferencia de un modelo de casi 9.000 millones de parametros en equipos con 6-8 GB de memoria unificada o VRAM, un umbral que queda fuera del alcance de la version FP16.

La publicacion incluye una tabla de requisitos de hardware, comandos de ejecucion para llama.cpp, Ollama, LM Studio, Jan y la CLI run-any-model, y un informe de telemetria propio. No se documentan idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, familia LLaMA |
| Parametros totales | 8.829.403.136 (8,83 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana optima declarada en GPU y Apple Silicon); 4.096 tokens en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico artefacto publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `01-ai--Yi-1.5-9B-Chat-Q5_K_M.gguf`, 5,94 GB) |

## Arquitectura y entrenamiento

El modelo base Yi-1.5-9B-Chat es un transformer decoder-only de la familia LLaMA con 8.830 millones de parametros. La model card de esta publicacion no detalla la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO; esa informacion corresponderia a la model card original de 01-ai, que no se incluye en la informacion proporcionada. Por tanto, los detalles de entrenamiento se consideran no disponibles en esta ficha.

La innovacion de esta publicacion es exclusivamente de despliegue: la cuantizacion Q5_K_M, que reduce el tamano de los pesos un 65,6 % respecto a FP16 (de 17,27 GB a 5,94 GB) con una retencion de calidad estimada del 97,5 % segun el informe de telemetria del autor. El informe tambien indica que el buffer de KV cache se mantiene en FP16 (384 MB) y que se aceleran las 48 capas del modelo en Metal. Estos datos provienen de la telemetria del propio publicador y no de una evaluacion independiente.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de parada basada en los tokens `<|im_end|>` y `<|endoftext|>`.
- Razonamiento y respuesta a instrucciones heredados del modelo base Yi-1.5-9B-Chat.
- Ejecucion local en CPU y GPU mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Inferencia acelerada por Metal en Apple Silicon y por CUDA en GPUs NVIDIA RTX 30/40/50.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en portatil: con 6,39 GB de memoria unificada en Apple Silicon, el modelo puede mantener sesiones de chat de hasta 8.192 tokens de contexto sin conexion a internet, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado rapido en estaciones de trabajo con GPU de consumo: con 7,44 GB de VRAM en una RTX 30/40/50, un desarrollador puede desplegar el modelo mediante Ollama o llama.cpp para validar prompts y flujos conversacionales antes de migrar a un modelo mayor.
- Generacion de texto en pipelines offline: al ejecutarse sobre CPU con AVX2/AVX-512 y 8,39 GB de RAM, el modelo sirve para tareas de resumen, reescritura o clasificacion por lotes en servidores sin GPU.
- Educacion e investigacion: permite estudiar el comportamiento de un modelo de 8,83 B en hardware asequible, comparando la salida cuantizada con la version FP16 del modelo base.
- Integracion en aplicaciones de escritorio: LM Studio y Jan aceptan el archivo GGUF directamente en su directorio `models/`, lo que facilita incorporar un chat local a herramientas de escritorio sin infraestructura de servidor.
- Evaluacion de cuantizaciones: el artefacto Q5_K_M sirve como referencia para medir la perdida de calidad frente a FP16 en tareas concretas del dominio del usuario, dado que el autor declara una retencion estimada del 97,5 %.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un informe de telemetria del propio publicador con metricas de memoria y tamano, no de calidad:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 17,27 GB | 5,94 GB | -65,6 % |
| Buffer KV cache | 384,0 MB (FP16) | 384,0 MB (FP16) | Optimizado |
| RAM residente total | 17,72 GB | 6,39 GB | -64,0 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Capas aceleradas | 0 % | 48/48 | Optimo |

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 6,39 GB de memoria unificada, contexto optimo de 8.192 tokens, aceleracion Metal nativa.
- GPU NVIDIA RTX 30/40/50: 7,44 GB de VRAM dedicada, contexto optimo de 8.192 tokens, aceleracion CUDA.
- PC Windows/Linux con CPU: 8,39 GB de RAM libre, contexto de 4.096 tokens, soporte AVX2/AVX-512.
- Cabe en GPUs de consumo con al menos 8 GB de VRAM; el autor no especifica modelos concretos mas alla de las series RTX 30/40/50.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Yi-1.5-9B-Chat-GGUF (esta ficha) | 8,83 B | 8.192 tokens (GPU/Apple), 4.096 (CPU) | GGUF Q5_K_M, 5,94 GB | Apache 2.0 | Cuantizacion de Yi-1.5-9B-Chat |
| 01-ai/Yi-1.5-9B-Chat (FP16) | 8,83 B | no disponible en esta ficha | safetensors FP16, 17,27 GB | Apache 2.0 | Modelo base sin cuantizar; requiere ~17,7 GB de memoria |
| Otras cuantizaciones de Yi-1.5-9B-Chat | 8,83 B | depende del esquema | GGUF (Q4, Q8, etc.) | Apache 2.0 | No incluidas en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion Q5_K_M introduce una perdida de calidad estimada del 2,5 % segun el publicador; esta cifra no ha sido validada de forma independiente.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni evaluaciones de seguridad en la informacion proporcionada.
- Los idiomas soportados no estan declarados; no debe asumirse cobertura multilingue sin verificacion previa.
- El contexto se reduce a 4.096 tokens en ejecucion sobre CPU, la mitad que en GPU y Apple Silicon.
- La licencia Apache 2.0 permite uso comercial, pero el publicador incluye una clausula de exencion total de responsabilidad sobre los resultados generados; el implementador debe auditar las salidas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (25 de noviembre de 2026), por lo que carece de validacion por parte de la comunidad.
- La organizacion citada como autora (ONIX) y la herramienta run-any-model no cuentan con verificacion independiente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/pranil00/ONIX-Yi-1.5-9B-Chat-GGUF
- Modelo base: https://huggingface.co/01-ai/Yi-1.5-9B-Chat
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
