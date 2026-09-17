# JMaxCool/bookend-KING-CXXVI-10kDPO-Recipe

## Resumen

`JMaxCool/bookend-KING-CXXVI-10kDPO-Recipe` es un paquete autocontenido de receta de entrenamiento publicado en Hugging Face, no un modelo con pesos listos para inferencia. Su objetivo declarado es reproducir el ajuste fino por DPO (Direct Preference Optimization) de la linea "bookend king CXXVI" sobre un modelo base denominado `KING` (por defecto, el checkpoint local `checkpoints/bookend-v125-step80`) y exportar los pesos fusionados en BF16, por ejemplo para publicarlos en `JMaxCool/bookend-KING-CXXVI-10kDPO-FINAL` o enviarlos mediante un flujo privado `albedo submit-private`. El tokenizer de referencia indicado en la receta es `assets/tokenizers/Qwen3.6-35B-A3B`, lo que vincula el pipeline a un modelo base con nomenclatura de tipo MoE, aunque el repositorio no incluye dichos pesos ni confirma la arquitectura final.

El corazon del bundle es un conjunto de 3277 pares de preferencia (fase 4 del "bookend pool", aproximadamente 294 MB una vez fusionados) mas los scripts necesarios para recomponerlos, validar el entorno y lanzar el entrenamiento. Los datos se distribuyen en fragmentos JSONL compatibles con GitHub (`DPO-pairs/part-*.jsonl`) acompanados de un manifiesto con recuentos de lineas y hashes SHA256 (`parts_manifest.json`). La receta fija hiperparametros concretos: 2 epocas, learning rate 5e-7, beta DPO 0.1, batch size 1 con acumulacion de gradiente 8, guardado cada 10 pasos y exportacion del merge LoRA en el paso global 80.

