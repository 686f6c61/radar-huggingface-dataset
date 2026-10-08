# FINAL-Bench/Darwin-180B-RSI-R3

## Resumen

Darwin-180B-RSI-R3 es un modelo de lenguaje multimodal (imagen y texto) de tipo mixtura de expertos (MoE) con aproximadamente 180.000 millones de parametros totales, desarrollado por FINAL-Bench. Se presenta como la segunda ronda de mejora recursiva a nivel de modelo sobre Darwin-180B-RSI (conocido como R1), del que hereda la receta de entrenamiento: el propio modelo resuelve problemas verificables, conserva unicamente las soluciones que superan la comprobacion automatica y entrena sobre ellas, sin trazas de razonamiento ni soluciones escritas por humanos. Segun la model card, el modelo deriva de la familia Qwen (etiqueta qwen3.8) y su modelo padre declarado es Qwen3.8-Flash-Next.

El modelo combina atencion hibrida (hibrida + lineal), una ventana de contexto de 262.000 tokens, vision integrada y un modo de razonamiento explicito (thinking) con salida estructurada. Su interes inmediato para desarrolladores e investigadores es doble: por un lado, encabeza el ranking oficial de Hugging Face de ExtractBench con 90,29 puntos (por delante de los 89,88 de su propio padre), y por otro, la linea Darwin-180B-RSI acumula diez primeros puestos oficiales en leaderboards de Hugging Face, nueve de ellos obtenidos por R1 y uno por R3. Ademas, existe una version cuantizada a 4 bits en GGUF (111 GB) que, segun el autor, se ejecuta en un portatil con 8 GB de GPU y 32 GB de RAM, o solo con CPU a 18-21 tokens por segundo.

El atractivo principal es la combinacion de tamano (180B), contexto largo (262K), multimodalidad y un pipeline de automejora verificable, empaquetado con una licencia de comunidad Qwen y compatibilidad declarada con vLLM y API compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (512 expertos), atencion hibrida (hibrida + lineal), vision-language |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.000 tokens (262K) |
| Tipos de cuantizacion | BF16 (safetensors del repo principal); GGUF de 4 bits en el repo POCKET-Darwin-180B-GGUF; no se detallan otros niveles |
| Idiomas soportados | en, ko, zh, ja, multilingual (coreano, ingles, chino, japones y multilingue) |
| Licencia | qwen-community-1.0 (declarada como license: other con license_link a LICENSE) |
| Formato de pesos | safetensors (transformers) y GGUF (4 bits, repo separado) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 360,0 GB |
| Fecha de creacion | 2026-10-01 |
| Ultima actualizacion | 2026-10-05 |
| Descargas / likes | 271 / 17 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mixtura de expertos dispersa (sparse MoE) con 512 expertos y atencion hibrida, que combina mecanismos de atencion lineal con atencion convencional para sostener ventanas de contexto de hasta 262.000 tokens. El modelo es multimodal (procesa imagen y texto, pipeline image-text-to-text) e incorpora un modo de razonamiento explicito con salida estructurada. La ficha tecnica no especifica el numero de parametros activos por token, la distribucion de expertos por capa ni el numero de capas, por lo que esos datos figuran como no disponibles. La etiqueta qwen3.8 y la mencion a Qwen3.8-Flash-Next como modelo padre indican que la base arquitectonica proviene de la familia Qwen.

En cuanto al entrenamiento, el autor describe un proceso de mejora recursiva a nivel de modelo (model-level recursive self-improvement) en tres rondas. R3 continua el entrenamiento desde R1 con la misma receta: el modelo resuelve problemas verificables, se filtran sus propias soluciones mediante comprobacion automatica de correccion y solo esas soluciones se utilizan como datos de entrenamiento. No se emplean soluciones ni trazas de razonamiento escritas por humanos. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO, datos que quedan como no disponibles en la informacion proporcionada. El modelo tambien introduce el concepto ZTC (zero-token-confidence), citado en las etiquetas pero sin descripcion tecnica en el material disponible.

## Capacidades

- Generacion de texto y razonamiento explicito con modo thinking, con resultados declarados de primer puesto en GPQA Diamond (94,44), MMLU-Pro (88,12), AIME 2026 (100,0) y HMMT Feb 2026 (100,0) para la ronda R1.
- Razonamiento matematico y de competicion, segun los resultados citados en AIME 2026 y HMMT Feb 2026.
- Comprension multimodal de imagen y texto (pipeline image-text-to-text), con 79,48 en MMMU-Pro para R1.
- Extraccion de documentos y salida estructurada, con 90,29 en ExtractBench para R3 y soporte declarado de structured output.
- Razonamiento juridico segun los leaderboards citados: LEXam (68,94) y LEXam-hard (45,72).
- Adherencia a formatos e instrucciones estructuradas: 98,95 en IFStruct y 83,65 en MDPBench (ronda R1).
- Capacidades multilingues en ingles, coreano, chino y japones, con etiqueta multilingual adicional.
- Compatibilidad declarada con vLLM y con API compatible con OpenAI (openai-compatible), lo que habilita integracion en tool calling y agentes a traves de interfaces estandar.
- Soporte de contexto largo de hasta 262.000 tokens, adecuado para documentos extensos y conversaciones multi-turno de gran duracion.
- No se menciona en la informacion disponible soporte de audio ni de otros modales fuera de imagen y texto.

