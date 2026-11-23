# Inaba2Meguru/DiffusorRT-Android-Qwen3-MDLM-0.6B-V79

## Resumen

DiffusorRT para Android · Qwen3-MDLM-0.6B es un paquete de ejecución compilado para desplegar el modelo Qwen3-0.6B en su variante de difusión MDLM (Masked Diffusion Language Model) sobre la NPU Hexagon V79 del SoC Qualcomm Snapdragon 8 Elite (SM8750). Lo publica el usuario Inaba2Meguru y deriva del checkpoint `dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1`, que conserva la autoría original. No es un checkpoint de Transformers al uso, sino un artefacto de inferencia empaquetado para una aplicación Android concreta (DiffusorRT), con binarios de contexto `qnn.htp` generados con QAIRT 2.45.0.260326.

El modelo subyacente parte de la arquitectura Qwen3 con 0,6 mil millones de parámetros, adaptada a decodificación por difusión de máscaras en lugar de generación autorregresiva token a token. El paquete incluye los pesos en FP16, la tarjeta de modelo de la app (`phone.json`) y los activos del tokenizador (`bpe.json`), todo dentro del directorio `package/`. Su relevancia reside en que ejemplifica el despliegue de modelos de difusión de lenguaje en hardware móvil de gama alta, ejecutando la inferencia en la NPU en lugar de la CPU o la GPU.

La licencia es Apache 2.0 y el repositorio ocupa 4,4 GB. El uso previsto declarado es chat y "Polish" (reescritura de un fragmento seleccionado mediante difusión). Los binarios de contexto solo funcionan en la NPU de ese SoC específico, por lo que no es un modelo portable a otros dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 adaptado a difusión de máscaras (MDLM); decodificación no autorregresiva |
| Parametros totales | 0,6 mil millones (600M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos en FP16); binarios de contexto QNN para NPU Hexagon |
| Idiomas soportados | no disponible (la model card menciona chat y "Polish" como tareas, no idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binarios de contexto QNN (`qnn.htp`) para Hexagon V79, más `phone.json` y `bpe.json`; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B en su variante de difusión MDLM publicada por dllm-hub. En lugar de generar tokens de forma autorregresiva, un MDLM enmascara tokens y los reconstruye de forma iterativa mediante un proceso de difusión sobre secuencias enmascaradas, lo que permite refinar un span completo en paralelo. Esta variante se emplea en la app para chat y para la reescritura de un fragmento seleccionado ("Polish"), aprovechando la naturaleza bidireccional del proceso de difusión.

El paquete de este repositorio no contiene información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO; esos detalles pertenecen al checkpoint upstream `dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1` y no se reproducen aquí. La innovación técnica destacable es la compilación del modelo a binarios de contexto QNN (QAIRT 2.45.0.260326) para ejecutarse en la NPU Hexagon V79 del Snapdragon 8 Elite, con pesos en FP16.

## Capacidades

- Generación de texto mediante difusión de máscaras (MDLM), no autorregresiva.
- Chat conversacional en la app DiffusorRT.
- Reescritura de un fragmento seleccionado ("Polish") mediante difusión sobre el span seleccionado.
- Ejecución en NPU Hexagon V79 (Snapdragon 8 Elite, SM8750) mediante binarios de contexto QNN.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Chat en dispositivo móvil: la app DiffusorRT integra el paquete para mantener conversaciones en el teléfono, ejecutando la inferencia en la NPU Hexagon V79 y evitando el envío de datos a la nube.
- Reescritura de texto seleccionado ("Polish"): el usuario selecciona un fragmento y el modelo lo regenera mediante difusión, útil para edición rápida en aplicaciones de escritura o correo.
- Asistentes de escritura offline: al ejecutarse localmente en el SoC, permite sugerencias y reescritura sin conexión de red.
- Prototipado de modelos de difusión de lenguaje en móvil: sirve como referencia para evaluar MDLM de 0,6B en NPU Qualcomm frente a decodificación autorregresiva.
- Integración en apps Android mediante `android-pack.json`: el desarrollador fija un commit del repositorio y lee las rutas, tamaños y SHA-256 de cada archivo para colocarlos en `Android/data/ai.diffusorrt.phone/files/models/qwen3-mdlm-v79/`.
- Evaluación de latencia y comportamiento en hardware móvil: útil para medir el rendimiento de la difusión de máscaras en la NPU frente a CPU/GPU en el mismo dispositivo.
- Distribución empaquetada para despliegue: el paquete incluye tarjeta de modelo (`phone.json`) y tokenizador (`bpe.json`), lo que simplifica la puesta en marcha en la app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de hardware, cuando se reportan, son específicos del dispositivo y del prompt.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo se ejecuta en la NPU Hexagon V79, no en GPU.
- GPU recomendadas: no aplica; los binarios de contexto QNN solo se ejecutan en la NPU del SoC Qualcomm Snapdragon 8 Elite (SM8750, Hexagon V79).
- Compatibilidad con GPU de consumo: no; no está pensado para RTX 4090 ni similares, sino para el SoC móvil indicado.
- Opciones de despliegue: app DiffusorRT para Android con binarios de contexto QNN (QAIRT 2.45.0.260326); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; dependen del dispositivo y del prompt según la propia model card.
- Tamaño del paquete: 4,4 GB en total (4,40 GB según `android-pack.json`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiffusorRT Android Qwen3-MDLM-0.6B (este) | 0,6B | no disponible | Binarios QNN para Hexagon V79 | Apache 2.0 | Hugging Face, solo NPU SM8750 |
| dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1 (upstream) | 0,6B | no disponible | Checkpoint de difusión | no disponible | Hugging Face |
| Qwen3-0.6B (autorregresivo original) | 0,6B | no disponible | safetensors, GGUF (comunidad) | Apache 2.0 | Hugging Face |

La comparativa se limita a estos tres por falta de datos publicados de benchmarks y de contexto en la información disponible.

## Limitaciones y advertencias

- Los binarios de contexto solo se ejecutan en la NPU del Snapdragon 8 Elite (SM8750, Hexagon V79); no son portables a otros SoC ni a GPU de escritorio.
- No es un checkpoint de Transformers: no puede cargarse directamente con `transformers`, vLLM ni llama.cpp.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- El rendimiento depende del dispositivo y del prompt; no se han publicado cifras reproducibles.
- El uso comercial está permitido por la licencia Apache 2.0, pero los derechos del checkpoint upstream pertenecen a sus autores originales (dllm-hub), que conservan sus derechos.
- Para integración en la app es necesario fijar un commit del repositorio y verificar los SHA-256 de cada archivo según `android-pack.json`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Qwen3-MDLM-0.6B-V79
- Modelo base upstream: https://huggingface.co/dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1
- Revisión upstream referenciada: https://huggingface.co/dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1/tree/c8d24a3f4adaeef46881b450e1bf7d1005203bd7
