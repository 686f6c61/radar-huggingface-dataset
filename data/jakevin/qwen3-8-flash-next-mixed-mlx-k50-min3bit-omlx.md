# Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX

## Resumen

Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX es una distribución cuantizada y podada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Jakevin. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales en FP8 a un formato MLX con precisión mixta (3 y 4 bits) y con poda del 50 % de los expertos enrutados. Su objetivo es hacer viable la inferencia de un modelo MoE de aproximadamente 91 200 millones de parámetros en Apple Silicon con memoria unificada moderada, mediante el runtime oMLX.

El modelo conserva 256 de los 512 expertos enrutados en cada una de las 48 capas, y recuantiza todos los expertos desde los pesos FP8 originales con RTN (round-to-nearest) y cuantización afín de MLX con grupo de tamaño 64, escalas y sesgos en bf16. De las 48 capas, 32 usan expertos a 3 bits y 16 a 4 bits, con las anchuras por capa documentadas en `config.json`. Los pesos no pertenecientes a expertos, el tokenizador, la plantilla de chat y los fragmentos PLE se mantienen sin cambios respecto a la build K50-oMLX.

La relevancia de esta ficha radica en que ejemplifica una tendencia práctica: adaptar modelos MoE grandes a hardware de consumo mediante poda de expertos más cuantización agresiva, aceptando una degradación medible de la fidelidad de salida a cambio de un consumo de memoria contenido (unos 34,8 GB de pico en MLX según el autor) y una velocidad de decodificación de aproximadamente 8 tok/s en un Mac mini M4 Pro de 64 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer (familia Qwen3.8-Flash-Next, layout `qwen4_exp`); 48 capas con 512 expertos enrutados originales |
| Parámetros totales | 91 214 343 235 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos en 3 bits (32 capas) y 4 bits (16 capas), afín MLX, grupo 64, escalas y sesgos bf16; pesos no expertos sin recuantizar respecto a K50-oMLX |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (MLX), con `SHA256SUMS` para verificación; requiere runtime oMLX y `qwen4_exp` |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo transformer con 48 capas y 512 expertos enrutados por capa, del que esta build conserva 256 expertos por capa (el 50 %). No se ha realizado entrenamiento adicional: la transformación consiste en poda de expertos y recuantización de los pesos restantes desde FP8 a precisión mixta MLX mediante RTN. Los pesos no expertos, el tokenizador, la plantilla de chat y los fragmentos PLE (probablemente componentes de embeddings o de atención lineal, aunque el autor no lo detalla) se heredan sin cambios de la build K50-oMLX, hoy retirada.

La innovación técnica principal es la combinación de poda estructurada de expertos con cuantización mixta por capa y un runtime específico (oMLX, con el módulo `qwen4_exp` y MTP desactivado). El autor reporta el error relativo de los pesos de los expertos: 0,195 a 3 bits y 0,094 a 4 bits en esta build, frente a 0,467 y 0,321 respectivamente en la build K50-oMLX. No se incluyen pesos MTP, por lo que debe ejecutarse con MTP deshabilitado. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y generación de código: el autor evalúa explícitamente con un conjunto de 15 prompts de programación, lo que sugiere uso previsto en tareas de código.
- Generación de prosa: el autor menciona prompts de prosa en su protocolo de evaluación, aunque no reporta resultados para ellos en esta build.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card incluye texto en chino (已下架) pero no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon con memoria unificada de 64 GB: el modelo está empaquetado para oMLX y cabe con un pico de aproximadamente 34,8 GB, lo que permite ejecutarlo en un Mac mini M4 Pro sin GPU dedicada.
- Asistencia de programación en local: el autor mide una concordancia top-1 de 0,892 en 15 prompts de código frente a la build de referencia, lo que lo hace adecuado para autocompletado y generación de fragmentos donde no se requiere fidelidad bit a bit.
- Prototipado de aplicaciones conversacionales sin conexión: al ser un modelo de texto con plantilla de chat incluida, puede integrarse en interfaces de chat locales para pruebas de concepto con datos sensibles que no deben salir del equipo.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia práctica para investigadores que quieran medir el impacto de la poda de expertos y la precisión mixta en la calidad de salida.
- Generación de documentación técnica y prosa: el modelo base es de propósito general y esta build incluye prompts de prosa en su protocolo de evaluación, aunque los resultados no se han publicado.
- Despliegue en estaciones de trabajo con presupuesto de memoria ajustado: frente a la build ternary (unos 15 GB sin caché pero mucho más lenta), esta versión prioriza velocidad (unos 8 tok/s) sobre el mínimo consumo de memoria.

