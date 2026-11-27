# alllwang/sn120-head-f746e16e

## Resumen

SN120-head-f746e16e es un artefacto de pesos publicado en Hugging Face por el usuario alllwang, correspondiente a la "cabeza M" (head M) del proyecto Affine, identificado como la subred 120 (SN120) de Bittensor, en su version v2 y con fecha de referencia 2026-11-26. No se trata de un modelo fundacional entrenado de cero ni de un modelo conversacional al uso, sino de un conjunto de pesos derivados que incluye una base en bf16, un master en fp32 y una LoRA, junto con un snapshot del contrato de mineria (`mining.json`, ronda r000142) con el que se descargo y verifico frente al manifiesto de la cabeza.

El repositorio ocupa 56,5 GB y contiene tres componentes principales: el directorio `base/` con los ficheros en bf16 (con hash `f746e16e63a7...`), el directorio `fp32_master/` con el master en precision completa (digest `23bdf4708c92...`) y los metadatos de mineria. La construccion de un candidato se realiza mediante la formula `bf16(fp32 master + scale * B @ A)`, que combina el master en fp32 con una actualizacion de bajo rango (LoRA) y cuantiza el resultado a bf16 para su uso. Segun la model card, estos pesos se emplean como punto de partida (M0) del experimento EXP-038.

La relevancia de esta ficha es acotada: se trata de un checkpoint de infraestructura para un pipeline de mineria en Bittensor, no de un modelo para uso general. No hay informacion publica sobre arquitectura, parametros, contexto, licencia ni idiomas, y el numero de descargas y likes es cero en el momento de la consulta. Cualquier evaluacion de capacidades o de rendimiento es, por tanto, imposible con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (base), fp32 (master); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repo); directorios `base/` en bf16 y `fp32_master/` en fp32 |
| Tamano del repositorio | 56,5 GB |
| Version de cabeza (head version_id) | `aee5067f7bc7619da2fc3ca62e89ce30299bac16698d77b9f9da877b90ab003e` |
| Hash de la base | `f746e16e63a750fb7d07fefce9d166c0d06b92f2d6d634efc36e05aca0e0c1bf` |
| Digest del master fp32 | `23bdf4708c92050fbda898a2810f6bc85fd0307f0d658519478191c4ea0121ad` |
| Ronda de mineria | r000142 (mining.json, snapshot 2026-11-26) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente (tipo de transformer, numero de capas, dimensiones ocultas, atencion, etc.). Lo unico documentado es el procedimiento de composicion de pesos: existe un master en fp32 sobre el que se aplica una actualizacion de bajo rango parametrizada por las matrices A y B y un factor `scale`, y el resultado se convierte a bf16 mediante la funcion `sn120_v2.gpu.merged.build_candidate_base(master_dir, base_dir, lora_dir, rank, out_dir)`. Este esquema es propio de tecnicas de adaptacion tipo LoRA o de fusion de deltas de pesos, habituales en pipelines de mineria donde distintos participantes proponen actualizaciones que se agregan o verifican contra un manifiesto.

El proceso de entrenamiento, la composicion del dataset, el numero de tokens vistos y la posible aplicacion de RLHF o DPO no estan documentados en la informacion proporcionada. La referencia a "mining.json" y a una ronda concreta (r000142) sugiere que el checkpoint procede de un ciclo de mineria descentralizada en la subred 120 de Bittensor, pero no se detalla el mecanismo de evaluacion ni la funcion de recompensa utilizada. Tampoco se indica si el modelo base sobre el que se aplica la LoRA es publico o propietario.

## Capacidades

- No se documentan capacidades funcionales del modelo en la model card.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes o razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se indica si dispone de modo de razonamiento (thinking mode), vision, audio u otras modalidades.
- La unica funcionalidad verificable es la de servir como punto de partida (M0) para el experimento EXP-038 y como artefacto reproducible con hashes y digests verificables.

## Casos de uso

- Reproduccion de experimentos de mineria: el repositorio incluye hashes de base y master, lo que permite verificar que los pesos descargados coinciden con el manifiesto de la cabeza y reproducir el estado exacto de la ronda r000142.
- Punto de partida para fine-tuning con LoRA: la estructura `fp32_master/` mas `base/` esta disenada para aplicar una actualizacion `scale * B @ A` y generar un candidato en bf16, de modo que un investigador puede partir de este checkpoint para entrenar su propia adaptacion y comparar contra el estado M0 de EXP-038.
- Auditoria de integridad de pesos: los digests SHA-256 publicados permiten comprobar en pipelines de CI que los artefactos no han sido alterados durante la descarga o el almacenamiento.
- Investigacion sobre agregacion de modelos en Bittensor: util para estudiar como se combinan deltas de pesos entre participantes de la subred 120 y como se valida un candidato frente al manifiesto de la cabeza.
- Base para evaluacion comparativa interna: si el equipo dispone del modelo subyacente y de su tokenizador, este checkpoint puede emplearse como referencia M0 en una bateria de evaluacion propia, aunque las capacidades del modelo no esten documentadas publicamente.
- Archivado y trazabilidad de rondas de mineria: el snapshot `meta/mining.json` y el `version_id` de la cabeza permiten reconstruir el contexto contractual de la ronda, util para auditorias posteriores o para reclamaciones sobre evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que se desconoce el numero de parametros. Como referencia orientativa, el repositorio ocupa 56,5 GB e incluye copias en bf16 y fp32, por lo que el peso en disco no equivale al de una unica copia en memoria.
- GPU recomendadas: no disponible. La funcion de construccion de candidatos (`sn120_v2.gpu.merged.build_candidate_base`) sugiere ejecucion en GPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. Sin conocer el tamano del modelo no puede determinarse si cabe en una RTX 4090 (24 GB) u otras tarjetas consumer.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El unico tooling mencionado es el paquete `sn120_v2` (`sn120_v2.replicate fetch`, `sn120_v2.gpu.merged.build_candidate_base`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (artefactos de cabeza de mineria en subredes de Bittensor) ni se dispone de datos de parametros, contexto o rendimiento para establecer una comparacion con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, parametros, contexto, idiomas y licencia: no es posible evaluar el modelo para uso en produccion ni determinar si su uso comercial esta permitido.
- La licencia no esta declarada, lo que impide asumir permisos de uso, redistribucion o modificacion; en ausencia de licencia explicita, los derechos quedan reservados por defecto en muchas jurisdicciones.
- El repositorio contiene pesos derivados (master fp32 mas LoRA) y no un modelo listo para inferencia directa con un tokenizador o configuracion documentados; su uso requiere el paquete `sn120_v2` y conocimiento del pipeline de mineria.
- Riesgo de alucinacion y sesgos: no evaluable sin acceso al modelo subyacente y sin datos de entrenamiento.
- El checkpoint esta vinculado a una ronda concreta (r000142) y a una version de cabeza especifica; los resultados pueden no ser validos fuera de ese contexto contractual.
- El tamano del repositorio (56,5 GB) y la presencia de copias en fp32 y bf16 implican requisitos de almacenamiento y de ancho de banda considerables para su descarga y verificacion.
- No hay senales de uso, descargas ni validacion por parte de la comunidad (0 descargas, 0 likes), lo que reduce la confianza en su calidad o mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alllwang/sn120-head-f746e16e
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
