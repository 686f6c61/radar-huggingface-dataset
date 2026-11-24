# mradermacher/Luminescent-Void-31B-i1-GGUF

## Resumen

Luminescent-Void-31B-i1-GGUF es la distribucion en formato GGUF del modelo Cyclone-Labs/Luminescent-Void-31B, un merge de modelos de 30.697.345.596 parametros (aproximadamente 30,7 mil millones) orientado a roleplay, narrativa (storytelling) y contenido conversacional para adultos. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, que en este caso emplea cuantizaciones con matriz de importancia (imatrix) para preservar mejor la calidad en tamanos reducidos.

El modelo resuelve el problema de desplegar un modelo de 31B en hardware de consumo: las cuantizaciones i1 (imatrix) reducen el peso de los 44,1 GB del repositorio a ficheros de entre 12 y 14,5 GB segun el tipo, lo que permite ejecutarlo con llama.cpp u Ollama en GPUs con 16-24 GB de VRAM. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Es relevante ahora porque ofrece una alternativa de rol conversacional de mayor tamano que los habituales 7B-13B, con cuantizaciones optimizadas para calidad por tamano. La informacion publica disponible es escasa: no hay model card detallada del modelo base, no se documentan datos de entrenamiento ni benchmarks, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (merge de modelos; se desconoce la arquitectura subyacente) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 con imatrix: Q2_K, IQ3_XXS, IQ3_XS, IQ3_M, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M; se incluye fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Cyclone-Labs/Luminescent-Void-31B: la model card del repositorio GGUF solo indica que es un merge (etiquetas `mergekit` y `merge`) y no detalla si se trata de un transformer denso, un MoE o una arquitectura hibrida. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La innovacion tecnica destacable de esta publicacion es el uso de cuantizaciones i1 con matriz de importancia (imatrix), generadas con el fichero `Luminescent-Void-31B.imatrix.gguf` incluido en el repositorio. Este enfoque pondera la cuantizacion segun la importancia de los pesos para el modelo, lo que en la practica mejora la perplejidad frente a cuantizaciones estaticas del mismo tamano. El autor remite a la grafica comparativa de ikawrakow y al analisis de Artefact2 sobre tipos de cuantizacion para contextualizar las diferencias de calidad.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en roleplay y narrativa.
- Escritura creativa y storytelling de formato largo (fichas, escenas, dialogos).
- Conversaciones multi-turno orientadas a personajes y mantenimiento de persona.
- Contenido para adultos (etiqueta `nsfw` y `not-for-all-audiences`): el modelo esta disenado explicitamente para este tipo de roleplay.
- Capacidad de vision: la model card menciona que es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico; no se confirma que se hayan publicado dichos ficheros.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Roleplay conversacional de personajes: el modelo mantiene personas y dialogos multi-turno en ingles, y su tamano de 31B le permite mayor coherencia narrativa que modelos de 7B-13B en sesiones largas.
- Escritura creativa asistida: generacion de relatos, escenas y dialogos con estilo consistente, ejecutable en local con cuantizaciones Q4_K_M o Q5_K_M.
- Prototipado de videojuegos narrativos: integracion del GGUF en motores de dialogo mediante llama.cpp para generar respuestas de NPCs con personalidad definida.
- Despliegue local con privacidad: al ejecutarse en hardware propio con llama.cpp u Ollama, las conversaciones (incluido contenido sensible para adultos) no salen del equipo.
- Experimentacion con merges: el fichero imatrix y las cuantizaciones i1 permiten estudiar el impacto de la cuantizacion con importancia en un modelo de 31B.
- Generacion de contenido para plataformas de ficcion interactiva: produccion de texto narrativo en ingles con control de tono y personaje mediante prompts de sistema.
- Evaluacion comparativa de cuantizaciones: usar las distintas variantes (IQ3_M, Q4_K_M, Q5_K_M, Q6_K) para medir el compromiso calidad/tamano en un caso real de roleplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero mas overhead de contexto): i1-Q2_K ~12 GB, i1-IQ3_M ~14,5 GB; las variantes Q4_K_M y Q5_K_M, no incluidas en la tabla de la model card pero presentes en la lista de cuantizaciones, se situarian en rangos superiores (del orden de 17-22 GB) y Q6_K por encima de 24 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para las cuantizaciones mayores y contextos largos.
- GPU de consumo: las variantes Q2_K e IQ3_M caben en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080); en 12 GB solo con cuantizaciones muy agresivas y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio esta etiquetado como `endpoints_compatible`. El modelo base en safetensors requiere transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luminescent-Void-31B-i1-GGUF | ~30,7B | no disponible | Apache 2.0 | GGUF (i1) | Merge para roleplay/NSFW, solo ingles |
| Modelo base Cyclone-Labs/Luminescent-Void-31B | ~30,7B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar; requiere mas VRAM |
| mradermacher/Luminescent-Void-31B-GGUF (estatico) | ~30,7B | no disponible | Apache 2.0 | GGUF (estatico) | Misma familia, cuantizaciones sin imatrix; incluye posibles mmproj |
| Otros merges de roleplay de ~30B | no disponible | no disponible | variable | variable | No se dispone de datos verificables para comparar rendimiento |

No se dispone de datos de benchmarks ni de modelos comparables con metricas publicadas en la informacion proporcionada; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ni garantiza calidad en castellano u otros idiomas.
- Contenido NSFW y no apto para todas las audiencias: no debe desplegarse en entornos sin filtrado o moderacion adecuada.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento ni el proceso de alineacion, no es posible evaluar sesgos de genero, raza u otros.
- Longitud de contexto no documentada; conviene validar experimentalmente el contexto efectivo antes de usarlo en produccion.
- Aunque la licencia es Apache 2.0, el contenido generado puede infringir derechos de terceros o normativa sobre contenido para adultos segun la jurisdiccion; revisar antes de uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni reportes de calidad independientes.
- El autor advierte que es un merge; los merges pueden heredar inconsistencias de los modelos originales no corregidas por ajuste posterior.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/Luminescent-Void-31B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Luminescent-Void-31B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Luminescent-Void-31B
- Pagina de descargas del autor: https://hf.tst.eu/model#Luminescent-Void-31B-i1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
