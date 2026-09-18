# ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF_v2

## Resumen

Esta ficha describe `ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF_v2`, una conversion a GGUF del modelo base `Qwen/Qwen3.8-Flash-Next` realizada por el usuario ji-farthing. Se trata exclusivamente de un artefacto de cuantizacion en formato GGUF para el runtime `ik_llama.cpp`, no de un modelo entrenado desde cero: el autor no publica datos de entrenamiento propios, sino el proceso de conversion, cuantizacion y validacion de los pesos originales. El modelo resultante es text-only (sin vision ni audio) y esta orientado a generacion de texto y cargas de trabajo de codificacion agentica.

El modelo base tiene 176.943.899.520 parametros totales (aproximadamente 177.000 millones) segun los pesos en safetensors, y la arquitectura presenta tensores de expertos enrutados y de experto compartido (`ffn_*_exps`, `ffn_down_shexp`), lo que indica un diseno de mezcla de expertos (MoE). No se especifica en la informacion disponible el numero de parametros activos por token ni la longitud de contexto nativa del modelo base.

La relevancia de este artefacto es fundamentalmente practica: consigue un tamano de 80,72 GiB con una divergencia KL equivalente a la de la version IQ4_KT anterior (88,42 GiB), es decir, reduce el peso en unos 7,7 GiB manteniendo la fidelidad respecto al BF16 de referencia. Ademas, exige una revision concreta de `ik_llama.cpp` que incorpora cambios en el tratamiento de colas de fila de 32 elementos para IQ3_KT/IQ4_KT, por lo que no es cargable en builds existentes de `main`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; los tensores publicados indican transformer con mezcla de expertos (MoE) y tabla PLE (per-layer embeddings) de 160 columnas |
| Parametros totales | 176.943.899.520 (segun safetensors del modelo base) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible en la informacion del modelo; la configuracion de validacion uso `-c 32768` |
| Tipos de cuantizacion | IQ4_KT_v2 (unica variante publicada en este repositorio). Composicion interna: 713 tensores IQ4_KT, 96 IQ3_KT, 25 Q8_0, 1 Q6_K, 388 F32 y 1 F16 |
| Idiomas soportados | No disponible. El corpus de calibracion mezcla ingles tecnico/agentico (45 %), codigo (30 %), prosa general en ingles (15 %) y prosa en chino (10 %) |
| Licencia | qwen-community-license-1.0 (`license: other`), enlazada al LICENSE del modelo base |
| Formato de pesos | GGUF, dividido en dos shards (`-00001-of-00002` y `-00002-of-00002`); el modelo base original esta en safetensors/BF16 |
| Tamano total del repositorio | 86,7 GB |
| Tamano del archivo cuantizado | 80,72 GiB (44,41 GiB + 36,31 GiB) |
| Runtime requerido | `ik_llama.cpp` con los cambios de cola de fila KT (candidato `0b7b979`) |
| Modalidades | Solo texto |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo `Qwen/Qwen3.8-Flash-Next`, cuya revision de origen es `de4b8e4d43b917e7706784d8bb445c9af86a3540`. La presencia de tensores `ffn_.*_exps` (puertas y proyecciones de subida de expertos enrutados), `ffn_down_exps` y `ffn_down_shexp` (experto compartido) confirma un diseno de mezcla de expertos con al menos una rama de experto compartido. El modelo incorpora ademas una tabla PLE (per-layer embeddings) de 160 columnas de ancho, a la que se aplica una convolucion de cuatro columnas, y un cabezal de borrador MTP (multi-token prediction) opcional, publicado en el repositorio anterior, que puede emplearse para decodificacion especulativa. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original ni las etapas de alineacion (RLHF, DPO u otras) del modelo base.

