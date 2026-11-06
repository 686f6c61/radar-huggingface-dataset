# hyukudan/GLM-5.3-Flash-exl3-mirror

## Resumen

GLM-5.3-Flash-exl3-mirror es un espejo (mirror) byte a byte de la cuantizacion EXL3 a 4,05 bits por peso (bpw) del modelo GLM-5.3-Flash de Z.ai, publicada originalmente por turboderp dentro del ecosistema exllamav3. No se trata de un modelo nuevo ni de una re-cuantizacion: los 30 ficheros del repositorio son copias exactas de la revision `2a30229e67012798ba9f0cd832bb78abf4c363d5` del repositorio upstream, con los mismos hashes SHA-256, y su unica finalidad es fijar la revision contra la que se construyeron y midieron los motores de inferencia del proyecto `strix-halo-engine-lab`.

El modelo subyacente, GLM-5.3-Flash, es un transformer de 80.591.544.382 parametros (unos 80,6 mil millones) publicado por Z.ai bajo licencia MIT. La cuantizacion EXL3 reduce el peso en disco a 165,15 GB distribuidos en 19 shards de safetensors, ademas de un fichero `mtp.safetensors` de 3,79 GB destinado a experimentos de prediccion multi-token (MTP).

Su relevancia practica es doble: por un lado, ofrece pesos de un modelo de ~80B en un formato de cuantizacion de alta calidad (4,05 bpw) que permite ejecutarlo en hardware de gama alta con menos VRAM que el modelo en precision completa; por otro, la existencia de un espejo con hashes verificados y revision fijada facilita la reproducibilidad de benchmarks y despliegues en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GLM-5.3-Flash (tag `glm5_next`); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 80.591.544.382 (~80,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4,05 bpw (exllamav3); no se ofrecen otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (19 shards) + `mtp.safetensors`; incluye `quantization_config.json` |
| Tamano del repositorio | 165,15 GB (30 ficheros) |
| Revision upstream fijada | `2a30229e67012798ba9f0cd832bb78abf4c363d5` (turboderp/GLM-5.3-Flash-exl3) |
| Modelo base | zai-org/GLM-5.3-Flash @ `46a050bec13002ad29ee795c16e61cf4fa3c4a9c` |
| Descargas / likes | 37 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base GLM-5.3-Flash mas alla de la etiqueta `glm5_next` y de su naturaleza de transformer. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Estos datos deben consultarse en la model card upstream de Z.ai, que el repositorio conserva como `README.upstream.md`.

La innovacion tecnica relevante en este repositorio es la cuantizacion EXL3 a 4,05 bpw realizada por turboderp con exllamav3, que comprime un modelo de ~80,6B parametros en 165,15 GB manteniendo el formato safetensors y un `quantization_config.json` especifico de EXL3. El fichero `mtp.safetensors` sugiere soporte de prediccion multi-token, empleada en el proyecto de motores para experimentos de decodificacion especulativa. El espejo no introduce modificaciones: las mejoras del autor del mirror (kernels, planificacion, decodificacion especulativa) viven en el motor, no en los pesos.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base GLM-5.3-Flash (sin detalle de capacidades especificas en la informacion proporcionada).
- Prediccion multi-token (MTP) mediante el fichero `mtp.safetensors`, orientada a decodificacion especulativa y aceleracion de inferencia.
- Ejecucion con tensor parallelism (TP2) sobre dos nodos Strix Halo conectados por USB4, segun la documentacion del proyecto de motores.
- Compatibilidad con exllamav3 como motor de referencia para cargar los pesos EXL3.
- Capacidades de tool calling, agentes, vision, audio o thinking mode: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Reproducibilidad de benchmarks: el espejo fija una revision concreta con hashes SHA-256 verificados, lo que permite repetir exactamente las mediciones del proyecto `strix-halo-engine-lab` y comparar resultados entre ejecuciones sin ambiguedad sobre los pesos empleados.
- Despliegue de un modelo de ~80B en hardware de gama alta: la cuantizacion EXL3 a 4,05 bpw reduce el peso a 165,15 GB, lo que hace viable servirlo en nodos con suficiente VRAM o en configuraciones multi-GPU con tensor parallelism.
- Investigacion en decodificacion especulativa: el fichero `mtp.safetensors` permite experimentar con prediccion multi-token y medir su impacto en latencia y throughput frente a la decodificacion estandar.
- Pruebas de motores de inferencia: al ser una copia byte a byte del upstream, sirve como referencia estable para validar kernels, planificadores y estrategias de particionado (por ejemplo, TP2 sobre USB4 en nodos Strix Halo).
- Pipelines de evaluacion interna: equipos que necesiten comparar su propio stack de inferencia contra exllamav3 pueden usar este repositorio como baseline reproducible sin depender de la disponibilidad o cambios del upstream.
- Archivado y cumplimiento de licencia: al incluir el fichero `LICENSE` original verbatim y mantener la licencia MIT, el repositorio facilita auditorias de licencia y la distribucion interna de pesos en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 165,15 GB en disco; en EXL3 a 4,05 bpw se necesita espacio equivalente en VRAM o en memoria unificada para cargar los pesos, mas overhead de cache KV y activaciones (no cuantificado en la informacion disponible).
- Configuracion documentada por el autor: dos nodos Strix Halo con tensor parallelism sobre USB4 (TP2), es decir, memoria unificada repartida entre dos equipos.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, requiere soluciones multi-GPU o plataformas de memoria unificada de gran capacidad.
- Cabe en consumer GPU: no en una unica GPU de consumo convencional; el proyecto de referencia emplea dos nodos Strix Halo.
- Opciones de despliegue: exllamav3 (motor de referencia para EXL3); otros motores como vLLM, llama.cpp, Ollama o TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-exl3-mirror (este) | ~80,6B | no disponible | EXL3 4,05 bpw | MIT | Hugging Face (espejo) |
| zai-org/GLM-5.3-Flash | ~80,6B (base) | no disponible | pesos originales | MIT | Hugging Face |
| turboderp/GLM-5.3-Flash-exl3 | ~80,6B | no disponible | EXL3 4,05 bpw | MIT | Hugging Face (upstream) |

Las tres entradas corresponden al mismo modelo base en distintos formatos o ubicaciones; no se dispone de informacion sobre modelos alternativos de otros desarrolladores con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo original: es un espejo de una cuantizacion de terceros; cualquier problema de calidad deriva del modelo base o de la cuantizacion EXL3, no del espejo.
- La cuantizacion a 4,05 bpw introduce perdida de precision respecto a los pesos originales; el impacto exacto en calidad no esta cuantificado en la informacion disponible.
- El repositorio no documenta sesgos, tasas de alucinacion ni limitaciones de idioma del modelo base; deben consultarse en la model card upstream.
- Longitud de contexto e idiomas soportados no disponibles: no debe asumirse ningun valor sin verificar la configuracion del modelo base.
- El formato EXL3 limita la compatibilidad con motores de inferencia; fuera de exllamav3 el soporte no esta confirmado.
- Licencia MIT permite uso comercial, pero se recomienda conservar el fichero `LICENSE` y citar a los autores originales (turboderp y Z.ai) segun indica la model card.
- El proyecto de motores asociado se ha medido en una configuracion concreta (dos nodos Strix Halo, TP2 sobre USB4); el rendimiento en otro hardware puede diferir.
- Repositorio con muy baja traccion (37 descargas, 0 likes): no hay validacion comunitaria extensa de la integridad mas alla de los hashes publicados.

## Enlaces

- Repositorio del espejo: https://huggingface.co/hyukudan/GLM-5.3-Flash-exl3-mirror
- Repositorio upstream de la cuantizacion: https://huggingface.co/turboderp/GLM-5.3-Flash-exl3
- Revision upstream fijada: https://huggingface.co/turboderp/GLM-5.3-Flash-exl3/tree/2a30229e67012798ba9f0cd832bb78abf4c363d5
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Revision del modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash/tree/46a050bec13002ad29ee795c16e61cf4fa3c4a9c
- Proyecto de motores y mediciones: https://github.com/hyukudan/strix-halo-engine-lab
