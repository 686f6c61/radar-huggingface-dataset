# millrace-ai/qwenpu-bonsai-27b-stock-prism

## Resumen

`millrace-ai/qwenpu-bonsai-27b-stock-prism` es un checkpoint de investigación publicado por el usuario millrace-ai que combina el modelo Bonsai-27B de Prism ML (en cuantización Q1_0) con el circuito RISC-V y vectorial compilado de QwenPU en un único archivo GGUF. No se trata de un modelo de lenguaje entrenado desde cero, sino de un artefacto experimental que empaqueta un programa invitado (guest) ejecutable dentro del grafo de predicción multi-token (MTP) de Prism, de modo que el modelo base actúa como anfitrión y delega acciones seleccionadas a través de las APIs de Prism. El objetivo es demostrar la ejecución de circuitos ajenos sobre un runtime de inferencia estándar sin parchear el motor.

El modelo base declarado es `prism-ml/Bonsai-27B-gguf` y los pesos empaquetados suman 33.697.350.656 parámetros según los metadatos de safetensors, aunque el archivo GGUF descargable ocupa 6,920 GB gracias a la cuantización Q1_0. La licencia es Apache 2.0. El checkpoint se distribuye junto con un lanzador para Windows, un verificador de referencia, los programas invitados, sumas de comprobación y avisos de licencia.