El trabajo de este repositorio es de conversion y cuantizacion, no de entrenamiento. La conversion a BF16 se hizo con `convert_hf_to_gguf.py` de llama.cpp en el commit `f8dbcd6`, y la cuantizacion se ejecuto en el commit `bd7c321` usando la matriz de importancia `qwen4exp-agentic-v3.imatrix`, disponible en el repositorio anterior. Esa matriz se calculo sobre 700 fragmentos de 2048 tokens con un corpus disenado para un despliegue de codificacion agentica: 45 % ingles tecnico y agentico, 30 % codigo (incluida la totalidad del codigo fuente de `ik_llama` y `llama.cpp`), 15 % prosa general en ingles y 10 % prosa en chino. La innovacion tecnica destacable es el uso de IQ4_KT para la tabla PLE y para las puertas y proyecciones de subida de expertos enrutados, junto con IQ3_KT para `ffn_down_exps` y `ffn_down_shexp`; la convolucion PLE de cuatro columnas cae a F16 y los embeddings de tokens usan Q8_0. El cambio de runtime requerido son las modificaciones de cola de fila de 32 elementos para IQ3_KT/IQ4_KT, validadas en el candidato `0b7b979`, que paso 5488 comprobaciones de operaciones IQ3_KT/IQ4_KT y 32 generaciones CPU/CUDA en modelo diminuto.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` y pipeline `text-generation`).
- Generacion de codigo: la calibracion esta especificamente orientada a codificacion agentica y el texto de validacion en codigo (CPython y PostgreSQL) muestra una divergencia KL media de 0,124558 y un 93,216 % de coincidencia en el token mas probable respecto al BF16.
- Texto tecnico en ingles orientado a agentes: la matriz de importancia dedica el 45 % del corpus a ingles tecnico y agentico.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` y el uso de `--jinja` implican soporte de plantillas de chat para servirlo como endpoint.
- Decodificacion especulativa mediante el cabezal borrador MTP, disponible de forma opcional en el repositorio anterior.
- Capacidad multilingue limitada: el modelo base no declara idiomas y la calibracion solo incluye un 10 % de prosa en chino, por lo que no hay garantia de calidad fuera de ingles y codigo.
- No soporta vision, audio ni entrada multimodal (etiqueta `text-only`).
- No se ha documentado en la informacion disponible el soporte de tool calling o function calling nativo mas alla de lo que habilita la plantilla Jinja del modelo base.

## Casos de uso

- Codificacion agentica en local: el artefacto esta calibrado con un corpus 45 % agentico y 30 % codigo, incluyendo el codigo fuente completo de `ik_llama` y `llama.cpp`, por lo que es adecuado para asistentes que editan repositorios y ejecutan ciclos de razonamiento multipaso en una estacion de trabajo.
- Despliegue en hardware de gama media: la configuracion validada (`--defer-ple`, expertos enrutados en CPU) usa una RTX 4070 de 12 GB de VRAM con 64 GB de RAM de sistema, lo que permite servir un modelo de 177.000 millones de parametros sin GPU de datacenter.
- Servicio de chat compatible con API: mediante `llama-server` con `--jinja` y la etiqueta `endpoints_compatible`, puede exponerse como endpoint conversacional para integrarse en herramientas internas que consuman APIs compatibles con OpenAI.
- Asistencia sobre bases de codigo grandes: con `-c 32768 -b 2048 -ub 2048` y cache KV cuantizada en Q8_0, es viable mantener contexto amplio de un repositorio o de varios archivos durante una sesion de refactorizacion.
- Aceleracion por decodificacion especulativa: el cabezal MTP del repositorio anterior puede usarse como borrador para reducir el coste por token en generacion larga, siempre que el runtime lo soporte.
- Investigacion en cuantizacion: el repositorio documenta divergencia KL, coincidencia de top-1, recuentos de tensores y hashes SHA256, lo que lo convierte en un artefacto de referencia para estudiar el efecto de IQ4_KT/IQ3_KT con matrices de importancia especificas de dominio.
- Procesamiento de texto tecnico en ingles: la validacion sobre fragmentos de 2048 tokens de documentacion y codigo tecnicos sugiere un comportamiento estable en tareas de resumen, extraccion y transformacion de texto tecnico en ingles.
- Entornos sin conectividad: al ser un GGUF local con licencia de comunidad y pesos descargables, puede operarse en infraestructura aislada, siempre que se cumpla la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Lo unico documentado es la divergencia KL frente al modelo BF16 de referencia, medida sobre diez fragmentos de 2048 tokens de dos textos retenidos. Las perplejidades de referencia fueron 3,3316 en ingles y 1,7218 en codigo.

