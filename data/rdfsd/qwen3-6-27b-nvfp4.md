# rdfsd/Qwen3.6-27B-NVFP4

## Resumen

rdfsd/Qwen3.6-27B-NVFP4 es una version cuantizada en NVFP4 (formato de punto flotante de 4 bits de NVIDIA) del modelo Qwen/Qwen3.6-27B, un transformer autorregresivo con atencion hibrida desarrollado por Alibaba. La cuantizacion ha sido realizada con NVIDIA Model Optimizer (nvidia-modelopt v0.45.0), de modo que el artefacto publicado no es un entrenamiento nuevo sino una conversion post-entrenamiento de pesos y activaciones de los operadores lineales de los bloques transformer al tipo de dato NVFP4, lista para inferencia con vLLM. El repositorio pertenece al usuario rdfsd y es un espejo de la publicacion oficial de NVIDIA.

El modelo declara 27B de parametros, una longitud de contexto de hasta 262K tokens y entrada multimodal (texto, imagen y video) con salida exclusivamente de texto. Su arquitectura combina Gated DeltaNet y Gated Attention, un esquema de atencion hibrida que reduce el coste del cache de clave-valor en contextos muy largos, algo relevante para agentes y sistemas RAG que manejan documentos extensos.

La relevancia de esta ficha es doble. Por un lado, permite desplegar un modelo de 27B con pesos de 4 bits en GPUs NVIDIA Hopper y Blackwell, reduciendo el coste de memoria respecto al modelo original en precision completa. Por otro, conviene advertir que el repositorio presenta contradicciones internas: la model card heredada de NVIDIA anuncia 27B de parametros, mientras que los metadatos de safetensors del propio repositorio declaran 18.164.649.200 parametros (18,16B), y la ficha no incluye resultados numericos de benchmarks. Todo ello debe verificarse antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con atencion hibrida (Gated DeltaNet y Gated Attention) |
| Parametros totales | 27B declarados por el autor; 18.164.649.200 segun metadatos de safetensors (discrepancia no resuelta) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | Hasta 262K tokens |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones de operadores lineales de los bloques transformer); la etiqueta del repositorio incluye tambien "8-bit" |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion NVFP4, libreria Model Optimizer) |
| Parametros de inferencia | Nvidia ModelOpt v0.45.0, version NVFP4 1.0 |
| Modalidades de entrada | Texto, imagen (RGB) y video (MP4/WebM) |
| Modalidad de salida | Texto (String) |
| Motor de inferencia soportado | vLLM |
| Microarquitecturas compatibles | NVIDIA Hopper y NVIDIA Blackwell (probado en GB300) |
| Sistema operativo recomendado | Linux |
| Tamano del repositorio | 21,9 GB |
| Modelo base | Qwen/Qwen3.6-27B |
| Fecha de publicacion | 13 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer autorregresivo con una arquitectura de atencion hibrida que combina Gated DeltaNet y Gated Attention. Este diseno mezcla mecanismos de atencion lineal con estado recurrente (Gated DeltaNet) y atencion clasica con compuertas (Gated Attention), lo que permite sostener ventanas de contexto de hasta 262K tokens con un crecimiento del cache de clave-valor mas contenido que en un transformer de atencion densa pura. El modelo acepta entradas de texto, imagen y video, aunque la salida es unicamente textual, lo que lo situa en la categoria de modelos multimodales de entrada con generacion de texto.

