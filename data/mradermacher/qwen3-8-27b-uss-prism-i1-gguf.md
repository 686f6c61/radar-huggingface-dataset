# mradermacher/Qwen3.8-27B-USS-Prism-i1-GGUF

## Resumen

Qwen3.8-27B-USS-Prism-i1-GGUF es la versión cuantizada en formato GGUF del modelo nightmedia/Qwen3.8-27B-USS-Prism, un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) construido sobre la familia Qwen3.5/Qwen3.6. El trabajo de cuantización lo realiza mradermacher, un actor habitual en el ecosistema GGUF conocido por generar cuantizaciones con imatrix (importance matrix) para modelos de gran tamano. La relevancia de esta publicación radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 2 a 4 bits, con tamanos de archivo que van de 11 GB a 15,9 GB.

El modelo base es un fine-tuning (SFT con LoRA) orientado a razonamiento con cadena de pensamiento larga (long-cot), codigo, matematicas, STEM y escritura creativa de ficcion. Segun los tags del autor, incorpora tecnicas de destilacion (etiquetadas como "claude-distillation" y "claude4.6") y tecnicas de merge (mergekit). La model card declara soporte de contexto de 256k y hasta 1M de tokens, aunque esta informacion procede unicamente de los tags y no esta verificada en la documentacion tecnica disponible.

Esta ficha describe la version cuantizada i1-GGUF, que incluye cuantizaciones ponderadas con imatrix. El repositorio tiene 39,5 GB y esta publicado bajo licencia Apache 2.0. En el momento de la consulta el modelo no registra descargas ni likes, lo que sugiere una publicacion muy reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5/Qwen3.6, segun tags); detalles de atencion no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256k y 1M segun tags del autor; no verificado en documentacion tecnica |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (en este repo); el repo estatico incluye Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags indican que pertenece a la familia Qwen3.5/Qwen3.6 (etiquetas qwen3_5, qwen3_6, Qwen3.6), lo que implica una arquitectura transformer decoder-only, pero no se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones. El tamano de 27,3B parametros sugiere un modelo denso, ya que no se declaran parametros activos ni estructura MoE.

En cuanto al entrenamiento, los tags apuntan a un proceso de SFT (supervised fine-tuning) con LoRA y a tecnicas de merge mediante mergekit, ademas de destilacion etiquetada como "claude-distillation" y "claude4.6". Tambien se mencionan "polaris" y "polaris-alpha" como identificadores de variantes o proyectos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. La model card del repositorio cuantizado no aporta estos detalles; unicamente remite al modelo base nightmedia/Qwen3.8-27B-USS-Prism.

## Capacidades

- Generacion de texto conversacional e instruccional (instruction-tuned, conversational).
- Razonamiento con cadena de pensamiento larga (long-cot, chain-of-thought, reasoning).
- Codigo y tareas de programacion (tag coding).
- Matematicas y STEM (tags math, stem).
- Escritura creativa y de ficcion: generacion de tramas, subtramas, escenas, continuacion de escenas, storytelling y generacion de prosa vivida (vivid prosing, vivid writing, fiction writing, plot generation, sub-plot generation, scene continue).
- Roleplaying (tag roleplaying).
- Capacidades multilingues en ingles, chino, japones y espanol.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el tag reasoning y long-cot sugieren capacidad de razonamiento extendido.
- Vision: la model card del cuantizador indica "This is a vision model" y remite a los archivos mmproj del repositorio estatico, por lo que se infiere soporte multimodal, aunque no se detalla en la informacion tecnica del modelo base.
- Modo thinking explicito: no confirmado en la documentacion disponible.

## Casos de uso

