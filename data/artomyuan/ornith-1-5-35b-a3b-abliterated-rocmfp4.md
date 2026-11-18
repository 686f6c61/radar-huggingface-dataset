# ArtomYuan/Ornith-1.5-35B-A3B-abliterated-ROCmFP4

## Resumen

Ornith-1.5-35B-A3B-abliterated-ROCmFP4 es una cuantización GGUF del modelo huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, publicada por el usuario ArtomYuan. Se trata de un modelo de arquitectura MoE (mixture of experts) con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (denominación A3B), compuesto por 256 expertos con 8 activos por token, 40 capas transformer más una capa MTP (multi-token prediction). El modelo base deriva de ornith-ai/Ornith-1.5-35B-A3B, con licencia MIT, y ha sido sometido a un proceso de abliteration (eliminación de direcciones de rechazo) por parte de huihui-ai.

La particularidad de esta publicación no es el modelo en sí, sino el formato de cuantización y el motor de inferencia. ArtomYuan distribuye siete niveles de cuantización en un formato propietario denominado ROCmFPX/ROCmFP4, que solo puede cargarse con strix.cpp, un fork de llama.cpp específicamente optimizado para la arquitectura UMA del AMD Strix Halo (gfx1151, Ryzen AI MAX+ 395) con backend ROCm/HIP. El llama.cpp upstream no puede cargar estos ficheros ni incorpora los ajustes para gfx1151.

