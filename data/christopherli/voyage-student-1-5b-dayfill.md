# ChristopherLi/voyage-student-1-5b-dayfill

# voyage-student-1-5b-dayfill

## Resumen

voyage-student-1-5b-dayfill es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario ChristopherLi como componente de estudiante destilado para la aplicacion de escritorio "Local LLM AI Agent for Travel Planning". Con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), el modelo se especializa en la generacion de itinerarios de viaje dia a dia, siguiendo trayectorias de uso de herramientas del estilo Trip.Planner: propuesta de ruta, llamada a la funcion `plan_trip` y volcado posterior del itinerario en formato de relleno por dias (day-fill).

El problema que aborda es concreto: ejecutar un agente de planificacion de viajes en local, sin depender de APIs comerciales, con un modelo lo bastante pequeno para servirse mediante Ollama en hardware de consumo. La relevancia actual radica en que demuestra el patron de destilacion de trayectorias de un profesor hacia un estudiante de 1,5B con enfasis en tool calling, un enfoque habitual en el despliegue de agentes locales de bajo coste.

La licencia es Apache 2.0 (heredada del modelo base), el idioma declarado es unicamente ingles y el repositorio incluye pesos en safetensors para transformers, una cuantizacion Q4_K_M en GGUF y un Modelfile para Ollama. El modelo no es un motor de reservas: los precios y URLs deben proceder de herramientas en vivo, no de la generacion del propio modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajustado mediante SFT |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara hasta 32.768 tokens y la aplicacion companion configura OLLAMA_NUM_CTX=16384 |
| Tipos de cuantizacion | Q4_K_M en GGUF (incluida en el repo); los pesos originales estan en safetensors en precision completa |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (Q4_K_M para Ollama/llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal, y se ajusta mediante SFT con la libreria TRL. El autor indica que el entrenamiento se realizo sobre rollouts destilados de un profesor, con enfasis en la estructura de itinerario "day-fill" (relleno dia a dia) y en trayectorias de uso de herramientas del estilo Trip.Planner: propuesta de ruta, invocacion de `plan_trip` y generacion del itinerario resultante.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO mas alla del SFT. La innovacion tecnica principal no reside en la arquitectura, sino en la especializacion del estudiante hacia un formato de salida concreto y su empaquetado para inferencia local (GGUF Q4_K_M + Modelfile), lo que permite replicar el flujo del agente sin infraestructura en la nube.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Planificacion de itinerarios de viaje con estructura dia a dia (day-fill).
- Soporte de tool calling / function calling, en particular la funcion `plan_trip` y el flujo de propuesta de ruta.
- Ejecucion dentro de un agente de multiples pasos: propuesta de ruta, llamada a herramienta y redaccion del itinerario.
- Servicio local mediante Ollama y llama.cpp, y compatibilidad con text-generation-inference segun los tags del repositorio.
- Uso con transformers para inferencia o entrenamiento posterior.
- Capacidades multilingues limitadas al ingles declarado; no se documentan otros idiomas.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Planificacion de viajes en local: el modelo genera itinerarios dia a dia en respuesta a una consulta del usuario, integrado en la aplicacion de escritorio del autor mediante Ollama.
- Orquestacion de tool calling: sirve como estudiante que decide cuando invocar `plan_trip` y como incorporar el resultado devuelto por la herramienta en la respuesta final.
- Prototipado de agentes de viaje sin coste de API: al ejecutarse en local con una cuantizacion Q4_K_M, permite iterar sobre prompts y flujos de agente sin gasto de tokens en servicios externos.
- Demostracion de destilacion de trayectorias: util como caso de estudio para replicar el patron profesor grande / estudiante pequeno en dominios con herramientas bien definidas.
- Asistente de relleno de itinerarios: dado un esqueleto de viaje (ciudades y fechas), completa cada dia con actividades siguiendo el formato aprendido.
- Base para ajustes posteriores: al distribuirse en safetensors, puede emplearse como punto de partida para SFT adicional en dominios turisticos o de agendado.
- Integracion en flujos de reserva asistida: el modelo redacta el plan, pero los precios y enlaces deben obtenerse de herramientas en vivo, no generarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de tool calling o de calidad de itinerarios, y tampoco se aportan comparaciones cuantitativas con el modelo profesor.

## Requisitos de hardware

- VRAM estimada en precision completa (FP16/BF16): aproximadamente 3,1 GB solo para los pesos, mas el cache KV y el overhead del runtime.
- VRAM estimada con la cuantizacion Q4_K_M incluida: aproximadamente 1 GB para los pesos; con contexto de 16.384 tokens el cache KV anade del orden de 0,5 GB en funcion de la configuracion de atencion del modelo base.
- GPU recomendadas: cabe con holgura en RTX 3060 12 GB, RTX 4060, RTX 4070 y superiores; tambien en A100, H100 o L40S, aunque estan sobredimensionadas para 1,5B de parametros.
- Compatibilidad con GPU de consumo: si, es un modelo pensado para hardware de consumo; puede ejecutarse incluso en CPU con llama.cpp/Ollama, aunque con mayor latencia.
- Opciones de despliegue: Ollama (flujo documentado por el autor mediante Modelfile), llama.cpp con el GGUF Q4_K_M, transformers con safetensors, y text-generation-inference segun los tags del repositorio.
- Latencia y throughput: no disponibles; no se aportan mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voyage-student-1-5b-dayfill | 1,5B | no disponible (base: 32.768) | Itinerarios de viaje y tool calling | Apache 2.0 | HuggingFace, GGUF, Ollama |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion del modelo base) | Proposito general, instruct | Apache 2.0 | HuggingFace, multiples runtimes |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens (segun documentacion del modelo) | Proposito general, instruct | Llama 3.2 Community License | HuggingFace, GGUF, Ollama |
| Gemma-2-2B-it | 2,6B | 8.192 tokens (segun documentacion del modelo) | Proposito general, instruct | Gemma Terms of Use | HuggingFace, GGUF, Ollama |

