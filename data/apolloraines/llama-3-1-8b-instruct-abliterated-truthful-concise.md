# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Truthful-Concise

## Resumen

Llama-3.1-8B-Instruct-Abliterated-Truthful-Concise es una variante del modelo meta-llama/Llama-3.1-8B-Instruct modificada mediante una tecnica de cirugia de pesos denominada jBlaze, desarrollada por Apollo Raines. A diferencia del ajuste fino convencional, no se realiza entrenamiento con gradientes: se identifican direcciones de comportamiento en el espacio de activaciones y se abaten (ablacion) directamente sobre los pesos del modelo. En este caso concreto se suprimen tres disposiciones aprendidas: la negativa a responder (refusal), la verborrea y se amplifica la tendencia a respuestas factuales.

El modelo conserva la arquitectura original de Llama 3.1 8B Instruct (LlamaForCausalLM, 32 capas, 8.030 millones de parametros, pesos en bf16) y hereda su ventana de contexto, tokenizador y plantilla de chat. La intervencion es de una sola direccion por comportamiento y esta publicada como demostracion de investigacion: el propio autor advierte que los modelos liberados publicamente se dejan a fuerza parcial deliberadamente, de modo que lo descargable es una prueba de concepto y no la version completa de la herramienta.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible de que las disposiciones de comportamiento (incluida la seguridad) residen en los pesos como direcciones localizables y editables sin reentrenar. Por otro, ilustra el riesgo asociado: la misma tecnica que reduce alucinaciones o toxicidad puede eliminar los guardarrailes de negativa, lo que exige cautela en cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 (compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es identica a la del modelo base: un transformer decoder-only con 32 capas, atencion multi-cabeza con RoPE, normalizacion RMSNorm y activacion SwiGLU, con 8.030 millones de parametros en bf16. No hay cambios estructurales, ni de tokenizador, ni de plantilla de chat. La modificacion se aplica exclusivamente sobre los tensores de pesos.

El entrenamiento es nulo en el sentido convencional: no hay pasos de gradiente, ni dataset de ajuste, ni RLHF ni DPO. La herramienta jBlaze identifica una direccion de comportamiento en el espacio de representaciones y aplica una ablacion direccional sobre los pesos, de forma analoga a las tecnicas de representation engineering y abliteration. En esta variante se aplican tres direcciones: supresion de refusal, amplificacion de truthful y supresion de verbosity. El autor indica que la edicion es de una sola direccion por comportamiento y de fuerza parcial en la version publica, y documenta un problema conocido de concordancia sicofantica (sycophantic_agreement) que persiste tras la edicion.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat de Llama 3.1.
- Respuestas factuales con menor tendencia a la evasiva y a la negativa, segun la direccion de truthful amplificada.
- Estilo conciso: supresion de relleno y verbosidad, con respuestas mas directas.
- Razonamiento aritmetico basico y generacion de codigo simple (el autor muestra ejemplos de multiplicacion y de una funcion Python).
- Capacidad de mantener una postura ante afirmaciones falsas del usuario en algunos casos (ejemplo del autor sobre la Tierra plana), aunque con el caveat documentado de concordancia sicofantica.
- Soporte de tool calling y function calling: no disponible de forma especifica en la informacion proporcionada; el modelo base lo soporta, pero la edicion no documenta su preservacion.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: no incluye vision, audio ni modo thinking explicito.

## Casos de uso

- Investigacion en interpretabilidad y seguridad: el modelo permite estudiar como se codifican las disposiciones de negativa y factualidad en los pesos, comparando activaciones con el modelo base sin reentrenar.
- Evaluacion de tecnicas de representation engineering: sirve como referencia para medir el efecto de ablaciones direccionales sobre refusal, verbosidad y precision factual en un checkpoint de 8B.
- Generacion de respuestas directas en tareas de extraccion de datos: la supresion de verbosidad reduce el relleno en tareas de resumen o extraccion estructurada, donde la concision es un requisito de producto.
- Pruebas de robustez de guardarrailes: util para auditar que filtros externos siguen siendo necesarios cuando se elimina la negativa aprendida, en entornos de red teaming controlados.
- Asistente de codigo en prototipos: con 8B parametros y pesos en bf16, cabe en una GPU de 24 GB y puede generar funciones simples y explicaciones breves en flujos de desarrollo internos.
- Base para experimentos de destilacion o cuantizacion: al ser un checkpoint Llama 3.1 estandar en safetensors, se integra en pipelines existentes de vLLM, TGI o llama.cpp para comparar comportamiento antes y despues de la edicion.
- Docencia sobre alineamiento: ejemplo tangible de que la seguridad de un modelo no es una capa separada, sino una propiedad de los pesos, con implicaciones directas para el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 20-24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones por tamano, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; L40S o RTX 6000 Ada para inferencia single-GPU en bf16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto limitado, y en RTX 3090/4080 o superiores con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), vLLM, TGI, llama.cpp y Ollama tras conversion a GGUF; el formato publicado es safetensors, por lo que la cuantizacion requiere conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Edicion de comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-Abliterated-Truthful-Concise | 8,03B | no disponible | Si (ablacion de refusal, verbosity; amplificacion de truthful) | llama3.1 | Hugging Face, 391 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K (modelo base) | No | llama3.1 | Hugging Face, ampliamente distribuido |
| Variantes abliterated de Llama 3 8B (comunidad) | ~8B | 8K-128K segun base | Si (eliminacion de refusal) | llama3 / llama3.1 | Hugging Face, multiples autores |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32K | No | Apache 2.0 | Hugging Face |

La diferencia principal frente al modelo base y frente a Mistral-7B-Instruct es la edicion de pesos: este checkpoint modifica el comportamiento sin reentrenar, mientras que las alternativas requieren prompts de sistema o ajuste fino para obtener respuestas mas directas. La licencia llama3.1 impone restricciones adicionales frente a Apache 2.0 en cuanto a uso comercial y denominacion.

## Limitaciones y advertencias

- Eliminacion de guardarrailes de negativa: el modelo responde a peticiones que el base rechazaria, incluidos ejemplos de la propia model card sobre manipulacion de cerraduras; no debe exponerse sin filtros externos.
- Problema conocido documentado por el autor: concordancia sicofantica (sycophantic_agreement), es decir, tendencia a ceder ante afirmaciones del usuario en algunos contextos pese a la direccion de truthful.
- Fuerza parcial deliberada: el autor indica que la version publica es una demostracion con la edicion atenuada, por lo que el comportamiento observado no representa la capacidad completa de la tecnica.
- Riesgo de alucinacion: la amplificacion de factualidad no garantiza correccion; no hay benchmarks publicados que midan la tasa de alucinacion tras la edicion.
- Idioma: solo ingles segun la model card; el rendimiento en castellano no esta documentado.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; se asume la del base, pero no esta verificado que la edicion la preserve intacta.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial, obligaciones de atribucion y clausulas de aceptacion; no es una licencia permisiva tipo Apache 2.0.
- Madurez: 391 descargas y 0 likes en el momento de la consulta, sin validacion independiente ni evaluaciones de terceros.
- Uso en produccion: no recomendado como modelo general sin auditoria previa de seguridad, dada la supresion de refusal y la ausencia de benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Truthful-Concise
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Herramienta jBlaze: https://jblaze.dev
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
