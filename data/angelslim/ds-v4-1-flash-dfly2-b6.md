# AngelSlim/DS-V4.1-Flash-DFly2-B6

## Resumen

DS-V4.1-Flash-DFly2-B6 es un modelo *drafter* de decodificacion especulativa (speculative decoding) disenado para acelerar la inferencia de DeepSeek-V4.1-Flash. Lo desarrolla AngelSlim (vinculado al framework AngelSpec de Tencent) y se publica bajo licencia Apache 2.0. No es un modelo de proposito general: es un componente auxiliar que propone bloques de tokens que el modelo objetivo (target) valida en paralelo, reduciendo el coste por token generado.

La innovacion principal es su arquitectura DFly2, un drafter *block-parallel* pensado para modelos objetivo con atencion dispersa nativa (DeepSeek Sparse Attention, DSA). Cada una de sus tres capas MoE se empareja con una capa DSA del target y reutiliza tanto la KV cache ya calculada (KV sharing) como las posiciones ya seleccionadas por el indexer de esa capa (index sharing). El drafter no mantiene KV cache propia ni ejecuta indexer, lo que evita el sobrecoste de memoria tipico de los drafters convencionales.

El modelo tiene 14.400.493.794 parametros totales (segun los safetensors del repo, 8,8 GB) y opera con bloques de tamano 6 (un token ancla mas 5 tokens de borrador). Se entrena sobre el corpus DFly-SFT (989.861 conversaciones, 7,42B tokens) y esta pensado para desplegarse junto a DeepSeek-V4.1-Flash en backends de decodificacion especulativa como vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (3 capas de borrador, 128 expertos enrutados por capa) con KV sharing e index sharing sobre capas DSA del target |
| Parametros totales | 14.400.493.794 |
| Parametros activos | no disponible |
| Longitud de contexto | Entrenado hasta 32.768 tokens; lee 646 claves por paso (top-512 del indexer + ventana de 128 tokens) a cualquier longitud de contexto |
| Tipos de cuantizacion | FP4 en expertos enrutados, BF16 en el resto; repo etiquetado como 8-bit / fp8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFly2 es un drafter de decodificacion especulativa *block-parallel* para objetivos con atencion dispersa nativa. Sus tres capas MoE (128 expertos enrutados cada una) se emparejan con las capas 28, 32 y 36 del target DeepSeek-V4.1-Flash, que son las que ejecutan indexer propio. Cada capa de borrador lee la KV cache ya almacenada por su capa DSA pareja y las posiciones top-k que el indexer de esa capa ya selecciono para el token anterior al bloque. Asi, cada capa de borrador ve una vista distinta del contexto sin mantener cache propia ni ejecutar indexer. Por paso de borrador lee la seleccion top-512 del target en la fila anterior al ancla mas una ventana cercana de 128 tokens (646 claves por paso con bloque de 6, independientemente de la longitud de contexto).

La inicializacion copia la atencion de la capa pareja del target y toma 128 de sus expertos enrutados al azar (con sus filas de router y sesgos). El estado oculto de la ultima capa del target se inyecta fusionado con el embedding del ancla y con compuerta en la ranura del ancla. La correccion intra-bloque combina correccion de estado oculto, atencion de contexto y atencion de prefijo con compuerta, ranura a ranura. El embedding y la LM head se comparten con el target y no se almacenan en este repositorio.

El entrenamiento usa DFly-SFT, un corpus de instrucciones de proposito general con 989.861 conversaciones y 7,42B tokens, todo de datasets publicos. Las conversaciones se reparten en diez dominios de capacidad; el 61,6% lleva traza de razonamiento explicita y el 34,9% supera los 8K tokens. Muestras limitadas a 32.768 tokens, deduplicacion global y descontaminacion contra los doce conjuntos de evaluacion DeepSpec mediante prueba de solapamiento de n-gramas. El framework de entrenamiento es AngelSpec.

## Capacidades

- Generacion de tokens de borrador para decodificacion especulativa: propone bloques de 6 tokens (1 ancla + 5 borradores) que el target valida en paralelo.
- Comparticion de KV cache e indices con el target: no mantiene cache propia ni ejecuta indexer, reduciendo el coste de memoria y computo.
- Lectura de contexto de tamano fijo y *query-aware*: 646 claves por paso a cualquier longitud, con cobertura del 0,873-0,880 de la masa top-k frente al 0,147-0,175 de una ventana del mismo tamano.
- Coste de borrado constante: 4%-6% de un paso de decodificacion a cualquier longitud de contexto (frente a 14%-23% a 128K con cache propia completa).
- Generalizacion mas alla de la longitud de entrenamiento (32K): en conjuntos de agentes mantiene longitud aceptada media de 4,06/3,75 (T=0/1) frente a la caida de DSpark a 3,35/3,08.
- Mayor aceptacion que DFlash y DSpark en todos los benchmarks evaluados, a ambas temperaturas.
- No es un modelo de chat ni de razonamiento autonomo: su funcion es acelerar al target.

## Casos de uso