La comparacion de rendimiento no es posible con los datos disponibles: no hay benchmarks publicados para voyage-student-1-5b-dayfill. La diferencia principal frente a los modelos de proposito general de su categoria es la especializacion en el flujo de planificacion de viajes y su empaquetado especifico para la aplicacion companion.

## Limitaciones y advertencias

- Modelo de nicho: esta ajustado para planificacion de viajes con tool calling; su rendimiento fuera de ese dominio sera inferior al de su modelo base.
- Idioma: solo se declara ingles. El uso en castellano no esta soportado ni evaluado.
- Riesgo de alucinacion en datos factuales: precios, horarios, direcciones y URLs pueden generarse de forma incorrecta. El propio autor advierte que el modelo no es un motor de reservas y que esos datos deben proceder de herramientas en vivo.
- Escala reducida: con 1,5B de parametros, la capacidad de razonamiento complejo, matematicas y conocimiento enciclopedico es limitada en comparacion con modelos mayores.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o robustez; al derivar de Qwen2.5, hereda los sesgos de su corpus de entrenamiento.
- Datos de entrenamiento: no se detallan la composicion del dataset ni los terminos de uso de las trayectorias destiladas, lo que dificulta auditar su procedencia.
- Adopcion practicamente nula: cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria de su calidad.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene verificar las condiciones de atribucion del modelo base.
- Produccion: al no existir benchmarks ni informes de latencia, cualquier despliegue en produccion exige una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChristopherLi/voyage-student-1-5b-dayfill
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de la aplicacion companion: https://github.com/ChristopherLI2002/An-AI-Agent-for-travel-planning

Nota: los resultados de la busqueda web proporcionada no guardan relacion con este modelo (corresponden a temas de automocion, fotografia y organizaciones religiosas), por lo que no se ha incorporado informacion adicional procedente de ellos.
