# miesdevries/stay4s-domein-agent

## Resumen

stay4s-domein-agent es un ajuste fino del modelo Qwen2.5-7B-Instruct desarrollado por miesdevries y publicado bajo la atribución de Het Nieuwe Begin B.V. Se trata de un "domein agent" (agente de dominio) orientado a conocimiento y acciones específicas de un sector concreto, entrenado mediante SFT con adaptadores LoRA de rango 64 y distribuido en formato GGUF Q8 para inferencia local. Su único idioma declarado es el neerlandés (nl), lo que lo convierte en un modelo de nicho para aplicaciones en Países Bajos y Flandes.

El interés del modelo reside en su enfoque: en lugar de competir en capacidades generales, se especializa en un dominio de negocio ("stay4s") con una licencia Apache 2.0 que permite uso comercial sin restricciones añadidas. Está pensado para cargarse en Ollama o llama.cpp, lo que reduce la barrera de despliegue en entornos con GPU de gama media o incluso CPU.

Existe una discrepancia relevante en los metadatos: la model card declara Qwen2.5-7B-Instruct como modelo base, pero el recuento real de parámetros de los ficheros safetensors es de 4.022.468.096 (unos 4,02 mil millones), muy por debajo de los aproximadamente 7,6 mil millones del modelo base citado. El repositorio ocupa 4,8 GB. Esta inconsistencia debe verificarse antes de asumir cualquier capacidad derivada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5); detalles especificos del ajuste no disponibles |
| Parametros totales | 4.022.468.096 segun safetensors; la model card declara base Qwen2.5-7B-Instruct (discrepancia sin resolver) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos (131.072 con YaRN) |
| Tipos de cuantizacion | GGUF Q8 segun la model card; tambien se publican pesos safetensors; otras cuantizaciones no disponibles |
| Idiomas soportados | neerlandes (nl) declarado; el base Qwen2.5 soporta multiples idiomas, pero el ajuste no garantiza su conservacion |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query/key/value agrupadas (GQA). Sobre esa base se aplico un ajuste supervisado (SFT) mediante LoRA con rango r=64, segun indica la model card. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la longitud de secuencia usada ni si hubo fases posteriores de alineacion (DPO, RLHF) o aprendizaje por refuerzo.

Tampoco se documentan innovaciones tecnicas propias: no hay mencion a decodificacion especulativa, atencion lineal, mezcla de expertos ni tecnicas de razonamiento extendido. El valor del modelo esta, por tanto, en el ajuste de dominio y no en aportaciones arquitectonicas. La model card unicamente indica el formato de publicacion (GGUF Q8) y la recomendacion de cargarlo en Ollama o llama.cpp para inferencia local, sin detallar hiperparametros, semillas ni procedimiento de evaluacion.

## Capacidades

- Generacion de texto conversacional en neerlandes, heredada del ajuste sobre Qwen2.5-7B-Instruct.
- Comportamiento de agente de dominio: la model card lo describe como "domeinspecifieke kennis en acties" (conocimiento y acciones especificos de dominio), orientado a tareas acotadas de un sector concreto.
- Conversacion multi-turno: la etiqueta "conversational" del repositorio sugiere soporte de dialogos, aunque no se detalla la gestion de contexto largo.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse a traves de infraestructura de inferencia estandar (por ejemplo, la propia de Hugging Face o servidores compatibles con la API de OpenAI).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y planificacion de agentes: no documentado en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es de texto.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades multilingues: solo se declara neerlandes; el comportamiento en otros idiomas no esta evaluado.

## Casos de uso

- Atencion al cliente en neerlandes para un dominio vertical concreto: el modelo puede gestionar conversaciones de soporte en nl con terminologia especifica del sector, desplegado en local para cumplir requisitos de residencia de datos.
- Automatizacion de flujos internos de una empresa neerlandesa: al ser un "domein agent", encaja en asistentes que responden consultas recurrentes sobre procesos y politicas internas del dominio "stay4s".
- Clasificacion y enrutado de consultas entrantes: uso como primer nivel de triaje que interpreta la peticion del usuario en neerlandes y decide a que sistema derivarla, aprovechando la etiqueta de compatibilidad con endpoints.
- Extraccion de informacion estructurada de textos en neerlandes: conversion de formularios, correos o descripciones en campos normalizados dentro de un pipeline de negocio.
- Despliegue en edge o en servidor sin GPU dedicada: el formato GGUF Q8 y el recuento de parametros (4,02 mil millones) permiten ejecucion en CPU o en GPU de consumo mediante Ollama, util para prototipos y demos internas.
- Generacion asistida de respuestas para agentes humanos: borradores de respuesta en neerlandes que un operador revisa antes del envio, reduciendo el tiempo de redaccion.
- Base para experimentacion e investigacion en ajuste de dominio: al publicarse con licencia Apache 2.0 y pesos en safetensors, sirve como punto de partida para reproducir o extender el ajuste LoRA r=64.
- Integracion en pipelines de CI/CD de agentes: no recomendada como generador de codigo (no hay evidencia de capacidad de programacion); su encaje es como componente conversacional de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones especificas en neerlandes, y no se han encontrado resultados de terceros en la busqueda web realizada.

