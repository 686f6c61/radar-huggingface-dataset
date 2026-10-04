# autotrust/GLM-5.3-GGUF-DGX-Spark

## Resumen

GLM-5.3-GGUF-DGX-Spark es una compilacion en formato GGUF para llama.cpp del checkpoint comprimido autotrust/GLM-5.3-SLIM-E192, publicado por AutoTrust AI Lab. Se trata de una version del modelo MoE GLM 5.3 de Z.AI (744B parametros en su version original) a la que se ha aplicado SLIM-Q, la receta de compresion en dos etapas del autor: poda estructural de expertos (SLIM) seguida de cuantizacion de bajo bit (Q). El resultado es un fichero GGUF de 149,7 GiB repartido en cuatro shards, con arquitectura glm-dsa y soporte en el llama.cpp upstream.

La propuesta de valor es de tipo estructural, no solo de cuantizacion. El pipeline elimina permanentemente 64 de los 256 expertos enrutados por capa (25 %) en las 78 capas del modelo, de modo que la huella de pesos se reduce en 47 GiB (24 %) frente al GLM 5.3 Q2 completo con la misma receta de cuantizacion. El router sigue activando top-8 de los 192 expertos restantes, por lo que el coste computacional y el trafico de memoria por token no cambian: solo baja el espacio ocupado en disco y en VRAM. El autor reporta que el checkpoint FP8 podado mantiene HumanEval (95,1), CyberMetric (87,7) y BFCL (69,4 en live, 72,5 en multi-turno), con la perdida concentrada en benchmarks de conocimiento tipo examen chino.

Es relevante ahora porque permite servir un MoE de escala casi trillonaria en hardware de gama alta pero no de centro de datos: dos DGX Spark enlazadas por ConnectX-7 (unos 75 GiB de pesos por maquina), una GPU unica de 180 GB (B200/GB200) o un Mac Studio de 256 GB. El repositorio acumula 4691 descargas y 22 likes, y es una de las pocas implementaciones publicas de poda de expertos mas cuantizacion agresiva aplicada a un modelo de mas de 500B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm-dsa) sobre transformer decoder; 78 capas; mezcla de expertos enrutados + expertos compartidos |
| Parametros totales | 562.687.789.632 (~563B) segun los metadatos safetensors del repositorio |
| Parametros activos | no disponible; el router activa top-8 de los 192 expertos enrutados que quedan por capa tras la poda (configuracion original: top-8 de 256) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue del autor arranca llama-server con `-c 32768` |
| Tipos de cuantizacion | IQ2_XXS (2,06 bits/peso en expertos enrutados) con Q8_0 en atencion, routers y expertos compartidos; el build de produccion Turbo 2.0 usa NVFP4 |
| Idiomas soportados | en, zh |
| Licencia | other, license_name: glm-5.3 (enlace a la licencia de zai-org/GLM-5.3) |
| Formato de pesos | GGUF en 4 shards (`GLM-5.3-Q2-DGX-Spark-00001-of-00004.gguf` a `-00004-of-00004.gguf`), 149,7 GiB en total; checksums en `GLM-5.3-Q2-DGX-Spark.sha256` |

Datos adicionales del repositorio: pipeline text-generation, creado el 2026-09-20, actualizado el 2026-09-21, tamano del repo 160,8 GB, tags `endpoints_compatible`, `conversational`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con mezcla de expertos (MoE) de la familia glm-dsa, con 78 capas segun la configuracion de despliegue publicada (`--tensor-split 1,1` reparte aproximadamente la mitad de las capas en cada DGX Spark). El modelo base, zai-org/GLM-5.3, tiene 744B parametros y 256 expertos enrutados por capa con activacion top-8. Sobre ese checkpoint, AutoTrust aplica SLIM-Q, un pipeline de compresion post-entrenamiento en dos etapas. La etapa SLIM perfila las frecuencias de enrutamiento sobre cargas representativas y elimina estructuralmente los 64 expertos menos usados de cada capa, reduciendo el modelo de 744B a la variante SLIM-E192. La etapa Q cuantiza de forma agresiva unicamente los expertos enrutados, dejando atencion, routers y expertos compartidos en alta precision para preservar el comportamiento de enrutamiento del que depende la calidad del MoE.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otro ajuste de alineamiento, ni en el modelo original ni en el checkpoint comprimido. La innovacion tecnica destacable es la doble esparsidad (activacion top-8 x poda del pool de expertos) combinada con bajo bit-width: el autor senala que la investigacion publicada de poda de expertos mas cuantizacion se queda en torno a modelos de 50B parametros, mas de un orden de magnitud por debajo de este caso. La cuantizacion IQ2_XXS aplicada es de 2,06 bits por peso en expertos enrutados, con Q8_0 en el resto, y el build de produccion (Guru Turbo 2.0) usa NVFP4 en lugar de IQ2_XXS.

