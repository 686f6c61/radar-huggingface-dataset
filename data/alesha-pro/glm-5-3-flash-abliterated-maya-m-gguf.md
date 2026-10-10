# alesha-pro/GLM-5.3-Flash-abliterated-Maya-M-GGUF

of stock model's reasoning
- Directions found on EXL3 2.05 bpw quant with exllamav3 fork
- File: raw float32 with 45 x 3 x 4096 values, 2,211,840 bytes
- Refusals: 64 AdvBench + 82 JailbreakBench without thinking + first 32 with thinking = 178 answers, greedy, judged by stock GLM-5.3-Flash
- Maya-M with vector: 2 refused, 4 disputes premise, 0 cut off while thinking
- The 2 refusals are about suicide/self-harm
- On EXL3 2.05 bpw: stock refused 144 of 146 without thinking; with vector 0 of 438 were refusals
- Speed on 4x RTX 3090: Maya v1.0.27, Maya-M, 256K context, after calibration
- Decode: 58.4 t/s without vector, 56.1 with
- Decode at 32K depth: 57.2 / 55.9
- Prefill at 8K: 1078-1113 / 1119-1153
- Prefill at 32K: 1860-1896 / 1938-1953
- Before calibration: 24.9 t/s
- STRATA_GLM_PCIE_SHARE=0.75
- KLD table: EXL3 2.05bpw 85.1GB KLD 0.1214, top-1 88.68%; EXL3 mix 98.1GB 0.0959, 89.87%; Maya-M 116.0GB 0.0934, 90.68%; EXL3 3.05bpw 125.2GB 0.0473, 93.08%
- 25-window panel of BF16 logits, 51,175 positions
- Maya serves 1 request at a time
- Architecture in GGUF header renamed to glm5-next in later commit
- Run instructions

Note: the date is 2026-10-10, which is in the future relative to now. But I'll just report as given.

Languages: "no disponibles"
Parameters: not stated — GLM-5.3-Flash is likely MoE but not stated. I should say "no disponible". Actually the card doesn't mention parameter count. Repo size 117.1 GB for the quant. I shouldn't invent.

Note: there's a caution — the model is "abliterated" (removes refusals). This has ethical implications. I must mention limitations/advertencias about it. I should be neutral and technical — noting it's designed to bypass safety refusals, which is a significant caveat.

I should not help with harmful use but describing it factually is fine.

Also note "4 hyper-connection streams" — architecture detail.

Now write the ficha.

Structure:
## Resumen
## Especificaciones tecnicas
## Arquitectura y entrenamiento
## Capacidades
## Casos de uso (min 6)
## Benchmarks y rendimiento
## Requisitos de hardware
## Comparativa con modelos similares
## Limitaciones y advertencias
## Enlaces

Titles in sentence case, only first word capitalized. No emojis. Spanish from Spain.

Let me draft.

Resumen: 2-3 paragraphs, 6-10 lines total.

Especificaciones tecnicas table:
- Arquitectura: no disponible en la informacion proporcionada (el header GGUF se renombra a glm5-next en la revision posterior del repo base). Actually — I can say "Transformer con FFN y 4 hyper-connection streams (Maya); el header GGUF del repo base fue renombrado a `glm5-next`". Hmm, that's a detail. Let me be careful: the model card says the authors' commit renames the architecture in the GGUF header to glm5-next. So the architecture name is glm5-next but exact type not given. I'll write "no disponible (el header GGUF identifica la arquitectura como `glm5-next`; el tipo exacto no se detalla)".

- Parametros totales: no disponible
- Parametros activos: no disponible (no se indica que sea MoE) — hmm, "solo si es MoE". I could omit or say no disponible. I'll include with "no disponible".
- Longitud de contexto: 262.144 tokens (256K)
- Tipos de cuantizacion: GGUF (Maya-M, 116,0 GB); el repo base ofrece Maya-S, Maya-S24 y Maya-L
- Idiomas soportados: no disponible
- Licencia: MIT
- Formato de pesos: GGUF (mas fichero de vector en float32)

