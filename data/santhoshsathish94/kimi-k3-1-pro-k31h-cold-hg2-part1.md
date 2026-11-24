# Santhoshsathish94/Kimi-K3.1-Pro-K31H-Cold-HG2-Part1

## Resumen

Kimi-K3.1-Pro-K31H-Cold-HG2-Part1 es un repositorio de pesos parciales derivado de `moonshotai/Kimi-K3.1-Pro`, un modelo de mezcla de expertos (MoE) de 2,8 billones de parametros. Lo publica el usuario Santhoshsathish94 bajo licencia MIT y no se trata de un modelo autonomo, sino de la primera de tres particiones de los expertos "frios" (cold experts) del modelo base, empaquetados en un formato de cuantizacion propietario denominado `HG2-16R` a 2,25 bits por peso.

El repositorio contiene exclusivamente los ficheros `experts_cold_01.hg2` a `experts_cold_31.hg2`, que cubren las capas 1 a 31 del modelo, con 854 expertos frios por capa empaquetados en un formato de 16 filas con transformada de Hadamard agrupada. Segun la model card, estos pesos estan disenados para streaming mediante `pread + GEMV` con 16 carriles OpenMP y `POSIX_FADV_DONTNEED`, lo que sugiere un diseno orientado a inferencia con memoria mapeada y desalojo de cache controlado.

La relevancia de esta publicacion es acotada: no es un modelo entrenado ni afinado de forma independiente, sino un artefacto de distribucion de pesos que requiere combinarse con el repositorio complementario del trunk y los expertos "calientes" (`Kimi-K3.1-Pro-K31H-Hot-HG4-OP`) para poder ejecutarse. El tamano del repositorio, 202,6 GB, corresponde unicamente a esta particion de expertos frios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de `moonshotai/Kimi-K3.1-Pro`; formato de empaquetado `HG2-16R` con transformada de Hadamard agrupada en 16 filas |
| Parametros totales | 2,8 billones (2.8T) segun la model card del modelo base citado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2,25 bits por peso en formato `HG2-16R` (16-row Hadamard-Grouped); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.hg2` (formato propietario de empaquetado de expertos); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El artefacto no contiene informacion sobre el entrenamiento del modelo base. La model card describe unicamente el esquema de empaquetado: los expertos frios de las capas 1 a 31 se almacenan en ficheros `.hg2` con 854 expertos por capa, cuantizados a 2,25 bits mediante una transformada de Hadamard agrupada en bloques de 16 filas (`HG2-16R`). Este esquema busca reducir el coste de memoria de los expertos menos activados y permitir su carga bajo demanda.

El diseno de streaming indicado (`pread + GEMV` con 16 carriles OpenMP y `POSIX_FADV_DONTNEED`) apunta a una estrategia de inferencia en la que los expertos frios se leen desde disco y se procesan en GPU o CPU sin mantenerlos residentes en memoria, liberando pagina cache tras cada uso. No se especifican datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO) para el modelo base en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base `moonshotai/Kimi-K3.1-Pro`, si bien no se detallan en la informacion disponible.
- Codigo y matematicas: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio esta vacio).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

Nota: este repositorio no es ejecutable por si solo; las capacidades efectivas dependen del trunk y de los expertos calientes alojados en el repositorio complementario.

## Casos de uso

- Distribucion de pesos en entornos con memoria limitada: el formato `HG2-16R` a 2,25 bits permite almacenar los expertos frios de 31 capas en 202,6 GB, lo que facilita su transporte y despliegue en nodos con menos VRAM que la requerida por el modelo completo en precision original.
- Inferencia con streaming desde disco: el esquema `pread + GEMV` con `POSIX_FADV_DONTNEED` esta pensado para servir expertos frios bajo demanda, adecuado para despliegues en los que no es viable mantener todos los expertos residentes en memoria.
- Investigacion sobre cuantizacion extrema: sirve como referencia para estudiar el impacto de 2,25 bits por peso con transformada de Hadamard en la calidad de un MoE de gran escala.
- Experimentacion con offloading de expertos: util para validar estrategias de cache y desalojo en pipelines de inferencia MoE con expertos frios y calientes separados.
- Replicacion de despliegues del modelo base: junto con el repositorio Hot-HG4-OP, permite reconstruir un checkpoint funcional de Kimi-K3.1-Pro en formato cuantizado.
- Benchmarking de formatos de compresion: comparar `HG2-16R` frente a otros esquemas de cuantizacion (GGUF, AWQ, GPTQ) en terminos de tamano, latencia y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo completo; esta particion ocupa 202,6 GB en disco y requiere los repositorios complementarios (trunk y expertos calientes) para ejecutarse.
- GPU recomendadas: no disponible. El diseno de streaming con `pread` y OpenMP sugiere que parte del procesamiento puede recaer en CPU, pero no se especifican modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible; el tamano del artefacto (202,6 GB solo para expertos frios de 31 capas) hace inviable su residencia completa en GPU de consumo.
- Opciones de despliegue: el formato `.hg2` es propietario y no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible; requiere el runtime asociado al esquema `HG2-16R`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-K31H-Cold-HG2-Part1 (este) | 2,8T (MoE, parcial: expertos frios capas 1-31) | no disponible | MIT | `.hg2` (2,25 bits) | Repositorio parcial, requiere trunk y expertos calientes |
| moonshotai/Kimi-K3.1-Pro (modelo base) | 2,8T (MoE) | no disponible | no disponible | no disponible | Modelo base referenciado |
| Santhoshsathish94/Kimi-K3.1-Pro-K31H-Hot-HG4-OP | no disponible | no disponible | MIT (segun tags del autor) | `.hg4` (formato caliente) | Repositorio complementario |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo autonomo: sin el trunk y los expertos calientes del repositorio complementario no puede ejecutarse.
- El formato `.hg2` es propietario y no cuenta con soporte documentado en frameworks estandar de inferencia.
- No se especifican sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma del modelo base en la informacion disponible.
- La licencia MIT se aplica a este artefacto de pesos, pero el modelo base `moonshotai/Kimi-K3.1-Pro` puede tener condiciones adicionales no reflejadas aqui; conviene verificar la licencia del modelo base antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La cuantizacion a 2,25 bits puede degradar la calidad respecto al modelo en precision original; no se aportan metricas que lo cuantifiquen.
- No se detallan requisitos de hardware ni procedimientos de verificacion de integridad de los ficheros `.hg2`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Santhoshsathish94/Kimi-K3.1-Pro-K31H-Cold-HG2-Part1
- Repositorio complementario (trunk y expertos calientes): https://huggingface.co/Santhoshsathish94/Kimi-K3.1-Pro-K31H-Hot-HG4-OP
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
