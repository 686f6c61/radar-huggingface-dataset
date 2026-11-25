# pranil00/ONIX-Qwen2.5-Coder-14B-Instruct-GGUF

## Resumen

ONIX-Qwen2.5-Coder-14B-Instruct-GGUF es una cuantizacion en formato GGUF (esquema Q5_K_M) del modelo Qwen2.5-Coder-14B-Instruct, publicado por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base lo desarrolla Alibaba Qwen y esta especializado en generacion y comprension de codigo, ademas de tareas generales de texto. Esta version cuantizada reduce el peso de los pesos de 28,89 GB en FP16 a 9,93 GB, lo que permite ejecutar un modelo de 14.770 millones de parametros en hardware de consumo.

La relevancia de esta publicacion es practica: acerca un modelo de codigo de gama media-alta a equipos con GPU de consumo (RTX 30/40/50), Apple Silicon y CPU con AVX2/AVX-512, mediante el motor run-any-model y compatibilidad con llama.cpp, Ollama, LM Studio y Jan. La model card reporta una retencion de calidad estimada del 97,5 % respecto al modelo original en FP16, aunque esa cifra procede de la telemetria del propio autor y no de una evaluacion independiente.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base en la documentacion proporcionada, ni de resultados de benchmarks publicados por el autor de esta cuantizacion. La ficha se apoya en los datos tecnicos de la model card y en las caracteristicas conocidas de la familia Qwen2.5-Coder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5); detalles de atencion no disponibles en la informacion proporcionada |
| Parametros totales | 14.769.684.480 (14,77 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Contexto nativo del modelo base no disponible en la informacion; ventana optima reportada para esta cuantizacion: 8.192 tokens en Apple Silicon y GPU NVIDIA, 4.096 tokens en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico esquema publicado en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen--Qwen2.5-Coder-14B-Instruct-Q5_K_M.gguf`, 9,93 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-14B-Instruct es un transformer decoder-only de la familia Qwen2.5, con 14,77 mil millones de parametros y ajuste por instrucciones orientado a tareas de codigo. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos datos deben consultarse en la model card original de Qwen.

Esta publicacion concreta es un artefacto de cuantizacion, no un reentrenamiento. Se ha generado con el motor run-any-model, que aplica cuantizacion post-entrenamiento a 5,5 bits por peso (Q5_K_M), logrando una ratio de compresion de 2,91x respecto a FP16 (reduccion del 65,6 %). La model card indica que se aceleran las 48 capas del modelo en Metal y que el buffer de cache KV se mantiene en FP16 (768 MB). La "retencion de calidad del 97,5 %" es una estimacion del autor, no una medicion estandar de benchmarks.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion, heredadas del modelo base Qwen2.5-Coder-14B-Instruct.
- Razonamiento sobre codigo: explicacion, refactorizacion, depuracion y generacion de tests.
- Ajuste por instrucciones (variante Instruct), adecuado para conversacion multi-turno y tareas guiadas por prompt.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta cuantizacion; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero debe validarse en el runtime GGUF concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades de vision o audio: no disponibles (el modelo base es solo texto).
- Ejecucion adaptativa por dispositivo (CPU, GPU NVIDIA, Apple Silicon) mediante run-any-model.

## Casos de uso

- Asistente de codigo en local para desarrolladores: ejecutable en un portatil con Apple Silicon (10,77 GB de memoria unificada) o GPU NVIDIA de 11,43 GB de VRAM, permite autocompletado, explicacion y refactorizacion sin enviar codigo a servicios externos.
- Revision de pull requests en entornos con requisitos de privacidad: al correr en local con llama.cpp u Ollama, el codigo no sale de la maquina, lo que encaja en equipos con politicas estrictas de confidencialidad.
- Generacion de tests unitarios y documentacion tecnica: el modelo puede producir casos de prueba y docstrings a partir de fragmentos de codigo, integrable en scripts de CI mediante la CLI de llama.cpp.
- Prototipado rapido en entornos sin GPU dedicada: con 12,77 GB de RAM libre y soporte AVX2/AVX-512, se puede usar en un PC de sobremesa para tareas de generacion de codigo con contexto de hasta 4.096 tokens.
- Chat tecnico integrado en IDE o escritorio: compatible con LM Studio y Jan, lo que permite desplegarlo como backend local de asistentes de programacion.
- Educacion y experimentacion: al ser una cuantizacion ligera y de licencia permisiva, sirve para estudiar el comportamiento de un modelo de 14B en tareas de codigo sin infraestructura de datacenter.
- Automatizacion de tareas de migracion de codigo: traduccion entre lenguajes o frameworks en lotes, ejecutando el modelo con Ollama y procesando ficheros por linea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una matriz de telemetria de recursos (no de calidad por tarea) generada por el propio motor run-any-model:

| Metrica | FP16 (base) | Q5_K_M (esta cuantizacion) | Variacion |
|---|---|---|---|
| Precision | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 28,89 GB | 9,93 GB | -65,6 % |
| Buffer de cache KV | 768 MB | 768 MB | Optimizado |
| RAM residente total | 29,73 GB | 10,77 GB | -63,8 % |
| Calidad estimada | 100 % | 97,5 % (estimacion del autor) | -2,5 % |
| Capas aceleradas | 0 % | 48/48 | Optimo |

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 10,77 GB de memoria unificada, contexto optimo de 8.192 tokens, aceleracion Metal nativa.
- GPU NVIDIA (RTX 30/40/50): 11,43 GB de VRAM dedicada, contexto optimo de 8.192 tokens, aceleracion CUDA.
- PC Windows/Linux con CPU: 12,77 GB de RAM libre, contexto optimo de 4.096 tokens, con soporte AVX2/AVX-512.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs de 8 GB no cabe con este esquema Q5_K_M.
- Opciones de despliegue: run-any-model (CLI), llama.cpp (`llama-cli -ngl 99`), Ollama (mediante Modelfile), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card no publica tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de esta cuantizacion frente a alternativas, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-Coder-14B-Instruct-GGUF (esta ficha) | 14,77 B | 8.192 tokens (optimo reportado) | GGUF Q5_K_M, 9,93 GB | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-Coder-14B-Instruct (original) | 14,77 B | No disponible en la informacion | safetensors FP16, 28,89 GB | Apache 2.0 | Hugging Face (oficial) |
| Otras cuantizaciones GGUF de Qwen2.5-Coder-14B-Instruct | 14,77 B | Depende del runtime | GGUF (varios esquemas) | Apache 2.0 | Hugging Face |

Comparativa de rendimiento frente a otros modelos de codigo: no disponible.

## Limitaciones y advertencias

- La cifra de retencion de calidad del 97,5 % es una estimacion del autor de la cuantizacion, no un resultado de benchmarks independientes; conviene validar el modelo en las tareas concretas antes de usarlo en produccion.
- La cuantizacion Q5_K_M introduce perdida de precision respecto a FP16; en tareas de codigo complejas o razonamiento largo puede degradarse mas de lo que sugiere esa estimacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-25; no hay evidencia de uso ni validacion por terceros.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingue fuera del ingles y el chino habituales en la familia Qwen.
- El contexto optimo reportado (8.192 tokens en GPU/Apple Silicon, 4.096 en CPU) es menor que el contexto nativo del modelo base; configurar ventanas mayores puede aumentar el consumo de memoria y degradar el rendimiento.
- Soporte de tool calling, agentes y razonamiento multi-paso no confirmado en esta cuantizacion GGUF; requiere validacion con el runtime elegido.
- Licencia Apache 2.0 permisiva para uso comercial, pero la model card incluye un descargo de responsabilidad absoluto: el autor no asume responsabilidad por el contenido generado y el usuario debe auditar todas las salidas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en APIs inexistentes o fragmentos de codigo inventados; es obligatorio revisar el codigo generado antes de ejecutarlo.
- Sesgos conocidos del modelo base no documentados en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-Coder-14B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Motor de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
