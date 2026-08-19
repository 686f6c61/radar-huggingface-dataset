# May2222/Fisher-R1-7B

## Resumen

Fisher-R1-7B es un agente de lenguaje de pesos abiertos especializado en contrastes de hipótesis estadísticos fiables. Desarrollado por May2222 (Jiacheng Miao, Jin Mu, Guanhua Chen y James Zou), se obtiene mediante post-entrenamiento de Qwen2.5-Coder-7B-Instruct sobre tareas estadísticas sintéticas ejecutables, combinando fine-tuning supervisado con aprendizaje por refuerzo basado en recompensas estadísticas verificadas. El modelo está diseñado para inspeccionar datos, seleccionar y ejecutar la prueba estadística adecuada, reportar un valor p y extraer una conclusión, y se evalúa sobre el benchmark P-Bench.

Con 7.615.616.512 parámetros (7,6B) y una ventana de contexto de 32.768 tokens heredada del modelo base, Fisher-R1-7B cubre un nicho específico: automatizar el flujo completo de análisis estadístico inferencial en un único agente conversacional. Su relevancia actual reside en la creciente demanda de agentes de IA que puedan ejecutar análisis reproducibles y verificables en ciencia de datos, especialmente en entornos donde la corrección estadística es crítica. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y los pesos están publicados en formato safetensors, listos para desplegar con transformers o servidores de inferencia compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | Todos (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Fisher-R1-7B hereda la arquitectura de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only con atención por consultas agrupadas (GQA), activación SwiGLU y embeddings rotatorios (RoPE). No introduce cambios estructurales sobre el modelo base; la especialización se logra exclusivamente mediante post-entrenamiento.

El proceso de entrenamiento consta de dos fases. Primero, un fine-tuning supervisado (SFT) sobre tareas estadísticas sintéticas ejecutables generadas a partir del dataset P-Bench, donde el modelo aprende a inspeccionar datos, seleccionar la prueba estadística apropiada, ejecutarla y formular una conclusión. Después, una fase de aprendizaje por refuerzo con recompensas estadísticas verificadas: el modelo ejecuta código real sobre los datos y la recompensa se calcula comprobando la corrección del test seleccionado, el valor p reportado y la validez de la conclusión, sin depender de un modelo juez. Este esquema es conceptualmente similar al enfoque RLVR (reinforcement learning with verifiable rewards) popularizado por DeepSeek-R1, pero aplicado al dominio estadístico.

## Capacidades

- Contrastes de hipótesis automatizados: selecciona la prueba estadística adecuada (t de Student, chi-cuadrado, ANOVA, etc.) según la naturaleza de los datos y la pregunta planteada.
- Ejecucion de codigo: inspecciona datos y ejecuta pruebas estadísticas mediante generacion de codigo ejecutable, aprovechando las capacidades de programacion del modelo base Qwen2.5-Coder.
- Reporte de resultados: produce valores p y concluye sobre la hipotesis nula con un razonamiento estadistico explicito.
- Uso de herramientas (tool use): integra ejecucion de funciones estadisticas dentro del flujo conversacional.
- Razonamiento multi-paso: encadena inspeccion de datos, seleccion de test, ejecucion y conclusion en un unico turno.
- Capacidades conversacionales: mantiene dialogo en ingles y puede explicar el razonamiento estadistico subyacente.
- Generacion de codigo: conserva las capacidades de programacion de Qwen2.5-Coder-7B-Instruct, aunque su especializacion las orienta al analisis estadistico.

## Casos de uso

- Automatizacion de analisis estadisticos en pipelines de investigacion: el modelo puede recibir un dataset y una pregunta de investigacion, ejecutar el contraste adecuado y devolver el valor p con su conclusion, integrándose en flujos de trabajo cientificos con Python y transformers.
- Analisis de pruebas A/B en producto: para equipos de datos que necesitan evaluar rapidamente si una variante es estadisticamente superior, Fisher-R1-7B puede procesar los datos de conversion y reportar la significancia sin intervencion manual de un estadistico.
- Control de calidad en manufactura: dado un lote de mediciones, el modelo puede ejecutar pruebas de normalidad, comparaciones de medias o analisis de varianza para detectar desviaciones del proceso, con una ventana de 32K tokens suficiente para datasets de tamano moderado.
- Educacion y formacion en estadistica: como tutor interactivo, el modelo puede explicar que prueba usar para cada escenario, ejecutarla sobre datos de ejemplo y justificar la conclusion, ayudando a estudiantes a validar sus propios analisis.
- Auditoria de analisis estadisticos existentes: el modelo puede revisar un dataset y verificar si el test aplicado en un informe previo era el adecuado, detectando errores metodologicos comunes como usar pruebas parametricas sobre datos no normales.
- Generacion de informes estadisticos automatizados: en entornos de consultoria o banca, el modelo puede producir secciones de metodologia y resultados para informes periodicos, reduciendo el tiempo de redaccion de analistas senior.
- Soporte a ensayos clinicos preliminares: para analisis exploratorios de seguridad y eficacia en fases tempranas, el modelo puede ejecutar contrastes rapidos sobre endpoints secundarios, aunque siempre con supervision de un bioestadistico.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que el modelo se evalua sobre el dataset P-Bench (May2222/P-Bench) y remite al articulo arXiv:2608.07437 para el protocolo de evaluacion y los resultados detallados. No se proporcionan cifras de MMLU, HumanEval, GSM8K u otros benchmarks genericos, por lo que no es posible comparar su rendimiento general con otros modelos sin consultar el paper.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16/BF16 (15,2 GB de tamano de repo), se necesitan al menos 16 GB de VRAM para cargar el modelo completo; con cuantizacion de 8 bits se reduce a unos 8 GB, y con 4 bits a unos 4-5 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) permite inferencia en FP16 sin problemas; GPUs con 16 GB (RTX 4080, A10G) pueden ejecutarlo en FP16 ajustando el batch; para 4 bits, una RTX 3060 de 12 GB o incluso una RTX 4060 de 8 GB son suficientes.
- Compatibilidad con GPU de consumo: si, gracias a su tamano de 7,6B, cabe en GPUs consumer con cuantizacion, y en las de gama alta (24 GB) incluso en precision completa.
- Opciones de despliegue: compatible con vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (tras conversion a GGUF), ademas del pipeline estandar de transformers con device_map="auto".
- Latencia y throughput: no disponible en la informacion proporcionada; como referencia, un modelo de 7B en FP16 en una RTX 4090 suele generar entre 40 y 80 tokens por segundo con vLLM, pero estos datos no estan confirmados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fisher-R1-7B | 7,6B | 32K | Contrastes de hipotesis estadisticos | Apache 2.0 | HuggingFace (safetensors) |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | 32K | Generacion de codigo general | Apache 2.0 | HuggingFace |
| Otros agentes estadisticos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros modelos especializados en analisis estadistico no esta disponible en la informacion proporcionada. La unica comparacion directa posible es contra su modelo base Qwen2.5-Coder-7B-Instruct: Fisher-R1-7B sacrifica generalidad en generacion de codigo por una mayor precision en tareas de contrastes de hipotesis, con el mismo coste computacional y la misma ventana de contexto. Para evaluar su rendimiento relativo frente a alternativas como agentes basados en DeepSeek-R1 o modelos de razonamiento general aplicados a estadistica, es necesario consultar los resultados del paper arXiv:2608.07437.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta optimizado para contrastes de hipotesis estadisticos; su rendimiento en tareas generales de generacion de codigo, razonamiento o conversacion puede degradarse respecto al modelo base Qwen2.5-Coder-7B-Instruct.
- Idioma: solo soporta ingles. No se ha entrenado para responder en espanol ni otros idiomas, lo que limita su uso en entornos multilingues.
- Riesgo de errores estadisticos: aunque el entrenamiento con recompensas verificadas reduce errores, el modelo puede seleccionar pruebas inapropiadas o malinterpretar supuestos estadisticos en datasets atipicos o con distribuciones complejas. Siempre debe validarse con un estadistico humano en contextos criticos.
- Alucinacion en valores p: existe riesgo de que el modelo reporte valores p o conclusiones incorrectas si la ejecucion de codigo falla silenciosamente o si los datos no son interpretables. La verificacion externa de resultados es obligatoria en produccion.
- Limitacion de contexto: 32K tokens puede ser insuficiente para datasets muy grandes; para conjuntos de datos extensos sera necesario pre-procesar o muestrear antes de pasar los datos al modelo.
- Sin capacidades multimodales: no soporta vision ni audio; solo entrada y salida de texto.
- Datos de entrenamiento sinteticos: el entrenamiento se realizo sobre tareas sinteticas generadas a partir de P-Bench; el rendimiento en datos reales con ruido, valores faltantes o distribuciones no estandar puede verse afectado.
- Sin benchmarks publicados: la ausencia de resultados numericos publicos en la model card dificulta la evaluacion objetiva de su calidad antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/May2222/Fisher-R1-7B
- Dataset P-Bench: https://huggingface.co/datasets/May2222/P-Bench
- Articulo arXiv: https://arxiv.org/abs/2608.07437
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
