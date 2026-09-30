# aifeifei798/Myriad-MoE-25K-Micro-Experts

## Resumen

Myriad-MoE-25K-Micro-Experts (denominado por el autor DualBigLittle-MoE) es un modelo de generacion de texto construido sobre Qwen3-0.6B que combina dos nucleos densos residentes en VRAM con un enjambre de 25.200 micro-expertos LoRA de rango 16 alojados en memoria anfitriona (RAM del sistema). Lo desarrolla el usuario aifeifei798 y su objetivo declarado es atacar el problema de la interferencia multitarea o "transferencia negativa" entre dominios: en lugar de un unico MLP denso que se degrada al especializarse, la arquitectura separa una via humanistica (Tier-1 Arts Core, congelada) de una via cientifico-tecnica (Tier-2 STEM Core, clonada de forma contrastiva).

La propuesta tecnica central es de sistemas mas que de modelado: los expertos viven en 1,54 GB de RAM fijada (pinned memory) y se transfieren por PCIe mediante flujos DMA asincronos por token (96 KB por capa), con una latencia de transferencia en torno a 0,13 ms que el autor afirma queda enmascarada bajo las operaciones GEMM del modelo denso. El autor reporta paridad de rendimiento entre el modo de streaming desde RAM (24,9 tokens/s) y el modo residente en VRAM (23,8 tokens/s), lo que situa la velocidad global en unos 29-31 tokens/s.

Es relevante ahora porque propone una via para escalar el numero de expertos en hardware de consumo sin multiplicar la VRAM, ademas de permitir mutacion en caliente de clusters de expertos (hot-swapping en unos 40 ms, con clusters de dominio entrenados en unos 20 segundos) y herramientas de neurocirugia interactiva (/catch, /cage, /snipe). El modelo declara 0,9B de parametros activos y fue verificado en una RTX 5090 D. La ficha no documenta volumen de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) con MoE jerarquico: doble nucleo denso en VRAM (Tier-1 Arts congelado, Tier-2 STEM clonado) mas micro-expertos LoRA de rango 16 en RAM anfitriona |
| Parametros totales | no disponible |
| Parametros activos | 0,9B (cifra declarada por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los expertos son adaptadores LoRA de rango 16; el autor no documenta cuantizacion de pesos) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (libreria pytorch; no se especifica safetensors, GGUF ni otro formato) |
| Numero de micro-expertos | 25.200 (28 capas x 20 clusters x 45 LoRA de rango 16) |
| Memoria de expertos | 1,54 GB en RAM anfitriona (pinned memory) |
| Enrutamiento | Router-Big de 2 clases (softmax) y Router-Cluster de 20 clases (top-2) |
| Tamano de slice por capa | 96 KB |
| Latencia de transferencia | ~0,13 ms por slice de experto activo sobre PCIe 4.0/5.0 |
| Rendimiento declarado | 29-31 tokens/s; 24,9 tokens/s en modo streaming desde RAM frente a 23,8 tokens/s en modo residente en VRAM |
| Hot-swapping | ~40 ms de mutacion en memoria; ~20 s de entrenamiento por cluster de dominio (~3,6 MB) |
| Hardware verificado | RTX 5090 D |

## Arquitectura y entrenamiento

La arquitectura parte del transformer denso de Qwen3-0.6B y lo modifica en dos planos. En el plano de la VRAM, sustituye la via densa unica por dos MLP densos: un Tier-1 Arts Core congelado, que preserva la intuicion linguistica, el matiz estilistico y el conocimiento general del modelo base, y un Tier-2 STEM Core clonado de forma contrastiva y especializado en sintaxis de programacion, estructuras de datos y demostraciones matematicas. Un Router-Big de 2 clases con salida softmax pondera ambas vias. En el plano de la RAM, un Router-Cluster de 20 clases selecciona los 2 clusters mas relevantes y dentro de ellos se aplican los micro-expertos LoRA de rango 16 correspondientes a cada una de las 28 capas. La salida densa (big_out) y la salida de micro-expertos (micro_out) se combinan en la computacion final.

El mecanismo diferenciador es el streaming de expertos: los adaptadores residen en memoria anfitriona fijada y se transfieren al GPU por PCIe con flujos CUDA asincronos por token, de modo que la transferencia queda oculta tras las operaciones matriciales del nucleo denso. Sobre esos expertos se anaden capacidades de mutacion en caliente (insercion in-place mediante llamadas `copy_()` no bloqueantes, sin reiniciar el runtime, reconstruir grafos CUDA ni invalidar el contexto de GPU) y de instrumentacion interactiva: `/catch` para trazar activaciones anomalas en las 28 capas, `/cage` para aislar temporalmente clusters problematicos y `/snipe` para modificar parametros de una sola capa.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documenta el procedimiento de clonacion contrastiva mas alla de su descripcion cualitativa.

