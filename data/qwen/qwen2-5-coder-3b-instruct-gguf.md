# Qwen/Qwen2.5-Coder-3B-Instruct-GGUF

# Qwen2.5-Coder-3B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-3B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo instructivo Qwen2.5-Coder-3B-Instruct, desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de lenguaje causal especializado en codigo, con 3.090 millones de parametros declarados por el autor (3.397.103.616 en los pesos safetensors del modelo base) y una longitud de contexto completa de 32.768 tokens. Esta variante GGUF esta pensada para inferencia local eficiente mediante llama.cpp y otros runners compatibles.

La familia Qwen2.5-Coder cubre seis tamanos (0,5, 1,5, 3, 7, 14 y 32 mil millones de parametros) y entrena sobre 5,5 billones de tokens que combinan codigo fuente, text-code grounding y datos sinteticos. El 3B se posiciona como la opcion de gama baja orientada a desarrolladores que necesitan generacion, razonamiento y correccion de codigo en hardware de consumo, manteniendo competencias en matematicas y tareas generales.

Esta publicacion concreta (subida el 9 de noviembre de 2024) ofrece ocho niveles de cuantizacion GGUF, desde q2_K hasta q8_0, con un repositorio de 27,3 GB y mas de 108.000 descargas. Su licencia es qwen-research, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con RoPE, SwiGLU, RMSNorm, Attention QKV bias y embeddings atados |
| Parametros totales | 3.090 millones segun model card; 3.397.103.616 en safetensors del modelo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens; hasta 131.072 con YARN (solo soportado por vLLM, no en GGUF) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF |

Datos adicionales de estructura: 36 capas, GQA con 16 cabezas para Q y 2 para KV, 2.770 millones de parametros sin contar embeddings.

## Arquitectura y entrenamiento

El modelo es un transformer causal (decoder-only) que incorpora Rotary Position Embeddings (RoPE), activacion SwiGLU, normalizacion RMSNorm y sesgo en las proyecciones QKV. Emplea Grouped Query Attention (GQA) con relacion 16:2 entre cabezas de query y de clave/valor, lo que reduce el coste de memoria del KV cache. Los embeddings de entrada y salida estan atados. Consta de 36 capas.

El entrenamiento se realizo en dos fases: preentrenamiento y postentrenamiento. La familia Qwen2.5-Coder escala hasta 5,5 billones de tokens de entrenamiento combinando codigo fuente, text-code grounding y datos sinteticos. Segun la model card, las mejoras respecto a CodeQwen1.5 se concentran en generacion, razonamiento y correccion de codigo. No se detallan en la informacion disponible los metodos concretos de alineacion (RLHF, DPO u otros) ni la composicion exacta del dataset de postentrenamiento.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion.
- Razonamiento sobre codigo (code reasoning): explicacion y analisis de fragmentos.
- Correccion de codigo (code fixing): deteccion y reparacion de errores.
- Competencias en matematicas y tareas generales heredadas de Qwen2.5.
- Base orientada a Code Agents (aplicaciones agente sobre codigo), segun la model card.
- Modo conversacional e instructivo (chat template integrado).
- Capacidad multilingue en lenguaje natural limitada al ingles segun la model card (el modelo base Qwen2.5 es multilingue, pero la ficha de esta variante solo declara ingles).
- Cuantizacion en ocho variantes para despliegue en distintos rangos de memoria.

## Casos de uso

- Asistente de autocompletado en editores: integrado via llama.cpp u Ollama, el modelo sugiere lineas y bloques de codigo en tiempo real sobre hardware de consumo, gracias a sus 3.090 millones de parametros.
- Revision de pull requests: analisis automatico de diffs para detectar errores, malas practicas y posibles bugs antes de fusionar, con contexto de 32.768 tokens suficiente para revisar archivos completos.
- Generacion de tests unitarios: a partir de una funcion o modulo, el modelo produce casos de prueba en el framework del proyecto.
- Explicacion de bases de codigo heredadas: dado un fragmento, el modelo razona sobre su proposito y comportamiento, util para incorporar desarrolladores a proyectos existentes.
- Traduccion entre lenguajes de programacion: conversion de logica de un lenguaje a otro (por ejemplo, de Python a TypeScript) en tareas de migracion.
- Correccion de errores en pipelines de CI: dado un log de fallo y el fragmento relevante, el modelo propone un parche que puede aplicarse manualmente o ser validado por el propio pipeline.
- Documentacion automatica: generacion de docstrings y comentarios a partir de codigo fuente.
- Prototipado local sin conexion: al ser GGUF y ejecutable en llama.cpp, permite trabajar con codigo propietario sin enviar datos a servicios externos, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion proporcionada. La model card remite a la entrada de blog del equipo Qwen (junto con el informe tecnico arXiv:2409.12186) para los resultados de evaluacion detallados, pero dichos numeros no se incluyen en los datos disponibles.

