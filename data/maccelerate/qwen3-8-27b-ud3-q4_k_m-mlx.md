# maccelerate/Qwen3.8-27B-UD3-Q4_K_M-MLX

## Resumen

Qwen3.8-27B-UD3-Q4_K_M-MLX es una reencodificación del modelo Qwen3.8-27B (27.320.697.856 parámetros) al formato MLX affine, publicada por el usuario maccelerate. No se trata de un modelo entrenado desde cero, sino de una conversión de cuantización: el asignador de anchos por tensor del checkpoint Unsloth Dynamic v3.0 se lee desde el GGUF oficial `UD-Q4_K_M` y se aplica sobre los pesos bf16 limpios del modelo original para producir un artefacto de 16,72 GB (8 shards SafeTensors) con 4,894 bits efectivos por peso cuantizado.

El interés principal es la ejecución local en Apple Silicon: el paquete conserva la cabeza MTP (Multi-Token Prediction) para decodificación especulativa y está pensado para el servidor `mlx-serve`, no para `mlx-lm` estándar. Según el autor, `mlx-lm` 0.31.3 puede cargar los ficheros pero genera salida corrupta, porque interpreta la presencia de pesos MTP como señal de que todas las normas del tronco deben ajustarse y aplica dos veces la transformación de Qwen3.8.

Es relevante para desarrolladores que quieran ejecutar un modelo de 27B en un Mac con memoria unificada sin salir del ecosistema Apple ni depender de llama.cpp, aceptando a cambio un ecosistema de despliegue mucho más reducido y sin paridad numérica garantizada con el GGUF de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No documentada explícitamente en la información disponible. El reparto de pesos incluye clases `GDN in-proj QKV`, `GDN out-proj`, `GDN in-proj Z`, `attention Q/K/V/O`, `MLP gate/up/down`, `MTP head`, `token embeddings` y estado SSM en bf16, lo que indica una topología híbrida de atención con componentes de tipo SSM/GDN |
| Parámetros totales | 27.320.697.856 (27,32B) |
| Parámetros activos | No aplica: no se documenta estructura MoE y el reparto de pesos cubre la totalidad de los 27,32B |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MLX affine mixta por tensor: 8 bits (106 tensores), 6 bits (30), 5 bits (131), 4 bits (228), 3 bits (11); 506 tensores cuantizados. Media de 4,894 bits por peso cuantizado. Normas, sesgos, pesos de convolución y estado SSM permanecen en bf16. Cuantización de caché KV a 8 bits disponible vía `--kv-quant 8` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos, GGUF de origen y código de conversión) |
| Formato de pesos | SafeTensors MLX, 8 shards, 16,72 GB, más `manifest.json` con hashes de shard y comprobaciones estructurales |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es un artefacto de conversión. El autor parte del checkpoint bf16 `Qwen/Qwen3.8-27B` (commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y del mapa de anchos por tensor del GGUF `Qwen3.8-27B-UD-Q4_K_M.gguf` de `unsloth/Qwen3.8-27B-GGUF` (SHA-256 `322e194ff79741c7baa497c240f677f54b201b0efab44ca8e50f122b39123482`). Cada tensor conserva exactamente la anchura que eligió el asignador Dynamic v3.0 de Unsloth; no se rederiva ni se usa el mapa de clases de Dynamic 2.0. Para los tensores de 4 y 8 bits la conversión usa el imatrix oficial (`imatrix_unsloth.gguf`) en una búsqueda ponderada por activaciones; los de 3, 5 y 6 bits pasan por `mx.quantize`, porque la ruta de empaquetado ponderado de MLX no implementa esas anchuras de salida.

El detalle estructural más relevante es la cabeza MTP, que se preserva íntegra (0,37B parámetros, 0,31 GB) y habilita decodificación especulativa en `mlx-serve`. Como el paquete es de anchura mixta, el perfil NAX MTP de anchura uniforme de `mlx-serve` no aplica y hay que usar el perfil genérico. La torre de visión del modelo original se omite de forma deliberada, por lo que el checkpoint es solo texto. Datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO): no disponibles en la información proporcionada.

## Capacidades

- Generación de texto y uso conversacional (etiquetas `text-generation` y `conversational` del repositorio).
- Decodificación especulativa mediante la cabeza MTP conservada, con soporte en el perfil genérico de `mlx-serve`.
- Inferencia local en Apple Silicon con cuantización de caché KV a 8 bits para reducir el consumo de memoria unificada.
- Ejecución como servidor de modelos vía `mlx-serve` apuntando a un directorio local.
- Capacidades heredadas del modelo base Qwen3.8-27B (razonamiento, código, matemáticas, multilingüismo, tool calling, agentes): no documentadas en la información disponible para este artefacto concreto.
- Visión: no soportada, la torre de visión se omite explícitamente en la conversión.
- Audio: no documentado.

## Casos de uso

