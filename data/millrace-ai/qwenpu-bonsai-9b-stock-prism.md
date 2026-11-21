# millrace-ai/qwenpu-bonsai-9b-stock-prism

## Resumen

`millrace-ai/qwenpu-bonsai-9b-stock-prism` es un checkpoint de investigación publicado en Hugging Face que combina el modelo ternario Bonsai 2 9B (desarrollado por Prism ML) con el emulador de CPU RISC-V QwenPU, creado por Divyansh Agrawal. El resultado es un GGUF de 4,5 GB que ejecuta un circuito RV32 con extensiones vectoriales dentro del bloque MTP (multi-token prediction) del transformer, preservando los 427 tensores de lenguaje originales en cuantización PQ2_0 y los signos Hadamard del modelo base.

El modelo no es un LLM convencional pensado para producción: es una demostración de que es posible alojar un emulador de CPU completo dentro de los pesos de un transformer y hacerlo funcionar como huésped de un programa externo (las historias de `stories260K` de Andrej Karpathy) mientras el modelo base sigue generando texto. La validación se ha realizado sobre Windows con Prism b12128 y una GTX 1080 de 8 GiB.

Su relevancia es experimental: explora técnicas de acoplamiento entre circuitos compilados y bloques de predicción multi-token, y sirve como banco de pruebas para arquitecturas híbridas que mezclan cómputo simbólico con inferencia neuronal. La licencia es Apache 2.0, y el modelo base se distribuye en formato GGUF con arquitectura declarada `qwen35`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35` con bloque MTP que aloja un circuito QwenPU RV32 + vectorial |
| Parametros totales | 13.538.207.234 elementos de tensor en el GGUF combinado (445 tensores); 8.953.803.264 en el host de lenguaje base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados en la cabecera del GGUF |
| Tipos de cuantizacion | PQ2_0 (cuantización ternaria empaquetada del modelo base); el checkpoint se distribuye como GGUF ya cuantizado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Bonsai-2-9B-PQ2_0-QwenPU-Stock-Prism.gguf`, 4.500.267.552 bytes, SHA-256 `01ea2741eae025dd7f5c2731d23091c989fa69f056c2c7f52cea08b2b275a688`) |

## Arquitectura y entrenamiento

El modelo parte del Bonsai 2 9B en formato GGUF, un transformer con ancho oculto de 4.096 y 20.480 filas FFN por bloque, cuantizado en PQ2_0 (ternario empaquetado con signos Hadamard). Sobre esa base, el checkpoint inserta un bloque MTP adicional que ejecuta el circuito QwenPU: un núcleo RV32 con extensiones vectoriales que ocupa 4.052 de las 4.096 lanes residuales y 19.952 de las 20.480 filas FFN, dejando relleno neutro donde la forma compartida lo exige. El layout final son 32 bloques de lenguaje más 1 bloque MTP con el circuito compilado.

No hay información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO). El autor indica que el checkpoint se ha creado con la herramienta Bonsai de Prism ML y que la validación en tiempo de ejecución es específica de Prism b12128, por lo que portarlo a otros runtimes requiere soporte de PQ2_0 y de las APIs de feedback y caché del bloque MTP. La innovación técnica principal es el acoplamiento entre el huésped (el modelo de lenguaje) y el invitado (el programa RV32 emulado), que intercambian peticiones de caché y acciones a través de las APIs MTP estándar.

## Capacidades

- Generación de texto autoregresiva a través del host Bonsai 2 9B (arquitectura `qwen35`).
- Emulación de un núcleo RISC-V RV32 con extensiones vectoriales dentro del bloque MTP.
- Ejecución de programas invitados compilados para RV32; validado con los pesos de `stories260K` de Andrej Karpathy exportados vía QwenPU.
- Intercambio de estado entre huésped e invitado: posición de texto, caché KV, estado recurrente y logits se mantienen sincronizados con el 9B empaquetado original.
- Soporte de mutación de coeficientes activos (verificado en los fixtures: una mutación cambió el primer fetch hasta restaurar el coeficiente).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información.

## Casos de uso

- Investigación en arquitecturas híbridas neuro-simbólicas: usar el checkpoint como banco de pruebas para estudiar cómo un circuito compilado puede alojarse en un bloque MTP sin degradar la generación de texto del modelo base.
- Reproducción de experimentos de emulación RISC-V sobre transformers: el launcher `Run.ps1` permite capturar trazas acotadas (por ejemplo, hasta el retiro 2.578) y compararlas con una referencia CPU independiente, útil para validar portes a otros runtimes.
- Validación de runtimes de inferencia: sirve para comprobar que un fork de llama.cpp (en este caso Prism b12128) implementa correctamente PQ2_0, las APIs de feedback MTP y la gestión de caché física.
- Docencia y divulgación técnica: el caso de `stories260K` imprimiendo `Once upon a` desde dentro de un LLM es un ejemplo didáctico de separación huésped/invitado y de sincronización de estado.
- Pruebas de regresión de cuantización ternaria: los hashes de traza normalizada y de estado vectorial final permiten comparar ejecuciones entre hosts (se documentan cuatro hosts Windows b12128).
- Auditoría de seguridad de modelos empaquetados: el checkpoint incluye verificación de hashes de GGUF, ELF, observer, probe y DLLs del runtime, lo que facilita reproducir y auditar el binario ejecutado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento documentados son de la validación del circuito, no del modelo de lenguaje:

