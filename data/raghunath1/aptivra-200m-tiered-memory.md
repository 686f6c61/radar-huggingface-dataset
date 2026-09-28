# raghunath1/aptivra-200m-tiered-memory

## Resumen

Aptivra 200M Tiered-Memory es un modelo de lenguaje experimental orientado a la generacion de codigo con aprendizaje continuo, publicado por el usuario raghunath1 en Hugging Face bajo licencia Apache 2.0. Su objetivo declarado es resolver el olvido catastrofico (catastrophic forgetting) en tareas secuenciales de sintesis de codigo, evitando el crecimiento lineal de parametros y la degradacion de la inferencia. Para ello combina un backbone transformer decoder-only con un router Mixture-of-Experts disperso de tipo soft top-2 sobre ocho expertos, junto con un runtime en C denominado Tiered Memory Runtime (TMR) que gestiona el intercambio de shards de parametros mediante mmap.

El modelo tiene 271.623.168 parametros totales segun los pesos en safetensors, aunque se comercializa bajo la denominacion comercial de "200M". La configuracion del backbone incluye una dimension oculta (d_model) de 1024, 16 capas, 16 cabezas de atencion, dimension feed-forward de 4096 y un vocabulario de solo 256 tokens, lo que apunta a una tokenizacion a nivel de byte o caracter en lugar de subpalabras.

Es relevante ahora por su propuesta de arquitectura orientada a despliegues con memoria por niveles: el autor reporta una accuracy media del 89,4% en un benchmark propio de 12 tareas secuenciales de generacion de codigo, con un backward transfer positivo de +0,042, y velocidades de streaming de shards de hasta 3.142 MB/s. La informacion publicada es limitada (la model card esta truncada y no se detalla la longitud de contexto ni los idiomas soportados), por lo que conviene tratarla como una propuesta de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (soft top-2 sobre 8 expertos) |
| Parametros totales | 271.623.168 (271,6 M) |
| Parametros activos | no disponible (routing soft top-2 sobre 8 expertos; el autor no publica el recuento de parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 y Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (FP16 y Q8_0) y shards PyTorch (.pt) |
| Dimension oculta (d_model) | 1024 |
| Numero de capas | 16 |
| Cabezas de atencion | 16 |
| Dimension feed-forward (d_ff) | 4096 |
| Tamano de vocabulario | 256 |
| Expertos totales / activos | 8 expertos / top-2 activos por token |
| Tamano del repositorio | 7,6 GB |
| Libreria | aptivra |

## Arquitectura y entrenamiento

El nucleo del modelo es un transformer decoder-only con d_model de 1024, 16 capas y 16 cabezas, alimentado por una capa de alineacion de embeddings preentrenada en la etapa T_0 (`PretrainedEmbeddingLayer`) que aporta estabilidad inicial en la proyeccion de tokens entre dominios de codigo. Sobre el backbone se situa un router de gating (`GatingRouter`) que aplica un enrutamiento soft top-2 sobre ocho shards de expertos (`ExpertModule`), con optimizacion de la entropia de enrutamiento y una perdida auxiliar de balanceo de carga. El vocabulario de 256 entradas sugiere un esquema de tokenizacion a nivel de caracter o byte.

La innovacion principal declarada es el sistema de memoria por niveles. Por un lado, una memoria episodica contrastiva (etapa T_1, `HybridMemoryStore`) mantiene embeddings vectoriales de alta prioridad con validacion sintactica mediante arboles de sintaxis abstracta (AST) con k=8. Por otro, el Tiered Memory Runtime (TMR), implementado en C (`multitier_c`), es un framework de sharding de memoria de baja latencia con ABI en C que realiza cargas de shards sin copia mediante mmap y descarga automatica de memoria. El autor reporta un rendimiento del motor de 3.142 MB/s en exportacion y 433 MB/s en importacion. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y de codigo, con enfasis declarado en tareas de sintesis de codigo secuenciales (T_1 a T_12 en el benchmark del autor).
- Aprendizaje continuo: disenado para adquirir nuevas tareas de codigo sin olvidar las anteriores, con backward transfer positivo reportado (+0,042 BWT).
- Enrutamiento disperso mediante MoE soft top-2, que activa dos de los ocho expertos por token.
- Verificacion sintactica de la salida de codigo mediante validacion AST integrada en la memoria episodica.
- Inferencia con gestion de memoria por niveles y streaming de shards a traves del runtime en C (TMR).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el vocabulario de 256 tokens y el foco en codigo no permiten confirmar cobertura de idiomas naturales.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de codigo con memoria a largo plazo: el modelo puede mantener shards de expertos especializados en distintas tareas de programacion y cargarlos bajo demanda mediante el TMR, de modo que un asistente de codigo conserva capacidades adquiridas en tareas anteriores sin reentrenar el backbone completo.
- Aprendizaje continuo en pipelines de datos cambiantes: en entornos donde los estandares o las APIs evolucionan, el modelo esta disenado para incorporar nuevas tareas de sintesis sin sufrir olvido catastrofico, reduciendo la necesidad de reentrenamientos completos.
- Validacion de codigo asistida por AST: la memoria episodica con verificador sintactico permite filtrar las salidas generadas antes de integrarlas en un repositorio, lo que resulta util en tareas de refactorizacion automatica o correccion de errores.
- Despliegue en entornos con memoria limitada: gracias a los shards GGUF en FP16 y Q8_0 y al offloading del runtime en C, el modelo puede ejecutarse en maquinas con poca VRAM, lo que encaja en herramientas de desarrollo locales o integracion en IDE.
- Investigacion en arquitecturas MoE y aprendizaje continuo: sirve como banco de pruebas reproducible para estudiar enrutamiento disperso, balanceo de expertos y tecnicas anti-olvido en tareas de codigo.
- Prototipado de asistentes de codigo autoalojados: al publicarse en Apache 2.0, puede integrarse en entornos internos que exigen no enviar datos a servicios externos, siempre que se asuma su caracter experimental.

## Benchmarks y rendimiento

El autor publica resultados sobre un benchmark propio de 12 tareas secuenciales de generacion de codigo (T_1 a T_12), comparando el modelo con tres referencias internas. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Modelo | Accuracy | BWT | FLOPs/token | Ancho de banda | Memoria |
|---|---|---|---|---|---|
| Aptivra (MoE + TMR) | 89,4% | +0,042 | 4,1 · 10^11 | 3.142 MB/s | 1,08 GB |
| Dense Baseline | 64,2% | -0,285 | 1,1 · 10^12 | no disponible | 2,85 GB |
| EWC Baseline | 71,8% | -0,142 | 1,1 · 10^12 | no disponible | 3,10 GB |
| Standard MoE | 82,1% | +0,008 | 4,1 · 10^11 | 142,5 MB/s | 2,40 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 0,54 GB; en Q8_0, aproximadamente 0,27 GB. Con activaciones y cache de atencion, el consumo total se mantiene muy por debajo de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) ejecuta el modelo sin dificultad; el cuello de botella no es el computo sino el acceso a los shards de expertos.
- Cabe en GPU de consumo: si, incluidas tarjetas de gama de entrada con 4 GB de VRAM o mas, y potencialmente en CPU gracias al soporte GGUF.
- Opciones de despliegue: llama.cpp y Ollama a traves de los ficheros GGUF; la etiqueta endpoints_compatible sugiere compatibilidad con APIs tipo servidor; el runtime propietario es el aptivra C-Engine (TMR) con su manifiesto multitier_manifest.json.
- Latencia y throughput: el autor reporta 3.142 MB/s de exportacion y 433 MB/s de importacion en el motor TMR, y 4,1 · 10^11 FLOPs por token en inferencia. No se publican cifras de latencia por peticion ni de tokens por segundo.

