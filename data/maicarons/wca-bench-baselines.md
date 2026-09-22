# Maicarons/WCA-Bench-baselines

## Resumen

WCA-Bench-baselines es un repositorio de resultados de referencia (baselines) publicado por el usuario Maicarons en HuggingFace, no un modelo de lenguaje ni un modelo con pesos entrenados. Contiene los resultados de 21 baselines organizados en 6 familias de métodos, evaluados sobre el export oficial de resultados de la World Cube Association (WCA Results Export, formato v2.0.2, fecha de export 2026-09-21). El objetivo es servir como linea base reproducible y como esqueleto de envio para el banco de pruebas WCA-Bench, orientado a prediccion tabular y de series temporales en el dominio del speedcubing.

El conjunto de datos completo sobre el que se define el benchmark incluye 6.909.454 resultados, 298.551 personas, 18.708 competiciones, 31.847.257 intentos y 3.186.380 scrambles, con un reparto train/validacion/test de 3.211.294 / 1.978.851 / 1.719.290 y una tasa global de DNF a nivel de intento del 3,18 %. El benchmark se desglosa en cinco tareas: prediccion de resultado (T1), prediccion de clasificacion (T2), prediccion de DNF (T3), estimacion del limite humano (T4) y transferencia de habilidad entre eventos (T5).