## Benchmarks y rendimiento

| Métrica | Esta build | K50-oMLX | Referencia |
|---|---|---|---|
| Error relativo de pesos de expertos a 3 bits | 0,195 | 0,467 | no aplica |
| Error relativo de pesos de expertos a 4 bits | 0,094 | 0,321 | no aplica |
| Concordancia top-1 en 15 prompts de código | 0,892 | 0,856 | build GSQ-RCO Q2 sin podar (no el modelo FP8) |
| Concordancia top-1 en 32 prompts (según tabla comparativa del autor) | 0,840 | no disponible | build GSQ-RCO Q2 sin podar |
| Velocidad de decodificación (Mac mini M4 Pro, 64 GB) | mediana 8,0 tok/s | no disponible | no aplica |
| Pico de memoria MLX | ~34,8 GB | no disponible | no aplica |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de concordancia no son directamente comparables entre builds porque el autor usó referencias y conjuntos de prompts distintos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico de aproximadamente 34,8 GB en MLX según el autor; en la sección de resultados se cita también un pico de 35,4 GB. El repositorio ocupa 65,7 GB en disco.
- GPU recomendadas: Apple Silicon con memoria unificada de 64 GB (probado en Mac mini M4 Pro). No se han probado máquinas de 16 GB.
- ¿Cabe en GPU de consumo? No hay datos para GPUs NVIDIA de consumo; el formato MLX está orientado a Apple Silicon. Para CUDA habría que reconvertir los pesos.
- Opciones de despliegue: oMLX con el runtime `qwen4_exp` (MTP desactivado), cargando con el Python incluido en la aplicación y `OMLX_QWEN4_PLE_MODE=mmap`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 8,0 tok/s en decodificación en Mac mini M4 Pro 64 GB; la sección de resultados menciona 4–5 tok/s, lo que indica variabilidad según la medición. No hay datos de latencia de prefill.

## Comparativa con modelos similares

| Modelo | Poda / cuantización | Tamaño en disco | Memoria pico | Velocidad | Runtime |
|---|---|---|---|---|---|
| Esta build (min3bit-oMLX) | 256/512 expertos; 32 capas a 3 bits, 16 a 4 bits | 65,7 GB | ~34,8 GB | ~8,0 tok/s | oMLX out of the box |
| Qwen3.8-Flash-Next-mixed-mlx-K50 | 256/512 expertos; expertos ternarios convertidos a 2 bits afín | 60,0 GB | ~23,3 GB RSS | 5,28–5,85 tok/s | Runner C++ de moe-offload |
| Qwen3.8-Flash-Next-ternary-mlx-K50 | 256/512 expertos; ternario | 54 GB | ~22,5 GB con caché; 15,0 GB sin caché | 3,8–4,0 tok/s con caché | Loader Python propio |

No se dispone de comparación con modelos de otros autores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad medible: la concordancia top-1 frente a la referencia es de 0,840–0,892, no de 1,0; no es equivalente al modelo FP8 original.
- La referencia usada para medir la concordancia es la build GSQ-RCO Q2 sin podar, no el modelo FP8, por lo que la fidelidad real frente al original es desconocida.
- Los prompts de prosa no se evaluaron; solo se corrieron 15 de los 32 prompts planificados.
- No incluye pesos MTP; debe ejecutarse con MTP desactivado, lo que puede afectar al rendimiento en decodificación especulativa.
- Requiere el runtime oMLX y el layout `qwen4_exp`; no es portable directamente a vLLM, llama.cpp u otros motores sin reconversión.
- No se ha probado en máquinas con 16 GB de memoria unificada.
- Licencia `qwen-community-1.0` (etiquetada como `other`): es necesario revisar los términos antes de uso comercial; no se detallan restricciones en la información disponible.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; son heredados del modelo base, no evaluados por el autor.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.
- Longitud de contexto no disponible; no se debe asumir la del modelo base sin confirmación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build mixed-mlx-K50: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50
- Build ternary-mlx-K50: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50
- Repositorio del runner C++: https://github.com/Jakevin/moe-offload/tree/main/mlx-qwen38/cpp
