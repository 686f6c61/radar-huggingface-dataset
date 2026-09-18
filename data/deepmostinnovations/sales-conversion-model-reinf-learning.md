# DeepMostInnovations/sales-conversion-model-reinf-learning

## Resumen

Sales Conversation Analysis Model - Turn-by-Turn Prediction es un agente de aprendizaje por refuerzo desarrollado por DeepMostInnovations (autor del paper: Nandakishor M) que analiza conversaciones de venta y estima, turno a turno, la probabilidad de conversion. No es un modelo de lenguaje generativo: es una politica PPO entrenada con Stable Baselines3 cuyo espacio de acciones es continuo (una probabilidad entre 0 y 1) y cuyo estado combina embeddings semanticos de la conversacion con metricas dinamicas derivadas de un LLM auxiliar. El modelo se publica como un checkpoint `.zip` de Stable Baselines3 junto a la libreria `deepmost`, que actua como envoltorio de inferencia.

El problema que aborda es concreto: en un ciclo de ventas, saber en que momento del dialogo el prospecto gana o pierde interes y que intervenciones del comercial desplazan la probabilidad de cierre. La propuesta del autor es sustituir la evaluacion cualitativa posterior por una senal cuantitativa en tiempo real, con una latencia declarada de 85 ms por inferencia frente a los 3450 ms que se atribuyen a GPT-4 en el mismo tipo de tarea.

Su relevancia actual es mas metodologica que de escala: demuestra un patron hibrido RL + LLM (el LLM no genera la prediccion, sino que produce caracteristicas) aplicado a un dominio de negocio muy acotado. El entrenamiento se hizo sobre mas de 100.000 conversaciones sinteticas, con embeddings BAAI/bge-m3 de 1024 dimensiones como representacion base, licencia MIT y soporte unicamente en ingles. No se publican parametros totales ni longitud de contexto, porque el objeto desplegado no es un transformer de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de aprendizaje por refuerzo (PPO, Stable Baselines3) con extractor de caracteristicas de capas lineales personalizadas; estado multimodal (embeddings + metricas derivadas de LLM); espacio de acciones continuo (probabilidad de conversion 0-1) |
| Parametros totales | no disponible (el autor no publica el recuento de parametros de la politica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa la conversacion turno a turno; no se especifica ventana maxima) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `.zip` (checkpoint de Stable Baselines3 sobre PyTorch); no se publican safetensors ni GGUF |
| Framework de inferencia | `stable-baselines3` mediante la libreria `deepmost` (Python 3.11+) |
| Embeddings de entrada | BAAI/bge-m3, 1024 dimensiones (soporte opcional de Azure OpenAI) |
| LLM auxiliar para metricas dinamicas | unsloth/Qwen3-4B-GGUF (referenciado en los ejemplos de la model card) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | reinforcement-learning |
| Dataset de entrenamiento | synthetic |

## Arquitectura y entrenamiento

El modelo no es una red neuronal de lenguaje, sino una politica entrenada con PPO (Proximal Policy Optimization) sobre Stable Baselines3. La representacion del estado es multimodal: por un lado, embeddings semanticos de la conversacion obtenidos con BAAI/bge-m3 (1024 dimensiones); por otro, metricas dinamicas calculadas por un LLM auxiliar que evalua el compromiso del cliente y la efectividad del comercial en cada turno. Sobre esa representacion actua un extractor de caracteristicas de capas lineales optimizado para el analisis conversacional, y la salida es una accion continua que se interpreta como probabilidad de conversion entre 0 y 1. La libreria expone el metodo `analyze_conversation_progression`, que devuelve la probabilidad tras cada intervencion y la etiqueta final (por ejemplo, "Medium" para 0,5234).

El entrenamiento se realizo sobre mas de 100.000 conversaciones de venta sinteticas generadas con modelos de lenguaje, cubriendo multiples tipos de cliente y escenarios de dialogo. No se documenta en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO: al tratarse de RL con recompensa, el ajuste de preferencias no aplica del modo habitual. La innovacion tecnica destacable es el uso del LLM como generador de caracteristicas (engagement del cliente y efectividad del vendedor) en lugar de como predictor, lo que permite reducir la latencia de inferencia de 3450 ms a 85 ms segun los datos del autor. No se mencionan tecnicas de decodificacion especulativa ni atencion lineal.