- Asistencia a la escritura de ficcion: el modelo esta afinado especificamente para generacion de tramas, subtramas, continuacion de escenas y prosa vivida, lo que lo hace adecuado para herramientas de escritura asistida, generacion de borradores de novelas y desarrollo de guiones. Su contexto declarado de 256k permite mantener coherencia en manuscritos largos.
- Razonamiento y resolucion de problemas STEM: con entrenamiento en long-cot y matematicas, puede emplearse en asistentes de estudio, tutoria tecnica o generacion de explicaciones paso a paso para problemas cientificos.
- Generacion de codigo y revisión: el tag coding sugiere utilidad en autocompletado, explicacion de fragmentos de codigo y generacion de tests; su integracion en pipelines requeriria validar el soporte real de tool calling, no confirmado.
- Roleplaying y agentes conversacionales: el tag roleplaying y la ventana de contexto larga permiten construir personajes persistentes o asistentes con memoria extendida de la conversacion.
- Procesamiento multilingue en entornos hispanohablantes: al declarar soporte de espanol, puede usarse para atencion al cliente, resumen y traduccion entre en, zh, ja y es, aunque el rendimiento por idioma no esta documentado.
- Analisis de documentos largos: si se confirma el contexto de 256k/1M, seria viable para resumen y extraccion de informacion en informes extensos, contratos o expedientes, ejecutandose localmente con cuantizaciones Q4_K_S (15,9 GB).
- Despliegue en hardware de consumo: las cuantizaciones i1-Q2_K (11 GB) e i1-IQ3_M (12,9 GB) permiten ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM, habilitando prototipado local sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - i1-Q2_K: ~11 GB de pesos; se recomienda al menos 12-14 GB de VRAM para contexto moderado.
  - i1-IQ3_M: ~12,9 GB de pesos; se recomienda 14-16 GB de VRAM.
  - i1-Q4_K_S: ~15,9 GB de pesos; se recomienda 18-24 GB de VRAM.
- GPU recomendadas: para Q4_K_S, RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB. Para Q2_K e IQ3_M, tarjetas de 12-16 GB como RTX 4070 Ti Super, RTX 4080 o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: si, en las cuantizaciones Q2_K e IQ3_M en GPUs de 12-16 GB; Q4_K_S requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. vLLM y TGI no son el formato nativo de este repo (GGUF), aunque existen rutas de conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del hardware, la cuantizacion y la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-USS-Prism-i1-GGUF (este) | 27,3B | 256k/1M (segun tags) | Apache 2.0 | GGUF | Fine-tuning con long-cot, ficcion y codigo; cuantizado con imatrix |
| Modelo base nightmedia/Qwen3.8-27B-USS-Prism | 27,3B | 256k/1M (segun tags) | Apache 2.0 | safetensors/bf16 | Version sin cuantizar del mismo modelo |
| Version estatica mradermacher/Qwen3.8-27B-USS-Prism-GGUF | 27,3B | idem | Apache 2.0 | GGUF | Cuantizaciones estaticas (sin imatrix) y archivos mmproj |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real frente a modelos comparables es desconocido.
- La model card del cuantizador no documenta sesgos conocidos; al ser un fine-tuning sobre Qwen, es probable que herede sesgos del modelo base, pero no hay evidencia concreta en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos; no cuantificado para este modelo.
- El contexto declarado de 256k/1M procede unicamente de tags y no esta verificado en documentacion tecnica; el contexto efectivo puede ser menor.
- El soporte de tool calling, function calling y modo thinking no esta confirmado.
- La afirmacion de que es un modelo de vision procede de la model card del cuantizador y remite a archivos mmproj del repo estatico; no se detalla la arquitectura multimodal.
- Los tags incluyen etiquetas de destilacion de Claude (claude4.6, claude-distillation); conviene revisar las condiciones de uso y las implicaciones legales de modelos derivados de destilacion antes de un despliegue comercial.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base y los datos de destilacion no impongan restricciones adicionales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: es una publicacion muy reciente o de nicho, sin validacion comunitaria.
- Las cuantizaciones de 2 bits (Q2_K) degradan la calidad; el propio autor recomienda IQ3_XXS frente a Q2_K.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-USS-Prism-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-USS-Prism
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-USS-Prism-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-USS-Prism-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
