# ArtomYuan/Ornith-1.5-35B-A3B-abliterated-ROCmFPX

## Resumen

Ornith-1.5-35B-A3B-abliterated-ROCmFPX es una cuantizacion GGUF del modelo huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, publicada por el usuario ArtomYuan. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token (variante A3B), distribuidos en 256 expertos con 8 activos por token, 40 capas transformer y una capa MTP (multi-token prediction) adicional. El modelo base original, ornith-ai/Ornith-1.5-35B-A3B, esta publicado bajo licencia MIT, mientras que el proceso de abliteration lo firma huihui-ai y el empaquetado de esta cuantizacion es Apache-2.0.

La particularidad de este repositorio no es el modelo en si, sino el formato de cuantizacion y el motor de inferencia. Los pesos se distribuyen en siete niveles de cuantizacion propietarios (Q4_0_ROCMFP4 en variantes FAST, FAST_COHERENT y STRIX; Q6_0_ROCMFPX en variantes base y AGENT; Q8_0_ROCMFPX en variantes base y AGENT) que requieren strix.cpp, un fork de llama.cpp especificamente optimizado para la arquitectura UMA del AMD Strix Halo gfx1151 (Ryzen AI MAX+ 395) con backend ROCm/HIP. El llama.cpp upstream no puede cargar estos ficheros.

