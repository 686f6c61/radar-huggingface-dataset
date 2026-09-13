# internlm/Intern-S2-397B

## Resumen
Intern-S2-397B es un modelo fundacional multimodal de tipo image-text-to-text desarrollado por InternLM (Shanghai AI Laboratory), presentado como su modelo mas capaz para inteligencia cientifica y agentes de horizonte largo. Segun los pesos publicados en safetensors, cuenta con 403.423.094.768 parametros totales (unos 403,4 mil millones, por encima de los 397B que sugiere el nombre), con un repositorio de 806,9 GB, coherente con pesos en BF16. La etiqueta de arquitectura de HuggingFace es qwen3_5_moe, lo que indica una mezcla de expertos, aunque no se detalla el numero de expertos ni los parametros activos.

El modelo escala en tres ejes: preentrenamiento vision-lenguaje, cobertura de tareas de aprendizaje por refuerzo y entornos de agente interactivos. Su propuesta diferencial es un paradigma de preentrenamiento visual que aprende directamente de paginas crudas de literatura cientifica, modelando de forma conjunta semantica simbolica y relaciones visuales sin parsing intermedio. A esto se suma un entrenamiento de refuerzo multi-tarea en mas de 20 dominios cientificos y un RL agentico de horizonte largo sobre entornos sandbox.

Es relevante ahora porque compite en la categoria de modelos abiertos de gran escala con licencia Apache 2.0, con soporte declarado para tool calling, despliegue en LMDeploy, vLLM y SGLang, y ventanas de evaluacion de hasta 256.000 tokens en texto y 64.000 en multimodal. La publicacion en HuggingFace figura fechada el 13 de septiembre de 2026, con 9 me gusta y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); etiqueta de HuggingFace: qwen3_5_moe |
| Parametros totales | 403.423.094.768 (≈403,4 mil millones), segun los pesos en safetensors |
| Parametros activos | no disponible (la etiqueta qwen3_5_moe indica MoE, pero no se especifican expertos ni parametros activos) |
| Longitud de contexto | no declarada de forma explicita; las evaluaciones del autor usan hasta 256.000 tokens en texto y 64.000 tokens en multimodal |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; la cuantizacion requeriria herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a LICENSE en el repositorio) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 806,9 GB |
| Frameworks de despliegue soportados | LMDeploy, vLLM, SGLang |
| Parametros de muestreo recomendados | top_p = 0.95, top_k = 50, min_p = 0.0, temperature = 0.8 |
| Fecha de publicacion en HuggingFace | 13 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento
La informacion disponible no detalla el numero de capas, la configuracion del router de expertos ni el balance entre parametros totales y activos. La etiqueta qwen3_5_moe apunta a una arquitectura de mezcla de expertos heredada del linaje Qwen 3.5, combinada con un codificador visual para entrada de imagen y texto. El modelo se evalua con longitudes de inferencia de hasta 256K tokens en texto y 64K en multimodal, lo que da una cota inferior de su ventana de contexto efectiva, aunque el autor no declara el valor nominal.

El autor describe tres innovaciones. La primera es un paradigma de preentrenamiento vision-lenguaje que consume paginas crudas de literatura cientifica y modela conjuntamente semantica simbolica y relaciones visuales en un espacio de representacion compartido, sin parsing intermedio, lo que preserva la correspondencia texto-imagen y mejora el razonamiento espacial y visual. La segunda es un entrenamiento de refuerzo multi-tarea a gran escala sobre mas de 20 dominios cientificos, orientado a tareas como diseno de interacciones biomoleculares y generacion de estructuras de materiales. La tercera es un RL agentico de horizonte largo que conecta varios frameworks de agente con entornos sandbox a gran escala para aprendizaje por refuerzo de caja negra.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas concretas de alineacion como RLHF o DPO mas alla de la mencion generica al aprendizaje por refuerzo.

