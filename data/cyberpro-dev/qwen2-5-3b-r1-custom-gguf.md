# cyberpro-dev/Qwen2.5-3B-R1-Custom-GGUF

## Resumen

Qwen2.5-3B-R1-Custom-GGUF es un modelo de lenguaje publicado por el usuario cyberpro-dev en HuggingFace, consistente en un ajuste fino (finetune) del modelo base Qwen2.5-3B-Instruct, posteriormente convertido al formato GGUF mediante la libreria Unsloth. El repositorio contiene un unico archivo de pesos cuantizado en Q4_K_M, junto con un Modelfile de Ollama para su despliegue simplificado, lo que lo situa como un modelo orientado a inferencia local en hardware de consumo. El nombre incluye el sufijo "R1", que sugiere un ajuste orientado a razonamiento, aunque la model card no documenta dicho proceso.

El modelo cuenta con 3.085.938.688 parametros totales (aproximadamente 3,09 mil millones), segun los datos declarados en safetensors, y ocupa 1,9 GB en el repositorio, coherente con una cuantizacion de 4 bits. La etiqueta "conversational" y el ejemplo de uso mediante `llama-cli` confirman su orientacion a generacion de texto conversacional. No se dispone de informacion sobre licencia, idiomas soportados, longitud de contexto ni resultados de evaluacion.

Su relevancia actual es limitada y debe interpretarse con cautela: se trata de un modelo con cero descargas y cero "likes" en el momento de la consulta, sin documentacion tecnica detallada, sin benchmarks publicados y sin licencia declarada, lo que restringe su adopcion en entornos de produccion. Resulta util, no obstante, como ejemplo de pipeline de ajuste fino y cuantizacion con Unsloth, y como modelo ligero para pruebas de concepto de inferencia local con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; derivada del modelo base Qwen2.5-3B-Instruct (transformer decoder-only) |
| Parametros totales | 3.085.938.688 (~3,09 mil millones), segun safetensors |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `qwen2.5-3b-instruct.Q4_K_M.gguf`); resto no disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF; se incluye un Modelfile para Ollama |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que el modelo fue ajustado y convertido a GGUF usando Unsloth, y que el entrenamiento fue "2 veces mas rapido" con dicha libreria. El archivo publicado corresponde a un derivado de Qwen2.5-3B-Instruct, segun el propio nombre del fichero (`qwen2.5-3b-instruct.Q4_K_M.gguf`), lo que implica una arquitectura transformer decoder-only con atencion por consultas agrupadas (GQA) propia de la familia Qwen2.5. No se detalla el numero de capas, dimensiones ocultas ni el mecanismo de atencion exacto en la model card.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o destilacion de razonamiento. El sufijo "R1" del nombre podria indicar un ajuste orientado a razonamiento (en referencia a la familia DeepSeek-R1), pero esto no esta confirmado en la documentacion y debe tratarse como una hipotesis no verificada. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el ejemplo con `llama-cli` confirman el uso previsto como modelo de chat.
- Inferencia en local: compatible con llama.cpp y con el formato GGUF, incluido un Modelfile de Ollama.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con servidores de inferencia compatibles con llama.cpp.
- Razonamiento: el sufijo "R1" del nombre apunta a un posible ajuste para tareas de razonamiento, aunque no hay evidencia documentada que lo confirme.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible. El ejemplo de la model card menciona `llama-mtmd-cli` para modelos multimodales, pero el modelo publicado es unicamente de texto.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con Ollama o llama.cpp en una maquina de sobremesa para mantener conversaciones multi-turno sin conexion, aprovechando su tamano reducido y su cuantizacion Q4_K_M.
- Prototipado rapido de aplicaciones de chat: gracias al Modelfile incluido, un desarrollador puede levantar un endpoint conversacional en minutos y validar la experiencia de usuario antes de invertir en modelos mayores.
- Generacion y resumen de texto en entornos con recursos limitados: al ocupar menos de 2 GB en disco, es apto para dispositivos con poca VRAM o incluso ejecucion parcial en CPU mediante llama.cpp.
- Extraccion de informacion y clasificacion de texto: tareas de etiquetado o extraccion de entidades en lotes pequenos, donde un modelo de 3B con cuantizacion de 4 bits ofrece un coste computacional bajo.
- Educacion y asistentes de estudio: puede emplearse como tutor de practicas o generador de explicaciones, siempre con supervision humana debido al riesgo de alucinacion inherente a modelos de este tamano.
- Investigacion sobre pipelines de ajuste fino: sirve como caso de estudio reproducible de un flujo Unsloth (finetune + conversion a GGUF + despliegue en Ollama) para comparar metodologias.
- Base para ajustes adicionales: al ser un modelo pequeno, puede reentrenarse o adaptarse con LoRA en una unica GPU de consumo para dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2-3 GB de pesos para la cuantizacion Q4_K_M publicada, mas el espacio de la cache KV, que depende de la longitud de contexto y no puede calcularse sin conocerla. En precision FP16 el modelo requeriria aproximadamente 6,2 GB solo para los pesos.
- GPU recomendadas: no hay requisitos oficiales publicados. Por tamano, el modelo es apto para GPU de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 o superiores; tambien puede ejecutarse en CPU con llama.cpp.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU con 8 GB o mas de VRAM en la cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido) y servidores compatibles con GGUF. No se confirma soporte especifico para vLLM, TGI o TensorRT-LLM.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyberpro-dev/Qwen2.5-3B-R1-Custom-GGUF | ~3,09 mil millones | No disponible | No disponible | GGUF (Q4_K_M) en HuggingFace |
| Qwen2.5-3B-Instruct (modelo base de referencia) | ~3,09 mil millones | 32.768 tokens (ampliable con YaRN segun el autor original; dato no verificado en la informacion proporcionada) | Apache-2.0 (dato del modelo original) | Multiples formatos (safetensors, GGUF, AWQ) |
| Llama-3.2-3B-Instruct | ~3,21 mil millones (dato del modelo original) | 128.000 tokens (dato del modelo original) | Llama 3.2 Community License | Multiples formatos |
| Phi-3.5-mini-instruct | ~3,8 mil millones (dato del modelo original) | 128.000 tokens (dato del modelo original) | MIT (dato del modelo original) | Multiples formatos |