La relevancia actual del recurso es metodologica: los resultados publicados muestran que los baselines conscientes del dominio superan a modelos genericos de aprendizaje profundo y de grafos en este problema, y que la varianza de muestreo de la ventana de evaluacion puede reordenar contendientes cercanos, lo que justifica el reporte multi-semilla obligatorio. Los numeros publicados corresponden al modo `small` y son indicativos, no definitivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es un modelo unico, sino un conjunto de 21 baselines en 6 familias (arboles con boosting, kernel/estadisticos, simulacion KDE, modelos psicometricos, LSTM y GNN) |
| Parametros totales | no aplica (no se publican pesos ni recuento de parametros; el repositorio ocupa 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (tarea tabular y de series temporales, no modelado de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentacion e informes) |
| Licencia | wca-export-terms (campo `license: other`), enlace: https://www.worldcubeassociation.org/export/results |
| Formato de pesos | no aplica: el repositorio contiene informes en Markdown, CSV y JSON, mas una plantilla de envio; no incluye pesos en safetensors, GGUF ni ningun otro formato |
| Biblioteca declarada | sklearn |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-22 / 2026-09-22 |
| Tareas declaradas en la model card | `other` |

## Arquitectura y entrenamiento

No existe una arquitectura neuronal unica. El repositorio agrega los informes de 21 baselines que cubren 6 familias de metodos: arboles con boosting (`xgboost_log`, `xgboost_dnf`), metodos estadisticos y de kernel (`beta_binomial`, `spearman_correlation`, `kde_simulation`), simulaciones y heuristicas conscientes del dominio (`psych_sheet`, `plackett_luce`), procesos gaussianos con teoria de valores extremos (`gp_evt`) y dos modelos de aprendizaje profundo (una LSTM y una GNN). Los baselines puramente tabulares se ejecutan en CPU (`device: "cpu"`), mientras que la LSTM, la GNN y los baselines de boosting se ejecutan en CUDA e informan de `gpu_hours`.

Los datos de entrenamiento y evaluacion provienen del export oficial de la WCA ya citado. El pipeline decodifica, genera caracteristicas, divide el dataset y congela estadisticas por persona y evento (612.224 estadisticas congeladas). No se describe en la informacion disponible ningun proceso de RLHF, DPO ni ajuste por preferencias, lo cual es coherente con la naturaleza predictiva y tabular del benchmark. El protocolo de evaluacion es de ventana deslizante sobre una ventana de test muestreada; los resultados publicados usan el modo `small`, con semilla 42 en la ejecucion unica y semillas 42, 43 y 44 en la vista multi-semilla. El hardware registrado es una NVIDIA GeForce RTX 4060 Laptop GPU de 8 GB, CUDA 13.0 y torch 2.13.0+cu130.

## Capacidades

- Prediccion de resultado de intento (T1): estimacion del tiempo o marca esperada, con metrica principal MAE en escala logaritmica.
- Prediccion de clasificacion en competicion (T2): ordenacion de participantes, medida con tau de Kendall.
- Prediccion de DNF (T3): clasificacion binaria de intentos no validos, medida con AUC-PR.
- Estimacion del limite humano (T4): uso de procesos gaussianos combinados con teoria de valores extremos (`gp_evt`) y evaluacion mediante estabilidad leave-one-out.
- Transferencia de habilidad entre eventos (T5): identificacion de pares de eventos con correlacion, con 413 pares identificables y `spearman_correlation` como mejor baseline.
- Analisis estratificado: los informes incluyen desgloses por evento, por nivel de habilidad, por franja temporal y por continente, ademas de un subconjunto de casos dificiles (`hard_subset`).
- Analisis de significacion estadistica: cada informe incluye contraste pareado (`paired_t`), diferencia media, intervalo de confianza al 95 %, valor p y tamano del efecto (`cohens_d`).
- Registro de coste computacional: cada informe anota modo, tipo de baseline, dispositivo, tiempo de pared, horas de CPU y horas de GPU.
- Soporte de tool calling o function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no aplica; el material esta en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Linea base para investigacion en analitica de speedcubing: cualquier investigador que entrene un modelo nuevo sobre el export de la WCA puede comparar su metrica contra los 21 baselines ya publicados, evitando reimplementar metodos de referencia.
- Validacion de modelos genericos frente a heuristicas de dominio: los resultados de la suite permiten comprobar de forma empirica si una red neuronal o un modelo de grafos supera a heuristicas simples. En T1 la LSTM obtiene 0,9436 ± 0,0754 de MAE(log) frente a 0,1055 ± 0,0417 del boosting, y en T2 la GNN obtiene 0,7440 ± 0,1258 de tau frente a 0,8132 ± 0,0342 del baseline psicometrico.
- Diseno de protocolos de evaluacion robustos: la discrepancia en T3 entre la ejecucion unica (`xgboost_dnf`, 0,3731) y la media multi-semilla (`beta_binomial`, 0,2938 ± 0,0570 frente a 0,2779 ± 0,0724) sirve como caso de estudio sobre varianza de muestreo y justifica adoptar ventanas deslizantes y multiples semillas en proyectos propios.
- Prediccion de DNF para planificacion de rondas y formatos: un organizador o una federacion puede usar el baseline de T3 como estimador de la probabilidad de intento no valido por evento y nivel de habilidad, y aplicar los desgloses estratificados para dimensionar limites de tiempo y cortes de ronda.
- Estudio de transferencia de habilidad entre eventos: los 413 pares de eventos identificables de T5 permiten analizar que disciplinas comparten habilidad subyacente, con utilidad para el diseno de calendarios de competicion y para la deteccion de especializacion temprana.
- Estimacion de techos de rendimiento: `gp_evt` combina procesos gaussianos con teoria de valores extremos para modelar la cola de la distribucion de marcas, lo que permite estimar limites humanos por evento y comprobar la estabilidad de esa estimacion con leave-one-out.
- Ensenanza de machine learning con datos reales: los splits congelados, las estadisticas por persona y evento, los informes de significacion y la plantilla de envio configuran un ejercicio completo de comparacion de modelos con validacion estadistica.
- Integracion en CI sin acceso a los datos originales: el repositorio documenta una ruta offline con `scripts/generate_synthetic.py --small` seguida de `build_dataset.py --source synthetic` y `run_all_baselines.py --mode small`, lo que permite verificar el pipeline en un entorno de integracion continua sin descargar el export completo.
- Reproduccion en una sola maquina: el modo `small` esta disenado para completar la suite en un equipo con GPU de 8 GB o incluso en CPU, lo que facilita la replicacion de resultados por terceros.

## Benchmarks y rendimiento

Ejecucion unica con semilla 42, modo `small`. Los propios autores advierten de que las cifras son indicativas y no definitivas, y que el leaderboard publico debe reejecutarse sobre el dataset completo con el protocolo de ventana deslizante.

| Tarea | Mejor baseline | Metrica principal | n |
|---|---|---|---|
| T1 Prediccion de resultado | `xgboost_log` | MAE(log) ↓ 0,1639 | 2196 |
| T2 Prediccion de clasificacion | `kde_simulation` / `plackett_luce` / `psych_sheet` | Kendall tau ↑ 0,7673 | 2260 |
| T3 Prediccion de DNF | `xgboost_dnf` | AUC-PR ↑ 0,3731 | 2260 |
| T4 Estimacion del limite humano | `gp_evt` | estabilidad leave-one-out ↓ 0,9836 | no disponible |
| T5 Transferencia de habilidad | `spearman_correlation` | 413 pares de eventos identificables | 80000 |

| Tarea | Mejor baseline (media ± desviacion tipica, semillas 42/43/44) | Metrica |
|---|---|---|
| T1 | `xgboost_log` 0,1055 ± 0,0417 | MAE(log) ↓ |
| T2 | `psych_sheet` / `plackett_luce` / `kde_simulation` 0,8132 ± 0,0342 | Kendall tau ↑ |
| T3 | `beta_binomial` 0,2938 ± 0,0570 | AUC-PR ↑ |
| T4 | `gp_evt` 0,9836 ± 0,0000 | estabilidad leave-one-out ↓ |
| T5 | `spearman_correlation` 413 | pares identificables |

Comparaciones concretas reportadas por los autores:

| Comparacion | Modelo generico | Baseline de dominio | Diferencia |
|---|---|---|---|
| T1, MAE(log) ↓ | LSTM 0,9436 ± 0,0754 | boosting 0,1055 ± 0,0417 | el boosting reduce el error en un orden de magnitud |
| T2, Kendall tau ↑ | GNN 0,7440 ± 0,1258 | Psych Sheet 0,8132 ± 0,0342 | +0,0692 de tau para el baseline de dominio |
| T3, AUC-PR ↑ (multi-semilla) | `xgboost_dnf` 0,2779 ± 0,0724 | `beta_binomial` 0,2938 ± 0,0570 | diferencia dentro de la varianza de la ventana de evaluacion |

No se han publicado en la informacion disponible resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros), porque el recurso no es un modelo generativo.

