# orcarouter/Qwen3.8-Flash-Next-Uncensored-MLX

## Resumen

Qwen3.8-Flash-Next-Uncensored-MLX es una version "abliterated" (sin censura) y cuantizada a 4 bits en formato MLX del modelo Qwen3.8-Flash-Next, publicado por el usuario orcarouter. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura MoE (mezcla de expertos) y capacidad de razonamiento, function calling y decodificacion especulativa mediante MTP (multi-token prediction). El modelo base procede de Qwen y esta publicado bajo licencia Apache 2.0, con acceso restringido en Hugging Face.

La relevancia de esta variante es doble: por un lado, ofrece una version sin los filtros de rechazo del modelo original, orientada explicitamente a red-teaming y pruebas de seguridad (etiquetas ai-red-team y red-teaming); por otro, su cuantizacion MLX en 4 bits la hace ejecutable en hardware Apple Silicon, algo poco habitual en un modelo de 177.392 millones de parametros totales. El repositorio ocupa 621,7 GB, lo que refleja la presencia de multiples artefactos ademas de los pesos principales.

El modelo solo declara soporte para ingles y chino, y su uso comercial esta permitido por la licencia Apache 2.0, aunque el acceso requiere aceptar las condiciones del repositorio en Hugging Face. No se han publicado en la informacion disponible datos sobre el numero de parametros activos ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con capacidades de vision-lenguaje; tags qwen4_exp, moe, mtp |
| Parametros totales | 177.392.830.611 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); el repositorio incluye safetensors y artefactos MLX |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, MLX (4-bit) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es Qwen/Qwen3.8-Flash-Next, un transformer de tipo MoE con soporte multimodal (image-text-to-text), razonamiento explicito y function calling. Los tags incluyen "mtp", lo que apunta a multi-token prediction, una tecnica de decodificacion especulativa que permite proponer varios tokens por paso y acelerar la inferencia. El tag "qwen4_exp" sugiere una variante experimental de la familia Qwen4.

Esta version concreta es una cuantizacion a 4 bits en formato MLX del modelo base, seguida de un proceso de "abliteration" que elimina o atenua los mecanismos de rechazo aprendidos durante el alineamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. Tampoco se detalla la metodologia exacta de abliteration empleada por orcarouter.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (reasoning) segun los tags del repositorio.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text): descripcion de imagenes, VQA y tareas que combinan entrada visual y textual.
- Generacion de codigo y matematicas, capacidades habituales en la familia Qwen, aunque no se detallan resultados concretos.
- Function calling / tool calling, segun el tag "function-calling".
- Soporte para flujos de agentes y razonamiento multi-paso.
- Capacidades multilingues limitadas a ingles y chino segun la ficha del repositorio.
- Comportamiento sin censura (abliterated), orientado a pruebas de seguridad y red-teaming.
- Compatibilidad con endpoints (tag "endpoints_compatible") y ejecucion en Apple Silicon mediante MLX.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo, al estar abliterated, permite generar respuestas que el modelo original rechazaria, lo que lo hace util para construir conjuntos de pruebas adversarias y medir la robustez de filtros y clasificadores de seguridad en pipelines propios.
- Investigacion sobre alineamiento y censura: comparar las respuestas del modelo abliterated con las del Qwen3.8-Flash-Next original permite estudiar que comportamientos se ven afectados por el alineamiento y como se distribuyen las representaciones de rechazo.
- Prototipado local en Apple Silicon: la cuantizacion MLX 4-bit permite ejecutar un modelo de gran tamano en equipos Mac con memoria unificada, adecuado para experimentos de vision-lenguaje sin depender de GPUs dedicadas.
- Asistentes multimodales internos: transcripcion y analisis de capturas, diagramas o documentos escaneados combinados con instrucciones textuales, en entornos controlados donde el contenido no requiere filtros de rechazo.
- Automatizacion con tool calling: integracion en agentes que consultan APIs o bases de datos mediante function calling, con el modelo como planificador de pasos intermedios.
- Generacion de codigo en flujos de desarrollo: asistencia en tareas de programacion y explicacion de fragmentos de codigo, con la ventaja de ejecucion local y sin coste por token.
- Analisis de contenido en ingles y chino: clasificacion, resumen y extraccion de informacion de textos e imagenes en esos dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: con 177.392 millones de parametros totales, una cuantizacion a 4 bits requiere del orden de 90-100 GB solo para los pesos, mas overhead de contexto y cache KV; el dato exacto no esta disponible en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, serian necesarios aceleradores con 80 GB o mas de memoria (A100/H100) o configuraciones multi-GPU.
- Consumer GPU: no cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) en la cuantizacion indicada.
- Apple Silicon: la variante MLX 4-bit esta pensada para Macs con memoria unificada elevada (configuraciones de gama alta con 128 GB o mas), aunque no se especifica el minimo exacto.
- Opciones de despliegue: MLX para Apple Silicon; al incluir safetensors, es compatible con frameworks estandar de transformers. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-MLX (este) | 177.392 M | no disponible | Apache 2.0 | Gated en HF, 4-bit MLX | Abliterated, vision-lenguaje, MoE |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | Apache 2.0 (segun modelo derivado) | HF | Version original con alineamiento |
| Otros modelos de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas concretas; los datos de benchmarks y de modelos comparables no estan disponibles.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo, por lo que el modelo puede producir contenido danino, ilegal o inseguro; no es adecuado para aplicaciones de cara al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion, especialmente en tareas de razonamiento y en contenido multimodal; no se han publicado evaluaciones que lo cuantifiquen.
- Soporte limitado a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La cuantizacion a 4 bits introduce perdida de calidad respecto al modelo original, no cuantificada en la informacion disponible.
- El repositorio esta restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la distribucion automatizada.
- El modelo base es de agosto de 2026 y esta etiquetado como experimental (qwen4_exp); puede presentar inestabilidades propias de una version no final.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated puede conllevar riesgos legales y reputacionales segun la jurisdiccion y el caso de uso.
- No se dispone de informacion sobre sesgos especificos medidos, ni sobre el impacto del proceso de abliteration en las capacidades generales del modelo.

## Enlaces

- [Hugging Face: orcarouter/Qwen3.8-Flash-Next-Uncensored-MLX](https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-MLX)
- [OrcaRouter (sitio principal)](https://www.orcarouter.ai/)
- [OrcaRouter Playground](https://www.orcarouter.ai/playground)
- [Documentacion de OrcaRouter](https://docs.orcarouter.ai/introduction)