## Capacidades

- Generacion de texto en ingles y chino, heredada del modelo base Qwen3-0.6B.
- Desacoplamiento de dominios mediante enrutado dual: la via Arts cubre registro humanistico, estilo y conversacion, y la via STEM cubre codigo y matematicas, con un router de 2 clases que decide la mezcla por token.
- Especializacion modular en tiempo de ejecucion: se pueden entrenar clusters de micro-expertos de un dominio concreto (~20 segundos, ~3,6 MB) e insertarlos en caliente (~40 ms) sin reiniciar el servicio.
- Composicion dinamica de comportamiento mediante seleccion top-2 de clusters (20 clusters por capa, 45 LoRA por cluster).
- Instrumentacion de depuracion y atribucion: trazado de activaciones por capa (/catch), aislamiento temporal de clusters (/cage) y edicion puntual de parametros (/snipe).
- Ejecucion con presupuesto de VRAM reducido: el peso de los expertos vive en RAM anfitriona y se transmite por PCIe bajo demanda.
- No se documenta soporte de tool calling o function calling, ni capacidades de agente multi-paso, vision, audio o modo de razonamiento explicito (thinking mode).

## Casos de uso

- Despliegue en GPU de consumo: el modelo esta pensado para ejecutarse con una huella de VRAM reducida, ya que el nucleo denso ocupa poco y los 1,54 GB de expertos residen en RAM. Encaja en equipos con una unica GPU de gama alta (verificado en RTX 5090 D) y en escenarios de "edge AI" donde no se dispone de VRAM para un MoE convencional.
- Asistente multitarea sin interferencia entre dominios: para aplicaciones que alternan redaccion creativa y resolucion de problemas tecnicos, los dos nucleos densos evitan que la especializacion STEM degrade la calidad conversacional, algo que en un ajuste fino denso unico suele ocurrir por transferencia negativa.
- Adaptacion rapida a dominios verticales: al permitir entrenar un cluster de ~3,6 MB en unos 20 segundos e insertarlo en caliente, se puede especializar el modelo en jerga legal, medica o de un producto concreto sin reentrenar el modelo completo ni reiniciar el servicio.
- Investigacion sobre enrutado en MoE: el par de routers (2 clases y 20 clases con top-2) y el streaming por token ofrecen un banco de pruebas controlado para estudiar seleccion de expertos, colisiones de gradiente y especializacion por capa en modelos de menos de 1B de parametros activos.
- Analisis de interpretabilidad y atribucion: los comandos /catch, /cage y /snipe permiten localizar que capas y clusters se activan ante una entrada concreta, aislar los responsables de un fallo y medir el efecto de retirarlos, lo que resulta util para auditar comportamiento anomalo.
- Prototipado de bajo coste para pipelines de generacion de texto en ingles y chino: al no requerir VRAM para los expertos, es viable levantar varias instancias o entornos de pruebas en una misma maquina con RAM abundante.
- Educacion y divulgacion sobre arquitecturas MoE: la separacion explicita entre nucleo denso en VRAM y expertos en RAM ilustra de forma tangible conceptos de sparsity, DMA asincrono y memoria paginada aplicados a redes neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y tampoco ofrece comparaciones cuantitativas de calidad frente al modelo base Qwen3-0.6B. Los unicos datos de rendimiento aportados son de throughput: 29-31 tokens/s globales, 24,9 tokens/s en modo de streaming desde RAM anfitriona y 23,8 tokens/s en modo residente en VRAM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra explicita. El diseno traslada 1,54 GB de expertos a RAM anfitriona, de modo que la VRAM debe cubrir el nucleo denso de Qwen3-0.6B (dos copias del MLP denso mas el resto del transformer) y el buffer de staging del streaming. Debe presupuestarse VRAM adicional para el buffer de computacion de los slices de 96 KB por capa.
- RAM anfitriona: 1,54 GB en memoria fijada (pinned memory) solo para los micro-expertos, mas lo necesario para el runtime.
- GPU recomendadas: el autor verifico el modelo en una RTX 5090 D. No se especifican otras GPU compatibles.
- Compatibilidad con GPU de consumo: si, el modelo esta explicitamente orientado a "consumer gpu" y "edge", si bien no se publica una lista de modelos soportados ni requisitos minimos.
- Interfaz de interconexion: el rendimiento declarado depende de PCIe 4.0 o 5.0, ya que el streaming de expertos se realiza por el bus PCIe.
- Opciones de despliegue: el modelo se distribuye con libreria pytorch y un runtime propio basado en flujos CUDA asincronos, router propio y operaciones LoRA. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: ~0,13 ms por slice de experto activo transferido (oculto tras la GEMM densa segun el autor); throughput declarado de 29-31 tokens/s y paridad entre modo streaming (24,9 t/s) y modo residente en VRAM (23,8 t/s).
- Mutacion en caliente: ~40 ms para insertar un cluster actualizado en memoria, sin reinicio del runtime ni reconstruccion de grafos CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Myriad-MoE-25K-Micro-Experts | 0,9B activos declarados; total no disponible | no disponible | 29-31 tokens/s declarados; sin benchmarks de calidad | apache-2.0 | HuggingFace, libreria pytorch con runtime propio; 0 descargas |
| Qwen3-0.6B (modelo base declarado) | 0,6B | 32.768 tokens segun la documentacion de Qwen3 | no disponible en la informacion proporcionada | apache-2.0 | HuggingFace, ecosistema estandar de transformers |
| SmolMoE-8x135M (proyecto del mismo autor, citado en resultados de busqueda) | no disponible | no disponible | no disponible | no disponible | HuggingFace, perfil del autor |

