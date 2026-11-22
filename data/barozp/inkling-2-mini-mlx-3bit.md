# barozp/Inkling-2-Mini-MLX-3bit

## Resumen

Inkling-2-Mini-MLX-3bit es una conversión cuantizada a 3 bits en formato MLX del modelo thinkingmachines/Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab. Se trata de un modelo de arquitectura MoE con transformer "looped" (capas del núcleo que se ejecutan varias veces por token), pensado para generación de texto, código, agentes e imágenes, y publicado con licencia Apache 2.0. Esta versión concreta la mantiene el usuario barozp y está orientada a inferencia en Apple Silicon mediante la librería mlx-lm.

El interés de esta release radica en que el checkpoint original ya viene comprimido: sus expertos enrutados (el 77 % de los pesos) están en NVFP4 y MXFP8, lo que suma unos 20 GB. Las conversiones a 4 bits existentes apenas reducen ese peso, porque no tocan los expertos. Esta versión re-cuantiza los propios expertos con una receta mixta (3 y 4 bits según la capa, GPTQ con act-order) y baja el conjunto a 14,65 GB, manteniéndose estadísticamente a la par del original en los benchmarks publicados.

El modelo tiene 20.867.891.200 parámetros totales según los safetensors del repo, un tamaño de repositorio de 14,6 GB y una media de 4,26 bits por peso cuantizado. Está pensado para ejecutarse en Macs de 24 GB de memoria unificada, un segmento donde las alternativas de 4 bits dejan poco margen para contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con transformer looped (capas del nucleo 6-17 ejecutadas tres veces por token) |
| Parametros totales | 20.867.891.200 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probado con exito en recuperacion de aguja con prompts de 31.543 tokens) |
| Tipos de cuantizacion | 3 bits y 4 bits mixtos con GPTQ act-order; atencion a 8 bits; embedding a 5 bits; cabeza de salida a 6 bits; expertos down de capas 0-19 en NVFP4 original |
| Idiomas soportados | no disponible (la calibracion incluye turco, y se prueba una pregunta en turco) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, libreria mlx-lm) |

## Arquitectura y entrenamiento

El modelo base es un MoE con transformer "looped": las 12 capas del nucleo (6-17) se ejecutan tres veces por token, de modo que los errores de cuantizacion en esas capas se acumulan tres veces. Los expertos enrutados representan el 77 % de los pesos y vienen ya comprimidos en el checkpoint oficial: NVFP4 en las capas 0-19 y MXFP8 en las capas 20-23. El resto de componentes (atencion, embedding, cabeza, torre de vision, routers, controladores de bucle y normas) esta en BF16 en el original.

Esta conversion no parte de una copia BF16 en disco ni pasa por GGUF: los expertos se descomprimen uno a uno en memoria y se re-cuantizan directamente. La receta se eligio mediante una busqueda comparando divergencia KL sobre texto crudo y conversaciones con plantilla de chat. Las decisiones clave son: proyecciones gate/up de expertos en capas 0-5 y 18-23 a 3 bits (grupo 64, GPTQ act-order); las mismas proyecciones en el nucleo 6-17 a 4 bits (grupo 128) para limitar la acumulacion de error; proyecciones down de expertos en capas 0-19 conservadas byte a byte en NVFP4; atencion a 8 bits; embedding a 5 bits y cabeza a 6 bits. La calibracion de GPTQ usa 256 secuencias de 2048 tokens con mezcla de UltraChat (50 %), Python de la stdlib (20 %), Wikipedia en turco (15 %) y datos de mlx-lm.

## Capacidades

- Generacion de texto conversacional y explicaciones en lenguaje natural.
- Generacion de codigo en varios lenguajes (se evalua con prompts de Python y JavaScript).
- Razonamiento y respuesta a preguntas de conocimiento general (MMLU, ARC-Challenge).
- Capacidades de agente y flujos multi-paso, segun la model card del modelo base.
- Procesamiento de imagenes: el checkpoint incluye torre de vision, aunque esta conversion no documenta pruebas multimodales.
- Capacidades multilingues parciales: la calibracion incluye turco y se reporta una prueba de generacion en ese idioma.
- Recuperacion de informacion en contexto largo: 3/3 en pruebas de aguja con prompts de 7.931 y 31.543 tokens.
- Decodificacion especulativa disponible en un pack hermano (MTPLX) con la cabeza draft DSpark.

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac: el modelo genera funciones y explicaciones a unos 38 tok/s en un M5 Pro de 24 GB, suficiente para autocompletado y chat interactivo sin enviar codigo a la nube.
- Prototipado de agentes en Apple Silicon: al ocupar 14,6 GB tras la carga, deja margen en maquinas de 24 GB para ejecutar el bucle del agente, herramientas y contexto adicional en el mismo equipo.
- Analisis de documentos largos: con recuperacion verificada a 31.543 tokens, sirve para resumir o consultar informes extensos, aunque conviene limitar el tamano de prefill por memoria.
- Atencion al cliente automatizada en local: el modelo mantiene conversaciones multi-turno y su divergencia KL en modo chat (0,0729) es aceptable para respuestas de soporte de complejidad media.
- Evaluacion e investigacion de tecnicas de cuantizacion: la model card documenta receta, calibracion y metricas de fidelidad, lo que lo convierte en una referencia reproducible para estudiar cuantizacion mixta con GPTQ en MoE.
- Generacion de contenido multilingue ligero: con calibracion en turco e ingles, es util para borradores y traducciones informales en esos idiomas en entornos sin GPU dedicada.
- Despliegue educativo o de demostracion: su licencia Apache 2.0 y su tamano permiten incluirlo en talleres y demos sobre Macs de gama alta.

