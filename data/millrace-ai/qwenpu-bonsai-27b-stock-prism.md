# millrace-ai/qwenpu-bonsai-27b-stock-prism

## Resumen

Bonsai–QwenPU 27B on stock Prism es un checkpoint de investigación publicado por millrace-ai que combina dos elementos heterogéneos en un único fichero GGUF: los pesos del modelo de lenguaje Bonsai-27B (base prism-ml/Bonsai-27B-gguf) cuantizados en Q1_0, y un circuito compilado de QwenPU orientado a RISC-V y operaciones vectoriales. No se trata de un modelo entrenado desde cero, sino de un artefacto de empaquetado y portabilidad que permite ejecutar un programa invitado (guest) sobre el grafo de predicción multi-token (MTP) que ya existe en el runtime Prism. El objetivo declarado es demostrar que un programa compilado puede orquestar acciones seleccionadas por el modelo y devolver el control al host de lenguaje, con verificación offline mediante una referencia en CPU.

El checkpoint declara una arquitectura `qwen35` en la cabecera GGUF, con anchura oculta de 5.120, 21.248 filas por bloque FFN y una disposición de 64 bloques de lenguaje más un bloque MTP de QwenPU. La longitud de contexto declarada en la cabecera es de 262.144 tokens. El recuento de elementos tensoriales del host de lenguaje es de 26.895.998.464, mientras que el recuento combinado del checkpoint b12128 alcanza 32.428.584.450 elementos en 869 tensores, con un tamaño de fichero de 6.047.231.872 bytes.

La relevancia de esta ficha es doble. Por un lado, documenta un ejercicio de portabilidad de inferencia en hardware modesto (RTX 3070 y GTX 1080 de 8 GiB) con resultados verificados de retiradas arquitectónicas. Por otro, ilustra un patrón de empaquetado poco habitual, donde el GGUF contiene tanto pesos de lenguaje como código compilado, lo que condiciona su uso: no es un modelo para generación de texto convencional, sino un artefacto de investigación reproducible con tiempos de ejecución medidos en horas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer con grafo MTP de Prism); bloque adicional QwenPU con circuito RISC-V/vectorial compilado |
| Parametros totales | 32.428.584.450 elementos tensoriales (checkpoint b12128 combinado); host de lenguaje: 26.895.998.464 elementos |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (declarado en cabecera GGUF) |
| Tipos de cuantizacion | Q1_0 (host de lenguaje); el circuito compilado no es una cuantización de pesos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un solo fichero con pesos y circuito compilado) |

Datos adicionales de cabecera: anchura oculta 5.120, FFN con 21.248 filas por bloque, 64 bloques de lenguaje más 1 bloque MTP de QwenPU. Checkpoint b9596: 33.697.350.656 elementos, 868 tensores, 6.920.450.208 bytes. Checkpoint b12128: 32.428.584.450 elementos, 869 tensores, 6.047.231.872 bytes. El recuento del Hub incluye padding a cero y el circuito compilado.

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer identificado como `qwen35` en la cabecera GGUF, con 64 bloques de lenguaje y un bloque adicional MTP de QwenPU. El checkpoint no documenta un proceso de entrenamiento propio: es un artefacto derivado del GGUF base Bonsai-27B (Q1_0) al que se ha integrado un circuito compilado de QwenPU. Por tanto, no se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO en la información proporcionada.

La innovación técnica destacable no está en el entrenamiento sino en el mecanismo de ejecución. El programa invitado se ejecuta a través del grafo MTP existente de Prism; el launcher carga el programa y retransmite las acciones seleccionadas por el modelo a través de las APIs de Prism. Una referencia separada en CPU verifica la traza offline. El checkpoint b12128 añade un bloque MTP (869 tensores frente a 868 del b9596). Los resultados de validación se expresan en "retiradas arquitectónicas" (architectural retirements), un concepto de verificación de ejecución del circuito, no una métrica de calidad lingüística.

## Capacidades

- Generación de texto mediante el host de lenguaje Bonsai-27B (Q1_0), con decodificación a través del grafo MTP de Prism.
- Ejecución de programas invitados compilados (QwenPU) que seleccionan acciones y devuelven el control al host de lenguaje.
- Verificación offline de trazas mediante referencia en CPU.
- Handoff entre el estado parkeado del host y el resultado del programa invitado, con comprobación de estados en historiales de texto verificados.
- Ejecución en Linux y Windows con runtime Prism (b9596 y b12128).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de propósito general; el mecanismo guest/host es un patrón de orquestación, no un agente autónomo documentado.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo thinking, visión o audio no disponibles en la información proporcionada.

## Casos de uso

