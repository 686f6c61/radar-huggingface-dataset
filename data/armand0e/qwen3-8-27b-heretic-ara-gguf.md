# armand0e/Qwen3.8-27B-Heretic-ara-GGUF

## Resumen

El modelo **armand0e/Qwen3.8-27B-Heretic-ara-GGUF** es una version "decensored" (sin censura) del modelo Qwen/Qwen3.8-27B, creada mediante la herramienta **Heretic** v1.2.0 con el metodo **Arbitrary-Rank Ablation (ARA)**. Este enfoque elimina los mecanismos de rechazo y censura del modelo original mediante una ablacion de rango 3 aplicada a las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas 9 a 64, resuelta en forma cerrada en lugar de mediante descenso de gradiente. El resultado es un modelo que mantiene una divergencia KL de 0.0528 respecto al original y reduce la tasa de rechazos de 87/100 a 7/100 en prompts daninos.

La relevancia de este modelo radica en su proposito especifico: proporcionar una alternativa sin restricciones para casos de uso donde la censura del modelo base supone una limitacion, como la generacion creativa de contenido adulto, la investigacion academica sobre seguridad en IA o el analisis de comportamientos no deseados. El repositorio contiene los pesos en formato GGUF, lo que permite su ejecucion en CPU y GPU mediante llama.cpp y herramientas compatibles como LM Studio o Ollama. El modelo base tiene 27.320.697.856 parametros y soporta entrada multimodal (imagen-texto a texto), aunque los datos de contexto y licencia no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varios, segun repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una modificacion del Qwen3.8-27B original, un transformer denso multimodal que procesa entradas de imagen y texto. La intervencion de Heretic consiste en una **ablacion de rango 3** aplicada a las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas 9 a 64. A diferencia de metodos basados en gradiente descendente, esta ablacion se resuelve en forma cerrada, lo que reduce el coste computacional del proceso. Los parametros de la ablacion incluyen un `overcorrect_relative_weight` de 4.29079, un `neighbor_count` de 128, un `rank` de 3 y un `ridge` de 1.

No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La unica metrica de calidad publicada es la divergencia KL (0.0528) medida sobre prompts inofensivos de `mlabonne/harmless_alpaca`, y la tasa de rechazos (7/100 frente a 87/100) sobre `mlabonne/harmful_behaviors`. El modelo se distribuye en formato GGUF para su uso con llama.cpp.

## Capacidades

- Generacion de texto sin censura ni rechazos: el modelo responde a prompts que el original rechazaria, incluyendo contenido adulto, violencia ficcional o temas controvertidos.
- Procesamiento multimodal: al estar basado en Qwen3.8-27B, soporta entrada de imagenes junto con texto (pipeline `image-text-to-text`).
- Razonamiento y generacion de codigo: hereda las capacidades del modelo base, aunque no se han publicado benchmarks especificos que confirmen su rendimiento en estas tareas.
- Conversacion multi-turno: apto para dialogos extensos, aunque la longitud de contexto no esta documentada.
- Compatibilidad con herramientas de inferencia local: al estar en GGUF, funciona con llama.cpp, LM Studio, Ollama y otros ejecutores compatibles.

## Casos de uso

- **Creacion de ficcion para adultos**: escritores y creadores de contenido pueden generar narrativas eroticas o violentas sin restricciones, algo que los modelos censurados bloquean sistematicamente.
- **Roleplay sin filtros**: comunidades de juego de rol por texto pueden emplear el modelo para personajes y situaciones que requieren un lenguaje explicito o temas tabu.
- **Investigacion sobre seguridad en IA**: academicos y desarrolladores pueden estudiar el comportamiento de un modelo sin mecanismos de rechazo para entender como se manifiestan los sesgos o las alucinaciones cuando no hay barreras de seguridad.
- **Analisis de robustez**: probar la resistencia del modelo ante jailbreaks o prompts adversariales resulta mas sencillo cuando el modelo no tiene capas de rechazo que interfieran.
- **Generacion de dialogos para guiones**: guionistas que trabajan con personajes moralmente ambiguos o situaciones extremas pueden usar el modelo para explorar dialogos que otros modelos no generarian.
- **Educacion sobre etica en IA**: en entornos formativos, el modelo puede servir como ejemplo practico de los riesgos de eliminar la censura, mostrando respuestas potencialmente daninas que los alumnos deben aprender a identificar.

