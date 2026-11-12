# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ3e-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ3e-mtp es una cuantizacion mixta del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario scottlowry. Se trata de un checkpoint de 180.000 millones de parametros logicos comprimido mediante la herramienta oQ (oMLX v0.7.4.dev1) hasta un promedio efectivo de 4,114 bits por peso para el checkpoint completo (3,762 bits/peso si se excluye la tabla de embeddings N-gram). El resultado ocupa 86,213 GiB en disco y esta empaquetado en formato MLX con safetensors, orientado a inferencia en hardware Apple Silicon.

El modelo conserva la estructura del base: un language model de 125.744B parametros, una tabla de embeddings N-gram de 51.200B, un modulo de vision de 0.449B y una cabeza MTP (multi-token prediction) de 2.607B. La presencia de vision y MTP sugiere un modelo multimodal con decodificacion especulativa nativa, aunque la model card no aporta detalles sobre arquitectura interna, datos de entrenamiento ni capacidades funcionales.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion mixta granular (combinacion de 3, 4 y 8 bits con distintos tamanos de grupo) que permite reducir un modelo de 180B a menos de 90 GiB; por otro, advierte de que se trata de un artefacto con cero descargas, sin licencia declarada y sin documentacion tecnica mas alla de las tablas de cuantizacion, por lo que su evaluacion en produccion exige cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del base ukisai/Swift1.5-Qwen3.8-Flash-Next; incluye modulo de vision y cabeza MTP) |
| Parametros totales | 180.000.000.000 (180B logicos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit grupo 64, affine 4-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, BF16, N-gram affine 4-bit grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |
| Bits efectivos por peso | 4,114 (checkpoint completo) / 3,762 (excluyendo embeddings N-gram) |
| Tamano del repo | 92,6 GB (86,213 GiB de pesos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Los datos de la model card permiten inferir la composicion por componentes: un language model de 125.744B parametros logicos, una tabla de embeddings N-gram de 51.200B (el 28,4% de los pesos logicos), un modulo de vision de 0.449B y una cabeza MTP de 2.607B. La existencia de una cabeza MTP (multi-token prediction) apunta a decodificacion especulativa integrada, y el modulo de vision indica capacidades multimodales, pero no se detalla ni el tipo de transformer ni el esquema de atencion.

El proceso de cuantizacion es la innovacion documentada: oQ aplica precision mixta por tensor, asignando 3 bits (grupo 64) al 67,1% de los pesos, 4 bits (grupo 32) a la tabla N-gram, 8 bits a un 2,8% y manteniendo un 0,287% en BF16. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto: capacidad esperada por herencia del language model base, aunque no documentada explicitamente.
- Vision: el checkpoint incluye un modulo de vision de 0.449B parametros, lo que sugiere entrada de imagenes, sin detalle de resolucion ni tareas soportadas.
- Decodificacion especulativa: la cabeza MTP de 2.607B habilita prediccion multi-token, potencialmente con aceleracion de inferencia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el peso de 86,213 GiB permiten ejecutar el modelo en equipos con memoria unificada de 96 GB o superior (por ejemplo, Mac Studio con M3 Ultra), algo inviable con el checkpoint en BF16.
- Investigacion sobre cuantizacion mixta: sirve como referencia para estudiar el impacto de asignar 3, 4 y 8 bits por tensor en modelos de gran escala, comparando la distribucion de bits documentada con variantes uniformes.
- Evaluacion de decodificacion especulativa: la cabeza MTP incluida permite medir la ganancia de throughput de la prediccion multi-token frente a decodificacion autoregresiva clasica.
- Pruebas de pipelines multimodales: el modulo de vision posibilita experimentar con tareas imagen-texto en local, aunque sin garantias documentadas de calidad.
- Benchmarking de artefactos comunitarios: util para comparar la fidelidad de cuantizaciones no oficiales frente al modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next en tareas controladas.
- Prototipado offline con requisitos de privacidad: al ejecutarse en hardware local sin llamadas a API, encaja en escenarios donde los datos no pueden salir del dispositivo, siempre que se valide antes la calidad del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 86,213 GiB solo para pesos; con overhead de contexto y cache KV, se recomienda 96 GB o mas de memoria unificada.
- GPU recomendadas: hardware Apple Silicon con memoria unificada amplia (Mac Studio M3 Ultra de 96 GB o 192 GB, Mac Pro). No se documenta soporte para CUDA.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en ninguna consumer GPU actual; el formato MLX ademas esta orientado a Apple Silicon.
- Opciones de despliegue: libreria MLX (mlx-lm / mlx-examples); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-oQ3e-mtp (este) | 180B logicos (4,114 bits/peso) | no disponible | safetensors MLX | no disponible | 0 descargas |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | 180B (precision original no documentada) | no disponible | no disponible | no disponible | modelo base referenciado |
| Alternativas de 180B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: no hay garantia de uso comercial ni de redistribucion; debe contactarse con el autor antes de cualquier despliegue productivo.
- Cero descargas y cero likes: el artefacto no ha sido validado por la comunidad; no existen reportes independientes de calidad.
- Perdida de precision por cuantizacion: el 67,1% de los pesos esta a 3 bits, lo que puede degradar tareas sensibles a precision (matematicas, codigo, razonamiento largo) frente al modelo base.
- Sin documentacion de arquitectura, contexto, idiomas ni datos de entrenamiento: imposible estimar sesgos, alucinacion o cobertura linguistica.
- Dependencia de MLX: no es portable a ecosistemas CUDA sin conversion adicional, lo que limita su uso fuera de Apple Silicon.
- Modelo derivado no oficial: al ser una cuantizacion de terceros, los fallos pueden provenir del proceso de compresion y no del modelo original.
- La cabeza MTP y el modulo de vision estan incluidos, pero no se documenta como activarlos ni su fidelidad tras la cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ3e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
