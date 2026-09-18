# IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Thomson-1.0-Small-APEX-I-MiniPlus-V2.1-GGUF es una cuantización GGUF personalizada del modelo base thomsonreuters/Thomson-1.0-Small, publicada por el usuario IsValorum. No se trata de un modelo entrenado desde cero, sino de una receta de cuantización tensor a tensor (denominada APEX-I-MiniPlus) aplicada sobre un modelo de arquitectura MoE de 34.660.610.688 parámetros totales, 40 capas y 256 micro-expertos, con una ventana de contexto declarada de 256.000 tokens. El objetivo declarado por el autor es mantener una fidelidad de razonamiento propia de cuantizaciones Q5–Q6 dentro de un espacio de aproximadamente 13,74 GiB.

La relevancia de esta publicación es doble. Por un lado, demuestra una práctica creciente: la cuantización artesanal por tensor, donde los enrutadores MoE (`gate_inp`) se mantienen en F32, la cabeza de salida en Q6_K, las puertas de atención en Q8_0 y los expertos compartidos en Q5_K, en lugar de aplicar una receta uniforme de 2–3 bits. Por otro, está optimizada explícitamente para inferencia híbrida GPU/CPU, con la intención de evitar bloqueos de desquantización AVX2 cuando parte de los pesos se descarga a memoria de sistema (DDR4/DDR5), lo que permite usar 24 GB de VRAM principalmente para la caché KV en contextos largos.

El autor reporta una perplejidad de 5,3338 ± 0,1254 en WikiText-2 (contexto de 2048, 10 fragmentos), frente a aproximadamente 5,28 del modelo sin cuantizar, y velocidades de generación de +24 a 28 tok/s cuando el grueso del modelo se sirve desde memoria RAM. El repositorio acumula 612 descargas y 0 likes desde su creación en septiembre de 2026, y la licencia declarada es Apache 2.0, heredada del modelo base. La model card está etiquetada con `qwen35moe`, lo que sugiere un linaje MoE de la familia Qwen 3.5, aunque el autor no lo confirma de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) diseno sparsa; 40 capas, 256 micro-expertos; etiquetada como `qwen35moe` en la model card (linaje no confirmado explicitamente) |
| Parametros totales | 34.660.610.688 (aprox. 34,66 B), segun safetensors del modelo base |
| Parametros activos | no disponible (la model card no indica expertos activos por token) |
| Longitud de contexto | 256.000 tokens (256K), segun la model card |
| Tipos de cuantizacion | Receta GGUF personalizada APEX-I-MiniPlus V2.1: expertos nucleares (capas 10-29) en `IQ3_XXS`; expertos de borde (capas 0-9 y 30-39) en `Q3_K`; experto compartido (`shexp`) en `Q5_K` en las 40 capas; atencion completa en `Q4_K` (q/k/v) y `Q6_K` (output); puertas de atencion en `Q8_0` (30 capas); cabeza de salida en `Q6_K`; enrutadores (`gate_inp`) en `F32` sin comprimir |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (unico formato publicado en este repositorio) |

## Arquitectura y entrenamiento

El modelo subyacente, thomsonreuters/Thomson-1.0-Small, es un transformer de mezcla de expertos con 40 capas y 256 micro-expertos por capa, lo que da un total de 34,66 mil millones de parametros y un patron de activacion disperso por token. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; tampoco detalla mecanismos como decodificacion especulativa o atencion lineal. El unico dato estructural concreto que aporta el cuantizador es la topologia de capas y expertos, junto con la distincion entre capas de atencion completa (3, 7, 11, ...) y el resto.

