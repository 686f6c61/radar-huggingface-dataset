# mradermacher/AgentMercury-Qwen3.5-35B-A3B-GGUF

## Resumen

AgentMercury-Qwen3.5-35B-A3B-GGUF es una cuantización en formato GGUF del modelo AgentMercury-Qwen3.5-35B-A3B, un fine-tune creado por Minbyul sobre el modelo base Qwen3.5-35B-A3B de Alibaba. Este modelo base pertenece a la familia Qwen3.5, lanzada en agosto de 2026, que introduce arquitecturas híbridas de razonamiento multimodal con mezcla de expertos (MoE). La versión GGUF, generada por mradermacher, incluye múltiples niveles de cuantización (desde Q2_K hasta f16) y está pensada para su ejecución local en hardware de consumo mediante motores como llama.cpp, Ollama o LM Studio.

El modelo base Qwen3.5-35B-A3B destaca por su relación entre rendimiento y eficiencia: con 34,66 mil millones de parámetros totales y solo 3 mil millones activos por token, logra superar en benchmarks a modelos mucho más grandes como Qwen3-235B-A22B, según declaraciones de Alibaba. Esta cuantización GGUF permite aprovechar esas capacidades en entornos con VRAM limitada, lo que la hace relevante para desarrolladores que necesitan desplegar un asistente multimodal de razonamiento en local, sin depender de APIs en la nube.

