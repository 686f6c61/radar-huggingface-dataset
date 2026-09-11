# Caldev/qwen3_5_9B_kreyol_cpt_lora

## Resumen

Caldev/qwen3_5_9B_kreyol_cpt_lora es un adaptador LoRA publicado por el usuario Caldev sobre el modelo base unsloth/Qwen3.5-9B-Base. Por el nombre del repositorio se deduce un ajuste de tipo continued pretraining (CPT, las siglas "cpt" del identificador) orientado a un corpus en kreyol, aunque la model card no documenta ni el conjunto de datos ni el procedimiento de entrenamiento empleado.

El repositorio ocupa 0,5 GB, un tamano coherente con un adaptador LoRA y no con un modelo completo de 9.000 millones de parametros, lo que confirma que se distribuyen unicamente los pesos delta del ajuste. La model card es minima: se limita a indicar el autor, la licencia apache-2.0, el modelo base y que el entrenamiento se realizo con Unsloth, sin detallar hiperparametros, rango del adaptador, tokens de entrenamiento ni composicion del dataset.

Su relevancia es limitada y de nicho: se trata de un artefacto de investigacion sin descargas ni valoraciones en el momento de la consulta, sin benchmarks publicados y con una discrepancia entre el nombre del repositorio (que apunta a kreyol) y la etiqueta de idioma declarada (unicamente "en"). Resulta util como punto de partida para experimentos de adaptacion a lenguas de bajos recursos, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el modelo base pertenece a la familia Qwen3.5 (transformer decoder-only, no confirmado) |
| Parametros totales | ~9.000 millones en el modelo base; el repositorio contiene un adaptador LoRA (parametros del adaptador: no disponible) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (no hay GGUF ni GPTQ/AWQ) |
| Idiomas soportados | en, segun la etiqueta language de la model card; el nombre del repositorio sugiere kreyol, no confirmado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Tamano del repositorio | 0,5 GB |
| Modelo base | unsloth/Qwen3.5-9B-Base |
| Herramienta de entrenamiento | Unsloth (mencionada en la model card) |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna del modelo base (numero de capas, dimension del modelo, mecanismo de atencion, uso de GQA o RoPE, tipo de normalizacion) ni sobre la configuracion del adaptador LoRA (rango, alpha, modulos objetivo). Lo unico confirmado es que se trata de un ajuste sobre unsloth/Qwen3.5-9B-Base, un modelo preentrenado de aproximadamente 9.000 millones de parametros, y que el entrenamiento se realizo con la libreria Unsloth, orientada a reducir el consumo de memoria y acelerar el fine-tuning de modelos abiertos.

Tampoco se especifica el regimen de entrenamiento: no hay datos sobre numero de tokens de continued pretraining, composicion del corpus (si es kreyol haitiano, kreyol louisianes u otra variante), uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre posibles innovaciones tecnicas. La ausencia de estos datos impide evaluar la calidad del ajuste o reproducirlo.

## Capacidades

- Generacion de texto: al derivar de un modelo base sin alineacion posterior, la capacidad esperada es la de continuacion de texto, no la de dialogo instruido. No hay evidencia publicada que lo confirme.
- Modelado de lengua kreyol: el nombre del repositorio sugiere adaptacion a esta lengua, pero la model card declara unicamente ingles y no aporta evaluaciones por idioma. No confirmado.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo y, al tratarse de un modelo base, no es esperable.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay indicios de entrenamiento en trayectorias de agente ni modo de razonamiento explicito.
- Capacidades multilingues: la unica etiqueta declarada es "en". No se documenta soporte de otros idiomas, mas alla de la posible herencia del modelo base.
- Capacidades especiales (vision, audio, thinking mode): no disponible; no se menciona ninguna modalidad adicional ni modo de pensamiento.

## Casos de uso

- Investigacion en lenguas de bajos recursos: serviria como punto de partida para estudiar tecnicas de continued pretraining con LoRA sobre kreyol, comparando el adaptador contra el modelo base en metricas de perplejidad sobre corpus de esa lengua. Requiere, eso si, construir la evaluacion desde cero, porque el autor no publica ninguna.
- Base para un fine-tuning instruido posterior: el adaptador puede fusionarse con Qwen3.5-9B-Base y usarse despues como inicializacion para un ajuste SFT o DPO en kreyol, aprovechando que el CPT previo puede haber desplazado la representacion interna hacia esa lengua.
- Reproduccion de pipelines con Unsloth: al estar entrenado con esa libreria, es un caso de estudio util para validar flujos de entrenamiento con LoRA acelerado y comparar el consumo de memoria reportado por el autor frente a alternativas como PEFT o Axolotl.
- Analisis de olvido catastrofico: permite medir cuanto ingles "pierde" el modelo base tras un CPT sobre una lengua de bajos recursos, ejecutando baterias de evaluacion antes y despues de fusionar el adaptador.
- Extraccion de representaciones para tareas de clasificacion en kreyol: si el CPT ha funcionado, las representaciones internas podrian servir para clasificacion de textos, analisis de sentimiento o etiquetado de secuencias con cabeceras ligeras, aunque esto no esta verificado por el autor.
- Docencia y formacion: como ejemplo practico de publicacion de un adaptador LoRA en HuggingFace, con todas sus carencias documentales, para ilustrar que metadatos minimos deberia incluir una model card reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni metricas de perplejidad), y la busqueda web realizada no devolvio resultados relevantes sobre este repositorio, solo enlaces genericos al buscador.

