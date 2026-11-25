# flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Formal25pct

## Resumen

SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Formal25pct es un ajuste fino supervisado (SFT) de Qwen2.5-7B, desarrollado por el usuario flaitenberger como parte de los experimentos del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models*. El modelo parte de los pesos completos de Qwen2.5-7B (7.615.616.512 parametros) y se entrena sobre una mezcla de 100.000 ejemplos de instrucciones en la que un 25% de las filas se sustituye por problemas de deduccion multi-paso generados de forma programatica, con derivaciones paso a paso verificadas por un comprobador simbolico.

La tesis del trabajo es que una fraccion pequena de datos sinteticos de deduccion logica, correctos por construccion y sin conocimiento del mundo, mejora el razonamiento sin degradar de forma apreciable el rendimiento general. Este checkpoint concreto corresponde a la ejecucion con semilla 3407 de la mezcla `Dolci100k-Formal25pct`, en la que 75.000 ejemplos provienen de Dolci-Instruct-SFT-No-Tools y 25.000 son problemas de deduccion Horn con hasta 25 niveles de encadenamiento.

Es relevante para desarrolladores e investigadores interesados en la sintesis de datos para razonamiento: demuestra que datos logicos generados por un programa corto, sin modelo en el bucle, producen ganancias medibles en ProofWriter, FOLIO y BIG-Bench Hard manteniendo cifras casi identicas en MMLU, HellaSwag o BoolQ. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino completo de Qwen2.5-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens de longitud maxima de secuencia durante el entrenamiento (contexto nativo de Qwen2.5-7B: no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), libreria transformers |
| Tamano del repositorio | 15,2 GB |
| Modelo base | Qwen/Qwen2.5-7B |
| Dataset de entrenamiento | flaitenberger/SpinningStrawIntoGold-SFT-Mixtures (config `logic_p25`) + allenai/Dolci-Instruct-SFT-No-Tools |
| Pipeline | text-generation (compatible con text-generation-inference y endpoints) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen2.5-7B original y se somete a un ajuste fino supervisado de parametros completos durante una sola epoca. La configuracion registrada en la model card incluye learning rate de 5e-06 con schedule lineal y warmup ratio de 0,03, batch global de 128, longitud maxima de secuencia de 8192 (la ejecucion aborta si mas del 0,5% de los objetivos se truncarian), precision mixta bf16 y FSDP con sharding completo y gradient checkpointing. La perdida se calcula solo sobre los tokens del asistente, con el prompt enmascarado y la plantilla de chat de Qwen2.5. Se publica el checkpoint final de la ejecucion.

Los datos combinan 75.000 ejemplos de instrucciones de Dolci-Instruct-SFT-No-Tools (conversaciones de un solo turno muestreadas con semilla 3407) y 25.000 problemas de deduccion generados. Estos problemas son deducciones ground de clausulas de Horn sobre constantes abstractas (palabras de color, arbol y direccion), con reglas encadenadas de hasta 25 capas, reglas distractoras que nunca se activan y una pregunta con cuatro respuestas candidatas. El objetivo deriva la respuesta paso a paso, en ingles o en notacion formal con constantes y predicados declarados y lineas numeradas y justificadas; un comprobador simbolico valida cada derivacion. No hay modelo generador en el bucle: los datos son correctos por construccion. La innovacion principal es metodologica: sustituir una porcion fija de la mezcla (5-25%) manteniendo el numero total de ejemplos, en lugar de anadir datos sinteticos.

## Capacidades

- Generacion de texto conversacional de un solo turno con la plantilla de chat de Qwen2.5.
- Razonamiento deductivo multi-paso: derivaciones encadenadas con conclusiones intermedias transportadas a lo largo de la cadena.
- Resolucion de problemas de logica formal (clausulas de Horn, ProofWriter, FOLIO) tanto con chain-of-thought como con respuesta directa.
- Generacion de derivaciones largas en notacion formal que un comprobador simbolico puede aceptar (segun el paper, basta un 1% de la mezcla para adquirir esta habilidad).
- Razonamiento matematico basico y de nivel escolar (GSM8K).
- Generacion de codigo (HumanEval, MBPP), aunque con una ligera perdida frente al baseline en HumanEval.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no se documenta; la mezcla usa explicitamente la variante Dolci *No-Tools*, por lo que no se debe asumir soporte fiable de herramientas.
- Modo thinking explicito, vision o audio: no disponible.

## Casos de uso

- Razonamiento logico en produccion: el modelo puede resolver consultas que requieren encadenar reglas if-then sobre entidades y relaciones, con ganancias de hasta 12,8 puntos en ProofWriter depth 3 en modo respuesta directa frente al baseline de la misma ejecucion.
- Generacion de explicaciones auditables: para pipelines que necesitan una justificacion paso a paso verificable, el modelo produce derivaciones numeradas y justificadas que pueden validarse con un comprobador simbolico antes de aceptar la respuesta.
- Evaluacion de sistemas de razonamiento: util como componente de referencia en bancos de prueba internos de deduccion, dado que su comportamiento en ProofWriter y FOLIO esta medido contra un baseline controlado.
- Asistentes de analisis normativo o de reglas: escenarios con normativa estructurada (politicas, condiciones, arboles de decision) donde el modelo debe arrastrar conclusiones intermedias a lo largo de cadenas largas.
- Investigacion en sintesis de datos: punto de partida reproducible (semilla 3407, mezcla documentada, `provenance.json` con argumentos y ficheros de evaluacion) para estudiar el efecto de datos logicos sinteticos en el ajuste por instrucciones.
- Tareas generales de instruccion en ingles con contexto de hasta 8192 tokens: resumen, reescritura y respuesta a preguntas, con rendimiento casi identico al baseline en MMLU, HellaSwag, BoolQ y SciQ.
- Generacion de codigo asistida en pipelines de CI/CD: soporta generacion de funciones y parches (HumanEval 63,4; MBPP 66,0), aunque no se documenta tool calling, por lo que la integracion debe hacerse mediante prompts y no mediante APIs de funciones.