## Capacidades

- Generacion de texto conversacional en ingles y chino (pipeline text-generation, tag `conversational`).
- Generacion de codigo: el checkpoint FP8 podado mantiene HumanEval en 95,1, identico al modelo original.
- Razonamiento matematico: el autor reporta una perdida de 2,5 puntos en AIME respecto al original, sin publicar los valores absolutos.
- Tool calling / function calling: evaluado en BFCL (Berkeley Function Calling Leaderboard) en su modalidad live (69,4) y multi-turno (72,5).
- Comportamiento agentico multi-paso: la puntuacion de BFCL multi-turno indica capacidad de encadenar llamadas a herramientas en conversaciones de varios turnos.
- Ciberseguridad: CyberMetric 87,7 en la base podada, uno de los objetivos de diseno explicitos de la receta de poda.
- Conocimiento general y de tipo examen: GPQA-Diamond 83,3 y C-Eval 84,7 en la base podada (con degradacion respecto al original).
- Compatibilidad con endpoints: el repositorio esta etiquetado como `endpoints_compatible`.
- Capacidades multimodales: no disponibles en este repositorio; GLM-5.3-Flash es descrito como multimodal nativo en una de las noticias, pero esta build es text-generation.
- Modo thinking explicito: no documentado en la informacion disponible.

## Casos de uso

- Asistencia de programacion en local: con HumanEval en 95,1 en la base podada, el modelo puede emplearse como copiloto de codigo dentro de la red corporativa, sin enviar codigo propietario a APIs externas, desplegado en dos DGX Spark o en un B200.
- Agentes con herramientas en produccion: sus resultados en BFCL live (69,4) y multi-turno (72,5) lo hacen util para orquestar APIs, consultas a bases de datos y flujos multi-paso donde el agente debe decidir que herramienta invocar y en que orden.
- Analisis de seguridad y ciberseguridad: CyberMetric 87,7 permite usarlo para triaje de vulnerabilidades, resumen de informes tecnicos de seguridad y clasificacion de indicadores, un caso donde la perdida de poda es minima (0,3 puntos).
- Atencion al cliente bilingue ingles-chino: soporta conversaciones multi-turno en ambos idiomas, y su despliegue en hardware propio evita costes por token en volumenes altos de consultas.
- Procesamiento por lotes en una GPU de 180 GB: en B200/GB200 el modelo alcanza 177 t/s agregados con 32 peticiones en paralelo, adecuado para pipelines de enriquecimiento de documentos, generacion masiva de resumenes o clasificacion a gran escala.
- Investigacion en entornos air-gapped: un Mac Studio de 256 GB o dos DGX Spark permiten ejecutar el modelo sin conectividad externa, util en laboratorios con requisitos de confidencialidad estrictos.
- Evaluacion de tecnicas de compresion: el repositorio sirve como referencia reproducible de poda estructural de expertos mas cuantizacion IQ2_XXS sobre un MoE de mas de 500B parametros, con los checksums publicados.
- Razonamiento matematico asistido: con una perdida de 2,5 puntos en AIME, sigue siendo apto para resolucion de problemas donde se tolere ese margen, por ejemplo verificacion de calculos o generacion de problemas de practica.
- Backend de asistentes con contexto de 32K: la configuracion de referencia usa `-c 32768` con `--cont-batching`, suficiente para conversaciones largas o documentos extensos en una ventana de trabajo.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a una comparacion A/B (A/B bajo vLLM) del checkpoint FP8 podado frente al GLM 5.3 original. No son mediciones del fichero GGUF IQ2_XXS de este repositorio.