## Benchmarks y rendimiento

| Metrica | Modelo (Heretic-ara) | Original (Qwen3.8-27B) |
|---|---|---|
| Divergencia KL (sobre harmless_alpaca) | 0.0528 | 0 (por definicion) |
| Rechazos (sobre 100 prompts daninos) | 7/100 | 87/100 |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. Las unicas metricas proporcionadas son las anteriores, centradas en medir el grado de "de-censura" y la fidelidad respecto al modelo original.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la informacion proporcionada. Sin embargo, segun fuentes externas, el modelo base Qwen3.8-27B puede ejecutarse en 16 GB de RAM con cuantizaciones de Unsloth (desde 9 GB), lo que sugiere que esta version GGUF tiene requisitos similares.
- **GPU recomendadas**: no se especifican modelos concretos. Para cuantizaciones bajas (Q4_K_M o inferiores), una GPU con 8-12 GB de VRAM como la RTX 3080/4070 podria ser suficiente. Para cuantizaciones altas (Q8_0), se recomienda una GPU con 24 GB o mas, como la RTX 4090 o A100.
- **CPU**: al ser GGUF, puede ejecutarse en CPU con llama.cpp, aunque la velocidad sera significativamente menor que en GPU.
- **Opciones de despliegue**: llama.cpp, LM Studio, Ollama, text-generation-webui y cualquier frontend compatible con GGUF.
- **Latencia y throughput**: no disponibles. Dependen de la cuantizacion, el hardware y el numero de hilos de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| armand0e/Qwen3.8-27B-Heretic-ara-GGUF | 27.3B | no disponible | no disponible | GGUF | Sin censura, multimodal |
| Qwen/Qwen3.8-27B (original) | 27.3B | no disponible | no disponible | safetensors | Con censura, multimodal |
| drmcbride/Qwen3.8-27B-heretic-ara-Q8_0-GGUF | 27.3B | no disponible | no disponible | GGUF | Misma tecnica, cuantizacion Q8_0 |

No se dispone de informacion sobre otros modelos "decensored" comparables en la misma categoria de tamano. La comparativa se limita a variantes del mismo modelo base con distinta cuantizacion o metodo de generacion.

## Limitaciones y advertencias

- **Riesgo legal**: el modelo puede generar contenido ilegal o danino en ciertas jurisdicciones. Su uso en produccion o distribucion puede acarrear responsabilidades legales.
- **Sesgos y alucinaciones**: al eliminar la censura, el modelo puede producir respuestas ofensivas, incorrectas o peligrosas sin ningun filtro. No se han publicado evaluaciones de sesgo.
- **Licencia no disponible**: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribucion.
- **Falta de documentacion**: no se proporcionan datos sobre contexto, idiomas soportados ni rendimiento en tareas estandar, lo que dificulta su evaluacion objetiva.
- **Riesgo de mal uso**: la ausencia de rechazos facilita la generacion de contenido para fraudes, desinformacion o acoso. Se recomienda un uso responsable y etico.
- **Sin garantias de calidad**: al ser una modificacion no oficial, el modelo puede presentar degradaciones en tareas complejas respecto al original, aunque la divergencia KL publicada sugiere un impacto limitado.

## Enlaces

- [Modelo en HuggingFace (GGUF)](https://huggingface.co/armand0e/Qwen3.8-27B-Heretic-ara-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/armand0e/Qwen3.8-27B-Heretic-ara)
- [Qwen/Qwen3.8-27B original](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio de Heretic](https://github.com/p-e-w/heretic)
- [Pull request de ARA](https://github.com/p-e-w/heretic/pull/211)
- [Modelo similar de drmcbride](https://huggingface.co/drmcbride/Qwen3.8-27B-heretic-ara-Q8_0-GGUF)
- [Articulo sobre ejecucion local en 16 GB](https://pasqualepillitteri.it/en/news/11335/qwen3-8-27b-run-local-16gb-lm-studio-unsloth)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/heretic-org%2FQwen3.8-27B-heretic-ara,1gnpzhvwiWVhYFYskhwWI5)
