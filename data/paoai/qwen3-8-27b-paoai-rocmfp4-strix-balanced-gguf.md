# PaoAI/Qwen3.8-27B-PaoAI-ROCmFP4-STRIX-BALANCED-GGUF

## Resumen

El Qwen3.8-27B-PaoAI-ROCmFP4-STRIX-BALANCED-GGUF es una cuantización de comunidad publicada por PaoAI sobre el modelo base Qwen/Qwen3.8-27B (27.320.697.856 parámetros). No es un modelo nuevo ni un ajuste fino: es un GGUF de 15,01 GB (13,98 GiB) en un único fichero, empaquetado específicamente para la iGPU AMD Strix Halo (Ryzen AI Max+ 395, gfx1151) y pensado para ejecutarse en llama.cpp sin reparto entre CPU y GPU y sin flags de offload.

El interés está en la cuantización selectiva por componentes, en lugar de aplicar un único tipo a todo el modelo: la atención completa (16 capas) y el FFN denso se comprimen a ~4,5 bits por peso con una variante FP4 nativa de ROCm; las 48 capas de atención lineal usan ROCmFP4 con imatrix; los embeddings quedan en Q6_K; las normas en FP32; y la cabeza de borrador MTP se mantiene en Q8_0 + FP32 para preservar la tasa de aceptación de la decodificación especulativa.

