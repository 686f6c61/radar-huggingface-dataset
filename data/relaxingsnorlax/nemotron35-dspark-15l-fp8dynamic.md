# RelaxingSnorlax/nemotron35-dspark-15l-fp8dynamic

## Resumen

`RelaxingSnorlax/nemotron35-dspark-15l-fp8dynamic` es un checkpoint borrador (drafter) para decodificacion especulativa del metodo DSpark, derivado del drafter de 5 capas `RelaxingSnorlax/nemotron35-dspark-5l-fp8dynamic`, que a su vez se empareja con el modelo objetivo `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`. No es un modelo entrenado: es un artefacto de control estructural creado para experimentos de conteo de capas. Cada una de sus 15 capas se ha generado copiando byte a byte los tensores de la capa `i % 5` del modelo fuente, y el `config` declara 15 capas repitiendo el patron de tipos de capa original.

El interes practico es acotado pero real: sirve como referencia para medir almacenamiento, tiempo de carga, huella de memoria y latencia en pilas de serving (vLLM con `--speculative_config.method dspark`) sin necesidad de entrenar un drafter de 15 capas de verdad. El autor advierte explicitamente de que las capas repetidas no representan un modelo de 15 capas entrenado, de que las metricas de calidad y aceptacion del modelo fuente no aplican y de que no se ha ejecutado ninguna evaluacion sobre esta variante.

