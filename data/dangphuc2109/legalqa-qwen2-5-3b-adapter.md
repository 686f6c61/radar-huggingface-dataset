# dangphuc2109/legalqa-qwen2.5-3b-adapter

## Resumen

`dangphuc2109/legalqa-qwen2.5-3b-adapter` es un adaptador QLoRA (formato PEFT) sobre `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el usuario dangphuc2109 para la tarea 2 (Vietnamese Legal QA) del UIT Data Science Challenge (DSC) 2026. No es un modelo independiente, sino el componente generador de un sistema RAG completo que se publica en el mismo repositorio junto con el encoder denso afinado, los bundles de ejecución reproducibles y el historial de experimentos. El repositorio ocupa 2,0 GB e incluye varios subdirectorios de `runs/` con adaptadores finales, además del encoder de recuperación `encoder_ft_v2`.

El problema que resuelve es la respuesta a preguntas legales en vietnamita con fundamento normativo verificable. Para ello el sistema combina una capa de memoria exacta, recuperación híbrida multi-rama (BM25S con segmentación de palabras vietnamitas, canal denso Matryoshka y canal de referencias legales por número de documento y artículo), fusión por Reciprocal Rank Fusion ponderada con k=60, reranking con un cross-encoder (`BAAI/bge-reranker-v2-m3`) y una generación final en dos partes: razonamiento y conclusión estatutaria, más un bloque de cita textual íntegra del artículo.

Es relevante ahora porque documenta un sistema de dominio legal de extremo a extremo con presupuesto de parámetros auditable (< 4.000 millones), licencia Apache 2.0 y artefactos de evaluación públicos, algo poco habitual en modelos legales en vietnamita. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT) sobre un transformer decoder-only de la familia Qwen2.5; el sistema completo añade un encoder denso y un cross-encoder de reranking |
| Parametros totales | 3.086.303.232 (generador base); 3.788.891.136 declarados como total del sistema; adaptador entrenable: 21.000.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4-bit NF4; no se documentan cuantizaciones GGUF ni AWQ/GPTQ para inferencia |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | `peft` (Transformers + PEFT para carga) |
| Modelo base | `Qwen/Qwen2.5-3B-Instruct` |
| Tamano del repositorio | 2,0 GB |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-22 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El generador es un adaptador QLoRA de 21 millones de parametros entrenables sobre `Qwen/Qwen2.5-3B-Instruct` (3.086.303.232 parametros congelados en la base). El entrenamiento usa cuantizacion 4-bit NF4, entropia cruzada con linear fusionado selectivo de Liger y gradient checkpointing no reentrante. Se documentan dos configuraciones: 1 epoca (loss 0,7726; precision 80,22 %) y 2 epocas (loss 0,7797; precision 82,15 %), con el adaptador final del run `run_d2618710d9d0b6de_20260921_154231` cargable desde el subdirectorio `runs/run_d2618710d9d0b6de_20260921_154231/final_adapter`.

El sistema completo no es solo el LLM. La capa de recuperacion combina un canal disperso BM25S con segmentacion de palabras vietnamitas, un canal denso (`encoder_ft_v2`, un DEk21 afinado con Matryoshka sobre pares pregunta-fragmento legales vietnamitas, con dimensiones 768, 512 y 256, y 135.168.000 parametros), un canal de referencias legales que parsea numeros de documento y articulos (por ejemplo «Dieu 17 Nghi dinh 90/2017/ND-CP») y una fusion RRF ponderada con k=60. Sobre el resultado actua `BAAI/bge-reranker-v2-m3` (567.419.904 parametros) en GPU. La generacion final usa ensamblado en dos partes: razonamiento y conclusion con base normativa, mas un bloque de cita textual del articulo, con calibracion de longitud orientada a la distribucion de referencia (media aproximada de 850 palabras). El presupuesto de parametros declarado cumple el limite de 4.000 millones con un margen de 211.108.864 parametros; conviene senalar que la suma de generador, reranker y encoder denso coincide exactamente con el total declarado, por lo que el adaptador de 21 millones no parece estar incluido en esa cifra total.

## Capacidades

- Generacion de texto causal en vietnamita orientada a dominio legal.
- Respuesta a preguntas legales con fundamento en normativa recuperada (RAG auditable y disenado para evitar fugas de informacion).
- Recuperacion semantica multilingue parcial via el encoder denso del sistema (dimensiones Matryoshka 768/512/256) y el cross-encoder `bge-reranker-v2-m3`.
- Citacion literal de articulos y decretos, con parseo de referencias del tipo «Dieu X ... /ND-CP».
- Generacion de respuestas en formato de dos partes (razonamiento/conclusion + bloque de cita estatutaria).
- Calibracion de longitud de respuesta hacia la distribucion de referencia (media de aproximadamente 850 palabras; el run mas reciente reporta media de 1.065 palabras con tope de 1.536 tokens).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Asistencia legal automatizada en vietnamita: el sistema responde consultas ciudadanas recuperando primero los articulos aplicables y generando despues una conclusion fundamentada, con el texto literal de la norma como respaldo verificable.
- Portales publicos de atencion al ciudadano: el pipeline puede desplegarse como backend de un chatbot institucional que responde sobre decretos y circulares concretas, citando numero de documento y articulo.
- Busqueda semantica en corpus legales: usando el encoder denso `encoder_ft_v2` y el canal BM25S se puede indexar un corpus normativo y recuperar fragmentos relevantes incluso con formulaciones coloquiales de la pregunta.
- Verificacion y auditoria de respuestas: el bloque de cita textual permite que un revisor humano compare la respuesta generada con el texto normativo original antes de publicarla, algo critico en dominio juridico.
- Investigacion academica y competiciones: el repositorio incluye bundles de ejecucion reproducibles e historial de runs con puntuaciones Codabench, lo que sirve como linea base para equipos que participen en tareas de QA legal.
- Formacion de estudiantes de derecho: el modelo puede generar explicaciones introductorias con la norma citada, utiles como material de estudio que el alumno contrasta con el texto legal.
- Pre-procesado de expedientes: extraccion y normalizacion de referencias normativas (numero de documento, articulo) presentes en documentos legales antes de un analisis posterior.
- Prototipado de producto legaltech: al ser un adaptador de 21 M sobre una base de 3 B con licencia Apache 2.0, permite experimentar con coste de almacenamiento bajo.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las puntuaciones de la plataforma Codabench y la metrica MRR del encoder denso.

| Run | Puntuacion Codabench | Estrategia de generacion | Encoder denso | Ensamblado de respuesta | Notas |
|---|---|---|---|---|---|
| `runs/20260920-215402` | 0,5486 (puesto 2) | Qwen2.5-3B base zero-shot (`SYS_B`) | `encoder_ft_v2` (MRR 0,3407) | Dos partes (`article@4000` + supervisado) | 82 overrides de QA conocidas; media de 869 tokens |
| `runs/run_5433e8b4787137c9_20260920_193355` | 0,4900 | QLoRA 1 epoca (loss 0,7726; precision 80,22 %) | `huydang-dek21` base | Solo prosa (`snapped`, media 313 tokens) | Base LoRA de alta precision, prosa aislada |
| `runs/run_d2618710d9d0b6de_20260921_154231` | Objetivo > 0,60 (no confirmado) | QLoRA 2 epocas (loss 0,7797; precision 82,15 %) | `encoder_ft_v2` (alineado) | Dos partes (tope 1.536 tokens, bfloat16) | 1.918 predicciones, media 1.065 palabras, cero respuestas vacias |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el generador en bfloat16: aproximadamente 6,2 GB solo de pesos (3,086 B parametros x 2 bytes), mas cache KV y activaciones; en la practica se recomienda un minimo de 8-10 GB de VRAM.
- VRAM estimada con cuantizacion 4-bit NF4: aproximadamente 1,9-2,0 GB de pesos, con un consumo total tipico de 4-6 GB segun longitud de contexto y tamano de lote. El adaptador anade unos 21 M de parametros, despreciables en terminos de memoria.
- Componentes adicionales del pipeline: el reranker `BAAI/bge-reranker-v2-m3` (567 M) ocupa alrededor de 1,1-1,2 GB en bfloat16 y el encoder denso (135 M) aproximadamente 0,3 GB en float32.
- GPU recomendadas: para el generador en bfloat16, A100, H100, L40S o RTX 4090; para el pipeline completo con reranker en GPU, se recomienda al menos 16-24 GB de VRAM.
- Cabe en GPU de consumo: si, el generador en 4-bit NF4 entra en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070; el pipeline completo con reranker necesita al menos 12 GB y preferiblemente 16 GB.
- Opciones de despliegue documentadas: Transformers con PEFT (`PeftModel.from_pretrained`), `sentence_transformers` y `huggingface_hub` para el encoder denso. No se documentan recetas para vLLM, TGI, Ollama ni llama.cpp en la informacion proporcionada, y no se publican pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de QA legal en vietnamita en la informacion proporcionada. La unica comparacion posible es con el modelo base, del que solo se conocen los parametros del generador.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dangphuc2109/legalqa-qwen2.5-3b-adapter` | 21 M entrenables; 3,79 B declarados en el sistema | No disponible | Codabench 0,5486 (mejor run publicado) | Apache 2.0 | HuggingFace, adaptador PEFT |
| `Qwen/Qwen2.5-3B-Instruct` (base) | 3,086 B | No disponible en esta ficha | No disponible para la tarea legal | No disponible en esta ficha | HuggingFace |
| Otros modelos de QA legal en vietnamita | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Cobertura linguistica limitada al vietnamita; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Especifico de dominio legal vietnamita: fuera de ese ambito su comportamiento no esta evaluado y probablemente degrade.
- Riesgo de alucinacion inherente a los modelos generativos; el diseno mitiga parte del problema obligando a citar el texto normativo, pero no lo elimina. La validacion humana sigue siendo necesaria en cualquier uso juridico real.
- El mejor resultado publicado en Codabench es 0,5486 (puesto 2); el objetivo de superar 0,60 del run de dos epocas no esta confirmado en la informacion disponible.
- La longitud de contexto del generador no se documenta en el repositorio; la estrategia de ensamblado limita las respuestas a 1.536 tokens en el run mas reciente, lo que puede truncar razonamientos largos.
- Los datos de entrenamiento no se detallan: se desconoce la composicion del corpus legal, si hubo RLHF/DPO y que sesgos puede arrastrar el corpus de referencia.
- El adaptador depende del modelo base `Qwen/Qwen2.5-3B-Instruct`; no es un modelo autonomo y requiere descargar la base por separado.
- Licencia Apache 2.0, lo que en principio permite uso comercial, pero sin garantia explicita sobre los derechos de redistribucion del corpus normativo o de los datos de entrenamiento subyacentes.
- Repositorio sin descargas ni likes y sin resultados de benchmarks estandar: la madurez y la robustez en produccion no estan contrastadas por terceros.
- Posible inconsistencia documental en el presupuesto de parametros: la suma de generador, reranker y encoder denso ya iguala el total declarado, de modo que el adaptador de 21 M no estaria contabilizado en esa cifra.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, por lo que no hay validacion externa disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dangphuc2109/legalqa-qwen2.5-3b-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Cross-encoder de reranking citado: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Paper, blog o repositorio adicional: no disponible (la busqueda web no devolvio resultados relevantes)