## Benchmarks y rendimiento

Resultados de calidad con lm-evaluation-harness 0.4.13, 0-shot y loglikelihood, plantilla de chat desactivada. MMLU con las primeras 50 preguntas por materia (2.847), ARC-Challenge completo (1.172), Winogrande completo (1.267) y HellaSwag con las primeras 1.000.

| Tarea | Metrica | Fuente (20 GB) | Este repo (14,65 GB) | Delta | ± stderr |
|---|---|---:|---:|---:|---:|
| mmlu | acc | 0,7954 | 0,7940 | -0,0014 | 0,0072 |
| arc_challenge | acc_norm | 0,6971 | 0,6911 | -0,0060 | 0,0135 |
| winogrande | acc | 0,7253 | 0,7245 | -0,0008 | 0,0126 |
| hellaswag | acc_norm | 0,6620 | 0,6560 | -0,0060 | 0,0150 |
| media | | 0,7200 | 0,7164 | -0,0036 | |

Fidelidad frente al original (teacher forcing, divergencia KL de la distribucion del siguiente token):

| Metrica | Valor |
|---|---:|
| KL media en texto crudo (prosa y codigo) | 0,0125 |
| KL media en conversaciones con plantilla de chat | 0,0729 |
| Coincidencia top-1, texto crudo / chat | 96,36 % / 91,17 % |
| Perplejidad, fuente / este repo | 3,595 / 3,623 |
| Recuperacion de aguja, prompt de 7.931 tokens | 3/3 |
| Recuperacion de aguja, prompt de 31.543 tokens | 3/3 |

Rendimiento en Apple M5 Pro, 24 GB de memoria unificada, mlx 0.32.4, decodificacion greedy:

| Prompt | Tokens de prompt | Tokens nuevos | tok/s de generacion |
|---|---:|---:|---:|
| Funcion Python | 37 | 256 | 37,8 |
| Explicacion (por que el cielo es azul) | 25 | 256 | 38,3 |
| Pregunta en turco | 39 | 256 | 38,4 |
| Consejos de JavaScript | 29 | 256 | 38,4 |
| Media | | | 38,2 |
| Prompt largo (prefill de 956 tok/s) | 3.779 | 64 | 36,5 |

## Requisitos de hardware

- Memoria: 14,6 GB tras la carga; 14,8 GB de pico con prompts cortos y 16,6 GB con un prompt de 3.779 tokens.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor lo prueba en un M5 Pro de 24 GB. No hay datos publicados para GPU NVIDIA o AMD.
- Cabe en Macs de 24 GB de memoria unificada, con `--prefill-step-size 512` obligatorio: con el valor por defecto de 2048 se agoto la memoria de Metal en la prueba del autor.
- Tiempo de carga: unos 4 segundos.
- Despliegue: mlx-lm (con la PR #2086 de mlx-lm para el soporte necesario); existe un pack hermano MTPLX con cabeza draft para decodificacion especulativa.
- Throughput: unos 38,2 tok/s de generacion en el M5 Pro de referencia y 956 tok/s de prefill con prompts largos.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Media en benchmarks | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| barozp/Inkling-2-Mini-MLX-3bit (este) | 20,87 B | 14,65 GB | no disponible (probado a 31,5k) | 0,7164 | apache-2.0 | MLX en Hugging Face |
| mlx-community/Inkling-2-Mini-4bit | no disponible | 17,3 GB | no disponible | 0,7136 | no disponible | MLX en Hugging Face |
| thinkingmachines/Inkling-2-Mini (original) | 20,87 B | ~20 GB | no disponible | 0,7200 | apache-2.0 | checkpoint oficial |

Frente al 4 bits de mlx-community, esta version ocupa 2,65 GB menos y obtiene una media ligeramente superior (0,7164 frente a 0,7136) con el mismo protocolo. Frente al original de 20 GB, la perdida media es de 0,0036, dentro de un error estandar.

## Limitaciones y advertencias

- Solo esta pensado para Apple Silicon y la libreria mlx-lm; no es portable a vLLM, llama.cpp, Ollama ni TGI.
- Requiere una version de mlx-lm con la PR #2086; versiones anteriores pueden no cargar el modelo.
- En Macs de 24 GB hay que reducir el tamano de prefill (`--prefill-step-size 512`), o la inferencia con prompts largos agota la memoria de Metal.
- La divergencia KL en modo chat (0,0729) es notablemente mayor que en texto crudo (0,0125), y la coincidencia top-1 baja al 91,17 % en conversaciones: puede haber degradacion en respuestas conversacionales.
- No se documentan los idiomas soportados ni los parametros activos del MoE; la evaluacion multilingue se limita a una prueba en turco.
- Riesgo de alucinacion y sesgos del modelo base no cuantificados en la informacion disponible; la cuantizacion agresiva de los expertos puede ampliar estos efectos en dominios fuera de la calibracion (chat, codigo, turco, texto general).
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de calibracion.
- El repo tiene muy poca traccion (2 descargas, 0 likes) y fue creado en noviembre de 2026; no hay validacion independiente de las metricas mas alla de las del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/barozp/Inkling-2-Mini-MLX-3bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pack MTPLX con cabeza draft DSpark: https://huggingface.co/barozp/Inkling-2-Mini-MTPLX-3bit
- Build sin censura con la misma receta: https://huggingface.co/barozp/Inkling-2-Mini-Uncensored-MLX-3bit
- Conversion de referencia a 4 bits: https://huggingface.co/mlx-community/Inkling-2-Mini-4bit