No se dispone de otros modelos comparables con datos verificables en la informacion proporcionada. El propio autor presenta Myriad-MoE como una arquitectura de 0,9B de parametros activos que aspira a igualar capacidades de lineas base de 7B o mas, pero no aporta ninguna evaluacion que respalde esa afirmacion frente a modelos de esa categoria (por ejemplo, Qwen3-8B o MoE como Qwen3-30B-A3B), por lo que la comparacion de calidad no puede establecerse.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones cualitativas publicadas. La afirmacion de equiparar capacidades de lineas base de 7B o superiores no esta respaldada por datos verificables.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, y publicado por un autor individual: no existe validacion independiente de los resultados declarados.
- El rendimiento reportado (29-31 tokens/s y paridad streaming/VRAM) procede unicamente de mediciones del autor sobre una RTX 5090 D; no se documentan condiciones de prueba, prompts, longitudes de secuencia ni varianza.
- El rendimiento depende criticamente de la interconexion PCIe (4.0/5.0) y de las asignaciones de memoria fijada del sistema operativo (Linux `pin_memory()`), lo que puede degradar el throughput en otras plataformas o sistemas operativos.
- No se documenta la longitud de contexto soportada; si el modelo base opera con ventanas extensas, el coste de streaming de expertos por token podria cambiar con la longitud de secuencia, y ese extremo no esta analizado.
- Idiomas limitados a ingles y chino. No se declara soporte de castellano ni de otras lenguas.
- No se documenta formato de pesos estandarizado (safetensors, GGUF) ni integracion con motores de inferencia habituales como vLLM, llama.cpp, Ollama o TGI, lo que dificulta su adopcion en produccion y su despliegue fuera del runtime del autor.
- El uso de un runtime propio basado en CUDA, con flujos asincronos y memoria fijada, implica dependencia de NVIDIA y de la version concreta de CUDA: no hay rutas de ejecucion en CPU, AMD o Apple Silicon documentadas.
- Riesgo de alucinacion: no se especifica ningun proceso de alineamiento (RLHF, DPO) ni evaluacion de veracidad; al derivar de Qwen3-0.6B, hereda las limitaciones de un modelo base de muy reducido tamano.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o sesgo de idioma. Los datos de entrenamiento de los expertos y del clonado contrastivo no se describen, por lo que no puede auditarse la composicion del corpus.
- Licencia apache-2.0, permisiva para uso comercial, pero sin garantias y heredando las condiciones del modelo base Qwen3-0.6B, que conviene revisar antes de un despliegue en produccion.
- Las capacidades de mutacion en caliente introducen riesgo operativo: modificar clusters en un servicio en vivo puede alterar el comportamiento del modelo sin traza de versiones si no se instrumenta el control de cambios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aifeifei798/Myriad-MoE-25K-Micro-Experts
- README en chino simplificado: https://huggingface.co/aifeifei798/Myriad-MoE-25K/blob/main/README_zh_cn.md
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Propuesta de integracion en Transformers (issue 49183): https://github.com/huggingface/transformers/issues/49183
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- DOI del modelo: doi:10.57967/hf/10685
- Perfil del autor en HuggingFace: https://huggingface.co/aifeifei798
- Colecciones del autor: https://huggingface.co/aifeifei798/collections
- Proyecto SmolMoE-8x135M del mismo autor: https://huggingface.co/aifeifei798
- Articulo sobre "super experts" en MoE (arXiv 2507.23279): https://arxiv.org/abs/2507.23279
- Articulo de Wikipedia sobre Mixture of Experts: https://en.wikipedia.org/wiki/Mixture_of_experts
- Recopilatorio de modelos MoE de 2026: https://www.aimadetools.com/blog/best-moe-models-2026/