Es relevante ahora porque demuestra que un híbrido de 27B puede servir contexto largo (hasta 128K probados) en hardware de consumo con memoria unificada, manteniendo la decodificación especulativa operativa y sin caídas abruptas al llenar la ventana. La contrapartida es que exige un fork no oficial de llama.cpp y una arquitectura (`qwen3_5`) y un tipo de cuantización (tipo 105) que el árbol estándar no reconoce.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen3_5`: 48 capas de atención lineal con gated-delta (GDN) + 16 capas de atención completa + cabeza MTP para decodificación especulativa |
| Parámetros totales | 27.320.697.856 (27,3 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | Probado a 64K (`-c 65536`); barrido de profundidad ejecutado con `-c 262144` y datos medidos hasta 128K |
| Tipos de cuantización | Mezcla por componente: Q4_0_ROCMFP4_STRIX (tipo 105, ~4,5 bpw) en atención completa Q/K/V/O; ROCmFP4 (tipo 100, ~4,5 bpw, con imatrix) en atención lineal y FFN denso; Q8_0 + FP32 en la cabeza de borrador; Q6_K en embeddings; FP32 en normas y gates |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero único de 15,01 GB / 13,98 GiB; sha256 `3727594804afef8140165e36c0919c70a98b43751a3153d43dd10385c1f100fd`) |

## Arquitectura y entrenamiento

El modelo base es un híbrido de atención: 48 capas de atención lineal con mecanismo gated-delta (estado en tiempo constante, pensadas para el "camino rápido") y solo 16 capas de atención completa, que son las que releen realmente el contexto. A esto se añade una cabeza de borrador MTP (blk.64) que habilita decodificación especulativa con `draft-mtp n4`. En llama.cpp la arquitectura se identifica como `qwen3_5`, y el fork de referencia la implementa junto con los tipos de cuantización ROCmFP4.

La receta de cuantización se aplica por órganos, con tamaños de tensor medidos: FFN gate/up 6,16 GB; FFN down 3,08 GB; atención lineal qkv 1,42 GB; operaciones de estado GDN 0,81 GB; embeddings de tokens 1,04 GB; salida 0,68 GB; atención completa 0,62 GB; cabeza de borrador 0,10 GB; normas por debajo de 0,01 GB; total 15,01 GB. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por RLHF, DPO u otras fases de alineación. PaoAI declara explícitamente que es una cuantización de comunidad y que no está afiliada a Alibaba ni al equipo de Qwen.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation; etiqueta conversational).
- Escritura de código: el modelo card documenta tareas de implementación de autómatas con reglas nuevas y trazas exactas de estado.
- Análisis de código: lectura de código "que miente" para trazarlo y localizar un bug plantado.
- Concurrencia: implementación de un ring buffer thread-safe que supera un arnés de estrés de 5.000 operaciones.
- Contexto largo: comportamiento medido y estable de 8K a 128K de contexto rellenado, incluida una pregunta aritmética de integridad (17×23) resuelta correctamente en los seis puntos del barrido.
- Decodificación especulativa integrada mediante cabeza MTP, con tasa de aceptación entre 0,86 y 0,90 en todo el rango de contexto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; las tareas de análisis y planificación del chain-test sugieren cierta capacidad, pero no hay datos formales.
- Capacidades multilingües: no disponibles; la model card solo declara inglés (`en`).
- Capacidades especiales: modo thinking, visión o audio no documentados.

## Casos de uso

- Asistente de código en local: el modelo implementa estructuras de datos concurrentes (ring buffer) y algoritmos nuevos con trazas exactas, por lo que encaja en un flujo de trabajo de escritura y revisión de código sin depender de API externa.
- Revisión de código heredado: la tarea "Hunt" mide la capacidad de leer código engañoso, trazarlo y localizar el bug plantado, que es exactamente lo que se necesita al auditar módulos antiguos o poco documentados.
- Análisis de repositorios con contexto largo: con 128K de ventana y decodificación a ~10,6 t/s en ese punto, permite cargar varios ficheros fuente y trazar dependencias entre ellos en una sola pasada.
- Generación de documentación técnica y resúmenes de código: el rendimiento sostenido de salida larga (21,6–24,3 t/s en la fase "Publish") lo hace adecuado para producir documentos extensos a partir de fuentes de código.
- Prototipado en un equipo de sobremesa con iGPU: al caber en 15,01 GB sobre una única máquina Strix Halo con ~51,6 GB de GTT a 64K de contexto, sirve como entorno de desarrollo privado sin GPU dedicada.
- Evaluación de cuantizaciones: sirve como referencia práctica para comparar recetas de compresión por componente frente a cuantizaciones homogéneas, usando el chain-test y el barrido de contexto como protocolo reproducible.
- Servicio local de razonamiento sobre documentos largos: gracias a la tasa de aceptación MTP estable (0,86–0,90) incluso a 128K, la decodificación especulativa sigue aportando aceleración cuando la ventana está llena.
- Pruebas de estrés de código concurrente en CI: se puede integrar en un pipeline que genere y ejecute candidatos de código multihilo contra un arnés de 5.000 operaciones.

## Benchmarks y rendimiento

No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos publicados son el "chain-test" propio del autor (mediana de 3 ejecuciones, septiembre de 2026) y mediciones de velocidad.

| Tarea del chain-test | Qué mide | Mediana de 3 | Ejecuciones |
|---|---|---|---|
| Automaton | Implementar reglas nuevas y trazar el estado exacto | 100 | 100 · 100 · 100 |
| Hunt | Leer código que miente, trazarlo y hallar el bug plantado | 100 | 100 · 100 · 100 |
| Ring buffer | Código multihilo bajo un arnés de estrés | 100 | 100 · 100 · 100 |
| Mediana de tarea | — | 100/100 | — |

Velocidad de decodificación por fase (contexto corto, servidor a 64K, draft-mtp n4, KV q8_0):

| Fase | t/s (rango de 3 ejecuciones) |
|---|---|
| Spec (planificación) | 18,7 – 19,3 |
| Hunt (análisis) | 20,8 – 21,9 |
| Automaton (escritura de código) | 20,9 – 23,9 |
| Ring buffer (escritura de código) | 18,6 – 21,6 |
| Publish (salida larga) | 21,6 – 24,3 |

Barrido de contexto profundo (una sola Strix Halo, flash attention, KV q8_0, `-c 262144`, draft-mtp n4):

| Contexto rellenado | Decode t/s | Prefill t/s | Aceptación MTP | Integridad 391 |
|---|---|---|---|---|
| 8K | 21,9 | 229,9 | 0,90 | Correcto |
| 16K | 22,4 | 211,7 | 0,86 | Correcto |
| 32K | 20,5 | 186,9 | 0,87 | Correcto |
| 64K | 17,5 | 150,1 | 0,89 | Correcto |
| 96K | 16,5 | 125,0 | 0,90 | Correcto |
| 128K | 10,6 | 102,9 | 0,87 | Correcto |

## Requisitos de hardware

- Peso del fichero: 15,01 GB (13,98 GiB) en un único GGUF.
- Memoria total observada: carga completa en GPU con GTT ≈ 51,6 GB a 64K de contexto; la mayor parte corresponde a pesos, caché KV y buffers de trabajo.
- Hardware de referencia: AMD Strix Halo (Ryzen AI Max+ 395, gfx1151), iGPU con memoria unificada.
- Cabe en GPU de consumo: sí en el hardware de referencia (memoria unificada). No hay datos publicados para GPU dedicadas; por tamaño (15 GB) requeriría al menos ~16 GB de VRAM solo para pesos, más caché KV, pero los tipos ROCmFP4 son específicos de gfx1151 y no se documenta su comportamiento en otras arquitecturas.
- Software obligatorio: fork kingjones30/ROCmFPX, rama `z13-main`, commit `dfeacaf2f`, compilado con `GGML_VULKAN=ON`. Con llama.cpp estándar falla con `unknown model architecture: 'qwen3_5'`; sin los tipos ROCmFP4 falla con `invalid ggml type 105` (mensaje truncado en la información disponible).
- Opciones de despliegue: llama.cpp (fork ROCmFPX) con decodificación especulativa MTP (`draft-mtp n4`), flash attention y KV en q8_0. No se documenta compatibilidad con vLLM, TGI, Ollama u otros motores.
- Throughput: 21,9 t/s de decodificación y 229,9 t/s de prefill a 8K; 10,6 t/s y 102,9 t/s respectivamente a 128K.
- Latencia y throughput en otras configuraciones de hardware: no disponibles.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos ni de modelos alternativos en la información proporcionada, por lo que la comparación de rendimiento no está disponible.

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-PaoAI-ROCmFP4-STRIX-BALANCED (esta ficha) | 27,3 mil millones | Probado a 64K; medido hasta 128K | GGUF mixto de 15,01 GB, requiere fork ROCmFPX | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.8-27B (modelo base) | 27,3 mil millones | No disponible | Pesos originales (formato no disponible en la información) | No disponible | HuggingFace |
| Cuantizaciones GGUF homogéneas de 27B | No disponible | No disponible | GGUF estándar compatible con llama.cpp stock | Depende del autor | No disponible |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es una cuantización de comunidad; PaoAI declara no estar afiliada a Alibaba ni al equipo de Qwen. El soporte y la validación dependen del autor del quant.
- Requiere un fork no oficial de llama.cpp (ROCmFPX, rama `z13-main`, commit `dfeacaf2f`). Con el árbol estándar el modelo no carga: `unknown model architecture: 'qwen3_5'` o `invalid ggml type 105`.
- Los tipos ROCmFP4 son nativos de gfx1151 (Strix Halo). No hay evidencia publicada de funcionamiento en otras GPU o plataformas.
- Idiomas: solo se declara inglés (`en`). No hay datos de rendimiento en castellano u otros idiomas.
- Variantes anteriores con compresión más agresiva de este mismo modelo obtuvieron 20 puntos en la tarea del ring buffer, según reconoce el propio autor; la degradación por sobrecuantización es un riesgo real en esta familia de quants.
- El chain-test tiene N=3 por tarea y está diseñado por el mismo autor del quant, con tareas de dominio muy concreto (autómata, caza de bugs, ring buffer). No es un benchmark independiente ni estandarizado.
- Rendimiento a contexto profundo: a 128K la decodificación cae a aproximadamente la mitad de la velocidad de 8K (10,6 frente a 21,9 t/s de forma lineal y sin cliff, pero con coste apreciable).
- La caché KV se sirve en q8_0, lo que introduce una pérdida de precisión adicional en contextos muy largos respecto a KV en FP16.
- No se han publicado evaluaciones de sesgos, tasas de alucinación ni robustez frente a prompts adversarios.
- Licencia apache-2.0 para la cuantización, pero conviene verificar por separado los términos aplicables al modelo base antes de un uso comercial.
- Riesgo de errores en tool calling y uso agéntico: no hay documentación ni validación de estas capacidades en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PaoAI/Qwen3.8-27B-PaoAI-ROCmFP4-STRIX-BALANCED-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp requerido (rama `z13-main`, commit `dfeacaf2f`): https://github.com/kingjones30/ROCmFPX
- Paper del modelo base: no disponible
- Blog o demo oficial: no disponible
- Resultados de la búsqueda web: no se encontraron enlaces relevantes. Los resultados devueltos eran páginas en japonés sobre seguros de accidentes laborales, sin relación alguna con el modelo.
