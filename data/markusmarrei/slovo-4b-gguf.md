# MarkusMarrei/slovo-4b-GGUF

## Resumen

Slovo-4B es un modelo de lenguaje de 4.022 millones de parámetros (4B) especializado en 46 lenguas indígenas, regionales y minoritarias de la Federación Rusa (Cáucaso, Siberia, Volga-Ural y Extremo Oriente), además de ruso e inglés como idiomas ancla. Lo desarrolla el autor independiente MarkusMarrei y se distribuye bajo licencia Apache 2.0. El repositorio que nos ocupa, `slovo-4b-GGUF`, contiene las cuantizaciones oficiales en formato GGUF del modelo base `MarkusMarrei/slovo-4b`, pensadas para inferencia local en CPU, GPU integradas y equipos de consumo.

La relevancia del modelo reside en su enfoque: la mayoría de los LLM multilingües cubren bien decenas de idiomas mayoritarios pero degradan rápidamente en lenguas de bajos recursos. Slovo-4B declara soporte explícito para lenguas como tártaro (tt), bashkir (ba), chuvasio (cv), yakuto/sajá (sah), checheno (ce), ingusetio (inh), avar (av), lezgiano (lez), darguin (dar), lak (lbe), tabasaran (tab), cumuco (kum), karachái-bálkaro (krc), nogayo (nog), cabardino (kbd), adigué (ady), abaza (abq), osetio (os), tuvano (tyv), buryato (bxr), calmuco (xal), altái (alt), jakasio (kjh), mari (chm), mordvino-erzya (myv) y moksha (mdf), udmurto (udm), komi (kpv, koi), carelio (krl), vepsio (vep), nenets (yrk), evenki (eve), even (evn), nanai (gld), chukchi (ckl), korako (kpy) e itelmen (itl).

El nombre de los ficheros (`slovo-qwen3-4b-v3-...`) sugiere que el modelo base deriva de la familia Qwen3-4B, aunque la model card no detalla explícitamente la arquitectura interna ni el proceso de entrenamiento. Esta ficha se limita a los datos publicados en el repositorio y en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la model card no detalla la arquitectura interna; los nombres de fichero apuntan a una base Qwen3-4B) |
| Parámetros totales | 4.022.468.096 (4B) |
| Parámetros activos | no disponible (no es MoE según los datos publicados) |
| Longitud de contexto | hasta 4096 tokens (recomendado en la model card) |
| Tipos de cuantización | Q4_K_M (2,33 GB) y Q8_0 (3,99 GB) |
| Idiomas soportados | 46 idiomas: ru, tt, ba, cv, sah, ce, inh, av, lez, dar, lbe, tab, kum, krc, nog, kbd, ady, abq, os, tyv, bxr, xal, alt, kjh, chm, myv, mdf, udm, kpv, koi, krl, vep, yrk, eve, evn, gld, ckl, kpy, itl, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (v3); modelo base original en safetensors FP16 |
| Tamaño del repositorio | 6,9 GB |
| Plantilla de prompt | ChatML (`<|im_start|>role\ncontenido<|im_end|>`) |
| Temperatura recomendada | 0,2 – 0,5 |
| Top-P recomendado | 0,85 – 0,92 |
| Repetition penalty recomendado | 1,10 – 1,15 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base `MarkusMarrei/slovo-4b` más allá de su tamaño (4B parámetros). Los nombres de los ficheros GGUF (`slovo-qwen3-4b-v3-q4_k_m.gguf`, `slovo-qwen3-4b-v3-q8_0.gguf`) apuntan a una base de la familia Qwen3-4B, pero este dato no se confirma explícitamente en el texto publicado. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado.

Lo que sí se indica es que las cuantizaciones se generaron directamente desde los pesos consolidados en FP16 usando las herramientas de `llama.cpp`, y que el modelo se ha ajustado para conversación multilingüe con plantilla ChatML. La recomendación de temperaturas bajas (0,2–0,5) y penalizaciones de repetición altas (1,10–1,15) sugiere que el autor ha observado problemas de morfología en lenguas aglutinantes (sufijos repetidos, concordancia estricta), un detalle técnico relevante para el despliegue.

## Capacidades

- Generación de texto conversacional multilingüe en 46 idiomas, con especial énfasis en lenguas minoritarias de Rusia.
- Traducción entre ruso, inglés y las lenguas indígenas cubiertas (traducción directa e inversa).
- Producción de texto en lenguas aglutinantes con control de morfología mediante parámetros de muestreo ajustados.
- Soporte de conversación multi-turno mediante plantilla ChatML.
- Capacidad declarada de generar ejemplos culturales (refranes, saludos, textos breves) en las lenguas cubiertas, según los ejemplos de la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades de código y matemáticas: no documentadas específicamente; el modelo está orientado a texto multilingüe, no a tareas de programación.

## Casos de uso