Add extra rows maybe: tamano del repo 117,1 GB; pipeline image-text-to-text; fecha.

The instruction says "Incluye SIEMPRE estas filas" — I can add more.

Arquitectura y entrenamiento: explain that weights are not retrained, it's a quant + inference-time steering vector. Explain the abliteration mechanism. Explain Maya engine, Strata. Base model by Z.ai. No training data info available.

Note: this is not a typical training; it's inference-time intervention. Important.

Capacidades: text gen, reasoning with thinking mode, vision (image-text-to-text), conversational, tool calling not confirmed. Be careful: don't invent. I can say "no se documenta soporte de tool calling". Actually the base is GLM-5.3-Flash, and the card doesn't mention tool calling. I'll state what's documented and mark unknown.

Capabilities documented:
- Generación de texto conversacional (pipeline conversational, chat API)
- Modo thinking (razonamiento) — the vector has a direction for thinking on
- Entrada de imagen (image-text-to-text, vision files)
- Contexto largo 256K
- Multilingüe: no documentado
- Tool calling: no documentado
- Agentes: no documentado
- Capacidad de reducir rechazos (abliterated)

Casos de uso: min 6. Need concrete. Careful — I shouldn't propose harmful use. Legitimate uses: research on refusal mechanisms, red-teaming/safety evaluation, long-context document analysis, image analysis, local inference on 4x3090, creative writing, etc.

Let me write:
1. Investigación en seguridad y alineación: estudio del comportamiento de rechazo...
2. Red-teaming y evaluación de salvaguardas: usar la versión con vector para generar respuestas que el modelo base rechazaría, midiendo la robustez de clasificadores...
3. Análisis de documentos largos con contexto de 256K...
4. Procesamiento de documentos escaneados / visión...
5. Asistente conversacional local autoalojado en 4x RTX 3090...
6. Escritura creativa y ficción sin filtros repetitivos...
7. Reproducción de experimentos de cuantización: comparar KLD/top-1...
8. Fine-tuning de clasificadores con datos sintéticos... hmm.

I'll give 7.

Benchmarks: table with the KLD data and refusal data and speed. Also note no MMLU etc.

Comparativa: compare with EXL3 quants of the same model (2.05 bpw, 3.05 bpw, mix) — that's what data gives. Also mention base Maya-M without vector. And GLM-5.3-Flash BF16 as reference. Since no other similar models known, note it.

Requisitos de hardware: 4x RTX 3090 (96 GB VRAM total), repo 117.1 GB, so needs ~116 GB; 2 memory channels mentioned; PCIe path; consumer GPU — 4x3090 is consumer. Single 3090 (24 GB) no. Options: Maya engine (fork), llama.cpp not confirmed since GGUF but custom architecture glm5-next may not be supported by llama.cpp. I should say "no confirmado". Actually GGUF format usually works with llama.cpp but a custom arch like glm5-next probably not. I'll say no documentado.

Throughput numbers given.

Limitaciones: abliteration removes refusals → risk; 2 refusals remain (suicide/self-harm); hallucination; languages unknown; license MIT for the repo but base model license — the base is zai-org/GLM-5.3-Flash; card says license mit. Note that the repo keeps the authors' GGUF byte-for-byte and the altered first shard discrepancy — reproducibility caveat. Also 0 downloads, dates. Also the SHA256 mismatch story about the base repo revision.

Enlaces: HF model, base repo peasantsmith, zai-org/GLM-5.3-Flash, Project Maya github, Strata github, alesha-pro fork, abliteration write-up, teacher logits dataset. Also note web search results irrelevant.

Let me write it out.

For the KLD table: quant, size, KLD to BF16, top-1 agreement.

Now the refusals table.

Let me write carefully and in correct Spanish.

For "thinking off" — modo de razonamiento desactivado.

I'll write.

One more: repository size 117.1 GB but model file 116.0 GB — consistent (vision files + vector).

Date created 2026-10-10 — I'll mention "publicado el 10 de octubre de 2026 (según los metadatos del repositorio)".

Let's write.