| Archivo | Tamano | KLD media en ingles | Mismo top-1 (ingles) | KLD media en codigo | Mismo top-1 (codigo) |
|---|---:|---:|---:|---:|---:|
| IQ3_KT anterior con fallbacks IQ4_NL | 80,22 GiB | 0,151454 | 85,054 % | 0,134990 | 92,131 % |
| IQ4_KT anterior con fallbacks IQ4_NL | 88,42 GiB | 0,132548 | 85,738 % | 0,124749 | 92,414 % |
| IQ4_KT_v2 (este repositorio) | 80,72 GiB | 0,132805 | 86,276 % | 0,124558 | 93,216 % |

El autor indica que, en estas muestras, la divergencia de la v2 es aproximadamente igual a la del IQ4_KT anterior con un tamano cercano al del IQ3_KT anterior, y que la coincidencia de token mas probable es superior a la de ambos. Se advierte explicitamente de que esto no establece equivalencia en otras cargas de trabajo ni correccion del codigo generado. La validacion cualitativa se hizo con las revisiones de campana `563ede2` y `8eb6566`; el candidato final reducido `0b7b979` paso 5488 comprobaciones de operaciones y 32 generaciones en modelo diminuto, y los cuatro textos generados coincidieron con los resultados previos.

## Requisitos de hardware

- Almacenamiento: 80,72 GiB para los dos shards del modelo, mas 25,03 GiB de la tabla PLE si no se descarta en memoria con `--defer-ple`.
- VRAM minima validada: 12 GB (RTX 4070) con 64 GB de RAM de sistema, dejando los expertos enrutados en CPU mediante `-ot 'ffn_.*_exps=CPU'` y la tabla PLE en disco con `--defer-ple`.
- GPU recomendadas: no hay datos publicados para A100, H100 u otras GPU de datacenter. La unica ruta validada es CUDA en una RTX 4070 de 12 GB. Metal esta diferido y la ejecucion en Vulkan y multi-GPU esta sin validar.
- Viabilidad en GPU de consumo: si, validada en RTX 4070 de 12 GB, condicionada a disponer de 64 GB de RAM de sistema y del runtime modificado.
- Opciones de despliegue: exclusivamente `ik_llama.cpp` (binario `llama-server`) con los cambios de cola de fila KT. No hay evidencia de soporte en vLLM, Ollama, TGI ni en llama.cpp de `main`.
- Comando de referencia del autor: `GGML_CUDA_NO_PINNED=1 llama-server -m Qwen3.8-Flash-Next-ik_llama-IQ4_KT_v2-00001-of-00002.gguf --defer-ple -ngl 49 -ot 'ffn_.*_exps=CPU' -c 32768 -b 2048 -ub 2048 -fa on -ctk q8_0 -ctv q8_0 --jinja`.
- Latencia y throughput: no disponibles. El autor senala que las comprobaciones realizadas no establecen una nueva medicion de throughput.
- Aceleracion opcional: el cabezal borrador MTP del repositorio anterior puede habilitar decodificacion especulativa, aunque este repositorio solo contiene el modelo principal.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos de parametros comparables en la informacion proporcionada, por lo que no es posible una comparativa de capacidades. La comparacion disponible es interna a la propia familia de cuantizaciones del mismo modelo base.

