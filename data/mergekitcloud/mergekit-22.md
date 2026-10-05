# MergekitCloud/mergekit-22

## Resumen

MergekitCloud/mergekit-22 es un modelo de lenguaje resultante de la fusion por pesos de dos modelos de la familia Qwen2.5: Qwen/Qwen2.5-7B-Instruct (orientado a conversacion general) y Qwen/Qwen2.5-Coder-7B-Instruct (orientado a generacion de codigo). La fusion se ha realizado con la herramienta mergekit mediante el metodo SLERP (interpolacion esferica), no mediante entrenamiento adicional, por lo que el modelo no incorpora datos nuevos: solo recombina los pesos de sus dos antecesores.

El resultado es un modelo denso de 7.612.756.480 parametros (7,6 B) en formato safetensors con precision bfloat16, con un repositorio de 15,2 GB. Al heredar la arquitectura Qwen2ForCausalLM, mantiene la compatibilidad con el ecosistema transformers, text-generation-inference y los Inference Endpoints de Hugging Face, tal y como indican sus etiquetas.

Su relevancia practica es limitada pero concreta: los merges SLERP se usan habitualmente para intentar obtener un unico modelo que cubra simultaneamente conversacion y codigo, evitando mantener dos despliegues separados. En este caso, el repositorio no incluye tarjeta de evaluacion, no declara licencia ni idiomas, y acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que debe considerarse un artefacto experimental sin validacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (Qwen2ForCausalLM), heredada de los modelos base; el merge no modifica la topologia |
| Parametros totales | 7.612.756.480 (7,6 B) |
| Parametros activos | No aplica: modelo denso, no es Mixture of Experts |
| Longitud de contexto | No declarada en la ficha del merge. Los modelos base Qwen2.5-7B soportan 32.768 tokens nativos y hasta 131.072 con RoPE escalado (YaRN); este dato no esta verificado para el merge |
| Tipos de cuantizacion | No se publican pesos cuantizados. Al distribuirse en safetensors bfloat16, es convertible a GPTQ, AWQ, bitsandbytes (NF4/INT8) o GGUF (Q8_0, Q5_K_M, Q4_K_M) |
| Idiomas soportados | No disponible en la ficha del merge. Los modelos base declaran soporte multilingue (mas de 29 idiomas), pero no hay confirmacion para el resultado fusionado |
| Licencia | No disponible en el repositorio del merge. Los modelos base Qwen2.5-7B-Instruct y Qwen2.5-Coder-7B-Instruct se publican bajo Apache 2.0, condicion que conviene verificar antes de cualquier uso comercial |
| Formato de pesos | safetensors, dtype bfloat16 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es el producto de una fusion de pesos con mergekit usando SLERP (spherical linear interpolation), que interpola los tensores de los dos modelos base sobre una esfera unidad en lugar de hacer una media lineal, preservando mejor la norma de los vectores de pesos. La configuracion declarada es `base_model: Qwen/Qwen2.5-7B-Instruct`, con dos modelos de entrada (el propio Instruct y el Coder) y `tokenizer_source: base`, de modo que el tokenizador resultante es el de Qwen2.5-7B-Instruct (compartido en la practica con el Coder, ya que ambos usan el mismo vocabulario Qwen2.5).

El parametro `t` se define como una lista de cinco valores: `[0.10, 0.56, 0.75, 0.56, 0.10]`. En mergekit, una lista de factores se aplica por tramos de capas, de forma que la red se divide en cinco segmentos y cada uno recibe un coeficiente distinto de interpolacion hacia el segundo modelo. Interpretando la configuracion: las capas iniciales y finales quedan muy cerca de Qwen2.5-7B-Instruct (t = 0,10), mientras que los tramos centrales se desplazan hacia Qwen2.5-Coder-7B-Instruct (hasta t = 0,75). El objetivo tipico de este patron es conservar en las capas superficiales el comportamiento conversacional y de formato, y tomar de las capas intermedias la capacidad de codigo. No hay datos publicados sobre validacion de esta hipotesis en el repositorio.

No consta entrenamiento adicional, ajuste por RLHF, DPO ni calibracion posterior al merge. Las capacidades de instruccion y de codigo proceden exclusivamente de los dos modelos base, y cualquier degradacion introducida por la interpolacion de pesos queda sin documentar.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat, heredada de Qwen2.5-7B-Instruct (plantilla ChatML de Qwen).
- Generacion y autocompletado de codigo en multiples lenguajes, heredada de Qwen2.5-Coder-7B-Instruct.
- Razonamiento aritmetico y resolucion de problemas matematicos de complejidad media, segun las capacidades declaradas de los modelos base.
- Soporte de tool calling / function calling y de salida estructurada en JSON, funcionalidad presente en la familia Qwen2.5-Instruct.
- Capacidad de seguir instrucciones largas y mantener coherencia en ventanas de contexto extensas (hasta 32.768 tokens en los modelos base, sin verificar en el merge).
- Multilingue segun los modelos originales; el merge no documenta evaluacion por idioma.
- No se declara soporte de vision, audio ni modo "thinking" explicito: son modelos de texto unicamente.

## Casos de uso

