# AxiomicLabs/GPT-X3-150M

## Resumen

GPT-X3-150M es un modelo de lenguaje base de 149.400.930 parametros desarrollado por Axiomic Labs, publicado bajo licencia Apache 2.0 y entrenado exclusivamente en ingles. Se trata de la tercera generacion de la familia GPT-X de este laboratorio y esta construido sobre la arquitectura propietaria TX5, un diseno hibrido que combina capas GDN2 (un mecanismo de atencion lineal de tipo gated delta network) con capas de atencion completa gated GQA en una proporcion 3:1. Cuenta con 24 capas, una dimension de embedding de 576 y una ventana de contexto de 2.048 tokens.

El modelo destaca por su eficiencia computacional: segun la model card, alcanza un Intelligence Index de 33,05 con solo 75.000 millones de tokens de computo de entrenamiento, frente a los aproximadamente 2 billones de tokens de SmolLM2-135M, que obtiene 27,13 en el mismo indice. El autor afirma que es el primer modelo por debajo de 150M de parametros en superar un Intelligence Index de 30 y que ocupa el primer puesto de la Open SLM Leaderboard, un espacio de evaluacion mantenido por el propio Axiomic Labs.

Su relevancia actual reside en el segmento de modelos pequenos (sub-200M) que pueden ejecutarse en CPU, moviles o GPUs de gama de entrada, un nicho donde la eficiencia en datos y la calidad por parametro son determinantes. No obstante, conviene tener en cuenta que se distribuye como modelo base (no afinado para instrucciones) y que requiere cargar codigo remoto (`custom_code`) para su uso con Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TX5 hibrida: 18 capas GDN2 + 6 capas gated GQA (proporcion 3:1) |
| Parametros totales | 149.400.930 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (`block_size = 2048`) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

TX5 es una pila de 24 capas que alterna bloques de atencion lineal GDN2 con bloques de atencion completa gated GQA en patron 3:1 (tres capas GDN2 por cada capa GQA). Las capas GQA incorporan normalizacion OffsetRMSNorm sobre queries y keys, una puerta de salida y RoPE aplicado sobre 32 de las 64 dimensiones de cabeza; usan 9 cabezas de consulta y 3 cabezas clave/valor. Las capas GDN2 emplean 9 cabezas de dimension 64. El modelo usa embeddings atados (`tie_word_embeddings`), activacion SiLU, normalizacion RMSNorm, SwiGLU con ratio oculto 2,75 (1.584 unidades) y `rope_theta = 100.000`. El tokenizador es el de LFM2.5, con 65.536 tokens y sin token BOS, frente a los 32.770 del GPT-X2.5.

El entrenamiento se realizo desde cero durante 143.052 pasos sobre dos GPUs, con un lote global de 524.288 tokens de computo por paso, lo que suma 75.000 millones de tokens de computo y aproximadamente 187.500 millones de tokens brutos. Durante el primer 30% del entrenamiento se empleo prediccion de seis tokens objetivo por posicion (TST de seis tokens), tras lo cual se cambio a prediccion del siguiente token estandar. El optimizador es un esquema hibrido Muon + AdamW: Muon para los pesos matriciales y AdamW para embeddings, normalizaciones, sesgos y demas parametros no matriciales. La mezcla de datos usa nueve fuentes con proporciones fijas desde el paso 0 (sin curriculum progresivo), entre las que figuran nvidia/Nemotron-ClimbMix, openbmb/UltraData-Code, openbmb/UltraData-Math, AxiomicLabs/SFTset-SLM, AxiomicLabs/FactBase-DCLM e IFM/TxT360-v2. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base.
- Razonamiento aritmetico basico: la model card reporta 50,90% en ArithMark-3, el segundo mejor resultado de la tabla comparativa mostrada.
- Comprension de sentido comun y conocimiento general a nivel de modelos de su tamano (HellaSwag 46,16%, PIQA 71,33%).
- Capacidad de continuacion y respuesta a preguntas de eleccion multiple tras el formateo adecuado del prompt (ARC-Easy 59,64%, ARC-Challenge 31,31%).
- Cobertura de codigo y matematicas derivada de los corpus de entrenamiento (UltraData-Code y UltraData-Math), aunque no se publican benchmarks especificos de generacion de codigo.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

- Clasificacion y etiquetado de textos en ingles: al ser un modelo base de 149M, puede afinarse con pocos datos para tareas de clasificacion de sentimiento, topicos o intenciones, y ejecutarse en CPU con latencia baja.
- Autocompletado en editores y herramientas de escritura: la ventana de 2.048 tokens permite mantener el contexto de un parrafo o fragmento de documento y sugerir continuaciones coherentes en ingles.
- Generacion de codigo asistida en entornos con recursos limitados: los corpus UltraData-Code del entrenamiento lo hacen util para completar funciones cortas o generar fragmentos de codigo, siempre con validacion posterior.
- Filtrado y preprocesado de datos a gran escala: puede actuar como clasificador de calidad o de relevancia en pipelines de curación de corpus, donde el coste por token es critico.
- Educacion y practica de matematicas basicas: sus resultados en ArithMark-3 (50,90%) y su tamano reducido lo hacen viable para generar y resolver ejercicios aritmeticos simples en aplicaciones educativas.
- Investigacion en eficiencia de modelos: sirve como caso de estudio reproducible de arquitecturas hibridas GDN2/GQA y de estrategias como TST de seis tokens, util para grupos que investigan alternativas a la atencion cuadratica.
- Prototipado rapido e investigacion academica: el repositorio ocupa 0,6 GB, por lo que puede descargarse, entrenarse o afinarse en un unico equipo con GPU de gama media.
- Despliegue en dispositivos de borde o moviles: con 149M de parametros, la inferencia en cuantizacion de 8 o 4 bits cabe en memoria de dispositivos moviles, aunque no se distribuyen pesos pre-cuantizados.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (Open SLM Leaderboard):

