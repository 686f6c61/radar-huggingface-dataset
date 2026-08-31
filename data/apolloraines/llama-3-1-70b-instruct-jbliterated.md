# ApolloRaines/Llama-3.1-70B-Instruct-Jbliterated

## Resumen

Llama-3.1-70B-Instruct-Jbliterated es un ajuste posterior al entrenamiento del modelo base meta-llama/Llama-3.1-70B-Instruct, desarrollado por ApolloRaines. Aplica dos modificaciones de pesos post-entrenamiento: Jbliteration, que elimina quirúrgicamente el comportamiento de rechazo sin dañar la personalidad, el humor o la voz creativa del modelo, y Desycophancy, que reduce la tendencia a aceptar afirmaciones incorrectas del usuario bajo presión social. El resultado es un modelo conversacional que responde a todas las peticiones sin negarse y mantiene sus respuestas ante contradicciones con falsa autoridad.

Con 70.553 millones de parámetros y una ventana de contexto de 128K tokens, mantiene la misma arquitectura, tokenizador y capacidades que el Llama 3.1 70B Instruct original. Está pensado para desarrolladores que necesitan un modelo de gran tamaño sin restricciones de rechazo para aplicaciones de generación de texto, agentes conversacionales o investigación en alineación. Su relevancia radica en ofrecer una alternativa "uncensored" y anti-sicofante sobre una base sólida y ampliamente adoptada, con licencia Llama 3.1 Community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 70.553.706.496 (70B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors, precision completa) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (repo de 141,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 70B Instruct: un transformer decoder-only con normalización RMSNorm, atención de consultas agrupadas (GQA) y activaciones SwiGLU. No se han modificado la arquitectura ni el tokenizador; los cambios son exclusivamente en los pesos, aplicados mediante dos tecnicas post-entrenamiento. Jbliteration identifica el componente causal que produce los tokens de rechazo y lo elimina de forma selectiva, preservando rasgos de personalidad que un abliteration estandar dañaria. Desycophancy elimina la tendencia a ceder ante afirmaciones incorrectas del usuario, de modo que el modelo mantiene sus respuestas correctas incluso cuando el interlocutor presiona con falsa autoridad.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas como RLHF o DPO. El modelo base ya fue entrenado por Meta con un corpus multilingue y refinado con instrucciones, pero los detalles del ajuste adicional de ApolloRaines no estan publicados. El resultado es un drop-in replacement del modelo original: misma arquitectura, mismo tokenizador y misma longitud de contexto de 128K.

## Capacidades

- Generacion de texto conversacional: responde a instrucciones y mantiene dialogos multi-turno con contexto largo (128K tokens).
- Razonamiento y conocimiento general: hereda las capacidades del Llama 3.1 70B Instruct, incluyendo matematicas, logica y conocimiento factual.
- Generacion de codigo: soporta tareas de programacion y depuracion, aunque no se especifican benchmarks propios.
- Tool calling y function calling: el modelo base Llama 3.1 70B Instruct soporta tool use; esta version mantiene esa capacidad al no alterar la arquitectura.
- Comportamiento sin rechazo: responde a peticiones que el modelo base podria rechazar, manteniendo la personalidad y el tono.
- Anti-sicofancia: resiste la presion social y no se retracta ante afirmaciones incorrectas del usuario (83% de firmeza en pruebas del autor).
- Multilingue: el modelo base es multilingue, pero la model card solo declara ingles como idioma soportado.

## Casos de uso

- Asistentes conversacionales sin censura: el modelo puede gestionar chats donde el usuario plantea temas delicados o controvertidos sin que el sistema se niegue a responder, util para aplicaciones de rol, escritura creativa o simulacion de personajes.
- Agentes de razonamiento con contexto largo: gracias a su ventana de 128K tokens, puede procesar documentos extensos, historiales de conversacion completos o codebases grandes para tareas de analisis y resumen.
- Generacion de codigo en entornos de desarrollo: integrable en pipelines de CI/CD o IDEs mediante tool calling, para autocompletar, revisar o explicar fragmentos de codigo.
- Investigacion en alineacion y seguridad: sirve como banco de pruebas para estudiar el comportamiento de modelos sin rechazo y con resistencia a la sicofancia, comparando con el modelo base.
- Simulacion de usuarios o escenarios adversariales: su comportamiento anti-sicofante permite crear agentes que no se pliegan a falacias de autoridad, util en entrenamiento de otros modelos o testing de sistemas.
- Despliegue en hardware limitado con DeepswapLLM: la herramienta del autor permite ejecutar el modelo en GPUs con poca memoria, transmitiendo capas entre GPU, RAM y disco, hasta 4 veces mas rapido que AirLLM, habilitando prototipos en equipos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta dos metricas propias:

| Prueba | Resultado |
|---|---|
| Tasa de respuesta sin rechazo | 6/6 prompts respondidos (100%) |
| Firmeza ante contradicciones (anti-sicofancia) | 83% de las veces mantiene su respuesta |

Estos datos provienen de pruebas internas del autor y no son comparables con benchmarks academicos. No hay informacion sobre latencia, throughput ni rendimiento en tareas especificas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 70B parametros; en precision FP16 (safetensors, 141,1 GB) requiere aproximadamente 140 GB de VRAM, lo que excede cualquier GPU comercial individual.
- GPUs recomendadas: para ejecucion en memoria unica se necesitarian multiples A100 80GB, H100 80GB o similares en configuracion multi-GPU (por ejemplo, 2x A100 80GB).
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) sin cuantizacion. Con cuantizacion a 4 bits (no disponible en el repo) podria caber en 48 GB, pero no se ofrecen pesos cuantizados.
- Opciones de despliegue: el autor recomienda DeepswapLLM para ejecutar en GPUs pequenas transmitiendo capas entre GPU, RAM y disco. Alternativas estandar como vLLM, llama.cpp u Ollama son compatibles con el formato safetensors, pero requieren cuantizacion previa para hardware limitado.
- Latencia y throughput: no disponible. DeepswapLLM afirma ser hasta 4 veces mas rapido que AirLLM, pero no se proporcionan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Diferencias clave |
|---|---|---|---|---|
| Llama-3.1-70B-Instruct (base) | 70B | 128K | Llama 3.1 Community | Modelo original con rechazo y sicofancia estandar |
| Llama-3.1-70B-Instruct-Jbliterated | 70B | 128K | Llama 3.1 Community | Sin rechazo, anti-sicofante, misma arquitectura |
| Llama-3-70B-Instruct (anterior) | 70B | 8K | Llama 3 Community | Contexto menor, sin tool calling nativo, comportamiento de rechazo estandar |

