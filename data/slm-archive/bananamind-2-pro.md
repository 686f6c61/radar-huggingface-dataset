# SLM-Archive/BananaMind-2-Pro

## Resumen

BananaMind-2-Pro es un modelo de lenguaje base (no instruido) de tipo decoder-only, desarrollado desde cero por el equipo BananaMind y publicado bajo el identificador SLM-Archive/BananaMind-2-Pro en HuggingFace. Se trata de un modelo de escala reducida, con 138.971.520 parametros segun la model card (el repositorio declara 159.943.040 parametros reales en safetensors, una discrepancia que conviene verificar antes de integrarlo), entrenado sobre 99.999.449.088 tokens, practicamente el objetivo de un curriculum de 100.000 millones de tokens, a lo largo de 184.954 pasos de optimizacion.

Su proposito es servir como checkpoint base de continuacion de texto para tareas de investigacion en modelos pequenos de lenguaje (SLM), y su relevancia radica en que compite directamente con alternativas de ~125-135M de parametros como GPT-2, GPT-X2.5-135M o SmolLM-135M, con un coste de entrenamiento estimado mucho menor que el de SmolLM y con un tokenizer propio de 32.768 entradas orientado a digitos. La arquitectura es un Transformer pre-normalizado de 24 capas, 640 dimensiones ocultas, atencion con grouped-query (8 cabezas de consulta, 4 de clave/valor), QK normalization, RoPE, SwiGLU y RMSNorm, con embeddings de entrada y salida atados.

La ventana de contexto es de solo 3.072 tokens, muy inferior a la de los modelos actuales, y el modelo solo declara soporte de ingles. Se distribuye con codigo propio, por lo que requiere `trust_remote_code=True` para cargarse con transformers, y su licencia es la bananamind-community-license-1.0, marcada como "other" en HuggingFace, con condiciones que no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BananaMind2Pro decoder-only Transformer (causal, pre-normalizado) |
| Parametros totales | 138.971.520 (model card); 159.943.040 declarados en safetensors del repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 3.072 tokens |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas; pesos en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | bananamind-community-license-1.0 (campo `license: other`) |
| Formato de pesos | safetensors |
| Capas | 24 |
| Tamano oculto | 640 |
| Tamano intermedio (MLP) | 1.920 |
| Cabezas de atencion | 8 (4 cabezas KV) |
| Dimension por cabeza | 80 |
| MLP | SwiGLU |
| Normalizacion | RMSNorm, epsilon 1e-6 |
| Posiciones | RoPE, theta 100.000 |
| Vocabulario | 32.768 (BPE byte-level digit-aware) |
| Embeddings | Atados entrada/salida |
| Cache de generacion | KV cache soportada |
| Clase HF | `BananaMind2ProForCausalLM` |
| Tipo de modelo HF | `bananamind2_pro` |
| Tokens de entrenamiento | 99.999.449.088 |
| Pasos de optimizacion | 184.954 (checkpoint final en el paso 184.953) |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un Transformer causal decoder-only con normalizacion previa a cada subcapa. Cada uno de los 24 bloques aplica self-attention causal con grouped-query attention (8 cabezas de consulta que comparten 4 cabezas de clave/valor, dimension 80) seguida de una red feed-forward SwiGLU con tamano intermedio 1.920, con conexiones residuales en torno a ambas subcapas. La atencion incorpora QK normalization para estabilizar los logits y RoPE (theta 100.000) como codificacion posicional en lugar de embeddings absolutos aprendidos. Los embeddings de entrada y de salida estan atados, lo que reduce el numero de parametros. Durante la generacion autorregresiva, cada capa puede reutilizar las claves y valores en cache en lugar de recalcular todo el prefijo.

El entrenamiento se realizo desde cero sobre un corpus compuesto por FineWeb-Edu (HuggingFaceFW/fineweb-edu), DCLM-Baseline 1.0 (mlfoundations/dclm-baseline-1.0), SmolLM-Corpus (HuggingFaceTB/smollm-corpus) y FineMath (HuggingFaceTB/finemath), procesado con un tokenizer BPE byte-level propio de 32.768 entradas con tratamiento especifico de digitos. El run completo abarco 184.954 pasos de optimizacion y 99.999.449.088 tokens, con una fase final descrita como "quality finish". El compute de entrenamiento estimado con la aproximacion 6ND es de 83.382,91 PFLOPs. No se documenta en la informacion disponible el uso de RLHF, DPO u otra fase de alineacion: se trata explicitamente de un checkpoint base sin instruccion.

## Capacidades

