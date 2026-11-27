# netprojects/Inkling-2-Mini-MLX-2.5bit

## Resumen

Inkling-2-Mini-MLX-2.5bit es una cuantizacion para Apple Silicon del modelo multimodal Inkling 2 Mini de Thinking Machines, publicada por netprojects. Se distribuye en formato MLX y emplea una receta de cuantizacion por capas denominada LayerFit, que asigna distintos bits y tamanos de grupo a cada bloque del modelo en funcion de su sensibilidad medida, en lugar de aplicar una configuracion uniforme. El resultado ocupa 10,8 GB (mas 0,64 GB del borrador de decodificacion especulativa DSpark) y esta pensado para Macs con 24 GB de memoria unificada.

El modelo base es un mixture-of-experts con 26.388.641.280 parametros totales y aproximadamente 3.400 millones activos por token. Su arquitectura encadena 24 capas, de las cuales las doce centrales se ejecutan tres veces, lo que supone 48 pasadas de capa por token. Acepta entrada de texto e imagen y declara una ventana de contexto de hasta 1 millon de tokens. La licencia es Apache 2.0.

La relevancia de esta ficha esta en que demuestra que un MoE multimodal de 26B puede ejecutarse en hardware de consumo Apple con una perdida de fidelidad acotada y medida: el autor reporta un 91,0% de coincidencia en el siguiente token frente a la implementacion de referencia y una divergencia KL de 0,0656, un 65% inferior a la de una cuantizacion plana de 2,5 bits del mismo tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (inkling2_loop); 24 capas, las 12 centrales se ejecutan 3 veces (48 pasadas por token) |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | Aproximadamente 3,4B por token |
| Longitud de contexto | Hasta 1.000.000 de tokens (segun model card del build) |
| Tipos de cuantizacion | MLX affine con receta LayerFit por capas: expertos enrutados a 3 bits (grupo 128) en capas 0-17 y 20-23, 2 bits en capas 18-19; atencion a 6, 5 y 4 bits segun capa; embeddings a 3 bits; capa de salida a 4 bits (grupo 64); encoder de vision a 2 bits (grupo 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con borrador DSpark en `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un mixture-of-experts con atencion transformer convencional y una innovacion estructural: las doce capas centrales del bloque de 24 se recorren tres veces por token, de modo que el coste computacional efectivo equivale a 48 pasadas de capa manteniendo el numero de parametros. Solo una fraccion reducida de los expertos se activa por token (unos 3,4B de 26,4B), lo que abarata la inferencia frente a un modelo denso del mismo tamano. El modelo acepta texto e imagenes, e incorpora un encoder de vision en el mismo repositorio.

Sobre el entrenamiento del modelo original no se dispone de datos en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF o DPO): no disponible. Lo que si documenta el autor de esta cuantizacion es el proceso de compresion. Los expertos enrutados se recuantizaron a partir de sus valores publicados en NVFP4 y MXFP8, y la receta LayerFit se obtuvo midiendo el impacto de cada eleccion de bits y tamano de grupo sobre la salida del modelo, buscando la configuracion que minimiza la divergencia respecto al original a tamano fijo. El build incluye ademas el borrador de decodificacion especulativa DSpark (`mtp.safetensors`, 0,64 GB), que acelera la generacion al proponer tokens que el modelo principal verifica.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto declarada de hasta 1M de tokens.
- Razonamiento y matematicas: el autor reporta 46/50 en GSM8K con 50 preguntas para este build.
- Entrada de imagen y texto (pipeline image-text-to-text), con encoder de vision incluido.
- Tool calling compatible con el formato OpenAI a traves del runtime `inkling2-mlx`.
- Decodificacion especulativa mediante el borrador DSpark incluido en el repositorio.
- Ejecucion nativa en Apple Silicon con `mlx-vlm` estandar, sin runtime personalizado.
- Capacidades multilingues: no disponible (no se especifican idiomas en la informacion).

## Casos de uso

- Asistente conversacional local en un Mac de 24 GB: el modelo cabe con 10,8 GB de pesos mas 0,64 GB de borrador y deja margen para macOS y prompts largos, lo que permite mantener conversaciones multi-turno sin conexion a servicios externos.
- Analisis de documentos extensos: con una ventana declarada de hasta 1M de tokens, se puede cargar un corpus largo (contratos, informes, expedientes) y hacer preguntas sobre el sin trocear el texto en fragmentos.
- Procesamiento de capturas y documentos escaneados: al aceptar imagen y texto, sirve para extraer informacion de pantallazos o paginas digitalizadas, teniendo en cuenta que el encoder de vision a 2 bits reduce la exactitud en detalles finos.
- Automatizacion de tareas con herramientas: el soporte de tool calling en formato OpenAI permite integrarlo en flujos que consultan APIs, ejecutan busquedas o escriben ficheros desde un agente local.
- Prototipado y evaluacion de agentes multi-paso: la decodificacion especulativa con DSpark reduce la latencia por token, lo que hace viable iterar sobre bucles de razonamiento de varios pasos en un portatil.
- Desarrollo asistido por IA en local para equipos con hardware Apple: util como backend de autocompletado o generacion de codigo en entornos donde no se permite enviar codigo a la nube.
- Docencia e investigacion sobre cuantizacion: el repositorio publica la receta por capas en `quant-recipe.json` y las metricas de fidelidad, lo que lo convierte en un caso de estudio reproducible de compresion selectiva.

## Benchmarks y rendimiento

Metricas publicadas por el autor de la cuantizacion, comparando con la implementacion de referencia de Thinking Machines en Transformers sobre los pesos originales:

| Build | Tamano | Coincidencia siguiente token | KL vs referencia | GSM8K (50 preguntas) | Memoria pico con prompt de 8K tokens |
|---|---|---|---|---|---|
| MLX-4-8bit (recomendado) | 19,5 GB + 0,64 GB | 98,4% | 0,0018 | 47/50 | 27,8 GB |
| LayerFit 4bit | 16,5 GB + 0,64 GB | 97,7% | 0,0101 | 46/50 | 23,6 GB |
| LayerFit 3bit | 14,1 GB + 0,64 GB | 95,5% | 0,0225 | 45/50 | 21,4 GB |
| **LayerFit 2.5bit (este build)** | **10,8 GB + 0,64 GB** | **91,0%** | **0,0656** | **46/50** | **18,25 GB** |
| LayerFit 2bit | 9,5 GB + 0,64 GB | 90,2% | 0,1066 | 47/50 | 17,05 GB |
| 2.5-bit plano (sustituido) | 10,8 GB | 87,5% | 0,1899 | no disponible | no disponible |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada recomendada: 24 GB para este build de 10,8 GB mas 0,64 GB de borrador; el autor calcula que la descarga supone como maximo el 60% de la memoria del equipo.
- Memoria pico medida: 18,25 GB con un prompt de 8.000 tokens.
- Equipos Apple Silicon: build orientado a Macs de 24 GB. Para 16 GB existe la variante de 2 bits (9,5 GB); para 32 GB, las de 3 y 4 bits; para 48 GB o mas, la de 4/8 bits.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el formato MLX esta pensado para Apple Silicon; no disponible para CUDA.
- Despliegue: `mlx-vlm` estandar (soporte en main y en la siguiente release) y runtime `inkling2-mlx` para tool calls en formato OpenAI. No se mencionan vLLM, llama.cpp ni TGI para este formato.
- Latencia y throughput: no disponibles como cifras absolutas; el autor solo indica que la decodificacion especulativa DSpark acelera la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-2.5bit (este) | 26,4B totales, ~3,4B activos | Hasta 1M tokens | MLX, Apple Silicon | Apache 2.0 | 10,8 GB, 91,0% de coincidencia con la referencia |
| Inkling-2-Mini LayerFit 4bit (mismo autor) | 26,4B totales, ~3,4B activos | Hasta 1M tokens | MLX, Apple Silicon | Apache 2.0 | 16,5 GB, 97,7% de coincidencia, requiere 32 GB |
| Inkling-2-Mini MLX-4-8bit (mismo autor) | 26,4B totales, ~3,4B activos | Hasta 1M tokens | MLX, Apple Silicon | Apache 2.0 | 19,5 GB, 98,4% de coincidencia, recomendado para 48 GB o mas |
| Qwen3.8-27B LayerFit (mismo autor) | 27B (aproximado por el nombre) | No disponible | MLX, Apple Silicon | No disponible | Alternativa de tamano similar; sin datos de fidelidad en la informacion |

No se dispone de comparativas con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2,5 bits introduce degradacion medible: 91,0% de coincidencia en el siguiente token y KL de 0,0656 frente a la referencia, frente al 98,4% del build de 4/8 bits.
- El encoder de vision esta cuantizado a 2 bits, lo que reduce la exactitud en tareas visuales: en la comprobacion del autor el modelo acerto colores y posiciones pero describio un circulo como ovalo.
- La decodificacion especulativa depende de un borrador adicional (0,64 GB) que debe cargarse junto al modelo.
- El formato MLX limita el uso a Apple Silicon; no es desplegable en GPUs NVIDIA sin conversion.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la compresion agresiva de pesos.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0, que permite uso comercial; conviene revisar igualmente las condiciones del modelo base de Thinking Machines.
- Para produccion se recomienda validar con el build de 4/8 bits antes de adoptar este, dado el salto de fidelidad entre ambos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2.5bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime con tool calls: https://github.com/internet-projects/inkling2-mlx
- Build de 2 bits para 16 GB: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2bit
- Build de 3 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-4bit
- Build recomendado de 4/8 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Qwen3.8-27B LayerFit: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-4bit
- Indice de builds del autor: https://huggingface.co/netprojects
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
