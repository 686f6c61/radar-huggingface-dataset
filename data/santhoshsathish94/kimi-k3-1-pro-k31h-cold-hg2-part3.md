# Santhoshsathish94/Kimi-K3.1-Pro-K31H-Cold-HG2-Part3

## Resumen

Kimi-K3.1-Pro-K31H-Cold-HG2-Part3 es un repositorio de pesos parciales derivado del modelo base `moonshotai/Kimi-K3.1-Pro`, un modelo MoE de aproximadamente 2,8 billones de parametros desarrollado por Moonshot AI. Este repositorio concreto, publicado por el usuario Santhoshsathish94, no contiene el modelo completo, sino un fragmento de expertos enrutados en frio (*cold routed experts*) correspondiente a las capas 63 a 92, empaquetados en un formato de cuantizacion propietario denominado `HG2-16R` a 2,25 bits por peso.

El artefacto forma parte de una distribucion en tres partes del estado de expertos, pensada para ser combinada con el repositorio del tronco caliente (*hot trunk*) y el modulo `5L-DSpark`, publicado por el mismo autor. El objetivo declarado es permitir la carga selectiva de expertos mediante streaming desde disco con `pread + GEMV` y 16 hilos OpenMP, usando `POSIX_FADV_DONTNEED` para evitar que la cache de pagina retenga bloques ya consumidos. Se trata, por tanto, de una pieza de infraestructura de inferencia mas que de un modelo listo para usar.

Su relevancia es limitada fuera de ese contexto: no es un modelo autonomo, no incluye tokenizer, configuracion ni tronco de atencion, y su utilidad depende de la existencia y correcta alineacion de las otras dos partes. La licencia declarada es MIT, heredada del repositorio, aunque el modelo base puede tener condiciones adicionales que conviene verificar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de `moonshotai/Kimi-K3.1-Pro`; este repositorio solo contiene expertos enrutados en frio de las capas 63-92 |
| Parametros totales | ~2,8 billones (modelo base completo); el shard contiene 854 expertos en frio por capa en 30 capas |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `HG2-16R` a 2,25 bits por peso (Hadamard-Grouped, 16 filas, empaquetado propietario); no compatible con GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT (segun metadatos del repositorio) |
| Formato de pesos | `.hg2` (formato propietario del autor); tamano del repo 202,6 GB |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro es un transformer con mezcla de expertos (MoE) de escala frontier, con aproximadamente 2,8 billones de parametros totales. Este repositorio no documenta la arquitectura interna del modelo base ni los detalles de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF o DPO); la model card se limita a describir el formato de empaquetado del shard.

La innovacion tecnica documentada es el formato `HG2-16R`: los 854 expertos en frio de cada capa se agrupan en bloques de 16 filas y se transforman con una matriz de Hadamard antes de cuantizar a 2,25 bits. El resultado se empaqueta para que un kernel GEMV de 16 carriles pueda leer directamente desde disco con `pread` bajo OpenMP, marcando las paginas con `POSIX_FADV_DONTNEED` para liberar cache tras cada lectura. Este diseno esta orientado a servir modelos de escala billonaria en maquinas con RAM insuficiente para mantener todos los expertos residentes, a costa de una latencia dominada por el almacenamiento.

No se documenta en la informacion disponible ninguna fase de entrenamiento o ajuste adicional sobre este shard: es un artefacto de conversion y empaquetado, no un fine-tuning.

## Capacidades

