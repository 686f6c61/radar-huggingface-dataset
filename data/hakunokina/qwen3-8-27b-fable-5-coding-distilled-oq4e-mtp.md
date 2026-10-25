# hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ4e-mtp

## Resumen

Este repositorio es una conversión a formato MLX del modelo `khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled`, un ajuste fino orientado a código y depuración agéntica sobre el Qwen3.8-27B denso del equipo Qwen. Lo publica el usuario `hakunokina` como build de cuantización, no como modelo original: el trabajo propio consiste en cuantizar el BF16 de origen (≈54 GB) a 4 bits con la herramienta oQ de oMLX, en su variante `oQ4e` calibrada con imatrix y conservando la cabeza MTP del modelo fuente. El resultado ocupa unos 16 GB y está pensado para ejecutarse en Apple Silicon mediante el runtime oMLX ≥ 0.7.1, no en GPUs NVIDIA.

La arquitectura subyacente es la de la familia Qwen3.5: transformer denso de 64 capas con atención híbrida Gated DeltaNet más atención completa, 27.781.427.952 parámetros y una ventana de contexto declarada de 262.144 tokens. El ajuste fino de khazarai se entrenó sobre 195 millones de tokens de trazas destiladas de depuración, según la model card, y conserva el codificador de visión del modelo original (no probado en este build).

Su relevancia es acotada pero concreta: hasta la publicación de este repositorio no existía un build MLX/oQ de este fine-tune, de modo que permite ejecutar un modelo de 27B especializado en código y tool calling en un Mac Studio o en un MacBook con memoria unificada suficiente, con decodificación especulativa activada por la cabeza MTP. No hay benchmarks publicados del build; la calidad se documenta únicamente como divergencia respecto al BF16 de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet + atención completa), 64 capas, familia Qwen3.5 |
| Parámetros totales | 27.781.427.952 (≈27,8 B) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens (262k) según la model card |
| Tipos de cuantización | oQ4e: 4 bits afín, grupo 64, calibrado con imatrix; builds hermanos oQ6e y oQ8e; fuente en BF16 |
| Idiomas soportados | No disponible (la evaluación de divergencia cubre código, inglés y turco, pero no es una declaración de idiomas soportados) |
| Licencia | Apache-2.0, heredada del modelo base; el autor del fine-tune marca licencia y detalles de entrenamiento como pendientes de confirmar |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); no se ofrece GGUF en este repositorio |
| Tamaño del repositorio | 17,0 GB (pesos ≈16 GB) |
| Runtime requerido | oMLX ≥ 0.7.1; no probado con `mlx-lm` estándar ni con LM Studio |
| Cabeza MTP | Conservada, habilita decodificación especulativa en oMLX |
| Codificador de visión | Conservado del modelo fuente; entrada de imagen no probada en este build |
| Pipeline declarado | `image-text-to-text` |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,8 B parámetros con una arquitectura híbrida propia de la familia Qwen3.5: 64 capas que combinan capas Gated DeltaNet (atención lineal con estado recurrente) y un subconjunto de 16 capas de atención completa. Esa proporción es la que determina el coste de caché KV: la model card cifra el consumo en aproximadamente 64 KB por token sobre las 16 capas de atención completa, lo que se traduce en unos 16 GB de caché si se llena la ventana de 262k tokens. El modelo conserva también la cabeza de predicción multi-token (MTP) del fuente, que oMLX aprovecha para decodificación especulativa.

El ajuste fino lo realizó khazarai sobre 195 millones de tokens de trazas destiladas de depuración (`DSFFGFG456/fable-5-coding-and-debugging-traces`), con el objetivo declarado de obtener un modelo de código con uso de herramientas fundamentado. La model card de este build no detalla la composición del dataset, ni si hubo RLHF o DPO, ni la mezcla de datos; el autor del fine-tune deja esos detalles como pendientes de confirmación. La contribución técnica de este repositorio es la cuantización: oQ4e con calibración imatrix sobre un conjunto de código y multilingüe de oMLX, manteniendo la cabeza MTP y el codificador de visión, algo que las herramientas de cuantización habituales suelen descartar.

## Capacidades