Su relevancia actual es doble. Por un lado, documenta un flujo completo y reproducible de alineacion con LoRA + DPO pensado para 8 GPU, con utilidades de preflight, evaluacion local mediante vLLM y generacion de duelos. Por otro, el repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y la busqueda web no ha devuelto ninguna fuente independiente que lo documente, por lo que debe tratarse como material experimental sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para este repositorio (es un bundle de entrenamiento). El base referenciado usa el tokenizer `Qwen3.6-35B-A3B`; la arquitectura concreta no se especifica |
| Parametros totales | No disponible (la nomenclatura del tokenizer sugiere 35B, dato no confirmado en la informacion) |
| Parametros activos | No disponible (el sufijo "A3B" sugiere activacion tipo MoE en torno a 3B, dato no confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles. La receta exporta el merge de LoRA en BF16; no se documentan cuantizaciones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | BF16 (merge de LoRA). El repositorio no contiene pesos: incluye JSONL, manifiesto JSON, scripts Python y shell. El formato de fichero del export no se especifica |
| Tipo de artefacto | Receta de entrenamiento (pipeline DPO + utilidades de exportacion) |
| Tamano del repositorio | 0.6 GB |
| Dataset incluido | 3277 pares de preferencia (fase 4 del bookend pool), ~294 MB fusionados |
| Modelo base por defecto | `checkpoints/bookend-v125-step80` (export bookend v125) |
| Tokenizer de referencia | `assets/tokenizers/Qwen3.6-35B-A3B` |
| Hardware de entrenamiento por defecto | 8 GPU (`NUM_GPUS=8`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La receta describe un ajuste fino con LoRA sobre un checkpoint base ya existente (`KING`), seguido de una fusion de adaptadores para producir pesos BF16 completos. No se detalla ni la arquitectura del transformer subyacente ni el numero de parametros efectivos, mas alla de la pista que aporta el nombre del tokenizer (`Qwen3.6-35B-A3B`). El metodo de alineacion es DPO, con los pares de preferencia almacenados en formato JSONL y divididos en fragmentos con un limite de 92 MB por parte, pensado para poder versionarlos en GitHub. El pipeline contempla regenerar los pares desde `scripts/train/extract_bookend_dpo_pairs.sh` y volver a dividirlos con `scripts/train/split_train_pairs.py`, de modo que el pool de datos puede ampliarse o sustituirse sin tocar el codigo de entrenamiento.

Los hiperparametros estan fijados en el propio script y se pueden consultar con `show-recipe`:

| Variable | Valor por defecto |
|---|---|
| `EPOCHS` | 2 |
| `LR` | 5e-7 |
| `BETA` (DPO) | 0.1 |
| `BATCH_SIZE` | 1 |
| `GRAD_ACCUM` | 8 |
| `SAVE_STEPS` | 10 |
| `TARGET_STEP` | 80 |
| `NUM_GPUS` | 8 |
| `OUT_DIR` | `checkpoints/bookend_king_cxxvi_lora` |
| `MERGED_DIR` | `checkpoints/bookend-king-cxxvi-step80` |

El flujo de trabajo se divide en tres comandos (`check-setup`, `train`, `export`) mas un script de preparacion (`prepare_bookend_king_cxxvi.sh`) que une los fragmentos y ejecuta el preflight. La exportacion puede relanzarse de forma independiente si los checkpoints LoRA ya estan en disco. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni tecnicas de RL distintas de DPO.

## Capacidades

El repositorio no documenta capacidades del modelo final; lo que se detalla son las capacidades del propio pipeline:

- Alineacion por preferencias: ejecucion de DPO con LoRA sobre un checkpoint base, con beta 0.1 y 2 epocas sobre 3277 pares.
- Fusion y exportacion de adaptadores: genera pesos BF16 completos listos para publicar o servir.
- Validacion previa del entorno: el comando `check-setup` verifica rey, pares y dependencias antes de lanzar el entrenamiento.
- Gestion de datos de preferencia: union de fragmentos con `join_dpo_pairs.py`, verificacion por SHA256 mediante `parts_manifest.json` y re-division controlada por tamano maximo.
- Servicio de inferencia: la receta incluye un ejemplo funcional con `vllm serve` sobre el directorio fusionado, con el tokenizer indicado y puerto 8000.
- Evaluacion comparativa local: `scripts/local_eval/run_duel.py` permite enfrentar el candidato contra otro modelo en modo duelo con `--n-samples`, y `scripts/local_eval/preflight_gate.py` actua como puerta previa a un envio privado.
- Flujo de publicacion: ejemplo de subida con `huggingface-cli upload` hacia `JMaxCool/bookend-KING-CXXVI-10kDPO-FINAL`.
- Soporte de tool calling, agentes, vision, audio, modo thinking y capacidades multilingues: no disponible.

## Casos de uso

- Reproduccion de experimentos de alineacion: un equipo puede clonar el bundle, ejecutar `join_dpo_pairs.py` y lanzar el entrenamiento con los hiperparametros fijados para obtener un resultado comparable al publicado, sin tener que redefinir el pipeline de DPO.
- Ajuste fino de alineacion en cluster de 8 GPU: la configuracion por defecto (batch 1, acumulacion 8, 2 epocas) encaja en un nodo de 8 aceleradores con paralelismo de datos, lo que permite reutilizar la receta tal cual en infraestructura existente.
- Generacion de pesos fusionados para despliegue: el comando `export` produce un directorio BF16 que se sirve directamente con vLLM, evitando cargar adaptadores LoRA por separado en produccion.
- Evaluacion por duelos antes de publicar: `run_duel.py` con 20 muestras permite comparar el candidato contra una referencia y decidir si merece la pena promoverlo, reduciendo el riesgo de subir un checkpoint peor que el actual.
- Investigacion sobre datos de preferencia: los scripts de extraccion, ranking de fallos (`collect_king_failures.py`, `rank_failures.py`) y division permiten construir pools de pares nuevos y medir el efecto de ampliar el dataset mas alla de los 3277 pares de la fase 4.
- Participacion en un flujo de rey encadenado: la receta menciona continuar desde "the current on-chain king path", de modo que un participante puede tomar los pesos reinantes, aplicar DPO y presentar el resultado como candidato con la puerta `preflight_gate.py`.
- Versionado de datos en repositorios limitados: los fragmentos de menos de 92 MB y el manifiesto con SHA256 hacen viable mantener el dataset de preferencias dentro de un repositorio Git convencional, algo util para equipos con restricciones de almacenamiento.
- Integracion en CI de investigacion: el par `prepare_*.sh` + `join_dpo_pairs.py` se puede invocar desde un job automatizado para verificar que los pares siguen siendo reconstruibles e integros antes de cada ejecucion de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un script de evaluacion por duelos (`scripts/local_eval/run_duel.py`) y una puerta de preflight, pero no adjunta puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- Entrenamiento: la receta asume 8 GPU por defecto (`NUM_GPUS=8`). No se especifica el modelo de GPU, la VRAM por dispositivo ni si el entrenamiento cabe en configuraciones menores.
- VRAM estimada de inferencia: no disponible.
- GPU recomendadas: no disponible. No se mencionan A100, H100, RTX 4090 ni equivalentes en la documentacion.
- Compatibilidad con GPU de consumo: no disponible.
- Espacio en disco: 0.6 GB para el repositorio, mas aproximadamente 294 MB del JSONL fusionado, mas los checkpoints LoRA, el merge BF16 y los pesos del modelo base descargados aparte.
- Opciones de despliegue: se documenta explicitamente vLLM (`vllm serve <dir> --tokenizer assets/tokenizers/Qwen3.6-35B-A3B --port 8000`). No se mencionan llama.cpp, Ollama, TGI ni otros servidores.
- Latencia y throughput: no disponible. Tan solo se conoce el parametro `--n-samples 20` del script de duelos, que no equivale a una medida de rendimiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, ni datos de parametros, contexto o rendimiento de alternativas. La busqueda web realizada no devolvio ninguna fuente relevante sobre este repositorio ni sobre recetas equivalentes.

## Limitaciones y advertencias

- No es un modelo desplegable: el repositorio contiene datos y scripts, no pesos. Cualquiera que espere cargarlo directamente con `from_pretrained` se encontrara con un bundle de entrenamiento.
- Licencia no declarada: al no especificarse licencia, el uso comercial, la redistribucion y la creacion de obras derivadas quedan en un limbo legal. Es imprescindible contactar con el autor antes de cualquier uso productivo.
- Modelo base ausente: la receta apunta a `checkpoints/bookend-v125-step80` o a una ruta local del rey vigente, que el usuario debe obtener por su cuenta. Sin esos pesos, los scripts no pueden ejecutarse.
- Dataset reducido y de una sola fase: 3277 pares de la fase 4 configuran un conjunto de preferencias pequeno, sin documentacion publica sobre su composicion, dominios, idiomas ni criterios de anotacion, lo que abre la puerta a sesgos desconocidos y a un ajuste excesivamente especializado.
- Sin validacion externa: 0 descargas y 0 likes, sin resultados de benchmarks ni evaluaciones de terceros. No hay evidencia independiente de que el resultado mejore al modelo de partida.
- Referencias a un flujo opaco: terminos como "on-chain king", "albedo submit-private" o "reigning weights" describen un proceso de competicion que no se explica en el repositorio, lo que dificulta auditar que se esta optimizando realmente.
- Nomenclatura de base poco estandar: el identificador `Qwen3.6-35B-A3B` no corresponde a una denominacion publica habitual, por lo que no se puede confirmar que arquitectura, tokenizer o licencia hereda el modelo final.
- Riesgo de alucinacion y sesgos: no disponible. No se aporta ninguna evaluacion de seguridad, filtrado de datos ni analisis de toxicidad.
- Idiomas: no disponible, por lo que no se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Anomalia temporal: las fechas de creacion y actualizacion (2026-09-17) son posteriores a la fecha habitual de consulta, lo que conviene verificar antes de dar por buena la cronologia del artefacto.
- Dependencias externas: el flujo asume una instalacion `pip install -e '.[train]'`, un fichero `.env` con credenciales y un arbol de directorios concreto (monorepo), lo que limita la portabilidad del bundle fuera de ese entorno.
- Tokens y credenciales: la receta insiste en no commitear tokens, pero depende de variables de entorno para la subida a Hugging Face; un manejo descuidado expone credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JMaxCool/bookend-KING-CXXVI-10kDPO-Recipe
- Repositorio de destino mencionado para los pesos fusionados: https://huggingface.co/JMaxCool/bookend-KING-CXXVI-10kDPO-FINAL
- Documentacion de formato de pares y pipeline de extraccion (ruta relativa dentro del monorepo): `docs/training/BOOKEND_DPO_TRAINING.md`
- Receta previa con los mismos hiperparametros (ruta relativa): `checkpoints/bookend-v125-step80/README.md`
- Scripts de recoleccion y ranking de fallos (rutas relativas): `scripts/collect_king_failures.py`, `scripts/rank_failures.py`
- Resultados de la busqueda web: no se encontro ningun enlace relevante. Las unicas entradas devueltas corresponden a paginas genericas de YouTube (https://www.youtube.com/, https://music.youtube.com/), sin relacion con el modelo ni con la receta.
