# BobClawblaw/MiniMax-M3.1-Flash-MLX-mix256k

## Resumen

MiniMax-M3.1-Flash-MLX-mix256k es una conversion no oficial de los pesos de MiniMaxAI/MiniMax-M3.1-Flash (revision `54e4e69d`) al motor Metal nativo de TensorFold, empaquetada por el usuario BobClawblaw para servir el modelo completo en una sola maquina Apple con 256 GB de memoria unificada. El modelo base es un MoE multimodal nativo de MiniMax orientado a tareas agenticas, codigo, computer use y ciberseguridad, con ventana de 1M de tokens en su release original; esta conversion cuantiza los pesos para que una ventana de 262.144 tokens conviva con el modelo, la torre de vision, un drafter y una cache key/value int8 en esos 256 GB.

El checkpoint pesa unos 189 GiB y declara 431.228.680.320 parametros totales segun los safetensors. La cuantizacion es mixta: expertos enrutados en 3 y 4 bits afines (refit por minimos cuadrados sobre los valores NVFP4 originales), atencion, experto compartido, capas densas, embeddings y cabeza de salida en 8 bits, router en fp32 y torre de vision en bf16.

Su relevancia es doble: por un lado demuestra que un MoE de mas de 400.000 millones de parametros puede ejecutarse en hardware Apple de gama alta; por otro, es un artefacto experimental. El soporte del motor TensorFold aun no se ha publicado, el repositorio no se puede cargar con mlx-lm ni mlx-vlm, no tiene descargas ni benchmarks publicados y arrastra una deriva de cuantizacion medible (KL medio de 0,284 frente a los pesos NVFP4 de referencia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal nativa (familia `minimax_m3` de TensorFold) con torre de vision, proyector, router fp32 y cabezas drafter DSpark y DFlash2 |
| Parametros totales | 431.228.680.320 (431,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en este checkpoint (el release base anuncia 1M) |
| Tipos de cuantizacion | Expertos enrutados: 4 bits afines, grupos de 128, en capas 22, 24 y 59; 3 bits afines, grupos de 64, en las otras 57 capas. Atencion (q, k, v e indexer lightning), experto compartido, capas densas, embeddings y cabeza de salida: 8 bits afines, grupos de 64. Router: fp32. Torre de vision y proyector: bf16 (convolucion de parches en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community License (identificador `minimax-community`, campo `license: other`): gratuita para uso no comercial; el uso comercial requiere la atribucion y el aviso o autorizacion que describe. El drafter DFlash2 es de incoai y se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors con cuantizacion afín de MLX, repartidos en varios ficheros (`model-vision.safetensors`, `model-dspark.safetensors`, `model-dflash2.safetensors` y los del cuerpo del modelo); tamano del repo 203,1 GB, aproximadamente 189 GiB de pesos |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal nativo: recibe texto, imagen y video y genera texto, con un router que selecciona expertos por token y una torre de vision con proyector para alinear las representaciones visuales. La model card de esta conversion revela detalles estructurales: los expertos enrutados se distribuyen en 60 capas (tres de ellas, las 22, 24 y 59, son las que mas se benefician de 4 bits), la atencion incluye un "lightning indexer" con proyecciones propias, existe un experto compartido junto a las capas densas y el release incorpora una cabeza drafter DSpark para decodificacion especulativa. Sobre los datos de entrenamiento (numero de tokens, composicion, fases de RLHF o DPO) no hay informacion en el material disponible.

La innovacion tecnica de este checkpoint es el esquema de cuantizacion. Cada anchura de bits se obtiene por un refit de minimos cuadrados ajustado a los valores NVFP4 del release (escalas y sesgos ajustados a los valores, no un redondeo al vecino mas cercano), y los tensores 8 bits parten de los MXFP8 originales, exactos en bf16 antes de cuantizar. El resultado se compara contra una referencia MLX del codigo de modelado de transformers: KL medio de 0,284 y 78,2 % de acuerdo top-1 para mix256k, frente a 0,250 y 80,0 % de mix34 (variante de mayor calidad y menor ventana) y 0,300 y 77,3 % de una variante con todos los expertos a 3 bits que no se ha publicado. El checkpoint incluye dos drafters para decodificacion especulativa (DSpark del release y DFlash2 de incoai, revision `ac07a7c1`), y el motor carga solo uno.

## Capacidades

- Generacion de texto y razonamiento multimodal: entradas de texto e imagen (el release base anuncia tambien video) con salida de texto.
- Codigo: el modelo base esta posicionado por MiniMax para tareas de programacion y generacion en produccion.
- Flujos agenticos: uso de herramientas, razonamiento multi-paso y tareas de computer use segun la documentacion del modelo base.
- Ciberseguridad: caso de uso declarado explicitamente por MiniMax y NVIDIA NIM para el modelo base.
- Contexto largo: 262.144 tokens en esta conversion, suficientes para analisis de repositorios, expedientes o transcripciones extensas.
- Salidas estructuradas y prompt caching implicito: caracteristicas del serving del release base (Fireworks), no verificadas en este checkpoint.
- Decodificacion especulativa: soporte de drafter (DSpark o DFlash2) para reducir latencia por token.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente local en una estacion de trabajo Apple: ejecutar un agente con tool calling y razonamiento multi-paso sobre la ventana de 262.144 tokens en un M5 Ultra con 256 GB, sin enviar datos a la nube; adecuado para entornos con requisitos de confidencialidad.
- Asistente de codigo en un monorepo: indexar y razonar sobre varios modulos dentro de la ventana de contexto y usar el drafter para mantener interactividad en autocompletado y refactors.
- Automatizacion de computer use en escritorio: el caracter multimodal permite interpretar capturas de pantalla y emitir acciones; la inferencia local evita exponer credenciales o sesiones a APIs externas.
- Analisis de ciberseguridad en local: triaje de alertas, resumen de trazas y correlacion de eventos con contexto largo, en un equipo aislado de la red.
- Procesamiento de documentacion tecnica con imagenes: manuales, planos o capturas combinados con texto en una sola ventana, para extraccion de datos y generacion de informes.
- Investigacion en cuantizacion: banco de pruebas para medir la perdida de fidelidad de esquemas mixtos 3/4/8 bits sobre un MoE de gran tamano, usando la tabla de KL y acuerdo top-1 como referencia reproducible.
- Evaluacion comparativa de drafters: probar DSpark frente a DFlash2 sobre el mismo cuerpo cuantizado para medir la ganancia de la decodificacion especulativa en Metal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha ejecutado ninguna suite de benchmarks sobre el checkpoint y que la receta de serving los reportara mas adelante. Lo unico publicado es una comparacion de fidelidad de cuantizacion frente a los pesos NVFP4 del release, sobre las 1.024 posiciones de un unico chat y con la cache key/value int8 por defecto del motor:

| Checkpoint | KL medio | Acuerdo top-1 |
|---|---|---|
| mix34 (mayor calidad, menor ventana) | 0,250 | 80,0 % |
| mix256k (este checkpoint) | 0,284 | 78,2 % |
| Todos los expertos a 3 bits (no publicado) | 0,300 | 77,3 % |

## Requisitos de hardware

- Memoria: aproximadamente 189 GiB de pesos (DSpark y DFlash2 incluidos, aunque el motor carga solo un drafter). El checkpoint esta dimensionado para caber junto a una ventana de 262.144 tokens, imagenes y cache key/value int8 en 256 GB de memoria unificada.
- Plataforma recomendada: un Apple M5 Ultra con 256 GB, el unico escenario que la model card describe como objetivo.
- GPU CUDA: no soportado por esta conversion; el formato es cuantizacion afín de MLX sobre el motor Metal de TensorFold. Una RTX 4090 (24 GB) o una A100 (80 GB) no pueden alojar 189 GiB de pesos sin un esquema de offload o sharding que este checkpoint no contempla.
- GPU de consumo: no cabe en ninguna GPU consumer actual por tamano de pesos.
- Despliegue: exclusivamente el motor Metal nativo de TensorFold. La model card advierte de que el checkpoint no carga en mlx-lm ni en mlx-vlm. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Estado del software: el soporte del motor no esta publicado; esta pendiente un pull request de TensorFold y una receta de serving.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash (release original, `54e4e69d`) | 431,2 mil millones | 1M tokens | MXFP8 en capas densas y atencion, NVFP4 en expertos | MiniMax Community License | Publicado en HuggingFace; serving via Fireworks y NVIDIA NIM |
| MiniMax-M3.1-Flash-MLX-mix256k (este checkpoint) | 431,2 mil millones | 262.144 tokens | Mixta 3/4/8 bits afín + router fp32 + vision bf16 | MiniMax Community License (+ Apache-2.0 en DFlash2) | Publicado, pero sin motor capaz de cargarlo todavia |
| MiniMax-M3.1-Flash-MLX-mix34 | 431,2 mil millones | Menor que 262.144 (no especificado) | Mixta, mayor proporcion de 4 bits en expertos | MiniMax Community License | Referenciado en la model card; no se confirma publicacion |
| MiniMax-M3.1-Flash con todos los expertos a 3 bits | 431,2 mil millones | no disponible | 3 bits en todos los expertos | MiniMax Community License | No publicado |

## Limitaciones y advertencias

- No ejecutable hoy: el soporte de TensorFold para la familia `minimax_m3` no esta publicado, y el checkpoint no carga en mlx-lm ni mlx-vlm. Sin el motor, los pesos son inutiles.
- Deriva de cuantizacion medible: 0,284 de KL medio y 78,2 % de acuerdo top-1 implican que aproximadamente uno de cada cinco tokens de referencia no coincide con el release; inaceptable para tareas de alta precision sin validacion propia.
- La medicion de calidad es muy limitada: 1.024 posiciones de un unico chat, sin suite de benchmarks ni evaluacion por tarea.
- Ventana reducida: 262.144 tokens frente a los 1M del release base, una cuarta parte del contexto anunciado.
- Conversion de terceros sin auditoria: 0 descargas y 0 likes en el momento del analisis, autor no verificado. Conviene verificar los safetensors y el codigo del motor antes de cualquier uso en produccion.
- Licencia: la MiniMax Community License es gratuita solo para uso no comercial; el uso comercial exige atribucion y el aviso o autorizacion que el texto describe. Revisar `LICENSE` antes de desplegar. El drafter DFlash2 es Apache-2.0, con condiciones distintas.
- Idiomas soportados no documentados: no se puede asumir calidad en castellano sin evaluacion previa.
- Sesgos y alucinacion: no hay informacion sobre sesgos del modelo base ni evaluaciones de factualidad; un MoE de este tamano con cuantizacion agresiva en 57 de 60 capas de expertos es propenso a degradacion en dominios especializados.
- Coste de memoria: 189 GiB de pesos dejan poco margen en una maquina de 256 GB; la convivencia con cache int8, imagenes y drafter esta calculada, no medida en produccion.
- Requisito de plataforma excluyente: solo Apple Silicon con memoria unificada muy alta; no hay ruta a CUDA.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/BobClawblaw/MiniMax-M3.1-Flash-MLX-mix256k
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Drafter DFlash2 (incoai): https://huggingface.co/incoai/MiniMax-M3.1-Flash-DFlash2
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Blog de anuncio de MiniMax M3.1 Flash: https://www.minimax.io/blog/minimax-m31f
- Ficha en NVIDIA NIM: https://build.nvidia.com/minimaxai/minimax-m3.1-flash/modelcard
- Benchmarks, precios y contexto (llm-stats): https://llm-stats.com/models/minimax-m3.1-flash
- Resumen del modelo (AI/TLDR): https://ai-tldr.dev/models/minimax-m3-1-flash/
- Ficha en Blackbox: https://www.blackbox.ai/models/blackboxai/minimax/minimax-m3.1-flash