## Requisitos de hardware

Estimaciones orientativas de memoria para inferencia (pesos + overhead de contexto). Los tamanos son aproximados y dependen de la implementacion:

- q2_K: aproximadamente 1,2-1,5 GB de VRAM.
- q4_0 / q4_K_M: aproximadamente 2,0-2,5 GB de VRAM.
- q5_0 / q5_K_M: aproximadamente 2,3-2,8 GB de VRAM.
- q6_K: aproximadamente 2,7-3,1 GB de VRAM.
- q8_0: aproximadamente 3,4-3,8 GB de VRAM.
- FP16 (modelo base): aproximadamente 6,2 GB.

GPU recomendadas:

- Cabe en GPU de consumo con al menos 4 GB de VRAM (GTX 1650 4 GB, RTX 3050, RTX 4060, etc.) usando cuantizaciones q4_K_M o inferiores.
- RTX 3090, RTX 4090, A100 o H100 quedan holgadas incluso en q8_0 y permiten contextos largos con mayor batch.
- CPU pura es viable con llama.cpp, aunque con throughput bajo.

Opciones de despliegue:

- llama.cpp (soporte oficial recomendado por el autor).
- Ollama.
- vLLM (el unico runner que, segun la model card, soporta YARN para extrapolar a 131.072 tokens; no aplica al formato GGUF de este repo).
- Cualquier runtime compatible con GGUF.

Latencia y throughput: no se han publicado cifras concretas en la informacion disponible. La model card remite a la pagina de speed benchmark de la documentacion de Qwen para resultados de throughput y requisitos de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct-GGUF | 3.090 M | 32.768 (131.072 con YARN via vLLM) | qwen-research | GGUF en HuggingFace |
| Qwen2.5-Coder-7B-Instruct | 7.000 M aprox. | 32.768 (hasta 131.072) | qwen-research | Safetensors y GGUF |
| StarCoder2-3B | 3.000 M | 16.384 | BigCode OpenRAIL-M | Safetensors y GGUF |
| IBM Granite Code 3B | 3.000 M | 128.000 | Apache 2.0 | Safetensors y GGUF |

Nota: los datos de los modelos comparativos corresponden a sus caracteristicas publicas conocidas; no se dispone en la informacion proporcionada de resultados de benchmarks que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia qwen-research: es una licencia de investigacion que restringe el uso comercial. Conviene revisar el texto integro antes de utilizar el modelo en produccion.
- Idiomas: la model card declara unicamente ingles como idioma soportado. El rendimiento en castellano no esta garantizado por el autor.
- Contexto limitado en GGUF: aunque el modelo base soporta 131.072 tokens con YARN, en formato GGUF el contexto practico se limita a 32.768 tokens, ya que solo vLLM soporta YARN y no opera sobre GGUF en este caso.
- Riesgo de alucinacion: como cualquier LLM, puede generar codigo sintacticamente plausible pero incorrecto o APIs inexistentes. Es imprescindible validar la salida con tests y revision humana.
- Sesgos: no se documentan analisis especificos de sesgo en la informacion disponible; los sesgos del corpus de entrenamiento (predominantemente codigo publico de internet) pueden reflejar malas practicas, licencias incompatibles o codigo inseguro.
- Seguridad del codigo generado: puede reproducir patrones vulnerables presentes en datos publicos (inyecciones, manejo inseguro de entradas, etc.).
- Trazabilidad de cuantizacion: las cuantizaciones bajas (q2_K, q3_K_M) degradan la calidad de generacion de codigo de forma notable; para tareas exigentes se recomienda q5_K_M o superior.
- Atribucion: es una publicacion derivada del modelo base Qwen2.5-Coder-3B-Instruct; los terminos de uso del modelo base siguen aplicando.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- GitHub del proyecto: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmark de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe tecnico (arXiv): https://arxiv.org/abs/2409.12186
- Informe tecnico Qwen2 (arXiv): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF/blob/main/LICENSE
- Chat oficial de Qwen: https://chat.qwen.ai/
- Portal Qwen: https://qwen.ai/home
