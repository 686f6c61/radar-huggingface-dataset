# nurmix/Mistral-7B-Liberated-GGUF

## Resumen

Mistral-7B-Liberated-GGUF es la distribucion en formato GGUF del modelo nurmix/Mistral-7B-Liberated, una version del Mistral-7B-Instruct-v0.3 de Mistral AI a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) implementada con la herramienta Heretic. El modelo base conserva la arquitectura transformer densa de Mistral con 7.248.023.552 parametros y una ventana de contexto de 32.768 tokens (heredada de Instruct-v0.3).

El interes de esta publicacion es practico: ofrece pesos cuantizados listos para inferencia local con llama.cpp y Ollama, en cuatro variantes (Q4_K_M, Q6_K, Q8_0 y F16) que van de 4,37 GB a 14,50 GB. El autor reporta que la ablacion reduce los rechazos en el conjunto harmful_behaviors del 87% al 4%, con una divergencia KL de 0,025 frente al modelo original, lo que situa el checkpoint en la frontera de Pareto entre supresion de rechazos y preservacion de capacidades.

Es relevante para desarrolladores que necesitan un modelo de 7B sin filtros de rechazo para tareas de investigacion sobre seguridad, red teaming o generacion de contenido creativo sin restricciones, y que quieren ejecutarlo en hardware de consumo. La licencia Apache 2.0 heredada facilita el uso comercial, aunque con las advertencias propias de un modelo abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repositorio fuente) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 7B parametros basado en Mistral-7B-Instruct-v0.3. No se ha reentrenado: la unica modificacion respecto al original es la ablacion del comportamiento de rechazo mediante ARA (Arbitrary-Rank Ablation), ejecutada con Heretic v2.0.0. El proceso consistio en 100 trials de Optuna con optimizacion multiobjetivo (minimizar la tasa de rechazo y minimizar la divergencia KL respecto al modelo original), seleccionando el trial con indice de Pareto 4, que presenta un 4% de rechazos y una KL de 0,025 en harmless_alpaca.

Las cuantizaciones Q6_K y Q8_0 se generaron a partir de la conversion F16 usando el commit `fc504f91d8cfdfcd9b0fedcf14600fd2b0e63420` de llama.cpp, sin importance matrix. Q4_K_M es la cuantizacion preexistente del repositorio fuente. El autor indica que F16, Q6_K y Q8_0 superaron pruebas cortas de inferencia en CPU (smoke tests), sin una evaluacion de calidad completa. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO mas alla de lo que corresponde a Mistral-7B-Instruct-v0.3.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones en formato chat.
- Generacion de codigo y matematicas basicas propias de un modelo de 7B.
- Comportamiento de rechazo practicamente eliminado (4/100 en harmful_behaviors), lo que permite generar contenido que el modelo original rechazaria.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Capacidades multilingues: no disponible (no se especifican idiomas en la model card).
- No dispone de vision, audio ni modo thinking.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar como responde un 7B sin alineacion de rechazo, comparando sus salidas con las del Mistral-7B-Instruct-v0.3 original para analizar diferencias de comportamiento.
- Red teaming y evaluacion de filtros: util para generar prompts y respuestas adversarias que prueben sistemas de moderacion y clasificadores de contenido en pipelines de seguridad.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas sensibles donde el modelo original rechazaria la peticion, ejecutado localmente con Ollama o llama.cpp.
- Despliegue local en hardware de consumo: la variante Q4_K_M (4,37 GB) cabe en GPUs de 8 GB de VRAM y permite inferencia offline en portatiles y estaciones de trabajo sin conexion.
- Experimentacion academica con tecnicas de ablacion: sirve como caso de estudio reproducible de ARA y Heretic, con metricas de rechazo y KL publicadas por el autor.
- Prototipado rapido de chatbots: al ser compatible con el endpoint de Ollama (`ollama run hf.co/nurmix/Mistral-7B-Liberated`), se puede integrar en demos y pruebas de concepto con contexto de 32K tokens.
- Analisis de sesgos y contenido toxico: permite generar corpus de texto sin censura para entrenar o evaluar clasificadores de toxicidad en entornos controlados.

## Benchmarks y rendimiento

| Metrica | Antes (Mistral-7B-Instruct-v0.3) | Despues (Liberated) |
|---|---|---|
| Rechazos (harmful_behaviors) | 87 / 100 | 4 / 100 |
| Divergencia KL (harmless_alpaca) | 0,0 (baseline) | 0,025 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas metricas reportadas son las de rechazo y divergencia KL del proceso de ablacion, ademas de smoke tests de inferencia en CPU sin evaluacion de calidad cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB para Q4_K_M, 6-6,5 GB para Q6_K, 8-9 GB para Q8_0 y 15-16 GB para F16 (incluyendo overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para las variantes mayores; A100 o H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, Q4_K_M en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) y Q8_0 en GPUs de 12 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run hf.co/nurmix/Mistral-7B-Liberated`), y Transformers con los pesos safetensors del repositorio fuente. vLLM y TGI no estan documentados para esta variante GGUF.
- Latencia y throughput: no disponible; el autor solo menciona smoke tests de inferencia en CPU sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Formato |
|---|---|---|---|---|---|
| Mistral-7B-Liberated-GGUF | 7,25B | 32.768 | 4/100 | Apache 2.0 | GGUF |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 | 87/100 | Apache 2.0 | safetensors |
| Mistral-7B-Liberated (fuente) | 7,25B | 32.768 | 4/100 | Apache 2.0 | safetensors |

La comparativa directa con otros modelos abliterated de 7B (por ejemplo variantes de Llama 3 o Qwen) no esta disponible en la informacion proporcionada. La diferencia principal frente al Instruct-v0.3 es la supresion del comportamiento de rechazo con una degradacion medida de KL 0,025.

## Limitaciones y advertencias

- Modelo abliterated: el entrenamiento de seguridad y rechazo se ha eliminado intencionadamente; puede generar contenido que el modelo original rechazaria, incluido material danino o sensible.
- Riesgo de alucinacion: como todo modelo de 7B, tiende a inventar hechos, citas y datos, especialmente en contextos largos.
- La evaluacion de calidad de las cuantizaciones Q6_K y Q8_0 se limita a smoke tests en CPU; no hay garantia de que la cuantizacion no degrade el rendimiento en tareas complejas.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado para esta variante.
- Sesgos conocidos: hereda los sesgos de Mistral-7B-Instruct-v0.3, sin mitigacion adicional.
- Uso comercial permitido por Apache 2.0, pero el usuario asume la responsabilidad legal del contenido generado; el autor recomienda uso responsable y conforme a la legislacion aplicable.
- Sin soporte documentado de tool calling, function calling ni agentes; no apto para pipelines que dependan de esas capacidades sin verificacion previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni reportes independientes de calidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/nurmix/Mistral-7B-Liberated-GGUF
- Modelo fuente (safetensors): https://huggingface.co/nurmix/Mistral-7B-Liberated
- Modelo base original: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