- No es un modelo autonomo: no puede generar texto, razonar ni ejecutar codigo por si solo.
- Aporta los pesos de los expertos enrutados en frio de las capas 63 a 92 del modelo base Kimi-K3.1-Pro.
- Habilita la carga selectiva de expertos por streaming desde disco en pipelines de inferencia MoE personalizados.
- Requiere combinarse con el repositorio `Kimi-K3.1-Pro-K31H-Hot-HG4-OP` (tronco caliente) y el modulo `5L-DSpark` para reconstruir el estado completo.
- Capacidades de tool calling, agentes, vision, audio o modo *thinking*: no disponibles en este repositorio (dependen del modelo base y de su runtime).
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en cuantizacion extrema: permite estudiar el impacto de 2,25 bits por peso en expertos enrutados en frio de un MoE de escala frontier, comparando la calidad de salida frente a los pesos originales del modelo base.
- Despliegue de MoE de gran escala con memoria limitada: el formato `HG2-16R` esta disenado para servir expertos desde NVMe con `pread` y OpenMP, lo que permite ejecutar el modelo en nodos con RAM muy inferior a los 202,6 GB del shard.
- Desarrollo de kernels GEMV: sirve como banco de pruebas para implementar y optimizar kernels de 16 carriles con decodificacion Hadamard y gestion de cache de pagina.
- Reconstruccion del modelo completo: junto con la parte *hot* y el modulo `5L-DSpark`, permite montar una instancia funcional del modelo para evaluacion interna.
- Auditoria de artefactos comunitarios: util para verificar la integridad y la reproducibilidad de conversiones de pesos publicadas por terceros antes de integrarlas en un pipeline.
- Benchmarking de almacenamiento: mide el throughput real de `pread` con `POSIX_FADV_DONTNEED` en distintos tipos de NVMe y sistemas de ficheros bajo cargas de inferencia MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 202,6 GB solo para este shard; el conjunto completo (tronco caliente, este shard y `5L-DSpark`) requiere bastante mas espacio.
- VRAM/RAM: no disponible de forma explicita; el diseno asume que los expertos en frio no residen en memoria y se leen bajo demanda desde disco.
- GPU recomendadas: no disponibles en la informacion proporcionada; el cuello de botella declarado es el almacenamiento, no la GPU.
- GPU de consumo: no confirmado; el formato propietario `.hg2` no es compatible con llama.cpp, Ollama ni otras herramientas estandar, por lo que no se puede desplegar en GPUs de consumo sin un runtime propio.
- Opciones de despliegue: exclusivamente el runtime del autor (kernel GEMV de 16 carriles con OpenMP y `pread`); no hay soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles; dependen del subsistema de disco y del numero de expertos activados por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-K31H-Cold-HG2-Part3 (este repo) | ~2,8 B (base); shard de expertos capas 63-92 | no disponible | `.hg2` propietario, 2,25 bits | MIT | Hugging Face, 0 descargas |
| `moonshotai/Kimi-K3.1-Pro` (base) | ~2,8 B | no disponible | safetensors (presumiblemente) | no disponible en esta ficha | Hugging Face |
| `Santhoshsathish94/Kimi-K3.1-Pro-K31H-Hot-HG4-OP` | tronco caliente del mismo modelo | no disponible | `.hg4` propietario | MIT (segun metadatos) | Hugging Face |

No se dispone de datos de rendimiento ni de modelos comparables de terceros con formato equivalente en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autonoma: sin el tronco caliente y el modulo `5L-DSpark` no produce salida.
- Formato propietario `.hg2` sin soporte en herramientas estandar; requiere el runtime del autor, lo que genera dependencia de un unico mantenedor.
- La cuantizacion a 2,25 bits puede degradar la calidad de forma significativa; no se han publicado evaluaciones que lo cuantifiquen.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de que la conversion sea correcta.
- El autor es un particular (Santhoshsathish94), no Moonshot AI; no hay garantia de fidelidad respecto a los pesos originales.
- La licencia MIT declarada en los metadatos puede no reflejar las condiciones del modelo base `moonshotai/Kimi-K3.1-Pro`; verificar antes de uso comercial.
- Riesgo de alucinacion, sesgos y limitaciones idiomaticas: no evaluables en este repositorio, dependen del modelo base.
- La fecha de creacion (2026-11-24) y el tamano del repo sugieren un artefacto reciente y poco probado en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Santhoshsathish94/Kimi-K3.1-Pro-K31H-Cold-HG2-Part3
- Repositorio del tronco caliente: https://huggingface.co/Santhoshsathish94/Kimi-K3.1-Pro-K31H-Hot-HG4-OP
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