- Generacion de texto por continuacion: el modelo esta disenado para prompts de continuacion, no para formato conversacional de instrucciones.
- Razonamiento basico y conocimiento general de baja escala, medido en ARC Easy (53,58%), ARC Challenge (27,82%), PIQA (67,52%) y HellaSwag (42,78%).
- Aritmetica simple y manejo de digitos: el tokenizer digit-aware y los resultados en ArithMark 3 (38,20%) y ArithMark 2 (32,08%) apuntan a un tratamiento mas granular de numeros que en modelos con tokenizers estandar.
- Completado de codigo elemental: categoria de completado de codigo de Base Bench 1.1 con Code Elo de 1407.
- Generacion con KV cache: soporta decodificacion autorregresiva eficiente reutilizando claves y valores.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; es un modelo base sin post-entrenamiento para uso agentico.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Investigacion en modelos pequenos de lenguaje: sirve como punto de comparacion reproducible frente a GPT-2, GPT-X2.5-135M o SmolLM-135M, con el coste de entrenamiento en PFLOPs documentado y una progresion publicada de 41 evaluaciones completas de Base Bench 1.1 entre 2,70B y 99,999B tokens.
- Experimentacion academica con recursos limitados: al ocupar menos de 1 GB en safetensors, se puede entrenar, evaluar y hacer fine-tuning completo en una unica GPU de consumo, algo inviable con modelos de mayor escala.
- Prototipado de autocompletado de texto corto: con 3.072 tokens de contexto es adecuado para continuar parrafos, titulares o fragmentos breves donde no se requiere memoria conversacional larga.
- Generacion de texto sintetico para pruebas de pipelines: puede producir corpus de prueba en ingles para validar sistemas de ingesta, tokenizacion o indexado sin depender de APIs externas.
- Estudio de aritmetica y tokenizacion de digitos: el tokenizer digit-aware y los benchmarks ArithMark permiten analizar como afecta la tokenizacion al razonamiento numerico en modelos pequenos.
- Fine-tuning supervisado para tareas estrechas: al ser un checkpoint base en ingles, es un punto de partida razonable para ajustar clasificacion de texto, generacion de resumenes cortos o completado de codigo en dominios acotados.
- Despliegue en edge o entornos sin GPU: con ~139M de parametros cabe en CPU y en dispositivos con memoria limitada, util para demos locales y pruebas offline.

## Benchmarks y rendimiento

Resultados publicados en la model card, correspondientes al checkpoint final del paso 184.953. ARC Easy, ARC Challenge, PIQA y HellaSwag usan `acc_norm,none` en zero-shot. ArithMark 3 emplea exactitud de continuacion normalizada por longitud y ArithMark 2 exactitud de continuacion sin normalizar. Code Elo corresponde a la categoria de completado de codigo de Base Bench 1.1 y Base Bench 1.1 Elo a la suite completa de 350 items.

| Benchmark | BananaMind-2-Pro | BananaMind-2-Pro-Preview | GPT-X2.5-135M | BananaMind-2-Medium | GPT-2 |
|---|---:|---:|---:|---:|---:|
| Parametros entrenables | 139M | 139M | 135M | 49,6M | 124M |
| ARC Easy | **53,58%** | 51,01% | 51,81% | 43,81% | 39,35% |
| ARC Challenge | 27,82% | 27,13% | **29,18%** | 25,34% | 22,35% |
| PIQA | 67,52% | 66,76% | **69,42%** | 61,86% | 62,08% |
| HellaSwag | **42,78%** | 39,83% | 40,57% | 32,43% | 31,26% |
| ArithMark 3 | 38,20% | **38,90%** | 38,10% | 36,20% | 35,70% |
| ArithMark 2 | **32,08%** | 28,60% | no disponible | 28,20% | 26,48% |
| INT Index | 24,96 | 23,04 | **25,17** | 15,37 | no disponible |
| Code Elo | **1407** | 1295 | 1253 | 1034 | 996 |
| Base Bench 1.1 Elo | **1124** | 1106 | 1106 | 1034 | 996 |

El INT Index normaliza por azar HellaSwag, la media de ARC Easy y ARC Challenge, PIQA y ArithMark 3, segun la formula publicada en la model card. ArithMark 2 queda excluido del indice.

Comparativa de compute de entrenamiento estimado (6 x parametros x tokens) frente al INT Index:

| Modelo | Compute estimado | INT Index |
|---|---:|---:|
| BananaMind-2-Pro Final | 83.382,91 PFLOPs | 24,96 |
| BananaMind-2-Pro Preview | 43.279,49 PFLOPs | 23,04 |
| GPT-X2.5-135M | 60.750,00 PFLOPs | 25,17 |
| GPT-X2-125M | 56.286,75 PFLOPs | 23,36 |
| GPT-X-125M | 11.210,56 PFLOPs | 19,94 |
| Supra2-100M | 18.000,00 PFLOPs | 19,41 |
| SmolLM-135M | 484.254,03 PFLOPs | 25,74 |
| BananaMind-2-Medium | 14.867,33 PFLOPs | 15,37 |
| OPT-125M | 135.000,00 PFLOPs | 13,80 |