## Capacidades
- Generacion de texto y razonamiento general, con evaluaciones declaradas en conjuntos de texto a 256K tokens de longitud de inferencia.
- Comprension multimodal image-text-to-text: entrada conjunta de imagenes y texto, incluyendo paginas de literatura cientifica sin parsing previo.
- Razonamiento y generacion en dominios cientificos: el autor menciona diseno de interacciones biomoleculares y generacion de estructuras de materiales entre mas de 20 dominios de RL.
- Tool calling / function calling con API compatible con OpenAI, demostrado en la model card con funciones de ejemplo (consulta de temperatura actual y por fecha) sobre un servidor LMDeploy.
- Comportamiento agentico de horizonte largo y razonamiento multi-paso, entrenado con RL sobre entornos sandbox y evaluado con AgentCompass.
- Capacidades multilingues: no disponible; no se declara la lista de idiomas soportados.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades adicionales: no documentado en la informacion disponible.

## Casos de uso
- Analisis de literatura cientifica: el modelo puede ingerir paginas completas de articulos, incluidas figuras y tablas, sin necesidad de convertir el PDF a texto estructurado, gracias a su preentrenamiento sobre paginas crudas; resulta adecuado para revisiones sistematicas y extraccion de relaciones entre simbolos, moleculas y graficos.
- Diseno de interacciones biomoleculares: el entrenamiento por refuerzo en dominios cientificos permite plantear tareas de prediccion y generacion de candidatos de union molecula-diana dentro de un flujo de trabajo asistido, siempre con validacion experimental posterior.
- Generacion de estructuras de materiales: uso como asistente en la propuesta y filtrado de estructuras candidatas antes de simulaciones costosas de primeros principios, aprovechando su especializacion en dominios cientificos.
- Agentes de horizonte largo para automatizacion de tareas: integrado en frameworks de agente con tool calling compatible con OpenAI, puede encadenar decenas de pasos (busqueda, ejecucion de codigo, consulta a APIs) para completar flujos de trabajo largos.
- Asistente de I+D con contexto documental extenso: con hasta 256K tokens en texto, admite la carga de manuales tecnicos, normativas o corpus internos completos en una sola sesion sin troceado agresivo, util para consultas con trazabilidad a fuentes.
- Evaluacion de documentacion tecnica multimodal: al aceptar imagen y texto, puede revisar planos, diagramas de arquitectura o capturas de paneles de instrumentacion y responder preguntas sobre ellos en el mismo contexto que el texto asociado.
- Automatizacion de pipelines cientificos con herramientas externas: mediante function calling puede invocar simuladores, bases de datos de compuestos o servicios de calculo, y decidir el siguiente paso en funcion de los resultados devueltos.

## Benchmarks y rendimiento
No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una figura comparativa de rendimiento frente a otros modelos VLM y LLM, con la convencion de subrayado para el mejor resultado entre modelos abiertos y negrita para el mejor global, evaluada con OpenCompass, VLMEvalKit y AgentCompass, pero los valores concretos no son extraibles del material proporcionado. No se deben asumir cifras para MMLU, HumanEval, GSM8K u otros conjuntos.

## Requisitos de hardware
Nota: las cifras de esta seccion son estimaciones derivadas del recuento de parametros y del tamano del repositorio; el autor no publica requisitos oficiales.

