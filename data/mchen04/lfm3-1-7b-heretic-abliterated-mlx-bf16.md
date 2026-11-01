# mchen04/LFM3-1.7B-Heretic-Abliterated-MLX-bf16

## Resumen

LFM3-1.7B-Heretic-Abliterated-MLX-bf16 es un port a MLX del modelo Vortecks/LFM3-1.7B-Heretic-Abliterated, una version "abliterated" (con el comportamiento de rechazo eliminado) del modelo base LiquidAI/LFM3-1.7B de Liquid AI. El port lo publica el usuario mchen04 y esta pensado especificamente para ejecutarse en Apple Silicon mediante la libreria mlx-lm. Los pesos son los bytes bfloat16 del modelo fuente, sin cuantizacion, poda, fine-tuning ni un nuevo proceso de abliteration: los 286 tensores son identicos bit a bit al original.

El modelo base LFM3 pertenece a la familia de modelos "Liquid" de Liquid AI disenados para entornos edge. Con aproximadamente 1.730 millones de parametros y una longitud de contexto de 262.144 tokens, emplea una arquitectura hibrida `Lfm3ForCausalLM` de 24 capas que combina convoluciones cortas con puerta (gated short convolutions), atencion de ventana deslizante y atencion global. Esta mezcla busca reducir el coste computacional de la atencion en contextos largos manteniendo capacidad de recuperacion de informacion.