| Metrica | Valor |
|---|---|
| Tiempo de captura (tres tokens completos) | 10 h 10 min 31 s |
| Decodificaciones del invitado | 6.365.239 |
| Velocidad de decodificación del invitado | 174,0 decodificaciones/s |
| VRAM dedicada al proceso (pico) | 4,94 GiB |
| Memoria compartida de GPU (pico) | 86 MiB |
| VRAM total del dispositivo (pico) | 6,27 GiB |
| RAM del proceso (pico) | 4,64 GiB |
| Retiros arquitectónicos verificados (run completo) | 37.080 |
| Operaciones VMAT verificadas (run completo) | 726 |
| Retiros verificados (run acotado) | 2.578 |
| Ventana de historia medida | 625,74 s para 102.398 decodificaciones |
| VRAM total del dispositivo en ventana (pico) | 5,69 GiB |
| VRAM dedicada al proceso en ventana (pico) | 5.059 MiB |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6,3 GiB de VRAM total del dispositivo en el run completo validado; 4,94 GiB dedicados al proceso.
- GPU validadas: NVIDIA GTX 1080 de 8 GiB (única GPU documentada en la evidencia).
- Cabe en GPU de consumo: sí, al menos en GTX 1080; no se documentan pruebas en RTX 3090, RTX 4090, A100 ni H100.
- RAM del sistema: pico de 4,64 GiB de working set del proceso.
- Opciones de despliegue: runtime Prism b12128 (fork de llama.cpp) en Windows con CUDA 12.4; el autor indica que portar el checkpoint requiere soporte de PQ2_0 y de las APIs de feedback y caché MTP. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: 174,0 decodificaciones/s del invitado en la GTX 1080; 102.398 decodificaciones en 625,74 s en la ventana de historia medida. No se reporta throughput del modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers con circuitos RISC-V embebidos en bloques MTP). El modelo base `prism-ml/Ternary-Bonsai-2-9B-gguf` es el punto de referencia directo, pero no se ofrecen métricas comparativas de calidad de lenguaje.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe explícitamente como tal; no está pensado para uso en producción.
- Validación restringida a Prism b12128 en Windows con CUDA 12.4; otros runtimes requieren soporte de PQ2_0 y de las APIs MTP.
- Una sola GPU documentada (GTX 1080); no hay evidencia de comportamiento en otras arquitecturas.
- Tiempos de captura muy elevados (más de 10 horas para tres tokens completos), lo que desaconseja su uso interactivo.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- No se documentan evaluaciones de sesgo, alucinación ni calidad de generación del modelo base.
- El repositorio incluye binarios y DLLs de un fork de llama.cpp; la ejecución implica confiar en hashes publicados y en el runtime de terceros.
- Aunque la licencia del checkpoint es Apache 2.0, los componentes base (Bonsai, QwenPU) conservan sus propios términos en los avisos y licencias incluidos; conviene revisarlos antes de un uso comercial.
- El recuento de parámetros del Hub (13.538.207.234) incluye relleno cero y el circuito compilado, por lo que no debe interpretarse como tamaño efectivo del modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/millrace-ai/qwenpu-bonsai-9b-stock-prism
- GGUF del checkpoint: https://huggingface.co/millrace-ai/qwenpu-bonsai-9b-stock-prism/resolve/main/Bonsai-2-9B-PQ2_0-QwenPU-Stock-Prism.gguf
- Modelo base (pin): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/tree/82265ccc78ddaac4700286a35e9badcc32376dd9
- GGUF base concreto: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-PQ2_0.gguf
- Repositorio del proyecto: https://github.com/tim-osterhus/qwenpu-bonsai
- Evidencia de ejecución completa en Windows: evidence/story-three-token-windows.json (dentro del repo HF)
- Evidencia de ventana acotada: evidence/story-window-verification.json (dentro del repo HF)
- Evidencia de fixtures: evidence/fixtures.json (dentro del repo HF)
- Evidencia de tiempos: evidence/story-window.json (dentro del repo HF)
- Snapshot de medidas en cuatro hosts: https://github.com/tim-osterhus/qwenpu-bonsai/blob/d1bdc3f10e405494ee59f0f05262d2f476ac1204/results/forward/standard-layer/evidence-snapshot.json
- QwenPU (pin): https://github.com/divagr18/QwenPU/tree/6e2767aaa59b69ea03300c0a5199d7b36debbe50
- Runtime Prism b12128 (Windows CUDA 12.4): https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip
- Runtime CUDA de llama.cpp: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/cudart-llama-bin-win-cuda-12.4-x64.zip