## Capacidades

- Prediccion de conversion turno a turno: devuelve una probabilidad actualizada despues de cada mensaje de cliente o comercial.
- Analisis de la evolucion de la conversacion: la salida incluye la traza completa de probabilidades, lo que permite localizar el punto de inflexion del dialogo.
- Metricas dinamicas asistidas por LLM: analisis de compromiso del cliente y efectividad del comercial, con el modelo Qwen3-4B-GGUF como componente opcional.
- Evaluacion comparativa de enfoques de venta: permite contrastar guiones o tecnicas de forma cuantitativa (A/B testing de conversaciones).
- Soporte para formacion de equipos comerciales: identifica que elementos del discurso incrementan o reducen la probabilidad de cierre.
- Integracion programatica en Python mediante la libreria `deepmost`, con descarga automatica y cache local del modelo desde Hugging Face.
- Procesamiento de conversaciones multi-turno con separacion explicita de hablantes (cliente / comercial).

No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso autonomo.

## Casos de uso

- Formacion y coaching de comerciales: el modelo se ejecuta sobre transcripciones de llamadas reales y devuelve la curva de probabilidad de cierre, de modo que el formador puede senalar exactamente en que turno el vendedor perdio al prospecto y con que frase.
- Analisis post-venta de oportunidades perdidas: al procesar el historial completo de una negociacion fallida, la traza turno a turno permite reconstruir el momento en que la probabilidad empezo a caer, algo que una evaluacion cualitativa no localiza con precision.
- A/B testing de guiones comerciales: dos versiones de un mismo guion se evaluan sobre el mismo perfil de conversacion y se comparan las probabilidades finales, lo que da una metrica objetiva para decidir que variante adoptar.
- Asistencia en tiempo real al comercial: con una latencia declarada de 85 ms por inferencia, el modelo puede integrarse en una herramienta de escritorio que muestre la probabilidad actualizada tras cada mensaje y sugiera ajustar el enfoque cuando caiga por debajo de un umbral.
- Priorizacion de leads a partir de interacciones: aplicando el modelo a conversaciones de cualificacion (chat o email), se obtiene una puntuacion de conversion que alimenta un CRM para ordenar la cola de seguimiento.
- Control de calidad de equipos de ventas: ejecucion por lotes sobre cientos de conversaciones para detectar patrones sistematicos de perdida de interes por equipo, producto o tramo del guion.
- Investigacion sobre RL aplicado a negocio: el checkpoint es un caso reproducible de politica PPO con estado multimodal, util para estudiar el uso de LLM como extractor de caracteristicas en lugar de como predictor.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card y del paper del autor (arXiv:2503.23303). No han sido verificados de forma independiente en la informacion disponible.

| Metrica | Valor declarado | Alternativa comparada |
|---|---|---|
| Precision en prediccion de conversion | 0,967 (96,7 %) | no disponible |
| Tiempo de inferencia | 85 ms | 3450 ms (GPT-4, segun el autor) |
| Mejora frente a enfoques solo-LLM | +34,7 % | enfoques LLM unicamente |
| Incremento de tasa de conversion con uso por comerciales | +43,2 % | no aplica |
| Tamano de datos de entrenamiento | 100.000+ conversaciones sinteticas | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para la politica PPO: no disponible de forma oficial. A partir del tamano del repositorio (0,1 GB) puede inferirse que el checkpoint ocupa decenas de megabytes, por lo que la inferencia cabe holgadamente en CPU y en cualquier GPU consumer. Esta cifra es una estimacion, no un dato publicado.
- Componente LLM opcional para metricas dinamicas: si se usa `unsloth/Qwen3-4B-GGUF` como generador de metricas, ese componente si requiere recursos propios (unos pocos GB en cuantizacion de 4 bits); el modelo RL en si no los necesita.
- GPU recomendadas: no se especifican. Por el tamano del artefacto, no requiere A100 ni H100; una GPU consumer de gama media o incluso CPU es suficiente para la politica.
- Cabe en GPU consumer: si, segun el tamano del repositorio (estimacion, no dato oficial).
- Opciones de despliegue: la via documentada es la libreria `deepmost` (`pip install deepmost[gpu]`), con carga local mediante `sales.Agent(model_path=...)` o descarga automatica desde Hugging Face con cache en `~/.deepmost/models/`. Tambien es posible cargar el `.zip` directamente con `stable_baselines3.PPO.load`. No hay soporte de vLLM, TGI, Ollama ni llama.cpp, porque no es un transformer de generacion de texto.
- Latencia y throughput: 85 ms por inferencia segun el autor, frente a 3450 ms atribuidos a GPT-4. No se publica throughput agregado ni latencia bajo carga concurrente.