- Pesos en BF16: 806,9 GB solo de pesos (el repositorio completo ocupa ese tamano). La inferencia requiere al menos unos 810 GB de VRAM agregada mas la cache KV.
- Pesos en FP8: alrededor de 403 GB de pesos, mas cache KV; un nodo de 8x H100 80 GB (640 GB) es un punto de partida razonable con paralelismo tensorial.
- Pesos en 4 bits: alrededor de 200-220 GB, incluido el overhead de cuantizacion; requiere al menos 3x H100 80 GB o 4x para dejar margen a la cache KV.
- GPU recomendadas: H100 80 GB, H200 o A100 80 GB en configuraciones multi-GPU con paralelismo tensorial. Para BF16 hacen falta del orden de 11 aceleradores de 80 GB.
- GPU de consumo: no cabe en una unica GPU de consumo. Incluso 8x RTX 4090 (192 GB agregados) no bastan para una cuantizacion de 4 bits con cache KV suficiente; el despliegue en hardware de consumo no es realista a este tamano.
- Opciones de despliegue: LMDeploy, vLLM y SGLang son los frameworks soportados oficialmente, con ejemplos en la guia de despliegue del repositorio. Para cuantizaciones de bajos bits habria que recurrir a estos frameworks o a herramientas externas de cuantizacion, ya que el repositorio solo distribuye safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
La informacion proporcionada no incluye datos verificables de los modelos de comparacion, por lo que los campos se marcan como no disponibles en lugar de estimarse.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Intern-S2-397B | 403,4 mil millones totales; activos no disponibles | no declarada; evaluado a 256K texto / 64K multimodal | Apache 2.0 | solo figura comparativa, sin cifras extraibles | HuggingFace, ModelScope |
| Alternativas abiertas de gran escala tipo MoE multimodal (por ejemplo, familias DeepSeek, Qwen o Llama en sus variantes mayores) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos en formato numerico, por lo que no es posible establecer una comparacion cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible. Al ser un modelo entrenado mayoritariamente sobre literatura cientifica y datos web, cabe esperar sesgos de dominio y de representacion linguistica, pero no hay analisis publicado en el material consultado.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de factualidad. En tareas cientificas y de generacion de estructuras, cualquier salida debe validarse con herramientas externas o experimentos antes de usarse.
- Contexto e idioma: la ventana de contexto nominal no esta declarada; solo se conocen las longitudes usadas en evaluacion (256K texto, 64K multimodal). La lista de idiomas soportados no esta disponible, lo que impide garantizar un rendimiento homogeneo fuera del ingles y el chino.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se debe conservar el aviso de licencia y el enlace al archivo LICENSE del repositorio. Conviene revisar la licencia de los pesos finales si se redistribuyen versiones cuantizadas.
- Requisitos de produccion: con 403,4 mil millones de parametros y 806,9 GB de pesos, el despliegue exige infraestructura multi-GPU con paralelismo tensorial; no es viable en una sola GPU ni en hardware de consumo.
- Disponibilidad de cuantizaciones: el repositorio solo publica safetensors, sin versiones GGUF ni cuantizadas oficiales, lo que obliga a generar las versiones de bajos bits por cuenta propia y verificar su calidad.
- Madurez: el repositorio registra 0 descargas y 9 me gusta en el momento de la consulta, y la fecha indicada de publicacion es posterior a la de esta ficha, por lo que la validacion independiente por parte de la comunidad es practicamente inexistente.
- Coherencia de nomenclatura: el nombre comercial indica 397B mientras que el recuento real de safetensors es de 403,4 mil millones de parametros; conviene usar la cifra real al dimensionar hardware.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/internlm/Intern-S2-397B
- Licencia: https://huggingface.co/internlm/Intern-S2/blob/main/LICENSE
- Repositorio GitHub (enlazado desde la model card): https://github.com/InternLM/Intern-S1
- Coleccion de modelos en HuggingFace: https://huggingface.co/collections/internlm/intern-s2
- Coleccion de modelos en ModelScope: https://modelscope.cn/collections/Shanghai_AI_Laboratory/intern-s2
- Demo de chat en linea: https://chat.intern-ai.org.cn/
- Discord del proyecto: https://discord.gg/xa29JuW87d
- OpenCompass (entorno de evaluacion citado): https://github.com/open-compass/OpenCompass/
- VLMEvalKit (entorno de evaluacion citado): https://github.com/open-compass/vlmevalkit
- AgentCompass (entorno de evaluacion citado): https://github.com/open-compass/AgentCompass
- Guia de despliegue (referenciada como deployment_guide.md dentro del repositorio del modelo)
- Paper o informe tecnico: no disponible en la informacion proporcionada