La innovacion de esta publicacion no reside en el entrenamiento, sino en la receta de cuantizacion. Frente a las recetas comunitarias que comprimen uniformemente todos los expertos a `IQ2_S` (2,50 bpw), dejan la cabeza de salida en `Q3_K_M` y comprimen las proyecciones de atencion a `Q3_K`, APEX-I-MiniPlus V2.1 aplica una asignacion diferenciada por sensibilidad: mantiene los enrutadores en F32 para evitar desvio de enrutamiento, sube la cabeza de salida a `Q6_K`, protege las puertas de atencion con `Q8_0` y eleva el experto compartido a `Q5_K` en las 40 capas. Las capas de borde usan `Q3_K` lineal en lugar de codebooks no lineales, lo que segun el autor elimina los bloqueos de desquantizacion en CPU con AVX2 y permite streaming desde RAM a +24–28 tok/s. El autor menciona el uso de imatrix y de Unsloth Studio como herramientas del proceso, sin detallar la metodologia completa.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta `conversational` y pipeline `text-generation`.
- Razonamiento explicito: la model card incluye la etiqueta `reasoning` y referencias a un modo `<think>`, por lo que se espera soporte de cadenas de razonamiento extensas.
- Generacion de codigo: el autor menciona explicitamente sintaxis, indentacion y "corchetes de codigo" como metricas de calidad afectadas por la cuantizacion, lo que implica uso previsto en tareas de programacion.
- Capacidades multilingues en 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, thai y arabe.
- Contexto largo: ventana declarada de 256K tokens, con soporte practico reportado hasta +160K.
- Compatibilidad con llama.cpp: el tag `llama.cpp` y el formato GGUF implican integracion con ese ecosistema y con `endpoints_compatible`.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad verificada; la etiqueta `reasoning` es el unico indicio.
- Vision o audio: no disponible; el pipeline declarado es unicamente de generacion de texto.

## Casos de uso

- Analisis de documentos extensos en estaciones de trabajo de 24 GB: con 256K tokens de contexto, el modelo puede ingerir contratos, informes financieros o expedientes completos sin fragmentacion, dejando la cache KV en VRAM y sirviendo los pesos desde RAM.
- Asistente de razonamiento juridico o financiero: dado el origen Thomson Reuters del modelo base, encaja en flujos de resumen y extraccion de clausulas donde se requiere seguir cadenas de razonamiento largas sobre texto normativo.
- Generacion y revision de codigo en pipelines locales: la cuantizacion esta disenada para preservar sintaxis e indentacion, por lo que puede integrarse en tareas de autocompletado o revision de diffs ejecutadas en hardware de gama alta de consumo.
- Despliegue en memoria de sistema con GPU modesta: gracias al diseno de streaming AVX2, un equipo con RTX 3090 o 4090 y 64 GB de DDR5 puede ejecutar el modelo con gran parte de los pesos en RAM, reservando la VRAM para la cache KV.
- Traduccion y atencion multilingue: con 13 idiomas declarados, es utilizable para traduccion tecnica y soporte en idiomas europeos y asiaticos, aunque sin evaluacion publicada por idioma.
- Prototipado de agentes conversacionales: el tag `conversational` y el formato GGUF permiten levantarlo rapidamente en llama.cpp u Ollama para experimentar con dialogos multi-turno antes de invertir en infraestructura mayor.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio mantiene las versiones V1, V2 y V2.1 como registro publico, lo que lo convierte en un banco de pruebas util para investigar el impacto de recetas por tensor en modelos MoE.
- Investigacion sobre enrutamiento MoE: al preservar los `gate_inp` en F32, permite estudiar el comportamiento de los enrutadores sin el ruido que introduce su compresion.

## Benchmarks y rendimiento

