# jclyons52/Qwen3.8-27B-UD-Q3_K_XL-MLX-imatrix-direct

## Resumen

El modelo `jclyons52/Qwen3.8-27B-UD-Q3_K_XL-MLX-imatrix-direct` es una cuantización nativa en MLX de la versión dinámica UD-Q3_K_XL creada por unsloth para el modelo base Qwen/Qwen3.8-27B de Alibaba. Se trata de un port que ejecuta la búsqueda de cuantización directamente en el formato affine de MLX (grupo de 64) y escribe los pesos finales en MLX sin pasar por GGUF ni por una re-cuantización posterior con `mlx_lm.convert`. El resultado es una réplica exacta de la perplejidad obtenida con la versión GGUF en llama.cpp (8.136 en wikitext-2), lo que lo convierte en una opción atractiva para usuarios de Apple Silicon que quieran ejecutar Qwen3.8-27B con un consumo de memoria reducido.

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con ventana de contexto nativa de 262 144 tokens, diseñado para tareas de codificación, razonamiento, agentes y automatización de oficina. Sin embargo, esta cuantización concreta no incluye la torre visual del checkpoint original, por lo que solo es apta para tareas de texto. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que ofrece una vía para ejecutar un modelo de 27B en hardware de Apple con memoria unificada limitada, manteniendo una calidad de cuantización alta gracias al método dinámico de unsloth y a la calibración con imatrix. Es una opción intermedia entre las cuantizaciones GGUF tradicionales y las versiones GPTQ, con la ventaja de estar optimizado para el ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | UD-Q3_K_XL (dinamica, grupo 64, formato affine MLX) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención de tiempo completo, diseñado por Alibaba para tareas de razonamiento, codificacion y agentes. Incorpora un modo de razonamiento configurable (thinking mode) y una ventana de contexto de 262 144 tokens. El checkpoint original incluye una torre visual, pero esta cuantizacion la omite, por lo que el modelo resultante es exclusivamente de texto.

El proceso de cuantizacion, descrito en la model card, consta de tres pasos: primero se toma el mapa de bits dinamico por tensor de la version GGUF UD-Q3_K_XL de unsloth; segundo, se realiza una busqueda affine ponderada por importancia (usando la imatrix publicada por unsloth, que contiene energias de activacion por columna) para cada grupo de 64 elementos; tercero, se emiten los pesos finales directamente en formato MLX (codigos uint32 empaquetados y escalas/sesgos en bf16). No hay ningun entrenamiento adicional ni ajuste fino; se trata exclusivamente de una cuantizacion post-entrenamiento.

La innovacion principal es que la cuantizacion se realiza nativamente en el formato affine de MLX, evitando la perdida de calidad que suele ocurrir al convertir desde GGUF. La perplejidad medida en wikitext-2 (primeros 32k tokens, ventanas de 512) es identica a la de la version GGUF en llama.cpp: 8.136.

## Capacidades

- Generacion de texto y chat conversacional en multiples idiomas (heredado del modelo base, aunque no se especifican los idiomas concretos en esta cuantizacion).
- Razonamiento y resolucion de problemas con modo de pensamiento configurable (thinking mode) disponible en el modelo base, aunque no se ha verificado su funcionamiento en esta cuantizacion.
- Generacion de codigo y asistencia en tareas de programacion, segun las capacidades del modelo base Qwen3.8-27B.
- Soporte para flujos de trabajo agente (agentic workflows) y automatizacion de oficina, como se indica en la documentacion oficial de Qwen3.8.
- Capacidad de tool calling y function calling probablemente heredada del modelo base, aunque no se confirma en la model card de esta cuantizacion.
- Limitacion importante: no incluye capacidades de vision, ya que la torre visual del checkpoint base no se ha incluido en esta cuantizacion.

## Casos de uso

- Asistente de codigo en entornos de desarrollo: el modelo puede generar, explicar y depurar codigo en multiples lenguajes, aprovechando su ventana de contexto de 262K tokens para manejar repositorios completos o archivos largos. Es adecuado para integrarse en editores como VS Code o en pipelines de CI/CD mediante la API de MLX.
- Automatizacion de tareas de oficina: redaccion de documentos, resumen de correos, generacion de informes y gestion de hojas de calculo, gracias a su capacidad de razonamiento y generacion de texto estructurado.
- Agentes conversacionales para atencion al cliente: con su contexto largo, puede mantener conversaciones multi-turno con historial extenso y recordar detalles de interacciones previas, lo que lo hace util para chatbots en empresas.
- Analisis y razonamiento sobre documentos largos: puede procesar contratos, articulos cientificos o manuales tecnicos completos, extrayendo informacion y respondiendo preguntas complejas sobre el contenido.
- Generacion de contenido creativo y tecnico: redaccion de articulos, documentacion tecnica, guiones o material educativo, con un estilo coherente y adaptado al contexto proporcionado.
- Prototipado rapido de aplicaciones de IA en Apple Silicon: al ser un modelo MLX, se puede desplegar localmente en Macs con memoria unificada, lo que permite desarrollar y probar aplicaciones de IA sin depender de servicios en la nube.