## Casos de uso

- Extraccion de datos de documentos largos: con 262K tokens de contexto y salida estructurada, el modelo puede procesar contratos, informes o expedientes completos sin trocear y devolver campos normalizados en JSON. Su resultado de 90,29 en ExtractBench lo situa como referencia para este escenario.
- Procesamiento de facturas y formularios escaneados: al ser multimodal, puede recibir la imagen del documento y extraer campos concretos, integrandose en un pipeline de contabilidad o ERP mediante su API compatible con OpenAI.
- Analisis de documentacion tecnica y normativa: la ventana de 262K permite cargar manuales extensos o normativa juridica completa y responder consultas con trazabilidad de la fuente.
- Razonamiento cientifico y tecnico asistido: los resultados declarados en GPQA Diamond (94,44) y MMLU-Pro (88,12) lo hacen util para responder preguntas de nivel experto en dominios de fisica, quimica, biologia y matematicas dentro de herramientas internas de investigacion.
- Tutoria y resolucion de problemas matematicos: con 100,0 en AIME 2026 y HMMT Feb 2026 (ronda R1), es adecuado para sistemas de ayuda al estudio y verificacion de soluciones paso a paso.
- Automatizacion de tareas legales: el rendimiento citado en LEXam y LEXam-hard permite usarlo en busqueda de precedentes, resumen de expedientes y clasificacion de clausulas, siempre con revision humana.
- Agentes con tool calling: la compatibilidad con API compatible con OpenAI y vLLM facilita conectarlo a funciones externas (busqueda, bases de datos, calculadoras) en flujos multi-paso.
- Despliegue en entornos con recursos limitados: la version GGUF de 4 bits (111 GB) permite ejecutar el modelo en un portatil con 8 GB de GPU y 32 GB de RAM, o en CPU a 18-21 tok/s, habilitando prototipado local sin infraestructura de centro de datos.
- Generacion de codigo y consultas tecnicas: aunque la model card no publica resultados especificos de codigo, la combinacion de razonamiento y salida estructurada permite integrarlo en asistentes de desarrollo.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card y de los leaderboards oficiales de Hugging Face citados por el autor. Se indica la ronda que obtuvo cada resultado, ya que R3 solo aporta nuevos numeros en ExtractBench y EvasionBench.

| Benchmark | Resultado | Ronda | Posicion declarada |
|---|---|---|---|
| ExtractBench (370 documentos) | 90,29 | R3 (este modelo) | #1 |
| EvasionBench | 77,83 | R3 (este modelo) | #3 |
| GPQA Diamond (198) | 94,44 | R1 | #1 |
| MMLU-Pro (12.032) | 88,12 | R1 | #1 |
| MMLU-Pro (verificacion BF16 y GGUF 4 bits) | 87,65 | R3 | no disponible |
| AIME 2026 (30) | 100,0 | R1 | #1 |
| HMMT Feb 2026 (33) | 100,0 | R1 | #1 |
| MMMU-Pro (vision, 1.730) | 79,48 | R1 | #1 |
| LEXam (derecho, opcion multiple, 1.655) | 68,94 | R1 | #1 |
| LEXam-hard | 45,72 | R1 | #1 |
| IFStruct | 98,95 | R1 | #1 |
| MDPBench | 83,65 | R1 | #1 |

Comparacion directa disponible en la informacion: en ExtractBench, R3 obtiene 90,29 frente a los 89,88 de su modelo padre Qwen3.8-Flash-Next. No se han publicado en la informacion disponible otros resultados comparativos con modelos de terceros.

## Requisitos de hardware