Regarding the "Comparativa" section — comparing with alternatives. The card gives EXL3 quants of the same base model. That's a legit comparison. Also base Maya-M without vector. I'll present a table: variante, tamaño, KLD, top-1, rechazos (only for some), licencia.

Also note: no hay modelos de la misma categoría documentados en la información disponible aparte de estos.

Let me write the final markdown.

Careful about titles: "## Resumen", "## Especificaciones tecnicas" (no accent? "técnicas" - the template says "Especificaciones tecnicas" without accent. I'll follow the template exactly but Spanish would have accent. The template literally writes "Especificaciones tecnicas". Hmm — I should use correct Spanish. The rule says "sin faltas de ortografia". I'll write "Especificaciones técnicas". Actually the obligatory structure is given; using accents is a spelling correctness matter. I'll use accents: "Especificaciones técnicas". Similarly "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces".

Only first word capitalized — so "Especificaciones técnicas" is fine.

Write now.

For hardware:
- VRAM: ~116 GB para Maya-M en GGUF (repo 117,1 GB). No se documentan cuantizaciones menores en este repo; el repo base ofrece Maya-S, Maya-S24, Maya-L.
- GPU recomendadas: 4x RTX 3090 (24 GB cada una = 96 GB VRAM) según el autor. Necesita también memoria del sistema y ancho de banda PCIe; el autor menciona solo 2 canales de memoria en su máquina y el uso de STRATA_GLM_PCIE_SHARE=0.75.
- Consumer GPU: sí, 4x RTX 3090. Una sola 3090 no.
- Despliegue: motor Maya (fork glm-ablate de Project Maya). vLLM/llama.cpp/Ollama/TGI: no documentado.
- Latencia/throughput: decode 56,1 t/s con vector, 55,9 a 32K de profundidad; prefill 1.119-1.153 t/s a 8K y 1.938-1.953 t/s a 32K. Servidor de 1 petición simultánea.

Note prefill at 32K higher than 8K is odd but as given.

OK writing.## Resumen

GLM-5.3-Flash-abliterated-Maya-M-GGUF es un paquete de inferencia publicado por el usuario alesha-pro sobre el modelo GLM-5.3-Flash de Z.ai, en su cuantización Maya-M desarrollada por mw00 y PeasantSmith dentro del proyecto Project Maya. No se trata de un modelo reentrenado: los pesos son copiados byte a byte del repositorio peasantsmith/GLM-5.3-Flash-Maya-GGUF (revisión 3e9f3bb20aa191e01c6fb850faf132d8149da98a, con los SHA256 de los cinco ficheros verificados) y lo que aporta este repositorio es un vector de dirección de 2,2 MB y un parche del motor de inferencia que lo aplica en tiempo de ejecución.

El objetivo declarado es eliminar los rechazos del modelo mediante una técnica de "abliteration": el motor sustrae, en cada capa, tres direcciones calculadas como diferencia entre activaciones de peticiones dañinas y no dañinas. El resultado es un modelo que responde a peticiones que el modelo original rechazaría, manteniendo el resto del comportamiento y sin reentrenar pesos. El repositorio ocupa 117,1 GB y está pensado para ejecutarse en 4x RTX 3090 con una ventana de contexto de 256K tokens.

Es relevante porque documenta de forma reproducible un caso de intervención en tiempo de inferencia sobre un modelo multimodal de contexto largo, con medidas concretas de tasa de rechazo, divergencia KL frente a BF16 y rendimiento en hardware de consumo. Al mismo tiempo, ilustra los riesgos asociados a la publicación de variantes que anulan deliberadamente los mecanismos de seguridad de un modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle (el header GGUF del repositorio base identifica la arquitectura como `glm5-next`; el tipo exacto no se especifica) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | GGUF, variante Maya-M (116,0 GB). El repositorio base ofrece además Maya-S, Maya-S24 y Maya-L |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (más un vector en float32 crudo de 2.211.840 bytes) |
| Tamaño del repositorio | 117,1 GB |
| Pipeline | image-text-to-text |
| Motor de inferencia | Maya v1.0.27 con el fork `glm-ablate` de alesha-pro (3 ficheros añadidos) |
| Modelo base | peasantsmith/GLM-5.3-Flash-Maya-GGUF (a su vez derivado de zai-org/GLM-5.3-Flash) |
| Fecha de publicación | 10 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento adicional. Los pesos son idénticos a los del repositorio de PeasantSmith y mw00; la única modificación es de inferencia. El parche actúa antes de que la salida de la FFN de cada capa se escriba en los 4 "hyper-connection streams" del motor Maya: para cada una de las capas 1 a 44 se restan tres direcciones propias, mediante la operación `x = x - (x . v) v` aplicada a ambos operandos de la escritura. Sin activar el parche, el motor ejecuta el modelo original sin cambios.

Las tres direcciones por capa se obtuvieron como diferencia entre activaciones de peticiones dañinas y no dañinas: la primera en el último token del prompt con el modo thinking desactivado, la segunda con thinking activado y la tercera en el token de cierre `</think>` del razonamiento propio del modelo original. No se calcularon sobre Maya-M, sino sobre la cuantización EXL3 de 2,05 bpw del mismo modelo usando un fork de exllamav3, y después se convirtieron al formato del motor Maya. El fichero resultante contiene 45 x 3 x 4096 valores en float32.

El motor Maya procede de Strata (Niko1221) y su funcionamiento depende de calibración previa: sin `./maya.sh --calibrate`, el motor enviaba expertos "fríos" a la CPU y el rendimiento caía a 24,9 tokens/s en la máquina del autor (solo 2 canales de memoria). La calibración los redirige a la ruta PCIe mediante `STRATA_GLM_PCIE_SHARE=0.75`. La visión se resuelve con los ficheros del proyecto original, enlazados mediante un symlink a `models/Maya-M/vision`.

## Capacidades

- Generación de texto conversacional: el modelo se expone mediante una API de chat del motor Maya y está etiquetado como `conversational`.
- Razonamiento con modo thinking: el propio vector distingue entre direcciones calculadas con thinking activado y desactivado, lo que confirma la existencia de ese modo en el modelo base.
- Entrada de imagen: el pipeline declarado es `image-text-to-text` y el repositorio incluye los ficheros de visión del proyecto original.
- Contexto largo: 262.144 tokens, verificado en las pruebas de rendimiento del autor a 256K.
- Supresión de rechazos: con el vector activo, de 178 respuestas evaluadas (64 peticiones AdvBench y 82 de JailbreakBench sin thinking, más las primeras 32 con thinking, decodificación greedy), se registraron 2 rechazos, 4 disputas de premisa y 0 respuestas cortadas durante el razonamiento.
- Idiomas: no documentado.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades de audio: no documentadas.

## Casos de uso

- Investigación sobre mecanismos de rechazo en modelos alineados: el parche permite activar y desactivar la supresión de direcciones con un único fichero, lo que facilita experimentos controlados sobre qué capas y qué direcciones determinan el comportamiento de negativa.
- Red-teaming y evaluación de salvaguardas: generar respuestas a conjuntos como AdvBench o JailbreakBench con el vector activo y usar ese corpus para medir la robustez de clasificadores de contenido o de filtros posteriores.
- Análisis de documentos extensos: con 256K tokens de contexto se pueden procesar informes, expedientes o bases de código completas en una sola pasada sin troceado, siempre que se disponga de los ~116 GB de VRAM necesarios.
- Procesamiento de documentos con componente visual: al aceptar imagen y texto, encaja en la extracción de información de PDFs escaneados, capturas o diagramas combinados con instrucciones textuales.
- Asistente conversacional autoalojado en un clúster pequeño: 4x RTX 3090 decodifican 56,1 tokens/s a 256K de contexto con el vector activo, suficiente para un servicio interno de baja concurrencia (el motor atiende una petición a la vez).
- Escritura creativa y de ficción: la anulación de rechazos reduce las negativas ante tramas, personajes o diálogos conflictivos, un escenario habitual en narrativa.
- Reproducción de estudios de cuantización: el repositorio incluye comparativas de KLD frente a logits BF16 que permiten contrastar recetas de cuantización (EXL3 a 2,05 y 3,05 bpw frente a Maya-M) en el mismo panel de evaluación.
- Despliegue sin conexión en entornos aislados: al ser pesos GGUF locales con licencia MIT, puede ejecutarse en infraestructura propia sin dependencia de API externa.

## Benchmarks y rendimiento

Métricas de rechazo (178 respuestas, decodificación greedy, juzgadas por el GLM-5.3-Flash original):

| Configuración | Rechazos | Disputa la premisa | Corte durante thinking |
|---|---:|---:|---:|
| Maya-M con el vector | 2 | 4 | 0 |
| EXL3 2,05 bpw, modelo original | 144 de 146 (sin thinking) | No disponible | No disponible |
| EXL3 2,05 bpw, con vector | 0 de 438 | No disponible | No disponible |

Fidelidad frente a BF16 (panel de 25 ventanas, 51.175 posiciones, vocabulario completo):

| Cuantización | Tamaño | KLD frente a BF16 | Coincidencia top-1 |
|---|---:|---:|---:|
| EXL3 2,05 bpw | 85,1 GB | 0,1214 | 88,68 % |
| EXL3 mix (gate/up 2 bits, down 3 bits) | 98,1 GB | 0,0959 | 89,87 % |
| Maya-M | 116,0 GB | 0,0934 | 90,68 % |
| EXL3 3,05 bpw | 125,2 GB | 0,0473 | 93,08 % |

Rendimiento en 4x RTX 3090, Maya v1.0.27, contexto de 256K, tras calibración:

| Métrica | Sin vector | Con vector |
|---|---:|---:|
| Decodificación | 58,4 tokens/s | 56,1 tokens/s |
| Decodificación a 32K de profundidad | 57,2 tokens/s | 55,9 tokens/s |
| Prefill a 8K | 1.078–1.113 tokens/s | 1.119–1.153 tokens/s |
| Prefill a 32K | 1.860–1.896 tokens/s | 1.938–1.953 tokens/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos en la información disponible. No se midió la KLD de Maya-M con el vector activo.

## Requisitos de hardware

- VRAM estimada: en torno a 116 GB para la variante Maya-M (el repositorio completo ocupa 117,1 GB, incluyendo el vector de 2,2 MB y los ficheros de visión). No se documentan cuantizaciones menores en este repositorio.
- GPU recomendadas: 4x RTX 3090 (96 GB de VRAM en total), configuración usada por el autor para todas las medidas. No se documentan pruebas en A100, H100 ni otras GPU profesionales.
- Cabe en GPU de consumo: sí, pero solo en configuraciones multi-GPU de gama alta tipo 4x RTX 3090. No cabe en una única GPU de 24 GB ni en tarjetas de 48 GB.
- Memoria del sistema y bus: el autor menciona que su máquina tiene solo 2 canales de memoria y que el rendimiento depende de la calibración, con `STRATA_GLM_PCIE_SHARE=0.75` para dirigir expertos fríos a la ruta PCIe. Sin calibrar, la decodificación cae a 24,9 tokens/s.
- Opciones de despliegue: motor Maya v1.0.27 con el fork `glm-ablate` de alesha-pro, previa ejecución de `./maya.sh --setup`. El soporte en vLLM, llama.cpp, Ollama o TGI no está documentado.
- Latencia y throughput: 56,1 tokens/s de decodificación con el vector a 256K de contexto, 55,9 tokens/s a 32K de profundidad y prefill de 1.119–1.153 tokens/s a 8K y 1.938–1.953 tokens/s a 32K. El motor sirve una sola petición de forma simultánea, por lo que no hay datos de throughput agregado.
- Almacenamiento: al menos 117,1 GB para los pesos, más espacio para los ficheros de visión enlazados.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de la misma categoría fuera de las variantes del propio GLM-5.3-Flash. La comparación posible es entre las recetas de cuantización del mismo modelo:

| Variante | Tamaño | KLD frente a BF16 | Top-1 | Motor | Licencia |
|---|---:|---:|---:|---|---|
| EXL3 2,05 bpw | 85,1 GB | 0,1214 | 88,68 % | exllamav3 | No disponible |
| EXL3 mix (2/3 bits) | 98,1 GB | 0,0959 | 89,87 % | exllamav3 | No disponible |
| Maya-M | 116,0 GB | 0,0934 | 90,68 % | Maya | MIT (este repositorio) |
| EXL3 3,05 bpw | 125,2 GB | 0,0473 | 93,08 % | exllamav3 | No disponible |
| Maya-M con vector | 116,0 GB | No medido | No medido | Maya (fork) | MIT (este repositorio) |

Advertencia de comparabilidad: las filas EXL3 se ejecutaron con exllamav3 y la de Maya-M con el motor Maya, por lo que el valor de Maya-M incluye el ruido de su propio motor. El autor indica además que las medidas del repositorio base frente a FP8 no son comparables con esta tabla.

## Limitaciones y advertencias

- Anulación deliberada de rechazos: el modelo está diseñado para eliminar las negativas del modelo original. Esto invalida su uso en aplicaciones donde las salvaguardas del modelo base sean un requisito, y traslada toda la responsabilidad de filtrado al sistema que lo integre.
- Rechazos residuales: en la evaluación quedaron 2 rechazos, ambos sobre suicidio y autolesión, que el modelo reconvierte en textos de prevención. El autor decidió no eliminarlos.
- Alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación. Un modelo de 116 GB con contexto de 256K no está exento de inventar contenido, y menos tras una intervención que altera las activaciones de 44 capas.
- Idioma: no hay información sobre los idiomas soportados ni sobre su calidad fuera del inglés, pese a que la evaluación de rechazos se hizo con conjuntos en inglés.
- Reproducibilidad: el autor advierte de que el repositorio base cambió el primer shard después de la descarga (commit `1084950a`, que renombra la arquitectura a `glm5-next` con el mismo tamaño de fichero). Este repositorio conserva el shard anterior, el único probado con Maya v1.0.27. Quien descargue del repositorio base puede obtener ficheros distintos.
- Licencia: el repositorio declara MIT, pero los pesos proceden de zai-org/GLM-5.3-Flash y de la cuantización Maya-M de terceros. Conviene verificar las condiciones del modelo base antes de un uso comercial.
- Versión de motor fijada: el parche solo está probado con Maya v1.0.27. Actualizaciones del motor pueden romper la compatibilidad con el fichero de vector.
- Contexto real: aunque se declaran 262.144 tokens, el rendimiento medido a 32K de profundidad se mantiene, pero no hay datos publicados sobre degradación de calidad a profundidades cercanas al límite.
- Rendimiento dependiente del hardware: las cifras de 56 tokens/s corresponden a 4x RTX 3090 tras calibrar. En configuraciones con menos ancho de banda PCIe o menos canales de memoria, el rendimiento puede degradarse notablemente.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en los metadatos consultados, por lo que no existe validación independiente de las medidas del autor.
- Búsqueda web sin resultados relevantes: las consultas realizadas no devolvieron información técnica sobre este modelo; los resultados obtenidos correspondían a contenidos sin relación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/alesha-pro/GLM-5.3-Flash-abliterated-Maya-M-GGUF
- Repositorio base (Maya-M, Maya-S, Maya-S24, Maya-L): https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Project Maya (motor): https://github.com/mw00/project-maya
- Fork con el parche de abliteration: https://github.com/alesha-pro/project-maya/tree/glm-ablate
- Documentación del parche GLM-ABLATE: https://github.com/alesha-pro/project-maya/blob/glm-ablate/docs/GLM-ABLATE.md
- Metodología de abliteration y scripts: https://github.com/alesha-pro/exllamav3-glm53-4x3090/blob/glm53-4x3090/glm53/abliteration/README.md
- Strata (motor del que deriva Maya): https://github.com/Niko1221/Strata
- Dataset de logits BF16 del profesor: https://huggingface.co/datasets/brandonmusic/GLM-5.3-Flash-BF16-Teacher-Logits
