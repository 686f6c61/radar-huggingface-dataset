# d9beuD/Qwen3.8-Flash-Next-oQ3e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3e-mtp es una cuantizacion en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD. La cuantizacion se ha realizado con la herramienta oQe (oMLX v0.7.0) mediante cuantizacion de precision mixta ponderada por importance matrix, con un nivel oQ 3 y 3 bits por defecto. El resultado son aproximadamente 3,75 bits efectivos por peso y un repositorio de 84,3 GB, sobre un total de 179.999.981.459 parametros almacenados en safetensors.

El modelo base, desarrollado por el equipo Qwen, es un MoE multimodal de la familia Qwen4 (tipo `qwen4_exp`) que combina atencion hibrida Gated DeltaNet (GDN) con QSA, segun el repositorio oficial en GitHub. Las fuentes web consultadas indican que el modelo principal ronda los 125.000 millones de parametros con unos 6.000 millones activos por token, e incluye ademas una tabla de embeddings n-gram de 51.000 millones de parametros y una cabecera MTP de 4.000 millones. La ventana de contexto declarada es de 262.144 tokens.

Su relevancia practica esta en que permite ejecutar un MoE multimodal con cabeza de prediccion multi-token (MTP) preservada en Apple Silicon con memoria unificada, algo que el checkpoint original en bfloat16 no permite en equipos de 128 GB. La licencia es la Qwen Community License 1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion hibrida GDN + QSA, tipo `qwen4_exp` |
| Parametros totales | 179.999.981.459 (~180B) en safetensors; incluye tabla de embeddings n-gram (~51B) y cabecera MTP (~4B); modelo principal ~125B segun fuentes web |
| Parametros activos | ~6B por token (segun fuentes web; no confirmado en la model card) |
| Longitud de contexto | 262.144 tokens (262K) segun unsloth.ai; no confirmado en la model card |
| Tipos de cuantizacion | 3 bits por defecto, mezcla de precision (8, 5, 4 y 3 bits), ~3,75 bits efectivos por peso; group size 64 por defecto (algunos modulos usan 32 o 128) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | MLX safetensors (dtype bfloat16 en pesos no cuantizados, escalas y sesgos) |

Distribucion de parametros cuantizados por numero de bits (segun la model card):

| Bits | Proporcion |
|---|---|
| 8-bit | 0,8% |
| 6-bit | 0,0% |
| 5-bit | 0,6% |
| 4-bit | 1,4% |
| 3-bit | 97,1% |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura Qwen4 en su variante temprana, que el repositorio oficial describe como una mejora sistematica en cuatro ejes: atencion, residual, embeddings y optimizacion. La atencion es hibrida, combinando Gated DeltaNet (GDN) con QSA. Es un modelo MoE multimodal: la model card de esta cuantizacion confirma que se preservan tanto el codificador de vision como la tabla de embeddings n-gram, ademas de la cabeza de prediccion multi-token (`mtp_num_hidden_layers: 1`), lo que habilita decodificacion especulativa basada en MTP.

Sobre el entrenamiento del modelo base no hay datos en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF o DPO): no disponible. En cuanto al proceso de cuantizacion, si hay detalle: se aplico cuantizacion de precision mixta ponderada por importance matrix con oQe (oMLX v0.7.0). El conjunto de calibracion fue `oqe_code_multilingual`, con 1.024 muestras de 512 tokens y un esquema adaptativo de 128 a 1.024 muestras en 8 rondas. La recoleccion se hizo capa a capa del decoder directamente desde el checkpoint bf16, sin modelo proxy. La cobertura de expertos enrutados fue de 75.240 de 75.264 (99,97%); los 24 expertos que no recibieron tokens de calibracion usan cuantizacion oQ estandar. El mapa de sensibilidad por capas se midio sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp (128 muestras x 256 tokens, conjunto `code_multilingual`) en lugar del checkpoint bf16 completo, porque este no cabe en memoria en un Mac de 128 GB. Los detalles estan en `oq_imatrix_report.json`.

## Capacidades

- Generacion de texto y conversacion multi-turno, con tag `conversational` en HuggingFace.
- Procesamiento multimodal de entrada imagen-texto: el pipeline declarado es `image-text-to-text` y el codificador de vision esta incluido en la cuantizacion.
- Razonamiento avanzado: las fuentes web describen el modelo base como dotado de razonamiento avanzado, sin mas detalle cuantitativo disponible.
- Decodificacion especulativa mediante la cabeza MTP preservada (`mtp_num_hidden_layers: 1`).
- Capacidades de codigo: la calibracion de la importance matrix se hizo sobre un conjunto multilingue de codigo, lo que sugiere uso intensivo en ese dominio, aunque no se especifican benchmarks.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Contexto largo: hasta 262.144 tokens segun unsloth.ai.

## Casos de uso

