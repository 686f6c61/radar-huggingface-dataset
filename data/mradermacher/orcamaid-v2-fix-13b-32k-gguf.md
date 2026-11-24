# mradermacher/OrcaMaid-v2-FIX-13b-32k-GGUF

## Resumen

OrcaMaid-v2-FIX-13b-32k-GGUF es la distribucion en formato GGUF del modelo ddh0/OrcaMaid-v2-FIX-13b-32k, un merge de la comunidad construido sobre la base de Microsoft Orca-2-13b. El modelo original deriva de la familia Orca 2 de Microsoft Research, disenada para razonamiento y tareas de instrucciones complejas, y ha sido fusionado con otros modelos (de ahi el nombre "Maid") para reforzar comportamiento conversacional y de asistencia. Este repositorio concreto lo publica mradermacher, un cuantizador habitual de la comunidad de Hugging Face, y ofrece unicamente los pesos cuantizados estaticos, no el modelo en precision completa.

El modelo cuenta con 13.015.864.320 parametros (aproximadamente 13B) y una ventana de contexto extendida a 32k tokens, segun indica el nombre del modelo base. Esta pensado para despliegue local en hardware de consumo mediante llama.cpp y derivados, ya que las cuantizaciones van desde Q2_K (5,0 GB) hasta Q8_0 (13,9 GB). Es relevante para quienes necesitan un modelo de 13B con contexto largo y licencia de investigacion de Microsoft, ejecutable en una sola GPU consumer o incluso en CPU con suficiente RAM.

La licencia es la Microsoft Research License (no comercial en la practica para muchos usos), lo que limita su adopcion en produccion comercial. El modelo esta etiquetado solo en ingles y no dispone de model card tecnica detallada mas alla de la informacion de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Orca-2-13b, sin confirmar detalles del merge) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun nombre del modelo base, "32k") |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | microsoft-research-license (Microsoft Research License) |
| Formato de pesos | GGUF (cuantizaciones estaticas) |
| Modelo base | ddh0/OrcaMaid-v2-FIX-13b-32k |
| Tamano del repositorio | 88,8 GB |
| Descargas | 395 |
| Libreria | transformers (etiquetado), uso real via llama.cpp |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento en la informacion proporcionada. El modelo base es un merge de la comunidad (ddh0/OrcaMaid-v2-FIX-13b-32k) que parte de Microsoft Orca-2-13b, un transformer decoder-only de 13B parametros entrenado por Microsoft Research con tecnicas de destilacion de razonamiento a partir de modelos mayores. El sufijo "Maid" indica una fusion con otro modelo orientado a asistencia conversacional, y "FIX" sugiere una correccion o re-publicacion del merge original.

El contexto de 32k se infiere del nombre del modelo base, pero no hay documentacion tecnica en este repositorio que confirme el metodo de extension de contexto (RoPE scaling, por ejemplo) ni los datos de entrenamiento empleados en el merge. No se ha publicado informacion sobre RLHF, DPO ni composicion del dataset en la informacion disponible.

## Capacidades