## Requisitos de hardware

- No procede calcular VRAM de pesos: el repositorio no publica pesos ni un modelo entrenado que haya que servir, solo informes de resultados.
- Hardware realmente utilizado: NVIDIA GeForce RTX 4060 Laptop GPU con 8 GB de VRAM, CUDA 13.0 y torch 2.13.0+cu130, con los baselines de LSTM, GNN y boosting en `cuda` y el resto en CPU.
- El modo `small` esta explicitamente disenado para completar la suite en una sola maquina, con GPU de 8 GB o en CPU (`--device cpu`, valor por defecto).
- Seleccion de dispositivo: `--device cpu` para una ejecucion completamente reproducible en CPU, `--device auto` para activar CUDA cuando este disponible y `--device cuda` para forzarla.
- Opciones de despliegue: no aplica vLLM, TGI, llama.cpp ni Ollama. La ejecucion se realiza mediante scripts de linea de comandos: `scripts/download_data.py`, `scripts/build_dataset.py`, `scripts/run_all_baselines.py`, `scripts/build_leaderboard.py` y `scripts/run_multi_seed.py`.
- Entorno de ejecucion: entorno virtual de Python (`python -m venv .venv`) e instalacion con extras `pip install -e ".[dev,fast,boost]"` para el nucleo de baselines y `pip install -e ".[deep]"` para las variantes con torch.
- Latencia y throughput estimados: no disponible. Los informes individuales registran `wall_clock_sec`, `cpu_hours` y `gpu_hours` por baseline, pero en la informacion proporcionada no se incluyen los valores concretos.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada: la busqueda web realizada no devolvio ningun recurso relacionado (los resultados obtenidos corresponden a paginas sobre la provincia de Salerno y son irrelevantes para este benchmark), y no se facilitaron otros repositorios de baselines de la WCA. Por tanto, la comparativa se limita a los propios metodos de la suite, usando los datos publicados.

