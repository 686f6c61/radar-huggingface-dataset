# millrace-ai/qwenpu-bonsai-9b-stock-prism

## Resumen

`millrace-ai/qwenpu-bonsai-9b-stock-prism` es un checkpoint de investigación publicado por Millrace AI que combina el modelo de lenguaje Bonsai 2 9B (en su cuantización ternaria PQ2_0) con el circuito RV32 y vectorial de QwenPU, un emulador de un ordenador RISC-V implementado dentro del bloque MTP del propio modelo. No es, por tanto, un modelo de propósito general: es un artefacto que demuestra que un modelo de lenguaje cuantizado puede alojar y ejecutar una máquina virtual completa dentro de su propio grafo de tensores, usando el modelo como sustrato de cómputo.

El checkpoint conserva los 427 tensores de lenguaje originales de Bonsai 2 9B con sus signos de Hadamard intactos y añade relleno neutro donde la forma compartida lo requiere. El circuito utiliza 4.052 de las 4.096 líneas residuales y 19.952 de las 20.480 filas FFN, con una arquitectura GGUF declarada como `qwen35`, anchura oculta de 4.096 y una longitud de contexto declarada de 262.144 tokens en la cabecera del GGUF.

Su relevancia es fundamentalmente metodológica: valida en Windows, sobre una GTX 1080 de 8 GiB y con el runtime Prism b12128 sin modificar, que un guest (los pesos de `stories260K` de Andrej Karpathy) puede ejecutarse dentro del modelo anfitrión produciendo exactamente la misma salida que la referencia independiente en CPU. El resultado es un checkpoint de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques de lenguaje y bloque MTP que aloja un circuito RV32 + vectorial (QwenPU); arquitectura GGUF declarada `qwen35` |
| Parametros totales | 13.538.207.234 elementos de tensor GGUF (445 tensores, incluye relleno cero y el circuito compilado); el host de lenguaje Bonsai 2 9B tiene 8.953.803.264 elementos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados en la cabecera del GGUF |
| Tipos de cuantizacion | PQ2_0 (cuantización ternaria empaquetada, 427 tensores de lenguaje originales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Bonsai-2-9B-PQ2_0-QwenPU-Stock-Prism.gguf`, 4.500.267.552 bytes, SHA-256 `01ea2741eae025dd7f5c2731d23091c989fa69f056c2c7f52cea08b2b275a688`) |

## Arquitectura y entrenamiento

El modelo parte de Bonsai 2 9B en formato GGUF con cuantización ternaria PQ2_0 y disposición de 32 bloques de lenguaje más un bloque MTP adicional. Sobre ese bloque MTP se injerta el circuito de QwenPU: una implementación RV32 con extensiones vectoriales que ocupa 4.052 de 4.096 líneas residuales y 19.952 de 20.480 filas FFN, con relleno neutro en las posiciones sobrantes. Los signos de Hadamard originales del modelo base se preservan sin alteración, de modo que la parte de lenguaje mantiene su comportamiento. El checkpoint no ha sido reentrenado: es un injerto estructural sobre pesos ya cuantizados.

La validación se realizó con el runtime Prism b12128 en Windows con CUDA 12.4. La ejecución completa de tres tokens del guest `stories260K` requirió 10 h 10 m 31 s de tiempo de captura, con 6.365.239 decodificaciones del modelo guest a 174,0 decodificaciones/s, un pico de 4,94 GiB de VRAM dedicada al proceso, 86 MiB de memoria GPU compartida y 4,64 GiB de RAM residente. Se verificaron 37.080 retiros arquitectónicos y 726 operaciones VMAT contra una referencia independiente en CPU, y coincidieron la posición de texto aparcada, la caché KV, el estado recurrente y los logits con el Bonsai 9B empaquetado original. En la ejecución acotada (2.578 retiros, 102.398 decodificaciones, 625,74 s) se midieron picos de 5,69 GiB de VRAM a nivel de dispositivo y 5.059 MiB dedicados al proceso con 65.536 celdas F16 asignadas.

## Capacidades

- Ejecución de un guest RISC-V RV32 con extensiones vectoriales dentro del bloque MTP del modelo, incluyendo operaciones VMAT y retiros arquitectónicos verificables.
- Emulación de un ordenador completo: el guest ejecuta sus propios pesos (`stories260K`) y produce texto (`Once upon a`) de forma determinista.
- Preservación del comportamiento del modelo anfitrión: posición de texto, caché KV, estado recurrente y logits coinciden con el Bonsai 2 9B empaquetado original.
- Handoff de resultados y siguiente decodificación coherentes con el historial de texto, verificado con siete fixtures de historial coincidente.
- Mutación de coeficientes activos observable en la primera búsqueda hasta su restauración, lo que permite instrumentación y depuración del circuito.
- Traza normalizada de 9B y hashes del estado vectorial final reproducibles entre ejecuciones (cuatro hosts Windows b12128).
- No se documentan capacidades de generación de texto de propósito general, tool calling, agentes, visión ni audio en la información disponible; el uso previsto es la ejecución del guest.

## Casos de uso

- Investigación en sustratos de cómputo: usar el checkpoint para estudiar cómo un modelo de lenguaje cuantizado puede alojar circuitos lógicos y ejecutar programas, con trazas verificables contra una referencia en CPU.
- Reproducción de experimentos: el repositorio incluye el launcher `Run.ps1`, hashes de GGUF, ELF, observer, probe y DLLs del runtime, lo que permite reproducir la captura acotada de 2.578 retiros en un equipo Windows con GPU de 8 GiB.
- Verificación de portabilidad de runtimes: sirve como caso de prueba para portar el soporte PQ2_0 y las APIs de feedback y caché del bloque MTP a otros runtimes distintos de Prism b12128.
- Docencia y divulgación: demuestra de forma tangible la diferencia entre "ejecutar un modelo" y "ejecutar un programa dentro de un modelo", con métricas concretas de VRAM, tiempo y retiros.
- Auditoría de cuantización ternaria: al conservar los signos de Hadamard y los 427 tensores originales, permite comparar el comportamiento del host antes y después del injerto.
- Desarrollo de instrumentación: los fixtures de mutación de coeficientes y los handoffs de historial coincidente sirven para construir herramientas de observación del estado interno del modelo.
- Pruebas de regresión de hardware: la GTX 1080 con 8 GiB se establece como línea base reproducible para validar cambios en el runtime CUDA de Prism.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos de rendimiento publicados son de ejecución del guest, no de calidad de lenguaje:

| Metrica | Ejecucion completa (3 tokens) | Ejecucion acotada |
|---|---:|---:|
| Tiempo de captura | 10 h 10 m 31 s | 625,74 s |
| Decodificaciones del guest | 6.365.239 | 102.398 |
| Velocidad de decodificacion | 174,0 decodificaciones/s | no disponible |
| VRAM pico dedicada al proceso | 4,94 GiB | 5.059 MiB |
| Memoria GPU compartida pico | 86 MiB | 86 MiB |
| VRAM pico a nivel de dispositivo | 6,27 GiB | 5,69 GiB |
| RAM residente pico | 4,64 GiB | no disponible |
| Retiros arquitectonicos verificados | 37.080 | 2.578 |
| Operaciones VMAT verificadas | 726 | 8 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GiB dedicados al proceso en la configuración medida (65.536 celdas F16), con picos de 5,69 a 6,27 GiB a nivel de dispositivo.
- GPU validadas: NVIDIA GTX 1080 de 8 GiB (Pascal) con Windows y CUDA 12.4. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, al menos en GTX 1080 de 8 GiB; el repo ocupa 4,5 GB.
- RAM del sistema: en torno a 4,64 GiB de working set en la ejecución completa.
- Opciones de despliegue: exclusivamente el runtime Prism b12128 para Windows (build `prism-b12128-d7b2896`, binarios CUDA 12.4 x64 y `cudart` correspondiente). No se documenta compatibilidad con vLLM, llama.cpp estándar, Ollama ni TGI; el port requiere soporte PQ2_0 y las APIs de feedback y caché del bloque MTP.
- Latencia y throughput: 174,0 decodificaciones del guest por segundo en la ejecución completa; el tiempo de captura incluye la configuración y ejecución del guest, no solo la decodificación.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos de lenguaje que alojan circuitos ejecutables en su bloque MTP). El modelo base, `prism-ml/Ternary-Bonsai-2-9B-gguf`, es el punto de referencia natural, pero no se dispone de sus especificaciones completas ni de benchmarks para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de propósito general: no se documentan capacidades de generación de texto libre, razonamiento, código ni matemáticas más allá de las del host Bonsai 2 9B, y el checkpoint está diseñado para ejecutar un guest concreto.
- Dependencia estricta del runtime: la validación es específica de Prism b12128; portar el checkpoint exige soporte PQ2_0 y las APIs de feedback y caché del bloque MTP.
- Solo validado en Windows con CUDA 12.4 y GTX 1080; no hay evidencia de funcionamiento en Linux, otras GPU o otros runtimes.
- Los tiempos de captura son muy elevados (más de 10 horas para tres tokens del guest), lo que lo hace inadecuado para uso interactivo.
- El recuento de parámetros del Hub (13.538.207.234) incluye relleno cero y el circuito compilado; no debe interpretarse como tamaño efectivo del modelo de lenguaje (8.953.803.264 elementos en el host).
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Licencia Apache 2.0 en el checkpoint, pero el modelo base, el guest `stories260K` y los componentes del port conservan los términos de los avisos y licencias incluidos; es necesario revisarlos antes de cualquier uso derivado.
- Checkpoint de investigación con 798 descargas y 0 likes en el momento de la consulta; no hay señales de mantenimiento ni soporte más allá del repositorio del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/qwenpu-bonsai-9b-stock-prism
- Preprint v1 y artefactos de reproducción: https://research.millrace.ai/bonsai-qwenpu/
- Modelo base (Bonsai 2 9B GGUF, revisión fijada): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/tree/82265ccc78ddaac4700286a35e9badcc32376dd9
- GGUF base PQ2_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-PQ2_0.gguf
- Repositorio del proyecto: https://github.com/tim-osterhus/qwenpu-bonsai
- Evidencia de ejecución completa en Windows: evidence/story-three-token-windows.json (en el repositorio del proyecto)
- Evidencia de ventana acotada: evidence/story-window-verification.json (en el repositorio del proyecto)
- Evidencia de fixtures: evidence/fixtures.json (en el repositorio del proyecto)
- Medición de tiempos de la ventana: evidence/story-window.json (en el repositorio del proyecto)
- Mediciones en cuatro hosts: https://github.com/tim-osterhus/qwenpu-bonsai/blob/d1bdc3f10e405494ee59f0f05262d2f476ac1204/results/forward/standard-layer/evidence-snapshot.json
- Runtime Prism b12128 (Windows CUDA 12.4): https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip
- Runtime CUDA de Prism: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/cudart-llama-bin-win-cuda-12.4-x64.zip
- QwenPU (revisión fijada): https://github.com/divagr18/QwenPU/tree/6e2767aaa59b69ea03300c0a5199d7b36debbe50