- Asistente de codigo integrado en IDE: el modelo puede completar funciones, explicar fragmentos y proponer refactorizaciones, aprovechando la componente Coder en las capas centrales y el formato conversacional en las superficiales.
- Atencion al cliente automatizada: gestion de conversaciones multi-turno con contexto de hasta 32.768 tokens, suficiente para hilos largos con historial e informacion de producto adjunta.
- Generacion de pruebas unitarias y documentacion tecnica: a partir de un fichero fuente, producir tests o docstrings en un pipeline de CI/CD, con salida en formato estructurado.
- Agente con tool calling en tareas de automatizacion: encadenar llamadas a APIs o funciones internas (consulta de bases de datos, ejecucion de scripts) usando el soporte de function calling de la familia Qwen2.5.
- Prototipado rapido de aplicaciones de chat: al ser compatible con transformers, TGI y los Inference Endpoints, sirve como modelo de referencia para validar una interfaz conversacional antes de escalar a un modelo mayor.
- Traduccion tecnica y reescritura de textos, apoyandose en el caracter multilingue de los modelos base; requiere evaluacion previa del idioma destino, ya que el merge no documenta cobertura linguistica.
- Analisis de registros y resumen de incidencias: dado un contexto largo de logs, extraer patrones y resumir errores en texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MBPP ni de ningun otro conjunto, y la ficha del autor se limita a describir el metodo de fusion y la configuracion YAML. No se deben extrapolar los resultados publicados por Qwen para los modelos base, ya que la interpolacion de pesos puede alterar el rendimiento de forma no lineal y no medida.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 15,2 GB solo de pesos, mas overhead de runtime y cache KV; con contexto de 32.768 tokens y una GPU con 28 capas y 4 cabezas KV por capa (arquitectura Qwen2.5-7B), el cache KV en bfloat16 ronda 1,8 GB. Presupuesto realista: 18-22 GB en GPU.
- Cuantizacion: Q8_0 o INT8 en torno a 8 GB de pesos; Q5_K_M cerca de 5,5 GB; Q4_K_M alrededor de 4,7 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para servicio en bfloat16 con lotes moderados; una RTX 4090 o RTX 3090 de 24 GB permite bfloat16 con contexto reducido.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bfloat16 con contexto limitado, y en RTX 3060 12 GB, RTX 4070 12 GB o RTX 4060 Ti 16 GB unicamente con cuantizacion de 4-5 bits.
- Opciones de despliegue: transformers, vLLM, text-generation-inference (TGI) y Hugging Face Inference Endpoints, tal como indican las etiquetas del repositorio; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este merge en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-22 | 7,6 B | No declarado (los base, 32.768 tokens nativos) | Fusion SLERP de dos modelos Qwen2.5-7B | No disponible en el repositorio | 0 descargas, 0 likes; safetensors bfloat16 |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens nativos, 131.072 con YaRN | Modelo entrenado y ajustado por instrucciones | Apache 2.0 | Ampliamente desplegado, cuantizaciones oficiales y de terceros |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens nativos, 131.072 con YaRN | Modelo especializado en codigo, ajustado por instrucciones | Apache 2.0 | Ampliamente desplegado, con variantes GGUF y AWQ |
| Meta Llama 3.1 8B Instruct | 8,0 B | 131.072 tokens | Modelo denso ajustado por instrucciones | Licencia comunitaria Llama 3.1 | Ampliamente desplegado, con cuantizaciones oficiales |

La comparacion de rendimiento no puede completarse: no hay benchmarks publicados para mergekit-22 y, por tanto, no es posible contrastarlo con los modelos base ni con alternativas de tamano similar.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparativas, ni pruebas de regresion publicadas. Cualquier uso en produccion exige una evaluacion propia previa.
- Riesgo de degradacion por el merge: la interpolacion de pesos puede degradar capacidades que los modelos base tenian, especialmente en tareas especializadas de codigo o en el seguimiento estricto de instrucciones. El patron de `t` por tramos no garantiza que se conserven ambas aptitudes.
- Licencia sin declarar: el repositorio no especifica licencia. Aunque los modelos base son Apache 2.0, la ausencia de declaracion explicita en el artefacto fusionado introduce incertidumbre juridica para uso comercial.
- Idiomas no documentados: el comportamiento multilingue no esta verificado; puede haber perdida de calidad en idiomas distintos del ingles y el chino respecto a los modelos originales.
- Alucinacion: al tratarse de un modelo de 7,6 B sin ajuste adicional tras el merge, mantiene el riesgo habitual de inventar datos, citas o APIs inexistentes, especialmente en tareas de codigo con librerias poco frecuentes.
- Contexto no confirmado: aunque los modelos base soportan 32.768 tokens, el merge no documenta la configuracion de RoPE ni si el escalado para contextos largos sigue siendo valido.
- Trazabilidad y mantenimiento: el repositorio no indica version, autor responsable ni fecha de validacion; el creador es una organizacion ("MergekitCloud") que parece generar merges de forma automatica, sin documentacion asociada.
- Sin cuantizaciones oficiales: el despliegue eficiente obliga a generar las cuantizaciones por cuenta propia, con el riesgo de variabilidad entre implementaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MergekitCloud/mergekit-22
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Herramienta de fusion mergekit: https://github.com/cg123/mergekit
- Documentacion del metodo SLERP: https://en.wikipedia.org/wiki/Slerp