- Traducción de documentación administrativa y sanitaria a lenguas minoritarias: el modelo puede traducir textos breves del ruso a tártaro, chuvasio, yakuto o buryato, útil para organismos públicos que deben publicar material en lenguas regionales. La ventana de 4096 tokens limita el uso a documentos cortos o fragmentados.
- Preservación lingüística y digitalización: generación de ejemplos de frase, paradigmas y textos breves en lenguas con pocos recursos digitales, como material de apoyo para lingüistas y proyectos de documentación.
- Asistentes conversacionales locales para comunidades: despliegue en un portátil con GPU integrada (Radeon 780M, Intel Iris Xe) usando la cuantización Q4_K_M (2,33 GB), sin depender de servicios en la nube, lo que facilita el acceso en regiones con conectividad limitada.
- Educación bilingüe: generación de ejercicios, saludos, refranes y explicaciones sencillas en lengua indígena con traducción al ruso, para aulas con hablantes de esas lenguas.
- Investigación en NLP de bajos recursos: evaluación de la calidad morfológica y de traducción en 46 lenguas, usando la cuantización Q8_0 (3,99 GB) como referencia casi sin pérdida frente al FP16.
- Prototipado de aplicaciones de chat locales: integración vía `llama-server` con API compatible con OpenAI, o vía `llama-cpp-python`, para construir demos de asistentes multilingües sin infraestructura GPU dedicada.
- Análisis de textos etnográficos y folclóricos: resumen y reformulación de relatos cortos en lenguas como evenki, nanai o chukchi, siempre con revisión humana dada la escasez de datos de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta velocidades de inferencia medidas en un AMD Ryzen 7 con gráficos integrados Radeon 780M y offload a CPU:

| Cuantización | Tamaño | RAM/VRAM recomendada | Velocidad (tokens/s) |
|---|---|---|---|
| Q4_K_M | 2,33 GB | ~2,8 GB libres | 18–19 |
| Q8_0 | 3,99 GB | ~4,5 GB libres | 14–16 |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas en las lenguas cubiertas.

## Requisitos de hardware

- VRAM/RAM estimada: ~2,8 GB libres para Q4_K_M y ~4,5 GB libres para Q8_0 (cifras del autor, medidas con offload a CPU).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; también en GPU integradas modernas (Radeon 780M, Intel Iris Xe) y en CPU con al menos 8 GB de RAM.
- GPU dedicadas recomendadas: no se especifican; para Q8_0 con todas las capas en GPU basta una RTX 3060 de 6 GB o superior; una RTX 4090, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Opciones de despliegue: `llama.cpp` (CLI y servidor compatible con OpenAI), Ollama (mediante Modelfile), LM Studio, Jan y `llama-cpp-python`.
- Latencia y throughput: 18–19 tokens/s en Q4_K_M y 14–16 tokens/s en Q8_0 sobre Ryzen 7 con Radeon 780M; no se publican cifras para GPU dedicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Slovo-4B (GGUF) | 4B | 4096 | 46 (lenguas de Rusia + ru/en) | Apache 2.0 | GGUF |
| Qwen3-4B (base probable) | 4B | no disponible en esta ficha | multilingüe general | Apache 2.0 | safetensors, GGUF |
| Modelos multilingües de propósito general de 3–7B (p. ej. familia Llama, Mistral) | 3–7B | variable | decenas de idiomas mayoritarios | licencias variables | safetensors, GGUF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Slovo-4B frente a alternativas en las lenguas cubiertas. La comparación se limita a parámetros, contexto, licencia y formato. No se conocen otros modelos abiertos con cobertura declarada de 46 lenguas minoritarias de Rusia en el rango de 4B.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad en las 46 lenguas no está validada de forma independiente; el soporte declarado no garantiza fluidez o corrección gramatical en todas ellas.
- Riesgo de alucinación alto en lenguas de bajos recursos: es probable que el modelo genere formas morfológicamente plausibles pero incorrectas, especialmente en lenguas con pocos datos como itelmen, korako o chukchi.
- Contexto limitado a 4096 tokens: insuficiente para documentos largos, conversaciones extensas o tareas de resumen de corpus.
- Sesgos: no documentados por el autor; al entrenarse presumiblemente con datos en ruso y lenguas de la Federación Rusa, puede reflejar sesgos culturales y políticos de esas fuentes.
- Idiomas fuera de la lista: el rendimiento en idiomas no cubiertos (por ejemplo, español, francés o alemán) no está documentado y probablemente sea deficiente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la procedencia de los datos de entrenamiento ni sobre derechos de terceros en los corpus utilizados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni comunidad de validación.
- La model card no documenta la arquitectura interna ni el proceso de entrenamiento, lo que dificulta evaluar riesgos de seguridad y calidad.
- Ajustes de muestreo necesarios: temperaturas bajas y penalización de repetición alta para evitar bucles de sufijos en lenguas aglutinantes; sin estos ajustes la calidad puede degradarse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/MarkusMarrei/slovo-4b-GGUF
- Modelo base: https://huggingface.co/MarkusMarrei/slovo-4b
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Jan: https://jan.ai
