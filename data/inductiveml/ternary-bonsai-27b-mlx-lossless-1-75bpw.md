# inductiveML/Ternary-Bonsai-27B-mlx-lossless-1.75bpw

## Resumen

Ternary Bonsai 27B es un modelo de lenguaje basado en la arquitectura Qwen3.5 con pesos ternarios, desarrollado originalmente por prism-ml y convertido a formato MLX por inductiveML en esta variante lossless de 1,75 bits por peso. El modelo resuelve el problema del footprint de memoria en despliegues locales sobre Apple Silicon: almacena los mismos pesos ternarios que el checkpoint oficial de 2 bits, pero en un formato compactado que reduce el almacenamiento de 8,49 GB a 5,89 GB sin pérdida alguna de fidelidad. La relevancia actual radica en que demuestra que la densidad de inteligencia (capacidad por byte desplegado) puede alcanzar el límite teórico de la representación ternaria sin sacrificar exactitud.

La arquitectura es un transformer con cuantización ternaria TQ1_G128, donde cada grupo de 128 pesos se codifica en 28 bytes. Aunque el nombre sugiere 27 mil millones de parámetros, el checkpoint safetensors contiene 5.675.462.144 parámetros, resultado de la compresión ternaria de los pesos originales. La licencia es Apache 2.0 y el modelo está diseñado exclusivamente para ejecución en chips Apple Silicon mediante kernels Metal personalizados, sin des-cuantizar pesos en buffers de tamaño completo durante la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con pesos ternarios TQ1_G128 |
| Parametros totales | 5.675.462.144 (en safetensors; el nombre 27B refiere al modelo original sin cuantizar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria, 1,75 bits por peso (TQ1_G128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una re-encodificacion, no un re-entrenamiento. Parte del checkpoint oficial de Ternary Bonsai 27B en formato GGUF y re-encodifica los pesos ternarios al formato TQ1_G128, donde cada grupo de 128 pesos ternarios se almacena en 28 bytes: dos bytes FP16 para la escala, 25 bytes de base 3 (cinco trits por byte) y un byte final con tres trits. Esta codificacion es bit-exacta respecto al origen: los 26.893.352.960 pesos ternarios distribuidos en 498 tensores cuantizados coinciden sin ninguna discrepancia, y los 210.104.320 grupos de escala tampoco presentan diferencias. La ejecucion se realiza mediante kernels Metal personalizados que operan directamente sobre el almacenamiento compactado, evitando la des-cuantizacion en buffers del tamano del modelo. La arquitectura subyacente es Qwen3.5, con soporte de modo thinking segun la model card del proyecto Bonsai.

## Capacidades

- Generacion de texto con modo conversacional (pipeline text-generation).
- Soporte de chat template mediante `apply_chat_template` de mlx-lm.
- Modo thinking activable para razonamiento profundo, segun la model card de Bonsai.
- Salida greedy token-identica al checkpoint oficial de 2 bits (verificado en 576/576 tokens).
- Fidelidad logit: argmax identico en 343 posiciones probadas, con divergencia KL maxima de 4,8×10⁻⁵ nats.
- No incluye torre de vision: es un artefacto solo texto, a diferencia del checkpoint GGUF que puede cargar un mmproj separado.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Inferencia local en MacBooks con memoria unificada limitada: el modelo ocupa 5,89 GB en vivo, por lo que cabe en equipos de 16 GB junto con el sistema operativo y otras aplicaciones.
- Despliegue de asistentes conversacionales en entornos Apple Silicon donde el espacio en disco y la RAM compartida son criticos, por ejemplo en laboratorios de investigacion con parques de Mac mini o MacBook Pro.
- Evaluacion de densidad de inteligencia: permite medir la relacion capacidad/byte en un artefacto que alcanza el minimo teorico de la representacion ternaria, util para investigacion en compresion de modelos.
- Generacion de texto reproducible: al ser bit-identico al checkpoint oficial, sirve como referencia para validar pipelines de inferencia sin depender del formato original.
- Prototipado rapido en entornos con restricciones de descarga: el repositorio pesa 5,9 GB, frente a los 8,49 GB del checkpoint MLX oficial, lo que reduce el tiempo de descarga y el espacio en cache.
- Pruebas de integracion en CI/CD para aplicaciones que requieren un modelo de lenguaje local en macOS, aprovechando la licencia Apache 2.0 que permite uso comercial sin restricciones de atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card del proyecto Bonsai referencia un promedio de 80,49 sobre 15 benchmarks en modo thinking, que se hereda exactamente en este artefacto por ser bit-identico al checkpoint oficial. La tabla de densidad de inteligencia compara este despliegue con alternativas:

| Despliegue | Pesos en disco | Benchmark medio | Densidad (1/GB) |
|---|---|---|---|
| Qwen3.6-27B FP16 | 54 GB | 85,07 | 0,051 |
| Qwen3.6-27B IQ2_XXS ("2-bit") | 9,4 GB | 72,73 | 0,199 |
| Bonsai, oficial mlx-2bit | 8,49 GB | 80,49 | 0,278 |
| Bonsai, oficial llama.cpp Q2_0 | 7,17 GB | 80,49 | 0,329 |
| Bonsai, este repositorio | 5,89 GB | 80,49 | 0,400 |

Los benchmarks no se han re-ejecutado en este repositorio; la puntuacion se hereda por identidad de pesos y salida token-identica. Dos de los 15 benchmarks ejercitan la torre de vision, que este artefacto no incluye.

## Requisitos de hardware

- Apple Silicon con 16 GB o mas de memoria unificada (los pesos ocupan 5,5 GB en disco y la generacion mantiene ~5,9 GB en vivo).
- GPU integrada del chip Apple Silicon; las mediciones se realizaron en un MacBook Pro M4 Max con 40 nucleos GPU y 48 GB de RAM.
- Software: Python con mlx-lm >= 0.31.3. En versiones posteriores a 0.31.3 se requiere `--trust-remote-code` (o `trust_remote_code=True`) porque el checkpoint incluye codigo de arquitectura propio (`ternel_packed_model.py`).
- Rendimiento medido frente al checkpoint oficial mlx-2bit: generacion de tokens a 0,89-0,96× y procesamiento de prompt a 0,64-0,87×, en las mismas condiciones.
- Opciones de despliegue: CLI de mlx-lm (`mlx_lm.generate`) o API Python (`load` y `generate` de mlx-lm). No se documenta soporte para vLLM, llama.cpp u Ollama en esta variante.

## Comparativa con modelos similares

| Modelo | Bits/peso | Peso en disco | Memoria viva | Velocidad relativa | Licencia |
|---|---|---|---|---|---|
| prism-ml/Ternary-Bonsai-27B-mlx-2bit (oficial) | 2,25 | 8,49 GB | 7,57 GB | 1× (referencia) | Apache 2.0 |
| prism-ml/Ternary-Bonsai-27B-gguf (llama.cpp Q2_0) | 2,125 | 7,17 GB | No disponible | No disponible | Apache 2.0 |
| inductiveML/Ternary-Bonsai-27B-mlx-lossless-1.75bpw (este) | 1,75 | 5,89 GB | 5,89 GB | 0,64-0,96× | Apache 2.0 |

Frente a Qwen3.6-27B en FP16 o IQ2_XXS, este modelo ofrece un benchmark medio superior (80,49 frente a 85,07 y 72,73 respectivamente) con un footprint muy inferior, aunque la comparacion no es directa porque Qwen3.6-27B no es ternario.

## Limitaciones y advertencias

- Rendimiento inferior al checkpoint oficial: la generacion es entre un 4% y un 11% mas lenta, y el procesamiento de prompt entre un 13% y un 36% mas lento. Si la velocidad es prioritaria, se recomienda usar la version oficial de 2 bits.
- Exclusivo de Apple Silicon: no funciona en GPUs NVIDIA, AMD ni en CPUs x86 convencionales, al depender de kernels Metal.
- Solo texto: no incluye la torre de vision del checkpoint GGUF original; los benchmarks que requieren vision no son aplicables a este artefacto.
- Requiere confiar en codigo remoto: el checkpoint incluye un archivo de arquitectura personalizado (`ternel_packed_model.py`) que se ejecuta via `trust_remote_code`. Esto implica un riesgo de seguridad si el repositorio se ve comprometido.
- Sin datos de idiomas soportados: la model card no especifica que idiomas cubre, aunque al estar basado en Qwen3.5 probablemente herede su soporte multilingue, pero no esta verificado.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas de sesgos ni de tasa de alucinacion para este despliegue; se heredan los del modelo base Qwen3.5 sin analisis adicional.
- No es un modelo entrenado desde cero: es una conversion de formato; cualquier limitacion del modelo original (por ejemplo, en razonamiento o conocimiento factual) se mantiene intacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inductiveML/Ternary-Bonsai-27B-mlx-lossless-1.75bpw
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Checkpoint oficial MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-mlx-2bit
- Repositorio Ternel (metodologia y codigo): https://github.com/inductiveML/ternel
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