## Requisitos de hardware

Las cifras siguientes son estimaciones estandar para un modelo denso de ~9.000 millones de parametros, no datos medidos sobre este repositorio concreto (cuyo contexto y arquitectura exactos se desconocen):

- VRAM en fp16/bf16: en torno a 18 GB solo para los pesos, mas activaciones y cache KV. Requiere GPU de 24 GB en adelante o reparto en varias tarjetas.
- VRAM en int8: aproximadamente 9-10 GB de pesos, con overhead adicional segun longitud de contexto.
- VRAM en 4 bits (NF4, GPTQ o AWQ): aproximadamente 5-6 GB de pesos, mas cache KV.
- GPU recomendadas para precision completa: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en fp16 con contexto corto, y con holgura en cuantizacion de 4 bits; en 4 bits podria ejecutarse en tarjetas de 12 GB como la RTX 3060 12 GB o la RTX 4070, siempre que el contexto sea moderado.
- Opciones de despliegue: vLLM y TGI admiten modelos con adaptadores LoRA o el modelo fusionado; llama.cpp y Ollama requieren convertir el resultado a GGUF, lo que implica fusionar previamente el adaptador con el modelo base.
- Latencia y throughput: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado (ni benchmarks ni evaluaciones del autor), por lo que la comparacion se limita a metadatos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Caldev/qwen3_5_9B_kreyol_cpt_lora | ~9B (adaptador LoRA sobre Qwen3.5-9B-Base) | no disponible | apache-2.0 | HuggingFace; 0 descargas, 0 valoraciones | no disponible |
| unsloth/Qwen3.5-9B-Base | ~9B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace | no disponible |
| Llama 3.1 8B | 8B | 128.000 tokens | Llama 3.1 Community License | HuggingFace; ampliamente desplegado | ampliamente evaluado en benchmarks publicos |
| Gemma 2 9B | 9B | 8.192 tokens | Gemma Terms of Use | HuggingFace | ampliamente evaluado en benchmarks publicos |

La comparacion con Llama 3.1 8B y Gemma 2 9B se incluye unicamente como referencia de categoria (modelos densos de 8-9B); no existe base para afirmar que este adaptador alcance un rendimiento equiparable, dado que no hay ninguna evaluacion publicada.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no indica dataset, numero de tokens, hiperparametros del LoRA ni procedimiento de evaluacion, lo que impide reproducir o auditar el ajuste.
- Discrepancia de idioma: el identificador del repositorio menciona kreyol, pero la etiqueta declarada es unicamente "en". Cualquier uso en kreyol debe validarse de forma empirica antes de darlo por bueno.
- No es un modelo instruido: al derivar de un modelo base con continued pretraining, no cabe esperar seguimiento de instrucciones, formato de chat, tool calling ni comportamiento de agente.
- Riesgo elevado de alucinacion: un CPT sobre un corpus no documentado puede degradar el conocimiento factual del modelo base, especialmente si el corpus es reducido o de dominio restringido.
- Olvido catastrofico: es posible que el ajuste haya erosionado capacidades en ingles, el unico idioma declarado, sin que existan evaluaciones que lo cuantifiquen.
- Sin validacion comunitaria: cero descargas y cero valoraciones en el momento de la consulta, y ausencia total de referencias externas en la busqueda web.
- Fecha de publicacion inusual: el repositorio figura como creado el 2026-09-11, lo que conviene verificar antes de integrarlo en cualquier flujo.
- Licencia: el adaptador se publica bajo apache-2.0, lo que permite uso comercial, pero es imprescindible comprobar los terminos del modelo base unsloth/Qwen3.5-9B-Base, que no se detallan en la informacion disponible.
- Despliegue: al distribuirse solo como adaptador en safetensors, cualquier uso con llama.cpp, Ollama u otros runners basados en GGUF exige fusionar y convertir previamente los pesos.
- Sin garantias de produccion: no hay benchmarks, ni informes de sesgo, ni pruebas de robustez; no se recomienda su uso en sistemas en produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Caldev/qwen3_5_9B_kreyol_cpt_lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B-Base
- Unsloth (repositorio de la libreria de entrenamiento): https://github.com/unslothai/unsloth
- TRL (etiqueta declarada en el repositorio): https://huggingface.co/docs/trl
- Paper, blog o demo del autor: no disponible
- Resultados adicionales de la busqueda web: la busqueda no devolvio enlaces relevantes sobre este modelo, solo resultados genericos de servicios de Google sin relacion con el repositorio.