| Benchmark | GLM 5.3 original | GLM-5.3-SLIM-E192 (base FP8 podada) | Delta |
|---|---|---|---|
| HumanEval | 95,1 | 95,1 | 0,0 |
| CyberMetric | 88,0 | 87,7 | −0,3 |
| BFCL live | 69,6 | 69,4 | −0,2 |
| BFCL multi-turn | 73,0 | 72,5 | −0,5 |
| AIME | no disponible | no disponible | −2,5 pt |
| C-Eval | 92,0 | 84,7 | −7,3 |
| GPQA-Diamond | 86,9 | 83,3 | −3,6 |

Rendimiento medido de inferencia (build GGUF, GPU de 180 GB tipo B200/GB200, residente): 42 t/s en un unico stream y 177 t/s agregados con 32 peticiones en paralelo. En un unico DGX Spark de 128 GB con mmap el autor indica "low single-digit t/s" (unidades bajas por segundo). No se han publicado resultados de benchmarks del propio fichero IQ2_XXS.

## Requisitos de hardware

- VRAM/almacenamiento: 149,7 GiB de pesos en cuatro shards GGUF. En la configuracion de dos DGX Spark, unos 75 GiB de pesos por maquina y unos 40 GiB por maquina libres para contexto y buffers.
- Dos DGX Spark (128 GB cada una) enlazadas por ConnectX-7: configuracion prevista para este fichero, con llama.cpp RPC y `--tensor-split 1,1`. Solo las activaciones cruzan el enlace, por lo que los 200 GbE de ConnectX no son el cuello de botella; la decodificacion esta limitada por ancho de banda de memoria (unos 25 GB de pesos por token). Requiere copiar el fichero en el NVMe de ambas maquinas o en almacenamiento compartido.
- Una GPU unica de 180 GB (B200 / GB200): residencia completa, 42 t/s en un stream y 177 t/s con 32 peticiones concurrentes (medido).
- Mac Studio de 256 GB (192 GB con contexto pequeno): residencia completa con Metal, en la misma clase que el GLM 5.3 Q2 completo en el mismo equipo.
- Un unico DGX Spark de 128 GB: funciona con mmap y residencia parcial, pero lento (unidades bajas de t/s); el autor recomienda para ese caso GLM-5.3-Flash-GGUF-DGX-Spark (79 GiB).
- Cabe en GPU de consumo: no. El fichero de 149,7 GiB excede la VRAM de cualquier GPU consumer actual (RTX 4090 24 GB, RTX 5090 32 GB).
- Opciones de despliegue: llama.cpp upstream con soporte de la arquitectura glm-dsa (`cmake -B build -DGGML_CUDA=ON -DGGML_RPC=ON -DCMAKE_CUDA_ARCHITECTURES=121a-real`), `llama-server` con `-ngl 99 -fa on -np 2 --cont-batching`, y `rpc-server` para el reparto entre dos maquinas. El build de produccion Turbo 2.0 se sirve en NVFP4, presumiblemente mediante vLLM.
- Latencia y throughput: los unicos datos concretos son los 42 t/s (stream unico) y 177 t/s (32 peticiones) en B200/GB200. No hay datos de latencia por token ni de tiempo a primer token. En DGX Spark unica con mmap, el autor solo califica el rendimiento como "lento" (unidades bajas de t/s).

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autotrust/GLM-5.3-GGUF-DGX-Spark | ~563B (metadatos) | GGUF IQ2_XXS, 149,7 GiB en 4 shards | no disponible (ejemplo con 32768) | other / glm-5.3 | 4691 descargas, 22 likes |
| autotrust/GLM-5.3-Flash-GGUF-DGX-Spark | no disponible | GGUF, 79 GiB | no disponible | no disponible | disponible en HuggingFace |
| nvidia/GLM-5.3-NVFP4 | 391B | NVFP4 | no disponible | no disponible | 24,9k descargas, 31 likes |
| zai-org/GLM-5.3 (original) | 744B | safetensors (base del A/B en FP8) | no disponible | glm-5.3 | modelo base original |
| GLM 5.3 Q2 completo (misma receta) | no disponible | GGUF, 196,7 GiB implicito (149,7 + 47 GiB) | no disponible | glm-5.3 | referenciado en la model card |

