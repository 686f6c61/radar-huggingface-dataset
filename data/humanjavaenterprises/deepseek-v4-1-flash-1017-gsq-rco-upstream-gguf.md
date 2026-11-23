# HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-GSQ-RCO-upstream-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con 748.494.628.464 parámetros totales. Esta ficha concreta corresponde a un repackaging en formato GGUF realizado por HumanjavaEnterprises sobre la cuantización IQ2_XXS de ISTA-DASLab (denominada GSQ-RCO), cuyo objetivo es hacer que los pesos sean cargables en el llama.cpp upstream estándar, sin necesidad de forks ni motores de terceros como Strata. El resultado son cuatro ficheros GGUF que suman 248 GB en disco, con una tabla Engram de 110,6 GB que se lee de forma perezosa desde el SSD.

La relevancia de esta publicación es práctica: hasta su aparición, la cuantización de ISTA solo era utilizable con el motor Strata, lo que limitaba su adopción. Este repack mantiene los tensores cuantizados byte a byte idénticos a los de ISTA, pero reorganizados en el layout `deepseek41` que entiende llama.cpp. Con un solo GPU de 96 GB más RAM suficiente, el modelo alcanza 66-72 tok/s de decodificación, y con decodificación especulativa DSpark llega a 80-102 tok/s en código.