- Asistente de código en local sobre Mac: el modelo se sirve con `mlx-serve` desde disco y permite autocompletado y refactorización sin enviar código a servicios externos, con la caché KV cuantizada a 8 bits para contener el uso de memoria unificada.
- Procesamiento de documentación privada: al ejecutarse íntegramente en el equipo, es adecuado para resumir y extraer información de contratos, informes o historiales clínicos donde no se permite salida de datos.
- Chat interactivo de baja latencia: la cabeza MTP conservada permite decodificación especulativa, lo que reduce el tiempo por token en conversaciones multi-turno frente a una decodificación autorregresiva convencional.
- Generación de texto por lotes en estaciones de trabajo Mac: el artefacto de 16,72 GB encaja en un Mac con memoria unificada amplia para tareas de redacción, clasificación y resumen en pipelines locales.
- Base para entornos de agentes en local: si el modelo base expone tool calling, la combinación con `mlx-serve` permite montar un bucle de agente que invoque herramientas locales (ficheros, shell, APIs internas) sin coste de API.
- Evaluación y prototipado de cuantizaciones: al reproducir exactamente la asignación por tensor del GGUF de Unsloth, sirve para comparar el comportamiento de la misma política de bits en dos runtimes distintos (MLX frente a llama.cpp).
- Despliegue en portátiles Apple Silicon para demos y entornos de viaje: no requiere GPU dedicada ni conexión de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con macOS. MLX no se ejecuta sobre CUDA ni ROCm, por lo que no hay soporte para GPU NVIDIA o AMD.
- Disco: al menos 17 GB para los ficheros del modelo, más espacio de trabajo durante la descarga.
- Memoria unificada: el artefacto pesa 16,72 GB; el consumo real depende además de la caché KV, la longitud de contexto y las peticiones concurrentes. El autor indica que no ha validado ninguna configuración mínima de memoria para esta build Q4, por lo que cualquier cifra concreta sería una estimación no confirmada.
- GPU recomendadas: no aplica en el sentido habitual; el equivalente es un chip Apple Silicon con memoria unificada suficiente (gama M-series Pro/Max/Ultra según el contexto y la concurrencia deseados).
- ¿Cabe en hardware de consumo? Sí, en Macs Apple Silicon con memoria unificada suficiente para alojar 16,72 GB de pesos más la caché KV; no es ejecutable en GPUs de consumo NVIDIA.
- Despliegue: `mlx-serve` es el runtime soportado, invocado como `mlx-serve --model /ruta/al/modelo --kv-quant 8`. `mlx-lm` estándar (0.31.3) carga los ficheros pero produce salida corrupta en decodificación voraz y no está soportado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| maccelerate/Qwen3.8-27B-UD3-Q4_K_M-MLX | 27,32B | No disponible | SafeTensors MLX, 16,72 GB, 4,894 bits efectivos | `mlx-serve` (no `mlx-lm`) | Apache-2.0 | 0 descargas, 0 likes; publicado el 2026-09-16 |
| unsloth/Qwen3.8-27B-GGUF (`UD-Q4_K_M`) | Mismo modelo base | No disponible | GGUF con la misma asignación por tensor | llama.cpp y derivados | Apache-2.0 | No disponible en la información proporcionada |
| Qwen/Qwen3.8-27B | 27,32B | No disponible | SafeTensors bf16 | Múltiples (vLLM, TGI, transformers) | No disponible en la información proporcionada | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Incompatibilidad con `mlx-lm` estándar: la versión 0.31.3 aplica por segunda vez la transformación de normas de Qwen3.8 al detectar pesos MTP, lo que corrompe la salida. El único runtime soportado es `mlx-serve`.
- Sin paridad numérica con el GGUF de origen: no es una conversión sin pérdida y el autor no reclama equivalencia con los códecs K-quant o IQ de llama.cpp. La coincidencia está en la anchura por tensor, no en los valores.
- Cuantización agresiva en parte del modelo: 11 tensores a 3 bits y 228 a 4 bits, con una media de 4,894 bits por peso; cabe esperar degradación en tareas sensibles a la precisión.
- Modelo solo texto: la torre de visión se omite deliberadamente, por lo que no hereda capacidades multimodales del modelo base.
- Sin benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni comparativas medidas que respalden el comportamiento cualitativo del artefacto.
- Idiomas soportados no documentados para esta conversión.
- Sin configuración mínima de memoria validada por el autor; el despliegue en máquinas con memoria unificada ajustada es experimental.
- Confianza y procedencia: el repositorio acumula 0 descargas y 0 likes y fue creado el 2026-09-16, sin validación independiente por parte de terceros. Existe un `manifest.json` con hashes, pero conviene verificar la cadena de procedencia antes de usarlo en producción.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; se heredan los del modelo base, no evaluados aquí.
- Licencia Apache-2.0 en pesos, GGUF de origen y código de conversión, lo que en principio permite uso comercial, sujeto a los términos y atribuciones de las model cards upstream.

## Enlaces

- Repositorio del modelo: https://huggingface.co/maccelerate/Qwen3.8-27B-UD3-Q4_K_M-MLX
- Modelo base bf16: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de origen (Unsloth Dynamic v3.0): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Runtime de inferencia mlx-serve: https://github.com/ddalcu/mlx-serve
- Conversor maccelerate: https://github.com/maccelerate-ai/maccelerate
- Nota de compatibilidad con mlx-lm: https://github.com/maccelerate-ai/maccelerate/blob/main/docs/qwen38-mlx-lm-compatibility.md
