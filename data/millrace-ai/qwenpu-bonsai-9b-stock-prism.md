# millrace-ai/qwenpu-bonsai-9b-stock-prism

## Resumen

Bonsai 2 9B + QwenPU on stock Prism es un checkpoint de investigación publicado por millrace-ai que integra el emulador RISC-V QwenPU (RV32 con extensión vectorial) dentro del bloque MTP de un modelo Bonsai 2 9B empaquetado en formato PQ2_0. El modelo base es `prism-ml/Ternary-Bonsai-2-9B-gguf`, un transformer ternario de aproximadamente 9.000 millones de parámetros del que se conservan los 427 tensores de lenguaje originales y los signos Hadamard. El resultado es un artefacto experimental que ejecuta circuitos RV32 como parte del proceso de decodificación, más que un modelo de lenguaje convencional orientado a producción.

El checkpoint mantiene el formato GGUF con cuantización PQ2_0 y un tamaño de repositorio de 4,5 GB. La validación de runtime está atada a la build Prism b12128 de llama.cpp: la captura acotada se detuvo en el retiro arquitectónico 2.578 y coincidió con la referencia de CPU en todos los retiros, incluyendo la primera multiplicación de matrices y ocho operaciones VMAT. La validación completa de tres tokens sobre stories260K está pendiente según el autor.

Su relevancia es fundamentalmente investigadora: demuestra que es posible alojar una máquina virtual RISC-V vectorial dentro del bloque MTP de un transformer ternario empaquetado, con verificación de estado recurrente, caché KV y logits respecto al modelo original. No obstante, los tiempos medidos (625,74 segundos para 102.398 decodificaciones en una GTX 1080) y la ausencia de benchmarks estándar lo alejan de cualquier uso práctico como modelo de chat o generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario empaquetado (Bonsai 2) con circuito QwenPU RV32 + vectorial embebido en el bloque MTP |
| Parametros totales | 13.538.207.234 (según metadatos de safetensors); el modelo base se denomina "9B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ2_0 (empaquetado ternario, 427 tensores de lenguaje preservados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (4.500.267.552 bytes; SHA-256 `01ea2741eae025dd7f5c2731d23091c989fa69f056c2c7f52cea08b2b275a688`) |

## Arquitectura y entrenamiento

El modelo parte de Bonsai 2 9B, un transformer con pesos ternarios empaquetados en formato PQ2_0 y transformación Hadamard aplicada a los pesos. Sobre esa base, el checkpoint inserta el circuito QwenPU (RV32 con extensión vectorial) en el bloque MTP, utilizando 4.052 de las 4.096 líneas residuales y 19.952 de las 20.480 filas FFN, con relleno neutro donde la forma compartida lo requiere. El invitado ejecuta los pesos stories260K de Andrej Karpathy mediante la exportación vectorial de QwenPU, y las acciones y peticiones de caché seleccionadas por el modelo se retransmiten a través de las APIs MTP estándar.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO; el proceso de creación no es un entrenamiento convencional, sino una integración de circuitos sobre un modelo ya empaquetado. La innovación técnica principal es la convivencia de un emulador RISC-V con el bucle de decodificación del transformer, manteniendo el estado recurrente, la caché KV y los logits idénticos al modelo original en la ventana validada. La verificación incluyó siete handoffs de historial coincidente y una prueba de mutación de coeficiente activo que alteró el primer fetch hasta restaurar el coeficiente.

## Capacidades

- Ejecución de circuitos RV32 con extensión vectorial dentro del bloque MTP del transformer.
- Emulación del invitado stories260K de Karpathy mediante la exportación vectorial de QwenPU.
- Preservación de los 427 tensores de lenguaje originales del modelo Bonsai 2 9B.
- Coincidencia verificada de posición de texto, caché KV, estado recurrente y logits con el modelo empaquetado original en la ventana acotada.
- Soporte de handoffs de historial coincidente (siete fixtures validados).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües no disponibles.

## Casos de uso

