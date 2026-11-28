# AnesNT2026/Genisi-5-Nexus

## Resumen

Genisi 5 Nexus es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado por AnesNT AI Research, un laboratorio con sede en la provincia de Batna (Argelia). Segun la model card y los ficheros de configuracion del repositorio, se trata de un modelo de gran escala con aproximadamente 2,8 billones de parametros totales, una columna vertebral de atencion hibrida (69 capas de Linear Delta Attention y 24 capas de Dynamic Sparse Attention / MLA) y una configuracion de contexto de 1.048.576 tokens. El checkpoint completo ocupa aproximadamente 1,56 TB y se distribuye en 96 shards de `.safetensors`.

El modelo se presenta en dos modos de inferencia: un modo por defecto orientado al rendimiento y un modo "Thinking" orientado a razonamiento extendido, analisis multi-paso, codigo complejo, matematicas y flujos agenticos. Incorpora una torre vision-temporal de 27 capas y esta etiquetado en Hugging Face con la tarea `image-text-to-text`, lo que lo situa en la categoria de modelos multimodales de entrada imagen y texto.

Su relevancia actual radica en la combinacion de una ventana de contexto de 1M tokens con un esquema MoE de 896 expertos enrutados por capa (16 seleccionados por token) y una precision mixta que usa BF16 en atencion, expertos compartidos, cabeza del modelo y torre de vision, y MXFP4 en los expertos enrutados. La licencia es Apache 2.0. Conviene senalar que los datos de arquitectura y benchmarks proceden exclusivamente de la model card del autor y no se ha verificado su reproduccion de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion hibrida (Linear Delta Attention + Dynamic Sparse Attention/MLA) y torre vision-temporal |
| Parametros totales | 2.780.110.363.392 (aprox. 2,8 billones) |
| Parametros activos | No disponible (la model card indica 16 expertos enrutados seleccionados por token sobre 896 por capa, pero no publica el computo exacto de parametros activos) |
| Longitud de contexto | 1.048.576 tokens (1M) configurados |
| Tipos de cuantizacion | Pesos publicados en precision mixta BF16 + MXFP4 (expertos enrutados); no se detallan otras variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | en, ar, fr, zh (segun metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (96 shards) + codigo de modelo, procesador y tokenizador personalizados |

Otros datos de configuracion recogidos en la model card: 93 capas hibridas, 69 de Linear Delta Attention y 24 de DSA/MLA; 896 expertos enrutados y 2 compartidos por capa MoE; dimension oculta 7.168; dimension intermedia 33.792; tamano oculto de experto enrutado 3.584; tamano intermedio MoE 3.072; 96 cabezas de atencion; rango LoRA de query 1.536; rango LoRA de KV 512; top-K del indice DSA 2.048; torre vision-temporal de 27 capas con hidden size 1.024 y patch size 14; vocabulario de 163.840 tokens; tipo de modelo personalizado `genisi_5_nexus`; router sigmoide con configuracion `noaux_tc`.

## Arquitectura y entrenamiento

La columna vertebral consta de 93 capas hibridas que combinan dos mecanismos de atencion. Por un lado, 69 capas de Linear Delta Attention, que aportan un comportamiento de atencion lineal/recurrente pensado para la eficiencia en contextos largos. Por otro, 24 capas de Dynamic Sparse Attention con Multi-head Latent Attention (MLA), orientadas a la recuperacion selectiva de informacion y a la atencion dispersa. El bloque MoE emplea 896 expertos enrutados y 2 compartidos por capa, con 16 expertos enrutados seleccionados por token y un router sigmoide con configuracion `noaux_tc`. La model card advierte explicitamente de que el recuento total de parametros describe el pool completo de expertos y no debe interpretarse como los parametros activados por token.

La torre vision-temporal tiene 27 capas, hidden size de 1.024, patch size de 14 y componentes `patchmergerv2` / `sd2_tpool`. El layout de precision es mixto: BF16 para atencion, expertos compartidos, cabeza del modelo de lenguaje y torre de vision, y MXFP4 para los expertos enrutados. El repositorio incluye 96 shards numerados, codigo personalizado de modelo, procesador y tokenizador, y un fichero auxiliar de tensores de nucleo neuronal. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, con un modo por defecto orientado al rendimiento y un modo "Thinking" para razonamiento extendido.
- Razonamiento multi-paso y resolucion de problemas complejos (matematicas, analisis, investigacion) en modo Thinking.
- Codigo agentico: la model card lo etiqueta como `agentic-coding` y reporta resultados en benchmarks de ingenieria de software y terminal.
- Capacidades multimodales de imagen y texto (`image-text-to-text`) mediante la torre vision-temporal.
- Ciberseguridad: etiquetas `cybersecurity` y resultados reportados en CWE-bench y SEC-bench Pro.
- Soporte de contexto largo de hasta 1M tokens configurados, con atencion hibrida orientada a la eficiencia en secuencias largas.
- Capacidades multilingues en ingles, arabe, frances y chino, con un benchmark especifico de dariya argelina (DarijaBench / Lahja-IT).
- Flujos agenticos y automatizacion (AutomationBench, OSWorld-2.1, Agents' Last Exam).
- Soporte de tool calling / function calling: no se detalla de forma explicita en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios de codigo de gran tamano: con 1M tokens de contexto configurados y modo Thinking, el modelo puede ingerir arboles de proyecto completos o multiples ficheros y razonar sobre dependencias, refactorizaciones y correccion de errores en tareas de ingenieria de software.
- Agentes de automatizacion de terminal y sistema operativo: los resultados reportados en Terminal-Bench 4.0 y OSWorld-2.1 sugieren su uso en agentes que ejecutan comandos, gestionan entornos y completan tareas de escritorio de forma autonoma.
- Auditoria de seguridad de codigo: con resultados reportados en CWE-bench y SEC-bench Pro, encaja en pipelines de revision de vulnerabilidades y analisis estatico asistido por LLM sobre grandes bases de codigo.
- Procesamiento de documentos extensos con imagen y texto: la combinacion de contexto de 1M tokens y torre de vision permite extraer y razonar sobre informes, planos o capturas junto con su texto asociado.
- Atencion al cliente multilingue en arabe, frances, ingles y chino: el soporte de estos idiomas y el benchmark de dariya argelina lo hacen adecuado para mercados del Magreb y entornos multilingues.
- Investigacion matematica y cientifica asistida: el modo Thinking y los resultados reportados en RiemannBench y Terminal-Bench Science apuntan a su uso en derivaciones, verificacion de razonamientos y experimentos reproducibles.
- Generacion de codigo en produccion: su etiqueta `agentic-coding` y los resultados en FrontierSWE 2 permiten integrarlo en pipelines de CI/CD para revision automatica y parcheo de codigo, siempre que la infraestructura soporte el coste de inferencia.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (indice AAR-BI). No se indica verificacion independiente.

| Benchmark | Genisi 5 Nexus |
|---|---:|
| AA Intelligence Index v5.0 | 61 |
| Vals Index v2.2 | 74,5 % |
| FrontierSWE 2 | 64,8 % |
| SWE-sweep | 10,4 % |
| Terminal-Bench 4.0 (AA) | 67,0 % |
| Agents' Last Exam v1.1 | 79,2 % |
| OSWorld-2.1 | 86,0 % |
| AutomationBench | 56,5 % |
| GraphWalks 256k–1M F1 | 97,1 % |
| RiemannBench | 85,5 % |
| Terminal-Bench Science 0.1 | 66,4 % |
| CWE-bench | 88,5 % |
| SEC-bench Pro | 91,5 % |
| DarijaBench / Lahja-IT | 99,2 % |

La model card incluye ademas una tabla comparativa con modelos denominados "Gemini 4 Carbon", "Claude Opus 5.5", "Gemini 4 Argon" y "Claude Fable 5.1", con valores parcialmente truncados en la informacion disponible. Esos resultados no se reproducen aqui al no estar completos ni verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo ocupa aproximadamente 1,56 TB; no cabe en ninguna GPU consumer ni en configuraciones de una sola GPU de datacenter. Se requiere un cluster multi-GPU o multi-nodo con agregacion de memoria.
- GPU recomendadas: no disponibles de forma explicita en la informacion; por el volumen del checkpoint, el despliegue realista exige nodos con GPUs de datacenter (tipo H100/H200/B200 o equivalentes) en configuracion multi-nodo.
- GPU consumer: no es viable. Ni siquiera en cuantizaciones agresivas el modelo cabe en tarjetas consumer como RTX 4090; la informacion no proporciona variantes GGUF ni cuantizaciones de menor tamano.
- Opciones de despliegue: la model card indica `transformers` como libreria y requiere codigo de modelo y procesador personalizados (`genisi_5_nexus`, `custom_code`). No se confirma soporte en vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card incluye comparaciones con modelos de nombres no verificables (Gemini 4 Carbon, Claude Opus 5.5, Gemini 4 Argon, Claude Fable 5.1) cuyos resultados aparecen truncados en la informacion disponible. No se dispone de datos completos y auditados para construir una comparativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Genisi 5 Nexus | ~2,8 B (MoE) | 1M | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los benchmarks y especificaciones proceden exclusivamente de la model card del autor; no se ha verificado su reproduccion de forma independiente y algunos resultados comparativos aparecen truncados.
- El recuento de 2,8 billones de parametros corresponde al pool completo de expertos; los parametros activos por token no se publican, lo que dificulta estimar coste real de inferencia.
- El checkpoint de 1,56 TB y la ausencia de cuantizaciones publicadas limitan severamente el despliegue a infraestructura de datacenter multi-nodo.
- La model card no detalla el dataset de entrenamiento, el numero de tokens vistos ni las fases de alineamiento (RLHF/DPO), lo que impide evaluar sesgos y calidad de datos.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan evaluaciones de factualidad ni de robustez frente a prompts adversarios.
- El soporte idiomatico declarado se limita a en, ar, fr y zh; el rendimiento fuera de esos idiomas no esta documentado.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluar el coste de infraestructura, la procedencia de los datos de entrenamiento y la responsabilidad sobre el codigo de modelo personalizado.
- El modelo requiere codigo personalizado (`custom_code`, `genisi_5_nexus`) para cargarse, lo que anade riesgo de mantenimiento y de compatibilidad con versiones futuras de `transformers`.
- No se confirma soporte en frameworks de serving ampliamente usados (vLLM, TGI, llama.cpp), lo que complica su integracion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnesNT2026/Genisi-5-Nexus
- Sitio web de investigacion: https://genisi.web.app
- Chat en vivo: https://genisi.web.app/chat
