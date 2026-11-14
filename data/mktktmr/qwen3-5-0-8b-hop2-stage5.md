# mktktmr/qwen3.5-0.8b-hop2-stage5

## Resumen

`mktktmr/qwen3.5-0.8b-hop2-stage5` es un ajuste fino por LoRA (fusionado en los pesos base) del modelo `Qwen/Qwen3.5-0.8B` de Alibaba Qwen. Lo desarrolla el usuario independiente `mktktmr` y su proposito es muy concreto: dado un par formado por una pregunta y los documentos recuperados hasta ese momento, el modelo debe seleccionar un unico nombre propio o entidad que sirva como siguiente termino de busqueda en un pipeline de recuperacion multi-salto (multi-hop retrieval). No es un modelo de proposito general, sino una pieza especializada dentro de un sistema RAG iterativo en japones.

El modelo hereda la arquitectura transformer densa del Qwen3.5-0.8B, con aproximadamente 853 millones de parametros (852.985.920 segun los safetensors publicados) y un repositorio de 1,7 GB en formato safetensors. El ajuste se ha realizado sobre datos derivados de JEMHopQA y de un conjunto de fragmentos de Wikipedia en japones, por lo que su dominio funcional esta acotado al idioma japones y a la tarea de seleccion de entidades para expansion de consultas.

