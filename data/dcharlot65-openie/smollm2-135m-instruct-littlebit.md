# dcharlot65-openie/SmolLM2-135M-Instruct-LittleBit

## Resumen

`SmolLM2-135M-Instruct-LittleBit` es un checkpoint de pesos "vivos" (living weights) derivado del modelo instruct `HuggingFaceTB/SmolLM2-135M-Instruct` de Hugging Face, publicado por el usuario `dcharlot65-openie`. No es un modelo entrenado desde cero ni un fine-tuning convencional: es una refactorización del modelo base en un formato propietario denominado `.jsyn`, pensado para ser consumido por JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch desarrollada por el proyecto openIE.

La propuesta técnica consiste en aplicar una combinación de "LittleBit-2" (representación sub-1-bit por planos de bits) y "Sakana SVF" (presumiblemente una variante de factorización de pesos tipo SVD) para comprimir los 134,5 millones de parámetros del modelo base desde 256,57 MB en FP16 hasta 5,71 MB, lo que supone una ratio de compresión de 44,96x y un promedio de 0,2151 bits por peso. El resultado se empaqueta con zstd y CRC32.

El modelo es relevante únicamente como pieza de un ecosistema muy específico (JouleDB / JouleKube, orientado a despliegues Kubernetes-native y a inferencia de bajo consumo energético). No hay evidencia de evaluación de calidad, benchmarks ni datos de entrenamiento propios: el repo tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repositorio reportado es de 0,0 GB, lo que resulta inconsistente con el tamaño comprimido declarado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct); empaquetada en formato `.jsyn` con planos de bits 2D y vectores 1D |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base SmolLM2-135M-Instruct soporta 8.192 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | Sub-1-bit propietario (LittleBit-2 + Sakana SVF), 0,2151 BPW promedio; sin GGUF ni otras cuantizaciones estándar publicadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (comprimido con zstd + CRC32), consumible solo por JouleDB v0.2.3+ |
| Tensores 2D (planos de bits) | 211 |
| Vectores 1D (LayerNorm / bias) | 61 |
| Tamano equivalente FP16 | 256,57 MB |
| Tamano comprimido `.jsyn` | 5,71 MB (44,96x menor) |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros desarrollado por Hugging Face. Sobre esa base, el autor aplica un proceso de "pre-factorización" que combina dos técnicas: LittleBit-2, que representa los pesos como planos de bits de 2 dimensiones (211 tensores 2D en total), y Sakana SVF, que presumiblemente introduce una factorización de bajo rango sobre los pesos. Los 61 vectores 1D restantes corresponden a LayerNorm y biases, que se mantienen sin comprimir por planos.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset, ni sobre si hubo RLHF, DPO o cualquier etapa de alineamiento adicional. Tampoco se documenta el proceso de calibración o reconstrucción de pesos que requiere una compresión sub-1-bit de este tipo. La innovación declarada es exclusivamente de compresión y de runtime: el checkpoint está diseñado para ejecutarse en JouleDB, un motor de inferencia escrito en Rust (instalable vía `cargo binstall`) que no depende de PyTorch y que se presenta como "thermodynamic AI" y "Kubernetes-native".

## Capacidades

- Generación de texto instructiva, heredada del modelo base SmolLM2-135M-Instruct (que soporta diálogo multi-turno y seguimiento de instrucciones básico).
- Razonamiento y código: capacidades limitadas por el tamaño del modelo base (135M), sin datos específicos publicados para este checkpoint.
- Tool calling / function calling: no disponible de forma documentada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma documentada.
- Capacidades multilingües: no disponible; el modelo base está entrenado mayoritariamente en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución en runtime JouleDB mediante `db.hf_pull(...)` y servidor HTTP local.

## Casos de uso