Su relevancia es acotada y muy específica: sirve como banco de pruebas reproducible para validar la integración de circuitos RISC-V/vectoriales en runtimes de inferencia, no como modelo de propósito general. Las pruebas publicadas consisten en ejecutar un invitado de tres tokens (stories260K) que imprime `Once upon a` y un salto de línea, con verificación de retiros arquitectónicos y del traspaso de vuelta a Bonsai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con grafo de predicción multi-token (MTP) de Prism; incluye circuito RISC-V y vectorial compilado de QwenPU empaquetado en el GGUF |
| Parametros totales | 33.697.350.656 (según metadatos de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q1_0 (checkpoint principal); existe un checkpoint de investigación adicional de 6,047 GB en Prism b12128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (6,920 GB para el checkpoint b9596) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado por el autor. Se construye a partir de Bonsai-27B de Prism ML en cuantización Q1_0, al que se le añade el circuito compilado de QwenPU (RISC-V más extensiones vectoriales) dentro del mismo contenedor GGUF. El invitado se ejecuta a través del grafo MTP existente de Prism: el lanzador carga el programa invitado y retransmite las acciones seleccionadas por el modelo a través de las APIs de Prism. Un verificador de referencia en CPU comprueba la traza fuera de línea.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque el autor no documenta un proceso de entrenamiento propio. La innovación técnica reside en el empaquetado y la verificación: ejecutar un circuito ajeno sobre un runtime de inferencia estándar (Prism b9596) sin modificar el motor, y validar el resultado comparando retiros arquitectónicos y vectoriales contra una referencia. Las pruebas documentadas incluyen 37.080 retiros arquitectónicos verificados en Linux sobre una RTX 3070 de 8 GiB (18 h 29 min, pico de 7,06 GiB de VRAM) y una prueba de humo en Windows sobre una GTX 1080 de 8 GiB con 40 retiros vectoriales y coincidencia del prefijo de historia hasta 1.830 retiros.

## Capacidades

- Ejecución de un programa invitado RISC-V/vectorial dentro del grafo MTP de Prism, con traspaso de vuelta al modelo Bonsai.
- Verificación offline de la traza mediante un verificador de referencia en CPU.
- Generación de texto limitada al invitado de demostración stories260K (prefijo `Once upon a` y salto de línea).
- Compatibilidad con endpoints según las etiquetas del repositorio (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.
- Soporte multilingüe: no disponible.

## Casos de uso

- Validación de portabilidad de circuitos RISC-V sobre runtimes de inferencia estándar: el paquete permite reproducir la ejecución del invitado y comparar los retiros arquitectónicos y vectoriales contra la referencia en CPU, lo que sirve para auditar la integración de QwenPU con Prism.
- Reproducción de experimentos de investigación: el lanzador de Windows, el verificador y los informes de traza permiten repetir las pruebas publicadas (Linux con RTX 3070 y Windows con GTX 1080) y contrastar los hashes de checkpoint y runtime.
- Docencia y divulgación sobre ejecución de código ajeno en motores de inferencia: el ejemplo stories260K es lo bastante pequeño para explicar el flujo de carga del invitado, la selección de acciones y el traspaso de estado.
- Pruebas de regresión de runtimes: al fijar la versión de Prism (b9596 o b12128) y registrar los retiros esperados, el artefacto puede usarse como caso de prueba para detectar cambios de comportamiento en futuras compilaciones del motor.
- Estudio de cuantización extrema: el empaquetado Q1_0 de un modelo de 33,7 mil millones de parámetros en 6,920 GB permite analizar el impacto de la cuantización en la ejecución del grafo MTP.
- Verificación de empaquetado y distribución de artefactos: las sumas de comprobación, los avisos de licencia y los manifiestos incluidos sirven de plantilla para publicar checkpoints con trazabilidad de procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos de rendimiento son los de las pruebas de ejecución del invitado:

| Entorno | Resultado verificado | Tiempo | VRAM pico |
|---|---|---|---|
| Linux, RTX 3070 8 GiB (Prism b9596) | 37.080 retiros arquitectónicos y traspaso a Bonsai correctos; imprime `Once upon a` y salto de línea | 18 h 29 min | 7,06 GiB |
| Windows, GTX 1080 8 GiB (Prism b9596) | 40 retiros vectoriales y traspaso a Bonsai correctos; prefijo de historia con 1.830 retiros hasta la primera multiplicación de matrices | no disponible | no disponible |
| Windows, GTX 1080 8 GiB (Prism b12128, checkpoint de 6,047 GB) | 37.080 retiros arquitectónicos correctos; imprime `Once upon a` y salto de línea | 14 h 41 min | 7,26 GiB de VRAM de dispositivo y 6,64 GiB de RAM de proceso |

## Requisitos de hardware

- VRAM estimada: alrededor de 7 GiB en las pruebas publicadas (7,06 GiB en RTX 3070, 7,26 GiB en GTX 1080).
- GPU recomendadas según la documentación: RTX 3070 de 8 GiB y GTX 1080 de 8 GiB, ambas verificadas.
- Cabe en GPU de consumo con al menos 8 GiB de VRAM.
- Despliegue: requiere el runtime Prism en las versiones b9596 o b12128 con los binarios oficiales de PrismML-Eng; no se documenta compatibilidad con vLLM, llama.cpp estándar, Ollama ni TGI.
- Latencia y throughput: los tiempos de ejecución del invitado son de 18 h 29 min (Linux, b9596), 14 h 41 min (Windows, b12128) y una prueba de humo en Windows sin tiempo publicado; no son representativos de inferencia de propósito general.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwenpu-bonsai-27b-stock-prism | 33.697.350.656 | no disponible | Apache 2.0 | GGUF de 6,920 GB más paquete con lanzador y verificador | Checkpoint de investigación con circuito QwenPU empaquetado |
| prism-ml/Bonsai-27B-gguf (modelo base) | no disponible | no disponible | no disponible | GGUF en Hugging Face | Modelo base sin el circuito invitado |
| millrace-ai/qwenpu-bonsai (versión parcheada CUDA v0.1.0) | no disponible | no disponible | no disponible | Hugging Face | Versión anterior con parche CUDA, según la model card |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: las capacidades demostradas se limitan a ejecutar un invitado de tres tokens y verificar su traza.
- Los tiempos de ejecución publicados (más de 14 horas para tres tokens) hacen inviable cualquier uso interactivo o en producción.
- Dependencia estricta de versiones concretas del runtime Prism (b9596 y b12128); no se garantiza funcionamiento con otras compilaciones.
- El paquete principal está orientado a Windows (lanzador incluido); la validación en Linux se documenta con el checkpoint b9596.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento multilingüe, al no tratarse de un modelo conversacional entrenado por el autor.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto incorpora componentes de terceros (Bonsai de Prism ML, circuito de QwenPU, stories260K de Karpathy) cuyos avisos deben respetarse según el archivo NOTICE.
- El checkpoint b12128 de 6,047 GB fue eliminado tras la verificación; solo se conserva el informe y el manifiesto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism
- Archivos del paquete: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/tree/stock-prism-b9596/stock-prism
- GGUF: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/resolve/stock-prism-b9596/stock-prism/Bonsai-27B-Q1_0-QwenPU-Stock-Prism-b9596.gguf
- Instrucciones de instalación y prueba: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/blob/stock-prism-b9596/stock-prism/README.md
- Avisos de distribución: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/blob/stock-prism-b9596/stock-prism/NOTICE
- Procedencia del invitado: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/blob/stock-prism-b9596/stock-prism/guests/README.md
- Informe de ejecución completa en Linux: https://huggingface.co/millrace-ai/qwenpu-bonsai-27b-stock-prism/blob/stock-prism-b9596/stock-prism/stock-mtp-vx-stories-three.json
- Documentación técnica: https://github.com/tim-osterhus/qwenpu-bonsai/blob/main/docs/STOCK-PRISM-RELEASE.md
- QwenPU: https://github.com/divagr18/QwenPU
- Binarios oficiales de Prism b9596: https://github.com/PrismML-Eng/llama.cpp/releases/tag/prism-b9596-9fcaed7
- Informe de prueba de humo en Windows: https://github.com/tim-osterhus/qwenpu-bonsai/blob/aefc7d348a794926d8804feda2c363fdfb668db9/results/forward/standard-layer/stock-mtp-vx-package-smoke.json
- Informe de prefijo en Windows: https://github.com/tim-osterhus/qwenpu-bonsai/blob/aefc7d348a794926d8804feda2c363fdfb668db9/results/forward/standard-layer/stock-mtp-vx-research.json
- Validación completa en Windows (b12128): https://github.com/tim-osterhus/qwenpu-bonsai/blob/main/results/forward/standard-layer/windows-stories260k/README.md
- Modelo base Bonsai-27B: https://huggingface.co/prism-ml/Bonsai-27B-gguf/tree/f10afb355f104535e3e3e98cf7ab7795c72bd292
- Model card original parcheada CUDA v0.1.0: https://huggingface.co/millrace-ai/qwenpu-bonsai