Su relevancia es limitada pero clara para quien construye sistemas de busqueda multi-salto: demuestra un patron de descomposicion de tareas en el que un modelo pequeno asume una funcion muy estrecha (elegir el siguiente salto) en lugar de intentar resolver toda la cadena de razonamiento. Al estar basado en Qwen3.5-0.8B, cuyo modelo base se distribuye bajo Apache-2.0, el punto de partida es permisivo, aunque la licencia de este derivado concreto no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se declaran GGUF ni cuantizaciones) |
| Idiomas soportados | japones (uso previsto); no se declara cobertura multilingue oficial |
| Licencia | no disponible (el modelo base Qwen3.5-0.8B es Apache-2.0, pero el derivado no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer denso de la familia Qwen3.5 con unos 853 millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA y posteriormente se fusionaron los adaptadores en los pesos del modelo, de modo que el resultado es un checkpoint denso estandar, sin adaptadores separados. La model card no detalla hiperparametros de entrenamiento (rango del LoRA, tasa de aprendizaje, numero de pasos, numero de tokens vistos) ni si hubo fases de RLHF o DPO; el ajuste parece ser exclusivamente de tipo supervisado sobre la tarea de seleccion de entidades.

Los datos de entrenamiento declarados son dos fuentes: por un lado, JEMHopQA (licencia CC BY-SA 4.0), un corpus de preguntas multi-salto en japones, filtrado y reformateado para la tarea; por otro, un conjunto de fragmentos distribuidos derivados de Wikipedia en japones (tambien CC BY-SA 4.0) a partir de los cuales se sintetizaron preguntas de dos saltos usando el propio Qwen3.5-0.8B. Es decir, hay generacion sintetica de datos de entrenamiento con el modelo base, lo que introduce el riesgo habitual de propagar errores del generador. La innovacion tecnica no esta en la arquitectura, sino en el planteamiento: especializar un modelo minusculo en una subtarea de un pipeline de recuperacion multi-salto en lugar de usar un modelo grande para toda la cadena.

## Capacidades

- Seleccion de terminos de busqueda: dado un contexto con la pregunta original y los documentos ya recuperados, devuelve una entidad (nombre propio) para la siguiente consulta.
- Razonamiento multi-salto acotado: encadenamiento de evidencia entre fragmentos para identificar la entidad puente que falta.
- Comprension lectora en japones sobre fragmentos de Wikipedia.
- Generacion de texto breve y altamente restringida a la tarea (no esta pensado para generacion abierta).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes generales ni de modos de razonamiento extendido (thinking mode).
- No se declaran capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues: no declaradas; el uso previsto es japones.

## Casos de uso

- Recuperacion multi-salto en RAG sobre Wikipedia japonesa: el modelo se inserta como selector del siguiente termino de busqueda tras cada ronda de recuperacion, permitiendo encadenar consultas hasta reunir la evidencia necesaria para responder.
- Sistemas de pregunta-respuesta sobre dominios documentales en japones: integrado en un orquestador que alterna recuperacion y seleccion de entidad, reduce la necesidad de un LLM grande en cada iteracion.
- Desambiguacion de entidades puente: cuando la pregunta exige relacionar dos entidades mediante una tercera (por ejemplo, una persona, una obra y su autor), el modelo propone la entidad intermedia a consultar.
- Enrutado de consultas en motores de busqueda corporativos: a partir de los resultados ya devueltos, genera la consulta de refinamiento con el nombre propio relevante, lo que resulta util en bases de conocimiento internas en japones.
- Experimentacion academica en retrieval multi-hop: sirve como componente ligero y reproducible para investigar estrategias de descomposicion de consultas sin coste elevado de inferencia.
- Filtrado previo en pipelines de moderacion o curaduria documental: al seleccionar una entidad concreta a partir de un contexto, puede usarse para dirigir la expansion de un grafo de conocimiento o la siguiente peticion a una API externa.
- Despliegue en entornos con recursos muy limitados: con 853 millones de parametros puede ejecutarse en CPU o en GPU de gama baja, lo que facilita prototipos y pruebas a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7-2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB con contexto moderado.
- Cuantizacion: al no publicarse pesos GGUF, la cuantizacion requeriria conversion manual (por ejemplo, a 8 bits o 4 bits) con herramientas como llama.cpp o GPTQ/AWQ.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 lo ejecutan con holgura. En datacenter, A100 o H100 estan sobredimensionadas para este tamano y solo se justifican por agregacion de muchas instancias.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers con PyTorch, vLLM o TGI para servir en GPU, y llama.cpp u Ollama tras conversion a GGUF. No se declara compatibilidad explicita con ningun framework en la model card.
- Latencia y throughput: no disponibles; por tamano, se espera latencia de decenas de milisegundos por peticion en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-hop2-stage5 | 852.985.920 | no disponible | Seleccion de terminos de busqueda (multi-hop, japones) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible en esta ficha | Proposito general | Apache-2.0 | Hugging Face |
| Modelos de recuperacion multi-hop especializados (genericos) | variable | variable | Recuperacion multi-salto | variable | no disponible |

No se dispone de datos de rendimiento comparativos entre este ajuste y alternativas de la misma categoria; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea; su uso para generacion abierta, codigo o matematicas producira resultados pobres.
- Idioma: disenado para japones; no se declara ni se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia del derivado no declarada: aunque el modelo base es Apache-2.0, la ausencia de licencia explicita en este repositorio genera incertidumbre juridica para uso comercial. Ademas, los datos de entrenamiento incluyen material CC BY-SA 4.0 (JEMHopQA y fragmentos de Wikipedia), cuyas obligaciones de atribucion y comparticion podrian afectar a la distribucion del modelo.
- Datos sinteticos: parte del entrenamiento se genero con el propio Qwen3.5-0.8B, lo que puede propagar sesgos y errores del generador.
- Riesgo de alucinacion: al tratarse de un modelo de 0,8B, puede inventar entidades o seleccionar nombres propios plausibles pero incorrectos; conviene validar la salida contra el corpus antes de usarla como consulta.
- Sin benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de su precision en la tarea, lo que desaconseja su uso en produccion sin una evaluacion propia.
- Repositorio sin descargas ni likes y creado en 2026: senal de proyecto experimental y sin mantenimiento comunitario conocido.
- No se documentan hiperparametros de entrenamiento ni el proceso de filtrado de datos, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-hop2-stage5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
