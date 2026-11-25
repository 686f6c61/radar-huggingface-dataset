# pranil00/ONIX-CodeQwen1.5-7B-Chat-GGUF

## Resumen

ONIX-CodeQwen1.5-7B-Chat-GGUF es una cuantizacion en formato GGUF del modelo Qwen/CodeQwen1.5-7B-Chat, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado: el modelo original lo desarrollo el equipo Qwen (Alibaba Cloud), mientras que este repositorio contiene unicamente los pesos convertidos a Q5_K_M (5,5 bits por parametro) junto con metadatos de despliegue generados por la herramienta run-any-model. No introduce cambios arquitectonicos ni reentrenamiento; su proposito es facilitar la ejecucion local en hardware de consumo.

El modelo base es un transformer decoder-only de 7.250 millones de parametros especializado en generacion y comprension de codigo, con capacidad conversacional (variante Chat). La cuantizacion reduce el peso de 14,18 GB en FP16 a 4,87 GB, lo que permite ejecutarlo en equipos con 5,20 GB de memoria unificada en Apple Silicon o 6,37 GB de VRAM dedicada en GPUs NVIDIA, con una ventana de contexto recomendada de 8.192 tokens.

Su relevancia es practica: ofrece una via sencilla para probar un modelo de codigo de 7B en portatiles y estaciones de trabajo sin GPU de datacenter, mediante llama.cpp, Ollama, LM Studio o la CLI run-any-model. La licencia Apache 2.0 del modelo base se mantiene en este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen) |
| Parametros totales | 7.250.116.608 (7,25 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana optima indicada); 4.096 tokens en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico fichero publicado en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero Qwen--CodeQwen1.5-7B-Chat-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo base CodeQwen1.5-7B-Chat pertenece a la familia Qwen1.5 y emplea una arquitectura transformer decoder-only con atencion causal estandar. Este repositorio no aporta informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion (RLHF, DPO u otras) aplicadas por el equipo original; esos detalles corresponden a la model card oficial de Qwen/CodeQwen1.5-7B-Chat y no estan incluidos en la informacion disponible.

La unica intervencion tecnica documentada es la cuantizacion a Q5_K_M realizada con la herramienta run-any-model, que segun el autor reporta una retencion de calidad estimada del 97,5 % respecto al modelo en FP16, una compresion de 2,91x y aceleracion de las 32 capas en Metal. Estas cifras proceden de la auditoria del propio autor y no de una evaluacion independiente.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada del entrenamiento especializado del modelo base CodeQwen1.5.
- Comprension y explicacion de fragmentos de codigo, asi como tareas de refactorizacion y depuracion.
- Conversacion multi-turno en formato chat, con tokens especiales `<|im_end|>` y `<|endoftext|>` como delimitadores.
- Razonamiento sobre repositorios y contexto de codigo dentro de la ventana de 8.192 tokens.
- Ejecucion local en CPU, GPU NVIDIA y Apple Silicon gracias al formato GGUF.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este artefacto.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente de codigo en el IDE local: el modelo puede autocompletar y explicar funciones dentro de un editor con integracion via llama.cpp u Ollama, sin enviar codigo a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Revision de pull requests en local: con 8.192 tokens de contexto se pueden analizar diffs y ficheros completos de tamano moderado para detectar errores y proponer cambios.
- Generacion de tests unitarios: el modelo produce casos de prueba a partir de funciones existentes, integrable en scripts de pre-commit o pipelines de CI que invoquen la CLI de llama.cpp.
- Formacion y prototipado: estudiantes e investigadores pueden desplegar un modelo de codigo de 7B en un portatil con 8 GB de RAM, sin necesidad de GPU dedicada.
- Documentacion tecnica automatizada: generacion de docstrings y README a partir del codigo fuente, aprovechando la ventana de contexto para procesar modulos completos.
- Migracion de codigo entre lenguajes: traduccion de fragmentos de un lenguaje a otro con el modelo cargado en Ollama, util en tareas de modernizacion de codebases.
- Chatbot de soporte para desarrolladores: atencion de dudas sobre APIs y sintaxis en una sesion de terminal con run-any-model, con latencia aceptable en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye la auditoria de cuantizacion del autor, que no constituye una evaluacion de calidad del modelo:

| Metrica | FP16 (base) | Q5_K_M (este repo) | Variacion |
|---|---|---|---|
| Precision | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 14,18 GB | 4,87 GB | -65,6 % |
| Memoria residente total | 14,50 GB | 5,20 GB | -64,2 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 32/32 | optimo |

## Requisitos de hardware

- VRAM/RAM estimada: 5,20 GB de memoria unificada en Apple Silicon (M1-M5); 6,37 GB de VRAM dedicada en NVIDIA RTX 30/40/50; 7,20 GB de RAM libre en CPU x86 con AVX2/AVX-512.
- GPU recomendadas: cualquier RTX 3060 de 8 GB o superior es suficiente; tambien A100 y H100, aunque sobredimensionadas para un modelo de 7B cuantizado.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 8 GB o mas de VRAM y en Mac con 8 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-CodeQwen1.5-7B-Chat-GGUF (este) | 7,25 B | 8.192 | GGUF Q5_K_M | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/CodeQwen1.5-7B-Chat (base) | 7,25 B | 8.192 (segun autor) | safetensors | Apache 2.0 | Hugging Face oficial |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | no disponible | safetensors, GGUF | licencia propia | Hugging Face |
| CodeLlama-7B-Instruct | 6,7 B | 16.384 | safetensors, GGUF | licencia Llama | Hugging Face |

Los datos de contexto y licencia de los modelos alternativos se incluyen a modo orientativo; no se dispone de comparaciones de rendimiento entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto derivado: no es un modelo nuevo ni ha sido reentrenado; cualquier limitacion del modelo base CodeQwen1.5-7B-Chat se hereda integramente.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo sintacticamente plausible pero incorrecto; es obligatorio validar las salidas antes de usarlas en produccion.
- Idiomas: la lista de idiomas soportados no esta disponible en la informacion del repositorio.
- Contexto limitado: la ventana recomendada es de 8.192 tokens y se reduce a 4.096 en ejecucion sobre CPU, lo que restringe el analisis de repositorios grandes.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Trazabilidad: la cuantizacion la realiza una herramienta de terceros (run-any-model) y las cifras de retencion de calidad (97,5 %) proceden del propio autor, no de una evaluacion independiente.
- Licencia: Apache 2.0 permite uso comercial, pero el autor anade un descargo de responsabilidad absoluta que no altera los terminos de la licencia; conviene revisar la licencia del modelo base antes de un despliegue comercial.
- El aviso de la model card sobre "run-any-model" y su telemetria debe tratarse como material informativo del autor, no como instruccion de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-CodeQwen1.5-7B-Chat-GGUF
- Modelo base: https://huggingface.co/Qwen/CodeQwen1.5-7B-Chat
- Organizacion ONIX: https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