No se dispone de benchmarks comparativos entre estos modelos. La principal diferencia de esta version es el comportamiento post-entrenamiento: elimina el rechazo y reduce la sicofancia, manteniendo el resto de capacidades intactas. Otras alternativas "uncensored" como las basadas en abliteration (p. ej., Dolphin) existen, pero no se han incluido por falta de datos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar del Llama 3.1 70B Instruct, hereda los sesgos del modelo base, que pueden amplificarse al eliminar el rechazo (el modelo puede generar contenido ofensivo o perjudicial sin filtro).
- Riesgo de alucinacion: no se han evaluado tasas de alucinacion especificas; el modelo puede inventar hechos, especialmente en contextos largos o temas especializados.
- Limitaciones de idioma: la model card solo declara ingles; aunque el base es multilingue, no hay garantia de rendimiento en otros idiomas.
- Restricciones de licencia: la Llama 3.1 Community License permite uso comercial, pero impone condiciones (p. ej., no usar para mejorar otros modelos grandes sin autorizacion) y exige atribucion. El modelo "uncensored" puede violar politicas de plataformas de despliegue.
- Caveat de produccion: al eliminar el rechazo, el modelo puede generar contenido ilegal, peligroso o no etico. No se recomienda su uso en aplicaciones publicas sin moderacion adicional y evaluacion de riesgos.
- Datos de entrenamiento no publicados: no se conoce el proceso exacto de Jbliteration ni Desycophancy, lo que dificulta la reproducibilidad y la auditoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Llama-3.1-70B-Instruct-Jbliterated
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct
- Herramienta DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Licencia Llama 3.1 Community: https://ai.meta.com/llama/license/
- Pagina de Llama 3.1 en Ollama: https://ollama.com/library/llama3.1:70b