Sobre el proceso de cuantizacion, la model card indica que se cuantizaron a NVFP4 los pesos y las activaciones de los operadores lineales dentro de los bloques transformer, usando NVIDIA Model Optimizer v0.45.0. El conjunto de calibracion empleado esta compuesto por cnn_dailymail (mas de 300.000 articulos de noticias en ingles) y Nemotron-Post-Training-Dataset-v2 (conversaciones multi-turno sobre temas diversos curadas por NVIDIA). No se aporta informacion sobre datos de entrenamiento del modelo base: los campos de modalidad, recogida, etiquetado y tamano de los datos de entrenamiento aparecen como "undisclosed" (no divulgados) en la model card. Tampoco se detalla si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y de proposito general, con soporte declarado para chatbots, sistemas RAG y agentes.
- Razonamiento academico y de conocimiento general, segun los conjuntos de evaluacion citados (MMLU Pro, GPQA Diamond, HLE).
- Razonamiento matematico, con AIME 2025 entre las pruebas referenciadas.
- Generacion y razonamiento sobre codigo, incluyendo codigo cientifico (SciCode).
- Uso de herramientas y adhesion a politicas en escenarios de agente (τ²-Bench Telecom), lo que implica soporte de tool calling en entornos multi-turno.
- Seguimiento de instrucciones con restricciones estructuradas (IFBench).
- Recuperacion de informacion en contextos largos (AA-LCR), coherente con la ventana de 262K tokens.
- Comprension multimodal de entrada: imagenes en RGB y video en MP4/WebM, evaluada mediante MMMU Pro.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de atencion al cliente con uso de herramientas: el modelo puede gestionar conversaciones multi-turno en las que consulta sistemas externos y aplica politicas de negocio, un escenario directamente alineado con τ²-Bench Telecom. La ventana de 262K tokens permite arrastrar el historial completo de la interaccion y el contexto de la cuenta sin truncamientos agresivos.
- Sistemas RAG sobre documentacion extensa: con 262K tokens de contexto, es viable insertar manuales tecnicos, contratos o bases de conocimiento completas en un unico prompt y hacer preguntas sobre ellos, apoyandose en AA-LCR como referencia de recuperacion en contexto largo.
- Analisis de documentos con componentes visuales: al aceptar imagenes y video, el modelo puede procesar capturas de pantalla, diagramas, graficos o grabaciones y devolver resumenes y respuestas textuales, util en revision de incidencias o auditoria de material audiovisual.
- Asistencia a la generacion de codigo en pipelines de desarrollo: la presencia de SciCode entre los conjuntos de evaluacion sugiere capacidad para codigo tecnico y cientifico; integrado con tool calling, puede invocarse desde un pipeline de CI/CD para revisar cambios, generar pruebas o explicar errores de compilacion.
- Despliegue en produccion con vLLM sobre GPUs Hopper o Blackwell: el formato NVFP4 y el soporte explicito de vLLM permiten servir el modelo con menor huella de memoria que la version en precision completa, lo que abarata el coste por token en entornos con GPU de ultima generacion.
- Tutoria y resolucion de problemas matematicos o cientificos: el modelo esta evaluado en AIME 2025, GPQA Diamond y HLE, lo que lo hace adecuado para asistentes de estudio que resuelven problemas paso a paso en matematicas, fisica, quimica o biologia.
- Extraccion de informacion estructurada de conversaciones largas: gracias a IFBench y al contexto extendido, puede transformar transcripciones o hilos de soporte en resumenes, clasificaciones y campos normalizados para sistemas posteriores.
- Prototipado e investigacion en cuantizacion: el repositorio sirve como referencia practica de un flujo de cuantizacion NVFP4 con NVIDIA Model Optimizer, util para equipos que quieran replicar el proceso sobre otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente enumera los conjuntos de evaluacion utilizados (MMLU Pro, GPQA Diamond, HLE, τ²-Bench Telecom, MMMU Pro, SciCode, AIME 2025, AA-LCR e IFBench), pero no incluye ninguna puntuacion numerica ni comparacion con otros modelos. Tampoco se facilitan datos de latencia o throughput mas alla de la mencion a vLLM como motor de aceleracion y a GB300 como hardware de prueba.

## Requisitos de hardware

