# mradermacher/Crow-9B-HERETIC-GGUF

## Resumen

Crow-9B-HERETIC-GGUF es la distribucion en formato GGUF del modelo Crow-9B-HERETIC-4.6, un modelo de lenguaje de aproximadamente 8.950 millones de parametros desarrollado por Crownelius y cuantizado por mradermacher. El modelo base esta disenado para tareas de agente, razonamiento multi-paso y generacion de texto conversacional, con soporte declarado para 26 idiomas, incluido el castellano. Esta publicacion concreta no es un modelo nuevo, sino la version empaquetada en GGUF para inferencia local eficiente con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que el formato GGUF permite ejecutar el modelo en hardware de consumo, algo imposible con los pesos completos en safetensors (18 GB en f16). El repositorio ofrece un abanico amplio de cuantizaciones, desde Q2_K (3,9 GB) hasta Q8_0 (9,6 GB), ademas de un suplemento multimodal mmproj en Q8_0 y f16, lo que sugiere capacidades de vision aunque no se detallan en la informacion disponible.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales, y esta etiquetado con el tag "agent", lo que indica un enfasis en flujos de trabajo con tool calling y razonamiento encadenado. No obstante, la informacion publica sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchas especificaciones se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, segun formato de pesos) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Crownelius/Crow-9B-HERETIC-4.6 en la documentacion proporcionada. Por el numero de parametros (8.950 millones) y el formato de pesos, se trata de un transformer denso, pero no se especifican detalles como el numero de capas, dimensiones ocultas, tipo de atencion o si emplea alguna tecnica de atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la model card lista los datasets utilizados: crownelius/Creative_Writing_ShareGPT_Enhanced, microsoft/rStar-Coder, peteromallet/dataclaw-peteromallet, crownelius/Opus-4.6-Reasoning-3300x, openbmb/UltraData-Math, Unreleased/Dataset y Crownelius/Crow-Heretic-TeichAI-Unified. Esta mezcla sugiere un entrenamiento orientado a escritura creativa, codigo, razonamiento y matematicas, con un componente de datos no publicados. No se indica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se documenta el proceso de alineacion ni innovaciones tecnicas destacables.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en escritura creativa segun los datasets de entrenamiento.
- Razonamiento multi-paso y tareas de agente, indicado por el tag "agent" del repositorio.
- Generacion de codigo, respaldada por el dataset microsoft/rStar-Coder.
- Razonamiento matematico, respaldado por openbmb/UltraData-Math.
- Soporte multilingue declarado para 26 idiomas, incluidos castellano, ingles, chino, ruso, frances, aleman, arabe, portugues y japones, entre otros.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el tag "agent" y la etiqueta endpoints_compatible sugieren compatibilidad con flujos de agentes.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada visual, aunque no se detalla el alcance.
- Modo "thinking" o razonamiento extendido: no confirmado en la informacion disponible.

## Casos de uso

- Asistente de escritura creativa: el modelo se ha entrenado con Creative_Writing_ShareGPT_Enhanced, por lo que puede generar relatos, dialogos y textos narrativos con coherencia estilistica en conversaciones multi-turno.
- Generacion de codigo en entornos locales: gracias a las cuantizaciones Q4_K_M (5,7 GB) y Q5_K_M (6,6 GB), puede integrarse en editores o pipelines de CI/CD que requieran inferencia en maquina local sin depender de API externa.
- Agente autonomo con tool calling: el tag "agent" y la compatibilidad con endpoints sugieren su uso en flujos de razonamiento multi-paso donde el modelo decide que herramienta invocar, aunque la funcionalidad concreta no esta documentada.
- Atencion al cliente multilingue: con soporte para 26 idiomas, puede gestionar conversaciones en castellano, ingles, frances, aleman y otros idiomas europeos y asiaticos en un unico despliegue.
- Tutoria matematica y resolucion de problemas: el dataset UltraData-Math respalda tareas de razonamiento cuantitativo, util para asistentes educativos o verificacion de calculos.
- Procesamiento de documentos con componente visual: los ficheros mmproj permiten, en teoria, entrada de imagenes junto a texto, adecuado para tareas de descripcion o extraccion de informacion de capturas y diagramas.
- Despliegue en hardware de consumo: las cuantizaciones Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM, ampliando el acceso a equipos de desarrollo modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~4 GB, Q3_K_S ~4,5 GB, Q4_K_S ~5,5 GB, Q4_K_M ~5,7 GB, Q5_K_M ~6,6 GB, Q6_K ~7,5 GB, Q8_0 ~9,6 GB, f16 ~18 GB. Estos valores corresponden al tamano del fichero y no incluyen el overhead de contexto KV cache.
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, se recomienda RTX 4070 Ti Super de 16 GB o superior; para f16, se necesita una A100 40 GB, H100 o RTX 4090 de 24 GB con margen para contexto.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, usando cuantizaciones Q4 a Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI, aunque no se confirma compatibilidad explicita.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Crow-9B-HERETIC-GGUF | 8,95 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones multiples, mmproj multimodal, 26 idiomas |
| Modelos de ~9B de la familia Llama 3.1 | 8 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Contexto largo documentado, amplia adopcion |
| Modelos de ~7-8B de la familia Qwen2.5 | 7,6 B | 128 K | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo y matematicas |
| Gemma 2 9B | 9 B | 8 K | Gemma Terms | safetensors, GGUF | Buen rendimiento en razonamiento, licencia restrictiva |

La comparacion se basa en caracteristicas generales de categoria, ya que no se dispone de benchmarks del modelo Crow-9B-HERETIC que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas concretas es desconocido.
- La model card no detalla la arquitectura, el contexto maximo ni el proceso de alineacion, lo que dificulta evaluar su robustez en produccion.
- Riesgo de alucinacion inherente a los modelos de ~9B, especialmente en tareas de razonamiento complejo o datos factuales.
- El dataset "Unreleased/Dataset" sugiere el uso de datos no publicos, lo que impide auditar la composicion del entrenamiento y posibles sesgos.
- Aunque la licencia es Apache 2.0, conviene verificar que los datasets de entrenamiento no impongan restricciones adicionales, especialmente los no publicados.
- El soporte multimodal a traves de mmproj no esta documentado en cuanto a resolucion de imagen, tipos de tarea o calidad; debe validarse empiricamente.
- El contexto maximo no esta especificado; en despliegues con llama.cpp habra que fijarlo manualmente y verificar el comportamiento en ventanas largas.
- El modelo esta etiquetado como "HERETIC", lo que en la practica suele indicar un ajuste fino que reduce rechazos o restricciones de seguridad; esto puede aumentar el riesgo de contenido inapropiado y requiere filtros adicionales en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Crow-9B-HERETIC-GGUF
- Modelo base: https://huggingface.co/Crownelius/Crow-9B-HERETIC-4.6
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Crow-9B-HERETIC-i1-GGUF
- Pagina de resumen del modelo en nethype: https://hf.tst.eu/model#Crow-9B-HERETIC-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Creative_Writing_ShareGPT_Enhanced: https://huggingface.co/datasets/crownelius/Creative_Writing_ShareGPT_Enhanced
- Dataset rStar-Coder: https://huggingface.co/datasets/microsoft/rStar-Coder
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
