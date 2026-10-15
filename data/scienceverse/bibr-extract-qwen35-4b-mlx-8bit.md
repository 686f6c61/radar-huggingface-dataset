# scienceverse/bibr-extract-qwen35-4b-mlx-8bit

## Resumen

`scienceverse/bibr-extract-qwen35-4b-mlx-8bit` es una compilacion cuantizada a 8 bits en formato MLX del modelo `scienceverse/bibr-extract-qwen35-4b`, un modelo estudiante especializado en extraccion estructurada de informacion que forma parte del proyecto bibr (herramienta de gestion bibliografica y de revisiones sistematicas desarrollada por Scienceverse). El modelo original se construye sobre la familia Qwen3.5 en su variante de 4B y se ha destilado o ajustado especificamente para devolver JSON estructurado a partir de texto cientifico o documental.

Esta version concreta no aporta pesos nuevos: es una conversion de los pesos fusionados en bf16 (revision `6ab47a4`) con `mlx_lm.convert -q --q-bits 8`, cuantizacion afín con tamano de grupo 64, usando mlx-lm 0.32.0 y mlx 0.32.3. El objetivo es permitir la ejecucion local en Macs con Apple Silicon, reduciendo el peso del repositorio a 4,5 GB para un total de 4.205.751.296 parametros.

Conviene subrayar que el autor declara explicitamente que la build solo ha pasado una prueba de humo (smoke test) sobre el backend CPU de MLX en Linux, comparando la salida en un unico prompt corto de extraccion de financiacion contra el modelo bf16, y que no ha sido evaluada con el harness de extraccion de bibr. Es, por tanto, un artefacto de conveniencia para inferencia local, no una version validada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (variante de 4B); la build descarta la torre de vision y la cabeza MTP |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (affine), tamano de grupo 64; los pesos de origen estan en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); existen builds GGUF del modelo fuente, no de esta conversion |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento del modelo fuente. Los unicos datos tecnicos disponibles son los de la conversion: se parte de los pesos fusionados en bf16 del modelo `scienceverse/bibr-extract-qwen35-4b`, se aplica cuantizacion afín de 8 bits con tamano de grupo 64 mediante `mlx_lm.convert -q --q-bits 8` sobre mlx-lm 0.32.0 y mlx 0.32.3, y se eliminan dos componentes del modelo original: la torre de vision y la cabeza MTP (multi-token prediction). El resultado es, por tanto, un modelo exclusivamente de texto.

La referencia al tag `qwen3_5` y al nombre del repositorio situan la base en la familia Qwen3.5, y la presencia de una torre de vision en el modelo original sugiere que este deriva de una variante multimodal, aunque esa capacidad no esta presente en esta build. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otros ajustes por preferencias. Tampoco se documenta ninguna innovacion de decodificacion en esta version.

Un detalle operativo relevante: el autor indica que el modelo debe usarse con el modo "thinking" desactivado, porque asi fue entrenado y evaluado. La plantilla de chat por defecto lo desactiva, pero mlx-lm 0.32 pasa `enable_thinking=True` de forma automatica cuando el vocabulario contiene `<think>`, sobrescribiendo ese valor por defecto, por lo que es necesario forzar `enable_thinking=False` de manera explicita.

## Capacidades

