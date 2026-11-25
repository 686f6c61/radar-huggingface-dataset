# Nikolenko/Qwen3-32B

## Resumen

Qwen3-32B es un modelo de lenguaje causal denso de 32.800 millones de parametros desarrollado por el equipo Qwen de Alibaba. Forma parte de la tercera generacion de la familia Qwen3, que combina modelos densos y de mezcla de expertos (MoE) entrenados para razonamiento, seguimiento de instrucciones, capacidades de agente y soporte multilingue. Este repositorio concreto (Nikolenko/Qwen3-32B) es una redistribucion de los pesos oficiales bajo licencia Apache 2.0, publicada sin modificaciones documentadas y sin descargas ni interacciones registradas en el momento de la ficha.

La innovacion central de la familia es la capacidad de alternar entre un modo de razonamiento explicito (thinking mode), que genera una traza interna antes de responder, y un modo directo (non-thinking mode) para dialogo general, todo dentro del mismo modelo y controlable mediante el parametro `enable_thinking` en la plantilla de chat. El modelo emplea una arquitectura transformer con 64 capas y atencion GQA (64 cabezas de consulta y 8 de clave-valor), con una longitud de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN.

Es relevante porque ofrece un equilibrio poco habitual entre razonamiento de alta calidad y coste de despliegue: con 32.800 millones de parametros densos cabe en configuraciones de una o dos GPU de 80 GB en precision completa, y en GPUs de consumo mediante cuantizacion. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 64 capas, atencion GQA (64 cabezas Q / 8 cabezas KV) |
| Parametros totales | 32.762.123.264 (32,8B); 31,2B sin embeddings |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se distribuyen en safetensors; existen conversiones GGUF/AWQ de la comunidad para el modelo base, no verificadas en este repositorio) |
| Idiomas soportados | 100+ idiomas y dialectos segun la model card; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 65,5 GB) |

## Arquitectura y entrenamiento

Qwen3-32B es un transformer causal denso con 64 capas, normalizacion RMSNorm, activacion SwiGLU y atencion con query-key normalization, siguiendo el diseno de la familia Qwen3. La atencion usa GQA con 64 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de memoria de la cache KV durante la inferencia con contextos largos. El entrenamiento combina una fase de preentrenamiento sobre un corpus multilingue extenso (el numero exacto de tokens no se detalla en la informacion disponible) con una fase de postentrenamiento que incluye ajuste supervisado y optimizacion por preferencias humanas (RLHF/DPO), orientada a mejorar la alineacion, la escritura creativa, el role-play y el seguimiento de instrucciones multi-turno.

La innovacion mas destacable es la integracion de ambos modos de inferencia en un unico conjunto de pesos: el modo thinking produce una traza de razonamiento delimitada por `` antes de la respuesta final, y el modo non-thinking responde directamente. El cambio se realiza en tiempo de plantilla, sin cargar pesos distintos. Para el modo thinking la model card recomienda temperatura 0,6, top-p 0,95, top-k 20 y min-p 0, y advierte explicitamente contra la decodificacion greedy por riesgo de repeticiones infinitas. El contexto largo se habilita mediante YaRN, una tecnica de escalado de las frecuencias rotatorias de RoPE.

## Capacidades