- Generación de código en múltiples lenguajes, con especialización declarada en depuración y arreglo de errores sobre trazas de razonamiento.
- Tool calling / function calling: verificado en el build con 5 de 5 ejecuciones correctas tanto en el endpoint OpenAI `/v1/chat/completions` como en el Anthropic `/v1/messages`.
- Flujos agénticos multi-paso: el ajuste fino se entrenó sobre trazas de depuración, lo que orienta el modelo a encadenar observaciones, ediciones y verificaciones.
- Contexto largo de hasta 262.144 tokens, adecuado para recorrer repositorios o volcar logs extensos en una sola ventana.
- Decodificación especulativa mediante la cabeza MTP conservada, con ganancias que dependen de la previsibilidad de la salida.
- Entrada de imagen: el codificador de visión está presente en los pesos, pero la model card indica explícitamente que la entrada de imagen no se ha probado en este build.
- Servido simultáneo por API compatible con OpenAI y con Anthropic desde oMLX.
- Capacidades multilingües: no declaradas por el autor; la única evidencia es que el conjunto de evaluación de divergencia incluye inglés, turco y código.

## Casos de uso

- Asistencia de código local en macOS: el build se sirve en `localhost:8000` con la API de OpenAI, por lo que puede conectarse a extensiones de IDE o a clientes tipo Continue sin enviar código a un servicio externo; encaja en entornos con requisitos de confidencialidad del código fuente.
- Depuración agéntica sobre un repositorio completo: con 262k tokens de contexto se pueden cargar varios ficheros, el stack trace y los logs en una sola ventana y pedir al modelo que localice la causa raíz, algo para lo que el ajuste fino está específicamente entrenado.
- Automatización de pipelines internos con tool calling: las pruebas del autor (5/5 en ambos formatos de API) permiten integrarlo como planificador que invoca funciones de shell, APIs internas o consultas a bases de datos en un agente de CI.
- Revisión de código y generación de tests en un flujo de pre-commit: el modelo cabe en 16 GB de pesos, así que puede mantenerse residente en un Mac Studio y atender peticiones cortas con latencia baja gracias a la caché de prefijo (1,39 s al repetir un prefijo de 29k tokens).
- Prototipado de agentes con la API de Anthropic: al exponer `/v1/messages`, se pueden reutilizar SDKs y frameworks escritos para Claude sin adaptar el cliente, útil para validar diseños de agente antes de pasar a un proveedor cloud.
- Servicio de inferencia para equipos pequeños sin GPU: un único Mac con memoria unificada puede servir este modelo a un equipo de desarrollo, sustituyendo a una instancia con GPU dedicada para cargas de código interactivas.
- Investigación sobre cuantización: la model card publica KL por token y acuerdo top-1 frente al BF16, lo que permite usar este build como referencia para estudiar el impacto de oQ4e en tareas de código y compararlo con los builds oQ6e y oQ8e.
- Documentación técnica automática: generación de docstrings, descripciones de PR y notas de versión a partir de diffs, aprovechando el contexto largo para incluir el histórico reciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó ninguna suite de benchmarks sobre este build y que la calidad se reporta como divergencia respecto al BF16 de origen, sobre 64 secuencias de 512 tokens (32.700 tokens evaluados) de código, prosa en inglés y turco.

| Métrica de cuantización | Valor |
|---|---|
| KL(BF16 ‖ oQ4e), media | 0,043 nat/token |
| KL mediana / p99 | 0,016 / 0,55 |
| Acuerdo top-1 de token | 91,4 % |
| Perplejidad BF16 → oQ4e | 6,078 → 6,232 |

| Rendimiento medido (Mac Studio M3 Ultra, 512 GB, oMLX 0.7.1) | Valor |
|---|---|
| Prefill de un prompt de ~29k tokens (en frío) | ~73 s (~390 tok/s) |
| Mismo prefijo con caché de prefijo | ~1,39 s |
| Decodificación con MTP (especulativa) | ~44 tok/s |
| Tool calling, OpenAI / Anthropic (5 ejecuciones cada uno) | 5/5 · 5/5 |

Se trata de mediciones de una sola ejecución; el propio autor advierte que varían con la longitud de contexto, el contenido y la configuración, y que la ganancia de MTP depende de lo predecible que sea la salida.

## Requisitos de hardware