El interes practico es doble: por un lado, ofrece una via para ejecutar un MoE de 35B con contexto de hasta 256K en una maquina de 128 GB de memoria unificada sin GPU dedicada; por otro, documenta ganancias de rendimiento medibles frente a llama.cpp-rocm en prefill (hasta +78,1% en pp256 y +64,8% en pp2048) gracias al tuning especifico para gfx1151. El repositorio incluye ademas un mmproj BF16 para capacidades de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con 256 expertos (8 activos por token), 40 capas transformer + 1 capa MTP |
| Parametros totales | 35.505.251.456 (35,51B) |
| Parametros activos | ~3B (variante A3B) |
| Longitud de contexto | hasta 256K |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (FAST, FAST_COHERENT, STRIX), Q6_0_ROCMFPX (base, AGENT), Q8_0_ROCMFPX (base, AGENT); mmproj BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (empaquetado); modelo base ornith-ai/Ornith-1.5-35B-A3B bajo MIT |
| Formato de pesos | GGUF (formato ROCmFPX propietario, requiere strix.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 256 expertos con 8 activos por token sobre 40 capas, mas una capa MTP (multi-token prediction) integrada que puede activarse con `strix-server --spec-type draft-mtp` para decodificacion especulativa. El modelo base declara aproximadamente 3B de parametros activos sobre 35,51B totales, lo que situa el coste computacional por token en el orden de un modelo denso de 3B mientras conserva la capacidad representacional de un 35B.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La variante "abliterated" procede de huihui-ai, que aplica tecnicas de abliteration (ablacion de direcciones de rechazo en el espacio de activaciones) sobre los pesos BF16 originales; el autor de esta cuantizacion parte de esos pesos ya modificados. La innovacion tecnica destacable de este repositorio es el formato ROCmFPX y el motor strix.cpp: un fork de llama.cpp con kernels y planificacion de memoria ajustados a la arquitectura UMA de gfx1151, con soporte nativo de FP4 de doble escala en atencion para el tier STRIX y estrategias de "hardening" que elevan a 8 bits las capas sensibles (primeras y ultimas fracciones de atencion, ffn_down, gate/up y vocabulario) en los tiers AGENT.

## Capacidades

- Generacion de texto conversacional multi-turno, con contexto de hasta 256K tokens.
- Razonamiento y seguimiento de instrucciones, con tiers AGENT especificamente endurecidos para uso agentico.
- Capacidades de vision mediante el mmproj incluido (torre CLIP + qwen3vl_merger), que se carga con `--mmproj`.
- Decodificacion especulativa mediante la cabeza MTP integrada (desactivada por defecto, se activa con `--spec-type draft-mtp`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite exponerlo mediante API compatible con OpenAI a traves de strix-server.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado explicitamente en la model card; el uso agentico se sugiere a traves de los tiers AGENT, pero sin detalle de protocolo.

## Casos de uso

- Inferencia local en estaciones Strix Halo: el caso de uso central del repositorio. Un Ryzen AI MAX+ 395 con 128 GB de memoria unificada puede cargar cualquiera de los siete tiers (el mayor ocupa 34,74 GiB) y servir el modelo con contexto largo sin GPU dedicada, usando `strix-server -ngl 99 -fa on`.
- Asistente conversacional de contexto largo: con hasta 256K tokens de ventana, el modelo puede mantener hilos de conversacion con documentacion extensa, historiales de incidencias o codebases completos en contexto, algo inviable en modelos densos de 35B en hardware consumer.
- Procesamiento de documentos con vision: cargando el mmproj BF16, el modelo puede abordar tareas de comprension de imagenes y documentos escaneados combinadas con texto, adecuado para pipelines de extraccion de informacion en local.
- Agentes autonomos y flujos multi-paso: los tiers Q6_0_ROCMFPX_AGENT y Q8_0_ROCMFPX_AGENT aplican cuantizacion de 8 bits en capas sensibles (atencion, ffn_down, gate/up, vocabulario) para preservar la fidelidad en el seguimiento de instrucciones y el encadenamiento de pasos, que es donde la cuantizacion agresiva suele degradar mas el comportamiento.
- Generacion de codigo asistida en local: el modelo puede integrarse en un servidor compatible con endpoints y consumirse desde editores o pipelines de CI/CD sin enviar codigo a servicios externos, con la ventaja de privacidad que implica.
- Investigacion sobre cuantizacion y hardware: el repositorio publica tablas comparativas de llama-bench entre llama.cpp-rocm y strix.cpp por tier, lo que lo convierte en una referencia util para estudiar el impacto de formatos FP4/FPX y del tuning por arquitectura en prefill y decodificacion.
- Despliegue de bajo coste energetico: al ejecutarse sobre memoria unificada y no requerir GPU dedicada, es adecuado para entornos donde el consumo y el coste de hardware son restrictivos, aceptando el trade-off de throughput frente a soluciones con A100/H100.

## Benchmarks y rendimiento

Los unicos datos publicados son de llama-bench sobre AMD Strix Halo (gfx1151), comparando llama.cpp-rocm (build 11107) con strix.cpp (build f879d83c), con `-p 256,2048 -n 256 -r 5 -fa 1 -ngl 999 -ub 512`. No hay resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

Prefill pp256 (t/s):

| Tier | llama.cpp-rocm | strix.cpp | Cambio |
|---|---:|---:|---:|
| Q4_0_ROCMFP4_FAST | 1434,40 | 2225,89 | +55,2% |
| Q4_0_ROCMFP4_FAST_COHERENT | 1238,90 | 2206,97 | +78,1% |
| Q4_0_ROCMFP4_STRIX | 1409,90 | 2108,73 | +49,6% |
| Q6_0_ROCMFPX | 803,50 | 932,89 | +16,1% |
| Q6_0_ROCMFPX_AGENT | 946,30 | 977,57 | +3,3% |
| Q8_0_ROCMFPX | 1144,40 | 1088,21 | -4,9% |
| Q8_0_ROCMFPX_AGENT | 1109,30 | 1185,12 | +6,8% |

Prefill pp2048 (t/s):

| Tier | llama.cpp-rocm | strix.cpp | Cambio |
|---|---:|---:|---:|
| Q4_0_ROCMFP4_FAST | 1547,40 | 2534,23 | +63,8% |
| Q4_0_ROCMFP4_FAST_COHERENT | 1539,40 | 2536,88 | +64,8% |
| Q4_0_ROCMFP4_STRIX | 1526,60 | 2406,88 | +57,7% |
| Q6_0_ROCMFPX | 943,90 | 1203,38 | +27,5% |
| Q6_0_ROCMFPX_AGENT | 1102,30 | 1345,16 | +22,0% |
| Q8_0_ROCMFPX | 1367,70 | 1553,00 | +13,5% |
| Q8_0_ROCMFPX_AGENT | 1372,10 | 1549,89 | +13,0% |

Generacion tg256 (t/s):

| Tier | llama.cpp-rocm | strix.cpp | Cambio |
|---|---:|---:|---:|
| Q4_0_ROCMFP4_FAST | 72,70 | 74,53 | +2,5% |
| Q4_0_ROCMFP4_FAST_COHERENT | 72,60 | 74,61 | +2,8% |
| Q4_0_ROCMFP4_STRIX | 71,90 | 74,16 | +3,1% |
| Q6_0_ROCMFPX | 55,20 | 55,97 | +1,4% |
| Q6_0_ROCMFPX_AGENT | 51,50 | 52,30 | +1,6% |
| Q8_0_ROCMFPX | 48,20 | 48,51 | +0,6% |
| Q8_0_ROCMFPX_AGENT | 47,90 | 48,45 | +1,1% |

La tabla de MTP de la model card aparece truncada en la informacion disponible (solo se conserva la fila Q4_0_ROCMFP4_FAST sin valores), por lo que no se pueden reproducir las cifras de aceptacion de la decodificacion especulativa.

## Requisitos de hardware

- VRAM/memoria estimada: los ficheros van de 17,65 GiB (Q4_0_ROCMFP4_FAST) a 34,74 GiB (Q8_0_ROCMFPX_AGENT), mas 0,84 GiB del mmproj si se usa vision. Todos los tiers caben en una maquina de 128 GB de memoria unificada, segun el autor.
- GPU recomendadas: el repositorio esta especificamente tuneado para AMD Strix Halo gfx1151 (Ryzen AI MAX+ 395) con backend ROCm/HIP. No se documenta soporte para A100, H100 ni RTX 4090; de hecho, el formato ROCmFPX no es cargable por llama.cpp upstream.
- GPU consumer: si cabe en hardware consumer en el sentido de un SoC con memoria unificada (Strix Halo), no en GPUs discretas de consumo, ya que el motor y los kernels estan orientados a gfx1151.
- Opciones de despliegue: exclusivamente strix.cpp (fork de llama.cpp de ArtomYuan), con `strix-server`; se puede activar vision con `--mmproj` y decodificacion especulativa con `--spec-type draft-mtp`. vLLM, TGI, Ollama y llama.cpp upstream no estan soportados para estos ficheros.
- Latencia y throughput: medidos en gfx1151, con prefill de 2225,89 t/s (pp256) y 2534,23 t/s (pp2048) en el tier FAST, y generacion de 74,53 t/s (tg256) en el mismo tier; el tier Q8_0_ROCMFPX_AGENT baja a 1185,12 t/s de prefill pp256 y 48,45 t/s de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-abliterated-ROCmFPX (este) | 35,51B | ~3B | 256K | Apache-2.0 (empaquetado), MIT (base) | GGUF ROCmFPX / strix.cpp | Hugging Face, 3274 descargas |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35,51B | ~3B | no disponible | no disponible | BF16 safetensors | Hugging Face (modelo base de esta cuantizacion) |
| ornith-ai/Ornith-1.5-35B-A3B | 35,51B | ~3B | no disponible | MIT | safetensors | Hugging Face (modelo original) |
| llama.cpp upstream con GGUF estandar | no aplica | no aplica | no aplica | MIT | GGUF estandar | No puede cargar los ficheros ROCmFPX de este repositorio |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento cognitivo de este modelo frente a alternativas de la misma categoria; la comparativa disponible es de motor y formato, no de capacidad.

## Limitaciones y advertencias

- Dependencia estricta de strix.cpp: llama.cpp upstream no puede cargar los ficheros ROCmFPX. Esto rompe la portabilidad habitual de GGUF y ata el despliegue a un fork mantenido por un unico autor.
- Hardware muy especifico: el tuning esta hecho para gfx1151 (Ryzen AI MAX+ 395). En otras GPU ROCm o en CUDA el rendimiento no esta caracterizado y podria ser inferior o no funcionar.
- Modelo abliterated: la ablacion de direcciones de rechazo elimina total o parcialmente los comportamientos de negativa del modelo alineado. Esto incrementa el riesgo de generar contenido danino, sesgado o inapropiado sin filtros, y hace desaconsejable su uso directo en produccion orientada al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de calibracion para este modelo ni para su base; el uso en tareas de recuperacion o respuesta factual requiere verificacion.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue, por lo que el rendimiento fuera del ingles (y posiblemente del chino, dado el linaje qwen3vl en la torre de vision) es incierto.
- Cuantizacion agresiva en tiers bajos: el tier FAST (4,27 BPW) no aplica hardening alguno y puede degradar el seguimiento de instrucciones; para uso agentico el autor recomienda explicitamente los tiers AGENT.
- Licencia: el empaquetado es Apache-2.0 y el modelo base es MIT, lo que en principio permite uso comercial, pero la cadena de derivacion (abliteration de huihui-ai sobre el modelo de ornith-ai) conviene verificarla antes de un despliegue comercial.
- Contexto de 256K: no se documenta el comportamiento de la calidad a longitudes cercanas al maximo, ni el consumo de memoria del KV cache con `-fa on`, que puede ser significativo en un modelo de 40 capas.
- Repositorio de 251,2 GB con siete tiers duplicados: requiere planificacion de almacenamiento y descarga selectiva del fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArtomYuan/Ornith-1.5-35B-A3B-abliterated-ROCmFPX
- Modelo base de la cuantizacion: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Motor de inferencia strix.cpp: https://github.com/ArtomYuan/strix.cpp
