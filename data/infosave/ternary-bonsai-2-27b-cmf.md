# infosave/Ternary-Bonsai-2-27B-cmf

## Resumen

Ternary-Bonsai-2-27B-cmf es una conversión al formato CMF (Cortiq Model Format) del modelo Ternary Bonsai 2 27B, un transformer de 27.000 millones de parámetros cuantizado en ternario (2 bits) por Prism ML. La conversión la firma el usuario infosave y está pensada para ejecutarse con el runtime Cortiq 0.6.9 o superior, un motor de inferencia escrito en Rust con backends CUDA, Vulkan y Metal nativo. El modelo base es `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`, un pack MLX de 2 bits.

El problema que resuelve es el despliegue de un modelo de 27B en hardware de consumo: gracias a la cuantización ternaria y al empaquetado Q2TP, el artefacto completo ocupa 8,25 GB (7,68 GiB), lo que permite cargarlo en GPUs de 24 GB como la RTX 4090 o la RTX A5000, e incluso en un Apple M4 de 24 GiB. La ficha del autor reporta 33,8-33,9 tok/s en decodificación sobre una RTX A5000 vía CUDA y unos 42 tok/s sobre una RTX 4090 vía Vulkan.

Es relevante ahora porque demuestra que un modelo de 27B puede correr íntegramente en tarjetas de consumo con velocidades usables, a costa de una pérdida de calidad que el propio autor documenta con métricas de NLL. La licencia Apache 2.0 y el soporte multilingüe inglés/ruso lo hacen atractivo para prototipado y despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); cuantización ternaria Q2TP con operadores affine y Hadamard con signo |
| Parametros totales | 27B (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria de 2 bits (Q2TP, Q2TP-affine); 402 matrices grandes empaquetadas |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (Cortiq Model Format), fichero único `Ternary-Bonsai-2-27B-Q2TP-Affine.cmf` de 8.247.698.536 bytes |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer de 27B. Lo que sí está documentado es el proceso de cuantización: las 402 matrices grandes del modelo se almacenan con el dtype16 Q2TP del formato CMF, con operadores affine y Hadamard con signo explícitos. El operador affine preserva los signos y ceros ternarios, mientras que la escala ajustada del CMF introduce una pequeña aproximación. El autor advierte explícitamente de que no se trata de una conversión Q4TP, ni de un nuevo dtype Q2TP-T, ni de pesos idénticos byte a byte a los del modelo original.

Los tensores auxiliares y de normalización conservan sus precisiones declaradas. El runtime Cortiq 0.6.9 incorpora inferencia Vulkan residente y kernels Metal nativos para Q2, con una optimización ternaria en Metal que opera directamente sobre los pesos empaquetados de dos bits. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto en inglés y ruso.
- Modo "thinking" controlable mediante el flag `--no-think`; el modelo soporta razonamiento explícito opcional.
- Salida estructurada: los ejemplos de la model card generan objetos JSON directamente.
- Inferencia con decodificación greedy y semilla fija para reproducibilidad.
- Ejecución íntegra en GPU con backends CUDA, Vulkan y Metal nativo.
- No soporta fusión imagen/texto según la model card ("image/text fusion is not supported by this profile").
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 24 GB: el fichero de 8,25 GB cabe en una RTX 4090 o RTX A5000, permitiendo servir un modelo de 27B sin infraestructura cloud.
- Generación de JSON estructurado en pipelines: el modelo responde a instrucciones del tipo "devuelve solo un objeto JSON con city igual a Kazán y count igual a 3", útil para extracción de datos y validación de esquemas.
- Procesamiento de documentos en ruso e inglés: el soporte bilingüe permite tareas de resumen, traducción y extracción sobre corpus mixtos sin cambiar de modelo.
- Prototipado en Apple Silicon: con Metal nativo sobre un M4 de 24 GiB se obtienen 7,5-8,7 tok/s, suficiente para demos interactivas y pruebas de concepto en portátiles.
- Evaluación de cuantización ternaria: el modelo sirve como banco de pruebas para medir la degradación de calidad (NLL) frente a la referencia CUDA oficial en corpus congelados.
- Generación de código asistida en local: el corpus de validación del autor incluye código, y el modelo puede integrarse en editores o CLI sin enviar datos a terceros.
- Inferencia por lotes de bajo coste: con 33,8 tok/s en A5000 vía CUDA, es viable procesar colas de generación moderadas en hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de ingeniería de throughput y de calidad:

| Backend / hardware | Decodificación en caliente | Notas |
|---|---:|---|
| CMF Vulkan residente, RTX 4090 24 GB | ~42 tok/s | Implementación CMF aceptada |
| Referencia CUDA oficial de Prism, misma RTX 4090 | ~87 tok/s | CMF no alcanza la paridad con CUDA |
| CMF Metal nativo, Apple M4 10 núcleos GPU / 24 GiB | 7,50-8,74 tok/s (media 7,94) | Tres muestras en caliente |
| CMF Metal anterior, mismo host | ~5,23 tok/s | Baseline histórico no emparejado |
| CMF CUDA, RTX A5000 24 GB | 33,8-33,9 tok/s | Lectura de prompt de 4096 tokens a 777 tok/s, primer token 5,3 s |
| CMF Vulkan, RTX A5000 24 GB | 25,8 tok/s | Lectura de prompt a 122 tok/s, primer token 33,7 s |

La prueba de throughput emparejada usó 1.122 IDs de prompt idénticos y 128 tokens de salida greedy, con un modelo residente, una ejecución en frío y tres en caliente. En calidad, sobre un corpus congelado mixto inglés/ruso/código de 1.122 token IDs y 1.024 objetivos de next-token, la ruta oficial Prism PQ2 CUDA obtiene una NLL media de 1,81; el dato correspondiente a la ruta CMF queda truncado en la información disponible.

## Requisitos de hardware

- Tamaño del artefacto: 8,25 GB (7,68 GiB); el autor advierte de que no equivale al pico de VRAM/RAM, ya que activaciones, scratch de prefill y estado KV/recurrente requieren memoria adicional.
- GPU validadas: NVIDIA RTX A5000 24 GB (CUDA y Vulkan), NVIDIA RTX 4090 24 GB (Vulkan), Apple M4 de 10 núcleos GPU con 24 GiB (Metal nativo).
- Cabe en GPUs de consumo de 24 GB; no se documenta funcionamiento en tarjetas de 8, 12 o 16 GB.
- Despliegue mediante Cortiq CLI 0.6.9 o superior: `cargo install cortiq-cli --version 0.6.9 --locked --features gpu`; para CUDA se requiere Cortiq 0.8.96 o superior con `--features cuda` y CUDA 12.x.
- Linux necesita driver Vulkan funcional (verificar con `vulkaninfo --summary`); macOS requiere build para Apple Silicon.
- Variables de entorno relevantes: `CMF_GPU`, `CMF_Q2TP_GPU`, `CMF_GPU_PROBE`, `CMF_GPU_WGPU_GRAPH`, `CMF_MTP`, `CMF_METAL_PREFILL_CHUNK`.
- Throughput medido: 33,8-33,9 tok/s en A5000 CUDA, ~42 tok/s en 4090 Vulkan, 7,5-8,7 tok/s en M4 Metal.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato CMF es específico de Cortiq.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-cmf | 27B | no disponible | Ternaria 2 bits (Q2TP) | Apache 2.0 | Cortiq (CUDA/Vulkan/Metal) |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27B | no disponible | 2 bits MLX | no disponible en la informacion | MLX |
| Referencia CUDA oficial de Prism (mismo modelo base) | 27B | no disponible | PQ2 | no disponible en la informacion | CUDA propietario de Prism |

La comparación relevante es contra el propio modelo base y su implementación de referencia: la versión CMF ofrece portabilidad a Vulkan y Metal a cambio de menor throughput (42 frente a 87 tok/s en RTX 4090) y una pequeña aproximación de escala en los pesos. No se dispone de datos de otros modelos de 27B cuantizados en ternario para comparar en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria introduce aproximación de escala; el autor niega explícitamente la identidad byte a byte con los pesos upstream.
- Solo se validaron los backends CUDA (A5000), Vulkan (4090) y Metal (M4); otros hardware no están garantizados.
- El runtime 0.6.8 no soporta este perfil de modelo; se requiere 0.6.9 o superior, y CUDA exige 0.8.96 o superior.
- El rendimiento medido son mediciones de ingeniería de implementaciones de desarrollo, no garantías universales de hardware.
- En Apple M4 no se alcanzaron los 20 tok/s; el tiempo de prefill y el time-to-first-token son costes separados que afectan a conversaciones largas.
- El tamaño del fichero no es el pico de memoria: activaciones, scratch de prefill y estado KV/recurrente añaden consumo.
- No soporta fusión imagen/texto en este perfil.
- Idiomas limitados a inglés y ruso; no se documenta cobertura de castellano.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Los kernels experimentales Q8/Q8×2 y empaquetados alternativos no se recomiendan como configuración de runtime.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base upstream, no disponible en la información.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Ternary-Bonsai-2-27B-cmf
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Revisión concreta del modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit/tree/3f926b415992eaa2ae9dd7b573706494d6bbf787
- Releases de Cortiq v0.6.9: https://github.com/infosave2007/cmf/releases/tag/v0.6.9
- Repositorio CMF: https://github.com/infosave2007/cmf