| Metrica | APEX-I-MiniPlus V2.1 | Base sin cuantizar (referencia del autor) |
|---|---|---|
| Perplejidad WikiText-2 (2048 ctx, 10 chunks) | 5,3338 ± 0,1254 | aprox. 5,28 |
| Delta de perplejidad | aprox. +0,05 | — |
| Tamano en disco | aprox. 13,74 GiB (aprox. 14,7 GB) | no disponible |
| Velocidad con offload a RAM | +24 a 28 tok/s | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, etc.) en la informacion disponible. La unica medicion aportada es la perplejidad en WikiText-2, reportada por el propio autor de la cuantizacion y sin verificacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 13,74 GiB; la VRAM adicional depende de la cache KV y del contexto configurado, dato no disponible en la informacion proporcionada.
- Offload completo en GPU (`-ngl 99`): requiere 24 GB de VRAM o mas, lo que incluye RTX 3090, RTX 4090, A100 40 GB, H100 y similares. Con 24 GB el contexto utilizable queda limitado por la cache KV.
- Ejecucion hibrida GPU/CPU: disenada explicitamente para ello; el autor reporta +24 a 28 tok/s con el grueso del modelo en memoria de sistema (DDR4 dual-channel o DDR5 6000+ MT/s).
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB). En tarjetas de 16 GB o 12 GB solo cabe con offload parcial a RAM, con la penalizacion de velocidad correspondiente.
- Opciones de despliegue: llama.cpp es el entorno de referencia; tambien son viables Ollama y LM Studio por estar construidos sobre llama.cpp. vLLM solo ofrece soporte GGUF experimental y puede no reconocer tipos de cuantizacion personalizados como `IQ3_XXS`; TGI no soporta GGUF. No se garantiza compatibilidad con servidores que exijan safetensors.
- Latencia y throughput: 24 a 28+ tok/s en streaming desde RAM segun el autor; no se proporcionan cifras de time-to-first-token ni de throughput en lote (batch).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Rendimiento | Licencia |
|---|---|---|---|---|---|
| APEX-I-MiniPlus V2.1 (este repo) | 34,66 B (MoE) | 256K | 13,74 GiB | PPL WikiText-2 5,3338 | Apache 2.0 |
| APEX-I-MiniPlus V2 (mismo autor) | 34,66 B (MoE) | 256K declarado | aprox. 1,2 GB mas que el generico | Practicamente identico a V2.1 en VRAM completa, segun el autor | Apache 2.0 |
| APEX-I-Mini generico (comunidad) | 34,66 B (MoE) | no disponible | aprox. 12,5 GB | Errores de sintaxis y perplejidad alta en modo razonamiento, segun el autor | Apache 2.0 |
| Thomson-1.0-Small sin cuantizar (modelo base) | 34,66 B (MoE) | no disponible | no disponible | PPL WikiText-2 aprox. 5,28 | Apache 2.0 |

Las cifras de las variantes genericas y de V2 proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente. No se dispone de comparaciones con alternativas de otros autores del mismo tamano o categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva en el nucleo: los expertos de las capas 10-29 se comprimen a `IQ3_XXS` (aproximadamente 3 bits), por lo que se espera perdida de precision en tareas muy sensibles a pesos de baja magnitud, aunque el autor afirme que es minima.
- Perplejidad reportada por el propio cuantizador: la medicion de 5,3338 en WikiText-2 no procede de una evaluacion independiente y la model card no especifica la version exacta del tokenizador ni el pipeline de evaluacion.
- Ausencia de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, por lo que no es posible situar el modelo frente a alternativas con rigor.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; la model card no documenta tasas de factualidad ni mecanismos de mitigacion.
- Idiomas declarados sin evaluacion: los 13 idiomas figuran como etiquetas, pero no se aportan metricas por idioma; el rendimiento en idiomas distintos del ingles y el chino es desconocido.
- Contexto de 256K solo declarado: no hay medicion publicada de degradacion en contextos cercanos al limite ni de comportamiento en tareas tipo "needle in a haystack".
- Repositorio de autor individual: 612 descargas y 0 likes; no cuenta con validacion por parte de la comunidad ni del desarrollador del modelo base.
- Afirmaciones de marketing no verificadas: la model card contiene superlativos ("limite tecnologico absoluto", "cero deriva de enrutamiento") que no van acompanados de evidencia reproducible.
- Licencia: Apache 2.0 declarada, heredada del modelo base. Se recomienda verificar los terminos del repositorio thomsonreuters/Thomson-1.0-Small antes de un uso comercial, especialmente si su uso previsto es financiero o juridico.
- Compatibilidad limitada: al emplear tipos de cuantizacion GGUF personalizados, el soporte en servidores distintos de llama.cpp y sus derivados no esta garantizado.
- La model card original esta truncada en la informacion disponible, por lo que podrian existir secciones adicionales con avisos no recogidos aqui.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- llama.cpp (runtime de referencia para GGUF): https://github.com/ggml-org/llama.cpp
- Unsloth (herramienta mencionada en el proceso de cuantizacion): https://github.com/unslothai/unsloth
- Paper, blog tecnico o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo.
