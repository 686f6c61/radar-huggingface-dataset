# liodon-ai/Qwen2.5-Math-1.5B-imatrix-GGUF

## Resumen

Qwen2.5-Math-1.5B es un modelo de lenguaje especializado en razonamiento matematico desarrollado por el equipo Qwen de Alibaba Cloud, y esta ficha cubre la version cuantizada en formato GGUF publicada por Liodon AI con calibracion iMatrix. La cuantizacion iMatrix ejecuta 128 bloques de calibracion a traves del modelo en precision completa para identificar los pesos mas relevantes y asignarles mayor precision, lo que mejora la coherencia y el seguimiento de instrucciones en cuantizaciones de 2 a 4 bits sin aumentar el tamano del archivo.

Con aproximadamente 1.540 millones de parametros, el modelo esta disenado para tareas de calculo, resolucion de problemas paso a paso y generacion de soluciones matematicas. Las cuantizaciones disponibles ocupan entre 0,60 GB y 1,65 GB, con una VRAM estimada de 1 a 2 GB, lo que permite su ejecucion en GPU de consumo e incluso en CPU mediante llama.cpp u Ollama.

El repositorio incluye siete cuantizaciones (IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K y Q8_0), calibradas con 2 millones de tokens de WikiText-103. La cuantizacion recomendada por el autor es Q4_K_M, que ofrece un equilibrio optimo entre calidad y tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (serie Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (estandar de la serie Qwen2.5) |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles y chino (serie Qwen2.5-Math) |
| Licencia | other (consultar terminos del modelo base Qwen) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Math-1.5B pertenece a la serie Qwen2.5-Math, una familia de modelos especificamente entrenados para razonamiento matematico. Segun el informe tecnico disponible en arXiv (2409.12122), la serie Qwen2.5-Math emplea un enfoque de entrenamiento en dos etapas: continuacion del pretraining con datos matematicos de alta calidad seguida de ajuste por instrucciones. El modelo de 72B de la serie supera a Qwen2-Math-72B-Instruct por un margen medio de 4,4 y 6,1 puntos en ingles y chino respectivamente, lo que lo posiciona como el mejor modelo matematico open source disponible.

La version cuantizada por Liodon AI utiliza calibracion iMatrix, que procesa 128 bloques de calibracion de 2 millones de tokens de WikiText-103 para determinar que pesos requieren mayor precision. A diferencia de la cuantizacion estandar que trata todos los pesos por igual, iMatrix asigna mas bits a los pesos criticos, resultando en mejor coherencia y seguimiento de instrucciones a igualdad de tamano de archivo, especialmente en cuantizaciones Q2/Q3/Q4.

## Capacidades

- Razonamiento matematico: resolucion de problemas aritmeticos, algebraicos y de calculo paso a paso.
- Generacion de soluciones explicadas: produce razonamientos intermedios detallados, no solo respuestas finales.
- Generacion de texto: capacidad basica de continuacion de texto y respuesta a instrucciones en formato conversacional.
- Soporte multilingue: entrenado principalmente en ingles y chino, con capacidades limitadas en otros idiomas.
- Compatibilidad con inferencia local: formato GGUF optimizado para llama.cpp, Ollama, LM Studio y Jan.
- Cuantizaciones flexibles: desde 2 bits (IQ2_M, 0,60 GB) hasta 8 bits (Q8_0, 1,65 GB) para adaptarse a distintos hardware.
- No incluye tool calling ni function calling: al ser un modelo base de 1,5B especializado en matematicas, no incorpora capacidades de agente ni llamada a herramientas.

## Casos de uso

- Tutoria de matematicas en entornos educativos: el modelo puede generar explicaciones paso a paso de problemas de algebra, geometria y calculo, funcionando como asistente de estudio offline en portatiles o tablets sin conexion a internet.
- Generacion de problemas de practica: permite crear ejercicios matematicos con soluciones detalladas para plataformas de e-learning, adaptando la dificultad segun el nivel del estudiante.
- Verificacion de soluciones: puede comprobar la correccion de resultados matematicos y senalar errores en el razonamiento, util en herramientas de correccion automatica de examenes.
- Asistente de calculo cientifico: integrable en aplicaciones de escritorio o scripts de linea de comandos para realizar calculos complejos y explicar el procedimiento, sin necesidad de GPU dedicada.
- Prototipado rapido de aplicaciones de razonamiento: al ser ligero (1-2 GB de VRAM), permite iterar rapidamente en el desarrollo de aplicaciones de IA conversacional con enfoque matematico en hardware de consumo.
- Despliegue en entornos con recursos limitados: su cuantizacion Q4_K_M (0,99 GB) cabe en Raspberry Pi 5 o mini-PCs, habilitando asistentes matematicos en aulas o laboratorios con infraestructura minima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la version cuantizada en la informacion disponible. El informe tecnico de la serie Qwen2.5-Math (arXiv:2409.12122) documenta que el modelo de 72B supera a Qwen2-Math-72B-Instruct por 4,4 y 6,1 puntos en ingles y chino respectivamente, pero no se proporcionan cifras concretas para la variante de 1,5B en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: 1 GB para cuantizaciones IQ2_M a Q6_K; 2 GB para Q8_0, segun la tabla de cuantizaciones del autor.
- GPU compatibles: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, GTX 1650, RTX 3050, o integradas con soporte Vulkan. Tambien ejecutable en CPU via llama.cpp.
- Tamano de archivo: entre 0,60 GB (IQ2_M) y 1,65 GB (Q8_0), con un tamano total del repositorio de 7,3 GB.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run hf.co/liodon-ai/Qwen2.5-Math-1.5B-imatrix-GGUF:Q4_K_M), LM Studio y Jan.
- Latencia: no disponible en la informacion proporcionada, aunque al tratarse de un modelo de 1,5B se espera una generacion rapida incluso en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B (iMatrix GGUF) | 1,5B | 32K | Matematicas | other | GGUF |
| Qwen2.5-1.5B | 1,5B | 32K | General | Apache 2.0 | Safetensors, GGUF |
| Qwen2.5-Math-7B | 7B | 32K | Matematicas | Apache 2.0 | Safetensors, GGUF |
| Qwen2.5-Math-1.5B-Instruct (iMatrix GGUF) | 1,5B | 32K | Matematicas (instrucciones) | other | GGUF |

