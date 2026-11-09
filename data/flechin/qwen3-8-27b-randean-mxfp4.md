# flechin/Qwen3.8-27B-Randean-MXFP4

## Resumen

Qwen3.8-27B-Randean-MXFP4 es un ajuste fino del modelo Qwen3.8-27B de Alibaba, publicado por el usuario flechin bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text (acepta imagen y texto como entrada) distribuido en formato MXFP4, una cuantización de 4 bits de punto flotante con escala compartida por bloques, junto con pesos AWQ y Quark heredados del checkpoint base de AMD. El autor lo describe como un modelo "alineado con la realidad y sin hedging", entrenado con un pipeline propio de QLoRA nativo en MXFP4 más ORPO sobre una única GPU AMD Radeon AI PRO R9700 de 32 GB.

El problema que declara resolver no es el de los modelos "sin censura" al uso, sino el de eliminar el sesgo de aprobación introducido por el RLHF comercial: las respuestas ambiguas del tipo "por un lado / por otro lado", la complacencia social y la aceptación de premisas falsas. El autor sostiene que anclar el bloque `<think>` en reducción conceptual jerárquica y en el principio de identidad mejora simultáneamente la detección de falacias, la generación de código y el razonamiento eficiente. Estas afirmaciones proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

El checkpoint safetensors declara 15.606.149.872 parámetros (unos 15,6 mil millones), un dato que no coincide con el "27B" del nombre comercial ni con el modelo base citado; conviene tratarlo con cautela. El repositorio ocupa 19,8 GB y el modelo se distribuye únicamente en pesos MXFP4 para transformers, sin versiones GGUF publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-27B; tag `qwen3_5` |
| Parametros totales | 15.606.149.872 (segun safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de servicio con `--max-model-len 32768`); no se declara la ventana nativa del modelo base |
| Tipos de cuantizacion | MXFP4 (4 bits, escala de bloque compartida), AWQ, Quark; pesos de 8 bits segun tag; KV cache en fp8_e4m3 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); no hay GGUF publicado |

## Arquitectura y entrenamiento

El modelo parte de `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`, una versión cuantizada por AMD del Qwen3.8-27B original, y conserva la arquitectura transformer multimodal del base con capacidad de procesar imagen y texto. Sobre ese checkpoint, el autor aplica un entrenamiento de ajuste con QLoRA nativo en MXFP4 combinado con ORPO (Odds Ratio Preference Optimization), ejecutado en una sola GPU AMD Radeon AI PRO R9700 de 32 GB con arquitectura `gfx1201` (ROCm). El pipeline se presenta como "nativo OCP MXFP4", es decir, los adaptadores se entrenan directamente sobre los pesos cuantizados en 4 bits sin descomprimir a precisión completa.

La innovación declarada es de tipo conductual más que arquitectónica: el autor afirma que el ajuste ancla el razonamiento en el bloque `<think>` mediante "enraizamiento perceptivo", reducción conceptual jerárquica y el principio de identidad, con el objetivo de eliminar el hedging y la aceptación de premisas falsas. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni los hiperparámetros del ORPO. La model card menciona decodificación especulativa mediante DFlash2 (modelo borrador `syvai/Qwen3.8-27B-DFlash2-W4A16`, 15 tokens especulativos) como opción de despliegue de alto rendimiento, no como parte del entrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso con bloque `<think>` explícito, compatible con el parser de razonamiento `qwen3` de vLLM.
- Generación de código: el autor reporta 98,8% de pass@1 en HumanEval y 95% en tareas de codificación verificada con ejecución en terminal.
- Matemáticas y lógica simbólica: 97% de exact match en GSM8K y 96% en el bloque de matemáticas, física y lógica simbólica de la suite propia.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), aunque no se detallan tareas de visión específicas ni benchmarks asociados.
- Tool calling y function calling: soportado vía `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml` en vLLM; el autor reporta 93,3% en pruebas de tool calling multi-turno y paralelo.
- Comportamiento anti-sycophancy y anti-hedging: rechazo declarado de premisas falsas y de respuestas ambiguas, medido en la suite adversarial propia (96,7%).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Moderación y verificación de premisas falsas: el modelo está entrenado explícitamente para detectar y rechazar afirmaciones incorrectas en la pregunta, lo que lo hace adecuado para asistentes que deben corregir al usuario en lugar de acomodarse a su premisa.
- Asistencia en revisión de código en CI/CD: con 98,8% en HumanEval y soporte de tool calling, puede integrarse en pipelines que ejecutan tests, interpretan la salida de terminal y proponen parches verificados.
- Razonamiento matemático y simbólico en entornos educativos o de auditoría: el bloque `<think>` permite inspeccionar la cadena de razonamiento y el modelo rinde en GSM8K y en tareas de física y lógica simbólica.
- Agentes multi-paso con herramientas: la puntuación declarada en tool calling multi-turno y paralelo (93,3%) lo hace utilizable en orquestadores que encadenan llamadas a APIs.
- Análisis de documentos con imagen y texto: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o formularios junto con instrucciones textuales, aunque la model card no detalla el rendimiento en visión.
- Despliegue en hardware AMD con ROCm: el pipeline está pensado y probado en una Radeon AI PRO R9700 de 32 GB, lo que lo convierte en una opción para entornos que no quieren depender de CUDA.
- Evaluación de calidad epistémica de otros modelos: la suite propia de 84 preguntas con trampas adversariales puede reutilizarse como arnés de evaluación de hedging en respuestas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card; ninguno está verificado de forma independiente.

