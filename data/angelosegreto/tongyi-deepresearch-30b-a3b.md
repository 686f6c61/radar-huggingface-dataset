# ANGELOSEGRETO/Tongyi-DeepResearch-30B-A3B

## Resumen

Tongyi-DeepResearch-30B-A3B es un modelo de lenguaje de tipo agente (agentic LLM) desarrollado por Tongyi Lab (Alibaba), disenado especificamente para tareas de busqueda de informacion de largo horizonte y razonamiento profundo. El repositorio analizado, `ANGELOSEGRETO/Tongyi-DeepResearch-30B-A3B`, es una publicacion de terceros (usuario ANGELOSEGRETO) del modelo original, con licencia Apache 2.0 y formato de pesos safetensors para la libreria transformers.

El modelo cuenta con 30.532.122.624 parametros totales (unos 30,5 mil millones) y activa aproximadamente 3 mil millones por token, lo que lo situa en la categoria de mezcla de expertos (MoE) dispersa. Esta disenado para flujos de trabajo de investigacion autonoma: navegacion web, recuperacion de documentos y sintesis de respuestas en multiples pasos, con resultados que el autor declara como estado del arte en benchmarks como Humanity's Last Exam, BrowserComp, BrowserComp-ZH, WebWalkerQA, GAIA, xbench-DeepSearch y FRAMES (sin cifras publicadas en la informacion disponible).

