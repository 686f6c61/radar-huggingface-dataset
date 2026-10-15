# khtsly/e

## Resumen

khtsly/e es un modelo de lenguaje de tipo decoder denso de 2.694.626.816 parametros (aproximadamente 2,7 mil millones) publicado por el usuario khtsly en HuggingFace. Segun su model card, la arquitectura combina "Differential Attention V2" con "Exclusive Self-Attention" (etiquetada en el repositorio como diff_xsa), dos variantes de mecanismo de atencion orientadas a mejorar la selectividad y reducir el ruido en el calculo de atencion. El modelo se encuentra en fase de preentrenamiento activo: en el momento de la ultima actualizacion del repositorio (15 de octubre de 2026) el entrenamiento iba por el paso 1.600, con 627.202.559 tokens procesados.

Se trata, por tanto, de un checkpoint intermedio y no de un modelo finalizado ni alineado. No se ha publicado informacion sobre la composicion del dataset de entrenamiento, el numero total de tokens previstos, la longitud de contexto soportada, los idiomas cubiertos ni la licencia de distribucion. Tampoco hay resultados de benchmarks, pipeline declarado ni variantes cuantizadas. El repositorio ocupa 32,2 GB y contiene unicamente pesos en formato safetensors.

Su relevancia actual es principalmente experimental: sirve como referencia temprana para quienes investigan arquitecturas de atencion alternativas (differential attention y exclusive self-attention) aplicadas a modelos de escala ~3B, y como punto de partida para reproducir o auditar la evolucion del preentrenamiento. No es un modelo recomendable para uso en produccion en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder denso (transformer) con Differential Attention V2 + Exclusive Self-Attention (tag `diff_xsa`) |
| Parametros totales | 2.694.626.816 (aprox. 2,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Estado de entrenamiento | preentrenamiento en curso: paso 1.600, 627.202.559 tokens |
| Tamano del repositorio | 32,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 227 descargas, 1 like |
| Fecha de creacion / actualizacion | 13/10/2026 / 15/10/2026 |

## Arquitectura y entrenamiento

La model card describe el modelo como un "dense decoder" que combina Differential Attention V2 con Exclusive Self-Attention. La differential attention, en su formulacion publicada en la literatura, calcula la salida de atencion como la diferencia entre dos mapas de atencion softmax generados a partir de dos conjuntos de proyecciones query/key, de modo que se cancelan componentes comunes y se amplifica la senal diferencial; el objetivo declarado en esos trabajos es reducir el ruido de atencion y mitigar el fenomeno de "distraccion" por contexto irrelevante. La exclusive self-attention, por su parte, es una variante que modifica el calculo de atencion para excluir la contribucion del propio token (la componente self) en determinados terminos, buscando un reparto mas limpio de la informacion entre las cabezas. La model card no especifica en que consiste exactamente la version "V2" de differential attention, cuantas capas o cabezas tiene el modelo, la dimension oculta, el tamano de vocabulario ni la funcion de activacion, por lo que esos detalles deben considerarse no disponibles.

En cuanto al entrenamiento, los unicos datos publicados son el numero de paso (1.600) y el volumen de tokens consumidos (627.202.559, aproximadamente 0,63 mil millones). No se indica el numero total de tokens objetivo, la composicion del dataset, la mezcla de idiomas, si hubo fases de ajuste fino supervisado, RLHF o DPO, ni si se aplicaron tecnicas como decodificacion especulativa o atencion lineal adicional. El ratio de tokens por parametro en este punto es de aproximadamente 0,23 tokens por parametro, muy por debajo de los regimenes tipicos de modelos "compute-optimal" o sobreentrenados, lo que es coherente con un checkpoint intermedio de un preentrenamiento que aun no ha finalizado.

## Capacidades

No se ha publicado informacion verificable sobre las capacidades del modelo. A partir de los datos disponibles solo puede afirmarse lo siguiente:

- Generacion de texto autoregresiva: es la funcion esperada de un decoder denso de 2,7B parametros, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible; no se menciona plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se menciona ninguna modalidad adicional a texto.
- Alineacion instruccional: no disponible; el modelo esta en fase de preentrenamiento, por lo que no cabe esperar comportamiento de asistente.

## Casos de uso

Dado el estado de preentrenamiento y la ausencia de licencia, benchmarks y documentacion, los casos de uso realistas son de investigacion y experimentacion, no de produccion:

- Investigacion en mecanismos de atencion: el modelo permite estudiar el comportamiento empirico de differential attention y exclusive self-attention en un decoder de ~2,7B parametros, comparando curvas de perdida y patrones de atencion frente a un transformer estandar del mismo tamano.
- Reproduccion de preentrenamientos a escala media: sirve como referencia de configuracion (pasos, tokens, tamano de checkpoint) para equipos que entrenan modelos de 2-3B en clústeres pequenos.
- Analisis de estabilidad de entrenamiento: al disponer de checkpoints intermedios y de un paso y volumen de tokens declarados, es util para estudiar divergencias, picos de perdida o saturacion de atencion en las primeras fases.
- Destilacion o inicializacion de modelos menores: un checkpoint de 2,7B puede actuar como profesor o como inicializacion para experimentos de destilacion hacia modelos de 0,5-1B, siempre que la licencia lo permita (actualmente no definida).
- Pruebas de infraestructura de inferencia: el repositorio permite validar pipelines de carga de safetensors, conversion a otros formatos y medicion de throughput en GPUs de gama media, sin riesgo asociado a datos sensibles.
- Evaluacion de tecnicas de cuantizacion: al no existir variantes GGUF/AWQ/GPTQ publicadas, es un candidato para medir la degradacion de perplejidad al cuantizar a 8, 4 o 3 bits un modelo con atencion no estandar.
- Docencia y formacion: util en cursos de arquitecturas transformer para ilustrar variantes de atencion sobre un caso real y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta el estado de entrenamiento (paso 1.600, 627.202.559 tokens) y el numero de parametros, sin incluir metricas de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni ninguna otra evaluacion. Tampoco hay datos de perplejidad, throughput o latencia medidos.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritmeticas derivadas del numero de parametros publicado (2,69B) y no mediciones del autor:

- Pesos en fp32: aproximadamente 10,8 GB solo para los pesos.
- Pesos en fp16/bf16: aproximadamente 5,4 GB, mas cache KV y overhead del runtime.
- Pesos en int8: aproximadamente 2,7 GB; en int4: aproximadamente 1,4 GB (requiere cuantizacion propia, no publicada).
- VRAM total estimada en fp16 con contexto moderado: del orden de 7-10 GB, dependiendo de la longitud de contexto y del tamano de lote (la longitud de contexto no esta documentada, por lo que la cache KV no puede calcularse).
- GPU consumer: un modelo de 2,7B en fp16 cabe con holgura en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en int4 podria ejecutarse en GPUs de 6-8 GB.
- GPU de datacenter: A100 40/80 GB, H100 y L40S son sobredimensionadas para inferencia de un solo modelo, pero adecuadas para entrenamiento o lotes grandes.
- Opciones de despliegue: al publicarse solo safetensors, seria necesario convertir los pesos para usarlos con llama.cpp u Ollama (formato GGUF) o con vLLM/TGI (que aceptan safetensors, pero requieren conocer la arquitectura exacta y su implementacion). La compatibilidad con estos frameworks no esta confirmada y depende de que la arquitectura diff_xsa este soportada.
- Latencia y throughput: no disponible.
- Observacion sobre el tamano del repositorio: 32,2 GB para 2,69B parametros supera ampliamente una copia unica en fp32 (10,8 GB), lo que sugiere la presencia de varios checkpoints, estados de optimizador o pesos en precision superior. No se detalla en la informacion disponible.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de rango 2-4B ampliamente conocidos. Los datos de las alternativas proceden de su documentacion publica y no de la informacion proporcionada sobre khtsly/e; deben verificarse en las fuentes oficiales de cada modelo.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| khtsly/e | 2,69B | no disponible | no disponible | Preentrenamiento en curso (paso 1.600) |
| Qwen2.5-3B | 3,09B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | Modelo finalizado e instruido |
| Llama-3.2-3B | 3,21B | 128.000 tokens | Llama 3.2 Community License | Modelo finalizado e instruido |
| Gemma-2-2B | 2,61B | 8.192 tokens | Gemma Terms of Use | Modelo finalizado e instruido |
| Phi-3.5-mini | 3,8B | 128.000 tokens | MIT | Modelo finalizado e instruido |

Diferencias clave: las alternativas son modelos finalizados, con licencia explicita, plantilla de chat, soporte en frameworks de inferencia y resultados de benchmarks publicados. khtsly/e no ofrece ninguno de esos elementos en su estado actual. En rendimiento no es posible comparar porque no hay metricas publicadas para khtsly/e.

## Limitaciones y advertencias

- Modelo no finalizado: esta en fase de preentrenamiento (paso 1.600, 0,63 mil millones de tokens), por lo que su calidad de generacion sera baja y no ha recibido alineacion ni ajuste instruccional.
- Licencia no definida: al no declararse licencia, no existe autorizacion explicita de uso comercial. En la practica, la ausencia de licencia implica que los derechos de uso no estan concedidos de forma clara; conviene contactar con el autor antes de cualquier uso mas alla de la investigacion.
- Riesgo elevado de alucinacion y de texto incoherente: un modelo con tan pocos tokens vistos tiende a producir continuaciones gramaticales pero factualmente vacias o incorrectas.
- Sesgos desconocidos: no se documenta la composicion del dataset, por lo que no puede evaluarse el sesgo de genero, raza, idioma o ideologia.
- Idiomas no declarados: se desconoce que lenguas cubre y con que calidad; no hay garantia de soporte para castellano.
- Contexto desconocido: la longitud de contexto no esta publicada, lo que impide planificar aplicaciones multi-turno o de documento largo.
- Compatibilidad de frameworks incierta: la arquitectura diff_xsa puede no estar implementada en vLLM, TGI, llama.cpp u Ollama, lo que complica el despliegue sin escribir codigo especifico.
- Repositorio de gran tamano: 32,2 GB para 2,69B parametros implica costes de descarga y almacenamiento desproporcionados si solo se necesita un checkpoint.
- Sin benchmarks ni evaluacion de seguridad: no hay datos que permitan estimar fiabilidad, toxicidad o robustez frente a prompts adversarios.
- Sin garantia de mantenimiento: el autor no publica roadmap, paper ni fecha de finalizacion del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khtsly/e
- Perfil del autor en HuggingFace: https://huggingface.co/khtsly
- Listado de modelos del autor: https://huggingface.co/khtsly/models
- Plugin persistent-memory del autor en LM Studio Hub: https://lmstudio.ai/khtsly/persistent-memory
- Plugin skills del autor en LM Studio Hub: https://lmstudio.ai/khtsly/skills
- Ficha de sistema de memoria persistente (relacionada con el ecosistema del autor): https://mcpmarket.com/server/robust-long-term-memory
- Paper o blog tecnico del modelo: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
