# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp

## Resumen
Swift1.5-Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp es una cuantizacion mixta del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario scottlowry. El artefacto se ha generado con oQ (oMLX v0.7.4.dev1), una herramienta de cuantizacion de precision mixta orientada al ecosistema MLX de Apple, y esta pensado para ejecutarse en hardware Apple Silicon mediante la libreria mlx. No se trata de un modelo entrenado desde cero, sino de una redistribucion cuantizada del checkpoint original.

El checkpoint contiene 179.999.981.459 parametros (unos 180.000 millones), lo que lo situa en la categoria de modelos de gran escala. La cuantizacion aplica un esquema mixto por tensor: la mayor parte de los pesos del transformer queda en 3 y 4 bits afines con grupo 64, mientras que la tabla de embeddings N-gram (51.200 millones de parametros logicos) se almacena en 4 bits con grupo 32, y pequenas porciones (vision, cabeza MTP) se mantienen en 8 bits, FP16 o FP32. El resultado es un peso medio efectivo de 4,366 bits por peso para el checkpoint completo y un tamano de repositorio de 98,3 GB.

La relevancia de esta ficha es acotada: se trata de una publicacion sin descargas ni likes en el momento de la consulta, sin model card detallada sobre el modelo base, sin licencia declarada y sin resultados de benchmarks. La informacion disponible permite describir la estructura de cuantizacion con precision, pero no las capacidades, el entrenamiento ni el rendimiento del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el checkpoint incluye componentes de lenguaje, vision y una cabeza MTP; el modelo base no documenta su arquitectura en la informacion disponible) |
| Parametros totales | 179.999.981.459 (180.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit grupo 64, affine 4-bit grupo 64, affine 6-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, FP16, FP32, I64 y N-gram affine 4-bit grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next: la model card del artefacto cuantizado no describe si se trata de un transformer denso, un MoE o una arquitectura hibrida. El desglose de almacenamiento revela, sin embargo, la composicion interna del checkpoint: un modulo de lenguaje de 125.744 millones de parametros logicos, una tabla de embeddings N-gram de 51.200 millones, un modulo de vision de 0,449 millones y una cabeza MTP (multi-token prediction) de 2,607 millones. La presencia de una cabeza MTP sugiere soporte para decodificacion especulativa o prediccion multi-token, aunque no se documenta su uso.

El proceso de cuantizacion es el unico entrenamiento o transformacion documentado. Se aplico con oQ (oMLX v0.7.4.dev1) en precision mixta, asignando 3 bits afines (grupo 64) al 44,739% de los pesos logicos, 4 bits afines (grupo 64) al 23,815%, y manteniendo la tabla N-gram en 4 bits con grupo 32 (28,445% de los pesos logicos). Las capas de vision y la cabeza MTP reciben tratamientos de mayor precision (8 bits, FP16 y FP32). No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus ni tecnicas de alineacion como RLHF o DPO.

## Capacidades
- Generacion de texto: el componente de lenguaje de 125.744 millones de parametros logicos permite generacion autoregresiva, aunque no se documentan capacidades especificas.
- Vision: el checkpoint incluye un modulo de vision de 0,449 millones de parametros logicos almacenado en FP32, lo que indica soporte de entrada multimodal de imagenes, sin mas detalle disponible.
- Prediccion multi-token: la cabeza MTP de 2,607 millones de parametros logicos sugiere capacidad de decodificacion especulativa o generacion de varios tokens por paso, no documentada en detalle.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Inferencia local en Apple Silicon: el formato MLX y la cuantizacion mixta a 4,366 bits por peso permiten cargar el checkpoint en equipos Apple con memoria unificada suficiente, sin necesidad de GPUs dedicadas. Es el caso de uso principal y practicamente unico documentado por el autor.
- Investigacion sobre cuantizacion de modelos de gran escala: el desglose por tipo de tensor y bits efectivos sirve como referencia para estudiar el impacto de la precision mixta en modelos de 180.000 millones de parametros.
- Evaluacion comparativa de tecnicas oQ: al conservar FP16, FP32 y 8 bits en componentes sensibles (vision, MTP) y comprimir agresivamente el resto, el artefacto permite medir la degradacion de calidad frente al checkpoint original.
- Prototipado multimodal en estaciones de trabajo Apple: la presencia del modulo de vision en FP32 posibilita experimentar con tareas imagen-texto en hardware de sobremesa de Apple, siempre que la memoria unificada lo permita.
- Despliegue de referencia para pipelines MLX: sirve como checkpoint de prueba en herramientas como mlx-lm o mlx-examples para validar flujos de carga, tokenizacion y generacion con modelos cuantizados de gran tamano.
- Archivo y reproduccion: al estar generado con una version concreta de oMLX (v0.7.4.dev1), el checkpoint documenta una configuracion reproducible de cuantizacion mixta para auditoria o comparacion futura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM o memoria unificada estimada: el repositorio ocupa 98,3 GB en disco (91,491 GiB de tensores). Para cargar el modelo en memoria se necesita un equipo con al menos ~98 GB de memoria unificada disponible, y mas para el contexto de activaciones y cache KV.
- GPU recomendadas: al ser un checkpoint MLX, el hardware objetivo son los chips Apple Silicon. No se documenta soporte para CUDA ni ROCm.
- Viabilidad en consumer GPU: no es viable en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones multi-GPU convencionales sin re-cuantizacion adicional; en Apple Silicon requiere equipos de gama alta con memoria unificada muy elevada (por ejemplo, configuraciones de 128 GB o superiores).
- Opciones de despliegue: libreria mlx; el autor referencia oQ (oMLX, https://github.com/jundot/omlx) como herramienta de cuantizacion. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y el modelo base carece de documentacion publica sobre parametros activos, contexto o rendimiento que permita una comparacion rigurosa.

## Limitaciones y advertencias
- La cuantizacion mixta a 4,366 bits por peso implica una perdida de precision respecto al checkpoint original; el impacto en calidad no esta medido ni documentado.
- El 44,739% de los pesos logicos esta en 3 bits afines (grupo 64), el nivel mas agresivo del esquema, lo que puede afectar a tareas sensibles a la precision numerica.
- La tabla de embeddings N-gram (28,445% de los pesos) se almacena en 4 bits con grupo 32, un tratamiento distinto al resto que conviene verificar en tareas dependientes de representaciones lexicales.
- No hay licencia declarada, lo que impide determinar si el uso comercial esta permitido; debe consultarse la licencia del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next antes de cualquier uso en produccion.
- No se documentan sesgos, riesgo de alucinacion, limitaciones de contexto ni idiomas soportados del modelo base.
- El artefacto tiene cero descargas y cero likes en el momento de la consulta, sin validacion comunitaria conocida.
- Dependencia del ecosistema MLX: no es portable directamente a CUDA, ROCm ni a frameworks de inferencia convencionales sin conversion adicional.
- El modelo base es a su vez una publicacion de un usuario no verificado (ukisai), sin model card detallada en la informacion disponible.

## Enlaces
- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