- VRAM/memoria unificada para pesos: ≈16 GB en oQ4e (repositorio de 17,0 GB). Alternativas del mismo autor: oQ6e ≈22 GB y oQ8e ≈28 GB.
- Caché KV: ≈64 KB por token sobre las 16 capas de atención completa, es decir, ≈2 GB a 32k tokens, ≈4 GB a 64k y ≈16 GB al llenar los 262k. Presupuesto total aproximado: 18-19 GB a 32k de contexto y ~32 GB a 262k.
- Hardware objetivo: exclusivamente Apple Silicon con memoria unificada. Un Mac de 24 GB queda muy justo (pesos más contexto corto); 32 GB es el mínimo razonable para trabajo interactivo y 64 GB o más para explotar contextos de 100k en adelante.
- GPU NVIDIA: no disponible. El build es MLX y no incluye pesos GGUF, por lo que no se puede ejecutar en A100, H100 ni RTX 4090 con este repositorio.
- Aceleradores probados: Mac Studio M3 Ultra con 512 GB, con prefill de ~390 tok/s y decodificación de ~44 tok/s.
- Opciones de despliegue: únicamente oMLX ≥ 0.7.1 (servidor local con APIs OpenAI y Anthropic). No probado con `mlx-lm` estándar ni con LM Studio; no hay variante para vLLM, TGI, llama.cpp u Ollama.
- Latencia: la caché de prefijo reduce el reprocesamiento de un prefijo de 29k tokens de ~73 s a ~1,39 s, lo que hace viable el uso conversacional repetido sobre el mismo repositorio.

## Comparativa con modelos similares

No hay datos públicos de modelos comparables de terceros en la información disponible. La comparación se limita a los builds de la misma familia publicados por el mismo autor, que comparten arquitectura y solo difieren en el esquema de cuantización:

| Build | Cuantización | Tamaño | Cabeza MTP | Divergencia KL vs BF16 | Decodificación |
|---|---|---|---|---|---|
| Este repositorio (oQ4e-mtp) | 4 bits afín, grupo 64, imatrix | ≈16 GB | Sí | 0,043 nat/token (media) | ~44 tok/s (M3 Ultra) |
| oQ6e-mtp | 6 bits (según nomenclatura del autor) | ≈22 GB | Sí | No disponible | No disponible |
| oQ8e-mtp | 8 bits (según nomenclatura del autor) | ≈28 GB | Sí | No disponible | No disponible |
| Fuente BF16 (khazarai) | Sin cuantizar | ≈54 GB | Sí | Referencia | No disponible |

Frente a otras alternativas del mercado (por ejemplo, modelos de código de 30B en GGUF para llama.cpp), no se dispone de datos de rendimiento ni de benchmarks en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval ni GSM8K para este build; la única métrica de calidad es la divergencia KL frente al BF16, que mide fidelidad de cuantización, no capacidad del modelo.
- La cola de divergencia es apreciable: el percentil 99 de KL es 0,55 nat/token frente a una mediana de 0,016, de modo que hay tokens concretos donde la cuantización se aleja bastante del original.
- Entrada de imagen no validada: el codificador de visión está en los pesos, pero el autor advierte que no se ha probado; no debe asumirse soporte multimodal en producción.
- Idiomas no declarados: la model card no enumera idiomas soportados. La evaluación cubre inglés, turco y código; el comportamiento en castellano no está verificado.
- Licencia con incertidumbre: se hereda Apache-2.0, pero el repositorio de origen marca su licencia y los detalles de entrenamiento como pendientes de confirmar. Antes de un uso comercial conviene revisar el repositorio de khazarai y, en última instancia, los términos de Qwen.
- Dependencia fuerte del runtime: requiere oMLX ≥ 0.7.1 y no se ha probado con `mlx-lm` ni LM Studio. El formato es propietario de facto (oQ) y no hay GGUF, lo que limita la portabilidad.
- Plataforma única: solo Apple Silicon. No hay ruta de despliegue en GPU NVIDIA con este repositorio.
- Riesgo de alucinación heredado: al ser un ajuste fino sobre trazas destiladas de depuración, puede reproducir razonamientos incorrectos del modelo profesor y presentar ediciones de código plausibles pero erróneas; conviene validar toda salida con tests automáticos.
- Madurez nula en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación independiente.
- Rendimiento no reproducible de forma universal: las cifras de velocidad proceden de una sola ejecución en un M3 Ultra de 512 GB; equipos con menos ancho de banda de memoria obtendrán valores sensiblemente inferiores.
- La ganancia de la decodificación especulativa depende de la previsibilidad del texto: en salidas muy creativas o de código poco habitual el advantage de MTP se reduce.

## Enlaces

- Repositorio de este build: https://huggingface.co/hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ4e-mtp
- Build hermano oQ8e-mtp: https://huggingface.co/hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ8e-mtp
- Build hermano oQ6e-mtp: https://huggingface.co/hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ6e-mtp
- Modelo base del ajuste fino (BF16): https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de trazas de código y depuración: https://huggingface.co/datasets/DSFFGFG456/fable-5-coding-and-debugging-traces
- Herramienta de cuantización y runtime oMLX: https://omlx.ai