- Despliegue en clústeres Kubernetes con restricciones severas de almacenamiento: el checkpoint de 5,71 MB permite distribuir el modelo en imágenes de contenedor o ConfigMaps sin necesidad de volúmenes persistentes grandes, lo que encaja con el enfoque JouleKube del proyecto.
- Inferencia en dispositivos de borde con memoria muy limitada: al ocupar menos de 6 MB en disco y no requerir PyTorch, puede ejecutarse en entornos embebidos o contenedores mínimos donde un modelo de 256 MB en FP16 no cabría.
- Pruebas de integración y CI/CD del propio runtime JouleDB: sirve como modelo de referencia ligero para validar el pipeline de `hf_pull`, descompresión zstd, verificación CRC32 y reconstrucción de pesos en cada release.
- Prototipado de asistentes conversacionales de baja latencia en inglés: para tareas de clasificación, extracción o respuesta corta donde la calidad de un modelo de 135M es suficiente.
- Investigación sobre compresión sub-1-bit: como artefacto reproducible para estudiar la pérdida de calidad al pasar de FP16 a 0,2151 BPW con la combinación LittleBit-2 + Sakana SVF.
- Demostraciones de "thermodynamic AI": escenarios de divulgación o benchmark energético donde se compara el consumo de un runtime Rust sin PyTorch frente a stacks convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de compresión (211 tensores 2D, 61 vectores 1D, 134.515.008 parámetros, 256,57 MB FP16, 5,71 MB comprimido, 44,96x, 0,2151 BPW) y no incluye MMLU, HumanEval, GSM8K ni ninguna evaluación de calidad o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo base (135M) y la compresión sub-1-bit, cabría en cualquier GPU consumer con varios GB libres, pero JouleDB no publica requisitos mínimos.
- GPU recomendadas: no disponible; el runtime JouleDB está escrito en Rust y no se documenta soporte CUDA, ROCm ni Metal en la información proporcionada.
- Compatibilidad con GPU consumer: previsiblemente sí (cualquier GPU con al menos 1-2 GB libres para el modelo descomprimido), aunque no está confirmado.
- Opciones de despliegue: exclusivamente JouleDB v0.2.3+ (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.jsyn` es propietario.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-LittleBit | 134.515.008 | no disponible | `.jsyn` (JouleDB) | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8.192 tokens | safetensors, GGUF | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparación relevante es contra el propio modelo base: LittleBit ocupa 44,96x menos espacio pero solo es ejecutable en JouleDB, mientras que SmolLM2-135M-Instruct original funciona en llama.cpp, Ollama, Transformers y vLLM con cuantizaciones estándar (Q4_K_M, Q8_0, etc.). Frente a Qwen2.5-0.5B o TinyLlama, la diferencia de tamaño es de un orden de magnitud, pero también lo es la capacidad del modelo.

## Limitaciones y advertencias

- No hay evaluación de calidad publicada: se desconoce cuánto degrada la compresión sub-1-bit (0,2151 BPW) las capacidades del modelo base. Es plausible una pérdida significativa de coherencia y precisión.
- Riesgo elevado de alucinación y errores factuales, inherente a un modelo de 135M de parámetros, agravado por la compresión extrema.
- Formato propietario `.jsyn`: no es interoperable con el ecosistema estándar (Transformers, llama.cpp, vLLM). Queda atado al runtime JouleDB y a su mantenimiento por parte del proyecto openIE.
- Idiomas: sin datos; el modelo base está orientado a inglés, por lo que el rendimiento en castellano será limitado.
- Licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero el runtime JouleDB tiene su propia licencia (no especificada en la información disponible).
- Señales de madurez del repositorio: 0 descargas, 0 likes, creado y actualizado el mismo día (2026-11-23), tamaño de repo reportado de 0,0 GB (inconsistente con los 5,71 MB declarados). No hay pipeline definido ni idiomas declarados.
- Ausencia de documentación sobre el proceso de calibración, reconstrucción de pesos y verificación de integridad más allá del CRC32.
- No apto para producción sin una validación empírica previa de la calidad de salida en la tarea concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/SmolLM2-135M-Instruct-LittleBit
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