## Requisitos de hardware

El recuento real de parametros del repositorio (4,02 mil millones) y el modelo base declarado (Qwen2.5-7B-Instruct, unos 7,6 mil millones) difieren de forma sustancial, por lo que se ofrecen estimaciones para ambos escenarios. Son calculos teoricos de peso en memoria, no mediciones del autor.

| Escenario | FP16 | Q8 | Q4 |
|---|---|---|---|
| 4,02 mil millones de parametros | ~8,0 GB | ~4,3 GB | ~2,3 GB |
| 7,6 mil millones de parametros | ~15,2 GB | ~8,1 GB | ~4,4 GB |

- GPU recomendadas: para el escenario de 4B basta una RTX 3060 de 12 GB o superior; para el de 7B en Q8 se recomienda RTX 4070 Ti / RTX 4090 (16-24 GB) o una A100 40 GB para FP16.
- Cabe en GPU de consumo: si, en el escenario de 4B con cualquier cuantizacion razonable; en el de 7B, en Q4/Q8 con GPUs de 8-12 GB de VRAM. La VRAM necesaria debe sumar el espacio para la cache KV, que depende de la longitud de contexto no documentada.
- Opciones de despliegue: Ollama y llama.cpp son los recomendados explicitamente por la model card para el fichero GGUF Q8. La presencia de pesos safetensors y la etiqueta "endpoints_compatible" permiten usar vLLM o TGI, aunque no hay configuracion publicada ni garantia de compatibilidad verificada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| stay4s-domein-agent | 4,02 mil millones (safetensors) | no disponible | nl | apache-2.0 | Ajuste LoRA r=64 de dominio, sin benchmarks publicados |
| Qwen2.5-7B-Instruct (modelo base declarado) | ~7,6 mil millones | 32.768 tokens nativos | multilingue | apache-2.0 (salvo excepciones por tamano) | Modelo generalista con evaluaciones publicas; el ajuste no hereda necesariamente estas capacidades |
| Alternativas especializadas en neerlandes (por ejemplo, la familia GEITje o GPT-NL) | no disponible en la informacion proporcionada | no disponible | nl | no disponible | Existen en el ecosistema, pero no se dispone de datos verificados en esta busqueda para comparar |

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones cualitativas, ni comparaciones publicadas. Cualquier uso en produccion exige una bateria de pruebas propia.
- Discrepancia en el recuento de parametros: 4,02 mil millones en safetensors frente a los ~7,6 mil millones del base Qwen2.5-7B-Instruct declarado. Puede tratarse de un guardado parcial, de un modelo distinto al declarado o de un error de metadatos; conviene inspeccionar los ficheros antes de confiar en la model card.
- Riesgo de alucinacion: inherente a los modelos generativos y no mitigado de forma documentada. En un agente de dominio que ejecuta acciones, una salida incorrecta puede propagarse a sistemas posteriores.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o equidad. El modelo hereda los sesgos del corpus de ajuste y del modelo base, con el agravante de que el dataset de SFT no se describe.
- Limitacion idiomatica: solo se declara neerlandes. El uso en castellano, ingles u otros idiomas no esta soportado ni evaluado, y puede degradar el comportamiento respecto al modelo base.
- Contexto no especificado: se desconoce la ventana efectiva tras el ajuste; asumir 32.768 tokens por herencia del base es una suposicion, no un dato confirmado.
- Formato y cuantizacion: la distribucion principal es GGUF Q8. No hay versiones Q4/Q5 publicadas por el autor en la informacion disponible, lo que limita el despliegue en GPUs con poca VRAM si el modelo resulta ser de 7B.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion. Aun asi, al derivar de Qwen2.5, conviene revisar las condiciones de la licencia de Qwen aplicables al modelo base concreto.
- Madurez del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin historial de mantenimiento ni issues que permitan juzgar su fiabilidad.
- Procedencia: asociado a Het Nieuwe Begin B.V. segun la model card; no se ha verificado la identidad del autor ni la existencia de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miesdevries/stay4s-domein-agent
- Modelo base declarado (Qwen2.5-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5 (referencia de la arquitectura base): https://github.com/QwenLM/Qwen2.5
- Paper tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Busqueda web realizada: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos por el buscador correspondian a sitios de contenido para adultos sin ninguna relacion con el modelo, por lo que se han descartado y no se incluyen.