- Pesos en BF16: el repositorio safetensors ocupa 360,0 GB, por lo que la inferencia en BF16 requiere del orden de 360 GB de memoria, lo que implica multiples GPU de 80 GB (A100 80GB, H100 80GB) o nodos con memoria unificada de gran capacidad.
- Version cuantizada GGUF de 4 bits (POCKET-Darwin-180B-GGUF): 111 GB de pesos. Segun el autor, se ejecuta en un portatil con 8 GB de GPU y 32 GB de RAM, en un mini PC de 128 GB o en una DGX Spark.
- Ejecucion solo con CPU: el autor declara 18-21 tokens por segundo con la version GGUF de 4 bits.
- Compatibilidad con GPU de consumo: la informacion disponible indica que la version de 4 bits funciona con una GPU de 8 GB apoyandose en RAM del sistema; no se detallan otras configuraciones de consumo.
- Opciones de despliegue mencionadas: transformers, vLLM, API compatible con OpenAI y formato GGUF. No se confirman explicitamente llama.cpp, Ollama ni TGI en la informacion disponible.
- Calidad tras cuantizacion: el autor afirma que MMLU-Pro con la version de 4 bits es identico al de BF16 (87,65 %).
- Throughput y latencia en GPU: no disponibles. El unico dato de velocidad publicado es el de CPU indicado arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | ExtractBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Darwin-180B-RSI-R3 | ~180B (MoE, 512 expertos) | 262K | Imagen + texto | 90,29 | qwen-community-1.0 | Hugging Face (safetensors y GGUF 4 bits) |
| Darwin-180B-RSI (R1) | ~180B (MoE) | 262K | Imagen + texto | no disponible | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash-Next (padre declarado) | no disponible | no disponible | no disponible | 89,88 | no disponible | no disponible |

Solo se dispone de datos comparativos frente al modelo padre y a la ronda anterior de la misma linea. No hay informacion en el material proporcionado sobre alternativas de otros desarrolladores (por ejemplo, otros MoE multimodales de ~180B), por lo que la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: la model card y la informacion disponible no documentan una evaluacion de sesgos. Al entrenarse sobre problemas verificables autogenerados, la distribucion de datos queda sesgada hacia dominios con verificacion automatica (matematicas, extraccion, formato), en detrimento de tareas abiertas.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de factualidad fuera de los benchmarks citados. Los resultados elevados en pruebas de opcion multiple no garantizan fidelidad en generacion libre.
- Limitaciones de idioma: los idiomas declarados son ingles, coreano, chino, japones y multilingue. El castellano no figura entre los idiomas soportados explicitamente, por lo que el rendimiento en espanol no esta garantizado.
- Restricciones de licencia: la licencia es qwen-community-1.0, declarada como license: other. Es una licencia de comunidad con condiciones especificas; conviene revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede incluir clausulas de atribucion o restricciones de despliegue.
- Parametros activos no publicados: sin este dato no es posible estimar con precision el coste computacional por token ni el throughput esperado en GPU.
- Cifras autorreportadas: los resultados de ExtractBench y EvasionBench los publica el propio autor del modelo, que tambien es propietario de FINAL-Bench; la model card afirma explicitamente que se publica para que terceros descarguen, ejecuten y verifiquen los numeros. Se recomienda replicar la evaluacion antes de tomar decisiones de produccion.
- Mezcla de rondas en los benchmarks: buena parte de los primeros puestos (GPQA, MMLU-Pro, AIME, HMMT, MMMU-Pro, LEXam, IFStruct, MDPBench) corresponden a R1 y no a R3, por lo que no deben atribuirse directamente al modelo descrito aqui.
- Dependencia de infraestructura: el despliegue en BF16 exige hardware muy costoso (multiples GPU de 80 GB); el despliegue practico pasa por la cuantizacion de 4 bits, con la perdida de calidad que ello pueda implicar en tareas distintas de MMLU-Pro.
- Nomenclatura propia: conceptos como ZTC (zero-token-confidence) o model-level RSI se citan en las etiquetas sin definicion tecnica en la informacion disponible, lo que dificulta su evaluacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Ronda anterior (R1): https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Version GGUF de 4 bits: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Coleccion de la familia Darwin: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Paper de la familia Darwin: https://arxiv.org/abs/2605.14386
- Paper Latin Square: https://huggingface.co/papers/2609.20269
- Sitio del autor: https://vidraft.net
- Dataset ExtractBench: https://huggingface.co/datasets/llamaindex/ExtractBench
- Dataset EvasionBench: https://huggingface.co/datasets/FutureMa/EvasionBench
- Dataset GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset MMMU-Pro: https://huggingface.co/datasets/MMMU/MMMU_Pro
- Dataset AIME 2026: https://huggingface.co/datasets/MathArena/aime_2026
- Dataset HMMT Feb 2026: https://huggingface.co/datasets/MathArena/hmmt_feb_2026
- Dataset LEXam: https://huggingface.co/datasets/LEXam-Benchmark/LEXam
- Dataset LEXam-hard: https://huggingface.co/datasets/joelniklaus/LEXam-hard
- Dataset IFStruct: https://huggingface.co/datasets/LiquidAI/ifstruct-v1.0
- Dataset MDPBench: https://huggingface.co/datasets/Delores-Lin/MDPBench