Con 3.328.319.489 parametros totales (~3,33 mil millones) y 3,4 GB de repositorio en FP8_DYNAMIC, el checkpoint tiene un tamano desproporcionado para un drafter, lo que lo hace util precisamente para estudiar el coste marginal de anadir capas ficticias frente a capas reales. La licencia es openmdw-1.1 y la libreria declarada es `speculators`, con codigo personalizado en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark drafter (modelo borrador para decodificacion especulativa) asociado al objetivo Nemotron-3.5-Super-VL-120B-A12B; checkpoint de 15 capas generado por repeticion ciclica de las 5 capas del drafter fuente (la capa de salida `i` copia la capa fuente `i % 5`). Detalle interno de la arquitectura del drafter: no disponible |
| Parametros totales | 3.328.319.489 (~3,33 mil millones) |
| Parametros activos | no disponible (no se declara arquitectura MoE para este checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC (formato `compressed-tensors`); no se documentan otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | `safetensors` (`model.safetensors`), acompanado de `config` con `custom_code` y `derived_from.json`; requiere `--trust-remote-code` |

## Arquitectura y entrenamiento

El checkpoint no ha sido entrenado ni ajustado: es una construccion sintetica. El autor documenta la regla exacta de generacion en `derived_from.json`: para cada capa de salida `i` (de 0 a 14) se copian literalmente los tensores de la capa `i % 5` del drafter fuente en la revision `12d3c969b3eeaff3e5e18d7f1ab8cb8b642e9562`; los tensores que no pertenecen a capas (embeddings, cabezas, normalizaciones globales, etc.) se copian sin modificar. El `config` declara 15 capas y replica el patron de tipos de capa del modelo de 5 capas. Se incluye `drafter_checkpoint_sha256.txt` con el SHA-256 de `model.safetensors` para verificacion de integridad, y los registros originales de entrenamiento y cuantizacion del modelo fuente se conservan en `provenance/`, etiquetados como artefactos del origen.

La cuantizacion es FP8_DYNAMIC heredada del proceso aplicado al drafter de 5 capas, almacenada en el formato `compressed-tensors`. No hay informacion disponible sobre el volumen de tokens, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del drafter original dentro de la informacion proporcionada; la model card remite al repositorio fuente para esos datos. El unico contexto de entrenamiento documentado en la busqueda web corresponde a la familia objetivo Nemotron-3.5 (preentrenamiento de mas de 20 billones de tokens en el caso de Lightning-30B-A3B, arquitectura hibrida Mamba-2 + MoE), y no debe extrapolarse a este drafter.

## Capacidades

- Generacion especulativa de tokens como drafter: propone borradores de hasta 8 tokens (`num_speculative_tokens 8`) que el modelo objetivo verifica.
- Integracion con vLLM mediante `--speculative_config.method dspark` y `draft_sample_method greedy`.
- Carga y ejecucion como artefacto de control estructural: permite medir el efecto de 15 capas declaradas frente a las 5 reales.
- Verificabilidad de procedencia: `derived_from.json` y el SHA-256 del checkpoint permiten reproducir y auditar la construccion.
- No se le deben atribuir capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues: el propio autor indica que la calidad del modelo fuente no aplica a esta variante y que no se ha evaluado.
- Soporte de tool calling / function calling: no disponible (no evaluado, no aplicable a un drafter).
- Capacidades multimodales: no disponibles en este checkpoint, aunque el objetivo asociado (Nemotron-3.5-Super-VL) sea de vision-lenguaje.

## Casos de uso

- Benchmarking de memoria de la pila de serving: cargar este drafter en vLLM y medir VRAM residente frente al drafter de 5 capas, aislando el coste de las 10 capas ficticias adicionales sin variar el resto de la configuracion.
- Medicion de latencia y tiempo de carga por numero de capas: usar el checkpoint como punto de la curva (5 frente a 15 capas) en pruebas de `torch.load`/`safetensors` y de inicializacion del motor de inferencia.
- Pruebas de regresion en CI para `speculators` y vLLM: validar que las herramientas de carga aceptan `configs` con `custom_code`, `compressed-tensors` en FP8_DYNAMIC y conteos de capa no estandar antes de desplegar un drafter real.
- Validacion de pipelines de procedencia y derivacion de artefactos: comprobar que el tooling de `derived_from.json`, hashes SHA-256 y directorios `provenance/` se propaga correctamente en modelos derivados de modelos derivados.
- Experimentos de almacenamiento y distribucion: cuantificar el coste en GB de empaquetar capas duplicadas (3,4 GB de repositorio) para decidir estrategias de comparticion de tensores o deduplicacion en registros internos.
- Docencia y demostraciones de decodificacion especulativa: mostrar el flujo completo objetivo + drafter en un entorno controlado donde el resultado de aceptacion no importa, solo la mecanica del pipeline.
- Pruebas de tensor parallelism del drafter (`draft_tensor_parallel_size 1`) en escenarios multi-GPU donde el objetivo corre con `--tensor-parallel-size 4`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna evaluacion sobre esta variante y que las mediciones de calidad y tasa de aceptacion del modelo fuente no son aplicables. Tampoco se facilitan datos de latencia ni throughput medidos para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 3,4 GB y los pesos suman ~3,33 mil millones de parametros en FP8, por lo que el peso residente ronda los 3,3-3,5 GB; con activaciones y buffers de decodificacion conviene reservar entre 5 y 7 GB. Cifra orientativa, no validada por el autor.
- GPU recomendadas: cualquier GPU con soporte FP8 (familia Hopper o Blackwell: H100, H200, B200, GB10/DGX Spark, RTX 5090, RTX 6000 PRO). El comando de ejemplo del autor asume 4 GPU en paralelo de tensor para el modelo objetivo.
- Cabe en GPU de consumo: si, en principio cabe en GPUs de 12 GB o mas (RTX 4090, RTX 5090, RTX 6000 PRO) siempre que la GPU soporte FP8; en GPUs sin FP8 nativo (por ejemplo, Ada o Ampere en algunos backends) habria que verificar el soporte del kernel de cuantizacion.
- Opciones de despliegue: vLLM (ruta documentada, con `--speculative_config.method dspark` y `--speculative_config.model` apuntando a este repositorio), y por extension SGLang, que la busqueda web menciona para despliegues DSpark con el objetivo Lightning-30B-A3B. Requiere `--trust-remote-code` por el codigo personalizado.
- Latencia y throughput estimados: no disponibles. La compatibilidad de serving y el rendimiento de esta variante dummy no han sido validados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Capas | Cuantizacion | Licencia | Proposito |
|---|---|---|---|---|---|---|
| `RelaxingSnorlax/nemotron35-dspark-15l-fp8dynamic` (este) | 3.328.319.489 | no disponible | 15 (5 reales repetidas) | FP8_DYNAMIC | openmdw-1.1 | Control estructural para experimentos de conteo de capas |
| `RelaxingSnorlax/nemotron35-dspark-5l-fp8dynamic` | no disponible | no disponible | 5 | FP8_DYNAMIC | openmdw-1.1 | Drafter fuente, base de la derivacion |
| `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark` | no disponible (repo de 1,35 GB) | no disponible | no disponible | NVFP4 | openmdw-1.1 | Drafter DSpark oficial para el objetivo Lightning-30B-A3B |

La comparacion relevante no es de calidad, sino de funcion: los dos drafter de RelaxingSnorlax son artefactos de experimentacion, mientras que el DSpark de NVIDIA es el checkpoint destinado a produccion con el modelo objetivo. No se dispone de datos publicos de tasa de aceptacion ni de latencia para ninguno de los tres en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: las 15 capas son 5 capas reales repetidas tres veces; no debe esperarse ninguna capacidad de generacion ni de razonamiento utilizable.
- Las metricas de calidad y aceptacion del drafter fuente no aplican; el autor lo declara explicitamente y confirma que no hay evaluacion de esta variante.
- La compatibilidad y el rendimiento en serving no han sido validados: el comando de ejemplo replica la configuracion del modelo fuente y puede fallar o degradar el rendimiento en este checkpoint.
- Riesgo de alucinacion y sesgos: no evaluables para este artefacto; al no haber entrenamiento ni evaluacion, no hay informacion sobre sesgos conocidos.
- Requiere `--trust-remote-code` por el `custom_code` del repositorio, lo que implica ejecutar codigo del autor: conviene auditar los ficheros antes de cargarlo en entornos de produccion.
- Licencia openmdw-1.1: aunque permite uso amplio, las condiciones exactas de atribucion y redistribucion deben revisarse en el texto de la licencia antes de un uso comercial; el autor no aporta aclaraciones adicionales.
- No usar como sustituto del drafter real en produccion: cualquier estimacion de velocidad de decodificacion especulativa obtenida con este checkpoint sera pesimista e irrelevante, porque las capas duplicadas no aportan capacidad predictiva.
- Idiomas soportados y longitud de contexto no estan declarados, lo que impide planificar despliegues multilingues o de contexto largo a partir de este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-15l-fp8dynamic
- Drafter fuente de 5 capas: https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-5l-fp8dynamic
- Modelo objetivo: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Drafter DSpark oficial de NVIDIA para Lightning-30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark/tree/main
- Espejo del drafter oficial: https://huggingface.co/microperceptron/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Model card del objetivo Lightning-30B-A3B en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Receta de despliegue con SGLang y DSpark (MiaAI-Lab): https://github.com/MiaAI-Lab/Nemotron3.5-Lightning-DGX-Spark-RTX-5090-6000-PRO
- Receta de despliegue con vLLM en DGX Spark: https://github.com/sfxnz/Nemotron-3.5-Lightning-vLLM-DGX-Spark
- Referencia citada en los tags del drafter oficial (paper): arxiv:2607.05147