- Extraccion estructurada de informacion: es la funcion principal del modelo, orientada a producir salidas JSON a partir de texto de entrada, segun el caso de uso del proyecto bibr.
- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` indica soporte de plantilla de chat multi-turno.
- Procesamiento de texto unicamente: la torre de vision fue eliminada durante la conversion, por lo que no hay capacidades multimodales.
- Modo thinking: la plantilla admite el flag, pero el uso recomendado es con thinking desactivado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades de audio: no disponible.

## Casos de uso

- Extraccion de metadatos bibliograficos: el modelo esta disenado para convertir texto de articulos o referencias en campos estructurados (autores, titulo, ano, DOI, revista), que es exactamente la tarea del proyecto bibr.
- Revisiones sistematicas de literatura: permite automatizar la extraccion de datos de estudios incluidos en una revision, reduciendo el trabajo manual de tabulacion.
- Extraccion de informacion de financiacion: la unica prueba documentada por el autor es un prompt corto de extraccion de financiacion, lo que confirma que el modelo maneja ese tipo de entidad.
- Preprocesado de corpus cientifico en local: al ser una build MLX de 4,5 GB, se puede ejecutar en un Mac con Apple Silicon sin enviar documentos sensibles a servicios externos, algo relevante con material bajo embargo o datos personales.
- Prototipado de pipelines de extraccion en equipos de investigacion: sirve para iterar rapidamente sobre esquemas JSON y prompts antes de pasar a un modelo mayor o a una version evaluada.
- Integracion en herramientas de gestion de referencias: un cliente de escritorio en macOS podria invocar el modelo via `mlx_lm.server` para enriquecer entradas de una biblioteca personal.
- Normalizacion de citas y desambiguacion de entidades: util para unificar formatos de referencia dispares en una base de datos propia.
- Filtrado y clasificacion previa: como paso intermedio en un pipeline mayor, extrayendo campos concretos para decidir si un documento pasa a una fase posterior mas costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la build solo ha pasado una prueba de humo: en el backend CPU de MLX sobre Linux produjo el mismo JSON que el modelo bf16 de origen ante un unico prompt corto de extraccion de financiacion. El autor senala que no ha sido puntuada con el harness de extraccion de bibr y remite a la model card del modelo fuente y a las builds GGUF para consultar los modelos que si estan evaluados.

## Requisitos de hardware

- VRAM / memoria unificada estimada: aproximadamente 4,5 GB solo para los pesos cuantizados a 8 bits, mas el overhead del runtime y la cache KV, que depende de la longitud de contexto (no disponible). En la practica, entre 6 y 8 GB de memoria unificada para secuencias moderadas.
- Plataforma objetivo: Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX. El autor menciona que tambien se probo en el backend CPU de MLX sobre Linux.
- GPU CUDA: no aplicable de forma nativa a este formato; para NVIDIA habria que recurrir a las builds GGUF o al modelo bf16 con otros runtimes.
- GPU consumer: cabe sin problema en cualquier Mac con 8 GB o mas de memoria unificada; 16 GB resulta comodo si se trabaja con contextos largos o varias instancias.
- Opciones de despliegue: `mlx_lm.generate` para CLI, `mlx_lm.server` para servidor compatible con la API de chat, y la libreria Python mlx-lm. En `mlx_lm.generate` el flag es `--chat-template-config '{"enable_thinking": false}'` y en `mlx_lm.server`, `--chat-template-args`.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| scienceverse/bibr-extract-qwen35-4b-mlx-8bit | 4,2 B | no disponible | safetensors MLX 8 bits | Apache 2.0 | Prueba de humo, sin evaluar en el harness de bibr |
| scienceverse/bibr-extract-qwen35-4b (origen) | 4,2 B (bf16) | no disponible | safetensors bf16 | Apache 2.0 | Modelo de referencia, con resultados publicados en su model card |
| Builds GGUF del mismo modelo fuente | 4,2 B | no disponible | GGUF | Apache 2.0 | Mencionadas por el autor como las versiones puntuadas; nombres y cuantizaciones no disponibles |

No se dispone de otras alternativas comparables en la informacion proporcionada, ni de datos de rendimiento que permitan una comparacion cuantitativa entre el modelo fuente y esta conversion.

## Limitaciones y advertencias

- Validacion insuficiente: la build solo ha pasado una prueba de humo con un unico prompt. No hay garantia de que la cuantizacion a 8 bits preserve el comportamiento del modelo bf16 en tareas de extraccion mas complejas o con esquemas JSON largos.
- Sin evaluacion en el harness de bibr: el autor remite explicitamente a las builds GGUF y al modelo fuente si se necesita una version puntuada.
- Modo thinking: si no se desactiva de forma explicita, mlx-lm 0.32 activa `enable_thinking=True` al detectar `<think>` en el vocabulario, lo que contradice el modo de entrenamiento y puede degradar las salidas.
- Ambito reducido: el modelo esta especializado en extraccion estructurada; no debe esperarse un rendimiento competitivo en tareas generales de razonamiento, codigo o matematicas.
- Sin capacidades multimodales: la torre de vision fue eliminada, por lo que no procesa imagenes pese a que el modelo de origen pudiera hacerlo.
- Idiomas: no se declaran idiomas soportados; el comportamiento fuera del ingles no esta documentado.
- Contexto y alucinacion: al no publicarse la longitud de contexto ni resultados de evaluacion, no es posible acotar el riesgo de alucinacion en campos extraidos ni el comportamiento con documentos largos.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero se heredan las condiciones del modelo base Qwen3.5, que conviene verificar en la model card del modelo fuente.
- Sesgos: no disponible; no se documenta ningun analisis de sesgos.
- Madurez del artefacto: con 0 descargas y 0 likes en el momento de la consulta, se trata de una publicacion reciente y sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scienceverse/bibr-extract-qwen35-4b-mlx-8bit
- Modelo fuente (bf16): https://huggingface.co/scienceverse/bibr-extract-qwen35-4b
- Revision concreta de los pesos de origen: https://huggingface.co/scienceverse/bibr-extract-qwen35-4b/tree/6ab47a4e4e8b1b76c1ab234aec66f360683ff9fc
- Repositorio del proyecto bibr: https://github.com/scienceverse/bibr
