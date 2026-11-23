# moonbox-dev/Ministral-3-14B-Instruct-2512-MLX

## Resumen

Ministral 3 14B Instruct 2512 MLX es una compilación cuantizada del modelo multimodal Ministral 3 14B Instruct 2512 de Mistral AI, adaptada específicamente para su ejecución en Macs con Apple Silicon mediante el framework MLX. El autor de esta conversión es moonbox-dev, que publica builds de pesos en formato safetensors listos para cargar con mlx-vlm, incluyendo config.json, tokenizer, chat template y ajustes de procesador de imagen. No se trata de un lanzamiento oficial de Mistral AI, sino de una redistribución cuantizada del modelo base.

El modelo base es un transformer de 14 000 millones de parámetros con capacidad de visión (pipeline image-text-to-text), afinado para instrucciones y con licencia Apache 2.0. Esta versión MLX ofrece dos niveles de cuantización (8 bits y 6 bits) con métricas de degradación medidas frente al original en bf16: el build de 8 bits presenta una divergencia KL de 0,0007 nats y un 97,9 % de acuerdo top-1, mientras que el de 6 bits sube a 0,0028 nats y un 96,4 % de acuerdo top-1. El repositorio ocupa 36,9 GB en total.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de 14B en hardware de consumo Apple sin GPU dedicada, algo que con pesos bf16 requeriría aproximadamente 28 GB solo para los pesos. La cuantización a 8 bits reduce el peso a unos 15,2 GB, y la de 6 bits a unos 11,4 GB, lo que hace viable la inferencia local en equipos con memoria unificada de 24 GB o 32 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), modelo base Mistral 3 |
| Parametros totales | 14 000 millones (14B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits y 6 bits (builds MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con config.json, tokenizer, chat template y processor_config.json |

## Arquitectura y entrenamiento

El modelo base Ministral 3 14B Instruct 2512 es un transformer denso de 14B parámetros con torre de visión, diseñado para tareas image-text-to-text y afinado para seguir instrucciones. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; tampoco se especifica si incorpora innovaciones como atención lineal o decodificación especulativa. Lo que sí se documenta es el proceso de cuantización realizado por moonbox-dev: conversión de los pesos bf16 originales a precisiones de 8 y 6 bits mediante MLX, con evaluación de la degradación mediante divergencia KL, acuerdo top-1 y perplejidad sobre el modelo original.

Los builds incluyen todos los artefactos necesarios para mlx-vlm: pesos sharded en seis ficheros safetensors, config.json, generation_config.json, tokenizer.json, tokenizer_config.json, special_tokens_map.json, chat_template.jinja y processor_config.json. El build de 8 bits mantiene una perplejidad de 14,10 idéntica a la del modelo original, mientras que el de 6 bits la eleva ligeramente a 14,15.

## Capacidades

- Generación de texto e instrucciones en formato conversacional, con chat template incluido.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), gracias a la torre de visión del modelo base.
- Razonamiento y respuesta a instrucciones complejas, propio de un modelo Instruct afinado.
- Ejecución local en Apple Silicon mediante MLX y mlx-vlm, sin necesidad de GPU NVIDIA.
- Soporte de cuantización a 8 y 6 bits con degradación medida y documentada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y modo agente: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede procesar capturas de pantalla, diagramas o fotografías junto a preguntas en lenguaje natural, ejecutándose íntegramente en un Mac con Apple Silicon mediante mlx-vlm, sin enviar datos a la nube.
- Análisis de documentos escaneados: al combinar visión y generación de texto, permite extraer y resumir información de facturas, formularios o informes en PDF convertidos a imagen, con la ventaja de privacidad de la inferencia local.
- Prototipado de aplicaciones de visión por computador: desarrolladores que necesiten validar pipelines image-text-to-text pueden usar el build de 8 bits (15,2 GB) en un Mac de 32 GB de memoria unificada antes de migrar a infraestructura con GPU.
- Generación de descripciones y alt-text accesible: el modelo puede describir imágenes para sistemas de accesibilidad o catalogación de contenido visual, ejecutándose en un portátil Apple sin coste de API.
- Investigación en cuantización: los datos de divergencia KL, acuerdo top-1 y perplejidad publicados por el autor permiten estudiar el impacto de 8 y 6 bits sobre un modelo multimodal de 14B, sirviendo como referencia para experimentos de compresión.
- Educación y demos offline: en entornos sin conectividad o con requisitos de soberanía de datos, el modelo permite demostrar capacidades multimodales de 14B en hardware de consumo Apple, con el build de 6 bits (11,4 GB) como opción para equipos de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al modelo original en bf16:

| Build | Divergencia KL | KL p95 | Acuerdo top-1 | Perplejidad (vs original) |
|---|---|---|---|---|
| 8 bits | 0,0007 nats | 0,0019 | 97,9 % | 14,10 vs 14,10 |
| 6 bits | 0,0028 nats | 0,0074 | 96,4 % | 14,15 vs 14,10 |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el build de 8 bits ocupa aproximadamente 15,2 GB en pesos (suma de los seis shards: 3,03 + 2,58 + 2,58 + 2,58 + 2,58 + 1,86 GB); el de 6 bits, aproximadamente 11,4 GB. A ello hay que añadir la memoria para el contexto KV y el procesador de imagen.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para GPU NVIDIA.
- Cabe en consumer hardware: sí, en Macs con memoria unificada de 24 GB o superior para el build de 6 bits, y de 32 GB o superior para el de 8 bits con contexto moderado.
- Opciones de despliegue: mlx-vlm (librería indicada por el autor), MLX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato MLX específico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 14B Instruct 2512 MLX (esta ficha) | 14B | no disponible | imagen-texto | Apache 2.0 | Hugging Face (moonbox-dev) |
| Ministral 3 14B Instruct 2512 (bf16, Mistral AI) | 14B | no disponible | imagen-texto | Apache 2.0 | Hugging Face (mistralai) |
| Ministral 3 14B Instruct 2512 MLX 6 bits | 14B | no disponible | imagen-texto | Apache 2.0 | Hugging Face (moonbox-dev) |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada para establecer una comparación de rendimiento con alternativas de otros fabricantes.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Mistral AI: es una conversión no oficial realizada por moonbox-dev, por lo que la responsabilidad sobre la calidad del build recae en el autor de la cuantización.
- Solo compatible con Apple Silicon y MLX; no puede desplegarse en GPU NVIDIA, vLLM, llama.cpp, Ollama ni TGI sin reconversión.
- La cuantización introduce degradación: el build de 6 bits baja al 96,4 % de acuerdo top-1 y eleva la perplejidad de 14,10 a 14,15; para tareas sensibles a la precisión conviene usar el de 8 bits.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas con garantías.
- Los idiomas soportados no están documentados; no se puede confirmar el rendimiento en castellano sin evaluación propia.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de sesgo o robustez para este build.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una conversión no oficial conviene verificar los términos del modelo base de Mistral AI antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Ministral-3-14B-Instruct-2512-MLX
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Modelo base en bf16: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado en los tags (arXiv:2601.08584): https://arxiv.org/abs/2601.08584
