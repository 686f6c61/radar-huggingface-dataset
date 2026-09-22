# CHRISTS20/qwn-uml-lora-7b-v2

## Resumen

CHRISTS20/qwn-uml-lora-7b-v2 es un adaptador LoRA publicado por el usuario CHRISTS20 sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Se distribuye como repositorio PEFT (libreria `peft`, pesos en safetensors) de aproximadamente 0,1 GB, un tamano coherente con pesos de adaptador y no con un modelo completo: para utilizarlo hay que cargar primero el modelo base de 7,61 mil millones de parametros y aplicar despues el adaptador, o bien fusionar ambos pesos. El identificador del repositorio incluye la cadena "uml", lo que apunta a un ajuste orientado al modelado UML, pero la model card no confirma ni el dominio ni el conjunto de datos de entrenamiento.

La model card publicada es la plantilla por defecto de HuggingFace, con la practica totalidad de los campos marcados como "[More Information Needed]": no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion. Los unicos datos tecnicos explicitos son que el ajuste se realizo mediante SFT (supervised fine-tuning) con las librerias transformers y trl, y que se genero con PEFT 0.21.0. El repositorio no incluye pesos del modelo base, tokenizador ni ficheros de configuracion adicionales mas alla del adaptador.

Su relevancia actual es limitada y de caracter exploratorio: el repositorio acumula 0 descargas y 0 likes desde su creacion el 22 de septiembre de 2026. Puede interesar como ejemplo de adaptacion de subdominio (UML) sobre un modelo de codigo abierto, pero la informacion disponible es insuficiente para evaluar su calidad y cualquier uso en produccion requiere una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base Qwen2.5-Coder-7B-Instruct); no detallada en la model card |
| Parametros totales | No disponible para el adaptador (repo de 0,1 GB). Modelo base: 7,61 mil millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. Modelo base: 32.768 tokens nativos, ampliable a 131.072 con YaRN (documentacion publica de Qwen) |
| Tipos de cuantizacion | El adaptador se publica en safetensors sin cuantizar; tras fusionarlo con el modelo base admite GGUF (Q4_K_M, Q5_K_M, Q8_0), AWQ, GPTQ y bitsandbytes en 4 y 8 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara; el modelo base se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de publicacion | peft (framework PEFT 0.21.0) |
| Tipo de ajuste | SFT (supervised fine-tuning) con transformers y trl |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura efectiva es la del modelo base Qwen2.5-Coder-7B-Instruct: un transformer decoder-only con 28 capas, atencion con consultas agrupadas (GQA) de 28 cabezas de consulta y 4 cabezas de clave/valor, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Segun la documentacion publica de Qwen (no reproducida en la model card de este repositorio), el modelo base se entreno sobre del orden de 5,5 billones de tokens con un contexto nativo de 32.768 tokens, extensible a 131.072 mediante escalado YaRN. Estos datos corresponden al modelo base y deben verificarse en su propia ficha.

En cuanto al entrenamiento del adaptador, la informacion disponible se limita a la etiqueta `sft` y a las librerias empleadas (transformers, trl, PEFT 0.21.0). No se especifican el rango y el alpha del LoRA, los modulos objetivo, el numero de pasos, la tasa de aprendizaje, la composicion del dataset ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras).

## Capacidades

La model card no documenta capacidades especificas del adaptador. A continuacion se separan las capacidades heredadas del modelo base (documentadas publicamente por Qwen y no verificadas en este repositorio) de las que el ajuste podria anadir, que estan sin confirmar.

- Generacion de codigo: el modelo base esta especializado en generacion y completado de codigo en multiples lenguajes de programacion, con soporte de relleno en medio (fill-in-the-middle).
- Razonamiento sobre repositorios: el modelo base maneja contextos largos, lo que permite tareas de comprension de codigo a nivel de repositorio dentro de la ventana de contexto.
- Conversacion multi-turno: el modelo base es una variante instruct, ajustada para seguir instrucciones en formato de chat.
- Tool calling / function calling: el modelo base de la familia Qwen2.5 soporta llamada a funciones; la conservacion de esta capacidad tras el ajuste LoRA no esta documentada.
- Capacidades de agente: no disponibles ni confirmadas para el adaptador.
- Capacidades multilingues: no disponibles. La model card no declara idiomas.
- Capacidad especifica del ajuste: el identificador "uml" sugiere generacion o interpretacion de diagramas UML (por ejemplo, sintaxis PlantUML o Mermaid), pero no hay ninguna confirmacion en la model card ni ejemplos de uso publicados.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.

## Casos de uso

Los siguientes escenarios son plausibles dado el modelo base y el posible dominio del ajuste, pero ninguno esta validado por el autor. Se recomienda evaluarlos con un conjunto de prueba propio antes de cualquier despliegue.

