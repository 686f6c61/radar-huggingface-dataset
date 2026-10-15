# anhdao69/M1_training

# anhdao69/M1_training — estado de entrenamiento intermedio de SimpleMemVLN (brazo M1)

## Resumen

`anhdao69/M1_training` no es un modelo publicado para inferencia, sino un **checkpoint completo de entrenamiento** (DeepSpeed ZeRO-2) de la campaña de investigación *episodic-memory*, brazo M1, del proyecto SimpleMemVLN. Concretamente se publica el estado en torno a la actualización 3.142 de 3.852 (final de la época 1) del intento `P1-M1-s429-H2-a2`, junto a los ficheros de estado del optimizador, el scheduler, el estado RNG, el contrato de reanudación y el manifiesto de datos. El objetivo declarado es permitir **continuar el entrenamiento en otra máquina** sin perder el estado exacto del run.

El modelo parte de **Qwen3.5-4B** (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y se entrena con el código `SimpleMemVLN` sobre el manifiesto conjunto R2R + RxR15 (inglés), con 30.815 episodios y 3.128.624 pasos. Se trata, por tanto, de un modelo de **navegación vision-lenguaje (VLN)** con memoria episódica, no de un modelo conversacional de propósito general: la variante M1 usa 9 grupos recientes (R = 9) y ningún banco episódico (B = 0).

Su relevancia es fundamentalmente de reproducibilidad: el repositorio empaqueta pesos, optimizador, scheduler, orden del sampler, semillas y configuración resuelta con hashes SHA-256, imponiendo invariantes estrictas (exactamente 2 GPU H100 80 GB, acumulación 4). Con 141,7 GB de tamaño, 0 descargas y 0 *likes* en el momento de la consulta, es material de investigación interna más que un artefacto de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; el checkpoint deriva del modelo base Qwen3.5-4B y se entrena con el modulo `qwen_vl.train.train_qwen` (pipeline vision-lenguaje) |
| Parametros totales | No disponible de forma explicita; el modelo base es Qwen3.5-4B |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en precision de entrenamiento (`pytorch_model.bin`) |
| Idiomas soportados | No disponibles como listado oficial; el manifiesto de entrenamiento usa instrucciones en ingles (R2R + RxR15 en ingles) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | PyTorch bin (`pytorch_model.bin`) dentro de checkpoints DeepSpeed ZeRO-2 con estado completo por rango |

## Arquitectura y entrenamiento

El checkpoint pertenece a la campaña *episodic-memory* del proyecto SimpleMemVLN, brazo **M1**, definido por una politica de memoria de 9 grupos recientes (R = 9) y sin banco episodico (B = 0). El entrenamiento parte de Qwen3.5-4B y consume el manifiesto conjunto R2R + RxR15 en ingles: 30.815 episodios y 3.128.624 pasos de datos. El sampler es un `EpisodeLengthSampler` con semilla 429, y el orden de episodios debe coincidir con `data/r2r_rxr15_train.jsonl`. Se emplea DeepSpeed ZeRO-2 con los *shards* del optimizador descargados en CPU (`configs/deepspeed_zero2_cpu_optimizer.json`), acumulacion de gradiente 4 y batch global 8 (`configs/profile_h2.yaml`).

El calendario es coseno de 7.704 actualizaciones, con 232 de *warmup*, ratio minimo 0,1 y LR 5e-6; el run se detuvo al final de la epoca 1 (actualizacion 3.852) mediante `--stop-after-epochs 1`. El material publicado contiene ademas la configuracion resuelta con SHA-256 `0d7b1e9c…40b3`, el codigo fuente inmutable (`source/SimpleMemVLN-a340e13.tar.gz`, equivalente al commit `a340e13` de la rama `c2_ablations`), los logs de Slurm y de perfilado por rango, y utilidades de reanudacion (`tools/rebase_manifest.py`, `tools/rebase_resume_contract.py`). El historial indica que el modelo solo se entreno en el cluster *newton*, en los trabajos 899055 (actualizaciones 1–2.975) y 916782 (2.976–3.142).

## Capacidades

- Navegacion vision-lenguaje: seguir instrucciones en lenguaje natural en entornos 3D a partir de observacion visual egocentrica (RGB) y producir acciones de navegacion. Es la tarea objetivo del entrenamiento (R2R + RxR15).
- Memoria episodica reciente: la variante M1 retiene 9 grupos recientes de contexto (R = 9) y no emplea banco episodico (B = 0), lo que define su comportamiento frente a otras ablaciones de la campana.
- Procesamiento de instrucciones en ingles: todo el manifiesto de entrenamiento esta en ingles (R2R y la particion inglesa de RxR15).
- Reanudacion exacta del entrenamiento: el paquete incluye estado del optimizador para 2 rangos, scheduler, `trainer_state.json` con posicion del sampler, `rng_state_0/1.pth`, `navigation.json` y `resume_contract.json`.
- Exportacion para servicio: el procedimiento de reanudacion genera un directorio `final/` descrito como *serving export*, aunque no se documentan en la informacion disponible las capacidades de inferencia resultantes.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Razonamiento multi-paso explicito o modo *thinking*: no disponible.
- Vision generalista, audio u otras modalidades: no disponible mas alla del uso de observacion visual propio de la tarea VLN.
- Multilingue: no disponible; el entrenamiento declarado es solo en ingles.

## Casos de uso

- Reanudacion de un entrenamiento interrumpido en otro cluster: el caso de uso principal y explicito del repositorio. Se descarga el paquete, se rebasa el manifiesto a la ruta local de imagenes y se relanza con `--resume_from_checkpoint auto` sobre 2 GPU H100, continuando desde la actualizacion 3.143 hasta la 3.852.
- Reproducibilidad de un resultado experimental: al incluir configuracion resuelta, semilla, orden de episodios, estado RNG y hashes SHA-256 de cada fichero, permite auditar o replicar el estado exacto del brazo M1 de la campana.
- Ablaciones controladas de memoria episodica: el brazo M1 (R = 9, B = 0) sirve como punto de comparacion frente a otras variantes de la misma campana, siempre que se mantengan las invariantes de configuracion.
- Desarrollo y depuracion de infraestructura de entrenamiento VLN: los logs de perfilado por microtiempo, exposicion y por rango hasta la actualizacion 3.142 permiten estudiar consumo de VRAM, tiempos por actualizacion y comportamiento del sampler a lo largo de una epoca.
- Validacion de herramientas de reubicacion de datos: `rebase_manifest.py` y `rebase_resume_contract.py` permiten verificar que un manifiesto con rutas absolutas se puede trasladar a otra raiz de datos sin alterar el contenido, con comprobacion de imagenes.
- Investigacion academica en navegacion vision-lenguaje: uso del checkpoint como inicializacion para estudios sobre politicas de memoria en R2R y RxR15, o como estado intermedio para analizar convergencia a lo largo del calendario coseno de 7.704 actualizaciones.
- Analisis de coste computacional de VLN a escala: las metricas registradas (aproximadamente 73 GiB reservados por GPU en el episodio mas largo, 262 GiB de *working set* en host, 22–26 s por actualizacion con 16 CPU) permiten dimensionar futuras ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en R2R, RxR15 ni de ninguna otra tarea, y tampoco compara con modelos alternativos. Se trata de un estado intermedio de entrenamiento (epoca 1 de un calendario que abarca mas actualizaciones), por lo que no cabe esperar cifras de evaluacion finales.

Nota sobre la busqueda web: los resultados recuperados no guardan relacion con este artefacto. En particular, la referencia a un modelo denominado «M1» en el articulo *A Survey on Efficient Architectures for Large Language Models* (arXiv:2508.09834) corresponde a un modelo de razonamiento hibrido distinto, no a este brazo de entrenamiento.

Metricas de eficiencia declaradas por el autor (no son benchmarks de calidad):

| Metrica | Valor |
|---|---|
| VRAM reservada maxima por GPU | ~73 GiB (episodio mas largo) |
| Memoria host, *working set* maximo | 262 GiB (puerta de arranque) |
| RAM recomendada para el host | >= 512 GB |
| Tiempo por actualizacion | ~22–26 s (2x H100, 16 CPU) |
| OOM observados | 0 |
| Actualizaciones restantes hasta el fin de la epoca 1 | ~710 (de 3.143 a 3.852) |

## Requisitos de hardware

- Entrenamiento/reanudacion: **exactamente 2 GPU H100 de 80 GB** (`--nproc_per_node=2`). La model card prohibe explicitamente reanudar con 4 GPU; el estado del optimizador esta particionado para 2 rangos.
- VRAM: pico reservado de aproximadamente 73 GiB por GPU en el episodio mas largo del run.
- RAM de host: al menos 512 GB, con un *working set* observado de 262 GiB en el arranque (el optimizador reside en CPU).
- CPU: 16 nucleos en la ejecucion registrada, con `OMP_NUM_THREADS=4`, `MKL_NUM_THREADS=4` y `OPENBLAS_NUM_THREADS=1`.
- Almacenamiento: el repositorio ocupa 141,7 GB; el procedimiento exige copias reales del checkpoint (el entrenador rechaza enlaces simbolicos) mas los logs.
- GPU de consumo: no disponible. No se documenta inferencia en GPU de consumo y el `final/` es un *export* para servicio sin especificaciones publicadas.
- Opciones de despliegue: el run usa `torchrun` de PyTorch con DeepSpeed ZeRO-2 y el modulo `qwen_vl.train.train_qwen`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Restricciones de entorno: modo offline (`HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`), `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` y necesidad de C++20 para TileLang.
- Latencia y throughput: no se publica throughput de inferencia; en entrenamiento, ~22–26 segundos por actualizacion.

## Comparativa con modelos similares

No disponible. Este artefacto no es un modelo final sino un checkpoint intermedio de un pipeline de investigacion, y no se han publicado comparativas con otros sistemas VLN (por ejemplo, politicas entrenadas sobre R2R/RxR15) dentro de la informacion proporcionada. Los unicos elementos comparables dentro del propio paquete son los estados de entrenamiento de la misma ejecucion:

| Artefacto | Descripcion | Estado |
|---|---|---|
| `checkpoint-3142/` | Estado completo en la actualizacion 3.142 (fin de epoca 1), 2 rangos | Recomendado para reanudar |
| `checkpoint-3000/` | Estado completo en la actualizacion 3.000 | Solo como respaldo, segun el autor |
| `checkpoint-3852/` | Estado completo previsto al final de la epoca 1 | Se genera al completar la reanudacion |
| `final/` | Export para servicio | Se genera al completar la reanudacion |
| Qwen3.5-4B (`851bf6e8…`) | Modelo base del que parte el entrenamiento | No es un comparable de tarea, sino el punto de partida |

## Limitaciones y advertencias

- Estado intermedio: no es un modelo final. Corresponde al final de la epoca 1 de un calendario de 7.704 actualizaciones, por lo que su calidad no debe asumirse equivalente a la de un modelo convergido.
- Sin evaluacion: no hay metricas de exito en R2R ni RxR15, ni analisis de errores, ni evaluacion de alucinacion. El riesgo de politicas de navegacion incorrectas no esta cuantificado.
- Licencia no declarada: el repositorio no especifica licencia. Sin terminos explicitos, no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Invariantes rigidas de reanudacion: el world size debe ser exactamente 2, la acumulacion 4, la semilla y el orden de episodios deben coincidir, y el manifiesto debe tener el hash esperado. Desviarse invalida el contrato de reanudacion.
- Dependencia de rutas absolutas: el manifiesto original apunta a `/groups/yshang/an221229/data/JanusVLN_data`; es obligatorio rebasarlo y verificar las imagenes antes de reanudar.
- Dificultad de instalacion: requiere el tarball de codigo exacto, C++20 para TileLang, 512 GB de RAM de host y 141,7 GB de descarga con verificacion SHA-256.
- Idiomas: el entrenamiento declarado es solo en ingles; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- Ambito restringido: la tarea es navegacion vision-lenguaje con observacion egocentrica. No se documentan capacidades de generacion de texto general, codigo, matematicas ni tool calling, por lo que no es adecuado como sustituto de un LLM de proposito general.
- Cifras no verificables de forma independiente: los datos de consumo de recursos y tiempos provienen unicamente de los registros del propio autor.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 *likes*, sin issues ni foro asociado; el soporte dependera del autor.
- Nota de contexto: en la busqueda web aparecen referencias a otros modelos llamados «M1» que no tienen relacion con este artefacto y no deben usarse para atribuirle capacidades.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/anhdao69/M1_training
- Repositorio de codigo: https://github.com/anhdao69/SimpleMemVLN (commit `a340e13`, rama `c2_ablations`)
- Notas y decisiones de entrenamiento: `reports/episodic_idea/09_ablation_runs.md`, en la rama `c2_ablations` del repositorio anterior
- Modelo base: Qwen3.5-4B, revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- Resultados de busqueda web: no se ha encontrado material relevante sobre este artefacto. El unico resultado que menciona un modelo «M1» (https://arxiv.org/html/2508.09834v1) se refiere a un modelo de razonamiento hibrido distinto y no debe asociarse a este checkpoint.