## Comparativa con modelos similares

No se conocen en la informacion disponible otros modelos abiertos de RL especificamente orientados a prediccion de conversion en conversaciones de venta, por lo que la comparativa se limita a la referencia que el propio autor utiliza como linea base.

| Aspecto | Este modelo | GPT-4 (linea base citada) | Enfoques solo-LLM |
|---|---|---|---|
| Tipo | Politica PPO sobre estado multimodal | LLM generativo de proposito general | LLM generativo con prompting |
| Parametros | no disponible | no disponible en la informacion | no disponible |
| Contexto | no disponible | no disponible en la informacion | no disponible |
| Precision declarada | 96,7 % | no disponible | referencia base |
| Latencia declarada | 85 ms | 3450 ms | no disponible |
| Licencia | MIT | propietaria | variable |
| Disponibilidad | abierta en Hugging Face | API comercial | variable |
| Idioma | ingles | multilingue | variable |

## Limitaciones y advertencias

- Dominio estrecho: el modelo solo predice probabilidad de conversion en conversaciones de venta en ingles; no responde a preguntas, no genera texto ni sirve como asistente general.
- Entrenamiento con datos sinteticos: las mas de 100.000 conversaciones fueron generadas por LLM, de modo que la distribucion de entrenamiento puede diferir de las conversaciones reales de un negocio concreto y provocar degradacion fuera de dominio.
- Cifras no verificadas: la precision del 96,7 %, la mejora del 34,7 % y el incremento del 43,2 % en tasa de conversion provienen del paper y de la model card del autor; no hay evaluacion independiente en la informacion disponible.
- Sin analisis de sesgos publicado: no se documenta evaluacion de sesgos demograficos, culturales o de genero, algo relevante si la puntuacion se usa para priorizar leads o evaluar empleados.
- Riesgo de mal uso en decisiones laborales: usar la puntuacion como metrica automatica de desempeno de comerciales exige supervision humana, dado que el modelo no expone su razonamiento.
- Dependencia de la libreria `deepmost` y de un LLM auxiliar: las metricas dinamicas requieren un modelo adicional (por ejemplo Qwen3-4B-GGUF), lo que anade dependencia, coste computacional y una superficie de fallo extra.
- Idioma y contexto no especificados: no se documenta soporte multilingue ni una longitud maxima de conversacion; conversaciones muy largas podrian quedar fuera de las condiciones evaluadas.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte, y no se detalla la licencia del LLM auxiliar ni del modelo de embeddings, que se rigen por sus propios terminos.
- Repositorio pequeno y poco desplegado: 20 descargas y 0,1 GB de repositorio; conviene validar el checkpoint en el caso de uso propio antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepMostInnovations/sales-conversion-model-reinf-learning
- README del modelo en Hugging Face: https://huggingface.co/DeepMostInnovations/sales-conversion-model-reinf-learning/blob/main/README.md
- Paper: SalesRLAgent: A Reinforcement Learning Approach for Real-Time Sales Conversion Prediction and Optimization: https://arxiv.org/abs/2503.23303
- Modelo de embeddings BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- LLM auxiliar referenciado en los ejemplos: https://huggingface.co/unsloth/Qwen3-4B-GGUF
