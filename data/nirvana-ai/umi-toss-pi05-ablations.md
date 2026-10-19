# Nirvana-AI/umi-toss-pi05-ablations

## Resumen

`Nirvana-AI/umi-toss-pi05-ablations` es un conjunto de cuatro checkpoints de la política robótica π₀.₅ (pi05) entrenados con *full supervised fine-tuning* sobre la tarea de lanzamiento (*tossing*) del dataset UMI. No es un modelo de lenguaje: es un bundle de inferencia para robótica (pipeline `robotics`, librería `openpi`) que empaqueta pesos, assets y manifiesto de exportación en el mismo formato que el checkpoint principal de π₀.₅. Lo publica la organización Nirvana-AI y su interés es metodológico: cada carpeta es un ablation step-matched que cambia únicamente los datos de entrenamiento o el esquema de muestreo, de modo que las diferencias de validación sean atribuibles a ese cambio.

Los cuatro brazos parten de un presupuesto idéntico de 10.000 pasos × batch 64 = 640.000 muestras, un tercio del entrenamiento principal. Las variantes son: referencia (todo el split de entrenamiento, muestreo uniforme), muestreo centrado en episodios de *release*, solo episodios de lanzamiento dinámico y solo episodios de tenis. Cada brazo se exportó en el paso 9999, el checkpoint seleccionado, con sus propias estadísticas de normalización en `assets/`.

Es relevante ahora porque hace públicas, con hashes verificables y trazabilidad de commit, las curvas de validación de un experimento de curación de datos en manipulación robótica, un tipo de ablation que rara vez se publica con pesos. La contrapartida es importante: son scores offline en *open loop* contra demostraciones humanas grabadas (preset `fast`, 7.166 anclas); ninguno de estos checkpoints se ha ejecutado en simulación ni en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (pi05), política visuomotor para robótica sobre `openpi`; detalles internos de la arquitectura no disponibles en la model card |
| Parametros totales | no disponible (la model card no los declara; los shards individuales van de 2,24 GB a 3,22 GB y cada brazo ocupa aproximadamente 12 GB) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en precisión de entrenamiento; no hay versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (`LICENSE_GEMMA.txt` incluido en el repo) |
| Formato de pesos | checkpoint JAX/Orbax en almacén OCDBT (`params/ocdbt.process_0/d/...`), más `assets/` y `export_manifest.json`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

π₀.₅ es la política de la familia pi05 integrada en `openpi`, cargable mediante `policies/pi05/adapter.py` (openpi en el commit `215abfb` más los parches del benchmark). Los cuatro brazos comparten exactamente el mismo modelo y las mismas transformaciones que el config principal `pi05_umi_tossing`; lo único que varía es el conjunto de datos de entrenamiento o el muestreo, y las estadísticas de normalización que cada bundle lleva en `assets/` (`umi_toss_v1`, `umi_toss_v1_dyn`, `umi_toss_v1_tennis`).

El entrenamiento es *full SFT* sobre demostraciones humanas capturadas con UMI (*Universal Manipulation Interface*), con 10.000 pasos y batch 64, es decir 640.000 muestras por brazo. No se documenta en la model card el número total de tokens, la composición completa del dataset ni si hubo etapas de RLHF o DPO; al tratarse de una política de imitación, el paradigma declarado es aprendizaje supervisado sobre demostraciones. La innovación técnica del release no está en el modelo sino en el protocolo: ablations step-matched de una sola semilla, con los params y las estadísticas de normalización byte-idénticos al checkpoint puntuado (son hard links de las exportaciones) y verificación SHA-256 de los 94 ficheros contra el Hub.

## Capacidades