- Generacion de diagramas UML desde lenguaje natural: si el ajuste cumple lo que sugiere su nombre, el modelo podria convertir una descripcion funcional en sintaxis PlantUML o Mermaid (diagramas de clases, de secuencia, de casos de uso) dentro de la ventana de contexto del modelo base, evitando el trabajo manual de dibujo.
- Extraccion de diagramas de clases a partir de codigo heredado: alimentando ficheros fuente dentro de la ventana de contexto, el modelo podria devolver un diagrama de clases que refleje clases, atributos y relaciones, util en proyectos sin documentacion de arquitectura.
- Documentacion tecnica asistida: generacion de descripciones de arquitectura y diagramas de componentes a partir de un repositorio, integrable en un pipeline de CI/CD que regenere la documentacion en cada release.
- Refactorizacion guiada por modelo: uso del modelo para proponer un modelo de clases antes de reestructurar un modulo, combinando la capacidad de codigo del modelo base con la salida en notacion UML.
- Asistente en IDE para equipos de desarrollo: integracion como backend de un plugin que traduzca una descripcion de requisitos en un esqueleto de clases y su diagrama asociado, con el modelo base sirviendo el resto de tareas de codigo.
- Docencia de ingenieria del software: generacion de ejemplos de diagramas a partir de enunciados de ejercicios, con la salvedad de que hay que verificar la correccion sintactica de cada salida.
- Especificacion formal temprana: conversion de historias de usuario en diagramas de actividad o de secuencia para revisiones de diseno previas a la implementacion.
- Evaluacion comparativa de adaptadores de dominio: el repositorio, de 0,1 GB, es un candidato ligero para experimentos de investigacion sobre transferencia de dominio en modelado de software, sin necesidad de reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye la seccion de evaluacion completa (aparece como "[More Information Needed]") y el repositorio no aporta ningun resultado de MMLU, HumanEval, GSM8K, MBPP ni de metricas especificas de generacion de diagramas UML.

## Requisitos de hardware

Al tratarse de un adaptador, los requisitos son los del modelo base Qwen2.5-Coder-7B-Instruct mas el coste marginal del adaptador (aproximadamente 0,1 GB en precision de entrenamiento).

| Precision | Pesos (aprox.) | KV cache a 32.768 tokens (aprox.) | VRAM total orientativa |
|---|---|---|---|
| bf16 / fp16 | 15,2 GB | 1,8 GB | 17-18 GB |
| int8 (bitsandbytes) | 7,6 GB | 1,8 GB | 10-11 GB |
| GGUF Q8_0 | 8,1 GB | 1,8 GB | 10-11 GB |
| GGUF Q5_K_M | 5,4 GB | 1,8 GB | 7-8 GB |
| GGUF Q4_K_M | 4,7 GB | 1,8 GB | 6-7 GB |

- Caben en GPU de consumo: las cuantizaciones de 4 y 5 bits funcionan en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060 Ti) con contexto moderado; 12 GB (RTX 3060 12 GB, RTX 4070) es comodo; en bf16 se necesita una GPU de 24 GB (RTX 3090, RTX 4090) o superior.
- GPU profesionales recomendadas para bf16 con contexto largo: A100 40 GB, H100 80 GB, L40S 48 GB; tambien valido un A6000 de 48 GB.
- Despliegue: transformers + peft para uso directo del adaptador; vLLM y SGLang admiten adaptadores LoRA en caliente sobre el modelo base; TGI soporta adaptadores; llama.cpp y Ollama requieren fusionar el adaptador o convertirlo con `convert_lora_to_gguf.py` antes de cuantizar a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada y dependeran de la cuantizacion, el tamano de lote y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparacion se limita a caracteristicas estructurales. Las celdas marcadas como no disponibles reflejan la ausencia de informacion verificable en la documentacion consultada.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| CHRISTS20/qwn-uml-lora-7b-v2 | Adaptador sobre 7,61 mil millones | No disponible (heredado del base) | No disponible | safetensors (LoRA) | No disponible |
| Qwen/Qwen2.5-Coder-7B-Instruct (base) | 7,61 mil millones | 32.768 nativos; 131.072 con YaRN | Apache 2.0 | safetensors, GGUF (comunidad) | Documentado por Qwen en su ficha |
| Qwen2.5-Coder-1.5B-Instruct | 1,54 mil millones | 32.768 nativos | Apache 2.0 | safetensors, GGUF | Documentado por Qwen en su ficha |
| Adaptadores de dominio comparables (UML, diagramas) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Model card vacia: practicamente todos los campos son la plantilla por defecto. No hay informacion sobre datos, entrenamiento, evaluacion ni limitaciones, lo que impide cualquier evaluacion de calidad previa.
- Licencia sin declarar: la model card no especifica licencia. Aunque el modelo base Qwen2.5-Coder-7B-Instruct se publica bajo Apache 2.0, la ausencia de licencia explicita en el repositorio del adaptador es un riesgo juridico para uso comercial y debe aclararse con el autor.
- Riesgo de alucinacion: no evaluado. En generacion de diagramas UML es especialmente probable que el modelo produzca sintaxis invalida o relaciones inexistentes; toda salida debe validarse con un parser.
- Idiomas: no declarados. El autor no confirma soporte de castellano; el modelo base esta optimizado para ingles y chino, con cobertura desigual del resto de idiomas.
- Sesgos: no documentados. El adaptador hereda los sesgos del modelo base y del dataset de ajuste, que se desconoce.
- Sin adopcion: 0 descargas y 0 likes. No hay informes de terceros, issues ni evaluaciones independientes.
- Conservacion de capacidades: un ajuste SFT estrecho sobre un modelo de codigo puede degradar capacidades generales (tool calling, conversacion, otros lenguajes) por olvido catastrofico. No se ha publicado ninguna prueba al respecto.
- Longitud de contexto efectiva: aunque el modelo base soporta 32.768 tokens y hasta 131.072 con YaRN, el adaptador puede degradarse fuera de la longitud usada durante el ajuste, que se desconoce.
- Fecha de creacion futura en los metadatos (22 de septiembre de 2026): conviene tratar los metadatos del repositorio con cautela.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/CHRISTS20/qwn-uml-lora-7b-v2
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio GitHub de la familia Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Blog de Qwen sobre Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder/
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Articulo citado en la model card (calculo de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