| Artefacto | Parametros | Tamano | KLD ingles | KLD codigo | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| `Qwen/Qwen3.8-Flash-Next` (BF16, modelo base) | 176.943.899.520 | No disponible | 0 (referencia; perplejidad 3,3316) | 0 (referencia; perplejidad 1,7218) | qwen-community-license-1.0 | HuggingFace |
| IQ4_KT anterior con fallbacks IQ4_NL | 176.943.899.520 | 88,42 GiB | 0,132548 | 0,124749 | qwen-community-license-1.0 | Repositorio anterior del mismo autor |
| IQ3_KT anterior con fallbacks IQ4_NL | 176.943.899.520 | 80,22 GiB | 0,151454 | 0,134990 | qwen-community-license-1.0 | Repositorio anterior del mismo autor |
| IQ4_KT_v2 (este repositorio) | 176.943.899.520 | 80,72 GiB | 0,132805 | 0,124558 | qwen-community-license-1.0 | HuggingFace |

Comparado con alternativas de otros desarrolladores del mismo orden de parametros, la informacion disponible no permite establecer parametros, contexto, rendimiento ni disponibilidad, por lo que esos campos quedan como no disponibles.

## Limitaciones y advertencias

- Compatibilidad de runtime critica: el archivo requiere `ik_llama.cpp` con los cambios de cola de fila de 32 elementos para IQ3_KT/IQ4_KT y fue validado en el candidato `0b7b979`. Una build existente de `main` probablemente no puede cargarlo. La rama de origen y el pull request estan pendientes de publicacion.
- Artefacto de prueba: el autor describe explicitamente esta subida como el artefacto de prueba de ese envio, no como una version estable para produccion.
- Estado de validacion desigual: CPU y CUDA estan validados; Metal esta diferido; Vulkan y la ejecucion multi-GPU no estan validados.
- Validacion limitada: las comprobaciones de generacion se hicieron con cuatro prompts estandar y no establecen equivalencia de comportamiento fuera de esas muestras. La coincidencia de texto no garantiza la correccion del codigo generado.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de veracidad, tasas de alucinacion ni robustez del modelo base en la informacion disponible.
- Sesgos: no hay informacion sobre evaluaciones de sesgo. El corpus de calibracion esta sesgado hacia ingles tecnico, codigo y agentes, con solo un 10 % de prosa en china, lo que puede degradar el comportamiento en otros idiomas.
- Idiomas: el modelo base no declara idiomas soportados; la calidad fuera de ingles y codigo no esta caracterizada.
- Licencia: se aplica la qwen-community-license-1.0, una licencia de tipo "other" con condiciones especificas. Es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que puede imponer restricciones y obligaciones de atribucion.
- Rendimiento no medido: no hay cifras de latencia ni de tokens por segundo publicadas para esta configuracion.
- Datos de adopcion: el repositorio registra 0 descargas y 0 likes en la fecha de consulta, por lo que no existe validacion por parte de terceros.
- Dependencia de cuantizacion: el uso de IQ3_KT en los tensores de bajada de expertos implica mayor perdida de precision en esas capas que en el resto; la divergencia medida es baja en las muestras probadas, pero no se ha verificado en cargas de trabajo distintas.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF_v2
- Descarga del shard 1: https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF_v2/resolve/main/Qwen3.8-Flash-Next-ik_llama-IQ4_KT_v2-00001-of-00002.gguf?download=true
- Descarga del shard 2: https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF_v2/resolve/main/Qwen3.8-Flash-Next-ik_llama-IQ4_KT_v2-00002-of-00002.gguf?download=true
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio anterior con el cabezal borrador MTP y la matriz de importancia: https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF
- Runtime requerido: https://github.com/ikawrakow/ik_llama.cpp
- Revision de origen del modelo base: `de4b8e4d43b917e7706784d8bb445c9af86a3540`
- Hashes SHA256 publicados: `ec93c09fbf565aad11e915f9faa6208c272c3d278bc9ea74323899c5340ab5b5` (archivo sin dividir) y `0c62a85e6705dc3c3d9efa2245bbf7af03cbe00c63d29a79b1440a09c444f13e` (shard 1)
- Nota sobre la busqueda web: los resultados obtenidos no contienen enlaces relevantes al modelo; corresponden a entidades no relacionadas con el proyecto.
