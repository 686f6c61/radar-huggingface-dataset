# Harsha001/Inkling-2-Small-StrixHalo-GGUF

## Resumen

Inkling 2 Small es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Thinking Machines. La versión aquí descrita es una cuantización GGUF no oficial creada por el usuario Harsha001, específicamente optimizada para ejecutarse en una máquina AMD Strix Halo con 128 GB de memoria unificada. El modelo original es un MoE de 594B parámetros totales con 384 expertos por capa (8 activos por token), lo que lo sitúa en la categoría de modelos de gran escala con activación dispersa.

El problema que resuelve esta build concreta es el de hacer viable un modelo de 366 GiB en hardware consumer de gama alta con memoria unificada, mediante una combinación agresiva de poda de expertos (se conservan 307 de 384 por capa) y cuantización de 1 bit (IQ1_S) para los expertos enrutados. El resto de componentes (atención, router, convoluciones cortas) se mantiene en Q8_0 o F32, y los embeddings y la capa de salida en Q6_K, lo que preserva la calidad en las partes críticas del modelo.

Es relevante ahora porque demuestra que es posible ejecutar modelos de escala 594B en una única máquina con 128 GB de memoria unificada, aunque con una pérdida de calidad significativa (perplejidad de 5,08 frente a 3,52 del original). La build está etiquetada como primera versión de prueba, solo verificada en CPU y pendiente de validación en hardware AMD real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con 384 expertos por capa, 8 activos por token; incluye atención con sesgo de posición relativa y convoluciones cortas |
| Parámetros totales | 475.977.614.712 (≈476B según safetensors del modelo base; la model card del cuantizador menciona 594B para el original) |
| Parámetros activos | 8 expertos de 384 por token (no se especifica el número exacto de parámetros activos) |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantización | IQ1_S para expertos enrutados; Q8_0 o F32 para atención, router y convoluciones; Q6_K para embeddings y capa de salida |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres partes: 46,0 GB + 45,8 GB + 6,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 384 expertos por capa y 8 expertos activos por token, lo que permite un ratio de activación muy bajo (aproximadamente 2,08% de los expertos por token). La arquitectura incluye atención con sesgo de posición relativa (relative position bias) y convoluciones cortas, según se desprende de la descripción de la build. El modelo original incluye además un codificador de visión y un drafter de predicción multi-token, que no están incluidos en esta cuantización (es solo texto).

El proceso de cuantización aplicado por Harsha001 combina poda de expertos y cuantización extrema. Se conservaron 307 de los 384 expertos por capa (se eliminaron 77, un 20%), seleccionados por frecuencia de enrutamiento sobre 71.000 tokens de texto de calibración (`calibration_datav3`), lo que preserva el 97% de los tokens enrutados. Los expertos restantes se cuantizaron a IQ1_S (aproximadamente 1,3 bits por peso), mientras que el resto de componentes se mantuvo en Q8_0, F32 o Q6_K. Se utilizó una importance matrix generada sobre el GGUF de referencia con el mismo texto de calibración. Los expertos NVFP4 originales llevan una escala por experto que se conserva como tensor `.scale` separado y se aplica en tiempo de ejecución. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y continuaciones de texto plano (verificado con decodificación greedy en la model card).
- Razonamiento aritmético básico: el modelo resolvió correctamente 17 × 23 = 391 con un breve razonamiento interno.
- Generación de código: se le pidió una función de Fibonacci y planificó una versión iterativa, aunque no completó la respuesta dentro del límite de 300 tokens del test.
- Modo de pensamiento (thinking): el modelo produce borradores de razonamiento antes de responder, visibles en las pruebas de chat y código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; las pruebas de calidad se hicieron solo con texto en inglés (wikitext-2).
- Capacidades de visión: no incluidas en esta build (el codificador de visión del original fue eliminado).
- Predicción multi-token: no incluida en esta build (el drafter del original fue eliminado).

## Casos de uso

- Experimentación con modelos de gran escala en hardware consumer: la build permite ejecutar un MoE de ~476B parámetros en una única máquina AMD Strix Halo con 128 GB, algo imposible con el modelo original de 366 GiB. Adecuado para investigadores que quieran estudiar el comportamiento de modelos masivos sin acceso a clústeres multi-GPU.
- Pruebas de concepto de asistentes conversacionales locales: con `llama-server` y `--jinja`, el modelo puede gestionar conversaciones multi-turno en local, útil para prototipos de atención al cliente o asistentes personales donde la privacidad impide usar APIs en la nube.
- Evaluación de técnicas de poda de expertos: el repositorio incluye `keep-experts-E307.json` con los expertos conservados por capa, lo que permite reproducir, comparar o refinar la estrategia de poda por frecuencia de enrutamiento frente a alternativas como REAP.
- Generación de código en entornos con restricciones de red: aunque el modelo no completó la función de Fibonacci en 300 tokens, puede usarse para autocompletado y generación de código en estaciones de trabajo aisladas, aceptando latencias mayores que las de modelos más pequeños.
- Investigación sobre cuantización extrema: la model card documenta comparativas detalladas entre distintas combinaciones de tipos de cuantización y número de expertos (IQ1_S, IQ1_M, IQ2_XXS) con métricas de perplejidad, KL y coincidencia de token superior, lo que lo convierte en un caso de estudio para quienes investigan compresión de modelos.
- Razonamiento aritmético y matemático básico en local: el modelo resolvió correctamente una multiplicación de dos cifras con verificación interna, adecuado para tareas educativas o de cálculo simple donde no se requiere precisión de nivel competitivo.
- Benchmarking de hardware AMD (Vulkan/ROCm): la build está pensada para que la comunidad reporte rendimiento en Strix Halo, sirviendo como banco de pruebas para medir throughput y latencia de modelos MoE cuantizados en GPUs integradas AMD.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad de la cuantización medidas con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en inglés, en CPU:

| Build | Tamaño | Perplejidad | KL a referencia | Mismo token superior |
|---|---:|---:|---:|---:|
| Pesos originales (expertos NVFP4, referencia no publicada) | 366 GiB | 3,52 | — | — |
| **Esta build: IQ1_S, 307 expertos por capa** | 92 GiB | 5,08 | 0,36 | 79,7% |
| IQ1_M gate/up + IQ2_XXS down, 259 expertos | ~92 GiB | No disponible | 0,37 | 79,2% |
| IQ1_M, 275 expertos | ~92 GiB | No disponible | 0,37 | 78,7% |
| IQ2_XXS, 233 expertos | ~92 GiB | No disponible | 0,39 | 79,0% |
| IQ1_M, 275 expertos elegidos por REAP | ~92 GiB | No disponible | 0,51 | 75,7% |
| IQ1_M con los 384 expertos (no cabe en 128 GB) | 126 GiB | No disponible | 0,23 | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas evaluaciones cualitativas son las tres pruebas con decodificación greedy descritas en la model card (texto plano, chat y código).

## Requisitos de hardware

- VRAM/memoria estimada: 92 GiB para los pesos (98,5 GB en disco). Se recomienda configurar el reparto de memoria del BIOS para que la GPU pueda acceder a unos 110 GiB.
- GPU recomendadas: AMD Strix Halo con 128 GB de memoria unificada (hardware objetivo de esta build). No se ha validado en otras GPUs.
- ¿Cabe en GPU consumer? Solo en soluciones con memoria unificada de 128 GB como Strix Halo. No cabe en GPUs consumer discretas convencionales (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: exclusivamente `llama-server` de la build ROCmFPX `main` (desde el 15 de noviembre de 2026) con soporte Vulkan. Ninguna otra build de llama.cpp reconoce la arquitectura `inkling2`. Ejemplo: `llama-server -m IQ1_S-E307/Inkling-2-Small-StrixHalo-IQ1_S-E307-00001-of-00003.gguf -ngl 99 -c 8192 --jinja`.
- Latencia y throughput: no disponibles. La model card indica que solo se ha probado en CPU y pide a la comunidad que reporte velocidad en Vulkan o ROCm. Se advierte de que esta primera versión usa atención no flash con sesgo de posición relativa, lo que requiere más memoria y tiempo para prompts largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| **Inkling 2 Small (esta build GGUF)** | ~476B totales (MoE, 8/384 activos) | No disponible | Apache 2.0 | Hugging Face, 1.421 descargas | Cuantización no oficial IQ1_S con poda de expertos; solo texto |
| Inkling 2 Small (original, Thinking Machines) | ~476B totales (MoE) | No disponible | Apache 2.0 | Hugging Face (`thinkingmachines/Inkling-2-Small`) | 366 GiB, incluye visión y drafter multi-token; no cabe en 128 GB |
| IQ1_M con todos los expertos (misma familia) | ~476B totales | No disponible | Apache 2.0 | No publicada como repo independiente | 126 GiB, KL 0,23; no cabe en máquinas de 128 GB |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~500B con cuantización extrema para hardware consumer) en la documentación proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad significativa: la perplejidad sube de 3,52 a 5,08 y solo el 79,7% de los tokens superiores coinciden con la referencia. La propia model card califica la pérdida como "grande" (~1,3 bits por peso y un 20% de expertos eliminados).
- Eliminación de capacidades: no incluye el codificador de visión ni el drafter de predicción multi-token del modelo original; es exclusivamente texto.
- Validación incompleta: solo se ha probado en CPU; no hay confirmación de que funcione en Vulkan o ROCm en hardware AMD real. La coincidencia con el modelo PyTorch original es de ~1e-5 en un modelo de prueba pequeño.
- Dependencia de software no estándar: requiere la build ROCmFPX `main` de HarshaVardhan3002; ninguna otra build de llama.cpp soporta la arquitectura `inkling2`.
- Atención no flash: esta primera versión usa atención plana con sesgo de posición relativa, lo que incrementa el consumo de memoria y el tiempo con prompts largos.
- Sesgos conocidos: no disponibles. Las métricas de calidad se midieron solo con texto en inglés de Wikipedia, por lo que no hay datos sobre rendimiento en código, tool use u otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; la poda de expertos y la cuantización de 1 bit pueden incrementarlo respecto al modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser una build no oficial, el autor original (Thinking Machines) no la respalda. Verificar la licencia del modelo base antes de uso en producción.
- Build de prueba: el autor advierte que es una primera versión y que podría ser reemplazada por una build mejorada. No es una release oficial.
- Configuración de memoria delicada: HIP/ROCm solo asigna desde la parte dedicada de la memoria, por lo que un reparto 64/64 del BIOS es insuficiente; se necesita ajustar el split para que la GPU alcance ~110 GiB.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/Harsha001/Inkling-2-Small-StrixHalo-GGUF
- Modelo base en Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Repositorio ROCmFPX (build necesaria): https://github.com/HarshaVardhan3002/ROCmFPX
- Build destacada del mismo autor (DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
- Archivo de expertos conservados: `keep-experts-E307.json` (incluido en el repositorio de la build)