La relevancia de esta ficha radica en dos factores. Por un lado, permite ejecutar un modelo de 1,7B con contexto muy largo de forma local en equipos Apple con memoria unificada (unos 4 GB libres para inferencia residente). Por otro, la abliteration elimina los mecanismos de rechazo del modelo original: Vortecks reporta 3/100 rechazos en un conjunto de prompts adversarios frente a 92/100 del modelo base. Esto lo hace inadecuado para cualquier despliegue sin una capa de moderacion propia y convierte la evaluacion de riesgos en un requisito previo a su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm3ForCausalLM` hibrida: 24 capas (13 convoluciones cortas con puerta, 5 de atencion de ventana deslizante, 6 de atencion global) |
| Parametros totales | 1.728.801.536 (~1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bfloat16 (pesos originales sin cuantizar); el repo no incluye variantes cuantizadas |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (`lfm1.0`, marcada como `other`) |
| Formato de pesos | safetensors (bf16), libreria mlx; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LFM3 de Liquid AI, una variante de transformer hibrida orientada a eficiencia en edge. De las 24 capas, 13 son convoluciones cortas con puerta, 5 usan atencion de ventana deslizante y 6 emplean atencion global. Esta distribucion reduce el coste cuadratico de la atencion en la mayor parte de la red y reserva la atencion global para un subconjunto de capas, lo que permite sostener una ventana de 262.144 tokens con un coste de memoria y computo contenido para su tamano. La implementacion MLX del autor incluye un fichero `lfm3.py` con la definicion de la arquitectura, ya que mlx-lm no incorpora LFM3 de forma nativa.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, uso de RLHF o DPO). El proceso de abliteration lo realiza Vortecks con la herramienta Heretic; segun la model card, la divergencia KL respecto al modelo base es de 0,0094, lo que indica un cambio moderado en la distribucion de salidas. El port de mchen04 no modifica los pesos: se limita a reempaquetar los tensores bfloat16 originales para MLX. La verificacion incluye comparaciones de logits en float32 (diferencia maxima absoluta de 1,44e-3 sobre 2.076 posiciones, con top-1 del 100 %), continuaciones greedy identicas 9/9 en float32 y 6/9 en bfloat16 (las diferencias se atribuyen a empates cercanos de logits), y validacion de la plantilla de chat y del decodificado con cache KV.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de memoria de conversacion segun las pruebas del autor.
- Tool calling y function calling: la plantilla de chat acepta el parametro `tools=[...]` y el autor verifica que la llamada a herramientas es correcta en todas las ejecuciones del conjunto de prueba.
- Modo de razonamiento (thinking block) integrado en la plantilla de chat, heredado del modelo fuente.
- Generacion de salida estructurada en JSON, aunque con fallos de parseo estricto documentados (ver limitaciones).
- Capacidades multilingues en 16 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Razonamiento matematico y STEM, con ajustes de muestreo recomendados especificos (temperatura 1.0, top_p 0.95, top_k 20).
- Recuperacion de informacion en contexto largo, verificado en las pruebas del port con prompts de long-context retrieval.
- Sin filtrado de seguridad propio: el comportamiento de rechazo ha sido eliminado mediante abliteration.

## Casos de uso

- Chat local en Apple Silicon: el modelo cabe en unos 4 GB de memoria unificada y se ejecuta con mlx-lm, lo que permite tener un asistente conversacional privado en un Mac sin conexion a servicios externos.
- Automatizacion de agentes con tool calling: la plantilla de chat soporta definiciones de herramientas y el autor verifica llamadas correctas, por lo que puede integrarse en flujos de agente que consulten APIs o ejecuten funciones locales.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, es adecuado para resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada, siempre que se valide la recuperacion en la parte media y final del contexto.
- Generacion de codigo asistida en local: el modo general recomendado (temperatura 0.1, top_k 50) esta pensado para coding y tool use, lo que permite autocompletado y generacion de fragmentos en entornos de desarrollo sin enviar codigo a la nube.
- Traduccion y atencion multilingue: al cubrir 16 idiomas, puede usarse para traduccion entre pares como espanol-ingles o arabe-frances en aplicaciones de soporte con usuarios internacionales.
- Experimentacion en investigacion sobre alineacion y seguridad: al ser un modelo abliterated con metricas de rechazo documentadas (3/100 frente a 92/100), sirve como objeto de estudio para evaluar tecnicas de moderacion externa y de recuperacion de comportamientos seguros.
- Generacion de datos sinteticos y aumento de datasets: su bajo requisito de memoria permite generar grandes volumenes de texto en local, con la advertencia de que la salida puede contener contenido inapropiado y requiere filtrado posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pruebas de equivalencia entre el port MLX y la implementacion de referencia en transformers (identidad de tensores, diferencias de logits, continuaciones greedy y plantilla de chat), no puntuaciones en MMLU, HumanEval, GSM8K ni similares. Tampoco se proporciona una cifra de tokens por segundo para inferencia residente; la verificacion se realizo en un Apple M2 de 16 GB con los pesos transmitidos capa por capa bajo un limite de memoria.

## Requisitos de hardware

- Memoria: aproximadamente 4 GB de memoria unificada libre para inferencia residente en bfloat16; el repo ocupa 3,5 GB.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (la verificacion se hizo en un M2 de 16 GB). No se documenta soporte para GPU NVIDIA, ya que el formato es MLX.
- Cabe en equipos consumer Apple: si, en Mac con al menos 8 GB de memoria unificada, aunque 16 GB ofrece margen comodo.
- Opciones de despliegue: mlx-lm 0.32.2 o superior con `trust_remote_code=True`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este repo concreto.
- Latencia y throughput: no disponibles. El autor indica explicitamente que no se midio la velocidad en inferencia residente normal.
- Nota de muestreo: mlx-lm aplica `repetition_penalty` a los ultimos 20 tokens por defecto, a diferencia de transformers, que lo aplica a todo el contexto; para igualar comportamiento hay que ajustar `repetition_context_size` en `make_logits_processors`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Abliterated-MLX-bf16 (este) | ~1,73B | 262.144 | LFM Open License v1.0 | MLX, Apple Silicon, requiere `trust_remote_code` | Sin rechazos; port verificado bit a bit frente al fuente |
| LiquidAI/LFM3-1.7B | ~1,73B | 262.144 | LFM Open License v1.0 | Multiples formatos, incluido transformers | Modelo base con comportamiento de rechazo intacto (92/100 rechazos reportados) |
| Vortecks/LFM3-1.7B-Heretic-Abliterated | ~1,73B | 262.144 | LFM Open License v1.0 | Pesos fuente en transformers y GGUF BF16 | Origen de este port; misma abliteration, sin empaquetado MLX |
| Alternativas de ~1-2B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para comparar rendimiento |

La comparacion con modelos de otros fabricantes del mismo rango (por ejemplo, familias de 1-2B con contexto extendido) no puede completarse con datos verificados a partir de la informacion disponible, por lo que se omite cualquier cifra de rendimiento comparativo.

## Limitaciones y advertencias

- Ausencia de rechazos: Vortecks reporta 3/100 rechazos en el conjunto de prompts adversarios de Heretic frente a 92/100 del modelo base. El modelo producira contenido danino, falso u ofensivo si se le solicita; el despliegue exige moderacion propia.
- La abliteration altera el modelo: la divergencia KL de 0,0094 respecto al base es pequena, pero puede degradar algunas capacidades. El port no evaluo tasas de rechazo ni puntuaciones de benchmarks, solo la equivalencia con el modelo fuente.
- JSON estricto puede fallar: en los dos prompts JSON del conjunto de prueba, el modelo fuente falla el parseo estricto en todas las ejecuciones (una vez con claves sin comillas y otra con texto tras el array). El port reproduce ese comportamiento, por lo que la salida estructurada debe validarse siempre.
- Empates en bfloat16: la decodificacion greedy en bfloat16 puede encontrar empates exactos de logits, de modo que implementaciones igualmente validas eligen tokens distintos; las salidas pueden diferir de transformers tras un empate.
- Codigo personalizado: la carga ejecuta `lfm3.py` del repositorio, por lo que es necesario revisar ese fichero antes de confiar en el modelo.
- Licencia: LFM Open License v1.0. Es una licencia "other" con posibles restricciones de uso comercial; debe revisarse el fichero LICENSE antes de cualquier despliegue productivo.
- Idiomas: aunque se declaran 16 idiomas, no se documenta la calidad relativa por idioma ni el tamano del corpus de cada uno; el rendimiento en idiomas de bajos recursos puede ser inferior.
- Contexto largo: la ventana de 262.144 tokens esta declarada, pero no se aportan resultados de benchmarks de recuperacion a esa longitud; conviene validar el caso de uso concreto.
- Sin metricas de velocidad: no hay cifras de latencia ni throughput para inferencia residente, lo que dificulta planificar capacidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mchen04/LFM3-1.7B-Heretic-Abliterated-MLX-bf16
- Modelo fuente (Vortecks): https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Modelo base (Liquid AI): https://huggingface.co/LiquidAI/LFM3-1.7B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper de referencia citado en los tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Informe de evaluacion del port: https://huggingface.co/mchen04/LFM3-1.7B-Heretic-Abliterated-MLX-bf16/blob/main/evidence/REPORT.md
- Tolerancias de la evaluacion: https://huggingface.co/mchen04/LFM3-1.7B-Heretic-Abliterated-MLX-bf16/blob/main/evidence/TOLERANCES.md
- Resultados en JSON: https://huggingface.co/mchen04/LFM3-1.7B-Heretic-Abliterated-MLX-bf16/blob/main/evidence/report.json
- Licencia LFM Open License v1.0: https://huggingface.co/mchen04/LFM3-1.7B-Heretic-Abliterated-MLX-bf16/blob/main/LICENSE