Su relevancia actual radica en que combina un pipeline de generacion de datos sinteticos totalmente automatizado, preentrenamiento continuado sobre datos agente y un esquema de aprendizaje por refuerzo estrictamente on-policy, orientado a tareas que requieren muchas llamadas a herramientas y decenas de pasos de razonamiento. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre arquitectura Qwen3 (tag `qwen3_moe`) |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | Aproximadamente 3 B por token (denominacion A3B) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No documentados oficialmente en este repositorio (los pesos publicados estan en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La etiqueta `qwen3_moe` indica que el modelo parte de la arquitectura Qwen3 de tipo mezcla de expertos, con 30,5 mil millones de parametros totales y aproximadamente 3 mil millones activados por token. Se trata, por tanto, de un transformer disperso con enrutamiento por token, lo que permite un coste de inferencia propio de un modelo de ~3 B pese a almacenar 30,5 B de pesos. Segun la model card, el entrenamiento se articula en tres fases: un pipeline de generacion de datos sinteticos totalmente automatizado, un preentrenamiento continuado a gran escala sobre datos de interaccion agente y un aprendizaje por refuerzo extremo a extremo.

La fase de RL emplea un enfoque estrictamente on-policy basado en Group Relative Policy Optimization (GRPO) personalizado, con gradientes de politica a nivel de token, estimacion de ventaja leave-one-out y filtrado selectivo de muestras negativas para estabilizar el entrenamiento en un entorno no estacionario. En inferencia, el modelo es compatible con dos paradigmas: ReAct, orientado a evaluar las capacidades intrinsecas del modelo, y un modo "Heavy" basado en IterResearch que aplica escalado en tiempo de prueba para exprimir el techo de rendimiento. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO convencionales (el RL descrito es GRPO, no RLHF clasico).

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso de largo horizonte.
- Busqueda de informacion profunda ("deep research") con planificacion de subtareas.
- Uso de herramientas y function calling dentro de bucles agente (paradigma ReAct).
- Encadenamiento de acciones en multiples pasos con retroalimentacion del entorno (navegacion web, lectura de documentos, sintesis).
- Modo de inferencia "Heavy" con escalado en tiempo de prueba para maximizar precision a costa de mas computo.
- Razonamiento sobre preguntas de alta dificultad (Humanity's Last Exam, GAIA, FRAMES, segun la model card).
- Soporte de contexto conversacional (tag `conversational`) y compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues limitadas al ingles segun los metadatos; se menciona BrowserComp-ZH como benchmark, pero no se confirma soporte chino en la ficha del repositorio.

## Casos de uso

- Investigacion automatizada y sintesis de informes: el modelo puede descomponer una pregunta amplia en subtareas, consultar fuentes y redactar un informe consolidado, aprovechando su entrenamiento especifico en tareas de busqueda de largo horizonte.
- Agentes de navegacion web: integrado con un navegador headless (por ejemplo, Playwright) mediante tool calling, puede rellenar formularios, extraer tablas y seguir enlaces en cadenas de decenas de pasos.
- Analisis competitivo y vigilancia de mercado: rastreo periodico de sitios publicos, extraccion de datos y generacion de resumenes comparativos en ingles.
- Asistentes de soporte documental interno: recuperacion sobre bases de conocimiento corporativas y respuesta citando las fuentes recuperadas, usando el modo ReAct para trazabilidad.
- Verificacion de hechos y control de calidad de contenidos: comprobacion cruzada de afirmaciones contra multiples fuentes antes de publicar.
- Automatizacion de pipelines de investigacion en CI/CD de datos: ejecucion programada de consultas y agregacion de resultados en un almacen central.
- Evaluacion de sistemas RAG: uso del modelo como razonador de referencia para medir la calidad de recuperadores y generadores en tareas de preguntas y respuestas abiertas.
- Despliegue en produccion con coste contenido: gracias a sus ~3 B de parametros activos, puede servir cargas agente intensivas sin el coste de un modelo denso de 30 B.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card del autor original menciona evaluacion en Humanity's Last Exam, BrowserComp, BrowserComp-ZH, WebWalkerQA, GAIA, xbench-DeepSearch y FRAMES, y afirma un rendimiento de estado del arte, pero no se incluyen cifras concretas en el material proporcionado.

| Benchmark | Resultado |
|---|---|
| Humanity's Last Exam | No disponible |
| BrowserComp | No disponible |
| BrowserComp-ZH | No disponible |
| WebWalkerQA | No disponible |
| GAIA | No disponible |
| xbench-DeepSearch | No disponible |
| FRAMES | No disponible |

## Requisitos de hardware

- VRAM para bf16/fp16: aproximadamente 61 GB solo en pesos (el repositorio ocupa 61,1 GB), mas cache KV y activaciones; requiere 1x H100 80 GB o 2x A100 80 GB.
- FP8: en torno a 31 GB de pesos; viable en 1x H100 80 GB o 1x A100 80 GB con margen para cache.
- INT8: en torno a 31 GB; cabe en GPUs de 48 GB (A6000, L40S) con contexto reducido.
- INT4/GGUF Q4_K_M: en torno a 17-18 GB; cabe en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 5090 (32 GB) y L4 (24 GB) con contexto limitado.
- Consumer GPU: si, en GPUs de 24 GB o mas con cuantizacion de 4 bits; en 16 GB quedaria muy ajustado o requeriria cuantizaciones mas agresivas.
- Memoria unificada: equipos Apple Silicon con 32 GB o 64 GB pueden ejecutar cuantizaciones de 4-8 bits mediante llama.cpp u Ollama, con throughput menor.
- Opciones de despliegue: vLLM y SGLang (soporte de arquitecturas MoE de Qwen), llama.cpp/Ollama para cuantizaciones GGUF, TGI para despliegue HTTP; los scripts de inferencia oficiales estan en el repositorio de GitHub de DeepResearch.
- Latencia y throughput: no disponibles en la informacion proporcionada; al activar solo ~3 B de parametros por token, el coste de decodificacion deberia ser notablemente inferior al de un modelo denso de 30 B, pero no se aportan mediciones.

## Comparativa con modelos similares

La busqueda web realizada no devolvio informacion relevante sobre modelos comparables (los resultados obtenidos no guardan relacion con el modelo). La siguiente tabla recoge unicamente datos verificables del repositorio analizado y marca como no disponible lo que no se puede confirmar.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Tongyi-DeepResearch-30B-A3B | 30,5 B | ~3 B | No disponible | Apache 2.0 | Agente de busqueda profunda |
| Qwen3-30B-A3B (arquitectura base) | ~30,5 B | ~3 B | No disponible en esta ficha | Apache 2.0 | Modelo generalista MoE |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar rendimiento con modelos competidores en los benchmarks de busqueda profunda.

## Limitaciones y advertencias

- Idiomas: el metadato oficial declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: no se especifica la longitud de ventana, lo que impide planificar despliegues con requisitos estrictos de contexto largo.
- Riesgo de alucinacion: como todo modelo generativo usado en bucles agente, puede inventar fuentes, cifras o citas; es imprescindible verificar las salidas en entornos de produccion.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse sobre datos web, hereda los sesgos de esas fuentes.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio analizado es una publicacion de terceros; conviene verificar la procedencia de los pesos frente al repositorio oficial de Alibaba antes de desplegarlos en produccion.
- Reproducibilidad: el repositorio no registra descargas ni validacion de la comunidad (0 descargas, 0 likes), por lo que no hay garantia de que los pesos coincidan con los del modelo original.
- Coste de inferencia agente: aunque el coste por token es bajo (~3 B activos), los paradigmas ReAct y "Heavy" implican muchas llamadas anidadas, lo que multiplica el consumo total.
- Sin resultados de benchmarks en este repositorio: no se pueden validar las afirmaciones de estado del arte con los datos aportados.
- Dependencia de herramientas externas: en tareas de busqueda profunda requiere navegador, motor de busqueda y parser de documentos; su rendimiento depende de la calidad de ese entorno.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ANGELOSEGRETO/Tongyi-DeepResearch-30B-A3B
- Repositorio oficial de codigo (Alibaba-NLP/DeepResearch): https://github.com/Alibaba-NLP/DeepResearch
- Blog tecnico del modelo: https://tongyi-agent.github.io/blog/introducing-tongyi-deep-research
- Cita recomendada (BibTeX, segun el autor):
  - author: Tongyi DeepResearch Team
  - title: Tongyi DeepResearch: A New Era of Open-Source AI Researchers
  - year: 2025
  - howpublished: https://github.com/Alibaba-NLP/DeepResearch