- Investigación en emulación RISC-V sobre transformers: el checkpoint permite estudiar cómo un circuito RV32 vectorial interactúa con el bucle de decodificación de un modelo ternario, sirviendo como banco de pruebas para arquitecturas híbridas.
- Validación de portabilidad de runtimes: la captura acotada en Windows con Prism b12128 y la réplica independiente en CPU permiten verificar la corrección de ports de llama.cpp frente a una referencia determinista.
- Reproducción de experimentos de cuantización ternaria: al preservar los 427 tensores PQ2_0 y los signos Hadamard, es útil para estudiar el impacto del empaquetado ternario en la fidelidad de logits.
- Docencia y divulgación sobre arquitecturas híbridas: el proyecto en GitHub y las evidencias JSON (story-window-verification, fixtures, timing) ofrecen material reproducible para explicar la integración de máquinas virtuales en modelos de lenguaje.
- Pruebas de estrés de memoria en GPU consumer: las mediciones de 5,69 GiB de VRAM total y 5.059 MiB dedicados en una GTX 1080 sirven para calibrar presupuestos de memoria en despliegues con cuantización agresiva.
- Auditoría de determinismo en inferencia: la comparación de retiros arquitectónicos entre GPU y CPU permite construir pipelines de verificación de kernels CUDA en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente métricas de validación de runtime:

| Metrica | Valor |
|---|---|
| Retiros arquitectonicos validados | 2.578 (coincidentes con referencia CPU) |
| VMAT ejecutados | 8 |
| Primer matmul verificado en retiro | 1.677 |
| Decodificaciones en ventana de historia | 102.398 |
| Tiempo de ventana de historia | 625,74 s |
| VRAM total del dispositivo (pico) | 5,69 GiB |
| VRAM dedicada al proceso (pico) | 5.059 MiB |
| Memoria GPU compartida | 86 MiB |
| Celdas F16 asignadas | 65.536 |
| GPU de validacion | GTX 1080 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,7 GiB en el pico medido con 65.536 celdas F16 asignadas (validado en GTX 1080).
- GPU recomendadas: GTX 1080 (única validada por el autor); no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, al menos en GTX 1080 con 8 GB de VRAM.
- Opciones de despliegue: exclusivamente la build Prism b12128 de llama.cpp para Windows con CUDA 12.4; requiere soporte PQ2_0 y las APIs de feedback y caché MTP.
- Latencia y throughput: 102.398 decodificaciones en 625,74 segundos (aproximadamente 163,6 decodificaciones por segundo) en GTX 1080.
- Dos lanzamientos completos previos se detuvieron durante el arranque de CUDA, según el autor.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers ternarios con emulación RISC-V embebida). El modelo base `prism-ml/Ternary-Bonsai-2-9B-gguf` podría servir como referencia, pero no se dispone de sus especificaciones completas ni de benchmarks para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Validación incompleta: la validación de tres tokens sobre stories260K está pendiente según el autor; la salida de historia y el handoff al final de la carga completa permanecen abiertos.
- Dependencia estricta de runtime: el port requiere soporte PQ2_0 y las APIs de feedback y caché MTP de Prism b12128; otras builds de llama.cpp no son compatibles.
- Plataforma limitada: la validación se realizó únicamente en Windows con CUDA 12.4 y una GTX 1080.
- Inestabilidad observada: dos lanzamientos completos previos se detuvieron durante el arranque de CUDA.
- Rendimiento muy bajo para uso práctico: 625,74 segundos para 102.398 decodificaciones implica un throughput de aproximadamente 163 decodificaciones por segundo, insuficiente para aplicaciones interactivas.
- Sin benchmarks estándar publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de calidad de generación.
- Idiomas soportados no documentados.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero los componentes base (Bonsai de Prism ML, QwenPU de Divyansh Agrawal y los pesos stories260K de Karpathy) conservan sus propios términos recogidos en los avisos y licencias incluidos.
- Checkpoint de investigación: no está pensado para producción ni para tareas de generación de texto convencionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/millrace-ai/qwenpu-bonsai-9b-stock-prism)
- [Modelo base Bonsai 2 9B (pinned)](https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/tree/82265ccc78ddaac4700286a35e9badcc32376dd9)
- [QwenPU (GitHub)](https://github.com/divagr18/QwenPU/tree/6e2767aaa59b69ea03300c0a5199d7b36debbe50)
- [Proyecto qwenpu-bonsai (GitHub)](https://github.com/tim-osterhus/qwenpu-bonsai)
- [Aplicación Prism b12128 Windows CUDA 12.4](https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip)
- [Runtime CUDA 12.4](https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/cudart-llama-bin-win-cuda-12.4-x64.zip)
- [Evidencia de ventana de historia](evidence/story-window-verification.json)
- [Evidencia de fixtures](evidence/fixtures.json)
- [Evidencia de tiempos](evidence/story-window.json)
