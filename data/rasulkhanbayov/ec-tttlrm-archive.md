# rasulkhanbayov/ec-tttlrm-archive

## Resumen

`ec-tttlrm-archive` es un archivo de investigación publicado por rasulkhanbayov que contiene el registro completo de un proyecto de fine-tuning sobre tttLRM-AR (la variante autorregresiva de tttLRM, un modelo de reconstrucción 3D presentado como Highlight en CVPR 2026). El trabajo introduce una actualización correctiva de errores sobre los pesos rápidos (*fast weights*) del modelo, orientada a flujos largos de observaciones de imagen. No es un modelo listo para usar en producción, sino un repositorio de artefactos científicos: checkpoints de todas las ejecuciones (incluidas las fallidas), código, logs de evaluación, resultados por escena en CSV, scripts SLURM y notas de decisión.

El modelo base, tttLRM, emplea una capa de Test-Time Training (TTT) que comprime múltiples observaciones de imagen en los pesos rápidos de dicha capa, formando una representación 3D implícita en el espacio latente. Esto permite reconstrucción 3D autorregresiva con contexto largo y complejidad computacional lineal. El archivo aquí descrito parte de los pesos públicos `dl3dv_ar.pt` y entrena en tres etapas (baja resolución, alta resolución y resolución nativa) sobre DL3DV-10K/DL3DV-140 y ScanNet++.

La relevancia del repositorio es metodológica: documenta de forma trazable (con hashes SHA-256 por fichero, linaje de checkpoints y criterios de éxito fijados antes de ver resultados) una comparación entre la regla EC propuesta y controles como fine-tuning emparejado, actualización solo direccional, consolidación elástica (regla FSM) y pérdida interna L2. El tamaño del repositorio es de 127,5 GB y los pesos están bajo licencia Adobe Research, restringida a investigación no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con capa de Test-Time Training (TTT) para reconstrucción 3D; pesos rápidos actualizados en test time |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (diseñado para flujos largos de observaciones de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión/reconstrucción 3D, no de texto) |
| Licencia | Adobe Research License (uso exclusivo de investigación no comercial) |
| Formato de pesos | PyTorch state dict (`final.pt`); no se distribuyen GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo parte de tttLRM-AR, un transformer autorregresivo en el que una capa TTT comprime secuencias de observaciones de imagen en sus pesos rápidos, generando una representación 3D implícita en el latente. La reconstrucción se realiza de forma autorregresiva con complejidad lineal respecto a la longitud del contexto, lo que permite procesar flujos de vistas más largos que los enfoques cuadráticos habituales. La contribución del proyecto es una regla de actualización correctiva de errores (EC) sobre esos pesos rápidos durante el fine-tuning, comparada contra una actualización solo direccional, la regla de consolidación elástica FSM, una pérdida interna L2 y una variante de paso simple / delta rule.

El entrenamiento se estructura en tres etapas: (1) partiendo de `dl3dv_ar.pt` se entrena a resolución baja (`r2/{ctl,ec05,l2}_s0_n256`, `r3/{ecdir,fsm}_s0_n256`); (2) se entrena a resolución alta (`r3/hr_*`); (3) se entrena a resolución nativa (`r3/nat_*`), que son los modelos evaluados en las tablas del paper. Los datos provienen de DL3DV-10K / DL3DV-140 y ScanNet++, que no se redistribuyen por sus términos de uso; el repositorio incluye listas de escenas, scripts de preparación y listados de ficheros con rutas y tamaños para verificar la reconstrucción exacta de los inputs. El entorno software está fijado en `provenance/env_fwf27.yml` y `pip_freeze_fwf27.txt`, y se documentan los commits exactos de los repositorios upstream (tttLRM, Long-LRM, herramientas DL3DV-10K, FSM, ReCoSplat).

## Capacidades

- Reconstrucción 3D de escenas a partir de múltiples observaciones de imagen, con salida de representación implícita en el latente.
- Síntesis de vistas noveles (*novel-view synthesis*) sobre las reconstrucciones generadas.
- Procesamiento de flujos largos de observaciones con coste lineal gracias a la capa TTT.
- Reconstrucción autorregresiva: el modelo puede ir incorporando vistas de forma incremental.
- Fine-tuning reproducible con linaje completo de checkpoints y argumentos de entrenamiento exactos (`args.json` por ejecución).
- Evaluación por escena con resultados exportados a CSV y generación automática de tablas del paper mediante `main_analyze.py` y `make_paper_tables.py`.
- No se documentan capacidades de texto, tool calling, agentes ni multilingüismo; es un modelo puramente visual/3D.

