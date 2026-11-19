# pfeifferj/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-GGUF es una cuantizacion no uniforme en formato GGUF del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario independiente pfeifferj. El modelo base, desarrollado por Alibaba Qwen, es un modelo de 125.107.954.560 parametros (aproximadamente 125B) con capacidad de vision y texto (pipeline image-text-to-text), y esta cuantizado aqui a un objetivo de 3,5 bits por peso mediante las tecnicas GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization) desarrolladas en el IST-DASLab.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de ~125B parametros en hardware de consumo: segun la model card, es posible correrlo en 2x RTX 3090 manteniendo los embeddings en disco y la KV cache en RAM. Ademas, el autor reporta que con embeddings en BF16 el modelo cuantizado supera al modelo base en MMLU-Pro en 2,85 puntos porcentuales, con un incremento de perplejidad de solo el 1,72%.

Se trata de una reproduccion comunitaria independiente, no una publicacion oficial del IST-DASLab ni de Qwen, y se distribuye bajo la licencia Qwen Community 1.0. El repositorio ocupa 259,5 GB e incluye los pesos principales, shards de embeddings alternativos y el proyector de vision en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 125.107.954.560 (~125B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible para el modelo base; las evaluaciones se realizaron con limites de 1.024 y 2.048 tokens |
| Tipos de cuantizacion | GSQ-RCO no uniforme a 3,5 bits objetivo; shards de embeddings en BF16 o Q4_0/Q8_0; proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 259,5 GB |
| Bits por peso (modelo completo) | 3,500 con embeddings Q4_0/Q8_0; 6,855 con embeddings BF16 |
| Runtime requerido | llama.cpp con soporte Qwen4Exp y Q2_0, commit f3f1a8f |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next (tipo de transformer, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF/DPO). Lo que si se documenta es el proceso de cuantizacion: cada tensor de pesos recibe su propio tipo de cuantizacion mediante una busqueda que asigna precision segun la sensibilidad por tensor bajo un presupuesto exacto de tamano total.

GSQ es una cuantizacion escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion de Gumbel-Softmax. RCO asigna uno de K tipos de cuantizacion a cada uno de N tensores bajo un presupuesto exacto de tamano, reformulado como una variedad riemanniana suave en el espacio de logits. El modelo utiliza un shard separado para los embeddings de token y de n-gramas, lo que permite elegir entre la version BF16 (103,68 GB) o la version Q4_0/Q8_0 (29,49 GB).

## Capacidades

- Generacion de texto conversacional (tag "conversational").
- Procesamiento multimodal image-text-to-text: incluye codificador de vision y proyector (`mmproj`) en BF16.
- Razonamiento con modo "thinking" (las evaluaciones de GSM8K se realizaron con "xhigh thinking").
- Seguimiento de instrucciones (evaluado con IFEval).
- Razonamiento matematico (evaluado con GSM8K).
- Conocimiento general y academico (evaluado con MMLU-Pro en 14 categorias).
- Soporte de endpoints compatibles (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo de ~125B en hardware de consumo: gracias a la cuantizacion a 3,5 bits y a la separacion de embeddings en disco, es viable ejecutarlo en 2x RTX 3090, lo que permite experimentar con un modelo de gran escala sin infraestructura de centro de datos.
- Asistencia multimodal con imagenes: el proyector de vision en BF16 permite tareas de image-text-to-text, como descripcion de imagenes, respuesta a preguntas visuales o extraccion de informacion de documentos escaneados.
- Razonamiento matematico en produccion ligera: el modelo mantiene 8/8 en GSM8K con modo thinking, por lo que es adecuado para resolver problemas aritmeticos y de razonamiento paso a paso en entornos con recursos limitados.
- Evaluacion e investigacion de tecnicas de cuantizacion: el repositorio incluye paquete de evaluacion, manifiestos y datos de reproducibilidad, lo que lo convierte en una referencia practica para estudiar GSQ y RCO sobre modelos multimodales grandes.
- Seguimiento de instrucciones en asistentes conversacionales: con 13/16 en IFEval estricto, puede integrarse en chatbots que requieran obedecer formatos y restricciones concretas, siempre con validacion adicional.
- Prototipado de pipelines de vision-lenguaje en local: util para desarrolladores que quieran probar flujos de image-text-to-text sin depender de APIs externas, manteniendo los datos en su propio hardware.
- Benchmarking comparativo de modelos cuantizados: sirve como punto de comparacion frente a otras cuantizaciones del mismo modelo base, dado que el autor publica resultados detallados de perplejidad, MMLU-Pro, IFEval y GSM8K.

## Benchmarks y rendimiento

Evaluaciones realizadas con el shard de embeddings BF16, sin razonamiento y con limite de contexto de 2.048 tokens para MMLU-Pro (zero-shot, respuestas de un solo token A-J, 2.000 preguntas estratificadas en 14 categorias, semilla fija):

| Build | Correctas | Precision | Error estandar |
|---|---:|---:|---:|
| GSQ-RCO 3.5-bit | 1.165/2.000 | 58,25% | 1,10 pp |
| Referencia BF16 | 1.108/2.000 | 55,40% | 1,11 pp |

La diferencia pareada es de +2,85 puntos porcentuales (226 solo correctas en cuantizado / 169 solo en BF16; McNemar exacto bilateral p = 0,0047752).

Resultados adicionales (perplejidad sobre ocho contextos de 1.024 tokens, 4.088 tokens puntuados, texto held-out disjunto por documento; decodificacion greedy; IFEval respondido directamente; GSM8K con thinking xhigh; limites de 1.024/2.048 tokens):

| Variante | PPL nativa (menor es mejor) | KL/token aproximada (menor es mejor) | IFEval estricto | IFEval completado correcto | GSM8K completado correcto |
|---|---:|---:|---:|---:|---:|
| Referencia BF16 | 3,0533 | — | 13/16 | 13/16 | 8/8 |
| GSQ-RCO | 3,1058 | 0,111225 | 13/16 | 12/16 | 8/8 |

La KL es aproximada, calculada a partir de la cache de referencia nativa uint16. Una respuesta de IFEval del modelo cuantizado fue truncada.

## Requisitos de hardware

- VRAM estimada: no se proporciona una cifra exacta de VRAM; el autor indica que el modelo corre en 2x RTX 3090 (48 GB combinados) con embeddings en disco y KV cache en RAM.
- Pesos principales: 47,94 GB (`Qwen3.8-Flash-Next-GSQ-RCO-3.5bit.gguf`).
- Shard de embeddings: 103,68 GB en BF16 o 29,49 GB en Q4_0/Q8_0.
- Proyector de vision: 0,91 GB en BF16.
- GPU recomendadas: RTX 3090 (2 unidades segun el autor); no se especifican otras GPU en la informacion disponible.
- Cabe en GPU de consumo: si, en 2x RTX 3090 segun la model card.
- Opciones de despliegue: llama.cpp con soporte Qwen4Exp y Q2_0, fijado al commit upstream f3f1a8f. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~125B | no disponible | safetensors (BF16) | qwen-community-1.0 | Referencia de calidad; requiere hardware de centro de datos |
| Qwen3.8-Flash-Next-GSQ-RCO-GGUF (este) | ~125B | no disponible | GGUF 3,5 bits | qwen-community-1.0 | Ejecutable en 2x RTX 3090; +2,85 pp en MMLU-Pro frente a BF16 |
| Otras cuantizaciones del mismo modelo base | ~125B | no disponible | GGUF | qwen-community-1.0 | No se dispone de datos comparativos en la informacion proporcionada |

No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Reproduccion comunitaria independiente: no es una publicacion oficial del IST-DASLab ni de Qwen, y no cuenta con el respaldo de los autores de los papers.
- La cuantizacion a 3,5 bits introduce perdida de calidad: perplejidad 3,1058 frente a 3,0533 de BF16 y una respuesta truncada en IFEval.
- El shard de embeddings es obligatorio: el archivo principal no funciona sin descargar ademas uno de los shards de embeddings.
- Runtime especifico: requiere llama.cpp con soporte Qwen4Exp y Q2_0 en el commit f3f1a8f; otras versiones pueden no ser compatibles.
- Las evaluaciones se limitaron a contextos de 1.024 y 2.048 tokens, por lo que el comportamiento en contextos largos no esta documentado.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingue.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Qwen Community 1.0: es necesario revisar sus terminos para uso comercial, ya que puede imponer restricciones adicionales.
- El repositorio ocupa 259,5 GB, lo que exige espacio de almacenamiento considerable incluso si solo se descargan algunos archivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pfeifferj/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Organizacion DASLab: https://github.com/IST-DASLab
- llama.cpp (commit f3f1a8f): https://github.com/ggml-org/llama.cpp/commit/f3f1a8f2760f28325a5ec20c05b171e5b7c83a29
- Paquete de evaluacion: eval/2026-09-13/README.md (dentro del repositorio)
- Instrucciones de reproducibilidad: eval/2026-09-13/reproducibility/README.md (dentro del repositorio)
- DOI: 10.57967/hf/10398
