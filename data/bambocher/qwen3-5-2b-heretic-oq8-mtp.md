# bambocher/Qwen3.5-2B-heretic-oQ8-mtp

## Resumen

Qwen3.5-2B-heretic-oQ8-mtp es una version cuantizada y "decensored" del modelo Qwen/Qwen3.5-2B, publicada por el usuario bambocher en Hugging Face. El checkpoint combina tres intervenciones: una ablacion de rango arbitrario (ARA) aplicada con Heretic v2.0.0 para eliminar el comportamiento de rechazo, una cuantizacion mixta de precision realizada con oMLX v0.7.3 (formato oQ), y la conservacion intacta de la cabeza de prediccion multi-token (MTP) del modelo original.

El modelo tiene 2.274.069.824 parametros reales segun los safetensors, de los cuales 1.882B corresponden al modelo de lenguaje, 0.331B a la torre de vision y 0.061B a la cabeza MTP. El checkpoint ocupa 2.735 GB en disco (2.547 GiB de pesos efectivos) con una media efectiva de 9.623 bits por peso: un 85,033% de los pesos esta en affine 8-bit con grupo 64 y un 14,967% se mantiene en BF16.

Es relevante ahora porque demuestra un flujo completo de modificacion de un modelo multimodal pequeno (ablacion de rechazo + cuantizacion mixta + preservacion de cabezas auxiliares) en un unico artefacto listo para MLX, el framework de Apple. La model card reporta 0 rechazos sobre 100 prompts de prueba frente a 97 del modelo original, con una divergencia KL de 0.1397.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza de prediccion multi-token (MTP); pesos en MLX |
| Parametros totales | 2.274.069.824 (1.882B LM + 0.331B vision + 0.061B MTP) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 8-bit grupo 64 (85,033%) + BF16 (14,967%); media efectiva 9.623 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer multimodal que incluye una torre de vision de 0.331B parametros y una cabeza de prediccion multi-token de 0.061B, ademas del modelo de lenguaje de 1.882B. La cabeza MTP se conserva intacta en este checkpoint, lo que permite decodificacion especulativa multi-token si el runtime la soporta.

Sobre ese base se aplico Heretic v2.0.0, una herramienta de ablacion de comportamiento que modifica los pesos en un rango de capas (start_layer_index 12, end_layer_index 23) con parametros ARA concretos: preserve_good_behavior_weight 0.9189, steer_bad_behavior_weight 0.0008, overcorrect_relative_weight 0.9924 y neighbor_count 14. Posteriormente se cuantizo con oMLX v0.7.3 en precision mixta, manteniendo en BF16 el 14,967% de los pesos (probablemente capas sensibles y componentes auxiliares) y llevando el resto a affine 8-bit con grupo 64. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en el modelo de lenguaje de 1.882B parametros.
- Procesamiento de vision gracias a la torre visual de 0.331B parametros incluida en el checkpoint.
- Prediccion multi-token (MTP) para decodificacion especulativa, con la cabeza de 0.061B intacta.
- Comportamiento sin rechazos: la model card reporta 0/100 rechazos frente a 97/100 del modelo original.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint esta en formato MLX y ocupa 2.735 GB, por lo que cabe en equipos con 8 GB o mas de memoria unificada y se ejecuta de forma nativa con mlx-lm.
- Prototipado de asistentes multimodales: la torre de vision de 0.331B permite experimentar con entrada de imagen y texto en un modelo de menos de 3 GB.
- Investigacion sobre alineacion y decensoring: los parametros ARA documentados (capas 12-23, pesos de preservacion y correccion) permiten reproducir y comparar el efecto de la ablacion sobre el comportamiento de rechazo.
- Evaluacion de decodificacion especulativa: la cabeza MTP intacta sirve para medir ganancias de throughput en runtimes que soporten prediccion multi-token.
- Pruebas de cuantizacion mixta: la distribucion 8-bit/BF16 con media de 9.623 bits/peso es un caso de estudio para comparar calidad frente a cuantizaciones uniformes de 8 y 4 bits.
- Despliegue en entornos con memoria limitada: al ser un modelo de 2.274B parametros y 2.8 GB de repo, encaja en dispositivos edge o portatiles sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-2B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1397 | 0 (por definicion) |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 2.8 GB para cargar el checkpoint completo (2.547 GiB de pesos); con overhead de runtime, prever 3-4 GB.
- Cabe en GPUs de consumo: si, en cualquier GPU con 4 GB o mas de VRAM; tambien en memoria unificada de Apple Silicon desde 8 GB.
- GPUs recomendadas: el formato es MLX, por lo que el objetivo principal son los chips Apple M-series; para CUDA seria necesario convertir los pesos a otro formato.
- Opciones de despliegue: mlx-lm y el ecosistema oMLX (libreria declarada: mlx). vLLM, llama.cpp, Ollama y TGI no soportan directamente el formato oQ/MLX de este checkpoint sin conversion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-oQ8-mtp | 2.274B | no disponible | safetensors MLX (oQ mixta) | no disponible | Sin rechazos (0/100), MTP intacta |
| Qwen/Qwen3.5-2B | no disponible | no disponible | safetensors | no disponible | Modelo base; 97/100 rechazos |
| Alternativas de ~2B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La ablacion de rechazo elimina el comportamiento de rechazo (0/100), lo que implica que el modelo puede generar contenido que el modelo original filtraria; requiere moderacion externa en produccion.
- La divergencia KL de 0.1397 respecto al original indica un cambio medible en la distribucion de salida, con posible degradacion en tareas generales no evaluadas.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base Qwen3.5-2B antes de desplegar.
- Idiomas soportados no documentados; el rendimiento fuera del ingles y chino (idiomas tipicos de la familia Qwen) es incierto.
- Longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad, sin issues reportados y con una unica actualizacion (re-cuantizacion el 2026-11-12).
- Formato MLX/oQ: no es portable directamente a vLLM, llama.cpp u Ollama; limita el despliegue a entornos Apple o requiere conversion.
- Riesgo de alucinacion inherente a un modelo de 2B parametros, agravado por la cuantizacion mixta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ8-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