## Casos de uso

- Investigación en reconstrucción 3D con TTT: el archivo permite reproducir la comparación entre la regla EC y los controles (fine-tuning emparejado, actualización direccional, FSM, L2) usando los checkpoints `r3/nat_*` y el linaje documentado en `provenance/lineage.tsv`.
- Estudio de la dinámica de pesos rápidos: los checkpoints de ejecuciones fallidas (`r1`, `pilot`, `pilots`, `smoke`, `debug`) y las notas en `project/04_results/notes.md` permiten analizar qué reglas de actualización divergen y por qué.
- Replicación de experimentos con SLURM: los scripts numerados en `project/07_slurm_jobs/` con sus logs `.out`/`.err` permiten reconstruir la secuencia exacta de ejecución en un clúster.
- Auditoría de resultados científicos: `provenance/MANIFEST_sha256.tsv` y `provenance/data_listing/*.tsv.gz` permiten verificar la integridad de cada artefacto y comprobar que los inputs reconstruidos coinciden con los originales.
- Desarrollo de métodos de consolidación de memoria en modelos autorregresivos: la comparación EC vs FSM vs delta rule sirve como base para experimentos sobre olvido catastrófico en flujos largos.
- Docencia y formación en investigación reproducible: el repositorio ilustra un flujo completo desde la hipótesis y los criterios de éxito prefijados hasta las tablas generadas automáticamente desde los logs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras del paper se generan desde `project/04_results` mediante `main_analyze.py` y `make_paper_tables.py`, que escriben `project/01_paper/ec_results.tex` y `project/01_paper/tables/`, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio pesa 127,5 GB, pero incluye checkpoints de múltiples ejecuciones, código, logs y datos auxiliares, no un único modelo).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el flujo previsto es PyTorch con scripts SLURM (`project/07_slurm_jobs/NN_*.sh`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ec-tttlrm-archive (este) | Fine-tuning de tttLRM-AR con actualización EC de pesos rápidos | Flujos largos, coste lineal (sin cifra publicada) | Adobe Research (solo investigación no comercial) | Pesos en HF (127,5 GB) |
| tttLRM (base) | Reconstrucción 3D autorregresiva con capa TTT | Largo, coste lineal | Según repositorio original (no especificada aquí) | Pesos públicos `dl3dv_ar.pt` en su origen |
| Long-LRM | Reconstrucción 3D de contexto largo | No disponible | No disponible | Repositorio upstream referenciado |
| ReCoSplat | Reconstrucción/splatting (referenciado como upstream) | No disponible | No disponible | Repositorio upstream referenciado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia Adobe Research: uso exclusivo para investigación no comercial; los checkpoints son obras derivadas de tttLRM y heredan esa restricción.
- El repositorio no incluye los datos (DL3DV-10K/DL3DV-140, ScanNet++) ni los pesos originales de tttLRM; hay que obtenerlos de sus propietarios bajo sus términos, lo que complica la reproducción.
- Es un archivo de investigación, no un modelo empaquetado: contiene ejecuciones fallidas y variantes descartadas, por lo que no debe tratarse como un checkpoint único listo para desplegar.
- No hay información sobre sesgos, tasas de alucinación geométrica ni robustez fuera de las escenas evaluadas.
- No se documentan idiomas, cuantizaciones ni formatos de despliegue estándar (GGUF, ONNX), lo que limita su uso fuera de un entorno PyTorch de investigación.
- El tamaño de 127,5 GB y la dependencia de SLURM implican requisitos de infraestructura considerables para cualquier replicación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rasulkhanbayov/ec-tttlrm-archive
- Licencia Adobe Research: https://huggingface.co/rasulkhanbayov/ec-tttlrm-archive/blob/main/LICENSE_tttLRM_Adobe_Research.md
- Repositorio tttLRM (CVPR 2026 Highlight): https://github.com/cwchenwang/tttLRM
- Paper tttLRM: https://arxiv.org/abs/2602.20160