- Servicio de inferencia de alto rendimiento con DeepSeek-V4.1-Flash: desplegar el drafter junto al target en vLLM para aumentar el throughput manteniendo la calidad del target. A 32K tokens el mismo pool de KV alberga 1,73x mas peticiones gracias a la ausencia de cache propia.
- Despliegue con prefill-decode disaggregation: el drafter no necesita plaza en las instancias de prefill y cada acierto de prefix-cache del target es tambien un acierto del drafter, simplificando el enrutamiento.
- Cargas de alta concurrencia en texto corto: a velocidad de decodificacion por usuario equivalente, DFly2 entrega un 28% mas de throughput que DSpark en texto corto.
- Escenarios de codigo de contexto largo (CodeSpan 64K): con velocidad por usuario equiparable, un 62% mas de throughput que DSpark; util en asistentes de codigo con repositorios extensos.
- Tareas de ingenieria de software agéntica (SWE 64K): un 81% mas de throughput que DSpark, adecuado para pipelines de agentes que resuelven issues con contexto de repositorio largo.
- Reduccion de coste en produccion: al leer solo un numero fijo de posiciones por paso, el coste de borrado no crece con el contexto, lo que abarata servir conversaciones largas frente a drafters con cache propia.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: usar el drafter como referencia DFly2 en experimentos con AngelSpec frente a DFlash y DSpark sobre el mismo recetario y datos.

## Benchmarks y rendimiento

La model card reporta resultados relativos (no cifras absolutas de MMLU, HumanEval o GSM8K). Se resumen a continuacion:

| Metrica | DFly2 | DFlash / DSpark |
|---|---|---|
| Longitud aceptada media (proposito general, T=0/1) | 4,12 / 3,88 | no disponible |
| Longitud aceptada media (conjuntos de agentes, T=0/1) | 4,06 / 3,75 | DSpark: 3,35 / 3,08 |
| Cobertura de masa top-k (seleccion un paso antes) | 0,873-0,880 | ventana del mismo tamano: 0,147-0,175 |
| Coste de borrado por paso | 4%-6% a cualquier contexto | cache propia: 14%-23% a 128K |
| Peticiones por pool de KV a 32K | 1,73x | linea base |
| Throughput vs DSpark (texto corto, misma velocidad/usuario) | +28% | linea base |
| Throughput vs DSpark (CodeSpan 64K) | +62% | linea base |
| Throughput vs DSpark (SWE 64K) | +81% | linea base |

No se han publicado resultados de benchmarks absolutos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repo pesa 8,8 GB en safetensors (FP4 en expertos, BF16 en el resto). El modelo base DeepSeek-V4.1-Flash requiere su propio despliegue y no se detalla en esta informacion.
- VRAM estimada para el drafter: aproximadamente 9-10 GB en la precision publicada, mas la memoria del target y del pool de KV compartido. No disponible el desglose exacto por componente.
- GPU recomendadas: no disponible de forma especifica. Por tamano del drafter, una GPU con 16-24 GB (RTX 4090, L40S, A100 40GB) podria alojarlo, pero el target DeepSeek-V4.1-Flash condiciona el requisito real.
- Cabe en GPU de consumo: el drafter por si solo si, pero el conjunto target+drafter depende del target. No disponible confirmacion.
- Opciones de despliegue: vLLM con decodificacion especulativa (soporte en curso segun la model card). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: coste de borrado del 4%-6% de un paso de decodificacion; ganancias de throughput del 28%-81% frente a DSpark segun carga. No disponible latencia absoluta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DS-V4.1-Flash-DFly2-B6 | Drafter DFly2 (block-parallel, KV/index sharing) | 14,4B | Entrenado 32K; lee 646 claves/paso | Apache 2.0 | Hugging Face (AngelSlim) |
| DFlash | Drafter de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible |
| DSpark | Drafter de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V4.1-Flash (target) | Modelo objetivo MoE con DSA | no disponible | no disponible | no disponible | Hugging Face (deepseek-ai) |

DFly2 supera a DFlash y DSpark en aceptacion por paso en todos los benchmarks evaluados y en throughput a alta concurrencia (28%-81% segun carga). No se dispone de parametros ni contexto de DFlash y DSpark en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: debe desplegarse junto a DeepSeek-V4.1-Flash; sin el target no genera respuestas utiles.
- El soporte en vLLM esta "en curso" segun la model card; la integracion en produccion puede requerir trabajo adicional.
- Entrenado hasta 32.768 tokens; aunque generaliza a contextos mayores, no se garantiza el mismo rendimiento mas alla de esa longitud.
- Idiomas soportados no disponibles: el corpus DFly-SFT no detalla composicion linguistica.
- Riesgo de alucinacion: heredado del target; el drafter solo propone tokens que el target valida, pero no corrige sesgos del target.
- Sesgos: no se documentan sesgos especificos del drafter; los del target aplican al resultado final.
- Licencia Apache 2.0 permite uso comercial, pero el uso del target DeepSeek-V4.1-Flash se rige por su propia licencia (no disponible en esta informacion).
- Almacenamiento: el embedding y la LM head no estan en el repo; deben tomarse del target.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion limitado.

## Enlaces

- Hugging Face: https://huggingface.co/AngelSlim/DS-V4.1-Flash-DFly2-B6
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Informe tecnico AngelSpec: https://arxiv.org/abs/2607.25852
- Paper DFly2: https://arxiv.org/abs/2611.34776
- Documentacion AngelSpec: https://angelspec.readthedocs.io
- Coleccion Hugging Face AngelSpec: https://huggingface.co/collections/AngelSlim/angelspec
- GitHub AngelSpec (Tencent): https://github.com/Tencent/AngelSpec