| Benchmark | Qwen3.8-27B-MXFP4 (stock) | Randean-MXFP4 | Delta |
|---|---|---|---|
| BullshitBench v2 (100 trampas), media sobre 2,0 | 1,7300 (82% verde) | 1,9600 (98% verde) | +0,2300 |
| HumanEval pass@1 | 96,2% (77/80) | 98,8% (79/80) | +2,6% |
| GSM8K exact match (CoT) | 98,0% (98/100) | 97,0% (97/100) | -1,0% |
| IFEval prompt-level strict accuracy | 90,0% | 90,0% | 0,0% |
| Suite propia 90 tareas, precisión global | no disponible | 95,6% (86/90) | no disponible |
| Suite epistemológica 84 preguntas, puntuación global | no disponible | 77,4% | no disponible |
| Suite epistemológica, trampas adversariales largas | no disponible | 86,9% | no disponible |

Desglose de la suite propia de 90 tareas:

| Pilar | Stock | Randean | Delta |
|---|---|---|---|
| Matemáticas, física y lógica simbólica (25 tareas) | 88,0% (22/25) | 96,0% (24/25) | +8,0% |
| Codificación verificada y ejecución en terminal (20 tareas) | 100,0% (20/20) | 95,0% (19/20) | -5,0% |
| Tool calling multi-turno y paralelo (15 pruebas) | 86,7% (13/15) | 93,3% (14/15) | +6,6% |
| Anti-hedging adversarial y falso equilibrio (30 trampas) | 93,3% (28/30) | 96,7% (29/30) | +3,4% |

El autor cita como referencia externa Claude Opus 4.6 con 1,9300 en BullshitBench v2, Qwen3.5-397B con 1,7033 y Qwen3-Max con 1,5667. También declara una reducción del 12,6% en la longitud de las trazas `<think>` y un throughput de 96,2 tok/s con decodificación especulativa DFlash2. No se han publicado resultados de MMLU ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 19,8 GB en MXFP4; con KV cache en fp8_e4m3 y contexto de 32.768 tokens, el autor indica que cabe en una GPU de 32 GB.
- GPU recomendadas: AMD Radeon AI PRO R9700 de 32 GB (entorno de referencia, ROCm `gfx1201`); cualquier GPU con 32 GB o más de VRAM y soporte de la cuantización Quark en vLLM.
- GPU de consumo: no hay confirmación de funcionamiento en RTX 4090 (24 GB) ni en GPUs de 16 GB; el peso de 19,8 GB más la caché KV deja poco margen en 24 GB.
- Opciones de despliegue: vLLM con `--quantization quark`, `--trust-remote-code`, `--kv-cache-dtype fp8_e4m3`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`. No se documenta soporte de llama.cpp, Ollama ni TGI, y no hay GGUF publicado.
- Throughput: 96,2 tok/s declarados con decodificación especulativa DFlash2 (modelo borrador W4A16, 15 tokens especulativos). Sin decodificación especulativa no se proporciona cifra.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Randean-MXFP4 | 15,6B (safetensors) | 32.768 (config. de servicio) | 98,8% | 97,0% | Apache 2.0 | HF, solo MXFP4 |
| Qwen3.8-27B-MXFP4 (stock) | no disponible | no disponible | 96,2% | 98,0% | Apache 2.0 | HF |
| Qwen3.5-397B | 397B (nominal) | no disponible | no disponible | no disponible | no disponible | citado como referencia en BullshitBench v2 |
| Claude Opus 4.6 | no disponible | no disponible | no disponible | no disponible | propietaria | API |

La comparación con Qwen3.5-397B y Claude Opus 4.6 se limita a la puntuación de BullshitBench v2 citada por el autor (1,7033 y 1,9300 frente a 1,9600). No hay datos públicos comparables de MMLU, contexto o licencia para esas referencias en la información disponible.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index); las suites "Randean" y "BullshitBench v2" son de autoría propia o poco extendidas, lo que limita la comparabilidad.
- El número de parámetros del safetensors (15,6B) no coincide con el "27B" del nombre ni con el modelo base citado; conviene verificar el checkpoint antes de usarlo en producción.
- El ajuste ORPO sobre comportamiento anti-hedging puede aumentar la tasa de rechazo de premisas legítimas o producir respuestas excesivamente asertivas en dominios con incertidumbre real.
- No se documentan idiomas soportados; el entrenamiento parece centrado en inglés y no hay evidencia de rendimiento en castellano.
- No hay versión GGUF ni cuantizaciones de menor tamaño, lo que restringe el despliegue a GPUs de 32 GB o más con soporte de Quark en vLLM.
- El pipeline de referencia depende de ROCm y de una GPU AMD concreta; el soporte en otras plataformas no está documentado.
- El modelo base es multimodal, pero no se aportan benchmarks de visión; el rendimiento en tareas de imagen es desconocido.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de calibración más allá de la suite epistemológica propia.
- Aunque la licencia es Apache 2.0, los términos del modelo base Qwen3.8-27B deben respetarse en uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flechin/Qwen3.8-27B-Randean-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint cuantizado de AMD: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Modelo borrador para decodificación especulativa: https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
- Paper, blog o repositorio del ajuste: no disponible en la información proporcionada.