- Generacion de texto y respuesta a instrucciones en ingles, heredadas de la familia Orca 2.
- Razonamiento de varios pasos y resolucion de problemas, segun el diseno original de Orca 2.
- Ventana de contexto de 32k tokens, adecuada para documentos largos o conversaciones extensas.
- Capacidad conversacional reforzada por el componente "Maid" del merge (asistencia, tono dialogante).
- Soporte de cuantizacion GGUF para inferencia local en CPU y GPU.
- No se ha confirmado soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Asistencia conversacional local: el modelo puede mantener dialogos multi-turno en ingles con contexto de hasta 32k tokens, ejecutandose en una GPU consumer con cuantizacion Q4_K_M (8,0 GB), lo que lo hace util para prototipos de chatbots sin depender de la nube.
- Procesamiento de documentos largos: con 32k de contexto puede resumir o responder preguntas sobre articulos, informes o transcripciones extensas, siempre que el contenido este en ingles.
- Razonamiento y resolucion de problemas en entornos de investigacion: adecuado para experimentos academicos sobre destilacion de razonamiento y merges de modelos, dado su origen en Orca 2.
- Despliegue en CPU con llama.cpp: las cuantizaciones Q2_K (5,0 GB) y Q3_K_S (5,8 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, con RAM suficiente, para tareas de generacion de texto sin requisitos de latencia estrictos.
- Evaluacion comparativa de merges: util para investigadores que quieran medir el efecto de fusiones comunitarias sobre la base Orca-2-13b frente al modelo original.
- Generacion de texto creativo y redaccion en ingles: el componente conversacional del merge puede emplearse para borradores, reescritura y variaciones de texto en un entorno local y privado.
- Fine-tuning ligero sobre GGUF: no es el flujo habitual, pero puede servir como referencia para experimentos de adaptacion con LoRA sobre el modelo base en precision completa (no incluido en este repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~5,0 GB
  - Q3_K_S: ~5,8 GB
  - Q3_K_M: ~6,4 GB
  - Q3_K_L: ~7,0 GB
  - IQ4_XS: ~7,1 GB
  - Q4_K_S: ~7,5 GB
  - Q4_K_M: ~8,0 GB
  - Q5_K_S: ~9,1 GB
  - Q5_K_M: ~9,3 GB
  - Q6_K: ~10,8 GB
  - Q8_0: ~13,9 GB
- GPU recomendadas: con Q4_K_M (8,0 GB) cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; con Q8_0 (13,9 GB) requiere al menos 16 GB de VRAM (RTX 4080/4090, A100, H100). Para contexto de 32k hay que sumar la memoria del KV cache, que puede anadir varios GB segun la implementacion.
- Cabe en GPU consumer: si, en la mayoria de cuantizaciones Q4 y Q5 con GPUs de 12-16 GB; las cuantizaciones altas (Q6_K, Q8_0) requieren 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo (no hay pesos safetensors en este repositorio).
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OrcaMaid-v2-FIX-13b-32k-GGUF (este) | 13B | 32k | Microsoft Research License | GGUF | Merge comunitario sobre Orca-2-13b |
| Microsoft Orca-2-13b | 13B | 4k (original) | Microsoft Research License | safetensors | Base original de Microsoft Research |
| Llama 2 13B Chat | 13B | 4k | Llama 2 Community License | safetensors, GGUF | Alternativa generalista de Meta |
| Mistral 7B Instruct | 7B | 32k | Apache 2.0 | safetensors, GGUF | Menor tamano, contexto similar, licencia permisiva |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para este modelo que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia Microsoft Research License: restringe el uso comercial; es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- Solo ingles: no se ha confirmado soporte multilingue, por lo que su uso en castellano u otros idiomas producira resultados de calidad inferior.
- Modelo de merge comunitario: la calidad puede variar respecto al Orca-2-13b original y no hay evaluacion publicada que lo respalde.
- Riesgo de alucinacion inherente a los modelos de 13B, especialmente en tareas factuales y con contexto largo.
- El contexto de 32k no esta verificado en la documentacion; el rendimiento en ventanas muy largas puede degradarse.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pierden calidad de forma notable; el autor recomienda Q4_K_S o Q4_K_M para uso general.
- No hay model card tecnica detallada ni informacion sobre sesgos, datos de entrenamiento o evaluaciones de seguridad.
- El repositorio solo contiene pesos GGUF; no incluye safetensors para fine-tuning ni despliegue con vLLM/TGI.
- Fecha de creacion del repositorio en 2026 y ausencia de likes/descargas elevadas: modelo de nicho con poca validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OrcaMaid-v2-FIX-13b-32k-GGUF
- Modelo base: https://huggingface.co/ddh0/OrcaMaid-v2-FIX-13b-32k
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/OrcaMaid-v2-FIX-13b-32k-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#OrcaMaid-v2-FIX-13b-32k-GGUF
- Licencia Microsoft Research: https://huggingface.co/microsoft/Orca-2-13b/blob/main/LICENSE
- Modelo Orca-2-13b de Microsoft: https://huggingface.co/microsoft/Orca-2-13b
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