La ventaja declarada de esta build frente al GLM 5.3 Q2 completo con la misma receta de cuantizacion es de 47 GiB menos (24 %), lo que marca la diferencia entre requerir un despliegue de clase 200 GB y caber completamente residente en dos DGX Spark. Frente a nvidia/GLM-5.3-NVFP4, esta build esta pensada para llama.cpp y hardware unico o Spark, mientras que NVFP4 apunta a despliegues con aceleracion FP4.

## Limitaciones y advertencias

- La licencia es "other" con license_name glm-5.3. Las condiciones exactas de uso comercial no se detallan en la informacion proporcionada y remiten al fichero LICENSE del modelo base; hay que revisarlas antes de cualquier despliegue en produccion.
- Los benchmarks publicados corresponden al checkpoint FP8 podado evaluado bajo vLLM, no al fichero GGUF IQ2_XXS de este repositorio. La cuantizacion a 2,06 bits por peso en los expertos enrutados puede degradar la calidad respecto a esas cifras, y no hay mediciones del GGUF para confirmarlo.
- La poda se cobra un precio medible en conocimiento general y de tipo examen: C-Eval baja 7,3 puntos (92,0 a 84,7) y GPQA-Diamond 3,6 puntos (86,9 a 83,3). El perfil de poda esta sesgado deliberadamente hacia cargas de codigo, agentes y ciberseguridad.
- Perdida de 2,5 puntos en AIME segun el autor, sin valores absolutos publicados.
- Solo se declaran los idiomas ingles y chino. No hay evidencia de rendimiento en castellano ni en otras lenguas.
- La model card proporcionada esta truncada ("the author has n..."), por lo que puede faltar informacion sobre licencia, limitaciones o configuracion adicional.
- No se documentan sesgos conocidos, tasas de alucinacion, procesos de alineamiento ni evaluaciones de seguridad del modelo.
- El despliegue no es trivial: requiere compilar llama.cpp con soporte CUDA y RPC, distribuir 149,7 GiB entre dos maquinas y arrancar un worker RPC antes del servidor. En un unico DGX Spark con mmap el rendimiento cae a unidades bajas de t/s.
- El modelo no cabe en ninguna GPU de consumo; su uso practico exige hardware de 180 GB o un Mac Studio de 256 GB, o bien el cluster de dos DGX Spark.
- No se especifica la longitud de contexto maxima del modelo; el unico dato es el `-c 32768` del ejemplo de arranque, que es una eleccion de configuracion y no necesariamente el limite del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/GLM-5.3-GGUF-DGX-Spark
- Checkpoint base comprimido: https://huggingface.co/autotrust/GLM-5.3-SLIM-E192
- Modelo original de Z.AI: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Perfil del autor (AutoTrust AI Lab): https://huggingface.co/autotrust
- Build alternativa para un unico DGX Spark (79 GiB): https://huggingface.co/autotrust/GLM-5.3-Flash-GGUF-DGX-Spark
- Build NVFP4 de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-NVFP4
- Listado de modelos cuantizados de zai-org/GLM-5.3: https://huggingface.co/models?other=base_model%3Aquantized%3Azai-org%2FGLM-5.3
- Repositorio de llama.cpp (soporte de la arquitectura glm-dsa): https://github.com/ggml-org/llama.cpp
- Perfil de Aevonix Research (cluster de DGX Spark y receta Blocks of Experts de AutoTrust): https://x.com/Kurcide

No se han encontrado en la busqueda web papers tecnicos de SLIM-Q, blogs de ingenieria del autor ni demos publicas adicionales de este checkpoint.