La ficha se basa en la información disponible del repositorio de HuggingFace y en datos públicos del modelo base Qwen3.5. No se dispone de documentación específica sobre el fine-tune AgentMercury, por lo que las capacidades descritas corresponden al modelo base salvo indicación contraria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) hibrida con atencion transformer y componentes multimodales (vision-lenguaje) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | 3 B (segun nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 soporta multiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | no disponible (la licencia del modelo base Qwen3.5 no se ha confirmado para este repo) |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un modelo de lenguaje multimodal de razonamiento hibrido. Combina una arquitectura transformer con capas de atencion tradicional y mezcla de expertos (MoE), donde de los 34,66 B parametros totales solo se activan 3 B por token, lo que reduce significativamente el coste computacional en inferencia. Segun la documentacion de Unsloth y el blog oficial de Qwen, la familia Qwen3.5 incluye modelos que integran vision y lenguaje de forma nativa, con capacidades de razonamiento mejoradas mediante entrenamiento por refuerzo (RL). Alibaba afirma que Qwen3.5-35B-A3B supera a Qwen3-235B-A22B en benchmarks, atribuyendolo a mejoras en arquitectura, calidad de datos y tecnicas de RL.

El fine-tune AgentMercury, desarrollado por Minbyul, parte de este modelo base, pero no se dispone de informacion publica sobre el proceso de entrenamiento, el dataset utilizado ni las tecnicas de ajuste (como RLHF o DPO). El repositorio de cuantizacion de mradermacher indica que se trata de "static quants" del modelo original, es decir, una conversion directa de los pesos a formato GGUF sin modificaciones adicionales. Por tanto, las caracteristicas de entrenamiento especificas del fine-tune no estan disponibles.

## Capacidades

Las capacidades listadas corresponden al modelo base Qwen3.5-35B-A3B, ya que no hay informacion especifica sobre el fine-tune AgentMercury. Se asume que el fine-tune mantiene la mayoria de estas capacidades, pero no esta confirmado.

- Generacion de texto y razonamiento complejo: el modelo base esta disenado para tareas de razonamiento multi-step, con un modo de pensamiento explicito (thinking mode) similar a otros modelos de la serie Qwen3.
- Comprension multimodal: al ser un modelo de vision-lenguaje nativo, puede procesar imagenes junto con texto, aunque no se ha verificado si esta capacidad se conserva en el fine-tune.
- Generacion de codigo: soporta tareas de programacion en multiples lenguajes, con buen rendimiento en benchmarks de codigo segun las declaraciones de Alibaba.
- Tool calling y function calling: el modelo base incluye soporte para invocar herramientas externas, lo que permite integrarlo en flujos de trabajo agenciales.
- Capacidades multilingues: el modelo base de Qwen3.5 soporta varios idiomas, aunque no se detalla la lista exacta.
- Razonamiento matematico: el entrenamiento con RL mejora las capacidades aritmeticas y de resolucion de problemas matematicos.

## Casos de uso

- Asistente local multimodal: al ser una cuantizacion GGUF, puede ejecutarse en una estacion de trabajo con GPU de 24 GB (p. ej., RTX 3090/4090) para responder preguntas sobre imagenes y texto, util en entornos sin conexion o con requisitos de privacidad.
- Generacion de codigo asistida en local: un desarrollador puede integrar el modelo en su IDE mediante Ollama o llama.cpp para autocompletar y refactorizar codigo, aprovechando los 3 B de parametros activos para una latencia baja en hardware de gama media.
- Agente de automatizacion de tareas: con soporte de tool calling, el modelo puede orquestar llamadas a APIs, ejecutar scripts y gestionar flujos de trabajo multi-paso, desplegado en un servidor con vLLM o TGI.
- Chatbot de soporte tecnico: su capacidad de razonamiento y contexto largo (aunque no se conoce la longitud exacta) lo hace adecuado para mantener conversaciones multi-turno sobre documentacion tecnica o bases de conocimiento internas.
- Prototipado rapido de aplicaciones de IA: al ser un modelo GGUF, se puede descargar y probar localmente sin necesidad de infraestructura en la nube, ideal para validar ideas antes de escalar a modelos mas grandes.
- Analisis de documentos con imagenes: si el fine-tune conserva la vision del modelo base, puede extraer informacion de capturas, diagramas o formularios escaneados, combinando texto e imagen en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el modelo AgentMercury-Qwen3.5-35B-A3B en la informacion disponible. El modelo base Qwen3.5-35B-A3B, segun Alibaba, supera a Qwen3-235B-A22B y a Qwen3-VL-235B-A22B en evaluaciones internas, pero no se proporcionan numeros concretos en las fuentes consultadas. Tampoco se dispone de comparativas independientes (como MMLU, HumanEval o GSM8K) para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, el archivo de pesos ocupa aproximadamente 20 GB (estimacion a partir del tamano total del repo de 32,8 GB para todas las cuantizaciones). En Q2_K, podria reducirse a unos 14 GB, aunque con perdida de calidad.
- GPU recomendadas: para Q4_K_M o superior, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000). Para Q2_K o Q3_K, una GPU de 16 GB (RTX 4080, RTX 3080 Ti) podria ser suficiente.
- En CPU: el modelo puede ejecutarse en CPU con llama.cpp, pero la velocidad sera lenta (del orden de 1-3 tokens/s en un procesador de gama alta) debido al tamaño de los pesos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp, y servidores compatibles con GGUF como llama-cpp-python. Para despliegue en produccion con mayor throughput, se puede convertir a formatos como AWQ o GPTQ, aunque no estan incluidos en este repo.
- Latencia y throughput: no se dispone de mediciones concretas. Con 3 B de parametros activos, la latencia por token deberia ser significativamente menor que la de un modelo denso de 35 B, pero depende del hardware y de la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo base Qwen3.5-35B-A3B se posiciona como un MoE eficiente, comparable en filosofia a otros modelos como Qwen3-30B-A3B (si existiera) o Mixtral 8x7B (47 B totales, 13 B activos), pero no hay datos publicos de rendimiento del fine-tune AgentMercury frente a estas alternativas. La licencia y disponibilidad del modelo base tampoco estan confirmadas en las fuentes consultadas.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo base Qwen3.5 ni del fine-tune AgentMercury. Esto impide confirmar si es apto para uso comercial o si tiene restricciones de redistribucion. Antes de usarlo en produccion, es necesario contactar con los autores o verificar la licencia original.
- Sesgos y alucinaciones: no hay informacion sobre sesgos especificos del fine-tune. Como modelo de lenguaje, es susceptible de generar contenido inexacto o inventado, especialmente en dominios especializados.
- Capacidades de vision no confirmadas: aunque el modelo base es multimodal, no se ha verificado que el fine-tune AgentMercury conserve el procesamiento de imagenes. Si se necesita esa funcionalidad, es recomendable probar el modelo antes de integrarlo.
- Longitud de contexto desconocida: no se ha publicado el tamaño de la ventana de contexto. Esto limita el uso en tareas que requieran documentos largos o conversaciones extensas.
- Cuantizaciones agresivas: los formatos Q2_K y Q3_K pueden degradar notablemente la calidad de las respuestas, especialmente en tareas de razonamiento complejo. Se recomienda usar Q4_K_M o superior para produccion.
- Sin soporte oficial: al ser un repo de cuantizacion de un tercero (mradermacher), no hay garantias de mantenimiento ni de correccion de errores. El modelo original de Minbyul tampoco tiene una documentacion publica extensa.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/AgentMercury-Qwen3.5-35B-A3B-GGUF
- Modelo original de Minbyul: https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-35B-A3B
- Modelo base Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Cuantizacion GGUF de Unsloth (referencia): https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Blog oficial de Qwen sobre Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Documentacion de Unsloth sobre Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Pagina de LM Studio sobre Qwen3.5: https://lmstudio.ai/models/qwen3.5