| Modelo | Organizacion | Parametros | Int Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| GPT-X3-150M | Axiomic Labs | 149M | 33,05 | 46,16% | 59,64% | 31,31% | 71,33% | 50,90% |
| LFM2.5-350M-Base | LiquidAI | 354,5M | 30,50 | 44,98% | 68,86% | 40,96% | 67,68% | 35,90% |
| Boris-2-Preview-1 | OpenCerebral | 144M | 27,91 | 45,23% | 58,38% | 29,95% | 69,21% | 37,60% |
| cagliostro-v3.5 | Bench Labs | 146,35M | 27,49 | 43,41% | 53,75% | 29,35% | 68,06% | 45,30% |
| SmolLM2-135M | HuggingFace | 135M | 27,13 | 43,22% | 58,63% | 29,69% | 68,44% | 39,20% |
| Gemma-3-270M | Google | 268,1M | 25,16 | 41,33% | 57,11% | 28,24% | 68,66% | 35,60% |
| MobileLLM-R1-140M-base | Facebook | 140M | 24,64 | 33,84% | 49,92% | 24,74% | 63,22% | 65,70% |
| GPT-2 Medium | OpenAI | 354,8M | 19,68 | 39,33% | 43,35% | 24,91% | 66,10% | 34,60% |
| GPT-2 (124M) | OpenAI | 124M | 13,58 | 31,26% | 39,35% | 22,35% | 62,08% | 35,70% |

El Intelligence Index del leaderboard normaliza frente al azar HellaSwag, ARC combinado, PIQA y ArithMark-3, con pesos de 1,00, 1,00, 1,00 y 0,65 respectivamente. Estos datos proceden exclusivamente de la model card y del leaderboard del propio autor; no se han verificado de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 unos 600 MB; en FP16/BF16 unos 300 MB; en INT8 unos 150 MB; en INT4 unos 75 MB (sin contar el overhead de activaciones y cache KV, que con 2.048 tokens de contexto es pequeno).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 estan enormemente sobredimensionadas para inferencia, aunque son utiles para afinado. Para entrenamiento desde cero, el autor uso dos GPUs.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable, dado el tamano del modelo (0,6 GB de repositorio).
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, dado que el repositorio usa codigo personalizado (`custom_code`). No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia. Tampoco se documenta soporte de vLLM o TGI, que exigirian una implementacion de la arquitectura TX5.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Int Index (autor) | Licencia | Disponibilidad |
|---|--:|--:|--:|---|---|
| GPT-X3-150M | 149M | 2.048 | 33,05 | Apache 2.0 | HuggingFace, requiere `custom_code` |
| SmolLM2-135M | 135M | no disponible en esta ficha | 27,13 | Apache 2.0 | HuggingFace, ampliamente soportado |
| LFM2.5-350M-Base | 354,5M | no disponible en esta ficha | 30,50 | no disponible en esta ficha | HuggingFace |
| Gemma-3-270M | 268,1M | no disponible en esta ficha | 25,16 | Terminos de Gemma | HuggingFace |
| MobileLLM-R1-140M-base | 140M | no disponible en esta ficha | 24,64 | no disponible en esta ficha | HuggingFace |

Los valores de Intelligence Index corresponden a la tabla publicada por Axiomic Labs y no se han contrastado con fuentes independientes. En la misma tabla, GPT-X3-150M supera a todos los modelos comparados salvo en ArithMark-3, donde MobileLLM-R1-140M-base obtiene 65,70% frente al 50,90% del GPT-X3-150M y a LFM2.5-350M-Base en ARC-Easy y ARC-Challenge.

## Limitaciones y advertencias

- Es un modelo base, no afinado para seguir instrucciones; su uso en formato conversacional requiere afinado posterior o plantillas de prompt cuidadosamente disenadas.
- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera bajo.
- La ventana de contexto es de solo 2.048 tokens, insuficiente para documentos largos, analisis de repositorios completos o conversaciones multi-turno extensas.
- Riesgo de alucinacion inherente a un modelo de 149M de parametros entrenado con 75.000 millones de tokens de computo; la verificacion factual no esta garantizada.
- Sesgos conocidos: no se documentan evaluaciones de sesgo, toxicidad o equidad en la informacion disponible.
- El modelo requiere ejecutar codigo remoto (`custom_code`), lo que implica un riesgo de seguridad si no se audita el repositorio antes de cargarlo.
- No se publican pesos cuantizados ni formatos alternativos, lo que complica el despliegue en ecosistemas estandar como llama.cpp, Ollama o vLLM.
- Los benchmarks, el Intelligence Index y el leaderboard estan mantenidos por el mismo autor del modelo, por lo que no constituyen una evaluacion independiente.
- La model card no documenta regimen de licencia mas alla de Apache 2.0, que en principio permite uso comercial, pero tampoco detalla la procedencia y licencias de todos los corpus de entrenamiento.
- No se documentan politicas de mitigacion de uso malintencionado ni filtros de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxiomicLabs/GPT-X3-150M
- Open SLM Leaderboard (espacio de HuggingFace del autor): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset nvidia/Nemotron-ClimbMix: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
- Dataset openbmb/UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset AxiomicLabs/SFTset-SLM: https://huggingface.co/datasets/AxiomicLabs/SFTset-SLM
- Dataset AxiomicLabs/FactBase-DCLM: https://huggingface.co/datasets/AxiomicLabs/FactBase-DCLM
- Dataset IFM/TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Paper, blog o repositorio adicional: no disponible (la busqueda web no devolvio resultados relevantes sobre este modelo)