- VRAM estimada para los pesos: el repositorio ocupa 21,9 GB, por lo que se necesita un minimo de aproximadamente 22 GB solo para los pesos. Al tratarse de un formato de 4 bits, el peso teorico de 18,16B parametros rondaria los 9-10 GB, de modo que el tamano real del repositorio sugiere la presencia de escalas, tensores auxiliares o capas en mayor precision; conviene verificar la distribucion exacta antes de dimensionar el despliegue.
- VRAM adicional para el cache KV: no disponible. Con 262K tokens de contexto el consumo puede ser elevado, aunque la arquitectura de atencion hibrida (Gated DeltaNet) reduce estructuralmente el cache frente a una atencion densa equivalente.
- GPUs recomendadas: NVIDIA Hopper (H100, H200) y NVIDIA Blackwell (B200, GB200, GB300). El autor indica que la prueba de inferencia se realizo en NVIDIA GB300.
- GPU de consumo: no disponible como dato confirmado. El formato NVFP4 esta disenado para las tensor cores de 4 bits de Blackwell, presentes en la gama RTX 50; en generaciones anteriores el modelo puede ejecutarse pero sin la aceleracion nativa de FP4. Con aproximadamente 22 GB de pesos, una GPU de consumo necesitaria al menos 24 GB de VRAM y margen adicional para el cache.
- Opciones de despliegue: vLLM es el unico motor soportado explicitamente por el autor. No se menciona compatibilidad con llama.cpp, Ollama, TGI ni transformers, y el formato NVFP4 no es un formato GGUF.
- Sistema operativo: Linux es el sistema preferido segun la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rdfsd/Qwen3.6-27B-NVFP4 (este modelo) | 27B declarados / 18,16B en safetensors | 262K tokens | NVFP4 | Apache 2.0 | HuggingFace, espejo no oficial |
| nvidia/Qwen3.6-27B-NVFP4 | 27B declarados | 262K tokens | NVFP4 | Apache 2.0 | HuggingFace, publicacion oficial de NVIDIA |
| Qwen/Qwen3.6-27B (base) | 27B declarados | 262K tokens | Sin cuantizar (precision original) | Apache 2.0 | HuggingFace |

El dato de contexto y licencia de las tres variantes procede de la informacion disponible; los parametros de la variante base y de la oficial de NVIDIA se toman de lo declarado en la model card. No se dispone de resultados de rendimiento comparados entre estas versiones, ni de alternativas de otros fabricantes con especificaciones verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 27B, pero los metadatos de safetensors del repositorio indican 18.164.649.200 parametros. No se explica la diferencia; conviene verificarla antes de asumir cualquier requisito de memoria o capacidad.
- Repositorio no oficial: el autor es el usuario rdfsd y no NVIDIA ni Alibaba. Aunque las descargas y los likes son cero y la model card parece copiada de la publicacion de NVIDIA, no hay garantia de que los pesos coincidan bit a bit con el artefacto oficial. Para produccion es preferible usar la publicacion de NVIDIA.
- Ausencia total de benchmarks: no se publica ninguna puntuacion, por lo que no es posible validar la afirmacion de calidad ni comparar con el modelo base sin cuantizar.
- Riesgo de degradacion por cuantizacion: la conversion de pesos y activaciones a 4 bits puede afectar a tareas sensibles a la precision numerica, como matematicas, codigo o razonamiento de multiples pasos, sin que el autor aporte mediciones de la perdida.
- Riesgo de alucinacion: no se documentan medidas de mitigacion, evaluaciones de veracidad ni tasas de alucinacion. Como en cualquier modelo generativo, las respuestas deben verificarse en dominios criticos.
- Idiomas soportados: no disponible. No se puede confirmar el comportamiento multilingue ni la calidad fuera del ingles, pese a que los conjuntos de calibracion son mayoritariamente en ingles.
- Sesgos: no disponible. El autor no documenta analisis de sesgos ni la composicion del dataset de entrenamiento, que aparece como "undisclosed".
- Restricciones de hardware y software: el modelo requiere vLLM y esta pensado para GPUs NVIDIA Hopper o Blackwell. No hay soporte declarado para CPU, llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue y el uso en hardware no NVIDIA.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene revisar tambien los terminos del modelo base Qwen/Qwen3.6-27B, ya que la cuantizacion no sustituye a la licencia original.
- Fecha de publicacion anomala: los metadatos indican creacion y actualizacion el 13 de septiembre de 2026, posterior a la fecha de referencia habitual; conviene tratarla con cautela.
- La model card proporcionada esta truncada: el apartado de cuantizacion post-entrenamiento queda cortado en "Only the weights and activations of the linear operators within transformer block", por lo que puede faltar informacion relevante sobre el alcance exacto de la cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rdfsd/Qwen3.6-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Publicacion oficial de NVIDIA del mismo modelo: https://huggingface.co/nvidia/Qwen3.6-27B-NVFP4
- NVIDIA Model Optimizer (repositorio): https://github.com/NVIDIA/Model-Optimizer
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo, su arquitectura o sus benchmarks; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace y de la model card.