- Analisis de repositorios de codigo completos: con una ventana de hasta 262K tokens, el modelo puede ingerir varios ficheros o un modulo entero de una sola vez y responder preguntas de arquitectura, dependencias o deuda tecnica sin trocear el contexto.
- Asistencia de programacion en local sobre Apple Silicon: la cuantizacion de 84 GB permite ejecutar el modelo en un Mac con 128 GB de memoria unificada, sin GPU dedicada, para autocompletado, refactorizacion y generacion de tests en un entorno sin conexion.
- Procesamiento de documentacion tecnica escaneada con imagenes: al incluir el codificador de vision, puede extraer informacion de diagramas, capturas de pantalla de errores o esquemas de arquitectura junto al texto que los acompana.
- Revision automatizada de pull requests: la calibracion sobre codigo multilingue lo hace adecuado para detectar patrones problematicos en diffs y generar comentarios de revision en pipelines de CI/CD, siempre que se integre mediante un runtime MLX.
- Analisis de contratos o informes extensos con tablas e imagenes: la combinacion de contexto largo y vision permite resumir y extraer clausulas de documentos de cientos de paginas con graficos incrustados.
- Aceleracion de inferencia con decodificacion especulativa: la cabeza MTP preservada permite generar varios tokens por paso de verificacion, util en servicios de chat de baja latencia sobre hardware Apple.
- Experimentacion en investigacion sobre cuantizacion extrema: el repositorio incluye el informe de importance matrix y el desglose de bits por capa, lo que lo convierte en material de estudio para comparar precision mixta frente a cuantizacion uniforme a 3 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye ninguna tabla de evaluacion, y las fuentes web consultadas solo afirman de forma cualitativa que el modelo base "supera a Claude-4.6-Opus (Max)" en sus pruebas, sin cifras verificables. No se dispone tampoco de datos de perplejidad, MMLU, HumanEval o GSM8K para esta version cuantizada, ni de la degradacion respecto al checkpoint en bfloat16.

## Requisitos de hardware

- VRAM o memoria unificada: alrededor de 84 GB solo para los pesos. La model card indica explicitamente que se necesita un Mac con mas memoria unificada que esa cifra, por ejemplo 128 GB.
- GPU compatibles: no se especifican GPU CUDA en la informacion disponible; el formato es MLX safetensors, orientado a Apple Silicon. Unsloth.ai menciona que el modelo base puede ejecutarse en dispositivos con 75 GB de RAM o memoria unificada sin VRAM de GPU.
- Encaje en GPU de consumo: no disponible para este repositorio en formato MLX. Para el modelo base existen builds GGUF de terceros (Atomic Dynamic GGUF) que apuntan a llama.cpp.
- Opciones de despliegue: MLX (libreria declarada en HuggingFace), oMLX/oQe como herramienta de cuantizacion, y llama.cpp solo tras convertir a GGUF, ya que este repositorio no esta en ese formato. vLLM y TGI no soportan pesos MLX de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ3e-mtp | ~180B en safetensors | oQ3e, 3 bits por defecto, ~3,75 bits efectivos, 84 GB | 262K (fuente web) | qwen-community-1.0 | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.8-Flash-Next | no disponible en la informacion proporcionada (modelo principal ~125B segun fuentes web) | bfloat16 sin cuantizar | 262K (fuente web) | qwen-community-1.0 | Publico en HuggingFace |
| d9beuD/Qwen3.8-Flash-Next-oQ3-mtp | no disponible | oQ3 estandar (sin ponderacion imatrix) | no disponible | qwen-community-1.0 | Publico en HuggingFace |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | oQ4e, precision mayor que 3 bits | no disponible | qwen-community-1.0 | Publico en HuggingFace |

Diferencias clave entre las variantes: la oQ3e usa ponderacion por importance matrix con 1.024 muestras de calibracion y preserva la cabeza MTP; la oQ3 es la variante estandar sin esa ponderacion; la oQ4e emplea mas bits, por lo que ocupa mas memoria pero deberia degradar menos la calidad. No hay datos de benchmarks que permitan comparar la calidad resultante entre ellas.

## Limitaciones y advertencias

- Cuantizacion agresiva: el 97,1% de los parametros esta a 3 bits. No se han publicado mediciones de degradacion frente al checkpoint bf16, por lo que el impacto real en calidad es desconocido.
- Sesgo de calibracion: la importance matrix se construyo exclusivamente con `oqe_code_multilingual`, 1.024 muestras de 512 tokens. Los dominios alejados del codigo (literario, legal, conversacional general, otras lenguas) pueden sufrir una degradacion mayor que la media.
- Expertos sin calibrar: 24 de los 75.264 expertos enrutados (0,03%) no recibieron ningun token de calibracion y conservan cuantizacion oQ estandar, lo que introduce heterogeneidad en la precision.
- Sensibilidad medida sobre un proxy: el mapa de sensibilidad por capas se obtuvo de un modelo cuantizado a 4 bits (Jundot/Qwen3.8-Flash-Next-oQ4e-mtp) y no del bf16 completo, por limitaciones de memoria. Las decisiones de asignacion de bits pueden no ser optimas.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones de factualidad publicadas para esta variante.
- Idiomas soportados: no declarados. No se puede asumir cobertura multilingue del castellano sin verificacion empirica.
- Restricciones de licencia: se hereda la Qwen Community License 1.0 del modelo base. Es una licencia "other", no una licencia open source aprobada; antes de un uso comercial hay que revisar los terminos del fichero LICENSE, que pueden incluir condiciones de atribucion o restricciones de uso.
- Dependencia de hardware: requiere un Mac con mas de 84 GB de memoria unificada (por ejemplo 128 GB). No es desplegable en GPU CUDA con runtimes estandar sin conversion previa.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Antiguedad y estado: el repositorio se creo y se actualizo el 5 de octubre de 2026, con tres minutos de diferencia entre ambos eventos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ3e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante oQ3 estandar: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ3-mtp
- Variante oQ4e usada para el mapa de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Herramienta de cuantizacion oMLX (oQe): https://github.com/jundot/omlx
- Guia de ejecucion local de unsloth.ai: https://unsloth.ai/docs/models/qwen3.8-next
- Guia de GGUF, hardware y benchmarks de atomic.chat: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