- Reproducción de investigación en portabilidad de inferencia: el paquete incluye launcher de Windows, verificador de referencia, programas invitados, checksums y avisos de licencia, lo que permite reproducir el smoke test vectorial corto en hardware de 8 GiB. Es adecuado porque los resultados están fijados por commit y acompañados de informes de ejecución.
- Validación de runtimes Prism en hardware legacy: los informes documentan ejecuciones completas en RTX 3070 (8 GiB) y GTX 1080 (8 GiB) con picos de VRAM medidos (7,06 GiB y 7,26 GiB respectivamente), lo que sirve para comparar builds b9596 y b12128 en condiciones controladas.
- Verificación de circuitos compilados: la referencia en CPU comprueba offline la traza de retiradas arquitectónicas, útil para pipelines de CI que necesitan confirmar que un circuito RISC-V/vectorial produce la misma secuencia de retiradas que la ejecución en GPU.
- Estudio de empaquetado GGUF mixto: el fichero combina pesos de lenguaje y circuito compilado en un solo GGUF, lo que permite investigar herramientas de inspección, recuento de tensores y padding a cero en formatos GGUF no convencionales.
- Benchmarking de handoff host/guest: los informes comparan estados parkeados, entrega de resultados y siguiente decodificación frente al modelo empacado original en historiales de texto verificados, lo que resulta útil para estudiar coherencia entre ejecución nativa y ejecución orquestada.
- Pruebas de estrés de latencia en hardware consumer: con tiempos de ejecución de 18 h 29 m (b9596, Linux) y 14 h 41 m (b12128, Windows) para un guest de tres tokens, el artefacto permite medir costes de orquestación y sobrecarga del grafo MTP en GPUs de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad lingüística (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos publicados son de verificación de ejecución:

| Entorno | Checkpoint | Resultado | Tiempo | VRAM pico |
|---|---|---|---|---|
| Linux, RTX 3070 8 GiB | b9596 | Guest stories260K de tres tokens imprime `Once upon a` y salto de línea; 37.080 retiradas arquitectónicas coincidentes; handoff a Bonsai correcto | 18 h 29 m | 7,06 GiB |
| Windows, GTX 1080 8 GiB | b9596 | Smoke test de descarga limpia: 40 retiradas vectoriales y handoff correcto; prefijo de historia: 1.830 retiradas hasta la primera multiplicación de matrices | no disponible | no disponible |
| Windows, GTX 1080 8 GiB | b12128 | Guest de tres tokens imprime `Once upon a` y salto de línea; 37.080 retiradas arquitectónicas coincidentes; halt correcto | 14 h 41 m | 7,26 GiB (RAM de proceso: 6,64 GiB) |

Validación cruzada en b12128 Windows: los mismos 37.080 registros arquitectónicos coincidieron también en Bonsai 2 9B, Bonsai 4B y Qwen3.5-4B UD-IQ2_M.

## Requisitos de hardware

- VRAM estimada: los picos medidos son 7,06 GiB (b9596 en RTX 3070) y 7,26 GiB (b12128 en GTX 1080), ambos sobre GPUs de 8 GiB. El fichero GGUF ocupa 6,92 GB (b9596) y 6,05 GB (b12128).
- RAM de proceso: 6,64 GiB medidos en la validación b12128 en Windows.
- GPU recomendadas: RTX 3070 (8 GiB) y GTX 1080 (8 GiB) son las plataformas verificadas. No hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, en GPUs de 8 GiB según los informes; no se documentan requisitos para GPUs de menor VRAM.
- Opciones de despliegue: runtime Prism (binarios oficiales b9596 y b12128 de llama.cpp de PrismML-Eng), launcher de Windows incluido en el paquete y referencia en CPU para verificación offline. No se documenta compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles como métricas de generación. Los tiempos de ejecución del guest son de horas (18 h 29 m y 14 h 41 m) para tres tokens, lo que refleja el coste de verificación del circuito, no el throughput del host de lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros (elementos) | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Bonsai–QwenPU 27B stock Prism (este) | 32.428.584.450 combinado; 26.895.998.464 host | 262.144 | apache-2.0 | GGUF en Hugging Face, paquete con launcher y verificador | Incluye circuito QwenPU compilado y bloque MTP |
| Bonsai-27B (base, prism-ml) | no disponible en la información proporcionada | no disponible | no disponible | GGUF en Hugging Face | Host de lenguaje original en Q1_0 |
| Bonsai 2 9B | no disponible | no disponible | no disponible | Colección millrace-ai | Validado con los mismos 37.080 registros arquitectónicos en b12128 Windows |
| Bonsai 4B | no disponible | no disponible | no disponible | Colección millrace-ai | Validado con los mismos 37.080 registros arquitectónicos en b12128 Windows |
| Qwen3.5-4B UD-IQ2_M | no disponible | no disponible | no disponible | no disponible | Validado con los mismos 37.080 registros arquitectónicos en b12128 Windows |

La comparación relevante no es de calidad de modelo sino de artefacto: este checkpoint se distingue por incorporar código compilado y verificación de trazas, algo que los hosts de lenguaje empacados no incluyen.

## Limitaciones y advertencias

- No es un modelo para generación de texto convencional: el caso de uso verificado es la ejecución de un guest de tres tokens con verificación de retiradas, no la producción de respuestas largas o conversacionales.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no evaluado; no hay benchmarks de calidad que permitan caracterizarlo.
- Idiomas soportados: no declarados; la única salida verificada es el prefijo en inglés `Once upon a`.
- Compatibilidad de runtime restringida: los resultados verificados dependen de builds concretos de Prism (b9596 y b12128) y de configuraciones de launcher registradas en la evidencia; usar otros runtimes invalida la reproducibilidad.
- Coste temporal elevado: ejecuciones de 14 a 18 horas para tres tokens en hardware de 8 GiB, lo que desaconseja cualquier uso interactivo o en producción.
- Licencia apache-2.0 declarada, pero el paquete incluye avisos de distribución (NOTICE) y procedencia del guest que deben revisarse antes de un uso comercial; la licencia del modelo base no se detalla en la información proporcionada.
- El recuento de parámetros del Hub incluye padding a cero y el circuito compilado, por lo que no debe interpretarse como tamaño efectivo del modelo de lenguaje.
- No hay datos publicados sobre tool calling, agentes, visión, audio ni modo thinking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism
- Preprint v1 y artefactos de reproducción: https://research.millrace.ai/bonsai-qwenpu/
- Write-up técnico (STOCK-PRISM-RELEASE): https://github.com/tim-osterhus/qwenpu-bonsai/blob/main/docs/STOCK-PRISM-RELEASE.md
- QwenPU (circuito original de Divyansh Agrawal): https://github.com/divagr18/QwenPU
- GGUF base Bonsai-27B-Q1_0: https://huggingface.co/prism-ml/Bonsai-27B-gguf/blob/f10afb355f104535e3e3e98cf7ab7795c72bd292/Bonsai-27B-Q1_0.gguf
- Bonsai-27B (árbol del modelo base): https://huggingface.co/prism-ml/Bonsai-27B-gguf/tree/f10afb355f104535e3e3e98cf7ab7795c72bd292
- Ficheros del paquete b9596: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/tree/stock-prism-b9596/stock-prism
- GGUF b9596: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/resolve/stock-prism-b9596/stock-prism/Bonsai-27B-Q1_0-QwenPU-Stock-Prism-b9596.gguf
- Instrucciones de setup y test: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/blob/stock-prism-b9596/stock-prism/README.md
- Binarios oficiales Prism b9596: https://github.com/PrismML-Eng/llama.cpp/releases/tag/prism-b9596-9fcaed7
- Informe de ejecución completa en Linux: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/blob/stock-prism-b9596/stock-prism/stock-mtp-vx-stories-three.json
- Informe de smoke test en Windows: https://github.com/tim-osterhus/qwenpu-bonsai/blob/aefc7d348a794926d8804feda2c363fdfb668db9/results/forward/standard-layer/stock-mtp-vx-package-smoke.json
- Informe de prefijo en Windows: https://github.com/tim-osterhus/qwenpu-bonsai/blob/aefc7d348a794926d8804feda2c363fdfb668db9/results/forward/standard-layer/stock-mtp-vx-research.json
- GGUF b12128: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/resolve/main/stock-prism-b12128/Bonsai-27B-Q1_0-QwenPU-Stock-Prism-b12128.gguf
- Ficheros y checksums b12128: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/tree/main/stock-prism-b12128
- Informe y manifiesto de validación completa en Windows: https://github.com/tim-osterhus/qwenpu-bonsai/blob/main/results/forward/standard-layer/windows-stories260k/README.md
- Medidas y verificación en cuatro hosts: https://github.com/tim-osterhus/qwenpu-bonsai/blob/d1bdc3f10e405494ee59f0f05262d2f476ac1204/results/forward/standard-layer/evidence-snapshot.json
- Colección de modelos: https://huggingface.co/collections/millrace-ai/qwenputer-bonsai-6aeee4defe3d3d356acb4b6c
- Procedencia del guest: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/blob/stock-prism-b9596/stock-prism/guests/README.md
- Avisos de distribución: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/blob/stock-prism-b9596/stock-prism/NOTICE
- Model card original CUDA v0.1.0: https://huggingface.co/millrace-ai/qwenpu-bonsai