Progresion de checkpoints en Base Bench 1.1: 41 evaluaciones completas de 350 items desde 2,70B hasta 99,999B tokens, todas en CUDA, bfloat16 y batch size 1. El endpoint final con batch 1 registra 1132 Elo, 236/350 correctos (67,43%) y 64,69% de exactitud ponderada. La tabla principal anterior conserva el resultado medido por separado con batch 32 y 233 de 350 casos superados.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16/fp16 los pesos ocupan aproximadamente 0,28 GB (sin contar overhead de activaciones ni cache KV); en int8 en torno a 0,14 GB y en int4 alrededor de 0,07 GB. Los valores de cuantizacion son estimaciones a partir del numero de parametros, ya que la model card no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problema, aunque en estas ultimas el modelo estara muy infrautilizado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos diez anos, e incluso en CPU y en sistemas integrados con memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito obligatorio por el codigo y la arquitectura personalizados). El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible, dado que la arquitectura es custom y no sigue una configuracion estandar.
- Latencia y throughput: no disponibles. La model card solo documenta que las evaluaciones se ejecutaron con batch size 1 y batch 32 en CUDA con bfloat16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | INT Index | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| BananaMind-2-Pro | 139M (o 159,9M segun safetensors) | 3.072 | 24,96 | bananamind-community-license-1.0 | HuggingFace, codigo custom, 0 descargas |
| GPT-X2.5-135M | 135M | 2.048 | 25,17 | no disponible | referencia interna en la model card |
| SmolLM-135M | 135M | no disponible en la informacion | 25,74 | no disponible en la informacion | modelo publico con corpus base compartido (SmolLM-Corpus) |
| BananaMind-2-Medium | 49,6M | no disponible en la informacion | 15,37 | no disponible en la informacion | familia BananaMind |
| GPT-2 | 124M | 1.024 | no disponible | MIT (fuera de la informacion aportada) | publico |

La comparativa se limita a la tabla publicada por el autor. El modelo supera a GPT-2 y a BananaMind-2-Medium en todas las metricas comunes, supera a GPT-X2.5-135M en ARC Easy, HellaSwag, ArithMark 3, INT Index cercano, Code Elo y Base Bench, pero queda por debajo en ARC Challenge y PIQA. Frente a SmolLM-135M esta ligeramente por debajo en INT Index (24,96 frente a 25,74) con aproximadamente una sexta parte del compute de entrenamiento estimado.

## Limitaciones y advertencias

- Es un modelo base, no un modelo instruido ni de chat: responde con continuaciones de texto y no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Discrepancia en el recuento de parametros: la model card indica 138.971.520 y el repositorio de safetensors declara 159.943.040. Conviene verificar cual corresponde al checkpoint efectivamente descargado.
- Riesgo de alucinacion elevado: con 139M de parametros y ~100.000 millones de tokens vistos, la capacidad de retener hechos es muy limitada y las afirmaciones factuales no son fiables.
- Cobertura idiomatica: solo ingles declarado; no hay garantia de un comportamiento correcto en castellano ni en otros idiomas.
- Contexto corto: 3.072 tokens limitan cualquier tarea que requiera memoria de conversacion o documentos extensos.
- Sin datos de alineacion: no se documenta RLHF, DPO ni filtros de seguridad, por lo que puede generar contenido sesgado, toxico o inapropiado sin mitigacion.
- Sesgos conocidos: no se especifican en la informacion disponible; al entrenar sobre FineWeb-Edu, DCLM y SmolLM-Corpus, hereda los sesgos de esas fuentes web y academicas.
- Licencia: bananamind-community-license-1.0, clasificada como "other". No se detallan en la informacion disponible las condiciones de uso comercial, atribucion o redistribucion; hay que revisar el archivo LICENSE del repositorio antes de usarlo en produccion.
- Requiere ejecucion de codigo remoto (`trust_remote_code=True`), lo que implica revisar el codigo del repositorio antes de cargarlo en entornos sensibles.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el checkpoint de forma independiente.
- Madurez de despliegue: al usar una arquitectura y un tipo de modelo personalizados, es probable que no funcione en servidores de inferencia estandar como vLLM, TGI u Ollama sin trabajo adicional de portado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SLM-Archive/BananaMind-2-Pro
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Baseline 1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog o repositorio adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a una marca de perfumes y a articulos genericos sobre modelos pequenos de lenguaje de IBM y ASI, sin relacion con BananaMind).