## Benchmarks y rendimiento

La unica metrica publicada en la model card es la perplejidad en wikitext-2 (primeros 32k tokens, ventanas de 512 tokens). No se han publicado resultados de benchmarks downstream como MMLU, HumanEval o GSM8K para esta cuantizacion concreta.

| Build | Perplejidad (PPL) ↓ |
|---|---|
| unsloth UD-Q3_K_XL GGUF en llama.cpp | 8.136 |
| Este modelo (MLX imatrix-direct) | 8.136 |
| Variante GPTQ (jclyons52/Qwen3.8-27B-UD-Q3_K_XL-MLX-gptq-direct) | 8.090 |

La variante GPTQ del mismo autor mejora ligeramente la perplejidad y se recomienda como descarga Q3 preferida, segun la model card. No se dispone de datos de latencia o throughput para este modelo.

## Requisitos de hardware

- El modelo esta diseñado para ejecutarse en Apple Silicon mediante MLX. El tamaño del repositorio es de 15.1 GB, lo que sugiere que cabe en equipos con al menos 16 GB de memoria unificada (aunque se recomienda 32 GB para mayor comodidad).
- No se ha probado en GPUs de NVIDIA o AMD; el formato MLX es exclusivo de Apple.
- Para inferencia, se puede utilizar la libreria `mlx-lm` (https://github.com/ml-explore/mlx-lm) o cualquier runtime compatible con MLX.
- No se dispone de datos de latencia o throughput especificos para esta cuantizacion. Como referencia, el modelo base Qwen3.8-27B puede ejecutarse en 17 GB de RAM/VRAM segun la documentacion de unsloth, pero esta cuantizacion Q3 reduce el tamaño a 15.1 GB.
- No se recomienda para entrenamiento adicional, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Perplejidad (wikitext-2) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base, sin cuantizar) | 27B | 262K | FP16/BF16 | No disponible | Apache 2.0 |
| unsloth/Qwen3.8-27B-GGUF (UD-Q3_K_XL) | 27B | 262K | GGUF Q3_K_XL | 8.136 | Apache 2.0 |
| jclyons52/Qwen3.8-27B-UD-Q3_K_XL-MLX-imatrix-direct | 27B | 262K | MLX Q3_K_XL | 8.136 | Apache 2.0 |
| jclyons52/Qwen3.8-27B-UD-Q3_K_XL-MLX-gptq-direct | 27B | 262K | MLX GPTQ Q3 | 8.090 | Apache 2.0 |

La comparativa muestra que esta cuantizacion MLX iguala la perplejidad de la version GGUF de unsloth, mientras que la variante GPTQ la mejora ligeramente. Todas las versiones comparten la misma licencia Apache 2.0 y el mismo contexto de 262K tokens.

## Limitaciones y advertencias

- La cuantizacion affine de MLX no soporta los codebooks no lineales IQ que unsloth utiliza para bits de 3 o menos en GGUF, lo que introduce una brecha de calidad inherente a los kernels actuales de MLX. Esta limitacion es tecnica y no se debe a los pesos en si.
- El modelo es exclusivamente de texto: la torre visual del checkpoint base no se ha incluido, por lo que no puede procesar imagenes ni video.
- La evaluacion se ha limitado a wikitext-2 (32k tokens); no se han caracterizado tareas downstream como razonamiento, codigo o agentes en esta cuantizacion.
- No es apto para entrenamiento adicional o fine-tuning, ya que la cuantizacion degrada los gradientes y no se ha diseñado para ello.
- El modelo base Qwen3.8-27B puede presentar sesgos y alucinaciones tipicos de los modelos de lenguaje grandes, aunque no se han documentado especificamente para esta cuantizacion.
- Para uso en produccion, se recomienda validar el comportamiento en el caso de uso concreto, dado el alcance limitado de la evaluacion publicada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jclyons52/Qwen3.8-27B-UD-Q3_K_XL-MLX-imatrix-direct
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Version GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentacion de unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Pagina de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Pipeline ud2mlx: https://github.com/jclyons52/ud2mlx
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