| Metodo | Familia | Metrica en T1 (MAE(log) ↓) | Metrica en T2 (Kendall tau ↑) | Coste |
|---|---|---|---|---|
| Boosting (`xgboost_log`) | arboles con boosting | 0,1055 ± 0,0417 (multi-semilla) | no disponible | informa `gpu_hours` |
| LSTM | red neuronal recurrente | 0,9436 ± 0,0754 (multi-semilla) | no disponible | informa `gpu_hours` |
| GNN | red neuronal de grafos | no disponible | 0,7440 ± 0,1258 (multi-semilla) | informa `gpu_hours` |
| Psych Sheet / Plackett-Luce / KDE | heuristicas y simulacion de dominio | no disponible | 0,8132 ± 0,0342 (multi-semilla) | CPU |
| `gp_evt` | proceso gaussiano + teoria de valores extremos | no disponible | no disponible (destaca en T4 con 0,9836 ± 0,0000) | CPU |
| `spearman_correlation` | estadistico | no disponible | no disponible (destaca en T5 con 413 pares) | CPU |

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generacion de texto, razonamiento, codigo, vision, tool calling y cualquier capacidad conversacional. Cualquier ficha que lo trate como tal es incorrecta.
- Los resultados publicados corresponden al modo `small`, con una ventana de test muestreada y un submuestreo representativo del split de entrenamiento. Los propios autores los califican de indicativos, no definitivos.
- La varianza de la ventana de evaluacion es suficientemente grande como para reordenar contendientes cercanos: en T3 la ejecucion unica favorece a `xgboost_dnf` (0,3731) y la media multi-semilla favorece a `beta_binomial` (0,2938 ± 0,0570 frente a 0,2779 ± 0,0724). No deben citarse cifras de una sola semilla como ranking estable.
- La licencia es `wca-export-terms` (campo `license: other`), vinculada a las condiciones de exportacion de resultados de la WCA. En la informacion proporcionada no se detallan las condiciones concretas de uso comercial; hay que consultar el enlace de licencia antes de reutilizar los datos o los resultados.
- Los datos subyacentes pertenecen a la WCA y describen a personas reales identificadas por estadisticas por persona; cualquier uso debe considerar las condiciones de exportacion y la proteccion de datos personales.
- No se publican pesos ni artefactos de modelo (tamano del repositorio 0,0 GB), por lo que no es posible desplegar los baselines sin reconstruirlos a partir del codigo y los datos originales.
- El repositorio registra 0 descargas y 0 likes, y no tiene pipeline declarado en HuggingFace: no hay evidencia de validacion por parte de terceros.
- La documentacion y los informes estan unicamente en ingles; no se declara soporte de otros idiomas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreinterpretar las cifras. En particular, T1 con semilla 42 reporta 0,1639 de MAE(log) mientras la media multi-semilla es 0,1055 ± 0,0417, lo que muestra que una lectura aislada de un unico informe puede inducir a error.
- La comparacion entre familias no es homogenea en coste: los baselines tabulares corren en CPU mientras que la LSTM, la GNN y el boosting requieren GPU, de modo que las diferencias de rendimiento deben leerse junto al coste registrado en cada informe.
- El benchmark depende de un artefacto externo versionado (WCA Results Export v2.0.2, export del 2026-09-21). Cambios posteriores en el export alteran los splits y las estadisticas congeladas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Maicarons/WCA-Bench-baselines
- Enlace de licencia declarado en la model card: https://www.worldcubeassociation.org/export/results
- Export oficial de resultados de la WCA (fuente de datos, formato v2.0.2): https://www.worldcubeassociation.org/export/results
- Archivos citados dentro del repositorio: `leaderboard.md`, `leaderboard.csv`, `leaderboard.json`, `multi_seed.md`, `<task>__<model>.json` (21 informes) y `submission_template/`
- Scripts citados: `scripts/download_data.py`, `scripts/build_dataset.py`, `scripts/run_all_baselines.py`, `scripts/build_leaderboard.py`, `scripts/run_multi_seed.py`, `scripts/generate_synthetic.py`
- Paper, blog o demo adicionales: no disponible. La busqueda web no devolvio ningun resultado relevante para este recurso.
