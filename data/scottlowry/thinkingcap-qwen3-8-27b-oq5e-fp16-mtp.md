# scottlowry/ThinkingCap-Qwen3.8-27B-oQ5e-fp16-mtp

## Resumen

ThinkingCap-Qwen3.8-27B-oQ5e-fp16-mtp es una version cuantizada en formato MLX del modelo ThinkingCap-Qwen3.8-27B, publicado por el usuario scottlowry. Se trata de una cuantizacion mixta de 5 bits generada con la herramienta oQ (oMLX v0.7.0), pensada para ejecucion local en hardware Apple Silicon mediante la libreria MLX. El modelo subyacente es un transformer denso de 27.781.427.952 parametros (27,78B) derivado de la familia Qwen3.8 de Alibaba.

El modelo base, ThinkingCap-Qwen3.8-27B, es el segundo miembro de la serie ThinkingCap de bottlecapai. Su propuesta consiste en reducir la longitud del razonamiento interno (thinking) en torno a un 37% respecto al Qwen3.8-27B original, manteniendo la calidad de las respuestas. Esto lo hace atractivo para despliegues donde el coste de tokens de razonamiento y la latencia importan, sin renunciar a la calidad.

La relevancia de esta ficha concreta radica en su empaquetado: una cuantizacion de 5 bits en safetensors MLX ocupa 21,2 GB, lo que permite ejecutar un modelo de ~28B en equipos de consumo con memoria unificada suficiente. Es, por tanto, una opcion practica para inferencia local en Mac, si bien la ficha del repositorio es muy escasa en documentacion sobre licencia, idiomas y capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (Gated DeltaNet lineal + atencion completa), segun la arquitectura del base Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, tamano de grupo 64, precision mixta (oQ / oMLX v0.7.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (tambien etiquetado como safetensors) |

Datos adicionales confirmados: tipo de modelo declarado `qwen3_5`, repositorio de 21,2 GB, biblioteca `mlx`, 0 descargas y 0 likes en el momento de la consulta. Fechas de creacion y actualizacion: 2026-10-07.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas, con tamano oculto de 5.120 y un vocabulario de 248.320 tokens. Su pila de atencion es hibrida: 48 capas emplean atencion lineal Gated DeltaNet y el resto atencion completa, un diseno orientado a reducir el coste computacional del contexto largo. Segun la informacion disponible, el modelo base ronda los 28B parametros si se cuenta un codificador de vision de aproximadamente 1B, lo que sugiere una componente multimodal en la version original; no se documenta si la cuantizacion MLX conserva dicho codificador.

Sobre el entrenamiento de ThinkingCap no hay datos en la informacion proporcionada: no se especifica numero de tokens, composicion del dataset, ni si hubo fases de RLHF o DPO. Lo unico documentado es el objetivo del ajuste: reducir la cantidad de tokens de razonamiento (~37%) manteniendo la calidad de las respuestas respecto al Qwen3.8-27B. La innovacion tecnica del repositorio que nos ocupa es la propia cuantizacion: oQ aplica precision mixta de 5 bits con grupo de 64, generando pesos MLX listos para `mlx-lm`.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking", con presupuesto de razonamiento reducido respecto al base segun el autor.
- Razonamiento matematico y de codigo, heredado de la familia Qwen3.8 (no hay evaluacion publicada en la informacion disponible).
- Capacidad multimodal (vision): el base incluiria un codificador de vision de ~1B; no se confirma si se conserva tras la cuantizacion MLX.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; la familia Qwen3.8 suele ser multilingue, pero no hay confirmacion para este repositorio.
- Modo thinking: si, es la caracteristica central del ajuste ThinkingCap (reduccion del razonamiento).

## Casos de uso

- Inferencia local en Mac: al ser un paquete MLX de 21,2 GB, se puede ejecutar en equipos Apple Silicon con memoria unificada de 32 GB o mas, usando `mlx-lm`, sin depender de GPU dedicada.
- Prototipado de agentes con razonamiento: el presupuesto de thinking reducido abarata el coste por consulta en bucles de razonamiento multi-paso, util para pruebas rapidas de pipelines.
- Asistencia de codigo en local: un modelo denso de ~28B con razonamiento puede emplearse para generacion y revision de codigo en un entorno de desarrollo privado, evitando enviar codigo a APIs externas.
- Educacion y tutoria: la reduccion de tokens de razonamiento mejora la latencia percibida en conversaciones interactivas de tipo explicativo.
- Procesamiento de documentos largos: si se confirma una ventana de contexto amplia (la arquitectura hibrida Gated DeltaNet esta pensada para ello), seria apto para resumir y consultar documentacion extensa; el valor exacto de contexto no esta disponible.
- Experimentacion en investigacion: sirve como punto de comparacion entre cuantizaciones (5, 6 y 8 bits del mismo autor) para estudiar el impacto de la precision en la calidad del razonamiento.
- Despliegue de bajo coste en edge: al no requerir GPU de datacenter, encaja en flujos de trabajo sobre portatiles y estaciones de trabajo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es cualitativa: el autor de ThinkingCap afirma una reduccion del 37% en la cantidad de razonamiento (thinking) manteniendo la calidad de las respuestas frente al Qwen3.8-27B original. No hay cifras de MMLU, HumanEval, GSM8K ni comparativas numericas verificables.

## Requisitos de hardware

- Tamano del repositorio: 21,2 GB en disco (pesos cuantizados a 5 bits).
- Inferencia en Apple Silicon (MLX): memoria unificada recomendada de 32 GB o superior para acomodar los pesos mas la cache KV; 36, 48 o 64 GB ofrecen mayor margen para contextos largos.
- Cabe en GPU de consumo: el formato nativo es MLX (Apple Silicon). Para GPU NVIDIA/AMD habria que convertir los pesos (por ejemplo a GGUF), lo que no esta documentado en este repositorio.
- Alternativa GGUF: existe una version GGUF del modelo ThinkingCap-Qwen3.8-27B en un repositorio de terceros (local-ai-zone), de 56,7 GB, ejecutable con llama.cpp u Ollama; la cifra de 56,7 GB corresponde a una cuantizacion de mayor precision, no a la variante de 5 bits de esta ficha.
- Herramientas de despliegue: `mlx-lm` (nativo), y potencialmente llama.cpp, Ollama o LM Studio si se dispone de una conversion GGUF equivalente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Tamano | Licencia | Estado |
|---|---|---|---|---|---|---|
| scottlowry/ThinkingCap-Qwen3.8-27B-oQ5e-fp16-mtp (este) | 27,78B | 5 bits (oQ) | MLX safetensors | 21,2 GB | no disponible | Publicado |
| scottlowry/ThinkingCap-Qwen3.8-27B-oQ8e-fp16-mtp | 27,78B (base) | 8 bits (oQ) | MLX safetensors | no disponible | no disponible | Publicado |
| scottlowry/Qwen3.8-27B-oQ6e-fp16-mtp | ~27B | 6 bits (oQ) | MLX safetensors | no disponible | no disponible | Publicado |
| bottlecapai/ThinkingCap-Qwen3.8-27B (base) | ~27-28B | Original (sin cuantizar) | no disponible | no disponible | no disponible | Publicado |
| Qwen3.8-27B (Alibaba) | ~28B (con vision ~1B) | Original | no disponible | no disponible | Apache 2.0 | Publicado |

Las variantes del mismo autor permiten elegir el compromiso entre precision y tamano en disco dentro del ecosistema MLX. No hay datos de rendimiento para comparar la calidad entre las distintas cuantizaciones.

## Limitaciones y advertencias

- Licencia no especificada en la ficha, lo que impide confirmar si el uso comercial esta permitido para esta cuantizacion concreta, aunque el Qwen3.8-27B original se publico bajo Apache 2.0.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingue optimo.
- Longitud de contexto no documentada: no se conoce la ventana real soportada, dato critico para aplicaciones de documentos largos.
- Riesgo de alucinacion inherente a los modelos de razonamiento; no hay evaluacion de fidelidad publicada para este ajuste.
- La reduccion del 37% en razonamiento no cuenta con validacion independiente publicada; conviene verificar la calidad en el caso de uso concreto antes de produccion.
- Incertidumbre sobre si la cuantizacion MLX conserva el codificador de vision del modelo base; si no lo hace, la capacidad multimodal se pierde.
- Compatibilidad limitada al ecosistema MLX de forma nativa; desplegar en GPU NVIDIA/AMD requiere conversion a otros formatos no incluidos en este repositorio.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: escasa validacion por parte de la comunidad.
- El sufijo `mtp` del nombre no esta explicado en la model card; no se puede confirmar si implica decodificacion multi-token.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/scottlowry/ThinkingCap-Qwen3.8-27B-oQ5e-fp16-mtp
- Variante 8 bits: https://huggingface.co/scottlowry/ThinkingCap-Qwen3.8-27B-oQ8e-fp16-mtp
- Variante Qwen3.8-27B 6 bits: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Blog de bottlecapai sobre ThinkingCap-Qwen3.8-27B: https://bottlecapai.com/post/thinkingcap-qwen3-8-27b/
- Documentacion de oQ (oMLX), herramienta de cuantizacion: https://github.com/jundot/omlx
- Version GGUF de terceros (local-ai-zone): https://local-ai-zone.github.io/models/thinkingcap-qwen3-8-27b.html
- Informacion sobre Qwen3.8-27B: https://www.llm-releases.com/models/qwen3-8-27b
