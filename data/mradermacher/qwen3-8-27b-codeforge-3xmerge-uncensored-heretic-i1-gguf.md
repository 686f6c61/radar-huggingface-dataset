# mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic es una cuantizacion GGUF (formato i1, con matrices de importancia) realizada por mradermacher sobre el merge de modelos publicado por xtools-at. El modelo base es un merge triple (3xMerge) construido a partir de la familia Qwen3.8, orientado a generacion de codigo, razonamiento y uso agentico con tool calling. La variante "heretic/uncensored/abliterated" indica que se ha aplicado una tecnica de eliminacion de rechazos (abliteration) para reducir las negativas del modelo ante peticiones consideradas sensibles.

El modelo cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) en formato safetensors, lo que lo situa en la gama de modelos densos de gran tamano que requieren hardware de gama alta para inferencia en precision completa, pero que resultan manejables en cuantizaciones de 4 bits sobre GPU de consumo con VRAM suficiente. La licencia declarada es Apache 2.0.

Este repositorio concreto contiene exclusivamente los pesos cuantizados en GGUF (tanto estaticos como con imatrix), no el modelo original en safetensors. Esta pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, koboldcpp), y es relevante para desarrolladores que necesitan desplegar localmente un modelo de codigo y razonamiento de gran tamano sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), segun tags del modelo base |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | en, zh (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de la pertenencia a la familia Qwen3.8 y la indicacion de que se trata de un merge de tres modelos (3xMerge). Los tags incluyen "distillation", "reasoning", "efficient-thinking", "agentic", "tool-use" e "instruction-following", lo que sugiere que el merge combina checkpoints afinados para estas capacidades, posiblemente con datos de destilacion. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion principal de este repositorio es la cuantizacion: mradermacher ha generado cuantizaciones i1 (con matrices de importancia, imatrix) que mejoran la calidad respecto a las cuantizaciones estaticas equivalentes en tamano. El proceso de abliteration ("heretic", "uncensored", "decensored") se aplico en el modelo base por parte de xtools-at, no en esta cuantizacion. La model card incluye referencias a la guia de TheBloke para el uso de GGUF y a una comparativa de perplejidad de ikawrakow sobre tipos de cuantizacion.

## Capacidades

- Generacion de codigo y code-generation, segun los tags del modelo.
- Razonamiento (reasoning) y modo de pensamiento eficiente (efficient-thinking).
- Uso agentico y tool calling / function calling.
- Seguimiento de instrucciones (instruction-following).
- Conversacion multi-turno (tag "conversational").
- Capacidades multilingues limitadas a en y zh segun la model card.
- Variante sin rechazos (abliterated/uncensored), que responde a peticiones que el modelo original rechazaria.
- No se menciona soporte de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD o asistentes de IDE para autocompletar, refactorizar y generar tests, apoyandose en su entrenamiento especifico para codigo y su soporte de tool calling.
- Agentes autonomos de desarrollo: con capacidad agentica y tool-use, puede orquestar llamadas a APIs, ejecutar comandos y encadenar pasos de razonamiento multi-step en tareas de ingenieria.
- Razonamiento asistido en entornos locales: al disponer de cuantizaciones de 4 bits (i1-Q4_K_M, 16,9 GB), puede desplegarse en estaciones de trabajo con GPU de consumo para tareas de analisis y resolucion de problemas sin enviar datos a la nube.
- Atencion al cliente automatizada: el tag "conversational" y el soporte de instrucciones permiten construir asistentes multi-turno; la longitud de contexto no esta documentada, por lo que debe validarse empiricamente antes de production.
- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar el comportamiento de modelos sin rechazos, util para analisis de sesgos, robustez y evaluacion de salvaguardas.
- Despliegue en entornos con requisitos de privacidad: al ser GGUF y ejecutable con llama.cpp/Ollama, permite inferencia totalmente local en ingles y chino, evitando dependencias de servicios externos.
- Prototipado rapido de herramientas de codigo: las cuantizaciones Q3 y Q4 permiten iterar en portatiles con GPU de 12-16 GB antes de escalar a cuantizaciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia completa (FP16): aproximadamente 55 GB solo para pesos, mas overhead de contexto; requiere GPU de 80 GB (A100/H100) o multi-GPU.
- Cuantizacion i1-Q4_K_M (16,9 GB): cabe en GPU de 24 GB (RTX 4090, A6000) con contexto moderado; en 16 GB (RTX 4080, 4060 Ti 16 GB) requiere offload parcial a RAM.
- Cuantizacion i1-Q5_K_M (19,6 GB) e i1-Q6_K (22,5 GB): recomendables en GPU de 24 GB o superiores.
- Cuantizaciones i1-Q2_K (11,0 GB) e i1-IQ3_S (12,7 GB): viables en GPU de 12-16 GB, con perdida de calidad apreciable en la de 2 bits.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; no se recomienda vLLM/TGI para este repositorio concreto, que solo contiene GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (i1-GGUF) | 27,3 B | no disponible | Apache 2.0 | GGUF | Merge triple, abliterated, cuantizado con imatrix |
| Modelo base xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic | 27,3 B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo merge |
| mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base |
| Otros modelos de la familia Qwen3.8 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria; los datos de benchmarks no estan publicados.

## Limitaciones y advertencias

- La variante abliterated/uncensored elimina los rechazos del modelo original; esto implica que puede generar contenido sensible, ofensivo o inseguro sin filtros, lo que exige salvaguardas externas en produccion.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas soportados limitados a ingles y chino segun la model card; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada; debe verificarse antes de disenar aplicaciones que dependan de ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es un merge comunitario sin garantias de procedencia de todos los datos de entrenamiento; conviene revisar las condiciones del modelo base y de sus componentes.
- Al ser una cuantizacion, existe degradacion de calidad respecto al modelo en safetensors, especialmente en i1-Q2_K e i1-Q3_K_S; se recomienda i1-Q4_K_M o superior para uso en produccion.
- El repositorio solo contiene GGUF; no es compatible directamente con pipelines que esperan safetensors (transformers/vLLM) sin convertir o usar el modelo base.
- No hay datos publicados de benchmarks, por lo que las afirmaciones de calidad del merge no pueden validarse de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
