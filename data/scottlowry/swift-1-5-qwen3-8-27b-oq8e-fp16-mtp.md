# scottlowry/Swift-1.5-Qwen3.8-27b-oQ8e-fp16-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ8e-fp16-mtp es una version cuantizada del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario scottlowry en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantizacion: el autor ha aplicado la herramienta oQ (oMLX v0.7.0) para generar pesos en formato MLX safetensors con cuantizacion de precision mixta de 8 bits. El modelo resultante conserva los 27.781.427.952 parametros del modelo base (aproximadamente 27,8 mil millones) y ocupa 30,9 GB en el repositorio.

Por el identificador `qwen3_5` y el nombre del base model, se deduce que la arquitectura subyacente es de la familia Qwen3, aunque la model card no aporta informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion. El proposito de esta publicacion es ofrecer una version optimizada para inference en hardware Apple Silicon mediante el framework MLX, con un tamano de grupo de 64 y 8 bits, lo que reduce el peso respecto a los pesos originales manteniendo una calidad de cuantizacion relativamente alta.

La relevancia de esta ficha es limitada y practica: se trata de un derivado no oficial, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de evaluacion publicados. Es relevante unicamente para desarrolladores que trabajen en el ecosistema MLX (Mac con chip M-series) y quieran probar el modelo base ukisai/Swift-1.5-Qwen3.8-27b en un formato ya cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun tag del repositorio); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64, precision mixta (oQ / oMLX v0.7.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. El tag `qwen3_5` y el nombre del modelo base (Qwen3.8-27b) apuntan a un transformer de la familia Qwen3, pero la model card no confirma detalles como el tipo de atencion, el uso de MoE, el numero de capas ni la dimension oculta. El componente `mtp` del nombre no esta documentado en la informacion proporcionada, por lo que no se puede afirmar que corresponda a Multi-Token Prediction ni a ninguna otra tecnica concreta.

Respecto al entrenamiento, esta publicacion no ha entrenado ningun modelo: se limita a cuantizar los pesos del modelo base ukisai/Swift-1.5-Qwen3.8-27b. Segun la model card, la cuantizacion se realizo con oQ (oMLX v0.7.0) en modo de precision mixta, con 8 bits y tamano de grupo 64. No hay datos sobre el dataset de entrenamiento original, el numero de tokens, la composicion del corpus ni si hubo RLHF, DPO u otra fase de alineacion. La denominacion `oQ8e-fp16` sugiere una combinacion de cuantizacion de 8 bits con algunas capas en fp16, practica habitual en esquemas de precision mixta, pero esto no se detalla en la documentacion disponible.

## Capacidades

No se han documentado capacidades especificas en la informacion disponible. Al tratarse de una cuantizacion de un modelo base sin model card propia de capacidades, no es posible confirmar ni desmentir las siguientes funciones sin consultar la ficha del modelo original ukisai/Swift-1.5-Qwen3.8-27b:

- Generacion de texto: no disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

Dado que no hay informacion verificada sobre capacidades, idiomas, contexto ni licencia, los casos de uso solo pueden plantearse como escenarios genericos de prueba, no como aplicaciones en produccion:

- Pruebas locales en Apple Silicon: el formato MLX safetensors esta disenado para ejecutarse de forma nativa en chips M-series, por lo que el caso de uso principal es experimentar con el modelo en un Mac sin depender de CUDA.
- Evaluacion de calidad de cuantizacion: un investigador puede comparar las salidas de esta version de 8 bits frente a los pesos originales para medir la degradacion introducida por oQ.
- Prototipado rapido de aplicaciones de texto: si el modelo base hereda las capacidades de la familia Qwen3, podria usarse para generar borradores, resumir o responder preguntas, siempre tras validar su comportamiento real.
- Fine-tuning sobre la base cuantizada: util solo en flujos que soporten adaptadores sobre MLX; requiere verificar compatibilidad con la herramienta oMLX.
- Despliegue en entornos de bajos recursos: al reducir el peso respecto a fp16, puede encajar en equipos con memoria unificada limitada dentro del ecosistema Apple.
- Comparativas de rendimiento en hardware no-CUDA: permite medir throughput y latencia de un modelo de ~27,8 B en MLX frente a alternativas en llama.cpp u otros runtimes.

No se recomienda ningun uso en produccion sin antes resolver la ausencia de licencia explicita y de datos de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 30,9 GB en disco para pesos de 8 bits. La memoria necesaria en tiempo de ejecucion sera igual o superior a esa cifra mas el overhead del runtime.
- GPU compatibles: dado que el formato es MLX, el destino natural son los chips Apple Silicon (familias M1, M2, M3 y M4). No se indica compatibilidad con CUDA (A100, H100, RTX 4090) sin conversion previa a otro formato.
- Consumer GPU: cabe en equipos Apple con memoria unificada de 32 GB o mas, aunque con margen ajustado; 36 GB o mas ofrece holgura. No hay datos sobre su encaje en GPUs de consumo NVIDIA.
- Opciones de despliegue: la libreria declarada es MLX (y potencialmente mlx-lm / oMLX). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El unico punto de referencia directo es el propio modelo base:

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| scottlowry/Swift-1.5-Qwen3.8-27b-oQ8e-fp16-mtp | 27,8 B | 8 bits, group 64 | MLX safetensors | no disponible | Cuantizacion no oficial, 0 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible | sin cuantizar (presumiblemente fp16/bf16) | no disponible | no disponible | Modelo base del anterior |
| Otras alternativas de ~27 B | no disponible | no disponible | no disponible | no disponible | Sin datos para comparar |

No se conocen modelos comparables adicionales dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia del repositorio ni la del modelo base, lo que impide determinar si el uso comercial esta permitido.
- Modelo derivado no oficial: se trata de una cuantizacion de terceros, no avalada necesariamente por el autor original ukisai.
- Sin informacion de idiomas: no se puede confirmar que idiomas soporta ni su calidad en castellano.
- Sin resultados de evaluacion: no hay benchmarks que permitan estimar fiabilidad, sesgos o riesgo de alucinacion.
- Riesgo de alucinacion: desconocido, pero inherente a cualquier modelo generativo sin evaluacion publicada.
- Limitaciones de contexto: la longitud de contexto es no disponible, por lo que no puede planificarse el uso en tareas de contexto largo.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso ni de validacion por la comunidad.
- Ambiguedad en el nombre: el sufijo `mtp` y la etiqueta `qwen3_5` no estan documentados, lo que dificulta conocer exactamente que variante del modelo base se ha cuantizado.
- Compatibilidad restringida: el formato MLX safetensors limita su uso al ecosistema Apple Silicon y a las herramientas MLX.
- Degradacion por cuantizacion: la cuantizacion de 8 bits puede degradar ligeramente la calidad frente a los pesos originales, aunque no se han publicado mediciones al respecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/scottlowry/Swift-1.5-Qwen3.8-27b-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Herramienta oQ (oMLX): https://github.com/jundot/omlx

No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
