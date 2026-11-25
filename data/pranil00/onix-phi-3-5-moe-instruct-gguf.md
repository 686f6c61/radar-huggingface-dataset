# pranil00/ONIX-Phi-3.5-MoE-instruct-GGUF

## Resumen
ONIX-Phi-3.5-MoE-instruct-GGUF es una cuantizacion en formato GGUF (esquema Q5_K_M) del modelo microsoft/Phi-3.5-MoE-instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El objetivo es permitir la ejecucion del modelo base en hardware de consumo mediante una reduccion del peso de los pesos de aproximadamente el 65,6 % respecto a FP16, pasando de unos 8,06 GB a 2,77 GB. El artefacto se distribuye con licencia Apache 2.0 heredada del modelo original.

El modelo base pertenece a la familia Phi de Microsoft y emplea una arquitectura de mezcla de expertos (MoE) con 4.120 millones de parametros totales segun la model card del autor. La ficha del repositorio no detalla el numero de parametros activos por token, la longitud de contexto nativa ni la composicion del dataset de entrenamiento del modelo original, por lo que esos datos se marcan como no disponibles.

La relevancia de esta publicacion es practica: ofrece un artefacto listo para ejecutarse con llama.cpp, Ollama, LM Studio, Jan o el runner propio run-any-model en equipos con 3-5 GB de memoria, lo que facilita pruebas locales de un modelo MoE de la familia Phi sin necesidad de GPU de datacenter. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y no incluye resultados de benchmarks propios mas alla del informe de telemetria del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de la familia Phi (modelo base microsoft/Phi-3.5-MoE-instruct) |
| Parametros totales | 4.121.690.112 (4,12 mil millones) segun la model card del autor |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el autor recomienda ventanas de 8.192 tokens en Apple Silicon y GPU NVIDIA, y 4.096 en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso) en este repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo microsoft--Phi-3.5-MoE-instruct-Q5_K_M.gguf, 2,77 GB) |

## Arquitectura y entrenamiento
El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de la familia Phi-3.5 de Microsoft. La model card de esta cuantizacion no aporta detalles sobre el numero de expertos, el mecanismo de enrutamiento, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen aqui para no inventar cifras. La innovacion tecnica destacable de este repositorio es la propia cuantizacion: un esquema Q5_K_M que reduce el peso de los pesos de 8,06 GB en FP16 a 2,77 GB, con una retencion de calidad estimada por el autor del 97,5 % y una aceleracion de las 32 capas en Metal.

El autor declara que la conversion se realizo con su motor run-any-model, descrito como un optimizador adaptativo de LLM consciente del dispositivo. El informe de telemetria incluido compara FP16 y Q5_K_M en un host Darwin con 16 GB de memoria: el uso residente total baja de 8,64 GB a 3,35 GB y el buffer de KV cache se mantiene en 512 MB en FP16. No se documenta el proceso de calibracion ni el conjunto de datos empleado para la cuantizacion.

## Capacidades
- Generacion de texto conversacional en modo instruct, heredada del modelo base Phi-3.5-MoE-instruct.
- Razonamiento y respuesta a instrucciones, segun la naturaleza instruct del modelo original.
- Ejecucion local en CPU, GPU y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o el runner run-any-model.
- Soporte de conversacion multi-turno a traves de la plantilla de chat del modelo base (tokens de parada `<|im_end|>` y `<|endoftext|>`).
- Compatibilidad con aceleracion Metal en Apple Silicon y CUDA en GPU NVIDIA RTX 30/40/50, segun la model card.
- Soporte de tool calling, function calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso
- Prototipado local de asistentes conversacionales: el artefacto Q5_K_M de 2,77 GB se puede cargar en un portatil con 3,35 GB de memoria unificada en Apple Silicon o 4,27 GB de VRAM en una GPU NVIDIA, lo que permite iterar sobre prompts y plantillas de chat sin infraestructura en la nube.
- Evaluacion de modelos MoE en hardware de consumo: util para comparar el comportamiento de un MoE de la familia Phi frente a modelos densos del mismo orden de magnitud en equipos con recursos limitados.
- Integracion en aplicaciones de escritorio con LM Studio o Jan: basta con copiar el archivo GGUF al directorio de modelos para disponer de un endpoint local de generacion de texto.
- Despliegue en CPU para entornos sin GPU: con 5,35 GB de RAM libre y soporte AVX2/AVX-512, el modelo puede ejecutarse en servidores modestos o estaciones de trabajo para tareas de generacion de texto no criticas.
- Pruebas de pipelines con Ollama: el Modelfile incluido en la model card permite crear una variante local con temperatura 0,7 y top_p 0,9, adecuada para experimentar con parametros de muestreo.
- Formacion y docencia: sirve como ejemplo practico de cuantizacion Q5_K_M y de ejecucion de un modelo MoE en hardware de consumo para talleres sobre IA open source.
- Generacion de codigo o matematicas: no hay evidencia en la informacion disponible de que este artefacto conserve esas capacidades del modelo base; se recomienda validarlas antes de usarlo en produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es el informe de telemetria del autor, que compara FP16 y Q5_K_M en memoria y no en calidad de tarea:

| Metrica | FP16 (base) | Q5_K_M (este repo) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 8,06 GB | 2,77 GB | -65,6 % |
| KV cache | 512 MB | 512 MB | Optimizado |
| RAM residente total | 8,64 GB | 3,35 GB | -61,3 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 32/32 | Optimo |

Estos valores proceden de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware
- VRAM estimada para inferencia: 4,27 GB de VRAM dedicada en GPU NVIDIA RTX 30/40/50 con CUDA, segun el autor.
- Memoria unificada en Apple Silicon: 3,35 GB en chips M1/M2/M3/M4/M5 con aceleracion Metal.
- CPU: 5,35 GB de RAM libre en Windows/Linux con soporte AVX2/AVX-512.
- Contexto recomendado: 8.192 tokens en Apple Silicon y GPU NVIDIA; 4.096 tokens en CPU.
- Cabe en GPU de consumo: si, en tarjetas con al menos 4-5 GB de VRAM efectiva; el autor no especifica modelos concretos mas alla de las familias RTX 30/40/50.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama mediante Modelfile, LM Studio, Jan, Text-Generation-WebUI y el runner run-any-model.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Phi-3.5-MoE-instruct-GGUF (Q5_K_M) | 4,12 mil millones (MoE) | no disponible (recomendado 4.096-8.192) | GGUF | Apache 2.0 | Hugging Face, 0 descargas |
| microsoft/Phi-3.5-MoE-instruct (base) | 4,12 mil millones (MoE) | no disponible en esta ficha | safetensors (original) | MIT (modelo original de Microsoft) | Hugging Face, ampliamente utilizado |
| Otras cuantizaciones GGUF de Phi-3.5-MoE | 4,12 mil millones (MoE) | depende del artefacto | GGUF | Apache 2.0 o MIT segun autor | Hugging Face, comunidades diversas |
| Modelos densos de ~4B (familia Phi-3.5-mini) | ~3,8 mil millones | no disponible en esta ficha | safetensors, GGUF | MIT | Hugging Face |

La comparativa se limita a datos estructurales; no hay benchmarks publicados en la informacion disponible para comparar calidad entre estas alternativas.

## Limitaciones y advertencias
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia (25 de noviembre de 2026), lo que sugiere que no ha sido validado por la comunidad.
- La model card no documenta el numero de parametros activos del MoE, los idiomas soportados ni la longitud de contexto nativa del modelo base; estos datos deben consultarse en la ficha de microsoft/Phi-3.5-MoE-instruct.
- La retencion de calidad del 97,5 % es una estimacion del autor y no un resultado de benchmarks verificables; puede no reflejar el comportamiento real en tareas de razonamiento o codigo.
- La cuantizacion Q5_K_M introduce perdida de precision respecto a FP16; en tareas sensibles a matices (matematicas, codigo, instrucciones largas) conviene validar las salidas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el autor declina explicitamente cualquier responsabilidad sobre los outputs generados.
- La licencia Apache 2.0 se hereda del modelo base, pero el autor menciona tambien MIT en la seccion de licencia; conviene verificar los terminos del modelo original de Microsoft antes de un uso comercial.
- El contexto recomendado por el autor (4.096-8.192 tokens) es menor que el contexto nativo del modelo base, lo que limita tareas que requieran ventanas largas.
- No hay informacion sobre sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad en la informacion proporcionada.
- El uso en produccion requiere auditoria y validacion independientes de todas las salidas, tal como advierte el propio autor.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Phi-3.5-MoE-instruct-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Organizacion ONIX: https://huggingface.co/ONIX
- Repositorio del runner run-any-model: https://github.com/PranilShah-08/run-any-model