La licencia es MIT y el modelo está pensado para generación de texto conversacional. No se dispone de información sobre los idiomas soportados en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; layout GGUF `deepseek41` |
| Parametros totales | 748.494.628.464 (748B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuración recomendada (16.384 en configuraciones reducidas); no se especifica el máximo nativo |
| Tipos de cuantizacion | IQ2_XXS (GSQ-RCO de ISTA-DASLab); drafter DSpark en Q8_0 disponible por separado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards: 48,3 GB + 48,9 GB + 41,0 GB + 110,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de 748B parámetros totales. La información proporcionada no detalla el número de expertos, los parámetros activos por token, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La model card menciona 15.360 expertos en el contexto del cálculo de la imatrix para la build obliterada, lo que da una idea de la escala de la capa MoE, pero no se confirma el número de expertos activos por token.

La innovación técnica destacable de esta ficha no está en el modelo en sí, sino en el proceso de conversión: los pesos cuantizados de ISTA se han reempaquetado al layout upstream sin recuantizar, y los 17 metadatos derivados coinciden con la conversión independiente de unsloth. Además, la tabla Engram de 103 GB se expone como un tensor `per_layer_token_embd` que llama.cpp lee de forma perezosa desde disco, lo que permite mantener el modelo residente en aproximadamente 138 GB (VRAM más RAM) en lugar de cargar los 248 GB completos. Se soporta decodificación especulativa mediante el drafter DSpark de unsloth.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con llama.cpp.
- Razonamiento y matemáticas: la model card reporta 97,2% en GSM8K (250 preguntas) y 84,4% en MMLU (500 preguntas) para esta cuantización.
- Generación de código: el modo de decodificación especulativa DSpark está optimizado para código, con 80-102 tok/s medidos.
- Modo thinking activable o desactivable mediante `--chat-template-kwargs '{"enable_thinking":false}'`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Cuantización de 2 bits que preserva las capacidades matemáticas del modelo completo y cede aproximadamente 2,5 puntos de MMLU frente a la versión full precision.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión o audio en la documentación proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 32.768 tokens de ventana en la configuración recomendada, el modelo puede mantener conversaciones multi-turno con historial extenso, adecuado para atención al cliente o asistentes internos que necesitan recordar el hilo completo de la sesión.
- Generación de código en producción: la decodificación especulativa DSpark eleva el throughput a 80-102 tok/s en código, lo que lo hace viable para autocompletado o generación de parches en pipelines de CI/CD donde la latencia importa.
- Razonamiento matemático y resolución de problemas: el 97,2% en GSM8K indica que la cuantización de 2 bits no degrada la capacidad aritmética, por lo que sirve para tutores matemáticos o verificación de cálculos en herramientas internas.
- Evaluación y benchmarking de modelos: al ser un repack verificado byte a byte contra ISTA y con metadatos coincidentes con unsloth, es útil como referencia reproducible en estudios comparativos de cuantizaciones de 2 bits.
- Despliegue en hardware de gama alta con un solo GPU: con una RTX PRO 6000 Blackwell de 96 GB y 130 GB de RAM libre, se obtiene un servidor de inferencia local sin depender de APIs externas, útil para entornos con requisitos de privacidad.
- Investigación sobre decodificación especulativa: el par modelo + drafter DSpark permite medir tasas de aceptación (78-84% reportado) y comparar estrategias de drafting en un MoE de gran escala.
- Prototipado de aplicaciones con restricciones de licencia: la licencia MIT facilita su integración en productos comerciales sin las restricciones de otros modelos.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando esta cuantización con unsloth UD-IQ1_M y con la API de DeepSeek (full precision):

| Metrica | ISTA GSQ-RCO (esta) | unsloth UD-IQ1_M | DeepSeek API (full precision) |
|---|---|---|---|
| wikitext-2 PPL | 3,507 ± 0,040 | 3,333 ± 0,037 | no disponible |
| GSM8K (250) | 97,2% | 96,4% | 96,8% |
| MMLU (500) | 84,4% | 84,6% | 87,0% |
| Decode tok/s | 31,9 | 24,3 | no disponible |

Datos de rendimiento medidos el 2026-11-03 en una RTX PRO 6000 Blackwell Max-Q (96 GB) con Xeon w5-3525 (16 núcleos) y 256 GB de RAM:

| Configuracion | Decode tok/s |
|---|---|
| 96 GB GPU + RAM, cache MoE de 80 GB | 66-72 |
| Split por capas (configuración antigua) | 32-38 |
| Sin cache MoE | ~18 |
| Con DSpark (código) | 80-102 |
| Con DSpark (prosa) | 68-74 |

La build obliterada hermana reporta 97,2% en GSM8K y 83,6% en MMLU, con rechazos reducidos de 19/20 a 7/20.

## Requisitos de hardware

- VRAM estimada: aproximadamente 138 GB residentes en total (VRAM más RAM). La tabla Engram de 110,6 GB permanece en SSD y se lee de forma perezosa.
- GPU recomendada: una RTX PRO 6000 Blackwell Max-Q de 96 GB permite la configuración de 66-72 tok/s con cache MoE de 80 GB. Con GPUs más pequeñas se reduce `--moe-cache-mib` o se elimina, bajando a unos 18 tok/s.
- No cabe en GPUs de consumo convencionales (RTX 4090, 3090) en su configuración completa; requiere al menos 96 GB de VRAM más RAM abundante para el rendimiento óptimo.
- RAM: aproximadamente 130 GB libres para la configuración de referencia con todos los expertos en RAM.
- Despliegue: llama.cpp upstream desde 2026-11-03 o posterior (se cita `ca8daad1`; `de5122d8` funciona más lento). Parámetros clave: `-ngl 99`, `-ot '_exps=CPU'`, `--moe-cache-mib`, `-ub 2048`, `-fa on`.
- Decodificación especulativa: drafter DSpark de unsloth (MIT, 8 GB) en la misma tarjeta, con `--spec-type draft-dspark`, `-ngld 99`, `--spec-draft-n-max 2`.
- Throughput: 66-72 tok/s en decodificación con cache MoE; 80-102 tok/s en código con DSpark; `-ub 2048` acelera el procesamiento de prompt entre 2,5 y 3,2 veces a cambio de unos 0,5 GB más de VRAM.
- Hilos: usar tantos como núcleos físicos; el decode está limitado por ancho de banda de memoria y los hyperthreads no ayudan en esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MMLU | Licencia | Formato |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash GSQ-RCO (esta) | 748B | 32.768 (config. recomendada) | 97,2% | 84,4% | MIT | GGUF IQ2_XXS |
| unsloth UD-IQ1_M (DeepSeek-V4.1-Flash) | 748B | no disponible | 96,4% | 84,6% | no disponible | GGUF IQ1_M |
| DeepSeek-V4.1-Flash (full precision, API) | 748B | no disponible | 96,8% | 87,0% | no disponible | API |
| DeepSeek-V4.1-Flash obliterated (HumanjavaEnterprises) | 748B | no disponible | 97,2% | 83,6% | MIT | GGUF |

La comparativa se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye alternativas de otros desarrolladores. Frente a unsloth UD-IQ1_M, esta cuantización ofrece una precisión de tarea equivalente y un 31% más de velocidad de decodificación, a costa de una perplejidad ligeramente superior en wikitext-2.

## Limitaciones y advertencias

- La cuantización de 2 bits cede aproximadamente 2,5 puntos de MMLU frente a la versión full precision de DeepSeek; la recuperación de conocimiento factual es inferior.
- La perplejidad en wikitext-2 (3,507) es peor que la de unsloth UD-IQ1_M (3,333), lo que sugiere una menor fluidez en texto general.
- La decodificación especulativa a temperatura 0 no es bit-idéntica a la decodificación normal (issue #31472 de llama.cpp); para evaluaciones conviene desactivarla.
- La salida especulativa con DSpark puede diferir de la decodificación estándar, lo que afecta a la reproducibilidad de resultados.
- Requiere llama.cpp desde 2026-11-03 o posterior; versiones anteriores no cargan el modelo o lo hacen más lento.
- El rendimiento depende críticamente de la RAM disponible: sin cache MoE el throughput cae a unos 18 tok/s.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos en la documentación proporcionada.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 y del drafter DSpark de unsloth antes de desplegar en producción.
- La build obliterada hermana reduce los rechazos pero no los elimina (7 de 20 frente a 19 de 20), por lo que no debe tratarse como un modelo sin filtros.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-GSQ-RCO-upstream-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización original de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Repositorio de conversión y documentación: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream
- Evaluaciones detalladas: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream/blob/main/EVALS.md
- Receta de la build obliterada: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream/blob/main/build/README.md
- Build obliterada: https://huggingface.co/HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-obliterated-upstream-GGUF
- Modelo obliterado original: https://huggingface.co/OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Issue de prompt-cache: https://github.com/ggml-org/llama.cpp/issues/30944
- Issue de decodificación especulativa: https://github.com/ggml-org/llama.cpp/issues/31472
- Drafter DSpark de unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
