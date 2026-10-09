# alxnahas/strands-decider-v21-webgpu

## Resumen

Strands Decider v21 WebGPU es una versión comprimida y no oficial del modelo strands-decider-2B-hobson-v21, publicada por el desarrollador Alex Nahas. Se trata de una build específicamente optimizada para ejecutarse dentro de un motor WebGPU escrito a mano, con el objetivo de correr el modelo directamente en el navegador. No es una release oficial de Strands, sino una adaptación derivada.

El modelo parte de Qwen/Qwen3.5-2B-Base, al que se le fusiona el adaptador LoRA de v21 y se le aplica una poda estructural agresiva: se eliminan 9 de las 24 capas del decodificador (capas 14 a 22), sustituidas por un único bloque lineal. Posteriormente se cuantiza a int4 con GPTQ. El repo ocupa 0,7 GB y el navegador descarga unos 472 MB, frente a los 1.085 MB de la build int4 anterior de v19.

Su relevancia radica en la eficiencia de despliegue: demuestra que un clasificador basado en transformer de ~2B puede ejecutarse en WebGPU con latencias de 29 ms por forward pass a 68 tokens en un Apple M4 Pro, con una pérdida mínima de precisión respecto a la versión completa en bfloat16. El pipeline declarado es text-classification y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-2B-Base, con poda de 9 de 24 capas del decodificador y bloque lineal sustituto |
| Parametros totales | no disponible (modelo base de ~2B, reducido tras la poda de capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita (se reportan pruebas a 68, 512 y 2.048 tokens) |
| Tipos de cuantizacion | int4 (GPTQ, grupo 32, simetrico) en capas lineales; int3 (grupo 32) en embeddings |
| Idiomas soportados | no disponibles (probados en en, zh, ja, ko, ar, hi, uk, de, pl) |
| Licencia | Apache-2.0 |
| Formato de pesos | formato propietario para motor WebGPU (`.wire.gz`, `embed_bundle.bin`, `embed_rows.bin`, `manifest.json`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen/Qwen3.5-2B-Base (revision `b1485b2fa6dfa1287294f269f5fb618e03d52d7c`), al que se le ha fusionado el adaptador LoRA de strands-decider-2B-hobson-v21. La modificacion estructural principal es la eliminacion de las capas 14 a 22 (9 de 24) del decodificador, que se sustituyen por un unico bloque lineal de la forma `h + W rms_norm(h) + b`, colocado tras la capa 13. Este bloque fue entrenado para aproximar el comportamiento de v21 sobre 1.516 filas construidas a partir de las recetas publicas de entrenamiento de v21, ninguna de ellas del conjunto JevBench.

Sobre el modelo podado se aplica una rotacion del flujo residual mediante una matriz de Hadamard fija, seguida de cuantizacion GPTQ a int4 (grupo 32, simetrico) de cada capa lineal, calibrada sobre 256 filas de las mismas recetas. Los embeddings conservan el vocabulario completo de 248.320 tokens en int3 (grupo 32): las 32.126 filas mas frecuentes (por conteo de tokens sobre los prompts de entrenamiento de v21, mas tokens especiales y de byte) se empaquetan por adelantado y el resto se descarga bajo demanda mediante peticiones HTTP range. Las escalas de grupo se almacenan en 8 bits sobre una escala logaritmica por fila en lugar de fp16 (con un error maximo del 0,9 % por escala). La cabeza de lectura y sus temperaturas son las de v21 sin cambios.

## Capacidades

- Clasificacion de texto (pipeline declarado: text-classification), mediada por una cabeza de lectura ("pointer head") y una configuracion de decision ("decider config") heredadas de v21.
- Inferencia sobre WebGPU directamente en el navegador, sin backend de servidor.
- Soporte de embeddings con carga bajo demanda: cualquier fila fuera del conjunto empaquetado se recupera con una peticion HTTP range la primera vez que un prompt la usa.
- Capacidades multilingues observadas en 9 idiomas (ingles, chino, japones, coreano, arabe, hindi, ucraniano, aleman y polaco), aunque los idiomas oficialmente soportados no estan declarados.
- Ejecucion con kernels portables (Chrome estandar) y con kernels de subgroup-matrix (Chrome con flags WebGPU), con respuestas identicas en las 231 tareas de JevBench.
- Compatibilidad con GPUs sin subgrupos de 32 (mayoria de Intel, AMD y moviles) mediante kernels sin subgrupo.

## Casos de uso

- Clasificacion de texto en el navegador: el modelo puede etiquetar o decidir sobre texto directamente en el lado del cliente, sin enviar datos a un servidor, apropiado para aplicaciones con requisitos de privacidad.
- Demos interactivas en web: despliegue de una demo funcional en GitHub Pages con una descarga inicial de 472 MB y ejecucion en WebGPU, util para mostrar capacidades de modelo sin infraestructura de backend.
- Inferencia en el borde sin GPU dedicada: al requerir solo WebGPU y admitir kernels sin subgrupo, puede correr en portatiles con GPUs integradas Intel o AMD.
- Procesamiento de prompts en multiples idiomas: con resultados de 30 a 45 aciertos sobre 48 tareas publicas en idiomas como en, zh, ja, ko, ar, hi, uk, de y pl, adecuado para tareas de clasificacion multilingue ligera.
- Prototipado e investigacion de cuantizacion: sirve como referencia reproducible de poda de capas mas GPTQ int4 sobre un transformer de ~2B, con simulacion MLX comparable disponible.
- Aplicaciones de baja latencia en cliente: con 29 ms por forward pass a 68 tokens en un Apple M4 Pro, es viable para tareas interactivas de decision por token corto.
- Entornos con memoria y ancho de banda limitados: el empaquetado gzip y la carga bajo demanda de embeddings reducen la huella de descarga a 472 MB frente a 1.085 MB de la build anterior de v19.

## Benchmarks y rendimiento

JevBench, conjunto publico (231 tareas):

| Modelo / build | Aciertos | Respuestas cambiadas vs v21 | Rescore v1.6.1: Capability (Intelligence, Calibration) |
|---|---|---|---|
| v21, bfloat16 (MLX) | 176 | - | 53.2 (32.3, 74.2) |
| esta build, motor WebGPU | 176 | 11 | 50.8 (30.4, 71.1) |
| esta build, simulacion MLX | 175 | 12 | 52.2 (30.4, 74.0) |
| v21 en formato de la demo anterior (int4, 24 capas, MLX) | 163 | 31 | 48.8 (25.4, 72.3) |

Otros idiomas, 48 tareas publicas traducidas a cada idioma (aciertos de 48, v21 sobre MLX):

| Build | en | zh | ja | ko | ar | hi | uk | de | pl |
|---|---|---|---|---|---|---|---|---|---|
| v21 | 45 | 43 | 43 | 44 | 40 | 31 | 42 | 43 | 39 |
| esta build, motor WebGPU | 44 | 45 | 42 | 41 | 39 | 30 | 42 | 42 | 39 |

Tiempo de GPU por forward pass en headless Chrome sobre Apple M4 Pro:

| Longitud | esta build (WebGPU) | formato v19 anterior | Chrome estandar (sin subgroup-matrix) | kernels sin subgrupo (forzado) |
|---|---|---|---|---|
| 68 tokens | 29 ms | 46 ms | 37 ms | 39 ms |
| 512 tokens | 161 ms | 259 ms | 201 ms | 212 ms |
| 2.048 tokens | 646 ms | 1.041 ms | 800 ms | 844 ms |

Notas: la simulacion MLX de los mismos pesos cuantizados concuerda con el motor en 230 de 231 tareas; las filas de embedding bajo demanda dan salidas identicas bit a bit (40 prompts en 9 idiomas). El rescore aplica las reglas de JevBench v1.6.1 solo a estas 231 tareas (sin mitad sellada), por lo que no es una puntuacion de leaderboard. Los mismos items se usaron para comparar builds durante el desarrollo, por lo que las puntuaciones pueden leerse ligeramente altas.

## Requisitos de hardware

- Descarga total en navegador: aproximadamente 472 MB (437 MB de pesos, 27 MB de bundle de embeddings, 8 MB de tokenizador y cabeza).
- Tamano del repo: 0,7 GB.
- Cabe en GPUs de consumo y en GPUs integradas: el modelo esta disenado para WebGPU y admite GPUs sin subgrupos de 32 anchos (mayoria de Intel, AMD y moviles) mediante kernels sin subgrupo.
- GPU de referencia medida: Apple M4 Pro, con 29 ms por forward pass a 68 tokens, 161 ms a 512 y 646 ms a 2.048.
- Despliegue: motor WebGPU propio del repositorio alxnahas/strands-decider-web; no se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es propietario.
- Navegadores soportados: Chrome estandar (kernels portables) y Chrome con flags WebGPU (kernels subgroup-matrix), con respuestas identicas en las 231 tareas.
- VRAM concreta: no disponible de forma explicita (el modelo se ejecuta en WebGPU sobre memoria de GPU/CPU unificada del sistema anfitrion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento JevBench (231 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strands-decider-v21-webgpu (esta build) | no disponible (~2B base, podado) | no disponible | 176 aciertos | Apache-2.0 | HuggingFace, 0 descargas |
| strands-decider-2B-hobson-v21 (bfloat16, MLX) | ~2B | no disponible | 176 aciertos | Apache-2.0 | HuggingFace (StrandsAgents) |
| v21 en formato int4 de la demo anterior (24 capas) | ~2B | no disponible | 163 aciertos | Apache-2.0 | formato del motor anterior |
| Qwen/Qwen3.5-2B-Base | ~2B | no disponible | no disponible (es modelo base) | Apache-2.0 | HuggingFace (Qwen) |

## Limitaciones y advertencias

- Es una build no oficial: el propio autor indica que no es una release de Strands, sino una adaptacion personal.
- Formato de pesos propietario para un motor WebGPU concreto; no es directamente portable a vLLM, llama.cpp, Ollama o TGI.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de clasificacion, el riesgo se manifiesta como decisiones incorrectas mas que como texto inventado.
- Limitaciones de contexto: la longitud de contexto oficial no esta declarada; las pruebas llegan hasta 2.048 tokens.
- Limitaciones de idioma: el rendimiento cae de forma notable en hindi (30-31 de 48) y polaco (39 de 48); los idiomas oficialmente soportados no estan declarados.
- Licencia: Apache-2.0, igual que v21 y Qwen/Qwen3.5-2B-Base; permite uso comercial segun los terminos de dicha licencia (consultar `LICENSE.md` del repositorio).
- Las puntuaciones de JevBench se calcularon sobre las mismas 231 tareas usadas durante el desarrollo y sin mitad sellada, por lo que pueden estar ligeramente infladas y no equivalen a una puntuacion de leaderboard.
- El modelo no registra descargas ni likes en el momento de la consulta (0 y 0), lo que indica poca adopcion o validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/alxnahas/strands-decider-v21-webgpu
- Modelo base de la adaptacion: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v21
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio del motor WebGPU: https://github.com/alxnahas/strands-decider-web
- Demo en vivo: https://alxnahas.github.io/strands-decider-web/
- Modelo relacionado (bloque lineal identico): https://huggingface.co/alxnahas/strands-decider-1B-v21-pruned