- Predicción de acciones motoras para una tarea de lanzamiento (*tossing*) a partir de observaciones, en el formato de bundle de inferencia de `openpi`.
- Ejecución de cuatro variantes comparables del mismo modelo, lo que permite aislar el efecto de la estrategia de muestreo de datos.
- Dos especializaciones de dominio publicadas: lanzamiento dinámico (`pi05_abl10k_dyn_v1_best`) y tenis (`pi05_abl10k_ten_v1_best`), cada una con sus propias estadísticas de normalización.
- Evaluación offline reproducible mediante el preset de validación `fast` sobre 7.166 anclas de demostraciones humanas retenidas.
- Carga mediante el adaptador de openpi con `--config pi05_umi_tossing`, tomando las norm stats del propio bundle.
- No disponible: soporte de *tool calling* o *function calling*, capacidades de agente, multilingüismo, modo *thinking*, visión general o audio. La model card no documenta ninguna de estas funciones.

## Casos de uso

- Reproducción de ablations de curación de datos: cargar los cuatro brazos con el mismo config y comparar los composites de validación para estudiar cuánto aporta el muestreo centrado en *release* frente al uniforme (0,2149 frente a 0,2199 en el composite global).
- Estudio de especialización frente a generalización: los brazos `dyn` y `ten` permiten cuantificar el coste de entrenar solo con un subconjunto (el brazo de tenis cae a 1,3215 en el subconjunto dinámico y el dinámico a 0,7229 en el de tenis) con dos modelos que comparten arquitectura y presupuesto.
- Investigación sobre estadísticas de normalización: cada bundle incluye su propio `assets/<asset_id>`, lo que permite experimentar con el intercambio de norm stats sin reentrenar.
- Baseline para nuevas políticas de manipulación: los bundles sirven como referencia fija, con hashes públicos, frente a la que se compare un método nuevo en la tarea UMI tossing.
- Validación de pipelines de exportación e inferencia en `openpi`: comprobar que el adaptador carga correctamente bundles con manifiestos cuyos nombres de config (`pi05_abl10k_*`) solo existen tras `training.ablations.pi05_configs.register()` es un test de integración realista.
- Docencia y divulgación sobre metodología experimental en robótica: el conjunto ilustra con números concretos por qué una sola semilla y sin intervalo de confianza no establece un efecto.
- Auditoría de artefactos: `SHA256SUMS` y la verificación por SHA-256 (LFS) y git blob hash (ficheros pequeños) permiten validar la integridad de una descarga de casi 50 GB en entornos de laboratorio.

## Benchmarks y rendimiento

Los únicos datos publicados son los scores de validación offline (preset `fast`, 7.166 anclas, menor es mejor). No hay MMLU, HumanEval ni GSM8K, porque no es un modelo de lenguaje.

| Brazo | Cambio | Paso | Norm stats | Compuesto global | Dinámico | Tenis |
|---|---|---|---|---|---|---|
| `pi05_abl10k_ref_v1_best` | referencia: split completo, muestreo uniforme | 9999 | `umi_toss_v1` | 0,2199 | 0,2137 | 0,2628 |
| `pi05_abl10k_release_v1_best` | muestreo centrado en *release* | 9999 | `umi_toss_v1` | 0,2149 | 0,2091 | 0,2583 |
| `pi05_abl10k_dyn_v1_best` | solo episodios de lanzamiento dinámico | 9999 | `umi_toss_v1_dyn` | 0,3532 | 0,2084 | 1,3215 |
| `pi05_abl10k_ten_v1_best` | solo episodios de tenis | 9999 | `umi_toss_v1_tennis` | 0,6621 | 0,7229 | 0,2581 |