- Generacion de texto y dialogo multi-turno con alineacion orientada a preferencias humanas.
- Razonamiento logico y matematico en modo thinking, con traza explicita de pasos intermedios.
- Generacion y comprension de codigo, incluyendo tareas de depuracion y explicacion.
- Conmutacion entre thinking mode y non-thinking mode mediante `enable_thinking` (disponible tambien en los servidores SGLang y vLLM).
- Soporte de tool calling y function calling en ambos modos, con integracion con herramientas externas.
- Capacidades de agente: razonamiento multi-paso y ejecucion de tareas con herramientas, segun la model card con rendimiento lider entre modelos abiertos.
- Soporte multilingue de mas de 100 idiomas y dialectos, con instrucciones y traduccion.
- Escritura creativa y role-play.
- Procesamiento de contexto largo hasta 131.072 tokens con YaRN.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con historial extenso gracias a su ventana nativa de 32.768 tokens, ampliable a 131.072 con YaRN, y su alineacion para dialogo natural reduce la necesidad de reescritura de respuestas.
- Generacion de codigo en produccion: con soporte de tool calling y modo thinking para tareas complejas, puede integrarse en pipelines de CI/CD como revisor de parches, generador de tests o asistente de depuracion, alternando a modo directo para autocompletado de baja latencia.
- Agentes autonomos con herramientas: su capacidad de razonamiento multi-paso y de invocar funciones externas permite construir flujos de orquestacion (consulta de APIs, extraccion de datos, ejecucion de acciones) con trazas auditables en modo thinking.
- Analisis de documentos largos: informes, contratos o expedientes de hasta 131.072 tokens con YaRN, utiles para resumen, extraccion de entidades y preguntas sobre el documento completo sin troceado.
- Razonamiento matematico y tutorizacion: el modo thinking expone los pasos intermedios, lo que facilita la verificacion de resultados y su uso en herramientas educativas que muestran el razonamiento.
- Traduccion y localizacion multilingue: cobertura de mas de 100 idiomas para traduccion directa y adaptacion de contenido, con instrucciones de estilo y tono.
- Despliegue on-premise con requisitos de soberania de datos: al ser Apache 2.0 y pesos abiertos, puede alojarse en infraestructura propia sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog y la documentacion oficiales de Qwen para las tablas de evaluacion, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 65,5 GB solo para pesos, mas cache KV; requiere al menos 80 GB y en la practica 2 GPU de 80 GB para contextos largos con concurrencia.
- Cuantizacion a 8 bits: en torno a 33-35 GB de pesos, cabe en una A100 80 GB, H100 80 GB o en dos RTX 4090 de 24 GB con tensor parallelism.
- Cuantizacion a 4 bits: en torno a 17-20 GB de pesos, viable en una RTX 4090 (24 GB) o RTX 3090 con contexto moderado; el contexto largo reduce el margen por la cache KV.
- GPU recomendadas: H100 80 GB o A100 80 GB para produccion en BF16; L40S o A6000 para cuantizacion 8 bits; RTX 4090/3090 para 4 bits en uso local.
- Opciones de despliegue: vLLM (>=0.8.5, con `--enable-reasoning --reasoning-parser deepseek_r1`), SGLang (>=0.4.6.post1, con `--reasoning-parser qwen3`), TGI, llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modo thinking | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-32B (este repo) | 32,8B densos | 32.768 nativo / 131.072 con YaRN | Si, conmutable | Apache 2.0 | Pesos abiertos en HF |
| QwQ-32B | 32,8B densos | 131.072 | Si, solo modo razonamiento | Apache 2.0 | Pesos abiertos en HF |
| Qwen2.5-32B-Instruct | 32,8B densos | 131.072 | No | Apache 2.0 | Pesos abiertos en HF |
| DeepSeek-R1-Distill-Qwen-32B | 32,8B densos | 131.072 | Si, solo modo razonamiento | MIT (derivado de Qwen) | Pesos abiertos en HF |

La comparativa se limita a parametros, contexto y licencia porque no hay cifras de rendimiento en la informacion disponible. La diferencia funcional clave frente a QwQ-32B y los distill de R1 es la conmutacion de modo en un mismo modelo, que evita mantener dos despliegues separados para tareas de razonamiento y de dialogo general.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos generativos, especialmente en modo non-thinking y en dominios poco representados en el entrenamiento.
- La decodificacion greedy en modo thinking degrada el rendimiento y puede provocar repeticiones sin fin; es obligatorio usar muestreo con los parametros recomendados.
- El contexto nativo es de 32.768 tokens; superar esa cifra exige activar YaRN, lo que puede afectar a la calidad en tareas que no sean de contexto largo.
- La lista concreta de idiomas soportados no esta disponible; el soporte de 100+ idiomas es una afirmacion de la model card sin evaluacion detallada en la informacion proporcionada.
- Este repositorio es una redistribucion de terceros (Nikolenko) sin descargas ni validacion de la comunidad; para produccion conviene verificar la integridad de los pesos frente al repositorio oficial Qwen/Qwen3-32B.
- La licencia Apache 2.0 permite uso comercial, pero el autor enlaza la licencia del repositorio oficial; conviene revisar el texto exacto antes de desplegar.
- No se dispone de informacion sobre sesgos especificos ni sobre evaluaciones de seguridad en la documentacion proporcionada.
- El tamano del repo (65,5 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nikolenko/Qwen3-32B
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen3-32B
- Licencia oficial: https://huggingface.co/Qwen/Qwen3-32B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
