# EryriLabs/EryriLabs-cymraeg-4B-GGUF

## Resumen

EryriLabs-cymraeg-4B-GGUF es la distribucion cuantizada en formato GGUF del modelo EryriLabs-cymraeg-4B, un ajuste fino (fine-tune) en lengua galesa (cymraeg) sobre Gemma 4 E4B. Lo desarrolla EryriLabs, y su proposito es ofrecer un modelo de generacion de texto especializado en gales, un idioma de bajos recursos en el ecosistema de modelos abiertos, manteniendo a la vez competencia en ingles. La version GGUF esta pensada para inferencia local con llama.cpp y llama-server, lo que facilita su despliegue en hardware de consumo sin depender de GPUs de centro de datos.

La relevancia del modelo reside en su enfoque: en lugar de un modelo generalista multilingue, se trata de un fine-tune dirigido que busca mejorar el rendimiento en tareas practicas en gales, medido con un benchmark propio del autor, CymraegBench v0.1. El autor reporta una puntuacion global de 57,46 (razonamiento 53,26 y gales practico 61,67) en una ejecucion local, frente a 49,94 de la version v4 en el mismo entorno. Estos datos proceden de la model card y no han sido verificados de forma independiente.

El repositorio GGUF contiene un unico archivo Q8_0 de 8,7 GB, convertido con llama.cpp b12019. La informacion publica disponible es escasa: no se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni resultados de benchmarks estandar como MMLU o HumanEval, por lo que esta ficha marca explicitamente como "no disponible" todo dato que no figure en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E4B; detalles no disponibles) |
| Parametros totales | 4B (segun denominacion del modelo; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16384 tokens (valor usado en el comando de ejemplo del autor con `-c 16384`) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | Gales (cy) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `EryriLabs-cymraeg-4B-Q8_0.gguf`, 8,7 GB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B, y EryriLabs-cymraeg-4B es un fine-tune sobre el mismo orientado al gales. La model card del repositorio GGUF remite al repositorio principal (`EryriLabs/EryriLabs-cymraeg-4B`) para los detalles de datos de entrenamiento, resultados y debilidades conocidas; esa informacion no se incluye en la ficha disponible. Por tanto, no se puede confirmar el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La innovacion tecnica destacable en este repositorio es la conversion a GGUF con llama.cpp b12019 y la publicacion de una unica cuantizacion Q8_0, que preserva practicamente la precision del modelo original a costa de un tamano de 8,7 GB. El comando de referencia del autor usa `--jinja` para plantillas de chat y `--reasoning off`, lo que sugiere que el modelo base dispone de un modo de razonamiento que puede desactivarse. No se documentan otras innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en gales y en ingles, con enfasis en tareas practicas en gales segun el benchmark propio del autor.
- Razonamiento: la model card reporta una puntuacion de razonamiento de 53,26 en CymraegBench v0.1.
- Conversacion multi-turno mediante plantillas de chat compatibles con `--jinja` en llama-server.
- Modo de razonamiento conmutable (el comando de ejemplo lo desactiva con `--reasoning off`).
- Capacidades multilingues limitadas a gales e ingles segun los metadatos de idioma.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia editorial en gales: el modelo puede redactar, revisar y reformular textos en cymraeg, aprovechando su fine-tune especifico y su contexto de 16384 tokens para documentos de longitud media.
- Traduccion gales-ingles: al estar entrenado en ambos idiomas, encaja en flujos de traduccion asistida o postedicion, con revision humana dado el riesgo de alucinacion.
- Atencion al ciudadano en gales: despliegue local con llama-server para responder consultas en gales en entornos con requisitos de privacidad, sin enviar datos a servicios externos.
- Educacion y aprendizaje del idioma: generacion de ejercicios, explicaciones y correcciones en gales para plataformas de aprendizaje, con el modo de razonamiento activado cuando se requiera justificar respuestas.
- Prototipado en hardware de consumo: al caber en una unica GPU consumer en Q8_0 (8,7 GB), permite experimentar con un modelo especializado en gales en estaciones de trabajo locales.
- Investigacion sobre lenguas de bajos recursos: servir como punto de comparacion reproducible frente a modelos generalistas multilingues en evaluaciones de gales, usando CymraegBench v0.1 como referencia.
- Generacion de contenido institucional bilingue: redaccion de comunicados y textos administrativos en gales e ingles dentro de pipelines internos con llama.cpp.

## Benchmarks y rendimiento

Los unicos datos publicados proceden de una ejecucion local del autor con CymraegBench v0.1, medida sobre el archivo Q8_0:

| Benchmark | Metrica | EryriLabs-cymraeg-4B (Q8_0) | v4 (mismo entorno) |
|---|---|---:|---:|
| CymraegBench v0.1 | Global | 57,46 | 49,94 |
| CymraegBench v0.1 | Razonamiento | 53,26 | no disponible |
| CymraegBench v0.1 | Gales practico | 61,67 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras de CymraegBench v0.1 son reportadas por el autor y no han sido verificadas de forma independiente; la comparacion con "v4" se refiere a una version anterior del propio modelo segun la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB con Q8_0 (archivo de 8,7 GB mas overhead de contexto y cache KV); con contexto de 16384 tokens el consumo adicional de cache KV aumenta.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q8_0 con contexto completo; GPUs de 12-16 GB pueden funcionar con contextos reducidos.
- Cabe en GPU consumer: si, en tarjetas con al menos 12 GB de VRAM para Q8_0 con contexto moderado; no se publican otras cuantizaciones (Q4_K_M, Q5_K_M) que reducirian el requisito.
- Opciones de despliegue: llama.cpp y llama-server (comando de referencia del autor: `llama-server -m EryriLabs-cymraeg-4B-Q8_0.gguf --jinja --reasoning off -c 16384 -ngl 99`). Compatibilidad con Ollama, vLLM o TGI no esta confirmada en la informacion disponible; vLLM y TGI no son la via natural para GGUF.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EryriLabs-cymraeg-4B-GGUF | 4B | 16384 | cy, en | Apache-2.0 | GGUF (Q8_0) | Fine-tune de Gemma 4 E4B para gales; CymraegBench v0.1 global 57,46 |
| Gemma 4 E4B (base) | 4B | no disponible | multilingue | licencia de Gemma (no confirmada aqui) | safetensors, GGUF | Modelo base del fine-tune; rendimiento en gales no publicado en esta ficha |
| EryriLabs-cymraeg-4B (original) | 4B | no disponible | cy, en | Apache-2.0 | safetensors (presumible) | Version sin cuantizar del mismo fine-tune; fuente de los datos de entrenamiento |

No se dispone de datos de benchmarks estandar para comparar con modelos de la misma categoria; los unicos numeros publicados son los de CymraegBench v0.1 del propio autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; un fine-tune especializado en un solo idioma puede heredar sesgos del corpus de entrenamiento, que no se detalla.
- Riesgo de alucinacion: presente como en cualquier modelo de 4B; la model card remite a "known weaknesses" en el repositorio principal, que no se detallan aqui.
- Limitaciones de contexto e idioma: contexto de 16384 tokens usado en la configuracion de referencia; fuera de gales e ingles el rendimiento no esta garantizado ni documentado.
- Licencia: Apache-2.0 permite uso comercial, pero al derivar de Gemma 4 E4B conviene verificar las condiciones de la licencia del modelo base antes de desplegar en produccion.
- Caveat de produccion: solo se publica Q8_0 (8,7 GB), lo que limita el despliegue en GPUs de menos de 12 GB; no hay cuantizaciones menores ni versiones para vLLM.
- Los resultados de CymraegBench v0.1 son de una ejecucion local del autor, sin verificacion independiente; no deben tratarse como benchmark consolidado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion externa practicamente inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B-GGUF
- Modelo base (fine-tune): https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B
- llama.cpp (herramienta de conversion e inferencia): https://github.com/ggml-org/llama.cpp