Nota: los datos de los modelos comparativos corresponden a informacion publica ampliamente difundida y no han sido verificados en la informacion proporcionada para esta ficha. No existen benchmarks que permitan comparar el rendimiento efectivo del modelo de cyberpro-dev frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que no puede afirmarse su calidad frente al modelo base ni frente a alternativas.
- Licencia no declarada: al no especificarse la licencia, no puede asumirse que el uso comercial este permitido. Es imprescindible contactar con el autor o verificar la licencia del modelo base (Qwen2.5-3B-Instruct) antes de cualquier uso en produccion.
- Idiomas no documentados: se desconoce el soporte multilingue real, lo que impide garantizar un comportamiento correcto fuera del ingles o el chino sin validacion previa.
- Longitud de contexto desconocida: no puede dimensionarse la memoria necesaria para la cache KV ni garantizarse el manejo de conversaciones largas.
- Riesgo de alucinacion: un modelo de ~3 mil millones de parametros presenta una tasa de error y de invencion de hechos superior a la de modelos mayores, especialmente en dominios especializados.
- Adopcion nula: cero descargas y cero "likes" implican ausencia de validacion por parte de la comunidad y de casos de uso reportados.
- Ambiguedad del sufijo "R1": no se documenta que tipo de ajuste de razonamiento se aplico ni con que datos, por lo que no debe asumirse un rendimiento tipo DeepSeek-R1.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos ni de seguridad.
- Fecha de creacion inusual: el repositorio figura como creado el 18 de septiembre de 2026, lo que puede indicar un error de metadatos o de reloj y conviene tenerlo en cuenta al evaluar la trazabilidad del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/cyberpro-dev/Qwen2.5-3B-R1-Custom-GGUF
- Unsloth (libreria empleada en el ajuste y la conversion): https://github.com/unslothai/unsloth

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo. Los unicos resultados obtenidos corresponden a servicios bancarios y de formacion en ciberseguridad (Banque Populaire, Cyberplus, CYBERPRO de Verisafe) y no guardan relacion con el modelo evaluado. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados.