## Benchmarks y rendimiento

Resultados publicados en la model card (exactitud, exact match o pass@1 en porcentaje), comparados con el baseline de la misma ejecucion de entrenamiento:

| Benchmark | Este modelo | Baseline | Diferencia |
|---|---|---|---|
| ARC-Challenge | 48,5 | 48,9 | -0,3 |
| GSM8K | 78,1 | 75,9 | +2,2 |
| MMLU | 69,8 | 70,4 | -0,5 |
| HellaSwag | 73,2 | 73,2 | +0,1 |
| LogiQA (AGIEval) | 37,0 | 35,5 | +1,5 |
| BBH | 67,1 | 64,8 | +2,2 |
| HumanEval | 63,4 | 65,9 | -2,4 |
| MBPP | 66,0 | 64,4 | +1,6 |
| BoolQ | 86,4 | 86,7 | -0,3 |
| IFEval (strict) | 40,7 | 42,0 | -1,3 |
| RACE | 43,8 | 45,4 | -1,5 |
| SciQ | 96,6 | 96,8 | -0,2 |
| TruthfulQA-MC2 | 49,5 | 50,6 | -1,0 |
| FOLIO | 55,2 | 53,7 | +1,5 |
| GPQA-Diamond | 38,4 | 38,9 | -0,5 |
| ProofWriter depth 0, CoT | 59,8 | 55,4 | +4,4 |
| ProofWriter depth 1, CoT | 49,0 | 44,6 | +4,4 |
| ProofWriter depth 2, CoT | 55,2 | 42,8 | +12,4 |
| ProofWriter depth 3, CoT | 48,0 | 42,0 | +6,0 |
| ProofWriter depth 5, CoT | 46,2 | 38,8 | +7,4 |
| ProofWriter depth 0, directa | 59,8 | 50,4 | +9,4 |
| ProofWriter depth 1, directa | 38,4 | 30,6 | +7,8 |
| ProofWriter depth 2, directa | 50,6 | 39,6 | +11,0 |
| ProofWriter depth 3, directa | 52,6 | 39,8 | +12,8 |
| ProofWriter depth 5, directa | 53,4 | 42,0 | +11,4 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 18-20 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S y A10G 24 GB son suficientes en bf16. Con cuantizacion a 8 bits o 4 bits cabria en GPUs de 12-16 GB, aunque el autor no publica pesos cuantizados.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en RTX 4080 (16 GB) requeriria cuantizacion, no publicada.
- Opciones de despliegue: transformers, text-generation-inference (el modelo declara `text-generation-inference` y `endpoints_compatible`), y en principio vLLM o llama.cpp si se generan pesos convertidos, aunque no se documentan artefactos GGUF en el repositorio.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Formal25pct | 7,6B | 8192 (entrenamiento) | Apache 2.0 | Especializado en deduccion; ProofWriter depth 3 directa 52,6; MMLU 69,8 |
| Qwen2.5-7B (base) | 7,6B | no disponible en la informacion | Apache 2.0 | Modelo de partida; sin ajuste especifico en deduccion |
| SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Baseline | 7,6B | 8192 (entrenamiento) | Apache 2.0 | Mismo pipeline sin datos de deduccion; ProofWriter depth 3 directa 39,8; MMLU 70,4 |
| Otros modelos de 7B comparables | no disponible | no disponible | no disponible | No se proporcionan datos de terceros en la informacion disponible |

## Limitaciones y advertencias

- El modelo esta ajustado solo en ingles; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea inferior al del Qwen2.5-7B original.
- Riesgo de alucinacion: los datos de entrenamiento son deducciones sobre constantes abstractas sin conocimiento del mundo; el modelo puede generalizar el formato de derivacion a premisas incorrectas y producir cadenas formalmente plausibles pero invalidas si no se valida con un comprobador externo.
- Perdida de rendimiento en tareas de instruccion estricta: IFEval strict cae 1,3 puntos y RACE 1,5 puntos frente al baseline; en HumanEval la caida es de 2,4 puntos.
- No se documenta soporte de tool calling ni de function calling; la mezcla usa Dolci-Instruct-SFT-No-Tools, por lo que no es adecuado para agentes que dependan de APIs de herramientas.
- El contexto de entrenamiento es de 8192 tokens; no se documenta si el modelo conserva la ventana nativa de Qwen2.5-7B ni su comportamiento mas alla de esa longitud.
- El articulo esta en revision y el enlace al preprint no estaba disponible en el momento de la ficha; los resultados deben tratarse como preliminares.
- Uso comercial permitido por Apache 2.0, pero el autor no ofrece garantias ni soporte; el modelo tiene 44 descargas y 0 likes, por lo que la validacion comunitaria es practicamente nula.
- El checkpoint publicado corresponde a una unica semilla (3407); la variabilidad entre semillas no se detalla en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Formal25pct
- Repositorio con todas las semillas: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds
- Baseline de la misma ejecucion: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Baseline
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Dataset Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Preprint del articulo: no disponible (pendiente de publicacion segun la model card)