Cada brazo es una única ejecución con una sola semilla y sin intervalo de confianza; el propio informe del autor (apartado 7.1) indica que ninguna de estas diferencias queda establecida como efecto. Los scores son offline y en lazo abierto; no hay resultados en simulación ni en robot real.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de tamaño, el repo completo son 94 ficheros y 49,77 GB, es decir, aproximadamente 12 GB de checkpoint por brazo (shards de 2,24 GB a 3,22 GB), lo que implica una GPU con al menos 16-24 GB para cargar un brazo en precisión de entrenamiento; es una estimación a partir del tamaño de los ficheros, no un dato del autor.
- GPU recomendadas: no especificadas en la model card. Para una política de este tamaño, el entorno habitual de `openpi` son aceleradores con suficiente memoria para el checkpoint completo (A100/H100 en servidor, RTX 4090/A6000 en estación de trabajo); no confirmado por el autor.
- Cabe en GPU de consumo: no confirmado; depende de la memoria disponible frente a los ~12 GB por brazo más activaciones y *assets*.
- Despliegue: `openpi` (backend JAX) con `policies/pi05/adapter.py` en el commit `215abfb` más los parches del benchmark. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Configuración: el adaptador debe invocarse con `--config pi05_umi_tossing`; los nombres `pi05_abl10k_*` del `export_manifest.json` solo se registran tras `training.ablations.pi05_configs.register()` y, pasados directamente al adaptador, fallan con `Config ... not found`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa interna entre los cuatro brazos publicados (mismo modelo, mismo presupuesto de entrenamiento):

| Brazo | Datos | Paso | Compuesto global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05_abl10k_ref_v1_best` | split completo, uniforme | 9999 | 0,2199 | Gemma | pública |
| `pi05_abl10k_release_v1_best` | muestreo centrado en *release* | 9999 | 0,2149 | Gemma | pública |
| `pi05_abl10k_dyn_v1_best` | solo lanzamiento dinámico | 9999 | 0,3532 | Gemma | pública |
| `pi05_abl10k_ten_v1_best` | solo tenis | 9999 | 0,6621 | Gemma | pública |

Frente al checkpoint principal de π₀.₅ para UMI tossing: los brazos se entrenaron con un tercio de las muestras del run principal y se exportaron como artefactos de ablation, no como sustituto del checkpoint de referencia; no se publican en la model card los scores del run principal para comparar directamente. Frente a otras políticas robóticas de la literatura (por ejemplo, familias OpenVLA o π₀): no disponible, la información proporcionada no incluye datos comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El modelo se entrena solo con demostraciones humanas de UMI, por lo que hereda la distribución, el estilo de agarre y las condiciones de iluminación y material de esas grabaciones.
- Riesgo de alucinación: en el sentido de generar trayectorias plausibles pero incorrectas, no cuantificado. La validación es en lazo abierto contra demostraciones grabadas, no en ejecución cerrada.
- Sin evidencia de robustez real: los checkpoints no se han ejecutado en simulación ni en un robot físico; no hay datos de éxito en tarea real.
- Validez estadística limitada: una sola semilla por brazo y sin intervalo de confianza; el autor declara explícitamente que las diferencias no están establecidas como efecto.
- Restricciones de licencia: derivado de Gemma, sujeto a los Gemma Terms of Use (ai.google.dev/gemma/terms). Revisar las condiciones de uso comercial y de redistribución antes de integrarlo en un producto.
- Configuración frágil: los nombres de config del manifiesto no son válidos como `--config` del adaptador; requiere registrar los configs de ablation y usar los parches del benchmark sobre openpi `215abfb`.
- Trazabilidad parcial: el repositorio con código, configs, registros y el informe completo es privado; solo se enlaza el `REPORT.md` de un commit concreto.
- Documentación incompleta: no hay datos de arquitectura interna, parámetros, contexto, idiomas ni cuantizaciones; el tamaño del repo (49,77 GB) no debe interpretarse como tamaño del modelo.
- Ausencia de contexto externo: las búsquedas web no devolvieron información técnica relevante sobre este release (los resultados corresponden a una banda de rock homónima y a resultados de otra índole), por lo que todos los datos de esta ficha proceden exclusivamente de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/Nirvana-AI/umi-toss-pi05-ablations
- Informe del benchmark (`docs/REPORT.md`, commit `454f50306e2f`): https://github.com/nrvna-ai/umi-tossing-benchmark/blob/454f50306e2f072d012993338c1f0698b943cbf4/docs/REPORT.md
- Repositorio del benchmark (privado): https://github.com/nrvna-ai/umi-tossing-benchmark
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
