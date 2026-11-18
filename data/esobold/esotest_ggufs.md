# Esobold/EsoTest_GGUFs

## Resumen

EsoTest_GGUFs es un repositorio de Hugging Face publicado por el usuario Esobold que contiene pesos en formato GGUF bajo la etiqueta "FM nearswap family". Segun la model card, el artefacto principal es `GhostShip-31b-Q4_K_M.gguf`, descrito como un merge de tipo nearswap entre los modelos Gemma4-Gutenberg-31B-Heretic y gemma-4-31B-it-scotoma-2, con una fuerza de nearswap lineal por capas que va de 0,0001 a 0,0007 (media 4e-4). El autor lo situa en la misma familia que Robinson y BenGunn, con una fuerza pico aproximadamente cuatro veces mayor.

El dato objetivo disponible es el recuento de parametros en safetensors: 30.697.345.596 parametros (unos 30,7 mil millones), coherente con la nomenclatura "31b" del archivo GGUF. El repositorio tiene un tamano de 1.854,7 GB, lo que sugiere la presencia de multiples cuantizaciones y posiblemente varios modelos mergeados dentro del mismo repo. El modelo acumula 73.748 descargas, aunque no cuenta con likes ni pipeline declarado.

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion tecnica: se trata de un merge experimental de la comunidad, sin model card detallada, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Resulta util principalmente como referencia de un experimento de merging con la tecnica nearswap sobre la familia Gemma 4 de 31B, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, derivado de Gemma 4 31B; no confirmado en la informacion) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se menciona explicitamente Q4_K_M; el resto de cuantizaciones del repo no estan detalladas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo con safetensors como fuente del recuento de parametros) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo base ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). Lo unico documentado es el procedimiento de merging: un nearswap entre `Gemma4-Gutenberg-31B-Heretic` y `gemma-4-31B-it-scotoma-2`, con una fuerza t que crece linealmente de 0,0001 a 0,0007 a lo largo de las capas, con media 4e-4. El autor indica que esta fuerza es aproximadamente cuatro veces la pico de otros merges de la misma familia (Robinson, BenGunn).

El nearswap es una tecnica de interpolacion de pesos que sustituye selectivamente tensores del modelo base por los del modelo donante cuando la diferencia supera un umbral, modulada por el parametro de fuerza. Al aplicarse por capas con una progresion lineal, el merge introduce el comportamiento del modelo donante de forma mas intensa en las capas profundas. No se documenta ninguna innovacion adicional en atencion, decodificacion especulativa ni entrenamiento posterior al merge.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repo indica uso previsto como modelo de chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de la infraestructura de Inference Endpoints de Hugging Face.
- Herencia de capacidades del modelo base Gemma 4 31B: al ser un merge de pesos, conserva las capacidades del modelo original (razonamiento, codigo, matematicas, multilingue), aunque no se documenta su magnitud ni se verifica en la model card.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion.

## Casos de uso

- Experimentacion con tecnicas de merging: el caso de uso principal es reproducir o evaluar el efecto del nearswap con fuerza lineal por capas sobre la familia Gemma 4 31B, comparando contra los merges Robinson y BenGunn de la misma familia.
- Despliegue local en cuantizacion Q4_K_M: el archivo `GhostShip-31b-Q4_K_M.gguf` permite ejecutar un modelo de ~31B en hardware de consumo de gama alta mediante llama.cpp u Ollama, con la perdida de calidad asociada a 4 bits.
- Chat conversacional autoalojado: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar un asistente de texto sobre infraestructura propia, siempre que se valide previamente la calidad del merge.
- Benchmarking comparativo de merges: util como punto de comparacion en estudios internos sobre el impacto de la fuerza de nearswap en la perplexity y en tareas de instruccion.
- Pruebas de integracion en pipelines de inferencia: sirve para validar el soporte de GGUF en vLLM, llama.cpp o TGI antes de adoptar un modelo mergeado en un flujo de trabajo real.
- Base para futuros merges de la comunidad: al estar publicado el procedimiento (fuerza t y rango por capas), otros autores pueden partir de el para explorar variantes con distinta intensidad o con otros donantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 17-19 GB para los pesos, mas overhead de contexto KV; en la practica, unos 20-24 GB para ventanas de contexto moderadas.
- Cuantizaciones de menor precision (Q3_K_M, Q2_K) reducirian el requisito a unos 13-15 GB, a costa de mayor degradacion; no se confirma su presencia en el repo.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberia poder cargar la Q4_K_M completa; para cuantizaciones mayores o contextos largos se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM para la cuantizacion Q4_K_M; en GPUs de 16 GB requeriria cuantizaciones mas agresivas o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (soporte GGUF), TGI y Hugging Face Inference Endpoints (por la etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles; dependeran del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EsoTest_GGUFs (GhostShip-31b-Q4_K_M) | ~30,7 B | no disponible | no disponible | GGUF | Merge nearswap experimental, sin benchmarks |
| Robinson (misma familia FM nearswap) | no disponible | no disponible | no disponible | GGUF | Referenciado por el autor como miembro de la misma familia |
| BenGunn (misma familia FM nearswap) | no disponible | no disponible | no disponible | GGUF | Referenciado por el autor; fuerza pico ~4x menor que GhostShip |
| Gemma 4 31B (modelo base) | ~31 B | no disponible | no disponible | safetensors/GGUF | Modelo original sobre el que se construye el merge |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, contexto, idiomas ni evaluacion, lo que impide garantizar un comportamiento fiable en produccion.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; ademas, al derivar de Gemma 4, habria que verificar la licencia del modelo base, que no se detalla en la informacion.
- Merge experimental sin validacion publicada: no hay benchmarks que confirmen que el nearswap con fuerza 4e-4 mejora al modelo base; el riesgo de degradacion en razonamiento o instruccion es real.
- Riesgo de alucinacion: inherente a los modelos de ~31B sin evaluacion publicada; no se documenta ningun mecanismo de mitigacion.
- Sesgos: no documentados; al heredarse del modelo base y del donante, no es posible auditarlos con la informacion disponible.
- Repositorio de 1.854,7 GB: descargar el repo completo es costoso en almacenamiento y ancho de banda; conviene descargar solo el archivo GGUF necesario.
- Sin likes ni pipeline declarado: indica escasa validacion por parte de la comunidad, lo que reduce la confianza en su calidad.
- Fecha de creacion futura (2026-05-27) en los metadatos: conviene tratar las fechas del repo con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Esobold/EsoTest_GGUFs
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