El interés actual del modelo reside en su ventana de contexto de hasta 256K tokens, su soporte de visión mediante un mmproj empaquetado (torre CLIP + qwen3vl_merger) y su cabeza MTP integrada para decodificación especulativa. Todo el conjunto de cuantizaciones cabe en una única máquina con 128 GB de memoria unificada, lo que lo convierte en una opción para despliegue local de gran contexto sobre hardware AMD consumer de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer, 40 capas + 1 capa MTP, 256 expertos (8 activos por token) |
| Parametros totales | 35.505.251.456 (35,51B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | hasta 256K tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (FAST, FAST_COHERENT, STRIX), Q6_0_ROCMFPX (base, AGENT), Q8_0_ROCMFPX (base, AGENT); mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 para el empaquetado; modelo base ornith-ai/Ornith-1.5-35B-A3B bajo MIT (se retiene aviso de copyright y texto de licencia) |
| Formato de pesos | GGUF (formato ROCmFPX/ROCmFP4, requiere strix.cpp); mmproj GGUF BF16 |
| Tamano del repo | 251,2 GB |
| Motor de inferencia | strix.cpp (fork de llama.cpp para gfx1151 / ROCm) |
| Descargas | 3.274 |
| Likes | 2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 40 capas más una capa adicional de multi-token prediction. Cada token activa 8 de los 256 expertos disponibles, lo que da un ratio de activación de aproximadamente el 8,5 % de los parámetros totales (unos 3B activos sobre 35,51B). Esta configuración busca el equilibrio típico de los MoE: capacidad de representación de un modelo grande con coste computacional de inferencia próximo al de un modelo de 3B. La inclusión de una cabeza MTP permite decodificación especulativa nativa, activable con `strix-server --spec-type draft-mtp` (desactivada por defecto).

No se dispone en la información proporcionada de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original ornith-ai/Ornith-1.5-35B-A3B. Lo que sí está documentado es el postprocesado: huihui-ai aplicó abliteration sobre los pesos BF16, y ArtomYuan realizó la cuantización localmente. Los registros de cuantización detallan el endurecimiento por nivel: el nivel FAST es una línea base sin protección; FAST_COHERENT eleva el vocabulario a Q6_K; STRIX añade atención K/V en FP4 de doble escala; Q6_0_ROCMFPX protege el primer 1/16 de atención y el primer 1/16 más el último 1/8 de ffn_down a 8 bits; los niveles AGENT extienden la protección a capas sensibles de atención, ffn_down, gate/up y vocabulario/salida.

La innovación técnica destacable es el propio formato ROCmFPX, diseñado para explotar la memoria unificada de Strix Halo y el backend HIP de ROCm, con soporte nativo en strix.cpp y una torre de visión empaquetada (CLIP + qwen3vl_merger) en un mmproj BF16 de 0,84 GiB.

## Capacidades

- Generación de texto conversacional multi-turno, con contexto de hasta 256K tokens.
- Razonamiento y matemáticas: no hay benchmarks publicados que cuantifiquen el rendimiento, pero la arquitectura MoE de 35,51B con 3B activos está diseñada para tareas de razonamiento de nivel medio-alto.
- Generación de código: capacidad esperable por el tamaño del modelo, aunque no verificada con HumanEval ni métricas equivalentes en la información disponible.
- Visión: soporte de entrada de imágenes mediante el mmproj empaquetado (torre CLIP + qwen3vl_merger), que debe cargarse con `--mmproj`.
- Decodificación especulativa mediante cabeza MTP integrada, activable con `--spec-type draft-mtp`.
- Conversacional: la etiqueta `conversational` y `endpoints_compatible` indican compatibilidad con APIs de tipo endpoint.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes multi-paso: los niveles AGENT (Q6_0_ROCMFPX_AGENT y Q8_0_ROCMFPX_AGENT) están específicamente endurecidos para instrucciones y uso agéntico, según la guía del autor.
- Capacidades multilingües: no disponibles.
- Modo thinking: no documentado.

## Casos de uso

- Despliegue local de asistente conversacional de contexto largo: con 256K tokens de ventana, el modelo puede mantener hilos de conversación extensos o procesar documentos completos en una sola pasada, sobre una única máquina Strix Halo con 128 GB de memoria unificada.
- Procesamiento de documentos con imágenes: la combinación del modelo con el mmproj BF16 permite extraer información de capturas, diagramas o páginas escaneadas junto con el texto, útil para digitalización de archivística o revisión de contratos con anexos gráficos.
- Agentes autónomos sobre hardware local: los niveles AGENT están endurecidos en capas sensibles de atención y ffn_down para mejorar el seguimiento de instrucciones, lo que los hace adecuados para pipelines de agentes con llamadas encadenadas y uso de herramientas.
- Generación asistida de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local sin llamadas a API externas, encaja en equipos que no pueden enviar código a servicios en la nube; el nivel Q6_0_ROCMFPX ofrece el mejor equilibrio calidad/velocidad según el autor.
- Investigación sobre abliteration y alineación: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin direcciones de rechazo, comparando respuestas frente al modelo original con licencia MIT.
- Prototipado rápido con throughput alto en gfx1151: el nivel Q4_0_ROCMFP4_FAST alcanza 2.534 t/s en prefill de 2.048 tokens con strix.cpp, lo que permite iterar sobre prompts largos con latencia de prefill baja en una estación de trabajo AMD.
- Evaluación de formatos de cuantización: los siete niveles con distintos esquemas de endurecimiento permiten medir el impacto de la precisión en atención, ffn_down y vocabulario sobre la coherencia y el seguimiento de instrucciones.

## Benchmarks y rendimiento

Los únicos datos publicados son de `llama-bench` sobre AMD Strix Halo (gfx1151), comparando llama.cpp-rocm (build 11107) con strix.cpp (build f879d83c), con `-p 256,2048 -n 256 -r 5 -fa 1 -ngl 999 -ub 512`.

**pp256 (t/s)**

| Nivel | llama.cpp-rocm | strix.cpp | Cambio |
|:--|--:|--:|--:|
| Q4_0_ROCMFP4_FAST | 1434,40 | 2225,89 | +55,2% |
| Q4_0_ROCMFP4_FAST_COHERENT | 1238,90 | 2206,97 | +78,1% |
| Q4_0_ROCMFP4_STRIX | 1409,90 | 2108,73 | +49,6% |
| Q6_0_ROCMFPX | 803,50 | 932,89 | +16,1% |
| Q6_0_ROCMFPX_AGENT | 946,30 | 977,57 | +3,3% |
| Q8_0_ROCMFPX | 1144,40 | 1088,21 | -4,9% |
| Q8_0_ROCMFPX_AGENT | 1109,30 | 1185,12 | +6,8% |

**pp2048 (t/s)**

| Nivel | llama.cpp-rocm | strix.cpp | Cambio |
|:--|--:|--:|--:|
| Q4_0_ROCMFP4_FAST | 1547,40 | 2534,23 | +63,8% |
| Q4_0_ROCMFP4_FAST_COHERENT | 1539,40 | 2536,88 | +64,8% |
| Q4_0_ROCMFP4_STRIX | 1526,60 | 2406,88 | +57,7% |
| Q6_0_ROCMFPX | 943,90 | 1203,38 | +27,5% |
| Q6_0_ROCMFPX_AGENT | 1102,30 | 1345,16 | +22,0% |
| Q8_0_ROCMFPX | 1367,70 | 1553,00 | +13,5% |
| Q8_0_ROCMFPX_AGENT | 1372,10 | 1549,89 | +13,0% |

**tg256 (t/s)**

| Nivel | llama.cpp-rocm | strix.cpp | Cambio |
|:--|--:|--:|--:|
| Q4_0_ROCMFP4_FAST | 72,70 | 74,53 | +2,5% |
| Q4_0_ROCMFP4_FAST_COHERENT | 72,60 | 74,61 | +2,8% |
| Q4_0_ROCMFP4_STRIX | 71,90 | 74,16 | +3,1% |
| Q6_0_ROCMFPX | 55,20 | 55,97 | +1,4% |
| Q6_0_ROCMFPX_AGENT | 51,50 | 52,30 | +1,6% |
| Q8_0_ROCMFPX | 48,20 | 48,51 | +0,6% |
| Q8_0_ROCMFPX_AGENT | 47,90 | 48,45 | +1,1% |

La tabla de MTP de strix.cpp aparece truncada en la información disponible (solo se muestra la fila de Q4_0_ROCMFP4_FAST sin valores de t/s ni de aceptación), por lo que no se puede reproducir. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada según nivel: Q4_0_ROCMFP4_FAST 17,65 GiB; FAST_COHERENT 17,79 GiB; STRIX 17,81 GiB; Q6_0_ROCMFPX 27,39 GiB; Q6_0_ROCMFPX_AGENT 30,86 GiB; Q8_0_ROCMFPX 34,17 GiB; Q8_0_ROCMFPX_AGENT 34,74 GiB; mmproj BF16 adicional de 0,84 GiB.
- GPU objetivo: AMD Strix Halo gfx1151 (Ryzen AI MAX+ 395) con memoria unificada; todos los niveles caben en una máquina de 128 GB según el autor.
- GPU consumer: no está previsto para GPUs discretas NVIDIA ni para ROCm en GPUs de escritorio convencionales; el motor strix.cpp está afinado para la arquitectura UMA de gfx1151. No hay datos de funcionamiento en RTX 4090, A100 o H100.
- Opciones de despliegue: exclusivamente strix.cpp (`strix-server -m <fichero> -ngl 99 -fa on --port 8080`); el llama.cpp upstream no puede cargar los ficheros ROCmFPX. No hay soporte documentado para vLLM, TGI, Ollama ni llama.cpp estándar.
- Throughput medido en strix.cpp: prefill de 256 tokens entre 932,89 y 2225,89 t/s según nivel; prefill de 2.048 tokens entre 1088,21 y 2536,88 t/s; generación de 256 tokens entre 48,45 y 74,61 t/s.
- Latencia: no se publican mediciones de latencia por petición (TTFT) más allá de los valores de prefill anteriores.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / motor | Notas |
|:--|--:|--:|--:|:--|:--|:--|
| Ornith-1.5-35B-A3B-abliterated-ROCmFP4 (este) | 35,51B | ~3B | 256K | Apache-2.0 (empaquetado) / MIT (base) | GGUF ROCmFPX, solo strix.cpp | Optimizado para gfx1151, 7 niveles, visión |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35,51B | ~3B | no disponible | no disponible | BF16 (pesos originales) | Modelo del que deriva esta cuantización |
| ornith-ai/Ornith-1.5-35B-A3B | 35,51B | ~3B | no disponible | MIT | no disponible | Modelo base original, sin abliteration |

No se dispone de datos de benchmarks de calidad ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Dependencia total de strix.cpp: los ficheros ROCmFPX no se pueden cargar con llama.cpp upstream, lo que limita la portabilidad y obliga a mantener un fork específico.
- Hardware restringido: el motor está afinado para gfx1151 (Ryzen AI MAX+ 395) con backend ROCm/HIP; no hay evidencia de funcionamiento correcto en otras GPUs, y el rendimiento fuera de esa arquitectura no está documentado.
- Modelo abliterated: la eliminación de direcciones de rechazo implica que el modelo puede generar contenido que el original rechazaría; requiere filtros externos y revisión humana en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; como todo modelo generativo sin benchmarks de calidad publicados, el riesgo no está cuantificado.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe ni determinar qué idiomas cubre el entrenamiento original.
- Tool calling y function calling no documentados explícitamente: el uso agéntico se sugiere a través de los niveles AGENT, pero no hay especificación de formato de herramientas.
- Licencia: el empaquetado es Apache-2.0 y el modelo base es MIT, pero el modelo intermedio (huihui-ai) no declara licencia en la información disponible; conviene verificar la cadena completa antes de uso comercial.
- Tamaño del repo: 251,2 GB, lo que exige planificación de almacenamiento y ancho de banda de descarga considerables.
- MTP desactivado por defecto: la decodificación especulativa debe habilitarse explícitamente y su tasa de aceptación no está publicada en la información disponible.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni métricas equivalentes, por lo que la idoneidad para tareas concretas debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArtomYuan/Ornith-1.5-35B-A3B-abliterated-ROCmFP4
- Modelo base de la cuantización: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Motor de inferencia strix.cpp: https://github.com/ArtomYuan/strix.cpp