La diferencia principal frente a Qwen2.5-1.5B es la especializacion en matematicas: el modelo base general esta optimizado para tareas diversas, mientras que Qwen2.5-Math-1.5B dedica su capacidad al razonamiento numerico y algebraico. Frente a Qwen2.5-Math-7B, la variante de 1,5B sacrifica precision en problemas complejos a cambio de un consumo de recursos drasticamente menor. La version Instruct del mismo tamano ofrece mejor seguimiento de instrucciones conversacionales, mientras que esta version base es mas adecuada para continuar el entrenamiento o tareas de generacion directa.

## Limitaciones y advertencias

- Tamano reducido: con solo 1,5B de parametros, el modelo tiene capacidad limitada para problemas matematicos avanzados o razonamiento multi-paso complejo, donde modelos de 7B o 72B ofrecen resultados superiores.
- Especializacion estrecha: al estar enfocado en matematicas, su rendimiento en tareas generales de lenguaje, codigo o conocimiento factual es inferior al de modelos generalistas del mismo tamano.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar soluciones incorrectas con apariencia de validez, especialmente en problemas poco representados en sus datos de entrenamiento.
- Licencia "other": los terminos exactos de uso no estan especificados en la model card; es necesario revisar la licencia del modelo base Qwen2.5-Math-1.5B antes de un despliegue comercial.
- Version base sin ajuste por instrucciones: a diferencia de la variante Instruct, este modelo no esta optimizado para dialogos conversacionales ni seguimiento de instrucciones complejas, lo que puede afectar a la calidad de las respuestas en aplicaciones interactivas.
- Idiomas limitados: el entrenamiento se centra en ingles y chino; el rendimiento en otros idiomas, incluido el espanol, puede ser significativamente inferior.
- Contexto de 32K tokens: aunque adecuado para la mayoria de casos de uso, puede resultar insuficiente para documentos matematicos extensos o sesiones de razonamiento muy largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/Qwen2.5-Math-1.5B-imatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Repositorio GitHub de la serie Qwen2.5-Math: https://github.com/QwenLM/Qwen2.5-Math
- Informe tecnico (arXiv): https://arxiv.org/html/2409.12122v1
- Version Instruct cuantizada: https://huggingface.co/liodon-ai/Qwen2.5-Math-1.5B-Instruct-imatrix-GGUF
- Version sin iMatrix: https://huggingface.co/liodon-ai/Qwen2.5-Math-1.5B-GGUF
- Dataset de calibracion WikiText-103: https://huggingface.co/datasets/wikitext