## Comparativa con modelos similares

La informacion disponible no incluye modelos de terceros comparables con especificaciones completas. El autor unicamente proporciona tres baselines internos sin nombre comercial, cuyos datos se recogen a continuacion. Las celdas no documentadas se marcan como no disponibles.

| Modelo | Parametros | Contexto | Accuracy (benchmark del autor) | BWT | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Aptivra 200M Tiered-Memory | 271,6 M | no disponible | 89,4% | +0,042 | Apache 2.0 | Hugging Face |
| Dense Baseline (interno) | no disponible | no disponible | 64,2% | -0,285 | no disponible | no disponible |
| EWC Baseline (interno) | no disponible | no disponible | 71,8% | -0,142 | no disponible | no disponible |
| Standard MoE (interno) | no disponible | no disponible | 82,1% | +0,008 | no disponible | no disponible |

No se dispone de datos verificables de modelos externos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la model card esta truncada y no se documentan la longitud de contexto, el tokenizador, el dataset de entrenamiento ni el proceso de alineacion, lo que dificulta una evaluacion rigurosa.
- Vocabulario de 256 tokens: sugiere tokenizacion a nivel de caracter o byte, lo que puede limitar el rendimiento en texto general y en idiomas distintos del codigo.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad; el foco en codigo no elimina este riesgo.
- Benchmarks no estandarizados: los resultados de 89,4% de accuracy y +0,042 BWT provienen de un benchmark propio del autor sobre 12 tareas, no de pruebas externas reproducibles.
- Sesgos: no se publica informacion sobre sesgos, composicion del corpus ni mitigaciones.
- Dependencia de runtime propietario: el Tiered Memory Runtime en C y el manifiesto multitier_manifest.json son especificos del ecosistema aptivra, lo que puede complicar el despliegue fuera de ese stack.
- Traccion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Licencia permisiva pero sin garantias: Apache 2.0 permite uso comercial, si bien se recomienda validar el comportamiento en produccion dada la falta de documentacion.
- Requisitos de memoria en disco: el repositorio ocupa 7,6 GB, muy por encima de lo que sugiere el tamano del modelo, debido a la duplicacion de formatos de pesos.

## Enlaces

- Hugging Face: https://huggingface.co/raghunath1/aptivra-200m-tiered-memory
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- PyTorch: https://pytorch.org/
- No se han proporcionado enlaces adicionales a papers, repositorios, blogs o demos en la informacion disponible.
